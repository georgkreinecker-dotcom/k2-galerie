/**
 * K2 Galerie – Präsentationsmappe (kombinierte Kurzform).
 * Einziges Erscheinungsbild: Teal/Weiß (Vorbild für alle weiteren Drucksorten).
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { BASE_APP_URL, BENUTZER_HANDBUCH_ROUTE, OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import {
  PRODUCT_COPYRIGHT,
  PRODUCT_LIZENZ_ANFRAGE_EMAIL,
  PRODUCT_WERBESLOGAN,
  PRODUCT_WERBESLOGAN_2,
  K2_STAMMDATEN_DEFAULTS,
  MUSTER_TEXTE,
  TENANT_CONFIGS,
} from '../config/tenantConfig'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import { useWerbemittelPrintContext } from '../hooks/useWerbemittelPrintContext'

const TEAL = '#0f766e'
const TEAL_DARK = '#0c5c55' /* kräftiger Brand-Bereich (Druck + Bildschirm) */
const TEAL_LIGHT = '#0d9488'

const printStyles = `
  @media print {
    .pm-no-print { display: none !important; }
    body { background: #fff !important; }
    .pm-wrap { background: #fff !important; color: #1c1a18 !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
    /* Eine A4-Seite: kein Seitenumbruch, kompakte Abstände */
    .pm-wrap > div { max-width: none !important; padding: 8mm 12mm !important; box-shadow: none !important; }
    .pm-teal-cover { background: #0c5c55 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color: #fff !important; padding: 6mm 10mm !important; border-radius: 0 !important; margin-bottom: 5mm !important; page-break-inside: avoid !important; }
    .pm-teal-cover h1 { font-size: 18pt !important; margin: 0 !important; color: #fff !important; font-weight: 700 !important; }
    .pm-teal-cover .pm-slogan { font-size: 10pt !important; margin: 2mm 0 0 !important; line-height: 1.25 !important; color: #fff !important; font-weight: 600 !important; }
    .pm-teal-cover .pm-tagline { font-size: 9pt !important; margin: 1mm 0 0 !important; color: #fff !important; }
    .pm-teal-cover .pm-copy { font-size: 7pt !important; margin: 3mm 0 0 !important; color: #fff !important; }
    .pm-body { color: #1c1a18 !important; font-size: 9pt !important; line-height: 1.35 !important; margin-bottom: 4mm !important; }
    .pm-body p { margin: 0 !important; }
    .pm-body h2 { color: ${TEAL} !important; font-weight: 700 !important; }
    .pm-qr-block { margin-top: 4mm !important; padding-top: 4mm !important; gap: 6mm !important; }
    .pm-qr-block img { width: 18mm !important; height: 18mm !important; }
    .pm-qr-block > div { font-size: 7pt !important; }
    .pm-impressum { margin-top: 4mm !important; padding-top: 4mm !important; font-size: 6pt !important; color: #5c5650 !important; line-height: 1.3 !important; }
    .pm-footer { position: static !important; margin-top: 3mm !important; padding-top: 3mm !important; font-size: 6pt !important; color: #5c5650 !important; background: transparent !important; }
    .pm-footer .pm-footer-text { display: none !important; }
    .pm-footer::after { content: "Seite " counter(page); }
    @page { margin: 10mm 12mm 10mm 12mm; size: A4; }
  }
`

const OEK2_URL = BASE_APP_URL + '/projects/k2-galerie/galerie-oeffentlich'
const OEK2_EINGANGSTOR_URL = BASE_APP_URL + OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE
const VK2_URL = BASE_APP_URL + '/projects/vk2'

