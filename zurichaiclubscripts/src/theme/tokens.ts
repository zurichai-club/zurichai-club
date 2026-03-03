export const colors = {
  topBackground: "#e9878d",
  bottomBackground: "#e8c8cb",
  primary: "#111c87",
  accent: "#e61f24",
  darkText: "#101010",
  lightText: "#ffffff",
  cardGlass: "rgba(18, 18, 18, 0.46)",
  datePill: "rgba(255, 232, 235, 0.75)"
};

export const fonts = {
  heading: "'Space Grotesk', 'Avenir Next', 'Segoe UI', sans-serif",
  body: "'Manrope', 'Avenir Next', 'Segoe UI', sans-serif"
};

export function sharedCss(width: number, height: number): string {
  return `
    :root {
      --top-bg: ${colors.topBackground};
      --bottom-bg: ${colors.bottomBackground};
      --primary: ${colors.primary};
      --accent: ${colors.accent};
      --text-dark: ${colors.darkText};
      --text-light: ${colors.lightText};
      --card-glass: ${colors.cardGlass};
      --date-pill: ${colors.datePill};
      --font-heading: ${fonts.heading};
      --font-body: ${fonts.body};
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      width: ${width}px;
      height: ${height}px;
      background: transparent;
      font-family: var(--font-body);
    }
    .poster {
      width: ${width}px;
      height: ${height}px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(
        180deg,
        var(--top-bg) 0%,
        var(--top-bg) 59%,
        var(--bottom-bg) 59%,
        var(--bottom-bg) 100%
      );
      color: var(--text-light);
    }
    .brand {
      position: absolute;
      left: 52px;
      top: 48px;
      line-height: 0.94;
      z-index: 2;
    }
    .brand-title {
      font-family: var(--font-heading);
      font-weight: 800;
      font-size: 84px;
      letter-spacing: -0.03em;
      color: var(--primary);
    }
    .brand-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 14px 8px;
      margin-left: 10px;
      border-radius: 24px;
      background: var(--accent);
      color: #ff8f90;
      font-size: 0.88em;
      vertical-align: top;
    }
    .brand-url {
      margin-top: 24px;
      color: var(--accent);
      font-family: var(--font-heading);
      font-size: 56px;
      letter-spacing: 0.08em;
      font-weight: 800;
      text-transform: uppercase;
    }
    .date-pill {
      position: absolute;
      left: 0;
      border-radius: 0 44px 44px 0;
      background: var(--date-pill);
      color: var(--text-dark);
      display: flex;
      align-items: center;
      gap: 30px;
      font-family: var(--font-heading);
      font-size: 54px;
      font-weight: 800;
      padding: 28px 38px 28px 60px;
      letter-spacing: -0.01em;
    }
    .date-pill .date-icon {
      font-size: 32px;
      border: 4px solid rgba(17, 28, 135, 0.3);
      color: var(--primary);
      border-radius: 14px;
      padding: 8px 10px 9px;
      line-height: 1;
      font-weight: 900;
    }
    .sponsors {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 14px;
      color: var(--text-dark);
      z-index: 3;
    }
    .sponsors-label {
      font-family: var(--font-heading);
      font-size: 54px;
      font-weight: 800;
    }
    .sponsor-row {
      font-family: var(--font-heading);
      font-size: 52px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 14px;
      letter-spacing: -0.01em;
    }
    .sponsor-mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: rgba(17, 28, 135, 0.12);
      color: var(--primary);
      font-size: 26px;
      font-weight: 900;
    }
    .speaker-card {
      position: absolute;
      border-radius: 46px;
      overflow: hidden;
      box-shadow: 0 16px 56px rgba(0, 0, 0, 0.26);
      background: #d4a6a9;
      z-index: 2;
    }
    .speaker-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .speaker-overlay {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--card-glass);
      padding: 18px 24px 22px;
      color: var(--text-light);
      backdrop-filter: blur(2px);
    }
    .speaker-name {
      font-family: var(--font-heading);
      font-size: 56px;
      font-weight: 800;
      line-height: 1.02;
      letter-spacing: -0.01em;
      text-transform: uppercase;
    }
    .speaker-company {
      margin-top: 10px;
      font-family: var(--font-body);
      font-size: 48px;
      font-weight: 700;
      line-height: 1;
    }
  `;
}
