/**
 * K2 Galerie – durchgehende Werbelinie für alle Marketing-Dokumente
 * (Flyer, Presse-Einladung, Social-Media, etc.)
 * Basiert auf Galerie-Design (K2 Orange) und einheitlicher Typografie.
 */

export const WERBELINIE = {
  /** Offizielles K2-Orange (Akzent) */
  accent: '#ff8c42',
  /** Hintergrund 1 (dunkel) */
  bg1: '#1a0f0a',
  bg2: '#2d1a14',
  bg3: '#3d2419',
  /** Text */
  text: '#fff5f0',
  muted: '#d4a574',
  /** Karten/Flächen */
  cardBg1: 'rgba(45, 26, 20, 0.95)',
  cardBg2: 'rgba(26, 15, 10, 0.92)',
  /** Dezente Glows für Druck/PDF */
  glowTop: 'rgba(255, 140, 66, 0.15)',
  glowBottom: 'rgba(212, 165, 116, 0.1)',
} as const

/** Schriftfamilien – einheitlich für alle PR-Dokumente */
export const WERBELINIE_FONTS = {
  heading: "'Cormorant Garamond', serif",
  body: "'Source Sans 3', sans-serif",
} as const

/** Google Fonts URL für Einbindung in HTML/Print */
export const WERBELINIE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;600&display=swap'

/** CSS für alle Marketing-Seiten (Flyer, Presse-Einladung) – K2 Orange */
export function getWerbelinieCss(className: string): string {
  return `
  .${className} body { margin: 0; padding: 0; box-sizing: border-box; }
  .${className} { font-family: ${WERBELINIE_FONTS.body}; background: #e8e8e8; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  @media print {
    @page { size: A4; margin: 0; }
    .${className} { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0 !important; margin: 0 !important; background: #fff !important; }
    .${className} .doc-box { box-shadow: none !important; width: 210mm !important; height: 297mm !important; min-height: 0 !important; }
  }
  .${className} .doc-box {
    width: 210mm; height: 297mm; max-height: 297mm;
    background: linear-gradient(165deg, ${WERBELINIE.bg1} 0%, ${WERBELINIE.bg2} 45%, ${WERBELINIE.bg3} 100%);
    color: ${WERBELINIE.text};
    padding: 10mm 14mm;
    box-shadow: 0 20px 60px rgba(0,0,0,0.35);
    position: relative; overflow: hidden; display: flex; flex-direction: column;
  }
  .${className} .doc-box::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse 80% 50% at 50% -20%, ${WERBELINIE.glowTop}, transparent 50%),
                radial-gradient(ellipse 60% 40% at 85% 100%, ${WERBELINIE.glowBottom}, transparent 45%);
    pointer-events: none;
  }
  .${className} .content { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 6px; }
  .${className} .tagline { font-family: ${WERBELINIE_FONTS.heading}; font-size: 12px; letter-spacing: 0.32em; text-transform: uppercase; color: ${WERBELINIE.muted}; margin: 0; }
  .${className} h1 { font-family: ${WERBELINIE_FONTS.heading}; font-size: 34px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.1; margin: 0; color: ${WERBELINIE.text}; }
  .${className} .subtitle { font-size: 14px; font-weight: 300; color: ${WERBELINIE.muted}; margin: 0; }
  .${className} .line { width: 40px; height: 2px; background: linear-gradient(90deg, ${WERBELINIE.accent}, transparent); margin: 0; }
  .${className} .welcome-image-wrap { width: 100%; margin: 0; display: flex; align-items: center; justify-content: center; }
  .${className} .welcome-image-wrap img { max-width: 100%; max-height: 58mm; height: auto; object-fit: contain; display: block; border-radius: 8px; }
  .${className} .intro { font-size: 12px; line-height: 1.5; color: ${WERBELINIE.text}; max-width: 100%; margin: 0; }
  .${className} .intro strong { color: ${WERBELINIE.text}; font-weight: 600; }
  .${className} .points { list-style: none; margin: 0; padding: 0; }
  .${className} .points li { font-size: 11px; line-height: 1.45; color: ${WERBELINIE.muted}; padding-left: 16px; position: relative; margin: 0; }
  .${className} .points li::before { content: ''; position: absolute; left: 0; top: 0.5em; width: 5px; height: 5px; background: ${WERBELINIE.accent}; border-radius: 50%; }
  .${className} .cta { font-family: ${WERBELINIE_FONTS.heading}; font-size: 16px; font-weight: 600; color: ${WERBELINIE.accent}; margin: 0; }
  .${className} .event-date { font-size: 14px; font-weight: 600; color: ${WERBELINIE.accent}; margin: 0; letter-spacing: 0.02em; }
  .${className} .info-kuerze { font-size: 11px; color: ${WERBELINIE.muted}; margin: 0; font-style: italic; }
  .${className} .footer { margin: 6px 0 0 0; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.15); font-size: 10px; color: ${WERBELINIE.muted}; letter-spacing: 0.02em; line-height: 1.4; }
  .${className} .footer strong { color: ${WERBELINIE.text}; }
  .${className} .presse-headline { font-family: ${WERBELINIE_FONTS.heading}; font-size: 28px; font-weight: 600; color: ${WERBELINIE.text}; margin: 0 0 8px 0; }
  .${className} .presse-type { font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: ${WERBELINIE.accent}; margin: 0 0 12px 0; }
  .${className} .presse-body { font-size: 13px; line-height: 1.6; color: ${WERBELINIE.text}; margin: 0; }
  .${className} .presse-block { margin-top: 12px; }
  .${className} .presse-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: ${WERBELINIE.muted}; margin: 0 0 4px 0; }
  `
}

