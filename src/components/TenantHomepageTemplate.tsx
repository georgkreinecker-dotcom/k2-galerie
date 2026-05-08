import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'

type TenantGalleryArtwork = { number?: string; title?: string; imageRef?: string; image?: string; imageUrl?: string }
type TenantEvent = { id?: string; title?: string; date?: string; endDate?: string; description?: string }

type TenantHomepageTemplateProps = {
  tenantId: string
  title: string
  subtext: string
  intro: string
  adminUrl: string
  shareUrl: string
  artworks: TenantGalleryArtwork[]
  isMusterStart: boolean
  welcomeImage: string
  virtualTourImage: string
  virtualTourVideo: string
  galerieCardImage: string
  impressumAddress: string
  impressumPhone: string
  impressumEmail: string
  mapsUrl: string
  liveAccent: string
  liveBg1: string
  liveBg2: string
  liveText: string
  liveMuted: string
  liveSectionBg: string
  titleFontSizeRem?: number
  subtextFontSizeRem?: number
  bodyFontSizeRem?: number
  galleryEntered?: boolean
  galleryEnterUrl?: string
  welcomeImageHeightPx?: number
  tourImageHeightPx?: number
  openingHours?: string
  instagramUrl?: string
  facebookUrl?: string
  websiteUrl?: string
  events?: TenantEvent[]
  galleryHintText?: string
  galleryPageTitle?: string
  galleryCloseUrl?: string
  shopUrl?: string
  contactName1?: string
  contactPhone1?: string
  contactName2?: string
  contactPhone2?: string
  qrDataUrl?: string
  impressumName?: string
  hideAdminEntry?: boolean
}

