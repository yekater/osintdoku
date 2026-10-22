import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { pages, render } from "../.ssr/entry-server.js";
const template = await readFile("dist/index.html", "utf8");
const siteOrigin = process.env.SITE_URL
  ? new URL(process.env.SITE_URL).origin
  : null;
const escape = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
for (const page of pages) {
  const directory = join("dist", page.path);
  await mkdir(directory, { recursive: true });
  let html = template.replace(
    '<div id="root"></div>',
    `<div id="root" data-prerender-path="${escape(page.path)}">${render(page.path)}</div>`,
  );
  html = html
    .replace(/<title>.*?<\/title>/, `<title>${escape(page.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escape(page.description)}"/>`,
    );
  html = html.replace(
    "</head>",
    `${siteOrigin ? `<link rel="canonical" href="${escape(siteOrigin + page.path)}"/><meta property="og:url" content="${escape(siteOrigin + page.path)}"/>` : ""}<meta property="og:title" content="${escape(page.title)}"/><meta property="og:description" content="${escape(page.description)}"/><meta property="og:type" content="website"/><meta property="og:image" content="${escape(siteOrigin ? siteOrigin + page.image : page.image)}"/></head>`,
  );
  await writeFile(join(directory, "index.html"), html);
  if (page.path !== "/")
    await writeFile(join("dist", `${page.path}.html`), html);
}
if (siteOrigin) {
  await writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages
      .filter((page) => page.path !== "/mis-expedientes")
      .map((page) => `<url><loc>${escape(siteOrigin + page.path)}</loc></url>`)
      .join("")}</urlset>`,
  );
  await writeFile(
    "dist/robots.txt",
    `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`,
  );
}
await writeFile("dist/404.html", template);
await rm(".ssr", { recursive: true, force: true });
console.log(
  `Prerenderizadas ${pages.length} rutas con contenido editorial y metadatos.`,
);
