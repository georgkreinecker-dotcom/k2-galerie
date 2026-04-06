/**
 * Vita-Dokument im Nutzer-Design (Design-Einstellungen).
 * Für Popup aus der Galerie, Admin-Vorschau, Druck/PDF.
 */

import {
  lineLooksLikeVitaListItem,
  isShortSectionTitleLine,
  mergeHeadingBeforeListBlocks,
} from './vitaTextStructured'

export interface VitaDesign {
  accentColor?: string
  backgroundColor1?: string
  textColor?: string
  mutedColor?: string
}

export interface VitaPersonData {
  name: string
  email?: string
  phone?: string
  website?: string
  vita?: string
}

const DEFAULT_DESIGN: Required<VitaDesign> = {
  accentColor: '#5a7a6e',
  backgroundColor1: '#f6f4f0',
  textColor: '#2d2d2a',
  mutedColor: '#5c5c57',
}

function esc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Strukturierter Vita-Text → HTML (Absätze, Überschriften, Listen). */
function buildStructuredVitaHtml(vitaText: string): string {
  if (!vitaText.trim()) {
    return '<p class="prose-empty">(Keine Vita hinterlegt.)</p>'
  }
  const paragraphs = mergeHeadingBeforeListBlocks(
    vitaText.split(/\n\n+/).map((p) => p.trim()).filter(Boolean),
  )
  const parts: string[] = []
  let firstSectionH2 = true

  paragraphs.forEach((block, pi) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) return

    if (lines.length === 1) {
      parts.push(`<p>${esc(lines[0])}</p>`)
      return
    }

    const [head, ...rest] = lines
    const restAllList = rest.length >= 1 && rest.every((l) => lineLooksLikeVitaListItem(l))
    if (isShortSectionTitleLine(head) && restAllList && rest.length >= 1) {
      const mt = firstSectionH2 ? '0' : '1.65em'
      firstSectionH2 = false
      parts.push(`<h2 class="vita-section" style="margin-top:${mt}">${esc(head)}</h2>`)
      parts.push(`<ul class="vita-list">${rest.map((line) => `<li>${esc(line)}</li>`).join('')}</ul>`)
      return
    }

    const allList = lines.length >= 2 && lines.every((l) => lineLooksLikeVitaListItem(l))
    if (allList) {
      parts.push(`<ul class="vita-list">${lines.map((line) => `<li>${esc(line)}</li>`).join('')}</ul>`)
      return
    }

    parts.push(`<p>${lines.map((line) => esc(line)).join('<br />')}</p>`)
  })

  return `<div class="prose">${parts.join('\n')}</div>`
}

