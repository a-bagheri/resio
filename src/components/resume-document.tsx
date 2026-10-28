"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Resume, ResumeSection, OutputLang } from "@/lib/types";
import { pick } from "@/lib/utils";
import { getTemplate } from "@/lib/templates";

// ============================================================
// Design tokens → CSS custom properties
// ============================================================

export const fontStack = (family: string, serif: boolean): string => {
  if (family === "vazirmatn") return `'Vazirmatn', 'Tahoma', sans-serif`;
  if (family === "inter") return `'Inter', 'Vazirmatn', 'Segoe UI', sans-serif`;
  if (family === "roboto") return `'Roboto', 'Vazirmatn', 'Segoe UI', sans-serif`;
  if (family === "georgia") return `Georgia, 'Vazirmatn', serif`;
  if (family === "merriweather") return `'Merriweather', Georgia, 'Vazirmatn', serif`;
  return serif ? `Georgia, 'Vazirmatn', serif` : `'Vazirmatn', sans-serif`;
};

export const designVars = (r: Resume): CSSProperties => {
  const d = r.design;
  const tpl = getTemplate(d.templateId);
  return {
    ["--c-primary" as never]: d.primary,
    ["--c-secondary" as never]: d.secondary,
    ["--c-accent" as never]: d.accent,
    ["--fs" as never]: `${d.fontSize}pt`,
    ["--fs-h" as never]: `${d.headingSize}pt`,
    ["--lh" as never]: String(d.lineHeight),
    ["--pad" as never]: `${d.margin}mm`,
    ["--sec-gap" as never]: `${d.sectionSpacing}px`,
    ["--font" as never]: fontStack(d.fontFamily, tpl.serif),
  };
};

// ============================================================
// Small building blocks
// ============================================================

const Bullet = ({ text }: { text: string }) => {
  const items = text
    .split(/\n|•|؛|;/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!items.length) return null;
  if (items.length === 1 && !text.includes("\n")) return <span>{text}</span>;
  return (
    <ul className="rd-bullets">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
};

const Chip = ({ text, icon }: { text: string; icon: boolean }) => (
  <span className="rd-chip" data-icon={icon ? "y" : "n"}>
    {text}
  </span>
);

const ChipList = ({ text, icon }: { text: string; icon: boolean }) => {
  const items = text.split(/[,،;؛|\n]/).map((s) => s.trim()).filter(Boolean);
  if (!items.length) return null;
  return (
    <span className="rd-chips">
      {items.map((c, i) => (
        <Chip key={i} text={c} icon={icon} />
      ))}
    </span>
  );
};

const Link = ({ href, children }: { href: string; children: ReactNode }) => {
  if (!href) return <>{children}</>;
  const url = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a className="rd-link" href={url} onClick={(e) => e.preventDefault()}>
      {children}
    </a>
  );
};

// ============================================================
// Header variants
// ============================================================

