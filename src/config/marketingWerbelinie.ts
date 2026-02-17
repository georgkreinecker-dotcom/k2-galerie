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
    body { background: #fff !important; padding: 0 !important; }
    .no-print { display: none !important; }
    .page {
      box-shadow: none !important;
      margin: 0 !important;
      page-break-after: always;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body.format-a4 .page { width: 210mm !important; min-height: 297mm !important; }
    body.format-a3 .page { width: 297mm !important; min-height: 420mm !important; }
    body.format-a5 .page { width: 148mm !important; min-height: 210mm !important; }
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
