import { z } from "zod";

const sponsorSchema = z.object({
  name: z.string().min(1),
  logoText: z.string().optional(),
  logoUrl: z.string().optional()
});

const speakerSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  photoUrl: z.string().min(1),
  talkTitle: z.string().min(1).optional()
});

const qrSlideSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1).optional(),
  url: z.string().min(1),
  caption: z.string().min(1).optional(),
  logoUrl: z.string().min(1).optional(),
  qrImageUrl: z.string().min(1).optional(),
  placement: z.enum(["beforeSpeakers", "end"]).optional()
});

const founderSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  email: z.string().min(1),
  photoUrl: z.string().min(1),
  contactUrl: z.string().min(1).optional(),
  qrImageUrl: z.string().min(1).optional()
});

const aboutMeetupSchema = z.object({
  title: z.string().min(1).default("About the meetup"),
  details: z.array(z.string().min(1)).default(["Started October 2024", "Community driven"]),
  foundersTitle: z.string().min(1).default("About us"),
  founders: z.array(founderSchema).default([])
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
  eventLocationLabel: z.string().min(1).optional(),
  speakers: z.array(speakerSchema).min(2).max(4)
});

export const announcementSchema = baseEventSchema.extend({
  edition: z.string().min(1),
  eventHeadline: z.string().min(1),
  eventSubheadline: z.string().min(1),
  ctaNote: z.string().default("RSVP details coming soon")
});

export const welcomeDeckSchema = z.object({
  meetupTitle: z.string().default("Zurich AI Meetup"),
  meetupUrl: z.string().default("ZURICHAI.CLUB"),
  eventTitle: z.string().min(1),
  eventSubtitle: z.string().min(1).optional(),
  eventDateLabel: z.string().min(1).optional(),
  eventTimeLabel: z.string().min(1).optional(),
  eventLocationLabel: z.string().min(1).optional(),
  backgroundImageUrl: z.string().min(1).optional(),
  logoUrl: z.string().min(1).optional(),
  showLogoOnWelcome: z.boolean().default(true),
  sponsorCatalogPath: z.string().min(1).optional(),
  sponsorUrls: z.array(z.string().min(1)).default([]),
  sponsorCatalog: z.record(sponsorSchema).default({}),
  aboutMeetup: aboutMeetupSchema.optional(),
  qrSlides: z.array(qrSlideSchema).default([]),
  speakers: z.array(speakerSchema).min(1)
});

export type SingleSpeakerData = z.infer<typeof singleSpeakerSchema>;
export type AllSpeakersData = z.infer<typeof allSpeakersSchema>;
export type AnnouncementData = z.infer<typeof announcementSchema>;
export type WelcomeDeckData = z.infer<typeof welcomeDeckSchema>;
