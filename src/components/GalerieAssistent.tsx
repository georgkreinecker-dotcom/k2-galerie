/**
 * Galerie-Assistent: Führt neue Kunden schrittweise durch das Anlegen der eigenen Galerie.
 * Ein Klick pro Schritt – keine langen Anleitungen.
 *
 * Keine externe Funktion (keine API, kein Chat-Backend). Für die Zukunft optional erweiterbar
 * (z. B. optionales Chat-Feld mit externem KI-Service), wenn gewünscht.
 */

import { PRODUCT_BRAND_NAME } from '../config/tenantConfig'
import { WERBEUNTERLAGEN_STIL } from '../config/marketingWerbelinie'

const s = WERBEUNTERLAGEN_STIL

export type AdminTab = 'werke' | 'eventplan' | 'design' | 'einstellungen'
export type SettingsSubTab = 'stammdaten' | 'registrierung' | 'drucker' | 'sicherheit' | 'lager'
export type EventplanSubTab = 'events' | 'öffentlichkeitsarbeit'

export interface GalerieAssistentProps {
  onGoToStep: (tab: AdminTab, subTab?: SettingsSubTab | EventplanSubTab) => void
  productName?: string
}

const steps: Array<{
  id: string
  title: string
  short: string
  tab: AdminTab
  subTab?: SettingsSubTab | EventplanSubTab
  icon: string
}> = [
  {
    id: 'stammdaten',
    title: 'Stammdaten & Kontakt',
    short: 'Galerie-Name, Adresse, E-Mail und Telefon eintragen – damit Besucher und Gäste dich erreichen.',
    tab: 'einstellungen',
    subTab: 'stammdaten',
    icon: '📋',
  },
  {
    id: 'werke',
    title: 'Erste Werke anlegen',
    short: 'Fotos deiner Werke hochladen, Titel und Infos ergänzen. sie erscheinen sofort in deiner Galerie.',
    tab: 'werke',
    icon: '🎨',
  },
  {
    id: 'design',
    title: 'Design anpassen',
    short: 'Farben, Willkommensbild und Texte – damit deine Galerie zu dir passt.',
    tab: 'design',
    icon: '✨',
  },
  {
    id: 'events',
    title: 'Events & Marketing (optional)',
    short: 'Vernissagen, Eröffnungen planen und Flyer, Newsletter oder Presse-Texte erstellen.',
    tab: 'eventplan',
    subTab: 'events',
    icon: '📢',
  },
]

export function GalerieAssistent({ onGoToStep, productName = PRODUCT_BRAND_NAME }: GalerieAssistentProps) {
  return (
    <section
      style={{
        background: s.bgCard,
        border: `1px solid ${s.accent}22`,
        borderRadius: '24px',
        padding: 'clamp(2rem, 5vw, 3rem)',
        boxShadow: s.shadow,
        marginBottom: 'clamp(2rem, 5vw, 3rem)',
      }}
    >
      <div style={{ marginBottom: 'clamp(1.5rem, 4vw, 2rem)' }}>
        <h2
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            fontWeight: '700',
            color: s.text,
            marginBottom: '0.5rem',
            letterSpacing: '-0.01em',
          }}
        >
          🤖 Galerie-Assistent
        </h2>
        <p
          style={{
            fontSize: 'clamp(0.95rem, 2.2vw, 1.05rem)',
            color: s.muted,
            lineHeight: 1.5,
            maxWidth: '560px',
          }}
        >
          Deine Galerie in wenigen Schritten einrichten – der Assistent führt dich dorthin, wo du was eintragen musst.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            style={{
              background: `${s.accent}0c`,
              border: `1px solid ${s.accent}33`,
              borderRadius: '16px',
              padding: 'clamp(1rem, 2.5vw, 1.25rem)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '1.5rem',
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {step.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
                    color: s.accent,
                    fontWeight: '600',
                    marginBottom: '0.25rem',
                  }}
                >
                  Schritt {index + 1}
                </div>
                <h3
                  style={{
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)',
                    fontWeight: '600',
                    color: s.text,
                    margin: 0,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: 'clamp(0.88rem, 2vw, 0.95rem)',
                    color: s.muted,
                    lineHeight: 1.5,
                    marginTop: '0.35rem',
                  }}
                >
                  {step.short}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onGoToStep(step.tab, step.subTab)
              }}
              style={{
                alignSelf: 'flex-start',
                padding: '0.5rem 1rem',
                background: s.gradientAccent,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(0.85rem, 2vw, 0.95rem)',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: s.shadow,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(181, 74, 30, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = s.shadow
              }}
            >
              Zum Schritt →
            </button>
          </div>
        ))}
      </div>

      <p
        style={{
          marginTop: 'clamp(1.5rem, 4vw, 2rem)',
          fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
          color: s.muted,
          fontStyle: 'italic',
        }}
      >
        Du kannst die Schritte in beliebiger Reihenfolge abarbeiten. Wenn du etwas nicht findest: hier auf „Zum Schritt“ klicken – dann springt die App genau dorthin.
      </p>
    </section>
  )
}

export default GalerieAssistent
