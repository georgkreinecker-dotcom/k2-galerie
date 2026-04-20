import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { initVk2DemoStammdatenIfEmpty, PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG, type Vk2Stammdaten, type Vk2Mitglied } from '../config/tenantConfig'
import { PROJECT_ROUTES, ENTDECKEN_ROUTE } from '../config/navigation'
import { AppVerlassenFooterLink } from '../components/AppVerlassenFooterLink'
import { getPageContentGalerie, getVk2SafeDisplayImageUrl } from '../config/pageContentGalerie'
import { getPageTexts } from '../config/pageTexts'
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

function EingangsKarte({ data, index, onClick }: { data: EingangskarteData; index: number; onClick?: () => void }) {
  const dummyGradients = [
    'linear-gradient(135deg, #e8d5c4 0%, #c8a888 100%)',
    'linear-gradient(135deg, #d8e4d0 0%, #a8c498 100%)',
  ]
  const dummyIcons = ['🖼️', '👥']
  const hasBild = !!data.imageUrl
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
      style={{
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        aspectRatio: '4/3',
        minHeight: 160,
        background: hasBild ? '#e8e2da' : dummyGradients[index % 2],
        border: '1px solid #e0d8cf',
        boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        cursor: onClick ? 'pointer' : 'default',
      }}>
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
    let raw = localStorage.getItem('k2-vk2-stammdaten')
    if (!raw) return []
    const parsed = JSON.parse(raw) as Vk2Stammdaten
    let mitglieder = Array.isArray(parsed?.mitglieder) ? parsed.mitglieder : []
    if (mitglieder.length === 0 && parsed?.verein?.name === 'Kunstverein Muster') {
      initVk2DemoStammdatenIfEmpty()
      raw = localStorage.getItem('k2-vk2-stammdaten')
      if (raw) {
        const retry = JSON.parse(raw) as Vk2Stammdaten
        mitglieder = Array.isArray(retry?.mitglieder) ? retry.mitglieder : []
      }
    }
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
  const location = useLocation()
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

  /** Nur bei echtem Direktaufruf (ohne vorherige VK2-Seite) zur Willkommensseite – nicht bei Klick von der Galerie (State) oder Referrer */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      if (new URLSearchParams(window.location.search).get('embedded') === '1') return
      const state = location.state as { fromVk2Galerie?: boolean } | null
      if (state?.fromVk2Galerie) return
      const ref = typeof document !== 'undefined' ? document.referrer : ''
      const vonVk2 = ref && (ref.includes('/projects/vk2') || ref.includes('/entdecken'))
      if (vonVk2) return
      navigate(PROJECT_ROUTES.vk2.galerie, { replace: true })
    } catch (_) {}
  }, [navigate, location.state])

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
  const welcomeImage = getVk2SafeDisplayImageUrl(pageContent.welcomeImage) || ''
  const mitgliederHeading = pageTexts?.kunstschaffendeHeading?.trim() || 'Unsere Mitglieder'

  /** Vereinsfunktion aus Vorstand/Vize/Kassier/Schriftführer ableiten */
  const getVereinsfunktion = (m: Vk2Mitglied): string | null => {
    if (!stammdaten) return null
    const n = (m.name || '').trim()
    if (!n) return null
    if (stammdaten.vorstand?.name && stammdaten.vorstand.name.trim() === n) return 'Obfrau/Obmann'
    if (stammdaten.vize?.name && stammdaten.vize.name.trim() === n) return 'Stellvertreter:in'
    if (stammdaten.kassier?.name && stammdaten.kassier.name.trim() === n) return 'Kassier:in'
    if (stammdaten.schriftfuehrer?.name && stammdaten.schriftfuehrer.name.trim() === n) return 'Schriftführer:in'
    return null
  }

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

      {/* Keine gelbe Leiste und keine Zurück-Buttons – für User verboten, zur APf zu führen (Regel: vk2-oek2-kein-zurueck-zur-apf) */}

      {/* Nav – nur Titel, keine Buttons (User sollen nicht zur APf oder K2 gelangen) */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem 1.5rem', background: 'rgba(250,248,245,0.97)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: C.textMid, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'system-ui, sans-serif' }}>
          {vereinsName} – {mitgliederHeading}
        </span>
      </nav>

      {/* Hero: Willkommensfoto (optional) */}
      {welcomeImage && (
        <div style={{ position: 'relative', width: '100%', height: 'clamp(200px, 38vh, 380px)', overflow: 'hidden' }}>
          <img src={welcomeImage} alt={vereinsName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(20,12,8,0.6) 100%)' }} />
        </div>
      )}

      {/* Hauptinhalt */}
      <div style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 5vw, 3rem)', maxWidth: 900, margin: '0 auto' }}>

        {/* Eingangskarten: erste Karte „Unsere Galerie“ → Vereinskatalog, zweite = aktuelle Seite (Mitglieder) */}
        {karten.length >= 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
            {karten.map((k, i) => (
              <EingangsKarte
                key={i}
                data={k}
                index={i}
                onClick={i === 0 ? () => navigate(PROJECT_ROUTES.vk2.katalog) : undefined}
              />
            ))}
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
              const galerieUrl = (m.lizenzGalerieUrl && m.lizenzGalerieUrl.trim()) ? m.lizenzGalerieUrl.trim() : ''
              const homepageUrl = m.galerieLinkUrl || m.website || ''
              const hasGalerie = !!galerieUrl
              const hasHomepage = !!homepageUrl && homepageUrl !== galerieUrl
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
                        {getVereinsfunktion(m) && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: C.textMid, fontFamily: 'system-ui, sans-serif', background: C.bg, padding: '0.12rem 0.5rem', borderRadius: 6, border: `1px solid ${C.border}` }}>
                            {getVereinsfunktion(m)}
                          </span>
                        )}
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
                      {hasGalerie && (
                        <button type="button" title="Zur Galerie – Werke & Preise" onClick={() => { const url = galerieUrl.startsWith('http') ? galerieUrl : `https://${galerieUrl}`; window.open(url, '_blank', 'noopener,noreferrer') }}
                          style={{ width: 32, height: 32, borderRadius: 8, background: C.accent, border: `1px solid ${C.accent}`, color: '#fff', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🖼️</button>
                      )}
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
                      {hasGalerie && (
                        <button type="button" onClick={() => { const url = galerieUrl.startsWith('http') ? galerieUrl : `https://${galerieUrl}`; window.open(url, '_blank', 'noopener,noreferrer') }}
                          style={{ alignSelf: 'flex-start', padding: '0.45rem 1rem', background: C.accent, border: 'none', borderRadius: 8, color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>
                          🖼️ Zur Galerie – alle Werke & Preise
                        </button>
                      )}
                      {hasHomepage && (
                        <button type="button" onClick={() => { const url = homepageUrl.startsWith('http') ? homepageUrl : `https://${homepageUrl}`; window.open(url, '_blank', 'noopener,noreferrer') }}
                          style={{ alignSelf: 'flex-start', padding: '0.45rem 1rem', background: C.bg, border: `1px solid ${C.border}`, color: C.accent, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui, sans-serif', borderRadius: 8 }}>
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

      {/* Einladung: Eigene Galerie mit K2 (für Mitglieder & Vorstand) */}
      <div style={{ padding: '1rem clamp(1.25rem, 5vw, 3rem)', maxWidth: 720, margin: '0 auto' }}>
        <Link
          to={ENTDECKEN_ROUTE}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '0.9rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(30, 92, 181, 0.06) 0%, rgba(30, 92, 181, 0.1) 100%)',
            border: `1px solid rgba(30, 92, 181, 0.3)`,
            borderRadius: 12,
            textDecoration: 'none',
            color: 'inherit',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <span style={{ fontSize: '1.1rem', color: C.textMid, lineHeight: 1.4 }}>
            Deine eigene Präsentation? <strong style={{ color: C.text }}>K2 Galerie entdecken</strong>
          </span>
          <span style={{ flexShrink: 0, color: C.accent, fontWeight: 600, fontSize: '0.9rem' }}>→</span>
        </Link>
      </div>

      {/* Footer – eiserne Regel: Copyright wie definiert (K2/ök2/VK2) */}
      <footer style={{ marginTop: '2rem', padding: '1.5rem clamp(1.25rem, 5vw, 3rem)', borderTop: `1px solid ${C.border}`, background: '#f2ede6', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: C.textMid, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>K2 Galerie</div>
        <div style={{ color: C.textLight, fontSize: '0.78rem', marginBottom: '0.5rem' }}>© {new Date().getFullYear()} {vereinsName} · Powered by K2 Galerie</div>
        <div style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', color: C.textMid, letterSpacing: '0.01em' }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
        <div style={{ marginTop: '0.35rem', fontSize: 'clamp(0.72rem, 1.6vw, 0.82rem)', color: C.textMid, opacity: 0.95 }}>{PRODUCT_URHEBER_ANWENDUNG}</div>
        <AppVerlassenFooterLink ziel="entdecken" accentColor={C.accent} mutedColor={C.textMid} />
      </footer>

    </div>
  )
}

export default Vk2GalerieVorschauPage
