/**
 * Testuser-Anmeldung – auslegbares Formular (online oder ein A4-Blatt drucken).
 * Absenden per E-Mail an kgm (mailto) + Textdatei-Download.
 */

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_LIZENZ_ANFRAGE_EMAIL, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'

function buildPayload(params: {
  name: string
  appName: string
  email: string
  phone: string
  oek2: boolean
  vk2: boolean
  familie: boolean
  anmerkung: string
}) {
  const lines = [
    'Testuser-Anmeldung (kgm solution)',
    '',
    `Name: ${params.name}`,
    `Wunsch-Name für die App (Test): ${params.appName}`,
    `E-Mail: ${params.email}`,
    `Telefon: ${params.phone || '–'}`,
    'Interesse an Produktlinie:',
    `  ök2 (Demo): ${params.oek2 ? 'ja' : 'nein'}`,
    `  VK2 (Verein): ${params.vk2 ? 'ja' : 'nein'}`,
    `  K2 Familie: ${params.familie ? 'ja' : 'nein'}`,
    '',
    params.anmerkung.trim() ? `Anmerkung:\n${params.anmerkung.trim()}` : '',
  ]
  return lines.filter(Boolean).join('\n')
}

export default function TestuserAnmeldungPage() {
  const [name, setName] = useState('')
  const [appName, setAppName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [oek2, setOek2] = useState(false)
  const [vk2, setVk2] = useState(false)
  const [familie, setFamilie] = useState(false)
  const [anmerkung, setAnmerkung] = useState('')
  const [einverstanden, setEinverstanden] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const canSubmit =
    name.trim().length > 0 &&
    appName.trim().length > 0 &&
    email.trim().includes('@') &&
    (oek2 || vk2 || familie) &&
    einverstanden

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const payload = buildPayload({
      name: name.trim(),
      appName: appName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      oek2,
      vk2,
      familie,
      anmerkung,
    })
    const subject = encodeURIComponent('Testuser-Anmeldung')
    const body = encodeURIComponent(payload)
    const mailto = `mailto:${encodeURIComponent(PRODUCT_LIZENZ_ANFRAGE_EMAIL)}?subject=${subject}&body=${body}`
    try {
      const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `testuser-anmeldung-${new Date().toISOString().slice(0, 10)}.txt`
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      /* ignore */
    }
    if (mailto.length < 2200) {
      window.location.href = mailto
    }
    setSubmitted(true)
  }

  return (
    <main className="tu-a4-sheet" style={{ padding: '2rem', maxWidth: 520, margin: '0 auto', background: '#fff', minHeight: '100vh', color: '#1c1a18' }}>
      <style>{`
        @page {
          size: A4;
          margin: 10mm 12mm 10mm 12mm;
        }
        @media print {
          .tu-no-print { display: none !important; }
          html, body {
            background: #fff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .tu-a4-sheet {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            min-height: 0 !important;
            box-shadow: none !important;
          }
          .tu-a4-sheet h1 {
            font-size: 13pt !important;
            margin: 0 0 0.25rem !important;
          }
          .tu-a4-sheet p,
          .tu-a4-sheet li,
          .tu-a4-sheet label {
            font-size: 9pt !important;
            line-height: 1.35 !important;
          }
          .tu-a4-sheet .tu-intro {
            margin-bottom: 0.35rem !important;
          }
          .tu-a4-sheet .tu-block {
            padding: 0.35rem 0.5rem !important;
            margin-bottom: 0.35rem !important;
            border-radius: 4px !important;
          }
          .tu-a4-sheet .tu-block p {
            margin: 0 !important;
          }
          .tu-a4-sheet .tu-block ul {
            margin: 0.15rem 0 0 !important;
            padding-left: 1rem !important;
          }
          .tu-a4-sheet .tu-block li {
            margin-bottom: 0.15rem !important;
          }
          .tu-a4-sheet form {
            gap: 0.35rem !important;
          }
          .tu-a4-sheet fieldset {
            padding: 0.35rem 0.5rem !important;
            margin: 0 !important;
          }
          .tu-a4-sheet fieldset legend {
            font-size: 9pt !important;
          }
          .tu-a4-sheet input[type="text"],
          .tu-a4-sheet input[type="email"],
          .tu-a4-sheet input[type="tel"],
          .tu-a4-sheet textarea {
            padding: 0.2rem 0.35rem !important;
            font-size: 9pt !important;
            border: 1px solid #999 !important;
          }
          .tu-a4-sheet textarea {
            min-height: 2.2rem !important;
            max-height: 3.5rem !important;
          }
          .tu-a4-sheet .tu-footer-print {
            margin-top: 0.4rem !important;
            padding-top: 0.25rem !important;
            font-size: 6.5pt !important;
            line-height: 1.25 !important;
            border-top: 1px solid #ccc !important;
          }
          .tu-a4-sheet .tu-break-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="tu-no-print" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <Link to="/mission-control" style={{ color: '#333', fontSize: '0.9rem' }}>
          ← Mission Control
        </Link>
        <Link to="/zettel-testuser-produktlinien" style={{ color: '#0d9488', fontSize: '0.9rem', fontWeight: 600 }}>
          Infos (Testuser) lesen
        </Link>
      </div>

      <h1 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Testuser-Anmeldung</h1>
      <p className="tu-intro" style={{ fontSize: '0.92rem', color: '#444', lineHeight: 1.55, marginBottom: '0.75rem' }}>
        Interessieren Sie sich für einen <strong>Produkttest</strong>? Tragen Sie sich hier ein – online oder dieses Blatt ausdrucken und ausfüllen.
        Mehr Hintergrund: <Link to="/zettel-testuser-produktlinien">Infos (Testuser)</Link> (ök2, VK2, K2 Familie).
      </p>

      <div
        className="tu-block tu-break-avoid"
        style={{
          marginBottom: '0.75rem',
          padding: '0.65rem 0.85rem',
          borderRadius: 8,
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)',
          border: '1px solid #99f6e4',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.92rem', color: '#134e4a', lineHeight: 1.5, fontWeight: 600 }}>
          Vielen Dank für Ihr Interesse – und dafür, dass Sie sich bereit erklären, am Programm mitzuwirken.
        </p>
      </div>

      <div
        className="tu-block tu-break-avoid"
        style={{
          marginBottom: '1rem',
          padding: '0.65rem 0.85rem',
          border: '1px solid #e8e4dc',
          borderRadius: 8,
          background: '#faf8f5',
        }}
      >
        <p style={{ margin: '0 0 0.35rem', fontSize: '0.88rem', fontWeight: 600, color: '#1c1a18' }}>Kurzinfo</p>
        <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.86rem', color: '#444', lineHeight: 1.5 }}>
          <li>
            <strong>Gutschein:</strong> Bei erfüllten Bedingungen – nach unserer Freigabe – je{' '}
            <strong>abgeschlossener Produktlinie ein Gutschein 250&nbsp;€</strong> für ein Kunstobjekt der K2 Galerie (kein Barauszahlungsanspruch; Einlösung nach Absprache).
          </li>
          <li style={{ marginTop: '0.3rem' }}>
            <strong>Zugang:</strong> Den persönlichen Testzugang erhalten Sie von uns per <strong>E-Mail</strong>. Nach Ihrer Anmeldung melden wir uns <strong>bald</strong> mit den nächsten Schritten. Teilnahme begrenzt, nicht für alle zugesagt.
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div className="tu-break-avoid">
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>
        <div className="tu-break-avoid">
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>
            Wie soll die App heißen? <span style={{ fontWeight: 400 }}>*</span>
          </label>
          <input
            required
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder="z. B. Familienname, Verein, Kurzname der Galerie"
            style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '1rem', boxSizing: 'border-box' }}
          />
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#555', lineHeight: 1.45 }}>
            So können wir Ihren persönlichen Testzugang auf diesen Namen ausrichten – Sie müssen später nichts mehr „umbenennen“.
          </p>
        </div>
        <div className="tu-break-avoid">
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>E-Mail *</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>
        <div className="tu-break-avoid">
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>Telefon (optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '1rem', boxSizing: 'border-box' }}
          />
        </div>
        <fieldset className="tu-break-avoid" style={{ border: '1px solid #ddd', borderRadius: 8, padding: '0.6rem', margin: 0 }}>
          <legend style={{ fontWeight: 600, fontSize: '0.88rem', padding: '0 0.25rem' }}>Interesse an Produktlinie * (mindestens eine)</legend>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input type="checkbox" checked={oek2} onChange={(e) => setOek2(e.target.checked)} />
            ök2 – Künstler-Demo / Galerie
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input type="checkbox" checked={vk2} onChange={(e) => setVk2(e.target.checked)} />
            VK2 – Vereinsplattform
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input type="checkbox" checked={familie} onChange={(e) => setFamilie(e.target.checked)} />
            K2 Familie – Familien-App
          </label>
        </fieldset>
        <div className="tu-break-avoid">
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>Anmerkung (optional)</label>
          <textarea
            value={anmerkung}
            onChange={(e) => setAnmerkung(e.target.value)}
            rows={2}
            style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.95rem', boxSizing: 'border-box', fontFamily: 'inherit', minHeight: '2.5rem' }}
          />
        </div>
        <label className="tu-break-avoid" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', cursor: 'pointer', fontSize: '0.86rem', lineHeight: 1.45 }}>
          <input type="checkbox" checked={einverstanden} onChange={(e) => setEinverstanden(e.target.checked)} style={{ marginTop: '0.15rem' }} />
          Ich willige ein, dass meine Angaben zur Bearbeitung meiner Anfrage bei kgm solution verwendet werden. *
        </label>

        <div className="tu-no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              padding: '0.6rem 1.1rem',
              background: canSubmit ? '#0d9488' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontSize: '0.95rem',
            }}
          >
            Absenden (E-Mail öffnen + Textdatei)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              padding: '0.6rem 1.1rem',
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
          >
            🖨️ Auf A4 drucken / PDF
          </button>
        </div>
      </form>

      {!canSubmit && (
        <p className="tu-no-print" style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.65rem' }}>
          Bitte Name, gewünschten App-Namen, E-Mail, mindestens eine Produktlinie und die Einwilligung ausfüllen.
        </p>
      )}

      {submitted && (
        <p className="tu-no-print" style={{ fontSize: '0.92rem', color: '#0f766e', marginTop: '0.85rem', fontWeight: 600 }}>
          Danke – wenn Ihr E-Mail-Programm geöffnet hat, senden Sie die Nachricht ab. Zusätzlich wurde eine Textdatei mit den Daten heruntergeladen (falls der Browser das erlaubt).
        </p>
      )}

      <footer className="tu-footer-print" style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #eee', fontSize: '0.72rem', color: '#666', lineHeight: 1.4 }}>
        <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
        <div>{PRODUCT_URHEBER_ANWENDUNG}</div>
      </footer>
    </main>
  )
}
