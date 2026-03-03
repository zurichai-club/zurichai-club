import { sharedCss } from "../theme/tokens";

type DocumentOptions = {
  body: string;
  extraCss: string;
  title: string;
  width: number;
  height: number;
};

export function renderDocument(options: DocumentOptions): string {
  const { body, extraCss, title, width, height } = options;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Space+Grotesk:wght@700;800&display=swap" rel="stylesheet" />
    <style>
      ${sharedCss(width, height)}
      ${extraCss}
    </style>
  </head>
  <body>${body}</body>
</html>`;
}

export function renderBrand(meetupTitle: string, meetupUrl: string): string {
  const chipTitle = toBrandTitle(meetupTitle);

  return `
    <div class="brand">
      <div class="brand-title">${chipTitle}</div>
      <div class="brand-url">${escapeHtml(meetupUrl)}</div>
    </div>
  `;
}

export function renderDatePill(dateLabel: string, timeLabel: string, top: number): string {
  return `
    <div class="date-pill" style="top: ${top}px;">
      <span>${escapeHtml(dateLabel)} ${escapeHtml(timeLabel)}</span>
      <span class="date-icon">CAL</span>
    </div>
  `;
}

export function renderSponsors(
  sponsors: Array<{ name: string; logoText?: string }>,
  top: number,
  left: number
): string {
  if (sponsors.length === 0) {
    return "";
  }

  const rows = sponsors
    .map(
      (sponsor) => `
      <div class="sponsor-row">
        <span class="sponsor-mark">${escapeHtml((sponsor.logoText ?? sponsor.name).slice(0, 2).toUpperCase())}</span>
        <span>${escapeHtml(sponsor.name)}</span>
      </div>
    `
    )
    .join("");

  return `
    <div class="sponsors" style="top: ${top}px; left: ${left}px;">
      <div class="sponsors-label">Brought by:</div>
      ${rows}
    </div>
  `;
}

export function renderSpeakerCard(
  speaker: { name: string; company: string; photoUrl: string },
  style: string,
  className = ""
): string {
  return `
    <div class="speaker-card ${className}" style="${style}">
      <img src="${escapeAttribute(speaker.photoUrl)}" alt="${escapeAttribute(speaker.name)}" />
      <div class="speaker-overlay">
        <div class="speaker-name">${escapeHtml(speaker.name)}</div>
        <div class="speaker-company">${escapeHtml(speaker.company)}</div>
      </div>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function toBrandTitle(value: string): string {
  const words = value.trim().split(/\s+/);
  if (words.length >= 3 && words[1].toUpperCase() === "AI") {
    const firstWord = escapeHtml(words[0]);
    const trailing = escapeHtml(words.slice(2).join(" "));
    return `${firstWord}<span class="brand-chip">AI</span><br/>${trailing}`;
  }

  const escaped = escapeHtml(value);
  const index = escaped.toUpperCase().indexOf(" AI ");
  if (index === -1) {
    return escaped;
  }

  const before = escaped.slice(0, index + 1);
  const after = escaped.slice(index + 4);
  return `${before}<span class="brand-chip">AI</span> ${after}`;
}

export { escapeHtml };
