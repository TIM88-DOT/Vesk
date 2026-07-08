# Vesk SMS intent classifier — eval harness

An offline test set that measures **how the Vesk inbound-SMS intent classifier fails**, not just
how often it succeeds. It runs against the same prompt the production agent uses and scores every
result the way production would *act* on it.

> Runs with just an API key (OpenAI **or** Azure OpenAI) — no database, no running Vesk stack.

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

## One thing that broke — and how I proved the fix holds

**A polite "D'accord" or "Parfait merci" would auto-confirm an appointment the customer never
confirmed** — unless one specific rule keeps the model honest.

After a booking notification, customers reply "👍", "D'accord", "Merci", "no problem". Those are
acknowledgments — the person isn't confirming attendance, just being polite. But `Confirm` is the
statistically obvious label, and **high confidence is exactly what triggers the auto-action path**,
so the model can silently confirm an appointment nobody confirmed.

The current prompt handles this — on Azure `gpt-4o-mini` the classifier gets 39/40 with **0 dangerous
fails** ([`results.md`](./results.md)); the one miss is a typo (`cofnirm`) it correctly escalates.
That's not luck: it's one paragraph in the prompt, the *acknowledgment-vs-confirmation rule* (the
`IMPORTANT — Distinguish acknowledgment from confirmation` block in
[`ReplyHandlingAgent.cs`](../src/Vesk.Infrastructure/Agents/ReplyHandlingAgent.cs)).

To prove that rule is load-bearing and not decoration, the eval has an **ablation mode**
(`node run-evals.mjs --no-ack-rule`) that strips *just* that paragraph and re-runs the same 40 cases:

| Prompt | Accuracy | **Dangerous fails** |
|---|---|---|
| Full (guardrail in place) — [`results.md`](./results.md) | 39/40 | **0** |
| Ablation (rule removed) — [`results.ablation.md`](./results.ablation.md) | 35/40 | **2** |

The two that flip straight to confident auto-confirms:

| Message | With the rule | Without it |
|---|---|---|
| `D'accord` | Other ✓ | **Confirm @0.90 → Auto-confirm** |
| `Parfait merci` | Other ✓ | **Confirm @0.85 → Auto-confirm** |

(`👍` and `no problem` also flip to `Confirm`, but at 0.75–0.80 — wrong, yet caught below the 0.85
auto-act line.)

That's the real lesson. The dangerous failure isn't "the model is wrong" — models are sometimes
wrong. It's **"the model is wrong *and* confident,"** because that's the only combination that reaches
an irreversible action. Two things defend against it, and this eval measures both: a deterministic
prompt rule that removes the trap, and the confidence gate that catches whatever slips through. Run
the eval after any prompt change and the dangerous-fail count tells you immediately if you broke it.

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
cp .env.example .env        # then add your key(s) in .env
npm run eval                # or: node run-evals.mjs
```

Works with **either provider** — set one in `.env`:

- **OpenAI:** `OPENAI_API_KEY` (+ optional `OPENAI_MODEL`, default `gpt-4o-mini`).
- **Azure AI Foundry / Azure OpenAI:** `AZURE_OPENAI_ENDPOINT` + `AZURE_OPENAI_API_KEY` +
  `AZURE_OPENAI_DEPLOYMENT` (+ optional `AZURE_OPENAI_API_VERSION`). This is the same provider Vesk
  uses in production (`AzureOpenAIClient`); if both are set, Azure wins.

To run the ablation described above (strips the acknowledgment rule → writes `results.ablation.md`):

```bash
node run-evals.mjs --no-ack-rule
```

Node 18+ (uses built-in `fetch`, no dependencies to install). Output goes to the console and to the
results file.

Without a provider configured, the script prints setup instructions and exits cleanly. The committed
`results.md` / `results.ablation.md` are **real runs** against Azure `gpt-4o-mini`, so you can read the
numbers without running anything; they'll vary slightly by model and run.

## Files

| File | Purpose |
|---|---|
| `cases.jsonl` | 40 labelled test messages (FR/EN, clear + trap + adversarial) |
| `classifier.mjs` | Standalone classifier: prompt derived from `ReplyHandlingAgent`, `classify_intent` schema copied from `ClassifyIntentTool`; also exports the ablation prompt |
| `run-evals.mjs` | Runner + confidence-weighted scoring; `--no-ack-rule` for the ablation |
| `results.md` | Baseline run — full prompt (39/40, 0 dangerous) |
| `results.ablation.md` | Ablation run — acknowledgment rule removed (35/40, 2 dangerous) |
