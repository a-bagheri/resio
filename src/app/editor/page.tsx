"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore, loadFromDisk } from "@/lib/store";
import type { Resume, ResumeSection, SectionKind } from "@/lib/types";
import { SECTION_META } from "@/lib/types";
import { getTemplate, type AtsRating } from "@/lib/templates";
import { useI18n } from "@/lib/i18n";
import { pick, cn, downloadBlob, sanitizeFilename } from "@/lib/utils";
import { exportResume } from "@/lib/io";
import { buildLatexZip, generateLaTeX } from "@/lib/latex";
import { exportDocx } from "@/lib/export-docx";
import { exportHtml } from "@/lib/export-html";
import { confirmDialog, Icon, Modal, TextInput } from "@/components/ui";
import { PersonalEditor } from "@/components/personal-editor";
import { DesignPanel } from "@/components/design-panel";
import { SectionEditor, useDragList } from "@/components/section-editor";
import { ScorePanel } from "@/components/score-panel";
import { LivePreview } from "@/components/live-preview";

type CenterTab = "content" | "design" | "preview";

const ATS_CLASS: Record<AtsRating, string> = {
  friendly: "text-emerald-700 border-emerald-200 bg-emerald-50",
  partial: "text-amber-700 border-amber-200 bg-amber-50",
  "not-recommended": "text-rose-700 border-rose-200 bg-rose-50",
};

