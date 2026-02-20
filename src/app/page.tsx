"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CircleCheckBig, Sparkles } from "lucide-react";
import {
  KnowledgeSection,
  type KnowledgeItem,
} from "@/components/content/knowledge-section";
import { InstallButton } from "@/components/pwa/install-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  "Unified dashboard for academics + placement prep",
  "Pomodoro focus engine with session analytics",
  "CGPA calculator with what-if predictions",
  "Placement pipeline tracker with offer/rejection logs",
  "Coding profile hub with streak heatmap",
  "Resume builder, notes, resource manager, and habits",
];

const faqs = [
  {
    q: "Does CAMPUSOS work without internet?",
    a: "Yes. After first load, core pages and your saved local data remain available offline.",
  },
  {
    q: "Is there any login or backend dependency?",
    a: "No backend and no auth required. Everything is private and stored on-device.",
  },
  {
    q: "Can I install it like an app?",
    a: "Yes. CAMPUSOS supports PWA install on desktop and mobile browsers.",
  },
];

const gettingStarted: KnowledgeItem[] = [
  {
    title: "Daily Loop",
    tag: "Habits",
    description: "Open dashboard each morning and close the day with review.",
    points: ["Check deadlines", "Log focus minutes", "Update streaks"],
  },
  {
    title: "Placement Sprint",
    tag: "Career",
    description: "Run weekly interview prep cycles with measurable outcomes.",
    points: ["Track applications", "Revise company kits", "Refresh resume versions"],
  },
  {
    title: "Academic Control",
    tag: "Study",
    description: "Map every subject to task, exam plan and note stack.",
    points: ["Set subject priorities", "Allocate revision slots", "Measure completion %"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),transparent_38%),radial-gradient(circle_at_70%_20%,_rgba(34,197,94,0.12),transparent_28%),#020617] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-cyan-400/20 p-2 text-cyan-200">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="text-lg font-bold">CAMPUSOS</p>
          </div>
          <Link href="/app">
            <Button variant="glass">Open App</Button>
          </Link>
        </header>

        <section className="grid gap-8 py-14 md:grid-cols-[1.1fr,0.9fr] md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <p className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
              The Operating System for Students
            </p>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Plan smarter.
              <span className="block bg-gradient-to-r from-cyan-200 to-emerald-200 bg-clip-text text-transparent">
                Crack placements faster.
              </span>
            </h1>
            <p className="max-w-xl text-base text-slate-300 md:text-lg">
              One productivity super-app for your daily student life: tasks, focus,
              exams, CGPA, coding, placements, resume and habits.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/app">
                <Button size="lg">
                  Launch Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <InstallButton className="h-11" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="app-grid glass rounded-3xl p-6"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">
              Daily command center
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Study Minutes", value: "175" },
                { label: "Upcoming Exams", value: "3" },
                { label: "Placement Readiness", value: "72%" },
                { label: "Coding Streak", value: "11 days" },
              ].map((item) => (
                <Card key={item.label} className="space-y-2 p-4">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="text-2xl font-bold">{item.value}</p>
                </Card>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="py-8 md:py-12">
          <h2 className="text-2xl font-bold md:text-3xl">Everything in one stack</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {features.map((item) => (
              <Card key={item} className="flex items-center gap-3 p-4">
                <CircleCheckBig className="h-4 w-4 text-cyan-300" />
                <p className="text-sm text-slate-200">{item}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-8 md:py-12">
          <h2 className="text-2xl font-bold md:text-3xl">Screenshots</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["Dashboard", "Focus System", "Placement Tracker"].map((label) => (
              <Card key={label} className="h-48 p-4">
                <p className="text-sm text-slate-300">{label}</p>
                <div className="mt-4 h-32 rounded-xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/20" />
              </Card>
            ))}
          </div>
        </section>

        <section className="py-8 md:py-12">
          <h2 className="text-2xl font-bold md:text-3xl">Testimonials</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {["CS Student, Tier-1", "Placement Coordinator", "Internship Mentor"].map(
              (label) => (
                <Card key={label} className="space-y-2 p-4">
                  <p className="text-sm text-slate-200">
                    Placeholder testimonial copy for early beta feedback.
                  </p>
                  <p className="text-xs text-cyan-200/80">{label}</p>
                </Card>
              ),
            )}
          </div>
        </section>

        <section className="py-8 md:py-12">
          <h2 className="text-2xl font-bold md:text-3xl">FAQ</h2>
          <div className="mt-6 space-y-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <summary className="cursor-pointer text-sm font-semibold text-white">
                  {item.q}
                </summary>
                <p className="pt-2 text-sm text-slate-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <KnowledgeSection
          title="How Students Use CAMPUSOS Daily"
          description="A practical operating rhythm to keep academics, coding, and placements aligned."
          items={gettingStarted}
          className="py-8 md:py-12"
        />

        <section className="py-12">
          <Card className="flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-bold">Install CAMPUSOS and use it daily</h3>
              <p className="text-sm text-slate-300">
                Save to your device and continue even when your network drops.
              </p>
            </div>
            <div className="flex gap-3">
              <InstallButton />
              <Link href="/app">
                <Button>Get Started</Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
