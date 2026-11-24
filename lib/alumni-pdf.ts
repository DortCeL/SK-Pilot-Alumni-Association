import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { displayValue, formatAddress, type ProfileAddress } from "@/lib/profile-display";
import type { Locale, Messages } from "@/lib/messages";

type AlumniPdfRow = {
  fullName: string;
  academicProgram?: string | null;
  group?: string | null;
  passingYear?: string | null;
  occupation?: string | null;
  designation?: string | null;
  organization?: string | null;
  officeAddress?: string | null;
  profilePhotoUrl?: string | null;
  mobilePhone?: string | null;
  whatsappPhone?: string | null;
  email?: string | null;
  address?: ProfileAddress | null;
};

const regularFont = path.join(process.cwd(), "fonts", "NotoSansBengali-Regular.ttf");
const boldFont = path.join(process.cwd(), "fonts", "NotoSansBengali-Bold.ttf");

const DEFAULT_CHROMIUM_PACK =
  "https://github.com/Sparticuz/chromium/releases/download/v153.0.0/chromium-v153.0.0-pack.x64.tar";

function localBrowserPath() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter((item): item is string => Boolean(item));
  const found = candidates.find((item) => existsSync(item));
  if (!found) {
    throw new Error(
      "Chrome or Edge is required locally. On Vercel, Chromium is downloaded automatically.",
    );
  }
  return found;
}

function useServerlessChromium() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

async function launchBrowser() {
  if (useServerlessChromium()) {
    const packUrl = process.env.CHROMIUM_PACK_URL || DEFAULT_CHROMIUM_PACK;
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(packUrl),
      headless: true,
    });
  }

  return puppeteer.launch({
    executablePath: localBrowserPath(),
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function occupationDesignation(occupation?: string | null, designation?: string | null) {
  const parts = [occupation, designation]
    .map((value) => (value ?? "").trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

function detail(label: string, value?: string | null) {
  return `<div class="detail">
    <span class="label">${escapeHtml(label)}</span>
    <span class="value">${escapeHtml(displayValue(value))}</span>
  </div>`;
}

function photoHtml(url: string | null | undefined, name: string) {
  if (url) {
    return `<img class="photo" src="${escapeHtml(url)}" alt="${escapeHtml(name)}" />`;
  }
  const initial = escapeHtml(name.trim().charAt(0) || "?");
  return `<div class="photo fallback">${initial}</div>`;
}

function htmlDocument(
  rows: AlumniPdfRow[],
  regularBase64: string,
  boldBase64: string,
  m: Messages,
  lang: Locale,
) {
  const people =
    rows.length === 0
      ? `<p class="empty">${escapeHtml(m.noneFound)}</p>`
      : rows
          .map((row, index) => {
            const roleLine = occupationDesignation(row.occupation, row.designation);
            return `<article class="person">
              <div class="left">
                ${photoHtml(row.profilePhotoUrl, row.fullName)}
                <div class="index">${index + 1}</div>
              </div>
              <div class="body">
                <h2>${escapeHtml(row.fullName)}</h2>
                <p class="role">${escapeHtml(roleLine)}</p>
                <div class="details">
                  ${detail(m.group, row.group)}
                  ${detail(m.passingYear, row.passingYear)}
                  ${detail(m.mobile, row.mobilePhone)}
                  ${detail(m.whatsapp, row.whatsappPhone || row.mobilePhone)}
                  ${detail(m.email, row.email)}
                  ${detail(m.organization, row.organization)}
                  ${detail(m.officeAddress, row.officeAddress)}
                  ${detail(m.addressSection, formatAddress(row.address, lang))}
                </div>
              </div>
            </article>`;
          })
          .join("");

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <style>
    @font-face {
      font-family: "Noto Sans Bengali";
      src: url("data:font/ttf;base64,${regularBase64}") format("truetype");
      font-weight: 400;
    }
    @font-face {
      font-family: "Noto Sans Bengali";
      src: url("data:font/ttf;base64,${boldBase64}") format("truetype");
      font-weight: 700;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #1a2e24;
      font-family: "Noto Sans Bengali", sans-serif;
      font-size: 11px;
      line-height: 1.45;
      background: #fff;
    }
    .header {
      padding: 0 0 16px;
      margin-bottom: 6px;
      border-bottom: 2px solid #0b3d2e;
    }
    .header .school {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #0b3d2e;
      letter-spacing: -0.01em;
    }
    .header .subtitle {
      margin: 4px 0 0;
      font-size: 12px;
      font-weight: 700;
      color: #14624a;
    }
    .header .meta {
      margin: 8px 0 0;
      font-size: 10px;
      color: #5a6f64;
    }
    .list { padding-top: 4px; }
    .person {
      display: flex;
      gap: 14px;
      break-inside: avoid;
      padding: 14px 0;
      border-bottom: 1px solid #e4ece7;
    }
    .person:last-child { border-bottom: none; }
    .left { position: relative; width: 56px; flex-shrink: 0; }
    .photo {
      width: 56px;
      height: 56px;
      border-radius: 999px;
      object-fit: cover;
      display: block;
      background: #e8f2ec;
    }
    .photo.fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0b3d2e;
      font-size: 20px;
      font-weight: 700;
    }
    .index {
      position: absolute;
      right: -2px;
      bottom: -2px;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      border-radius: 999px;
      background: #0b3d2e;
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .body { min-width: 0; flex: 1; }
    h2 {
      margin: 0;
      font-size: 14px;
      font-weight: 700;
      color: #0b3d2e;
    }
    .role {
      margin: 2px 0 8px;
      font-size: 11px;
      color: #14624a;
      font-weight: 400;
    }
    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3px 16px;
    }
    .detail {
      display: flex;
      gap: 6px;
      align-items: baseline;
      min-width: 0;
    }
    .label {
      flex-shrink: 0;
      color: #7a8f84;
      font-size: 10px;
    }
    .label::after { content: ":"; }
    .value {
      color: #1a2e24;
      word-break: break-word;
    }
    .empty { padding: 20px 0; color: #5a6f64; }
  </style>
</head>
<body>
  <header class="header">
    <p class="school">${escapeHtml(m.brand)}</p>
    <p class="subtitle">${escapeHtml(m.pdfSubtitle)}</p>
    <p class="meta">${escapeHtml(m.totalRegistered)}: ${rows.length} · ${escapeHtml(new Date().toLocaleDateString("en-GB"))}</p>
  </header>
  <div class="list">${people}</div>
</body>
</html>`;
}

export async function buildAlumniPdf(rows: AlumniPdfRow[], m: Messages, lang: Locale) {
  const [regular, bold] = await Promise.all([readFile(regularFont), readFile(boldFont)]);
  const html = htmlDocument(rows, regular.toString("base64"), bold.toString("base64"), m, lang);

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 15000 }).catch(() => undefined);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "14mm", bottom: "14mm", left: "12mm", right: "12mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
