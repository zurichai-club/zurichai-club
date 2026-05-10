import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const IMAGE_FIELD_NAMES = new Set(["photoUrl", "logoUrl"]);

const MIME_TYPES: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

export async function inlineLocalImageUrls(input: unknown, cwd = process.cwd()): Promise<unknown> {
  return transformValue(input, cwd);
}

async function transformValue(value: unknown, cwd: string, key?: string): Promise<unknown> {
  if (typeof value === "string" && key && IMAGE_FIELD_NAMES.has(key)) {
    return inlineImageValue(value, cwd);
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map((item) => transformValue(item, cwd)));
  }

  if (value && typeof value === "object") {
    const entries = await Promise.all(
      Object.entries(value).map(async ([entryKey, entryValue]) => {
        return [entryKey, await transformValue(entryValue, cwd, entryKey)] as const;
      })
    );

    return Object.fromEntries(entries);
  }

  return value;
}

async function inlineImageValue(value: string, cwd: string): Promise<string> {
  const trimmed = value.trim();
  if (trimmed === "" || isRemoteImageReference(trimmed)) {
    return value;
  }

  const filePath = toFilePath(trimmed, cwd);
  if (!filePath) {
    return value;
  }

  const extension = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[extension];
  if (!mimeType) {
    return value;
  }

  try {
    const bytes = await readFile(filePath);
    return `data:${mimeType};base64,${bytes.toString("base64")}`;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Unable to read local image "${value}" (${filePath}): ${error.message}`);
    }

    throw error;
  }
}

function isRemoteImageReference(value: string): boolean {
  return /^(https?:|data:|blob:)/i.test(value);
}

function toFilePath(value: string, cwd: string): string | null {
  if (value.startsWith("file://")) {
    return fileURLToPath(value);
  }

  if (path.isAbsolute(value)) {
    return value;
  }

  return path.resolve(cwd, value);
}
