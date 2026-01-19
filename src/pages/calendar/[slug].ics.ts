import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export const prerender = true;

const pad = (value: number) => String(value).padStart(2, "0");

const formatDateTime = (date: Date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
};

const escapeText = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

const buildStartDate = (date: Date, time: string) => {
  const [hourRaw, minuteRaw] = time.split(":");
  const hour = Number(hourRaw ?? 0);
  const minute = Number(minuteRaw ?? 0);
  const start = new Date(date);
  start.setHours(hour, minute, 0, 0);
  return start;
};

export async function getStaticPaths() {
  const meetups = await getCollection("meetups");
  return meetups.map((meetup) => ({
    params: { slug: meetup.slug }
  }));
}

export async function GET({ params, site }: APIContext) {
  const slug = params.slug;
  if (!slug) {
    return new Response("Not found", { status: 404 });
  }

  const meetups = await getCollection("meetups");
  const meetup = meetups.find((entry) => entry.slug === slug);
  if (!meetup) {
    return new Response("Not found", { status: 404 });
  }

  const start = buildStartDate(meetup.data.date, meetup.data.time);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const descriptionParts = [meetup.data.why, meetup.data.quote].filter(Boolean);
  const description = descriptionParts.join("\n\n");
  const rsvpUrl = meetup.data.rsvpUrl ?? `/meetups/${meetup.slug}/`;
  const baseUrl = site ? new URL(import.meta.env.BASE_URL, site) : null;
  const resolvedUrl =
    baseUrl && rsvpUrl.startsWith("/")
      ? new URL(rsvpUrl.slice(1), baseUrl).toString()
      : rsvpUrl;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Zurich AI Club//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${meetup.slug}@zurichaiclub`,
    `DTSTAMP:${formatDateTime(new Date())}`,
    `DTSTART;TZID=Europe/Zurich:${formatDateTime(start)}`,
    `DTEND;TZID=Europe/Zurich:${formatDateTime(end)}`,
    `SUMMARY:${escapeText(meetup.data.title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(meetup.data.location)}`,
    `URL:${escapeText(resolvedUrl)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  const body = lines.join("\r\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${meetup.slug}.ics\"`
    }
  });
}
