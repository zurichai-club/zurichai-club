import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import { inlineLocalImageUrls } from "./inlineLocalImageUrls";
import { isTemplateName, type TemplateName, renderPosterHtml } from "./renderPoster";

type PreviewPayload = {
  template: string;
  width: number;
  height: number;
  data: unknown;
};

type TemplateExamples = Record<TemplateName, unknown>;

const DEFAULT_PORT = 4173;

async function main(): Promise<void> {
  const examples = await loadExamples();
  const portArg = Number(process.argv[2]);
  const port = Number.isFinite(portArg) && portArg > 0 ? portArg : DEFAULT_PORT;

  const server = createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/") {
        sendHtml(res, previewPage(examples));
        return;
      }

      if (req.method === "POST" && req.url === "/api/render") {
        const payload = await readJsonBody<PreviewPayload>(req);
        const { template, width, height, data } = normalizePayload(payload);
        const html = renderPosterHtml(template, await inlineLocalImageUrls(data), { width, height });
        sendJson(res, 200, { html });
        return;
      }

      if (req.method === "POST" && req.url === "/api/export") {
        const payload = await readJsonBody<PreviewPayload>(req);
        const { template, width, height, data } = normalizePayload(payload);
        const html = renderPosterHtml(template, await inlineLocalImageUrls(data), {
          width,
          height
        });
        const pngBuffer = await renderPng(html, width, height);
        const filename = `${template}-${Date.now()}.png`;

        res.writeHead(200, {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store"
        });
        res.end(pngBuffer);
        return;
      }

      sendJson(res, 404, { error: "Not found" });
    } catch (error: unknown) {
      sendJson(res, 400, { error: error instanceof Error ? error.message : String(error) });
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(port, resolve);
  });

  process.stdout.write(`Preview running: http://localhost:${port}\n`);
}

async function loadExamples(): Promise<TemplateExamples> {
  const cwd = process.cwd();
  const single = await readFile(path.resolve(cwd, "data/single-speaker.example.json"), "utf8");
  const all = await readFile(path.resolve(cwd, "data/all-speakers.example.json"), "utf8");
  const announcement = await readFile(path.resolve(cwd, "data/announcement.json"), "utf8");

  return {
    "single-speaker": JSON.parse(single) as unknown,
    "all-speakers": JSON.parse(all) as unknown,
    "announcement": JSON.parse(announcement) as unknown
  };
}

function normalizePayload(payload: PreviewPayload): {
  template: TemplateName;
  width: number;
  height: number;
  data: unknown;
} {
  if (!isTemplateName(payload.template)) {
    throw new Error("Invalid template. Use single-speaker or all-speakers.");
  }
  if (!Number.isFinite(payload.width) || payload.width < 300) {
    throw new Error("Width must be >= 300.");
  }
  if (!Number.isFinite(payload.height) || payload.height < 300) {
    throw new Error("Height must be >= 300.");
  }

  return {
    template: payload.template,
    width: payload.width,
    height: payload.height,
    data: payload.data
  };
}

async function renderPng(html: string, width: number, height: number): Promise<Buffer> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.setContent(html, { waitUntil: "networkidle" });
    const poster = page.locator(".poster");
    return await poster.screenshot({ type: "png" });
  } finally {
    await browser.close();
  }
}

