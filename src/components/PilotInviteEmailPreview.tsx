/**
 * Vorschau = gleicher Inhalt wie die HTML-Mail (api/pilotInviteEmailHtml buildPilotInviteEmailHtml, Resend + .eml).
 * Georg sieht dieselbe Ansicht wie der Empfänger – ohne Mail-Programm.
 */
import type { CSSProperties, ReactElement } from 'react'

export type PilotInviteEmailPreviewProps = {
  inviteUrl: string
  /** Vorname für „Hallo …“ */
  greetingName: string
  inviteContext: 'oeffentlich' | 'vk2'
}

export function PilotInviteEmailPreview({ inviteUrl, greetingName, inviteContext }: PilotInviteEmailPreviewProps): ReactElement {
  const vk2 = inviteContext === 'vk2'
  const contextLabel = vk2 ? 'VK2 Vereins-Demo' : 'öffentliche Demo (ök2)'
  const demoButton = vk2 ? 'Weiter zur VK2-Vorschau (Verein)' : 'Weiter zur öffentlichen Demo (ök2)'
  const nachDemo = vk2
    ? 'Du siehst die Vereins-Vorschau und kannst dort stöbern.'
    : 'Du landest direkt in den Einstellungen (Stammdaten). Von dort aus öffnest du die öffentliche Demo.'
  const hallo = String(greetingName || '').trim() || 'Testpilot:in'
  const ctaLabel = 'Jetzt Testpilot starten'

  const btnStyle: CSSProperties = {
    display: 'inline-block',
    padding: '14px 28px',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 17,
    fontWeight: 700,
    color: '#fff',
    textDecoration: 'none',
    borderRadius: 10,
    backgroundColor: '#0d9488',
    lineHeight: 1.25,
    textAlign: 'center',
    boxSizing: 'border-box',
  }

  const Cta = () => (
    <div style={{ margin: '14px 0 18px', textAlign: 'center' as const }}>
      <a href={inviteUrl} target="_blank" rel="noopener noreferrer" style={btnStyle}>
        <span style={{ fontSize: 20, lineHeight: 0, verticalAlign: '-2px', marginRight: 6 }}>➤</span>
        {ctaLabel}
      </a>
    </div>
  )

  return (
    <div
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: 15,
        lineHeight: 1.55,
        color: '#1a1a1a',
        maxWidth: 560,
        margin: '0 auto',
        padding: '1.25rem 1.35rem',
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e8e6e3',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}
    >
      <p style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#111' }}>Hallo {hallo}</p>
      <p style={{ margin: '0 0 16px', fontSize: 14, color: '#444' }}>Testpilot:in · {contextLabel}</p>
      <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Ein Klick – los geht’s:</p>
      <Cta />
      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#555' }}>
        Auf der nächsten Seite: <strong>„{demoButton}“</strong> antippen. {nachDemo}
      </p>
      <div style={{ borderTop: '1px solid #e8e6e3', margin: '0 0 16px' }} />
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#666', lineHeight: 1.5 }}>
        <strong>Ohne Lesen:</strong> Grün = dein Einstieg. Kein Passwort. Nur Muster-Daten zum Ausprobieren.
      </p>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: '#888', lineHeight: 1.45 }}>
        Nur Text-Ansicht in der Mail-App? Die lange Zeile in der Textversion komplett kopieren. Button geht nicht?{' '}
        <a href={inviteUrl} style={{ color: '#0d9488', fontWeight: 600 }}>
          Hier derselbe Link
        </a>
        .
      </p>
      <Cta />
      <p style={{ margin: '8px 0 0', fontSize: 11, color: '#999' }}>Personalisiert · Pro++ Testpilot · Link ohne Ablauf</p>
    </div>
  )
}
