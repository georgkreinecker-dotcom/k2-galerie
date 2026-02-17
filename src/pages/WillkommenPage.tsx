/**
 * Willkommensseite – Einstieg von Werbung/Flyer/QR.
 * mök2-Stil. Zugangsbereich: Anmelden, Nur zur Ansicht, Erster Entwurf (Daten eingeben).
 * Vor Eintritt ist die Bestätigung der AGB erforderlich (üblich).
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PROJECT_ROUTES, MOK2_ROUTE, WILLKOMMEN_NAME_KEY, WILLKOMMEN_ENTWURF_KEY, AGB_ROUTE } from '../config/navigation'
import { PRODUCT_BRAND_NAME, PRODUCT_WERBESLOGAN, PRODUCT_COPYRIGHT } from '../config/tenantConfig'
import { WERBEUNTERLAGEN_STIL, PROMO_FONTS_URL } from '../config/marketingWerbelinie'
import { OK2_THEME } from '../config/ok2Theme'

/** Willkommensseite nutzt immer Design ök2 (hell, Creme, Sage) – klar getrennt von K2. */
const WILLKOMMEN_THEME = {
  bg: `linear-gradient(135deg, ${OK2_THEME.backgroundColor1} 0%, ${OK2_THEME.backgroundColor2} 50%, ${OK2_THEME.backgroundColor3} 100%)`,
  bgCard: OK2_THEME.cardBg1,
  bgElevated: OK2_THEME.cardBg2,
  text: OK2_THEME.textColor,
  muted: OK2_THEME.mutedColor,
  accent: OK2_THEME.accentColor,
  accentSoft: 'rgba(90, 122, 110, 0.2)',
  gradientAccent: `linear-gradient(135deg, ${OK2_THEME.accentColor} 0%, #4a6a5e 100%)`,
  textOnAccent: '#fff',
  radius: '8px',
  shadow: '0 12px 40px rgba(0,0,0,0.08)',
  fontHeading: WERBEUNTERLAGEN_STIL.fontHeading,
  fontBody: WERBEUNTERLAGEN_STIL.fontBody,
} as const

const MOK2_SLOGAN_KEY = 'k2-mok2-werbeslogan'
const AGB_ACCEPTED_KEY = 'k2-agb-accepted'

function loadSlogan(): string {
  try {
    const v = localStorage.getItem(MOK2_SLOGAN_KEY)
    if (v && v.trim()) return v.trim()
  } catch (_) {}
  return PRODUCT_WERBESLOGAN
}

function getAgbAccepted(): boolean {
  try {
    return sessionStorage.getItem(AGB_ACCEPTED_KEY) === '1'
  } catch (_) {}
  return false
}

type PendingAction = 'ansicht' | 'vorschau' | 'entwurf' | null

