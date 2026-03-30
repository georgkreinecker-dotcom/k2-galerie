import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'
import { PLATFORM_ROUTES, PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { LIZENZPREISE } from '../config/licencePricing'
import TermWithExplanation from '../components/TermWithExplanation'
import { isValidEmpfehlerIdFormat } from '../utils/empfehlerId'
import { addGutschrift } from '../utils/empfehlerGutschrift'

/** API-Response: Online gekaufte Lizenzen aus Supabase */
interface OnlineLicence {
  id: string
  email: string
  name: string
  licence_type: string
  status: string
  empfehler_id: string | null
  stripe_session_id: string | null
  created_at: string
}
interface OnlinePayment {
  id: string
  licence_id: string
  amount_cents: number
  amount_eur: number | string
  currency: string
  stripe_session_id: string
  empfehler_id: string | null
  paid_at: string
  created_at: string
}
interface OnlineGutschrift {
  id: string
  empfehler_id: string
  amount_eur: number | string
  payment_id: string
  licence_id: string
  created_at: string
}

const STORAGE_KEY = 'k2-license-grants'

export interface LicenceGrant {
  id: string
  name: string
  email: string
  licenseType: 'basic' | 'pro' | 'proplus' | 'propplus' | 'vk2'
  empfehlerId?: string
  empfehlungsRabattAngewendet?: boolean
  createdAt: string
}

const LICENCE_TYPES: { id: 'basic' | 'pro' | 'proplus' | 'propplus' | 'vk2'; name: string; price: string; priceEur: number | null; summary: string; icon: string; highlight?: boolean }[] = [
  { id: 'basic',   name: LIZENZPREISE.basic.name,   price: LIZENZPREISE.basic.price,   priceEur: LIZENZPREISE.basic.priceEur,   icon: '🎨',  summary: 'Bis 30 Werke, 1 Galerie, Events, Kasse, Etiketten, Standard-URL' },
  { id: 'pro',     name: LIZENZPREISE.pro.name,    price: LIZENZPREISE.pro.price,     priceEur: LIZENZPREISE.pro.priceEur,     icon: '⭐',  summary: 'Alles aus Basic + unbegrenzte Werke, Custom Domain – ohne vollen Marketingbereich' },
  { id: 'proplus', name: LIZENZPREISE.proplus.name, price: LIZENZPREISE.proplus.price, priceEur: LIZENZPREISE.proplus.priceEur, icon: '💎',  summary: 'Alles aus Pro + gesamter Marketingbereich (Events, Galeriepräsentation, Flyer, Presse, Social Media)' },
  { id: 'propplus', name: LIZENZPREISE.propplus.name, price: LIZENZPREISE.propplus.price, priceEur: LIZENZPREISE.propplus.priceEur, icon: '📄',  summary: 'Alles aus Pro+ + Rechnung (§ 11 UStG): fortlaufende Nummerierung, Pflichtangaben, USt-Aufschlüsselung', highlight: true },
  { id: 'vk2',     name: LIZENZPREISE.vk2.name,    price: LIZENZPREISE.vk2.priceLabel ?? '', priceEur: LIZENZPREISE.vk2.priceEur, icon: '🏛️', summary: 'Verein nutzt Pro; ab 10 Mitgliedern für den Verein kostenfrei; Vereinsmitglieder 50 % Rabatt' },
]

function loadGrants(): LicenceGrant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (g): g is LicenceGrant =>
          g && typeof g === 'object' && typeof g.id === 'string' && typeof g.name === 'string' && typeof g.email === 'string'
      )
      .map((g): LicenceGrant => {
        const lt = (g as { licenseType: string }).licenseType
        return { ...g, licenseType: (lt === 'excellent' ? 'proplus' : lt) as LicenceGrant['licenseType'] }
      })
  } catch {
    return []
  }
}

function saveGrants(grants: LicenceGrant[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(grants))
  } catch (_) {}
}

interface LicencesPageProps {
  embeddedInMok2Layout?: boolean
}

