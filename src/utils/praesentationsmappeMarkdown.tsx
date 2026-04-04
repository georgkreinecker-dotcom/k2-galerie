/**
 * Gemeinsamer Markdown-Renderer für Präsentationsmappe und abgeleitete Druckseiten (z. B. Promo-A4-Flyer).
 * Kein react-markdown – gleiche Regeln wie bisher in PraesentationsmappeVollversionPage.
 */

import type { ReactNode } from 'react'

export function renderInline(s: string): ReactNode {
  const parts: ReactNode[] = []
  let rest = s
  let key = 0
  while (rest.length > 0) {
    const bold = rest.match(/^\*\*([^*]+)\*\*/)
    const em = rest.match(/^\*([^*]+)\*/)
    if (bold) {
      parts.push(<strong key={key++}>{bold[1]}</strong>)
      rest = rest.slice(bold[0].length)
    } else if (em) {
      parts.push(<em key={key++}>{em[1]}</em>)
      rest = rest.slice(em[0].length)
    } else {
      const nextB = rest.indexOf('**')
      const nextE = rest.indexOf('*')
      const next = nextB >= 0 && (nextE < 0 || nextB <= nextE) ? nextB : nextE
      if (next < 0) {
        parts.push(rest)
        break
      }
      parts.push(rest.slice(0, next))
      rest = rest.slice(next)
    }
  }
  return parts.length === 1 ? parts[0] : <>{parts}</>
}

export type PraesentationsmappeMarkdownOptions = {
  assetBase: string
  keyPrefix?: string
  chapterNumber?: number
  /** SPA: interne .md-Kapitel in derselben Mappe */
  onInternalDocClick?: (path: string) => void
  /** z. B. Flyer → Mappe mit ?doc= */
  internalDocHref?: (path: string) => string
}

export function renderMarkdown(text: string, opts: PraesentationsmappeMarkdownOptions): ReactNode[] {
  const { assetBase, keyPrefix = 'pmv', chapterNumber, onInternalDocClick, internalDocHref } = opts
  const lines = text.split('\n')
  const out: ReactNode[] = []
  let i = 0
  let firstH1Done = false
  let lastWasEmpty = false
  const key = () => `${keyPrefix}-${i}`

  const linkForPath = (path: string, inner: ReactNode, className = 'pmv-link'): ReactNode => {
    const isHttp = path.startsWith('http')
    const isAbsoluteApp = path.startsWith('/') && !path.startsWith('//')
    const isInternalDoc = path.endsWith('.md') && !isHttp
    if (isInternalDoc && onInternalDocClick) {
      return (
        <a href="#" className={className} onClick={(e) => { e.preventDefault(); onInternalDocClick(path) }}>
          {inner}
        </a>
      )
    }
    if (isInternalDoc && internalDocHref) {
      return <a href={internalDocHref(path)} className={className}>{inner}</a>
    }
    if (isAbsoluteApp) {
      return <a href={path} className={className}>{inner}</a>
    }
    const href = isHttp ? path : `${assetBase}/${path}`
    return (
      <a
        href={href}
        className={className}
        target={isHttp ? '_blank' : undefined}
        rel={isHttp ? 'noopener noreferrer' : undefined}
      >
        {inner}
      </a>
    )
  }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === '') {
      if (!lastWasEmpty) out.push(<div key={key()} className="pmv-leerzeile" aria-hidden />)
      lastWasEmpty = true
      i++
      continue
    }
    if (trimmed.toUpperCase() === '[SEITENUMBRUCH]') {
      const hasMoreMeaningfulContent = lines.slice(i + 1).some((l) => {
        const t = l.trim()
        return t !== '' && t.toUpperCase() !== '[SEITENUMBRUCH]'
      })
      if (!hasMoreMeaningfulContent) break
      out.push(
        <div key={key()} className="pmv-seitenumbruch" aria-hidden>
          <span className="pmv-seitenumbruch-label">— Seitenumbruch —</span>
        </div>
      )
      lastWasEmpty = false
      i++
      continue
    }
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imgMatch) {
      const [, alt, src] = imgMatch
      const url = src.startsWith('http') ? src : src.startsWith('/') ? src : `${assetBase}/${src}`
      out.push(
        <p key={key()} className="pmv-p pmv-p-with-img">
          <img src={url} alt={alt || 'Screenshot'} className="pmv-img" style={{ maxWidth: '100%', height: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }} />
        </p>
      )
      lastWasEmpty = false
      i++
      continue
    }
    if (line.startsWith('# ')) {
      const title = line.substring(2).trim()
      const displayTitle = chapterNumber != null && !firstH1Done ? `${chapterNumber}. ${title}` : title
      if (!firstH1Done) firstH1Done = true
      out.push(<h1 key={key()} className="pmv-h1">{displayTitle}</h1>)
      lastWasEmpty = false
      i++
      continue
    }
    if (line.startsWith('## ')) {
      out.push(<h2 key={key()} className="pmv-h2">{line.substring(3).trim()}</h2>)
      lastWasEmpty = false
      i++
      continue
    }
    if (line.startsWith('### ')) {
      out.push(<h3 key={key()} className="pmv-h3">{line.substring(4).trim()}</h3>)
      lastWasEmpty = false
      i++
      continue
    }
    if (trimmed === '---' || /^---+$/.test(trimmed)) {
      out.push(<hr key={key()} className="pmv-hr" />)
      lastWasEmpty = false
      i++
      continue
    }
    if (line.startsWith('|') && line.includes('|', 1)) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const row = lines[i].split('|').map((c) => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
        const isSep = row.length > 0 && row.every((c) => /^[-:\s]+$/.test(c))
        if (row.length > 0 && !isSep) rows.push(row)
        i++
      }
      if (rows.length > 0) {
        const [head, ...body] = rows
        out.push(
          <div key={key()} className="pmv-table-wrap">
            <table className="pmv-table">
              {head && (
                <thead>
                  <tr>{head.map((c, j) => <th key={j}>{c}</th>)}</tr>
                </thead>
              )}
              <tbody>
                {body.map((row, r) => (
                  <tr key={r}>
                    {row.map((c, j) => (
                      <td key={j}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      lastWasEmpty = false
      continue
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: ReactNode[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(<li key={items.length} className="pmv-li">{lines[i].substring(2).trim()}</li>)
        i++
      }
      out.push(<ul key={key()} className="pmv-ul">{items}</ul>)
      lastWasEmpty = false
      continue
    }
    const numLinkMatch = line.match(/^(\d+\.)\s+\[([^\]]+)\]\(([^)]+)\)/)
    if (numLinkMatch) {
      const [, num, title, path] = numLinkMatch
      out.push(
        <p key={key()} className="pmv-p">
          {num}{' '}
          {linkForPath(path, title)}
        </p>
      )
      lastWasEmpty = false
      i++
      continue
    }
    if (line.startsWith('[') && line.includes('](')) {
      const match = line.match(/^\[([^\]]+)\]\(([^)]+)\)/)
      if (match) {
        const path = match[2]
        out.push(<p key={key()} className="pmv-p">{linkForPath(path, match[1])}</p>)
        lastWasEmpty = false
        i++
        continue
      }
    }
    out.push(<p key={key()} className="pmv-p">{renderInline(line)}</p>)
    lastWasEmpty = false
    i++
  }
  return out
}
