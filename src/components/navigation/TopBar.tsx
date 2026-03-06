import { clsx } from "clsx";
import { useLocation, Link } from "wouter";
import { Bell, Search, X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui";

/* ──────────────────────────────────────────────────────────────
   TopBar — Minimal header with logo, search, notifications
   Sticky on mobile, contextual on desktop
   ────────────────────────────────────────────────────────────── */

interface TopBarProps {
  user?: { name: string; avatarUrl?: string | null } | null;
  unreadNotifications?: number;
}

function TopBar({ user, unreadNotifications = 0 }: TopBarProps) {
  const [, navigate] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header
      className={clsx(
        "sticky top-0 z-[500]",
        "glass border-b border-border",
        "safe-top",
      )}
    >
      <div className="container-app flex items-center justify-between h-14">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          aria-label="Homelink home"
        >
          <span className="text-accent font-bold text-lg tracking-tight">
            home<span className="text-text-primary">link</span>
          </span>
        </Link>

        {/* Desktop nav links — hidden on mobile (bottom nav handles it) */}
        <nav className="hidden lg:flex items-center gap-1" role="navigation">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/explore">Explore</NavLink>
          <NavLink href="/housing">Housing</NavLink>
          <NavLink href="/marketplace">Market</NavLink>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={clsx(
              "relative h-9 w-9 flex items-center justify-center rounded-xl",
              "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
              "transition-colors duration-200",
            )}
            aria-label="Search"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>

          {/* Notifications */}
          <button
            onClick={() => navigate("/notifications")}
            className={clsx(
              "relative h-9 w-9 flex items-center justify-center rounded-xl",
              "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
              "transition-colors duration-200",
            )}
            aria-label={`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ""}`}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error" />
            )}
          </button>

          {/* Profile avatar — desktop only (mobile has bottom nav) */}
          <Link
            href="/profile"
            className="hidden lg:flex items-center ml-1"
          >
            <Avatar
              src={user?.avatarUrl}
              name={user?.name}
              size="sm"
            />
          </Link>
        </div>
      </div>

      {/* Expandable search bar */}
      {searchOpen && (
        <div className="container-app pb-3 animate-fade-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <input
              type="search"
              placeholder="Search housing, items, people..."
              autoFocus
              className={clsx(
                "w-full h-10 pl-10 pr-4 rounded-xl",
                "bg-bg-surface text-text-primary placeholder:text-text-tertiary",
                "border border-border focus:border-accent focus:ring-1 focus:ring-accent/30",
                "text-[0.875rem] font-medium",
                "transition-all duration-200 outline-none",
              )}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearchOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Desktop nav link ────────────────────────────────────────── */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [location] = useLocation();
  const active =
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <Link
      href={href}
      className={clsx(
        "px-3 py-1.5 rounded-lg text-[0.8125rem] font-medium",
        "transition-colors duration-200",
        active
          ? "text-accent bg-accent-muted"
          : "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
      )}
    >
      {children}
    </Link>
  );
}

export { TopBar };
