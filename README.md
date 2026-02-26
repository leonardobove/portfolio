# Leonardo Bove — Academic Portfolio

A minimalist, scientific academic portfolio built with **Hugo** and deployed via **GitHub Pages**.

**Design philosophy:** LaTeX typography · Terminal aesthetics · Quantum computing lab feel.

---

## Stack Choice Rationale

| Criterion | Hugo | Astro | Next.js |
|-----------|------|-------|---------|
| Build speed | ⚡ Fastest | Fast | Moderate |
| Runtime JS | None required | Optional | Needed |
| Markdown native | ✅ | ✅ | Plugins |
| GitHub Pages | Trivial | Build step | Export step |
| Maintenance | Edit `.toml` / `.html` | Edit `.astro` | Edit `.tsx` |
| Complexity | Low | Medium | High |

Hugo wins for a research portfolio: zero dependencies, sub-second builds, and Markdown-first content management.

---

## Project Structure

```
portfolio/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploy to GitHub Pages
├── content/
│   └── _index.md               # Homepage content (meta only)
├── layouts/
│   ├── _default/
│   │   └── baseof.html         # Base HTML shell
│   ├── partials/
│   │   ├── nav.html            # Navigation bar
│   │   ├── hero.html           # Hero / landing section
│   │   ├── about.html          # Research statement
│   │   ├── research.html       # Project cards
│   │   ├── publications.html   # Citations & BibTeX
│   │   ├── cv.html             # Timeline CV
│   │   ├── contact.html        # Contact form & links
│   │   └── footer.html         # Footer
│   └── index.html              # Homepage layout
├── static/
│   ├── css/
│   │   └── main.css            # Full design system
│   ├── js/
│   │   └── main.js             # Constellation, terminal, filter, etc.
│   ├── files/
│   │   └── cv_bove_leonardo.pdf   # ← Place your CV PDF here
│   └── favicon.svg             # Quantum-inspired SVG favicon
├── .gitignore
├── hugo.toml                   # Site configuration
└── README.md
```

---

## Quick Start (Local)

### Prerequisites

Install Hugo (extended version):

```bash
# macOS
brew install hugo

# Linux
sudo snap install hugo

# Windows (via Chocolatey)
choco install hugo-extended

# Verify
hugo version   # Should show 0.120+ extended
```

### Run locally

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
hugo server -D
# → Open http://localhost:1313
```

---

## Deployment to GitHub Pages

### Method A: GitHub Actions (Recommended — fully automatic)

1. **Create a new repository** on GitHub (e.g., `leonardobove.github.io` or `portfolio`)

2. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repo → Settings → Pages
   - Under "Source", select **GitHub Actions**
   - The workflow in `.github/workflows/deploy.yml` handles everything

4. **Update `baseURL`** in `hugo.toml`:
   ```toml
   # For username.github.io repo:
   baseURL = "https://YOUR_USERNAME.github.io/"
   
   # For a project repo (e.g., /portfolio):
   baseURL = "https://YOUR_USERNAME.github.io/portfolio/"
   ```

Every push to `main` triggers an automatic build and deploy. ✅

### Method B: Manual deploy (no CI)

```bash
hugo --minify
cd public
git init
git add .
git commit -m "Deploy"
git push -f https://github.com/YOUR_USERNAME/YOUR_REPO.git main:gh-pages
```

---

## Customization Guide

### 1. Personal Information

Edit `hugo.toml`:

```toml
[params]
  name = "Your Name"
  title = "Your Title"
  institution = "Your Institution"
  tagline = "Area 1 · Area 2 · Area 3"
  mission = "Your one-line mission statement."
  email = "your@email.com"
  github = "yourusername"
  linkedin = "yourlinkedinslug"
  location = "City, Country"
  cv_pdf = "/files/your_cv.pdf"
  currently_working_on = "What you're currently doing"
```

### 2. CV / Resume PDF

Place your PDF in:
```
static/files/cv_bove_leonardo.pdf
```
Or rename it and update `cv_pdf` in `hugo.toml`.

### 3. Research Projects

Edit `layouts/partials/research.html`. Each project is an `<article>` with:

```html
<article class="paper-card" data-tags="quantum fpga" aria-labelledby="proj-id">
  <div class="paper-card__meta">
    <span class="paper-card__year mono">2025</span>
    <span class="paper-card__venue mono">Institution</span>
  </div>
  <h3 class="paper-card__title" id="proj-id">Project Title</h3>
  <p class="paper-card__abstract">Abstract text...</p>
  <div class="paper-card__tags">
    <span class="tag">Python</span>
    <span class="tag">FPGA</span>
  </div>
  <div class="paper-card__links">
    <a class="paper-card__link" href="https://github.com/..." target="_blank">⌥ GitHub</a>
  </div>
