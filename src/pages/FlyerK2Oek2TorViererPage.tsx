/**
 * Vierer-Bogen A4: doppelseitig drucken, 4 gleiche Flyer pro Seite.
 * Optional: Hinweisnotiz zur Eventeröffnung unten rechts (eigenes Feld, Signalfarbe; umschaltbar, Text in localStorage).
 * URL (einmalig): ?eventHinweis=1 & ehh=… & eht=… (Kurz: eh, eventHinweisHeadline, eventHinweisText).
 * Vorderseite: Galerienamen + „Kunst & Keramik“ (K2-Stammdaten), Einladung, Foto, Adresse, QR – keine kgm-Werbeslogans.
 * Rückseite: ök2 Eingangstor – wie /entdecken: Farben aus K2-Design, Tor-Bild wie EntdeckenPage (Pfad + IndexedDB-Overlay), K2-Slogans groß, Werbetext klein darunter, QR /entdecken.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode'
import {
  BASE_APP_URL,
  BENUTZER_HANDBUCH_ROUTE,
  OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE,
  PROJECT_ROUTES,
} from '../config/navigation'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import { getGalerieImages } from '../config/pageContentGalerie'
import { getPageTexts } from '../config/pageTexts'
import {
  K2_STAMMDATEN_DEFAULTS,
  MUSTER_TEXTE,
  PRODUCT_BRAND_NAME,
  PRODUCT_COPYRIGHT_BRAND_ONLY,
  PRODUCT_URHEBER_ANWENDUNG,
  PRODUCT_WERBESLOGAN,
  PRODUCT_WERBESLOGAN_2,
  TENANT_CONFIGS,
} from '../config/tenantConfig'
import {
  getEntdeckenColorsFromK2Design,
  getEntdeckenHeroPathUrl,
  getPageContentEntdecken,
} from '../config/pageContentEntdecken'
import { loadEntdeckenHeroOverlayIfFresh } from '../utils/entdeckenHeroOverlayStorage'
import { compressImageForStorage } from '../utils/compressImageForStorage'
import {
  clearAllFlyerViererFileSlots,
  loadFlyerViererFileSlot,
  saveFlyerViererFileSlot,
} from '../utils/flyerViererFileStorage'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { readArtworksForContextWithResolvedImages } from '../utils/artworksStorage'

const ROOT = 'flyer-k2-oek2-vierer'
/** Manuelle Bild-URLs (leer = aus K2/Galerie). Persistiert für nächsten Besuch. */
const FLYER_IMG_OVERRIDES_KEY = 'k2-flyer-vierer-image-overrides'
/** Option „Event-Hinweis“ unten rechts auf jedem Streifen (wiederverwendbarer Bogen). */
const FLYER_EVENT_HINWEIS_KEY = 'k2-flyer-vierer-event-hinweis'
type FlyerImgOverrides = {
  /** Linkes Streifenfoto: Bild-URL zum gewählten Werk (wie rechts). */
  leftWerk?: string
  welcome?: string
  /** Rechtes Streifenfoto */
  werk?: string
  tor?: string
  /** Alt: wurde zu leftWerk migriert */
  card?: string
}

function migrateFlyerOverrides(raw: FlyerImgOverrides): FlyerImgOverrides {
  const o = { ...raw }
  const cardT = o.card?.trim()
  if (cardT && !o.leftWerk?.trim()) o.leftWerk = cardT
  delete o.card
  return o
}

function werkNumberFromOverrideUrl(
  choices: Array<{ number: string; imageUrl: string }>,
  overrideUrl: string | undefined,
  fallbackUrl: string
): string {
  const o = overrideUrl?.trim()
  const eff = o || fallbackUrl
  const hit = choices.find((c) => c.imageUrl === eff)
  return hit?.number ?? ''
}
const TEAL_DARK = '#0c5c55'
const TEAL = '#0f766e'
const TEAL_LIGHT = '#0d9488'
/** Lesbare Serif für Galerie-Titel (ohne Webfont-Request – druckt überall gleich). */
const FONT_SERIF = "Georgia, 'Times New Roman', Times, serif"
const FONT_SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif"
/** Unter den K2-Werbeslogans: prägnant Software, Sparten, VK2 (ök2 nur im QR-Bereich). */
const FLYER_RUECKSEITE_WERBETEXT =
  'Ihre Galerie-Software: Sparten und Werke, Galerie und Kasse — Kunstvereine mit VK2. Scannen und als Gast durchklicken.'

