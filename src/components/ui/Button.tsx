import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";

/* ──────────────────────────────────────────────────────────────
   Button — Primary interactive element
   Variants: primary, secondary, ghost, danger
   Sizes:    sm, md, lg
   ────────────────────────────────────────────────────────────── */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: [
    "bg-accent text-white",
    "hover:bg-accent-hover active:bg-[#007CAB]",
    "shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/25",
  ].join(" "),
  secondary: [
    "bg-white/5 text-white border border-white/10",
    "hover:bg-white/10 hover:border-white/20",
    "active:bg-white/15",
  ].join(" "),
  ghost: [
    "bg-transparent text-text-secondary",
    "hover:bg-bg-hover hover:text-text-primary",
    "active:bg-bg-active",
  ].join(" "),
  danger: [
    "bg-error text-white",
    "hover:bg-[#DC2626] active:bg-[#B91C1C]",
    "shadow-sm hover:shadow-md",
  ].join(" "),
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 gap-1.5 text-[0.8125rem] rounded-lg",
  md: "h-10 px-4 gap-2 text-[0.875rem] rounded-xl",
  lg: "h-12 px-6 gap-2.5 text-[0.9375rem] rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon,
      iconRight,
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "inline-flex items-center justify-center font-semibold",
          "transition-all duration-200 ease-out",
          "select-none cursor-pointer",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : icon ? (
          <span className="shrink-0 [&>svg]:h-[1.125em] [&>svg]:w-[1.125em]">{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
        {iconRight && (
          <span className="shrink-0 [&>svg]:h-[1.125em] [&>svg]:w-[1.125em]">{iconRight}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, type ButtonProps };
