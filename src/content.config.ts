import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const link = z.object({ label: z.string(), href: z.url() });

const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '*.md' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        summary: z.string(),
        /** Organization the work was done for or with; shown as the entry's kicker. */
        org: z.string(),
        role: z.string(),
        dates: z.string(),
        order: z.number(),
        /** The whole project's idea, not just Harvey's part. */
        overview: z.string(),
        /** Harvey's part in it. */
        contribution: z.string(),
        claim: z.string(),
        result: z.string(),
        /** Exact substring of `result` to mark with the highlighter. Only numbers from an evaluation. */
        highlight: z.string().optional(),
        limit: z.string(),
        stack: z.array(z.string()).optional(),
        /** Short technical facts shown as a spec sheet. */
        specs: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
        links: z.array(link).default([]),
        figure: z
          .object({ src: image(), alt: z.string(), caption: z.string(), href: z.url().optional() })
          .optional(),
        /** Project-specific media block on the detail page. */
        showcase: z.enum(['none', 'harp']).default('none'),
        /** Where each fact came from. Not rendered. */
        sources: z.array(z.string()).min(1),
      })
      .refine((d) => !d.highlight || d.result.includes(d.highlight), {
        message: '`highlight` must be an exact substring of `result`',
      }),
});

export const collections = { work };
