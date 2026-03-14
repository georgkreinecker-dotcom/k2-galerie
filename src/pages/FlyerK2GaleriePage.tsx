import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getGalerieImages } from '../config/pageContentGalerie'
import { getPageTexts } from '../config/pageTexts'
import { getWerbelinieCss, WERBELINIE_FONTS_URL } from '../config/marketingWerbelinie'
import { K2_STAMMDATEN_DEFAULTS, MUSTER_TEXTE } from '../config/tenantConfig'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT, PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2 } from '../config/tenantConfig'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { loadEvents } from '../utils/eventsStorage'

const DOC_CLASS = 'flyer-k2-page'

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
      <style>{getWerbelinieCss(DOC_CLASS)}</style>
      <link rel="stylesheet" href={WERBELINIE_FONTS_URL} />
      <div className="doc-box">
        <div className="content">
          <p className="tagline">{tagline}</p>
          <h1>{PRODUCT_BRAND_NAME}</h1>
          <p className="subtitle" style={{ marginBottom: 2 }}>{PRODUCT_WERBESLOGAN}</p>
          <p className="subtitle" style={{ marginBottom: 8 }}>{PRODUCT_WERBESLOGAN_2}</p>
          <p className="subtitle">{subtitle}</p>
          <div className="line" />
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
