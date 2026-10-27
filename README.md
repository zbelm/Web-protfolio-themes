# zachary.dev

Portfolio of **Zachary Belmonte**, an IT student (web, app and game developer) open to internships (OJT).

It has three switchable themes, each with a light and a dark mode:

| Theme | Feel | Section order |
| --- | --- | --- |
| **Professional** (default) | Calm modern UI, one indigo accent, glass hero card | Hero → About → Projects → Experience → Certifications → Skills → Contact |
| **Minecraft** | The game's UI: title screen with a 3D voxel panorama and splash text, bottom hotbar with hearts + XP, gray GUI windows, Select World list, 9-slot inventory with item tooltips, advancements, chat | Title screen → Player → Select World → Statistics → Inventory → Advancements → Chat |
| **Roblox** | Portfolio layout with Roblox-style imagery: 3D blocky avatar on a spawn pad, gray baseplate background, generated obby-scene project thumbnails, round trophy badges, studs | Spawn point → Player card → Projects (Now playing) → Leaderboard → Badge shelf → Quest board → Contact |

Both game themes use **original art** in the style of those games: pixel textures and Roblox-style thumbnails/badges are generated in code (`src/themes/minecraft/textures.js`, `src/themes/roblox/art.js`), avatars and scenes are built from plain shapes, and fonts are open-license look-alikes (Pixelify Sans, Montserrat). No official logos, texture files, fonts or characters are used. "Minecraft" and "Roblox" are trademarks of their owners, used here only as theme names.

**Stack:** Vite + React, CSS variables, GSAP + ScrollTrigger, Three.js (lazy, optional), Howler.js (optional sound), Web3Forms (contact form, no server needed).

---

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. Useful URLs:

- `/?theme=minecraft` or `/?theme=roblox` opens a specific theme.
- Sample entries (marked `"_sample": true` in the data files) show **only in dev**, so you can see the layouts. They are hidden on the live site.

Other scripts:

```bash
npm run build      # production build into dist/
npm run preview    # serve dist/ locally
npm run images     # convert PNG/JPG in public/images to compressed WebP
node scripts/generate-meta-images.mjs   # regenerate og.png + apple-touch-icon.png
```

---

## Deploy to Vercel

### 1. Push to GitHub

This is a fresh build that **replaces** what's currently in the repo:

```bash
git init
git add .
git commit -m "Rebuild portfolio: theme engine with Professional, Minecraft and Roblox themes"
git branch -M main
git remote add origin https://github.com/zbelm/Web-protfolio-themes.git
git push -u origin main --force
```

`--force` overwrites the old history on `main`. If you'd rather keep the old code, push it to a backup branch first (`git push origin <old-commit>:refs/heads/archive-old-site`) or drop `--force` and merge instead.

### 2. Import into Vercel

1. Go to https://vercel.com/new and import `zbelm/Web-protfolio-themes`.
2. Vercel detects Vite automatically: build command `npm run build`, output directory `dist`. No `vercel.json` is needed.
3. Click **Deploy**.

### 3. Add the contact form key

1. Get a free access key at https://web3forms.com. It's emailed to you; no account needed.
2. In Vercel open **Project → Settings → Environment Variables** and add `VITE_FORM_KEY` = your key, for Production and Preview.
3. **Redeploy** (Deployments → ⋯ → Redeploy). Vite reads env vars at build time, so a rebuild is required.

For local testing, copy `.env.example` to `.env` and paste the key there. `.env` is git-ignored.

Without a key, the live site hides the form and shows only the Email / LinkedIn / GitHub buttons. In `npm run dev` the form simulates a successful send.

### 4. After that

- **Every push to `main`** redeploys production automatically.
- **Every other branch or pull request** gets its own preview URL, which is handy for trying a change before merging.
- Once your domain is final, update `SITE_URL` in `src/config/site.js`. Canonical, Open Graph, `sitemap.xml` and `robots.txt` all use it. Then run `node scripts/generate-meta-images.mjs` if you changed your name or status.

---

## Editing content

All content lives in `src/data/`. Every theme reads the same files, so you edit once.

**Placeholder rule:** any value wrapped in `[BRACKETS]` (like `"[EMAIL]"`) is treated as unfilled and is **never shown**. The button, field or entry just hides. Replace it with the real value and it appears.

| File | What it holds |
| --- | --- |
| `profile.json` | Name, roles, pitch, status + `extraStatuses` (e.g. "Open for commissions"), location, school/course, photo, links (GitHub, LinkedIn, email), achievement goal |
| `about.json` | Headline, story paragraphs, availability, interests, quick facts (counted automatically) |
| `projects.json` | Projects (`category`: `web` / `app` / `game`, one `featured: true` for your Roblox game) |
| `certifications.json` | Certificates |
| `skills.json` | Skill groups with honest levels 1–5 |
| `timeline.json` | Experience & education (`type`: `education` / `training` / `competition` / `project`) |

### Add a project

Add one object to `items` in `src/data/projects.json`:

```json
{
  "id": "my-app",
  "title": "My App",
  "category": "app",
  "year": "2026",
  "summary": "One line shown on the card.",
  "description": "Longer text shown in the detail popup.",
  "role": "What you did",
  "tech": ["Flutter", "Firebase"],
  "thumbnail": "/images/projects/my-app.webp",
  "screenshots": ["/images/projects/my-app-1.webp", "/images/projects/my-app-2.webp"],
  "liveUrl": "https://…",
  "sourceUrl": "https://github.com/zbelm/…"
}
```

