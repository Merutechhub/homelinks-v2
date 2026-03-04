import { Link } from "wouter";
import { Search, Bell, Sparkles } from "lucide-react";
import BottomNav from "./BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:max-w-md md:mx-auto md:border-x md:border-border md:shadow-2xl relative overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border safe-area-pt">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/">
            <a className="font-display font-bold text-xl text-primary tracking-tight">
              Homelink.
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        {children}
      </main>

      {/* Floating Action Button (Budget Bite Quick Query) */}
      <Link href="/budget-bite">
        <button className="fixed bottom-20 right-4 z-40 bg-primary text-primary-foreground p-4 rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
          <Sparkles className="w-6 h-6" />
        </button>
      </Link>

      <BottomNav />
    </div>
  );
}