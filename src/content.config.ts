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
        role: z.string(),
        dates: z.string(),
        order: z.number(),
        claim: z.string(),
        result: z.string(),
        /** Exact substring of `result` to mark with the highlighter. Only numbers from an evaluation. */
        highlight: z.string().optional(),
        limit: z.string(),
        stack: z.array(z.string()).optional(),
        links: z.array(link).default([]),
        figure: z
          .object({ src: image(), alt: z.string(), caption: z.string(), href: z.url().optional() })
          .optional(),
        /** Show the interactive route field as the figure. */
        routeFigure: z.boolean().default(false),
        /** Where each fact came from. Not rendered. */
        sources: z.array(z.string()).min(1),
      })
      .refine((d) => !d.highlight || d.result.includes(d.highlight), {
        message: '`highlight` must be an exact substring of `result`',
      }),
});

export const collections = { work };
