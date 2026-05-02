/**
 * Marketing ök2 (mök2) – Arbeitsplattform für alles, was mit dem Vertrieb von ök2 zu tun hat.
 * Ideen, Konzepte, Werbeunterlagen; klar strukturiert, bearbeitbar. Ausdruckbar als PDF.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES, AGB_ROUTE, BASE_APP_URL, PILOT_SCHREIBEN_ROUTE, K2_GALERIE_APF_EINSTIEG, OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE, flyerEventBogenUrl, MOK2_ROUTE } from '../config/navigation'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import { mok2Groups } from '../config/mok2Structure'
import {
  PRODUCT_WERBESLOGAN,
  PRODUCT_WERBESLOGAN_2,
  PRODUCT_BOTSCHAFT_2,
  PRODUCT_ZIELGRUPPE,
  PRODUCT_POSITIONING_SOCIAL,
  PRODUCT_KERN_EIGENER_ORT,
  PRODUCT_POSITIONING_SWEET_SPOT,
  PRODUCT_INSERAT_VIERTEL_HAUPT,
  PRODUCT_INSERAT_VIERTEL_UNTER,
  FOCUS_DIRECTIONS,
  PRODUCT_COPYRIGHT_BRAND_ONLY,
  PRODUCT_BRAND_NAME,
  PRODUCT_K2_FAMILIE_WERBESLOGAN,
  PRODUCT_K2_FAMILIE_WERBE_KERN_KOMPAKT,
} from '../config/tenantConfig'
import ProductCopyright from '../components/ProductCopyright'
import { compressImageForStorage } from '../utils/compressImageForStorage'
import { useGamificationChecklistsUi } from '../hooks/useGamificationChecklistsUi'
import { shareInseratViertelPdf } from '../utils/inseratViertelPdf'
import Mok2WerbefahrplanTeaser from '../components/mok2/Mok2WerbefahrplanTeaser'

/** Einheitliche Eröffnungs-URLs (wie in docs/MARKETING-EROEFFNUNG-K2-OEK2.md Abschnitt Links & QR) */
const URL_K2_GALERIE = `${BASE_APP_URL}${PROJECT_ROUTES['k2-galerie'].galerie}`
const URL_MUSTER_EINGANGSTOR = `${BASE_APP_URL}${OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE}`
const URL_VK2 = `${BASE_APP_URL}${PROJECT_ROUTES.vk2.home}`
/** Präsentationsmappe Vollversion – gleiche Einträge wie Werbeunterlagen (Vertrieb) */
const URL_PRAEMAPPE_VOLL_K2 = `${BASE_APP_URL}${PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion}`
const URL_PRAEMAPPE_VOLL_OEK2 = `${BASE_APP_URL}${PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion}?context=oeffentlich`
const URL_PRAEMAPPE_VOLL_VK2 = `${BASE_APP_URL}${PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion}?variant=vk2`
const URL_PRAEMAPPE_VOLL_VK2_PROMO = `${BASE_APP_URL}${PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion}?variant=vk2-promo`

/** Inserat Viertelseite – wie Prospekt/Flyer (Teal), nicht nur Fließtext */
const INSERAT_TEAL_DARK = '#0c5c55'
const INSERAT_TEAL_BAR = '#0d9488'
const INSERAT_VK2_BAR = '#d97706'
const INSERAT_FAMILIE_BAR = '#047857'

const MOK2_SLOGAN_KEY = 'k2-mok2-werbeslogan'
const MOK2_BOTSCHAFT_KEY = 'k2-mok2-botschaft2'
const OEF_WELCOME_KEY = 'k2-oeffentlich-welcomeImage'
const OEF_GALERIE_INNEN_KEY = 'k2-oeffentlich-galerieInnenImage'
const MAX_DATA_URL_LENGTH = 700_000

function getStoredSlogan(): string {
  try {
    const v = localStorage.getItem(MOK2_SLOGAN_KEY)
    if (v && v.trim()) return v.trim()
  } catch (_) {}
  return PRODUCT_WERBESLOGAN
}

function getStoredBotschaft(): string {
  try {
    const v = localStorage.getItem(MOK2_BOTSCHAFT_KEY)
    if (v && v.trim()) return v.trim()
  } catch (_) {}
  return PRODUCT_BOTSCHAFT_2
}

function getStoredOefImage(key: string): string {
  try {
    const v = localStorage.getItem(key)
    return (v && v.trim()) || ''
  } catch (_) {}
  return ''
}

async function compressImageAsDataUrl(file: File): Promise<string> {
  let dataUrl = await compressImageForStorage(file, { context: 'mobile' })
  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    dataUrl = await compressImageForStorage(file, { maxWidth: 600, quality: 0.4 })
  }
  return dataUrl
}

/** Druckbare Kapitelseite – auf Bildschirm kompakt, beim Druck eigene A4-Seite mit Titel */
function Mok2ChapterPage({ title }: { title: string }) {
  return (
    <div
      className="mok2-chapter-page mok2-chapter-page-print"
      style={{
        marginBottom: '1.5rem',
        padding: '1rem 1.25rem',
        background: 'rgba(95,251,241,0.06)',
        border: '1px solid rgba(95,251,241,0.25)',
        borderRadius: 12,
        borderLeftWidth: 4,
      }}
    >
      <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#0d9488', fontWeight: 700 }}>
        {title}
      </h2>
    </div>
  )
}

const printStyles = `
  @media print {
    @page { margin: 12mm; size: A4; }
    .marketing-oek2-no-print { display: none !important; }
    .mok2-chapter-page-print { display: flex !important; flex-direction: column !important; justify-content: center !important; align-items: center !important; min-height: 100vh !important; page-break-after: always !important; padding: 0 !important; margin: 0 !important; background: #fff !important; color: #111 !important; box-sizing: border-box !important; }
    .mok2-chapter-page-print h2 { font-size: 1.4rem !important; margin: 0 !important; color: #0d9488 !important; text-align: center !important; }
    .marketing-oek2-page { padding: 0 2mm !important; max-width: none !important; background: #fff; color: #111; font-size: 9pt; line-height: 1.32; }
    .marketing-oek2-page a { color: #1a0f0a; }
    .marketing-oek2-page section { break-inside: avoid; margin-bottom: 0.5rem !important; margin-top: 0 !important; padding-top: 0 !important; border-top: none !important; }
    .marketing-oek2-page h1 { font-size: 1.15rem; margin: 0 0 0.25rem 0; }
    .marketing-oek2-page h2 { font-size: 0.95rem; margin: 0.4rem 0 0.25rem 0 !important; padding-bottom: 0.15rem !important; border-bottom-width: 1px !important; }
    .marketing-oek2-page h3 { font-size: 0.85rem; margin: 0.35rem 0 0.2rem 0 !important; }
    .marketing-oek2-page p { margin: 0.2rem 0 !important; line-height: 1.3 !important; font-size: 8.5pt; }
    .marketing-oek2-page ul, .marketing-oek2-page ol { margin: 0.15rem 0 !important; padding-left: 1.1em !important; line-height: 1.28 !important; font-size: 8.5pt; }
    .marketing-oek2-page li { margin-bottom: 0.08rem; }
    .marketing-oek2-page td, .marketing-oek2-page th { padding: 0.15rem 0.35rem !important; font-size: 8pt; }
    .marketing-oek2-page table { margin-bottom: 0.4rem !important; }
    .marketing-oek2-page [style*="padding: 0.75rem"], .marketing-oek2-page [style*="padding: 1rem"] { padding: 0.25rem 0.4rem !important; margin-top: 0.15rem !important; margin-bottom: 0.15rem !important; font-size: 8pt !important; line-height: 1.25 !important; }
    .marketing-oek2-page [style*="gridTemplateColumns"] { gap: 0.35rem !important; }
    .marketing-oek2-page [style*="gridTemplateColumns"] > div { padding: 0.3rem 0.4rem !important; }
    .marketing-oek2-page .mok2-inserat-block { background: #f8f6f2 !important; color: #1a1a1a !important; border: 1px solid #c4c2bd !important; }
    .marketing-oek2-page .mok2-inserat-block h3 { color: #0d4f4a !important; }
    .marketing-oek2-page .mok2-inserat-block pre { color: #1a1a1a !important; font-size: 8pt !important; }
    .marketing-oek2-page .mok2-inserat-viertel {
      width: 96mm !important;
      height: 129mm !important;
      max-width: none !important;
      aspect-ratio: auto !important;
      margin: 3mm auto !important;
      border-radius: 10px !important;
      overflow: hidden !important;
      box-shadow: none !important;
      border: 3px solid #1c1a18 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .marketing-oek2-page .mok2-inserat-viertel-qr img {
      width: 20mm !important;
      height: 20mm !important;
      max-width: none !important;
      padding: 0.85mm !important;
      border: 2px solid #2a2622 !important;
      border-radius: 3px !important;
    }
    /* Inserat: innere Linien für Zeitungsdruck (helle 1px-Ränder gehen auf Papier oft verloren) */
    #mok2-inserat-print-root .mok2-inserat-hero-k2head {
      border-bottom: 2px solid #0a2f2c !important;
      box-shadow: none !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #mok2-inserat-print-root .mok2-inserat-hero-copy {
      border-left: 2.5px solid #0c5c55 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #mok2-inserat-print-root .mok2-inserat-line-slogan {
      border-top: 2.5px solid #0c4a44 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #mok2-inserat-print-root .mok2-inserat-products-wrap {
      border-top: 2.5px solid #0c4a44 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #mok2-inserat-print-root .mok2-inserat-product-card {
      border: 1.75px solid #1c1a18 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #mok2-inserat-print-root .mok2-inserat-line-footer {
      border-top: 2.5px solid #0c4a44 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #mok2-inserat-print-root .mok2-inserat-line-copy {
      border-top: 1.5px solid #5c5650 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #mok2-inserat-print-root .mok2-inserat-line-qr-hint {
      border-top: 1px solid rgba(92, 86, 80, 0.35) !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #mok2-inserat-print-root .mok2-inserat-viertel-qr {
      border: 2.5px solid #0c3d38 !important;
      box-shadow: none !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    /* Nur Inserat: display:none statt visibility – sonst behalten versteckte Blöcke ihre Höhe → viele leere Safari-Seiten. */
    html.mok2-print-inserat-only body *:not(:has(#mok2-inserat-print-root)):not(#mok2-inserat-print-root):not(#mok2-inserat-print-root *) {
      display: none !important;
    }
    html.mok2-print-inserat-only #mok2-inserat-print-root {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      margin: 0 !important;
      border-radius: 10px !important;
      overflow: hidden !important;
      border: 3px solid #1c1a18 !important;
      box-shadow: none !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html.mok2-print-inserat-only .marketing-oek2-page {
      background: #fff !important;
      padding: 0 !important;
      margin: 0 !important;
      max-width: none !important;
      min-height: 0 !important;
    }
  }
`

interface MarketingOek2PageProps {
  /** Im Mok2Layout eingebettet → kein eigener Header/Struktur-Box (Leiste + Panel der APf übernehmen) */
  embeddedInMok2Layout?: boolean
}

