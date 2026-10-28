import { clsx, type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// ============================================================
// Bilingual helpers
// ============================================================

/** Pick the value of a bilingual field; falls back to the other language if empty. */
export const pick = (
  t: { fa: string; en: string } | undefined,
  lang: "fa" | "en",
): string => {
  if (!t) return "";
  const v = t[lang];
  if (v && v.trim()) return v;
  return t[lang === "fa" ? "en" : "fa"] || "";
};

// ============================================================
// Numbers
// ============================================================

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export const toFaDigits = (s: string): string =>
  s.replace(/[0-9]/g, (d) => FA_DIGITS[+d]);

export const toEnDigits = (s: string): string =>
  s.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));

// ============================================================
// Dates
// ============================================================

/** "YYYY-MM" or "YYYY-MM-DD" → { y, m } */
export const parseYM = (v: string): { y: number; m: number } | null => {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})/.exec(v.trim());
  if (!m) return null;
  const y = +m[1];
  const mo = +m[2];
  if (mo < 1 || mo > 12) return null;
  return { y, m: mo };
};

/** Gregorian "2024-09" → Jalali "1403/06" (en digits when en=true). */
export const toJalali = (ym: string, en = false): string => {
  const d = parseYM(ym);
  if (!d) return ym || "";
  try {
    const fmt = new Intl.DateTimeFormat("en-u-ca-persian", {
      year: "numeric",
      month: "2-digit",
      timeZone: "UTC",
    });
    const parts = fmt.formatToParts(new Date(Date.UTC(d.y, d.m - 1, 15)));
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
    const year = get("year").replace(/[^0-9]/g, "");
    const month = get("month");
    if (!year || !month) return ym;
    const out = `${year}/${month}`;
    return en ? out : toFaDigits(out);
  } catch {
    return ym;
  }
};

const MONTHS_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTHS_FA = [
  "ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن",
  "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر",
];

/** Format a DateValue ("YYYY-MM") per design settings and language. */
export const formatDate = (
  v: string,
  lang: "fa" | "en",
  mode: string = "gregorian",
): string => {
  if (!v) return "";
  if (mode === "jalali") return toJalali(v, lang === "en");
  const d = parseYM(v);
  if (!d) return v;
  if (mode === "short") return lang === "fa" ? toFaDigits(String(d.y)) : String(d.y);
  return lang === "fa"
    ? `${MONTHS_FA[d.m - 1]} ${toFaDigits(String(d.y))}`
    : `${MONTHS_EN[d.m - 1]} ${d.y}`;
};

// ============================================================
// File helpers
// ============================================================

export const slugify = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "resume";

export const sanitizeFilename = (s: string): string =>
  s.replace(/[\\/:*?"<>|]/g, "").slice(0, 80) || "resume";

export const downloadBlob = (blob: Blob, filename: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 400);
};

export const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
