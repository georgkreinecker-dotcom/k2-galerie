/**
 * Öffentliche Galerie-Ansicht für einen Mandanten (tenantId aus URL).
 * Route: /g/:tenantId
 * Lädt gallery-data?tenantId= und zeigt die Galerie oder „Jetzt gestalten“ + Admin-Link.
 *
 * Besucherzähler: Smoke-Test für Lizenz-Mandanten → docs/SMOKE-BESUCHERZAEHLER-LIZENZ.md
 */
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useParams, Link, useSearchParams, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { reportPublicGalleryVisit } from '../utils/reportPublicGalleryVisit'
import {
  FOCUS_DIRECTIONS,
  MUSTER_ARTWORKS,
  MUSTER_TEXTE,
  getWelcomeIntroForFocusDirections,
  type FocusDirectionId,
} from '../config/tenantConfig'
import { TenantHomepageTemplate, type TenantArtistSpotlight } from '../components/TenantHomepageTemplate'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import { APP_BASE_URL_SHAREABLE } from '../config/externalUrls'
import '../App.css'

const SAFE_TENANT_ID = /^[a-z0-9-]{1,64}$/
/** Wie GaleriePage: nach Aufruf von Admin mit state.fromAdmin bleibt der Einstieg in derselben Session erhalten. */
const KEY_FROM_ADMIN = 'k2-galerie-from-admin'
const DEFAULT_FOCUS_DIRECTION: FocusDirectionId = 'kunst'
type TenantGalleryArtwork = {
  number?: string
  title?: string
  imageRef?: string
  image?: string
  imageUrl?: string
  uid?: string
  inShop?: boolean
  inExhibition?: boolean
  price?: number | string
  vk?: number | string
  preis?: number | string
  verkaufspreis?: number | string
  category?: string
  artist?: string
  previewUrl?: string
  paintingWidth?: number | string
  paintingHeight?: number | string
  ceramicHeight?: number | string
  ceramicDiameter?: number | string
  ceramicType?: string
  ceramicSurface?: string
  ceramicDescription?: string
  ceramicSubcategory?: string
}
type PageContentGalTenant = { welcomeImage?: string; virtualTourImage?: string; virtualTourVideo?: string; galerieCardImage?: string }
type TenantEvent = { id?: string; title?: string; date?: string; endDate?: string }

function normalizeFocusDirection(raw: string | null): FocusDirectionId {
  const value = String(raw || '').trim().toLowerCase()
  return (FOCUS_DIRECTIONS.some((d) => d.id === value) ? value : DEFAULT_FOCUS_DIRECTION) as FocusDirectionId
}

/** Kurzes Kategorie-Label (Caps-Stil) für die Künstler:in-Karte – an ök2 „Bilder“ angelehnt. */
function spotlightCategoryLabelForFocus(direction: FocusDirectionId): string {
  const map: Record<FocusDirectionId, string> = {
    kunst: 'Bilder',
    handwerk: 'Handwerk',
    design: 'Design',
    mode: 'Mode',
    food: 'Produkte',
    dienstleister: 'Portfolio',
  }
  return map[direction] ?? 'Galerie'
}

/** Live-Template: Farben aus gallery-data + lokale Admin-Vorschau (localStorage). Nur nicht-leere Overlay-Werte überschreiben. */
function mergeLiveDesignOverlay(
  server: Record<string, string> | undefined,
  overlay: Record<string, string> | undefined,
): Record<string, string> {
  const base = server && typeof server === 'object' ? { ...server } : {}
  if (!overlay || typeof overlay !== 'object') return base
  for (const [k, v] of Object.entries(overlay)) {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      base[k] = v
    }
  }
  return base
}

