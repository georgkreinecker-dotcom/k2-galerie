/**
 * Werbeunterlagen – Teil von mök2 (Marketing ök2). Klar strukturiert, bearbeitbar.
 * Eigenes Promotion-Design. Texte (Slogan, Botschaft) hier bearbeiten → erscheinen auch auf mök2.
 * Modus „Für K2“: Stammdaten + QR zur echten K2-Galerie (Flyer/Werbedokumente für Martina & Georg).
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { PROJECT_ROUTES, BASE_APP_URL, OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE, K2_GALERIE_APF_EINSTIEG, flyerEventBogenUrl } from '../config/navigation'
import { useQrVersionTimestamp, useStableQrBustedUrl } from '../hooks/useServerBuildTimestamp'
import { PRODUCT_BRAND_NAME, PRODUCT_WERBESLOGAN, PRODUCT_BOTSCHAFT_2, PRODUCT_COPYRIGHT } from '../config/tenantConfig'
import { WERBEUNTERLAGEN_STIL, SOCIAL_MEDIA_FORMATE, PROMO_FONTS_URL } from '../config/marketingWerbelinie'
import { loadStammdaten } from '../utils/stammdatenStorage'

const PRINT_HIDE = 'werbeunterlagen-no-print'
const MOK2_SLOGAN_KEY = 'k2-mok2-werbeslogan'
const MOK2_BOTSCHAFT_KEY = 'k2-mok2-botschaft2'

function loadSlogan(): string {
  try {
    const v = localStorage.getItem(MOK2_SLOGAN_KEY)
    if (v && v.trim()) return v.trim()
  } catch (_) {}
  return PRODUCT_WERBESLOGAN
}

function loadBotschaft(): string {
  try {
    const v = localStorage.getItem(MOK2_BOTSCHAFT_KEY)
    if (v && v.trim()) return v.trim()
  } catch (_) {}
  return PRODUCT_BOTSCHAFT_2
}

const printStyles = `
  @media print {
    .${PRINT_HIDE} { display: none !important; }
    .werbeunterlagen-page { background: #fff !important; padding: 0 2mm !important; color: #1c1a18 !important; }
    .werbeunterlagen-page .präsentationsmappe-seite { box-shadow: none !important; page-break-after: always; }
    .werbeunterlagen-page .social-mask-wrap { break-inside: avoid; }
    .werbeunterlagen-page .flyer-a5 { page-break-after: always; }
  }
`

interface WerbeunterlagenPageProps {
  /** Im Mok2Layout eingebettet → Zurück-Links weglassen (Leiste hat Navigation) */
  embeddedInMok2Layout?: boolean
}

type WerbeModus = 'oek2' | 'k2'

function getK2Kontakt(): { email: string; phone: string } {
  try {
    const g = loadStammdaten('k2', 'gallery') as { email?: string; phone?: string }
    const m = loadStammdaten('k2', 'martina') as { email?: string; phone?: string }
    return {
      email: (g?.email && g.email.trim()) || (m?.email && m.email.trim()) || '',
      phone: (g?.phone && g.phone.trim()) || (m?.phone && m.phone.trim()) || '',
    }
  } catch {
    return { email: '', phone: '' }
  }
}

