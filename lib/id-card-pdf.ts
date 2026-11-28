import { displayValue } from "@/lib/profile-display";
import type { Locale, Messages } from "@/lib/messages";
import { escapeHtml, loadBengaliFonts, renderHtmlToPdf } from "@/lib/pdf-browser";

export type IdCardProfile = {
  fullName: string;
  registrationNumber?: string | null;
  group?: string | null;
  passingYear?: string | null;
  mobilePhone?: string | null;
  profilePhotoUrl?: string | null;
};

function photoHtml(url: string | null | undefined, name: string) {
  if (url) {
    return `<img class="photo" src="${escapeHtml(url)}" alt="${escapeHtml(name)}" />`;
  }
  const initial = escapeHtml(name.trim().charAt(0) || "?");
  return `<div class="photo fallback">${initial}</div>`;
}

function htmlDocument(
  profile: IdCardProfile,
  regularBase64: string,
  boldBase64: string,
  m: Messages,
  lang: Locale,
) {
  const meta = [displayValue(profile.group), displayValue(profile.passingYear)]
    .filter((value) => value !== "—")
    .join(" · ");
  const mobile =
    profile.mobilePhone && String(profile.mobilePhone).trim()
      ? String(profile.mobilePhone).trim()
      : "";

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
    html, body {
      margin: 0;
      padding: 0;
      width: 54mm;
      height: 86mm;
    }
    body {
      font-family: "Noto Sans Bengali", sans-serif;
      color: #0b3d2e;
      background: #0b3d2e;
    }
    .card {
      width: 54mm;
      height: 86mm;
      overflow: hidden;
      background:
        radial-gradient(120% 80% at 50% 0%, rgba(184, 137, 46, 0.22), transparent 55%),
        linear-gradient(165deg, #0b3d2e 0%, #14624a 48%, #0f4a38 100%);
      color: #fff;
      position: relative;
      display: flex;
      flex-direction: column;
    }
    .card::before {
      content: "";
      position: absolute;
      inset: 2.2mm;
      border: 0.35mm solid rgba(244, 234, 208, 0.55);
      border-radius: 2mm;
      pointer-events: none;
    }
    .top {
      padding: 5.5mm 4mm 3mm;
      text-align: center;
    }
    .school {
      margin: 0;
      font-size: 8.2px;
      font-weight: 700;
      line-height: 1.25;
      letter-spacing: 0.01em;
      color: #f4ead0;
    }
    .badge {
      margin: 2.2mm auto 0;
      display: inline-block;
      padding: 0.7mm 2.4mm;
      border-radius: 999px;
      background: rgba(244, 234, 208, 0.16);
      color: #f4ead0;
      font-size: 6.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .middle {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1mm 4mm 0;
    }
    .photo-ring {
      padding: 1.1mm;
      border-radius: 999px;
      background: linear-gradient(145deg, #f4ead0, #b8892e 55%, #8f6a1f);
      box-shadow: 0 2mm 4mm rgba(0, 0, 0, 0.22);
    }
    .photo {
      width: 28mm;
      height: 28mm;
      border-radius: 999px;
      object-fit: cover;
      display: block;
      background: #d5ebe1;
      border: 0.6mm solid #0b3d2e;
    }
    .photo.fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0b3d2e;
      font-size: 14mm;
      font-weight: 700;
    }
    .bottom {
      padding: 3mm 4mm 5mm;
      text-align: center;
    }
    .name {
      margin: 0;
      font-size: 11.5px;
      font-weight: 700;
      line-height: 1.25;
      color: #ffffff;
    }
    .reg {
      margin: 1.8mm 0 0;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #f4ead0;
    }
    .meta {
      margin: 1.2mm 0 0;
      font-size: 7.2px;
      color: rgba(244, 234, 208, 0.9);
      letter-spacing: 0.02em;
    }
    .phone {
      margin: 1mm 0 0;
      font-size: 7.4px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: rgba(255, 255, 255, 0.92);
    }
    .rule {
      width: 14mm;
      height: 0.35mm;
      margin: 2.2mm auto 0;
      background: linear-gradient(90deg, transparent, #b8892e, transparent);
    }
  </style>
</head>
<body>
  <article class="card">
    <div class="top">
      <p class="school">${escapeHtml(m.brand)}</p>
      <span class="badge">${escapeHtml(m.pdfSubtitle)}</span>
    </div>
    <div class="middle">
      <div class="photo-ring">
        ${photoHtml(profile.profilePhotoUrl, profile.fullName)}
      </div>
    </div>
    <div class="bottom">
      <h1 class="name">${escapeHtml(profile.fullName)}</h1>
      ${
        profile.registrationNumber
          ? `<p class="reg">${escapeHtml(profile.registrationNumber)}</p>`
          : ""
      }
      ${meta ? `<p class="meta">${escapeHtml(meta)}</p>` : ""}
      ${mobile ? `<p class="phone">${escapeHtml(mobile)}</p>` : ""}
      <div class="rule"></div>
    </div>
  </article>
</body>
</html>`;
}

export async function buildIdCardPdf(profile: IdCardProfile, m: Messages, lang: Locale) {
  const fonts = await loadBengaliFonts();
  const html = htmlDocument(profile, fonts.regularBase64, fonts.boldBase64, m, lang);
  return renderHtmlToPdf(html, {
    width: "54mm",
    height: "86mm",
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
  });
}
