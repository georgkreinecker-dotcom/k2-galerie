import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES, BASE_APP_URL, ENTDECKEN_ROUTE, flyerEventBogenUrl } from '../config/navigation'
import { getPublicGalerieUrl } from '../utils/publicLinks'
import {
  initVk2DemoStammdatenIfEmpty,
  isPlatformInstance,
  PRODUCT_BRAND_NAME,
  PRODUCT_COPYRIGHT_BRAND_ONLY,
  PRODUCT_URHEBER_ANWENDUNG,
  type Vk2Stammdaten,
} from '../config/tenantConfig'
import { getPageTexts } from '../config/pageTexts'
import { loadEvents } from '../utils/eventsStorage'
import { getPageContentGalerie, getVk2SafeDisplayImageUrl } from '../config/pageContentGalerie'
import { GalerieSocialLinks } from '../components/GalerieSocialLinks'
import { AppVerlassenFooterLink } from '../components/AppVerlassenFooterLink'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import { isAdminUnlocked } from '../utils/adminUnlockStorage'
import { formatEventTerminKomplett } from '../utils/eventTerminFormat'
import { eventPlakatMoreInfoTitle } from '../utils/eventPlakatTooltip'
import { reportPublicGalleryVisit } from '../utils/reportPublicGalleryVisit'
import { reportMarketingAttributionLanding } from '../utils/marketingAttribution'
import { resolveVk2PublicGalleryVisitTenantId } from '../utils/publicGalleryVisitTenant'
import { openVk2PlatformRundgangGlobally } from '../utils/vk2PlatformLeitfadenStorage'
import { PublicTeilenFixed } from '../components/PublicTeilenFixed'
import { K2WorldMobileNavSheet } from '../components/K2WorldMobileNavSheet'
import { useK2WorldMobileCompact } from '../hooks/useK2WorldMobileCompact'
import { useK2WorldMobileNavSheet } from '../hooks/useK2WorldMobileNavSheet'
import { getVk2StammdatenKey } from '../utils/stammdatenStorage'
import { pilotScopeVk2Key } from '../utils/vk2StorageKeys'
import '../App.css'

function normalizeSocialUrl(value?: string): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

// Lädt VK2-Stammdaten aus localStorage – NUR eigener Key, keine K2/ök2-Daten
function loadVk2Stammdaten(): Vk2Stammdaten | null {
  try {
    initVk2DemoStammdatenIfEmpty()
    const raw = localStorage.getItem(getVk2StammdatenKey())
    if (!raw) return null
    return JSON.parse(raw) as Vk2Stammdaten
  } catch {
    return null
  }
}

// Lädt VK2-Seitentexte – NUR eigener Key
function loadVk2PageTexts() {
  return getPageTexts('vk2').galerie
}

// Lädt VK2-Seiteninhalt (Foto) – NUR eigener Key
function loadVk2PageContent() {
  return getPageContentGalerie('vk2')
}

// Lädt VK2-Events – NUR eigener Key (Phase 1.4: über Schicht)
function loadVk2Events(): any[] {
  return loadEvents('vk2')
}

const VK2_VERCEL_BASE = BASE_APP_URL

