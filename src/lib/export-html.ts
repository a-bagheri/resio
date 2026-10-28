import type { Resume, OutputLang, ResumeSection } from "./types";
import { pick, toFaDigits, formatDate, downloadBlob, sanitizeFilename } from "./utils";
import { chipList } from "./latex";
import { formatDateRange, sectionHasContent } from "./content";
import { EMPLOYMENT_TYPE_LABELS, LEVEL_LABELS } from "./labels";

// ============================================================
// Single-file HTML export — a fully self-contained, styled,
// print-ready page (inline CSS, no dependencies) for quick sharing.
// ============================================================

type Bi = { fa: string; en: string };

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");


const FONT_STACKS: Record<string, string> = {
  vazirmatn: "'Vazirmatn', Tahoma, sans-serif",
  inter: "'Inter', 'Segoe UI', Arial, sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  roboto: "'Roboto', Arial, sans-serif",
  merriweather: "'Merriweather', Georgia, serif",
};

const bullets = (v: string): string => {
  const items = v.split(/\n|•/).map((x) => x.trim()).filter(Boolean);
  if (!items.length) return "";
  return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
};

const entryHead = (title: string, sub: string, date: string): string => `
  <div class="entry-head">
    <div>
      <div class="entry-title">${esc(title)}</div>
      ${sub ? `<div class="entry-sub">${esc(sub)}</div>` : ""}
    </div>
    ${date ? `<div class="entry-date">${esc(date)}</div>` : ""}
  </div>`;

const subLine = (s: string): string => (s ? `<div class="entry-sub">${esc(s)}</div>` : "");
const para = (s: string): string => (s ? `<p>${esc(s)}</p>` : "");
const labeled = (label: string, v: string): string =>
  v ? `<p class="meta"><em>${esc(label)}:</em> ${esc(v)}</p>` : "";

