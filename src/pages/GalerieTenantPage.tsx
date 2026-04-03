/**
 * Öffentliche Galerie-Ansicht für einen Mandanten (tenantId aus URL).
 * Route: /g/:tenantId
 * Lädt gallery-data?tenantId= und zeigt die Galerie oder „Jetzt gestalten“ + Admin-Link.
 *
 * Besucherzähler: Smoke-Test für Lizenz-Mandanten → docs/SMOKE-BESUCHERZAEHLER-LIZENZ.md
 */
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { reportPublicGalleryVisit } from '../utils/reportPublicGalleryVisit'
import '../App.css'

const SAFE_TENANT_ID = /^[a-z0-9-]{1,64}$/

export default function GalerieTenantPage() {
  const { tenantId } = useParams<{ tenantId: string }>()
  const [data, setData] = useState<{
    artworks?: Array<{ number?: string; title?: string; imageRef?: string; image?: string }>
    pageTexts?: { galerie?: { heroTitle?: string } }
    designSettings?: Record<string, string>
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

  const adminUrl = `/admin?tenantId=${encodeURIComponent(tenantId || '')}`

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

  if (error || !data) {
    return (
      <main style={{ maxWidth: 560, margin: '3rem auto', padding: '1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Deine Galerie</h1>
        <p style={{ color: 'var(--k2-muted)', marginBottom: '1.5rem' }}>
          Noch keine Inhalte – gestalte deine Galerie im Admin.
        </p>
        <a href={adminUrl} className="btn primary-btn" style={{ display: 'inline-block' }}>
          Galerie gestalten
        </a>
      </main>
    )
  }

  const artworks = Array.isArray(data.artworks) ? data.artworks : []
  const title = data.pageTexts?.galerie?.heroTitle?.trim() || 'Galerie'

  return (
    <main className="galerie-tenant-page" style={{ maxWidth: 900, margin: '0 auto', padding: '1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--k2-fg, #1a1a1a)' }}>{title}</h1>
      </header>
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
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {(a.imageRef || a.image) && (
                <img
                  src={a.imageRef || a.image || ''}
                  alt=""
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: '0.75rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--k2-muted)' }}>{a.number || ''}</div>
                <div style={{ fontWeight: 600, color: 'var(--k2-fg, #1a1a1a)' }}>{a.title || 'Ohne Titel'}</div>
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
