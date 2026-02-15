import { useEffect, useState } from 'react'
import { getGalerieImages } from '../config/pageContentGalerie'

const FLYER_CSS = `
  .flyer-k2-page body { margin: 0; padding: 0; box-sizing: border-box; }
  .flyer-k2-page { font-family: 'Source Sans 3', sans-serif; background: #e8e8e8; padding: 20px; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  @media print {
    @page { size: A4; margin: 0; }
    .flyer-k2-page { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0 !important; margin: 0 !important; background: #e8e8e8 !important; }
    .flyer-k2-page .flyer-box { box-shadow: none !important; width: 210mm !important; height: 297mm !important; min-height: 0 !important; }
  }
  .flyer-k2-page .flyer-box { width: 210mm; height: 297mm; max-height: 297mm; background: linear-gradient(165deg, #0f1419 0%, #1a1f3a 45%, #0d1220 100%); color: #fff; padding: 10mm 14mm; box-shadow: 0 20px 60px rgba(0,0,0,0.35); position: relative; overflow: hidden; display: flex; flex-direction: column; }
  .flyer-k2-page .flyer-box::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(102, 126, 234, 0.2), transparent 50%), radial-gradient(ellipse 60% 40% at 85% 100%, rgba(184, 184, 255, 0.12), transparent 45%); pointer-events: none; }
  .flyer-k2-page .content { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 6px; }
  .flyer-k2-page .tagline { font-family: 'Cormorant Garamond', serif; font-size: 12px; letter-spacing: 0.32em; text-transform: uppercase; color: rgba(255,255,255,0.8); margin: 0; }
  .flyer-k2-page h1 { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.1; margin: 0; background: linear-gradient(135deg, #fff 0%, #b8b8ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .flyer-k2-page .subtitle { font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.9); margin: 0; }
  .flyer-k2-page .line { width: 40px; height: 2px; background: linear-gradient(90deg, rgba(184, 184, 255, 0.8), transparent); margin: 0; }
  .flyer-k2-page .welcome-image-wrap { width: 100%; margin: 0; display: flex; align-items: center; justify-content: center; }
  .flyer-k2-page .welcome-image-wrap img { max-width: 100%; max-height: 58mm; height: auto; width: auto; object-fit: contain; display: block; border-radius: 8px; }
  .flyer-k2-page .intro { font-size: 12px; line-height: 1.5; color: rgba(255,255,255,0.9); max-width: 100%; margin: 0; }
  .flyer-k2-page .intro strong { color: #fff; font-weight: 600; }
  .flyer-k2-page .points { list-style: none; margin: 0; padding: 0; }
  .flyer-k2-page .points li { font-size: 11px; line-height: 1.45; color: rgba(255,255,255,0.88); padding-left: 16px; position: relative; margin: 0; }
  .flyer-k2-page .points li::before { content: ''; position: absolute; left: 0; top: 0.5em; width: 5px; height: 5px; background: rgba(184, 184, 255, 0.7); border-radius: 50%; }
  .flyer-k2-page .cta { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 600; color: #b8b8ff; margin: 0; }
  .flyer-k2-page .event-date { font-size: 14px; font-weight: 600; color: #b8b8ff; margin: 0; letter-spacing: 0.02em; }
  .flyer-k2-page .info-kuerze { font-size: 11px; color: rgba(255,255,255,0.78); margin: 0; font-style: italic; }
  .flyer-k2-page .footer { margin: 6px 0 0 0; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.15); font-size: 10px; color: rgba(255,255,255,0.7); letter-spacing: 0.02em; line-height: 1.4; }
  .flyer-k2-page .footer strong { color: rgba(255,255,255,0.9); }
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

export default function FlyerK2GaleriePage() {
  const [welcomeImage, setWelcomeImage] = useState<string>('')
  const [eventDateText, setEventDateText] = useState<string>('')

  useEffect(() => {
    let isMounted = true
    try {
      let stamm: { welcomeImage?: string; galerieCardImage?: string; virtualTourImage?: string } = {}
      const raw = localStorage.getItem('k2-stammdaten-galerie')
      if (raw && raw.length < 6 * 1024 * 1024) {
        stamm = JSON.parse(raw) as typeof stamm
      }
      const images = getGalerieImages(stamm)
      const img = images.welcomeImage
      if (img && typeof img === 'string' && img.length > 50 && img.length < 3 * 1024 * 1024 && isMounted) {
        setWelcomeImage(img)
      }
    } catch (_) {}

    try {
      const eventsRaw = localStorage.getItem('k2-events')
      if (eventsRaw && eventsRaw.length < 500000 && isMounted) {
        const list = JSON.parse(eventsRaw) as any[]
        if (Array.isArray(list)) {
          const eroeffnung = list.find((e: any) => e?.type === 'galerieeröffnung' && e?.date)
          const event = eroeffnung || list.find((e: any) => e?.date)
          if (event?.date && isMounted) {
            const text = formatEventDate(event.date, event.endDate)
            if (text) setEventDateText(text)
          }
        }
      }
    } catch (_) {}
    return () => { isMounted = false }
  }, [])

  return (
    <div className="flyer-k2-page">
      <style>{FLYER_CSS}</style>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Source+Sans+3:wght@300;400;600&display=swap" />
      <div className="flyer-box">
        <div className="content">
          <p className="tagline">Kunst & Keramik</p>
          <h1>K2 Galerie</h1>
          <p className="subtitle">Martina & Georg Kreinecker</p>
          <div className="line" />
          {welcomeImage ? (
            <div className="welcome-image-wrap">
              <img src={welcomeImage} alt="Willkommensbild K2 Galerie" />
            </div>
          ) : null}
          <p className="intro">
            Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von <strong>Malerei und Keramik</strong> in einem Raum, wo Kunst zum Leben erwacht.
          </p>
          <ul className="points">
            <li>Eigene Werke: Malerei von Martina, Keramik von Georg</li>
            <li>Ausstellungen, Verkauf und persönliche Beratung</li>
            <li>Digitale Galerie und Terminvereinbarung</li>
          </ul>
          <p className="cta">Wir freuen uns auf deinen/Ihren Besuch.</p>
          {eventDateText ? <p className="event-date">Termin: {eventDateText}</p> : null}
          <p className="info-kuerze">Weitere Infos erfolgen in Kürze.</p>
          <div className="footer">
            <strong>K2 Galerie</strong> · Schlosserasse 4 · 4070 Eferding · Österreich<br />
            Kontakt: 0664 1046337 · martina.kreinecker@kgm.at · georg.kreinecker@kgm.at
          </div>
        </div>
      </div>
    </div>
  )
}
