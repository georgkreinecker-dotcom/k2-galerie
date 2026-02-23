/**
 * EntdeckenPage – Landingpage für neue Künstler:innen
 * Route: /entdecken
 *
 * 3-Fragen-Flow → persönliche Demo (ök2-Galerie)
 * Kein Verkaufsdruck, kein Formular, kein Anmeldeformular.
 * Am Ende: verblüffender Moment – „Das ist deine Galerie."
 */

import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PROJECT_ROUTES, AGB_ROUTE, WILLKOMMEN_NAME_KEY, WILLKOMMEN_ENTWURF_KEY } from '../config/navigation'
import { PRODUCT_BRAND_NAME, PRODUCT_FEEDBACK_EMAIL, PRODUCT_FEEDBACK_BETREFF } from '../config/tenantConfig'
import { WERBEUNTERLAGEN_STIL, PROMO_FONTS_URL } from '../config/marketingWerbelinie'

// ─── Erkundungs-Notizen ───────────────────────────────────────────────────────
export const ERKUNDUNGS_NOTIZEN_KEY = 'k2-erkundungs-notizen'

export interface ErkundungsNotiz {
  id: string
  text: string
  step: string
  zeit: string
}

function ladeNotizen(): ErkundungsNotiz[] {
  try {
    const v = localStorage.getItem(ERKUNDUNGS_NOTIZEN_KEY)
    if (v) return JSON.parse(v)
  } catch (_) {}
  return []
}

function speichereNotiz(text: string, step: string) {
  const notizen = ladeNotizen()
  notizen.push({
    id: Date.now().toString(),
    text: text.trim(),
    step,
    zeit: new Date().toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' }),
  })
  try { localStorage.setItem(ERKUNDUNGS_NOTIZEN_KEY, JSON.stringify(notizen)) } catch (_) {}
}

// ─── Texte (hier zentral, später leicht übersetzbar) ─────────────────────────
const T = {
  heroTag: 'Für Künstler:innen die gesehen werden wollen',
  heroTitle: 'Deine Kunst verdient mehr als einen Instagram-Post.',
  heroSub: 'In 2 kurzen Fragen zeigen wir dir deine persönliche Galerie – und ein Guide begleitet dich durch alles.',
  cta: 'Jetzt entdecken →',
  ctaSub: 'Kostenlos · Keine Anmeldung · 2 Minuten',

  q1: 'Wie würdest du dich beschreiben?',
  q1a: { emoji: '🎨', label: 'Ich male, zeichne, fotografiere – und liebe es', sub: 'Hobby oder Leidenschaft – die Freude steht im Mittelpunkt' },
  q1b: { emoji: '🌱', label: 'Ich nehme meine Kunst ernst – sie soll mich tragen', sub: 'Auf dem Weg zur Professionalisierung, hungrig nach Sichtbarkeit' },
  q1c: { emoji: '⭐', label: 'Ich bin bereits etabliert und suche das passende Werkzeug', sub: 'Ausstellungen, Sammler, professioneller Auftritt' },
  q1d: { emoji: '🏛️', label: 'Ich bin Teil einer Gemeinschaft – Verein oder Gruppe', sub: 'Wir wollen unsere Werke gemeinsam zeigen' },

  q2: 'Was ist dir am wichtigsten?',
  q2a: { emoji: '✨', label: 'Meine Werke schön und würdig präsentieren', sub: 'Ein Ort der meiner Kunst gerecht wird' },
  q2b: { emoji: '🤝', label: 'Interessenten und Käufer finden', sub: 'Kontakt, Anfragen, Verkauf ermöglichen' },
  q2c: { emoji: '📋', label: 'Mein Werk dokumentieren und archivieren', sub: 'Zertifikate, Werkverzeichnis, Provenienz' },
  q2d: { emoji: '🚀', label: 'Professionell auftreten ohne IT-Kenntnisse', sub: 'Einfach, schnell, sofort vorzeigbar' },

  q3: 'Wie heißt du – oder deine Galerie?',
  q3placeholder: 'Dein Künstlername oder Galeriename',
  q3hint: 'Nur für deine persönliche Vorschau – nichts wird gespeichert.',

  btnNext: 'Weiter →',
  btnBack: '← Zurück',
  btnFinish: 'Meine Galerie zeigen →',
  btnFinishName: (n: string) => `„${n}" – Galerie öffnen →`,

  resultTitle: (n: string) => n ? `Das ist ${n}'s Galerie.` : 'Das ist deine Galerie.',
  resultSub: 'Kein Design-Kurs. Kein IT-Wissen. Einfach fertig.',
  resultCta: 'Galerie jetzt ansehen →',
  resultNoPressure: 'Kein Kauf nötig. Schau dich einfach um.',

  footNote: 'Keine E-Mail, kein Passwort, kein Vertrag.',
}

