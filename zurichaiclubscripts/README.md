# ZurichAI Poster Generator (MVP)

Starter project for generating consistent ZurichAI-style LinkedIn posters from JSON data.

Included templates:
- `single-speaker`: one person announcement
- `all-speakers`: lineup card for 2-4 speakers

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
- `speakers[]` (`name`, `company`, `photoUrl`)
- `sponsors[]`

## Notes

- Current templates are intentionally strict to keep brand consistency.
- To create variants, duplicate template files and adjust layout constants only.
- `photoUrl` and `logoUrl` accept hosted URLs, `file://` URLs, absolute paths, and repo-relative local image paths such as `data/2605/Firas_Cheaib.jpg`.
