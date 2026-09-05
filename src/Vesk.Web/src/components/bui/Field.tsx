import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

/**
 * Form controls in the Beautiful UI idiom (https://www.beautifului.dev).
 *
 * The registry ships no input primitive, so these are authored against the
 * same foundation tokens its components use — inset field fill, hairline ring,
 * accent focus ring, `control` radius — so they sit flush with the vendored
 * `Button`, `ValuePill` and `EntityChip`.
 */

const controlBase = `w-full rounded-control bg-field px-3 py-2.5 text-[14px] text-ink
  placeholder:text-ink-3 shadow-inset-field outline-none
  transition-[box-shadow,background-color] duration-150 ease-out
  focus:bg-canvas focus:shadow-[0_0_0_1px_var(--color-accent-ink),0_0_0_4px_var(--color-accent-tint)]
  disabled:opacity-50`;

const controlInvalid =
  "shadow-[0_0_0_1px_var(--color-error)] focus:shadow-[0_0_0_1px_var(--color-error),0_0_0_4px_rgba(212,86,86,0.16)]";

/** Label + control + inline error, wired for `aria-describedby`. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  optional,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink">
          {label}
        </label>
        {optional && (
          <span className="font-mono text-[11px] uppercase tracking-[0.6px] text-ink-3">
            Optional
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-[12px] text-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${htmlFor}-hint`} className="mt-1.5 text-[12px] text-ink-3">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function TextInput({
  invalid,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(controlBase, invalid && controlInvalid, className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function TextArea({
  invalid,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(controlBase, "resize-y leading-[1.55]", invalid && controlInvalid, className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

/** Single-select pill row — the registry's chip treatment used as a control. */
export function ChoiceChips<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              `rounded-full px-3 py-1.5 text-[13px] font-medium leading-none
               transition-[background-color,color,box-shadow,transform] duration-150 ease-out
               active:scale-[0.96]`,
              selected
                ? "bg-ink text-canvas shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                : "bg-field text-ink-2 shadow-hairline hover:bg-hover-2 hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
