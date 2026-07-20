# Muse

Fan investment platform for artists — revenue shares with verification and structured pricing.

**Live site (after Pages is on):** https://lucasdasilva8.github.io/Muse/

## Site

Static marketing + product prototype for GitHub Pages:

| Page | File |
|------|------|
| Home | `index.html` |
| How it works | `how-it-works.html` |
| Artists | `for-artists.html` |
| Fans | `for-fans.html` |
| Trust | `trust.html` |
| About | `about.html` |
| **Fan browse (prototype)** | `browse.html` |
| **Sample listing** | `listing-mira-vale.html` |
| **Invest + email** | `invest.html` |
| **Artist dashboard** | `app-artist.html` |

Sample artist **Mira Vale** uses illustrative revenue ($28k TTM, $8k raise, 15% share). Invest submits via the same mailto waitlist flow — no real payments.

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

## Product backbone (Next.js)

Working investment + listing app in [`product/`](product/):

```bash
cd product && npm install && npm run dev
```

- Artist: http://localhost:3000/artist/apply  
- Fan browse/invest: http://localhost:3000/browse  
- Docs: [docs/BACKBONE.md](docs/BACKBONE.md)

Static marketing + clickable HTML prototype remain on GitHub Pages.
