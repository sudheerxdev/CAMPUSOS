"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { AlertTriangle, Download, Moon, RotateCcw, Sun, Upload } from "lucide-react";
import {
  KnowledgeSection,
  type KnowledgeItem,
} from "@/components/content/knowledge-section";
import { PageHeader } from "@/components/layout/page-header";
import { useCampus } from "@/components/providers/campus-provider";
import { useThemeMode } from "@/components/providers/theme-provider";
import { InstallButton } from "@/components/pwa/install-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAllNotes, upsertNote } from "@/lib/indexeddb";
import type { NoteRecord } from "@/lib/types";

type BackupCompatibility = "compatible" | "legacy" | "incompatible";

type BackupSnapshot = {
  tasks: number;
  exams: number;
  goals: number;
  resources: number;
  applications: number;
  notes: number;
};

type PendingBackupPreview = {
  payload: unknown;
  notes: NoteRecord[];
  version: number | null;
  exportedAt: string | null;
  compatibility: BackupCompatibility;
  snapshot: BackupSnapshot;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNoteRecord(value: unknown): value is NoteRecord {
  if (!isObject(value)) {
    return false;
  }
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.subject === "string" &&
    (value.format === "markdown" || value.format === "rich") &&
    typeof value.content === "string" &&
    typeof value.updatedAt === "string"
  );
}

function extractBackupRoot(payload: unknown): Record<string, unknown> | null {
  if (!isObject(payload)) {
    return null;
  }
  if ("data" in payload && isObject(payload.data)) {
    return payload.data;
  }
  return payload;
}

function extractBackupNotes(payload: unknown): NoteRecord[] {
  if (!isObject(payload) || !("notes" in payload) || !Array.isArray(payload.notes)) {
    return [];
  }
  return payload.notes.filter(isNoteRecord);
}

function resolveCompatibility(payload: unknown): {
  version: number | null;
  exportedAt: string | null;
  compatibility: BackupCompatibility;
} {
  if (!isObject(payload)) {
    return { version: null, exportedAt: null, compatibility: "legacy" };
  }

  const version = typeof payload.version === "number" ? payload.version : null;
  const exportedAt = typeof payload.exportedAt === "string" ? payload.exportedAt : null;
  const compatibility: BackupCompatibility =
    version === null ? "legacy" : version === 1 ? "compatible" : "incompatible";

  return { version, exportedAt, compatibility };
}

function buildSnapshot(payload: unknown, notesCount: number): BackupSnapshot {
  const root = extractBackupRoot(payload);
  if (!root) {
    return {
      tasks: 0,
      exams: 0,
      goals: 0,
      resources: 0,
      applications: 0,
      notes: notesCount,
    };
  }

  const placement = isObject(root.placement) ? root.placement : {};
  return {
    tasks: Array.isArray(root.tasks) ? root.tasks.length : 0,
    exams: Array.isArray(root.exams) ? root.exams.length : 0,
    goals: Array.isArray(root.goals) ? root.goals.length : 0,
    resources: Array.isArray(root.resources) ? root.resources.length : 0,
    applications: Array.isArray(placement.applications) ? placement.applications.length : 0,
    notes: notesCount,
  };
}

const settingsGuides: KnowledgeItem[] = [
  {
    title: "Backup Frequency",
    tag: "Safety",
    description: "Create regular backups so long-term progress is never lost.",
    points: ["Before major edits", "Before reset", "Weekly archive copy"],
  },
  {
    title: "Theme + Focus Defaults",
    tag: "Personalization",
    description: "Tune defaults once and reuse for consistent daily flow.",
    points: ["Preferred theme", "Default focus cycle", "Default break cycle"],
  },
  {
    title: "Restore Validation",
    tag: "Reliability",
    description: "Always verify restore preview metrics before applying import.",
    points: ["Check version label", "Review snapshot counts", "Confirm compatibility state"],
  },
];

