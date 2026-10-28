"use client";

import { useState } from "react";
import type { Resume, ResumeSection, SectionKind, BiText, CustomEntry } from "@/lib/types";
import { SECTION_META } from "@/lib/types";
import { useStore } from "@/lib/store";
import { uid, pick } from "@/lib/utils";
import { useI18n, SKILL_CATEGORY_PRESETS } from "@/lib/i18n";
import { TextInput, TextArea, Select, Labeled, Icon } from "./ui";
import { BiField, BiArea, BiList, DateRangeField } from "./bi-fields";
import { EntryCard } from "./entry-card";

// ============================================================
// Generic list-section editor (drives most entry types)
// ============================================================

type AnyEntry = Record<string, unknown> & { id: string };

interface FieldDef {
  key: string;
  labelKey: string;
  type: "bi" | "biarea" | "bilist" | "text" | "area" | "month" | "select" | "bool";
  options?: { value: string; label: string }[];
  rows?: number;
  half?: boolean;
  ph?: { fa: string; en: string }; // bilingual ghost text shown when empty
  phT?: string; // plain-text ghost text
}

/**
 * Schema-driven editor: each section kind declares its fields,
 * the generic renderer + EntryCard + drag reorder handles the rest.
 */
const FIELD_SCHEMAS: Partial<Record<SectionKind, FieldDef[]>> = {
  experience: [
    { key: "title", labelKey: "jobTitle", type: "bi", ph: { fa: "مثلاً: مهندس طراحی", en: "e.g. Design Engineer" } },
    { key: "company", labelKey: "company", type: "bi", ph: { fa: "نام شرکت", en: "Company name" } },
    { key: "location", labelKey: "location", type: "bi", ph: { fa: "شهر، کشور", en: "City, Country" } },
    { key: "employmentType", labelKey: "employmentType", type: "select", options: [] },
    { key: "start", labelKey: "startDate", type: "month", half: true },
    { key: "end", labelKey: "endDate", type: "month", half: true },
    { key: "present", labelKey: "present", type: "bool" },
    {
      key: "responsibilities", labelKey: "responsibilities", type: "bilist",
      ph: {
        fa: "یک مورد در هر خط:\nهمکاری در طراحی و اجرای پروژه‌های فنی\nتهیه مستندات و گزارش‌های پیشرفت",
        en: "One item per line:\nDesigned and delivered technical projects\nPrepared documentation and progress reports",
      },
    },
    {
      key: "achievements", labelKey: "achievements", type: "bilist",
      ph: { fa: "کاهش ۱۵٪ زمان تحویل با بهبود فرآیند\nحذف ۲۰٪ هزینه‌های اضافه", en: "Cut delivery time by 15% by improving the workflow\nReduced waste costs by 20%" },
    },
    { key: "technologies", labelKey: "technologies", type: "biarea", rows: 2, ph: { fa: "Python, SQL, Git", en: "Python, SQL, Git" } },
    { key: "projects", labelKey: "projectsField", type: "biarea", rows: 2, ph: { fa: "پروژه‌های انجام‌شده در این سمت", en: "Projects handled in this role" } },
  ],
  education: [
    { key: "degree", labelKey: "degree", type: "bi", ph: { fa: "کارشناسی / کارشناسی ارشد", en: "B.Sc. / M.Sc." } },
    { key: "field", labelKey: "field", type: "bi", ph: { fa: "مثلاً: مهندسی مکانیک", en: "e.g. Mechanical Engineering" } },
    { key: "university", labelKey: "university", type: "bi", ph: { fa: "نام دانشگاه", en: "University name" } },
    { key: "location", labelKey: "location", type: "bi", ph: { fa: "شهر، کشور", en: "City, Country" } },
    { key: "start", labelKey: "startDate", type: "month", half: true },
    { key: "end", labelKey: "endDate", type: "month", half: true },
    { key: "present", labelKey: "present", type: "bool" },
    { key: "gpa", labelKey: "gpa", type: "bi", half: true, ph: { fa: "۱۷٫۵ / ۲۰", en: "17.5 / 20" } },
    { key: "thesisTitle", labelKey: "thesisTitle", type: "bi", ph: { fa: "عنوان پایان‌نامه", en: "Thesis title" } },
    { key: "thesisDescription", labelKey: "thesisDescription", type: "biarea", ph: { fa: "شرح کوتاه پایان‌نامه و نتایج آن", en: "Short thesis description and its results" } },
    { key: "courses", labelKey: "coursesLabel", type: "biarea", rows: 2, ph: { fa: "دروس مرتبط با جایگاه هدف، با ویرگول جدا شود", en: "Comma-separated courses relevant to your target role" } },
    { key: "achievements", labelKey: "academicAchievements", type: "bilist", ph: { fa: "رتبه برتر کنکور، بورس تحصیلی، …", en: "Top rank, scholarship, …" } },
  ],
  projects: [
    { key: "name", labelKey: "projectName", type: "bi", ph: { fa: "مثلاً: سامانه پایش داده", en: "e.g. Data Monitoring System" } },
    { key: "role", labelKey: "role", type: "bi", ph: { fa: "نقش شما در پروژه", en: "Your role in the project" } },
    { key: "organization", labelKey: "organization", type: "bi", ph: { fa: "سازمان یا دانشگاه", en: "Organization / University" } },
    { key: "start", labelKey: "startDate", type: "month", half: true },
    { key: "end", labelKey: "endDate", type: "month", half: true },
    { key: "present", labelKey: "present", type: "bool" },
    { key: "description", labelKey: "description", type: "biarea", ph: { fa: "هدف، دامنه و خروجی اصلی پروژه در دو تا سه جمله", en: "Two to three sentences on the goal, scope and main output" } },
    { key: "responsibilities", labelKey: "responsibilities", type: "bilist", ph: { fa: "یک مورد در هر خط", en: "One item per line" } },
    { key: "achievements", labelKey: "technicalAchievements", type: "bilist", ph: { fa: "بهبود ۱۰٪ بهره‌وری با …", en: "Improved productivity by 10% by …" } },
    { key: "technologies", labelKey: "technologies", type: "biarea", rows: 2, ph: { fa: "Python, SQL", en: "Python, SQL" } },
    { key: "software", labelKey: "software", type: "biarea", rows: 2, ph: { fa: "SolidWorks, MATLAB", en: "SolidWorks, MATLAB" } },
    { key: "hardware", labelKey: "hardware", type: "biarea", rows: 2, ph: { fa: "آردوینو، سنسورها، …", en: "Arduino, sensors, …" } },
    { key: "results", labelKey: "results", type: "bilist", ph: { fa: "یک نتیجه کمی در هر خط", en: "One measurable result per line" } },
  ],
  research: [
    { key: "position", labelKey: "researchPosition", type: "bi", ph: { fa: "مثلاً: دستیار پژوهشی", en: "e.g. Research Assistant" } },
    { key: "institution", labelKey: "institution", type: "bi", ph: { fa: "نام دانشگاه یا مؤسسه", en: "University / Institute" } },
    { key: "topic", labelKey: "researchTopic", type: "bi", ph: { fa: "موضوع پژوهش", en: "Research topic" } },
    { key: "start", labelKey: "startDate", type: "month", half: true },
    { key: "end", labelKey: "endDate", type: "month", half: true },
    { key: "present", labelKey: "present", type: "bool" },
    { key: "description", labelKey: "description", type: "biarea", ph: { fa: "شرح پژوهش، نقش شما و همکاران", en: "Describe the research, your role and collaborators" } },
    { key: "methodology", labelKey: "methodology", type: "biarea", rows: 2, ph: { fa: "روش‌های کمّی، شبیه‌سازی عددی، …", en: "Quantitative methods, numerical simulation, …" } },
    { key: "tools", labelKey: "tools", type: "biarea", rows: 2, ph: { fa: "Python, SPSS", en: "Python, SPSS" } },
    { key: "results", labelKey: "results", type: "bilist", ph: { fa: "یافته‌های کلیدی، یک مورد در هر خط", en: "Key findings, one per line" } },
  ],
  publications: [
    { key: "title", labelKey: "publicationTitle", type: "bi", ph: { fa: "عنوان مقاله", en: "Paper title" } },
    { key: "authors", labelKey: "authors", type: "biarea", rows: 2, ph: { fa: "نام خانوادگی، نام؛ نویسنده دوم", en: "Lastname, Firstname; Second Author" } },
    { key: "venue", labelKey: "journal", type: "bi", ph: { fa: "نام مجله یا کنفرانس", en: "Journal / conference name" } },
    { key: "year", labelKey: "publicationDate", type: "text", half: true, phT: "2024" },
    { key: "doi", labelKey: "doi", type: "text", half: true, phT: "10.1000/xyz123" },
    { key: "url", labelKey: "linkUrl", type: "text", phT: "https://…" },
    { key: "type", labelKey: "publicationType", type: "select", options: [] },
    { key: "abstract", labelKey: "abstract", type: "biarea", ph: { fa: "چکیده کوتاه در دو تا سه جمله", en: "A short abstract in two to three sentences" } },
  ],
  conferences: [
    { key: "name", labelKey: "conferenceName", type: "bi", ph: { fa: "نام کنفرانس", en: "Conference name" } },
    { key: "talk", labelKey: "talkTitle", type: "bi", ph: { fa: "عنوان مقاله یا ارائه", en: "Paper / presentation title" } },
    { key: "location", labelKey: "location", type: "bi", ph: { fa: "شهر، کشور", en: "City, Country" } },
    { key: "date", labelKey: "date", type: "month" },
    { key: "role", labelKey: "roleInConf", type: "bi", ph: { fa: "ارائه‌دهنده، داور، …", en: "Speaker, reviewer, …" } },
  ],
  certifications: [
    { key: "name", labelKey: "certName", type: "bi", ph: { fa: "مثلاً: مدیریت پروژه حرفه‌ای", en: "e.g. Project Management Professional" } },
    { key: "issuer", labelKey: "issuer", type: "bi", ph: { fa: "نهاد صادرکننده", en: "Issuing organization" } },
    { key: "issueDate", labelKey: "issueDate", type: "month", half: true },
    { key: "expiryDate", labelKey: "expiryDate", type: "month", half: true },
    { key: "credentialId", labelKey: "credentialId", type: "text", half: true, phT: "ID-1234" },
    { key: "url", labelKey: "credentialUrl", type: "text", phT: "https://…" },
  ],
  awards: [
    { key: "name", labelKey: "awardName", type: "bi", ph: { fa: "نام جایزه یا افتخار", en: "Award name" } },
    { key: "organization", labelKey: "organization", type: "bi", ph: { fa: "نهاد اهداکننده", en: "Granting organization" } },
    { key: "date", labelKey: "date", type: "month" },
    { key: "description", labelKey: "description", type: "biarea", ph: { fa: "شرح کوتاهی از جایزه و دلیل اعطای آن", en: "A short description of the award and why it was granted" } },
  ],
  courses: [
    { key: "name", labelKey: "courseName", type: "bi", ph: { fa: "نام دوره", en: "Course name" } },
    { key: "provider", labelKey: "provider", type: "bi", ph: { fa: "برگزارکننده", en: "Provider" } },
    { key: "date", labelKey: "date", type: "month" },
    { key: "duration", labelKey: "duration", type: "bi", ph: { fa: "۲۴ ساعت", en: "24 hours" } },
    { key: "description", labelKey: "description", type: "biarea", ph: { fa: "شرح کوتاه دوره و مهارت‌های آموخته‌شده", en: "A short course description and skills learned" } },
  ],
  volunteer: [
    { key: "role", labelKey: "volunteerRole", type: "bi", ph: { fa: "مثلاً: عضو داوطلب", en: "e.g. Volunteer Member" } },
    { key: "organization", labelKey: "organization", type: "bi", ph: { fa: "نام مؤسسه یا انجمن", en: "Charity / association name" } },
    { key: "location", labelKey: "location", type: "bi", ph: { fa: "شهر، کشور", en: "City, Country" } },
    { key: "start", labelKey: "startDate", type: "month", half: true },
    { key: "end", labelKey: "endDate", type: "month", half: true },
    { key: "present", labelKey: "present", type: "bool" },
    { key: "description", labelKey: "description", type: "biarea", ph: { fa: "فعالیت‌های داوطلبانه و دستاوردها", en: "Volunteer activities and achievements" } },
  ],
  memberships: [
    { key: "organization", labelKey: "membershipOrg", type: "bi", ph: { fa: "انجمن علمی یا حرفه‌ای", en: "Professional society" } },
    { key: "role", labelKey: "membershipRole", type: "bi", ph: { fa: "عضو، عضو هیئت مدیره، …", en: "Member, board member, …" } },
    { key: "start", labelKey: "startDate", type: "month", half: true },
    { key: "end", labelKey: "endDate", type: "month", half: true },
    { key: "present", labelKey: "present", type: "bool" },
    { key: "description", labelKey: "description", type: "biarea", ph: { fa: "نوع عضویت و فعالیت در انجمن", en: "Membership type and involvement" } },
  ],
  teaching: [
    { key: "role", labelKey: "teachingRole", type: "bi", ph: { fa: "دستیار آموزشی، مدرس، …", en: "Teaching assistant, lecturer, …" } },
    { key: "institution", labelKey: "institution", type: "bi", ph: { fa: "نام دانشگاه یا آموزشگاه", en: "University / institute" } },
    { key: "course", labelKey: "course", type: "bi", ph: { fa: "نام درس", en: "Course name" } },
    { key: "start", labelKey: "startDate", type: "month", half: true },
    { key: "end", labelKey: "endDate", type: "month", half: true },
    { key: "present", labelKey: "present", type: "bool" },
    { key: "description", labelKey: "description", type: "biarea", ph: { fa: "جلسات رفع اشکال، تصحیح تمرین، تدریس مستقل، …", en: "Problem sessions, grading, independent teaching, …" } },
  ],
  patents: [
    { key: "title", labelKey: "patentTitle", type: "bi", ph: { fa: "عنوان اختراع", en: "Invention title" } },
    { key: "inventors", labelKey: "inventors", type: "biarea", rows: 2, ph: { fa: "نام مخترع(ان)", en: "Inventor name(s)" } },
    { key: "office", labelKey: "patentOffice", type: "bi", ph: { fa: "مرجع ثبت", en: "Patent office" } },
    { key: "number", labelKey: "patentNumber", type: "text", half: true, phT: "12345" },
    { key: "date", labelKey: "date", type: "month", half: true },
    { key: "status", labelKey: "status", type: "bi", half: true, ph: { fa: "ثبت‌شده، در حال بررسی، …", en: "Registered, pending, …" } },
    { key: "description", labelKey: "description", type: "biarea", ph: { fa: "شرح کوتاه اختراع و مزیت آن", en: "A short description and its advantage" } },
  ],
  references: [
    { key: "name", labelKey: "referenceName", type: "bi", ph: { fa: "نام معرف", en: "Reference name" } },
    { key: "position", labelKey: "referencePosition", type: "bi", ph: { fa: "سمت", en: "Position" } },
    { key: "organization", labelKey: "organization", type: "bi", ph: { fa: "سازمان", en: "Organization" } },
    { key: "contact", labelKey: "referenceContact", type: "biarea", rows: 2, ph: { fa: "ایمیل یا تلفن", en: "Email or phone" } },
  ],
};

