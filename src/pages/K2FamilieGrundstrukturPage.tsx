/**
 * K2 Familie – Grundstruktur anlegen (Wizard).
 * Route: /projects/k2-familie/grundstruktur
 * 5 Schritte: Du & Partner → Kinder → Geschwister (welcher bist du?) → Eltern (Vater + Mütter) → Anlegen.
 */

import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { loadPersonen, savePersonen, saveEinstellungen, loadEinstellungen } from '../utils/familieStorage'
import { buildGrundstrukturPersonen } from '../utils/grundstrukturBuild'
import { useFamilieTenant } from '../context/FamilieTenantContext'

const C = {
  text: '#f0f6ff',
  textSoft: 'rgba(255,255,255,0.78)',
  accent: '#14b8a6',
  border: 'rgba(13,148,136,0.35)',
}

const STEPS = 5

export default function K2FamilieGrundstrukturPage() {
  const navigate = useNavigate()
  const { currentTenantId } = useFamilieTenant()
  const [step, setStep] = useState(1)
  const [numKinder, setNumKinder] = useState(4)
  const [numGeschwister, setNumGeschwister] = useState(12)
  const [welcherBistDu, setWelcherBistDu] = useState(1)
  const [numMuetter, setNumMuetter] = useState(2)
  const [numGeschwisterVonErsterMutter, setNumGeschwisterVonErsterMutter] = useState(4)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const personen = loadPersonen(currentTenantId)
  if (personen.length > 0) {
    return (
      <div className="mission-wrapper">
        <div className="viewport k2-familie-page">
          <div className="card" style={{ padding: '1.5rem', maxWidth: 480, margin: '2rem auto' }}>
            <p style={{ margin: 0, color: C.text }}>Grundstruktur ist nur möglich, wenn noch keine Personen angelegt sind.</p>
            <p className="meta" style={{ margin: '0.75rem 0 0' }}>Du hast bereits {personen.length} Person(en). Fehlende kannst du jederzeit einzeln hinzufügen.</p>
            <div style={{ marginTop: '1.25rem' }}>
              <Link to={PROJECT_ROUTES['k2-familie'].stammbaum} className="btn">Zum Stammbaum</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleAnlegen = () => {
    setError('')
    setSaving(true)
    try {
      const { personen: neu, ichBinPersonId, ichBinPositionAmongSiblings } = buildGrundstrukturPersonen({
        numKinder,
        numGeschwister,
        welcherBistDu,
        numMuetter,
        numGeschwisterVonErsterMutter: Math.min(numGeschwisterVonErsterMutter, numGeschwister),
      })
      if (!savePersonen(currentTenantId, neu)) {
        setError('Speichern fehlgeschlagen.')
        setSaving(false)
        return
      }
      const einst = loadEinstellungen(currentTenantId)
      saveEinstellungen(currentTenantId, { ...einst, ichBinPersonId, ichBinPositionAmongSiblings })
      navigate(PROJECT_ROUTES['k2-familie'].stammbaum)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Anlegen.')
      setSaving(false)
    }
  }

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page" style={{ maxWidth: 560, margin: '0 auto' }}>
        <header style={{ marginBottom: '1.5rem' }}>
          <Link to={PROJECT_ROUTES['k2-familie'].stammbaum} className="meta">← Stammbaum</Link>
          <h1 style={{ margin: '0.5rem 0 0', color: C.text }}>Grundstruktur anlegen</h1>
          <p className="meta" style={{ margin: '0.35rem 0 0' }}>
            Schritt {step} von {STEPS} – die Struktur kennt jeder, fehlende Personen kannst du später einfügen.
          </p>
        </header>

        <div className="card familie-card-enter" style={{ padding: '1.5rem', border: `1px solid ${C.border}` }}>
          {step === 1 && (
            <>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: C.text }}>Mit wem beginnst du?</h2>
              <p className="meta" style={{ marginBottom: '1rem' }}>Du und deine Partnerin bzw. dein Partner – zwei Personen. Namen könnt ihr später eintragen.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(13,148,136,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${C.accent}`, color: C.text }}>Du</div>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(13,148,136,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.border}`, color: C.textSoft }}>Partner/in</div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: C.text }}>Wie viele Kinder habt ihr?</h2>
              <p className="meta" style={{ marginBottom: '1rem' }}>Es entstehen Plätze für eure Kinder. Namen später eintragen.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ color: C.text }}>Anzahl</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={numKinder}
                  onChange={(e) => setNumKinder(Math.max(0, Math.min(20, parseInt(e.target.value, 10) || 0)))}
                  style={{ width: 72, padding: '0.5rem', fontSize: '1.1rem', borderRadius: 6, border: `1px solid ${C.border}` }}
                />
              </div>
              {numKinder > 0 && (
                <p className="meta" style={{ marginTop: '1rem' }}>Leiste unten: {numKinder} Platz{numKinder !== 1 ? 'e' : ''} für Kind 1 … {numKinder}</p>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: C.text }}>Wie viele Geschwister (inkl. dir)?</h2>
              <p className="meta" style={{ marginBottom: '1rem' }}>Du bist einer davon. Leiste oben – alle Geschwister.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <label style={{ color: C.text }}>Anzahl</label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={numGeschwister}
                  onChange={(e) => {
                    const v = Math.max(1, Math.min(25, parseInt(e.target.value, 10) || 1))
                    setNumGeschwister(v)
                    setWelcherBistDu((prev) => Math.min(prev, v))
                  }}
                  style={{ width: 72, padding: '0.5rem', fontSize: '1.1rem', borderRadius: 6, border: `1px solid ${C.border}` }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ color: C.text }}>Welcher Platz bist du?</label>
                <select
                  value={welcherBistDu}
                  onChange={(e) => setWelcherBistDu(parseInt(e.target.value, 10))}
                  style={{ padding: '0.5rem', fontSize: '1rem', borderRadius: 6, border: `1px solid ${C.border}`, minWidth: 80 }}
                >
                  {Array.from({ length: numGeschwister }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}. Platz</option>
                  ))}
                </select>
              </div>
              <p className="meta" style={{ marginTop: '1rem' }}>Im Stammbaum wird „Du“ an diesem Platz hervorgehoben.</p>
            </>
          )}

          {step === 4 && (
            <>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: C.text }}>Eltern-Ebene (Struktur)</h2>
              <p className="meta" style={{ marginBottom: '1rem' }}>Ein Vater – wie viele Mütter / Partnerinnen des Vaters?</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ color: C.text }}>Vater +</span>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={numMuetter}
                  onChange={(e) => setNumMuetter(Math.max(1, Math.min(6, parseInt(e.target.value, 10) || 1)))}
                  style={{ width: 56, padding: '0.5rem', fontSize: '1.1rem', borderRadius: 6, border: `1px solid ${C.border}` }}
                />
                <span style={{ color: C.text }}>Mutter / Frauen</span>
              </div>
              {numMuetter >= 2 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ color: C.text }}>Die ersten</label>
                  <input
                    type="number"
                    min={0}
                    max={numGeschwister}
                    value={numGeschwisterVonErsterMutter}
                    onChange={(e) => setNumGeschwisterVonErsterMutter(Math.max(0, Math.min(numGeschwister, parseInt(e.target.value, 10) || 0)))}
                    style={{ width: 56, padding: '0.5rem', fontSize: '1.1rem', borderRadius: 6, border: `1px solid ${C.border}` }}
                  />
                  <span style={{ color: C.text }}>Geschwister sind von der ersten Mutter (z. B. Anna), der Rest von der zweiten.</span>
                </div>
              )}
              <p className="meta" style={{ marginTop: '1rem' }}>Reihenfolge im Stammbaum: 1, 2, 3 … bis {numGeschwister}, Du an Platz {welcherBistDu}.</p>
            </>
          )}

          {step === 5 && (
            <>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: C.text }}>Zusammenfassung</h2>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: C.text, lineHeight: 1.7 }}>
                <li>Du + Partner/in (Partnerschaft)</li>
                <li>{numKinder} Kind{numKinder !== 1 ? 'er' : ''} (Leiste unten)</li>
                <li>{numGeschwister} Geschwister in einer Reihe (1 … {numGeschwister}), du bist Platz {welcherBistDu} ({welcherBistDu - 1} vor dir, {numGeschwister - welcherBistDu} hinter dir)</li>
                <li>Vater + {numMuetter} Mutter/Frau{numMuetter !== 1 ? 'en' : ''}{numMuetter >= 2 ? ` – erste ${Math.min(numGeschwisterVonErsterMutter, numGeschwister)} von erster Mutter (z. B. Anna)` : ''}</li>
              </ul>
              <p className="meta" style={{ marginTop: '1rem' }}>Es werden Platzhalter-Personen und alle Beziehungen angelegt. Namen und Fotos könnt ihr danach eintragen – Geschwister und Partnerin können ihre Linie selbst ausfüllen.</p>
              {error && <p style={{ color: '#f87171', marginTop: '0.75rem' }}>{error}</p>}
              <button
                type="button"
                className="btn"
                onClick={handleAnlegen}
                disabled={saving}
                style={{ marginTop: '1.25rem' }}
              >
                {saving ? 'Wird angelegt …' : 'Grundstruktur anlegen'}
              </button>
            </>
          )}

          {step < 5 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '1rem' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
              >
                Zurück
              </button>
              <button type="button" className="btn" onClick={() => setStep((s) => Math.min(STEPS, s + 1))}>
                Weiter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
