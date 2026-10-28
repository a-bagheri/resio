import type { Resume, ResumeSection, SectionKind } from "./types";
import { pick } from "./utils";
import { sectionHasContent } from "./content";

// ============================================================
// Resume completeness engine — offline heuristic checks with
// weights, plus a rough page-count estimate for the length check.
// ============================================================

export interface ScoreCheck {
  id: string;
  /** Bilingual label shown in the checklist. */
  label: { fa: string; en: string };
  severity: "error" | "warn";
  weight: number;
  passed: boolean;
  /** Section id or "__personal__" to navigate to; null = no target. */
  target: string | null;
}

export interface ResumeScore {
  percent: number;
  checks: ScoreCheck[];
  /** Rough page estimate used by the length check. */
  pages: number;
}

const hasDigit = (s: string): boolean => /[0-9۰-۹]/.test(s);

const sentenceCount = (s: string): number =>
  s.split(/[.!?؟…]+\s*|\n+/).map((x) => x.trim()).filter(Boolean).length;

/** Rough rendered-character count of a section's data (one language only). */
const dataChars = (data: unknown): number => {
  if (Array.isArray(data)) return data.reduce((n, x) => n + dataChars(x), 0);
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    // bilingual pair → only one language is rendered at a time
    if (typeof o.fa === "string" && typeof o.en === "string") {
      return Math.max(o.fa.length, o.en.length);
    }
    let n = 0;
    for (const [k, v] of Object.entries(o)) {
      if (k === "id") continue;
      n += dataChars(v);
    }
    return n;
  }
  return typeof data === "string" ? data.length : 0;
};

const estimatePages = (r: Resume, sections: ResumeSection[]): number => {
  const p = r.personal;
  let chars = pick(p.name, r.outputLang).length
    + pick(p.title, r.outputLang).length
    + pick(p.location, r.outputLang).length
    + p.email.length + p.phone.length;
  for (const s of sections) chars += dataChars(s.data);

  const a4 = r.design.page !== "letter";
  const baseW = a4 ? 182 : 187; // usable mm at 14mm margins
  const width = (a4 ? 210 : 216) - 2 * r.design.margin;
  const fontFactor = (10.5 / r.design.fontSize) * (1.45 / r.design.lineHeight);
  const charsPerPage = 3400 * fontFactor * (width / baseW);
  return Math.max(1, Math.ceil(chars / charsPerPage));
};

const entryCount = (data: unknown): number => (Array.isArray(data) ? data.length : 0);

export const scoreResume = (r: Resume): ResumeScore => {
  const L = r.outputLang;
  const p = r.personal;
  const sections = r.sectionOrder
    .map((id) => r.sections[id])
    .filter((s): s is ResumeSection => !!s);

  const byKind = (kind: SectionKind): ResumeSection | undefined =>
    sections.find((s) => s.kind === kind);

  // ---- personal checks ----------------------------------------------------
  const name = pick(p.name, L).trim();
  const title = pick(p.title, L).trim();

  // ---- summary ------------------------------------------------------------
  const sumSec = byKind("summary");
  const sumText = sumSec ? pick(sumSec.data as { fa: string; en: string }, L).trim() : "";
  const sumWords = sumText ? sumText.split(/\s+/).filter(Boolean).length : 0;
  const summaryOk = !!sumSec && sectionHasContent(sumSec) && sumWords >= 15 && sentenceCount(sumText) >= 2;

  // ---- experience ---------------------------------------------------------
  type Bi = { fa: string; en: string };
  const expSec = byKind("experience");
  const expList = (expSec?.data as { title?: Bi; achievements?: Bi }[] | undefined) || [];
  const expOk = expList.some((e) => pick(e.title, L).trim());
  const numbersOk =
    expList.some((e) => hasDigit(pick(e.achievements, L))) ||
    (() => {
      const prjSec = byKind("projects");
      const prjList = (prjSec?.data as { achievements?: Bi }[] | undefined) || [];
      return prjList.some((e) => hasDigit(pick(e.achievements, L)));
    })();

  // ---- skills / education -------------------------------------------------
  const skSec = byKind("skills");
  const skillCount = skSec
    ? ((skSec.data as { skills: { name: string }[] }[]) || [])
      .reduce((n, c) => n + c.skills.filter((s) => s.name.trim()).length, 0)
    : 0;
  const eduOk = entryCount(byKind("education")?.data) > 0;

  const visible = sections.filter((s) => s.visible && sectionHasContent(s));
  const pages = estimatePages(r, visible);

  const mk = (
    id: string,
    label: { fa: string; en: string },
    severity: "error" | "warn",
    weight: number,
    passed: boolean,
    target: string | null,
  ): ScoreCheck => ({ id, label, severity, weight, passed, target });

  const checks: ScoreCheck[] = [
    mk("name",
      { fa: "نام و نام خانوادگی را در اطلاعات شخصی وارد کنید", en: "Add your full name in personal info" },
      "error", 10, !!name, "__personal__"),
    mk("jobTitle",
      { fa: "عنوان شغلی خود را مشخص کنید", en: "Add a professional title" },
      "warn", 5, !!title, "__personal__"),
    mk("email",
      { fa: "ایمیل تماس خالی است", en: "Contact email is missing" },
      "error", 10, !!p.email.trim(), "__personal__"),
    mk("phone",
      { fa: "شماره تلفن خالی است", en: "Phone number is missing" },
      "warn", 5, !!p.phone.trim(), "__personal__"),
    mk("summary",
      { fa: "خلاصه رزومه کوتاه است — حداقل دو جمله بنویسید", en: "Summary is too short — write at least two sentences" },
      "warn", 15, summaryOk, sumSec?.id ?? null),
    mk("experience",
      { fa: "حداقل یک سابقه کاری اضافه کنید", en: "Add at least one work experience entry" },
      "error", 15, expOk, expSec?.id ?? null),
    mk("numbers",
      { fa: "در دستاوردها عدد و رقم بیاورید (مثلاً ۲۰٪ یا ۱۵ نفر)", en: "Quantify achievements with numbers (e.g. 20%, 15 people)" },
      "warn", 10, numbersOk, expSec?.id ?? null),
    mk("skills",
      { fa: "حداقل ۵ مهارت وارد کنید", en: "List at least 5 skills" },
      "warn", 15, skillCount >= 5, skSec?.id ?? null),
    mk("education",
      { fa: "بخش تحصیلات را کامل کنید", en: "Fill in the education section" },
      "warn", 10, eduOk, byKind("education")?.id ?? null),
    mk("pages",
      { fa: "حجم رزومه بیش از دو صفحه تخمین زده می‌شود", en: "Resume is estimated to exceed two pages" },
      "warn", 5, pages <= 2, null),
  ];

  const percent = Math.round(
    checks.reduce((n, c) => n + (c.passed ? c.weight : 0), 0),
  );

  return { percent, checks, pages };
};
