// Converts every .png/.jpg/.jpeg in public/images (recursively) to a compressed
// .webp next to it (max 1600px wide). Usage: npm run images
// Then point thumbnail/screenshots/badgeImage in src/data at the .webp files.
import sharp from 'sharp';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = 'public/images';
if (!existsSync(ROOT)) {
  console.log(`Nothing to do: create ${ROOT}/ and drop your PNG/JPG files in it.`);
  process.exit(0);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

let saved = 0;
for (const file of walk(ROOT)) {
  if (!['.png', '.jpg', '.jpeg'].includes(extname(file).toLowerCase())) continue;
  const out = file.replace(/\.(png|jpe?g)$/i, '.webp');
  const info = await sharp(file).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
  const before = statSync(file).size;
  saved += before - info.size;
  console.log(`${file} → ${out} (${Math.round(before / 1024)} KB → ${Math.round(info.size / 1024)} KB)`);
}
console.log(`Done. Saved ${Math.round(saved / 1024)} KB.`);
