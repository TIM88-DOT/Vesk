# Vesk inbound-SMS pipeline, rebuilt in n8n

Vesk's production reply pipeline is a C# modular monolith. This folder is the **same pipeline
rebuilt as an n8n workflow over a weekend** — webhook → dedup → consent/keyword gate → LLM intent
classification → confidence-gated action routing — so the two can be compared side by side.

The point isn't that the n8n version is better. It isn't. The point is to show the *same* problem
solved in low-code tooling, and to be honest about **where visual flows help and where they get in
the way**. That comparison is the bulk of this document.

> Standalone / OpenAI-direct: the flow calls OpenAI directly and the "actions" are mock (NoOp)
> nodes, so it runs with just an OpenAI key — no Vesk backend, no database.

---

## What the workflow does

Same job as the production path in
[`ReplyHandlingAgent.cs`](../src/Vesk.Infrastructure/Agents/ReplyHandlingAgent.cs) +
[`MessagingService.cs`](../src/Vesk.Infrastructure/Messaging/MessagingService.cs):
a customer replies to a reminder SMS, and the system figures out what they meant and acts on it.

```
Twilio ──POST──▶ [Webhook]
                    │
                    ▼
            [Normalize & Dedup]  ── dedup on MessageSid (idempotency)
                    │              ── STOP/START keyword gate (deterministic)
                    ▼
              [Duplicate?] ──true──▶ [Respond 200] (already processed)
                    │ false
                    ▼
            [Keyword Router] ──STOP──▶ [Record Opt-out] ─▶ [Respond 200]
                    │         ──START─▶ [Record Opt-in]  ─▶ [Respond 200]
                    │ classify
                    ▼
          [Build OpenAI Request]
                    ▼
            [OpenAI Classify]  ── chat/completions, forced classify_intent tool call
                    ▼
         [Apply Threshold Policy]  ── 0.85 auto-act / 0.75 escalate gates (deterministic)
                    ▼
             [Action Router] ── auto-confirm ─▶ [confirm_appointment (mock)] ─┐
                             ── auto-cancel   ─▶ [cancel_appointment (mock)]  ─┤
                             ── auto-resched  ─▶ [send_reschedule_link (mock)]─┼─▶ [Respond 200]
                             ── escalate      ─▶ [Escalate to Staff (mock)]   ─┤
                             ── log           ─▶ [Log for Review (mock)]      ─┘
```

### Node-by-node

| Node | Type | Mirrors in C# |
|---|---|---|
| Twilio Inbound Webhook | Webhook | `POST /api/webhooks/twilio/sms/inbound` + `TwilioSignatureFilter` (tenant resolved from the `To` number) |
| Normalize & Dedup | Code | `ProcessInboundAsync` dedup on `ProviderSmsSid` + keyword normalize |
| Duplicate? | If | the `alreadyProcessed` early-return |
| Keyword Router | Switch | `StopKeywords` / `StartKeywords` sets in `MessagingService` |
| Build OpenAI Request | Code | the agent's system prompt + `classify_intent` tool schema |
| OpenAI Classify | HTTP Request | `IAgentOrchestrator.RunAsync` (the actual LLM call) |
| Apply Threshold Policy | Code | the 0.85 / 0.75 action rules in `ReplyHandlingAgent` |
| Action Router | Switch | `confirm_appointment` / `cancel_appointment` / `send_reschedule_link` tools |
| *_(mock)_ | NoOp | the real tool executions / Service Bus events |

The classifier prompt and the `classify_intent` schema are the **same ones** used by the
[eval harness](../evals/README.md) and derived from the production agent, so all three
(C# app, n8n flow, eval set) classify identically.

---

## Run it

1. **Start n8n**
   ```bash
   cd n8n
   docker compose -f docker-compose.n8n.yml up -d
   # open http://localhost:5678 and create the local owner account
   ```
2. **Import the workflow**: in the n8n UI → *Workflows* → *Import from File* →
   `vesk-inbound-sms.workflow.json`.
3. **Add the OpenAI credential**: create a *Header Auth* credential named e.g. `OpenAI Header Auth`
   with `Name = Authorization`, `Value = Bearer sk-...`, and select it on the **OpenAI Classify**
   node.
4. **Activate** the workflow, then fire a fake Twilio webhook at the production URL n8n shows:
   ```bash
   curl -X POST 'http://localhost:5678/webhook/vesk-inbound-sms' \
     --data-urlencode 'MessageSid=SM123' \
     --data-urlencode 'From=+15551234567' \
     --data-urlencode 'To=+15559876543' \
     --data-urlencode 'Body=Oui je serai là'
   ```
   Send the **same `MessageSid` twice** to watch the dedup branch short-circuit the second one.
   Try `Body=STOP` (opt-out branch) and `Body=👍` (watch it classify — and see the acknowledgment
   trap the [eval set](../evals/README.md) is built around).

Targets n8n 1.x. If a node shows a version warning on import, open it and re-select the operation —
the logic is in the Code nodes, which are version-stable.

### Using Azure AI Foundry instead of OpenAI

The flow ships pointed at OpenAI, but Vesk runs on Azure OpenAI in production — to match it, change
only the **OpenAI Classify** node (no workflow-structure changes):

1. **URL** → your deployment's chat-completions endpoint:
   `https://<resource>.openai.azure.com/openai/deployments/<deployment>/chat/completions?api-version=2024-10-21`
2. **Credential** → a *Header Auth* credential with `Name = api-key` and `Value = <your-azure-key>`
   (Azure uses `api-key`, not `Authorization: Bearer`).

That's it — the request body is identical (Azure ignores the body `model`; the deployment is in the
URL), and the response shape is the same, so **Apply Threshold Policy** downstream needs no changes.

