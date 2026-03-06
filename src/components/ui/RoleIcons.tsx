/* ──────────────────────────────────────────────────────────────
   Role Icons — Custom SVG icons for role selection
   ────────────────────────────────────────────────────────────── */

interface IconProps {
  className?: string;
}

export function RenterIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Graduation cap */}
      <path
        d="M32 12L8 24L32 36L56 24L32 12Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 28V40C16 40 20 44 32 44C44 44 48 40 48 40V28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M56 24V36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LandlordIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* House */}
      <path
        d="M32 8L12 24V52H52V24L32 8Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 52V36H40V52"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="20"
        y="28"
        width="8"
        height="8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="36"
        y="28"
        width="8"
        height="8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SellerIcon({ className = "w-12 h-12" }: IconProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shopping bag */}
      <path
        d="M12 20H52L48 52H16L12 20Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 24V16C22 13 24 12 32 12C40 12 42 13 42 16V24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="24"
        cy="32"
        r="2"
        fill="currentColor"
      />
      <circle
        cx="40"
        cy="32"
        r="2"
        fill="currentColor"
      />
    </svg>
  );
}
