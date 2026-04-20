import { useCallback, useEffect, useState } from 'react'

/**
 * Standard für „Menü“-Overlays auf dem Handy: Schließen bei Routenwechsel, Escape, Scroll-Lock.
 * Eine Implementierung – Aufrufer: K2 Familie Nav, VK2-Galerie, …
 */
export function useK2WorldMobileNavSheet(pathname: string, search: string) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname, search])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return { menuOpen, setMenuOpen, closeMenu }
}
