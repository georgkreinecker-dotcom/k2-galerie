/**
 * VK2 Mitglied-Login – eigene saubere Seite unter /vk2-login
 * Mitglied wählt Namen, gibt PIN ein → eigener Bereich öffnet sich
 */
import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { initVk2DemoStammdatenIfEmpty, type Vk2Stammdaten, type Vk2Mitglied } from '../config/tenantConfig'
import { PROJECT_ROUTES } from '../config/navigation'

const SESSION_KEY = 'k2-vk2-mitglied-eingeloggt'
// Programmierer-Passwort (Bypass) – nur am Mac/Cursor bekannt
const DEV_BYPASS = 'k2dev2026'

function loadMitglieder(): Vk2Mitglied[] {
  try {
    initVk2DemoStammdatenIfEmpty()
    const raw = localStorage.getItem('k2-vk2-stammdaten')
    if (!raw) return []
    const sd = JSON.parse(raw) as Vk2Stammdaten
    return (sd.mitglieder || []).filter(m => m.pin)
  } catch { return [] }
}

function loadVereinsName(): string {
  try {
    const raw = localStorage.getItem('k2-vk2-stammdaten')
    if (!raw) return 'Vereinsplattform'
    const sd = JSON.parse(raw) as Vk2Stammdaten
    return sd.verein?.name || 'Vereinsplattform'
  } catch { return 'Vereinsplattform' }
}

