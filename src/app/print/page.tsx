"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useStore, loadFromDisk } from "@/lib/store";
import type { Resume } from "@/lib/types";
import { ResumeDocument, designVars } from "@/components/resume-document";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function PrintClient() {
  const search = useSearchParams();
  const id = search.get("id") || "";
  const { t } = useI18n();
  const [resume, setResume] = useState<Resume | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // prefer live store, fall back to disk (fresh tab)
    const fromStore = useStore.getState().getResume(id);
    if (fromStore) {
      setResume(fromStore);
    } else {
      const disk = loadFromDisk();
      const found = disk.resumes.find((r) => r.id === id);
      if (found) setResume(found);
    }
    setReady(true);
  }, [id]);

  if (!ready) return null;
  if (!resume) {
    return (
      <div className="p-10 text-center text-[var(--text-2)]">Resume not found.</div>
    );
  }

  const lang = resume.outputLang;

  return (
    <div className="print-root">
      <div className="no-print flex items-center gap-3 p-3 bg-white border-b border-[var(--border)] sticky top-0 z-10">
        <Link className="btn btn-secondary text-xs" href={`/editor?id=${id}`}>← {t("backToEditor")}</Link>
        <p className="text-xs text-[var(--text-2)] flex-1">{t("printHint")}</p>
        <button className="btn btn-primary text-xs" onClick={() => window.print()}>
          {t("printNow")}
        </button>
      </div>

      <div className="print-area flex justify-center py-6 bg-zinc-200">
        <div className="rd-page print-page-shadow" data-page={resume.design.page}>
          <div className="rd-root-wrapper" style={{ ...designVars(resume), padding: "var(--pad)" }}>
            <ResumeDocument resume={resume} lang={lang} />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-area { padding: 0 !important; background: #fff !important; }
          .print-page-shadow { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function PrintPage() {
  // Suspense boundary: useSearchParams is unavailable during static
  // prerendering (required for the GitHub Pages export).
  return (
    <Suspense fallback={null}>
      <PrintClient />
    </Suspense>
  );
}
