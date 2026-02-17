/**
 * Empfehlungstool – für lizenzierte Klient:innen.
 * Zeigt die persönliche Empfehler-ID und ein vorbereitetes Empfehlungsschreiben
 * zum Kopieren, per E-Mail oder WhatsApp an Freund:innen zu senden.
 */

import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { BASE_APP_URL, WILLKOMMEN_ROUTE } from '../config/navigation'
import { getOrCreateEmpfehlerId } from '../utils/empfehlerId'
import { PRODUCT_BRAND_NAME, PRODUCT_WERBESLOGAN } from '../config/tenantConfig'

const EMPFEHLER_NAME_KEY = 'k2-empfehlungstool-name'

function getStoredName(): string {
  try {
    const v = localStorage.getItem(EMPFEHLER_NAME_KEY)
    return (v && v.trim()) || ''
  } catch (_) {}
  return ''
}

export default function EmpfehlungstoolPage() {
  const empfehlerId = getOrCreateEmpfehlerId()
  const [empfehlerName, setEmpfehlerName] = useState(getStoredName)
  const [copied, setCopied] = useState(false)

  const empfehlungslink = useMemo(
    () => `${BASE_APP_URL}${WILLKOMMEN_ROUTE}?empfehler=${encodeURIComponent(empfehlerId)}`,
    [empfehlerId]
  )

  const emailBetreff = 'Empfehlung: K2 Galerie – deine Galerie in 5 Minuten'

  const emailText = useMemo(() => {
    const name = empfehlerName.trim() || 'Dein Name'
    return `Hallo,

ich nutze die ${PRODUCT_BRAND_NAME} für meine Galerie und bin begeistert. Du kannst dir die Demo-Galerie als Muster ansehen und selbst ausprobieren:

${empfehlungslink}

Der Link enthält bereits meine Empfehlung. Beim Lizenzabschluss kannst du wählen: Empfehlung annehmen (dann werde ich als Werber zugeordnet und erhalte 50 % der Lizenzgebühren) oder ohne Empfehlung lizensieren – beides ist möglich.

Viele Grüße,
${name}`
  }, [empfehlerId, empfehlungslink, empfehlerName])

  const saveName = (name: string) => {
    setEmpfehlerName(name)
    try {
      localStorage.setItem(EMPFEHLER_NAME_KEY, name.trim())
    } catch (_) {}
  }

  const copyText = () => {
    try {
      navigator.clipboard.writeText(emailText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (_) {}
  }

  const mailto = `mailto:?subject=${encodeURIComponent(emailBetreff)}&body=${encodeURIComponent(emailText)}`
  const whatsappText = `${emailBetreff}\n\n${emailText.replace(/\n/g, '%0A')}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`

  const t = {
    bg: 'var(--k2-bg-1, #1a0f0a)',
    card: 'rgba(255,255,255,0.06)',
    border: 'rgba(95,251,241,0.35)',
    accent: '#5ffbf1',
    text: 'var(--k2-text, #fff5f0)',
    muted: 'rgba(255,255,255,0.65)',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: t.bg,
        color: t.text,
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to={PROJECT_ROUTES['k2-galerie'].home}
          style={{ color: t.muted, textDecoration: 'none', fontSize: '0.95rem' }}
        >
          ← Projekt-Start
        </Link>
      </div>

      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.85rem)', margin: '0 0 0.5rem', color: t.accent }}>
        Empfehlungstool
      </h1>
      <p style={{ margin: '0 0 1.5rem', color: t.muted, fontSize: '1rem' }}>
        Lade Freund:innen ein, die K2 Galerie als Muster anzuschauen – und weise sie auf kostenlose Nutzung oder Zuverdienst durch Weiterempfehlung hin.
      </p>

      {/* Empfehler-ID */}
      <section
        style={{
          padding: '1.25rem 1.5rem',
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem', color: t.accent }}>Deine Empfehler-ID</h2>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: t.muted }}>
          Sie steckt im Link, den du teilst. Beim Lizenzabschluss können sie entscheiden: Empfehlung annehmen (dann Zuordnung zu dir, du erhältst 50 %) oder ohne Empfehlung lizensieren.
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 10,
            fontFamily: 'monospace',
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            color: t.accent,
          }}
        >
          {empfehlerId}
          <button
            type="button"
            onClick={() => {
              try {
                navigator.clipboard.writeText(empfehlerId)
              } catch (_) {}
            }}
            style={{
              padding: '0.35rem 0.6rem',
              background: t.accent,
              color: t.bg,
              border: 'none',
              borderRadius: 6,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Kopieren
          </button>
        </div>
      </section>

      {/* Name (optional) */}
      <section style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.95rem', color: t.muted, marginBottom: '0.35rem' }}>
          Dein Name (steht am Ende des Empfehlungstextes)
        </label>
        <input
          type="text"
          value={empfehlerName}
          onChange={(e) => saveName(e.target.value)}
          placeholder="z. B. Martina"
          style={{
            width: '100%',
            maxWidth: 320,
            padding: '0.6rem 0.9rem',
            background: 'rgba(255,255,255,0.08)',
            border: `1px solid ${t.border}`,
            borderRadius: 8,
            color: t.text,
            fontSize: '1rem',
          }}
        />
      </section>

      {/* Vorlage */}
      <section
        style={{
          padding: '1.25rem 1.5rem',
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          marginBottom: '1.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem', color: t.accent }}>Vorbereitetes Empfehlungsschreiben</h2>
        <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: t.muted }}>
          Du kannst den Text kopieren, per E-Mail versenden oder über WhatsApp teilen. Der Link enthält deine Empfehlung – beim Lizenzabschluss können sie annehmen (dann 50 % an dich) oder ohne Empfehlung lizensieren.
        </p>
        <pre
          style={{
            margin: 0,
            padding: '1rem',
            background: 'rgba(0,0,0,0.25)',
            borderRadius: 8,
            fontSize: '0.85rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: 'rgba(255,255,255,0.9)',
            border: `1px solid ${t.border}`,
          }}
        >
          {emailText}
        </pre>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={copyText}
            style={{
              padding: '0.65rem 1.25rem',
              background: copied ? 'rgba(80,200,120,0.4)' : t.accent,
              color: t.bg,
              border: 'none',
              borderRadius: 8,
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {copied ? '✓ Kopiert' : 'Text kopieren'}
          </button>
          <a
            href={mailto}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.65rem 1.25rem',
              background: 'rgba(255,255,255,0.12)',
              color: t.accent,
              border: `1px solid ${t.border}`,
              borderRadius: 8,
              fontSize: '0.95rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Per E-Mail senden
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.65rem 1.25rem',
              background: 'rgba(37,211,102,0.25)',
              color: '#25d366',
              border: '1px solid rgba(37,211,102,0.5)',
              borderRadius: 8,
              fontSize: '0.95rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            WhatsApp teilen
          </a>
        </div>
      </section>

      <p style={{ fontSize: '0.85rem', color: t.muted }}>
        {PRODUCT_WERBESLOGAN}
      </p>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        <Link to={PROJECT_ROUTES['k2-galerie'].verguetung} style={{ color: t.accent, textDecoration: 'none' }}>
          → Automatisierte Vergütung (Struktur & Ablauf)
        </Link>
      </p>
    </div>
  )
}
