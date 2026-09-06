import type { ReactNode } from "react";

/**
 * Beautiful UI `Shimmer` — https://www.beautifului.dev/r/shimmer.json
 * Vendored verbatim; reads the `ink` ramp from the token layer in index.css.
 */

/** Shimmering label — signals the agent is processing. */
export function Shimmer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--color-ink-3) 35%, var(--color-ink) 50%, var(--color-ink-3) 65%)",
        backgroundSize: "200% 100%",
        animation: "shimmer-text 1.8s linear infinite",
      }}
    >
      {children}
    </span>
  );
}
