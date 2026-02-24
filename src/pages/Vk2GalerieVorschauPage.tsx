import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { initVk2DemoStammdatenIfEmpty, type Vk2Stammdaten, type Vk2Mitglied } from '../config/tenantConfig'
import { PROJECT_ROUTES } from '../config/navigation'
import { getPageContentGalerie } from '../config/pageContentGalerie'
import { getPageTexts } from '../config/pageTexts'
import { BUILD_LABEL } from '../buildInfo.generated'
import '../App.css'

// ─── Eingangskarten (gleiche Logik wie Vk2GaleriePage) ───────────────────────
const VK2_KARTEN_KEY = 'k2-vk2-eingangskarten'
interface EingangskarteData { titel: string; untertitel: string; imageUrl: string }
const DEFAULT_KARTEN: EingangskarteData[] = [
  { titel: 'Unsere Galerie', untertitel: 'Werke, Ausstellungen & Events – entdecke unseren Verein', imageUrl: '' },
  { titel: 'Mitglieder & Künstler:innen', untertitel: 'Leidenschaft, Können und Kreativität – lerne uns kennen', imageUrl: '' },
]
function loadEingangskarten(): EingangskarteData[] {
  try {
    const raw = localStorage.getItem(VK2_KARTEN_KEY)
    if (!raw) return DEFAULT_KARTEN
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length >= 2) return parsed
  } catch { /* ignore */ }
  return DEFAULT_KARTEN
}

