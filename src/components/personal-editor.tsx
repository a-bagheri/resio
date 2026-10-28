"use client";

import { useRef } from "react";
import type { Resume } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { readAsDataUrl } from "@/lib/utils";
import { TextInput, Labeled, Icon } from "./ui";
import { BiField } from "./bi-fields";

const MAX_PHOTO = 1024 * 1024; // 1 MB

export const PersonalEditor = ({ resume }: { resume: Resume }) => {
  const { t } = useI18n();
  const update = useStore((s) => s.update);
  const fileRef = useRef<HTMLInputElement>(null);
  const p = resume.personal;

  const set = (patch: Partial<typeof p>) =>
    update(resume.id, (r) => Object.assign(r.personal, patch));

  const onPhoto = async (f: File) => {
    if (f.size > MAX_PHOTO) {
      alert(t("photoHint"));
      return;
    }
    const url = await readAsDataUrl(f);
    set({ photo: url });
  };

  return (
    <div>
      <h3 className="h-title mb-3">{t("personalInfo")}</h3>

      {/* photo */}
      <div className="field flex items-center gap-3">
        {p.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.photo}
            alt=""
            className="w-16 h-16 rounded-full object-cover border border-[var(--border)]"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[var(--accent-weak)] flex items-center justify-center text-[var(--accent)]">
            <Icon.photo />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <button className="btn btn-secondary text-xs w-fit" onClick={() => fileRef.current?.click()}>
            {t("uploadPhoto")}
          </button>
          {p.photo && (
            <button className="btn btn-ghost text-xs w-fit" onClick={() => set({ photo: "" })}>
              {t("removePhoto")}
            </button>
          )}
          <span className="text-[10px] text-zinc-400">{t("photoHint")}</span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPhoto(f);
            e.target.value = "";
          }}
        />
      </div>

      <BiField
        label={t("fullName")}
        value={p.name}
        placeholder={{ fa: "مثلاً: امیرحسین باقری", en: "e.g. Amir Hossein Bagheri" }}
        onChange={(v) => set({ name: v })}
      />
      <BiField
        label={t("professionalTitle")}
        value={p.title}
        placeholder={{ fa: "مثلاً: مهندس مکانیک", en: "e.g. Mechanical Engineer" }}
        onChange={(v) => set({ title: v })}
      />
      <BiField
        label={t("location")}
        value={p.location}
        placeholder={{ fa: "تهران، ایران", en: "Tehran, Iran" }}
        onChange={(v) => set({ location: v })}
      />

      <div className="grid grid-cols-2 gap-2">
        <Labeled label={t("email")}>
          <TextInput type="email" dir="ltr" value={p.email} placeholder="name@example.com" onChange={(v) => set({ email: v })} />
        </Labeled>
        <Labeled label={t("phone")}>
          <TextInput dir="ltr" value={p.phone} placeholder="+98 912 345 6789" onChange={(v) => set({ phone: v })} />
        </Labeled>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Labeled label={t("website")}>
          <TextInput dir="ltr" value={p.website} placeholder="example.com" onChange={(v) => set({ website: v })} />
        </Labeled>
        <Labeled label={t("linkedin")}>
          <TextInput dir="ltr" value={p.linkedin} placeholder="linkedin.com/in/username" onChange={(v) => set({ linkedin: v })} />
        </Labeled>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Labeled label={t("github")}>
          <TextInput dir="ltr" value={p.github} placeholder="github.com/username" onChange={(v) => set({ github: v })} />
        </Labeled>
        <Labeled label={t("googleScholar")}>
          <TextInput dir="ltr" value={p.scholar} placeholder="scholar.google.com/…" onChange={(v) => set({ scholar: v })} />
        </Labeled>
      </div>
      <Labeled label={t("orcid")}>
        <TextInput dir="ltr" value={p.orcid} placeholder="0000-0000-0000-0000" onChange={(v) => set({ orcid: v })} />
      </Labeled>

      {/* other links */}
      <div className="field">
        <label className="lbl">{t("otherLinks")}</label>
        {p.otherLinks.map((l) => (
          <div key={l.id} className="grid grid-cols-[1fr_2fr_auto] gap-1.5 mb-1.5 items-center">
            <input
              className="inp"
              placeholder={t("linkLabel")}
              value={l.label}
              onChange={(e) =>
                update(resume.id, (r) => {
                  const x = r.personal.otherLinks.find((y) => y.id === l.id);
                  if (x) x.label = e.target.value;
                })
              }
            />
            <input
              className="inp"
              dir="ltr"
              placeholder="https://…"
              value={l.url.fa || l.url.en}
              onChange={(e) =>
                update(resume.id, (r) => {
                  const x = r.personal.otherLinks.find((y) => y.id === l.id);
                  if (x) x.url = { fa: e.target.value, en: e.target.value };
                })
              }
            />
            <button
              className="iconbtn danger"
              onClick={() =>
                update(resume.id, (r) => {
                  r.personal.otherLinks = r.personal.otherLinks.filter((y) => y.id !== l.id);
                })
              }
            >
              <Icon.trash />
            </button>
          </div>
        ))}
        <button
          className="btn btn-ghost text-xs"
          onClick={() =>
            update(resume.id, (r) => {
              r.personal.otherLinks.push({
                id: Math.random().toString(36).slice(2, 10),
                label: "",
                url: { fa: "", en: "" },
              });
            })
          }
        >
          <Icon.plus /> {t("addLink")}
        </button>
      </div>
    </div>
  );
};