const LIST_KINDS: SectionKind[] = [
  "experience", "education", "projects", "research", "publications",
  "conferences", "certifications", "awards", "courses", "volunteer",
  "memberships", "teaching", "patents", "references",
];

// ============================================================
// Drag & drop list (HTML5 native)
// ============================================================

export const useDragList = (
  ids: string[],
  onReorder: (newIds: string[]) => void,
) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const props = (id: string) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      setDragId(id);
      e.dataTransfer.effectAllowed = "move";
    },
    onDragEnd: () => {
      setDragId(null);
      setOverId(null);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (id !== overId) setOverId(id);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!dragId || dragId === id) return;
      const next = ids.filter((x) => x !== dragId);
      const idx = next.indexOf(id);
      next.splice(idx, 0, dragId);
      onReorder(next);
      setDragId(null);
      setOverId(null);
    },
  });

  return {
    dragId,
    overId,
    props,
    reset: () => { setDragId(null); setOverId(null); },
  };
};

// ============================================================
// Field renderer
// ============================================================

const FieldRow = ({
  def,
  entry,
  onChange,
}: {
  def: FieldDef;
  entry: AnyEntry;
  onChange: (patch: Record<string, unknown>) => void;
}) => {
  const { t } = useI18n();
  const v = entry[def.key];

  switch (def.type) {
    case "bi":
      return (
        <BiField
          label={t(def.labelKey)}
          value={(v as BiText) || { fa: "", en: "" }}
          placeholder={def.ph}
          onChange={(nv) => onChange({ [def.key]: nv })}
        />
      );
    case "biarea":
      return (
        <BiArea
          label={t(def.labelKey)}
          value={(v as BiText) || { fa: "", en: "" }}
          rows={def.rows}
          placeholder={def.ph}
          onChange={(nv) => onChange({ [def.key]: nv })}
        />
      );
    case "bilist":
      return (
        <BiList
          label={t(def.labelKey)}
          value={(v as BiText) || { fa: "", en: "" }}
          placeholder={def.ph}
          onChange={(nv) => onChange({ [def.key]: nv })}
        />
      );
    case "text":
      return (
        <Labeled label={t(def.labelKey)}>
          <TextInput value={(v as string) || ""} onChange={(nv) => onChange({ [def.key]: nv })} placeholder={def.phT} dir="auto" />
        </Labeled>
      );
    case "month":
      return (
        <Labeled label={t(def.labelKey)}>
          <input
            type="month"
            className="inp"
            value={(v as string) || ""}
            onChange={(e) => onChange({ [def.key]: e.target.value })}
          />
        </Labeled>
      );
    case "select": {
      const opts = def.options ?? [];
      return (
        <Labeled label={t(def.labelKey)}>
          <Select
            value={(v as string) || ""}
            onChange={(nv) => onChange({ [def.key]: nv })}
            options={[{ value: "", label: "—" }, ...opts]}
          />
        </Labeled>
      );
    }
    case "bool":
      return (
        <label className="flex items-center gap-2 text-sm cursor-pointer py-1.5">
          <input
            type="checkbox"
            checked={!!v}
            onChange={(e) => onChange({ [def.key]: e.target.checked })}
          />
          {t(def.labelKey)}
        </label>
      );
    default:
      return null;
  }
};

