/**
 * Gemeinsame Logik: Vita-Fließtext → Absätze / Zwischenüberschrift / Jahreslisten.
 * Nutzung: VitaPage (React) und vitaDocument.ts (HTML-String für Druck/PDF/Popup).
 */

export function lineLooksLikeVitaListItem(line: string): boolean {
  const t = line.trim()
  if (/^\d{4}\s*[–-]/.test(t)) return true
  if (/^Seit\s+20\d{2}/i.test(t)) return true
  if (/^Es\s+folgten/i.test(t)) return true
  return false
}

export function isShortSectionTitleLine(line: string): boolean {
  const t = line.trim()
  if (t.length > 72) return false
  if (t.length < 4) return false
  if (/[.!?]\s*$/.test(t)) return false
  return true
}

export function mergeHeadingBeforeListBlocks(blocks: string[]): string[] {
  const out: string[] = []
  let i = 0
  while (i < blocks.length) {
    const cur = blocks[i]
    const next = blocks[i + 1]
    const curLines = cur.split('\n').map((l) => l.trim()).filter(Boolean)
    if (curLines.length === 1 && next && isShortSectionTitleLine(curLines[0])) {
      const nextLines = next.split('\n').map((l) => l.trim()).filter(Boolean)
      const nextAllList = nextLines.length >= 2 && nextLines.every((l) => lineLooksLikeVitaListItem(l))
      if (nextAllList) {
        out.push(`${curLines[0]}\n${next}`)
        i += 2
        continue
      }
    }
    out.push(cur)
    i += 1
  }
  return out
}
