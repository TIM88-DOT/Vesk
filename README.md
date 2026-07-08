# Vesk ✨

**Vesk sends the reminder, reads the reply, and asks for the review — so a 3-chair salon doesn't have to.**

<table>
<tr>
<td width="65%" valign="top">
<img src="docs/screenshots/dashboard-hero.png" alt="Vesk owner dashboard — today's appointments, at-risk score, no-show rate, reviews sent" width="100%" />
<sub>Owner dashboard — live status per appointment, no-show rate, at-risk flags.</sub>
</td>
<td width="35%" valign="top">
<img src="docs/screenshots/booking-mobile.png" alt="Vesk public booking flow on mobile — picking a time slot" width="100%" />
<sub>Public booking, no account needed — <code>/book/{slug}</code>.</sub>
</td>
</tr>
</table>

Vesk is a multi-tenant SaaS that automates customer communication for appointment-based small
businesses. It's a production-grade .NET + React system, and it's also where I build and test
**multi-step AI agent pipelines** — the kind that classify an inbound message, decide what it means,
and take an action without a human in the loop.

> **New here for the AI pipeline work?** Jump to [**The AI pipeline — proven and portable**](#-the-ai-pipeline--proven-and-portable).
> It's one real workflow shown three ways: the production C# version, an [eval set](evals/) that
> measures how the LLM fails, and the same pipeline [rebuilt in n8n](n8n/).

---

## 💡 Why we built it

Small businesses don't lose money because they're bad at their craft. They lose it in the gaps
*between* appointments — no-shows, silent customers, reviews that never got asked for, reminders sent
in the wrong language.

The owner of a 3-chair salon doesn't want a CRM or another dashboard. They want the *outcome*: full
chairs, clients on time, 5-star reviews rolling in. Existing tools make them work harder — booking
software sends dumb reminders at fixed hours, marketing tools spam everyone with the same campaign,
and almost all of them are English-only, a non-starter in Montréal, Québec City, or half of Ontario.

**Vesk flips this: the AI *is* the workflow, not a chatbot bolted onto one.** It decides when to
remind, in which language and tone; it reads incoming replies and updates the appointment itself; and
it only asks for a review when someone is actually likely to leave a good one.

---

## 🚀 What it does

- **Smart bilingual reminders.** Per-client language (FR/EN) and an LLM-picked send-time based on past
  response patterns — not a static 24h-before rule.
- **Conversational SMS, both directions.** Inbound replies are intent-classified, matched to the
  appointment, and confirmed / cancelled / rescheduled automatically.
- **Automatic review recovery.** A deterministic cooldown gate + AI confidence score decide who gets a
  review request, with the link going straight to Google, Facebook, or Trustpilot.
- **Public booking without an account.** Every tenant gets `/book/{slug}`: service → slot → phone →
  confirm, with consent capture and phone-based dedup handled server-side.
- **No-show scoring + at-risk flags.** A rolling per-customer score adds an extra confirmation touch
  for risky appointments.
- **Owner-grade dashboard.** A live SignalR feed and weekly stats, glanceable on a phone between
  clients.

---

## 🔧 How it works

<img src="docs/architecture-layers.svg" alt="Vesk layered architecture: Api, Application, Infrastructure, Domain, Shared, Workers, Web" width="100%" />

A modular monolith — one deployable, nine bounded contexts (Tenants · Identity · Customers ·
Appointments · Messaging · Campaigns · AI/Agents · Billing · Analytics) that talk only through events,
never each other's database. *(Event flow, SMS sequence, and appointment-state diagrams in
[`docs/architecture-all.md`](docs/architecture-all.md).)*

### The core AI workflow: an inbound SMS becomes an action

This is the pipeline the eval set and the n8n port both target, in plain terms:

```
Customer texts back  →  1. Reject spoofed webhooks (Twilio signature)
"Oui je serai là"       2. Ignore duplicates      (dedup on the message id)
                        3. Handle STOP/START       (legal opt-out, in code — never the LLM)
                        4. Ask the LLM: what did they mean?   → intent + confidence (0–1)
                        5. Act ONLY if confident:
                             confident (≥0.85) → auto-confirm / cancel / send reschedule link
                             unsure   (<0.75)  → escalate to a human
```

