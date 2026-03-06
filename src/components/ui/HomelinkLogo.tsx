import { Link } from "wouter";

/* ──────────────────────────────────────────────────────────────
   HomelinkLogo — Consistent brand logo component
   ────────────────────────────────────────────────────────────── */

interface HomelinkLogoProps {
  size?: "sm" | "md" | "lg";
  linkTo?: string;
  className?: string;
}

const sizeStyles = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

export function HomelinkLogo({ size = "md", linkTo = "/", className = "" }: HomelinkLogoProps) {
  const content = (
    <div className={`flex items-center gap-2 ${sizeStyles[size]} ${className}`}>
      <span className="font-bold tracking-tight text-accent">home</span>
      <span className="font-bold tracking-tight text-text-primary">link</span>
    </div>
  );

  if (linkTo) {
    return (
      <Link href={linkTo} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
