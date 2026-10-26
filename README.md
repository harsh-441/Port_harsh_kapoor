# Harsh Kapoor — From code to charts

A statically pre-rendered, single-page portfolio for a full-stack developer moving into data analytics. Built with React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, GSAP/ScrollTrigger, Lenis, and `react-helmet-async`.

## Run locally

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run dev` and open the local URL printed by Vite.
4. Run `npm run build` to create the production site in `dist/`; `npm run preview` serves that build.
5. Run `npm run lint` to check the TypeScript and React source.

The production build server-renders the home page and each project detail route. It also creates `404.html`, `sitemap.xml`, `robots.txt`, and the 1200 × 630 social preview image. Vercel can deploy the `dist` output as a static Vite site.

## Where to edit content

Portfolio content is kept in typed files under `src/data/`:

| Change                                                                          | File                         |
| ------------------------------------------------------------------------------- | ---------------------------- |
| Name, summary, phone, email, social profile URLs, intro statistics              | `src/data/profile.ts`        |
| Site title, description, canonical URL, SEO keywords, resume path, social links | `src/data/site.ts`           |
| Project cards, filters, dialogs, detail pages, JSON-LD, and sitemap entries     | `src/data/projects.ts`       |
| Analytics case studies and the learning roadmap                                 | `src/data/dataProjects.ts`   |
| Internship timeline                                                             | `src/data/experience.ts`     |
| Skills and the self-assessed familiarity indicators                             | `src/data/skills.ts`         |
| Education                                                                       | `src/data/education.ts`      |
| Certifications                                                                  | `src/data/certifications.ts` |
| Section headings, interface labels, and supporting copy                         | `src/data/content.ts`        |

Add a web project by adding one object to `projects.ts`. Add an analytics case study by adding one object to `dataProjects.ts`; include a descriptive `screenshotAlt` when providing a screenshot. Both types automatically get a static detail page, structured data, and sitemap entry.

Add certificates to the array in `src/data/certifications.ts`. Each entry supports an optional `year`, `imageUrl`, `documentUrl`, and `verifyUrl`. Put certificate images or PDFs in `public/certificates/` and use site paths such as `/certificates/react-certificate.png` or `/certificates/react-certificate.pdf`. The supplied certificate images are included there, and the showcase displays document/verification links when provided.

## Portrait and motion

- Add the real portrait at `public/images/harsh.jpg`. The production build creates optimized WebP and JPEG copies plus a tiny blurred placeholder in `dist/images/`; the hero uses the WebP first and the About portrait is lazy-loaded.
- If no portrait is present, the build logs a warning and renders the designed `HK` monogram fallback.
- `src/config/motion.ts` is the single place to tune animation intensity, durations, distances, breakpoints, and feature switches. Set `intensity` to `"balanced"` for gentler timings or switch individual effects off in `enabled`.
- Motion respects reduced-motion settings; the cursor, photo orbit, project tilt, pinned carousel, and particle loops are gated on desktop/fine pointers. Visibility-based loops pause when offscreen or when the browser tab is hidden.

## Personal setup before launch

- Set the real production origin in `src/data/site.ts` (`url`); it powers canonical tags, social cards, project URLs, and the sitemap.
- Add your actual resume as `public/Harsh_Kapoor_Resume.pdf` before using the resume download and preview links.
- To enable the contact form, create a Formspree form, copy `.env.example` to `.env.local`, and set `VITE_FORMSPREE_ENDPOINT` to its endpoint. Without it, the page clearly offers direct email instead.
- Follow `SEO-CHECKLIST.md` after deploying.

## Stack and implementation notes

- React 18, Vite, TypeScript, Tailwind CSS 4
- Framer Motion for component and typography motion; GSAP + ScrollTrigger for the scroll-pinned code-to-chart transition
- Lenis for optional smooth scrolling; all scroll and motion effects respect reduced-motion preferences
- `react-helmet-async` for metadata and JSON-LD
- A small Node build script uses the server-rendered data to write route HTML, sitemap/robots files, and a Sharp-generated Open Graph PNG
- The skills chart visualizes the number of listed skills in each group; it does not imply self-assessed proficiency levels
- Resume download buttons dispatch a `portfolio:resume-download` browser event that can be connected to an analytics provider later
- No CMS, backend, or analytics provider is included

The site uses an ink-and-paper “From code to charts” concept with a restrained signal-orange accent and serif, sans-serif, and monospace type pairing. Lighthouse scores have not been measured in this environment; run Lighthouse against the deployed production build before publishing a score.
