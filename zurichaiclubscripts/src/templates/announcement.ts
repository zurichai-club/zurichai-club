import type { AnnouncementData } from "../schemas";
import { escapeHtml, renderBrand, renderDocument } from "./shared";

type TemplateSize = {
  width: number;
  height: number;
};

export function renderAnnouncementTemplate(data: AnnouncementData, size: TemplateSize): string {
  const { width, height } = size;

  const body = `
    <main class="poster announcement">
      <div class="split-line" aria-hidden="true"></div>
      ${renderBrand(data.meetupTitle, data.meetupUrl)}

      <div class="edition-badge">${escapeHtml(data.edition)}</div>

      <section class="ann-copy">
        <h1>${escapeHtml(data.eventHeadline)}</h1>
        <p>${escapeHtml(data.eventSubheadline)}</p>
      </section>

      <div class="loop-graphic" aria-hidden="true">
        <div class="loop-ring loop-ring-1"></div>
        <div class="loop-ring loop-ring-2"></div>
        <div class="loop-ring loop-ring-3"></div>
        <div class="loop-ring loop-ring-4"></div>
        <div class="loop-arrow">↻</div>
      </div>

      <section class="event-chip">
        <div class="event-label">Mark your calendar</div>
        <div class="event-value">${escapeHtml(data.eventDateLabel)} ${escapeHtml(data.eventTimeLabel)}</div>
      </section>

      <section class="venue-callout">
        <div class="venue-title">Venue<br/>Wanted</div>
        <div class="venue-divider"></div>
        <p class="venue-text">Your space. Our community. One great evening.</p>
      </section>

      <section class="cta-block">
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

    /* ── Loop Graphic ── */
    /* Container sits in the top-right, bleeds slightly over the split line
       to create visual continuity between the two zones. */
    .announcement .loop-graphic {
      position: absolute;
      right: 44px;
      top: 44px;
      width: 460px;
      height: 580px;
      z-index: 3;
      /* Clip to the poster so rings don't escape the frame */
      overflow: visible;
    }

    .announcement .loop-ring {
      position: absolute;
      border-radius: 50%;
    }

    /* Outermost ring — white dashed border conveys orbital motion */
    .announcement .loop-ring-1 {
      width: 440px;
      height: 440px;
      top: 10px;
      left: 8px;
      border: 0;
      /* Dashed stroke via outline trick using box-shadow + border */
      border: 12px dashed rgba(255,255,255,0.55);
      background: transparent;
    }

    /* Second ring — solid white, thinner, slightly offset for rotation feel */
    .announcement .loop-ring-2 {
      width: 340px;
      height: 340px;
      top: 60px;
      left: 52px;
      border: 7px solid rgba(255,255,255,0.85);
      background: transparent;
      /* Small hard shadow makes it feel lifted off the red */
      box-shadow: 4px 4px 0 rgba(0,0,0,0.25);
    }

    /* Third ring — black border, no fill, tighter orbit */
    .announcement .loop-ring-3 {
      width: 240px;
      height: 240px;
      top: 110px;
      left: 102px;
      border: 6px solid #000000;
      background: transparent;
      opacity: 0.5;
    }

    /* Innermost filled ring — yellow nucleus with brutal hard shadow */
    .announcement .loop-ring-4 {
      width: 160px;
      height: 160px;
      top: 150px;
      left: 142px;
      border: 7px solid #000000;
      background: #FFD600;
      box-shadow: 8px 8px 0 #000000;
    }

    /* Rotation arrow — bold, centered inside the yellow nucleus */
    .announcement .loop-arrow {
      position: absolute;
      top: 158px;
      left: 150px;
      width: 144px;
      height: 144px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 96px;
      font-weight: 900;
      color: #000000;
      line-height: 1;
      z-index: 4;
      /* Slight rotation on the glyph itself adds kinetic feel */
      transform: rotate(15deg);
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
      margin-top: 0;
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

    /* ── Venue Callout ── */
    .announcement .venue-callout {
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
    .announcement .venue-title {
      font-family: var(--font-heading);
      font-size: 56px;
      line-height: 0.88;
      font-weight: 800;
      letter-spacing: -0.03em;
      text-transform: uppercase;
      color: #e61f24;
    }
    .announcement .venue-divider {
      height: 4px;
      background: #000000;
      margin: 14px 0;
    }
    .announcement .venue-text {
      font-family: var(--font-body);
      font-size: 26px;
      line-height: 1.25;
      font-weight: 700;
      color: #000000;
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