export default function WerbeunterlagenPage({ embeddedInMok2Layout }: WerbeunterlagenPageProps) {
  const s = WERBEUNTERLAGEN_STIL
  const [slogan, setSlogan] = useState(loadSlogan)
  const [botschaft, setBotschaft] = useState(loadBotschaft)
  const [modus, setModus] = useState<WerbeModus>('oek2')
  const [willkommenQrUrl, setWillkommenQrUrl] = useState('')
  const [galerieQrUrl, setGalerieQrUrl] = useState('')
  const { versionTimestamp: qrVersionTs } = useQrVersionTimestamp()
  const k2Kontakt = modus === 'k2' ? getK2Kontakt() : { email: '', phone: '' }

  useEffect(() => {
    setSlogan(loadSlogan())
    setBotschaft(loadBotschaft())
  }, [])

  const willkommenBaseUrl = BASE_APP_URL + OEK2_NEUER_BESUCHER_EINSTIEG_ROUTE
  const { qrUrl: willkommenFullUrl, refreshQrUrl: refreshWillkommenQrUrl } = useStableQrBustedUrl(willkommenBaseUrl, qrVersionTs)
  // Eisernes Gesetz: Im Modus ök2/Demo keine K2-Galerie-URL – nur Demo-Galerie
  const galerieBaseUrl = modus === 'oek2'
    ? BASE_APP_URL + PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau
    : BASE_APP_URL + PROJECT_ROUTES['k2-galerie'].galerie
  const { qrUrl: galerieFullUrl, refreshQrUrl: refreshGalerieQrUrl } = useStableQrBustedUrl(galerieBaseUrl, qrVersionTs)

  useEffect(() => {
    QRCode.toDataURL(willkommenFullUrl, { width: 200, margin: 1 })
      .then(setWillkommenQrUrl)
      .catch(() => setWillkommenQrUrl(''))
  }, [willkommenFullUrl])

  useEffect(() => {
    QRCode.toDataURL(galerieFullUrl, { width: 200, margin: 1 })
      .then(setGalerieQrUrl)
      .catch(() => setGalerieQrUrl(''))
  }, [galerieFullUrl, modus])

  const saveSlogan = (value: string) => {
    const v = value.trim() || PRODUCT_WERBESLOGAN
    setSlogan(v)
    try { localStorage.setItem(MOK2_SLOGAN_KEY, v) } catch (_) {}
  }
  const saveBotschaft = (value: string) => {
    const v = value.trim() || PRODUCT_BOTSCHAFT_2
    setBotschaft(v)
    try { localStorage.setItem(MOK2_BOTSCHAFT_KEY, v) } catch (_) {}
  }

  return (
    <div className="werbeunterlagen-page print-compact" style={{ background: s.bgDark, minHeight: '100vh', color: s.text, fontFamily: s.fontBody }}>
      <link rel="stylesheet" href={PROMO_FONTS_URL} />
      <style>{printStyles}</style>

      <header className={PRINT_HIDE} style={{ padding: '1.5rem 2rem', borderBottom: `2px solid ${s.accentSoft}` }}>
        {!embeddedInMok2Layout && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to={K2_GALERIE_APF_EINSTIEG} style={{ color: s.muted, textDecoration: 'none', fontSize: '0.9rem' }}>← Projekt-Start</Link>
          <Link to={PROJECT_ROUTES['k2-galerie'].marketingOek2} style={{ color: s.accent, textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>← mök2 (Marketing ök2)</Link>
        </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: s.fontHeading, fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: 0, color: s.accent, fontWeight: 600 }}>
              Werbeunterlagen <span style={{ fontSize: '0.7em', fontWeight: 400, color: s.muted }}>(mök2)</span>
            </h1>
            <p style={{ color: s.muted, marginTop: '0.35rem', fontSize: '0.9rem' }}>
              <strong>Struktur:</strong> 1. Prospekt · 2. Social-Media-Masken · 3. Flyer A5 · 4. QR &amp; Link · 5. Präsentationsmappen (Links zum Mitsenden). Texte unten bearbeiten → gelten überall.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: s.muted }}>Anzeige für:</span>
              <button type="button" onClick={() => setModus('oek2')} style={{ padding: '0.35rem 0.75rem', border: `1px solid ${modus === 'oek2' ? s.accent : s.accentSoft}`, borderRadius: 6, background: modus === 'oek2' ? s.accentSoft : 'transparent', color: s.text, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: modus === 'oek2' ? 600 : 400 }}>ök2 / Demo</button>
              <button type="button" onClick={() => setModus('k2')} style={{ padding: '0.35rem 0.75rem', border: `1px solid ${modus === 'k2' ? s.accent : s.accentSoft}`, borderRadius: 6, background: modus === 'k2' ? s.accentSoft : 'transparent', color: s.text, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: modus === 'k2' ? 600 : 400 }}>K2 (echte Galerie)</button>
            </div>
          </div>
          <button type="button" onClick={() => window.print()} style={{ padding: '0.6rem 1.2rem', background: s.gradientAccent, color: '#fff', border: 'none', borderRadius: s.radius, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            📄 Als PDF drucken
          </button>
          <button type="button" onClick={() => { refreshWillkommenQrUrl(); refreshGalerieQrUrl() }} style={{ padding: '0.6rem 1rem', background: s.bgCard, color: s.text, border: `1px solid ${s.accentSoft}`, borderRadius: s.radius, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            🔄 QR neu erzeugen
          </button>
        </div>

        {/* Bearbeitbare Texte (mök2) */}
        <div className={PRINT_HIDE} style={{ marginTop: '1.25rem', padding: '1rem', background: s.bgCard, borderRadius: s.radius, border: `1px solid ${s.accentSoft}` }}>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 600, color: s.text }}>Texte bearbeiten (erscheinen in allen Unterlagen und auf mök2)</p>
          <div style={{ display: 'grid', gap: '0.75rem', maxWidth: '600px' }}>
            <label style={{ fontSize: '0.8rem', color: s.muted }}>1. Werbeslogan</label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              onBlur={(e) => saveSlogan(e.target.value)}
              placeholder={PRODUCT_WERBESLOGAN}
              style={{ padding: '0.5rem 0.75rem', border: `1px solid ${s.accentSoft}`, borderRadius: 6, fontFamily: 'inherit', fontSize: '0.95rem', background: s.bgDark, color: s.text }}
            />
            <label style={{ fontSize: '0.8rem', color: s.muted }}>2. Wichtige Botschaft</label>
            <input
              type="text"
              value={botschaft}
              onChange={(e) => setBotschaft(e.target.value)}
              onBlur={(e) => saveBotschaft(e.target.value)}
              placeholder={PRODUCT_BOTSCHAFT_2}
              style={{ padding: '0.5rem 0.75rem', border: `1px solid ${s.accentSoft}`, borderRadius: 6, fontFamily: 'inherit', fontSize: '0.95rem', background: s.bgDark, color: s.text }}
            />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* ─── Prospekt ─── */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className={PRINT_HIDE} style={{ fontFamily: s.fontHeading, fontSize: '1.35rem', color: s.accent, marginBottom: '1rem', borderBottom: `1px solid ${s.accentSoft}`, paddingBottom: '0.5rem' }}>
            1. Prospekt
          </h2>

          <div className={PRINT_HIDE} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <Link
              to={PROJECT_ROUTES['k2-galerie'].prospektGalerieeroeffnung + (modus === 'oek2' ? '?context=oeffentlich' : '')}
              style={{ padding: '0.5rem 0.85rem', background: s.bgCard, border: `1px solid ${s.accentSoft}`, borderRadius: 8, textDecoration: 'none', color: s.text, fontWeight: 600 }}
            >
              🧾 Prospekt Galerieeröffnung (A4)
            </Link>
            <Link
              to={flyerEventBogenUrl({
                tenant: modus === 'oek2' ? 'oeffentlich' : 'k2',
              })}
              style={{ padding: '0.5rem 0.85rem', background: '#b54a1e', border: '1px solid #8a3a18', borderRadius: 8, textDecoration: 'none', color: '#fff', fontWeight: 700 }}
            >
              📐 Flyer-Master (A4, 2× A5) – Live-Vorschau &amp; Bearbeiten
            </Link>
            <Link
              to={flyerEventBogenUrl({
                mode: 'a3',
                tenant: modus === 'oek2' ? 'oeffentlich' : 'k2',
                ...(modus === 'oek2' ? { fromPublicGalerie: true } : { fromAdminDerivation: true }),
              })}
              style={{ padding: '0.5rem 0.85rem', background: s.bgCard, border: `1px solid ${s.accentSoft}`, borderRadius: 8, textDecoration: 'none', color: s.text, fontWeight: 600 }}
            >
              🖨️ Plakat A3 (vom Flyer-Master abgeleitet)
            </Link>
          </div>

          {/* Deckblatt */}
          <div className="präsentationsmappe-seite" style={{ width: '210mm', maxWidth: '100%', minHeight: '297mm', background: s.gradient, borderRadius: s.radius, padding: '18mm 20mm', marginBottom: '1.5rem', boxShadow: s.shadow, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'radial-gradient(ellipse 90% 70% at 50% 0%, ' + s.accentSoft + ', transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '260mm' }}>
              <p style={{ fontFamily: s.fontHeading, fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: s.muted, margin: 0 }}>Produkt · K2 Galerie</p>
              <h1 style={{ fontFamily: s.fontHeading, fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 600, margin: '0.5rem 0 1rem', color: s.accent }}>
                {PRODUCT_BRAND_NAME}
              </h1>
              <div style={{ width: 60, height: 3, background: s.gradientAccent, marginBottom: '1.5rem', borderRadius: 2 }} />
              <p style={{ fontSize: '1.15rem', lineHeight: 1.6, color: s.text, maxWidth: '85%', margin: 0 }}>
                {slogan}
              </p>
              <p style={{ fontSize: '1rem', color: s.muted, marginTop: '1rem', marginBottom: 0 }}>
                {botschaft}
              </p>
            </div>
          </div>

          {/* Seite 2: Kernbotschaften */}
          <div className="präsentationsmappe-seite" style={{ width: '210mm', maxWidth: '100%', minHeight: '297mm', background: s.gradient, borderRadius: s.radius, padding: '18mm 20mm', marginBottom: '1.5rem', boxShadow: s.shadow, position: 'relative' }}>
            <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.5rem', color: s.text, margin: '0 0 1.5rem', borderBottom: `2px solid ${s.accent}`, paddingBottom: '0.5rem' }}>Kernbotschaften</h2>
            <div style={{ padding: '1rem 0', borderLeft: `4px solid ${s.accent}`, paddingLeft: '1.25rem', marginBottom: '1.25rem', background: s.accentSoft, borderRadius: '0 8px 8px 0' }}>
              <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.6 }}><strong>1.</strong> {slogan}</p>
            </div>
            <div style={{ padding: '1rem 0', borderLeft: `4px solid ${s.accent}`, paddingLeft: '1.25rem', marginBottom: '1.25rem', background: s.accentSoft, borderRadius: '0 8px 8px 0' }}>
              <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.6 }}><strong>2.</strong> {botschaft}</p>
            </div>
            <h3 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, marginTop: '1.5rem', marginBottom: '0.75rem' }}>Zielgruppe</h3>
            <p style={{ margin: 0, color: s.muted, lineHeight: 1.6 }}>Künstler:innen – Selbstvermarktung, eigene Werke, Ausstellungen, Webauftritt. Eine App für Galerie, Kasse, Marketing und PR.</p>
          </div>

          {/* Seite 3: USPs kompakt */}
          <div className="präsentationsmappe-seite" style={{ width: '210mm', maxWidth: '100%', minHeight: '297mm', background: s.gradient, borderRadius: s.radius, padding: '18mm 20mm', marginBottom: '1.5rem', boxShadow: s.shadow, position: 'relative' }}>
            <h2 style={{ fontFamily: s.fontHeading, fontSize: '1.5rem', color: s.text, margin: '0 0 1rem', borderBottom: `2px solid ${s.accent}`, paddingBottom: '0.5rem' }}>Was uns auszeichnet</h2>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8, color: s.text }}>
              <li>Alles in einer Oberfläche: Galerie, Werke, Events, Marketing, Kasse</li>
              <li>Marketing aus einem Guss: Newsletter, Plakat, Presse, Social Media aus deinen Daten</li>
              <li>Plattformneutral: Windows, Android, Mac, iOS – Browser/PWA</li>
              <li>Professionelle Werkfotos in der App: Freistellung & Pro-Hintergrund</li>
              <li>Empfehlungs-Programm: Durch Weiterempfehlung Nutzung vergünstigen und Einkommen erzielen</li>
            </ul>
            <h3 style={{ fontFamily: s.fontHeading, fontSize: '1.15rem', color: s.text, marginTop: '1.5rem', marginBottom: '0.5rem' }}>Nutzen</h3>
            <p style={{ margin: 0, color: s.muted, lineHeight: 1.6 }}>Zeit sparen, professioneller Auftritt, eine Quelle für alle Kanäle, Kontrolle über eigene Daten.</p>
          </div>
        </section>

        {/* ─── Social-Media-Masken ─── */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 className={PRINT_HIDE} style={{ fontFamily: s.fontHeading, fontSize: '1.35rem', color: s.accent, marginBottom: '1rem', borderBottom: `1px solid ${s.accentSoft}`, paddingBottom: '0.5rem' }}>
            2. Social-Media-Masken
          </h2>
          <p className={PRINT_HIDE} style={{ color: s.muted, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Standardformate – Screenshot oder „Als PDF drucken“ für Export. Max. 400px Breite zur Vorschau; Originalmaße in px angegeben.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {Object.entries(SOCIAL_MEDIA_FORMATE).map(([key, { w, h, label }]) => (
              <div key={key} className="social-mask-wrap" style={{ breakInside: 'avoid' }}>
                <p className={PRINT_HIDE} style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: s.muted }}>{label} · {w}×{h} px</p>
                <div
                  style={{
                    maxWidth: 400,
                    width: '100%',
                    aspectRatio: `${w} / ${h}`,
                    background: s.gradient,
                    borderRadius: s.radius,
                    padding: 'clamp(8px, 3%, 20px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    boxShadow: s.shadow,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse 70% 60% at 50% 20%, ${s.accentSoft}, transparent 55%)`, pointerEvents: 'none' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <p style={{ fontFamily: s.fontHeading, fontSize: 'clamp(0.7rem, 2vw, 1rem)', fontWeight: 600, margin: 0, color: s.accent }}>{PRODUCT_BRAND_NAME}</p>
                    <p style={{ fontSize: 'clamp(0.55rem, 1.5vw, 0.75rem)', color: s.text, margin: '0.25em 0 0', lineHeight: 1.3 }}>{slogan}</p>
                    <p style={{ fontSize: 'clamp(0.5rem, 1.2vw, 0.65rem)', color: s.muted, margin: '0.35em 0 0' }}>{botschaft}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Flyer A5 ─── */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 className={PRINT_HIDE} style={{ fontFamily: s.fontHeading, fontSize: '1.35rem', color: s.accent, marginBottom: '1rem', borderBottom: `1px solid ${s.accentSoft}`, paddingBottom: '0.5rem' }}>
            3. Flyer (A5)
          </h2>
          <p className={PRINT_HIDE} style={{ color: s.muted, marginBottom: '0.75rem', fontSize: '0.9rem', maxWidth: '42rem' }}>
            Die <strong>App mit Master A5 und Live-Vorschau</strong> (zwei A5-Seiten auf einem A4-Bogen, Event- und Stammdaten, QR, Ableitungen A3/A6/Karte) öffnest du hier – nicht nur die statische Vorschau unten.
          </p>
          <div className={PRINT_HIDE} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <Link
              to={flyerEventBogenUrl({
                tenant: modus === 'oek2' ? 'oeffentlich' : 'k2',
              })}
              style={{ padding: '0.5rem 0.85rem', background: '#b54a1e', border: '1px solid #8a3a18', borderRadius: 8, textDecoration: 'none', color: '#fff', fontWeight: 700 }}
            >
              Flyer-Master in der App öffnen →
            </Link>
          </div>

          <div className="flyer-a5" style={{ width: '148mm', maxWidth: '100%', minHeight: '210mm', background: s.gradient, borderRadius: s.radius, padding: '12mm 14mm', marginBottom: '1rem', boxShadow: s.shadow, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '80%', height: '60%', background: `radial-gradient(ellipse at 100% 0%, ${s.accentSoft}, transparent 60%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontFamily: s.fontHeading, fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: s.muted, margin: 0 }}>Plattform für den gesamten Markt – Kunstmarkt ist der Einstieg</p>
              <h1 style={{ fontFamily: s.fontHeading, fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, margin: '0.35rem 0 0.75rem', color: s.accent }}>
                {PRODUCT_BRAND_NAME}
              </h1>
              <div style={{ width: 48, height: 2, background: s.gradientAccent, marginBottom: '1rem', borderRadius: 2 }} />
              <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: s.text, margin: 0 }}>{slogan}</p>
              <p style={{ fontSize: '0.85rem', color: s.muted, marginTop: '0.75rem', marginBottom: '1.25rem' }}>{botschaft}</p>
              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.8rem', lineHeight: 1.7, color: s.muted }}>
                <li>Eine App: Galerie, Werke, Events, Kasse, Marketing</li>
                <li>PR aus einem Guss: Newsletter, Plakat, Presse, Social</li>
                <li>Plattformneutral · Professionelle Werkfotos in der App</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Weiterführender Link & QR-Code zum Eingangstor (Zugangsbereich) */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 className={PRINT_HIDE} style={{ fontFamily: s.fontHeading, fontSize: '1.35rem', color: s.accent, marginBottom: '1rem', borderBottom: `1px solid ${s.accentSoft}`, paddingBottom: '0.5rem' }}>
            4. Weiterführender Link & QR-Code
          </h2>
          <p style={{ color: s.muted, marginBottom: '1rem', fontSize: '0.9rem' }}>
            Auf Flyer, Präsentation oder Social Media: Link oder QR-Code führen zum Eingangstor. Dort starten Nutzer:innen direkt in den öffentlichen Einstieg.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '1.5rem', padding: '1.25rem', background: s.bgCard, borderRadius: s.radius, border: `1px solid ${s.accentSoft}` }}>
            <div>
              {willkommenQrUrl ? (
                <img src={willkommenQrUrl} alt="QR-Code Eingangstor" style={{ width: 160, height: 160, display: 'block', borderRadius: 4 }} />
              ) : (
                <div style={{ width: 160, height: 160, background: s.bgElevated, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: s.muted }}>QR wird geladen…</div>
              )}
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: s.muted }}>QR scannen → Eingangstor</p>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 0.35rem', fontSize: '0.8rem', color: s.muted }}>Link zum Eingangstor:</p>
              <a
                href={willkommenFullUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: s.accent, fontWeight: 600, wordBreak: 'break-all', fontSize: '0.9rem' }}
              >
                {willkommenBaseUrl}
              </a>
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: s.muted }}>
                Für Druck: QR-Code oben ausdrucken oder Link einfügen.
              </p>
            </div>
          </div>
        </section>

        {/* Präsentationsmappen – Links zum Mitsenden (E-Mail, Chat, Werbung) */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 className={PRINT_HIDE} style={{ fontFamily: s.fontHeading, fontSize: '1.35rem', color: s.accent, marginBottom: '1rem', borderBottom: `1px solid ${s.accentSoft}`, paddingBottom: '0.5rem' }}>
            5. Präsentationsmappen – Links zum Mitsenden
          </h2>
          <p style={{ color: s.muted, marginBottom: '1rem', fontSize: '0.9rem' }}>
            Kurzvariante (1 Seite, Teal/Weiß) und Vollversion (große Mappe, viele Kapitel). Zusätzlich eigene VK2-Kurz- und Vollversion. Als Link in E-Mail, Chat oder Werbedokument einfügen.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: s.bgCard, borderRadius: s.radius, border: `1px solid ${s.accentSoft}` }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 600, color: s.accent }}>Präsentationsmappe (Kurzvariante)</p>
              <a href={`${BASE_APP_URL}${PROJECT_ROUTES['k2-galerie'].praesentationsmappe}?context=oeffentlich`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: s.text, wordBreak: 'break-all' }}>{BASE_APP_URL}{PROJECT_ROUTES['k2-galerie'].praesentationsmappe}?context=oeffentlich</a>
            </div>
            <div style={{ padding: '1rem', background: s.bgCard, borderRadius: s.radius, border: `1px solid ${s.accentSoft}` }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 600, color: s.accent }}>Präsentationsmappe (Vollversion)</p>
              <a href={`${BASE_APP_URL}${PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion}?context=oeffentlich`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: s.text, wordBreak: 'break-all' }}>{BASE_APP_URL}{PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion}?context=oeffentlich</a>
            </div>
            <div style={{ padding: '1rem', background: s.bgCard, borderRadius: s.radius, border: `1px solid ${s.accentSoft}` }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 600, color: s.accent }}>Präsentationsmappe VK2 (Kurzversion)</p>
              <a href={`${BASE_APP_URL}${PROJECT_ROUTES['k2-galerie'].praesentationsmappe}?variant=vk2`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: s.text, wordBreak: 'break-all' }}>{BASE_APP_URL}{PROJECT_ROUTES['k2-galerie'].praesentationsmappe}?variant=vk2</a>
            </div>
            <div style={{ padding: '1rem', background: s.bgCard, borderRadius: s.radius, border: `1px solid ${s.accentSoft}` }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', fontWeight: 600, color: s.accent }}>Präsentationsmappe VK2 (Vollversion)</p>
              <a href={`${BASE_APP_URL}${PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion}?variant=vk2`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: s.text, wordBreak: 'break-all' }}>{BASE_APP_URL}{PROJECT_ROUTES['k2-galerie'].praesentationsmappeVollversion}?variant=vk2</a>
            </div>
          </div>
        </section>
      </main>

      <footer className={PRINT_HIDE} style={{ padding: '1.5rem 2rem', borderTop: `1px solid ${s.accentSoft}`, color: s.muted, fontSize: '0.85rem' }}>
        {PRODUCT_BRAND_NAME} · Werbeunterlagen · Stand 2026 · {PRODUCT_COPYRIGHT} · Drucken für PDF-Export oder Screenshot für Social-Media.
      </footer>
    </div>
  )
}
