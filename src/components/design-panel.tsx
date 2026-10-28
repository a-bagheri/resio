"use client";

import type { Resume, DesignSettings } from "@/lib/types";
import { getTemplate, TEMPLATES, PALETTES } from "@/lib/templates";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Select, Slider, Toggle, ColorField, Icon } from "./ui";

const ATS_BADGE: Record<string, { cls: string }> = {
  friendly: { cls: "text-emerald-700 border-emerald-200 bg-emerald-50" },
  partial: { cls: "text-amber-700 border-amber-200 bg-amber-50" },
  "not-recommended": { cls: "text-rose-700 border-rose-200 bg-rose-50" },
};

export const DesignPanel = ({ resume }: { resume: Resume }) => {
  const { t, lang } = useI18n();
  const update = useStore((s) => s.update);
  const d = resume.design;

  const set = (patch: Partial<DesignSettings>) =>
    update(resume.id, (r) => Object.assign(r.design, patch));

  const applyTemplate = (id: string) => {
    const tpl = getTemplate(id);
    update(resume.id, (r) => {
      Object.assign(r.design, {
        templateId: tpl.id,
        primary: tpl.primary,
        secondary: tpl.secondary,
        accent: tpl.accent,
        fontFamily: tpl.font,
        headerStyle: tpl.headerStyle,
        sidebar: tpl.sidebar,
      });
    });
  };

  const ats = getTemplate(d.templateId).ats;
  const atsLabel =
    ats === "friendly" ? t("atsFriendly") : ats === "partial" ? t("atsPartial") : t("atsNotRecommended");

  const fontLabel = (f: string) => {
    const faMap: Record<string, string> = {
      vazirmatn: "وزیرمتن", inter: "Inter", georgia: "Georgia",
      roboto: "Roboto", merriweather: "Merriweather",
    };
    const enMap: Record<string, string> = {
      vazirmatn: "Vazirmatn", inter: "Inter", georgia: "Georgia",
      roboto: "Roboto", merriweather: "Merriweather",
    };
    return lang === "fa" ? faMap[f] : enMap[f];
  };

  return (
    <div className="space-y-5">
      {/* ATS indicator */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="h-title">{t("atsTitle")}</h3>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border inline-flex items-center gap-1", ATS_BADGE[ats].cls)}>
            <Icon.ats />
            {atsLabel}
          </span>
        </div>
        <p className="text-xs text-[var(--text-2)]">{t("atsHint")}</p>
      </div>

      {/* template picker */}
      <div>
        <h3 className="h-title mb-2">{t("template")}</h3>
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              className={cn(
                "border rounded-lg p-2 text-start transition-colors",
                d.templateId === tpl.id
                  ? "border-[var(--accent)] ring-2 ring-[var(--accent-weak)]"
                  : "border-[var(--border)] hover:border-zinc-300",
              )}
              onClick={() => applyTemplate(tpl.id)}
            >
              <span className="flex gap-0.5 mb-1.5">
                <i className="w-3 h-3 rounded-sm" style={{ background: tpl.primary }} />
                <i className="w-3 h-3 rounded-sm" style={{ background: tpl.secondary }} />
                <i className="w-3 h-3 rounded-sm" style={{ background: tpl.accent }} />
              </span>
              <span className="block text-xs font-medium">{lang === "fa" ? tpl.name.fa : tpl.name.en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* colors */}
      <div>
        <h3 className="h-title mb-2">{t("palettes")}</h3>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PALETTES.map((pal) => (
            <button
              key={pal.name}
              title={pal.name}
              className="flex rounded-md overflow-hidden border border-[var(--border)]"
              onClick={() => set({ primary: pal.colors[0], secondary: pal.colors[1], accent: pal.colors[2] })}
            >
              {pal.colors.map((c) => (
                <i key={c} className="w-5 h-5" style={{ background: c }} />
              ))}
            </button>
          ))}
        </div>
        <h3 className="text-xs font-semibold text-[var(--text-2)] mb-1.5">{t("customColors")}</h3>
        <div className="grid grid-cols-3 gap-2">
          <ColorField label={t("primaryColor")} value={d.primary} onChange={(v) => set({ primary: v })} />
          <ColorField label={t("secondaryColor")} value={d.secondary} onChange={(v) => set({ secondary: v })} />
          <ColorField label={t("accentColor")} value={d.accent} onChange={(v) => set({ accent: v })} />
        </div>
      </div>

      {/* typography */}
      <div>
        <h3 className="h-title mb-2">{t("typography")}</h3>
        <div className="space-y-2">
          <div>
            <span className="lbl">{t("font")}</span>
            <select
              className="inp"
              value={d.fontFamily}
              onChange={(e) => set({ fontFamily: e.target.value as DesignSettings["fontFamily"] })}
            >
              {["vazirmatn", "inter", "georgia", "roboto", "merriweather"].map((f) => (
                <option key={f} value={f}>{fontLabel(f)}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="lbl">{t("fontSize")}</span>
            <Slider value={d.fontSize} min={8} max={13} step={0.5} suffix="pt" onChange={(v) => set({ fontSize: v })} />
          </div>
          <div>
            <span className="lbl">{t("headingSize")}</span>
            <Slider value={d.headingSize} min={10} max={18} step={0.5} suffix="pt" onChange={(v) => set({ headingSize: v })} />
          </div>
          <div>
            <span className="lbl">{t("lineHeight")}</span>
            <Slider value={d.lineHeight} min={1.1} max={1.9} step={0.05} onChange={(v) => set({ lineHeight: v })} />
          </div>
        </div>
      </div>

      {/* layout */}
      <div>
        <h3 className="h-title mb-2">{t("designGeneral")}</h3>
        <div className="space-y-2">
          <div>
            <span className="lbl">{t("margins")}</span>
            <Slider value={d.margin} min={8} max={25} suffix="mm" onChange={(v) => set({ margin: v })} />
          </div>
          <div>
            <span className="lbl">{t("sectionSpacing")}</span>
            <Slider value={d.sectionSpacing} min={8} max={40} suffix="px" onChange={(v) => set({ sectionSpacing: v })} />
          </div>
          <div>
            <span className="lbl">{t("pageSize")}</span>
            <Select
              value={d.page}
              onChange={(v) => set({ page: v })}
              options={[
                { value: "a4", label: "A4" },
                { value: "letter", label: "Letter" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* header & footer */}
      <div>
        <h3 className="h-title mb-2">{t("designHeaderFooter")}</h3>
        <div className="space-y-2">
          <div>
            <span className="lbl">{t("headerStyle")}</span>
            <Select
              value={d.headerStyle}
              onChange={(v) => set({ headerStyle: v })}
              options={[
                { value: "minimal", label: t("headerMinimal") },
                { value: "banner", label: t("headerBanner") },
                { value: "centered", label: t("headerCentered") },
                { value: "split", label: t("headerSplit") },
                { value: "sidebar", label: t("headerSidebar") },
              ]}
            />
          </div>
          <div>
            <span className="lbl">{t("footerStyle")}</span>
            <Select
              value={d.footer}
              onChange={(v) => set({ footer: v })}
              options={[
                { value: "none", label: t("footerNone") },
                { value: "page-number", label: t("footerPageNo") },
                { value: "name-page", label: t("footerNamePage") },
              ]}
            />
          </div>
          <Toggle label={t("showPhoto")} checked={d.showPhoto} onChange={(v) => set({ showPhoto: v })} />
          <Toggle label={t("showIcons")} checked={d.icons} onChange={(v) => set({ icons: v })} />
        </div>
      </div>

      {/* advanced */}
      <div>
        <h3 className="h-title mb-2">{t("designAdvanced")}</h3>
        <div className="space-y-2">
          <div>
            <span className="lbl">{t("separator")}</span>
            <Select
              value={d.separator}
              onChange={(v) => set({ separator: v })}
              options={[
                { value: "line", label: t("lineSeparator") },
                { value: "underline", label: t("underlineSeparator") },
                { value: "none", label: t("noneSeparator") },
              ]}
            />
          </div>
          <div>
            <span className="lbl">{t("dateFormat")}</span>
            <Select
              value={d.dateFormat}
              onChange={(v) => set({ dateFormat: v })}
              options={[
                { value: "gregorian", label: t("gregorian") },
                { value: "jalali", label: t("jalali") },
                { value: "short", label: t("short") },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
