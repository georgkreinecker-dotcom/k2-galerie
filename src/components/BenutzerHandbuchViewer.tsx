/**
 * Gemeinsame Darstellung für Benutzerhandbücher (Markdown unter public/…).
 * Verwendet von K2 Galerie und K2 Familie – jeweils eigener Ordner und Kapitel.
 */

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { BASE_APP_URL, OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE } from '../config/navigation'
import { useQrVersionTimestamp, useStableQrBustedUrl } from '../hooks/useServerBuildTimestamp'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG, PRODUCT_LIZENZ_ANFRAGE_EMAIL } from '../config/tenantConfig'

/** Wie PräsentationsmappePage / Drucksorten – kräftiges Teal für Deckblätter */
const TEAL_DECKBLATT_BG = '#0c5c55'

export type BenutzerHandbuchDoc = { id: string; name: string; file: string }

export type BenutzerHandbuchViewerProps = {
  /** z. B. /benutzer-handbuch oder /k2-familie-handbuch */
  handbuchBase: string
  documents: readonly BenutzerHandbuchDoc[]
  fallbackRoute: string
  /** Voller Pfad für Zurück-Fallback, z. B. /benutzer-handbuch */
  routePathForBack: string
  headerTitle: string
  headerSubtitle: string
  printHintFolder: string
  deckblattTop: string
  deckblattSlogan: string
  deckblattMainTitle: string
  deckblattFooterProduct: string
  deckblattFooterKind: string
  deckblattFooterTagline: string
  footerPreviewLine: string
  printCurrentDocPrefix: string
  /** Ohne `?doc=` in der URL dieses Kapitel laden (z. B. Inhaber-Text statt nur Inhaltsverzeichnis). */
  defaultDocWhenNoParam?: string
  /** Optional: Deckblatt in der Druckvorschau als volle A4-Seite mit Bild (z. B. App-Eingang) statt Text-Gradient. */
  deckblattCoverImageSrc?: string
  deckblattCoverAlt?: string
  deckblattCoverCaption?: string
  /** Optional: zweite Zeile unter dem Slogan (Werbebotschaft / Tagline). */
  deckblattKernsatz?: string
  /** Deckblatt wie andere Präsentationsmappen: Teal/Weiß, ein A4-Kopf – kein Screenshot. */
  deckblattTealCover?: boolean
  /** Großer QR zur Plattform-Startseite Entdecken (Eingangstor), Lesansicht + Druckvorschau. */
  prominentEingangstorQr?: boolean
}

const HANDBUCH_DOC_PARAM = 'doc'

const EINGANGSTOR_ABS_URL = `${BASE_APP_URL}${OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE}`

/** QR zum Eingangstor (Entdecken) – Server-Stand + Bust wie Werbeunterlagen. */
function EingangstorQrBlock({ variant }: { variant: 'screen' | 'print' }) {
  const { versionTimestamp } = useQrVersionTimestamp()
  const { qrUrl } = useStableQrBustedUrl(EINGANGSTOR_ABS_URL, versionTimestamp)
  const [dataUrl, setDataUrl] = useState('')
  useEffect(() => {
    let cancelled = false
    const w = variant === 'screen' ? 220 : 160
    QRCode.toDataURL(qrUrl, { width: w, margin: 1 }).then((u) => {
      if (!cancelled) setDataUrl(u)
    })
    return () => {
      cancelled = true
    }
  }, [qrUrl, variant])

  const textBlock = (
    <div style={{ flex: '1 1 220px', minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: TEAL_DECKBLATT_BG }}>
        Plattform
      </p>
      <h2
        style={{
          margin: variant === 'screen' ? '0.35rem 0 0.5rem' : '0.25rem 0 0.35rem',
          fontSize: variant === 'screen' ? '1.35rem' : '1.1rem',
          fontWeight: 700,
          color: '#1c1a18',
          lineHeight: 1.25,
        }}
      >
        Zum Eingangstor
      </h2>
      <p style={{ margin: 0, fontSize: variant === 'screen' ? '0.95rem' : '0.85rem', color: '#5c5650', lineHeight: 1.5 }}>
        Scannt den QR-Code mit dem Handy – öffnet die Startseite Entdecken (Plattform).
      </p>
      <a
        href={qrUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          marginTop: variant === 'screen' ? '0.75rem' : '0.5rem',
          fontSize: '0.85rem',
          color: TEAL_DECKBLATT_BG,
          fontWeight: 600,
          textDecoration: 'underline',
        }}
      >
        Link im Browser öffnen
      </a>
    </div>
  )

  const qrSize = variant === 'screen' ? 220 : 160
  const qrBlock = (
    <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="QR-Code zum Eingangstor Entdecken"
          width={qrSize}
          height={qrSize}
          style={{ display: 'block', width: qrSize, height: qrSize, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}
        />
      ) : (
        <div
          style={{
            width: qrSize,
            height: qrSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f3f4f6',
            borderRadius: 8,
            fontSize: '0.85rem',
            color: '#6b7280',
            margin: '0 auto',
          }}
        >
          QR wird geladen…
        </div>
      )}
      <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#6b7280' }}>k2-galerie.vercel.app · Entdecken</p>
    </div>
  )

  if (variant === 'screen') {
    return (
      <div
        className="benutzer-no-print benutzer-eingangstor-qr-prominent"
        style={{
          maxWidth: '1100px',
          margin: '0 auto 1.25rem',
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #f0fdf9 0%, #fffefb 100%)',
          border: `2px solid ${TEAL_DECKBLATT_BG}`,
          borderRadius: 12,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          boxShadow: '0 4px 20px rgba(12, 92, 85, 0.12)',
        }}
      >
        {textBlock}
        {qrBlock}
      </div>
    )
  }

  return (
    <section
      className="benutzer-druck-kapitel benutzer-eingangstor-qr-print"
      style={{
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
        border: `2px solid ${TEAL_DECKBLATT_BG}`,
        borderRadius: 8,
        padding: '0.85rem 1rem',
        marginBottom: '1rem',
        background: '#f9fafb',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '1rem',
        justifyContent: 'space-between',
      }}
    >
      {textBlock}
      {qrBlock}
    </section>
  )
}

