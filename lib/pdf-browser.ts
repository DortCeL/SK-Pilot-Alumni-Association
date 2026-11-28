import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";

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

export async function launchPdfBrowser() {
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

export async function loadBengaliFonts() {
  const [regular, bold] = await Promise.all([readFile(regularFont), readFile(boldFont)]);
  return {
    regularBase64: regular.toString("base64"),
    boldBase64: bold.toString("base64"),
  };
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function renderHtmlToPdf(
  html: string,
  options: {
    width?: string;
    height?: string;
    format?: "A4";
    margin?: { top: string; bottom: string; left: string; right: string };
  },
) {
  const browser = await launchPdfBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 15000 }).catch(() => undefined);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const pdf = await page.pdf({
      printBackground: true,
      ...options,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
