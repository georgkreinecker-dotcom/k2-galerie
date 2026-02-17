import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { getCurrentTenantId } from '../config/tenantConfig'
import { MUSTER_TEXTE } from '../config/tenantConfig'
import '../App.css'

const STORAGE_KEYS = { martina: 'k2-stammdaten-martina', georg: 'k2-stammdaten-georg' } as const
const OEFFENTLICH_VITA_KEYS = { martina: 'k2-oeffentlich-vita-martina', georg: 'k2-oeffentlich-vita-georg' } as const
const DEFAULT_BIO = {
  martina: 'Martina bringt mit ihren Gemälden eine lebendige Vielfalt an Farben und Ausdruckskraft auf die Leinwand. ihre Werke spiegeln Jahre des Lernens, Experimentierens und der Leidenschaft für die Malerei wider.',
  georg: 'Georg verbindet in seiner Keramikarbeit technisches Können mit kreativer Gestaltung. Seine Arbeiten sind geprägt von Präzision und einer Liebe zum Detail, das Ergebnis von langjähriger Erfahrung.',
} as const

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
  const id = (artistId === 'martina' || artistId === 'georg' ? artistId : 'martina') as 'martina' | 'georg'
  const isOeffentlich = getCurrentTenantId() === 'oeffentlich'
  const storageKey = isOeffentlich ? OEFFENTLICH_VITA_KEYS[id] : STORAGE_KEYS[id]
  const [vita, setVita] = useState('')
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      if (isOeffentlich) {
        const raw = localStorage.getItem(storageKey)
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
        const raw = localStorage.getItem(storageKey)
        const data = raw ? JSON.parse(raw) : {}
        const existing = typeof data.vita === 'string' && data.vita.trim() !== ''
        setVita(existing ? data.vita : buildInitialVita(id, data))
      }
    } catch {
      setVita(buildInitialVita(id, isOeffentlich ? (id === 'martina' ? MUSTER_TEXTE.martina : MUSTER_TEXTE.georg) : {}))
    }
    setLoaded(true)
  }, [id, isOeffentlich, storageKey])

  const save = () => {
    try {
      if (isOeffentlich) {
        localStorage.setItem(storageKey, JSON.stringify({ vita }))
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        return
      }
      // K2: Niemals Stammdaten mit nur { vita } überschreiben – immer bestehende Daten erhalten
      const raw = localStorage.getItem(storageKey)
      const data = raw ? JSON.parse(raw) : {}
      const hasRealStammdaten = typeof data.name === 'string' && data.name.trim() !== ''
      if (!hasRealStammdaten && Object.keys(data).length <= 1) {
        alert('Stammdaten fehlen. Bitte zuerst im Admin (Galerie Vorschau → Stammdaten) Name, E-Mail usw. speichern. Dann kannst du hier die Vita ergänzen.')
        return
      }
      const updated = { ...data, vita }
      localStorage.setItem(storageKey, JSON.stringify(updated))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert('Speichern fehlgeschlagen: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  const title = id === 'martina' ? 'Vita – Martina' : 'Vita – Georg'
  const backTo = isOeffentlich ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlich : PROJECT_ROUTES['k2-galerie'].galerie

  if (!loaded) {
    return (
      <div className="page-container" style={{ padding: '2rem' }}>
        <p>Lade …</p>
      </div>
    )
  }

  return (
    <div className="page-container" style={{ padding: 'clamp(1rem, 4vw, 2rem)', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to={backTo} style={{ color: 'var(--k2-accent, #5ffbf1)', textDecoration: 'none', fontWeight: 600 }}>
          ← Zur Galerie
        </Link>
      </div>
      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '1rem' }}>{title}</h1>
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
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.2)',
          color: '#fff',
          fontSize: '1rem',
          lineHeight: '1.6',
          resize: 'vertical',
        }}
      />
      <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" className="btn-primary" onClick={save}>
          Speichern
        </button>
        {saved && <span style={{ color: 'var(--k2-accent)', fontSize: '0.9rem' }}>Gespeichert.</span>}
      </div>
    </div>
  )
}
