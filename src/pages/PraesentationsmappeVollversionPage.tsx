/**
 * Präsentationsmappe Vollversion – schrittweise Entscheidungshilfe für künftige Nutzer:innen (Überblick USPs + Produkt).
 * Gliederung: zuerst Orientierung (USPs, Prospekt, Was/Für wen), dann Kapitel mit konkreten Admin-Beispielen (inkl. Demo/Lizenz/Kontakt). Die Seitenleiste trennt die Blöcke visuell.
 * Ton: Du, Nutzen, klare Lesereihenfolge; Quelle: public/praesentationsmappe-vollversion/*.md
 */

import { useState, useEffect } from 'react'
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
} from '../config/tenantConfig'
import { loadStammdaten } from '../utils/stammdatenStorage'
import { useWerbemittelPrintContext } from '../hooks/useWerbemittelPrintContext'
import { getEntdeckenHeroPathUrl } from '../config/pageContentEntdecken'
import { renderMarkdown } from '../utils/praesentationsmappeMarkdown'
import { PRAESENTATIONSMAPPE_MARKDOWN_STYLES } from '../utils/praesentationsmappeMarkdownStyles'

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
  id: string
  name: string
  file: string
}

const DOCUMENTS_STANDARD: PraesMappeDoc[] = [
  {
    sectionTitle: 'Orientierung',
    id: '01-deckblatt',
    name: 'Deckblatt',
    file: '01-DECKBLATT.md',
  },
  { id: '00-index', name: 'Inhaltsverzeichnis', file: '00-INDEX.md' },
  { id: '02-usp-wettbewerb', name: 'USPs & Mitbewerb', file: '02-USP-UND-WETTBEWERB.md' },
  { id: '02-was-ist', name: 'Was ist die K2 Galerie', file: '02-WAS-IST-K2-GALERIE.md' },
  { id: '03-fuer-wen', name: 'Für wen', file: '03-FUER-WEN.md' },
  {
    sectionTitle: 'Konkret im Admin',
    id: '04-willkommen',
    name: 'Willkommen und Galerie',
    file: '04-WILLKOMMEN-UND-GALERIE.md',
  },
  { id: '04-admin-herz', name: 'Admin – Herzstück', file: '04-ADMIN-HERZSTUECK.md' },
  { id: '05-werke', name: 'Werke erfassen', file: '05-WERKE-ERFASSEN.md' },
  { id: '06-design', name: 'Design und Veröffentlichung', file: '06-DESIGN-VEROEFFENTLICHUNG.md' },
  { id: '14-statistik-werkkatalog', name: 'Statistik und Werkkatalog', file: '14-STATISTIK-WERKKATALOG.md' },
  { id: '07-kassa', name: 'Kassa und Verkauf', file: '07-KASSA-VERKAUF.md' },
  { id: '15-shop-internet', name: 'Shop und Internetbestellung', file: '15-SHOP-INTERNETBESTELLUNG.md' },
  { id: '08-events', name: 'Events und Öffentlichkeitsarbeit', file: '08-EVENTS-OEFFENTLICHKEITSARBEIT.md' },
  { id: '09-vk2', name: 'Vereinsplattform VK2', file: '09-VEREINSPLATTFORM-VK2.md' },
  { id: '10-demo', name: 'Demo und Lizenz', file: '10-DEMO-LIZENZ.md' },
  {
    id: '16-einstellungen',
    name: 'Einstellungen & Stammdaten',
    file: '16-EINSTELLUNGEN-STAMMDATEN.md',
  },
  { id: '11-empfehlung', name: 'Empfehlungsprogramm', file: '11-EMPFEHLUNGSPROGRAMM.md' },
  { id: '12-technik', name: 'Technik', file: '12-TECHNIK.md' },
  { id: '13-kontakt', name: 'Kontakt', file: '13-KONTAKT.md' },
]