export default function GalerieTenantPage() {
  const { tenantId } = useParams<{ tenantId: string }>()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const focusDirection = normalizeFocusDirection(searchParams.get('focusDirection'))
  const liveTemplateMode = searchParams.get('liveTemplate') === '1'
  const adminPreviewMode = searchParams.get('vorschau') === '1' || searchParams.get('k2DocViewer') === '1'
  const useLiveOverlay = liveTemplateMode || adminPreviewMode
  const [data, setData] = useState<{
    artworks?: TenantGalleryArtwork[]
    events?: TenantEvent[]
    gallery?: Record<string, unknown>
    martina?: Record<string, unknown>
    georg?: Record<string, unknown>
    pageTexts?: { galerie?: { heroTitle?: string; welcomeSubtext?: string; welcomeIntroText?: string; martinaBio?: string } }
    designSettings?: Record<string, string>
    pageContentGalerie?: string | { welcomeImage?: string }
    pageContent?: string | { welcomeImage?: string }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')
  /** Nur Live-Vorschau: localStorage wird ohne Reload weiter geschrieben → kurzes Nachladen. */
  const [livePreviewStorageEpoch, setLivePreviewStorageEpoch] = useState(0)
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()

  useEffect(() => {
    if (tenantId && SAFE_TENANT_ID.test(tenantId)) {
      reportPublicGalleryVisit({
        tenant: tenantId,
        sessionKey: 'k2-visit-sent-' + tenantId,
      })
    }
  }, [tenantId])

  useEffect(() => {
    if (!tenantId || !SAFE_TENANT_ID.test(tenantId)) {
      setLoading(false)
      setError(true)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(false)
    const bust = Date.now()
    fetch(`/api/gallery-data?tenantId=${encodeURIComponent(tenantId)}&_=${bust}`, { cache: 'no-store' })
      .then((res) => {
        if (cancelled) return
        if (!res.ok) {
          setError(true)
          setData(null)
          setLoading(false)
          return
        }
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        setData(json || null)
        setError(false)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
          setData(null)
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [tenantId])

  useEffect(() => {
    if (!useLiveOverlay) return
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [useLiveOverlay, tenantId])

  useLayoutEffect(() => {
    if (!tenantId || !SAFE_TENANT_ID.test(tenantId)) return
    try {
      if ((location.state as { fromAdmin?: boolean } | null)?.fromAdmin === true) {
        sessionStorage.setItem(KEY_FROM_ADMIN, '1')
      }
    } catch {
      /* ignore */
    }
  }, [tenantId, location.state])

  useEffect(() => {
    if (!useLiveOverlay || !tenantId || typeof window === 'undefined') return
    const key = `k2-live-template-preview-${tenantId}`
    let last = ''
    const tick = () => {
      try {
        const raw = localStorage.getItem(key) || ''
        if (raw !== last) {
          last = raw
          setLivePreviewStorageEpoch((n) => n + 1)
        }
      } catch {
        /* ignore */
      }
    }
    tick()
    const id = window.setInterval(tick, liveTemplateMode ? 200 : 450)
    return () => window.clearInterval(id)
  }, [useLiveOverlay, tenantId, liveTemplateMode])

  const liveTemplateOverlay = useMemo(() => {
    if (!useLiveOverlay || !tenantId || typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(`k2-live-template-preview-${tenantId}`)
      if (!raw) return null
      const parsed = JSON.parse(raw) as {
        tenantId?: string
        pageTexts?: { galerie?: { heroTitle?: string; welcomeSubtext?: string; welcomeIntroText?: string; martinaBio?: string } }
        pageContentGalerie?: string | { welcomeImage?: string; virtualTourImage?: string; virtualTourVideo?: string }
        designSettings?: Record<string, string>
        gallery?: Record<string, unknown>
      }
      if (String(parsed.tenantId || '') !== tenantId) return null
      return parsed
    } catch {
      return null
    }
  }, [useLiveOverlay, tenantId, location.search, livePreviewStorageEpoch])

  const adminUrl = `/admin?tenantId=${encodeURIComponent(tenantId || '')}&focusDirection=${encodeURIComponent(focusDirection)}`
  const shareBaseUrl = APP_BASE_URL_SHAREABLE.replace(/\/$/, '')
  const shareUrl = `${shareBaseUrl}/g/${encodeURIComponent(tenantId || '')}?focusDirection=${encodeURIComponent(focusDirection)}`

  useEffect(() => {
    let cancelled = false
    const targetUrl = buildQrUrlWithBust(shareUrl, qrVersionTs)
    QRCode.toDataURL(targetUrl, { width: 100, margin: 1 })
      .then((url) => { if (!cancelled) setQrDataUrl(url) })
      .catch(() => { if (!cancelled) setQrDataUrl('') })
    return () => { cancelled = true }
  }, [shareUrl, qrVersionTs])

  if (!tenantId || !SAFE_TENANT_ID.test(tenantId)) {
    return (
      <main style={{ maxWidth: 560, margin: '3rem auto', padding: '1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--k2-muted)' }}>Ungültiger Galerie-Link.</p>
        <Link to="/" style={{ color: 'var(--k2-accent)' }}>Zur Startseite</Link>
      </main>
    )
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 560, margin: '3rem auto', padding: '1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--k2-muted)' }}>Galerie wird geladen…</p>
      </main>
    )
  }

  const serverArtworks: TenantGalleryArtwork[] = !error && Array.isArray(data?.artworks) ? data.artworks : []
  const artworks: TenantGalleryArtwork[] = serverArtworks.length > 0 ? serverArtworks : MUSTER_ARTWORKS
  const isMusterStart = serverArtworks.length === 0
  const focusLabel = FOCUS_DIRECTIONS.find((d) => d.id === focusDirection)?.label ?? 'Kunst & Galerie'
  const galleryHintText = focusDirection === 'kunst'
    ? 'In der Galerie findest du auch unseren Shop.'
    : `In der Galerie findest du Angebote und Auswahlen aus dem Bereich ${focusLabel}.`
  const galleryPageTitle = focusDirection === 'kunst' ? 'Galerie & Shop' : `${focusLabel} - Auswahl`
  const galleryStamm = (liveTemplateOverlay?.gallery && typeof liveTemplateOverlay.gallery === 'object')
    ? liveTemplateOverlay.gallery
    : ((data?.gallery && typeof data.gallery === 'object') ? data.gallery as Record<string, unknown> : {})
  /** Server-Texte + Live-Overlay: nur nicht-leere Overlay-Zeilen gewinnen (verhindert alte/halbe Snapshots über frische Server-Daten). */
  const effectiveGalerieTexts = (() => {
    const serverGalerie =
      data?.pageTexts?.galerie && typeof data.pageTexts.galerie === 'object'
        ? data.pageTexts.galerie
        : {}
    if (!liveTemplateOverlay) return serverGalerie
    const og = liveTemplateOverlay.pageTexts?.galerie
    if (!og || typeof og !== 'object') return serverGalerie
    const merged = { ...serverGalerie } as Record<string, unknown>
    for (const key of Object.keys(og)) {
      const v = (og as Record<string, unknown>)[key]
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        merged[key] = v
      }
    }
    return merged as typeof serverGalerie
  })()
  const rawTitle = effectiveGalerieTexts?.heroTitle?.trim() || ''
  const rawSubtext = effectiveGalerieTexts?.welcomeSubtext?.trim() || ''
  const rawIntro = effectiveGalerieTexts?.welcomeIntroText?.trim() || ''
  let title = rawTitle === 'K2 Galerie' ? 'Meine Galerie' : (rawTitle || 'Meine Galerie')
  const galleryNameStamm = String(galleryStamm.name || '').trim()
  const heroLooksUnsetOrGeneric = !rawTitle || rawTitle === 'K2 Galerie' || rawTitle === 'Meine Galerie'
  if (heroLooksUnsetOrGeneric && galleryNameStamm) {
    title = galleryNameStamm
  }
  const subtext = rawSubtext === 'Kunst & Keramik – Martina und Georg Kreinecker' ? focusLabel : (rawSubtext || focusLabel)
  const intro = rawIntro === 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.'
    ? getWelcomeIntroForFocusDirections([focusDirection])
    : (rawIntro || getWelcomeIntroForFocusDirections([focusDirection]))
  const pageContentRaw = liveTemplateOverlay?.pageContentGalerie ?? data?.pageContentGalerie ?? data?.pageContent
  const parsedPageContent = typeof pageContentRaw === 'string'
    ? (() => { try { return JSON.parse(pageContentRaw) } catch { return {} } })()
    : (pageContentRaw || {})
  const pageContentParsed = (typeof parsedPageContent === 'object' && parsedPageContent != null
    ? parsedPageContent
    : {}) as PageContentGalTenant
  const welcomeImage = String(pageContentParsed.welcomeImage || '').trim()
  const galerieCardImage = String(pageContentParsed.galerieCardImage || galleryStamm.galerieCardImage || '').trim()
  const virtualTourImage = String(pageContentParsed.virtualTourImage || galleryStamm.virtualTourImage || '').trim()
  const virtualTourVideo = String(pageContentParsed.virtualTourVideo || '').trim()
  const martinaStamm = (data?.martina && typeof data.martina === 'object') ? data.martina as Record<string, unknown> : {}
  const georgStamm = (data?.georg && typeof data.georg === 'object') ? data.georg as Record<string, unknown> : {}
  const impressumEmail = String(galleryStamm.email || martinaStamm.email || georgStamm.email || '').trim()
  const impressumPhone = String(galleryStamm.phone || martinaStamm.phone || georgStamm.phone || '').trim()
  const impressumName = String(galleryStamm.name || title || 'Meine Galerie').trim()
  const contactName1 = String(martinaStamm.name || '').trim()
  const contactPhone1 = String(martinaStamm.phone || '').trim()
  const contactName2 = String(georgStamm.name || '').trim()
  const contactPhone2 = String(georgStamm.phone || '').trim()
  const pickFirstText = (...values: unknown[]): string => {
    for (const value of values) {
      const text = String(value || '').trim()
      if (text) return text
    }
    return ''
  }
  const impressumStreet = pickFirstText(
    galleryStamm.address,
    galleryStamm.strasse,
    martinaStamm.address,
    martinaStamm.strasse,
    georgStamm.address,
    georgStamm.strasse,
  )
  const impressumZip = pickFirstText(
    galleryStamm.zip,
    galleryStamm.plz,
    martinaStamm.zip,
    martinaStamm.plz,
    georgStamm.zip,
    georgStamm.plz,
  )
  const impressumCity = pickFirstText(
    galleryStamm.city,
    galleryStamm.ort,
    martinaStamm.city,
    martinaStamm.ort,
    georgStamm.city,
    georgStamm.ort,
  )
  const impressumCountry = pickFirstText(
    galleryStamm.country,
    galleryStamm.land,
    martinaStamm.country,
    martinaStamm.land,
    georgStamm.country,
    georgStamm.land,
  )
  const impressumAddress = [
    impressumStreet,
    impressumZip,
    impressumCity,
    impressumCountry,
  ].filter(Boolean).join(', ')
  const mapsUrl = impressumAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(impressumAddress)}` : ''
  const openingHours = String(galleryStamm.openingHours || '').trim()
  const normalizeExternalUrl = (raw: unknown): string => {
    const value = String(raw || '').trim()
    if (!value) return ''
    if (/^https?:\/\//i.test(value)) return value
    return `https://${value}`
  }
  const instagramUrl = normalizeExternalUrl(galleryStamm.instagram)
  const facebookUrl = normalizeExternalUrl(galleryStamm.facebook)
  const websiteUrl = normalizeExternalUrl(galleryStamm.website || galleryStamm.internetadresse)
  const events = Array.isArray(data?.events) ? data.events.slice(0, 10).map((e) => {
    const rawId = e?.id
    const idStr = rawId != null && String(rawId).trim() !== '' ? String(rawId).trim() : undefined
    return {
      id: idStr,
      title: String(e?.title || '').trim(),
      date: String(e?.date || '').trim(),
      endDate: String(e?.endDate || '').trim(),
    }
  }).filter((e) => e.title || e.date || e.endDate) : []
  const galleryEntered = searchParams.get('enter') === 'gallery' || String(location.hash || '').toLowerCase() === '#werke'
  const galleryEnterParams = new URLSearchParams(searchParams)
  galleryEnterParams.set('enter', 'gallery')
  const galleryEnterUrl = `/g/${encodeURIComponent(tenantId)}?${galleryEnterParams.toString()}#werke`
  const galleryCloseParams = new URLSearchParams(searchParams)
  galleryCloseParams.delete('enter')
  const galleryCloseQuery = galleryCloseParams.toString()
  const galleryCloseUrl = `/g/${encodeURIComponent(tenantId)}${galleryCloseQuery ? `?${galleryCloseQuery}` : ''}`
  const shopParams = new URLSearchParams()
  shopParams.set('tenantId', tenantId)
  if (focusDirection) shopParams.set('focusDirection', focusDirection)
  shopParams.set('from', 'gallery')
  const shopUrl = `/projects/k2-galerie/shop?${shopParams.toString()}`
  const galerieTextsRecord = effectiveGalerieTexts as Record<string, unknown>
  const martinaBioFromTexts = String(galerieTextsRecord.martinaBio || '').trim()
  const martinaBioFromStamm = String(martinaStamm.bio || '').trim()
  const spotlightBio =
    martinaBioFromTexts || martinaBioFromStamm || (isMusterStart ? MUSTER_TEXTE.artist1Bio : '')
  const spotlightName = contactName1 || (isMusterStart ? MUSTER_TEXTE.martina.name : '')
  const spotlightPhoto =
    String((martinaStamm as { photoUrl?: string }).photoUrl || '').trim() ||
    (isMusterStart ? String(MUSTER_TEXTE.martina.photoUrl || '').trim() : '')
  const showArtistSpotlight = isMusterStart || Boolean(spotlightName || spotlightBio || spotlightPhoto)
  const artistSpotlight: TenantArtistSpotlight | null = showArtistSpotlight
    ? {
        categoryLabel: spotlightCategoryLabelForFocus(focusDirection),
        displayName: spotlightName || MUSTER_TEXTE.martina.name,
        bio: spotlightBio || (isMusterStart ? MUSTER_TEXTE.artist1Bio : ''),
        photoUrl: spotlightPhoto || undefined,
        vitaTo: `/projects/k2-galerie/vita/martina?tenantId=${encodeURIComponent(tenantId)}&focusDirection=${encodeURIComponent(focusDirection)}`,
      }
    : null
  const serverDesign =
    data?.designSettings && typeof data.designSettings === 'object'
      ? (data.designSettings as Record<string, string>)
      : {}
  const overlayDesign =
    liveTemplateOverlay?.designSettings && typeof liveTemplateOverlay.designSettings === 'object'
      ? (liveTemplateOverlay.designSettings as Record<string, string>)
      : {}
  const liveDesign = useLiveOverlay ? mergeLiveDesignOverlay(serverDesign, overlayDesign) : serverDesign
  const liveAccent = String(liveDesign.accentColor || '#b54a1e')
  const liveBg1 = String(liveDesign.backgroundColor1 || '#f4efe8')
  const liveBg2 = String(liveDesign.backgroundColor2 || '#ede4d8')
  const liveText = String(liveDesign.textColor || '#1f1a15')
  const liveMuted = String(liveDesign.mutedColor || '#5f564d')
  const liveSectionBg = String(liveDesign.cardBg1 || '#fff')
  const titleFontSizeRem = Number(liveDesign.titleFontSize || 1.85)
  const subtextFontSizeRem = Number(liveDesign.subtextFontSize || 1.0)
  const bodyFontSizeRem = Number(liveDesign.bodyFontSize || 1.0)
  const welcomeImageHeightPx = Number(liveDesign.welcomeImageHeightPx || 260)
  const tourImageHeightPx = Number(liveDesign.tourImageHeightPx || 260)

  /** Wie K2-Galerie (showAdminEntryOnGalerie): Besucher ohne APf/Admin-Kontext sehen keinen Admin-Link; Eigentümer über Vorschau, Live-Template, embedded, Admin-Navigation oder PWA-Standalone. */
  const embeddedInApfPreview = searchParams.get('embedded') === '1'
  const fromAdminNavigation = (location.state as { fromAdmin?: boolean } | null)?.fromAdmin === true
  let fromAdminSessionFlag = false
  try {
    fromAdminSessionFlag = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(KEY_FROM_ADMIN) === '1'
  } catch {
    /* ignore */
  }
  const isGaleriePwaStandalone =
    typeof window !== 'undefined' &&
    ((typeof navigator !== 'undefined' && (navigator as { standalone?: boolean }).standalone === true) ||
      (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches))
  const showLicenseeAdminInHeader =
    useLiveOverlay ||
    embeddedInApfPreview ||
    fromAdminNavigation ||
    fromAdminSessionFlag ||
    isGaleriePwaStandalone

  return (
    <TenantHomepageTemplate
      tenantId={tenantId}
      title={title}
      subtext={subtext}
      intro={intro}
      adminUrl={adminUrl}
      shareUrl={shareUrl}
      artworks={artworks}
      isMusterStart={isMusterStart}
      welcomeImage={welcomeImage}
      virtualTourImage={virtualTourImage}
      virtualTourVideo={virtualTourVideo}
      galerieCardImage={galerieCardImage}
      impressumAddress={impressumAddress}
      impressumPhone={impressumPhone}
      impressumEmail={impressumEmail}
      mapsUrl={mapsUrl}
      openingHours={openingHours}
      instagramUrl={instagramUrl}
      facebookUrl={facebookUrl}
      websiteUrl={websiteUrl}
      events={events}
      contactName1={contactName1}
      contactPhone1={contactPhone1}
      contactName2={contactName2}
      contactPhone2={contactPhone2}
      qrDataUrl={qrDataUrl}
      impressumName={impressumName}
      hideAdminEntry={!showLicenseeAdminInHeader}
      liveAccent={liveAccent}
      liveBg1={liveBg1}
      liveBg2={liveBg2}
      liveText={liveText}
      liveMuted={liveMuted}
      liveSectionBg={liveSectionBg}
      titleFontSizeRem={Number.isFinite(titleFontSizeRem) ? titleFontSizeRem : 1.85}
      subtextFontSizeRem={Number.isFinite(subtextFontSizeRem) ? subtextFontSizeRem : 1.0}
      bodyFontSizeRem={Number.isFinite(bodyFontSizeRem) ? bodyFontSizeRem : 1.0}
      welcomeImageHeightPx={Number.isFinite(welcomeImageHeightPx) ? welcomeImageHeightPx : 260}
      tourImageHeightPx={Number.isFinite(tourImageHeightPx) ? tourImageHeightPx : 260}
      galleryEntered={galleryEntered}
      galleryEnterUrl={galleryEnterUrl}
      galleryHintText={galleryHintText}
      galleryPageTitle={galleryPageTitle}
      galleryCloseUrl={galleryCloseUrl}
      shopUrl={shopUrl}
      artistSpotlight={artistSpotlight}
    />
  )
}
