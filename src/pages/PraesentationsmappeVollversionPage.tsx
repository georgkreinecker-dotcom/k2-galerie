/**
 * Präsentationsmappe Vollversion – schrittweise Entscheidungshilfe für künftige Nutzer:innen (Überblick USPs + Produkt).
 * Gliederung: zuerst Orientierung (USPs, Prospekt, Was/Für wen), dann Kapitel mit konkreten Admin-Beispielen (inkl. Demo/Lizenz/Kontakt). Die Seitenleiste trennt die Blöcke visuell.
 * Ton: Du, Nutzen, klare Lesereihenfolge; Quelle: public/praesentationsmappe-vollversion/*.md
 */

import { useState, useEffect, useRef, useCallback, useMemo, type ReactNode } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES, BASE_APP_URL } from '../config/navigation'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import {
  PRODUCT_BRAND_NAME,
  MUSTER_TEXTE,
  PRODUCT_WERBESLOGAN,
  PRODUCT_WERBESLOGAN_2,
  K2_GALERIE_PUBLIC_BRAND,
} from '../config/tenantConfig'
import { getEntdeckenHeroPathUrl } from '../config/pageContentEntdecken'
import {
  ENTDECKEN_HERO_DEFAULT_PATH,
  ENTDECKEN_HERO_IMAGE_FALLBACK_PATH,
  isEntdeckenHeroVideoUrl,
} from '../config/entdeckenHeroMedia'
import { useWerbemittelPrintContext } from '../hooks/useWerbemittelPrintContext'
import { renderMarkdown } from '../utils/praesentationsmappeMarkdown'
import { PRAESENTATIONSMAPPE_MARKDOWN_STYLES } from '../utils/praesentationsmappeMarkdownStyles'
import {
  getFullscreenElement,
  requestElementFullscreen,
  exitElementFullscreenIfActive,
} from '../utils/domFullscreen'

const BASE_STANDARD = '/praesentationsmappe-vollversion'
const BASE_VK2 = '/praesentationsmappe-vk2-vollversion'
const BASE_VK2_PROMO = '/praesentationsmappe-vk2-promo'
const DOC_PARAM = 'doc'
const OEK2_URL = BASE_APP_URL + '/projects/k2-galerie/galerie-oeffentlich'
const VK2_URL = BASE_APP_URL + '/projects/vk2'

function patchKontaktMarkdownForContext(raw: string, isOeffentlich: boolean): string {
  if (!isOeffentlich) return raw
  return `# Kontakt\n\n${MUSTER_TEXTE.gallery.email} · Demo ök2 – nur Mustertexte, keine K2-Stammdaten.\n\n© ${PRODUCT_BRAND_NAME}\n\nQR zur Demo (ök2) unten.`
}

/** Ein Dokument der Mappe; sectionTitle nur beim ersten Kapitel eines Gliederungsblocks (Zwischenüberschrift in der Seitenleiste, rein visuell). */
type PraesMappeDoc = {
  sectionTitle?: string
  /** Nummer wie in public/.../00-INDEX.md (K2: Prospekt nur per Link, nicht in der Seitenleiste). */
  tocChapter?: number
  hideInNav?: boolean
  id: string
  name: string
  file: string
}

/** K2 Vollversion: Leitfaden. VK2-Ordner: `00-SO-NUTZT-DU.md`. */
const PMV_SO_NUTZT_DU_MAPPE = '00-SO-NUTZT-DU-MAPPE.md'
const PMV_SO_NUTZT_DU = '00-SO-NUTZT-DU.md'
const PMV_DECKBLATT_FILE = '01-DECKBLATT.md'

function isPmvLeitfadenFile(file: string): boolean {
  return file === PMV_SO_NUTZT_DU_MAPPE || file === PMV_SO_NUTZT_DU
}

