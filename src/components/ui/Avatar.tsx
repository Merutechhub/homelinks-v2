import { clsx } from "clsx";

/* ──────────────────────────────────────────────────────────────
   Avatar — User profile image with fallback initials
   ────────────────────────────────────────────────────────────── */

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  verified?: boolean;
  online?: boolean;
  className?: string;
}

const sizeStyles = {
  xs: "h-6 w-6 text-[0.5rem]",
  sm: "h-8 w-8 text-[0.625rem]",
  md: "h-10 w-10 text-[0.75rem]",
  lg: "h-12 w-12 text-[0.875rem]",
  xl: "h-16 w-16 text-[1rem]",
};

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function Avatar({ src, alt, name, size = "md", verified, online, className }: AvatarProps) {
  return (
    <div className={clsx("relative inline-flex shrink-0", className)}>
      {src ? (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          className={clsx(
            "rounded-full object-cover bg-bg-elevated",
            sizeStyles[size],
          )}
        />
      ) : (
        <div
          className={clsx(
            "rounded-full flex items-center justify-center font-bold",
            "bg-accent/15 text-accent",
            sizeStyles[size],
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {/* Online indicator */}
      {online && (
        <span
          className={clsx(
            "absolute bottom-0 right-0 rounded-full bg-success ring-2 ring-bg-base",
            size === "xs" || size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5",
          )}
        />
      )}

      {/* Verified badge */}
      {verified && (
        <span
          className={clsx(
            "absolute -bottom-0.5 -right-0.5 rounded-full bg-accent text-white flex items-center justify-center",
            size === "xs" || size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
          )}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-2.5 w-2.5">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </span>
      )}
    </div>
  );
}

export { Avatar, type AvatarProps };
