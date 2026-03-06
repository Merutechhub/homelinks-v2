import { type ReactNode } from "react";
import { TopBar } from "@/components/navigation/TopBar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { useAuthStore } from "@/store/authStore";

/* ──────────────────────────────────────────────────────────────
   AppShell — Main layout wrapper for authenticated pages
   TopBar (sticky header) + Content + BottomNav (mobile)
   ────────────────────────────────────────────────────────────── */

interface AppShellProps {
  children: ReactNode;
}

function AppShell({ children }: AppShellProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <TopBar
        user={user ? { name: user.name, avatarUrl: user.avatarUrl } : null}
        unreadNotifications={0}
      />

      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>

      <BottomNav unreadMessages={0} />
    </div>
  );
}

export { AppShell };
