# Muse

Fan investment platform for artists — revenue shares with verification and structured pricing.

**Live site (after Pages is on):** https://lucasdasilva8.github.io/Muse/

## Site

Static marketing site for GitHub Pages:

| Page | File |
|------|------|
| Home | `index.html` |
| How it works | `how-it-works.html` |
| Artists | `for-artists.html` |
| Fans | `for-fans.html` |
| Trust | `trust.html` |
| About | `about.html` |

Styles: `assets/css/styles.css` · Scripts: `assets/js/main.js`

## Docs

| Doc | Purpose |
|-----|---------|
| [Product plan](docs/MUSE_PRODUCT_PLAN.md) | Processes, math, sitemap, stack, roadmap |
| [Pricing worksheet](docs/PRICING_WORKSHEET.md) | Blank underwriting sheet |

## Deploy to GitHub Pages

1. Push this repo to GitHub (repo name `Muse` keeps the existing URL path).
2. Repo **Settings → Pages → Build and deployment**
3. Source: **Deploy from a branch**
4. Branch: `main` / folder: `/ (root)`
5. Save — site appears at `https://<user>.github.io/Muse/`

### Local preview

```bash
cd /Users/lucasdasilva/Projects/muse
python3 -m http.server 8080
```

Open http://localhost:8080

### Waitlist email

Forms open a mailto to `muse.waitlist@example.com`. Change that address in `assets/js/main.js` to your real inbox (or swap in Formspree / Google Forms later).

## Status

Early access marketing site only. No live invest flow. Not an offer to sell securities.
