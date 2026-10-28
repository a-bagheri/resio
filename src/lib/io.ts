import type { Resume } from "./types";
import { z } from "zod";
import { downloadBlob, sanitizeFilename, uid } from "./utils";

// ============================================================
// JSON export / import — zod-validated
// ============================================================

const BiSchema = z.object({ fa: z.string(), en: z.string() });

const DateRangeSchema = z.object({
  start: z.string(),
  end: z.string(),
  present: z.boolean().optional(),
});

const ListSchema = z.array(z.record(z.string(), z.unknown()));

const SectionSchema = z.object({
  id: z.string(),
  kind: z.string(),
  title: BiSchema,
  visible: z.boolean().optional(),
  locked: z.boolean().optional(),
  columns: z.number().optional(),
  data: z.unknown(),
});

const DesignSchema = z.object({
  templateId: z.string(),
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  fontFamily: z.string(),
  fontSize: z.number(),
  headingSize: z.number(),
  lineHeight: z.number(),
  margin: z.number(),
  sectionSpacing: z.number(),
  page: z.enum(["a4", "letter"]),
  headerStyle: z.enum(["banner", "sidebar", "centered", "split", "minimal"]),
  footer: z.enum(["none", "page-number", "name-page"]),
  columns: z.number(),
  sidebar: z.boolean(),
  sidebarSide: z.enum(["start", "end"]),
  separator: z.enum(["line", "underline", "none"]),
  dateFormat: z.enum(["gregorian", "jalali", "short"]),
  icons: z.boolean(),
  showPhoto: z.boolean(),
});

const ResumeSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  outputLang: z.enum(["fa", "en"]),
  personal: z.object({
    name: BiSchema,
    title: BiSchema,
    photo: z.string(),
    email: z.string(),
    phone: z.string(),
    location: BiSchema,
    website: z.string(),
    linkedin: z.string(),
    github: z.string(),
    scholar: z.string(),
    orcid: z.string(),
    otherLinks: z.array(z.object({ id: z.string(), label: z.string(), url: BiSchema })),
  }),
  sectionOrder: z.array(z.string()),
  sections: z.record(z.string(), SectionSchema),
  design: DesignSchema,
});

export const resumeToJson = (r: Resume): string =>
  JSON.stringify({ app: "resio", version: 1, resume: r }, null, 2);

export const exportResume = (r: Resume) => {
  downloadBlob(
    new Blob([resumeToJson(r)], { type: "application/json" }),
    sanitizeFilename(r.name) + ".json",
  );
};

/** Validate + normalize an imported resume; returns undefined when invalid. */
export const parseImportedResume = (raw: string): Resume | undefined => {
  try {
    const j = JSON.parse(raw);
    const p = ResumeSchema.safeParse(j.resume ?? j);
    if (!p.success) return undefined;
    const r = p.data as Resume;
    r.id = uid();
    return r;
  } catch {
    return undefined;
  }
};

/** Backup = all resumes. */
export const backupToJson = (resumes: Resume[]): string =>
  JSON.stringify({ app: "resio", version: 1, resumes }, null, 2);

export const parseBackup = (raw: string): Resume[] | undefined => {
  try {
    const j = JSON.parse(raw);
    const p = z
      .object({ resumes: z.array(z.unknown()) })
      .safeParse(j);
    if (!p.success) return undefined;
    const out: Resume[] = [];
    for (const x of p.data.resumes) {
      const rr = ResumeSchema.safeParse(x);
      if (rr.success) out.push(rr.data as Resume);
    }
    return out;
  } catch {
    return undefined;
  }
};
