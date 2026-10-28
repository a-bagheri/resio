// ============================================================
// Core data model — bilingual-first resume schema
// ============================================================

/** A bilingual text value: Persian (fa) and English (en) stored separately. */
export type BiText = { fa: string; en: string };
export type Bi<T> = { fa: T; en: T };

export const emptyText = (): BiText => ({ fa: "", en: "" });

/** Output language for a resume. */
export type OutputLang = "fa" | "en";

// ---------- Personal info ----------

export interface SocialLink {
  id: string;
  label: string; // e.g. "Portfolio", "ORCID" — free text
  url: BiText;
}

export interface PersonalInfo {
  name: BiText;
  title: BiText;
  photo: string; // data URL or ""
  email: string;
  phone: string;
  location: BiText;
  website: string;
  linkedin: string;
  github: string;
  scholar: string;
  orcid: string;
  otherLinks: SocialLink[];
}

// ---------- Date handling ----------

export type DateValue = string; // "YYYY-MM" or "" — Jalali rendered from Gregorian
export type DateRange = { start: DateValue; end: DateValue; present?: boolean };

export const dateRangeText = (
  r: DateRange | { start: string; end: string; present?: boolean },
  presentLabel: BiText = { fa: "اکنون", en: "Present" },
): string => {
  const s = r.start || "";
  const e = r.present ? "__present__" : r.end || "";
  if (!s && !e) return "";
  if (s && e) return `${s} – ${e}`;
  return s || e;
};

// ---------- Education ----------

export interface Education {
  id: string;
  degree: BiText;
  field: BiText;
  university: BiText;
  location: BiText;
  start: DateValue;
  end: DateValue;
  present: boolean;
  gpa: BiText;
  thesisTitle: BiText;
  thesisDescription: BiText;
  courses: BiText;
  achievements: BiText;
}

// ---------- Experience ----------

export type EmploymentType =
  | ""
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "freelance"
  | "self-employed"
  | "research-assistant"
  | "teaching-assistant";

export interface Experience {
  id: string;
  title: BiText;
  company: BiText;
  location: BiText;
  employmentType: EmploymentType;
  start: DateValue;
  end: DateValue;
  present: boolean;
  responsibilities: BiText;
  achievements: BiText;
  technologies: BiText;
  projects: BiText;
}

// ---------- Skills ----------

export type SkillLevel = "" | "novice" | "beginner" | "intermediate" | "advanced" | "expert";

export interface Skill {
  id: string;
  name: string; // technical terms are language-neutral (e.g. "ANSYS", "Python")
  level: SkillLevel;
  years: string;
  description: BiText;
}

export interface SkillCategory {
  id: string;
  name: BiText;
  skills: Skill[];
}

// ---------- Projects ----------

export interface ProjectLink {
  id: string;
  label: string;
  url: string;
}

export interface Project {
  id: string;
  name: BiText;
  role: BiText;
  organization: BiText;
  start: DateValue;
  end: DateValue;
  present: boolean;
  description: BiText;
  responsibilities: BiText;
  achievements: BiText;
  technologies: BiText;
  software: BiText;
  hardware: BiText;
  results: BiText;
  links: ProjectLink[];
}

// ---------- Research ----------

export interface ResearchExperience {
  id: string;
  position: BiText;
  institution: BiText;
  topic: BiText;
  start: DateValue;
  end: DateValue;
  present: boolean;
  description: BiText;
  methodology: BiText;
  tools: BiText;
  results: BiText;
}

// ---------- Publications ----------

export type PublicationType =
  | "journal"
  | "conference"
  | "book-chapter"
  | "thesis"
  | "preprint"
  | "patent"
  | "other";

export interface Publication {
  id: string;
  title: BiText;
  authors: BiText;
  venue: BiText;
  year: string;
  doi: string;
  url: string;
  type: PublicationType;
  abstract: BiText;
}

// ---------- Conferences ----------

export interface ConferenceEntry {
  id: string;
  name: BiText;
  talk: BiText;
  location: BiText;
  date: DateValue;
  role: BiText;
}

// ---------- Certifications ----------

