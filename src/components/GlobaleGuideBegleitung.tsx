/**
 * GlobaleGuideBegleitung
 *
 * Hub-Layout: Kacheln links/rechts – aktiver Dialog in der Mitte.
 * User sieht auf einen Blick alle Stationen und kann frei wählen.
 * Aktive Kachel ist hervorgehoben. Klick auf Kachel → Dialog zeigt diese Station.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
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
  route: string
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
        titel: 'Jetzt starten',
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
      titel: 'Meine Werke',
      beschreibung: 'Foto aufnehmen, Titel und Preis eintragen – ein Klick und das Werk ist in der Galerie. So einfach.',
      route: `/admin?context=oeffentlich&vorname=${vorname}&pfad=${pfad}&guidetab=werke`,
      adminTab: 'werke',
    },
    {
      id: 'events',
      emoji: '🎟️',
      titel: 'Events & Ausstellungen',
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
      titel: 'Kassa & Verkauf',
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
      titel: 'Was kostet das?',
      beschreibung: 'Basis kostenlos · Pro € 9 / Monat · Studio € 19 / Monat\nJederzeit wechselbar, keine Bindung.',
      route: `/admin?context=oeffentlich&vorname=${vorname}&pfad=${pfad}&guidetab=einstellungen`,
      adminTab: 'einstellungen',
    },
    {
      id: 'start',
      emoji: '🚀',
      titel: 'Jetzt starten',
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
        <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize: '0.9rem' }}>{l.emoji}</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700, color: '#fff8f0', fontSize: '0.76rem' }}>{l.name}</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', marginLeft: '0.3rem' }}>{l.inhalt}</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: akzentFarbe, fontWeight: 600, whiteSpace: 'nowrap' as const }}>{l.preis}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Kachel-Komponente ────────────────────────────────────────────────────────

function Kachel({
  schritt, aktiv, besucht, akzentFarbe, akzentGrad, onClick
}: {
  schritt: TourSchritt
  aktiv: boolean
  besucht: boolean
  akzentFarbe: string
  akzentGrad: string
  onClick: () => void
}) {
  const [hover, setHover] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '0.3rem', padding: '0.55rem 0.35rem',
        background: aktiv
          ? akzentGrad
          : hover
          ? 'rgba(255,255,255,0.08)'
          : besucht
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(255,255,255,0.02)',
        border: aktiv
          ? 'none'
          : besucht
          ? `1px solid ${akzentFarbe}44`
          : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s',
        boxShadow: aktiv ? `0 4px 16px ${akzentFarbe}44` : 'none',
        position: 'relative' as const,
        minWidth: 0,
      }}
    >
      {/* Häkchen wenn besucht und nicht aktiv */}
      {besucht && !aktiv && (
        <div style={{
          position: 'absolute', top: 3, right: 4,
          fontSize: '0.55rem', color: akzentFarbe, fontWeight: 700, lineHeight: 1,
        }}>✓</div>
      )}
      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{schritt.emoji}</span>
      <span style={{
        fontSize: '0.6rem', fontWeight: aktiv ? 700 : 500,
        color: aktiv ? '#fff' : besucht ? `${akzentFarbe}cc` : 'rgba(255,255,255,0.45)',
        textAlign: 'center', lineHeight: 1.2,
        wordBreak: 'break-word' as const,
      }}>
        {schritt.titel.split(' ').slice(0, 2).join(' ')}
      </span>
    </button>
  )
}

// ─── Haupt-Komponente ────────────────────────────────────────────────────────

