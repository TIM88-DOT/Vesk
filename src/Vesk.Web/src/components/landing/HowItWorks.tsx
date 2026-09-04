import { Upload, BrainCircuit, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useFadeIn } from "../../hooks/useFadeIn";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: Upload,
    title: "Connect",
    description:
      "Import clients via CSV or connect your booking system. Zero manual entry required.",
  },
  {
    number: "02",
    icon: BrainCircuit,
    title: "Automate",
    description:
      "AI sends reminders, understands replies, and handles confirmations instantly.",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "Grow",
    description:
      "Fewer no-shows, more reviews. Track everything from your real-time dashboard.",
  },
];

export default function HowItWorks() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      id="how-it-works"
      ref={ref}
      className={`py-28 px-6 md:px-8 fade-in-section ${visible ? "is-visible" : ""}`}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="rounded-3xl bg-[#0d0d0d] p-10 sm:p-16 relative overflow-hidden">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Green glow in corner */}
          <div
            className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 100% 0%, rgba(24,226,153,0.06) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-10">
            <div className="text-center mb-14">
              <p className="font-mono text-[10px] font-medium text-brand/80 tracking-[1.2px] uppercase mb-4">
                How It Works
              </p>
              <h2
                className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-semibold text-[#ededed] leading-[1.08]"
                style={{ letterSpacing: "-1px" }}
              >
                Three steps. That&rsquo;s it.
              </h2>
            </div>

            {/* Pipeline — horizontal on desktop, vertical on mobile */}
            <div className="hidden md:flex items-start gap-0">
              {steps.map((step, i) => (
                <div key={step.number} className="flex items-start flex-1">
                  {/* Step card */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                        <step.icon
                          className="w-5 h-5 text-brand"
                          strokeWidth={1.6}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-medium text-white/20 tracking-[0.8px] uppercase">
                        {step.number}
                      </span>
                    </div>

                    <h3
                      className="text-[22px] font-semibold text-[#ededed] mb-2"
                      style={{ letterSpacing: "-0.3px" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-[14px] text-white/40 leading-[1.6] pr-8">
                      {step.description}
                    </p>
                  </div>

                  {/* Animated connector */}
                  {i < steps.length - 1 && (
                    <div className="flex items-center pt-6 px-4 shrink-0">
                      <div className="pipeline-line w-12 h-[1px] bg-white/[0.08]" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile: vertical layout */}
            <div className="md:hidden space-y-0">
              {steps.map((step, i) => (
                <div key={step.number}>
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                        <step.icon
                          className="w-5 h-5 text-brand"
                          strokeWidth={1.6}
                        />
                      </div>
                      {i < steps.length - 1 && (
                        <div className="pipeline-line-v w-[1px] h-10 bg-white/[0.08] mt-3" />
                      )}
                    </div>
                    <div className="pt-1 pb-8">
                      <span className="font-mono text-[10px] font-medium text-white/20 tracking-[0.8px] uppercase">
                        {step.number}
                      </span>
                      <h3
                        className="text-[20px] font-semibold text-[#ededed] mt-1 mb-1.5"
                        style={{ letterSpacing: "-0.2px" }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-[14px] text-white/40 leading-[1.6]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