function renderDeckblattCover(_isOeffentlich: boolean): ReactNode {
  /** Genau öffentliche Marke „K2 Galerie“ – kein Zusatz (z. B. Kunst & Keramik). */
  const coverTitle = K2_GALERIE_PUBLIC_BRAND
  const heroPath =
    typeof window !== 'undefined' ? getEntdeckenHeroPathUrl() : ENTDECKEN_HERO_DEFAULT_PATH
  const heroSrc =
    isEntdeckenHeroVideoUrl(heroPath) ? ENTDECKEN_HERO_IMAGE_FALLBACK_PATH : heroPath
  return (
    <div className="pmv-deckblatt-cover">
      <div className="pmv-deckblatt-header">
        <h1 className="pmv-cover-title">{coverTitle}</h1>
        <p className="pmv-cover-slogan1">{PRODUCT_WERBESLOGAN}</p>
        <p className="pmv-cover-slogan2">{PRODUCT_WERBESLOGAN_2}</p>
        <p className="pmv-cover-copyright">© {PRODUCT_BRAND_NAME}</p>
      </div>
      <div className="pmv-cover-img-wrap">
        <img className="pmv-cover-img" src={heroSrc} alt="" />
      </div>
    </div>
  )
}

const DOCUMENTS_STANDARD: PraesMappeDoc[] = [
  {
    sectionTitle: 'Orientierung',
    id: 'deckblatt',
    name: 'Deckblatt',
    file: PMV_DECKBLATT_FILE,
  },
  {
    id: 'so-nutzt-du',
    name: 'So nutzt du diese Mappe',
    file: PMV_SO_NUTZT_DU_MAPPE,
  },
  {
    id: 'pmv-inhaltsverzeichnis',
    name: 'Inhaltsverzeichnis',
    file: '00-INDEX.md',
    tocChapter: 1,
  },
  { id: '02-usp-wettbewerb', name: 'USPs & Mitbewerb', file: '02-USP-UND-WETTBEWERB.md', tocChapter: 2 },
  {
    id: '02b-prospekt',
    name: 'Prospekt Aufbruch & Zukunft',
    file: '02B-PROSPEKT-ZUKUNFT.md',
    tocChapter: 3,
    hideInNav: true,
  },
  { id: '02-was-ist', name: 'Was ist die K2 Galerie', file: '02-WAS-IST-K2-GALERIE.md', tocChapter: 4 },
  { id: '03-fuer-wen', name: 'Für wen', file: '03-FUER-WEN.md', tocChapter: 5 },
  {
    sectionTitle: 'Konkret im Admin',
    id: '04-willkommen',
    name: 'Willkommen und Galerie',
    file: '04-WILLKOMMEN-UND-GALERIE.md',
    tocChapter: 6,
  },
  { id: '04-admin-herz', name: 'Admin – Herzstück', file: '04-ADMIN-HERZSTUECK.md', tocChapter: 7 },
  { id: '05-werke', name: 'Werke erfassen', file: '05-WERKE-ERFASSEN.md', tocChapter: 8 },
  { id: '06-design', name: 'Design und Veröffentlichung', file: '06-DESIGN-VEROEFFENTLICHUNG.md', tocChapter: 9 },
  { id: '14-statistik-werkkatalog', name: 'Statistik und Werkkatalog', file: '14-STATISTIK-WERKKATALOG.md', tocChapter: 10 },
  { id: '07-kassa', name: 'Kassa und Verkauf', file: '07-KASSA-VERKAUF.md', tocChapter: 11 },
  { id: '15-shop-internet', name: 'Shop und Internetbestellung', file: '15-SHOP-INTERNETBESTELLUNG.md', tocChapter: 12 },
  { id: '08-events', name: 'Events und Öffentlichkeitsarbeit', file: '08-EVENTS-OEFFENTLICHKEITSARBEIT.md', tocChapter: 13 },
  { id: '09-vk2', name: 'Vereinsplattform VK2', file: '09-VEREINSPLATTFORM-VK2.md', tocChapter: 14 },
  { id: '10-demo', name: 'Demo und Lizenz', file: '10-DEMO-LIZENZ.md', tocChapter: 15 },
  {
    id: '16-einstellungen',
    name: 'Einstellungen & Stammdaten',
    file: '16-EINSTELLUNGEN-STAMMDATEN.md',
    tocChapter: 16,
  },
  { id: '11-empfehlung', name: 'Empfehlungsprogramm', file: '11-EMPFEHLUNGSPROGRAMM.md', tocChapter: 17 },
  { id: '12-technik', name: 'Technik', file: '12-TECHNIK.md', tocChapter: 18 },
  { id: '13-kontakt', name: 'Kontakt', file: '13-KONTAKT.md', tocChapter: 19 },
]

