import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { BASE_APP_URL, PROJECT_ROUTES } from '../config/navigation'
import { getPageTexts } from '../config/pageTexts'
import { getGalerieImages } from '../config/pageContentGalerie'
import {
  K2_STAMMDATEN_DEFAULTS,
  MUSTER_TEXTE,
  PRODUCT_COPYRIGHT_BRAND_ONLY,
  PRODUCT_OEK2_MARKETING_ERKLAERUNG_FLYER,
  TENANT_CONFIGS,
} from '../config/tenantConfig'
import { useTenant } from '../context/TenantContext'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { loadEvents } from '../utils/eventsStorage'
import { getOeffentlichEventsWithMusterFallback, pickOpeningEventForWerbemittel } from '../utils/oek2MusterEventLinie'
import {
  type EventTerminLike,
  formatEventTerminKomplett,
} from '../utils/eventTerminFormat'
import { compressImageForStorage } from '../utils/compressImageForStorage'
import { getFlyerEventBogenStorageKey } from '../utils/flyerEventBogenStorageKeys'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import {
  DEFAULT_HOMEPAGE_DESIGN,
  designToPlakatVars,
  type HomepageDesign,
} from '../config/marketingWerbelinie'

const ROOT = 'flyer-event-bogen-neu'

/** K2: unverändert Galerie-Standardbild aus dem K2-Bestand. */
const K2_FLYER_BILD_FALLBACK = '/img/k2/willkommen.jpg'
/** ök2 / VK2: neutrales Dummy-Bild statt K2-Fotos oder Demo-JPEGs. */
const FLYER_DUMMY_BILD_OEK2_VK2 = '/img/muster/malerei.svg'

function flyerImageFallbackPath(isOeffentlich: boolean, isVk2: boolean): string {
  return isOeffentlich || isVk2 ? FLYER_DUMMY_BILD_OEK2_VK2 : K2_FLYER_BILD_FALLBACK
}

function flyerFrontQrAlt(isOeffentlich: boolean, isVk2: boolean): string {
  if (isOeffentlich) return 'QR Demo-Galerie ök2'
  if (isVk2) return 'QR VK2-Galerie'
  return 'QR K2 Galerie'
}

function flyerDesignStorageKey(isOeffentlich: boolean, isVk2: boolean): string {
  if (isOeffentlich) return 'k2-oeffentlich-design-settings'
  if (isVk2) return 'k2-vk2-design-settings'
  return 'k2-design-settings'
}

function loadHomepageDesignForFlyer(isOeffentlich: boolean, isVk2: boolean): HomepageDesign | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(flyerDesignStorageKey(isOeffentlich, isVk2))
    if (!raw) return null
    const o = JSON.parse(raw) as HomepageDesign
    return o && typeof o === 'object' ? o : null
  } catch {
    return null
  }
}

