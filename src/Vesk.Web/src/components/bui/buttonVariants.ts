import { cva, type VariantProps } from "class-variance-authority";

/**
 * Variant table for the Beautiful UI `Button`
 * (https://www.beautifului.dev/r/button.json).
 *
 * Kept out of `Button.tsx` so that file only exports a component, which is what
 * the react-refresh lint rule requires. Two token swaps onto Vesk's palette:
 * `bg-surface` -> `bg-card` (Vesk uses `surface` for the page grey) and the
 * `accent` variant, which resolves to the brand green.
 */
const filledShadow = "shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]";

/* Pill-shaped by default — the app's core button style. Explicit symmetric
 * padding (not a fixed height) so the top/bottom spacing is always equal. */
export const buttonVariants = cva(
  `inline-flex items-center justify-center font-medium select-none
   transition-[transform,background-color,opacity] duration-150 ease-out
   active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none`,
  {
    variants: {
      variant: {
        primary: `bg-ink text-canvas hover:opacity-90 ${filledShadow}`,
        secondary: "bg-card text-ink shadow-btn hover:bg-inset aria-expanded:bg-hover",
        ghost: "bg-hover-2 text-ink hover:bg-line-strong",
        accent: `bg-accent text-ink hover:bg-accent-ink hover:text-white ${filledShadow}`,
        success: `bg-green text-white hover:brightness-95 ${filledShadow}`,
        /* transparent until hovered — for dense toolbars/action rows */
        quiet: "text-ink hover:bg-hover",
      },
      size: {
        /* compact toolbar pill — fixed height, lighter weight */
        xs: "h-7 rounded-full px-2.5 text-[12px] font-normal leading-none gap-1",
        /* canonical action pill — 27px tall, roomy sides */
        sm: "h-[27px] px-3 text-[13px] leading-none rounded-full gap-1.5",
        md: "px-4 py-[9px] text-sm leading-none rounded-full gap-2",
        /* marketing-scale pill — the landing page's CTA proportions */
        lg: "px-6 py-3 text-[15px] leading-none rounded-full gap-2",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export type ButtonProps = VariantProps<typeof buttonVariants>;
export type ButtonVariant = NonNullable<ButtonProps["variant"]>;
