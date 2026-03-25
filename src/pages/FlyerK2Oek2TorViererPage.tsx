/**
 * Vierer-Bogen A4: doppelseitig drucken, 4 gleiche Flyer pro Seite.
 * Vorderseite: Galerienamen + „Kunst & Keramik“ (K2-Stammdaten), Einladung, Foto, Adresse, QR – keine kgm-Werbeslogans.
 * Rückseite: ök2 Eingangstor – wie /entdecken: Farben aus K2-Design, Tor-Bild (getEntdeckenHeroPathUrl), kgm-Slogans, QR /entdecken.
 */
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { BASE_APP_URL, OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
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
  TENANT_CONFIGS,
} from '../config/tenantConfig'
import { getEntdeckenColorsFromK2Design, getEntdeckenHeroPathUrl } from '../config/pageContentEntdecken'
import { loadStammdaten } from '../utils/stammdatenStorage'

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
  .${ROOT} .cell-front .band h2 { margin: 0; font-size: 10pt; font-weight: 700; letter-spacing: -0.02em; line-height: 1.15; }
  .${ROOT} .cell-front .band .tagline { margin: 1mm 0 0; font-size: 8pt; font-weight: 700; color: rgba(255,255,255,0.95); }
  .${ROOT} .cell-front .band .sub { margin: 0.6mm 0 0; font-size: 7pt; opacity: 0.95; }
  .${ROOT} .cell-front .body { flex: 1; display: flex; gap: 2mm; font-size: 6.5pt; line-height: 1.35; color: #1c1a18; }
  .${ROOT} .cell-front .body .thumb { flex-shrink: 0; width: 22mm; height: 22mm; border-radius: 4px; overflow: hidden; background: #f0ebe4; }
  .${ROOT} .cell-front .body .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .${ROOT} .cell-front .body .text { flex: 1; min-width: 0; }
  .${ROOT} .cell-front .body .intro { margin: 0 0 1mm; color: #3d3835; }
  .${ROOT} .cell-front .body .addr { margin: 0; color: #5c5650; font-size: 6pt; }
  .${ROOT} .cell-front .k2qr-row { margin-top: 1.5mm; display: flex; align-items: center; gap: 2mm; flex-wrap: nowrap; }
  .${ROOT} .cell-front .k2qr { flex-shrink: 0; width: 18mm; height: 18mm; background: #fff; padding: 0.8mm; border-radius: 3px; border: 1px solid rgba(12,92,85,0.2); }
  .${ROOT} .cell-front .k2qr img { width: 100%; height: 100%; display: block; }
  .${ROOT} .cell-front .k2qr-cap { font-size: 5.5pt; color: #3d3835; line-height: 1.25; flex: 1; min-width: 0; }
  .${ROOT} .cell-front .foot { margin-top: auto; padding-top: 1mm; font-size: 5pt; color: #7a726a; line-height: 1.25; }
  .${ROOT} .cell-back { color: #f0faf9; justify-content: flex-start; align-items: center; text-align: center; padding-top: 1mm; }
  .${ROOT} .cell-back .inner { max-width: 96%; }
  .${ROOT} .cell-back .kicker { margin: 0; font-size: 6pt; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(95,251,241,0.85); }
  .${ROOT} .cell-back h3 { margin: 0.8mm 0 0; font-size: 9pt; font-weight: 700; color: #fff; line-height: 1.2; }
  .${ROOT} .cell-back .back-claim { margin: 0.8mm 0 0; font-size: 6pt; font-weight: 600; line-height: 1.3; color: rgba(255,255,255,0.93); }
  .${ROOT} .cell-back .tor-frame { margin: 1.4mm auto 0; width: 26mm; padding: 1.2mm; border-radius: 3mm; background: linear-gradient(165deg, #3a3d42 0%, #1c1e22 55%, #121418 100%); box-shadow: 0 1mm 2.5mm rgba(0,0,0,0.45), inset 0 0.2mm 0 rgba(255,255,255,0.06); flex-shrink: 0; }
  .${ROOT} .cell-back .tor-screen { position: relative; width: 100%; aspect-ratio: 4 / 3; border-radius: 1.8mm; overflow: hidden; background: #0a0a0c; }
  .${ROOT} .cell-back .tor-screen img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .${ROOT} .cell-back .tor-screen .tor-grad-l { position: absolute; inset: 0; background: linear-gradient(to right, rgba(18,10,6,0.88) 0%, transparent 42%); pointer-events: none; }
  .${ROOT} .cell-back .tor-screen .tor-grad-t { position: absolute; inset: 0; background: linear-gradient(to top, rgba(18,10,6,0.55) 0%, transparent 38%); pointer-events: none; }
  .${ROOT} .cell-back .qr { margin: 1.5mm auto 0; width: 20mm; height: 20mm; background: #fff; padding: 1mm; border-radius: 4px; }
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

const K2_GALERIE_PATH = PROJECT_ROUTES['k2-galerie'].galerie

/** Vorderseite Band: feste Namenszeile (K2). */
const K2_BAND_SUBTITLE = 'Martina & Georg Kreinecker'

const K2_TAGLINE = TENANT_CONFIGS.k2.tagline

export default function FlyerK2Oek2TorViererPage() {
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()
  const [welcomeThumb, setWelcomeThumb] = useState('')
  const [intro, setIntro] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [galleryTitle, setGalleryTitle] = useState(() => K2_STAMMDATEN_DEFAULTS.gallery.name)
  const [stammdaten, setStammdaten] = useState(() => loadStammdatenForTenant('k2'))
  const [qrEntdeckenDataUrl, setQrEntdeckenDataUrl] = useState('')
  const [qrK2GalerieDataUrl, setQrK2GalerieDataUrl] = useState('')

  const entdeckenBustUrl = buildQrUrlWithBust(BASE_APP_URL + OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE, qrVersionTs)
  const k2GalerieBustUrl = buildQrUrlWithBust(BASE_APP_URL + K2_GALERIE_PATH, qrVersionTs)

  useEffect(() => {
    let ok = true
    QRCode.toDataURL(entdeckenBustUrl, { width: 320, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (ok) setQrEntdeckenDataUrl(url)
      })
      .catch(() => {
        if (ok) setQrEntdeckenDataUrl('')
      })
    return () => {
      ok = false
    }
  }, [entdeckenBustUrl])

  useEffect(() => {
    let ok = true
    QRCode.toDataURL(k2GalerieBustUrl, { width: 320, margin: 1, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (ok) setQrK2GalerieDataUrl(url)
      })
      .catch(() => {
        if (ok) setQrK2GalerieDataUrl('')
      })
    return () => {
      ok = false
    }
  }, [k2GalerieBustUrl])

  /** Rückseite: gleiche Farben + Tor-Bild wie /entdecken (Eingangstor). */
  useEffect(() => {
    const c = getEntdeckenColorsFromK2Design()
    setTorTheme({ bgDark: c.bgDark, bgMid: c.bgMid, accent: c.accent })
    setTorHeroUrl(getEntdeckenHeroPathUrl())
  }, [])

  /** Vorderseite immer echte K2-Galerie (Kunst & Keramik), unabhängig von Admin-Kontext (ök2-Tab). */
  useEffect(() => {
    let isMounted = true
    try {
      const raw = localStorage.getItem('k2-stammdaten-galerie')
      const stamm: Record<string, unknown> = {}
      if (raw && raw.length < 6 * 1024 * 1024) Object.assign(stamm, JSON.parse(raw))
      const nameFromStore = typeof stamm.name === 'string' ? stamm.name.trim() : ''
      if (isMounted) setGalleryTitle(nameFromStore || K2_STAMMDATEN_DEFAULTS.gallery.name)
      const images = getGalerieImages(stamm as Record<string, string>, undefined)
      const img = images.welcomeImage
      if (img && typeof img === 'string' && img.length > 50 && img.length < 2 * 1024 * 1024 && isMounted) {
        setWelcomeThumb(img)
      } else if (isMounted) {
        setWelcomeThumb('/img/k2/willkommen.jpg')
      }
    } catch {
      if (isMounted) setWelcomeThumb('/img/k2/willkommen.jpg')
    }

    try {
      const texts = getPageTexts(undefined)
      const g = texts.galerie
      const names = loadStammdatenForTenant('k2')
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

    setStammdaten(loadStammdatenForTenant('k2'))
    return () => {
      isMounted = false
    }
  }, [])

  const addrLine = [stammdaten.address, [stammdaten.city, stammdaten.country].filter(Boolean).join(' ')].filter(Boolean).join(' · ')
  const kontaktKurz = [stammdaten.phone, stammdaten.email].filter(Boolean).join(' · ')

  return (
    <div className={ROOT}>
      <style>{styles}</style>
      <div className="hint-screen no-print">
        <h1>Vierer-Flyer K2 + ök2 Eingangstor</h1>
        <p>
          <strong>Vorderseite:</strong> vier Streifen – <strong>nur echte Galerie</strong> (Name + „{K2_TAGLINE}“ aus K2-Stammdaten),
          Einladungstext, Foto, Adresse, QR zur Galerie. <strong>Ohne</strong> kgm-Werbeslogans (die stehen auf der Rückseite).
          <br />
          <strong>Rückseite:</strong> <strong>ök2 Eingangstor</strong> – wie <code>/entdecken</code> (Farben aus K2-Design, Tor-Bild), kgm-Werbezeilen, QR <code>/entdecken</code>.
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
              <h2>{galleryTitle}</h2>
              <p className="tagline">{K2_TAGLINE}</p>
              <p className="sub">{K2_BAND_SUBTITLE}</p>
            </div>
            <div className="body">
              {welcomeThumb ? (
                <div className="thumb">
                  <img src={welcomeThumb} alt="" />
                </div>
              ) : null}
              <div className="text">
                <p className="intro">{intro}</p>
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
            <div className="k2qr-row">
              {qrK2GalerieDataUrl ? (
                <div className="k2qr">
                  <img src={qrK2GalerieDataUrl} alt="" />
                </div>
              ) : (
                <div className="k2qr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 5, color: '#666' }}>
                  QR…
                </div>
              )}
              <p className="k2qr-cap">
                <strong>Zur Galerie</strong>
                <br />
                Code scannen – K2 Galerie online ({K2_GALERIE_PATH})
              </p>
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
          <div
            key={`b-${i}`}
            className="cell cell-back"
            style={{
              background: `linear-gradient(160deg, ${torTheme.bgDark} 0%, ${torTheme.bgMid} 55%, ${torTheme.accent}22 100%)`,
            }}
          >
            <div className="inner">
              <p className="kicker">ök2</p>
              <h3>Eingangstor</h3>
              <p className="back-claim">{PRODUCT_WERBESLOGAN}</p>
              <p className="back-claim">{PRODUCT_WERBESLOGAN_2}</p>
              <div className="tor-frame">
                <div className="tor-screen">
                  <img src={torHeroUrl} alt="" />
                  <div className="tor-grad-l" />
                  <div className="tor-grad-t" />
                </div>
              </div>
              {qrEntdeckenDataUrl ? (
                <div className="qr">
                  <img src={qrEntdeckenDataUrl} alt="QR-Code ök2 Eingangstor" />
                </div>
              ) : (
                <div className="qr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, color: '#333' }}>
                  QR…
                </div>
              )}
              <p className="scan">Code scannen – {OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE}</p>
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
