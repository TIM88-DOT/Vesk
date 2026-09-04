import { useFadeIn } from "../../hooks/useFadeIn";

/**
 * Sits between the hero and the features grid. Its job is orientation: who this is for and why
 * the problem matters. Deliberately makes no claim about traction or measured outcomes. Those
 * numbers live in the Stats and Evals sections, where the committed eval set backs them.
 */
const audiences = [
  "Salons",
  "Clinics",
  "Spas",
  "Barbershops",
  "Dental practices",
  "Studios",
];

export default function Audience() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      ref={ref}
      className={`py-24 px-6 md:px-8 bg-[#fafafa] border-y border-[rgba(0,0,0,0.05)] fade-in-section ${visible ? "is-visible" : ""}`}
    >
      <div className="max-w-[860px] mx-auto text-center">
        <p className="font-mono text-[10px] font-medium text-[#0fa76e] tracking-[1.2px] uppercase mb-6">
          Who it&rsquo;s for
        </p>

        <h2
          className="text-[clamp(1.5rem,3.2vw,2.2rem)] font-semibold text-[#0d0d0d] leading-[1.25] mb-5"
          style={{ letterSpacing: "-0.8px" }}
        >
          A no-show isn&rsquo;t a missed message.
          <br className="hidden sm:block" />{" "}
          <span className="text-[#999999]">
            It&rsquo;s an empty chair you can&rsquo;t resell.
          </span>
        </h2>

        <p className="text-[16px] text-[#777777] leading-[1.65] max-w-lg mx-auto mb-10">
          When your day is booked in slots, every gap costs you twice: the
          appointment you lost, and the one you turned away to hold it.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {audiences.map((name) => (
            <span
              key={name}
              className="px-4 py-1.5 text-[13px] font-medium text-[#666666] bg-white border border-[rgba(0,0,0,0.06)] rounded-full"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
