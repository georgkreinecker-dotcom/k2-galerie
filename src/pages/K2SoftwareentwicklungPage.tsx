/**
 * K2 Softwareentwicklung – Rubrik für alles, was mit Entwicklung, Sicherheit,
 * Deployment und technischen Checklisten zu tun hat (nicht Marketing).
 */

import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

export default function K2SoftwareentwicklungPage() {
  return (
    <article
      style={{
        maxWidth: '800px',
        margin: 0,
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        background: 'var(--k2-bg-1, #1a0f0a)',
        color: 'var(--k2-text, #fff5f0)',
        minHeight: 'auto',
      }}
    >
      <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(95,251,241,0.25)' }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0, color: '#5ffbf1' }}>K2 Softwareentwicklung</h1>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }}>
          Rubrik für Entwicklung, Sicherheit, Deployment und technische Checklisten – getrennt vom Marketing (mök2).
        </p>
        <p style={{ margin: '0.35rem 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
          <Link to={PROJECT_ROUTES['k2-galerie'].marketingOek2} style={{ color: '#5ffbf1', textDecoration: 'none' }}>← Marketing ök2 (mök2)</Link>
          {' · '}
          <Link to={PROJECT_ROUTES['k2-galerie'].home} style={{ color: '#5ffbf1', textDecoration: 'none' }}>Projekt-Start</Link>
        </p>
      </div>

      {/* Sicherheit & Vor Veröffentlichung */}
      <section id="k2-se-sicherheit-vor-veroeffentlichung" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#5ffbf1', marginBottom: '0.75rem', borderBottom: '1px solid rgba(95,251,241,0.3)', paddingBottom: '0.35rem' }}>
          Sicherheit &amp; Vor Veröffentlichung
        </h2>
        <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
          Alle Infos zu <strong>Sicherheit, Produkt-Label, Admin-Auth und Vor Veröffentlichung</strong> sind im Projekt dokumentiert. Einstieg: <strong>HAUS-INDEX.md</strong> (Root) und <strong>docs/00-INDEX.md</strong>.
        </p>
        <ul style={{ lineHeight: 1.7, paddingLeft: '1.5em', margin: '0 0 1rem' }}>
          <li><strong>Vor Veröffentlichung:</strong> <code>docs/VOR-VEROEFFENTLICHUNG.md</code> – Checkliste vor Go-Live (Auth, Migration 002, npm audit, AGB/DSGVO, Deployment). Nicht vergessen.</li>
          <li><strong>Admin-Auth einrichten:</strong> <code>docs/ADMIN-AUTH-SETUP.md</code> – Nutzer in Supabase anlegen, RLS-Migration anwenden.</li>
          <li><strong>Produkt-Label / Regress:</strong> <code>docs/PRODUKT-LABEL-SICHERHEIT-ROADMAP.md</code> – Ziele, Maßnahmen, Nachweis für Zahlungen/Vergütung.</li>
          <li><strong>Stabilität &amp; Einbruch:</strong> <code>docs/SICHERHEIT-STABILITAET-CHECKLISTE.md</code> – 5 Punkte Einsturz, 5 Punkte Einbruch, Skala.</li>
          <li><strong>Supabase RLS:</strong> <code>docs/SUPABASE-RLS-SICHERHEIT.md</code> – Status, später schärfen.</li>
        </ul>
      </section>
    </article>
  )
}
