/**
 * Marketing ök2 (mök2) – Arbeitsplattform für alles, was mit dem Vertrieb von ök2 zu tun hat.
 * Ideen, Konzepte, Werbeunterlagen; klar strukturiert, bearbeitbar. Ausdruckbar als PDF.
 */

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PROJECT_ROUTES, WILLKOMMEN_ROUTE, AGB_ROUTE, BASE_APP_URL } from '../config/navigation'
import { PRODUCT_WERBESLOGAN, PRODUCT_BOTSCHAFT_2, PRODUCT_ZIELGRUPPE } from '../config/tenantConfig'
import ProductCopyright from '../components/ProductCopyright'

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

function compressImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const maxW = 1200
      const w = img.width
      const h = img.height
      const scale = w > maxW ? maxW / w : 1
      const c = document.createElement('canvas')
      c.width = Math.round(w * scale)
      c.height = Math.round(h * scale)
      const ctx = c.getContext('2d')
      if (!ctx) {
        const r = new FileReader()
        r.onload = () => resolve(String(r.result))
        r.readAsDataURL(file)
        return
      }
      ctx.drawImage(img, 0, 0, c.width, c.height)
      let dataUrl = c.toDataURL('image/jpeg', 0.85)
      if (dataUrl.length > MAX_DATA_URL_LENGTH) dataUrl = c.toDataURL('image/jpeg', 0.7)
      resolve(dataUrl)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      const r = new FileReader()
      r.onload = () => resolve(String(r.result))
      r.readAsDataURL(file)
    }
    img.src = url
  })
}

const printStyles = `
  @media print {
    .marketing-oek2-no-print { display: none !important; }
    .marketing-oek2-page { padding: 0; background: #fff; color: #111; }
    .marketing-oek2-page a { color: #1a0f0a; }
    .marketing-oek2-page section { break-inside: avoid; }
    .marketing-oek2-page ul { margin: 0.4em 0; padding-left: 1.2em; }
    .marketing-oek2-page h1 { font-size: 1.5rem; margin-top: 0; }
    .marketing-oek2-page h2 { font-size: 1.2rem; margin-top: 1rem; }
  }
`

interface MarketingOek2PageProps {
  /** Im Mok2Layout eingebettet → kein eigener Header/Struktur-Box (Leiste + Panel der APf übernehmen) */
  embeddedInMok2Layout?: boolean
}

