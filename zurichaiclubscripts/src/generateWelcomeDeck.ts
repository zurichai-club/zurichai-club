import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { inlineLocalImageUrls } from "./inlineLocalImageUrls";
import { welcomeDeckSchema, type WelcomeDeckData } from "./schemas";
import { renderWelcomeDeckTemplate } from "./templates/welcomeDeck";

const execFileAsync = promisify(execFile);

async function main(): Promise<void> {
  const inputPath = getArg("--input");
  const outputPath = getArg("--output");
  const width = Number(getArg("--width") ?? "1920");
  const height = Number(getArg("--height") ?? "1080");

  if (!inputPath || !outputPath) {
    printUsageAndExit();
  }
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 800 || height < 450) {
    throw new Error("Invalid --width or --height. Use 16:9-ish values >= 800x450.");
  }

  const data = await loadWelcomeDeckData(path.resolve(inputPath));
  const html = renderWelcomeDeckTemplate(data, { width, height });

  await mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });
  await writeFile(path.resolve(outputPath), html, "utf8");
  process.stdout.write(`Generated welcome deck HTML -> ${path.resolve(outputPath)}\n`);
}

async function loadWelcomeDeckData(inputPath: string): Promise<WelcomeDeckData> {
  const rawInput = JSON.parse(await readFile(inputPath, "utf8")) as Record<string, unknown>;
  const catalogPath = typeof rawInput.sponsorCatalogPath === "string" ? rawInput.sponsorCatalogPath : undefined;

  if (catalogPath) {
    const rawCatalog = JSON.parse(await readFile(path.resolve(process.cwd(), catalogPath), "utf8")) as Record<
      string,
      unknown
    >;
    rawInput.sponsorCatalog = {
      ...rawCatalog,
      ...(typeof rawInput.sponsorCatalog === "object" && rawInput.sponsorCatalog ? rawInput.sponsorCatalog : {})
    };
  }

  await addGeneratedQrImages(rawInput);

  const inlinedInput = await inlineLocalImageUrls(rawInput);
  return welcomeDeckSchema.parse(inlinedInput);
}

async function addGeneratedQrImages(rawInput: Record<string, unknown>): Promise<void> {
  const qrSlides = Array.isArray(rawInput.qrSlides) ? rawInput.qrSlides : [];

  rawInput.qrSlides = await Promise.all(
    qrSlides.map(async (slide) => {
      if (!slide || typeof slide !== "object" || Array.isArray(slide)) {
        return slide;
      }

      const qrSlide = slide as Record<string, unknown>;
      if (typeof qrSlide.qrImageUrl === "string" && qrSlide.qrImageUrl.trim() !== "") {
        return qrSlide;
      }
      if (typeof qrSlide.url !== "string" || qrSlide.url.trim() === "") {
        return qrSlide;
      }

      return {
        ...qrSlide,
        qrImageUrl: await generateQrSvgDataUrl(qrSlide.url)
      };
    })
  );

  const aboutMeetup = rawInput.aboutMeetup;
  if (!aboutMeetup || typeof aboutMeetup !== "object" || Array.isArray(aboutMeetup)) {
    return;
  }

  const about = aboutMeetup as Record<string, unknown>;
  if (!Array.isArray(about.founders)) {
    return;
  }

  about.founders = await Promise.all(
    about.founders.map(async (founder) => {
      if (!founder || typeof founder !== "object" || Array.isArray(founder)) {
        return founder;
      }

      const founderData = founder as Record<string, unknown>;
      if (typeof founderData.qrImageUrl === "string" && founderData.qrImageUrl.trim() !== "") {
        return founderData;
      }

      const contactUrl =
        typeof founderData.contactUrl === "string" && founderData.contactUrl.trim() !== ""
          ? founderData.contactUrl
          : typeof founderData.email === "string" && founderData.email.trim() !== ""
            ? `mailto:${founderData.email}`
            : undefined;

      if (!contactUrl) {
        return founderData;
      }

      return {
        ...founderData,
        contactUrl,
        qrImageUrl: await generateQrSvgDataUrl(contactUrl)
      };
    })
  );
}

async function generateQrSvgDataUrl(value: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync(
      "qrencode",
      [
        "--type=SVG",
        "--inline",
        "--svg-path",
        "--level=H",
        "--margin=2",
        "--output=-",
        value
      ],
      {
        encoding: "utf8",
        maxBuffer: 2 * 1024 * 1024
      }
    );

    return `data:image/svg+xml;base64,${Buffer.from(stdout, "utf8").toString("base64")}`;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Unable to generate QR code for "${value}": ${error.message}`);
    }

    throw error;
  }
}

function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function printUsageAndExit(): never {
  process.stderr.write(
    "Usage: tsx src/generateWelcomeDeck.ts --input <json> --output <html> [--width 1920] [--height 1080]\n"
  );
  process.exit(1);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
