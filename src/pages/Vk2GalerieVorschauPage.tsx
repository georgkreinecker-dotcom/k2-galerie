import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { initVk2DemoStammdatenIfEmpty, type Vk2Stammdaten, type Vk2Mitglied } from '../config/tenantConfig'
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
  const [mitglieder, setMitglieder] = useState<Vk2Mitglied[]>(() => loadVk2Mitglieder())
  const [vereinsName, setVereinsName] = useState(() => loadVk2VereinName())

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
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            VK2 Vereinsplattform
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

      {/* Mitglieder-Raster */}
      <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', maxWidth: 1100, margin: '0 auto' }}>
        {mitglieder.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(160,200,255,0.7)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <p style={{ fontSize: '1.1rem' }}>Noch keine Mitglieder eingetragen.</p>
            <p style={{ fontSize: '0.9rem' }}>Im Admin unter „Einstellungen → Stammdaten" Mitglieder hinzufügen.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
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
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: `1px solid ${hasLink ? 'rgba(37,99,235,0.35)' : 'rgba(37,99,235,0.18)'}`,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                    cursor: hasLink ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                  onMouseEnter={(e) => { if (hasLink) { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(37,99,235,0.3)' } }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)' }}
                >
                  {/* Foto oder Platzhalter */}
                  <div style={{ width: '100%', aspectRatio: '4/3', background: 'rgba(37,99,235,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {m.mitgliedFotoUrl ? (
                      <img src={m.mitgliedFotoUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontSize: '3rem', opacity: 0.4 }}>👤</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '1rem 1.1rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f0f6ff' }}>{m.name}</h3>
                    {m.typ && <p style={{ margin: 0, color: '#60a5fa', fontSize: '0.88rem', fontWeight: 500 }}>{m.typ}</p>}
                    {m.bio && <p style={{ margin: '0.25rem 0 0', color: 'rgba(160,200,255,0.75)', fontSize: '0.85rem', lineHeight: 1.5 }}>{m.bio}</p>}
                    {hasLink && (
                      <p style={{ margin: 'auto 0 0', paddingTop: '0.5rem', fontSize: '0.82rem', color: '#60a5fa' }}>
                        Galerie ansehen →
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Vk2GalerieVorschauPage