const Vk2MitgliedLoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mitglieder = loadMitglieder()
  const vereinsName = loadVereinsName()

  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [fehler, setFehler] = useState('')
  const [step, setStep] = useState<'name' | 'pin'>('name')

  // Programmierer-Bypass: ?dev=k2dev2026 → sofort als Vorstand rein
  useEffect(() => {
    if (searchParams.get('dev') === DEV_BYPASS) {
      try { sessionStorage.setItem('k2-admin-context', 'vk2') } catch (_) {}
      navigate('/admin?context=vk2')
    }
  }, [searchParams, navigate])

  const gewaehlt = mitglieder.find(m => m.name === name)

  function weiterZuPin() {
    if (!name) { setFehler('Bitte deinen Namen wählen.'); return }
    setFehler('')
    setStep('pin')
  }

  function einloggen() {
    if (!gewaehlt || gewaehlt.pin !== pin) {
      setFehler('PIN falsch. Bitte nochmal versuchen.')
      setPin('')
      return
    }
    // Vorstand → normaler Admin
    if (gewaehlt.rolle === 'vorstand') {
      try { sessionStorage.setItem('k2-admin-context', 'vk2') } catch (_) {}
      navigate('/admin?context=vk2')
      return
    }
    // Mitglied → eigener Bereich
    try { sessionStorage.setItem(SESSION_KEY, gewaehlt.name) } catch (_) {}
    navigate('/admin?context=vk2&mitglied=1')
  }

  const s = {
    bg: '#0f1c2e',
    card: '#162032',
    elevated: '#1e2f47',
    accent: '#ff8c42',
    text: '#f0f6ff',
    muted: 'rgba(160,200,255,0.55)',
    border: 'rgba(37,99,235,0.3)',
  }

  return (
    <div style={{ minHeight: '100vh', background: s.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '1rem' }}>

      {/* Logo / Vereinsname */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏛️</div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: s.accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {vereinsName}
        </div>
        <div style={{ fontSize: '0.82rem', color: s.muted, marginTop: '0.25rem' }}>Mitglieder-Bereich</div>
      </div>

      {/* Karte */}
      <div style={{ background: s.card, borderRadius: 20, border: `1px solid ${s.border}`, padding: 'clamp(1.5rem,5vw,2.5rem)', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

        {step === 'name' ? (
          <>
            <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.3rem', fontWeight: 800, color: s.text }}>Wer bist du?</h2>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: s.muted }}>Wähle deinen Namen aus der Liste.</p>

            {mitglieder.length === 0 ? (
              <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#fca5a5', fontSize: '0.88rem', textAlign: 'center' }}>
                Noch kein Mitglied mit PIN eingerichtet.<br />
                <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>Bitte den Vorstand kontaktieren.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {mitglieder.map(m => (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => { setName(m.name); setFehler('') }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.7rem 0.9rem',
                      background: name === m.name ? `${s.accent}22` : s.elevated,
                      border: `2px solid ${name === m.name ? s.accent : 'transparent'}`,
                      borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                    }}
                  >
                    {m.mitgliedFotoUrl ? (
                      <img src={m.mitgliedFotoUrl} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${name === m.name ? s.accent : 'rgba(255,140,66,0.3)'}`, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${s.accent},#b54a1e)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {(m.name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: s.text }}>{m.name}</div>
                      {m.typ && <div style={{ fontSize: '0.78rem', color: name === m.name ? s.accent : s.muted }}>{m.typ}</div>}
                    </div>
                    {name === m.name && <span style={{ marginLeft: 'auto', color: s.accent, fontSize: '1.1rem' }}>✓</span>}
                  </button>
                ))}
              </div>
            )}

            {fehler && <p style={{ margin: '0.75rem 0 0', color: '#fca5a5', fontSize: '0.83rem' }}>{fehler}</p>}

            <button
              type="button"
              disabled={!name}
              onClick={weiterZuPin}
              style={{ marginTop: '1.25rem', width: '100%', padding: '0.8rem', background: name ? `linear-gradient(135deg,${s.accent},#d4622a)` : 'rgba(255,140,66,0.15)', border: 'none', borderRadius: 12, color: name ? '#fff' : s.muted, fontSize: '1rem', fontWeight: 700, cursor: name ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
            >
              Weiter →
            </button>
          </>
        ) : (
          <>
            {/* Zurück + Foto */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <button type="button" onClick={() => { setStep('name'); setPin(''); setFehler('') }} style={{ background: 'none', border: 'none', color: s.muted, cursor: 'pointer', fontSize: '1.2rem', padding: 0, lineHeight: 1 }}>←</button>
              {gewaehlt?.mitgliedFotoUrl ? (
                <img src={gewaehlt.mitgliedFotoUrl} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${s.accent}` }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${s.accent},#b54a1e)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                  {(gewaehlt?.name || '?')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: s.text }}>{gewaehlt?.name}</div>
                <div style={{ fontSize: '0.78rem', color: s.muted }}>PIN eingeben</div>
              </div>
            </div>

            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: s.muted }}>Dein 4-stelliger PIN (vom Vorstand vergeben).</p>

            {/* PIN-Eingabe: 4 Felder */}
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '1rem' }}>
              {[0,1,2,3].map(i => (
                <input
                  key={i}
                  id={`pin-${i}`}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={pin[i] || ''}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0,1)
                    const neu = (pin + '    ').split('').map((c, j) => j === i ? v : c).join('').slice(0,4).trimEnd()
                    setPin(neu)
                    setFehler('')
                    if (v && i < 3) {
                      const next = document.getElementById(`pin-${i+1}`) as HTMLInputElement
                      next?.focus()
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !pin[i] && i > 0) {
                      const prev = document.getElementById(`pin-${i-1}`) as HTMLInputElement
                      prev?.focus()
                    }
                    if (e.key === 'Enter' && pin.length === 4) einloggen()
                  }}
                  style={{
                    width: 54, height: 60, textAlign: 'center', fontSize: '1.6rem', fontWeight: 800,
                    background: s.elevated, border: `2px solid ${fehler ? 'rgba(239,68,68,0.5)' : pin[i] ? s.accent : s.border}`,
                    borderRadius: 12, color: s.text, outline: 'none', transition: 'border-color 0.15s'
                  }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {fehler && <p style={{ margin: '0 0 0.75rem', color: '#fca5a5', fontSize: '0.83rem', textAlign: 'center' }}>{fehler}</p>}

            <button
              type="button"
              disabled={pin.length < 4}
              onClick={einloggen}
              style={{ width: '100%', padding: '0.8rem', background: pin.length === 4 ? `linear-gradient(135deg,${s.accent},#d4622a)` : 'rgba(255,140,66,0.15)', border: 'none', borderRadius: 12, color: pin.length === 4 ? '#fff' : s.muted, fontSize: '1rem', fontWeight: 700, cursor: pin.length === 4 ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}
            >
              Einloggen →
            </button>

            <p style={{ margin: '0.75rem 0 0', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(160,200,255,0.3)' }}>
              PIN vergessen? Den Vorstand fragen.
            </p>
          </>
        )}
      </div>

      {/* Zurück zur Galerie */}
      <button
        type="button"
        onClick={() => navigate(PROJECT_ROUTES.vk2.galerie)}
        style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: s.muted, fontSize: '0.85rem', cursor: 'pointer' }}
      >
        ← Zurück zur Vereins-Galerie
      </button>
    </div>
  )
}

export default Vk2MitgliedLoginPage
