// Checks every internal link in the built site: each href/src that starts with "/" or "#" must
// resolve to a file in dist/, and each #fragment must match an id on the target page.
// Run after `npm run build`: node scripts/check-links.mjs
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const exists = async (p) => !!(await stat(p).catch(() => null));

/** Map a site path to the file GitHub Pages would serve. */
async function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const candidates = clean.endsWith('/')
    ? [path.join(dist, clean, 'index.html')]
    : [path.join(dist, clean), path.join(dist, clean, 'index.html'), path.join(dist, `${clean}.html`)];
  for (const c of candidates) if ((await exists(c)) && (await stat(c)).isFile()) return c;
  return null;
}

const ids = new Map();
async function idsOf(file) {
  if (!ids.has(file)) {
    const html = await readFile(file, 'utf8');
    ids.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return ids.get(file);
}

const pages = await walk(dist);
const problems = [];
let checked = 0;
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  const refs = [...html.matchAll(/\s(?:href|src|poster)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (!ref.startsWith('/') && !ref.startsWith('#')) continue;
    if (ref.startsWith('//')) continue;
    checked++;
    const [p, frag] = ref.split('#');
    const target = p ? await resolve(p) : page;
    if (!target) {
      problems.push(`${path.relative(dist, page)}: missing ${ref}`);
      continue;
    }
    if (frag && target.endsWith('.html') && !(await idsOf(target)).has(decodeURIComponent(frag))) {
      problems.push(`${path.relative(dist, page)}: no #${frag} in ${path.relative(dist, target)}`);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\n${problems.length} broken internal link(s) out of ${checked}.`);
  process.exit(1);
}
console.log(`All ${checked} internal links and anchors across ${pages.length} pages resolve.`);
