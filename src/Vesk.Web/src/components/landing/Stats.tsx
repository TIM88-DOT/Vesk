import { useEffect, useRef, useState, useCallback } from "react";
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
      /* easeOutExpo — fast start, smooth settle */
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, shouldStart]);

  return value;
}

/* ── Stat data ── */
interface StatDef {
  /** Numeric part to animate */
  target: number;
  /** Text before the number */
  prefix: string;
  /** Text after the number */
  suffix: string;
  label: string;
  sub: string;
}

const stats: StatDef[] = [
  {
    target: 98,
    prefix: "",
    suffix: "%",
    label: "Delivery rate",
    sub: "SMS delivered successfully",
  },
  {
    target: 2,
    prefix: "<",
    suffix: "s",
    label: "AI response",
    sub: "From reply to action",
  },
  {
    target: 40,
    prefix: "",
    suffix: "%",
    label: "Fewer no-shows",
    sub: "Average reduction",
  },
  {
    target: 3,
    prefix: "",
    suffix: "×",
    label: "More reviews",
    sub: "In the first 60 days",
  },
];

function AnimatedStat({
  stat,
  started,
}: {
  stat: StatDef;
  started: boolean;
}) {
  const value = useCountUp(stat.target, 2200, started);

  return (
    <div className="text-center py-4">
      <p
        className="text-[clamp(2.4rem,5vw,3.6rem)] font-semibold text-[#0d0d0d] leading-none mb-3 tabular-nums"
        style={{ letterSpacing: "-1.5px" }}
      >
        {stat.prefix}
        {value}
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
  const { ref, visible } = useFadeIn();

  /* Only start counters once visible */
  const [started, setStarted] = useState(false);
  const didStart = useCallback(() => {
    if (visible && !started) setStarted(true);
  }, [visible, started]);

  useEffect(didStart, [didStart]);

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
                <AnimatedStat stat={stat} started={started} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