const DOCUMENTS_VK2: PraesMappeDoc[] = [
  {
    sectionTitle: 'Orientierung',
    id: '01-deckblatt',
    name: 'Deckblatt',
    file: '01-DECKBLATT.md',
  },
  { id: '00-index', name: 'Inhaltsverzeichnis', file: '00-INDEX.md' },
  { id: '02-usp-wettbewerb', name: 'USPs & Mitbewerb', file: '02-USP-WETTBEWERB-VK2.md' },
  { id: '02-was-ist-vk2', name: 'Was ist VK2', file: '02-WAS-IST-VK2.md' },
  { id: '03-fuer-wen', name: 'Für wen', file: '03-FUER-WEN.md' },
  {
    sectionTitle: 'Konkret im Admin',
    id: '04-mitglieder-galerie',
    name: 'Mitglieder und Galerie',
    file: '04-MITGLIEDER-UND-GALERIE.md',
  },
  { id: '05-kassa-verkauf', name: 'Kassa und Verkauf', file: '05-KASSA-UND-VERKAUF.md' },
  { id: '06-events-medien', name: 'Events und Medienplanung', file: '06-EVENTS-UND-MEDIENPLANUNG.md' },
  { id: '07-lizenz-betrieb', name: 'Lizenz und Betrieb', file: '07-LIZENZ-UND-BETRIEB.md' },
  { id: '08-kontakt', name: 'Kontakt', file: '08-KONTAKT.md' },
]

/** Zweite VK2-Mappe: kurz, jedes Kapitel mit Muster-Screenshot unter /img/oeffentlich/. */
const DOCUMENTS_VK2_PROMO: PraesMappeDoc[] = [
  {
    sectionTitle: 'Orientierung',
    id: '01-deckblatt',
    name: 'Deckblatt',
    file: '01-DECKBLATT.md',
  },
  { id: '00-index', name: 'Inhaltsverzeichnis', file: '00-INDEX.md' },
  { id: '02-usp-wettbewerb', name: 'USPs & Mitbewerb', file: '02-USP-WETTBEWERB.md' },
  {
    sectionTitle: 'Konkret im Admin',
    id: '02-ein-blick',
    name: 'Ein Blick in den Admin',
    file: '02-EIN-BLICK-ADMIN.md',
  },
  { id: '03-mitglieder', name: 'Mitglieder & Galerie', file: '03-MITGLIEDER-GALERIE.md' },
  { id: '04-kassa', name: 'Kassa & Verkauf', file: '04-KASSA-VERKAUF.md' },
  { id: '05-events', name: 'Events & Medien', file: '05-EVENTS-MEDIEN.md' },
  { id: '06-lizenz', name: 'Lizenz & Betrieb', file: '06-LIZENZ-BETRIEB.md' },
  { id: '07-kontakt', name: 'Kontakt', file: '07-KONTAKT.md' },
]

const FALLBACK_ROUTE = PROJECT_ROUTES['k2-galerie'].praesentationsmappe

/** Nummer vor der ersten H1 nur wo sinnvoll; Inhaltsverzeichnis ohne Ziffer – Seitenleiste nutzt dieselbe Logik (keine „1.“ vor Inhaltsverzeichnis). */
function chapterNumberForPmvMarkdown(docs: PraesMappeDoc[], file: string): number | undefined {
  const idx = docs.findIndex((d) => d.file === file)
  if (idx <= 0) return undefined
  if (docs[idx]?.file === '00-INDEX.md') return undefined
  return idx
}

function sidebarDocLabel(docs: PraesMappeDoc[], doc: PraesMappeDoc): string {
  const n = chapterNumberForPmvMarkdown(docs, doc.file)
  return n != null ? `${n}. ${doc.name}` : doc.name
}

