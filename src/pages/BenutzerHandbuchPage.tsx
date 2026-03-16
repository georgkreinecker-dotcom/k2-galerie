/**
 * Benutzerhandbuch für ök2 und VK2 – für unsere User (Lizenznehmer:innen, Piloten, Vereine).
 * Professionell, leicht verständlich, redigiert. Quelle: public/benutzer-handbuch/*.md
 */

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_BRAND_NAME, PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG, PRODUCT_LIZENZ_ANFRAGE_EMAIL, PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2 } from '../config/tenantConfig'

const HANDBUCH_BASE = '/benutzer-handbuch'
const HANDBUCH_DOC_PARAM = 'doc'

const DOCUMENTS = [
  { id: '00-index', name: 'Inhaltsverzeichnis', file: '00-INDEX.md' },
  { id: '01-erste-schritte', name: 'Erste Schritte', file: '01-ERSTE-SCHRITTE.md' },
  { id: '03-admin', name: 'Admin im Überblick', file: '03-ADMIN-UEBERBLICK.md' },
  { id: '02-galerie', name: 'Galerie gestalten, Werke anlegen', file: '02-GALERIE-GESTALTEN.md' },
  { id: '07-eventplanung', name: 'Eventplanung & Öffentlichkeitsarbeit', file: '07-EVENTPLANUNG-WERBUNG-OEFFENTLICHKEITSARBEIT.md' },
  { id: '05-vk2', name: 'Vereinsplattform', file: '05-VK2-VEREINSPLATTFORM.md' },
  { id: '06-oek2', name: 'Demo und Lizenz', file: '06-OEK2-DEMO-LIZENZ.md' },
  { id: '08-kassa-buchhaltung', name: 'Kassa und Buchhaltung', file: '08-KASSA-BUCHHALTUNG.md' },
  { id: '10-einstellungen', name: 'Einstellungen', file: '10-EINSTELLUNGEN.md' },
  { id: '04-faq', name: 'Häufige Fragen', file: '04-HAEUFIGE-FRAGEN.md' },
] as const

const HANDBUCH_PATH = '/benutzer-handbuch'
const FALLBACK_ROUTE = PROJECT_ROUTES['k2-galerie'].galerieOeffentlich