export interface Certification {
  id: string;
  name: BiText;
  issuer: BiText;
  issueDate: DateValue;
  expiryDate: DateValue;
  credentialId: string;
  url: string;
}

// ---------- Awards ----------

export interface Award {
  id: string;
  name: BiText;
  organization: BiText;
  date: DateValue;
  description: BiText;
}

// ---------- Languages ----------

export type LangLevel = "" | "native" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface LanguageSkill {
  id: string;
  language: BiText;
  reading: LangLevel;
  writing: LangLevel;
  speaking: LangLevel;
  listening: LangLevel;
  overall: LangLevel;
}

// ---------- Courses ----------

export interface Course {
  id: string;
  name: BiText;
  provider: BiText;
  date: DateValue;
  duration: BiText;
  description: BiText;
}

// ---------- Volunteer ----------

export interface Volunteer {
  id: string;
  role: BiText;
  organization: BiText;
  location: BiText;
  start: DateValue;
  end: DateValue;
  present: boolean;
  description: BiText;
}

// ---------- Memberships ----------

export interface Membership {
  id: string;
  organization: BiText;
  role: BiText;
  start: DateValue;
  end: DateValue;
  present: boolean;
  description: BiText;
}

// ---------- Teaching ----------

export interface Teaching {
  id: string;
  role: BiText;
  institution: BiText;
  course: BiText;
  start: DateValue;
  end: DateValue;
  present: boolean;
  description: BiText;
}

// ---------- Patents ----------

export interface Patent {
  id: string;
  title: BiText;
  inventors: BiText;
  office: BiText;
  number: string;
  date: DateValue;
  status: BiText;
  description: BiText;
}

// ---------- References ----------

export interface Reference {
  id: string;
  name: BiText;
  position: BiText;
  organization: BiText;
  contact: BiText;
}

// ---------- Custom sections ----------

export interface CustomEntry {
  id: string;
  title: BiText;
  subtitle: BiText;
  date: BiText;
  body: BiText;
}

export interface CustomSection {
  id: string;
  title: BiText;
  entries: CustomEntry[];
}

// ============================================================
// Section registry — the resume body is a list of sections
// ============================================================

export type SectionKind =
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "research"
  | "publications"
  | "conferences"
  | "certifications"
  | "awards"
  | "languages"
  | "courses"
  | "volunteer"
  | "memberships"
  | "teaching"
  | "patents"
  | "interests"
  | "hobbies"
  | "references"
  | "custom";