const DOCUMENTS_VK2: PraesMappeDoc[] = [
  {
    sectionTitle: 'Orientierung',
    id: 'so-nutzt-du',
    name: 'So nutzt du diese Mappe',
    file: PMV_SO_NUTZT_DU,
  },
  {
    id: '00-index',
    name: 'Inhaltsverzeichnis',
    file: '00-INDEX.md',
  },
  { id: '02-usp-wettbewerb', name: 'USPs & Mitbewerb', file: '02-USP-WETTBEWERB-VK2.md', tocChapter: 1 },
  { id: '02-was-ist-vk2', name: 'Was ist VK2', file: '02-WAS-IST-VK2.md', tocChapter: 2 },
  { id: '03-fuer-wen', name: 'Für wen', file: '03-FUER-WEN.md', tocChapter: 3 },
  {
    sectionTitle: 'Konkret im Admin',
    id: '04-mitglieder-galerie',
    name: 'Mitglieder und Galerie',
    file: '04-MITGLIEDER-UND-GALERIE.md',
    tocChapter: 4,
  },
  { id: '05-kassa-verkauf', name: 'Kassa und Verkauf', file: '05-KASSA-UND-VERKAUF.md', tocChapter: 5 },
  { id: '06-events-medien', name: 'Events und Medienplanung', file: '06-EVENTS-UND-MEDIENPLANUNG.md', tocChapter: 6 },
  { id: '07-lizenz-betrieb', name: 'Lizenz und Betrieb', file: '07-LIZENZ-UND-BETRIEB.md', tocChapter: 7 },
  { id: '08-kontakt', name: 'Kontakt', file: '08-KONTAKT.md', tocChapter: 8 },
]

/** Zweite VK2-Mappe: kurz, jedes Kapitel mit Muster-Screenshot unter /img/oeffentlich/. */
const DOCUMENTS_VK2_PROMO: PraesMappeDoc[] = [
  {
    sectionTitle: 'Orientierung',
    id: 'so-nutzt-du',
    name: 'So nutzt du diese Mappe',
    file: PMV_SO_NUTZT_DU,
  },
  {
    id: '00-index',
    name: 'Inhaltsverzeichnis',
    file: '00-INDEX.md',
  },
  { id: '02-usp-wettbewerb', name: 'USPs & Mitbewerb', file: '02-USP-WETTBEWERB.md', tocChapter: 1 },
  {
    sectionTitle: 'Konkret im Admin',
    id: '02-ein-blick',
    name: 'Ein Blick in den Admin',
    file: '02-EIN-BLICK-ADMIN.md',
    tocChapter: 2,
  },
  { id: '03-mitglieder', name: 'Mitglieder & Galerie', file: '03-MITGLIEDER-GALERIE.md', tocChapter: 3 },
  { id: '04-kassa', name: 'Kassa & Verkauf', file: '04-KASSA-VERKAUF.md', tocChapter: 4 },
  { id: '05-events', name: 'Events & Medien', file: '05-EVENTS-MEDIEN.md', tocChapter: 5 },
  { id: '06-lizenz', name: 'Lizenz & Betrieb', file: '06-LIZENZ-BETRIEB.md', tocChapter: 6 },
  { id: '07-kontakt', name: 'Kontakt', file: '07-KONTAKT.md', tocChapter: 7 },
]

function isPmvMetaDocFile(file: string): boolean {
  return file === '00-INDEX.md' || isPmvLeitfadenFile(file) || file === PMV_DECKBLATT_FILE
}

/** Nummer vor der ersten H1: Meta-Seiten ohne Nummer; Inhaltskapitel über tocChapter (K2) oder Fallback Zählung (VK2). */
function chapterNumberForPmvMarkdown(docs: PraesMappeDoc[], file: string): number | undefined {
  const idx = docs.findIndex((d) => d.file === file)
  if (idx < 0) return undefined
  if (isPmvMetaDocFile(file)) return undefined
  const doc = docs[idx]
  if (doc?.tocChapter != null) return doc.tocChapter
  const contentOnly = docs.filter((d) => !isPmvMetaDocFile(d.file))
  const ci = contentOnly.findIndex((d) => d.file === file)
  if (ci < 0) return undefined
  return ci + 1
}

