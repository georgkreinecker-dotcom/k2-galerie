/**
 * Vierer-Bogen A4: doppelseitig drucken, 4 gleiche Flyer pro Seite.
 * Vorderseite: K2 Galerie (Stammdaten/Termin wie Flyer K2).
 * Rückseite: ök2 Eingangstor (/entdecken) – nur Demo-Einstieg + QR, keine K2-Stammdaten.
 */
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { BASE_APP_URL, OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE } from '../config/navigation'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import { useWerbemittelPrintContext } from '../hooks/useWerbemittelPrintContext'
import { getGalerieImages } from '../config/pageContentGalerie'
import { getPageTexts } from '../config/pageTexts'
import {
  K2_STAMMDATEN_DEFAULTS,
  MUSTER_TEXTE,
  PRODUCT_BRAND_NAME,
  PRODUCT_COPYRIGHT_BRAND_ONLY,
  PRODUCT_URHEBER_ANWENDUNG,
  PRODUCT_WERBESLOGAN,
  PRODUCT_WERBESLOGAN_2,
} from '../config/tenantConfig'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { loadEvents } from '../utils/eventsStorage'

const ROOT = 'flyer-k2-oek2-vierer'
const TEAL_DARK = '#0c5c55'
const TEAL = '#0f766e'
const ROW_MM = 297 / 4

const styles = `
  .${ROOT} { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #e8e6e2; padding: 16px; margin: 0; box-sizing: border-box; min-height: 100vh; }
  .${ROOT} * { box-sizing: border-box; }
  .${ROOT} .hint-screen { max-width: 720px; margin: 0 auto 20px; padding: 14px 16px; background: #fffefb; border: 1px solid rgba(15,118,110,0.25); border-radius: 10px; color: #1c1a18; font-size: 0.9rem; line-height: 1.5; }
  .${ROOT} .hint-screen h1 { font-size: 1.1rem; margin: 0 0 8px; color: ${TEAL}; }
  .${ROOT} .sheet { width: 210mm; height: 297mm; margin: 0 auto 24px; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; overflow: hidden; }
  .${ROOT} .cell { flex: 1 1 0; min-height: 0; border-bottom: 1px dashed rgba(0,0,0,0.15); display: flex; flex-direction: column; padding: 2mm 3mm; }
  .${ROOT} .cell:last-child { border-bottom: none; }
  .${ROOT} .cell-front { background: #fffefb; }
  .${ROOT} .cell-front .band { background: ${TEAL_DARK}; color: #fff; margin: -2mm -3mm 2mm -3mm; padding: 2mm 3mm; text-align: center; }
  .${ROOT} .cell-front .band h2 { margin: 0; font-size: 11pt; font-weight: 700; letter-spacing: -0.02em; }
  .${ROOT} .cell-front .band .slogan { margin: 1mm 0 0; font-size: 7.5pt; font-weight: 600; line-height: 1.25; }
  .${ROOT} .cell-front .band .sub { margin: 0.8mm 0 0; font-size: 7pt; opacity: 0.95; }
  .${ROOT} .cell-front .body { flex: 1; display: flex; gap: 2mm; font-size: 6.5pt; line-height: 1.35; color: #1c1a18; }
  .${ROOT} .cell-front .body .thumb { flex-shrink: 0; width: 22mm; height: 22mm; border-radius: 4px; overflow: hidden; background: #f0ebe4; }
  .${ROOT} .cell-front .body .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .${ROOT} .cell-front .body .text { flex: 1; min-width: 0; }
  .${ROOT} .cell-front .body .intro { margin: 0 0 1mm; color: #3d3835; }
  .${ROOT} .cell-front .body .event { margin: 0 0 1mm; font-weight: 700; color: ${TEAL}; font-size: 7pt; }
  .${ROOT} .cell-front .body .addr { margin: 0; color: #5c5650; font-size: 6pt; }
  .${ROOT} .cell-front .foot { margin-top: auto; padding-top: 1mm; font-size: 5pt; color: #7a726a; line-height: 1.25; }
  .${ROOT} .cell-back { background: linear-gradient(165deg, #1a2f2e 0%, #0d1f1e 55%, #0a1817 100%); color: #f0faf9; justify-content: center; align-items: center; text-align: center; }
  .${ROOT} .cell-back .inner { max-width: 95%; }
  .${ROOT} .cell-back .kicker { margin: 0; font-size: 6pt; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(95,251,241,0.85); }
  .${ROOT} .cell-back h3 { margin: 1mm 0 0; font-size: 9pt; font-weight: 700; color: #fff; line-height: 1.2; }
  .${ROOT} .cell-back .tag { margin: 1mm 0 0; font-size: 6.5pt; color: rgba(255,255,255,0.88); line-height: 1.3; }
  .${ROOT} .cell-back .qr { margin: 2mm auto 0; width: 22mm; height: 22mm; background: #fff; padding: 1mm; border-radius: 4px; }
  .${ROOT} .cell-back .qr img { width: 100%; height: 100%; display: block; }
  .${ROOT} .cell-back .scan { margin: 1.5mm 0 0; font-size: 6pt; color: rgba(255,255,255,0.8); }
  .${ROOT} .cell-back .brand { margin: 1.5mm 0 0; font-size: 5pt; color: rgba(255,255,255,0.55); line-height: 1.25; }
  @media print {
    @page { size: A4; margin: 0; }
    .${ROOT} { padding: 0 !important; background: #fff !important; min-height: 0 !important; }
    .${ROOT} .hint-screen { display: none !important; }
    .${ROOT} .sheet { box-shadow: none !important; margin: 0 !important; page-break-after: always; }
    .${ROOT} .sheet:last-of-type { page-break-after: auto; }
    .${ROOT} .cell-front .band { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .${ROOT} .cell-back { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`

