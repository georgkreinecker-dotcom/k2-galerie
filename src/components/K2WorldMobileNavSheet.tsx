import React from 'react'

export type K2WorldMobileNavSheetProps = {
  open: boolean
  onClose: () => void
  /** z. B. „Bereiche“, „Vereinsseite“ – auch aria-label */
  title: string
  /** z. B. k2-familie-nav-mobile-sheet – muss zum Menü-Button aria-controls passen */
  panelId?: string
  children: React.ReactNode
  /** Optional: zusätzliche Klasse am Root (z. B. Print ausblenden) */
  className?: string
}

/**
 * Vollbild-Overlay + Bottom-Panel – ein Standard für K2-Welt-Handy-Navigation.
 * Styles: `App.css` (`.k2-world-mobile-nav-sheet`, …) – gleicher Breakpoint wie `useK2WorldMobileCompact`.
 */
export function K2WorldMobileNavSheet({
  open,
  onClose,
  title,
  panelId = 'k2-world-mobile-nav-sheet',
  children,
  className = '',
}: K2WorldMobileNavSheetProps) {
  if (!open) return null

  return (
    <div
      id={panelId}
      className={`k2-world-mobile-nav-sheet ${className}`.trim()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button type="button" className="k2-world-mobile-nav-backdrop" aria-label="Menü schließen" onClick={onClose} />
      <div className="k2-world-mobile-nav-panel">
        <div className="k2-world-mobile-nav-panel__header">
          <span className="k2-world-mobile-nav-panel__title">{title}</span>
          <button type="button" className="k2-world-mobile-nav-panel__close" onClick={onClose}>
            Schließen
          </button>
        </div>
        <div className="k2-world-mobile-nav-panel__body">{children}</div>
      </div>
    </div>
  )
}
