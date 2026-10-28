import type { SkillLevel } from "./types";

// ============================================================
// Profession starter packs — field-specific sample content that
// personalizes the generic starter resume (summary, skills,
// experience and project) for each profession.
// ============================================================

export type BiText = { fa: string; en: string };

export interface ProfSkill {
  name: string; // skill names are usually language-neutral
  level: SkillLevel;
  years: string;
}

export interface ProfSkillCategory {
  name: BiText;
  skills: ProfSkill[];
}

export interface ProfessionPack {
  id: string;
  name: BiText;
  summary: BiText;
  skills: ProfSkillCategory[];
  experience: {
    title: BiText;
    achievements: BiText;
    technologies: string;
  };
  project?: { name: BiText; description: BiText };
  interests?: BiText;
}

export const PROFESSION_PACKS: ProfessionPack[] = [
  {
    id: "software",
    name: { fa: "نرم‌افزار", en: "Software" },
    summary: {
      fa: "توسعه‌دهنده نرم‌افزار با تجربه در طراحی و پیاده‌سازی اپلیکیشن‌های وب و سرویس‌های مقیاس‌پذیر؛ مسلط به اصول کد تمیز، تست خودکار و CI/CD. علاقه‌مند به معماری نرم‌افزار، حل مسئله و کار در تیم‌های چابک.",
      en: "Software developer experienced in designing and building web applications and scalable services; proficient in clean code, automated testing and CI/CD. Passionate about software architecture, problem-solving and agile teams.",
    },
    skills: [
      {
        name: { fa: "زبان‌های برنامه‌نویسی", en: "Programming Languages" },
        skills: [
          { name: "TypeScript", level: "advanced", years: "4" },
          { name: "Python", level: "advanced", years: "4" },
          { name: "Java", level: "intermediate", years: "3" },
        ],
      },
      {
        name: { fa: "فریم‌ورک‌های وب", en: "Web Frameworks" },
        skills: [
          { name: "React", level: "advanced", years: "3" },
          { name: "Node.js", level: "advanced", years: "3" },
          { name: "Django", level: "intermediate", years: "2" },
        ],
      },
      {
        name: { fa: "دیتابیس و دواپس", en: "Databases & DevOps" },
        skills: [
          { name: "PostgreSQL", level: "advanced", years: "4" },
          { name: "Docker", level: "intermediate", years: "3" },
          { name: "Git", level: "expert", years: "5" },
        ],
      },
    ],
    experience: {
      title: { fa: "توسعه‌دهنده نرم‌افزار", en: "Software Developer" },
      achievements: {
        fa: "کاهش ۳۰٪ زمان پاسخ API با بهینه‌سازی کوئری‌ها",
        en: "Reduced API response time by 30% through query optimization",
      },
      technologies: "TypeScript, React, Node.js, PostgreSQL, Docker",
    },
    project: {
      name: { fa: "سامانه فروشگاه آنلاین", en: "Online Store Platform" },
      description: {
        fa: "طراحی و توسعه پلتفرم فروشگاهی با پرداخت آنلاین و پنل مدیریت؛ مسئول بک‌اند و استقرار.",
        en: "Designed and built an e-commerce platform with online payments and an admin panel; owned the backend and deployment.",
      },
    },
    interests: {
      fa: "معماری نرم‌افزار، پروژه‌های متن‌باز، هوش مصنوعی",
      en: "Software architecture, open source, AI",
    },
  },
  {
    id: "electrical",
    name: { fa: "برق", en: "Electrical" },
    summary: {
      fa: "مهندس برق با تمرکز بر طراحی مدار و سیستم‌های نهفته؛ تجربه در طراحی PCB، شبیه‌سازی و تست سخت‌افزار. دقت بالا در مستندسازی و همکاری نزدیک با تیم‌های نرم‌افزار و تولید.",
      en: "Electrical engineer focused on circuit design and embedded systems; experienced in PCB design, simulation and hardware testing. Detail-oriented with strong documentation and close collaboration with software and production teams.",
    },
    skills: [
      {
        name: { fa: "طراحی و شبیه‌سازی", en: "Design & Simulation" },
        skills: [
          { name: "MATLAB / Simulink", level: "advanced", years: "4" },
          { name: "Altium Designer", level: "intermediate", years: "3" },
          { name: "Proteus", level: "intermediate", years: "3" },
        ],
      },
      {
        name: { fa: "سیستم‌های نهفته", en: "Embedded Systems" },
        skills: [
          { name: "C", level: "advanced", years: "4" },
          { name: "STM32", level: "intermediate", years: "3" },
          { name: "FreeRTOS", level: "beginner", years: "2" },
        ],
      },
      {
        name: { fa: "تست و اندازه‌گیری", en: "Test & Measurement" },
        skills: [
          { name: "Oscilloscope", level: "intermediate", years: "3" },
          { name: "LabVIEW", level: "beginner", years: "1" },
        ],
      },
    ],
    experience: {
      title: { fa: "مهندس سخت‌افزار", en: "Hardware Engineer" },
      achievements: {
        fa: "کاهش ۲۰٪ نویز برد با بازطراحی مسیرهای تغذیه",
        en: "Reduced board noise by 20% by redesigning power routing",
      },
      technologies: "Altium Designer, MATLAB, STM32, C",
    },
    project: {
      name: { fa: "برد کنترل موتور", en: "Motor Control Board" },
      description: {
        fa: "طراحی برد چهارلایه درایور موتور با میکروکنترلر STM32؛ مسئول شماتیک، مسیرکشی PCB و تست.",
        en: "Designed a 4-layer STM32 motor-driver board; owned schematic, PCB layout and testing.",
      },
    },
    interests: {
      fa: "الکترونیک قدرت، اینترنت اشیا، رباتیک",
      en: "Power electronics, IoT, robotics",
    },
  },
  {
    id: "civil",
    name: { fa: "عمران", en: "Civil" },
    summary: {
      fa: "مهندس عمران با تجربه در طراحی سازه و نظارت بر اجرای پروژه‌های ساختمانی؛ مسلط به نرم‌افزارهای تحلیل و مقررات ملی ساختمان. متعهد به ایمنی، کیفیت و تحویل به‌موقع.",
      en: "Civil engineer experienced in structural design and supervision of construction projects; proficient in analysis software and national building codes. Committed to safety, quality and on-time delivery.",
    },
    skills: [
      {
        name: { fa: "طراحی و تحلیل سازه", en: "Structural Design & Analysis" },
        skills: [
          { name: "ETABS", level: "advanced", years: "4" },
          { name: "SAFE", level: "advanced", years: "3" },
          { name: "AutoCAD", level: "advanced", years: "5" },
        ],
      },
      {
        name: { fa: "اجرا و نظارت", en: "Execution & Supervision" },
        skills: [
          { name: "کنترل پروژه", level: "intermediate", years: "3" },
          { name: "صورت‌وضعیت‌نویسی", level: "intermediate", years: "4" },
        ],
      },
      {
        name: { fa: "مقررات و آیین‌نامه‌ها", en: "Codes & Standards" },
        skills: [
          { name: "آیین‌نامه ۲۸۰۰", level: "advanced", years: "4" },
          { name: "مبحث ۶ و مبحث ۹", level: "intermediate", years: "3" },
        ],
      },
    ],
    experience: {
      title: { fa: "مهندس عمران — طراحی سازه", en: "Civil Engineer — Structural" },
      achievements: {
        fa: "بهینه‌سازی فونداسیون و کاهش ۱۵٪ هزینه مصالح",
        en: "Optimized foundation design and cut material costs by 15%",
      },
      technologies: "ETABS, SAFE, AutoCAD",
    },
    project: {
      name: { fa: "مجتمع مسکونی ۸ طبقه", en: "8-story Residential Complex" },
      description: {
        fa: "طراحی سازه بتنی هشت طبقه با دیوار برشی؛ مسئول مدل‌سازی، دیتیلینگ و هماهنگی با گروه معماری.",
        en: "Designed an 8-story RC structure with shear walls; responsible for modeling, detailing and coordination with the architecture team.",
      },
    },
    interests: {
      fa: "سازه‌های بتنی، مدیریت پروژه، ساختمان سبز",
      en: "Concrete structures, project management, green building",
    },
  },
  {
    id: "mechanical",
    name: { fa: "مکانیک", en: "Mechanical" },
    summary: {
      fa: "مهندس مکانیک با تمرکز بر طراحی محصول و شبیه‌سازی عددی؛ تجربه در تحلیل حرارتی و سازه‌ای و طراحی قطعات و مجموعه‌های مکانیکی. علاقه‌مند به بهینه‌سازی و تولید افزودنی.",
      en: "Mechanical engineer focused on product design and numerical simulation; experienced in thermal and structural analysis and design of mechanical parts and assemblies. Passionate about optimization and additive manufacturing.",
    },
    skills: [
      {
        name: { fa: "نرم‌افزارهای CAD", en: "CAD Software" },
        skills: [
          { name: "SolidWorks", level: "expert", years: "5" },
          { name: "AutoCAD", level: "advanced", years: "4" },
          { name: "CATIA", level: "intermediate", years: "3" },
        ],
      },
      {
        name: { fa: "تحلیل و شبیه‌سازی", en: "Analysis & Simulation" },
        skills: [
          { name: "ANSYS Fluent", level: "advanced", years: "4" },
          { name: "ABAQUS", level: "intermediate", years: "2" },
        ],
      },
      {
        name: { fa: "برنامه‌نویسی", en: "Programming" },
        skills: [
          { name: "Python", level: "intermediate", years: "3" },
          { name: "MATLAB", level: "intermediate", years: "3" },
        ],
      },
    ],
    experience: {
      title: { fa: "مهندس طراحی مکانیک", en: "Mechanical Design Engineer" },
      achievements: {
        fa: "کاهش ۱۲٪ وزن مبدل حرارتی با بهینه‌سازی",
        en: "Reduced heat-exchanger weight by 12% through optimization",
      },
      technologies: "SolidWorks, ANSYS Fluent, Python",
    },
    project: {
      name: { fa: "سامانه بازیابی حرارت دودکش", en: "Flue-gas Heat Recovery System" },
      description: {
        fa: "طراحی و شبیه‌سازی سامانه بازیابی حرارت دودکش برای یک واحد صنعتی؛ مسئول محاسبات حرارتی و انتخاب تجهیزات.",
        en: "Designed and simulated a flue-gas heat-recovery system for an industrial unit; owned thermal calculations and equipment selection.",
      },
    },
    interests: {
      fa: "انرژی‌های تجدیدپذیر، CFD، چاپ سه‌بعدی",
      en: "Renewable energy, CFD, 3D printing",
    },
  },
  {
    id: "medical",
    name: { fa: "پزشکی", en: "Medical" },
    summary: {
      fa: "پزشک عمومی با تجربه بالینی در بخش داخلی و اورژانس؛ مهارت در معاینه، تشخیص و ارتباط مؤثر با بیماران. علاقه‌مند به پژوهش بالینی و آموزش سلامت.",
      en: "General practitioner with clinical experience in internal medicine and emergency; skilled in examination, diagnosis and effective patient communication. Interested in clinical research and health education.",
    },
    skills: [
      {
        name: { fa: "مهارت‌های بالینی", en: "Clinical Skills" },
        skills: [
          { name: "معاینه بالینی", level: "advanced", years: "3" },
          { name: "ACLS / BLS", level: "advanced", years: "2" },
          { name: "مداخلات اورژانس", level: "intermediate", years: "2" },
        ],
      },
      {
        name: { fa: "پژوهش", en: "Research" },
        skills: [
          { name: "SPSS", level: "intermediate", years: "2" },
          { name: "EndNote", level: "intermediate", years: "2" },
        ],
      },
      {
        name: { fa: "نرم‌افزار", en: "Software" },
        skills: [
          { name: "MS Office", level: "expert", years: "5" },
          { name: "HIS بیمارستانی", level: "intermediate", years: "2" },
        ],
      },
    ],
    experience: {
      title: { fa: "پزشک عمومی", en: "General Practitioner" },
      achievements: {
        fa: "پذیرش و درمان بیش از ۲۰۰۰ بیمار در بخش اورژانس",
        en: "Treated 2,000+ patients in the emergency department",
      },
      technologies: "HIS, SPSS, EndNote",
    },
    project: {
      name: { fa: "مطالعه مروری پرونده‌ها", en: "Retrospective Chart Review" },
      description: {
        fa: "مطالعه موردمطالعه‌ای روی پرونده بیماران؛ مسئول جمع‌آوری داده و تحلیل آماری با SPSS.",
        en: "A retrospective study of patient charts; responsible for data collection and statistical analysis with SPSS.",
      },
    },
    interests: {
      fa: "پزشکی داخلی، پژوهش بالینی، آموزش سلامت",
      en: "Internal medicine, clinical research, health education",
    },
  },
  {
    id: "academic",
    name: { fa: "دانشگاهی", en: "Academic" },
    summary: {
      fa: "پژوهشگر و مدرس دانشگاهی با تمرکز بر حل مسئله‌های میان‌رشته‌ای؛ نویسنده مقالات علمی-پژوهشی و مجرب در تدریس، راهنمایی پروژه‌های دانشجویی و نگارش پیشنهاد پژوهشی.",
      en: "Academic researcher and lecturer focused on interdisciplinary problem-solving; author of peer-reviewed papers and experienced in teaching, supervising student projects and writing research proposals.",
    },
    skills: [
      {
        name: { fa: "پژوهش", en: "Research" },
        skills: [
          { name: "Research Methods", level: "advanced", years: "5" },
          { name: "Statistical Analysis", level: "advanced", years: "4" },
          { name: "LaTeX", level: "advanced", years: "5" },
        ],
      },
      {
        name: { fa: "تدریس", en: "Teaching" },
        skills: [
          { name: "طراحی درس", level: "intermediate", years: "3" },
          { name: "ارائه علمی", level: "advanced", years: "4" },
        ],
      },
      {
        name: { fa: "نرم‌افزار", en: "Software" },
        skills: [
          { name: "SPSS", level: "intermediate", years: "3" },
          { name: "Zotero", level: "advanced", years: "3" },
        ],
      },
    ],
    experience: {
      title: { fa: "مدرس و پژوهشگر دانشگاهی", en: "University Lecturer / Researcher" },
      achievements: {
        fa: "انتشار ۵ مقاله در مجلات نمایه‌شده و کسب گرنت پژوهشی",
        en: "Published 5 papers in indexed journals and secured a research grant",
      },
      technologies: "LaTeX, SPSS, Zotero",
    },
    project: {
      name: { fa: "پروژه پژوهشی پشتیبانی‌شده", en: "Funded Research Project" },
      description: {
        fa: "اجرای پروژه پژوهشی شامل طراحی آزمایش، تحلیل داده و نگارش گزارش نهایی؛ سرپرستی تیم دو نفره پژوهش.",
        en: "Ran a funded research project covering experiment design, data analysis and final reporting; led a two-person research team.",
      },
    },
    interests: {
      fa: "یادگیری ماشین، علم‌سنجی، آموزش نوین",
      en: "Machine learning, scientometrics, modern pedagogy",
    },
  },
];

/** Resolve a pack by id; returns undefined for "general" or unknown ids. */
export const getProfession = (id?: string): ProfessionPack | undefined =>
  id ? PROFESSION_PACKS.find((p) => p.id === id) : undefined;