function hexToRgbaFlyer(hex: string, alpha: number): string {
  const h = hex.replace(/^#/, '')
  if (h.length !== 6 && h.length !== 3) return `rgba(15, 111, 102, ${alpha})`
  const r = h.length === 6 ? parseInt(h.slice(0, 2), 16) : parseInt(h[0] + h[0], 16)
  const g = h.length === 6 ? parseInt(h.slice(2, 4), 16) : parseInt(h[1] + h[1], 16)
  const b = h.length === 6 ? parseInt(h.slice(4, 6), 16) : parseInt(h[2] + h[2], 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function hexToRgbaFromHex(hex: string, alpha: number): string {
  const h = hex.replace(/^#/, '')
  if (h.length !== 6) return `rgba(253, 251, 248, ${alpha})`
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function mixHexWithBlack(hex: string, amount: number): string {
  const h = hex.replace(/^#/, '')
  if (h.length !== 6) return '#0c5550'
  const f = 1 - amount
  const r = Math.round(parseInt(h.slice(0, 2), 16) * f)
  const g = Math.round(parseInt(h.slice(2, 4), 16) * f)
  const b = Math.round(parseInt(h.slice(4, 6), 16) * f)
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`
}

function relativeLuminanceHex(hex: string): number {
  const h = hex.replace(/^#/, '')
  if (h.length !== 6) return 0.35
  const rgb = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const lin = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

/** Text auf Akzentfläche (Hero, Invite-Panel): hell oder dunkel je nach Akzenthelligkeit. */
function onAccentCaptionColor(accentHex: string): string {
  return relativeLuminanceHex(accentHex) > 0.55 ? '#1a120c' : '#fdfbf8'
}

function buildFlyerThemeInject(homepageDesignForFlyer: HomepageDesign | null): { inject: string } {
  const p = designToPlakatVars(homepageDesignForFlyer)
  const d =
    homepageDesignForFlyer && (homepageDesignForFlyer.accentColor || homepageDesignForFlyer.backgroundColor1)
      ? homepageDesignForFlyer
      : DEFAULT_HOMEPAGE_DESIGN
  const accent = d.accentColor || DEFAULT_HOMEPAGE_DESIGN.accentColor!
  const accentDeep = mixHexWithBlack(accent, 0.35)
  const k2GreenText = onAccentCaptionColor(accent)
  const bg1 = d.backgroundColor1 || DEFAULT_HOMEPAGE_DESIGN.backgroundColor1!
  const bg2 = d.backgroundColor2 || DEFAULT_HOMEPAGE_DESIGN.backgroundColor2!
  const h = (a: number) => hexToRgbaFlyer(accent, a)
  const inviteGrad = `linear-gradient(145deg, ${h(0.98)} 0%, ${hexToRgbaFlyer(accentDeep, 0.99)} 100%)`
  const imgHole = mixHexWithBlack(bg1, 0.22)
  const inject = `
          --k2-green:${accent};
          --k2-green-deep:${accentDeep};
          --k2-green-text:${k2GreenText};
          --flyer-hero-names:${hexToRgbaFromHex(k2GreenText, 0.88)};
          --flyer-hero-opening:${hexToRgbaFromHex(k2GreenText, 0.95)};
          --flyer-accent-a08:${h(0.08)};
          --flyer-accent-a10:${h(0.1)};
          --flyer-accent-a11:${h(0.11)};
          --flyer-accent-a15:${h(0.15)};
          --flyer-accent-a18:${h(0.18)};
          --flyer-accent-a20:${h(0.2)};
          --flyer-accent-a22:${h(0.22)};
          --flyer-accent-a28:${h(0.28)};
          --flyer-accent-a30:${h(0.3)};
          --flyer-invite-bg:${inviteGrad};
          --flyer-content-v2-bg:${bg2};
          --flyer-poster-surface:${bg1};
          --flyer-img-hole:${imgHole};
          --flyer-text-on-dark:${p.text};
          --flyer-muted-caption:${p.muted};
          --flyer-poster-text:${p.text};
          font-family:${p.font};
  `.trim()
  return { inject }
}
/** Master-Ansicht: oben Vorderseite, unten Rückseite (jeweils einmal). */
const FLYER_SAVE_MAX_BYTES = 4_200_000

type FlyerLeftCompressMode = 'normal' | 'aggressive' | 'minimal'

/** Data-URL / Blob-URL vor localStorage stark verkleinern (vermeidet QuotaExceeded / „Speicher voll“). */
async function compressLeftSrcForFlyerStorage(leftSrc: string, mode: FlyerLeftCompressMode): Promise<string> {
  if (!leftSrc) return leftSrc
  if (!leftSrc.startsWith('data:image') && !leftSrc.startsWith('blob:')) return leftSrc
  const opts =
    mode === 'minimal'
      ? ({
          context: 'artwork' as const,
          maxWidth: 480,
          quality: 0.46,
          maxBytes: 85_000,
          minQuality: 0.36,
        } as const)
      : mode === 'aggressive'
        ? ({
            context: 'artwork' as const,
            maxWidth: 680,
            quality: 0.55,
            maxBytes: 220_000,
            minQuality: 0.45,
          } as const)
        : ({
            context: 'artwork' as const,
            maxWidth: 1000,
            quality: 0.68,
            maxBytes: 400_000,
            minQuality: 0.5,
          } as const)
  try {
    if (leftSrc.startsWith('data:image')) {
      return await compressImageForStorage(leftSrc, opts)
    }
    const res = await fetch(leftSrc)
    const blob = await res.blob()
    if (!blob.type.startsWith('image/')) return leftSrc
    const file = new File([blob], 'flyer-upload.jpg', { type: blob.type || 'image/jpeg' })
    return await compressImageForStorage(file, opts)
  } catch {
    return leftSrc
  }
}

function galleryFallbackImagePath(isOeffentlich: boolean, isVk2: boolean): string {
  if (isOeffentlich || isVk2) return flyerImageFallbackPath(isOeffentlich, isVk2)
  const g = loadStammdaten('k2', 'gallery')
  const gi = getGalerieImages(g)
  return gi.galerieCardImage || gi.welcomeImage || K2_FLYER_BILD_FALLBACK
}

type MasterEditKey = 'intro' | 'image' | 'backSlogan' | 'backPower' | 'backSub' | 'backInvite' | 'marketing'

const MASTER_EDIT_LABELS: Record<MasterEditKey, string> = {
  intro: 'Text Vorderseite (Intro)',
  image: 'Werkbild aus Datei',
  backSlogan: 'Rückseite Slogan',
  backPower: 'Rückseite Kernaussage',
  backSub: 'Rückseite Unterzeile',
  backInvite: 'Rückseite Einladung (neben QR)',
  marketing: 'Rückseite Fließtext (Absätze mit Leerzeile)',
}

type FlyerEventBogenPersistedV1 = {
  v: 1
  /** true/undefined: Vorderseiten-Intro = live aus Galerie-Willkommenstext (Admin/Design). false: fester Text in masterText.intro */
  introFollowsGallery?: boolean
  masterText: {
    intro: string
    backSlogan: string
    backPower: string
    backSub: string
    backInvite: string
    marketingBlocksRaw: string
  }
  leftSrc: string
  leftWerkLabel: string
  savedAt: number
}

function loadFlyerEventBogenPersisted(storageKey: string): Partial<FlyerEventBogenPersistedV1> | null {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<FlyerEventBogenPersistedV1>
    if (p?.v !== 1 || typeof p.masterText !== 'object' || !p.masterText) return null
    return p
  } catch {
    return null
  }
}

function defaultMasterTextFromBase(isOeffentlich: boolean): FlyerEventBogenPersistedV1['masterText'] {
  const b = isOeffentlich ? getOek2MusterBasics() : getK2Basics()
  return {
    intro: b.intro,
    backSlogan: 'für Menschen mit Ideen, die gesehen werden wollen.',
    backPower: 'Deine Ideen verdienen mehr als einen Instagram-Post.',
    backSub: 'ök2 macht Ideen sichtbar: klar, professionell und ohne Umwege.',
    backInvite: 'Erlebe Ideen, Werke und starke Präsentation in einer modernen Online-Galerie.',
    marketingBlocksRaw: PRODUCT_OEK2_MARKETING_ERKLAERUNG_FLYER,
  }
}

function mergeMasterTextFromPersisted(
  persisted: Partial<FlyerEventBogenPersistedV1> | null,
  isOeffentlich: boolean,
): FlyerEventBogenPersistedV1['masterText'] {
  const d = defaultMasterTextFromBase(isOeffentlich)
  if (!persisted?.masterText) return d
  const m = persisted.masterText
  return {
    intro: typeof m.intro === 'string' ? m.intro : d.intro,
    backSlogan: typeof m.backSlogan === 'string' ? m.backSlogan : d.backSlogan,
    backPower: typeof m.backPower === 'string' ? m.backPower : d.backPower,
    backSub: typeof m.backSub === 'string' ? m.backSub : d.backSub,
    backInvite: typeof m.backInvite === 'string' ? m.backInvite : d.backInvite,
    marketingBlocksRaw:
      typeof m.marketingBlocksRaw === 'string' ? m.marketingBlocksRaw : d.marketingBlocksRaw,
  }
}

function firstName(value: string, fallback: string): string {
  const normalized = String(value || '').trim()
  if (!normalized) return fallback
  return normalized.split(/\s+/)[0] || fallback
}

function lastName(value: string, fallback: string): string {
  const normalized = String(value || '').trim()
  if (!normalized) return fallback
  const parts = normalized.split(/\s+/)
  return parts.length > 1 ? parts[parts.length - 1] : fallback
}

function getK2Basics() {
  const gallery = loadStammdaten('k2', 'gallery')
  const martina = loadStammdaten('k2', 'martina')
  const georg = loadStammdaten('k2', 'georg')
  const defaults = K2_STAMMDATEN_DEFAULTS
  const martinaFirst = firstName(martina.name || defaults.martina.name || '', 'Martina')
  const georgFirst = firstName(georg.name || defaults.georg.name || '', 'Georg')
  const familyName = lastName(georg.name || defaults.georg.name || '', 'Kreinecker')
  const subtitle = `${martinaFirst} & ${georgFirst} ${familyName}`.trim()
  return {
    galleryName: gallery.name || defaults.gallery.name || 'K2 Galerie',
    brandLine: 'K2 Galerie Kunst&Keramik',
    brandSub: subtitle,
    backCardTitle: 'K2 Galerie',
    intro:
      getPageTexts().galerie.welcomeIntroText ||
      'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.',
    subtitle,
    address: gallery.address || defaults.gallery.address || '',
    city: gallery.city || defaults.gallery.city || '',
    phone: gallery.phone || defaults.gallery.phone || '',
    email: gallery.email || defaults.gallery.email || '',
  }
}

/** Flyer-Basis für ök2 / Mustergalerie – keine K2-Echtdaten. */
function getOek2MusterBasics() {
  const gallery = loadStammdaten('oeffentlich', 'gallery')
  const martina = loadStammdaten('oeffentlich', 'martina')
  const georg = loadStammdaten('oeffentlich', 'georg')
  const o = TENANT_CONFIGS.oeffentlich
  const mt = MUSTER_TEXTE
  const galleryName = String(gallery.name || o.galleryName || 'Galerie Muster').trim()
  const mName = String(martina.name || mt.martina.name || 'Lena Berg').trim()
  const gName = String(georg.name || mt.georg.name || 'Paul Weber').trim()
  const subtitle = `${mName} & ${gName}`
  const pt = getPageTexts('oeffentlich')
  const introDefault =
    'Ein Neuanfang mit Leidenschaft. Entdecke die Verbindung von Malerei und Keramik in einem Raum, wo Kunst zum Leben erwacht.'
  return {
    galleryName,
    brandLine: `${galleryName} ${o.tagline}`.replace(/\s+/g, ' ').trim(),
    brandSub: subtitle,
    backCardTitle: galleryName,
    intro: String(pt.galerie?.welcomeIntroText || '').trim() || introDefault,
    subtitle,
    address: gallery.address || mt.gallery.address || '',
    city: gallery.city || mt.gallery.city || '',
    phone: gallery.phone || mt.gallery.phone || '',
    email: gallery.email || mt.gallery.email || '',
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
  const { isOeffentlich, isVk2 } = useTenant()
  const flyerStorageKey = getFlyerEventBogenStorageKey(isOeffentlich)
  const flyerImgFallback = useMemo(
    () => flyerImageFallbackPath(isOeffentlich, isVk2),
    [isOeffentlich, isVk2],
  )
  const frontQrPathExplain = useMemo(() => {
    if (isOeffentlich) return PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
    if (isVk2) return PROJECT_ROUTES.vk2.galerie
    return PROJECT_ROUTES['k2-galerie'].galerie
  }, [isOeffentlich, isVk2])
  const backQrPathExplain = PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
  const [searchParams] = useSearchParams()
  const isA3Mode = searchParams.get('mode') === 'a3'
  const isA6Mode = searchParams.get('mode') === 'a6'
  const isCardMode = searchParams.get('mode') === 'card'
  /** Aus Marketing/Admin: gleiches Event wie auf der Event-Karte (Herzstück = Master-Datenbasis). */
  const eventIdFromUrl = useMemo(() => (searchParams.get('eventId') || '').trim(), [searchParams])
  /** Von Galerie „Aktuelles“ (flyerEventBogenUrl fromPublicGalerie): Zurück = Galerie, nicht Werbeunterlagen. */
  const fromPublicGalerie = useMemo(() => (searchParams.get('from') || '') === 'publicGalerie', [searchParams])
  /** Master ist fix: Variante 2 (vorne ein Bild, hinten nur Text). */
  const layoutFromUrl: 'standard' | 'variant2' = 'variant2'
  const { versionTimestamp } = useQrVersionTimestamp()
  /** Neu laden bei Event-/Stammdaten-Änderung (Admin, anderes Tab, Tab-Rückkehr). */
  const [flyerDataTick, setFlyerDataTick] = useState(0)
  const homepageDesignForFlyer = useMemo(
    () => loadHomepageDesignForFlyer(isOeffentlich, isVk2),
    [isOeffentlich, isVk2, flyerDataTick],
  )
  const flyerTheme = useMemo(() => buildFlyerThemeInject(homepageDesignForFlyer), [homepageDesignForFlyer])
  const base = useMemo(
    () => (isOeffentlich ? getOek2MusterBasics() : getK2Basics()),
    [isOeffentlich, flyerDataTick],
  )
  const gallery = useMemo(
    () => loadStammdaten(isOeffentlich ? 'oeffentlich' : 'k2', 'gallery'),
    [flyerDataTick, isOeffentlich],
  )
  const galerieImages = getGalerieImages(gallery)
  const defaultLeft =
    galerieImages.galerieCardImage || galerieImages.welcomeImage || flyerImgFallback
  const defaultMiddle = galerieImages.welcomeImage || flyerImgFallback
  const defaultRight = galerieImages.virtualTourImage || galerieImages.welcomeImage || flyerImgFallback

  const [leftSrc, setLeftSrc] = useState(() => {
    const p = loadFlyerEventBogenPersisted(getFlyerEventBogenStorageKey(isOeffentlich))
    const s = p?.leftSrc
    const fb = flyerImageFallbackPath(isOeffentlich, isVk2)
    const demo = isOeffentlich || isVk2
    if (demo) {
      if (typeof s === 'string' && s.length > 0 && (s.startsWith('data:image') || s.startsWith('blob:'))) {
        return s
      }
      return fb
    }
    if (typeof s === 'string' && s.length > 0 && !s.startsWith('blob:')) {
      return s
    }
    const g = loadStammdaten('k2', 'gallery')
    const gi = getGalerieImages(g)
    return gi.galerieCardImage || gi.welcomeImage || fb
  })
  const [middleSrc, setMiddleSrc] = useState(defaultMiddle)
  const [rightSrc, setRightSrc] = useState(defaultRight)
  const [leftWerkLabel, setLeftWerkLabel] = useState(() => {
    const p = loadFlyerEventBogenPersisted(getFlyerEventBogenStorageKey(isOeffentlich))?.leftWerkLabel
    return typeof p === 'string' && p.trim() ? p : 'Bild aus Datei'
  })
  const [isLeftDropActive, setIsLeftDropActive] = useState(false)
  const [frontQrDataUrl, setFrontQrDataUrl] = useState('')
  const [backQrDataUrl, setBackQrDataUrl] = useState('')
  const [eventDateLine, setEventDateLine] = useState('Termin folgt')
  const [eroeffnungEvent, setEroeffnungEvent] = useState<EventTerminLike | null>(null)
  const [page1Layout, setPage1Layout] = useState<'standard' | 'variant2'>(layoutFromUrl)
  const [frontVariant, setFrontVariant] = useState<'A' | 'B'>('A')
  const [masterText, setMasterText] = useState(() =>
    mergeMasterTextFromPersisted(
      loadFlyerEventBogenPersisted(getFlyerEventBogenStorageKey(isOeffentlich)),
      isOeffentlich,
    ),
  )
  const [introFollowsGallery, setIntroFollowsGallery] = useState(() => {
    const p = loadFlyerEventBogenPersisted(getFlyerEventBogenStorageKey(isOeffentlich)) as
      | (Partial<FlyerEventBogenPersistedV1> & { introFollowsGallery?: boolean })
      | null
    if (p && typeof p.introFollowsGallery === 'boolean') return p.introFollowsGallery
    return true
  })
  const introForPreview = useMemo(
    () => (introFollowsGallery ? base.intro : masterText.intro),
    [introFollowsGallery, base.intro, masterText.intro],
  )
  const [masterEditField, setMasterEditField] = useState<MasterEditKey | null>(null)
  const [masterLiveInfo, setMasterLiveInfo] = useState<string | null>(null)
  const [modalPos, setModalPos] = useState({ x: 72, y: 64 })
  const [showDerivationFullscreen, setShowDerivationFullscreen] = useState(false)
  const [flyerSaveMessage, setFlyerSaveMessage] = useState('')
  const [bwPrintPreview, setBwPrintPreview] = useState(false)
  const middleViewSrc = middleSrc || leftSrc || rightSrc || defaultMiddle

  /** ök2/VK2: URL-Pfade aus alter Persistenz ignorieren; Upload (data/blob) behalten. Ohne flyerDataTick – sonst Flackern bei React Strict Mode / Daten-Updates. */
  useEffect(() => {
    if (!isOeffentlich && !isVk2) return
    setLeftSrc((prev) => {
      if (typeof prev === 'string' && (prev.startsWith('data:image') || prev.startsWith('blob:'))) return prev
      return flyerImgFallback
    })
  }, [isOeffentlich, isVk2, flyerImgFallback])

  /**
   * Galerie „Aktuelles“ → A3/A6/Karte (`from=publicGalerie`, K2): Vorschau soll **aktuelle**
   * Bilder aus „Galerie gestalten“ zeigen – nicht einen früher gespeicherten Flyer-Master aus
   * localStorage (sonst wirkt das Plakat „veraltet“ mit falschem Motiv).
   */
  useEffect(() => {
    if (!fromPublicGalerie || isOeffentlich || isVk2) return
    const g = loadStammdaten('k2', 'gallery')
    const gi = getGalerieImages(g)
    const fb = flyerImgFallback
    setLeftSrc(gi.galerieCardImage || gi.welcomeImage || fb)
    setMiddleSrc(gi.welcomeImage || fb)
    setRightSrc(gi.virtualTourImage || gi.welcomeImage || fb)
  }, [fromPublicGalerie, isOeffentlich, isVk2, flyerDataTick, flyerImgFallback])

  const werbeunterlagenHref = useMemo(() => {
    const b = PROJECT_ROUTES['k2-galerie'].werbeunterlagen
    if (isOeffentlich) return `${b}?context=oeffentlich`
    if (isVk2) return `${b}?context=vk2`
    return b
  }, [isOeffentlich, isVk2])

  const handleToolbarBack = useCallback(() => {
    if (fromPublicGalerie) {
      navigate(frontQrPathExplain)
      return
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate(werbeunterlagenHref)
  }, [navigate, werbeunterlagenHref, fromPublicGalerie, frontQrPathExplain])

  /** Interne Varianten-Links: Kontext + eventId mitschleifen (Master ↔ Ableitungen eine Datenbasis). */
  const buildFlyerEventSelfUrl = useCallback(
    (extra: Record<string, string>) => {
      const base = PROJECT_ROUTES['k2-galerie'].flyerEventBogenNeu
      const sp = new URLSearchParams()
      if (isOeffentlich) sp.set('context', 'oeffentlich')
      if (isVk2 && !isOeffentlich) sp.set('context', 'vk2')
      if (eventIdFromUrl) sp.set('eventId', eventIdFromUrl)
      if (fromPublicGalerie) sp.set('from', 'publicGalerie')
      Object.entries(extra).forEach(([k, v]) => {
        if (v !== undefined && v !== '') sp.set(k, v)
      })
      const q = sp.toString()
      return q ? `${base}?${q}` : base
    },
    [isOeffentlich, isVk2, eventIdFromUrl, fromPublicGalerie],
  )

  const handleSaveFlyerMaster = useCallback(async () => {
    const buildPayload = (src: string): FlyerEventBogenPersistedV1 => ({
      v: 1,
      introFollowsGallery,
      masterText: {
        intro: introFollowsGallery ? base.intro : masterText.intro,
        backSlogan: masterText.backSlogan,
        backPower: masterText.backPower,
        backSub: masterText.backSub,
        backInvite: masterText.backInvite,
        marketingBlocksRaw: masterText.marketingBlocksRaw,
      },
      leftSrc: src,
      leftWerkLabel,
      savedAt: Date.now(),
    })

    let leftSrcToSave = await compressLeftSrcForFlyerStorage(leftSrc, 'normal')
    let payload = buildPayload(leftSrcToSave)
    let json = JSON.stringify(payload)

    if (json.length > FLYER_SAVE_MAX_BYTES) {
      leftSrcToSave = await compressLeftSrcForFlyerStorage(leftSrc, 'aggressive')
      payload = buildPayload(leftSrcToSave)
      json = JSON.stringify(payload)
    }

    if (json.length > FLYER_SAVE_MAX_BYTES) {
      leftSrcToSave = await compressLeftSrcForFlyerStorage(leftSrc, 'minimal')
      payload = buildPayload(leftSrcToSave)
      json = JSON.stringify(payload)
    }

    const fallbackPath = galleryFallbackImagePath(isOeffentlich, isVk2)
    if (json.length > FLYER_SAVE_MAX_BYTES) {
      payload = buildPayload(fallbackPath)
      json = JSON.stringify(payload)
    }

    const storageFullHint = isOeffentlich
      ? [
          'Warum „Speichern“ trotzdem Platz braucht: Es landet eine Kopie des Flyer-Masters im Browser (Texte + Vorderseiten-Bild als eingebettete Daten). Das sind keine neuen Werke auf dem Server – aber im Browser zählt jedes große Bild extra. Steckt dasselbe Motiv schon riesig in der Galerie-Seite (eingebettet), wirkt es im Speicher wie eine zweite Kopie.',
          '',
          'Praxis: Große Bilder lieber hochladen und in der Galerie nur mit kurzer URL (z. B. /img/...) verknüpfen – dann bleibt der Flyer-Master klein. K2 und ök2 teilen sich im Browser dasselbe Kontingent.',
          '',
          'Was jetzt hilft: kleineres Foto auf der Vorderseite, kürzere Texte, oder Admin → Einstellungen → Backup: „Speicher freigeben“ / „Flyer-Master aus Browser-Speicher entfernen“. Sonst Browser → Websitedaten dieser App prüfen.',
        ].join('\n')
      : [
          '„Speichern“ legt eine Kopie des Flyer-Masters im Browser ab (Texte + Bild). Das ist keine neue Werkdatei, braucht aber trotzdem eigenen Platz neben Galerie, Werken und Backups.',
          '',
          'Was hilft: Vorderseiten-Bild verkleinern, Texte kürzen, oder Admin → Einstellungen → Backup (Speicher freigeben / Flyer-Master entfernen).',
        ].join('\n')

    try {
      if (json.length > FLYER_SAVE_MAX_BYTES) {
        setFlyerSaveMessage(
          isOeffentlich
            ? 'Zu groß zum Speichern – Texte kürzen, kleineres Flyer-Bild, oder in Einstellungen den Flyer-Master aus dem Browser entfernen.'
            : 'Zu groß zum Speichern – Texte kürzen, Flyer-Bild verkleinern, oder Einstellungen → Backup (Flyer-Master / Speicher freigeben).',
        )
        window.setTimeout(() => setFlyerSaveMessage(''), 8000)
        return
      }
      localStorage.setItem(flyerStorageKey, json)
      setLeftSrc(leftSrcToSave)
      if (leftSrcToSave === fallbackPath && leftSrc !== fallbackPath) {
        setFlyerSaveMessage(
          isOeffentlich || isVk2
            ? 'Gespeichert mit neutralem Platzhalterbild – dein Foto war zu groß für den Speicher (automatisch ersetzt).'
            : 'Gespeichert mit Galerie-Standardbild – dein Foto war zu groß für den Speicher (automatisch ersetzt).',
        )
        window.setTimeout(() => setFlyerSaveMessage(''), 7000)
      } else {
        setFlyerSaveMessage('Gespeichert. Du bleibst auf dem Flyer-Master und kannst weiterbearbeiten.')
        window.setTimeout(() => setFlyerSaveMessage(''), 6000)
      }
    } catch (e) {
      const quota =
        e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)
      try {
        const tinyLeft = await compressLeftSrcForFlyerStorage(leftSrc, 'minimal')
        const tinyPayload = buildPayload(tinyLeft)
        const tinyJson = JSON.stringify(tinyPayload)
        if (tinyJson.length <= FLYER_SAVE_MAX_BYTES) {
          try {
            localStorage.setItem(flyerStorageKey, tinyJson)
            setLeftSrc(tinyLeft)
            window.alert(
              quota
                ? 'Speicher im Browser ist knapp. Es wurde mit stark verkleinertem Vorderseiten-Bild gespeichert. Das sind keine „neuen Server-Daten“ – aber jede Kopie mit großem Foto braucht im Browser Platz. Ausführliche Tipps stehen in der Meldezeile auf der Seite.'
                : 'Gespeichert mit verkleinertem Vorderseiten-Bild. Details stehen in der Meldezeile.',
            )
            setFlyerSaveMessage(storageFullHint)
            window.setTimeout(() => setFlyerSaveMessage(''), 12000)
            return
          } catch {
            /* weiter mit Nur-Text */
          }
        }
        const minimal = buildPayload(fallbackPath)
        const j2 = JSON.stringify(minimal)
        if (j2.length <= FLYER_SAVE_MAX_BYTES) {
          localStorage.setItem(flyerStorageKey, j2)
          setLeftSrc(fallbackPath)
          window.alert(
            quota
              ? 'Speicher im Browser ist knapp. Nur Texte und kleines Standardbild wurden gespeichert – das große Vorderseiten-Foto passte nicht mehr mit.\n\nKurz: Speichern = Kopie im Browser; eingebettete Fotos verdoppeln oft den Platzbedarf. Tipps in der Meldezeile.'
              : 'Nur Texte und Standardbild wurden gespeichert. Details in der Meldezeile.',
          )
          setFlyerSaveMessage(storageFullHint)
          window.setTimeout(() => setFlyerSaveMessage(''), 12000)
          return
        }
      } catch {
        /* zweiter Versuch gescheitert */
      }
      setFlyerSaveMessage(quota ? storageFullHint : 'Speichern fehlgeschlagen. Bitte Seite neu laden und erneut versuchen.')
      window.setTimeout(() => setFlyerSaveMessage(''), 10000)
    }
  }, [
    base.intro,
    flyerStorageKey,
    introFollowsGallery,
    isOeffentlich,
    isVk2,
    leftSrc,
    leftWerkLabel,
    masterText,
  ])

  const oek2MarketingBlocks = useMemo(
    () =>
      masterText.marketingBlocksRaw.split(/\n\n+/)
        .map((s: string) => s.trim())
        .filter(Boolean),
    [masterText.marketingBlocksRaw]
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
  const a6EventDateLine = useMemo(
    () =>
      formatEventTerminKomplett(eroeffnungEvent, {
        mode: 'compact',
        emptyFallback: 'Termin folgt',
        withClockEmojiSingle: false,
      }),
    [eroeffnungEvent]
  )
  /** Kurztext neben dem QR auf A6 / Druck: eigene Galerie nach Lizenz vs. Demo/K2/VK2. */
  const qrCodeGalerieDruckHinweis = useMemo(() => {
    if (isOeffentlich) {
      return 'Mit eigener Lizenz führt dieser QR-Code zu Ihrer neuen Online-Galerie. In der Demo öffnet er die Mustergalerie.'
    }
    if (isVk2) {
      return 'Gescannt gelangen Besucher zur Online-Galerie Ihres Vereins.'
    }
    return 'Gescannt gelangen Besucher zur öffentlichen Online-Galerie – dort sind Ihre Werke sichtbar.'
  }, [isOeffentlich, isVk2])
  /** ök2: Überschrift aus Muster-Event (z. B. Vernissage); K2: unverändert „Galerieeröffnung“. */
  const heroOpeningWord = useMemo(() => {
    if (isOeffentlich && eroeffnungEvent) {
      const t = String(
        (eroeffnungEvent as { title?: string; name?: string }).title ||
          (eroeffnungEvent as { title?: string; name?: string }).name ||
          '',
      ).trim()
      if (t) return t
    }
    return 'Galerieeröffnung'
  }, [isOeffentlich, eroeffnungEvent])
  const openingHoursBlock = useMemo(() => formatGalleryOpeningHoursBlock(gallery), [gallery])

  const masterClickInfoTexts = useMemo(() => {
    const oh =
      'Der Block „Öffnungszeiten Galerie“ erscheint nur, wenn beim Event keine eigenen Zeiten eingetragen sind – dann kommen die Öffnungszeiten aus den Galerie-Stammdaten.'
    if (isOeffentlich) {
      return {
        hero:
          'Kopfzeile: Galerietitel, Veranstaltungsart (z. B. Vernissage) und Namen aus Muster-Stammdaten bzw. gewähltem Demo-Event – hier nicht frei editierbar.',
        invite: `Einladungsblock: fester Satz „Sie sind herzlich eingeladen“. Termin und Uhrzeit aus der Demo-Eventplanung (wie Event-Karte). Adresse und Ort aus Mustergalerie-Stammdaten. ${oh}`,
        qrFooter: `QR „Zur Galerie online“: Route ${frontQrPathExplain}, URL mit Server-Stand und Cache-Bust (beim Scannen aktuelle Demo-Version).`,
        image:
          'Bild: Standard ist ein neutrales Platzhalter-SVG (kein echtes K2-Foto in der Demo). Die große Fläche öffnet die Bildauswahl aus Datei.',
        intro:
          'Text neben dem Bild: bearbeitbar oder live mit Willkommen aus Galerie gestalten – große Fläche öffnet das Bearbeiten-Fenster.',
        backTitle: 'Rückseiten-Überschrift: fest aus der Stammdaten-Linie – in diesem Fenster nicht änderbar.',
        qrBack: `QR neben der Einladung: Route ${backQrPathExplain} – öffentlicher Demo-Eingang (ök2), mit Server-Stand und Cache-Bust.`,
        copyright: 'Copyright-Zeile: zentraler Produktstandard (kgm solution).',
        marketing: 'Die Absätze rechts bearbeitest du über die große Fläche („Rückseite Fließtext“).',
      }
    }
    if (isVk2) {
      return {
        hero:
          'Kopfzeile: Galerietitel, Veranstaltungsüberschrift und Namen aus VK2-Stammdaten und dem gewählten Vereins-Event – hier nicht frei editierbar.',
        invite: `Einladungsblock: fester Satz „Sie sind herzlich eingeladen“. Termin aus VK2-Eventplanung. Adresse und Ort aus Stammdaten dieses Kontexts. ${oh}`,
        qrFooter: `QR „Zur Galerie online“: Route ${frontQrPathExplain} – VK2-Galerie online, mit Server-Stand und Cache-Bust.`,
        image:
          'Bild: Standard ist ein neutrales Platzhalter-SVG (kein K2-Foto). Die große Fläche öffnet die Bildauswahl aus Datei.',
        intro:
          'Text Vorderseite: wie in VK2 „Galerie gestalten“ verbunden oder eigen – große Fläche = Bearbeiten.',
        backTitle: 'Rückseiten-Überschrift: fest aus den Stammdaten – hier nicht änderbar.',
        qrBack: `QR: Route ${backQrPathExplain} – Demo-Galerie (ök2) für Besucher ohne VK2-Zugang, mit aktuellem Stand.`,
        copyright: 'Copyright: Produktstandard (kgm solution).',
        marketing: 'Marketing-Text rechts über die große Fläche bearbeiten.',
      }
    }
    return {
      hero:
        'Kopfzeile: Galerietitel und Namen aus K2-Stammdaten; die Veranstaltungszeile aus dem Eröffnungs- bzw. Hauptevent der K2-Eventplanung.',
      invite: `Einladungsblock: fester Satz „Sie sind herzlich eingeladen“. Termin aus K2-Events. Adresse und Ort aus K2-Galerie-Stammdaten. ${oh}`,
      qrFooter: `QR „Zur Galerie online“: echte K2-Galerie, Route ${frontQrPathExplain}, mit Server-Stand und Cache-Bust.`,
      image:
        'Ohne eigenes Foto: Galerie-Karte oder Willkommensbild aus Galerie gestalten, sonst das feste K2-Standardbild. Große Fläche: eigenes Bild wählen.',
      intro: 'Intro: live aus Willkommen oder eigener Text – große Fläche öffnet Bearbeiten.',
      backTitle: 'Rückseiten-Überschrift: fest aus der K2-Stammdaten-Linie.',
      qrBack: `QR: Route ${backQrPathExplain} – Demo-Galerie ök2 für Interessent:innen, mit aktuellem Stand.`,
      copyright: 'Copyright: Produktstandard (kgm solution).',
      marketing: 'Fließtext rechts über die große Fläche bearbeiten.',
    }
  }, [isOeffentlich, isVk2, frontQrPathExplain, backQrPathExplain])

  const frontGalleryQr = useMemo(() => {
    const path = isOeffentlich
      ? PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
      : isVk2
        ? PROJECT_ROUTES.vk2.galerie
        : PROJECT_ROUTES['k2-galerie'].galerie
    return buildQrUrlWithBust(BASE_APP_URL + path, versionTimestamp)
  }, [isOeffentlich, isVk2, versionTimestamp])
  const oek2TorQr = useMemo(
    () => buildQrUrlWithBust(BASE_APP_URL + PROJECT_ROUTES['k2-galerie'].galerieOeffentlich, versionTimestamp),
    [versionTimestamp]
  )

  useEffect(() => {
    let active = true
    void QRCode.toDataURL(frontGalleryQr, { width: 400, margin: 1 })
      .then((url) => {
        if (active) setFrontQrDataUrl(url)
      })
      .catch(() => {})
    void QRCode.toDataURL(oek2TorQr, { width: 520, margin: 1 })
      .then((url) => {
        if (active) setBackQrDataUrl(url)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [frontGalleryQr, oek2TorQr])

  useEffect(() => {
    const evts = isOeffentlich
      ? getOeffentlichEventsWithMusterFallback()
      : loadEvents(isVk2 ? 'vk2' : 'k2')
    const list = Array.isArray(evts) ? evts : []
    let eroeffnung: EventTerminLike | null = null
    if (eventIdFromUrl) {
      const found = list.find((e: { id?: string }) => String(e?.id ?? '') === eventIdFromUrl)
      if (found) eroeffnung = found as EventTerminLike
    }
    if (!eroeffnung) {
      const picked = pickOpeningEventForWerbemittel(list)
      eroeffnung = picked ? (picked as EventTerminLike) : null
    }
    if (eroeffnung) {
      setEroeffnungEvent(eroeffnung)
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
  }, [flyerDataTick, isOeffentlich, isVk2, eventIdFromUrl])

  /** Nach „Paket übernehmen“ im ök2-Admin: Browser-Speicher des Flyer-Masters ist leer – offene Seite sofort auf Muster/Defaults. */
  useEffect(() => {
    if (!isOeffentlich || typeof window === 'undefined') return
    const onFlyerMasterReset = () => {
      const fb = flyerImageFallbackPath(true, isVk2)
      setFlyerDataTick((t) => t + 1)
      setLeftSrc(fb)
      const g = loadStammdaten('oeffentlich', 'gallery')
      const gi = getGalerieImages(g)
      setMiddleSrc(gi.welcomeImage || fb)
      setRightSrc(gi.virtualTourImage || gi.welcomeImage || fb)
      setLeftWerkLabel('Bild aus Datei')
      setIntroFollowsGallery(true)
      setMasterText(mergeMasterTextFromPersisted(null, true))
      setPage1Layout(layoutFromUrl)
    }
    window.addEventListener('k2-flyer-event-bogen-neu-reset', onFlyerMasterReset)
    return () => window.removeEventListener('k2-flyer-event-bogen-neu-reset', onFlyerMasterReset)
  }, [isOeffentlich, isVk2, layoutFromUrl])

  useEffect(() => {
    const bump = () => setFlyerDataTick((t) => t + 1)
    window.addEventListener('k2-events-updated', bump)
    const onTenantStam = (ev: Event) => {
      const ce = ev as CustomEvent<{ tenant?: string }>
      const t = ce.detail?.tenant
      if (isOeffentlich && t === 'oeffentlich') bump()
      if (!isOeffentlich && !isVk2 && t === 'k2') bump()
    }
    window.addEventListener('k2-tenant-stammdaten-updated', onTenantStam as EventListener)
    const onGalleryStam = (ev: Event) => {
      const ce = ev as CustomEvent<{ tenant?: string }>
      const t = ce.detail?.tenant
      if (isOeffentlich && t === 'oeffentlich') bump()
      if (!isOeffentlich && !isVk2 && t === 'k2') bump()
    }
    window.addEventListener('k2-gallery-stammdaten-updated', onGalleryStam as EventListener)
    const onVk2Stam = () => {
      if (isVk2) bump()
    }
    window.addEventListener('k2-vk2-stammdaten-updated', onVk2Stam)
    window.addEventListener('vk2-stammdaten-updated', onVk2Stam)
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return
      if (
        e.key === 'k2-design-settings' ||
        e.key === 'k2-oeffentlich-design-settings' ||
        e.key === 'k2-vk2-design-settings'
      ) {
        bump()
        return
      }
      if (isOeffentlich) {
        if (
          e.key === 'k2-oeffentlich-events' ||
          e.key.startsWith('k2-oeffentlich-stammdaten-')
        ) {
          bump()
        }
      } else if (isVk2) {
        if (e.key === 'k2-vk2-events' || e.key === 'k2-vk2-stammdaten') bump()
      } else if (
        e.key === 'k2-events' ||
        e.key === 'k2-stammdaten-galerie' ||
        e.key === 'k2-stammdaten-martina' ||
        e.key === 'k2-stammdaten-georg'
      ) {
        bump()
      }
    }
    window.addEventListener('storage', onStorage)
    const onDesignSaved = () => bump()
    window.addEventListener('k2-design-saved-publish', onDesignSaved)
    window.addEventListener('k2-page-content-updated', onDesignSaved)
    const onVis = () => {
      if (document.visibilityState === 'visible') bump()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('k2-events-updated', bump)
      window.removeEventListener('k2-tenant-stammdaten-updated', onTenantStam as EventListener)
      window.removeEventListener('k2-gallery-stammdaten-updated', onGalleryStam as EventListener)
      window.removeEventListener('k2-vk2-stammdaten-updated', onVk2Stam)
      window.removeEventListener('vk2-stammdaten-updated', onVk2Stam)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('k2-design-saved-publish', onDesignSaved)
      window.removeEventListener('k2-page-content-updated', onDesignSaved)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [isOeffentlich, isVk2])

  useEffect(() => {
    setShowDerivationFullscreen(false)
  }, [isA3Mode, isA6Mode, isCardMode])

  useEffect(() => {
    if (masterEditField === null) return
    setMasterLiveInfo(null)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMasterEditField(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [masterEditField])

  useEffect(() => {
    if (!masterLiveInfo) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMasterLiveInfo(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [masterLiveInfo])

  const onModalHeadPointerDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.master-edit-close')) return
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    setModalPos((pos) => {
      const ox = pos.x
      const oy = pos.y
      const onMove = (ev: MouseEvent) => {
        setModalPos({ x: ox + ev.clientX - startX, y: oy + ev.clientY - startY })
      }
      const onUp = () => {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
      return pos
    })
  }

  const handleFrontUpload = (slot: 'left' | 'middle' | 'right', file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const url = normalizeFileToUrl(file)
    if (slot === 'left') setLeftSrc(url)
    if (slot === 'middle') setMiddleSrc(url)
    if (slot === 'right') setRightSrc(url)
  }

  const handleLeftImageFile = (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return
    handleFrontUpload('left', file)
    setLeftWerkLabel(file.name || 'Bild aus Datei')
  }

  const frontCardStandard = (
    <div className={`card front front-variant-${frontVariant}`}>
      <div className="hero hero-standard-event">
        <p className="hero-brand-line">{base.brandLine}</p>
        <p className="hero-brand-sub">{base.brandSub}</p>
        <p className="hero-opening-word">{heroOpeningWord}</p>
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
            <p className="intro-text">{introForPreview}</p>
          </div>
        </div>
        <div className="front-bottom">
          <div className="front-bottom-left">
            {frontQrDataUrl ? (
              <img
                src={frontQrDataUrl}
                alt={flyerFrontQrAlt(isOeffentlich, isVk2)}
                className="qr"
              />
            ) : (
              <div className="qr-placeholder">QR</div>
            )}
            <div className="front-qr-text-block">
              <p className="qr-caption">Zur Galerie online</p>
              <p className="master-qr-hint">{qrCodeGalerieDruckHinweis}</p>
            </div>
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

  const renderFrontCardV2 = (interactive: boolean) => (
    <div className="card front front-layout-v2">
      <div className={`hero hero-v2 hero-v2-event${interactive ? ' master-hotspot-parent' : ''}`}>
        {interactive ? (
          <button
            type="button"
            className="master-info-hotspot"
            aria-label="Info Kopfzeile"
            onClick={(e) => {
              e.stopPropagation()
              setMasterLiveInfo(masterClickInfoTexts.hero)
            }}
          >
            i
          </button>
        ) : null}
        <p className="hero-v2-brand">{base.brandLine}</p>
        <p className="hero-v2-opening-word">{heroOpeningWord}</p>
        <p className="hero-v2-names">{base.brandSub}</p>
      </div>
      <div className="content content-v2">
        <div className="v2-main">
          <div className="v2-img-col">
            <div className={`img-box v2-single-img${interactive ? ' master-hotspot-parent' : ''}`}>
              {interactive ? (
                <>
                  <button
                    type="button"
                    className="master-hotspot"
                    aria-label={MASTER_EDIT_LABELS.image}
                    onClick={() => setMasterEditField('image')}
                  />
                  <button
                    type="button"
                    className="master-info-hotspot"
                    aria-label="Info Werkbild"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMasterLiveInfo(masterClickInfoTexts.image)
                    }}
                  >
                    i
                  </button>
                </>
              ) : null}
              <img src={leftSrc} alt="" />
            </div>
          </div>
          <div className="v2-text-col">
            <div className={interactive ? 'master-hotspot-parent v2-intro-wrap' : undefined}>
              {interactive ? (
                <>
                  <button
                    type="button"
                    className="master-hotspot"
                    aria-label={MASTER_EDIT_LABELS.intro}
                    onClick={() => setMasterEditField('intro')}
                  />
                  <button
                    type="button"
                    className="master-info-hotspot"
                    aria-label="Info Text Vorderseite"
                    onClick={(e) => {
                      e.stopPropagation()
                      setMasterLiveInfo(masterClickInfoTexts.intro)
                    }}
                  >
                    i
                  </button>
                </>
              ) : null}
              <p className="v2-intro">{introForPreview}</p>
            </div>
            <div
              className={`v2-invite-panel${interactive ? ' master-info-hotspot-parent' : ''}`}
              role="region"
              aria-label="Einladung"
            >
              {interactive ? (
                <button
                  type="button"
                  className="master-info-hotspot"
                  aria-label="Info Einladung und Termin"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMasterLiveInfo(masterClickInfoTexts.invite)
                  }}
                >
                  i
                </button>
              ) : null}
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
          <div className={`v2-footer-qr${interactive ? ' master-info-hotspot-parent' : ''}`}>
            {interactive ? (
              <button
                type="button"
                className="master-info-hotspot"
                aria-label="Info QR Vorderseite"
                onClick={(e) => {
                  e.stopPropagation()
                  setMasterLiveInfo(masterClickInfoTexts.qrFooter)
                }}
              >
                i
              </button>
            ) : null}
            {frontQrDataUrl ? <img src={frontQrDataUrl} alt="" className="qr" /> : <div className="qr-placeholder">QR</div>}
            <p className="qr-caption">Zur Galerie online</p>
            <p className="master-qr-hint master-qr-hint--v2">{qrCodeGalerieDruckHinweis}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const frontCard = page1Layout === 'variant2' ? renderFrontCardV2(false) : frontCardStandard

  const posterA3Card = (
    <div className={`a3-poster a3-layout-${page1Layout}`}>
      <div className="a3-hero">
        <p className="a3-brand">{base.brandLine}</p>
        <p className="a3-opening">{heroOpeningWord}</p>
        <p className="a3-names">{base.subtitle}</p>
      </div>
      <div className="a3-main">
        <div className="a3-image-wrap">
          <img src={leftSrc} alt="" className="a3-image" />
        </div>
        <div className="a3-right">
          <p className="a3-intro">{introForPreview}</p>
          <div className="a3-invite">
            <p className="a3-kicker">Sie sind herzlich eingeladen</p>
            <p className="a3-termin">{terminKomplettV2}</p>
            <p className="a3-address">{base.address} · {base.city}</p>
            {openingHoursBlock && !eventHasFlyerZeiten(eroeffnungEvent) ? (
              <div className="a3-hours">
                <p className="a3-hours-heading">Öffnungszeiten Galerie</p>
                <p className="a3-hours-body">{openingHoursBlock}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="a3-footer">
        <div className="a3-qr-wrap">
          {frontQrDataUrl ? (
            <img
              src={frontQrDataUrl}
              alt={flyerFrontQrAlt(isOeffentlich, isVk2)}
              className="a3-qr"
            />
          ) : (
            <div className="a3-qr-ph">QR</div>
          )}
          <p className="a3-qr-caption">Zur Galerie online</p>
        </div>
        <small>{PRODUCT_COPYRIGHT_BRAND_ONLY}</small>
      </div>
    </div>
  )

  const posterA6Card = (
    <div className="a6-poster" aria-label="A6 Werbekarte Galerie">
      <div className="a6-hero">
        <p className="a6-brand">{base.brandLine}</p>
        <p className="a6-opening">{heroOpeningWord}</p>
        <p className="a6-names">{base.subtitle}</p>
      </div>
      <div className="a6-image-wrap">
        <img src={leftSrc} alt="" className="a6-image" />
      </div>
      <div className="a6-right">
        <p className="a6-intro">{introForPreview}</p>
        <div className="a6-invite">
          <p className="a6-kicker">Sie sind herzlich eingeladen</p>
          <p className="a6-termin">{a6EventDateLine}</p>
          <p className="a6-address">{base.address} · {base.city}</p>
        </div>
      </div>
      <div className="a6-footer">
        {frontQrDataUrl ? (
          <img
            src={frontQrDataUrl}
            alt={flyerFrontQrAlt(isOeffentlich, isVk2)}
            className="a6-qr"
          />
        ) : (
          <div className="a6-qr-ph">QR</div>
        )}
        <div className="a6-footer-text">
          <p>Zur Galerie online</p>
          <small>{PRODUCT_COPYRIGHT_BRAND_ONLY}</small>
        </div>
      </div>
    </div>
  )

  const posterA6BackCard = () => (
    <div className="a6-back-from-flyer" aria-label="A6 Rückseite wie Flyer">
      <div className="a6-back-scale">{backCard}</div>
    </div>
  )

  const businessCardFront = (
    <div className="vc-front" aria-label="Visitenkarte Vorderseite">
      <div className="vc-hero">
        <p className="vc-brand">{base.brandLine}</p>
        <p className="vc-names">{base.subtitle}</p>
      </div>
      <div className="vc-image-wrap">
        <img src={leftSrc} alt="" className="vc-image" />
      </div>
      <p className="vc-intro">{introForPreview}</p>
      <div className="vc-footer">
        {frontQrDataUrl ? (
          <img
            src={frontQrDataUrl}
            alt={flyerFrontQrAlt(isOeffentlich, isVk2)}
            className="vc-qr"
          />
        ) : (
          <div className="vc-qr-ph">QR</div>
        )}
        <div className="vc-footer-text">
          <p>Zur Galerie online</p>
          <small>{base.address} · {base.city}</small>
        </div>
      </div>
    </div>
  )

  const businessCardBack = (
    <div className="vc-back" aria-label="Visitenkarte Rückseite">
      <div className="vc-back-hero">
        <h3>{base.backCardTitle}</h3>
        <p className="vc-back-slogan">{masterText.backSlogan}</p>
        <p className="vc-back-power">{masterText.backPower}</p>
      </div>
      <p className="vc-back-sub">{masterText.backSub}</p>
      <div className="vc-back-qr-wrap">
        {backQrDataUrl ? <img src={backQrDataUrl} alt="QR Eingangstor ök2" className="vc-back-qr" /> : <div className="vc-back-qr-ph">QR</div>}
        <p className="vc-back-invite">{masterText.backInvite}</p>
      </div>
      <div className="vc-back-copy">
        <small>{PRODUCT_COPYRIGHT_BRAND_ONLY}</small>
      </div>
    </div>
  )

  const renderBackCard = (interactive: boolean) => (
    <div className="card back back-page-2">
      <div className="back-left">
        <div className="back-hero">
          <div className={interactive ? 'master-hotspot-parent back-hero-title-wrap' : undefined}>
            {interactive ? (
              <button
                type="button"
                className="master-info-hotspot"
                aria-label="Info Rückseiten-Titel"
                onClick={(e) => {
                  e.stopPropagation()
                  setMasterLiveInfo(masterClickInfoTexts.backTitle)
                }}
              >
                i
              </button>
            ) : null}
            <h3>{base.backCardTitle}</h3>
          </div>
          <div className={interactive ? 'master-hotspot-parent back-hero-line' : undefined}>
            {interactive ? (
              <button
                type="button"
                className="master-hotspot"
                aria-label={MASTER_EDIT_LABELS.backSlogan}
                onClick={() => setMasterEditField('backSlogan')}
              />
            ) : null}
            <p className="back-hero-slogan">{masterText.backSlogan}</p>
          </div>
          <div className={interactive ? 'master-hotspot-parent back-hero-line' : undefined}>
            {interactive ? (
              <button
                type="button"
                className="master-hotspot"
                aria-label={MASTER_EDIT_LABELS.backPower}
                onClick={() => setMasterEditField('backPower')}
              />
            ) : null}
            <p className="back-hero-power">{masterText.backPower}</p>
          </div>
        </div>
        <div className={interactive ? 'master-hotspot-parent' : undefined}>
          {interactive ? (
            <button
              type="button"
              className="master-hotspot"
              aria-label={MASTER_EDIT_LABELS.backSub}
              onClick={() => setMasterEditField('backSub')}
            />
          ) : null}
          <p className="marketing-sub">{masterText.backSub}</p>
        </div>
        <div className="back-left-bottom">
          <div className={interactive ? 'master-hotspot-parent back-qr-img-wrap' : undefined}>
            {interactive ? (
              <button
                type="button"
                className="master-info-hotspot"
                aria-label="Info QR Rückseite"
                onClick={(e) => {
                  e.stopPropagation()
                  setMasterLiveInfo(masterClickInfoTexts.qrBack)
                }}
              >
                i
              </button>
            ) : null}
            {backQrDataUrl ? (
              <img src={backQrDataUrl} alt="QR Eingangstor ök2" className="qr" />
            ) : (
              <div className="qr-placeholder">QR</div>
            )}
          </div>
          <div className={interactive ? 'master-hotspot-parent back-invite-wrap' : undefined}>
            {interactive ? (
              <button
                type="button"
                className="master-hotspot"
                aria-label={MASTER_EDIT_LABELS.backInvite}
                onClick={() => setMasterEditField('backInvite')}
              />
            ) : null}
            <p className="back-qr-invite">{masterText.backInvite}</p>
          </div>
        </div>
        <div className={`back-copyright${interactive ? ' master-hotspot-parent' : ''}`}>
          {interactive ? (
            <button
              type="button"
              className="master-info-hotspot"
              aria-label="Info Copyright"
              onClick={(e) => {
                e.stopPropagation()
                setMasterLiveInfo(masterClickInfoTexts.copyright)
              }}
            >
              i
            </button>
          ) : null}
          <small>{PRODUCT_COPYRIGHT_BRAND_ONLY}</small>
        </div>
      </div>
      <div
        className={`back-right back-right-marketing${interactive ? ' master-hotspot-parent' : ''}`}
        role="region"
        aria-label="Was ist ök2 – Marketingtext"
      >
        {interactive ? (
          <>
            <button
              type="button"
              className="master-hotspot"
              aria-label={MASTER_EDIT_LABELS.marketing}
              onClick={() => setMasterEditField('marketing')}
            />
            <button
              type="button"
              className="master-info-hotspot"
              aria-label="Info Marketing-Text"
              onClick={(e) => {
                e.stopPropagation()
                setMasterLiveInfo(masterClickInfoTexts.marketing)
              }}
            >
              i
            </button>
          </>
        ) : null}
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

  const backCard = renderBackCard(false)

  return (
    <div
      className={`${ROOT}${isA3Mode ? ' a3-mode' : ''}${isA6Mode ? ' a6-mode' : ''}${isCardMode ? ' card-mode' : ''}${bwPrintPreview ? ' bw-print' : ''}`}
    >
      <style>{`
        .${ROOT}{
          padding:16px;
          background:#f6f4f0;
          color:#1c1a18;
          ${flyerTheme.inject}
          --flyer-page-h:297mm;
          --flyer-sheet-pad:3mm;
          --flyer-row-gap:0.8mm;
          --flyer-row-h:calc((var(--flyer-page-h) - (2 * var(--flyer-sheet-pad)) - (1 * var(--flyer-row-gap))) / 2);
          --back-qr-box:29mm;
        }
        .${ROOT} .toolbar{display:flex;gap:12px;align-items:center;margin-bottom:12px;flex-wrap:wrap}
        .${ROOT} .toolbar .toolbar-back-mok2{
          display:inline-flex;
          align-items:center;
          padding:0.35rem 0.7rem;
          border-radius:8px;
          background:#ebe8e2;
          color:#1c1a18;
          font-weight:600;
          text-decoration:none;
          border:1px solid #d4cfc4;
          font-size:0.95rem;
        }
        .${ROOT} .toolbar .toolbar-back-mok2:hover{
          background:#e0ddd6;
          border-color:#c9c2b6;
        }
        .${ROOT} .toolbar .link-back-to-master{
          color:#b54a1e;
          font-weight:800;
          text-decoration:none;
          padding:0.2rem 0.35rem;
          border-radius:6px;
          border:1px solid rgba(181,74,30,0.45);
          background:rgba(181,74,30,0.08);
        }
        .${ROOT} .toolbar .link-back-to-master:hover{
          background:rgba(181,74,30,0.16);
          border-color:rgba(181,74,30,0.65);
        }
        .${ROOT} .editor{display:grid;gap:8px;max-width:760px;margin-bottom:16px}
        .${ROOT} .master-workspace{
          display:block;
          max-width:min(1180px,100%);
          margin:0 auto 16px;
          padding:0 4px;
        }
        @media (max-width:1100px){
          .${ROOT} .master-preview-col{position:relative !important;top:0 !important}
          .${ROOT} .master-preview-inner{max-height:min(78vh,640px)}
        }
        .${ROOT} .master-editor-col.editor{max-width:none;margin-bottom:0}
        .${ROOT} .master-editor-col{
          background:linear-gradient(165deg,#fffefb 0%,#f3ebe7 52%,#fffef8 100%);
          border-radius:16px;
          padding:1rem 1.15rem 1.15rem;
          border:1px solid rgba(181,74,30,0.16);
          box-shadow:0 6px 22px var(--flyer-accent-a08);
        }
        .${ROOT} .master-kicker{
          display:inline-block;
          font-size:0.72rem;
          letter-spacing:0.06em;
          text-transform:uppercase;
          font-weight:750;
          color:var(--k2-green);
          background:var(--flyer-accent-a11);
          padding:0.28rem 0.6rem;
          border-radius:999px;
          margin-bottom:0.4rem;
        }
        .${ROOT} .master-editor-col .editor-sections{
          display:grid;
          gap:1rem;
          margin-top:0.5rem;
        }
        @media (min-width:700px){
          .${ROOT} .master-editor-col .editor-sections{grid-template-columns:1fr 1fr;align-items:start}
        }
        .${ROOT} .master-editor-col .editor-inner{display:grid;gap:0.75rem}
        .${ROOT} .master-field-label{
          font-size:0.8rem;
          letter-spacing:0.04em;
          text-transform:uppercase;
          color:#5c5650;
          font-weight:700;
        }
        .${ROOT} .master-preview-col{
          position:sticky;
          top:10px;
          align-self:start;
          background:linear-gradient(165deg,#e8f8f5 0%,#fdf6f0 42%,#ffffff 100%);
          border-radius:16px;
          padding:0.75rem 0.9rem 1rem;
          border:2px solid var(--flyer-accent-a22);
          box-shadow:0 10px 32px var(--flyer-accent-a11);
        }
        .${ROOT} .master-preview-header{
          display:flex;
          flex-wrap:wrap;
          align-items:center;
          justify-content:space-between;
          gap:0.5rem;
          margin-bottom:0.45rem;
          padding-bottom:0.4rem;
          border-bottom:1px dashed var(--flyer-accent-a22);
        }
        .${ROOT} .master-preview-title{
          margin:0;
          font-size:1.05rem;
          font-weight:800;
          color:var(--k2-green-deep);
        }
        .${ROOT} .master-focus-pill{
          margin:0;
          font-size:0.78rem;
          color:#4a4540;
          background:rgba(255,255,255,0.88);
          padding:0.3rem 0.6rem;
          border-radius:10px;
          border:1px solid rgba(181,74,30,0.14);
          max-width:min(100%,20rem);
          line-height:1.35;
        }
        .${ROOT} .master-preview-inner{
          position:relative;
          overflow:auto;
          max-height:calc(100vh - 200px);
          padding:0.2rem;
          display:flex;
          justify-content:center;
          align-items:flex-start;
        }
        .${ROOT} .master-preview-scale-wrap{
          width:210mm;
          height:297mm;
          margin:0 auto;
          transform:scale(0.78);
          transform-origin:top center;
          margin-bottom:calc(-1 * (297mm * 0.22));
        }
        .${ROOT} .master-hotspot-parent{position:relative}
        .${ROOT} .master-hotspot{
          position:absolute;
          inset:0;
          z-index:2;
          margin:0;
          padding:0;
          border:0;
          border-radius:6px;
          cursor:pointer;
          background:transparent;
        }
        .${ROOT} .master-hotspot:hover,
        .${ROOT} .master-hotspot:focus-visible{
          background:rgba(181,74,30,0.07);
          box-shadow:inset 0 0 0 2px rgba(181,74,30,0.35);
        }
        .${ROOT} .master-info-hotspot{
          position:absolute;
          top:4px;
          right:4px;
          z-index:4;
          width:22px;
          height:22px;
          margin:0;
          padding:0;
          border:1px solid rgba(15,100,115,0.42);
          border-radius:50%;
          cursor:help;
          background:rgba(230,252,255,0.94);
          color:#0a5f6e;
          font-size:11px;
          font-weight:800;
          line-height:1;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow:0 1px 3px rgba(0,0,0,0.07);
        }
        .${ROOT} .master-info-hotspot:hover,
        .${ROOT} .master-info-hotspot:focus-visible{
          background:rgba(95,251,241,0.32);
          outline:none;
          box-shadow:0 0 0 2px rgba(15,100,115,0.22);
        }
        .${ROOT} .back-hero-title-wrap h3{margin:0}
        .${ROOT} .back-qr-img-wrap{
          position:relative;
          display:inline-block;
          flex-shrink:0;
        }
        .${ROOT} .v2-invite-panel.master-info-hotspot-parent,
        .${ROOT} .v2-footer-qr.master-info-hotspot-parent{
          position:relative;
        }
        .${ROOT} .master-live-info-backdrop{
          position:absolute;
          inset:0;
          z-index:30;
          background:rgba(28,26,24,0.2);
          border-radius:12px;
          cursor:pointer;
        }
        .${ROOT} .master-live-info-popover{
          position:absolute;
          left:50%;
          top:50%;
          transform:translate(-50%,-50%);
          z-index:31;
          width:min(380px,calc(100% - 1.5rem));
          max-height:min(48vh,300px);
          overflow:auto;
          padding:0.85rem 1rem;
          background:#fffefb;
          border:1px solid rgba(181,74,30,0.22);
          border-radius:14px;
          box-shadow:0 12px 40px rgba(28,26,24,0.2);
        }
        .${ROOT} .master-live-info-popover-title{
          margin:0 0 0.45rem;
          font-size:0.82rem;
          font-weight:800;
          color:var(--k2-green-deep);
        }
        .${ROOT} .master-live-info-popover-body{
          margin:0 0 0.75rem;
          font-size:0.8rem;
          line-height:1.45;
          color:#1c1a18;
        }
        .${ROOT} .master-live-info-ok{
          padding:0.32rem 0.85rem;
          font-size:0.78rem;
          font-weight:700;
          border-radius:8px;
          border:1px solid #b54a1e;
          background:#b54a1e;
          color:#fff;
          cursor:pointer;
        }
        .${ROOT} .master-live-info-ok:hover{background:#d4622a;border-color:#d4622a}
        .${ROOT} .v2-intro-wrap{min-height:2.8em}
        .${ROOT} .back-hero-line{display:block;position:relative}
        .${ROOT} .back-invite-wrap{position:relative;flex:1;min-width:0}
        .${ROOT} .master-edit-backdrop{
          position:fixed;
          inset:0;
          z-index:2000;
          background:rgba(28,26,24,0.28);
        }
        .${ROOT} .master-edit-modal{
          position:fixed;
          z-index:2001;
          width:min(420px,calc(100vw - 28px));
          max-height:min(88vh,520px);
          display:flex;
          flex-direction:column;
          background:#fffefb;
          color:#1c1a18;
          border-radius:14px;
          border:1px solid rgba(181,74,30,0.22);
          box-shadow:0 10px 40px var(--flyer-accent-a18);
          overflow:hidden;
        }
        .${ROOT} .master-edit-head{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:0.5rem;
          padding:0.55rem 0.65rem;
          background:linear-gradient(165deg,#e8f8f5 0%,#fdf6f0 100%);
          border-bottom:1px solid var(--flyer-accent-a15);
          cursor:grab;
          font-size:0.88rem;
          font-weight:750;
          color:var(--k2-green-deep);
          user-select:none;
        }
        .${ROOT} .master-edit-head:active{cursor:grabbing}
        .${ROOT} .master-edit-close{
          background:#b54a1e;
          color:#fff;
          border:0;
          border-radius:8px;
          width:2rem;
          height:2rem;
          font-size:1.2rem;
          line-height:1;
          cursor:pointer;
          flex-shrink:0;
        }
        .${ROOT} .master-edit-close:hover{background:#d4622a}
        .${ROOT} .master-edit-body{
          padding:0.75rem 0.85rem 1rem;
          overflow:auto;
          display:grid;
          gap:0.65rem;
        }
        .${ROOT} .master-edit-body label{
          font-size:0.82rem;
          font-weight:650;
          color:#5c5650;
          display:grid;
          gap:0.35rem;
        }
        .${ROOT} .master-edit-body textarea,
        .${ROOT} .master-edit-body input[type="text"]{
          width:100%;
          font-size:0.95rem;
          line-height:1.45;
          padding:0.55rem 0.6rem;
          border-radius:8px;
          border:1px solid #c8c0b5;
          box-sizing:border-box;
          color:#1c1a18;
          background:#fff;
        }
        .${ROOT} .master-edit-body textarea{resize:vertical;min-height:4rem}
        .${ROOT} .master-edit-drop{
          border:1px dashed #bda998;
          border-radius:10px;
          padding:0.75rem;
          font-size:0.86rem;
          color:#5c5650;
          background:rgba(255,255,255,0.85);
        }
        .${ROOT} .master-edit-drop.master-edit-drop-active{
          border-color:var(--k2-green);
          background:var(--flyer-accent-a08);
        }
        .${ROOT} .master-edit-linkbtn{
          font-size:0.82rem;
          font-weight:600;
          padding:0.35rem 0.65rem;
          border-radius:8px;
          border:1px solid #b54a1e;
          background:#fff;
          color:#b54a1e;
          cursor:pointer;
        }
        .${ROOT} .master-edit-linkbtn:hover{background:#fff5f0}
        .${ROOT} .master-preview-scale-wrap .sheet{
          margin:0;
        }
        .${ROOT} .derivation-shell{
          max-width:1820px;
          margin:0 auto 16px;
          border-radius:16px;
          border:2px solid var(--flyer-accent-a20);
          background:linear-gradient(165deg,#eef7f6 0%,#fff9f3 44%,#fff 100%);
          box-shadow:0 10px 32px var(--flyer-accent-a10);
          padding:.8rem .95rem 1rem;
        }
        .${ROOT} .derivation-head{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:.7rem;
          flex-wrap:wrap;
          border-bottom:1px dashed var(--flyer-accent-a22);
          padding-bottom:.45rem;
          margin-bottom:.55rem;
        }
        .${ROOT} .derivation-title{
          margin:0;
          font-size:1.02rem;
          color:var(--k2-green-deep);
          font-weight:800;
        }
        .${ROOT} .derivation-sub{
          margin:.12rem 0 0;
          font-size:.82rem;
          color:#5c5650;
        }
        .${ROOT} .derivation-toggle{
          border:1px solid var(--flyer-accent-a30);
          background:#fff;
          color:var(--k2-green-deep);
          border-radius:10px;
          font-size:.86rem;
          padding:.42rem .7rem;
          cursor:pointer;
          font-weight:700;
        }
        .${ROOT} .derivation-preview-stage{
          max-height:calc(100vh - 210px);
          overflow:auto;
          display:flex;
          justify-content:center;
          align-items:flex-start;
          padding:.1rem;
        }
        .${ROOT} .derivation-preview-scale{
          transform-origin:top center;
        }
        .${ROOT} .derivation-shell.mode-a3 .derivation-preview-scale{
          transform:scale(.34);
          width:297mm;
          margin-bottom:calc(-1 * (420mm * .66));
        }
        .${ROOT} .derivation-shell.mode-a6 .derivation-preview-scale{
          transform:scale(.95);
          width:148mm;
          margin-bottom:calc(-1 * (105mm * .05));
        }
        .${ROOT} .derivation-shell.mode-card .derivation-preview-scale{
          transform:scale(1);
          width:112mm;
        }
        .${ROOT} .derivation-fullscreen-stage{
          overflow:auto;
          max-height:none;
          display:flex;
          justify-content:center;
          align-items:flex-start;
          padding:.1rem;
        }
        .${ROOT} .derivation-fullscreen-stage .derivation-preview-scale{
          transform:none !important;
          width:auto !important;
          margin:0 !important;
        }
        @media (max-width:1100px){
          .${ROOT} .derivation-preview-stage{max-height:min(70vh,520px)}
          .${ROOT} .derivation-shell.mode-a3 .derivation-preview-scale{
            transform:scale(.24);
            margin-bottom:calc(-1 * (420mm * .76));
          }
        }
        .${ROOT} .sheet{
          width:210mm;
          height:var(--flyer-page-h);
          background:#fff;
          box-shadow:0 4px 18px rgba(0,0,0,.12);
          margin:0 auto 16px;
          padding:var(--flyer-sheet-pad);
          display:grid;
          grid-template-rows:repeat(2,var(--flyer-row-h));
          gap:var(--flyer-row-gap);
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
        .${ROOT} .front .hero{background:var(--k2-green);color:var(--k2-green-text);padding:2mm 2.2mm 1.8mm}
        .${ROOT} .front .hero.hero-standard-event{text-align:center}
        .${ROOT} .front .hero.hero-standard-event .hero-brand-line{
          margin:0 auto;
          max-width:22ch;
          font-size:19px;
          font-weight:900;
          letter-spacing:.015em;
          line-height:1.02;
          text-shadow:0 2px 8px rgba(0,0,0,.22);
        }
        .${ROOT} .front .hero.hero-standard-event .hero-brand-sub{
          margin:.35mm auto 0;max-width:28ch;font-size:6.2px;font-weight:620;line-height:1.22;opacity:.92
        }
        .${ROOT} .front .hero.hero-standard-event .hero-opening-word{
          margin:.35mm auto 0;
          max-width:18ch;
          font-size:19px;
          font-weight:900;
          letter-spacing:.015em;
          line-height:1.02;
          text-shadow:0 2px 8px rgba(0,0,0,.22);
        }
        .${ROOT} .front .content{padding:2mm 2.2mm 1.8mm;display:grid;gap:1.5mm}
        .${ROOT} .front .front-main{display:grid;grid-template-columns:62% 38%;gap:2.4mm;align-items:start}
        .${ROOT} .front .front-3img{
          display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;
          background:transparent;border-radius:1.2mm;padding:0;overflow:hidden;height:24mm
        }
        .${ROOT} .front .front-3img .img-box{
          position:relative;background:transparent;border-radius:0;overflow:hidden;height:24mm
        }
        .${ROOT} .front .front-3img .img-box img{
          width:100%;height:100%;object-fit:cover;object-position:center;background:transparent;transform:none
        }
        .${ROOT} .front .front-text-right{
          background:transparent;border-radius:0;padding:.35mm 0 0;color:#dfe7f4;
          display:grid;gap:.8mm;min-height:24mm;align-content:start
        }
        .${ROOT} .front .front-text-right .intro-text{
          margin:0;
          font-size:8.2px;
          line-height:1.32;
          color:#ffffff;
          font-weight:780;
        }
        .${ROOT} .front .front-bottom{display:grid;grid-template-columns:30mm 1fr;gap:1.8mm;align-items:end}
        .${ROOT} .front .front-bottom-left{display:grid;grid-template-columns:12mm 1fr;gap:.9mm;align-items:start}
        .${ROOT} .front .front-bottom-left .qr{width:12mm;height:12mm;object-fit:contain}
        .${ROOT} .front .front-bottom-left .qr-placeholder{width:12mm;height:12mm}
        .${ROOT} .front .front-bottom-left .front-qr-text-block{
          display:flex;
          flex-direction:column;
          gap:.35mm;
          min-width:0;
          align-self:start;
        }
        .${ROOT} .front .front-bottom-left .qr-caption{
          margin:0;font-size:5.8px;line-height:1.13;font-weight:620;color:#eaf1ff
        }
        .${ROOT} .front .front-bottom-left .master-qr-hint{
          margin:0;
          font-size:4.5px;
          line-height:1.22;
          font-weight:600;
          color:rgba(234,241,255,.88);
          max-width:42mm;
        }
        .${ROOT} .front .front-bottom-right{
          display:grid;gap:.55mm;justify-content:flex-start;align-content:end;min-height:12mm
        }
        .${ROOT} .front .front-bottom-right .invite{
          margin:0;
          padding:.55mm 1.4mm;
          font-size:7.6px;
          font-weight:900;
          color:var(--k2-green-text);
          background:var(--k2-green);
          border-radius:1mm;
          box-shadow:0 1px 3px rgba(0,0,0,.22);
          letter-spacing:.01em;
        }
        .${ROOT} .front .front-bottom-right .invite-meta{
          margin:0;
          font-size:6.1px;
          line-height:1.18;
          color:#f3f7ff;
          font-weight:700;
        }
        .${ROOT} .front .front-bottom-right .invite-meta.invite-address{
          font-size:12.2px;
          line-height:1.2;
          font-weight:750;
        }
        .${ROOT} .front.front-variant-A .front-main{grid-template-columns:62% 38%}
        .${ROOT} .front.front-variant-A .front-3img{height:24mm}
        .${ROOT} .front.front-variant-A .front-3img .img-box{height:24mm}
        .${ROOT} .front.front-variant-A .front-text-right .intro-text{font-size:8.2px;line-height:1.32}

        .${ROOT} .front.front-variant-B .front-main{grid-template-columns:60% 40%}
        .${ROOT} .front.front-variant-B .front-3img{height:24mm}
        .${ROOT} .front.front-variant-B .front-3img .img-box{height:24mm}
        .${ROOT} .front.front-variant-B .front-text-right .intro-text{font-size:8.2px;line-height:1.32}
        .${ROOT} .front.front-variant-B .front-bottom-right .invite{
          padding:.55mm 1.4mm;
          font-size:7.6px;
          box-shadow:0 1px 3px rgba(0,0,0,.22);
        }

        .${ROOT} .front.front-layout-v2{
          display:grid;
          grid-template-rows:auto 1fr;
          min-height:0;
        }
        .${ROOT} .front.front-layout-v2 .hero-v2.hero-v2-event{
          padding:1.5mm 2mm 1.3mm;
          text-align:center;
          display:grid;
          gap:.45mm;
        }
        .${ROOT} .front.front-layout-v2 .hero-v2 .hero-v2-brand{
          margin:0;
          font-size:26px;
          font-weight:900;
          letter-spacing:.02em;
          line-height:1.04;
          text-shadow:0 2px 12px rgba(0,0,0,.28);
          color:var(--flyer-text-on-dark);
        }
        .${ROOT} .front.front-layout-v2 .hero-v2 .hero-v2-names{
          margin:0;
          font-size:10.2px;
          font-weight:680;
          line-height:1.22;
          opacity:.9;
          color:var(--flyer-hero-names);
        }
        .${ROOT} .front.front-layout-v2 .hero-v2 .hero-v2-opening-word{
          margin:0;
          font-size:20px;
          font-weight:800;
          letter-spacing:.012em;
          line-height:1.1;
          text-shadow:0 2px 12px rgba(0,0,0,.28);
          color:var(--flyer-hero-opening);
        }
        .${ROOT} .front.front-layout-v2 .content-v2{
          padding:1.6mm 2mm 1.4mm;
          display:flex;
          flex-direction:column;
          gap:1.2mm;
          min-height:0;
          flex:1;
          background:var(--flyer-content-v2-bg);
        }
        .${ROOT} .front.front-layout-v2 .v2-main{
          display:grid;
          grid-template-columns:34% 1fr;
          gap:1.8mm;
          align-items:stretch;
          min-height:0;
          flex:1;
        }
        .${ROOT} .front.front-layout-v2 .v2-img-col{
          min-height:0;
          display:flex;
          align-self:stretch;
          height:100%;
        }
        .${ROOT} .front.front-layout-v2 .v2-single-img{
          position:relative;
          width:100%;
          flex:1;
          min-height:38mm;
          border-radius:1.2mm;
          overflow:hidden;
          background:var(--flyer-img-hole);
          border:1px solid rgba(255,255,255,.08);
        }
        .${ROOT} .front.front-layout-v2 .v2-single-img img{width:100%;height:100%;object-fit:cover;display:block}
        .${ROOT} .front.front-layout-v2 .v2-text-col{
          display:grid;
          grid-template-rows:1fr auto;
          gap:1.2mm;
          min-height:0;
          height:100%;
          overflow:hidden;
        }
        .${ROOT} .front.front-layout-v2 .v2-intro{
          margin:0;
          padding:0.5mm 0 1.4mm;
          border-bottom:1px solid rgba(255,255,255,.14);
          font-size:17px;
          line-height:1.42;
          color:var(--flyer-text-on-dark);
          font-weight:780;
          display:flex;
          align-items:center;
          justify-content:center;
          text-align:center;
        }
        .${ROOT} .front.front-layout-v2 .v2-invite-panel{
          background:var(--flyer-invite-bg);
          color:var(--k2-green-text);
          border-radius:1.4mm;
          padding:1.7mm 2mm 1.8mm;
          box-shadow:0 2px 10px rgba(0,0,0,.35);
          display:grid;
          gap:0.95mm;
          border:1px solid rgba(255,255,255,.22);
          flex-shrink:0;
        }
        .${ROOT} .front.front-layout-v2 .v2-invite-kicker{
          margin:0;
          font-size:10.5px;
          font-weight:800;
          letter-spacing:.045em;
          text-transform:uppercase;
          opacity:.96;
        }
        .${ROOT} .front.front-layout-v2 .v2-termin{
          margin:0;
          font-size:13px;
          line-height:1.38;
          font-weight:760;
          white-space:pre-line;
        }
        .${ROOT} .front.front-layout-v2 .v2-address{
          margin:0;
          font-size:20px;
          font-weight:760;
          line-height:1.26;
          opacity:.98;
        }
        .${ROOT} .front.front-layout-v2 .v2-hours-wrap{
          margin-top:0.7mm;
          padding-top:1.1mm;
          border-top:1px solid rgba(255,255,255,.28);
        }
        .${ROOT} .front.front-layout-v2 .v2-hours-heading{
          margin:0 0 0.45mm;
          font-size:11.5px;
          font-weight:900;
          letter-spacing:.02em;
        }
        .${ROOT} .front.front-layout-v2 .v2-hours-body{
          margin:0;
          font-size:10.5px;
          line-height:1.36;
          font-weight:700;
          white-space:pre-line;
        }
        .${ROOT} .front.front-layout-v2 .v2-footer{
          display:flex;
          align-items:center;
          justify-content:center;
          flex-shrink:0;
          padding:1.6mm 2mm 0.6mm;
          margin-top:0.4mm;
          border-top:1px solid rgba(255,255,255,.14);
          width:100%;
          box-sizing:border-box;
        }
        .${ROOT} .front.front-layout-v2 .v2-footer-qr{
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:0.5mm;
          text-align:center;
        }
        .${ROOT} .front.front-layout-v2 .v2-footer-qr .qr{width:19mm;height:19mm}
        .${ROOT} .front.front-layout-v2 .v2-footer-qr .qr-placeholder{width:19mm;height:19mm}
        .${ROOT} .front.front-layout-v2 .v2-footer-qr .qr-caption{
          margin:0;
          font-size:10px;
          line-height:1.2;
          font-weight:700;
          color:var(--flyer-muted-caption);
          max-width:42ch;
        }
        .${ROOT} .front.front-layout-v2 .v2-footer-qr .master-qr-hint--v2{
          margin:0;
          font-size:7.5px;
          line-height:1.28;
          font-weight:650;
          color:var(--flyer-muted-caption);
          max-width:38ch;
          opacity:.95;
        }

        .${ROOT} .row{display:grid;grid-template-columns:20mm 1fr;gap:2mm;align-items:center}
        .${ROOT} .qr{width:20mm;height:20mm;object-fit:contain}
        .${ROOT} .qr-placeholder{width:20mm;height:20mm;border:1px dashed #b8b2aa;display:flex;align-items:center;justify-content:center;font-size:7px;color:#6b665f}
        .${ROOT} .row p{margin:0;font-size:7px;line-height:1.3}
        .${ROOT} .back{grid-template-columns:1fr 1fr}
        .${ROOT} .back.back-page-2{grid-template-columns:minmax(0,0.48fr) minmax(0,0.52fr)}
        .${ROOT} .back.back-page-2 .back-left{
          padding:2mm;
          gap:1.2mm;
          grid-template-rows:auto auto minmax(0,1fr) auto;
          align-items:stretch;
        }
        .${ROOT} .back.back-page-2 .back-left .back-hero{
          gap:.65mm;
          padding-left:1.5mm;
          border-left-width:1.1mm;
        }
        .${ROOT} .back.back-page-2 .back-left h3{font-size:21.4px;line-height:1.05;letter-spacing:.011em}
        .${ROOT} .back.back-page-2 .back-left .back-hero-slogan{font-size:13.8px;line-height:1.22;font-weight:700}
        .${ROOT} .back.back-page-2 .back-left .back-hero-power{font-size:14.8px;line-height:1.22;font-weight:810}
        .${ROOT} .back.back-page-2 .back-left .marketing-sub{
          font-size:12.6px;
          line-height:1.34;
          max-width:34ch;
          font-weight:560;
        }
        .${ROOT} .back.back-page-2 .back-left .back-left-bottom{
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          min-height:0;
          gap:1.5mm;
          padding:1.6mm 1.6mm;
          height:100%;
          background:#f1ece6;
          border:1px solid #dfd8cf;
          border-radius:1.6mm;
        }
        .${ROOT} .back.back-page-2 .back-left .back-left-bottom .qr,
        .${ROOT} .back.back-page-2 .back-left .back-left-bottom .qr-placeholder{
          width:var(--back-qr-box);
          height:var(--back-qr-box);
          flex-shrink:0;
          object-fit:contain;
        }
        .${ROOT} .back.back-page-2 .back-left .back-left-bottom .back-qr-invite{
          font-size:11.2px;
          line-height:1.36;
          max-width:25ch;
          font-weight:680;
        }
        .${ROOT} .back.back-page-2 .back-left .back-copyright small{font-size:9.5px}
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
          gap:1.05mm;
          padding:1.9mm 2.1mm 2.1mm 2.2mm;
          justify-content:space-between;
        }
        .${ROOT} .back-mkt-heading{
          margin:0;
          font-size:10.5px;
          line-height:1.12;
          font-weight:850;
          color:var(--k2-green);
          letter-spacing:.015em;
        }
        .${ROOT} .back.back-page-2 .back-mkt-heading{font-size:18.8px;line-height:1.16;margin-bottom:.08em}
        .${ROOT} .back-mkt-body{
          margin:0;
          font-size:7.05px;
          line-height:1.38;
          color:#2d2a27;
          white-space:pre-line;
        }
        .${ROOT} .back.back-page-2 .back-mkt-body{font-size:13.4px;line-height:1.44;color:#2a2622}
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
          border-left:1.1mm solid var(--k2-green);
          padding-left:1.6mm;
        }
        .${ROOT} .back-left h3{font-size:12.8px;line-height:1.08;color:#1c1a18;letter-spacing:.01em}
        .${ROOT} .back-left .back-hero-slogan{margin:0;font-size:7.8px;line-height:1.24;font-weight:650;color:#2d2a27}
        .${ROOT} .back-left .back-hero-power{margin:0;font-size:8.2px;line-height:1.28;font-weight:800;color:var(--k2-green)}
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
        /* Schwarzweiß-Druckcheck: Bildschirm + Druck (nicht nur @media print – sonst wirkt der Toggle „leer“) */
        .${ROOT}.bw-print .card,
        .${ROOT}.bw-print .front,
        .${ROOT}.bw-print .back{
          background:#fff !important;
          color:#111 !important;
        }
        .${ROOT}.bw-print .front .hero,
        .${ROOT}.bw-print .a3-hero{
          background:#efefef !important;
          color:#111 !important;
          text-shadow:none !important;
        }
        .${ROOT}.bw-print .front .hero p,
        .${ROOT}.bw-print .a3-hero p{
          color:#111 !important;
          text-shadow:none !important;
        }
        .${ROOT}.bw-print .v2-invite-panel,
        .${ROOT}.bw-print .a3-invite{
          background:#f4f4f4 !important;
          color:#111 !important;
          border:0.35mm solid #8e8e8e !important;
          box-shadow:none !important;
        }
        .${ROOT}.bw-print .v2-invite-panel p,
        .${ROOT}.bw-print .v2-invite-panel div,
        .${ROOT}.bw-print .a3-invite p,
        .${ROOT}.bw-print .a3-invite div{
          color:#111 !important;
        }
        .${ROOT}.bw-print .back-right-marketing,
        .${ROOT}.bw-print .back-left,
        .${ROOT}.bw-print .back-left-bottom{
          background:#fff !important;
          border-color:#a9a9a9 !important;
        }
        .${ROOT}.bw-print .back-mkt-heading,
        .${ROOT}.bw-print .back-mkt-body,
        .${ROOT}.bw-print .marketing-sub,
        .${ROOT}.bw-print .back-hero-slogan,
        .${ROOT}.bw-print .back-hero-power{
          color:#111 !important;
        }
        .${ROOT}.bw-print .qr,
        .${ROOT}.bw-print .a3-qr{
          filter:grayscale(1) contrast(1.35);
          background:#fff !important;
          border:0.25mm solid #b5b5b5;
        }
        .${ROOT}.bw-print .qr-caption,
        .${ROOT}.bw-print .a3-qr-caption,
        .${ROOT}.bw-print .master-qr-hint,
        .${ROOT}.bw-print .master-qr-hint--v2,
        .${ROOT}.bw-print small{
          color:#222 !important;
        }
        @media print{
          ${isCardMode ? '@page{size:55mm 85mm;margin:0}' : isA6Mode ? '@page{size:A6 landscape;margin:0}' : isA3Mode ? '@page{size:A3 portrait;margin:0}' : '@page{size:A4;margin:0}'}
          html, body{
            margin:0 !important;
            padding:0 !important;
            ${
              isCardMode
                ? 'width:55mm;min-height:0;height:auto;'
                : isA6Mode
                  ? 'width:148mm;min-height:0;height:auto;'
                  : isA3Mode
                    ? 'width:297mm;height:420mm;overflow:hidden;'
                    : 'width:210mm;height:297mm;overflow:hidden;'
            }
          }
          .${ROOT}, .${ROOT} *{
            -webkit-print-color-adjust:exact !important;
            print-color-adjust:exact !important;
          }
          .${ROOT}{padding:0;background:#fff}
          .${ROOT} .master-hotspot,
          .${ROOT} .master-info-hotspot,
          .${ROOT} .master-live-info-backdrop,
          .${ROOT} .master-live-info-popover{display:none !important}
          .${ROOT} .master-edit-backdrop,.${ROOT} .master-edit-modal{display:none !important}
          .${ROOT} .toolbar,.${ROOT} .editor,.${ROOT} .master-editor-col,.${ROOT} .master-preview-header{display:none}
          .${ROOT} .master-workspace{display:block !important;max-width:none;margin:0;padding:0}
          .${ROOT} .master-preview-col{
            position:static !important;
            background:transparent !important;
            border:none !important;
            box-shadow:none !important;
            padding:0 !important;
            margin:0 !important;
          }
          .${ROOT} .master-preview-inner{
            max-height:none !important;
            overflow:visible !important;
            padding:0 !important;
          }
          .${ROOT} .master-preview-scale-wrap{
            transform:none !important;
            margin:0 !important;
            width:auto !important;
            height:auto !important;
          }
          .${ROOT} .sheet{
            box-shadow:none;
            margin:0;
            width:210mm;
            height:var(--flyer-page-h);
            padding:var(--flyer-sheet-pad);
            display:grid;
            grid-template-rows:repeat(2,var(--flyer-row-h));
            gap:var(--flyer-row-gap);
            box-sizing:border-box;
            overflow:hidden;
            page-break-inside:avoid;
            break-inside:avoid;
            page-break-after:auto;
            break-after:auto;
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
          .${ROOT}.a3-mode .derivation-head,
          .${ROOT}.a6-mode .derivation-head,
          .${ROOT}.card-mode .derivation-head{display:none !important}
          .${ROOT}.a3-mode .derivation-shell,
          .${ROOT}.a6-mode .derivation-shell,
          .${ROOT}.card-mode .derivation-shell{
            border:none !important;
            box-shadow:none !important;
            background:#fff !important;
            padding:0 !important;
            margin:0 !important;
            max-width:none !important;
          }
          .${ROOT}.a3-mode .derivation-preview-stage,
          .${ROOT}.a3-mode .derivation-fullscreen-stage,
          .${ROOT}.a6-mode .derivation-preview-stage,
          .${ROOT}.a6-mode .derivation-fullscreen-stage,
          .${ROOT}.card-mode .derivation-preview-stage,
          .${ROOT}.card-mode .derivation-fullscreen-stage{
            max-height:none !important;
            overflow:visible !important;
            padding:0 !important;
          }
          .${ROOT}.a3-mode .derivation-preview-scale{
            transform:none !important;
            width:297mm !important;
            margin:0 !important;
            margin-bottom:0 !important;
          }
          .${ROOT}.a6-mode .derivation-preview-scale{
            transform:none !important;
            width:148mm !important;
            margin:0 !important;
            margin-bottom:0 !important;
          }
          .${ROOT}.card-mode .derivation-preview-scale{
            transform:none !important;
            width:auto !important;
            margin:0 !important;
          }
          .${ROOT}.a3-mode .a3-sheet{
            margin:0 auto;
            width:297mm;
            height:420mm;
            box-shadow:none;
            padding:10mm;
            box-sizing:border-box;
            page-break-after:always;
            break-after:page;
            page-break-inside:avoid;
            break-inside:avoid;
          }
          .${ROOT}.a3-mode .a3-sheet:last-of-type{
            page-break-after:auto;
            break-after:auto;
          }
          .${ROOT}.a6-mode .a6-sheet{
            margin:0 auto;
            width:148mm;
            height:105mm;
            box-shadow:none;
            padding:4mm;
            box-sizing:border-box;
            page-break-after:always;
            break-after:page;
            page-break-inside:avoid;
            break-inside:avoid;
          }
          .${ROOT}.a6-mode .a6-sheet:last-of-type{
            page-break-after:auto;
            break-after:auto;
          }
          .${ROOT}.card-mode .vc-sheet{
            margin:0 auto;
            width:55mm;
            height:85mm;
            box-shadow:none;
            padding:2.2mm;
            box-sizing:border-box;
            page-break-after:always;
            break-after:page;
            page-break-inside:avoid;
            break-inside:avoid;
          }
          .${ROOT}.card-mode .vc-sheet:last-of-type{
            page-break-after:auto;
            break-after:auto;
          }
          .${ROOT} .back.back-page-2 .back-right-marketing{
            overflow:hidden;
            gap:1.1mm;
            justify-content:space-between;
          }
          .${ROOT} .back.back-page-2 .back-mkt-heading{
            font-size:18.4px;
            line-height:1.13;
          }
          .${ROOT} .back.back-page-2 .back-mkt-body{
            font-size:13.4px;
            line-height:1.4;
          }
        }

        .${ROOT}.a3-mode{
          padding:10px;
          background:#f6f4f0;
        }
        .${ROOT} .a3-sheet{
          width:297mm;
          height:420mm;
          margin:0 auto 10px;
          background:#fff;
          box-shadow:0 8px 24px rgba(0,0,0,.14);
          padding:10mm;
          box-sizing:border-box;
        }
        .${ROOT} .a3-poster{
          width:100%;
          height:100%;
          border:1px solid #d8d2c9;
          border-radius:2.2mm;
          overflow:hidden;
          display:grid;
          grid-template-rows:auto 1fr auto;
          background:var(--flyer-poster-surface);
          color:var(--flyer-poster-text);
        }
        .${ROOT} .a3-hero{
          background:var(--k2-green);
          color:var(--k2-green-text);
          text-align:center;
          padding:8mm 10mm 7mm;
          display:grid;
          gap:2mm;
        }
        .${ROOT} .a3-brand{margin:0;font-size:19.2mm;line-height:1.03;font-weight:900;letter-spacing:.009em}
        .${ROOT} .a3-opening{margin:0;font-size:15.4mm;line-height:1.05;font-weight:820}
        .${ROOT} .a3-names{margin:0;font-size:6.2mm;line-height:1.2;font-weight:650;opacity:.94}
        .${ROOT} .a3-main{
          display:grid;
          grid-template-columns:43% 1fr;
          gap:7mm;
          padding:8mm 10mm 7mm;
          min-height:0;
        }
        .${ROOT} .a3-image-wrap{border-radius:2mm;overflow:hidden;background:var(--flyer-img-hole)}
        .${ROOT} .a3-image{width:100%;height:100%;object-fit:cover;display:block}
        .${ROOT} .a3-right{
          display:grid;
          grid-template-rows:1fr auto;
          gap:6mm;
          min-height:0;
        }
        .${ROOT} .a3-intro{
          margin:0;
          font-size:8.9mm;
          line-height:1.36;
          font-weight:780;
          display:flex;
          align-items:center;
          text-align:center;
          justify-content:center;
          border-bottom:0.35mm solid rgba(255,255,255,.2);
          padding-bottom:4mm;
        }
        .${ROOT} .a3-invite{
          background:var(--flyer-invite-bg);
          border:0.35mm solid rgba(255,255,255,.26);
          border-radius:2mm;
          padding:6mm;
          display:grid;
          gap:3mm;
        }
        .${ROOT} .a3-kicker{margin:0;font-size:5.3mm;font-weight:850;text-transform:uppercase;letter-spacing:.055em}
        .${ROOT} .a3-termin{margin:0;font-size:6.8mm;line-height:1.36;font-weight:760;white-space:pre-line}
        .${ROOT} .a3-address{margin:0;font-size:8mm;line-height:1.22;font-weight:780}
        .${ROOT} .a3-hours{margin-top:1.4mm;padding-top:2.2mm;border-top:0.3mm solid rgba(255,255,255,.3)}
        .${ROOT} .a3-hours-heading{margin:0 0 1.2mm;font-size:5.6mm;font-weight:860}
        .${ROOT} .a3-hours-body{margin:0;font-size:5.1mm;line-height:1.34;white-space:pre-line}
        .${ROOT} .a3-footer{
          border-top:0.35mm solid rgba(255,255,255,.14);
          padding:6mm 10mm;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:6mm;
        }
        .${ROOT} .a3-qr-wrap{display:flex;align-items:center;gap:4mm}
        .${ROOT} .a3-qr,.${ROOT} .a3-qr-ph{width:23mm;height:23mm;border-radius:1.2mm;background:#fff}
        .${ROOT} .a3-qr-ph{display:flex;align-items:center;justify-content:center;color:#5c5650}
        .${ROOT} .a3-qr-caption{margin:0;font-size:4.5mm;line-height:1.2;font-weight:700;color:var(--flyer-muted-caption)}
        .${ROOT} .a3-footer small{font-size:3.6mm;color:var(--flyer-muted-caption)}
        .${ROOT}.a6-mode{
          padding:10px;
          background:#f6f4f0;
        }
        .${ROOT} .a6-sheet{
          width:148mm;
          height:105mm;
          margin:0 auto 10px;
          background:#fff;
          box-shadow:0 6px 18px rgba(0,0,0,.14);
          padding:4mm;
          box-sizing:border-box;
        }
        .${ROOT} .a6-poster{
          width:100%;
          height:100%;
          border:1px solid #d8d2c9;
          border-radius:1.6mm;
          overflow:hidden;
          display:grid;
          grid-template-columns:43% 57%;
          grid-template-rows:auto 1fr auto;
          background:var(--flyer-poster-surface);
          color:var(--flyer-poster-text);
        }
        .${ROOT} .a6-hero{
          background:var(--k2-green);
          color:var(--k2-green-text);
          text-align:center;
          padding:3.2mm 3.2mm 2.8mm;
          display:grid;
          gap:0.7mm;
          grid-column:1 / span 2;
        }
        .${ROOT} .a6-brand{margin:0;font-size:6.4mm;line-height:1.05;font-weight:900;letter-spacing:.01em}
        .${ROOT} .a6-opening{margin:0;font-size:5.2mm;line-height:1.06;font-weight:820}
        .${ROOT} .a6-names{margin:0;font-size:2.5mm;line-height:1.2;font-weight:650;opacity:.94}
        .${ROOT} .a6-image-wrap{
          background:var(--flyer-img-hole);
          min-height:0;
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
        }
        .${ROOT} .a6-image{
          width:100%;
          height:100%;
          object-fit:contain;
          object-position:center;
          display:block;
        }
        .${ROOT} .a6-right{
          display:grid;
          grid-template-rows:1fr auto;
          min-height:0;
        }
        .${ROOT} .a6-intro{
          margin:0;
          padding:2.2mm 2.8mm;
          font-size:2.95mm;
          line-height:1.32;
          font-weight:760;
          text-align:center;
          border-bottom:0.25mm solid rgba(255,255,255,.14);
          display:flex;
          align-items:center;
          justify-content:center;
        }
        .${ROOT} .a6-invite{
          margin:0;
          padding:2.2mm 2.8mm;
          display:grid;
          gap:0.75mm;
          background:var(--flyer-invite-bg);
          border-top:0.25mm solid rgba(255,255,255,.22);
        }
        .${ROOT} .a6-kicker{margin:0;font-size:2.2mm;font-weight:850;letter-spacing:.05em;text-transform:uppercase}
        .${ROOT} .a6-termin{margin:0;font-size:2.35mm;line-height:1.24;font-weight:760;white-space:pre-line}
        .${ROOT} .a6-address{margin:0;font-size:2.75mm;line-height:1.22;font-weight:780}
        .${ROOT} .a6-footer{
          display:flex;
          align-items:center;
          gap:2.2mm;
          padding:2.1mm 2.8mm;
          border-top:0.25mm solid rgba(255,255,255,.14);
          grid-column:1 / span 2;
        }
        .${ROOT} .a6-qr,.${ROOT} .a6-qr-ph{width:14mm;height:14mm;border-radius:0.8mm;background:#fff;flex-shrink:0}
        .${ROOT} .a6-qr-ph{display:flex;align-items:center;justify-content:center;color:#5c5650;font-size:2.1mm}
        .${ROOT} .a6-footer-text p{margin:0;font-size:2.35mm;line-height:1.2;font-weight:700}
        .${ROOT} .a6-footer-text small{display:block;margin-top:0.3mm;font-size:1.8mm;color:var(--flyer-muted-caption)}
        .${ROOT} .a6-back-from-flyer{
          width:100%;
          height:100%;
          overflow:hidden;
          position:relative;
          background:#fffefb;
          border:1px solid #d8d2c9;
          border-radius:1.6mm;
        }
        .${ROOT} .a6-back-from-flyer .a6-back-scale{
          position:absolute;
          left:1.6mm;
          top:1.4mm;
          transform-origin:top left;
          transform:scale(0.67);
          width:203mm;
          height:144mm;
        }
        .${ROOT} .a6-back-from-flyer .card{
          width:203mm;
          height:144mm;
          margin:0;
          border-radius:2mm;
        }
        .${ROOT} .a6-back-poster{
          width:100%;
          height:100%;
          border:1px solid #d8d2c9;
          border-radius:1.6mm;
          overflow:hidden;
          display:grid;
          grid-template-columns:46% 54%;
          background:#fffefb;
          color:#1c1a18;
        }
        .${ROOT} .a6-back-left{
          padding:3mm 2.6mm;
          background:#f4f0ea;
          border-right:0.25mm solid #dfd8cf;
          display:grid;
          grid-template-rows:auto auto auto 1fr;
          gap:1.3mm;
          align-content:start;
        }
        .${ROOT} .a6-back-left h3{margin:0;font-size:4.2mm;line-height:1.12;color:var(--k2-green)}
        .${ROOT} .a6-back-left h4{margin:0;font-size:3.1mm;line-height:1.2;color:var(--k2-green)}
        .${ROOT} .a6-back-left p{margin:0;font-size:2.45mm;line-height:1.34;color:#2a2622}
        .${ROOT} .a6-back-qr-wrap{
          margin-top:0.5mm;
          display:grid;
          justify-items:center;
          gap:0.8mm;
          text-align:center;
        }
        .${ROOT} .a6-back-qr,.${ROOT} .a6-back-qr-ph{width:19mm;height:19mm;border-radius:0.8mm;background:#fff}
        .${ROOT} .a6-back-qr-ph{display:flex;align-items:center;justify-content:center;color:#5c5650;font-size:2.1mm}
        .${ROOT} .a6-back-right{
          padding:3mm 2.8mm;
          display:grid;
          align-content:space-between;
          gap:0.9mm;
          overflow:hidden;
        }
        .${ROOT} .vc-sheet{
          width:55mm;
          height:85mm;
          margin:0 auto 10px;
          background:#fff;
          box-shadow:0 6px 18px rgba(0,0,0,.14);
          padding:2.2mm;
          box-sizing:border-box;
        }
        .${ROOT} .vc-front{
          width:100%;
          height:100%;
          border:0.22mm solid #d8d2c9;
          border-radius:1.4mm;
          overflow:hidden;
          display:grid;
          grid-template-rows:auto 39mm 1fr auto;
          background:var(--flyer-poster-surface);
          color:var(--flyer-poster-text);
        }
        .${ROOT} .vc-hero{
          background:var(--k2-green);
          color:var(--k2-green-text);
          text-align:center;
          padding:1.95mm 1.9mm 1.45mm;
          display:grid;
          gap:0.55mm;
        }
        .${ROOT} .vc-brand{margin:0;font-size:3.45mm;line-height:1.04;font-weight:900;letter-spacing:.005em}
        .${ROOT} .vc-names{margin:0;font-size:1.86mm;line-height:1.2;font-weight:700;opacity:.95}
        .${ROOT} .vc-image-wrap{
          background:var(--flyer-img-hole);
          display:flex;
          align-items:center;
          justify-content:center;
          padding:0.55mm 0.65mm;
          box-sizing:border-box;
        }
        .${ROOT} .vc-image{width:100%;height:100%;object-fit:contain;object-position:center;display:block}
        .${ROOT} .vc-intro{
          margin:0;
          padding:2mm 1.6mm 1.1mm;
          font-size:2.43mm;
          line-height:1.2;
          font-weight:740;
          text-align:center;
          display:flex;
          align-items:center;
          justify-content:center;
          border-top:0.22mm solid rgba(255,255,255,.14);
        }
        .${ROOT} .vc-footer{
          display:flex;
          align-items:center;
          gap:1.05mm;
          padding:2mm 1.6mm 0.95mm;
          border-top:0.22mm solid rgba(255,255,255,.14);
          margin-top:auto;
        }
        .${ROOT} .vc-qr,.${ROOT} .vc-qr-ph{
          width:10.6mm;height:10.6mm;border-radius:0.6mm;background:#fff;flex-shrink:0;
          padding:0.45mm;box-sizing:border-box;border:0.2mm solid #dcd6cc;
        }
        .${ROOT} .vc-qr-ph{display:flex;align-items:center;justify-content:center;color:#5c5650;font-size:1.5mm}
        .${ROOT} .vc-footer-text p{margin:0;font-size:1.9mm;line-height:1.18;font-weight:760}
        .${ROOT} .vc-footer-text small{display:block;margin-top:0.85mm;font-size:1.75mm;line-height:1.16;font-weight:740;color:var(--flyer-muted-caption)}
        .${ROOT} .vc-back{
          width:100%;
          height:100%;
          border:0.22mm solid #d8d2c9;
          border-radius:1.4mm;
          overflow:hidden;
          display:grid;
          grid-template-rows:auto auto 1fr auto auto;
          background:#fffefb;
          color:#1c1a18;
          padding:1.85mm;
          box-sizing:border-box;
          gap:1.25mm;
        }
        .${ROOT} .vc-back-hero{ text-align:center }
        .${ROOT} .vc-back-hero h3{margin:0 0 0.65mm 0;color:var(--k2-green);font-size:4.75mm;line-height:1.06}
        .${ROOT} .vc-back-slogan{margin:0.38mm 0 0.6mm 0;font-size:2.82mm;line-height:1.2;font-weight:760;text-align:center}
        .${ROOT} .vc-back-power{margin:0.45mm 0 0.65mm 0;color:var(--k2-green);font-size:3.24mm;line-height:1.15;font-weight:840;text-align:center}
        .${ROOT} .vc-back-sub{margin:0;font-size:2.82mm;line-height:1.2;color:#2a2622;text-align:center}
        .${ROOT} .vc-back-qr-wrap{
          display:grid;justify-items:center;align-content:end;gap:0.72mm;text-align:center;
          grid-row:4;align-self:end;
        }
        .${ROOT} .vc-back-qr,.${ROOT} .vc-back-qr-ph{
          width:20.2mm;height:20.2mm;border-radius:0.65mm;background:#fff;
          padding:0.65mm;box-sizing:border-box;border:0.2mm solid #dcd6cc;
        }
        .${ROOT} .vc-back-qr-ph{display:flex;align-items:center;justify-content:center;color:#5c5650;font-size:1.5mm}
        .${ROOT} .vc-back-invite{margin:0;font-size:2.82mm;line-height:1.18;font-weight:720;color:#2a2622;text-align:center}
        .${ROOT} .vc-back-copy{
          grid-row:5;
          align-self:end;
          text-align:center;
          border-top:0.2mm solid #e3ddd4;
          padding-top:0.5mm;
          margin-top:0.3mm;
        }
        .${ROOT} .vc-back-copy small{font-size:1.08mm;color:#5c5650;line-height:1.18}
        .${ROOT} .a6-back-heading{
          margin:0;
          font-size:3.15mm;
          line-height:1.16;
          color:var(--k2-green);
          font-weight:840;
        }
        .${ROOT} .a6-back-body{
          margin:0;
          font-size:2.35mm;
          line-height:1.34;
          color:#2a2622;
          white-space:pre-line;
        }
      `}</style>

      <div className="toolbar">
        <button
          type="button"
          className="toolbar-back-history"
          onClick={handleToolbarBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.35rem 0.7rem',
            borderRadius: '8px',
            background: '#ebe8e2',
            color: '#1c1a18',
            fontWeight: 600,
            border: '1px solid #d4cfc4',
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          {fromPublicGalerie ? '← Zurück zur Galerie' : '← Zurück'}
        </button>
        {!isVk2 && !isOeffentlich ? (
          <Link
            to={`${PROJECT_ROUTES['k2-galerie'].marketingOek2}#mok2-9`}
            className="toolbar-back-mok2"
          >
            ← Zurück zum mök2 (Werbeunterlagen)
          </Link>
        ) : null}
        {!isVk2 && !isOeffentlich ? (
          <Link to={PROJECT_ROUTES['k2-galerie'].werbeunterlagen}>Werbeunterlagen</Link>
        ) : null}
        <button
          type="button"
          onClick={handleSaveFlyerMaster}
          style={{
            background: '#b54a1e',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.45rem 0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Speichern
        </button>
        <button type="button" onClick={() => window.print()}>Drucken</button>
        <button
          type="button"
          aria-pressed={bwPrintPreview}
          onClick={() => setBwPrintPreview((v) => !v)}
          style={
            bwPrintPreview
              ? { boxShadow: 'inset 0 0 0 2px var(--k2-green)', fontWeight: 700 }
              : undefined
          }
        >
          Schwarzweiß Druckcheck ein/aus
        </button>
        {(isA3Mode || isA6Mode || isCardMode) && (
          <Link className="link-back-to-master" to={buildFlyerEventSelfUrl({ layout: 'variant2' })}>
            ← Zurück zum Flyer-Master (A5 · Live-Vorschau)
          </Link>
        )}
        {!isA3Mode ? (
          <Link to={buildFlyerEventSelfUrl({ mode: 'a3', layout: 'variant2' })}>A3 Ableitung ansehen</Link>
        ) : null}
        {!isA6Mode ? (
          <Link to={buildFlyerEventSelfUrl({ mode: 'a6', layout: 'variant2' })}>A6 Ableitung ansehen</Link>
        ) : null}
        {!isCardMode ? (
          <Link to={buildFlyerEventSelfUrl({ mode: 'card', layout: 'variant2' })}>
            Visitenkarten-Ableitung ansehen
          </Link>
        ) : null}
        {flyerSaveMessage ? (
          <span style={{ fontSize: '0.85rem', color: 'var(--k2-green)', fontWeight: 650, maxWidth: '28rem' }}>
            {flyerSaveMessage}
          </span>
        ) : null}
      </div>

      {!isA3Mode && !isA6Mode && !isCardMode && (
        <div className="master-workspace">
          <div className="master-preview-col">
            <div className="master-preview-header">
              <h2 className="master-preview-title">Master A5 – Live-Vorschau</h2>
              <p className="master-focus-pill">
                {masterEditField
                  ? `Bearbeiten: ${MASTER_EDIT_LABELS[masterEditField]}`
                  : 'Große Fläche = Bearbeiten · Kleines i = Kurzinfo über der Vorschau'}
              </p>
            </div>
            <div className="master-preview-inner">
              {masterLiveInfo ? (
                <>
                  <div
                    className="master-live-info-backdrop"
                    role="presentation"
                    onClick={() => setMasterLiveInfo(null)}
                    aria-hidden
                  />
                  <div
                    className="master-live-info-popover"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="master-live-info-heading"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p id="master-live-info-heading" className="master-live-info-popover-title">
                      Kurzinfo
                    </p>
                    <p className="master-live-info-popover-body">{masterLiveInfo}</p>
                    <button type="button" className="master-live-info-ok" onClick={() => setMasterLiveInfo(null)}>
                      OK
                    </button>
                  </div>
                </>
              ) : null}
              <div className="master-preview-scale-wrap">
                <section className="sheet" aria-label="Masteransicht A4 – oben Vorderseite, unten Rückseite">
                  <div>{renderFrontCardV2(true)}</div>
                  <div>{renderBackCard(true)}</div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {masterEditField ? (
        <>
          <div
            className="master-edit-backdrop"
            role="presentation"
            onClick={() => setMasterEditField(null)}
            aria-hidden
          />
          <div
            className="master-edit-modal"
            style={{ left: modalPos.x, top: modalPos.y }}
            role="dialog"
            aria-labelledby="master-edit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="master-edit-head" onMouseDown={onModalHeadPointerDown}>
              <span id="master-edit-title">{MASTER_EDIT_LABELS[masterEditField]}</span>
              <button
                type="button"
                className="master-edit-close"
                onClick={() => setMasterEditField(null)}
                aria-label="Schließen"
              >
                ×
              </button>
            </div>
            <div className="master-edit-body">
              {masterEditField === 'intro' ? (
                <label>
                  Text Vorderseite (Intro)
                  <textarea
                    value={introFollowsGallery ? base.intro : masterText.intro}
                    onChange={(e) => {
                      setIntroFollowsGallery(false)
                      setMasterText((prev) => ({ ...prev, intro: e.target.value }))
                    }}
                    rows={5}
                  />
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="master-edit-linkbtn"
                      onClick={() => {
                        setIntroFollowsGallery(true)
                        setMasterText((prev) => ({ ...prev, intro: base.intro }))
                      }}
                    >
                      Mit Galerie-Willkommenstext verknüpfen (live)
                    </button>
                    <span style={{ fontSize: '0.78rem', color: '#5c5650', maxWidth: '320px' }}>
                      Standard: derselbe Text wie in Galerie gestalten – aktualisiert sich bei Änderungen im Admin.
                    </span>
                  </div>
                </label>
              ) : null}
              {masterEditField === 'image' ? (
                <>
                  <label>
                    Werkbild aus Datei
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLeftImageFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <div
                    className={`master-edit-drop${isLeftDropActive ? ' master-edit-drop-active' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsLeftDropActive(true)
                    }}
                    onDragLeave={() => setIsLeftDropActive(false)}
                    onDrop={(e) => {
                      e.preventDefault()
                      setIsLeftDropActive(false)
                      const file = e.dataTransfer?.files?.[0] || null
                      handleLeftImageFile(file)
                    }}
                  >
                    Bild hier reinziehen (Drag &amp; Drop)
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#5c5650' }}>
                    Aktuelles Vorderseitenbild: {leftWerkLabel}
                  </p>
                </>
              ) : null}
              {masterEditField === 'backSlogan' ? (
                <label>
                  Rückseite Slogan
                  <input
                    type="text"
                    value={masterText.backSlogan}
                    onChange={(e) => setMasterText((prev) => ({ ...prev, backSlogan: e.target.value }))}
                  />
                </label>
              ) : null}
              {masterEditField === 'backPower' ? (
                <label>
                  Rückseite Kernaussage
                  <input
                    type="text"
                    value={masterText.backPower}
                    onChange={(e) => setMasterText((prev) => ({ ...prev, backPower: e.target.value }))}
                  />
                </label>
              ) : null}
              {masterEditField === 'backSub' ? (
                <label>
                  Rückseite Unterzeile
                  <input
                    type="text"
                    value={masterText.backSub}
                    onChange={(e) => setMasterText((prev) => ({ ...prev, backSub: e.target.value }))}
                  />
                </label>
              ) : null}
              {masterEditField === 'backInvite' ? (
                <label>
                  Rückseite Einladung
                  <textarea
                    value={masterText.backInvite}
                    onChange={(e) => setMasterText((prev) => ({ ...prev, backInvite: e.target.value }))}
                    rows={5}
                  />
                </label>
              ) : null}
              {masterEditField === 'marketing' ? (
                <label>
                  Rückseite Fließtext (Absätze mit Leerzeile trennen)
                  <textarea
                    value={masterText.marketingBlocksRaw}
                    onChange={(e) =>
                      setMasterText((prev) => ({ ...prev, marketingBlocksRaw: e.target.value }))
                    }
                    rows={14}
                  />
                </label>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      {isA3Mode ? (
        <div className="derivation-shell mode-a3">
          <div className="derivation-head">
            <div>
              <p className="derivation-title">A3 Ableitung – Live-Vorschau</p>
              <p className="derivation-sub">Standard: kompakte Vorschau. Vollbild nur bei Bedarf.</p>
            </div>
            <button
              type="button"
              className="derivation-toggle"
              onClick={() => setShowDerivationFullscreen((prev) => !prev)}
            >
              {showDerivationFullscreen ? 'Zurück zur Live-Vorschau' : 'Vollbild ansehen'}
            </button>
          </div>
          <div className={showDerivationFullscreen ? 'derivation-fullscreen-stage' : 'derivation-preview-stage'}>
            <div className="derivation-preview-scale">
              <section className="a3-sheet" aria-label="A3 Plakat Seite 1">
                {posterA3Card}
              </section>
            </div>
          </div>
        </div>
      ) : isCardMode ? (
        <div className="derivation-shell mode-card">
          <div className="derivation-head">
            <div>
              <p className="derivation-title">Visitenkarten-Ableitung – Live-Vorschau</p>
              <p className="derivation-sub">Standard: kompakte Vorschau. Vollbild nur bei Bedarf.</p>
            </div>
            <button
              type="button"
              className="derivation-toggle"
              onClick={() => setShowDerivationFullscreen((prev) => !prev)}
            >
              {showDerivationFullscreen ? 'Zurück zur Live-Vorschau' : 'Vollbild ansehen'}
            </button>
          </div>
          <div className={showDerivationFullscreen ? 'derivation-fullscreen-stage' : 'derivation-preview-stage'}>
            <div className="derivation-preview-scale">
              <section className="vc-sheet" aria-label="Visitenkarte Seite 1">
                {businessCardFront}
              </section>
              <section className="vc-sheet" aria-label="Visitenkarte Seite 2">
                {businessCardBack}
              </section>
            </div>
          </div>
        </div>
      ) : isA6Mode ? (
        <div className="derivation-shell mode-a6">
          <div className="derivation-head">
            <div>
              <p className="derivation-title">A6 Ableitung – Live-Vorschau</p>
              <p className="derivation-sub">
                Standard: kompakte Vorschau. Vollbild nur bei Bedarf. Motiv vollständig sichtbar (nicht beschnitten);
                bei manchen Fotos entsteht ein schmaler Rand am Bild.
              </p>
            </div>
            <button
              type="button"
              className="derivation-toggle"
              onClick={() => setShowDerivationFullscreen((prev) => !prev)}
            >
              {showDerivationFullscreen ? 'Zurück zur Live-Vorschau' : 'Vollbild ansehen'}
            </button>
          </div>
          <div className={showDerivationFullscreen ? 'derivation-fullscreen-stage' : 'derivation-preview-stage'}>
            <div className="derivation-preview-scale">
              <section className="a6-sheet" aria-label="A6 Werbekarte Seite 1">
                {posterA6Card}
              </section>
              <section className="a6-sheet" aria-label="A6 Werbekarte Seite 2">
                {posterA6BackCard()}
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
