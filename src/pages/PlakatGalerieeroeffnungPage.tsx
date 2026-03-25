import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { BASE_APP_URL, PROJECT_ROUTES } from '../config/navigation'
import { K2_STAMMDATEN_DEFAULTS, MUSTER_TEXTE, PRODUCT_COPYRIGHT } from '../config/tenantConfig'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { loadEvents } from '../utils/eventsStorage'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import { useWerbemittelPrintContext } from '../hooks/useWerbemittelPrintContext'
import { getPlakatPosterPrintCss, PLAKAT_PDF_ACCENT_FALLBACK } from '../config/marketingWerbelinie'

function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

function formatEventDateRange(date?: string, endDate?: string): string {
  if (!date) return ''
  const start = formatDate(date)
  const end = endDate && endDate !== date ? formatDate(endDate) : ''
  return end ? `${start} – ${end}` : start
}

const screenStyles = `
  .plakat-wrap {
    min-height: 100vh;
    background: #faf8f5;
    color: #1c1a18;
    padding: 1.25rem;
  }
  .plakat-topbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }
  .plakat-topbar a, .plakat-topbar button {
    font-size: 0.9rem;
  }
  .plakat-topbar button {
    padding: 0.45rem 0.85rem;
    background: ${PLAKAT_PDF_ACCENT_FALLBACK};
    color: #fff;
    border: none;
    border-radius: 10px;
    font-weight: 650;
    cursor: pointer;
  }
  .plakat-topbar button.secondary {
    background: rgba(0,0,0,0.06);
    color: #1c1a18;
    border: 1px solid rgba(28,26,24,0.12);
    font-weight: 600;
  }
  .plakat-stage {
    width: min(100%, 760px);
    margin: 0 auto;
  }
  .plakat {
    background: #fffefb;
    border: 1px solid rgba(28, 26, 24, 0.12);
    border-radius: 16px;
    padding: 1.5rem 1.5rem 1.25rem;
    box-shadow: 0 12px 40px rgba(28, 26, 24, 0.08);
  }
  .plakat h1 {
    margin: 0 0 0.75rem;
    font-size: 3.2rem;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--k2-plakat-pdf-accent, ${PLAKAT_PDF_ACCENT_FALLBACK});
  }
  .plakat > h1 + p {
    margin: 0 0 1.25rem;
    font-size: 1.25rem;
    color: #5c5650;
  }
  .plakat .event-info {
    margin: 1.25rem 0 1.5rem;
    font-size: 1.15rem;
    line-height: 1.55;
    color: #1c1a18;
  }
  .plakat .event-info strong {
    display: block;
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
    color: #1c1a18;
  }
  .plakat .qr-code {
    margin: 1.5rem 0 1.5rem;
    padding: 1rem;
    background: #f5f3ef;
    border-radius: 14px;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .plakat .qr-code img { width: 160px; height: 160px; border-radius: 8px; background: #fff; }
  .plakat .qr-code p { margin: 0; color: #5c5650; font-size: 0.95rem; }
  .plakat .contact {
    border-top: 1px solid rgba(28, 26, 24, 0.12);
    padding-top: 1rem;
    color: #5c5650;
    font-size: 0.95rem;
    line-height: 1.45;
  }
  .plakat .contact strong { color: #1c1a18; display: block; margin-bottom: 0.25rem; }
`

const printStyles = `
  ${getPlakatPosterPrintCss()}
  @media print {
    @page { size: A3; margin: 10mm; }
    .plakat-wrap { padding: 0 !important; background: #fff !important; }
    .plakat-topbar { display: none !important; }
    .plakat-stage { width: 100% !important; margin: 0 !important; }
  }
`