export type SectionDataMap = {
  summary: BiText;
  skills: SkillCategory[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  research: ResearchExperience[];
  publications: Publication[];
  conferences: ConferenceEntry[];
  certifications: Certification[];
  awards: Award[];
  languages: LanguageSkill[];
  courses: Course[];
  volunteer: Volunteer[];
  memberships: Membership[];
  teaching: Teaching[];
  patents: Patent[];
  interests: BiText;
  hobbies: BiText;
  references: Reference[];
  custom: CustomSection;
};

export type SectionEntry<K extends SectionKind> = SectionDataMap[K];

export interface ResumeSection {
  id: string;
  kind: SectionKind;
  title: BiText; // user-overridable section heading
  visible: boolean;
  locked?: boolean; // required sections cannot be deleted
  columns?: 1 | 2; // column split (skills, languages, interests...); 1 = normal
  data: SectionDataMap[SectionKind];
}

// ============================================================
// Design / layout settings
// ============================================================

export type PageSize = "a4" | "letter";
export type HeaderStyle = "banner" | "sidebar" | "centered" | "split" | "minimal";
export type FooterStyle = "none" | "page-number" | "name-page";
export type FontChoice = "vazirmatn" | "inter" | "georgia" | "roboto" | "merriweather";

export interface DesignSettings {
  templateId: string;
  primary: string;
  secondary: string;
  accent: string;
  fontFamily: FontChoice;
  fontSize: number; // pt
  headingSize: number; // pt
  lineHeight: number;
  margin: number; // mm
  sectionSpacing: number; // px
  page: PageSize;
  headerStyle: HeaderStyle;
  footer: FooterStyle;
  columns: 1 | 2; // body columns (1 recommended)
  sidebar: boolean;
  sidebarSide: "start" | "end";
  separator: "line" | "underline" | "none";
  dateFormat: "gregorian" | "jalali" | "short";
  icons: boolean;
  showPhoto: boolean;
}

// ============================================================
// Resume root
// ============================================================

export interface Resume {
  id: string;
  name: string; // local resume name (e.g. "Engineering Resume")
  createdAt: number;
  updatedAt: number;
  outputLang: OutputLang;
  personal: PersonalInfo;
  sectionOrder: string[]; // ordered section ids
  sections: Record<string, ResumeSection>;
  design: DesignSettings;
}

// ============================================================
// Section kind metadata (i18n labels, defaults)
// ============================================================

export const SECTION_META: Record<
  SectionKind,
  {
    title: BiText;
    icon: string;
    required: boolean;
    tabular: boolean; // entries with date ranges → timeline style
    defaultColumns?: 1 | 2;
  }
> = {
  summary: { title: { fa: "خلاصه رزومه", en: "Summary" }, icon: "text", required: true, tabular: false, defaultColumns: 1 },
  skills: { title: { fa: "مهارت‌های فنی", en: "Technical Skills" }, icon: "cpu", required: true, tabular: false, defaultColumns: 2 },
  experience: { title: { fa: "سابقه کاری", en: "Work Experience" }, icon: "briefcase", required: true, tabular: true },
  education: { title: { fa: "تحصیلات", en: "Education" }, icon: "grad", required: true, tabular: true },
  projects: { title: { fa: "پروژه‌ها", en: "Projects" }, icon: "layers", required: false, tabular: true },
  research: { title: { fa: "سابقه پژوهشی", en: "Research Experience" }, icon: "flask", required: false, tabular: true },
  publications: { title: { fa: "مقالات", en: "Publications" }, icon: "book", required: false, tabular: false },
  conferences: { title: { fa: "کنفرانس‌ها", en: "Conferences" }, icon: "mic", required: false, tabular: false },
  certifications: { title: { fa: "گواهینامه‌ها", en: "Certifications" }, icon: "badge", required: false, tabular: false },
  awards: { title: { fa: "جوایز و افتخارات", en: "Awards & Achievements" }, icon: "star", required: false, tabular: false },
  languages: { title: { fa: "زبان‌ها", en: "Languages" }, icon: "globe", required: false, tabular: false, defaultColumns: 2 },
  courses: { title: { fa: "دوره‌ها و آموزش‌ها", en: "Courses & Training" }, icon: "cap", required: false, tabular: false },
  volunteer: { title: { fa: "فعالیت داوطلبانه", en: "Volunteer Experience" }, icon: "heart", required: false, tabular: true },
  memberships: { title: { fa: "عضویت‌های حرفه‌ای", en: "Professional Memberships" }, icon: "users", required: false, tabular: true },
  teaching: { title: { fa: "سابقه تدریس", en: "Teaching Experience" }, icon: "board", required: false, tabular: true },
  patents: { title: { fa: "ثبت اختراع", en: "Patents" }, icon: "doc", required: false, tabular: false },
  interests: { title: { fa: "علایق حرفه‌ای", en: "Professional Interests" }, icon: "target", required: false, tabular: false },
  hobbies: { title: { fa: "سرگرمی‌ها", en: "Hobbies & Interests" }, icon: "smile", required: false, tabular: false },
  references: { title: { fa: "معرف‌ها", en: "References" }, icon: "user", required: false, tabular: false },
  custom: { title: { fa: "بخش سفارشی", en: "Custom Section" }, icon: "plus", required: false, tabular: false },
};

export const SECTION_ORDER_DEFAULT: SectionKind[] = [
  "summary",
  "skills",
  "experience",
  "education",
  "projects",
  "research",
  "publications",
  "conferences",
  "certifications",
  "awards",
  "languages",
  "courses",
  "volunteer",
  "memberships",
  "teaching",
  "patents",
  "interests",
  "hobbies",
  "references",
];
