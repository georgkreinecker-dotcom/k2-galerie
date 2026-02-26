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
  heroSub: 'In 2 kurzen Fragen zeigen wir dir deine persönliche Galerie – danach führt dich ein Guide durch alle Bereiche (Werke, Events, Kassa, Start).',
  cta: 'Jetzt entdecken →',
  ctaSub: 'Kostenlos · Keine Anmeldung · 2 Minuten',

  q1: 'Wie würdest du dich beschreiben?',
  q1a: { emoji: '🎨', label: 'Ich male, zeichne, fotografiere – und liebe es', sub: 'Hobby oder Leidenschaft – die Freude steht im Mittelpunkt' },
  q1b: { emoji: '🌱', label: 'Ich nehme meine Kunst ernst – sie soll mich tragen', sub: 'Auf dem Weg zur Professionalisierung, hungrig nach Sichtbarkeit' },
  q1c: { emoji: '⭐', label: 'Ich bin bereits etabliert und suche das passende Werkzeug', sub: 'Ausstellungen, Sammler, professioneller Auftritt' },
  q1d: { emoji: '🏛️', label: 'Vereinsgalerie – eine eigene Welt', sub: 'Gemeinsamer Katalog, Mitglieder, gemeinsame Galerie – anders als die Solo-Galerie.' },

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
type Step = 'hero' | 'q1' | 'q3' | 'hub' | 'result'

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
  { emoji: '🖼️', name: 'Meine Werke',        sub: 'Fotos, Preise, Beschreibungen – deine Galerie füllen',          tab: 'werke' },
  { emoji: '🎟️', name: 'Events & Ausst.',     sub: 'Vernissagen planen, Einladungen & QR-Codes erstellen',           tab: 'eventplan' },
  { emoji: '✨', name: 'Aussehen & Design',   sub: 'Farben, Texte, dein Foto – die Galerie wird zu dir',             tab: 'design' },
  { emoji: '📋', name: 'Werkkatalog',         sub: 'Alle Werke auf einen Blick – filtern, suchen, drucken',          tab: 'katalog' },
  { emoji: '🧾', name: 'Kassa & Verkauf',     sub: 'Direkt verkaufen, Beleg drucken – auch vom Handy',               tab: 'statistik' },
  { emoji: '⚙️', name: 'Einstellungen',       sub: 'Kontakt, Adresse, Öffnungszeiten – deine Stammdaten',            tab: 'einstellungen' },
]

function HeroHub({ accent, accentLight, accentGlow, bgDark, bgMid, fontHeading, fontBody, onWeiter }: HeroHubProps) {
  const [aktivIdx, setAktivIdx] = useState(0)
  const navigate = useNavigate()
  const akzentGrad = `linear-gradient(135deg, ${accent}, ${accentGlow})`
  const halbePunkte = Math.ceil(HUB_STATIONEN.length / 2)
  const linksStationen = HUB_STATIONEN.slice(0, halbePunkte)
  const rechtsStationen = HUB_STATIONEN.slice(halbePunkte)
  const aktivStation = HUB_STATIONEN[aktivIdx]

  const oeffneTab = (tab: string) => {
    try { sessionStorage.setItem('k2-hub-from', '1') } catch (_) {}
    navigate(`/admin?context=oeffentlich&tab=${tab}&from=hub`)
  }

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
                <button key={i} type="button" onClick={() => istAktiv ? oeffneTab(st.tab) : setAktivIdx(i)}
                  title={istAktiv ? `${st.name} ansehen` : st.name}
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
                  {istAktiv && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.7 }}>→</span>}
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

            {/* Vorschau-Button + CTA */}
            <button type="button" onClick={() => oeffneTab(aktivStation.tab)}
              style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.1)', border: `1px solid ${accentGlow}55`, borderRadius: '12px', color: '#fff8f0', fontWeight: 600, cursor: 'pointer', fontFamily: fontBody, fontSize: '0.92rem', letterSpacing: '0.01em', transition: 'all 0.18s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}>
              {aktivStation.emoji} {aktivStation.name} ansehen →
            </button>

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
                <button key={globalIdx} type="button" onClick={() => istAktiv ? oeffneTab(st.tab) : setAktivIdx(globalIdx)}
                  title={istAktiv ? `${st.name} ansehen` : st.name}
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
                  {istAktiv && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.7 }}>→</span>}
                </button>
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Hub-Arbeitsbereich: nach den Fragen – alle Themen + Guide Mitte ─────────

