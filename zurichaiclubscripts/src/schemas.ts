import { z } from "zod";

const sponsorSchema = z.object({
  name: z.string().min(1),
  logoText: z.string().optional(),
  logoUrl: z.string().optional()
});

const speakerSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  photoUrl: z.string().min(1)
});

const baseEventSchema = z.object({
  meetupTitle: z.string().default("Zurich AI Meetup"),
  meetupUrl: z.string().default("ZURICHAI.CLUB"),
  eventDateLabel: z.string().min(1),
  eventTimeLabel: z.string().min(1),
  sponsors: z.array(sponsorSchema).default([])
});

export const singleSpeakerSchema = baseEventSchema.extend({
  ctaLabel: z.string().default("RSVP AT"),
  speaker: speakerSchema.extend({
    talkTitle: z.string().min(1)
  })
});

export const allSpeakersSchema = baseEventSchema.extend({
  eventHeadline: z.string().min(1),
  eventSubheadline: z.string().min(1),
  speakers: z.array(speakerSchema).min(2).max(4)
});

export const announcementSchema = baseEventSchema.extend({
  edition: z.string().min(1),
  eventHeadline: z.string().min(1),
  eventSubheadline: z.string().min(1),
  ctaNote: z.string().default("RSVP details coming soon")
});

export type SingleSpeakerData = z.infer<typeof singleSpeakerSchema>;
export type AllSpeakersData = z.infer<typeof allSpeakersSchema>;
export type AnnouncementData = z.infer<typeof announcementSchema>;
