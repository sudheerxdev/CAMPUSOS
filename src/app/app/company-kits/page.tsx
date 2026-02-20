"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  KnowledgeSection,
  type KnowledgeItem,
} from "@/components/content/knowledge-section";
import { PageHeader } from "@/components/layout/page-header";
import { useCampus } from "@/components/providers/campus-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createId } from "@/lib/utils";

const kitGuides: KnowledgeItem[] = [
  {
    title: "Company-Specific Mapping",
    tag: "Targeting",
    description: "Align roadmap items with the exact rounds used by each company.",
    points: ["OA pattern", "Interview depth", "Role-specific expectations"],
  },
  {
    title: "Checklist Discipline",
    tag: "Execution",
    description: "Convert broad prep goals into concrete, finishable checklist items.",
    points: ["One concept per item", "Time-boxed completion", "Weekly audit"],
  },
  {
    title: "Mock Progression",
    tag: "Readiness",
    description: "Increase mock interview pressure as your checklist completion rises.",
    points: ["Peer mock", "Recorded mock", "Timed simulation"],
  },
];

export default function CompanyKitsPage() {
  const { state, updateState } = useCampus();
  const [selectedId, setSelectedId] = useState(state.companyKits[0]?.id ?? "");
  const [newCompany, setNewCompany] = useState("");
  const [newRoadmap, setNewRoadmap] = useState("Roadmap step 1");

  const selectedKit = useMemo(
    () => state.companyKits.find((item) => item.id === selectedId) ?? state.companyKits[0],
    [state.companyKits, selectedId],
  );

  const progress = selectedKit
    ? Math.round(
        (selectedKit.topics.filter((topic) => topic.done).length /
          Math.max(selectedKit.topics.length, 1)) *
          100,
      )
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company Preparation Kits"
        description="Choose target companies, follow structured roadmaps and track skill checklist progress."
      />

      <section className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Target Company</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={selectedKit?.id ?? ""}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {state.companyKits.length === 0 ? (
                <option value="">No companies yet</option>
              ) : (
                state.companyKits.map((kit) => (
                  <option key={kit.id} value={kit.id}>
                    {kit.company}
                  </option>
                ))
              )}
            </Select>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-xs text-slate-400">Preparation Progress</p>
              <p className="text-3xl font-black">{progress}%</p>
              <Progress value={progress} className="mt-2" />
            </div>
            <Input
              placeholder="Add new company"
              value={newCompany}
              onChange={(event) => setNewCompany(event.target.value)}
            />
            <Textarea
              value={newRoadmap}
              onChange={(event) => setNewRoadmap(event.target.value)}
              placeholder="Roadmap lines"
            />
            <Button
              className="w-full"
              onClick={() => {
                if (!newCompany.trim()) return;
                const id = createId("kit");
                updateState((prev) => ({
                  ...prev,
                  companyKits: [
                    ...prev.companyKits,
                    {
                      id,
                      company: newCompany.trim(),
                      roadmap: newRoadmap
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean),
                      topics: [
                        { id: createId("topic"), title: "DSA", done: false },
                        { id: createId("topic"), title: "Core CS", done: false },
                        { id: createId("topic"), title: "Behavioral", done: false },
                      ],
                    },
                  ],
                }));
                setSelectedId(id);
                setNewCompany("");
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Company Kit
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{selectedKit?.company ?? "No company selected"} Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Roadmap</p>
              <ul className="space-y-2 text-sm text-slate-200">
                {(selectedKit?.roadmap ?? []).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              {(selectedKit?.topics ?? []).map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={topic.done}
                      onChange={(checked) =>
                        updateState((prev) => ({
                          ...prev,
                          companyKits: prev.companyKits.map((kit) =>
                            kit.id === selectedKit?.id
                              ? {
                                  ...kit,
                                  topics: kit.topics.map((entry) =>
                                    entry.id === topic.id ? { ...entry, done: checked } : entry,
                                  ),
                                }
                              : kit,
                          ),
                        }))
                      }
                    />
                    <p className="text-sm text-slate-100">{topic.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedKit ? (
              <Button
                variant="secondary"
                onClick={() =>
                  updateState((prev) => ({
                    ...prev,
                    companyKits: prev.companyKits.map((kit) =>
                      kit.id === selectedKit.id
                        ? {
                            ...kit,
                            topics: [
                              ...kit.topics,
                              {
                                id: createId("topic"),
                                title: `Topic ${kit.topics.length + 1}`,
                                done: false,
                              },
                            ],
                          }
                        : kit,
                    ),
                  }))
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Skill Checklist Item
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <KnowledgeSection
        title="Company Kit Usage Guide"
        description="Turn each company kit into a focused, interview-ready execution plan."
        items={kitGuides}
      />
    </div>
  );
}
