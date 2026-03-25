import { type CSSProperties, type ReactNode } from 'react'

/** Schreibtisch (warm) – kein dunkles Vollbild; Text liegt auf „Papier“ im Container. */
export const georgsNotizPageStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(165deg, #e8dcc8 0%, #f0e6d4 35%, #ebe0cf 70%, #e2d3bc 100%)',
  color: '#1c1a18',
  padding: '1.25rem 1rem 2.5rem',
  fontFamily: 'Georgia, "Times New Roman", serif',
}

/** A4-nah: helles Blatt, Schatten, gut lesbar (wie Lesepapier, nicht Textwand-Nachtmodus). */
export const georgsNotizContainerStyle: CSSProperties = {
  maxWidth: 720,
  margin: '0 auto',
  lineHeight: 1.65,
  fontSize: '1.05rem',
  background: '#fffefb',
  borderRadius: 14,
  border: '1px solid rgba(28,26,24,0.1)',
  boxShadow: '0 10px 40px rgba(28,26,24,0.1), 0 2px 10px rgba(28,26,24,0.06)',
  padding: '1.5rem 1.35rem 2rem',
  boxSizing: 'border-box',
}

export const georgsNotizBackLinkStyle: CSSProperties = {
  color: '#5c5650',
  fontSize: '0.9rem',
  textDecoration: 'none',
  display: 'inline-block',
  marginBottom: '1rem',
  fontWeight: 600,
}

export const georgsNotizBaseStyles = {
  h1: { margin: '0 0 0.5rem' as const, fontSize: '1.65rem' as const, fontWeight: 800 as const, color: '#1c1a18', lineHeight: 1.25 as const },
  h2: { margin: '1.35rem 0 0.5rem' as const, fontSize: '1.15rem' as const, fontWeight: 700 as const, color: '#b54a1e' },
  p: { margin: '0 0 1rem' as const, color: '#1c1a18' },
  hr: { border: 'none', borderTop: '1px solid rgba(28,26,24,0.12)', margin: '1.35rem 0' },
  ul: { margin: '0.5rem 0 1rem 1.5rem', paddingLeft: '1rem' },
  li: { marginBottom: '0.35rem' },
  table: { width: '100%', borderCollapse: 'collapse' as const, margin: '0.75rem 0', fontSize: '0.95rem' },
  th: {
    border: '1px solid rgba(28,26,24,0.12)',
    padding: '0.5rem 0.75rem',
    textAlign: 'left' as const,
    background: 'rgba(181,74,30,0.08)',
    color: '#1c1a18',
    fontWeight: 700,
  },
  td: { border: '1px solid rgba(28,26,24,0.1)', padding: '0.5rem 0.75rem', color: '#1c1a18' },
  a: { color: '#b54a1e', textDecoration: 'underline' },
  strong: { fontWeight: 700, color: '#1c1a18' },
  em: { fontStyle: 'italic' as const },
}

const baseStyles = georgsNotizBaseStyles

function renderBoldItalic(s: string, startKey: number): ReactNode[] {
  const out: ReactNode[] = []
  let key = startKey
  let rest = s
  while (rest.length) {
    const b = rest.match(/^\*\*([^*]+)\*\*/)
    const e = rest.match(/^\*([^*]+)\*/)
    if (b) {
      out.push(<strong key={key++} style={baseStyles.strong}>{b[1]}</strong>)
      rest = rest.slice(b[0].length)
    } else if (e) {
      out.push(<em key={key++} style={baseStyles.em}>{e[1]}</em>)
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

export function renderGeorgsNotizInline(text: string): ReactNode {
  const parts: ReactNode[] = []
  let rest = text
  let key = 0
  const linkRe = /\[([^\]]+)\]\((https?:[^)]+)\)/g
  let match: RegExpExecArray | null
  let lastIndex = 0
  while ((match = linkRe.exec(rest)) !== null) {
    if (match.index > lastIndex) {
      const before = rest.slice(lastIndex, match.index)
      parts.push(...renderBoldItalic(before, key))
      key += 100
    }
    parts.push(<a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" style={baseStyles.a}>{match[1]}</a>)
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < rest.length) parts.push(...renderBoldItalic(rest.slice(lastIndex), key))
  return parts.length === 1 ? parts[0] : <>{parts}</>
}

export function renderGeorgsNotizMarkdown(text: string): ReactNode[] {
  const lines = text.split('\n')
  const out: ReactNode[] = []
  let i = 0
  const key = () => `md-${i}`

  while (i < lines.length) {
    const line = lines[i]
    const t = line.trim()

    if (t === '') {
      out.push(<div key={key()} style={{ height: '0.5rem' }} />)
      i++
      continue
    }

    if (line.startsWith('# ')) {
      out.push(<h1 key={key()} style={baseStyles.h1}>{line.slice(2).trim()}</h1>)
      i++
      continue
    }
    if (line.startsWith('## ')) {
      out.push(<h2 key={key()} style={baseStyles.h2}>{line.slice(3).trim()}</h2>)
      i++
      continue
    }
    if (t === '---' || /^---+$/.test(t)) {
      out.push(<hr key={key()} style={baseStyles.hr} />)
      i++
      continue
    }

    // Eine Zeile: ![Alt-Text](https://...) – z. B. QR-Codes im Brief an Andreas
    const imgLine = t.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imgLine) {
      out.push(
        <p key={key()} style={{ ...baseStyles.p, textAlign: 'center' as const }}>
          <img
            src={imgLine[2]}
            alt={imgLine[1] || 'Bild'}
            style={{ maxWidth: 160, height: 'auto', borderRadius: 8, background: '#fff', padding: 6, display: 'inline-block' }}
          />
        </p>
      )
      i++
      continue
    }

    if (line.startsWith('|') && line.includes('|', 1)) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const row = lines[i].split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        if (row.length && !row.every(c => /^[-:\s]+$/.test(c))) rows.push(row)
        i++
      }
      if (rows.length) {
        const [head, ...body] = rows
        out.push(
          <div key={key()}>
            <table style={baseStyles.table}>
              {head && <thead><tr>{head.map((c, j) => <th key={j} style={baseStyles.th}>{renderGeorgsNotizInline(c)}</th>)}</tr></thead>}
              <tbody>{body.map((row, r) => <tr key={r}>{row.map((c, j) => <td key={j} style={baseStyles.td}>{renderGeorgsNotizInline(c)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )
      }
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: ReactNode[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(<li key={items.length} style={baseStyles.li}>{renderGeorgsNotizInline(lines[i].slice(2).trim())}</li>)
        i++
      }
      out.push(<ul key={key()} style={baseStyles.ul}>{items}</ul>)
      continue
    }

    out.push(<p key={key()} style={baseStyles.p}>{renderGeorgsNotizInline(line)}</p>)
    i++
  }
  return out
}
