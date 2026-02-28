import { useEffect, useState } from 'react'
import { getGalerieImages } from '../config/pageContentGalerie'
import { getPageTexts } from '../config/pageTexts'
import { getWerbelinieCss, WERBELINIE_FONTS_URL } from '../config/marketingWerbelinie'
import { K2_STAMMDATEN_DEFAULTS } from '../config/tenantConfig'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT } from '../config/tenantConfig'
import { loadEvents } from '../utils/eventsStorage'

const DOC_CLASS = 'flyer-k2-page'

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

function loadStammdaten(): {
  martinaName: string
  georgName: string
  address: string
  city: string
  country: string
  phone: string
  email: string
} {
  const def = K2_STAMMDATEN_DEFAULTS
  try {
    const rawM = localStorage.getItem('k2-stammdaten-martina')
    const rawG = localStorage.getItem('k2-stammdaten-georg')
    const rawGal = localStorage.getItem('k2-stammdaten-galerie')
    const martina = rawM && rawM.length < 50000 ? JSON.parse(rawM) as { name?: string } : {}
    const georg = rawG && rawG.length < 50000 ? JSON.parse(rawG) as { name?: string } : {}
    const gallery = rawGal && rawGal.length < 50000 ? JSON.parse(rawGal) as { address?: string; city?: string; country?: string; phone?: string; email?: string } : {}
    return {
      martinaName: (martina.name || def.martina.name).trim(),
      georgName: (georg.name || def.georg.name).trim(),
      address: (gallery.address || def.gallery.address || '').trim(),
      city: (gallery.city || def.gallery.city || '').trim(),
      country: (gallery.country || def.gallery.country || '').trim(),
      phone: (gallery.phone || def.gallery.phone || '').trim(),
      email: (gallery.email || def.gallery.email || '').trim(),
    }
  } catch {
    return {
      martinaName: def.martina.name,
      georgName: def.georg.name,
      address: def.gallery.address || '',
      city: def.gallery.city || '',
      country: def.gallery.country || '',
      phone: def.gallery.phone || '',
      email: def.gallery.email || '',
    }
  }
}

export default function FlyerK2GaleriePage() {
  const [welcomeImage, setWelcomeImage] = useState<string>('')
  const [eventDateText, setEventDateText] = useState<string>('')
  const [tagline, setTagline] = useState<string>('Kunst & Keramik')
  const [subtitle, setSubtitle] = useState<string>('Martina & Georg Kreinecker')
  const [intro, setIntro] = useState<string>('')
  const [stammdaten, setStammdaten] = useState(loadStammdaten)

  useEffect(() => {
    let isMounted = true
    try {
      const stamm: Record<string, string> = {}
      const raw = localStorage.getItem('k2-stammdaten-galerie')
      if (raw && raw.length < 6 * 1024 * 1024) {
        Object.assign(stamm, JSON.parse(raw))
      }
      const images = getGalerieImages(stamm)
      const img = images.welcomeImage
      if (img && typeof img === 'string' && img.length > 50 && img.length < 3 * 1024 * 1024 && isMounted) {
        setWelcomeImage(img)
      }
    } catch (_) {}

    try {
      const texts = getPageTexts()
      const g = texts.galerie
      if (g && isMounted) {
        setTagline('Kunst & Keramik')
        const names = loadStammdaten()
        setSubtitle(`${names.martinaName} & ${names.georgName}`)
        setIntro((g.welcomeIntroText || '').trim() || 'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.')
      }
    } catch (_) {}

    try {
      const list = loadEvents('k2')
      if (Array.isArray(list) && list.length > 0 && isMounted) {
        const eroeffnung = list.find((e: any) => e?.type === 'galerieeröffnung' && e?.date)
        const event = eroeffnung || list.find((e: any) => e?.date)
        if (event?.date && isMounted) {
          const text = formatEventDate(event.date, event.endDate)
          if (text) setEventDateText(text)
        }
      }
    } catch (_) {}

    setStammdaten(loadStammdaten())
    return () => { isMounted = false }
  }, [])

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
