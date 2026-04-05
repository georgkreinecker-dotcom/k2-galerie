/**
 * Highlight-Video (Stammdaten) → eingebettete Wiedergabe für APf-Vorschau (YouTube / direkte Datei).
 * Keine zweite Wahrheit: URL = dieselbe wie in loadStammdaten('oeffentlich','gallery').socialFeaturedVideoUrl
 */
import { safeExternalHref } from './socialExternalUrls'

export type FeaturedVideoEmbed =
  | { kind: 'youtube'; src: string }
  | { kind: 'direct'; src: string }

export function videoUrlToFeaturedEmbed(raw: string | undefined): FeaturedVideoEmbed | null {
  const safe = safeExternalHref(raw)
  if (!safe) return null
  try {
    const u = new URL(safe)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0]
      if (id && /^[a-zA-Z0-9_-]{6,}$/.test(id)) {
        return { kind: 'youtube', src: `https://www.youtube.com/embed/${id}?rel=0` }
      }
    }
    if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (u.pathname.startsWith('/embed/')) {
        return { kind: 'youtube', src: safe }
      }
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.split('/')[2]
        if (id && /^[a-zA-Z0-9_-]{6,}$/.test(id)) {
          return { kind: 'youtube', src: `https://www.youtube.com/embed/${id}?rel=0` }
        }
      }
      const v = u.searchParams.get('v')
      if (v && /^[a-zA-Z0-9_-]{6,}$/.test(v)) {
        return { kind: 'youtube', src: `https://www.youtube.com/embed/${v}?rel=0` }
      }
    }
  } catch {
    return null
  }
  const lower = safe.toLowerCase()
  if (
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.includes('.mp4?') ||
    lower.includes('.webm?')
  ) {
    return { kind: 'direct', src: safe }
  }
  return null
}
