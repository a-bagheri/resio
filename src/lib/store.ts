"use client";

import { create } from "zustand";
import type { Resume } from "./types";
import type { SectionKind } from "./types";
import { makeResume, makeSection } from "./factory";
import type { MakeResumeOpts } from "./factory";
import { uid } from "./utils";

export type SaveStatus = "saved" | "saving" | "dirty" | "error";

interface AppState {
  resumes: Resume[];
  activeId: string | null;
  saveStatus: SaveStatus;
  lastSavedAt: number | null;
  hydrated: boolean;

  createResume: (name: string, opts?: MakeResumeOpts) => string;
  duplicateResume: (id: string) => string | null;
  deleteResume: (id: string) => void;
  renameResume: (id: string, name: string) => void;
  setActive: (id: string) => void;
  getResume: (id: string | null) => Resume | undefined;

  update: (id: string, fn: (r: Resume) => void) => void;

  addSection: (resumeId: string, kind: SectionKind) => string;
  removeSection: (resumeId: string, sectionId: string) => void;
  toggleSectionVisible: (resumeId: string, sectionId: string) => void;
  reorderSections: (resumeId: string, ids: string[]) => void;

  setSaveStatus: (s: SaveStatus) => void;
  markSaved: (t: number) => void;
  setHydrated: () => void;
  importResume: (r: Resume) => string;
  replaceAll: (rs: Resume[]) => void;
}
const LS_KEY = "resio.store.v1";
// pre-rebrand key — migrated on load so existing users keep their resumes
const LEGACY_LS_KEY = "biresume.store.v1";

export const loadFromDisk = (): { resumes: Resume[] } => {
  if (typeof window === "undefined") return { resumes: [] };
  try {
    const raw = localStorage.getItem(LS_KEY) ?? localStorage.getItem(LEGACY_LS_KEY);
    if (!raw) return { resumes: [] };
    const parsed = JSON.parse(raw);
    return { resumes: Array.isArray(parsed.resumes) ? parsed.resumes : [] };
  } catch {
    return { resumes: [] };
  }
};

const saveToDisk = (resumes: Resume[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ resumes }));
    // migration complete — the legacy key is no longer needed
    if (localStorage.getItem(LEGACY_LS_KEY)) localStorage.removeItem(LEGACY_LS_KEY);
  } catch {
    console.warn("Save failed (storage full?)");
  }
};

let timer: ReturnType<typeof setTimeout> | null = null;

export const useStore = create<AppState>((set, get) => {
  /** Debounced persistence with save-status pipeline. */
  const scheduleSave = () => {
    set({ saveStatus: "dirty" });
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      set({ saveStatus: "saving" });
      saveToDisk(get().resumes);
      set({ saveStatus: "saved", lastSavedAt: Date.now() });
    }, 500);
  };

  return {
    resumes: [],
    activeId: null,
    saveStatus: "saved",
    lastSavedAt: null,
    hydrated: false,

    createResume: (name, opts) => {
      const r = makeResume(name, opts);
      set((s) => ({ resumes: [...s.resumes, r], activeId: r.id }));
      scheduleSave();
      return r.id;
    },

    duplicateResume: (id) => {
      const src = get().resumes.find((r) => r.id === id);
      if (!src) return null;
      const copy = structuredClone(src);
      copy.id = uid();
      copy.name = `${src.name} (2)`;
      copy.createdAt = Date.now();
      copy.updatedAt = Date.now();
      set((s) => ({ resumes: [...s.resumes, copy] }));
      scheduleSave();
      return copy.id;
    },

    deleteResume: (id) => {
      set((s) => ({
        resumes: s.resumes.filter((r) => r.id !== id),
        activeId: s.activeId === id ? null : s.activeId,
      }));
      scheduleSave();
    },

    renameResume: (id, name) => {
      set((s) => ({
        resumes: s.resumes.map((r) => (r.id === id ? { ...r, name } : r)),
      }));
      scheduleSave();
    },

    setActive: (id) => set({ activeId: id }),

    getResume: (id) => (id ? get().resumes.find((r) => r.id === id) : undefined),

    update: (id, fn) => {
      set((s) => ({
        resumes: s.resumes.map((r) => {
          if (r.id !== id) return r;
          const copy = structuredClone(r);
          fn(copy);
          copy.updatedAt = Date.now();
          return copy;
        }),
      }));
      scheduleSave();
    },

    addSection: (resumeId, kind) => {
      // New sections come pre-filled with sample content (no blank pages).
      const r = makeSection(kind, true);
      get().update(resumeId, (res) => {
        res.sections[r.id] = r;
        res.sectionOrder.push(r.id);
      });
      return r.id;
    },

    removeSection: (resumeId, sectionId) => {
      get().update(resumeId, (res) => {
        const s = res.sections[sectionId];
        if (!s || s.locked) return;
        delete res.sections[sectionId];
        res.sectionOrder = res.sectionOrder.filter((x) => x !== sectionId);
      });
    },

    toggleSectionVisible: (resumeId, sectionId) => {
      get().update(resumeId, (res) => {
        const s = res.sections[sectionId];
        if (s) s.visible = !s.visible;
      });
    },

    reorderSections: (resumeId, ids) => {
      get().update(resumeId, (res) => {
        res.sectionOrder = ids;
      });
    },

    setSaveStatus: (st) => set({ saveStatus: st }),
    markSaved: (t) => set({ saveStatus: "saved", lastSavedAt: t }),
    setHydrated: () => set({ hydrated: true }),

    importResume: (r) => {
      const id = uid();
      const copy = JSON.parse(JSON.stringify(r));
      copy.id = id;
      copy.updatedAt = Date.now();
      set((s) => ({ resumes: [...s.resumes, copy] }));
      scheduleSave();
      return id;
    },

    replaceAll: (rs) => {
      set({ resumes: rs });
      scheduleSave();
    },
  };
});
