import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "../bui/Button";
import { Shimmer } from "../bui/Shimmer";
import { Field, TextInput, TextArea, ChoiceChips } from "../bui/Field";
import ValuePill from "../landing/ValuePill";
import {
  CONTACT_TOPICS,
  ContactError,
  submitContactEnquiry,
  type ContactTopic,
} from "../../lib/contact";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  business: z.string().max(120, "Business name is too long").optional().or(z.literal("")),
  topic: z.enum(["demo", "sales", "support", "partnership", "other"]),
  message: z
    .string()
    .min(10, "Tell us a little more, 10 characters minimum")
    .max(4000, "Message is too long"),
  /** Honeypot: hidden from real visitors, so anything here is a bot. */
  website: z.string().max(0).optional().or(z.literal("")),
});

type ContactFormValues = z.infer<typeof contactSchema>;

type Sent = { name: string; email: string; topic: ContactTopic };

const FAILURE_MESSAGES: Record<string, string> = {
  unconfigured:
    "Our contact inbox is offline right now. Please try again shortly, nothing was lost on your end.",
  invalid: "Something in the form was rejected. Check the fields above and try again.",
  failed: "The message could not be delivered. Please try again in a moment.",
};

export default function ContactForm() {
  const [sent, setSent] = useState<Sent | null>(null);
  const [failure, setFailure] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { topic: "demo", business: "", website: "" },
  });

  const topic = useWatch({ control, name: "topic" });

  const onSubmit = async (values: ContactFormValues) => {
    setFailure("");
    try {
      await submitContactEnquiry({
        name: values.name,
        email: values.email,
        business: values.business || undefined,
        topic: values.topic,
        message: values.message,
        website: values.website || undefined,
      });
      setSent({ name: values.name, email: values.email, topic: values.topic });
      reset({ topic: "demo", business: "", website: "" });
    } catch (error) {
      const kind = error instanceof ContactError ? error.kind : "failed";
      setFailure(FAILURE_MESSAGES[kind]);
    }
  };

  if (sent) {
    return <SentReceipt sent={sent} onReset={() => setSent(null)} />;
  }

  return (
    <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.06)]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {failure && (
          <div
            role="alert"
            className="rounded-xl bg-[rgba(212,86,86,0.06)] px-4 py-3 text-[13px] leading-[1.5] text-error border border-[rgba(212,86,86,0.2)]"
          >
            {failure}
          </div>
        )}

        <div>
          <p className="mb-2.5 font-mono text-[10px] font-medium uppercase tracking-[1px] text-[#bbbbbb]">
            What's this about?
          </p>
          <ChoiceChips
            name="Reason for contact"
            options={CONTACT_TOPICS}
            value={topic}
            onChange={(next) => setValue("topic", next, { shouldValidate: true })}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name" htmlFor="contact-name" error={errors.name?.message}>
            <TextInput
              id="contact-name"
              autoComplete="name"
              placeholder="Jane Doe"
              invalid={!!errors.name}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              {...register("name")}
            />
          </Field>

          <Field label="Work email" htmlFor="contact-email" error={errors.email?.message}>
            <TextInput
              id="contact-email"
              type="email"
              autoComplete="email"
              placeholder="jane@salonbelleza.com"
              invalid={!!errors.email}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              {...register("email")}
            />
          </Field>
        </div>

        <Field
          label="Business"
          htmlFor="contact-business"
          optional
          error={errors.business?.message}
          hint="Helps us tailor the demo to your bookings volume."
        >
          <TextInput
            id="contact-business"
            autoComplete="organization"
            placeholder="Salon Belleza"
            invalid={!!errors.business}
            {...register("business")}
          />
        </Field>

        <Field label="Message" htmlFor="contact-message" error={errors.message?.message}>
          <TextArea
            id="contact-message"
            rows={5}
            placeholder="Tell us about your business, how many appointments you run a week, and what you'd like Vesk to handle."
            invalid={!!errors.message}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            {...register("message")}
          />
        </Field>

        {/* Honeypot: off-screen, never announced, never tabbable. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>

        <div className="flex flex-col gap-3 border-t border-[rgba(0,0,0,0.05)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] leading-[1.8] text-[#777777]">
            We reply within <ValuePill tone="brand">1 business day</ValuePill>
          </p>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="group w-full !rounded-xl sm:w-auto"
          >
            {isSubmitting ? (
              <Shimmer>Sending…</Shimmer>
            ) : (
              <>
                Send message
                <ArrowRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function SentReceipt({ sent, onReset }: { sent: Sent; onReset: () => void }) {
  const topicLabel = CONTACT_TOPICS.find((t) => t.value === sent.topic)?.label ?? sent.topic;

  return (
    <div
      className="rounded-2xl bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.06)]"
      style={{ animation: "fade-up 400ms var(--ease-out-strong) both" }}
    >
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex size-7 items-center justify-center rounded-full bg-brand-light">
          <Check className="h-4 w-4 text-brand-deep" strokeWidth={2.5} />
        </span>
        <h2 className="text-[19px] font-semibold tracking-[-0.4px] text-[#0d0d0d]">
          Message sent
        </h2>
      </div>

      <p className="mb-6 text-[15px] leading-[1.6] text-[#666666]">
        Thanks {sent.name.split(" ")[0]}, it's on its way. We'll reply to{" "}
        <span className="font-medium text-[#0d0d0d]">{sent.email}</span> within one business day.
      </p>

      <dl className="mb-6 divide-y divide-[rgba(0,0,0,0.05)] rounded-xl bg-[#fafafa] px-4 border border-[rgba(0,0,0,0.05)]">
        <Row label="Topic">
          <ValuePill tone="brand">{topicLabel}</ValuePill>
        </Row>
        <Row label="Reply to">
          <span className="text-[13px] text-[#0d0d0d]">{sent.email}</span>
        </Row>
        <Row label="Status">
          <ValuePill tone="brand">Delivered</ValuePill>
        </Row>
      </dl>

      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={onReset}
        className="!rounded-xl"
      >
        Send another message
      </Button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="font-mono text-[10px] uppercase tracking-[1px] text-[#bbbbbb]">{label}</dt>
      <dd className="flex items-center">{children}</dd>
    </div>
  );
}