function formatEventDate(dateStr: string, endDateStr?: string): string {
  try {
    const d = new Date(dateStr)
    const toDe = (x: Date) => x.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
    if (!endDateStr || endDateStr === dateStr) return toDe(d)
    const end = new Date(endDateStr)
    if (d.getMonth() === end.getMonth() && d.getFullYear() === end.getFullYear()) {
      return `${d.getDate()}.–${end.getDate()}. ${end.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`
    }
    return `${toDe(d)} – ${toDe(end)}`
  } catch {
    return ''
  }
}

function loadStammdatenForTenant(tenant: 'k2' | 'oeffentlich'): {
  martinaName: string
  georgName: string
  address: string
  city: string
  country: string
  phone: string
  email: string
} {
  try {
    const martina =
      tenant === 'oeffentlich'
        ? (loadStammdaten('oeffentlich', 'martina') as { name?: string })
        : (() => {
            const raw = localStorage.getItem('k2-stammdaten-martina')
            return raw && raw.length < 50000 ? (JSON.parse(raw) as { name?: string }) : {}
          })()
    const georg =
      tenant === 'oeffentlich'
        ? (loadStammdaten('oeffentlich', 'georg') as { name?: string })
        : (() => {
            const raw = localStorage.getItem('k2-stammdaten-georg')
            return raw && raw.length < 50000 ? (JSON.parse(raw) as { name?: string }) : {}
          })()
    const gallery =
      tenant === 'oeffentlich'
        ? (loadStammdaten('oeffentlich', 'gallery') as {
            address?: string
            city?: string
            country?: string
            phone?: string
            email?: string
          })
        : (() => {
            const raw = localStorage.getItem('k2-stammdaten-galerie')
            return raw && raw.length < 50000
              ? (JSON.parse(raw) as {
                  address?: string
                  city?: string
                  country?: string
                  phone?: string
                  email?: string
                })
              : {}
          })()
    const def =
      tenant === 'oeffentlich'
        ? { martina: MUSTER_TEXTE.martina, georg: MUSTER_TEXTE.georg, gallery: MUSTER_TEXTE.gallery }
        : K2_STAMMDATEN_DEFAULTS
    return {
      martinaName: (martina?.name || (def as { martina?: { name?: string } }).martina?.name || '').trim(),
      georgName: (georg?.name || (def as { georg?: { name?: string } }).georg?.name || '').trim(),
      address: (gallery?.address ?? (def as { gallery?: { address?: string } }).gallery?.address ?? '').trim(),
      city: (gallery?.city ?? (def as { gallery?: { city?: string } }).gallery?.city ?? '').trim(),
      country: (gallery?.country ?? (def as { gallery?: { country?: string } }).gallery?.country ?? '').trim(),
      phone: (gallery?.phone ?? (def as { gallery?: { phone?: string } }).gallery?.phone ?? '').trim(),
      email: (gallery?.email ?? (def as { gallery?: { email?: string } }).gallery?.email ?? '').trim(),
    }
  } catch {
    const def =
      tenant === 'oeffentlich'
        ? { martina: MUSTER_TEXTE.martina, georg: MUSTER_TEXTE.georg, gallery: MUSTER_TEXTE.gallery }
        : K2_STAMMDATEN_DEFAULTS
    return {
      martinaName: ((def as { martina?: { name?: string } }).martina?.name || '').trim(),
      georgName: ((def as { georg?: { name?: string } }).georg?.name || '').trim(),
      address: ((def as { gallery?: { address?: string } }).gallery?.address || '').trim(),
      city: ((def as { gallery?: { city?: string } }).gallery?.city || '').trim(),
      country: ((def as { gallery?: { country?: string } }).gallery?.country || '').trim(),
      phone: ((def as { gallery?: { phone?: string } }).gallery?.phone || '').trim(),
      email: ((def as { gallery?: { email?: string } }).gallery?.email || '').trim(),
    }
  }
}

