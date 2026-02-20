"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
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
import { createId, toIsoDate } from "@/lib/utils";
import type { Priority, TaskStatus } from "@/lib/types";

const priorityColors: Record<Priority, "danger" | "warning" | "success"> = {
  high: "danger",
  medium: "warning",
  low: "success",
};

const plannerTips: KnowledgeItem[] = [
  {
    title: "Subject Buckets",
    tag: "Planning",
    description: "Group tasks by subject and assign a weekly completion quota.",
    points: ["Core subjects first", "Lab/assignment batch slots", "Revision buffer"],
  },
  {
    title: "Deadline Buffer",
    tag: "Execution",
    description: "Set due dates 24-48 hours before the real deadline.",
    points: ["Protect against surprises", "Reserve review window", "Reduce panic sessions"],
  },
  {
    title: "Progress Hygiene",
    tag: "Tracking",
    description: "Update status immediately after each study block.",
    points: ["Move TODO -> In Progress", "Adjust completion slider", "Close tasks daily"],
  },
];

export default function StudyPlannerPage() {
  const { state, updateState } = useCampus();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("General");
  const [dueDate, setDueDate] = useState(toIsoDate(new Date()));
  const [priority, setPriority] = useState<Priority>("medium");

  const addTask = () => {
    if (!title.trim()) return;
    updateState((prev) => ({
      ...prev,
      tasks: [
        {
          id: createId("task"),
          title: title.trim(),
          subject: subject.trim() || "General",
          dueDate,
          priority,
          status: "todo",
          progress: 0,
        },
        ...prev.tasks,
      ],
    }));
    setTitle("");
  };

  const updateTask = (taskId: string, updates: Partial<{ status: TaskStatus; progress: number }>) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    }));
  };

  const removeTask = (taskId: string) => {
    updateState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== taskId),
    }));
  };

  const monthDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(year, month, index + 1);
      const iso = toIsoDate(date);
      const count = state.tasks.filter((task) => task.dueDate === iso).length;
      return { dateNumber: index + 1, iso, count };
    });
  }, [state.tasks]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Planner"
        description="Manage subject-wise tasks, deadlines, priorities and visual progress."
      />

      <section className="grid gap-4 lg:grid-cols-[1fr,1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Task title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
            <Input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
            <Select
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </Select>
            <Button className="w-full" onClick={addTask}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.tasks.map((task) => (
                <div key={task.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">{task.title}</p>
                      <p className="text-xs text-slate-400">
                        {task.subject} • Due {task.dueDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeTask(task.id)}
                        aria-label="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-2 flex gap-2">
                    {(["todo", "in-progress", "done"] as TaskStatus[]).map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={task.status === status ? "default" : "secondary"}
                        onClick={() => updateTask(task.id, { status })}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Progress value={task.progress} />
                    <Input
                      type="range"
                      min={0}
                      max={100}
                      value={task.progress}
                      onChange={(event) =>
                        updateTask(task.id, { progress: Number(event.target.value) })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendar View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <p key={day}>{day}</p>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {monthDays.map((day) => (
              <div
                key={day.iso}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-center"
              >
                <p className="text-xs text-slate-300">{day.dateNumber}</p>
                {day.count > 0 ? (
                  <p className="mt-1 text-xs font-semibold text-cyan-200">{day.count} task</p>
                ) : (
                  <p className="mt-1 text-[10px] text-slate-500">-</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <KnowledgeSection
        title="Study Planner Playbook"
        description="Simple systems to keep your semester workload predictable and controlled."
        items={plannerTips}
      />
    </div>
  );
}
