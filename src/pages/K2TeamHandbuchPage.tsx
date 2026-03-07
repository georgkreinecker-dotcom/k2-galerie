import { useState, useEffect, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProjectNavButton } from '../components/Navigation'

const HANDBUCH_DOC_PARAM = 'doc'

export default function K2TeamHandbuchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [docContent, setDocContent] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const documents = [
    { id: '00-index', name: 'Inhaltsverzeichnis', file: '00-INDEX.md' },
    { id: '01-grundlagen', name: 'Team-Grundlagen', file: '01-TEAM-GRUNDLAGEN.md' },
    { id: '02-werte', name: 'Team-Werte', file: '02-TEAM-WERTE.md' },
    { id: '03-zusammenarbeit', name: 'Proaktive Zusammenarbeit', file: '03-PROAKTIVE-ZUSAMMENARBEIT.md' },
    { id: '04-vision', name: 'Vision & Strategie', file: '04-VISION-STRATEGIE.md' },
    { id: '05-gewohnheiten', name: 'Arbeitsgewohnheiten', file: '05-ARBEITSGEWOHNHEITEN.md' },
    { id: '06-stand', name: 'Aktueller Stand', file: '06-AKTUELLER-STAND.md' },
    { id: '07-entscheidungen', name: 'Entscheidungs-Framework', file: '07-ENTSCHEIDUNGS-FRAMEWORK.md' },
    { id: '08-feedback', name: 'Feedback & Verbesserung', file: '08-FEEDBACK.md' },
    { id: '09-git-vercel', name: 'Git/Vercel Probleme', file: '09-GIT-VERCEL-PROBLEME.md' },
    { id: '10-stabilitaet', name: 'Stabilitäts-Fixes', file: '10-STABILITAET-FIXES.md' },
    { id: '11-backup', name: 'Backup-Zusammenfassung', file: '11-BACKUP-ZUSAMMENFASSUNG.md' },
    { id: '12-arbeitsplattform', name: 'Arbeitsplattform Verbesserungen', file: '12-ARBEITSPLATTFORM-VERBESSERUNGEN.md' },
    { id: '13-backup-vollbackup', name: 'Backup & Vollbackup K2 Galerie', file: '13-BACKUP-VOLLBACKUP-K2-GALERIE.md' },
    { id: '16-zentrale-themen', name: 'Zentrale Themen für Nutzer', file: '16-ZENTRALE-THEMEN-FUER-NUTZER.md', stand: '20.02.2026' },
    { id: '19-martina-muna', name: 'Martina & Muna (Archiv)', file: '19-MARTINA-MUNA-BESUCH-OEK2-VK2.md' },
    { id: '20-pilot-zettel', name: 'Pilot-Zettel – Drucken', file: '20-PILOT-ZETTEL-OEK2-VK2.md' },
  ]

  useEffect(() => {
    const docFromUrl = searchParams.get(HANDBUCH_DOC_PARAM)
    const fileToLoad = docFromUrl && documents.some((d) => d.file === docFromUrl)
      ? docFromUrl
      : documents[0].file
    if (documents.length > 0) {
      loadDocument(fileToLoad)
    }
  }, [searchParams])


  const loadDocument = async (filename: string) => {
    setLoading(true)
    setSelectedDoc(filename)
    // URL immer mitsetzen, damit Link „in der APf öffnen“ funktioniert (page=handbuch&doc=...)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set(HANDBUCH_DOC_PARAM, filename)
      return next
    }, { replace: true })
    try {
      const response = await fetch(`/k2team-handbuch/${filename}`)
      if (response.ok) {
        const text = await response.text()
        setDocContent(text)
      } else {
        setDocContent(`# Dokument nicht gefunden\n\nDie Datei \`${filename}\` konnte nicht geladen werden.\n\n**Pfad:** \`/k2team-handbuch/${filename}\`\n\n**Hinweis:** Stelle sicher, dass der Ordner \`k2team-handbuch\` im \`public\` Verzeichnis existiert.`)
      }
    } catch (error) {
      setDocContent(`# Fehler beim Laden\n\nFehler: ${error instanceof Error ? error.message : String(error)}\n\n**Datei:** ${filename}`)
    } finally {
      setLoading(false)
    }
  }

  // Inline **fett** und *kursiv* in Fließtext
  const renderInline = (s: string): ReactNode => {
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

  // Redigierte leserliche Form – kein Buchhaltungsformular (handbuch-dokumente-leserlich-kein-formular.mdc)
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n')
    const out: ReactNode[] = []
    let i = 0
    const key = () => `md-${i}`

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      if (trimmed === '') {
        out.push(<div key={key()} style={{ height: '0.75rem' }} aria-hidden />)
        i++
        continue
      }

      if (line.startsWith('# ')) {
        out.push(<h1 key={key()} className="handbuch-h1">{line.substring(2).trim()}</h1>)
        i++
        continue
      }
      if (line.startsWith('## ')) {
        out.push(<h2 key={key()} className="handbuch-h2">{line.substring(3).trim()}</h2>)
        i++
        continue
      }
      if (line.startsWith('### ')) {
        out.push(<h3 key={key()} className="handbuch-h3">{line.substring(4).trim()}</h3>)
        i++
        continue
      }

      if (trimmed === '---' || /^---+$/.test(trimmed)) {
        out.push(<hr key={key()} className="handbuch-hr" />)
        i++
        continue
      }

      if (line.startsWith('|') && line.includes('|', 1)) {
        const rows: string[][] = []
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          const row = lines[i].split('|').map((c) => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          const isSeparator = row.length > 0 && row.every((c) => /^[-:\s]+$/.test(c))
          if (row.length > 0 && !isSeparator) rows.push(row)
          i++
        }
        if (rows.length > 0) {
          const [head, ...body] = rows
          out.push(
            <div key={key()} className="handbuch-table-wrap">
              <table className="handbuch-table">
                {head && (
                  <thead>
                    <tr>{head.map((c, j) => <th key={j}>{c}</th>)}</tr>
                  </thead>
                )}
                <tbody>
                  {body.map((row, r) => (
                    <tr key={r}>{row.map((c, j) => <td key={j}>{c}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        continue
      }

      if (line.startsWith('- ') || line.startsWith('* ')) {
        const items: React.ReactNode[] = []
        while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
          items.push(<li key={items.length} className="handbuch-li">{lines[i].substring(2).trim()}</li>)
          i++
        }
        out.push(<ul key={key()} className="handbuch-ul">{items}</ul>)
        continue
      }

      if (line.startsWith('- [ ] ')) {
        const items: React.ReactNode[] = []
        while (i < lines.length && lines[i].startsWith('- [ ] ')) {
          items.push(<li key={items.length} className="handbuch-li handbuch-checkbox">☐ {lines[i].substring(6).trim()}</li>)
          i++
        }
        out.push(<ul key={key()} className="handbuch-ul">{items}</ul>)
        continue
      }

      if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.includes('\n')) {
        out.push(<p key={key()} className="handbuch-strong">{trimmed.slice(2, -2)}</p>)
        i++
        continue
      }

      if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.includes('**')) {
        out.push(<p key={key()} className="handbuch-em">{trimmed.slice(1, -1)}</p>)
        i++
        continue
      }

      if (line.startsWith('```')) {
        i++
        while (i < lines.length && !lines[i].trim().startsWith('```')) i++
        if (i < lines.length) i++
        continue
      }

      out.push(<p key={key()} className="handbuch-p">{renderInline(line)}</p>)
      i++
    }

    return out
  }

  // Leserliche Form – Screen: gut lesbar; Print: kompakt aber nicht Buchhaltungsformular
  const handbuchLeserlichStyles = `
    .mission-wrapper .k2-handbuch-druck { font-size: 1rem; line-height: 1.75; color: #f4f7ff; max-width: 52rem; }
    .mission-wrapper .handbuch-h1 { font-size: 1.75rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #5ffbf1; font-weight: 600; page-break-after: avoid; }
    .mission-wrapper .handbuch-h2 { font-size: 1.35rem; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #8b5cf6; font-weight: 600; page-break-after: avoid; }
    .mission-wrapper .handbuch-h3 { font-size: 1.15rem; margin-top: 1rem; margin-bottom: 0.4rem; color: #a78bfa; page-break-after: avoid; }
    .mission-wrapper .handbuch-hr { border: none; border-top: 1px solid rgba(95, 251, 241, 0.25); margin: 1.25rem 0; }
    .mission-wrapper .handbuch-p { margin: 0 0 0.6rem 0; line-height: 1.75; }
    .mission-wrapper .handbuch-strong { font-weight: 700; margin: 0 0 0.4rem 0; color: rgba(255,255,255,0.95); }
    .mission-wrapper .handbuch-em { font-style: italic; margin: 0 0 0.5rem 0; color: rgba(255,255,255,0.88); }
    .mission-wrapper .handbuch-ul { margin: 0.5rem 0 0.75rem 1.5rem; padding-left: 0.5rem; }
    .mission-wrapper .handbuch-li { margin-bottom: 0.35rem; line-height: 1.6; }
    .mission-wrapper .handbuch-checkbox { list-style: none; margin-left: -1.5rem; }
    .mission-wrapper .handbuch-table-wrap { margin: 0.75rem 0; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .mission-wrapper .handbuch-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
    .mission-wrapper .handbuch-table th, .mission-wrapper .handbuch-table td { border: 1px solid rgba(95, 251, 241, 0.25); padding: 0.5rem 0.75rem; text-align: left; vertical-align: top; }
    .mission-wrapper .handbuch-table th { background: rgba(95, 251, 241, 0.1); color: #5ffbf1; font-weight: 600; }
    .mission-wrapper .handbuch-table td { color: rgba(255,255,255,0.9); }
    .mission-wrapper .handbuch-table code { font-size: 0.88em; color: #a78bfa; word-break: break-all; }
  `
  const isZettelDoc = selectedDoc === '19-MARTINA-MUNA-BESUCH-OEK2-VK2.md' || selectedDoc === '20-PILOT-ZETTEL-OEK2-VK2.md'
  const compactPrintStyles = `
    @media print {
      .no-print { display: none !important; }
      .mission-wrapper .viewport header,
      .mission-wrapper .viewport aside { display: none !important; }
      .mission-wrapper .handbuch-layout { grid-template-columns: 1fr !important; gap: 0 !important; }
      .mission-wrapper .viewport { padding: 0 !important; }
      .mission-wrapper article { border: none !important; background: white !important; color: #1c1a18 !important; padding: 8mm 12mm 16mm 12mm !important; }
      .mission-wrapper .k2-handbuch-druck { font-size: 10.5pt !important; line-height: 1.5 !important; color: #1c1a18 !important; }
      .mission-wrapper .handbuch-h1 { font-size: 1.35rem !important; margin-top: 0 !important; margin-bottom: 0.4rem !important; color: #1c1a18 !important; }
      .mission-wrapper .handbuch-h2 { font-size: 1.15rem !important; margin-top: 0.75rem !important; margin-bottom: 0.35rem !important; color: #1c1a18 !important; }
      .mission-wrapper .handbuch-h3 { font-size: 1.05rem !important; margin-top: 0.5rem !important; margin-bottom: 0.25rem !important; color: #1c1a18 !important; }
      .mission-wrapper .handbuch-hr { border-top-color: #ccc !important; margin: 0.75rem 0 !important; }
      .mission-wrapper .handbuch-p { margin-bottom: 0.4rem !important; color: #1c1a18 !important; }
      .mission-wrapper .handbuch-strong, .mission-wrapper .handbuch-em { color: #1c1a18 !important; margin-bottom: 0.35rem !important; }
      .mission-wrapper .handbuch-ul { margin: 0.4rem 0 0.5rem 1.25rem !important; }
      .mission-wrapper .handbuch-li { margin-bottom: 0.25rem !important; color: #1c1a18 !important; }
      .mission-wrapper .handbuch-table-wrap { margin: 0.5rem 0 !important; }
      .mission-wrapper .handbuch-table { font-size: 9.5pt !important; }
      .mission-wrapper .handbuch-table th, .mission-wrapper .handbuch-table td { padding: 0.35rem 0.5rem !important; border-color: #ccc !important; color: #1c1a18 !important; }
      .mission-wrapper .handbuch-table th { background: #f0f0f0 !important; color: #1c1a18 !important; }
      .mission-wrapper .handbuch-table code { color: #333 !important; }
      .mission-wrapper .seitenfuss { display: block !important; position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 0.65rem; color: #666; padding: 0.2rem 0; }
      .mission-wrapper .seitenfuss::after { content: "Seite " counter(page); }
      @page { margin: 12mm 14mm 10mm 14mm; size: A4; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      /* Martina & Muna Zettel: ein Blatt, nur weiß und schwarz – keine Blamage */
      body.handbuch-zettel-print-active,
      body.handbuch-zettel-print-active .mission-wrapper,
      .mission-wrapper.handbuch-zettel-druck,
      .mission-wrapper.handbuch-zettel-druck .viewport,
      .mission-wrapper.handbuch-zettel-druck .handbuch-layout,
      .mission-wrapper.handbuch-zettel-druck article { background: #fff !important; color: #1c1a18 !important; }
      .mission-wrapper.handbuch-zettel-druck article { padding: 6mm 10mm !important; font-size: 9pt !important; line-height: 1.35 !important; }
      .mission-wrapper.handbuch-zettel-druck .handbuch-h1 { font-size: 1.1rem !important; margin-bottom: 0.3rem !important; color: #1c1a18 !important; }
      .mission-wrapper.handbuch-zettel-druck .handbuch-h2 { font-size: 1rem !important; margin-top: 0.5rem !important; margin-bottom: 0.25rem !important; color: #1c1a18 !important; }
      .mission-wrapper.handbuch-zettel-druck .handbuch-hr { margin: 0.4rem 0 !important; border-color: #ccc !important; }
      .mission-wrapper.handbuch-zettel-druck .handbuch-p { margin-bottom: 0.25rem !important; color: #1c1a18 !important; }
      .mission-wrapper.handbuch-zettel-druck .handbuch-ul, .mission-wrapper.handbuch-zettel-druck .handbuch-li { margin-bottom: 0.15rem !important; color: #1c1a18 !important; }
      .mission-wrapper.handbuch-zettel-druck .handbuch-table { font-size: 8.5pt !important; }
      .mission-wrapper.handbuch-zettel-druck .handbuch-table th, .mission-wrapper.handbuch-zettel-druck .handbuch-table td { padding: 0.25rem 0.4rem !important; border-color: #ccc !important; color: #1c1a18 !important; }
      .mission-wrapper.handbuch-zettel-druck .handbuch-table th { background: #f5f5f5 !important; }
      .mission-wrapper.handbuch-zettel-druck .handbuch-table code { color: #333 !important; }
      .mission-wrapper.handbuch-zettel-druck .seitenfuss { display: none !important; }
    }
  `

  return (
    <main className={`mission-wrapper print-compact${isZettelDoc ? ' handbuch-zettel-druck' : ''}`}>
      <style>{handbuchLeserlichStyles}</style>
      <style>{compactPrintStyles}</style>
      <div className="viewport">
        <header className="no-print">
          <div>
            <h1>🧠 K2Team Handbuch</h1>
            <div className="meta">Team-Handbuch &amp; Vermächtnis – Handbuch unserer Zusammenarbeit</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link
              to="/zettel-pilot-form"
              className="btn small-btn"
              style={{
                background: 'linear-gradient(120deg, #f59e0b, #d97706)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none'
              }}
              title="Name/URL eintragen, dann Zettel drucken"
            >
              📄 Pilot-Zettel (PDF)
            </Link>
            <button
              onClick={() => window.print()}
              className="btn small-btn"
              style={{ 
                background: 'linear-gradient(120deg, #8b5cf6, #a78bfa)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              title="Aktuelles Dokument drucken (PDF oder Drucker)"
            >
              🖨️ Drucken
            </button>
            <Link 
              to="/mission-control" 
              className="btn small-btn"
              style={{ 
                background: 'linear-gradient(120deg, #5ffbf1, #33a1ff)',
                color: '#04111f',
                textDecoration: 'none'
              }}
            >
              ← Mission Control
            </Link>
            <ProjectNavButton projectId="k2-galerie" />
          </div>
        </header>

        <div className="handbuch-layout" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', marginTop: '2rem' }}>
          {/* Sidebar */}
          <aside className="no-print" style={{ background: 'rgba(95, 251, 241, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(95, 251, 241, 0.2)', height: 'fit-content', position: 'sticky', top: '2rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#5ffbf1', fontSize: '1.1rem' }}>Dokumente</h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => loadDocument(doc.file)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: selectedDoc === doc.file ? 'rgba(95, 251, 241, 0.2)' : 'transparent',
                    border: selectedDoc === doc.file ? '1px solid #5ffbf1' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: selectedDoc === doc.file ? '#5ffbf1' : '#8fa0c9',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDoc !== doc.file) {
                      e.currentTarget.style.background = 'rgba(95, 251, 241, 0.1)'
                      e.currentTarget.style.borderColor = 'rgba(95, 251, 241, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDoc !== doc.file) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {doc.name}
                </button>
              ))}
            </nav>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#8fa0c9' }}>
              <strong style={{ color: '#5ffbf1' }}>💡 Tipp:</strong>
              <p style={{ margin: '0.5rem 0 0 0', lineHeight: '1.5' }}>
                Die Dokumente befinden sich im Ordner:<br />
                <code style={{ fontSize: '0.8rem', color: '#a78bfa' }}>k2team-handbuch/</code>
              </p>
            </div>
          </aside>

          {/* Content */}
          <article style={{ background: 'rgba(95, 251, 241, 0.05)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(95, 251, 241, 0.2)', minHeight: '500px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#8fa0c9' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <div>Lade Dokument...</div>
              </div>
            ) : (
              <>
                <div className="k2-handbuch-druck">
                  {renderMarkdown(docContent)}
                </div>
                <div className="seitenfuss" style={{ display: 'none' }} aria-hidden />
              </>
            )}
          </article>
        </div>
      </div>
    </main>
  )
}