const ContactRow = ({
  r,
  lang,
  icon,
}: {
  r: Resume;
  lang: OutputLang;
  icon: boolean;
}) => {
  const p = r.personal;
  const items: ReactNode[] = [];
  const sep = <span className="rd-cdot">•</span>;
  const add = (node: ReactNode, key: string) => items.push(<span key={key}>{node}</span>);

  if (p.email) add(<Link href={`mailto:${p.email}`}>{p.email}</Link>, "em");
  if (p.phone) add(p.phone, "ph");
  if (p.location.fa || p.location.en) add(pick(p.location, lang), "lo");
  if (p.website) add(<Link href={p.website}>{p.website.replace(/^https?:\/\//, "")}</Link>, "wb");
  if (p.linkedin) add(<Link href={p.linkedin}>LinkedIn</Link>, "li");
  if (p.github) add(<Link href={p.github}>GitHub</Link>, "gh");
  if (p.scholar) add(<Link href={p.scholar}>Scholar</Link>, "sc");
  if (p.orcid) add(<Link href={p.orcid}>ORCID</Link>, "or");
  for (const l of p.otherLinks) {
    const url = typeof l.url === "string" ? l.url : pick(l.url, lang);
    if (url) add(<Link href={url}>{l.label || url.replace(/^https?:\/\//, "")}</Link>, l.id);
  }

  if (!items.length) return null;
  const out: ReactNode[] = [];
  items.forEach((it, i) => {
    if (i) out.push(<span key={`s${i}`}>{sep}</span>);
    out.push(it);
  });
  return <div className="rd-contact" data-icon={icon ? "y" : "n"}>{out}</div>;
};

const Photo = ({ r, size = 26 }: { r: Resume; size?: number }) =>
  r.personal.photo && r.design.showPhoto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="rd-photo" src={r.personal.photo} alt="" style={{ width: `${size}mm`, height: `${size}mm` }} />
  ) : null;

const HeaderBanner = ({ r, lang }: { r: Resume; lang: OutputLang }) => (
  <header className="rd-header rd-hbanner">
    <div className="rd-hbanner-main">
      <h1 className="rd-name">{pick(r.personal.name, lang) || "…"}</h1>
      {pick(r.personal.title, lang) && <p className="rd-title">{pick(r.personal.title, lang)}</p>}
      <ContactRow r={r} lang={lang} icon={r.design.icons} />
    </div>
    <Photo r={r} />
  </header>
);

const HeaderCentered = ({ r, lang }: { r: Resume; lang: OutputLang }) => (
  <header className="rd-header rd-hcentered">
    <Photo r={r} />
    <div>
      <h1 className="rd-name">{pick(r.personal.name, lang) || "…"}</h1>
      {pick(r.personal.title, lang) && <p className="rd-title">{pick(r.personal.title, lang)}</p>}
      <ContactRow r={r} lang={lang} icon={r.design.icons} />
    </div>
  </header>
);

const HeaderSplit = ({ r, lang }: { r: Resume; lang: OutputLang }) => (
  <header className="rd-header rd-hsplit">
    <div>
      <h1 className="rd-name">{pick(r.personal.name, lang) || "…"}</h1>
      {pick(r.personal.title, lang) && <p className="rd-title">{pick(r.personal.title, lang)}</p>}
    </div>
    <div className="rd-hsplit-contact">
      <ContactRow r={r} lang={lang} icon={r.design.icons} />
    </div>
  </header>
);

const HeaderMinimal = ({ r, lang }: { r: Resume; lang: OutputLang }) => (
  <header className="rd-header rd-hminimal">
    <h1 className="rd-name">{pick(r.personal.name, lang) || "…"}</h1>
    {pick(r.personal.title, lang) && <p className="rd-title">{pick(r.personal.title, lang)}</p>}
    <ContactRow r={r} lang={lang} icon={r.design.icons} />
  </header>
);

const HeaderSidebar = ({ r, lang }: { r: Resume; lang: OutputLang }) => (
  <header className="rd-header rd-hsidebar">
    <div className="rd-hside-side" style={{ background: "var(--c-primary)" }}>
      <Photo r={r} />
      <div className="rd-hside-meta">
        <ContactRow r={r} lang={lang} icon={r.design.icons} />
      </div>
    </div>
    <div className="rd-hside-main">
      <h1 className="rd-name">{pick(r.personal.name, lang) || "…"}</h1>
      {pick(r.personal.title, lang) && <p className="rd-title">{pick(r.personal.title, lang)}</p>}
    </div>
  </header>
);

// ============================================================
// Section renderers
// ============================================================

const SectionHeading = ({
  s,
  lang,
}: {
  s: ResumeSection;
  lang: OutputLang;
}) => (
  <h2 className="rd-heading" data-sep={r2sep(s)}>
    {pick(s.title, lang)}
  </h2>
);

const r2sep = (s: ResumeSection) =>
  s.kind === "summary" || s.kind === "skills" || s.kind === "languages" || s.kind === "interests" || s.kind === "hobbies" ? "plain" : "std";

const SummaryBody = ({ s, lang }: { s: ResumeSection; lang: OutputLang }) => {
  const text = pick(s.data as never as { fa: string; en: string }, lang);
  if (!text) return null;
  return <p className="rd-summary">{text}</p>;
};

const ExperienceBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  const list = s.data as never as {
    id: string; title: { fa: string; en: string }; company: { fa: string; en: string };
    location: { fa: string; en: string }; employmentType: string;
    start: string; end: string; present: boolean;
    responsibilities: { fa: string; en: string }; achievements: { fa: string; en: string };
    technologies: { fa: string; en: string }; projects: { fa: string; en: string };
  }[];
  return (
    <div className="rd-entries">
      {list.map((e) => (
        <div key={e.id} className="rd-entry">
          <div className="rd-entry-top">
            <div className="rd-entry-head">
              <span className="rd-ehead-main">
                <strong>{pick(e.title, lang)}</strong>
                {pick(e.company, lang) && <span className="rd-ehead-sep"> — </span>}
                {pick(e.company, lang) && <span>{pick(e.company, lang)}</span>}
              </span>
              <span className="rd-date">
                {[e.start, e.present ? "P" : e.end].filter(Boolean).length
                  ? `${e.start ? fmtD(e.start, lang, df) : ""}${e.start && (e.present || e.end) ? " – " : ""}${e.present ? P_LABEL[lang] : e.end ? fmtD(e.end, lang, df) : ""}`
                  : ""}
              </span>
            </div>
            <div className="rd-sub">
              {[pick(e.location, lang), TYPE_LABELS[lang]?.[e.employmentType] || ""].filter(Boolean).join(" · ")}
            </div>
          </div>
          <Bullet text={pick(e.responsibilities, lang)} />
          <Bullet text={pick(e.achievements, lang)} />
          {pick(e.technologies, lang) && (
            <p className="rd-meta-row"><em>{TECH_LABEL[lang]}:</em> <ChipList text={pick(e.technologies, lang)} icon={false} /></p>
          )}
          {pick(e.projects, lang) && (
            <p className="rd-meta-row"><em>{PROJ_LABEL[lang]}:</em> {pick(e.projects, lang)}</p>
          )}
        </div>
      ))}
    </div>
  );
};

const P_LABEL: Record<OutputLang, string> = { fa: "اکنون", en: "Present" };
const TECH_LABEL: Record<OutputLang, string> = { fa: "فناوری‌ها", en: "Technologies" };
const PROJ_LABEL: Record<OutputLang, string> = { fa: "پروژه‌ها", en: "Projects" };
const TYPE_LABELS: Record<OutputLang, Record<string, string>> = {
  fa: {
    "full-time": "تمام‌وقت", "part-time": "پاره‌وقت", contract: "قراردادی",
    internship: "کارآموزی", freelance: "فریلنس", "self-employed": "کار شخصی",
    "research-assistant": "دستیار پژوهشی", "teaching-assistant": "دستیار آموزشی",
  },
  en: {
    "full-time": "Full-time", "part-time": "Part-time", contract: "Contract",
    internship: "Internship", freelance: "Freelance", "self-employed": "Self-employed",
    "research-assistant": "Research assistant", "teaching-assistant": "Teaching assistant",
  },
};

const fmtD = (v: string, lang: OutputLang, df: string) => {
  const d = fmtDate(v, lang, df);
  return d;
};

import { formatDate as fmtDate } from "@/lib/utils";

const EducationBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  const list = s.data as never as {
    id: string; degree: { fa: string; en: string }; field: { fa: string; en: string };
    university: { fa: string; en: string }; location: { fa: string; en: string };
    start: string; end: string; present: boolean; gpa: { fa: string; en: string };
    thesisTitle: { fa: string; en: string }; thesisDescription: { fa: string; en: string };
    courses: { fa: string; en: string }; achievements: { fa: string; en: string };
  }[];
  return (
    <div className="rd-entries">
      {list.map((e) => (
        <div key={e.id} className="rd-entry">
          <div className="rd-entry-top">
            <div className="rd-entry-head">
              <span className="rd-ehead-main">
                <strong>{pick(e.degree, lang)}</strong>
                {pick(e.field, lang) && <span className="rd-ehead-sep"> — </span>}
                {pick(e.field, lang) && <span>{pick(e.field, lang)}</span>}
              </span>
              <span className="rd-date">
                {e.start || e.end || e.present
                  ? `${e.start ? fmtDate(e.start, lang, df) : ""}${e.start && (e.present || e.end) ? " – " : ""}${e.present ? P_LABEL[lang] : e.end ? fmtDate(e.end, lang, df) : ""}`
                  : ""}
              </span>
            </div>
            <div className="rd-sub">
              {[pick(e.university, lang), pick(e.location, lang), e.gpa?.fa || e.gpa?.en ? `${GPA_LABEL[lang]}: ${pick(e.gpa, lang)}` : ""]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          {pick(e.thesisTitle, lang) && (
            <p className="rd-meta-row"><em>{THESIS_LABEL[lang]}:</em> {pick(e.thesisTitle, lang)}</p>
          )}
          <Bullet text={pick(e.thesisDescription, lang)} />
          {pick(e.courses, lang) && (
            <p className="rd-meta-row"><em>{COURSES_LABEL[lang]}:</em> {pick(e.courses, lang)}</p>
          )}
          <Bullet text={pick(e.achievements, lang)} />
        </div>
      ))}
    </div>
  );
};

const GPA_LABEL: Record<OutputLang, string> = { fa: "معدل", en: "GPA" };
const THESIS_LABEL: Record<OutputLang, string> = { fa: "پایان‌نامه", en: "Thesis" };
const COURSES_LABEL: Record<OutputLang, string> = { fa: "دروس", en: "Courses" };

const ProjectsBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  const list = s.data as never as {
    id: string; name: { fa: string; en: string }; role: { fa: string; en: string };
    organization: { fa: string; en: string }; start: string; end: string; present: boolean;
    description: { fa: string; en: string }; responsibilities: { fa: string; en: string };
    achievements: { fa: string; en: string }; technologies: { fa: string; en: string };
    software: { fa: string; en: string }; hardware: { fa: string; en: string };
    results: { fa: string; en: string }; links: { id: string; label: string; url: string }[];
  }[];
  return (
    <div className="rd-entries">
      {list.map((e) => (
        <div key={e.id} className="rd-entry">
          <div className="rd-entry-top">
            <div className="rd-entry-head">
              <span className="rd-ehead-main">
                <strong>{pick(e.name, lang)}</strong>
                {pick(e.role, lang) && <span className="rd-ehead-sep"> — </span>}
                {pick(e.role, lang) && <span>{pick(e.role, lang)}</span>}
              </span>
              <span className="rd-date">
                {e.start || e.end || e.present
                  ? `${e.start ? fmtDate(e.start, lang, df) : ""}${e.start && (e.present || e.end) ? " – " : ""}${e.present ? P_LABEL[lang] : e.end ? fmtDate(e.end, lang, df) : ""}`
                  : ""}
              </span>
            </div>
            <div className="rd-sub">{pick(e.organization, lang)}</div>
          </div>
          <p className="rd-desc">{pick(e.description, lang)}</p>
          <Bullet text={pick(e.responsibilities, lang)} />
          <Bullet text={pick(e.achievements, lang)} />
          {pick(e.technologies, lang) && (
            <p className="rd-meta-row"><em>{TECH_LABEL[lang]}:</em> <ChipList text={pick(e.technologies, lang)} icon={false} /></p>
          )}
          {pick(e.software, lang) && (
            <p className="rd-meta-row"><em>{SW_LABEL[lang]}:</em> {pick(e.software, lang)}</p>
          )}
          {pick(e.hardware, lang) && (
            <p className="rd-meta-row"><em>{HW_LABEL[lang]}:</em> {pick(e.hardware, lang)}</p>
          )}
          {pick(e.results, lang) && (
            <p className="rd-meta-row"><em>{RES_LABEL[lang]}:</em> {pick(e.results, lang)}</p>
          )}
          {e.links?.length > 0 && (
            <p className="rd-meta-row">
              {e.links.map((l) => (
                <span key={l.id} className="rd-link-item">
                  <Link href={l.url}>{l.label || l.url}</Link>{" "}
                </span>
              ))}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

const SW_LABEL: Record<OutputLang, string> = { fa: "نرم‌افزار", en: "Software" };
const HW_LABEL: Record<OutputLang, string> = { fa: "سخت‌افزار", en: "Hardware" };
const RES_LABEL: Record<OutputLang, string> = { fa: "نتایج", en: "Results" };

const ResearchBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  const list = s.data as never as {
    id: string; position: { fa: string; en: string }; institution: { fa: string; en: string };
    topic: { fa: string; en: string }; start: string; end: string; present: boolean;
    description: { fa: string; en: string }; methodology: { fa: string; en: string };
    tools: { fa: string; en: string }; results: { fa: string; en: string };
  }[];
  return (
    <div className="rd-entries">
      {list.map((e) => (
        <div key={e.id} className="rd-entry">
          <div className="rd-entry-top">
            <div className="rd-entry-head">
              <span className="rd-ehead-main">
                <strong>{pick(e.topic, lang) || pick(e.position, lang)}</strong>
              </span>
              <span className="rd-date">
                {e.start || e.end || e.present
                  ? `${e.start ? fmtDate(e.start, lang, df) : ""}${e.start && (e.present || e.end) ? " – " : ""}${e.present ? P_LABEL[lang] : e.end ? fmtDate(e.end, lang, df) : ""}`
                  : ""}
              </span>
            </div>
            <div className="rd-sub">
              {[pick(e.position, lang), pick(e.institution, lang)].filter(Boolean).join(" · ")}
            </div>
          </div>
          <p className="rd-desc">{pick(e.description, lang)}</p>
          {pick(e.methodology, lang) && (
            <p className="rd-meta-row"><em>{METHOD_LABEL[lang]}:</em> {pick(e.methodology, lang)}</p>
          )}
          {pick(e.tools, lang) && (
            <p className="rd-meta-row"><em>{TOOLS_LABEL[lang]}:</em> <ChipList text={pick(e.tools, lang)} icon={false} /></p>
          )}
          {pick(e.results, lang) && (
            <p className="rd-meta-row"><em>{RES_LABEL[lang]}:</em> {pick(e.results, lang)}</p>
          )}
        </div>
      ))}
    </div>
  );
};

const METHOD_LABEL: Record<OutputLang, string> = { fa: "روش", en: "Methodology" };
const TOOLS_LABEL: Record<OutputLang, string> = { fa: "ابزارها", en: "Tools" };

const PublicationsBody = ({ s, lang }: { s: ResumeSection; lang: OutputLang }) => {
  const list = s.data as never as {
    id: string; title: { fa: string; en: string }; authors: { fa: string; en: string };
    venue: { fa: string; en: string }; year: string; doi: string; url: string; type: string;
  }[];
  return (
    <ol className="rd-pubs">
      {list.map((e) => (
        <li key={e.id} className="rd-pub">
          <span className="rd-pub-title">{pick(e.title, lang)}</span>
          {pick(e.authors, lang) && <span className="rd-pub-authors"> — {pick(e.authors, lang)}</span>}
          {pick(e.venue, lang) && <span className="rd-pub-venue">, <em>{pick(e.venue, lang)}</em></span>}
          {e.year && <span className="rd-pub-year"> ({e.year})</span>}
          {(e.doi || e.url) && (
            <span className="rd-pub-links">
              {" "}
              <Link href={e.doi ? `https://doi.org/${e.doi}` : e.url}>{e.doi ? `doi:${e.doi}` : e.url}</Link>
            </span>
          )}
        </li>
      ))}
    </ol>
  );
};

const ConferencesBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  const list = s.data as never as {
    id: string; name: { fa: string; en: string }; talk: { fa: string; en: string };
    location: { fa: string; en: string }; date: string; role: { fa: string; en: string };
  }[];
  return (
    <div className="rd-entries rd-compact">
      {list.map((e) => (
        <div key={e.id} className="rd-entry">
          <div className="rd-entry-top">
            <div className="rd-entry-head">
              <span className="rd-ehead-main">
                <strong>{pick(e.talk, lang) || pick(e.name, lang)}</strong>
              </span>
              <span className="rd-date">{fmtDate(e.date, lang, df)}</span>
            </div>
            <div className="rd-sub">
              {[pick(e.name, lang), pick(e.location, lang), pick(e.role, lang)].filter(Boolean).join(" · ")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CertificationsBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  const list = s.data as never as {
    id: string; name: { fa: string; en: string }; issuer: { fa: string; en: string };
    issueDate: string; expiryDate: string; credentialId: string; url: string;
  }[];
  return (
    <div className="rd-entries rd-compact">
      {list.map((e) => (
        <div key={e.id} className="rd-entry">
          <div className="rd-entry-top">
            <div className="rd-entry-head">
              <span className="rd-ehead-main">
                <strong>{pick(e.name, lang)}</strong>
                {pick(e.issuer, lang) && <span className="rd-ehead-sep"> — </span>}
                {pick(e.issuer, lang) && <span>{pick(e.issuer, lang)}</span>}
              </span>
              <span className="rd-date">
                {e.issueDate ? fmtDate(e.issueDate, lang, df) : ""}
                {e.expiryDate ? ` – ${fmtDate(e.expiryDate, lang, df)}` : ""}
              </span>
            </div>
            {(e.credentialId || e.url) && (
              <div className="rd-sub">
                {e.credentialId && <span>{CRED_LABEL[lang]}: {e.credentialId}</span>}
                {e.url && (
                  <span>
                    {" · "}
                    <Link href={e.url}>{e.url.replace(/^https?:\/\//, "")}</Link>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const CRED_LABEL: Record<OutputLang, string> = { fa: "شناسه", en: "ID" };

const AwardsBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  const list = s.data as never as {
    id: string; name: { fa: string; en: string }; organization: { fa: string; en: string };
    date: string; description: { fa: string; en: string };
  }[];
  return (
    <div className="rd-entries rd-compact">
      {list.map((e) => (
        <div key={e.id} className="rd-entry">
          <div className="rd-entry-top">
            <div className="rd-entry-head">
              <span className="rd-ehead-main">
                <strong>{pick(e.name, lang)}</strong>
                {pick(e.organization, lang) && <span className="rd-ehead-sep"> — </span>}
                {pick(e.organization, lang) && <span>{pick(e.organization, lang)}</span>}
              </span>
              <span className="rd-date">{fmtDate(e.date, lang, df)}</span>
            </div>
          </div>
          <p className="rd-desc">{pick(e.description, lang)}</p>
        </div>
      ))}
    </div>
  );
};

const SKILL_LEVELS: Record<OutputLang, Record<string, string>> = {
  fa: { novice: "مبتدی", beginner: "آشنایی", intermediate: "متوسط", advanced: "پیشرفته", expert: "تسلط" },
  en: { novice: "Novice", beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced", expert: "Expert" },
};

const SkillsBody = ({ s, lang }: { s: ResumeSection; lang: OutputLang }) => {
  const cats = s.data as never as {
    id: string; name: { fa: string; en: string };
    skills: { id: string; name: string; level: string; years: string }[];
  }[];
  const two = s.columns === 2;
  return (
    <div className={two ? "rd-skills2" : "rd-skills1"}>
      {cats.map((c) => (
        <div key={c.id} className="rd-skillcat">
          <h3 className="rd-skillcat-name">{pick(c.name, lang)}</h3>
          <p className="rd-skillcat-items">
            {c.skills
              .map((sk) => {
                let label = sk.name;
                const extra: string[] = [];
                if (sk.level && SKILL_LEVELS[lang][sk.level]) extra.push(SKILL_LEVELS[lang][sk.level]);
                if (sk.years) extra.push(`${sk.years}${YEARS_SUFFIX[lang]}`);
                if (extra.length) label += ` (${extra.join(", ")})`;
                return label;
              })
              .join(lang === "en" ? ", " : "، ")}
          </p>
        </div>
      ))}
    </div>
  );
};

const YEARS_SUFFIX: Record<OutputLang, string> = { fa: " سال", en: "y" };

const LanguagesBody = ({ s, lang }: { s: ResumeSection; lang: OutputLang }) => {
  const list = s.data as never as {
    id: string; language: { fa: string; en: string };
    reading: string; writing: string; speaking: string; listening: string; overall: string;
  }[];
  const CEFR: Record<OutputLang, Record<string, string>> = {
    fa: { native: "زبان مادری" },
    en: { native: "Native" },
  };
  const lv = (v: string) => CEFR[lang][v] || v;
  const two = s.columns === 2;
  return (
    <div className={two ? "rd-skills2" : "rd-skills1"}>
      {list.map((e) => {
        const detail = [lv(e.reading), lv(e.writing), lv(e.speaking), lv(e.listening)].filter(Boolean).join(" / ");
        const overall = e.overall ? (CEFR[lang][e.overall] || e.overall) : "";
        return (
          <div key={e.id} className="rd-skillcat">
            <h3 className="rd-skillcat-name">{pick(e.language, lang)}</h3>
            <p className="rd-skillcat-items">
              {overall && <strong>{overall}</strong>}
              {overall && detail ? " — " : ""}
              {detail}
            </p>
          </div>
        );
      })}
    </div>
  );
};

const InterestsBody = ({ s, lang }: { s: ResumeSection; lang: OutputLang }) => {
  const text = pick(s.data as never as { fa: string; en: string }, lang);
  if (!text) return null;
  return <p className="rd-summary">{text}</p>;
};

const CoursesBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  const list = s.data as never as {
    id: string; name: { fa: string; en: string }; provider: { fa: string; en: string };
    date: string; duration: { fa: string; en: string }; description: { fa: string; en: string };
  }[];
  return (
    <div className="rd-entries rd-compact">
      {list.map((e) => (
        <div key={e.id} className="rd-entry">
          <div className="rd-entry-top">
            <div className="rd-entry-head">
              <span className="rd-ehead-main">
                <strong>{pick(e.name, lang)}</strong>
                {pick(e.provider, lang) && <span className="rd-ehead-sep"> — </span>}
                {pick(e.provider, lang) && <span>{pick(e.provider, lang)}</span>}
              </span>
              <span className="rd-date">
                {[fmtDate(e.date, lang, df), pick(e.duration, lang)].filter(Boolean).join(" · ")}
              </span>
            </div>
          </div>
          <p className="rd-desc">{pick(e.description, lang)}</p>
        </div>
      ))}
    </div>
  );
};

const VolunteerBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  const list = s.data as never as {
    id: string; role: { fa: string; en: string }; organization: { fa: string; en: string };
    location: { fa: string; en: string }; start: string; end: string; present: boolean;
    description: { fa: string; en: string };
  }[];
  return (
    <div className="rd-entries rd-compact">
      {list.map((e) => (
        <div key={e.id} className="rd-entry">
          <div className="rd-entry-top">
            <div className="rd-entry-head">
              <span className="rd-ehead-main">
                <strong>{pick(e.role, lang)}</strong>
                {pick(e.organization, lang) && <span className="rd-ehead-sep"> — </span>}
                {pick(e.organization, lang) && <span>{pick(e.organization, lang)}</span>}
              </span>
              <span className="rd-date">
                {e.start || e.end || e.present
                  ? `${e.start ? fmtDate(e.start, lang, df) : ""}${e.start && (e.present || e.end) ? " – " : ""}${e.present ? P_LABEL[lang] : e.end ? fmtDate(e.end, lang, df) : ""}`
                  : ""}
              </span>
            </div>
            <div className="rd-sub">{pick(e.location, lang)}</div>
          </div>
          <p className="rd-desc">{pick(e.description, lang)}</p>
        </div>
      ))}
    </div>
  );
};

const MembershipsBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  const list = s.data as never as {
    id: string; organization: { fa: string; en: string }; role: { fa: string; en: string };
    start: string; end: string; present: boolean; description: { fa: string; en: string };
  }[];
  return (
    <div className="rd-entries rd-compact">
      {list.map((e) => (
        <div key={e.id} className="rd-entry">
          <div className="rd-entry-top">
            <div className="rd-entry-head">
              <span className="rd-ehead-main">
                <strong>{pick(e.organization, lang)}</strong>
                {pick(e.role, lang) && <span className="rd-ehead-sep"> — </span>}
                {pick(e.role, lang) && <span>{pick(e.role, lang)}</span>}
              </span>
              <span className="rd-date">
                {e.start || e.end || e.present
                  ? `${e.start ? fmtDate(e.start, lang, df) : ""}${e.start && (e.present || e.end) ? " – " : ""}${e.present ? P_LABEL[lang] : e.end ? fmtDate(e.end, lang, df) : ""}`
                  : ""}
              </span>
            </div>
          </div>
          <p className="rd-desc">{pick(e.description, lang)}</p>
        </div>
      ))}
    </div>
  );
};

const TeachingBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  const list = s.data as never as {
    id: string; role: { fa: string; en: string }; institution: { fa: string; en: string };
    course: { fa: string; en: string }; start: string; end: string; present: boolean;
    description: { fa: string; en: string };
  }[];
  return (
    <div className="rd-entries rd-compact">
      {list.map((e) => (
        <div key={e.id} className="rd-entry">
          <div className="rd-entry-top">
            <div className="rd-entry-head">
              <span className="rd-ehead-main">
                <strong>{pick(e.role, lang)}</strong>
                {pick(e.course, lang) && <span className="rd-ehead-sep"> — </span>}
                {pick(e.course, lang) && <span>{pick(e.course, lang)}</span>}
              </span>
              <span className="rd-date">
                {e.start || e.end || e.present
                  ? `${e.start ? fmtDate(e.start, lang, df) : ""}${e.start && (e.present || e.end) ? " – " : ""}${e.present ? P_LABEL[lang] : e.end ? fmtDate(e.end, lang, df) : ""}`
                  : ""}
              </span>
            </div>
            <div className="rd-sub">{pick(e.institution, lang)}</div>
          </div>
          <p className="rd-desc">{pick(e.description, lang)}</p>
        </div>
      ))}
    </div>
  );
};

const PatentsBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  const list = s.data as never as {
    id: string; title: { fa: string; en: string }; inventors: { fa: string; en: string };
    office: { fa: string; en: string }; number: string; date: string;
    status: { fa: string; en: string }; description: { fa: string; en: string };
  }[];
  return (
    <div className="rd-entries rd-compact">
      {list.map((e) => (
        <div key={e.id} className="rd-entry">
          <div className="rd-entry-top">
            <div className="rd-entry-head">
              <span className="rd-ehead-main"><strong>{pick(e.title, lang)}</strong></span>
              <span className="rd-date">{fmtDate(e.date, lang, df)}</span>
            </div>
            <div className="rd-sub">
              {[pick(e.inventors, lang), pick(e.office, lang), e.number ? `${NUM_LABEL[lang]} ${e.number}` : "", pick(e.status, lang)]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <p className="rd-desc">{pick(e.description, lang)}</p>
        </div>
      ))}
    </div>
  );
};

const NUM_LABEL: Record<OutputLang, string> = { fa: "شماره", en: "No." };

const ReferencesBody = ({ s, lang }: { s: ResumeSection; lang: OutputLang }) => {
  const list = s.data as never as {
    id: string; name: { fa: string; en: string }; position: { fa: string; en: string };
    organization: { fa: string; en: string }; contact: { fa: string; en: string };
  }[];
  if (!list.length) return null;
  return (
    <div className={s.columns === 2 ? "rd-skills2" : "rd-entries rd-compact"}>
      {list.map((e) => (
        <div key={e.id} className="rd-skillcat">
          <h3 className="rd-skillcat-name">{pick(e.name, lang)}</h3>
          <p className="rd-skillcat-items">
            {[pick(e.position, lang), pick(e.organization, lang), pick(e.contact, lang)].filter(Boolean).join(" · ")}
          </p>
        </div>
      ))}
    </div>
  );
};

const CustomBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  const cs = s.data as never as {
    title: { fa: string; en: string };
    entries: { id: string; title: { fa: string; en: string }; subtitle: { fa: string; en: string }; date: { fa: string; en: string }; body: { fa: string; en: string } }[];
  };
  return (
    <div>
      {pick(cs.title, lang) && <p className="rd-desc rd-custom-lead">{pick(cs.title, lang)}</p>}
      <div className="rd-entries rd-compact">
        {cs.entries.map((e) => (
          <div key={e.id} className="rd-entry">
            <div className="rd-entry-top">
              <div className="rd-entry-head">
                <span className="rd-ehead-main">
                  <strong>{pick(e.title, lang)}</strong>
                  {pick(e.subtitle, lang) && <span className="rd-ehead-sep"> — </span>}
                  {pick(e.subtitle, lang) && <span>{pick(e.subtitle, lang)}</span>}
                </span>
                <span className="rd-date">{pick(e.date, lang)}</span>
              </div>
            </div>
            <p className="rd-desc">{pick(e.body, lang)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// Section dispatcher
// ============================================================

const SectionBody = ({ s, lang, df }: { s: ResumeSection; lang: OutputLang; df: string }) => {
  switch (s.kind) {
    case "summary": return <SummaryBody s={s} lang={lang} />;
    case "skills": return <SkillsBody s={s} lang={lang} />;
    case "experience": return <ExperienceBody s={s} lang={lang} df={df} />;
    case "education": return <EducationBody s={s} lang={lang} df={df} />;
    case "projects": return <ProjectsBody s={s} lang={lang} df={df} />;
    case "research": return <ResearchBody s={s} lang={lang} df={df} />;
    case "publications": return <PublicationsBody s={s} lang={lang} />;
    case "conferences": return <ConferencesBody s={s} lang={lang} df={df} />;
    case "certifications": return <CertificationsBody s={s} lang={lang} df={df} />;
    case "awards": return <AwardsBody s={s} lang={lang} df={df} />;
    case "languages": return <LanguagesBody s={s} lang={lang} />;
    case "courses": return <CoursesBody s={s} lang={lang} df={df} />;
    case "volunteer": return <VolunteerBody s={s} lang={lang} df={df} />;
    case "memberships": return <MembershipsBody s={s} lang={lang} df={df} />;
    case "teaching": return <TeachingBody s={s} lang={lang} df={df} />;
    case "patents": return <PatentsBody s={s} lang={lang} df={df} />;
    case "interests":
    case "hobbies": return <InterestsBody s={s} lang={lang} />;
    case "references": return <ReferencesBody s={s} lang={lang} />;
    case "custom": return <CustomBody s={s} lang={lang} df={df} />;
    default: return null;
  }
};

const hasContent = (s: ResumeSection): boolean => {
  const d = s.data as never;
  if (s.kind === "summary" || s.kind === "interests" || s.kind === "hobbies") {
    const t = d as { fa: string; en: string };
    return !!(t.fa?.trim() || t.en?.trim());
  }
  if (s.kind === "custom") {
    const c = d as { entries: unknown[]; title: { fa: string; en: string } };
    return (c.entries?.length ?? 0) > 0 || !!(c.title?.fa || c.title?.en);
  }
  return ((d as unknown[]).length ?? 0) > 0;
};

// ============================================================
// Document root
// ============================================================

export const ResumeDocument = ({
  resume,
  lang,
  className,
}: {
  resume: Resume;
  lang: OutputLang;
  className?: string;
}) => {
  const d = resume.design;
  const rtl = lang === "fa";
  const visible = resume.sectionOrder
    .map((id) => resume.sections[id])
    .filter((s): s is ResumeSection => !!s && s.visible && hasContent(s));

  return (
    <div
      className={`rd-root ${className || ""}`}
      style={designVars(resume)}
      dir={rtl ? "rtl" : "ltr"}
      lang={lang}
      data-page={d.page}
      data-header={d.headerStyle}
      data-sidebar={d.sidebar && d.headerStyle === "sidebar" ? "y" : "n"}
      data-footer={d.footer}
      data-sep={d.separator}
      data-icons={d.icons ? "y" : "n"}
    >
      {d.headerStyle === "banner" && <HeaderBanner r={resume} lang={lang} />}
      {d.headerStyle === "centered" && <HeaderCentered r={resume} lang={lang} />}
      {d.headerStyle === "split" && <HeaderSplit r={resume} lang={lang} />}
      {d.headerStyle === "minimal" && <HeaderMinimal r={resume} lang={lang} />}
      {d.headerStyle === "sidebar" && <HeaderSidebar r={resume} lang={lang} />}

      <main className="rd-main">
        {visible.map((s) => (
          <section key={s.id} className="rd-section" style={{ marginBottom: "var(--sec-gap)" }}>
            <SectionHeading s={s} lang={lang} />
            <SectionBody s={s} lang={lang} df={d.dateFormat} />
          </section>
        ))}
      </main>

      {d.footer !== "none" && (
        <footer className="rd-footer">
          {d.footer === "name-page" && <span>{pick(resume.personal.name, lang)}</span>}
          <span className="rd-pageno">1</span>
        </footer>
      )}
    </div>
  );
};
