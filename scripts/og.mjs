// Renders public/og.png, the link-preview card. Run with: node scripts/og.mjs
// Text uses macOS system faces (Avenir Next Condensed, Georgia) because librsvg can't load web fonts;
// the PNG is committed, so CI never needs to run this.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const W = 1200;
const H = 630;
const cell = 40;

const grid = [];
for (let x = 0; x <= W; x += cell) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" />`);
for (let y = 0; y <= H; y += cell) grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" />`);

const wps = [
  [760, 200],
  [960, 470],
  [1100, 230],
];
const loop = [...wps, wps[0]].map((p) => p.join(',')).join(' ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#eef2ef"/>
  <g stroke="#d3ded9" stroke-width="1">${grid.join('')}</g>
  <polyline points="${loop}" fill="none" stroke="#1c2b4b" stroke-width="3" stroke-dasharray="12 12" opacity="0.55"/>
  <polyline points="760,200 838,306" fill="none" stroke="#1c2b4b" stroke-width="5" stroke-linecap="round"/>
  ${wps
    .map(
      ([x, y], i) => `<g transform="translate(${x} ${y})">
      <circle r="22" fill="${i === 1 ? '#f0d64a' : '#f6f8f6'}" stroke="#1c2b4b" stroke-width="4"/>
      <text y="9" text-anchor="middle" font-family="Avenir Next Condensed" font-weight="600" font-size="26" fill="#1c2b4b">${i + 1}</text>
    </g>`,
    )
    .join('')}
  <g transform="translate(846 317) rotate(53)">
    <line x1="24" y1="0" x2="44" y2="0" stroke="#c0283a" stroke-width="6" stroke-linecap="round"/>
    <circle r="24" fill="#c0283a"/>
    <path d="M -9 -9 L 17 0 L -9 9 Z" fill="#f6f8f6"/>
  </g>
  <text x="80" y="118" font-family="Avenir Next Condensed" font-weight="600" font-size="34" fill="#1c2b4b">Harvey's Hub</text>
  <text x="76" y="290" font-family="Avenir Next Condensed" font-weight="700" font-size="128" letter-spacing="-2" fill="#1c2b4b">Harvey Phan</text>
  <text font-family="Georgia" font-size="40" fill="#1c2b4b">
    <tspan x="80" y="372">Navigation software for humanoid</tspan>
    <tspan x="80" y="424">robots, and what it can't do yet.</tspan>
  </text>
  <text x="80" y="540" font-family="Avenir Next Condensed" font-weight="500" font-size="28" fill="#5a6470">Stanford CS. HARP Software Engineer Lead.</text>
</svg>`;

const out = fileURLToPath(new URL('../public/og.png', import.meta.url));
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
console.log(`wrote ${out}`);
