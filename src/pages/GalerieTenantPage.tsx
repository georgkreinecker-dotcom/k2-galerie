/**
 * Öffentliche Galerie-Ansicht für einen Mandanten (tenantId aus URL).
 * Route: /g/:tenantId
 * Lädt gallery-data?tenantId= und zeigt die Galerie oder „Jetzt gestalten“ + Admin-Link.
 *
 * Besucherzähler: Smoke-Test für Lizenz-Mandanten → docs/SMOKE-BESUCHERZAEHLER-LIZENZ.md
 */
import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { reportPublicGalleryVisit } from '../utils/reportPublicGalleryVisit'
import { FOCUS_DIRECTIONS, MUSTER_ARTWORKS, PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG, getWelcomeIntroForFocusDirections, type FocusDirectionId } from '../config/tenantConfig'
import '../App.css'

const SAFE_TENANT_ID = /^[a-z0-9-]{1,64}$/
const DEFAULT_FOCUS_DIRECTION: FocusDirectionId = 'kunst'
type TenantGalleryArtwork = { number?: string; title?: string; imageRef?: string; image?: string; imageUrl?: string }

function normalizeFocusDirection(raw: string | null): FocusDirectionId {
  const value = String(raw || '').trim().toLowerCase()
  return (FOCUS_DIRECTIONS.some((d) => d.id === value) ? value : DEFAULT_FOCUS_DIRECTION) as FocusDirectionId
}