export function GlobaleGuideBegleitung() {
  const navigate = useNavigate()
  const location = useLocation()
  const [flow, setFlow] = useState<GuideFlowState | null>(null)
  const [geschlossen, setGeschlossen] = useState(false)
  const [aktuellerIdx, setAktuellerIdx] = useState(0)
  const [besuchtSet, setBesuchtSet] = useState<Set<number>>(new Set())

  // Drag-State – Refs damit keine Re-Renders durch Drag ausgelöst werden
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const isDraggingRef = useRef(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const origX = pos?.x ?? 0
    const origY = pos?.y ?? 0
    dragRef.current = { startX: clientX, startY: clientY, origX, origY }
    isDraggingRef.current = true
    e.preventDefault()
  }

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !dragRef.current) return
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY
      setPos({
        x: dragRef.current.origX + clientX - dragRef.current.startX,
        y: dragRef.current.origY + clientY - dragRef.current.startY,
      })
    }
    const onEnd = () => { isDraggingRef.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchend', onEnd)
    }
  }, [])

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

  useEffect(() => {
    if (flow?.aktiv) setGeschlossen(false)
  }, [location.pathname, location.search])

  if (!flow || !flow.aktiv || geschlossen) return null

  // Auf Galerie-Seiten und Admin: nicht zeigen (Admin hat eigenen inline-Hub)
  const ausgeblendetAuf = [
    '/projects/k2-galerie/galerie-oeffentlich',
    '/projects/k2-galerie/galerie',
    '/projects/vk2/galerie',
    '/galerie-oeffentlich',
    '/galerie-home',
    '/galerie',
    '/galerie/',
    '/admin',
  ]
  if (ausgeblendetAuf.includes(location.pathname)) return null

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

  const waehleSchritt = (idx: number) => {
    setAktuellerIdx(idx)
    setBesuchtSet(prev => new Set(prev).add(aktuellerIdx))
  }

  const zeigeStation = () => {
    setBesuchtSet(prev => new Set(prev).add(aktuellerIdx))
    navigate(aktuellerSchritt.route)
  }

  const weiter = () => {
    if (aktuellerIdx < schritte.length - 1) {
      setBesuchtSet(prev => new Set(prev).add(aktuellerIdx))
      const naechsterIdx = aktuellerIdx + 1
      setAktuellerIdx(naechsterIdx)
      navigate(schritte[naechsterIdx].route)
    }
  }

  const fertigStellen = () => {
    beendeGuideFlow()
    setGeschlossen(true)
    navigate(`/admin?context=oeffentlich&assistent=1&vorname=${encodeURIComponent(name)}&pfad=${pfad}`)
  }

  const erklaerungText = aktuellerSchritt.beschreibung.split('\n').map((z, i, arr) => (
    <span key={i}>{z}{i < arr.length - 1 && <br />}</span>
  ))

  // Hub-Layout: Kacheln links + rechts, Dialog Mitte
  // Kacheln aufteilen: linke Hälfte / rechte Hälfte
  const halbePunkte = Math.ceil(schritte.length / 2)
  const kachelnLinks = schritte.slice(0, halbePunkte)
  const kachelnRechts = schritte.slice(halbePunkte)

  // Position: verschoben → frei; sonst unten mittig (breiter Hub)
  const containerStyle: React.CSSProperties = pos
    ? {
        position: 'fixed',
        left: `calc(50% + ${pos.x}px)`,
        bottom: `calc(1.5rem - ${pos.y}px)`,
        transform: 'translateX(-50%)',
        zIndex: 10000,
        width: 'min(720px, calc(100vw - 1.5rem))',
      }
    : {
        position: 'fixed',
        bottom: '1.2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        width: 'min(720px, calc(100vw - 1.5rem))',
        animation: 'globGuideHub 0.4s ease',
      }

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes globGuideHub {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      <div style={{
        background: 'rgba(12,7,3,0.97)',
        border: `1px solid ${akzentFarbe}44`,
        borderRadius: '22px',
        padding: '0.9rem',
        boxShadow: '0 20px 64px rgba(0,0,0,0.7)',
        backdropFilter: 'blur(20px)',
      }}>

        {/* Drag-Handle */}
        <div
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          style={{ cursor: 'grab', display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}
          title="Verschieben"
        >
          <div style={{ width: 32, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.14)' }} />
        </div>

        {/* Haupt-Layout: Kacheln links | Dialog Mitte | Kacheln rechts */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'stretch' }}>

          {/* ── Kacheln links ── */}
          <div style={{
            display: 'grid',
            gridTemplateRows: `repeat(${kachelnLinks.length}, 1fr)`,
            gap: '0.4rem',
            width: '90px',
            flexShrink: 0,
          }}>
            {kachelnLinks.map((s, i) => (
              <Kachel
                key={s.id}
                schritt={s}
                aktiv={aktuellerIdx === i}
                besucht={besuchtSet.has(i)}
                akzentFarbe={akzentFarbe}
                akzentGrad={akzentGrad}
                onClick={() => waehleSchritt(i)}
              />
            ))}
          </div>

          {/* ── Mitte: Dialog ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.55rem', minWidth: 0 }}>

            {/* Kopfzeile: Avatar + Label + Schließen */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: akzentGrad,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.05rem', boxShadow: `0 3px 10px ${akzentFarbe}44`,
              }}>
                {avatarEmoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.58rem', color: `${akzentFarbe}99`, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const }}>
                  {guideLabel}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#fff8f0', fontWeight: 700, lineHeight: 1.3, marginTop: '0.1rem' }}>
                  {aktuellerSchritt.emoji} {aktuellerSchritt.titel}
                </div>
              </div>
              <button type="button" onClick={() => setGeschlossen(true)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem 0.3rem', flexShrink: 0 }}
                title="Schließen">✕</button>
            </div>

            {/* Fortschrittsbalken */}
            <div style={{ display: 'flex', gap: '0.18rem' }}>
              {schritte.map((s, i) => (
                <div key={s.id}
                  onClick={() => waehleSchritt(i)}
                  style={{
                    flex: 1, height: 3, borderRadius: 2, cursor: 'pointer',
                    background: i < aktuellerIdx
                      ? akzentFarbe
                      : i === aktuellerIdx
                      ? `${akzentFarbe}88`
                      : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.25s',
                  }}
                  title={schritte[i].titel}
                />
              ))}
            </div>

            {/* Beschreibung */}
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.55 }}>
              {erklaerungText}
            </div>

            {/* Lizenz-Sonderanzeige */}
            {istLizenzSchritt && <LizenzInfo pfad={pfad} akzentFarbe={akzentFarbe} />}

            {/* Aktions-Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.35rem', marginTop: 'auto' }}>
              {istLetzterSchritt ? (
                <button type="button" onClick={fertigStellen}
                  style={{ width: '100%', padding: '0.75rem', background: akzentGrad, border: 'none', borderRadius: '11px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit', boxShadow: `0 4px 16px ${akzentFarbe}44` }}>
                  🚀 {istVerein ? 'Vereinsdaten ausfüllen & starten' : 'Daten ausfüllen & starten'}
                </button>
              ) : (
                <>
                  <button type="button" onClick={zeigeStation}
                    style={{ width: '100%', padding: '0.7rem', background: akzentGrad, border: 'none', borderRadius: '11px', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.84rem', fontFamily: 'inherit', boxShadow: `0 4px 12px ${akzentFarbe}33` }}>
                    {aktuellerSchritt.emoji} Ansehen →
                  </button>
                  <button type="button" onClick={weiter}
                    style={{ width: '100%', padding: '0.45rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '11px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    Nächste Station →
                  </button>
                </>
              )}
            </div>

          </div>

          {/* ── Kacheln rechts ── */}
          <div style={{
            display: 'grid',
            gridTemplateRows: `repeat(${kachelnRechts.length}, 1fr)`,
            gap: '0.4rem',
            width: '90px',
            flexShrink: 0,
          }}>
            {kachelnRechts.map((s, i) => {
              const globalIdx = halbePunkte + i
              return (
                <Kachel
                  key={s.id}
                  schritt={s}
                  aktiv={aktuellerIdx === globalIdx}
                  besucht={besuchtSet.has(globalIdx)}
                  akzentFarbe={akzentFarbe}
                  akzentGrad={akzentGrad}
                  onClick={() => waehleSchritt(globalIdx)}
                />
              )
            })}
          </div>

        </div>
      </div>
    </div>
  )
}
