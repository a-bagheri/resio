import type { DesignSettings } from "./types";

// ============================================================
// Template definitions — pure presets consumed by the renderer
// ============================================================

export type AtsRating = "friendly" | "partial" | "not-recommended";

export interface TemplateDef {
  id: string;
  name: { fa: string; en: string };
  description: { fa: string; en: string };
  ats: AtsRating;
  primary: string;
  secondary: string;
  accent: string;
  font: DesignSettings["fontFamily"];
  headerStyle: DesignSettings["headerStyle"];
  sidebar: boolean;
  serif: boolean; // serif body font in the document
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "minimal",
    name: { fa: "مینیمال", en: "Minimal" },
    description: {
      fa: "ساده و تمیز، مناسب هر رشته‌ای",
      en: "Clean and simple, suitable for any field",
    },
    ats: "friendly",
    primary: "#111827",
    secondary: "#374151",
    accent: "#2563eb",
    font: "inter",
    headerStyle: "minimal",
    sidebar: false,
    serif: false,
  },
  {
    id: "modern",
    name: { fa: "مدرن", en: "Modern" },
    description: {
      fa: "با نوار کناری رنگی برای اطلاعات تماس",
      en: "Colored sidebar for contact details",
    },
    ats: "partial",
    primary: "#1e3a8a",
    secondary: "#334155",
    accent: "#0ea5e9",
    font: "inter",
    headerStyle: "sidebar",
    sidebar: true,
    serif: false,
  },
  {
    id: "professional",
    name: { fa: "حرفه‌ای", en: "Professional" },
    description: {
      fa: "چیدمان کلاسیک دو ستونه سرصفحه",
      en: "Classic layout with split header",
    },
    ats: "friendly",
    primary: "#0f2c4c",
    secondary: "#374151",
    accent: "#1d4ed8",
    font: "roboto",
    headerStyle: "split",
    sidebar: false,
    serif: false,
  },
  {
    id: "engineering",
    name: { fa: "مهندسی", en: "Engineering" },
    description: {
      fa: "تأکید بر پروژه‌ها و مهارت‌های فنی",
      en: "Emphasis on projects and technical skills",
    },
    ats: "friendly",
    primary: "#0f172a",
    secondary: "#334155",
    accent: "#0d9488",
    font: "inter",
    headerStyle: "banner",
    sidebar: false,
    serif: false,
  },
  {
    id: "technical",
    name: { fa: "تکنیکال", en: "Technical" },
    description: {
      fa: "متراکم و کارآمد برای رزومه‌های پر از محتوا",
      en: "Dense and efficient for content-heavy resumes",
    },
    ats: "friendly",
    primary: "#111827",
    secondary: "#4b5563",
    accent: "#4f46e5",
    font: "roboto",
    headerStyle: "minimal",
    sidebar: false,
    serif: false,
  },
  {
    id: "academic",
    name: { fa: "آکادمیک", en: "Academic" },
    description: {
      fa: "سبک سرِیف، مناسب CV دانشگاهی",
      en: "Serif style for academic CVs",
    },
    ats: "friendly",
    primary: "#1c1917",
    secondary: "#44403c",
    accent: "#7c2d12",
    font: "merriweather",
    headerStyle: "centered",
    sidebar: false,
    serif: true,
  },
  {
    id: "research",
    name: { fa: "پژوهشی", en: "Research" },
    description: {
      fa: "با تأکید بر مقالات و پژوهش‌ها",
      en: "Highlights publications and research",
    },
    ats: "friendly",
    primary: "#134e4a",
    secondary: "#374151",
    accent: "#0f766e",
    font: "georgia",
    headerStyle: "split",
    sidebar: false,
    serif: true,
  },
  {
    id: "executive",
    name: { fa: "مدیریتی", en: "Executive" },
    description: {
      fa: "ظاهر رسمی و باوقار برای سطوح ارشد",
      en: "Formal, authoritative look for senior roles",
    },
    ats: "partial",
    primary: "#292524",
    secondary: "#57534e",
    accent: "#9f1239",
    font: "georgia",
    headerStyle: "banner",
    sidebar: false,
    serif: true,
  },
  {
    id: "compact",
    name: { fa: "فشرده", en: "Compact" },
    description: {
      fa: "حداکثر محتوا در حداقل فضا؛ مناسب ATS",
      en: "Maximum content, minimum space; ATS-safe",
    },
    ats: "friendly",
    primary: "#1e293b",
    secondary: "#475569",
    accent: "#0369a1",
    font: "roboto",
    headerStyle: "centered",
    sidebar: false,
    serif: false,
  },
  {
    id: "creative",
    name: { fa: "خلاقانه", en: "Creative" },
    description: {
      fa: "ستون کناری بنفش با ظاهر جذاب برای حوزه‌های خلاق",
      en: "Violet sidebar with a striking look for creative fields",
    },
    ats: "partial",
    primary: "#2e1065",
    secondary: "#4c1d95",
    accent: "#7c3aed",
    font: "inter",
    headerStyle: "sidebar",
    sidebar: true,
    serif: false,
  },
  {
    id: "elegant",
    name: { fa: "شیک", en: "Elegant" },
    description: {
      fa: "سرِیف ظریف با لهجه طلایی برای مشاغل رسمی و هنری",
      en: "Refined serif with a golden accent for formal and artistic roles",
    },
    ats: "friendly",
    primary: "#1c1917",
    secondary: "#57534e",
    accent: "#b45309",
    font: "georgia",
    headerStyle: "centered",
    sidebar: false,
    serif: true,
  },
  {
    id: "graduate",
    name: { fa: "دانش‌آموخته", en: "Graduate" },
    description: {
      fa: "مناسب شروع کار؛ تأکید بر تحصیلات و پروژه‌ها",
      en: "For early careers; emphasizes education and projects",
    },
    ats: "friendly",
    primary: "#1e40af",
    secondary: "#475569",
    accent: "#3b82f6",
    font: "vazirmatn",
    headerStyle: "banner",
    sidebar: false,
    serif: false,
  },
  {
    id: "startup",
    name: { fa: "استارتاپی", en: "Startup" },
    description: {
      fa: "رنگ‌های زنده و چیدمان پرانرژی برای شرکت‌های نوپا",
      en: "Vivid colors and a dynamic layout for startups",
    },
    ats: "friendly",
    primary: "#134e4a",
    secondary: "#374151",
    accent: "#10b981",
    font: "inter",
    headerStyle: "split",
    sidebar: false,
    serif: false,
  },
  {
    id: "designer",
    name: { fa: "طراح", en: "Designer" },
    description: {
      fa: "کنتراست بالا با لهجه نارنجی، مناسب پورتفولیو",
      en: "High contrast with an orange accent, great for portfolios",
    },
    ats: "partial",
    primary: "#18181b",
    secondary: "#3f3f46",
    accent: "#ea580c",
    font: "inter",
    headerStyle: "sidebar",
    sidebar: true,
    serif: false,
  },
  {
    id: "classic",
    name: { fa: "کلاسیک", en: "Classic" },
    description: {
      fa: "ترکیب سنتی و محترمانه با فونت سرِیف تیره",
      en: "Traditional, dignified composition in a dark serif",
    },
    ats: "friendly",
    primary: "#111827",
    secondary: "#374151",
    accent: "#6b7280",
    font: "merriweather",
    headerStyle: "minimal",
    sidebar: false,
    serif: true,
  },
  {
    id: "medical",
    name: { fa: "پزشکی", en: "Medical" },
    description: {
      fa: "تمیز و آرام با سبز ملایم، مناسب سلامت و علوم",
      en: "Clean and calm with a soft green for health & sciences",
    },
    ats: "friendly",
    primary: "#14532d",
    secondary: "#3f6212",
    accent: "#16a34a",
    font: "roboto",
    headerStyle: "centered",
    sidebar: false,
    serif: false,
  },
];

