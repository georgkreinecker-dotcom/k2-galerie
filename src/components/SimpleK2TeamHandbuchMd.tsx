/**
 * Einfacher Markdown-Renderer für k2team-handbuch-Dateien (Überschriften, Listen, Tabellen, Links).
 * Genutzt u. a. von ZettelTestuserProduktlinienPage und TestprotokollTestuserPage.
 */

import React from 'react'

export function SimpleK2TeamHandbuchMd({ md }: { md: string }) {
  const lines = md.split('\n')
  const out: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const t = line.trim()

    if (t === '') {
      out.push(<div key={i} style={{ height: '0.4rem' }} />)
      i++
      continue
    }

    /** Druck: neuer Bogen (z. B. Testprotokoll 2 Seiten) – nur wenn Zeile exakt [SEITENUMBRUCH] */
    if (t.toUpperCase() === '[SEITENUMBRUCH]') {
      out.push(<div key={i} className="tp-md-pagebreak" aria-hidden />)
      i++
      continue
    }

    if (line.startsWith('# ')) {
      out.push(<h1 key={i}>{line.slice(2).trim()}</h1>)
      i++
      continue
    }
    if (line.startsWith('## ')) {
      out.push(<h2 key={i}>{line.slice(3).trim()}</h2>)
      i++
      continue
    }
    if (line.startsWith('### ')) {
      out.push(<h3 key={i}>{line.slice(4).trim()}</h3>)
      i++
      continue
    }
    if (t === '---' || /^-+$/.test(t)) {
      out.push(<hr key={i} />)
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
        const isSep = row.length > 0 && row.every((c) => /^[-:\s]+$/.test(c))
        if (row.length > 0 && !isSep) rows.push(row)
        i++
      }
      if (rows.length > 0) {
        const [head, ...body] = rows
        out.push(
          <table key={i}>
            {head && (
              <thead>
                <tr>
                  {head.map((c, j) => (
                    <th key={j}>{parseInline(c)}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} style={c === 1 ? { wordBreak: 'break-all' as const } : undefined}>
                      {parseInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
      continue
    }

    if (line.startsWith('- [ ] ')) {
      const items: React.ReactNode[] = []
      while (i < lines.length && lines[i].startsWith('- [ ] ')) {
        items.push(<li key={items.length}>☐ {parseInline(lines[i].slice(6).trim())}</li>)
        i++
      }
      out.push(<ul key={i}>{items}</ul>)
      continue
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: React.ReactNode[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        const raw = lines[i].slice(2).trim()
        if (/^\d+\.\s/.test(raw)) break
        items.push(<li key={items.length}>{parseInline(raw)}</li>)
        i++
      }
      out.push(<ul key={i}>{items}</ul>)
      continue
    }

    if (line.match(/^\d+\.\s/)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(<li key={items.length}>{parseInline(lines[i].replace(/^\d+\.\s/, '').trim())}</li>)
        i++
      }
      out.push(<ol key={i}>{items}</ol>)
      continue
    }

    out.push(<p key={i}>{parseInline(line)}</p>)
    i++
  }

  return <>{out}</>
}

function parseInline(s: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  let rest = s
  let key = 0
  while (rest.length > 0) {
    const link = rest.match(/^\[([^\]]+)\]\(([^)]+)\)/)
    const bold = rest.match(/^\*\*([^*]+)\*\*/)
    const em = rest.match(/^\*([^*]+)\*/)
    const code = rest.match(/^`([^`]+)`/)
    if (link) {
      const href = link[2]
      const isInternal = href.startsWith('/')
      parts.push(
        <a
          key={key++}
          href={href}
          style={{ color: '#047857', fontWeight: 600 }}
          {...(!isInternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {link[1]}
        </a>
      )
      rest = rest.slice(link[0].length)
    } else if (bold) {
      parts.push(<strong key={key++}>{bold[1]}</strong>)
      rest = rest.slice(bold[0].length)
    } else if (em) {
      parts.push(<em key={key++}>{em[1]}</em>)
      rest = rest.slice(em[0].length)
    } else if (code) {
      parts.push(<code key={key++}>{code[1]}</code>)
      rest = rest.slice(code[0].length)
    } else {
      const idxB = rest.indexOf('**')
      const idxE = rest.indexOf('*')
      const idxC = rest.indexOf('`')
      const idxL = rest.indexOf('[')
      const candidates = [idxB, idxE, idxC, idxL].filter((x) => x >= 0)
      const next = candidates.length ? Math.min(...candidates) : rest.length
      if (next === 0 && rest.length > 0) {
        parts.push(rest[0])
        rest = rest.slice(1)
        continue
      }
      if (next >= rest.length) {
        parts.push(rest)
        break
      }
      parts.push(rest.slice(0, next))
      rest = rest.slice(next)
    }
  }
  return parts.length === 1 ? parts[0] : <>{parts}</>
}
