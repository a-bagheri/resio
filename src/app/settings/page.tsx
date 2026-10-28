"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useStore, loadFromDisk } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { confirmDialog, Icon } from "@/components/ui";
import { backupToJson, parseBackup, parseImportedResume } from "@/lib/io";
import { downloadBlob, sanitizeFilename } from "@/lib/utils";

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const store = useStore();
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (useStore.getState().hydrated) return;
    const disk = loadFromDisk();
    useStore.setState({ resumes: disk.resumes, hydrated: true });
  }, []);

  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;

  const doBackup = () => {
    downloadBlob(
      new Blob([backupToJson(store.resumes)], { type: "application/json" }),
      `resio-backup-${stamp}.json`,
    );
  };

  const doRestore = async (f: File) => {
    const list = parseBackup(await f.text());
    if (list && list.length) {
      if (await confirmDialog(t("restoreHint"))) {
        store.replaceAll(list);
        setMsg(`✓ ${t("importSuccess")} (${list.length})`);
      }
    } else setMsg(t("importError"));
  };

  const doImportOne = async (f: File) => {
    const r = parseImportedResume(await f.text());
    if (r) {
      store.importResume(r);
      setMsg(`✓ ${t("importSuccess")} — ${r.name}`);
    } else setMsg(t("importError"));
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--panel)] sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
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

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">{t("settings")}</h1>

        {/* storage & privacy */}
        <section className="card">
          <h2 className="font-semibold mb-2">{t("storageCardTitle")}</h2>
          <p className="text-sm text-[var(--text-2)] mb-2">{t("storageCardHosted")}</p>
          <p className="text-sm text-[var(--text-2)] mb-3">{t("storageCardLocal")}</p>
          <div className="border-t border-[var(--border)] pt-3">
            <h3 className="text-sm font-semibold mb-1">{t("storageCloneTitle")}</h3>
            <p className="text-xs text-[var(--text-2)] mb-2">{t("storageCloneText")}</p>
            <pre
              className="text-[11px] bg-zinc-100 rounded-lg p-3 overflow-x-auto text-zinc-800"
              dir="ltr"
            >
{`git clone https://github.com/<user>/<repo>.git
cd <repo>
npm install
npm run dev`}
            </pre>
          </div>
        </section>

        {/* UI language */}
        <section className="card">
          <h2 className="font-semibold mb-1">{t("uiLanguage")}</h2>
          <p className="text-xs text-[var(--text-2)] mb-3">{t("uiLanguageNote")}</p>
          <div className="flex gap-2">
            <button
              className={`btn ${lang === "fa" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setLang("fa")}
            >
              {t("persian")}
            </button>
            <button
              className={`btn ${lang === "en" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setLang("en")}
            >
              {t("english")}
            </button>
            <span className="text-xs text-[var(--text-2)] self-center ms-2">{t("uiLang")}: {lang.toUpperCase()}</span>
          </div>
        </section>

        {/* data */}
        <section className="card">
          <h2 className="font-semibold mb-3">{t("exportData")} / {t("importData")}</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            <button className="btn btn-secondary" onClick={doBackup}>
              <Icon.save /> {t("exportBackup")}
            </button>
            <button className="btn btn-secondary" onClick={() => backupRef.current?.click()}>
              <Icon.json /> {t("restore")}
            </button>
            <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
              <Icon.file /> {t("importJson")}
            </button>
          </div>
          <p className="text-xs text-[var(--text-2)] mt-2">{t("backupHint")}</p>
          <input
            ref={backupRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doRestore(f);
              e.target.value = "";
            }}
          />
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) doImportOne(f);
              e.target.value = "";
            }}
          />
          {msg && <p className="text-sm text-[var(--accent)] mt-2">{msg}</p>}
        </section>

        {/* about */}
        <section className="card">
          <h2 className="font-semibold mb-1">{t("aboutApp")}</h2>
          <p className="text-sm text-[var(--text-2)]">{t("aboutText")}</p>
        </section>

        {/* danger zone */}
        <section className="card border-[#fecaca]">
          <h2 className="font-semibold mb-2 text-[var(--danger)]">{t("resetAll")}</h2>
          <button
            className="btn btn-danger"
            onClick={async () => {
              if (await confirmDialog(t("resetAllConfirm"))) {
                store.replaceAll([]);
                setMsg(t("resetDone"));
              }
            }}
          >
            <Icon.trash /> {t("resetAll")}
          </button>
        </section>
      </main>
    </div>
  );
}
