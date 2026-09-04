/**
 * Pill primitive shared by the hero and features demos.
 *
 * Ported from Beautiful UI's `value-pill` (https://www.beautifului.dev, MIT). Its signature is a
 * `color-mix()` inset ring rather than a flat border, which reads cleaner at small sizes than a
 * 1px border does. Tones are remapped to Vesk's palette, and an `onDark` variant is added because
 * the hero card is near-black while the features grid is on white — the upstream component assumes
 * a single themed surface.
 */

export type PillTone = "neutral" | "brand" | "muted";

interface ValuePillProps {
  children: React.ReactNode;
  tone?: PillTone;
  /** Use the inverted palette for the dark hero card. */
  onDark?: boolean;
  /** Render in the monospace face — for codes, languages, thresholds. */
  mono?: boolean;
  className?: string;
}

const LIGHT: Record<PillTone, { color: string; bg: string; ring: string }> = {
  neutral: {
    color: "#444444",
    bg: "#fafafa",
    ring: "color-mix(in oklch, #0d0d0d 12%, transparent)",
  },
  brand: {
    color: "#0fa76e",
    bg: "rgba(24,226,153,0.07)",
    ring: "color-mix(in oklch, #18E299 32%, transparent)",
  },
  muted: {
    color: "#999999",
    bg: "transparent",
    ring: "color-mix(in oklch, #0d0d0d 10%, transparent)",
  },
};

const DARK: Record<PillTone, { color: string; bg: string; ring: string }> = {
  neutral: {
    color: "rgba(255,255,255,0.6)",
    bg: "rgba(255,255,255,0.05)",
    ring: "color-mix(in oklch, #ffffff 14%, transparent)",
  },
  brand: {
    color: "#18E299",
    bg: "rgba(24,226,153,0.1)",
    ring: "color-mix(in oklch, #18E299 34%, transparent)",
  },
  muted: {
    color: "rgba(255,255,255,0.3)",
    bg: "transparent",
    ring: "color-mix(in oklch, #ffffff 10%, transparent)",
  },
};

export default function ValuePill({
  children,
  tone = "neutral",
  onDark = false,
  mono = false,
  className = "",
}: ValuePillProps) {
  const t = (onDark ? DARK : LIGHT)[tone];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-[3px] align-middle text-[11px] font-medium leading-none ${
        mono ? "font-mono tracking-[0.4px]" : ""
      } ${className}`}
      style={{
        color: t.color,
        backgroundColor: t.bg,
        boxShadow: `inset 0 0 0 1px ${t.ring}`,
      }}
    >
      {children}
    </span>
  );
}
