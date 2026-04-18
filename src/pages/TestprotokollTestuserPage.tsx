/**
 * Testprotokolle (Testuser) – Ansicht zum Lesen und Drucken.
 * Ohne ?linie = Hub; ?linie=oek2|vk2|familie = jeweilige Vorlage.
 */

import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SimpleK2TeamHandbuchMd } from '../components/SimpleK2TeamHandbuchMd'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'

const LINIE_TO_FILE: Record<string, string> = {
  oek2: '29-TESTPROTOKOLL-OEK2.md',
  vk2: '30-TESTPROTOKOLL-VK2.md',
  familie: '31-TESTPROTOKOLL-K2-FAMILIE.md',
}

const LINIE_LABEL: Record<string, string> = {
  oek2: 'ök2 – Demo-Galerie',
  vk2: 'VK2 – Vereinsplattform',
  familie: 'K2 Familie',
}

const HUB_PATH = '/testprotokoll-testuser'

export default function TestprotokollTestuserPage() {
  const [searchParams] = useSearchParams()
  const linie = (searchParams.get('linie') || '').toLowerCase().trim()
  const file = linie && LINIE_TO_FILE[linie] ? LINIE_TO_FILE[linie] : null

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(!!file)

  useEffect(() => {
    if (!file) {
      setContent('')
      setLoading(false)
      return
    }
    setLoading(true)
    fetch(`/k2team-handbuch/${file}`)
      .then((r) => (r.ok ? r.text() : ''))
      .then(setContent)
      .finally(() => setLoading(false))
  }, [file])

  if (!file) {
    return (
      <main style={{ padding: '2rem', maxWidth: 720, margin: '0 auto', background: '#fff', minHeight: '100vh', color: '#1c1a18' }}>
        <style>{`
          @media print { .tp-no-print { display: none !important; } }
        `}</style>
        <div className="tp-no-print" style={{ marginBottom: '1.25rem' }}>
          <Link to="/mission-control" style={{ color: '#333', marginRight: '1rem' }}>
            ← Mission Control
          </Link>
          <Link to={PROJECT_ROUTES['k2-galerie'].texteSchreibtisch} style={{ color: '#0d9488', fontWeight: 600 }}>
            Texte-Schreibtisch
          </Link>
        </div>
        <h1 style={{ fontSize: '1.45rem', marginBottom: '0.5rem' }}>Testprotokolle (Testuser)</h1>
        <p style={{ fontSize: '0.95rem', color: '#444', lineHeight: 1.55, marginBottom: '1.25rem' }}>
          Vollständige Vorlagen pro Produktlinie – lesen, im Browser drucken oder als PDF speichern. Einreichung an kgm wie in den Infos (Testuser) vereinbart.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {(['oek2', 'vk2', 'familie'] as const).map((key) => (
            <li key={key}>
              <Link
                to={`${HUB_PATH}?linie=${key}`}
                style={{
                  display: 'block',
                  padding: '0.85rem 1rem',
                  borderRadius: 10,
                  border: '1px solid #d6d3cd',
                  background: '#faf8f5',
                  color: '#0f766e',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                {LINIE_LABEL[key]} → Ansicht & Drucken
              </Link>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: '1.25rem', fontSize: '0.88rem', color: '#666' }}>
          Hintergrund:{' '}
          <Link to="/zettel-testuser-produktlinien" style={{ color: '#0d9488' }}>
            Infos (Testuser)
          </Link>
          {' · '}
          <Link to={PROJECT_ROUTES['k2-galerie'].testuserAnmeldung} style={{ color: '#0d9488' }}>
            Testuser-Anmeldung
          </Link>
        </p>
        <footer style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee', fontSize: '0.72rem', color: '#666' }}>
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </footer>
      </main>
    )
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', background: '#fff', minHeight: '100vh', color: '#1c1a18' }}>
        Testprotokoll wird geladen …
      </div>
    )
  }

  return (
    <>
      <style>{`
        @page { size: A4; margin: 12mm 14mm; }
        @media print {
          .tp-no-print { display: none !important; }
          html, body { background: #fff !important; }
          .tp-sheet {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 10pt !important;
            line-height: 1.38 !important;
          }
          .tp-sheet h1 { font-size: 14pt !important; }
          .tp-sheet h2 { font-size: 11pt !important; }
          .tp-sheet h3 { font-size: 10pt !important; }
          .tp-sheet table { font-size: 9pt !important; }
        }
        .tp-sheet {
          max-width: 210mm;
          margin: 0 auto;
          padding: 10mm 14mm 18mm;
          background: #fff;
          color: #1c1a18;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 11pt;
          line-height: 1.45;
        }
        .tp-sheet h1 { font-size: 1.35rem; margin: 0 0 0.5rem; font-weight: 700; }
        .tp-sheet h2 { font-size: 1.05rem; margin: 0.75rem 0 0.35rem; font-weight: 600; }
        .tp-sheet h3 { font-size: 0.98rem; margin: 0.5rem 0 0.25rem; font-weight: 600; color: #2d2a26; }
        .tp-sheet p { margin: 0 0 0.4rem; }
        .tp-sheet ul, .tp-sheet ol { margin: 0.3rem 0 0.5rem 1.2rem; padding: 0; }
        .tp-sheet li { margin-bottom: 0.2rem; }
        .tp-sheet hr { border: none; border-top: 1px solid #ccc; margin: 0.6rem 0; }
        .tp-sheet table { width: 100%; border-collapse: collapse; font-size: 10pt; margin: 0.45rem 0; }
        .tp-sheet th, .tp-sheet td { border: 1px solid #bbb; padding: 0.35rem 0.5rem; text-align: left; vertical-align: top; }
        .tp-sheet th { background: #f3f2ef; font-weight: 600; }
        .tp-sheet code { font-size: 0.88em; }
        .tp-sheet strong { font-weight: 600; }
      `}</style>

      <div
        className="tp-no-print"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: '0.55rem 1rem',
          background: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: '0.5rem 1rem',
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🖨️ Drucken / PDF
        </button>
        <Link to={HUB_PATH} style={{ color: '#0d9488', fontWeight: 600 }}>
          Alle Testprotokolle
        </Link>
        <Link to="/mission-control" style={{ color: '#333' }}>
          Mission Control
        </Link>
        <Link to={PROJECT_ROUTES['k2-galerie'].texteSchreibtisch} style={{ color: '#333' }}>
          Texte-Schreibtisch
        </Link>
      </div>

      <main className="tp-sheet" style={{ marginTop: '0.5rem' }}>
        <SimpleK2TeamHandbuchMd md={content} />
        <footer className="tp-no-print" style={{ marginTop: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid #eee', fontSize: '0.72rem', color: '#666' }}>
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </footer>
      </main>
    </>
  )
}
