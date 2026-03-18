import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getGalerieImages } from '../config/pageContentGalerie'
import { getPageTexts } from '../config/pageTexts'
import { K2_STAMMDATEN_DEFAULTS, MUSTER_TEXTE } from '../config/tenantConfig'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT, PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2 } from '../config/tenantConfig'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { loadEvents } from '../utils/eventsStorage'

const DOC_CLASS = 'flyer-k2-page'
/** Gleiches Erscheinungsbild wie Kurzvariante (Präsentationsmappe) – Teal/Weiß. */
const TEAL = '#0f766e'
const TEAL_DARK = '#0c5c55' /* kräftiger Brand-Bereich (Druck + Bildschirm) */
const TEAL_LIGHT = '#0d9488'

const flyerTealStyles = `
  .${DOC_CLASS} { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Source Sans 3', sans-serif; background: #faf8f5; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; box-sizing: border-box; }
  .${DOC_CLASS} .doc-box { width: 210mm; max-width: 100%; min-height: 297mm; background: #fffefb; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; display: flex; flex-direction: column; }
  .${DOC_CLASS} .teal-hero { background: ${TEAL_DARK}; color: #fff; padding: 14mm 14mm; text-align: center; }
  .${DOC_CLASS} .teal-hero h1 { font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.02em; color: #fff; }
  .${DOC_CLASS} .teal-hero .slogan { font-size: 15px; font-weight: 600; color: #fff; margin: 0.5em 0 0; line-height: 1.35; }
  .${DOC_CLASS} .teal-hero .tagline { font-size: 14px; color: rgba(255,255,255,0.95); margin: 0.35em 0 0; line-height: 1.4; }
  .${DOC_CLASS} .teal-hero .sub { font-size: 13px; color: rgba(255,255,255,0.9); margin: 0.6em 0 0; }
  .${DOC_CLASS} .teal-hero .copy { font-size: 11px; color: rgba(255,255,255,0.85); margin: 1em 0 0; }
  .${DOC_CLASS} .body { padding: 10mm 14mm; color: #1c1a18; flex: 1; }
  .${DOC_CLASS} .body .welcome-image-wrap { width: 100%; margin: 0 0 8px 0; text-align: center; }
  .${DOC_CLASS} .body .welcome-image-wrap img { max-width: 100%; max-height: 52mm; height: auto; object-fit: contain; border-radius: 8px; display: block; margin: 0 auto; }
  .${DOC_CLASS} .body .intro { font-size: 12px; line-height: 1.5; color: #1c1a18; margin: 0 0 8px 0; }
  .${DOC_CLASS} .body .points { list-style: none; margin: 0 0 8px 0; padding: 0; }
  .${DOC_CLASS} .body .points li { font-size: 11px; line-height: 1.45; color: #5c5650; padding-left: 14px; position: relative; margin: 0 0 2px 0; }
  .${DOC_CLASS} .body .points li::before { content: ''; position: absolute; left: 0; top: 0.5em; width: 4px; height: 4px; background: ${TEAL_LIGHT}; border-radius: 50%; }
  .${DOC_CLASS} .body .cta { font-size: 14px; font-weight: 600; color: ${TEAL}; margin: 0 0 4px 0; }
  .${DOC_CLASS} .body .event-date { font-size: 13px; font-weight: 600; color: ${TEAL_LIGHT}; margin: 0 0 4px 0; }
  .${DOC_CLASS} .body .info-kuerze { font-size: 11px; color: #5c5650; margin: 0; font-style: italic; }
  .${DOC_CLASS} .body .footer { margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(15,118,110,0.2); font-size: 10px; color: #5c5650; line-height: 1.4; }
  .${DOC_CLASS} .body .footer strong { color: #1c1a18; }
  @media print {
    @page { size: A4; margin: 8mm 10mm; }
    .${DOC_CLASS} { padding: 0 !important; margin: 0 !important; background: #fff !important; min-height: 0 !important; }
    .${DOC_CLASS} .doc-box { box-shadow: none !important; min-height: 0 !important; max-height: 100% !important; page-break-inside: avoid !important; }
    .${DOC_CLASS} .teal-hero { background: ${TEAL_DARK} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 6mm 10mm !important; }
    .${DOC_CLASS} .teal-hero h1 { font-size: 18pt !important; margin: 0 !important; }
    .${DOC_CLASS} .teal-hero .slogan { font-size: 10pt !important; margin: 2mm 0 0 !important; }
    .${DOC_CLASS} .teal-hero .tagline, .${DOC_CLASS} .teal-hero .sub { font-size: 9pt !important; margin: 1mm 0 0 !important; }
    .${DOC_CLASS} .teal-hero .copy { font-size: 7pt !important; margin: 2mm 0 0 !important; }
    .${DOC_CLASS} .body { padding: 5mm 10mm 8mm !important; }
    .${DOC_CLASS} .body .welcome-image-wrap img { max-height: 42mm !important; }
    .${DOC_CLASS} .body .intro { font-size: 9pt !important; margin: 0 0 4px !important; line-height: 1.35 !important; }
    .${DOC_CLASS} .body .points li { font-size: 8pt !important; margin: 0 0 1px !important; }
    .${DOC_CLASS} .body .cta { font-size: 10pt !important; margin: 0 0 2px !important; }
    .${DOC_CLASS} .body .event-date { font-size: 9pt !important; margin: 0 0 2px !important; }
    .${DOC_CLASS} .body .info-kuerze { font-size: 8pt !important; margin: 0 !important; }
    .${DOC_CLASS} .body .footer { margin-top: 5px !important; padding-top: 4px !important; font-size: 7pt !important; }
  }
`

