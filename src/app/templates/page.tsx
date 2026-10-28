"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore, loadFromDisk } from "@/lib/store";
import type { OutputLang } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { TEMPLATES, type TemplateDef, getTemplate } from "@/lib/templates";
import { Icon } from "@/components/ui";
import { ResumeDocument } from "@/components/resume-document";
import { makeDemoResume } from "@/lib/demo";

function TemplateThumb({ tpl, lang }: { tpl: TemplateDef; lang: OutputLang }) {
  const resume = makeDemoResume(tpl.id);
  return (
    <div
      className="rd-page"
      data-page="a4"
      style={{ transform: "scale(0.32)", transformOrigin: "top left", pointerEvents: "none" }}
    >
      <div className="rd-root-wrapper" style={{ padding: 12 }}>
        <ResumeDocument resume={resume} lang={lang} />
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const { t, lang, setLang } = useI18n();
  const store = useStore();
  const router = useRouter();
  const [outLang, setOutLang] = useState<OutputLang>("en");
  const [resumes, setResumes] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (useStore.getState().hydrated) {
      setResumes(useStore.getState().resumes.map((r) => ({ id: r.id, name: r.name })));
      return;
    }
    const disk = loadFromDisk();
    useStore.setState({ resumes: disk.resumes, hydrated: true });
    setResumes(disk.resumes.map((r) => ({ id: r.id, name: r.name })));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--panel)] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="font-bold text-[var(--accent)]">◆ {t("appName")}</Link>
          <div className="flex-1" />
          <nav className="flex items-center gap-1 text-sm">
            <Link className="btn btn-ghost" href="/">{t("dashboard")}</Link>
            <Link className="btn btn-ghost" href="/templates">{t("templates")}</Link>
            <Link className="btn btn-ghost" href="/settings">{t("settings")}</Link>
            <button className="btn btn-ghost" onClick={() => setLang(lang === "fa" ? "en" : "fa")}>
              {lang === "fa" ? "EN" : "FA"}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t("selectTemplate")}</h1>
            <p className="text-sm text-[var(--text-2)] mt-1">{t("atsHint")}</p>
          </div>
          <div className="flex gap-1 text-xs">
            <button
              className={cn("btn", outLang === "fa" ? "btn-primary" : "btn-secondary")}
              onClick={() => setOutLang("fa")}
            >
              {t("persian")}
            </button>
            <button
              className={cn("btn", outLang === "en" ? "btn-primary" : "btn-secondary")}
              onClick={() => setOutLang("en")}
            >
              {t("english")}
            </button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="card flex flex-col">
              <div
                dir="ltr"
                className="thumb-viewport overflow-hidden h-64 rounded-lg border border-[var(--border)] bg-zinc-100"
              >
                <TemplateThumb tpl={tpl} lang={outLang} />
              </div>
              <div className="mt-3 flex flex-col flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-sm">{lang === "fa" ? tpl.name.fa : tpl.name.en}</h2>
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded border",
                      tpl.ats === "friendly" && "text-emerald-700 border-emerald-200 bg-emerald-50",
                      tpl.ats === "partial" && "text-amber-700 border-amber-200 bg-amber-50",
                      tpl.ats === "not-recommended" && "text-rose-700 border-rose-200 bg-rose-50",
                    )}
                  >
                    {tpl.ats === "friendly" ? t("atsFriendly") : tpl.ats === "partial" ? t("atsPartial") : t("atsNotRecommended")}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-2)] mt-1">{lang === "fa" ? tpl.description.fa : tpl.description.en}</p>
                <div className="mt-auto pt-3 flex flex-wrap gap-1.5">
                  {resumes.length === 0 && (
                    <p className="text-xs text-[var(--text-2)]">{t("noResumesHint")}</p>
                  )}
                  {resumes.map((r) => (
                    <button
                      key={r.id}
                      className="btn btn-secondary text-[11px]"
                      onClick={() => {
                        const tpl2 = getTemplate(tpl.id);
                        store.update(r.id, (rr) => {
                          Object.assign(rr.design, {
                            templateId: tpl2.id,
                            primary: tpl2.primary,
                            secondary: tpl2.secondary,
                            accent: tpl2.accent,
                            fontFamily: tpl2.font,
                            headerStyle: tpl2.headerStyle,
                            sidebar: tpl2.sidebar,
                          });
                        });
                        router.push(`/editor?id=${r.id}`);
                      }}
                      title={t("applyTemplate")}
                    >
                      <Icon.wand /> {r.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
