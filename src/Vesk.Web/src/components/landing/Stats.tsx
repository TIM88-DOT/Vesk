import { useEffect, useRef, useState } from "react";
import { useFadeIn } from "../../hooks/useFadeIn";

/* ── Animated counter hook ── */
function useCountUp(
  target: number,
  duration: number,
  shouldStart: boolean,
): number {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!shouldStart || started.current) return;
    started.current = true;

    let startTs: number | null = null;
    let raf: number;

    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;
      const progress = Math.min(elapsed / duration, 1);
      /* easeOutExpo, fast start, smooth settle */
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(eased * target);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, shouldStart]);

  return value;
}

/**
 * Every figure here is reproducible from the repo. Nothing is projected or customer-reported.
 * Accuracy / dangerous-misfire counts come from `evals/results.md` (40-case set, azure:gpt-4o-mini).
 * Test count is xUnit [Fact]/[Theory] methods across the three test projects.
 * Bounded contexts are the 9 modules enforced by the ArchUnitNET tests.
 */
interface StatDef {
  target: number;
  decimals?: number;
  suffix?: string;
  label: string;
  sub: string;
}

const stats: StatDef[] = [
  {
    target: 97.5,
    decimals: 1,
    suffix: "%",
    label: "Intent accuracy",
    sub: "39/40 on the bilingual eval set",
  },
  {
    target: 0,
    label: "Dangerous misfires",
    sub: "Wrong and confident enough to act",
  },
  {
    target: 210,
    label: "Automated tests",
    sub: "Unit, integration, architecture",
  },
  {
    target: 9,
    label: "Bounded contexts",
    sub: "Isolation enforced in CI",
  },
];

function AnimatedStat({ stat, started }: { stat: StatDef; started: boolean }) {
  const value = useCountUp(stat.target, 2200, started);
  const decimals = stat.decimals ?? 0;

  return (
    <div className="text-center py-4">
      <p
        className="text-[clamp(2.4rem,5vw,3.6rem)] font-semibold text-[#0d0d0d] leading-none mb-3 tabular-nums"
        style={{ letterSpacing: "-1.5px" }}
      >
        {value.toFixed(decimals)}
        {stat.suffix}
      </p>
      <p className="text-[14px] text-[#0d0d0d] font-medium mb-1">
        {stat.label}
      </p>
      <p className="text-[13px] text-[#aaaaaa]">{stat.sub}</p>
    </div>
  );
}

export default function Stats() {
  /* `visible` latches true once (useFadeIn unobserves on first intersection) and useCountUp
   * guards on a ref, so it doubles as the counter trigger, no mirrored state needed. */
  const { ref, visible } = useFadeIn();

  return (
    <section
      ref={ref}
      className={`py-28 px-6 md:px-8 fade-in-section ${visible ? "is-visible" : ""}`}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="rounded-3xl border border-[rgba(0,0,0,0.06)] bg-white p-10 sm:p-14 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={
                  i < stats.length - 1
                    ? "lg:border-r lg:border-[rgba(0,0,0,0.05)]"
                    : ""
                }
              >
                <AnimatedStat stat={stat} started={visible} />
              </div>
            ))}
          </div>

          <p className="text-center text-[12px] text-[#bbbbbb] mt-10 pt-8 border-t border-[rgba(0,0,0,0.05)]">
            Measured against the committed eval set and test suite, not projected
            outcomes. Vesk is pre-launch, so there is no customer data yet.
          </p>
        </div>
      </div>
    </section>
  );
}
