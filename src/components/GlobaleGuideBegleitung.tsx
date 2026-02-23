/**
 * GlobaleGuideBegleitung
 *
 * Der Guide-Dialog läuft auf JEDER Seite weiter – nahtlos vom ersten Satz
 * bis zum letzten Schritt. Kein Bruch beim Wechsel in den Admin oder andere Seiten.
 *
 * State kommt aus localStorage (k2-guide-flow) und wird dort aktuell gehalten.
 * Dieser Dialog erscheint nur wenn ein aktiver Guide-Flow läuft.
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// ─── Typen ───────────────────────────────────────────────────────────────────

export type GuidePfad = 'kuenstlerin' | 'gemeinschaft' | 'atelier' | 'entdecker' | ''

export interface GuideFlowState {
  aktiv: boolean
  name: string
  pfad: GuidePfad
  schritt: string          // aktueller globaler Schritt (z.B. 'admin_stammdaten')
  erledigte: string[]      // erledigte Schritte
}

const FLOW_KEY = 'k2-guide-flow'

export function ladeGuideFlow(): GuideFlowState | null {
  try {
    const v = localStorage.getItem(FLOW_KEY)
    if (!v) return null
    const f = JSON.parse(v) as GuideFlowState
    if (!f.aktiv) return null
    return f
  } catch { return null }
}

export function speichereGuideFlow(f: GuideFlowState) {
  try { localStorage.setItem(FLOW_KEY, JSON.stringify(f)) } catch { /* ignore */ }
}

export function beendeGuideFlow() {
  try {
    const v = localStorage.getItem(FLOW_KEY)
    if (v) {
      const f = JSON.parse(v) as GuideFlowState
      f.aktiv = false
      localStorage.setItem(FLOW_KEY, JSON.stringify(f))
    }
  } catch { /* ignore */ }
  // Event damit andere Komponenten reagieren können
  window.dispatchEvent(new CustomEvent('guide-flow-update'))
}

// ─── Schritte pro Pfad ───────────────────────────────────────────────────────

interface GuideSchritt {
  id: string
  emoji: string
  titel: string
  beschreibung: string
  url: string                    // Seite die beim Ansehen geöffnet wird
  adminTab?: string              // wenn im Admin navigiert werden soll
  adminSubTab?: string
}

