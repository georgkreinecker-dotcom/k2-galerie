/**
 * K2 Galerie – eigenes Handbuch (nur für K2 / ök2 / VK2).
 * Team-Handbuch & Vermächtnis: Verweis auf K2Team Handbuch.
 */

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PLATFORM_ROUTES } from '../config/navigation'

const HANDBUCH_DOC_PARAM = 'doc'
const HANDBUCH_BASE = '/k2team-handbuch'

const GALERIE_DOCUMENTS = [
  { id: '11-backup', name: 'Backup-Zusammenfassung', file: '11-BACKUP-ZUSAMMENFASSUNG.md' },
  { id: '12-arbeitsplattform', name: 'Arbeitsplattform Verbesserungen', file: '12-ARBEITSPLATTFORM-VERBESSERUNGEN.md' },
  { id: '13-backup-vollbackup', name: 'Backup & Vollbackup K2 Galerie', file: '13-BACKUP-VOLLBACKUP-K2-GALERIE.md' },
  { id: '14-sicherheit', name: 'Sicherheit & Vor Veröffentlichung', file: '14-SICHERHEIT-PRODUKT-LABEL.md' },
  { id: '15-skalierung', name: 'Skalierungsprinzip', file: '15-SKALIERUNGSPRINZIP.md' },
  { id: '16-zentrale-themen', name: 'Zentrale Themen für Nutzer', file: '16-ZENTRALE-THEMEN-FUER-NUTZER.md' },
] as const

export default function K2GalerieHandbuchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [docContent, setDocContent] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const docFromUrl = searchParams.get(HANDBUCH_DOC_PARAM)
    const fileToLoad = docFromUrl && GALERIE_DOCUMENTS.some((d) => d.file === docFromUrl)
      ? docFromUrl
      : GALERIE_DOCUMENTS[0].file
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

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: '2rem', marginTop: '2rem', marginBottom: '1rem', color: '#ff8c42' }}>{line.substring(2)}</h1>
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.5rem', marginTop: '1.5rem', marginBottom: '0.75rem', color: '#e86b2a' }}>{line.substring(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '1.25rem', marginTop: '1rem', marginBottom: '0.5rem', color: '#f59e0b' }}>{line.substring(4)}</h3>
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{line.substring(2, line.length - 2)}</p>
        if (line.startsWith('```')) return null
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }}>{line.substring(2)}</li>
        if (line.trim() === '') return <br key={i} />
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
      .mission-wrapper h1, .mission-wrapper h2, .mission-wrapper h3 { color: black !important; }
      .mission-wrapper .seitenfuss { display: block !important; position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 0.65rem; color: #666; padding: 0.2rem 0; }
      .mission-wrapper .seitenfuss::after { content: "Seite " counter(page); }
      @page { margin: 12mm 14mm 10mm 14mm; size: A4; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `

  return (
    <div className="mission-wrapper">
      <style>{compactPrintStyles}</style>
      <div className="viewport" style={{ padding: '1.5rem 2rem' }}>
        <header className="no-print" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, color: '#ff8c42', fontSize: '1.75rem' }}>🧠 K2 Galerie Handbuch</h1>
            <p className="meta" style={{ marginTop: '0.35rem' }}>Alles Wichtige für K2, ök2, VK2 – Backup, Sicherheit, APf, Zentrale Themen.</p>
            <p className="handbuch-team-ref meta" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
              Team-Handbuch &amp; Vermächtnis: <Link to="/k2team-handbuch" style={{ color: '#5ffbf1', textDecoration: 'underline' }}>K2Team Handbuch (Vermächtnis)</Link>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.75rem' }}>
            <button type="button" onClick={() => window.print()} className="btn small-btn" style={{ background: '#e86b2a', color: '#fff', border: 'none', cursor: 'pointer' }}>🖨️ Drucken</button>
            <Link to={PLATFORM_ROUTES.missionControl} style={{ color: '#ff8c42', textDecoration: 'none', fontSize: '0.9rem' }}>← Mission Control</Link>
          </div>
        </header>

        <div className="handbuch-layout" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
          <aside className="no-print" style={{ background: 'rgba(255,140,66,0.08)', padding: '1rem', borderRadius: 12, border: '1px solid rgba(255,140,66,0.25)', height: 'fit-content', position: 'sticky', top: '1rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', color: '#ff8c42', fontSize: '1rem' }}>Kapitel</h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {GALERIE_DOCUMENTS.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => openDoc(doc.file)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: selectedDoc === doc.file ? 'rgba(255,140,66,0.2)' : 'transparent',
                    border: selectedDoc === doc.file ? '1px solid #ff8c42' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    color: selectedDoc === doc.file ? '#ff8c42' : 'rgba(255,255,255,0.85)',
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

          <article style={{ background: 'rgba(255,140,66,0.06)', padding: '1.5rem 2rem', borderRadius: 12, border: '1px solid rgba(255,140,66,0.2)', minHeight: 400 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>Lade Dokument...</div>
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
