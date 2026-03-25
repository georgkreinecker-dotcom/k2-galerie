/**
 * Vierer-Bogen A4: doppelseitig drucken, 4 gleiche Flyer pro Seite.
 * Vorderseite: Galerienamen + „Kunst & Keramik“ (K2-Stammdaten), Einladung, Foto, Adresse, QR – keine kgm-Werbeslogans.
 * Rückseite: ök2 Eingangstor – wie /entdecken: Farben aus K2-Design, Tor-Bild (getEntdeckenHeroPathUrl), kgm-Slogans, QR /entdecken.
 */
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import {
  BASE_APP_URL,
  BENUTZER_HANDBUCH_ROUTE,
  OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE,
  PROJECT_ROUTES,
} from '../config/navigation'
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
const TEAL_LIGHT = '#0d9488'
/** Lesbare Serif für Galerie-Titel (ohne Webfont-Request – druckt überall gleich). */
const FONT_SERIF = "Georgia, 'Times New Roman', Times, serif"
const FONT_SANS = "system-ui, -apple-system, 'Segoe UI', sans-serif"

const styles = `
  .${ROOT} { font-family: ${FONT_SANS}; background: linear-gradient(180deg, #f0ebe4 0%, #e5e0d8 100%); padding: 16px; margin: 0; box-sizing: border-box; min-height: 100vh; }
  .${ROOT} * { box-sizing: border-box; }
  .${ROOT} .flyer-vierer-toolbar { max-width: 720px; margin: 0 auto 16px; padding: 0.75rem 0; border-bottom: 1px solid ${TEAL_LIGHT}40; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; font-size: 0.85rem; color: #1c1a18; }
  .${ROOT} .hint-screen { max-width: 720px; margin: 0 auto 20px; padding: 14px 16px; background: #fffefb; border: 1px solid rgba(15,118,110,0.25); border-radius: 10px; color: #1c1a18; font-size: 0.9rem; line-height: 1.5; }
  .${ROOT} .hint-screen h1 { font-size: 1.1rem; margin: 0 0 8px; color: ${TEAL}; }
  .${ROOT} .sheet { width: 210mm; height: 297mm; margin: 0 auto 24px; background: #fff; box-shadow: 0 8px 32px rgba(0,0,0,0.07); display: flex; flex-direction: column; overflow: hidden; }
  .${ROOT} .cell { flex: 1 1 0; min-height: 0; border-bottom: 1px dashed rgba(28,26,24,0.12); display: flex; flex-direction: column; padding: 2.5mm 3.5mm; }
  .${ROOT} .cell:last-child { border-bottom: none; }

  /* —— Vorderseite: editorial, viel Luft, kein „Excel-Kasten“ —— */
  .${ROOT} .cell-front {
    background: #fdfcfa;
    background-image: linear-gradient(180deg, #fffefb 0%, #f7f4ef 100%);
  }
  .${ROOT} .cell-front .front-top {
    display: flex; align-items: stretch; gap: 2.5mm; margin: 0 0 2mm 0; min-height: 0;
  }
  .${ROOT} .cell-front .front-accent { width: 0.9mm; flex-shrink: 0; border-radius: 1mm; background: linear-gradient(180deg, ${TEAL_DARK} 0%, ${TEAL} 100%); }
  .${ROOT} .cell-front .front-head { flex: 1; min-width: 0; text-align: left; padding: 0.5mm 0 0 0; }
  .${ROOT} .cell-front .front-head h2 {
    margin: 0; font-family: ${FONT_SERIF}; font-size: 11pt; font-weight: 700; color: #1a1816; letter-spacing: -0.02em; line-height: 1.12;
  }
  .${ROOT} .cell-front .front-head .tagline {
    margin: 1mm 0 0; font-size: 7.5pt; font-weight: 600; color: ${TEAL_DARK}; letter-spacing: 0.04em; text-transform: uppercase;
  }
  .${ROOT} .cell-front .front-head .sub {
    margin: 0.5mm 0 0; font-size: 6.5pt; color: #5c5650; font-weight: 500;
  }
  .${ROOT} .cell-front .front-main {
    flex: 1; display: flex; gap: 2.5mm; min-height: 0; align-items: stretch;
  }
  .${ROOT} .cell-front .thumb {
    flex: 0 0 38%; max-width: 38%; border-radius: 2mm; overflow: hidden;
    background: #ece6de; box-shadow: inset 0 0 0 1px rgba(28,26,24,0.06);
  }
  .${ROOT} .cell-front .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; min-height: 28mm; }
  .${ROOT} .cell-front .text { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
  .${ROOT} .cell-front .intro {
    margin: 0; font-size: 7pt; line-height: 1.42; color: #2c2825; font-weight: 400;
  }
  .${ROOT} .cell-front .addr {
    margin: 1.5mm 0 0; font-size: 6pt; line-height: 1.4; color: #5c5650;
  }
  .${ROOT} .cell-front .k2qr-row {
    margin-top: 2mm; padding-top: 2mm; border-top: 1px solid rgba(12,92,85,0.12);
    display: flex; align-items: center; gap: 2.5mm; flex-wrap: nowrap;
  }
  .${ROOT} .cell-front .k2qr {
    flex-shrink: 0; width: 17mm; height: 17mm; background: #fff; padding: 0.7mm;
    border-radius: 2mm; border: 1px solid rgba(12,92,85,0.18);
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .${ROOT} .cell-front .k2qr img { width: 100%; height: 100%; display: block; image-rendering: crisp-edges; }
  .${ROOT} .cell-front .k2qr-cap {
    font-size: 5.8pt; color: #3d3835; line-height: 1.3; flex: 1; min-width: 0; font-weight: 500;
  }
  .${ROOT} .cell-front .k2qr-cap .k2qr-cta { font-family: ${FONT_SERIF}; font-size: 6.5pt; color: ${TEAL_DARK}; display: block; margin-bottom: 0.3mm; }
  .${ROOT} .cell-front .foot {
    margin-top: auto; padding-top: 1.2mm; font-size: 4.5pt; color: #8a8278; line-height: 1.35;
    text-align: left; writing-mode: horizontal-tb;
  }

  /* —— Rückseite: ein Bild, ein QR, keine „Tablet-Leiche“ —— */
  .${ROOT} .cell-back {
    color: #f5f2ed; justify-content: flex-start; align-items: stretch; text-align: center;
    padding: 2mm 2.5mm 2.5mm;
  }
  .${ROOT} .cell-back .inner { max-width: 100%; margin: 0 auto; display: flex; flex-direction: column; align-items: center; min-height: 0; flex: 1; }
  .${ROOT} .cell-back .kicker {
    margin: 0; font-size: 5.5pt; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.72); font-weight: 600;
  }
  .${ROOT} .cell-back h3 {
    margin: 0.6mm 0 0; font-family: ${FONT_SERIF}; font-size: 10pt; font-weight: 700; color: #fff; line-height: 1.15;
  }
  .${ROOT} .cell-back .back-claims {
    margin: 1.2mm 2mm 0; padding: 0 1mm;
    font-size: 5.8pt; font-weight: 500; line-height: 1.38; color: rgba(255,255,255,0.92);
    max-height: 14mm; overflow: hidden;
  }
  .${ROOT} .cell-back .back-claims p { margin: 0 0 0.8mm; }
  .${ROOT} .cell-back .back-claims p:last-child { margin-bottom: 0; }
  /* Tor: nur Bild, schmaler Rahmen – kein dunkler Geräterahmen */
  .${ROOT} .cell-back .tor-wrap {
    margin: 1.5mm auto 0; width: 88%; max-width: 52mm; flex-shrink: 0;
    border-radius: 2mm; overflow: hidden;
    box-shadow: 0 2mm 5mm rgba(0,0,0,0.35);
    border: 1px solid rgba(255,255,255,0.12);
  }
  .${ROOT} .cell-back .tor-screen { position: relative; width: 100%; aspect-ratio: 16 / 10; background: #1a1512; }
  .${ROOT} .cell-back .tor-screen img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .${ROOT} .cell-back .tor-screen .tor-grad-l { position: absolute; inset: 0; background: linear-gradient(to right, rgba(12,8,6,0.5) 0%, transparent 50%); pointer-events: none; }
  .${ROOT} .cell-back .tor-screen .tor-grad-t { position: absolute; inset: 0; background: linear-gradient(to top, rgba(12,8,6,0.45) 0%, transparent 45%); pointer-events: none; }
  .${ROOT} .cell-back .qr-block {
    margin: 2mm auto 0; padding: 1.2mm 2mm 1.5mm; background: #fff; border-radius: 2.5mm;
    box-shadow: 0 2px 12px rgba(0,0,0,0.2);
  }
  .${ROOT} .cell-back .qr { width: 18mm; height: 18mm; margin: 0 auto; padding: 0; background: transparent; }
  .${ROOT} .cell-back .qr img { width: 100%; height: 100%; display: block; image-rendering: crisp-edges; }
  .${ROOT} .cell-back .scan { margin: 1mm 0 0; font-size: 5.5pt; color: #3d3835; font-weight: 600; line-height: 1.25; }
  .${ROOT} .cell-back .scan-sub { margin: 0.3mm 0 0; font-size: 4.8pt; color: #6b6560; font-weight: 400; }
  .${ROOT} .cell-back .brand { margin: 1.2mm 0 0; font-size: 4.8pt; color: rgba(255,255,255,0.5); line-height: 1.3; }

  @media print {
    @page { size: A4; margin: 0; }
    .${ROOT} { padding: 0 !important; background: #fff !important; min-height: 0 !important; }
    .${ROOT} .flyer-vierer-toolbar { display: none !important; }
    .${ROOT} .hint-screen { display: none !important; }
    .${ROOT} .sheet { box-shadow: none !important; margin: 0 !important; page-break-after: always; }
    .${ROOT} .sheet:last-of-type { page-break-after: auto; }
    .${ROOT} .cell-front .front-accent { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .${ROOT} .cell-back { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .${ROOT} .cell-back .tor-wrap { box-shadow: none !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .${ROOT} .cell-back .qr-block { box-shadow: none !important; border: 1px solid #ddd; }
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
  const navigate = useNavigate()
  const location = useLocation()
  const { versionTimestamp: qrVersionTs, refetch: refetchQrStand } = useQrVersionTimestamp()

  useEffect(() => {
    refetchQrStand()
  }, [refetchQrStand])

  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo
  const [welcomeThumb, setWelcomeThumb] = useState('')
  const [intro, setIntro] = useState('')
  const [galleryTitle, setGalleryTitle] = useState(() => K2_STAMMDATEN_DEFAULTS.gallery.name)
  const [stammdaten, setStammdaten] = useState(() => loadStammdatenForTenant('k2'))
  const [qrEntdeckenDataUrl, setQrEntdeckenDataUrl] = useState('')
  const [qrK2GalerieDataUrl, setQrK2GalerieDataUrl] = useState('')
  const [torTheme, setTorTheme] = useState(() => ({
    bgDark: '#120a06',
    bgMid: '#1e1008',
    accent: '#b54a1e',
  }))
  const [torHeroUrl, setTorHeroUrl] = useState('/img/oeffentlich/entdecken-hero.jpg')

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
      if (isMounted) {
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
      <div className="flyer-vierer-toolbar">
        {returnTo ? (
          <Link to={returnTo} style={{ color: TEAL_LIGHT, textDecoration: 'none', fontWeight: 500 }}>
            ← Zurück
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: TEAL_LIGHT,
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ← Zurück
          </button>
        )}
        <button
          type="button"
          onClick={() => refetchQrStand()}
          style={{
            padding: '0.4rem 0.75rem',
            background: '#f0fdfa',
            color: TEAL_LIGHT,
            border: `1px solid ${TEAL_LIGHT}60`,
            borderRadius: '6px',
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          QR aktualisieren
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: '0.4rem 0.75rem',
            background: TEAL,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Als PDF drucken
        </button>
        <Link
          to={BENUTZER_HANDBUCH_ROUTE}
          style={{
            padding: '0.4rem 0.75rem',
            background: '#f0fdfa',
            color: TEAL_LIGHT,
            border: `1px solid ${TEAL_LIGHT}60`,
            borderRadius: '6px',
            fontSize: '0.85rem',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Benutzerhandbuch
        </Link>
      </div>
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
            <div className="front-top">
              <div className="front-accent" aria-hidden />
              <div className="front-head">
                <h2>{galleryTitle}</h2>
                <p className="tagline">{K2_TAGLINE}</p>
                <p className="sub">{K2_BAND_SUBTITLE}</p>
              </div>
            </div>
            <div className="front-main">
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
              <div className="k2qr-cap">
                <span className="k2qr-cta">Zur Galerie</span>
                Code scannen – die Galerie online öffnen.
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
              <div className="back-claims">
                <p>{PRODUCT_WERBESLOGAN}</p>
                <p>{PRODUCT_WERBESLOGAN_2}</p>
              </div>
              <div className="tor-wrap">
                <div className="tor-screen">
                  <img src={torHeroUrl} alt="" />
                  <div className="tor-grad-l" />
                  <div className="tor-grad-t" />
                </div>
              </div>
              <div className="qr-block">
                {qrEntdeckenDataUrl ? (
                  <div className="qr">
                    <img src={qrEntdeckenDataUrl} alt="QR-Code ök2 Eingangstor" />
                  </div>
                ) : (
                  <div className="qr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 6, color: '#333', minHeight: 48 }}>
                    QR…
                  </div>
                )}
                <p className="scan">Demo ök2 – hier entlang</p>
                <p className="scan-sub">Code scannen · Eingangstor im Browser</p>
              </div>
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
