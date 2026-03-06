import { type ReactNode } from "react";
import { clsx } from "clsx";

/* ──────────────────────────────────────────────────────────────
   Card — Modular content container
   Variants: surface, elevated, interactive, outline
   ────────────────────────────────────────────────────────────── */

type CardVariant = "surface" | "elevated" | "interactive" | "outline";

interface CardProps {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  surface: "bg-bg-surface border border-border",
  elevated: "bg-bg-elevated border border-border shadow-md",
  interactive: [
    "bg-bg-surface border border-border",
    "cursor-pointer transition-all duration-300 ease-out",
    "hover:border-border-hover hover:bg-bg-elevated hover:shadow-lg",
    "active:scale-[0.985]",
  ].join(" "),
  outline: "bg-transparent border border-border",
};

const paddingStyles = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

function Card({
  variant = "surface",
  padding = "md",
  className,
  children,
  onClick,
}: CardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={clsx(
        "rounded-2xl overflow-hidden",
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </Component>
  );
}

/* ── Card sub-components for structured layouts ──────────────── */

function CardImage({
  src,
  alt,
  aspectRatio = "4/3",
  className,
}: {
  src: string;
  alt: string;
  aspectRatio?: string;
  className?: string;
}) {
  return (
    <div
      className={clsx("relative overflow-hidden bg-bg-elevated", className)}
      style={{ aspectRatio }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
    </div>
  );
}

function CardContent({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx("flex flex-col gap-1.5", className)}>{children}</div>;
}

function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={clsx("flex items-center justify-between pt-3 border-t border-border", className)}>
      {children}
    </div>
  );
}

export { Card, CardImage, CardContent, CardFooter, type CardProps };