const styles = `
  .${ROOT} { font-family: ${FONT_SANS}; background: linear-gradient(180deg, #f0ebe4 0%, #e5e0d8 100%); padding: 16px; margin: 0; box-sizing: border-box; min-height: 100vh; }
  .${ROOT} * { box-sizing: border-box; }
  .${ROOT} .flyer-vierer-toolbar { max-width: 720px; margin: 0 auto 16px; padding: 0.75rem 0; border-bottom: 1px solid ${TEAL_LIGHT}40; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; font-size: 0.85rem; color: #1c1a18; }
  .${ROOT} .flyer-print-hint {
    max-width: 720px; margin: -8px auto 14px; padding: 10px 12px; background: #fff8f0; border: 1px solid #d4a574;
    border-radius: 8px; font-size: 0.78rem; color: #3d3835; line-height: 1.45;
  }
  .${ROOT} .flyer-print-hint strong { color: #1c1a18; }
  .${ROOT} .flyer-img-panel {
    max-width: 720px; margin: 0 auto 16px; padding: 12px 14px; background: #fffefb; border: 1px solid rgba(15,118,110,0.22);
    border-radius: 10px; font-size: 0.82rem; color: #1c1a18;
  }
  .${ROOT} .flyer-img-panel h2 { margin: 0 0 8px; font-size: 0.95rem; color: ${TEAL}; font-weight: 600; }
  .${ROOT} .flyer-img-panel .row { display: grid; grid-template-columns: 140px 1fr; gap: 6px 10px; align-items: center; margin-bottom: 8px; }
  .${ROOT} .flyer-img-panel label { color: #5c5650; font-weight: 500; }
  .${ROOT} .flyer-img-panel input[type="text"] {
    width: 100%; padding: 6px 8px; border: 1px solid #d4cfc7; border-radius: 6px; font-size: 0.8rem; color: #1c1a18;
  }
  .${ROOT} .flyer-img-panel select {
    width: 100%; padding: 6px 8px; border: 1px solid #d4cfc7; border-radius: 6px; font-size: 0.8rem; color: #1c1a18;
  }
  .${ROOT} .flyer-img-panel .btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
  .${ROOT} .flyer-img-panel .file-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 6px; }
  .${ROOT} .flyer-img-panel .file-row button {
    padding: 6px 10px; border-radius: 6px; font-size: 0.78rem; cursor: pointer; font-weight: 500;
    background: #f0fdfa; color: ${TEAL}; border: 1px solid ${TEAL_LIGHT}55;
  }
  .${ROOT} .flyer-img-panel .file-row button.danger { background: #fff; color: #8b4513; border-color: #d4a574; }
  .${ROOT} .flyer-img-panel .file-thumb { width: 44px; height: 44px; object-fit: cover; border-radius: 6px; border: 1px solid #d4cfc7; }
  .${ROOT} .flyer-img-panel .hint { margin: 8px 0 0; font-size: 0.78rem; color: #5c5650; line-height: 1.45; }
  .${ROOT} .flyer-img-panel .flyer-panel-preview {
    margin-top: 12px; margin-bottom: 14px; padding: 12px 12px 14px; background: #faf8f5; border: 1px solid #e5e0d8; border-radius: 10px;
  }
  .${ROOT} .flyer-img-panel .flyer-panel-preview > h3 { margin: 0 0 4px; font-size: 0.88rem; font-weight: 600; color: #1c1a18; }
  .${ROOT} .flyer-img-panel .flyer-panel-preview > .flyer-panel-preview-lead { margin: 0 0 10px; font-size: 0.74rem; color: #5c5650; line-height: 1.4; }
  .${ROOT} .flyer-img-panel .flyer-panel-preview-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  @media (max-width: 700px) {
    .${ROOT} .flyer-img-panel .flyer-panel-preview-grid { grid-template-columns: repeat(2, 1fr); }
  }
  .${ROOT} .flyer-img-panel .flyer-panel-thumb-slot { min-width: 0; }
  .${ROOT} .flyer-img-panel .flyer-panel-thumb-frame {
    aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: #e8e4dd; border: 1px solid #d4cfc7;
    display: flex; align-items: center; justify-content: center;
  }
  .${ROOT} .flyer-img-panel .flyer-panel-thumb-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .${ROOT} .flyer-img-panel .flyer-panel-thumb-placeholder {
    font-size: 0.7rem; color: #5c5650; text-align: center; padding: 10px 8px; line-height: 1.35;
  }
  .${ROOT} .flyer-img-panel .flyer-panel-thumb-cap { margin-top: 6px; font-size: 0.76rem; font-weight: 600; color: #1c1a18; }
  .${ROOT} .flyer-img-panel .flyer-panel-thumb-sub { margin-top: 2px; font-size: 0.68rem; color: #5c5650; line-height: 1.35; }
  .${ROOT} .flyer-img-panel .flyer-load-banner {
    margin: 0 0 10px; padding: 8px 10px; background: rgba(13,148,136,0.08); border: 1px solid rgba(13,148,136,0.22);
    border-radius: 8px; font-size: 0.78rem; color: #0f766e; font-weight: 500;
  }
  .${ROOT} .sheet { width: 210mm; height: 297mm; margin: 0 auto 24px; background: #fff; box-shadow: 0 8px 32px rgba(0,0,0,0.07); display: flex; flex-direction: column; overflow: hidden; }
  .${ROOT} .cell { flex: 1 1 0; min-height: 0; border-bottom: 1px dashed rgba(28,26,24,0.12); display: flex; flex-direction: column; padding: 2.5mm 3.5mm; }
  .${ROOT} .cell:last-child { border-bottom: none; }

  /* —— Vorderseite: editorial, viel Luft, kein „Excel-Kasten“ —— */
  .${ROOT} .cell-front {
    background: #fdfcfa;
    background-image: linear-gradient(180deg, #fffefb 0%, #f7f4ef 100%);
  }
  /* Event-Hinweis: eigenes Feld unten rechts (nicht in der QR-Zeile) */
  .${ROOT} .cell-front .front-bottom {
    margin-top: 1.5mm;
    padding-top: 1.5mm;
    border-top: 1px solid rgba(12,92,85,0.12);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1.2mm;
    flex-shrink: 0;
    min-height: 0;
  }
  .${ROOT} .cell-front .front-event-corner {
    align-self: flex-end;
    max-width: 46mm;
    min-width: 0;
    margin: 0;
    padding: 1.1mm 1.4mm;
    background: rgba(255, 254, 251, 0.95);
    border: 1px solid rgba(181, 74, 30, 0.38);
    border-radius: 1.5mm;
    box-shadow: 0 0.4mm 1.2mm rgba(28, 26, 24, 0.06);
    text-align: left;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .${ROOT} .cell-front .front-event-corner .front-event-head {
    margin: 0 0 0.35mm;
    font-size: 7pt;
    font-weight: 700;
    color: #b54a1e;
    line-height: 1.15;
    font-family: ${FONT_SANS};
  }
  .${ROOT} .cell-front .front-event-corner .front-event-body {
    margin: 0;
    font-size: 6pt;
    line-height: 1.25;
    color: #9a3412;
    white-space: pre-wrap;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .${ROOT} .cell-front .front-top {
    display: flex; align-items: stretch; gap: 2.5mm; margin: 0 0 2mm 0; min-height: 0;
  }
  .${ROOT} .cell-front .front-accent { width: 0.9mm; flex-shrink: 0; border-radius: 1mm; background: linear-gradient(180deg, ${TEAL_DARK} 0%, ${TEAL} 100%); }
  .${ROOT} .cell-front .front-head { flex: 1; min-width: 0; text-align: left; padding: 0.5mm 0 0 0; }
  .${ROOT} .cell-front .front-head h2 {
    margin: 0; font-family: ${FONT_SERIF}; font-size: 12pt; font-weight: 700; color: #1a1816; letter-spacing: -0.02em; line-height: 1.12;
  }
  .${ROOT} .cell-front .front-head .sub {
    margin: 0.8mm 0 0; font-size: 7.2pt; color: #5c5650; font-weight: 500;
  }
  .${ROOT} .cell-front .front-main {
    flex: 1; display: flex; gap: 2.5mm; min-height: 0; align-items: stretch;
  }
  .${ROOT} .cell-front .thumb-strip {
    flex: 0 0 50%; max-width: 50%; min-height: 0; align-self: stretch;
    display: flex; flex-direction: row; gap: 0; min-width: 0;
    align-items: stretch;
  }
  /* Drei gleich große Kacheln, Bild füllt die Fläche (kein Letterboxing). */
  .${ROOT} .cell-front .thumb-strip .thumb {
    flex: 1 1 0;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    position: relative;
    background: #e8e4dd;
  }
  .${ROOT} .cell-front .thumb-strip .thumb img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    object-position: center;
  }
  .${ROOT} .cell-front .text { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
  .${ROOT} .cell-front .intro {
    margin: 0; font-size: 8.2pt; line-height: 1.4; color: #2c2825; font-weight: 400;
  }
  .${ROOT} .cell-front .addr {
    margin: 1.5mm 0 0; font-size: 7pt; line-height: 1.4; color: #5c5650;
  }
  .${ROOT} .cell-front .front-kunst {
    margin: 1.5mm 0 0; padding-top: 1.5mm; border-top: 1px solid rgba(12,92,85,0.1);
    font-size: 7.5pt; font-weight: 700; color: ${TEAL_DARK}; letter-spacing: 0.06em; text-transform: uppercase;
    text-align: left;
  }
  .${ROOT} .cell-front .k2qr-row {
    margin: 0;
    padding: 0;
    border: none;
    display: flex; align-items: flex-start; gap: 2mm; flex-wrap: nowrap;
  }
  .${ROOT} .cell-front .k2qr {
    flex-shrink: 0; width: 17mm; height: 17mm; background: #fff; padding: 0.7mm;
    border-radius: 2mm; border: 1px solid rgba(12,92,85,0.18);
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .${ROOT} .cell-front .k2qr img { width: 100%; height: 100%; display: block; image-rendering: crisp-edges; }
  .${ROOT} .cell-front .k2qr-cap {
    font-size: 6.5pt; color: #3d3835; line-height: 1.3; flex: 1; min-width: 0; font-weight: 500;
  }
  .${ROOT} .cell-front .k2qr-cap .k2qr-cta { font-family: ${FONT_SERIF}; font-size: 7.2pt; color: ${TEAL_DARK}; display: block; margin-bottom: 0.3mm; }
  .${ROOT} .cell-front .foot {
    margin-top: auto; padding-top: 1.2mm; font-size: 4.5pt; color: #8a8278; line-height: 1.35;
    text-align: left; writing-mode: horizontal-tb;
  }

  /* Gold-Akzent wie Entdecken-Hero (/entdecken, „Als Fremder eintreten“) */
  .${ROOT} .cell-back {
    color: #fff8f0; justify-content: stretch; align-items: stretch;
    padding: 2mm 2mm 2mm 2.5mm;
  }
  .${ROOT} .cell-back .inner {
    flex: 1; min-height: 0; width: 100%;
    display: flex; flex-direction: row; align-items: stretch; gap: 2mm;
  }
  .${ROOT} .cell-back .back-left {
    flex: 1 1 52%; min-width: 0; display: flex; flex-direction: column; justify-content: space-between;
    text-align: left; padding: 0.5mm 1mm 0 0;
  }
  .${ROOT} .cell-back .back-left > div:first-child {
    flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column;
    justify-content: flex-start;
  }
  .${ROOT} .cell-back .back-claims-wrap {
    flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column;
    justify-content: center;
  }
  .${ROOT} .cell-back .back-right {
    flex: 0 0 44%; min-width: 0; display: flex; align-items: center; justify-content: center;
  }
  .${ROOT} .cell-back .back-claims {
    margin: 0; flex: 0 0 auto;
    display: flex; flex-direction: column; gap: 1.8mm;
    font-weight: 600; line-height: 1.38; color: rgba(255,248,240,0.92);
  }
  .${ROOT} .cell-back .back-claims .claim-a {
    font-family: ${FONT_SERIF}; font-size: 11pt; font-weight: 700; color: #fff; line-height: 1.22; margin: 0;
  }
  .${ROOT} .cell-back .back-claims .claim-b {
    margin: 0; font-size: 9.25pt; font-weight: 600; color: #d4a574; line-height: 1.38;
  }
  .${ROOT} .cell-back .back-flyer-werbetext {
    margin: 1mm 0 0; flex: 0 0 auto; max-width: 52mm; align-self: flex-start;
    font-size: 5.5pt; font-weight: 500; line-height: 1.35; color: rgba(255,248,240,0.84);
  }
  /* Tablet-Rahmen wie Entdecken-Hero (rechte Spalte) */
  .${ROOT} .cell-back .tor-tablet {
    width: 100%; height: 100%; max-height: 100%;
    background: linear-gradient(165deg, #3a3d42 0%, #1c1e22 45%, #121418 100%);
    border-radius: 2.5mm; padding: 1mm;
    box-shadow: 0 2mm 6mm rgba(0,0,0,0.45), inset 0 0.3mm 0 rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: center;
  }
  .${ROOT} .cell-back .tor-screen { position: relative; width: 100%; aspect-ratio: 4 / 3; border-radius: 1.5mm; overflow: hidden; background: #0a0a0c; }
  .${ROOT} .cell-back .tor-screen img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
  .${ROOT} .cell-back .tor-screen .tor-grad-l { position: absolute; inset: 0; background: linear-gradient(to right, rgba(18,10,6,0.55) 0%, transparent 42%); pointer-events: none; }
  .${ROOT} .cell-back .tor-screen .tor-grad-t { position: absolute; inset: 0; background: linear-gradient(to top, rgba(18,10,6,0.5) 0%, transparent 38%); pointer-events: none; }
  .${ROOT} .cell-back .qr-block {
    margin: 1.5mm 0 0; padding: 1mm 1.2mm; background: #fff; border-radius: 2mm;
    box-shadow: 0 2px 8px rgba(0,0,0,0.22); align-self: flex-start;
  }
  .${ROOT} .cell-back .qr { width: 14mm; height: 14mm; margin: 0; padding: 0; background: transparent; }
  .${ROOT} .cell-back .qr img { width: 100%; height: 100%; display: block; image-rendering: crisp-edges; }
  .${ROOT} .cell-back .scan { margin: 0.6mm 0 0; font-size: 6pt; color: #3d3835; font-weight: 600; line-height: 1.25; }
  .${ROOT} .cell-back .scan-sub { margin: 0.35mm 0 0; font-size: 5.5pt; color: #5c5650; font-weight: 500; line-height: 1.25; }
  .${ROOT} .cell-back .brand { margin: 1mm 0 0; font-size: 4.5pt; color: rgba(255,255,255,0.45); line-height: 1.25; }

  @media print {
    /*
     * Genau 2 Druckseiten: Vorderbogen + Rückbogen (je 4 Streifen auf einem A4).
     * Höhe MUSS unter die bedruckbare Fläche passen: index.css @page hat z. B. 10mm oben + 14mm unten
     * → ~273mm Inhalt – sonst bricht Safari den Bogen auf 2 Seiten (fast leere „Zwischenseite“).
     * Grid statt Flex-Spalte: stabileres Umbruchverhalten in WebKit beim Drucken.
     */
    @page { size: A4 portrait; margin: 3mm 4mm 3mm 5mm; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      width: 100% !important;
      height: auto !important;
    }
    .${ROOT} {
      padding: 0 !important;
      margin: 0 !important;
      background: #fff !important;
      min-height: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .${ROOT} .flyer-vierer-toolbar { display: none !important; }
    .${ROOT} .flyer-img-panel { display: none !important; }
    .${ROOT} .sheet {
      box-sizing: border-box !important;
      box-shadow: none !important;
      margin: 0 !important;
      width: 100% !important;
      /* 268mm: Reserve zu global @page (10+14mm) + Safari-Toleranz – ein Bogen = eine Seite */
      height: 268mm !important;
      max-height: 268mm !important;
      min-height: 268mm !important;
      overflow: hidden !important;
      display: grid !important;
      grid-template-rows: repeat(4, 1fr) !important;
      align-content: stretch !important;
      page-break-after: always !important;
      break-after: page !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .${ROOT} .sheet:last-of-type {
      page-break-after: auto !important;
      break-after: auto !important;
    }
    .${ROOT} .sheet > .cell {
      flex: unset !important;
      min-height: 0 !important;
      height: 100% !important;
      max-height: 100% !important;
      overflow: hidden !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .${ROOT} .cell-front {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .${ROOT} .cell-front .front-main { min-height: 0 !important; }
    .${ROOT} .cell-front .thumb-strip { min-height: 0 !important; }
    .${ROOT} .cell-front .front-event-corner {
      max-width: 44mm !important;
      padding: 1mm 1.2mm !important;
    }
    .${ROOT} .cell-front .front-event-corner .front-event-head {
      font-size: 6.5pt !important;
      color: #b54a1e !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .${ROOT} .cell-front .front-event-corner .front-event-body {
      font-size: 5.5pt !important;
      color: #9a3412 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .${ROOT} .cell-front .front-accent { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .${ROOT} .cell-back { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .${ROOT} .cell-back .tor-tablet { box-shadow: none !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .${ROOT} .cell-back .qr-block { box-shadow: none !important; border: 1px solid #ddd; }
  }
`

