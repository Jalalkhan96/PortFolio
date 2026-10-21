# PortFolio — Jalal Khan

Personal portfolio of **Jalal Khan**, Software Engineer (BS Software Engineering, COMSATS University Abbottabad, 2022–2026), Abbottabad, Pakistan.

**Live site:** https://jalalkhan96.github.io/PortFolio/

## What it is

A dependency-free static site (plain HTML, CSS and JavaScript — no build step):

- **Hero / About / Skills / Contact** sections with the real details: education, stack, socials.
- **Featured Projects with full CRUD** — the projects grid is data-driven:
  - **Read** — rendered from a project store, with live search (name / description / stack).
  - **Create / Update / Delete** — log in (top-right) to enable **Edit Mode**, then use
    *Add Project*, the per-card *Edit* / *Delete* buttons.
  - **Persistence** — projects are stored in the browser (`localStorage`), seeded with the
    six featured projects. *Export JSON* / *Import JSON* / *Reset Defaults* included.
- **Login / Register popup** — the site's original login/register card, rebuilt: sliding
  forms, local demo accounts (passwords stored only as SHA-256 hashes), "remember me"
  sessions. Accounts live only in the visitor's own browser — this is a front-end demo,
  there is no server.
- **Theme & motion** — ABIX dark theme (near-black + signal red), Cinzel display font +
  Inter body, typing effect in the hero, scroll-reveal animations, fully responsive,
  and `prefers-reduced-motion` is respected.

## Security notes

- All stored data is rendered with `textContent` (no `innerHTML` sinks) — project titles
  and descriptions cannot inject markup.
- Project URLs are validated to `http:`/`https:` only, and external links use
  `rel="noopener"`.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and content |
| `style.css` | Theme, layout, animations |
| `script.js` | Project CRUD store, auth, popup, typing + reveal effects |
| `pexels-pixabay-531880.jpg` | About-section photo |
| `Deployment Link` | The live GitHub Pages URL |

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```
