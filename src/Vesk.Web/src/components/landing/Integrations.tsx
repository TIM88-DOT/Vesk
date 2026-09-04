import {
  MessageSquare,
  CalendarSync,
  FileUp,
  Star,
  Link2,
  KeyRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useFadeIn } from "../../hooks/useFadeIn";
import ValuePill from "./ValuePill";

/**
 * Every entry here is implemented in the repo — Twilio behind ISmsProvider, IngestFromWebhook and
 * IngestFromCsv on IAppointmentSyncService, IPublicBookingService for the /book/:slug pages, the
 * review platform links used by ReviewRecoveryAgent, and AzureOpenAIClient for classification.
 * Nothing aspirational is listed without a Planned pill.
 */
interface Integration {
  icon: LucideIcon;
  name: string;
  detail: string;
  planned?: boolean;
}

const integrations: Integration[] = [
  {
    icon: MessageSquare,
    name: "Twilio SMS",
    detail:
      "Outbound sends and inbound reply webhooks, deduplicated by provider message SID.",
  },
  {
    icon: CalendarSync,
    name: "Booking system webhooks",
    detail:
      "Push appointments in from the system you already use. Idempotent on external ID.",
  },
  {
    icon: FileUp,
    name: "CSV import",
    detail:
      "Bring an existing customer list across, with consent source recorded per contact.",
  },
  {
    icon: Star,
    name: "Google & Facebook reviews",
    detail:
      "Review requests point at your own destination, rate-limited by a 30-day cooldown.",
  },
  {
    icon: Link2,
    name: "Public booking pages",
    detail:
      "A shareable /book/your-business page that writes straight into the same pipeline.",
  },
  {
    icon: KeyRound,
    name: "REST API & webhooks",
    detail: "Programmatic access for custom integrations on the Enterprise tier.",
    planned: true,
  },
];

export default function Integrations() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      id="integrations"
      ref={ref}
      className={`py-28 px-6 md:px-8 bg-[#fafafa] border-y border-[rgba(0,0,0,0.05)] fade-in-section ${visible ? "is-visible" : ""}`}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-14">
          <p className="font-mono text-[10px] font-medium text-[#0fa76e] tracking-[1.2px] uppercase mb-4">
            Integrations
          </p>
          <h2
            className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-semibold text-[#0d0d0d] leading-[1.08] mb-4"
            style={{ letterSpacing: "-1px" }}
          >
            Fits the stack you already run.
          </h2>
          <p className="text-[16px] text-[#777777] leading-[1.65] max-w-xl mx-auto">
            Vesk sits between your booking system and your customers. Keep
            taking bookings the way you do now — appointments flow in, messages
            flow out, and the history stays in one place.
          </p>
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children ${visible ? "is-visible" : ""}`}
        >
          {integrations.map((it) => (
            <div
              key={it.name}
              className="group rounded-2xl border border-[rgba(0,0,0,0.06)] bg-white p-6 hover:border-[rgba(0,0,0,0.12)] transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-[rgba(24,226,153,0.08)] flex items-center justify-center shrink-0 group-hover:bg-[rgba(24,226,153,0.12)] transition-colors">
                  <it.icon
                    className="w-[16px] h-[16px] text-[#0fa76e]"
                    strokeWidth={1.8}
                  />
                </div>
                <h3 className="text-[15px] font-semibold text-[#0d0d0d] leading-tight">
                  {it.name}
                </h3>
                {it.planned && (
                  <ValuePill tone="muted" mono className="ml-auto">
                    Planned
                  </ValuePill>
                )}
              </div>
              <p className="text-[13px] text-[#777777] leading-[1.6]">
                {it.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
