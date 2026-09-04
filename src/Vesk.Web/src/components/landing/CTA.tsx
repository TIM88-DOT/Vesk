import { ArrowRight } from "lucide-react";
import { useFadeIn } from "../../hooks/useFadeIn";

export default function CTA() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      ref={ref}
      className={`py-28 px-6 md:px-8 fade-in-section ${visible ? "is-visible" : ""}`}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="rounded-3xl bg-[#0d0d0d] px-10 sm:px-16 py-20 text-center relative overflow-hidden">
          {/* Background accents */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(ellipse 50% 60% at 50% 120%, rgba(24,226,153,0.08) 0%, transparent 70%),
                radial-gradient(ellipse 30% 40% at 10% 0%, rgba(24,226,153,0.04) 0%, transparent 50%)
              `,
            }}
          />

          <div className="relative z-10">
            <h2
              className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold text-[#ededed] leading-[1.12] mb-4"
              style={{ letterSpacing: "-1px" }}
            >
              Ready to put appointments
              <br />
              on autopilot?
            </h2>

            <p className="text-[15px] text-white/40 mb-10 max-w-md mx-auto">
              Start your free 14-day trial. No credit card required.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
              <a
                href="/register"
                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-white hover:bg-white/90 text-[#0d0d0d] text-[15px] font-medium rounded-xl transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
              >
                Get Started
                <ArrowRight className="w-4 h-4 opacity-40 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center px-8 py-3.5 text-[15px] text-white/70 hover:text-white font-medium rounded-xl border border-white/10 hover:border-white/20 transition-all"
              >
                Request Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
