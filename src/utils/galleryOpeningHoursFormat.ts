/**
 * Öffnungszeiten für Galerie, Flyer, Impressum: Freitext + optional Wochentabelle.
 * Eine Quelle – viele Aufrufer (vgl. FlyerEventBogenNeuPage).
 */
export function formatGalleryOpeningHoursBlock(gallery: {
  openingHours?: string
  openingHoursWeek?: Record<string, string>
}): string {
  const lines: string[] = []
  const oh = String(gallery?.openingHours || '').trim()
  if (oh) lines.push(oh)
  const w = gallery?.openingHoursWeek
  if (w && typeof w === 'object' && !Array.isArray(w)) {
    const dayOrder: [string, string][] = [
      ['montag', 'Mo'],
      ['dienstag', 'Di'],
      ['mittwoch', 'Mi'],
      ['donnerstag', 'Do'],
      ['freitag', 'Fr'],
      ['samstag', 'Sa'],
      ['sonntag', 'So'],
    ]
    for (const [key, label] of dayOrder) {
      const val = w[key]
      if (val != null && String(val).trim()) lines.push(`${label}: ${String(val).trim()}`)
    }
  }
  return lines.join('\n')
}
