import { Link, useLocation } from "wouter";
import { Home, HomeIcon, Store, UtensilsCrossed, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { name: "Discover", path: "/", icon: Home },
    { name: "Housing", path: "/housing", icon: HomeIcon },
    { name: "Marketplace", path: "/marketplace", icon: Store },
    { name: "Budget Bite", path: "/budget-bite", icon: UtensilsCrossed },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border safe-area-pb">
      <nav className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <a className="flex flex-col items-center justify-center w-full h-full gap-1 text-xs font-medium transition-colors">
                <item.icon
                  className={cn(
                    "w-6 h-6 transition-all duration-200",
                    isActive ? "text-primary scale-110" : "text-muted-foreground"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </span>
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}