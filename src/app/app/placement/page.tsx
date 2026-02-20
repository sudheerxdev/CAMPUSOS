"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  KnowledgeSection,
  type KnowledgeItem,
} from "@/components/content/knowledge-section";
import { PageHeader } from "@/components/layout/page-header";
import { useCampus } from "@/components/providers/campus-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createId, toIsoDate } from "@/lib/utils";
import type { ApplicationStage } from "@/lib/types";

const stages: ApplicationStage[] = [
  "applied",
  "oa",
  "shortlisted",
  "interview",
  "offer",
  "rejected",
];

const placementGuides: KnowledgeItem[] = [
  {
    title: "Application Cadence",
    tag: "Pipeline",
    description: "Run weekly batch applications instead of random one-offs.",
    points: ["5-10 quality applications/week", "Tailor resume per role", "Log every follow-up date"],
  },
  {
    title: "Interview Debrief",
    tag: "Learning",
    description: "Capture patterns from each rejection to improve hit-rate.",
    points: ["Document asked questions", "Identify weak topic clusters", "Plan correction sprints"],
  },
  {
    title: "Offer Strategy",
    tag: "Decision",
    description: "Compare offers on role quality, growth, and compensation together.",
    points: ["Role scope", "Mentorship quality", "Long-term learning curve"],
  },
];

export default function PlacementPage() {
  const { state, updateState } = useCampus();

  const [company, setCompany] = useState("");
  const [role, setRole] = useState("Software Engineer");
  const [stage, setStage] = useState<ApplicationStage>("applied");
  const [notes, setNotes] = useState("");

  const readiness = useMemo(() => {
    const total = state.placement.checklist.length;
    const done = state.placement.checklist.filter((item) => item.done).length;
    return Math.round((done / Math.max(total, 1)) * 100);
  }, [state.placement.checklist]);

  const stageCounts = useMemo(() => {
    return stages.map((value) => ({
      stage: value,
      count: state.placement.applications.filter((item) => item.stage === value).length,
    }));
  }, [state.placement.applications]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placement Super Tracker"
        description="Track applications, interview pipelines, readiness score, offers, rejections and resume versions."
      />

      <section className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Placement Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Progress</p>
              <p className="text-3xl font-black">{readiness}%</p>
              <Progress value={readiness} className="mt-2" />
            </div>
            <div className="space-y-2">
              {state.placement.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={item.done}
                      onChange={(checked) =>
                        updateState((prev) => ({
                          ...prev,
                          placement: {
                            ...prev.placement,
                            checklist: prev.placement.checklist.map((entry) =>
                              entry.id === item.id ? { ...entry, done: checked } : entry,
                            ),
                          },
                        }))
                      }
                    />
                    <p className="text-sm text-slate-200">{item.title}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      updateState((prev) => ({
                        ...prev,
                        placement: {
                          ...prev.placement,
                          checklist: prev.placement.checklist.filter((entry) => entry.id !== item.id),
                        },
                      }))
                    }
                    aria-label="Delete checklist item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                onClick={() =>
                  updateState((prev) => ({
                    ...prev,
                    placement: {
                      ...prev.placement,
                      checklist: [
                        ...prev.placement.checklist,
                        { id: createId("pc"), title: "New checklist item", done: false },
                      ],
                    },
                  }))
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Checklist Item
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Job Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
            />
            <Input
              placeholder="Role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            />
            <Select
              value={stage}
              onChange={(event) => setStage(event.target.value as ApplicationStage)}
            >
              {stages.map((item) => (
                <option key={item} value={item}>
                  {item.toUpperCase()}
                </option>
              ))}
            </Select>
            <Textarea
              placeholder="Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            <Button
              className="w-full"
              onClick={() => {
                if (!company.trim()) return;
                updateState((prev) => ({
                  ...prev,
                  placement: {
                    ...prev.placement,
                    applications: [
                      {
                        id: createId("app"),
                        company: company.trim(),
                        role: role.trim(),
                        stage,
                        appliedOn: toIsoDate(new Date()),
                        notes,
                      },
                      ...prev.placement.applications,
                    ],
                  },
                }));
                setCompany("");
                setNotes("");
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Interview Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {stageCounts.map((item) => (
              <div key={item.stage} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{item.stage}</p>
                <p className="mt-2 text-2xl font-bold">{item.count}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {state.placement.applications.map((application) => (
              <div
                key={application.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div>
                  <p className="font-medium text-white">
                    {application.company} • {application.role}
                  </p>
                  <p className="text-xs text-slate-400">
                    Applied {application.appliedOn}
                    {application.nextStep ? ` • Next ${application.nextStep}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={application.stage}
                    onChange={(event) =>
                      updateState((prev) => ({
                        ...prev,
                        placement: {
                          ...prev.placement,
                          applications: prev.placement.applications.map((item) =>
                            item.id === application.id
                              ? {
                                  ...item,
                                  stage: event.target.value as ApplicationStage,
                                }
                              : item,
                          ),
                        },
                      }))
                    }
                    className="w-36"
                  >
                    {stages.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      updateState((prev) => ({
                        ...prev,
                        placement: {
                          ...prev.placement,
                          applications: prev.placement.applications.filter(
                            (item) => item.id !== application.id,
                          ),
                        },
                      }))
                    }
                    aria-label="Delete application"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Offers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {state.placement.offers.map((offer) => (
              <div key={offer.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="font-medium text-white">{offer.company}</p>
                <p className="text-xs text-slate-400">
                  {offer.ctcLpa} LPA • {offer.date}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume Versions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {state.placement.resumeVersions.map((version) => (
              <div key={version.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="font-medium text-white">{version.name}</p>
                <p className="text-xs text-slate-400">
                  {version.roleTarget} • ATS {version.score} • {version.updatedAt}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rejections Tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {state.placement.rejections.map((rejection) => (
              <div key={rejection.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="font-medium text-white">{rejection.company}</p>
                <p className="text-xs text-slate-400">
                  {rejection.stage} • {rejection.date}
                </p>
                <Badge variant="warning" className="mt-2">
                  Learn + iterate
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <KnowledgeSection
        title="Placement Readiness Library"
        description="Tactical frameworks to improve interview conversion and offer quality."
        items={placementGuides}
      />
    </div>
  );
}