function previewPage(examples: TemplateExamples): string {
  const safeExamples = JSON.stringify(examples).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ZurichAI Poster Studio</title>
    <style>
      :root {
        --bg: #f7f2f3;
        --panel: #ffffff;
        --ink: #111111;
        --muted: #5d5d66;
        --line: #d9d0d2;
        --brand-blue: #111c87;
        --brand-red: #e61f24;
      }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        font-family: "Space Grotesk", "Avenir Next", "Segoe UI", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at 8% 6%, #f8d0d2 0 24%, transparent 25%),
          radial-gradient(circle at 100% 100%, #e2e6fd 0 20%, transparent 21%),
          var(--bg);
        min-height: 100vh;
      }
      .layout {
        display: grid;
        grid-template-columns: 360px minmax(480px, 1fr);
        gap: 18px;
        padding: 18px;
      }
      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 18px;
        box-shadow: 0 12px 36px rgba(35, 20, 22, 0.08);
      }
      .controls {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .title {
        margin: 0;
        font-size: 25px;
        line-height: 1;
        color: var(--brand-blue);
        letter-spacing: -0.02em;
      }
      .subtitle {
        margin: 0;
        font-size: 14px;
        line-height: 1.35;
        color: var(--muted);
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--muted);
        font-weight: 700;
      }
      .row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      select, input, textarea, button {
        font: inherit;
      }
      select, input {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 14px;
        color: var(--ink);
        background: #fff;
      }
      textarea {
        width: 100%;
        min-height: 340px;
        resize: vertical;
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 12px;
        font-size: 12px;
        line-height: 1.4;
        font-family: "SFMono-Regular", Menlo, Monaco, Consolas, monospace;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      button {
        border: 0;
        border-radius: 11px;
        padding: 11px 14px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
      }
      .btn-preview {
        background: var(--brand-blue);
        color: #fff;
      }
      .btn-export {
        background: var(--brand-red);
        color: #fff;
      }
      .btn-load {
        border: 1px solid var(--line);
        background: #fff;
        color: var(--ink);
      }
      .status {
        margin: 0;
        min-height: 20px;
        font-size: 13px;
        color: var(--muted);
      }
      .preview {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .preview-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .preview-head h2 {
        margin: 0;
        font-size: 16px;
        color: #242430;
      }
      .frame-wrap {
        background: #f0ebec;
        border: 1px solid #e4dadd;
        border-radius: 14px;
        min-height: 630px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
        overflow: auto;
      }
      iframe {
        border: 0;
        background: #fff;
        width: 100%;
        max-width: 100%;
      }
      @media (max-width: 1100px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main class="layout">
      <section class="panel controls">
        <h1 class="title">Poster Studio</h1>
        <p class="subtitle">Preview and export ZurichAI templates before generating final assets.</p>

        <label>
          Template
          <select id="template">
            <option value="single-speaker">Single speaker announcement</option>
            <option value="all-speakers">All speakers lineup</option>
            <option value="announcement">Event announcement</option>
          </select>
        </label>

        <div class="row">
          <label>
            Width
            <input id="width" type="number" min="300" value="1080" />
          </label>
          <label>
            Height
            <input id="height" type="number" min="300" value="1080" />
          </label>
        </div>

        <label>
          Data (JSON)
          <textarea id="json"></textarea>
        </label>

        <div class="actions">
          <button class="btn-load" id="loadExample">Load example</button>
          <button class="btn-preview" id="previewBtn">Preview</button>
          <button class="btn-export" id="exportBtn">Export PNG</button>
        </div>

        <p class="status" id="status"></p>
      </section>

      <section class="panel preview">
        <div class="preview-head">
          <h2>Overview</h2>
        </div>
        <div class="frame-wrap">
          <iframe id="previewFrame" title="Poster preview"></iframe>
        </div>
      </section>
    </main>

    <script>
      const examples = ${safeExamples};
      const templateEl = document.getElementById("template");
      const widthEl = document.getElementById("width");
      const heightEl = document.getElementById("height");
      const jsonEl = document.getElementById("json");
      const statusEl = document.getElementById("status");
      const frameEl = document.getElementById("previewFrame");
      const loadBtn = document.getElementById("loadExample");
      const previewBtn = document.getElementById("previewBtn");
      const exportBtn = document.getElementById("exportBtn");

      function setStatus(text, isError = false) {
        statusEl.textContent = text;
        statusEl.style.color = isError ? "#b00020" : "#50526b";
      }

      function currentTemplate() {
        return templateEl.value;
      }

      function loadExample() {
        const sample = examples[currentTemplate()];
        jsonEl.value = JSON.stringify(sample, null, 2);
      }

      async function renderPreview() {
        try {
          const payload = {
            template: currentTemplate(),
            width: Number(widthEl.value),
            height: Number(heightEl.value),
            data: JSON.parse(jsonEl.value)
          };

          setStatus("Rendering preview...");
          const response = await fetch("/api/render", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || "Preview request failed.");
          }

          frameEl.width = String(payload.width);
          frameEl.height = String(payload.height);
          frameEl.srcdoc = result.html;
          setStatus("Preview updated.");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      }

      async function exportPng() {
        try {
          const payload = {
            template: currentTemplate(),
            width: Number(widthEl.value),
            height: Number(heightEl.value),
            data: JSON.parse(jsonEl.value)
          };

          setStatus("Exporting PNG...");
          const response = await fetch("/api/export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Export failed.");
          }

          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = payload.template + ".png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
          setStatus("PNG exported.");
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error), true);
        }
      }

      loadBtn.addEventListener("click", () => {
        loadExample();
        renderPreview();
      });
      templateEl.addEventListener("change", () => {
        loadExample();
        renderPreview();
      });
      previewBtn.addEventListener("click", renderPreview);
      exportBtn.addEventListener("click", exportPng);

      loadExample();
      renderPreview();
    </script>
  </body>
</html>`;
}

function sendHtml(res: ServerResponse, html: string): void {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(html);
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    throw new Error("Missing JSON body.");
  }

  const text = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(text) as T;
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
