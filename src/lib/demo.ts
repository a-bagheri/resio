import type { Resume } from "./types";
import { makeResume } from "./factory";
import { defaultDesign } from "./templates";

/**
 * A small demo resume used for template thumbnails.
 * Built from the real factory so the renderer path is identical.
 */
export const makeDemoResume = (templateId: string): Resume => {
  const r = makeResume("demo");
  r.design = defaultDesign(templateId);

  const setSection = (idx: number, value: unknown) => {
    const id = r.sectionOrder[idx];
    if (id) (r.sections[id] as { data: unknown }).data = value;
  };

  setSection(0, {
    fa: "مهندس مکانیک با تمرکز بر شبیه‌سازی عددی و طراحی محصولات. تجربه در پروژه‌های حرارتی و CAE.",
    en: "Mechanical engineer focused on numerical simulation and product design. Experienced in thermal and CAE projects.",
  });

  setSection(1, [
    {
      id: "c1",
      name: { fa: "نرم‌افزارهای CAD", en: "CAD Software" },
      skills: [
        { id: "s1", name: "SolidWorks", level: "expert", years: "5", description: { fa: "", en: "" } },
        { id: "s2", name: "CATIA", level: "advanced", years: "3", description: { fa: "", en: "" } },
      ],
    },
    {
      id: "c2",
      name: { fa: "برنامه‌نویسی", en: "Programming" },
      skills: [
        { id: "s3", name: "Python", level: "advanced", years: "4", description: { fa: "", en: "" } },
        { id: "s4", name: "C++", level: "intermediate", years: "3", description: { fa: "", en: "" } },
      ],
    },
  ]);

  setSection(2, [
    {
      id: "e1",
      title: { fa: "مهندس طراحی مکانیک", en: "Mechanical Design Engineer" },
      company: { fa: "شرکت فناوری آرمان", en: "Arman Tech Co." },
      location: { fa: "تهران", en: "Tehran" },
      employmentType: "full-time",
      start: "2021-06",
      end: "",
      present: true,
      responsibilities: {
        fa: "طراحی سامانه‌های حرارتی\nمدیریت تیم شبیه‌سازی",
        en: "Designed thermal systems\nLed simulation team",
      },
      achievements: {
        fa: "کاهش ۱۲٪ وزن مبدل حرارتی",
        en: "Reduced heat-exchanger weight by 12%",
      },
      technologies: { fa: "SolidWorks, ANSYS Fluent, Python", en: "SolidWorks, ANSYS Fluent, Python" },
      projects: { fa: "", en: "" },
    },
  ]);

  setSection(3, [
    {
      id: "d1",
      degree: { fa: "کارشناسی ارشد", en: "M.Sc." },
      field: { fa: "مهندسی مکانیک", en: "Relevant: Mechanical Engineering" },
      university: { fa: "دانشگاه صنعتی شریف", en: "Sharif University" },
      location: { fa: "تهران", en: "Tehran" },
      start: "2018-09",
      end: "2021-02",
      present: false,
      gpa: { fa: "۱۸٫۲ / ۲۰", en: "18.2 / 20" },
      thesisTitle: { fa: "بهینه‌سازی مبدل حرارتی", en: "Heat-exchanger optimization" },
      thesisDescription: { fa: "", en: "" },
      courses: { fa: "", en: "" },
      achievements: { fa: "", en: "" },
    },
  ]);

  setSection(4, [
    {
      id: "p1",
      name: { fa: "سامانه بازیابی حرارت", en: "Heat-recovery system" },
      role: { fa: "طراح ارشد", en: "Lead designer" },
      organization: { fa: "شرکت فناوری آرمان", en: "Arman Tech Co." },
      start: "2022-01",
      end: "2022-11",
      present: false,
      description: {
        fa: "طراحی و شبیه‌سازی سامانه بازیابی حرارت دودکش.",
        en: "Design and simulation of a flue-gas heat-recovery system.",
      },
      responsibilities: { fa: "", en: "" },
      achievements: { fa: "بازیابی ۱۸٪ حرارت تلف‌شده", en: "Recovered 18% of waste heat" },
      technologies: { fa: "ANSYS Fluent, EES", en: "ANSYS Fluent, EES" },
      software: { fa: "", en: "" },
      hardware: { fa: "", en: "" },
      results: { fa: "بازگشت سرمایه در ۱۴ ماه", en: "Payback in 14 months" },
      links: [],
    },
  ]);

  r.personal = {
    name: { fa: "امیرحسین باقری", en: "Amir Hossein Bagheri" },
    title: { fa: "مهندس مکانیک", en: "Mechanical Engineer" },
    photo: "",
    email: "amirhossein@example.com",
    phone: "+98 21 1234 5678",
    location: { fa: "تهران، ایران", en: "Tehran, Iran" },
    website: "",
    linkedin: "linkedin.com/in/example",
    github: "",
    scholar: "",
    orcid: "",
    otherLinks: [],
  };

  return r;
};
