import {
  Bot,
  MessageSquareText,
  Star,
  Globe,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { useFadeIn } from "../../hooks/useFadeIn";

export default function Features() {
  const { ref, visible } = useFadeIn();

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
          {/* Row 1: large left + stacked right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Smart Reminders — large card with visual */}
            <div className="lg:col-span-7 group rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-8 hover:border-[rgba(0,0,0,0.12)] transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col">
              <div className="flex-1">
                <div className="w-10 h-10 rounded-xl bg-[rgba(24,226,153,0.08)] flex items-center justify-center mb-4 group-hover:bg-[rgba(24,226,153,0.12)] transition-colors">
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

              {/* Visual: mini SMS timeline */}
              <div className="mt-8 p-4 bg-[#fafafa] rounded-xl border border-[rgba(0,0,0,0.04)]">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[rgba(24,226,153,0.1)] flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[9px]">📱</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-[#0d0d0d] text-white text-[12px] rounded-xl rounded-tl-sm px-3 py-2 inline-block leading-[1.5]">
                        Rappel : votre RDV est demain à 14h ✨
                      </div>
                      <p className="text-[10px] text-[#bbbbbb] mt-1.5 font-mono">
                        Sent at 4:30 PM · AI-optimized window
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-9">
                    <span className="w-1 h-1 rounded-full bg-brand" />
                    <span className="text-[10px] text-[#0fa76e] font-medium font-mono tracking-[0.5px] uppercase">
                      24h before · FR detected · No-show risk: low
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — two stacked cards */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Instant Replies */}
              <div className="group flex-1 rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-7 hover:border-[rgba(0,0,0,0.12)] transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div className="w-10 h-10 rounded-xl bg-[rgba(24,226,153,0.08)] flex items-center justify-center mb-3 group-hover:bg-[rgba(24,226,153,0.12)] transition-colors">
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

                {/* Confidence bar */}
                <div className="p-3 bg-[#fafafa] rounded-lg border border-[rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                    <span className="text-[#bbbbbb]">
                      &ldquo;C&rsquo;est bon pour moi&rdquo; → CONFIRM
                    </span>
                    <span className="text-[#0fa76e] font-semibold">85%</span>
                  </div>
                  <div className="h-[3px] bg-[rgba(0,0,0,0.04)] rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-brand rounded-full" />
                  </div>
                </div>
              </div>

              {/* Review Recovery */}
              <div className="group flex-1 rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-7 hover:border-[rgba(0,0,0,0.12)] transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <div className="w-10 h-10 rounded-xl bg-[rgba(24,226,153,0.08)] flex items-center justify-center mb-3 group-hover:bg-[rgba(24,226,153,0.12)] transition-colors">
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

                {/* Stars visual */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-brand text-brand"
                      strokeWidth={0}
                    />
                  ))}
                  <span className="text-[11px] text-[#bbbbbb] ml-2 font-mono">
                    Google · Facebook
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: three equal cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bilingual */}
            <div className="group rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-7 hover:border-[rgba(0,0,0,0.12)] transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[rgba(24,226,153,0.08)] flex items-center justify-center mb-3 group-hover:bg-[rgba(24,226,153,0.12)] transition-colors">
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
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 bg-[#0d0d0d] text-white text-[11px] font-mono font-medium rounded-md">
                  FR
                </span>
                <span className="text-[11px] text-[#dddddd]">⇄</span>
                <span className="px-2.5 py-1 bg-[#fafafa] border border-[rgba(0,0,0,0.06)] text-[#0d0d0d] text-[11px] font-mono font-medium rounded-md">
                  EN
                </span>
              </div>
            </div>

            {/* Live Dashboard */}
            <div className="group rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-7 hover:border-[rgba(0,0,0,0.12)] transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[rgba(24,226,153,0.08)] flex items-center justify-center mb-3 group-hover:bg-[rgba(24,226,153,0.12)] transition-colors">
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
              {/* Mini sparkline */}
              <div className="flex items-end gap-[3px] h-7">
                {[35, 55, 40, 70, 50, 85, 60, 92, 68, 80, 55, 88].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm transition-colors duration-200"
                      style={{
                        height: `${h}%`,
                        backgroundColor:
                          i >= 10
                            ? "rgba(24,226,153,0.35)"
                            : "rgba(24,226,153,0.12)",
                      }}
                    />
                  ),
                )}
              </div>
            </div>

            {/* GDPR Ready */}
            <div className="group rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-7 hover:border-[rgba(0,0,0,0.12)] transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="w-10 h-10 rounded-xl bg-[rgba(24,226,153,0.08)] flex items-center justify-center mb-3 group-hover:bg-[rgba(24,226,153,0.12)] transition-colors">
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
                {["Consent", "Audit trail", "Anonymize"].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-[rgba(24,226,153,0.06)] text-[#0fa76e] text-[10px] font-mono font-medium rounded-full border border-[rgba(24,226,153,0.1)]"
                  >
                    ✓ {label}
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