/** Druckformate für PR-Dokumente (Presse, Newsletter, Social Media) – A4, A3, A5 */
export const PR_DOC_FORMATS = {
  a4: { width: '210mm', height: '297mm', pageSize: 'A4', label: 'A4' },
  a3: { width: '297mm', height: '420mm', pageSize: 'A3', label: 'A3 (Plakat)' },
  a5: { width: '148mm', height: '210mm', pageSize: 'A5', label: 'A5' },
} as const

/** CSS für bearbeitbare PR-Dokumente (Presse, Newsletter, Social Media) – Galerie-Design, wählbares Format A4/A3/A5 */
export function getWerbeliniePrDocCss(className: string): string {
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${WERBELINIE_FONTS.body};
    background: #e8e8e8;
    color: ${WERBELINIE.text};
    padding: 20px;
    min-height: 100vh;
    line-height: 1.6;
  }
  body.format-a4 .page { width: 210mm; min-height: 297mm; max-width: 100%; }
  body.format-a3 .page { width: 297mm; min-height: 420mm; max-width: 100%; }
  body.format-a5 .page { width: 148mm; min-height: 210mm; max-width: 100%; }
  .page {
    margin: 0 auto 24px;
    padding: 12mm 14mm;
    background: linear-gradient(165deg, ${WERBELINIE.bg1} 0%, ${WERBELINIE.bg2} 45%, ${WERBELINIE.bg3} 100%);
    color: ${WERBELINIE.text};
    position: relative;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
  }
  .page::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse 80% 50% at 50% -20%, ${WERBELINIE.glowTop}, transparent 50%),
                radial-gradient(ellipse 60% 40% at 85% 100%, ${WERBELINIE.glowBottom}, transparent 45%);
    pointer-events: none;
  }
  .page .content { position: relative; z-index: 1; }
  .header {
    border-bottom: 2px solid ${WERBELINIE.accent};
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .header h1 {
    font-family: ${WERBELINIE_FONTS.heading};
    font-size: clamp(1.4rem, 4vw, 1.9rem);
    color: ${WERBELINIE.text};
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .header-info { font-size: 0.85rem; color: ${WERBELINIE.muted}; line-height: 1.5; }
  h1, h2 {
    font-family: ${WERBELINIE_FONTS.heading};
    color: ${WERBELINIE.text};
    font-weight: 600;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.2);
    padding-bottom: 8px;
  }
  h2 { font-size: 1.2rem; margin-top: 20px; }
  .field-group { margin-bottom: 20px; }
  label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${WERBELINIE.muted};
    margin-bottom: 6px;
    font-weight: 600;
  }
  textarea, input[type="text"] {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.5;
    resize: vertical;
    background: rgba(0,0,0,0.2);
    color: ${WERBELINIE.text};
  }
  textarea:focus, input[type="text"]:focus {
    outline: none;
    border-color: ${WERBELINIE.accent};
    box-shadow: 0 0 0 2px rgba(255,140,66,0.2);
  }
  textarea { min-height: 120px; }
  .no-print {
    background: rgba(0,0,0,0.06);
    border: 1px solid rgba(255,140,66,0.3);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .no-print p { color: #555; margin-top: 8px; font-size: 0.85rem; }
  .no-print button {
    background: ${WERBELINIE.accent};
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    margin: 0 4px 8px 0;
    font-family: inherit;
  }
  .no-print button:hover { filter: brightness(1.1); }
  .no-print button.secondary { background: #6b7280; }
  .info-box {
    background: rgba(0,0,0,0.2);
    border-left: 4px solid ${WERBELINIE.accent};
    padding: 10px 12px;
    margin: 12px 0;
    border-radius: 0 8px 8px 0;
    font-size: 0.9rem;
    color: ${WERBELINIE.text};
  }
  @media print {
    @page { margin: 10mm; size: A4; }
    body { background: #fff !important; padding: 0 !important; font-size: 9pt; line-height: 1.32; min-height: auto !important; }
    .no-print { display: none !important; }
    .page {
      box-shadow: none !important;
      margin: 0 !important;
      padding: 8mm 10mm !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page:not(:last-child) { page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    body.format-a4 .page { width: 210mm !important; min-height: 0 !important; height: auto !important; }
    body.format-a3 .page { width: 297mm !important; min-height: 0 !important; height: auto !important; }
    body.format-a5 .page { width: 148mm !important; min-height: 0 !important; height: auto !important; }
  }
  `
}

/** Design wie Homepage (Design-Tab) – gleiche Felder wie k2-design-settings. Fallback = K2 Terracotta. */
export type HomepageDesign = Record<string, string> & {
  backgroundColor1?: string
  backgroundColor2?: string
  backgroundColor3?: string
  accentColor?: string
  textColor?: string
  mutedColor?: string
  cardBg1?: string
  cardBg2?: string
}

/** Standard wenn kein Design gesetzt (Terracotta = Homepage-Default). */
export const DEFAULT_HOMEPAGE_DESIGN: HomepageDesign = {
  backgroundColor1: '#1c1210',
  backgroundColor2: '#2a1e1a',
  backgroundColor3: '#3d2c26',
  textColor: '#fdf6f2',
  mutedColor: '#c49a88',
  accentColor: '#d97a50',
  cardBg1: 'rgba(45, 34, 30, 0.95)',
  cardBg2: 'rgba(28, 20, 18, 0.92)',
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace(/^#/, '')
  if (h.length !== 6 && h.length !== 3) return `rgba(217, 122, 80, ${alpha})`
  const r = h.length === 6 ? parseInt(h.slice(0, 2), 16) : parseInt(h[0] + h[0], 16)
  const g = h.length === 6 ? parseInt(h.slice(2, 4), 16) : parseInt(h[1] + h[1], 16)
  const b = h.length === 6 ? parseInt(h.slice(4, 6), 16) : parseInt(h[2] + h[2], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Baut aus Homepage-Design die Farbwerte für Werbemittel-CSS (eine Quelle = Design-Tab).
 * Exportiert für Plakat-/Flyer-HTML im Admin.
 */
export function designToPlakatVars(design: HomepageDesign | null | undefined): {
  bodyBg: string
  pageBg: string
  border: string
  accentRgba25: string
  accentRgba20: string
  accent: string
  accentGradient: string
  text: string
  muted: string
  muted2: string
  inputBg: string
  inputBorder: string
  font: string
  btnPrimary: string
  btnSecondary: string
} {
  const d = design && (design.accentColor || design.backgroundColor1) ? design : DEFAULT_HOMEPAGE_DESIGN
  const bg1 = d.backgroundColor1 || DEFAULT_HOMEPAGE_DESIGN.backgroundColor1!
  const bg2 = d.backgroundColor2 || DEFAULT_HOMEPAGE_DESIGN.backgroundColor2!
  const bg3 = d.backgroundColor3 || DEFAULT_HOMEPAGE_DESIGN.backgroundColor3!
  const card1 = d.cardBg1 || 'rgba(45, 34, 30, 0.95)'
  const card2 = d.cardBg2 || 'rgba(28, 20, 18, 0.92)'
  const accent = d.accentColor || DEFAULT_HOMEPAGE_DESIGN.accentColor!
  return {
    bodyBg: `linear-gradient(135deg, ${bg1} 0%, ${bg2} 55%, ${bg3} 100%)`,
    pageBg: `linear-gradient(145deg, ${card1}, ${card2})`,
    border: hexToRgba(accent, 0.2),
    accentRgba25: hexToRgba(accent, 0.25),
    accentRgba20: hexToRgba(accent, 0.2),
    accent,
    accentGradient: `linear-gradient(135deg, ${accent} 0%, ${accent}dd 100%)`,
    text: d.textColor || DEFAULT_HOMEPAGE_DESIGN.textColor!,
    muted: d.mutedColor || DEFAULT_HOMEPAGE_DESIGN.mutedColor!,
    muted2: d.mutedColor || DEFAULT_HOMEPAGE_DESIGN.mutedColor!,
    inputBg: 'rgba(255, 255, 255, 0.05)',
    inputBorder: hexToRgba(accent, 0.35),
    font: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif",
    btnPrimary: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
    btnSecondary: '#6b7280',
  }
}

/**
 * CSS für alle bearbeitbaren Drucksorten und Aussendungen (Presse, Newsletter, Social Media, kombinierte PR-Vorschläge)
 * – abgestimmt auf das Homepage-Design (Design-Tab). Wenn du die Homepage-Farben änderst, ändern sich die Werbemittel mit.
 * @param design Design aus k2-design-settings / k2-oeffentlich-design-settings (oder null = Default Terracotta).
 */
export function getPlakatDesignPrDocCss(className: string, design?: HomepageDesign | null): string {
  const p = designToPlakatVars(design)
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${p.font};
    background: ${p.bodyBg};
    color: ${p.text};
    padding: 20px;
    min-height: 100vh;
    line-height: 1.6;
  }
  body.format-a4 .page { width: 210mm; min-height: 297mm; max-width: 100%; }
  body.format-a3 .page { width: 297mm; min-height: 420mm; max-width: 100%; }
  body.format-a5 .page { width: 148mm; min-height: 210mm; max-width: 100%; }
  .page {
    margin: 0 auto 24px;
    padding: 12mm 14mm;
    background: ${p.pageBg};
    color: ${p.text};
    border: 1px solid ${p.border};
    border-radius: 24px;
    box-shadow: 0 40px 120px rgba(0, 0, 0, 0.55);
    position: relative;
    overflow: hidden;
  }
  .page .content { position: relative; z-index: 1; }
  .header {
    border-bottom: 2px solid ${p.accentRgba25};
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .header h1 {
    font-size: clamp(1.5rem, 4vw, 2.2rem);
    color: ${p.accent};
    font-weight: 700;
    letter-spacing: 0.02em;
    background: ${p.accentGradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .header-info { font-size: 0.9rem; color: ${p.muted2}; line-height: 1.5; }
  h1, h2 {
    font-family: ${p.font};
    color: ${p.accent};
    font-weight: 600;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid ${p.accentRgba20};
  }
  h1 { font-size: 1.6rem; }
  h2 { font-size: 1.2rem; margin-top: 20px; color: ${p.muted}; }
  .field-group { margin-bottom: 20px; }
  label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${p.accent};
    margin-bottom: 6px;
    font-weight: 600;
  }
  textarea, input[type="text"] {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid ${p.inputBorder};
    border-radius: 12px;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.5;
    resize: vertical;
    background: ${p.inputBg};
    color: ${p.text};
  }
  textarea:focus, input[type="text"]:focus {
    outline: none;
    border-color: ${p.accent};
    box-shadow: 0 0 0 2px ${p.accentRgba20};
  }
  textarea { min-height: 120px; }
  .no-print {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid ${p.border};
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .no-print p { color: ${p.muted2}; margin-top: 8px; font-size: 0.85rem; }
  .no-print button {
    background: ${p.btnPrimary};
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    margin: 0 4px 8px 0;
    font-family: inherit;
    box-shadow: 0 10px 30px ${hexToRgba(p.accent, 0.35)};
  }
  .no-print button:hover { filter: brightness(1.1); }
  .no-print button.secondary { background: ${p.btnSecondary}; }
  .info-box {
    background: ${p.inputBg};
    border-left: 4px solid ${p.accent};
    padding: 10px 12px;
    margin: 12px 0;
    border-radius: 0 12px 12px 0;
    font-size: 0.9rem;
    color: ${p.text};
  }
  @media print {
    @page { margin: 10mm; size: A4; }
    body { margin: 0 !important; background: white !important; padding: 0 !important; font-size: 9pt; line-height: 1.32; color: #1a1f3a !important; min-height: auto !important; }
    .no-print { display: none !important; }
    .page {
      box-shadow: none !important;
      margin: 0 !important;
      padding: 8mm 10mm !important;
      background: white !important;
      color: #1a1f3a !important;
      border: 1px solid #ddd !important;
      border-radius: 0 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /* Kein Umbruch nach der letzten Seite – sonst leere Safari-/PDF-Seite */
    .page:not(:last-child) { page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .page .header h1, .page h1, .page h2 {
      color: #1a1f3a !important;
      -webkit-text-fill-color: #1a1f3a !important;
      background: none !important;
      background-image: none !important;
      background-clip: border-box !important;
      -webkit-background-clip: border-box !important;
    }
    .page .header-info, .page label { color: #5c5650 !important; -webkit-text-fill-color: #5c5650 !important; }
    .page .newsletter-subject-line,
    .page .presse-body,
    .page .presse-headline,
    .page .content { color: #1a1f3a !important; -webkit-text-fill-color: #1a1f3a !important; }
    .page textarea, .page input[type="text"] { background: #f9f9f9 !important; color: #1a1f3a !important; border-color: #ccc !important; }
    /* Hohe min-height nur am Bildschirm – im Druck nur Inhaltshöhe (weniger leere Flächen / Umbruch-Chaos) */
    body.format-a4 .page { width: 210mm !important; min-height: 0 !important; height: auto !important; }
    body.format-a3 .page { width: 297mm !important; min-height: 0 !important; height: auto !important; }
    body.format-a5 .page { width: 148mm !important; min-height: 0 !important; height: auto !important; }
  }
  `
}

/**
 * html2canvas wertet @media print nicht aus – bei k2-pr-doc bleiben sonst dunkle Seitenverläufe + Gradient-Titel
 * und heller Text → im PDF fast unsichtbar (Newsletter, Presseaussendung, PR-Vorschläge).
 * Diese Regeln entsprechen sinngleich dem @media print-Block in getPlakatDesignPrDocCss (nur für body.k2-pr-doc).
 */
export function getK2PrDocHtml2canvasCaptureCss(): string {
  return `
    body.k2-pr-doc {
      margin: 0 !important;
      background: #ffffff !important;
      padding: 0 !important;
      font-size: 9pt !important;
      line-height: 1.32 !important;
      color: #1a1f3a !important;
    }
    body.k2-pr-doc .page {
      box-shadow: none !important;
      margin: 0 auto 16px !important;
      padding: 8mm 10mm !important;
      background: #ffffff !important;
      color: #1a1f3a !important;
      border: 1px solid #ddd !important;
      border-radius: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body.k2-pr-doc .page .header h1,
    body.k2-pr-doc .page h1,
    body.k2-pr-doc .page h2 {
      color: #1a1f3a !important;
      -webkit-text-fill-color: #1a1f3a !important;
      background: none !important;
      background-image: none !important;
      background-clip: border-box !important;
      -webkit-background-clip: border-box !important;
    }
    body.k2-pr-doc .page .header-info,
    body.k2-pr-doc .page label {
      color: #5c5650 !important;
      -webkit-text-fill-color: #5c5650 !important;
    }
    body.k2-pr-doc .page .newsletter-subject-line,
    body.k2-pr-doc .page .presse-body,
    body.k2-pr-doc .page .presse-headline {
      color: #1a1f3a !important;
      -webkit-text-fill-color: #1a1f3a !important;
    }
    body.k2-pr-doc .page textarea,
    body.k2-pr-doc .page input[type="text"] {
      background: #f9f9f9 !important;
      color: #1a1f3a !important;
      border-color: #ccc !important;
    }
  `.trim()
}

/** Einheitliche Fallback-Akzentfarbe für Plakat-PDF-Raster, wenn --k2-plakat-pdf-accent fehlt. */
export const PLAKAT_PDF_ACCENT_FALLBACK = '#d97a50'

/**
 * @media print für die Plakat-Box (.plakat) – dieselbe Logik wie PR-Dok (.page): helles Papier,
 * keine Gradienten-Titel (Safari / „Hintergrund drucken“ aus).
 * @page nicht enthalten – Format steuert #print-page-size im Plakat-HTML.
 */
export function getPlakatPosterPrintCss(): string {
  return `
    @media print {
      body { margin: 0; background: white !important; font-size: 9pt; line-height: 1.32; padding: 2mm; min-height: auto !important; }
      .no-print { display: none; }
      .plakat {
        width: 100% !important;
        min-height: 0 !important;
        height: auto !important;
        background: #fff !important;
        color: #1a1f3a !important;
        box-shadow: none !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .plakat h1 {
        color: #1a1f3a !important;
        -webkit-text-fill-color: #1a1f3a !important;
        background: none !important;
        background-image: none !important;
        background-clip: border-box !important;
        -webkit-background-clip: border-box !important;
      }
      .plakat .event-info,
      .plakat .event-info p { color: #333 !important; -webkit-text-fill-color: #333 !important; }
      .plakat .event-info strong { color: #1a1f3a !important; -webkit-text-fill-color: #1a1f3a !important; }
      .plakat .qr-code { background: #f5f5f5 !important; }
      .plakat .qr-code p { color: #555 !important; -webkit-text-fill-color: #555 !important; }
      .plakat .contact,
      .plakat .contact strong { color: #333 !important; -webkit-text-fill-color: #333 !important; }
    }
  `.trim()
}

/**
 * Sportwagenmodus: **eine** CSS-Quelle für html2canvas/jsPDF (Werbemittel), statt Plakat-/PR-Zweig im Admin.
 * Entspricht dem früheren Inline-Block in ScreenshotExportAdmin + getK2PrDocHtml2canvasCaptureCss.
 */
export function getWerbemittelHtml2canvasCaptureCss(safeHtml: string, pdfFormat: 'a4' | 'a3'): string {
  const isK2PrDoc = pdfFormat === 'a4' && /\bk2-pr-doc\b/i.test(safeHtml)
  const isPlakatPreviewScale =
    pdfFormat === 'a3' &&
    (/width:\s*min\(100%,\s*760px\)/i.test(safeHtml) || /plakatWidth:\s*['"]min\(100%,\s*760px\)/i.test(safeHtml))

  const bodyPdfCapture =
    pdfFormat === 'a3'
      ? `html, body { margin: 0 !important; padding: 0 !important; min-height: auto !important; }`
      : `html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; min-height: auto !important; }`

  const plakatH1Raster =
    pdfFormat === 'a3'
      ? `
        .plakat h1 {
          color: var(--k2-plakat-pdf-accent, ${PLAKAT_PDF_ACCENT_FALLBACK}) !important;
          background: none !important;
          background-image: none !important;
          -webkit-text-fill-color: var(--k2-plakat-pdf-accent, ${PLAKAT_PDF_ACCENT_FALLBACK}) !important;
          background-clip: border-box !important;
          -webkit-background-clip: border-box !important;
        }
      `
      : ''

  const extraPlakat = isPlakatPreviewScale
    ? `
          body { padding: 0.5rem !important; }
          .plakat h1 { font-size: 5rem !important; margin-bottom: 3rem !important; }
          .plakat > h1 + p { font-size: 2rem !important; }
          .plakat .event-info { font-size: 2rem !important; margin: 2rem 0 !important; }
          .plakat .event-info strong { font-size: 2.2rem !important; }
          .plakat .event-info p[style*="font-size"] { font-size: 2rem !important; }
          .plakat p[style*="margin-top: 2rem"] { font-size: 1.6rem !important; }
          .plakat .qr-code { margin: 3rem 0 !important; padding: 2rem !important; }
          .plakat .qr-code img { width: 250px !important; height: 250px !important; }
          .plakat .qr-code p { font-size: 1.2rem !important; }
          .plakat .contact { font-size: 1.5rem !important; padding-top: 2rem !important; }
          .plakat .contact strong { font-size: 1.8rem !important; }
        `
    : ''

  const k2Pr = isK2PrDoc ? getK2PrDocHtml2canvasCaptureCss() : ''

  return `
        .no-print { display: none !important; }
        ${bodyPdfCapture}
        ${plakatH1Raster}
        ${extraPlakat}
        ${k2Pr}
      `.trim()
}

function solidifyGradientHeadingsOnClone(el: HTMLElement): void {
  el.style.setProperty('color', '#1a1f3a', 'important')
  el.style.setProperty('-webkit-text-fill-color', '#1a1f3a', 'important')
  el.style.setProperty('background', 'none', 'important')
  el.style.setProperty('background-image', 'none', 'important')
  el.style.setProperty('background-clip', 'border-box', 'important')
  el.style.setProperty('-webkit-background-clip', 'border-box', 'important')
}

/**
 * onclone-Ergänzung für html2pdf: gleiche Zieloptik wie getWerbemittelHtml2canvasCaptureCss (DOM-Seite).
 */
export function applyWerbemittelCaptureToClone(
  clonedDoc: Document,
  safeHtml: string,
  pdfFormat: 'a4' | 'a3'
): void {
  if (pdfFormat === 'a3') {
    let accent = ''
    try {
      accent = getComputedStyle(clonedDoc.documentElement).getPropertyValue('--k2-plakat-pdf-accent').trim()
    } catch {
      accent = ''
    }
    if (!accent) accent = PLAKAT_PDF_ACCENT_FALLBACK
    clonedDoc.querySelectorAll('.plakat h1').forEach(n => {
      const h = n as HTMLElement
      h.style.setProperty('color', accent, 'important')
      h.style.setProperty('-webkit-text-fill-color', accent, 'important')
      h.style.setProperty('background', 'none', 'important')
      h.style.setProperty('background-image', 'none', 'important')
      h.style.setProperty('background-clip', 'border-box', 'important')
      h.style.setProperty('-webkit-background-clip', 'border-box', 'important')
    })
  }
  if (pdfFormat === 'a4' && /\bk2-pr-doc\b/i.test(safeHtml)) {
    const solidHeading = (sel: string) => {
      clonedDoc.querySelectorAll(sel).forEach(n => solidifyGradientHeadingsOnClone(n as HTMLElement))
    }
    solidHeading('body.k2-pr-doc .page .header h1')
    solidHeading('body.k2-pr-doc .page h1')
    solidHeading('body.k2-pr-doc .page h2')
    clonedDoc.querySelectorAll('body.k2-pr-doc .page .header-info').forEach(n => {
      const h = n as HTMLElement
      h.style.setProperty('color', '#5c5650', 'important')
      h.style.setProperty('-webkit-text-fill-color', '#5c5650', 'important')
    })
    clonedDoc.querySelectorAll(
      'body.k2-pr-doc .page .newsletter-subject-line, body.k2-pr-doc .page .presse-body, body.k2-pr-doc .page .presse-headline'
    ).forEach(n => {
      const h = n as HTMLElement
      h.style.setProperty('color', '#1a1f3a', 'important')
      h.style.setProperty('-webkit-text-fill-color', '#1a1f3a', 'important')
    })
    clonedDoc.querySelectorAll('body.k2-pr-doc').forEach(n => {
      ;(n as HTMLElement).style.setProperty('background', '#ffffff', 'important')
    })
    clonedDoc.querySelectorAll('body.k2-pr-doc .page').forEach(n => {
      const h = n as HTMLElement
      h.style.setProperty('background', '#ffffff', 'important')
      h.style.setProperty('color', '#1a1f3a', 'important')
    })
  }
}

/**
 * CSS für PR-Dokumente im VK2-Kontext – hell wie VK2/Admin (WERBEUNTERLAGEN_STIL), nicht dunkles K2-Design.
 */
export function getWerbeliniePrDocCssVk2(className: string): string {
  const s = {
    bg: '#f6f4f0',
    pageBg: '#fffefb',
    text: '#1c1a18',
    muted: '#5c5650',
    accent: '#b54a1e',
    border: 'rgba(28, 26, 24, 0.12)',
    inputBg: '#fff',
  }
  return `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: ${WERBELINIE_FONTS.body};
    background: ${s.bg};
    color: ${s.text};
    padding: 20px;
    min-height: 100vh;
    line-height: 1.6;
  }
  body.format-a4 .page { width: 210mm; min-height: 297mm; max-width: 100%; }
  body.format-a3 .page { width: 297mm; min-height: 420mm; max-width: 100%; }
  body.format-a5 .page { width: 148mm; min-height: 210mm; max-width: 100%; }
  .page {
    margin: 0 auto 24px;
    padding: 12mm 14mm;
    background: ${s.pageBg};
    color: ${s.text};
    position: relative;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(0,0,0,0.08);
    border: 1px solid ${s.border};
  }
  .page .content { position: relative; z-index: 1; }
  .header {
    border-bottom: 2px solid ${s.accent};
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .header h1 {
    font-family: ${WERBELINIE_FONTS.heading};
    font-size: clamp(1.4rem, 4vw, 1.9rem);
    color: ${s.text};
    font-weight: 600;
    letter-spacing: -0.02em;
  }
  .header-info { font-size: 0.85rem; color: ${s.muted}; line-height: 1.5; }
  h1, h2 {
    font-family: ${WERBELINIE_FONTS.heading};
    color: ${s.text};
    font-weight: 600;
    margin-bottom: 10px;
    border-bottom: 1px solid ${s.border};
    padding-bottom: 8px;
  }
  h2 { font-size: 1.2rem; margin-top: 20px; }
  .field-group { margin-bottom: 20px; }
  label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: ${s.muted};
    margin-bottom: 6px;
    font-weight: 600;
  }
  textarea, input[type="text"] {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid ${s.border};
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.95rem;
    line-height: 1.5;
    resize: vertical;
    background: ${s.inputBg};
    color: ${s.text};
  }
  textarea:focus, input[type="text"]:focus {
    outline: none;
    border-color: ${s.accent};
    box-shadow: 0 0 0 2px rgba(181, 74, 30, 0.15);
  }
  textarea { min-height: 120px; }
  .no-print {
    background: ${s.pageBg};
    border: 1px solid ${s.border};
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .no-print p { color: ${s.muted}; margin-top: 8px; font-size: 0.85rem; }
  .no-print button {
    background: ${s.accent};
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    margin: 0 4px 8px 0;
    font-family: inherit;
  }
  .no-print button:hover { filter: brightness(1.08); }
  .no-print button.secondary { background: #6b7280; }
  .info-box {
    background: rgba(181, 74, 30, 0.06);
    border-left: 4px solid ${s.accent};
    padding: 10px 12px;
    margin: 12px 0;
    border-radius: 0 8px 8px 0;
    font-size: 0.9rem;
    color: ${s.text};
  }
  @media print {
    @page { margin: 10mm; size: A4; }
    body { background: #fff !important; padding: 0 !important; font-size: 9pt; line-height: 1.32; min-height: auto !important; }
    .no-print { display: none !important; }
    .page {
      box-shadow: none !important;
      margin: 0 !important;
      padding: 8mm 10mm !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page:not(:last-child) { page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    body.format-a4 .page { width: 210mm !important; min-height: 0 !important; height: auto !important; }
    body.format-a3 .page { width: 297mm !important; min-height: 0 !important; height: auto !important; }
    body.format-a5 .page { width: 148mm !important; min-height: 0 !important; height: auto !important; }
  }
  `
}

/**
 * Eigenes Promotion-Design für Werbeunterlagen – bewusst NICHT am App-Design orientiert.
 * Eigene Ideen für die Promotion: eigenständige Farben, Typo und Stil.
 */
export const WERBEUNTERLAGEN_STIL = {
  /* Hell, warm, redaktionell – Admin wirkt seriös, eine klare Farbsprache */
  bgDark: '#f6f4f0',
  bgCard: '#fffefb',
  bgElevated: '#ebe8e2',
  accent: '#b54a1e',
  accentSoft: 'rgba(181, 74, 30, 0.12)',
  text: '#1c1a18',
  muted: '#5c5650',
  gradient: 'linear-gradient(180deg, #fffefb 0%, #f0ebe5 50%, #e8e2da 100%)',
  gradientAccent: 'linear-gradient(135deg, #b54a1e 0%, #d4622a 100%)',
  /** Sekundäraktionen (z. B. Sammeldruck) – dezent, kein knalliges Lila */
  gradientSecondary: 'linear-gradient(135deg, #5c5c57 0%, #4a4a45 100%)',
  /** Gefahr/Löschen – gedämpftes Rot, kein Neon-Pink */
  gradientDanger: 'linear-gradient(135deg, #b54a35 0%, #9b3a28 100%)',
  fontHeading: "'Playfair Display', Georgia, serif",
  fontBody: "'Source Sans 3', -apple-system, sans-serif",
  radius: '8px',
  shadow: '0 12px 40px rgba(28, 26, 24, 0.08)',
} as const

/** Google Fonts für Promotion (eigenes Design) */
export const PROMO_FONTS_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Source+Sans+3:wght@300;400;600&display=swap'

/** Social-Media-Standardmaße (Pixel) für Masken/Vorlagen */
export const SOCIAL_MEDIA_FORMATE = {
  instagramSquare: { w: 1080, h: 1080, label: 'Instagram Quadrat' },
  instagramStory: { w: 1080, h: 1920, label: 'Instagram Story' },
  facebookPost: { w: 1200, h: 630, label: 'Facebook Beitrag' },
  linkedInBg: { w: 1200, h: 627, label: 'LinkedIn Hintergrund' },
} as const
