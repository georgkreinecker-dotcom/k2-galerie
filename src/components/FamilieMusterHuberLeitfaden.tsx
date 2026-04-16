/**
 * Musterfamilie Huber: geführter Leitfaden durch die App (Demo).
 * Kein Werbeslogan als erster Eindruck – ehrliche Einordnung + Funktionen, dann Entscheid für eigene Familie.
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminTheme } from '../config/theme'
import { PROJECT_ROUTES } from '../config/navigation'
import { K2_FAMILIE_APP_SHORT_PATH } from '../utils/k2FamiliePwaBranding'
import { K2_FAMILIE_NAV_LABEL_GESCHICHTE } from '../config/k2FamilieNavLabels'
import { isK2FamilieApfLocalhost } from '../config/k2FamilieApfDefaults'

const t = adminTheme
const R = PROJECT_ROUTES['k2-familie']

const LS_LEITFADEN_ABGESCHLOSSEN = 'k2-familie-muster-huber-leitfaden-abgeschlossen'

export type FamilieMusterLeitfadenStep = {
  id: string
  titel: string
  text: string
  linkTo?: string
  linkLabel?: string
}

export const FAMILIE_MUSTER_LEITFADEN_SCHRITTE: FamilieMusterLeitfadenStep[] = [
  {
    id: 'einordnung',
    titel: 'Musterfamilie Huber',
    text:
      'Du bist in einer **Demo** mit erfundenen Daten – die Familie Huber existiert nur zum Ausprobieren. ' +
      'Das ist noch **kein** privater Raum für echte Familienangaben. ' +
      'So kannst du die Bedienung kennenlernen, ohne etwas Preisgeben zu müssen.',
  },
  {
    id: 'home',
    titel: 'Meine Familie',
    text:
      'Die Startseite mit Willkommensbereich und Überblick. Später – mit eurer eigenen Familie – ist das der tägliche Einstieg in **euren** geschützten Bereich.',
    linkTo: K2_FAMILIE_APP_SHORT_PATH,
    linkLabel: 'Zur Startseite',
  },
  {
    id: 'stammbaum',
    titel: 'Stammbaum',
    text:
      'Hier siehst du, wie Beziehungen und Generationen dargestellt werden – in der Demo mit Beispielpersonen.',
    linkTo: R.stammbaum,
    linkLabel: 'Stammbaum öffnen',
  },
  {
    id: 'events-kalender',
    titel: 'Events & Kalender',
    text:
      'Termine und die Jahresübersicht: in der Musterfamilie mit Beispielinhalten, damit du siehst, wie es wirkt.',
    linkTo: R.events,
    linkLabel: 'Events öffnen',
  },
  {
    id: 'geschichte',
    titel: `${K2_FAMILIE_NAV_LABEL_GESCHICHTE} & Gedenkort`,
    text:
      'Gemeinsame Texte und Erinnerungsorte – zum Durchblättern in der Demo.',
    linkTo: R.geschichte,
    linkLabel: 'Geschichten öffnen',
  },
  {
    id: 'einstellungen',
    titel: 'Einstellungen',
    text:
      'Zugang, Rollen und Einladungen sind in einer **echten** Familie hier gebündelt. In der Demo kannst du dich orientieren, ohne echte Daten zu hinterlegen.',
    linkTo: R.einstellungen,
    linkLabel: 'Einstellungen öffnen',
  },
  {
    id: 'entscheid',
    titel: 'Eigene Familie',
    text:
      'Wenn dir die App zusagt, kannst du die Demo beenden und mit Einladung oder neuer Familie **euren** Raum gründen – dort gelten dann nur noch eure Daten.',
  },
]

function renderLeitfadenText(markdownLite: string): ReactNode {
  const parts = markdownLite.split(/\*\*(.+?)\*\*/g)
  return parts.map((chunk, i) => (i % 2 === 1 ? <strong key={i}>{chunk}</strong> : <span key={i}>{chunk}</span>))
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Nach Abschluss oder Überspringen (einmal pro Gerät merken). */
  onAbgeschlossen: () => void
}

