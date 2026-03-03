/**
 * K2 Kunst und Keramik – Prospekt Galerieeröffnung (1 Seite).
 * Oben: Eventdaten aus K2-Events. Unten: nur K2-QR und K2-Link (kein ök2/VK2).
 */

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES, BASE_APP_URL } from '../config/navigation'
import { PRODUCT_COPYRIGHT, PRODUCT_LIZENZ_ANFRAGE_EMAIL, K2_STAMMDATEN_DEFAULTS } from '../config/tenantConfig'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { loadEvents } from '../utils/eventsStorage'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

/** Datum formatieren (YYYY-MM-DD → DD.MM.YYYY). */
function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

/** Ein Event-Datum oder Bereich (date + endDate) lesbar formatieren. */
function formatEventDate(date?: string, endDate?: string): string {
  if (!date) return ''
  const d = formatDate(date)
  if (!endDate || endDate === date) return d
  return `${d} – ${formatDate(endDate)}`
}

const printStyles = `
  @media print {
    .pge-no-print { display: none !important; }
    body { background: #fff !important; }
    .pge-wrap { background: #fffefb !important; color: #1c1a18 !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
    .pge-cover { background: #fffefb !important; color: #1c1a18 !important; border: none !important; padding: 8mm 14mm 6mm !important; }
    .pge-cover h1 { color: #0d9488 !important; font-size: 18pt !important; margin: 0 0 2mm !important; }
    .pge-body p { font-size: 10pt !important; line-height: 1.4 !important; margin: 2mm 0 !important; }
    .pge-qr-block img { width: 22mm !important; height: 22mm !important; }
    .pge-qr-block a { color: #1c1a18 !important; text-decoration: none !important; }
    .pge-impressum { font-size: 8pt !important; }
    .pge-impressum a { color: #5c5650 !important; text-decoration: none !important; }
    .pge-footer { position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; padding: 2mm 14mm !important; font-size: 8pt !important; color: #5c5650 !important; background: #fffefb !important; }
    .pge-footer .pge-footer-text { display: none !important; }
    .pge-footer::after { content: "Seite " counter(page); }
    @page { margin: 12mm 14mm 10mm 14mm; size: A4; }
  }
`

const K2_GALERIE_URL = BASE_APP_URL + '/projects/k2-galerie/galerie'

