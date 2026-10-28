"use client";

import type { BiText } from "@/lib/types";

/** Bilingual single-line field: FA and EN side by side, stored separately. */
export const BiField = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: BiText;
  onChange: (v: BiText) => void;
  placeholder?: { fa: string; en: string };
}) => (
  <div className="field">
    <label className="lbl">{label}</label>
    <div className="grid grid-cols-2 gap-2">
      <input
        className="inp"
        value={value.fa}
        dir="rtl"
        placeholder={placeholder?.fa}
        onChange={(e) => onChange({ ...value, fa: e.target.value })}
      />
      <input
        className="inp"
        value={value.en}
        dir="ltr"
        placeholder={placeholder?.en}
        onChange={(e) => onChange({ ...value, en: e.target.value })}
      />
    </div>
  </div>
);

/** Bilingual multi-line field. */
export const BiArea = ({
  label,
  value,
  onChange,
  rows = 3,
  hint,
  placeholder,
}: {
  label: string;
  value: BiText;
  onChange: (v: BiText) => void;
  rows?: number;
  hint?: string;
  placeholder?: { fa: string; en: string };
}) => (
  <div className="field">
    <label className="lbl">{label}</label>
    <div className="grid grid-cols-2 gap-2">
      <textarea
        className="inp"
        rows={rows}
        dir="rtl"
        value={value.fa}
        placeholder={placeholder?.fa}
        onChange={(e) => onChange({ ...value, fa: e.target.value })}
      />
      <textarea
        className="inp"
        rows={rows}
        dir="ltr"
        value={value.en}
        placeholder={placeholder?.en}
        onChange={(e) => onChange({ ...value, en: e.target.value })}
      />
    </div>
    {hint && <p className="text-xs text-[var(--text-2)] mt-1">{hint}</p>}
  </div>
);

/** Bilingual bullet-list editor (newline separated items). */
export const BiList = ({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: BiText;
  onChange: (v: BiText) => void;
  rows?: number;
  placeholder?: { fa: string; en: string };
}) => {
  const count = (s: string) => s.split(/\n/).filter((x) => x.trim()).length;
  return (
    <div className="field">
      <label className="lbl">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <textarea
          className="inp"
          rows={rows}
          dir="rtl"
          value={value.fa}
          placeholder={placeholder?.fa}
          onChange={(e) => onChange({ ...value, fa: e.target.value })}
        />
        <textarea
          className="inp"
          rows={rows}
          dir="ltr"
          value={value.en}
          placeholder={placeholder?.en}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
        />
      </div>
      <p className="text-[10px] text-zinc-400 mt-0.5">
        {count(value.fa)} fa / {count(value.en)} en — one item per line
      </p>
    </div>
  );
};

/** Month date-range input with "present" checkbox. */
export const DateRangeField = ({
  start,
  end,
  present,
  onChange,
}: {
  start: string;
  end: string;
  present: boolean;
  onChange: (v: { start: string; end: string; present: boolean }) => void;
}) => (
  <div className="grid grid-cols-2 gap-2">
    <div>
      <label className="lbl">شروع / Start</label>
      <input
        type="month"
        className="inp"
        value={start}
        onChange={(e) => onChange({ start: e.target.value, end, present })}
      />
    </div>
    <div>
      <label className="lbl">پایان / End</label>
      <div className="flex items-center gap-2">
        <input
          type="month"
          className="inp"
          value={end}
          disabled={present}
          onChange={(e) => onChange({ start, end: e.target.value, present })}
        />
        <label className="text-xs whitespace-nowrap flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={present}
            onChange={(e) => onChange({ start, end, present: e.target.checked })}
          />
          تاکنون / Present
        </label>
      </div>
    </div>
  </div>
);
