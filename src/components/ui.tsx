"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Form primitives
// ============================================================

export const TextInput = ({
  value,
  onChange,
  placeholder,
  type = "text",
  dir,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  dir?: "rtl" | "ltr" | "auto";
  className?: string;
}) => (
  <input
    type={type}
    className={cn("inp", className)}
    value={value}
    dir={dir}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
  />
);

export const TextArea = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  dir,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  dir?: "rtl" | "ltr" | "auto";
}) => (
  <textarea
    className="inp"
    rows={rows}
    dir={dir}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
  />
);

export const Select = <T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) => (
  <select
    className="inp"
    value={value}
    onChange={(e) => onChange(e.target.value as T)}
  >
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

export const Labeled = ({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("field", className)}>
    <label className="lbl">{label}</label>
    {children}
  </div>
);

export const Toggle = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) => (
  <label className="flex items-center gap-2 cursor-pointer select-none py-1">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors border",
        checked ? "bg-[var(--accent)] border-transparent" : "bg-zinc-200 border-zinc-300",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all",
          checked ? "left-[18px]" : "left-0.5",
        )}
        style={{ insetInlineStart: checked ? "18px" : "2px" }}
      />
    </button>
    <span className="text-sm">{label}</span>
  </label>
);

export const Slider = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) => (
  <div className="flex items-center gap-3">
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      className="flex-1 accent-[var(--accent)]"
    />
    <span className="text-xs text-[var(--text-2)] min-w-12 text-end">
      {value}{suffix}
    </span>
  </div>
);

// ============================================================
// Modal
// ============================================================

export const Modal = ({
  open,
  onClose,
  title,
  children,
  width = 460,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-h-[85vh] overflow-auto"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <h3 className="font-semibold text-sm">{title}</h3>
          <button className="iconbtn" onClick={onClose} aria-label="close">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// ============================================================
// Confirm dialog (promise-based)
// ============================================================

let confirmHandler: ((ok: boolean) => void) | null = null;

export const confirmDialog = (message: string): Promise<boolean> =>
  new Promise((resolve) => {
    confirmHandler = resolve;
    window.dispatchEvent(new CustomEvent("app-confirm", { detail: message }));
  });

export const ConfirmHost = () => {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    const h = (e: Event) => setMsg((e as CustomEvent<string>).detail);
    window.addEventListener("app-confirm", h);
    return () => window.removeEventListener("app-confirm", h);
  }, []);
  const answer = (ok: boolean) => {
    setMsg(null);
    confirmHandler?.(ok);
    confirmHandler = null;
  };
  return (
    <Modal open={!!msg} onClose={() => answer(false)} title="">
      <p className="text-sm mb-4">{msg}</p>
      <div className="flex gap-2 justify-end">
        <button className="btn btn-secondary" onClick={() => answer(false)}>✕</button>
        <button className="btn btn-primary" onClick={() => answer(true)}>✓</button>
      </div>
    </Modal>
  );
};


// ============================================================
// Color picker (native input + palette swatches)
// ============================================================

export const ColorField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <span className="lbl">{label}</span>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-9 h-9 rounded-lg border border-[var(--border)] cursor-pointer p-1 bg-white"
      />
      <input
        className="inp font-mono text-xs"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir="ltr"
      />
    </div>
  </div>
);

// ============================================================
// Small icons (inline SVG, stroke-based, professional)
// ============================================================

const I = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={d} />
  </svg>
);

export const Icon = {
  grip: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="9" cy="5" r="1.6" /><circle cx="15" cy="5" r="1.6" />
      <circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="19" r="1.6" /><circle cx="15" cy="19" r="1.6" />
    </svg>
  ),
  plus: () => <I d="M12 5v14M5 12h14" />,
  trash: () => <I d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />,
  eye: () => <I d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z M12 9a3 3 0 100 6 3 3 0 000-6z" />,
  eyeOff: () => <I d="M17.94 17.94A10.5 10.5 0 0112 19c-7 0-11-7-11-7a19 19 0 015.06-5.94M1 1l22 22M9.9 9.9a3 3 0 004.2 4.2" />,
  up: () => <I d="M18 15l-6-6-6 6" />,
  down: () => <I d="M6 9l6 6 6-6" />,
  pdf: () => <I d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6" />,
  zip: () => <I d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />,
  json: () => <I d="M8 3H7a2 2 0 00-2 2v4a2 2 0 01-2 2 2 2 0 012 2v4a2 2 0 002 2h1M16 3h1a2 2 0 012 2v4a2 2 0 002 2 2 2 0 00-2 2v4a2 2 0 01-2 2h-1" />,
  copy: () => <I d="M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />,
  pencil: () => <I d="M17 3a2.8 2.8 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  settings: () => <I d="M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.01a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.01a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />,
  home: () => <I d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM9 22V12h6v10" />,
  lang: () => <I d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />,
  file: () => <I d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />,
  palette: () => <I d="M12 22a10 10 0 110-20c5.5 0 10 4 10 9a5 5 0 01-10 0 2.5 2.5 0 00-5 0 10 10 0 005 11z" />,
  save: () => <I d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8" />,
  photo: () => <I d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21" />,
  ats: () => <I d="M9 12l2 2 4-4M12 22a10 10 0 100-20 10 10 0 000 20z" />,
  wand: () => <I d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M12.2 6.2L11 5M3 21l9-9M12.2 11.8L11 13" />,
  chevL: () => <I d="M15 18l-6-6 6-6" />,
  chevR: () => <I d="M9 18l6-6-6-6" />,
  layers: () => <I d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  user: () => <I d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />,
};
