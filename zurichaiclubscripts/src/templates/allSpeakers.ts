import type { AllSpeakersData } from "../schemas";
import {
  escapeHtml,
  renderBrand,
  renderDocument,
  renderSpeakerCard
} from "./shared";

type TemplateSize = {
  width: number;
  height: number;
};

const CARD_POSITIONS = [
  { left: 510, top: 80, width: 300, height: 340 },
  { left: 720, top: 400, width: 310, height: 340 },
  { left: 490, top: 660, width: 310, height: 320 },
  { left: 760, top: 720, width: 240, height: 260 }
];

const CARD_ROTATIONS = ["-2deg", "1.5deg", "-1deg", "2deg"];

export function renderAllSpeakersTemplate(data: AllSpeakersData, size: TemplateSize): string {
  const { width, height } = size;
  const cards = data.speakers
    .map((speaker, idx) => {
      const position = CARD_POSITIONS[idx];
      if (!position) {
        return "";
      }

      const style = `left: ${position.left}px; top: ${position.top}px; width: ${position.width}px; height: ${position.height}px;`;
      return renderSpeakerCard(speaker, style, `floating-card card-${idx}`);
    })
    .join("");

  const body = `
    <main class="poster all-speakers">
      <div class="split-line" aria-hidden="true"></div>
      ${renderBrand(data.meetupTitle, data.meetupUrl)}

      <section class="all-copy">
        <h1>${escapeHtml(data.eventHeadline)}</h1>
        <p>${escapeHtml(data.eventSubheadline)}</p>
      </section>

      <section class="event-chip">
        <div class="event-label">Date + Time</div>
        <div class="event-value">${escapeHtml(data.eventDateLabel)} ${escapeHtml(data.eventTimeLabel)}</div>
      </section>

      ${cards}

      <section class="cta-block">
        <div class="cta-label">RSVP AT</div>
        <div class="cta-url">${escapeHtml(data.meetupUrl)}</div>
      </section>

      ${renderBrutalistSponsors(data.sponsors)}
    </main>
  `;

  const extraCss = `
    /* ── Base & Background ── */
    .all-speakers {
      background:
        linear-gradient(180deg, #E05A5A 0%, #E05A5A 58%, #F5F0E8 58%, #F5F0E8 100%);
      color: #000000;
      isolation: isolate;
    }

    /* Cross-hatch texture overlay */
    .all-speakers::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      opacity: 0.06;
      background-image:
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.15) 2px,
          rgba(0,0,0,0.15) 4px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.10) 2px,
          rgba(0,0,0,0.10) 4px
        );
    }

    /* Thick outer border frame */
    .all-speakers::after {
      content: "";
      position: absolute;
      inset: 14px;
      border: 6px solid #000000;
      z-index: 1;
      pointer-events: none;
    }

    /* Horizontal split line between color zones */
    .all-speakers .split-line {
      position: absolute;
      left: 14px;
      right: 14px;
      top: 58%;
      height: 6px;
      background: #000000;
      z-index: 1;
      pointer-events: none;
    }

    /* ── Brand ── */
    .all-speakers .brand {
      left: 56px;
      top: 44px;
      line-height: 0.9;
      z-index: 4;
      transform: none;
    }
    .all-speakers .brand-title {
      font-size: 86px;
      letter-spacing: -0.04em;
      color: #111c87;
      text-transform: none;
    }
    .all-speakers .brand-chip {
      margin-left: 10px;
      padding: 4px 12px 6px;
      border-radius: 8px;
      background: #e61f24;
      color: #ffc4c8;
      font-size: 0.82em;
    }
    .all-speakers .brand-url {
      margin-top: 16px;
      color: #FFFFFF;
      font-size: 52px;
      letter-spacing: 0.08em;
      text-shadow: 2px 2px 0 rgba(0,0,0,0.2);
    }

    /* ── Copy Section ── */
    .all-speakers .all-copy {
      position: absolute;
      left: 56px;
      top: 310px;
      width: 420px;
      z-index: 4;
      color: #ffffff;
      padding-left: 20px;
    }
    .all-speakers .all-copy::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 8px;
      background: #e61f24;
    }
    .all-speakers .all-copy h1 {
      margin: 0;
      font-family: var(--font-heading);
      font-size: 76px;
      line-height: 1.04;
      letter-spacing: -0.04em;
      font-weight: 800;
      text-transform: uppercase;
      text-shadow: 3px 3px 0 rgba(0,0,0,0.15);
    }
    .all-speakers .all-copy p {
      margin: 18px 0 0;
      font-family: var(--font-body);
      font-size: 48px;
      line-height: 1.12;
      font-weight: 700;
      color: #ffffff;
      max-height: 170px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }

    /* ── Speaker Cards — Brutalist Override ── */
    .all-speakers .speaker-card {
      border-radius: 0;
      border: 6px solid #000000;
      box-shadow: 12px 12px 0 #000000;
      background: #d4a6a9;
    }
    .all-speakers .speaker-card img {
      border-radius: 0;
    }
    .all-speakers .speaker-overlay {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      background: #000000;
      padding: 12px 16px 14px;
    }
    .all-speakers .speaker-card .speaker-name {
      font-size: 28px;
      line-height: 1;
      letter-spacing: -0.01em;
    }
    .all-speakers .speaker-card .speaker-company {
      font-size: 20px;
      margin-top: 4px;
      line-height: 1;
      opacity: 0.85;
    }

    /* Card rotations for hand-placed feel */
    .all-speakers .card-0 { z-index: 2; transform: rotate(${CARD_ROTATIONS[0]}); }
    .all-speakers .card-1 { z-index: 4; transform: rotate(${CARD_ROTATIONS[1]}); }
    .all-speakers .card-2 { z-index: 3; transform: rotate(${CARD_ROTATIONS[2]}); }
    .all-speakers .card-3 { z-index: 1; transform: rotate(${CARD_ROTATIONS[3]}); }

    /* ── Event Date Chip ── */
    .all-speakers .event-chip {
      position: absolute;
      left: 56px;
      top: 620px;
      width: 400px;
      z-index: 4;
      background: #FFD600;
      border: 6px solid #000000;
      padding: 14px 18px 16px;
      color: #000000;
      box-shadow: 10px 10px 0 #000000;
      transform: rotate(1deg);
    }
    .all-speakers .event-label {
      font-family: var(--font-heading);
      font-size: 22px;
      line-height: 1;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .all-speakers .event-value {
      margin-top: 8px;
      font-family: var(--font-heading);
      font-size: 48px;
      line-height: 0.94;
      letter-spacing: -0.03em;
      font-weight: 800;
    }

    /* ── CTA Block ── */
    .all-speakers .cta-block {
      position: absolute;
      left: 56px;
      bottom: 50px;
      width: 440px;
      z-index: 5;
      border: 6px solid #FFFFFF;
      background: #e61f24;
      color: #ffffff;
      padding: 16px 20px 18px;
      box-shadow: 8px 8px 0 #000000;
    }
    .all-speakers .cta-label {
      font-family: var(--font-heading);
      color: rgba(255, 255, 255, 0.9);
      font-size: 24px;
      line-height: 1;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .all-speakers .cta-url {
      margin-top: 8px;
      font-family: var(--font-heading);
      color: #ffffff;
      font-size: 44px;
      line-height: 0.92;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── Sponsors Block ── */
    .all-speakers .sponsors-block {
      position: absolute;
      right: 50px;
      bottom: 50px;
      width: 310px;
      z-index: 4;
      border: 6px solid #000000;
      background: #ffffff;
      color: #000000;
      padding: 14px 16px 14px;
    }
    .all-speakers .sponsors-title {
      margin: 0;
      font-family: var(--font-heading);
      font-size: 32px;
      line-height: 0.95;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 800;
    }
    .all-speakers .sponsor-item {
      margin-top: 12px;
      display: grid;
      grid-template-columns: 18px 1fr;
      gap: 10px;
      align-items: start;
    }
    .all-speakers .sponsor-bullet {
      width: 18px;
      height: 18px;
      margin-top: 6px;
      border: 3px solid #000000;
      background: #e61f24;
      display: inline-block;
    }
    .all-speakers .sponsor-name {
      font-family: var(--font-heading);
      font-size: 30px;
      line-height: 0.95;
      font-weight: 800;
      text-transform: uppercase;
    }

    /* Sponsor logos variant */
    .all-speakers .sponsor-logo-grid {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .all-speakers .sponsor-logo-item img {
      display: block;
      max-height: 40px;
      max-width: 120px;
      object-fit: contain;
    }

    /* Hide old date-pill and sponsors if still rendered */
    .all-speakers .date-pill {
      display: none;
    }
    .all-speakers .sponsors {
      display: none;
    }
  `;

  return renderDocument({
    title: "All Speakers Poster",
    body,
    extraCss,
    width,
    height
  });
}

