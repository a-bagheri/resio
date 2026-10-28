<div align="center">

# Resio

**A bilingual (Persian/English) resume & CV builder that runs entirely in your browser — no server, no account.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deploy](https://github.com/a-bagheri/resio/actions/workflows/deploy.yml/badge.svg)](https://github.com/a-bagheri/resio/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/License-MIT-8A2BE2)](package.json)

[Live Demo](https://a-bagheri.github.io/resio/) · [Issues](https://github.com/a-bagheri/resio/issues) · [Pull Requests](https://github.com/a-bagheri/resio/pulls)

**English** · [فارسی](README_fa.md)

</div>

## About

Resio is a resume and CV builder for technical, engineering and academic
professionals. It is 100% client-side: there is no backend, no account
system, and no data ever leaves the user's device. Every field stores
independent Persian and English values, and the final document is rendered
and exported per output language with correct RTL/LTR layout.

## Table of contents

- [Features](#features)
- [Exports](#exports)
- [Privacy & data storage](#privacy--data-storage)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Localization](#localization)
- [Quality checks](#quality-checks)
- [Contributing](#contributing)
- [License](#license)

## Features

**Bilingual by design**

- Every field stores separate `{fa, en}` values — the two languages are never mixed.
- Independent RTL/LTR rendering per output language, with a live A4 preview that switches between the two.
- Fully bilingual interface: Persian (RTL, default) and English (LTR).

**Content & sections**

- 20 built-in sections — personal info, summary, skills (with 18 engineering category presets), experience, education, projects, research, publications, conferences, certifications, awards, languages (CEFR), courses, volunteer work, memberships, teaching, patents, interests, hobbies, references — plus unlimited custom sections.
- Profession starter packs: at creation time, sample content and skill categories adapt to the selected field (software, electrical, civil, mechanical, medical, academic), so users never start from a blank page. Every editor field also carries an example placeholder.

**Templates**

- 16 templates — minimal, modern, professional, engineering, technical, academic, research, executive, compact, creative, elegant, graduate, startup, designer, classic, medical — each with an ATS-compatibility rating.

**Editing comfort**

- Drag-and-drop reordering of sections and entries; per-section show/hide.
- Autosave with a save-status indicator; multiple resumes in one dashboard.
- Gregorian or Jalali dates, Persian digits, photo and icon toggles.
- Completeness meter: a weighted checklist (missing contact info, short summary, unquantified achievements, thin skills, estimated page count) where every item links straight to its section.

## Exports

| Format | How it is produced | Notes |
| --- | --- | --- |
| **PDF** | Dedicated print route | Exact A4/Letter geometry |
| **Word** (`.docx`) | Generated client-side with [`docx`](https://github.com/dolanmiu/docx) | Proper RTL support |
| **HTML** | Single self-contained file | Opens anywhere |
| **XeLaTeX** | Ready-to-compile package | For both languages |
| **JSON** | Validated with [Zod](https://zod.dev/) | Backup, restore, device migration |

## Privacy & data storage

Everything is stored in the browser's `localStorage` on the device the app
runs on. **No data is stored on GitHub or any server**, and nothing is
transmitted anywhere.

> [!WARNING]
> On the hosted web version, clearing browser data or switching devices
> loses your data. Export a backup first (**Settings → Backup**). To move
> data between the web version and a local copy, export a backup from one
> and restore it in the other.

## Getting started

Prerequisites: [Node.js](https://nodejs.org/) 18.18 or newer and npm.

```bash
git clone https://github.com/a-bagheri/resio.git
cd resio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No configuration is
required to develop or use the app locally.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Standard production build (`.next`) |
| `npm run start` | Serve the standard build |
| `npm run build:static` | Static build for GitHub Pages (isolated `.next-export` directory) |
| `npm run lint` | Lint the codebase |
| `npm run icons` | Regenerate the app icons |

## Configuration

The app requires no environment variables. Two optional variables control
the static build used for GitHub Pages (see [`.env.example`](.env.example)):

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | empty | Deployment sub-path, e.g. `/resio` for a project site; empty for `<user>.github.io` repositories |
| `STATIC_EXPORT` | off | Set to `1` to make `next build` produce a static export in `.next-export/` |

## Deployment

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds a
static export and publishes it on every push to `main`:

1. Enable it once via **Settings → Pages → Source → GitHub Actions**.
2. That's it — the base path is detected automatically from the repository name.

To test the export locally:

```bash
export MSYS_NO_PATHCONV=1   # Git Bash on Windows only
STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/resio npm run build:static
node scripts/serve-out.mjs /resio 3460   # → http://localhost:3460/resio/
```

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| State management | [Zustand 5](https://github.com/pmndrs/zustand) |
| Import validation | [Zod 4](https://zod.dev/) |
| Word generation | [docx](https://github.com/dolanmiu/docx) |
| Export packaging | [JSZip](https://stuk.github.io/jszip/) |

## Project structure

```
src/
├── app/                    # App Router pages
│   ├── page.tsx            # dashboard: resume list, create/import
│   ├── editor/page.tsx     # section editor (?id=<resume>)
│   ├── print/page.tsx      # print-to-PDF route (?id=<resume>)
│   ├── templates/          # template gallery
│   └── settings/           # language, backup/restore, reset
├── components/             # editor panes, form primitives, document renderer
├── styles/                 # global styles and resume document styles
└── lib/                    # domain logic
    ├── types.ts            # bilingual data model and section registry
    ├── store.ts            # zustand store + localStorage persistence
    ├── factory.ts          # resume/section factories
    ├── professions.ts      # per-field starter packs
    ├── templates.ts        # template presets and palettes
    ├── i18n.tsx            # bilingual UI dictionary
    ├── export-docx.ts      # Word export (docx)
    ├── export-html.ts      # single-file HTML export
    ├── latex.ts            # XeLaTeX export
    ├── io.ts               # zod-validated JSON import/export
    └── score.ts            # completeness meter
```

## Localization

- The interface is fully bilingual: Persian (RTL, default) and English (LTR),
  switchable in the header and stored per browser.
- Resume content is authored in both languages independently and
  rendered/exported per output language.
- Dates follow the design settings — Gregorian, Jalali (Shamsi), or
  year-only — with Persian digits in Persian output.

## Quality checks

There is no automated test suite yet. Current checks:

```bash
npx tsc --noEmit        # full type-check (must pass)
npm run build:static    # production compile + static export
```

## Contributing


- Preserve the bilingual (fa/en) behavior of both the UI and the generated
  documents.
- Adding an ESLint setup (`eslint-config-next`) and a test suite for
  `src/lib` are good first contributions.

## License

Released under the MIT license as declared in [`package.json`](package.json).

---

<div align="center">

Created by **[Amir Hossein Bagheri](https://github.com/a-bagheri)** · [a-bagheri.github.io/resio](https://a-bagheri.github.io/resio/)

</div>
