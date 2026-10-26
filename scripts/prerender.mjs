import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const root = process.cwd();
const dist = resolve(root, "dist");
const serverEntry = pathToFileURL(resolve(dist, "server", "entry-server.js")).href;
const { getBuildData, render } = await import(serverEntry);
const { site, content, profile, projects, dataProjects } = getBuildData();
const template = await readFile(resolve(dist, "index.html"), "utf8");
const sourcePhoto = resolve(root, "public", profile.photo.src.slice(1));
let portraitAvailable = false;

try {
  await access(sourcePhoto);
  portraitAvailable = true;
} catch {
  console.warn(`Portrait not found at ${sourcePhoto}; using the monogram fallback.`);
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function htmlFor(pathname) {
  const { html, head } = render(pathname, portraitAvailable);
  return template
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace('id="root"', `id="root" data-portrait-available="${portraitAvailable}"`)
    .replace("<!--app-html-->", html)
    .replace("</head>", `${head}</head>`);
}

await mkdir(resolve(dist, "images"), { recursive: true });

if (portraitAvailable) {
  const dimensions = {
    width: profile.photo.width,
    height: profile.photo.height,
    fit: "cover",
    position: "attention",
  };
  const photo = sharp(sourcePhoto).rotate().resize(dimensions);
  await photo
    .clone()
    .webp({ quality: 84, effort: 5 })
    .toFile(resolve(dist, profile.photo.webpSrc.slice(1)));
  await photo
    .clone()
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(resolve(dist, profile.photo.src.slice(1)));
  await sharp(sourcePhoto)
    .rotate()
    .resize({ width: 32, height: 40, fit: "cover", position: "attention" })
    .blur(2)
    .webp({ quality: 32 })
    .toFile(resolve(dist, profile.photo.placeholderSrc.slice(1)));
}

await writeFile(resolve(dist, "index.html"), htmlFor("/"));

const projectPages = [...projects, ...dataProjects];
for (const project of projectPages) {
  const pagePath = resolve(dist, "projects", project.slug, "index.html");
  await mkdir(resolve(dist, "projects", project.slug), { recursive: true });
  await writeFile(pagePath, htmlFor(`/projects/${project.slug}/`));
}

await writeFile(resolve(dist, "404.html"), htmlFor("/404"));

const projectUrls = projectPages
  .map((project) => {
    const url = `${site.url}/projects/${project.slug}/`;
    return `<url><loc>${escapeHtml(url)}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`;
  })
  .join("");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeHtml(site.url)}</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>${projectUrls}</urlset>`;
await writeFile(resolve(dist, "sitemap.xml"), sitemap);
await writeFile(
  resolve(dist, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`,
);

const title = escapeHtml(site.title);
const name = escapeHtml(profile.name);
const role = escapeHtml(profile.title.toUpperCase());
const headline = escapeHtml(content.hero.headline.join(" "));
const imageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#11120f"/><path d="M0 485 1200 165" stroke="#272821" stroke-width="1"/><path d="M0 510 1200 190" stroke="#272821" stroke-width="1"/><circle cx="1000" cy="310" r="225" fill="#e77d4a" fill-opacity=".08"/><circle cx="1000" cy="310" r="145" fill="none" stroke="#e77d4a" stroke-opacity=".55"/><circle cx="1000" cy="310" r="9" fill="#e77d4a"/><text x="82" y="115" fill="#e77d4a" font-family="Arial,sans-serif" font-size="20" letter-spacing="5">${role}</text><text x="76" y="330" fill="#f2f0e9" font-family="Georgia,serif" font-size="92">${name}</text><text x="82" y="413" fill="#e77d4a" font-family="Georgia,serif" font-size="58" font-style="italic">${headline}</text><text x="84" y="558" fill="#a3a49a" font-family="Arial,sans-serif" font-size="20">${title}</text><rect x="82" y="478" width="52" height="3" fill="#e77d4a"/></svg>`;
const socialBase = sharp(Buffer.from(imageSvg));
if (portraitAvailable) {
  const portrait = await sharp(sourcePhoto)
    .rotate()
    .resize(420, 630, { fit: "cover", position: "attention" })
    .modulate({ saturation: 0.72 })
    .toBuffer();
  await socialBase
    .composite([
      { input: portrait, left: 780, top: 0 },
      {
        input: Buffer.from(
          '<svg width="420" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g"><stop stop-color="#11120f" stop-opacity=".55"/><stop offset=".5" stop-color="#11120f" stop-opacity=".04"/><stop offset="1" stop-color="#11120f" stop-opacity=".2"/></linearGradient></defs><rect width="420" height="630" fill="url(#g)"/></svg>',
        ),
        left: 780,
        top: 0,
      },
    ])
    .png()
    .toFile(resolve(dist, "og-image.png"));
} else {
  await socialBase.png().toFile(resolve(dist, "og-image.png"));
}

await writeFile(
  resolve(dist, "site.webmanifest"),
  JSON.stringify(
    {
      name: site.title,
      short_name: profile.name,
      start_url: site.homePath,
      display: "standalone",
      background_color: site.themeColor,
      theme_color: site.themeColor,
      icons: [
        { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
        { src: "/favicon-32.png", sizes: "32x32", type: "image/png" },
        { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    null,
    2,
  ),
);

const favicon = await readFile(resolve(root, "public", "favicon.svg"));
await sharp(favicon).resize(32, 32).png().toFile(resolve(dist, "favicon-32.png"));
await sharp(favicon).resize(180, 180).png().toFile(resolve(dist, "apple-touch-icon.png"));

console.info(`Pre-rendered ${projectPages.length + 1} portfolio pages and generated SEO assets.`);
