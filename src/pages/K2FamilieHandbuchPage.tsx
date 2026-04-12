/**
 * K2 Familie – eigenes Handbuch (nur Familie-relevante Kapitel).
 * Projekt-Zusammenfassung: lesefreundliche Darstellung mit Fußnoten und Seitenzahlen.
 */

import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const HANDBUCH_DOC_PARAM = 'doc'
const HANDBUCH_BASE = '/k2team-handbuch'
const PROJEKT_ZUSAMMENFASSUNG_FILE = '18-K2-FAMILIE-PROJEKT-ZUSAMMENFASSUNG.md'

const FAMILIE_DOCUMENTS = [
  { id: '17-erste-schritte', name: 'Erste Schritte', file: '17-K2-FAMILIE-ERSTE-SCHRITTE.md' },
  { id: '18-zusammenfassung', name: 'Projekt-Zusammenfassung', file: PROJEKT_ZUSAMMENFASSUNG_FILE },
] as const

/** Ersetzt `docs/...md`-Verweise durch Fußnoten-Ziffern und sammelt Fußnoten. */
function extractFootnotes(raw: string): { content: string; footnotes: string[] } {
  const footnotes: string[] = []
  const seen = new Map<string, number>()
  const re = /`(docs\/[^`]+\.md)`/g
  const content = raw.replace(re, (_match, path: string) => {
    let idx = seen.get(path)
    if (idx === undefined) {
      idx = footnotes.length + 1
      seen.set(path, idx)
      footnotes.push(path)
    }
    return `<sup class="fn-ref">${idx}</sup>`
  })
  return { content, footnotes }
}

export default function K2FamilieHandbuchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [docContent, setDocContent] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const docFromUrl = searchParams.get(HANDBUCH_DOC_PARAM)
    const fileToLoad = docFromUrl && FAMILIE_DOCUMENTS.some((d) => d.file === docFromUrl)
      ? docFromUrl
      : FAMILIE_DOCUMENTS[0].file
    loadDocument(fileToLoad)
  }, [searchParams])

  const loadDocument = async (filename: string) => {
    setLoading(true)
    setSelectedDoc(filename)
    try {
      const response = await fetch(`${HANDBUCH_BASE}/${filename}`)
      if (response.ok) {
        const text = await response.text()
        setDocContent(text)
      } else {
        setDocContent(`# Dokument nicht gefunden\n\nDie Datei \`${filename}\` konnte nicht geladen werden.`)
      }
    } catch (error) {
      setDocContent(`# Fehler beim Laden\n\n${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const openDoc = (file: string) => {
    setSearchParams({ [HANDBUCH_DOC_PARAM]: file }, { replace: true })
  }

  const isProjektZusammenfassung = selectedDoc === PROJEKT_ZUSAMMENFASSUNG_FILE
  const zusammenfassungData = useMemo(() => {
    if (!isProjektZusammenfassung || !docContent) return null
    return extractFootnotes(docContent)
  }, [isProjektZusammenfassung, docContent])

  const renderMarkdown = (text: string, options?: { allowHtml?: boolean }) => {
    const allowHtml = options?.allowHtml ?? false
    const lines = text.split('\n')
    const out: ReactNode[] = []
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      const key = i
      if (line.startsWith('# ')) {
        out.push(<h1 key={key} style={{ fontSize: '2rem', marginTop: '2rem', marginBottom: '1rem', color: '#14b8a6' }}>{line.substring(2)}</h1>)
        i++; continue
      }
      if (line.startsWith('## ')) {
        out.push(<h2 key={key} style={{ fontSize: '1.5rem', marginTop: '1.5rem', marginBottom: '0.75rem', color: '#0d9488' }}>{line.substring(3)}</h2>)
        i++; continue
      }
      if (line.startsWith('### ')) {
        out.push(<h3 key={key} style={{ fontSize: '1.25rem', marginTop: '1rem', marginBottom: '0.5rem', color: '#2dd4bf' }}>{line.substring(4)}</h3>)
        i++; continue
      }
      if (line.startsWith('**') && line.endsWith('**') && !line.includes('<sup')) {
        out.push(<p key={key} style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{line.substring(2, line.length - 2)}</p>)
        i++; continue
      }
      if (line.startsWith('```')) { i++; continue }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        out.push(<li key={key} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }}>{line.substring(2)}</li>)
        i++; continue
      }
      if (line.trim() === '') {
        out.push(<br key={key} />)
        i++; continue
      }
      // Tabelle: Zeilen mit | |
      if (line.startsWith('|') && line.includes('|')) {
        const rows: string[][] = []
        while (i < lines.length && lines[i].startsWith('|')) {
          const cells = lines[i].split('|').slice(1, -1).map(c => c.trim())
          rows.push(cells)
          i++
        }
        const toCellHtml = (cell: string) => allowHtml ? cell.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') : cell
        if (rows.length >= 1) {
          const isHeader = rows.length > 1 && rows[1].every(c => /^[-:]+$/.test(c))
          const headerRow = isHeader ? rows[0] : null
          const bodyRows = isHeader ? rows.slice(2) : rows
          out.push(
            <div key={key} style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '1rem' }}>
            <table style={{ width: '100%', minWidth: 320, borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              {headerRow && (
                <thead>
                  <tr>
                    {headerRow.map((cell, c) => (
                      <th key={c} style={{ border: '1px solid rgba(13,148,136,0.35)', padding: '0.5rem 0.75rem', textAlign: 'left', background: 'rgba(13,148,136,0.12)' }} dangerouslySetInnerHTML={allowHtml ? { __html: toCellHtml(cell) } : undefined}>{allowHtml ? undefined : cell}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {bodyRows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c} style={{ border: '1px solid rgba(13,148,136,0.25)', padding: '0.5rem 0.75rem' }} dangerouslySetInnerHTML={allowHtml ? { __html: toCellHtml(cell) } : undefined}>{allowHtml ? undefined : cell}</td>
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
      if (allowHtml && /<sup class="fn-ref">/.test(line)) {
        out.push(<p key={key} style={{ marginBottom: '0.75rem', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: line }} />)
      } else {
        out.push(<p key={key} style={{ marginBottom: '0.75rem', lineHeight: 1.6 }}>{line}</p>)
      }
      i++
    }
    return out
  }

  const lesefassungStyles = `
    .projekt-zusammenfassung-lesefassung {
      --lese-bg: #fffefb;
      --lese-text: #1c1a18;
      --lese-muted: #5c5650;
      --lese-border: #e0ddd8;
      --lese-accent: #0d9488;
      background: var(--lese-bg);
      color: var(--lese-text);
      padding: 2rem 2.5rem;
      max-width: 42rem;
      margin: 0 auto;
      line-height: 1.75;
      border-radius: 12px;
      border: 1px solid var(--lese-border);
    }
    .projekt-zusammenfassung-lesefassung h1 { font-size: 1.75rem; color: var(--lese-accent); margin-top: 0; margin-bottom: 0.5rem; }
    .projekt-zusammenfassung-lesefassung h2 { font-size: 1.35rem; color: var(--lese-accent); margin-top: 1.75rem; margin-bottom: 0.5rem; page-break-after: avoid; }
    .projekt-zusammenfassung-lesefassung h3 { font-size: 1.1rem; color: #0f766e; margin-top: 1.25rem; margin-bottom: 0.35rem; page-break-after: avoid; }
    .projekt-zusammenfassung-lesefassung p, .projekt-zusammenfassung-lesefassung li { color: var(--lese-text); }
    .projekt-zusammenfassung-lesefassung .fn-ref { font-size: 0.75em; color: var(--lese-accent); font-weight: 600; }
    .projekt-zusammenfassung-lesefassung table { border-color: var(--lese-border); }
    .projekt-zusammenfassung-lesefassung th { background: rgba(13,148,136,0.08); color: var(--lese-text); border-color: var(--lese-border); }
    .projekt-zusammenfassung-lesefassung td { border-color: var(--lese-border); color: var(--lese-text); }
    .projekt-zusammenfassung-lesefassung .fußnoten-block { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid var(--lese-border); font-size: 0.9rem; color: var(--lese-muted); }
    .projekt-zusammenfassung-lesefassung .fußnoten-block h3 { font-size: 1rem; margin-bottom: 0.5rem; color: var(--lese-muted); }
    .projekt-zusammenfassung-lesefassung .fußnoten-block ol { margin: 0; padding-left: 1.25rem; }
    .projekt-zusammenfassung-lesefassung .fußnoten-block li { margin-bottom: 0.25rem; }
    .seitenfuss { display: none; }
    @media print {
      .no-print { display: none !important; }
      .projekt-zusammenfassung-lesefassung {
        box-shadow: none; border: none; max-width: none;
        padding: 6mm 10mm 14mm 10mm !important;
        padding-bottom: 14mm !important;
        line-height: 1.4 !important;
        font-size: 10.5pt !important;
      }
      .projekt-zusammenfassung-lesefassung h1 { font-size: 1.35rem !important; margin-top: 0 !important; margin-bottom: 0.25rem !important; }
      .projekt-zusammenfassung-lesefassung h2 { font-size: 1.1rem !important; margin-top: 0.5rem !important; margin-bottom: 0.2rem !important; }
      .projekt-zusammenfassung-lesefassung h3 { font-size: 1rem !important; margin-top: 0.4rem !important; margin-bottom: 0.15rem !important; }
      .projekt-zusammenfassung-lesefassung p { margin-top: 0 !important; margin-bottom: 0.2rem !important; }
      .projekt-zusammenfassung-lesefassung li { margin-bottom: 0.1rem !important; }
      .projekt-zusammenfassung-lesefassung table { margin-bottom: 0.4rem !important; font-size: 9.5pt !important; }
      .projekt-zusammenfassung-lesefassung th,
      .projekt-zusammenfassung-lesefassung td { padding: 0.2rem 0.4rem !important; }
      .projekt-zusammenfassung-lesefassung .fußnoten-block { margin-top: 0.6rem !important; padding-top: 0.4rem !important; font-size: 8.5pt !important; }
      .projekt-zusammenfassung-lesefassung .fußnoten-block h3 { font-size: 9pt !important; margin-bottom: 0.2rem !important; }
      .projekt-zusammenfassung-lesefassung .fußnoten-block li { margin-bottom: 0.1rem !important; }
      .projekt-zusammenfassung-lesefassung br { height: 0.15em; display: block; overflow: hidden; }
      .seitenfuss { display: block; position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 0.65rem; color: var(--lese-muted); padding: 0.2rem 0; }
      .seitenfuss::after { content: "Seite " counter(page); }
      @page { margin: 12mm 14mm 10mm 14mm; size: A4; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `

  return (
    <div className="mission-wrapper k2-familie-page">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .k2-familie-page .viewport header,
          .k2-familie-page .viewport aside { display: none !important; }
          .k2-familie-page .handbuch-layout { grid-template-columns: 1fr !important; gap: 0 !important; }
          .k2-familie-page .viewport { padding: 0 !important; }
          .k2-familie-page article { border: none !important; background: white !important; color: black !important; padding: 0 !important; }
          .k2-familie-page h1, .k2-familie-page h2, .k2-familie-page h3 { color: black !important; }
          .k2-familie-page .k2-handbuch-druck { font-size: 10.5pt !important; line-height: 1.4 !important; padding: 6mm 10mm 14mm 10mm !important; }
          .k2-familie-page .k2-handbuch-druck h1 { font-size: 1.35rem !important; margin-top: 0 !important; margin-bottom: 0.25rem !important; }
          .k2-familie-page .k2-handbuch-druck h2 { font-size: 1.1rem !important; margin-top: 0.5rem !important; margin-bottom: 0.2rem !important; }
          .k2-familie-page .k2-handbuch-druck h3 { font-size: 1rem !important; margin-top: 0.4rem !important; margin-bottom: 0.15rem !important; }
          .k2-familie-page .k2-handbuch-druck p { margin-top: 0 !important; margin-bottom: 0.2rem !important; }
          .k2-familie-page .k2-handbuch-druck li { margin-bottom: 0.1rem !important; }
          .k2-familie-page .k2-handbuch-druck table { margin-bottom: 0.4rem !important; font-size: 9.5pt !important; }
          .k2-familie-page .k2-handbuch-druck th, .k2-familie-page .k2-handbuch-druck td { padding: 0.2rem 0.4rem !important; }
          .k2-familie-page .k2-handbuch-druck br { height: 0.15em; display: block; overflow: hidden; }
          .k2-familie-page .seitenfuss { display: block !important; position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 0.65rem; color: #666; padding: 0.2rem 0; }
          .k2-familie-page .seitenfuss::after { content: "Seite " counter(page); }
          @page { margin: 12mm 14mm 10mm 14mm; size: A4; }
        }
        ${isProjektZusammenfassung ? lesefassungStyles : ''}
      `}</style>
      <div className="viewport" style={{ padding: '1.5rem 2rem' }}>
        <header className="no-print" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, color: '#14b8a6', fontSize: '1.75rem' }}>📖 K2 Familie Handbuch</h1>
            <p className="meta" style={{ marginTop: '0.35rem' }}>Alles Wichtige für K2 Familie – Erste Schritte, Zusammenfassung.</p>
            <p className="handbuch-team-ref meta" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
              Team-Regeln und volles Handbuch: <Link to="/k2team-handbuch" style={{ color: '#5ffbf1', textDecoration: 'underline' }}>K2Team Handbuch öffnen</Link>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-start' }}>
              <button type="button" onClick={() => window.print()} className="btn small-btn" style={{ background: '#0d9488', color: '#fff', border: 'none', cursor: 'pointer' }} title="Seite drucken – im Druckdialog A4 wählen">🖨️ Drucken (A4)</button>
              {isProjektZusammenfassung && (
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>Im Druckdialog: Format <strong>A4</strong> wählen</span>
              )}
            </div>
          </div>
        </header>

        <div className="handbuch-layout" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
          <aside className="no-print" style={{ background: 'rgba(13,148,136,0.08)', padding: '1rem', borderRadius: 12, border: '1px solid rgba(13,148,136,0.25)', height: 'fit-content', position: 'sticky', top: '1rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', color: '#14b8a6', fontSize: '1rem' }}>Kapitel</h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {FAMILIE_DOCUMENTS.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => openDoc(doc.file)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: selectedDoc === doc.file ? 'rgba(13,148,136,0.2)' : 'transparent',
                    border: selectedDoc === doc.file ? '1px solid #14b8a6' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    color: selectedDoc === doc.file ? '#14b8a6' : 'rgba(255,255,255,0.85)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.88rem',
                    fontFamily: 'inherit',
                  }}
                >
                  {doc.name}
                </button>
              ))}
            </nav>
          </aside>

          <article style={isProjektZusammenfassung ? undefined : { background: 'rgba(13,148,136,0.06)', padding: '1.5rem 2rem', borderRadius: 12, border: '1px solid rgba(13,148,136,0.2)', minHeight: 400 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>Lade Dokument...</div>
            ) : isProjektZusammenfassung && zusammenfassungData ? (
              <div className="projekt-zusammenfassung-lesefassung">
                <div>{renderMarkdown(zusammenfassungData.content, { allowHtml: true })}</div>
                {zusammenfassungData.footnotes.length > 0 && (
                  <footer className="fußnoten-block" style={{ pageBreakInside: 'avoid' }}>
                    <h3>Fußnoten</h3>
                    <ol>
                      {zusammenfassungData.footnotes.map((path, idx) => (
                        <li key={idx} id={`fn-${idx + 1}`}><code style={{ fontSize: '0.85em', color: 'var(--lese-muted)' }}>{path}</code></li>
                      ))}
                    </ol>
                  </footer>
                )}
                <div className="seitenfuss" aria-hidden />
              </div>
            ) : (
              <>
                <div className="k2-handbuch-druck" style={{ color: 'rgba(255,255,255,0.95)', lineHeight: 1.75 }}>{renderMarkdown(docContent)}</div>
                <div className="seitenfuss" style={{ display: 'none' }} aria-hidden />
              </>
            )}
          </article>
        </div>
      </div>
    </div>
  )
}
