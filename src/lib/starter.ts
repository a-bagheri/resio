import type { SectionDataMap, SectionKind } from "./types";
import type { ProfessionPack } from "./professions";

// ============================================================
// Starter content — bilingual sample data pre-filled into every
// section of a new resume, so the user never faces a blank page.
// All texts are realistic but obviously replaceable.
// When a profession pack is given, summary / skills / experience /
// projects / interests are personalized for that field.
// ============================================================

const bi = (fa: string, en: string) => ({ fa, en });

const baseExperience = {
  id: "st-exp-1",
  title: bi("مهندس / کارشناس فنی", "Engineer / Technical Specialist"),
  company: bi("نام شرکت یا سازمان", "Company Name"),
  location: bi("تهران، ایران", "Tehran, Iran"),
  employmentType: "full-time",
  start: "2022-01",
  end: "",
  present: true,
  responsibilities: bi(
    "همکاری در طراحی و اجرای پروژه‌های فنی\nتهیه مستندات فنی و گزارش‌های پیشرفت\nهماهنگی با تیم‌های داخلی و پیمانکاران",
    "Contributed to the design and delivery of technical projects\nPrepared technical documentation and progress reports\nCoordinated with internal teams and contractors",
  ),
  achievements: bi(
    "کاهش ۱۵٪ زمان تحویل پروژه با بهبود فرآیند کار",
    "Cut project delivery time by 15% by improving the workflow",
  ),
  technologies: bi("Python, MATLAB, AutoCAD", "Python, MATLAB, AutoCAD"),
  projects: bi("", ""),
};

const baseProject = {
  id: "st-prj-1",
  name: bi("نام پروژه شاخص", "Featured Project"),
  role: bi("عضو تیم طراحی", "Design Team Member"),
  organization: bi("نام سازمان یا دانشگاه", "Organization / University"),
  start: "2023-01",
  end: "2023-08",
  present: false,
  description: bi(
    "طراحی و پیاده‌سازی سامانه پایش داده برای بهبود کارایی خط تولید؛ مسئول تحلیل داده و گزارش‌دهی به مدیر پروژه.",
    "Designed and implemented a data-monitoring system to improve production-line efficiency; responsible for data analysis and reporting to the project manager.",
  ),
  responsibilities: bi("", ""),
  achievements: bi("بهبود ۱۰٪ بهره‌وری خط تولید", "Improved line productivity by 10%"),
  technologies: bi("Python, SQL", "Python, SQL"),
  software: bi("", ""),
  hardware: bi("", ""),
  results: bi("", ""),
  links: [] as { id: string; label: string; url: string }[],
};

const packSkills = (pack: ProfessionPack) =>
  pack.skills.map((c, i) => ({
    id: `pk-${pack.id}-cat-${i}`,
    name: { ...c.name },
    skills: c.skills.map((s, j) => ({
      id: `pk-${pack.id}-sk-${i}-${j}`,
      name: s.name,
      level: s.level,
      years: s.years,
      description: bi("", ""),
    })),
  }));

