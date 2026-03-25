/**
 * Prospekt/Flyer K2 Galerie – zusätzliches Dokument in Präsentationsmappen K2.
 * Inhalt: Header, Was ist K2 Galerie, Kernfunktionen, Technik & Qualität, Lizenzen, QR, Impressum.
 * Design: wie Kurzvariante (Teal/Weiß). Druckversion: genau eine A4-Seite.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { BASE_APP_URL, BENUTZER_HANDBUCH_ROUTE, OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE } from '../config/navigation'
import { PRODUCT_COPYRIGHT, PRODUCT_LIZENZ_ANFRAGE_EMAIL, PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2 } from '../config/tenantConfig'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

const TEAL = '#0f766e'
const TEAL_DARK = '#0c5c55' /* kräftiger Brand-Bereich (Druck + Bildschirm) */
const TEAL_LIGHT = '#0d9488'

const OEK2_URL = BASE_APP_URL + '/projects/k2-galerie/galerie-oeffentlich'
const OEK2_EINGANGSTOR_URL = BASE_APP_URL + OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE
const VK2_URL = BASE_APP_URL + '/projects/vk2'

const printStyles = `
  @media print {
    .prospekt-no-print { display: none !important; }
    body { background: #fff !important; }
    .prospekt-wrap { background: #fff !important; color: #1c1a18 !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
    .prospekt-wrap > div { max-width: none !important; padding: 6mm 10mm !important; box-shadow: none !important; }
    .prospekt-teal-cover { background: #0c5c55 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color: #fff !important; padding: 4mm 8mm !important; border-radius: 0 !important; margin-bottom: 3mm !important; page-break-inside: avoid !important; }
    .prospekt-teal-cover h1 { font-size: 14pt !important; margin: 0 !important; color: #fff !important; font-weight: 700 !important; }
    .prospekt-teal-cover .prospekt-slogan { font-size: 8pt !important; margin: 1mm 0 0 !important; line-height: 1.2 !important; color: #fff !important; font-weight: 600 !important; }
    .prospekt-teal-cover .prospekt-tagline { font-size: 7pt !important; margin: 0.5mm 0 0 !important; color: #fff !important; }
    .prospekt-teal-cover .prospekt-lead { font-size: 6pt !important; margin: 1.5mm 0 0 !important; line-height: 1.25 !important; color: #fff !important; }
    .prospekt-teal-cover .prospekt-copy { font-size: 6pt !important; margin: 1mm 0 0 !important; color: #fff !important; }
    .prospekt-body { color: #1c1a18 !important; font-size: 6pt !important; line-height: 1.28 !important; margin-bottom: 1.5mm !important; }
    .prospekt-body p { margin: 0 0 1.2mm !important; }
    .prospekt-body h2 { color: ${TEAL} !important; font-size: 7pt !important; font-weight: 700 !important; margin: 2mm 0 0.8mm !important; }
    .prospekt-body hr { margin: 1.5mm 0 !important; border: none !important; border-top: 1px solid ${TEAL_LIGHT} !important; }
    .prospekt-qr-block { margin-top: 2mm !important; padding-top: 2mm !important; gap: 3mm !important; }
    .prospekt-qr-block img { width: 12mm !important; height: 12mm !important; }
    .prospekt-qr-block > div { font-size: 5pt !important; }
    .prospekt-qr-block p { font-size: 5pt !important; margin: 0 !important; }
    .prospekt-impressum { margin-top: 1.5mm !important; padding-top: 1.5mm !important; font-size: 4.5pt !important; color: #5c5650 !important; line-height: 1.2 !important; }
    .prospekt-footer { display: none !important; }
    @page { margin: 6mm 8mm; size: A4; }
    .prospekt-wrap { min-height: auto !important; }
    .prospekt-wrap > div { page-break-inside: avoid !important; }
  }
`

