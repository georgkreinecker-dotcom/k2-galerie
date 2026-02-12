import type { ReactNode } from 'react'

/**
 * Setzt das ök2-Farbschema (Wohlbefinden/Verweildauer) per CSS-Klasse,
 * sodass GaleriePage und GalerieVorschauPage das helle Theme anzeigen.
 * Variablen stehen in index.css unter .ok2-theme – kein inline-style nötig (vermeidet Ladeprobleme).
 */
export function Ok2ThemeWrapper({ children }: { children: ReactNode }) {
  return (
    <div
      className="ok2-theme"
      style={{
        background: 'var(--k2-bg-1)',
        color: 'var(--k2-text)',
        minHeight: '100vh',
      }}
    >
      {children}
    </div>
  )
}
