/**
 * Infos (Testuser) – drei Produktlinien (ök2, VK2, K2 Familie): kompakt, eine A4-Seite drucken, ohne QR.
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SimpleK2TeamHandbuchMd } from '../components/SimpleK2TeamHandbuchMd'
import { PROJECT_ROUTES } from '../config/navigation'

const TESTUSER_ZETTEL_MD = '/k2team-handbuch/28-TESTUSER-ZETTEL-PRODUKTLINIEN.md'
const TESTUSER_ANMELDUNG_PATH = PROJECT_ROUTES['k2-galerie'].testuserAnmeldung

export default function ZettelTestuserProduktlinienPage() {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(TESTUSER_ZETTEL_MD)
      .then((r) => (r.ok ? r.text() : ''))
      .then((text) => {
        setContent(text)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem', background: '#fff', minHeight: '100vh', color: '#1c1a18' }}>
        Infos werden geladen …
      </div>
    )
  }

  return (
    <>
      <style>{`
        @page {
          size: A4;
          margin: 10mm 12mm 12mm 12mm;
        }
        @media print {
          .zettel-no-print { display: none !important; }
          body, html { background: #fff !important; margin: 0 !important; }
          .zettel-page {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
            font-size: 9pt !important;
            line-height: 1.35 !important;
          }
          .zettel-page h1 { font-size: 12pt !important; margin: 0 0 0.35rem !important; }
          .zettel-page h2 { font-size: 10pt !important; margin: 0.45rem 0 0.2rem !important; }
          .zettel-page p, .zettel-page li { font-size: 9pt !important; margin-bottom: 0.25rem !important; }
          .zettel-page ul, .zettel-page ol { margin: 0.2rem 0 0.35rem 1rem !important; }
          .zettel-page hr { margin: 0.35rem 0 !important; }
          .zettel-banner-print { padding: 0.35rem 0.5rem !important; margin-bottom: 0.35rem !important; font-size: 9pt !important; }
          .zettel-footer { display: flex !important; justify-content: space-between; align-items: center; position: fixed; bottom: 0; left: 0; right: 0; padding: 2mm 12mm; font-size: 8pt; color: #555; background: #fff; }
          .zettel-footer-page::before { content: "Seite "; }
          .zettel-footer-page::after { content: counter(page); }
        }
        .zettel-page {
          max-width: 210mm;
          margin: 0 auto;
          padding: 10mm 12mm 16mm;
          background: #fff;
          color: #1c1a18;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 10pt;
          line-height: 1.4;
        }
        .zettel-page h1 { font-size: 1.25rem; margin: 0 0 0.5rem; font-weight: 700; }
        .zettel-page h2 { font-size: 1rem; margin: 0.6rem 0 0.3rem; font-weight: 600; }
        .zettel-page h3 { font-size: 0.95rem; margin: 0.45rem 0 0.2rem; font-weight: 600; color: #333; }
        .zettel-page p { margin: 0 0 0.35rem; }
        .zettel-page ul, .zettel-page ol { margin: 0.25rem 0 0.5rem 1.2rem; padding: 0; }
        .zettel-page li { margin-bottom: 0.15rem; }
        .zettel-page hr { border: none; border-top: 1px solid #ccc; margin: 0.5rem 0; }
        .zettel-page table { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 0.4rem 0; }
        .zettel-page th, .zettel-page td { border: 1px solid #ccc; padding: 0.3rem 0.5rem; text-align: left; vertical-align: top; }
        .zettel-page th { background: #f5f5f5; font-weight: 600; }
        .zettel-page code { font-size: 0.9em; word-break: break-all; }
        .zettel-page strong { font-weight: 600; }
        .zettel-page em { font-style: italic; }
        .zettel-footer { display: none; }
      `}</style>

      <div
        className="zettel-no-print"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '0.5rem 1rem',
          background: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
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
          🖨️ Eine A4-Seite drucken / PDF
        </button>
        <Link to="/mission-control" style={{ color: '#333', fontSize: '0.9rem' }}>
          ← Mission Control
        </Link>
        <Link to="/k2team-handbuch?doc=28-TESTUSER-ZETTEL-PRODUKTLINIEN.md" style={{ color: '#333', fontSize: '0.9rem' }}>
          Im Handbuch öffnen
        </Link>
      </div>

      <div className="zettel-page" style={{ marginTop: '3rem' }}>
        <div
          className="zettel-banner-print"
          style={{
            marginBottom: '0.75rem',
            padding: '0.6rem 0.75rem',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: 8,
            fontSize: '10pt',
            lineHeight: 1.45,
          }}
        >
          <strong>Interesse eintragen?</strong>{' '}
          <Link to={TESTUSER_ANMELDUNG_PATH} style={{ color: '#047857', fontWeight: 600 }}>
            Testuser-Mappe öffnen
          </Link>
          {' – '}Formular ausfüllen oder ausdrucken; Angaben per E-Mail an kgm.
        </div>
        <SimpleK2TeamHandbuchMd md={content} />
      </div>
      <footer className="zettel-footer" aria-hidden="true">
        <span className="zettel-footer-page" />
        <span>K2 Galerie kgm solution</span>
      </footer>
    </>
  )
}
