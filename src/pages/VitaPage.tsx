import React, { useState, useEffect, useRef } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import {
  MUSTER_TEXTE,
  PRODUCT_COPYRIGHT_BRAND_ONLY,
  PRODUCT_URHEBER_ANWENDUNG,
  K2_DEFAULT_VITA_MARTINA,
  K2_DEFAULT_VITA_GEORG,
  isPlatformInstance,
} from '../config/tenantConfig'
import { loadStammdaten, saveStammdaten } from '../utils/stammdatenStorage'
import { isOeffentlichDisplayContext } from '../utils/oeffentlichContext'
import { mayEditContent } from '../utils/visitorContext'
import {
  lineLooksLikeVitaListItem,
  isShortSectionTitleLine,
  mergeHeadingBeforeListBlocks,
} from '../utils/vitaTextStructured'
import '../App.css'

// K2: Stammdaten nur über Schicht (Phase 5.3). ök2: Vita-eigene Keys (Inhalt nur hier).
const OEFFENTLICH_VITA_KEYS = { martina: 'k2-oeffentlich-vita-martina', georg: 'k2-oeffentlich-vita-georg' } as const
const K2_DEFAULT_VITA_BY_PERSON = { martina: K2_DEFAULT_VITA_MARTINA, georg: K2_DEFAULT_VITA_GEORG } as const
const DEFAULT_BIO = {
  martina: 'Martina bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. ihre Werke spiegeln Jahre des Lernens, Experimentierens und der Leidenschaft für die Malerei wider.',
  georg: 'Georg verbindet in seiner Keramikarbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail, das Ergebnis von langjähriger Erfahrung.',
} as const

/**
 * Vita-Lesetext: Absätze, optional Zwischenüberschrift + Liste (Jahreszeilen).
 * Kein Markdown nötig – nutzt Leerzeilen und Zeilenumbrüche wie im Stammdaten-Text.
 */
function VitaReadView({ text }: { text: string }) {
  if (!text.trim()) {
    return <p style={{ margin: 0, opacity: 0.75 }}>Keine Vita hinterlegt.</p>
  }
  const paragraphs = mergeHeadingBeforeListBlocks(text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean))
  const prose: React.ReactNode[] = []
  let firstSectionH2 = true

  const pStyle: React.CSSProperties = {
    margin: '0 0 1.2em',
    textAlign: 'left' as const,
    maxWidth: '62ch',
  }
  const sectionH2: React.CSSProperties = {
    margin: '1.65em 0 0.65em',
    fontSize: 'clamp(1.12rem, 2.6vw, 1.32rem)',
    fontWeight: 600,
    letterSpacing: '0.02em',
    lineHeight: 1.35,
    color: 'rgba(255, 245, 240, 0.98)',
    borderBottom: '1px solid rgba(95, 251, 241, 0.22)',
    paddingBottom: '0.35rem',
  }
  const ulStyle: React.CSSProperties = {
    margin: '0 0 1.25em',
    paddingLeft: '1.15rem',
    listStylePosition: 'outside' as const,
  }
  const liStyle: React.CSSProperties = {
    marginBottom: '0.45em',
    paddingLeft: '0.25rem',
    lineHeight: 1.65,
  }

  paragraphs.forEach((block, pi) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length === 0) return

    // Ein Absatz: ein Satz / ein Block
    if (lines.length === 1) {
      prose.push(
        <p key={`p-${pi}`} style={pStyle}>
          {lines[0]}
        </p>,
      )
      return
    }

    // Erste Zeile kurz = Zwischenüberschrift, Rest = Liste (Jahre/Kurse)
    const [head, ...rest] = lines
    const restAllList = rest.length >= 1 && rest.every((l) => lineLooksLikeVitaListItem(l))
    if (isShortSectionTitleLine(head) && restAllList && rest.length >= 1) {
      const mt = firstSectionH2 ? 0 : '1.65em'
      firstSectionH2 = false
      prose.push(
        <h2 key={`h-${pi}`} style={{ ...sectionH2, marginTop: mt }}>
          {head}
        </h2>,
      )
      prose.push(
        <ul key={`ul-${pi}`} style={ulStyle}>
          {rest.map((line, li) => (
            <li key={li} style={liStyle}>
              {line}
            </li>
          ))}
        </ul>,
      )
      return
    }

    // Ganzer Block wirkt wie reine Liste (ohne eigene Überschriftenzeile)
    const allList = lines.length >= 2 && lines.every((l) => lineLooksLikeVitaListItem(l))
    if (allList) {
      prose.push(
        <ul key={`ul-${pi}`} style={ulStyle}>
          {lines.map((line, li) => (
            <li key={li} style={liStyle}>
              {line}
            </li>
          ))}
        </ul>,
      )
      return
    }

    // Mehrzeiliger Absatz (z. B. Kontakt) – Zeilenumbrüche im Fließ
    prose.push(
      <p key={`p-${pi}`} style={pStyle}>
        {lines.map((line, li) => (
          <React.Fragment key={li}>
            {li > 0 ? <br /> : null}
            {line}
          </React.Fragment>
        ))}
      </p>,
    )
  })

  return (
    <article
      lang="de"
      style={{
        maxWidth: '40rem',
        margin: '0 auto',
        fontSize: 'clamp(1.05rem, 2.35vw, 1.125rem)',
        lineHeight: 1.82,
        color: 'rgba(255, 255, 255, 0.92)',
        letterSpacing: '0.015em',
        fontFeatureSettings: '"kern" 1, "liga" 1',
      }}
    >
      {prose}
    </article>
  )
}

