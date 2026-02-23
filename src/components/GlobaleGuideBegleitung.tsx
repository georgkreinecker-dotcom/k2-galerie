/**
 * GlobaleGuideBegleitung
 *
 * Der Guide-Dialog begleitet auf JEDER Seite nahtlos weiter.
 * Er navigiert automatisch in die richtige Abteilung – User schaut sich um,
 * klickt dann „Weiter →" für die nächste Station.
 *
 * Prinzip: Dialog erklärt. Hintergrund zeigt. User entscheidet wann weiter.
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// ─── Typen ───────────────────────────────────────────────────────────────────

export type GuidePfad = 'kuenstlerin' | 'gemeinschaft' | 'atelier' | 'entdecker' | ''

export interface GuideFlowState {
  aktiv: boolean
  name: string
  pfad: GuidePfad
  schritt: string
  erledigte: string[]
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
  window.dispatchEvent(new CustomEvent('guide-flow-update'))
}

// ─── Schritte ────────────────────────────────────────────────────────────────

interface TourSchritt {
  id: string
  emoji: string
  titel: string
  beschreibung: string
  // Wohin navigiert der Guide beim Öffnen dieses Schritts?
  route: string   // React-Route (gleicher Tab, gleiche Seite)
  // Optionaler Hash/Tab-Parameter für Admin
  adminTab?: string
  adminSubTab?: string
}

function baueSchritte(pfad: GuidePfad, name: string): TourSchritt[] {
  const vorname = encodeURIComponent(name)
  const istVerein = pfad === 'gemeinschaft'

  if (istVerein) {
    return [
      {
        id: 'v_werke',
        emoji: '🖼️',
        titel: 'Werke & Mitglieder',
        beschreibung: 'Hier verwaltet ihr alle Werke – wer hat was, Preise, Fotos. Jede:r Künstler:in hat ihr eigenes Profil.',
        route: `/admin?context=oeffentlich&vorname=${vorname}&pfad=${pfad}&guidetab=werke`,
        adminTab: 'werke',
      },
      {
        id: 'v_events',
        emoji: '🎟️',
        titel: 'Ausstellungen & Events',
        beschreibung: 'Vernissagen planen, Einladungen erstellen, QR-Codes für Besucher – alles an einem Ort.',
        route: `/admin?context=oeffentlich&vorname=${vorname}&pfad=${pfad}&guidetab=eventplan`,
        adminTab: 'eventplan',
      },
      {
        id: 'v_dokumente',
        emoji: '📄',
        titel: 'Dokumente & Vita',
        beschreibung: 'Pressemappe, Werkverzeichnis, Vita – vorbefüllt aus euren Daten, ein Klick zum Drucken.',
        route: '/projects/k2-galerie/vita/martina',
      },
      {
        id: 'v_kassa',
        emoji: '🧾',
        titel: 'Kassa & Verkäufe',
        beschreibung: 'Verkauf erfassen, Beleg drucken – vom Handy oder Tablet direkt am Stand.',
        route: '/projects/k2-galerie/shop',
      },
      {
        id: 'v_lizenz',
        emoji: '💎',
        titel: 'Lizenz wählen',
        beschreibung: 'Basis kostenlos · Pro € 9 · VK2/Verein € 19 – jederzeit wechselbar, keine Bindung.',
        route: `/admin?context=oeffentlich&vorname=${vorname}&pfad=${pfad}&guidetab=einstellungen`,
        adminTab: 'einstellungen',
      },
      {
        id: 'v_start',
        emoji: '🚀',
        titel: 'Vereinsdaten ausfüllen & starten',
        beschreibung: 'Name, Adresse, Kontakt eintragen – dann ist eure Vereinsgalerie live. Keine Kreditkarte nötig.',
        route: `/admin?context=oeffentlich&vorname=${vorname}&pfad=${pfad}&guidetab=einstellungen&guidesubtab=stammdaten&assistent=1`,
        adminTab: 'einstellungen',
        adminSubTab: 'stammdaten',
      },
    ]
  }

  return [
    {
      id: 'werke',
      emoji: '🖼️',
      titel: 'Werkeverwaltung',
      beschreibung: 'Foto aufnehmen, Titel und Preis eintragen – ein Klick und das Werk ist in der Galerie. So einfach.',
      route: `/admin?context=oeffentlich&vorname=${vorname}&pfad=${pfad}&guidetab=werke`,
      adminTab: 'werke',
    },
    {
      id: 'events',
      emoji: '🎟️',
      titel: 'Ausstellungen & Events',
      beschreibung: 'Vernissage geplant? Hier erstellst du Einladungen, QR-Codes und siehst wer kommt.',
      route: `/admin?context=oeffentlich&vorname=${vorname}&pfad=${pfad}&guidetab=eventplan`,
      adminTab: 'eventplan',
    },
    {
      id: 'dokumente',
      emoji: '📄',
      titel: 'Dokumente & Vita',
      beschreibung: 'Vita, Pressemappe, Werkverzeichnis – aus deinen Daten vorbefüllt. Ein Klick, fertig zum Drucken.',
      route: '/projects/k2-galerie/vita/martina',
    },
    {
      id: 'kassa',
      emoji: '🧾',
      titel: 'Kassa & Verkäufe',
      beschreibung: 'Werk verkauft? Eintragen, Beleg drucken – vom Handy direkt bei der Ausstellung. Ganz simpel.',
      route: '/projects/k2-galerie/shop',
    },
    {
      id: 'kunden',
      emoji: '👥',
      titel: 'Kunden & Kontakt',
      beschreibung: 'Wer hat sich für deine Werke interessiert? Hier siehst du alle Nachrichten und kannst antworten.',
      route: `/admin?context=oeffentlich&vorname=${vorname}&pfad=${pfad}&guidetab=werke`,
      adminTab: 'werke',
    },
    {
      id: 'lizenz',
      emoji: '💎',
      titel: 'Was kostet das Ganze?',
      beschreibung: 'Basis kostenlos · Pro € 9 / Monat · VK2/Studio € 19 / Monat\nJederzeit wechselbar, keine Bindung.',
      route: `/admin?context=oeffentlich&vorname=${vorname}&pfad=${pfad}&guidetab=einstellungen`,
      adminTab: 'einstellungen',
    },
    {
      id: 'start',
      emoji: '🚀',
      titel: 'Bereit. Jetzt starten.',
      beschreibung: 'Trag deinen Namen und Kontakt ein – dann ist deine Galerie sofort live. Keine Kreditkarte nötig.',
      route: `/admin?context=oeffentlich&vorname=${vorname}&pfad=${pfad}&guidetab=einstellungen&guidesubtab=stammdaten&assistent=1`,
      adminTab: 'einstellungen',
      adminSubTab: 'stammdaten',
    },
  ]
}

// ─── Lizenz-Karten ────────────────────────────────────────────────────────────

function LizenzInfo({ pfad, akzentFarbe }: { pfad: GuidePfad; akzentFarbe: string }) {
  const istVerein = pfad === 'gemeinschaft'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.4rem' }}>
      {[
        { emoji: '🟢', name: 'Basis', preis: 'kostenlos', inhalt: 'Galerie, Werke, Kontakt' },
        { emoji: '🔵', name: 'Pro', preis: '€ 9 / Monat', inhalt: '+ Events, Dokumente, Kassa' },
        { emoji: '🟣', name: istVerein ? 'VK2 / Verein' : 'Studio / VK2', preis: '€ 19 / Monat', inhalt: istVerein ? 'Bis 20 Mitglieder, alles inkl.' : 'Mehrere Künstler:innen, alles inkl.' },
      ].map(l => (
        <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.55rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize: '0.95rem' }}>{l.emoji}</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: '#fff8f0', fontSize: '0.8rem' }}>{l.name}</span>
            <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.72rem', marginLeft: '0.35rem' }}>{l.inhalt}</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: akzentFarbe, fontWeight: 600, whiteSpace: 'nowrap' as const }}>{l.preis}</span>
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
  const [aktuellerIdx, setAktuellerIdx] = useState(0)
  const [navigiert, setNavigiert] = useState(false)

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

  // Wenn der User manuell navigiert: Dialog bleibt, aber navigiert-Flag zurücksetzen
  useEffect(() => {
    if (flow?.aktiv) {
      setGeschlossen(false)
      setNavigiert(false)
    }
  }, [location.pathname, location.search])

  if (!flow || !flow.aktiv || geschlossen) return null

  // Auf Galerie-Seiten nie zeigen – dort läuft der native Guide
  const aufGalerieSeite =
    location.pathname === '/projects/k2-galerie/galerie-oeffentlich' ||
    location.pathname === '/projects/k2-galerie/galerie' ||
    location.pathname === '/galerie' ||
    location.pathname === '/galerie-oeffentlich' ||
    location.pathname === '/projects/vk2/galerie'
  if (aufGalerieSeite) return null

  const { name, pfad } = flow
  const schritte = baueSchritte(pfad, name)
  const istVerein = pfad === 'gemeinschaft'
  const akzentFarbe = istVerein ? '#42a4ff' : '#ff8c42'
  const akzentGrad = istVerein
    ? 'linear-gradient(135deg, #1e5cb5, #42a4ff)'
    : 'linear-gradient(135deg, #b54a1e, #ff8c42)'
  const avatarEmoji = istVerein ? '🏛️' : pfad === 'atelier' ? '🏢' : pfad === 'entdecker' ? '🌱' : '👨‍🎨'
  const guideLabel = istVerein ? 'Dein Vereins-Guide' : 'Dein Galerie-Guide'

  const aktuellerSchritt = schritte[aktuellerIdx]
  const istLetzterSchritt = aktuellerIdx === schritte.length - 1
  const istLizenzSchritt = aktuellerSchritt.id === 'lizenz' || aktuellerSchritt.id === 'v_lizenz'

  // User in die aktuelle Station navigieren
  const zeigeStation = () => {
    const s = aktuellerSchritt
    setNavigiert(true)
    navigate(s.route)
  }

  const weiter = () => {
    if (aktuellerIdx < schritte.length - 1) {
      const naechsterIdx = aktuellerIdx + 1
      setAktuellerIdx(naechsterIdx)
      setNavigiert(false)
      // Direkt zur nächsten Station navigieren
      navigate(schritte[naechsterIdx].route)
    }
  }

  const fertigStellen = () => {
    beendeGuideFlow()
    setGeschlossen(true)
    navigate(`/admin?context=oeffentlich&assistent=1&vorname=${encodeURIComponent(name)}&pfad=${pfad}`)
  }

  const erklaerungText = aktuellerSchritt.beschreibung.split('\n').map((z, i) => (
    <span key={i}>{z}{i < aktuellerSchritt.beschreibung.split('\n').length - 1 && <br />}</span>
  ))

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 10000, width: 'min(440px, calc(100vw - 2rem))',
      animation: 'globGuideEin 0.4s ease',
    }}>
      <style>{`
        @keyframes globGuideEin { from{opacity:0;transform:translateX(-50%) translateY(14px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
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
                background: i < aktuellerIdx ? akzentFarbe : i === aktuellerIdx ? `${akzentFarbe}66` : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' as const }}>
            {aktuellerIdx + 1} / {schritte.length}
          </div>
        </div>

        {/* Avatar + Text */}
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
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
            <div style={{ fontSize: '0.9rem', color: '#fff8f0', lineHeight: 1.5, fontWeight: 600, marginBottom: '0.25rem' }}>
              {aktuellerSchritt.emoji} {aktuellerSchritt.titel}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>
              {erklaerungText}
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

          {/* Letzter Schritt: Starten */}
          {istLetzterSchritt ? (
            <button type="button" onClick={fertigStellen}
              style={{ width: '100%', padding: '0.85rem', background: akzentGrad, border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem', fontFamily: 'inherit', boxShadow: `0 4px 18px ${akzentFarbe}44` }}>
              🚀 {istVerein ? 'Vereinsdaten ausfüllen & starten' : 'Daten ausfüllen & starten'}
            </button>
          ) : (
            <>
              {/* Hauptaktion: Station anzeigen – nur wenn noch nicht navigiert */}
              {!navigiert && (
                <button type="button" onClick={zeigeStation}
                  style={{
                    width: '100%', padding: '0.75rem',
                    background: akzentGrad,
                    border: 'none', borderRadius: '12px',
                    color: '#fff', fontWeight: 700, cursor: 'pointer',
                    fontSize: '0.88rem', fontFamily: 'inherit',
                    boxShadow: `0 4px 14px ${akzentFarbe}33`,
                  }}>
                  {aktuellerSchritt.emoji} {aktuellerSchritt.titel} ansehen →
                </button>
              )}

              {/* Weiter-Button – nach dem Anschauen deutlich sichtbar, davor dezent */}
              <button type="button" onClick={weiter}
                style={{
                  width: '100%',
                  padding: navigiert ? '0.78rem' : '0.5rem',
                  background: navigiert ? akzentGrad : 'rgba(255,255,255,0.05)',
                  border: navigiert ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  color: navigiert ? '#fff' : 'rgba(255,255,255,0.28)',
                  fontWeight: navigiert ? 700 : 400,
                  cursor: 'pointer', fontSize: navigiert ? '0.9rem' : '0.78rem', fontFamily: 'inherit',
                  boxShadow: navigiert ? `0 4px 14px ${akzentFarbe}33` : 'none',
                  transition: 'all 0.3s',
                }}>
                {navigiert ? 'Weiter zur nächsten Station →' : 'Überspringen →'}
              </button>
            </>
          )}

          {/* Station-Punkte */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
            {schritte.map((s, i) => (
              <div key={s.id}
                style={{
                  width: i === aktuellerIdx ? 18 : 7, height: 7, borderRadius: 4,
                  background: i < aktuellerIdx ? akzentFarbe : i === aktuellerIdx ? `${akzentFarbe}88` : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.2s',
                }} />
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