function normalizeWebHref(url: string): string {
  const t = url.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

/** Heller Hintergrund → false, dunkle Galerie-Flächen → true (Kontrast für Links). */
function isDarkBackgroundHex(hex: string): boolean {
  const m = String(hex).trim().match(/^#?([0-9a-f]{6})$/i)
  if (!m) return false
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return lum < 0.42
}

/**
 * Erzeugt eine HTML-Seite mit der Vita einer Person im Nutzer-Design.
 */
export function buildVitaDocumentHtml(
  personId: 'martina' | 'georg',
  data: VitaPersonData,
  design: VitaDesign = {},
  galleryName?: string
): string {
  const d = { ...DEFAULT_DESIGN, ...design }
  const accent = d.accentColor
  const bg = d.backgroundColor1
  const text = d.textColor
  const muted = d.mutedColor
  const darkBg = isDarkBackgroundHex(bg)
  const name = data.name || (personId === 'martina' ? 'Künstler:in 1' : 'Künstler:in 2')
  const title = `Vita – ${name}`
  const vitaHtml = buildStructuredVitaHtml(data.vita || '')

  const contactRows: string[] = []
  if (data.email) {
    const raw = String(data.email).trim()
    contactRows.push(
      `<p class="contact-line"><span class="contact-label">E-Mail</span><a class="contact-value" href="mailto:${encodeURIComponent(raw)}">${esc(raw)}</a></p>`,
    )
  }
  if (data.phone) {
    const raw = String(data.phone).trim()
    const telHref = raw.replace(/[^\d+]/g, '') || raw
    contactRows.push(
      `<p class="contact-line"><span class="contact-label">Telefon</span><a class="contact-value" href="tel:${esc(telHref)}">${esc(raw)}</a></p>`,
    )
  }
  if (data.website) {
    const w = String(data.website).trim()
    const href = normalizeWebHref(w)
    contactRows.push(
      `<p class="contact-line"><span class="contact-label">Web</span><a class="contact-value" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(w)}</a></p>`,
    )
  }

  const contactBlock =
    contactRows.length > 0
      ? `<section class="contact-block" aria-label="Kontakt">
  <h2 class="contact-title">Kontakt</h2>
  ${contactRows.join('\n  ')}
</section>`
      : ''

  const footer = galleryName
    ? `<footer class="vita-footer"><p>${esc(galleryName)}</p></footer>`
    : ''

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <style>
    :root {
      --vita-bg: ${bg};
      --vita-text: ${text};
      --vita-muted: ${muted};
      --vita-accent: ${accent};
      --vita-rule: ${darkBg ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)'};
    }
    * { box-sizing: border-box; }
    html { -webkit-font-smoothing: antialiased; }
    body {
      font-family: Georgia, 'Noto Serif', 'Times New Roman', serif;
      margin: 0 auto;
      max-width: 40rem;
      min-height: 100vh;
      padding: clamp(1.75rem, 5vw, 3rem) clamp(1.15rem, 4vw, 1.75rem) clamp(2.25rem, 6vw, 3.5rem);
      line-height: 1.82;
      color: var(--vita-text);
      background: var(--vita-bg);
    }
    body.vita-dark-bg a.contact-value {
      color: color-mix(in srgb, var(--vita-accent) 70%, #ffffff);
    }
    body.vita-dark-bg a.contact-value:hover {
      color: color-mix(in srgb, var(--vita-accent) 50%, #ffffff);
    }
    .kicker {
      margin: 0 0 0.65rem;
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      font-size: 0.82rem;
      font-weight: 750;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--vita-accent);
    }
    h1 {
      margin: 0 0 1.65rem;
      padding-bottom: 0.75rem;
      font-size: clamp(1.75rem, 4.5vw, 2.25rem);
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: 0.02em;
      border-bottom: 2px solid var(--vita-rule);
      color: var(--vita-text);
    }
    .prose { font-size: clamp(1.03rem, 2.5vw, 1.12rem); }
    .prose > p:first-of-type {
      font-size: 1.07em;
      line-height: 1.78;
    }
    .prose p {
      margin: 0 0 1.2em;
      max-width: 62ch;
      text-align: left;
      hyphens: auto;
      -webkit-hyphens: auto;
    }
    .prose p:last-child { margin-bottom: 0; }
    .prose-empty { color: var(--vita-muted); font-style: italic; }
    h2.vita-section {
      margin: 1.65em 0 0.65em;
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      font-size: clamp(1.08rem, 2.6vw, 1.22rem);
      font-weight: 650;
      letter-spacing: 0.02em;
      line-height: 1.35;
      color: var(--vita-text);
      border-bottom: 1px solid var(--vita-rule);
      padding-bottom: 0.4rem;
    }
    h2.vita-section:first-of-type { margin-top: 0; }
    ul.vita-list {
      margin: 0 0 1.35em;
      padding-left: 1.2rem;
      list-style-position: outside;
    }
    ul.vita-list li {
      margin-bottom: 0.45em;
      padding-left: 0.2rem;
      line-height: 1.65;
    }
    .contact-block {
      margin-top: 2.25rem;
      padding-top: 1.35rem;
      border-top: 1px solid var(--vita-rule);
    }
    .contact-title {
      margin: 0 0 0.85rem;
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--vita-muted);
    }
    .contact-line {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.35rem 0.75rem;
      margin: 0.5rem 0;
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .contact-label {
      flex: 0 0 4.5rem;
      color: var(--vita-muted);
      font-weight: 600;
    }
    a.contact-value {
      color: var(--vita-accent);
      text-decoration: underline;
      text-underline-offset: 2px;
      word-break: break-word;
    }
    .vita-footer {
      margin-top: 2.5rem;
      padding-top: 1.15rem;
      border-top: 1px solid var(--vita-rule);
      text-align: center;
    }
    .vita-footer p {
      margin: 0;
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      font-size: 0.82rem;
      color: var(--vita-muted);
      line-height: 1.45;
    }
    @media print {
      @page { margin: 12mm 14mm; size: A4; }
      body {
        min-height: auto;
        max-width: none;
        padding: 0;
        font-size: 10.5pt;
        line-height: 1.45;
        background: #fff !important;
        color: #111 !important;
      }
      h1 {
        font-size: 16pt;
        border-bottom-color: #333;
      }
      .kicker { color: #333 !important; }
      .prose { font-size: 10.5pt; }
      .prose p { max-width: none; }
      a.contact-value { color: #111 !important; text-decoration: none; }
      .contact-block { border-top-color: #ccc; }
      .vita-footer { border-top-color: #ccc; }
    }
  </style>
</head>
<body class="${darkBg ? 'vita-dark-bg' : ''}">
  <p class="kicker">Vita</p>
  <h1>${esc(name)}</h1>
  ${vitaHtml}
  ${contactBlock}
  ${footer}
</body>
</html>`
}