/** Kontext für Flyer: ök2 = nur Muster/oeffentlich, sonst K2 (eisernes Gesetz: keine K2-Daten in ök2). */
function useFlyerTenant(): 'k2' | 'oeffentlich' {
  const [searchParams] = useSearchParams()
  const fromUrl = searchParams.get('context') === 'oeffentlich'
  const fromStorage = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-admin-context') === 'oeffentlich'
  return fromUrl || fromStorage ? 'oeffentlich' : 'k2'
}

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
    const martina = tenant === 'oeffentlich' ? loadStammdaten('oeffentlich', 'martina') as { name?: string } : (() => {
      const raw = localStorage.getItem('k2-stammdaten-martina')
      return raw && raw.length < 50000 ? JSON.parse(raw) as { name?: string } : {}
    })()
    const georg = tenant === 'oeffentlich' ? loadStammdaten('oeffentlich', 'georg') as { name?: string } : (() => {
      const raw = localStorage.getItem('k2-stammdaten-georg')
      return raw && raw.length < 50000 ? JSON.parse(raw) as { name?: string } : {}
    })()
    const gallery = tenant === 'oeffentlich' ? loadStammdaten('oeffentlich', 'gallery') as { address?: string; city?: string; country?: string; phone?: string; email?: string } : (() => {
      const raw = localStorage.getItem('k2-stammdaten-galerie')
      return raw && raw.length < 50000 ? JSON.parse(raw) as { address?: string; city?: string; country?: string; phone?: string; email?: string } : {}
    })()
    const def = tenant === 'oeffentlich' ? { martina: MUSTER_TEXTE.martina, georg: MUSTER_TEXTE.georg, gallery: MUSTER_TEXTE.gallery } : K2_STAMMDATEN_DEFAULTS
    return {
      martinaName: (martina?.name || (def as any).martina?.name || '').trim(),
      georgName: (georg?.name || (def as any).georg?.name || '').trim(),
      address: (gallery?.address ?? (def as any).gallery?.address ?? '').trim(),
      city: (gallery?.city ?? (def as any).gallery?.city ?? '').trim(),
      country: (gallery?.country ?? (def as any).gallery?.country ?? '').trim(),
      phone: (gallery?.phone ?? (def as any).gallery?.phone ?? '').trim(),
      email: (gallery?.email ?? (def as any).gallery?.email ?? '').trim(),
    }
  } catch {
    const def = tenant === 'oeffentlich' ? { martina: MUSTER_TEXTE.martina, georg: MUSTER_TEXTE.georg, gallery: MUSTER_TEXTE.gallery } : K2_STAMMDATEN_DEFAULTS
    return {
      martinaName: ((def as any).martina?.name || '').trim(),
      georgName: ((def as any).georg?.name || '').trim(),
      address: ((def as any).gallery?.address || '').trim(),
      city: ((def as any).gallery?.city || '').trim(),
      country: ((def as any).gallery?.country || '').trim(),
      phone: ((def as any).gallery?.phone || '').trim(),
      email: ((def as any).gallery?.email || '').trim(),
    }
  }
}