const SLOTS = [0, 1, 2, 3] as const

export default function FlyerK2Oek2TorViererPage() {
  const tenant = useWerbemittelPrintContext()
  const isOeffentlich = tenant === 'oeffentlich'
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()
  const [welcomeThumb, setWelcomeThumb] = useState('')
  const [intro, setIntro] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [eventDateText, setEventDateText] = useState('')
  const [stammdaten, setStammdaten] = useState(() => loadStammdatenForTenant(tenant))
  const [qrDataUrl, setQrDataUrl] = useState('')

  const entdeckenBustUrl = buildQrUrlWithBust(BASE_APP_URL + OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE, qrVersionTs)

  useEffect(() => {
    let ok = true
    QRCode.toDataURL(entdeckenBustUrl, { width: 320, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (ok) setQrDataUrl(url)
      })
      .catch(() => {
        if (ok) setQrDataUrl('')
      })
    return () => {
      ok = false
    }
  }, [entdeckenBustUrl])

  useEffect(() => {
    let isMounted = true
    try {
      const stamm = isOeffentlich
        ? ((loadStammdaten('oeffentlich', 'gallery') as Record<string, string>) || {})
        : (() => {
            const raw = localStorage.getItem('k2-stammdaten-galerie')
            const out: Record<string, string> = {}
            if (raw && raw.length < 6 * 1024 * 1024) Object.assign(out, JSON.parse(raw))
            return out
          })()
      const images = getGalerieImages(stamm, isOeffentlich ? 'oeffentlich' : undefined)
      const img = images.welcomeImage
      if (img && typeof img === 'string' && img.length > 50 && img.length < 2 * 1024 * 1024 && isMounted) {
        setWelcomeThumb(img)
      } else if (isMounted) {
        setWelcomeThumb(isOeffentlich ? '/img/oeffentlich/willkommen-demo.jpg' : '/img/k2/willkommen.jpg')
      }
    } catch {
      if (isMounted) setWelcomeThumb(isOeffentlich ? '/img/oeffentlich/willkommen-demo.jpg' : '/img/k2/willkommen.jpg')
    }

    try {
      const texts = getPageTexts(isOeffentlich ? 'oeffentlich' : undefined)
      const g = texts.galerie
      const names = loadStammdatenForTenant(tenant)
      if (isMounted) {
        setSubtitle(`${names.martinaName} & ${names.georgName}`)
        setIntro(
          (g?.welcomeIntroText || '').trim().slice(0, 220) ||
            'Kunst & Keramik – wir freuen uns auf deinen Besuch.'
        )
      }
    } catch {
      if (isMounted) setIntro('Kunst & Keramik – wir freuen uns auf deinen Besuch.')
    }

    try {
      const list = loadEvents(isOeffentlich ? 'oeffentlich' : 'k2')
      if (Array.isArray(list) && list.length > 0 && isMounted) {
        const eroeffnung = list.find((e: { type?: string; date?: string }) => e?.type === 'galerieeröffnung' && e?.date)
        const ev = eroeffnung || list.find((e: { date?: string }) => e?.date)
        if (ev?.date) {
          const t = formatEventDate(ev.date, ev.endDate)
          if (t) setEventDateText(t)
        }
      }
    } catch {
      /* ignore */
    }

    setStammdaten(loadStammdatenForTenant(tenant))
    return () => {
      isMounted = false
    }
  }, [tenant, isOeffentlich])

  const addrLine = [stammdaten.address, [stammdaten.city, stammdaten.country].filter(Boolean).join(' ')].filter(Boolean).join(' · ')
  const kontaktKurz = [stammdaten.phone, stammdaten.email].filter(Boolean).join(' · ')

  return (
    <div className={ROOT}>
      <style>{styles}</style>
      <div className="hint-screen no-print">
        <h1>Vierer-Flyer K2 + ök2 Eingangstor</h1>
        <p>
          <strong>Vorderseite:</strong> vier gleiche Streifen (je ca. 21 × {ROW_MM.toFixed(1)} mm) – K2 Galerie.
          <br />
          <strong>Rückseite:</strong> Eingangstor <code>/entdecken</code> mit QR (Server-Stand + Cache-Bust).
        </p>
        <p>
          Drucken: <strong>zwei Seiten</strong> – erst Vorderseite, dann <strong>Duplex (lange Kante)</strong> auf
          dieselbe Ausrichtung oder Blatt wenden und Rückseite drucken. Anschließend an den gestrichelten Linien
          zuschneiden.
        </p>
        <p style={{ marginBottom: 0, fontSize: '0.85rem', color: '#5c5650' }}>
          Auch unter Eventplanung → Öffentlichkeitsarbeit → <strong>Event-Flyer</strong> verlinkt.
        </p>
      </div>

      <section className="sheet" aria-label="Vorderseite vier Flyer K2 Galerie">
        {SLOTS.map((i) => (
          <div key={`f-${i}`} className="cell cell-front">
            <div className="band">
              <h2>K2 Galerie</h2>
              <p className="slogan">{PRODUCT_WERBESLOGAN}</p>
              <p className="sub">{PRODUCT_WERBESLOGAN_2}</p>
              {subtitle ? <p className="sub">{subtitle}</p> : null}
            </div>
            <div className="body">
              {welcomeThumb ? (
                <div className="thumb">
                  <img src={welcomeThumb} alt="" />
                </div>
              ) : null}
              <div className="text">
                <p className="intro">{intro}</p>
                {eventDateText ? <p className="event">Termin: {eventDateText}</p> : null}
                <p className="addr">
                  {addrLine}
                  {kontaktKurz ? (
                    <>
                      <br />
                      {kontaktKurz}
                    </>
                  ) : null}
                </p>
              </div>
            </div>
            <div className="foot">
              {PRODUCT_COPYRIGHT_BRAND_ONLY}
              <br />
              {PRODUCT_URHEBER_ANWENDUNG}
            </div>
          </div>
        ))}
      </section>

      <section className="sheet" aria-label="Rückseite vier QR Eingangstor">
        {SLOTS.map((i) => (
          <div key={`b-${i}`} className="cell cell-back">
            <div className="inner">
              <p className="kicker">Demo · ohne Anmeldung</p>
              <h3>Galerie entdecken</h3>
              <p className="tag">{PRODUCT_WERBESLOGAN}</p>
              {qrDataUrl ? (
                <div className="qr">
                  <img src={qrDataUrl} alt="QR-Code Eingangstor" />
                </div>
              ) : (
                <div className="qr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, color: '#333' }}>
                  QR…
                </div>
              )}
              <p className="scan">Code scannen – persönlicher Einstieg ({OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE})</p>
              <p className="brand">
                {PRODUCT_BRAND_NAME}
                <br />
                {PRODUCT_COPYRIGHT_BRAND_ONLY}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