// q2 entfällt – der Guide auf der Galerie-Seite übernimmt die Tiefenanalyse
type Step = 'hero' | 'q1' | 'q3' | 'result'

interface Answers {
  q1: string
  q2: string
  q3: string
}

// ─── Hero-Hub: Brand-Logo + Themen-Übersicht ─────────────────────────────────
interface HeroHubProps {
  accent: string; accentLight: string; accentGlow: string
  bgDark: string; bgMid: string
  fontHeading: string; fontBody: string
  onWeiter: () => void
}

const HUB_STATIONEN = [
  { emoji: '🖼️', name: 'Meine Werke',        sub: 'Fotos, Preise, Beschreibungen – deine Galerie füllen' },
  { emoji: '🎟️', name: 'Events & Ausst.',     sub: 'Vernissagen planen, Einladungen & QR-Codes erstellen' },
  { emoji: '✨', name: 'Aussehen & Design',   sub: 'Farben, Texte, dein Foto – die Galerie wird zu dir' },
  { emoji: '📋', name: 'Werkkatalog',         sub: 'Alle Werke auf einen Blick – filtern, suchen, drucken' },
  { emoji: '🧾', name: 'Kassa & Verkauf',     sub: 'Direkt verkaufen, Beleg drucken – auch vom Handy' },
  { emoji: '⚙️', name: 'Einstellungen',       sub: 'Kontakt, Adresse, Öffnungszeiten – deine Stammdaten' },
]