function renderBrutalistSponsors(sponsors: AllSpeakersData["sponsors"]): string {
  if (sponsors.length === 0) {
    return "";
  }

  const hasLogos = sponsors.some((s) => s.logoUrl);

  if (hasLogos) {
    const logos = sponsors
      .slice(0, 3)
      .map(
        (sponsor) => `
        <div class="sponsor-logo-item">
          ${sponsor.logoUrl
            ? `<img src="${escapeHtml(sponsor.logoUrl)}" alt="${escapeHtml(sponsor.name)}" />`
            : `<span class="sponsor-name">${escapeHtml(sponsor.name)}</span>`
          }
        </div>
      `
      )
      .join("");

    return `
      <section class="sponsors-block sponsors-logos">
        <h2 class="sponsors-title">Brought by</h2>
        <div class="sponsor-logo-grid">${logos}</div>
      </section>
    `;
  }

  const rows = sponsors
    .slice(0, 3)
    .map(
      (sponsor) => `
      <div class="sponsor-item">
        <span class="sponsor-bullet" aria-hidden="true"></span>
        <span class="sponsor-name">${escapeHtml(sponsor.name)}</span>
      </div>
    `
    )
    .join("");

  return `
    <section class="sponsors-block">
      <h2 class="sponsors-title">Brought by</h2>
      ${rows}
    </section>
  `;
}