export const starterSectionData = (
  kind: SectionKind,
  pack?: ProfessionPack,
): SectionDataMap[SectionKind] => {
  switch (kind) {
    case "summary":
      return (pack ? pack.summary : bi(
        "متخصص حوزه فنی و مهندسی با بیش از ۵ سال تجربه در طراحی، اجرا و بهبود پروژه‌ها. مسلط به ابزارهای تخصصی صنعت و توانمند در کار تیمی، مدیریت پروژه و ارتباط با ذی‌نفعان. به‌دنبال به‌کارگیری دانش فنی برای حل مسائل واقعی و خلق ارزش پایدار.",
        "Technical and engineering professional with 5+ years of experience in designing, delivering and improving projects. Proficient with industry-standard tools and skilled in teamwork, project management and stakeholder communication. Seeking to apply technical knowledge to solve real-world problems and create lasting value.",
      )) as never;

    case "skills":
      return (pack ? packSkills(pack) : [
        {
          id: "sk-cat-1",
          name: bi("نرم‌افزارها و ابزارهای فنی", "Software & Technical Tools"),
          skills: [
            { id: "sk-1", name: "Python", level: "advanced", years: "4", description: bi("", "") },
            { id: "sk-2", name: "MATLAB", level: "intermediate", years: "3", description: bi("", "") },
            { id: "sk-3", name: "AutoCAD", level: "intermediate", years: "3", description: bi("", "") },
            { id: "sk-4", name: "MS Office", level: "expert", years: "6", description: bi("", "") },
          ],
        },
        {
          id: "sk-cat-2",
          name: bi("مهارت‌های حرفه‌ای", "Professional Skills"),
          skills: [
            { id: "sk-5", name: "مدیریت پروژه", level: "advanced", years: "3", description: bi("", "") },
            { id: "sk-6", name: "کار تیمی", level: "expert", years: "5", description: bi("", "") },
          ],
        },
      ]) as never;

    case "experience":
      return [
        pack
          ? {
              ...baseExperience,
              title: { ...pack.experience.title },
              achievements: { ...pack.experience.achievements },
              technologies: bi(pack.experience.technologies, pack.experience.technologies),
            }
          : baseExperience,
      ] as never;

    case "education":
      return [
        {
          id: "st-edu-1",
          degree: bi("کارشناسی", "B.Sc."),
          field: bi("نام رشته تحصیلی", "Field of Study"),
          university: bi("نام دانشگاه", "University Name"),
          location: bi("تهران، ایران", "Tehran, Iran"),
          start: "2017-09",
          end: "2021-06",
          present: false,
          gpa: bi("۱۷٫۵ / ۲۰", "17.5 / 20"),
          thesisTitle: bi("عنوان پایان‌نامه", "Thesis Title"),
          thesisDescription: bi("", ""),
          courses: bi("روش تحقیق، مدیریت پروژه، آمار کاربردی", "Research Methods, Project Management, Applied Statistics"),
          achievements: bi("", ""),
        },
      ] as never;

    case "projects":
      return [
        pack?.project
          ? { ...baseProject, name: { ...pack.project.name }, description: { ...pack.project.description } }
          : baseProject,
      ] as never;

    case "research":
      return [
        {
          id: "st-rsh-1",
          position: bi("دستیار پژوهشی", "Research Assistant"),
          institution: bi("نام دانشگاه یا مؤسسه", "University / Institute"),
          topic: bi("موضوع پژوهش", "Research Topic"),
          start: "2020-09",
          end: "2021-06",
          present: false,
          description: bi(
            "همکاری در پروژه پژوهشی شامل طراحی آزمایش، جمع‌آوری و تحلیل داده و نگارش گزارش‌های علمی.",
            "Collaborated on a research project covering experiment design, data collection and analysis, and writing scientific reports.",
          ),
          methodology: bi("روش‌های کمّی و تحلیل آماری", "Quantitative methods and statistical analysis"),
          tools: bi("Python, SPSS", "Python, SPSS"),
          results: bi("", ""),
        },
      ] as never;

    case "publications":
      return [
        {
          id: "st-pub-1",
          title: bi("عنوان مقاله", "Paper Title"),
          authors: bi("نام خانوادگی، نام؛ نویسنده دوم", "Lastname, Firstname; Second Author"),
          venue: bi("نام مجله یا کنفرانس", "Journal / Conference Name"),
          year: "2024",
          doi: "",
          url: "",
          type: "conference",
          abstract: bi(
            "چکیده کوتاه مقاله در دو تا سه جمله.",
            "A short abstract in two to three sentences.",
          ),
        },
      ] as never;

    case "conferences":
      return [
        {
          id: "st-cnf-1",
          name: bi("نام کنفرانس", "Conference Name"),
          talk: bi("عنوان ارائه", "Presentation Title"),
          location: bi("تهران، ایران", "Tehran, Iran"),
          date: "2024-02",
          role: bi("ارائه‌دهنده", "Speaker"),
        },
      ] as never;

    case "certifications":
      return [
        {
          id: "st-crt-1",
          name: bi("نام گواهینامه", "Certification Name"),
          issuer: bi("نهاد صادرکننده", "Issuing Organization"),
          issueDate: "2023-05",
          expiryDate: "",
          credentialId: "",
          url: "",
        },
      ] as never;

    case "awards":
      return [
        {
          id: "st-awd-1",
          name: bi("نام جایزه یا افتخار", "Award Name"),
          organization: bi("نهاد اهداکننده", "Granting Organization"),
          date: "2022-10",
          description: bi(
            "شرح کوتاهی از جایزه و دلیل اعطای آن.",
            "A short description of the award and why it was granted.",
          ),
        },
      ] as never;

    case "languages":
      return [
        {
          id: "st-lng-1",
          language: bi("فارسی", "Persian"),
          reading: "native",
          writing: "native",
          speaking: "native",
          listening: "native",
          overall: "native",
        },
        {
          id: "st-lng-2",
          language: bi("انگلیسی", "English"),
          reading: "B2",
          writing: "B2",
          speaking: "B1",
          listening: "B2",
          overall: "B2",
        },
      ] as never;

    case "courses":
      return [
        {
          id: "st-crs-1",
          name: bi("نام دوره", "Course Name"),
          provider: bi("برگزارکننده", "Provider"),
          date: "2023-11",
          duration: bi("۲۴ ساعت", "24 hours"),
          description: bi("", ""),
        },
      ] as never;

    case "volunteer":
      return [
        {
          id: "st-vol-1",
          role: bi("عضو داوطلب", "Volunteer Member"),
          organization: bi("نام مؤسسه یا انجمن", "Charity / Association Name"),
          location: bi("تهران، ایران", "Tehran, Iran"),
          start: "2021-03",
          end: "2022-03",
          present: false,
          description: bi(
            "شرکت داوطلبانه در برگزاری رویدادها و فعالیت‌های اجتماعی.",
            "Volunteered in organizing events and community activities.",
          ),
        },
      ] as never;

    case "memberships":
      return [
        {
          id: "st-mbr-1",
          organization: bi("انجمن علمی یا حرفه‌ای", "Professional Society"),
          role: bi("عضو", "Member"),
          start: "2022-01",
          end: "",
          present: true,
          description: bi("", ""),
        },
      ] as never;

    case "teaching":
      return [
        {
          id: "st-tch-1",
          role: bi("دستیار آموزشی", "Teaching Assistant"),
          institution: bi("نام دانشگاه", "University Name"),
          course: bi("نام درس", "Course Name"),
          start: "2019-09",
          end: "2020-06",
          present: false,
          description: bi(
            "برگزاری جلسات رفع اشکال و تصحیح تمرین‌ها.",
            "Led problem-solving sessions and graded assignments.",
          ),
        },
      ] as never;

    case "patents":
      return [
        {
          id: "st-pat-1",
          title: bi("عنوان اختراع", "Invention Title"),
          inventors: bi("نام مخترع(ان)", "Inventor name(s)"),
          office: bi("مرجع ثبت", "Patent Office"),
          number: "",
          date: "2023-07",
          status: bi("ثبت‌شده", "Registered"),
          description: bi("", ""),
        },
      ] as never;

    case "interests":
      return (pack?.interests ?? bi(
        "یادگیری فناوری‌های نوظهور، آموزش و منتورینگ، حل مسئله در مقیاس بزرگ",
        "Emerging technologies, teaching and mentoring, large-scale problem solving",
      )) as never;

    case "hobbies":
      return bi(
        "مطالعه، کوه‌نوردی، عکاسی",
        "Reading, hiking, photography",
      ) as never;

    case "references":
      return [
        {
          id: "st-ref-1",
          name: bi("نام معرف", "Reference Name"),
          position: bi("سمت", "Position"),
          organization: bi("سازمان", "Organization"),
          contact: bi("ایمیل یا تلفن", "Email or phone"),
        },
      ] as never;

    case "custom":
      return {
        title: bi("بخش سفارشی", "Custom Section"),
        entries: [
          {
            id: "st-cus-1",
            title: bi("عنوان مورد", "Entry Title"),
            subtitle: bi("زیرعنوان", "Subtitle"),
            date: bi("۱۴۰۲", "2023"),
            body: bi("متن توضیحی این مورد.", "Body text for this entry."),
          },
        ],
      } as never;
  }
};