function HeroHub({ accent, accentLight, accentGlow, bgDark, bgMid, fontHeading, fontBody, onWeiter }: HeroHubProps) {
  const [aktivIdx, setAktivIdx] = useState(0)
  const akzentGrad = `linear-gradient(135deg, ${accent}, ${accentGlow})`
  const halbePunkte = Math.ceil(HUB_STATIONEN.length / 2)
  const linksStationen = HUB_STATIONEN.slice(0, halbePunkte)
  const rechtsStationen = HUB_STATIONEN.slice(halbePunkte)
  const aktivStation = HUB_STATIONEN[aktivIdx]

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${bgDark} 0%, ${bgMid} 60%, ${accent}22 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 'clamp(2rem, 5vw, 3.5rem) clamp(1rem, 4vw, 2rem)',
      fontFamily: fontBody,
    }}>
      {/* ── Brand-Logo ── */}
      <div style={{ marginBottom: 'clamp(2rem, 5vw, 3rem)', textAlign: 'center' }}>
        <div style={{ fontFamily: fontHeading, fontSize: 'clamp(2.2rem, 6vw, 3.2rem)', fontWeight: 700, color: accentGlow, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {PRODUCT_BRAND_NAME}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.3rem' }}>
          Galerie · für Künstler:innen
        </div>
      </div>

      {/* ── Hub ── */}
      <div style={{ width: '100%', maxWidth: 760 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            Klick auf einen Bereich – sieh was dich erwartet.
          </div>
        </div>

        {/* Hub-Layout */}
        <div style={{ display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', alignItems: 'stretch' }}>

          {/* Kacheln links */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.45rem', width: 'clamp(110px, 18vw, 145px)', flexShrink: 0 }}>
            {linksStationen.map((st, i) => {
              const istAktiv = aktivIdx === i
              return (
                <button key={i} type="button" onClick={() => setAktivIdx(i)}
                  style={{
                    padding: '0.6rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.45rem',
                    background: istAktiv ? akzentGrad : 'rgba(255,255,255,0.05)',
                    border: istAktiv ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', cursor: 'pointer', fontFamily: fontBody,
                    transition: 'all 0.18s', textAlign: 'left' as const,
                    boxShadow: istAktiv ? `0 4px 16px ${accent}55` : 'none',
                    color: istAktiv ? '#fff' : 'rgba(255,255,255,0.6)',
                    fontWeight: istAktiv ? 700 : 400,
                  }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{st.emoji}</span>
                  <span style={{ fontSize: '0.72rem', lineHeight: 1.3 }}>{st.name}</span>
                </button>
              )
            })}
          </div>

          {/* Mittelteil – aktive Station */}
          <div style={{
            flex: 1, minWidth: 0,
            background: 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${accentGlow}33`,
            borderRadius: '18px', padding: '1.5rem',
            display: 'flex', flexDirection: 'column' as const, gap: '1rem',
            backdropFilter: 'blur(12px)',
          }}>
            {/* Fortschrittsbalken */}
            <div style={{ display: 'flex', gap: '0.2rem' }}>
              {HUB_STATIONEN.map((_, i) => (
                <div key={i} onClick={() => setAktivIdx(i)}
                  style={{ flex: 1, height: 3, borderRadius: 2, cursor: 'pointer', transition: 'background 0.2s',
                    background: i === aktivIdx ? accentGlow : i < aktivIdx ? `${accent}88` : 'rgba(255,255,255,0.12)' }}
                />
              ))}
            </div>

            {/* Avatar + Titel */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: akzentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, boxShadow: `0 4px 14px ${accent}44` }}>
                👨‍🎨
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: `${accentGlow}88`, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>Dein Galerie-Guide</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff8f0', marginTop: '0.1rem' }}>
                  {aktivStation.emoji} {aktivStation.name}
                </div>
              </div>
            </div>

            {/* Beschreibung */}
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, flex: 1 }}>
              {aktivStation.sub}
            </div>

            {/* Station-Punkte */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem' }}>
              {HUB_STATIONEN.map((_, i) => (
                <div key={i} onClick={() => setAktivIdx(i)} style={{ cursor: 'pointer',
                  width: i === aktivIdx ? 18 : 7, height: 7, borderRadius: 4,
                  background: i === aktivIdx ? accentGlow : 'rgba(255,255,255,0.18)', transition: 'all 0.2s' }} />
              ))}
            </div>

            {/* CTA */}
            <button type="button" onClick={onWeiter}
              style={{ width: '100%', padding: '0.95rem', background: akzentGrad, border: 'none', borderRadius: '14px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: fontBody, fontSize: '1.05rem', boxShadow: `0 6px 24px ${accent}44`, letterSpacing: '0.01em' }}>
              Jetzt starten – kostenlos & ohne Anmeldung →
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>
              2 kurze Fragen · dann deine persönliche Galerie
            </div>
          </div>

          {/* Kacheln rechts */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.45rem', width: 'clamp(110px, 18vw, 145px)', flexShrink: 0 }}>
            {rechtsStationen.map((st, i) => {
              const globalIdx = halbePunkte + i
              const istAktiv = aktivIdx === globalIdx
              return (
                <button key={globalIdx} type="button" onClick={() => setAktivIdx(globalIdx)}
                  style={{
                    padding: '0.6rem 0.7rem', display: 'flex', alignItems: 'center', gap: '0.45rem',
                    background: istAktiv ? akzentGrad : 'rgba(255,255,255,0.05)',
                    border: istAktiv ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', cursor: 'pointer', fontFamily: fontBody,
                    transition: 'all 0.18s', textAlign: 'left' as const,
                    boxShadow: istAktiv ? `0 4px 16px ${accent}55` : 'none',
                    color: istAktiv ? '#fff' : 'rgba(255,255,255,0.6)',
                    fontWeight: istAktiv ? 700 : 400,
                  }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{st.emoji}</span>
                  <span style={{ fontSize: '0.72rem', lineHeight: 1.3 }}>{st.name}</span>
                </button>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}

export default function EntdeckenPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('hero')
  const [answers, setAnswers] = useState<Answers>({ q1: '', q2: '', q3: '' })
  const [notizOffen, setNotizOffen] = useState(false)
  const [notizText, setNotizText] = useState('')
  const [notizGespeichert, setNotizGespeichert] = useState(false)

  const handleNotizSpeichern = useCallback(() => {
    if (!notizText.trim()) return
    speichereNotiz(notizText, step)
    setNotizText('')
    setNotizGespeichert(true)
    setTimeout(() => { setNotizGespeichert(false); setNotizOffen(false) }, 1200)
  }, [notizText, step])

  const accent = '#b54a1e'
  const accentLight = '#d4622a'
  const accentGlow = '#ff8c42'
  const bgDark = '#120a06'
  const bgMid = '#1e1008'
  const bgLight = '#f9f5ef'
  const bgCard = '#fffefb'
  const text = '#2a1f14'
  const textLight = '#fff8f0'
  const muted = '#7a6a58'
  const fontHeading = WERBEUNTERLAGEN_STIL.fontHeading
  const fontBody = WERBEUNTERLAGEN_STIL.fontBody

  const goToDemo = () => {
    const name = answers.q3.trim()
    try {
      // Name in sessionStorage + localStorage schreiben (doppelt sicher)
      if (name) {
        sessionStorage.setItem(WILLKOMMEN_NAME_KEY, name)
        sessionStorage.setItem(WILLKOMMEN_ENTWURF_KEY, '1')
        localStorage.setItem(WILLKOMMEN_NAME_KEY, name)
        localStorage.setItem(WILLKOMMEN_ENTWURF_KEY, '1')
      }
    } catch (_) {}
    // Zur öffentlichen Galerie – der Besucher erlebt sie wie ein echter Gast
    // Guide-Fragen laufen dort weiter (progressiver Flow)
    const url = PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
    const params = name ? `?vorname=${encodeURIComponent(name)}&entwurf=1` : ''
    navigate(url + params)
  }

  // ─── Hilfs-Komponente: Auswahl-Karte ────────────────────────────────────────
  function ChoiceCard({ emoji, label, sub, selected, onClick }: { emoji: string; label: string; sub: string; selected: boolean; onClick: () => void }) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          padding: '1.1rem 1.25rem',
          background: selected ? `${accent}12` : bgCard,
          border: `2px solid ${selected ? accent : '#e0d5c5'}`,
          borderRadius: '14px',
          cursor: 'pointer',
          fontFamily: fontBody,
          textAlign: 'left',
          marginBottom: '0.65rem',
          transition: 'all 0.18s',
          boxShadow: selected ? `0 4px 16px ${accent}22` : '0 1px 4px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = `${accent}66`; e.currentTarget.style.background = `${accent}06` } }}
        onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = '#e0d5c5'; e.currentTarget.style.background = bgCard } }}
      >
        <span style={{ fontSize: '1.6rem', lineHeight: 1, flexShrink: 0, marginTop: '0.1rem' }}>{emoji}</span>
        <span>
          <span style={{ display: 'block', fontWeight: 700, fontSize: '0.98rem', color: selected ? accent : text, marginBottom: '0.18rem' }}>{label}</span>
          <span style={{ fontSize: '0.82rem', color: muted, lineHeight: 1.45 }}>{sub}</span>
        </span>
        {selected && <span style={{ marginLeft: 'auto', color: accent, fontSize: '1.2rem', flexShrink: 0, alignSelf: 'center' }}>✓</span>}
      </button>
    )
  }

  // ─── Progress-Punkte ────────────────────────────────────────────────────────
  function Progress() {
    const steps: Step[] = ['q1', 'q3']
    const current = steps.indexOf(step as Step)
    return (
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.75rem' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ width: i <= current ? 24 : 8, height: 8, borderRadius: 4, background: i <= current ? accent : '#e0d5c5', transition: 'all 0.3s' }} />
        ))}
      </div>
    )
  }

  // ─── Wrapper ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: bgLight, minHeight: '100vh', fontFamily: fontBody, color: text }}>
      <link rel="stylesheet" href={PROMO_FONTS_URL} />

      {/* ── HERO: Brand-Logo + Hub-Vorschau ──────────────────────────────────── */}
      {step === 'hero' && (
        <HeroHub
          accent={accent}
          accentLight={accentLight}
          accentGlow={accentGlow}
          bgDark={bgDark}
          bgMid={bgMid}
          fontHeading={fontHeading}
          fontBody={fontBody}
          onWeiter={() => setStep('q1')}
        />
      )}

      {/* ── FRAGEN-FLOW ──────────────────────────────────────────────────────── */}
      {(step === 'q1' || step === 'q3') && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)' }}>
          <div style={{ maxWidth: 540, width: '100%' }}>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: fontHeading, fontSize: '1.1rem', color: accent, fontWeight: 700 }}>{PRODUCT_BRAND_NAME}</span>
            </div>

            <Progress />

            {/* Frage 1 */}
            {step === 'q1' && (
              <>
                <h2 style={{ fontFamily: fontHeading, fontSize: 'clamp(1.3rem, 3.5vw, 1.7rem)', fontWeight: 700, color: text, textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.3 }}>
                  {T.q1}
                </h2>
                <ChoiceCard {...T.q1a} selected={answers.q1 === 'hobby'} onClick={() => setAnswers(a => ({ ...a, q1: 'hobby' }))} />
                <ChoiceCard {...T.q1b} selected={answers.q1 === 'aufsteigend'} onClick={() => setAnswers(a => ({ ...a, q1: 'aufsteigend' }))} />
                <ChoiceCard {...T.q1c} selected={answers.q1 === 'etabliert'} onClick={() => setAnswers(a => ({ ...a, q1: 'etabliert' }))} />
                <ChoiceCard {...T.q1d} selected={answers.q1 === 'verein'} onClick={() => setAnswers(a => ({ ...a, q1: 'verein' }))} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setStep('hero')} style={{ padding: '0.7rem 1.25rem', background: 'transparent', color: muted, border: `1px solid #e0d5c5`, borderRadius: '10px', cursor: 'pointer', fontFamily: fontBody, fontSize: '0.9rem' }}>{T.btnBack}</button>
                  <button type="button" disabled={!answers.q1} onClick={() => setStep('q3')} style={{ padding: '0.7rem 1.75rem', background: answers.q1 ? `linear-gradient(135deg, ${accent}, ${accentLight})` : '#ccc', color: '#fff', border: 'none', borderRadius: '10px', cursor: answers.q1 ? 'pointer' : 'not-allowed', fontFamily: fontBody, fontSize: '0.95rem', fontWeight: 700 }}>{T.btnNext}</button>
                </div>
              </>
            )}

            {/* Frage 2 (Name) */}
            {step === 'q3' && (
              <>
                <h2 style={{ fontFamily: fontHeading, fontSize: 'clamp(1.3rem, 3.5vw, 1.7rem)', fontWeight: 700, color: text, textAlign: 'center', marginBottom: '0.6rem', lineHeight: 1.3 }}>
                  {T.q3}
                </h2>
                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: muted, marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  {T.q3hint}
                </p>
                <input
                  type="text"
                  value={answers.q3}
                  onChange={e => setAnswers(a => ({ ...a, q3: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') { setStep('result'); goToDemo() } }}
                  placeholder={T.q3placeholder}
                  autoFocus
                  style={{ width: '100%', padding: '1rem 1.25rem', border: `2px solid ${accent}44`, borderRadius: '12px', fontFamily: fontHeading, fontSize: '1.1rem', background: bgCard, color: text, marginBottom: '1rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => { e.currentTarget.style.borderColor = accent }}
                  onBlur={e => { e.currentTarget.style.borderColor = `${accent}44` }}
                />
                <button
                  type="button"
                  onClick={() => { setStep('result'); goToDemo() }}
                  style={{ width: '100%', padding: '1.1rem', background: `linear-gradient(135deg, ${accentGlow} 0%, ${accent} 100%)`, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: fontBody, fontSize: '1.05rem', boxShadow: `0 6px 24px ${accent}33`, transition: 'all 0.2s', marginBottom: '0.75rem' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {answers.q3.trim() ? T.btnFinishName(answers.q3.trim()) : T.btnFinish}
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button type="button" onClick={() => setStep('q1')} style={{ padding: '0.6rem 1rem', background: 'transparent', color: muted, border: `1px solid #e0d5c5`, borderRadius: '10px', cursor: 'pointer', fontFamily: fontBody, fontSize: '0.85rem' }}>{T.btnBack}</button>
                  <span style={{ fontSize: '0.75rem', color: muted }}>{T.footNote}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── ERGEBNIS (kurz sichtbar vor Weiterleitung) ──────────────────────── */}
      {step === 'result' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 1.5rem', background: bgLight }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
          <h2 style={{ fontFamily: fontHeading, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: text, margin: '0 0 0.75rem', lineHeight: 1.2 }}>
            {T.resultTitle(answers.q3.trim())}
          </h2>
          <p style={{ fontSize: '1rem', color: muted, marginBottom: '0.5rem' }}>{T.resultSub}</p>
          <p style={{ fontSize: '0.85rem', color: muted }}>{T.resultNoPressure}</p>
        </div>
      )}

      {/* Feedback-Hinweis im Hero – subtil, für echte Nutzer sichtbar */}
      {step === 'hero' && (
        <div style={{ position: 'fixed', bottom: '5.5rem', right: '1.5rem', zIndex: 9998 }}>
          <div style={{ background: 'rgba(18,10,6,0.85)', border: '1px solid rgba(255,140,66,0.25)', borderRadius: '20px', padding: '0.35rem 0.85rem', fontSize: '0.72rem', color: 'rgba(255,140,66,0.6)', whiteSpace: 'nowrap', backdropFilter: 'blur(4px)' }}>
            Idee? Wunsch? →
          </div>
        </div>
      )}

      {/* Fußzeile */}
      {step !== 'result' && (
        <div style={{ textAlign: 'center', padding: '1rem', fontSize: '0.72rem', color: muted, borderTop: '1px solid #e8ddd0', background: bgCard }}>
          <Link to={AGB_ROUTE} style={{ color: muted, textDecoration: 'none' }}>AGB</Link>
          {' · '}
          {PRODUCT_BRAND_NAME}
          {' · '}
          <span>Kein Kauf nötig</span>
        </div>
      )}

      {/* ── FLOATING BUTTONS – nebeneinander unten rechts ────────────────── */}
      <div style={{ position: 'fixed', bottom: '1.25rem', right: '1.25rem', zIndex: 9999, display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '0.65rem' }}>

        {/* 🌟 Feedback für echte Nutzer */}
        <FeedbackButton step={step} fontBody={fontBody} accentGlow={'#ff8c42'} accent={'#b54a1e'} />

        {/* 💡 Notiz-Panel (nur für Georg sichtbar – erscheint immer) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          {notizOffen && (
            <div style={{ background: '#1a1008', border: '1px solid rgba(255,140,66,0.5)', borderRadius: '14px', padding: '1rem', width: 'min(280px, calc(100vw - 5rem))', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', position: 'absolute', bottom: '3.75rem', right: 0 }}>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,140,66,0.7)', marginBottom: '0.5rem', fontFamily: fontBody }}>
                💡 Meine Idee – landet im Smart Panel
              </div>
              {notizGespeichert ? (
                <div style={{ textAlign: 'center', padding: '0.75rem', color: '#86efac', fontSize: '0.9rem', fontWeight: 700 }}>✅ Gespeichert!</div>
              ) : (
                <>
                  <textarea
                    autoFocus
                    value={notizText}
                    onChange={e => setNotizText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleNotizSpeichern() }}
                    placeholder="Was fällt mir auf? Was würde ich ändern?"
                    rows={3}
                    style={{ width: '100%', padding: '0.65rem 0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,140,66,0.3)', borderRadius: '8px', color: '#fff8f0', fontFamily: fontBody, fontSize: '0.88rem', resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.55 }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setNotizOffen(false)} style={{ flex: 1, padding: '0.55rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: fontBody, fontSize: '0.82rem' }}>Abbrechen</button>
                    <button type="button" onClick={handleNotizSpeichern} disabled={!notizText.trim()} style={{ flex: 2, padding: '0.55rem', background: notizText.trim() ? 'linear-gradient(135deg, #ff8c42, #b54a1e)' : 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', color: '#fff', cursor: notizText.trim() ? 'pointer' : 'default', fontFamily: fontBody, fontSize: '0.88rem', fontWeight: 700 }}>
                      💾 Speichern
                    </button>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', textAlign: 'right', marginTop: '0.35rem' }}>⌘+Enter zum Speichern</div>
                </>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => { setNotizOffen(o => !o); setNotizText(''); setNotizGespeichert(false) }}
            title="Meine Idee notieren (Georg)"
            style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #ff8c42, #b54a1e)', border: 'none', cursor: 'pointer', fontSize: '1.4rem', boxShadow: '0 4px 20px rgba(255,140,66,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            {notizOffen ? '✕' : '💡'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Feedback-Button Komponente ───────────────────────────────────────────────
function FeedbackButton({ step, fontBody, accentGlow, accent }: { step: string; fontBody: string; accentGlow: string; accent: string }) {
  const [offen, setOffen] = useState(false)
  const [text, setText] = useState('')
  const [gesendet, setGesendet] = useState(false)

  const senden = () => {
    if (!text.trim()) return
    const betreff = encodeURIComponent(`${PRODUCT_FEEDBACK_BETREFF} (Schritt: ${step})`)
    const body = encodeURIComponent(text.trim())
    setGesendet(true)
    setText('')
    // E-Mail-Adresse wird nie im DOM sichtbar – nur im mailto-Link zur Laufzeit
    setTimeout(() => {
      window.location.href = `mailto:${PRODUCT_FEEDBACK_EMAIL}?subject=${betreff}&body=${body}`
    }, 2200)
    setTimeout(() => { setGesendet(false); setOffen(false) }, 4000)
  }

  return (
    <>
      {offen && (
        <div style={{ background: '#1a1008', border: `1px solid rgba(255,255,255,0.15)`, borderRadius: '14px', padding: '1rem', width: 'min(300px, calc(100vw - 2.5rem))', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontFamily: fontBody }}>
            🌟 Was würdest du dir wünschen oder verbessern?
          </div>
          {gesendet ? (
            <div style={{ textAlign: 'center', padding: '1.25rem 0.75rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>💚</div>
              <div style={{ fontFamily: fontBody, fontWeight: 700, fontSize: '1rem', color: '#fff8f0', marginBottom: '0.4rem', lineHeight: 1.3 }}>
                Danke für deine Mitarbeit!
              </div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                Dein Wunsch hilft dabei,<br />
                K2 Galerie besser zu machen.<br />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>Dein E-Mail-Programm öffnet sich gleich …</span>
              </div>
            </div>
          ) : (
            <>
              <textarea
                autoFocus
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) senden() }}
                placeholder="Dein Gedanke, dein Wunsch, deine Idee …"
                rows={3}
                style={{ width: '100%', padding: '0.65rem 0.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff8f0', fontFamily: fontBody, fontSize: '0.88rem', resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.55 }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setOffen(false)} style={{ flex: 1, padding: '0.55rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontFamily: fontBody, fontSize: '0.82rem' }}>Abbrechen</button>
                <button type="button" onClick={senden} disabled={!text.trim()} style={{ flex: 2, padding: '0.55rem', background: text.trim() ? `linear-gradient(135deg, ${accentGlow}, ${accent})` : 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px', color: '#fff', cursor: text.trim() ? 'pointer' : 'default', fontFamily: fontBody, fontSize: '0.88rem', fontWeight: 700 }}>
                  📨 Senden
                </button>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.18)', textAlign: 'right', marginTop: '0.35rem' }}>Öffnet dein E-Mail-Programm · ⌘+Enter</div>
            </>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => { setOffen(o => !o); setText(''); setGesendet(false) }}
        title="Wunsch oder Verbesserung senden"
        style={{ width: 52, height: 52, borderRadius: '50%', background: offen ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '1.3rem', boxShadow: '0 2px 12px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
        onMouseLeave={e => { e.currentTarget.style.background = offen ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)' }}
      >
        {offen ? '✕' : '🌟'}
      </button>
    </>
  )
}