Empty `liveUrl` or `sourceUrl` hides that button. Without a `thumbnail` you get a clean generated cover.

### Add a certification

Add one object to `src/data/certifications.json`:

```json
{
  "name": "Course name",
  "issuer": "Google",
  "date": "2026-05",
  "credentialId": "ABC123",
  "verifyUrl": "https://…",
  "badgeImage": "/images/badges/google-course.webp",
  "skills": ["Skill A", "Skill B"]
}
```

- Cards show badge, name, issuer, date and **Verify**. Skills and credential ID appear in the detail popup.
- **Badge image:** if `badgeImage` is empty, the badge shows the issuing company's logo automatically (Anthropic, Google, Meta, Coursera, freeCodeCamp, Udemy, Cisco, GitHub, Unity, Roblox, HackerRank, edX, Codecademy, Kaggle and more, via [Simple Icons](https://simpleicons.org)). Issuers without a logo there (e.g. Microsoft, AWS, IBM, Oracle) show a colored monogram. Add or tweak issuers in `src/shared/issuers.js`. Your official badge image (from Credly, Coursera, etc.) in `badgeImage` always wins.
- Empty `verifyUrl` hides the Verify button.
- The top 6 show first, with a **View all** button. Search and issuer filters appear automatically once you have more than 8.
- Remove the 5 sample entries (`"_sample": true`) when you add real ones.
- LinkedIn's API doesn't expose certifications, so this file is the source of truth. The **View my LinkedIn** button links to your profile.

### Skills and timeline

- `skills.json`: keep 3–5 groups, levels 1–5 (Beginner → Advanced).
- `timeline.json`: newest first. An empty `end` shows "Present" (and "Active" on the Roblox groups list).

### Images

1. Put PNG/JPG files in `public/images/` (e.g. `public/images/projects/`).
2. Run `npm run images` to create compressed `.webp` copies (max 1600px wide).
3. Reference the `.webp` paths in the data files (paths start with `/images/...`).
4. **Your photo:** save it as `public/images/me.jpg` (or `me.webp`, `me.png`, `me.avif`). It's picked up automatically at build time and shown as a portrait in the Professional hero, in the Minecraft player screen and as the Roblox player avatar. A portrait about 4:5 (e.g. 800×1000) works best; run `npm run images` to convert a JPG/PNG to WebP. In `npm run dev` an empty frame reminds you where it goes; the live site never shows an empty frame. You can also point `"photo"` in `profile.json` at another file.

### Resume

Put your PDF at `public/resume.pdf`. The Resume buttons (nav, hero, mobile menu) appear automatically with a size label like "PDF · 142 KB". Without the file, they stay hidden.

---

## Theme configuration

```
src/
  config/site.js          SITE_URL + form endpoint
  data/                   all content (see above)
  core/                   theme engine: state, registry, scroll keeping, motion, sound
  shared/                 theme-agnostic components (nav, modals, form, loaders, 3D host)
  styles/tokens.css       colors/radii for every theme × mode
  themes/
    professional/         index.js (config), sections.jsx, theme.css, motion.js
    minecraft/            + extras.jsx (sky, HUD, XP orbs, advancement toasts), textures.js, panorama3d.js
    roblox/               + art.js (thumbnails, badges), extras.jsx (baseplate, confetti), avatar3d.js
```

Each theme's `index.js` exports its config:

```js
export default {
  id: 'roblox',
  order: ['hero', 'about', 'projects', 'skills', 'certifications', 'experience', 'contact'],
  sections,            // { hero: Hero, about: About, ... } layout components for this theme
  Background, Effects, // optional decorative layer / behaviors
  fonts: ['700 1em "Montserrat Variable"'],  // waited on before the theme shows
  onResumeDownload,    // optional (Roblox: confetti)
};
```

- **Change section order:** edit `order` in the theme's `index.js`. The nav follows it, with at most 5 links.
- **Change colors:** edit the theme's block in `src/styles/tokens.css`. Each theme has one accent color and both light and dark values. Check contrast (4.5:1 for text) if you change them.
- **Change the default theme:** reorder `THEMES` in `src/core/registry.js` and update the fallback in the inline script in `index.html`.

### How loading works

- **Professional** is in the main bundle, so the first load is fast.
- **Minecraft and Roblox** are separate chunks (JS, CSS and fonts). They preload when the theme picker is opened or hovered.
- **Switching** fades out briefly. A themed loader appears only if the new theme takes longer than 300 ms.
- **Your place on the page is kept** when you switch (same section, same position), even though section order differs.
- **Three.js** loads only for the Minecraft panorama / Roblox avatar, on desktop-class devices, with effects on, after the page is idle. Everyone else sees a CSS fallback.
- **Minecraft hotbar:** on desktop the nav links become the hotbar at the bottom of the screen (number keys 1–5 jump to them). On phones the slide-in menu is used instead.
- **GSAP** loads on the first scroll, key press or touch, since content is fully visible without it.
- **First visit** shows a short intro (under 1.5 s, skippable with Esc or the Skip button).

### Preferences

- **Theme and light/dark mode** are saved in localStorage. On the first visit, the mode follows the system setting.
- **Sound** is off by default. **Effects** are on by default. Both toggles are in the ⚙ settings menu.
- With **prefers-reduced-motion** or Effects off, every section shows a calm static version.
