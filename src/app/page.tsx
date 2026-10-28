"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStore, loadFromDisk } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { confirmDialog, Icon, Modal, TextInput, Toggle } from "@/components/ui";
import { exportResume, parseBackup, parseImportedResume } from "@/lib/io";
import { cn } from "@/lib/utils";
import { TEMPLATES } from "@/lib/templates";
import { PROFESSION_PACKS } from "@/lib/professions";
import { detectEnv, type RuntimeEnv } from "@/lib/env";

export default function Dashboard() {
  const { t, lang, setLang } = useI18n();
  const {
    resumes, hydrated, createResume, deleteResume, duplicateResume,
    renameResume, importResume, replaceAll, saveStatus, lastSavedAt,
  } = useStore();
  const [newName, setNewName] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newTpl, setNewTpl] = useState("minimal");
  const [newStarter, setNewStarter] = useState(true);
  const [newProf, setNewProf] = useState("general");
  const [showImport, setShowImport] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const backupInput = useRef<HTMLInputElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const [envTag, setEnvTag] = useState<RuntimeEnv | null>(null);

  // hydrate from localStorage on first paint
  useEffect(() => {
    if (useStore.getState().hydrated) return;
    const disk = loadFromDisk();
    if (disk.resumes.length) {
      useStore.setState({ resumes: disk.resumes, hydrated: true });
    } else {
      useStore.setState({ hydrated: true });
    }
    setEnvTag(detectEnv());
  }, []);

  const now = Date.now();
  const ago = (ts: number) => {
    const d = Math.floor((now - ts) / 1000);
    if (d < 60) return t("justNow");
    if (d < 3600) return `${Math.floor(d / 60)} ${t("minutesAgo")}`;
    if (d < 86400) return `${Math.floor(d / 3600)} ${t("hoursAgo")}`;
    return `${Math.floor(d / 86400)} ${t("daysAgo")}`;
  };

  const doCreate = () => {
    const name = newName.trim() || t("defaultResumeName");
    createResume(name, { templateId: newTpl, starter: newStarter, profession: newProf });
    setNewName("");
    setNewTpl("minimal");
    setNewStarter(true);
    setNewProf("general");
    setShowNew(false);
  };

  const doImportResume = async (f: File) => {
    const raw = await f.text();
    const r = parseImportedResume(raw);
    if (r) {
      importResume(r);
      setImportMsg(t("importSuccess") + " — " + r.name);
    } else {
      setImportMsg(t("importError"));
    }
  };

  const doBackupImport = async (f: File) => {
    const raw = await f.text();
    const list = parseBackup(raw);
    if (list && list.length) {
      replaceAll(list);
      setImportMsg(t("importSuccess") + ` (${list.length})`);
    } else {
      setImportMsg(t("importError"));
    }
  };

  return (
    <div className="min-h-screen">
      {/* top bar */}
      <header className="border-b border-[var(--border)] bg-[var(--panel)] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/" className="font-bold text-[var(--accent)]">◆ {t("appName")}</Link>
          <span className="text-xs text-[var(--text-2)] hidden sm:inline">{t("appSubtitle")}</span>
          <div className="flex-1" />
          <nav className="flex items-center gap-1 text-sm">
            <Link className="btn btn-ghost" href="/">{t("dashboard")}</Link>
            <Link className="btn btn-ghost" href="/templates">{t("templates")}</Link>
            <Link className="btn btn-ghost" href="/settings">{t("settings")}</Link>
            <button
              className="btn btn-ghost"
              onClick={() => setLang(lang === "fa" ? "en" : "fa")}
              title="fa / en"
            >
              {lang === "fa" ? "EN" : "FA"}
            </button>
          </nav>
        </div>
      </header>

      {/* storage notice — hosted vs. local */}
      {envTag && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div
            className={cn(
              "card text-xs flex items-start gap-2 py-2.5",
              envTag === "hosted"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-800",
            )}
          >
            <span className="mt-0.5 shrink-0">{envTag === "hosted" ? "☁" : "💾"}</span>
            <p>{envTag === "hosted" ? t("storageBadgeHosted") : t("storageBadgeLocal")}</p>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t("myResumes")}</h1>
            <p className="text-sm text-[var(--text-2)] mt-1">{t("dashboardTagline")}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => setShowImport(true)}>
              {t("importData")}
            </button>
            <button className="btn btn-primary" onClick={() => setShowNew(true)}>
              + {t("createNew")}
            </button>
          </div>
        </div>

        {hydrated && resumes.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3 opacity-40">◆</div>
            <h2 className="font-semibold mb-1">{t("noResumes")}</h2>
            <p className="text-sm text-[var(--text-2)] mb-5">{t("noResumesHint")}</p>
            <button className="btn btn-primary" onClick={() => setShowNew(true)}>
              + {t("createNew")}
            </button>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((r) => (
            <div key={r.id} className="card group relative flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/editor?id=${r.id}`} className="font-semibold hover:text-[var(--accent)]">
                  {r.name}
                </Link>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded border",
                    r.outputLang === "fa"
                      ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                      : "text-sky-700 border-sky-200 bg-sky-50",
                  )}
                >
                  {r.outputLang === "fa" ? "FA" : "EN"}
                </span>
                <span
                  className="w-4 h-4 rounded-full border border-black/10"
                  style={{ background: r.design.primary }}
                />
              </div>
              <p className="text-xs text-[var(--text-2)] mt-1">
                {t("template")}: {r.design.templateId} · {t("updated")} {ago(r.updatedAt)}
              </p>
              <div className="flex-1" />
              <div className="flex gap-1 mt-4 pt-3 border-t border-[var(--border)] flex-wrap">
                <Link className="btn btn-secondary text-xs" href={`/editor?id=${r.id}`}>{t("openEditor")}</Link>
                <Link className="btn btn-ghost text-xs" href={`/print?id=${r.id}`}>{t("exportPdf")}</Link>
                <button
                  className="iconbtn"
                  title={t("rename")}
                  onClick={() => { setRenameId(r.id); setRenameVal(r.name); }}
                >
                  <Icon.pencil />
                </button>
                <button
                  className="iconbtn"
                  title={t("duplicate")}
                  onClick={() => duplicateResume(r.id)}
                >
                  <Icon.copy />
                </button>
                <button
                  className="iconbtn"
                  title={t("exportData")}
                  onClick={() => exportResume(r)}
                >
                  <Icon.json />
                </button>
                <button
                  className="iconbtn danger"
                  title={t("delete")}
                  onClick={async () => {
                    if (await confirmDialog(t("confirmDeleteResume"))) deleteResume(r.id);
                  }}
                >
                  <Icon.trash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* new resume modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title={t("createNew")} width={520}>
        <label className="lbl">{t("resumeName")}</label>
        <TextInput value={newName} onChange={setNewName} placeholder={t("resumeNamePlaceholder")} />

        <div className="mt-4">
          <span className="lbl">{t("chooseProfession")}</span>
          <div className="flex flex-wrap gap-1.5">
            {[{ id: "general", name: { fa: t("profGeneral"), en: t("profGeneral") } }, ...PROFESSION_PACKS].map((p) => (
              <button
                key={p.id}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors",
                  newProf === p.id
                    ? "border-[var(--accent)] bg-[var(--accent-weak)] text-[var(--accent)] font-medium"
                    : "border-[var(--border)] hover:border-zinc-300",
                )}
                onClick={() => setNewProf(p.id)}
              >
                {lang === "fa" ? p.name.fa : p.name.en}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--text-2)] mt-1.5">{t("profHint")}</p>
        </div>

        <div className="mt-4">
          <span className="lbl">{t("chooseTemplate")}</span>
          <div className="grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pe-1">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                className={cn(
                  "border rounded-lg p-2 text-start transition-colors",
                  newTpl === tpl.id
                    ? "border-[var(--accent)] ring-2 ring-[var(--accent-weak)]"
                    : "border-[var(--border)] hover:border-zinc-300",
                )}
                onClick={() => setNewTpl(tpl.id)}
              >
                <span className="flex gap-0.5 mb-1.5">
                  <i className="w-2.5 h-2.5 rounded-sm" style={{ background: tpl.primary }} />
                  <i className="w-2.5 h-2.5 rounded-sm" style={{ background: tpl.secondary }} />
                  <i className="w-2.5 h-2.5 rounded-sm" style={{ background: tpl.accent }} />
                </span>
                <span className="block text-[11px] font-medium leading-tight">
                  {lang === "fa" ? tpl.name.fa : tpl.name.en}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 border-t border-[var(--border)] pt-2">
          <Toggle checked={newStarter} onChange={setNewStarter} label={t("startWithSample")} />
          <p className="text-xs text-[var(--text-2)] mt-1">{t("startWithSampleHint")}</p>
        </div>
        <p className="text-xs text-[var(--text-2)] my-3">{t("resumeLanguageNote")}</p>
        <div className="flex justify-end gap-2">
          <button className="btn btn-secondary" onClick={() => setShowNew(false)}>{t("cancel")}</button>
          <button className="btn btn-primary" onClick={doCreate}>{t("createNew")}</button>
        </div>
      </Modal>

      {/* import modal */}
      <Modal open={showImport} onClose={() => { setShowImport(false); setImportMsg(""); }} title={t("importData")}>
        <div className="space-y-4">
          <div>
            <p className="text-sm mb-2">{t("importHint")}</p>
            <button className="btn btn-secondary w-full" onClick={() => importInput.current?.click()}>
              {t("importJson")}
            </button>
            <input
              ref={importInput}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) doImportResume(f);
                e.target.value = "";
              }}
            />
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <p className="text-sm mb-1">{t("backup")} — {t("backupHint")}</p>
            <p className="text-xs text-[var(--text-2)] mb-2">{t("restoreHint")}</p>
            <button className="btn btn-secondary w-full" onClick={() => backupInput.current?.click()}>
              {t("restore")}
            </button>
            <input
              ref={backupInput}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) doBackupImport(f);
                e.target.value = "";
              }}
            />
          </div>
          {importMsg && <p className="text-sm text-[var(--accent)]">{importMsg}</p>}
        </div>
      </Modal>

      {/* rename modal */}
      <Modal open={!!renameId} onClose={() => setRenameId(null)} title={t("rename")}>
        <label className="lbl">{t("resumeName")}</label>
        <TextInput value={renameVal} onChange={setRenameVal} />
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn btn-secondary" onClick={() => setRenameId(null)}>{t("cancel")}</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (renameId && renameVal.trim()) renameResume(renameId, renameVal.trim());
              setRenameId(null);
            }}
          >
            {t("save")}
          </button>
        </div>
      </Modal>

      <footer className="max-w-6xl mx-auto px-4 py-6 text-xs text-[var(--text-2)] flex items-center gap-2">
        <SaveStatusDot />
        <span>
          {saveStatus === "saving" ? t("saving") :
            lastSavedAt ? `${t("lastSaved")}: ${new Date(lastSavedAt).toLocaleTimeString(lang === "fa" ? "fa-IR" : "en-US")}` :
              t("saved")}
        </span>
      </footer>
    </div>
  );
}

const SaveStatusDot = () => {
  const saveStatus = useStore((s) => s.saveStatus);
  const color =
    saveStatus === "saving" ? "bg-amber-400 animate-pulse" :
    saveStatus === "dirty" ? "bg-zinc-300" : "bg-emerald-500";
  return <span className={cn("w-2 h-2 rounded-full inline-block", color)} />;
};
