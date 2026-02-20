"use client";

import { useMemo, useState } from "react";
import { Plus, Trophy } from "lucide-react";
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
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
import { createId, toIsoDate } from "@/lib/utils";

const codingGuides: KnowledgeItem[] = [
  {
    title: "Topic Rotation",
    tag: "Practice",
    description: "Cycle problem sets to avoid overfitting one topic.",
    points: ["Day 1 arrays", "Day 2 trees", "Day 3 DP", "Day 4 mixed contests"],
  },
  {
    title: "Contest Review",
    tag: "Performance",
    description: "Most rating growth comes from post-contest analysis.",
    points: ["Re-solve unsolved questions", "Read top solutions", "Document template patterns"],
  },
  {
    title: "Difficulty Balance",
    tag: "Consistency",
    description: "Keep daily mix healthy across easy, medium, and hard.",
    points: ["Warm-up easy", "Core medium set", "One stretch hard"],
  },
];

export default function CodingPage() {
  const { state, updateState } = useCampus();

  const [platform, setPlatform] = useState("LeetCode");
  const [username, setUsername] = useState("");
  const [solved, setSolved] = useState(0);
  const [contests, setContests] = useState(0);
  const [rating, setRating] = useState(1200);
  const [easy, setEasy] = useState(0);
  const [medium, setMedium] = useState(0);
  const [hard, setHard] = useState(0);
  const [todaySolved, setTodaySolved] = useState(3);

  const totals = useMemo(() => {
    const totalSolved = state.coding.platforms.reduce((sum, item) => sum + item.solved, 0);
    const totalContests = state.coding.platforms.reduce((sum, item) => sum + item.contests, 0);
    const combinedRating = Math.round(
      state.coding.platforms.reduce((sum, item) => sum + item.rating, 0) /
        Math.max(state.coding.platforms.length, 1),
    );
    return { totalSolved, totalContests, combinedRating };
  }, [state.coding.platforms]);

  const difficultyData = useMemo(() => {
    return [
      {
        name: "Easy",
        value: state.coding.platforms.reduce((sum, item) => sum + item.easy, 0),
        color: "#34d399",
      },
      {
        name: "Medium",
        value: state.coding.platforms.reduce((sum, item) => sum + item.medium, 0),
        color: "#fbbf24",
      },
      {
        name: "Hard",
        value: state.coding.platforms.reduce((sum, item) => sum + item.hard, 0),
        color: "#fb7185",
      },
    ];
  }, [state.coding.platforms]);

  const leaderboard = useMemo(
    () => [...state.coding.platforms].sort((a, b) => b.rating - a.rating),
    [state.coding.platforms],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitive Programming Hub"
        description="Track platform usernames, solved counts, contests, ratings, topic progress and streak heatmap."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-2">
          <p className="text-xs text-slate-400">Total Solved</p>
          <p className="text-3xl font-black">{totals.totalSolved}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs text-slate-400">Contests</p>
          <p className="text-3xl font-black">{totals.totalContests}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs text-slate-400">Avg Rating</p>
          <p className="text-3xl font-black">{totals.combinedRating}</p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs text-slate-400">Active Platforms</p>
          <p className="text-3xl font-black">{state.coding.platforms.length}</p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add Platform Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              placeholder="Platform (LeetCode, Codeforces...)"
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
            />
            <Input
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={solved}
                onChange={(event) => setSolved(Number(event.target.value))}
                placeholder="Solved"
              />
              <Input
                type="number"
                value={contests}
                onChange={(event) => setContests(Number(event.target.value))}
                placeholder="Contests"
              />
              <Input
                type="number"
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                placeholder="Rating"
              />
              <Input
                type="number"
                value={easy}
                onChange={(event) => setEasy(Number(event.target.value))}
                placeholder="Easy solved"
              />
              <Input
                type="number"
                value={medium}
                onChange={(event) => setMedium(Number(event.target.value))}
                placeholder="Medium solved"
              />
              <Input
                type="number"
                value={hard}
                onChange={(event) => setHard(Number(event.target.value))}
                placeholder="Hard solved"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (!platform.trim() || !username.trim()) return;
                updateState((prev) => ({
                  ...prev,
                  coding: {
                    ...prev.coding,
                    platforms: [
                      {
                        id: createId("cp"),
                        platform: platform.trim(),
                        username: username.trim(),
                        solved,
                        contests,
                        rating,
                        easy,
                        medium,
                        hard,
                      },
                      ...prev.coding.platforms,
                    ],
                  },
                }));
                setUsername("");
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Save Platform
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Difficulty Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-72 space-y-4">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie data={difficultyData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.16)",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {difficultyData.map((item) => (
                <div key={item.name} className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <p>{item.name}</p>
                  <p className="text-lg font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Topic-wise Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.coding.topics.map((topic) => {
              const value = Math.round((topic.solved / Math.max(topic.target, 1)) * 100);
              return (
                <div key={topic.topic} className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{topic.topic}</p>
                    <p className="text-xs text-slate-400">
                      {topic.solved}/{topic.target}
                    </p>
                  </div>
                  <Progress value={value} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leaderboard View</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaderboard.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={index === 0 ? "success" : "slate"}>#{index + 1}</Badge>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.platform} • {item.username}
                    </p>
                    <p className="text-xs text-slate-400">{item.solved} solved</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-300">
                  <Trophy className="h-4 w-4" />
                  <span className="font-semibold">{item.rating}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Streak Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <div
              className="grid min-w-[680px] gap-1"
              style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}
            >
              {state.coding.dailyActivity.map((cell) => (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.count} solved`}
                  className="aspect-square rounded-sm"
                  style={{
                    background:
                      cell.count === 0
                        ? "rgba(100,116,139,0.2)"
                        : `rgba(34,211,238,${Math.min(0.25 + cell.count * 0.12, 0.95)})`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="number"
              min={0}
              value={todaySolved}
              onChange={(event) => setTodaySolved(Number(event.target.value))}
              className="w-40"
            />
            <Button
              variant="secondary"
              onClick={() => {
                const today = toIsoDate(new Date());
                updateState((prev) => ({
                  ...prev,
                  coding: {
                    ...prev.coding,
                    dailyActivity: prev.coding.dailyActivity.map((item) =>
                      item.date === today ? { ...item, count: todaySolved } : item,
                    ),
                  },
                }));
              }}
            >
              Update Today
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ratings Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={state.coding.platforms}>
              <XAxis dataKey="platform" tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.16)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="rating" fill="#22d3ee" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <KnowledgeSection
        title="Coding Improvement Playbook"
        description="Use structured practice loops to increase rating and interview readiness."
        items={codingGuides}
      />
    </div>
  );
}
