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
    'linear-gradient(135deg, #e8d5c4 0%, #c8a888 100%)',
    'linear-gradient(135deg, #d8e4d0 0%, #a8c498 100%)',
  ]
  const dummyIcons = ['🖼️', '👥']
  const hasBild = !!data.imageUrl
  return (
    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', aspectRatio: '4/3', minHeight: 160, background: hasBild ? '#e8e2da' : dummyGradients[index % 2], border: '1px solid #e0d8cf', boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}>
      {hasBild && <img src={data.imageUrl} alt={data.titel} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
      {!hasBild && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 'clamp(2.5rem, 7vw, 4rem)', opacity: 0.35 }}>{dummyIcons[index % 2]}</span>
        </div>
      )}
      <div style={{ position: 'absolute', inset: 0, background: hasBild ? 'linear-gradient(to top, rgba(20,12,8,0.82) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' : 'linear-gradient(to top, rgba(20,12,8,0.65) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.85rem 1rem' }}>
        <div style={{ fontWeight: 700, fontSize: 'clamp(0.88rem, 2.5vw, 1rem)', color: '#fff', lineHeight: 1.2, marginBottom: '0.18rem', fontFamily: 'system-ui, sans-serif', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{data.titel}</div>
        <div style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', color: 'rgba(255,255,255,0.78)', lineHeight: 1.4, fontFamily: 'system-ui, sans-serif' }}>{data.untertitel}</div>
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
    window.addEventListener('vk2-karten-updated', reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener('vk2-stammdaten-updated', reload)
      window.removeEventListener('page-texts-updated', reload)
      window.removeEventListener('vk2-karten-updated', reload)
    }
  }, [])

  const vereinsName = stammdaten?.verein?.name || 'Vereinsplattform'
  const welcomeImage = pageContent.welcomeImage || ''
  const mitgliederHeading = pageTexts?.kunstschaffendeHeading?.trim() || 'Unsere Mitglieder'

  const C = {
    bg: '#faf8f5',
    bgCard: '#ffffff',
    text: '#1c1a18',
    textMid: '#5c5650',
    textLight: '#9a928a',
    accent: '#c0562a',
    border: '#e8e2da',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: '"Georgia", "Times New Roman", serif', overflowX: 'hidden' }}>

      {/* Nav – wie Startseite */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1.5rem', background: 'rgba(250,248,245,0.97)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <button onClick={() => navigate(PROJECT_ROUTES.vk2.galerie)} style={{ background: C.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '0.3rem 0.75rem', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', letterSpacing: '0.04em' }}>
          APf
        </button>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: C.textMid, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'system-ui, sans-serif' }}>
          {vereinsName} – {mitgliederHeading}
        </span>
        <button onClick={() => navigate(PROJECT_ROUTES.vk2.galerie)} style={{ background: 'transparent', color: C.textLight, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0.28rem 0.7rem', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>
          ← Startseite
        </button>
      </nav>

      {/* Vorschau-Banner */}
      {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('vorschau') === '1' && (
        <div style={{ background: C.accent, color: '#fff', padding: '0.5rem 1.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', fontFamily: 'system-ui, sans-serif' }}>
          <button onClick={() => navigate('/admin?context=vk2')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, padding: '0.28rem 0.8rem', color: '#fff', cursor: 'pointer', fontSize: '0.84rem' }}>
            ← Zurück zu Einstellungen
          </button>
          <span>Vorschau – hier siehst du deine gespeicherten Änderungen</span>
          <span style={{ opacity: 0 }}>–</span>
        </div>
      )}

      {/* Hero: Willkommensfoto (optional) */}
      {welcomeImage && (
        <div style={{ position: 'relative', width: '100%', height: 'clamp(200px, 38vh, 380px)', overflow: 'hidden' }}>
          <img src={welcomeImage} alt={vereinsName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(20,12,8,0.6) 100%)' }} />
        </div>
      )}

      {/* Hauptinhalt */}
      <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 5vw, 3rem)', maxWidth: 900, margin: '0 auto' }}>

        {/* Eingangskarten */}
        {karten.length >= 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
            {karten.map((k, i) => <EingangsKarte key={i} data={k} index={i} />)}
          </div>
        )}

        <h1 style={{ margin: '0 0 0.35rem', fontSize: 'clamp(1.85rem, 5vw, 3rem)', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {mitgliederHeading}
        </h1>
        <p style={{ margin: '0 0 1.5rem', color: C.textMid, fontSize: '0.95rem', fontFamily: 'system-ui, sans-serif' }}>
          {mitglieder.length > 0 ? `${mitglieder.length} Mitglieder` : 'Mitglieder-Galerie'} · {vereinsName}
        </p>

        {/* Mitglieder-Liste */}
        {mitglieder.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem', color: C.textLight, fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
            <p>Noch keine Mitglieder eingetragen.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {mitglieder.map((m, idx) => {
              const istOffen = offenIdx === idx
              const homepageUrl = m.galerieLinkUrl || m.website || ''
              const hasHomepage = !!homepageUrl
              const hasVita = !!(m.vita || m.bio)
              return (
                <div key={m.email || m.name || idx} style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${istOffen ? C.accent : C.border}`, background: C.bgCard, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition: 'all 0.15s' }}>

                  <div onClick={() => setOffenIdx(istOffen ? null : idx)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: `2px solid ${C.border}`, background: C.bg }}>
                      {m.mitgliedFotoUrl ? <img src={m.mitgliedFotoUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: C.text, fontFamily: 'system-ui, sans-serif' }}>{m.name}</span>
                        {m.typ && <span style={{ color: C.accent, fontSize: '0.82rem', fontWeight: 500, fontFamily: 'system-ui, sans-serif' }}>{m.typ}</span>}
                      </div>
                      {m.bio && <p style={{ margin: '0.1rem 0 0', color: C.textMid, fontSize: '0.82rem', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'system-ui, sans-serif' }}>{m.bio}</p>}
                    </div>
                    {m.imageUrl && (
                      <div style={{ width: 52, height: 42, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: `1px solid ${C.border}` }}>
                        <img src={m.imageUrl} alt="Werk" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      {hasHomepage && (
                        <button type="button" title="Homepage" onClick={() => { const url = homepageUrl.startsWith('http') ? homepageUrl : `https://${homepageUrl}`; window.open(url, '_blank', 'noopener,noreferrer') }}
                          style={{ width: 32, height: 32, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.accent, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌐</button>
                      )}
                      {hasVita && (
                        <button type="button" title="Vita" onClick={() => setOffenIdx(istOffen ? null : idx)}
                          style={{ width: 32, height: 32, borderRadius: 8, background: istOffen ? C.accent : C.bg, border: `1px solid ${C.accent}`, color: istOffen ? '#fff' : C.accent, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📄</button>
                      )}
                    </div>
                    <span style={{ color: C.textLight, fontSize: '0.9rem', flexShrink: 0, transition: 'transform 0.2s', transform: istOffen ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
                  </div>

                  {istOffen && (
                    <div style={{ background: C.bg, borderTop: `1px solid ${C.border}`, padding: '1rem 1.1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                      {(m.imageUrl || m.mitgliedFotoUrl) && (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          {m.imageUrl && (
                            <div style={{ flex: 1, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}`, maxHeight: 200 }}>
                              <img src={m.imageUrl} alt="Werk" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxHeight: 200 }} />
                            </div>
                          )}
                          {m.mitgliedFotoUrl && (
                            <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${C.border}`, flexShrink: 0 }}>
                              <img src={m.mitgliedFotoUrl} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                        </div>
                      )}
                      {m.vita && (
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: C.accent, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem', fontFamily: 'system-ui, sans-serif' }}>Vita</div>
                          <p style={{ margin: 0, color: C.textMid, fontSize: '0.9rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', fontFamily: 'system-ui, sans-serif' }}>{m.vita}</p>
                        </div>
                      )}
                      {!m.vita && m.bio && (
                        <p style={{ margin: 0, color: C.textMid, fontSize: '0.9rem', lineHeight: 1.65, fontFamily: 'system-ui, sans-serif' }}>{m.bio}</p>
                      )}
                      {hasHomepage && (
                        <button type="button" onClick={() => { const url = homepageUrl.startsWith('http') ? homepageUrl : `https://${homepageUrl}`; window.open(url, '_blank', 'noopener,noreferrer') }}
                          style={{ alignSelf: 'flex-start', padding: '0.45rem 1rem', background: C.accent, border: 'none', borderRadius: 8, color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>
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
      </div>

      {/* Footer */}
      <footer style={{ marginTop: '2rem', padding: '1.5rem clamp(1.25rem, 5vw, 3rem)', borderTop: `1px solid ${C.border}`, background: '#f2ede6', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: C.textMid, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>K2 Galerie</div>
        <div style={{ color: C.textLight, fontSize: '0.78rem' }}>© {new Date().getFullYear()} {vereinsName} · Powered by K2 Galerie</div>
      </footer>

      {/* Stand-Badge */}
      <div style={{ position: 'fixed', bottom: 8, left: 8, fontSize: '0.65rem', color: 'rgba(0,0,0,0.25)', cursor: 'pointer', zIndex: 50, fontFamily: 'system-ui, sans-serif' }}
        onClick={() => { window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now() }}
        title="Tippen für Cache-Bypass">
        Stand: {BUILD_LABEL}
      </div>
    </div>
  )
}

export default Vk2GalerieVorschauPage
