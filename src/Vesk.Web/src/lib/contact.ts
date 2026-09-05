import axios from "axios";

/**
 * Client for POST /api/contact — the Vercel Edge Function in `api/contact.ts`
 * that mails the enquiry on. It sits outside `/api/v1`, so it deliberately
 * does not go through the `api` / `publicApi` axios instances.
 */

export const CONTACT_TOPICS = [
  { value: "demo", label: "Book a demo" },
  { value: "sales", label: "Talk to sales" },
  { value: "support", label: "Product support" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Something else" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

export interface ContactEnquiry {
  name: string;
  email: string;
  business?: string;
  topic: ContactTopic;
  message: string;
  /** Honeypot — bound to a hidden field and always empty for real visitors. */
  website?: string;
}

export type ContactFailure = "unconfigured" | "invalid" | "failed";

export class ContactError extends Error {
  readonly kind: ContactFailure;

  constructor(kind: ContactFailure, message: string) {
    super(message);
    this.name = "ContactError";
    this.kind = kind;
  }
}

/**
 * Sends an enquiry. Resolves on delivery (202); otherwise throws a
 * {@link ContactError} whose `kind` tells the page which message to show.
 */
export async function submitContactEnquiry(enquiry: ContactEnquiry): Promise<void> {
  let status: number;
  let data: unknown;

  try {
    const response = await axios.post("/api/contact", enquiry, {
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true,
    });
    status = response.status;
    data = response.data;
  } catch {
    throw new ContactError("failed", "The network request did not complete.");
  }

  // Some hosts answer an unmatched /api path with the SPA shell, so a 200 that
  // is not JSON also means the function is not there.
  if (status === 200 && typeof data === "string") {
    throw new ContactError("unconfigured", "The contact endpoint is not running.");
  }

  if (status === 202 || status === 200) return;

  const message =
    typeof data === "object" && data !== null && typeof (data as { error?: unknown }).error === "string"
      ? (data as { error: string }).error
      : "The message could not be delivered.";

  // 404: the function is not deployed (or `vite dev` is running without
  // `vercel dev`). 503: deployed, but RESEND_API_KEY / CONTACT_TO_EMAIL is unset.
  if (status === 404 || status === 503) throw new ContactError("unconfigured", message);
  if (status === 400) throw new ContactError("invalid", message);
  throw new ContactError("failed", message);
}
