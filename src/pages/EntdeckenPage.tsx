/**
 * EntdeckenPage – **Eingangstor** (Georg): Landing für neue Nutzer:innen
 * Route: /entdecken (= OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE in navigation.ts)
 *
 * Hero + Tor-Bild + „Jetzt entdecken“ → 3-Fragen-Flow → persönliche Demo (ök2-Galerie).
 * Kein Verkaufsdruck, kein Formular, kein Anmeldeformular.
 * Am Ende: verblüffender Moment – „Das ist deine Galerie."
 */

import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { PROJECT_ROUTES, AGB_ROUTE } from '../config/navigation'
import { PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2 } from '../config/tenantConfig'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG, PRODUCT_LIZENZ_ANFRAGE_EMAIL, PRODUCT_LIZENZ_ANFRAGE_BETREFF } from '../config/tenantConfig'
import { WERBEUNTERLAGEN_STIL, PROMO_FONTS_URL } from '../config/marketingWerbelinie'
import { getPageContentEntdecken, getEntdeckenColorsFromK2Design } from '../config/pageContentEntdecken'

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

// ─── Texte (hier zentral; Hero-Texte überschreibbar aus Admin → Design → Eingangsseite) ─────────────────────────
const T_DEFAULTS = {
  heroTag: PRODUCT_WERBESLOGAN,
  heroTitle: PRODUCT_WERBESLOGAN_2,
  heroSub: 'Wähle deinen Weg – dann siehst du sofort, was dich erwartet.',
  heroDeviceHint: 'Am besten auf Tablet oder PC – dann siehst du alles auf einen Blick.',
  cta: 'Jetzt entdecken →',
  ctaSub: 'Kostenlos · Keine Anmeldung · 1 Minute',

  weg: 'Wofür interessierst du dich?',
  wegSolo: {
    emoji: '🖼️',
    label: 'Meine eigene Plattform',
    sub: 'Dein Corporate Design: eine Linie für die Galerie, Einladungen und Druck. Im Mittelpunkt steht Galerie gestalten – Farben, Bilder, Texte – alles andere baut darauf auf.',
  },
  wegVerein: { emoji: '🏛️', label: 'Vereinsplattform', sub: 'Gemeinsamer Katalog, Mitglieder, gemeinsame Plattform – eine eigene Welt.' },
  /** Kurzzeile unter der Weg-Frage (nur Kontext, kein Extra-Klick) */
  wegCdHinweis: 'Tipp: Bei „eigene Plattform“ legst du mit Galerie gestalten dein Erscheinungsbild fest – das ist dein Corporate Design, durchgängig und professionell.',

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
  resultNoPressure: 'Kein Erwerb nötig. Schau dich einfach um.',

  footNote: 'Keine E-Mail, kein Passwort, kein Vertrag.',
}
// T für Hero kommt aus getPageContentEntdecken() mit Fallback auf T_DEFAULTS; Rest wie T_DEFAULTS
const T = T_DEFAULTS

