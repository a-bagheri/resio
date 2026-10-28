"use client";

import { useMemo, useState } from "react";
import type { Resume } from "@/lib/types";
import { scoreResume } from "@/lib/score";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// ============================================================
// Completeness panel — progress bar + actionable checklist in the
// editor's left nav. Failing items navigate to their section.
// ============================================================

export const ScorePanel = ({
  resume,
  onNavigate,
}: {
  resume: Resume;
  onNavigate: (target: string) => void;
}) => {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const score = useMemo(() => scoreResume(resume), [resume]);

  const tone =
    score.percent >= 80 ? "text-emerald-600" :
    score.percent >= 50 ? "text-amber-600" : "text-rose-600";
  const barTone =
    score.percent >= 80 ? "bg-emerald-500" :
    score.percent >= 50 ? "bg-amber-500" : "bg-rose-500";

  const failing = score.checks.filter((c) => !c.passed);

  return (
    <div className="px-2 pt-1 pb-2 border-b border-[var(--border)] shrink-0">
      <button
        className="w-full text-start"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="font-semibold text-[var(--text-2)] uppercase tracking-wide flex items-center gap-1">
            {t("scoreTitle")}
            {!open && failing.length > 0 && (
              <span className={cn("font-bold", tone)}>({failing.length})</span>
            )}
          </span>
          <span className={cn("font-bold text-xs", tone)}>{score.percent}{lang === "fa" ? "٪" : "%"}</span>
        </span>
        <span className="block h-1.5 rounded-full bg-zinc-200 overflow-hidden">
          <span
            className={cn("block h-full rounded-full transition-all duration-300", barTone)}
            style={{ width: `${score.percent}%` }}
          />
        </span>
      </button>

      {open && (
        <div className="mt-2 space-y-0.5">
          {failing.length === 0 ? (
            <p className="text-[11px] text-emerald-600 py-1">✓ {t("scoreAllGood")}</p>
          ) : (
            failing.map((c) => (
              <button
                key={c.id}
                className={cn(
                  "w-full text-start flex items-start gap-1.5 rounded-md px-1.5 py-1 text-[11px] leading-snug transition-colors",
                  c.target ? "hover:bg-[var(--accent-weak)] cursor-pointer" : "cursor-default",
                )}
                onClick={() => c.target && onNavigate(c.target)}
              >
                <span
                  className={cn(
                    "mt-0.5 w-1.5 h-1.5 rounded-full shrink-0",
                    c.severity === "error" ? "bg-rose-500" : "bg-amber-500",
                  )}
                />
                <span className="flex-1">
                  {lang === "fa" ? c.label.fa : c.label.en}
                  {c.target && <span className="opacity-50 ms-1">↵</span>}
                </span>
              </button>
            ))
          )}
          <p className="text-[10px] text-[var(--text-2)] px-1.5 pt-1">
            {t("scoreHint")}
          </p>
        </div>
      )}
    </div>
  );
};
