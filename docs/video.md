# Video walkthrough — script & setup

A 3–5 minute application video for the AI-automation role. It answers their three required questions
out loud — **what the workflow does, who uses it, one thing that broke** — while the screen shows the
four things they screen for: a shipped automation, curiosity about how LLMs fail, systems thinking,
and comfort learning a new tool fast.

Target length **4:00–4:30**. One take is fine — a slightly rough real take beats a polished fake one
for a "builders, not theorists" team.

---

## Part 1 — Setup before you hit record

**Do once (~5 min):**

1. **Bump terminal font** to ~18–20pt and clear the scrollback. Tiny text on camera kills it.
2. **Pre-generate the baseline** so the "0 dangerous" number is already on disk:
   ```bash
   cd "C:/Users/Super/OneDrive/Bureau/FlowPilot AI/evals"
   node run-evals.mjs          # writes results.md (39/40, 0 dangerous)
   ```
3. **Start n8n**, import the workflow, wire the Azure credential (Header Auth, `Name = api-key`),
   and flip it **Active**:
   ```bash
   cd "C:/Users/Super/OneDrive/Bureau/FlowPilot AI/n8n"
   docker compose -f docker-compose.n8n.yml up -d      # http://localhost:5678
   ```
4. **Queue the curl commands** in terminal history (press Up-arrow to reveal them live):
   ```bash
   curl -X POST 'http://localhost:5678/webhook/vesk-inbound-sms' --data-urlencode 'MessageSid=SM1' --data-urlencode 'From=+15551234567' --data-urlencode 'To=+15559876543' --data-urlencode 'Body=Oui je serai la'
   curl -X POST 'http://localhost:5678/webhook/vesk-inbound-sms' --data-urlencode 'MessageSid=SM1' --data-urlencode 'From=+15551234567' --data-urlencode 'To=+15559876543' --data-urlencode 'Body=D accord'
   ```
   Reuse `MessageSid=SM1` on the second call to show the dedup branch short-circuit it.

**Tabs to have open, in the order you'll show them:**

1. Vesk dashboard (or a screenshot of it + an SMS thread)
2. Terminal in `evals/` (baseline already run)
3. `evals/results.md` and `evals/results.ablation.md` side by side
4. n8n canvas (workflow Active)
5. `n8n/README.md` scrolled to the comparison table

**Loom:** screen + small cam bubble, mic checked.

**Before anything goes public:** rotate the Azure OpenAI key — the ablation demo uses it live.

---

## Part 2 — The script (~4:15)

Say = their literal ask. Show = what you screen-share.

| Time | Screen | What you say |
|---|---|---|
| **0:00–0:20** — Hook + *what / who* | Dashboard / SMS thread | "This is Vesk, a system I built that texts appointment reminders and then **reads the customer's reply and acts on it** — confirms, cancels, or reschedules, with no human in the loop. It's used by small-business owners — a salon, a clinic — who'd otherwise thumb-type replies all day." |
| **0:20–1:00** — Shipped automation, live | Send `Oui je serai la`, show it auto-confirm | "Here's the pipeline: webhook, then dedup, then a legal opt-out gate in **code, not the model**, then the LLM classifies the reply into an intent with a confidence score — and it only auto-acts when it's confident. The AI decides *what they meant*; deterministic code decides *what's safe to do*." |
| **1:00–2:30** — *How it fails + what broke* (the centerpiece) | Terminal + the two results files | "Their posting asks how your agent breaks, so let me show you with data. My **eval set is 40 real messages, French and English.** With the full prompt it scores 39 out of 40, and — the number I care about — **zero dangerous failures**: zero cases where it was wrong *and* confident enough to auto-act. [show `results.md`] Now watch what one line of prompt is worth. I strip out the rule that separates a *confirmation* from a polite *acknowledgment*, and re-run. [run `node run-evals.mjs --no-ack-rule`, open `results.ablation.md`] Now a customer replying **'D'accord'** — just 'okay, thanks' — gets classified as **Confirm at 0.90**, and the system **auto-confirms an appointment they never confirmed**. Same with 'Parfait merci'. **That's the thing that broke, and it's the whole lesson:** the LLM will confidently hand you a wrong answer, so the safety can't live in the model — it lives in a deterministic rule plus a confidence threshold, and this eval is how I prove the guardrail still holds after any change." |
| **2:30–3:40** — Learned n8n over a weekend + systems thinking | n8n canvas; fire a curl | "Their stack is n8n, so I **rebuilt this exact pipeline in n8n over a weekend** — same prompt, same thresholds, same Azure model. [fire the webhook, show it run] What I learned porting it: the visual layer is faster and easier to read, but I had to **bolt on my own dedup, because Twilio retries webhooks** and n8n has no atomic unique-key primitive like my database does. And the confidence logic didn't fit a visual Switch, so the safety-critical decision moved into a code node — same principle as production." |
| **3:40–4:15** — Close | n8n README comparison table | "So: n8n wins on speed and legibility; the C# system wins the moment you need atomic guarantees, multi-tenant isolation, and a real test net. Knowing *which* you're trading away is the actual engineering. It's all on GitHub — the production code, the eval set with the ablation, and the n8n port, each with a README. Thanks for watching." |

---

## Notes

- **The "what broke" line is honest as written.** It's a failure mode you guarded against and can
  reproduce on demand, which is exactly what "explain why your agent broke" is probing. If you'd
  rather cite a pure production incident instead, swap in the reminder-that-scheduled-in-the-past bug
  (README failure-mode #1) — but the ablation is the stronger, more visual choice.
- **Running the ablation live** (~10–20s for 40 cases) is worth the small wait for the drama. If your
  connection is slow, pre-run it and just reveal `results.ablation.md`.
- **Keep it under 5:00.** Landing around 4:15 reads as disciplined.
