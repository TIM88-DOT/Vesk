import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import AgentTrace from "./AgentTrace";

/* Case 5 from the committed eval set (evals/results.md): Confirm @ 0.95 → auto-confirm. */
const REPLY_TEXT = "Oui je serai là";

/** Tool calls rendered by AgentTrace — kept in sync with its `steps`. */
const TOOL_COUNT = 4;

export default function Hero() {
  const [stage, setStage] = useState(0);
  const [typedReply, setTypedReply] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [toolProgress, setToolProgress] = useState(0);

  /* Sequence: outbound → inbound → agent tools → classify → action */
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 700),
      setTimeout(() => setStage(2), 2100),
      setTimeout(() => setStage(3), 3400),
      setTimeout(() => setStage(4), 5300),
      setTimeout(() => setStage(5), 6400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  /* Walk the tool trace once stage 3 opens */
  useEffect(() => {
    if (stage < 3) return;
    let n = 0;
    const id = setInterval(() => {
      n++;
      setToolProgress(n);
      if (n >= TOOL_COUNT) clearInterval(id);
    }, 450);
    return () => clearInterval(id);
  }, [stage]);

  /* Typing effect for the inbound reply */
  useEffect(() => {
    if (stage < 2) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTypedReply(REPLY_TEXT.slice(0, i));
      if (i >= REPLY_TEXT.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [stage]);

  /* Confidence counter */
  useEffect(() => {
    if (stage < 4) return;
    let val = 0;
    const id = setInterval(() => {
      val += 2;
      if (val >= 95) {
        val = 95;
        clearInterval(id);
      }
      setConfidence(val);
    }, 14);
    return () => clearInterval(id);
  }, [stage]);

  return (
    <section className="relative min-h-[94vh] flex items-center px-6 md:px-8 pt-28 pb-20 overflow-hidden">
      {/* ── Background layers ── */}
      <div className="absolute inset-0 pointer-events-none dot-grid opacity-40" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 65% 55% at 65% -5%, rgba(24,226,153,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 45% 40% at 90% 20%, rgba(24,226,153,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 30% 35% at 5% 80%, rgba(24,226,153,0.03) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 max-w-[1200px] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
        {/* ── Left: copy ── */}
        <div>
          <h1
            className="text-[clamp(2.6rem,5.5vw,4.4rem)] font-semibold text-[#0d0d0d] leading-[1.06] mb-6"
            style={{ letterSpacing: "-1.8px" }}
          >
            Appointments that
            <br />
            manage{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #18E299 0%, #0fa76e 100%)",
              }}
            >
              themselves.
            </span>
          </h1>

          <p className="text-[17px] text-[#555555] leading-[1.65] max-w-[440px] mb-10">
            Smart reminders in your client&rsquo;s language. Instant reply
            understanding. Automatic review recovery &mdash; zero manual work.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <a
              href="/register"
              className="group inline-flex items-center gap-2 px-7 py-3 bg-[#0d0d0d] hover:bg-[#1a1a1a] text-white text-[15px] font-medium rounded-xl transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.08)]"
            >
              Get Started
              <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center px-7 py-3 text-[15px] text-[#0d0d0d] font-medium rounded-xl border border-[rgba(0,0,0,0.1)] hover:border-[rgba(0,0,0,0.2)] bg-white hover:bg-[#fafafa] transition-all"
            >
              Request Demo
            </a>
          </div>

          <p className="text-[13px] text-[#aaaaaa]">
            Free 14-day trial &middot; No credit card
          </p>
        </div>

        {/* ── Right: Vesk Engine demo ── */}
        <div className="relative">
          {/* Main dark card */}
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/[0.06] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.18),0_8px_24px_rgba(0,0,0,0.08)]">
            {/* Window chrome */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="flex gap-[6px]">
                  <div className="w-[9px] h-[9px] rounded-full bg-white/[0.08]" />
                  <div className="w-[9px] h-[9px] rounded-full bg-white/[0.08]" />
                  <div className="w-[9px] h-[9px] rounded-full bg-white/[0.08]" />
                </div>
                <span className="text-[13px] font-medium text-white/40">
                  Vesk Engine
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-[5px] h-[5px] rounded-full bg-brand animate-pulse" />
                <span className="font-mono text-[10px] font-medium text-brand/80 tracking-[0.8px] uppercase">
                  Demo
                </span>
              </div>
            </div>

            {/* Pipeline stages */}
            <div className="px-5 py-5 space-y-2.5">
              {/* Stage 1 — Outbound */}
              <div
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: stage >= 1 ? 1 : 0,
                  transform: stage >= 1 ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] font-medium text-white/25 tracking-[0.8px] uppercase">
                    ↗ Outbound
                  </span>
                  <span className="font-mono text-[10px] text-white/15">
                    09:14
                  </span>
                </div>
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3">
                  <p className="text-[13px] text-white/60 leading-[1.6]">
                    Bonjour Sarah, votre RDV est demain à 14h. Répondez OUI pour
                    confirmer.
                  </p>
                </div>
              </div>

              {/* Connector 1→2 */}
              <div
                className="flex justify-center transition-opacity duration-500"
                style={{ opacity: stage >= 2 ? 1 : 0 }}
              >
                <div className="w-px h-4 bg-gradient-to-b from-white/10 to-[rgba(24,226,153,0.25)]" />
              </div>

              {/* Stage 2 — Inbound + Classification */}
              <div
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: stage >= 2 ? 1 : 0,
                  transform: stage >= 2 ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] font-medium text-white/25 tracking-[0.8px] uppercase">
                    ↙ Inbound
                  </span>
                  <span className="font-mono text-[10px] text-white/15">
                    09:41
                  </span>
                </div>
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3">
                  <p className="text-[13px] text-white/60 leading-[1.6]">
                    &ldquo;{typedReply}&rdquo;
                    {stage >= 2 && typedReply.length < REPLY_TEXT.length && (
                      <span
                        className="inline-block w-[2px] h-[13px] bg-brand ml-0.5 align-middle"
                        style={{ animation: "blink-cursor 0.9s infinite" }}
                      />
                    )}
                  </p>

                  {/* Classification badge */}
                  <div
                    className="mt-3 pt-3 border-t border-white/[0.04] transition-all duration-700"
                    style={{ opacity: stage >= 4 ? 1 : 0 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px]">🧠</span>
                        <span className="font-mono text-[10px] font-medium text-brand tracking-[0.8px] uppercase">
                          Confirm
                        </span>
                      </div>
                      <span className="font-mono text-[12px] font-semibold text-brand tabular-nums">
                        {confidence}%
                      </span>
                    </div>
                    <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent tool trace — pattern adapted from Beautiful UI (MIT) */}
              <div
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: stage >= 3 ? 1 : 0,
                  transform: stage >= 3 ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <AgentTrace progress={toolProgress} />
              </div>

              {/* Connector 3→4 */}
              <div
                className="flex justify-center transition-opacity duration-500"
                style={{ opacity: stage >= 5 ? 1 : 0 }}
              >
                <div className="w-px h-4 bg-gradient-to-b from-[rgba(24,226,153,0.25)] to-[rgba(24,226,153,0.1)]" />
              </div>

              {/* Stage 4 — Action taken */}
              <div
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: stage >= 5 ? 1 : 0,
                  transform: stage >= 5 ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <div className="bg-[rgba(24,226,153,0.08)] border border-[rgba(24,226,153,0.15)] rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-brand text-[12px]">✓</span>
                    <span className="font-mono text-[10px] font-medium text-brand tracking-[0.8px] uppercase">
                      Action taken
                    </span>
                  </div>
                  <p className="text-[13px] text-white/50 leading-[1.5]">
                    Appointment confirmed · Reply: &ldquo;Parfait, à demain
                    Sarah!&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Status bar */}
            <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="font-mono text-[10px] text-white/20 tracking-[0.8px] uppercase">
                FR · EN
              </span>
              <span className="font-mono text-[10px] text-white/20 tracking-[0.8px] uppercase">
                Auto-act ≥ 0.85 · Escalate &lt; 0.75
              </span>
            </div>
          </div>

          {/* ── Floating badges ── */}
          <div
            className="absolute -top-4 -right-4 sm:-top-3 sm:-right-3 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] px-3.5 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center gap-2.5 transition-all duration-700"
            style={{
              opacity: stage >= 5 ? 1 : 0,
              transform: stage >= 5 ? "translateY(0)" : "translateY(-8px)",
              animation: stage >= 5 ? "float 5s ease-in-out infinite" : "none",
            }}
          >
            <div className="w-7 h-7 rounded-lg bg-[rgba(24,226,153,0.08)] flex items-center justify-center">
              <span className="text-[12px]">⭐</span>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#0d0d0d] leading-none">
                Review sent
              </p>
              <p className="text-[10px] text-[#aaaaaa] mt-0.5">
                Auto follow-up
              </p>
            </div>
          </div>

          <div
            className="absolute -bottom-4 -left-4 sm:-bottom-3 sm:-left-3 bg-white rounded-xl border border-[rgba(0,0,0,0.06)] px-3.5 py-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex items-center gap-2.5 transition-all duration-700"
            style={{
              opacity: stage >= 5 ? 1 : 0,
              transform: stage >= 5 ? "translateY(0)" : "translateY(8px)",
              animation:
                stage >= 5 ? "float 5s ease-in-out 0.6s infinite" : "none",
            }}
          >
            <div className="w-7 h-7 rounded-lg bg-[rgba(24,226,153,0.08)] flex items-center justify-center">
              <span className="text-[12px]">📊</span>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#0d0d0d] leading-none">
                97.5% intent accuracy
              </p>
              <p className="text-[10px] text-[#aaaaaa] mt-0.5">
                40-case eval set
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
