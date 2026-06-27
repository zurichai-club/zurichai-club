import type { WelcomeDeckData } from "../schemas";
import { escapeHtml, renderBrand, renderDocument } from "./shared";

type TemplateSize = {
  width: number;
  height: number;
};

type ResolvedSponsor = {
  name: string;
  logoText?: string;
  logoUrl?: string;
};

type AboutMeetup = NonNullable<WelcomeDeckData["aboutMeetup"]>;

export function renderWelcomeDeckTemplate(data: WelcomeDeckData, size: TemplateSize): string {
  const sponsors = resolveSponsors(data);
  const preSpeakerQrSlides = data.qrSlides.filter((slide) => slide.placement === "beforeSpeakers");
  const endQrSlides = data.qrSlides.filter((slide) => slide.placement !== "beforeSpeakers");
  const aboutPages = data.aboutMeetup
    ? [
        renderAboutMeetupPage(data, data.aboutMeetup),
        ...(data.aboutMeetup.founders.length > 0 ? [renderFoundersPage(data, data.aboutMeetup)] : [])
      ]
    : [];
  const pages = [
    renderWelcomePage(data, sponsors),
    renderLineupPage(data, sponsors),
    ...aboutPages,
    ...preSpeakerQrSlides.map((slide) => renderQrSlide(data, slide)),
    ...data.speakers.map((speaker) => renderSpeakerPage(data, sponsors, speaker)),
    ...endQrSlides.map((slide) => renderQrSlide(data, slide))
  ].join("");

  const { width, height } = size;

  const extraCss = `
    @page {
      size: ${width}px ${height}px;
      margin: 0;
    }

    html,
    body {
      width: ${width}px;
      height: auto;
      background: #F5F0E8;
    }

    body {
      margin: 0;
    }

    .welcome-deck {
      width: ${width}px;
    }

    .deck-page {
      width: ${width}px;
      height: ${height}px;
      position: relative;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      background:
        linear-gradient(180deg, #E05A5A 0%, #E05A5A 58%, #F5F0E8 58%, #F5F0E8 100%);
      color: #000000;
      isolation: isolate;
    }

    .deck-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .deck-page::before {
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
          rgba(0,0,0,0.16) 2px,
          rgba(0,0,0,0.16) 4px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.12) 2px,
          rgba(0,0,0,0.12) 4px
        );
    }

    .deck-page::after {
      content: "";
      position: absolute;
      inset: 24px;
      border: 7px solid #000000;
      z-index: 8;
      pointer-events: none;
    }

    .split-line {
      position: absolute;
      left: 24px;
      right: 24px;
      top: 58%;
      height: 7px;
      background: #000000;
      z-index: 1;
      pointer-events: none;
    }

    .welcome-page {
      background: #000000 !important;
    }

    .welcome-page::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      opacity: 1;
      background:
        linear-gradient(180deg, rgba(3, 6, 18, 0.18) 0%, rgba(3, 6, 18, 0.34) 52%, rgba(3, 6, 18, 0.58) 100%),
        linear-gradient(90deg, rgba(3, 6, 18, 0.08) 0%, rgba(3, 6, 18, 0.16) 48%, rgba(3, 6, 18, 0.34) 100%),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.12) 2px,
          rgba(0,0,0,0.12) 4px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.08) 2px,
          rgba(0,0,0,0.08) 4px
        );
    }

    .welcome-page .split-line {
      display: none;
    }

    .welcome-photo-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      object-position: center;
      filter: saturate(1.02) contrast(1.04) brightness(0.74);
      z-index: 0;
    }

    .deck-page .brand {
      left: 76px;
      top: 62px;
      line-height: 0.9;
      z-index: 5;
      transform: none;
    }

    .deck-page .brand-title {
      font-size: 96px;
      letter-spacing: 0;
      color: #111c87;
      text-transform: none;
    }

    .deck-page .brand-chip {
      margin-left: 10px;
      padding: 4px 12px 6px;
      border-radius: 8px;
      background: #e61f24;
      color: #ffffff;
      font-size: 0.82em;
    }

    .deck-page .brand-url {
      margin-top: 16px;
      color: #ffffff;
      font-size: 48px;
      letter-spacing: 0.08em;
      text-shadow: 2px 2px 0 rgba(0,0,0,0.2);
    }

    .welcome-copy {
      position: absolute;
      left: 76px;
      top: 334px;
      width: 900px;
      z-index: 5;
      color: #ffffff;
      padding-left: 26px;
    }

    .welcome-page .welcome-copy {
      left: 50%;
      top: 55%;
      width: 1180px;
      padding-left: 0;
      text-align: center;
      transform: translate(-50%, -50%);
      z-index: 5;
    }

    .welcome-page .welcome-copy::before {
      display: none;
    }

    .welcome-copy::before,
    .speaker-copy::before {
      content: "";
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 10px;
      background: #FFD600;
      box-shadow: 3px 3px 0 #000000;
    }

    .deck-kicker {
      margin: 0 0 18px;
      font-family: var(--font-heading);
      font-size: 28px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.9);
      text-shadow: 2px 2px 0 rgba(0,0,0,0.22);
    }

    .welcome-copy h1,
    .speaker-copy h2 {
      margin: 0;
      font-family: var(--font-heading);
      font-weight: 800;
      letter-spacing: 0;
      color: #ffffff;
      text-transform: uppercase;
      text-shadow: 5px 5px 0 rgba(0,0,0,0.32);
    }

    .welcome-copy h1 {
      font-size: 150px;
      line-height: 0.9;
    }

    .welcome-page .welcome-copy h1 {
      font-size: 150px;
      text-align: center;
      text-shadow: 6px 6px 0 rgba(0,0,0,0.36);
    }

    .welcome-copy p:not(.deck-kicker) {
      margin: 26px 0 0;
      max-width: 680px;
      padding: 16px 18px 18px;
      background: #ffffff;
      border: 7px solid #000000;
      box-shadow: 12px 12px 0 #000000;
      font-family: var(--font-body);
      font-size: 34px;
      font-weight: 800;
      line-height: 1.12;
      color: #000000;
      text-shadow: none;
      transform: rotate(-1deg);
    }

    .welcome-page .welcome-copy p:not(.deck-kicker) {
      display: inline-block;
      max-width: 790px;
      font-family: var(--font-heading);
      font-size: 36px;
      text-align: center;
    }

    .welcome-page .sponsor-strip {
      right: 76px;
      bottom: 72px;
      width: 1040px;
      min-height: 218px;
      padding: 34px 44px;
      background: rgba(255,255,255,0.94);
    }

    .welcome-page .sponsor-strip-logos {
      gap: 34px;
    }

    .welcome-page .sponsor-strip-logo img {
      max-width: 210px;
      max-height: 108px;
    }

    .sponsor-strip {
      position: absolute;
      right: 76px;
      bottom: 76px;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 760px;
      min-height: 146px;
      padding: 22px 30px;
      border: 7px solid #000000;
      background: #ffffff;
      color: #000000;
      box-shadow: 12px 12px 0 #000000;
    }

    .sponsor-strip-logos {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 18px;
      flex-wrap: wrap;
    }

    .sponsor-strip-logo img {
      display: block;
      max-width: 124px;
      max-height: 62px;
      object-fit: contain;
    }

    .sponsor-name-fallback {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      font-family: var(--font-heading);
      font-size: 24px;
      font-weight: 800;
      line-height: 1;
      text-transform: uppercase;
    }

    .speaker-copy {
      position: absolute;
      left: 76px;
      top: 336px;
      width: 760px;
      z-index: 5;
      color: #ffffff;
      padding-left: 26px;
    }

    .speaker-copy h2 {
      font-size: 86px;
      line-height: 0.94;
      max-height: 248px;
      overflow: hidden;
    }

    .speaker-company-large {
      display: inline-block;
      margin-top: 20px;
      padding: 13px 20px 15px;
      background: #e61f24;
      color: #ffffff;
      border: 5px solid #000000;
      font-family: var(--font-heading);
      font-size: 32px;
      font-weight: 800;
      line-height: 1;
      text-transform: uppercase;
      box-shadow: 7px 7px 0 #000000;
    }

    .speaker-talk {
      margin: 30px 0 0;
      max-width: 700px;
      padding: 18px 20px;
      background: #ffffff;
      border: 7px solid #000000;
      box-shadow: 12px 12px 0 #000000;
      color: #000000;
      font-family: var(--font-heading);
      font-size: 40px;
      line-height: 1.08;
      font-weight: 800;
      transform: rotate(-1deg);
    }

    .speaker-portrait {
      position: absolute;
      right: 86px;
      top: 104px;
      width: 780px;
      height: 690px;
      z-index: 9;
      overflow: hidden;
      border: 8px solid #000000;
      background: #d4a6a9;
      box-shadow: 16px 16px 0 #000000;
      transform: rotate(1deg);
    }

    .speaker-portrait img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      object-position: center;
    }

    .speaker-page .sponsor-strip {
      width: 700px;
      min-height: 132px;
      bottom: 62px;
    }

    .lineup-page .brand {
      left: 76px;
      top: 62px;
    }

    .lineup-copy {
      position: absolute;
      left: 76px;
      top: 334px;
      width: 620px;
      z-index: 5;
      color: #ffffff;
      padding-left: 26px;
    }

    .lineup-copy::before {
      content: "";
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 10px;
      background: #FFD600;
      box-shadow: 3px 3px 0 #000000;
    }

    .lineup-copy h2 {
      margin: 0;
      font-family: var(--font-heading);
      font-size: 92px;
      line-height: 0.92;
      font-weight: 800;
      letter-spacing: 0;
      color: #ffffff;
      text-transform: uppercase;
      text-shadow: 5px 5px 0 rgba(0,0,0,0.32);
    }

    .lineup-event {
      display: inline-block;
      margin: 28px 0 0;
      max-width: 540px;
      padding: 16px 20px 18px;
      background: #ffffff;
      border: 7px solid #000000;
      color: #000000;
      box-shadow: 12px 12px 0 #000000;
      font-family: var(--font-heading);
      font-size: 42px;
      line-height: 1;
      font-weight: 800;
      text-transform: uppercase;
      transform: rotate(-1deg);
    }

    .lineup-grid {
      position: absolute;
      right: 86px;
      top: 94px;
      z-index: 5;
      width: 980px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 30px;
    }

    .lineup-card {
      position: relative;
      height: 330px;
      overflow: hidden;
      border: 7px solid #000000;
      background: #d4a6a9;
      box-shadow: 13px 13px 0 #000000;
      display: flex;
      flex-direction: column;
    }

    .lineup-card:nth-child(1) {
      transform: rotate(-1.4deg);
    }

    .lineup-card:nth-child(2) {
      transform: rotate(1deg);
    }

    .lineup-card:nth-child(3) {
      transform: rotate(0.8deg);
    }

    .lineup-card:nth-child(4) {
      transform: rotate(-0.8deg);
    }

    .lineup-card img {
      width: 100%;
      height: 230px;
      display: block;
      object-fit: cover;
      object-position: center 32%;
      flex: 0 0 auto;
    }

    .lineup-card-info {
      position: static;
      min-height: 100px;
      padding: 14px 20px 16px;
      background: #000000;
      color: #ffffff;
      flex: 1 1 auto;
      box-sizing: border-box;
    }

    .lineup-card-info h3 {
      margin: 0;
      font-family: var(--font-heading);
      font-size: 36px;
      line-height: 0.95;
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .lineup-company {
      margin-top: 6px;
      font-family: var(--font-heading);
      font-size: 22px;
      line-height: 1;
      font-weight: 800;
      color: rgba(255,255,255,0.86);
      text-transform: uppercase;
    }

    .lineup-talk {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 3px solid #e61f24;
      font-family: var(--font-body);
      font-size: 22px;
      line-height: 1.05;
      font-weight: 800;
      color: #ffffff;
    }

    .lineup-page .sponsor-strip {
      width: 700px;
      min-height: 132px;
      bottom: 62px;
    }

    .about-intro-page::before,
    .founders-page::before {
      opacity: 0.06;
    }

    .about-intro-page .brand,
    .founders-page .brand {
      left: 76px;
      top: 62px;
    }

    .about-intro-content {
      position: absolute;
      left: 76px;
      top: 334px;
      z-index: 5;
      width: 720px;
      color: #ffffff;
      padding-left: 26px;
      text-align: left;
    }

    .about-intro-content::before,
    .founders-copy::before {
      content: "";
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 10px;
      background: #FFD600;
      box-shadow: 3px 3px 0 #000000;
    }

    .about-intro-content h2 {
      margin: 0;
      font-family: var(--font-heading);
      font-size: 104px;
      line-height: 0.92;
      font-weight: 800;
      letter-spacing: 0;
      color: #ffffff;
      text-transform: uppercase;
      text-shadow: 5px 5px 0 rgba(0,0,0,0.32);
    }

    .about-detail-list {
      margin: 42px 0 0;
      padding: 0;
      list-style: none;
    }

    .about-detail-list li {
      display: table;
      margin: 0 0 22px;
      padding: 16px 22px 18px;
      background: #ffffff;
      border: 7px solid #000000;
      color: #666666;
      box-shadow: 11px 11px 0 #000000;
      font-family: var(--font-heading);
      font-size: 42px;
      line-height: 1;
      font-weight: 800;
      color: #000000;
      transform: rotate(-1deg);
    }

    .about-detail-list li:nth-child(even) {
      background: #FFD600;
      transform: rotate(1deg);
    }

    .about-points {
      position: absolute;
      right: 104px;
      top: 226px;
      z-index: 5;
      display: grid;
      gap: 28px;
      width: 720px;
    }

    .about-point {
      min-height: 140px;
      padding: 28px 34px 30px;
      background: #ffffff;
      border: 7px solid #000000;
      box-shadow: 13px 13px 0 #000000;
      font-family: var(--font-heading);
      font-size: 44px;
      line-height: 1.04;
      font-weight: 800;
      color: #000000;
      text-transform: uppercase;
    }

    .about-point:nth-child(1) {
      transform: rotate(1deg);
    }

    .about-point:nth-child(2) {
      background: #FFD600;
      transform: rotate(-1deg);
    }

    .about-point:nth-child(3) {
      transform: rotate(0.7deg);
    }

    .founders-page-title {
      display: none;
    }

    .founders-copy {
      position: absolute;
      left: 78px;
      top: 334px;
      z-index: 5;
      width: 560px;
      padding-left: 26px;
      color: #ffffff;
    }

    .founders-copy h2 {
      margin: 0;
      font-family: var(--font-heading);
      font-size: 106px;
      line-height: 0.92;
      font-weight: 800;
      color: #ffffff;
      text-transform: uppercase;
      text-shadow: 5px 5px 0 rgba(0,0,0,0.32);
    }

    .founders-note {
      display: inline-block;
      margin: 32px 0 0;
      padding: 15px 20px 17px;
      background: #ffffff;
      border: 7px solid #000000;
      box-shadow: 11px 11px 0 #000000;
      color: #000000;
      font-family: var(--font-heading);
      font-size: 38px;
      line-height: 1;
      font-weight: 800;
      text-transform: uppercase;
      transform: rotate(-1deg);
    }

    .founders-grid {
      position: absolute;
      right: 62px;
      top: 54px;
      z-index: 5;
      width: 1160px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 32px;
    }

    .founder-card {
      height: 850px;
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 405px 1fr;
      min-width: 0;
      padding: 0;
      overflow: hidden;
      border: 7px solid #000000;
      background: #ffffff;
      box-shadow: 13px 13px 0 #000000;
      transform: rotate(-1deg);
    }

    .founder-card:nth-child(even) {
      transform: rotate(1deg);
    }

    .founder-photo {
      width: 100%;
      height: 405px;
      overflow: hidden;
      border: 0;
      border-bottom: 7px solid #000000;
      background: #d4a6a9;
      box-shadow: none;
      transform: none;
    }

    .founder-photo img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      object-position: center 36%;
    }

    .founder-card:nth-child(even) .founder-photo img {
      width: 140%;
      max-width: none;
      object-position: center 28%;
      transform: translateX(-20%);
    }

    .founder-info {
      min-width: 0;
      min-height: 0;
      padding: 20px 28px 24px;
      color: #ffffff;
      background: #000000;
    }

    .founder-name {
      margin: 0;
      font-family: var(--font-heading);
      font-size: 32px;
      line-height: 0.98;
      font-weight: 800;
      color: #ffffff;
      text-transform: uppercase;
    }

    .founder-role,
    .founder-email {
      margin: 10px 0 0;
      font-family: var(--font-heading);
      font-size: 19px;
      line-height: 1;
      font-weight: 800;
      color: rgba(255,255,255,0.86);
      text-transform: uppercase;
    }

    .founder-email {
      color: #ffffff;
      text-transform: none;
    }

    .founder-qr {
      width: 286px;
      height: 286px;
      margin-top: 14px;
      padding: 16px;
      background: #ffffff;
      border: 6px solid #000000;
      box-shadow: 9px 9px 0 rgba(255,255,255,0.14);
      box-sizing: border-box;
    }

    .founder-qr img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
      image-rendering: pixelated;
    }

    .qr-page {
      background: #000000;
    }

    .qr-page::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 1;
      opacity: 1;
      pointer-events: none;
      background:
        linear-gradient(180deg, rgba(3, 6, 18, 0.1), rgba(3, 6, 18, 0.42)),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.12) 2px,
          rgba(0,0,0,0.12) 4px
        );
    }

    .qr-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
      object-position: center;
      filter: saturate(1.08) contrast(1.04) brightness(0.82);
      z-index: 0;
    }

    .qr-page .brand {
      left: 78px;
      top: 72px;
      z-index: 4;
      transform: none;
    }

    .qr-page .brand-title {
      font-size: 72px;
      color: #111c87;
    }

    .qr-page .brand-url {
      margin-top: 12px;
      font-size: 30px;
      color: #e61f24;
      text-shadow: none;
    }

    .qr-copy {
      display: none;
    }

    .qr-copy h2 {
      margin: 0;
      font-family: var(--font-heading);
      font-size: 74px;
      line-height: 0.94;
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .qr-copy p {
      margin: 14px 0 0;
      max-width: 660px;
      font-family: var(--font-body);
      font-size: 30px;
      line-height: 1.12;
      font-weight: 800;
    }

    .qr-card {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 5;
      width: 560px;
      height: 560px;
      padding: 36px;
      background: #ffffff;
      border: 8px solid #000000;
      box-shadow: 16px 16px 0 #000000;
      transform: translate(-50%, -50%) rotate(0.5deg);
    }

    .qr-card img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: contain;
      image-rendering: pixelated;
    }

    .qr-caption {
      position: absolute;
      left: 50%;
      top: calc(50% + 308px);
      z-index: 6;
      min-width: 620px;
      padding: 14px 28px 16px;
      background: rgba(0,0,0,0.72);
      color: #ffffff;
      border: 5px solid #ffffff;
      box-shadow: 8px 8px 0 #000000;
      transform: translateX(-50%) rotate(-0.5deg);
      font-family: var(--font-heading);
      font-size: 42px;
      line-height: 1;
      font-weight: 800;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    .qr-slide-logo {
      position: absolute;
      right: 92px;
      bottom: 82px;
      z-index: 6;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 330px;
      min-height: 104px;
      padding: 20px 28px;
      background: rgba(255,255,255,0.94);
      border: 7px solid #000000;
      box-shadow: 12px 12px 0 #000000;
      transform: rotate(0.8deg);
      box-sizing: border-box;
    }

    .qr-slide-logo img {
      display: block;
      max-width: 250px;
      max-height: 54px;
      object-fit: contain;
    }

    .deck-controls,
    .deck-progress {
      display: none;
    }

    @media screen {
      html,
      body {
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #111111;
      }

      .welcome-deck {
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        background: #111111;
      }

      .deck-page {
        position: absolute;
        left: 50%;
        top: 50%;
        opacity: 0;
        pointer-events: none;
        transform: translate(-50%, -50%) scale(var(--deck-scale, 1));
        transform-origin: center center;
        page-break-after: auto;
        break-after: auto;
      }

      .deck-page.is-active {
        opacity: 1;
        pointer-events: auto;
      }

      .deck-controls {
        position: fixed;
        right: 20px;
        bottom: 18px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border: 2px solid rgba(255,255,255,0.24);
        border-radius: 999px;
        background: rgba(0,0,0,0.56);
        color: #ffffff;
        opacity: 0.14;
        transition: opacity 160ms ease;
      }

      .deck-controls:hover,
      .deck-controls:focus-within {
        opacity: 1;
      }

      .deck-controls button {
        width: 38px;
        height: 34px;
        border: 0;
        border-radius: 999px;
        background: #ffffff;
        color: #000000;
        font-family: var(--font-heading);
        font-size: 22px;
        line-height: 1;
        font-weight: 800;
        cursor: pointer;
      }

      .deck-counter {
        min-width: 54px;
        text-align: center;
        font-family: var(--font-heading);
        font-size: 14px;
        line-height: 1;
        font-weight: 800;
      }

      .deck-progress {
        position: fixed;
        left: 0;
        bottom: 0;
        z-index: 1001;
        display: block;
        width: var(--deck-progress, 11.111%);
        height: 4px;
        background: #e61f24;
      }
    }
  `;

  return renderDocument({
    title: `${data.eventTitle} Welcome Deck`,
    body: `
      <main class="welcome-deck" data-slide-width="${width}" data-slide-height="${height}">${pages}</main>
      ${renderHtmlDeckControls()}
      ${renderHtmlDeckScript(width, height)}
    `,
    extraCss,
    width,
    height
  });
}