</article>
```

**Available filter tags** (update `data-tags` and filter buttons to match):
- `quantum` · `fpga` · `embedded` · `rf`
- Add new ones: just add the tag in `data-tags` and a new `<button class="filter-btn" data-filter="newtag">New</button>`

### 4. Publications & Talks

Edit `layouts/partials/publications.html`. Add entries to the `<ol class="pub-list">`:

```html
<li class="pub-item">
  <div class="pub-item__num mono">[P1]</div>
  <div class="pub-item__content">
    <p class="pub-item__citation">
      <strong>L. Bove</strong>, A. Other,
      <em>"Paper Title"</em>,
      Journal Name,
      vol. X, pp. 1–10,
      <span class="pub-item__date mono">Jan. 2025</span>.
    </p>
    <div class="pub-item__meta">
      <span class="pub-item__type tag">Journal</span>
      <a class="paper-card__link" href="https://doi.org/...">DOI</a>
    </div>
  </div>
</li>
```

Update the BibTeX block similarly.

### 5. CV Timeline

Edit `layouts/partials/cv.html`. Each entry:

```html
<div class="timeline__item">
  <div class="timeline__dot"></div>
  <div class="timeline__content">
    <div class="timeline__header">
      <span class="timeline__title">Role / Degree</span>
      <span class="timeline__date mono">2024 – Present</span>
    </div>
    <div class="timeline__org">Organization Name</div>
    <div class="timeline__detail">Short description of work</div>
  </div>
</div>
```

### 6. Colors & Design Tokens

Edit CSS custom properties at the top of `static/css/main.css`:

```css
:root {
  --bg:      #0a0d14;   /* Main background */
  --accent:  #4fc3f7;   /* Primary accent (cyan) */
  --accent-2: #7986cb;  /* Secondary accent (lavender) */
  --accent-3: #26a69a;  /* Tertiary accent (teal) */
}

/* Light theme */
[data-theme="light"] {
  --bg:      #f8f6f0;
  --accent:  #0277bd;
}
```

### 7. Contact Form

The form uses [Formspree](https://formspree.io) (free tier: 50 submissions/month).

1. Sign up at formspree.io
2. Create a form → copy your form ID
3. In `layouts/partials/contact.html`, replace:
   ```html
   action="https://formspree.io/f/YOUR_FORM_ID"
   ```
   with your actual ID.

Alternatively, remove the form entirely and use direct email only.

### 8. About Section & Equations

Edit `layouts/partials/about.html`.

Math equations use [KaTeX](https://katex.org/) (fast, server-side compatible):
- Inline: `$\chi$`
- Display: `$$\hat{H} = \hbar\omega$$`

Enable/disable in `hugo.toml`:
```toml
[params]
  katex = true  # or false
```

### 9. Add a Blog

Create `content/blog/` with Markdown files:

```markdown
---
title: "My First Post"
date: 2025-01-15
tags: ["quantum", "fpga"]
---

Post content here with **Markdown** and $\LaTeX$ equations.
```

Then add a blog list layout in `layouts/blog/list.html` (ask Claude to generate it for you following the same design system).

---

## Design System Reference

| Variable | Value | Usage |
|----------|-------|-------|
| `--font-serif` | EB Garamond / Libre Baskerville | Headings, body |
| `--font-mono` | JetBrains Mono | Labels, code, terminal |
| `--accent` | `#4fc3f7` cyan | Links, highlights |
| `--accent-2` | `#7986cb` lavender | Secondary elements |
| `--accent-3` | `#26a69a` teal | Terminal prompt |
| `--bg` | `#0a0d14` near-black | Background |
| `--surface` | `#161d2e` | Cards, panels |

---

## Performance Notes

- No build-time JS framework — pure HTML output
- Fonts loaded via Google Fonts with `preconnect`
- KaTeX loaded only if `katex = true` in config
- Constellation canvas uses `requestAnimationFrame` (60fps, cancels when not visible)
- CSS transitions respect `prefers-reduced-motion`
- Lighthouse target: 95+ Performance, 100 Accessibility, 100 Best Practices, 100 SEO

---

## Maintenance Workflow

```bash
# Make changes
hugo server   # Preview at localhost:1313

# Deploy
git add .
git commit -m "Update research section"
git push origin main
# → GitHub Actions auto-deploys in ~60 seconds
```

---

## License

Content: © Leonardo Bove. All rights reserved.  
Code structure: MIT License — feel free to adapt for your own portfolio.