// ============================================================
// Generic list section editor
// ============================================================

const ListSectionEditor = ({
  resume,
  section,
}: {
  resume: Resume;
  section: ResumeSection;
}) => {
  const { t, lang } = useI18n();
  const update = useStore((s) => s.update);
  const entries = (section.data as unknown as AnyEntry[]) || [];
  const schema = FIELD_SCHEMAS[section.kind] || [];

  // dynamic option sets
  const empOptions = Object.entries({
    "full-time": "fullTime", "part-time": "partTime", contract: "contract",
    internship: "internship", freelance: "freelance", "self-employed": "selfEmployed",
    "research-assistant": "researchAssistant", "teaching-assistant": "teachingAssistant",
  }).map(([value, k]) => ({ value, label: t(k) }));

  const pubOptions = Object.entries({
    journal: "pubJournal",
    conference: "pubConference",
    "book-chapter": "pubBookChapter",
    thesis: "pubThesis",
    preprint: "pubPreprint",
    patent: "pubPatent",
    other: "pubOther",
  }).map(([value, k]) => ({ value, label: t(k) }));

  const setEntry = (id: string, patch: Record<string, unknown>) => {
    update(resume.id, (r) => {
      const s = r.sections[section.id];
      const list = s.data as unknown as AnyEntry[];
      const e = list.find((x) => x.id === id);
      if (e) Object.assign(e, patch);
    });
  };

  const removeEntry = (id: string) => {
    update(resume.id, (r) => {
      const s = r.sections[section.id];
      s.data = (s.data as unknown as AnyEntry[]).filter((x) => x.id !== id) as never;
    });
  };

  const addEntry = () => {
    update(resume.id, (r) => {
      const s = r.sections[section.id];
      const blank = blankEntry(section.kind);
      (s.data as unknown as AnyEntry[]).push(blank);
    });
  };

  const move = (id: string, dir: -1 | 1) => {
    update(resume.id, (r) => {
      const s = r.sections[section.id];
      const list = s.data as unknown as AnyEntry[];
      const i = list.findIndex((x) => x.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
    });
  };

  const drag = useDragList(
    entries.map((e) => e.id),
    (newIds) => {
      update(resume.id, (r) => {
        const s = r.sections[section.id];
        const map = new Map((s.data as unknown as AnyEntry[]).map((e) => [e.id, e]));
        s.data = newIds.map((id) => map.get(id)!).filter(Boolean) as never;
      });
    },
  );

  const entryTitle = (e: AnyEntry): string => {
    const k =
      section.kind === "education" ? "degree" :
      section.kind === "projects" ? "name" :
      section.kind === "publications" ? "title" :
      section.kind === "certifications" ? "name" :
      section.kind === "awards" ? "name" :
      section.kind === "courses" ? "name" :
      section.kind === "patents" ? "title" :
      section.kind === "research" ? "topic" :
      section.kind === "conferences" ? "talk" :
      section.kind === "references" ? "name" :
      section.kind === "memberships" ? "organization" :
      section.kind === "teaching" ? "role" :
      section.kind === "volunteer" ? "role" : "title";
    const bt = e[k] as BiText | undefined;
    return (bt && (bt.fa || bt.en)) || t("entry");
  };

  const entrySub = (e: AnyEntry): string => {
    const k =
      section.kind === "education" ? "university" :
      section.kind === "projects" ? "organization" :
      section.kind === "publications" ? "venue" :
      section.kind === "certifications" ? "issuer" :
      section.kind === "awards" ? "organization" :
      section.kind === "courses" ? "provider" :
      section.kind === "research" ? "institution" :
      section.kind === "conferences" ? "name" :
      section.kind === "references" ? "organization" :
      section.kind === "memberships" ? "role" :
      section.kind === "teaching" ? "institution" :
      section.kind === "volunteer" ? "organization" : "company";
    const bt = e[k] as BiText | undefined;
    return (bt && (bt.fa || bt.en)) || "";
  };

  const addLabel = `${t("add")} — ${pick(section.title, lang)}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="h-title">{pick(section.title, lang)}</h3>
        <button className="btn btn-secondary text-xs" onClick={addEntry}>
          <Icon.plus /> {t("add")}
        </button>
      </div>
      {entries.length === 0 && (
        <p className="text-sm text-[var(--text-2)] mb-2">{t("emptyEntriesHint")}</p>
      )}
      <div>
        {entries.map((e, i) => (
          <div key={e.id}>
            <EntryCard
              title={entryTitle(e)}
              subtitle={entrySub(e)}
              first={i === 0}
              last={i === entries.length - 1}
              onRemove={() => removeEntry(e.id)}
              onMoveUp={() => move(e.id, -1)}
              onMoveDown={() => move(e.id, 1)}
              dragProps={drag.props(e.id) as never}
              isDragging={drag.dragId === e.id}
              over={drag.overId === e.id}
            >
              {schema.map((def) => (
                <FieldRow
                  key={def.key}
                  def={
                    def.key === "employmentType"
                      ? { ...def, options: empOptions }
                      : def.key === "type" && section.kind === "publications"
                        ? { ...def, options: pubOptions }
                        : def
                  }
                  entry={e}
                  onChange={(patch) => setEntry(e.id, patch)}
                />
              ))}
            </EntryCard>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-[var(--text-2)] mt-1">{t("dragToReorder")}</p>
    </div>
  );
};

const blankEntry = (kind: SectionKind): AnyEntry => {
  const base: AnyEntry = { id: uid() };
  const bi = { fa: "", en: "" };
  const schema = FIELD_SCHEMAS[kind] || [];
  for (const f of schema) {
    if (f.type === "bi" || f.type === "biarea" || f.type === "bilist") base[f.key] = { ...bi };
    else if (f.type === "bool") base[f.key] = false;
    else base[f.key] = "";
  }
  return base;
};

// ============================================================
// Special editors
// ============================================================

const SummaryEditor = ({ resume, section }: { resume: Resume; section: ResumeSection }) => {
  const { t } = useI18n();
  const update = useStore((s) => s.update);
  const data = section.data as unknown as BiText;
  return (
    <div>
      <h3 className="h-title mb-2">{t("summary")}</h3>
      <BiArea
        label={t("summary")}
        rows={5}
        value={data || { fa: "", en: "" }}
        placeholder={{
          fa: "دو تا چهار جمله درباره تخصص، تجربه و ارزشی که خلق می‌کنید؛ مثلاً: «مهندس مکانیک با ۵ سال تجربه در طراحی و شبیه‌سازی…»",
          en: "Two to four sentences on your expertise, experience and value; e.g. \"Mechanical engineer with 5 years of experience in design and simulation…\"",
        }}
        onChange={(v) =>
          update(resume.id, (r) => {
            (r.sections[section.id].data as unknown as BiText) = v;
          })
        }
      />
    </div>
  );
};

const SkillsEditor = ({ resume, section }: { resume: Resume; section: ResumeSection }) => {
  const { t, lang } = useI18n();
  const update = useStore((s) => s.update);
  const cats = (section.data as unknown as SkillCategoryView[]) || [];

  const addCat = () => {
    update(resume.id, (r) => {
      const s = r.sections[section.id];
      const list = s.data as unknown as SkillCategoryView[];
      // first unused preset name keeps new categories self-explanatory
      const used = new Set(list.map((c) => c.name.fa));
      const preset = SKILL_CATEGORY_PRESETS.find((p) => !used.has(p.fa)) || SKILL_CATEGORY_PRESETS[0];
      list.push({
        id: uid(),
        name: { fa: preset.fa, en: preset.en },
        skills: [{ id: uid(), name: "", level: "", years: "", description: { fa: "", en: "" } }],
      });
    });
  };

  const drag = useDragList(
    cats.map((c) => c.id),
    (newIds) => {
      update(resume.id, (r) => {
        const s = r.sections[section.id];
        const map = new Map((s.data as unknown as SkillCategoryView[]).map((c) => [c.id, c]));
        s.data = newIds.map((id) => map.get(id)!) as never;
      });
    },
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="h-title">{pick(section.title, lang)}</h3>
        <button className="btn btn-secondary text-xs" onClick={addCat}>
          <Icon.plus /> {t("addCategory")}
        </button>
      </div>
      {cats.map((c, i) => (
        <div key={c.id}>
          <EntryCard
            title={c.name.fa || c.name.en || t("categoryName")}
            first={i === 0}
            last={i === cats.length - 1}
            onRemove={() =>
              update(resume.id, (r) => {
                const s = r.sections[section.id];
                s.data = (s.data as unknown as SkillCategoryView[]).filter((x) => x.id !== c.id) as never;
              })
            }
            onMoveUp={() =>
              update(resume.id, (r) => {
                const list = r.sections[section.id].data as unknown as SkillCategoryView[];
                const j = i - 1;
                if (j >= 0) [list[i], list[j]] = [list[j], list[i]];
              })
            }
            onMoveDown={() =>
              update(resume.id, (r) => {
                const list = r.sections[section.id].data as unknown as SkillCategoryView[];
                const j = i + 1;
                if (j < list.length) [list[i], list[j]] = [list[j], list[i]];
              })
            }
            dragProps={drag.props(c.id) as never}
            isDragging={drag.dragId === c.id}
            over={drag.overId === c.id}
          >
            <BiField
              label={t("categoryName")}
              value={c.name}
              placeholder={{ fa: "مثلاً: زبان‌های برنامه‌نویسی", en: "e.g. Programming Languages" }}
              onChange={(v) =>
                update(resume.id, (r) => {
                  const cc = (r.sections[section.id].data as unknown as SkillCategoryView[]).find((x) => x.id === c.id);
                  if (cc) cc.name = v;
                })
              }
            />
            {/* skills rows */}
            <div className="space-y-1.5 mb-2">
              {c.skills.map((sk) => (
                <div key={sk.id} className="grid grid-cols-12 gap-1.5 items-center">
                  <input
                    className="inp col-span-5"
                    value={sk.name}
                    placeholder="Python / ANSYS / C++"
                    dir="auto"
                    onChange={(ev) =>
                      update(resume.id, (r) => {
                        const cc = (r.sections[section.id].data as unknown as SkillCategoryView[]).find((x) => x.id === c.id);
                        const s2 = cc?.skills.find((y) => y.id === sk.id);
                        if (s2) s2.name = ev.target.value;
                      })
                    }
                  />
                  <select
                    className="inp col-span-3"
                    value={sk.level}
                    onChange={(ev) =>
                      update(resume.id, (r) => {
                        const cc = (r.sections[section.id].data as unknown as SkillCategoryView[]).find((x) => x.id === c.id);
                        const s2 = cc?.skills.find((y) => y.id === sk.id);
                        if (s2) s2.level = ev.target.value as never;
                      })
                    }
                  >
                    <option value="">{t("proficiency")}</option>
                    <option value="novice">{t("level_novice")}</option>
                    <option value="beginner">{t("level_beginner")}</option>
                    <option value="intermediate">{t("level_intermediate")}</option>
                    <option value="advanced">{t("level_advanced")}</option>
                    <option value="expert">{t("level_expert")}</option>
                  </select>
                  <input
                    className="inp col-span-2"
                    value={sk.years}
                    placeholder="3"
                    onChange={(ev) =>
                      update(resume.id, (r) => {
                        const cc = (r.sections[section.id].data as unknown as SkillCategoryView[]).find((x) => x.id === c.id);
                        const s2 = cc?.skills.find((y) => y.id === sk.id);
                        if (s2) s2.years = ev.target.value;
                      })
                    }
                  />
                  <button
                    className="iconbtn danger col-span-2"
                    onClick={() =>
                      update(resume.id, (r) => {
                        const cc = (r.sections[section.id].data as unknown as SkillCategoryView[]).find((x) => x.id === c.id);
                        if (cc) cc.skills = cc.skills.filter((y) => y.id !== sk.id);
                      })
                    }
                  >
                    <Icon.trash />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="btn btn-ghost text-xs"
              onClick={() =>
                update(resume.id, (r) => {
                  const cc = (r.sections[section.id].data as unknown as SkillCategoryView[]).find((x) => x.id === c.id);
                  cc?.skills.push({ id: uid(), name: "", level: "", years: "", description: { fa: "", en: "" } });
                })
              }
            >
              <Icon.plus /> {t("addSkill")}
            </button>
          </EntryCard>
        </div>
      ))}
      <p className="text-[11px] text-[var(--text-2)] mt-1">{t("dragToReorder")}</p>
    </div>
  );
};

type SkillCategoryView = {
  id: string;
  name: BiText;
  skills: { id: string; name: string; level: string; years: string; description: BiText }[];
};

const LanguagesEditor = ({ resume, section }: { resume: Resume; section: ResumeSection }) => {
  const { t } = useI18n();
  const update = useStore((s) => s.update);
  const list = (section.data as unknown as LangRow[]) || [];
  const lvOptions = ["", "native", "A1", "A2", "B1", "B2", "C1", "C2"];
  const lvLabel = (v: string) => (v === "native" ? t("level_native") : v || "—");

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="h-title">{t("languages")}</h3>
        <button
          className="btn btn-secondary text-xs"
          onClick={() =>
            update(resume.id, (r) => {
              (r.sections[section.id].data as unknown as LangRow[]).push({
                id: uid(), language: { fa: "", en: "" },
                reading: "", writing: "", speaking: "", listening: "", overall: "",
              });
            })
          }
        >
          <Icon.plus /> {t("add")}
        </button>
      </div>
      {list.map((e) => (
        <div key={e.id} className="entry-card px-3 py-2 mb-2">
          <div className="grid grid-cols-12 gap-1.5 items-end">
            <div className="col-span-4">
              <BiField
                label={t("language")}
                value={e.language}
                placeholder={{ fa: "انگلیسی", en: "English" }}
                onChange={(v) =>
                  update(resume.id, (r) => {
                    const x = (r.sections[section.id].data as unknown as LangRow[]).find((y) => y.id === e.id);
                    if (x) x.language = v;
                  })
                }
              />
            </div>
            {(["reading", "writing", "speaking", "listening", "overall"] as const).map((k) => (
              <div key={k} className="col-span-2">
                <label className="lbl">{t(k === "overall" ? "overall" : k)}</label>
                <select
                  className="inp"
                  value={e[k]}
                  onChange={(ev) =>
                    update(resume.id, (r) => {
                      const x = (r.sections[section.id].data as unknown as LangRow[]).find((y) => y.id === e.id);
                      if (x) x[k] = ev.target.value as never;
                    })
                  }
                >
                  {lvOptions.map((v) => (
                    <option key={v} value={v}>{lvLabel(v)}</option>
                  ))}
                </select>
              </div>
            ))}
            <button
              className="iconbtn danger"
              onClick={() =>
                update(resume.id, (r) => {
                  const s = r.sections[section.id];
                  s.data = (s.data as unknown as LangRow[]).filter((y) => y.id !== e.id) as never;
                })
              }
            >
              <Icon.trash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

type LangRow = {
  id: string;
  language: BiText;
  reading: string;
  writing: string;
  speaking: string;
  listening: string;
  overall: string;
};

const TextSectionEditor = ({
  resume,
  section,
}: {
  resume: Resume;
  section: ResumeSection;
}) => {
  const { t, lang } = useI18n();
  const update = useStore((s) => s.update);
  const data = section.data as unknown as BiText;
  const ph =
    section.kind === "interests"
      ? { fa: "مثلاً: هوش مصنوعی، انرژی‌های تجدیدپذیر، آموزش", en: "e.g. AI, renewable energy, teaching" }
      : { fa: "مثلاً: شطرنج، دویدن، نقاشی", en: "e.g. chess, running, painting" };
  return (
    <div>
      <h3 className="h-title mb-2">{pick(section.title, lang)}</h3>
      <BiArea
        label={t("entryBody")}
        value={data || { fa: "", en: "" }}
        rows={4}
        placeholder={ph}
        onChange={(v) =>
          update(resume.id, (r) => {
            (r.sections[section.id].data as unknown as BiText) = v;
          })
        }
      />
    </div>
  );
};

const CustomSectionEditor = ({ resume, section }: { resume: Resume; section: ResumeSection }) => {
  const { t } = useI18n();
  const update = useStore((s) => s.update);
  const data = section.data as unknown as {
    title: BiText;
    entries: { id: string; title: BiText; subtitle: BiText; date: BiText; body: BiText }[];
  };

  return (
    <div>
      <BiField
        label={t("sectionTitle")}
        value={data?.title || { fa: "", en: "" }}
        placeholder={{ fa: "نام بخش سفارشی", en: "Custom section name" }}
        onChange={(v) =>
          update(resume.id, (r) => {
            (r.sections[section.id].data as unknown as { title: BiText }).title = v;
          })
        }
      />
      <div className="flex items-center justify-between mb-2">
        <h3 className="h-title text-sm">{t("entry")}</h3>
        <button
          className="btn btn-secondary text-xs"
          onClick={() =>
            update(resume.id, (r) => {
              const d = r.sections[section.id].data as unknown as { entries: CustomEntry[] };
              if (!d.entries) d.entries = [];
              d.entries.push({
                id: uid(),
                title: { fa: "", en: "" },
                subtitle: { fa: "", en: "" },
                date: { fa: "", en: "" },
                body: { fa: "", en: "" },
              });
            })
          }
        >
          <Icon.plus /> {t("add")}
        </button>
      </div>
      {(data?.entries || []).map((e, i) => (
        <div key={e.id} className="entry-card px-3 py-2 mb-2">
          <div className="flex justify-end gap-1 mb-1">
            <button
              className="iconbtn"
              disabled={i === 0}
              onClick={() =>
                update(resume.id, (r) => {
                  const arr = (r.sections[section.id].data as unknown as { entries: AnyEntry[] }).entries;
                  const j = i - 1;
                  if (j >= 0) [arr[i], arr[j]] = [arr[j], arr[i]];
                })
              }
            >
              <Icon.up />
            </button>
            <button
              className="iconbtn"
              disabled={i === (data?.entries.length || 0) - 1}
              onClick={() =>
                update(resume.id, (r) => {
                  const arr = (r.sections[section.id].data as unknown as { entries: AnyEntry[] }).entries;
                  const j = i + 1;
                  if (j < arr.length) [arr[i], arr[j]] = [arr[j], arr[i]];
                })
              }
            >
              <Icon.down />
            </button>
            <button
              className="iconbtn danger"
              onClick={() =>
                update(resume.id, (r) => {
                  const d = r.sections[section.id].data as unknown as { entries: { id: string }[] };
                  d.entries = d.entries.filter((x) => x.id !== e.id);
                })
              }
            >
              <Icon.trash />
            </button>
          </div>
          <BiField
            label={t("entryTitle")}
            value={e.title}
            placeholder={{ fa: "عنوان مورد", en: "Entry title" }}
            onChange={(v) =>
              update(resume.id, (r) => {
                const x = (r.sections[section.id].data as unknown as { entries: { id: string; title: BiText }[] }).entries.find((y) => y.id === e.id);
                if (x) x.title = v;
              })
            }
          />
          <BiField
            label={t("entrySubtitle")}
            value={e.subtitle}
            placeholder={{ fa: "زیرعنوان", en: "Subtitle" }}
            onChange={(v) =>
              update(resume.id, (r) => {
                const x = (r.sections[section.id].data as unknown as { entries: { id: string; subtitle: BiText }[] }).entries.find((y) => y.id === e.id);
                if (x) x.subtitle = v;
              })
            }
          />
          <BiField
            label={t("date")}
            value={e.date}
            placeholder={{ fa: "۱۴۰۲", en: "2023" }}
            onChange={(v) =>
              update(resume.id, (r) => {
                const x = (r.sections[section.id].data as unknown as { entries: { id: string; date: BiText }[] }).entries.find((y) => y.id === e.id);
                if (x) x.date = v;
              })
            }
          />
          <BiArea
            label={t("entryBody")}
            value={e.body}
            placeholder={{ fa: "متن توضیحی این مورد", en: "Body text for this entry" }}
            onChange={(v) =>
              update(resume.id, (r) => {
                const x = (r.sections[section.id].data as unknown as { entries: { id: string; body: BiText }[] }).entries.find((y) => y.id === e.id);
                if (x) x.body = v;
              })
            }
          />
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Dispatcher
// ============================================================

export const SectionEditor = ({
  resume,
  section,
}: {
  resume: Resume;
  section: ResumeSection;
}) => {
  const kind = section.kind;
  if (kind === "summary") return <SummaryEditor resume={resume} section={section} />;
  if (kind === "skills") return <SkillsEditor resume={resume} section={section} />;
  if (kind === "languages") return <LanguagesEditor resume={resume} section={section} />;
  if (kind === "interests" || kind === "hobbies")
    return <TextSectionEditor resume={resume} section={section} />;
  if (kind === "custom") return <CustomSectionEditor resume={resume} section={section} />;
  if (LIST_KINDS.includes(kind)) return <ListSectionEditor resume={resume} section={section} />;
  return <p className="text-sm text-[var(--text-2)]">—</p>;
};