function renderWelcomePage(data: WelcomeDeckData, sponsors: ResolvedSponsor[]): string {
  return `
    <section class="poster deck-page welcome-page">
      ${data.backgroundImageUrl ? `<img class="welcome-photo-bg" src="${escapeHtml(data.backgroundImageUrl)}" alt="" />` : ""}
      <div class="split-line" aria-hidden="true"></div>
      <section class="welcome-copy">
        <p class="deck-kicker">${escapeHtml(data.meetupTitle)}</p>
        <h1>${escapeHtml(data.eventTitle)}</h1>
        ${data.eventSubtitle ? `<p>${escapeHtml(data.eventSubtitle)}</p>` : ""}
      </section>
      ${renderSponsorStrip(sponsors)}
    </section>
  `;
}

function renderLineupPage(data: WelcomeDeckData, sponsors: ResolvedSponsor[]): string {
  const speakerCards = data.speakers
    .map(
      (speaker) => `
        <article class="lineup-card">
          <img src="${escapeHtml(speaker.photoUrl)}" alt="${escapeHtml(speaker.name)}" />
          <div class="lineup-card-info">
            <h3>${escapeHtml(speaker.name)}</h3>
            <div class="lineup-company">${escapeHtml(speaker.company)}</div>
          </div>
        </article>
      `
    )
    .join("");

  return `
    <section class="poster deck-page lineup-page">
      <div class="split-line" aria-hidden="true"></div>
      ${renderBrand(data.meetupTitle, data.meetupUrl)}
      <section class="lineup-copy">
        <p class="deck-kicker">Tonight's speakers</p>
        <h2>Speaker lineup</h2>
        <div class="lineup-event">${escapeHtml(data.eventTitle)}</div>
      </section>
      <section class="lineup-grid lineup-count-${Math.min(data.speakers.length, 4)}">
        ${speakerCards}
      </section>
      ${renderSponsorStrip(sponsors)}
    </section>
  `;
}