export function TenantHomepageTemplate(props: TenantHomepageTemplateProps) {
  const entranceImage = props.galerieCardImage
  const virtualTourFallbackImage = props.virtualTourImage || props.galerieCardImage
  const welcomeImageHeightPx = Math.min(520, Math.max(170, Number(props.welcomeImageHeightPx || 260)))
  const tourImageHeightPx = Math.min(520, Math.max(170, Number(props.tourImageHeightPx || 260)))
  const heroHeightPx = Math.max(360, welcomeImageHeightPx)
  const TEMPLATE = {
    sectionRadius: 14,
    sectionBorder: `1px solid ${props.liveAccent}33`,
    sectionBg: props.liveSectionBg,
    sectionPadding: '1rem',
    chipBorder: `1px solid ${props.liveAccent}33`,
    chipBg: '#fffefb',
    chipColor: props.liveMuted,
  }
  const hasSocialOrInfo = !!(props.openingHours || props.instagramUrl || props.facebookUrl || props.websiteUrl || (props.events && props.events.length > 0))
  const showMusterSocial = !hasSocialOrInfo
  const socialLinks = [
    { label: 'Instagram', url: props.instagramUrl, isPlaceholder: false },
    { label: 'Facebook', url: props.facebookUrl, isPlaceholder: false },
    { label: 'Webseite', url: props.websiteUrl, isPlaceholder: false },
  ]
  const displayOpeningHours = props.openingHours || 'Di-So 10:00-18:00 Uhr'
  const displayEvents = (props.events && props.events.length > 0)
    ? props.events.slice(0, 3)
    : [
        { id: 'muster-1', title: 'Vernissage - Neue Werke', date: 'Freitag, 19:00' },
        { id: 'muster-2', title: 'Artist Talk', date: 'Samstag, 16:00' },
        { id: 'muster-3', title: 'Offene Galerie', date: 'Sonntag, 11:00-17:00' },
      ]
  const visibleArtworks = useMemo(
    () => (props.artworks || []).filter((a) => !!(a.imageRef || a.image || a.imageUrl || a.title || a.number)),
    [props.artworks],
  )
  const deriveAreaKey = (artwork: TenantGalleryArtwork): string => {
    const numberPart = String(artwork.number || '').trim()
    const titlePart = String(artwork.title || '').trim()
    const fromNumber = numberPart.match(/^[A-Za-zÄÖÜäöü]+/)?.[0] || ''
    const fromTitle = titlePart.split(/\s+/)[0] || ''
    const raw = (fromNumber || fromTitle || 'Galerie').trim()
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  }
  const areaOptions = useMemo(() => {
    const unique = new Set<string>()
    visibleArtworks.forEach((a) => unique.add(deriveAreaKey(a)))
    return ['Alle', ...Array.from(unique).slice(0, 8)]
  }, [visibleArtworks])
  const [selectedArea, setSelectedArea] = useState('Alle')
  useEffect(() => {
    if (!areaOptions.includes(selectedArea)) setSelectedArea('Alle')
  }, [areaOptions, selectedArea])
  const filteredArtworks = useMemo(
    () => (selectedArea === 'Alle' ? visibleArtworks : visibleArtworks.filter((a) => deriveAreaKey(a) === selectedArea)),
    [visibleArtworks, selectedArea],
  )
  const [selectedArtworkIdx, setSelectedArtworkIdx] = useState(0)
  const safeSelectedIdx = Math.max(0, Math.min(selectedArtworkIdx, Math.max(filteredArtworks.length - 1, 0)))
  const selectedArtwork = filteredArtworks[safeSelectedIdx] || null
  const selectedArtworkImage = selectedArtwork ? (selectedArtwork.imageRef || selectedArtwork.image || selectedArtwork.imageUrl || '') : ''
  const [zoomImageSrc, setZoomImageSrc] = useState('')
  const likedStorageKey = `k2-tenant-liked-${props.tenantId}`
  const [likedArtworkKeys, setLikedArtworkKeys] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = localStorage.getItem(likedStorageKey)
      const parsed = raw ? JSON.parse(raw) : []
      return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
    } catch {
      return []
    }
  })
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(likedStorageKey, JSON.stringify(likedArtworkKeys))
    } catch {
      /* ignore */
    }
  }, [likedArtworkKeys, likedStorageKey])
  const selectedArtworkKey = selectedArtwork
    ? String(selectedArtwork.number || selectedArtwork.title || `idx-${safeSelectedIdx}`).trim().toUpperCase()
    : ''
  const selectedIsLiked = !!selectedArtworkKey && likedArtworkKeys.includes(selectedArtworkKey)
  const selectedWorkParam = String(selectedArtwork?.number || selectedArtwork?.title || '').trim()
  const reserveUrl = useMemo(() => {
    const base = props.shopUrl || '/projects/k2-galerie/shop'
    if (!selectedWorkParam) return base
    const glue = base.includes('?') ? '&' : '?'
    return `${base}${glue}werk=${encodeURIComponent(selectedWorkParam)}`
  }, [props.shopUrl, selectedWorkParam])
  const galleryHintText = props.galleryHintText || 'In der Galerie findest du auch unseren Shop.'
  const galleryPageTitle = props.galleryPageTitle || 'Galerie & Shop'

  const handleShare = async () => {
    const shareText = `${props.title} – ${props.subtext}`
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title: props.title, text: shareText, url: props.shareUrl })
        return
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(props.shareUrl)
        alert('Link kopiert.')
        return
      }
    } catch {
      // Fallback unten
    }
    if (typeof window !== 'undefined') window.prompt('Link kopieren:', props.shareUrl)
  }

  return (
    <main
      className="galerie-tenant-page"
      style={{
        maxWidth: 980,
        margin: '0 auto',
        padding: 'clamp(0.75rem, 2.5vw, 1.25rem)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(180deg, ${props.liveBg1} 0%, ${props.liveBg2} 100%)`,
        color: props.liveText,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.7rem' }}>
        <Link to="/" style={{ color: props.liveMuted, textDecoration: 'none', fontSize: '0.86rem', fontWeight: 600 }}>
          {PRODUCT_BRAND_NAME} ©
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => { void handleShare() }}
            style={{ border: `1px solid ${props.liveAccent}44`, background: '#fff', color: props.liveMuted, borderRadius: 999, padding: '0.42rem 0.7rem', fontSize: '0.82rem', cursor: 'pointer' }}
          >
            📤 Teilen
          </button>
          {!props.hideAdminEntry ? (
            <a href={props.adminUrl} style={{ border: `1px solid ${props.liveAccent}44`, background: '#fff', color: props.liveMuted, borderRadius: 999, padding: '0.42rem 0.7rem', fontSize: '0.82rem', textDecoration: 'none' }}>
              🔐 Admin
            </a>
          ) : null}
        </div>
      </div>

      <header
        id="start"
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          background: TEMPLATE.sectionBg,
          border: TEMPLATE.sectionBorder,
          borderRadius: TEMPLATE.sectionRadius,
          padding: props.welcomeImage ? 'clamp(1rem, 3vw, 1.6rem) clamp(0.85rem, 2.8vw, 1.25rem)' : 'clamp(0.85rem, 2.5vw, 1.1rem) clamp(0.8rem, 2.5vw, 1.05rem)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: props.welcomeImage ? heroHeightPx : undefined,
          display: 'grid',
          alignItems: 'center',
        }}
      >
        {props.welcomeImage ? (
          <>
            <img
              src={props.welcomeImage}
              alt="Willkommen"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', zIndex: 0 }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(10,14,22,0.58) 0%, rgba(10,14,22,0.34) 42%, rgba(10,14,22,0.5) 100%)',
                zIndex: 1,
              }}
            />
          </>
        ) : null}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: `${props.titleFontSizeRem || 1.85}rem`, fontWeight: 800, color: props.welcomeImage ? '#fff' : props.liveText, margin: 0 }}>{props.title}</h1>
          <p style={{ color: props.welcomeImage ? 'rgba(255,255,255,0.92)' : props.liveMuted, margin: '0.45rem 0 0', fontWeight: 600, fontSize: `${props.subtextFontSizeRem || 1.0}rem` }}>{props.subtext}</p>
          <p style={{ color: props.welcomeImage ? 'rgba(255,255,255,0.95)' : props.liveText, maxWidth: 700, margin: '0.8rem auto 0', lineHeight: 1.6, fontSize: `${props.bodyFontSizeRem || 1.0}rem` }}>{props.intro}</p>
        </div>
      </header>

      <section id="willkommen" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', alignItems: 'stretch' }}>
          <div style={{ background: TEMPLATE.sectionBg, border: TEMPLATE.sectionBorder, borderRadius: TEMPLATE.sectionRadius, padding: '1rem', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.55rem', fontSize: '1.05rem', color: props.liveText }}>In die Galerie</h3>
            <div style={{ width: '100%', height: welcomeImageHeightPx, borderRadius: 10, overflow: 'hidden', marginBottom: '0.8rem', border: `1px solid ${props.liveAccent}33`, background: `linear-gradient(135deg, ${props.liveBg2}, ${props.liveBg1})` }}>
              {entranceImage ? (
                <img src={entranceImage} alt="Galerie" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: props.liveMuted, fontWeight: 600 }}>
                  {props.artworks.length > 0 ? `${props.artworks.length} Werke` : 'Galerie'}
                </div>
              )}
            </div>
            <Link to={props.galleryEnterUrl || '#werke'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.65rem 1.1rem', borderRadius: 10, textDecoration: 'none', background: `linear-gradient(135deg, ${props.liveAccent} 0%, ${props.liveAccent}cc 100%)`, color: '#fff', fontWeight: 700 }}>
              Herzlich willkommen - Galerie betreten →
            </Link>
            <p style={{ margin: '0.6rem 0 0', fontSize: '0.82rem', color: props.liveMuted }}>
              In der Galerie findest du auch unseren Shop.
            </p>
          </div>

          <div id="rundgang" style={{ background: TEMPLATE.sectionBg, border: TEMPLATE.sectionBorder, borderRadius: TEMPLATE.sectionRadius, padding: '1rem', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.55rem', fontSize: '1.05rem', color: props.liveText }}>Virtueller Rundgang</h3>
            <div style={{ width: '100%', height: tourImageHeightPx, borderRadius: 10, overflow: 'hidden', marginBottom: '0.8rem', border: `1px solid ${props.liveAccent}33`, background: `linear-gradient(135deg, ${props.liveBg2}, ${props.liveBg1})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {props.virtualTourVideo ? (
                <video src={props.virtualTourVideo} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : virtualTourFallbackImage ? (
                <img src={virtualTourFallbackImage} alt="Virtueller Rundgang" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ color: props.liveMuted, fontWeight: 600 }}>Rundgang</div>
              )}
            </div>
            <a href="#rundgang" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem 1rem', borderRadius: 8, textDecoration: 'none', border: `1px solid ${props.liveAccent}55`, color: props.liveText, fontWeight: 600, background: `${props.liveSectionBg}` }}>
              Rundgang starten →
            </a>
          </div>
        </div>
        {props.isMusterStart ? (
          <p style={{ textAlign: 'center', color: '#5f564d', margin: '0.8rem 0 0', fontWeight: 600 }}>
            Muster-Erstgalerie – ersetze diese Beispiele im Admin durch deine eigenen Inhalte.
          </p>
        ) : null}
      </section>

      {props.galleryEntered ? (
        <section
          id="werke"
          style={{ marginBottom: '1.4rem', background: TEMPLATE.sectionBg, border: TEMPLATE.sectionBorder, borderRadius: TEMPLATE.sectionRadius, padding: TEMPLATE.sectionPadding }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: props.liveText }}>{galleryPageTitle}</h3>
            <Link to={props.galleryCloseUrl || props.shareUrl} style={{ border: TEMPLATE.chipBorder, borderRadius: 999, padding: '0.35rem 0.75rem', textDecoration: 'none', color: props.liveText, background: '#fff' }}>
              Galerie schließen
            </Link>
          </div>
          <p style={{ margin: '0 0 0.8rem', color: props.liveMuted, fontSize: '0.9rem' }}>
            {galleryHintText}
          </p>
          {visibleArtworks.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {areaOptions.map((area) => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => { setSelectedArea(area); setSelectedArtworkIdx(0) }}
                      style={{
                        border: selectedArea === area ? `1px solid ${props.liveAccent}` : TEMPLATE.chipBorder,
                        borderRadius: 999,
                        padding: '0.34rem 0.7rem',
                        background: selectedArea === area ? `${props.liveAccent}18` : '#fff',
                        color: selectedArea === area ? props.liveText : props.liveMuted,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {area}
                    </button>
                  ))}
                </div>
                <Link
                  to={props.shopUrl || '#shop-bereich'}
                  style={{
                    border: `1px solid ${props.liveAccent}55`,
                    borderRadius: 999,
                    padding: '0.34rem 0.8rem',
                    textDecoration: 'none',
                    color: props.liveText,
                    background: `${props.liveAccent}14`,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  Zum Shopbereich →
                </Link>
              </div>
              <div style={{ border: TEMPLATE.sectionBorder, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', marginBottom: '0.85rem' }}>
                {selectedArtworkImage ? (
                  <img
                    src={selectedArtworkImage}
                    alt={selectedArtwork?.title || 'Werk'}
                    onClick={() => setZoomImageSrc(selectedArtworkImage)}
                    style={{ width: '100%', maxHeight: 520, objectFit: 'contain', display: 'block', background: 'rgba(0,0,0,0.16)', cursor: 'zoom-in' }}
                  />
                ) : (
                  <div style={{ minHeight: 220, display: 'grid', placeItems: 'center', color: props.liveMuted }}>Kein Bild</div>
                )}
                <div style={{ padding: '0.65rem 0.8rem' }}>
                  <div style={{ fontSize: '0.78rem', color: props.liveMuted }}>{selectedArtwork?.number || ''}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: props.liveText }}>{selectedArtwork?.title || 'Ohne Titel'}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedArtworkKey) return
                        setLikedArtworkKeys((prev) =>
                          prev.includes(selectedArtworkKey) ? prev.filter((k) => k !== selectedArtworkKey) : [...prev, selectedArtworkKey],
                        )
                      }}
                      style={{
                        border: selectedIsLiked ? `1px solid ${props.liveAccent}` : `1px solid ${props.liveAccent}66`,
                        borderRadius: 999,
                        padding: '0.34rem 0.8rem',
                        color: selectedIsLiked ? '#fff' : props.liveText,
                        background: selectedIsLiked ? props.liveAccent : '#fff',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {selectedIsLiked ? '💙 Gefällt' : '🤍 Gefällt'}
                    </button>
                    <Link
                      to={reserveUrl}
                      style={{
                        border: `1px solid ${props.liveAccent}`,
                        borderRadius: 999,
                        padding: '0.34rem 0.8rem',
                        textDecoration: 'none',
                        color: '#fff',
                        background: props.liveAccent,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                      }}
                    >
                      Reservieren →
                    </Link>
                    {selectedArtworkImage ? (
                      <button
                        type="button"
                        onClick={() => setZoomImageSrc(selectedArtworkImage)}
                        style={{
                          border: `1px solid ${props.liveAccent}66`,
                          borderRadius: 999,
                          padding: '0.34rem 0.8rem',
                          color: props.liveText,
                          background: `${props.liveSectionBg}`,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Bild vergrößern ⤢
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
                {filteredArtworks.slice(0, 24).map((a, i) => {
                  const thumb = a.imageRef || a.image || a.imageUrl || ''
                  const isActive = safeSelectedIdx === i
                  return (
                    <button
                      key={a.number || `${a.title || 'werk'}-${i}`}
                      type="button"
                      onClick={() => setSelectedArtworkIdx(i)}
                      style={{
                        border: isActive ? `2px solid ${props.liveAccent}` : TEMPLATE.sectionBorder,
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left',
                      }}
                    >
                      {thumb ? (
                        <img src={thumb} alt={a.title || 'Werk'} style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <div style={{ width: '100%', aspectRatio: '1 / 1', display: 'grid', placeItems: 'center', color: props.liveMuted, fontSize: '0.75rem' }}>Kein Bild</div>
                      )}
                      <div style={{ padding: '0.35rem 0.45rem' }}>
                        <div style={{ fontSize: '0.72rem', color: isActive ? props.liveText : props.liveMuted }}>{a.number || ''}</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: props.liveText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title || 'Ohne Titel'}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
              <div id="shop-bereich" style={{ marginTop: '0.95rem', border: TEMPLATE.sectionBorder, borderRadius: 10, padding: '0.7rem 0.8rem', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: props.liveText, marginBottom: '0.25rem' }}>Shop</div>
                <div style={{ color: props.liveMuted, fontSize: '0.84rem', lineHeight: 1.45 }}>
                  Ausgewählte Werke aus den Bereichen können hier wie bei ök2 für den Shop-Bereich geführt werden.
                </div>
              </div>
            </>
          ) : (
            <div style={{ minHeight: 120, border: TEMPLATE.sectionBorder, borderRadius: 10, display: 'grid', placeItems: 'center', color: props.liveMuted }}>
              Noch keine Werke vorhanden.
            </div>
          )}
        </section>
      ) : null}

      <section
        id="social-events"
        style={{
          marginBottom: '1.4rem',
          background: TEMPLATE.sectionBg,
          border: TEMPLATE.sectionBorder,
          borderRadius: TEMPLATE.sectionRadius,
          padding: TEMPLATE.sectionPadding,
        }}
      >
        <h3 style={{ margin: '0 0 0.65rem', fontSize: '1.05rem', color: props.liveText, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: props.liveAccent, boxShadow: `0 0 0 4px ${props.liveAccent}22` }} />
          Social Media & Aktuelles
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.8rem' }}>
          <div style={{ border: TEMPLATE.sectionBorder, borderRadius: 10, padding: '0.7rem', background: 'rgba(255,255,255,0.03)', boxShadow: '0 10px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ margin: '-0.7rem -0.7rem 0.65rem', borderBottom: TEMPLATE.sectionBorder, padding: '0.55rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.45rem', background: `linear-gradient(90deg, ${props.liveAccent}16 0%, transparent 70%)` }}>
              <span aria-hidden style={{ fontSize: '0.95rem' }}>🌐</span>
              <span style={{ fontWeight: 700, color: props.liveText, fontSize: '0.9rem' }}>Sichtbarkeit & Kontakt</span>
            </div>
            <p style={{ margin: '0 0 0.7rem', color: props.liveMuted, fontSize: '0.9rem' }}>
              <strong style={{ color: props.liveText }}>Oeffnungszeiten:</strong> {displayOpeningHours}
              {showMusterSocial ? <span style={{ marginLeft: 6, opacity: 0.7 }}>(Muster)</span> : null}
            </p>
            <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
              {socialLinks.map((link) => (
                link.url ? (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" style={{ border: TEMPLATE.chipBorder, borderRadius: 999, padding: '0.35rem 0.75rem', textDecoration: 'none', color: props.liveText, background: '#fff' }}>{link.label}</a>
                ) : (
                  <span key={link.label} style={{ border: TEMPLATE.chipBorder, borderRadius: 999, padding: '0.35rem 0.75rem', color: props.liveMuted, background: 'rgba(255,255,255,0.05)' }}>{link.label} (Muster)</span>
                )
              ))}
            </div>
          </div>
          <div style={{ border: TEMPLATE.sectionBorder, borderRadius: 10, padding: '0.7rem', background: 'rgba(255,255,255,0.03)', boxShadow: '0 10px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ margin: '-0.7rem -0.7rem 0.65rem', borderBottom: TEMPLATE.sectionBorder, padding: '0.55rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.45rem', background: `linear-gradient(90deg, ${props.liveAccent}16 0%, transparent 70%)` }}>
              <span aria-hidden style={{ fontSize: '0.95rem' }}>🗓️</span>
              <span style={{ fontWeight: 700, color: props.liveText, fontSize: '0.9rem' }}>Naechste Termine</span>
            </div>
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              {displayEvents.map((event, idx) => (
                <article key={event.id || `${event.title || 'event'}-${idx}`} style={{ border: TEMPLATE.sectionBorder, borderRadius: 10, padding: '0.55rem 0.65rem', background: 'rgba(255,255,255,0.02)', borderLeft: `3px solid ${props.liveAccent}66` }}>
                  <div style={{ fontWeight: 700, color: props.liveText, fontSize: '0.9rem' }}>{event.title || 'Event'}</div>
                  {(event.date || event.endDate) ? (
                    <div style={{ marginTop: '0.2rem', color: props.liveMuted, fontSize: '0.82rem' }}>
                      {event.date || ''}{event.endDate ? ` bis ${event.endDate}` : ''}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {zoomImageSrc ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomImageSrc('')}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8,10,14,0.86)',
            zIndex: 1000,
            display: 'grid',
            placeItems: 'center',
            padding: '1rem',
          }}
        >
          <img
            src={zoomImageSrc}
            alt="Werkansicht"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '96vw', maxHeight: '92vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}
          />
          <button
            type="button"
            onClick={() => setZoomImageSrc('')}
            style={{
              position: 'fixed',
              top: 14,
              right: 14,
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              padding: '0.38rem 0.75rem',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Schließen ✕
          </button>
        </div>
      ) : null}

      <section id="admin" style={{ display: 'none' }} aria-hidden />

      <section id="impressum" style={{ marginTop: 'auto', borderTop: TEMPLATE.sectionBorder, paddingTop: '1.05rem', color: props.liveMuted, fontSize: '0.88rem', lineHeight: 1.5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'start' }}>
          <div>
            <h3 style={{ margin: '0 0 0.6rem', color: props.liveText, fontSize: '1rem' }}>Impressum</h3>
            <p style={{ margin: '0 0 0.35rem', fontWeight: 600 }}>{props.impressumName || props.title}</p>
            {props.impressumAddress ? (
              <p style={{ margin: '0 0 0.3rem' }}>
                📍 <a href={props.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: props.liveAccent, textDecoration: 'none' }}>{props.impressumAddress}</a>
                {' · '}
                <a href={props.mapsUrl ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(props.impressumAddress)}` : '#'} target="_blank" rel="noopener noreferrer" style={{ color: props.liveAccent, textDecoration: 'none' }}>
                  🗺️ Routenplaner (Google)
                </a>
              </p>
            ) : null}
            {props.contactName1 ? <p style={{ margin: '0 0 0.25rem' }}>{props.contactName1}{props.contactPhone1 ? ` · 📞 ${props.contactPhone1}` : ''}</p> : null}
            {props.contactName2 ? <p style={{ margin: '0 0 0.25rem' }}>{props.contactName2}{props.contactPhone2 ? ` · 📞 ${props.contactPhone2}` : ''}</p> : null}
            {props.impressumPhone ? <p style={{ margin: '0 0 0.3rem' }}>📞 {props.impressumPhone}</p> : null}
            {props.impressumEmail ? (
              <p style={{ margin: '0 0 0.5rem' }}>
                ✉️ <a href={`mailto:${props.impressumEmail}`} style={{ color: props.liveAccent, textDecoration: 'none' }}>{props.impressumEmail}</a>
              </p>
            ) : null}
            {props.openingHours ? (
              <p style={{ margin: '0.65rem 0 0.5rem', color: props.liveMuted, lineHeight: 1.5 }}>
                🕐 <span style={{ color: props.liveAccent, fontWeight: 600, whiteSpace: 'pre-line' }}>{props.openingHours}</span>
              </p>
            ) : null}
          </div>
          {props.qrDataUrl ? (
            <div style={{ textAlign: 'center', justifySelf: 'end' }}>
              <div style={{ background: '#fff', padding: '0.35rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', display: 'inline-block' }}>
                <img src={props.qrDataUrl} alt={`QR-Code: ${props.title}`} style={{ width: 100, height: 100, display: 'block' }} />
              </div>
            </div>
          ) : null}
        </div>
        <p style={{ margin: '0.6rem 0 0', fontSize: '0.8rem', color: props.liveMuted }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.76rem', color: props.liveMuted }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
      </section>
    </main>
  )
}
