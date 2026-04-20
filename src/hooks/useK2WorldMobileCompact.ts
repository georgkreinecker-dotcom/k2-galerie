import { useEffect, useState } from 'react'

/**
 * Einheitlicher Handy-Breakpoint für K2-Welt (Galerie, ök2, VK2, K2 Familie):
 * kompakte Nav / Menü-Sheet ab dieser Breite.
 */
export const K2_WORLD_MOBILE_MAX_WIDTH_PX = 768

/** Gleiche Media-Query wie `.k2-familie-nav`-Handy-Styles und `K2_WORLD_MOBILE_NAV` in App.css */
export const K2_WORLD_MOBILE_COMPACT_MQ = `(max-width: ${K2_WORLD_MOBILE_MAX_WIDTH_PX}px)`

export function useK2WorldMobileCompact(): boolean {
  const [compact, setCompact] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia(K2_WORLD_MOBILE_COMPACT_MQ)
    const apply = () => setCompact(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return compact
}
