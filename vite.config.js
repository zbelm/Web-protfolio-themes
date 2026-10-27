import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, statSync } from 'node:fs';
import { SITE } from './src/config/site.js';

// Size of public/resume.pdf, injected so the UI can show "PDF · 142 KB".
// 0 means the file is missing and every Resume button is hidden.
const resumePath = new URL('./public/resume.pdf', import.meta.url);
const resumeBytes = existsSync(resumePath) ? statSync(resumePath).size : 0;

// Portrait: the first of these files that exists in /public is used automatically.
const PHOTO_FILES = ['images/me.webp', 'images/me.avif', 'images/me.jpg', 'images/me.jpeg', 'images/me.png'];
const photoFile = PHOTO_FILES.find((f) => existsSync(new URL(`./public/${f}`, import.meta.url)));

function siteMeta() {
  return {
    name: 'site-meta',
    transformIndexHtml(html) {
      return html
        .replaceAll('%SITE_URL%', SITE.url)
        .replaceAll('%SITE_TITLE%', SITE.title)
        .replaceAll('%SITE_DESCRIPTION%', SITE.description)
        .replaceAll('%SITE_OG_IMAGE%', SITE.ogImage)
        .replaceAll('%SITE_THEME_COLOR%', SITE.themeColor);
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE.url}/</loc><changefreq>monthly</changefreq></url>\n</urlset>\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), siteMeta()],
  define: {
    __RESUME_BYTES__: JSON.stringify(resumeBytes),
    __PHOTO__: JSON.stringify(photoFile ? `/${photoFile}` : ''),
  },
  build: {
    target: 'es2022',
    cssTarget: 'chrome111',
    chunkSizeWarningLimit: 700,
  },
});