export default function ProspektGalerieeroeffnungPage() {
  const { versionTimestamp: qrVersionTs, refetch: refetchQrStand } = useQrVersionTimestamp()
  const [qrK2, setQrK2] = useState('')

  // Beim Öffnen der Seite sofort Server-Stand holen, damit der QR auf die aktuelle Version verweist (nicht alte BUILD_TIMESTAMP)
  useEffect(() => {
    refetchQrStand()
  }, [refetchQrStand])

  const gallery = typeof window !== 'undefined' ? loadStammdaten('k2', 'gallery') : (K2_STAMMDATEN_DEFAULTS.gallery as Record<string, string>)
  const martina = typeof window !== 'undefined' ? loadStammdaten('k2', 'martina') : (K2_STAMMDATEN_DEFAULTS.martina as Record<string, string>)
  const georg = typeof window !== 'undefined' ? loadStammdaten('k2', 'georg') : (K2_STAMMDATEN_DEFAULTS.georg as Record<string, string>)

  const k2Events = typeof window !== 'undefined' ? loadEvents('k2') : []
  const eventForProspekt = useMemo(() => {
    if (!Array.isArray(k2Events) || k2Events.length === 0) return null
    const withDate = k2Events.filter((e: any) => e && e.date)
    if (withDate.length === 0) return k2Events[0]
    withDate.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return withDate[0]
  }, [k2Events])

  const galleryName = (gallery?.name || 'K2 Kunst und Keramik').replace(/&/g, ' & ')
  const address = [gallery?.address, (gallery as any)?.city, (gallery as any)?.country].filter(Boolean).join(', ') || '–'
  const contactEmail = gallery?.email || martina?.email || georg?.email || PRODUCT_LIZENZ_ANFRAGE_EMAIL
  const contactPhone = gallery?.phone || martina?.phone || georg?.phone || ''
  const martinaName = martina?.name || 'Martina Kreinecker'
  const georgName = georg?.name || 'Georg Kreinecker'

  useEffect(() => {
    QRCode.toDataURL(buildQrUrlWithBust(K2_GALERIE_URL, qrVersionTs), { width: 110, margin: 1 })
      .then(setQrK2).catch(() => setQrK2(''))
  }, [qrVersionTs])

  const handleQrAktualisieren = () => {
    refetchQrStand()
  }

  return (
    <div className="pge-wrap" style={{ minHeight: '100vh', background: '#faf8f5', color: '#1c1a18' }}>
      <style>{printStyles}</style>

      <div className="pge-no-print" style={{ padding: '1rem 1.5rem', background: '#2a2a2a', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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
        <header className="pge-cover" style={{ padding: '1.5rem 0 1rem', marginBottom: '1rem', borderBottom: '2px solid #0d9488' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0d9488', margin: 0, letterSpacing: '-0.02em' }}>
            {galleryName} – Galerieeröffnung
          </h1>
          <p style={{ fontSize: '1rem', color: '#5c5650', margin: '0.5rem 0 0', fontWeight: 500 }}>
            {martinaName} und {georgName} laden ein
          </p>
          {eventForProspekt && (
            <>
              <p style={{ fontSize: '1.05rem', fontWeight: 600, color: '#1c1a18', marginTop: '1rem', marginBottom: '0.25rem' }}>
                {eventForProspekt.title || 'Galerieeröffnung'}
              </p>
              <p style={{ fontSize: '0.95rem', color: '#5c5650', margin: 0 }}>
                {formatEventDate(eventForProspekt.date, eventForProspekt.endDate)}
              </p>
              {eventForProspekt.description && (
                <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#1c1a18', marginTop: '0.5rem' }}>
                  {eventForProspekt.description}
                </p>
              )}
            </>
          )}
          {!eventForProspekt && (
            <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#1c1a18', marginTop: '1rem' }}>
              Kunst und Keramik – Malerei, Grafik, Skulptur. Wir freuen uns auf Ihren Besuch.
            </p>
          )}
          <p style={{ fontSize: '0.9rem', color: '#5c5650', marginTop: '0.75rem' }}>
            {address}
          </p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {contactEmail && <a href={`mailto:${contactEmail}`} style={{ color: '#0d9488', textDecoration: 'none' }}>{contactEmail}</a>}
            {contactPhone && <span> · {contactPhone}</span>}
          </p>
        </header>

        <div className="pge-body">
          {eventForProspekt && eventForProspekt.description && (
            <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
              Unsere Galerie verbindet Malerei, Grafik und Keramik unter einem Dach. Wir freuen uns auf Ihren Besuch.
            </p>
          )}
          {(!eventForProspekt || !eventForProspekt.description) && (
            <p style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
              Unsere Galerie verbindet Malerei, Grafik und Keramik unter einem Dach. Zur Eröffnung zeigen wir aktuelle Arbeiten – ein Ort für Begegnung und Kunst.
            </p>
          )}

          <div className="pge-qr-block" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e2dd', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            {qrK2 && <img src={qrK2} alt="" width={110} height={110} style={{ display: 'block', flexShrink: 0 }} />}
            <div style={{ fontSize: '0.85rem', color: '#1c1a18' }}>
              <strong style={{ color: '#0d9488' }}>K2 Galerie – Online</strong><br />
              <a href={buildQrUrlWithBust(K2_GALERIE_URL, qrVersionTs)} target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', wordBreak: 'break-all' }}>{K2_GALERIE_URL}</a>
              <p style={{ fontSize: '0.8rem', color: '#5c5650', margin: '0.35rem 0 0' }}>
                QR und Link verweisen auf die aktuelle Version. Nach neuem Veröffentlichen: diese Seite neu laden, dann drucken.
              </p>
            </div>
          </div>

          <div className="pge-impressum" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e5e2dd', fontSize: '0.8rem', color: '#5c5650', lineHeight: 1.4 }}>
            <strong style={{ color: '#1c1a18' }}>Impressum</strong><br />
            Medieninhaber &amp; Herausgeber: K2 Galerie · Design und Entwicklung: kgm solution (G. Kreinecker).<br />
            Kontakt: <a href={`mailto:${PRODUCT_LIZENZ_ANFRAGE_EMAIL}`} style={{ color: '#0d9488', textDecoration: 'none' }}>{PRODUCT_LIZENZ_ANFRAGE_EMAIL}</a><br />
            {PRODUCT_COPYRIGHT}
          </div>
        </div>

        <footer className="pge-footer" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e2dd', fontSize: '0.8rem', color: '#5c5650' }}>
          <span className="pge-footer-text">{galleryName} – Prospekt Galerieeröffnung · Stand März 2026</span>
        </footer>
      </div>
    </div>
  )
}