function renderAboutMeetupPage(data: WelcomeDeckData, about: AboutMeetup): string {
  const details = about.details.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("");

  return `
    <section class="poster deck-page about-intro-page">
      <div class="split-line" aria-hidden="true"></div>
      ${renderBrand(data.meetupTitle, data.meetupUrl)}
      <section class="about-intro-content">
        <p class="deck-kicker">Community first</p>
        <h2>${escapeHtml(about.title)}</h2>
        <ul class="about-detail-list">${details}</ul>
      </section>
      <section class="about-points">
        <div class="about-point">Practical demos from local builders</div>
        <div class="about-point">Production stories, tools, and workflows</div>
        <div class="about-point">Open community for AI engineers in Zurich</div>
      </section>
    </section>
  `;
}

function renderFoundersPage(data: WelcomeDeckData, about: AboutMeetup): string {
  const founderCards = about.founders
    .map(
      (founder) => `
        <article class="founder-card">
          <section class="founder-photo">
            <img src="${escapeHtml(founder.photoUrl)}" alt="${escapeHtml(founder.name)}" />
          </section>
          <section class="founder-info">
            <h3 class="founder-name">${escapeHtml(founder.name)}</h3>
            <p class="founder-role">${escapeHtml(founder.role)}</p>
            <p class="founder-email">${escapeHtml(founder.email)}</p>
            ${
              founder.qrImageUrl
                ? `<section class="founder-qr"><img src="${escapeHtml(founder.qrImageUrl)}" alt="${escapeHtml(founder.name)} contact QR code" /></section>`
                : ""
            }
          </section>
        </article>
      `
    )
    .join("");

  return `
    <section class="poster deck-page founders-page">
      <div class="split-line" aria-hidden="true"></div>
      ${renderBrand(data.meetupTitle, data.meetupUrl)}
      <h2 class="founders-page-title">${escapeHtml(about.foundersTitle)}</h2>
      <section class="founders-copy">
        <p class="deck-kicker">Meet the organizers</p>
        <h2>${escapeHtml(about.foundersTitle)}</h2>
        <div class="founders-note">Say hi after the talks</div>
      </section>
      <section class="founders-grid">${founderCards}</section>
    </section>
  `;
}

