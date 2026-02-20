"use client";

import { useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarClock,
  ChartNoAxesCombined,
  ClipboardCheck,
  Code2,
  Focus,
  Goal,
  GraduationCap,
  Home,
  Menu,
  NotebookPen,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { InstallButton } from "@/components/pwa/install-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: Home },
  { href: "/app/study-planner", label: "Study Planner", icon: BookOpen },
  { href: "/app/focus", label: "Focus System", icon: Focus },
  { href: "/app/exams", label: "Exam Planner", icon: CalendarClock },
  { href: "/app/cgpa", label: "CGPA Calculator", icon: GraduationCap },
  { href: "/app/placement", label: "Placement Tracker", icon: BriefcaseBusiness },
  { href: "/app/coding", label: "Coding Hub", icon: Code2 },
  { href: "/app/company-kits", label: "Company Kits", icon: ClipboardCheck },
  { href: "/app/resume", label: "Resume Builder", icon: NotebookPen },
  { href: "/app/notes", label: "Notes", icon: NotebookPen },
  { href: "/app/resources", label: "Resource Hub", icon: Sparkles },
  { href: "/app/goals", label: "Goals & Habits", icon: Goal },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1.5">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/app" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
              isActive
                ? "bg-cyan-400/15 text-cyan-200"
                : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const title = useMemo(() => {
    const match = navItems.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
    return match?.label ?? "CAMPUSOS";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),transparent_35%),radial-gradient(circle_at_bottom,_rgba(14,116,144,0.16),transparent_38%),#020617] text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-slate-950/70 p-5 backdrop-blur-2xl lg:block">
        <Link href="/" className="mb-6 flex items-center gap-2">
          <div className="rounded-lg bg-cyan-400/20 p-2 text-cyan-200">
            <ChartNoAxesCombined className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Student OS</p>
            <p className="text-lg font-bold">CAMPUSOS</p>
          </div>
        </Link>

        <SidebarNav pathname={pathname} />

        <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 text-xs text-cyan-100">
          <p className="font-semibold">Daily momentum</p>
          <p className="mt-1 text-cyan-100/80">
            Keep the streak alive. Ship 1% progress today.
          </p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">CAMPUSOS</p>
              <h2 className="hidden text-lg font-semibold text-white md:block">{title}</h2>
            </div>
            <InstallButton className="hidden sm:inline-flex" />
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-6 md:py-8">{children}</main>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70 lg:hidden"
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="h-full w-72 border-r border-white/10 bg-slate-950 p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <Link href="/" onClick={() => setMobileOpen(false)} className="font-semibold">
                  CAMPUSOS
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SidebarNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              <InstallButton className="mt-5 w-full" />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
