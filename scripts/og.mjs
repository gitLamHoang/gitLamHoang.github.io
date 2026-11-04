// Renders the link-preview cards public/og/<slug>.png for each project, plus the app icons. Run
// with: node scripts/og.mjs. The site's own card, public/og.png, is not drawn here: it is the live
// poster itself, captured at 1440x900 (2x) and cropped to 1200x630, so it is replaced by hand.
// Text uses the macOS system face Helvetica Neue (close to the site's Switzer) because librsvg can't
// load web fonts; the PNGs are committed, so CI never needs to run this.
import sharp from 'sharp';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const W = 1200;
const H = 630;
const shot = { x: 600, y: 150, w: 560, h: 315 };

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Greedy word wrap by character count; good enough for a condensed display face. */
function wrap(text, max, lines) {
  const out = [];
  let cur = '';
  for (const word of text.split(/\s+/)) {
    if ((cur + ' ' + word).trim().length > max && cur) {
      out.push(cur);
      cur = word;
    } else cur = (cur + ' ' + word).trim();
  }
  if (cur) out.push(cur);
  if (out.length > lines) {
    out.length = lines;
    out[lines - 1] = out[lines - 1].replace(/[\s,.;:]*$/, '') + '…';
  }
  return out;
}

const groundSvg = () => `<rect width="${W}" height="${H}" fill="#0d0f12"/>`;

async function card({ kicker, titleLines, titleSize, sub, caption, image, out, fit = 'cover' }) {
  const lineH = Math.round(titleSize * 1.02);
  const titleY = 140 + titleSize;
  const title = titleLines
    .map((l, i) => `<tspan x="66" y="${titleY + i * lineH}">${esc(l)}</tspan>`)
    .join('');
  const subY = titleY + (titleLines.length - 1) * lineH + 62;
  const subLines = wrap(sub, 38, 4)
    .map((l, i) => `<tspan x="70" y="${subY + i * 34}">${esc(l)}</tspan>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    ${groundSvg()}
    <rect x="${shot.x}" y="${shot.y}" width="${shot.w}" height="${shot.h}" fill="#15181d"/>
    <text x="70" y="108" font-family="Helvetica Neue" font-weight="500" font-size="26" fill="#9aa1aa">${esc(kicker)}</text>
    <text font-family="Helvetica Neue" font-weight="700" font-size="${titleSize}" letter-spacing="-2" fill="#f4f5f6">${title}</text>
    <text font-family="Helvetica Neue" font-size="24" fill="#d9dcdf">${subLines}</text>
    <text x="70" y="580" font-family="Helvetica Neue" font-weight="500" font-size="22" fill="#9aa1aa">Harvey's Hub  /  gitlamhoang.github.io</text>
    <text x="${shot.x}" y="${shot.y + shot.h + 40}" font-family="Helvetica Neue" font-weight="500" font-size="21" fill="#9aa1aa">${esc(caption)}</text>
  </svg>`;
  const pad = fit === 'contain' ? 14 : 0;
  const frame = await sharp(image)
    .resize(shot.w - 2 * pad, shot.h - 2 * pad, { fit, position: 'top', background: '#ffffff' })
    .flatten({ background: '#ffffff' })
    .toBuffer();
  await sharp(Buffer.from(svg))
    .composite([{ input: frame, left: shot.x + pad, top: shot.y + pad }])
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log('wrote', path.relative(root, out));
}

/** Minimal frontmatter reader for the few scalar fields the cards need. */
function field(md, name) {
  const m = md.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^'(.*)'$/, '$1') : '';
}

const poster = path.join(root, 'src/assets/harp/film-end.jpg');

// Project cards
await mkdir(path.join(root, 'public/og'), { recursive: true });
const dir = path.join(root, 'src/content/work');
for (const file of (await readdir(dir)).filter((f) => f.endsWith('.md'))) {
  const md = await readFile(path.join(dir, file), 'utf8');
  const slug = file.replace(/\.md$/, '');
  const fig = md.match(/^figure:\n\s+src:\s*(.+)$/m);
  const fit = /^\s+fit:\s*contain/m.test(md) ? 'contain' : 'cover';
  const image = fig ? path.resolve(dir, fig[1].trim()) : poster;
  const lines = wrap(field(md, 'title'), 22, 3);
  await card({
    kicker: field(md, 'org'),
    titleLines: lines,
    // Helvetica Neue Bold runs about 0.52 em per character; keep the title clear of the screenshot.
    titleSize: Math.min(
      lines.length > 2 ? 62 : 70,
      Math.floor((shot.x - 86) / (0.52 * Math.max(...lines.map((l) => l.length)))),
    ),
    sub: field(md, 'result'),
    caption: fig ? 'From the project' : 'Recorded MuJoCo run, replayed',
    image,
    fit,
    out: path.join(root, `public/og/${slug}.png`),
  });
}

// App icons from the favicon: the H, full bleed on the night navy (phones round the corners).
const favicon = await readFile(path.join(root, 'public/favicon.svg'));
for (const [size, name] of [
  [180, 'apple-touch-icon.png'],
  [512, 'icon-512.png'],
]) {
  await sharp(favicon, { density: (72 * size) / 32 })
    .resize(size)
    .flatten({ background: '#0b1430' })
    .png()
    .toFile(path.join(root, 'public', name));
  console.log('wrote', `public/${name}`);
}