function renderQrSlide(
  data: WelcomeDeckData,
  slide: WelcomeDeckData["qrSlides"][number]
): string {
  const caption = slide.caption ?? slide.title;

  return `
    <section class="poster deck-page qr-page">
      ${data.backgroundImageUrl ? `<img class="qr-bg" src="${escapeHtml(data.backgroundImageUrl)}" alt="" />` : ""}
      <section class="qr-copy">
        <h2>${escapeHtml(slide.title)}</h2>
        ${slide.subtitle ? `<p>${escapeHtml(slide.subtitle)}</p>` : ""}
      </section>
      <section class="qr-card">
        <img src="${escapeHtml(slide.qrImageUrl ?? "")}" alt="${escapeHtml(caption)} QR code" />
      </section>
      <div class="qr-caption">${escapeHtml(caption)}</div>
      ${
        slide.logoUrl
          ? `<section class="qr-slide-logo"><img src="${escapeHtml(slide.logoUrl)}" alt="${escapeHtml(slide.title)} sponsor logo" /></section>`
          : ""
      }
    </section>
  `;
}

function renderSpeakerPage(
  data: WelcomeDeckData,
  sponsors: ResolvedSponsor[],
  speaker: WelcomeDeckData["speakers"][number]
): string {
  const talkTitle = speaker.talkTitle ?? "Talk intro";

  return `
    <section class="poster deck-page speaker-page">
      <div class="split-line" aria-hidden="true"></div>
      ${renderBrand(data.meetupTitle, data.meetupUrl)}
      <section class="speaker-copy">
        <p class="deck-kicker">Up next</p>
        <h2>${escapeHtml(speaker.name)}</h2>
        <div class="speaker-company-large">${escapeHtml(speaker.company)}</div>
        <p class="speaker-talk">${escapeHtml(talkTitle)}</p>
      </section>
      <section class="speaker-portrait">
        <img src="${escapeHtml(speaker.photoUrl)}" alt="${escapeHtml(speaker.name)}" />
      </section>
      ${renderSponsorStrip(sponsors)}
    </section>
  `;
}