export const getTemplate = (id: string): TemplateDef =>
  TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

export const defaultDesign = (templateId: string): DesignSettings => {
  const t = getTemplate(templateId);
  return {
    templateId: t.id,
    primary: t.primary,
    secondary: t.secondary,
    accent: t.accent,
    fontFamily: t.font,
    fontSize: 10.5,
    headingSize: 13,
    lineHeight: 1.45,
    margin: 14,
    sectionSpacing: 18,
    page: "a4",
    headerStyle: t.headerStyle,
    footer: "page-number",
    columns: 1,
    sidebar: t.sidebar,
    sidebarSide: "start",
    separator: "line",
    dateFormat: "gregorian",
    icons: true,
    showPhoto: true,
  };
};

// Predefined palettes (primary / secondary / accent)
export const PALETTES: { name: string; colors: [string, string, string] }[] = [
  { name: "Black + Blue", colors: ["#111827", "#374151", "#2563eb"] },
  { name: "Gray + Blue", colors: ["#1f2937", "#4b5563", "#3b82f6"] },
  { name: "Navy + Gray", colors: ["#0f2c4c", "#475569", "#64748b"] },
  { name: "Black + Teal", colors: ["#111827", "#374151", "#0d9488"] },
  { name: "Green + Gray", colors: ["#14532d", "#4b5563", "#16a34a"] },
  { name: "Black + Burgundy", colors: ["#1c1917", "#57534e", "#9f1239"] },
  { name: "Blue + Gray", colors: ["#1e3a8a", "#64748b", "#38bdf8"] },
];
