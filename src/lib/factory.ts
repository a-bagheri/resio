import type { Resume, ResumeSection, SectionKind } from "./types";
import { SECTION_META, SECTION_ORDER_DEFAULT } from "./types";
import { uid } from "./utils";
import { defaultDesign } from "./templates";
import { starterSectionData } from "./starter";
import { getProfession } from "./professions";

export const makeSection = (
  kind: SectionKind,
  starter = false,
  profession?: string,
): ResumeSection => {
  const meta = SECTION_META[kind];
  const emptyData =
    kind === "summary" ? { fa: "", en: "" } :
    kind === "skills" ? [] :
    kind === "interests" ? { fa: "", en: "" } :
    kind === "hobbies" ? { fa: "", en: "" } :
    kind === "custom" ? { title: { fa: "", en: "" }, entries: [] } :
    [];
  return {
    id: uid(),
    kind,
    title: { fa: meta.title.fa, en: meta.title.en },
    visible: true,
    locked: meta.required,
    columns: meta.defaultColumns || 1,
    data: starter ? starterSectionData(kind, getProfession(profession)) : (emptyData as never),
  };
};

export interface MakeResumeOpts {
  templateId?: string;
  starter?: boolean;
  profession?: string;
}

export const makeResume = (name: string, opts: MakeResumeOpts = {}): Resume => {
  const { templateId = "minimal", starter = false, profession } = opts;
  const sections: Record<string, ResumeSection> = {};
  const order: string[] = [];
  for (const kind of SECTION_ORDER_DEFAULT) {
    const s = makeSection(kind, starter, profession);
    sections[s.id] = s;
    order.push(s.id);
  }
  return {
    id: uid(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    outputLang: "fa",
    personal: {
      name: { fa: "", en: "" },
      title: { fa: "", en: "" },
      photo: "",
      email: "",
      phone: "",
      location: { fa: "", en: "" },
      website: "",
      linkedin: "",
      github: "",
      scholar: "",
      orcid: "",
      otherLinks: [],
    },
    sectionOrder: order,
    sections,
    design: defaultDesign(templateId),
  };
};
