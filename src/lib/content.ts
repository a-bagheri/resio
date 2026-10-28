import type { OutputLang, ResumeSection } from "./types";
import { formatDate } from "./utils";

// ============================================================
// Content inspection and formatting helpers shared by the
// document renderer, the completeness score and all exporters.
// ============================================================

/** Whether a section holds any renderable content. */
export const sectionHasContent = (s: ResumeSection): boolean => {
  const d = s.data as never;
  if (s.kind === "summary" || s.kind === "interests" || s.kind === "hobbies") {
    const t = d as { fa: string; en: string };
    return !!(t.fa?.trim() || t.en?.trim());
  }
  if (s.kind === "custom") {
    const c = d as { entries: unknown[] };
    return (c.entries?.length ?? 0) > 0;
  }
  return ((d as unknown[]).length ?? 0) > 0;
};

/** "Jun 2021 – Present"-style range, formatted per the design settings. */
export const formatDateRange = (
  e: { start: string; end: string; present?: boolean },
  lang: OutputLang,
  dateFormat: string,
): string => {
  const start = e.start ? formatDate(e.start, lang, dateFormat) : "";
  const end = e.present
    ? lang === "fa" ? "اکنون" : "Present"
    : e.end
      ? formatDate(e.end, lang, dateFormat)
      : "";
  if (start && end) return `${start} – ${end}`;
  return start || end;
};