function baueGlobaleSchritte(pfad: GuidePfad): GuideSchritt[] {
  const istVerein = pfad === 'gemeinschaft'

  if (istVerein) {
    return [
      { id: 'v_galerie',    emoji: '🏛️', titel: 'Vereinsgalerie ansehen',       beschreibung: 'Alle Werke unter einem Dach – jede:r mit eigenem Profil.',      url: '/projects/vk2/galerie' },
      { id: 'v_mitglieder', emoji: '👥', titel: 'Mitgliederverwaltung',          beschreibung: 'Profile, Werke, Kontakt – für jedes Mitglied.',                  url: '/admin?context=vk2', adminTab: 'werke' },
      { id: 'v_events',     emoji: '🎟️', titel: 'Ausstellungen planen',         beschreibung: 'Vernissagen, Einladungen, QR-Code – für den ganzen Verein.',     url: '/admin?context=vk2', adminTab: 'eventplan' },
      { id: 'v_dokumente',  emoji: '📄', titel: 'Vereinsdokumente',              beschreibung: 'Pressemappe, Werkverzeichnis – ein Klick, fertig.',              url: '/projects/k2-galerie/vita/martina' },
      { id: 'v_kassa',      emoji: '🧾', titel: 'Kassa & Verkäufe',              beschreibung: 'Verkäufe erfassen, Belege drucken – auf jedem Gerät.',           url: '/projects/k2-galerie/shop' },
      { id: 'v_lizenz',     emoji: '💎', titel: 'VK2-Lizenz wählen',             beschreibung: 'Basis kostenlos · Pro € 9 · VK2/Studio € 19 – jederzeit wechselbar.', url: '' },
      { id: 'v_stammdaten', emoji: '📋', titel: 'Vereinsdaten ausfüllen & starten', beschreibung: 'Name, Adresse, Kontakt – dann ist eure Galerie live.',       url: '/admin?context=oeffentlich', adminTab: 'einstellungen', adminSubTab: 'stammdaten' },
    ]
  }

  return [
    { id: 'galerie',    emoji: '🎨', titel: 'Deine Galerie ansehen',         beschreibung: 'Live, auf jedem Gerät – bereit für deine Werke.',                  url: '/projects/k2-galerie/galerie-oeffentlich' },
    { id: 'werke',      emoji: '🖼️', titel: 'Werkeverwaltung',               beschreibung: 'Fotos hochladen, Titel, Preis – ein Klick veröffentlicht.',        url: '/admin?context=oeffentlich', adminTab: 'werke' },
    { id: 'kontakt',    emoji: '📬', titel: 'Kontakt & Erreichbarkeit',       beschreibung: 'Interessenten schreiben dich direkt an – kein Umweg.',             url: '/projects/k2-galerie/galerie-oeffentlich' },
    { id: 'events',     emoji: '🎟️', titel: 'Ausstellungen & Events',        beschreibung: 'Vernissagen planen, Einladungen, QR-Code inklusive.',              url: '/admin?context=oeffentlich', adminTab: 'eventplan' },
    { id: 'dokumente',  emoji: '📄', titel: 'Dokumente ansehen',              beschreibung: 'Vita, Pressemappe, Werkverzeichnis – vorbefüllt, druckfertig.',    url: '/projects/k2-galerie/vita/martina' },
    { id: 'lizenz',     emoji: '💎', titel: 'Lizenz wählen',                  beschreibung: 'Basis kostenlos · Pro € 9 · VK2/Studio € 19 – jederzeit wechselbar.', url: '' },
    { id: 'stammdaten', emoji: '📋', titel: 'Daten ausfüllen & starten',     beschreibung: 'Galerie-Name, Kontakt – dann ist deine Galerie live.',             url: '/admin?context=oeffentlich', adminTab: 'einstellungen', adminSubTab: 'stammdaten' },
  ]
}

// ─── Lizenz-Infokarte ────────────────────────────────────────────────────────

function LizenzInfo({ pfad, akzentFarbe }: { pfad: GuidePfad; akzentFarbe: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
      {[
        { emoji: '🟢', name: 'Basis', preis: 'kostenlos', inhalt: 'Galerie, Werke, Kontakt' },
        { emoji: '🔵', name: 'Pro', preis: '€ 9 / Monat', inhalt: '+ Events, Dokumente, Kassa' },
        { emoji: '🟣', name: pfad === 'gemeinschaft' ? 'VK2 / Verein' : 'VK2 / Studio', preis: '€ 19 / Monat', inhalt: pfad === 'gemeinschaft' ? 'Bis 20 Mitglieder, alles inklusive' : 'Mehrere Künstler:innen, alles inklusive' },
      ].map(l => (
        <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.6rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize: '1rem' }}>{l.emoji}</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: '#fff8f0', fontSize: '0.82rem' }}>{l.name}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginLeft: '0.4rem' }}>{l.inhalt}</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: akzentFarbe, fontWeight: 600 }}>{l.preis}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Haupt-Komponente ────────────────────────────────────────────────────────

