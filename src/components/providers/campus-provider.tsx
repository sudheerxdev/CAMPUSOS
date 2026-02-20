"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { defaultState } from "@/lib/default-state";
import type { CampusState } from "@/lib/types";

const STORAGE_KEY = "campusos.state.v1";

type CampusContextValue = {
  state: CampusState;
  hydrated: boolean;
  updateState: (updater: (prev: CampusState) => CampusState) => void;
  resetState: () => void;
  canImportState: (payload: unknown) => boolean;
  importState: (payload: unknown) => boolean;
};

const CampusContext = createContext<CampusContextValue | null>(null);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractImportCandidate(payload: unknown): Partial<CampusState> | null {
  if (!isObject(payload)) {
    return null;
  }

  const candidate = "data" in payload ? payload.data : payload;
  if (!isObject(candidate)) {
    return null;
  }

  return candidate as Partial<CampusState>;
}

function mergeState(parsed: Partial<CampusState>): CampusState {
  return {
    ...defaultState,
    ...parsed,
    focus: { ...defaultState.focus, ...parsed.focus },
    placement: { ...defaultState.placement, ...parsed.placement },
    coding: { ...defaultState.coding, ...parsed.coding },
    resume: { ...defaultState.resume, ...parsed.resume },
    settings: { ...defaultState.settings, ...parsed.settings },
  };
}

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CampusState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<CampusState>;
      setState(mergeState(parsed));
    } catch {
      setState(defaultState);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const updateState = useCallback((updater: (prev: CampusState) => CampusState) => {
    setState((prev) => updater(prev));
  }, []);

  const resetState = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const canImportState = useCallback((payload: unknown) => {
    return extractImportCandidate(payload) !== null;
  }, []);

  const importState = useCallback((payload: unknown) => {
    const candidate = extractImportCandidate(payload);
    if (!candidate) {
      return false;
    }

    setState(mergeState(candidate));
    return true;
  }, []);

  const value = useMemo(
    () => ({ state, hydrated, updateState, resetState, canImportState, importState }),
    [state, hydrated, updateState, resetState, canImportState, importState],
  );

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error("useCampus must be used inside CampusProvider");
  }
  return context;
}