export default function MarketingOek2Page({ embeddedInMok2Layout }: MarketingOek2PageProps) {
  const location = useLocation()
  const { showChecklists: showGamificationChecklists } = useGamificationChecklistsUi()
  const [slogan, setSlogan] = useState(getStoredSlogan)
  const [botschaft, setBotschaft] = useState(getStoredBotschaft)
  const [oefWelcome, setOefWelcome] = useState(getStoredOefImage(OEF_WELCOME_KEY))
  const [oefGalerieInnen, setOefGalerieInnen] = useState(getStoredOefImage(OEF_GALERIE_INNEN_KEY))
  const [dropTarget, setDropTarget] = useState<'welcome' | 'innen' | null>(null)
  const [oefSaving, setOefSaving] = useState(false)
  useEffect(() => {
    if (location.pathname === PROJECT_ROUTES['k2-galerie'].marketingOek2) {
      setSlogan(getStoredSlogan())
      setBotschaft(getStoredBotschaft())
      setOefWelcome(getStoredOefImage(OEF_WELCOME_KEY))
      setOefGalerieInnen(getStoredOefImage(OEF_GALERIE_INNEN_KEY))
    }
  }, [location.pathname])

  /** Hash aus Sidebar/Link (#mok2-10-…) zuverlässig scrollen (Router rendert zuerst, dann Ziel-Element). */
  useEffect(() => {
    const marketingPath = PROJECT_ROUTES['k2-galerie'].marketingOek2
    if (location.pathname !== marketingPath) return
    const raw = location.hash?.replace(/^#/, '').trim()
    if (!raw) return
    const t = window.setTimeout(() => {
      const el = document.getElementById(raw)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 200)
    return () => clearTimeout(t)
  }, [location.pathname, location.hash])

  /** Eine URL, eine Seite: nur Schreiben an Michael (Begleitschreiben + Einstiegscodes). Alle QR/Links „für Michael“ zeigen darauf – nie auf die Galerie. */
  const pilotSchreibenAufHandyUrl = BASE_APP_URL + PILOT_SCHREIBEN_ROUTE
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()
  const urlK2GalerieLive = buildQrUrlWithBust(URL_K2_GALERIE, qrVersionTs)
  const urlMusterEingangstorLive = buildQrUrlWithBust(URL_MUSTER_EINGANGSTOR, qrVersionTs)
  const urlVk2Live = buildQrUrlWithBust(URL_VK2, qrVersionTs)
  const urlPraemappeVollK2Live = buildQrUrlWithBust(URL_PRAEMAPPE_VOLL_K2, qrVersionTs)
  const urlPraemappeVollOek2Live = buildQrUrlWithBust(URL_PRAEMAPPE_VOLL_OEK2, qrVersionTs)
  const urlPraemappeVollVk2Live = buildQrUrlWithBust(URL_PRAEMAPPE_VOLL_VK2, qrVersionTs)
  const urlPraemappeVollVk2PromoLive = buildQrUrlWithBust(URL_PRAEMAPPE_VOLL_VK2_PROMO, qrVersionTs)
  /** Kompass + Kampagne: volle URLs für PDF/Druck und Weiterleitung (Mail, Messenger) */
  const urlTexteBriefeKompass = `${BASE_APP_URL}/k2team-handbuch?doc=24-TEXTE-BRIEFE-KOMPASS.md`
  const urlKampagneMarketingStrategieLive = `${BASE_APP_URL}${PROJECT_ROUTES['k2-galerie'].kampagneMarketingStrategie}`
  const [pilotHandyLinkQrUrl, setPilotHandyLinkQrUrl] = useState('')
  useEffect(() => {
    if (!pilotSchreibenAufHandyUrl.startsWith('http')) return
    let cancelled = false
    const urlFuerQr = buildQrUrlWithBust(pilotSchreibenAufHandyUrl, qrVersionTs)
    QRCode.toDataURL(urlFuerQr, { width: 200, margin: 1 })
      .then((url) => { if (!cancelled) setPilotHandyLinkQrUrl(url) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [pilotSchreibenAufHandyUrl, qrVersionTs])

  /** QR fürs Lokalzeitungs-Inserat: Eingangstor /entdecken, Server-Stand + Bust (wie Galerie-QR-Regel). */
  const [inseratEingangstorQrUrl, setInseratEingangstorQrUrl] = useState('')
  useEffect(() => {
    if (!URL_MUSTER_EINGANGSTOR.startsWith('http')) return
    let cancelled = false
    const urlFuerQr = buildQrUrlWithBust(URL_MUSTER_EINGANGSTOR, qrVersionTs)
    QRCode.toDataURL(urlFuerQr, { width: 400, margin: 1, color: { dark: '#1a1a1a', light: '#ffffff' } })
      .then((url) => { if (!cancelled) setInseratEingangstorQrUrl(url) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [qrVersionTs])

  /** Presse-Nachbericht: QR unter den Links (Galerie, Eingangstor, Präsentationsmappen Vollversion), dieselbe URL wie der Link (Server-Stand + Bust). */
  type PresseNachberichtQrKey = 'galerie' | 'eingang' | 'mapK2' | 'mapOek2' | 'mapVk2' | 'mapVk2Promo'
  const [presseNachberichtQr, setPresseNachberichtQr] = useState<Partial<Record<PresseNachberichtQrKey, string>>>({})
  useEffect(() => {
    const pairs: [PresseNachberichtQrKey, string][] = [
      ['galerie', URL_K2_GALERIE],
      ['eingang', URL_MUSTER_EINGANGSTOR],
      ['mapK2', URL_PRAEMAPPE_VOLL_K2],
      ['mapOek2', URL_PRAEMAPPE_VOLL_OEK2],
      ['mapVk2', URL_PRAEMAPPE_VOLL_VK2],
      ['mapVk2Promo', URL_PRAEMAPPE_VOLL_VK2_PROMO],
    ]
    if (!pairs.every(([, u]) => u.startsWith('http'))) return
    let cancelled = false
    const opts = { width: 168, margin: 1, color: { dark: '#1a1a1a', light: '#ffffff' } } as const
    Promise.all(pairs.map(([, base]) => QRCode.toDataURL(buildQrUrlWithBust(base, qrVersionTs), opts)))
      .then((dataUrls) => {
        if (cancelled) return
        const next: Partial<Record<PresseNachberichtQrKey, string>> = {}
        pairs.forEach(([k], i) => {
          next[k] = dataUrls[i]
        })
        setPresseNachberichtQr(next)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [qrVersionTs])

  const saveOefImage = async (key: 'welcome' | 'innen', file: File) => {
    setOefSaving(true)
    try {
      const dataUrl = await compressImageAsDataUrl(file)
      const storageKey = key === 'welcome' ? OEF_WELCOME_KEY : OEF_GALERIE_INNEN_KEY
      localStorage.setItem(storageKey, dataUrl)
      if (key === 'welcome') setOefWelcome(dataUrl)
      else setOefGalerieInnen(dataUrl)
      window.dispatchEvent(new Event('k2-oeffentlich-images-updated'))
    } catch (_) {}
    setDropTarget(null)
    setOefSaving(false)
  }

  const clearOefImage = (key: 'welcome' | 'innen') => {
    const storageKey = key === 'welcome' ? OEF_WELCOME_KEY : OEF_GALERIE_INNEN_KEY
    try {
      localStorage.removeItem(storageKey)
      if (key === 'welcome') setOefWelcome('')
      else setOefGalerieInnen('')
      window.dispatchEvent(new Event('k2-oeffentlich-images-updated'))
    } catch (_) {}
  }

  const handleDrop = (e: React.DragEvent, key: 'welcome' | 'innen') => {
    e.preventDefault()
    setDropTarget(null)
    const file = e.dataTransfer?.files?.[0]
    if (file && file.type.startsWith('image/')) saveOefImage(key, file)
  }

  const handleFileSelect = (key: 'welcome' | 'innen', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) saveOefImage(key, file)
    e.target.value = ''
  }

  const handlePrint = () => window.print()

  const inseratViertelRef = useRef<HTMLDivElement>(null)
  const [inseratHinweis, setInseratHinweis] = useState<string | null>(null)
  const blinkInseratHinweis = useCallback((msg: string) => {
    setInseratHinweis(msg)
    window.setTimeout(() => setInseratHinweis(null), 4500)
  }, [])

  const handlePrintInseratOnly = useCallback(() => {
    const pageStyle = document.createElement('style')
    pageStyle.id = 'mok2-inserat-print-page-size'
    pageStyle.textContent = '@media print { @page { size: 96mm 129mm; margin: 0; } }'
    document.head.appendChild(pageStyle)
    document.documentElement.classList.add('mok2-print-inserat-only')
    let cleaned = false
    const cleanup = () => {
      if (cleaned) return
      cleaned = true
      document.documentElement.classList.remove('mok2-print-inserat-only')
      document.getElementById('mok2-inserat-print-page-size')?.remove()
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)
    window.print()
    window.setTimeout(cleanup, 4000)
  }, [])

  const handleInseratPdfShare = useCallback(async () => {
    blinkInseratHinweis('PDF wird erstellt …')
    const r = await shareInseratViertelPdf(inseratViertelRef.current)
    if (r === 'shared') blinkInseratHinweis('Geteilt (System-Dialog).')
    else if (r === 'downloaded') blinkInseratHinweis('PDF im Download-Ordner gespeichert.')
    else if (r === 'cancelled') blinkInseratHinweis('Abgebrochen.')
    else blinkInseratHinweis('PDF nicht möglich – bitte „Nur Inserat drucken“ oder Screenshot.')
  }, [blinkInseratHinweis])

  const handleCopyInseratLink = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}#mok2-inserat-lokalzeitung`
    try {
      await navigator.clipboard.writeText(url)
      blinkInseratHinweis('Link kopiert.')
    } catch {
      blinkInseratHinweis(url)
    }
  }, [blinkInseratHinweis])

  const handleMailtoInserat = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}#mok2-inserat-lokalzeitung`
    const subject = 'Anzeige K2 / kgm solution – Viertelseite'
    const body = `Guten Tag,\n\nVorschau-Link zum Inserat (96 × 129 mm):\n${url}\n\nQR-Ziel Eingangstor (Demo):\n${urlMusterEingangstorLive}\n\nMit freundlichen Grüßen`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }, [urlMusterEingangstorLive])

  return (
    <article
      className="marketing-oek2-page"
      style={{
        maxWidth: '800px',
        margin: embeddedInMok2Layout ? 0 : '0 auto',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        background: 'var(--k2-bg-1, #1a0f0a)',
        color: 'var(--k2-text, #fff5f0)',
        minHeight: embeddedInMok2Layout ? 'auto' : '100vh',
      }}
    >
      <style>{printStyles}</style>

      {!embeddedInMok2Layout && (
      <header className="marketing-oek2-no-print" style={{ marginBottom: '2rem' }}>
        <Link
          to={K2_GALERIE_APF_EINSTIEG}
          style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}
        >
          ← Projekt-Start
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: 0 }}>Marketing ök2 <span style={{ fontSize: '0.75em', fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>(mök2)</span></h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', maxWidth: '520px' }}>
              Arbeitsplattform für den Vertrieb von ök2 – mit Fokus auf <strong style={{ color: 'rgba(255,255,255,0.88)' }}>Mein Weg</strong> und die <strong style={{ color: 'rgba(255,255,255,0.88)' }}>sechs Sparten</strong> (eine Liste, eine Demo-Story, ein Gesprächsleitfaden).
            </p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '1rem', color: '#5ffbf1', fontStyle: 'italic', maxWidth: '520px' }}>
              {slogan}
            </p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', maxWidth: '520px' }}>
              2. {botschaft}
            </p>
            {showGamificationChecklists && (
              <p
                style={{
                  margin: '0.75rem 0 0',
                  fontSize: '0.82rem',
                  color: 'rgba(255,255,255,0.72)',
                  lineHeight: 1.55,
                  borderLeft: '3px solid rgba(95,251,241,0.45)',
                  paddingLeft: '0.75rem',
                  maxWidth: '520px',
                }}
              >
                <strong style={{ color: 'rgba(255,255,255,0.92)' }}>Pilot:innen:</strong> In der Demo-App gibt es kleine Lesepfade zur Orientierung (z.&nbsp;B. Fortschritt in Bereichen) – das ist keine Spielmechanik und keine Punkte.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            📄 Als PDF drucken
          </button>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
          Vertrieb von ök2: Ideen, Konzepte, Werbeunterlagen – im Browser „Als PDF drucken“ wählen oder drucken. <strong>Seitenformat: A4.</strong> Jedes Kapitel druckt mit eigener Titelseite (Kern, Vertrieb, Bewertung & Lizenzen, Konzepte, Praktisch).
        </p>

        {/* Sichtbare Struktur – alle Sektionen auf einen Blick, mit Sprunglinks */}
        <div className="marketing-oek2-no-print" style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(95,251,241,0.08)', border: '1px solid rgba(95,251,241,0.35)', borderRadius: '10px' }}>
          <h3 style={{ fontSize: '1rem', margin: '0 0 0.75rem', color: '#5ffbf1', fontWeight: 600 }}>📋 Struktur der mök2</h3>
          <ol style={{ margin: 0, paddingLeft: '1.35rem', lineHeight: 1.9, color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem' }}>
            <li><a href="#mok2-leitvision-k2-markt" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Leitvision – Mein Weg &amp; sechs Sparten</strong> (Vertrieb &amp; Demo)</a></li>
            <li><a href="#mok2-was-kann-die-app" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Was kann die App?</strong> (ök2 | VK2 – kurz)</a></li>
            <li><a href="#mok2-prospekt" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>K2 Galerie Prospekt</strong> (funktional & technisch, druckbar)</a></li>
            <li>
              <Link
                to={PROJECT_ROUTES['k2-familie'].familiePraesentationsmappeKunde}
                state={{ returnTo: PROJECT_ROUTES['k2-galerie'].marketingOek2 }}
                style={{ color: '#5ffbf1', textDecoration: 'none' }}
              >
                <strong>K2 Familie – Präsentationsmappe (Kunde)</strong> (eigener Link, zum Übergeben)
              </Link>
            </li>
            <li>
              <Link
                to={PROJECT_ROUTES['k2-familie'].familiePraesentationsmappe}
                state={{ returnTo: PROJECT_ROUTES['k2-galerie'].marketingOek2 }}
                style={{ color: '#5ffbf1', textDecoration: 'none' }}
              >
                <strong>K2 Familie – Vertriebsunterlagen</strong> (intern)
              </Link>
            </li>
            <li><a href="#mok2-prospekt-galerieeroeffnung" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Prospekt Galerieeröffnung K2</strong> (Kunst und Keramik, 1 Seite)</a></li>
            <li><a href="#mok2-verkauf-map-drei-ebenen" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Präsentationsmappe</strong> (Entscheidungshilfe: A4, USP, Prospekt)</a></li>
            <li><a href="#mok2-1" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>USPs</strong> (Unique Selling Points)</a></li>
            <li><a href="#mok2-produkt-branchenvergleich" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Produkt- &amp; Branchenvergleich</strong> (Vorteile im Vergleich)</a></li>
            <li><a href="#mok2-2" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Marktchancen – Stärken</strong></a></li>
            <li><a href="#mok2-3" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Marktchancen – Herausforderungen</strong></a></li>
            <li><a href="#mok2-4" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Fazit & nächste Schritte</strong></a></li>
            <li><a href="#mok2-maerkte-kunst-fokus" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Märkte Kunst-Fokus</strong> (Feature-Kombination)</a></li>
            <li><a href="#mok2-maerkte-ohne-kunst" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Chancen ohne Kunst</strong> (dieselbe Technik)</a></li>
            <li><a href="#mok2-sweet-spot" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Positionierung Sweet-Spot</strong> (Öffentlichkeitsarbeit)</a></li>
            <li><a href="#mok2-5" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Weitere Ideen & Konzepte</strong></a></li>
            <li><a href="#mok2-6" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Empfehlungs-Programm</strong> (Vertrieb durch Nutzer:innen)</a></li>
            <li><a href="#mok2-7" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Promotion für alle Medien</strong></a></li>
            <li><a href="#mok2-8" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>APf-Struktur:</strong> Marketingarbeit organisieren</a></li>
            <li><a href="#mok2-9" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Werbeunterlagen</strong> (bearbeitbar)</a></li>
            <li><a href="#mok2-10" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>10. Lizenzen</strong> (Konditionen & Vergebung)</a></li>
            <li><a href="#mok2-10-lizenz-abschliessen" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Lizenz abschließen</strong> (Online, Pilot, VK2)</a></li>
            <li><Link to={PROJECT_ROUTES['k2-galerie'].licences} style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Lizenzen verwalten</strong> (APf-Seite)</Link></li>
            <li><a href="#mok2-lizenz-pakete-aussen" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Lizenz-Pakete für Außen</strong> (Werbung, Pitch, Flyer)</a></li>
            <li><a href="#mok2-10c-haupt-neben-lizenz" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Haupt- und Nebenlizenzen</strong> (Konzept)</a></li>
            <li><a href="#mok2-10b-vk2-lizenz" style={{ color: 'var(--k2-accent)', textDecoration: 'none' }}><strong>Lizenzstruktur VK2</strong> (Vereinsplattform)</a></li>
            <li><Link to={PROJECT_ROUTES['k2-galerie'].empfehlungstool} style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Empfehlungstool</strong> (ID + Empfehlungstext an Freund:innen)</Link></li>
            <li><Link to={OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE} style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Eingangstor</strong> (Zugangsbereich, Demo-Einstieg)</Link></li>
            <li><Link to={AGB_ROUTE} state={{ returnTo: location.pathname }} style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>AGB</strong> (Allgemeine Geschäftsbedingungen)</Link></li>
            <li><Link to={PROJECT_ROUTES['k2-galerie'].softwareentwicklung} style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>11. K2 Softwareentwicklung</strong> (Sicherheit, Vor Veröffentlichung, Auth, RLS)</Link></li>
            <li><a href="#mok2-12" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>12. Musterbilder für die ök2-Galerie</strong> (zum Einfügen)</a></li>
            <li><a href="#mok2-13" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>13. Werkkatalog &amp; Werkkarte</strong> – USP &amp; Verkaufsargumente</a></li>
          </ol>
        </div>
      </header>
      )}

      {embeddedInMok2Layout && (
        <div className="marketing-oek2-no-print" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(95,251,241,0.25)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#5ffbf1' }}>Marketing ök2 (mök2)</h2>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }}>{slogan}</p>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>2. {botschaft}</p>
          {showGamificationChecklists && (
            <p
              style={{
                margin: '0.75rem 0 0',
                fontSize: '0.82rem',
                color: 'rgba(255,255,255,0.72)',
                lineHeight: 1.55,
                borderLeft: '3px solid rgba(95,251,241,0.45)',
                paddingLeft: '0.75rem',
              }}
            >
              <strong style={{ color: 'rgba(255,255,255,0.92)' }}>Pilot:innen:</strong> In der Demo-App gibt es kleine Lesepfade zur Orientierung (z.&nbsp;B. Fortschritt in Bereichen) – das ist keine Spielmechanik und keine Punkte.
            </p>
          )}
        </div>
      )}

      {/* Kapitel: Kern – Überblick & Stärken */}
      <Mok2ChapterPage title={mok2Groups[0].chapterTitle} />
      {/* Leitvision K2 Markt – kreative Leitvision (eine Stelle, ausrichtend) */}
      <section id="mok2-leitvision-k2-markt" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Leitvision: Mein Weg &amp; sechs Sparten
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
          <strong>Vertrieb ök2 erzählt zuerst die Sparten-Story:</strong> In der Demo und in der Lizenz wählt der Kunde in den Stammdaten <strong>Mein Weg</strong> – eine von sechs klar benannten Sparten. Daraus folgen Werktyp, Kategorien, Galerie-Filter und viele Texte. <strong>Eine Plattform</strong>, keine sechs verschiedenen Produkte – das ist unser wiedererkennbares Angebot.
        </p>
        <p style={{ marginBottom: '0.65rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>
          Die sechs Sparten (Anzeigenamen = Gesprächs- und Flyer-Vokabular, technische IDs in Klammer nur für Team/Doku):
        </p>
        <ul style={{ margin: '0 0 1rem', paddingLeft: '1.25em', lineHeight: 1.55, fontSize: '0.9rem', color: 'rgba(255,255,255,0.92)' }}>
          {FOCUS_DIRECTIONS.map((d) => (
            <li key={d.id}>
              <strong style={{ color: '#5ffbf1' }}>{d.label}</strong>
            </li>
          ))}
        </ul>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
          <strong>Dazu die Leitvision vom Schreibtisch aus:</strong> Ich will heute K2, ök2 oder ein anderes Projekt (z.&nbsp;B. K2 Familie) auf den Markt bringen – hier liegt alles, was dafür brauchbar ist. Fehlen Bilder, Videos oder Texte: im Werkzeugkasten gibt es das Studio zum professionellen Nachziehen.
        </p>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
          Sparten-Liste = eine Quelle: <code style={{ fontSize: '0.75rem' }}>FOCUS_DIRECTIONS</code> in tenantConfig. Leitvision Georg 09.03.26, Sparten-Fokus mök2 21.03.26.
        </p>
      </section>
      {/* 0. Was kann die App? – ganz kurz für Interessenten (ök2 | VK2) */}
      <section id="mok2-was-kann-die-app" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Was kann die App? Was bringt mir das?
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
          Drei Produkte unter einem Dach – auf einen Blick:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem 1.1rem', background: 'rgba(95,251,241,0.08)', border: '1px solid rgba(95,251,241,0.35)', borderRadius: 10 }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#5ffbf1', marginBottom: '0.5rem' }}>ök2 – Deine Galerie (Lizenz)</div>
            <ul style={{ margin: 0, paddingLeft: '1.2em', lineHeight: 1.55, fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)' }}>
              <li>
                <strong>Mein Weg (Sparte):</strong> in den Stammdaten eine von sechs Sparten – steuert Typ, Kategorien und Einsteig; siehe Liste oben (Leitvision).
              </li>
              <li>Eigene Galerie im Netz: Werke, Vita, Shop</li>
              <li>Events planen, Einladungen &amp; Flyer aus der App</li>
              <li>Kasse &amp; Etiketten (Verkauf vor Ort, WLAN-Drucker); Verkaufs- &amp; Lagerstatistik</li>
              <li>Marketing aus einem Guss: Newsletter, Presse, Social</li>
              <li>Ein Stand auf allen Geräten (Handy, Tablet, Rechner)</li>
            </ul>
          </div>
          <div style={{ padding: '1rem 1.1rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 10 }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>VK2 – Vereinsplattform (vereinsfähig)</div>
            <p style={{ margin: '0 0 0.4rem', fontSize: '0.8rem', color: 'rgba(251,191,36,0.95)' }}>Für alle Vereinstypen – ähnlich strukturiert. Kunstvereine sind der aktuelle Einstieg.</p>
            <ul style={{ margin: 0, paddingLeft: '1.2em', lineHeight: 1.55, fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)' }}>
              <li>Gemeinsame Vereinsgalerie + Mitglieder mit eigener Galerie</li>
              <li>Vereinskatalog: schönste Werke aller Lizenzmitglieder (PDF, filterbar)</li>
              <li>Events &amp; Werbung für den Verein, einheitliches Design</li>
              <li>Mitglieder verwalten, Lizenzen, Dokumente</li>
              <li>Ab 10 Mitgliedern für den Verein kostenfrei</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Genaue Produktbeschreibung – Platz für detaillierte, anpassbare Beschreibung (Vertrieb, Presse, Partner) */}
      <section id="mok2-produktbeschreibung" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Genaue Produktbeschreibung
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          <strong>ök2 (Lizenz für den gesamten Markt):</strong> Zuerst <strong>Mein Weg</strong> – sechs Sparten von Kunst &amp; Galerie bis Dienstleister &amp; Portfolio bestimmen, wie Einträge geführt und gezeigt werden. Darauf aufbauend: alle, die Ideen oder Produkte professionell zeigen wollen; Kunst bleibt das Einstiegstor und die Herkunftsgeschichte. Eigene Galerie mit Werken, Vita und Shop; Events, Einladungen, Flyer; Kasse und Etiketten; Marketing aus einem Guss; ein Stand auf allen Geräten.
        </p>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          <strong>VK2 (Vereinsplattform):</strong> Für **alle Vereinstypen** – Schwerpunkt **gemeinsame Interessen**, eine **Mitgliederliste**, Vereinsauftritt, Events. Kunstvereine = Einstieg. Wer sich in der Galerie präsentieren will, erhält optional ein Profil („Mitglieder in der Galerie“). Vereinskatalog (PDF), Events und Werbung; Vereinskassa und Buchhaltung vorgesehen. **Ab 10 eingetragenen Mitgliedern** für den Verein kostenfrei.
        </p>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          <strong>Leitbotschaft – für die Kunst gedacht, für den Markt gemacht:</strong> Die Plattform ist aus der Kunst heraus entstanden; Kunst ist der Träger der Idee. Ein Modell, eine Galerie: Kunstwerke, Produkte, Ideen – alles in einer Oberfläche, konfigurierbar, ohne Sonderbau. Vermarktbar, professionell, skalierbar. (Quelle: docs/PRODUKT-VISION.md; Doku: docs/VISION-WERKE-IDEEN-PRODUKTE.md)
        </p>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55, padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.08)', borderRadius: '8px', borderLeft: '4px solid #5ffbf1' }}>
          <strong>Positionierung zu Social Media:</strong> {PRODUCT_POSITIONING_SOCIAL} {PRODUCT_KERN_EIGENER_ORT} – der eine Kern, der alle Zielgruppen anspricht (Künstler:innen, Galerien, Vereine, alle mit Ideen/Produkten). Quelle: docs/MARKTANALYSE-K2-GALERIE.md
        </p>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
          Details und USPs: siehe Sektionen „Was kann die App?“ und „1. USPs“ in diesem Kapitel. Diese Beschreibung ist die eine Quelle für Vertrieb, Presse und Partner.
        </p>
      </section>

      {/* Portfolio ök2 + VK2 + K2 Familie: sachlicher Außentext, Kundenkreis, Wert/Strategie (Stand Diskussion) */}
      {/* K2 Galerie Prospekt – fertige Form zum Herzeigen, 1 Seite */}
      <section id="mok2-prospekt" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          K2 Galerie – Prospekt
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
          Fertig editiert, professionelles Layout, 2–3 Seiten – zum Herzeigen bei Partnern, Presse oder Pitches. Keine Listenform; Fließtext und klare Gliederung.
        </p>
        <Link
          to={`${PROJECT_ROUTES['k2-galerie'].praesentationsmappe}?context=oeffentlich`}
          state={{ returnTo: PROJECT_ROUTES['k2-galerie'].marketingOek2 }}
          style={{
            display: 'inline-block',
            padding: '0.65rem 1.25rem',
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(13,148,136,0.35)',
          }}
        >
          Prospekt öffnen (1 Seite, drucken)
        </Link>
      </section>

      {/* K2 Familie – Präsentationsmappe Kund:innen (eigenständig) */}
      <section id="mok2-k2-familie-kurzprospekt" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          K2 Familie – Präsentationsmappe (Kund:innen)
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
          Zum Lesen, Drucken und Übergeben: klare Produktinformation, ohne interne Vertriebs- oder Technikdetails.{' '}
          <strong>Keine</strong> Vermischung mit Galerie-Slogans. Platzhalter für Screenshots sind vorgesehen – Bilder nach und nach ergänzen.
        </p>
        <Link
          to={`${PROJECT_ROUTES['k2-familie'].familiePraesentationsmappeKunde}?returnTo=${encodeURIComponent(PROJECT_ROUTES['k2-galerie'].marketingOek2)}`}
          style={{
            display: 'inline-block',
            padding: '0.65rem 1.25rem',
            background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(4,120,87,0.4)',
          }}
        >
          Präsentationsmappe öffnen (Kunde, lesen, drucken)
        </Link>
      </section>

      {/* Prospekt K2 Kunst und Keramik – Galerieeröffnung */}
      <section id="mok2-prospekt-galerieeroeffnung" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Prospekt Galerieeröffnung – K2 Kunst und Keramik
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
          Einseitiger Prospekt zur Galerieeröffnung mit Stammdaten (Name, Adresse, Kontakt), QR-Codes und Links (ök2, VK2), Impressum. Aus K2-Stammdaten befüllt, druckbar.
        </p>
        <Link
          to={PROJECT_ROUTES['k2-galerie'].prospektGalerieeroeffnung}
          style={{
            display: 'inline-block',
            padding: '0.65rem 1.25rem',
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(13,148,136,0.35)',
          }}
        >
          Prospekt Galerieeröffnung öffnen (1 Seite, drucken)
        </Link>
      </section>

      {/* Vertrieb: feste Ebenen Mappe — A4, USP, Prospekt */}
      <section id="mok2-verkauf-map-drei-ebenen" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Präsentationsmappe – Entscheidungshilfe
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
          Die <strong>Präsentationsmappe Vollversion</strong> ist für <strong>künftige Nutzer:innen</strong> gedacht: <strong>Schritt für Schritt</strong> USPs und Produkt – nicht als Verkäufer-Skript.
          Der <strong>Promo-A4-Flyer</strong> ist <strong>eigenständig</strong> (eine Seite, druckbar); in der Mappe folgen darauf die <strong>USPs</strong> und die weiteren Kapitel.
        </p>
        <ol style={{ lineHeight: 1.75, paddingLeft: '1.35rem', margin: '0 0 1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.92)' }}>
          <li><strong>Promo A4 – Essenz</strong> — eigener Flyer, schnell klar, ob du tiefer einsteigen willst.</li>
          <li><strong>USPs &amp; Mitbewerb</strong> — was du gewinnst, Matrix, Marktbeispiele.</li>
        </ol>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
          <Link
            to={PROJECT_ROUTES['k2-galerie'].flyerOek2PromoA4}
            state={{ returnTo: location.pathname }}
            style={{
              display: 'inline-block',
              padding: '0.55rem 1.1rem',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(13,148,136,0.35)',
            }}
          >
            Promo A4-Flyer öffnen
          </Link>
          {[{ doc: '02-USP-UND-WETTBEWERB.md', label: 'USPs & Mitbewerb' }].map(({ doc, label }) => (
            <Link
              key={doc}
              to={`${PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion}?doc=${encodeURIComponent(doc)}`}
              state={{ returnTo: location.pathname }}
              style={{
                display: 'inline-block',
                padding: '0.55rem 1.1rem',
                background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '10px',
                fontSize: '0.95rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(13,148,136,0.35)',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* 1. Markteinschätzung: USPs */}
      <section id="mok2-1" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          1. USPs (Unique Selling Points)
        </h2>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li><strong>Mein Weg – sechs Sparten, eine Plattform:</strong> Der Kunde wählt in den Stammdaten eine Sparte (Kunst &amp; Galerie bis Dienstleister &amp; Portfolio); Typ, Kategorien und viele Texte folgen daraus. Vertrieb und Demo führen mit dieser Liste – keine verwässerte „wir können alles“-Story ohne Halt.</li>
          <li><strong>Masse vs. individuell und Klasse:</strong> {PRODUCT_POSITIONING_SOCIAL} {PRODUCT_KERN_EIGENER_ORT} – eine Botschaft, die alle Zielgruppen anspricht (Künstler:innen, Galerien, Vereine, alle mit Ideen oder Produkten).</li>
          <li><strong>Nicht nur eine App – multifunktional am PC/Mac:</strong> Die K2 Galerie ist eine <strong>Arbeitsplattform am Rechner</strong> (Planung, Veröffentlichen, Werbeunterlagen, alle Geräte im Blick) plus Galerie & Kassa auf Tablet/Handy. Diese Kombination – volle Multifunktion am Desktop, gleicher Stand überall – ist in diesem Feld <strong>einzigartig</strong> und zentral für Werbung und Marketing.</li>
          <li><strong>Alles in einer Oberfläche</strong> – Eine App für Galerie-Webauftritt, Werke, Events, Marketing und Kasse; Admin am Rechner, Galerie und Kassa auf Tablet/Handy (QR, gleicher Stand).</li>
          <li><strong>Fokus gesamter Markt, über Sparten greifbar</strong> – Die sechs Sparten machen den gesamten Markt sprachlich und technisch fassbar; Kunst &amp; Galerie bleibt Einstieg und Herkunft, nicht die Grenze. Begriffe und Abläufe passen pro Sparte.</li>
          <li><strong>Positionierung Sweet-Spot:</strong> {PRODUCT_POSITIONING_SWEET_SPOT} Der Markt für „Galerie, Kassa, Events aus einer Hand“ lohnt für Große nicht; für Kleine ist der Aufwand zu groß – genau dort liegen wir. Quelle: docs/POSITIONIERUNG-SWEET-SPOT-MARKT.md.</li>
          <li><strong>Marketing aus einem Guss</strong> – PR-Vorschläge aus Stammdaten und Event (Newsletter, Plakat, Presse, Social Media, Event-Flyer im Galerie-Design); mehrere Vorschläge pro Typ; A4/A3/A5; QR-Code-Plakat.</li>
          <li><strong>Corporate Design (CD) – eine Linie:</strong> Farben und Akzente aus <strong>Galerie gestalten</strong> ziehen durch bis Willkommensseite, Galerie, Plakat, Flyer und Presse-PDF – ein erkennbares Erscheinungsbild statt zerstückelter Tool-Optik. Ausführlich im Abschnitt <em>Corporate Design – eine Linie</em> direkt unterhalb der USPs.</li>
          <li><strong>Technik ohne Vendor-Lock-in</strong> – Plattformneutral (Windows, Android, macOS, iOS, Browser/PWA); moderner Web-Stack; Konfiguration statt Festverdrahtung.</li>
          <li><strong>Kassafunktion & Etiketten</strong> – Kasse/Shop für Verkauf vor Ort (z. B. iPad/Handy); Etikettendruck (z. B. Brother QL) mit Werk-Nummer, Titel, QR-Code, WLAN-fähig; Kundenverwaltung (Kunden-Tab) für Erfassung und Tagesgeschäft.</li>
          <li><strong>Einfache Kassa & Lagerhaltung</strong> – Verkauf erfassen, Kassenbeleg drucken (Etikett oder A4); Verkaufs- und Lagerstatistik (Werke gesamt, Bestand, Galerie, Reserviert, Umsatz) drucken; Werkkatalog mit Status Galerie/Lager/Verkauft; Stückzahl und Storno geplant – alles für Tagesgeschäft und Übersicht ohne Zusatz-Software.</li>
          <li><strong>Fotostudio</strong> – Professionelle Werkfotos in der App: Objektfreistellung und Pro-Hintergrund direkt im Browser (ohne API-Keys); ideal für Fotos von iPad/iPhone, automatisch aufgewertet beim Hereinladen.</li>
          <li><strong>Mobile und Stand</strong> – Ein Stand überall nach Deploy; Galerie-Assistent für neue Nutzer.</li>
          <li><strong>Datensouveränität und Backup</strong> – Lokale Speicherung, Backup & Wiederherstellung; K2 vs. Demo (ök2) strikt getrennt; keine Datenverluste durch Merge-Logik.</li>
          <li><strong>Professioneller Auftritt</strong> – Deutsche UI, anpassbares Design (Farben, Willkommensbild, Vita, Platzanordnung, Shop).</li>
          <li><strong>Vereinsfähig – Plattform für alle Vereinstypen (VK2):</strong> VK2 für <strong>alle Vereine</strong> – Schwerpunkt <strong>gemeinsame Interessen</strong>, eine <strong>Mitgliederliste</strong>, Vereinsauftritt, Events. Kunstvereine = Einstieg. Wer sich in der Galerie präsentieren will, erhält optional „Mitglieder in der Galerie“ (Profil/Karte). Vereinskatalog (PDF), Events und Werbung; Vereinskassa und Buchhaltung vorgesehen. <strong>Ab 10 eingetragenen Mitgliedern</strong> für den Verein kostenfrei. <em>Ein Verein entscheidet – viele werden sichtbar.</em></li>
          <li><strong>Empfehlungsprogramm – einzigartig:</strong> Nutzer:innen werben mit persönlicher Empfehler-ID; 10 % Rabatt für den Geworbenen, 10 % Gutschrift für den Empfehler. Vertrieb durch die Community – in dieser Branche (Galerie/Künstler:innen) kaum vergleichbar. Ein Klick: ID kopieren, Link teilen, Geworbene nutzt beim Lizenzabschluss – fertig.</li>
          <li><strong>Aus Österreich – kein Fernost-Produkt:</strong> Entwicklung und Betrieb aus Österreich. EU-Datenschutz (DSGVO), österreichisches Recht, Daten nicht in China oder Indien. Erreichbar, gleiche Zeitzone, deutsche Sprache – Vertrauen und Nähe statt anonymem Cloud-Anbieter.</li>
        </ul>
      </section>

      {/* Corporate Design – Marketing-Botschaft & Kommunikation */}
      <section id="mok2-cd-corporate-design" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Corporate Design – eine Linie (Kommunikation &amp; Markt)
        </h2>
        <p style={{ marginBottom: '0.85rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
          <strong>Corporate Design (CD)</strong> heißt: dieselbe visuelle Sprache überall, wo die Galerie nach außen tritt. Nicht pro Medium eine andere Farbwelt – sondern <strong>eine Handschrift</strong>, die man wiedererkennt. Das ist kein Luxus, sondern <strong>Vertrauen und Professionalität</strong> in der Kommunikation mit Besucher:innen, Käufer:innen und Medien.
        </p>
        <p style={{ marginBottom: '0.85rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
          In der <strong>K2 Galerie</strong> legt der Betreiber die Handschrift im Bereich <strong>Galerie gestalten</strong> fest: Farben, Kontraste, Bildsprache, Texte. Diese Entscheidungen sind die <strong>Quelle</strong> fürs Erscheinungsbild – <strong>Sportwagenprinzip:</strong> eine definierte Ausgabe, viele Kanäle (Willkommen, Galerie-Ansicht, Plakat, Flyer, Pressemappe, PDFs). So entsteht ein <strong>durchgängiger Auftritt</strong> ohne Redaktion in fünf verschiedenen Programmen.
        </p>
        <ul style={{ lineHeight: 1.65, paddingLeft: '1.2em', margin: '0 0 0.85rem 0', fontSize: '0.92rem', color: 'rgba(255,255,255,0.92)' }}>
          <li><strong>Für Piloten und Lizenznehmer:innen:</strong> „So sieht <em>meine</em> Galerie aus“ – von der ersten Seite bis zum Aushang im Schaufenster.</li>
          <li><strong>Für Gespräche und Prospekte:</strong> CD als Argument: nicht nur „alles in einer App“, sondern <strong>ein Auftritt, der zusammenpasst</strong> – wichtig für Künstler:innen und kleine Galerien, die sich von Baukasten-Standard abheben wollen.</li>
          <li><strong>Für Öffentlichkeitsarbeit:</strong> Presse und Social profitieren, wenn Materialien nicht wie „hingeklatscht“ wirken, sondern zur identischen Marke gehören.</li>
        </ul>
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(95,251,241,0.08)', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 10 }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.95)', lineHeight: 1.55 }}>
            <strong>Kurzform fürs Marketing:</strong> <em>Eine Galerie – ein Design – alle Kanäle.</em> CD ist bei uns kein Extra-Modul, sondern <strong>Teil des Produkts</strong>: wer gestaltet, definiert gleichzeitig die Linie für Web und Druck.
          </p>
        </div>
      </section>

      {/* Texte & KI: Marketing-Hinweis für Lizenznehmer:innen (externes Werkzeug + Einfügen) */}
      <section id="mok2-texte-ki-freiheit" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Texte &amp; KI – eigenes Werkzeug, eine Einfügen-Stelle
        </h2>
        <p style={{ marginBottom: '0.85rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
          Für Werbetexte, Einladungen, Social-Posts oder Entwürfe in Presse und Newsletter braucht die Lizenz <strong>keine</strong> in der App eingebaute KI-Pflicht. Künstler:innen und Galerien nutzen <strong>ihr gewohntes KI-Werkzeug</strong> (welches auch immer sie mögen), lassen sich Texte vorschlagen, <strong>überarbeiten sie selbst</strong> – und fügen den fertigen Text dort ein, wo er in der K2 Galerie hingehört: <strong>Galerie gestalten</strong>, Presse &amp; Medien, Flyer, Newsletter usw.
        </p>
        <ul style={{ lineHeight: 1.65, paddingLeft: '1.2em', margin: '0 0 0.85rem 0', fontSize: '0.92rem', color: 'rgba(255,255,255,0.92)' }}>
          <li><strong>Freiheit:</strong> Jede:r entscheidet selbst, ob und welche KI genutzt wird – nicht an einen Anbieter in der App gebunden.</li>
          <li><strong>Kosten &amp; Daten:</strong> API-Kosten und Datenschutz liegen beim gewählten Dienst, nicht automatisch in der Lizenz.</li>
          <li><strong>Produkt:</strong> Die App liefert die <strong>einheitlichen Felder und Kanäle</strong> (CD, PDF, Web) – der Text kommt als Inhalt, den du einfügst.</li>
        </ul>
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(95,251,241,0.08)', border: '1px solid rgba(95,251,241,0.3)', borderRadius: 10 }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.95)', lineHeight: 1.55 }}>
            <strong>Kurz fürs Gespräch mit Pilot:innen:</strong> <em>„KI zum Schreiben – ohne uns. Zum Ausliefern – mit uns.“</em> Optional kann später eine integrierte KI ergänzt werden; der Alltag funktioniert auch so.
          </p>
        </div>
      </section>

      {/* Produkt- und Branchenvergleich – Vorteile von ök2 klar herausarbeiten */}
      <section id="mok2-produkt-branchenvergleich" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Produkt- &amp; Branchenvergleich: Warum ök2?
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          Am Markt sind Galerie-Webauftritt, Kasse, Events und Etiketten meist <strong>getrennte Produkte</strong>. Hier die Gegenüberstellung – damit die Vorteile von ök2 klar werden.
        </p>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.95)', marginTop: '1rem', marginBottom: '0.5rem' }}>Am Markt (typische Aufteilung)</h3>
        <ul style={{ lineHeight: 1.65, paddingLeft: '1.2em', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <li><strong>Kassensystem allein</strong> (z. B. für Kunst/Kultur): ca. 15–35 €/Monat + TSE/Signatur (ca. 80–180 €/Jahr), oft eigene Hardware (Tablet, Bondrucker). Nur Kasse – keine Galerie, keine Events.</li>
          <li><strong>Website/Galerie</strong>: Baukasten oder Agentur – separates System, andere Oberfläche, andere Daten. Werke und Verkäufe hängen nicht zusammen.</li>
          <li><strong>Events/Einladungen</strong>: wieder anderes Tool (E-Mail, Flyer) – Daten erneut pflegen, kein einheitliches Design aus der Galerie.</li>
          <li><strong>Etiketten/Werkbeschriftung</strong>: eigene Software oder manuell – keine Anbindung an Bestand und Verkauf.</li>
          <li><strong>Ergebnis:</strong> Mehrere Abos, mehrere Oberflächen, keine durchgängige Datenbasis. Leicht <strong>mehrere hundert Euro pro Jahr</strong>, ohne dass alles zusammenspielt.</li>
        </ul>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.95)', marginTop: '1rem', marginBottom: '0.5rem' }}>ök2 / K2 Galerie (eine Lösung)</h3>
        <ul style={{ lineHeight: 1.65, paddingLeft: '1.2em', marginBottom: '1rem', fontSize: '0.9rem' }}>
          <li><strong>Eine Oberfläche, eine Datenbasis:</strong> Galerie, Werke, Kasse, Lager, Events, Marketing, Etiketten – alles in einer App. Einmal erfassen, überall nutzen.</li>
          <li><strong>Corporate Design aus einer Quelle:</strong> Farben und Akzente aus <strong>Galerie gestalten</strong> ziehen durch Web und Werbemittel – kein Medienbruch zwischen Homepage und Druck. Argument für Gespräche und Prospekte: mök2 → „Corporate Design – eine Linie“.</li>
          <li><strong>Kasse &amp; Lagerhaltung integriert:</strong> Verkauf erfassen, Beleg drucken (Etikett oder A4), Verkaufs- und Lagerstatistik, Storno, CSV für Buchhaltung, Umsatz heute. Pro++: vollständige Buchhaltung (Kassabuch-/Verkäufe-CSV, Belege als PDF pro Zeitraum – Vorarbeit für Steuerberater; 7 Jahre Aufbewahrung). Werkkatalog mit Status Galerie/Lager/Verkauft. Kein separates Kassensystem nötig.</li>
          <li><strong>Ein Stand auf allen Geräten:</strong> Admin am Rechner, Galerie und Kassa auf Tablet/Handy – gleicher Stand per QR, keine Medienbrüche.</li>
          <li><strong>Sprache und Begriffe für Künstler:innen:</strong> Werke, Vita, Events, Stammdaten, Öffentlichkeitsarbeit – kein abstraktes „CMS“ oder „Items“.</li>
          <li><strong>Branche:</strong> Künstler:innen und kleine Galerien sind mit „Webauftritt + Kasse + Events + Marketing aus einer Hand“ <strong>unterversorgt</strong>. Reine Kassensysteme oder reine Website-Baukästen decken den Bedarf nicht ab – ök2 füllt diese Lücke.</li>
          <li><strong>Vereinsfähig (VK2):</strong> <strong>Plattform für alle Vereine</strong> – Schwerpunkt gemeinsame Interessen, eine Mitgliederliste, Vereinsauftritt, Events. Kunstvereine = Einstieg. Optional „Mitglieder in der Galerie“ (Profil pro Person). Vereinskatalog (PDF), Events; Vereinskassa und Buchhaltung vorgesehen. Ab 10 eingetragenen Mitgliedern für den Verein kostenfrei.</li>
          <li><strong>Empfehlungsprogramm:</strong> Vertrieb durch Nutzer:innen – persönliche Empfehler-ID, 10 % Rabatt für Geworbene, 10 % Gutschrift für Empfehler. In dieser Branche einzigartig; ein Klick zum Teilen, keine komplexen Partner-Portale.</li>
          <li><strong>Made in Austria:</strong> Entwicklung und Betrieb aus Österreich – EU-Datenschutz, Rechtssicherheit, erreichbar. Nicht aus China oder Indien; Vertrauen und Nähe für Künstler:innen und Galerien.</li>
        </ul>

        <div style={{ padding: '1rem 1.25rem', background: 'rgba(95,251,241,0.1)', border: '1px solid rgba(95,251,241,0.35)', borderRadius: 10, marginTop: '1rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#5ffbf1', marginBottom: '0.5rem' }}>Kernvorteil auf einen Satz</div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.95)', lineHeight: 1.55 }}>
            Statt Kasse hier, Galerie dort, Events woanders: <strong>eine Lösung für Webauftritt, Verkauf vor Ort, Lager, Events und Werbung</strong> – ein Preis, ein Stand, eine Datenbasis. Für Einzelne <em>und</em> für <strong>alle Vereine (VK2 – Kunstvereine = Einstieg)</strong>, plus <strong>Empfehlungsprogramm</strong> (Vertrieb durch die Community). Genau das fehlt am Markt.
          </p>
        </div>
      </section>

      {/* 2. Marktchancen – Stärken */}
      <section id="mok2-2" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          2. Marktchancen – Stärken
        </h2>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li>Klare Nische: Künstler:innen und kleine Galerien (Webauftritt + Events + Kasse + Marketing aus einer Hand) sind unterversorgt.</li>
          <li><strong>Vereinsfähig als Alleinstellungsmerkmal:</strong> VK2 für alle Vereine – Schwerpunkt gemeinsame Interessen, eine Mitgliederliste, Vereinsauftritt. Kunstvereine = Einstieg. Optional Mitglieder in der Galerie (Profil). Ab 10 eingetragenen Mitgliedern für den Verein kostenfrei. Ein Verein entscheidet – viele werden sichtbar.</li>
          <li><strong>Empfehlungsprogramm als Alleinstellungsmerkmal:</strong> Vertrieb durch Nutzer:innen – Empfehler-ID, 10 % Rabatt/Gutschrift, ein Klick zum Teilen. In der Galerie-/Künstler:innen-Branche einzigartig; kein vergleichbares „Empfehlen und profitieren“ aus einer App.</li>
          <li>PWA + plattformneutral: Keine App-Stores nötig; Nutzung auf Windows und Android ohne Mac.</li>
          <li>Produktvision und Konfiguration: Codebasis und Doku auf Mehrfachnutzung und Lizenz-Versionen vorbereitet.</li>
          <li>Echter Einsatz: K2 wird bereits genutzt – echte Anforderungen und Workflows abgebildet.</li>
        </ul>
      </section>

      {/* 3. Marktchancen – Herausforderungen */}
      <section id="mok2-3" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          3. Marktchancen – Herausforderungen
        </h2>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li>Bekanntheit: Ohne Vertrieb/Marketing erreicht man die Zielgruppe nur begrenzt.</li>
          <li>Wettbewerb: Differenzierung über „Alles in einer App“, Galerie-Fokus, PR/Marketing aus einem Guss, <strong>Vereinsfähigkeit (VK2 – für alle Vereinstypen, Kunstvereine = Einstieg)</strong> und <strong>Empfehlungsprogramm</strong> (Vertrieb durch Nutzer:innen, in dieser Branche einzigartig).</li>
          <li>Betrieb/Recht: Klares Hosting-/Lizenz-Modell, AGB, Datenschutz, ggf. Support nötig.</li>
        </ul>
      </section>

      {/* 4. Fazit & nächste Schritte */}
      <section id="mok2-4" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          4. Fazit & nächste Schritte
        </h2>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li>Marktchance: Ja – Zielgruppe definierbar, technisch und konzeptionell gut vorbereitet.</li>
          <li>Erfolg hängt ab von: Positionierung, einfachem Einstieg (Galerie-Assistent), klarem Nutzen (USPs kommunizieren), Vertrieb/Kommunikation.</li>
          <li>Nächste Schritte: Konfiguration weiter zentralisieren; Onboarding dokumentieren und im UI führen; Lizenz-/Preismodell konkretisieren; Rechtliches und Betrieb klären.</li>
        </ul>
      </section>

      {/* Märkte Kunst-Fokus – aus Feature-Kombination (beide Apps) */}
      <section id="mok2-maerkte-kunst-fokus" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Märkte Kunst-Fokus (Feature-Kombination)
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          Aus der <strong>Kombination</strong> von Galerie-/Admin-Produkt (Werke, Kassa, Events, Presse, Etiketten, Shop) und Plattform (ök2, VK2) erschließen sich mit Fokus <strong>Kunst</strong> folgende Märkte.
        </p>
        <ul style={{ lineHeight: 1.65, paddingLeft: '1.2em', margin: '0 0 1rem' }}>
          <li><strong>Einzelkünstler:innen / Ateliers</strong> – Galerie, Werke, Kassa, Etiketten, Events, Presse, Fotostudio in einer App (Hauptzielgruppe).</li>
          <li><strong>Kleine Galerien</strong> – wie K2: alles in einer Oberfläche (Hauptzielgruppe).</li>
          <li><strong>Kunstvereine (VK2)</strong> – Vereinsplattform, gemeinsame Galerie, Events, ab 10 Mitgliedern für Verein kostenfrei (Hauptzielgruppe).</li>
          <li><strong>Kunst- und Kreativmärkte / Messen</strong> – Kassa am Stand, Etiketten, Galerie auf Tablet, Flyer mit QR (stark).</li>
          <li><strong>Kunsthandel / Galerien mit Shop</strong> – Galerie, Shop, Kassa, Belege, Werkkatalog (stark).</li>
          <li><strong>Kuratoren / Agent:innen</strong> – Portfolio, Events, Presse (mittel).</li>
          <li><strong>Kunstschulen / Atelier-Verbünde</strong> – VK2 oder gemeinsame Galerie (mittel).</li>
          <li><strong>Kleine Museen / Ausstellungshäuser</strong> – Events, Presse, optional Kassa/Shop (Nische).</li>
        </ul>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
          <strong>Vollständige Analyse:</strong> <code style={{ color: '#5ffbf1' }}>docs/MAERKTE-KUNST-FOKUS-ANALYSE.md</code>
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)' }}>
          <strong>Marktgröße DACH:</strong> <code style={{ color: '#5ffbf1' }}>docs/MARKTGROESSE-DACH-SCHAETZUNG.md</code>
        </p>
      </section>

      {/* Chancen ohne Kunst – dieselbe Feature-Kombination */}
      <section id="mok2-maerkte-ohne-kunst" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Chancen ohne Kunst (dieselbe Technik)
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          <strong>Kunst beiseite:</strong> Dieselbe Kombination (Präsentation, Katalog, Kassa, Events, Presse, Etiketten, VK2) eröffnet weitere Märkte – andere Begriffe, gleiche Funktionen.
        </p>
        <ul style={{ lineHeight: 1.65, paddingLeft: '1.2em', margin: '0 0 1rem' }}>
          <li><strong>Handwerk & Manufaktur</strong> – Produktkatalog, Kassa, Etiketten, Events (hoch).</li>
          <li><strong>Design & Möbel</strong> – Showroom, Kassa, Events (hoch).</li>
          <li><strong>Mode & Kleinserien</strong> – Kollektion, Märkte, Events (hoch).</li>
          <li><strong>Food & Genuss</strong> (limitierte Produkte) – Katalog, Verkauf, Events (mittel).</li>
          <li><strong>Messen & Märkte</strong> (beliebige Sparte) – Kassa am Stand, Etiketten, Flyer/QR (hoch).</li>
          <li><strong>Vereine (alle Typen, VK2)</strong> – gemeinsamer Auftritt, Mitglieder, Events (hoch).</li>
          <li><strong>Dienstleister Portfolio</strong> – Referenzen, Events, Presse (mittel).</li>
          <li><strong>Pop-up-Stores, Kleinserien, Bildung/Workshops</strong> (mittel).</li>
        </ul>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
          <strong>Vollständige Analyse:</strong> <code style={{ color: '#5ffbf1' }}>docs/MAERKTE-OHNE-KUNST-CHANCEN.md</code>
        </p>
        <p style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)' }}>
          <strong>Marktgröße DACH (Schätzung):</strong> <code style={{ color: '#5ffbf1' }}>docs/MARKTGROESSE-DACH-SCHAETZUNG.md</code>
        </p>
      </section>

      {/* Positionierung Sweet-Spot – eine Quelle für alle Öffentlichkeitsarbeit */}
      <section id="mok2-sweet-spot" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Positionierung Sweet-Spot (Öffentlichkeitsarbeit)
        </h2>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          <strong style={{ color: '#5ffbf1' }}>{PRODUCT_POSITIONING_SWEET_SPOT}</strong>
        </p>
        <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
          Der Markt für „Galerie, Katalog, Kassa und Events aus einer Hand“ ist für große Anbieter zu klein – und für kleine zu aufwendig zu bauen. Genau in dieser Lücke liegt die K2 Galerie: gemacht für Künstler:innen, Galerien und Vereine, die genau das brauchen.
        </p>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)' }}>
          <strong>Eine Quelle für Presse, Prospekt, Flyer:</strong> <code style={{ color: '#5ffbf1' }}>docs/POSITIONIERUNG-SWEET-SPOT-MARKT.md</code>
        </p>
      </section>

      {/* Kapitel: Vertrieb – Kanäle, Empfehlung, Werbung */}
      <Mok2ChapterPage title={mok2Groups[1].chapterTitle} />
      {/* Sichtbarkeit Suchmaschinen & Werbung – Konzept (ohne / mit Kosten) */}
      <section id="mok2-sichtbarkeit-werbung" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Sichtbarkeit & Werbung (Suchmaschinen, Verbreitung)
        </h2>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          Konzept: Wie wir im Netz bei Suchmaschinen sichtbar werden und welcher Verbreitungsgrad <strong>ohne Zusatzkosten</strong> möglich ist – und was mit welchem <strong>Budget</strong> dazu kommt.
        </p>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
          <strong>Vollständiges Konzept:</strong> <code style={{ fontSize: '0.85em', color: '#5ffbf1' }}>docs/SICHTBARKEIT-SUCHMASCHINEN-WERBUNG-KONZEPT.md</code>
        </p>
        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.2em', fontSize: '0.9rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.88)' }}>
          <li><strong>Ohne Zusatzkosten:</strong> SEO-Basis (Titel, Beschreibung, Texte), Google Business, Social-Profile, Empfehlungsprogramm, QR/Links, E-Mail/Einladungen, Presse, kostenlose Verzeichnisse.</li>
          <li><strong>Mit wenig Budget:</strong> Eigene Domain, kleines Google-Ads-Budget, gezielte Social-Kampagnen.</li>
          <li><strong>Mit höherem Budget:</strong> Größeres Werbebudget, SEO-Agentur, Influencer, Messen.</li>
        </ul>
        <p style={{ marginTop: '1rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.8)' }}>
          <strong>Punkt-für-Punkt:</strong> <code style={{ fontSize: '0.82em', color: '#5ffbf1' }}>docs/SICHTBARKEIT-WERBUNG-AGENDA.md</code> · <strong>Vorlagen 2–7:</strong> <code style={{ fontSize: '0.82em', color: '#5ffbf1' }}>docs/SICHTBARKEIT-PHASE1-VORLAGEN.md</code>
        </p>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.08)', borderRadius: '8px', border: '1px solid rgba(95,251,241,0.25)', marginTop: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#5ffbf1', margin: '0 0 0.5rem' }}>Links &amp; QR – einheitlich für alle Materialien</h3>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>Diese URLs überall verwenden; QR für dieselben Adressen (z. B. in APf/Eröffnung).</p>
          <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.85rem', lineHeight: 1.6 }}>
            <li><strong>K2 Galerie:</strong>{' '}<a href={urlK2GalerieLive} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>{URL_K2_GALERIE}</a></li>
            <li><strong>Demo / Eingangstor (ök2):</strong>{' '}<a href={urlMusterEingangstorLive} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>{URL_MUSTER_EINGANGSTOR}</a></li>
            <li><strong>VK2:</strong>{' '}<a href={urlVk2Live} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>{URL_VK2}</a></li>
          </ul>
        </div>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}><strong>Medienstudio K2:</strong> <code style={{ fontSize: '0.82em', color: '#5ffbf1' }}>docs/MEDIENSTUDIO-K2.md</code> – Presse-Standard, Medienkit, Redaktionsplan. Ablauf: PRESSEARBEIT-STANDARD · Verteiler: MEDIENVERTEILER-EROEFFNUNG.</p>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.06)', borderRadius: '8px', border: '1px solid rgba(95,251,241,0.2)', marginTop: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#5ffbf1', margin: '0 0 0.5rem' }}>Presse – Vorlage (Kurz)</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>{'Titel: Presseinformation – Eröffnung der K2 Galerie\n\nLead: [Galeriename] eröffnet am [Datum] die K2 Galerie. Werke in Malerei, Keramik, Grafik und Skulptur. Zur Eröffnung: Einblick in die K2-Plattform (K2 · ök2 · VK2).\n\nOrt, Zeit, Kontakt: [Adresse], [Datum, Uhrzeit]. Kontakt: [E-Mail, Telefon].\n\nOptional: Besucher:innen können Galerie und Demo (ök2) erleben; Vereine VK2 kennenlernen. Links und QR vor Ort.'}</p>
        </div>
        {/* Ausgangspunkt: Zwei Story-Texte für Presse (Quelle: MEDIENSTUDIO-K2 §1a / §1b) */}
        <h3 style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '1rem 0 0.5rem', borderBottom: '1px solid rgba(95,251,241,0.2)', paddingBottom: '0.25rem' }}>Ausgangspunkt: Zwei Story-Texte für Presse</h3>
        <p style={{ margin: '0 0 0.5rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>Diese beiden Texte sind die Basis für Presse und Öffentlichkeitsarbeit. Quelle: <code style={{ fontSize: '0.9em', color: '#5ffbf1' }}>docs/MEDIENSTUDIO-K2.md</code> §1a / §1b. Zum Kopieren auch im Admin → Presse &amp; Medien.</p>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.05)', borderRadius: '8px', border: '1px solid rgba(95,251,241,0.18)', marginTop: '0.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#fbbf24', margin: '0 0 0.35rem' }}>1a – Presse-Story (Human Interest, persönlich)</h4>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
            Die K2 Kunst Galerie betreiben Martina und Georg Kreinecker gemeinsam – Malerei und Keramik, nah an den Menschen. Die Plattform (ök2, VK2) hat Georg gebaut: Am Markt fand er vor allem Stückwerke – also wurde selbst gebaut. Galerie, Kasse, Events und Presse aus einer Hand (ök2 für den gesamten Markt, VK2 für alle Vereine). Kein Tech-Konzern, sondern einer, der nicht auf halben Lösungen sitzen bleiben wollte.
          </p>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>Einsatz: Für Medien, die eine „Geschichte dahinter“ mögen – locker, mit Augenzwinkern.</p>
        </div>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.05)', borderRadius: '8px', border: '1px solid rgba(95,251,241,0.18)', marginTop: '0.5rem' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#fbbf24', margin: '0 0 0.35rem' }}>1b – Produkt-Story (K2 &amp; VK2, neutral)</h4>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
            Künstler:innen und kleine Galerien stehen vor demselben Problem: Sie brauchen Webauftritt, Kasse, Events und Presse – aber am Markt gibt es vor allem Stückwerke. Eine Software für die Galerie, eine andere für die Kasse, wieder eine für Einladungen. Die <strong>K2 Galerie</strong> ist aus genau dieser Lücke entstanden. Für große Anbieter ist dieser Markt zu klein; für Einzelne ist der Aufwand zu groß – genau dort positionieren wir uns: eine Oberfläche für alles. Galerie, Kasse, Events und Marketing aus einer Hand, ohne dass man sich durch ein Dutzend Programme klicken muss. Mittlerweile wächst die Plattform: <strong>ök2</strong> für Künstler:innen mit eigenem Auftritt, <strong>VK2</strong> für Kunstvereine – alle Mitglieder, alle Werke, eine gemeinsame Galerie und eine Presse-Stimme. Keine Tech-Story von oben, sondern gebaut für die, die es brauchen.
          </p>
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>Einsatz: Neutrale Plattform-Story für Presse – ohne persönliche Details, für K2, ök2 und VK2.</p>
        </div>
        <p style={{ marginTop: '1rem', marginBottom: 0 }}>
          <Link to="/admin?tab=eventplan&eventplan=öffentlichkeitsarbeit" style={{ display: 'inline-block', padding: '0.6rem 1rem', background: 'rgba(95,251,241,0.15)', color: '#5ffbf1', borderRadius: '8px', border: '1px solid rgba(95,251,241,0.4)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', marginRight: '0.75rem' }}>Event- und Medienplanung in K2 öffnen →</Link>
          <Link to="/admin?tab=eventplan&eventplan=öffentlichkeitsarbeit&openModal=1" style={{ display: 'inline-block', padding: '0.6rem 1rem', background: 'rgba(95,251,241,0.15)', color: '#5ffbf1', borderRadius: '8px', border: '1px solid rgba(95,251,241,0.4)', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>Öffentlichkeitsarbeit in K2 (Modal) öffnen →</Link>
        </p>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.06)', borderRadius: '8px', border: '1px solid rgba(95,251,241,0.2)', marginTop: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#5ffbf1', margin: '0 0 0.5rem' }}>Verzeichnisse – Beispiele (kostenlos prüfen)</h3>
          <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.85rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.88)' }}>
            <li>Google Business (Punkt 2)</li>
            <li>Regionale Kulturportale (Bundesland/Stadt)</li>
            <li>Kunstverbände (ggf. Mitgliedschaft)</li>
            <li>Galerien-Verzeichnisse (z. B. artfacts, regional)</li>
            <li>Künstler:innen-/Galerie-Portale</li>
          </ul>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>Eintrag: Name, Kurzbeschreibung, Adresse, Website, Öffnungszeiten, Kontakt.</p>
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}><strong>Braucht dich:</strong> <strong>2</strong> Google Business anlegen · <strong>3</strong> Social Bio/Post (Doc §3) · <strong>6</strong> Presse versenden (Vorlage oben) · <strong>7</strong> Verzeichnisse eintragen (Liste oben).</p>
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(95,251,241,0.08)',
            borderRadius: '8px',
            border: '1px solid rgba(95,251,241,0.25)',
            marginTop: '0.75rem',
            breakInside: 'avoid' as const,
            pageBreakInside: 'avoid' as const,
          }}
        >
          <h3 style={{ fontSize: '1rem', color: '#5ffbf1', margin: '0 0 0.5rem' }}>
            Texte &amp; Briefe – Kompass (Druck, PDF, Weiterleitung)
          </h3>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.88)' }}>
            Eine Schnellwahl: welches Dokument für welchen Anlass. Pflege zentral in{' '}
            <code style={{ fontSize: '0.82em', color: '#5ffbf1' }}>docs/</code>, öffentlicher Spiegel mit{' '}
            <code style={{ fontSize: '0.82em', color: '#5ffbf1' }}>npm run sync:texte-oeffentlich</code>.
            Kommunikations-Vorlagen Phase 1 siehe Struktur-Dokument und Kampagne unten.
          </p>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.78)' }}>
            <strong>Zum Kopieren / E-Mail / PDF</strong> – volle Adressen (wie bei Links &amp; QR):
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
            <li>
              <strong>Texte &amp; Briefe Kompass (Handbuch):</strong>{' '}
              <a href={urlTexteBriefeKompass} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>
                {urlTexteBriefeKompass}
              </a>
              {' · '}
              <Link to="/k2team-handbuch?doc=24-TEXTE-BRIEFE-KOMPASS.md" style={{ color: '#5ffbf1', textDecoration: 'underline', fontWeight: 600, whiteSpace: 'nowrap' }}>
                in der App öffnen
              </Link>
            </li>
            <li>
              <strong>Kampagne Marketing &amp; Strategie (App):</strong>{' '}
              <a href={urlKampagneMarketingStrategieLive} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>
                {urlKampagneMarketingStrategieLive}
              </a>
              {' · '}
              <Link to={PROJECT_ROUTES['k2-galerie'].kampagneMarketingStrategie} style={{ color: '#5ffbf1', textDecoration: 'underline', fontWeight: 600, whiteSpace: 'nowrap' }}>
                in der App öffnen
              </Link>
            </li>
            <li>
              <strong>Vorlagen-Struktur (Repo):</strong>{' '}
              <code style={{ fontSize: '0.82em', color: '#5ffbf1' }}>docs/KOMMUNIKATION-DOKUMENTE-STRUKTUR.md</code>
            </li>
          </ul>
        </div>
      </section>

      <section id="mok2-inserat-lokalzeitung" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Inserat Lokalzeitung – Eingangstor &amp; QR
        </h2>
        <p style={{ marginBottom: '0.65rem', fontSize: '0.92rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          <strong>Format:</strong> Viertelseite Hochformat, ca. 96 × 129 mm. <strong>Ein QR</strong> – Ziel ist das öffentliche{' '}
          <strong>Eingangstor für Fremde</strong> (Route <code style={{ fontSize: '0.85em', color: '#5ffbf1' }}>{OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE}</code>
          ), damit Leser:innen direkt in Entdecken / Demo ök2 landen.
        </p>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.86rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.5 }}>
          <strong>Wo du das hier ansehen und ausdrucken kannst:</strong> In der APf links <strong>mök2</strong> wählen, in der Sidebar unter{' '}
          <strong>Vertrieb – Kanäle …</strong> den Punkt <strong>Inserat Lokalzeitung</strong> anklicken. Oder Kurzweg{' '}
          <Link to={MOK2_ROUTE} style={{ color: '#5ffbf1', fontWeight: 600 }}>{MOK2_ROUTE}</Link>
          {' · '}
          <Link
            to={`${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-inserat-lokalzeitung`}
            style={{ color: '#5ffbf1', wordBreak: 'break-all' }}
          >
            Direktanker (Lesezeichen)
          </Link>
          . <strong>Im Browser</strong> öffnen (Chrome/Safari), nicht in der Cursor-Vorschau. <strong>Kampagne:</strong> unten{' '}
          <strong>Nur Inserat drucken</strong> (eine Druckseite 96×129 mm) – <strong>nicht</strong> Safari{' '}
          <strong>⌘P</strong> auf der ganzen Seite; das wäre die komplette mök2-Seite (viele DIN-A4-Seiten). Dazu{' '}
          <strong>PDF</strong>, <strong>Link kopieren</strong>, <strong>E-Mail-Entwurf</strong>. Oben weiterhin <strong>Als PDF drucken</strong> für die ganze mök2-Seite.
        </p>

        <div
          className="marketing-oek2-no-print"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.45rem',
            alignItems: 'center',
            marginBottom: '0.65rem',
            padding: '0.65rem 0.75rem',
            background: 'rgba(95,251,241,0.08)',
            border: '1px solid rgba(95,251,241,0.35)',
            borderRadius: 10,
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5ffbf1', flex: '1 1 100%' }}>
            Ausdrucken &amp; versenden
          </span>
          <button
            type="button"
            onClick={handlePrintInseratOnly}
            style={{
              padding: '0.45rem 0.75rem',
              background: '#0d9488',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Nur Inserat drucken (96×129 mm)
          </button>
          <button
            type="button"
            onClick={() => void handleInseratPdfShare()}
            style={{
              padding: '0.45rem 0.75rem',
              background: 'rgba(95,251,241,0.15)',
              color: '#5ffbf1',
              border: '1px solid rgba(95,251,241,0.5)',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            PDF speichern oder teilen
          </button>
          <button
            type="button"
            onClick={() => void handleCopyInseratLink()}
            style={{
              padding: '0.45rem 0.75rem',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,250,245,0.95)',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Link kopieren
          </button>
          <button
            type="button"
            onClick={handleMailtoInserat}
            style={{
              padding: '0.45rem 0.75rem',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,250,245,0.95)',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 8,
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            E-Mail-Entwurf
          </button>
        </div>
        {inseratHinweis ? (
          <p
            className="marketing-oek2-no-print"
            role="status"
            style={{
              margin: '0 0 0.65rem',
              fontSize: '0.84rem',
              color: '#5ffbf1',
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            {inseratHinweis}
          </p>
        ) : null}

        <h3 className="marketing-oek2-no-print" style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '0 0 0.5rem', fontWeight: 700 }}>
          Bildseiten-Muster (Viertelseite 96 × 129 mm)
        </h3>
        <p className="marketing-oek2-no-print" style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.45 }}>
          Layout: links oben <strong>K2</strong> mit <strong>{PRODUCT_BRAND_NAME}</strong>, darunter Bild/Teal; rechts Inserat-Botschaft „Programm für viele“ aus tenantConfig; <strong>drei Bereiche</strong>; unten <strong>QR</strong> Eingangstor.
        </p>

        <div
          id="mok2-inserat-print-root"
          ref={inseratViertelRef}
          className="mok2-inserat-viertel"
          style={{
            width: 'min(96mm, 100%)',
            maxWidth: 400,
            aspectRatio: '96 / 129',
            margin: '0 auto 1rem',
            display: 'flex',
            flexDirection: 'column',
            background: '#fffefb',
            borderRadius: 10,
            overflow: 'hidden',
            boxShadow: '0 6px 28px rgba(0,0,0,0.22)',
            border: '3px solid #2a2622',
            breakInside: 'avoid' as const,
            color: '#1c1a18',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}
        >
          <div
            style={{
              flex: '0 0 30%',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', flex: '1 1 0', minHeight: 0 }}>
            <div
              style={{
                flex: '0 0 28%',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                background: INSERAT_TEAL_DARK,
              }}
            >
              <div
                className="mok2-inserat-hero-k2head"
                style={{
                  flex: '1.08 1 0',
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 6px',
                  background: INSERAT_TEAL_DARK,
                  borderBottom: '1px solid rgba(0,0,0,0.22)',
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 'clamp(1.35rem, 7vw, 2.5rem)',
                    fontWeight: 900,
                    color: '#fff',
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                    textShadow: '0 2px 12px rgba(0,0,0,0.35)',
                    display: 'block',
                  }}
                >
                  K2
                </span>
                <span
                  style={{
                    fontSize: 'clamp(0.48rem, 2vw, 0.72rem)',
                    fontWeight: 800,
                    color: 'rgba(255,255,255,0.96)',
                    marginTop: 6,
                    letterSpacing: '0.04em',
                    lineHeight: 1.2,
                    display: 'block',
                  }}
                >
                  {PRODUCT_BRAND_NAME}
                </span>
              </div>
              <div className="mok2-inserat-hero-photo" style={{ flex: '0.92 1 0', minHeight: 0, position: 'relative', overflow: 'hidden' }}>
                {oefWelcome ? (
                  <img src={oefWelcome} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(160deg, ${INSERAT_TEAL_DARK} 0%, #134e4a 55%, #0f766e 100%)`,
                    }}
                  />
                )}
              </div>
            </div>
            <div
              className="mok2-inserat-hero-copy"
              style={{
                flex: 1,
                minWidth: 0,
                padding: '0.5rem 0.55rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, #fffefb 0%, #f0ebe3 100%)',
                borderLeft: '1.5px solid rgba(12, 92, 85, 0.38)',
              }}
            >
              <div
                style={{
                  fontSize: 'clamp(0.64rem, 2.95vw, 0.95rem)',
                  fontWeight: 900,
                  color: INSERAT_TEAL_DARK,
                  lineHeight: 1.15,
                  letterSpacing: '0.02em',
                  textWrap: 'balance' as const,
                }}
              >
                {PRODUCT_INSERAT_VIERTEL_HAUPT}
              </div>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 'clamp(0.54rem, 2.28vw, 0.74rem)',
                  lineHeight: 1.28,
                  color: '#1c1a18',
                  fontWeight: 800,
                  textWrap: 'balance' as const,
                }}
              >
                {PRODUCT_INSERAT_VIERTEL_UNTER}
              </p>
            </div>
            </div>
            <div
              className="mok2-inserat-line-slogan"
              style={{
                flexShrink: 0,
                width: '100%',
                boxSizing: 'border-box',
                padding: '7px 10px 8px',
                borderTop: '2px solid rgba(12, 92, 85, 0.42)',
                background: 'linear-gradient(180deg, #f4f0ea 0%, #ebe6de 100%)',
                fontSize: 'clamp(0.55rem, 2.45vw, 0.8rem)',
                fontWeight: 900,
                color: INSERAT_TEAL_DARK,
                lineHeight: 1.2,
                letterSpacing: '0.012em',
                textAlign: 'center',
                textWrap: 'balance' as const,
              }}
            >
              {PRODUCT_WERBESLOGAN_2 || PRODUCT_WERBESLOGAN}
            </div>
          </div>

          <div
            className="mok2-inserat-products-wrap"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              minHeight: 0,
              padding: '5px 7px 6px',
              borderTop: '2px solid rgba(12, 92, 85, 0.38)',
            }}
          >
            {[
              { k: 'o', bar: INSERAT_TEAL_BAR, t: 'ök2', s: 'Eigene Plattform · Galerie, Demo, Kasse, Events' },
              { k: 'v', bar: INSERAT_VK2_BAR, t: 'VK2', s: 'Vereinsplattform · Katalog, Mitglieder, Werbung' },
              {
                k: 'f',
                bar: INSERAT_FAMILIE_BAR,
                t: 'K2 Familie',
                s: `${PRODUCT_K2_FAMILIE_WERBESLOGAN} ${PRODUCT_K2_FAMILIE_WERBE_KERN_KOMPAKT}`,
              },
            ].map((row) => {
              const inseratOeVk = row.k === 'o' || row.k === 'v'
              return (
              <div
                key={row.k}
                className="mok2-inserat-product-card"
                style={{
                  flex: row.k === 'f' ? '0 0 auto' : '1 1 0',
                  minHeight: row.k === 'f' ? undefined : 0,
                  display: 'flex',
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: '1.5px solid rgba(28, 26, 24, 0.42)',
                }}
              >
                <div style={{ width: inseratOeVk ? 10 : 8, flexShrink: 0, background: row.bar }} aria-hidden />
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: inseratOeVk ? '9px 10px 8px' : row.k === 'f' ? '6px 9px 7px' : '6px 9px',
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      /* Überschrift überall gleich groß (ök2, VK2, K2 Familie) */
                      fontSize: 'clamp(0.82rem, 3.55vw, 1.08rem)',
                      fontWeight: 900,
                      color: row.bar,
                      lineHeight: 1.08,
                    }}
                  >
                    {row.t}
                  </div>
                  <div
                    style={{
                      fontSize: inseratOeVk
                        ? 'clamp(0.66rem, 2.75vw, 0.88rem)'
                        : 'clamp(0.52rem, 2.1vw, 0.7rem)',
                      color: '#1c1a18',
                      lineHeight: 1.26,
                      marginTop: inseratOeVk ? 4 : 3,
                      fontWeight: 700,
                    }}
                  >
                    {row.s}
                  </div>
                </div>
              </div>
              )
            })}
          </div>

          <div
            className="mok2-inserat-line-footer"
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'stretch',
              gap: 8,
              padding: '6px 9px 8px',
              borderTop: '2px solid rgba(12, 92, 85, 0.42)',
              background: '#faf8f4',
            }}
          >
            <div
              style={{
                flex: '1 1 0',
                minWidth: 0,
                paddingRight: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 'clamp(0.5rem, 1.72vw, 0.64rem)',
                  lineHeight: 1.22,
                  color: '#45413c',
                  fontWeight: 700,
                  textWrap: 'balance' as const,
                }}
              >
                {PRODUCT_WERBESLOGAN}
              </p>
            </div>
            <div
              className="mok2-inserat-viertel-qr"
              style={{
                flexShrink: 0,
                alignSelf: 'center',
                lineHeight: 0,
                padding: 2,
                background: '#fff',
                borderRadius: 5,
                border: '2px solid #0c4a44',
                boxShadow: '0 1px 4px rgba(12,92,85,0.16)',
              }}
            >
              {inseratEingangstorQrUrl ? (
                <img
                  src={inseratEingangstorQrUrl}
                  alt="QR zum Eingangstor Entdecken"
                  width={72}
                  height={72}
                  style={{ display: 'block', background: '#fff' }}
                />
              ) : (
                <div style={{ width: 72, height: 72, background: '#e8e6e2' }} aria-hidden />
              )}
            </div>
          </div>
          <div
            className="mok2-inserat-line-copy"
            style={{
              padding: '0 8px 5px',
              fontSize: 'clamp(0.32rem, 1.05vw, 0.4rem)',
              color: '#8a8580',
              textAlign: 'center',
              background: '#faf8f4',
              lineHeight: 1.2,
              borderTop: '1px solid rgba(92, 86, 80, 0.35)',
            }}
          >
            {PRODUCT_COPYRIGHT_BRAND_ONLY}
          </div>
          <div
            className="mok2-inserat-line-qr-hint"
            style={{
              padding: '3px 8px 4px',
              fontSize: 'clamp(0.38rem, 1.38vw, 0.5rem)',
              color: '#5c5650',
              textAlign: 'center',
              background: '#faf8f4',
              lineHeight: 1.25,
              fontWeight: 700,
              letterSpacing: '0.015em',
              borderTop: '1px solid rgba(92, 86, 80, 0.28)',
            }}
          >
            QR scannen → Entdecken (Demo)
          </div>
        </div>

        <div
          className="mok2-inserat-block"
          style={{
            padding: '1rem 1.1rem',
            background: 'rgba(255,250,245,0.97)',
            borderRadius: '10px',
            border: '1px solid rgba(28,26,24,0.18)',
            marginBottom: '1rem',
            breakInside: 'avoid' as const,
          }}
        >
          <h3 style={{ fontSize: '1.02rem', color: '#0d4f4a', margin: '0 0 0.5rem', fontWeight: 700 }}>
            Nur Text – Fallback für Setzerei / Word
          </h3>
          <p style={{ margin: '0 0 0.45rem', fontSize: '0.8rem', color: '#3d3a36' }}>
            Anrede in der Zeitung: <strong>Sie</strong>. QR in der Anzeige auf dieselbe URL legen wie unten bei „Ziel-Link“.
          </p>
          <pre
            style={{
              margin: 0,
              padding: '0.65rem 0.75rem',
              background: '#fff',
              border: '1px solid #e0ddd8',
              borderRadius: '6px',
              fontSize: '0.82rem',
              lineHeight: 1.45,
              color: '#1c1a18',
              whiteSpace: 'pre-wrap',
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            }}
          >
            {`${PRODUCT_INSERAT_VIERTEL_HAUPT}

${PRODUCT_INSERAT_VIERTEL_UNTER}

${PRODUCT_WERBESLOGAN_2 || PRODUCT_WERBESLOGAN}

GALERIE, KASSE, EVENTS – AUS EINER HAND

kgm solution – Software für Künstler:innen, kleine Galerien und Vereine uvm. Online ansehen und ausprobieren – ohne Installation.

• Öffentlicher Auftritt und Demo – ök2
• Vereinsplattform mit Katalog – VK2
• Optional: K2 Familie für den privaten Bereich

${PRODUCT_WERBESLOGAN}

kgm solution

QR scannen → Entdecken (Demo)`}
          </pre>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '0.85rem 1rem',
            background: 'rgba(95,251,241,0.07)',
            borderRadius: '10px',
            border: '1px solid rgba(95,251,241,0.22)',
            marginBottom: '0.75rem',
            breakInside: 'avoid' as const,
          }}
        >
          {inseratEingangstorQrUrl ? (
            <img src={inseratEingangstorQrUrl} alt="QR-Code zum Eingangstor Entdecken" width={132} height={132} style={{ flexShrink: 0, background: '#fff', padding: 6, borderRadius: 4 }} />
          ) : (
            <div style={{ width: 132, height: 132, background: 'rgba(255,255,255,0.1)', borderRadius: 4, flexShrink: 0 }} aria-hidden />
          )}
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <h3 style={{ fontSize: '1rem', color: '#5ffbf1', margin: '0 0 0.4rem' }}>Ziel-Link &amp; Vorschau</h3>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.5 }}>
              <strong>Für die Druckerei</strong> (statisch, lesbar unter dem QR):{' '}
              <code style={{ fontSize: '0.8em', color: '#fde68a', wordBreak: 'break-all' }}>{URL_MUSTER_EINGANGSTOR}</code>
            </p>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.45 }}>
              Der QR oben encodiert dieselbe Adresse mit aktuellem Server-Stand und Cache-Bust (wie bei unseren Galerie-QRs) – für Papier-Anzeigen kann die Setzerei zusätzlich die kurze URL setzen.
            </p>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              <a href={urlMusterEingangstorLive} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', fontWeight: 600 }}>
                Eingangstor im Browser testen →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Werbefahrplan – Anker + Kurzüberblick; Bearbeitung auf eigener Route (Arbeitsfläche) */}
      <section id="mok2-werbefahrplan" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Werbefahrplan (Aktivitäten &amp; Zeitraum)
        </h2>
        <Mok2WerbefahrplanTeaser />
      </section>

      {/* Eröffnung K2 + ök2 + VK2 – Marketinglinie, gemeinsame Lounge */}
      <section id="mok2-eroeffnung-k2-oek2" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Eröffnung K2 + ök2 + VK2 (Marketinglinie)
        </h2>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          K2, ök2 und VK2 zum gleichen Zeitpunkt bei der Galerie-Eröffnung einführen: eine Botschaft, eine <strong>gemeinsame Lounge</strong> (Galerie erleben + Plattform entdecken). Gezielte Marketinglinie in 2 Wochen – Werbetrommel vor der Eröffnung.
        </p>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
          <strong>Vollständige Strategie, Checkliste und konkrete Texte:</strong> <code style={{ fontSize: '0.85em', color: '#5ffbf1' }}>docs/MARKETING-EROEFFNUNG-K2-OEK2.md</code>
        </p>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.08)', borderRadius: '8px', border: '1px solid rgba(95,251,241,0.25)', marginTop: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#5ffbf1', margin: '0 0 0.5rem' }}>Kernbotschaft (ein Satz)</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
            „Wir eröffnen die K2 Galerie – und laden Sie ein, die Galerie und die Plattform kennenzulernen, mit der wir und andere Künstler:innen, Galerien und Kunstvereine arbeiten.“
          </p>
          <h3 style={{ fontSize: '1rem', color: '#5ffbf1', margin: '0.75rem 0 0.35rem' }}>Lounge-Text (für Einladung / vor Ort)</h3>
          <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.5 }}>
            Zur Eröffnung laden wir Sie in unsere <strong>Galerie</strong> ein – Werke, Raum, Begegnung. In einer <strong>gemeinsamen Lounge</strong> können Sie zusätzlich erleben, womit wir arbeiten: die <strong>K2-Plattform</strong> (K2 · ök2 · VK2), mit der Künstler:innen, Galerien und Kunstvereine ihre Werke präsentieren, Veranstaltungen planen und sich vernetzen. Musterseiten (ök2) und Vereinsplattform (VK2) sind am Bildschirm oder am eigenen Gerät zugänglich – siehe Links &amp; QR unten.
          </p>
          <h3 style={{ fontSize: '1rem', color: '#5ffbf1', margin: '0.75rem 0 0.35rem' }}>Links und QR-Codes – überall gleich</h3>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>Diese URLs in Einladung, Presse, Social und Lounge verwenden; QR-Codes für dieselben Adressen generieren.</p>
          <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.85rem', lineHeight: 1.6 }}>
            <li><strong>Zur K2 Galerie:</strong>{' '}<a href={URL_K2_GALERIE} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>{URL_K2_GALERIE}</a></li>
            <li><strong>Zu den Musterseiten / Demo (ök2):</strong>{' '}<a href={urlMusterEingangstorLive} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>{URL_MUSTER_EINGANGSTOR}</a></li>
            <li><strong>Zur Vereinsplattform VK2:</strong>{' '}<a href={urlVk2Live} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>{URL_VK2}</a></li>
          </ul>
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
          Checkliste 2 Wochen: Kernbotschaft, Lounge-Text, Einladung, Presse, Social, Kanäle, Bildmaterial, QR/Link – siehe Doku.
        </p>
      </section>
      {/* Muster pro Werbetyp (Eröffnung) – ein Muster pro Öffentlichkeitsarbeit-Eintrag */}
      <section id="mok2-muster-werbetyp-eroeffnung" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Muster pro Werbetyp (Eröffnung)
        </h2>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          Auf Basis der mök2-Marketingstrategie und der Musterstorys (§1a / §1b aus Medienstudio K2) gibt es für <strong>jeden Eintrag</strong> in der Event- und Medienplanung (Admin → Event- und Medienplanung → Oeffentlichkeitsarbeit) ein fertiges Muster: Newsletter, Plakat, Event-Flyer, Presse (neutral + lokal), Social Media, Praesentationsmappen.
        </p>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
          <strong>Vollständige Mustersammlung (Copy-Paste, Platzhalter ersetzen):</strong>{' '}
          <code style={{ fontSize: '0.85em', color: '#5ffbf1' }}>docs/MOK2-MUSTER-PRO-WERBETYP-EROEFFNUNG.md</code>
        </p>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.06)', borderRadius: '8px', border: '1px solid rgba(95,251,241,0.2)', marginTop: '0.5rem', fontSize: '0.88rem' }}>
          <p style={{ margin: '0 0 0.5rem', color: '#5ffbf1', fontWeight: 600 }}>Übersicht – ein Muster pro Eintrag</p>
          <ul style={{ margin: 0, paddingLeft: '1.2em', lineHeight: 1.6, color: 'rgba(255,255,255,0.88)' }}>
            <li><strong>Newsletter</strong> – Betreff, Body (Eröffnung, Lounge, Kontakt)</li>
            <li><strong>Plakat</strong> – Titel, Datum, Ort, Kurztext (A3/A2)</li>
            <li><strong>Event-Flyer</strong> – Headline, Datum, Ort, Beschreibung</li>
            <li><strong>Presse neutral</strong> – ohne Personendaten (§1b, Kontakt „über Galerie“)</li>
            <li><strong>Presse lokal</strong> – mit §1a + §1b, Kontaktblock</li>
            <li><strong>Social Media</strong> – Instagram, Facebook, WhatsApp</li>
            <li><strong>Präsentationsmappen</strong> – Links; Varianten in der App wählen</li>
          </ul>
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>Quellen: MARKETING-EROEFFNUNG-K2-OEK2.md, MEDIENSTUDIO-K2.md (§1a, §1b), MEDIENVERTEILER-EROEFFNUNG.md.</p>
        </div>
      </section>
      {/* Presse-Nachbericht Eröffnung – redaktioneller Text (Doku-Spiegel) */}
      <section id="mok2-presse-nachbericht-eroeffnung" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Presse-Nachbericht Galerieeröffnung (Redaktion)
        </h2>
        <p style={{ marginBottom: '0.65rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.5 }}>
          <strong>Stand:</strong> 02.05.26 · <strong>Basis:</strong> erste Presseaussendung (Archiv WELS) + Medienstudio K2 §1a (Human-Interest-Kern).{' '}
          <strong>Zweck:</strong> redaktioneller Nachbericht nach erfolgreicher Eröffnung – Text zur freien redaktionellen Bearbeitung.
        </p>
        <p style={{ marginBottom: '0.65rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
          <strong>Zwei Textkörper:</strong> <strong>Variante A</strong> = sachlich-einordnend. <strong>Variante B</strong> = etwas erzählerischer – gleiche Fakten, anderer Ton; je nach Medium wählen.{' '}
          <strong>Links und QR</strong> nur einmal unter Variante A; Variante B verweist darauf.
        </p>
        <p style={{ marginBottom: '0.65rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
          <strong>Faktenlage (für Redaktion):</strong> sehr positives Besucherfeedback; <strong>rund 30 Verkäufe</strong> im Eröffnungswochenende.
        </p>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.72)' }}>
          <strong>Vollständige Vorlage im Repo:</strong>{' '}
          <code style={{ fontSize: '0.82em', color: '#5ffbf1' }}>docs/oeffentlichkeitsarbeit/presseaussendung-fertig/PRESSE-NACHBERICHT-EROEFFNUNG-VORSCHLAG.md</code>
        </p>

        <h3 style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '1rem 0 0.5rem', borderBottom: '1px solid rgba(95,251,241,0.2)', paddingBottom: '0.25rem' }}>
          E-Mail an die Redaktion (Kurztext oben drüber)
        </h3>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.06)', borderRadius: '8px', border: '1px solid rgba(95,251,241,0.22)', fontSize: '0.88rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.92)' }}>
          <p style={{ margin: '0 0 0.5rem' }}>Sehr geehrte Damen und Herren,</p>
          <p style={{ margin: '0 0 0.5rem' }}>
            anbei eine <strong>Presseinformation zum Nachbericht</strong> über unsere Galerieeröffnung – mit Zahlen und Stimmung aus dem Besuch. Sie dürfen den Text gerne{' '}
            <strong>kürzen oder redigieren</strong>; bei Rückfragen oder Interviewwünschen sind wir erreichbar.
          </p>
          <p style={{ margin: 0 }}>
            Mit freundlichen Grüßen
            <br />
            Martina und Georg Kreinecker
          </p>
        </div>

        <h3 style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '1rem 0 0.5rem', borderBottom: '1px solid rgba(95,251,241,0.2)', paddingBottom: '0.25rem' }}>
          PRESSEINFORMATION – Variante A (Textkörper, sachlich-einordnend)
        </h3>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.08)', borderRadius: '8px', border: '1px solid rgba(95,251,241,0.25)', fontSize: '0.88rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.92)' }}>
          <p style={{ margin: '0 0 0.35rem' }}>
            <strong>Zur Veröffentlichung / Nachbericht</strong>
          </p>
          <p style={{ margin: '0 0 0.75rem' }}>
            <strong>Erfolgreiche Galerieeröffnung · K2 Galerie Kunst &amp; Keramik · Eferding</strong>
          </p>
          <p style={{ margin: '0 0 0.35rem' }}>
            <strong>ORT:</strong> Schlossergasse 4, 4070 Eferding, Österreich
          </p>
          <p style={{ margin: '0 0 1rem' }}>
            <strong>ANLASS:</strong> Eröffnungswochenende <strong>24.–26. April 2026</strong> (wie angekündigt)
          </p>
          <h4 style={{ fontSize: '0.95rem', color: '#5ffbf1', margin: '0 0 0.35rem' }}>EINORDNUNG</h4>
          <p style={{ margin: '0 0 0.45rem', lineHeight: 1.58 }}>
            Die <strong>K2 Galerie Kunst &amp; Keramik</strong> von <strong>Martina und Georg Kreinecker</strong> erlebte ihre Eröffnung mit <strong>großem Besucherinteresse</strong>.
          </p>
          <p style={{ margin: '0 0 0.85rem', lineHeight: 1.58 }}>
            <strong>Malerei und Keramik</strong> kamen <strong>sehr gut</strong> an. Im Eröffnungswochenende wurden <strong>rund 30 Verkäufe</strong> registriert – ein klares Signal: <strong>Qualität</strong>, <strong>persönliche Begegnung</strong> und <strong>regionale Sichtbarkeit</strong> wirken zusammen.
          </p>
          <h4 style={{ fontSize: '0.95rem', color: '#5ffbf1', margin: '0.75rem 0 0.35rem' }}>Von der Galerie zur Plattform</h4>
          <p style={{ margin: '0 0 0.4rem', fontSize: '0.86rem', lineHeight: 1.58, color: 'rgba(255,255,255,0.92)' }}>
            <strong>Zum Zusammenhang (für die Redaktion, ohne Werbeanspruch)</strong>
          </p>
          <p style={{ margin: '0 0 0.45rem', fontSize: '0.86rem', lineHeight: 1.58, color: 'rgba(255,255,255,0.9)' }}>
            Was Gäste sehen, hängt mit dem <strong>Alltag</strong> zusammen: Atelier, Lager, Ausstellung, Verkauf, Außenauftritt.
          </p>
          <p style={{ margin: '0 0 0.35rem', fontSize: '0.86rem', lineHeight: 1.58, color: 'rgba(255,255,255,0.9)' }}>
            Dabei fällt oft auf:
          </p>
          <ul style={{ margin: '0 0 0.55rem', paddingLeft: '1.2em', fontSize: '0.86rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.9)' }}>
            <li>
              <strong>Website, Kasse, Termine und Pressearbeit</strong> laufen <strong>über viele getrennte Werkzeuge</strong>.
            </li>
            <li>
              <strong>Wenig roter Faden</strong> – viele Einzelschritte.
            </li>
          </ul>
          <p style={{ margin: '0 0 0.45rem', fontSize: '0.86rem', lineHeight: 1.58, color: 'rgba(255,255,255,0.9)' }}>
            <strong>Für den eigenen Betrieb</strong> entstand daraus <strong>ein einheitlicheres System</strong> (intern <strong>K2-Plattform</strong> genannt). <strong>Aus der Praxis</strong> – <strong>nicht</strong> im <strong>Ton</strong> typischer <strong>Software-Werbung</strong> oder großer <strong>Tech-Konzerne</strong>.
          </p>
          <p style={{ margin: '0 0 0.85rem', fontSize: '0.86rem', lineHeight: 1.58, color: 'rgba(255,255,255,0.88)' }}>
            Darauf folgt ein kurzer Abschnitt zu <strong>Haltung</strong> und <strong>Berufswegen</strong>.
          </p>
          <h4 style={{ fontSize: '0.95rem', color: '#5ffbf1', margin: '0 0 0.35rem' }}>HINTERGRUND IN KÜRZE</h4>
          <p style={{ margin: '0 0 0.35rem', lineHeight: 1.58 }}>
            Galerie und interne <strong>K2-Plattform</strong> teilen dieselbe <strong>Haltung</strong>:
          </p>
          <ul style={{ margin: '0 0 0.5rem', paddingLeft: '1.2em', lineHeight: 1.55 }}>
            <li>
              <strong>Martina Kreinecker:</strong> künstlerische und galeristische Arbeit.
            </li>
            <li>
              <strong>Georg Kreinecker:</strong> <strong>Handwerk</strong>, <strong>Meisterprüfung</strong>, <strong>eigenes produzierendes Unternehmen</strong>, später <strong>internationales Handels- und Beratungsgeschäft</strong> im Maschinen- und Anlagenbau (über viele Jahre).
            </li>
          </ul>
          <p style={{ margin: '0 0 0.45rem', lineHeight: 1.58 }}>
            So wird verständlich, warum <strong>Stückwerk</strong> am Markt selten reicht, wenn <strong>Galerie, Kasse und Öffentlichkeitsarbeit</strong> zusammengehören sollen.
          </p>
          <p style={{ margin: '0 0 0.85rem', lineHeight: 1.58 }}>
            <strong>Kein Tech-Konzern</strong> – sondern Menschen, die <strong>gern zu Ende bringen</strong>. Mit einem Augenzwinkern: Wer so arbeitet, hört nicht einfach auf.
          </p>
          <h4 style={{ fontSize: '0.95rem', color: '#5ffbf1', margin: '0 0 0.35rem' }}>FÜR REDAKTIONEN</h4>
          <ul style={{ margin: '0 0 0.85rem', paddingLeft: '1.2em' }}>
            <li>
              <strong>Ausstellung</strong> weiterhin über die <strong>öffentliche Galerie</strong> im Netz einsehbar (Werke, Kontakt, Öffnungszeiten).
            </li>
            <li>
              <strong>Bildmaterial</strong> und <strong>Interview</strong> auf Anfrage über die unten genannten Kontaktdaten.
            </li>
          </ul>
          <h4 style={{ fontSize: '0.95rem', color: '#5ffbf1', margin: '0 0 0.35rem' }}>KONTAKT</h4>
          <p style={{ margin: '0 0 0.35rem' }}>Mit freundlichen Grüßen</p>
          <p style={{ margin: '0 0 0.5rem' }}>Georg Kreinecker</p>
          <p style={{ margin: '0 0 0.25rem' }}>
            <strong>E-Mail:</strong> georg.kreinecker@kgm.at
          </p>
          <p style={{ margin: '0 0 0.25rem' }}>
            <strong>Telefon:</strong> 0664 1046337
          </p>
          <p style={{ margin: '0.5rem 0 0.25rem' }}>
            <strong>Adresse:</strong> Schlossergasse 4, 4070 Eferding, Österreich
          </p>
          <p style={{ margin: '0 0 0.75rem' }}>
            <strong>Öffnungszeiten:</strong> Samstag 9.30 bis 14.00 Uhr
          </p>
          <p style={{ margin: '0 0 0.35rem' }}>
            <strong>Links:</strong> <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.72)', fontSize: '0.82rem' }}>(QR = gleiche Adresse, aktueller Server-Stand)</span>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2em', listStyleType: 'disc' }}>
            <li style={{ marginBottom: '0.85rem' }}>
              <strong>Galerie:</strong>{' '}
              <a href={urlK2GalerieLive} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>
                {URL_K2_GALERIE}
              </a>
              {presseNachberichtQr.galerie ? (
                <div style={{ marginTop: '0.4rem' }}>
                  <img
                    src={presseNachberichtQr.galerie}
                    alt="QR-Code: Link zur Galerie (aktueller Stand)"
                    width={126}
                    height={126}
                    style={{ display: 'block', borderRadius: 6, background: '#fff', padding: 4 }}
                  />
                </div>
              ) : null}
            </li>
            <li style={{ marginBottom: '0.85rem' }}>
              <strong>Demo / Eingangstor:</strong>{' '}
              <a href={urlMusterEingangstorLive} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>
                {URL_MUSTER_EINGANGSTOR}
              </a>
              {presseNachberichtQr.eingang ? (
                <div style={{ marginTop: '0.4rem' }}>
                  <img
                    src={presseNachberichtQr.eingang}
                    alt="QR-Code: Link Demo / Eingangstor (aktueller Stand)"
                    width={126}
                    height={126}
                    style={{ display: 'block', borderRadius: 6, background: '#fff', padding: 4 }}
                  />
                </div>
              ) : null}
            </li>
            <li style={{ marginBottom: '0.85rem' }}>
              <strong>Präsentationsmappe Vollversion (K2):</strong>{' '}
              <a href={urlPraemappeVollK2Live} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>
                {URL_PRAEMAPPE_VOLL_K2}
              </a>
              {presseNachberichtQr.mapK2 ? (
                <div style={{ marginTop: '0.4rem' }}>
                  <img
                    src={presseNachberichtQr.mapK2}
                    alt="QR-Code: Präsentationsmappe Vollversion K2"
                    width={126}
                    height={126}
                    style={{ display: 'block', borderRadius: 6, background: '#fff', padding: 4 }}
                  />
                </div>
              ) : null}
            </li>
            <li style={{ marginBottom: '0.85rem' }}>
              <strong>Präsentationsmappe Vollversion (ök2, Demo):</strong>{' '}
              <a href={urlPraemappeVollOek2Live} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>
                {URL_PRAEMAPPE_VOLL_OEK2}
              </a>
              {presseNachberichtQr.mapOek2 ? (
                <div style={{ marginTop: '0.4rem' }}>
                  <img
                    src={presseNachberichtQr.mapOek2}
                    alt="QR-Code: Präsentationsmappe Vollversion ök2"
                    width={126}
                    height={126}
                    style={{ display: 'block', borderRadius: 6, background: '#fff', padding: 4 }}
                  />
                </div>
              ) : null}
            </li>
            <li style={{ marginBottom: '0.85rem' }}>
              <strong>Präsentationsmappe Vollversion (VK2):</strong>{' '}
              <a href={urlPraemappeVollVk2Live} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>
                {URL_PRAEMAPPE_VOLL_VK2}
              </a>
              {presseNachberichtQr.mapVk2 ? (
                <div style={{ marginTop: '0.4rem' }}>
                  <img
                    src={presseNachberichtQr.mapVk2}
                    alt="QR-Code: Präsentationsmappe Vollversion VK2"
                    width={126}
                    height={126}
                    style={{ display: 'block', borderRadius: 6, background: '#fff', padding: 4 }}
                  />
                </div>
              ) : null}
            </li>
            <li style={{ marginBottom: 0 }}>
              <strong>Präsentationsmappe Vollversion (VK2 Promo):</strong>{' '}
              <a href={urlPraemappeVollVk2PromoLive} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', wordBreak: 'break-all' }}>
                {URL_PRAEMAPPE_VOLL_VK2_PROMO}
              </a>
              {presseNachberichtQr.mapVk2Promo ? (
                <div style={{ marginTop: '0.4rem' }}>
                  <img
                    src={presseNachberichtQr.mapVk2Promo}
                    alt="QR-Code: Präsentationsmappe Vollversion VK2 Promo"
                    width={126}
                    height={126}
                    style={{ display: 'block', borderRadius: 6, background: '#fff', padding: 4 }}
                  />
                </div>
              ) : null}
            </li>
          </ul>
        </div>

        <h3 style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '1.25rem 0 0.5rem', borderBottom: '1px solid rgba(95,251,241,0.2)', paddingBottom: '0.25rem' }}>
          PRESSEINFORMATION – Variante B (Textkörper, erzählerischer Schwung)
        </h3>
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.06)', borderRadius: '8px', border: '1px solid rgba(95,251,241,0.22)', fontSize: '0.88rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.92)' }}>
          <p style={{ margin: '0 0 0.35rem' }}>
            <strong>Zur Veröffentlichung / Nachbericht</strong>
          </p>
          <p style={{ margin: '0 0 0.75rem' }}>
            <strong>Erfolgreiche Galerieeröffnung · K2 Galerie Kunst &amp; Keramik · Eferding</strong>
          </p>
          <p style={{ margin: '0 0 0.35rem' }}>
            <strong>ORT:</strong> Schlossergasse 4, 4070 Eferding, Österreich
          </p>
          <p style={{ margin: '0 0 1rem' }}>
            <strong>ANLASS:</strong> Eröffnungswochenende <strong>24.–26. April 2026</strong> (wie angekündigt)
          </p>
          <h4 style={{ fontSize: '0.95rem', color: '#5ffbf1', margin: '0 0 0.35rem' }}>Was sich zugetragen hat</h4>
          <p style={{ margin: '0 0 0.45rem', lineHeight: 1.58 }}>
            Drei Tage lang war die <strong>K2 Galerie Kunst &amp; Keramik</strong> in der Schlossergasse mehr als ein neuer Ort – sie wurde zum <strong>Treffpunkt</strong>: Nachbarn, Kunstfreundinnen, Neugierige und Sammlerinnen kamen vorbei, blieben stehen, sprachen mit{' '}
            <strong>Martina und Georg Kreinecker</strong>, mit den Werken, mit der Keramik und den Bildern an den Wänden.
          </p>
          <p style={{ margin: '0 0 0.85rem', lineHeight: 1.58 }}>
            Die <strong>Stimmung</strong> war durchweg <strong>herzlich und lebendig</strong>. Wo Malerei und Keramik <strong>nebeneinander</strong> stehen, entsteht ein Gespräch über Form, Farbe und Handwerk – und genau das ist spürbar gewesen. Mit <strong>rund 30 Verkäufen</strong> im Eröffnungswochenende zeigt sich etwas, das über eine schöne Vernissage hinausgeht: <strong>Interesse</strong>, das <strong>bleibt</strong>, und <strong>Vertrauen</strong> in <strong>Qualität</strong> und <strong>persönliche Beratung</strong>.
          </p>
          <h4 style={{ fontSize: '0.95rem', color: '#5ffbf1', margin: '0.75rem 0 0.35rem' }}>Warum das mehr ist als „ein guter Start“</h4>
          <p style={{ margin: '0 0 0.45rem', fontSize: '0.86rem', lineHeight: 1.58, color: 'rgba(255,255,255,0.9)' }}>
            Für Martina und Georg war die Eröffnung der <strong>sichtbare Teil</strong> eines Weges, der länger vorbereitet war: <strong>Atelier</strong>, <strong>Lager</strong>, <strong>Ausstellung</strong> und <strong>Außenauftritt</strong> gehören bei ihnen zusammen – nicht als Schlagworte, sondern als <strong>Alltag</strong>. Genau deshalb stießen sie im eigenen Betrieb immer wieder auf <strong>viele einzelne Werkzeuge</strong> – Website hier, Kasse dort, Termine und Presse wieder woanders – und auf den Wunsch nach einem <strong>roten Faden</strong>.
          </p>
          <p style={{ margin: '0 0 0.85rem', fontSize: '0.86rem', lineHeight: 1.58, color: 'rgba(255,255,255,0.9)' }}>
            Daraus entstand <strong>intern</strong> eine <strong>einheitlichere Lösung</strong> (K2-Plattform): <strong>aus der Praxis</strong>, <strong>ohne</strong> den Ton üblicher <strong>Software-Werbung</strong> oder großer <strong>Tech-Konzerne</strong>. Die Galerie ist das <strong>Schaufenster</strong>; dahinter steckt dieselbe <strong>Haltung</strong>: <strong>zu Ende bringen</strong>, <strong>sauber arbeiten</strong>, Menschen nicht mit „Tool-Chaos“ alleinlassen.
          </p>
          <h4 style={{ fontSize: '0.95rem', color: '#5ffbf1', margin: '0 0 0.35rem' }}>Menschen hinter dem Projekt</h4>
          <p style={{ margin: '0 0 0.45rem', lineHeight: 1.58 }}>
            <strong>Martina Kreinecker</strong> trägt die <strong>künstlerische und galeristische</strong> Arbeit. <strong>Georg Kreinecker</strong> kommt aus <strong>Handwerk und Meisterprüfung</strong>, aus einem <strong>eigenen produzierenden Unternehmen</strong> und aus <strong>vielen Jahren internationalem Handel und Beratung</strong> im Maschinen- und Anlagenbau. Wer solche Biografien zusammenbringt, versteht vielleicht besser, warum <strong>Stückwerk</strong> am Markt selten reicht, wenn <strong>Galerie, Kasse und Öffentlichkeitsarbeit</strong> zusammengehören sollen.
          </p>
          <p style={{ margin: '0 0 0.85rem', lineHeight: 1.58 }}>
            <strong>Kein Tech-Konzern</strong> – sondern Menschen, die <strong>Freude an der Sache</strong> haben und <strong>weitermachen</strong>. Mit einem Augenzwinkern: Wer so arbeitet, hört nicht einfach auf.
          </p>
          <h4 style={{ fontSize: '0.95rem', color: '#5ffbf1', margin: '0 0 0.35rem' }}>FÜR REDAKTIONEN</h4>
          <ul style={{ margin: '0 0 0.85rem', paddingLeft: '1.2em' }}>
            <li>
              <strong>Ausstellung</strong> weiterhin über die <strong>öffentliche Galerie</strong> im Netz einsehbar (Werke, Kontakt, Öffnungszeiten).
            </li>
            <li>
              <strong>Bildmaterial</strong> und <strong>Interview</strong> auf Anfrage über die unten genannten Kontaktdaten.
            </li>
          </ul>
          <h4 style={{ fontSize: '0.95rem', color: '#5ffbf1', margin: '0 0 0.35rem' }}>KONTAKT &amp; Links</h4>
          <p style={{ margin: '0 0 0.35rem' }}>Mit freundlichen Grüßen</p>
          <p style={{ margin: '0 0 0.5rem' }}>Georg Kreinecker</p>
          <p style={{ margin: '0 0 0.25rem' }}>
            <strong>E-Mail:</strong> georg.kreinecker@kgm.at · <strong>Telefon:</strong> 0664 1046337
          </p>
          <p style={{ margin: '0 0 0.35rem' }}>
            <strong>Adresse:</strong> Schlossergasse 4, 4070 Eferding · <strong>Öffnungszeiten:</strong> Samstag 9.30–14.00 Uhr
          </p>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.55 }}>
            <strong>Links und QR-Codes:</strong> siehe Block <strong>Variante A</strong> oben (Galerie, Demo, Präsentationsmappen – jeweils mit QR zum Scannen).
          </p>
        </div>

        <h3 style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '1rem 0 0.5rem', borderBottom: '1px solid rgba(95,251,241,0.2)', paddingBottom: '0.25rem' }}>
          Verknüpfung (Repo)
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.85rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.88)' }}>
          <li>
            <code style={{ fontSize: '0.82em', color: '#5ffbf1' }}>docs/oeffentlichkeitsarbeit/presseaussendung-fertig/PRESSE-AUSSENDUNG-ARCHIV-2026-04-01-WELS.md</code> – erste Aussendung (Ton &amp; Struktur)
          </li>
          <li>
            <code style={{ fontSize: '0.82em', color: '#5ffbf1' }}>docs/MEDIENSTUDIO-K2.md</code> – §1a Presse-Story
          </li>
        </ul>
      </section>
      {/* Entwürfe Öffentlichkeitsarbeit – Feinschliff: Taschen, Flyer, großer Markt, QR (zum Ausfüllen in den Modals) */}
      <section id="mok2-entwuerfe-oeffentlichkeitsarbeit" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Entwürfe Öffentlichkeitsarbeit (Feinschliff)
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.55 }}>
          Diese Entwürfe kannst du in den einzelnen Modals der <strong>Öffentlichkeitsarbeit K2</strong> (Admin → Eventplanung → Öffentlichkeitsarbeit) nutzen: Copy-Paste, anpassen, mit QR/Bild ergänzen. Lokale Öffentlichkeit + Freundeskreis (K2 + ök2) und großer Markt (nur ök2) getrennt.
        </p>

        <h3 style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '1rem 0 0.5rem', borderBottom: '1px solid rgba(95,251,241,0.2)', paddingBottom: '0.25rem' }}>1. Papiertaschen (beidseitig)</h3>
        <p style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}><strong>Seite 1 – K2 (Galerie Eröffnung):</strong></p>
        <div style={{ padding: '0.6rem 0.9rem', background: 'rgba(95,251,241,0.06)', borderRadius: '8px', borderLeft: '3px solid #5ffbf1', marginBottom: '0.75rem', fontSize: '0.88rem', lineHeight: 1.5 }}>
          <p style={{ margin: 0 }}>K2 Galerie Kunst &amp; Keramik · Eröffnung [Datum] · Schlossergasse 4, 4070 Eferding · [QR-Code → Galerie/Willkommen] · Öffnungszeiten, Kontakt, kurzer Einladungstext.</p>
        </div>
        <p style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}><strong>Seite 2 – ök2 (für den Markt):</strong></p>
        <div style={{ padding: '0.6rem 0.9rem', background: 'rgba(95,251,241,0.06)', borderRadius: '8px', borderLeft: '3px solid #5ffbf1', marginBottom: '0.5rem', fontSize: '0.88rem', lineHeight: 1.5 }}>
          <p style={{ margin: 0 }}>ök2 – für die Kunst gemacht, für den Markt. Deine Galerie im Netz, eine Plattform für Künstler:innen und Galerien. [QR-Code → Demo/Entdecken] · [Bild/Logo] · Slogan, 2–3 Zeilen USP.</p>
        </div>

        <h3 style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '1rem 0 0.5rem', borderBottom: '1px solid rgba(95,251,241,0.2)', paddingBottom: '0.25rem' }}>2. Flyer (beidseitig)</h3>
        <p style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>Gleiche Logik wie Taschen: <strong>Seite 1</strong> = K2 (Eröffnung, Adresse, QR Galerie), <strong>Seite 2</strong> = ök2 (Plattform, Demo, QR Entdecken). In den Admin-Modals (Flyer, Presse, Plakat) die Texte pro Seite eintragen bzw. als „Seite 1“ / „Seite 2“ in der Vorlage führen.</p>

        <h3 style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '1rem 0 0.5rem', borderBottom: '1px solid rgba(95,251,241,0.2)', paddingBottom: '0.25rem' }}>3. Großer Markt (nur ök2)</h3>
        <p style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>Für den großen Markt zählt nur ök2 – keine Erwähnung Eferding/Galerie vor Ort.</p>
        <div style={{ padding: '0.6rem 0.9rem', background: 'rgba(95,251,241,0.06)', borderRadius: '8px', borderLeft: '3px solid #5ffbf1', marginBottom: '0.5rem', fontSize: '0.88rem', lineHeight: 1.5 }}>
          <p style={{ margin: 0 }}><strong>Kernbotschaft:</strong> ök2 – für die Kunst gemacht, für den Markt. Plattform für Künstler:innen, Galerien und Kunstvereine: eigene Galerie, Werke, Events, Einladungen und Presse aus einer Hand. [QR → Demo/Willkommensseite] · Zielgruppe: Künstler:innen, kleine Galerien, Kunstvereine – nicht „Besucher vor Ort“.</p>
        </div>

        <h3 style={{ fontSize: '1.05rem', color: '#5ffbf1', margin: '1rem 0 0.5rem', borderBottom: '1px solid rgba(95,251,241,0.2)', paddingBottom: '0.25rem' }}>4. QR-Strategie</h3>
        <ul style={{ margin: 0, paddingLeft: '1.2em', fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
          <li><strong>Lokal (Tasche/Flyer K2-Seite):</strong> QR → K2 Galerie / Willkommen / Eröffnung ({URL_K2_GALERIE}).</li>
          <li><strong>Großer Markt (ök2-Seite oder reine ök2-Flyer):</strong> QR → nur Demo / Entdecken ({URL_MUSTER_EINGANGSTOR}) – kein Link zur physischen Galerie.</li>
        </ul>
        <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>Diese Entwürfe in den Modals (Presse, Flyer, Plakat, Social) verwenden: Abschnitt kopieren, in das jeweilige Modal einfügen, QR und Bilder aus der App ergänzen.</p>
      </section>
      {/* 4a. Kanäle 2026 – kurze Liste zum Ausfüllen und Prüfen */}
      <section id="mok2-kanale-2026" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Kanäle 2026
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
          Drei Kanäle – hier eintragen und einmal pro Quartal prüfen. So bleibt die Vermarktung fokussiert.
        </p>
        <ol style={{ lineHeight: 1.7, paddingLeft: '1.5em', margin: 0 }}>
          <li>
            <strong>Empfehlungs-Programm</strong> – Nutzer:innen werben mit Empfehler-ID; 10 % Rabatt für den Geworbenen, 10 % Gutschrift für den Empfehler/die Empfehlerin. <a href="#mok2-so-empfiehlst-du" style={{ color: '#5ffbf1', textDecoration: 'none' }}>Kurz-Anleitung „So empfiehlst du“</a>. Details: <a href="#mok2-6" style={{ color: '#5ffbf1', textDecoration: 'none' }}>Sektion 6</a>.
          </li>
          <li>
            <strong>Kooperation (Ziel eintragen):</strong> z. B. Kunstverein / Verband (VK2), Messe, Atelier-Netzwerk. <em style={{ color: 'rgba(255,255,255,0.7)' }}>→ Hier konkreten Namen oder Ziel eintragen, ersten Kontakt planen.</em>
          </li>
          <li>
            <strong>Landing / CTA:</strong> Eine klare Einstiegs-URL für alle Texte (Flyer, Social, E-Mail-Signatur).{' '}
            <a href={urlMusterEingangstorLive} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', fontWeight: 600 }}>
              {BASE_APP_URL}{OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE}
            </a>
            {' '}(Eingangstor – Demo, Vorschau, Lizenz anfragen).
          </li>
        </ol>
      </section>

      {/* 4b. Was wir gemeinsam verbessern können – Vorschlag (Vermarktung & Strategie) */}
      <section id="mok2-verbesserungen" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#22c55e', marginBottom: '0.75rem', borderBottom: '1px solid rgba(34,197,94,0.4)', paddingBottom: '0.35rem' }}>
          Was wir gemeinsam verbessern können
        </h2>
        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
          Konkreter Vorschlag für Vermarktung und Strategie: Zielgruppe schärfen, Kanäle festlegen, Customer Journey und Trust schrittweise ausbauen. Priorisierte Liste mit nächsten Schritten – zum gemeinsamen Abarbeiten.
        </p>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', marginBottom: '1rem' }}>
          <li><strong>Priorität 1:</strong> Zielgruppe in einem Satz festhalten; klarer „Nächster Schritt“ nach der Demo (z. B. „Lizenz anfragen“); „Kanäle 2026“ in mök2 eintragen.</li>
          <li><strong>Priorität 2:</strong> Lizenz-Pakete nach außen sichtbar; Kurz-Anleitung „So empfiehlst du die K2 Galerie“; Trust-Checkliste (AGB, Datenschutz, Support).</li>
          <li><strong>Priorität 3:</strong> Eine konkrete Kooperation anvisieren; Customer Journey ausformulieren; Erfolg messbar machen.</li>
        </ul>
        <p style={{ padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.12)', borderRadius: '8px', borderLeft: '4px solid #22c55e', fontSize: '0.95rem', lineHeight: 1.5 }}>
          <strong>Vollständiger Vorschlag (zum Lesen & Abhaken):</strong>{' '}
          <code style={{ color: '#22c55e' }}>docs/VERBESSERUNGEN-VERMARKTUNG-GEMEINSAM.md</code>
          {' '}– dort: Vermarktungsstrategie 1.0 (Zielgruppe, Kanäle, Customer Journey, Trust) + priorisierte Verbesserungspunkte.
        </p>
        <p style={{ padding: '0.75rem 1rem', background: 'rgba(95, 251, 241, 0.1)', borderRadius: '8px', borderLeft: '4px solid #5ffbf1', fontSize: '0.95rem', lineHeight: 1.5, marginTop: '0.75rem' }}>
          <strong>Feature-Ideen Abhebung:</strong>{' '}
          <code style={{ color: '#5ffbf1' }}>docs/FEATURES-ABHEBUNG-ZIELGRUPPE.md</code>
          {' '}– welche Features die Zielgruppe noch mehr ansprechen (Belege/Kasse, Teilen-Link, Käufer:innen-Liste, Präsentationsmodus …); Priorität & Aufwand, Reihenfolge zum Einbauen.
        </p>
        <p style={{ padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.12)', borderRadius: '8px', borderLeft: '4px solid #22c55e', fontSize: '0.95rem', lineHeight: 1.5, marginTop: '0.75rem' }}>
          <strong>Schritt-für-Schritt-Plan:</strong>{' '}
          <code style={{ color: '#22c55e' }}>docs/PLAN-SCHRITT-FUER-SCHRITT.md</code>
          {' '}– gemeinsamer Plan zum Abarbeiten (Basis abhaken → ein Feature wählen → Pilot-Verein → Onboarding). Ein Schritt nach dem anderen.
        </p>
      </section>

      {/* 5. Weitere Ideen & Konzepte – Sammlung für spätere Ausarbeitung */}
      <section id="mok2-5" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          5. Weitere Ideen & Konzepte (Sammlung)
        </h2>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
          Ideen für spätere Phasen – hier gesammelt, in anderen Sektionen oder der Roadmap ausgearbeitet.
        </p>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li>
            <strong>Texte &amp; KI:</strong> Lizenznehmer:innen brauchen keine eingebaute KI – eigenes Werkzeug, Text in die App einfügen;{' '}
            <a href="#mok2-texte-ki-freiheit" style={{ color: '#5ffbf1', textDecoration: 'none' }}>Sektion „Texte &amp; KI – eigenes Werkzeug“</a>.
            Optional: später integrierter Assistent (Chat/API) für die, die es wollen.
          </li>
          <li>Vermarktbare Version: Eine Instanz pro Künstler:in (eigene URL/Subdomain), später Multi-Tenant möglich.</li>
        </ul>
      </section>

      {/* Vermarktungskonzept: Empfehlungs-Programm – als PDF abgelegt */}
      <section id="mok2-6" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          6. Vermarktungskonzept: Empfehlungs-Programm (Vertrieb durch Nutzer:innen)
        </h2>
        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
          Nutzer:innen werben weitere Künstler:innen; Geworbene erhalten 10 % Rabatt, Empfehler:innen erhalten 10 % Gutschrift über eine persönliche Empfehler-ID.
        </p>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li><strong>Grundidee:</strong> Vertrieb durch die Nutzer:innen – Künstler:innen empfehlen die K2 Galerie weiter. Wer wirbt, erhält 10 % Gutschrift; der Geworbene erhält 10 % Rabatt. Jede:r hat eine eindeutige Empfehler-ID; trägt ein neuer Nutzer diese ID ein, wird die Gutschrift zugeordnet.</li>
          <li><strong>Ablauf:</strong> Nutzer:in A erhält in der App eine Empfehler-ID (z. B. Einstellungen → Empfehlungs-Programm), gibt sie an B weiter; B trägt die ID bei Registrierung/Lizenz-Abschluss ein → 10 % Rabatt für B, 10 % Gutschrift für A.</li>
          <li><strong>Empfehler-ID:</strong> Eindeutig pro Nutzer:in, gut kommunizierbar (z. B. K2-XXXX-YYYY). Optional: Empfehlungs-Link mit ID als Parameter.</li>
          <li><strong>Vergütung:</strong> 10 % Gutschrift für den Empfehler/die Empfehlerin, 10 % Rabatt für den Geworbenen. Bei <strong>jeder</strong> Lizenz-Erfassung wird die Gutschrift zugeordnet. Ausgestaltung: Gutschrift, Auszahlung oder Gutschein je nach Betriebsmodell.</li>
          <li><strong>In der App:</strong> ID anzeigen/kopieren (Einstellungen / Empfehlungs-Programm); Eingabe der ID bei Registrierung oder Checkout; bei Speicherung ID prüfen und 10 %-Rabatt bzw. 10 %-Gutschrift anwenden.</li>
          <li><strong>Rechtliches:</strong> Transparenz in AGB (Wer, wie, wann); Datenschutz nur für Zuordnung; Missbrauch vermeiden (keine Selbstempfehlung, ID nur gültigen Konten zuordnen).</li>
        </ul>
      </section>

      {/* 6a. Kurz-Anleitung: So empfiehlst du die K2 Galerie (für Nutzer:innen) */}
      <section id="mok2-so-empfiehlst-du" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          So empfiehlst du die K2 Galerie (Kurz-Anleitung)
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
          Für Nutzer:innen – in 3 Schritten: ID/Link holen, teilen, Geworbene nutzt Link. Die Person erhält 10 % Rabatt, du erhältst 10 % Gutschrift, wenn sie deine Empfehlung annimmt.
        </p>
        <ol style={{ lineHeight: 1.7, paddingLeft: '1.5em', margin: '0 0 1rem' }}>
          <li><strong>Wo finde ich meine Empfehler-ID?</strong> In der App: <strong>Einstellungen → Empfehlungs-Programm</strong> (oder über mök2: <strong>Empfehlungstool</strong>). Dort siehst du deine ID und einen <strong>Empfehlungs-Link</strong> – Link kopieren oder „E-Mail öffnen“ / „WhatsApp teilen“.</li>
          <li><strong>Wem gebe ich den Link?</strong> Freund:innen, anderen Künstler:innen, Galerien – allen, die eine eigene Galerie-Webseite + Kasse + Werbung aus einer Hand suchen.</li>
          <li><strong>Was passiert bei der Person?</strong> Sie öffnet den Link → Willkommensseite (Demo, Vorschau, „Lizenz anfragen“). Wenn sie eine Lizenz abschließt und deine Empfehlung annimmt (der Link enthält deine ID), erhält sie <strong>10 % Rabatt</strong> und du <strong>10 % Gutschrift</strong>.</li>
        </ol>
        <p style={{ padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.1)', borderRadius: '8px', borderLeft: '4px solid #5ffbf1', fontSize: '0.9rem', lineHeight: 1.5 }}>
          <strong>Kurz:</strong> Link im Empfehlungstool kopieren → per E-Mail oder WhatsApp teilen → Geworbene nutzt Link und kann beim Lizenzabschluss deine Empfehlung annehmen. Fertig.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          <Link to={PROJECT_ROUTES['k2-galerie'].empfehlungstool} style={{ color: '#5ffbf1', fontWeight: 600, textDecoration: 'none' }}>
            → Empfehlungstool öffnen (ID + Link + vorgefertigter Text)
          </Link>
        </p>
      </section>

      {/* 7. Promotion für alle Medien – ök2 perfekt präsentieren */}
      <section id="mok2-7" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          7. Promotion für alle Medien – ök2 perfekt präsentieren
        </h2>

        {/* Strategie: Verbindliche Werbelinie – auf jeder Werbemaßnahme */}
        <div style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem', background: 'rgba(181, 74, 30, 0.15)', borderRadius: '10px', border: '2px solid rgba(181, 74, 30, 0.5)' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#ff8c42', margin: '0 0 0.5rem', fontWeight: 700 }}>Werbelinie &amp; Strategie (verbindlich)</h3>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.9)' }}>
            Diese beiden Sätze sind unsere <strong>markante Werbelinie</strong> und müssen auf <strong>allen</strong> Werbemaßnahmen prägend erscheinen: Presse, Flyer, Plakat, Web, Social, Prospekt – jede Dokumentation, die nach außen geht, trägt beide Slogans. <strong>Alle Strategiepapiere</strong> (docs, Handbuch, Eröffnungs-Marketing) sind auf diese Werbelinie ausgerichtet.
          </p>
          <p style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', lineHeight: 1.45, color: '#fff', fontWeight: 600 }}>1. {PRODUCT_WERBESLOGAN}</p>
          <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.45, color: 'rgba(255,255,255,0.95)' }}>2. {PRODUCT_WERBESLOGAN_2}</p>
          <p style={{ margin: '0.75rem 0 0', fontSize: '1.05rem', lineHeight: 1.45, color: '#5ffbf1', fontWeight: 600 }}>Positionierung: {PRODUCT_POSITIONING_SOCIAL} {PRODUCT_KERN_EIGENER_ORT}</p>
        </div>

        <p style={{ marginBottom: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.1)', borderRadius: '8px', borderLeft: '4px solid #5ffbf1', fontSize: '1.05rem', lineHeight: 1.5 }}>
          <strong>1. Werbeslogan:</strong> {PRODUCT_WERBESLOGAN}
        </p>
        <p style={{ marginBottom: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.1)', borderRadius: '8px', borderLeft: '4px solid #5ffbf1', fontSize: '1.05rem', lineHeight: 1.5 }}>
          <strong>2. Zweiter Satz (immer mit Slogan 1):</strong> {PRODUCT_WERBESLOGAN_2}
        </p>
        <p style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.1)', borderRadius: '8px', borderLeft: '4px solid #5ffbf1', fontSize: '1.05rem', lineHeight: 1.5 }}>
          <strong>3. Wichtige Botschaft (Empfehlungs-Programm):</strong> {PRODUCT_BOTSCHAFT_2}
        </p>
        <p style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.12)', borderRadius: '8px', borderLeft: '4px solid #5ffbf1', fontSize: '1.05rem', lineHeight: 1.5 }}>
          <strong>Positionierung zu Social Media (für alle Kanäle):</strong> {PRODUCT_POSITIONING_SOCIAL} {PRODUCT_KERN_EIGENER_ORT}
        </p>
        <p style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.12)', borderRadius: '8px', borderLeft: '4px solid #22c55e', fontSize: '1.05rem', lineHeight: 1.5 }}>
          <strong>4. Zentrale Information für Außenkommunikation (Werbung, Marketing, Presse):</strong> Es handelt sich hier <strong>nicht um eine normale App</strong>, sondern um eine <strong>multifunktionale Arbeitsplattform am PC/Mac</strong> – mit Galerie, Kassa, Veröffentlichen, Planung und Werbeunterlagen aus einer Hand. Mobil: Galerie und Kassa, gleicher Stand. In dieser Kombination sind wir in diesem Feld <strong>einzigartig</strong> – das soll in der Kommunikation nach außen klar werden.
        </p>
        <p style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(139, 92, 246, 0.12)', borderRadius: '8px', borderLeft: '4px solid #8b5cf6', fontSize: '1.05rem', lineHeight: 1.5 }}>
          <strong>5. Unsere Zielgruppe (ein Satz):</strong> {PRODUCT_ZIELGRUPPE}
        </p>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', marginTop: '1rem', marginBottom: '0.5rem' }}>Warum brauchen Künstler:innen das?</h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li>Künstler:innen wollen <strong>sichtbar sein</strong> – Webauftritt, Werke, Events – ohne IT-Kenntnisse und ohne viele getrennte Tools.</li>
          <li>Du brauchst <strong>eine zentrale Stelle</strong>: Galerie, Verkauf vor Ort (Kasse), Einladungen, Presse, Social Media – sonst geht Zeit und Konsistenz verloren.</li>
          <li>Professionelle <strong>Werkfotos und Druckmaterial</strong> (Flyer, Plakat, Newsletter) aus den eigenen Daten – ohne Agentur oder teure Software.</li>
        </ul>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', marginTop: '1rem', marginBottom: '0.5rem' }}>Was macht den Unterschied zu Produkten am Markt?</h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li><strong>Nicht nur App – multifunktional am PC/Mac:</strong> Volle Arbeitsplattform am Rechner (Planung, Veröffentlichen, Werbeunterlagen), dazu Galerie & Kassa mobil – gleicher Stand überall. In dieser Form einzigartig.</li>
          <li><strong>Alles in einer App:</strong> Website-Builder, Shops, Event-Tools und Kasse sind sonst getrennt – hier eine Oberfläche, eine Datenbasis, ein Design.</li>
          <li><strong>Sprache und Begriffe für Künstler:innen:</strong> Werke, Events, Stammdaten, Öffentlichkeitsarbeit – kein abstraktes „CMS“ oder „Items“.</li>
          <li><strong>Marketing aus einem Guss:</strong> Newsletter, Plakat, Presse und Social Media werden aus denselben Stammdaten erzeugt – einheitlich, sofort nutzbar (QR in Plakat, Flyer und Newsletter integriert).</li>
          <li><strong>Plattformneutral:</strong> Windows, Android, Mac, iOS – Browser/PWA, keine App-Store-Pflicht, keine Mac-Pflicht für Kunden.</li>
          <li><strong>Für breite Vermarktung:</strong> Alle produktiven Funktionen laufen ohne Mac; Entwickler-Tools (APf) bleiben optional am Rechner. Technische Details und Skalierung stehen in der Produkt-Doku.</li>
          <li><strong>Fotostudio in der App:</strong> Objektfreistellung und Pro-Hintergrund im Browser, ideal für Fotos vom Handy/Tablet – ohne externe Dienste.</li>
          <li><strong>Vereinsfähig (VK2):</strong> Für alle Vereine – gemeinsame Interessen, eine Mitgliederliste, Vereinsauftritt, Events. Kunstvereine = Einstieg. Ab 10 eingetragenen Mitgliedern für den Verein kostenfrei.</li>
          <li><strong>Empfehlungsprogramm:</strong> Vertrieb durch Nutzer:innen – Empfehler-ID, 10 % Rabatt/Gutschrift, Link teilen. In dieser Branche einzigartig.</li>
        </ul>
        <p style={{ marginTop: '0.5rem', fontSize: '0.88rem' }}>
          <a href="#mok2-produkt-branchenvergleich" style={{ color: '#5ffbf1', textDecoration: 'none' }}>→ Ausführlicher <strong>Produkt- &amp; Branchenvergleich</strong> (Markt vs. ök2, Vorteile auf einen Blick)</a>
        </p>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', marginTop: '1rem', marginBottom: '0.5rem' }}>Wodurch zeichnet sich das Produkt besonders aus?</h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li><strong>Eine Oberfläche, alle Geräte:</strong> Admin am Rechner, Galerie und Kasse auf Tablet/Handy – gleicher Stand per QR, kein Chaos.</li>
          <li><strong>PR-Vorschläge aus deinen Daten:</strong> Event anlegen → fertige Texte und Formate für Newsletter, Presse, Social Media, Flyer, Plakat – im Galerie-Design.</li>
          <li><strong>Kasse & Etiketten:</strong> Verkauf vor Ort direkt aus der App; Etikettendruck (z. B. Brother QL) mit Werk-Nummer, Titel, QR – WLAN-fähig. Verkaufs- und Lagerstatistik drucken, Bestand im Blick – einfache Kassa und Lagerhaltung in einer Oberfläche.</li>
          <li><strong>Datensouveränität:</strong> Lokale Speicherung, Backup & Wiederherstellung – deine Daten bleiben unter deiner Kontrolle.</li>
          <li><strong>Deutsche UI, seriös:</strong> Keine Anglizismen-Flut; klare, professionelle Oberfläche für Galerien und Ateliers.</li>
          <li><strong>Empfehlungsprogramm:</strong> Vertrieb durch Nutzer:innen – persönliche Empfehler-ID, 10 % Rabatt für Geworbene, 10 % Gutschrift für Empfehler. In dieser Branche einzigartig.</li>
        </ul>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', marginTop: '1rem', marginBottom: '0.5rem' }}>Welchen Benefit hat der Nutzer?</h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li><strong>Zeit sparen:</strong> Kein Springen zwischen Website, Kasse, E-Mail-Tool und Social Media – alles an einem Ort.</li>
          <li><strong>Professioneller Auftritt:</strong> Einheitliche Werbelinie, professionelle Werkfotos, fertige PR-Texte – ohne Agentur.</li>
          <li><strong>Flexibilität:</strong> Am Rechner planen, unterwegs oder am Stand verkaufen und präsentieren – eine App, überall.</li>
          <li><strong>Kontrolle:</strong> Eigene Daten, Backup, keine Abhängigkeit von einem einzelnen Gerät oder Anbieter.</li>
        </ul>

        <p style={{ marginTop: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
          <strong>Für alle Medien nutzbar:</strong> Diese Punkte eignen sich für Web-Text, Social-Posts, Pitch, Presse, Flyer und Verkaufsgespräche – einheitliche Botschaft, angepasst an Länge und Kanal.
        </p>
      </section>

      {/* 8. APf-Struktur: Marketingarbeit organisieren */}
      <section id="mok2-8" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          8. APf-Struktur: Marketingarbeit am besten organisieren
        </h2>
        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
          So behältst du auf der APf den Überblick und arbeitest zielgerichtet – von der Botschaft bis zur Umsetzung in allen Kanälen.
        </p>
        <ol style={{ lineHeight: 1.7, paddingLeft: '1.5em', margin: 0 }}>
          <li><strong>Botschaft & Texte (eine Quelle):</strong> Alle Kernaussagen, USPs und Benefits liegen hier auf <strong>Marketing ök2</strong> (diese Seite). Von hier aus kopierst du für Web, Social, Presse, Pitch – eine Quelle, konsistent.</li>
          <li><strong>Medien-Kanäle planen:</strong> Web (Landingpage, ök2-Demo), Social (Posts, Stories), Print (Flyer, Plakat), Presse (Einladung, PM), Pitch (Gespräche, Partner). Pro Kanal: Ziel, Zielgruppe, Ton – kurz auf dieser Seite oder in deinen Notizen festhalten.</li>
          <li><strong>Content-Bausteine ablegen:</strong> Kurzversion (1–2 Sätze), Mittelversion (Absatz), Langversion (wie Sektion 7 oben) – alle hier auf Marketing ök2. Beim Erstellen von Posts oder Presse: passende Länge wählen.</li>
          <li><strong>Zeitplan & To-dos:</strong> Nutze den <strong>Plan</strong> (Projekt → Plan) für Phasen wie „Slogan & Story“, „Social aktiv“, „Content-Plan“, „Pressepartner“. Offene Punkte dort abhaken.</li>
          <li><strong>Materialien aus der App:</strong> Flyer, Plakat, Newsletter, Presse – werden in der Galerie-App aus Stammdaten & Events erzeugt (Control-Studio / Öffentlichkeitsarbeit). Nicht doppelt pflegen: Stammdaten aktuell halten, dann Materialien generieren.</li>
          <li><strong>Empfehlungs-Programm:</strong> Vertrieb durch Nutzer:innen (Sektion 6) – ID-Konzept und 10 % Rabatt/Gutschrift für Partner und geworbene Künstler:innen kommunizieren.</li>
          <li><strong>Rückblick:</strong> Regelmäßig prüfen: Welche Kanäle laufen? Was bringt Anfragen? Nächste Schritte im Plan ergänzen und hier auf Marketing ök2 die Botschaften bei Bedarf schärfen.</li>
        </ol>
        <p style={{ marginTop: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
          <strong>Kurz:</strong> Marketing ök2 = deine zentrale Text- und Strukturquelle auf der APf. Plan = dein Fortschritt. Galerie-App = deine druckfertigen Materialien. So bleibt die Marketingarbeit übersichtlich und wiederverwendbar.
        </p>
      </section>

      {/* 9. Werbeunterlagen (mök2) – klar strukturiert, bearbeitbar */}
      <section id="mok2-9" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          9. Werbeunterlagen (mök2)
        </h2>
        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
          Prospekt, Social-Media-Masken und bearbeitbare Slogan-/Botschaftstexte gehören zu dieser Seite (mök2). <strong>Druckfertige Event-Formate</strong> laufen über <strong>einen</strong> Einstieg in der Galerie-App: den <strong>Flyer-Master</strong> (A4 mit zwei A5-Seiten). Alles Weitere ist nur eine andere Ansicht derselben Daten – <strong>kein zweiter Bau</strong>, kein eigener Plakat-Pfad. In der Demo nutzt du <strong>Muster-Stammdaten und Muster-Event</strong>; Inhalte kommen aus der App, nicht aus den Strategietexten hier.
        </p>
        <ol style={{ lineHeight: 1.7, paddingLeft: '1.5em', margin: '0 0 1rem' }}>
          <li><strong>Prospekt</strong> – Deckblatt, Kernbotschaften, USPs (A4, 1 Seite, druckbar)</li>
          <li><strong>Social-Media-Masken</strong> – Instagram Quadrat/Story, Facebook, LinkedIn (Standardformate)</li>
          <li><strong>Flyer-Master (A4, 2× A5)</strong> – eine Quelle; in der Demo Muster-Galerie links, Plattform rechts</li>
          <li><strong>Plakat A3 hochkant</strong> – nur Ableitung vom Flyer-Master, druckfertig</li>
          <li><strong>Flyer A6 quer</strong> – nur Ableitung vom Flyer-Master</li>
          <li><strong>Visitenkarte (55 × 85 mm)</strong> – nur Ableitung vom Flyer-Master</li>
          <li><strong>Flyer A5 Produkt</strong> – Slogan und Botschaft (separates Format auf Werbeunterlagen-Seite)</li>
        </ol>
        <div style={{ marginBottom: '1rem', padding: '0.7rem 0.8rem', border: '1px solid rgba(95,251,241,0.3)', borderRadius: '10px', background: 'rgba(95,251,241,0.08)' }}>
          <p style={{ margin: '0 0 0.45rem', fontSize: '0.92rem', color: 'rgba(255,255,255,0.95)' }}>
            <strong>Fertige Werbemittel (Demo / Muster, druckbereit) – roter Faden:</strong> zuerst Master öffnen, dann bei Bedarf A3, A6 oder Karte.
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2em', lineHeight: 1.65 }}>
            <li>
              <Link
                to={flyerEventBogenUrl({ tenant: 'oeffentlich' })}
                style={{ color: '#5ffbf1', fontWeight: 600, textDecoration: 'none' }}
              >
                Flyer-Master öffnen (A4 / 2× A5) →
              </Link>
            </li>
            <li>
              <Link
                to={flyerEventBogenUrl({ mode: 'a3', tenant: 'oeffentlich', fromPublicGalerie: true })}
                style={{ color: '#5ffbf1', fontWeight: 600, textDecoration: 'none' }}
              >
                Plakat A3 (vom Master) →
              </Link>
            </li>
            <li>
              <Link
                to={flyerEventBogenUrl({ mode: 'a6', tenant: 'oeffentlich', fromPublicGalerie: true })}
                style={{ color: '#5ffbf1', fontWeight: 600, textDecoration: 'none' }}
              >
                Flyer A6 quer (vom Master) →
              </Link>
            </li>
            <li>
              <Link
                to={flyerEventBogenUrl({ mode: 'card', tenant: 'oeffentlich', fromPublicGalerie: true })}
                style={{ color: '#5ffbf1', fontWeight: 600, textDecoration: 'none' }}
              >
                Visitenkarte 55 × 85 (vom Master) →
              </Link>
            </li>
          </ul>
        </div>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.88)' }}>
          Die <strong>Präsentationsmappen</strong> (Kurzfassungen ök2/VK2 zum Link-Mitsenden) sind unter Werbeunterlagen verlinkt. Für eine <strong>richtige Präsentationsmappe</strong> (wie ein Handbuch aufgebaut, Marketing-Stil, mit Produktbildern) gibt es Konzept und Struktur: <code>docs/PRAESENTATIONSMAPPE-VOLLVERSION-KONZEPT.md</code>.
        </p>
        <p>
          <Link
            to={`${PROJECT_ROUTES['k2-galerie'].werbeunterlagen}?context=oeffentlich`}
            style={{ color: '#5ffbf1', fontWeight: 600, textDecoration: 'none' }}
          >
            📁 Werbeunterlagen öffnen & Texte bearbeiten →
          </Link>
        </p>
      </section>

      {/* 10. Lizenzen (mök2) – Konditionen, Vergebung, Abrechnung Empfehlungs-Programm */}
      <section id="mok2-10" style={{ marginBottom: '2rem' }}>
        <div
          style={{
            background: 'rgba(251,191,36,0.12)',
            border: '1px solid rgba(251,191,36,0.45)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            color: 'rgba(255,255,255,0.92)',
          }}
        >
          <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '0.35rem' }}>📅 Zeitplan Lizenzen</div>
          <div style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
            <strong>Öffentliche Lizenzanmeldung / regulärer Standardstart ab 01. Mai.</strong> Bis dahin kein allgemeiner Selbstservice für alle Interessent:innen als fester Produktstart.
            <br />
            <strong>Testpilot:innen</strong> arbeiten nach <strong>Einladung und Vereinbarung</strong> früher; Zugang und ggf. Online-Zahlung werden individuell freigegeben.
          </div>
        </div>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          10. Lizenzen (Konditionen & Vergebung)
        </h2>
        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
          Lizenz-Stufen (Basic, Pro, Pro+, Pro++, VK2), Preismodelle und die <strong>Vergabe von Lizenzen</strong> gehören zur Vertriebs-Arbeitsplattform. Beim Vergeben kann optional eine <strong>Empfehler-ID</strong> erfasst werden – Grundlage für die automatisierte Abrechnung des Empfehlungs-Programms (Multi-Level-Vergütung). <strong>Lizenz jederzeit durch den Nutzer beendbar</strong>, keine Mindestlaufzeit, keine Bindung – Ausstieg so einfach wie Einstieg (AGB §10). Doku: <code>docs/LICENCE-STRUKTUR.md</code>, <code>docs/ABRECHNUNGSSTRUKTUR-EMPFEHLUNGSPROGRAMM.md</code>.
        </p>
        <h3
          id="mok2-10-lizenz-abschliessen"
          style={{ fontSize: '1.08rem', color: '#5ffbf1', marginBottom: '0.5rem', marginTop: '0.25rem' }}
        >
          Lizenz abschließen (ök2 &amp; VK2)
        </h3>
        <p style={{ marginBottom: '0.75rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
          <strong>Einzelkünstler:innen und Galerien (ök2):</strong>{' '}
          <Link to={PROJECT_ROUTES['k2-galerie'].lizenzKaufen} style={{ color: '#5ffbf1', fontWeight: 600, textDecoration: 'none' }}>
            Lizenz online auswählen &amp; bezahlen
          </Link>
          {' – oder (Vertrieb / manuell): '}
          <Link to={PROJECT_ROUTES['k2-galerie'].licences} style={{ color: '#5ffbf1', fontWeight: 600, textDecoration: 'none' }}>
            Lizenzen verwalten
          </Link>
          {' '}mit Konditionen, Stufenwahl und optionaler Empfehler-ID.
        </p>
        <p style={{ marginBottom: '0.5rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
          <strong>Vereine (VK2):</strong> dieselbe Seite{' '}
          <Link to={PROJECT_ROUTES['k2-galerie'].licences} style={{ color: '#5ffbf1', fontWeight: 600, textDecoration: 'none' }}>
            Lizenzen verwalten
          </Link>
          {' – dort Stufe '}
          <strong>Kunstvereine (VK2)</strong> wählen und eintragen. Online-Kauf wie Pro ist möglich; der Vereinsablauf wird wie vereinbart abgestimmt – Konditionen siehe Lizenzstruktur VK2 unten.
        </p>
      </section>

      {/* Kapitel: Bewertung & Lizenzen */}
      <Mok2ChapterPage title={mok2Groups[2].chapterTitle} />
      {/* Produktbewertung: Entwicklerkosten vs. Marktwert – für Bewertung/Pitch und realistische Lizenzgebühren */}
      <section id="mok2-produktbewertung" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Produktbewertung: Entwicklerkosten, Marktwert und realistische Lizenzgebühren
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          Drei Perspektiven: (1) Was steckt drin (Entwicklerkosten). (2) Was der Markt dafür gibt (Marktwert). (3) <strong>Wie hoch die Lizenzgebühren realistisch sein sollen</strong> – darum geht es für die Preisgestaltung.
        </p>
        <p style={{ marginBottom: '0.75rem', fontWeight: 600, color: '#5ffbf1' }}>1. Entwicklerkosten (was steckt drin)</p>
        <ul style={{ marginBottom: '1.25rem', paddingLeft: '1.5em', lineHeight: 1.65, fontSize: '0.95rem' }}>
          <li>Mehrjähriges Projekt: Full-Stack PWA (React, TypeScript, Vercel, Supabase), Multi-Tenant (K2, ök2, VK2), Galerie, Shop, Kassa, Events, Werbematerial, Empfehlungs-Programm, Vereinsplattform.</li>
          <li>Größenordnung: viele tausend Stunden Entwicklung, laufende Wartung und Erweiterung.</li>
          <li>Bewertung: Vergleich zu typischen Stundensätzen → <strong>Wiederbeschaffungswert</strong> (was ein Team kosten würde, das Ähnliches neu baut). Wichtig für interne Rechenschaft, Partner, Investoren – <em>nicht</em> die Grundlage für die Lizenzpreise. Die Lizenzgebühren leiten sich aus Markt und Zahlungsbereitschaft ab, nicht aus den Entwicklerkosten.</li>
        </ul>
        <p style={{ marginBottom: '0.75rem', fontWeight: 600, color: '#5ffbf1' }}>2. Marktwert (was es für Käufer wert ist)</p>
        <ul style={{ marginBottom: '0.5rem', paddingLeft: '1.5em', lineHeight: 1.65, fontSize: '0.95rem' }}>
          <li>Nutzen für Zielgruppe: Eigener Webauftritt, Werke präsentieren, Events bewerben, Verkauf/Kasse, Etiketten, Marketing aus einem Guss – ohne IT-Kenntnisse.</li>
          <li>Vergleich zu Alternativen: KUNSTMATRIX (10–50 €/Monat), Wix/Squarespace (ca. 16–39 €), ArtCloud (ab 79 US-$). K2 bietet Galerie + Kasse + Events + Marketing in einer Oberfläche – vergleichbar eher Pro-Stufen, aber Zielgruppe Künstler:innen mit begrenztem Software-Budget.</li>
          <li>Marktwert = was Künstler:innen und Vereine bereit sind zu zahlen und was vergleichbare Angebote kosten. <strong>Daraus leiten sich die realistischen Lizenzgebühren ab.</strong></li>
        </ul>
        <p style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)' }}>
          Kurz: <strong>Entwicklerkosten</strong> = Wiederbeschaffungswert (Bewertung, nicht Preisvorlage). <strong>Marktwert</strong> = Zahlungsbereitschaft und Vergleichspreise → Grundlage für <strong>realistische Lizenzgebühren</strong>.
        </p>

        <h3 id="mok2-entwicklerkosten" style={{ fontSize: '1.1rem', color: '#5ffbf1', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Geschätzte Entwicklerkosten-Rechnung (Orientierung)</h3>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>
          Grobe Schätzung – keine verbindliche Rechnung. Zum Nachvollziehen und Anpassen (z. B. Stundensatz, Stunden).
        </p>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.95)', marginBottom: '0.75rem', padding: '0.6rem', background: 'rgba(95,251,241,0.08)', borderLeft: '3px solid rgba(95,251,241,0.5)', lineHeight: 1.55 }}>
          <strong>Wichtig:</strong> Die Summe ist <strong>kein „Verdienst“</strong> des Erbauers. Sie ist der <strong>Wiederbeschaffungswert</strong>: Was es kosten würde, wenn man ein professionelles Team (Agentur/Freelancer) beauftragen würde, diese Lösung <em>neu zu bauen</em>. Wer als Quereinsteiger mit viel Zeit und z. B. AI-Unterstützung selbst baut, hat keine Rechnung über 500.000 € bezahlt – der <em>Wert des entstandenen Produkts</em> für Bewertung, Partner oder Verkauf liegt trotzdem in dieser Größenordnung, weil ein Dritter genau das zahlen müsste, um Ähnliches zu bekommen.
        </p>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', marginBottom: '1rem', lineHeight: 1.55 }}>
          <strong>Warum würde Wiederbeschaffung trotzdem so viel kosten, wenn ein Laie es bauen kann?</strong> Weil „Wiederbeschaffung“ heißt: Ein Auftraggeber kauft die Leistung ein. Dann rechnet ein <em>Team</em> ab: mehrere Rollen (Entwicklung, Design, Doku, Projektleitung), jeder zum Marktstundensatz, plus Abstimmung, Spezifikation, Reviews, Tests. Ein Laie mit Zeit und AI umgeht diesen Markt: eine Person, keine Rechnung an sich selbst, viel Eigenzeit. Das <em>Ergebnis</em> kann gleichwertig sein – aber „bauen Sie mir das nach“ kostet beim Dienstleister trotzdem so viel, weil so der Dienstleistungsmarkt funktioniert (Stunden × Satz × mehrere Köpfe). Dass heute auch ein Laie so etwas schaffen kann, ändert den Wert des Produkts nicht; es schafft eine Alternative zum Einkauf.
        </p>
        <table style={{ width: '100%', maxWidth: 640, borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(95,251,241,0.4)' }}>
              <th style={{ textAlign: 'left', padding: '0.4rem 0.6rem', color: '#5ffbf1' }}>Bereich</th>
              <th style={{ textAlign: 'right', padding: '0.4rem 0.6rem', color: '#5ffbf1' }}>Stunden (geschätzt)</th>
              <th style={{ textAlign: 'right', padding: '0.4rem 0.6rem', color: '#5ffbf1' }}>Stundensatz (Orientierung)</th>
              <th style={{ textAlign: 'right', padding: '0.4rem 0.6rem', color: '#5ffbf1' }}>Summe (Bandbreite)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.4rem 0.6rem' }}>Frontend / App (React, PWA, Multi-Tenant)</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>1.200 – 2.000</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>80 – 120 €</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>96.000 – 240.000 €</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.4rem 0.6rem' }}>Backend / Infrastruktur (Vercel, Supabase, APIs)</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>300 – 600</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>80 – 120 €</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>24.000 – 72.000 €</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.4rem 0.6rem' }}>Design / UX (Oberflächen, Galerie, Admin)</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>400 – 700</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>70 – 100 €</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>28.000 – 70.000 €</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.4rem 0.6rem' }}>Doku, Prozesse, Handbuch, mök2</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>200 – 400</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>60 – 90 €</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>12.000 – 36.000 €</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.4rem 0.6rem' }}>Projektleitung, Wartung, Erweiterung (laufend)</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>400 – 800</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>70 – 100 €</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>28.000 – 80.000 €</td>
            </tr>
            <tr style={{ borderTop: '2px solid rgba(95,251,241,0.4)', fontWeight: 700 }}>
              <td style={{ padding: '0.5rem 0.6rem' }}>Gesamt (geschätzt)</td>
              <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>2.500 – 4.500 h</td>
              <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right' }}>–</td>
              <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: '#5ffbf1' }}>188.000 – 498.000 €</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
          <strong>Hinweis:</strong> Stundensätze orientieren sich an Freelancer/kleine Agentur (AT/DE). Je nach Region und Aufwand anpassbar. Gesamtsumme = Wiederbeschaffungswert („was müsste man zahlen, um das neu bauen zu lassen“), nicht das eigene Einkommen aus der Entwicklung – z. B. für Partner, Investoren, interne Rechenschaft.
        </p>

        <h3 id="mok2-neubewertung-2026" style={{ fontSize: '1.1rem', color: '#5ffbf1', marginTop: '1.75rem', marginBottom: '0.5rem' }}>Neubewertung Programmierarbeit und Marktwert (März 2026)</h3>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', marginBottom: '0.75rem', lineHeight: 1.55 }}>
          Stand des Produkts: <strong>Sportwagenmodus abgeschlossen</strong>; <strong>Lebenszyklus Klient durchgängig</strong> (Geburt → Aktives Leben → Sterben) für alle Mandanten; <strong>Multi-Tenant SaaS startklar</strong> (K2, ök2, VK2, dynamische Lizenzkunden mit tenantId, Checkout → Erfolgsseite → /g/:tenantId, Admin mit ?tenantId=, „Lizenz beenden“ inkl. Blob-Löschung). <strong>42 automatisierte Tests</strong> für kritische Pfade; umfangreiche Doku (Lebenszyklus-QS, Einstieg für Informatiker, Produkt-Standard). Technisch startklar bis auf Stripe-Go-Live (3 Schritte).
        </p>
        <p style={{ marginBottom: '0.75rem', fontWeight: 600, color: '#5ffbf1' }}>Programmierarbeit (Wiederbeschaffungswert)</p>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', marginBottom: '0.75rem', lineHeight: 1.55 }}>
          Die Neubewertung <strong>bestätigt den Rahmen 188.000 – 498.000 €</strong> (siehe Tabelle oben). Der produktive Umfang ist gewachsen: Lebenszyklus vollständig abgebildet, Lizenzen und Mandantenverwaltung durchgängig, Qualität durch Tests und Prozess abgesichert. Wiederbeschaffung = was ein professionelles Team kosten würde, das diese Lösung neu baut – unverändert die richtige Bezugsgröße für Bewertung, Partner, Investoren. <em>Tatsächlicher Aufwand</em> im Projekt: eine Person ohne Programmier-Vorkenntnisse, in grob 200 Stunden (mit AI-Unterstützung und Unternehmererfahrung) – siehe Team-Hebel, WIR-PROZESS.
        </p>
        <p style={{ marginBottom: '0.75rem', fontWeight: 600, color: '#5ffbf1' }}>Marktwert</p>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', marginBottom: '1rem', lineHeight: 1.55 }}>
          Unverändert: Marktwert = Zahlungsbereitschaft der Zielgruppe (Künstler:innen, kleine Galerien, Vereine) und Vergleichspreise am Markt. Daraus leiten sich die <strong>realistischen Lizenzgebühren</strong> ab (Basic, Pro, Pro+, Pro++, VK2) – siehe Abschnitt unten. Das gewachsene Produkt (Lebenszyklus, Multi-Tenant, Startklar) stärkt die Position für Vertrieb und Preisgestaltung; die Orientierung an marktgerechten Sätzen bleibt.
        </p>

        <h3 id="mok2-marktwert" style={{ fontSize: '1.1rem', color: '#5ffbf1', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Realistische Lizenzgebühren (Orientierung für die Preisgestaltung)</h3>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', marginBottom: '0.75rem', lineHeight: 1.55 }}>
          Die Lizenzgebühren sollen <strong>marktgerecht und für die Zielgruppe (Künstler:innen, kleine Galerien, Vereine) plausibel</strong> sein. Künstler:innen haben oft begrenzte Software-Budgets; zu hohe Preise schrecken ab, zu niedrige wirken unseriös oder decken Betrieb nicht. Grundlage: Marktcheck (Vergleichspreise, Zahlungsbereitschaft) – siehe <code>docs/MARKTCHECK-PREISE-BASIC-PRO-VERGLEICH.md</code>.
        </p>
        <table style={{ width: '100%', maxWidth: 600, borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(95,251,241,0.4)' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem 0.6rem', color: '#5ffbf1' }}>Stufe</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0.6rem', color: '#5ffbf1' }}>Realistischer Korridor (€/Monat)</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0.6rem', color: '#5ffbf1' }}>Begründung (kurz)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.5rem 0.6rem', fontWeight: 600 }}>Basic</td>
              <td style={{ padding: '0.5rem 0.6rem' }}><strong>15 €/Monat</strong></td>
              <td style={{ padding: '0.5rem 0.6rem' }}>Galerie + Shop + Einstieg (bis 30 Werke, Events, Kasse, Etiketten) – für Künstler:innen mit kleinem Budget. Vergleich: KUNSTMATRIX Basic 10 €, Wix 16–17 €.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.5rem 0.6rem', fontWeight: 600 }}>Pro</td>
              <td style={{ padding: '0.5rem 0.6rem' }}><strong>35 €/Monat</strong></td>
              <td style={{ padding: '0.5rem 0.6rem' }}>Alles aus Basic + unbegrenzte Werke, Custom Domain – ohne vollen Marketingbereich. Alles in einer App (Galerie, Kasse, Events, Etiketten).</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.5rem 0.6rem', fontWeight: 600 }}>Pro+</td>
              <td style={{ padding: '0.5rem 0.6rem' }}><strong>45 €/Monat</strong></td>
              <td style={{ padding: '0.5rem 0.6rem' }}>Alles aus Pro + <strong>gesamter Marketingbereich</strong>: Events, Galeriepräsentation, Flyer, Presse, Social Media, Plakat, PR-Dokumente aus einem Guss.</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.5rem 0.6rem', fontWeight: 600 }}>Pro++</td>
              <td style={{ padding: '0.5rem 0.6rem' }}><strong>55 €/Monat</strong></td>
              <td style={{ padding: '0.5rem 0.6rem' }}>Alles aus Pro+ + <strong>Rechnung (§ 11 UStG)</strong> und <strong>vollständige Buchhaltung</strong>: Kassabuch- und Verkäufe-CSV, Belege als PDF pro Zeitraum – Vorarbeit für den Steuerberater; Aufbewahrung 7 Jahre. Keine Haftung für Buchführung/Steuern (AGB §8).</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.5rem 0.6rem', fontWeight: 600 }}>VK2 (Verein)</td>
              <td style={{ padding: '0.5rem 0.6rem' }}>Wie Pro (35 €); <strong>ab 10 Mitgliedern für den Verein kostenfrei</strong>; Lizenzmitglieder 50 %</td>
              <td style={{ padding: '0.5rem 0.6rem' }}>Kein direkter Marktvergleich; Multiplikator (ein Verein → viele sichtbar). Konditionen wie in Lizenzstruktur VK2.</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', marginBottom: '1rem', lineHeight: 1.5 }}>
          <strong>Fazit (Stand Start):</strong> Basic <strong>15 €/Monat</strong>, Pro <strong>35 €/Monat</strong>, Pro+ <strong>45 €/Monat</strong> (mit vollem Marketingbereich), Pro++ <strong>55 €/Monat</strong> (inkl. Rechnung § 11 UStG und vollständiger Buchhaltung), VK2 wie Pro – ab 10 Mitgliedern für den Verein kostenfrei. Damit ist die Preisgestaltung für den Start entschieden und wird in der Kommunikation überall einheitlich genutzt.
        </p>

        <h4 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.9)', marginTop: '1rem', marginBottom: '0.5rem' }}>Erlöspotenzial (Beispielrechnung bei diesen Gebühren)</h4>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>
          Bei Basic 15 €, Pro 35 €, Pro+ 45 €, Pro++ 55 €/Monat: Basic 180 €/Jahr, Pro 420 €/Jahr, Pro+ 540 €/Jahr, Pro++ 660 €/Jahr.
        </p>
        <table style={{ width: '100%', maxWidth: 560, borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(95,251,241,0.4)' }}>
              <th style={{ textAlign: 'left', padding: '0.4rem 0.6rem', color: '#5ffbf1' }}>Szenario</th>
              <th style={{ textAlign: 'right', padding: '0.4rem 0.6rem', color: '#5ffbf1' }}>Lizenzen (Beispiel)</th>
              <th style={{ textAlign: 'right', padding: '0.4rem 0.6rem', color: '#5ffbf1' }}>Erlös/Jahr (grober Richtwert)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.4rem 0.6rem' }}>Konservativ (Einstieg)</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>20 Basic, 10 Pro, 5 Pro+</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>ca. 7.200 €</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.4rem 0.6rem' }}>Mittleres Szenario</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>50 Basic, 25 Pro, 15 Pro+</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>ca. 18.000 €</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.4rem 0.6rem' }}>Starkes Wachstum</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>150 Basic, 75 Pro, 50 Pro+</td>
              <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>ca. 54.000 €</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
          VK2 bringt zusätzliche Erträge (Verein zahlt Pro bis 10 Mitglieder; Lizenzmitglieder 50 %). <strong>Marktwert</strong> = Erlöspotenzial + strategischer Wert (Alleinstellungsmerkmale, Skalierbarkeit).
        </p>

        <h3 id="mok2-faehigkeiten-mix" style={{ fontSize: '1.1rem', color: '#5ffbf1', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Fähigkeiten-Mix: Was in einer Person das ermöglicht hat (Fakten)</h3>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>
          Ohne Programmier-Vorkenntnisse, in grob 200 Stunden: Welche Voraussetzungen müssen in einer Person zusammenkommen, damit das faktisch möglich ist?
        </p>
        <ul style={{ marginBottom: '0.5rem', paddingLeft: '1.2em', lineHeight: 1.6, fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
          <li><strong>Langjährige Unternehmererfahrung:</strong> Ziel klar definieren, priorisieren, durchhalten; Entscheidungen treffen ohne endlose Abstimmung; „fertige Form“ einfordern, nicht Entwürfe.</li>
          <li><strong>Domänenwissen:</strong> Galerie, Künstler:innen, Vereine, Vertrieb, Kasse, Events – Anforderungen kommen aus dem Fach, müssen nicht erst übersetzt werden.</li>
          <li><strong>Arbeit mit AI als Werkzeug:</strong> Anweisungen formulieren, Ergebnis prüfen, korrigieren, Regeln und Doku führen; die Umsetzung macht die AI, die Steuerung und Qualität der Mensch.</li>
          <li><strong>Struktur und Prozess:</strong> Regeln festhalten (z. B. Cursor Rules), DIALOG-STAND, Handbuch – damit Mensch und AI konsistent arbeiten und nichts verloren geht.</li>
          <li><strong>UX aus Nutzersicht:</strong> Beurteilen ob etwas für Laien verständlich und bedienbar ist, ohne technisches Wissen – ersetzt formale User-Research-Runden.</li>
          <li><strong>Pragmatismus:</strong> Eine Lösung pro Aufgabe, Skalierung mitdenken (K2, ök2, VK2), keine Doppelstrukturen – reduziert Umfang und Nacharbeit.</li>
        </ul>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
          Das ist keine Wertung, sondern eine Aufzählung der Faktoren, die in dieser Kombination den beschriebenen Effekt (Wiederbeschaffungswert hoch, Aufwand einer Person begrenzt) faktisch ermöglicht haben.
        </p>
      </section>

      {/* 10a. Lizenz-Pakete für Außen – kompakt für Werbung, Pitch, Flyer (nach außen sichtbar) */}
      <section id="mok2-lizenz-pakete-aussen" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Lizenz-Pakete für Außen (Werbung, Pitch, Flyer)
        </h2>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
          Kurzüberblick für Interessent:innen – hier prüfen und anpassen; dann in Werbeunterlagen und bei Anfragen nutzen.
        </p>
        <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
          Made in Austria – Datenschutz und Support aus Europa. Entwicklung und Betrieb aus Österreich, nicht aus China oder Indien.
        </p>
        <table style={{ width: '100%', maxWidth: 560, borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(95,251,241,0.4)' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#5ffbf1' }}>Paket</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#5ffbf1' }}>Nutzen</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: '#5ffbf1' }}>Preis</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Basic</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Galerie-Webauftritt, Werke, einfacher Shop (bis 30 Werke, Events, Kasse, Etiketten)</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>15 €/Monat</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Pro</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Alles aus Basic + unbegrenzte Werke, Custom Domain – ohne vollen Marketingbereich</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>35 €/Monat</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Pro+</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Alles aus Pro + gesamter Marketingbereich (Events, Galeriepräsentation, Flyer, Presse, Social Media, PR-Dokumente)</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>45 €/Monat</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Pro++</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Alles aus Pro+ + Rechnung (§ 11 UStG) + vollständige Buchhaltung (Kassabuch-/Verkäufe-CSV, Belege-PDF pro Zeitraum – Vorarbeit für Steuerberater; 7 Jahre Aufbewahrung)</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>55 €/Monat</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>VK2 (Verein)</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Pro für Kunstvereine; ab 10 Mitgliedern für den Verein kostenfrei, Lizenzmitglieder 50 %</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>wie Pro (35 €); ab 10 Mitgliedern kostenfrei</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
          Preise für den Start festgelegt. In Prospekt, Werbeunterlagen und bei „Lizenz anfragen“ einheitlich nutzen.
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
          <strong>Details:</strong> Siehe Abschnitt <a href="#mok2-marktwert" style={{ color: '#5ffbf1', textDecoration: 'none' }}>Produktbewertung → Realistische Lizenzgebühren</a>: Basic <strong>15 €/Monat</strong>, Pro <strong>35 €/Monat</strong>, Pro+ <strong>45 €/Monat</strong>, Pro++ <strong>55 €/Monat</strong>, VK2 wie Pro. Ausführlich: <code>docs/MARKTCHECK-PREISE-BASIC-PRO-VERGLEICH.md</code>.
        </p>
      </section>

      {/* 10c. Haupt- und Nebenlizenzen – fachliche Leitlinie (Doku), ergänzt die Stufen-Tabelle */}
      <section id="mok2-10c-haupt-neben-lizenz" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Haupt- und Nebenlizenzen (Konzept)
        </h2>
        <p style={{ marginBottom: '0.85rem', lineHeight: 1.65, fontSize: '0.95rem', color: 'rgba(255,255,255,0.92)' }}>
          <strong>Hauptlizenz</strong> = der vertragliche Kern: <strong>eine</strong> definierte Produkt-Instanz in der gewählten Stufe (Basic, Pro, Pro+, Pro++ oder VK2 als Vereins-Stufe). Ein <strong>Mandant (tenantId)</strong> = eine geschlossene Daten- und Nutzungswelt – klar umrissen.
        </p>
        <p style={{ marginBottom: '0.65rem', lineHeight: 1.6, fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
          <strong>Nebenlizenzen</strong> sind <strong>Zusätze</strong>, die gesondert benannt und abrechenbar sind – nicht „still mit drin“:
        </p>
        <ul style={{ marginBottom: '0.85rem', paddingLeft: '1.5em', lineHeight: 1.65, fontSize: '0.93rem', color: 'rgba(255,255,255,0.88)' }}>
          <li><strong>Zusätzlicher Mandant</strong> (eigene Seitenlinie, zweite Galerie/Familie mit eigener Datenwelt) – eigener Vertragsteil, technisch eigener <code>tenantId</code>.</li>
          <li><strong>Zusatznutzer / Bearbeitende</strong> im <strong>gleichen</strong> Mandanten – Rechte und Rollen, keine zweite Datenwelt.</li>
          <li><strong>Zusatzprodukt</strong> – weiteres benanntes Produkt der Plattform, getrennte oder gebündelte Buchung je nach Angebot (siehe Konzept-Doku).</li>
        </ul>
        <p style={{ marginBottom: '0.75rem', lineHeight: 1.55, fontSize: '0.88rem', color: 'rgba(255,255,255,0.78)' }}>
          Kein direkter 1:1-Kundensupport pro Nutzer skaliert nicht – Nebenlizenzen ändern daran nichts (bestehende Leitlinie).
        </p>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
          <strong>Vollständige Leitlinie:</strong>{' '}
          <code style={{ color: '#5ffbf1' }}>docs/KONZEPT-LIZENZMODELL-HAUPT-NEBENLIZENZEN.md</code>
        </p>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.75)' }}>
          <strong>VK2-Konditionen</strong> (Verein, Lizenzmitglieder, 10-Mitglieder-Regel) sind in der <a href="#mok2-10b-vk2-lizenz" style={{ color: 'var(--k2-accent)', fontWeight: 600, textDecoration: 'none' }}>Lizenzstruktur VK2</a> festgehalten – das ist die <strong>Hauptlizenz-Stufe Verein</strong>, nicht eine Nebenlizenz.
        </p>
      </section>

      {/* 10d. K2 Familie – eigenständige Lizenz-Doku (keine Koppelung an Galerie-Lizenzen) */}
      <section id="mok2-10d-k2-familie-lizenzmodell" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          K2 Familie – Lizenz (eigenständig)
        </h2>
        <p style={{ marginBottom: '0.75rem', lineHeight: 1.65, fontSize: '0.95rem', color: 'rgba(255,255,255,0.92)' }}>
          <strong>Keine Verbindung</strong> zwischen Lizenzen von <strong>K2 Familie</strong> und <strong>K2 Galerie</strong> – vertraglich und inhaltlich getrennte Produkte. mök2 und die Plattform-Konzept-Doku nutzen wir nur für <strong>denselben Begriffsrahmen</strong> (Hauptlizenz, Mandant, …); die verbindliche Lizenz-Beschreibung für K2 Familie steht <strong>nur</strong> in der K2-Familie-Projektdoku.
        </p>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
          <strong>Quellen im Repo:</strong>{' '}
          <code style={{ color: '#5ffbf1' }}>docs/K2-FAMILIE-LIZENZMODELL-BRUECKE.md</code>,{' '}
          <code style={{ color: '#5ffbf1' }}>docs/K2-FAMILIE-LIZENZ-KOSTEN.md</code>
        </p>
        <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.78)' }}>
          In der App: Projekt K2 Familie → <Link to={`${PROJECT_ROUTES['k2-familie'].uebersicht}#k2-familie-lizenz-bruecke`} style={{ color: '#5ffbf1', textDecoration: 'none', fontWeight: 600 }}>Leitbild &amp; Vision</Link> (Kurzblock zur Abgrenzung).
        </p>
        <p style={{ marginTop: '0.65rem', fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.82)' }}>
          <strong>Produktnutzen (Kurz):</strong> Stammbaum und Personenkarten, Events und Momente, <strong>zusammenfassende Familienchronik</strong> – im Register <strong>einzeln oder gesammelt</strong> drucken bzw. als PDF speichern (Browser-Dialog). Details: K2-Familie-Benutzerhandbuch in der App, Kapitel zu Geschichte und Events.
        </p>
      </section>

      {/* 10b. Lizenzstruktur VK2 (Vereinsplattform) – eigener Bereich, in mök2 festgelegt */}
      <section id="mok2-10b-vk2-lizenz" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--k2-accent)', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255, 140, 66, 0.5)', paddingBottom: '0.35rem' }}>
          Lizenzstruktur VK2 (Vereinsplattform)
        </h2>
        <div
          style={{
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.4)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '0.85rem',
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '0.25rem', fontSize: '0.9rem' }}>📅 Zeitplan</div>
          <div style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
            Derselbe Rahmen wie bei ök2: <strong>öffentlicher regulärer Start ab 01. Mai</strong>; <strong>Pilot-Vereine</strong> nach Einladung und Vereinbarung früher.
          </div>
        </div>
        <p style={{ marginBottom: '0.85rem', lineHeight: 1.65, fontSize: '0.95rem' }}>
          <strong>Lizenzen abschließen (VK2):</strong>{' '}
          <Link to={PROJECT_ROUTES['k2-galerie'].lizenzKaufen} style={{ color: 'var(--k2-accent)', fontWeight: 600, textDecoration: 'none' }}>
            Lizenz online auswählen &amp; bezahlen
          </Link>
          {' · '}
          <Link to={PROJECT_ROUTES['k2-galerie'].licences} style={{ color: 'var(--k2-accent)', fontWeight: 600, textDecoration: 'none' }}>
            Lizenzen verwalten
          </Link>
          {' '}
          – Stufe <strong>Kunstvereine (VK2)</strong> wählen (manuelle Erfassung, Empfehler-ID, Konditionen).
        </p>
        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
          <strong>VK2</strong> = Plattform für <strong>alle Vereinstypen</strong> – Vereine sind ähnlich strukturiert (Mitglieder, gemeinsamer Auftritt, Events). <strong>Kunstvereine</strong> sind die aktuelle Unterkategorie/Einstieg. Dritte Lizenzvariante neben Einzelkünstler und (später) größere Galerie. <strong>Vereinskassa und Buchhaltung vorgesehen:</strong> Der Verein kann seine Vereinskassa und Buchhaltung in derselben App führen (Verkäufe, Kassabuch, CSVs, Belege-PDF – Vorarbeit für Steuerberater; 7 Jahre Aufbewahrung); technische Freischaltung folgt.
        </p>
        <ul style={{ marginBottom: '1rem', paddingLeft: '1.5em', lineHeight: 1.7 }}>
          <li>Der <strong>Verein</strong> muss die <strong>Pro-Version</strong> erwerben und wird <strong>ab 10 registrierten Mitgliedern</strong> kostenfrei gestellt.</li>
          <li><strong>Lizenzmitglieder</strong> (registrierte Mitglieder) zahlen <strong>50 % der normalen Lizenzgebühr</strong>, haben keinen eigenen Bonusanspruch, aber die Möglichkeit zu updaten.</li>
          <li><strong>Nicht registrierte Mitglieder</strong> können vom Verein aufgenommen werden (obliegt dem Verein); sie werden <strong>im System erfasst</strong> (Datenschutz/Dokumentation).</li>
        </ul>
        <table style={{ width: '100%', maxWidth: 560, borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(90,122,110,0.5)' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--k2-accent)' }}>Rolle</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--k2-accent)' }}>Bedingung</th>
              <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--k2-accent)' }}>Lizenz / Nutzen</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(90,122,110,0.25)' }}>
              <td style={{ padding: '0.5rem 0.75rem' }}><strong>Verein</strong></td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Pro-Version; ≥ 10 registrierte Mitglieder</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Plattformnutzung dann <strong>kostenfrei</strong></td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(90,122,110,0.25)' }}>
              <td style={{ padding: '0.5rem 0.75rem' }}><strong>Lizenzmitglied (registriert)</strong></td>
              <td style={{ padding: '0.5rem 0.75rem' }}>zahlt 50 % Lizenz</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Kein eigener Bonus; Update möglich</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(90,122,110,0.25)' }}>
              <td style={{ padding: '0.5rem 0.75rem' }}><strong>Nicht registriertes Mitglied</strong></td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Aufnahme obliegt dem Verein</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Im System erfasst (Datenschutz)</td>
            </tr>
          </tbody>
        </table>
        <p style={{ padding: '0.75rem 1rem', background: 'rgba(255, 140, 66, 0.12)', borderRadius: '8px', borderLeft: '4px solid var(--k2-accent)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1rem' }}>
          <strong>VK2 für alle Vereine:</strong> Ein Verein entscheidet → viele Mitglieder sichtbar. Kunstvereine = aktueller Einstieg. Eindruckvolles Angebot lohnt sich doppelt (Referenz, Weiterempfehlung). <strong>Kernbotschaft:</strong> „Eine Plattform für Ihren Verein: alle Mitglieder sichtbar, eine Galerie, ein Auftritt – ab 10 Mitgliedern für den Verein kostenfrei.“ Nächste Schritte: Pilot-Verein, Onboarding „Verein in 3 Schritten“. → <code style={{ color: 'var(--k2-accent)' }}>docs/KUNSTVEREINE-MULTIPLIKATOREN.md</code>
        </p>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
          Quelle: <code>docs/VK2-VEREINSPLATTFORM.md</code>. Beim Drucken dieser mök2-Seite („Als PDF drucken“) ist die VK2-Lizenzstruktur mit dabei.
        </p>
        <p style={{ padding: '0.75rem 1rem', background: 'rgba(251,191,36,0.1)', borderRadius: '8px', borderLeft: '4px solid #fbbf24', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
          <strong style={{ color: '#fbbf24' }}>🏆 NEU: Vereinskatalog</strong> – Lizenzmitglieder mit eigener K2-Galerie können bis zu <strong>5 ihrer schönsten Werke</strong> für den gemeinsamen Vereinskatalog freigeben. Der Katalog zeigt alle Werke aller Lizenzmitglieder zusammen, filterbar nach Künstler:in, Technik und Preis – als PDF druckbar. <em style={{ color: 'rgba(255,255,255,0.7)' }}>Motto: „Zeige deine schönsten Werke.“</em>
          <br /><strong>Vorteil für Lizenzmitglieder:</strong> Sichtbarkeit im Vereinskontext + eigene Galerie = doppelte Präsenz. Starkes Argument für Mitgliedschaft.
        </p>
      </section>

      {/* 11. Sicherheit & Vor Veröffentlichung → ausgelagert in K2 Softwareentwicklung */}
      <section id="mok2-11" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          11. Sicherheit &amp; Vor Veröffentlichung (→ K2 Softwareentwicklung)
        </h2>
        <p style={{ marginBottom: '0.5rem', lineHeight: 1.6 }}>
          Alle Inhalte zu <strong>Sicherheit, Admin-Auth, RLS, Vor Veröffentlichung</strong> und technischen Checklisten liegen in der eigenen Rubrik <strong>K2 Softwareentwicklung</strong> – dort findest du die Links zu allen Docs (VOR-VEROEFFENTLICHUNG.md, ADMIN-AUTH-SETUP.md, Produkt-Label, Stabilität, Supabase RLS).
        </p>
        <p>
          <Link to={PROJECT_ROUTES['k2-galerie'].softwareentwicklung} style={{ color: '#5ffbf1', fontWeight: 600, textDecoration: 'none' }}>
            → K2 Softwareentwicklung öffnen
          </Link>
        </p>
      </section>

      {/* 12. Musterbilder für die ök2-Galerie – hier liegen sie, zum Einfügen; Link zu Unsplash */}
      <section id="mok2-12" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          12. Musterbilder für die ök2-Galerie
        </h2>
        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
          Diese Musterbilder liegen in <strong>mök2</strong> und kannst du in die ök2-Galerie einfügen. So wirkt die Demo für zukünftige Lizenznehmer:innen professionell (oben: Menschen/Galerie-Eingang, unten: Galerie Innenansicht).
        </p>
        <p style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.12)', borderRadius: '8px', border: '1px solid rgba(95,251,241,0.4)' }}>
          <strong style={{ color: '#5ffbf1' }}>📷 Professionelle Fotos holen:</strong>{' '}
          <a href="https://unsplash.com/s/photos/people-art-gallery" target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', fontWeight: 600 }}>Unsplash – Menschen in Galerie</a>
          {' · '}
          <a href="https://unsplash.com/s/photos/gallery-interior" target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', fontWeight: 600 }}>Unsplash – Galerie Innenansicht</a>
          {' · '}
          <a href="https://unsplash.com/s/photos/art-gallery" target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', fontWeight: 600 }}>Unsplash – Galerie allgemein</a>
        </p>

        <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}><strong>Oben (Willkommen) – Bild hierher ziehen oder auswählen:</strong></p>
        <div
          className="marketing-oek2-no-print"
          onDragOver={(e) => { e.preventDefault(); setDropTarget('welcome') }}
          onDragLeave={() => setDropTarget(null)}
          onDrop={(e) => handleDrop(e, 'welcome')}
          style={{
            marginBottom: '1.5rem',
            maxWidth: 600,
            minHeight: 140,
            borderRadius: '8px',
            border: `2px dashed ${dropTarget === 'welcome' ? '#5ffbf1' : 'rgba(95,251,241,0.4)'}`,
            background: dropTarget === 'welcome' ? 'rgba(95,251,241,0.15)' : 'rgba(95,251,241,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '1rem',
            position: 'relative',
          }}
        >
          {oefWelcome ? (
            <>
              <img src={oefWelcome} alt="Willkommen" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 6 }} />
              <div style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <label style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', background: 'rgba(95,251,241,0.3)', borderRadius: 6, fontSize: '0.9rem' }}>
                  Anderes Bild <input type="file" accept="image/*" hidden onChange={(e) => handleFileSelect('welcome', e)} />
                </label>
                <button type="button" onClick={() => clearOefImage('welcome')} style={{ padding: '0.4rem 0.8rem', background: 'rgba(200,80,80,0.4)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>Entfernen</button>
              </div>
            </>
          ) : (
            <label style={{ cursor: 'pointer', textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
              Bild aus deinen Fotos hierher ziehen oder <span style={{ color: '#5ffbf1', textDecoration: 'underline' }}>klicken zum Auswählen</span>
              <input type="file" accept="image/*" hidden onChange={(e) => handleFileSelect('welcome', e)} disabled={oefSaving} />
            </label>
          )}
        </div>

        <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}><strong>Unten (Galerie Innenansicht) – Bild hierher ziehen oder auswählen:</strong></p>
        <div
          className="marketing-oek2-no-print"
          onDragOver={(e) => { e.preventDefault(); setDropTarget('innen') }}
          onDragLeave={() => setDropTarget(null)}
          onDrop={(e) => handleDrop(e, 'innen')}
          style={{
            marginBottom: '1.5rem',
            maxWidth: 600,
            minHeight: 140,
            borderRadius: '8px',
            border: `2px dashed ${dropTarget === 'innen' ? '#5ffbf1' : 'rgba(95,251,241,0.4)'}`,
            background: dropTarget === 'innen' ? 'rgba(95,251,241,0.15)' : 'rgba(95,251,241,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '1rem',
          }}
        >
          {oefGalerieInnen ? (
            <>
              <img src={oefGalerieInnen} alt="Galerie Innenansicht" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 6 }} />
              <div style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <label style={{ cursor: 'pointer', padding: '0.4rem 0.8rem', background: 'rgba(95,251,241,0.3)', borderRadius: 6, fontSize: '0.9rem' }}>
                  Anderes Bild <input type="file" accept="image/*" hidden onChange={(e) => handleFileSelect('innen', e)} />
                </label>
                <button type="button" onClick={() => clearOefImage('innen')} style={{ padding: '0.4rem 0.8rem', background: 'rgba(200,80,80,0.4)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: '0.9rem' }}>Entfernen</button>
              </div>
            </>
          ) : (
            <label style={{ cursor: 'pointer', textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
              Bild aus deinen Fotos hierher ziehen oder <span style={{ color: '#5ffbf1', textDecoration: 'underline' }}>klicken zum Auswählen</span>
              <input type="file" accept="image/*" hidden onChange={(e) => handleFileSelect('innen', e)} disabled={oefSaving} />
            </label>
          )}
        </div>

        <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
          Nach dem Ziehen oder Auswählen erscheinen die Bilder automatisch in der <Link to={PROJECT_ROUTES['k2-galerie'].galerieOeffentlich} style={{ color: '#5ffbf1' }}>ök2-Galerie</Link> (oben bzw. unten).
        </p>

        <p style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}><strong>Muster (falls noch kein eigenes Bild):</strong></p>
        <div style={{ marginBottom: '1.5rem', maxWidth: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(95,251,241,0.3)' }}>
          <img src="/mok2/musterbilder/willkommen.svg" alt="Muster Willkommen" style={{ width: '100%', maxWidth: 600, height: 'auto', display: 'block' }} />
        </div>
        <div style={{ marginBottom: '1.5rem', maxWidth: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(95,251,241,0.3)' }}>
          <img src="/mok2/musterbilder/galerie-innen.svg" alt="Muster Galerie Innenansicht" style={{ width: '100%', maxWidth: 600, height: 'auto', display: 'block' }} />
        </div>
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(95,251,241,0.1)', borderRadius: '8px', borderLeft: '4px solid #5ffbf1' }}>
          <p style={{ margin: '0 0 0.5rem', fontWeight: 600, color: '#5ffbf1' }}>So funktioniert es:</p>
          <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.7 }}>
            <li>Bild aus deinen Fotos (oder von Unsplash) in die gestrichelte Fläche oben <strong>ziehen</strong> oder per Klick <strong>auswählen</strong>.</li>
            <li>Das Bild wird gespeichert und erscheint sofort in der ök2-Galerie (öffentliche Galerie öffnen zum Prüfen).</li>
            <li>Zum Entfernen: „Entfernen“ klicken – dann gilt wieder das Musterbild.</li>
          </ol>
        </div>
      </section>

      {/* Sektion: WillkommenPage Varianten */}
      <section id="willkommen-varianten" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(95,251,241,0.2)' }}>
        <h2 style={{ color: '#5ffbf1', marginBottom: '0.5rem' }}>8. WillkommenPage – Varianten zum Vergleich</h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Zwei Designrichtungen für die Einstiegsseite (Erstkontakt, QR-Scan). Georg entscheidet, welche Variante Stil und Atmosphäre der Galerie am besten trifft.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(95,251,241,0.07)', border: '1px solid rgba(95,251,241,0.25)', borderRadius: '10px', padding: '1.25rem' }}>
            <p style={{ fontWeight: 700, color: '#5ffbf1', marginBottom: '0.4rem' }}>Variante A – Warm & einladend (Atelier)</p>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 0.75rem', fontSize: '0.95rem' }}>
              Warme Terrakotta-Töne, cremig-leinene Karten, herzliche Sprache. Vermittelt Handwerk und Persönlichkeit – wie ein echter Atelierbesuch.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0 }}>URL: <code style={{ color: '#5ffbf1' }}>/?variant=a</code></p>
          </div>
          <div style={{ background: 'rgba(95,251,241,0.07)', border: '1px solid rgba(95,251,241,0.25)', borderRadius: '10px', padding: '1.25rem' }}>
            <p style={{ fontWeight: 700, color: '#5ffbf1', marginBottom: '0.4rem' }}>Variante C – Modern & lebendig</p>
            <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 0.75rem', fontSize: '0.95rem' }}>
              Dunkler Hero-Bereich, K2-Orange als Akzent, klare Aktionsführung. Wirkt sofort und holt den Besucher direkt ab – zeitgemäß und professionell.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0 }}>URL: <code style={{ color: '#5ffbf1' }}>/ (ohne Parameter)</code></p>
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>
          Nächster Schritt: Variante auswählen → als Standard festlegen und <code>?variant</code>-Parameter entfernen.
        </p>
      </section>

      {/* Kapitel: Konzepte – Pro+, Leitkünstler, Guide */}
      <Mok2ChapterPage title={mok2Groups[3].chapterTitle} />
      {/* 13. Werkkatalog & Werkkarte – USP für Marketing */}
      <section id="mok2-13" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(95,251,241,0.2)', pageBreakInside: 'avoid' as const }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          13. Werkkatalog & Werkkarte – starke Verkaufsargumente
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
          K2 Galerie bietet als einzige Galerie-App einen <strong style={{ color: '#5ffbf1' }}>vollständigen, druckbaren Werkkatalog</strong> direkt im Admin – ohne Excel, ohne Fremd-Software, ohne Aufwand.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(95,251,241,0.07)', border: '1px solid rgba(95,251,241,0.25)', borderRadius: '10px', padding: '1.25rem' }}>
            <p style={{ fontWeight: 700, color: '#5ffbf1', marginBottom: '0.5rem' }}>📋 Werkkatalog – Filter & Tabelle</p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>
              <li>Alle Werke auf einen Blick – filterbar nach Status, Kategorie, Preis, Datum</li>
              <li>Vollfreitext-Suche über Titel, Nr., Beschreibung, Technik</li>
              <li>Spalten frei wählbar: Maße, Technik/Material, Käufer:in, Verkaufsdatum u. v. m.</li>
              <li>Ein Klick → Gesamtliste als PDF (A4 quer) drucken – fertig für Steuerberater oder Versicherung</li>
            </ul>
          </div>
          <div style={{ background: 'rgba(95,251,241,0.07)', border: '1px solid rgba(95,251,241,0.25)', borderRadius: '10px', padding: '1.25rem' }}>
            <p style={{ fontWeight: 700, color: '#5ffbf1', marginBottom: '0.5rem' }}>🖼️ Werkkarte – ein Werk, druckfertig</p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem' }}>
              <li>Klick auf ein Werk → Werkkarte öffnet sich sofort</li>
              <li>Zeigt Foto, Titel, Künstler:in, Status, alle Felder übersichtlich</li>
              <li>„Werkkarte drucken" → A5-Blatt, professionell wie im Museum</li>
              <li>Ideal für Ausstellungen, Bewerbungen, Versicherungsunterlagen, Verkaufsgespräche</li>
            </ul>
          </div>
        </div>

        <p style={{ fontWeight: 700, color: '#22c55e', marginBottom: '0.5rem' }}>✅ Was das für Künstler:innen bedeutet:</p>
        <ul style={{ margin: '0 0 1rem', paddingLeft: '1.2rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>
          <li><strong>Kein Aufwand:</strong> Alle Felder werden beim Anlegen eines Werks erfasst – Katalog entsteht automatisch</li>
          <li><strong>Vollständige Werkgeschichte:</strong> Erstellt, in Galerie, verkauft, Käufer:in – alles in einer Ansicht</li>
          <li><strong>Druckfertig in Sekunden:</strong> Ob Einzelwerk oder Gesamtliste – ein Klick reicht</li>
          <li><strong>Kein Excel, kein Zusatz-Tool:</strong> Alles direkt in K2 Galerie, auch am Handy nutzbar</li>
          <li><strong>Professioneller Auftritt:</strong> Werkkarte im Museumsformat – bei Ausstellungen, Verkaufsgesprächen, Bewerbungen</li>
        </ul>

        <p style={{ padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '8px', lineHeight: 1.7, fontSize: '0.95rem' }}>
          <strong style={{ color: '#22c55e' }}>💬 Formulierung für Gespräche und Unterlagen:</strong><br />
          „Mit K2 Galerie hast du jederzeit einen druckfertigen Werkkatalog – vom ersten Pinselstrich bis zum Verkauf. Eine Werkkarte pro Bild, gefilterte Listen für den Steuerberater, die Versicherung oder Ausstellungsorganisatoren – ohne Zusatz-Software, direkt aus der App."
        </p>
      </section>

      <section id="mok2-14" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(251,191,36,0.4)', pageBreakInside: 'avoid' as const }}>
        <h2 style={{ fontSize: '1.25rem', color: '#fbbf24', marginBottom: '0.5rem', borderBottom: '1px solid rgba(251,191,36,0.4)', paddingBottom: '0.35rem' }}>
          14. 💎 Pro+ & Pro++ – Marketingbereich, Rechnung & Buchhaltung
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '1rem', color: 'rgba(255,255,255,0.85)' }}>
          Neben Basic (15 €), Pro (35 €) und Kunstvereine (VK2, wie Pro) gibt es <strong style={{ color: '#fbbf24' }}>Pro+ (45 €/Monat)</strong> – Pro inklusive gesamten Marketingbereich: Events, Galeriepräsentation, Flyer, Presse, Social Media, Plakat, PR-Dokumente aus einem Guss. <strong style={{ color: '#fbbf24' }}>Pro++ (55 €/Monat)</strong> ergänzt Pro+ um <strong>Rechnung (§ 11 UStG)</strong> und <strong>vollständige Buchhaltung</strong>: fortlaufende Rechnungsnummer, Pflichtangaben, USt-Aufschlüsselung; dazu Kassabuch- und Verkäufe-CSV, Belege als PDF pro Zeitraum – Vorarbeit für den Steuerberater, Aufbewahrung 7 Jahre. Rechtliche Verantwortung für Buchführung und Steuern trägt der Nutzer/Steuerberater (AGB §8).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: '10px', padding: '1.25rem' }}>
            <p style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>🔏 Echtheitszertifikat</p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem' }}>
              <li>PDF pro Werk – automatisch generiert</li>
              <li>Enthält: Foto, Titel, Künstler:in, Maße, Technik, Erstellungsdatum, Galerie-Signatur</li>
              <li>QR-Code auf dem Zertifikat → verifizierbar in der Galerie-App</li>
              <li>Professioneller Druck möglich (A5 oder A4)</li>
              <li><em style={{ color: 'rgba(255,255,255,0.6)' }}>Hebt den Wert jedes Originals – besonders für den Weiterverkauf</em></li>
            </ul>
          </div>
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: '10px', padding: '1.25rem' }}>
            <p style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>📬 Newsletter & Einladungsliste</p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem' }}>
              <li>Kontakte direkt in der App verwalten (Name, E-Mail, Kategorie)</li>
              <li>Einladungsliste für Vernissagen, Events, Vorankündigungen</li>
              <li>Druckfertige Adressliste für Briefe/Einladungskarten</li>
              <li>Export als CSV für externe Newsletter-Tools</li>
              <li><em style={{ color: 'rgba(255,255,255,0.6)' }}>Eigene Community aufbauen – ohne externe Adressen-Dienste</em></li>
            </ul>
          </div>
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: '10px', padding: '1.25rem' }}>
            <p style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>📰 Pressemappe PDF</p>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem' }}>
              <li>Automatisch generiert aus Stammdaten + ausgewählten Werken</li>
              <li>Enthält: Vita, Ausstellungshistorie, Galeriedaten, 3–5 Musterwerke</li>
              <li>Professionelles Layout, sofort für Medien und Presse nutzbar</li>
              <li>Auch als Bewerbungsmappe für Ausstellungen einsetzbar</li>
              <li><em style={{ color: 'rgba(255,255,255,0.6)' }}>Spart Stunden – bisher war das immer manuelle Arbeit</em></li>
            </ul>
          </div>
        </div>

        <p style={{ fontWeight: 700, color: '#22c55e', marginBottom: '0.5rem' }}>✅ Warum Excellent – der Unterschied zu Pro:</p>
        <ul style={{ margin: '0 0 1.25rem', paddingLeft: '1.2rem', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)' }}>
          <li><strong>Pro:</strong> Unbegrenzte Werke, Custom Domain, volles Marketing – ideal für aktive Galerien</li>
          <li><strong>Excellent:</strong> Alles aus Pro, plus Werkzeuge für <em>professionellen Betrieb mit Außenwirkung</em> – Zertifikate, eigene Kontaktliste, Pressematerial, Anfragen-Inbox, Verkaufsstatistik mit Zeitraumanalyse, Priority Support</li>
          <li><strong>Zielgruppe Excellent:</strong> Künstler:innen, die regelmäßig ausstellen, Medien- und Pressearbeit betreiben, und ihren Werken einen nachvollziehbaren Wert geben wollen</li>
        </ul>

        <p style={{ padding: '0.75rem 1rem', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: '8px', lineHeight: 1.7, fontSize: '0.95rem' }}>
          <strong style={{ color: '#fbbf24' }}>💬 Formulierung für Gespräche und Unterlagen:</strong><br />
          „Mit K2 Galerie Excellent hast du nicht nur eine digitale Galerie – du hast ein vollständiges Werk-Archiv mit Echtheitszertifikaten, eine eigene Einladungsliste für Vernissagen, eine fertige Pressemappe und direkte Anfragen von Interessenten. Alles in einer App, ohne Zusatz-Software."
        </p>
      </section>

      {/* Sektion 15: Gründer-Galerie + Leitkünstler */}
      <section id="mok2-15-gruender" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(95,251,241,0.2)', pageBreakInside: 'avoid' as const }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          15. Gründer-Galerie &amp; Leitkünstler:innen – Die erste Welle
        </h2>

        <h3 style={{ fontSize: '1rem', color: '#fbbf24', margin: '1rem 0 0.5rem' }}>Das Konzept</h3>
        <p style={{ lineHeight: 1.75, marginBottom: '0.75rem' }}>
          Kein Marktgeschrei. Kein Verkaufsdruck. Stattdessen: Die richtigen Menschen zuerst einladen –
          als <strong style={{ color: '#5ffbf1' }}>Gründer-Galerien</strong>. Limitiert. Exklusiv. Auf Augenhöhe.
        </p>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, marginBottom: '1rem' }}>
          <li>Maximal <strong>50 Gründer-Galerien</strong> – wer früh kommt, prägt das Produkt mit</li>
          <li>Günstigerer Einstiegspreis als Dankeschön für das Vertrauen</li>
          <li>Deine Stimme zählt – Feedback fließt direkt in die Weiterentwicklung</li>
          <li>Kein „Beta" – sondern: <em>„Wir bauen das gemeinsam"</em></li>
        </ul>

        <h3 style={{ fontSize: '1rem', color: '#fbbf24', margin: '1.25rem 0 0.5rem' }}>Die Leitkünstler:innen – Multiplikatoren</h3>
        <p style={{ lineHeight: 1.75, marginBottom: '0.75rem' }}>
          5 bis 10 ausgewählte Künstler:innen erhalten die K2 Galerie <strong style={{ color: '#5ffbf1' }}>kostenlos</strong> –
          als Zeichen des Vertrauens, nicht als Werbegeschäft. Es geht nicht ums Werben – sondern darum, <strong>ehrlich zu sein</strong>.
          Was sie berichten, kommt von allein.
        </p>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
          <li>Etablierte Künstler:innen mit Netzwerk und Glaubwürdigkeit</li>
          <li>Menschen die für Qualität stehen – ihr Name ist ihr Kapital</li>
          <li>Kunstvereine mit aktiver Gemeinschaft</li>
          <li>Kunstlehrer:innen mit direktem Kontakt zu aufstrebenden Talenten</li>
        </ul>

        {/* Begleitschreiben */}
        <div style={{ background: 'rgba(95,251,241,0.06)', border: '1px solid rgba(95,251,241,0.25)', borderRadius: '12px', padding: '1.5rem', marginTop: '1.5rem', breakInside: 'avoid' as const }}>
          <h3 style={{ fontSize: '1rem', color: '#5ffbf1', marginTop: 0, marginBottom: '1rem' }}>
            ✉️ Begleitschreiben – Leitkünstler:innen (Vorlage)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', marginBottom: '1rem', fontStyle: 'italic' }}>
            Persönlich. Handgeschrieben oder per E-Mail. Nie als Serienbrief.
          </p>

          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '1.25rem', fontSize: '0.95rem', lineHeight: 1.85, color: 'rgba(255,255,255,0.85)', fontFamily: 'Georgia, serif' }}>
            <p style={{ margin: '0 0 0.75rem' }}>Liebe [Vorname],</p>

            <p style={{ margin: '0 0 0.75rem' }}>
              ich wende mich persönlich an dich – weil ich deine Arbeit kenne und schätze.
              Nicht als Künstler:in mit einer Galerie, sondern als Mensch der versteht
              was es bedeutet, ein Werk in die Welt zu bringen.
            </p>

            <p style={{ margin: '0 0 0.75rem' }}>
              Ich habe in den letzten Jahren eine digitale Galerie entwickelt –
              <strong style={{ color: '#5ffbf1' }}> K2 Galerie</strong>.
              Nicht für den Massenmarkt. Für Künstler:innen die ihre Werke so präsentieren wollen
              wie sie es verdienen: professionell, persönlich, ohne technisches Vorwissen.
            </p>

            <p style={{ margin: '0 0 0.75rem' }}>
              Ich lade dich ein, sie zu nutzen – <strong>kostenlos, ohne Bedingungen</strong>.
              Kein Vertrag. Kein Kleingedrucktes. Nur die Bitte:
              Sei ehrlich mit mir. Was funktioniert? Was fehlt? Was überrascht dich?
            </p>

            <p style={{ margin: '0 0 0.75rem' }}>
              Du musst nichts empfehlen, nichts teilen, nichts werben.
              Dein Urteil – das ist alles was ich mir wünsche.
            </p>

            <p style={{ margin: '0 0 0.75rem' }}>
              Wenn du neugierig bist: Ich zeige dir die Galerie persönlich.
              Kein Pitch, kein Verkaufsgespräch – einfach zwei Menschen die über Kunst reden.
            </p>

            <p style={{ margin: '0' }}>
              Mit herzlichen Grüßen,<br />
              <strong>Georg Kreinecker</strong><br />
              <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)' }}>K2 Galerie · Kunst &amp; Keramik</span>
            </p>
          </div>

          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '8px', fontSize: '0.88rem', lineHeight: 1.65 }}>
            <strong style={{ color: '#fbbf24' }}>💡 Hinweise zur Verwendung:</strong>
            <ul style={{ paddingLeft: '1.1rem', margin: '0.5rem 0 0', lineHeight: 1.75 }}>
              <li>Immer <strong>persönlich anpassen</strong> – Namen, ein Detail das zeigt: ich kenne deine Arbeit</li>
              <li>Nie als Serienbrief – das spürt man sofort</li>
              <li>Optional: einen kleinen handgeschriebenen Zusatz bei physischem Brief</li>
              <li>Kein Anhang, kein PDF, kein Produkt-Flyer beim ersten Kontakt</li>
              <li>Erst wenn Interesse da ist: Demo-Termin oder Link zur Galerie</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sektion 16: Leitkünstler-Liste */}
      <section id="mok2-16-leitkuenstler" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(95,251,241,0.2)', pageBreakInside: 'avoid' as const }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          16. Leitkünstler:innen – Meine Liste
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1rem', fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)' }}>
          Persönliche Liste – wen kenne ich, wen schätze ich, wer wäre ein guter Multiplikator?
          Kategorien zur Orientierung. Namen werden persönlich hinzugefügt.
        </p>

        {/* Kategorie 1 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fbbf24', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎨 Etablierte Bildende Künstler:innen
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
            Ausstellungserfahrung, eigene Preisliste, bekannt in der Region – ihr Wort hat Gewicht
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(95,251,241,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', minHeight: '3rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
            → Hier Namen eintragen …
          </div>
        </div>

        {/* Kategorie 2 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fbbf24', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🌱 Aufstrebende Künstler:innen (hungrig, suchend)
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
            Aktiv in Social Media, auf der Suche nach Sichtbarkeit, offen für Neues
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(95,251,241,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', minHeight: '3rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
            → Hier Namen eintragen …
          </div>
        </div>

        {/* Kategorie 3 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fbbf24', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏛️ Kunstvereine &amp; Gemeinschaften
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
            Vereinsvorstand, Obmann/Obfrau – eine Person erreicht sofort viele Mitglieder
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(95,251,241,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', minHeight: '3rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
            → Hier Namen/Vereine eintragen …
          </div>
        </div>

        {/* Kategorie 4 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fbbf24', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🎓 Kunstlehrer:innen &amp; Kursleiter:innen
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
            VHS, Privatateliers, Kunstschulen – direkter Kontakt zu Schüler:innen die selbst Galerien suchen
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(95,251,241,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', minHeight: '3rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
            → Hier Namen eintragen …
          </div>
        </div>

        {/* Kategorie 5 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fbbf24', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏺 Kunsthandwerk &amp; Keramik
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
            Töpfer:innen, Textilkünstler:innen, Goldschmiede – oft gute Community, kaum digitale Präsenz
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(95,251,241,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', minHeight: '3rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
            → Hier Namen eintragen …
          </div>
        </div>

        {/* Kategorie 6 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fbbf24', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📷 Fotograf:innen &amp; Digitale Künstler:innen
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
            Technikaffin, Social-Media-stark, zeigen gerne neue Tools – schnelle Verbreitung
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(95,251,241,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', minHeight: '3rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
            → Hier Namen eintragen …
          </div>
        </div>

        {/* Kategorie 7 */}
        <div style={{ marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fbbf24', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🌐 Regionale Kulturvermittler:innen
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
            Kulturzentren, Büchereien, Gemeindekultur, lokale Presse – Türöffner zur breiten Öffentlichkeit
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(95,251,241,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', minHeight: '3rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
            → Hier Namen/Kontakte eintragen …
          </div>
        </div>
      </section>

      {/* Sektion 17: Guide-Avatar Vision */}
      <section id="mok2-17-guide-avatar" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(95,251,241,0.2)', pageBreakInside: 'avoid' as const }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          17. 🎙️ Guide-Avatar – Vision (Option A nach ersten Rückmeldungen)
        </h2>
        <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
          Aktuell läuft <strong style={{ color: '#5ffbf1' }}>Option B</strong>: ein animierter Text-Guide (👨‍🎨) der den Besucher Schritt für Schritt durch die Demo-Galerie führt – mit Schreibmaschinen-Effekt und Fortschritts-Punkten.
        </p>
        <div style={{ background: 'rgba(95,251,241,0.06)', border: '1px solid rgba(95,251,241,0.2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fbbf24', margin: '0 0 0.75rem' }}>🎙️ Option A – Echter sprechender Avatar (nach ersten Rückmeldungen)</h3>
          <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.85, margin: 0 }}>
            <li><strong>Georgs Stimme</strong> als Guide – einmalig aufnehmen mit ElevenLabs (ab ~€22/Monat)</li>
            <li>Realistisches Avatar-Video mit <strong>HeyGen</strong> oder <strong>D-ID</strong> – Georg erklärt die Galerie persönlich</li>
            <li>Video wird einmalig erstellt und auf der Demo-Galerie eingebettet</li>
            <li>Trigger: Wenn die ersten Leitkünstler positives Feedback geben → Avatar aufnehmen</li>
            <li><strong>USP:</strong> Kein anderes Galerie-Tool hat einen persönlichen sprechenden Guide</li>
          </ul>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>
          → Entscheidung nach ersten Rückmeldungen der Gründer-Galerien. Option B bleibt als Fallback.
        </p>
      </section>

      {/* Sektion 18: Empfehlungs-Programm – die richtige Sprache */}
      <section id="mok2-18-empfehlung" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(95,251,241,0.2)', pageBreakInside: 'avoid' as const }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          18. 🤝 Empfehlungs-Programm – die richtige Sprache
        </h2>

        <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#fbbf24', margin: '0 0 0.75rem' }}>🔑 Der entscheidende Insight</h3>
          <p style={{ lineHeight: 1.8, margin: 0, fontSize: '0.95rem' }}>
            Viele Künstler:innen haben ein kleines Budget – aber sie sind zu stolz um das zu sagen.<br />
            Sie wären über ein zusätzliches Einkommen sehr froh – aber das Wort <strong style={{ color: '#fbbf24' }}>„Geld"</strong> darf nie fallen.<br />
            <strong>Würde bewahren. Trotzdem helfen.</strong>
          </p>
        </div>

        <h3 style={{ fontSize: '0.95rem', color: '#fbbf24', margin: '1rem 0 0.5rem' }}>❌ So nicht</h3>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, marginBottom: '1rem', color: 'rgba(255,255,255,0.6)' }}>
          <li>„Verdiene 10 % Gutschrift durch Empfehlungen"</li>
          <li>„Empfehlungs-Programm – dein Einkommen wächst"</li>
          <li>„Affiliate-Link teilen und kassieren"</li>
        </ul>

        <h3 style={{ fontSize: '0.95rem', color: '#5ffbf1', margin: '1rem 0 0.5rem' }}>✅ So ja</h3>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, marginBottom: '1.25rem' }}>
          <li>„Teile deine Galerie mit jemandem den du schätzt – und beide zahlen nichts."</li>
          <li>„Kennst du jemanden dem das auch helfen würde?"</li>
          <li>„Wenn du jemanden einlädst – nutzt ihr beide die Galerie ohne Kosten."</li>
          <li>„Solidarität unter Künstlern – wer gibt, bekommt."</li>
        </ul>

        <div style={{ background: 'rgba(95,251,241,0.06)', border: '1px solid rgba(95,251,241,0.2)', borderRadius: '12px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: '#5ffbf1', margin: '0 0 0.75rem' }}>📍 Wann und wo es erscheint</h3>
          <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.85, margin: 0 }}>
            <li><strong>Nie</strong> auf der Landingpage oder im Entdecken-Flow</li>
            <li><strong>Nie</strong> als erster Kontakt</li>
            <li><strong>Erst</strong> ganz am Ende des Guide-Flows – nach dem Abschluss-Moment</li>
            <li><strong>Erst</strong> wenn der Besucher bereits begeistert ist – als <em>letzte, leise Frage</em></li>
            <li>Zwei Buttons: „Ja, ich kenne jemanden →" und „Vielleicht später" (kein Druck)</li>
          </ul>
        </div>
      </section>

      {/* Kapitel: Praktisch */}
      <Mok2ChapterPage title={mok2Groups[4].chapterTitle} />
      {/* Startanleitung Michael – Begleitschreiben + Link (PC) + QR (Handy) zum Verschicken */}
      <section id="mok2-pilot-start-michael" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(95,251,241,0.2)', pageBreakInside: 'avoid' as const }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Startanleitung Michael
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.25rem' }}>
          Begleitschreiben + Link für PC + QR-Code für Handy – alles zusammen kopieren bzw. Screenshot und an Michael senden.
        </p>

        <div style={{ padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.4)', borderRadius: '10px', marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#22c55e', marginBottom: '0.35rem' }}>So kommt es auf dein Handy</div>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
              QR-Code mit dem Handy scannen → auf dem Handy öffnet sich nur das Schreiben an Michael (Begleitschreiben + Link/QR), keine ganze mök2-Seite. Dann Screenshot(s) machen und an Michael senden. Oder Link unten tippen und aufs Handy schicken.
            </p>
            <a href={pilotSchreibenAufHandyUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', wordBreak: 'break-all', color: '#5ffbf1' }}>
              {pilotSchreibenAufHandyUrl}
            </a>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#22c55e', marginBottom: '0.25rem' }}>QR: Mit Handy scannen</div>
            {pilotHandyLinkQrUrl ? (
              <img src={pilotHandyLinkQrUrl} alt="QR-Code: Schreiben an Michael auf Handy öffnen" style={{ display: 'block', width: 160, height: 160, borderRadius: 8, background: '#fff' }} />
            ) : (
              <div style={{ width: 160, height: 160, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', padding: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
                <span>QR wird geladen …</span>
                <span style={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>Oder Link unten nutzen</span>
              </div>
            )}
          </div>
        </div>

        <h3 style={{ fontSize: '1rem', color: '#5ffbf1', marginBottom: '0.5rem' }}>Begleitschreiben (Schritt-für-Schritt)</h3>
        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '10px', padding: '1.25rem', fontSize: '0.95rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap', marginBottom: '1.5rem' }}>
{`Hallo Michael,

hier dein Zugang zur K2 Galerie (Pro+ zum Start kostenlos). So startest du ohne Aufwand:

Unten findest du den Link für deinen PC und einen QR-Code fürs Handy – beides führt in deine Galerie.

Schritt 1 – Galerie öffnen
PC: Link unten in den Browser kopieren. Handy: QR-Code mit der Kamera scannen.

Schritt 2 – In den Admin
Auf der Galerie-Seite auf „Admin“ tippen bzw. klicken. Passwort-Feld in den ersten 2 Wochen leer lassen – du kommst sofort rein.

Schritt 3 – Deine Galerie einrichten
Unter Einstellungen: Galerie-Name und deinen Kontakt (E-Mail, Telefon) eintragen. Dann wirkt die Galerie wie deine.

Schritt 4 – Erstes Werk anlegen
Unter „Werke verwalten“ auf „Neues Werk“ – Foto und Infos eintragen, Speichern.

Schritt 5 – Veröffentlichen
In Einstellungen „Veröffentlichen“ tippen (oder es läuft nach dem Speichern automatisch). Dann sind deine Daten auf dem Server – nichts geht verloren, wenn du das Gerät wechselst.

Schritt 6 – Am anderen Gerät
Am Handy oder zweitem Rechner: wieder Link nutzen bzw. QR scannen → in Einstellungen „Bilder vom Server laden“ tippen → deine Werke erscheinen.

Wichtig: Immer denselben Link bzw. denselben QR nutzen (PC und Handy), dann bleibt alles in deiner Galerie. Bei Fragen melde dich einfach.

Viel Erfolg!`}
        </div>

        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', marginTop: '1rem' }}>
          <strong>Wichtig:</strong> An Michael schickst du immer nur den einen Link bzw. QR oben („So kommt es auf dein Handy“) – der führt zur Seite „Schreiben an Michael“. Dort tippt Michael auf „Galerie öffnen“ und ist drin. Kein anderer Link und kein anderer QR gehört an Michael.
        </p>
      </section>

      {/* Pilot-Zettel – Testpilot:in ök2/VK2, voller Gratis-Zugang; Teil von mök2 Praktisch */}
      {/* Technikerzettel – für Informatiker zur technischen Beurteilung des Gesamtprojekts */}
      <section id="mok2-technikerzettel" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Technikerzettel (für Informatiker)
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          Kurzüberblick für technische Beurteilung des Gesamtprojekts – Stack, Architektur, Daten, Deployment, Sicherheit, Doku. Ermöglicht Informatiker:innen eine fundierte Einschätzung ohne tiefen Repo-Einstieg.
        </p>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.95)', marginTop: '1rem', marginBottom: '0.5rem' }}>Gesetzte Standards (allgemein)</h3>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
          Im Projekt gelten verbindliche technische und prozessuale Standards, die in Regelwerken (.cursor/rules) und Doku festgehalten sind und bei jeder Änderung beachtet werden sollen:
        </p>
        <ul style={{ lineHeight: 1.65, paddingLeft: '1.2em', marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
          <li><strong>Eine Lösung pro Problemstellung</strong> – Keine parallelen oder abweichenden Wege für dieselbe Aufgabe (z. B. ein einheitlicher Ablauf für „Dokument öffnen“, ein Standard für Stand/QR).</li>
          <li><strong>Kein Datenverlust, kein stilles Überschreiben</strong> – Kundendaten (Werke, Stammdaten, Vereinsdaten) werden nie automatisch gelöscht oder mit weniger/leer überschrieben. Schreiben nur nach expliziter Nutzeraktion oder nach klaren Merge-Regeln (z. B. Server-Merge nur wenn Ergebnis mindestens so viele Einträge hat wie lokal).</li>
          <li><strong>Strenge Datentrennung der Mandanten</strong> – K2, ök2 und VK2 nutzen ausschließlich ihre eigenen Speicher-Keys und Datenquellen; keine Vermischung zwischen Kontexten (weder lesend noch schreibend).</li>
          <li><strong>Skalierung von vornherein mitgedacht</strong> – Eine Architektur, viele Instanzen; Konfiguration statt Festverdrahtung; gleiche Abläufe für alle Mandanten, keine Sonderbauten pro Kunde.</li>
          <li><strong>Eine Quelle pro Konzept</strong> – Pro Thema eine autoritative Quelle (z. B. Stammdaten-Defaults, Ablage docs/Handbuch/mök2), klare Ablage-Regeln und nachvollziehbare Doku.</li>
          <li><strong>Verbindlich statt „hoffen“</strong> – Buttons, Abläufe und Anleitungen sind so umgesetzt, dass sie unter den angegebenen Bedingungen zuverlässig funktionieren; Fehlermeldungen verweisen nicht auf Umwege als Hauptlösung.</li>
          <li><strong>Qualität vor Commit</strong> – Tests (Vitest) und Build müssen grün sein vor Commit/Push; Änderungen sind erst „fertig“, wenn sie committed und getestet sind.</li>
        </ul>
        <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontStyle: 'italic' }}>
          Diese Standards sind aus Betriebserfahrung und Vermächtnis-Anspruch entstanden und werden in Regeldateien sowie in docs (z. B. PRODUKT-STANDARD-NACH-SPORTWAGEN.md, K2-OEK2-DATENTRENNUNG.md) konkret ausformuliert.
        </p>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.95)', marginTop: '1rem', marginBottom: '0.5rem' }}>Stack &amp; Umgebung</h3>
        <ul style={{ lineHeight: 1.65, paddingLeft: '1.2em', marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
          <li><strong>Frontend:</strong> React 19, TypeScript, Vite, Tailwind CSS. PWA (installierbar, Offline-fähig).</li>
          <li><strong>Backend/Speicher:</strong> Supabase (PostgreSQL, Auth, optional KV/Storage). Vercel Blob für Datei-Uploads. Kein eigener App-Server.</li>
          <li><strong>Deployment:</strong> Vercel (Production Branch: main). Build: test → write-build-info → tsc → vite build. Stand-Sync Mac/Handy über build-info.json + Cache-Bust (QR).</li>
          <li><strong>Laufzeit:</strong> Node &gt;= 18. Tests: Vitest. Lint: ESLint.</li>
        </ul>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.95)', marginTop: '1rem', marginBottom: '0.5rem' }}>Architektur &amp; Mandanten</h3>
        <ul style={{ lineHeight: 1.65, paddingLeft: '1.2em', marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
          <li><strong>Multi-Tenant:</strong> K2 (echte Galerie), ök2 (öffentliche Demo), VK2 (Vereinsplattform). Strenge Datentrennung: eigene localStorage-Keys pro Kontext (k2-artworks, k2-oeffentlich-*, k2-vk2-stammdaten). Keine Vermischung – Regeln in .cursor/rules und docs/K2-OEK2-DATENTRENNUNG.md.</li>
          <li><strong>Daten-Schichten:</strong> artworksStorage (Lesen/Schreiben, allowReduce-Regel „nie mit weniger überschreiben“), Supabase-Sync für Werke (optional), gallery-data.json für öffentliche Auslieferung (Vercel).</li>
          <li><strong>APf vs. Produkt:</strong> Arbeitsplattform (Admin, Handbuch, mök2, Mission Control) = Werkzeug (Mac/backupmicro). Galerie, Shop, Willkommen = Produkt (Vercel, alle Geräte).</li>
        </ul>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.95)', marginTop: '1rem', marginBottom: '0.5rem' }}>Daten &amp; Sync</h3>
        <ul style={{ lineHeight: 1.65, paddingLeft: '1.2em', marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
          <li><strong>Werke:</strong> Primär localStorage (k2-artworks); optional Supabase (Laden/Speichern mit Merge, allowReduce: false). Export: gallery-data.json (Git, Vercel). Bilder: Base64 lokal, Vercel-Pfade (/img/k2/) für Sync; optional Supabase Storage.</li>
          <li><strong>Stammdaten/Events/Dokumente:</strong> Kontext-getrennte Keys (k2-stammdaten-*, k2-events, k2-documents; ök2/VK2 analog). Kein stilles Löschen – Regeln in datentrennung-localstorage-niemals-loeschen.mdc.</li>
          <li><strong>Stand überall:</strong> QR-URLs mit Server-Timestamp + Cache-Bust (buildQrUrlWithBust, useServerBuildTimestamp). index.html mit Inject-Script (Stale-Check, build-info-Fetch). vercel.json: no-cache für index.html und build-info.json.</li>
        </ul>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.95)', marginTop: '1rem', marginBottom: '0.5rem' }}>Sicherheit &amp; Qualität</h3>
        <ul style={{ lineHeight: 1.65, paddingLeft: '1.2em', marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
          <li><strong>Kundendaten:</strong> Absolut geschützte Keys (k2-artworks, k2-stammdaten-*, k2-vk2-stammdaten, …). Kein automatisches Löschen/Filter-and-Write. Server-Sync nur bei mayWrite (z. B. merged.length &gt;= localCount).</li>
          <li><strong>Supabase:</strong> RLS, Auth für Admin optional. Env (SUPABASE_URL, Keys) nur serverseitig/Vercel. docs: SUPABASE-RLS-SICHERHEIT.md, ADMIN-AUTH-SETUP.md.</li>
          <li><strong>Tests:</strong> Vitest (Artworks-Speicherung, Datentrennung, Kundendaten-Schutz, Bild-Upload). QS vor Commit: npm run test, npm run build.</li>
        </ul>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.95)', marginTop: '1rem', marginBottom: '0.5rem' }}>Dokumentation &amp; Einstieg</h3>
        <ul style={{ lineHeight: 1.65, paddingLeft: '1.2em', marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
          <li><strong>docs/00-INDEX.md</strong> – Inhaltsverzeichnis aller technischen Docs (Deployment, Supabase, K2/ök2, Crash, Sicherheit, Roadmap).</li>
          <li><strong>HAUS-INDEX.md</strong> (Root) – Struktur für unser Handeln, Ablage (docs / Handbuch / mök2).</li>
          <li><strong>.cursor/rules/*.mdc</strong> – Verbindliche Regeln (Stand/QR, Datentrennung, Werke bombensicher, kein Datenverlust, APf vs. Produkt, etc.).</li>
          <li><strong>k2team-handbuch/00-INDEX.md</strong> – Wichtige Sachen für Team/Nutzer (druckbar).</li>
          <li><strong>Produkt &amp; Vision:</strong> docs/PRODUKT-VISION.md, docs/PRODUKT-STANDARD-NACH-SPORTWAGEN.md, docs/PLATTFORM-UNTERSTUETZUNG.md.</li>
        </ul>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.95)', marginTop: '1rem', marginBottom: '0.5rem' }}>Beurteilung: Level im Vergleich zu vergleichbaren Projekten</h3>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
          Einordnung, wo sich K2 Galerie / ök2 technisch und prozessual im Vergleich zu typischen Referenzprojekten einstuft:
        </p>
        <ul style={{ lineHeight: 1.65, paddingLeft: '1.2em', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
          <li><strong>Galerie-/Künstler-Websites (Baukasten, Agentur-Lösungen):</strong> Oft statische Sites oder einfache CMS ohne durchgängige Datenbasis für Werke, Kasse, Events und Marketing. K2/ök2 liegt <strong>darüber</strong>: eine integrierte App mit einheitlicher Datenbasis, Multi-Mandant, PWA, Sync und klaren Speicher-/Merge-Regeln.</li>
          <li><strong>Typisches Startup-MVP:</strong> Häufig schneller Prototyp, wenig formale Regeln, Doku nachgezogen. Hier: <strong>über MVP-Niveau</strong> – verbindliche Regeln (eine Quelle pro Thema, kein Datenverlust, Datentrennung), automatisierte Tests, dokumentierte Architektur und Ablage, QS vor Commit. Entspricht eher dem Niveau „produktionsreif für definierten Umfang“.</li>
          <li><strong>Kleine professionelle SaaS-Produkte (kleines Team, B2B-Nische):</strong> Vergleichbar in Punkten: moderne Stack-Wahl (React, TypeScript, Supabase, Vercel), Multi-Tenant-Architektur, Trennung Werkzeug vs. Produkt, schriftlich fixierte Standards und Doku-Struktur. Noch kein großes Team, keine 24/7-SLA – aber <strong>Level „kleines professionelles Produkt“</strong> mit klarer Skalierungsvorbereitung (Konfiguration, Mandantenmodell).</li>
          <li><strong>Open-Source- oder Nischen-Projekte ohne formale Prozesse:</strong> Viele Nischen- oder Community-Projekte haben kaum festgehaltene Regeln oder einheitliche Ablage. K2/ök2 hat <strong>explizit gesetzte Standards</strong>, Regelwerke und ein klares Einstiegs- und Dokumentationsmodell – damit für Übernahme oder Due-Diligence besser einordnen und weiterführen.</li>
        </ul>
        <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55 }}>
          <strong>Kurz:</strong> Technisch und prozessual auf dem Level eines <strong>kleinen professionellen Produkts</strong> mit verbindlichen Standards, Tests und Doku – über typisches MVP und über einfache Galerie-Websites hinaus; noch nicht auf dem Niveau großer Enterprise-SaaS (großes Team, SLA, Compliance-Zertifikate). Für Einzelkünstler:innen, kleine Galerien und Kunstvereine (VK2) produktiv nutzbar und für Lizenzierung/Weiterentwicklung vorbereitet.
        </p>

        <div style={{ padding: '1rem 1.25rem', background: 'rgba(95,251,241,0.1)', border: '1px solid rgba(95,251,241,0.35)', borderRadius: 10, marginTop: '1rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#5ffbf1', marginBottom: '0.5rem' }}>Zweck dieses Zettels</div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.95)', lineHeight: 1.55 }}>
            Ermöglicht externen Informatiker:innen (Due-Diligence, Technik-Check, Übernahme) das Projekt technisch einzuordnen: Stack, Mandantenmodell, Datenfluss, Sicherheitsregeln und Doku-Struktur – ohne sofort das gesamte Repo zu durchsuchen. Bei vertiefter Prüfung: docs/00-INDEX.md und genannte Regeln/Docs nutzen.
          </p>
        </div>
      </section>

      <section id="mok2-pilot-zettel" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(95,251,241,0.2)', pageBreakInside: 'avoid' as const }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Pilot-Zettel drucken
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
          Ein Zettel pro Testpilot:in – voller Gratis-Zugang zu ök2 und VK2. Name (und optional Pilot-URL) eintragen, Zettel anzeigen, drucken – QR und Adresse sind indexiert.
        </p>
        <a
          href="/zettel-pilot-form"
          style={{ display: 'inline-block', padding: '0.75rem 1.25rem', background: 'linear-gradient(120deg, #f59e0b, #d97706)', color: '#fff', fontWeight: 600, borderRadius: '10px', textDecoration: 'none', fontFamily: 'inherit' }}
        >
          📄 Pilot-Zettel (Name eintragen, dann 🖨️ Drucken)
        </a>
      </section>

      <footer style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
        <ProductCopyright /> · Stand: Februar 2026 · Quelle: USP-UND-MARKTCHANCEN.md, VERMARKTUNGSKONZEPT-EMPFEHLUNGSPROGRAMM.md, Produkt-Vision, Galerie-App Feature-Stand.
      </footer>
    </article>
  )
}
