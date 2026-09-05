import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { buttonVariants, type ButtonProps } from "./buttonVariants";

/**
 * Beautiful UI `Button` — https://www.beautifului.dev/r/button.json
 * The variant table lives in `buttonVariants.ts`.
 */
export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
