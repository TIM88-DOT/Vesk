/** Public contact address. Forwarded to the team inbox via the getvesk.app MX records. */
export const CONTACT_EMAIL = "hello@getvesk.app";

/**
 * Builds a mailto link with a pre-filled subject, so enquiries arrive already sorted by what the
 * visitor clicked rather than all landing as "(no subject)".
 */
export function contactMailto(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
