/**
 * Willkommensseite – Einstieg von Werbung/Flyer/QR.
 * Zwei Varianten: ?variant=a (Warm/Atelier) | ?variant=c (Modern/Lebendig, Standard)
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PROJECT_ROUTES, MOK2_ROUTE, WILLKOMMEN_NAME_KEY, WILLKOMMEN_ENTWURF_KEY, AGB_ROUTE, ENTDECKEN_ROUTE } from '../config/navigation'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT, PRODUCT_LIZENZ_ANFRAGE_EMAIL, PRODUCT_LIZENZ_ANFRAGE_BETREFF } from '../config/tenantConfig'
import { WERBEUNTERLAGEN_STIL, PROMO_FONTS_URL } from '../config/marketingWerbelinie'

const AGB_ACCEPTED_KEY = 'k2-agb-accepted'
const MOK2_SLOGAN_KEY = 'k2-mok2-werbeslogan'
const DEFAULT_SLOGAN = 'In 5 Minuten zu deiner eigenen Galerie – im Atelier und im Netz.'

function loadSlogan(): string {
  try {
    const v = localStorage.getItem(MOK2_SLOGAN_KEY)
    if (v && v.trim()) return v.trim()
  } catch (_) {}
  return DEFAULT_SLOGAN
}

function getAgbAccepted(): boolean {
  try { return sessionStorage.getItem(AGB_ACCEPTED_KEY) === '1' } catch (_) { return false }
}

type PendingAction = 'ansicht' | 'entwurf' | null

export default function WillkommenPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Neuer Interessent: gleich mit der emotionalen Begrüßung („Für Künstler:innen …“, „Jetzt entdecken“)
  // → /willkommen leitet auf /entdecken weiter; alle Links/QR bleiben unverändert
  useEffect(() => {
    const q = window.location.search
    navigate(q ? `${ENTDECKEN_ROUTE}${q}` : ENTDECKEN_ROUTE, { replace: true })
  }, [navigate])

  const variant = searchParams.get('variant') === 'a' ? 'a' : 'c'
  const slogan = loadSlogan()
  const [name, setName] = useState('')
  const [agbAccepted, setAgbAccepted] = useState(getAgbAccepted)
  const [showAgbModal, setShowAgbModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [agbCheckbox, setAgbCheckbox] = useState(false)

  useEffect(() => { setAgbAccepted(getAgbAccepted()) }, [showAgbModal])

  const doNavigate = (action: PendingAction) => {
    if (!action) return
    try { sessionStorage.setItem(AGB_ACCEPTED_KEY, '1') } catch (_) {}
    setAgbAccepted(true)
    setShowAgbModal(false)
    setPendingAction(null)
    setAgbCheckbox(false)
    if (action === 'ansicht') navigate(PROJECT_ROUTES['k2-galerie'].galerieOeffentlich)
    else if (action === 'entwurf') {
      const n = name.trim()
      if (n) {
        try {
          sessionStorage.setItem(WILLKOMMEN_NAME_KEY, n)
          sessionStorage.setItem(WILLKOMMEN_ENTWURF_KEY, '1')
        } catch (_) {}
      }
      navigate(PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau)
    }
  }

  const startEntry = (action: PendingAction) => {
    if (action === 'entwurf' || action === 'ansicht') {
      doNavigate(action)
      return
    }
    if (agbAccepted) doNavigate(action)
    else { setPendingAction(action); setShowAgbModal(true); setAgbCheckbox(false) }
  }

  // Nach Redirect wird diese Seite nicht mehr gerendert; Fallback für kurzen Moment
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', color: '#666' }}>
      Weiterleitung …
    </div>
  )
}

// ─── Gemeinsame Props ──────────────────────────────────────────────────────────
interface VariantProps {
  name: string
  setName: (v: string) => void
  slogan: string
  startEntry: (a: PendingAction) => void
  showAgbModal: boolean
  setShowAgbModal: (v: boolean) => void
  agbCheckbox: boolean
  setAgbCheckbox: (v: boolean) => void
  pendingAction: PendingAction
  setPendingAction: (v: PendingAction) => void
  doNavigate: (a: PendingAction) => void
}

// ─── AGB-Modal (geteilt) ───────────────────────────────────────────────────────
function AgbModal({ agbCheckbox, setAgbCheckbox, pendingAction, setPendingAction, setShowAgbModal, doNavigate, bg, text, accent, muted, accentSoft, fontHeading, fontBody, shadow }: {
  agbCheckbox: boolean, setAgbCheckbox: (v: boolean) => void
  pendingAction: PendingAction, setPendingAction: (v: PendingAction) => void
  setShowAgbModal: (v: boolean) => void, doNavigate: (a: PendingAction) => void
  bg: string, text: string, accent: string, muted: string, accentSoft: string
  fontHeading: string, fontBody: string, shadow: string
}) {
  const close = () => { setShowAgbModal(false); setPendingAction(null); setAgbCheckbox(false) }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }} onClick={close}>
      <div style={{ background: bg, borderRadius: '16px', boxShadow: shadow, maxWidth: 400, width: '100%', padding: '1.75rem', border: `1px solid ${accentSoft}`, fontFamily: fontBody }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: fontHeading, fontSize: '1.1rem', color: accent, margin: '0 0 0.6rem', fontWeight: 700 }}>Kurz bestätigen</h3>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', lineHeight: 1.6, color: text }}>Bevor du eintrittst, bitte kurz die Nutzungsbedingungen bestätigen.</p>
        <a href={AGB_ROUTE} target="_blank" rel="noopener noreferrer" style={{ color: accent, fontWeight: 600, fontSize: '0.88rem', display: 'block', marginBottom: '1rem' }}>AGB lesen →</a>
        <label style={{ display: 'flex', gap: '0.6rem', cursor: 'pointer', fontSize: '0.88rem', color: text, marginBottom: '1.25rem', alignItems: 'flex-start' }}>
          <input type="checkbox" checked={agbCheckbox} onChange={e => setAgbCheckbox(e.target.checked)} style={{ marginTop: '0.2rem', accentColor: accent }} />
          <span>Ich habe die AGB gelesen und stimme zu.</span>
        </label>
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={close} style={{ padding: '0.6rem 1rem', background: 'transparent', color: muted, border: `1px solid ${accentSoft}`, borderRadius: '8px', cursor: 'pointer', fontFamily: fontBody, fontSize: '0.88rem' }}>Abbrechen</button>
          <button type="button" disabled={!agbCheckbox} onClick={() => pendingAction && doNavigate(pendingAction)} style={{ padding: '0.6rem 1.25rem', background: agbCheckbox ? accent : '#ccc', color: '#fff', border: 'none', borderRadius: '8px', cursor: agbCheckbox ? 'pointer' : 'not-allowed', fontFamily: fontBody, fontSize: '0.88rem', fontWeight: 700 }}>
            OK – weiter →
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANTE A – Warm & einladend wie ein Atelier
// Holzwarme Töne, große Headline, Bild-Andeutung, Herzlichkeit
// ═══════════════════════════════════════════════════════════════════════════════
function VariantA({ name, setName, slogan, startEntry, showAgbModal, setShowAgbModal, agbCheckbox, setAgbCheckbox, pendingAction, setPendingAction, doNavigate }: VariantProps) {
  const accent = '#b54a1e'       // warmes Terrakotta
  const accentLight = '#d4622a'
  const bg = '#faf7f2'           // cremiges Leinen
  const bgWarm = '#f2ede4'
  const bgCard = '#fffefb'
  const text = '#2a1f14'        // dunkles Braun
  const muted = '#7a6a58'
  const fontHeading = WERBEUNTERLAGEN_STIL.fontHeading
  const fontBody = WERBEUNTERLAGEN_STIL.fontBody

  return (
    <div style={{ background: bg, minHeight: '100vh', fontFamily: fontBody, color: text, display: 'flex', flexDirection: 'column' }}>
      <link rel="stylesheet" href={PROMO_FONTS_URL} />

      {/* Warmer Banner oben */}
      <div style={{ background: `linear-gradient(135deg, #3d1f0f 0%, #5c2d14 50%, #3d1f0f 100%)`, padding: 'clamp(2.5rem, 6vw, 4rem) clamp(1.5rem, 5vw, 4rem)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Dekorative Kreise */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: 200, height: 200, borderRadius: '50%', background: `${accent}22`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-30px', width: 280, height: 280, borderRadius: '50%', background: `${accent}18`, pointerEvents: 'none' }} />

        <p style={{ fontFamily: fontHeading, fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#d4a574', margin: '0 0 0.75rem', position: 'relative' }}>
          Herzlich willkommen
        </p>
        <h1 style={{ fontFamily: fontHeading, fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', fontWeight: 600, color: '#fff5ee', margin: '0 0 1rem', lineHeight: 1.15, position: 'relative', letterSpacing: '-0.01em' }}>
          {PRODUCT_BRAND_NAME}
        </h1>
        <div style={{ width: 60, height: 3, background: `linear-gradient(90deg, ${accent}, ${accentLight})`, borderRadius: 2, marginBottom: '1.25rem', position: 'relative' }} />
        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', lineHeight: 1.7, color: '#e8d5c0', maxWidth: 480, margin: 0, position: 'relative' }}>
          {slogan}
        </p>
      </div>

      {/* Hauptinhalt */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: 520, width: '100%' }}>

          {/* Einladungstext – neuer Interessent: nur eine klare Aktion */}
          <p style={{ fontSize: '1.05rem', color: muted, textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.7 }}>
            Gib deinen Namen ein – und sieh sofort, wie deine eigene Galerie aussehen würde.
          </p>

          {/* Nur: Meine Galerie ausprobieren („Galerie ansehen“ / „Erwerben“ nicht hier – würden nur verwirren) */}
          <div style={{ background: bgCard, border: `2px solid ${accent}`, borderRadius: '14px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(181,74,30,0.10)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.1rem' }}>
              <span style={{ width: 52, height: 52, borderRadius: '12px', background: `${accent}15`, border: `1px solid ${accent}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>✏️</span>
              <span>
                <span style={{ display: 'block', fontWeight: 700, fontSize: '1.05rem', color: text, marginBottom: '0.2rem' }}>Meine Galerie ausprobieren</span>
                <span style={{ fontSize: '0.85rem', color: muted, lineHeight: 1.5 }}>Gib deinen Namen ein – und sieh sofort, wie deine eigene Galerie aussehen würde.</span>
              </span>
            </div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') startEntry('entwurf') }}
              placeholder="Dein Künstler- oder Galeriename"
              style={{ width: '100%', padding: '0.8rem 1rem', border: `1px solid #e0d5c5`, borderRadius: '10px', fontFamily: fontBody, fontSize: '0.98rem', background: bgWarm, color: text, marginBottom: '0.9rem', boxSizing: 'border-box', outline: 'none' }}
              onFocus={e => { e.currentTarget.style.borderColor = accent }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e0d5c5' }}
            />
            <button type="button" onClick={() => startEntry('entwurf')} style={{ width: '100%', padding: '0.9rem 1rem', background: `linear-gradient(135deg, ${accent} 0%, ${accentLight} 100%)`, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: fontBody, fontSize: '1rem', letterSpacing: '0.01em' }}>
              {name.trim() ? `„${name.trim()}" – Galerie starten →` : 'Galerie starten →'}
            </button>
          </div>

          {/* Weitere Optionen nur dezent – nicht für den allerersten Blick */}
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: muted }}>
            <button type="button" onClick={() => startEntry('ansicht')} style={{ background: 'none', border: 'none', color: muted, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Nur Galerie ansehen</button>
            {' · '}
            <a href={`mailto:${encodeURIComponent(PRODUCT_LIZENZ_ANFRAGE_EMAIL)}?subject=${encodeURIComponent(PRODUCT_LIZENZ_ANFRAGE_BETREFF)}`} style={{ color: muted, textDecoration: 'underline' }}>Lizenz anfragen</a>
          </p>

          {/* Fußzeile – AGB/Legal nur unten, nicht im Fokus */}
          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: muted, lineHeight: 2 }}>
            <Link to={AGB_ROUTE} style={{ color: muted, textDecoration: 'none' }}>AGB</Link>
            {' · '}
            {PRODUCT_COPYRIGHT}
            {' · '}
            <Link to={MOK2_ROUTE} style={{ color: muted, textDecoration: 'none' }}>mök2</Link>
          </p>
        </div>
      </div>

      {showAgbModal && <AgbModal agbCheckbox={agbCheckbox} setAgbCheckbox={setAgbCheckbox} pendingAction={pendingAction} setPendingAction={setPendingAction} setShowAgbModal={setShowAgbModal} doNavigate={doNavigate} bg={bgCard} text={text} accent={accent} muted={muted} accentSoft={`${accent}28`} fontHeading={fontHeading} fontBody={fontBody} shadow="0 16px 48px rgba(60,30,10,0.14)" />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANTE C – Modern & lebendig: sofortiger Eindruck, Farbe, Energie
// Dunkler Hero-Bereich mit Akzentfarbe, klare visuelle Hierarchie
// ═══════════════════════════════════════════════════════════════════════════════
function VariantC({ name, setName, slogan, startEntry, showAgbModal, setShowAgbModal, agbCheckbox, setAgbCheckbox, pendingAction, setPendingAction, doNavigate }: VariantProps) {
  const accent = '#ff8c42'        // K2-Orange
  const accentDeep = '#b54a1e'
  const bgDark = '#1a0f0a'
  const bgMid = '#2d1a14'
  const bgLight = '#f6f0e8'
  const bgCard = '#fffefb'
  const text = '#2a1f14'
  const textLight = '#fff5ee'
  const muted = '#7a6a58'
  const fontHeading = WERBEUNTERLAGEN_STIL.fontHeading
  const fontBody = WERBEUNTERLAGEN_STIL.fontBody

  return (
    <div style={{ background: bgLight, minHeight: '100vh', fontFamily: fontBody, color: text, display: 'flex', flexDirection: 'column' }}>
      <link rel="stylesheet" href={PROMO_FONTS_URL} />

      {/* Hero – dunkel, markant, lebendig */}
      <div style={{ background: `linear-gradient(160deg, ${bgDark} 0%, ${bgMid} 60%, ${accentDeep}44 100%)`, minHeight: 'clamp(280px, 45vw, 400px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 'clamp(3rem, 7vw, 5rem) clamp(1.5rem, 5vw, 4rem)', position: 'relative', overflow: 'hidden' }}>

        {/* Leuchtender Akzent-Spot */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '60%', height: '60%', background: `radial-gradient(ellipse, ${accent}25 0%, transparent 70%)`, pointerEvents: 'none' }} />

        {/* Dezente Linien-Deko */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, ${accent}08 39px, ${accent}08 40px)`, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 560 }}>
          <div style={{ display: 'inline-block', padding: '0.3rem 0.9rem', background: `${accent}28`, border: `1px solid ${accent}55`, borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            Jetzt kostenlos ausprobieren
          </div>
          <h1 style={{ fontFamily: fontHeading, fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', fontWeight: 700, color: textLight, margin: '0 0 1rem', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {PRODUCT_BRAND_NAME}
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#d4a574', lineHeight: 1.65, margin: 0, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
            {slogan}
          </p>
        </div>
      </div>

      {/* Aktions-Bereich – hell, auf hellem Grund */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(2rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem)' }}>
        <div style={{ maxWidth: 520, width: '100%' }}>

          {/* Haupt-CTA: Name eingeben + starten */}
          <div style={{ background: bgCard, border: `2px solid ${accent}`, borderRadius: '16px', padding: 'clamp(1.5rem, 4vw, 2rem)', boxShadow: `0 8px 32px ${accent}22`, marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: `${accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>✏️</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: text }}>Meine Galerie ausprobieren</div>
                <div style={{ fontSize: '0.82rem', color: muted }}>Name eingeben – sofort deine Galerie sehen</div>
              </div>
            </div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') startEntry('entwurf') }}
              placeholder="Dein Künstler- oder Galeriename"
              style={{ width: '100%', padding: '0.85rem 1rem', border: `1.5px solid ${accent}44`, borderRadius: '10px', fontFamily: fontBody, fontSize: '1rem', background: bgLight, color: text, marginBottom: '0.85rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={e => { e.currentTarget.style.borderColor = accent }}
              onBlur={e => { e.currentTarget.style.borderColor = `${accent}44` }}
            />
            <button type="button" onClick={() => startEntry('entwurf')}
              style={{ width: '100%', padding: '1rem 1rem', background: `linear-gradient(135deg, ${accent} 0%, ${accentDeep} 100%)`, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontFamily: fontBody, fontSize: '1.05rem', letterSpacing: '0.01em', boxShadow: `0 4px 16px ${accent}44`, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}55` }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${accent}44` }}
            >
              {name.trim() ? `„${name.trim()}" – Galerie starten →` : 'Galerie starten →'}
            </button>
          </div>

          {/* Weitere Optionen dezent – neuer Interessent soll zuerst „Galerie starten“ sehen */}
          <p style={{ textAlign: 'center', marginTop: '0.5rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: muted }}>
            <button type="button" onClick={() => startEntry('ansicht')} style={{ background: 'none', border: 'none', color: muted, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Nur Galerie ansehen</button>
            {' · '}
            <a href={`mailto:${encodeURIComponent(PRODUCT_LIZENZ_ANFRAGE_EMAIL)}?subject=${encodeURIComponent(PRODUCT_LIZENZ_ANFRAGE_BETREFF)}`} style={{ color: muted, textDecoration: 'underline' }}>Lizenz anfragen</a>
          </p>

          {/* Fußzeile */}
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: muted, lineHeight: 2 }}>
            <Link to={AGB_ROUTE} style={{ color: muted, textDecoration: 'none' }}>AGB</Link>
            {' · '}
            {PRODUCT_COPYRIGHT}
            {' · '}
            <Link to={MOK2_ROUTE} style={{ color: muted, textDecoration: 'none' }}>mök2</Link>
          </p>
        </div>
      </div>

      {showAgbModal && <AgbModal agbCheckbox={agbCheckbox} setAgbCheckbox={setAgbCheckbox} pendingAction={pendingAction} setPendingAction={setPendingAction} setShowAgbModal={setShowAgbModal} doNavigate={doNavigate} bg={bgCard} text={text} accent={accent} muted={muted} accentSoft={`${accent}28`} fontHeading={fontHeading} fontBody={fontBody} shadow={`0 16px 48px ${accent}22`} />}
    </div>
  )
}