---

## C# production vs n8n replica — the honest comparison

| Dimension | Vesk (C# modular monolith) | n8n replica |
|---|---|---|
| Time to first working version | days (DI, EF, migrations, tests) | **a few hours** |
| Reading the flow | trace across files/classes | **one canvas, obvious at a glance** |
| Idempotency / dedup | Postgres unique index on `ProviderSmsSid` — atomic, survives restarts, concurrency-safe | workflow static data — best-effort, **not atomic**, per-instance |
| Consent / opt-out gate | deterministic C#, unit-tested, legally auditable | deterministic Code node — fine, but no test harness around it |
| Multi-tenancy | `TenantId` on every row + global query filter | **no concept of it** — I'd bolt tenant onto each HTTP call by hand |
| Error handling / retries | typed `Result<T>`, Service Bus retry + DLQ, idempotent consumers | per-node "retry on fail" + error workflow; **partial failures are murkier** |
| Testing | xUnit unit + integration + architecture tests in CI | manual "pin data and run"; **no real assertion layer** |
| Observability | structured logs (Seq), correlation ids | per-execution view is *great* for eyeballing, weak for aggregation/alerting |
| Changing a branch | code review + deploy | **drag a node, done** |
| Who can maintain it | .NET developers | anyone comfortable in the n8n UI |

### Four things that actually got awkward porting it

1. **I had to bolt on my own dedup.** Twilio retries webhooks, so without idempotency the same reply
   gets processed twice — double-confirming an appointment. In C# that's a unique DB index doing the
   work atomically. In n8n there's no natural "unique key" primitive, so I used `getWorkflowStaticData`
   as a seen-SID set. It works for a demo but it's **not atomic and not shared across instances** —
   two webhook deliveries landing at once could both slip through. The C# guarantee is a one-line
   constraint; the n8n equivalent is an honest approximation. This is the single biggest gap.

2. **The confidence threshold doesn't want to live in a Switch.** The real decision is *two*
   variables — intent **and** confidence — combined ("Confirm at ≥0.85 → auto-confirm; anything at
   <0.75 → escalate"). n8n's Switch routes on one value at a time, and expressing compound numeric
   logic in the visual condition editor got unreadable fast. So I kept the LLM call visual but moved
   the **policy into a Code node** that outputs a single `action` string, and let the Switch route on
   that. That mirrors the production principle exactly — *the LLM classifies, deterministic code
   decides what's safe to auto-do* — and it's a good lesson: the visual layer is great for the shape
   of the flow, but the safety-critical decision belongs in code you can read and test, not in a
   condition builder.

3. **Keeping the LLM boundary honest took discipline.** It's tempting in n8n to let the model "just
   handle it" — one big prompt that decides *and acts*. I deliberately didn't. Opt-out keywords are
   gated *before* the model (legal requirement — CASL/Twilio STOP can't depend on a probabilistic
   classifier), and the model only ever returns a classification, never an action. Same rule as the
   C# app: business rules never go inside the prompt.

4. **Errors are quieter.** In C# a provider failure is a typed `Result.Failure` I can branch on and a
   Service Bus message that retries then dead-letters. In n8n, if the OpenAI node fails, the default
   is a stopped execution; making it robust means wiring "continue on fail" + an error workflow, and
   the partial-success story ("classified but the action call failed") is fuzzier than a transaction.

### What each is genuinely good at

- **n8n wins** on speed-to-first-version, legibility, and letting a non-developer safely tweak the
  happy path. For "wire an intake webhook to a model to a couple of actions," it's the right tool and
  it's *faster*.
- **C# wins** the moment correctness guarantees matter: atomic idempotency, multi-tenant isolation,
  typed error handling, and a real automated test net. The kind of thing you want load-bearing.

The interesting engineering isn't picking a side — it's knowing which properties you're trading away
when you move a workflow from one to the other, and putting the safety-critical parts (dedup, consent,
the confidence gate) somewhere you can guarantee them either way.

## Files

| File | Purpose |
|---|---|
| `vesk-inbound-sms.workflow.json` | Importable n8n workflow (n8n 1.x) |
| `docker-compose.n8n.yml` | One-command self-hosted n8n for the demo |
