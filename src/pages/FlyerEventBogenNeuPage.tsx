import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES } from '../config/navigation'
import { getPageTexts } from '../config/pageTexts'
import { getGalerieImages } from '../config/pageContentGalerie'
import {
  K2_STAMMDATEN_DEFAULTS,
  PRODUCT_BRAND_NAME,
  PRODUCT_COPYRIGHT_BRAND_ONLY,
  PRODUCT_URHEBER_ANWENDUNG,
  PRODUCT_WERBESLOGAN,
  PRODUCT_WERBESLOGAN_2,
} from '../config/tenantConfig'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { readArtworksForContextWithResolvedImages } from '../utils/artworksStorage'
import { loadEvents } from '../utils/eventsStorage'
import { formatEventTerminKomplett } from '../utils/eventTerminFormat'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

const ROOT = 'flyer-event-bogen-neu'
const SLOTS = [1, 2, 3, 4] as const

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

function isAllowedTorFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase()
  if (mime === 'image/jpeg' || mime === 'image/png' || mime === 'image/webp') return true
  const name = (file.name || '').toLowerCase()
  return /\.(jpg|jpeg|png|webp)$/i.test(name)
}

export default function FlyerEventBogenNeuPage() {
  const navigate = useNavigate()
  const { versionTimestamp } = useQrVersionTimestamp()
  const base = getK2Basics()
  const gallery = loadStammdaten('k2', 'gallery')
  const galerieImages = getGalerieImages(gallery)
  const defaultLeft = galerieImages.galerieCardImage || galerieImages.welcomeImage || '/img/k2/willkommen.jpg'
  const defaultMiddle = galerieImages.welcomeImage || '/img/k2/willkommen.jpg'
  const defaultRight = galerieImages.virtualTourImage || galerieImages.welcomeImage || '/img/k2/willkommen.jpg'
  const defaultTor = '/img/k2/tor-rueckseite-k2.png'

  const [leftSrc, setLeftSrc] = useState(defaultLeft)
  const [middleSrc, setMiddleSrc] = useState(defaultMiddle)
  const [rightSrc, setRightSrc] = useState(defaultRight)
  const [torSrc, setTorSrc] = useState(defaultTor)
  const [k2Works, setK2Works] = useState<any[]>([])
  const [leftWorkNumber, setLeftWorkNumber] = useState('')
  const [rightWorkNumber, setRightWorkNumber] = useState('')
  const [leftWerkLabel, setLeftWerkLabel] = useState('Werk links (K2)')
  const [rightWerkLabel, setRightWerkLabel] = useState('Werk rechts (K2)')
  const [torStatus, setTorStatus] = useState('Bereit')
  const [torEvents, setTorEvents] = useState(0)
  const [frontQrDataUrl, setFrontQrDataUrl] = useState('')
  const [backQrDataUrl, setBackQrDataUrl] = useState('')
  const [eventDateLine, setEventDateLine] = useState('Termin folgt')

  const galleryQr = useMemo(
    () => buildQrUrlWithBust(window.location.origin + PROJECT_ROUTES['k2-galerie'].galerie, versionTimestamp),
    [versionTimestamp]
  )
  const k2Qr = useMemo(
    () => buildQrUrlWithBust(window.location.origin + PROJECT_ROUTES['k2-galerie'].galerie, versionTimestamp),
    [versionTimestamp]
  )
  const oek2TorQr = useMemo(
    () => buildQrUrlWithBust(window.location.origin + PROJECT_ROUTES['k2-galerie'].galerieOeffentlich, versionTimestamp),
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
      const line = formatEventTerminKomplett(eroeffnung, { mode: 'long', emptyFallback: 'Termin folgt', withClockEmojiSingle: true })
      if (line) setEventDateLine(line)
    }
  }, [])

  useEffect(() => {
    let active = true
    void readArtworksForContextWithResolvedImages(false, false).then((list) => {
      if (!active || !Array.isArray(list)) return
      const withImage = list.filter((a) => typeof a?.imageUrl === 'string' && a.imageUrl.trim().length > 0)
      setK2Works(withImage)
      if (withImage[0]?.imageUrl) {
        setLeftSrc(withImage[0].imageUrl)
        const n = withImage[0].number || ''
        setLeftWorkNumber(n)
        setLeftWerkLabel(n ? `Werk links: ${n}` : 'Werk links (K2)')
      }
      if (withImage[1]?.imageUrl) {
        setRightSrc(withImage[1].imageUrl)
        const n = withImage[1].number || ''
        setRightWorkNumber(n)
        setRightWerkLabel(n ? `Werk rechts: ${n}` : 'Werk rechts (K2)')
      } else if (withImage[0]?.imageUrl) {
        setRightSrc(withImage[0].imageUrl)
        const n = withImage[0].number || ''
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

  const handleTorUpload = (file: File | null) => {
    if (!file) return
    const ok = isAllowedTorFile(file)
    if (!ok) {
      setTorStatus('Nur JPG/PNG/WEBP erlaubt')
      return
    }
    setTorEvents((v) => v + 1)
    setTorSrc(normalizeFileToUrl(file))
    setTorStatus(`Datei gesetzt: ${file.name || 'Bild'}`)
  }

  const handleLeftWorkSelect = (number: string) => {
    setLeftWorkNumber(number)
    const item = k2Works.find((w) => String(w?.number || '') === number)
    if (!item?.imageUrl) return
    setLeftSrc(item.imageUrl)
    setLeftWerkLabel(`Werk links: ${number}`)
  }

  const handleRightWorkSelect = (number: string) => {
    setRightWorkNumber(number)
    const item = k2Works.find((w) => String(w?.number || '') === number)
    if (!item?.imageUrl) return
    setRightSrc(item.imageUrl)
    setRightWerkLabel(`Werk rechts: ${number}`)
  }

  const frontCard = (
    <div className="card front">
      <div className="hero">
        <h2>{base.galleryName}</h2>
        <p>{PRODUCT_WERBESLOGAN}</p>
        <p>{PRODUCT_WERBESLOGAN_2}</p>
      </div>
      <div className="content">
        <div className="front-3img">
          <img src={leftSrc} alt="" />
          <img src={middleSrc} alt="" />
          <img src={rightSrc} alt="" />
        </div>
        <div className="front-bottom">
          <div className="front-bottom-left">
            {frontQrDataUrl ? <img src={frontQrDataUrl} alt="QR K2 Galerie" className="qr" /> : <div className="qr-placeholder">QR</div>}
          </div>
          <div className="front-bottom-right">
            <p className="invite">Einladung Galerieeröffnung</p>
            <p className="date">{eventDateLine}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const backCard = (
    <div className="card back">
      <div className="back-left">
        <h3>{PRODUCT_BRAND_NAME}</h3>
        <p className="marketing-line">für Menschen mit Ideen, die gesehen werden wollen.</p>
        <p className="marketing-sub">Deine Ideen und Werke verdienen mehr als einen Instagram-Post.</p>
        <div className="back-left-bottom">
          {backQrDataUrl ? <img src={backQrDataUrl} alt="QR Eingangstor ök2" className="qr" /> : <div className="qr-placeholder">QR</div>}
          <small>{PRODUCT_COPYRIGHT_BRAND_ONLY}</small>
          <small>{PRODUCT_URHEBER_ANWENDUNG}</small>
        </div>
      </div>
      <div className="back-right">
        <img src={torSrc} alt="" />
        <div className="back-invite">Einladung Galerieeröffnung</div>
      </div>
    </div>
  )

  return (
    <div className={ROOT}>
      <style>{`
        .${ROOT}{padding:16px;background:#f6f4f0;color:#1c1a18}
        .${ROOT} .toolbar{display:flex;gap:12px;align-items:center;margin-bottom:12px}
        .${ROOT} .editor{display:grid;gap:8px;max-width:760px;margin-bottom:16px}
        .${ROOT} .sheet{width:210mm;height:297mm;background:#fff;box-shadow:0 4px 18px rgba(0,0,0,.12);margin:0 auto 16px;padding:6mm;display:grid;grid-template-rows:repeat(4,1fr);gap:3mm}
        .${ROOT} .card{border:1px solid #d8d2c9;border-radius:2mm;overflow:hidden;display:grid;grid-template-columns:1fr}
        .${ROOT} .front .hero{background:#0c5c55;color:#fff;padding:3mm}
        .${ROOT} .front .hero h2{margin:0;font-size:13px}
        .${ROOT} .front .hero p{margin:0;font-size:9px}
        .${ROOT} .front .content{padding:3mm;display:grid;gap:2mm}
        .${ROOT} .front .content img{width:100%;height:26mm;object-fit:cover;border-radius:1mm}
        .${ROOT} .front .front-3img{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2mm}
        .${ROOT} .front .front-3img img{height:22mm}
        .${ROOT} .front .front-bottom{display:grid;grid-template-columns:20mm 1fr;gap:2mm;align-items:end}
        .${ROOT} .front .front-bottom-right .invite{margin:0;font-size:8px;font-weight:700;color:#0c5c55}
        .${ROOT} .front .front-bottom-right .date{margin:0;font-size:7px;color:#1c1a18}
        .${ROOT} .row{display:grid;grid-template-columns:20mm 1fr;gap:2mm;align-items:center}
        .${ROOT} .qr{width:20mm;height:20mm;object-fit:contain}
        .${ROOT} .qr-placeholder{width:20mm;height:20mm;border:1px dashed #b8b2aa;display:flex;align-items:center;justify-content:center;font-size:7px;color:#6b665f}
        .${ROOT} .row p{margin:0;font-size:7px;line-height:1.3}
        .${ROOT} .back{grid-template-columns:1fr 1fr}
        .${ROOT} .back-left{padding:3mm;background:#faf8f5;display:flex;flex-direction:column;justify-content:space-between}
        .${ROOT} .back-left h3,.${ROOT} .back-left small{margin:0}
        .${ROOT} .back-left h3{font-size:10px}
        .${ROOT} .back-left .marketing-line{margin:0;font-size:7px;line-height:1.35;color:#1c1a18}
        .${ROOT} .back-left .marketing-sub{margin:0;font-size:6.5px;line-height:1.35;color:#5c5650}
        .${ROOT} .back-left .back-left-bottom{display:grid;gap:1mm;align-content:end}
        .${ROOT} .back-left small{font-size:6px}
        .${ROOT} .back-right{position:relative}
        .${ROOT} .back-right img{width:100%;height:100%;object-fit:cover}
        .${ROOT} .back-right .back-invite{
          position:absolute;right:2mm;bottom:2mm;
          background:rgba(12,92,85,.82);color:#fff;
          padding:1mm 1.6mm;border-radius:1mm;
          font-size:6.5px;font-weight:600;line-height:1.2;
        }
        @media print{
          @page{size:A4;margin:6mm}
          .${ROOT}{padding:0;background:#fff}
          .${ROOT} .toolbar,.${ROOT} .editor{display:none}
          .${ROOT} .sheet{box-shadow:none;margin:0 auto 6mm}
        }
      `}</style>

      <div className="toolbar">
        <button type="button" onClick={() => navigate(-1)}>Zurück</button>
        <Link to={PROJECT_ROUTES['k2-galerie'].werbeunterlagen}>Werbeunterlagen</Link>
        <button type="button" onClick={() => window.print()}>Drucken</button>
      </div>

      <div className="editor">
        <label>
          Bild mitte (Seite 1)
          <input type="file" accept="image/*" onChange={(e) => handleFrontUpload('middle', e.currentTarget.files?.[0] || null)} />
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
          Werk rechts (K2-Auswahl)
          <select value={rightWorkNumber} onChange={(e) => handleRightWorkSelect(e.target.value)}>
            <option value="">Bitte wählen</option>
            {k2Works.map((w) => (
              <option key={`right-${String(w?.number || '')}`} value={String(w?.number || '')}>
                {String(w?.number || 'Werk')} {w?.title ? `- ${String(w.title)}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tor-Bild (Seite 2, nur JPG/PNG/WEBP)
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={(e) => handleTorUpload(e.currentTarget.files?.[0] || null)}
          />
        </label>
        <div>Status: {torStatus} · Input-Events: {torEvents} · {leftWerkLabel} · {rightWerkLabel}</div>
      </div>

      <section className="sheet" aria-label="Vorderseite vierfach">
        {SLOTS.map((i) => <div key={`f-${i}`}>{frontCard}</div>)}
      </section>
      <section className="sheet" aria-label="Rückseite vierfach">
        {SLOTS.map((i) => <div key={`b-${i}`}>{backCard}</div>)}
      </section>
    </div>
  )
}
