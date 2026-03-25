/**
 * Lesbare Vorschau für den Texte-Schreibtisch (helles „Papier“, nicht Notiz-Dunkel).
 * Gleiche Markdown-Grundlagen wie georgsNotizMarkdownView – andere Farben.
 */
import { type ReactNode } from 'react'

const paper = {
  h1: { margin: '0 0 0.35rem' as const, fontSize: '1.05rem' as const, fontWeight: 800 as const, color: '#1c1a18' },
  h2: { margin: '0.65rem 0 0.25rem' as const, fontSize: '0.95rem' as const, fontWeight: 700 as const, color: '#5c3d2e' },
  p: { margin: '0 0 0.45rem' as const, color: '#1c1a18', lineHeight: 1.45 as const },
  hr: { border: 'none', borderTop: '1px solid rgba(28,26,24,0.12)', margin: '0.45rem 0' },
  ul: { margin: '0.25rem 0 0.45rem 1.1rem', paddingLeft: '0.85rem' },
  li: { marginBottom: '0.2rem' },
  table: { width: '100%', borderCollapse: 'collapse' as const, margin: '0.35rem 0', fontSize: '0.78rem' },
  th: {
    border: '1px solid rgba(28,26,24,0.15)',
    padding: '0.25rem 0.4rem',
    textAlign: 'left' as const,
    background: 'rgba(181,74,30,0.08)',
    fontWeight: 700,
  },
  td: { border: '1px solid rgba(28,26,24,0.1)', padding: '0.25rem 0.4rem' },
  a: { color: '#b54a1e', textDecoration: 'underline' },
  strong: { fontWeight: 700, color: '#1c1a18' },
  em: { fontStyle: 'italic' as const },
}

function renderInline(s: string, startKey: number): ReactNode[] {
  const out: ReactNode[] = []
  let key = startKey
  let rest = s
  while (rest.length) {
    const b = rest.match(/^\*\*([^*]+)\*\*/)
    const e = rest.match(/^\*([^*]+)\*/)
    if (b) {
      out.push(<strong key={key++} style={paper.strong}>{b[1]}</strong>)
      rest = rest.slice(b[0].length)
    } else if (e) {
      out.push(<em key={key++} style={paper.em}>{e[1]}</em>)
      rest = rest.slice(e[0].length)
    } else {
      const next = rest.search(/\*\*|\*/)
      if (next < 0) {
        out.push(rest)
        break
      }
      out.push(rest.slice(0, next))
      rest = rest.slice(next + (rest.startsWith('**', next) ? 2 : 1))
    }
  }
  return out
}

function renderInlineLinks(text: string): ReactNode {
  const parts: ReactNode[] = []
  let rest = text
  let key = 0
  const linkRe = /\[([^\]]+)\]\((https?:[^)]+)\)/g
  let match: RegExpExecArray | null
  let lastIndex = 0
  while ((match = linkRe.exec(rest)) !== null) {
    if (match.index > lastIndex) {
      const before = rest.slice(lastIndex, match.index)
      parts.push(...renderInline(before, key))
      key += 100
    }
    parts.push(
      <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" style={paper.a}>
        {match[1]}
      </a>
    )
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < rest.length) parts.push(...renderInline(rest.slice(lastIndex), key))
  return parts.length === 1 ? parts[0] : <>{parts}</>
}

/** Vollständiger Fließtext als Vorschau (Bearbeiten bleibt Plain-Text). */
export function renderSchreibtischMarkdownPreview(text: string): ReactNode[] {
  const lines = text.split('\n')
  const out: ReactNode[] = []
  let i = 0
  const key = () => `p-${i}`

  while (i < lines.length) {
    const line = lines[i]
    const t = line.trim()

    if (t === '') {
      out.push(<div key={key()} style={{ height: '0.35rem' }} />)
      i++
      continue
    }

    if (line.startsWith('# ')) {
      out.push(<h1 key={key()} style={paper.h1}>{line.slice(2).trim()}</h1>)
      i++
      continue
    }
    if (line.startsWith('## ')) {
      out.push(<h2 key={key()} style={paper.h2}>{line.slice(3).trim()}</h2>)
      i++
      continue
    }
    if (t === '---' || /^---+$/.test(t)) {
      out.push(<hr key={key()} style={paper.hr} />)
      i++
      continue
    }

    const imgLine = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imgLine) {
      out.push(
        <p key={key()} style={{ ...paper.p, textAlign: 'center' as const }}>
          <img
            src={imgLine[2]}
            alt={imgLine[1] || 'Bild'}
            style={{ maxWidth: '100%', height: 'auto', borderRadius: 6 }}
          />
        </p>
      )
      i++
      continue
    }

    if (line.startsWith('|') && line.includes('|', 1)) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const row = lines[i]
          .split('|')
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        if (row.length && !row.every((c) => /^[-:\s]+$/.test(c))) rows.push(row)
        i++
      }
      if (rows.length) {
        const [head, ...body] = rows
        out.push(
          <div key={key()}>
            <table style={paper.table}>
              {head && (
                <thead>
                  <tr>
                    {head.map((c, j) => (
                      <th key={j} style={paper.th}>
                        {renderInlineLinks(c)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {body.map((row, r) => (
                  <tr key={r}>
                    {row.map((c, j) => (
                      <td key={j} style={paper.td}>
                        {renderInlineLinks(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: ReactNode[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(
          <li key={items.length} style={paper.li}>
            {renderInlineLinks(lines[i].slice(2).trim())}
          </li>
        )
        i++
      }
      out.push(
        <ul key={key()} style={paper.ul}>
          {items}
        </ul>
      )
      continue
    }

    out.push(
      <p key={key()} style={paper.p}>
        {renderInlineLinks(line)}
      </p>
    )
    i++
  }
  return out
}

/** Kurzer Ausschnitt für Mini-Zettel (Hängordner) – nur erste N Zeichen sinnvoll rendern */
export function archivSnippetForPreview(volltext: string, maxLen = 900): string {
  const t = volltext.trim()
  if (t.length <= maxLen) return t
  return `${t.slice(0, maxLen)}…`
}
