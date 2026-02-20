"use client";

import { useMemo, useState } from "react";
import { ExternalLink, Plus, Search, Star } from "lucide-react";
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
import { createId } from "@/lib/utils";

const resourceGuides: KnowledgeItem[] = [
  {
    title: "Curation Rules",
    tag: "Quality",
    description: "Only save resources that are actionable and role-aligned.",
    points: ["Current relevance", "Clear learning value", "Practical exercises"],
  },
  {
    title: "Category Discipline",
    tag: "Organization",
    description: "Keep categories stable so search stays fast and predictable.",
    points: ["DSA", "Core CS", "Projects", "Placements", "Aptitude"],
  },
  {
    title: "Review Cycle",
    tag: "Consistency",
    description: "Audit saved links weekly to remove stale or low-value content.",
    points: ["Archive unused items", "Pin top 10 resources", "Track completion notes"],
  },
];

export default function ResourcesPage() {
  const { state, updateState } = useCampus();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("General");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return state.resources.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q),
    );
  }, [state.resources, query]);

  const categories = Array.from(new Set(state.resources.map((item) => item.category)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Hub"
        description="Save useful links, categorize resources, bookmark favorites and search instantly."
      />

      <section className="grid gap-4 lg:grid-cols-[1fr,1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add Resource</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Resource title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            <Input
              placeholder="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
            <Button
              className="w-full"
              onClick={() => {
                if (!title.trim() || !url.trim()) return;
                updateState((prev) => ({
                  ...prev,
                  resources: [
                    {
                      id: createId("res"),
                      title: title.trim(),
                      url: url.trim(),
                      category: category.trim() || "General",
                      favorite: false,
                    },
                    ...prev.resources,
                  ],
                }));
                setTitle("");
                setUrl("");
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Save Resource
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search resources"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <Badge key={item} variant="slate">
                  {item}
                </Badge>
              ))}
            </div>
            <div className="space-y-2">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        updateState((prev) => ({
                          ...prev,
                          resources: prev.resources.map((entry) =>
                            entry.id === item.id
                              ? { ...entry, favorite: !entry.favorite }
                              : entry,
                          ),
                        }))
                      }
                      aria-label="Toggle favorite"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          item.favorite ? "fill-amber-300 text-amber-300" : "text-slate-300"
                        }`}
                      />
                    </Button>
                    <a href={item.url} target="_blank" rel="noreferrer">
                      <Button size="icon" variant="secondary" aria-label="Open link">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <KnowledgeSection
        title="Resource Curation Guide"
        description="Build a high-signal learning library instead of an unfiltered link dump."
        items={resourceGuides}
      />
    </div>
  );
}