function EditorClient() {
  const search = useSearchParams();
  const id = search.get("id") || "";
  const router = useRouter();
  const { t, lang } = useI18n();
  const store = useStore();
  const resume = store.resumes.find((r) => r.id === id);

  const [tab, setTab] = useState<CenterTab>("content");
  const [activeSection, setActiveSection] = useState<string | null>("__personal__");
  const [showAdd, setShowAdd] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renameVal, setRenameVal] = useState("");

  // hydrate from localStorage on first paint
  useEffect(() => {
    if (useStore.getState().hydrated) return;
    const disk = loadFromDisk();
    useStore.setState({ resumes: disk.resumes, hydrated: true });
  }, []);

  const ordered = useMemo(
    () =>
      resume
        ? resume.sectionOrder.map((id) => resume.sections[id]).filter((s): s is ResumeSection => !!s)
        : [],
    [resume],
  );

  const sectionsNav = useDragList(
    ordered.map((s) => s.id),
    (ids) => resume && store.reorderSections(resume.id, ids),
  );

  if (!resume) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-[var(--text-2)]">{t("noResumes")}</p>
        <Link className="btn btn-primary" href="/">{t("dashboard")}</Link>
      </div>
    );
  }

  const ats = getTemplate(resume.design.templateId).ats;
  const atsLabel =
    ats === "friendly" ? t("atsFriendly") : ats === "partial" ? t("atsPartial") : t("atsNotRecommended");

  const current = ordered.find((s) => s.id === activeSection);
  const showPersonal = activeSection === "__personal__";

  const doExportPdf = () => router.push(`/print?id=${resume.id}`);

  const doExportDocx = async (out: "fa" | "en") => {
    await exportDocx(resume, out);
  };

  const doExportHtml = (out: "fa" | "en") => {
    exportHtml(resume, out);
  };

  const doExportLaTeX = async (out: "fa" | "en", zip: boolean) => {
    const suffix = out === "fa" ? "-fa" : "-en";
    if (zip) {
      const blob = await buildLatexZip(resume, out);
      downloadBlob(blob, sanitizeFilename(resume.name) + suffix + "-latex.zip");
    } else {
      downloadBlob(
        new Blob([generateLaTeX(resume, out)], { type: "application/x-tex" }),
        sanitizeFilename(resume.name) + suffix + ".tex",
      );
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* top bar */}
      <header className="no-print border-b border-[var(--border)] bg-[var(--panel)] px-3 h-12 flex items-center gap-2 shrink-0">
        <Link href="/" className="iconbtn" title={t("dashboard")}>
          <Icon.home />
        </Link>
        <button
          className="font-semibold text-sm hover:text-[var(--accent)] truncate max-w-40"
          onClick={() => {
            setRenameVal(resume.name);
            setShowRename(true);
          }}
          title={t("rename")}
        >
          {resume.name}
        </button>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border hidden sm:inline", ATS_CLASS[ats])}>
          {atsLabel}
        </span>
        <div className="flex-1" />
        <SaveDot />
        <button className="btn btn-ghost text-xs" onClick={() => setShowExport(true)}>
          <Icon.pdf /> {t("editorExport")}
        </button>
      </header>

      {/* mobile tabs */}
      <div className="ed-tabs no-print">
        <button className={cn("ed-tab-btn", tab === "content" && "active")} onClick={() => setTab("content")}>
          {t("contentTab")}
        </button>
        <button className={cn("ed-tab-btn", tab === "design" && "active")} onClick={() => setTab("design")}>
          {t("designTab")}
        </button>
        <button className={cn("ed-tab-btn", tab === "preview" && "active")} onClick={() => setTab("preview")}>
          {t("preview")}
        </button>
      </div>

      <div className="ed-three-pane flex flex-1 min-h-0">
        {/* left: sections nav */}
        <aside
          className={cn(
            "ed-pane no-print shrink-0",
            tab !== "content" && "hidden lg:block",
          )}
          style={{ width: 236 }}
        >
          <SectionsNav
            resume={resume}
            ordered={ordered}
            activeSection={activeSection}
            onActivate={(id) => {
              setActiveSection(id);
              setTab("content");
            }}
            drag={sectionsNav}
            onAdd={() => setShowAdd(true)}
          />
        </aside>

        {/* center: form */}
        <section
          className={cn(
            "ed-pane flex-1 min-w-0 overflow-y-auto",
            tab === "preview" && "hidden lg:block",
          )}
        >
          <div className="max-w-2xl mx-auto p-4">
            {/* desktop content/design switch */}
            <div className="hidden lg:flex items-center gap-1 mb-4">
              <button className={cn("btn text-xs", tab === "content" ? "btn-primary" : "btn-secondary")} onClick={() => setTab("content")}>
                {t("contentTab")}
              </button>
              <button className={cn("btn text-xs", tab === "design" ? "btn-primary" : "btn-secondary")} onClick={() => setTab("design")}>
                {t("designTab")}
              </button>
            </div>

            {tab === "design" ? (
              <div className="card">
                <DesignPanel resume={resume} />
              </div>
            ) : (
              <>
                {showPersonal ? (
                  <div className="card">
                    <PersonalEditor resume={resume} />
                  </div>
                ) : current ? (
                  <div className="card">
                    <SectionEditor resume={resume} section={current} />
                  </div>
                ) : (
                  <div className="card text-center py-10 text-sm text-[var(--text-2)]">
                    {t("chooseSection")}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* right: preview */}
        <aside
          className={cn(
            "ed-pane no-print shrink-0 overflow-hidden",
            tab !== "preview" && "hidden lg:block",
          )}
          style={{ width: "min(46vw, 640px)" }}
        >
          <LivePreview resume={resume} />
        </aside>
      </div>

      <AddSectionModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        existing={ordered.map((s) => s.kind)}
        onAdd={(kind) => {
          const id = store.addSection(resume.id, kind);
          setActiveSection(id);
          setTab("content");
        }}
      />

      {/* rename modal */}
      <Modal open={showRename} onClose={() => setShowRename(false)} title={t("rename")}>
        <label className="lbl">{t("resumeName")}</label>
        <TextInput value={renameVal} onChange={setRenameVal} />
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn btn-secondary" onClick={() => setShowRename(false)}>{t("cancel")}</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (renameVal.trim()) store.renameResume(resume.id, renameVal.trim());
              setShowRename(false);
            }}
          >
            {t("save")}
          </button>
        </div>
      </Modal>

      {/* export modal */}
      <Modal open={showExport} onClose={() => setShowExport(false)} title={t("editorExport")}>
        <div className="space-y-4">
          <div>
            <button className="btn btn-primary w-full" onClick={doExportPdf}>
              <Icon.pdf /> {t("exportPdf")}
            </button>
            <p className="text-xs text-[var(--text-2)] mt-1.5">{t("printHint")}</p>
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <p className="text-sm font-medium mb-1">{t("wordHtmlExport")}</p>
            <p className="text-xs text-[var(--text-2)] mb-2">{t("wordHtmlHint")}</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn btn-secondary text-xs" onClick={() => doExportDocx("en")}>
                <Icon.file /> Word English
              </button>
              <button className="btn btn-secondary text-xs" onClick={() => doExportDocx("fa")}>
                <Icon.file /> Word فارسی
              </button>
              <button className="btn btn-secondary text-xs" onClick={() => doExportHtml("en")}>
                <Icon.eye /> HTML English
              </button>
              <button className="btn btn-secondary text-xs" onClick={() => doExportHtml("fa")}>
                <Icon.eye /> HTML فارسی
              </button>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <p className="text-sm font-medium mb-1">{t("latexExport")}</p>
            <p className="text-xs text-[var(--text-2)] mb-2">{t("latexHint")}</p>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn btn-secondary text-xs" onClick={() => doExportLaTeX("en", true)}>
                <Icon.zip /> {t("latexEn")}
              </button>
              <button className="btn btn-secondary text-xs" onClick={() => doExportLaTeX("fa", true)}>
                <Icon.zip /> {t("latexFa")}
              </button>
              <button className="btn btn-ghost text-xs" onClick={() => doExportLaTeX("en", false)}>
                <Icon.file /> {t("downloadTex")} .en
              </button>
              <button className="btn btn-ghost text-xs" onClick={() => doExportLaTeX("fa", false)}>
                <Icon.file /> {t("downloadTex")} .fa
              </button>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <button className="btn btn-secondary w-full text-xs" onClick={() => exportResume(resume)}>
              <Icon.json /> {t("exportData")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================================
// Sections navigation (left pane)
// ============================================================

const SectionsNav = ({
  resume,
  ordered,
  activeSection,
  onActivate,
  drag,
  onAdd,
}: {
  resume: Resume;
  ordered: ResumeSection[];
  activeSection: string | null;
  onActivate: (id: string) => void;
  drag: ReturnType<typeof useDragList>;
  onAdd: () => void;
}) => {
  const { t, lang } = useI18n();
  const store = useStore();

  return (
    <div className="h-full flex flex-col bg-[var(--panel)] border-e border-[var(--border)]">
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--text-2)] uppercase tracking-wide">
          {t("sections")}
        </span>
        <button className="iconbtn" onClick={onAdd} title={t("addSection")}>
          <Icon.plus />
        </button>
      </div>
      <ScorePanel resume={resume} onNavigate={onActivate} />
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div
          className={cn(
            "sect-nav-item",
            activeSection === "__personal__" && "bg-[var(--accent-weak)] text-[var(--accent)]",
          )}
          onClick={() => onActivate("__personal__")}
        >
          <Icon.user />
          <span className="flex-1 truncate">{t("personal")}</span>
        </div>
        {ordered.map((s) => (
          <div
            key={s.id}
            className={cn(
              "sect-nav-item",
              drag.dragId === s.id && "dragging",
              drag.overId === s.id && "drop-target",
              activeSection === s.id && "bg-[var(--accent-weak)] text-[var(--accent)]",
              !s.visible && "opacity-45",
            )}
            onClick={() => onActivate(s.id)}
            {...drag.props(s.id)}
          >
            <span className="handle"><Icon.grip /></span>
            <span className="flex-1 truncate">{pick(s.title, lang)}</span>
            <button
              className="iconbtn"
              title={s.visible ? t("hide") : t("show")}
              onClick={(e) => {
                e.stopPropagation();
                store.toggleSectionVisible(resume.id, s.id);
              }}
            >
              {s.visible ? <Icon.eye /> : <Icon.eyeOff />}
            </button>
            {!s.locked && (
              <button
                className="iconbtn danger"
                title={t("delete")}
                onClick={async (e) => {
                  e.stopPropagation();
                  if (await confirmDialog(t("confirmDeleteSection"))) {
                    store.removeSection(resume.id, s.id);
                    if (activeSection === s.id) onActivate("__personal__");
                  }
                }}
              >
                <Icon.trash />
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[var(--text-2)] px-3 py-2 border-t border-[var(--border)]">
        {t("keyboardHint")}
      </p>
    </div>
  );
};

// ============================================================
// Add-section modal
// ============================================================

const AddSectionModal = ({
  open,
  onClose,
  existing,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  existing: SectionKind[];
  onAdd: (kind: SectionKind) => void;
}) => {
  const { t, lang } = useI18n();
  return (
    <Modal open={open} onClose={onClose} title={t("addSection")} width={520}>
      <p className="text-xs text-[var(--text-2)] mb-2">{t("addBuiltIn")}</p>
      <div className="grid grid-cols-2 gap-1.5 mb-4">
        {(Object.keys(SECTION_META) as SectionKind[])
          .filter((k) => k !== "custom" && !existing.includes(k))
          .map((k) => (
            <button
              key={k}
              className="btn btn-secondary text-xs justify-start"
              onClick={() => {
                onAdd(k);
                onClose();
              }}
            >
              {lang === "fa" ? SECTION_META[k].title.fa : SECTION_META[k].title.en}
              {SECTION_META[k].required && <span className="ms-auto text-[9px] opacity-60">●</span>}
            </button>
          ))}
      </div>
      <button
        className="btn btn-primary w-full text-xs"
        onClick={() => {
          onAdd("custom");
          onClose();
        }}
      >
        <Icon.plus /> {t("addCustomSectionBtn")}
      </button>
    </Modal>
  );
};

// ============================================================
// Autosave indicator
// ============================================================

const SaveDot = () => {
  const saveStatus = useStore((s) => s.saveStatus);
  const lastSavedAt = useStore((s) => s.lastSavedAt);
  const { t, lang } = useI18n();
  return (
    <span className="hidden md:flex items-center gap-1.5 text-[11px] text-[var(--text-2)]">
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          saveStatus === "saving" ? "bg-amber-400 animate-pulse" :
          saveStatus === "dirty" ? "bg-zinc-300" : "bg-emerald-500",
        )}
      />
      {saveStatus === "saving" ? t("saving") :
        saveStatus === "dirty" ? "…" :
        lastSavedAt ? `${t("lastSaved")}: ${new Date(lastSavedAt).toLocaleTimeString(lang === "fa" ? "fa-IR" : "en-US")}` :
        t("saved")}
    </span>
  );
};

export default function EditorPage() {
  // Suspense boundary: useSearchParams is unavailable during static
  // prerendering (required for the GitHub Pages export).
  return (
    <Suspense fallback={null}>
      <EditorClient />
    </Suspense>
  );
}