function loadStammdatenForTenant(tenant: 'k2' | 'oeffentlich'): {
  martinaName: string
  georgName: string
  address: string
  city: string
  country: string
  phone: string
  email: string
} {
  try {
    const martina =
      tenant === 'oeffentlich'
        ? (loadStammdaten('oeffentlich', 'martina') as { name?: string })
        : (() => {
            const raw = localStorage.getItem('k2-stammdaten-martina')
            return raw && raw.length < 50000 ? (JSON.parse(raw) as { name?: string }) : {}
          })()
    const georg =
      tenant === 'oeffentlich'
        ? (loadStammdaten('oeffentlich', 'georg') as { name?: string })
        : (() => {
            const raw = localStorage.getItem('k2-stammdaten-georg')
            return raw && raw.length < 50000 ? (JSON.parse(raw) as { name?: string }) : {}
          })()
    const gallery =
      tenant === 'oeffentlich'
        ? (loadStammdaten('oeffentlich', 'gallery') as {
            address?: string
            city?: string
            country?: string
            phone?: string
            email?: string
          })
        : (() => {
            const raw = localStorage.getItem('k2-stammdaten-galerie')
            return raw && raw.length < 50000
              ? (JSON.parse(raw) as {
                  address?: string
                  city?: string
                  country?: string
                  phone?: string
                  email?: string
                })
              : {}
          })()
    const def =
      tenant === 'oeffentlich'
        ? { martina: MUSTER_TEXTE.martina, georg: MUSTER_TEXTE.georg, gallery: MUSTER_TEXTE.gallery }
        : K2_STAMMDATEN_DEFAULTS
    return {
      martinaName: (martina?.name || (def as { martina?: { name?: string } }).martina?.name || '').trim(),
      georgName: (georg?.name || (def as { georg?: { name?: string } }).georg?.name || '').trim(),
      address: (gallery?.address ?? (def as { gallery?: { address?: string } }).gallery?.address ?? '').trim(),
      city: (gallery?.city ?? (def as { gallery?: { city?: string } }).gallery?.city ?? '').trim(),
      country: (gallery?.country ?? (def as { gallery?: { country?: string } }).gallery?.country ?? '').trim(),
      phone: (gallery?.phone ?? (def as { gallery?: { phone?: string } }).gallery?.phone ?? '').trim(),
      email: (gallery?.email ?? (def as { gallery?: { email?: string } }).gallery?.email ?? '').trim(),
    }
  } catch {
    const def =
      tenant === 'oeffentlich'
        ? { martina: MUSTER_TEXTE.martina, georg: MUSTER_TEXTE.georg, gallery: MUSTER_TEXTE.gallery }
        : K2_STAMMDATEN_DEFAULTS
    return {
      martinaName: ((def as { martina?: { name?: string } }).martina?.name || '').trim(),
      georgName: ((def as { georg?: { name?: string } }).georg?.name || '').trim(),
      address: ((def as { gallery?: { address?: string } }).gallery?.address || '').trim(),
      city: ((def as { gallery?: { city?: string } }).gallery?.city || '').trim(),
      country: ((def as { gallery?: { country?: string } }).gallery?.country || '').trim(),
      phone: ((def as { gallery?: { phone?: string } }).gallery?.phone || '').trim(),
      email: ((def as { gallery?: { email?: string } }).gallery?.email || '').trim(),
    }
  }
}

