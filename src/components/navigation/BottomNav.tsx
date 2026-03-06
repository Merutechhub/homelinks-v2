import { clsx } from "clsx";
import { useLocation, Link } from "wouter";
import { Home, Search, MessageCircle, User, Plus } from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   BottomNav — Pinterest-inspired mobile bottom navigation
   5 tabs, thumb-optimized, persistent across app sections
   ────────────────────────────────────────────────────────────── */

interface BottomNavProps {
  unreadMessages?: number;
}

interface NavTab {
  path: string;
  label: string;
  icon: typeof Home;
  /** Match these paths too for active state */
  matchPaths?: string[];
}

const tabs: NavTab[] = [
  { path: "/", label: "Home", icon: Home },
  { path: "/explore", label: "Explore", icon: Search },
  { path: "/create", label: "Create", icon: Plus },
  { path: "/messages", label: "Messages", icon: MessageCircle },
  { path: "/profile", label: "Profile", icon: User },
];

function BottomNav({ unreadMessages = 0 }: BottomNavProps) {
  const [location] = useLocation();

  const isActive = (tab: NavTab) => {
    if (tab.path === "/" && location === "/") return true;
    if (tab.path !== "/" && location.startsWith(tab.path)) return true;
    return tab.matchPaths?.some((p) => location.startsWith(p)) ?? false;
  };

  return (
    <nav
      className={clsx(
        "fixed bottom-0 inset-x-0 z-[500]",
        "glass border-t border-border",
        "safe-bottom",
        "lg:hidden", // Hide on desktop
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = isActive(tab);
          const isCreate = tab.path === "/create";
          const Icon = tab.icon;

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className={clsx(
                "relative flex flex-col items-center justify-center",
                "w-16 h-full",
                "transition-all duration-200 ease-out",
                "select-none",
                isCreate
                  ? "" // Create button has special styling
                  : active
                    ? "text-accent"
                    : "text-text-tertiary hover:text-text-secondary",
              )}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
            >
              {/* Create button: elevated accent circle */}
              {isCreate ? (
                <span
                  className={clsx(
                    "flex items-center justify-center",
                    "h-10 w-10 rounded-full",
                    "bg-accent text-text-inverse",
                    "shadow-md",
                    "transition-transform duration-200",
                    "active:scale-90",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                </span>
              ) : (
                <>
                  <span className="relative">
                    <Icon
                      className={clsx(
                        "h-[22px] w-[22px] transition-all duration-200",
                        active && "scale-105",
                      )}
                      strokeWidth={active ? 2.25 : 1.75}
                    />

                    {/* Unread badge on messages */}
                    {tab.path === "/messages" && unreadMessages > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-error text-[10px] font-bold text-white px-1">
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </span>
                    )}
                  </span>

                  <span
                    className={clsx(
                      "text-[10px] font-medium mt-0.5 leading-none",
                      "transition-colors duration-200",
                    )}
                  >
                    {tab.label}
                  </span>

                  {/* Active indicator dot */}
                  {active && (
                    <span className="absolute bottom-1 h-[3px] w-4 rounded-full bg-accent" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { BottomNav };
