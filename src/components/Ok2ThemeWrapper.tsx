import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

const KEY_OEF_DESIGN = 'k2-oeffentlich-design-settings'

/**
 * Setzt das ök2-Farbschema: Klasse .ok2-theme (Standard aus index.css).
 * Wenn im Admin gespeichertes Design existiert (k2-oeffentlich-design-settings),
 * werden diese Variablen als Inline-Style angewendet → Kundenansicht = Design-Arbeitsansicht.
 */
export function Ok2ThemeWrapper({ children }: { children: ReactNode }) {
  const [styleOverrides, setStyleOverrides] = useState<React.CSSProperties | null>(null)

  useEffect(() => {
    let cancelled = false
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(KEY_OEF_DESIGN) : null
      if (raw && raw.length > 0 && raw.length < 50000) {
        const d = JSON.parse(raw) as Record<string, string>
        if (d && typeof d === 'object' && (d.accentColor || d.backgroundColor1)) {
          if (!cancelled) {
            setStyleOverrides({
              ['--k2-bg-1' as string]: d.backgroundColor1 ?? '',
              ['--k2-bg-2' as string]: d.backgroundColor2 ?? '',
              ['--k2-bg-3' as string]: d.backgroundColor3 ?? '',
              ['--k2-text' as string]: d.textColor ?? '',
              ['--k2-muted' as string]: d.mutedColor ?? '',
              ['--k2-accent' as string]: d.accentColor ?? '',
              ['--k2-card-bg-1' as string]: d.cardBg1 ?? '',
              ['--k2-card-bg-2' as string]: d.cardBg2 ?? '',
              minHeight: '100vh',
            } as React.CSSProperties)
          }
        } else if (!cancelled) {
          setStyleOverrides({ minHeight: '100vh' })
        }
      } else if (!cancelled) {
        setStyleOverrides({ minHeight: '100vh' })
      }
    } catch (_) {
      if (!cancelled) setStyleOverrides({ minHeight: '100vh' })
    }
    return () => { cancelled = true }
  }, [])

  return (
    <div
      className="ok2-theme"
      style={{
        background: 'var(--k2-bg-1)',
        color: 'var(--k2-text)',
        minHeight: '100vh',
        ...styleOverrides,
      }}
  >
      {children}
    </div>
  )
}
