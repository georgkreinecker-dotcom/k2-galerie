/**
 * Route /testuser-anmeldung:
 * - **Ohne Query:** nur öffentliches Anmeldeformular (Entdecken, Handbuch, Bewerber:innen).
 * - **?mappe=1:** volle Testuser-Mappe (Dokumente, Formular, Katalog) – APf / Team.
 * Anmeldung: auslegbares Formular (online oder A4) – mailto + Textdatei.
 */

import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_LIZENZ_ANFRAGE_EMAIL, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import {
  addTestuserKatalogEintrag,
  ensureTestuserKatalogSeedOnce,
  getTestuserKatalogStatusLabel,
  loadTestuserKatalog,
  removeTestuserKatalogEintrag,
  type TestuserKatalogEintrag,
  type TestuserKatalogStatus,
  updateTestuserKatalogEintrag,
} from '../utils/testuserKatalogStorage'
import { isPilotKatalogSyncConfigured, pullAndMergePilotKatalog } from '../utils/pilotKatalogApi'
import { clearOek2ZettelPilotVornameSessionMarker } from '../utils/zettelPilotOeffentlichPrefill'
import { getSendTestuserAnmeldungApiUrl } from '../utils/testuserAnmeldungClient'

const R = PROJECT_ROUTES['k2-galerie']

function pilotLinieKurz(l?: TestuserKatalogEintrag['pilotLinie']): string {
  if (l === 'oek2') return 'ök2'
  if (l === 'vk2') return 'VK2'
  if (l === 'familie') return 'K2 Familie'
  return '–'
}

function ZugangsblattLink({ url }: { url?: string }) {
  const u = url?.trim()
  if (!u) return <span style={{ color: '#888' }}>–</span>
  if (u.startsWith('/') && !u.startsWith('//')) {
    return (
      <Link to={u} style={{ color: '#0d9488', fontWeight: 600, fontSize: '0.78rem' }}>
        Zugangsblatt
      </Link>
    )
  }
  return (
    <a href={u} target="_blank" rel="noopener noreferrer" style={{ color: '#0d9488', fontWeight: 600, fontSize: '0.78rem' }}>
      Zugangsblatt
    </a>
  )
}

const STATUS_OPTIONS: TestuserKatalogStatus[] = [
  'bewerbung',
  'zugang_gesendet',
  'test_aktiv',
  'protokoll_eingereicht',
  'freigabe',
  'sonstiges',
]

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