export function FamilieMusterHuberLeitfadenModal({ open, onOpenChange, onAbgeschlossen }: Props) {
  const navigate = useNavigate()
  const [schritt, setSchritt] = useState(0)
  const max = FAMILIE_MUSTER_LEITFADEN_SCHRITTE.length - 1
  const istLetzter = schritt >= max

  useEffect(() => {
    if (open) setSchritt(0)
  }, [open])

  const schliessenUndMerken = useCallback(() => {
    try {
      localStorage.setItem(LS_LEITFADEN_ABGESCHLOSSEN, '1')
    } catch {
      /* ignore */
    }
    onAbgeschlossen()
    onOpenChange(false)
  }, [onAbgeschlossen, onOpenChange])

  const demoBeenden = useCallback(() => {
    schliessenUndMerken()
    navigate({ pathname: K2_FAMILIE_APP_SHORT_PATH, search: '' }, { replace: true })
  }, [navigate, schliessenUndMerken])

  if (!open) return null

  const s = FAMILIE_MUSTER_LEITFADEN_SCHRITTE[schritt]!

  return (
    <div
      className="k2-familie-no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="k2-familie-muster-leitfaden-titel"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 25000,
        background: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: t.fontBody,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflow: 'auto',
          background: '#fffefb',
          borderRadius: t.radius,
          border: '2px solid rgba(181, 74, 30, 0.35)',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
          padding: '1.15rem 1.25rem',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 700, color: t.muted, letterSpacing: '0.02em' }}>
          Leitfaden · Schritt {schritt + 1} von {FAMILIE_MUSTER_LEITFADEN_SCHRITTE.length}
        </p>
        <h2
          id="k2-familie-muster-leitfaden-titel"
          style={{
            margin: '0.35rem 0 0.65rem',
            fontSize: '1.15rem',
            fontWeight: 800,
            color: t.text,
            fontFamily: t.fontHeading,
            lineHeight: 1.25,
          }}
        >
          {s.titel}
        </h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: t.text, lineHeight: 1.55 }}>{renderLeitfadenText(s.text)}</p>
        {s.linkTo && s.linkLabel ? (
          <p style={{ margin: '0.75rem 0 0' }}>
            <Link
              to={s.linkTo}
              onClick={() => onOpenChange(false)}
              style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#b54a1e',
              }}
            >
              {s.linkLabel} →
            </Link>
          </p>
        ) : null}
        {isK2FamilieApfLocalhost() && schritt === 0 ? (
          <p style={{ margin: '0.65rem 0 0', fontSize: '0.8rem', color: t.muted, lineHeight: 1.45 }}>
            Am Mac auf der APf kann nach dem Beenden der Demo die Stammfamilie automatisch gewählt werden.
          </p>
        ) : null}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginTop: '1.1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {schritt > 0 ? (
              <button
                type="button"
                onClick={() => setSchritt((n) => n - 1)}
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  borderRadius: t.radius,
                  border: `1px solid rgba(181, 74, 30, 0.35)`,
                  background: '#fffefb',
                  color: t.text,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Zurück
              </button>
            ) : null}
            <button
              type="button"
              onClick={schliessenUndMerken}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.86rem',
                fontWeight: 600,
                borderRadius: t.radius,
                border: '1px solid transparent',
                background: 'transparent',
                color: t.muted,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Später
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', justifyContent: 'flex-end' }}>
            {!istLetzter ? (
              <button
                type="button"
                onClick={() => setSchritt((n) => Math.min(max, n + 1))}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  borderRadius: t.radius,
                  border: '1px solid rgba(181, 74, 30, 0.35)',
                  background: '#b54a1e',
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Weiter
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={schliessenUndMerken}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    borderRadius: t.radius,
                    border: `1px solid rgba(181, 74, 30, 0.35)`,
                    background: '#fffefb',
                    color: t.text,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Fertig
                </button>
                <button
                  type="button"
                  onClick={demoBeenden}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    borderRadius: t.radius,
                    border: '1px solid rgba(181, 74, 30, 0.35)',
                    background: '#b54a1e',
                    color: '#fff',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Demo beenden – zu eurer Familie
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function readMusterLeitfadenAbgeschlossen(): boolean {
  try {
    return localStorage.getItem(LS_LEITFADEN_ABGESCHLOSSEN) === '1'
  } catch {
    return false
  }
}
