import type { SingleSpeakerData } from "../schemas";
import {
  escapeHtml,
  renderBrand,
  renderDocument
} from "./shared";

type TemplateSize = {
  width: number;
  height: number;
};

export function renderSingleSpeakerTemplate(data: SingleSpeakerData, size: TemplateSize): string {
  const { width, height } = size;

  const body = `
    <main class="poster single-speaker">
      <div class="split-line" aria-hidden="true"></div>
      ${renderBrand(data.meetupTitle, data.meetupUrl)}

      <section class="speaker-copy">
        <h1 class="speaker-heading">${escapeHtml(data.speaker.name)}</h1>
        <div class="speaker-company-pill">${escapeHtml(data.speaker.company)}</div>
        <p class="talk-title">${escapeHtml(data.speaker.talkTitle)}</p>
      </section>

      <section class="speaker-portrait">
        <img src="${escapeHtml(data.speaker.photoUrl)}" alt="${escapeHtml(data.speaker.name)}" />
      </section>

      <section class="event-chip">
        <div class="event-label">Date + Time</div>
        <div class="event-value">${escapeHtml(data.eventDateLabel)} ${escapeHtml(data.eventTimeLabel)}</div>
      </section>

      <section class="cta-block">
        <div class="cta-label">${escapeHtml(data.ctaLabel)}</div>
        <div class="cta-url">${escapeHtml(data.meetupUrl)}</div>
      </section>

      ${renderBrutalistSponsors(data.sponsors)}
    </main>
  `;

  const extraCss = `
    /* ── Base & Background ── */
    .single-speaker {
      background:
        linear-gradient(180deg, #E05A5A 0%, #E05A5A 58%, #F5F0E8 58%, #F5F0E8 100%);
      color: #000000;
      isolation: isolate;
    }

    /* Noise / grain texture overlay for brutalist feel */
    .single-speaker::before {
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
    .single-speaker::after {
      content: "";
      position: absolute;
      inset: 14px;
      border: 6px solid #000000;
      z-index: 1;
      pointer-events: none;
    }

    /* Horizontal split line */
    .single-speaker .split-line {
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
    .single-speaker .brand {
      left: 56px;
      top: 44px;
      line-height: 0.9;
      z-index: 4;
    }
    .single-speaker .brand-title {
      font-size: 86px;
      letter-spacing: -0.04em;
      color: #111c87;
      text-transform: none;
    }
    .single-speaker .brand-chip {
      margin-left: 10px;
      padding: 4px 12px 6px;
      border-radius: 8px;
      background: #e61f24;
      color: #ffc4c8;
      font-size: 0.82em;
    }
    .single-speaker .brand-url {
      margin-top: 16px;
      color: #FFFFFF;
      font-size: 52px;
      letter-spacing: 0.08em;
      text-shadow: 2px 2px 0 rgba(0,0,0,0.2);
    }

    /* ── Speaker Copy ── */
    .single-speaker .speaker-copy {
      position: absolute;
      top: 320px;
      left: 56px;
      width: 490px;
      z-index: 4;
      color: #ffffff;
    }

    /* Big, bold, dominating speaker name */
    .single-speaker .speaker-heading {
      margin: 0;
      font-family: var(--font-heading);
      font-size: 90px;
      line-height: 0.88;
      letter-spacing: -0.05em;
      font-weight: 800;
      text-transform: uppercase;
      max-height: 178px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      text-shadow: 3px 3px 0 rgba(0,0,0,0.15);
    }

    /* Company pill - accent red bg, white text */
    .single-speaker .speaker-company-pill {
      display: inline-block;
      margin-top: 16px;
      padding: 10px 16px 12px;
      background: #e61f24;
      color: #ffffff;
      border: 5px solid #000000;
      font-family: var(--font-heading);
      font-size: 28px;
      line-height: 1;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Talk title box - brutalist thick border, big offset shadow, rotated */
    .single-speaker .talk-title {
      margin: 20px 0 0;
      padding: 18px 20px;
      background: #FFFFFF;
      border: 6px solid #000000;
      box-shadow: 14px 14px 0 #000000;
      color: #000000;
      font-family: var(--font-heading);
      font-size: 34px;
      line-height: 1.06;
      font-weight: 800;
      letter-spacing: -0.02em;
      max-height: 170px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      transform: rotate(-1.5deg);
    }

    /* ── Speaker Portrait ── */
    .single-speaker .speaker-portrait {
      position: absolute;
      left: 540px;
      top: 80px;
      width: 490px;
      height: 600px;
      z-index: 4;
      overflow: hidden;
      border: 8px solid #000000;
      border-radius: 0;
      box-shadow: 16px 16px 0 #000000;
      background: #d4aaaf;
    }
    .single-speaker .speaker-portrait img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      object-position: center;
    }

    /* ── Event Date Chip ── */
    .single-speaker .event-chip {
      position: absolute;
      left: 56px;
      top: 720px;
      width: 460px;
      z-index: 4;
      background: #FFD600;
      border: 6px solid #000000;
      padding: 14px 18px 16px;
      color: #000000;
      box-shadow: 10px 10px 0 #000000;
      transform: rotate(1deg);
    }
    .single-speaker .event-label {
      font-family: var(--font-heading);
      font-size: 22px;
      line-height: 1;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .single-speaker .event-value {
      margin-top: 8px;
      font-family: var(--font-heading);
      font-size: 52px;
      line-height: 0.94;
      letter-spacing: -0.03em;
      font-weight: 800;
    }

    /* ── CTA Block ── */
    .single-speaker .cta-block {
      position: absolute;
      left: 56px;
      bottom: 50px;
      width: 620px;
      z-index: 4;
      border: 6px solid #FFFFFF;
      background: #e61f24;
      color: #ffffff;
      padding: 16px 20px 18px;
      box-shadow: 8px 8px 0 #000000;
    }
    .single-speaker .cta-label {
      font-family: var(--font-heading);
      color: rgba(255, 255, 255, 0.9);
      font-size: 24px;
      line-height: 1;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .single-speaker .cta-url {
      margin-top: 8px;
      font-family: var(--font-heading);
      color: #ffffff;
      font-size: 68px;
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
    .single-speaker .sponsors-block {
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
    .single-speaker .sponsors-title {
      margin: 0;
      font-family: var(--font-heading);
      font-size: 32px;
      line-height: 0.95;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 800;
    }
    .single-speaker .sponsor-item {
      margin-top: 12px;
      display: grid;
      grid-template-columns: 18px 1fr;
      gap: 10px;
      align-items: start;
    }
    .single-speaker .sponsor-bullet {
      width: 18px;
      height: 18px;
      margin-top: 6px;
      border: 3px solid #000000;
      background: #e61f24;
      display: inline-block;
    }
    .single-speaker .sponsor-name {
      font-family: var(--font-heading);
      font-size: 30px;
      line-height: 0.95;
      font-weight: 800;
      text-transform: uppercase;
    }

    /* Sponsor logos variant */
    .single-speaker .sponsor-logo-grid {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .single-speaker .sponsor-logo-item img {
      display: block;
      max-height: 40px;
      max-width: 120px;
      object-fit: contain;
    }
  `;

  return renderDocument({
    title: "Single Speaker Poster",
    body,
    extraCss,
    width,
    height
  });
}

function renderBrutalistSponsors(sponsors: SingleSpeakerData["sponsors"]): string {
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
