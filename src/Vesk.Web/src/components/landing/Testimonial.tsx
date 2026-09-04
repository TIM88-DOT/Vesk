import { Star } from "lucide-react";
import { useFadeIn } from "../../hooks/useFadeIn";

interface TestimonialData {
  quote: string;
  name: string;
  role: string;
  business: string;
  stars: number;
}

const testimonials: TestimonialData[] = [
  {
    quote:
      "Vesk reduced our no-shows by 45% in the first month. The AI writes better reminders than we ever did — in both French and English.",
    name: "Emily R.",
    role: "Owner",
    business: "Belleza Salon, Toronto",
    stars: 5,
  },
  {
    quote:
      "Mes clients reçoivent un rappel au bon moment, dans leur langue. Je n'ai plus besoin d'appeler chacun manuellement. C'est magique.",
    name: "Karim B.",
    role: "Manager",
    business: "Studio Coupe, Montréal",
    stars: 5,
  },
  {
    quote:
      "The review recovery feature tripled our Google reviews in two months. Clients love the personalized follow-up after their visit.",
    name: "Dr. Lauren M.",
    role: "Director",
    business: "Riverside Clinic, Vancouver",
    stars: 5,
  },
];

export default function Testimonial() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      ref={ref}
      className={`py-28 px-6 md:px-8 bg-[#fafafa] fade-in-section ${visible ? "is-visible" : ""}`}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-[10px] font-medium text-[#0fa76e] tracking-[1.2px] uppercase mb-4">
            Testimonials
          </p>
          <h2
            className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold text-[#0d0d0d] leading-[1.08]"
            style={{ letterSpacing: "-1px" }}
          >
            Loved by businesses like yours.
          </h2>
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children ${visible ? "is-visible" : ""}`}
        >
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-8 flex flex-col hover:border-[rgba(0,0,0,0.1)] transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-brand text-brand"
                    strokeWidth={0}
                  />
                ))}
              </div>

              <p className="text-[14px] text-[#444444] leading-[1.75] flex-1 mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-5 border-t border-[rgba(0,0,0,0.05)]">
                <div className="w-9 h-9 rounded-full bg-[rgba(24,226,153,0.08)] flex items-center justify-center text-[13px] font-semibold text-[#0fa76e]">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#0d0d0d]">
                    {t.name}
                  </p>
                  <p className="text-[12px] text-[#aaaaaa]">
                    {t.role} · {t.business}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
