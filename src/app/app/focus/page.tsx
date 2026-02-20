"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BellRing, Pause, Play, RotateCcw } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
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
import { createId, formatShortDate, toIsoDate } from "@/lib/utils";
import type { FocusSession } from "@/lib/types";

const focusGuides: KnowledgeItem[] = [
  {
    title: "50/10 Protocol",
    tag: "Deep Work",
    description: "Run longer cycles for concept-heavy subjects and coding.",
    points: ["50 min study", "10 min reset", "Track completion after each cycle"],
  },
  {
    title: "Environment Priming",
    tag: "Setup",
    description: "Use ambient mode and a fixed desk routine to trigger focus quickly.",
    points: ["Keep one study playlist", "Phone away during sprints", "Single-tab work mode"],
  },
  {
    title: "Recovery Rules",
    tag: "Sustainability",
    description: "Breaks are part of performance, not wasted time.",
    points: ["Hydrate every break", "Short movement", "No doom scrolling"],
  },
];

function formatClock(seconds: number) {
  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

export default function FocusPage() {
  const { state, updateState } = useCampus();

  const [focusMinutes, setFocusMinutes] = useState(state.settings.focusMinutes);
  const [breakMinutes, setBreakMinutes] = useState(state.settings.breakMinutes);
  const [activeMode, setActiveMode] = useState<FocusSession["mode"]>("focus");
  const [remaining, setRemaining] = useState(focusMinutes * 60);
  const [running, setRunning] = useState(false);
  const [ambient, setAmbient] = useState<FocusSession["ambient"]>(state.focus.ambientMode);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const stopAmbient = useCallback(() => {
    oscillatorRef.current?.stop();
    oscillatorRef.current = null;
    gainRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
  }, []);

  const startAmbient = useCallback((mode: FocusSession["ambient"]) => {
    stopAmbient();
    if (mode === "none") return;
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) return;
    const audioContext = new AudioContextConstructor();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = mode === "deep" ? "sine" : mode === "rain" ? "triangle" : "sawtooth";
    oscillator.frequency.value = mode === "deep" ? 88 : mode === "rain" ? 140 : 190;
    gain.gain.value = 0.015;
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    audioContextRef.current = audioContext;
    oscillatorRef.current = oscillator;
    gainRef.current = gain;
  }, [stopAmbient]);

  const resolveSessionSeconds = useCallback(
    (mode: FocusSession["mode"]) => (mode === "focus" ? focusMinutes : breakMinutes) * 60,
    [focusMinutes, breakMinutes],
  );

  const handleSessionComplete = useCallback((completedMode: FocusSession["mode"]) => {
    setRunning(false);

    if (completedMode === "focus") {
      const today = toIsoDate(new Date());
      updateState((prev) => ({
        ...prev,
        focus: {
          ...prev.focus,
          sessions: [
            {
              id: createId("focus"),
              startedAt: new Date().toISOString(),
              minutes: focusMinutes,
              mode: "focus",
              ambient,
            },
            ...prev.focus.sessions,
          ],
          dailyMinutes: {
            ...prev.focus.dailyMinutes,
            [today]: (prev.focus.dailyMinutes[today] ?? 0) + focusMinutes,
          },
          streak: prev.focus.streak + 1,
          ambientMode: ambient,
        },
        settings: {
          ...prev.settings,
          focusMinutes,
          breakMinutes,
        },
      }));
    }

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Session Complete", {
        body:
          completedMode === "focus"
            ? "Take a short break."
            : "Break done. Ready for your next focus sprint?",
      });
    }
    window.alert(
      completedMode === "focus"
        ? "Focus session completed. Time for a break."
        : "Break completed. Ready for the next session.",
    );
    const nextMode: FocusSession["mode"] = completedMode === "focus" ? "break" : "focus";
    setActiveMode(nextMode);
    setRemaining(resolveSessionSeconds(nextMode));
    stopAmbient();
  }, [ambient, breakMinutes, focusMinutes, resolveSessionSeconds, stopAmbient, updateState]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev > 1) {
          return prev - 1;
        }
        window.clearInterval(timer);
        handleSessionComplete(activeMode);
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, activeMode, handleSessionComplete]);

  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, [stopAmbient]);

  const toggleTimer = () => {
    if (!running) {
      if (remaining <= 0) {
        setRemaining(resolveSessionSeconds(activeMode));
      }
      startAmbient(ambient);
    } else {
      stopAmbient();
    }
    setRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setRunning(false);
    setRemaining(resolveSessionSeconds(activeMode));
    stopAmbient();
  };

  const focusStats = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const iso = toIsoDate(date);
      return {
        label: formatShortDate(iso),
        minutes: state.focus.dailyMinutes[iso] ?? 0,
      };
    });
  }, [state.focus.dailyMinutes]);

  const todayMinutes = state.focus.dailyMinutes[toIsoDate(new Date())] ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Focus System"
        description="Pomodoro engine with custom sessions, break reminders, ambient sound and daily focus analytics."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              if (typeof window !== "undefined" && "Notification" in window) {
                Notification.requestPermission();
              }
            }}
            className="hidden sm:inline-flex"
          >
            <BellRing className="mr-2 h-4 w-4" />
            Enable Alerts
          </Button>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={activeMode === "focus" ? "default" : "secondary"}
              onClick={() => {
                setActiveMode("focus");
                if (!running) {
                  setRemaining(resolveSessionSeconds("focus"));
                }
              }}
            >
              Focus
            </Button>
            <Button
              variant={activeMode === "break" ? "default" : "secondary"}
              onClick={() => {
                setActiveMode("break");
                if (!running) {
                  setRemaining(resolveSessionSeconds("break"));
                }
              }}
            >
              Break
            </Button>
          </div>

          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-5 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Timer</p>
            <p className="mt-2 text-6xl font-black tracking-tight text-white">{formatClock(remaining)}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-xs text-slate-400">Focus (min)</p>
              <Input
                type="number"
                min={10}
                max={120}
                value={focusMinutes}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  setFocusMinutes(nextValue);
                  if (!running && activeMode === "focus") {
                    setRemaining(nextValue * 60);
                  }
                }}
              />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">Break (min)</p>
              <Input
                type="number"
                min={3}
                max={30}
                value={breakMinutes}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  setBreakMinutes(nextValue);
                  if (!running && activeMode === "break") {
                    setRemaining(nextValue * 60);
                  }
                }}
              />
            </div>
            <div>
              <p className="mb-1 text-xs text-slate-400">Ambient</p>
              <Select
                value={ambient}
                onChange={(event) => setAmbient(event.target.value as FocusSession["ambient"])}
              >
                <option value="none">None</option>
                <option value="rain">Rain Tone</option>
                <option value="deep">Deep Focus</option>
                <option value="cafe">Cafe Hum</option>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={toggleTimer}>
              {running ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {running ? "Pause" : "Start"}
            </Button>
            <Button variant="secondary" onClick={resetTimer}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Focus Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Today</p>
                <p className="text-2xl font-bold">{todayMinutes} min</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-xs text-slate-400">Current Streak</p>
                <p className="text-2xl font-bold">{state.focus.streak} days</p>
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={focusStats}>
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.16)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="minutes" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {state.focus.sessions.slice(0, 10).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div>
                  <p className="font-medium text-white">{session.minutes} min focus</p>
                  <p className="text-xs text-slate-400">
                    {new Date(session.startedAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant="slate">{session.ambient}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <KnowledgeSection
        title="Focus Protocol Library"
        description="Follow proven session patterns to improve consistency and reduce burnout."
        items={focusGuides}
      />
    </div>
  );
}
