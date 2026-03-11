import { useState, useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #1a1b2e 0%, #16213e 100%)',
  color: '#e9d5ff',
  padding: '2rem 1.5rem 3rem',
  fontFamily: 'Georgia, serif',
}

const containerStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  lineHeight: 1.7,
  fontSize: '1.05rem',
}

const backLinkStyle: React.CSSProperties = {
  color: 'rgba(233,213,255,0.7)',
  fontSize: '0.9rem',
  textDecoration: 'none',
  display: 'inline-block',
  marginBottom: '1.5rem',
}

const baseStyles = {
  h1: { margin: '0 0 0.5rem' as const, fontSize: '1.75rem' as const, fontWeight: 700 as const, color: '#fff' },
  h2: { margin: '1.5rem 0 0.5rem' as const, fontSize: '1.35rem' as const, fontWeight: 600 as const, color: '#c4b5fd' },
  p: { margin: '0 0 1rem' as const, color: 'rgba(233,213,255,0.95)' },
  hr: { border: 'none', borderTop: '1px solid rgba(196,181,253,0.3)', margin: '1.5rem 0' },
  ul: { margin: '0.5rem 0 1rem 1.5rem', paddingLeft: '1rem' },
  li: { marginBottom: '0.35rem' },
  table: { width: '100%', borderCollapse: 'collapse' as const, margin: '0.75rem 0', fontSize: '0.95rem' },
  th: { border: '1px solid rgba(196,181,253,0.35)', padding: '0.5rem 0.75rem', textAlign: 'left' as const, background: 'rgba(196,181,253,0.1)', color: '#c4b5fd', fontWeight: 600 },
  td: { border: '1px solid rgba(196,181,253,0.25)', padding: '0.5rem 0.75rem', color: 'rgba(233,213,255,0.9)' },
  a: { color: '#a78bfa', textDecoration: 'underline' },
  strong: { fontWeight: 600, color: '#e9d5ff' },
  em: { fontStyle: 'italic' as const },
}

function renderInline(text: string): ReactNode {
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
      // Mindestens 1 Zeichen konsumieren, sonst Endlosschleife bei "**" oder "*"
      rest = rest.slice(next + (rest.startsWith('**', next) ? 2 : 1))
    }
  }
  return out
}

function renderMarkdown(text: string): ReactNode[] {
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
              {head && <thead><tr>{head.map((c, j) => <th key={j} style={baseStyles.th}>{renderInline(c)}</th>)}</tr></thead>}
              <tbody>{body.map((row, r) => <tr key={r}>{row.map((c, j) => <td key={j} style={baseStyles.td}>{renderInline(c)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )
      }
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: ReactNode[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(<li key={items.length} style={baseStyles.li}>{renderInline(lines[i].slice(2).trim())}</li>)
        i++
      }
      out.push(<ul key={key()} style={baseStyles.ul}>{items}</ul>)
      continue
    }

    out.push(<p key={key()} style={baseStyles.p}>{renderInline(line)}</p>)
    i++
  }
  return out
}

export default function BriefAnAndreasPage() {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/notizen-georg/diverses/brief-an-andreas.md')
      .then(r => (r.ok ? r.text() : Promise.reject(new Error('Datei nicht gefunden'))))
      .then(text => { if (!cancelled) setContent(text) })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'Fehler beim Laden') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  let body: ReactNode
  if (error) {
    body = <p style={baseStyles.p}>Fehler: {error}. <Link to={PROJECT_ROUTES['k2-galerie'].notizen} style={baseStyles.a}>Zurück zu Notizen</Link></p>
  } else if (loading) {
    body = <p style={baseStyles.p}>Wird geladen …</p>
  } else {
    try {
      body = renderMarkdown(content)
    } catch (e) {
      body = <p style={baseStyles.p}>Fehler beim Anzeigen. <Link to={PROJECT_ROUTES['k2-galerie'].notizen} style={baseStyles.a}>Zurück zu Notizen</Link></p>
    }
  }

  const printUrl = '/brief-andreas.html'

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <Link to={PROJECT_ROUTES['k2-galerie'].notizen} style={backLinkStyle}>
          ← Zurück zu Georgs Notizen
        </Link>
        <p style={{ ...baseStyles.p, marginBottom: '0.5rem' }}>
          <a href={printUrl} target="_blank" rel="noopener noreferrer" style={{ ...baseStyles.a, fontSize: '0.95rem' }}>
            🖨️ Druckversion (gleicher Stil wie „Für meine Freunde“) →
          </a>
        </p>
        {body}
      </div>
    </div>
  )
}
