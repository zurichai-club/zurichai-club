import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import { inlineLocalImageUrls } from "./inlineLocalImageUrls";
import { isTemplateName, type TemplateName, renderPosterHtml } from "./renderPoster";

async function main(): Promise<void> {
  const templateArg = getArg("--template");
  const inputPath = getArg("--input");
  const outputPath = getArg("--output");
  const htmlDebugPath = getArg("--html-output");
  const width = Number(getArg("--width") ?? "1080");
  const height = Number(getArg("--height") ?? "1080");

  if (!templateArg || !inputPath || !outputPath) {
    printUsageAndExit();
  }
  if (!isTemplateName(templateArg)) {
    throw new Error("Invalid --template. Use single-speaker or all-speakers.");
  }
  const template: TemplateName = templateArg;

  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 300 || height < 300) {
    throw new Error("Invalid --width or --height. Use values >= 300.");
  }

  const rawInput = await readFile(path.resolve(inputPath), "utf8");
  const json = await inlineLocalImageUrls(JSON.parse(rawInput) as unknown);

  const html = renderPosterHtml(template, json, { width, height });

  if (htmlDebugPath) {
    await mkdir(path.dirname(path.resolve(htmlDebugPath)), { recursive: true });
    await writeFile(path.resolve(htmlDebugPath), html, "utf8");
  }

  await mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.setContent(html, { waitUntil: "networkidle" });
    const poster = page.locator(".poster");
    await poster.screenshot({ path: path.resolve(outputPath), type: "png" });
  } finally {
    await browser.close();
  }

  process.stdout.write(`Generated ${template} -> ${path.resolve(outputPath)}\n`);
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
    "Usage: tsx src/generate.ts --template <single-speaker|all-speakers> --input <json> --output <png> [--width 1080] [--height 1080] [--html-output ./debug.html]\n"
  );
  process.exit(1);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
