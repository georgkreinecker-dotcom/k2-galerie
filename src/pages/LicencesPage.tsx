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
  licenseType: 'basic' | 'pro' | 'excellent' | 'vk2'
  empfehlerId?: string
  createdAt: string
}

const LICENCE_TYPES: { id: 'basic' | 'pro' | 'excellent' | 'vk2'; name: string; price: string; summary: string; icon: string; highlight?: boolean }[] = [
  { id: 'basic',     name: 'Basic',              price: '49 €/Monat',                           icon: '🎨',  summary: 'Bis 30 Werke, 1 Galerie, Events, Kasse, Etiketten, Standard-URL' },
  { id: 'pro',       name: 'Pro',                price: '99 €/Monat',                           icon: '⭐',  summary: 'Unbegrenzte Werke, Custom Domain, volles Marketing (Flyer, Presse, Social Media)' },
  { id: 'excellent', name: 'Excellent',          price: '149 €/Monat',                          icon: '💎',  summary: 'Alles aus Pro + Anfragen-Inbox, Echtheitszertifikat, Newsletter, Verkaufsstatistik, Pressemappe, Priority Support', highlight: true },
  { id: 'vk2',       name: 'Kunstvereine (VK2)', price: 'ab 10 Mitgliedern kostenfrei',         icon: '🏛️', summary: 'Verein nutzt Pro; Vereinsmitglieder 50 % Rabatt; nicht registrierte Mitglieder im System erfasst' },
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
  embeddedInMok2Layout?: boolean
}

export default function LicencesPage({ embeddedInMok2Layout }: LicencesPageProps = {}) {
  const [grants, setGrants] = useState<LicenceGrant[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [licenseType, setLicenseType] = useState<LicenceGrant['licenseType']>('excellent')
  const [empfehlerId, setEmpfehlerId] = useState('')
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

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
    setMessage({ type: 'ok', text: '✅ Lizenz erfasst.' })
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
              <Link to={PLATFORM_ROUTES.kosten} className="meta">Kosten</Link>
            </>
          )}
        </nav>

        <h1 style={{ marginBottom: '0.5rem' }}>💼 Lizenzen</h1>
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
              const isExcellent = lt.id === 'excellent'
              return (
                <div key={lt.id} style={{
                  background: isExcellent
                    ? 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.06) 100%)'
                    : count > 0 ? 'rgba(95,251,241,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isExcellent ? 'rgba(251,191,36,0.5)' : count > 0 ? 'rgba(95,251,241,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '10px', padding: '1rem',
                  position: 'relative'
                }}>
                  {isExcellent && (
                    <div style={{ position: 'absolute', top: -10, right: 12, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', color: '#1a1a00', fontSize: '0.7rem', fontWeight: 800, padding: '2px 10px', borderRadius: 20, letterSpacing: '0.5px' }}>
                      PREMIUM
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <strong style={{ color: isExcellent ? '#fbbf24' : 'var(--k2-accent)', fontSize: '1rem' }}>{lt.icon} {lt.name}</strong>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 20,
                      background: count > 0 ? 'rgba(95,251,241,0.15)' : 'rgba(255,255,255,0.06)',
                      color: count > 0 ? 'var(--k2-accent)' : 'var(--k2-muted)',
                    }}>
                      {count > 0 ? `✅ ${count} aktiv` : '○ keine'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: isExcellent ? '#fbbf24' : 'var(--k2-accent)', fontWeight: 600, marginBottom: '0.3rem' }}>{lt.price}</div>
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
            <p style={{ margin: '0 0 0.5rem' }}><strong style={{ color: 'var(--k2-text)' }}>🎨 Basic</strong> – Bis 30 Werke, 1 Galerie, Events, Kasse, Etiketten, Marketing (Basis), <TermWithExplanation term="Standard-URL" />. 49 €/Monat.</p>
            <p style={{ margin: '0 0 0.5rem' }}><strong style={{ color: 'var(--k2-text)' }}>⭐ Pro</strong> – Alles aus Basic + unbegrenzte Werke, <TermWithExplanation term="Custom Domain" />, volles Marketing (Flyer, Presse, Social Media, Plakat). 99 €/Monat.</p>
            <p style={{ margin: '0 0 0.5rem', padding: '0.6rem 0.85rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8 }}>
              <strong style={{ color: '#fbbf24' }}>💎 Excellent</strong> – Alles aus Pro + <strong style={{ color: 'var(--k2-text)' }}>Anfragen-Inbox</strong> (Besucher stellen Anfragen direkt in der Galerie), <strong style={{ color: 'var(--k2-text)' }}>Echtheitszertifikat</strong> (PDF pro Werk), <strong style={{ color: 'var(--k2-text)' }}>Newsletter & Einladungsliste</strong> (Kontakte für Vernissagen), <strong style={{ color: 'var(--k2-text)' }}>Verkaufsstatistik</strong> (Umsatz, Kategorien, Zeitraum), <strong style={{ color: 'var(--k2-text)' }}>Pressemappe PDF</strong> (automatisch generiert), Priority Support. 149 €/Monat.
            </p>
            <p style={{ margin: 0 }}><strong style={{ color: 'var(--k2-text)' }}>🏛️ Kunstvereine (VK2)</strong> – Verein nutzt Pro; ab 10 registrierten Mitgliedern kostenfrei. Vereinsmitglieder: 50 % Rabatt. Nicht registrierte Mitglieder werden im System erfasst (Datenschutz beachten).</p>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--k2-muted)', marginTop: '0.75rem', marginBottom: 0 }}>
            Aufstufung jederzeit möglich: Basic → Pro → Excellent → Kunstvereine (VK2). Daten bleiben erhalten.
          </p>
        </section>

        {/* LIZENZ VERGEBEN */}
        <section style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.05rem', margin: '0 0 1rem', color: 'var(--k2-text)' }}>
            ➕ Neue Lizenz vergeben
          </h2>
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
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--k2-muted)', marginBottom: '0.25rem' }}>Empfehler-ID (optional)</label>
              <input type="text" value={empfehlerId} onChange={(e) => setEmpfehlerId(e.target.value)} className="input" placeholder="ID des Empfehlers (für Vergütung)" />
            </div>
            {message && (
              <p style={{ fontSize: '0.9rem', color: message.type === 'ok' ? 'var(--k2-accent)' : '#f87171', margin: 0 }}>
                {message.text}
              </p>
            )}
            <button type="submit" className="btn primary-btn">Lizenz erfassen</button>
          </form>
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
    </div>
  )
}