export default function PraesentationsmappePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const isVk2Variante = searchParams.get('variant') === 'vk2'
  const view = (searchParams.get('view') || '').trim().toLowerCase()
  const printCtx = useWerbemittelPrintContext()
  const isOeffentlich = printCtx === 'oeffentlich'

  const { versionTimestamp: qrVersionTs, refetch: refetchQrStand } = useQrVersionTimestamp()
  const [qrOek2, setQrOek2] = useState('')
  const [qrVk2, setQrVk2] = useState('')

  // Standard-Link soll Langversion öffnen. Kurzvariante bleibt erreichbar über ?view=kurz (und optional variant/context).
  useEffect(() => {
    if (view === 'kurz') return
    const next = new URLSearchParams(location.search)
    // view-Param entfernen (falls leer/anders), damit URL sauber bleibt
    next.delete('view')
    const target = PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion
    const qs = next.toString()
    navigate(qs ? `${target}?${qs}` : target, { replace: true, state: location.state })
  }, [navigate, location.search, location.state, view])

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

  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo
  const leadText = isVk2Variante
    ? 'VK2 bündelt Vereinsalltag in einer Oberfläche – klarer Ablauf, keine doppelte Pflege.'
    : 'Die K2-Galerie-Software bündelt Galerie, Verkauf und Außenauftritt in einer Oberfläche – skalierbar über „Mein Weg“ und die Sparten, überall im Browser und als PWA.'

  const gallery = typeof window !== 'undefined'
    ? (loadStammdaten(isOeffentlich ? 'oeffentlich' : 'k2', 'gallery') as unknown as Record<string, string>)
    : (isOeffentlich ? MUSTER_TEXTE.gallery : K2_STAMMDATEN_DEFAULTS.gallery) as unknown as Record<string, string>
  /** K2 (nicht ök2): Deckblatt nur „K2“ – ohne Zusatz aus Galeriename. */
  const coverTitle = isVk2Variante
    ? 'VK2 Vereinsplattform'
    : isOeffentlich
    ? (gallery?.name || TENANT_CONFIGS.oeffentlich.galleryName).replace(/&/g, ' & ')
    : 'K2'
  const badgeText = isVk2Variante ? 'Kurzversion (VK2)' : 'Kurzversion'

  return (
    <div className="pm-wrap" style={{ minHeight: '100vh', background: '#faf8f5', color: '#1c1a18' }}>
      <style>{printStyles}</style>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.5rem', background: '#fffefb', color: '#1c1a18', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="pm-no-print" style={{ marginBottom: '1rem', padding: '0.75rem 0', borderBottom: `1px solid ${TEAL_LIGHT}40`, display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
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

        {/* Deckblatt im Erscheinungsbild Teal/Weiß (Vorbild für alle Drucksorten) */}
        <div className="pm-teal-cover" style={{ background: TEAL_DARK, color: '#fff', padding: 'clamp(2rem, 5vw, 3rem) 1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <span style={{ padding: '0.25rem 0.55rem', borderRadius: '999px', background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)', fontSize: '0.78rem', fontWeight: 700 }}>
              {badgeText}
            </span>
            <Link
              to={{
                pathname: PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion,
                search: location.search.replace(/(^\?|&)view=kurz(&|$)/, '$1').replace(/\?&/, '?').replace(/\?$/, ''),
              }}
              state={location.state}
              style={{ color: '#fff', textDecoration: 'underline', fontSize: '0.85rem', fontWeight: 700 }}
            >
              Zur Vollversion →
            </Link>
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            {coverTitle}
          </h1>
          <p className="pm-slogan" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', fontWeight: 600, color: '#fff', margin: '0.75rem 0 0', lineHeight: 1.4 }}>
            {PRODUCT_WERBESLOGAN}
          </p>
          <p className="pm-tagline" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)', color: 'rgba(255,255,255,0.95)', margin: '0.5rem 0 0', lineHeight: 1.5 }}>
            {PRODUCT_WERBESLOGAN_2}
          </p>
          <p className="pm-copy" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', margin: '1.5rem 0 0' }}>
            © kgm solution
          </p>
        </div>

        <div className="pm-body">
          <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1c1a18', margin: '0 0 1rem' }}>
            {leadText}
          </p>
          {isVk2Variante ? (
            <>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: TEAL_LIGHT, margin: '1.25rem 0 0.5rem' }}>
                1. Mitglieder & Vereinsprofil
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1c1a18', margin: '0 0 1rem' }}>
                <strong>USP:</strong> Einheitliche Erfassung, klare Vereinsansicht – Daten strikt im VK2-Kontext, getrennt von der K2-Galerie-Welt.
              </p>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: TEAL_LIGHT, margin: '1.25rem 0 0.5rem' }}>
                2. Galerie & Sichtbarkeit
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1c1a18', margin: '0 0 1rem' }}>
                <strong>USP:</strong> Arbeiten und Vereinsseite professionell zeigen – ein Auftritt, ein Ablauf.
              </p>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: TEAL_LIGHT, margin: '1.25rem 0 0.5rem' }}>
                3. Kassa & Verkauf
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1c1a18', margin: '0 0 1rem' }}>
                <strong>USP:</strong> Verkauf, Belege und Listen im selben Standard – nachvollziehbar statt Insellösungen.
              </p>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: TEAL_LIGHT, margin: '1.25rem 0 0.5rem' }}>
                4. Events & Medien
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1c1a18', margin: '0 0 1rem' }}>
                <strong>USP:</strong> Aus einem Termin werden Einladung, Presse und Social – ohne dieselben Daten mehrfach einzutippen.
              </p>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: TEAL_LIGHT, margin: '1.25rem 0 0.5rem' }}>
                5. Lizenz & Betrieb
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1c1a18', margin: '0 0 1rem' }}>
                <strong>USP:</strong> VK2 als eigene Lizenzstufe – fairer Einstieg, verlässlicher laufender Betrieb für den Verein.
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: TEAL_LIGHT, margin: '1.25rem 0 0.5rem' }}>
                1. Admin &amp; Hub
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1c1a18', margin: '0 0 1rem' }}>
                <strong>USP:</strong> Eine zentrale Oberfläche für Werke, Gestaltung, Kassa und Marketing – weniger Springen, mehr Arbeit in einem Fluss.
              </p>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: TEAL_LIGHT, margin: '1.25rem 0 0.5rem' }}>
                2. Werke &amp; Galerie
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1c1a18', margin: '0 0 1rem' }}>
                <strong>USP:</strong> Erfassen, kategorisieren, Etikett und Werkkatalog – Besucher sehen sofort einen professionellen Auftritt.
              </p>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: TEAL_LIGHT, margin: '1.25rem 0 0.5rem' }}>
                3. Design &amp; Veröffentlichen
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1c1a18', margin: '0 0 1rem' }}>
                <strong>USP:</strong> Willkommen und Galerie gestalten, dann veröffentlichen – ein gemeinsamer Stand für Mac, Handy und Web.
              </p>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: TEAL_LIGHT, margin: '1.25rem 0 0.5rem' }}>
                4. Kassa &amp; Shop
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1c1a18', margin: '0 0 1rem' }}>
                <strong>USP:</strong> Verkauf vor Ort mit Belegen; Besucher bestellen aus der Galerie – ohne automatische Online-Abbuchung in der App, dafür klar und nachvollziehbar.
              </p>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: TEAL_LIGHT, margin: '1.25rem 0 0.5rem' }}>
                5. Events &amp; Öffentlichkeit
              </h2>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1c1a18', margin: '0 0 1rem' }}>
                <strong>USP:</strong> Termin und Stammdaten einmal pflegen – Flyer, Presse und Kanäle aus derselben Quelle, ohne Doppelarbeit.
              </p>
            </>
          )}
        </div>

        <div className="pm-qr-block" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${TEAL_LIGHT}40`, display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-start' }}>
          {!isVk2Variante && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {qrOek2 && <img src={qrOek2} alt="" width={110} height={110} style={{ display: 'block', flexShrink: 0 }} />}
              <div style={{ fontSize: '0.85rem', color: '#1c1a18' }}>
                <strong style={{ color: TEAL_LIGHT }}>ök2 – Demo-Galerie</strong><br />
                <a href={buildQrUrlWithBust(OEK2_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: TEAL_LIGHT, wordBreak: 'break-all' }}>{OEK2_URL}</a><br />
                <span style={{ fontSize: '0.8rem', color: '#5c5650' }}>Eingangstor: <a href={buildQrUrlWithBust(OEK2_EINGANGSTOR_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: TEAL_LIGHT, wordBreak: 'break-all' }}>{OEK2_EINGANGSTOR_URL}</a></span>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {qrVk2 && <img src={qrVk2} alt="" width={110} height={110} style={{ display: 'block', flexShrink: 0 }} />}
            <div style={{ fontSize: '0.85rem', color: '#1c1a18' }}>
              <strong style={{ color: TEAL_LIGHT }}>VK2 – Vereinsplattform</strong><br />
              <a href={buildQrUrlWithBust(VK2_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: TEAL_LIGHT, wordBreak: 'break-all' }}>{VK2_URL}</a>
            </div>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#5c5650', margin: '0.5rem 0 0', width: '100%' }}>
            QR und Links verweisen auf die aktuelle Version.
          </p>
        </div>

        <div className="pm-impressum" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: `1px solid ${TEAL_LIGHT}40`, fontSize: '0.8rem', color: '#5c5650', lineHeight: 1.4 }}>
          <strong style={{ color: '#1c1a18' }}>Impressum</strong><br />
          {isOeffentlich ? (
            <>
              Medieninhaber: K2 Galerie · Demo (ök2) – nur Mustertexte, keine K2-Daten.<br />
              Kontakt:{' '}
              <a href={`mailto:${MUSTER_TEXTE.gallery.email}`} style={{ color: TEAL_LIGHT, textDecoration: 'none' }}>
                {MUSTER_TEXTE.gallery.email}
              </a>
              <br />
              {PRODUCT_COPYRIGHT}
            </>
          ) : (
            <>
              Medieninhaber &amp; Herausgeber: K2 Galerie · Design und Entwicklung: kgm solution (G. Kreinecker).<br />
              Kontakt:{' '}
              <a href={`mailto:${PRODUCT_LIZENZ_ANFRAGE_EMAIL}`} style={{ color: TEAL_LIGHT, textDecoration: 'none' }}>
                {PRODUCT_LIZENZ_ANFRAGE_EMAIL}
              </a>
              <br />
              {PRODUCT_COPYRIGHT}
            </>
          )}
        </div>

        <footer className="pm-footer" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: `1px solid ${TEAL_LIGHT}40`, fontSize: '0.8rem', color: '#5c5650' }}>
          <span className="pm-footer-text">K2 Galerie – Präsentationsmappe · Stand März 2026</span>
        </footer>
      </div>
    </div>
  )
}
