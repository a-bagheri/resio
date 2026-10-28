// Runtime environment detection — used to show the right storage notice
// (GitHub Pages hosting vs. local clone).
export type RuntimeEnv = "hosted" | "local";

export const detectEnv = (): RuntimeEnv => {
  if (typeof window === "undefined") return "local";
  const h = window.location.hostname;
  return h.endsWith(".github.io") ? "hosted" : "local";
};
