import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'
import { BASE_APP_URL, PLATFORM_ROUTES, PROJECT_ROUTES } from '../config/navigation'
import { getSendPilotInviteApiUrl, getPilotInviteMailStatusUrl, isPilotInviteLocalDevHostname } from '../utils/pilotInviteClient'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { LIZENZPREISE } from '../config/licencePricing'
import TermWithExplanation from '../components/TermWithExplanation'
import LizenzZeitplanPilotStripeInfo from '../components/LizenzZeitplanPilotStripeInfo'
import { PilotInviteEmailPreview } from '../components/PilotInviteEmailPreview'
import { downloadPilotInviteEml } from '../utils/pilotInviteEmlDownload'
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
  /** APf-Tab „Lizenzen“: scrollt zum Block Testpilot einladen */
  apfFocusTestpilot?: boolean
}

export default function LicencesPage({ embeddedInMok2Layout, apfFocusTestpilot }: LicencesPageProps = {}) {
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

  const [pilotInviteFirstName, setPilotInviteFirstName] = useState('')
  const [pilotInviteLastName, setPilotInviteLastName] = useState('')
  const [pilotInviteEmail, setPilotInviteEmail] = useState('')
  const [pilotInviteContext, setPilotInviteContext] = useState<'oeffentlich' | 'vk2'>('oeffentlich')
  const [pilotInviteBusy, setPilotInviteBusy] = useState(false)
  const [pilotInviteMsg, setPilotInviteMsg] = useState<{
    type: 'ok' | 'warn' | 'error'
    text: string
    detail?: string
  } | null>(null)
  const [pilotInviteUrl, setPilotInviteUrl] = useState<string | null>(null)
  const [pilotInviteMailto, setPilotInviteMailto] = useState<string | null>(null)
  const [pilotInviteMailtoTruncated, setPilotInviteMailtoTruncated] = useState(false)
  const [pilotInviteCrossEnvWarning, setPilotInviteCrossEnvWarning] = useState(false)
  const [pilotInviteCopied, setPilotInviteCopied] = useState(false)
  const [licencesPageIsLocalhost, setLicencesPageIsLocalhost] = useState(false)
  /** Live-API (meist Vercel): ist Resend gesetzt? → dann fixe automatische Zustellung möglich */
  const [pilotResendServerStatus, setPilotResendServerStatus] = useState<'loading' | 'yes' | 'no' | 'error'>('loading')

  useEffect(() => {
    setGrants(loadGrants())
  }, [])

  /** Direktlink #testpilot-einladen oder APf-Tab: zum gelben Kasten scrollen */
  useEffect(() => {
    const scrollToPilot = () => {
      document.getElementById('testpilot-einladen')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    if (apfFocusTestpilot) {
      const t = window.setTimeout(scrollToPilot, 80)
      return () => window.clearTimeout(t)
    }
    if (typeof window !== 'undefined' && window.location.hash === '#testpilot-einladen') {
      const t = window.setTimeout(scrollToPilot, 80)
      return () => window.clearTimeout(t)
    }
    return undefined
  }, [apfFocusTestpilot])

  useEffect(() => {
    setLicencesPageIsLocalhost(isPilotInviteLocalDevHostname(window.location.hostname))
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch(getPilotInviteMailStatusUrl())
      .then((r) => r.json())
      .then((j: { resendConfigured?: boolean }) => {
        if (cancelled) return
        setPilotResendServerStatus(j.resendConfigured ? 'yes' : 'no')
      })
      .catch(() => {
        if (!cancelled) setPilotResendServerStatus('error')
      })
    return () => {
      cancelled = true
    }
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

  async function handlePilotInviteSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPilotInviteMsg(null)
    setPilotInviteUrl(null)
    setPilotInviteMailto(null)
    setPilotInviteMailtoTruncated(false)
    setPilotInviteCrossEnvWarning(false)
    const fn = pilotInviteFirstName.trim()
    const ln = pilotInviteLastName.trim()
    const em = pilotInviteEmail.trim().toLowerCase()
    if (!fn || !ln || !em) {
      setPilotInviteMsg({ type: 'error', text: 'Vorname, Nachname und E-Mail sind Pflicht.' })
      return
    }
    setPilotInviteBusy(true)
    try {
      const inviteApi = getSendPilotInviteApiUrl()
      const res = await fetch(inviteApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: em,
          firstName: fn,
          lastName: ln,
          context: pilotInviteContext,
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) {
        setPilotInviteMsg({ type: 'error', text: typeof j.error === 'string' ? j.error : 'Versand fehlgeschlagen.' })
        return
      }
      const sent = j.sent === true
      setPilotInviteMsg({
        type: sent ? 'ok' : 'warn',
        text: sent
          ? (j.message || 'E-Mail wurde gesendet.')
          : (j.message ||
              'Es wurde keine Server-E-Mail verschickt. Persönlichen Link unten nutzen oder mailto – siehe Hinweis zu RESEND auf Vercel.'),
        detail: !sent && typeof j.resendError === 'string' ? j.resendError : undefined,
      })
      if (typeof j.inviteUrl === 'string') setPilotInviteUrl(j.inviteUrl)
      if (typeof j.mailtoUrl === 'string') setPilotInviteMailto(j.mailtoUrl)
      setPilotInviteMailtoTruncated(j.mailtoTruncated === true)
      setPilotInviteCrossEnvWarning(j.crossEnvSecretWarning === true)
    } catch {
      setPilotInviteMsg({ type: 'error', text: 'Netzwerkfehler – bitte später erneut.' })
    } finally {
      setPilotInviteBusy(false)
    }
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
        <LizenzZeitplanPilotStripeInfo variant="licences" />
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

        {/* TESTPILOT EINLADEN (E-Mail / Link) */}
        <section
          id="testpilot-einladen"
          style={{
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.35)',
          borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem'
        }}
        >
          <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem', color: 'var(--k2-text)' }}>
            ✉️ Testpilot:in per E-Mail einladen
          </h2>
          {pilotResendServerStatus === 'loading' ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--k2-muted)', margin: '0 0 0.75rem' }}>Server-Status wird geprüft …</p>
          ) : null}
          {pilotResendServerStatus === 'yes' ? (
            <div
              style={{
                marginBottom: '0.85rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 10,
                background: 'rgba(22, 163, 74, 0.15)',
                border: '1px solid rgba(74, 222, 128, 0.45)',
                fontSize: '0.88rem',
                color: 'var(--k2-text)',
                lineHeight: 1.55,
              }}
            >
              <strong>Fixe Lösung aktiv:</strong> Auf dem Server ist <strong>Resend</strong> eingerichtet – beim Empfänger kommt{' '}
              <strong>dieselbe gestaltete Mail</strong> an wie die weiße Karte unten (grüner Button, alles so – <strong>kein</strong> Code für den
              Nutzer).
            </div>
          ) : null}
          {pilotResendServerStatus === 'no' ? (
            <div
              style={{
                marginBottom: '0.85rem',
                padding: '0.75rem 0.9rem',
                borderRadius: 10,
                background: 'rgba(180, 83, 9, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.45)',
                fontSize: '0.88rem',
                color: 'var(--k2-text)',
                lineHeight: 1.55,
              }}
            >
              <strong>Automatischer Versand fehlt (noch nicht „fix“):</strong> Auf dem Live-Server ist <strong>kein</strong>{' '}
              <code style={{ fontSize: '0.78rem' }}>RESEND_API_KEY</code> gesetzt – von der App aus kann dann <strong>kein</strong> Postfach
              automatisch erreicht werden (kein Browser kann das ohne Mail-Server).{' '}
              <strong>Fix einmalig:</strong>{' '}
              <Link to="/k2team-handbuch?doc=26-TESTPILOT-EINLADUNG-EINRICHTUNG.md" style={{ color: '#b45309', fontWeight: 700 }}>
                Resend auf Vercel
              </Link>
              . Bis dahin: Link kopieren, .eml in der Mail-App öffnen (nicht Texteditor).
            </div>
          ) : null}
          {pilotResendServerStatus === 'error' ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--k2-muted)', margin: '0 0 0.75rem' }}>
              Server-Status nicht erreichbar – nach „Absenden“ siehst du, ob eine Mail rausging.
            </p>
          ) : null}
          {pilotResendServerStatus === 'yes' ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--k2-muted)', margin: '0 0 1rem', lineHeight: 1.5 }}>
              Die Vorschau unten ist <strong>genau die Darstellung</strong>, die auch in der gesendeten Mail beim Empfänger ankommt – die Buttons, nicht
              Technik-Text.
            </p>
          ) : pilotResendServerStatus === 'no' ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--k2-muted)', margin: '0 0 1rem', lineHeight: 1.5 }}>
              Die Vorschau zeigt, <strong>wie die Mail aussehen würde</strong> – ohne Resend wird sie nicht automatisch zugestellt.
            </p>
          ) : null}
          <p style={{ fontSize: '0.82rem', color: 'var(--k2-muted)', margin: '0 0 1rem' }}>
            <Link
              to="/k2team-handbuch?doc=26-TESTPILOT-EINLADUNG-EINRICHTUNG.md"
              style={{ color: 'var(--k2-accent)', fontWeight: 600 }}
            >
              Technik einmal einrichten
            </Link>
            {licencesPageIsLocalhost ? (
              <>
                {' · '}
                <details style={{ display: 'inline' }}>
                  <summary style={{ cursor: 'pointer', display: 'inline', color: 'var(--k2-muted)' }}>Hinweis APf localhost</summary>
                  <span style={{ display: 'block', marginTop: '0.5rem', padding: '0.6rem', background: 'rgba(180, 83, 9, 0.1)', borderRadius: 8, fontSize: '0.8rem' }}>
                    Senden geht an die Live-App ({BASE_APP_URL}). Lizenzen-Seite mit Pfad nutzen, nicht nur die Startseite.
                  </span>
                </details>
              </>
            ) : null}
          </p>
          <form onSubmit={handlePilotInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '420px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.25rem' }}>Vorname *</label>
              <input type="text" value={pilotInviteFirstName} onChange={(e) => setPilotInviteFirstName(e.target.value)} className="input" placeholder="Vorname" autoComplete="given-name" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.25rem' }}>Nachname *</label>
              <input type="text" value={pilotInviteLastName} onChange={(e) => setPilotInviteLastName(e.target.value)} className="input" placeholder="Nachname" autoComplete="family-name" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.25rem' }}>E-Mail *</label>
              <input type="email" value={pilotInviteEmail} onChange={(e) => setPilotInviteEmail(e.target.value)} className="input" placeholder="E-Mail" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.25rem' }}>Demo-Ziel</label>
              <select value={pilotInviteContext} onChange={(e) => setPilotInviteContext(e.target.value as 'oeffentlich' | 'vk2')} className="input">
                <option value="oeffentlich">Öffentliche Demo (ök2)</option>
                <option value="vk2">VK2 Vereins-Demo</option>
              </select>
            </div>
            <button type="submit" disabled={pilotInviteBusy} className="btn" style={{ background: '#b54a1e', color: '#fff', alignSelf: 'flex-start' }}>
              {pilotInviteBusy
                ? '…'
                : pilotResendServerStatus === 'yes'
                  ? 'Einladung senden (E-Mail = Vorschau unten)'
                  : pilotResendServerStatus === 'no'
                    ? 'Link erzeugen + Vorschau (kein Auto-Versand – Resend fehlt)'
                    : 'Absenden: Link + Vorschau'}
            </button>
          </form>
          {pilotInviteMsg && pilotInviteMsg.type === 'error' ? (
            <p style={{ marginTop: '0.85rem', fontSize: '0.9rem', margin: 0, color: '#f87171' }}>{pilotInviteMsg.text}</p>
          ) : null}
          {pilotInviteCrossEnvWarning ? (
            <div
              style={{
                marginTop: '0.85rem',
                padding: '0.75rem 0.9rem',
                borderRadius: 8,
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.35)',
                fontSize: '0.84rem',
                color: 'var(--k2-text)',
                lineHeight: 1.55,
              }}
            >
              <strong>Achtung – gleiches Geheimnis nötig:</strong> Diese Einladung wurde von <strong>localhost</strong>{' '}
              erzeugt, der Link führt aber auf <strong>k2-galerie.vercel.app</strong>. Ohne identisches{' '}
              <code style={{ fontSize: '0.78rem' }}>PILOT_INVITE_SECRET</code> in Vercel (Production) schlägt Schritt 2
              (Link öffnen) fehl. Entweder Secret angleichen oder Einladung direkt auf der Live-Seite erneut erzeugen.
            </div>
          ) : null}
          {pilotInviteUrl ? (
            <div style={{ marginTop: '1rem' }}>
              {pilotInviteMsg && pilotInviteMsg.type === 'warn' ? (
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.9rem 1rem',
                    borderRadius: 10,
                    background: 'rgba(220, 38, 38, 0.12)',
                    border: '2px solid rgba(248, 113, 113, 0.55)',
                    fontSize: '0.88rem',
                    color: 'var(--k2-text)',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.95rem' }}>
                    Es ist keine E-Mail rausgegangen.
                  </strong>
                  Der Server hat <strong>nichts</strong> in ein Postfach geschickt – <strong>keine</strong> fertige Mail mit Layout. Was du darunter siehst,
                  ist <strong>nur diese Vorschau</strong> in der App. So lädst du trotzdem ein: <strong>Link kopieren</strong> und selbst per Mail schicken,
                  oder <strong>.eml laden</strong> und in <strong>Apple Mail / Outlook</strong> öffnen (Doppelklick) – <em>nicht</em> mit TextEdit oder
                  „Rohansicht“, sonst siehst du nur Technik-Zeichen statt der grünen Buttons.
                  <br />
                  <br />
                  Automatisch raus erst nach Einrichtung:{' '}
                  <Link
                    to="/k2team-handbuch?doc=26-TESTPILOT-EINLADUNG-EINRICHTUNG.md"
                    style={{ color: '#fca5a5', fontWeight: 700, textDecoration: 'underline' }}
                  >
                    Handbuch: Resend auf Vercel
                  </Link>
                  {pilotInviteMsg.detail ? (
                    <>
                      <br />
                      <br />
                      <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>Resend-Meldung:</span>
                      <pre
                        style={{
                          margin: '0.35rem 0 0',
                          fontSize: '0.72rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          color: 'var(--k2-muted)',
                        }}
                      >
                        {pilotInviteMsg.detail}
                      </pre>
                    </>
                  ) : null}
                </div>
              ) : null}
              {pilotInviteMsg && pilotInviteMsg.type === 'ok' ? (
                <div
                  style={{
                    marginBottom: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 10,
                    background: 'rgba(22, 163, 74, 0.15)',
                    border: '1px solid rgba(74, 222, 128, 0.45)',
                    fontSize: '0.88rem',
                    color: 'var(--k2-text)',
                    lineHeight: 1.55,
                  }}
                >
                  <strong>E-Mail wurde vom Server an Resend übergeben</strong> – beim Empfänger im <strong>Posteingang</strong> prüfen (Ordner Spam). Die
                  Vorschau unten entspricht <strong>genau dem HTML</strong>, das Resend mitschickt (grüner Button) – <strong>kein</strong> Technik-Text für den
                  Empfänger.
                  <p
                    style={{
                      margin: '0.75rem 0 0',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid rgba(74, 222, 128, 0.35)',
                      fontSize: '0.86rem',
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: '#b45309' }}>Häufige Verwechslung:</strong> Wenn in Apple Mail eine <strong>„Neue Nachricht“</strong> oder ein{' '}
                    <strong>Entwurf</strong> nur <strong>Klartext</strong> und den langen Link zeigt – <strong>ohne</strong> grünen Button –, kommt das fast immer
                    von <strong>„Mail-Programm (nur Text)“</strong> (mailto) oder vom Einfügen des Textes. Das ist <strong>absichtlich nur Text</strong>, nicht die
                    Resend-Zustellung. Den Button gibt es in der <strong>eingegangenen</strong> Mail im Postfach – oder: <strong>.eml laden</strong> → Doppelklick in
                    Mail.
                  </p>
                </div>
              ) : null}
              <h3
                style={{
                  fontSize: '1.05rem',
                  margin: '0 0 0.75rem',
                  textAlign: 'center',
                  color: 'var(--k2-text)',
                  fontWeight: 700,
                }}
              >
                {pilotInviteMsg?.type === 'ok'
                  ? 'So sieht die gesendete E-Mail beim Empfänger aus'
                  : 'Vorschau: so sieht die Einladung beim Empfänger aus (mit grünem Button)'}
              </h3>
              <PilotInviteEmailPreview
                inviteUrl={pilotInviteUrl}
                greetingName={pilotInviteFirstName.trim()}
                inviteContext={pilotInviteContext}
              />
              <details style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--k2-muted)' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--k2-muted)' }}>
                  {pilotInviteMsg?.type === 'ok'
                    ? 'Link kopieren oder .eml – mailto nur wenn du bewusst nur Text willst'
                    : 'Link kopieren, .eml mit Layout oder Mail-Programm (nur Klartext)'}
                </summary>
                {pilotInviteMsg?.type === 'ok' ? (
                  <p
                    style={{
                      margin: '0.5rem 0 0.65rem',
                      padding: '0.55rem 0.65rem',
                      borderRadius: 8,
                      background: 'rgba(180, 83, 9, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      lineHeight: 1.55,
                      color: 'var(--k2-text)',
                      fontSize: '0.84rem',
                    }}
                  >
                    Resend hat die Einladung schon abgeschickt – den grünen Button siehst du in der <strong>Posteingangs-Mail</strong>, nicht in einem neuen
                    Entwurf über den Link unten.
                  </p>
                ) : null}
                <p style={{ margin: '0.5rem 0 0.65rem', lineHeight: 1.55, color: 'var(--k2-text)' }}>
                  <strong>„Mail-Programm öffnen“</strong> nutzt mailto – das ist <strong>immer nur Klartext</strong>, <strong>ohne</strong> dein Layout mit
                  Button. Deshalb siehst du dort <strong>keinen grünen Button</strong> wie in der Vorschau. Automatisch „raus“ geht nur mit{' '}
                  <strong>Resend</strong> auf Vercel (
                  <code style={{ fontSize: '0.75rem' }}>RESEND_API_KEY</code>
                  ).
                </p>
                <p style={{ margin: '0 0 0.65rem', lineHeight: 1.55, color: 'var(--k2-text)' }}>
                  <strong>Layout wie oben:</strong> Datei laden und per Doppelklick öffnen (z. B. Apple Mail) – dann erscheint der Button.
                </p>
                {pilotInviteMailtoTruncated ? (
                  <p
                    style={{
                      margin: '0 0 0.65rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: 8,
                      background: 'rgba(251,191,36,0.12)',
                      border: '1px solid rgba(251,191,36,0.35)',
                      color: 'var(--k2-text)',
                      lineHeight: 1.5,
                    }}
                  >
                    Der Einladungslink war zu lang für mailto – im Mail-Programm steht nur ein Kurztext. Bitte <strong>Link kopieren</strong> oder <strong>.eml</strong> nutzen.
                  </p>
                ) : null}
                <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      void navigator.clipboard.writeText(pilotInviteUrl).then(
                        () => {
                          setPilotInviteCopied(true)
                          window.setTimeout(() => setPilotInviteCopied(false), 2000)
                        },
                        () => {}
                      )
                    }}
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.8rem',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'var(--k2-text)',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {pilotInviteCopied ? '✓ Kopiert' : 'Link kopieren'}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      downloadPilotInviteEml({
                        toEmail: pilotInviteEmail.trim().toLowerCase(),
                        firstName: pilotInviteFirstName.trim(),
                        lastName: pilotInviteLastName.trim(),
                        inviteUrl: pilotInviteUrl,
                        inviteContext: pilotInviteContext,
                      })
                    }
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.8rem',
                      background: '#0d9488',
                      border: 'none',
                      color: '#fff',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Mail mit Layout (.eml laden)
                  </button>
                  {pilotInviteMailto ? (
                    <a href={pilotInviteMailto} style={{ color: 'var(--k2-accent)', fontWeight: 600 }}>
                      {pilotInviteMsg?.type === 'ok'
                        ? 'Mail-Programm öffnen (nur Text – nicht die Resend-Mail mit Button)'
                        : 'Mail-Programm (nur Text)'}
                    </a>
                  ) : null}
                </div>
              </details>
            </div>
          ) : null}
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
