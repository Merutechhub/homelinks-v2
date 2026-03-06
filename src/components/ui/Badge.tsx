import { clsx } from "clsx";
import type { ReactNode } from "react";

/* ──────────────────────────────────────────────────────────────
   Badge — Status indicators, tags, labels
   ────────────────────────────────────────────────────────────── */

type BadgeVariant = "default" | "accent" | "success" | "warning" | "error";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-hover text-text-secondary",
  accent: "bg-accent-muted text-accent",
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  error: "bg-error-muted text-error",
};

function Badge({ variant = "default", size = "sm", dot, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 font-semibold rounded-full",
        size === "sm" ? "px-2 py-0.5 text-[0.6875rem]" : "px-2.5 py-1 text-[0.75rem]",
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={clsx(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning",
            variant === "error" && "bg-error",
            variant === "accent" && "bg-accent",
            variant === "default" && "bg-text-tertiary",
          )}
        />
      )}
      {children}
    </span>
  );
}

export { Badge, type BadgeProps };
