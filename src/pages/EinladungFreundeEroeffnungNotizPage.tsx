import { useState, useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import {
  georgsNotizBackLinkStyle,
  georgsNotizBaseStyles,
  georgsNotizContainerStyle,
  georgsNotizPageStyle,
  renderGeorgsNotizMarkdown,
} from '../utils/georgsNotizMarkdownView'

const baseStyles = georgsNotizBaseStyles

const MD_PATH = '/notizen-georg/diverses/einladung-freunde-eroeffnung-k2-24-04-2026.md'

export default function EinladungFreundeEroeffnungNotizPage() {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(MD_PATH)
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
      body = renderGeorgsNotizMarkdown(content)
    } catch {
      body = <p style={baseStyles.p}>Fehler beim Anzeigen. <Link to={PROJECT_ROUTES['k2-galerie'].notizen} style={baseStyles.a}>Zurück zu Notizen</Link></p>
    }
  }

  return (
    <div style={georgsNotizPageStyle}>
      <div style={{ ...georgsNotizContainerStyle, maxWidth: 720 }}>
        <Link to={PROJECT_ROUTES['k2-galerie'].notizen} style={georgsNotizBackLinkStyle}>
          ← Zurück zu Georgs Notizen
        </Link>
        {body}
      </div>
    </div>
  )
}
