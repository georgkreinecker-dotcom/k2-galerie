/**
 * Vita-Dokument im gleichen Design wie Einladung/Presse (Nutzer-Design).
 * Für Außenkommunikation, Galeriegestaltung, Druck/PDF.
 */

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

/** Vita-Text in Absätze umwandeln (Doppel-Zeilenumbruch = neuer Absatz). */
function vitaToHtml(vitaText: string): string {
  if (!vitaText || !vitaText.trim()) return '<p class="meta">(Keine Vita hinterlegt.)</p>'
  const blocks = vitaText.trim().split(/\n\n+/)
  return blocks
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      const safe = trimmed.split('\n').map((l) => esc(l)).join('<br />')
      return `<p>${safe}</p>`
    })
    .filter(Boolean)
    .join('\n')
}

/**
 * Erzeugt eine HTML-Seite mit der Vita einer Person im gleichen Design wie Einladung/Presse.
 * @param personId – 'martina' | 'georg' (für Titel/Fallback)
 * @param data – Name, Kontakt, Vita-Text
 * @param design – Farben aus Design-Einstellungen
 * @param galleryName – optional, z. B. für Footer
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
  const name = data.name || (personId === 'martina' ? 'Künstler:in 1' : 'Künstler:in 2')
  const title = `Vita – ${name}`
  const vitaHtml = vitaToHtml(data.vita || '')
  const contact: string[] = []
  if (data.email) contact.push(`E-Mail: ${esc(data.email)}`)
  if (data.phone) contact.push(`Telefon: ${esc(data.phone)}`)
  if (data.website) contact.push(`Web: ${esc(data.website)}`)
  const contactBlock =
    contact.length > 0
      ? `<p class="meta" style="margin-top:1.5rem;">${contact.join(' &middot; ')}</p>`
      : ''
  const footer = galleryName ? `<p class="meta" style="margin-top:2rem;">${esc(galleryName)}</p>` : ''

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${esc(title)}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 2rem 1.5rem; line-height: 1.65; color: ${text}; background: ${bg}; }
    h1 { font-size: 1.6rem; border-bottom: 3px solid ${accent}; padding-bottom: 0.5rem; margin-top: 0; }
    p { margin: 0.75rem 0; }
    .meta { color: ${muted}; font-size: 0.95rem; }
    @media print { @page { margin: 10mm; size: A4; } body { background: #fff; color: #111; font-size: 9pt; line-height: 1.32; padding: 4mm 6mm; } h1 { border-color: #333; font-size: 1.15rem; margin-bottom: 0.3rem; } p { margin: 0.2rem 0; } .meta { color: #555; font-size: 8.5pt; } }
  </style>
</head>
<body>
  <h1>${esc(name)}</h1>
  <p class="meta">Vita</p>
  ${vitaHtml}
  ${contactBlock}
  ${footer}
</body>
</html>`
}
