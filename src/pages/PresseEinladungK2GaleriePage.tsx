import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getWerbelinieCss, WERBELINIE_FONTS_URL } from '../config/marketingWerbelinie'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT, PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2 } from '../config/tenantConfig'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { loadEvents } from '../utils/eventsStorage'
import { getOeffentlichEventsWithMusterFallback, pickOpeningEventForWerbemittel } from '../utils/oek2MusterEventLinie'
import { formatEventTerminKomplett } from '../utils/eventTerminFormat'

const DOC_CLASS = 'presse-k2-page'

const EVENT_TYPE_LABELS: Record<string, string> = {
  galerieeröffnung: 'Galerieeröffnung',
  vernissage: 'Vernissage',
  finissage: 'Finissage',
  öffentlichkeitsarbeit: 'Öffentlichkeitsarbeit',
  sonstiges: 'Veranstaltung',
}

function usePresseTenant(): 'k2' | 'oeffentlich' {
  const [searchParams] = useSearchParams()
  const fromUrl = searchParams.get('context') === 'oeffentlich'
  const fromStorage = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('k2-admin-context') === 'oeffentlich'
  return fromUrl || fromStorage ? 'oeffentlich' : 'k2'
}

function toFlatStammdaten(g: any): { address: string; city: string; country: string; phone: string; email: string } {
  return {
    address: (g?.address ?? '').trim(),
    city: (g?.city ?? '').trim(),
    country: (g?.country ?? '').trim(),
    phone: (g?.phone ?? '').trim(),
    email: (g?.email ?? '').trim(),
  }
}

export default function PresseEinladungK2GaleriePage() {
  const tenant = usePresseTenant()
  const isOeffentlich = tenant === 'oeffentlich'
  const [event, setEvent] = useState<{
    title: string
    type: string
    date: string
    location: string
    description: string
  } | null>(null)
  const [stammdaten, setStammdaten] = useState(() =>
    toFlatStammdaten(typeof window !== 'undefined' ? loadStammdaten(isOeffentlich ? 'oeffentlich' : 'k2', 'gallery') : {})
  )

  useEffect(() => {
    let isMounted = true
    try {
      const list = isOeffentlich ? getOeffentlichEventsWithMusterFallback() : loadEvents('k2')
      if (Array.isArray(list) && list.length > 0) {
        const ev = pickOpeningEventForWerbemittel(list) || list[0]
        if (ev && isMounted) {
          const location = ev.location || ''
          setEvent({
            title: ev.title || 'Einladung',
            type: ev.type || 'sonstiges',
            date: formatEventTerminKomplett(ev, { mode: 'compact' }),
            location: location.trim(),
            description: (ev.description || 'Wir freuen uns auf deinen Besuch.').trim(),
          })
        }
      }
      const g = loadStammdaten(isOeffentlich ? 'oeffentlich' : 'k2', 'gallery')
      if (isMounted) setStammdaten(toFlatStammdaten(g))
    } catch (_) {}
    return () => { isMounted = false }
  }, [isOeffentlich])

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
          <p className="subtitle" style={{ marginBottom: 4 }}>{PRODUCT_WERBESLOGAN}</p>
          <p className="subtitle" style={{ marginBottom: 12 }}>{PRODUCT_WERBESLOGAN_2}</p>
          <p className="presse-type">{typeLabel}</p>
          <h1 className="presse-headline">{event?.title || 'Einladung zur Galerieeröffnung'}</h1>
          <div className="line" />
          <div className="presse-block">
            <p className="presse-label">Termin</p>
            <p className="presse-body" style={{ whiteSpace: 'pre-line' }}>{event?.date || 'Datum folgt in Kürze.'}</p>
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