export default function PraesentationsmappeVollversionPage() {
  const navigate = useNavigate()
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

  const returnTo = searchParams.get('returnTo')
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()
  const pageTitle = isVk2Promo
    ? 'VK2 – Präsentationsmappe mit Musterbildern'
    : isVk2Classic
      ? 'Präsentationsmappe VK2 – Vollversion'
      : 'Präsentationsmappe – Vollversion'
  const pageSubtitle = isVk2Promo
      ? 'Zweite Mappe für VK2: kompakt, Screenshot pro Kapitel – zuerst Orientierung, dann Beispiele aus dem Admin.'
    : isVk2Classic
      ? 'VK2 Vollversion: Orientierung, danach konkrete Admin-Beispiele – die Seitenleiste zeigt den Wechsel.'
      : 'Zuerst Orientierung, dann konkrete Beispiele aus dem Admin; die Seitenleiste trennt die Blöcke. Screenshots unter /img/oeffentlich/.'

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

  const loadAllDocuments = async (forPrint: boolean) => {
    setLoadingFullPrint(true)
    try {
      const contents: string[] = []
      for (const doc of DOCUMENTS) {
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
    if (!isMobile || allDocContents.length > 0) return
    loadAllDocuments(false)
  }, [isMobile, allDocContents.length])

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
    if (isAnyVk2) {
      return (
        <div className="pmv-deckblatt-cover" lang="de">
          <div className="pmv-deckblatt-header">
            <h1 className="pmv-cover-title">VK2 Vereinsplattform</h1>
            <p className="pmv-cover-slogan1">Für Vereine gedacht, für den Alltag gemacht.</p>
            <p className="pmv-cover-slogan2">Mitglieder, Kommunikation, Kassa und Unterlagen in einer Oberfläche.</p>
            <p className="pmv-cover-copyright">© {PRODUCT_BRAND_NAME}</p>
          </div>
          <div className="pmv-cover-img-wrap">
            <img
              src="/img/oeffentlich/pm-vk2-verein.png"
              alt="VK2 Vereinsplattform – Musteransicht"
              className="pmv-cover-img"
            />
          </div>
        </div>
      )
    }
    const deckTitle = isOeffentlich
      ? MUSTER_TEXTE.gallery.firmenname || TENANT_CONFIGS.oeffentlich.galleryName
      : K2_GALERIE_PUBLIC_BRAND
    // Deckblatt-Foto soll immer das Eingangsbild (Eingangstor / Entdecken) sein.
    // Quelle: Admin → Design → Eingangsseite.
    const deckImg = getEntdeckenHeroPathUrl()
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
            alt="Eingangstor / Entdecken – Deckblattbild"
            className="pmv-cover-img"
          />
        </div>
      </div>
    )
  }

  const currentDocName = DOCUMENTS.find((d) => d.file === selectedDoc)?.name ?? 'Präsentationsmappe – Vollversion'

  return (
    <div className="pmv-wrap pmv-map-page-root" lang="de" style={{ padding: '1.5rem 1rem', background: '#fffefb', minHeight: '100vh', color: '#1c1a18' }}>
      <style>{PRAESENTATIONSMAPPE_MARKDOWN_STYLES}</style>

      <header className="pmv-no-print" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1c1a18', fontWeight: 600 }}>📁 {pageTitle}</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#6b7280' }}>
            {fullPrintView
              ? 'Alle Kapitel mit Bildern – zum Drucken'
              : isMobile && allDocContents.length > 0
                ? 'Alle Kapitel – durchscrollen bis zur letzten Seite'
                : pageSubtitle}
          </p>
          {!fullPrintView && !isMobile ? (
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>
              DIN-A4-Breite · gestrichelter Innenrand = Druckkörper wie beim Druck (Kopf-/Seiten-/Fußrand) · passt zur Druckvorschau
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
              <button type="button" onClick={handleZurueck} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#1c1a18', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                ← Zurück
              </button>
            </>
          )}
        </div>
      </header>

      {(fullPrintView || (isMobile && allDocContents.length > 0)) ? (
        <article
          className="pmv-scroll-mobile pmv-a4-sheet"
          style={{ overflow: 'visible' }}
        >
          {allDocContents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Keine Kapitel geladen.</div>
          ) : (
            DOCUMENTS.map((doc, idx) => (
              <div key={doc.file} className={idx === 0 ? 'pmv-chapter-block pmv-chapter-first' : 'pmv-chapter-block'}>
                {doc.file === '01-DECKBLATT.md'
                  ? renderDeckblattCover()
                  : renderMarkdown(allDocContents[idx] ?? '', {
                      assetBase: BASE,
                      chapterNumber: chapterNumberForPmvMarkdown(DOCUMENTS, doc.file),
                      onInternalDocClick: (path) => { setFullPrintView(false); loadDocument(path) },
                      keyPrefix: `ch${idx}`,
                    })}
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
              {DOCUMENTS.map((doc, index) => (
                <div key={doc.id}>
                  {doc.sectionTitle ? (
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
              ))}
            </div>
          </nav>

          <article
            className="pmv-article pmv-a4-sheet"
            style={{ minHeight: 400 }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Lade Kapitel...</div>
            ) : (
              <div>
                {selectedDoc === '01-DECKBLATT.md'
                  ? renderDeckblattCover()
                  : renderMarkdown(docContent, {
                      assetBase: BASE,
                      chapterNumber: chapterNumberForPmvMarkdown(DOCUMENTS, selectedDoc ?? ''),
                      onInternalDocClick: (path) => loadDocument(path),
                    })}
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
      <div className="pmv-seitenfuss pmv-wrap" aria-hidden>
        <span className="pmv-seitenfuss-preview">Präsentationsmappe · (Seitenzahlen beim Drucken)</span>
      </div>
    </div>
  )
}
