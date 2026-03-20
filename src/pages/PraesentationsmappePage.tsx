/**
 * K2 Galerie – Präsentationsmappe (kombinierte Kurzform).
 * Einziges Erscheinungsbild: Teal/Weiß (Vorbild für alle weiteren Drucksorten).
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { BASE_APP_URL, BENUTZER_HANDBUCH_ROUTE } from '../config/navigation'
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
const OEK2_WILLKOMMEN_URL = BASE_APP_URL + '/willkommen'
const VK2_URL = BASE_APP_URL + '/projects/vk2'

export default function PraesentationsmappePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const printCtx = useWerbemittelPrintContext()
  const isOeffentlich = printCtx === 'oeffentlich'

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

  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo
  const leadText = 'Für die Kunst gedacht, für den Markt gemacht. Ateliers, Galerien, Kunstvereine. Windows, Android, macOS, iOS · Browser & PWA. Lizenzen: Basic, Pro, Pro+, Pro++, VK2.'

  const gallery = typeof window !== 'undefined'
    ? (loadStammdaten(isOeffentlich ? 'oeffentlich' : 'k2', 'gallery') as Record<string, string>)
    : (isOeffentlich ? MUSTER_TEXTE.gallery : K2_STAMMDATEN_DEFAULTS.gallery) as Record<string, string>
  const coverTitle = isOeffentlich
    ? (gallery?.name || TENANT_CONFIGS.oeffentlich.galleryName).replace(/&/g, ' & ')
    : (gallery?.name || K2_STAMMDATEN_DEFAULTS.gallery.name || 'K2 Galerie').replace(/&/g, ' & ')

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
        </div>

        <div className="pm-qr-block" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${TEAL_LIGHT}40`, display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {qrOek2 && <img src={qrOek2} alt="" width={110} height={110} style={{ display: 'block', flexShrink: 0 }} />}
            <div style={{ fontSize: '0.85rem', color: '#1c1a18' }}>
              <strong style={{ color: TEAL_LIGHT }}>ök2 – Demo-Galerie</strong><br />
              <a href={buildQrUrlWithBust(OEK2_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: TEAL_LIGHT, wordBreak: 'break-all' }}>{OEK2_URL}</a><br />
              <span style={{ fontSize: '0.8rem', color: '#5c5650' }}>Willkommen: <a href={buildQrUrlWithBust(OEK2_WILLKOMMEN_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: TEAL_LIGHT, wordBreak: 'break-all' }}>{OEK2_WILLKOMMEN_URL}</a></span>
            </div>
          </div>
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
