/**
 * K2 Galerie – Präsentationsmappe (fertige Form).
 * Varianten: kombiniert (ök2+VK2), ök2 Kurz/Lang, VK2 Kurz/Lang, Vollversion. Eine Route, ?variant= (wie bei den anderen 4).
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES, BASE_APP_URL, BENUTZER_HANDBUCH_ROUTE } from '../config/navigation'
import PraesentationsmappeVollversionPage from './PraesentationsmappeVollversionPage'
import { PRODUCT_COPYRIGHT, PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_LIZENZ_ANFRAGE_EMAIL, PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2, MUSTER_TEXTE } from '../config/tenantConfig'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

type MappeVariant = 'oek2-kurz' | 'oek2-lang' | 'vk2-kurz' | 'vk2-lang'
const VALID_VARIANTS: MappeVariant[] = ['oek2-kurz', 'oek2-lang', 'vk2-kurz', 'vk2-lang']

const printStyles = `
  @media print {
    .pm-no-print { display: none !important; }
    body { background: #fff !important; }
    .pm-wrap { background: #fffefb !important; color: #1c1a18 !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
    .pm-deckblatt-willkommen { page-break-after: always !important; break-after: page !important; }
    .pm-deckblatt-willkommen .pm-willkommen-hero { background: #1a0f0a !important; color: #fff5ee !important; padding: 10mm 14mm !important; }
    .pm-deckblatt-willkommen .pm-willkommen-hero h1 { color: #fff5ee !important; }
    .pm-deckblatt-willkommen .pm-willkommen-hero p { color: #e8d5c0 !important; }
    .pm-deckblatt-willkommen .pm-willkommen-body { background: #fffefb !important; color: #1c1a18 !important; }
    .pm-deckblatt-willkommen .pm-willkommen-card { border-color: #0d9488 !important; }
    .pm-deckblatt-willkommen .pm-willkommen-cta { background: #0d9488 !important; color: #fff !important; }
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
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const variantParam = searchParams.get('variant')

  const { versionTimestamp: qrVersionTs, refetch: refetchQrStand } = useQrVersionTimestamp()
  const [qrOek2, setQrOek2] = useState('')
  const [qrVk2, setQrVk2] = useState('')

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

  if (variantParam === 'vollversion') {
    return <PraesentationsmappeVollversionPage />
  }

  const variant: MappeVariant | undefined = (variantParam && VALID_VARIANTS.includes(variantParam as MappeVariant) ? variantParam : undefined) as MappeVariant | undefined
  const isKurz = variant === 'oek2-kurz' || variant === 'vk2-kurz'
  const showOek2 = !variant || variant.startsWith('oek2')
  const showVk2 = !variant || variant.startsWith('vk2')
  const isVk2 = variant?.startsWith('vk2') ?? false
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo

  const handleQrAktualisieren = () => {
    refetchQrStand()
  }

  const leadOek2 = 'Für Künstler:innen und Galerien: eigene Galerie im Netz, Werke, Kassa, Events, Marketing aus einer Hand. Windows, Android, macOS, iOS · Browser & PWA.'
  const leadVk2 = 'Für Kunstvereine: gemeinsame Vereinsgalerie, Mitglieder, Events – ein Stand, eine Lizenz. Ab 10 Mitgliedern für den Verein kostenfrei. Browser & PWA.'

  return (
    <div className="pm-wrap" style={{ minHeight: '100vh', background: '#faf8f5', color: '#1c1a18' }}>
      <style>{printStyles}</style>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem', background: '#fffefb', color: '#1c1a18', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="pm-no-print" style={{ marginBottom: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #e5e2dd', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
          {returnTo ? (
            <Link to={returnTo} style={{ color: '#0d9488', textDecoration: 'none', fontWeight: 500 }}>
              ← Zurück
            </Link>
          ) : (
            <button type="button" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 500, cursor: 'pointer', padding: 0 }}>
              ← Zurück
            </button>
          )}
          <span style={{ color: '#5c5650' }}>Varianten:</span>
          <Link to={PROJECT_ROUTES['k2-galerie'].praesentationsmappe} style={{ color: !variant ? '#0d9488' : '#1c1a18', textDecoration: 'none', fontWeight: !variant ? 600 : 400 }}>Kombiniert</Link>
          <Link to={PROJECT_ROUTES['k2-galerie'].praesentationsmappeOek2Kurz} style={{ color: variant === 'oek2-kurz' ? '#0d9488' : '#1c1a18', textDecoration: 'none', fontWeight: variant === 'oek2-kurz' ? 600 : 400 }}>ök2 Kurz</Link>
          <Link to={PROJECT_ROUTES['k2-galerie'].praesentationsmappeOek2Lang} style={{ color: variant === 'oek2-lang' ? '#0d9488' : '#1c1a18', textDecoration: 'none', fontWeight: variant === 'oek2-lang' ? 600 : 400 }}>ök2 Lang</Link>
          <Link to={PROJECT_ROUTES['k2-galerie'].praesentationsmappeVk2Kurz} style={{ color: variant === 'vk2-kurz' ? '#0d9488' : '#1c1a18', textDecoration: 'none', fontWeight: variant === 'vk2-kurz' ? 600 : 400 }}>VK2 Kurz</Link>
          <Link to={PROJECT_ROUTES['k2-galerie'].praesentationsmappeVk2Lang} style={{ color: variant === 'vk2-lang' ? '#0d9488' : '#1c1a18', textDecoration: 'none', fontWeight: variant === 'vk2-lang' ? 600 : 400 }}>VK2 Lang</Link>
          <Link to={PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion} style={{ color: variantParam === 'vollversion' ? '#0d9488' : '#1c1a18', textDecoration: 'none', fontWeight: variantParam === 'vollversion' ? 600 : 400 }}>Vollversion</Link>
          <button type="button" onClick={handleQrAktualisieren} style={{ padding: '0.4rem 0.75rem', background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
            QR aktualisieren
          </button>
          <button type="button" onClick={() => window.print()} style={{ padding: '0.4rem 0.75rem', background: '#0d9488', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
            Als PDF drucken
          </button>
          <Link to={BENUTZER_HANDBUCH_ROUTE} style={{ padding: '0.4rem 0.75rem', background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>
            Benutzerhandbuch
          </Link>
        </div>
        {/* Deckblatt: Willkommensseite der App – redigierte Druckversion */}
        <div className="pm-deckblatt-willkommen" style={{ marginBottom: '2rem', border: '1px solid #e5e2dd', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p className="pm-no-print" style={{ margin: 0, padding: '0.5rem 1rem', background: '#f0fdfa', fontSize: '0.8rem', color: '#0d9488', fontWeight: 600 }}>
            Deckblatt – So sieht die Willkommensseite der App aus (Druckversion)
          </p>
          <div className="pm-willkommen-hero" style={{ background: 'linear-gradient(160deg, #1a0f0a 0%, #2d1a14 60%, rgba(181,74,30,0.25) 100%)', padding: 'clamp(1.5rem, 4vw, 2.5rem) 1.5rem', textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,140,66,0.95)', fontWeight: 600 }}>
              Jetzt kostenlos ausprobieren
            </p>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 700, color: '#fff5ee', margin: 0, letterSpacing: '-0.02em' }}>
              K2 Galerie
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#d4a574', lineHeight: 1.5, margin: '0.5rem 0 0', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
              {PRODUCT_WERBESLOGAN}
            </p>
          </div>
          <div className="pm-willkommen-body" style={{ padding: '1.25rem 1.5rem', background: '#f6f0e8' }}>
            <div className="pm-willkommen-card" style={{ background: '#fffefb', border: '2px solid #0d9488', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 4px 16px rgba(13,148,136,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(13,148,136,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>✏️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1c1a18' }}>Meine Galerie ausprobieren</div>
                  <div style={{ fontSize: '0.8rem', color: '#5c5650' }}>Name eingeben – sofort deine Galerie sehen</div>
                </div>
              </div>
              <div style={{ padding: '0.6rem 0.75rem', border: '1px solid #e5e2dd', borderRadius: '8px', fontSize: '0.9rem', color: '#5c5650', marginBottom: '0.75rem', background: '#fff' }}>
                Dein Künstler- oder Galeriename
              </div>
              <div className="pm-willkommen-cta" style={{ padding: '0.75rem 1rem', background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', color: '#fff', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', textAlign: 'center' }}>
                Galerie starten →
              </div>
            </div>
            <p style={{ textAlign: 'center', margin: 0, fontSize: '0.8rem', color: '#5c5650' }}>
              Nur Galerie ansehen · In 1 Min. entdecken
            </p>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem', color: '#5c5650', lineHeight: 1.6 }}>
              Handbuch · AGB · {PRODUCT_COPYRIGHT}
            </p>
          </div>
        </div>

        <header className="pm-cover" style={{ padding: '1.5rem 0 1rem', marginBottom: '1rem', borderBottom: '2px solid #0d9488' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0d9488', margin: 0, letterSpacing: '-0.02em' }}>
            K2 Galerie
          </h1>
          <p className="pm-tagline" style={{ fontSize: '0.95rem', color: '#5c5650', margin: '0.25rem 0 0', fontWeight: 500 }}>
            {PRODUCT_WERBESLOGAN}
          </p>
          <p className="pm-tagline" style={{ fontSize: '0.95rem', color: '#5c5650', margin: '0.15rem 0 0', fontWeight: 500 }}>
            {PRODUCT_WERBESLOGAN_2}
          </p>
          <p className="pm-lead" style={{ fontSize: '0.9rem', lineHeight: 1.45, color: '#1c1a18', marginTop: '0.75rem', maxWidth: '520px' }}>
            {isVk2 ? leadVk2 : variant ? leadOek2 : 'Für Ateliers, Galerien und Kunstvereine. Windows, Android, macOS, iOS · Browser & PWA. Lizenzen: Basic, Pro, Pro+, VK2.'}
          </p>
        </header>

        {!isKurz && (
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
        </div>
        )}

        {/* Links & QR-Codes – je nach Variante ök2 und/oder VK2 */}
        <div className="pm-qr-block" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e2dd', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-start' }}>
          {showOek2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {qrOek2 && <img src={qrOek2} alt="" width={110} height={110} style={{ display: 'block', flexShrink: 0 }} />}
              <div style={{ fontSize: '0.85rem', color: '#1c1a18' }}>
                <strong style={{ color: '#0d9488' }}>ök2 – Demo-Galerie</strong><br />
                <a href={buildQrUrlWithBust(OEK2_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', wordBreak: 'break-all' }}>{OEK2_URL}</a><br />
                <span style={{ fontSize: '0.8rem', color: '#5c5650' }}>Willkommen &amp; Lizenz: <a href={buildQrUrlWithBust(OEK2_WILLKOMMEN_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', wordBreak: 'break-all' }}>{OEK2_WILLKOMMEN_URL}</a></span>
              </div>
            </div>
          )}
          {showVk2 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {qrVk2 && <img src={qrVk2} alt="" width={110} height={110} style={{ display: 'block', flexShrink: 0 }} />}
              <div style={{ fontSize: '0.85rem', color: '#1c1a18' }}>
                <strong style={{ color: '#0d9488' }}>VK2 – Vereinsplattform</strong><br />
                <a href={buildQrUrlWithBust(VK2_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', wordBreak: 'break-all' }}>{VK2_URL}</a>
              </div>
            </div>
          )}
          <p style={{ fontSize: '0.8rem', color: '#5c5650', margin: '0.5rem 0 0', width: '100%' }}>
            QR und Links verweisen auf die aktuelle Version.
          </p>
        </div>

        <div className="pm-impressum" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e5e2dd', fontSize: '0.8rem', color: '#5c5650', lineHeight: 1.4 }}>
          <strong style={{ color: '#1c1a18' }}>Impressum</strong><br />
          {(variant === 'oek2-kurz' || variant === 'oek2-lang' || variant === 'vk2-kurz' || variant === 'vk2-lang') ? (
            <>
              Medieninhaber: K2 Galerie{variant?.startsWith('oek2') ? ' · Demo (ök2)' : ' · Vereinsplattform (VK2)'} – nur Mustertexte, keine K2-Daten.<br />
              Kontakt: <a href={`mailto:${MUSTER_TEXTE.gallery.email}`} style={{ color: '#0d9488', textDecoration: 'none' }}>{MUSTER_TEXTE.gallery.email}</a><br />
              {PRODUCT_COPYRIGHT_BRAND_ONLY}
            </>
          ) : (
            <>
              Medieninhaber &amp; Herausgeber: K2 Galerie · Design und Entwicklung: kgm solution (G. Kreinecker).<br />
              Kontakt: <a href={`mailto:${PRODUCT_LIZENZ_ANFRAGE_EMAIL}`} style={{ color: '#0d9488', textDecoration: 'none' }}>{PRODUCT_LIZENZ_ANFRAGE_EMAIL}</a><br />
              {PRODUCT_COPYRIGHT}
            </>
          )}
        </div>

        <footer className="pm-footer" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e2dd', fontSize: '0.8rem', color: '#5c5650' }}>
          <span className="pm-footer-text">K2 Galerie – Prospekt · Stand März 2026</span>
        </footer>
      </div>
    </div>
  )
}
