import { defineCollection, z } from "astro:content";

const meetups = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    time: z.string(),
    location: z.string(),
    speaker: z.string(),
    tags: z.array(z.string()).default([]),
    status: z.enum(["upcoming", "sold_out", "past"]).default("upcoming"),
    tbd: z.boolean().optional().default(false),
    why: z.string(),
    quote: z.string(),
    rsvpUrl: z.string().optional(),
    speakers: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          company: z.string(),
          photo: z.string(),
          companyUrl: z.string().optional()
        })
      )
      .default([])
  })
});

export const collections = { meetups };