export const buildResumeHtml = (r: Resume, L: OutputLang): string => {
  const fa = L === "fa";
  const d = r.design;
  const p = r.personal;
  const df = d.dateFormat;
  const dir = fa ? "rtl" : "ltr";
  const font = fa ? FONT_STACKS.vazirmatn : (FONT_STACKS[d.fontFamily] || FONT_STACKS.inter);
  const secLabel = (faL: string, enL: string) => (fa ? faL : enL);

  const contacts: string[] = [];
  if (p.email) contacts.push(`<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`);
  if (p.phone) contacts.push(esc(p.phone));
  if (pick(p.location, L)) contacts.push(esc(pick(p.location, L)));
  if (p.website) contacts.push(`<a href="${esc(p.website)}">${esc(p.website.replace(/^https?:\/\//, ""))}</a>`);
  if (p.linkedin) contacts.push(`<a href="${esc(p.linkedin)}">LinkedIn</a>`);
  if (p.github) contacts.push(`<a href="${esc(p.github)}">GitHub</a>`);
  if (p.scholar) contacts.push(`<a href="${esc(p.scholar)}">Scholar</a>`);
  if (p.orcid) contacts.push(`<a href="${esc(p.orcid)}">ORCID</a>`);
  for (const l of p.otherLinks || []) {
    const u = l.url.fa || l.url.en;
    if (u) contacts.push(`<a href="${esc(u)}">${esc(l.label || u.replace(/^https?:\/\//, ""))}</a>`);
  }

  const sections = r.sectionOrder
    .map((id) => r.sections[id])
    .filter((s): s is ResumeSection => !!s && s.visible && sectionHasContent(s));

  let body = "";
  for (const s of sections) {
    body += `<section><h2>${esc(pick(s.title, L))}</h2>`;
    const data = s.data as never;
    switch (s.kind) {
      case "summary":
        body += para(pick(data as Bi, L));
        break;
      case "skills":
        for (const c of data as { id: string; name: Bi; skills: { name: string; level: string; years: string }[] }[]) {
          const items = c.skills.map((sk) => {
            const extra: string[] = [];
            if (sk.level && LEVEL_LABELS[L][sk.level]) extra.push(LEVEL_LABELS[L][sk.level]);
            if (sk.years) extra.push(fa ? toFaDigits(sk.years) + " سال" : sk.years + "y");
            return sk.name + (extra.length ? ` (${extra.join(", ")})` : "");
          });
          body += `<p><strong>${esc(pick(c.name, L))}:</strong> ${esc(chipList(items.join(", ")))}</p>`;
        }
        break;
      case "experience":
        for (const e of data as {
          title: Bi; company: Bi; location: Bi; employmentType: string;
          start: string; end: string; present: boolean;
          responsibilities: Bi; achievements: Bi; technologies: Bi; projects: Bi;
        }[]) {
          body += entryHead(pick(e.title, L), pick(e.company, L), formatDateRange(e, L, df));
          body += subLine([pick(e.location, L), EMPLOYMENT_TYPE_LABELS[L][e.employmentType] || ""].filter(Boolean).join(" · "));
          body += bullets(pick(e.responsibilities, L));
          body += bullets(pick(e.achievements, L));
          body += labeled(secLabel("فناوری‌ها", "Technologies"), chipList(pick(e.technologies, L)));
          body += labeled(secLabel("پروژه‌ها", "Projects"), pick(e.projects, L));
        }
        break;
      case "education":
        for (const e of data as {
          degree: Bi; field: Bi; university: Bi; location: Bi;
          start: string; end: string; present: boolean; gpa: Bi;
          thesisTitle: Bi; thesisDescription: Bi; courses: Bi; achievements: Bi;
        }[]) {
          body += entryHead(
            [pick(e.degree, L), pick(e.field, L)].filter(Boolean).join(" — "),
            pick(e.university, L),
            formatDateRange(e, L, df),
          );
          body += subLine([pick(e.location, L),
            (e.gpa.fa || e.gpa.en) ? (fa ? "معدل: " : "GPA: ") + pick(e.gpa, L) : ""].filter(Boolean).join(" · "));
          body += labeled(secLabel("پایان‌نامه", "Thesis"), pick(e.thesisTitle, L));
          body += bullets(pick(e.thesisDescription, L));
          body += labeled(secLabel("دروس", "Courses"), pick(e.courses, L));
          body += bullets(pick(e.achievements, L));
        }
        break;
      case "projects":
        for (const e of data as {
          name: Bi; role: Bi; organization: Bi; start: string; end: string; present: boolean;
          description: Bi; responsibilities: Bi; achievements: Bi;
          technologies: Bi; software: Bi; hardware: Bi; results: Bi;
          links: { id: string; label: string; url: string }[];
        }[]) {
          body += entryHead(pick(e.name, L), pick(e.role, L), formatDateRange(e, L, df));
          body += subLine(pick(e.organization, L));
          body += para(pick(e.description, L));
          body += bullets(pick(e.responsibilities, L));
          body += bullets(pick(e.achievements, L));
          body += labeled(secLabel("فناوری‌ها", "Technologies"), chipList(pick(e.technologies, L)));
          body += labeled(secLabel("نرم‌افزار", "Software"), chipList(pick(e.software, L)));
          body += labeled(secLabel("سخت‌افزار", "Hardware"), chipList(pick(e.hardware, L)));
          body += bullets(pick(e.results, L));
          for (const l of e.links || []) {
            if (l.url) body += `<p class="meta"><a href="${esc(l.url)}">${esc(l.label || l.url.replace(/^https?:\/\//, ""))}</a></p>`;
          }
        }
        break;
      case "research":
        for (const e of data as {
          position: Bi; institution: Bi; topic: Bi; start: string; end: string; present: boolean;
          description: Bi; methodology: Bi; tools: Bi; results: Bi;
        }[]) {
          body += entryHead(pick(e.topic, L) || pick(e.position, L), "", formatDateRange(e, L, df));
          body += subLine([pick(e.position, L), pick(e.institution, L)].filter(Boolean).join(" · "));
          body += para(pick(e.description, L));
          body += labeled(secLabel("روش‌شناسی", "Methodology"), pick(e.methodology, L));
          body += labeled(secLabel("ابزارها", "Tools"), chipList(pick(e.tools, L)));
          body += bullets(pick(e.results, L));
        }
        break;
      case "publications":
        for (const e of data as { title: Bi; authors: Bi; venue: Bi; year: string; doi: string; url: string }[]) {
          const bits = [`<strong>${esc(pick(e.title, L))}</strong>`];
          if (pick(e.authors, L)) bits.push(esc(pick(e.authors, L)));
          if (pick(e.venue, L)) bits.push(`<em>${esc(pick(e.venue, L))}</em>`);
          if (e.year) bits.push(esc(`(${e.year})`));
          let line = bits.join(", ");
          if (e.doi) line += ` — <a href="https://doi.org/${esc(e.doi)}">doi:${esc(e.doi)}</a>`;
          else if (e.url) line += ` — <a href="${esc(e.url)}">${esc(e.url.replace(/^https?:\/\//, ""))}</a>`;
          body += `<p class="pub">${line}</p>`;
        }
        break;
      case "conferences":
        for (const e of data as { name: Bi; talk: Bi; location: Bi; date: string; role: Bi }[]) {
          body += entryHead(pick(e.talk, L) || pick(e.name, L), "", formatDate(e.date, L, df));
          body += subLine([pick(e.name, L), pick(e.location, L), pick(e.role, L)].filter(Boolean).join(" · "));
        }
        break;
      case "certifications":
        for (const e of data as { name: Bi; issuer: Bi; issueDate: string; expiryDate: string; credentialId: string; url: string }[]) {
          const dd = [
            e.issueDate ? formatDate(e.issueDate, L, df) : "",
            e.expiryDate ? formatDate(e.expiryDate, L, df) : "",
          ].filter(Boolean).join(" – ");
          body += entryHead(pick(e.name, L), pick(e.issuer, L), dd);
          body += subLine(e.credentialId ? (fa ? "شناسه: " : "ID: ") + e.credentialId : "");
        }
        break;
      case "awards":
        for (const e of data as { name: Bi; organization: Bi; date: string; description: Bi }[]) {
          body += entryHead(pick(e.name, L), pick(e.organization, L), formatDate(e.date, L, df));
          body += para(pick(e.description, L));
        }
        break;
      case "languages":
        for (const e of data as { language: Bi; reading: string; writing: string; speaking: string; listening: string; overall: string }[]) {
          const o = e.overall ? (LEVEL_LABELS[L][e.overall] || e.overall) : "";
          const det = [e.reading, e.writing, e.speaking, e.listening].filter(Boolean).join("/");
          body += `<p><strong>${esc(pick(e.language, L))}</strong>${o ? ": " + esc(o) : ""}${det ? ` (${esc(det)})` : ""}</p>`;
        }
        break;
      case "courses":
        for (const e of data as { name: Bi; provider: Bi; date: string; duration: Bi; description: Bi }[]) {
          body += entryHead(pick(e.name, L), pick(e.provider, L), [formatDate(e.date, L, df), pick(e.duration, L)].filter(Boolean).join(" · "));
          body += para(pick(e.description, L));
        }
        break;
      case "volunteer":
        for (const e of data as { role: Bi; organization: Bi; location: Bi; start: string; end: string; present: boolean; description: Bi }[]) {
          body += entryHead(pick(e.role, L), pick(e.organization, L), formatDateRange(e, L, df));
          body += subLine(pick(e.location, L));
          body += para(pick(e.description, L));
        }
        break;
      case "memberships":
        for (const e of data as { organization: Bi; role: Bi; start: string; end: string; present: boolean; description: Bi }[]) {
          body += entryHead(pick(e.organization, L), pick(e.role, L), formatDateRange(e, L, df));
          body += para(pick(e.description, L));
        }
        break;
      case "teaching":
        for (const e of data as { role: Bi; institution: Bi; course: Bi; start: string; end: string; present: boolean; description: Bi }[]) {
          body += entryHead(pick(e.role, L), pick(e.course, L), formatDateRange(e, L, df));
          body += subLine(pick(e.institution, L));
          body += para(pick(e.description, L));
        }
        break;
      case "patents":
        for (const e of data as { title: Bi; inventors: Bi; office: Bi; number: string; date: string; status: Bi; description: Bi }[]) {
          body += entryHead(pick(e.title, L), "", formatDate(e.date, L, df));
          body += subLine([pick(e.inventors, L), pick(e.office, L),
            e.number ? (fa ? "شماره " : "No. ") + e.number : "", pick(e.status, L)]
            .filter(Boolean).join(" · "));
          body += para(pick(e.description, L));
        }
        break;
      case "interests":
      case "hobbies":
        body += para(pick(data as Bi, L).replace(/\n+/g, "، "));
        break;
      case "references":
        for (const e of data as { name: Bi; position: Bi; organization: Bi; contact: Bi }[]) {
          body += entryHead(pick(e.name, L), pick(e.position, L), "");
          body += subLine([pick(e.organization, L), pick(e.contact, L)].filter(Boolean).join(" · "));
        }
        break;
      case "custom": {
        const cd = data as unknown as { entries: { id: string; title: Bi; subtitle: Bi; date: Bi; body: Bi }[] };
        for (const e of cd.entries || []) {
          body += entryHead(pick(e.title, L), pick(e.subtitle, L), pick(e.date, L));
          body += para(pick(e.body, L));
        }
        break;
      }
    }
    body += `</section>`;
  }

  const title = esc(pick(p.name, L));
  const fontsHref =
    "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap";

  return `<!DOCTYPE html>
<html lang="${fa ? "fa" : "en"}" dir="${dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — ${esc(fa ? "رزومه" : "Resume")}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="${fontsHref}">
<style>
  :root {
    --primary: ${d.primary};
    --secondary: ${d.secondary};
    --accent: ${d.accent};
  }
  * { box-sizing: border-box; }
  body {
    font-family: ${font};
    font-size: ${d.fontSize}pt;
    line-height: ${d.lineHeight};
    color: #222;
    margin: 0;
    background: #f1f5f9;
  }
  .page {
    max-width: ${d.page === "letter" ? "816" : "794"}px;
    margin: 24px auto;
    background: #fff;
    padding: ${d.margin * 3.78}px;
    box-shadow: 0 1px 6px rgba(0,0,0,.12);
  }
  header.doc { text-align: center; margin-bottom: 20px; }
  h1 { color: var(--primary); font-size: ${d.headingSize + 8}pt; margin: 0 0 4px; }
  .job-title { color: var(--secondary); font-size: ${d.headingSize - 1}pt; margin-bottom: 6px; }
  .contacts { font-size: ${d.fontSize - 1}pt; color: var(--secondary); }
  .contacts a { color: var(--accent); text-decoration: none; }
  h2 {
    color: var(--primary);
    font-size: ${d.headingSize}pt;
    border-bottom: 1.5px solid var(--accent);
    padding-bottom: 3px;
    margin: 22px 0 8px;
  }
  section { margin-bottom: 6px; }
  .entry-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
  .entry-title { font-weight: 700; color: var(--primary); }
  .entry-sub { color: var(--secondary); font-size: ${d.fontSize - 0.5}pt; }
  .entry-date { color: var(--secondary); font-size: ${d.fontSize - 0.5}pt; white-space: nowrap; }
  ul { margin: 4px 0 6px; padding-inline-start: 22px; }
  li { margin: 1px 0; }
  p { margin: 4px 0; }
  .meta { color: var(--secondary); font-size: ${d.fontSize - 0.5}pt; }
  .meta em { color: var(--primary); font-style: normal; font-weight: 600; }
  a { color: var(--accent); }
  .pub { margin-bottom: 8px; }
  @media print {
    body { background: #fff; }
    .page { box-shadow: none; margin: 0; max-width: none; padding: 0; }
    @page { size: ${d.page === "letter" ? "letter" : "A4"}; margin: ${d.margin}mm; }
  }
</style>
</head>
<body>
<div class="page">
  <header class="doc">
    <h1>${title}</h1>
    ${pick(p.title, L) ? `<div class="job-title">${esc(pick(p.title, L))}</div>` : ""}
    ${contacts.length ? `<div class="contacts">${contacts.join(" &bull; ")}</div>` : ""}
  </header>
  ${body}
</div>
</body>
</html>`;
};

export const exportHtml = (r: Resume, L: OutputLang) => {
  const blob = new Blob([buildResumeHtml(r, L)], { type: "text/html;charset=utf-8" });
  downloadBlob(blob, sanitizeFilename(r.name) + (L === "fa" ? "-fa" : "-en") + ".html");
};
