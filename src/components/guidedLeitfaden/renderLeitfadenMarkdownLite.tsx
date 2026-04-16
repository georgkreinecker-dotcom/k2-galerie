/** Gemeinsame **Markdown-lite**-Darstellung für Leitfaden-Sheets (Familie, ök2, …). */
import { type ReactNode } from 'react'

export function renderLeitfadenInline(markdownLite: string): ReactNode {
  const parts = markdownLite.split(/\*\*(.+?)\*\*/g)
  return parts.map((chunk, i) => (i % 2 === 1 ? <strong key={i}>{chunk}</strong> : <span key={i}>{chunk}</span>))
}

/** Absätze bei `\n\n` – jeweils eigenes `<p>` im umgebenden `div` (kein p-in-p). */
export function renderLeitfadenText(markdownLite: string): ReactNode {
  const paras = markdownLite.split(/\n\n/).filter(Boolean)
  return paras.map((para, pi) => (
    <p key={pi} style={{ margin: pi === 0 ? 0 : '0.65rem 0 0' }}>
      {renderLeitfadenInline(para.trim())}
    </p>
  ))
}
