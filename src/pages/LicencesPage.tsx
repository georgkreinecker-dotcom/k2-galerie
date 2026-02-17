import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'
import { PLATFORM_ROUTES, PROJECT_ROUTES } from '../config/navigation'
import TermWithExplanation from '../components/TermWithExplanation'

const STORAGE_KEY = 'k2-license-grants'

export interface LicenceGrant {
  id: string
  name: string
  email: string
  licenseType: 'basic' | 'pro' | 'enterprise'
  empfehlerId?: string
  createdAt: string
}

const LICENCE_TYPES: { id: 'basic' | 'pro' | 'enterprise'; name: string; price: string; summary: string }[] = [
  { id: 'basic', name: 'Basic', price: '49 €/Monat', summary: 'Bis 30 Werke, 1 Galerie, Events, Kasse, Etiketten, Standard-URL' },
  { id: 'pro', name: 'Pro', price: '99 €/Monat', summary: 'Unbegrenzte Werke, Custom Domain, volles Marketing' },
  { id: 'enterprise', name: 'Enterprise', price: 'nach Vereinbarung', summary: 'Alles aus Pro, White-Label, API, Dedicated Support' },
]

function loadGrants(): LicenceGrant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (g): g is LicenceGrant =>
        g && typeof g === 'object' && typeof g.id === 'string' && typeof g.name === 'string' && typeof g.email === 'string'
    )
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
  /** Im Mok2Layout eingebettet → Back-Link zu mök2, kompakter Header */
  embeddedInMok2Layout?: boolean
}

