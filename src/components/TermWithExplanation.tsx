/**
 * Fachbegriff mit Erklärung – Klick auf den Begriff öffnet die Erklärung (auf Wunsch).
 * Für mök2 und alle Seiten, wo Kunden Fachbegriffe verstehen sollen.
 */

import { useState, useRef, useEffect } from 'react'

/** Erklärungen für Fachbegriffe (einheitlich in der App). */
export const TERM_EXPLANATIONS: Record<string, string> = {
  'White-Label': 'Die Software wird unter deinem eigenen Namen und mit deinem Logo angeboten – z. B. „Galerie XYZ“ statt „K2 Galerie“. Ideal für Galerien oder Partner, die ihr eigenes Branding wollen.',
  'Custom Domain': 'Deine Galerie erreichst du unter deiner eigenen Webadresse (z. B. galerie-meinname.at) statt über eine gemeinsame Plattform-URL.',
  'API': 'Technische Schnittstelle, über die andere Programme (z. B. Buchhaltung, eigene Website) auf deine Galerie-Daten zugreifen können – für fortgeschrittene Anbindungen.',
  'Dedicated Support': 'Ein fester Ansprechpartner für dich, z. B. per E-Mail oder Telefon, mit vereinbarten Reaktionszeiten – kein allgemeines Support-Portal.',
  'Standard-URL': 'Die Galerie ist über eine Adresse der Plattform erreichbar (z. B. k2-galerie.vercel.app/deine-galerie), inkl. eigenem QR-Code.',
}

interface TermWithExplanationProps {
  term: string
  /** Fehlt, wird TERM_EXPLANATIONS[term] verwendet. */
  explanation?: string
  /** Optional: Stil für den klickbaren Begriff */
  style?: React.CSSProperties
}

/** Wenn explanation weggelassen wird, wird TERM_EXPLANATIONS[term] verwendet. */
export default function TermWithExplanation({ term, explanation = TERM_EXPLANATIONS[term] ?? 'Erklärung folgt.', style }: TermWithExplanationProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', close, true)
    return () => document.removeEventListener('click', close, true)
  }, [open])

  return (
    <span ref={containerRef} style={{ position: 'relative', display: 'inline' }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'inherit',
          font: 'inherit',
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          textUnderlineOffset: '2px',
          ...style,
        }}
        title="Klicken für Erklärung"
      >
        {term}
      </button>
      {open && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            left: 0,
            top: '100%',
            marginTop: '0.25rem',
            zIndex: 1000,
            maxWidth: 320,
            padding: '0.6rem 0.75rem',
            background: 'var(--k2-bg-1, #1a0f0a)',
            border: '1px solid var(--k2-accent, #5ffbf1)',
            borderRadius: 8,
            fontSize: '0.85rem',
            lineHeight: 1.5,
            color: 'var(--k2-text, #fff5f0)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {explanation}
        </span>
      )}
    </span>
  )
}
