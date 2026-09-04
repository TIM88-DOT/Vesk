import { Search, Ruler, ShieldCheck, Settings2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useFadeIn } from "../../hooks/useFadeIn";

/**
 * Maps Vesk's safety architecture onto Microsoft's four-stage responsible-generative-AI process
 * (Map → Measure → Mitigate → Manage), which itself aligns to the NIST AI Risk Management Framework.
 *
 * Items marked `planned: true` are NOT shipped yet — the confidence threshold currently lives in the
 * ReplyHandlingAgent system prompt rather than a deterministic C# gate. Kept explicit so the page
 * doesn't claim an enforcement property the code doesn't have.
 */
interface Item {
  text: string;
  planned?: boolean;
}

interface Stage {
  number: string;
  icon: LucideIcon;
  title: string;
  lead: string;
  items: Item[];
}

const stages: Stage[] = [
  {
    number: "01",
    icon: Search,
    title: "Map",
    lead: "Name the harms before writing the prompt.",
    items: [
      { text: "Confirming an appointment the client never agreed to" },
      { text: "Cancelling a booking on a misread reply" },
      { text: "Texting someone who opted out" },
      { text: "One tenant seeing another tenant's data" },
    ],
  },
  {
    number: "02",
    icon: Ruler,
    title: "Measure",
    lead: "Grade failures by blast radius, not just accuracy.",
    items: [
      { text: "40-case bilingual eval set, committed to the repo" },
      { text: "Wrong-and-would-act scored separately from wrong-but-escalated" },
      { text: "Ablations isolate what each guardrail is worth" },
      { text: "Reproducible by anyone: npm run eval" },
    ],
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Mitigate",
    lead: "Layer the defenses so no single failure reaches a customer.",
    items: [
      { text: "Consent checked in C# before any send" },
      { text: "30-day review cooldown enforced outside the model" },
      { text: "Domain entities reject invalid status transitions" },
      { text: "Acknowledgment rule: “merci” is not “je confirme”" },
      { text: "Confidence gate moved from prompt into code", planned: true },
    ],
  },
  {
    number: "04",
    icon: Settings2,
    title: "Manage",
    lead: "Operate it like it can fail, because it can.",
    items: [
      { text: "Cross-tenant isolation asserted on every CI run" },
      { text: "Idempotency keys stop a retried webhook double-sending" },
      { text: "GDPR: consent trail, PII anonymization, audit log" },
      { text: "Soft delete only — nothing is ever hard-deleted" },
    ],
  },
];

export default function ResponsibleAI() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      id="responsible-ai"
      ref={ref}
      className={`py-28 px-6 md:px-8 fade-in-section ${visible ? "is-visible" : ""}`}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-[10px] font-medium text-[#0fa76e] tracking-[1.2px] uppercase mb-4">
            Responsible AI
          </p>
          <h2
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-semibold text-[#0d0d0d] leading-[1.08] mb-4"
            style={{ letterSpacing: "-1px" }}
          >
            The model suggests. The system decides.
          </h2>
          <p className="text-[16px] text-[#777777] leading-[1.65] max-w-xl mx-auto">
            An LLM reads intent. It never holds the authority to act on one.
            Every irreversible step sits behind a check the model cannot talk
            its way through — structured on Microsoft&rsquo;s four-stage
            responsible-AI process.
          </p>
        </div>

        {/* Four stages */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children ${visible ? "is-visible" : ""}`}
        >
          {stages.map((stage) => (
            <div
              key={stage.number}
              className="group rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-7 hover:border-[rgba(0,0,0,0.12)] transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[rgba(24,226,153,0.08)] flex items-center justify-center group-hover:bg-[rgba(24,226,153,0.12)] transition-colors">
                  <stage.icon
                    className="w-[18px] h-[18px] text-[#0fa76e]"
                    strokeWidth={1.8}
                  />
                </div>
                <span className="font-mono text-[11px] font-medium text-[#cccccc] tracking-[0.8px] uppercase">
                  {stage.number}
                </span>
              </div>

              <h3
                className="text-[19px] font-semibold text-[#0d0d0d] mb-1.5"
                style={{ letterSpacing: "-0.2px" }}
              >
                {stage.title}
              </h3>
              <p className="text-[13px] text-[#777777] leading-[1.6] mb-5">
                {stage.lead}
              </p>

              <ul className="space-y-2.5 mt-auto">
                {stage.items.map((item) => (
                  <li key={item.text} className="flex items-start gap-2">
                    <span
                      className={`mt-[6px] w-1 h-1 rounded-full shrink-0 ${
                        item.planned ? "bg-[#cccccc]" : "bg-brand"
                      }`}
                    />
                    <span className="text-[13px] text-[#555555] leading-[1.55]">
                      {item.text}
                      {item.planned && (
                        <span className="ml-1.5 inline-block font-mono text-[9px] font-medium text-[#aaaaaa] tracking-[0.5px] uppercase border border-[rgba(0,0,0,0.08)] rounded px-1.5 py-px align-middle">
                          Planned
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Attribution + honest status */}
        <p className="text-center text-[12px] text-[#bbbbbb] mt-10 leading-[1.7]">
          Structured on Microsoft&rsquo;s{" "}
          <a
            href="https://learn.microsoft.com/en-us/training/modules/responsible-ai-studio/2-plan-responsible-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#999999] underline underline-offset-2 hover:text-[#0d0d0d] transition-colors"
          >
            responsible generative AI process
          </a>
          , which aligns to the NIST AI Risk Management Framework.
          <br />
          Unmarked items are enforced in the codebase today; items marked{" "}
          <span className="font-mono text-[10px] uppercase tracking-[0.5px]">
            planned
          </span>{" "}
          are not shipped yet.
        </p>
      </div>
    </section>
  );
}
