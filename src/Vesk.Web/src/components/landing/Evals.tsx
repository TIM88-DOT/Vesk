import { useFadeIn } from "../../hooks/useFadeIn";

/**
 * Replaces the previous testimonials section. Vesk has no customers yet, so invented quotes were
 * removed. This shows the real ablation from `evals/results.md` + `evals/results.ablation.md`:
 * the same 40-case set run with and without the acknowledgment rule in the classifier prompt.
 */
interface RunResult {
  heading: string;
  caption: string;
  accuracy: string;
  dangerous: string;
  good: boolean;
}

const runs: RunResult[] = [
  {
    heading: "With the acknowledgment rule",
    caption: "Shipped configuration",
    accuracy: "97.5%",
    dangerous: "0",
    good: true,
  },
  {
    heading: "Without it",
    caption: "Ablation run",
    accuracy: "87.5%",
    dangerous: "2",
    good: false,
  },
];

/* Real rows from the ablation run, cases the guardrail rescued. */
const rescued = [
  { msg: "Parfait merci", lang: "fr", got: "Confirm", conf: "0.85" },
  { msg: "D'accord", lang: "fr", got: "Confirm", conf: "0.90" },
];

export default function Evals() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      ref={ref}
      className={`py-28 px-6 md:px-8 bg-[#fafafa] fade-in-section ${visible ? "is-visible" : ""}`}
    >
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-14">
          <p className="font-mono text-[10px] font-medium text-[#0fa76e] tracking-[1.2px] uppercase mb-4">
            Evals
          </p>
          <h2
            className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold text-[#0d0d0d] leading-[1.08] mb-4"
            style={{ letterSpacing: "-1px" }}
          >
            The guardrail, measured.
          </h2>
          <p className="text-[16px] text-[#777777] leading-[1.6] max-w-xl mx-auto">
            An LLM classifies every inbound SMS, but deterministic C# decides
            whether to act on it. Here is the same 40-case bilingual eval set,
            run with and without the acknowledgment rule.
          </p>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {runs.map((run) => (
            <div
              key={run.heading}
              className={`rounded-2xl border p-7 bg-white transition-all duration-300 ${
                run.good
                  ? "border-[rgba(24,226,153,0.3)] shadow-[0_1px_3px_rgba(24,226,153,0.06)]"
                  : "border-[rgba(0,0,0,0.06)]"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#0d0d0d] mb-0.5">
                    {run.heading}
                  </h3>
                  <p className="font-mono text-[10px] text-[#bbbbbb] tracking-[0.6px] uppercase">
                    {run.caption}
                  </p>
                </div>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    run.good ? "bg-brand" : "bg-[#d45656]"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p
                    className="text-[2rem] font-semibold text-[#0d0d0d] leading-none mb-1.5 tabular-nums"
                    style={{ letterSpacing: "-1px" }}
                  >
                    {run.accuracy}
                  </p>
                  <p className="text-[12px] text-[#999999]">Accuracy</p>
                </div>
                <div>
                  <p
                    className={`text-[2rem] font-semibold leading-none mb-1.5 tabular-nums ${
                      run.good ? "text-[#0fa76e]" : "text-[#d45656]"
                    }`}
                    style={{ letterSpacing: "-1px" }}
                  >
                    {run.dangerous}
                  </p>
                  <p className="text-[12px] text-[#999999]">Dangerous</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What "dangerous" means + the rescued cases */}
        <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-7">
          <p className="text-[14px] text-[#555555] leading-[1.7] mb-5">
            A <strong className="text-[#0d0d0d] font-semibold">dangerous</strong>{" "}
            failure is the only kind that reaches a customer: the model was wrong{" "}
            <em>and</em> confident enough that the system would have acted on it.
            Without the rule, two French acknowledgements were read as
            confirmations and would have auto-confirmed a booking nobody agreed
            to.
          </p>

          <div className="space-y-2">
            {rescued.map((r) => (
              <div
                key={r.msg}
                className="flex flex-wrap items-center gap-2 p-3 bg-[#fafafa] rounded-lg border border-[rgba(0,0,0,0.04)]"
              >
                <span className="font-mono text-[12px] text-[#0d0d0d] bg-white px-2 py-0.5 rounded border border-[rgba(0,0,0,0.06)]">
                  &ldquo;{r.msg}&rdquo;
                </span>
                <span className="font-mono text-[10px] text-[#bbbbbb] uppercase tracking-[0.6px]">
                  {r.lang}
                </span>
                <span className="text-[#cccccc] text-[12px]">→</span>
                <span className="font-mono text-[11px] text-[#d45656]">
                  {r.got} @ {r.conf}
                </span>
                <span className="ml-auto font-mono text-[10px] text-[#0fa76e] tracking-[0.6px] uppercase">
                  ✓ Caught by rule
                </span>
              </div>
            ))}
          </div>

          <p className="text-[12px] text-[#bbbbbb] mt-5">
            Reproducible via <code className="font-mono">npm run eval</code>.
            Full per-case results are committed in{" "}
            <code className="font-mono">evals/results.md</code>.
          </p>
        </div>
      </div>
    </section>
  );
}