interface HubArbProps {
  name: string; q1: string
  accent: string; accentLight: string; accentGlow: string
  bgDark: string; bgMid: string; bgLight: string
  fontHeading: string; fontBody: string
  onStarten: () => void
  onZurueck: () => void
}

// Stationen angepasst je nach Pfad (q1-Antwort)
function baueHubStationen(q1: string) {
  const istVerein = q1 === 'verein'

  if (istVerein) {
    return [
      {
        emoji: '🖼️',
        name: 'Werke & Mitglieder',
        beschreibung: 'Alle Werke aller Mitglieder an einem Ort. Jede:r hat ein eigenes Profil mit Fotos, Preisen und Beschreibungen.',
        tab: 'werke',
      },
      {
        emoji: '🤝',
        name: 'Mitgliederverwaltung',
        beschreibung: 'Mitglieder einladen, Zugänge vergeben, Beiträge verwalten – alles übersichtlich an einem Ort.',
        tab: 'einstellungen',
      },
      {
        emoji: '🎟️',
        name: 'Veranstaltungen',
        beschreibung: 'Ausstellungen und Vereinsevents planen, Einladungen an alle Mitglieder verschicken, QR-Codes für Besucher.',
        tab: 'eventplan',
      },
      {
        emoji: '📋',
        name: 'Vereinskatalog',
        beschreibung: 'Alle Werke des Vereins – filtern nach Mitglied, Technik, Preis – als Katalog drucken oder digital teilen.',
        tab: 'katalog',
      },
      {
        emoji: '✨',
        name: 'Aussehen & Marke',
        beschreibung: 'Farben, Logo, Vereinsname, Willkommensbild – die Galerie wird zum Gesicht eures Vereins.',
        tab: 'design',
      },
      {
        emoji: '🚀',
        name: 'Verein starten',
        beschreibung: 'Vereinsname, Kontakt, Adresse – einmal eingetragen und euer gemeinsamer Auftritt ist live.',
        tab: 'einstellungen',
        istStart: true,
      },
    ]
  }

  return [
    {
      emoji: '🖼️',
      name: 'Meine Werke',
      beschreibung: 'Foto aufnehmen, Titel und Preis eintragen – ein Klick und das Werk ist live in deiner Galerie.',
      tab: 'werke',
    },
    {
      emoji: '🎟️',
      name: 'Events & Ausstellungen',
      beschreibung: 'Vernissage planen, Einladungen erstellen, QR-Codes für Besucher – alles an einem Ort.',
      tab: 'eventplan',
    },
    {
      emoji: '✨',
      name: 'Aussehen & Design',
      beschreibung: q1 === 'etabliert'
        ? 'Professionelles Erscheinungsbild: Farben, Logo, Willkommensbild – passend zu deinem Stil.'
        : 'Farben, dein Foto, deine Texte – die Galerie wird zu deinem persönlichen Auftritt.',
      tab: 'design',
    },
    {
      emoji: '📋',
      name: 'Werkkatalog',
      beschreibung: q1 === 'etabliert' || q1 === 'aufsteigend'
        ? 'Zertifikate, Werkverzeichnis, Pressemappe – alles aus deinen Daten vorbefüllt, ein Klick zum Drucken.'
        : 'Alle deine Werke auf einen Blick – filtern, suchen, drucken.',
      tab: 'katalog',
    },
    {
      emoji: '🧾',
      name: 'Kassa & Verkauf',
      beschreibung: 'Werk verkauft? Eintragen, Beleg drucken – vom Handy direkt bei der Ausstellung. Ganz simpel.',
      tab: 'statistik',
    },
    {
      emoji: '🚀',
      name: 'Galerie starten',
      beschreibung: 'Kontakt und Adresse eintragen – dann ist deine Galerie sofort live. Keine Kreditkarte nötig.',
      tab: 'einstellungen',
      istStart: true,
    },
  ]
}

