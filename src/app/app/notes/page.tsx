"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import {
  KnowledgeSection,
  type KnowledgeItem,
} from "@/components/content/knowledge-section";
import { PageHeader } from "@/components/layout/page-header";
import { deleteNote, getAllNotes, upsertNote } from "@/lib/indexeddb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createId } from "@/lib/utils";
import type { NoteFormat, NoteRecord } from "@/lib/types";

const notesGuides: KnowledgeItem[] = [
  {
    title: "Cornell Style Notes",
    tag: "Academics",
    description: "Capture ideas in structured columns for quick revision.",
    points: ["Main notes area", "Cue keywords", "Short summary block"],
  },
  {
    title: "Project Knowledge Base",
    tag: "Engineering",
    description: "Use markdown notes as a searchable engineering logbook.",
    points: ["Decision records", "Bug fixes", "Reusable snippets"],
  },
  {
    title: "Revision Efficiency",
    tag: "Memory",
    description: "End each note with 3 key recall prompts.",
    points: ["One concept question", "One example", "One tricky edge case"],
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getAllNotes();
        const sorted = list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        setNotes(sorted);
        setSelectedId(sorted[0]?.id ?? "");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedId) ?? notes[0],
    [notes, selectedId],
  );

  const upsertLocal = async (next: NoteRecord) => {
    await upsertNote(next);
    setNotes((prev) =>
      [next, ...prev.filter((item) => item.id !== next.id)].sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
      ),
    );
    setSelectedId(next.id);
  };

  const createNote = async () => {
    const note: NoteRecord = {
      id: createId("note"),
      title: "Untitled note",
      subject: "General",
      format: "markdown",
      content: "",
      updatedAt: new Date().toISOString(),
    };
    await upsertLocal(note);
  };

  const removeNote = async (id: string) => {
    await deleteNote(id);
    setNotes((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (selectedId === id) {
        setSelectedId(next[0]?.id ?? "");
      }
      return next;
    });
  };

  const saveField = async <K extends keyof NoteRecord>(key: K, value: NoteRecord[K]) => {
    if (!selectedNote) return;
    const updated: NoteRecord = {
      ...selectedNote,
      [key]: value,
      updatedAt: new Date().toISOString(),
    };
    await upsertLocal(updated);
  };

  const exportCurrent = () => {
    if (!selectedNote) return;
    const blob = new Blob([selectedNote.content], {
      type: selectedNote.format === "markdown" ? "text/markdown" : "text/html",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedNote.title || "note"}.${
      selectedNote.format === "markdown" ? "md" : "html"
    }`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes Organizer"
        description="Subject-wise notes with Markdown + rich text support, offline IndexedDB persistence and export."
        actions={
          <Button onClick={createNote}>
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>All Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-slate-300">Loading notes...</p>
            ) : notes.length === 0 ? (
              <p className="text-sm text-slate-300">No notes yet. Create your first note.</p>
            ) : (
              notes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setSelectedId(note.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    note.id === selectedNote?.id
                      ? "border-cyan-400/50 bg-cyan-400/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">{note.title}</p>
                      <p className="text-xs text-slate-400">
                        {note.subject} • {new Date(note.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeNote(note.id);
                      }}
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedNote ? (
              <>
                <Input
                  value={selectedNote.title}
                  onChange={(event) => saveField("title", event.target.value)}
                  placeholder="Title"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={selectedNote.subject}
                    onChange={(event) => saveField("subject", event.target.value)}
                    placeholder="Subject"
                  />
                  <Select
                    value={selectedNote.format}
                    onChange={(event) => saveField("format", event.target.value as NoteFormat)}
                  >
                    <option value="markdown">Markdown</option>
                    <option value="rich">Rich Text</option>
                  </Select>
                </div>

                {selectedNote.format === "markdown" ? (
                  <Textarea
                    className="min-h-[320px]"
                    value={selectedNote.content}
                    onChange={(event) => saveField("content", event.target.value)}
                    placeholder="# Write your markdown note"
                  />
                ) : (
                  <div
                    className="min-h-[320px] rounded-xl border border-white/15 bg-slate-900/40 p-3 text-sm text-white focus-visible:outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(event) => saveField("content", event.currentTarget.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                  />
                )}

                <Button variant="secondary" onClick={exportCurrent}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Note
                </Button>
              </>
            ) : (
              <p className="text-sm text-slate-300">Select a note to begin editing.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <KnowledgeSection
        title="Note-Taking Frameworks"
        description="Use structured note methods to improve retention and faster revision."
        items={notesGuides}
      />
    </div>
  );
}
