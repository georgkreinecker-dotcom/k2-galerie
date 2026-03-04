/**
 * Galerie-Assistent: Führt neue Kunden schrittweise durch das Anlegen der eigenen Galerie.
 * Kennt den Guide-Pfad und begrüßt persönlich.
 */

import React, { useState, useEffect, useRef } from 'react'
import { PRODUCT_BRAND_NAME } from '../config/tenantConfig'
import { WERBEUNTERLAGEN_STIL } from '../config/marketingWerbelinie'

const s = WERBEUNTERLAGEN_STIL

export type AdminTab = 'werke' | 'eventplan' | 'presse' | 'design' | 'einstellungen'
export type SettingsSubTab = 'stammdaten' | 'registrierung' | 'drucker' | 'sicherheit' | 'lager'
export type EventplanSubTab = 'events' | 'öffentlichkeitsarbeit'

export interface GalerieAssistentProps {
  onGoToStep: (tab: AdminTab, subTab?: SettingsSubTab | EventplanSubTab) => void
  productName?: string
  // Guide-Daten (optional – wenn aus Guide-Flow gestartet)
  guideName?: string
  guidePfad?: string
}

type Step = {
  id: string
  title: string
  short: string
  tab: AdminTab
  subTab?: SettingsSubTab | EventplanSubTab
  icon: string
  erledigt?: boolean
}

function baueSchritte(pfad: string): Step[] {
  const istVerein = pfad === 'gemeinschaft'

  return [
    {
      id: 'stammdaten',
      title: istVerein ? 'Vereinsdaten & Kontakt' : 'Deine Daten & Kontakt',
      short: istVerein
        ? 'Vereinsname, Adresse, E-Mail – damit Besucher und Mitglieder euch erreichen.'
        : 'Galerie-Name, Adresse, E-Mail und Telefon eintragen – damit Besucher dich erreichen.',
      tab: 'einstellungen',
      subTab: 'stammdaten',
      icon: '📋',
    },
    {
      id: 'werke',
      title: istVerein ? 'Erste Werke der Mitglieder' : 'Erste Werke hochladen',
      short: istVerein
        ? 'Fotos der Vereinswerke hochladen – sie erscheinen sofort in der gemeinsamen Galerie.'
        : 'Fotos deiner Werke hochladen, Titel und Infos ergänzen – sie erscheinen sofort in deiner Galerie.',
      tab: 'werke',
      icon: '🎨',
    },
    {
      id: 'design',
      title: 'Galerie gestalten und texten',
      short: istVerein
        ? 'Farben, Logo, Texte – damit die Galerie das Gesicht eures Vereins bekommt.'
        : 'Farben, Willkommensbild und Texte – damit deine Galerie zu dir passt.',
      tab: 'design',
      icon: '✨',
    },
    {
      id: 'events',
      title: istVerein ? 'Ausstellungen & Einladungen' : 'Erste Veranstaltung planen',
      short: istVerein
        ? 'Ausstellungen planen, Einladungen an Mitglieder versenden, QR-Code für die Vernissage.'
        : 'Vernissagen, Eröffnungen planen und Einladungen erstellen – wenn du bereit bist.',
      tab: 'eventplan',
      subTab: 'events',
      icon: '🎟️',
    },
    {
      id: 'presse',
      title: 'Presse & Medien',
      short: istVerein
        ? 'Medienkit und Presse-Vorlage aus Vereinsdaten – für Pressearbeit und Einladungen an Medien.'
        : 'Medienkit und Presse-Vorlage – wenn du Presse oder Medien einladen willst.',
      tab: 'presse',
      icon: '📰',
    },
  ]
}