/** Ein Martina-Werk für die Flyer-Vorschau: Malerei/Grafik, K2-M-*, oder Künstler:in Martina. */
function pickMartinaShowcaseWork(artworks: unknown[]): Record<string, unknown> | null {
  if (!Array.isArray(artworks) || artworks.length === 0) return null
  const withUrl = (a: Record<string, unknown>) => {
    const u = a?.imageUrl
    return typeof u === 'string' && u.trim().length > 0
  }
  const list = artworks.filter((x): x is Record<string, unknown> => {
    if (typeof x !== 'object' || x === null) return false
    return withUrl(x as Record<string, unknown>)
  })
  if (list.length === 0) return null
  const martinaLike = (a: Record<string, unknown>) => {
    const cat = String(a?.category || '').toLowerCase()
    const num = String(a?.number || '')
    const artist = String(a?.artist || '').toLowerCase()
    if (artist.includes('martina')) return true
    if (cat === 'malerei' || cat === 'grafik') return true
    if (/^K2-M-/i.test(num)) return true
    return false
  }
  const pool = list.filter(martinaLike)
  const useList = pool.length ? pool : list
  const mal = useList.find((a) => String(a?.category || '').toLowerCase() === 'malerei')
  return mal ?? useList[0] ?? null
}

const SLOTS = [0, 1, 2, 3] as const

const K2_GALERIE_PATH = PROJECT_ROUTES['k2-galerie'].galerie

/** Vorderseite Band: feste Namenszeile (K2). */
const K2_BAND_SUBTITLE = 'Martina & Georg Kreinecker'

const K2_TAGLINE = TENANT_CONFIGS.k2.tagline

function loadFlyerOverridesFromStorage(): FlyerImgOverrides {
  try {
    const raw = localStorage.getItem(FLYER_IMG_OVERRIDES_KEY)
    if (!raw || raw.length > 80000) return {}
    const p = JSON.parse(raw) as FlyerImgOverrides
    if (!p || typeof p !== 'object') return {}
    const next = migrateFlyerOverrides(p)
    /**
     * Regression-Fix (Datenfluss): Rückseiten-Tor nie „sticky“ aus altem localStorage übernehmen.
     * Standard ist immer Eingangstor wie /entdecken; manuelle Tor-URL gilt nur in der aktuellen Sitzung.
     */
    if (typeof next.tor === 'string' && next.tor.trim()) delete next.tor
    return next
  } catch {
    return {}
  }
}

function saveFlyerOverridesToStorage(o: FlyerImgOverrides) {
  try {
    /** tor bewusst nicht persistent speichern (siehe loadFlyerOverridesFromStorage). */
    const { tor: _tor, ...persistable } = o
    localStorage.setItem(FLYER_IMG_OVERRIDES_KEY, JSON.stringify(persistable))
  } catch {
    /* Quota */
  }
}

type FlyerEventHinweisStored = { active: boolean; headline: string; body: string }

function loadFlyerEventHinweisFromStorage(): FlyerEventHinweisStored {
  try {
    const raw = localStorage.getItem(FLYER_EVENT_HINWEIS_KEY)
    if (!raw || raw.length > 12000) return { active: false, headline: 'Einladung · Event', body: '' }
    const j = JSON.parse(raw) as {
      active?: boolean
      headline?: string
      body?: string
      text?: string
    }
    const headline =
      typeof j.headline === 'string' && j.headline.trim() ? j.headline.trim() : 'Einladung · Event'
    let body = typeof j.body === 'string' ? j.body : ''
    if (!body && typeof j.text === 'string') body = j.text
    return { active: Boolean(j.active), headline, body }
  } catch {
    return { active: false, headline: 'Einladung · Event', body: '' }
  }
}

function saveFlyerEventHinweisToStorage(s: FlyerEventHinweisStored) {
  try {
    localStorage.setItem(FLYER_EVENT_HINWEIS_KEY, JSON.stringify(s))
  } catch {
    /* Quota */
  }
}

/** Vorschau-Kachel im Panel: sofort sichtbar, was im Flyer landet. */
function FlyerPanelPreviewThumb({
  src,
  label,
  sub,
  busy,
}: {
  src?: string
  label: string
  sub: string
  busy?: boolean
}) {
  const [imgErr, setImgErr] = useState(false)
  useEffect(() => {
    setImgErr(false)
  }, [src])
  const showPlaceholder = Boolean(busy) || !src || imgErr
  return (
    <div className="flyer-panel-thumb-slot">
      <div className="flyer-panel-thumb-frame" aria-busy={busy || undefined}>
        {showPlaceholder ? (
          <div className="flyer-panel-thumb-placeholder">
            {busy ? '⏳ Bitte kurz warten …' : !src ? '—' : 'Bild lässt sich nicht laden.'}
          </div>
        ) : (
          <img src={src} alt="" onError={() => setImgErr(true)} decoding="async" />
        )}
      </div>
      <div className="flyer-panel-thumb-cap">{label}</div>
      <div className="flyer-panel-thumb-sub">{sub}</div>
    </div>
  )
}