export default function PlakatGalerieeroeffnungPage() {
  const tenant = useWerbemittelPrintContext()
  const isOeffentlich = tenant === 'oeffentlich'
  const { versionTimestamp: qrVersionTs, refetch: refetchQrStand } = useQrVersionTimestamp()
  const [qrDataUrl, setQrDataUrl] = useState('')

  const gallery = typeof window !== 'undefined'
    ? (loadStammdaten(isOeffentlich ? 'oeffentlich' : 'k2', 'gallery') as any)
    : (isOeffentlich ? MUSTER_TEXTE.gallery : K2_STAMMDATEN_DEFAULTS.gallery)

  const eventsList = typeof window !== 'undefined' ? loadEvents(isOeffentlich ? 'oeffentlich' : 'k2') : []
  const eventForPlakat = useMemo(() => {
    if (!Array.isArray(eventsList) || eventsList.length === 0) return null
    const isEroeffnung = eventsList.filter((e: any) => e && e.type === 'galerieeröffnung' && e.date)
    if (isEroeffnung.length > 0) {
      isEroeffnung.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      return isEroeffnung[0]
    }
    const withDate = eventsList.filter((e: any) => e && e.date)
    if (withDate.length === 0) return eventsList[0]
    withDate.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return withDate[0]
  }, [eventsList])

  const defaultName = isOeffentlich ? 'Galerie Muster' : 'K2 Kunst und Keramik'
  const galleryName = String((gallery?.name || defaultName) ?? defaultName).replace(/&/g, ' & ')

  const address = [gallery?.address, gallery?.city, gallery?.country].filter(Boolean).join(', ') || (isOeffentlich ? 'Musterstraße 1, 12345 Musterstadt' : '–')
  const email = (gallery?.email && String(gallery.email).trim()) || (isOeffentlich ? MUSTER_TEXTE.gallery.email : '')
  const phone = (gallery?.phone && String(gallery.phone).trim()) || ''

  const titel = eventForPlakat?.title || `${galleryName} – Galerieeröffnung`
  const datum = formatEventDateRange(eventForPlakat?.date, eventForPlakat?.endDate) || 'Datum folgt'
  const ort = eventForPlakat?.location || address
  const kurztext =
    (eventForPlakat?.type === 'galerieeröffnung'
      ? 'Kunst & Keramik · Ausstellung Martina & Georg\nGemeinsame Lounge: Plattform (K2 · ök2 · VK2) entdecken.'
      : (eventForPlakat?.description || '')).trim()

  const galerieUrl = BASE_APP_URL + (isOeffentlich ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau : PROJECT_ROUTES['k2-galerie'].galerie)
  const qrUrl = buildQrUrlWithBust(galerieUrl, qrVersionTs)

  useEffect(() => {
    QRCode.toDataURL(qrUrl, { width: 220, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''))
  }, [qrUrl])

  return (
    <div className="plakat-wrap" style={{ ['--k2-plakat-pdf-accent' as any]: PLAKAT_PDF_ACCENT_FALLBACK }}>
      <style>{screenStyles}</style>
      <style>{printStyles}</style>

      <div className="plakat-topbar">
        <Link to={PROJECT_ROUTES['k2-galerie'].werbeunterlagen} style={{ color: '#1c1a18', textDecoration: 'none' }}>
          ← Zurück zu Werbeunterlagen
        </Link>
        <button type="button" className="secondary" onClick={() => refetchQrStand()}>
          QR aktualisieren
        </button>
        <button type="button" onClick={() => window.print()}>
          Als PDF drucken (A3)
        </button>
      </div>

      <div className="plakat-stage">
        <div className="plakat" role="document" aria-label="Plakat Galerieeröffnung">
          <h1>{titel}</h1>
          <p>{galleryName}</p>

          <div className="event-info">
            <strong>{datum}</strong>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{ort}</p>
            {kurztext && (
              <p style={{ marginTop: '1.25rem', marginBottom: 0, whiteSpace: 'pre-wrap', color: '#1c1a18' }}>
                {kurztext}
              </p>
            )}
          </div>

          <div className="qr-code">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR-Code zur Online-Galerie" />
            ) : (
              <div style={{ width: 160, height: 160, borderRadius: 8, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5c5650', fontSize: '0.9rem' }}>
                QR wird geladen…
              </div>
            )}
            <div style={{ minWidth: 240, flex: 1 }}>
              <p style={{ fontWeight: 700, color: '#1c1a18' }}>{isOeffentlich ? 'ök2 Demo – Online' : 'K2 Galerie – Online'}</p>
              <p style={{ wordBreak: 'break-all' }}>{galerieUrl}</p>
              <p style={{ marginTop: '0.65rem', fontSize: '0.85rem' }}>
                QR und Link verweisen auf den aktuellen Stand. Vor dem Druck: Seite neu laden oder „QR aktualisieren“.
              </p>
            </div>
          </div>

          <div className="contact">
            <strong>Kontakt</strong>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {address && <div>{address}</div>}
              {phone && <div>{phone}</div>}
              {email && <div>{email}</div>}
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#5c5650' }}>
              {PRODUCT_COPYRIGHT}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

