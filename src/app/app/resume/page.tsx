"use client";

import { useMemo } from "react";
import { FileText, Printer } from "lucide-react";
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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeData } from "@/lib/types";

const resumeGuides: KnowledgeItem[] = [
  {
    title: "ATS Readability",
    tag: "Format",
    description: "Use clean section headers and keyword-rich bullets for ATS scans.",
    points: ["Action verbs", "Role keywords", "Consistent structure"],
  },
  {
    title: "Impact Writing",
    tag: "Content",
    description: "Each bullet should show action, method, and measurable result.",
    points: ["Built what", "How you built it", "What improved"],
  },
  {
    title: "Versioning Strategy",
    tag: "Applications",
    description: "Maintain role-specific resume variants for higher conversion.",
    points: ["SDE variant", "Data variant", "Internship variant"],
  },
];

function updateResumeField<K extends keyof ResumeData>(
  key: K,
  value: ResumeData[K],
  set: (updater: (prev: ResumeData) => ResumeData) => void,
) {
  set((prev) => ({ ...prev, [key]: value }));
}

export default function ResumePage() {
  const { state, updateState } = useCampus();
  const resume = state.resume;

  const setResume = (updater: (prev: ResumeData) => ResumeData) => {
    updateState((prev) => ({ ...prev, resume: updater(prev.resume) }));
  };

  const suggestions = useMemo(() => {
    const tips: string[] = [];
    if (resume.summary.length < 80) {
      tips.push("Expand your summary with impact-oriented achievements.");
    }
    if (!resume.experience.includes("%")) {
      tips.push("Add measurable outcomes in experience bullets (e.g., improved by 30%).");
    }
    if (resume.projects.split(",").length < 2) {
      tips.push("Add at least 2 project highlights aligned with target role.");
    }
    if (!resume.skills.toLowerCase().includes("typescript")) {
      tips.push("Include role-relevant technical skills and frameworks.");
    }
    return tips;
  }, [resume]);

  const templateClass =
    resume.template === "classic"
      ? "border-cyan-400/30"
      : resume.template === "minimal"
        ? "border-emerald-400/30"
        : "border-violet-400/30";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resume Builder"
        description="Build and manage ATS-friendly resume versions with live preview and PDF export."
        actions={
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        }
      />

      <section className="grid gap-4 xl:grid-cols-[1fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Edit Resume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={resume.template}
              onChange={(event) =>
                updateResumeField("template", event.target.value as ResumeData["template"], setResume)
              }
            >
              <option value="classic">Classic ATS</option>
              <option value="minimal">Minimal ATS</option>
              <option value="executive">Executive ATS</option>
            </Select>
            <Input
              value={resume.fullName}
              onChange={(event) => updateResumeField("fullName", event.target.value, setResume)}
              placeholder="Full name"
            />
            <Input
              value={resume.headline}
              onChange={(event) => updateResumeField("headline", event.target.value, setResume)}
              placeholder="Headline"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={resume.email}
                onChange={(event) => updateResumeField("email", event.target.value, setResume)}
                placeholder="Email"
              />
              <Input
                value={resume.phone}
                onChange={(event) => updateResumeField("phone", event.target.value, setResume)}
                placeholder="Phone"
              />
            </div>
            <Input
              value={resume.location}
              onChange={(event) => updateResumeField("location", event.target.value, setResume)}
              placeholder="Location"
            />
            <Textarea
              value={resume.summary}
              onChange={(event) => updateResumeField("summary", event.target.value, setResume)}
              placeholder="Professional summary"
            />
            <Textarea
              value={resume.education}
              onChange={(event) => updateResumeField("education", event.target.value, setResume)}
              placeholder="Education"
            />
            <Textarea
              value={resume.experience}
              onChange={(event) => updateResumeField("experience", event.target.value, setResume)}
              placeholder="Experience"
            />
            <Textarea
              value={resume.projects}
              onChange={(event) => updateResumeField("projects", event.target.value, setResume)}
              placeholder="Projects"
            />
            <Textarea
              value={resume.skills}
              onChange={(event) => updateResumeField("skills", event.target.value, setResume)}
              placeholder="Skills"
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className={`print:bg-white print:text-black ${templateClass}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <article className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 print:border-black/20 print:bg-white">
                <header>
                  <h2 className="text-2xl font-bold">{resume.fullName}</h2>
                  <p className="text-sm text-slate-300 print:text-slate-600">{resume.headline}</p>
                  <p className="text-xs text-slate-400 print:text-slate-500">
                    {resume.email} • {resume.phone} • {resume.location}
                  </p>
                </header>

                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-200 print:text-slate-700">
                    Summary
                  </h3>
                  <p className="text-sm text-slate-200 print:text-slate-700">{resume.summary}</p>
                </section>

                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-200 print:text-slate-700">
                    Education
                  </h3>
                  <p className="text-sm text-slate-200 print:text-slate-700">{resume.education}</p>
                </section>

                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-200 print:text-slate-700">
                    Experience
                  </h3>
                  <p className="text-sm text-slate-200 print:text-slate-700">{resume.experience}</p>
                </section>

                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-200 print:text-slate-700">
                    Projects
                  </h3>
                  <p className="text-sm text-slate-200 print:text-slate-700">{resume.projects}</p>
                </section>

                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-cyan-200 print:text-slate-700">
                    Skills
                  </h3>
                  <p className="text-sm text-slate-200 print:text-slate-700">{resume.skills}</p>
                </section>
              </article>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestions.length === 0 ? (
                <Badge variant="success">Resume quality looks strong.</Badge>
              ) : (
                suggestions.map((tip) => (
                  <div key={tip} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                    {tip}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <KnowledgeSection
        title="Resume Optimization Library"
        description="Guidelines to improve ATS pass-rate and recruiter response quality."
        items={resumeGuides}
      />
    </div>
  );
}