export default function ProspektK2GaleriePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { versionTimestamp: qrVersionTs, refetch: refetchQrStand } = useQrVersionTimestamp()
  const [qrOek2, setQrOek2] = useState('')
  const [qrVk2, setQrVk2] = useState('')

  useEffect(() => {
    refetchQrStand()
  }, [refetchQrStand])
  useEffect(() => {
    QRCode.toDataURL(buildQrUrlWithBust(OEK2_URL, qrVersionTs), { width: 90, margin: 1 })
      .then(setQrOek2).catch(() => setQrOek2(''))
  }, [qrVersionTs])
  useEffect(() => {
    QRCode.toDataURL(buildQrUrlWithBust(VK2_URL, qrVersionTs), { width: 90, margin: 1 })
      .then(setQrVk2).catch(() => setQrVk2(''))
  }, [qrVersionTs])

  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo
  const leadText = 'Für die Kunst gedacht, für den Markt gemacht. Ateliers, Galerien, Kunstvereine. Windows, Android, macOS, iOS · Browser & PWA. Lizenzen: Basic, Pro, Pro+, Pro++, VK2.'

  return (
    <div className="prospekt-wrap" style={{ minHeight: '100vh', background: '#faf8f5', color: '#1c1a18' }}>
      <style>{printStyles}</style>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.5rem', background: '#fffefb', color: '#1c1a18', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="prospekt-no-print" style={{ marginBottom: '1rem', padding: '0.75rem 0', borderBottom: `1px solid ${TEAL_LIGHT}40`, display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          {returnTo ? (
            <Link to={returnTo} style={{ color: TEAL_LIGHT, textDecoration: 'none', fontWeight: 500 }}>← Zurück</Link>
          ) : (
            <button type="button" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: TEAL_LIGHT, fontWeight: 500, cursor: 'pointer', padding: 0 }}>← Zurück</button>
          )}
          <button type="button" onClick={() => refetchQrStand()} style={{ padding: '0.4rem 0.75rem', background: '#f0fdfa', color: TEAL_LIGHT, border: `1px solid ${TEAL_LIGHT}60`, borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
            QR aktualisieren
          </button>
          <button type="button" onClick={() => window.print()} style={{ padding: '0.4rem 0.75rem', background: TEAL, color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
            Als PDF drucken
          </button>
          <Link to={BENUTZER_HANDBUCH_ROUTE} style={{ padding: '0.4rem 0.75rem', background: '#f0fdfa', color: TEAL_LIGHT, border: `1px solid ${TEAL_LIGHT}60`, borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>
            Benutzerhandbuch
          </Link>
        </div>

        {/* Deckblatt wie Kurzvariante – Teal/Weiß */}
        <div className="prospekt-teal-cover" style={{ background: TEAL_DARK, color: '#fff', padding: 'clamp(1.25rem, 3vw, 2rem) 1.25rem', borderRadius: '12px', marginBottom: '1.25rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            K2 Galerie
          </h1>
          <p className="prospekt-slogan" style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', fontWeight: 600, color: '#fff', margin: '0.5rem 0 0', lineHeight: 1.35 }}>
            {PRODUCT_WERBESLOGAN}
          </p>
          <p className="prospekt-tagline" style={{ fontSize: 'clamp(0.8rem, 1.8vw, 0.95rem)', color: 'rgba(255,255,255,0.95)', margin: '0.35rem 0 0', lineHeight: 1.4 }}>
            {PRODUCT_WERBESLOGAN_2}
          </p>
          <p className="prospekt-lead" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', margin: '1rem 0 0', lineHeight: 1.3 }}>
            {leadText}
          </p>
          <p className="prospekt-copy" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.85)', margin: '0.75rem 0 0' }}>
            © kgm solution
          </p>
        </div>

        <div className="prospekt-body">
          <h2 style={{ color: TEAL_LIGHT, fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Was ist die K2 Galerie?</h2>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
            Die K2 Galerie ist keine reine Galerie-App, sondern eine <strong>Arbeitsplattform</strong>: sie verbindet den öffentlichen Webauftritt mit Verwaltung, Verkauf und Marketing. Werke anlegen, Galerie veröffentlichen, vor Ort verkaufen (Kasse am Tablet oder Handy), Events planen, Einladungen und Presse aus denselben Stammdaten – einheitlich und sofort nutzbar. Ein Stand auf allen Geräten, ein Klick zum Ziel.
          </p>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
            Für alle, die <strong>Ideen oder Produkte</strong> professionell zeigen und vermarkten wollen. <strong>Kunstmarkt</strong> ist die Unterkategorie (Künstler:innen, Galerien). Skalierbar und ohne direkten Kundenkontakt: Lizenz, Bestätigung und Abrechnung erfolgen über das System (Stripe, druckbare Bestätigung).
          </p>

          <hr style={{ border: 'none', borderTop: `1px solid ${TEAL_LIGHT}`, margin: '1rem 0' }} />

          <h2 style={{ color: TEAL_LIGHT, fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Kernfunktionen</h2>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.45, margin: '0 0 0.5rem' }}>
            <strong>Galerie & Werke:</strong> Fotos, Titel, Preis, Kategorien; Vorschau; Veröffentlichen; gleicher Stand auf Mac, Tablet und Handy. <strong>Admin:</strong> Werke, Design (Farben, Texte, Bilder), Einstellungen, Schritt-für-Schritt-Assistent, Statistik/Werkkatalog, Event- und Medienplanung. <strong>Kassa & Kassabuch:</strong> Verkauf erfassen (Shop oder „Als Kasse öffnen“); ab Pro: Kassabuch (Eingänge); ab Pro+: Ausgänge, Bar, Beleg (QR/Foto), PDF-Export. <strong>Event- und Medienplanung:</strong> Events anlegen, Einladungen, Mediengenerator, Verteiler und Social Media – aus Stammdaten und Event-Daten. <strong>Werbeunterlagen:</strong> Newsletter, Plakat, Flyer aus einer Quelle im Galerie-Design.
          </p>

          <h2 style={{ color: TEAL_LIGHT, fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Technik & Qualität</h2>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.45, margin: '0 0 0.5rem' }}>
            Moderner Web-Stack (React, TypeScript, Vite, Tailwind); Supabase (Auth, Lizenzen); Vercel (Hosting); Stripe (Zahlung). Architektur: eine Quelle pro Thema. Aktueller Stand und QR mit Server-Cache-Bust; 38 automatisierte Tests, QS vor jedem Release.
          </p>

          <h2 style={{ color: TEAL_LIGHT, fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>Lizenzen</h2>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.45, margin: '0 0 0.5rem' }}>
            <strong>Basic</strong> 15 €/Monat: Galerie, Werke, Design; keine Kassa. <strong>Pro</strong> 35 €/Monat: plus Kassa, Kassabuch (Eingänge). <strong>Pro+</strong> 45 €/Monat: plus volles Kassabuch und gesamter Marketingbereich. <strong>Pro++</strong> 55 €/Monat: Pro+ inkl. Rechnung (§ 11 UStG). <strong>VK2 (Kunstvereine):</strong> ab 10 registrierten Mitgliedern für den Verein kostenfrei; Lizenzmitglieder 50 % Lizenz. Abschluss über Stripe; ausdruckbare Lizenzbestätigung.
          </p>

          <div className="prospekt-qr-block" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${TEAL_LIGHT}40`, display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {qrOek2 && <img src={qrOek2} alt="" width={90} height={90} style={{ display: 'block', flexShrink: 0 }} />}
              <div style={{ fontSize: '0.8rem', color: '#1c1a18' }}>
                <strong style={{ color: TEAL_LIGHT }}>ök2 – Demo-Galerie</strong><br />
                <a href={buildQrUrlWithBust(OEK2_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: TEAL_LIGHT, wordBreak: 'break-all', fontSize: '0.75rem' }}>{OEK2_URL}</a><br />
                <span style={{ fontSize: '0.7rem', color: '#5c5650' }}>Eingangstor: <a href={buildQrUrlWithBust(OEK2_EINGANGSTOR_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: TEAL_LIGHT, wordBreak: 'break-all' }}>{OEK2_EINGANGSTOR_URL}</a></span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {qrVk2 && <img src={qrVk2} alt="" width={90} height={90} style={{ display: 'block', flexShrink: 0 }} />}
              <div style={{ fontSize: '0.8rem', color: '#1c1a18' }}>
                <strong style={{ color: TEAL_LIGHT }}>VK2 – Vereinsplattform</strong><br />
                <a href={buildQrUrlWithBust(VK2_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: TEAL_LIGHT, wordBreak: 'break-all', fontSize: '0.75rem' }}>{VK2_URL}</a>
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#5c5650', margin: '0.25rem 0 0', width: '100%' }}>
              QR und Links verweisen auf die aktuelle Version.
            </p>
          </div>

          <div className="prospekt-impressum" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: `1px solid ${TEAL_LIGHT}40`, fontSize: '0.75rem', color: '#5c5650', lineHeight: 1.35 }}>
            <strong style={{ color: '#1c1a18' }}>Impressum</strong><br />
            Medieninhaber &amp; Herausgeber: K2 Galerie · Design und Entwicklung: kgm solution (G. Kreinecker).<br />
            Kontakt: <a href={`mailto:${PRODUCT_LIZENZ_ANFRAGE_EMAIL}`} style={{ color: TEAL_LIGHT, textDecoration: 'none' }}>{PRODUCT_LIZENZ_ANFRAGE_EMAIL}</a><br />
            {PRODUCT_COPYRIGHT}
          </div>

          <footer className="prospekt-footer" style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: `1px solid ${TEAL_LIGHT}40`, fontSize: '0.75rem', color: '#5c5650' }}>
            K2 Galerie – Prospekt/Flyer · Stand März 2026
          </footer>
        </div>
      </div>
    </div>
  )
}
