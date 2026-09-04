const businesses = [
  "Belleza Salon",
  "Riverside Clinic",
  "Spa Jasmin",
  "North Barber Co.",
  "Centre Dentaire",
  "Studio Beauté",
];

export default function SocialProof() {
  /* Duplicate for seamless infinite scroll */
  const items = [...businesses, ...businesses];

  return (
    <section className="py-14 border-y border-[rgba(0,0,0,0.05)] bg-[#fafafa] overflow-hidden">
      <p className="font-mono text-[10px] font-medium text-[#aaaaaa] tracking-[1px] uppercase text-center mb-8">
        Trusted by appointment-based businesses
      </p>

      <div className="relative">
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#fafafa] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#fafafa] to-transparent z-10 pointer-events-none" />

        {/* Marquee track */}
        <div
          className="flex items-center gap-10 w-max"
          style={{ animation: "marquee 30s linear infinite" }}
        >
          {items.map((name, i) => (
            <span key={`${name}-${i}`} className="flex items-center gap-10">
              <span className="text-[16px] font-semibold text-[#bbb] whitespace-nowrap select-none tracking-[-0.2px]">
                {name}
              </span>
              <span className="w-1 h-1 rounded-full bg-[rgba(0,0,0,0.08)] shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