function TestuserAnmeldungForm() {
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
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [serverEmailSent, setServerEmailSent] = useState(false)

  const canSubmit =
    name.trim().length > 0 &&
    appName.trim().length > 0 &&
    email.trim().includes('@') &&
    (oek2 || vk2 || familie) &&
    einverstanden

  const missingHints = (() => {
    const m: string[] = []
    if (!name.trim()) m.push('Name')
    if (!appName.trim()) m.push('Wunsch-Name für die App')
    if (!email.trim()) m.push('E-Mail')
    else if (!email.trim().includes('@')) m.push('gültige E-Mail')
    if (!oek2 && !vk2 && !familie) m.push('mindestens eine Produktlinie')
    if (!einverstanden) m.push('Einwilligung')
    return m
  })()

  const openMailtoAndDownloadTxt = (payload: string) => {
    /** Adresse nicht per encodeURIComponent (würde @ zu %40 – manche Clients öffnen dann nicht). */
    const subject = encodeURIComponent('Testuser-Anmeldung')
    const bodyEncoded = encodeURIComponent(payload)
    const mailtoFull = `mailto:${PRODUCT_LIZENZ_ANFRAGE_EMAIL}?subject=${subject}&body=${bodyEncoded}`
    /** Viele Browser/OS begrenzen mailto-Länge; sonst öffnet sich kein Programm – Kurztext + volle Daten in .txt */
    const MAILTO_MAX = 2000
    const shortBodyForMail = [
      'Testuser-Anmeldung (kgm solution)',
      '',
      `Name: ${name.trim()}`,
      `App (Test): ${appName.trim()}`,
      `E-Mail: ${email.trim()}`,
      `Linien: ök2 ${oek2 ? 'ja' : 'nein'}, VK2 ${vk2 ? 'ja' : 'nein'}, K2 Familie ${familie ? 'ja' : 'nein'}`,
      '',
      'Vollständiger Text: siehe heruntergeladene Datei testuser-anmeldung-….txt (gleicher Klick).',
    ].join('\n')
    const bodyShortEncoded = encodeURIComponent(shortBodyForMail)
    const mailtoShort = `mailto:${PRODUCT_LIZENZ_ANFRAGE_EMAIL}?subject=${subject}&body=${bodyShortEncoded}`
    const mailto = mailtoFull.length <= MAILTO_MAX ? mailtoFull : mailtoShort

    try {
      const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `testuser-anmeldung-${new Date().toISOString().slice(0, 10)}.txt`
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      /* ignore */
    }
    /** Kurz warten, damit der Download nicht mit mailto kollidiert (Safari/Firefox). */
    window.setTimeout(() => {
      window.location.href = mailto
    }, 120)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
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
    setSubmitError(null)
    setServerEmailSent(false)
    setSubmitting(true)
    try {
      const r = await fetch(getSendTestuserAnmeldungApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          appName: appName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          oek2,
          vk2,
          familie,
          anmerkung,
          einverstanden: true,
        }),
      })
      const j = (await r.json().catch(() => ({}))) as {
        sent?: boolean
        message?: string
        error?: string
      }
      if (r.ok && j.sent === true) {
        setServerEmailSent(true)
        setSubmitted(true)
        return
      }
      if (r.status === 400 && typeof j.error === 'string') {
        setSubmitError(j.error)
        return
      }
      openMailtoAndDownloadTxt(payload)
      setSubmitted(true)
      if (typeof j.message === 'string') setSubmitError(j.message)
      else if (!r.ok) setSubmitError('Server hat die Anmeldung nicht übernommen – bitte E-Mail oder Textdatei nutzen.')
    } catch {
      openMailtoAndDownloadTxt(payload)
      setSubmitted(true)
      setSubmitError('Keine Verbindung zum Server – bitte E-Mail-Programm oder die heruntergeladene Textdatei nutzen.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <p className="tu-intro" style={{ fontSize: '0.92rem', color: '#444', lineHeight: 1.55, marginBottom: '0.75rem' }}>
        Interessieren Sie sich für einen <strong>Produkttest</strong>? Tragen Sie sich hier ein – online oder dieses Blatt ausdrucken und ausfüllen. Ist der E-Mail-Versand auf dem Server eingerichtet (wie bei der Testpilot-Einladung: Resend auf Vercel), geht Ihre Anmeldung <strong>direkt</strong> an kgm solution; sonst öffnet sich wie bisher Ihr E-Mail-Programm mit einer Vorlage und eine Textdatei wird heruntergeladen. Kurzüberblick zu den Linien:{' '}
        <Link to="/zettel-testuser-produktlinien" style={{ color: '#0d9488', fontWeight: 600 }}>
          Infos (Testuser)
        </Link>
        .
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
            <strong>Gratislizenz:</strong> Schwerpunkt des Programms – bei erfüllten Bedingungen und freigegebenem Testprotokoll <strong>bis zu fünf Jahre kostenfrei</strong> für die gewählte Produktlinie (siehe{' '}
            <Link to="/zettel-testuser-produktlinien" style={{ color: '#0d9488', fontWeight: 600 }}>
              Infos (Testuser)
            </Link>
            ).
          </li>
          <li style={{ marginTop: '0.3rem' }}>
            <strong>Gutschein:</strong> Ergänzend – nach unserer Freigabe – je{' '}
            <strong>abgeschlossener Produktlinie ein Gutschein 100&nbsp;€</strong> für ein Kunstobjekt der K2 Galerie (kein Barauszahlungsanspruch; Einlösung nach Absprache).
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
            disabled={!canSubmit || submitting}
            style={{
              padding: '0.6rem 1.1rem',
              background: canSubmit && !submitting ? '#0d9488' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
              fontSize: '0.95rem',
            }}
          >
            {submitting ? 'Wird gesendet…' : 'Absenden'}
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
          <strong style={{ color: '#444' }}>Noch ausfüllen:</strong> {missingHints.join(' · ')}
        </p>
      )}

      {submitError && submitted && (
        <p className="tu-no-print" style={{ fontSize: '0.86rem', color: '#92400e', marginTop: '0.65rem', lineHeight: 1.45 }}>
          {submitError}
        </p>
      )}

      {submitted && serverEmailSent && (
        <p className="tu-no-print" style={{ fontSize: '0.92rem', color: '#0f766e', marginTop: '0.85rem', fontWeight: 600 }}>
          Danke – Ihre Anmeldung wurde per E-Mail an kgm solution übermittelt. Wir melden uns bei Ihnen. (Posteingang von {PRODUCT_LIZENZ_ANFRAGE_EMAIL} prüfen; ggf. Spam-Ordner.)
        </p>
      )}

      {submitted && !serverEmailSent && (
        <p className="tu-no-print" style={{ fontSize: '0.92rem', color: '#0f766e', marginTop: '0.85rem', fontWeight: 600 }}>
          Danke – Ihr E-Mail-Programm sollte sich geöffnet haben; senden Sie die Nachricht dort ab. Zusätzlich wurde eine Textdatei mit den vollständigen Daten heruntergeladen (falls der Browser Downloads erlaubt). Kein Fenster? Bitte prüfen, ob ein E-Mail-Programm eingerichtet ist, oder die .txt-Datei manuell an {PRODUCT_LIZENZ_ANFRAGE_EMAIL} senden.
        </p>
      )}
    </>
  )
}

