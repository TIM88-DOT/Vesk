/**
 * POST /api/contact — delivers a contact-page enquiry by email.
 *
 * Runs as a Vercel Edge Function next to the SPA, so the marketing site can
 * send mail without a round-trip through Vesk.Api (a prospect has no tenant,
 * and BaseEntity's tenant filter has nothing to scope them to).
 *
 * Configuration (Vercel project env vars):
 *   RESEND_API_KEY      required — https://resend.com/api-keys
 *   CONTACT_TO_EMAIL    required — inbox that receives enquiries
 *   CONTACT_FROM_EMAIL  optional — verified sender, defaults to Resend's sandbox
 *
 * Without the two required vars the endpoint answers 503 and the page tells the
 * visitor the form is offline rather than silently dropping the message.
 */

export const config = { runtime: "edge" };

const TOPICS = ["demo", "sales", "support", "partnership", "other"] as const;
type Topic = (typeof TOPICS)[number];

const TOPIC_LABELS: Record<Topic, string> = {
  demo: "Book a demo",
  sales: "Talk to sales",
  support: "Product support",
  partnership: "Partnership",
  other: "Something else",
};

interface ContactPayload {
  name: string;
  email: string;
  business?: string;
  topic: Topic;
  message: string;
  /** Honeypot — real people never fill this in. */
  website?: string;
}

const MAX = { name: 100, email: 200, business: 120, message: 4000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function isTopic(value: unknown): value is Topic {
  return typeof value === "string" && (TOPICS as readonly string[]).includes(value);
}

/** Reads a string field, trimmed, or returns null when absent/oversized. */
function str(source: Record<string, unknown>, key: string, max: number): string | null {
  const value = source[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > max ? null : trimmed;
}

function parse(body: unknown): ContactPayload | string {
  if (typeof body !== "object" || body === null) return "Malformed request body.";
  const source = body as Record<string, unknown>;

  const name = str(source, "name", MAX.name);
  if (!name) return "Name is required.";

  const email = str(source, "email", MAX.email);
  if (!email || !EMAIL_RE.test(email)) return "A valid email address is required.";

  const message = str(source, "message", MAX.message);
  if (!message || message.length < 10) return "Message must be at least 10 characters.";

  const topic = source.topic;
  if (!isTopic(topic)) return "Unknown topic.";

  return {
    name,
    email,
    message,
    topic,
    business: str(source, "business", MAX.business) ?? undefined,
    website: typeof source.website === "string" ? source.website : undefined,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHtml(payload: ContactPayload): string {
  const rows: [string, string][] = [
    ["Name", payload.name],
    ["Email", payload.email],
    ["Business", payload.business || "—"],
    ["Topic", TOPIC_LABELS[payload.topic]],
  ];

  const cells = rows
    .map(
      ([label, value]) =>
        `<tr>
           <td style="padding:4px 16px 4px 0;color:#888;font-size:13px;">${escapeHtml(label)}</td>
           <td style="padding:4px 0;color:#0d0d0d;font-size:13px;">${escapeHtml(value)}</td>
         </tr>`,
    )
    .join("");

  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;color:#0d0d0d;">
      <p style="font-size:15px;margin:0 0 16px;">New enquiry from the Vesk contact page.</p>
      <table style="border-collapse:collapse;margin-bottom:20px;">${cells}</table>
      <div style="border-top:1px solid #e5e5e5;padding-top:16px;font-size:14px;line-height:1.55;white-space:pre-wrap;">${escapeHtml(
        payload.message,
      )}</div>
    </div>`;
}

function renderText(payload: ContactPayload): string {
  return [
    `New enquiry from the Vesk contact page.`,
    ``,
    `Name:     ${payload.name}`,
    `Email:    ${payload.email}`,
    `Business: ${payload.business || "—"}`,
    `Topic:    ${TOPIC_LABELS[payload.topic]}`,
    ``,
    payload.message,
  ].join("\n");
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "Vesk <onboarding@resend.dev>";

  if (!apiKey || !to) {
    return json({ error: "Contact delivery is not configured." }, 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Malformed request body." }, 400);
  }

  const parsed = parse(body);
  if (typeof parsed === "string") {
    return json({ error: parsed }, 400);
  }

  // Honeypot: accept and drop, so bots get no signal that they were caught.
  if (parsed.website) {
    return json({ ok: true }, 202);
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: parsed.email,
      subject: `[Vesk] ${TOPIC_LABELS[parsed.topic]} — ${parsed.name}`,
      html: renderHtml(parsed),
      text: renderText(parsed),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Resend rejected the contact enquiry", response.status, detail);
    return json({ error: "Could not deliver the message." }, 502);
  }

  return json({ ok: true }, 202);
}