export default function SettingsPage() {
  const { state, updateState, resetState, canImportState, importState } = useCampus();
  const { theme, toggleTheme } = useThemeMode();
  const backupInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingBackup, setPendingBackup] = useState<PendingBackupPreview | null>(null);
  const [isApplyingImport, setIsApplyingImport] = useState(false);

  const exportBackup = async () => {
    const notes = await getAllNotes().catch(() => []);
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: state,
      notes,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `campusos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stageBackupImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const payload = JSON.parse(text) as unknown;
      if (!canImportState(payload)) {
        throw new Error("Invalid backup file structure.");
      }

      const notes = extractBackupNotes(payload);
      const { version, exportedAt, compatibility } = resolveCompatibility(payload);
      const snapshot = buildSnapshot(payload, notes.length);

      setPendingBackup({
        payload,
        notes,
        version,
        exportedAt,
        compatibility,
        snapshot,
      });
    } catch {
      window.alert("Import failed. Please select a valid CAMPUSOS backup JSON file.");
    } finally {
      event.target.value = "";
    }
  };

  const applyStagedImport = async () => {
    if (!pendingBackup) {
      return;
    }
    if (pendingBackup.compatibility === "incompatible") {
      window.alert("This backup version is not compatible with the current app.");
      return;
    }

    try {
      setIsApplyingImport(true);
      const imported = importState(pendingBackup.payload);
      if (!imported) {
        throw new Error("Import failed");
      }
      await Promise.all(pendingBackup.notes.map((note) => upsertNote(note)));
      setPendingBackup(null);
      window.alert("Backup restored successfully.");
    } catch {
      window.alert("Restore failed. Please retry with a valid backup file.");
    } finally {
      setIsApplyingImport(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage appearance, app defaults, local data reset and installation setup."
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-300">Current theme: {theme}</p>
            <Button
              variant="secondary"
              onClick={() => {
                toggleTheme();
                updateState((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    theme: prev.settings.theme === "dark" ? "light" : "dark",
                  },
                }));
              }}
            >
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              Toggle Theme
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Focus Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-slate-400">Default focus minutes</p>
            <Input
              type="number"
              min={10}
              max={120}
              value={state.settings.focusMinutes}
              onChange={(event) =>
                updateState((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, focusMinutes: Number(event.target.value) },
                }))
              }
            />
            <p className="text-xs text-slate-400">Default break minutes</p>
            <Input
              type="number"
              min={3}
              max={30}
              value={state.settings.breakMinutes}
              onChange={(event) =>
                updateState((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, breakMinutes: Number(event.target.value) },
                }))
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PWA Install</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InstallButton className="w-full" />
            <p className="text-xs text-slate-300">
              If install button is unavailable, open browser menu and choose
              <span className="font-semibold"> Install App </span>
              or
              <span className="font-semibold"> Add to Home Screen</span>.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-300">
              Export your local CAMPUSOS data to JSON and restore it any time.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => void exportBackup()}>
                <Download className="mr-2 h-4 w-4" />
                Export Backup
              </Button>
              <Button
                variant="outline"
                onClick={() => backupInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Backup
              </Button>
            </div>
            <input
              ref={backupInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={stageBackupImport}
            />
            {pendingBackup ? (
              <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">Restore Preview</p>
                    <p className="text-xs text-slate-400">
                      Version{" "}
                      {pendingBackup.version === null
                        ? "legacy"
                        : `v${pendingBackup.version}`}
                      {pendingBackup.exportedAt
                        ? ` • ${new Date(pendingBackup.exportedAt).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                      pendingBackup.compatibility === "compatible"
                        ? "text-emerald-300"
                        : pendingBackup.compatibility === "legacy"
                          ? "text-amber-300"
                          : "text-rose-300"
                    }`}
                  >
                    {pendingBackup.compatibility}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-white/10 bg-slate-950/50 p-2">
                    Tasks: {pendingBackup.snapshot.tasks}
                  </div>
                  <div className="rounded-lg border border-white/10 bg-slate-950/50 p-2">
                    Exams: {pendingBackup.snapshot.exams}
                  </div>
                  <div className="rounded-lg border border-white/10 bg-slate-950/50 p-2">
                    Goals: {pendingBackup.snapshot.goals}
                  </div>
                  <div className="rounded-lg border border-white/10 bg-slate-950/50 p-2">
                    Resources: {pendingBackup.snapshot.resources}
                  </div>
                  <div className="rounded-lg border border-white/10 bg-slate-950/50 p-2">
                    Applications: {pendingBackup.snapshot.applications}
                  </div>
                  <div className="rounded-lg border border-white/10 bg-slate-950/50 p-2">
                    Notes: {pendingBackup.snapshot.notes}
                  </div>
                </div>

                {pendingBackup.compatibility === "incompatible" ? (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 p-2 text-xs text-rose-200">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    This backup uses an unsupported schema version and cannot be restored.
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => void applyStagedImport()}
                    disabled={
                      isApplyingImport || pendingBackup.compatibility === "incompatible"
                    }
                  >
                    {isApplyingImport ? "Restoring..." : "Apply Restore"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPendingBackup(null)}
                    disabled={isApplyingImport}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <p>Export file includes dashboard data plus IndexedDB notes content.</p>
            <p>For best safety, keep at least one backup before resetting app data.</p>
            <p>Import now shows a restore preview and compatibility status before applying.</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-rose-400/30">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-300">
            Reset will permanently remove local app data (tasks, notes, progress, trackers).
          </p>
          <Button
            variant="destructive"
            onClick={() => {
              const confirmed = window.confirm("Reset all CAMPUSOS local data?");
              if (confirmed) resetState();
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset All Data
          </Button>
        </CardContent>
      </Card>

      <KnowledgeSection
        title="Settings Best Practices"
        description="Operational tips for safer data management and smoother day-to-day usage."
        items={settingsGuides}
      />
    </div>
  );
}
