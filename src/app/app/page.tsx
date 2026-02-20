"use client";

import Link from "next/link";
import { CalendarCheck2, Code2, Flame, Target } from "lucide-react";
import {
  KnowledgeSection,
  type KnowledgeItem,
} from "@/components/content/knowledge-section";
import {
  Area,
  AreaChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/widgets/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCampus } from "@/components/providers/campus-provider";
import { formatShortDate, toIsoDate } from "@/lib/utils";

const dashboardGuides: KnowledgeItem[] = [
  {
    title: "Morning Briefing",
    tag: "Routine",
    description: "Start with the top three outcomes that matter today.",
    points: ["Pick 1 academic target", "Pick 1 placement target", "Pick 1 coding target"],
  },
  {
    title: "Energy-Based Planning",
    tag: "Productivity",
    description: "Do high-focus work in first sessions and admin tasks later.",
    points: ["Deep work before noon", "Meetings in low-energy slots", "Review after dinner"],
  },
  {
    title: "Weekly Retrospective",
    tag: "Improvement",
    description: "Use dashboard trends to correct weak systems quickly.",
    points: ["Check streak drops", "Review missed deadlines", "Set next 7-day priorities"],
  },
];

export default function DashboardPage() {
  const { state } = useCampus();
  const today = toIsoDate(new Date());

  const todaysTasks = state.tasks.filter((task) => task.dueDate === today && task.status !== "done");
  const studyMinutesToday = state.focus.dailyMinutes[today] ?? 0;
  const upcomingExams = state.exams
    .filter((exam) => exam.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  const placementReadiness = Math.round(
    (state.placement.checklist.filter((item) => item.done).length /
      Math.max(state.placement.checklist.length, 1)) *
      100,
  );
  const codingSolved = state.coding.platforms.reduce((sum, item) => sum + item.solved, 0);
  const activeGoals = state.goals.filter((goal) => goal.progress < goal.target).length;
  const bestStreak = Math.max(
    state.focus.streak,
    ...state.goals.map((goal) => goal.streak),
    0,
  );

  const focusTrend = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = toIsoDate(date);
    return {
      date: formatShortDate(key),
      minutes: state.focus.dailyMinutes[key] ?? 0,
    };
  });

  const taskBreakdown = [
    {
      name: "Todo",
      value: state.tasks.filter((task) => task.status === "todo").length,
      color: "#f97316",
    },
    {
      name: "In Progress",
      value: state.tasks.filter((task) => task.status === "in-progress").length,
      color: "#22d3ee",
    },
    {
      name: "Done",
      value: state.tasks.filter((task) => task.status === "done").length,
      color: "#34d399",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unified Dashboard"
        description="Your complete student command center with study, coding, placement and goal intelligence."
        actions={
          <Link href="/app/study-planner">
            <Button>New Task</Button>
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Today's Tasks"
          value={`${todaysTasks.length}`}
          hint="Tasks due today"
          icon={<CalendarCheck2 className="h-4 w-4 text-cyan-200" />}
        />
        <MetricCard
          label="Study Time"
          value={`${studyMinutesToday} min`}
          hint="Focused minutes logged today"
          icon={<Target className="h-4 w-4 text-cyan-200" />}
        />
        <MetricCard
          label="Coding Solved"
          value={`${codingSolved}`}
          hint="Across all connected platforms"
          icon={<Code2 className="h-4 w-4 text-cyan-200" />}
        />
        <MetricCard
          label="Top Streak"
          value={`${bestStreak} days`}
          hint="Longest active streak"
          icon={<Flame className="h-4 w-4 text-cyan-200" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr,0.7fr]">
        <Card className="p-4">
          <CardHeader>
            <div>
              <CardTitle>Focus Trend (7 Days)</CardTitle>
              <p className="text-sm text-slate-300">Daily focus minutes</p>
            </div>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={focusTrend}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.16)",
                    borderRadius: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  stroke="#22d3ee"
                  fillOpacity={1}
                  fill="url(#focusGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mx-auto h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    stroke="none"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.16)",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm">
              {taskBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </div>
                  <span>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExams.map((exam) => {
                const progress = Math.round((exam.preparedTopics / Math.max(exam.totalTopics, 1)) * 100);
                return (
                  <div key={exam.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-medium text-white">{exam.subject}</p>
                      <Badge variant="slate">{formatShortDate(exam.date)}</Badge>
                    </div>
                    <Progress value={progress} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { href: "/app/focus", label: "Start Focus" },
              { href: "/app/exams", label: "Add Exam" },
              { href: "/app/placement", label: "Track Application" },
              { href: "/app/coding", label: "Update Coding Stats" },
              { href: "/app/goals", label: "Mark Habit Done" },
              { href: "/app/resume", label: "Edit Resume" },
            ].map((item) => (
              <Link key={item.href + item.label} href={item.href}>
                <Button variant="secondary" className="w-full justify-start">
                  {item.label}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="space-y-3">
          <p className="text-sm text-slate-300">Placement Readiness</p>
          <p className="text-3xl font-bold">{placementReadiness}%</p>
          <Progress value={placementReadiness} />
        </Card>
        <Card className="space-y-3">
          <p className="text-sm text-slate-300">Active Goals</p>
          <p className="text-3xl font-bold">{activeGoals}</p>
          <p className="text-xs text-slate-400">Keep shipping daily progress to maintain streaks.</p>
        </Card>
      </section>

      <KnowledgeSection
        title="Dashboard Playbook"
        description="Use these operating rules to turn data into daily execution."
        items={dashboardGuides}
      />
    </div>
  );
}