The one rule that governs the whole thing: **the application is the source of truth, never the
prompt.** The LLM decides *timing, tone, and intent*. Deterministic C# decides *what's legal and
safe* — consent checks, opt-out keywords, business-hours gates, and the confidence threshold that
guards every automatic action. The AI proposes; the code is the gate.

A few other principles that fall out of that:

- **Multi-tenant isolation is a precondition, not a feature.** `TenantId` on every row, EF Core global
  query filters on every query, and cross-tenant tests on every CI run. A tenant leak is
  product-ending, so it's built to be impossible.
- **Events, not cron jobs.** Scheduling is Azure Service Bus deferred messages (no Hangfire/Quartz),
  so any pending reminder can be cancelled deterministically when a client reschedules.
- **Idempotency everywhere.** Twilio retries webhooks, so every inbound message is deduped on its
  provider id — a unique DB constraint, not a hope.

---

## 🧪 The AI pipeline — proven and portable

The inbound-SMS workflow above is shown three ways in this repo. Same prompt, same intent schema,
same 0.85 / 0.75 thresholds across all three:

| | What it is | Where |
|---|---|---|
| **Production** | The real C# agent: LLM classification behind deterministic consent/idempotency/threshold gates. | [`src/Vesk.Infrastructure/Agents/ReplyHandlingAgent.cs`](src/Vesk.Infrastructure/Agents/ReplyHandlingAgent.cs) |
| **Eval set** | 40 bilingual test messages that measure *how the classifier fails* — separating "wrong but caught by the confidence gate" from "wrong **and** confident enough to auto-act." Runs with just an OpenAI or Azure key. | [**`evals/`**](evals/) |
| **n8n replica** | The same pipeline rebuilt as a low-code n8n workflow, with an honest write-up of where visual tooling helps and where it gets awkward (non-atomic dedup, compound confidence logic, error handling). | [**`n8n/`**](n8n/) |

**Why these two extras matter:** the eval set turns "how do LLMs fail?" into a real experiment. With
the full prompt, the classifier scores 39/40 with **0 dangerous auto-actions**. Strip out one
paragraph — the acknowledgment-vs-confirmation rule — and re-run, and a polite "D'accord" (0.90) or
"Parfait merci" (0.85) flips straight to a confident **auto-confirm** of an appointment nobody
confirmed (2 dangerous fails). That ablation is the whole thesis in one number: the LLM classifies,
but a deterministic rule plus the confidence gate are what make it *safe*. The n8n port then shows the
same workflow rebuilt in a different toolset, and names the trade-offs. Each folder has its own README.

---

## 🩹 What broke while building it

Real incidents, not hypotheticals — the failure, the root cause, and the fix.

**1. The AI agent scheduled a reminder in the past — and lied about the time in it.**
The reminder agent picked its own send time *and* wrote the "time remaining" text. On a 2-hour-out
appointment it scheduled the urgent reminder in the past, with body text saying "in 3h" when the real
gap was 1 hour.
*Root cause:* a business rule (accurate time math) was delegated to the LLM instead of enforced in
code — a direct violation of the project's own "AI never owns hard gates" rule.
*Fix:* moved time-phrase formatting into deterministic C# (`ReminderTimePhrase`), gave the agent a
`{time_until}` token instead of letting it write a number, and made the scheduling tool reject any
`sendAt` in the past or after the appointment start.

**2. Three things sending SMS at once corrupted the monthly usage counter.**
Concurrent sends for one tenant — an inbound reply, the reminder dispatcher, the no-show worker — all
hit the same `(plan, year, month)` usage row with a read-then-insert, racing the unique constraint and
throwing Postgres `23505`.
*Root cause:* "check then write" isn't atomic, and three code paths had each grown their own copy of it.
*Fix:* one shared `UsageTracker.IncrementSmsSentAsync` doing `INSERT … ON CONFLICT DO UPDATE`, so
concurrent sends serialize in the database instead of racing in application code.

