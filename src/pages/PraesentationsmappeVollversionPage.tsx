/**
 * Präsentationsmappe Vollversion – Handbuch-Struktur, Marketing-Stil, Texte aus mök2, Screenshots der App.
 * Quelle: public/praesentationsmappe-vollversion/*.md
 */

import { useState, useEffect, type ReactNode } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES, BASE_APP_URL } from '../config/navigation'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import {
  PRODUCT_BRAND_NAME,
  PRODUCT_WERBESLOGAN,
  PRODUCT_WERBESLOGAN_2,
  K2_GALERIE_PUBLIC_BRAND,
  MUSTER_TEXTE,
  TENANT_CONFIGS,
  getOek2WelcomeImageEffective,
} from '../config/tenantConfig'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { useWerbemittelPrintContext } from '../hooks/useWerbemittelPrintContext'

const BASE = '/praesentationsmappe-vollversion'
const DOC_PARAM = 'doc'
const OEK2_URL = BASE_APP_URL + '/projects/k2-galerie/galerie-oeffentlich'
/** Fallback Deckblatt-Bild wenn kein Welcome-Bild in Stammdaten */
const DECKBLATT_WILLKOMMENSBILD = '/img/oeffentlich/willkommen-demo.jpg'

function patchKontaktMarkdownForContext(raw: string, isOeffentlich: boolean): string {
  if (!isOeffentlich) return raw
  return `# Kontakt\n\n${MUSTER_TEXTE.gallery.email} · Demo ök2 – nur Mustertexte, keine K2-Stammdaten.\n\n© ${PRODUCT_BRAND_NAME}\n\nQR zur Demo (ök2) unten.`
}

const DOCUMENTS = [
  { id: '01-deckblatt', name: 'Deckblatt', file: '01-DECKBLATT.md' },
  { id: '00-index', name: 'Inhaltsverzeichnis', file: '00-INDEX.md' },
  { id: '02-was-ist', name: 'Was ist die K2 Galerie', file: '02-WAS-IST-K2-GALERIE.md' },
  { id: '03-fuer-wen', name: 'Für wen', file: '03-FUER-WEN.md' },
  { id: '04-willkommen', name: 'Willkommen und Galerie', file: '04-WILLKOMMEN-UND-GALERIE.md' },
  { id: '05-werke', name: 'Werke erfassen', file: '05-WERKE-ERFASSEN.md' },
  { id: '06-design', name: 'Design und Veröffentlichung', file: '06-DESIGN-VEROEFFENTLICHUNG.md' },
  { id: '14-statistik-werkkatalog', name: 'Statistik und Werkkatalog', file: '14-STATISTIK-WERKKATALOG.md' },
  { id: '07-kassa', name: 'Kassa und Verkauf', file: '07-KASSA-VERKAUF.md' },
  { id: '08-events', name: 'Events und Öffentlichkeitsarbeit', file: '08-EVENTS-OEFFENTLICHKEITSARBEIT.md' },
  { id: '09-vk2', name: 'Vereinsplattform VK2', file: '09-VEREINSPLATTFORM-VK2.md' },
  { id: '10-demo', name: 'Demo und Lizenz', file: '10-DEMO-LIZENZ.md' },
  { id: '11-empfehlung', name: 'Empfehlungsprogramm', file: '11-EMPFEHLUNGSPROGRAMM.md' },
  { id: '12-technik', name: 'Technik', file: '12-TECHNIK.md' },
  { id: '13-kontakt', name: 'Kontakt', file: '13-KONTAKT.md' },
] as const

const FALLBACK_ROUTE = PROJECT_ROUTES['k2-galerie'].praesentationsmappe

export default function PraesentationsmappeVollversionPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
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

  const returnTo = searchParams.get('returnTo')
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()
  const pageTitle = 'Präsentationsmappe'
  const pageSubtitle =
    'Handbuch-Struktur, Marketing-Stil; Fokus Mein Weg & sechs Sparten. Screenshots unter /img/oeffentlich/.'

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
    const fileToLoad = docFromUrl && DOCUMENTS.some((d) => d.file === docFromUrl)
      ? docFromUrl
      : DOCUMENTS[0].file
    loadDocument(fileToLoad)
  }, [searchParams, isMobile, isOeffentlich])

  useEffect(() => {
    const needQr = selectedDoc === '13-KONTAKT.md' || fullPrintView
    if (!needQr) {
      setQrOek2DataUrl('')
      return
    }
    QRCode.toDataURL(buildQrUrlWithBust(OEK2_URL, qrVersionTs), { width: 140, margin: 1 })
      .then(setQrOek2DataUrl)
      .catch(() => setQrOek2DataUrl(''))
  }, [selectedDoc, fullPrintView, qrVersionTs])

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
        if (filename === '13-KONTAKT.md') text = patchKontaktMarkdownForContext(text, isOeffentlich)
        setDocContent(text)
      } else {
        setDocContent(`# Dokument nicht gefunden\n\nDie Datei konnte nicht geladen werden.`)
      }
    } catch {
      setDocContent(`# Fehler beim Laden\n\nBitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.`)
    } finally {
      setLoading(false)
    }
  }

  const loadAllDocuments = async (forPrint: boolean) => {
    setLoadingFullPrint(true)
    try {
      const contents: string[] = []
      for (const doc of DOCUMENTS) {
        const response = await fetch(`${BASE}/${doc.file}`)
        let text = response.ok ? await response.text() : `# ${doc.name}\n\nDokument nicht geladen.`
        if (doc.file === '13-KONTAKT.md') text = patchKontaktMarkdownForContext(text, isOeffentlich)
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
    if (!isMobile || allDocContents.length > 0) return
    loadAllDocuments(false)
  }, [isMobile, allDocContents.length])

  const renderInline = (s: string): ReactNode => {
    const parts: ReactNode[] = []
    let rest = s
    let key = 0
    while (rest.length > 0) {
      const bold = rest.match(/^\*\*([^*]+)\*\*/)
      const em = rest.match(/^\*([^*]+)\*/)
      if (bold) {
        parts.push(<strong key={key++}>{bold[1]}</strong>)
        rest = rest.slice(bold[0].length)
      } else if (em) {
        parts.push(<em key={key++}>{em[1]}</em>)
        rest = rest.slice(em[0].length)
      } else {
        const nextB = rest.indexOf('**')
        const nextE = rest.indexOf('*')
        const next = nextB >= 0 && (nextE < 0 || nextB <= nextE) ? nextB : nextE
        if (next < 0) {
          parts.push(rest)
          break
        }
        parts.push(rest.slice(0, next))
        rest = rest.slice(next)
      }
    }
    return parts.length === 1 ? parts[0] : <>{parts}</>
  }

  const renderMarkdown = (text: string, chapterNumber?: number, onDocLink?: (path: string) => void, keyPrefix = 'pmv') => {
    const lines = text.split('\n')
    const out: ReactNode[] = []
    let i = 0
    let firstH1Done = false
    const key = () => `${keyPrefix}-${i}`

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      if (trimmed === '') {
        out.push(<div key={key()} className="pmv-leerzeile" aria-hidden />)
        i++; continue
      }
      if (trimmed.toUpperCase() === '[SEITENUMBRUCH]') {
        out.push(<div key={key()} className="pmv-seitenumbruch" aria-hidden><span className="pmv-seitenumbruch-label">— Seitenumbruch —</span></div>)
        i++; continue
      }
      const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
      if (imgMatch) {
        const [, alt, src] = imgMatch
        const url = src.startsWith('http') ? src : src.startsWith('/') ? src : `${BASE}/${src}`
        out.push(<p key={key()} className="pmv-p pmv-p-with-img"><img src={url} alt={alt || 'Screenshot'} className="pmv-img" style={{ maxWidth: '100%', height: 'auto', border: '1px solid #e5e7eb', borderRadius: 8 }} /></p>)
        i++; continue
      }
      if (line.startsWith('# ')) {
        const title = line.substring(2).trim()
        const displayTitle = (chapterNumber != null && !firstH1Done) ? `${chapterNumber}. ${title}` : title
        if (!firstH1Done) firstH1Done = true
        out.push(<h1 key={key()} className="pmv-h1">{displayTitle}</h1>)
        i++; continue
      }
      if (line.startsWith('## ')) {
        out.push(<h2 key={key()} className="pmv-h2">{line.substring(3).trim()}</h2>)
        i++; continue
      }
      if (line.startsWith('### ')) {
        out.push(<h3 key={key()} className="pmv-h3">{line.substring(4).trim()}</h3>)
        i++; continue
      }
      if (trimmed === '---' || /^---+$/.test(trimmed)) {
        out.push(<hr key={key()} className="pmv-hr" />)
        i++; continue
      }
      if (line.startsWith('|') && line.includes('|', 1)) {
        const rows: string[][] = []
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          const row = lines[i].split('|').map((c) => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          const isSep = row.length > 0 && row.every((c) => /^[-:\s]+$/.test(c))
          if (row.length > 0 && !isSep) rows.push(row)
          i++
        }
        if (rows.length > 0) {
          const [head, ...body] = rows
          out.push(
            <div key={key()} className="pmv-table-wrap">
              <table className="pmv-table">
                {head && <thead><tr>{head.map((c, j) => <th key={j}>{c}</th>)}</tr></thead>}
                <tbody>{body.map((row, r) => <tr key={r}>{row.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )
        }
        continue
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const items: ReactNode[] = []
        while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
          items.push(<li key={items.length} className="pmv-li">{lines[i].substring(2).trim()}</li>)
          i++
        }
        out.push(<ul key={key()} className="pmv-ul">{items}</ul>)
        continue
      }
      const numLinkMatch = line.match(/^(\d+\.)\s+\[([^\]]+)\]\(([^)]+)\)/)
      if (numLinkMatch) {
        const [, num, title, path] = numLinkMatch
        const isInternalDoc = path.endsWith('.md') && !path.startsWith('http')
        if (isInternalDoc && onDocLink) {
          out.push(<p key={key()} className="pmv-p">{num}{' '}<a href="#" className="pmv-link" onClick={(e) => { e.preventDefault(); onDocLink(path) }}>{title}</a></p>)
        } else {
          const href = path.startsWith('http') ? path : `${BASE}/${path}`
          out.push(<p key={key()} className="pmv-p">{num} <a href={href} className="pmv-link" target={path.startsWith('http') ? '_blank' : undefined} rel={path.startsWith('http') ? 'noopener noreferrer' : undefined}>{title}</a></p>)
        }
        i++; continue
      }
      if (line.startsWith('[') && line.includes('](')) {
        const match = line.match(/^\[([^\]]+)\]\(([^)]+)\)/)
        if (match) {
          const path = match[2]
          const isInternalDoc = path.endsWith('.md') && !path.startsWith('http')
          if (isInternalDoc && onDocLink) {
            out.push(<p key={key()} className="pmv-p"><a href="#" className="pmv-link" onClick={(e) => { e.preventDefault(); onDocLink(path) }}>{match[1]}</a></p>)
          } else {
            const href = path.startsWith('http') ? path : `${BASE}/${path}`
            out.push(<p key={key()} className="pmv-p"><a href={href} className="pmv-link" target={path.startsWith('http') ? '_blank' : undefined} rel={path.startsWith('http') ? 'noopener noreferrer' : undefined}>{match[1]}</a></p>)
          }
          i++; continue
        }
      }
      out.push(<p key={key()} className="pmv-p">{renderInline(line)}</p>)
      i++
    }
    return out
  }

  const handleZurueck = () => {
    if (returnTo) {
      try {
        const u = new URL(returnTo)
        if (u.origin === window.location.origin) navigate(u.pathname + u.search)
        else window.location.href = returnTo
      } catch {
        navigate(returnTo)
      }
      return
    }
    navigate(FALLBACK_ROUTE)
  }

  /** Deckblatt außen: K2 Galerie groß, Slogans, kgm solution dezent als Copyright. Header-Höhe inhaltabhängig, kein Abschneiden. */
  const renderDeckblattCover = () => {
    const deckTitle = isOeffentlich
      ? MUSTER_TEXTE.gallery.firmenname || TENANT_CONFIGS.oeffentlich.galleryName
      : K2_GALERIE_PUBLIC_BRAND
    const g =
      typeof window !== 'undefined'
        ? (loadStammdaten(isOeffentlich ? 'oeffentlich' : 'k2', 'gallery') as Record<string, string | undefined>)
        : undefined
    const welcomeRaw = g?.welcomeImage?.trim() || ''
    const deckImg = isOeffentlich
      ? getOek2WelcomeImageEffective(welcomeRaw)
      : welcomeRaw || DECKBLATT_WILLKOMMENSBILD
    return (
      <div className="pmv-deckblatt-cover" lang="de">
        <div className="pmv-deckblatt-header">
          <h1 className="pmv-cover-title">{deckTitle}</h1>
          <p className="pmv-cover-slogan1">{PRODUCT_WERBESLOGAN}</p>
          <p className="pmv-cover-slogan2">{PRODUCT_WERBESLOGAN_2}</p>
          <p className="pmv-cover-copyright">© {PRODUCT_BRAND_NAME}</p>
        </div>
        <div className="pmv-cover-img-wrap">
          <img
            src={deckImg}
            alt={isOeffentlich ? 'Willkommensseite Demo-Galerie (ök2)' : 'Willkommensseite der K2 Galerie'}
            className="pmv-cover-img"
          />
        </div>
      </div>
    )
  }

  const styles = `
    .pmv-wrap { max-width: 52rem; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 1rem; }
    .pmv-wrap .pmv-h1 { font-size: 1.75rem; margin: 1.5rem 0 0.75rem; color: #1c1a18; font-weight: 600; }
    .pmv-wrap .pmv-h2 { font-size: 1.35rem; margin: 1.25rem 0 0.5rem; color: #0d9488; font-weight: 600; }
    .pmv-wrap .pmv-h3 { font-size: 1.15rem; margin: 1rem 0 0.4rem; color: #4b5563; }
    .pmv-wrap .pmv-hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.25rem 0; }
    .pmv-wrap .pmv-p { margin: 0 0 0.6rem; line-height: 1.7; color: #1c1a18; }
    .pmv-wrap .pmv-ul { margin: 0.5rem 0 0.75rem 1.5rem; padding-left: 0.5rem; }
    .pmv-wrap .pmv-li { margin-bottom: 0.35rem; line-height: 1.6; color: #1c1a18; }
    .pmv-wrap .pmv-link { color: #0d9488; text-decoration: underline; }
    .pmv-wrap .pmv-link:hover { color: #0f766e; }
    .pmv-wrap .pmv-img { max-width: 100%; height: auto; border-radius: 8px; }
    .pmv-seitenumbruch { margin: 1rem 0; padding: 0.5rem 0; border-top: 1px dashed #d1d5db; }
    .pmv-seitenumbruch-label { font-size: 0.8rem; color: #9ca3af; }
    .pmv-leerzeile { height: 0.75rem; }
    .pmv-seitenfuss { display: none; }
    .pmv-chapter-block { margin-bottom: 2rem; }
    .pmv-chapter-block.pmv-chapter-first { margin-top: 0; }
    .pmv-deckblatt-cover { text-align: center; padding: 0 1.5rem 2.5rem; background: #fff; color: #1c1a18; border-radius: 12px; margin-bottom: 2rem; }
    .pmv-deckblatt-cover .pmv-deckblatt-header { background: linear-gradient(180deg, #0c5c55 0%, #0f766e 100%); color: #fff; padding: 2rem 1rem 2rem; margin: 0 -1.5rem 0; border-radius: 12px 12px 0 0; min-height: 8rem; display: flex; flex-direction: column; justify-content: center; align-items: center; overflow: visible; }
    @media (max-width: 768px) {
      .pmv-wrap { padding-left: 1rem !important; padding-right: 1rem !important; font-size: 16px; }
      .pmv-wrap .pmv-h1 { font-size: 1.5rem; margin: 1.25rem 0 0.6rem; }
      .pmv-wrap .pmv-h2 { font-size: 1.25rem; margin: 1rem 0 0.45rem; }
      .pmv-wrap .pmv-h3 { font-size: 1.1rem; margin: 0.9rem 0 0.35rem; }
      .pmv-wrap .pmv-p { font-size: 1rem; line-height: 1.65; margin-bottom: 0.75rem; }
      .pmv-wrap .pmv-li { font-size: 1rem; line-height: 1.6; margin-bottom: 0.4rem; }
      .pmv-wrap .pmv-ul { margin-left: 1.25rem; padding-left: 0.5rem; }
      .pmv-deckblatt-cover { padding: 0 1rem 2rem; }
      .pmv-deckblatt-cover .pmv-deckblatt-header { padding: 1.5rem 0.75rem 1.5rem; margin: 0 -1rem 0; min-height: 9rem; }
      .pmv-deckblatt-cover .pmv-cover-title { font-size: 1.75rem; }
      .pmv-deckblatt-cover .pmv-cover-copyright { font-size: 0.75rem; }
      .pmv-deckblatt-cover .pmv-cover-slogan1 { font-size: 1rem; }
      .pmv-deckblatt-cover .pmv-cover-slogan2 { font-size: 0.95rem; }
      .pmv-mobile-stack { display: flex !important; flex-direction: column !important; }
      .pmv-mobile-stack .pmv-nav { position: static !important; order: 0; }
      .pmv-mobile-stack .pmv-article { order: 1; padding: 1rem !important; min-height: auto !important; }
      .pmv-scroll-mobile { min-height: 0; overflow: visible !important; }
    }
    .pmv-deckblatt-cover .pmv-cover-title { font-size: 2.5rem; font-weight: 700; margin: 0 0 0.5rem; letter-spacing: 0.02em; color: #fff; }
    .pmv-deckblatt-cover .pmv-cover-slogan1 { font-size: 1.15rem; font-weight: 600; margin: 0 0 0.25rem; color: #fff; opacity: 0.98; }
    .pmv-deckblatt-cover .pmv-cover-slogan2 { font-size: 1rem; margin: 0 0 0.25rem; color: #fff; opacity: 0.95; }
    .pmv-deckblatt-cover .pmv-cover-copyright { font-size: 0.8rem; margin: 0.5rem 0 0; color: #fff; opacity: 0.85; font-weight: 400; }
    .pmv-deckblatt-cover .pmv-cover-img-wrap { margin: 1.5rem auto 0; max-width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
    .pmv-deckblatt-cover .pmv-cover-img { width: 100%; height: auto; display: block; vertical-align: top; }
    @media print {
      .pmv-deckblatt-cover { -webkit-print-color-adjust: exact; print-color-adjust: exact; page-break-after: always !important; padding: 12mm 15mm 15mm !important; background: #fff !important; min-height: 240mm; box-sizing: border-box; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: flex-start !important; }
      .pmv-deckblatt-cover .pmv-deckblatt-header { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: #0c5c55 !important; min-height: auto; padding: 10mm 12mm 12mm !important; margin: -12mm -15mm 12mm -15mm !important; border-radius: 0 !important; }
      .pmv-deckblatt-cover .pmv-cover-title { font-size: 24pt !important; margin-bottom: 0.35em !important; color: #fff !important; font-weight: 700 !important; }
      .pmv-deckblatt-cover .pmv-cover-copyright { font-size: 8pt !important; margin-top: 0.4em !important; color: #fff !important; }
      .pmv-deckblatt-cover .pmv-cover-slogan1 { font-size: 12pt !important; margin-bottom: 0.15em !important; color: #fff !important; font-weight: 600 !important; }
      .pmv-deckblatt-cover .pmv-cover-slogan2 { font-size: 11pt !important; margin-bottom: 0 !important; color: #fff !important; }
      .pmv-deckblatt-cover .pmv-cover-img-wrap { flex: 1; max-width: 95%; min-height: 0; }
      .pmv-deckblatt-cover .pmv-cover-img { max-height: 180mm; width: auto; margin: 0 auto; object-fit: contain; }
      /* Kein erzwungener Umbruch pro Kapitel – Inhalt fließt, weniger Leerseiten */
      .pmv-chapter-block { page-break-before: auto !important; }
      .pmv-chapter-block.pmv-chapter-first { page-break-before: auto !important; }
      .pmv-no-print { display: none !important; }
      .pmv-wrap .pmv-seitenumbruch .pmv-seitenumbruch-label { display: none !important; }
      .pmv-wrap .pmv-seitenumbruch { page-break-before: always !important; margin: 0 !important; padding: 0 !important; border: none !important; min-height: 0 !important; }
      /* Lesbare Setzung: 10pt, ausreichend Zeilenabstand, Silbentrennung */
      .pmv-wrap .pmv-h1 { font-size: 12pt !important; margin: 1.2em 0 0.4em !important; color: #1c1a18 !important; font-weight: 600 !important; page-break-after: avoid !important; }
      .pmv-wrap .pmv-h2 { font-size: 11pt !important; margin: 1em 0 0.35em !important; color: #0f766e !important; font-weight: 700 !important; page-break-after: avoid !important; }
      .pmv-wrap .pmv-h3 { font-size: 10pt !important; margin: 0.8em 0 0.3em !important; color: #1c1a18 !important; page-break-after: avoid !important; }
      .pmv-wrap .pmv-p { margin: 0 0 0.5em !important; line-height: 1.45 !important; font-size: 10pt !important; color: #1c1a18 !important; text-align: justify !important; hyphens: auto !important; -webkit-hyphens: auto !important; hyphenate-limit-chars: 6 4 2 !important; orphans: 2 !important; widows: 2 !important; }
      .pmv-wrap .pmv-ul { margin: 0.4em 0 0.6em 1.25em !important; padding-left: 0.4em !important; }
      .pmv-wrap .pmv-li { margin-bottom: 0.25em !important; line-height: 1.45 !important; font-size: 10pt !important; }
      .pmv-wrap .pmv-hr { margin: 0.6em 0 !important; }
      .pmv-wrap .pmv-leerzeile { height: 0.25em !important; }
      .pmv-wrap .pmv-img { max-width: 100% !important; height: auto !important; border-radius: 4px; -webkit-print-color-adjust: exact; print-color-adjust: exact; page-break-inside: avoid !important; }
      .pmv-wrap .pmv-p-with-img { page-break-inside: avoid !important; }
      .pmv-wrap .pmv-table-wrap { margin: 0.5em 0 !important; page-break-inside: avoid !important; }
      .pmv-wrap .pmv-table th, .pmv-wrap .pmv-table td { padding: 0.2em 0.4em !important; font-size: 9pt !important; }
      .pmv-wrap article { padding: 0 0 12mm !important; border: none !important; box-shadow: none !important; }
      .pmv-seitenfuss { display: block !important; position: fixed; bottom: 0; left: 0; right: 0; width: 100%; min-height: 6mm; padding: 2mm 8mm; font-size: 9pt; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #000 !important; background: #fff !important; border-top: 1px solid #ccc; line-height: 1.3; -webkit-print-color-adjust: exact; print-color-adjust: exact; z-index: 99999; }
      .pmv-seitenfuss .pmv-seitenfuss-preview { display: none !important; }
      .pmv-seitenfuss::after { content: "Seite " counter(page) " von " counter(pages); color: #000 !important; }
      @page { margin: 15mm 18mm 18mm 18mm; size: A4; background: white; }
      html, body { background: #fff !important; color: #1c1a18 !important; }
      .pmv-wrap { background: #fff !important; padding: 0 !important; }
    }
  `

  const currentDocName = DOCUMENTS.find((d) => d.file === selectedDoc)?.name ?? 'Präsentationsmappe'

  return (
    <div className="pmv-wrap" lang="de" style={{ padding: '1.5rem 1rem', background: '#fffefb', minHeight: '100vh', color: '#1c1a18' }}>
      <style>{styles}</style>

      <header className="pmv-no-print" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1c1a18', fontWeight: 600 }}>📁 {pageTitle}</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#6b7280' }}>
          {fullPrintView ? 'Alle Kapitel mit Bildern – zum Drucken' : (isMobile && allDocContents.length > 0) ? 'Alle Kapitel – durchscrollen bis zur letzten Seite' : pageSubtitle}
        </p>
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
              <button type="button" onClick={handleZurueck} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#1c1a18', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                ← Zurück
              </button>
            </>
          )}
        </div>
      </header>

      {(fullPrintView || (isMobile && allDocContents.length > 0)) ? (
        <article className="pmv-scroll-mobile" style={{ background: '#fff', padding: '1.5rem 2rem', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'visible' }}>
          {allDocContents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Keine Kapitel geladen.</div>
          ) : (
            DOCUMENTS.map((doc, idx) => (
              <div key={doc.file} className={idx === 0 ? 'pmv-chapter-block pmv-chapter-first' : 'pmv-chapter-block'}>
                {doc.file === '01-DECKBLATT.md'
                  ? renderDeckblattCover()
                  : renderMarkdown(allDocContents[idx] ?? '', idx > 0 ? idx : undefined, (path) => { setFullPrintView(false); loadDocument(path); }, `ch${idx}`)}
                {doc.file === '13-KONTAKT.md' && qrOek2DataUrl && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <img src={qrOek2DataUrl} alt="QR zur Demo (ök2)" style={{ display: 'block', width: 140, height: 140 }} />
                  </div>
                )}
              </div>
            ))
          )}
        </article>
      ) : isMobile && loadingFullPrint ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Mappe wird geladen…</div>
      ) : (
        <div className="pmv-mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 200px) 1fr', gap: '1.5rem' }}>
          <nav className="pmv-no-print pmv-nav" style={{ background: '#f0fdfa', padding: '1rem', borderRadius: 12, border: '1px solid #99f6e4', height: 'fit-content', position: 'sticky', top: '1rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#0d9488', fontWeight: 600 }}>Kapitel</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {DOCUMENTS.map((doc, index) => (
                <button
                  key={doc.id}
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
                    fontWeight: selectedDoc === doc.file ? 600 : 400
                  }}
                >
                  {index === 0 ? doc.name : `${index}. ${doc.name}`}
                </button>
              ))}
            </div>
          </nav>

          <article className="pmv-article" style={{ background: '#fff', padding: '1.5rem 2rem', borderRadius: 12, border: '1px solid #e5e7eb', minHeight: 400 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Lade Kapitel...</div>
            ) : (
              <div>
                {selectedDoc === '01-DECKBLATT.md'
                  ? renderDeckblattCover()
                  : renderMarkdown(docContent, (() => { const idx = DOCUMENTS.findIndex((d) => d.file === selectedDoc); return idx > 0 ? idx : undefined; })(), (path) => loadDocument(path))}
                {selectedDoc === '13-KONTAKT.md' && qrOek2DataUrl && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                    <img src={qrOek2DataUrl} alt="QR zur Demo (ök2)" style={{ display: 'block', width: 140, height: 140 }} />
                  </div>
                )}
              </div>
            )}
          </article>
        </div>
      )}
      <div className="pmv-seitenfuss pmv-wrap" aria-hidden>
        <span className="pmv-seitenfuss-preview">Präsentationsmappe · (Seitenzahlen beim Drucken)</span>
      </div>
    </div>
  )
}
