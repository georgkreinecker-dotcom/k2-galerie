import { useEffect, useState } from 'react'
import { getWerbelinieCss, WERBELINIE_FONTS_URL } from '../config/marketingWerbelinie'
import { K2_STAMMDATEN_DEFAULTS } from '../config/tenantConfig'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT } from '../config/tenantConfig'

const DOC_CLASS = 'presse-k2-page'

const EVENT_TYPE_LABELS: Record<string, string> = {
  galerieeröffnung: 'Galerieeröffnung',
  vernissage: 'Vernissage',
  finissage: 'Finissage',
  öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
  sonstiges: 'Veranstaltung',
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

function loadStammdaten(): {
  address: string
  city: string
  country: string
  phone: string
  email: string
} {
  const def = K2_STAMMDATEN_DEFAULTS.gallery
  try {
    const raw = localStorage.getItem('k2-stammdaten-galerie')
    const g = raw && raw.length < 50000 ? JSON.parse(raw) as Record<string, string> : {}
    return {
      address: (g.address ?? def.address ?? '').trim(),
      city: (g.city ?? def.city ?? '').trim(),
      country: (g.country ?? def.country ?? '').trim(),
      phone: (g.phone ?? def.phone ?? '').trim(),
      email: (g.email ?? def.email ?? '').trim(),
    }
  } catch {
    return {
      address: def.address ?? '',
      city: def.city ?? '',
      country: def.country ?? '',
      phone: def.phone ?? '',
      email: def.email ?? '',
    }
  }
}

export default function PresseEinladungK2GaleriePage() {
  const [event, setEvent] = useState<{
    title: string
    type: string
    date: string
    location: string
    description: string
  } | null>(null)
  const [stammdaten, setStammdaten] = useState(loadStammdaten)

  useEffect(() => {
    let isMounted = true
    try {
      const raw = localStorage.getItem('k2-events')
      if (raw && raw.length < 500000) {
        const list = JSON.parse(raw) as any[]
        if (Array.isArray(list) && list.length > 0) {
          const eroeffnung = list.find((e: any) => e?.type === 'galerieeröffnung' && e?.date)
          const ev = eroeffnung || list.find((e: any) => e?.date) || list[0]
          if (ev && isMounted) {
            const location = ev.location || ''
            setEvent({
              title: ev.title || 'Einladung',
              type: ev.type || 'sonstiges',
              date: formatEventDate(ev.date || '', ev.endDate),
              location: location.trim(),
              description: (ev.description || 'Wir freuen uns auf deinen Besuch.').trim(),
            })
          }
        }
      }
      setStammdaten(loadStammdaten())
    } catch (_) {}
    return () => { isMounted = false }
  }, [])

  const location = event?.location || [stammdaten.address, stammdaten.city, stammdaten.country].filter(Boolean).join(', ')
  const contact = [stammdaten.phone, stammdaten.email].filter(Boolean).join(' · ')
  const typeLabel = event ? (EVENT_TYPE_LABELS[event.type] || 'Veranstaltung') : 'Einladung'

  return (
    <div className={DOC_CLASS}>
      <style>{getWerbelinieCss(DOC_CLASS)}</style>
      <link rel="stylesheet" href={WERBELINIE_FONTS_URL} />
      <div className="doc-box">
        <div className="content">
          <p className="tagline">{PRODUCT_BRAND_NAME}</p>
          <p className="presse-type">{typeLabel}</p>
          <h1 className="presse-headline">{event?.title || 'Einladung zur Galerieeröffnung'}</h1>
          <div className="line" />
          <div className="presse-block">
            <p className="presse-label">Termin</p>
            <p className="presse-body">{event?.date || 'Datum folgt in Kürze.'}</p>
          </div>
          {location && (
            <div className="presse-block">
              <p className="presse-label">Ort</p>
              <p className="presse-body">{location}</p>
            </div>
          )}
          <div className="presse-block">
            <p className="presse-label">Beschreibung</p>
            <p className="presse-body">{event?.description || 'Wir freuen uns auf deinen Besuch.'}</p>
          </div>
          <p className="cta">Wir freuen uns auf deinen Besuch.</p>
          {contact && (
            <div className="presse-block">
              <p className="presse-label">Kontakt</p>
              <p className="presse-body">{contact}</p>
            </div>
          )}
          <div className="footer">
            <strong>{PRODUCT_BRAND_NAME}</strong>
            {[stammdaten.address, stammdaten.city, stammdaten.country].filter(Boolean).length > 0 && (
              <> · {[stammdaten.address, stammdaten.city, stammdaten.country].filter(Boolean).join(' · ')}</>
            )}
            {contact && <><br />Kontakt: {contact}</>}
            <br />{PRODUCT_COPYRIGHT}
          </div>
        </div>
      </div>
    </div>
  )
}
