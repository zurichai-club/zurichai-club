# ZurichAI Poster Generator (MVP)

Starter project for generating consistent ZurichAI-style LinkedIn posters from JSON data.

Included templates:
- `single-speaker`: one person announcement
- `all-speakers`: lineup card for 2-4 speakers
- `welcome-deck`: fullscreen 16:9 HTML deck with a welcome slide and one intro slide per speaker

## Quick start

1. Install dependencies:

```bash
npm install
npx playwright install chromium
```

2. Generate both sample posters:

```bash
npm run generate
```

Outputs are written to `exports/`.

3. Run visual preview app (overview + export):

```bash
npm run preview
```

Then open `http://localhost:4173`.

## Commands

Generate single speaker:

```bash
npm run generate:single
```

Generate all speakers:

```bash
npm run generate:all
```

Generate the fullscreen HTML welcome deck:

```bash
npm run generate:welcome-deck
```

This uses `data/welcome-deck.example.json`, which contains only placeholder example content and inline SVG images.

Custom command:

```bash
npx tsx src/generate.ts \
  --template single-speaker \
  --input data/single-speaker.example.json \
  --output exports/custom-single.png \
  --width 1080 \
  --height 1080 \
  --html-output exports/custom-single.html
```

## Visual preview workflow

- Pick template (`single-speaker` or `all-speakers`)
- Edit JSON in the left panel
- Click `Preview` to update the live overview pane
- Click `Export PNG` to download final image

## Data shape

`single-speaker`:
- `meetupTitle`
- `meetupUrl`
- `eventDateLabel`
- `eventTimeLabel`
- `ctaLabel`
- `speaker.name`
- `speaker.company`
- `speaker.talkTitle`
- `speaker.photoUrl`
- `sponsors[]`

`all-speakers`:
- `meetupTitle`
- `meetupUrl`
- `eventDateLabel`
- `eventTimeLabel`
- `eventHeadline`
- `eventSubheadline`
- `eventLocationLabel` (optional)
- `speakers[]` (`name`, `company`, `photoUrl`)
- `sponsors[]`

`welcome-deck`:
- `eventTitle`
- `eventSubtitle` (optional)
- `sponsorCatalogPath` or inline `sponsorCatalog`
- `sponsorUrls[]` (URLs looked up in the sponsor catalog)
- `aboutMeetup` optional about/founders slides (`title`, `details[]`, `foundersTitle`, `founders[]`)
- `aboutMeetup.founders[]` (`name`, `role`, `email`, `photoUrl`, `contactUrl` optional, `qrImageUrl` optional)
- `qrSlides[]` optional dynamic QR slides (`title`, `subtitle` optional, `url`, `caption` optional, `placement` optional, `qrImageUrl` optional)
- `speakers[]` (`name`, `company`, `photoUrl`, `talkTitle` optional)

## Notes

- Current templates are intentionally strict to keep brand consistency.
- To create variants, duplicate template files and adjust layout constants only.
- `photoUrl` and `logoUrl` accept hosted URLs, `file://` URLs, absolute paths, repo-relative local image paths, and inline `data:` URLs as shown in `data/welcome-deck.example.json`.
- Welcome deck QR slides are generated from their configured `url` values with the local `qrencode` CLI when `qrImageUrl` is omitted. Founder contact QR codes are generated from `contactUrl`, or from `email` as a `mailto:` link when `contactUrl` is omitted.
- The generated welcome deck HTML is presentation-ready: use arrow keys, Page Up/Down, space, Home/End, and `f` for fullscreen.
