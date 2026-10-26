# SEO launch checklist

- [ ] Replace the example canonical origin in `src/data/site.ts` with the deployed HTTPS domain.
- [ ] Replace LinkedIn and GitHub placeholder profile links in `src/data/profile.ts`.
- [ ] Add the actual resume PDF at `public/Harsh_Kapoor_Resume.pdf`.
- [ ] Deploy the production build to Vercel and confirm the home page, project detail routes, and custom 404 page load.
- [ ] Open `/robots.txt` and `/sitemap.xml` on the deployed site; check that the sitemap lists the real domain and all project detail pages.
- [ ] Verify ownership of the domain in Google Search Console.
- [ ] Submit the deployed `/sitemap.xml` in Search Console and inspect the home and project detail URLs.
- [ ] Add the deployed portfolio link to LinkedIn and GitHub profiles.
- [ ] Configure `VITE_FORMSPREE_ENDPOINT` in Vercel's production environment and test the contact form.
- [ ] Run Lighthouse on the deployed production site for mobile and desktop; address any accessibility, performance, best-practice, or SEO issues.