function KatalogSection() {
  const [rows, setRows] = useState<TestuserKatalogEintrag[]>(() => loadTestuserKatalog())
  const [syncStatus, setSyncStatus] = useState<'loading' | 'ok' | 'offline' | 'error'>(() =>
    isPilotKatalogSyncConfigured() ? 'loading' : 'offline'
  )
  const [name, setName] = useState('')
  const [appName, setAppName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notiz, setNotiz] = useState('')
  const [status, setStatus] = useState<TestuserKatalogStatus>('bewerbung')

  const refresh = () => {
    ensureTestuserKatalogSeedOnce()
    setRows(loadTestuserKatalog())
  }

  useEffect(() => {
    let cancelled = false
    ensureTestuserKatalogSeedOnce()
    setRows(loadTestuserKatalog())
    if (!isPilotKatalogSyncConfigured()) {
      setSyncStatus('offline')
      return () => {
        cancelled = true
      }
    }
    setSyncStatus('loading')
    void pullAndMergePilotKatalog().then((r) => {
      if (cancelled) return
      if (r === 'ok') setSyncStatus('ok')
      else if (r === 'offline') setSyncStatus('offline')
      else setSyncStatus('error')
      ensureTestuserKatalogSeedOnce()
      setRows(loadTestuserKatalog())
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleServerSync = () => {
    if (!isPilotKatalogSyncConfigured()) return
    setSyncStatus('loading')
    ensureTestuserKatalogSeedOnce()
    void pullAndMergePilotKatalog().then((r) => {
      if (r === 'ok') setSyncStatus('ok')
      else if (r === 'offline') setSyncStatus('offline')
      else setSyncStatus('error')
      refresh()
    })
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !appName.trim() || !email.trim()) return
    addTestuserKatalogEintrag({
      name: name.trim(),
      appName: appName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      notiz: notiz.trim(),
      status,
    })
    setName('')
    setAppName('')
    setEmail('')
    setPhone('')
    setNotiz('')
    setStatus('bewerbung')
    refresh()
  }

  const handleRemove = (id: string) => {
    if (!window.confirm('Diesen Katalog-Eintrag wirklich löschen?')) return
    const next = removeTestuserKatalogEintrag(id)
    if (next.length === 0) clearOek2ZettelPilotVornameSessionMarker()
    refresh()
  }

  return (
    <div className="tu-no-print">
      <div
        style={{
          marginBottom: '0.75rem',
          padding: '0.55rem 0.7rem',
          borderRadius: 8,
          border: '1px solid #e8e4dc',
          background: '#faf8f5',
          fontSize: '0.86rem',
          color: '#1c1a18',
          lineHeight: 1.5,
        }}
      >
        <p style={{ margin: '0 0 0.45rem' }}>
          <strong>Pilot-Zettel:</strong> Neuer Zettel erscheint hier mit Link zum <strong>Zugangsblatt</strong>.
        </p>
        <p style={{ margin: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          <span>
            <strong>Liste:</strong>{' '}
            {syncStatus === 'loading' && '⏳ Abgleich mit Server …'}
            {syncStatus === 'ok' && '✅ Zentrale Liste (Vercel) – alle Geräte gleicher Stand.'}
            {syncStatus === 'offline' && '○ Nur dieser Browser – setze VITE_PILOT_KATALOG_API_KEY + PILOT_KATALOG_API_KEY auf Vercel für zentrale Liste.'}
            {syncStatus === 'error' && '⚠️ Server-Abgleich fehlgeschlagen – prüfe API-Key in Vercel oder Netzwerk.'}
          </span>
          {isPilotKatalogSyncConfigured() && (
            <button
              type="button"
              className="tu-no-print"
              onClick={handleServerSync}
              disabled={syncStatus === 'loading'}
              style={{
                padding: '0.3rem 0.65rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                borderRadius: 6,
                border: '1px solid #b54a1e',
                background: syncStatus === 'loading' ? '#ddd' : '#fffefb',
                color: '#b54a1e',
                cursor: syncStatus === 'loading' ? 'not-allowed' : 'pointer',
              }}
            >
              Mit Server abgleichen
            </button>
          )}
        </p>
      </div>
      <form
        onSubmit={handleAdd}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '0.5rem',
          marginBottom: '1rem',
          padding: '0.75rem',
          border: '1px solid #e8e4dc',
          borderRadius: 8,
          background: '#faf8f5',
        }}
      >
        <div style={{ gridColumn: '1 / -1', fontWeight: 700, fontSize: '0.88rem', color: '#1c1a18' }}>Neuen Eintrag</div>
        <input
          placeholder="Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '0.35rem 0.5rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.88rem' }}
        />
        <input
          placeholder="App-Name *"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          style={{ padding: '0.35rem 0.5rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.88rem' }}
        />
        <input
          placeholder="E-Mail *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '0.35rem 0.5rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.88rem' }}
        />
        <input
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: '0.35rem 0.5rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.88rem' }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TestuserKatalogStatus)}
          style={{ padding: '0.35rem 0.5rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.88rem', color: '#1c1a18' }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {getTestuserKatalogStatusLabel(s)}
            </option>
          ))}
        </select>
        <input
          placeholder="Kurznotiz"
          value={notiz}
          onChange={(e) => setNotiz(e.target.value)}
          style={{ gridColumn: '1 / -1', padding: '0.35rem 0.5rem', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.88rem' }}
        />
        <button
          type="submit"
          style={{
            gridColumn: '1 / -1',
            justifySelf: 'start',
            padding: '0.45rem 0.9rem',
            background: '#b54a1e',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.88rem',
          }}
        >
          Eintrag speichern
        </button>
      </form>

      {rows.length === 0 ? (
        <p style={{ fontSize: '0.86rem', color: '#666' }}>Noch keine Einträge.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f0f0ec' }}>
                <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem', border: '1px solid #ddd' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem', border: '1px solid #ddd' }}>App</th>
                <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem', border: '1px solid #ddd' }}>Linie</th>
                <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem', border: '1px solid #ddd' }}>Zettel</th>
                <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem', border: '1px solid #ddd' }}>Zugangsblatt</th>
                <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem', border: '1px solid #ddd' }}>E-Mail</th>
                <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem', border: '1px solid #ddd' }}>Stand</th>
                <th style={{ textAlign: 'left', padding: '0.35rem 0.5rem', border: '1px solid #ddd' }}>Notiz</th>
                <th style={{ border: '1px solid #ddd', width: 72 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ padding: '0.3rem 0.5rem', border: '1px solid #eee', color: '#1c1a18' }}>{row.name}</td>
                  <td style={{ padding: '0.3rem 0.5rem', border: '1px solid #eee', color: '#1c1a18' }}>{row.appName}</td>
                  <td style={{ padding: '0.3rem 0.5rem', border: '1px solid #eee', color: '#1c1a18' }}>{pilotLinieKurz(row.pilotLinie)}</td>
                  <td style={{ padding: '0.3rem 0.5rem', border: '1px solid #eee', color: '#444' }}>{row.zettelNr || '–'}</td>
                  <td style={{ padding: '0.3rem 0.5rem', border: '1px solid #eee' }}>
                    <ZugangsblattLink url={row.zugangsblattUrl} />
                  </td>
                  <td style={{ padding: '0.3rem 0.5rem', border: '1px solid #eee', color: '#1c1a18', wordBreak: 'break-all' }}>{row.email}</td>
                  <td style={{ padding: '0.3rem 0.5rem', border: '1px solid #eee' }}>
                    <select
                      value={row.status}
                      onChange={(e) => {
                        updateTestuserKatalogEintrag(row.id, { status: e.target.value as TestuserKatalogStatus })
                        refresh()
                      }}
                      style={{ maxWidth: '100%', fontSize: '0.8rem', padding: '0.2rem', color: '#1c1a18' }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {getTestuserKatalogStatusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '0.3rem 0.5rem', border: '1px solid #eee', color: '#444' }}>{row.notiz || '–'}</td>
                  <td style={{ padding: '0.3rem 0.5rem', border: '1px solid #eee', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleRemove(row.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: '#991b1b',
                      }}
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function TestuserAnmeldungPage() {
  const [searchParams] = useSearchParams()
  const showFullMappe = searchParams.get('mappe') === '1'

  useEffect(() => {
    document.title = showFullMappe ? 'Testuser-Mappe – kgm solution' : 'Testuser-Anmeldung – kgm solution'
  }, [showFullMappe])

  const docLinks: { to: string; title: string; hint: string }[] = [
    { to: '/zettel-pilot-form', title: 'Neuer Test-Pilot', hint: 'Laufzettel, QR, Druck' },
    { to: '/zettel-testuser-produktlinien', title: 'Infos (Testuser)', hint: 'ök2 · VK2 · K2 Familie – A4' },
    { to: R.testprotokollTestuser, title: 'Testprotokolle', hint: 'Vorlagen ök2, VK2, K2 Familie' },
    {
      to: `/k2team-handbuch?doc=${encodeURIComponent('28-TESTUSER-ZETTEL-PRODUKTLINIEN.md')}`,
      title: 'K2Team-Handbuch · Infos (Kapitel 28)',
      hint: 'Lesen / Drucken',
    },
    {
      to: `/k2team-handbuch?doc=${encodeURIComponent('29-TESTPROTOKOLL-OEK2.md')}`,
      title: 'Testprotokoll ök2 (Vorlage)',
      hint: 'K2Team-Handbuch',
    },
    {
      to: `/k2team-handbuch?doc=${encodeURIComponent('30-TESTPROTOKOLL-VK2.md')}`,
      title: 'Testprotokoll VK2 (Vorlage)',
      hint: 'K2Team-Handbuch',
    },
    {
      to: `/k2team-handbuch?doc=${encodeURIComponent('31-TESTPROTOKOLL-K2-FAMILIE.md')}`,
      title: 'Testprotokoll K2 Familie (Vorlage)',
      hint: 'K2Team-Handbuch',
    },
    {
      to: `/benutzer-handbuch?doc=${encodeURIComponent('17-TESTUSER-ZUGANG.md')}`,
      title: 'Benutzerhandbuch · Testuser',
      hint: 'Zugang und Konditionen',
    },
    { to: R.texteSchreibtisch, title: 'Texte-Schreibtisch', hint: 'Zettel Pilot & Testuser' },
  ]

  return (
    <main
      className="tu-a4-sheet"
      style={{
        padding: '2rem',
        maxWidth: showFullMappe ? 920 : 640,
        margin: '0 auto',
        background: '#fff',
        minHeight: '100vh',
        color: '#1c1a18',
      }}
    >
      <style>{`
        @page {
          size: A4;
          margin: 10mm 12mm 10mm 12mm;
        }
        @media print {
          .tu-no-print { display: none !important; }
          .tu-map-docs { display: none !important; }
          .tu-map-katalog { display: none !important; }
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

      {showFullMappe ? (
        <>
          <div className="tu-no-print" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/mission-control" style={{ color: '#333', fontSize: '0.9rem' }}>
              ← Mission Control
            </Link>
          </div>

          <h1 style={{ fontSize: '1.45rem', marginBottom: '0.35rem', color: '#1c1a18' }}>Testuser-Mappe</h1>
          <p className="tu-no-print" style={{ fontSize: '0.92rem', color: '#555', lineHeight: 1.55, marginBottom: '1.25rem' }}>
            Hier liegen alle Wege zu <strong>Dokumenten</strong> rund um Testuser und Piloten, die <strong>Anmeldung</strong> für Interessenten und der interne <strong>Katalog</strong> – thematisch sortiert, ein Einstieg für die APf.
          </p>

          <section className="tu-map-docs tu-no-print" style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.6rem', color: '#b54a1e', fontWeight: 700 }}>Dokumente &amp; Wege</h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '0.5rem',
              }}
            >
              {docLinks.map((d) => (
                <Link
                  key={d.to + d.title}
                  to={d.to}
                  style={{
                    display: 'block',
                    padding: '0.55rem 0.65rem',
                    borderRadius: 8,
                    border: '1px solid #e8e4dc',
                    background: '#faf8f5',
                    textDecoration: 'none',
                    color: '#1c1a18',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    lineHeight: 1.35,
                  }}
                >
                  {d.title}
                  <span style={{ display: 'block', fontWeight: 400, fontSize: '0.78rem', color: '#5c5650', marginTop: '0.2rem' }}>{d.hint}</span>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <section id="anmeldung" style={{ marginBottom: showFullMappe ? '1.75rem' : '1.25rem' }}>
        {showFullMappe ? (
          <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.5rem', color: '#b54a1e', fontWeight: 700 }}>Anmeldung (öffentlich)</h2>
        ) : null}
        <TestuserAnmeldungForm />
      </section>

      {showFullMappe ? (
        <section id="katalog" className="tu-map-katalog" style={{ marginBottom: '1.5rem' }}>
          <h2 className="tu-no-print" style={{ fontSize: '1.05rem', margin: '0 0 0.5rem', color: '#b54a1e', fontWeight: 700 }}>
            Katalog Testuser / Piloten
          </h2>
          <KatalogSection />
        </section>
      ) : null}

      <footer className="tu-footer-print" style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #eee', fontSize: '0.72rem', color: '#666', lineHeight: 1.4 }}>
        <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
        <div>{PRODUCT_URHEBER_ANWENDUNG}</div>
      </footer>
    </main>
  )
}
