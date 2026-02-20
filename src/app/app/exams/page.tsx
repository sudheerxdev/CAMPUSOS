"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { createId, dayDiffFromNow, formatShortDate, toIsoDate } from "@/lib/utils";

const examGuides: KnowledgeItem[] = [
  {
    title: "Revision Waves",
    tag: "Method",
    description: "Split prep into three passes: coverage, consolidation, recall.",
    points: ["Pass 1: breadth", "Pass 2: problem zones", "Pass 3: timed recall"],
  },
  {
    title: "Countdown Strategy",
    tag: "Schedule",
    description: "As exam date approaches, increase mock testing intensity.",
    points: ["T-14 to T-7: mixed revision", "T-7 to T-2: past papers", "T-1: light recap"],
  },
  {
    title: "Score Optimization",
    tag: "Performance",
    description: "Track topic readiness against target score to allocate effort.",
    points: ["High-weight topics first", "Formula sheet refresh", "Last-day confidence pass"],
  },
];

export default function ExamsPage() {
  const { state, updateState } = useCampus();
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(toIsoDate(new Date()));
  const [targetScore, setTargetScore] = useState(85);
  const [topics, setTopics] = useState(10);
  const [scheduleText, setScheduleText] = useState("Revision plan line 1");

  const addExam = () => {
    if (!subject.trim()) return;
    updateState((prev) => ({
      ...prev,
      exams: [
        {
          id: createId("exam"),
          subject: subject.trim(),
          date,
          preparedTopics: 0,
          totalTopics: Math.max(topics, 1),
          targetScore,
          schedule: scheduleText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        },
        ...prev.exams,
      ],
    }));
    setSubject("");
  };

  const sortedExams = useMemo(
    () => [...state.exams].sort((a, b) => a.date.localeCompare(b.date)),
    [state.exams],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Planner"
        description="Track exam countdowns, preparation status and study schedules."
      />

      <section className="grid gap-4 lg:grid-cols-[1fr,1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Add Exam
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Subject name"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            <Input
              type="number"
              min={1}
              max={100}
              value={targetScore}
              onChange={(event) => setTargetScore(Number(event.target.value))}
              placeholder="Target score %"
            />
            <Input
              type="number"
              min={1}
              value={topics}
              onChange={(event) => setTopics(Number(event.target.value))}
              placeholder="Total topics"
            />
            <Textarea
              value={scheduleText}
              onChange={(event) => setScheduleText(event.target.value)}
              placeholder="One schedule step per line"
            />
            <Button className="w-full" onClick={addExam}>
              <Plus className="mr-2 h-4 w-4" />
              Add Exam Plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam Countdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedExams.map((exam) => {
                const countdown = dayDiffFromNow(exam.date);
                const prep = Math.round((exam.preparedTopics / Math.max(exam.totalTopics, 1)) * 100);
                return (
                  <div key={exam.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-white">{exam.subject}</p>
                        <p className="text-xs text-slate-400">
                          {formatShortDate(exam.date)} • Target {exam.targetScore}%
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={countdown <= 3 ? "danger" : "slate"}>
                          {countdown >= 0 ? `${countdown} days left` : "Completed"}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            updateState((prev) => ({
                              ...prev,
                              exams: prev.exams.filter((item) => item.id !== exam.id),
                            }))
                          }
                          aria-label="Delete exam"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <Progress value={prep} />
                      <div className="flex items-center gap-2">
                        <Input
                          type="range"
                          min={0}
                          max={exam.totalTopics}
                          value={exam.preparedTopics}
                          onChange={(event) =>
                            updateState((prev) => ({
                              ...prev,
                              exams: prev.exams.map((item) =>
                                item.id === exam.id
                                  ? { ...item, preparedTopics: Number(event.target.value) }
                                  : item,
                              ),
                            }))
                          }
                        />
                        <p className="w-24 text-xs text-slate-300">
                          {exam.preparedTopics}/{exam.totalTopics}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg bg-slate-950/40 p-3">
                      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                        Study Schedule
                      </p>
                      <ul className="space-y-1 text-sm text-slate-200">
                        {exam.schedule.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      <KnowledgeSection
        title="Exam Execution Blueprint"
        description="Use structured revision methods to convert effort into marks."
        items={examGuides}
      />
    </div>
  );
}
