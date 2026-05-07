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
import { FOCUS_DIRECTIONS, MUSTER_ARTWORKS, getWelcomeIntroForFocusDirections, type FocusDirectionId } from '../config/tenantConfig'
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
      <header
        style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          background: '#fff',
          border: '1px solid #ddd2c4',
          borderRadius: 14,
          padding: '1.1rem 1rem',
        }}
      >
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1f1a15', margin: 0 }}>{title}</h1>
        <p style={{ color: '#4b433c', margin: '0.45rem 0 0', fontWeight: 600 }}>{subtext}</p>
        <p style={{ color: '#3f3933', maxWidth: 700, margin: '0.8rem auto 0', lineHeight: 1.6 }}>{intro}</p>
      </header>
      <section
        style={{
          marginBottom: '1.5rem',
          background: '#fff',
          border: '1px solid #ddd2c4',
          borderRadius: 14,
          padding: '0.9rem',
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
      <p style={{ textAlign: 'center' }}>
        <a href={adminUrl} style={{ color: 'var(--k2-accent)', fontSize: '0.95rem' }}>
          Galerie bearbeiten →
        </a>
      </p>
    </main>
  )
}
