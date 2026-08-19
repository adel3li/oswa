import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { BookOpen, Home, Settings, PenLine } from "lucide-react";
import { getTodayFormatted } from "../lib/date";

export function MainLayout() {
  const loc = useLocation();
  const { gregorian, hijri } = getTodayFormatted();

  const navs = [
    { to: "/", icon: Home, label: "اليوم" },
    { to: "/browse", icon: BookOpen, label: "المحاور" },
    { to: "/journal", icon: PenLine, label: "السجل" },
    { to: "/settings", icon: Settings, label: "الإعدادات" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-brand-bg)] text-white font-sans selection:bg-[var(--color-brand-accent)] selection:text-white pb-24 sm:pb-0 relative overflow-hidden">
      <nav className="h-20 flex items-center justify-between px-6 sm:px-10 border-b border-white/10 bg-[var(--color-brand-bg)]/80 backdrop-blur-md z-10 sticky top-0 w-full sm:max-w-[1024px] mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-accent)] flex items-center justify-center font-bold text-xl">أ</div>
          <span className="text-2xl font-bold tracking-tight">أُسْوة</span>
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm opacity-60">{hijri}</div>
          <div className="text-xs opacity-40">{gregorian}</div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-3xl mx-auto sm:mb-24 flex flex-col overflow-y-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 w-full sm:w-[1024px] sm:left-1/2 sm:-translate-x-1/2 h-24 border-t border-white/10 bg-[var(--color-brand-bg)]/90 backdrop-blur-md z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex h-full items-center justify-around sm:justify-center sm:gap-20 px-6 sm:px-20">
          {navs.map(n => {
            const active = loc.pathname === n.to || (n.to !== '/' && loc.pathname.startsWith(n.to));
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to} className={cn("flex flex-col items-center gap-1.5 cursor-pointer group transition-opacity", active ? "opacity-100" : "opacity-40 hover:opacity-100")}>
                <div className={cn("w-6 h-6 flex items-center justify-center", active ? "text-[var(--color-brand-accent)]" : "text-white")}>
                  <Icon size={24} />
                </div>
                <span className={cn("text-xs font-medium", active ? "text-[var(--color-brand-accent)] font-bold" : "text-white")}>{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
