// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://gitlamhoang.github.io',
  // Keep HTML-aware whitespace (one space between inline elements) instead of v7's JSX rules,
  // so prose with inline links reads correctly without {" "} everywhere.
  compressHTML: true,
  // Inline all CSS: one less round trip before first paint on slow phones.
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap()],
});
