"use client";

import { useMemo, useState } from "react";
import { Calculator, Plus, Trash2 } from "lucide-react";
import {
  KnowledgeSection,
  type KnowledgeItem,
} from "@/components/content/knowledge-section";
import { PageHeader } from "@/components/layout/page-header";
import { useCampus } from "@/components/providers/campus-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createId } from "@/lib/utils";

const cgpaGuides: KnowledgeItem[] = [
  {
    title: "Credit Leverage",
    tag: "Math",
    description: "High-credit courses affect CGPA more than low-credit electives.",
    points: ["Prioritize 4-credit cores", "Avoid grade dips in heavy courses", "Use predictor before enrollment"],
  },
  {
    title: "Recovery Plan",
    tag: "Planning",
    description: "If one semester drops, map how many high grades you need next.",
    points: ["Simulate two-semester scenarios", "Set minimum grade floor", "Track weekly progress"],
  },
  {
    title: "What-If Discipline",
    tag: "Decision",
    description: "Test realistic GPA assumptions and pick conservative targets.",
    points: ["Best case", "Expected case", "Safety case"],
  },
];

export default function CgpaPage() {
  const { state, updateState } = useCampus();

  const [semesterName, setSemesterName] = useState(`Semester ${state.semesters.length + 1}`);
  const [predictCredits, setPredictCredits] = useState(20);
  const [predictGpa, setPredictGpa] = useState(8.5);

  const gradePointMap = useMemo(
    () =>
      state.gradeScale.reduce<Record<string, number>>((acc, entry) => {
        acc[entry.grade] = entry.points;
        return acc;
      }, {}),
    [state.gradeScale],
  );

  const semesterStats = useMemo(() => {
    return state.semesters.map((semester) => {
      const totalCredits = semester.courses.reduce((sum, course) => sum + course.credits, 0);
      const weighted = semester.courses.reduce(
        (sum, course) => sum + (gradePointMap[course.grade] ?? 0) * course.credits,
        0,
      );
      const gpa = totalCredits ? weighted / totalCredits : 0;
      return { semesterId: semester.id, totalCredits, gpa };
    });
  }, [state.semesters, gradePointMap]);

  const cgpa = useMemo(() => {
    const totalCredits = semesterStats.reduce((sum, sem) => sum + sem.totalCredits, 0);
    if (!totalCredits) return 0;
    const weighted = semesterStats.reduce((sum, sem) => sum + sem.gpa * sem.totalCredits, 0);
    return weighted / totalCredits;
  }, [semesterStats]);

  const predictedCgpa = useMemo(() => {
    const currentCredits = semesterStats.reduce((sum, sem) => sum + sem.totalCredits, 0);
    const nextCredits = Math.max(predictCredits, 1);
    const weightedCurrent = cgpa * currentCredits;
    return (weightedCurrent + predictGpa * nextCredits) / (currentCredits + nextCredits);
  }, [cgpa, predictCredits, predictGpa, semesterStats]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="CGPA Calculator"
        description="Compute semester GPA, overall CGPA and what-if predictions with an editable grading system."
      />

      <section className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Grading Scale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {state.gradeScale.map((entry) => (
              <div key={entry.grade} className="flex items-center gap-2">
                <Input
                  value={entry.grade}
                  onChange={(event) =>
                    updateState((prev) => ({
                      ...prev,
                      gradeScale: prev.gradeScale.map((item) =>
                        item.grade === entry.grade
                          ? { ...item, grade: event.target.value.toUpperCase() }
                          : item,
                      ),
                    }))
                  }
                />
                <Input
                  type="number"
                  step={0.5}
                  value={entry.points}
                  onChange={(event) =>
                    updateState((prev) => ({
                      ...prev,
                      gradeScale: prev.gradeScale.map((item) =>
                        item.grade === entry.grade
                          ? { ...item, points: Number(event.target.value) }
                          : item,
                      ),
                    }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Overall CGPA</p>
              <p className="text-4xl font-black">{cgpa.toFixed(2)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-slate-400">Projected CGPA (What-if)</p>
              <p className="text-3xl font-bold">{predictedCgpa.toFixed(2)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                min={1}
                value={predictCredits}
                onChange={(event) => setPredictCredits(Number(event.target.value))}
                placeholder="Future credits"
              />
              <Input
                type="number"
                step={0.1}
                min={0}
                max={10}
                value={predictGpa}
                onChange={(event) => setPredictGpa(Number(event.target.value))}
                placeholder="Expected GPA"
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Semesters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={semesterName}
              onChange={(event) => setSemesterName(event.target.value)}
              placeholder="Semester name"
            />
            <Button
              onClick={() =>
                updateState((prev) => ({
                  ...prev,
                  semesters: [
                    ...prev.semesters,
                    { id: createId("sem"), name: semesterName.trim() || "Semester", courses: [] },
                  ],
                }))
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Semester
            </Button>
          </div>

          <div className="space-y-4">
            {state.semesters.map((semester, index) => (
              <div key={semester.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-semibold text-white">
                    {semester.name} • GPA {semesterStats[index]?.gpa.toFixed(2)}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      updateState((prev) => ({
                        ...prev,
                        semesters: prev.semesters.filter((item) => item.id !== semester.id),
                      }))
                    }
                    aria-label="Delete semester"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {semester.courses.map((course) => (
                    <div key={course.id} className="grid gap-2 sm:grid-cols-[1.5fr,0.6fr,0.8fr,auto]">
                      <Input
                        value={course.name}
                        onChange={(event) =>
                          updateState((prev) => ({
                            ...prev,
                            semesters: prev.semesters.map((item) =>
                              item.id === semester.id
                                ? {
                                    ...item,
                                    courses: item.courses.map((c) =>
                                      c.id === course.id ? { ...c, name: event.target.value } : c,
                                    ),
                                  }
                                : item,
                            ),
                          }))
                        }
                      />
                      <Input
                        type="number"
                        value={course.credits}
                        onChange={(event) =>
                          updateState((prev) => ({
                            ...prev,
                            semesters: prev.semesters.map((item) =>
                              item.id === semester.id
                                ? {
                                    ...item,
                                    courses: item.courses.map((c) =>
                                      c.id === course.id
                                        ? { ...c, credits: Number(event.target.value) }
                                        : c,
                                    ),
                                  }
                                : item,
                            ),
                          }))
                        }
                      />
                      <Select
                        value={course.grade}
                        onChange={(event) =>
                          updateState((prev) => ({
                            ...prev,
                            semesters: prev.semesters.map((item) =>
                              item.id === semester.id
                                ? {
                                    ...item,
                                    courses: item.courses.map((c) =>
                                      c.id === course.id ? { ...c, grade: event.target.value } : c,
                                    ),
                                  }
                                : item,
                            ),
                          }))
                        }
                      >
                        {state.gradeScale.map((entry) => (
                          <option key={entry.grade} value={entry.grade}>
                            {entry.grade}
                          </option>
                        ))}
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          updateState((prev) => ({
                            ...prev,
                            semesters: prev.semesters.map((item) =>
                              item.id === semester.id
                                ? {
                                    ...item,
                                    courses: item.courses.filter((c) => c.id !== course.id),
                                  }
                                : item,
                            ),
                          }))
                        }
                        aria-label="Delete course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  className="mt-3"
                  onClick={() =>
                    updateState((prev) => ({
                      ...prev,
                      semesters: prev.semesters.map((item) =>
                        item.id === semester.id
                          ? {
                              ...item,
                              courses: [
                                ...item.courses,
                                {
                                  id: createId("course"),
                                  name: "New Course",
                                  credits: 3,
                                  grade: prev.gradeScale[0]?.grade ?? "A",
                                },
                              ],
                            }
                          : item,
                      ),
                    }))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <KnowledgeSection
        title="CGPA Strategy Notes"
        description="Understand how grades, credits, and semester choices impact your long-term CGPA."
        items={cgpaGuides}
      />
    </div>
  );
}
