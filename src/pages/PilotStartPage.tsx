/**
 * Schreiben an Michael (Pilot) – Begleitschreiben + Link (PC) + QR (Handy).
 * Als PDF herunterladen: Button „Als PDF herunterladen“ → im Druckdialog „Als PDF speichern“ wählen.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES, BASE_APP_URL } from '../config/navigation'

const PRINT_HIDE = 'pilot-schreiben-no-print'
const printStyles = `
  @media print {
    .${PRINT_HIDE} { display: none !important; }
    body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .pilot-schreiben-print { background: #fff !important; color: #111 !important; }
    .pilot-schreiben-print h1, .pilot-schreiben-print h2 { color: #0d9488 !important; }
    .pilot-schreiben-print a { color: #0d9488 !important; }
  }
`

const PILOT_GALERIE_URL = BASE_APP_URL + PROJECT_ROUTES['k2-galerie'].galerieOeffentlich

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

export default function PilotStartPage() {
  const [qrUrl, setQrUrl] = useState('')

  useEffect(() => {
    let cancelled = false
    QRCode.toDataURL(PILOT_GALERIE_URL, { width: 280, margin: 1 })
      .then((url) => { if (!cancelled) setQrUrl(url) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return (
    <div className="pilot-schreiben-print" style={{ minHeight: '100vh', background: 'var(--k2-bg-1, #1a0f0a)', color: 'var(--k2-text, #fff5f0)', padding: '1.5rem', maxWidth: 640, margin: '0 auto' }}>
      <style>{printStyles}</style>
      <p className={PRINT_HIDE} style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
        <Link to={PROJECT_ROUTES['k2-galerie'].marketingOek2} style={{ color: '#5ffbf1' }}>← Zurück zu mök2</Link>
      </p>
      <div className={PRINT_HIDE} style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: 10 }}>
        <button
          type="button"
          onClick={() => window.print()}
          style={{ padding: '0.6rem 1.2rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
        >
          Als PDF herunterladen
        </button>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>
          Öffnet den Druckdialog – dort „Als PDF speichern“ wählen, speichern, und die Datei an Michael schicken.
        </p>
      </div>
      <h1 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '1rem' }}>
        Schreiben an Michael (Start-Anleitung Piloten)
      </h1>

      <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '1.25rem', fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
        {BRIEF_TEXT}
      </div>

      <h2 style={{ fontSize: '1rem', color: '#5ffbf1', marginBottom: '0.5rem' }}>Zum Verschicken an Michael – Link (PC) + QR (Handy)</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-start', padding: '1.25rem', background: 'rgba(95,251,241,0.08)', border: '1px solid rgba(95,251,241,0.25)', borderRadius: '12px' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#5ffbf1', marginBottom: '0.35rem' }}>Für PC (Link zum Kopieren)</div>
          <p style={{ margin: 0, fontSize: '0.9rem', wordBreak: 'break-all', color: 'rgba(255,255,255,0.9)' }}>
            {PILOT_GALERIE_URL}
          </p>
        </div>
        <div style={{ flex: '0 0 auto' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#5ffbf1', marginBottom: '0.35rem' }}>Für Handy (QR-Code scannen)</div>
          {qrUrl ? (
            <img src={qrUrl} alt="QR-Code zur Galerie (Handy)" style={{ display: 'block', width: 200, height: 200, borderRadius: 8, background: '#fff' }} />
          ) : (
            <div style={{ width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>QR wird geladen …</div>
          )}
        </div>
      </div>
    </div>
  )
}
