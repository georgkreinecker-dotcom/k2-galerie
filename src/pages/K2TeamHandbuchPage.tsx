import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProjectNavButton } from '../components/Navigation'

const HANDBUCH_DOC_PARAM = 'doc'

export default function K2TeamHandbuchPage() {
  const [searchParams] = useSearchParams()
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

  const renderMarkdown = (text: string) => {
    // Einfaches Markdown-Rendering
    return text
      .split('\n')
      .map((line, i) => {
        // Überschriften
        if (line.startsWith('# ')) {
          return <h1 key={i} style={{ fontSize: '2rem', marginTop: '2rem', marginBottom: '1rem', color: '#5ffbf1' }}>{line.substring(2)}</h1>
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} style={{ fontSize: '1.5rem', marginTop: '1.5rem', marginBottom: '0.75rem', color: '#8b5cf6' }}>{line.substring(3)}</h2>
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} style={{ fontSize: '1.25rem', marginTop: '1rem', marginBottom: '0.5rem', color: '#a78bfa' }}>{line.substring(4)}</h3>
        }
        // Fett
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{line.substring(2, line.length - 2)}</p>
        }
        // Code-Blöcke
        if (line.startsWith('```')) {
          return null // Überspringe Code-Block-Markierungen
        }
        // Listen
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }}>{line.substring(2)}</li>
        }
        // Leerzeilen
        if (line.trim() === '') {
          return <br key={i} />
        }
        // Normaler Text
        return <p key={i} style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>{line}</p>
      })
  }

  const compactPrintStyles = `
    @media print {
      .no-print { display: none !important; }
      .mission-wrapper .viewport header,
      .mission-wrapper .viewport aside { display: none !important; }
      .mission-wrapper .handbuch-layout { grid-template-columns: 1fr !important; gap: 0 !important; }
      .mission-wrapper .viewport { padding: 0 !important; }
      .mission-wrapper article { border: none !important; background: white !important; color: black !important; padding: 6mm 10mm 14mm 10mm !important; }
      .mission-wrapper .k2-handbuch-druck { font-size: 10.5pt !important; line-height: 1.4 !important; }
      .mission-wrapper .k2-handbuch-druck h1 { font-size: 1.35rem !important; margin-top: 0 !important; margin-bottom: 0.25rem !important; }
      .mission-wrapper .k2-handbuch-druck h2 { font-size: 1.1rem !important; margin-top: 0.5rem !important; margin-bottom: 0.2rem !important; }
      .mission-wrapper .k2-handbuch-druck h3 { font-size: 1rem !important; margin-top: 0.4rem !important; margin-bottom: 0.15rem !important; }
      .mission-wrapper .k2-handbuch-druck p { margin-top: 0 !important; margin-bottom: 0.2rem !important; }
      .mission-wrapper .k2-handbuch-druck li { margin-bottom: 0.1rem !important; }
      .mission-wrapper .k2-handbuch-druck table { margin-bottom: 0.4rem !important; font-size: 9.5pt !important; }
      .mission-wrapper .k2-handbuch-druck th, .mission-wrapper .k2-handbuch-druck td { padding: 0.2rem 0.4rem !important; }
      .mission-wrapper .k2-handbuch-druck br { height: 0.15em; display: block; overflow: hidden; }
      .mission-wrapper h1, .mission-wrapper h2, .mission-wrapper h3 { color: black !important; page-break-after: avoid; }
      .mission-wrapper p, .mission-wrapper li { color: black !important; }
      .mission-wrapper .seitenfuss { display: block !important; position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 0.65rem; color: #666; padding: 0.2rem 0; }
      .mission-wrapper .seitenfuss::after { content: "Seite " counter(page); }
      @page { margin: 12mm 14mm 10mm 14mm; size: A4; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `

  return (
    <main className="mission-wrapper print-compact">
      <style>{compactPrintStyles}</style>
      <div className="viewport">
        <header className="no-print">
          <div>
            <h1>🧠 K2Team Handbuch</h1>
            <div className="meta">Team-Handbuch &amp; Vermächtnis – Handbuch unserer Zusammenarbeit</div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
              title="Handbuch drucken"
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
                <div className="k2-handbuch-druck" style={{ color: '#f4f7ff', lineHeight: '1.8' }}>
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
