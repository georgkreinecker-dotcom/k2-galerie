/**
 * Neuer Test-Pilot: Name eingeben → ök2, VK2 oder K2 Familie wählen → QR wird automatisch vergeben → Laufzettel generieren und mitgeben.
 */

import { BASE_APP_URL, ENTDECKEN_ROUTE, K2_FAMILIE_WILLKOMMEN_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { buildFamiliePilotWillkommenUrl } from '../utils/familiePilotSeed'
import { getNextPilotZettelNr, setLastPilotZettelNr } from '../utils/pilotZettelNr'

/** Testpiloten über denselben Einstieg wie alle: Entdecken → Vorschau → Admin */
const OEK2_URL = BASE_APP_URL + ENTDECKEN_ROUTE
const VK2_URL = BASE_APP_URL + PROJECT_ROUTES.vk2.galerie
const FAMILIE_URL = BASE_APP_URL + K2_FAMILIE_WILLKOMMEN_ROUTE

export type PilotType = 'oek2' | 'vk2' | 'familie'

import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function ZettelPilotFormPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  /** Anzeigename für die Test-App (alle Linien); bei K2 Familie → Parameter fn im Willkommens-Link */
  const [appName, setAppName] = useState('')
  const [pilotType, setPilotType] = useState<PilotType | ''>('')
  const [nr, setNr] = useState('')

  useEffect(() => {
    setNr(getNextPilotZettelNr())
  }, [])

  const handleGenerate = () => {
    if (!name.trim() || !appName.trim() || !pilotType) return
    if (nr.trim()) setLastPilotZettelNr(nr.trim())
    const pilotUrl =
      pilotType === 'oek2'
        ? OEK2_URL
        : pilotType === 'vk2'
          ? VK2_URL
          : buildFamiliePilotWillkommenUrl(FAMILIE_URL, appName.trim(), nr.trim() || '1')
    const params = new URLSearchParams()
    params.set('name', name.trim())
    params.set('appName', appName.trim())
    params.set('type', pilotType)
    params.set('pilotUrl', pilotUrl)
    if (nr.trim()) params.set('nr', nr.trim())
    navigate(`/zettel-pilot?${params.toString()}`)
  }

  const canGenerate = name.trim().length > 0 && appName.trim().length > 0 && pilotType !== ''

  return (
    <main style={{ padding: '2rem', maxWidth: 480, margin: '0 auto', background: '#fff', minHeight: '100vh', color: '#1c1a18' }}>
      <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Neuer Test-Pilot – Formular</h1>
      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '0.75rem' }}>
        Name eingeben → <strong>Wie soll die App heißen?</strong> → ök2, VK2 oder K2 Familie wählen → QR wird automatisch vergeben → Laufzettel generieren und mitgeben.
      </p>
      <p style={{ fontSize: '0.85rem', color: '#5c5650', marginBottom: '0.75rem', lineHeight: 1.5, padding: '0.5rem 0.65rem', background: '#f8f6f2', borderRadius: 8, border: '1px solid #e8e4dc' }}>
        <strong>Hinweis:</strong> Das Testprogramm ist auf eine begrenzte Personenzahl begrenzt – die Plätze wählt das Team.
      </p>
      {pilotType === 'familie' ? (
        <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          <strong>K2 Familie</strong> ist eine <strong>eigene Produktlinie</strong> – <strong>nicht</strong> die Galerie-Lizenzen für ök2/VK2. Einladung per E-Mail und Zugang klärt das Team mit euch; das läuft{' '}
          <strong>nicht</strong> über <strong>Lizenzen → Testpilot einladen</strong> (das gilt nur für ök2 und VK2). Orientierung:{' '}
          <Link to={PROJECT_ROUTES['k2-familie'].handbuch} style={{ color: '#0d9488', fontWeight: 600 }}>
            Handbuch K2 Familie
          </Link>
          {' · '}
          <Link to={PROJECT_ROUTES['k2-familie'].lizenzErwerben} style={{ color: '#0d9488', fontWeight: 600 }}>
            Lizenz K2 Familie
          </Link>
          {' '}(nur diese Produktlinie).
        </p>
      ) : (
        <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          <strong>E-Mail-Einladung statt Zettel?</strong> Unter{' '}
          <Link to={`${PROJECT_ROUTES['k2-galerie'].licences}#testpilot-einladen`} style={{ color: '#0d9488', fontWeight: 600 }}>
            Lizenzen → Testpilot einladen
          </Link>{' '}
          kannst du für <strong>ök2 und VK2</strong> eine persönliche Einladung per Link (und optional automatische E-Mail) verschicken.
        </p>
      )}

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
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>
          Wie soll die App heißen? <span style={{ fontWeight: 400, color: '#666' }}>(für den Test)</span>
        </label>
        <input
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="z. B. Familie Huber, Verein Muster, Galerie Demo"
          style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '1rem', boxSizing: 'border-box' }}
        />
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.35rem', lineHeight: 1.45 }}>
          Dieser Name wird für den Zugang genutzt (z. B. Anzeige in der App, bei K2 Familie im Link). Er muss nicht mit dem Vornamen der Pilot:in übereinstimmen.
        </p>
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
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 0.75rem', border: `2px solid ${pilotType === 'familie' ? '#1a1a1a' : '#ddd'}`, borderRadius: 8, background: pilotType === 'familie' ? '#f5f5f5' : 'transparent' }}>
            <input type="radio" name="pilotType" checked={pilotType === 'familie'} onChange={() => setPilotType('familie')} />
            <span>K2 Familie (Familien-App)</span>
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
          Bitte Name der Pilot:in, gewünschten App-Namen und ök2, VK2 oder K2 Familie eintragen.
        </p>
      )}
    </main>
  )
}