export default function WillkommenPage() {
  const t = WILLKOMMEN_THEME
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const slogan = loadSlogan()
  const [name, setName] = useState('')
  const [agbAccepted, setAgbAccepted] = useState(getAgbAccepted)
  const [showAgbModal, setShowAgbModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [agbCheckbox, setAgbCheckbox] = useState(false)

  useEffect(() => {
    setAgbAccepted(getAgbAccepted())
  }, [showAgbModal])

  // Externe Links: ?assistent=ansicht|vorschau|entwurf → entsprechende Aktion auslösen
  useEffect(() => {
    const a = searchParams.get('assistent')
    if (a === 'ansicht' || a === 'vorschau' || a === 'entwurf') {
      setSearchParams({}, { replace: true })
      startEntry(a)
    }
  }, [searchParams])

  const handleErsterEntwurf = () => {
    const n = name.trim()
    if (n) {
      try {
        sessionStorage.setItem(WILLKOMMEN_NAME_KEY, n)
        sessionStorage.setItem(WILLKOMMEN_ENTWURF_KEY, '1')
      } catch (_) {}
    }
    navigate(PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau)
  }

  const goTo = (action: PendingAction) => {
    if (!action) return
    try {
      sessionStorage.setItem(AGB_ACCEPTED_KEY, '1')
    } catch (_) {}
    setAgbAccepted(true)
    setShowAgbModal(false)
    setPendingAction(null)
    setAgbCheckbox(false)
    if (action === 'ansicht') navigate(PROJECT_ROUTES['k2-galerie'].galerieOeffentlich)
    else if (action === 'vorschau') navigate(PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau)
    else if (action === 'entwurf') handleErsterEntwurf()
  }

  const startEntry = (action: PendingAction) => {
    if (agbAccepted) {
      if (action === 'entwurf') handleErsterEntwurf()
      else if (action === 'ansicht') navigate(PROJECT_ROUTES['k2-galerie'].galerieOeffentlich)
      else if (action === 'vorschau') navigate(PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau)
    } else {
      setPendingAction(action)
      setShowAgbModal(true)
      setAgbCheckbox(false)
    }
  }

  return (
    <div
      style={{
        background: t.bg,
        minHeight: '100vh',
        color: t.text,
        fontFamily: t.fontBody,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <link rel="stylesheet" href={PROMO_FONTS_URL} />

      <div
        style={{
          maxWidth: 520,
          width: '100%',
          background: t.bgCard,
          borderRadius: t.radius,
          boxShadow: t.shadow,
          padding: '2.5rem 2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: `radial-gradient(ellipse 90% 70% at 50% 0%, ${t.accentSoft}, transparent 65%)`,
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p
            style={{
              fontFamily: t.fontHeading,
              fontSize: '0.85rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: t.muted,
              margin: 0,
            }}
          >
            Willkommen
          </p>
          <h1
            style={{
              fontFamily: t.fontHeading,
              fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
              fontWeight: 600,
              margin: '0.5rem 0 1rem',
              color: t.accent,
            }}
          >
            {PRODUCT_BRAND_NAME}
          </h1>
          <div
            style={{
              width: 60,
              height: 3,
              background: t.gradientAccent,
              marginBottom: '1.25rem',
              borderRadius: 2,
            }}
          />
          <p style={{ fontSize: '1rem', lineHeight: 1.6, color: t.text, margin: 0 }}>
            {slogan}
          </p>

          {/* Ein Zugangsblock – keine doppelten Fragen. Galerie-Eigentümer = erst nach Lizenz. */}
          <div
            style={{
              marginTop: '1.75rem',
              padding: '1.25rem 1.25rem',
              background: t.bgElevated,
              border: `2px solid ${t.accentSoft}`,
              borderRadius: t.radius,
            }}
          >
            <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: t.muted, lineHeight: 1.5 }}>
              Vor dem Lizenz-Erwerb testest du die App mit eigenen Werken. <strong style={{ color: t.text }}>Galerie-Eigentümer</strong> wirst du nach dem Lizenz-Erwerb (dann: Admin-Zugang in der Galerie).
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => startEntry('ansicht')}
                style={{
                  width: '100%',
                  padding: '0.9rem 1.25rem',
                  background: t.bgCard,
                  color: t.text,
                  borderRadius: t.radius,
                  textAlign: 'left',
                  fontWeight: 600,
                  border: `1px solid ${t.accentSoft}`,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                }}
              >
                <span style={{ display: 'block', marginBottom: '0.2rem' }}>Nur umschauen</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 400, color: t.muted }}>Galerie ansehen, ohne Anmeldung.</span>
              </button>
              <div style={{ padding: '1rem', background: t.bgCard, borderRadius: t.radius, border: `1px solid ${t.accentSoft}` }}>
                <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: t.muted }}>
                  Vorschau & Entwurf: App testen mit eigenen Werken. Optional Namen eintragen, dann siehst du sofort deinen Entwurf.
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Galerie- oder Künstlername (optional)"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.9rem',
                    border: `1px solid ${t.accentSoft}`,
                    borderRadius: 6,
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    background: t.bgElevated,
                    color: t.text,
                    marginBottom: '0.75rem',
                  }}
                />
                <button
                  type="button"
                  onClick={() => startEntry(name.trim() ? 'entwurf' : 'vorschau')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: t.gradientAccent,
                    color: t.textOnAccent,
                    border: 'none',
                    borderRadius: t.radius,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                  }}
                >
                  Vorschau & Entwurf ansehen →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: t.muted }}>
        <Link to={MOK2_ROUTE} style={{ color: t.accent, textDecoration: 'none' }}>← mök2</Link>
        {' · '}
        Von der Werbung hier? Scan den QR-Code oder nutze den Link aus den Unterlagen.
        {' · '}
        <Link to={AGB_ROUTE} style={{ color: t.accent, textDecoration: 'none' }}>AGB</Link>
        {' · '}
        {PRODUCT_COPYRIGHT}
      </p>

      {/* Modal: AGB bestätigen vor Eintritt */}
      {showAgbModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
          onClick={() => {
            setShowAgbModal(false)
            setPendingAction(null)
            setAgbCheckbox(false)
          }}
        >
          <div
            style={{
              background: t.bgCard,
              borderRadius: t.radius,
              boxShadow: t.shadow,
              maxWidth: 440,
              width: '100%',
              padding: '1.5rem 1.75rem',
              border: `1px solid ${t.accentSoft}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: t.fontHeading, fontSize: '1.2rem', color: t.accent, margin: '0 0 0.75rem', fontWeight: 600 }}>
              Allgemeine Geschäftsbedingungen
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: t.text }}>
              Bitte bestätige, dass du die Allgemeinen Geschäftsbedingungen gelesen und akzeptiert hast. Die AGB enthalten u. a. Haftungsausschluss, Hinweise zu Datenschutz und Steuern.
            </p>
            <a
              href={AGB_ROUTE}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: '0.75rem', color: t.accent, fontWeight: 600, fontSize: '0.9rem' }}
            >
              AGB im Volltext anzeigen →
            </a>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '1.25rem', cursor: 'pointer', fontSize: '0.9rem', color: t.text }}>
              <input
                type="checkbox"
                checked={agbCheckbox}
                onChange={(e) => setAgbCheckbox(e.target.checked)}
                style={{ marginTop: '0.2rem' }}
              />
              <span>Ich habe die Allgemeinen Geschäftsbedingungen gelesen und akzeptiert.</span>
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowAgbModal(false)
                  setPendingAction(null)
                  setAgbCheckbox(false)
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: t.bgElevated,
                  color: t.text,
                  border: `1px solid ${t.accentSoft}`,
                  borderRadius: t.radius,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                }}
              >
                Abbrechen
              </button>
              <button
                type="button"
                disabled={!agbCheckbox}
                onClick={() => pendingAction && goTo(pendingAction)}
                style={{
                  padding: '0.5rem 1rem',
                  background: agbCheckbox ? t.gradientAccent : t.bgElevated,
                  color: agbCheckbox ? t.textOnAccent : t.muted,
                  border: 'none',
                  borderRadius: t.radius,
                  cursor: agbCheckbox ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                Akzeptieren und fortfahren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
