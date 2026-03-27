import React from 'react'
import { safeExternalHref } from '../utils/socialExternalUrls'

export type GalerieSocialLinksVariant = 'oek2' | 'darkOnHero' | 'vk2Warm'

type Props = {
  youtubeUrl?: string
  instagramUrl?: string
  featuredVideoUrl?: string
  variant: GalerieSocialLinksVariant
}

/**
 * Öffentliche Links zu YouTube / Instagram / optionalem Highlight-Video (nur https, kein Embed).
 * Eine Komponente für K2-, ök2- und VK2-Galerie.
 */
export function GalerieSocialLinks({ youtubeUrl, instagramUrl, featuredVideoUrl, variant }: Props) {
  const y = safeExternalHref(youtubeUrl)
  const i = safeExternalHref(instagramUrl)
  const f = safeExternalHref(featuredVideoUrl)
  if (!y && !i && !f) return null

  const linkBase = (kind: 'primary' | 'secondary'): React.CSSProperties => {
    if (variant === 'oek2') {
      return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '0.45rem 0.85rem',
        borderRadius: 10,
        fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
        fontWeight: 600,
        textDecoration: 'none',
        border:
          kind === 'primary' ? '1px solid rgba(107, 144, 128, 0.45)' : '1px solid rgba(90,122,110,0.25)',
        background: kind === 'primary' ? 'rgba(107, 144, 128, 0.12)' : 'rgba(255,255,255,0.6)',
        color: '#1c1a18',
      }
    }
    if (variant === 'vk2Warm') {
      return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '0.45rem 0.85rem',
        borderRadius: 10,
        fontSize: '0.95rem',
        fontWeight: 600,
        textDecoration: 'none',
        border: `1px solid ${kind === 'primary' ? '#c0562a' : '#e8e2da'}`,
        background: kind === 'primary' ? '#fdf6e8' : '#ffffff',
        color: '#1c1a18',
      }
    }
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '0.45rem 0.85rem',
      borderRadius: 10,
      fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
      fontWeight: 600,
      textDecoration: 'none',
      border: '1px solid rgba(255,255,255,0.25)',
      background: 'rgba(255,255,255,0.08)',
      color: 'rgba(255,255,255,0.95)',
    }
  }

  const labelColor =
    variant === 'darkOnHero' ? 'rgba(255,255,255,0.65)' : variant === 'oek2' ? 'var(--k2-muted)' : '#5c5650'

  return (
    <div style={{ marginTop: 'clamp(0.75rem, 2vw, 1.25rem)' }} data-testid="galerie-social-links">
      <p
        style={{
          margin: '0 0 0.5rem',
          fontSize: '0.72rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: labelColor,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Social & Videos
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {y && (
          <a href={y} target="_blank" rel="noopener noreferrer" style={linkBase('primary')}>
            YouTube
          </a>
        )}
        {i && (
          <a href={i} target="_blank" rel="noopener noreferrer" style={linkBase('primary')}>
            Instagram
          </a>
        )}
        {f && (
          <a href={f} target="_blank" rel="noopener noreferrer" style={linkBase('secondary')}>
            Highlight-Video
          </a>
        )}
      </div>
    </div>
  )
}
