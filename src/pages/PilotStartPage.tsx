/**
 * Schreiben an Michael (Pilot) – eine Seite, ein Klick zur Galerie.
 * Georg schickt den Link (z. B. per WhatsApp). Michael tippt den Link → tippt „Galerie öffnen“ → ist drin.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES, BASE_APP_URL, PILOT_SCHREIBEN_ROUTE } from '../config/navigation'

const PILOT_GALERIE_URL = BASE_APP_URL + PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
/** Diese Seite – damit Georg sie per QR aufs Handy holen und an Michael schicken kann */
const PILOT_SEITE_URL = BASE_APP_URL + PILOT_SCHREIBEN_ROUTE

// Kurz und klar – das Erste, was Michael sieht
const KURZ_TEXT = 'Hallo Michael,\n\nhier dein Zugang zur K2 Galerie. Tipp einmal auf den grünen Button – dann bist du in deiner Galerie. Passwort leer lassen, unter Einstellungen deinen Namen eintragen. Fertig.'

const BRIEF_TEXT = `Hallo Michael,

hier dein Zugang zur K2 Galerie (Pro+ zum Start kostenlos). So startest du ohne Aufwand:

Unten findest du den Link für deinen PC und einen QR-Code fürs Handy – beides führt in deine Galerie.

Schritt 1 – Galerie öffnen
PC: Link unten in den Browser kopieren. Handy: QR-Code mit der Kamera scannen.

Schritt 2 – In den Admin
Auf der Galerie-Seite auf „Admin“ tippen bzw. klicken. Passwort-Feld in den ersten 2 Wochen leer lassen – du kommst sofort rein.

Schritt 3 – Deine Galerie einrichten
Unter Einstellungen: Galerie-Name und deinen Kontakt (E-Mail, Telefon) eintragen. Dann wirkt die Galerie wie deine.

Schritt 4 – Erstes Werk anlegen
Unter „Werke verwalten“ auf „Neues Werk“ – Foto und Infos eintragen, Speichern.

Schritt 5 – Veröffentlichen
In Einstellungen „Veröffentlichen“ tippen (oder es läuft nach dem Speichern automatisch). Dann sind deine Daten auf dem Server – nichts geht verloren, wenn du das Gerät wechselst.

Schritt 6 – Am anderen Gerät
Am Handy oder zweitem Rechner: wieder Link nutzen bzw. QR scannen → in Einstellungen „Bilder vom Server laden“ tippen → deine Werke erscheinen.

Wichtig: Immer denselben Link bzw. denselben QR nutzen (PC und Handy), dann bleibt alles in deiner Galerie. Bei Fragen melde dich einfach.

Viel Erfolg!`

// Kontrast nach Regel: heller Hintergrund, dunkle Schrift (#1c1a18, #5c5650), Akzent dunkel
const BG = '#f6f4f0'
const TEXT = '#1c1a18'
const MUTED = '#5c5650'
const BUTTON_BG = '#0d9488'
const BUTTON_HOVER = '#0f766e'
const LINK_COLOR = '#0d9488'

export default function PilotStartPage() {
  const [qrUrl, setQrUrl] = useState('')
  const [qrSeiteUrl, setQrSeiteUrl] = useState('')
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      QRCode.toDataURL(PILOT_GALERIE_URL, { width: 280, margin: 1 }),
      QRCode.toDataURL(PILOT_SEITE_URL, { width: 280, margin: 1 }),
    ])
      .then(([galerie, seite]) => {
        if (!cancelled) {
          setQrUrl(galerie)
          setQrSeiteUrl(seite)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, padding: '1.25rem', maxWidth: 560, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <p style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
        <Link to={PROJECT_ROUTES['k2-galerie'].marketingOek2} style={{ color: LINK_COLOR }}>← Zurück zu mök2</Link>
      </p>

      <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fffefb', borderRadius: 12, border: `1px solid ${MUTED}` }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: TEXT, marginBottom: '0.5rem' }}>Adresse aufs Handy (ohne Tippen)</div>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: MUTED }}>
          QR-Code mit der Handy-Kamera scannen → die Seite öffnet sich auf dem Handy → dann „Teilen“ → WhatsApp → an Michael senden.
        </p>
        {qrSeiteUrl ? (
          <img src={qrSeiteUrl} alt="QR-Code: diese Seite aufs Handy öffnen" style={{ display: 'block', width: 140, height: 140, borderRadius: 8, background: '#fff' }} />
        ) : (
          <div style={{ width: 140, height: 140, background: '#eee', borderRadius: 8 }} />
        )}
      </div>

      <p style={{ whiteSpace: 'pre-wrap', fontSize: '1rem', lineHeight: 1.6, color: TEXT, marginBottom: '1.5rem' }}>
        {KURZ_TEXT}
      </p>

      <a
        href={PILOT_GALERIE_URL}
        style={{
          display: 'block',
          padding: '1rem 1.5rem',
          background: BUTTON_BG,
          color: '#fff',
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '1.25rem',
          borderRadius: 12,
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = BUTTON_HOVER
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = BUTTON_BG
        }}
      >
        Galerie öffnen
      </a>
      <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: MUTED }}>
        Ein Tipp – dann bist du in deiner Galerie.
      </p>

      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${MUTED}` }}>
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          style={{
            padding: '0.5rem 0',
            background: 'none',
            border: 'none',
            color: LINK_COLOR,
            fontSize: '0.95rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {showMore ? 'Weniger anzeigen' : 'Mehr Infos (alle Schritte)'}
        </button>
        {showMore && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fffefb', borderRadius: 10, fontSize: '0.9rem', lineHeight: 1.7, color: TEXT, whiteSpace: 'pre-wrap' }}>
            {BRIEF_TEXT}
          </div>
        )}
      </div>

      {showMore && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fffefb', borderRadius: 10, border: `1px solid ${MUTED}` }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT, marginBottom: '0.35rem' }}>Link für PC (zum Kopieren)</div>
          <p style={{ margin: 0, fontSize: '0.85rem', wordBreak: 'break-all', color: MUTED }}>{PILOT_GALERIE_URL}</p>
          {qrUrl && (
            <>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: TEXT, marginTop: '1rem', marginBottom: '0.35rem' }}>QR-Code (am PC: mit Handy scannen)</div>
              <img src={qrUrl} alt="QR-Code zur Galerie" style={{ display: 'block', width: 160, height: 160, borderRadius: 8, background: '#fff' }} />
            </>
          )}
        </div>
      )}
    </div>
  )
}
