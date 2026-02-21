/**
 * Willkommensseite – Einstieg von Werbung/Flyer/QR.
 * mök2-Stil. Zugangsbereich: Anmelden, Nur zur Ansicht, Erster Entwurf (Daten eingeben).
 * Vor Eintritt ist die Bestätigung der AGB erforderlich (üblich).
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PROJECT_ROUTES, MOK2_ROUTE, WILLKOMMEN_NAME_KEY, WILLKOMMEN_ENTWURF_KEY, AGB_ROUTE } from '../config/navigation'
import { PRODUCT_BRAND_NAME, PRODUCT_WERBESLOGAN, PRODUCT_COPYRIGHT, PRODUCT_LIZENZ_ANFRAGE_EMAIL, PRODUCT_LIZENZ_ANFRAGE_BETREFF } from '../config/tenantConfig'
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
  radius: '12px',
  shadow: '0 16px 48px rgba(0,0,0,0.10)',
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

      {/* Haupt-Karte */}
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          background: t.bgCard,
          borderRadius: '20px',
          boxShadow: t.shadow,
          padding: 'clamp(2rem, 5vw, 3rem)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dezenter Akzent-Hintergrund oben */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '35%',
            background: `radial-gradient(ellipse 90% 70% at 50% 0%, ${t.accentSoft}, transparent 65%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Logo / Marke */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <p style={{
              fontFamily: t.fontHeading,
              fontSize: '0.78rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: t.muted,
              margin: '0 0 0.4rem',
            }}>
              Willkommen bei
            </p>
            <h1 style={{
              fontFamily: t.fontHeading,
              fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
              fontWeight: 700,
              margin: '0 0 0.75rem',
              color: t.accent,
              letterSpacing: '-0.01em',
            }}>
              {PRODUCT_BRAND_NAME}
            </h1>
            <div style={{ width: 48, height: 3, background: t.gradientAccent, borderRadius: 2, margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1rem', lineHeight: 1.65, color: t.text, margin: 0, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
              {slogan}
            </p>
          </div>

          {/* Was möchtest du tun? – drei klare Optionen */}
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.75rem' }}>
            Was möchtest du tun?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            {/* Option 1: Galerie ansehen */}
            <button
              type="button"
              onClick={() => startEntry('ansicht')}
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                background: t.bgElevated,
                color: t.text,
                borderRadius: t.radius,
                textAlign: 'left',
                border: `1px solid ${t.accentSoft}`,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.9rem',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.background = t.bgCard }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.accentSoft; e.currentTarget.style.background = t.bgElevated }}
            >
              <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>🖼️</span>
              <span>
                <span style={{ display: 'block', fontWeight: 600, marginBottom: '0.15rem' }}>Galerie ansehen</span>
                <span style={{ fontSize: '0.82rem', color: t.muted }}>Einfach reinschauen – ohne Anmeldung</span>
              </span>
            </button>

            {/* Option 2: Eigenen Entwurf erstellen */}
            <div style={{
              background: t.bgElevated,
              borderRadius: t.radius,
              border: `2px solid ${t.accent}`,
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                <span style={{ fontSize: '1.6rem', flexShrink: 0, marginTop: '0.1rem' }}>✏️</span>
                <span>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '0.95rem', color: t.text, marginBottom: '0.15rem' }}>
                    Meine Galerie ausprobieren
                  </span>
                  <span style={{ fontSize: '0.82rem', color: t.muted, lineHeight: 1.5 }}>
                    Gib deinen Namen ein – die Galerie zeigt sofort wie sie mit deinem Namen aussieht.
                  </span>
                </span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') startEntry(name.trim() ? 'entwurf' : 'vorschau') }}
                placeholder="Dein Galerie- oder Künstlername"
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  border: `1px solid ${t.accentSoft}`,
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  background: t.bgCard,
                  color: t.text,
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = t.accent }}
                onBlur={(e) => { e.currentTarget.style.borderColor = t.accentSoft }}
              />
              <button
                type="button"
                onClick={() => startEntry(name.trim() ? 'entwurf' : 'vorschau')}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  background: t.gradientAccent,
                  color: t.textOnAccent,
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  letterSpacing: '0.01em',
                }}
              >
                {name.trim() ? `„${name.trim()}" – Galerie starten →` : 'Galerie ausprobieren →'}
              </button>
            </div>

          </div>

          {/* Trennlinie */}
          <div style={{ height: 1, background: `${t.accent}20`, margin: '1.5rem 0' }} />

          {/* Lizenz anfragen – für wen der kaufen möchte */}
          <a
            href={`mailto:${encodeURIComponent(PRODUCT_LIZENZ_ANFRAGE_EMAIL)}?subject=${encodeURIComponent(PRODUCT_LIZENZ_ANFRAGE_BETREFF)}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1.25rem',
              background: t.accentSoft,
              color: t.accent,
              borderRadius: t.radius,
              textDecoration: 'none',
              fontWeight: 600,
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              border: `1px solid ${t.accent}44`,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${t.accent}30` }}
            onMouseLeave={(e) => { e.currentTarget.style.background = t.accentSoft }}
          >
            <span style={{ fontSize: '1.3rem' }}>📩</span>
            <span>
              <span style={{ display: 'block', marginBottom: '0.1rem' }}>Eigene Galerie kaufen</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 400, color: t.muted }}>Lizenz anfragen – wir melden uns</span>
            </span>
          </a>

        </div>
      </div>

      {/* Fußzeile – dezent, nur das Nötige */}
      <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: t.muted, textAlign: 'center', lineHeight: 2 }}>
        <Link to={AGB_ROUTE} style={{ color: t.accent, textDecoration: 'none' }}>AGB</Link>
        {' · '}
        {PRODUCT_COPYRIGHT}
        {' · '}
        <Link to={MOK2_ROUTE} style={{ color: t.muted, textDecoration: 'none' }}>mök2</Link>
      </p>

      {/* Modal: AGB bestätigen vor Eintritt – einmal pro Session */}
      {showAgbModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
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
              borderRadius: '16px',
              boxShadow: t.shadow,
              maxWidth: 420,
              width: '100%',
              padding: '1.75rem',
              border: `1px solid ${t.accentSoft}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: t.fontHeading, fontSize: '1.15rem', color: t.accent, margin: '0 0 0.6rem', fontWeight: 700 }}>
              Kurz bestätigen
            </h3>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', lineHeight: 1.6, color: t.text }}>
              Bevor du eintrittst, bitte kurz die Nutzungsbedingungen bestätigen.
            </p>
            <a
              href={AGB_ROUTE}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', marginBottom: '1rem', color: t.accent, fontWeight: 600, fontSize: '0.88rem' }}
            >
              AGB lesen →
            </a>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', fontSize: '0.88rem', color: t.text, marginBottom: '1.25rem' }}>
              <input
                type="checkbox"
                checked={agbCheckbox}
                onChange={(e) => setAgbCheckbox(e.target.checked)}
                style={{ marginTop: '0.2rem', accentColor: t.accent }}
              />
              <span>Ich habe die AGB gelesen und stimme zu.</span>
            </label>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowAgbModal(false)
                  setPendingAction(null)
                  setAgbCheckbox(false)
                }}
                style={{
                  padding: '0.6rem 1.1rem',
                  background: 'transparent',
                  color: t.muted,
                  border: `1px solid ${t.accentSoft}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.88rem',
                }}
              >
                Abbrechen
              </button>
              <button
                type="button"
                disabled={!agbCheckbox}
                onClick={() => pendingAction && goTo(pendingAction)}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: agbCheckbox ? t.gradientAccent : t.bgElevated,
                  color: agbCheckbox ? t.textOnAccent : t.muted,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: agbCheckbox ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                }}
              >
                OK – weiter →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