function buildInitialVita(artistId: 'martina' | 'georg', data: { name?: string; email?: string; phone?: string; bio?: string }): string {
  const name = data.name || (artistId === 'martina' ? 'Martina Kreinecker' : 'Georg Kreinecker')
  const bio = data.bio || DEFAULT_BIO[artistId]
  const lines: string[] = [name, '', 'Kurzbiografie', '—', bio]
  if (data.email || data.phone) {
    lines.push('')
    lines.push('Kontakt')
    if (data.email) lines.push(`E-Mail: ${data.email}`)
    if (data.phone) lines.push(`Telefon: ${data.phone}`)
  }
  lines.push('')
  lines.push('(Hier Vita erweitern: Werdegang, Ausstellungen, Techniken, Statement …)')
  return lines.join('\n')
}

export default function VitaPage() {
  const { artistId } = useParams<{ artistId: string }>()
  const location = useLocation()
  const id = (artistId === 'martina' || artistId === 'georg' ? artistId : 'martina') as 'martina' | 'georg'
  // Phase 5.3: eine zentrale Quelle für „Anzeige als ök2“
  const isOeffentlich = isOeffentlichDisplayContext(location.state)
  const oeffentlichStorageKey = OEFFENTLICH_VITA_KEYS[id]
  const [vita, setVita] = useState('')
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      if (isOeffentlich) {
        const raw = localStorage.getItem(oeffentlichStorageKey)
        let loaded = ''
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            loaded = typeof parsed === 'string' ? parsed : (parsed?.vita || '')
          } catch { /* ignore */ }
        }
        if (loaded.trim()) {
          setVita(loaded)
        } else {
          const muster = id === 'martina' ? MUSTER_TEXTE.martina : MUSTER_TEXTE.georg
          const bio = id === 'martina' ? MUSTER_TEXTE.artist1Bio : MUSTER_TEXTE.artist2Bio
          setVita(buildInitialVita(id, { name: muster.name, email: muster.email, phone: muster.phone, bio }))
        }
      } else {
        const data = loadStammdaten('k2', id) as { name?: string; email?: string; phone?: string; bio?: string; vita?: string }
        const existing = typeof data?.vita === 'string' && data.vita.trim() !== ''
        if (existing) {
          setVita(data.vita!)
        } else if (isPlatformInstance()) {
          setVita(K2_DEFAULT_VITA_BY_PERSON[id])
        } else {
          setVita(buildInitialVita(id, data || {}))
        }
      }
    } catch {
      if (isOeffentlich) {
        const muster = id === 'martina' ? MUSTER_TEXTE.martina : MUSTER_TEXTE.georg
        setVita(buildInitialVita(id, muster))
      } else if (isPlatformInstance()) {
        setVita(K2_DEFAULT_VITA_BY_PERSON[id])
      } else {
        setVita(buildInitialVita(id, {}))
      }
    }
    setLoaded(true)
  }, [id, isOeffentlich])

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    }
  }, [])

  const save = () => {
    try {
      if (isOeffentlich) {
        localStorage.setItem(oeffentlichStorageKey, JSON.stringify({ vita }))
        if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
        setSaved(true)
        savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000)
        return
      }
      // K2: nur über Schicht – bestehende Stammdaten laden, vita ergänzen, zurück schreiben
      const data = loadStammdaten('k2', id) as any
      const hasRealStammdaten = typeof data?.name === 'string' && data.name.trim() !== ''
      if (!hasRealStammdaten && (!data || Object.keys(data).length <= 1)) {
        alert('Stammdaten fehlen. Bitte zuerst im Admin (Galerie Vorschau → Stammdaten) Name, E-Mail usw. speichern. Dann kannst du hier die Vita ergänzen.')
        return
      }
      saveStammdaten('k2', id, { ...data, vita })
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
      setSaved(true)
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert('Speichern fehlgeschlagen: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  const title = id === 'martina' ? 'Vita – Martina' : 'Vita – Georg'
  const backTo = isOeffentlich ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlich : PROJECT_ROUTES['k2-galerie'].galerie
  const canEdit = mayEditContent(location.state)

  if (!loaded) {
    return (
      <div className="page-container" style={{ padding: '2rem' }}>
        <p>Lade …</p>
      </div>
    )
  }

  return (
    <div className="page-container" style={{ padding: 'clamp(1rem, 4vw, 2rem)', maxWidth: 'min(48rem, 100%)', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to={backTo} style={{ color: 'var(--k2-accent, #5ffbf1)', textDecoration: 'none', fontWeight: 600 }}>
          ← Zur Galerie
        </Link>
      </div>
      <h1
        style={{
          fontSize: 'clamp(1.55rem, 4vw, 2.05rem)',
          fontWeight: 700,
          letterSpacing: '0.02em',
          lineHeight: 1.25,
          margin: '0 0 1.35rem',
          color: 'rgba(255, 248, 240, 0.98)',
        }}
      >
        {title}
      </h1>
      {canEdit ? (
        <>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginBottom: '1rem' }}>
            Vita als Dokument – in den Einstellungen (Stammdaten) gespeichert. Bearbeite den Text und klicke auf Speichern.
          </p>
          <textarea
            value={vita}
            onChange={(e) => setVita(e.target.value)}
            placeholder="Vita-Text …"
            style={{
              width: '100%',
              minHeight: '320px',
              padding: '1.1rem 1.15rem',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.25)',
              color: '#fff',
              fontSize: 'clamp(1rem, 2.2vw, 1.05rem)',
              lineHeight: 1.75,
              letterSpacing: '0.01em',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn-primary" onClick={save}>
              Speichern
            </button>
            {saved && <span style={{ color: 'var(--k2-accent)', fontSize: '0.9rem' }}>Gespeichert.</span>}
          </div>
        </>
      ) : (
        <VitaReadView text={vita} />
      )}
      <footer style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
        <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
        <div style={{ marginTop: '0.35rem', fontSize: '0.7rem', opacity: 0.95 }}>{PRODUCT_URHEBER_ANWENDUNG}</div>
      </footer>
    </div>
  )
}
