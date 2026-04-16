/**
 * Musterfamilie Huber: kurze Feld-/Bereichserklärung bei Hover über [data-muster-hint].
 * Nur aktiv wenn active=true; root = Spalte mit Nav + Toolbar + Hauptinhalt.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Ctx = {
  hoverHint: string | null
}

const FamilieMusterDemoHintContext = createContext<Ctx | null>(null)

export function FamilieMusterDemoHintProvider({
  active,
  root,
  children,
}: {
  active: boolean
  root: HTMLElement | null
  children: ReactNode
}) {
  const [hoverHint, setHoverHint] = useState<string | null>(null)

  useEffect(() => {
    if (!active || !root) {
      setHoverHint(null)
      return
    }

    const readHint = (target: EventTarget | null) => {
      const el = target as Element | null
      const t = el?.closest?.('[data-muster-hint]')
      const h = t?.getAttribute('data-muster-hint')
      setHoverHint(h && h.trim() ? h.trim() : null)
    }

    const onMouseOver = (e: MouseEvent) => readHint(e.target)
    const onMouseLeave = (e: MouseEvent) => {
      const rel = e.relatedTarget as Node | null
      if (rel && root.contains(rel)) return
      setHoverHint(null)
    }

    root.addEventListener('mouseover', onMouseOver)
    root.addEventListener('mouseleave', onMouseLeave)
    return () => {
      root.removeEventListener('mouseover', onMouseOver)
      root.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [active, root])

  return (
    <FamilieMusterDemoHintContext.Provider value={{ hoverHint }}>{children}</FamilieMusterDemoHintContext.Provider>
  )
}

export function useFamilieMusterDemoHint(): Ctx | null {
  return useContext(FamilieMusterDemoHintContext)
}
