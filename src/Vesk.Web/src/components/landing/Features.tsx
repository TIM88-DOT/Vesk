import {
  Bot,
  MessageSquareText,
  Star,
  Globe,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { useFadeIn } from "../../hooks/useFadeIn";
import ValuePill from "./ValuePill";

/**
 * Demo visuals in each card use Beautiful UI's vocabulary (https://www.beautifului.dev, MIT):
 * the `value-pill` inset-ring chip and the `task-rows` decision trace — staggered `fade-up` at
 * i*80ms on cubic-bezier(0.23,1,0.32,1). Ported onto Vesk's tokens; see ValuePill.tsx for why the
 * upstream `foundation` layer isn't installed.
 */

/** What the reminder agent resolved before choosing a send time. */
const decisions: { label: string; value: string }[] = [
  { label: "Language detected", value: "FR" },
  { label: "No-show risk", value: "Low" },
  { label: "Send window", value: "4:30 PM" },
];

const CARD =
  "group rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-7 hover:border-[rgba(0,0,0,0.12)] transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]";

const ICON_WRAP =
  "w-10 h-10 rounded-xl bg-[rgba(24,226,153,0.08)] flex items-center justify-center mb-3 group-hover:bg-[rgba(24,226,153,0.12)] transition-colors";

export default function Features() {
  const { ref, visible } = useFadeIn();

  /** Beautiful UI's row entrance: fade-up 450ms, 80ms apart. */
  const rowAnim = (i: number): React.CSSProperties => ({
    animation: visible
      ? `fade-up 450ms cubic-bezier(0.23,1,0.32,1) ${i * 80}ms both`
      : "none",
    opacity: visible ? undefined : 0,
  });

  return (
    <section
      id="features"
      ref={ref}
      className={`py-28 px-6 md:px-8 fade-in-section ${visible ? "is-visible" : ""}`}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="font-mono text-[10px] font-medium text-[#0fa76e] tracking-[1.2px] uppercase mb-4">
            Features
          </p>
          <h2
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-semibold text-[#0d0d0d] leading-[1.08]"
            style={{ letterSpacing: "-1px" }}
          >
            Everything on autopilot.
          </h2>
          <p className="text-[16px] text-[#777777] leading-[1.6] max-w-md mx-auto mt-4">
            Your business rules enforced in code. AI decides <em>how</em> to
            communicate, never <em>whether</em> it should.
          </p>
        </div>

        {/* ── Bento grid ── */}
        <div className="space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Smart Reminders — large */}
            <div className={`lg:col-span-7 ${CARD} flex flex-col`}>
              <div className="flex-1">
                <div className={ICON_WRAP}>
                  <Bot
                    className="w-[18px] h-[18px] text-[#0fa76e]"
                    strokeWidth={1.8}
                  />
                </div>
                <h3
                  className="text-[22px] font-semibold text-[#0d0d0d] mb-2"
                  style={{ letterSpacing: "-0.3px" }}
                >
                  Smart Reminders
                </h3>
                <p className="text-[14px] text-[#777777] leading-[1.6] max-w-sm">
                  AI crafts and schedules the perfect reminder based on client
                  history, no-show score, and preferred language.
                </p>
              </div>

              {/* Demo: message + the decisions behind it */}
              <div className="mt-8 p-4 bg-[#fafafa] rounded-xl border border-[rgba(0,0,0,0.04)]">
                <div className="bg-[#0d0d0d] text-white text-[12px] rounded-xl rounded-tl-sm px-3 py-2 inline-block leading-[1.5] mb-4">
                  Rappel : votre RDV est demain à 14h ✨
                </div>

                {/* task-rows style decision trace */}
                <div className="relative pl-[13px]">
                  <span className="absolute left-[3px] top-2 bottom-2 w-px bg-[rgba(0,0,0,0.07)]" />
                  <div className="space-y-1">
                    {decisions.map((d, i) => (
                      <div
                        key={d.label}
                        className="flex items-center gap-2 min-h-[26px]"
                        style={rowAnim(i)}
                      >
                        <span className="text-brand text-[10px] leading-none">
                          ✓
                        </span>
                        <span className="text-[12px] text-[#777777] flex-1 truncate">
                          {d.label}
                        </span>
                        <ValuePill tone="brand" mono>
                          {d.value}
                        </ValuePill>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — two stacked cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Instant Replies */}
              <div className={`flex-1 ${CARD}`}>
                <div className={ICON_WRAP}>
                  <MessageSquareText
                    className="w-[18px] h-[18px] text-[#0fa76e]"
                    strokeWidth={1.8}
                  />
                </div>
                <h3
                  className="text-[18px] font-semibold text-[#0d0d0d] mb-1.5"
                  style={{ letterSpacing: "-0.2px" }}
                >
                  Instant Replies
                </h3>
                <p className="text-[13px] text-[#777777] leading-[1.6] mb-5">
                  Understands &ldquo;oui&rdquo; or &ldquo;yes&rdquo; and
                  auto-confirms — or escalates when confidence is low.
                </p>

                <div className="p-3 bg-[#fafafa] rounded-lg border border-[rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="font-mono text-[11px] text-[#999999] truncate flex-1">
                      &ldquo;C&rsquo;est bon pour moi&rdquo;
                    </span>
                    <ValuePill tone="brand" mono>
                      Confirm
                    </ValuePill>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-[3px] bg-[rgba(0,0,0,0.05)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full transition-[width] duration-[1200ms] ease-out"
                        style={{ width: visible ? "85%" : "0%" }}
                      />
                    </div>
                    <span className="font-mono text-[11px] font-semibold text-[#0fa76e] tabular-nums">
                      0.85
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Recovery */}
              <div className={`flex-1 ${CARD}`}>
                <div className={ICON_WRAP}>
                  <Star
                    className="w-[18px] h-[18px] text-[#0fa76e]"
                    strokeWidth={1.8}
                  />
                </div>
                <h3
                  className="text-[18px] font-semibold text-[#0d0d0d] mb-1.5"
                  style={{ letterSpacing: "-0.2px" }}
                >
                  Review Recovery
                </h3>
                <p className="text-[13px] text-[#777777] leading-[1.6] mb-5">
                  Personalized review requests after every completed visit with
                  your Google or Facebook link.
                </p>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 fill-brand text-brand"
                        strokeWidth={0}
                        style={rowAnim(i)}
                      />
                    ))}
                  </span>
                  <ValuePill tone="neutral">Google</ValuePill>
                  <ValuePill tone="neutral">Facebook</ValuePill>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 — three equal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bilingual */}
            <div className={CARD}>
              <div className={ICON_WRAP}>
                <Globe
                  className="w-[18px] h-[18px] text-[#0fa76e]"
                  strokeWidth={1.8}
                />
              </div>
              <h3
                className="text-[18px] font-semibold text-[#0d0d0d] mb-1.5"
                style={{ letterSpacing: "-0.2px" }}
              >
                Bilingual
              </h3>
              <p className="text-[13px] text-[#777777] leading-[1.6] mb-5">
                French and English out of the box. Every message adapts to each
                client&rsquo;s preferred language.
              </p>
              <div className="flex items-center gap-2">
                <ValuePill tone="brand" mono>
                  FR
                </ValuePill>
                <span className="text-[11px] text-[#dddddd]">⇄</span>
                <ValuePill tone="neutral" mono>
                  EN
                </ValuePill>
              </div>
            </div>

            {/* Live Dashboard */}
            <div className={CARD}>
              <div className={ICON_WRAP}>
                <BarChart3
                  className="w-[18px] h-[18px] text-[#0fa76e]"
                  strokeWidth={1.8}
                />
              </div>
              <h3
                className="text-[18px] font-semibold text-[#0d0d0d] mb-1.5"
                style={{ letterSpacing: "-0.2px" }}
              >
                Live Dashboard
              </h3>
              <p className="text-[13px] text-[#777777] leading-[1.6] mb-5">
                Delivery rates, no-show trends, and agent logs — all at a
                glance.
              </p>
              <div className="flex items-end gap-3">
                <div className="flex items-end gap-[3px] h-7 flex-1">
                  {[35, 55, 40, 70, 50, 85, 60, 92, 68, 80, 55, 88].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-[height] duration-500 ease-out"
                        style={{
                          height: visible ? `${h}%` : "8%",
                          transitionDelay: `${i * 40}ms`,
                          backgroundColor:
                            i >= 10
                              ? "rgba(24,226,153,0.35)"
                              : "rgba(24,226,153,0.12)",
                        }}
                      />
                    ),
                  )}
                </div>
                <ValuePill tone="brand" mono>
                  Live
                </ValuePill>
              </div>
            </div>

            {/* GDPR Ready */}
            <div className={CARD}>
              <div className={ICON_WRAP}>
                <ShieldCheck
                  className="w-[18px] h-[18px] text-[#0fa76e]"
                  strokeWidth={1.8}
                />
              </div>
              <h3
                className="text-[18px] font-semibold text-[#0d0d0d] mb-1.5"
                style={{ letterSpacing: "-0.2px" }}
              >
                GDPR Ready
              </h3>
              <p className="text-[13px] text-[#777777] leading-[1.6] mb-5">
                Consent tracking, one-click anonymization, and an immutable
                audit trail baked in.
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                {["Consent", "Audit trail", "Anonymize"].map((label, i) => (
                  <span key={label} style={rowAnim(i)}>
                    <ValuePill tone="brand" mono>
                      ✓ {label}
                    </ValuePill>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
