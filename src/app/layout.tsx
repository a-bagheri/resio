import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { I18nProvider } from "@/lib/i18n";
import { ConfirmHost } from "@/components/ui";

// Self-hosted fonts, each exposed as a CSS variable and consumed by the
// font registry in src/lib/fonts.ts. next/font hashes and bundles the
// files, so they load identically in dev, a local build and GitHub Pages
// (no absolute /fonts/ URLs that would break under a base path).
const vazirmatn = localFont({
  src: [{ path: "../fonts/Vazirmatn.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-vazirmatn",
  display: "swap",
});
const estedad = localFont({
  src: [{ path: "../fonts/Estedad.ttf", weight: "100 900", style: "normal" }],
  variable: "--font-estedad",
  display: "swap",
});
const shabnam = localFont({
  src: [
    { path: "../fonts/Shabnam-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Shabnam-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-shabnam",
  display: "swap",
});
const notonaskh = localFont({
  src: [{ path: "../fonts/NotoNaskhArabic.ttf", weight: "400 700", style: "normal" }],
  variable: "--font-notonaskh",
  display: "swap",
});
const inter = localFont({
  src: [
    { path: "../fonts/Inter-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Inter-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});
const roboto = localFont({
  src: [
    { path: "../fonts/Roboto-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Roboto-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-roboto",
  display: "swap",
});
const merriweather = localFont({
  src: [
    { path: "../fonts/Merriweather-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Merriweather-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-merriweather",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "Resio",
  title: "Resio — Bilingual Resume Builder",
  description:
    "Build professional bilingual (Persian/English) resumes and CVs for technical, engineering and academic profiles. All data stays in your browser.",
};

const fontVariables = [
  vazirmatn.variable,
  estedad.variable,
  shabnam.variable,
  notonaskh.variable,
  inter.variable,
  roboto.variable,
  merriweather.variable,
].join(" ");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={fontVariables}>
      <body>
        <I18nProvider>
          {children}
          <ConfirmHost />
        </I18nProvider>
      </body>
    </html>
  );
}
