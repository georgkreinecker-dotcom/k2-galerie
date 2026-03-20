/**
 * Künstler-Einstieg (Variante B): Wer /mein-bereich nutzt (von Galerie, QR, Links), kommt hierher.
 * K2, ök2, VK2: sofort in den Admin weiterleiten – keine Zwischenseite („Künstler-Bereich“ / „Demo-Admin“).
 */
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

type Context = 'k2' | 'oeffentlich' | 'vk2'

export default function MeinBereichPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const contextParam = searchParams.get('context') as Context | null
  const context: Context = contextParam === 'oeffentlich' || contextParam === 'vk2' ? contextParam : 'k2'

  // Alle: sofort in den Admin – keine Zwischenseite. embedded=1 mitnehmen, damit Admin in APf-iPhone-iframe lädt.
  useEffect(() => {
    const tab = searchParams.get('tab')
    const from = searchParams.get('from')
    const assistent = searchParams.get('assistent')
    const vorname = searchParams.get('vorname')
    const pfad = searchParams.get('pfad')
    const guidetab = searchParams.get('guidetab')
    const guidesubtab = searchParams.get('guidesubtab')
    const embedded = searchParams.get('embedded')
    const parts: string[] = []
    if (context !== 'k2') parts.push(`context=${context}`)
    if (embedded === '1') parts.push('embedded=1')
    if (tab) parts.push(`tab=${encodeURIComponent(tab)}`)
    if (from) parts.push(`from=${encodeURIComponent(from)}`)
    if (assistent) parts.push(`assistent=${encodeURIComponent(assistent)}`)
    if (vorname) parts.push(`vorname=${encodeURIComponent(vorname)}`)
    if (pfad) parts.push(`pfad=${encodeURIComponent(pfad)}`)
    if (guidetab) parts.push(`guidetab=${encodeURIComponent(guidetab)}`)
    if (guidesubtab) parts.push(`guidesubtab=${encodeURIComponent(guidesubtab)}`)
    try {
      sessionStorage.setItem('k2-admin-context', context)
    } catch (_) {}

    const qs = parts.length ? '?' + parts.join('&') : ''
    navigate('/admin' + qs, { replace: true })
  }, [context, navigate, searchParams])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a0f0a', color: '#fff5f0', fontFamily: 'system-ui' }}>
      <p style={{ fontSize: '0.95rem' }}>Weiterleitung in den Admin …</p>
    </div>
  )
}