export default function FlyerK2Oek2TorViererPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const urlParamsApplied = useRef(false)
  const eventUrlParamsApplied = useRef(false)
  const { versionTimestamp: qrVersionTs, refetch: refetchQrStand } = useQrVersionTimestamp()

  useEffect(() => {
    refetchQrStand()
  }, [refetchQrStand])

  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo
  const [welcomeThumb, setWelcomeThumb] = useState('')
  const [leftWerkAuto, setLeftWerkAuto] = useState('/img/k2/werk-K2-M-0001.jpg')
  const [rightWerkAuto, setRightWerkAuto] = useState('/img/k2/werk-K2-M-0001.jpg')
  const [intro, setIntro] = useState('')
  const [galleryTitle, setGalleryTitle] = useState(() => K2_STAMMDATEN_DEFAULTS.gallery.name)
  const [stammdaten, setStammdaten] = useState(() => loadStammdatenForTenant('k2'))
  const [qrEntdeckenDataUrl, setQrEntdeckenDataUrl] = useState('')
  const [qrK2GalerieDataUrl, setQrK2GalerieDataUrl] = useState('')
  const [torTheme, setTorTheme] = useState(() => ({
    bgDark: '#120a06',
    bgMid: '#1e1008',
    accent: '#b54a1e',
  }))
  /** Pfad aus Design → Eingangsseite (ohne IndexedDB-Upload). */
  const [torHeroPath, setTorHeroPath] = useState(() => getEntdeckenHeroPathUrl())
  /** Wie /entdecken: aktuelles Tor-Bild aus IndexedDB, wenn dort gespeichert. */
  const [torHeroIdb, setTorHeroIdb] = useState<string | null>(null)
  const [imgOverride, setImgOverride] = useState<FlyerImgOverrides>(() => loadFlyerOverridesFromStorage())
  const [artworkChoices, setArtworkChoices] = useState<Array<{ number: string; title: string; imageUrl: string }>>([])
  /** Mitte / Rückseite: Bild aus gewählter Fotodatei (Session – siehe sessionStorage). */
  const [welcomeFromFile, setWelcomeFromFile] = useState<string | null>(null)
  const [torFromFile, setTorFromFile] = useState<string | null>(null)
  /**
   * Wichtig für den Datenfluss: Ein aus der Session geladenes Tor-Foto soll das echte Eingangstor
   * nicht ungefragt überschreiben. Aktiv wird Datei nur nach bewusster Auswahl in dieser Session.
   */
  const [torFileActive, setTorFileActive] = useState(false)
  /** UX: sichtbares Feedback statt „nichts passiert“ bei Auflösung/Komprimierung. */
  const [artworkChoicesLoading, setArtworkChoicesLoading] = useState(true)
  const [torIdbLoading, setTorIdbLoading] = useState(true)
  const [welcomeCompressing, setWelcomeCompressing] = useState(false)
  const [torCompressing, setTorCompressing] = useState(false)
  /** Erst nach IDB-Laden: sonst würde „leer speichern“ die Slots vor dem Restore löschen. */
  const [flyerFileSessionReady, setFlyerFileSessionReady] = useState(false)
  const welcomeFileInputRef = useRef<HTMLInputElement>(null)
  const torFileInputRef = useRef<HTMLInputElement>(null)
  /** Schutz gegen Race: späteres IDB-Load darf eine frische Nutzer-Auswahl nicht überschreiben. */
  const welcomeFileTouchedRef = useRef(false)
  const torFileTouchedRef = useRef(false)

  const initialEventHinweis = useMemo(() => loadFlyerEventHinweisFromStorage(), [])
  const [eventHinweisActive, setEventHinweisActive] = useState(initialEventHinweis.active)
  const [eventHinweisHeadline, setEventHinweisHeadline] = useState(initialEventHinweis.headline)
  const [eventHinweisBody, setEventHinweisBody] = useState(initialEventHinweis.body)

  useEffect(() => {
    saveFlyerEventHinweisToStorage({
      active: eventHinweisActive,
      headline: eventHinweisHeadline,
      body: eventHinweisBody,
    })
  }, [eventHinweisActive, eventHinweisHeadline, eventHinweisBody])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [w, t] = await Promise.all([
          loadFlyerViererFileSlot('welcome'),
          loadFlyerViererFileSlot('tor'),
        ])
        if (cancelled) return
        if (w && !welcomeFileTouchedRef.current) setWelcomeFromFile(w)
        if (t && !torFileTouchedRef.current) {
          setTorFromFile(t)
          setTorFileActive(false)
        }
      } catch {
        /* */
      } finally {
        if (!cancelled) setFlyerFileSessionReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!flyerFileSessionReady) return
    void (async () => {
      const { ok, message } = await saveFlyerViererFileSlot('welcome', welcomeFromFile)
      if (!ok && welcomeFromFile) {
        window.alert(
          `Flyer Mitte: Zwischenspeichern fehlgeschlagen (${message ?? 'unbekannt'}). Das Bild siehst du weiter, bis du die Seite neu lädst. Tipp: etwas kleineres Foto oder nur ein Foto weniger gleichzeitig.`
        )
      }
    })()
  }, [welcomeFromFile, flyerFileSessionReady])

  useEffect(() => {
    if (!flyerFileSessionReady) return
    void (async () => {
      const { ok, message } = await saveFlyerViererFileSlot('tor', torFromFile)
      if (!ok && torFromFile) {
        window.alert(
          `Flyer Rückseite: Zwischenspeichern fehlgeschlagen (${message ?? 'unbekannt'}). Das Bild siehst du weiter, bis du die Seite neu lädst.`
        )
      }
    })()
  }, [torFromFile, flyerFileSessionReady])

  /** URL einmalig: flyerLeft / flyerWerk / flyerWelcome / flyerTor (kurz fl, fk, fw, ft); fc → links (Alt) */
  useEffect(() => {
    if (urlParamsApplied.current) return
    const w = searchParams.get('flyerWelcome') || searchParams.get('fw')
    const l = searchParams.get('flyerLeft') || searchParams.get('fl')
    const c = searchParams.get('flyerCard') || searchParams.get('fc')
    const k = searchParams.get('flyerWerk') || searchParams.get('fk')
    const t = searchParams.get('flyerTor') || searchParams.get('ft')
    if (w || l || c || k || t) {
      setImgOverride((prev) => ({
        ...prev,
        ...(w?.trim() ? { welcome: w.trim() } : {}),
        ...(l?.trim() ? { leftWerk: l.trim() } : {}),
        ...(c?.trim() && !l?.trim() ? { leftWerk: c.trim() } : {}),
        ...(k?.trim() ? { werk: k.trim() } : {}),
        ...(t?.trim() ? { tor: t.trim() } : {}), // nur diese Sitzung; wird nicht persistent gespeichert
      }))
    }
    urlParamsApplied.current = true
  }, [searchParams])

  /** URL einmalig: eventHinweis=1, eventHinweisText/eht, optional eventHinweisHeadline/ehh (aus Event-Flyer im Admin). */
  useEffect(() => {
    if (eventUrlParamsApplied.current) return
    const eh = searchParams.get('eventHinweis') || searchParams.get('eh')
    if (eh === '1' || eh === 'true' || eh === 'yes') {
      setEventHinweisActive(true)
      const ehh = searchParams.get('eventHinweisHeadline') || searchParams.get('ehh')
      const eht = searchParams.get('eventHinweisText') || searchParams.get('eht')
      if (ehh) {
        try {
          const d = decodeURIComponent(ehh.replace(/\+/g, ' '))
          if (d.trim()) setEventHinweisHeadline(d.trim().slice(0, 120))
        } catch {
          if (ehh.trim()) setEventHinweisHeadline(ehh.trim().slice(0, 120))
        }
      }
      if (eht) {
        try {
          const d = decodeURIComponent(eht.replace(/\+/g, ' '))
          if (d.trim()) setEventHinweisBody(d.trim().slice(0, 2000))
        } catch {
          if (eht.trim()) setEventHinweisBody(eht.trim().slice(0, 2000))
        }
      }
    }
    eventUrlParamsApplied.current = true
  }, [searchParams])

  useEffect(() => {
    saveFlyerOverridesToStorage(imgOverride)
  }, [imgOverride])

  const setOverrideField = (key: keyof FlyerImgOverrides, val: string) => {
    const v = val.trim()
    setImgOverride((prev) => {
      if (!v) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: v }
    })
  }

  const entdeckenBustUrl = buildQrUrlWithBust(BASE_APP_URL + OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE, qrVersionTs)
  const k2GalerieBustUrl = buildQrUrlWithBust(BASE_APP_URL + K2_GALERIE_PATH, qrVersionTs)

  useEffect(() => {
    let ok = true
    QRCode.toDataURL(entdeckenBustUrl, { width: 320, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (ok) setQrEntdeckenDataUrl(url)
      })
      .catch(() => {
        if (ok) setQrEntdeckenDataUrl('')
      })
    return () => {
      ok = false
    }
  }, [entdeckenBustUrl])

  useEffect(() => {
    let ok = true
    QRCode.toDataURL(k2GalerieBustUrl, { width: 320, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (ok) setQrK2GalerieDataUrl(url)
      })
      .catch(() => {
        if (ok) setQrK2GalerieDataUrl('')
      })
    return () => {
      ok = false
    }
  }, [k2GalerieBustUrl])

  /** Rückseite: Farben wie K2-Design. */
  useEffect(() => {
    const c = getEntdeckenColorsFromK2Design()
    setTorTheme({ bgDark: c.bgDark, bgMid: c.bgMid, accent: c.accent })
  }, [])

  /** Tor-Bild wie /entdecken: Pfad + IndexedDB-Overlay; gleicher Ablauf wie EntdeckenPage + Tab-Wechsel. */
  const torOverlayLoadGenRef = useRef(0)
  useEffect(() => {
    let cancelled = false
    const refresh = () => {
      const gen = ++torOverlayLoadGenRef.current
      setTorHeroPath(getEntdeckenHeroPathUrl(getPageContentEntdecken()))
      setTorHeroIdb(null)
      setTorIdbLoading(true)
      void loadEntdeckenHeroOverlayIfFresh()
        .then((u) => {
          if (cancelled || gen !== torOverlayLoadGenRef.current) return
          setTorHeroIdb(u)
        })
        .finally(() => {
          if (cancelled || gen !== torOverlayLoadGenRef.current) return
          setTorIdbLoading(false)
        })
    }
    refresh()
    window.addEventListener('k2-page-content-entdecken-updated', refresh)
    /** Anderes Tab/Fenster: Admin speichert localStorage → ohne diesen Listener bleibt der Flyer auf altem Tor. */
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'k2-page-content-entdecken') refresh()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      cancelled = true
      window.removeEventListener('k2-page-content-entdecken-updated', refresh)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  /** Vorderseite immer echte K2-Galerie (Kunst & Keramik), unabhängig von Admin-Kontext (ök2-Tab). */
  useEffect(() => {
    let isMounted = true
    try {
      const raw = localStorage.getItem('k2-stammdaten-galerie')
      const stamm: Record<string, unknown> = {}
      if (raw && raw.length < 6 * 1024 * 1024) Object.assign(stamm, JSON.parse(raw))
      const nameFromStore = typeof stamm.name === 'string' ? stamm.name.trim() : ''
      if (isMounted) setGalleryTitle(nameFromStore || K2_STAMMDATEN_DEFAULTS.gallery.name)
      const images = getGalerieImages(stamm as Record<string, string>, undefined)
      const img = images.welcomeImage
      if (img && typeof img === 'string' && img.length > 50 && img.length < 2 * 1024 * 1024 && isMounted) {
        setWelcomeThumb(img)
      } else if (isMounted) {
        setWelcomeThumb('/img/k2/willkommen.jpg')
      }
    } catch {
      if (isMounted) {
        setWelcomeThumb('/img/k2/willkommen.jpg')
      }
    }

    try {
      const texts = getPageTexts(undefined)
      const g = texts.galerie
      if (isMounted) {
        setIntro(
          (g?.welcomeIntroText || '').trim().slice(0, 220) ||
            'Kunst & Keramik – wir freuen uns auf deinen Besuch.'
        )
      }
    } catch {
      if (isMounted) setIntro('Kunst & Keramik – wir freuen uns auf deinen Besuch.')
    }

    setStammdaten(loadStammdatenForTenant('k2'))
    return () => {
      isMounted = false
    }
  }, [])

  /** Werk-Liste + Vorschlags-Werk für rechtes Bild (K2). */
  useEffect(() => {
    let isMounted = true
    setArtworkChoicesLoading(true)
    readArtworksForContextWithResolvedImages(false, false)
      .then((list) => {
        if (!isMounted) return
        const choices = list
          .map((a) => {
            const rec = a as Record<string, unknown>
            const imageUrl = rec.imageUrl
            if (typeof imageUrl !== 'string' || !imageUrl.trim()) return null
            const number = String(rec.number ?? rec.id ?? '').trim()
            if (!number) return null
            const title = String(rec.title ?? '').trim()
            return { number, title, imageUrl: imageUrl.trim() }
          })
          .filter((x): x is { number: string; title: string; imageUrl: string } => x != null)
        setArtworkChoices(choices)
        const w = pickMartinaShowcaseWork(list)
        const leftUrl =
          (typeof w?.imageUrl === 'string' ? w.imageUrl.trim() : '') ||
          choices[0]?.imageUrl ||
          '/img/k2/werk-K2-M-0001.jpg'
        const wNum = String(w?.number ?? '').trim()
        const second =
          choices.find((c) => wNum && c.number !== wNum) || choices[1] || choices[0]
        const rightUrl = second?.imageUrl?.trim() || leftUrl
        setLeftWerkAuto(leftUrl)
        setRightWerkAuto(rightUrl)
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setArtworkChoicesLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const effectiveLeftWerk = imgOverride.leftWerk?.trim() || leftWerkAuto
  const effectiveWelcome =
    welcomeFromFile ||
    imgOverride.welcome?.trim() ||
    welcomeThumb ||
    '/img/k2/willkommen.jpg'
  const effectiveRightWerk = imgOverride.werk?.trim() || rightWerkAuto
  const effectiveTor =
    (torFileActive ? torFromFile : null) || imgOverride.tor?.trim() || torHeroIdb || torHeroPath

  const leftWerkSelectValue = useMemo(
    () => werkNumberFromOverrideUrl(artworkChoices, imgOverride.leftWerk, leftWerkAuto),
    [imgOverride.leftWerk, artworkChoices, leftWerkAuto]
  )

  const rightWerkSelectValue = useMemo(
    () => werkNumberFromOverrideUrl(artworkChoices, imgOverride.werk, rightWerkAuto),
    [imgOverride.werk, artworkChoices, rightWerkAuto]
  )

  const leftWerkIsManualUrl = useMemo(() => {
    const o = imgOverride.leftWerk?.trim()
    if (!o) return false
    return !artworkChoices.some((c) => c.imageUrl === o)
  }, [imgOverride.leftWerk, artworkChoices])

  const rightWerkIsManualUrl = useMemo(() => {
    const o = imgOverride.werk?.trim()
    if (!o) return false
    return !artworkChoices.some((c) => c.imageUrl === o)
  }, [imgOverride.werk, artworkChoices])

  const flyerLoadingBannerParts = useMemo(() => {
    const parts: string[] = []
    if (artworkChoicesLoading) parts.push('Werke werden aus der Galerie geladen …')
    if (torIdbLoading) parts.push('Entdecken-Torbild wird geladen …')
    if (welcomeCompressing) parts.push('Willkommens-Foto wird vorbereitet …')
    if (torCompressing) parts.push('Torbild wird vorbereitet …')
    return parts
  }, [artworkChoicesLoading, torIdbLoading, welcomeCompressing, torCompressing])

  const flyerPreviewMeta = useMemo(() => {
    const leftSub = artworkChoicesLoading
      ? 'Galerie-Werke werden noch aufgelöst – Vorschlag kann gleich wechseln.'
      : imgOverride.leftWerk?.trim()
        ? leftWerkIsManualUrl
          ? 'Quelle: eigene URL im Feld „Werk-Bild-URL links“.'
          : `Quelle: Liste – ${leftWerkSelectValue || 'Werk'}.`
        : 'Quelle: automatischer Vorschlag aus deiner Galerie.'
    const welcomeSub = welcomeCompressing
      ? 'Foto wird komprimiert und eingebunden …'
      : welcomeFromFile
        ? 'Quelle: Foto von diesem Gerät (Mitte).'
        : imgOverride.welcome?.trim()
          ? 'Quelle: eigene URL im Textfeld Mitte.'
          : welcomeThumb
            ? 'Quelle: Willkommensbild aus Galerie-Design.'
            : 'Quelle: Standard-Willkommensbild.'
    const rightSub = artworkChoicesLoading
      ? 'Galerie-Werke werden noch aufgelöst – Vorschlag kann gleich wechseln.'
      : imgOverride.werk?.trim()
        ? rightWerkIsManualUrl
          ? 'Quelle: eigene URL im Feld „Werk-Bild-URL rechts“.'
          : `Quelle: Liste – ${rightWerkSelectValue || 'Werk'}.`
        : 'Quelle: automatischer Vorschlag aus deiner Galerie.'
    const torSub = torCompressing
      ? 'Foto wird komprimiert und eingebunden …'
      : torFromFile && torFileActive
        ? 'Quelle: Foto von diesem Gerät (Rückseite).'
        : torFromFile
          ? 'Gespeichertes Tor-Foto vorhanden, aber nicht aktiv (nutzt aktuell Eingangstor wie /entdecken).'
        : imgOverride.tor?.trim()
          ? 'Quelle: eigene URL im Textfeld Rückseite.'
          : torIdbLoading
            ? 'Rückseite wird ermittelt (Design-Hero + ggf. Entdecken-Upload) …'
            : torHeroIdb
              ? 'Quelle: Entdecken-Upload im Browser (kurz, nur dort) – nicht dieselbe Datei wie unter Design → Eingangsseite.'
              : 'Quelle: Hero-Bild/URL aus Design → Eingangsseite (wie /entdecken, ohne Entdecken-Upload).'
    return { leftSub, welcomeSub, rightSub, torSub }
  }, [
    artworkChoicesLoading,
    imgOverride.leftWerk,
    imgOverride.welcome,
    imgOverride.werk,
    imgOverride.tor,
    leftWerkIsManualUrl,
    rightWerkIsManualUrl,
    leftWerkSelectValue,
    rightWerkSelectValue,
    welcomeCompressing,
    welcomeFromFile,
    welcomeThumb,
    torCompressing,
    torFromFile,
    torIdbLoading,
    torHeroIdb,
  ])

  const addrLine = [stammdaten.address, [stammdaten.city, stammdaten.country].filter(Boolean).join(' ')].filter(Boolean).join(' · ')
  const kontaktKurz = [stammdaten.phone, stammdaten.email].filter(Boolean).join(' · ')
  /** Wie Design → Eingangsseite (pageHero): gleiche Qualität wie Eingangstor, nicht extra „Flyer-Kachel“-Profil. */
  const prepareFlyerFileDataUrl = async (file: File): Promise<string> => {
    const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
      new Promise<T>((resolve, reject) => {
        const timer = window.setTimeout(() => reject(new Error('Komprimierung dauert zu lange')), ms)
        promise
          .then((v) => {
            window.clearTimeout(timer)
            resolve(v)
          })
          .catch((e) => {
            window.clearTimeout(timer)
            reject(e)
          })
      })
    return withTimeout(compressImageForStorage(file, { context: 'pageHero' }), 90_000)
  }

  return (
    <div className={ROOT}>
      <style>{styles}</style>
      <div className="flyer-vierer-toolbar">
        {returnTo ? (
          <Link to={returnTo} style={{ color: TEAL_LIGHT, textDecoration: 'none', fontWeight: 500 }}>
            ← Zurück
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: TEAL_LIGHT,
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ← Zurück
          </button>
        )}
        <button
          type="button"
          onClick={() => refetchQrStand()}
          style={{
            padding: '0.4rem 0.75rem',
            background: '#f0fdfa',
            color: TEAL_LIGHT,
            border: `1px solid ${TEAL_LIGHT}60`,
            borderRadius: '6px',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          QR aktualisieren
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: '0.4rem 0.75rem',
            background: TEAL,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Als PDF drucken
        </button>
        <Link
          to={BENUTZER_HANDBUCH_ROUTE}
          style={{
            padding: '0.4rem 0.75rem',
            background: '#f0fdfa',
            color: TEAL_LIGHT,
            border: `1px solid ${TEAL_LIGHT}60`,
            borderRadius: '6px',
            fontSize: '0.85rem',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Benutzerhandbuch
        </Link>
      </div>
      <p className="flyer-print-hint no-print" role="note">
        <strong>Drucken (Safari / Mac):</strong> Im Druckdialog <strong>„Hintergrundgrafiken“</strong> aktivieren – sonst
        fehlen Farbflächen und helle Schrift auf der Rückseite fast komplett. Geplant sind{' '}
        <strong>zwei</strong> Druckseiten (Vorderbogen + Rückbogen), jeweils ein A4 mit vier gleichen Streifen – keine
        vier Einzelseiten.
      </p>

      <div className="flyer-img-panel no-print" aria-label="Flyer-Bilder wählen">
        <h2>Bilder für diesen Flyer</h2>
        <div
          className="row"
          style={{ gridTemplateColumns: '1fr', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #e5e0d8' }}
        >
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={eventHinweisActive}
                onChange={(e) => setEventHinweisActive(e.target.checked)}
              />
              Hinweis zur Eventeröffnung unten rechts (jeder Streifen)
            </label>
            <p className="hint" style={{ marginTop: 6 }}>
              Abschaltbar – derselbe Bogen bleibt ohne Häkchen neutral. Text wird gespeichert (dieses Gerät). Vom
              Event-Bereich aus kann ein Link mit Textfüllung geöffnet werden.
            </p>
            {eventHinweisActive ? (
              <>
                <div className="row" style={{ gridTemplateColumns: '140px 1fr', marginTop: 10 }}>
                  <label htmlFor="flyer-ev-head">Überschrift</label>
                  <input
                    id="flyer-ev-head"
                    type="text"
                    maxLength={120}
                    value={eventHinweisHeadline}
                    onChange={(e) => setEventHinweisHeadline(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="row" style={{ gridTemplateColumns: '140px 1fr', alignItems: 'start' }}>
                  <label htmlFor="flyer-ev-body" style={{ paddingTop: 6 }}>
                    Kurztext
                  </label>
                  <textarea
                    id="flyer-ev-body"
                    rows={4}
                    maxLength={2000}
                    value={eventHinweisBody}
                    onChange={(e) => setEventHinweisBody(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d4cfc7',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      resize: 'vertical',
                      minHeight: 72,
                    }}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
        {flyerLoadingBannerParts.length > 0 ? (
          <div className="flyer-load-banner" role="status" aria-live="polite">
            {flyerLoadingBannerParts.join(' ')}
          </div>
        ) : null}
        <div className="flyer-panel-preview">
          <h3>Live-Vorschau der vier Motive</h3>
          <p className="flyer-panel-preview-lead">
            Hier siehst du sofort, was im gedruckten Flyer landet – inklusive kurzer Quellenzeile pro Bild.
            {eventHinweisActive ? (
              <>
                {' '}
                <strong>Event-Hinweis</strong> ist an – unten rechts erscheint ein eigenes Feld (Signalfarbe) beim Drucken.
              </>
            ) : null}
          </p>
          <div className="flyer-panel-preview-grid">
            <FlyerPanelPreviewThumb
              label="Links (Werk)"
              src={effectiveLeftWerk}
              sub={flyerPreviewMeta.leftSub}
            />
            <FlyerPanelPreviewThumb
              label="Mitte (Willkommen)"
              src={welcomeCompressing ? undefined : effectiveWelcome}
              sub={flyerPreviewMeta.welcomeSub}
              busy={welcomeCompressing}
            />
            <FlyerPanelPreviewThumb
              label="Rechts (Werk)"
              src={effectiveRightWerk}
              sub={flyerPreviewMeta.rightSub}
            />
            <FlyerPanelPreviewThumb
              label="Rückseite (Tor)"
              src={torCompressing ? undefined : effectiveTor}
              sub={flyerPreviewMeta.torSub}
              busy={torCompressing}
            />
          </div>
        </div>
        <div className="row">
          <label htmlFor="flyer-sel-left-werk">Werk (links)</label>
          <div>
            <select
              id="flyer-sel-left-werk"
              disabled={artworkChoicesLoading}
              aria-busy={artworkChoicesLoading}
              value={leftWerkSelectValue}
              onChange={(e) => {
                const v = e.target.value
                if (!v) {
                  setOverrideField('leftWerk', '')
                  return
                }
                const row = artworkChoices.find((c) => c.number === v)
                if (row) setOverrideField('leftWerk', row.imageUrl)
              }}
            >
              <option value="">Automatisch (Vorschlag)</option>
              {artworkChoices.map((c) => (
                <option key={`L-${c.number}`} value={c.number}>
                  {c.number}
                  {c.title ? ` – ${c.title}` : ''}
                </option>
              ))}
            </select>
            {leftWerkIsManualUrl ? (
              <p className="hint" style={{ margin: '4px 0 0' }}>
                Aktuell: <strong>eigene URL</strong> im Feld darunter – Liste steuert dann nicht.
              </p>
            ) : null}
          </div>
        </div>
        <div className="row">
          <label htmlFor="flyer-in-left-werk">Werk-Bild-URL links (optional)</label>
          <input
            id="flyer-in-left-werk"
            type="text"
            placeholder="Überschreibt die Liste; leer = wie oben"
            value={imgOverride.leftWerk ?? ''}
            onChange={(e) => setOverrideField('leftWerk', e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="row">
          <label htmlFor="flyer-in-welcome">Willkommen (Mitte)</label>
          <div>
            <input
              id="flyer-in-welcome"
              type="text"
              placeholder="Leer = Willkommensbild aus Design (oder Foto wählen)"
              value={imgOverride.welcome ?? ''}
              onChange={(e) => setOverrideField('welcome', e.target.value)}
              autoComplete="off"
            />
            <input
              ref={welcomeFileInputRef}
              type="file"
              accept="image/*"
              className="no-print"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (!f || !f.type.startsWith('image/')) return
                welcomeFileTouchedRef.current = true
                setWelcomeCompressing(true)
                try {
                  const dataUrl = await prepareFlyerFileDataUrl(f)
                  setWelcomeFromFile(dataUrl)
                } catch {
                  window.alert(
                    'Foto konnte nicht geladen werden. Bitte JPG/PNG wählen (oder kleineres Bild verwenden).'
                  )
                } finally {
                  setWelcomeCompressing(false)
                }
              }}
            />
            <div className="file-row">
              <button
                type="button"
                disabled={welcomeCompressing}
                onClick={() => welcomeFileInputRef.current?.click()}
              >
                {welcomeCompressing ? 'Foto wird vorbereitet …' : 'Foto von diesem Gerät wählen …'}
              </button>
              {welcomeFromFile ? (
                <>
                  <img className="file-thumb" src={welcomeFromFile} alt="" />
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      welcomeFileTouchedRef.current = true
                      setWelcomeFromFile(null)
                    }}
                  >
                    Foto entfernen
                  </button>
                  <span style={{ fontSize: '0.76rem', color: '#5c5650' }}>Aktiv: Datei (geht vor Textfeld)</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="row">
          <label htmlFor="flyer-sel-werk">Werk (rechts)</label>
          <div>
            <select
              id="flyer-sel-werk"
              disabled={artworkChoicesLoading}
              aria-busy={artworkChoicesLoading}
              value={rightWerkSelectValue}
              onChange={(e) => {
                const v = e.target.value
                if (!v) {
                  setOverrideField('werk', '')
                  return
                }
                const row = artworkChoices.find((c) => c.number === v)
                if (row) setOverrideField('werk', row.imageUrl)
              }}
            >
              <option value="">Automatisch (Vorschlag)</option>
              {artworkChoices.map((c) => (
                <option key={`R-${c.number}`} value={c.number}>
                  {c.number}
                  {c.title ? ` – ${c.title}` : ''}
                </option>
              ))}
            </select>
            {rightWerkIsManualUrl ? (
              <p className="hint" style={{ margin: '4px 0 0' }}>
                Aktuell: <strong>eigene URL</strong> im Feld darunter – Liste steuert dann nicht.
              </p>
            ) : null}
          </div>
        </div>
        <div className="row">
          <label htmlFor="flyer-in-werk">Werk-Bild-URL rechts (optional)</label>
          <input
            id="flyer-in-werk"
            type="text"
            placeholder="Überschreibt die Liste; leer = wie oben"
            value={imgOverride.werk ?? ''}
            onChange={(e) => setOverrideField('werk', e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className="row">
          <label htmlFor="flyer-in-tor">Rückseite Tor / Hero</label>
          <div>
            <input
              id="flyer-in-tor"
              type="text"
              placeholder="Leer = Entdecken-Bild wie /entdecken (oder Foto wählen)"
              value={imgOverride.tor ?? ''}
              onChange={(e) => setOverrideField('tor', e.target.value)}
              autoComplete="off"
            />
            <input
              ref={torFileInputRef}
              type="file"
              accept="image/*"
              className="no-print"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (!f || !f.type.startsWith('image/')) return
                torFileTouchedRef.current = true
                setTorCompressing(true)
                try {
                  const dataUrl = await prepareFlyerFileDataUrl(f)
                  setTorFromFile(dataUrl)
                  setTorFileActive(true)
                } catch {
                  window.alert(
                    'Tor-Foto konnte nicht geladen werden. Bitte JPG/PNG wählen (oder kleineres Bild verwenden).'
                  )
                } finally {
                  setTorCompressing(false)
                }
              }}
            />
            <div className="file-row">
              <button
                type="button"
                disabled={torCompressing}
                onClick={() => torFileInputRef.current?.click()}
              >
                {torCompressing ? 'Foto wird vorbereitet …' : 'Foto von diesem Gerät wählen …'}
              </button>
              {torFromFile ? (
                <>
                  <img className="file-thumb" src={torFromFile} alt="" />
                  <button
                    type="button"
                    onClick={() => setTorFileActive((v) => !v)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: 6,
                      border: '1px solid #d4cfc7',
                      background: '#fff',
                      color: '#1c1a18',
                      cursor: 'pointer',
                      fontSize: '0.76rem',
                    }}
                  >
                    {torFileActive ? 'Datei deaktivieren (Eingangstor nutzen)' : 'Datei aktivieren'}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      torFileTouchedRef.current = true
                      setTorFromFile(null)
                      setTorFileActive(false)
                    }}
                  >
                    Foto entfernen
                  </button>
                  <span style={{ fontSize: '0.76rem', color: '#5c5650' }}>
                    {torFileActive
                      ? 'Aktiv: Datei (geht vor Textfeld und Eingangstor)'
                      : 'Inaktiv: Eingangstor wie /entdecken ist aktiv'}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="btn-row">
          <button
            type="button"
            onClick={() => {
              welcomeFileTouchedRef.current = true
              torFileTouchedRef.current = true
              setImgOverride({})
              setWelcomeFromFile(null)
              setTorFromFile(null)
              setTorFileActive(false)
              try {
                localStorage.removeItem(FLYER_IMG_OVERRIDES_KEY)
              } catch {
                /* */
              }
              void clearAllFlyerViererFileSlots()
            }}
            style={{
              padding: '0.45rem 0.75rem',
              background: '#fff',
              color: '#1c1a18',
              border: '1px solid #b54a1e',
              borderRadius: '6px',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Alle manuellen Bilder zurücksetzen
          </button>
        </div>
      </div>

      <section className="sheet" aria-label="Vorderseite vier Flyer K2 Galerie">
        {SLOTS.map((i) => (
          <div key={`f-${i}`} className="cell cell-front">
            <div className="front-top">
              <div className="front-accent" aria-hidden />
              <div className="front-head">
                <h2>{galleryTitle}</h2>
                <p className="sub">{K2_BAND_SUBTITLE}</p>
              </div>
            </div>
            <div className="front-main">
              <div className="thumb-strip">
                <div className="thumb">
                  <img src={effectiveLeftWerk} alt="" />
                </div>
                <div className="thumb">
                  <img src={effectiveWelcome} alt="" />
                </div>
                <div className="thumb">
                  <img src={effectiveRightWerk} alt="" />
                </div>
              </div>
              <div className="text">
                <p className="intro">{intro}</p>
                <p className="addr">
                  {addrLine}
                  {kontaktKurz ? (
                    <>
                      <br />
                      {kontaktKurz}
                    </>
                  ) : null}
                </p>
              </div>
            </div>
            <p className="front-kunst">{K2_TAGLINE}</p>
            <div className="front-bottom">
              <div className="k2qr-row">
                {qrK2GalerieDataUrl ? (
                  <div className="k2qr">
                    <img src={qrK2GalerieDataUrl} alt="" />
                  </div>
                ) : (
                  <div className="k2qr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 5, color: '#666' }}>
                    QR…
                  </div>
                )}
                <div className="k2qr-cap">
                  <span className="k2qr-cta">Zur Galerie</span>
                  Code scannen – die Galerie online öffnen.
                </div>
              </div>
              {eventHinweisActive ? (
                <div className="front-event-corner" role="note">
                  <p className="front-event-head">{eventHinweisHeadline.trim() || 'Einladung · Event'}</p>
                  {eventHinweisBody.trim() ? (
                    <p className="front-event-body">{eventHinweisBody.trim()}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="foot">
              {PRODUCT_COPYRIGHT_BRAND_ONLY}
              <br />
              {PRODUCT_URHEBER_ANWENDUNG}
            </div>
          </div>
        ))}
      </section>

      <section className="sheet" aria-label="Rückseite vier QR Eingangstor">
        {SLOTS.map((i) => (
          <div
            key={`b-${i}`}
            className="cell cell-back"
            style={{
              background: `linear-gradient(160deg, ${torTheme.bgDark} 0%, ${torTheme.bgMid} 55%, ${torTheme.accent}22 100%)`,
            }}
          >
            <div className="inner">
              <div className="back-left">
                <div>
                  <div className="back-claims-wrap">
                    <div className="back-claims">
                      <p className="claim-a">{PRODUCT_WERBESLOGAN}</p>
                      <p className="claim-b">{PRODUCT_WERBESLOGAN_2}</p>
                    </div>
                  </div>
                  <p className="back-flyer-werbetext">{FLYER_RUECKSEITE_WERBETEXT}</p>
                </div>
                <div>
                  <div className="qr-block">
                    {qrEntdeckenDataUrl ? (
                      <div className="qr">
                        <img src={qrEntdeckenDataUrl} alt="QR-Code ök2 Eingangstor" />
                      </div>
                    ) : (
                      <div className="qr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, color: '#333', minHeight: 40 }}>
                        QR…
                      </div>
                    )}
                    <p className="scan">Demo ök2</p>
                    <p className="scan-sub">Code scannen - eintreten</p>
                  </div>
                  <p className="brand">
                    {PRODUCT_BRAND_NAME}
                    <br />
                    {PRODUCT_COPYRIGHT_BRAND_ONLY}
                  </p>
                </div>
              </div>
              <div className="back-right">
                <div className="tor-tablet">
                  <div className="tor-screen">
                    <img src={effectiveTor} alt="" />
                    <div className="tor-grad-l" />
                    <div className="tor-grad-t" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
