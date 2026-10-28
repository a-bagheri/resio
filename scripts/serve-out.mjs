// Minimal static server that mimics GitHub Pages: serves the static export
// (./.next-export) under a /<base> prefix, with directory-index resolution.
// Run: node scripts/serve-out.mjs [base=/resio] [port=3460]
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, extname, normalize } from "node:path";

const base = (process.argv[2] || "/resio").replace(/\/+$/, "");
const port = +(process.argv[3] || 3460);
const ROOT = ".next-export";
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".txt": "text/plain",
};

createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (base && !p.startsWith(base + "/") && p !== base) {
    res.writeHead(404).end("not under base path " + base);
    return;
  }
  p = base ? p.slice(base.length) || "/" : p;
  const rel = normalize(p).replace(/^([/\\])+/, "");
  const tryFiles = [join(ROOT, rel), join(ROOT, rel, "index.html")];
  for (const f of tryFiles) {
    try {
      const data = await readFile(f);
      res.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
      res.end(data);
      return;
    } catch {
      /* try next */
    }
  }
  res.writeHead(404).end("404 — not found");
}).listen(port, () => console.log(`serving ./out at http://localhost:${port}${base}/`));
