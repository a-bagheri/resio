"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { Resume, OutputLang } from "@/lib/types";
import { ResumeDocument, designVars } from "./resume-document";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PAGE_W_MM = { a4: 210, letter: 216 };

export const LivePreview = ({ resume }: { resume: Resume }) => {
  const { t, lang } = useI18n();
  const [outputLang, setOutputLang] = useState<OutputLang>(resume.outputLang);
  const [zoom, setZoom] = useState(0.75);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [wrapW, setWrapW] = useState(900);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWrapW(el.clientWidth));
    ro.observe(el);
    setWrapW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // fit-to-width zoom on first mount
  useEffect(() => {
    const pw = PAGE_W_MM[resume.design.page] ?? 210;
    const px = (pw / 25.4) * 96;
    if (wrapW > 100 && wrapW - 48 < px) {
      setZoom(Math.min(1, (wrapW - 48) / px));
    }
  }, [wrapW, resume.design.page]);

  const scaleStyle = useMemo(
    () => ({
      transform: `scale(${zoom})`,
      transformOrigin: "top center",
    }),
    [zoom],
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border)] bg-[var(--panel)] no-print flex-wrap">
        <div className="zoom-controls">
          <button onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}>−</button>
          <span className="zoom-val">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>+</button>
        </div>
        <div className="flex-1" />
        <div className="flex gap-1 text-xs">
          <button
            className={cn("btn text-xs", outputLang === "fa" ? "btn-primary" : "btn-secondary")}
            onClick={() => setOutputLang("fa")}
          >
            {t("faPreview")}
          </button>
          <button
            className={cn("btn text-xs", outputLang === "en" ? "btn-primary" : "btn-secondary")}
            onClick={() => setOutputLang("en")}
          >
            {t("enPreview")}
          </button>
        </div>
      </div>

      {/* page */}
      <div className="preview-wrap" ref={wrapRef}>
        <div style={scaleStyle}>
          <div className="preview-page rd-page">
            <div className="rd-root-wrapper" style={{ ...designVars(resume), padding: "var(--pad)" }}>
              <ResumeDocument resume={resume} lang={outputLang} />
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-[11px] text-[var(--text-2)] py-1 no-print">
        UI: {lang === "fa" ? "فارسی" : "English"} • Output: {outputLang === "fa" ? "فارسی / RTL" : "English / LTR"}
      </p>
    </div>
  );
};
