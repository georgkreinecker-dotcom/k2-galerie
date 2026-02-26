/**
 * Automatisierte Vergütung – Struktur für das Empfehlungs-Programm.
 * Liegt neben dem Empfehlungstool; beschreibt Ablauf, Datenbasis und technische Umsetzung.
 */

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

const t = {
  bg: 'var(--k2-bg-1, #1a0f0a)',
  card: 'rgba(255,255,255,0.06)',
  border: 'rgba(95,251,241,0.35)',
  accent: '#5ffbf1',
  text: 'var(--k2-text, #fff5f0)',
  muted: 'rgba(255,255,255,0.65)',
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      style={{
        padding: '1.25rem 1.5rem',
        background: t.card,
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        marginBottom: '1.25rem',
      }}
    >
      <h2 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem', color: t.accent }}>{title}</h2>
      {children}
    </section>
  )
}

export default function VerguetungPage() {
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
        <Link to={PROJECT_ROUTES['k2-galerie'].home} style={{ color: t.muted, textDecoration: 'none', fontSize: '0.95rem' }}>
          ← Projekt-Start
        </Link>
      </div>

      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.85rem)', margin: '0 0 0.5rem', color: t.accent }}>
        Automatisierte Vergütung
      </h1>
      <p style={{ margin: '0 0 1.5rem', color: t.muted, fontSize: '1rem' }}>
        Einstufiges System: Wer wirbt, erhält 10 % Gutschrift; der Geworbene erhält 10 % Rabatt. Keine weiteren Ebenen. Die Empfehler-ID steckt im Link – der Geworbene kann beim Lizenzabschluss entscheiden: Empfehlung annehmen (dann Zuordnung zum Werber) oder ohne Empfehlung lizensieren.
      </p>

      <Section title="1. Einstufig: 10 % Rabatt & 10 % Gutschrift">
        <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.7, color: t.text }}>
          <li><strong>Nur eine Stufe:</strong> Der Werber erhält <strong>10 % Gutschrift</strong>, die geworbene Person <strong>10 % Rabatt</strong>. Kein Multi-Level, keine „Empfehler von Empfehler“-Vergütung.</li>
          <li><strong>Automatisiert:</strong> Jede Lizenz-Zahlung löst die Berechnung aus; Abrechnungsläufe (z. B. monatlich) erzeugen Gutschriften oder Auszahlungslisten.</li>
        </ul>
      </Section>

      <Section title="2. ID im Link – Geworbener entscheidet beim Lizenzabschluss">
        <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.7, color: t.text }}>
          <li><strong>Link enthält die Empfehler-ID:</strong> Der Werber schickt einen Link (z. B. Willkommensseite mit <code>?empfehler=K2-E-XXXXXX</code>). Der Geworbene muss <strong>nichts eintragen</strong>.</li>
          <li><strong>Entscheidung beim Lizenzabschluss:</strong> Der Geworbene kann <strong>die Empfehlung annehmen</strong> (dann wird er dem Werber zugeordnet, 10 % Rabatt für ihn, 10 % Gutschrift an den Werber) oder <strong>ohne Empfehlung lizensieren</strong> – also auch ganz ohne Werber.</li>
          <li><strong>Datenbasis:</strong> Pro Lizenz optional eine Empfehler-ID (nur wenn der Geworbene die Empfehlung angenommen hat). Pro Zahlung: Betrag, Datum, Lizenz, ggf. 10 % Gutschrift an den Werber.</li>
        </ul>
      </Section>

      <Section title="3. Ablauf (automatisiert)">
        <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8, color: t.text }}>
          <li><strong>Ereignis:</strong> Lizenzgebühr wird fällig / gezahlt (monatlich oder jährlich).</li>
          <li><strong>Zuordnung:</strong> Für die Zahlung ist die Empfehler-ID gespeichert (weil der Nutzer über den Empfehlungslink kam und sich lizensiert hat).</li>
          <li><strong>Berechnung:</strong> 10 % der Gebühr als Gutschrift an den Werber (nur diese eine Stufe).</li>
          <li><strong>Gutschrift/Auszahlung:</strong> Beträge pro Werber sammeln → Gutschrift auf nächste Rechnung, Auszahlungsliste (Export) oder Gutschein für Verlängerung.</li>
        </ol>
      </Section>

      <Section title="4. Technik & Einbindung">
        <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.7, color: t.text }}>
          <li><strong>Speicher:</strong> Pro Lizenz eine Empfehler-ID. Bei Erfassung der Lizenz (oder beim Checkout) wird die ID aus dem Link/Kontext übernommen und gespeichert.</li>
          <li><strong>Zahlungen:</strong> Bei Erfassung (Stripe, manuell, Abo) pro Zahlung „Lizenz → Empfehler“ auslesen, 10 % berechnen, Gutschrift/Liste aktualisieren.</li>
          <li><strong>Konfiguration:</strong> Ein Satz (10 % Rabatt/Gutschrift), keine Stufe 2. Optional: Mindestbeträge, Auszahlungsgrenzen – in Abrechnungskonfiguration.</li>
        </ul>
      </Section>

      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: t.muted }}>
        <Link to={PROJECT_ROUTES['k2-galerie'].empfehlungstool} style={{ color: t.accent, textDecoration: 'none' }}>
          → Empfehlungstool (ID & Empfehlungstext)
        </Link>
        {' · '}
        Doku: <code style={{ fontSize: '0.85em' }}>docs/ABRECHNUNGSSTRUKTUR-EMPFEHLUNGSPROGRAMM.md</code>
      </p>
    </div>
  )
}