function renderSponsorStrip(sponsors: ResolvedSponsor[]): string {
  if (sponsors.length === 0) {
    return "";
  }

  const logos = sponsors
    .map((sponsor) => {
      if (sponsor.logoUrl) {
        return `
          <div class="sponsor-strip-logo">
            <img src="${escapeHtml(sponsor.logoUrl)}" alt="${escapeHtml(sponsor.name)}" />
          </div>
        `;
      }

      return `<span class="sponsor-name-fallback">${escapeHtml(sponsor.logoText ?? sponsor.name)}</span>`;
    })
    .join("");

  return `
    <section class="sponsor-strip">
      <div class="sponsor-strip-logos">${logos}</div>
    </section>
  `;
}

function renderHtmlDeckControls(): string {
  return `
    <nav class="deck-controls" aria-label="Slide controls">
      <button type="button" data-deck-prev aria-label="Previous slide">&#8249;</button>
      <span class="deck-counter" data-deck-counter>1 / 1</span>
      <button type="button" data-deck-next aria-label="Next slide">&#8250;</button>
    </nav>
    <div class="deck-progress" aria-hidden="true"></div>
  `;
}

function renderHtmlDeckScript(width: number, height: number): string {
  return `
    <script>
      (() => {
        const width = ${width};
        const height = ${height};
        const slides = Array.from(document.querySelectorAll(".deck-page"));
        const counter = document.querySelector("[data-deck-counter]");
        const progress = document.querySelector(".deck-progress");
        const deck = document.querySelector(".welcome-deck");
        let index = readIndexFromHash();

        function clamp(value) {
          return Math.max(0, Math.min(slides.length - 1, value));
        }

        function readIndexFromHash() {
          const match = /^#slide-(\\d+)$/.exec(window.location.hash);
          return clamp(match ? Number(match[1]) - 1 : 0);
        }

        function updateScale() {
          const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
          document.documentElement.style.setProperty("--deck-scale", String(scale));
        }

        function show(nextIndex, updateHash = true) {
          index = clamp(nextIndex);
          slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === index);
            slide.setAttribute("aria-hidden", String(slideIndex !== index));
          });
          if (counter) {
            counter.textContent = String(index + 1) + " / " + String(slides.length);
          }
          if (progress) {
            progress.style.setProperty("--deck-progress", String(((index + 1) / slides.length) * 100) + "%");
          }
          if (updateHash) {
            window.history.replaceState(null, "", "#slide-" + String(index + 1));
          }
        }

        function next() {
          show(index + 1);
        }

        function previous() {
          show(index - 1);
        }

        document.querySelector("[data-deck-next]")?.addEventListener("click", next);
        document.querySelector("[data-deck-prev]")?.addEventListener("click", previous);
        window.addEventListener("resize", updateScale);
        window.addEventListener("hashchange", () => show(readIndexFromHash(), false));
        window.addEventListener("keydown", (event) => {
          if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
            return;
          }
          if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) {
            event.preventDefault();
            next();
          }
          if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(event.key)) {
            event.preventDefault();
            previous();
          }
          if (event.key === "Home") {
            event.preventDefault();
            show(0);
          }
          if (event.key === "End") {
            event.preventDefault();
            show(slides.length - 1);
          }
          if (event.key.toLowerCase() === "f") {
            deck?.requestFullscreen?.();
          }
        });

        updateScale();
        show(index, window.location.hash !== "#slide-" + String(index + 1));
      })();
    </script>
  `;
}

function resolveSponsors(data: WelcomeDeckData): ResolvedSponsor[] {
  return data.sponsorUrls.map((sponsorUrl) => {
    const sponsor = data.sponsorCatalog[sponsorUrl];
    if (!sponsor) {
      throw new Error(`Sponsor "${sponsorUrl}" is missing from sponsorCatalog.`);
    }

    return sponsor;
  });
}
