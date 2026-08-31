# Invoala SEO — Launch Pack

Read this in order. Everything technical is already fixed and deployed; the
rest needs ~20 minutes of your hands-on time (mostly one-time account setup).

---

## STEP 1 — Get indexed (DO THIS FIRST, ~10 min)

Google and Bing cannot rank what they have not crawled. Your domain is 4 days
old and currently has **zero** indexed pages.

1. Google Search Console → https://search.google.com/search-console
   - Add property → "URL prefix" → `https://www.invoala.com`
   - Verify (HTML file or DNS — DNS is easiest, your registrar/DNS panel)
   - Sitemaps → submit `https://www.invoala.com/sitemap.xml`
2. Bing Webmaster Tools → https://www.bing.com/webmasters (import from GSC if
   offered) → submit the same sitemap.
3. Back in GSC: URL Inspection → paste these URLs one by one and click
   "Request indexing":
   - https://www.invoala.com/
   - https://www.invoala.com/invoice-generator
   - https://www.invoala.com/tools (and /tools/invoice-due-date-calculator)
   - https://www.invoala.com/templates
   - https://www.invoala.com/learn
   - https://www.invoala.com/how-to-create-invoice
4. Optional but recommended: `curl http://www.google.com/ping?sitemap=https://www.invoala.com/sitemap.xml` and `curl http://www.bing.com/ping?sitemap=https://www.invoala.com/sitemap.xml` (also works with https in browsers).

Note: `/free-invoice-generator` no longer exists — it 301s to `/invoice-generator`
(one URL per keyword, no more split signals).

---

## STEP 2 — Backlinks (the #1 lever for a new domain)

Ranking is 90% authority (backlinks) for a query this competitive. Target
order:

### A. Product Hunt launch (same-day, ~30 min)
Create/claim the product page and launch. Use the copy below in `listings.md`.
Launching on a US-morning weekday helps. Product Hunt backlinks are nofollow,
but the traffic spike and brand searches signal relevance to Google.

### B. Directories (self-serve, ~1-2 hours total)
Each entry is a real backlink. Prioritized:
1. AlternativeTo (https://alternativeto.net) — add invoala.com as an
   alternative to Wave, FreshBooks, Zoho Invoice.
2. FreeToolsList / FreeToolList / Tool Finder / Future Tools / There's An App
   For That / SaaSworthy / Startups.fyi / Uneed / Crafter / Toolfolio.
3. Freelancer resource roundups (contact page = email) — see outreach.md.
4. Google Business Profile (even as an online-only business) → links + local
   trust.

### C. Content that earns links (weeks 2-8)
Your existing pages can earn links if people see them:
- Share `/tools/invoice-due-date-calculator` and `/tools/late-payment-calculator`
  in freelancer threads and communities (r/freelance, r/smallbusiness,
  r/Entrepreneur, IndieHackers, Dev.to "tools I use" posts).
- Pitch the `/research/invoice-payment-report` to finance/accounting
  newsletters — original data is the easiest link magnet.

---

## STEP 3 — Realistic expectations

- "free invoice generator" is one of the most competitive queries in the
  space (Canva, Zoho, Wave, Wise + a 10-year-old exact-match domain).
- Realistic trajectory: indexed in ~1-2 weeks → long-tail tool/template pages
  ranking in 1-3 months → head term meaningful movement in 3-6+ months,
  faster with links + content velocity.
- The "no sign-up, free, no watermark" differentiator + working generator is
  a genuine advantage — it converts the traffic the SEO brings. Don't change
  the product side.

Files in this folder:
- `listings.md` — Product Hunt + AlternativeTo + directory copy, ready to paste
- `outreach.md` — backlink outreach + HARO templates + target list
- `content.md` — 90-day content/on-page plan
