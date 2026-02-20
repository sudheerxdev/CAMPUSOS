"use client";

import { useMemo, useState } from "react";
import { Award, Flame, Plus } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  KnowledgeSection,
  type KnowledgeItem,
} from "@/components/content/knowledge-section";
import { PageHeader } from "@/components/layout/page-header";
import { useCampus } from "@/components/providers/campus-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { createId } from "@/lib/utils";
import type { GoalHabit } from "@/lib/types";

const behaviorGuides: KnowledgeItem[] = [
  {
    title: "Atomic Targets",
    tag: "Design",
    description: "Define goals small enough to finish even on busy days.",
    points: ["Minimum viable action", "Clear done condition", "No ambiguity"],
  },
  {
    title: "Streak Protection",
    tag: "Consistency",
    description: "Use backup actions to avoid breaking streaks.",
    points: ["2-minute fallback", "Travel-day version", "Low-energy version"],
  },
  {
    title: "Weekly Reset",
    tag: "Reflection",
    description: "Adjust targets weekly based on completion reality.",
    points: ["Raise if easy", "Reduce if unrealistic", "Keep momentum over perfection"],
  },
];

export default function GoalsPage() {
  const { state, updateState } = useCampus();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<GoalHabit["type"]>("goal");
  const [target, setTarget] = useState(10);

  const chartData = useMemo(
    () =>
      state.goals.map((item) => ({
        name: item.title.slice(0, 12),
        progress: Math.round((item.progress / Math.max(item.target, 1)) * 100),
      })),
    [state.goals],
  );

  const badges = useMemo(() => {
    const unlocked: string[] = [];
    if (state.goals.some((goal) => goal.streak >= 7)) unlocked.push("7-Day Consistency");
    if (state.goals.some((goal) => goal.streak >= 30)) unlocked.push("30-Day Discipline");
    if (state.goals.every((goal) => goal.progress >= goal.target * 0.8)) unlocked.push("80% Milestone");
    return unlocked;
  }, [state.goals]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goal & Habit Tracker"
        description="Track daily goals, habit streaks, progress insights and achievement badges."
      />

      <section className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create Goal/Habit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Goal title"
            />
            <Select
              value={type}
              onChange={(event) => setType(event.target.value as GoalHabit["type"])}
            >
              <option value="goal">Goal</option>
              <option value="habit">Habit</option>
            </Select>
            <Input
              type="number"
              value={target}
              min={1}
              onChange={(event) => setTarget(Number(event.target.value))}
              placeholder="Target value"
            />
            <Button
              className="w-full"
              onClick={() => {
                if (!title.trim()) return;
                updateState((prev) => ({
                  ...prev,
                  goals: [
                    ...prev.goals,
                    {
                      id: createId("goal"),
                      type,
                      title: title.trim(),
                      target,
                      progress: 0,
                      streak: 0,
                      doneToday: false,
                    },
                  ],
                }));
                setTitle("");
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Visualization</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.16)",
                    borderRadius: 12,
                  }}
                />
                <Line type="monotone" dataKey="progress" stroke="#22d3ee" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Goals & Habits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.goals.map((goal) => {
            const percentage = Math.round((goal.progress / Math.max(goal.target, 1)) * 100);
            return (
              <div key={goal.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{goal.title}</p>
                    <p className="text-xs text-slate-400">
                      {goal.type.toUpperCase()} • {goal.progress}/{goal.target}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={goal.type === "habit" ? "success" : "slate"}>
                      {goal.type}
                    </Badge>
                    <Badge variant="warning">
                      <Flame className="mr-1 h-3 w-3" />
                      {goal.streak}
                    </Badge>
                  </div>
                </div>
                <Progress value={percentage} />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      updateState((prev) => ({
                        ...prev,
                        goals: prev.goals.map((item) =>
                          item.id === goal.id
                            ? {
                                ...item,
                                progress: Math.min(item.target, item.progress + 1),
                              }
                            : item,
                        ),
                      }))
                    }
                  >
                    +1 Progress
                  </Button>
                  <Button
                    size="sm"
                    variant={goal.doneToday ? "default" : "outline"}
                    onClick={() =>
                      updateState((prev) => ({
                        ...prev,
                        goals: prev.goals.map((item) =>
                          item.id === goal.id
                            ? {
                                ...item,
                                doneToday: !item.doneToday,
                                streak: item.doneToday ? Math.max(0, item.streak - 1) : item.streak + 1,
                              }
                            : item,
                        ),
                      }))
                    }
                  >
                    {goal.doneToday ? "Undo Today" : "Mark Today Done"}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Achievement Badges
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {badges.length ? (
            badges.map((badge) => (
              <Badge key={badge} variant="success">
                {badge}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-slate-300">
              Keep consistent progress to unlock badges.
            </p>
          )}
        </CardContent>
      </Card>

      <KnowledgeSection
        title="Behavior Science Tips"
        description="Use practical habit design principles to improve long-term consistency."
        items={behaviorGuides}
      />
    </div>
  );
}
