// Renders public/og.png, the link-preview card. Run with: node scripts/og.mjs
// Text uses macOS system faces (Avenir Next Condensed, Georgia) because librsvg can't load web fonts;
// the PNG is committed, so CI never needs to run this. The right side is a frame of the HARP replay.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const W = 1200;
const H = 630;
const cell = 40;
const shot = { x: 600, y: 150, w: 560, h: 315 };

const grid = [];
for (let x = 0; x <= W; x += cell) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" />`);
for (let y = 0; y <= H; y += cell) grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" />`);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#eef2ef"/>
  <g stroke="#d3ded9" stroke-width="1">${grid.join('')}</g>
  <rect x="${shot.x - 3}" y="${shot.y - 3}" width="${shot.w + 6}" height="${shot.h + 6}" rx="6" fill="#1c2b4b"/>
  <text x="70" y="112" font-family="Avenir Next Condensed" font-weight="600" font-size="30" fill="#c0283a">Harvey's Hub</text>
  <text x="66" y="250" font-family="Avenir Next Condensed" font-weight="700" font-size="104" letter-spacing="-2" fill="#1c2b4b">Harvey</text>
  <text x="66" y="350" font-family="Avenir Next Condensed" font-weight="700" font-size="104" letter-spacing="-2" fill="#1c2b4b">Phan</text>
  <text font-family="Georgia" font-size="30" fill="#1c2b4b">
    <tspan x="70" y="420">Crowd navigation for</tspan>
    <tspan x="70" y="460">humanoid robots.</tspan>
  </text>
  <text x="70" y="545" font-family="Avenir Next Condensed" font-weight="500" font-size="25" fill="#3f4957">Stanford CS. HARP Software Engineer Lead.</text>
  <text x="${shot.x}" y="${shot.y + shot.h + 40}" font-family="Avenir Next Condensed" font-weight="500" font-size="22" fill="#3f4957">Recorded MuJoCo run: G1 through seven pedestrians, zero contacts</text>
</svg>`;

const poster = fileURLToPath(new URL('../src/assets/harp/replay-poster.jpg', import.meta.url));
const frame = await sharp(poster).resize(shot.w, shot.h, { fit: 'cover' }).toBuffer();
const out = fileURLToPath(new URL('../public/og.png', import.meta.url));
await sharp(Buffer.from(svg))
  .composite([{ input: frame, left: shot.x, top: shot.y }])
  .png({ compressionLevel: 9 })
  .toFile(out);
console.log(`wrote ${out}`);