function HubArbeitsbereich({ name, q1, accent, accentLight, accentGlow, bgDark, bgMid, bgLight, fontHeading, fontBody, onStarten, onZurueck }: HubArbProps) {
  const [aktivIdx, setAktivIdx] = useState(0)
  const navigate = useNavigate()
  const istVerein = q1 === 'verein'

  // VK2 = blaue Akzentfarbe, ök2 = orange/braun
  const hubAccent      = istVerein ? '#1e5cb5' : accent
  const hubAccentGlow  = istVerein ? '#42a4ff' : accentGlow
  const hubContext     = istVerein ? 'vk2' : 'oeffentlich'

  const akzentGrad = `linear-gradient(135deg, ${hubAccent}, ${hubAccentGlow})`
  const avatarEmoji = istVerein ? '🏛️' : q1 === 'etabliert' ? '⭐' : q1 === 'aufsteigend' ? '🌱' : '👨‍🎨'
  const stationen = baueHubStationen(q1)
  const aktivStation = stationen[aktivIdx]
  const halbePunkte = Math.ceil(stationen.length / 2)
  const linksStationen = stationen.slice(0, halbePunkte)
  const rechtsStationen = stationen.slice(halbePunkte)

  const oeffneTab = (tab: string) => {
    try { sessionStorage.setItem('k2-hub-from', '1') } catch (_) {}
    navigate(`/admin?context=${hubContext}&tab=${tab}&from=hub`)
  }

  const begruessung = istVerein
    ? (name ? `${name} – das ist eure Vereinsgalerie.` : 'Das ist eure Vereinsgalerie.')
    : (name ? `${name}, das ist deine Galerie.` : 'Das ist deine Galerie.')
  const subText = istVerein
    ? 'Das ist dein Guide – klick auf einen Bereich und schaut, was euch erwartet.'
    : q1 === 'etabliert'
    ? 'Professionell. Vollständig. Sofort einsatzbereit.'
    : 'Das ist dein Guide – klick auf einen Bereich und schau, was dich erwartet.'

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${bgDark} 0%, ${bgMid} 55%, ${accent}28 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)',
      fontFamily: fontBody,
    }}>
      {/* Logo klein oben */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontFamily: fontHeading, fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: 700, color: accentGlow, letterSpacing: '-0.02em' }}>
          {PRODUCT_BRAND_NAME}
        </div>
      </div>

      {/* Begrüßung */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(1.25rem, 3vw, 2rem)', maxWidth: 600 }}>
        <h2 style={{ fontFamily: fontHeading, fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: '#fff8f0', margin: '0 0 0.5rem', lineHeight: 1.2 }}>
          {begruessung}
        </h2>
        <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          {subText}
        </p>
      </div>

      {/* Hub-Layout: Kacheln links | Guide-Dialog Mitte | Kacheln rechts */}
      <div style={{ width: '100%', maxWidth: 800, display: 'flex', gap: 'clamp(0.5rem, 2vw, 1rem)', alignItems: 'stretch' }}>

        {/* Kacheln links */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem', width: 'clamp(115px, 18vw, 150px)', flexShrink: 0 }}>
          {linksStationen.map((st, i) => {
            const istAktiv = aktivIdx === i
            return (
              <button key={i} type="button" onClick={() => setAktivIdx(i)}
                style={{
                  padding: '0.7rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: istAktiv ? akzentGrad : 'rgba(255,255,255,0.06)',
                  border: istAktiv ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '13px', cursor: 'pointer', fontFamily: fontBody,
                  transition: 'all 0.18s', textAlign: 'left' as const,
                  boxShadow: istAktiv ? `0 4px 16px ${accent}55` : 'none',
                  color: istAktiv ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontWeight: istAktiv ? 700 : 400,
                  position: 'relative' as const,
                }}>
                <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{st.emoji}</span>
                <span style={{ fontSize: '0.74rem', lineHeight: 1.3 }}>{st.name}</span>
                {istAktiv && <span style={{ position: 'absolute', top: 4, right: 6, width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />}
              </button>
            )
          })}
        </div>

        {/* Guide-Dialog Mitte */}
        <div style={{
          flex: 1, minWidth: 0,
          background: 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${accentGlow}33`,
          borderRadius: '20px', padding: 'clamp(1.2rem, 3vw, 1.75rem)',
          display: 'flex', flexDirection: 'column' as const, gap: '0.9rem',
          backdropFilter: 'blur(14px)',
        }}>
          {/* Fortschrittsbalken – klickbar */}
          <div style={{ display: 'flex', gap: '0.22rem' }}>
            {stationen.map((_, i) => (
              <div key={i} onClick={() => setAktivIdx(i)}
                style={{ flex: 1, height: 3, borderRadius: 2, cursor: 'pointer', transition: 'background 0.2s',
                  background: i === aktivIdx ? accentGlow : i < aktivIdx ? `${accent}88` : 'rgba(255,255,255,0.12)' }}
              />
            ))}
          </div>

          {/* Avatar + Titel */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: akzentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, boxShadow: `0 4px 14px ${accent}55` }}>
              {avatarEmoji}
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', color: `${accentGlow}88`, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
                {istVerein ? 'Vereins-Guide' : 'Galerie-Guide'}
              </div>
              <div style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)', fontWeight: 700, color: '#fff8f0', marginTop: '0.1rem' }}>
                {aktivStation.emoji} {aktivStation.name}
              </div>
            </div>
          </div>

          {/* Beschreibung */}
          <div style={{ fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, flex: 1 }}>
            {aktivStation.beschreibung}
          </div>

          {/* Punkte-Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.32rem' }}>
            {stationen.map((_, i) => (
              <div key={i} onClick={() => setAktivIdx(i)} style={{ cursor: 'pointer', transition: 'all 0.2s',
                width: i === aktivIdx ? 18 : 7, height: 7, borderRadius: 4,
                background: i === aktivIdx ? accentGlow : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>

          {/* Aktions-Buttons – One-Click-Regel: eine klare Hauptaktion, keine drei konkurrierenden Buttons */}
          {'istStart' in aktivStation && aktivStation.istStart ? (
            <button type="button" onClick={onStarten}
              style={{ width: '100%', padding: '0.95rem', background: akzentGrad, border: 'none', borderRadius: '14px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: fontBody, fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', boxShadow: `0 6px 24px ${hubAccent}55`, letterSpacing: '0.01em' }}>
              🚀 {istVerein ? (name ? `${name} – Vereinsgalerie` : 'Vereinsgalerie') : (name ? `${name}'s Galerie` : 'Galerie')} jetzt öffnen →
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.6rem' }}>
              {'tab' in aktivStation && (aktivStation as { tab?: string }).tab && (
                <button type="button" onClick={() => oeffneTab((aktivStation as { tab: string }).tab)}
                  style={{ width: '100%', padding: '0.85rem', background: akzentGrad, border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: fontBody, fontSize: '0.9rem', boxShadow: `0 4px 14px ${accent}44` }}>
                  {aktivStation.emoji} {aktivStation.name} öffnen →
                </button>
              )}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.78rem' }}>
                <button type="button" onClick={() => setAktivIdx(Math.min(aktivIdx + 1, stationen.length - 1))}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: fontBody, textDecoration: 'underline', padding: 0 }}>
                  Nächste Station →
                </button>
                <button type="button" onClick={onStarten}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: fontBody, textDecoration: 'underline', padding: 0 }}>
                  Galerie ansehen →
                </button>
              </div>
            </div>
          )}

          <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
            Kostenlos · Keine Anmeldung · Jederzeit kündbar
          </div>
        </div>

        {/* Kacheln rechts */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem', width: 'clamp(115px, 18vw, 150px)', flexShrink: 0 }}>
          {rechtsStationen.map((st, i) => {
            const globalIdx = halbePunkte + i
            const istAktiv = aktivIdx === globalIdx
            return (
              <button key={globalIdx} type="button" onClick={() => setAktivIdx(globalIdx)}
                style={{
                  padding: '0.7rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: istAktiv ? akzentGrad : 'rgba(255,255,255,0.06)',
                  border: istAktiv ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '13px', cursor: 'pointer', fontFamily: fontBody,
                  transition: 'all 0.18s', textAlign: 'left' as const,
                  boxShadow: istAktiv ? `0 4px 16px ${accent}55` : 'none',
                  color: istAktiv ? '#fff' : 'rgba(255,255,255,0.65)',
                  fontWeight: istAktiv ? 700 : 400,
                  position: 'relative' as const,
                }}>
                <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{st.emoji}</span>
                <span style={{ fontSize: '0.74rem', lineHeight: 1.3 }}>{st.name}</span>
                {istAktiv && <span style={{ position: 'absolute', top: 4, right: 6, width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />}
              </button>
            )
          })}
        </div>

      </div>

      {/* Zurück-Link */}
      <button type="button" onClick={onZurueck}
        style={{ marginTop: '1.25rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontFamily: fontBody, fontSize: '0.78rem' }}>
        ← zurück
      </button>
    </div>
  )
}

export default function EntdeckenPage() {
  const navigate = useNavigate()
  // ?step=hub → direkt zum Hub springen (z.B. Zurück-Button vom Admin)
  // ?q1=verein → Vereins-Antwort vorausfüllen
  const initialStep: Step = (() => {
    try {
      const p = new URLSearchParams(window.location.search).get('step')
      if (p === 'hub') return 'hub'
    } catch (_) {}
    return 'hero'
  })()
  const initialQ1 = (() => {
    try { return new URLSearchParams(window.location.search).get('q1') ?? '' } catch (_) { return '' }
  })()
  const [step, setStep] = useState<Step>(initialStep)
  const [answers, setAnswers] = useState<Answers>({ q1: initialQ1, q2: '', q3: '' })
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
    const istVerein = answers.q1 === 'verein'
    try {
      sessionStorage.setItem('k2-entdecken-q1', answers.q1)
      if (name) {
        sessionStorage.setItem(WILLKOMMEN_NAME_KEY, name)
        sessionStorage.setItem(WILLKOMMEN_ENTWURF_KEY, '1')
        localStorage.setItem(WILLKOMMEN_NAME_KEY, name)
        localStorage.setItem(WILLKOMMEN_ENTWURF_KEY, '1')
      }
    } catch (_) {}
    // Verein → VK2-Galerie, sonst → ök2-Galerie-Vorschau (dort personalisierter Guide)
    const url = istVerein
      ? PROJECT_ROUTES.vk2.galerieVorschau
      : PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau
    const params = name ? `?vorname=${encodeURIComponent(name)}&entwurf=1` : ''
    navigate(url + params)
  }

  // ─── Hilfs-Komponente: Auswahl-Karte ────────────────────────────────────────
  function ChoiceCard({ emoji, label, sub, selected, onClick, color }: { emoji: string; label: string; sub: string; selected: boolean; onClick: () => void; color?: string }) {
    const c = color ?? accent
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
          background: selected ? `${c}12` : bgCard,
          border: `2px solid ${selected ? c : '#e0d5c5'}`,
          borderRadius: '14px',
          cursor: 'pointer',
          fontFamily: fontBody,
          textAlign: 'left',
          marginBottom: '0.65rem',
          transition: 'all 0.18s',
          boxShadow: selected ? `0 4px 16px ${c}22` : '0 1px 4px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = `${c}66`; e.currentTarget.style.background = `${c}06` } }}
        onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = '#e0d5c5'; e.currentTarget.style.background = bgCard } }}
      >
        <span style={{ fontSize: '1.6rem', lineHeight: 1, flexShrink: 0, marginTop: '0.1rem' }}>{emoji}</span>
        <span>
          <span style={{ display: 'block', fontWeight: 700, fontSize: '0.98rem', color: selected ? c : text, marginBottom: '0.18rem' }}>{label}</span>
          <span style={{ fontSize: '0.82rem', color: muted, lineHeight: 1.45 }}>{sub}</span>
        </span>
        {selected && <span style={{ marginLeft: 'auto', color: c, fontSize: '1.2rem', flexShrink: 0, alignSelf: 'center' }}>✓</span>}
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

      {/* ── HERO: Dunkler Eingang mit Galerie-Foto ───────────────────────────── */}
      {step === 'hero' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: `linear-gradient(160deg, ${bgDark} 0%, ${bgMid} 100%)` }}>
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
            alignItems: 'stretch', overflow: 'hidden',
          }}>
            {/* Linke Seite: Text */}
            <div style={{
              flex: '1 1 340px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: 'clamp(3rem, 8vw, 5rem) clamp(2rem, 6vw, 4rem)',
              position: 'relative', zIndex: 1,
            }}>
              <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '60%', height: '60%', background: `radial-gradient(ellipse, ${accentGlow}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontFamily: fontHeading, fontSize: '1rem', color: accentGlow, fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>
                  {PRODUCT_BRAND_NAME}
                </div>
                <div style={{ display: 'inline-block', padding: '0.3rem 1rem', background: `${accentGlow}22`, border: `1px solid ${accentGlow}44`, borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, color: accentGlow, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '1.25rem' }}>
                  {T.heroTag}
                </div>
                <h1 style={{ fontFamily: fontHeading, fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 700, color: textLight, margin: '0 0 1.25rem', lineHeight: 1.15, letterSpacing: '-0.02em', maxWidth: 480 }}>
                  {T.heroTitle}
                </h1>
                <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#d4a574', lineHeight: 1.7, maxWidth: 420, marginBottom: '2.5rem' }}>
                  {T.heroSub}
                </p>
                <button type="button" onClick={() => setStep('q1')}
                  style={{ display: 'inline-block', padding: 'clamp(0.85rem, 2vw, 1.05rem) clamp(2rem, 4vw, 2.75rem)', background: `linear-gradient(135deg, ${accentGlow} 0%, ${accent} 100%)`, color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 700, cursor: 'pointer', fontFamily: fontBody, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', letterSpacing: '0.01em', boxShadow: `0 8px 32px ${accentGlow}44`, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}>
                  {T.cta}
                </button>
                <p style={{ marginTop: '0.9rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>{T.ctaSub}</p>
              </div>
            </div>

            {/* Rechte Seite: Foto */}
            <div style={{
              flex: '1 1 320px', position: 'relative', minHeight: 320, overflow: 'hidden',
            }}>
              <img
                src="/img/oeffentlich/willkommen.jpg"
                alt="Galerie Vorschau"
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center',
                  opacity: 0.75,
                }}
              />
              {/* Gradient-Übergang links zum Text */}
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${bgDark} 0%, transparent 35%)`, pointerEvents: 'none' }} />
              {/* Gradient unten */}
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${bgDark} 0%, transparent 40%)`, pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Trust-Leiste */}
          <div style={{ background: 'rgba(0,0,0,0.35)', borderTop: `1px solid rgba(255,255,255,0.06)`, padding: '0.9rem clamp(1.5rem, 4vw, 3rem)', display: 'flex', justifyContent: 'center', gap: 'clamp(1.5rem, 4vw, 3rem)', flexWrap: 'wrap' }}>
            {['🎨 Für jede Kunstart', '📱 Auf jedem Gerät', '🔒 Keine Anmeldung nötig'].map(item => (
              <span key={item} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>{item}</span>
            ))}
          </div>
        </div>
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
                <ChoiceCard {...T.q1d} selected={answers.q1 === 'verein'} onClick={() => setAnswers(a => ({ ...a, q1: 'verein' }))} color="#1e5cb5" />
                {answers.q1 === 'verein' && (
                  <p style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(30, 92, 181, 0.08)', border: '1px solid rgba(30, 92, 181, 0.25)', borderRadius: '12px', fontSize: '0.85rem', color: '#1e5cb5', lineHeight: 1.5 }}>
                    Du gehst in die <strong>Vereinsgalerie</strong> – eine andere Welt: gemeinsamer Katalog, Mitglieder, gemeinsame Ausstellungen. Nächster Schritt: Name eingeben, dann siehst du sie.
                  </p>
                )}
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
                  onKeyDown={e => { if (e.key === 'Enter') setStep('hub') }}
                  placeholder={T.q3placeholder}
                  autoFocus
                  style={{ width: '100%', padding: '1rem 1.25rem', border: `2px solid ${accent}44`, borderRadius: '12px', fontFamily: fontHeading, fontSize: '1.1rem', background: bgCard, color: text, marginBottom: '1rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => { e.currentTarget.style.borderColor = accent }}
                  onBlur={e => { e.currentTarget.style.borderColor = `${accent}44` }}
                />
                <button
                  type="button"
                  onClick={() => setStep('hub')}
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

      {/* ── HUB: Alle Themen + Guide in der Mitte als Arbeitsbereich ─────────── */}
      {step === 'hub' && (
        <HubArbeitsbereich
          name={answers.q3.trim()}
          q1={answers.q1}
          accent={accent}
          accentLight={accentLight}
          accentGlow={accentGlow}
          bgDark={bgDark}
          bgMid={bgMid}
          bgLight={bgLight}
          fontHeading={fontHeading}
          fontBody={fontBody}
          onStarten={goToDemo}
          onZurueck={() => setStep('q3')}
        />
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
