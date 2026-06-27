import type { AnnouncementData } from "../schemas";
import { escapeHtml, renderBrand, renderDocument } from "./shared";

type TemplateSize = {
  width: number;
  height: number;
};

export function renderAnnouncementTemplate(data: AnnouncementData, size: TemplateSize): string {
  const { width, height } = size;
  const sponsorCallout = renderSponsorCallout(data.sponsors);

  const body = `
    <main class="poster announcement">
      <div class="split-line" aria-hidden="true"></div>
      ${renderBrand(data.meetupTitle, data.meetupUrl)}

      <div class="edition-badge">${escapeHtml(data.edition)}</div>

      <section class="ann-copy">
        <h1>${escapeHtml(data.eventHeadline)}</h1>
        <p>${escapeHtml(data.eventSubheadline)}</p>
      </section>

      <div class="circle-graphic" aria-hidden="true">
        <div class="circle-ring circle-ring-1"></div>
        <div class="circle-ring circle-ring-2"></div>
        <div class="circle-ring circle-ring-3"></div>
        <div class="circle-ring circle-ring-4"></div>
        <div class="circle-icon">✦</div>
      </div>

      <section class="event-chip">
        <div class="event-label">Mark your calendar</div>
        <div class="event-value">${escapeHtml(data.eventDateLabel)} ${escapeHtml(data.eventTimeLabel)}</div>
      </section>

      ${sponsorCallout}

      <section class="cta-block">
        <div class="cta-note">${escapeHtml(data.ctaNote)}</div>
        <div class="cta-url">${escapeHtml(data.meetupUrl)}</div>
      </section>
    </main>
  `;

  const extraCss = `
    /* ── Base & Background ── */
    .announcement {
      background:
        linear-gradient(180deg, #E05A5A 0%, #E05A5A 58%, #F5F0E8 58%, #F5F0E8 100%);
      color: #000000;
      isolation: isolate;
    }

    /* Fine horizontal line texture on the red zone only — adds depth without muddying */
    .announcement::before {
      content: "";
      position: absolute;
      inset: 0 0 42% 0;
      z-index: 0;
      pointer-events: none;
      opacity: 0.07;
      background-image:
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 3px,
          rgba(0,0,0,0.5) 3px,
          rgba(0,0,0,0.5) 4px
        );
    }

    /* Thick outer border frame */
    .announcement::after {
      content: "";
      position: absolute;
      inset: 14px;
      border: 6px solid #000000;
      z-index: 6;
      pointer-events: none;
    }

    /* Horizontal split line */
    .announcement .split-line {
      position: absolute;
      left: 14px;
      right: 14px;
      top: 58%;
      height: 6px;
      background: #000000;
      z-index: 5;
      pointer-events: none;
    }

    /* ── Brand ── */
    .announcement .brand {
      left: 56px;
      top: 44px;
      line-height: 0.9;
      z-index: 4;
      transform: none;
    }
    .announcement .brand-title {
      font-size: 86px;
      letter-spacing: -0.04em;
      color: #111c87;
      text-transform: none;
    }
    .announcement .brand-chip {
      margin-left: 10px;
      padding: 4px 12px 6px;
      border-radius: 8px;
      background: #e61f24;
      color: #FFFFFF;
      font-size: 0.82em;
    }
    .announcement .brand-url {
      margin-top: 16px;
      color: rgba(255,255,255,0.75);
      font-size: 28px;
      letter-spacing: 0.14em;
      font-weight: 700;
    }

    /* ── Edition Badge ── */
    .announcement .edition-badge {
      position: absolute;
      left: 56px;
      top: 248px;
      z-index: 4;
      display: inline-block;
      padding: 8px 18px 10px;
      background: #111c87;
      color: #ffffff;
      border: 4px solid #000000;
      box-shadow: 5px 5px 0 #000000;
      font-family: var(--font-heading);
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      transform: rotate(-1.5deg);
    }

    /* ── Main Copy ── */
    .announcement .ann-copy {
      position: absolute;
      left: 56px;
      top: 315px;
      width: 510px;
      z-index: 4;
      color: #ffffff;
      padding-left: 22px;
    }
    /* Bold red left rail — thicker for brutalist punch */
    .announcement .ann-copy::before {
      content: "";
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 10px;
      background: #FFD600;
      box-shadow: 3px 3px 0 #000000;
    }
    .announcement .ann-copy h1 {
      margin: 0;
      font-family: var(--font-heading);
      font-size: 100px;
      line-height: 0.88;
      letter-spacing: -0.05em;
      font-weight: 800;
      text-transform: uppercase;
      /* Hard offset shadow for brutalist 3-D depth */
      text-shadow:
        5px 5px 0 #000000,
        -1px -1px 0 rgba(0,0,0,0.3);
    }
    .announcement .ann-copy p {
      margin: 20px 0 0;
      font-family: var(--font-body);
      font-size: 36px;
      line-height: 1.25;
      font-weight: 700;
      color: rgba(255,255,255,0.88);
      text-shadow: 0 2px 12px rgba(0,0,0,0.55);
    }

    /* ── Circle Graphic ── */
    .announcement .circle-graphic {
      position: absolute;
      right: 44px;
      top: 44px;
      width: 460px;
      height: 580px;
      z-index: 3;
      overflow: visible;
    }

    .announcement .circle-ring {
      position: absolute;
      border-radius: 50%;
    }

    .announcement .circle-ring-1 {
      width: 440px;
      height: 440px;
      top: 10px;
      left: 8px;
      border: 12px dashed rgba(255,255,255,0.55);
      background: transparent;
    }

    .announcement .circle-ring-2 {
      width: 340px;
      height: 340px;
      top: 60px;
      left: 52px;
      border: 7px solid rgba(255,255,255,0.85);
      background: transparent;
      box-shadow: 4px 4px 0 rgba(0,0,0,0.25);
    }

    .announcement .circle-ring-3 {
      width: 240px;
      height: 240px;
      top: 110px;
      left: 102px;
      border: 6px solid #000000;
      background: transparent;
      opacity: 0.5;
    }

    .announcement .circle-ring-4 {
      width: 160px;
      height: 160px;
      top: 150px;
      left: 142px;
      border: 7px solid #000000;
      background: #FFD600;
      box-shadow: 8px 8px 0 #000000;
    }

    .announcement .circle-icon {
      position: absolute;
      top: 158px;
      left: 150px;
      width: 144px;
      height: 144px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 106px;
      font-weight: 900;
      color: #000000;
      line-height: 1;
      z-index: 4;
      transform: rotate(-8deg);
    }

    /* ── Event Chip ── */
    .announcement .event-chip {
      position: absolute;
      left: 56px;
      top: 670px;
      width: 448px;
      z-index: 4;
      background: #FFD600;
      border: 6px solid #000000;
      padding: 12px 18px 14px;
      color: #000000;
      box-shadow: 8px 8px 0 #000000;
      transform: rotate(-0.8deg);
    }
    .announcement .event-label {
      font-family: var(--font-heading);
      font-size: 20px;
      line-height: 1;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .announcement .event-value {
      margin-top: 6px;
      font-family: var(--font-heading);
      font-size: 62px;
      line-height: 0.94;
      letter-spacing: -0.03em;
      font-weight: 800;
    }

    /* ── CTA Block ── */
    /* Sits flush at the bottom of the cream zone.
       White outline border gives it contrast against the cream background. */
    .announcement .cta-block {
      position: absolute;
      left: 56px;
      bottom: 44px;
      width: 620px;
      z-index: 5;
      border: 6px solid #000000;
      background: #e61f24;
      color: #ffffff;
      padding: 14px 22px 16px;
      box-shadow: 8px 8px 0 #000000;
    }
    .announcement .cta-note {
      font-family: var(--font-heading);
      color: rgba(255, 255, 255, 0.85);
      font-size: 24px;
      line-height: 1;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .announcement .cta-url {
      margin-top: 8px;
      font-family: var(--font-heading);
      color: #ffffff;
      font-size: 72px;
      line-height: 0.92;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      /* Hard shadow on the URL so it reads against the red */
      text-shadow: 3px 3px 0 rgba(0,0,0,0.35);
    }

    /* ── Sponsor Callout ── */
    .announcement .sponsor-callout {
      position: absolute;
      right: 56px;
      top: 658px;
      width: 340px;
      z-index: 4;
      background: #ffffff;
      border: 6px solid #000000;
      box-shadow: 10px 10px 0 #000000;
      padding: 16px 20px 18px;
      transform: rotate(1.5deg);
    }
    .announcement .sponsor-label {
      font-family: var(--font-heading);
      font-size: 34px;
      line-height: 0.95;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #e61f24;
    }
    .announcement .sponsor-divider {
      height: 4px;
      background: #000000;
      margin: 14px 0;
    }
    .announcement .sponsor-logo-frame {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 94px;
      background: #ffffff;
      color: #000000;
    }
    .announcement .sponsor-logo-frame img {
      display: block;
      width: 100%;
      max-height: 84px;
      object-fit: contain;
    }
    .announcement .sponsor-name-fallback {
      font-family: var(--font-heading);
      font-size: 46px;
      line-height: 0.95;
      font-weight: 800;
      letter-spacing: -0.03em;
      text-transform: uppercase;
      margin: 0;
    }
  `;

  return renderDocument({
    title: "Announcement Poster",
    body,
    extraCss,
    width,
    height
  });
}

function renderSponsorCallout(sponsors: AnnouncementData["sponsors"]): string {
  const sponsor = sponsors[0];

  if (!sponsor) {
    return `
      <section class="sponsor-callout">
        <div class="sponsor-label">Venue wanted</div>
        <div class="sponsor-divider"></div>
        <div class="sponsor-logo-frame">
          <p class="sponsor-name-fallback">Your space</p>
        </div>
      </section>
    `;
  }

  const mark = sponsor.logoUrl
    ? `<img src="${escapeHtml(sponsor.logoUrl)}" alt="${escapeHtml(sponsor.name)}" />`
    : `<p class="sponsor-name-fallback">${escapeHtml(sponsor.name)}</p>`;

  return `
    <section class="sponsor-callout">
      <div class="sponsor-label">Sponsored by</div>
      <div class="sponsor-divider"></div>
      <div class="sponsor-logo-frame">${mark}</div>
    </section>
  `;
}