function EingangsKarte({ data, index }: { data: EingangskarteData; index: number }) {
  const dummyGradients = [
    'linear-gradient(135deg, rgba(255,140,66,0.35) 0%, rgba(180,74,30,0.5) 100%)',
    'linear-gradient(135deg, rgba(251,191,36,0.25) 0%, rgba(180,100,20,0.4) 100%)',
  ]
  const hasBild = !!data.imageUrl
  return (
    <div style={{ position: 'relative', borderRadius: 'clamp(10px, 2vw, 16px)', overflow: 'hidden', aspectRatio: '3/2', minHeight: 120, background: hasBild ? '#111' : dummyGradients[index % 2], border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}>
      {hasBild && <img src={data.imageUrl} alt={data.titel} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
      {!hasBild && (
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', opacity: 0.2 }}>{index === 0 ? '🖼️' : '👥'}</span>
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(0.75rem, 2vw, 1.1rem)' }}>
        <div style={{ fontWeight: 700, fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', color: '#fff', lineHeight: 1.2, marginBottom: '0.2rem' }}>{data.titel}</div>
        <div style={{ fontSize: 'clamp(0.72rem, 1.8vw, 0.85rem)', color: 'rgba(255,255,255,0.72)', lineHeight: 1.4 }}>{data.untertitel}</div>
      </div>
    </div>
  )
}

// ─── Daten laden ─────────────────────────────────────────────────────────────
function loadVk2Mitglieder(): Vk2Mitglied[] {
  try {
    initVk2DemoStammdatenIfEmpty()
    const raw = localStorage.getItem('k2-vk2-stammdaten')
    if (!raw) return []
    const parsed = JSON.parse(raw) as Vk2Stammdaten
    const mitglieder = Array.isArray(parsed?.mitglieder) ? parsed.mitglieder : []
    return mitglieder.filter(m => m?.name && m?.oeffentlichSichtbar !== false)
  } catch { return [] }
}
function loadVk2Stammdaten(): Vk2Stammdaten | null {
  try {
    initVk2DemoStammdatenIfEmpty()
    const raw = localStorage.getItem('k2-vk2-stammdaten')
    if (!raw) return null
    return JSON.parse(raw) as Vk2Stammdaten
  } catch { return null }
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────
const Vk2GalerieVorschauPage: React.FC = () => {
  const navigate = useNavigate()
  const [mitglieder, setMitglieder] = useState<Vk2Mitglied[]>([])
  const [stammdaten, setStammdaten] = useState<Vk2Stammdaten | null>(null)
  const [pageContent, setPageContent] = useState(() => getPageContentGalerie('vk2'))
  const [pageTexts, setPageTexts] = useState(() => getPageTexts('vk2').galerie)
  const [karten, setKarten] = useState<EingangskarteData[]>([])
  const [offenIdx, setOffenIdx] = useState<number | null>(null)

  useEffect(() => {
    setMitglieder(loadVk2Mitglieder())
    setStammdaten(loadVk2Stammdaten())
    setPageContent(getPageContentGalerie('vk2'))
    setPageTexts(getPageTexts('vk2').galerie)
    setKarten(loadEingangskarten())
  }, [])

  useEffect(() => {
    const reload = () => {
      setMitglieder(loadVk2Mitglieder())
      setStammdaten(loadVk2Stammdaten())
      setPageContent(getPageContentGalerie('vk2'))
      setPageTexts(getPageTexts('vk2').galerie)
      setKarten(loadEingangskarten())
    }
    window.addEventListener('storage', reload)
    window.addEventListener('vk2-stammdaten-updated', reload)
    window.addEventListener('page-texts-updated', reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener('vk2-stammdaten-updated', reload)
      window.removeEventListener('page-texts-updated', reload)
    }
  }, [])

  const vereinsName = stammdaten?.verein?.name || 'Vereinsplattform'
  const welcomeImage = pageContent.welcomeImage || ''
  const mitgliederHeading = pageTexts?.kunstschaffendeHeading?.trim() || 'Unsere Mitglieder'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1a14 50%, #3d2419 100%)', color: '#fff5f0', fontFamily: 'system-ui, -apple-system, sans-serif', overflowX: 'hidden' }}>

      {/* Obere Leiste – gleich wie Startseite */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem', background: 'rgba(26,15,10,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,140,66,0.2)' }}>
        <button onClick={() => navigate(PROJECT_ROUTES.vk2.galerie)} style={{ background: '#ff8c42', color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.7rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
          APf
        </button>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,140,66,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {vereinsName} – {mitgliederHeading}
        </span>
        <button onClick={() => navigate(PROJECT_ROUTES.vk2.galerie)} style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '0.25rem 0.6rem', fontSize: '0.78rem', cursor: 'pointer' }}>
          ← Startseite
        </button>
      </div>

      {/* Vorschau-Banner */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('vorschau') === '1' && (
        <div style={{ background: '#b54a1e', color: '#fff', padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/admin?context=vk2')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, padding: '0.3rem 0.8rem', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
            ← Zurück zu Einstellungen
          </button>
          <span>Vorschau – hier siehst du deine gespeicherten Änderungen</span>
          <span style={{ opacity: 0 }}>–</span>
        </div>
      )}

      {/* Hauptinhalt */}
      <header style={{ padding: 'clamp(2rem, 6vw, 3.5rem) clamp(1.5rem, 4vw, 3rem)', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Willkommensfoto */}
        {welcomeImage && (
          <div style={{ width: '100%', marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            <img src={welcomeImage} alt={vereinsName} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        )}

        {/* Eingangskarten */}
        {karten.length >= 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(0.75rem, 2vw, 1.25rem)', marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            {karten.map((k, i) => <EingangsKarte key={i} data={k} index={i} />)}
          </div>
        )}

        {/* Heading */}
        <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          {mitgliederHeading}
        </h1>
        <p style={{ margin: '0.5rem 0 clamp(1.5rem, 4vw, 2.5rem)', color: 'rgba(255,255,255,0.65)', fontSize: '1rem', fontWeight: 300 }}>
          {mitglieder.length > 0 ? `${mitglieder.length} Mitglieder` : 'Mitglieder-Galerie'} · {vereinsName}
        </p>

        {/* Mitglieder-Liste */}
        {mitglieder.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
            <p>Noch keine Mitglieder eingetragen.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mitglieder.map((m, idx) => {
              const istOffen = offenIdx === idx
              const homepageUrl = m.galerieLinkUrl || m.website || ''
              const hasHomepage = !!homepageUrl
              const hasVita = !!(m.vita || m.bio)
              return (
                <div key={m.email || m.name || idx} style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${istOffen ? 'rgba(255,140,66,0.5)' : 'rgba(255,140,66,0.2)'}`, background: istOffen ? 'rgba(255,140,66,0.08)' : 'rgba(255,255,255,0.04)', transition: 'all 0.15s' }}>

                  {/* Zeile */}
                  <div onClick={() => setOffenIdx(istOffen ? null : idx)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer' }}>
                    {/* Porträt */}
                    <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,140,66,0.4)', background: 'rgba(255,140,66,0.12)' }}>
                      {m.mitgliedFotoUrl
                        ? <img src={m.mitgliedFotoUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>👤</div>
                      }
                    </div>

                    {/* Name + Typ + Bio */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff5f0' }}>{m.name}</span>
                        {m.typ && <span style={{ color: 'rgba(255,140,66,0.8)', fontSize: '0.82rem', fontWeight: 500 }}>{m.typ}</span>}
                      </div>
                      {m.bio && <p style={{ margin: '0.1rem 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.bio}</p>}
                    </div>

                    {/* Werkfoto-Thumbnail */}
                    {m.imageUrl && (
                      <div style={{ width: 52, height: 42, borderRadius: 7, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,140,66,0.25)' }}>
                        <img src={m.imageUrl} alt="Werk" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}

                    {/* Icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      {hasHomepage && (
                        <button type="button" title="Homepage" onClick={() => { const url = homepageUrl.startsWith('http') ? homepageUrl : `https://${homepageUrl}`; window.open(url, '_blank', 'noopener,noreferrer') }}
                          style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,140,66,0.12)', border: '1px solid rgba(255,140,66,0.3)', color: '#ff8c42', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌐</button>
                      )}
                      {hasVita && (
                        <button type="button" title="Vita" onClick={() => setOffenIdx(istOffen ? null : idx)}
                          style={{ width: 32, height: 32, borderRadius: 8, background: istOffen ? 'rgba(255,140,66,0.3)' : 'rgba(255,140,66,0.12)', border: '1px solid rgba(255,140,66,0.3)', color: '#ff8c42', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</button>
                      )}
                    </div>
                    <span style={{ color: '#ff8c42', fontSize: '0.85rem', opacity: 0.6, flexShrink: 0, transition: 'transform 0.2s', transform: istOffen ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
                  </div>

                  {/* Detail aufgeklappt */}
                  {istOffen && (
                    <div style={{ background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,140,66,0.15)', padding: '1rem 1.1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                      {(m.imageUrl || m.mitgliedFotoUrl) && (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          {m.imageUrl && (
                            <div style={{ flex: 1, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,140,66,0.2)', maxHeight: 200 }}>
                              <img src={m.imageUrl} alt="Werk" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxHeight: 200 }} />
                            </div>
                          )}
                          {m.mitgliedFotoUrl && (
                            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,140,66,0.4)', flexShrink: 0 }}>
                              <img src={m.mitgliedFotoUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>
                      )}
                      {m.vita && (
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,140,66,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Vita</div>
                          <p style={{ margin: 0, color: 'rgba(255,245,240,0.85)', fontSize: '0.9rem', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{m.vita}</p>
                        </div>
                      )}
                      {!m.vita && m.bio && (
                        <p style={{ margin: 0, color: 'rgba(255,245,240,0.85)', fontSize: '0.9rem', lineHeight: 1.65 }}>{m.bio}</p>
                      )}
                      {hasHomepage && (
                        <button type="button" onClick={() => { const url = homepageUrl.startsWith('http') ? homepageUrl : `https://${homepageUrl}`; window.open(url, '_blank', 'noopener,noreferrer') }}
                          style={{ alignSelf: 'flex-start', padding: '0.45rem 1rem', background: 'rgba(255,140,66,0.15)', border: '1px solid rgba(255,140,66,0.4)', borderRadius: 8, color: '#ff8c42', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                          🌐 Homepage besuchen
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </header>

      {/* Footer */}
      <footer style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderTop: '1px solid rgba(255,255,255,0.08)', maxWidth: '1200px', margin: '2rem auto 0', textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em', marginBottom: '0.3rem' }}>K2 Galerie</div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>© {new Date().getFullYear()} {vereinsName} · Powered by K2 Galerie</div>
      </footer>

      {/* Stand-Badge */}
      <div style={{ position: 'fixed', bottom: 8, left: 8, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', zIndex: 50 }}
        onClick={() => { window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now() }}
        title="Tippen für Cache-Bypass">
        Stand: {BUILD_LABEL}
      </div>
    </div>
  )
}

export default Vk2GalerieVorschauPage
