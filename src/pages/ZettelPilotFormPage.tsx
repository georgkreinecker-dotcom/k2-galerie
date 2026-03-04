/**
 * Neuer Test-Pilot: Name eingeben → ök2 oder VK2 wählen → QR wird automatisch vergeben → Laufzettel generieren und mitgeben.
 */

const PILOT_ZETTEL_NR_KEY = 'k2-pilot-zettel-last-nr'
const OEK2_URL = 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie-oeffentlich'
const VK2_URL = 'https://k2-galerie.vercel.app/projects/vk2/galerie'

function getNextZettelNr(): string {
  try {
    const last = localStorage.getItem(PILOT_ZETTEL_NR_KEY)
    const n = last ? parseInt(last, 10) : 0
    return String(Number.isNaN(n) ? 1 : n + 1)
  } catch {
    return '1'
  }
}

function setLastZettelNr(nr: string) {
  try {
    const n = parseInt(nr, 10)
    if (!Number.isNaN(n) && n > 0) localStorage.setItem(PILOT_ZETTEL_NR_KEY, String(n))
  } catch { /* ignore */ }
}

export type PilotType = 'oek2' | 'vk2'

import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function ZettelPilotFormPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [pilotType, setPilotType] = useState<PilotType | ''>('')
  const [nr, setNr] = useState('')

  useEffect(() => {
    setNr(getNextZettelNr())
  }, [])

  const handleGenerate = () => {
    if (!name.trim() || !pilotType) return
    if (nr.trim()) setLastZettelNr(nr.trim())
    const pilotUrl = pilotType === 'oek2' ? OEK2_URL : VK2_URL
    const params = new URLSearchParams()
    params.set('name', name.trim())
    params.set('type', pilotType)
    params.set('pilotUrl', pilotUrl)
    if (nr.trim()) params.set('nr', nr.trim())
    navigate(`/zettel-pilot?${params.toString()}`)
  }

  const canGenerate = name.trim().length > 0 && pilotType !== ''

  return (
    <main style={{ padding: '2rem', maxWidth: 480, margin: '0 auto', background: '#fff', minHeight: '100vh', color: '#1c1a18' }}>
      <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Neuer Test-Pilot</h1>
      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1.5rem' }}>
        Name eingeben → ök2 oder VK2 wählen → QR wird automatisch vergeben → Laufzettel generieren und mitgeben.
      </p>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>
          Name der Pilot:in
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. Muna"
          autoFocus
          style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '1rem', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
          Zugang für
        </label>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 0.75rem', border: `2px solid ${pilotType === 'oek2' ? '#1a1a1a' : '#ddd'}`, borderRadius: 8, background: pilotType === 'oek2' ? '#f5f5f5' : 'transparent' }}>
            <input type="radio" name="pilotType" checked={pilotType === 'oek2'} onChange={() => setPilotType('oek2')} />
            <span>ök2 (Künstler-Demo)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 0.75rem', border: `2px solid ${pilotType === 'vk2' ? '#1a1a1a' : '#ddd'}`, borderRadius: 8, background: pilotType === 'vk2' ? '#f5f5f5' : 'transparent' }}>
            <input type="radio" name="pilotType" checked={pilotType === 'vk2'} onChange={() => setPilotType('vk2')} />
            <span>VK2 (Vereinsplattform)</span>
          </label>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.35rem' }}>
          Sobald du wählst, wird die Adresse und der QR-Code für diesen Zugang festgelegt und erscheinen auf dem Laufzettel.
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>
          Zettel-Nr. <span style={{ fontWeight: 400, color: '#666' }}>(fortlaufend)</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={nr}
          onChange={(e) => setNr(e.target.value.replace(/\D/g, ''))}
          style={{ width: '5rem', padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '1rem', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          style={{
            padding: '0.6rem 1.2rem',
            background: canGenerate ? '#1a1a1a' : '#ccc',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: canGenerate ? 'pointer' : 'not-allowed',
            fontSize: '0.95rem',
          }}
        >
          Laufzettel generieren
        </button>
        <Link to="/mission-control" style={{ padding: '0.6rem 1.2rem', color: '#333', fontSize: '0.9rem' }}>
          ← Mission Control
        </Link>
      </div>
      {!canGenerate && (
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.75rem' }}>
          Bitte zuerst Name eintragen und ök2 oder VK2 wählen.
        </p>
      )}
    </main>
  )
}
