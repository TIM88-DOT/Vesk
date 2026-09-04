/**
 * Agent tool-call trace for the hero demo.
 *
 * Pattern adapted from Beautiful UI (https://www.beautifului.dev, MIT) — its `thinking-state` and
 * `tool-chips` primitives: shimmering working header, vertical connector rail, staggered row entry,
 * spinner on the active step. Ported onto Vesk's own tokens rather than installing their
 * `foundation` layer, which ships a second `@theme` block (--ink/--surface/--font-sans) that would
 * collide with ours across every section of the page.
 *
 * The tool names are the real ones registered on ReplyHandlingAgent — see its ToolNames array.
 */

type IconKind = "read" | "think" | "run";

interface Step {
  tool: string;
  icon: IconKind;
}

/* Mirrors ReplyHandlingAgent.ToolNames for the confirm path. */
const steps: Step[] = [
  { tool: "get_customer_history", icon: "read" },
  { tool: "get_appointment_details", icon: "read" },
  { tool: "classify_intent", icon: "think" },
  { tool: "confirm_appointment", icon: "run" },
];

function ToolIcon({ kind }: { kind: IconKind }) {
  const common = {
    width: 11,
    height: 11,
    viewBox: "0 0 16 16",
    fill: "none" as const,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (kind === "think") {
    /* filled spark — the "reasoning" step */
    return (
      <svg {...common} aria-hidden="true">
        <path
          d="M8 1.5l1.6 4.3 4.4 1.6-4.4 1.6L8 13.4l-1.6-4.4L2 7.4l4.4-1.6z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (kind === "run") {
    return (
      <svg {...common} stroke="currentColor" aria-hidden="true">
        <path d="M4.5 2.8l8 5.2-8 5.2z" />
      </svg>
    );
  }

  return (
    <svg {...common} stroke="currentColor" aria-hidden="true">
      <path d="M3.5 2.2h6l3 3v8.6h-9z" />
      <path d="M9.2 2.4v3.1h3.1" />
    </svg>
  );
}

interface AgentTraceProps {
  /** How many steps have run. 0 hides the trace; >= steps.length settles it. */
  progress: number;
}

export default function AgentTrace({ progress }: AgentTraceProps) {
  const settled = progress >= steps.length;
  const visible = steps.slice(0, Math.max(progress, 0));

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
      {/* Working header */}
      <div className="flex items-center gap-2">
        <span className="text-brand">
          <ToolIcon kind="think" />
        </span>
        {settled ? (
          <span
            className="font-mono text-[10px] font-medium text-white/35 tracking-[0.8px] uppercase"
            style={{ animation: "fade-in 0.4s ease both" }}
          >
            Ran {steps.length} tools
          </span>
        ) : (
          <span className="agent-trace-shimmer font-mono text-[10px] font-medium tracking-[0.8px] uppercase">
            Working
          </span>
        )}
      </div>

      {/* Trace rows on a connector rail */}
      {visible.length > 0 && (
        <div className="relative mt-2.5 pl-[13px]">
          <span className="absolute left-[3px] top-1 bottom-1 w-px bg-white/[0.08]" />

          <div className="space-y-0.5">
            {visible.map((step, i) => {
              const done = i < progress - 1 || settled;
              return (
                <div
                  key={step.tool}
                  className="flex items-center gap-2 min-h-[22px]"
                  style={{
                    animation: `fade-up 0.3s cubic-bezier(0.23,1,0.32,1) both`,
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  <span className={done ? "text-brand/70" : "text-white/40"}>
                    <ToolIcon kind={step.icon} />
                  </span>

                  <span className="font-mono text-[11px] text-white/45 truncate">
                    {step.tool}
                  </span>

                  {done ? (
                    <span className="ml-auto text-brand/70 text-[10px] leading-none">
                      ✓
                    </span>
                  ) : (
                    <span
                      className="ml-auto w-[9px] h-[9px] rounded-full border border-white/20 border-t-brand shrink-0"
                      style={{ animation: "spin 0.7s linear infinite" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
