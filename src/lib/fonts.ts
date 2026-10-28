import type { FontChoice } from "./types";

// ============================================================
// Font registry — single source of truth for the selectable
// document fonts: UI labels, in-app CSS stacks (next/font
// variables), Word font names and exported-HTML stacks.
// ============================================================

export interface FontDef {
  id: FontChoice;
  label: { fa: string; en: string };
  /** In-app CSS font-family (next/font variables) for preview, print and UI. */
  stack: string;
  /** Family name written into .docx files (resolved by Word when installed). */
  docx: string;
  /** Google Fonts family spec used by exported single-file HTML; Persian
   *  families missing from Google Fonts fall back to Vazirmatn there. */
  googleFonts?: string;
  /** Fallback font-family for exported single-file HTML (no next/font there). */
  htmlStack: string;
}

export const FONTS: FontDef[] = [
  {
    id: "vazirmatn",
    label: { fa: "وزیرمتن", en: "Vazirmatn" },
    stack: "var(--font-vazirmatn), Tahoma, sans-serif",
    docx: "Vazirmatn",
    googleFonts: "Vazirmatn:wght@400;500;600;700",
    htmlStack: "'Vazirmatn', Tahoma, sans-serif",
  },
  {
    id: "estedad",
    label: { fa: "استعداد", en: "Estedad" },
    stack: "var(--font-estedad), var(--font-vazirmatn), Tahoma, sans-serif",
    docx: "Estedad",
    googleFonts: "Estedad:wght@400;500;600;700",
    htmlStack: "'Estedad', 'Vazirmatn', Tahoma, sans-serif",
  },
  {
    id: "shabnam",
    label: { fa: "شبنم", en: "Shabnam" },
    stack: "var(--font-shabnam), var(--font-vazirmatn), Tahoma, sans-serif",
    docx: "Shabnam",
    htmlStack: "'Shabnam', 'Vazirmatn', Tahoma, sans-serif",
  },
  {
    id: "notonaskh",
    label: { fa: "نوتو نسخ", en: "Noto Naskh" },
    stack: "var(--font-notonaskh), var(--font-vazirmatn), serif",
    docx: "Noto Naskh Arabic",
    googleFonts: "Noto+Naskh+Arabic:wght@400;500;600;700",
    htmlStack: "'Noto Naskh Arabic', 'Vazirmatn', serif",
  },
  {
    id: "inter",
    label: { fa: "اینتر", en: "Inter" },
    stack: "var(--font-inter), var(--font-vazirmatn), sans-serif",
    docx: "Inter",
    googleFonts: "Inter:wght@400;500;600;700",
    htmlStack: "'Inter', 'Segoe UI', Arial, sans-serif",
  },
  {
    id: "roboto",
    label: { fa: "روبوتو", en: "Roboto" },
    stack: "var(--font-roboto), var(--font-vazirmatn), sans-serif",
    docx: "Roboto",
    googleFonts: "Roboto:wght@400;500;700",
    htmlStack: "'Roboto', Arial, sans-serif",
  },
  {
    id: "georgia",
    label: { fa: "جورجیا", en: "Georgia" },
    // Georgia is a system font (Windows/macOS); Persian glyphs fall back to Naskh.
    stack: "Georgia, var(--font-notonaskh), serif",
    docx: "Georgia",
    htmlStack: "Georgia, 'Times New Roman', serif",
  },
  {
    id: "merriweather",
    label: { fa: "مری‌وادر", en: "Merriweather" },
    stack: "var(--font-merriweather), Georgia, var(--font-notonaskh), serif",
    docx: "Merriweather",
    googleFonts: "Merriweather:wght@400;700",
    htmlStack: "'Merriweather', Georgia, serif",
  },
];

export const getFont = (id: string): FontDef =>
  FONTS.find((f) => f.id === id) ?? FONTS[0];

/** In-app CSS font-family for a design.fontFamily value. */
export const fontStack = (id: string): string => getFont(id).stack;
