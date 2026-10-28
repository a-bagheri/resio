import type { NextConfig } from "next";

// ------------------------------------------------------------------
// GitHub Pages: run `npm run build:static` with
//   STATIC_EXPORT=1
//   NEXT_PUBLIC_BASE_PATH=/<repo-name>   (empty for <user>.github.io)
// The export builds into its own distDir (.next-export) so it can never
// collide with a concurrently running dev server's .next directory.
// ------------------------------------------------------------------
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "") || "";

const nextConfig: NextConfig = {
  devIndicators: false,
  trailingSlash: true,
  images: { unoptimized: true },
  ...(isStatic
    ? {
        output: "export" as const,
        distDir: ".next-export",
        basePath: basePath || undefined,
      }
    : {}),
};

export default nextConfig;
