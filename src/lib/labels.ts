import type { OutputLang } from "./types";

// ============================================================
// Human-readable labels for enum-ish resume fields, per output
// language. Shared by the document renderer and all exporters.
// ============================================================

export const EMPLOYMENT_TYPE_LABELS: Record<OutputLang, Record<string, string>> = {
  fa: {
    "full-time": "تمام‌وقت",
    "part-time": "پاره‌وقت",
    contract: "قراردادی",
    internship: "کارآموزی",
    freelance: "فریلنس",
    "self-employed": "کار شخصی",
    "research-assistant": "دستیار پژوهشی",
    "teaching-assistant": "دستیار آموزشی",
  },
  en: {
    "full-time": "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    internship: "Internship",
    freelance: "Freelance",
    "self-employed": "Self-employed",
    "research-assistant": "Research assistant",
    "teaching-assistant": "Teaching assistant",
  },
};

export const PUBLICATION_TYPE_LABELS: Record<OutputLang, Record<string, string>> = {
  fa: {
    journal: "مقاله ژورنالی",
    conference: "مقاله کنفرانسی",
    "book-chapter": "فصل کتاب",
    thesis: "پایان‌نامه",
    preprint: "پیش‌چاپ",
    patent: "ثبت اختراع",
    other: "سایر",
  },
  en: {
    journal: "Journal paper",
    conference: "Conference paper",
    "book-chapter": "Book chapter",
    thesis: "Thesis",
    preprint: "Preprint",
    patent: "Patent",
    other: "Other",
  },
};

/** Skill proficiency levels plus CEFR grades (A1–C2) and "native". */
export const LEVEL_LABELS: Record<OutputLang, Record<string, string>> = {
  fa: {
    novice: "مبتدی",
    beginner: "آشنایی",
    intermediate: "متوسط",
    advanced: "پیشرفته",
    expert: "تسلط کامل",
    native: "زبان مادری",
    A1: "A1",
    A2: "A2",
    B1: "B1",
    B2: "B2",
    C1: "C1",
    C2: "C2",
  },
  en: {
    novice: "Novice",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
    native: "Native",
    A1: "A1",
    A2: "A2",
    B1: "B1",
    B2: "B2",
    C1: "C1",
    C2: "C2",
  },
};
