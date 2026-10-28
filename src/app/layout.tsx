import type { Metadata } from "next";
import "@/styles/globals.css";
import { I18nProvider } from "@/lib/i18n";
import { ConfirmHost } from "@/components/ui";

export const metadata: Metadata = {
  applicationName: "Resio",
  title: "Resio — Bilingual Resume Builder",
  description:
    "Build professional bilingual (Persian/English) resumes and CVs for technical, engineering and academic profiles. All data stays in your browser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
        <I18nProvider>
          {children}
          <ConfirmHost />
        </I18nProvider>
      </body>
    </html>
  );
}
