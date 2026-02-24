import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { initVk2DemoStammdatenIfEmpty, type Vk2Stammdaten, type Vk2Mitglied } from '../config/tenantConfig'
import { PROJECT_ROUTES } from '../config/navigation'
import { BUILD_LABEL } from '../buildInfo.generated'
import '../App.css'

// Lädt VK2-Mitglieder – NUR aus eigenem Key, keine K2/ök2-Daten
function loadVk2Mitglieder(): Vk2Mitglied[] {
  try {
    initVk2DemoStammdatenIfEmpty()
    const raw = localStorage.getItem('k2-vk2-stammdaten')
    if (!raw) return []
    const parsed = JSON.parse(raw) as Vk2Stammdaten
    const mitglieder = Array.isArray(parsed?.mitglieder) ? parsed.mitglieder : []
    return mitglieder.filter(m => m?.name && m?.oeffentlichSichtbar !== false)
  } catch {
    return []
  }
}

function loadVk2VereinName(): string {
  try {
    const raw = localStorage.getItem('k2-vk2-stammdaten')
    if (!raw) return 'Vereinsplattform'
    const parsed = JSON.parse(raw) as Vk2Stammdaten
    return parsed?.verein?.name || 'Vereinsplattform'
  } catch {
    return 'Vereinsplattform'
  }
}

const Vk2GalerieVorschauPage: React.FC = () => {
  const navigate = useNavigate()
  const [mitglieder, setMitglieder] = useState<Vk2Mitglied[]>([])
  const [vereinsName, setVereinsName] = useState('Vereinsplattform')

  // Beim Mount: Demo-Daten sicherstellen, dann laden
  useEffect(() => {
    setMitglieder(loadVk2Mitglieder())
    setVereinsName(loadVk2VereinName())
  }, [])

  // Neu laden wenn sich localStorage ändert
  useEffect(() => {
    const reload = () => {
      setMitglieder(loadVk2Mitglieder())
      setVereinsName(loadVk2VereinName())
    }
    window.addEventListener('storage', reload)
    window.addEventListener('vk2-stammdaten-updated', reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener('vk2-stammdaten-updated', reload)
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1c2e',
      color: '#f0f6ff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem 2rem 1rem',
        borderBottom: '1px solid rgba(37,99,235,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: '#60a5fa', textTransform: 'uppercase' }}>
              VK2 Vereinsplattform
            </span>
            <button
              type="button"
              onClick={() => navigate(PROJECT_ROUTES.vk2.galerie)}
              title="Zur Willkommensseite"
              style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.35)', borderRadius: 6, padding: '0.15rem 0.5rem', cursor: 'pointer', color: '#60a5fa', fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              🏛️
            </button>
          </div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, color: '#f0f6ff' }}>
            {vereinsName}
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: 'rgba(160,200,255,0.7)', fontSize: '0.9rem' }}>
            {mitglieder.length > 0 ? `${mitglieder.length} Mitglieder` : 'Mitglieder-Galerie'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ padding: '0.5rem 1.2rem', background: 'transparent', border: '1px solid rgba(37,99,235,0.4)', color: '#60a5fa', borderRadius: 8, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}
        >
          ← Zurück
        </button>
      </div>

      {/* Mitglieder-Liste – kompakt */}
      <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: 800, margin: '0 auto' }}>
        {mitglieder.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(160,200,255,0.7)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <p style={{ fontSize: '1.1rem' }}>Noch keine Mitglieder eingetragen.</p>
            <p style={{ fontSize: '0.9rem' }}>Im Admin unter „Einstellungen → Stammdaten" Mitglieder hinzufügen.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {mitglieder.map((m, idx) => {
              const hasLink = !!(m.galerieLinkUrl || m.website)
              const linkUrl = m.galerieLinkUrl || m.website || ''
              const handleClick = () => {
                if (!hasLink) return
                const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
                window.open(url, '_blank', 'noopener,noreferrer')
              }
              return (
                <div
                  key={m.email || m.name || idx}
                  onClick={hasLink ? handleClick : undefined}
                  style={{
                    background: '#162032',
                    borderRadius: 12,
                    border: `1px solid ${hasLink ? 'rgba(37,99,235,0.3)' : 'rgba(37,99,235,0.15)'}`,
                    cursor: hasLink ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.9rem',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => { if (hasLink) (e.currentTarget as HTMLDivElement).style.background = '#1e2f47' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#162032' }}
                >
                  {/* Porträt-Kreis */}
                  <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(37,99,235,0.4)', background: 'rgba(37,99,235,0.12)' }}>
                    {m.mitgliedFotoUrl ? (
                      <img src={m.mitgliedFotoUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f0f6ff' }}>{m.name}</span>
                      {m.typ && <span style={{ color: '#60a5fa', fontSize: '0.8rem', fontWeight: 500 }}>{m.typ}</span>}
                    </div>
                    {m.bio && (
                      <p style={{ margin: '0.1rem 0 0', color: 'rgba(160,200,255,0.6)', fontSize: '0.8rem', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.bio}</p>
                    )}
                  </div>

                  {/* Werkfoto-Thumbnail */}
                  {m.imageUrl ? (
                    <div style={{ width: 52, height: 40, borderRadius: 6, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(37,99,235,0.2)' }}>
                      <img src={m.imageUrl} alt="Werk" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : null}

                  {/* Link-Pfeil */}
                  {hasLink && (
                    <span style={{ color: '#60a5fa', fontSize: '1rem', flexShrink: 0, opacity: 0.7 }}>›</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Copyright + K2 Brand */}
      <div style={{ textAlign: 'center', padding: '1.5rem 1rem 2rem', color: 'rgba(160,200,255,0.3)', fontSize: '0.78rem', borderTop: '1px solid rgba(37,99,235,0.15)', marginTop: '1rem' }}>
        <div style={{ marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.85rem', color: 'rgba(160,200,255,0.5)', letterSpacing: '0.05em' }}>
          K2 Galerie
        </div>
        <div>© {new Date().getFullYear()} {vereinsName} · Powered by K2 Galerie</div>
      </div>

      {/* Stand-Badge */}
      <div
        style={{ position: 'fixed', bottom: 8, left: 8, fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', zIndex: 50 }}
        onClick={() => { window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now() }}
        title="Tippen für Cache-Bypass"
      >
        Stand: {BUILD_LABEL}
      </div>
    </div>
  )
}

export default Vk2GalerieVorschauPage
