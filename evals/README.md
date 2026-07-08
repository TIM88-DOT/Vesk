# Vesk SMS intent classifier — eval harness

An offline test set that measures **how the Vesk inbound-SMS intent classifier fails**, not just
how often it succeeds. It runs against the same prompt the production agent uses and scores every
result the way production would *act* on it.

> Runs with only an `OPENAI_API_KEY` — no database, no Azure, no running Vesk stack.

---

## What the workflow does

Vesk is an appointment-communication platform for small businesses. When a reminder SMS goes out
and the customer texts back ("Oui", "can we move it?", "👍"), an LLM agent
([`ReplyHandlingAgent`](../src/Vesk.Infrastructure/Agents/ReplyHandlingAgent.cs)) classifies the
reply into one of five intents — **Confirm / Cancel / Reschedule / Question / Other** — with a
**confidence score**. Deterministic C# then decides what to do with that classification:

| Model output | What production does | Where it's enforced |
|---|---|---|
| actionable intent (Confirm/Cancel/Reschedule) **& confidence ≥ 0.85** | **auto-acts** — confirms/cancels the appointment or texts a reschedule link | `ReplyHandlingAgent` |
| any intent **& confidence < 0.75** | **escalates** to staff, no automatic action | `ReplyHandlingAgent` |
| 0.75–0.84, or Question/Other | logged for review, no automatic action | `ReplyHandlingAgent` |

The confidence threshold is the safety valve: it's what stops a fuzzy guess from silently
confirming or cancelling a real appointment. **This harness measures whether that valve holds.**

## Who uses it

Me — as the regression net around the LLM boundary. Before I touch the classifier prompt or move
the 0.85 / 0.75 thresholds, I run this to see whether accuracy went up **and**, more importantly,
whether the number of *dangerous* failures went up. Prompt changes that help the happy path often
quietly make the confident-wrong cases worse; a single accuracy number hides that. This surfaces it.

## One thing that broke

**The classifier confidently mislabels casual acknowledgments as confirmations.**

After a booking notification, customers often reply "👍", "D'accord", "Merci", "Nice". Those are
acknowledgments — the person is *not* confirming attendance, they're just being polite. But
`Confirm` is the statistically obvious label, so the model returns `Confirm` with **high
confidence**. And high confidence is exactly the trigger for the auto-action path — so the system
would silently mark an appointment as confirmed that the customer never confirmed.

From the sample run ([`results.md`](./results.md)):

| Message | Expected | Got | Conf | Action production would take | Verdict |
|---|---|---|---|---|---|
| `👍` | Other | Confirm | 0.86 | **Auto-confirm** | DANGEROUS |
| `D'accord` | Other | Confirm | 0.87 | **Auto-confirm** | DANGEROUS |
| `👌` | Other | Confirm | 0.70 | Escalate to staff | safe fail |

The interesting part is the third row. `👌` is the *same class of mistake* — wrong intent — but the
model was only 0.70 confident, so the **< 0.75 escalation gate caught it** and handed it to a human.
Same error, completely different blast radius.

That reframed the bug for me. The dangerous failure isn't "the model is wrong" — models are
sometimes wrong. The dangerous failure is **"the model is wrong *and* confident,"** because that's
the only combination that reaches an irreversible action. So the fix wasn't only prompt-tuning; it
was making the eval score *confidence-weighted* and adding the explicit
acknowledgment-vs-confirmation rule to the prompt (see the `IMPORTANT — Distinguish acknowledgment
from confirmation` block in [`ReplyHandlingAgent.cs`](../src/Vesk.Infrastructure/Agents/ReplyHandlingAgent.cs)),
which exists *because* this eval kept flagging these rows.

---

## How scoring works

Every case is scored two ways at once — was the intent right, and what would production *do*:

- **PASS** — predicted intent is the expected one (or a listed acceptable alternate for genuinely
  ambiguous messages).
- **DANGEROUS** — wrong intent, on an actionable label, at confidence ≥ 0.85. Production would
  auto-act on a mistake. **This is the number to drive to zero.**
- **SAFE-FAIL** — wrong intent, but confidence < 0.75, so the escalation gate catches it. A human
  reviews it. Undesirable but not harmful.
- **FAIL** — wrong, but Question/Other or mid-confidence, so it's only logged (no auto-action).

The dataset ([`cases.jsonl`](./cases.jsonl), 40 cases) is deliberately weighted toward the hard part:
~18 clear baseline cases across all five intents in **both French and English** (Canada is bilingual),
and ~22 traps — acknowledgment lookalikes (`👍`, `Merci`, `no problem`), non-committal replies
(`maybe`, `peut-être`, `hmm`), double intents (`Cancel and rebook next week`), a mixed-language
mixed-intent message (`Oui but what time?`), and a typo (`cofnirm`).

### A systems note the eval intentionally does *not* test

`STOP / START / OUI / YES` and their French equivalents never reach the classifier — they're caught
by deterministic keyword gates in
[`MessagingService.cs`](../src/Vesk.Infrastructure/Messaging/MessagingService.cs) *before* any LLM
call, because opt-out is a legal (Twilio/CASL) requirement that must not depend on a probabilistic
model. So "Oui" on its own is handled as an opt-in keyword, not classified. The LLM only ever sees
the genuinely ambiguous middle. Keeping the deterministic gates out of the LLM's path is a
deliberate design choice, and the eval respects that boundary.

---

## Run it

```bash
cd evals
cp .env.example .env        # then put your OPENAI_API_KEY in .env
npm run eval                # or: node run-evals.mjs
```

Node 18+ (uses built-in `fetch`, no dependencies to install). Output goes to the console and is
written to [`results.md`](./results.md).

Without a key, the script prints setup instructions and exits cleanly — the committed `results.md`
is an **illustrative sample** so you can read the format without running anything. Live numbers vary
by model and run; set `OPENAI_MODEL` in `.env` to try a different model.

## Files

| File | Purpose |
|---|---|
| `cases.jsonl` | 40 labelled test messages (FR/EN, clear + trap + adversarial) |
| `classifier.mjs` | Standalone classifier: prompt derived from `ReplyHandlingAgent`, `classify_intent` schema copied from `ClassifyIntentTool` |
| `run-evals.mjs` | Runner + confidence-weighted scoring; writes `results.md` |
| `results.md` | Failure table + summary (regenerated on each run) |