export default function LicencesPage({ embeddedInMok2Layout }: LicencesPageProps = {}) {
  const [grants, setGrants] = useState<LicenceGrant[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [licenseType, setLicenseType] = useState<LicenceGrant['licenseType']>('pro')
  const [empfehlerId, setEmpfehlerId] = useState('')
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setGrants(loadGrants())
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
    const newGrant: LicenceGrant = {
      id: `lic-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmedName,
      email: trimmedEmail,
      licenseType,
      empfehlerId: empfehlerId.trim() || undefined,
      createdAt: new Date().toISOString(),
    }
    const next = [...grants, newGrant]
    setGrants(next)
    saveGrants(next)
    setName('')
    setEmail('')
    setLicenseType('pro')
    setEmpfehlerId('')
    setMessage({ type: 'ok', text: 'Lizenz erfasst. Bei echtem Betrieb: Abrechnungsstruktur nutzen (Empfehler-ID wird für Vergütung verwendet).' })
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
              <Link to={PLATFORM_ROUTES.kosten} className="meta">Kosten</Link>
            </>
          )}
        </nav>

        <h1 style={{ marginBottom: '0.5rem' }}>💼 Lizenzen</h1>
        <p style={{ color: 'var(--k2-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          Konditionen einsehen und Lizenzen vergeben. Optional Empfehler-ID für das Empfehlungs-Programm (Vergütung/Abrechnung).
        </p>

        {/* Lizenz-Konditionen (Übersicht) */}
        <section style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: 'var(--k2-text)' }}>
            1. Lizenz-Konditionen (Stufen)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {LICENCE_TYPES.map((t) => (
              <div key={t.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <strong style={{ color: 'var(--k2-accent)' }}>{t.name}</strong>
                <div style={{ fontSize: '0.9rem', color: 'var(--k2-muted)', marginTop: '0.25rem' }}>{t.price}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--k2-muted)', marginTop: '0.5rem', lineHeight: 1.4 }}>{t.summary}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Lizenzmodell im Detail – wie für Kunden (volle Info für Entscheidung) */}
        <section style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: 'var(--k2-accent)' }}>
            2. Lizenzmodell im Detail (wie für Kunden – volle Info für die Entscheidung)
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--k2-muted)', marginBottom: '1rem' }}>
            Alle Stufen nutzen dieselbe App; der Umfang wird über Limits und freigeschaltete Features gesteuert.
          </p>

          {/* Überblick */}
          <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem', color: 'var(--k2-text)' }}>Überblick</h3>
          <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--k2-accent)' }}>Stufe</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--k2-muted)' }}>Zielgruppe</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--k2-muted)' }}>Preis</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--k2-muted)' }}>Kerndifferenzierung</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}><td style={{ padding: '0.5rem' }}><strong>Basic</strong></td><td style={{ padding: '0.5rem' }}>Einstieg, erste Schritte</td><td style={{ padding: '0.5rem' }}>49 €/Monat</td><td style={{ padding: '0.5rem' }}>Begrenzte Werke, eine Galerie, <TermWithExplanation term="Standard-URL" /></td></tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}><td style={{ padding: '0.5rem' }}><strong>Pro</strong></td><td style={{ padding: '0.5rem' }}>Aktive Künstler:innen</td><td style={{ padding: '0.5rem' }}>99 €/Monat</td><td style={{ padding: '0.5rem' }}>Mehr Werke, <TermWithExplanation term="Custom Domain" />, volles Marketing</td></tr>
                <tr><td style={{ padding: '0.5rem' }}><strong>Enterprise</strong></td><td style={{ padding: '0.5rem' }}>Galerien, <TermWithExplanation term="White-Label" /></td><td style={{ padding: '0.5rem' }}>nach Vereinbarung</td><td style={{ padding: '0.5rem' }}>Unbegrenzt, <TermWithExplanation term="API" />, eigenes Branding, <TermWithExplanation term="Dedicated Support" /></td></tr>
              </tbody>
            </table>
          </div>

          {/* Basic */}
          <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem', color: 'var(--k2-text)' }}>Basic (Einstieg)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.5rem' }}>Schneller Einstieg, ideal zum Ausprobieren und für kleine Portfolios.</p>
          <ul style={{ margin: '0 0 1rem 1.25rem', padding: 0, fontSize: '0.9rem', lineHeight: 1.7 }}>
            <li><strong>Werke:</strong> bis 30 Werke</li>
            <li><strong>Galerie:</strong> 1 Galerie (eine öffentliche URL)</li>
            <li>Events, Stammdaten & Design, Kasse, Etiketten, Marketing (Basis), Backup, Standard-URL + QR, Support (Doku, E-Mail)</li>
            <li><em>Nicht enthalten:</em> <TermWithExplanation term="Custom Domain" />, unbegrenzte Werke, <TermWithExplanation term="White-Label" />, <TermWithExplanation term="API" /></li>
          </ul>

          {/* Pro */}
          <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem', color: 'var(--k2-text)' }}>Pro (Aktive Künstler:innen)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.5rem' }}>Professioneller Dauerbetrieb mit eigenem Auftritt.</p>
          <ul style={{ margin: '0 0 1rem 1.25rem', padding: 0, fontSize: '0.9rem', lineHeight: 1.7 }}>
            <li><strong>Werke:</strong> unbegrenzt</li>
            <li><strong>Galerie:</strong> 1 Galerie</li>
            <li>Alles aus Basic, dazu: <strong><TermWithExplanation term="Custom Domain" /></strong> (eigene Domain), <strong>Marketing voll</strong> (Flyer, Presse, Newsletter, Plakat, Social Media, Event-Flyer), priorisierter Support</li>
          </ul>

          {/* Enterprise */}
          <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem', color: 'var(--k2-text)' }}>Enterprise (Galerien / Mehrbedarf)</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.5rem' }}>Galerien, Agenturen – eigenes Branding, technische Anbindung.</p>
          <ul style={{ margin: '0 0 1rem 1.25rem', padding: 0, fontSize: '0.9rem', lineHeight: 1.7 }}>
            <li>Alles aus Pro, dazu: <strong><TermWithExplanation term="White-Label" /></strong> (eigenes Logo/Name), <strong><TermWithExplanation term="API" />-Zugang</strong>, <strong><TermWithExplanation term="Dedicated Support" /></strong>, ggf. mehrere Galerien/Instanzen. Preis nach Vereinbarung.</li>
          </ul>

          {/* Feature-Matrix */}
          <h3 style={{ fontSize: '1rem', margin: '0 0 0.5rem', color: 'var(--k2-text)' }}>Kurzvergleich (Feature-Matrix)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                  <th style={{ textAlign: 'left', padding: '0.4rem', color: 'var(--k2-muted)' }}>Feature / Limit</th>
                  <th style={{ textAlign: 'center', padding: '0.4rem', color: 'var(--k2-accent)' }}>Basic</th>
                  <th style={{ textAlign: 'center', padding: '0.4rem', color: 'var(--k2-accent)' }}>Pro</th>
                  <th style={{ textAlign: 'center', padding: '0.4rem', color: 'var(--k2-accent)' }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}><td style={{ padding: '0.4rem' }}>Werke</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>bis 30</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>unbegrenzt</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>unbegrenzt</td></tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}><td style={{ padding: '0.4rem' }}>Galerien</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>1</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>1</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>1 oder mehr</td></tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}><td style={{ padding: '0.4rem' }}>Events, Stammdaten, Design, Kasse, Etiketten</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td></tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}><td style={{ padding: '0.4rem' }}>Marketing (Basis)</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td></tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}><td style={{ padding: '0.4rem' }}>Marketing (voll)</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>nein</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td></tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}><td style={{ padding: '0.4rem' }}>Standard-URL + QR</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td></tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}><td style={{ padding: '0.4rem' }}><TermWithExplanation term="Custom Domain" /></td><td style={{ padding: '0.4rem', textAlign: 'center' }}>nein</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td></tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}><td style={{ padding: '0.4rem' }}><TermWithExplanation term="White-Label" /> / <TermWithExplanation term="API" /></td><td style={{ padding: '0.4rem', textAlign: 'center' }}>nein</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>nein</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>ja</td></tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}><td style={{ padding: '0.4rem' }}>Support</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>Standard</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>priorisiert</td><td style={{ padding: '0.4rem', textAlign: 'center' }}><TermWithExplanation term="Dedicated Support" /></td></tr>
                <tr><td style={{ padding: '0.4rem' }}>Preis</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>49 €/Monat</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>99 €/Monat</td><td style={{ padding: '0.4rem', textAlign: 'center' }}>nach Vereinbarung</td></tr>
              </tbody>
            </table>
          </div>

          {/* Aufstufung */}
          <h3 style={{ fontSize: '1rem', margin: '1rem 0 0.5rem', color: 'var(--k2-text)' }}>Aufstufung</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--k2-muted)', margin: 0, lineHeight: 1.6 }}>
            Du kannst jederzeit auf eine höhere Stufe wechseln: <strong>Basic → Pro</strong> oder <strong>Pro → Enterprise</strong>. 
            Die Differenz wird anteilig auf die laufende Abrechnungsperiode berechnet; ab der nächsten Periode gilt der neue Preis. 
            Deine Daten und Einstellungen bleiben erhalten.
          </p>
        </section>

        {/* Lizenz vergeben */}
        <section style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: 'var(--k2-text)' }}>
            3. Lizenz vergeben
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.25rem' }}>Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Name des Lizenz-Inhabers"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.25rem' }}>E-Mail *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="E-Mail"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.25rem' }}>Lizenz-Typ</label>
              <select
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value as LicenceGrant['licenseType'])}
                className="input"
              >
                {LICENCE_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} – {t.price}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.25rem' }}>
                Empfehler-ID (optional, für Abrechnung)
              </label>
              <input
                type="text"
                value={empfehlerId}
                onChange={(e) => setEmpfehlerId(e.target.value)}
                className="input"
                placeholder="z. B. Partner-ID oder E-Mail des Empfehlers"
              />
            </div>
            {message && (
              <p style={{
                fontSize: '0.9rem',
                color: message.type === 'ok' ? 'var(--k2-accent)' : '#f87171',
                margin: 0
              }}>
                {message.text}
              </p>
            )}
            <button type="submit" className="btn primary-btn">Lizenz erfassen</button>
          </form>
        </section>

        {/* Liste vergebener Lizenzen (lokal) */}
        {grants.length > 0 && (
          <section style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: 'var(--k2-text)' }}>
              4. Vergebene Lizenzen (lokal gespeichert)
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {grants.map((g) => (
                <li key={g.id} style={{
                  padding: '0.75rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontSize: '0.9rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  alignItems: 'center'
                }}>
                  <span style={{ color: 'var(--k2-text)' }}>{g.name ?? ''}</span>
                  <span style={{ color: 'var(--k2-muted)' }}>{g.email ?? ''}</span>
                  <span style={{ textTransform: 'capitalize', color: 'var(--k2-accent)' }}>{g.licenseType ?? 'pro'}</span>
                  {g.empfehlerId && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--k2-muted)' }}>Empfehler: {g.empfehlerId}</span>
                  )}
                </li>
              ))}
            </ul>
            <p style={{ fontSize: '0.8rem', color: 'var(--k2-muted)', marginTop: '1rem', marginBottom: 0 }}>
              Speicher: localStorage. Für Produktion: Backend/Supabase und Abrechnungsstruktur anbinden.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