export default function FlyerK2GaleriePage() {
  const tenant = useFlyerTenant()
  const [welcomeImage, setWelcomeImage] = useState<string>('')
  const [eventDateText, setEventDateText] = useState<string>('')
  const [tagline, setTagline] = useState<string>('Kunst & Keramik')
  const [subtitle, setSubtitle] = useState<string>('Martina & Georg Kreinecker')
  const [intro, setIntro] = useState<string>('')
  const [stammdaten, setStammdaten] = useState(() => loadStammdatenForTenant(tenant))

  useEffect(() => {
    let isMounted = true
    const isOeffentlich = tenant === 'oeffentlich'
    try {
      const stamm = isOeffentlich
        ? (loadStammdaten('oeffentlich', 'gallery') as Record<string, string> || {})
        : (() => {
            const raw = localStorage.getItem('k2-stammdaten-galerie')
            const out: Record<string, string> = {}
            if (raw && raw.length < 6 * 1024 * 1024) Object.assign(out, JSON.parse(raw))
            return out
          })()
      const images = getGalerieImages(stamm, isOeffentlich ? 'oeffentlich' : undefined)
      const img = images.welcomeImage
      if (img && typeof img === 'string' && img.length > 50 && img.length < 3 * 1024 * 1024 && isMounted) {
        setWelcomeImage(img)
      } else if (isMounted) {
        setWelcomeImage(isOeffentlich ? '/img/oeffentlich/willkommen-demo.jpg' : '/img/k2/willkommen.jpg')
      }
    } catch (_) {
      if (isMounted) setWelcomeImage(tenant === 'oeffentlich' ? '/img/oeffentlich/willkommen-demo.jpg' : '/img/k2/willkommen.jpg')
    }

    try {
      const texts = getPageTexts(isOeffentlich ? 'oeffentlich' : undefined)
      const g = texts.galerie
      if (g && isMounted) {
        setTagline('Kunst & Keramik')
        const names = loadStammdatenForTenant(tenant)
        setSubtitle(`${names.martinaName} & ${names.georgName}`)
        setIntro((g.welcomeIntroText || '').trim() || 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.')
      }
    } catch (_) {}

    try {
      const list = loadEvents(isOeffentlich ? 'oeffentlich' : 'k2')
      if (Array.isArray(list) && list.length > 0 && isMounted) {
        const eroeffnung = list.find((e: any) => e?.type === 'galerieeröffnung' && e?.date)
        const event = eroeffnung || list.find((e: any) => e?.date)
        if (event?.date && isMounted) {
          const text = formatEventDate(event.date, event.endDate)
          if (text) setEventDateText(text)
        }
      }
    } catch (_) {}

    setStammdaten(loadStammdatenForTenant(tenant))
    return () => { isMounted = false }
  }, [tenant])

  const footerLine1 = [
    PRODUCT_BRAND_NAME,
    stammdaten.address,
    [stammdaten.city, stammdaten.country].filter(Boolean).join(' · '),
  ].filter(Boolean).join(' · ')
  const contactParts = [stammdaten.phone, stammdaten.email].filter(Boolean)
  const footerLine2 = contactParts.length ? `Kontakt: ${contactParts.join(' · ')}` : ''

  return (
    <div className={DOC_CLASS}>
      <style>{flyerTealStyles}</style>
      <div className="doc-box">
        {/* Deckblatt im Erscheinungsbild Teal/Weiß (wie Kurzvariante) */}
        <div className="teal-hero">
          <h1>K2 Galerie</h1>
          <p className="slogan">{PRODUCT_WERBESLOGAN}</p>
          <p className="tagline">{PRODUCT_WERBESLOGAN_2}</p>
          <p className="sub">{subtitle}</p>
          <p className="copy">© kgm solution</p>
        </div>
        <div className="body">
          {welcomeImage ? (
            <div className="welcome-image-wrap">
              <img src={welcomeImage} alt={`Willkommensbild ${PRODUCT_BRAND_NAME}`} />
            </div>
          ) : null}
          <p className="intro">{intro}</p>
          <ul className="points">
            <li>Eigene Werke: Malerei von {stammdaten.martinaName}, Keramik von {stammdaten.georgName}</li>
            <li>Ausstellungen, Verkauf und persönliche Beratung</li>
            <li>Digitale Galerie und Terminvereinbarung</li>
          </ul>
          <p className="cta">Wir freuen uns auf deinen Besuch.</p>
          {eventDateText ? <p className="event-date">Termin: {eventDateText}</p> : null}
          <p className="info-kuerze">Weitere Infos erfolgen in Kürze.</p>
          <div className="footer">
            {footerLine1 && (
              <>
                <strong>{PRODUCT_BRAND_NAME}</strong>
                {footerLine1 !== PRODUCT_BRAND_NAME ? ` · ${footerLine1.replace(PRODUCT_BRAND_NAME, '').replace(/^ · /, '').trim()}` : ''}
              </>
            )}
            {footerLine2 && <><br />{footerLine2}</>}
            <br />{PRODUCT_COPYRIGHT}
          </div>
        </div>
      </div>
    </div>
  )
}
