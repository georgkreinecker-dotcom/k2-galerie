/**
 * K2 Markt – eigene Mappe (in K2 Galerie).
 * Vision, Architektur, Handbuch – alles zum Projekt K2 Markt. Quelle: public/k2-markt/
 */

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

const DOC_PARAM = 'doc'
const BASE = '/k2-markt'

const DOCUMENTS = [
  { id: 'index', name: 'Inhaltsverzeichnis', file: '00-INDEX.md' },
  { id: 'vision', name: 'Vision und Architektur (eine Quelle)', file: 'K2-MARKT-VISION-ARCHITEKTUR.md' },
  { id: 'handbuch', name: 'Handbuch K2 Markt', file: 'K2-MARKT-HANDBUCH.md' },
  { id: 'planer', name: 'Für die Planer', file: 'K2-MARKT-FUER-PLANER.md' },
  { id: 'produkt-moment', name: 'Produkt-Moment (Modell)', file: 'K2-MARKT-PRODUKT-MOMENT.md' },
  { id: 'dod-flyer', name: 'DoD Flyer', file: 'K2-MARKT-DOD-FLYER.md' },
] as const

export default function K2MarktPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [docContent, setDocContent] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const docFromUrl = searchParams.get(DOC_PARAM)
    const fileToLoad = docFromUrl && DOCUMENTS.some((d) => d.file === docFromUrl)
      ? docFromUrl
      : DOCUMENTS[0].file
    loadDocument(fileToLoad)
  }, [searchParams])

  const loadDocument = async (filename: string) => {
    setLoading(true)
    setSelectedDoc(filename)
    try {
      const response = await fetch(`${BASE}/${filename}`)
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
    setSearchParams({ [DOC_PARAM]: file }, { replace: true })
  }

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: '1.75rem', marginTop: '1.5rem', marginBottom: '0.75rem', color: '#5ffbf1' }}>{line.substring(2)}</h1>
        if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.35rem', marginTop: '1.25rem', marginBottom: '0.5rem', color: 'rgba(95,251,241,0.9)' }}>{line.substring(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.4rem', color: 'rgba(95,251,241,0.85)' }}>{line.substring(4)}</h3>
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{line.substring(2, line.length - 2)}</p>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.25rem' }}>{line.substring(2)}</li>
        if (line.trim() === '') return <br key={i} />
        return <p key={i} style={{ marginBottom: '0.75rem', lineHeight: '1.6' }}>{line}</p>
      })
  }

  return (
    <div className="mission-wrapper">
      <div className="viewport" style={{ padding: '1.5rem 2rem' }}>
        <header className="no-print" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, color: '#5ffbf1', fontSize: '1.75rem' }}>📁 K2 Markt</h1>
            <p className="meta" style={{ marginTop: '0.35rem' }}>Eigene Mappe – Vision, Architektur, Handbuch. Alles zum Projekt K2 Markt, sauber koordiniert und sortiert.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.75rem' }}>
            <Link to={PROJECT_ROUTES['k2-galerie'].home} style={{ color: '#5ffbf1', textDecoration: 'none', fontSize: '0.9rem' }}>← K2 Galerie</Link>
            <Link to={PROJECT_ROUTES['k2-galerie'].kampagneMarketingStrategie} style={{ color: 'rgba(95,251,241,0.85)', textDecoration: 'none', fontSize: '0.9rem' }}>Kampagne Marketing-Strategie</Link>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.5rem' }}>
          <aside className="no-print" style={{ background: 'rgba(95,251,241,0.08)', padding: '1rem', borderRadius: 12, border: '1px solid rgba(95,251,241,0.25)', height: 'fit-content', position: 'sticky', top: '1rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', color: '#5ffbf1', fontSize: '1rem' }}>Inhalt der Mappe</h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {DOCUMENTS.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => openDoc(doc.file)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: selectedDoc === doc.file ? 'rgba(95,251,241,0.2)' : 'transparent',
                    border: selectedDoc === doc.file ? '1px solid #5ffbf1' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8,
                    color: selectedDoc === doc.file ? '#5ffbf1' : 'rgba(255,255,255,0.85)',
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

          <article style={{ background: 'rgba(95,251,241,0.06)', padding: '1.5rem 2rem', borderRadius: 12, border: '1px solid rgba(95,251,241,0.2)', minHeight: 400 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>Lade Dokument...</div>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.95)', lineHeight: 1.75 }}>{renderMarkdown(docContent)}</div>
            )}
          </article>
        </div>
      </div>
    </div>
  )
}