export function GlobaleGuideBegleitung() {
  const navigate = useNavigate()
  const location = useLocation()
  const [flow, setFlow] = useState<GuideFlowState | null>(null)
  const [geschlossen, setGeschlossen] = useState(false)
  const [gesehenSet, setGesehenSet] = useState<Set<string>>(new Set())
  const [aktuellerIdx, setAktuellerIdx] = useState(0)

  // Flow aus localStorage laden + auf Änderungen hören
  const ladeFlow = useCallback(() => {
    const f = ladeGuideFlow()
    setFlow(f)
    if (!f) setGeschlossen(false)
  }, [])

  useEffect(() => {
    ladeFlow()
    window.addEventListener('guide-flow-update', ladeFlow)
    return () => window.removeEventListener('guide-flow-update', ladeFlow)
  }, [ladeFlow])

  // Bei Seitenwechsel: Dialog wieder einblenden (User kommt zurück)
  useEffect(() => {
    if (flow?.aktiv) setGeschlossen(false)
  }, [location.pathname])

  if (!flow || !flow.aktiv || geschlossen) return null

  // Auf Galerie-Seite selbst nicht zeigen (dort läuft der native Guide)
  const aufGalerieSeite = location.pathname.includes('galerie-oeffentlich') ||
    location.pathname === '/projects/vk2/galerie' ||
    location.pathname === '/galerie'
  if (aufGalerieSeite) return null

  const { name, pfad } = flow
  const schritte = baueGlobaleSchritte(pfad)
  const istVerein = pfad === 'gemeinschaft'
  const akzentFarbe = istVerein ? '#42a4ff' : '#ff8c42'
  const akzentGrad = istVerein
    ? 'linear-gradient(135deg, #1e5cb5, #42a4ff)'
    : 'linear-gradient(135deg, #b54a1e, #ff8c42)'
  const avatarEmoji = istVerein ? '🏛️' : pfad === 'atelier' ? '🏢' : pfad === 'entdecker' ? '🌱' : '👨‍🎨'
  const guideLabel = istVerein ? 'Dein Vereins-Guide' : 'Dein Galerie-Guide'

  const aktuellerSchritt = schritte[aktuellerIdx]
  const bereitsGesehen = gesehenSet.has(aktuellerSchritt.id)
  const istLizenzSchritt = aktuellerSchritt.id === 'lizenz' || aktuellerSchritt.id === 'v_lizenz'
  const istLetzterSchritt = aktuellerIdx === schritte.length - 1

  const markiereGesehen = () => {
    setGesehenSet(prev => new Set(prev).add(aktuellerSchritt.id))
  }

  const geheZuSchritt = (idx: number) => {
    const s = schritte[idx]
    setAktuellerIdx(idx)
    if (s.url && !s.adminTab) {
      // Externe Seite – neuen Tab
      window.open(s.url, '_blank')
      markiereGesehen()
    } else if (s.adminTab) {
      // Admin-Navigation: gleicher Tab mit Hash
      const ziel = `${s.url}#${s.adminTab}${s.adminSubTab ? `-${s.adminSubTab}` : ''}`
      // Wenn wir schon im Admin sind: URL-Hash setzen damit Admin reagiert
      if (location.pathname === '/admin') {
        window.location.hash = `${s.adminTab}${s.adminSubTab ? `-${s.adminSubTab}` : ''}`
      } else {
        navigate(`/admin?context=oeffentlich&guidetab=${s.adminTab}${s.adminSubTab ? `&guidesubtab=${s.adminSubTab}` : ''}&vorname=${encodeURIComponent(name)}&pfad=${pfad}`)
      }
      markiereGesehen()
    } else if (s.url) {
      window.open(s.url, '_blank')
      markiereGesehen()
    }
  }

  const weiter = () => {
    if (aktuellerIdx < schritte.length - 1) {
      setAktuellerIdx(aktuellerIdx + 1)
    }
  }

  const fertigStellen = () => {
    beendeGuideFlow()
    setGeschlossen(true)
    navigate(`/admin?context=oeffentlich&assistent=1&vorname=${encodeURIComponent(name)}&pfad=${pfad}`)
  }

  // Fortschrittsbalken: wie viele bereits gesehen
  const anzahlGesehen = schritte.filter(s => gesehenSet.has(s.id)).length

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 10000, width: 'min(440px, calc(100vw - 2rem))',
      animation: 'globGuideEin 0.4s ease',
    }}>
      <style>{`
        @keyframes globGuideEin { from{opacity:0;transform:translateX(-50%) translateY(14px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes globBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <div style={{
        background: 'rgba(14,8,4,0.97)',
        border: `1px solid ${akzentFarbe}55`,
        borderRadius: '20px', padding: '1.15rem',
        boxShadow: '0 16px 56px rgba(0,0,0,0.6)', backdropFilter: 'blur(16px)',
      }}>

        {/* Fortschrittsbalken */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '0.2rem', flex: 1 }}>
            {schritte.map((s, i) => (
              <div key={s.id} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: gesehenSet.has(s.id) ? akzentFarbe : i === aktuellerIdx ? `${akzentFarbe}66` : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s', cursor: 'pointer',
              }} onClick={() => setAktuellerIdx(i)} />
            ))}
          </div>
          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' as const }}>
            {anzahlGesehen} / {schritte.length}
          </div>
        </div>

        {/* Avatar + Text */}
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: akzentGrad, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          }}>
            {avatarEmoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.62rem', color: `${akzentFarbe}99`, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: '0.2rem' }}>
              {guideLabel}
            </div>
            <div style={{ fontSize: '0.88rem', color: '#fff8f0', lineHeight: 1.6, fontWeight: 600 }}>
              {aktuellerSchritt.emoji} {aktuellerSchritt.titel}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5, marginTop: '0.15rem' }}>
              {aktuellerSchritt.beschreibung}
            </div>
          </div>
          <button type="button" onClick={() => setGeschlossen(true)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.18)', cursor: 'pointer', fontSize: '1rem', padding: '0.1rem 0.3rem', flexShrink: 0 }}
            title="Vorläufig schließen">✕</button>
        </div>

        {/* Lizenz-Sonderanzeige */}
        {istLizenzSchritt && <LizenzInfo pfad={pfad} akzentFarbe={akzentFarbe} />}

        {/* Aktions-Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.4rem', marginTop: '0.65rem' }}>

          {/* Ansehen-Button (nicht bei Lizenz und nicht beim letzten Schritt) */}
          {!istLizenzSchritt && !istLetzterSchritt && (
            <button type="button"
              onClick={() => geheZuSchritt(aktuellerIdx)}
              style={{
                width: '100%', padding: '0.7rem',
                background: bereitsGesehen ? `${akzentFarbe}18` : akzentGrad,
                border: bereitsGesehen ? `1px solid ${akzentFarbe}44` : 'none',
                borderRadius: '12px',
                color: bereitsGesehen ? akzentFarbe : '#fff',
                fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit',
                boxShadow: bereitsGesehen ? 'none' : '0 4px 14px rgba(0,0,0,0.25)',
              }}>
              {bereitsGesehen ? `✓ Gesehen – nochmal öffnen` : `${aktuellerSchritt.emoji} ${aktuellerSchritt.titel} →`}
            </button>
          )}

          {/* Letzter Schritt: Fertig stellen */}
          {istLetzterSchritt && (
            <button type="button" onClick={fertigStellen}
              style={{ width: '100%', padding: '0.8rem', background: akzentGrad, border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit', boxShadow: `0 4px 18px ${akzentFarbe}44` }}>
              🚀 {istVerein ? 'Vereinsdaten ausfüllen & starten' : 'Daten ausfüllen & starten'}
            </button>
          )}

          {/* Weiter-Button */}
          {!istLetzterSchritt && (
            <button type="button" onClick={weiter}
              style={{
                width: '100%', padding: '0.55rem',
                background: bereitsGesehen ? `${akzentFarbe}14` : 'rgba(255,255,255,0.05)',
                border: bereitsGesehen ? `1px solid ${akzentFarbe}33` : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                color: bereitsGesehen ? akzentFarbe : 'rgba(255,255,255,0.3)',
                fontWeight: bereitsGesehen ? 600 : 400,
                cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit',
              }}>
              {bereitsGesehen ? 'Weiter →' : 'Überspringen →'}
            </button>
          )}

          {/* Schritt-Übersicht – kleine Punkte zum direkten Springen */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginTop: '0.1rem' }}>
            {schritte.map((s, i) => (
              <button key={s.id} type="button" onClick={() => setAktuellerIdx(i)}
                title={s.titel}
                style={{
                  width: i === aktuellerIdx ? 18 : 7, height: 7, borderRadius: 4,
                  background: gesehenSet.has(s.id) ? akzentFarbe : i === aktuellerIdx ? `${akzentFarbe}88` : 'rgba(255,255,255,0.15)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.2s',
                }} />
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
