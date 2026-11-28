import { displayValue, formatAddress, type ProfileAddress } from "@/lib/profile-display";
import type { Locale, Messages } from "@/lib/messages";
import { escapeHtml, loadBengaliFonts, renderHtmlToPdf } from "@/lib/pdf-browser";

type AlumniPdfRow = {
  fullName: string;
  registrationNumber?: string | null;
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
                  ${detail(m.registrationNumber, row.registrationNumber)}
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
  const fonts = await loadBengaliFonts();
  const html = htmlDocument(rows, fonts.regularBase64, fonts.boldBase64, m, lang);
  return renderHtmlToPdf(html, {
    format: "A4",
    margin: { top: "14mm", bottom: "14mm", left: "12mm", right: "12mm" },
  });
}