export default function LicencesPage({ embeddedInMok2Layout }: LicencesPageProps = {}) {
  const [grants, setGrants] = useState<LicenceGrant[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [licenseType, setLicenseType] = useState<LicenceGrant['licenseType']>('proplus')
  const [empfehlerId, setEmpfehlerId] = useState('')
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [onlineLicences, setOnlineLicences] = useState<OnlineLicence[]>([])
  const [onlinePayments, setOnlinePayments] = useState<OnlinePayment[]>([])
  const [onlineGutschriften, setOnlineGutschriften] = useState<OnlineGutschrift[]>([])
  const [onlineLoading, setOnlineLoading] = useState(false)
  const [onlineError, setOnlineError] = useState<string | null>(null)

  useEffect(() => {
    setGrants(loadGrants())
  }, [])

  async function loadOnlineData() {
    setOnlineLoading(true)
    setOnlineError(null)
    try {
      const base = window.location.origin
      const res = await fetch(`${base}/api/licence-data`)
      const data = await res.json()
      setOnlineLicences(Array.isArray(data.licences) ? data.licences : [])
      setOnlinePayments(Array.isArray(data.payments) ? data.payments : [])
      setOnlineGutschriften(Array.isArray(data.gutschriften) ? data.gutschriften : [])
      if (data.error) setOnlineError(data.error)
    } catch (e) {
      setOnlineError((e as Error)?.message || 'Fehler beim Laden')
    } finally {
      setOnlineLoading(false)
    }
  }

  useEffect(() => {
    loadOnlineData()
  }, [])

  function exportCsv() {
    const sep = ';'
    const rows: string[] = []
    rows.push('Lizenzen (online gekauft)')
    rows.push(['E-Mail', 'Name', 'Lizenz', 'Status', 'Empfehler-ID', 'Datum'].join(sep))
    onlineLicences.forEach((l) => {
      rows.push([l.email, l.name, l.licence_type, l.status, l.empfehler_id ?? '', l.created_at?.slice(0, 10) ?? ''].join(sep))
    })
    rows.push('')
    rows.push('Zahlungen')
    rows.push(['Betrag (€)', 'Datum', 'Stripe-Session', 'Empfehler-ID'].join(sep))
    onlinePayments.forEach((p) => {
      rows.push([String(p.amount_eur), (p.paid_at || p.created_at)?.slice(0, 10) ?? '', p.stripe_session_id ?? '', p.empfehler_id ?? ''].join(sep))
    })
    rows.push('')
    rows.push('Gutschriften (Empfehler)')
    rows.push(['Empfehler-ID', 'Betrag (€)', 'Datum'].join(sep))
    onlineGutschriften.forEach((g) => {
      rows.push([g.empfehler_id, String(g.amount_eur), g.created_at?.slice(0, 10) ?? ''].join(sep))
    })
    const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `Lizenzen-Zahlungen-Gutschriften-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function printPdf() {
    window.print()
  }

  // Empfehler-ID aus URL vorausfüllen (?empfehler=K2-E-XXXXXX) – einmalig beim Laden
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('empfehler')
    if (fromUrl && isValidEmpfehlerIdFormat(fromUrl)) setEmpfehlerId(fromUrl.trim())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    if (!trimmedName || !trimmedEmail) {
      setMessage({ type: 'error', text: 'Name und E-Mail sind Pflicht.' })
      return
    }
    const trimmedEmpfehler = empfehlerId.trim()
    const hatEmpfehlung = trimmedEmpfehler && isValidEmpfehlerIdFormat(trimmedEmpfehler)
    const newGrant: LicenceGrant = {
      id: `lic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      email: trimmedEmail,
      licenseType,
      empfehlerId: hatEmpfehlung ? trimmedEmpfehler : undefined,
      empfehlungsRabattAngewendet: hatEmpfehlung || undefined,
      createdAt: new Date().toISOString(),
    }
    if (hatEmpfehlung) {
      const lt = LICENCE_TYPES.find((x) => x.id === licenseType)
      if (lt?.priceEur != null && lt.priceEur > 0) {
        const gutschriftBetrag = Math.round(lt.priceEur * 0.1 * 100) / 100
        addGutschrift(trimmedEmpfehler, gutschriftBetrag, newGrant.id)
      }
    }
    const next = [...grants, newGrant]
    setGrants(next)
    saveGrants(next)
    setName('')
    setEmail('')
    setLicenseType('proplus')
    setEmpfehlerId('')
    setMessage({ type: 'ok', text: hatEmpfehlung ? '✅ Lizenz erfasst. 10 % Empfehlungs-Rabatt wurde berücksichtigt.' : '✅ Lizenz erfasst.' })
  }

  const handleDelete = (id: string) => {
    const next = grants.filter(g => g.id !== id)
    setGrants(next)
    saveGrants(next)
    setDeleteId(null)
  }

  return (
    <div className="page" style={embeddedInMok2Layout ? { margin: 0, padding: 'clamp(1rem, 3vw, 1.5rem)' } : undefined}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <nav style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {embeddedInMok2Layout ? (
            <Link to={PROJECT_ROUTES['k2-galerie'].marketingOek2} className="meta" style={{ color: 'var(--k2-accent)' }}>← mök2 (Marketing ök2)</Link>
          ) : (
            <>
              <Link to={PLATFORM_ROUTES.home} className="meta">← Plattform</Link>
              <Link to={PROJECT_ROUTES['k2-galerie'].uebersicht} className="meta" style={{ color: 'var(--k2-accent)' }}>📊 Übersicht-Board</Link>
              <Link to={PLATFORM_ROUTES.kosten} className="meta">Kosten</Link>
            </>
          )}
        </nav>

        <h1 style={{ marginBottom: '0.5rem' }}>💼 Lizenzen</h1>
        <div style={{
          background: 'rgba(251,191,36,0.10)',
          border: '1px solid rgba(251,191,36,0.40)',
          borderRadius: '10px',
          padding: '0.8rem 1rem',
          marginBottom: '1rem',
          color: 'var(--k2-text)'
        }}>
          <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '0.35rem' }}>📅 Zeitplan Lizenzen</div>
          <div style={{ fontSize: '0.88rem', lineHeight: 1.55 }}>
            <strong>Öffentliche Lizenzanmeldung / regulärer Standardstart ab 01. Mai.</strong> Bis dahin gilt kein allgemeiner Selbstservice für alle Interessent:innen als fester Produktstart.
            <br />
            <strong>Testpilot:innen</strong> arbeiten nach <strong>Einladung und Vereinbarung</strong> mit uns früher; Zugang und ggf. Online-Zahlung werden dafür individuell freigegeben (siehe mök2, Abschnitt Lizenzen).
          </div>
        </div>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
          <Link to={PROJECT_ROUTES['k2-galerie'].lizenzKaufen} style={{ color: 'var(--k2-accent)', fontWeight: 600 }}>
            Lizenz online auswählen &amp; bezahlen
          </Link>
          <span style={{ color: 'var(--k2-muted)' }}> – für Pilot:innen nach Vereinbarung; öffentlicher Standardstart siehe Kasten oben.</span>
        </p>
        <p style={{ color: 'var(--k2-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Lizenzstufen auf einen Blick – und neue Lizenzen vergeben.
        </p>

        {/* STATUS-BALKEN */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
          background: grants.length > 0 ? 'rgba(95,251,241,0.08)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${grants.length > 0 ? 'rgba(95,251,241,0.3)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--k2-text)' }}>
              {grants.length === 0 ? '○ Noch keine Lizenzen vergeben' : `✅ ${grants.length} Lizenz${grants.length > 1 ? 'en' : ''} aktiv`}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--k2-muted)', marginTop: '0.2rem' }}>
              {grants.length === 0 ? 'Erste Lizenz unten erfassen.' : 'Alle aktiven Lizenzen unten aufgelistet.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {LICENCE_TYPES.map(lt => {
              const count = grants.filter(g => g.licenseType === lt.id).length
              return (
                <div key={lt.id} title={`${lt.name}: ${count}`} style={{
                  padding: '0.25rem 0.6rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                  background: count > 0 ? 'rgba(95,251,241,0.15)' : 'rgba(255,255,255,0.06)',
                  color: count > 0 ? 'var(--k2-accent)' : 'var(--k2-muted)',
                  border: `1px solid ${count > 0 ? 'rgba(95,251,241,0.3)' : 'rgba(255,255,255,0.1)'}`
                }}>
                  {lt.icon} {lt.name.split(' ')[0]}: {count}
                </div>
              )
            })}
          </div>
        </div>

        {/* LIZENZSTUFEN-KARTEN */}
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem', color: 'var(--k2-text)' }}>Lizenzstufen</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {LICENCE_TYPES.map((lt) => {
              const count = grants.filter(g => g.licenseType === lt.id).length
              const isHighlight = lt.highlight === true
              return (
                <div key={lt.id} style={{
                  background: isHighlight
                    ? 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.06) 100%)'
                    : count > 0 ? 'rgba(95,251,241,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isHighlight ? 'rgba(251,191,36,0.5)' : count > 0 ? 'rgba(95,251,241,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '10px', padding: '1rem',
                  position: 'relative'
                }}>
                  {isHighlight && (
                    <div style={{ position: 'absolute', top: -10, right: 12, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', color: '#1a1a00', fontSize: '0.7rem', fontWeight: 800, padding: '2px 10px', borderRadius: 20, letterSpacing: '0.5px' }}>
                      PREMIUM
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <strong style={{ color: isHighlight ? '#fbbf24' : 'var(--k2-accent)', fontSize: '1rem' }}>{lt.icon} {lt.name}</strong>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 20,
                      background: count > 0 ? 'rgba(95,251,241,0.15)' : 'rgba(255,255,255,0.06)',
                      color: count > 0 ? 'var(--k2-accent)' : 'var(--k2-muted)',
                    }}>
                      {count > 0 ? `✅ ${count} aktiv` : '○ keine'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: isHighlight ? '#fbbf24' : 'var(--k2-accent)', fontWeight: 600, marginBottom: '0.3rem' }}>{lt.price}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--k2-muted)', lineHeight: 1.4 }}>{lt.summary}</div>
                </div>
              )
            })}
          </div>
        </section>

        {/* DETAIL-INFO */}
        <section style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1rem', margin: '0 0 0.75rem', color: 'var(--k2-muted)' }}>Details im Überblick</h2>
          <div style={{ fontSize: '0.88rem', color: 'var(--k2-muted)', lineHeight: 1.7 }}>
            <p style={{ margin: '0 0 0.5rem' }}><strong style={{ color: 'var(--k2-text)' }}>🎨 Basic</strong> – Bis 30 Werke, 1 Galerie, Events, Kasse, Etiketten, Marketing (Basis), <TermWithExplanation term="Standard-URL" />. <strong>15 €/Monat.</strong></p>
            <p style={{ margin: '0 0 0.5rem' }}><strong style={{ color: 'var(--k2-text)' }}>⭐ Pro</strong> – Alles aus Basic + unbegrenzte Werke, <TermWithExplanation term="Custom Domain" /> – ohne vollen Marketingbereich. <strong>35 €/Monat.</strong></p>
            <p style={{ margin: '0 0 0.5rem' }}><strong style={{ color: 'var(--k2-text)' }}>💎 Pro+</strong> – Alles aus Pro + <strong style={{ color: 'var(--k2-text)' }}>gesamter Marketingbereich</strong>: Events, Galeriepräsentation, Flyer, Presse, Social Media, Plakat, PR-Dokumente. <strong>45 €/Monat.</strong></p>
            <p style={{ margin: '0 0 0.5rem', padding: '0.6rem 0.85rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8 }}>
              <strong style={{ color: '#fbbf24' }}>📄 Pro++</strong> – Alles aus Pro+ + <strong style={{ color: 'var(--k2-text)' }}>Rechnung</strong> (§ 11 UStG): fortlaufende Rechnungsnummer, Pflichtangaben, USt-Aufschlüsselung. <strong>55 €/Monat.</strong>
            </p>
            <p style={{ margin: 0 }}><strong style={{ color: 'var(--k2-text)' }}>🏛️ Kunstvereine (VK2)</strong> – Verein nutzt Pro (35 €); ab 10 registrierten Mitgliedern für den Verein kostenfrei. Vereinsmitglieder: 50 % Rabatt. Nicht registrierte Mitglieder im System erfasst (Datenschutz beachten).</p>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--k2-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
            Aufstufung jederzeit möglich: Basic → Pro → Pro+ → Pro++ → Kunstvereine (VK2). Daten bleiben erhalten.
          </p>
        </section>

        {/* LIZENZ VERGEBEN + EMPFEHLUNGSPROGRAMM */}
        <section style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.25rem', color: 'var(--k2-text)' }}>
            ➕ Neue Lizenz vergeben
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--k2-muted)', margin: '0 0 0.5rem' }}>
            🤝 <strong style={{ color: 'var(--k2-text)' }}>Empfehlungsprogramm:</strong> Empfehler-ID eintragen → 10 % Rabatt für den Geworbenen, 10 % Gutschrift für den Empfehler.
          </p>
          <p style={{ fontSize: '0.85rem', margin: '0 0 1rem' }}>
            <Link to={PROJECT_ROUTES['k2-galerie'].lizenzKaufen} style={{ color: 'var(--k2-accent)', fontWeight: 600 }}>
              💳 Lizenz online kaufen (Kunde zahlt mit Karte) →
            </Link>
          </p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '400px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.25rem' }}>Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Name der lizenzierten Person" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.25rem' }}>E-Mail *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="E-Mail" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.25rem' }}>Lizenzstufe</label>
              <select value={licenseType} onChange={(e) => setLicenseType(e.target.value as LicenceGrant['licenseType'])} className="input">
                {LICENCE_TYPES.map((lt) => (
                  <option key={lt.id} value={lt.id}>{lt.icon} {lt.name} – {lt.price}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.25rem' }}>Empfehler-ID (optional) – Du erhältst 10 % Rabatt</label>
              <input type="text" value={empfehlerId} onChange={(e) => setEmpfehlerId(e.target.value)} className="input" placeholder="z. B. K2-E-XXXXXX (steht im Empfehlungs-Link)" />
              {empfehlerId.trim() && isValidEmpfehlerIdFormat(empfehlerId) && (() => {
                const lt = LICENCE_TYPES.find((x) => x.id === licenseType)
                const preisEur = lt?.priceEur ?? 0
                const mitRabatt = preisEur > 0 ? (preisEur * 0.9).toFixed(2) : null
                return (
                  <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--k2-accent)', fontWeight: 600 }}>
                    ✓ Empfehlungs-Rabatt: 10 % – wird bei Erfassung berücksichtigt.
                    {mitRabatt != null && <span style={{ display: 'block', marginTop: '0.25rem', fontWeight: 400, color: 'var(--k2-muted)' }}>Preis für {lt?.name}: {preisEur} € → {mitRabatt} €/Monat</span>}
                  </p>
                )
              })()}
            </div>
            {message && (
              <p style={{ fontSize: '0.9rem', color: message.type === 'ok' ? 'var(--k2-accent)' : '#f87171', margin: 0 }}>
                {message.text}
              </p>
            )}
            <button type="submit" className="btn primary-btn">Lizenz erfassen</button>
          </form>
        </section>

        {/* ONLINE GEKAUFTE LIZENZEN & ABRECHNUNG */}
        <section
          className="licence-export-area"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.5rem', color: 'var(--k2-text)' }}>
            📊 Online gekaufte Lizenzen & Abrechnung
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--k2-muted)', margin: '0 0 0.75rem' }}>
            Daten aus Stripe/Supabase (Zahlungen, Lizenzen, Empfehler-Gutschriften). Export für Buchhaltung.
          </p>
          <div className="no-print" style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={loadOnlineData} disabled={onlineLoading} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              {onlineLoading ? 'Laden…' : '🔄 Daten neu laden'}
            </button>
            <button type="button" onClick={exportCsv} disabled={onlineLoading || (onlineLicences.length === 0 && onlinePayments.length === 0)} className="btn primary-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              📥 Als CSV exportieren
            </button>
            <button type="button" onClick={printPdf} disabled={onlineLoading || (onlineLicences.length === 0 && onlinePayments.length === 0)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              🖨️ Als PDF drucken
            </button>
          </div>
          {onlineError && (
            <p style={{ fontSize: '0.85rem', color: '#f87171', margin: '0 0 0.5rem' }}>{onlineError}</p>
          )}
          {onlineLoading && onlineLicences.length === 0 && onlinePayments.length === 0 && (
            <p style={{ fontSize: '0.9rem', color: 'var(--k2-muted)' }}>Lade Daten…</p>
          )}
          {!onlineLoading && (onlineLicences.length > 0 || onlinePayments.length > 0 || onlineGutschriften.length > 0) && (
            <div style={{ overflowX: 'auto' }}>
              {onlineLicences.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.4rem', color: 'var(--k2-accent)' }}>Lizenzen ({onlineLicences.length})</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                        <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>E-Mail</th>
                        <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>Lizenz</th>
                        <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>Empfehler</th>
                        <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>Datum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {onlineLicences.map((l) => (
                        <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{l.email}</td>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{l.name}</td>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{l.licence_type}</td>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{l.empfehler_id ?? '–'}</td>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{l.created_at?.slice(0, 10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {onlinePayments.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.4rem', color: 'var(--k2-accent)' }}>Zahlungen ({onlinePayments.length})</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                        <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>Betrag (€)</th>
                        <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>Datum</th>
                        <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>Empfehler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {onlinePayments.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{p.amount_eur}</td>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{(p.paid_at || p.created_at)?.slice(0, 10)}</td>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{p.empfehler_id ?? '–'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {onlineGutschriften.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.4rem', color: 'var(--k2-accent)' }}>Gutschriften Empfehler ({onlineGutschriften.length})</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                        <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>Empfehler-ID</th>
                        <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>Betrag (€)</th>
                        <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem' }}>Datum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {onlineGutschriften.map((g) => (
                        <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{g.empfehler_id}</td>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{g.amount_eur}</td>
                          <td style={{ padding: '0.35rem 0.5rem' }}>{g.created_at?.slice(0, 10)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>

        {/* AKTIVE LIZENZEN */}
        {grants.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem', color: 'var(--k2-text)' }}>
              ✅ Aktive Lizenzen ({grants.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {grants.map((g) => {
                const lt = LICENCE_TYPES.find(x => x.id === g.licenseType)
                return (
                  <div key={g.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
                    background: 'rgba(95,251,241,0.06)', border: '1px solid rgba(95,251,241,0.2)',
                    borderRadius: '10px', padding: '0.75rem 1rem'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--k2-text)', fontSize: '0.95rem' }}>{g.name}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--k2-muted)' }}>{g.email}</span>
                      {g.empfehlerId && <span style={{ fontSize: '0.78rem', color: 'var(--k2-muted)' }}>Empfehler: {g.empfehlerId}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.82rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 20,
                        background: 'rgba(95,251,241,0.15)', color: 'var(--k2-accent)', border: '1px solid rgba(95,251,241,0.3)'
                      }}>
                        {lt?.icon} {lt?.name ?? g.licenseType}
                      </span>
                      {deleteId === g.id ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button type="button" onClick={() => handleDelete(g.id)} style={{ padding: '0.25rem 0.6rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>Löschen</button>
                          <button type="button" onClick={() => setDeleteId(null)} style={{ padding: '0.25rem 0.6rem', background: 'rgba(255,255,255,0.1)', color: 'var(--k2-muted)', border: 'none', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' }}>Abbrechen</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setDeleteId(g.id)} style={{ padding: '0.25rem 0.5rem', background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' }}>✕</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
      <footer style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--k2-muted)' }}>
        <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
        <div style={{ marginTop: '0.35rem', fontSize: '0.7rem', opacity: 0.95 }}>{PRODUCT_URHEBER_ANWENDUNG}</div>
      </footer>
    </div>
  )
}
