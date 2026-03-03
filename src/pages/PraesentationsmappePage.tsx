/**
 * K2 Galerie – Prospekt (fertige Form).
 * Eine Seite inkl. Impressum, QR-Codes und Links für ök2 und VK2.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES, BASE_APP_URL } from '../config/navigation'
import { PRODUCT_COPYRIGHT, PRODUCT_LIZENZ_ANFRAGE_EMAIL } from '../config/tenantConfig'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

const printStyles = `
  @media print {
    .pm-no-print { display: none !important; }
    body { background: #fff !important; }
    .pm-wrap { background: #fffefb !important; color: #1c1a18 !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
    .pm-cover { background: #fffefb !important; color: #1c1a18 !important; border: none !important; padding: 8mm 14mm 6mm !important; }
    .pm-cover h1 { color: #0d9488 !important; font-size: 18pt !important; margin: 0 0 2mm !important; }
    .pm-cover .pm-tagline { color: #5c5650 !important; font-size: 10pt !important; margin: 0 !important; }
    .pm-cover .pm-lead { font-size: 10pt !important; line-height: 1.4 !important; margin: 4mm 0 0 !important; }
    .pm-body h2 { color: #0d9488 !important; font-size: 10pt !important; margin: 3.5mm 0 2mm !important; padding-bottom: 1mm !important; border-bottom: 1px solid #0d9488 !important; }
    .pm-body p { font-size: 9.5pt !important; line-height: 1.38 !important; color: #1c1a18 !important; margin: 1.5mm 0 !important; }
    .pm-body .pm-compact { font-size: 9pt !important; line-height: 1.32 !important; }
    .pm-impressum { font-size: 8pt !important; line-height: 1.35 !important; color: #5c5650 !important; margin-top: 5mm !important; padding-top: 4mm !important; border-top: 1px solid #e5e2dd !important; }
    .pm-impressum a { color: #5c5650 !important; text-decoration: none !important; }
    .pm-qr-block { margin-top: 4mm !important; padding-top: 4mm !important; border-top: 1px solid #e5e2dd !important; break-inside: avoid !important; }
    .pm-qr-block img { width: 22mm !important; height: 22mm !important; }
    .pm-qr-block a { color: #1c1a18 !important; text-decoration: none !important; }
    .pm-footer { position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; padding: 2mm 14mm !important; font-size: 8pt !important; color: #5c5650 !important; background: #fffefb !important; }
    .pm-footer .pm-footer-text { display: none !important; }
    .pm-footer::after { content: "Seite " counter(page); }
    @page { margin: 12mm 14mm 10mm 14mm; size: A4; }
  }
`

const OEK2_URL = BASE_APP_URL + '/projects/k2-galerie/galerie-oeffentlich'
const OEK2_WILLKOMMEN_URL = BASE_APP_URL + '/willkommen'
const VK2_URL = BASE_APP_URL + '/projects/vk2'

export default function PraesentationsmappePage() {
  const { versionTimestamp: qrVersionTs, refetch: refetchQrStand } = useQrVersionTimestamp()
  const [qrOek2, setQrOek2] = useState('')
  const [qrVk2, setQrVk2] = useState('')

  // Beim Öffnen sofort Server-Stand holen, damit ök2/VK2-QR auf aktuelle Version verweisen
  useEffect(() => {
    refetchQrStand()
  }, [refetchQrStand])

  useEffect(() => {
    QRCode.toDataURL(buildQrUrlWithBust(OEK2_URL, qrVersionTs), { width: 110, margin: 1 })
      .then(setQrOek2).catch(() => setQrOek2(''))
  }, [qrVersionTs])
  useEffect(() => {
    QRCode.toDataURL(buildQrUrlWithBust(VK2_URL, qrVersionTs), { width: 110, margin: 1 })
      .then(setQrVk2).catch(() => setQrVk2(''))
  }, [qrVersionTs])

  const handleQrAktualisieren = () => {
    refetchQrStand()
  }

  return (
    <div className="pm-wrap" style={{ minHeight: '100vh', background: '#faf8f5', color: '#1c1a18' }}>
      <style>{printStyles}</style>

      <div className="pm-no-print" style={{ padding: '1rem 1.5rem', background: '#2a2a2a', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to={PROJECT_ROUTES['k2-galerie'].marketingOek2} style={{ color: '#5ffbf1', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Zurück zu mök2
        </Link>
        <button
          type="button"
          onClick={handleQrAktualisieren}
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.15)',
            color: '#5ffbf1',
            border: '1px solid rgba(95,251,241,0.5)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          QR auf aktuellen Stand bringen
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: '0.5rem 1rem',
            background: '#0d9488',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Als PDF drucken (1 Seite)
        </button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem', background: '#fffefb', color: '#1c1a18', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {/* Deckblatt – 3 Zeilen, ordentlich editiert */}
        <header className="pm-cover" style={{ padding: '1.5rem 0 1rem', marginBottom: '1rem', borderBottom: '2px solid #0d9488' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0d9488', margin: 0, letterSpacing: '-0.02em' }}>
            K2 Galerie
          </h1>
          <p className="pm-tagline" style={{ fontSize: '0.95rem', color: '#5c5650', margin: '0.25rem 0 0', fontWeight: 500 }}>
            Multifunktionale Arbeitsplattform für Künstler:innen und Galerien – Galerie, Kassa, Events und Presse aus einer Hand.
          </p>
          <p className="pm-lead" style={{ fontSize: '0.9rem', lineHeight: 1.45, color: '#1c1a18', marginTop: '0.75rem', maxWidth: '520px' }}>
            Für Ateliers, Galerien und Kunstvereine. Windows, Android, macOS, iOS · Browser & PWA. Lizenzen: Basic, Pro, Pro+, VK2.
          </p>
        </header>

        {/* Inhalt – Fließtext, keine Listenwüste */}
        <div className="pm-body">
          <h2 style={{ fontSize: '1.1rem', color: '#0d9488', marginTop: '1rem', marginBottom: '0.5rem', paddingBottom: '0.25rem', borderBottom: '1px solid rgba(13,148,136,0.3)' }}>
            Was ist die K2 Galerie?
          </h2>
          <p>
            Die K2 Galerie ist keine reine Galerie-App, sondern eine <strong>Arbeitsplattform</strong>: Sie verbindet den öffentlichen Webauftritt mit Verwaltung, Verkauf und Marketing. Werke anlegen, Galerie veröffentlichen, vor Ort verkaufen (Kasse am Tablet oder Handy), Events planen, Einladungen und Presse aus denselben Stammdaten erzeugen – einheitlich und sofort nutzbar. Ein Stand auf allen Geräten, ein Klick zum Ziel.
          </p>
          <p>
            Zielgruppe sind <strong>Künstler:innen</strong> (Selbstvermarktung, eigene Werke, Ausstellungen, Webauftritt) sowie <strong>Kunstvereine</strong> (VK2: gemeinsame Vereinsgalerie, Mitglieder, Events). Skalierbar und ohne direkten Kundenkontakt: Lizenz, Bestätigung und Abrechnung laufen über das System (Stripe, druckbare Bestätigung).
          </p>

          <h2 style={{ fontSize: '1.1rem', color: '#0d9488', marginTop: '1.25rem', marginBottom: '0.5rem', paddingBottom: '0.25rem', borderBottom: '1px solid rgba(13,148,136,0.3)' }}>
            Kernfunktionen
          </h2>
          <p>
            <strong>Galerie & Werke:</strong> Fotos, Titel, Preis, Kategorien; Vorschau; Veröffentlichen; gleicher Stand auf Mac, Tablet und Handy. <strong>Admin:</strong> Werke, Design (Farben, Texte, Bilder), Einstellungen, Schritt-für-Schritt-Assistent, Kassa/Lager/Werkkatalog, Events, Presse & Medien. <strong>Kassa & Kassabuch:</strong> Verkauf erfassen (Shop oder „Als Kasse öffnen“); ab Pro: Kassabuch (Eingänge); ab Pro+: Ausgänge, Bar, Beleg (QR/Foto), PDF-Export. <strong>Events & Presse:</strong> Events anlegen, Einladungen, Flyer, Presseaussendung, Social Media – aus Stammdaten und Event-Daten. <strong>Werbeunterlagen:</strong> Newsletter, Plakat, Flyer, QR-Plakat aus einer Quelle im Galerie-Design.
          </p>

          <h2 style={{ fontSize: '1.1rem', color: '#0d9488', marginTop: '1.25rem', marginBottom: '0.5rem', paddingBottom: '0.25rem', borderBottom: '1px solid rgba(13,148,136,0.3)' }}>
            Technik & Qualität
          </h2>
          <p className="pm-compact">
            Moderne Web-Stack (React, TypeScript, Vite, Tailwind); Supabase (Auth, Lizenzen); Vercel (Hosting); Stripe (Zahlung). Architektur: eine Quelle pro Thema (Tenant-Context, Schichten für Daten, eine Sync-Regel). Kundendaten werden nicht automatisch gelöscht; K2, Demo (ök2) und Vereine (VK2) sind strikt getrennt. Stand und QR mit Server-Cache-Bust; 38 automatisierte Tests, QS vor jedem Release.
          </p>

          <h2 style={{ fontSize: '1.1rem', color: '#0d9488', marginTop: '1.25rem', marginBottom: '0.5rem', paddingBottom: '0.25rem', borderBottom: '1px solid rgba(13,148,136,0.3)' }}>
            Lizenzen
          </h2>
          <p className="pm-compact">
            <strong>Basic</strong> 15 €/Monat: Galerie, Werke, Design; keine Kassa. <strong>Pro</strong> 35 €/Monat: plus Kassa, Kassabuch (Eingänge). <strong>Pro+</strong> 45 €/Monat: plus volles Kassabuch und gesamter Marketingbereich (Events, Flyer, Presse, Social). <strong>VK2 (Kunstvereine):</strong> ab 10 registrierten Mitgliedern für den Verein kostenfrei; Lizenzmitglied 50 % Lizenz. Abschluss und Bestätigung über Stripe; ausdruckbare Lizenzbestätigung.
          </p>

          {/* Links & QR-Codes – ök2 und VK2, zum Scannen und Weitergeben */}
          <div className="pm-qr-block" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e2dd', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {qrOek2 && <img src={qrOek2} alt="" width={110} height={110} style={{ display: 'block', flexShrink: 0 }} />}
              <div style={{ fontSize: '0.85rem', color: '#1c1a18' }}>
                <strong style={{ color: '#0d9488' }}>ök2 – Demo-Galerie</strong><br />
                <a href={buildQrUrlWithBust(OEK2_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', wordBreak: 'break-all' }}>{OEK2_URL}</a><br />
                <span style={{ fontSize: '0.8rem', color: '#5c5650' }}>Willkommen &amp; Lizenz: <a href={buildQrUrlWithBust(OEK2_WILLKOMMEN_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', wordBreak: 'break-all' }}>{OEK2_WILLKOMMEN_URL}</a></span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {qrVk2 && <img src={qrVk2} alt="" width={110} height={110} style={{ display: 'block', flexShrink: 0 }} />}
              <div style={{ fontSize: '0.85rem', color: '#1c1a18' }}>
                <strong style={{ color: '#0d9488' }}>VK2 – Vereinsplattform</strong><br />
                <a href={buildQrUrlWithBust(VK2_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', wordBreak: 'break-all' }}>{VK2_URL}</a>
              </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#5c5650', margin: '0.5rem 0 0', width: '100%' }}>
              QR und Links verweisen auf die aktuelle Version. Nach neuem Deploy: diese Seite neu laden, ggf. „QR auf aktuellen Stand bringen“, dann drucken.
            </p>
          </div>

          {/* Impressum – fertig, zu jedem Pressetext beifügbar, überall als Kurzinformation mitsenden */}
          <div className="pm-impressum" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e5e2dd', fontSize: '0.8rem', color: '#5c5650', lineHeight: 1.4 }}>
            <strong style={{ color: '#1c1a18' }}>Impressum</strong><br />
            Medieninhaber &amp; Herausgeber: K2 Galerie · Design und Entwicklung: kgm solution (G. Kreinecker).<br />
            Kontakt: <a href={`mailto:${PRODUCT_LIZENZ_ANFRAGE_EMAIL}`} style={{ color: '#0d9488', textDecoration: 'none' }}>{PRODUCT_LIZENZ_ANFRAGE_EMAIL}</a><br />
            {PRODUCT_COPYRIGHT}
          </div>
        </div>

        <footer className="pm-footer" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e2dd', fontSize: '0.8rem', color: '#5c5650' }}>
          <span className="pm-footer-text">K2 Galerie – Prospekt · Stand März 2026</span>
        </footer>
      </div>
    </div>
  )
}