export default function BenutzerHandbuchViewer({
  handbuchBase,
  documents,
  fallbackRoute,
  routePathForBack,
  headerTitle,
  headerSubtitle,
  printHintFolder,
  deckblattTop,
  deckblattSlogan,
  deckblattMainTitle,
  deckblattFooterProduct,
  deckblattFooterKind,
  deckblattFooterTagline,
  footerPreviewLine,
  printCurrentDocPrefix,
  defaultDocWhenNoParam,
  deckblattCoverImageSrc,
  deckblattCoverAlt,
  deckblattCoverCaption,
  deckblattKernsatz,
  deckblattTealCover,
  prominentEingangstorQr,
}: BenutzerHandbuchViewerProps) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [docContent, setDocContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [printPreview, setPrintPreview] = useState(false)
  const [allDocContents, setAllDocContents] = useState<Record<string, string>>({})
  const [printPreviewLoading, setPrintPreviewLoading] = useState(false)
  const backFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const returnTo = searchParams.get('returnTo')

  const handleZurueck = () => {
    if (backFallbackRef.current) {
      clearTimeout(backFallbackRef.current)
      backFallbackRef.current = null
    }
    if (returnTo) {
      try {
        const u = new URL(returnTo)
        if (u.origin === window.location.origin) {
          navigate(u.pathname + u.search)
        } else {
          window.location.href = returnTo
        }
      } catch {
        navigate(returnTo)
      }
      return
    }
    window.history.back()
    backFallbackRef.current = setTimeout(() => {
      backFallbackRef.current = null
      const p = window.location.pathname
      if (p === routePathForBack || p.endsWith(routePathForBack.replace(/^\//, ''))) {
        navigate(fallbackRoute)
      }
    }, 150)
  }

  useEffect(() => {
    const onPopState = () => {
      if (backFallbackRef.current) {
        clearTimeout(backFallbackRef.current)
        backFallbackRef.current = null
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      if (backFallbackRef.current) clearTimeout(backFallbackRef.current)
    }
  }, [])

  const loadDocument = useCallback(async (filename: string) => {
    setLoading(true)
    setSelectedDoc(filename)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set(HANDBUCH_DOC_PARAM, filename)
      return next
    }, { replace: true })
    try {
      const response = await fetch(`${handbuchBase}/${filename}`)
      if (response.ok) {
        const text = await response.text()
        setDocContent(text)
      } else {
        setDocContent(`# Dokument nicht gefunden\n\nDie Datei konnte nicht geladen werden.`)
      }
    } catch {
      setDocContent(`# Fehler beim Laden\n\nBitte prüfe deine Internetverbindung und versuche es erneut.`)
    } finally {
      setLoading(false)
    }
  }, [handbuchBase, setSearchParams])

  useEffect(() => {
    const docFromUrl = searchParams.get(HANDBUCH_DOC_PARAM)
    const isValidFile = (f: string | null): f is string =>
      !!f && documents.some((d) => d.file === f)
    const defaultWhenEmpty =
      defaultDocWhenNoParam && documents.some((d) => d.file === defaultDocWhenNoParam)
        ? defaultDocWhenNoParam
        : documents[0]?.file
    let fileToLoad: string | undefined
    if (isValidFile(docFromUrl)) {
      fileToLoad = docFromUrl
    } else if (docFromUrl === null || docFromUrl === '') {
      fileToLoad = defaultWhenEmpty
    } else {
      fileToLoad = documents[0]?.file
    }
    if (fileToLoad) loadDocument(fileToLoad)
  }, [searchParams, documents, loadDocument, defaultDocWhenNoParam])

  useEffect(() => {
    if (!printPreview) return
    let cancelled = false
    setPrintPreviewLoading(true)
    const loadAll = async () => {
      const next: Record<string, string> = {}
      for (const doc of documents) {
        if (cancelled) return
        try {
          const res = await fetch(`${handbuchBase}/${doc.file}`)
          next[doc.file] = res.ok ? await res.text() : ''
        } catch {
          next[doc.file] = ''
        }
      }
      if (!cancelled) {
        setAllDocContents(next)
        setPrintPreviewLoading(false)
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [printPreview, documents, handbuchBase])

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

  const renderMarkdown = (text: string, chapterNumber?: number, onDocLink?: (path: string) => void) => {
    const lines = text.split('\n')
    const out: ReactNode[] = []
    let i = 0
    let firstH1Done = false
    const key = () => `bh-${i}`

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      if (trimmed === '') {
        out.push(<div key={key()} className="benutzer-leerzeile" aria-hidden />)
        i++; continue
      }
      const imgLine = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
      if (imgLine) {
        const alt = imgLine[1].trim()
        const rawSrc = imgLine[2].trim()
        const src =
          rawSrc.startsWith('http://') || rawSrc.startsWith('https://') || rawSrc.startsWith('/')
            ? rawSrc
            : `${handbuchBase.replace(/\/$/, '')}/${rawSrc.replace(/^\//, '')}`
        out.push(
          <figure key={key()} className="benutzer-figure">
            <img src={src} alt={alt || 'Abbildung'} className="benutzer-md-img" loading="lazy" decoding="async" />
          </figure>,
        )
        i++; continue
      }
      if (trimmed.toUpperCase() === '[SEITENUMBRUCH]') {
        out.push(<div key={key()} className="benutzer-seitenumbruch" aria-hidden><span className="benutzer-seitenumbruch-label">— Abschnitt —</span></div>)
        i++; continue
      }
      if (line.startsWith('# ')) {
        const title = line.substring(2).trim()
        const displayTitle = (chapterNumber != null && !firstH1Done) ? `${chapterNumber}. ${title}` : title
        if (!firstH1Done) firstH1Done = true
        out.push(<h1 key={key()} className="benutzer-h1">{displayTitle}</h1>)
        i++; continue
      }
      if (line.startsWith('## ')) {
        out.push(<h2 key={key()} className="benutzer-h2">{line.substring(3).trim()}</h2>)
        i++; continue
      }
      if (line.startsWith('### ')) {
        out.push(<h3 key={key()} className="benutzer-h3">{line.substring(4).trim()}</h3>)
        i++; continue
      }
      if (trimmed === '---' || /^---+$/.test(trimmed)) {
        out.push(<hr key={key()} className="benutzer-hr" />)
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
            <div key={key()} className="benutzer-table-wrap">
              <table className="benutzer-table">
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
          items.push(<li key={items.length} className="benutzer-li">{lines[i].substring(2).trim()}</li>)
          i++
        }
        out.push(<ul key={key()} className="benutzer-ul">{items}</ul>)
        continue
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.includes('\n')) {
        out.push(<p key={key()} className="benutzer-strong">{trimmed.slice(2, -2)}</p>)
        i++; continue
      }
      if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.includes('**')) {
        out.push(<p key={key()} className="benutzer-em">{trimmed.slice(1, -1)}</p>)
        i++; continue
      }
      const numLinkMatch = line.match(/^(\d+\.)\s+\[([^\]]+)\]\(([^)]+)\)/)
      if (numLinkMatch) {
        const [, num, title, path] = numLinkMatch
        const isInternalDoc = path.endsWith('.md') && !path.startsWith('http')
        if (isInternalDoc && onDocLink) {
          out.push(
            <p key={key()} className="benutzer-p">
              {num}{' '}
              <a href="#" className="benutzer-link" onClick={(e) => { e.preventDefault(); onDocLink(path) }}>{title}</a>
            </p>
          )
        } else {
          const href = path.startsWith('http') ? path : `${handbuchBase}/${path}`
          out.push(<p key={key()} className="benutzer-p">{num} <a href={href} className="benutzer-link" target={path.startsWith('http') ? '_blank' : undefined} rel={path.startsWith('http') ? 'noopener noreferrer' : undefined}>{title}</a></p>)
        }
        i++; continue
      }
      if (line.startsWith('[') && line.includes('](')) {
        const match = line.match(/^\[([^\]]+)\]\(([^)]+)\)/)
        if (match) {
          const path = match[2]
          const isInternalDoc = path.endsWith('.md') && !path.startsWith('http')
          if (isInternalDoc && onDocLink) {
            out.push(
              <p key={key()} className="benutzer-p">
                <a href="#" className="benutzer-link" onClick={(e) => { e.preventDefault(); onDocLink(path) }}>{match[1]}</a>
              </p>
            )
          } else {
            const href = path.startsWith('http') ? path : `${handbuchBase}/${path}`
            out.push(<p key={key()} className="benutzer-p"><a href={href} className="benutzer-link" target={path.startsWith('http') ? '_blank' : undefined} rel={path.startsWith('http') ? 'noopener noreferrer' : undefined}>{match[1]}</a></p>)
          }
          i++; continue
        }
      }
      out.push(<p key={key()} className="benutzer-p">{renderInline(line)}</p>)
      i++
    }
    return out
  }

  const styles = `
    .benutzer-handbuch-wrapper { max-width: 52rem; margin: 0 auto; font-family: system-ui, sans-serif; }
    .benutzer-handbuch-wrapper .benutzer-h1 { font-size: 1.75rem; margin: 1.5rem 0 0.75rem; color: #1c1a18; font-weight: 600; }
    .benutzer-handbuch-wrapper .benutzer-h2 { font-size: 1.35rem; margin: 1.25rem 0 0.5rem; color: #374151; font-weight: 600; }
    .benutzer-handbuch-wrapper .benutzer-h3 { font-size: 1.15rem; margin: 1rem 0 0.4rem; color: #4b5563; }
    .benutzer-handbuch-wrapper .benutzer-hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.25rem 0; }
    .benutzer-seitenumbruch { margin: 1rem 0; padding: 0.5rem 0; border-top: 1px dashed #d1d5db; }
    .benutzer-seitenumbruch-label { font-size: 0.8rem; color: #9ca3af; }
    .benutzer-print-preview .benutzer-seitenumbruch { margin: 0.5rem 0; padding: 0.35rem 0; border-top: 1px dashed #9ca3af; }
    .benutzer-print-preview .benutzer-seitenumbruch-label { font-size: 0.8rem; color: #9ca3af; }
    .benutzer-handbuch-wrapper .benutzer-p { margin: 0 0 0.6rem; line-height: 1.7; color: #1c1a18; }
    .benutzer-handbuch-wrapper .benutzer-strong { font-weight: 700; margin: 0 0 0.4rem; color: #1c1a18; }
    .benutzer-handbuch-wrapper .benutzer-em { font-style: italic; margin: 0 0 0.5rem; color: #4b5563; }
    .benutzer-handbuch-wrapper .benutzer-ul { margin: 0.5rem 0 0.75rem 1.5rem; padding-left: 0.5rem; }
    .benutzer-handbuch-wrapper .benutzer-li { margin-bottom: 0.35rem; line-height: 1.6; color: #1c1a18; }
    .benutzer-handbuch-wrapper .benutzer-table-wrap { margin: 0.75rem 0; overflow-x: auto; }
    .benutzer-handbuch-wrapper .benutzer-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
    .benutzer-handbuch-wrapper .benutzer-table th, .benutzer-handbuch-wrapper .benutzer-table td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; color: #1c1a18; }
    .benutzer-handbuch-wrapper .benutzer-table th { background: #f3f4f6; font-weight: 600; }
    .benutzer-handbuch-wrapper .benutzer-link { color: #2563eb; text-decoration: underline; }
    .benutzer-handbuch-wrapper .benutzer-link:hover { color: #1d4ed8; }
    .benutzer-handbuch-wrapper .benutzer-figure { margin: 0.85rem 0; break-inside: avoid; }
    .benutzer-handbuch-wrapper .benutzer-md-img { display: block; max-width: 100%; height: auto; border-radius: 10px; border: 1px solid #e5e7eb; box-sizing: border-box; }
    .benutzer-handbuch-wrapper .benutzer-fussnote-block { break-inside: avoid; }
    .benutzer-handbuch-wrapper .benutzer-leerzeile { height: 0.75rem; }
    .benutzer-print-preview .benutzer-no-print { display: none !important; }
    .benutzer-print-preview .benutzer-handbuch-wrapper { padding: 0; background: #fff; }
    .benutzer-print-preview .benutzer-handbuch-grid { display: block !important; }
    .benutzer-print-preview .benutzer-handbuch-article { max-width: 100%; padding: 1rem 1.5rem; border: none; border-radius: 0; box-shadow: none; }
    .benutzer-print-preview .benutzer-druck-inhalt { font-size: 10.5pt; line-height: 1.5; }
    .benutzer-print-preview .benutzer-seitenfuss-zeile { display: block !important; margin-top: 1.5rem; padding-top: 0.5rem; border-top: 1px solid #e5e7eb; font-size: 0.8rem; color: #6b7280; }
    .benutzer-deckblatt-teal { background: ${TEAL_DECKBLATT_BG}; color: #fff; text-align: center; padding: clamp(1.5rem, 4vw, 2.5rem) 1.25rem; border-radius: 12px; margin-bottom: 1rem; page-break-after: always; page-break-inside: avoid; break-inside: avoid; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .benutzer-deckblatt-teal h2 { margin: 0; font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 700; color: #fff; letter-spacing: -0.02em; line-height: 1.2; }
    .benutzer-deckblatt-teal .benutzer-deckblatt-teal-slogan { margin: 0.75rem 0 0; font-size: clamp(1rem, 2.5vw, 1.15rem); font-weight: 600; color: #fff; line-height: 1.4; }
    .benutzer-deckblatt-teal .benutzer-deckblatt-teal-tagline { margin: 0.5rem 0 0; font-size: clamp(0.9rem, 2vw, 1rem); color: rgba(255,255,255,0.95); line-height: 1.5; }
    .benutzer-deckblatt-teal .benutzer-deckblatt-teal-meta { margin: 1rem 0 0; font-size: clamp(0.82rem, 1.8vw, 0.95rem); color: rgba(255,255,255,0.92); line-height: 1.35; }
    .benutzer-deckblatt-teal .benutzer-deckblatt-teal-footerline { margin: 0.5rem 0 0; font-size: 0.78rem; color: rgba(255,255,255,0.88); line-height: 1.35; }
    .benutzer-deckblatt-teal .benutzer-deckblatt-teal-copy { margin: 1.25rem 0 0; font-size: 0.75rem; color: rgba(255,255,255,0.85); }
    .benutzer-deckblatt-teal.benutzer-deckblatt-teal--mit-bild { page-break-after: avoid; margin-bottom: 0.5rem; padding: clamp(1rem, 3vw, 1.75rem) 1rem; }
    .benutzer-print-preview .benutzer-deckblatt-teal { margin-bottom: 0.75rem; border-radius: 8px; page-break-after: unset; }
    .benutzer-print-preview .benutzer-deckblatt-teal.benutzer-deckblatt-teal--mit-bild { page-break-after: avoid; margin-bottom: 0.5rem; }
    .benutzer-deckblatt { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 2rem; page-break-after: always; background: linear-gradient(160deg, #1c1a18 0%, #2d2a26 50%, #1c1a18 100%); color: #fff; }
    .benutzer-deckblatt--einstieg-a4 { background: #fff; color: #1c1a18; min-height: 0; padding: 0.75rem 0.5rem !important; page-break-after: always; }
    .benutzer-deckblatt-a4-inner { width: 100%; max-width: 210mm; margin: 0 auto; aspect-ratio: 210 / 297; max-height: min(90vh, 297mm); display: flex; align-items: center; justify-content: center; background: #f3f4f6; border: 1px solid #e5e7eb; box-sizing: border-box; }
    .benutzer-deckblatt--einstieg-a4 img { width: 100%; height: 100%; object-fit: contain; display: block; vertical-align: top; }
    .benutzer-deckblatt-einstieg-caption { margin: 0.5rem auto 0; max-width: 210mm; font-size: 0.8rem; color: #4b5563; text-align: center; line-height: 1.35; }
    .benutzer-deckblatt-cover-intro { max-width: 210mm; margin: 0 auto 1rem; padding: 0 0.5rem; text-align: center; page-break-after: avoid; break-inside: avoid; }
    .benutzer-deckblatt-cover-kernsatz { margin: 0 0 0.75rem; font-size: clamp(0.95rem, 2vw, 1.05rem); line-height: 1.55; color: #4b5563; font-weight: 500; }
    .benutzer-deckblatt-cover-slogan { margin: 0; font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 700; color: #1c1a18; letter-spacing: -0.02em; line-height: 1.2; }
    .benutzer-print-preview .benutzer-deckblatt-cover-intro { margin-bottom: 0.65rem; }
    .benutzer-druck-kapitel { page-break-before: auto; padding: 1.5rem 1.5rem 3rem; }
    .benutzer-druck-kapitel:first-of-type { page-break-before: auto; }
    .benutzer-impressum-seite { page-break-before: always; }
    .benutzer-handbuch-wrapper .seitenfuss { display: none; }
    .benutzer-print-preview .seitenfuss { display: block; position: fixed; bottom: 0; left: 0; right: 0; min-height: 28px; padding: 0.4rem 1.5rem; font-size: 0.8rem; color: #374151; background: #fff; border-top: 1px solid #e5e7eb; z-index: 99999; line-height: 1.3; }
    .benutzer-print-preview .seitenfuss .seitenfuss-preview { color: #6b7280; }
    .benutzer-print-preview .benutzer-deckblatt { min-height: auto; padding: 1.25rem 1.5rem; page-break-after: unset; margin-bottom: 0.5rem; border-radius: 12px; }
    .benutzer-print-preview .benutzer-deckblatt--einstieg-a4 { padding: 0.4rem 0 !important; margin-bottom: 0.75rem; border-radius: 0; page-break-after: unset; }
    .benutzer-print-preview .benutzer-deckblatt-a4-inner { max-height: none; border-radius: 8px; }
    .benutzer-print-preview .benutzer-deckblatt h1 { margin: 0.75rem 0 0.35rem; font-size: 1.4rem; }
    .benutzer-print-preview .benutzer-deckblatt .benutzer-deckblatt-fuss { margin-top: 1.25rem; padding-top: 1rem; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-h1 { font-size: 1.25rem; margin: 0.6rem 0 0.3rem; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-h2 { font-size: 1.1rem; margin: 0.5rem 0 0.25rem; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-h3 { font-size: 1rem; margin: 0.4rem 0 0.2rem; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-p { margin: 0 0 0.3rem; line-height: 1.45; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-hr { margin: 0.4rem 0; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-ul { margin: 0.25rem 0 0.4rem 1.25rem; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-li { margin-bottom: 0.15rem; }
    .benutzer-print-preview .benutzer-druck-kapitel { page-break-before: unset; padding: 0.4rem 0.75rem 0.15rem; }
    .benutzer-print-preview .benutzer-druck-kapitel:first-of-type { padding: 0.4rem 1rem 0.2rem; }
    .benutzer-print-preview .benutzer-druck-kapitel:first-of-type .benutzer-h1 { margin: 0.35rem 0 0.2rem; font-size: 1.15rem; }
    .benutzer-print-preview .benutzer-druck-kapitel:first-of-type .benutzer-h2 { margin: 0.25rem 0 0.2rem; font-size: 1rem; padding-bottom: 0.2rem; }
    .benutzer-print-preview .benutzer-druck-kapitel:first-of-type .benutzer-p { margin: 0 0 0.2rem; line-height: 1.4; }
    .benutzer-print-preview .benutzer-druck-kapitel:first-of-type .benutzer-hr { margin: 0.2rem 0; }
    .benutzer-print-preview .benutzer-druck-kapitel:first-of-type .benutzer-table-wrap { margin: 0.2rem 0; }
    .benutzer-print-preview .benutzer-druck-kapitel:first-of-type .benutzer-strong { margin: 0 0 0.15rem; }
    .benutzer-print-preview .benutzer-druck-kapitel h2 { font-size: 1.1rem; margin: 0 0 0.5rem; padding-bottom: 0.35rem; }
    .benutzer-print-preview .benutzer-leerzeile { height: 0.25rem; }
    .benutzer-print-preview .benutzer-impressum-seite { page-break-before: unset; }
    .benutzer-print-preview { background: #9ca3af !important; padding: 0.75rem 0.5rem !important; }
    .benutzer-print-preview .benutzer-handbuch-wrapper { max-width: none; }
    /* Kein min-height A4 + kein Streifenmuster – sonst wirken riesige Leerflächen in der Vorschau */
    .benutzer-print-preview .benutzer-a4-vorschau {
      width: 210mm;
      max-width: 100%;
      margin: 0 auto 1rem;
      min-height: 0;
      padding: 8mm 10mm 10mm;
      background: #fff;
      border: 1px solid #9ca3af;
      box-shadow: 0 2px 12px rgba(0,0,0,0.12);
      box-sizing: border-box;
    }
    @media (max-width: 768px) {
      .benutzer-handbuch-wrapper { padding: 0.75rem 0.5rem !important; }
      .benutzer-handbuch-wrapper .benutzer-header-wrap { flex-direction: column; align-items: stretch; gap: 0.75rem; margin-bottom: 1rem; }
      .benutzer-handbuch-wrapper .benutzer-header-wrap h1 { font-size: 1.25rem; }
      .benutzer-handbuch-wrapper .benutzer-header-wrap p { font-size: 0.85rem; }
      .benutzer-handbuch-wrapper .benutzer-header-wrap .benutzer-header-buttons { flex-direction: column; width: 100%; }
      .benutzer-handbuch-wrapper .benutzer-header-wrap .benutzer-header-buttons button { min-height: 44px; width: 100%; justify-content: center; }
      .benutzer-handbuch-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
      .benutzer-handbuch-wrapper .benutzer-nav { position: static !important; border-radius: 10px; padding: 0.75rem 1rem; }
      .benutzer-handbuch-wrapper .benutzer-nav h3 { font-size: 0.9rem; margin-bottom: 0.5rem; }
      .benutzer-handbuch-wrapper .benutzer-nav button { min-height: 44px; padding: 0.6rem 0.75rem; font-size: 0.9rem; width: 100%; text-align: left; }
      .benutzer-handbuch-article { padding: 1rem 1rem !important; min-height: 200px; border-radius: 10px; }
      .benutzer-handbuch-wrapper .benutzer-h1 { font-size: 1.4rem; margin: 1rem 0 0.5rem; }
      .benutzer-handbuch-wrapper .benutzer-h2 { font-size: 1.2rem; margin: 1rem 0 0.4rem; }
      .benutzer-handbuch-wrapper .benutzer-h3 { font-size: 1.05rem; margin: 0.75rem 0 0.35rem; }
      .benutzer-handbuch-wrapper .benutzer-p { font-size: 1rem; line-height: 1.6; margin: 0 0 0.5rem; }
      .benutzer-handbuch-wrapper .benutzer-li { margin-bottom: 0.4rem; }
      .benutzer-handbuch-wrapper .benutzer-table { font-size: 0.9rem; }
      .benutzer-handbuch-wrapper .benutzer-table th, .benutzer-handbuch-wrapper .benutzer-table td { padding: 0.4rem 0.5rem; }
      .benutzer-druckvorschau-leiste { left: 0.5rem; right: 0.5rem; transform: none; bottom: 1rem; }
      .benutzer-druckvorschau-leiste button { min-height: 44px; }
      .benutzer-eingangstor-qr-prominent { flex-direction: column !important; text-align: center; align-items: center !important; }
      .benutzer-eingangstor-qr-prominent > div:first-of-type { text-align: center; }
    }
    @media print {
      .benutzer-no-print, .benutzer-druckvorschau-leiste, .benutzer-nur-vorschau { display: none !important; }
      .benutzer-handbuch-wrapper .benutzer-h1, .benutzer-handbuch-wrapper .benutzer-h2, .benutzer-handbuch-wrapper .benutzer-h3 { color: #1c1a18 !important; }
      .benutzer-handbuch-wrapper .benutzer-p, .benutzer-handbuch-wrapper .benutzer-li { color: #1c1a18 !important; }
      .benutzer-handbuch-wrapper .benutzer-h1 { font-size: 1.15rem !important; margin: 0.28rem 0 0.18rem !important; }
      .benutzer-handbuch-wrapper .benutzer-h2 { font-size: 1rem !important; margin: 0.25rem 0 0.15rem !important; }
      .benutzer-handbuch-wrapper .benutzer-h3 { font-size: 0.9rem !important; margin: 0.2rem 0 0.12rem !important; }
      .benutzer-handbuch-wrapper .benutzer-hr { margin: 0.2rem 0 !important; }
      .benutzer-handbuch-wrapper .benutzer-p { margin: 0 0 0.08rem !important; line-height: 1.2 !important; font-size: 7.5pt !important; }
      .benutzer-handbuch-wrapper .benutzer-strong, .benutzer-handbuch-wrapper .benutzer-em { margin: 0 0 0.1rem !important; }
      .benutzer-handbuch-wrapper .benutzer-ul { margin: 0.12rem 0 0.18rem 1rem !important; padding-left: 0.2rem !important; }
      .benutzer-handbuch-wrapper .benutzer-li { margin-bottom: 0.05rem !important; line-height: 1.3 !important; }
      .benutzer-handbuch-wrapper .benutzer-hr { margin: 0.15rem 0 !important; }
      .benutzer-handbuch-wrapper .benutzer-table-wrap { margin: 0.2rem 0 !important; }
      .benutzer-handbuch-wrapper .benutzer-table th, .benutzer-handbuch-wrapper .benutzer-table td { padding: 0.08rem 0.25rem !important; font-size: 7.5pt !important; }
      .benutzer-handbuch-wrapper .benutzer-leerzeile { height: 0.1rem !important; }
      .benutzer-handbuch-grid { display: block !important; }
      .benutzer-handbuch-article { max-width: 100% !important; padding: 0 0 4mm !important; border: none !important; box-shadow: none !important; }
      .benutzer-druck-inhalt { font-size: 7.5pt !important; line-height: 1.2 !important; }
      .benutzer-druck-kapitel { padding: 0.08rem 0 0.2rem !important; break-inside: auto !important; page-break-before: auto !important; }
      .benutzer-druck-kapitel:first-of-type { padding: 0.1rem 0 0.25rem !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-h1 { margin: 0.2rem 0 0.12rem !important; font-size: 1.1rem !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-h2 { margin: 0.15rem 0 0.1rem !important; font-size: 0.95rem !important; padding-bottom: 0.08rem !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-p { margin: 0 0 0.08rem !important; line-height: 1.2 !important; font-size: 7.5pt !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-hr { margin: 0.12rem 0 !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-table-wrap { margin: 0.12rem 0 !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-table th, .benutzer-druck-kapitel:first-of-type .benutzer-table td { padding: 0.08rem 0.2rem !important; font-size: 7.5pt !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-strong { margin: 0 0 0.1rem !important; }
      .benutzer-impressum-seite { page-break-before: auto !important; }
      .benutzer-druck-kapitel h2 { font-size: 1rem !important; margin: 0 0 0.2rem !important; padding-bottom: 0.1rem !important; }
      .benutzer-deckblatt-teal { background: ${TEAL_DECKBLATT_BG} !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color: #fff !important; padding: 5mm 8mm !important; border-radius: 0 !important; margin-bottom: 4mm !important; page-break-after: always !important; page-break-inside: avoid !important; }
      .benutzer-deckblatt-teal.benutzer-deckblatt-teal--mit-bild { page-break-after: avoid !important; margin-bottom: 2mm !important; padding: 4mm 6mm !important; }
      .benutzer-deckblatt-teal h2 { font-size: 16pt !important; margin: 0 !important; color: #fff !important; font-weight: 700 !important; }
      .benutzer-deckblatt-teal .benutzer-deckblatt-teal-slogan { font-size: 10pt !important; margin: 2mm 0 0 !important; line-height: 1.25 !important; color: #fff !important; font-weight: 600 !important; }
      .benutzer-deckblatt-teal .benutzer-deckblatt-teal-tagline { font-size: 9pt !important; margin: 1.5mm 0 0 !important; color: #fff !important; line-height: 1.35 !important; }
      .benutzer-deckblatt-teal .benutzer-deckblatt-teal-meta { font-size: 8pt !important; margin: 2mm 0 0 !important; color: rgba(255,255,255,0.95) !important; }
      .benutzer-deckblatt-teal .benutzer-deckblatt-teal-footerline { font-size: 7pt !important; margin: 1mm 0 0 !important; color: rgba(255,255,255,0.9) !important; }
      .benutzer-deckblatt-teal .benutzer-deckblatt-teal-copy { font-size: 7pt !important; margin: 3mm 0 0 !important; color: rgba(255,255,255,0.85) !important; }
      .benutzer-eingangstor-qr-print { break-inside: avoid !important; page-break-inside: avoid !important; border-color: ${TEAL_DECKBLATT_BG} !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .benutzer-eingangstor-qr-print img { max-width: 42mm !important; height: auto !important; }
      .benutzer-deckblatt { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0.35rem 0.6rem !important; page-break-after: auto !important; }
      .benutzer-deckblatt--einstieg-a4 { padding: 0 !important; page-break-after: always !important; background: #fff !important; }
      .benutzer-deckblatt-a4-inner { max-height: none !important; aspect-ratio: auto !important; height: 277mm !important; border: none !important; background: #fff !important; }
      .benutzer-deckblatt--einstieg-a4 img { width: 100% !important; height: 100% !important; object-fit: contain !important; }
      .benutzer-deckblatt-einstieg-caption { font-size: 7pt !important; margin: 2mm auto 0 !important; color: #374151 !important; }
      .benutzer-deckblatt-cover-intro { margin-bottom: 0 !important; padding: 0 2mm 2mm !important; page-break-after: avoid !important; }
      .benutzer-deckblatt-cover-kernsatz { font-size: 9pt !important; margin: 0 0 1.5mm !important; color: #374151 !important; line-height: 1.35 !important; }
      .benutzer-deckblatt-cover-slogan { font-size: 14pt !important; margin: 0 0 1mm !important; color: #1c1a18 !important; }
      .benutzer-deckblatt h1 { margin: 0.4rem 0 0.25rem !important; font-size: 1.2rem !important; }
      .benutzer-deckblatt p { margin: 0 !important; }
      .benutzer-deckblatt .benutzer-deckblatt-fuss { margin-top: 0.5rem !important; padding-top: 0.35rem !important; }
      .benutzer-seitenfuss-zeile { margin-top: 0.35rem; padding-top: 0.15rem; font-size: 6.5pt; color: #6b7280; }
      .benutzer-seitenfuss-zeile::after { content: " · Seite " counter(page) " von " counter(pages); }
      .benutzer-table-wrap, .benutzer-fussnote-block, .benutzer-figure { break-inside: avoid; }
      .benutzer-handbuch-wrapper .benutzer-md-img { max-width: 100% !important; page-break-inside: avoid; }
      /* Keine harten Seitenumbrüche aus [SEITENUMBRUCH] – sonst explodiert die Seitenzahl (Handbuch kompakt) */
      .benutzer-seitenumbruch { page-break-before: auto !important; margin: 0 !important; padding: 0 !important; border: none !important; min-height: 0 !important; height: 0 !important; overflow: hidden !important; }
      .benutzer-seitenumbruch .benutzer-seitenumbruch-label { display: none !important; }
      .benutzer-handbuch-wrapper .seitenfuss { display: block !important; position: fixed; bottom: 0; left: 0; right: 0; width: 100%; min-height: 5mm; padding: 2mm 8mm; font-size: 8pt; font-family: system-ui, sans-serif; color: #000 !important; background: #fff !important; border-top: 1px solid #ccc; line-height: 1.3; -webkit-print-color-adjust: exact; print-color-adjust: exact; z-index: 99999; }
      .benutzer-handbuch-wrapper .seitenfuss .seitenfuss-preview { display: none !important; }
      .benutzer-handbuch-wrapper .seitenfuss::after { content: "Seite " counter(page) " von " counter(pages); color: #000 !important; }
      .benutzer-print-voll { padding-bottom: 6mm !important; }
      .benutzer-a4-vorschau { min-height: 0 !important; margin: 0 !important; padding: 0 !important; border: none !important; box-shadow: none !important; width: 100% !important; max-width: 100% !important; background: #fff !important; background-image: none !important; }
      @page { margin: 3mm 4mm 8mm 4mm; background: white; }
      html, body { background: #fff !important; color: #1c1a18 !important; }
      .benutzer-handbuch-wrapper { background: #fff !important; }
    }
  `

  const currentDocName = documents.find((d) => d.file === selectedDoc)?.name ?? 'Benutzerhandbuch'

  return (
    <div className={printPreview ? 'benutzer-handbuch-wrapper benutzer-print-preview' : 'benutzer-handbuch-wrapper'} style={{ padding: '1.5rem 1rem', background: '#fffefb', minHeight: '100vh', color: '#1c1a18' }}>
      <style>{styles}</style>

      {!printPreview && (
        <header className="benutzer-no-print benutzer-header-wrap" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1c1a18', fontWeight: 600 }}>{headerTitle}</h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#6b7280' }}>{headerSubtitle}</p>
          </div>
          <div className="benutzer-header-buttons" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setPrintPreview(true)} style={{ padding: '0.5rem 1rem', background: '#374151', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
              👁 Druckvorschau
            </button>
            <button type="button" onClick={() => window.print()} style={{ padding: '0.5rem 1rem', background: '#1c1a18', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
              🖨️ Drucken
            </button>
            <button type="button" onClick={handleZurueck} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#1c1a18', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Zurück
            </button>
          </div>
        </header>
      )}

      {prominentEingangstorQr && !printPreview && <EingangstorQrBlock variant="screen" />}

      {printPreview ? (
        <>
          <p className="benutzer-no-print" style={{ maxWidth: '210mm', margin: '0 auto 0.75rem', fontSize: '0.85rem', color: '#374151', background: '#f3f4f6', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <strong>Kompaktes Drucken:</strong> PDF nutzt <strong>fließenden Text</strong> (weniger Seiten). Optional eine Zeile <code style={{ background: '#e5e7eb', padding: '0.1rem 0.3rem', borderRadius: 4 }}>[SEITENUMBRUCH]</code> in <code style={{ background: '#e5e7eb', padding: '0.1rem 0.3rem', borderRadius: 4 }}>{printHintFolder}</code> nur als sichtbare <strong>Abschnittsmarkierung</strong> in der Vorschau – <strong>kein</strong> erzwungener Seitenumbruch im Druck.
          </p>
          <div className="benutzer-a4-vorschau">
          <div className="benutzer-print-voll" style={{ paddingBottom: '1rem' }}>
          {printPreviewLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>Lade alle Kapitel für die Druckvorschau…</div>
          ) : (
            <>
              {deckblattTealCover ? (
                <div
                  className={deckblattCoverImageSrc ? 'benutzer-deckblatt-teal benutzer-deckblatt-teal--mit-bild' : 'benutzer-deckblatt-teal'}
                  style={{
                    background: TEAL_DECKBLATT_BG,
                    color: '#fff',
                    textAlign: 'center',
                    padding: deckblattCoverImageSrc
                      ? 'clamp(1rem, 3vw, 1.75rem) 1rem'
                      : 'clamp(1.5rem, 4vw, 2.5rem) 1.25rem',
                    borderRadius: 12,
                    marginBottom: deckblattCoverImageSrc ? '0.5rem' : '1rem',
                  }}
                  aria-hidden
                >
                  <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
                    {deckblattTop}
                  </h2>
                  {deckblattSlogan ? (
                    <p className="benutzer-deckblatt-teal-slogan">{deckblattSlogan}</p>
                  ) : null}
                  {deckblattKernsatz ? (
                    <p className="benutzer-deckblatt-teal-tagline">{deckblattKernsatz}</p>
                  ) : null}
                  {(deckblattMainTitle.trim() || deckblattFooterKind.trim()) ? (
                    <p className="benutzer-deckblatt-teal-meta">
                      {deckblattMainTitle}
                      {deckblattFooterKind ? ` · ${deckblattFooterKind}` : ''}
                    </p>
                  ) : null}
                  {deckblattFooterTagline.trim() ? (
                    <p className="benutzer-deckblatt-teal-footerline">{deckblattFooterTagline}</p>
                  ) : null}
                  <p className="benutzer-deckblatt-teal-copy">© kgm solution</p>
                </div>
              ) : null}
              {deckblattCoverImageSrc ? (
                <>
                  {!deckblattTealCover && (deckblattKernsatz || deckblattSlogan) ? (
                    <div className="benutzer-deckblatt-cover-intro">
                      {deckblattKernsatz ? (
                        <p className="benutzer-deckblatt-cover-kernsatz">{deckblattKernsatz}</p>
                      ) : null}
                      {deckblattSlogan ? (
                        <h2 className="benutzer-deckblatt-cover-slogan">{deckblattSlogan}</h2>
                      ) : null}
                    </div>
                  ) : null}
                  <div className="benutzer-deckblatt benutzer-deckblatt--einstieg-a4" aria-hidden>
                    <div className="benutzer-deckblatt-a4-inner">
                      <img src={deckblattCoverImageSrc} alt={deckblattCoverAlt ?? ''} />
                    </div>
                    {deckblattCoverCaption ? (
                      <p className="benutzer-deckblatt-einstieg-caption">{deckblattCoverCaption}</p>
                    ) : null}
                  </div>
                </>
              ) : null}
              {!deckblattTealCover && !deckblattCoverImageSrc ? (
                <div className="benutzer-deckblatt" aria-hidden>
                  <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#fff', textAlign: 'center', letterSpacing: '-0.02em' }}>{deckblattTop}</h2>
                    <p style={{ margin: '1rem 0 0.25rem', fontSize: 'clamp(0.9rem, 2vw, 1rem)', color: 'rgba(255,255,255,0.9)', lineHeight: 1.35 }}>{deckblattSlogan}</p>
                    <h1 style={{ margin: '0.5rem 0 0.75rem', fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 700, lineHeight: 1.25 }}>
                      {deckblattMainTitle}
                    </h1>
                    <div className="benutzer-deckblatt-fuss" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                      <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{deckblattFooterProduct}</p>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>{deckblattFooterKind}</p>
                      <p style={{ margin: '1.5rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{deckblattFooterTagline}</p>
                    </div>
                  </div>
                </div>
              ) : null}
              {prominentEingangstorQr && <EingangstorQrBlock variant="print" />}
              {documents.map((doc, index) => (
                <section key={doc.file} className="benutzer-druck-kapitel">
                  <div className="benutzer-druck-inhalt">{renderMarkdown(allDocContents[doc.file] ?? '', index > 0 ? index : undefined)}</div>
                </section>
              ))}
              <section className="benutzer-druck-kapitel benutzer-impressum-seite">
                <h2 style={{ fontSize: '1.25rem', margin: '0 0 1rem', color: '#1c1a18', fontWeight: 700, borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem' }}>Impressum</h2>
                <div className="benutzer-druck-inhalt" style={{ fontSize: '10pt', lineHeight: 1.6, color: '#1c1a18' }}>
                  <p style={{ margin: '0 0 0.5rem' }}><strong>{PRODUCT_BRAND_NAME}</strong></p>
                  <p style={{ margin: '0 0 0.5rem' }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '9pt' }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
                  {PRODUCT_LIZENZ_ANFRAGE_EMAIL && (
                    <p style={{ margin: 0 }}><strong>Kontakt:</strong> <a href={`mailto:${PRODUCT_LIZENZ_ANFRAGE_EMAIL}`} style={{ color: '#1c1a18', textDecoration: 'underline' }}>{PRODUCT_LIZENZ_ANFRAGE_EMAIL}</a></p>
                  )}
                </div>
              </section>
            </>
          )}
          </div>
          </div>
          <div className="seitenfuss" aria-hidden>
            <span className="seitenfuss-preview">{footerPreviewLine}</span>
          </div>
        </>
      ) : (
        <div className="benutzer-handbuch-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 200px) 1fr', gap: '1.5rem' }}>
          <nav className="benutzer-no-print benutzer-nav" style={{ background: '#f9fafb', padding: '1rem', borderRadius: 12, border: '1px solid #e5e7eb', height: 'fit-content', position: 'sticky', top: '1rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#374151', fontWeight: 600 }}>Kapitel</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {documents.map((doc, index) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => loadDocument(doc.file)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: selectedDoc === doc.file ? '#e5e7eb' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    color: selectedDoc === doc.file ? '#1c1a18' : '#4b5563',
                    fontWeight: selectedDoc === doc.file ? 600 : 400
                  }}
                >
                  {index === 0 ? doc.name : `${index}. ${doc.name}`}
                </button>
              ))}
            </div>
          </nav>

          <article className="benutzer-handbuch-article" style={{ background: '#fff', padding: '1.5rem 2rem', borderRadius: 12, border: '1px solid #e5e7eb', minHeight: 400 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Lade Kapitel...</div>
            ) : (
              <>
                <div className="benutzer-druck-inhalt">{renderMarkdown(docContent, (() => { const idx = documents.findIndex((d) => d.file === selectedDoc); return idx > 0 ? idx : undefined; })(), (path) => loadDocument(path))}</div>
                <div className="benutzer-seitenfuss-zeile" style={{ display: 'none' }} aria-hidden>
                  {printCurrentDocPrefix} · {currentDocName}
                </div>
              </>
            )}
          </article>
        </div>
      )}

      {printPreview && (
        <div className="benutzer-druckvorschau-leiste" style={{ position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', zIndex: 1000 }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={() => window.print()} style={{ padding: '0.6rem 1.25rem', background: '#1c1a18', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
              🖨️ Jetzt drucken
            </button>
            <button type="button" onClick={() => setPrintPreview(false)} style={{ padding: '0.6rem 1.25rem', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
              Schließen
            </button>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#6b7280', textAlign: 'center', maxWidth: '320px' }}>Im Druckdialog „Kopf- und Fusszeile“ deaktivieren – sonst können schwarze Flächen entstehen. Seitenzahl steht in unserer Fusszeile.</span>
        </div>
      )}
    </div>
  )
}