// q2 entfällt – der Guide auf der Galerie-Seite übernimmt die Tiefenanalyse
type Step = 'hero' | 'q1' | 'hub' | 'result'

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
  { emoji: '✨', name: 'Galerie gestalten und texten',  sub: 'Dein Corporate Design: Farben, Bilder, Texte – eine Linie für Web und Druck. Hier startet dein Auftritt.', tab: 'design', cdHerzstueck: true },
  { emoji: '🖼️', name: 'Meine Werke',                  sub: 'Fotos, Preise, Beschreibungen – deine Galerie füllen',     tab: 'werke' },
  { emoji: '🎟️', name: 'Events & Ausst.',               sub: 'Vernissagen planen, Einladungen & QR-Codes erstellen',  tab: 'eventplan' },
  { emoji: '📋', name: 'Werkkatalog',                   sub: 'Alle Werke auf einen Blick – filtern, suchen, drucken', tab: 'katalog' },
  { emoji: '🧾', name: 'Kassa & Verkauf',                sub: 'Direkt verkaufen, Beleg drucken – auch vom Handy',      tab: 'statistik' },
  { emoji: '⚙️', name: 'Einstellungen',                  sub: 'Kontakt, Adresse, Öffnungszeiten – deine Stammdaten',   tab: 'einstellungen' },
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
    navigate(`/mein-bereich?context=oeffentlich&tab=${tab}&from=hub`)
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
        <div style={{ fontFamily: fontHeading, fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, color: accentGlow, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {PRODUCT_BRAND_NAME}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '0.3rem' }}>
          Galerie · für Ideen und Produkte
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
                {'cdHerzstueck' in aktivStation && aktivStation.cdHerzstueck && (
                  <div style={{ marginTop: '0.35rem', marginBottom: '0.15rem', display: 'inline-block', padding: '0.18rem 0.45rem', borderRadius: 8, background: `${accent}38`, border: `1px solid ${accentGlow}55`, fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#fff8f0' }}>
                    Corporate Design · Mittelpunkt
                  </div>
                )}
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

// Stationen je nach Weg (solo = eigene Plattform, verein = Vereinsplattform) – keine Vermischung
function baueHubStationen(weg: string) {
  const istVerein = weg === 'verein'

  if (istVerein) {
    return [
      {
        emoji: '✨',
        name: 'Galerie gestalten und texten',
        beschreibung: 'Euer gemeinsames Erscheinungsbild: Logo, Farben, Vereinsname, Willkommensbild – das Corporate Design des Vereins. Web, Einladungen und Druck bleiben in einer Linie.',
        tab: 'design',
        cdHerzstueck: true,
      },
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
      emoji: '✨',
      name: 'Galerie gestalten und texten',
      beschreibung: 'Das Herzstück deines Corporate Design: Willkommensbild, Farben, Typo, Texte. Eine Linie – von der Website bis zu Einladungen und Plakaten. Alles andere (Werke, Events, Druck) nutzt genau diesen Look.',
      tab: 'design',
      cdHerzstueck: true,
    },
    {
      emoji: '🖼️',
      name: 'Meine Werke',
      beschreibung: 'Foto aufnehmen, Titel und Preis eintragen – ein Klick und das Werk ist live in deiner Galerie – im Look, den du unter Galerie gestalten festgelegt hast.',
      tab: 'werke',
    },
    {
      emoji: '🎟️',
      name: 'Events & Ausstellungen',
      beschreibung: 'Vernissage planen, Einladungen erstellen, QR-Codes für Besucher – im gleichen Erscheinungsbild wie deine Galerie.',
      tab: 'eventplan',
    },
    {
      emoji: '📋',
      name: 'Werkkatalog',
      beschreibung: 'Alle deine Werke auf einen Blick – filtern, suchen, drucken.',
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
  const avatarEmoji = istVerein ? '🏛️' : '👨‍🎨'
  const stationen = baueHubStationen(q1)
  const aktivStation = stationen[aktivIdx]
  const halbePunkte = Math.ceil(stationen.length / 2)
  const linksStationen = stationen.slice(0, halbePunkte)
  const rechtsStationen = stationen.slice(halbePunkte)

  const oeffneTab = (tab: string) => {
    try { sessionStorage.setItem('k2-hub-from', '1') } catch (_) {}
    const ctx = hubContext === 'oeffentlich' ? 'oeffentlich' : hubContext === 'vk2' ? 'vk2' : ''
    const q = `tab=${encodeURIComponent(tab)}&from=hub` + (ctx ? `&context=${ctx}` : '')
    navigate(`/mein-bereich?${q}`)
  }

  const begruessung = istVerein
    ? (name ? `${name} – das ist eure Vereinsplattform.` : 'Das ist eure Vereinsplattform.')
    : (name ? `${name}, das ist deine Galerie.` : 'Das ist deine Galerie.')
  const subText = istVerein
    ? 'Das ist dein Guide – klick auf einen Bereich und schaut, was euch erwartet.'
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
              {'cdHerzstueck' in aktivStation && aktivStation.cdHerzstueck && (
                <div style={{ marginTop: '0.35rem', marginBottom: '0.2rem', display: 'inline-block', padding: '0.2rem 0.5rem', borderRadius: 8, background: `${hubAccent}35`, border: `1px solid ${hubAccentGlow}66`, fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#fff8f0' }}>
                  Corporate Design · Mittelpunkt
                </div>
              )}
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
            <>
              <button type="button" onClick={onStarten}
                style={{ width: '100%', padding: '0.95rem', background: akzentGrad, border: 'none', borderRadius: '14px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: fontBody, fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', boxShadow: `0 6px 24px ${hubAccent}55`, letterSpacing: '0.01em' }}>
                🚀 {istVerein ? (name ? `${name} – Vereinsplattform` : 'Vereinsplattform') : (name ? `${name}'s Galerie` : 'Galerie')} jetzt öffnen →
              </button>
              <a href={`mailto:${encodeURIComponent(PRODUCT_LIZENZ_ANFRAGE_EMAIL)}?subject=${encodeURIComponent(PRODUCT_LIZENZ_ANFRAGE_BETREFF)}`} style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: hubAccent, textDecoration: 'none', display: 'inline-block' }}>
                Lizenz anfragen →
              </a>
            </>
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
  const location = useLocation()
  /** Beim Betreten Entdecken: Flag zurücksetzen, damit Direktaufrufer von galerie-oeffentlich wieder hierher umgeleitet werden. */
  useEffect(() => {
    try { sessionStorage.removeItem('k2-from-entdecken') } catch (_) {}
  }, [])
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
    try {
      const q = new URLSearchParams(window.location.search).get('weg') ?? new URLSearchParams(window.location.search).get('q1') ?? ''
      return q === 'verein' ? 'verein' : q === 'solo' ? 'solo' : ''
    } catch (_) { return '' }
  })()
  const [step, setStep] = useState<Step>(initialStep)
  const [answers, setAnswers] = useState<Answers>({ q1: initialQ1, q2: '', q3: '' })
  /** Hero-Bild: primary → SVG-Fallback → kein Bild (nie Fragezeichen-Icon) */
  const [heroImageSrc, setHeroImageSrc] = useState<'primary' | 'svg' | 'none'>('primary')
  /** Eingangsseite-Design aus Admin (Design → Eingangsseite); bei Update neu laden */
  const [entdeckenContent, setEntdeckenContent] = useState(() => getPageContentEntdecken())
  useEffect(() => {
    const onUpdate = () => setEntdeckenContent(getPageContentEntdecken())
    window.addEventListener('k2-page-content-entdecken-updated', onUpdate)
    return () => window.removeEventListener('k2-page-content-entdecken-updated', onUpdate)
  }, [])

  /** Farben immer aus K2-Design (Farbe ändern im Admin) – keine eigenen Eingangsseiten-Farben */
  const k2Colors = getEntdeckenColorsFromK2Design()
  const accent = k2Colors.accent
  const accentLight = k2Colors.accentLight
  const accentGlow = k2Colors.accentGlow
  const bgDark = k2Colors.bgDark
  const bgMid = k2Colors.bgMid
  const bgLight = '#f9f5ef'
  const bgCard = '#fffefb'
  const text = '#2a1f14'
  const textLight = k2Colors.textLight
  const muted = '#7a6a58'
  const heroImageUrl = entdeckenContent.heroImageUrl?.trim() || '/img/oeffentlich/entdecken-hero.jpg'
  const T_hero = {
    heroTag: entdeckenContent.heroTag?.trim() || T_DEFAULTS.heroTag,
    heroTitle: entdeckenContent.heroTitle?.trim() || T_DEFAULTS.heroTitle,
    heroSub: entdeckenContent.heroSub?.trim() || T_DEFAULTS.heroSub,
    heroDeviceHint: entdeckenContent.heroDeviceHint?.trim() || T_DEFAULTS.heroDeviceHint,
    cta: entdeckenContent.cta?.trim() || T_DEFAULTS.cta,
    ctaSub: entdeckenContent.ctaSub?.trim() || T_DEFAULTS.ctaSub,
  }
  const fontHeading = WERBEUNTERLAGEN_STIL.fontHeading
  const fontBody = WERBEUNTERLAGEN_STIL.fontBody

  /** Nach Galerie-Entscheidung: Fremde zuerst auf die ök2-/VK2-Willkommensseite („WILLKOMMEN BEI Galerie Muster“) – nirgends sonst */
  const openByChoice = (weg: 'solo' | 'verein') => {
    try {
      sessionStorage.setItem('k2-from-entdecken', '1')
    } catch (_) {}
    const url = weg === 'verein'
      ? PROJECT_ROUTES.vk2.galerie
      : PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
    navigate(url)
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
    const steps: Step[] = ['q1']
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
                <div style={{ fontFamily: fontHeading, fontSize: 'clamp(1.1rem, 2.8vw, 1.5rem)', fontWeight: 700, color: textLight, marginBottom: '1.25rem', lineHeight: 1.35, letterSpacing: '-0.02em', maxWidth: 480 }}>
                  {T_hero.heroTag}
                  <br />
                  {T_hero.heroTitle}
                </div>
                <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#d4a574', lineHeight: 1.7, maxWidth: 420, marginBottom: '0.75rem' }}>
                  {T_hero.heroSub}
                </p>
                <p style={{ fontSize: 'clamp(0.82rem, 1.85vw, 0.95rem)', color: 'rgba(255,248,240,0.82)', lineHeight: 1.65, maxWidth: 460, marginBottom: '0.85rem', borderLeft: `3px solid ${accentGlow}88`, paddingLeft: '0.85rem' }}>
                  <strong style={{ color: textLight }}>Galerie gestalten</strong> ist der Mittelpunkt: Hier legst du dein <strong style={{ color: textLight }}>Corporate Design</strong> fest – eine durchgängige Linie für die Website, Einladungen und alles, was du druckst.
                </p>
                <p style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.9rem)', color: 'rgba(212,165,116,0.85)', lineHeight: 1.5, maxWidth: 420, marginBottom: '2.5rem' }}>
                  {T_hero.heroDeviceHint}
                </p>
                <button type="button" onClick={() => setStep('q1')}
                  style={{ display: 'inline-block', padding: 'clamp(0.85rem, 2vw, 1.05rem) clamp(2rem, 4vw, 2.75rem)', background: `linear-gradient(135deg, ${accentGlow} 0%, ${accent} 100%)`, color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 700, cursor: 'pointer', fontFamily: fontBody, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', letterSpacing: '0.01em', boxShadow: `0 8px 32px ${accentGlow}44`, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}>
                  {T_hero.cta}
                </button>
                <p style={{ marginTop: '0.9rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>{T_hero.ctaSub}</p>
              </div>
            </div>

            {/* Rechte Seite: Hero-Bild (Admin → Design → „Bild wählen“) – Fallback ohne Fragezeichen-Icon */}
            <div style={{
              flex: '1 1 320px', position: 'relative', minHeight: 320, overflow: 'hidden',
            }}>
              {heroImageSrc === 'primary' && (
                <img
                  src={heroImageUrl}
                  alt="Galerie Vorschau"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.75 }}
                  onError={() => setHeroImageSrc('svg')}
                />
              )}
              {heroImageSrc === 'svg' && (
                <img
                  src="/img/oeffentlich/willkommen.svg"
                  alt="Galerie Vorschau"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.75 }}
                  onError={() => setHeroImageSrc('none')}
                />
              )}
              {heroImageSrc === 'none' && (
                <div style={{ position: 'absolute', inset: 0, background: `${bgDark}ee`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                  Bild in Admin → Design → Eingangsseite wählen
                </div>
              )}
              {/* Gradient-Übergang links zum Text */}
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${bgDark} 0%, transparent 35%)`, pointerEvents: 'none' }} />
              {/* Gradient unten */}
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${bgDark} 0%, transparent 40%)`, pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      )}

      {/* ── FRAGEN-FLOW ──────────────────────────────────────────────────────── */}
      {step === 'q1' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 2rem)' }}>
          <div style={{ maxWidth: 540, width: '100%' }}>

            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: fontHeading, fontSize: '1.1rem', color: accent, fontWeight: 700 }}>{PRODUCT_BRAND_NAME}</span>
            </div>

            <Progress />

            {/* Ein Klick auf die Karte öffnet direkt ök2 oder VK2 – kein Zusatzbutton */}
            <h2 style={{ fontFamily: fontHeading, fontSize: 'clamp(1.3rem, 3.5vw, 1.7rem)', fontWeight: 700, color: text, textAlign: 'center', marginBottom: '0.65rem', lineHeight: 1.3 }}>
              {T.weg}
            </h2>
            <p style={{ fontSize: '0.82rem', color: muted, textAlign: 'center', lineHeight: 1.5, marginBottom: '1.25rem', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
              {T.wegCdHinweis}
            </p>
            <ChoiceCard {...T.wegSolo} selected={answers.q1 === 'solo'} onClick={() => { setAnswers(a => ({ ...a, q1: 'solo' })); openByChoice('solo'); }} />
            <ChoiceCard {...T.wegVerein} selected={answers.q1 === 'verein'} onClick={() => { setAnswers(a => ({ ...a, q1: 'verein' })); openByChoice('verein'); }} color="#1e5cb5" />
            <div style={{ marginTop: '1rem' }}>
              <button type="button" onClick={() => setStep('hero')} style={{ padding: '0.7rem 1.25rem', background: 'transparent', color: muted, border: `1px solid #e0d5c5`, borderRadius: '10px', cursor: 'pointer', fontFamily: fontBody, fontSize: '0.9rem' }}>{T.btnBack}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── HUB: Alle Themen + Guide in der Mitte als Arbeitsbereich ─────────── */}
      {step === 'hub' && (
        <HubArbeitsbereich
          name=""
          q1={answers.q1}
          accent={accent}
          accentLight={accentLight}
          accentGlow={accentGlow}
          bgDark={bgDark}
          bgMid={bgMid}
          bgLight={bgLight}
          fontHeading={fontHeading}
          fontBody={fontBody}
          onStarten={() => openByChoice(answers.q1 === 'verein' ? 'verein' : 'solo')}
          onZurueck={() => setStep('q1')}
        />
      )}

      {/* ── ERGEBNIS (kurz sichtbar vor Weiterleitung) ──────────────────────── */}
      {step === 'result' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 1.5rem', background: bgLight }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
          <h2 style={{ fontFamily: fontHeading, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: text, margin: '0 0 0.75rem', lineHeight: 1.2 }}>
            {T.resultTitle('')}
          </h2>
          <p style={{ fontSize: '1rem', color: muted, marginBottom: '0.5rem' }}>{T.resultSub}</p>
          <p style={{ fontSize: '0.85rem', color: muted }}>{T.resultNoPressure}</p>
        </div>
      )}

      {/* Fußzeile – eiserne Regel: Copyright wie definiert (K2/ök2/VK2); nicht auf Hero/Result */}
      {step !== 'result' && step !== 'hero' && (
        <div style={{ textAlign: 'center', padding: '0.75rem 1rem', fontSize: '0.72rem', color: muted, borderTop: '1px solid #e8ddd0', background: bgCard }}>
          <Link to={AGB_ROUTE} state={{ returnTo: location.pathname }} style={{ color: muted, textDecoration: 'none' }}>AGB</Link>
          {' · '}
          {PRODUCT_BRAND_NAME}
          {' · '}
          <span>Kein Erwerb nötig</span>
          <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', opacity: 0.95 }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div style={{ marginTop: '0.2rem', fontSize: '0.65rem', opacity: 0.9 }}>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </div>
      )}

    </div>
  )
}