const Vk2GaleriePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isVk2VorschauUrl = useMemo(
    () => new URLSearchParams(location.search).get('vorschau') === '1',
    [location.search],
  )
  /**
   * Nur Plattform; ohne `?vorschau=1` (explizite Vorschau-URL).
   * Auch bei Aufruf vom Admin: Rundgang = nur Guide, kein Zusatzrisiko – Georg soll den Button immer sehen können.
   */
  const showVk2LeitfadenUi = isPlatformInstance() && !isVk2VorschauUrl
  const [plakatOverlayUrl, setPlakatOverlayUrl] = useState<string | null>(null)
  const openVk2EventA3Plakat = useCallback((eventId: unknown) => {
    const eid = eventId != null && String(eventId).trim() !== '' ? String(eventId).trim() : ''
    if (!eid) {
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Für diesen Termin ist keine Plakat-Ansicht verfügbar (Event ohne Kennung). Bitte im Admin das Event speichern.')
      }
      return
    }
    const url = flyerEventBogenUrl({ mode: 'a3', tenant: 'vk2', eventId: eid, fromPublicGalerie: true })
    setPlakatOverlayUrl(url)
  }, [])

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'k2-close-public-plakat-overlay') setPlakatOverlayUrl(null)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  useEffect(() => {
    if (!plakatOverlayUrl) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    try {
      document.body.setAttribute('data-k2-plakat-overlay', '1')
    } catch {
      /* ignore */
    }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setPlakatOverlayUrl(null)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      try {
        document.body.removeAttribute('data-k2-plakat-overlay')
      } catch {
        /* ignore */
      }
      window.removeEventListener('keydown', onKey)
    }
  }, [plakatOverlayUrl])

  const [stammdaten, setStammdaten] = useState<Vk2Stammdaten | null>(() => loadVk2Stammdaten())
  const [pageTexts, setPageTexts] = useState(() => loadVk2PageTexts())
  const [pageContent, setPageContent] = useState(() => loadVk2PageContent())
  const [events, setEvents] = useState<any[]>(() => loadVk2Events())
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()
  const vk2CompactNav = useK2WorldMobileCompact()
  const vk2NavSheet = useK2WorldMobileNavSheet(location.pathname, location.search)
  const vk2NavFromAdmin = !!(location.state as { fromAdminTab?: string } | null)?.fromAdminTab
  const vk2PwaStandalone =
    typeof window !== 'undefined' &&
    ((typeof navigator !== 'undefined' && (navigator as { standalone?: boolean }).standalone === true) ||
      (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches))
  const vk2ShowAdminEntry = vk2NavFromAdmin || isAdminUnlocked() || vk2PwaStandalone

  // Neu laden wenn localStorage sich ändert (z.B. nach Admin-Speicherung)
  useEffect(() => {
    const reload = () => {
      setStammdaten(loadVk2Stammdaten())
      setPageTexts(loadVk2PageTexts())
      setPageContent(loadVk2PageContent())
      setEvents(loadVk2Events())
    }
    window.addEventListener('storage', reload)
    window.addEventListener('vk2-stammdaten-updated', reload)
    window.addEventListener('page-texts-updated', reload)
    window.addEventListener('k2-page-content-updated', reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener('vk2-stammdaten-updated', reload)
      window.removeEventListener('page-texts-updated', reload)
      window.removeEventListener('k2-page-content-updated', reload)
    }
  }, [])

  // ?vk2Pilot= wechselt Mandanten-Key – State neu laden ohne Seitenwechsel
  useEffect(() => {
    setStammdaten(loadVk2Stammdaten())
    setPageTexts(loadVk2PageTexts())
    setPageContent(loadVk2PageContent())
    setEvents(loadVk2Events())
  }, [location.search])

  // Besucherzähler VK2: ein Mandant = ein Zähler (Pilot → vk2-pilot-{id}, sonst vk2)
  useEffect(() => {
    const tenant = resolveVk2PublicGalleryVisitTenantId()
    const skipVorschau = () => new URLSearchParams(window.location.search).get('vorschau') === '1'
    reportPublicGalleryVisit({
      tenant,
      sessionKey: 'k2-visit-sent-' + tenant,
      skip: skipVorschau,
    })
    reportMarketingAttributionLanding({
      surface: 'vk2',
      tenantVisitKey: tenant,
      sessionDedupeKey: `vk2-${tenant}`,
      search: location.search,
      skip: skipVorschau,
    })
  }, [location.search])

  // QR-Code auf Mitglieder-Seite (Vercel, mit Cache-Bust)
  useEffect(() => {
    let cancelled = false
    const mitgliederUrl = VK2_VERCEL_BASE + PROJECT_ROUTES.vk2.galerieVorschau
    const qrUrl = buildQrUrlWithBust(mitgliederUrl, qrVersionTs)
    QRCode.toDataURL(qrUrl, { width: 120, margin: 1 })
      .then((url) => { if (!cancelled) setQrDataUrl(url) })
      .catch(() => { if (!cancelled) setQrDataUrl('') })
    return () => { cancelled = true }
  }, [qrVersionTs])

  // Titel: aus Seitentexten → Vereinsname → Fallback
  const vereinsName = stammdaten?.verein?.name || 'Vereinsplattform'
  const heroTitle = pageTexts.heroTitle?.trim() || vereinsName
  const subtext = pageTexts.welcomeSubtext?.trim() || stammdaten?.verein?.name || 'Kunstverein'
  const introText = pageTexts.welcomeIntroText?.trim() || 'Die Mitglieder unseres Vereins – Künstler:innen mit Leidenschaft und Können.'
  const eventHeading = pageTexts.eventSectionHeading?.trim() || 'Vereinstermine & Events'
  const welcomeImage = getVk2SafeDisplayImageUrl(pageContent.welcomeImage) || ''
  const galleryEntered = useMemo(
    () => new URLSearchParams(location.search).get('enter') === 'gallery',
    [location.search],
  )
  const vk2GalleryEntryUrl = useMemo(() => {
    const params = new URLSearchParams(location.search)
    params.set('enter', 'gallery')
    return `${PROJECT_ROUTES.vk2.galerie}?${params.toString()}#werke-auswahl`
  }, [location.search])
  const vereinsWerke = useMemo(() => {
    const members = Array.isArray(stammdaten?.mitglieder) ? stammdaten!.mitglieder : []
    return members
      .map((m: any, idx: number) => ({
        id: String(m?.id || `mitglied-${idx}`),
        title: String(m?.name || m?.titel || `Mitglied ${idx + 1}`),
        imageUrl: String(m?.mitgliedFotoUrl || m?.imageUrl || '').trim(),
        role: String(m?.rolle || m?.funktion || '').trim(),
      }))
      .filter((item) => item.title || item.imageUrl)
  }, [stammdaten])
  const [selectedVereinsWerkIdx, setSelectedVereinsWerkIdx] = useState(0)
  const safeVereinsWerkIdx = Math.max(0, Math.min(selectedVereinsWerkIdx, Math.max(vereinsWerke.length - 1, 0)))
  const selectedVereinsWerk = vereinsWerke[safeVereinsWerkIdx] || null

  const socialLinksResolved = useMemo(() => {
    const pc = pageContent
    const v = stammdaten?.verein
    const pick = (stam: string | undefined, fallback: string | undefined) =>
      normalizeSocialUrl((typeof stam === 'string' && stam.trim() !== '' ? stam.trim() : undefined) ?? fallback)
    return {
      youtubeUrl: pick(v?.socialYoutubeUrl, pc.socialYoutubeUrl),
      instagramUrl: pick(v?.socialInstagramUrl, pc.socialInstagramUrl),
      featuredVideoUrl: pick(v?.socialFeaturedVideoUrl, pc.socialFeaturedVideoUrl),
    }
  }, [stammdaten, pageContent])
  const hasSocialLinks = Boolean(
    socialLinksResolved.youtubeUrl || socialLinksResolved.instagramUrl || socialLinksResolved.featuredVideoUrl
  )

  // Events: nur zukünftige
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const upcomingEvents = events.filter(ev => {
    if (!ev.date) return false
    try { return new Date(ev.date) >= today } catch { return false }
  }).slice(0, 3)

  // Farben – warmes helles Design
  const C = {
    bg: '#faf8f5',
    bgCard: '#ffffff',
    text: '#1c1a18',
    textMid: '#5c5650',
    textLight: '#9a928a',
    accent: '#c0562a',
    accentHover: '#a04520',
    accentSoft: '#f0e8e2',
    gold: '#a07828',
    goldBg: '#fdf6e8',
    border: '#e8e2da',
    heroOverlay: 'linear-gradient(to bottom, rgba(0,0,0,0.0) 0%, rgba(20,12,8,0.65) 70%, rgba(20,12,8,0.95) 100%)',
  }
  const TEMPLATE = {
    maxWidth: 1000,
    cardBg: '#fff',
    cardBorder: `1px solid ${C.border}`,
    cardRadius: 14,
    cardPadding: '1rem',
    chipBg: '#fffefb',
    chipBorder: `1px solid ${C.border}`,
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      color: C.text,
      fontFamily: '"Georgia", "Times New Roman", serif',
      position: 'relative',
      overflowX: 'hidden',
    }}>

      {/* Keine gelbe Leiste mit „Zurück zu Einstellungen“ – für User verboten, zur APf zu führen */}

      {/* Nav: kein „Zurück“ zur APf (Georg 03.04.26). „Admin“ nur wenn Aufruf vom Admin oder Unlock – Zugang wiederherstellbar. Handy: eine Zeile + Menü-Sheet (K2-Welt-Standard). */}
      {vk2CompactNav ? (
        <>
          <nav
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 100,
              display: 'flex',
              flexWrap: 'nowrap',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1rem',
              paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
              paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
              paddingTop: 'max(0.45rem, env(safe-area-inset-top))',
              background: 'rgba(250,248,245,0.97)',
              backdropFilter: 'blur(12px)',
              borderBottom: `1px solid ${C.border}`,
              boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
            }}
          >
            <span
              style={{
                flex: '1 1 auto',
                minWidth: 0,
                fontSize: '0.9rem',
                fontWeight: 700,
                color: C.text,
                fontFamily: 'system-ui, sans-serif',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={vereinsName}
            >
              {vereinsName}
            </span>
            <button
              type="button"
              aria-expanded={vk2NavSheet.menuOpen}
              aria-controls="vk2-galerie-nav-mobile-sheet"
              onClick={() => vk2NavSheet.setMenuOpen((o) => !o)}
              style={{
                flexShrink: 0,
                minHeight: 44,
                padding: '0.5rem 0.85rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                fontFamily: 'system-ui, sans-serif',
                borderRadius: 999,
                border: `1px solid rgba(192, 86, 42, 0.35)`,
                background: vk2NavSheet.menuOpen ? C.accent : '#fffefb',
                color: vk2NavSheet.menuOpen ? '#fff' : C.accent,
                cursor: 'pointer',
              }}
            >
              Menü
            </button>
          </nav>
          <K2WorldMobileNavSheet
            open={vk2NavSheet.menuOpen}
            onClose={vk2NavSheet.closeMenu}
            title="Vereinsseite"
            panelId="vk2-galerie-nav-mobile-sheet"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {showVk2LeitfadenUi ? (
                <button
                  type="button"
                  onClick={() => {
                    vk2NavSheet.closeMenu()
                    openVk2PlatformRundgangGlobally()
                  }}
                  style={{
                    minHeight: 44,
                    width: '100%',
                    background: 'rgba(192, 86, 42, 0.1)',
                    color: C.accent,
                    border: `1px solid rgba(192, 86, 42, 0.35)`,
                    borderRadius: 8,
                    padding: '0.65rem 1rem',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontFamily: 'system-ui, sans-serif',
                  }}
                  title="Geführter Rundgang durch die Beispiel-Seite"
                >
                  Rundgang
                </button>
              ) : null}
              <div style={{ width: '100%' }}>
                <PublicTeilenFixed
                  layout="inline"
                  variant="vk2"
                  displayName={vereinsName}
                  canonicalPublicUrl={getPublicGalerieUrl('vk2', 'galerie')}
                  getShareText={() => `${vereinsName} – Vereinsgalerie zum Ausprobieren`}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  vk2NavSheet.closeMenu()
                  navigate(PROJECT_ROUTES.vk2.mitgliedLogin)
                }}
                style={{
                  minHeight: 44,
                  width: '100%',
                  background: '#f0f4ff',
                  color: '#3b5bdb',
                  border: '1px solid #c5d0fa',
                  borderRadius: 8,
                  padding: '0.65rem 1rem',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontFamily: 'system-ui, sans-serif',
                }}
                title="Mitglied-Login"
              >
                🔑 Mitglied
              </button>
              {vk2ShowAdminEntry ? (
                <button
                  type="button"
                  onClick={() => {
                    vk2NavSheet.closeMenu()
                    navigate('/mein-bereich?context=vk2')
                  }}
                  style={{
                    minHeight: 44,
                    width: '100%',
                    background: 'transparent',
                    color: C.textLight,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: '0.65rem 1rem',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    fontFamily: 'system-ui, sans-serif',
                  }}
                >
                  Admin
                </button>
              ) : null}
            </div>
          </K2WorldMobileNavSheet>
        </>
      ) : (
        <nav
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.6rem 1.5rem',
            background: 'rgba(250,248,245,0.97)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${C.border}`,
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ width: '4rem', flexShrink: 0 }} aria-hidden />
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: C.textMid,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {vereinsName}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {showVk2LeitfadenUi ? (
              <button
                type="button"
                onClick={() => openVk2PlatformRundgangGlobally()}
                style={{
                  background: 'rgba(192, 86, 42, 0.1)',
                  color: C.accent,
                  border: `1px solid rgba(192, 86, 42, 0.35)`,
                  borderRadius: 8,
                  padding: '0.28rem 0.65rem',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontFamily: 'system-ui, sans-serif',
                }}
                title="Geführter Rundgang durch die Beispiel-Seite"
              >
                Rundgang
              </button>
            ) : null}
            <PublicTeilenFixed
              layout="inline"
              variant="vk2"
              displayName={vereinsName}
              canonicalPublicUrl={getPublicGalerieUrl('vk2', 'galerie')}
              getShareText={() => `${vereinsName} – Vereinsgalerie zum Ausprobieren`}
            />
            <button
              type="button"
              onClick={() => navigate(PROJECT_ROUTES.vk2.mitgliedLogin)}
              style={{
                background: '#f0f4ff',
                color: '#3b5bdb',
                border: '1px solid #c5d0fa',
                borderRadius: 8,
                padding: '0.28rem 0.7rem',
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontFamily: 'system-ui, sans-serif',
              }}
              title="Mitglied-Login"
            >
              🔑 Mitglied
            </button>
            {vk2ShowAdminEntry ? (
              <button
                type="button"
                onClick={() => navigate('/mein-bereich?context=vk2')}
                style={{
                  background: 'transparent',
                  color: C.textLight,
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  padding: '0.28rem 0.7rem',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                Admin
              </button>
            ) : null}
          </div>
        </nav>
      )}

      {/* VK2 Willkommens-Banner – Admin ohne globalen Guide (Guide abgeschaltet 20.03.26) */}
      {(() => {
        const showVorschau = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('vorschau') !== '1'
        if (!showVorschau) return null
        const handleAdminKlick = () => {
          navigate('/mein-bereich?context=vk2&vorname=Verein&pfad=gemeinschaft')
        }
        return (
          <div
            {...(showVk2LeitfadenUi ? { 'data-leitfaden-focus': 'admin-hinweis' as const } : {})}
            style={{
            margin: 'clamp(0.75rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem)',
            padding: 'clamp(0.65rem, 1.5vw, 0.9rem) clamp(1rem, 2.5vw, 1.25rem)',
            background: 'rgba(30, 92, 181, 0.08)',
            border: '1px solid rgba(30, 92, 181, 0.35)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
          >
            <span style={{ color: C.text, fontSize: 'clamp(0.88rem, 2vw, 0.98rem)', lineHeight: 1.45, flex: '1 1 260px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
              So könnte eure Vereinsgalerie aussehen. Schau dich um.
              <button
                type="button"
                onClick={handleAdminKlick}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  background: 'transparent',
                  color: '#1e5cb5',
                  border: '1px solid rgba(30, 92, 181, 0.5)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: 'inherit',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                title="In den Admin-Bereich"
              >
                ⚙️ In den Admin
              </button>
            </span>
            <button
              type="button"
              onClick={handleAdminKlick}
              style={{
                padding: '0.5rem 1rem',
                background: '#1e5cb5',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Mit mir in den Admin →
            </button>
          </div>
        )
      })()}

      {/* ── HERO: Foto mit Titel-Overlay ── */}
      <div
        id="start"
        {...(showVk2LeitfadenUi ? { 'data-leitfaden-focus': 'willkommen' as const } : {})}
        style={{ position: 'relative', width: '100%', height: 'clamp(320px, 52vh, 540px)', overflow: 'hidden' }}
      >
        {welcomeImage ? (
          <img src={welcomeImage} alt={heroTitle} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #c8b89a 0%, #a89278 50%, #887258 100%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: C.heroOverlay }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 5vw, 3rem)' }}>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.78rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,230,180,0.85)', fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>
            {subtext}
          </p>
          <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 6vw, 3.8rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.08, textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
            {heroTitle}
          </h1>
        </div>
      </div>

      {/* Homepage-Navigation wie Muster: klare Abschnitte */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.55rem',
          padding: '0.85rem 1rem 0.45rem',
          background: C.bg,
        }}
      >
        {[
          { href: '#willkommen', label: 'Willkommen' },
          { href: '#rundgang', label: 'Rundgang' },
          { href: '#werke', label: 'Bereiche' },
          { href: '#events', label: 'Events' },
          { href: '#admin', label: 'Admin' },
          { href: '#impressum', label: 'Impressum' },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              textDecoration: 'none',
              border: TEMPLATE.chipBorder,
              background: TEMPLATE.chipBg,
              color: C.textMid,
              borderRadius: 999,
              padding: '0.34rem 0.74rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* ── EINGANGSKARTEN ── */}
      <div
        id="werke"
        {...(showVk2LeitfadenUi ? { 'data-leitfaden-focus': 'eingangskarten' as const } : {})}
        style={{ padding: '1.2rem clamp(1.25rem, 5vw, 3rem)', background: C.bg }}
      >
        <div id="bereiche" style={{ maxWidth: TEMPLATE.maxWidth, margin: '0 auto', background: TEMPLATE.cardBg, border: TEMPLATE.cardBorder, borderRadius: TEMPLATE.cardRadius, padding: TEMPLATE.cardPadding }}>
          <Vk2Eingangskarten key={location.search} stammdaten={stammdaten} welcomeImage={welcomeImage} galleryEntryUrl={vk2GalleryEntryUrl} />
        </div>
      </div>

      {/* ── TRENNLINIE ── */}
      <div style={{ height: 1, background: C.border, margin: '0 clamp(1.25rem, 5vw, 3rem)' }} />

      {/* Kurzer Intro-Text – Einstieg nur über die Karten (ein Klick pro Ziel) */}
      <div
        id="willkommen"
        {...(showVk2LeitfadenUi ? { 'data-leitfaden-focus': 'gemeinschaft' as const } : {})}
        style={{ padding: '0 clamp(1.25rem, 5vw, 3rem)' }}
      >
        <div style={{ maxWidth: TEMPLATE.maxWidth, margin: '0 auto', background: TEMPLATE.cardBg, border: TEMPLATE.cardBorder, borderRadius: TEMPLATE.cardRadius, padding: TEMPLATE.cardPadding }}>
          <p style={{ margin: 0, color: C.textMid, fontSize: '1.05rem', lineHeight: 1.75, fontWeight: 400 }}>
            {introText}
          </p>
          <div style={{ marginTop: '1rem', padding: '0.9rem 1rem', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <p style={{ margin: '0 0 0.45rem', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textLight, fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}>
            Social Media
          </p>
          <GalerieSocialLinks
            youtubeUrl={socialLinksResolved.youtubeUrl}
            instagramUrl={socialLinksResolved.instagramUrl}
            featuredVideoUrl={socialLinksResolved.featuredVideoUrl}
            variant="vk2Warm"
          />
          {!hasSocialLinks && (
            <p style={{ margin: '0.35rem 0 0', color: C.textMid, fontSize: '0.9rem', lineHeight: 1.5, fontFamily: 'system-ui, sans-serif' }}>
              Noch keine Social-Links hinterlegt. Im Admin unter <strong>Einstellungen → Stammdaten</strong> YouTube, Instagram oder Highlight-Video eintragen.
            </p>
          )}
          </div>
        </div>
      </div>

      {galleryEntered ? (
        <section id="werke-auswahl" style={{ padding: '0 clamp(1.25rem, 5vw, 3rem) 1.4rem' }}>
          <div style={{ maxWidth: TEMPLATE.maxWidth, margin: '0 auto', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1rem 1.05rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: C.text, fontFamily: 'system-ui, sans-serif' }}>Vereinsgalerie - Auswahl</h3>
              <Link to={PROJECT_ROUTES.vk2.galerie} style={{ textDecoration: 'none', border: `1px solid ${C.border}`, borderRadius: 999, padding: '0.35rem 0.75rem', color: C.textMid, background: '#fff', fontSize: '0.82rem', fontFamily: 'system-ui, sans-serif' }}>
                ← Zur Startseite
              </Link>
            </div>
            <p style={{ margin: '0 0 0.8rem', color: C.textMid, fontSize: '0.9rem', fontFamily: 'system-ui, sans-serif' }}>
              Werke und Profile aus unserer Vereinsvielfalt - waehle ein Motiv und entdecke die Details.
            </p>
            {vereinsWerke.length > 0 ? (
              <>
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: '0.8rem', background: '#f6f1ea' }}>
                  {selectedVereinsWerk?.imageUrl ? (
                    <img src={selectedVereinsWerk.imageUrl} alt={selectedVereinsWerk.title} style={{ width: '100%', maxHeight: 520, objectFit: 'contain', display: 'block' }} />
                  ) : (
                    <div style={{ minHeight: 220, display: 'grid', placeItems: 'center', color: C.textLight, fontFamily: 'system-ui, sans-serif' }}>Kein Bild</div>
                  )}
                  <div style={{ padding: '0.65rem 0.8rem', background: '#fff' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: C.text, fontFamily: 'system-ui, sans-serif' }}>{selectedVereinsWerk?.title || 'Mitglied'}</div>
                    {selectedVereinsWerk?.role ? <div style={{ marginTop: '0.2rem', fontSize: '0.82rem', color: C.textMid, fontFamily: 'system-ui, sans-serif' }}>{selectedVereinsWerk.role}</div> : null}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.55rem' }}>
                  {vereinsWerke.slice(0, 24).map((w, idx) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setSelectedVereinsWerkIdx(idx)}
                      style={{
                        border: safeVereinsWerkIdx === idx ? `2px solid ${C.accent}` : `1px solid ${C.border}`,
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: '#fff',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left',
                      }}
                    >
                      {w.imageUrl ? (
                        <img src={w.imageUrl} alt={w.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <div style={{ width: '100%', aspectRatio: '1/1', display: 'grid', placeItems: 'center', color: C.textLight, fontSize: '0.74rem', fontFamily: 'system-ui, sans-serif' }}>Kein Bild</div>
                      )}
                      <div style={{ padding: '0.35rem 0.45rem', fontSize: '0.76rem', color: C.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'system-ui, sans-serif' }}>{w.title}</div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ minHeight: 120, border: `1px solid ${C.border}`, borderRadius: 10, display: 'grid', placeItems: 'center', color: C.textMid, fontFamily: 'system-ui, sans-serif' }}>
                Noch keine Vereinsmotive vorhanden.
              </div>
            )}
          </div>
        </section>
      ) : null}

      {/* ── EVENTS ── */}
      {upcomingEvents.length > 0 && (
        <div id="rundgang" style={{ padding: '0 clamp(1.25rem, 5vw, 3rem) 1.4rem' }}>
          <div id="events" style={{ maxWidth: TEMPLATE.maxWidth, margin: '0 auto' }}>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '1.1rem 1.15rem', borderLeft: `4px solid ${C.accent}`, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.textLight, fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}>
                {eventHeading}
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', color: C.text, fontSize: '0.95rem', lineHeight: 1.7, fontFamily: 'system-ui, sans-serif' }}>
                {upcomingEvents.map((ev: any) => (
                  <li key={ev.id || ev.date} style={{ marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => openVk2EventA3Plakat(ev.id)}
                      title={eventPlakatMoreInfoTitle(ev)}
                      aria-label={
                        ev.date
                          ? `${ev.title}, ${formatEventTerminKomplett(ev, { mode: 'compact', emptyFallback: '' })}. Plakat anzeigen.`
                          : `${ev.title}. Plakat anzeigen.`
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        cursor: 'pointer',
                        color: 'inherit',
                        font: 'inherit',
                        textAlign: 'left',
                        width: '100%',
                        fontFamily: 'system-ui, sans-serif',
                      }}
                    >
                      <strong>{ev.title}</strong>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Fester Admin-Bereich wie Muster-Homestruktur */}
      <section
        id="admin"
        style={{
          padding: '0 clamp(1.25rem, 5vw, 3rem)',
          marginTop: '0.6rem',
        }}
      >
        <div style={{ maxWidth: TEMPLATE.maxWidth, margin: '0 auto', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '1rem 1.1rem', fontFamily: 'system-ui, sans-serif' }}>
          <h3 style={{ margin: '0 0 0.45rem', fontSize: '1rem', color: C.text }}>Admin-Zugang</h3>
          <p style={{ margin: '0 0 0.7rem', color: C.textMid, fontSize: '0.9rem', lineHeight: 1.45 }}>
            Vereinsdaten, Karten, Texte und Inhalte pflegen.
          </p>
          <button
            type="button"
            onClick={() => navigate('/mein-bereich?context=vk2')}
            style={{
              padding: '0.5rem 0.9rem',
              background: '#1e5cb5',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Mit mir in den Admin →
          </button>
        </div>
      </section>

      {/* ── Einladung: Eigene Galerie – bewusst zurückhaltend (Vereinsseite), kein lauter Aktions-Button ── */}
      <div style={{ padding: '0 clamp(1.25rem, 5vw, 3rem)', marginTop: 'clamp(1.2rem, 3vw, 1.6rem)' }}>
        <Link
          to={ENTDECKEN_ROUTE}
          style={{
            display: 'block',
            maxWidth: TEMPLATE.maxWidth,
            margin: '0 auto',
            padding: '0.75rem 1rem',
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            textDecoration: 'none',
            color: 'inherit',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(92, 86, 80, 0.35)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = C.border
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.95rem', lineHeight: 1.2, opacity: 0.85 }} aria-hidden>
              🖼️
            </span>
            <div style={{ flex: '1 1 12rem', minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 'clamp(0.9rem, 1.8vw, 1.02rem)', color: C.text, marginBottom: '0.2rem', fontFamily: 'system-ui, sans-serif' }}>
                Deine eigene Galerie?
              </div>
              <p style={{ margin: 0, fontSize: 'clamp(0.82rem, 1.5vw, 0.92rem)', color: C.textMid, lineHeight: 1.5, fontFamily: 'system-ui, sans-serif' }}>
                Mit K2 Galerie kannst du Werke, Ideen oder Produkte und deine Präsenz professionell präsentieren.{' '}
                <span style={{ color: C.accent, fontWeight: 500, whiteSpace: 'nowrap' }}>Jetzt entdecken →</span>
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Impressum – gleiche Struktur wie GaleriePage (section, grid 1fr auto, links Brand + Vereinsdaten, rechts QR) */}
      <footer
        id="impressum"
        {...(showVk2LeitfadenUi ? { 'data-leitfaden-focus': 'impressum' as const } : {})}
        style={{ marginTop: '1rem', paddingTop: 'clamp(1rem, 2vw, 1.5rem)', borderTop: `1px solid ${C.border}`, background: '#f2ede6', fontFamily: 'system-ui, sans-serif' }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)', color: C.textMid, lineHeight: '1.5' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'clamp(2rem, 4vw, 3rem)', alignItems: 'flex-start' }}>
            {/* Linke Seite: Impressum Brand + Vereinsdaten (wie GaleriePage links, mit Platz für Mandant) */}
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', fontWeight: 600, color: C.text }}>Impressum</h4>
              {/* Vereinsdaten (kgm solution / Copyright nur unten im Footer) */}
              <p style={{ margin: '0 0 0.25rem', fontWeight: 600, color: C.text, fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>{stammdaten?.verein?.name || 'Verein'}</p>
              {stammdaten?.verein?.vereinsnummer && <p style={{ margin: '0 0 0.1rem', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', color: C.textMid }}>ZVR: {stammdaten.verein.vereinsnummer}</p>}
              {(stammdaten?.verein?.address || stammdaten?.verein?.city) && <p style={{ margin: '0 0 0.1rem', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', color: C.textMid }}>{[stammdaten.verein.address, stammdaten.verein.city].filter(Boolean).join(', ')}</p>}
              {stammdaten?.verein?.email && <p style={{ margin: '0 0 0.1rem', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)' }}><a href={`mailto:${stammdaten.verein.email}`} style={{ color: C.accent, textDecoration: 'none' }}>{stammdaten.verein.email}</a></p>}
              {stammdaten?.vorstand?.name && <p style={{ margin: '0.5rem 0 0.1rem', fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', color: C.textMid }}>Vorstand: {stammdaten.vorstand.name}{stammdaten.vize?.name ? `, ${stammdaten.vize.name}` : ''}</p>}
            </div>
            {/* Rechte Seite: QR (wie GaleriePage) */}
            {qrDataUrl && (
              <div style={{ textAlign: 'center', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)', color: C.text, fontWeight: 600 }}>Mitglieder direkt aufrufen</p>
                <div style={{ background: '#fff', padding: '0.4rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <img src={qrDataUrl} alt="QR" style={{ width: 100, height: 100, display: 'block' }} />
                </div>
              </div>
            )}
          </div>
          <p style={{ marginTop: '1.5rem', marginBottom: 0, paddingTop: '1rem', borderTop: `1px solid ${C.border}`, fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', color: C.textMid, letterSpacing: '0.01em' }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
          <p style={{ marginTop: '0.35rem', marginBottom: 0, fontSize: 'clamp(0.72rem, 1.6vw, 0.82rem)', color: C.textMid, opacity: 0.95 }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
          <AppVerlassenFooterLink accentColor={C.accent} mutedColor={C.textMid} />
          <p style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.78rem', color: C.textLight }}>
            {PRODUCT_BRAND_NAME} ©
          </p>
        </div>
      </footer>

      {plakatOverlayUrl ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Plakat"
          style={{
            position: 'fixed',
            inset: 0,
            background: '#0d0d0d',
            zIndex: 10050,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            boxSizing: 'border-box',
            width: '100%',
            height: '100%',
          }}
        >
          <button
            type="button"
            aria-label="Plakat schließen"
            title="Schließen"
            onClick={() => setPlakatOverlayUrl(null)}
            style={{
              position: 'fixed',
              top: 10,
              right: 10,
              zIndex: 10056,
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.35)',
              background: 'rgba(0,0,0,0.55)',
              color: '#fff',
              fontSize: '1.35rem',
              lineHeight: 1,
              cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}
          >
            ✕
          </button>
          <iframe
            key={plakatOverlayUrl}
            title="Plakat"
            src={plakatOverlayUrl}
            style={{
              width: '100%',
              height: '100%',
              flex: 1,
              minHeight: 0,
              border: 'none',
              display: 'block',
            }}
          />
        </div>
      ) : null}

    </div>
  )
}

// ─── Eingangskarten ─────────────────────────────────────────────────────────

function vk2EingangskartenKey(): string {
  return pilotScopeVk2Key('k2-vk2-eingangskarten')
}

interface EingangskarteData {
  titel: string
  untertitel: string
  imageUrl: string
}

const DEFAULT_KARTEN: EingangskarteData[] = [
  {
    titel: 'Unsere Galerie',
    untertitel: 'Werke, Ausstellungen & Events – entdecke unseren Verein',
    imageUrl: '',
  },
  {
    titel: 'Mitglieder & Künstler:innen',
    untertitel: 'Leidenschaft, Können und Kreativität – lerne uns kennen',
    imageUrl: '',
  },
]

function loadEingangskarten(): EingangskarteData[] {
  try {
    const raw = localStorage.getItem(vk2EingangskartenKey())
    if (!raw) return DEFAULT_KARTEN
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length >= 2) return parsed
  } catch { /* ignore */ }
  return DEFAULT_KARTEN
}

/** Ziel-Route pro Karte: 0 = Vereinskatalog, 1 = Mitglieder & Künstler:innen – ein Einstieg pro Karte, keine Doppel-Buttons */
const KARTEN_ZIEL: (keyof typeof PROJECT_ROUTES.vk2)[] = ['katalog', 'galerieVorschau']

function Vk2Eingangskarten({ stammdaten, welcomeImage, galleryEntryUrl }: { stammdaten: Vk2Stammdaten | null; welcomeImage?: string; galleryEntryUrl?: string }) {
  const navigate = useNavigate()
  const [karten, setKarten] = React.useState<EingangskarteData[]>(loadEingangskarten)

  React.useEffect(() => {
    const reload = () => setKarten(loadEingangskarten())
    window.addEventListener('storage', reload)
    window.addEventListener('vk2-karten-updated', reload)
    window.addEventListener('vk2-stammdaten-updated', reload)
    return () => {
      window.removeEventListener('storage', reload)
      window.removeEventListener('vk2-karten-updated', reload)
      window.removeEventListener('vk2-stammdaten-updated', reload)
    }
  }, [])

  // Demo (Kunstverein Muster): Karten ohne Bild mit Muster-Mitgliederdaten füllen
  const effectiveKarten = React.useMemo(() => {
    const base = karten.length >= 2 ? karten : loadEingangskarten()
    const isDemo = stammdaten?.verein?.name === 'Kunstverein Muster'
    const mitglieder = stammdaten?.mitglieder ?? []
    if (!isDemo || mitglieder.length === 0) return base
    const first = mitglieder[0]
    return base.map((k, i) => {
      if (k.imageUrl) return k
      const imageUrl = i === 0 ? (welcomeImage || first?.imageUrl || '') : (first?.mitgliedFotoUrl || '')
      return { ...k, imageUrl }
    })
  }, [karten, stammdaten, welcomeImage])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    }}>
      {effectiveKarten.map((k, i) => (
        <EingangsKarte
          key={i}
          data={k}
          index={i}
          onClick={() => {
            if (i === 0 && galleryEntryUrl) {
              navigate(galleryEntryUrl)
              return
            }
            const route = KARTEN_ZIEL[i] && PROJECT_ROUTES.vk2[KARTEN_ZIEL[i]]
            if (route) {
              const state = route === PROJECT_ROUTES.vk2.galerieVorschau ? { fromVk2Galerie: true } : undefined
              navigate(route, state ? { state } : undefined)
            }
          }}
        />
      ))}
    </div>
  )
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
      {/* Bild */}
      {hasBild && (
        <img
          src={data.imageUrl}
          alt={data.titel}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* Platzhalter wenn kein Bild */}
      {!hasBild && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 'clamp(2.5rem, 7vw, 4rem)', opacity: 0.35 }}>{dummyIcons[index % 2]}</span>
        </div>
      )}

      {/* Gradient-Overlay von unten */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hasBild
          ? 'linear-gradient(to top, rgba(20,12,8,0.82) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)'
          : 'linear-gradient(to top, rgba(20,12,8,0.65) 0%, transparent 70%)',
      }} />

      {/* Text unten */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.85rem 1rem' }}>
        <div style={{ fontWeight: 700, fontSize: 'clamp(0.88rem, 2.5vw, 1rem)', color: '#fff', lineHeight: 1.2, marginBottom: '0.18rem', fontFamily: 'system-ui, sans-serif', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
          {data.titel}
        </div>
        <div style={{ fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', color: 'rgba(255,255,255,0.78)', lineHeight: 1.4, fontFamily: 'system-ui, sans-serif' }}>
          {data.untertitel}
        </div>
      </div>

      {/* Bearbeiten-Hinweis (nur im Admin) */}
      {typeof window !== 'undefined' && (window.location.search.includes('vorschau=1') || window.location.pathname.includes('admin')) && (
        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(192,86,42,0.85)', borderRadius: 6, padding: '0.15rem 0.45rem', fontSize: '0.68rem', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
          ✏️ editierbar
        </div>
      )}
    </div>
  )
}

export default Vk2GaleriePage
