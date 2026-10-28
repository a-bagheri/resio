import type { Resume, OutputLang, ResumeSection } from "./types";
import type { Paragraph, Table, TextRun, ExternalHyperlink } from "docx";
import { pick, toFaDigits, formatDate, downloadBlob, sanitizeFilename } from "./utils";
import { chipList } from "./latex";
import { formatDateRange, sectionHasContent } from "./content";
import { EMPLOYMENT_TYPE_LABELS, LEVEL_LABELS } from "./labels";
import { getFont } from "./fonts";

// ============================================================
// Word (DOCX) export — built client-side with the `docx` library
// (loaded lazily). One clean, ATS-friendly single-column document
// per language; RTL paragraphs + visually-RTL tables for Persian.
// ============================================================

type Bi = { fa: string; en: string };


// A4 in twips; 1mm ≈ 56.7 twips
const PAGE_TW = { a4: { w: 11906, h: 16838 }, letter: { w: 12240, h: 15840 } };
const MM = 56.7;

export const buildDocxBlob = async (r: Resume, L: OutputLang): Promise<Blob> => {
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, BorderStyle, AlignmentType, ExternalHyperlink,
  } = await import("docx");

  const fa = L === "fa";
  const d = r.design;
  const p = r.personal;
  const df = d.dateFormat;
  // Persian docs keep Vazirmatn (guaranteed Arabic-script coverage in Word)
  const bodyFont = fa ? "Vazirmatn" : getFont(d.fontFamily).docx;
  const primary = d.primary.replace("#", "");
  const secondary = d.secondary.replace("#", "");
  const accent = d.accent.replace("#", "");
  const page = PAGE_TW[d.page] || PAGE_TW.a4;
  const marginTw = Math.round(d.margin * MM);

  // ---- run/paragraph helpers -------------------------------------------
  const R = (
    text: string,
    o: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {},
  ) =>
    new TextRun({
      text,
      bold: o.bold,
      italics: o.italics,
      size: (o.size ?? d.fontSize) * 2,
      color: o.color ?? "222222",
      font: bodyFont,
      rightToLeft: fa,
    });

  const linkRun = (text: string, url: string) =>
    new ExternalHyperlink({
      link: url,
      children: [new TextRun({ text, style: "Hyperlink", size: d.fontSize * 2, font: bodyFont })],
    });

  const P = (
    children: (TextRun | ExternalHyperlink)[],
    o: {
      bold?: boolean; spacingBefore?: number; spacingAfter?: number;
      center?: boolean; size?: number; color?: string; heading?: boolean;
    } = {},
  ) =>
    new Paragraph({
      bidirectional: fa,
      alignment: o.center ? AlignmentType.CENTER : undefined,
      spacing: { before: o.spacingBefore ?? 0, after: o.spacingAfter ?? 60 },
      children,
    });

  const text = (t: string, o?: Parameters<typeof R>[1]) => P([R(t, o)]);

  const bullet = (t: string) =>
    new Paragraph({
      bidirectional: fa,
      bullet: { level: 0 },
      spacing: { after: 40 },
      children: [R(t)],
    });

  const heading = (t: string) =>
    new Paragraph({
      bidirectional: fa,
      spacing: { before: 280, after: 100 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: accent, space: 2 } },
      children: [R(t, { bold: true, size: d.headingSize, color: primary })],
    });

  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };

  /** Entry header: bold title (left/right by dir) with the date on the far side. */
  const entryHead = (title: string, sub: string, date: string, size = d.fontSize) =>
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      visuallyRightToLeft: fa,
      borders: noBorders,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 78, type: WidthType.PERCENTAGE },
              borders: noBorders,
              margins: { top: 40, bottom: 0, left: 0, right: 0 },
              children: [
                new Paragraph({
                  bidirectional: fa,
                  spacing: { after: 20 },
                  children: [R(title, { bold: true, size })],
                }),
                ...(sub
                  ? [new Paragraph({
                      bidirectional: fa,
                      spacing: { after: 20 },
                      children: [R(sub, { italics: true, size: size - 1, color: secondary })],
                    })]
                  : []),
              ],
            }),
            new TableCell({
              width: { size: 22, type: WidthType.PERCENTAGE },
              borders: noBorders,
              margins: { top: 40, bottom: 0, left: 0, right: 0 },
              children: [
                new Paragraph({
                  bidirectional: fa,
                  alignment: AlignmentType.END,
                  spacing: { after: 20 },
                  children: [R(date, { size: size - 1, color: secondary })],
                }),
              ],
            }),
          ],
        }),
      ],
    });

  const bulletsOf = (v: string) =>
    v.split(/\n|•/).map((x) => x.trim()).filter(Boolean);

  const labeled = (label: string, v: string) => text(`${label}: ${v}`, { size: d.fontSize - 0.5, color: secondary });

  // ---- header block ------------------------------------------------------
  const children: (Paragraph | Table)[] = [];
  children.push(P([R(pick(p.name, L), { bold: true, size: 20, color: primary })], { center: true, spacingAfter: 40 }));
  if (pick(p.title, L)) children.push(P([R(pick(p.title, L), { size: 12, color: secondary })], { center: true, spacingAfter: 60 }));

  const contacts: (TextRun | ExternalHyperlink)[] = [];
  const pushContact = (c: TextRun | ExternalHyperlink) => {
    if (contacts.length) contacts.push(R("  •  ", { color: secondary }));
    contacts.push(c);
  };
  if (p.email) pushContact(linkRun(p.email, "mailto:" + p.email));
  if (p.phone) pushContact(R(p.phone));
  if (pick(p.location, L)) pushContact(R(pick(p.location, L)));
  if (p.website) pushContact(linkRun(p.website.replace(/^https?:\/\//, ""), p.website));
  if (p.linkedin) pushContact(linkRun("LinkedIn", p.linkedin));
  if (p.github) pushContact(linkRun("GitHub", p.github));
  if (p.scholar) pushContact(linkRun("Scholar", p.scholar));
  if (p.orcid) pushContact(linkRun("ORCID", p.orcid));
  for (const l of p.otherLinks || []) {
    const u = pick(l.url, L) || l.url.fa || l.url.en;
    if (u) pushContact(linkRun(l.label || u.replace(/^https?:\/\//, ""), u));
  }
  if (contacts.length) children.push(P(contacts, { center: true, spacingAfter: 120 }));

  // ---- sections ----------------------------------------------------------
  const sections = r.sectionOrder
    .map((id) => r.sections[id])
    .filter((s): s is ResumeSection => !!s && s.visible && sectionHasContent(s));

  const secLabel = (faLabel: string, enLabel: string) => (fa ? faLabel : enLabel);

  for (const s of sections) {
    children.push(heading(pick(s.title, L)));
    const data = s.data as never;

    switch (s.kind) {
      case "summary": {
        const v = pick(data as Bi, L);
        if (v) children.push(text(v));
        break;
      }
      case "skills": {
        for (const c of data as { id: string; name: Bi; skills: { name: string; level: string; years: string }[] }[]) {
          const items = c.skills.map((sk) => {
            const extra: string[] = [];
            if (sk.level && LEVEL_LABELS[L][sk.level]) extra.push(LEVEL_LABELS[L][sk.level]);
            if (sk.years) extra.push(fa ? toFaDigits(sk.years) + " سال" : sk.years + "y");
            return sk.name + (extra.length ? ` (${extra.join(", ")})` : "");
          });
          children.push(text(`${pick(c.name, L)}: ${chipList(items.join(", "))}`));
        }
        break;
      }
      case "experience": {
        for (const e of data as {
          title: Bi; company: Bi; location: Bi; employmentType: string;
          start: string; end: string; present: boolean;
          responsibilities: Bi; achievements: Bi; technologies: Bi; projects: Bi;
        }[]) {
          children.push(entryHead(
            pick(e.title, L),
            [pick(e.company, L)].filter(Boolean).join(""),
            formatDateRange(e, L, df),
          ));
          const sub = [pick(e.location, L), EMPLOYMENT_TYPE_LABELS[L][e.employmentType] || ""].filter(Boolean).join(" · ");
          if (sub) children.push(text(sub, { italics: true, size: d.fontSize - 0.5, color: secondary }));
          for (const b of bulletsOf(pick(e.responsibilities, L))) children.push(bullet(b));
          for (const b of bulletsOf(pick(e.achievements, L))) children.push(bullet(b));
          if (pick(e.technologies, L)) children.push(labeled(secLabel("فناوری‌ها", "Technologies"), chipList(pick(e.technologies, L))));
          if (pick(e.projects, L)) children.push(labeled(secLabel("پروژه‌ها", "Projects"), pick(e.projects, L)));
        }
        break;
      }
      case "education": {
        for (const e of data as {
          degree: Bi; field: Bi; university: Bi; location: Bi;
          start: string; end: string; present: boolean; gpa: Bi;
          thesisTitle: Bi; thesisDescription: Bi; courses: Bi; achievements: Bi;
        }[]) {
          children.push(entryHead(
            [pick(e.degree, L), pick(e.field, L)].filter(Boolean).join(" — "),
            pick(e.university, L),
            formatDateRange(e, L, df),
          ));
          const sub = [pick(e.location, L),
            (e.gpa.fa || e.gpa.en) ? (fa ? "معدل: " : "GPA: ") + pick(e.gpa, L) : ""].filter(Boolean).join(" · ");
          if (sub) children.push(text(sub, { italics: true, size: d.fontSize - 0.5, color: secondary }));
          if (pick(e.thesisTitle, L)) children.push(labeled(secLabel("پایان‌نامه", "Thesis"), pick(e.thesisTitle, L)));
          for (const b of bulletsOf(pick(e.thesisDescription, L))) children.push(bullet(b));
          if (pick(e.courses, L)) children.push(labeled(secLabel("دروس", "Courses"), pick(e.courses, L)));
          for (const b of bulletsOf(pick(e.achievements, L))) children.push(bullet(b));
        }
        break;
      }
      case "projects": {
        for (const e of data as {
          name: Bi; role: Bi; organization: Bi; start: string; end: string; present: boolean;
          description: Bi; responsibilities: Bi; achievements: Bi;
          technologies: Bi; software: Bi; hardware: Bi; results: Bi;
          links: { id: string; label: string; url: string }[];
        }[]) {
          children.push(entryHead(
            pick(e.name, L),
            pick(e.role, L),
            formatDateRange(e, L, df),
          ));
          if (pick(e.organization, L)) children.push(text(pick(e.organization, L), { italics: true, size: d.fontSize - 0.5, color: secondary }));
          if (pick(e.description, L)) children.push(text(pick(e.description, L)));
          for (const b of bulletsOf(pick(e.responsibilities, L))) children.push(bullet(b));
          for (const b of bulletsOf(pick(e.achievements, L))) children.push(bullet(b));
          if (pick(e.technologies, L)) children.push(labeled(secLabel("فناوری‌ها", "Technologies"), chipList(pick(e.technologies, L))));
          if (pick(e.software, L)) children.push(labeled(secLabel("نرم‌افزار", "Software"), chipList(pick(e.software, L))));
          if (pick(e.hardware, L)) children.push(labeled(secLabel("سخت‌افزار", "Hardware"), chipList(pick(e.hardware, L))));
          for (const b of bulletsOf(pick(e.results, L))) children.push(bullet(b));
          for (const l of e.links || []) {
            if (l.url) children.push(P([linkRun(l.label || l.url.replace(/^https?:\/\//, ""), l.url)], { spacingAfter: 40 }));
          }
        }
        break;
      }
      case "research": {
        for (const e of data as {
          position: Bi; institution: Bi; topic: Bi; start: string; end: string; present: boolean;
          description: Bi; methodology: Bi; tools: Bi; results: Bi;
        }[]) {
          children.push(entryHead(pick(e.topic, L) || pick(e.position, L), "", formatDateRange(e, L, df)));
          const sub = [pick(e.position, L), pick(e.institution, L)].filter(Boolean).join(" · ");
          if (sub) children.push(text(sub, { italics: true, size: d.fontSize - 0.5, color: secondary }));
          if (pick(e.description, L)) children.push(text(pick(e.description, L)));
          if (pick(e.methodology, L)) children.push(labeled(secLabel("روش‌شناسی", "Methodology"), pick(e.methodology, L)));
          if (pick(e.tools, L)) children.push(labeled(secLabel("ابزارها", "Tools"), chipList(pick(e.tools, L))));
          for (const b of bulletsOf(pick(e.results, L))) children.push(bullet(b));
        }
        break;
      }
      case "publications": {
        for (const e of data as { title: Bi; authors: Bi; venue: Bi; year: string; doi: string; url: string }[]) {
          const runs: (TextRun | ExternalHyperlink)[] = [R(pick(e.title, L), { bold: true })];
          if (pick(e.authors, L)) runs.push(R(", " + pick(e.authors, L)));
          if (pick(e.venue, L)) runs.push(R(", ", {}), R(pick(e.venue, L), { italics: true }));
          if (e.year) runs.push(R(` (${e.year})`));
          if (e.doi) {
            runs.push(R(". "));
            runs.push(linkRun("doi:" + e.doi, "https://doi.org/" + e.doi));
          } else if (e.url) {
            runs.push(R(". "));
            runs.push(linkRun(e.url.replace(/^https?:\/\//, ""), e.url));
          }
          children.push(P(runs, { spacingAfter: 80 }));
        }
        break;
      }
      case "conferences": {
        for (const e of data as { name: Bi; talk: Bi; location: Bi; date: string; role: Bi }[]) {
          children.push(entryHead(pick(e.talk, L) || pick(e.name, L), "", formatDate(e.date, L, df)));
          const sub = [pick(e.name, L), pick(e.location, L), pick(e.role, L)].filter(Boolean).join(" · ");
          if (sub) children.push(text(sub, { italics: true, size: d.fontSize - 0.5, color: secondary }));
        }
        break;
      }
      case "certifications": {
        for (const e of data as { name: Bi; issuer: Bi; issueDate: string; expiryDate: string; credentialId: string; url: string }[]) {
          const dd = [
            e.issueDate ? formatDate(e.issueDate, L, df) : "",
            e.expiryDate ? formatDate(e.expiryDate, L, df) : "",
          ].filter(Boolean).join(" – ");
          children.push(entryHead(pick(e.name, L), pick(e.issuer, L), dd));
          const sub = [
            e.credentialId ? (fa ? "شناسه: " : "ID: ") + e.credentialId : "",
          ].filter(Boolean).join(" · ");
          if (sub) children.push(text(sub, { italics: true, size: d.fontSize - 0.5, color: secondary }));
        }
        break;
      }
      case "awards": {
        for (const e of data as { name: Bi; organization: Bi; date: string; description: Bi }[]) {
          children.push(entryHead(pick(e.name, L), pick(e.organization, L), formatDate(e.date, L, df)));
          if (pick(e.description, L)) children.push(text(pick(e.description, L)));
        }
        break;
      }
      case "languages": {
        for (const e of data as { language: Bi; reading: string; writing: string; speaking: string; listening: string; overall: string }[]) {
          const o = e.overall ? (LEVEL_LABELS[L][e.overall] || e.overall) : "";
          const det = [e.reading, e.writing, e.speaking, e.listening].filter(Boolean).join("/");
          children.push(text(
            pick(e.language, L) + (o ? ": " + o : "") + (det ? ` (${det})` : ""),
          ));
        }
        break;
      }
      case "courses": {
        for (const e of data as { name: Bi; provider: Bi; date: string; duration: Bi; description: Bi }[]) {
          const dd = [formatDate(e.date, L, df), pick(e.duration, L)].filter(Boolean).join(" · ");
          children.push(entryHead(pick(e.name, L), pick(e.provider, L), dd));
          if (pick(e.description, L)) children.push(text(pick(e.description, L)));
        }
        break;
      }
      case "volunteer": {
        for (const e of data as { role: Bi; organization: Bi; location: Bi; start: string; end: string; present: boolean; description: Bi }[]) {
          children.push(entryHead(pick(e.role, L), pick(e.organization, L), formatDateRange(e, L, df)));
          if (pick(e.location, L)) children.push(text(pick(e.location, L), { italics: true, size: d.fontSize - 0.5, color: secondary }));
          if (pick(e.description, L)) children.push(text(pick(e.description, L)));
        }
        break;
      }
      case "memberships": {
        for (const e of data as { organization: Bi; role: Bi; start: string; end: string; present: boolean; description: Bi }[]) {
          children.push(entryHead(pick(e.organization, L), pick(e.role, L), formatDateRange(e, L, df)));
          if (pick(e.description, L)) children.push(text(pick(e.description, L)));
        }
        break;
      }
      case "teaching": {
        for (const e of data as { role: Bi; institution: Bi; course: Bi; start: string; end: string; present: boolean; description: Bi }[]) {
          children.push(entryHead(pick(e.role, L), pick(e.course, L), formatDateRange(e, L, df)));
          if (pick(e.institution, L)) children.push(text(pick(e.institution, L), { italics: true, size: d.fontSize - 0.5, color: secondary }));
          if (pick(e.description, L)) children.push(text(pick(e.description, L)));
        }
        break;
      }
      case "patents": {
        for (const e of data as { title: Bi; inventors: Bi; office: Bi; number: string; date: string; status: Bi; description: Bi }[]) {
          children.push(entryHead(pick(e.title, L), "", formatDate(e.date, L, df)));
          const sub = [pick(e.inventors, L), pick(e.office, L),
            e.number ? (fa ? "شماره " : "No. ") + e.number : "", pick(e.status, L)]
            .filter(Boolean).join(" · ");
          if (sub) children.push(text(sub, { italics: true, size: d.fontSize - 0.5, color: secondary }));
          if (pick(e.description, L)) children.push(text(pick(e.description, L)));
        }
        break;
      }
      case "interests":
      case "hobbies": {
        const v = pick(data as Bi, L);
        if (v) children.push(text(v.replace(/\n+/g, "، ")));
        break;
      }
      case "references": {
        for (const e of data as { name: Bi; position: Bi; organization: Bi; contact: Bi }[]) {
          children.push(entryHead(pick(e.name, L), pick(e.position, L), ""));
          const sub = [pick(e.organization, L), pick(e.contact, L)].filter(Boolean).join(" · ");
          if (sub) children.push(text(sub, { italics: true, size: d.fontSize - 0.5, color: secondary }));
        }
        break;
      }
      case "custom": {
        const cd = data as unknown as { title: Bi; entries: { id: string; title: Bi; subtitle: Bi; date: Bi; body: Bi }[] };
        for (const e of cd.entries || []) {
          children.push(entryHead(pick(e.title, L), pick(e.subtitle, L), pick(e.date, L)));
          if (pick(e.body, L)) children.push(text(pick(e.body, L)));
        }
        break;
      }
      default:
        break;
    }
  }

  const doc = new Document({
    creator: "Resio",
    title: pick(p.name, L),
    styles: {
      default: {
        document: { run: { font: bodyFont, size: d.fontSize * 2 } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: page.w, height: page.h },
            margin: { top: marginTw, bottom: marginTw, left: marginTw, right: marginTw },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
};

export const exportDocx = async (r: Resume, L: OutputLang) => {
  const blob = await buildDocxBlob(r, L);
  downloadBlob(blob, sanitizeFilename(r.name) + (L === "fa" ? "-fa" : "-en") + ".docx");
};
