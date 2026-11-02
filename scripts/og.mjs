// Renders the link-preview cards: public/og.png for the site and public/og/<slug>.png for each
// project, plus the app icons. Run with: node scripts/og.mjs
// Text uses macOS system faces (Avenir Next Condensed, Georgia) because librsvg can't load web fonts;
// the PNGs are committed, so CI never needs to run this.
import sharp from 'sharp';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const W = 1200;
const H = 630;
const cell = 40;
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

const gridSvg = () => {
  const g = [];
  for (let x = 0; x <= W; x += cell) g.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" />`);
  for (let y = 0; y <= H; y += cell) g.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" />`);
  return `<rect width="${W}" height="${H}" fill="#eef2ef"/><g stroke="#d3ded9" stroke-width="1">${g.join('')}</g>`;
};

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
    ${gridSvg()}
    <rect x="${shot.x - 3}" y="${shot.y - 3}" width="${shot.w + 6}" height="${shot.h + 6}" rx="6" fill="#1c2b4b"/>
    <rect x="${shot.x}" y="${shot.y}" width="${shot.w}" height="${shot.h}" fill="#ffffff"/>
    <line x1="70" y1="98" x2="94" y2="98" stroke="#c0283a" stroke-width="3"/>
    <text x="104" y="108" font-family="Avenir Next Condensed" font-weight="600" font-size="28" fill="#c0283a">${esc(kicker)}</text>
    <text font-family="Avenir Next Condensed" font-weight="700" font-size="${titleSize}" letter-spacing="-1" fill="#1c2b4b">${title}</text>
    <text font-family="Georgia" font-size="25" fill="#24324f">${subLines}</text>
    <text x="70" y="580" font-family="Avenir Next Condensed" font-weight="600" font-size="24" fill="#3f4957">Harvey's Hub  /  gitlamhoang.github.io</text>
    <text x="${shot.x}" y="${shot.y + shot.h + 40}" font-family="Avenir Next Condensed" font-weight="500" font-size="22" fill="#3f4957">${esc(caption)}</text>
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

const poster = path.join(root, 'src/assets/harp/replay-poster.jpg');

// Site card
await card({
  kicker: "Harvey's Hub",
  titleLines: ['Harvey Phan'],
  titleSize: 104,
  sub: 'Crowd navigation for humanoid robots. Stanford CS, HARP Software Engineer Lead.',
  caption: 'Recorded MuJoCo run: G1 through seven pedestrians, zero contacts',
  image: poster,
  out: path.join(root, 'public/og.png'),
});

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
    titleSize: lines.length > 2 ? 62 : 70,
    sub: field(md, 'result'),
    caption: fig ? 'From the project' : 'Recorded MuJoCo run, replayed',
    image,
    fit,
    out: path.join(root, `public/og/${slug}.png`),
  });
}

// App icons from the favicon
const favicon = await readFile(path.join(root, 'public/favicon.svg'));
for (const [size, name] of [
  [180, 'apple-touch-icon.png'],
  [512, 'icon-512.png'],
]) {
  await sharp(favicon, { density: (72 * size) / 32 })
    .resize(Math.round(size * 0.78))
    .extend({
      top: Math.round(size * 0.11),
      bottom: size - Math.round(size * 0.78) - Math.round(size * 0.11),
      left: Math.round(size * 0.11),
      right: size - Math.round(size * 0.78) - Math.round(size * 0.11),
      background: '#eef2ef',
    })
    .flatten({ background: '#eef2ef' })
    .png()
    .toFile(path.join(root, 'public', name));
  console.log('wrote', `public/${name}`);
}