export default function MarketingOek2Page({ embeddedInMok2Layout }: MarketingOek2PageProps) {
  const location = useLocation()
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
          to={PROJECT_ROUTES['k2-galerie'].home}
          style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem' }}
        >
          ← Projekt-Start
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: 0 }}>Marketing ök2 <span style={{ fontSize: '0.75em', fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>(mök2)</span></h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', maxWidth: '520px' }}>
              Arbeitsplattform für alles, was mit dem Vertrieb von ök2 zu tun hat.
            </p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '1rem', color: '#5ffbf1', fontStyle: 'italic', maxWidth: '520px' }}>
              {slogan}
            </p>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', maxWidth: '520px' }}>
              2. {botschaft}
            </p>
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
          Vertrieb von ök2: Ideen, Konzepte, Werbeunterlagen – im Browser „Als PDF drucken“ wählen oder drucken.
        </p>

        {/* Sichtbare Struktur – alle Sektionen auf einen Blick, mit Sprunglinks */}
        <div className="marketing-oek2-no-print" style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(95,251,241,0.08)', border: '1px solid rgba(95,251,241,0.35)', borderRadius: '10px' }}>
          <h3 style={{ fontSize: '1rem', margin: '0 0 0.75rem', color: '#5ffbf1', fontWeight: 600 }}>📋 Struktur der mök2</h3>
          <ol style={{ margin: 0, paddingLeft: '1.35rem', lineHeight: 1.9, color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem' }}>
            <li><a href="#mok2-1" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>USPs</strong> (Unique Selling Points)</a></li>
            <li><a href="#mok2-2" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Marktchancen – Stärken</strong></a></li>
            <li><a href="#mok2-3" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Marktchancen – Herausforderungen</strong></a></li>
            <li><a href="#mok2-4" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Fazit & nächste Schritte</strong></a></li>
            <li><a href="#mok2-5" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Weitere Ideen & Konzepte</strong></a></li>
            <li><a href="#mok2-6" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Empfehlungs-Programm</strong> (Vertrieb durch Nutzer:innen)</a></li>
            <li><a href="#mok2-7" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Promotion für alle Medien</strong></a></li>
            <li><a href="#mok2-8" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>APf-Struktur:</strong> Marketingarbeit organisieren</a></li>
            <li><a href="#mok2-9" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Werbeunterlagen</strong> (bearbeitbar)</a></li>
            <li><Link to={PROJECT_ROUTES['k2-galerie'].licences} style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>10. Lizenzen</strong> (Konditionen & Vergebung)</Link></li>
            <li><a href="#mok2-lizenz-pakete-aussen" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Lizenz-Pakete für Außen</strong> (Werbung, Pitch, Flyer)</a></li>
            <li><a href="#mok2-10b-vk2-lizenz" style={{ color: 'var(--k2-accent)', textDecoration: 'none' }}><strong>Lizenzstruktur VK2</strong> (Vereinsplattform – K2-Familie)</a></li>
            <li><Link to={PROJECT_ROUTES['k2-galerie'].empfehlungstool} style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Empfehlungstool</strong> (ID + Empfehlungstext an Freund:innen)</Link></li>
            <li><Link to={WILLKOMMEN_ROUTE} style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>Willkommensseite</strong> (Zugangsbereich, AGB-Bestätigung)</Link></li>
            <li><Link to={AGB_ROUTE} style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>AGB</strong> (Allgemeine Geschäftsbedingungen)</Link></li>
            <li><a href="#mok2-11" style={{ color: '#5ffbf1', textDecoration: 'none' }}><strong>11. Sicherheit & Vor Veröffentlichung</strong> (Checklisten, Auth, RLS – wo alles steht)</a></li>
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
        </div>
      )}

      {/* 1. Markteinschätzung: USPs */}
      <section id="mok2-1" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          1. USPs (Unique Selling Points)
        </h2>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li><strong>Nicht nur eine App – multifunktional am PC/Mac:</strong> Die K2 Galerie ist eine <strong>Arbeitsplattform am Rechner</strong> (Planung, Veröffentlichen, Werbeunterlagen, alle Geräte im Blick) plus Galerie & Kassa auf Tablet/Handy. Diese Kombination – volle Multifunktion am Desktop, gleicher Stand überall – ist in diesem Feld <strong>einzigartig</strong> und zentral für Werbung und Marketing.</li>
          <li><strong>Alles in einer Oberfläche</strong> – Eine App für Galerie-Webauftritt, Werke, Events, Marketing und Kasse; Admin am Rechner, Galerie und Kassa auf Tablet/Handy (QR, gleicher Stand).</li>
          <li><strong>Zielgruppe Künstler:innen</strong> – Selbstvermarktung, eigene Werke, Ausstellungen, Webauftritt; Begriffe und Abläufe passen zu Galerien und Ateliers.</li>
          <li><strong>Marketing aus einem Guss</strong> – PR-Vorschläge aus Stammdaten und Event (Newsletter, Plakat, Presse, Social Media, Event-Flyer im Galerie-Design); mehrere Vorschläge pro Typ; A4/A3/A5; QR-Code-Plakat.</li>
          <li><strong>Technik ohne Vendor-Lock-in</strong> – Plattformneutral (Windows, Android, macOS, iOS, Browser/PWA); moderner Web-Stack; Konfiguration statt Festverdrahtung.</li>
          <li><strong>Kassafunktion & Etiketten</strong> – Kasse/Shop für Verkauf vor Ort (z. B. iPad/Handy); Etikettendruck (z. B. Brother QL) mit Werk-Nummer, Titel, QR-Code, WLAN-fähig; Kundenverwaltung (Kunden-Tab) für Erfassung und Tagesgeschäft.</li>
          <li><strong>Fotostudio</strong> – Professionelle Werkfotos in der App: Objektfreistellung und Pro-Hintergrund direkt im Browser (ohne API-Keys); ideal für Fotos von iPad/iPhone, automatisch aufgewertet beim Hereinladen.</li>
          <li><strong>Mobile und Stand</strong> – Ein Stand überall nach Deploy; Galerie-Assistent für neue Nutzer.</li>
          <li><strong>Datensouveränität und Backup</strong> – Lokale Speicherung, Backup & Wiederherstellung; K2 vs. Demo (ök2) strikt getrennt; keine Datenverluste durch Merge-Logik.</li>
          <li><strong>Professioneller Auftritt</strong> – Deutsche UI, anpassbares Design (Farben, Willkommensbild, Vita, Platzanordnung, Shop).</li>
        </ul>
      </section>

      {/* 2. Marktchancen – Stärken */}
      <section id="mok2-2" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          2. Marktchancen – Stärken
        </h2>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li>Klare Nische: Künstler:innen und kleine Galerien (Webauftritt + Events + Kasse + Marketing aus einer Hand) sind unterversorgt.</li>
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
          <li>Wettbewerb: Differenzierung über „Alles in einer App“ + Galerie-Fokus + PR/Marketing aus einem Guss.</li>
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
            <strong>Empfehlungs-Programm</strong> – Nutzer:innen werben mit Empfehler-ID; 50 % der Lizenzgebühr an Empfehler:in. <a href="#mok2-so-empfiehlst-du" style={{ color: '#5ffbf1', textDecoration: 'none' }}>Kurz-Anleitung „So empfiehlst du“</a>. Details: <a href="#mok2-6" style={{ color: '#5ffbf1', textDecoration: 'none' }}>Sektion 6</a>.
          </li>
          <li>
            <strong>Kooperation (Ziel eintragen):</strong> z. B. Kunstverein / Verband (VK2), Messe, Atelier-Netzwerk. <em style={{ color: 'rgba(255,255,255,0.7)' }}>→ Hier konkreten Namen oder Ziel eintragen, ersten Kontakt planen.</em>
          </li>
          <li>
            <strong>Landing / CTA:</strong> Eine klare Einstiegs-URL für alle Texte (Flyer, Social, E-Mail-Signatur).{' '}
            <a href={`${BASE_APP_URL}${WILLKOMMEN_ROUTE}`} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1', fontWeight: 600 }}>
              {BASE_APP_URL}{WILLKOMMEN_ROUTE}
            </a>
            {' '}(Willkommensseite – Demo, Vorschau, Lizenz anfragen).
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

      {/* Platzhalter für weitere Ideen/Konzepte */}
      <section id="mok2-5" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          5. Weitere Ideen & Konzepte (Sammlung)
        </h2>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li>Optional: KI-Assistent für neue Kunden (Chat/API) – derzeit bewusst ohne externe Funktion.</li>
          <li>Vermarktbare Version: Eine Instanz pro Künstler:in (eigene URL/Subdomain), später Multi-Tenant möglich.</li>
        </ul>
      </section>

      {/* Vermarktungskonzept: Empfehlungs-Programm – als PDF abgelegt */}
      <section id="mok2-6" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          6. Vermarktungskonzept: Empfehlungs-Programm (Vertrieb durch Nutzer:innen)
        </h2>
        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
          Nutzer:innen werben weitere Künstler:innen; Empfehler:innen erhalten 50 % der Lizenzgebühr über eine persönliche Empfehler-ID.
        </p>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li><strong>Grundidee:</strong> Vertrieb durch die Nutzer:innen – Künstler:innen empfehlen die K2 Galerie weiter. Wer wirbt, erhält 50 % der Lizenzgebühr des geworbenen Nutzers/der geworbenen Nutzerin. Jede:r hat eine eindeutige Empfehler-ID; trägt ein neuer Nutzer diese ID ein, wird die Gutschrift zugeordnet.</li>
          <li><strong>Ablauf:</strong> Nutzer:in A erhält in der App eine Empfehler-ID (z. B. Einstellungen → Empfehlungs-Programm), gibt sie an B weiter; B trägt die ID bei Registrierung/Lizenz-Abschluss ein → 50 % der Lizenzgebühr an A.</li>
          <li><strong>Empfehler-ID:</strong> Eindeutig pro Nutzer:in, gut kommunizierbar (z. B. K2-XXXX-YYYY). Optional: Empfehlungs-Link mit ID als Parameter.</li>
          <li><strong>Vergütung:</strong> 50 % der Lizenzgebühr an den Empfehler/die Empfehlerin. Bei <strong>jeder</strong> Zahlung, solange der geworbene Nutzer/die geworbene Nutzerin Lizenzgebühren zahlt – nicht nur bei der Erstanmeldung. Ausgestaltung: Gutschrift, Auszahlung oder Gutschein je nach Betriebsmodell.</li>
          <li><strong>In der App:</strong> ID anzeigen/kopieren (Einstellungen / Empfehlungs-Programm); Eingabe der ID bei Registrierung oder Checkout; bei Speicherung ID prüfen und 50 %-Regel anwenden.</li>
          <li><strong>Rechtliches:</strong> Transparenz in AGB (Wer, wie, wann); Datenschutz nur für Zuordnung; Missbrauch vermeiden (keine Selbstempfehlung, ID nur gültigen Konten zuordnen).</li>
        </ul>
      </section>

      {/* 6a. Kurz-Anleitung: So empfiehlst du die K2 Galerie (für Nutzer:innen) */}
      <section id="mok2-so-empfiehlst-du" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          So empfiehlst du die K2 Galerie (Kurz-Anleitung)
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>
          Für Nutzer:innen – in 3 Schritten: ID/Link holen, teilen, Geworbene nutzt Link. Du erhältst 50 % der Lizenzgebühr, wenn die Person deine Empfehlung annimmt.
        </p>
        <ol style={{ lineHeight: 1.7, paddingLeft: '1.5em', margin: '0 0 1rem' }}>
          <li><strong>Wo finde ich meine Empfehler-ID?</strong> In der App: <strong>Einstellungen → Empfehlungs-Programm</strong> (oder über mök2: <strong>Empfehlungstool</strong>). Dort siehst du deine ID und einen <strong>Empfehlungs-Link</strong> – Link kopieren oder „E-Mail öffnen“ / „WhatsApp teilen“.</li>
          <li><strong>Wem gebe ich den Link?</strong> Freund:innen, anderen Künstler:innen, Galerien – allen, die eine eigene Galerie-Webseite + Kasse + Werbung aus einer Hand suchen.</li>
          <li><strong>Was passiert bei der Person?</strong> Sie öffnet den Link → Willkommensseite (Demo, Vorschau, „Lizenz anfragen“). Wenn sie eine Lizenz abschließt und deine Empfehlung annimmt (der Link enthält deine ID), erhältst du <strong>50 % der Lizenzgebühr</strong> – bei jeder Zahlung, solange sie Kunde bleibt.</li>
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
        <p style={{ marginBottom: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.1)', borderRadius: '8px', borderLeft: '4px solid #5ffbf1', fontSize: '1.05rem', lineHeight: 1.5 }}>
          <strong>1. Werbeslogan:</strong> {PRODUCT_WERBESLOGAN}
        </p>
        <p style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(95,251,241,0.1)', borderRadius: '8px', borderLeft: '4px solid #5ffbf1', fontSize: '1.05rem', lineHeight: 1.5 }}>
          <strong>2. Wichtige Botschaft:</strong> {PRODUCT_BOTSCHAFT_2}
        </p>
        <p style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(34, 197, 94, 0.12)', borderRadius: '8px', borderLeft: '4px solid #22c55e', fontSize: '1.05rem', lineHeight: 1.5 }}>
          <strong>3. Zentrale Information für Außenkommunikation (Werbung, Marketing, Presse):</strong> Es handelt sich hier <strong>nicht um eine normale App</strong>, sondern um eine <strong>multifunktionale Arbeitsplattform am PC/Mac</strong> – mit Galerie, Kassa, Veröffentlichen, Planung und Werbeunterlagen aus einer Hand. Mobil: Galerie und Kassa, gleicher Stand. In dieser Kombination sind wir in diesem Feld <strong>einzigartig</strong> – das soll in der Kommunikation nach außen klar werden.
        </p>
        <p style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(139, 92, 246, 0.12)', borderRadius: '8px', borderLeft: '4px solid #8b5cf6', fontSize: '1.05rem', lineHeight: 1.5 }}>
          <strong>4. Unsere Zielgruppe (ein Satz):</strong> {PRODUCT_ZIELGRUPPE}
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
          <li><strong>Marketing aus einem Guss:</strong> Newsletter, Plakat, Presse, Social Media und QR-Plakat werden aus denselben Stammdaten erzeugt – einheitlich, sofort nutzbar.</li>
          <li><strong>Plattformneutral:</strong> Windows, Android, Mac, iOS – Browser/PWA, keine App-Store-Pflicht, keine Mac-Pflicht für Kunden.</li>
          <li><strong>Fotostudio in der App:</strong> Objektfreistellung und Pro-Hintergrund im Browser, ideal für Fotos vom Handy/Tablet – ohne externe Dienste.</li>
        </ul>

        <h3 style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.9)', marginTop: '1rem', marginBottom: '0.5rem' }}>Wodurch zeichnet sich das Produkt besonders aus?</h3>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.2em', margin: 0 }}>
          <li><strong>Eine Oberfläche, alle Geräte:</strong> Admin am Rechner, Galerie und Kasse auf Tablet/Handy – gleicher Stand per QR, kein Chaos.</li>
          <li><strong>PR-Vorschläge aus deinen Daten:</strong> Event anlegen → fertige Texte und Formate für Newsletter, Presse, Social Media, Flyer, Plakat – im Galerie-Design.</li>
          <li><strong>Kasse & Etiketten:</strong> Verkauf vor Ort direkt aus der App; Etikettendruck (z. B. Brother QL) mit Werk-Nummer, Titel, QR – WLAN-fähig.</li>
          <li><strong>Datensouveränität:</strong> Lokale Speicherung, Backup & Wiederherstellung – deine Daten bleiben unter deiner Kontrolle.</li>
          <li><strong>Deutsche UI, seriös:</strong> Keine Anglizismen-Flut; klare, professionelle Oberfläche für Galerien und Ateliers.</li>
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
          <li><strong>Empfehlungs-Programm:</strong> Vertrieb durch Nutzer:innen (Sektion 6) – ID-Konzept und 50 %-Regel für Partner und geworbene Künstler:innen kommunizieren.</li>
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
          Präsentationsmappe, Social-Media-Masken und Flyer gehören zu mök2. Dort sind die Texte (Slogan, Botschaft) <strong>bearbeitbar</strong>; Änderungen erscheinen auch hier oben.
        </p>
        <ol style={{ lineHeight: 1.7, paddingLeft: '1.5em', margin: '0 0 1rem' }}>
          <li><strong>Präsentationsmappe</strong> – Deckblatt, Kernbotschaften, USPs (A4, druckbar)</li>
          <li><strong>Social-Media-Masken</strong> – Instagram Quadrat/Story, Facebook, LinkedIn (Standardformate)</li>
          <li><strong>Flyer A5</strong> – Produkt-Flyer mit Slogan und Botschaft</li>
        </ol>
        <p>
          <Link to={PROJECT_ROUTES['k2-galerie'].werbeunterlagen} style={{ color: '#5ffbf1', fontWeight: 600, textDecoration: 'none' }}>
            📁 Werbeunterlagen öffnen & Texte bearbeiten →
          </Link>
        </p>
      </section>

      {/* 10. Lizenzen (mök2) – Konditionen, Vergebung, Abrechnung Empfehlungs-Programm */}
      <section id="mok2-10" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          10. Lizenzen (Konditionen & Vergebung)
        </h2>
        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
          Lizenz-Stufen (Basic, Pro, Enterprise), Preismodelle und die <strong>Vergabe von Lizenzen</strong> gehören zur Vertriebs-Arbeitsplattform. Beim Vergeben kann optional eine <strong>Empfehler-ID</strong> erfasst werden – Grundlage für die automatisierte Abrechnung des Empfehlungs-Programms (Multi-Level-Vergütung). Doku: <code>docs/LICENCE-STRUKTUR.md</code>, <code>docs/ABRECHNUNGSSTRUKTUR-EMPFEHLUNGSPROGRAMM.md</code>.
        </p>
        <p>
          <Link to={PROJECT_ROUTES['k2-galerie'].licences} style={{ color: '#5ffbf1', fontWeight: 600, textDecoration: 'none' }}>
            💼 Lizenzen verwalten (Konditionen & Lizenz vergeben) →
          </Link>
        </p>
      </section>

      {/* 10a. Lizenz-Pakete für Außen – kompakt für Werbung, Pitch, Flyer (nach außen sichtbar) */}
      <section id="mok2-lizenz-pakete-aussen" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Lizenz-Pakete für Außen (Werbung, Pitch, Flyer)
        </h2>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
          Kurzüberblick für Interessent:innen – hier prüfen und anpassen; dann in Werbeunterlagen und bei Anfragen nutzen.
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
              <td style={{ padding: '0.5rem 0.75rem' }}>Galerie-Webauftritt, Werke, einfacher Shop</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>auf Anfrage</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Pro</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Alles in Basic + Events, Kasse, Etiketten, Marketing aus einem Guss</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>auf Anfrage</td>
            </tr>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>VK2 (Verein)</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>Pro für Kunstvereine; ab 10 Mitgliedern kostenfrei, Lizenzmitglieder 50 %</td>
              <td style={{ padding: '0.5rem 0.75rem' }}>auf Anfrage</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
          Preise konkretisieren und hier eintragen (oder „auf Anfrage“ beibehalten). Dann in Präsentationsmappe und bei „Lizenz anfragen“ nutzen.
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>
          <strong>Marktcheck:</strong> Was Nutzer zahlen würden &amp; was Vergleichsprodukte kosten → <code>docs/MARKTCHECK-PREISE-BASIC-PRO-VERGLEICH.md</code> (Orientierung: Basic 10–15 €/Monat, Pro 25–35 €/Monat).
        </p>
      </section>

      {/* 10b. Lizenzstruktur VK2 (Vereinsplattform) – eigener Bereich, in mök2 festgelegt */}
      <section id="mok2-10b-vk2-lizenz" style={{ marginBottom: '2rem', breakInside: 'avoid' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--k2-accent)', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255, 140, 66, 0.5)', paddingBottom: '0.35rem' }}>
          Lizenzstruktur VK2 (Vereinsplattform)
        </h2>
        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
          <strong>VK2</strong> = Plattform für <strong>Künstlervereine</strong>. Dritte Lizenzvariante neben Einzelkünstler und (später) größere Galerie.
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
          <strong>Kunstvereine = Multiplikatoren:</strong> Ein Verein entscheidet → viele Mitglieder sichtbar. Eindruckvolles Angebot lohnt sich doppelt (Referenz, Weiterempfehlung). <strong>Kernbotschaft:</strong> „Eine Plattform für Ihren Verein: alle Mitglieder sichtbar, eine Galerie, ein Auftritt – ab 10 Mitgliedern für den Verein kostenfrei.“ Nächste Schritte: Pilot-Verein, Onboarding „Verein in 3 Schritten“. → <code style={{ color: 'var(--k2-accent)' }}>docs/KUNSTVEREINE-MULTIPLIKATOREN.md</code>
        </p>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
          Quelle: <code>docs/VK2-VEREINSPLATTFORM.md</code>. Beim Drucken dieser mök2-Seite („Als PDF drucken“) ist die VK2-Lizenzstruktur mit dabei.
        </p>
      </section>

      {/* 11. Sicherheit & Vor Veröffentlichung – alle Infos dokumentiert, jederzeit abrufbar */}
      <section id="mok2-11" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          11. Sicherheit & Vor Veröffentlichung
        </h2>
        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
          Alle Infos zu <strong>Sicherheit, Produkt-Label, Admin-Auth und Vor Veröffentlichung</strong> sind im Projekt dokumentiert und jederzeit abrufbar. Einstieg: <strong>HAUS-INDEX.md</strong> (Root) und <strong>docs/00-INDEX.md</strong>.
        </p>
        <ul style={{ lineHeight: 1.7, paddingLeft: '1.5em', margin: '0 0 1rem' }}>
          <li><strong>Vor Veröffentlichung:</strong> <code>docs/VOR-VEROEFFENTLICHUNG.md</code> – Checkliste vor Go-Live (Auth, Migration 002, npm audit, AGB/DSGVO, Deployment). Nicht vergessen.</li>
          <li><strong>Admin-Auth einrichten:</strong> <code>docs/ADMIN-AUTH-SETUP.md</code> – Nutzer in Supabase anlegen, RLS-Migration anwenden.</li>
          <li><strong>Produkt-Label / Regress:</strong> <code>docs/PRODUKT-LABEL-SICHERHEIT-ROADMAP.md</code> – Ziele, Maßnahmen, Nachweis für Zahlungen/Vergütung.</li>
          <li><strong>Stabilität & Einbruch:</strong> <code>docs/SICHERHEIT-STABILITAET-CHECKLISTE.md</code> – 5 Punkte Einsturz, 5 Punkte Einbruch, Skala.</li>
          <li><strong>Supabase RLS:</strong> <code>docs/SUPABASE-RLS-SICHERHEIT.md</code> – Status, später schärfen.</li>
        </ul>
        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
          Beim Drucken dieser mök2-Seite („Als PDF drucken“) ist dieser Verweis mit dabei – so bleibt er griffbereit.
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
          „Mit K2 Galerie haben Sie jederzeit einen druckfertigen Werkkatalog – vom ersten Pinselstrich bis zum Verkauf. Eine Werkkarte pro Bild, gefilterte Listen für den Steuerberater, die Versicherung oder Ausstellungsorganisatoren – ohne Zusatz-Software, direkt aus der App."
        </p>
      </section>

      <section id="mok2-14" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(251,191,36,0.4)', pageBreakInside: 'avoid' as const }}>
        <h2 style={{ fontSize: '1.25rem', color: '#fbbf24', marginBottom: '0.5rem', borderBottom: '1px solid rgba(251,191,36,0.4)', paddingBottom: '0.35rem' }}>
          14. 💎 Excellent-Lizenz – das Premium-Paket für professionelle Künstler:innen
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '1rem', color: 'rgba(255,255,255,0.85)' }}>
          Neben Basic (49 €), Pro (99 €) und Kunstvereine (VK2) gibt es ab sofort die <strong style={{ color: '#fbbf24' }}>Excellent-Lizenz (149 €/Monat)</strong> – das Rundum-Paket für professionelle Galerien und Künstler:innen mit gehobenem Anspruch.
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
          „Mit K2 Galerie Excellent haben Sie nicht nur eine digitale Galerie – Sie haben ein vollständiges Werk-Archiv mit Echtheitszertifikaten, eine eigene Einladungsliste für Vernissagen, eine fertige Pressemappe und direkte Anfragen von Interessenten. Alles in einer App, ohne Zusatz-Software."
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
          <li>Ihre Stimme zählt – Feedback fließt direkt in die Weiterentwicklung</li>
          <li>Kein „Beta" – sondern: <em>„Wir bauen das gemeinsam"</em></li>
        </ul>

        <h3 style={{ fontSize: '1rem', color: '#fbbf24', margin: '1.25rem 0 0.5rem' }}>Die Leitkünstler:innen – Multiplikatoren</h3>
        <p style={{ lineHeight: 1.75, marginBottom: '0.75rem' }}>
          5 bis 10 ausgewählte Künstler:innen erhalten die K2 Galerie <strong style={{ color: '#5ffbf1' }}>kostenlos</strong> –
          als Zeichen des Vertrauens, nicht als Werbegeschäft. Sie werden nicht gebeten zu werben.
          Sie werden gebeten, <strong>ehrlich zu sein</strong>. Was sie berichten, kommt von allein.
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

      <footer style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
        <ProductCopyright /> · Stand: Februar 2026 · Quelle: USP-UND-MARKTCHANCEN.md, VERMARKTUNGSKONZEPT-EMPFEHLUNGSPROGRAMM.md, Produkt-Vision, Galerie-App Feature-Stand.
      </footer>
    </article>
  )
}