export function GalerieAssistent({ onGoToStep, productName = PRODUCT_BRAND_NAME, guideName, guidePfad = '' }: GalerieAssistentProps) {
  const steps = baueSchritte(guidePfad)
  const [aktiverSchritt, setAktiverSchritt] = useState(0)
  const [erledigteSchritte, setErledigteSchritte] = useState<Set<number>>(new Set())
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Beim ersten Laden: sofort Schritt 1 markieren als "läuft gerade"
  useEffect(() => {
    // Kleines Scroll nach oben damit der erste Schritt sichtbar ist
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Cleanup: kein setState nach Unmount (Timeout in markiereErledigt)
  useEffect(() => {
    return () => {
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current)
    }
  }, [])

  const geheZuSchritt = (index: number) => {
    const step = steps[index]
    setAktiverSchritt(index)
    onGoToStep(step.tab, step.subTab)
  }

  const markiereErledigt = (index: number) => {
    setErledigteSchritte(prev => new Set([...prev, index]))
    // Automatisch zum nächsten Schritt weitergehen
    const naechster = index + 1
    if (naechster < steps.length) {
      if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current)
      stepTimeoutRef.current = setTimeout(() => {
        stepTimeoutRef.current = null
        setAktiverSchritt(naechster)
        const next = steps[naechster]
        onGoToStep(next.tab, next.subTab)
      }, 400)
    }
  }

  const name = guideName ?? ''
  const fertig = erledigteSchritte.size === steps.length

  return (
    <section style={{ background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: '24px', padding: 'clamp(1.5rem, 4vw, 2.5rem)', boxShadow: s.shadow, marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>

      {/* Persönliche Begrüßung */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>
          {guidePfad === 'gemeinschaft' ? '🤝' : guidePfad === 'atelier' ? '🏢' : guidePfad === 'entdecker' ? '🌱' : '👨‍🎨'}
        </div>
        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 700, color: s.text, margin: '0 0 0.4rem' }}>
          {name ? `${name}, ich führe dich jetzt durch.` : 'Ich führe dich jetzt durch.'}
        </h2>
        <p style={{ fontSize: '0.95rem', color: s.muted, margin: 0, lineHeight: 1.5 }}>
          {fertig
            ? '✅ Du hast alles eingerichtet – deine Galerie ist bereit!'
            : `${erledigteSchritte.size} von ${steps.length} Schritten erledigt – einfach tippen und ich springe direkt dorthin.`}
        </p>
      </div>

      {/* Fortschrittsbalken */}
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.5rem' }}>
        {steps.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: erledigteSchritte.has(i) ? s.accent : i === aktiverSchritt ? `${s.accent}66` : `${s.accent}18`, transition: 'all 0.3s' }} />
        ))}
      </div>

      {/* Schritte */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {steps.map((step, index) => {
          const istAktiv = index === aktiverSchritt
          const istErledigt = erledigteSchritte.has(index)
          return (
            <div key={step.id} style={{
              background: istErledigt ? `${s.accent}08` : istAktiv ? `${s.accent}14` : `${s.accent}06`,
              border: `1.5px solid ${istErledigt ? s.accent + '44' : istAktiv ? s.accent + '66' : s.accent + '1a'}`,
              borderRadius: '14px',
              padding: '1rem 1.1rem',
              transition: 'all 0.2s',
              opacity: !istErledigt && !istAktiv && index > aktiverSchritt + 1 ? 0.55 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Icon mit Status */}
                <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: istErledigt ? s.accent : istAktiv ? `${s.accent}22` : `${s.accent}10` }}>
                  {istErledigt ? '✅' : step.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', color: s.accent, fontWeight: 600, marginBottom: '0.1rem' }}>
                    {istErledigt ? 'Erledigt' : istAktiv ? '▶ Jetzt' : `Schritt ${index + 1}`}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: s.text }}>{step.title}</div>
                  {(istAktiv || istErledigt) && (
                    <div style={{ fontSize: '0.82rem', color: s.muted, marginTop: '0.2rem', lineHeight: 1.4 }}>{step.short}</div>
                  )}
                </div>

                {/* Aktions-Button */}
                {!istErledigt && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexShrink: 0 }}>
                    <button type="button"
                      onClick={() => geheZuSchritt(index)}
                      style={{ padding: '0.45rem 0.85rem', background: istAktiv ? s.gradientAccent : `${s.accent}18`, color: istAktiv ? '#fff' : s.accent, border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>
                      {istAktiv ? 'Los →' : 'Öffnen →'}
                    </button>
                    {istAktiv && (
                      <button type="button"
                        onClick={() => markiereErledigt(index)}
                        style={{ padding: '0.35rem 0.6rem', background: 'transparent', color: `${s.accent}88`, border: `1px solid ${s.accent}33`, borderRadius: '7px', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}>
                        ✓ Erledigt – weiter
                      </button>
                    )}
                  </div>
                )}
                {istErledigt && (
                  <button type="button"
                    onClick={() => geheZuSchritt(index)}
                    style={{ padding: '0.35rem 0.7rem', background: 'transparent', color: `${s.accent}77`, border: `1px solid ${s.accent}22`, borderRadius: '7px', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                    Nochmal →
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {fertig && (
        <div style={{ marginTop: '1.25rem', padding: '1rem', background: `${s.accent}10`, border: `1px solid ${s.accent}33`, borderRadius: '12px', textAlign: 'center', fontSize: '0.92rem', color: s.text, fontWeight: 600 }}>
          🎉 Deine Galerie ist eingerichtet – {productName} ist bereit für dich!
        </div>
      )}

      <p style={{ marginTop: '1.25rem', fontSize: '0.82rem', color: s.muted, fontStyle: 'italic', margin: '1.25rem 0 0' }}>
        Du kannst die Schritte in beliebiger Reihenfolge abarbeiten – tippe auf einen Schritt und ich bringe dich direkt dorthin.
      </p>
    </section>
  )
}

export default GalerieAssistent
