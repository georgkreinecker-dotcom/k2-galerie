import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import type { Vk2Stammdaten } from '../config/tenantConfig'

function loadVk2Stammdaten(): Vk2Stammdaten | null {
  try {
    const raw = localStorage.getItem('k2-vk2-stammdaten')
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

// Typ für ein Katalog-Werk (aus gallery-data.json eines Lizenzmitglieds)
interface KatalogWork {
  id: string
  title: string
  imageUrl?: string
  artist?: string
  technik?: string
  year?: string
  paintingWidth?: string | number
  paintingHeight?: string | number
  price?: number | string
  verkaufsstatus?: 'verfuegbar' | 'reserviert' | 'verkauft'
  description?: string
  category?: string
  mitgliedName?: string
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  verfuegbar:  { label: 'Verfügbar',  color: '#22c55e' },
  reserviert:  { label: 'Reserviert', color: '#f59e0b' },
  verkauft:    { label: 'Verkauft',   color: '#ef4444' },
}

const s = {
  bg:       '#0f1923',
  card:     'rgba(255,255,255,0.04)',
  border:   'rgba(255,255,255,0.1)',
  text:     '#e8eaf0',
  muted:    'rgba(255,255,255,0.45)',
  accent:   '#fbbf24',
}

export const Vk2KatalogPage: React.FC = () => {
  const [works, setWorks]         = useState<KatalogWork[]>([])
  const [loading, setLoading]     = useState(true)
  const [filterArtist, setFilterArtist] = useState('')
  const [filterStatus, setFilterStatus] = useState<'alle' | 'verfuegbar' | 'reserviert' | 'verkauft'>('alle')
  const [filterCategory, setFilterCategory] = useState('')

  // Werke sammeln: aus lizenzGalerieUrl (fetch) + lokale Fallbacks
  useEffect(() => {
    const stammdaten = loadVk2Stammdaten()
    const mitglieder = stammdaten?.mitglieder || []

    const collected: KatalogWork[] = []

    // 1. Lokale Werke aus Mitglieder-Artwork-Keys (wie bisher)
    mitglieder.forEach((m: import('../config/tenantConfig').Vk2Mitglied) => {
      const keySuffix = m.name.replace(/\s+/g, '-').toLowerCase()
      const rawLocal = localStorage.getItem(`k2-vk2-artworks-${keySuffix}`) || localStorage.getItem(`k2-artworks-${keySuffix}`)
      if (rawLocal) {
        try {
          const parsed: any[] = JSON.parse(rawLocal)
          parsed.filter(w => w.imVereinskatalog).forEach(w => collected.push({ ...w, mitgliedName: m.name, artist: w.artist || m.name }))
        } catch { /* ignore */ }
      }
    })

    // 2. Werke aus Lizenz-Galerien per fetch (lizenzGalerieUrl → gallery-data.json)
    const mitgliederMitUrl = mitglieder.filter((m: import('../config/tenantConfig').Vk2Mitglied) => m.lizenzGalerieUrl?.trim())
    if (mitgliederMitUrl.length > 0) {
      const base = (url: string) => url.replace(/\/$/, '')
      Promise.all(
        mitgliederMitUrl.map(async (m: import('../config/tenantConfig').Vk2Mitglied) => {
          const url = `${base(m.lizenzGalerieUrl!)}/gallery-data.json?t=${Date.now()}`
          try {
            const res = await fetch(url, { cache: 'no-store' })
            if (!res.ok) return []
            const data = await res.json()
            const artworks = Array.isArray(data.artworks) ? data.artworks : []
            return artworks
              .filter((w: any) => w.imVereinskatalog)
              .map((w: any) => ({ ...w, mitgliedName: m.name, artist: w.artist || m.name }))
          } catch {
            return []
          }
        })
      ).then((arrays) => {
        const fromFetch: KatalogWork[] = []
        arrays.forEach((arr) => arr.forEach((w: KatalogWork) => fromFetch.push(w)))
        setWorks([...collected, ...fromFetch])
        setLoading(false)
      })
      return
    }

    // 3. Fallback: globale Werke aus k2-artworks (K2-eigene Demo)
    if (collected.length === 0) {
      try {
        const raw = localStorage.getItem('k2-artworks') || localStorage.getItem('k2-oeffentlich-artworks')
        if (raw) {
          const all: any[] = JSON.parse(raw)
          all.filter(w => w.imVereinskatalog).forEach(w => collected.push({ ...w, mitgliedName: w.artist || 'K2 Galerie' }))
        }
      } catch { /* ignore */ }
    }

    setWorks(collected)
    setLoading(false)
  }, [])

  const artists   = useMemo(() => [...new Set(works.map(w => w.artist || w.mitgliedName || '').filter(Boolean))], [works])
  const categories = useMemo(() => [...new Set(works.map(w => w.category || '').filter(Boolean))], [works])

  const filtered = useMemo(() => works.filter(w => {
    if (filterArtist   && (w.artist || w.mitgliedName) !== filterArtist) return false
    if (filterStatus !== 'alle' && (w.verkaufsstatus || 'verfuegbar') !== filterStatus) return false
    if (filterCategory && (w.category || '') !== filterCategory) return false
    return true
  }), [works, filterArtist, filterStatus, filterCategory])

  const handlePrint = () => window.print()

  // PDF-Druck nur für eingeloggte Mitglieder (oder VK2-Admin/Vorstand)
  const SESSION_KEY = 'k2-vk2-mitglied-eingeloggt'
  const isMitgliedEingeloggt = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem(SESSION_KEY)
  const isVk2Admin = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-admin-context') === 'vk2'
  const darfPdfDrucken = isMitgliedEingeloggt || isVk2Admin

  return (
    <div className="print-compact" style={{ minHeight: '100vh', background: s.bg, color: s.text, fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <header style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to={PROJECT_ROUTES.vk2.galerie} style={{ color: s.muted, textDecoration: 'none', fontSize: '0.85rem' }}>← Zurück</Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 800, color: s.accent }}>
            🏆 Vereinskatalog
          </h1>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.8rem', color: s.muted }}>
            Die schönsten Werke unserer Lizenzmitglieder
          </p>
        </div>
        {darfPdfDrucken ? (
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
            <button
              onClick={handlePrint}
              style={{ padding: '0.5rem 1.1rem', background: 'rgba(251,191,36,0.15)', border: `1px solid rgba(251,191,36,0.4)`, borderRadius: 8, color: s.accent, fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
              title="Im Druckdialog „Als PDF speichern“ wählen, um die Datei herunterzuladen."
            >
              🖨️ Als PDF drucken / herunterladen
            </button>
            <span style={{ fontSize: '0.72rem', color: s.muted }}>Im Druckdialog „Als PDF speichern“ wählen</span>
          </div>
        ) : (
          <span className="no-print" style={{ fontSize: '0.78rem', color: s.muted }}>
            PDF-Druck nur für eingeloggte Mitglieder
          </span>
        )}
      </header>

      {/* Filter-Bar */}
      <div className="no-print" style={{ padding: '0.9rem 1.5rem', borderBottom: `1px solid ${s.border}`, display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status-Filter */}
        {(['alle','verfuegbar','reserviert','verkauft'] as const).map(st => (
          <button key={st} onClick={() => setFilterStatus(st)} style={{ padding: '0.3rem 0.8rem', borderRadius: 20, border: `1px solid ${filterStatus === st ? s.accent : s.border}`, background: filterStatus === st ? 'rgba(251,191,36,0.15)' : 'transparent', color: filterStatus === st ? s.accent : s.muted, fontSize: '0.8rem', cursor: 'pointer', fontWeight: filterStatus === st ? 700 : 400 }}>
            {st === 'alle' ? 'Alle' : STATUS_LABEL[st].label}
          </button>
        ))}

        {artists.length > 0 && (
          <select value={filterArtist} onChange={e => setFilterArtist(e.target.value)} style={{ padding: '0.3rem 0.7rem', borderRadius: 8, border: `1px solid ${s.border}`, background: '#1a2333', color: s.text, fontSize: '0.8rem', outline: 'none' }}>
            <option value="">Alle Künstler:innen</option>
            {artists.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        )}

        {categories.length > 0 && (
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: '0.3rem 0.7rem', borderRadius: 8, border: `1px solid ${s.border}`, background: '#1a2333', color: s.text, fontSize: '0.8rem', outline: 'none' }}>
            <option value="">Alle Kategorien</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: s.muted }}>{filtered.length} {filtered.length === 1 ? 'Werk' : 'Werke'}</span>
      </div>

      {/* Werke-Grid */}
      <main style={{ padding: 'clamp(1rem, 4vw, 2rem) clamp(0.75rem, 4vw, 2rem)' }}>
        {loading ? (
          <p style={{ color: s.muted, textAlign: 'center', marginTop: '3rem' }}>Lade Katalog …</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <div style={{ fontSize: '2.5rem', opacity: 0.3 }}>🏆</div>
            <p style={{ color: s.muted, marginTop: '0.75rem' }}>
              {works.length === 0
                ? 'Noch keine Werke im Katalog. Lizenzmitglieder können bis zu 5 Werke freigeben.'
                : 'Kein Werk für diesen Filter.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: 'clamp(0.75rem, 3vw, 1.5rem)' }}>
            {filtered.map(w => (
              <KatalogKarte key={w.id} work={w} />
            ))}
          </div>
        )}
      </main>

      {/* Print-Styles (seitensparend: @page aus index.css) */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; color: #111 !important; }
          header { border-bottom: 1px solid #ccc !important; }
          main { padding: 0 2mm !important; }
        }
      `}</style>
    </div>
  )
}

const KatalogKarte: React.FC<{ work: KatalogWork }> = ({ work }) => {
  const status = work.verkaufsstatus || 'verfuegbar'
  const { label: statusLabel, color: statusColor } = STATUS_LABEL[status] || STATUS_LABEL.verfuegbar
  const masse = (work.paintingWidth && work.paintingHeight)
    ? `${work.paintingWidth} × ${work.paintingHeight} cm`
    : null

  return (
    <div style={{ background: s.card, border: `1px solid ${s.border}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', breakInside: 'avoid' }}>
      {/* Bild */}
      <div style={{ aspectRatio: '4/3', background: 'rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
        {work.imageUrl ? (
          <img src={work.imageUrl} alt={work.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', opacity: 0.3 }}>🖼️</div>
        )}
        {/* Verkaufsstatus-Badge */}
        <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.2rem 0.55rem', borderRadius: 20, background: `rgba(0,0,0,0.65)`, border: `1px solid ${statusColor}`, color: statusColor, fontSize: '0.7rem', fontWeight: 700 }}>
          {statusLabel}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '0.9rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: s.text }}>{work.title}</div>
        <div style={{ fontSize: '0.8rem', color: s.accent, fontWeight: 600 }}>{work.artist || work.mitgliedName}</div>

        {(work.technik || work.year) && (
          <div style={{ fontSize: '0.76rem', color: s.muted }}>
            {[work.technik, work.year].filter(Boolean).join(' · ')}
          </div>
        )}
        {masse && <div style={{ fontSize: '0.76rem', color: s.muted }}>{masse}</div>}

        {work.description && (
          <div style={{ fontSize: '0.76rem', color: s.muted, marginTop: '0.2rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {work.description}
          </div>
        )}

        {/* Preis */}
        <div style={{ marginTop: 'auto', paddingTop: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: status === 'verkauft' ? s.muted : s.text }}>
            {work.price ? `€ ${Number(work.price).toLocaleString('de-AT')}` : '–'}
          </span>
          {work.category && (
            <span style={{ fontSize: '0.7rem', color: s.muted, background: 'rgba(255,255,255,0.06)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>{work.category}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Vk2KatalogPage
