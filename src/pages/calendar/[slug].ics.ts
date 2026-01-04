import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import type { APIContext } from "astro";

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
    params: { slug: meetup.slug },
    props: { meetup }
  }));
}

export async function GET({
  props,
  site
}: APIContext<{ meetup: CollectionEntry<"meetups"> }>) {
  const { meetup } = props;
  const start = buildStartDate(meetup.data.date, meetup.data.time);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const descriptionParts = [meetup.data.why, meetup.data.quote].filter(Boolean);
  const description = descriptionParts.join("\n\n");
  const rsvpUrl = meetup.data.rsvpUrl ?? `/meetups/${meetup.slug}/`;
  const resolvedUrl =
    site && rsvpUrl.startsWith("/") ? new URL(rsvpUrl, site).toString() : rsvpUrl;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI Meetup Collective//EN",
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
