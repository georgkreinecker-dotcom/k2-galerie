import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { BASE_APP_URL, PROJECT_ROUTES } from '../config/navigation'
import { getPageTexts } from '../config/pageTexts'
import { getGalerieImages } from '../config/pageContentGalerie'
import {
  K2_STAMMDATEN_DEFAULTS,
  MUSTER_ARTWORKS,
  PRODUCT_COPYRIGHT_BRAND_ONLY,
  PRODUCT_OEK2_MARKETING_ERKLAERUNG_FLYER,
} from '../config/tenantConfig'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { readArtworksForContextWithResolvedImages } from '../utils/artworksStorage'
import { loadEvents } from '../utils/eventsStorage'
import {
  type EventTerminLike,
  formatEventTerminKomplett,
} from '../utils/eventTerminFormat'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

const ROOT = 'flyer-event-bogen-neu'
/** Zwei Flyer-Hälften pro A4-Seite (Vorder- und Rückseite je ein 2er-Bogen). */
const SLOTS = [1, 2] as const
const LEFT_WORK_KEY = 'k2-flyer-event-bogen-left-work'
const RIGHT_WORK_KEY = 'k2-flyer-event-bogen-right-work'

function getK2Basics() {
  const gallery = loadStammdaten('k2', 'gallery')
  const martina = loadStammdaten('k2', 'martina')
  const georg = loadStammdaten('k2', 'georg')
  const defaults = K2_STAMMDATEN_DEFAULTS
  return {
    galleryName: gallery.name || defaults.gallery.name || 'K2 Galerie',
    intro:
      getPageTexts().galerie.welcomeIntroText ||
      'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.',
    subtitle: `${martina.name || defaults.martina.name || 'Martina'} & ${georg.name || defaults.georg.name || 'Georg'}`,
    address: gallery.address || defaults.gallery.address || '',
    city: gallery.city || defaults.gallery.city || '',
    phone: gallery.phone || defaults.gallery.phone || '',
    email: gallery.email || defaults.gallery.email || '',
  }
}

function normalizeFileToUrl(file: File): string {
  return URL.createObjectURL(file)
}

/** Öffnungszeiten für Flyer: Freitext + optional Wochentabelle (Sa explizit). */
function formatGalleryOpeningHoursBlock(gallery: {
  openingHours?: string
  openingHoursWeek?: Record<string, string>
}): string {
  const lines: string[] = []
  const oh = String(gallery?.openingHours || '').trim()
  if (oh) lines.push(oh)
  const w = gallery?.openingHoursWeek
  if (w && typeof w === 'object' && !Array.isArray(w)) {
    const dayOrder: [string, string][] = [
      ['montag', 'Mo'],
      ['dienstag', 'Di'],
      ['mittwoch', 'Mi'],
      ['donnerstag', 'Do'],
      ['freitag', 'Fr'],
      ['samstag', 'Sa'],
      ['sonntag', 'So'],
    ]
    for (const [key, label] of dayOrder) {
      const val = w[key]
      if (val != null && String(val).trim()) lines.push(`${label}: ${String(val).trim()}`)
    }
  }
  return lines.join('\n')
}

/** Event-Eröffnung: eigene Zeiten (tagesweise oder ein Start/Ende) – dann stehen sie bereits in formatEventTerminKomplett. */
function eventHasFlyerZeiten(e: EventTerminLike | null | undefined): boolean {
  if (!e) return false
  if (String(e.startTime || '').trim() || String(e.endTime || '').trim()) return true
  const dt = e.dailyTimes
  if (dt && typeof dt === 'object' && !Array.isArray(dt)) {
    return Object.keys(dt).some((k) => {
      const v = (dt as Record<string, unknown>)[k]
      if (v == null) return false
      if (typeof v === 'string') return String(v).trim().length > 0
      if (typeof v === 'object' && v !== null) {
        const o = v as { start?: string; end?: string }
        return Boolean(String(o.start || '').trim() || String(o.end || '').trim())
      }
      return false
    })
  }
  return false
}

export default function FlyerEventBogenNeuPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  /** Von Admin Event-Flyer: ?layout=variant2 oder ?layout=standard (Default ohne Param = Standard) */
  const layoutFromUrl: 'standard' | 'variant2' =
    searchParams.get('layout') === 'variant2' ? 'variant2' : 'standard'
  const { versionTimestamp } = useQrVersionTimestamp()
  /** Neu laden bei Event-/Stammdaten-Änderung (Admin, anderes Tab, Tab-Rückkehr). */
  const [flyerDataTick, setFlyerDataTick] = useState(0)
  const base = getK2Basics()
  const gallery = useMemo(() => loadStammdaten('k2', 'gallery'), [flyerDataTick])
  const galerieImages = getGalerieImages(gallery)
  const defaultLeft = galerieImages.galerieCardImage || galerieImages.welcomeImage || '/img/k2/willkommen.jpg'
  const defaultMiddle = galerieImages.welcomeImage || '/img/k2/willkommen.jpg'
  const defaultRight = galerieImages.virtualTourImage || galerieImages.welcomeImage || '/img/k2/willkommen.jpg'

  const [leftSrc, setLeftSrc] = useState(defaultLeft)
  const [middleSrc, setMiddleSrc] = useState(defaultMiddle)
  const [rightSrc, setRightSrc] = useState(defaultRight)
  const [k2Works, setK2Works] = useState<any[]>([])
  const [leftWorkNumber, setLeftWorkNumber] = useState('')
  const [rightWorkNumber, setRightWorkNumber] = useState('')
  const [leftWerkLabel, setLeftWerkLabel] = useState('Werk links (K2)')
  const [rightWerkLabel, setRightWerkLabel] = useState('Werk rechts (K2)')
  const [frontQrDataUrl, setFrontQrDataUrl] = useState('')
  const [backQrDataUrl, setBackQrDataUrl] = useState('')
  const [eventDateLine, setEventDateLine] = useState('Termin folgt')
  const [eroeffnungEvent, setEroeffnungEvent] = useState<EventTerminLike | null>(null)
  const [page1Layout, setPage1Layout] = useState<'standard' | 'variant2'>(layoutFromUrl)
  const [frontVariant, setFrontVariant] = useState<'A' | 'B'>('A')
  const middleViewSrc = middleSrc || leftSrc || rightSrc || defaultMiddle

  const oek2MarketingBlocks = useMemo(
    () =>
      PRODUCT_OEK2_MARKETING_ERKLAERUNG_FLYER.split(/\n\n+/)
        .map((s: string) => s.trim())
        .filter(Boolean),
    []
  )

  const terminKomplettV2 = useMemo(
    () =>
      formatEventTerminKomplett(eroeffnungEvent, {
        mode: 'long',
        emptyFallback: 'Termin folgt',
        withClockEmojiSingle: true,
      }),
    [eroeffnungEvent]
  )
  const openingHoursBlock = useMemo(() => formatGalleryOpeningHoursBlock(gallery), [gallery])

  const k2Qr = useMemo(
    () => buildQrUrlWithBust(BASE_APP_URL + PROJECT_ROUTES['k2-galerie'].galerie, versionTimestamp),
    [versionTimestamp]
  )
  const oek2TorQr = useMemo(
    () => buildQrUrlWithBust(BASE_APP_URL + PROJECT_ROUTES['k2-galerie'].galerieOeffentlich, versionTimestamp),
    [versionTimestamp]
  )

  useEffect(() => {
    let active = true
    void QRCode.toDataURL(k2Qr, { width: 240, margin: 1 })
      .then((url) => {
        if (active) setFrontQrDataUrl(url)
      })
      .catch(() => {})
    void QRCode.toDataURL(oek2TorQr, { width: 240, margin: 1 })
      .then((url) => {
        if (active) setBackQrDataUrl(url)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [k2Qr, oek2TorQr])

  useEffect(() => {
    const evts = loadEvents('k2')
    const eroeffnung = Array.isArray(evts) ? evts.find((e: any) => e?.type === 'galerieeröffnung') : null
    if (eroeffnung) {
      setEroeffnungEvent(eroeffnung as EventTerminLike)
      const full = formatEventTerminKomplett(eroeffnung, {
        mode: 'long',
        emptyFallback: 'Termin folgt',
        withClockEmojiSingle: true,
      })
      if (full) setEventDateLine(full.replace(/\s+/g, ' ').trim())
    } else {
      setEroeffnungEvent(null)
      setEventDateLine('Termin folgt')
    }
  }, [flyerDataTick])

  useEffect(() => {
    const bump = () => setFlyerDataTick((t) => t + 1)
    window.addEventListener('k2-events-updated', bump)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'k2-events' || e.key === 'k2-stammdaten-galerie') bump()
    }
    window.addEventListener('storage', onStorage)
    const onVis = () => {
      if (document.visibilityState === 'visible') bump()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('k2-events-updated', bump)
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  useEffect(() => {
    let active = true
    void readArtworksForContextWithResolvedImages(false, false).then((list) => {
      if (!active || !Array.isArray(list)) return
      const withImage = list.filter((a) => typeof a?.imageUrl === 'string' && a.imageUrl.trim().length > 0)
      setK2Works(withImage)
      const savedLeft = localStorage.getItem(LEFT_WORK_KEY) || ''
      const savedRight = localStorage.getItem(RIGHT_WORK_KEY) || ''
      const leftItem =
        withImage.find((w) => String(w?.number || '') === savedLeft) ||
        withImage[0] ||
        null
      const rightItem =
        withImage.find((w) => String(w?.number || '') === savedRight) ||
        withImage[1] ||
        withImage[0] ||
        null

      if (leftItem?.imageUrl) {
        setLeftSrc(leftItem.imageUrl)
        const n = String(leftItem.number || '')
        setLeftWorkNumber(n)
        setLeftWerkLabel(n ? `Werk links: ${n}` : 'Werk links (K2)')
      }
      if (rightItem?.imageUrl) {
        setRightSrc(rightItem.imageUrl)
        const n = String(rightItem.number || '')
        setRightWorkNumber(n)
        setRightWerkLabel(n ? `Werk rechts: ${n}` : 'Werk rechts (K2)')
      }
    })
    return () => {
      active = false
    }
  }, [])

  const handleFrontUpload = (slot: 'left' | 'middle' | 'right', file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const url = normalizeFileToUrl(file)
    if (slot === 'left') setLeftSrc(url)
    if (slot === 'middle') setMiddleSrc(url)
    if (slot === 'right') setRightSrc(url)
  }

  const handleLeftWorkSelect = (number: string) => {
    setLeftWorkNumber(number)
    localStorage.setItem(LEFT_WORK_KEY, number)
    const item = k2Works.find((w) => String(w?.number || '') === number)
    if (!item?.imageUrl) return
    setLeftSrc(item.imageUrl)
    setLeftWerkLabel(`Werk links: ${number}`)
  }

  const handleRightWorkSelect = (number: string) => {
    setRightWorkNumber(number)
    localStorage.setItem(RIGHT_WORK_KEY, number)
    const item = k2Works.find((w) => String(w?.number || '') === number)
    if (!item?.imageUrl) return
    setRightSrc(item.imageUrl)
    setRightWerkLabel(`Werk rechts: ${number}`)
  }

  const frontCardStandard = (
    <div className={`card front front-variant-${frontVariant}`}>
      <div className="hero hero-standard-event">
        <p className="hero-brand-line">K2 Galerie Kunst&amp;Keramik</p>
        <p className="hero-brand-sub">Martina &amp; Georg Kreinecker</p>
        <h2 className="hero-opening-word">Galerieeröffnung</h2>
      </div>
      <div className="content">
        <div className="front-main">
          <div className="front-3img">
            <div className="img-box img-left">
              <img src={leftSrc} alt="" />
            </div>
            <div className="img-box">
              <img src={middleViewSrc} alt="" />
            </div>
            <div className="img-box">
              <img src={rightSrc} alt="" />
            </div>
          </div>
          <div className="front-text-right">
            <p className="intro-text">
              Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst
              zum Leben erwacht.
            </p>
          </div>
        </div>
        <div className="front-bottom">
          <div className="front-bottom-left">
            {frontQrDataUrl ? <img src={frontQrDataUrl} alt="QR K2 Galerie" className="qr" /> : <div className="qr-placeholder">QR</div>}
            <p className="qr-caption">Zur Galerie online</p>
          </div>
          <div className="front-bottom-right">
            <p className="invite">Herzliche Einladung</p>
            <p className="invite-meta">{eventDateLine}</p>
            <p className="invite-meta invite-address">{base.address} · {base.city}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const frontCardV2 = (
    <div className="card front front-layout-v2">
      <div className="hero hero-v2 hero-v2-event">
        <p className="hero-v2-brand">K2 Galerie Kunst&amp;Keramik</p>
        <p className="hero-v2-names">Martina &amp; Georg Kreinecker</p>
        <h2 className="hero-v2-opening-word">Galerieeröffnung</h2>
      </div>
      <div className="content content-v2">
        <div className="v2-main">
          <div className="v2-img-col">
            <div className="img-box v2-single-img">
              <img src={leftSrc} alt="" />
            </div>
          </div>
          <div className="v2-text-col">
            <p className="v2-intro">{base.intro}</p>
            <div className="v2-invite-panel" role="region" aria-label="Einladung">
              <p className="v2-invite-kicker">Sie sind herzlich eingeladen</p>
              <div className="v2-termin">{terminKomplettV2}</div>
              <p className="v2-address">
                {base.address} · {base.city}
              </p>
              {openingHoursBlock && !eventHasFlyerZeiten(eroeffnungEvent) ? (
                <div className="v2-hours-wrap">
                  <p className="v2-hours-heading">Öffnungszeiten Galerie</p>
                  <div className="v2-hours-body">{openingHoursBlock}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="v2-footer">
          <div className="v2-footer-qr">
            {frontQrDataUrl ? <img src={frontQrDataUrl} alt="" className="qr" /> : <div className="qr-placeholder">QR</div>}
            <p className="qr-caption">Zur Galerie online</p>
          </div>
        </div>
      </div>
    </div>
  )

  const frontCard = page1Layout === 'variant2' ? frontCardV2 : frontCardStandard

  const backCard = (
    <div className="card back back-page-2">
      <div className="back-left">
        <div className="back-hero">
          <h3>K2 Galerie</h3>
          <p className="back-hero-slogan">für Menschen mit Ideen, die gesehen werden wollen.</p>
          <p className="back-hero-power">Deine Ideen verdienen mehr als einen Instagram-Post.</p>
        </div>
        <p className="marketing-sub">ök2 macht Ideen sichtbar: klar, professionell und ohne Umwege.</p>
        <div className="back-left-bottom">
          {backQrDataUrl ? <img src={backQrDataUrl} alt="QR Eingangstor ök2" className="qr" /> : <div className="qr-placeholder">QR</div>}
          <p className="back-qr-invite">Erlebe Ideen, Werke und starke Präsentation in einer modernen Online-Galerie.</p>
        </div>
        <div className="back-copyright">
          <small>{PRODUCT_COPYRIGHT_BRAND_ONLY}</small>
        </div>
      </div>
      <div className="back-right back-right-marketing" role="region" aria-label="Was ist ök2 – Marketingtext">
        {oek2MarketingBlocks.map((block: string, idx: number) => {
          const t = block.trim()
          const isShortQuestion = /^[^\n]{1,120}\?$/.test(t) && !t.includes('\n')
          return isShortQuestion ? (
            <h4 key={`mkt-h-${idx}`} className="back-mkt-heading">
              {t}
            </h4>
          ) : (
            <p key={`mkt-p-${idx}`} className="back-mkt-body">
              {t}
            </p>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className={ROOT}>
      <style>{`
        .${ROOT}{padding:16px;background:#f6f4f0;color:#1c1a18}
        .${ROOT}{
          --k2-green:#0f6f66;
          --k2-green-text:#eaf7f5;
        }
        .${ROOT} .toolbar{display:flex;gap:12px;align-items:center;margin-bottom:12px}
        .${ROOT} .editor{display:grid;gap:8px;max-width:760px;margin-bottom:16px}
        .${ROOT} .sheet{
          width:210mm;
          height:297mm;
          background:#fff;
          box-shadow:0 4px 18px rgba(0,0,0,.12);
          margin:0 auto 16px;
          padding:6mm;
          display:grid;
          grid-template-rows:repeat(2,1fr);
          gap:3mm;
          box-sizing:border-box;
          overflow:hidden;
        }
        .${ROOT} .card{
          border:1px solid #d8d2c9;
          border-radius:2mm;
          overflow:hidden;
          display:grid;
          grid-template-columns:1fr;
          height:100%;
        }
        .${ROOT} .front .hero{background:var(--k2-green);color:var(--k2-green-text);padding:2.8mm 3mm 2.4mm}
        .${ROOT} .front .hero.hero-standard-event{text-align:center}
        .${ROOT} .front .hero.hero-standard-event .hero-brand-line{
          margin:0 auto;
          max-width:22ch;
          font-size:28px;
          font-weight:900;
          letter-spacing:.015em;
          line-height:1.02;
          text-shadow:0 2px 8px rgba(0,0,0,.22);
        }
        .${ROOT} .front .hero.hero-standard-event .hero-brand-sub{
          margin:.35mm auto 0;max-width:28ch;font-size:7.4px;font-weight:620;line-height:1.22;opacity:.92
        }
        .${ROOT} .front .hero.hero-standard-event .hero-opening-word{
          margin:.55mm auto 0;
          max-width:18ch;
          font-size:28px;
          font-weight:900;
          letter-spacing:.015em;
          line-height:1.02;
          text-shadow:0 2px 8px rgba(0,0,0,.22);
        }
        .${ROOT} .front .content{padding:2.8mm 3mm 2.6mm;display:grid;gap:2.2mm}
        .${ROOT} .front .front-main{display:grid;grid-template-columns:62% 38%;gap:2.4mm;align-items:start}
        .${ROOT} .front .front-3img{
          display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;
          background:transparent;border-radius:1.2mm;padding:0;overflow:hidden;height:27.5mm
        }
        .${ROOT} .front .front-3img .img-box{
          position:relative;background:transparent;border-radius:0;overflow:hidden;height:27.5mm
        }
        .${ROOT} .front .front-3img .img-box img{
          width:100%;height:100%;object-fit:cover;object-position:center;background:transparent;transform:none
        }
        .${ROOT} .front .front-text-right{
          background:transparent;border-radius:0;padding:.35mm 0 0;color:#dfe7f4;
          display:grid;gap:.8mm;min-height:27.5mm;align-content:start
        }
        .${ROOT} .front .front-text-right .intro-text{
          margin:0;
          font-size:9.1px;
          line-height:1.42;
          color:#ffffff;
          font-weight:780;
        }
        .${ROOT} .front .front-bottom{display:grid;grid-template-columns:30mm 1fr;gap:2.6mm;align-items:end}
        .${ROOT} .front .front-bottom-left{display:grid;grid-template-columns:12mm 1fr;gap:.9mm;align-items:start}
        .${ROOT} .front .front-bottom-left .qr{width:12mm;height:12mm;object-fit:contain}
        .${ROOT} .front .front-bottom-left .qr-placeholder{width:12mm;height:12mm}
        .${ROOT} .front .front-bottom-left .qr-caption{
          margin:.1mm 0 0;font-size:5.8px;line-height:1.13;font-weight:620;color:#eaf1ff
        }
        .${ROOT} .front .front-bottom-right{
          display:grid;gap:.55mm;justify-content:flex-start;align-content:end;min-height:12mm
        }
        .${ROOT} .front .front-bottom-right .invite{
          margin:0;
          padding:.75mm 1.9mm;
          font-size:8.2px;
          font-weight:900;
          color:var(--k2-green-text);
          background:var(--k2-green);
          border-radius:1mm;
          box-shadow:0 1px 3px rgba(0,0,0,.22);
          letter-spacing:.01em;
        }
        .${ROOT} .front .front-bottom-right .invite-meta{
          margin:0;
          font-size:7.1px;
          line-height:1.24;
          color:#f3f7ff;
          font-weight:700;
        }
        .${ROOT} .front .front-bottom-right .invite-meta.invite-address{
          font-size:14.2px;
          line-height:1.22;
          font-weight:750;
        }
        .${ROOT} .front.front-variant-A .front-main{grid-template-columns:62% 38%}
        .${ROOT} .front.front-variant-A .front-3img{height:27.5mm}
        .${ROOT} .front.front-variant-A .front-3img .img-box{height:27.5mm}
        .${ROOT} .front.front-variant-A .front-text-right .intro-text{font-size:8.1px;line-height:1.36}

        .${ROOT} .front.front-variant-B .front-main{grid-template-columns:60% 40%}
        .${ROOT} .front.front-variant-B .front-3img{height:29mm}
        .${ROOT} .front.front-variant-B .front-3img .img-box{height:29mm}
        .${ROOT} .front.front-variant-B .front-text-right .intro-text{font-size:8.6px;line-height:1.38}
        .${ROOT} .front.front-variant-B .front-bottom-right .invite{
          padding:.85mm 2.1mm;
          font-size:8.6px;
          box-shadow:0 2px 5px rgba(0,0,0,.24);
        }

        .${ROOT} .front.front-layout-v2{
          display:grid;
          grid-template-rows:auto 1fr;
          min-height:0;
        }
        .${ROOT} .front.front-layout-v2 .hero-v2.hero-v2-event{
          padding:2.8mm 3.2mm 2.4mm;
          text-align:center;
        }
        .${ROOT} .front.front-layout-v2 .hero-v2 .hero-v2-brand{
          margin:0;
          font-size:38px;
          font-weight:900;
          letter-spacing:.02em;
          line-height:1.02;
          text-shadow:0 2px 12px rgba(0,0,0,.28);
        }
        .${ROOT} .front.front-layout-v2 .hero-v2 .hero-v2-names{
          margin:.35mm 0 0;font-size:13px;font-weight:680;line-height:1.2;opacity:.94
        }
        .${ROOT} .front.front-layout-v2 .hero-v2 .hero-v2-opening-word{
          margin:.5mm 0 0;
          font-size:38px;
          font-weight:900;
          letter-spacing:.02em;
          line-height:1.02;
          text-shadow:0 2px 12px rgba(0,0,0,.28);
        }
        .${ROOT} .front.front-layout-v2 .content-v2{
          padding:2.4mm 2.8mm 2.2mm;
          display:flex;
          flex-direction:column;
          gap:1.8mm;
          min-height:0;
          flex:1;
          background:#16242f;
        }
        .${ROOT} .front.front-layout-v2 .v2-main{
          display:grid;
          grid-template-columns:34% 1fr;
          gap:2.8mm;
          align-items:start;
          min-height:0;
          flex:1;
        }
        .${ROOT} .front.front-layout-v2 .v2-img-col{min-height:0;display:flex;align-self:stretch}
        .${ROOT} .front.front-layout-v2 .v2-single-img{
          position:relative;
          width:100%;
          flex:1;
          min-height:52mm;
          border-radius:1.2mm;
          overflow:hidden;
          background:#0d1a22;
          border:1px solid rgba(255,255,255,.08);
        }
        .${ROOT} .front.front-layout-v2 .v2-single-img img{width:100%;height:100%;object-fit:cover;display:block}
        .${ROOT} .front.front-layout-v2 .v2-text-col{
          display:flex;
          flex-direction:column;
          gap:1.6mm;
          min-height:0;
          overflow:hidden;
          justify-content:flex-start;
        }
        .${ROOT} .front.front-layout-v2 .v2-intro{
          margin:0;
          padding-bottom:1mm;
          border-bottom:1px solid rgba(255,255,255,.12);
          font-size:17px;
          line-height:1.32;
          color:#f2f7fc;
          font-weight:760;
        }
        .${ROOT} .front.front-layout-v2 .v2-invite-panel{
          background:linear-gradient(145deg, rgba(15,111,102,.98) 0%, rgba(12,85,78,.99) 100%);
          color:var(--k2-green-text);
          border-radius:1.4mm;
          padding:2.2mm 2.5mm;
          box-shadow:0 2px 10px rgba(0,0,0,.35);
          display:grid;
          gap:1.1mm;
          border:1px solid rgba(255,255,255,.22);
        }
        .${ROOT} .front.front-layout-v2 .v2-invite-kicker{
          margin:0;font-size:13px;font-weight:780;letter-spacing:.04em;text-transform:uppercase;opacity:.95
        }
        .${ROOT} .front.front-layout-v2 .v2-termin{
          margin:0;
          font-size:13.5px;
          line-height:1.35;
          font-weight:750;
          white-space:pre-line;
        }
        .${ROOT} .front.front-layout-v2 .v2-address{
          margin:0;font-size:24px;font-weight:750;line-height:1.28;opacity:.98
        }
        .${ROOT} .front.front-layout-v2 .v2-hours-wrap{
          margin-top:.6mm;padding-top:1mm;border-top:1px solid rgba(255,255,255,.28)
        }
        .${ROOT} .front.front-layout-v2 .v2-hours-heading{
          margin:0 0 .4mm;font-size:12.5px;font-weight:900;letter-spacing:.02em
        }
        .${ROOT} .front.front-layout-v2 .v2-hours-body{
          margin:0;font-size:11.5px;line-height:1.38;font-weight:680;white-space:pre-line
        }
        .${ROOT} .front.front-layout-v2 .v2-footer{
          display:flex;
          align-items:center;
          gap:2mm;
          flex-shrink:0;
          padding-top:1mm;
          border-top:1px solid rgba(255,255,255,.1);
        }
        .${ROOT} .front.front-layout-v2 .v2-footer-qr{display:grid;grid-template-columns:14mm 1fr;gap:1mm;align-items:center}
        .${ROOT} .front.front-layout-v2 .v2-footer-qr .qr{width:14mm;height:14mm}
        .${ROOT} .front.front-layout-v2 .v2-footer-qr .qr-placeholder{width:14mm;height:14mm}
        .${ROOT} .front.front-layout-v2 .v2-footer-qr .qr-caption{
          margin:0;font-size:11px;line-height:1.15;font-weight:650;color:#dbe8f5
        }

        .${ROOT} .row{display:grid;grid-template-columns:20mm 1fr;gap:2mm;align-items:center}
        .${ROOT} .qr{width:20mm;height:20mm;object-fit:contain}
        .${ROOT} .qr-placeholder{width:20mm;height:20mm;border:1px dashed #b8b2aa;display:flex;align-items:center;justify-content:center;font-size:7px;color:#6b665f}
        .${ROOT} .row p{margin:0;font-size:7px;line-height:1.3}
        .${ROOT} .back{grid-template-columns:1fr 1fr}
        .${ROOT} .back.back-page-2 .back-left{
          padding:3.5mm;
          gap:3.6mm;
        }
        .${ROOT} .back.back-page-2 .back-left .back-hero{
          gap:1.1mm;
          padding-left:2.2mm;
          border-left-width:1.5mm;
        }
        .${ROOT} .back.back-page-2 .back-left h3{font-size:25.6px;line-height:1.08;letter-spacing:.01em}
        .${ROOT} .back.back-page-2 .back-left .back-hero-slogan{font-size:15.6px;line-height:1.26}
        .${ROOT} .back.back-page-2 .back-left .back-hero-power{font-size:16.4px;line-height:1.28}
        .${ROOT} .back.back-page-2 .back-left .marketing-sub{
          font-size:14.7px;
          line-height:1.36;
          max-width:34ch;
        }
        .${ROOT} .back.back-page-2 .back-left .back-left-bottom{
          gap:2mm;
          padding:1.7mm 1.9mm;
        }
        .${ROOT} .back.back-page-2 .back-left .back-left-bottom .qr,
        .${ROOT} .back.back-page-2 .back-left .back-left-bottom .qr-placeholder{
          width:22mm;
          height:22mm;
        }
        .${ROOT} .back.back-page-2 .back-left .back-left-bottom .back-qr-invite{
          font-size:15.2px;
          line-height:1.32;
        }
        .${ROOT} .back.back-page-2 .back-left .back-copyright small{font-size:12px}
        .${ROOT} .back-right.back-right-marketing{
          display:flex;
          flex-direction:column;
          gap:1.4mm;
          padding:2.4mm 2.2mm;
          background:#fffefb;
          border:1px solid #e8e2d9;
          border-radius:1.2mm;
          overflow:auto;
          align-content:flex-start;
          min-height:0;
        }
        .${ROOT} .back.back-page-2 .back-right-marketing{
          gap:1.8mm;
          padding:3mm 2.6mm;
        }
        .${ROOT} .back-mkt-heading{
          margin:0;
          font-size:10.5px;
          line-height:1.12;
          font-weight:850;
          color:#0f6f66;
          letter-spacing:.015em;
        }
        .${ROOT} .back.back-page-2 .back-mkt-heading{font-size:21px;line-height:1.1}
        .${ROOT} .back-mkt-body{
          margin:0;
          font-size:7.05px;
          line-height:1.38;
          color:#2d2a27;
          white-space:pre-line;
        }
        .${ROOT} .back.back-page-2 .back-mkt-body{font-size:14.1px;line-height:1.34}
        .${ROOT} .back-left{
          padding:3mm;
          background:#faf8f5;
          display:grid;
          grid-template-rows:auto auto 1fr auto;
          gap:2.1mm;
          align-items:start;
        }
        .${ROOT} .back-left h3,.${ROOT} .back-left small{margin:0}
        .${ROOT} .back-left .back-hero{
          display:grid;
          gap:.7mm;
          border-left:1.1mm solid #0f6f66;
          padding-left:1.6mm;
        }
        .${ROOT} .back-left h3{font-size:12.8px;line-height:1.08;color:#1c1a18;letter-spacing:.01em}
        .${ROOT} .back-left .back-hero-slogan{margin:0;font-size:7.8px;line-height:1.24;font-weight:650;color:#2d2a27}
        .${ROOT} .back-left .back-hero-power{margin:0;font-size:8.2px;line-height:1.28;font-weight:800;color:#0f6f66}
        .${ROOT} .back-left .marketing-sub{
          margin:0;
          font-size:7.35px;
          line-height:1.35;
          color:#4f4942;
          max-width:42ch;
        }
        .${ROOT} .back-left .back-left-bottom{
          display:grid;
          gap:1.4mm;
          align-content:center;
          justify-items:center;
          text-align:center;
          height:100%;
          background:#f1ece6;
          border:1px solid #dfd8cf;
          border-radius:1.4mm;
          padding:1.2mm 1.4mm;
        }
        .${ROOT} .back-left .back-left-bottom .qr,
        .${ROOT} .back-left .back-left-bottom .qr-placeholder{
          width:17mm;
          height:17mm;
        }
        .${ROOT} .back-left .back-left-bottom .back-qr-invite{
          margin:0;
          font-size:7.6px;
          line-height:1.3;
          color:#1f1d1b;
          font-weight:760;
        }
        .${ROOT} .back-left .back-copyright{
          width:100%;
          text-align:center;
        }
        .${ROOT} .back-left small{font-size:6px;color:#6a6258}
        @media print{
          /* Zwei Flyer-Nutzen pro A4 mit berechneter Zeilenhöhe */
          .${ROOT}{
            --print-page-h:297mm;
            --print-sheet-padding:3mm;
            --print-row-gap:0.8mm;
            --print-row-height:calc((var(--print-page-h) - (2 * var(--print-sheet-padding)) - (1 * var(--print-row-gap))) / 2);
          }
          @page{size:A4;margin:0}
          html, body{
            margin:0 !important;
            padding:0 !important;
            width:210mm;
            height:var(--print-page-h);
          }
          .${ROOT}, .${ROOT} *{
            -webkit-print-color-adjust:exact !important;
            print-color-adjust:exact !important;
          }
          .${ROOT}{padding:0;background:#fff}
          .${ROOT} .toolbar,.${ROOT} .editor{display:none}
          .${ROOT} .sheet{
            box-shadow:none;
            margin:0;
            width:210mm;
            height:294mm;
            padding:var(--print-sheet-padding);
            display:grid;
            grid-template-rows:repeat(2,var(--print-row-height));
            gap:var(--print-row-gap);
            box-sizing:border-box;
            overflow:hidden;
            page-break-after:always;
            break-after:page;
          }
          .${ROOT} .sheet > div{
            min-height:0;
            height:auto;
            overflow:hidden;
            break-inside:avoid;
          }
          .${ROOT} .sheet .card{
            border-width:.2mm;
            height:100%;
            overflow:hidden;
            min-height:0;
          }
          .${ROOT} .front .hero{padding:2mm 2.2mm 1.8mm}
          .${ROOT} .front .hero.hero-standard-event .hero-brand-line{font-size:19px;line-height:1.02}
          .${ROOT} .front .hero.hero-standard-event .hero-brand-sub{font-size:6.2px}
          .${ROOT} .front .hero.hero-standard-event .hero-opening-word{font-size:19px;margin-top:.35mm;line-height:1.02}
          .${ROOT} .front .content{padding:2mm 2.2mm 1.8mm;gap:1.5mm}
          .${ROOT} .front .front-3img{height:24mm}
          .${ROOT} .front .front-3img .img-box{height:24mm}
          .${ROOT} .front .front-text-right .intro-text{font-size:8.2px;line-height:1.32}
          .${ROOT} .front .front-bottom{gap:1.8mm}
          .${ROOT} .front .front-bottom-right .invite{font-size:7.6px;padding:.55mm 1.4mm}
          .${ROOT} .front .front-bottom-right .invite-meta{font-size:6.1px;line-height:1.18}
          .${ROOT} .front .front-bottom-right .invite-meta.invite-address{font-size:12.2px;line-height:1.2}
          .${ROOT} .front.front-layout-v2 .hero-v2.hero-v2-event{padding:1.6mm 2mm 1.4mm}
          .${ROOT} .front.front-layout-v2 .hero-v2 .hero-v2-brand{font-size:26px;line-height:1.02}
          .${ROOT} .front.front-layout-v2 .hero-v2 .hero-v2-names{font-size:10.5px}
          .${ROOT} .front.front-layout-v2 .hero-v2 .hero-v2-opening-word{font-size:26px;margin-top:.35mm;line-height:1.02}
          .${ROOT} .front.front-layout-v2 .content-v2{padding:1.6mm 2mm 1.4mm;gap:1.2mm}
          .${ROOT} .front.front-layout-v2 .v2-main{gap:1.8mm}
          .${ROOT} .front.front-layout-v2 .v2-single-img{min-height:38mm}
          .${ROOT} .front.front-layout-v2 .v2-text-col{gap:1mm}
          .${ROOT} .front.front-layout-v2 .v2-intro{font-size:13px;line-height:1.28}
          .${ROOT} .front.front-layout-v2 .v2-invite-panel{padding:1.4mm 1.8mm;gap:.75mm}
          .${ROOT} .front.front-layout-v2 .v2-invite-kicker{font-size:9px}
          .${ROOT} .front.front-layout-v2 .v2-termin{font-size:10px;line-height:1.32}
          .${ROOT} .front.front-layout-v2 .v2-address{font-size:18px;line-height:1.28}
          .${ROOT} .front.front-layout-v2 .v2-hours-heading{font-size:10px}
          .${ROOT} .front.front-layout-v2 .v2-hours-body{font-size:9px;line-height:1.3}
          .${ROOT} .front.front-layout-v2 .v2-footer-qr .qr,
          .${ROOT} .front.front-layout-v2 .v2-footer-qr .qr-placeholder{width:11mm;height:11mm}
          .${ROOT} .front.front-layout-v2 .v2-footer-qr .qr-caption{font-size:8.5px}
          /* Print-Norm-Anpassung Seite 2: Inhalte auf feste Nutzenhöhe verdichten */
          .${ROOT} .back-left{
            padding:1.7mm;
            gap:1mm;
            grid-template-rows:auto auto 1fr auto;
          }
          .${ROOT} .back-left .back-hero{gap:.4mm;padding-left:1.2mm;border-left:.8mm solid #0f6f66}
          .${ROOT} .back-left h3{font-size:10.2px;line-height:1.03}
          .${ROOT} .back-left .back-hero-slogan{font-size:6.4px;line-height:1.14}
          .${ROOT} .back-left .back-hero-power{font-size:6.7px;line-height:1.16}
          .${ROOT} .back-left .marketing-sub{font-size:6.05px;line-height:1.18}
          .${ROOT} .back-left .back-left-bottom{
            padding:.6mm .8mm;
            gap:.65mm;
          }
          .${ROOT} .back-left .back-left-bottom .qr,
          .${ROOT} .back-left .back-left-bottom .qr-placeholder{
            width:10.5mm;
            height:10.5mm;
          }
          .${ROOT} .back-left .back-left-bottom .back-qr-invite{
            font-size:5.7px;
            line-height:1.12;
            font-weight:680;
          }
          .${ROOT} .back-left .back-copyright small{font-size:5.1px}
          .${ROOT} .back.back-page-2 .back-left{
            padding:2mm;
            gap:1.5mm;
          }
          .${ROOT} .back.back-page-2 .back-left .back-hero{
            gap:.65mm;
            padding-left:1.5mm;
            border-left-width:1.1mm;
          }
          .${ROOT} .back.back-page-2 .back-left h3{font-size:20.4px;line-height:1.04}
          .${ROOT} .back.back-page-2 .back-left .back-hero-slogan{font-size:12.8px;line-height:1.16}
          .${ROOT} .back.back-page-2 .back-left .back-hero-power{font-size:13.4px;line-height:1.18}
          .${ROOT} .back.back-page-2 .back-left .marketing-sub{font-size:12.1px;line-height:1.2}
          .${ROOT} .back.back-page-2 .back-left .back-left-bottom{
            padding:.85mm 1mm;
            gap:.95mm;
          }
          .${ROOT} .back.back-page-2 .back-left .back-left-bottom .qr,
          .${ROOT} .back.back-page-2 .back-left .back-left-bottom .qr-placeholder{
            width:13.5mm;
            height:13.5mm;
          }
          .${ROOT} .back.back-page-2 .back-left .back-left-bottom .back-qr-invite{
            font-size:11.4px;
            line-height:1.14;
          }
          .${ROOT} .back.back-page-2 .back-left .back-copyright small{font-size:10.2px}
          .${ROOT} .back.back-page-2 .back-right-marketing{
            gap:1.1mm;
            padding:1.7mm 1.6mm;
          }
          .${ROOT} .back.back-page-2 .back-mkt-heading{font-size:21px;line-height:1.1}
          .${ROOT} .back.back-page-2 .back-mkt-body{font-size:14.1px;line-height:1.34}
          .${ROOT} .sheet:last-of-type{
            page-break-after:auto;
            break-after:auto;
          }
        }
      `}</style>

      <div className="toolbar">
        <button type="button" onClick={() => navigate(-1)}>Zurück</button>
        <Link to={PROJECT_ROUTES['k2-galerie'].werbeunterlagen}>Werbeunterlagen</Link>
        <button type="button" onClick={() => window.print()}>Drucken</button>
      </div>

      <div className="editor">
        <label>
          Layout Seite 1 (Vorderseite Bogen)
          <select
            value={page1Layout}
            onChange={(e) => setPage1Layout(e.target.value === 'variant2' ? 'variant2' : 'standard')}
          >
            <option value="standard">Standard – drei Bilder, Satz-Variante A/B</option>
            <option value="variant2">Variante 2 – ein Bild links, große Texte, Einladung &amp; Öffnungszeiten</option>
          </select>
        </label>
        <label>
          Satz-Variante (nur Layout Standard)
          <select
            value={frontVariant}
            disabled={page1Layout === 'variant2'}
            onChange={(e) => setFrontVariant(e.target.value === 'B' ? 'B' : 'A')}
          >
            <option value="A">A - ruhig / klassisch</option>
            <option value="B">B - kräftiger / präsenter</option>
          </select>
        </label>
        <label>
          Bild mitte (nur Layout Standard)
          <input
            type="file"
            accept="image/*"
            disabled={page1Layout === 'variant2'}
            onChange={(e) => handleFrontUpload('middle', e.currentTarget.files?.[0] || null)}
          />
        </label>
        <label>
          Werk links (K2-Auswahl)
          <select value={leftWorkNumber} onChange={(e) => handleLeftWorkSelect(e.target.value)}>
            <option value="">Bitte wählen</option>
            {k2Works.map((w) => (
              <option key={`left-${String(w?.number || '')}`} value={String(w?.number || '')}>
                {String(w?.number || 'Werk')} {w?.title ? `- ${String(w.title)}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Werk rechts (nur Layout Standard)
          <select
            value={rightWorkNumber}
            disabled={page1Layout === 'variant2'}
            onChange={(e) => handleRightWorkSelect(e.target.value)}
          >
            <option value="">Bitte wählen</option>
            {k2Works.map((w) => (
              <option key={`right-${String(w?.number || '')}`} value={String(w?.number || '')}>
                {String(w?.number || 'Werk')} {w?.title ? `- ${String(w.title)}` : ''}
              </option>
            ))}
          </select>
        </label>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#5c5650', maxWidth: '42rem' }}>
          Seite 2 rechts: ausführlicher Erklärungstext zu ök2 – einheitlich mit der Produktbeschreibung gepflegt (eine Quelle im Projekt).
        </p>
        <div style={{ fontSize: '0.8rem', color: '#5c5650' }}>
          Vorschau Werke: {leftWerkLabel} · {rightWerkLabel}
        </div>
      </div>

      <section className="sheet" aria-label="Vorderseite – zwei Flyer pro Seite">
        {SLOTS.map((i) => <div key={`f-${i}`}>{frontCard}</div>)}
      </section>
      <section className="sheet" aria-label="Rückseite – zwei Flyer pro Seite">
        {SLOTS.map((i) => <div key={`b-${i}`}>{backCard}</div>)}
      </section>
    </div>
  )
}
