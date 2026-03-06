import { forwardRef, type InputHTMLAttributes, type ReactNode, useState } from "react";
import { clsx } from "clsx";
import { Eye, EyeOff } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Input — Text field with label, icon, error, and password toggle
   ────────────────────────────────────────────────────────────── */

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "h-9 text-[0.8125rem]",
  md: "h-11 text-[0.875rem]",
  lg: "h-12 text-[0.9375rem]",
};

const iconPositionStyles = {
  sm: "left-3 top-1/2 -translate-y-1/2",
  md: "left-3 top-1/2 -translate-y-1/2",
  lg: "left-3.5 top-1/2 -translate-y-1/2",
};

const paddingStyles = {
  sm: {
    base: "px-3",
    withIcon: "pl-10 pr-3",
    withPassword: "pl-3 pr-10",
    withBoth: "pl-10 pr-10",
  },
  md: {
    base: "px-3.5",
    withIcon: "pl-10 pr-3.5",
    withPassword: "pl-3.5 pr-10",
    withBoth: "pl-10 pr-10",
  },
  lg: {
    base: "px-4",
    withIcon: "pl-11 pr-4",
    withPassword: "pl-4 pr-11",
    withBoth: "pl-11 pr-11",
  },
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, size = "md", type, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    // Determine padding based on icon presence
    const getPadding = () => {
      if (icon && isPassword) return paddingStyles[size].withBoth;
      if (icon) return paddingStyles[size].withIcon;
      if (isPassword) return paddingStyles[size].withPassword;
      return paddingStyles[size].base;
    };

    return (
      <div className="flex flex-col">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary mb-2">
            {label}
            {props.required && <span className="text-error ml-0.5">*</span>}
          </label>
        )}
        {hint && !error && (
          <p className="text-xs text-text-tertiary mb-2">{hint}</p>
        )}

        <div className="relative">
          {icon && (
            <span className={clsx(
              "absolute text-text-tertiary pointer-events-none",
              iconPositionStyles[size],
              "[&>svg]:h-[18px] [&>svg]:w-[18px]"
            )}>
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? "text" : type}
            className={clsx(
              "w-full rounded-xl font-medium",
              "bg-bg-surface text-text-primary placeholder:text-text-tertiary",
              "border border-border",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
              "overflow-hidden text-ellipsis",
              error && "border-error focus:border-error focus:ring-error/30",
              sizeStyles[size],
              getPadding(),
              className,
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors p-1"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-1.5 mt-1.5">
            <svg className="w-3.5 h-3.5 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-error leading-tight">{error}</p>
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input, type InputProps };
