# Resio

A bilingual (Persian/English) resume and CV builder for technical, engineering
and academic professionals. Resio runs entirely in the browser — there is no
backend, no account system, and no data ever leaves the user's device.

## Key features

- **Bilingual by design** — every field stores separate Persian and English
  values (`{fa, en}`), never mixed. Independent RTL/LTR rendering per output
  language, with a live A4 preview that switches between the two.
- **16 templates** (minimal, modern, professional, engineering, technical,
  academic, research, executive, compact, creative, elegant, graduate,
  startup, designer, classic, medical), each with an ATS-compatibility
  rating.
- **20 built-in sections** — personal info, summary, skills (with 18
  engineering category presets), experience, education, projects, research,
  publications, conferences, certifications, awards, languages (CEFR),
  courses, volunteer work, memberships, teaching, patents, interests,
  hobbies, references — plus unlimited custom sections.
- **Profession starter packs** — at creation time, sample content and skill
  categories adapt to the selected field (software, electrical, civil,
  mechanical, medical, academic) so users never start from a blank page.
  Every editor field also carries an example placeholder.
- **Completeness meter** — a weighted checklist in the editor (missing
  contact info, short summary, unquantified achievements, thin skills,
  estimated page count); each item links straight to its section.
- **Exports** — PDF (dedicated print route with exact A4/Letter geometry),
  Word (`.docx`, generated client-side with proper RTL support), single-file
  HTML, XeLaTeX packages for both languages, and validated JSON for backup
  and migration.
- **Editing comfort** — drag-and-drop reordering of sections and entries,
  per-section show/hide, autosave with a save-status indicator, Gregorian or
  Jalali dates, Persian digits, photo and icon toggles.

## Data and privacy

Resio stores everything in the browser's `localStorage` on the device it runs
on. **No data is stored on GitHub or any server**, and nothing is transmitted
anywhere.

On the hosted GitHub Pages version this means clearing browser data or
switching devices loses the data — export a backup (Settings → Backup) first.
On a local clone the data persists on that machine. To move data between the
web version and a local copy, export a backup from one and restore it in the
other.

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) and [React 19](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Zustand 5](https://github.com/pmndrs/zustand) for state management
- [Zod 4](https://zod.dev/) for import validation
- [docx](https://github.com/dolanmiu/docx) and
  [JSZip](https://stuk.github.io/jszip/) for client-side export generation

## Getting started

Prerequisites: [Node.js](https://nodejs.org/) 18.18 or newer and npm.

```bash
git clone https://github.com/<user>/<repo>.git
cd <repo>
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No configuration is
required to develop or use the app locally.

## Configuration

The app needs no environment variables. Two optional variables control the
static build used for GitHub Pages (see [`.env.example`](.env.example)):

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | Base path of the deployed site, e.g. `/resio` for a project site; empty for a `user.github.io` repository. |
| `STATIC_EXPORT` | Set to `1` to make `next build` produce a static export in `.next-export/`. |

## Development

```bash
npm run dev            # development server on http://localhost:3000
npx tsc --noEmit       # type-check the whole project
```

The repository ships an `.editorconfig`; use an editor plugin for consistent
formatting.

## Build and production

```bash
npm run build          # standard production build (.next)
npm run start          # serve the standard build
```

### GitHub Pages deployment

`.github/workflows/deploy.yml` builds a static export and publishes it on
every push to `main`. Enable it once via **Settings → Pages → Source → GitHub
Actions**; the workflow detects the repository name and sets the base path
automatically. To test the export locally:

```bash
export MSYS_NO_PATHCONV=1   # Git Bash on Windows only
STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/resio npm run build:static
node scripts/serve-out.mjs /resio 3460   # → http://localhost:3460/resio/
```

## Testing and code quality

There is no automated test suite yet. Current checks:

```bash
npx tsc --noEmit       # full type-check (must pass)
npm run build:static   # production compile + static export
```

Adding an ESLint setup (`eslint` + `eslint-config-next`) and a test suite for
`src/lib` would be welcome first contributions.

## Project structure

```
src/
├── app/                  # App Router pages
│   ├── page.tsx          # dashboard (resume list, create/import)
│   ├── editor/page.tsx   # section editor (?id=<resume>)
│   ├── print/page.tsx    # print-to-PDF route (?id=<resume>)
│   ├── templates/        # template gallery
│   └── settings/         # language, backup/restore, reset
├── components/           # editor panes, form primitives, document renderer
└── lib/                  # domain logic
    ├── types.ts          # bilingual data model and section registry
    ├── store.ts          # zustand store + localStorage persistence
    ├── factory.ts        # resume/section factories
    ├── starter.ts        # generic starter content
    ├── professions.ts    # per-field starter packs
    ├── templates.ts      # template presets and palettes
    ├── export-docx.ts    # Word export (docx)
    ├── export-html.ts    # single-file HTML export
    ├── latex.ts          # XeLaTeX export
    ├── io.ts             # zod-validated JSON import/export
    └── score.ts          # completeness meter
```

## Localization

The interface is fully bilingual: Persian (RTL, default) and English (LTR),
switchable in the header and stored per browser. Resume content is authored
in both languages independently and rendered/exported per output language.
Dates follow the design settings — Gregorian, Jalali (Shamsi), or year-only —
with Persian digits in Persian output. When contributing, keep Persian copy
and localization keys intact; only developer-facing documentation is
English-only.

## Contributing

Issues and pull requests are welcome. Please keep changes focused, run
`npx tsc --noEmit` and a production build before submitting, and preserve the
bilingual (fa/en) behavior of both the UI and the generated documents.

## License

Released under the ISC license as declared in
[`package.json`](package.json). A dedicated `LICENSE` file should be added
before the first public release.