**3. A dev-only JWT secret sat in the public repo's history.**
`appsettings.Development.json` — with a JWT signing key and a local DB password — was tracked from an
early commit. A demo project, but a committed secret in a public repo is exactly what gets flagged, and
rotating it after the fact doesn't remove it from history.
*Root cause:* the `dotnet new` template tracks `appsettings.*.json` by default and nothing opted the
Development file out.
*Fix:* untracked both API and Workers dev config, added `.example` templates, pinned every CI Action to
a commit SHA, and broadened secret-scanning triggers.

**4. The frontend was hammering `/auth/refresh` on every page load.**
QA saw ~12 aborted `/auth/refresh` calls per journey: the `AuthProvider` bootstrap and the axios 401
interceptor each fired their own refresh, and optimistic rendering kicked off queries before the token
was set.
*Root cause:* two independent code paths each assumed they were the only thing that could trigger a
refresh.
*Fix:* one shared single-flight `refreshSession()` in `lib/api.ts` that both call into. Aborted calls
per journey dropped from ~12 to ~4.

---

## 🛠️ Tech

**Backend** — .NET 8 minimal APIs, MediatR for in-process domain events, `Result<T>` on all service
boundaries, EF Core 8 on PostgreSQL, Azure Service Bus for scheduling/events, Azure OpenAI for the
agents, Twilio SMS behind `ISmsProvider`, SignalR for the live dashboard.

**Frontend** — React 18 + TypeScript (strict, no `any`), TanStack Query, React Hook Form + Zod,
Tailwind + shadcn/ui (see [`DESIGN.md`](DESIGN.md)). JWT in memory, refresh token in an `httpOnly`
cookie.

**Infra** — Azure Bicep in `infra/`, Docker Compose for local PostgreSQL + Seq.

---

## 📁 Repository layout

```
Vesk.sln
├── src/
│   ├── Vesk.Api/            Controllers, middleware, DI root
│   ├── Vesk.Application/    MediatR handlers, DTOs, agent orchestration
│   ├── Vesk.Domain/         Entities, enums, domain events
│   ├── Vesk.Infrastructure/ EF Core, Twilio, Service Bus, Azure OpenAI, agents
│   ├── Vesk.Workers/        IHostedService workers, Service Bus consumers
│   ├── Vesk.Shared/         Result<T>, Error types, guards, interfaces
│   └── Vesk.Web/            React + Vite frontend
├── tests/                   Unit, integration (tenant isolation, idempotency), architecture
├── evals/                   ⭐ Offline eval set for the SMS intent classifier
├── n8n/                     ⭐ The inbound-SMS pipeline rebuilt in n8n + comparison write-up
├── infra/                   Azure Bicep
└── docs/                    Architecture diagrams, sprint plans
```

---

## ⚡ Getting started

```bash
# Local infra
docker compose up -d                 # PostgreSQL + Seq

# Backend
dotnet build Vesk.sln
dotnet ef database update --project src/Vesk.Infrastructure --startup-project src/Vesk.Api
dotnet run --project src/Vesk.Api

# Frontend (separate terminal)
cd src/Vesk.Web && npm install && npm run dev

# Tests
dotnet test Vesk.sln
```

API on `https://localhost:7xxx`, web on `http://localhost:5173`. Register a tenant from the UI — the
account is seeded with FR + EN templates and a default plan. `start.ps1` / `stop.ps1` bring the full
stack up and down on Windows.

To run just the AI-pipeline artifacts, see [`evals/README.md`](evals/README.md) and
[`n8n/README.md`](n8n/README.md) — both run standalone with only an OpenAI key.

---

## 📍 Status

Sprint 1 shipped the full MVP demo loop: auth, tenants, customers with consent, appointments, the
bilingual reminder workflow, public booking, review requests, and the real-time dashboard. Sprint 2 is
the path to Azure production — column encryption, per-tenant Twilio provisioning, at-risk polish, and
the auto-completion worker. See [`docs/sprint1.md`](docs/sprint1.md) and
[`docs/sprint2.md`](docs/sprint2.md).

---

<sub>Vesk was built as FlowPilot AI, briefly rebranded Relora AI, and now ships as Vesk — the source
tree, namespaces, and repo have all been renamed to match.</sub>
