import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, MessageSquare, Sparkles } from "lucide-react";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import ValuePill from "../components/landing/ValuePill";
import ContactForm from "../components/contact/ContactForm";

const STEPS = [
  {
    icon: MessageSquare,
    title: "We read it ourselves",
    body: "No ticket queue and no bot triage, a human on the Vesk team picks it up.",
  },
  {
    icon: CalendarCheck,
    title: "You get a reply in a day",
    body: "Usually with a calendar link if you asked for a demo, or a straight answer if you didn't.",
  },
  {
    icon: Sparkles,
    title: "We tailor the walkthrough",
    body: "Reminders, SMS replies and review recovery, shown against your own booking volume.",
  },
];

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact | Vesk";
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="relative overflow-hidden px-6 pb-24 pt-32 md:px-8">
        {/* Same atmospheric wash as the hero, so the page reads as one site. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 45% at 50% 0%, rgba(24,226,153,0.07) 0%, transparent 70%),
              radial-gradient(ellipse 35% 35% at 85% 15%, rgba(24,226,153,0.05) 0%, transparent 60%)
            `,
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1200px]">
          <div className="max-w-2xl">
            <h1
              className="mb-5 text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-[1.08] text-[#0d0d0d]"
              style={{ letterSpacing: "-1.6px" }}
            >
              Tell us what you're
              <br />
              trying to <span className="text-brand-deep">automate.</span>
            </h1>

            <p className="mb-14 max-w-lg text-[17px] leading-[1.6] text-[#666666]">
              Book a demo, talk pricing, or ask a hard question about how the agents
              behave. Every message reaches a person on the team.
            </p>
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
            <ContactForm />

            <aside className="flex flex-col gap-4">
              <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <p className="mb-5 font-mono text-[10px] font-medium uppercase tracking-[1px] text-[#bbbbbb]">
                  What happens next
                </p>
                <ol className="space-y-5">
                  {STEPS.map(({ icon: Icon, title, body }, index) => (
                    <li key={title} className="flex gap-3.5">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#fafafa] border border-[rgba(0,0,0,0.05)]">
                        <Icon className="h-3.5 w-3.5 text-[#666666]" strokeWidth={2} />
                      </span>
                      <div>
                        <p className="mb-1 text-[14px] font-medium text-[#0d0d0d]">
                          <span className="mr-1.5 font-mono text-[10px] text-[#bbbbbb]">
                            0{index + 1}
                          </span>
                          {title}
                        </p>
                        <p className="text-[13px] leading-[1.55] text-[#777777]">{body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <p className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[1px] text-[#bbbbbb]">
                  Response times
                </p>
                {/* Inline flow, not flex: a flex container would put each text node on its
                  * own line and leave gaps around the pills. */}
                <p className="text-[13px] leading-[2] text-[#777777]">
                  Median first reply <ValuePill tone="brand">under 4 hours</ValuePill> on
                  weekdays, and <ValuePill>1 business day</ValuePill> at the outside.
                </p>
              </div>

              <div className="rounded-2xl border border-[rgba(0,0,0,0.05)] bg-[#fafafa] p-6">
                <p className="mb-1.5 text-[15px] font-medium text-[#0d0d0d]">
                  Rather just try it yourself?
                </p>
                <p className="mb-4 text-[13px] leading-[1.55] text-[#777777]">
                  The 14-day trial needs no card and no call. You can always reach us later.
                </p>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-[#0d0d0d] transition-colors hover:text-[#0fa76e]"
                >
                  Start free trial
                  <ArrowRight className="h-3.5 w-3.5 opacity-50 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