export default function BenutzerHandbuchPage() {
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
      if (window.location.pathname === HANDBUCH_PATH || window.location.pathname.endsWith('benutzer-handbuch')) {
        navigate(FALLBACK_ROUTE)
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

  useEffect(() => {
    const docFromUrl = searchParams.get(HANDBUCH_DOC_PARAM)
    const fileToLoad = docFromUrl && DOCUMENTS.some((d) => d.file === docFromUrl)
      ? docFromUrl
      : DOCUMENTS[0].file
    loadDocument(fileToLoad)
  }, [searchParams])

  useEffect(() => {
    if (!printPreview) return
    let cancelled = false
    setPrintPreviewLoading(true)
    const loadAll = async () => {
      const next: Record<string, string> = {}
      for (const doc of DOCUMENTS) {
        if (cancelled) return
        try {
          const res = await fetch(`${HANDBUCH_BASE}/${doc.file}`)
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
  }, [printPreview])

  const loadDocument = async (filename: string) => {
    setLoading(true)
    setSelectedDoc(filename)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set(HANDBUCH_DOC_PARAM, filename)
      return next
    }, { replace: true })
    try {
      const response = await fetch(`${HANDBUCH_BASE}/${filename}`)
      if (response.ok) {
        const text = await response.text()
        setDocContent(text)
      } else {
        setDocContent(`# Dokument nicht gefunden\n\nDie Datei konnte nicht geladen werden.`)
      }
    } catch {
      setDocContent(`# Fehler beim Laden\n\nBitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.`)
    } finally {
      setLoading(false)
    }
  }

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
      if (trimmed.toUpperCase() === '[SEITENUMBRUCH]') {
        out.push(<div key={key()} className="benutzer-seitenumbruch" aria-hidden><span className="benutzer-seitenumbruch-label">— Seitenumbruch (beim Drucken: neue Seite) —</span></div>)
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
          const href = path.startsWith('http') ? path : `${HANDBUCH_BASE}/${path}`
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
            const href = path.startsWith('http') ? path : `${HANDBUCH_BASE}/${path}`
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
    .benutzer-handbuch-wrapper .benutzer-fussnote-block { break-inside: avoid; }
    .benutzer-handbuch-wrapper .benutzer-leerzeile { height: 0.75rem; }
    .benutzer-print-preview .benutzer-no-print { display: none !important; }
    .benutzer-print-preview .benutzer-handbuch-wrapper { padding: 0; background: #fff; }
    .benutzer-print-preview .benutzer-handbuch-grid { display: block !important; }
    .benutzer-print-preview .benutzer-handbuch-article { max-width: 100%; padding: 1rem 1.5rem; border: none; border-radius: 0; box-shadow: none; }
    .benutzer-print-preview .benutzer-druck-inhalt { font-size: 10.5pt; line-height: 1.5; }
    .benutzer-print-preview .benutzer-seitenfuss-zeile { display: block !important; margin-top: 1.5rem; padding-top: 0.5rem; border-top: 1px solid #e5e7eb; font-size: 0.8rem; color: #6b7280; }
    .benutzer-deckblatt { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 2rem; page-break-after: always; background: linear-gradient(160deg, #1c1a18 0%, #2d2a26 50%, #1c1a18 100%); color: #fff; }
    .benutzer-druck-kapitel { page-break-before: always; padding: 1.5rem 1.5rem 3rem; }
    .benutzer-druck-kapitel:first-of-type { page-break-before: auto; }
    .benutzer-impressum-seite { page-break-before: always; }
    .benutzer-handbuch-wrapper .seitenfuss { display: none; }
    .benutzer-print-preview .seitenfuss { display: block; position: fixed; bottom: 0; left: 0; right: 0; min-height: 28px; padding: 0.4rem 1.5rem; font-size: 0.8rem; color: #374151; background: #fff; border-top: 1px solid #e5e7eb; z-index: 99999; line-height: 1.3; }
    .benutzer-print-preview .seitenfuss .seitenfuss-preview { color: #6b7280; }
    .benutzer-print-preview .benutzer-deckblatt { min-height: auto; padding: 1.25rem 1.5rem; page-break-after: unset; margin-bottom: 0.5rem; border-radius: 12px; }
    .benutzer-print-preview .benutzer-deckblatt h1 { margin: 0.75rem 0 0.35rem; font-size: 1.4rem; }
    .benutzer-print-preview .benutzer-deckblatt .benutzer-deckblatt-fuss { margin-top: 1.25rem; padding-top: 1rem; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-h1 { font-size: 1.25rem; margin: 0.6rem 0 0.3rem; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-h2 { font-size: 1.1rem; margin: 0.5rem 0 0.25rem; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-h3 { font-size: 1rem; margin: 0.4rem 0 0.2rem; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-p { margin: 0 0 0.3rem; line-height: 1.45; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-hr { margin: 0.4rem 0; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-ul { margin: 0.25rem 0 0.4rem 1.25rem; }
    .benutzer-print-preview .benutzer-druck-inhalt .benutzer-li { margin-bottom: 0.15rem; }
    .benutzer-print-preview .benutzer-druck-kapitel { page-break-before: unset; padding: 0.75rem 1rem 0.25rem; }
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
    .benutzer-print-preview { background: #9ca3af !important; padding: 1.5rem 1rem !important; }
    .benutzer-print-preview .benutzer-handbuch-wrapper { max-width: none; }
    .benutzer-print-preview .benutzer-a4-vorschau { width: 210mm; max-width: 100%; margin: 0 auto 2rem; min-height: 297mm; padding: 0 10mm 2rem; background: #fff; border: 2px solid #6b7280; box-shadow: 0 4px 20px rgba(0,0,0,0.2); box-sizing: border-box; background-image: repeating-linear-gradient(to bottom, transparent 0, transparent calc(297mm - 1px), #9ca3af calc(297mm - 1px), #9ca3af 297mm); }
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
    }
    @media print {
      .benutzer-no-print, .benutzer-druckvorschau-leiste, .benutzer-nur-vorschau { display: none !important; }
      .benutzer-handbuch-wrapper .benutzer-h1, .benutzer-handbuch-wrapper .benutzer-h2, .benutzer-handbuch-wrapper .benutzer-h3 { color: #1c1a18 !important; }
      .benutzer-handbuch-wrapper .benutzer-p, .benutzer-handbuch-wrapper .benutzer-li { color: #1c1a18 !important; }
      .benutzer-handbuch-wrapper .benutzer-h1 { font-size: 1.15rem !important; margin: 0.28rem 0 0.18rem !important; }
      .benutzer-handbuch-wrapper .benutzer-h2 { font-size: 1rem !important; margin: 0.25rem 0 0.15rem !important; }
      .benutzer-handbuch-wrapper .benutzer-h3 { font-size: 0.9rem !important; margin: 0.2rem 0 0.12rem !important; }
      .benutzer-handbuch-wrapper .benutzer-hr { margin: 0.2rem 0 !important; }
      .benutzer-handbuch-wrapper .benutzer-p { margin: 0 0 0.1rem !important; line-height: 1.26 !important; font-size: 8.5pt !important; }
      .benutzer-handbuch-wrapper .benutzer-strong, .benutzer-handbuch-wrapper .benutzer-em { margin: 0 0 0.1rem !important; }
      .benutzer-handbuch-wrapper .benutzer-ul { margin: 0.12rem 0 0.18rem 1rem !important; padding-left: 0.2rem !important; }
      .benutzer-handbuch-wrapper .benutzer-li { margin-bottom: 0.05rem !important; line-height: 1.3 !important; }
      .benutzer-handbuch-wrapper .benutzer-hr { margin: 0.15rem 0 !important; }
      .benutzer-handbuch-wrapper .benutzer-table-wrap { margin: 0.2rem 0 !important; }
      .benutzer-handbuch-wrapper .benutzer-table th, .benutzer-handbuch-wrapper .benutzer-table td { padding: 0.12rem 0.3rem !important; font-size: 8.5pt !important; }
      .benutzer-handbuch-wrapper .benutzer-leerzeile { height: 0.1rem !important; }
      .benutzer-handbuch-grid { display: block !important; }
      .benutzer-handbuch-article { max-width: 100% !important; padding: 0 0 4mm !important; border: none !important; box-shadow: none !important; }
      .benutzer-druck-inhalt { font-size: 8.5pt !important; line-height: 1.26 !important; }
      .benutzer-druck-kapitel { padding: 0.1rem 0 0.25rem !important; break-inside: avoid !important; }
      .benutzer-druck-kapitel:first-of-type { padding: 0.1rem 0 0.25rem !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-h1 { margin: 0.2rem 0 0.12rem !important; font-size: 1.1rem !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-h2 { margin: 0.15rem 0 0.1rem !important; font-size: 0.95rem !important; padding-bottom: 0.08rem !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-p { margin: 0 0 0.08rem !important; line-height: 1.24 !important; font-size: 8pt !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-hr { margin: 0.12rem 0 !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-table-wrap { margin: 0.12rem 0 !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-table th, .benutzer-druck-kapitel:first-of-type .benutzer-table td { padding: 0.1rem 0.25rem !important; font-size: 8pt !important; }
      .benutzer-druck-kapitel:first-of-type .benutzer-strong { margin: 0 0 0.1rem !important; }
      .benutzer-impressum-seite { page-break-before: always !important; }
      .benutzer-druck-kapitel h2 { font-size: 1rem !important; margin: 0 0 0.2rem !important; padding-bottom: 0.1rem !important; }
      .benutzer-deckblatt { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0.5rem 0.75rem !important; }
      .benutzer-deckblatt h1 { margin: 0.4rem 0 0.25rem !important; font-size: 1.2rem !important; }
      .benutzer-deckblatt p { margin: 0 !important; }
      .benutzer-deckblatt .benutzer-deckblatt-fuss { margin-top: 0.5rem !important; padding-top: 0.35rem !important; }
      .benutzer-seitenfuss-zeile { margin-top: 0.35rem; padding-top: 0.15rem; font-size: 6.5pt; color: #6b7280; }
      .benutzer-seitenfuss-zeile::after { content: " · Seite " counter(page) " von " counter(pages); }
      .benutzer-table-wrap, .benutzer-fussnote-block { break-inside: avoid; }
      .benutzer-seitenumbruch { page-break-before: always !important; margin: 0 !important; padding: 0 !important; border: none !important; min-height: 0 !important; }
      .benutzer-seitenumbruch .benutzer-seitenumbruch-label { display: none !important; }
      .benutzer-handbuch-wrapper .seitenfuss { display: block !important; position: fixed; bottom: 0; left: 0; right: 0; width: 100%; min-height: 5mm; padding: 2mm 8mm; font-size: 8pt; font-family: system-ui, sans-serif; color: #000 !important; background: #fff !important; border-top: 1px solid #ccc; line-height: 1.3; -webkit-print-color-adjust: exact; print-color-adjust: exact; z-index: 99999; }
      .benutzer-handbuch-wrapper .seitenfuss .seitenfuss-preview { display: none !important; }
      .benutzer-handbuch-wrapper .seitenfuss::after { content: "Seite " counter(page) " von " counter(pages); color: #000 !important; }
      .benutzer-print-voll { padding-bottom: 8mm !important; }
      @page { margin: 5mm 6mm 12mm 6mm; background: white; }
      html, body { background: #fff !important; color: #1c1a18 !important; }
      .benutzer-handbuch-wrapper { background: #fff !important; }
    }
  `

  const currentDocName = DOCUMENTS.find((d) => d.file === selectedDoc)?.name ?? 'Benutzerhandbuch'

  return (
    <div className={printPreview ? 'benutzer-handbuch-wrapper benutzer-print-preview' : 'benutzer-handbuch-wrapper'} style={{ padding: '1.5rem 1rem', background: '#fffefb', minHeight: '100vh', color: '#1c1a18' }}>
      <style>{styles}</style>

      {!printPreview && (
        <header className="benutzer-no-print benutzer-header-wrap" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1c1a18', fontWeight: 600 }}>📖 Benutzerhandbuch</h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#6b7280' }}>K2 Galerie – für Galerien und Vereine. Leicht verständlich, zum Lesen und Drucken.</p>
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

      {printPreview ? (
        <>
          <p className="benutzer-no-print" style={{ maxWidth: '210mm', margin: '0 auto 0.75rem', fontSize: '0.85rem', color: '#374151', background: '#f3f4f6', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <strong>Seitenumbruch festlegen:</strong> In den Handbuch-Dateien unter <code style={{ background: '#e5e7eb', padding: '0.1rem 0.3rem', borderRadius: 4 }}>public/benutzer-handbuch/</code> (z. B. 01-ERSTE-SCHRITTE.md) an der gewünschten Stelle eine <strong>eigene Zeile</strong> einfügen: <code style={{ background: '#e5e7eb', padding: '0.1rem 0.3rem', borderRadius: 4 }}>[SEITENUMBRUCH]</code> – dort beginnt beim Drucken eine neue Seite.
          </p>
          <div className="benutzer-a4-vorschau">
          <div className="benutzer-print-voll" style={{ paddingBottom: '3rem' }}>
          {printPreviewLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>Lade alle Kapitel für die Druckvorschau…</div>
          ) : (
            <>
              <div className="benutzer-deckblatt" aria-hidden>
                <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
                  <h2 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, color: '#fff', textAlign: 'center', letterSpacing: '-0.02em' }}>K2 Galerie</h2>
                  <p style={{ margin: '1rem 0 0.25rem', fontSize: 'clamp(0.9rem, 2vw, 1rem)', color: 'rgba(255,255,255,0.9)', lineHeight: 1.35 }}>{PRODUCT_WERBESLOGAN}</p>
                  <h1 style={{ margin: '0.5rem 0 0.75rem', fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 700, lineHeight: 1.25 }}>
                    {PRODUCT_WERBESLOGAN_2}
                  </h1>
                  <div className="benutzer-deckblatt-fuss" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>K2 Galerie</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '1rem', color: 'rgba(255,255,255,0.9)' }}>Benutzerhandbuch</p>
                    <p style={{ margin: '1.5rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Für Galerien und Vereine · Leicht verständlich, zum Lesen und Drucken</p>
                  </div>
                </div>
              </div>
              {DOCUMENTS.map((doc, index) => (
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
            <span className="seitenfuss-preview">K2 Galerie – Benutzerhandbuch · (Seitenzahlen beim Drucken)</span>
          </div>
        </>
      ) : (
        <div className="benutzer-handbuch-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 200px) 1fr', gap: '1.5rem' }}>
          <nav className="benutzer-no-print benutzer-nav" style={{ background: '#f9fafb', padding: '1rem', borderRadius: 12, border: '1px solid #e5e7eb', height: 'fit-content', position: 'sticky', top: '1rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#374151', fontWeight: 600 }}>Kapitel</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {DOCUMENTS.map((doc, index) => (
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
                <div className="benutzer-druck-inhalt">{renderMarkdown(docContent, (() => { const idx = DOCUMENTS.findIndex((d) => d.file === selectedDoc); return idx > 0 ? idx : undefined; })(), (path) => loadDocument(path))}</div>
                <div className="benutzer-seitenfuss-zeile" style={{ display: 'none' }} aria-hidden>
                  K2 Galerie – Benutzerhandbuch · {currentDocName}
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