export default function GalerieTenantPage() {
  const { tenantId } = useParams<{ tenantId: string }>()
  const [searchParams] = useSearchParams()
  const focusDirection = normalizeFocusDirection(searchParams.get('focusDirection'))
  const [data, setData] = useState<{
    artworks?: TenantGalleryArtwork[]
    gallery?: Record<string, unknown>
    martina?: Record<string, unknown>
    georg?: Record<string, unknown>
    pageTexts?: { galerie?: { heroTitle?: string; welcomeSubtext?: string; welcomeIntroText?: string } }
    designSettings?: Record<string, string>
    pageContentGalerie?: string | { welcomeImage?: string }
    pageContent?: string | { welcomeImage?: string }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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
    fetch(`/api/gallery-data?tenantId=${encodeURIComponent(tenantId)}`)
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

  const adminUrl = `/admin?tenantId=${encodeURIComponent(tenantId || '')}&focusDirection=${encodeURIComponent(focusDirection)}`

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
  const rawTitle = data?.pageTexts?.galerie?.heroTitle?.trim() || ''
  const rawSubtext = data?.pageTexts?.galerie?.welcomeSubtext?.trim() || ''
  const rawIntro = data?.pageTexts?.galerie?.welcomeIntroText?.trim() || ''
  const title = rawTitle === 'K2 Galerie' ? 'Meine Galerie' : (rawTitle || 'Meine Galerie')
  const subtext = rawSubtext === 'Kunst & Keramik – Martina und Georg Kreinecker' ? focusLabel : (rawSubtext || focusLabel)
  const intro = rawIntro === 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.'
    ? getWelcomeIntroForFocusDirections([focusDirection])
    : (rawIntro || getWelcomeIntroForFocusDirections([focusDirection]))
  const pageContentRaw = data?.pageContentGalerie ?? data?.pageContent
  const parsedPageContent = typeof pageContentRaw === 'string'
    ? (() => { try { return JSON.parse(pageContentRaw) } catch { return {} } })()
    : (pageContentRaw || {})
  const welcomeImage = typeof parsedPageContent === 'object' && parsedPageContent != null
    ? String((parsedPageContent as { welcomeImage?: string }).welcomeImage || '').trim()
    : ''
  const galleryStamm = (data?.gallery && typeof data.gallery === 'object') ? data.gallery as Record<string, unknown> : {}
  const martinaStamm = (data?.martina && typeof data.martina === 'object') ? data.martina as Record<string, unknown> : {}
  const georgStamm = (data?.georg && typeof data.georg === 'object') ? data.georg as Record<string, unknown> : {}
  const impressumEmail = String(galleryStamm.email || martinaStamm.email || georgStamm.email || '').trim()
  const impressumPhone = String(galleryStamm.phone || martinaStamm.phone || georgStamm.phone || '').trim()
  const impressumAddress = [
    String(galleryStamm.address || '').trim(),
    String(galleryStamm.zip || '').trim(),
    String(galleryStamm.city || '').trim(),
    String(galleryStamm.country || '').trim(),
  ].filter(Boolean).join(', ')
  const mapsUrl = impressumAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(impressumAddress)}` : ''

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/g/${encodeURIComponent(tenantId)}?focusDirection=${encodeURIComponent(focusDirection)}`
    : `/g/${encodeURIComponent(tenantId)}?focusDirection=${encodeURIComponent(focusDirection)}`
  const TEMPLATE = {
    maxWidth: 1000,
    sectionRadius: 14,
    sectionBorder: '1px solid #ddd2c4',
    sectionBg: '#fff',
    sectionPadding: '1rem',
    chipBorder: '1px solid #d7c9ba',
    chipBg: '#fffefb',
    chipColor: '#5a4738',
  }
  const handleShare = async () => {
    const shareText = `${title} – ${subtext}`
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title, text: shareText, url: shareUrl })
        return
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link kopiert.')
        return
      }
    } catch {
      // Fallback unten
    }
    if (typeof window !== 'undefined') window.prompt('Link kopieren:', shareUrl)
  }

  return (
    <main
      className="galerie-tenant-page"
      style={{
        maxWidth: 980,
        margin: '0 auto',
        padding: '1.25rem',
        minHeight: '100vh',
        background: '#f4efe8',
        color: '#1f1a15',
      }}
    >
      <div style={{ position: 'fixed', top: '0.9rem', left: '1rem', zIndex: 30 }}>
        <Link to="/" style={{ color: '#6b5848', textDecoration: 'none', fontSize: '0.86rem', fontWeight: 600 }}>
          {PRODUCT_BRAND_NAME} ©
        </Link>
      </div>
      <div style={{ position: 'fixed', top: '0.9rem', right: '1rem', zIndex: 30, display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => { void handleShare() }}
          style={{
            border: '1px solid #d1c0ae',
            background: '#fff',
            color: '#5f4c3d',
            borderRadius: 999,
            padding: '0.42rem 0.7rem',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          📤 Teilen
        </button>
        <a
          href={adminUrl}
          style={{
            border: '1px solid #d1c0ae',
            background: '#fff',
            color: '#5f4c3d',
            borderRadius: 999,
            padding: '0.42rem 0.7rem',
            fontSize: '0.82rem',
            textDecoration: 'none',
          }}
        >
          🔐 Admin
        </a>
      </div>
      <header
        id="start"
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          background: TEMPLATE.sectionBg,
          border: TEMPLATE.sectionBorder,
          borderRadius: TEMPLATE.sectionRadius,
          padding: '1.1rem 1.05rem',
        }}
      >
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1f1a15', margin: 0 }}>{title}</h1>
        <p style={{ color: '#4b433c', margin: '0.45rem 0 0', fontWeight: 600 }}>{subtext}</p>
        <p style={{ color: '#3f3933', maxWidth: 700, margin: '0.8rem auto 0', lineHeight: 1.6 }}>{intro}</p>
      </header>
      <nav
        aria-label="Seitenbereiche"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.55rem',
          margin: '0 0 1.1rem',
        }}
      >
        {[
          { href: '#willkommen', label: 'Willkommen' },
          { href: '#werke', label: 'Werke' },
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
              color: TEMPLATE.chipColor,
              borderRadius: 999,
              padding: '0.34rem 0.74rem',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <section
        id="willkommen"
        style={{
          marginBottom: '1.5rem',
          background: TEMPLATE.sectionBg,
          border: TEMPLATE.sectionBorder,
          borderRadius: TEMPLATE.sectionRadius,
          padding: TEMPLATE.sectionPadding,
        }}
      >
        {welcomeImage ? (
          <img
            src={welcomeImage}
            alt="Willkommensbild"
            style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 10, display: 'block' }}
          />
        ) : (
          <div
            style={{
              minHeight: 140,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #efe4d7, #f8f2e8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6a5f54',
              fontWeight: 600,
            }}
          >
            Willkommen in meiner Galerie
          </div>
        )}
      </section>
      {isMusterStart && (
        <p style={{ textAlign: 'center', color: '#5f564d', margin: '-0.3rem 0 1.2rem', fontWeight: 600 }}>
          Muster-Erstgalerie – ersetze diese Beispiele im Admin durch deine eigenen Inhalte.
        </p>
      )}
      <section
        id="werke"
        style={{
          background: TEMPLATE.sectionBg,
          border: TEMPLATE.sectionBorder,
          borderRadius: TEMPLATE.sectionRadius,
          padding: TEMPLATE.sectionPadding,
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ margin: '0 0 0.85rem', fontSize: '1.08rem', color: '#1f1a15' }}>Werke</h2>
      {artworks.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--k2-muted)', marginBottom: '1.5rem' }}>
          Noch keine Werke – im Admin hinzufügen.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {artworks.map((a, i) => (
            <div
              key={a.number || i}
              style={{
                background: 'var(--k2-card-bg, #fff)',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                border: '1px solid #ddd2c4',
              }}
            >
              {(a.imageRef || a.image || a.imageUrl) && (
                <img
                  src={a.imageRef || a.image || a.imageUrl || ''}
                  alt=""
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: '0.75rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#5f564d' }}>{a.number || ''}</div>
                <div style={{ fontWeight: 700, color: '#1f1a15' }}>{a.title || 'Ohne Titel'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      </section>
      <section
        id="admin"
        style={{
          marginBottom: '2.2rem',
          background: TEMPLATE.sectionBg,
          border: TEMPLATE.sectionBorder,
          borderRadius: TEMPLATE.sectionRadius,
          padding: TEMPLATE.sectionPadding,
          textAlign: 'center',
        }}
      >
        <h2 style={{ margin: '0 0 0.55rem', fontSize: '1.08rem', color: '#1f1a15' }}>Admin-Zugang</h2>
        <p style={{ margin: '0 0 0.75rem', color: '#5f564d', fontSize: '0.93rem' }}>
          Inhalte, Design und Stammdaten pflegen.
        </p>
      <p style={{ textAlign: 'center', marginBottom: 0 }}>
        <a href={adminUrl} style={{ color: 'var(--k2-accent)', fontSize: '0.95rem' }}>
          Galerie bearbeiten →
        </a>
      </p>
      </section>
      <section
        id="impressum"
        style={{
          marginTop: '0.5rem',
          borderTop: TEMPLATE.sectionBorder,
          paddingTop: '1.05rem',
          color: '#5d544c',
          fontSize: '0.88rem',
          lineHeight: 1.5,
        }}
      >
        <h3 style={{ margin: '0 0 0.6rem', color: '#1f1a15', fontSize: '1rem' }}>Impressum</h3>
        <p style={{ margin: '0 0 0.35rem', fontWeight: 600 }}>{title}</p>
        {impressumAddress ? (
          <p style={{ margin: '0 0 0.3rem' }}>
            📍 <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#7a4f34', textDecoration: 'none' }}>{impressumAddress}</a>
          </p>
        ) : null}
        {impressumPhone ? <p style={{ margin: '0 0 0.3rem' }}>📞 {impressumPhone}</p> : null}
        {impressumEmail ? (
          <p style={{ margin: '0 0 0.5rem' }}>
            ✉️ <a href={`mailto:${impressumEmail}`} style={{ color: '#7a4f34', textDecoration: 'none' }}>{impressumEmail}</a>
          </p>
        ) : null}
        <p style={{ margin: '0.6rem 0 0', fontSize: '0.8rem', color: '#7f756d' }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.76rem', color: '#8b8179' }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
      </section>
    </main>
  )
}