function wrapPmvMarkdownPage(file: string | null, node: ReactNode): ReactNode {
  if (file && isPmvLeitfadenFile(file)) {
    return <div className="pmv-leitfaden-page">{node}</div>
  }
  if (file === '00-INDEX.md') {
    return <div className="pmv-toc-only-page">{node}</div>
  }
  return node
}

function sidebarDocLabel(docs: PraesMappeDoc[], doc: PraesMappeDoc): string {
  const n = chapterNumberForPmvMarkdown(docs, doc.file)
  return n != null ? `${n}. ${doc.name}` : doc.name
}

export default function PraesentationsmappeVollversionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const variantParam = searchParams.get('variant') || ''
  const isVk2Promo = variantParam === 'vk2-promo'
  const isVk2Classic = variantParam === 'vk2'
  const isAnyVk2 = isVk2Classic || isVk2Promo
  const BASE = isVk2Promo ? BASE_VK2_PROMO : isVk2Classic ? BASE_VK2 : BASE_STANDARD
  const DOCUMENTS = isVk2Promo ? DOCUMENTS_VK2_PROMO : isVk2Classic ? DOCUMENTS_VK2 : DOCUMENTS_STANDARD
  const kontaktFileForVariant =
    isVk2Promo ? '07-KONTAKT.md' : isVk2Classic ? '08-KONTAKT.md' : '13-KONTAKT.md'
  const printCtx = useWerbemittelPrintContext()
  const isOeffentlich = printCtx === 'oeffentlich'
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [docContent, setDocContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [qrOek2DataUrl, setQrOek2DataUrl] = useState('')
  const [fullPrintView, setFullPrintView] = useState(false)
  const [allDocContents, setAllDocContents] = useState<string[]>([])
  const [loadingFullPrint, setLoadingFullPrint] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const docsMatchingAllContents = useMemo(() => {
    const bulk = fullPrintView || (isMobile && allDocContents.length > 0)
    if (!bulk) return DOCUMENTS
    /** Gesamtmappe = dieselbe Reihenfolge wie in der Navigation, inkl. Deckblatt (K2). */
    return DOCUMENTS
  }, [fullPrintView, isMobile, allDocContents.length, DOCUMENTS])

  const navDocuments = useMemo(
    () => DOCUMENTS.filter((d) => !d.hideInNav),
    [DOCUMENTS],
  )

  const returnTo =
    searchParams.get('returnTo') ||
    (location.state as { returnTo?: string } | null)?.returnTo ||
    ''
  /** Beamer/Folien: ein Kapitel pro „Folie“, Vollbild, Pfeiltasten; optional auto= Sekunden pro Folie */
  const beamerMode = searchParams.get('beamer') === '1'
  const autoSecRaw = parseInt(searchParams.get('auto') || '0', 10)
  const autoSecBeamer =
    Number.isFinite(autoSecRaw) && autoSecRaw > 0 ? Math.min(600, Math.max(5, autoSecRaw)) : 0
  const beamerRootRef = useRef<HTMLDivElement | null>(null)
  const [beamerFs, setBeamerFs] = useState(false)
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()
  const pageTitle = isVk2Promo
    ? 'VK2 – Präsentationsmappe mit Musterbildern'
    : isVk2Classic
      ? 'Präsentationsmappe VK2 – Vollversion'
      : 'Präsentationsmappe – Vollversion'
  const pageSubtitle = isVk2Promo
    ? 'Kompakt: Orientierung und ein Screenshot pro Kapitel.'
    : isVk2Classic
      ? 'Orientierung, danach Beispiele – die Seitenleiste zeigt die Kapitel.'
      : ''

  /** Druck-Kopfzeile (Safari/Chrome): nutzt document.title – ohne „Kunst & Keramik“. */
  useEffect(() => {
    const prev = document.title
    document.title = isVk2Promo
      ? 'VK2 – Präsentationsmappe'
      : isVk2Classic
        ? 'Präsentationsmappe VK2'
        : `Präsentationsmappe – ${K2_GALERIE_PUBLIC_BRAND}`
    return () => {
      document.title = prev
    }
  }, [isVk2Promo, isVk2Classic])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (isMobile) return
    const docFromUrl = searchParams.get(DOC_PARAM)
    if (docFromUrl === '02C-PROMO-A4-ESSENZ.md') {
      navigate(PROJECT_ROUTES['k2-galerie'].flyerOek2PromoA4, { replace: true })
      return
    }
    if (docFromUrl === '02B-PROSPEKT-ZUKUNFT.md' && !isAnyVk2) {
      const next = new URLSearchParams(searchParams)
      next.set(DOC_PARAM, '02-USP-UND-WETTBEWERB.md')
      navigate({ search: next.toString() }, { replace: true })
      return
    }
    const fileToLoad = docFromUrl && DOCUMENTS.some((d) => d.file === docFromUrl)
      ? docFromUrl
      : DOCUMENTS[0].file
    loadDocument(fileToLoad)
  }, [searchParams, isMobile, isOeffentlich, BASE, DOCUMENTS, navigate, isAnyVk2])

  useEffect(() => {
    const needQr = selectedDoc === kontaktFileForVariant || fullPrintView
    if (!needQr) {
      setQrOek2DataUrl('')
      return
    }
    const qrTarget = isAnyVk2 ? VK2_URL : OEK2_URL
    QRCode.toDataURL(buildQrUrlWithBust(qrTarget, qrVersionTs), { width: 140, margin: 1 })
      .then(setQrOek2DataUrl)
      .catch(() => setQrOek2DataUrl(''))
  }, [selectedDoc, fullPrintView, qrVersionTs, kontaktFileForVariant, isAnyVk2])

  const loadDocument = async (filename: string) => {
    setLoading(true)
    setSelectedDoc(filename)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set(DOC_PARAM, filename)
      return next
    }, { replace: true })
    try {
      const response = await fetch(`${BASE}/${filename}`)
      if (response.ok) {
        let text = await response.text()
        if (!isAnyVk2 && filename === '13-KONTAKT.md') text = patchKontaktMarkdownForContext(text, isOeffentlich)
        setDocContent(text)
      } else {
        setDocContent(`# Dokument nicht gefunden\n\nDie Datei konnte nicht geladen werden.`)
      }
    } catch {
      setDocContent(`# Fehler beim Laden\n\nBitte prüfe deine Verbindung und versuche es erneut.`)
    } finally {
      setLoading(false)
    }
  }

  const loadDocumentRef = useRef(loadDocument)
  loadDocumentRef.current = loadDocument

  const exitBeamerMode = useCallback(() => {
    const el = beamerRootRef.current
    if (el) void exitElementFullscreenIfActive(el)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('beamer')
      next.delete('auto')
      return next
    }, { replace: true })
  }, [setSearchParams])

  const stepBeamer = useCallback(
    (delta: number) => {
      const i = DOCUMENTS.findIndex((d) => d.file === selectedDoc)
      if (i < 0) return
      const j = i + delta
      if (j < 0 || j >= DOCUMENTS.length) return
      void loadDocumentRef.current(DOCUMENTS[j].file)
    },
    [DOCUMENTS, selectedDoc],
  )

  const toggleBeamerFullscreen = useCallback(async () => {
    const el = beamerRootRef.current
    if (!el) return
    try {
      if (getFullscreenElement() === el) await exitElementFullscreenIfActive(el)
      else await requestElementFullscreen(el)
    } catch {
      /* nur nach Nutzeraktion */
    }
  }, [])

  useEffect(() => {
    if (!beamerMode) {
      setBeamerFs(false)
      return
    }
    const sync = () => {
      const el = beamerRootRef.current
      setBeamerFs(!!el && getFullscreenElement() === el)
    }
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync as EventListener)
    sync()
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync as EventListener)
    }
  }, [beamerMode])

  useEffect(() => {
    if (!beamerMode) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        exitBeamerMode()
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey) || e.key === 'Enter') {
        e.preventDefault()
        stepBeamer(1)
        return
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        stepBeamer(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [beamerMode, exitBeamerMode, stepBeamer])

  useEffect(() => {
    if (!beamerMode || autoSecBeamer <= 0) return
    const i = DOCUMENTS.findIndex((d) => d.file === selectedDoc)
    if (i < 0 || i >= DOCUMENTS.length - 1) return
    const t = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      stepBeamer(1)
    }, autoSecBeamer * 1000)
    return () => window.clearInterval(t)
  }, [beamerMode, autoSecBeamer, selectedDoc, DOCUMENTS, stepBeamer])

  const loadAllDocuments = async (forPrint: boolean) => {
    setLoadingFullPrint(true)
    try {
      const docList = DOCUMENTS
      const contents: string[] = []
      for (const doc of docList) {
        if (!isAnyVk2 && doc.file === PMV_DECKBLATT_FILE) {
          contents.push('')
          continue
        }
        const response = await fetch(`${BASE}/${doc.file}`)
        let text = response.ok ? await response.text() : `# ${doc.name}\n\nDokument nicht geladen.`
        if (!isAnyVk2 && doc.file === '13-KONTAKT.md') text = patchKontaktMarkdownForContext(text, isOeffentlich)
        contents.push(text)
      }
      setAllDocContents(contents)
      if (forPrint) setFullPrintView(true)
    } catch {
      setAllDocContents([])
    } finally {
      setLoadingFullPrint(false)
    }
  }

  const loadAllDocumentsForPrint = () => loadAllDocuments(true)

  useEffect(() => {
    if (beamerMode || !isMobile || allDocContents.length > 0) return
    loadAllDocuments(false)
  }, [beamerMode, isMobile, allDocContents.length])

  const handleZurueck = () => {
    if (returnTo) {
      try {
        const u = new URL(returnTo, window.location.origin)
        if (u.origin === window.location.origin) navigate(u.pathname + u.search + u.hash)
        else window.location.href = returnTo
      } catch {
        navigate(returnTo.startsWith('/') ? returnTo : `/${returnTo}`)
      }
      return
    }
    navigate(-1)
  }

  const currentDocName = DOCUMENTS.find((d) => d.file === selectedDoc)?.name ?? 'Präsentationsmappe – Vollversion'

  /** Deckblatt (K2): keine Fußzeile – weder Bildschirm noch Druck aus Einzelansicht. */
  const hidePmvFooterDeckblatt =
    !fullPrintView &&
    !(isMobile && allDocContents.length > 0) &&
    selectedDoc === PMV_DECKBLATT_FILE &&
    !isAnyVk2

  const beamerIdx = useMemo(
    () => Math.max(0, DOCUMENTS.findIndex((d) => d.file === selectedDoc)),
    [DOCUMENTS, selectedDoc],
  )
  const beamerTotal = DOCUMENTS.length

  if (beamerMode) {
    return (
      <div
        ref={beamerRootRef}
        className="pmv-wrap pmv-map-page-root pmv-beamer-root"
        lang="de"
        style={{
          minHeight: '100vh',
          background: '#fffefb',
          color: '#1c1a18',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <style>{PRAESENTATIONSMAPPE_MARKDOWN_STYLES}</style>
        <div
          className="pmv-no-print"
          style={{
            flexShrink: 0,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.65rem',
            padding: '0.55rem 0.85rem',
            background: 'rgba(28, 26, 24, 0.92)',
            color: '#f9fafb',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.3 }}>
              📽️ Folien · {currentDocName}
            </div>
            <div style={{ fontSize: '0.72rem', opacity: 0.88, marginTop: '0.15rem' }}>
              Kapitel {beamerIdx + 1} von {beamerTotal}
              {autoSecBeamer > 0 ? ` · Auto ${autoSecBeamer}s` : ''}
              {' · '}← → Leertaste · Esc beenden
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            <button
              type="button"
              onClick={() => stepBeamer(-1)}
              disabled={beamerIdx <= 0}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.25)',
                background: beamerIdx <= 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.14)',
                color: '#fff',
                cursor: beamerIdx <= 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
              }}
            >
              ← Zurück
            </button>
            <button
              type="button"
              onClick={() => void toggleBeamerFullscreen()}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.25)',
                background: 'rgba(13, 148, 136, 0.95)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
              }}
            >
              {beamerFs ? 'Vollbild beenden' : 'Vollbild'}
            </button>
            <button
              type="button"
              onClick={() => stepBeamer(1)}
              disabled={beamerIdx >= beamerTotal - 1}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.25)',
                background: beamerIdx >= beamerTotal - 1 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.14)',
                color: '#fff',
                cursor: beamerIdx >= beamerTotal - 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
              }}
            >
              Weiter →
            </button>
            <button
              type="button"
              onClick={exitBeamerMode}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: 8,
                border: '1px solid rgba(248, 113, 113, 0.5)',
                background: 'rgba(127, 29, 29, 0.55)',
                color: '#fecaca',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
              }}
            >
              Folien beenden
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 'clamp(0.75rem, 2vw, 1.25rem) clamp(0.75rem, 4vw, 2rem) 2rem' }}>
          <article className="pmv-article pmv-a4-sheet" style={{ minHeight: 200 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Lade Kapitel…</div>
            ) : (
              <div>
                {wrapPmvMarkdownPage(
                  selectedDoc,
                  renderMarkdown(docContent, {
                    assetBase: BASE,
                    chapterNumber: chapterNumberForPmvMarkdown(DOCUMENTS, selectedDoc ?? ''),
                    onInternalDocClick: (path) => loadDocument(path),
                  }),
                )}
                {selectedDoc === kontaktFileForVariant && qrOek2DataUrl && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <img src={qrOek2DataUrl} alt={isAnyVk2 ? 'QR zur VK2 Vereinsplattform' : 'QR zur Demo (ök2)'} style={{ display: 'block', width: 140, height: 140 }} />
                  </div>
                )}
              </div>
            )}
          </article>
        </div>
      </div>
    )
  }

  return (
    <div
      className={[
        'pmv-wrap',
        'pmv-map-page-root',
        hidePmvFooterDeckblatt ? 'pmv-map-page-root--deckblatt-only' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      lang="de"
      style={{ padding: '1.5rem 1rem', background: '#fffefb', minHeight: '100vh', color: '#1c1a18' }}
    >
      <style>{PRAESENTATIONSMAPPE_MARKDOWN_STYLES}</style>

      <header className="pmv-no-print" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1c1a18', fontWeight: 600 }}>📁 {pageTitle}</h1>
          {(fullPrintView ||
            (isMobile && allDocContents.length > 0) ||
            pageSubtitle) ? (
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#6b7280' }}>
              {fullPrintView
                ? 'Alle Kapitel mit Bildern – zum Drucken'
                : isMobile && allDocContents.length > 0
                  ? 'Alle Kapitel – durchscrollen bis zur letzten Seite'
                  : pageSubtitle}
            </p>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {fullPrintView ? (
            <>
              <button type="button" onClick={() => window.print()} style={{ padding: '0.5rem 1rem', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                🖨️ Drucken
              </button>
              <button type="button" onClick={() => setFullPrintView(false)} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#1c1a18', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                ← Zurück zur Einzelansicht
              </button>
            </>
          ) : (
            <>
              {!isMobile && (
                <button type="button" onClick={loadAllDocumentsForPrint} disabled={loadingFullPrint} style={{ padding: '0.5rem 1rem', background: '#0f766e', color: '#fff', border: 'none', borderRadius: 8, cursor: loadingFullPrint ? 'wait' : 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                  {loadingFullPrint ? 'Lade…' : '📄 Gesamte Mappe drucken'}
                </button>
              )}
              <button type="button" onClick={() => window.print()} style={{ padding: '0.5rem 1rem', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                🖨️ Drucken
              </button>
              <button
                type="button"
                onClick={() =>
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev)
                    next.set('beamer', '1')
                    return next
                  }, { replace: true })
                }
                style={{ padding: '0.5rem 1rem', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                title="Kapitel nacheinander, Vollbild, Pfeiltasten – für Beamer oder großen Bildschirm"
              >
                📽️ Folien (Beamer)
              </button>
              <button type="button" onClick={handleZurueck} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#1c1a18', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                ← Zurück
              </button>
            </>
          )}
        </div>
      </header>

      {(fullPrintView || (isMobile && allDocContents.length > 0)) && !beamerMode ? (
        <article
          className="pmv-scroll-mobile pmv-a4-sheet"
          style={{ overflow: 'visible' }}
        >
          {allDocContents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Keine Kapitel geladen.</div>
          ) : (
            docsMatchingAllContents.map((doc, idx) => (
              <div
                key={doc.file}
                className={[
                  'pmv-chapter-block',
                  idx === 0 ? 'pmv-chapter-first' : '',
                  isPmvLeitfadenFile(doc.file) ? 'pmv-chapter-block--leitfaden' : '',
                  doc.file === '00-INDEX.md' ? 'pmv-chapter-block--toc-only' : '',
                  doc.file === PMV_DECKBLATT_FILE && !isAnyVk2 ? 'pmv-chapter-block--deckblatt-print' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {doc.file === PMV_DECKBLATT_FILE && !isAnyVk2 ? (
                  renderDeckblattCover(isOeffentlich)
                ) : (
                  wrapPmvMarkdownPage(
                    doc.file,
                    renderMarkdown(allDocContents[idx] ?? '', {
                      assetBase: BASE,
                      chapterNumber: chapterNumberForPmvMarkdown(DOCUMENTS, doc.file),
                      onInternalDocClick: (path) => {
                        setFullPrintView(false)
                        loadDocument(path)
                      },
                      keyPrefix: `ch${idx}`,
                    }),
                  )
                )}
                {doc.file === kontaktFileForVariant && qrOek2DataUrl && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <img src={qrOek2DataUrl} alt={isAnyVk2 ? 'QR zur VK2 Vereinsplattform' : 'QR zur Demo (ök2)'} style={{ display: 'block', width: 140, height: 140 }} />
                  </div>
                )}
              </div>
            ))
          )}
        </article>
      ) : isMobile && loadingFullPrint ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Mappe wird geladen…</div>
      ) : (
        <div
          className="pmv-mobile-stack pmv-map-grid"
          style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 200px) minmax(0, 1fr)', gap: '1.5rem' }}
        >
          <nav className="pmv-no-print pmv-nav" style={{ background: '#f0fdfa', padding: '1rem', borderRadius: 12, border: '1px solid #99f6e4', height: 'fit-content', position: 'sticky', top: '1rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#0d9488', fontWeight: 600 }}>Kapitel</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {navDocuments.map((doc, index) => {
                const prev = index > 0 ? navDocuments[index - 1] : null
                const showSectionHeading =
                  !!doc.sectionTitle && doc.sectionTitle !== prev?.sectionTitle
                return (
                  <div key={doc.id}>
                    {showSectionHeading ? (
                      <div
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: '#115e59',
                          marginTop: index > 0 ? '0.75rem' : 0,
                          paddingTop: index > 0 ? '0.65rem' : 0,
                          borderTop: index > 0 ? '2px solid rgba(13, 148, 136, 0.35)' : 'none',
                          marginBottom: '0.25rem',
                          lineHeight: 1.35,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {doc.sectionTitle}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => loadDocument(doc.file)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: selectedDoc === doc.file ? '#ccfbf1' : 'transparent',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.875rem',
                        color: selectedDoc === doc.file ? '#0d9488' : '#4b5563',
                        fontWeight: selectedDoc === doc.file ? 600 : 400,
                        width: '100%',
                      }}
                    >
                      {sidebarDocLabel(DOCUMENTS, doc)}
                    </button>
                  </div>
                )
              })}
            </div>
          </nav>

          <article
            className="pmv-article pmv-a4-sheet"
            style={hidePmvFooterDeckblatt ? {} : { minHeight: 400 }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Lade Kapitel...</div>
            ) : selectedDoc === PMV_DECKBLATT_FILE && !isAnyVk2 ? (
              renderDeckblattCover(isOeffentlich)
            ) : (
              <div>
                {wrapPmvMarkdownPage(
                  selectedDoc,
                  renderMarkdown(docContent, {
                    assetBase: BASE,
                    chapterNumber: chapterNumberForPmvMarkdown(DOCUMENTS, selectedDoc ?? ''),
                    onInternalDocClick: (path) => loadDocument(path),
                  }),
                )}
                {selectedDoc === kontaktFileForVariant && qrOek2DataUrl && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <img src={qrOek2DataUrl} alt={isAnyVk2 ? 'QR zur VK2 Vereinsplattform' : 'QR zur Demo (ök2)'} style={{ display: 'block', width: 140, height: 140 }} />
                  </div>
                )}
              </div>
            )}
          </article>
        </div>
      )}
      {!hidePmvFooterDeckblatt ? (
        <div className="pmv-seitenfuss pmv-wrap" aria-hidden>
          <span className="pmv-seitenfuss-brand">{PRODUCT_BRAND_NAME}</span>
          <span className="pmv-seitenfuss-preview">Präsentationsmappe · Druck: Marke links, Seitenzahl rechts</span>
          <span className="pmv-seitenfuss-page" aria-hidden="true" />
        </div>
      ) : null}
    </div>
  )
}
