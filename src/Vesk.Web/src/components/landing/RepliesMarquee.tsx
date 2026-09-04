/**
 * Thin scrolling band under the hero. Every string here is a real inbound-reply case from the
 * committed eval set (`evals/cases.jsonl` — see `evals/results.md` for the per-case results),
 * so the band is illustrative without making a claim the repo can't back.
 */
const replies = [
  "Yes",
  "Oui je serai là",
  "👍",
  "Can we move it to Friday?",
  "cofnirm",
  "Je dois annuler",
  "maybe",
  "D'accord",
  "Cool, thanks!",
  "peut-etre",
  "What time is my appointment?",
  "😊",
  "Ouais pourquoi pas",
  "no problem",
  "Je veux changer l'heure",
  "C'est bon pour moi",
];

export default function RepliesMarquee() {
  /* Duplicate once so the -50% translate loops seamlessly */
  const items = [...replies, ...replies];

  return (
    <section className="py-12 border-y border-[rgba(0,0,0,0.05)] bg-[#fafafa] overflow-hidden">
      <p className="font-mono text-[10px] font-medium text-[#0fa76e] tracking-[1.2px] uppercase text-center mb-7">
        What clients actually text back
      </p>

      <div className="relative">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#fafafa] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#fafafa] to-transparent z-10 pointer-events-none" />

        {/* Track — pauses on hover, disabled for reduced-motion (see index.css) */}
        <div className="marquee-track flex items-center gap-3 w-max">
          {items.map((text, i) => (
            <span
              key={`${text}-${i}`}
              className="inline-flex items-center px-4 py-2 bg-white border border-[rgba(0,0,0,0.06)] rounded-full text-[13px] text-[#444444] whitespace-nowrap select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
