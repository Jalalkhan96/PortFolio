# PortFolio — Jalal Khan

Personal portfolio of **Jalal Khan**, Software Engineer (BS Software Engineering, COMSATS University Abbottabad, 2022–2026), Abbottabad, Pakistan.

**Live site:** https://jalal-portfolio-jalals-projects-d0ca9121.vercel.app
(GitHub Pages mirror: https://jalalkhan96.github.io/PortFolio/)

## What it is

A dependency-free static site (plain HTML, CSS and JavaScript — no build step):

- **Hero / About / Skills / Contact** sections with the real details: education, stack, socials.
- **Featured Projects with full CRUD** — the projects grid is data-driven:
  - **Read** — rendered from a project store, with live search (name / description / stack).
  - **Create / Update / Delete** — log in (top-right) to enable **Edit Mode**, then use
    *Add Project*, the per-card *Edit* / *Delete* buttons.
  - **Persistence** — projects are stored in the browser (`localStorage`), seeded with the
    six featured projects. *Export JSON* / *Import JSON* / *Reset Defaults* included.
- **Login / Register popup** — sliding forms, local demo accounts (passwords stored only
  as SHA-256 hashes), "remember me" sessions. Accounts live only in the visitor's own
  browser — this is a front-end demo, there is no server.

## Premium design (v3, 2026-10-24)

Redesigned using patterns from the **Design Resources 28** kit, adapted to the ABIX
ABIX theme (near-black + signal red, Sora display / Space Grotesk / Inter):

- **Floating glass pill navbar** with active-section highlighting (Navbar Gallery pattern)
- **Aurora hero** — animated gradient name, drifting light orbs, grid backdrop (Aceternity / Text Effects)
- **Gradient CTA buttons** with shimmer sweep (Colorion Gradient Buttons)
- **Bento skills grid**, tech marquee and animated stat counters (Magic UI patterns)
- **Spotlight project cards** that glow under the cursor, liquid-glass modals (Glass / Microkit)
- **Scroll progress bar**, parallax orbs and back-to-top (Scrolltide)
- Fully responsive; `prefers-reduced-motion` is respected throughout.

**v3.1 auth redesign (2026-10-24):** the login/register popup was rebuilt — aurora
backdrop with glowing orbs, gradient-border glass card with a spring entrance,
JK monogram header, glass input boxes with floating labels and left icons,
show/hide password toggles, an error shake, a rotating close button, and a
smoother login ↔ register slide.

## Security notes

- All stored data is rendered with `textContent` (no `innerHTML` sinks) — project titles
  and descriptions cannot inject markup.
- Project URLs are validated to `http:`/`https:` only, and external links use
  `rel="noopener"`.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and content |
| `style.css` | Premium theme, layout, animations |
| `script.js` | Project CRUD store, auth, popup, typing/reveal effects, premium v3 enhancements |
| `pexels-pixabay-531880.jpg` | About-section photo |
| `Deployment Link` | The live GitHub Pages URL |

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

**v3.2 dual theme (2026-10-24):** a full theme engine — the header sun/moon
toggle switches between the **dark glass** theme and a new **white glass**
theme (frosted white cards, soft aurora, dark-anchored gradient name). The
choice is saved in `localStorage` (`jk_portfolio_theme`), applied before first
paint by `theme-init.js` (no flash), and the first visit follows the visitor's
OS dark/light preference. Display font upgraded from Cinzel to **Sora** for a
modern geometric look; all surfaces (header, cards, modals, inputs, auth
popup) are driven by CSS variables so both themes stay pixel-consistent.

## Tools Kit, Figma Design & glass additions (Nov 2026)

- `tools.js` / `tools.css` — the full **68-tool Tools Kit** (search, category
  chips, favorites, modal) ported from the ABIX single-file portfolio, styled
  entirely with this repo's own CSS variables so both themes just work.
  Includes the css.glass-style **Glassmorphism Generator**.
- New **#design** section (Figma / ZBR10, colour systems, Stitch, glass UI)
  and **#tools** section; nav and the bottom glass dock link to them.
- Hero gained the glass **Get started** button; the bottom dock uses a
  spring-eased anchored pointer (`--spring-easing` in `tools.css`).
- Bottom contrast fix: footer text now uses `--footer-muted` and the
  back-to-top button uses `--to-top-bg` / `--to-top-text` — the old light
  theme arrow measured 1.04:1 (invisible); it is now 18.25:1.
- CSP note: `script-src` allows jsDelivr (pdf-lib, Tesseract, JsBarcode,
  marked, DOMPurify, js-beautify), `connect-src` allows the tools' live APIs,
  and `style-src` allows inline styles, which the tool builders' markup needs.
