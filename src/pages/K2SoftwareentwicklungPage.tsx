/**
 * K2 Softwareentwicklung – Rubrik für alles, was mit Entwicklung, Sicherheit,
 * Deployment und technischen Checklisten zu tun hat (nicht Marketing).
 */

import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES, K2_GALERIE_APF_EINSTIEG } from '../config/navigation'

export default function K2SoftwareentwicklungPage() {
  useEffect(() => {
    try {
      const id = (window.location.hash || '').replace(/^#/, '')
      if (!id) return
      const el = document.getElementById(id)
      if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    } catch { /* ignore */ }
  }, [])

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
          <Link to={K2_GALERIE_APF_EINSTIEG} style={{ color: '#5ffbf1', textDecoration: 'none' }}>Projekt-Start</Link>
        </p>
      </div>

      {/* Smart Panel: Mappe „K2 Ready to go“ – dieselben Anker (#k2-ready-*) */}
      <section
        id="k2-ready-go"
        style={{
          marginBottom: '2rem',
          padding: '1rem 1.1rem',
          background: 'rgba(95,251,241,0.07)',
          borderRadius: '12px',
          border: '1px solid rgba(95,251,241,0.22)',
        }}
      >
        <h2 style={{ fontSize: '1.2rem', color: '#5ffbf1', margin: '0 0 0.5rem', borderBottom: '1px solid rgba(95,251,241,0.25)', paddingBottom: '0.35rem' }}>
          K2 Ready to go
        </h2>
        <p style={{ margin: '0 0 1rem', lineHeight: 1.55, fontSize: '0.92rem', color: 'rgba(255,245,240,0.9)' }}>
          Eine Übersicht der offenen Schritte und Docs – abgestimmt mit dem Smart Panel (Mappe <strong>K2 Ready to go</strong>). <strong>Technik, Sicherheit und Galerie-Eröffnung (24.–26.04.)</strong> gehören zur gleichen Mappe: Live-Stand und Event/Marketing greifen ineinander. Details in <code style={{ fontSize: '0.85em' }}>docs/</code> und in der APf (Notizen, mök2, Admin).
        </p>

        <h3 id="k2-ready-eroeffnung" style={{ fontSize: '1.05rem', color: '#fde68a', margin: '0 0 0.4rem' }}>
          Galerie-Eröffnung 24.–26.04. (mit Ready to go)
        </h3>
        <p style={{ margin: '0 0 0.5rem', lineHeight: 1.55, fontSize: '0.88rem' }}>
          Einladung, Presse/Flyer und Lounge – dieselbe Fahrspur wie „Go-Live“. Kurzfassung und Ablage:
        </p>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.35em', margin: '0 0 0.75rem', fontSize: '0.88rem' }}>
          <li>
            <Link to={PROJECT_ROUTES['k2-galerie'].notizenEinladungEroeffnung24} style={{ color: '#5ffbf1', textDecoration: 'underline' }}>Einladung Freunde – Mail &amp; WhatsApp</Link>
            {' · '}
            <Link to={PROJECT_ROUTES['k2-galerie'].marketingOek2} style={{ color: '#5ffbf1', textDecoration: 'underline' }}>Marketing ök2 (mök2)</Link>
            {' · '}
            <Link to="/admin?tab=eventplan&eventplan=öffentlichkeitsarbeit&openModal=1" style={{ color: '#5ffbf1', textDecoration: 'underline' }}>Admin – Öffentlichkeitsarbeit</Link>
          </li>
          <li><code>docs/MARKETING-EROEFFNUNG-K2-OEK2.md</code></li>
          <li><code>docs/K2-DOKUMENTE-GALERIEEROEFFNUNG.md</code></li>
          <li><code>docs/EROEFFNUNG-24-26-04-WAS-WIR-GEPLANT-HATTEN.md</code></li>
        </ul>

        <h3 id="k2-ready-stripe" style={{ fontSize: '1.05rem', color: '#fde68a', margin: '1rem 0 0.4rem' }}>
          Zahlung / Stripe (nur wenn Online-Lizenz von Tag 1)
        </h3>
        <p style={{ margin: '0 0 0.5rem', lineHeight: 1.55, fontSize: '0.88rem' }}>
          Minimal nötig laut <code>docs/START-NUR-NOCH-OFFEN.md</code> – ausführlich: <code>docs/STRIPE-LIZENZEN-GO-LIVE.md</code>
        </p>
        <ol style={{ lineHeight: 1.65, paddingLeft: '1.35em', margin: '0 0 0.75rem', fontSize: '0.88rem' }}>
          <li>Supabase: Migration 003 ausführen (<code>supabase/migrations/003_stripe_licences_payments_gutschriften.sql</code>)</li>
          <li>Vercel: Env (u. a. <code>SUPABASE_SERVICE_ROLE_KEY</code>, <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_WEBHOOK_SECRET</code>)</li>
          <li>Stripe: Webhook <code>checkout.session.completed</code>, Secret in Vercel</li>
        </ol>

        <h3 id="k2-ready-security" style={{ fontSize: '1.05rem', color: '#fde68a', margin: '1rem 0 0.4rem' }}>
          Sicherheit vor Go-Live
        </h3>
        <p style={{ margin: '0 0 0.5rem', lineHeight: 1.55, fontSize: '0.88rem' }}>
          Checklisten: <code>docs/SICHERHEIT-VOR-GO-LIVE.md</code> – API-Key „An Server senden“, Supabase-Admin, Migration 002 (RLS), Env-Variablen, npm audit, AGB/Datenschutz/Impressum, Backup.
        </p>
        <ul style={{ lineHeight: 1.6, paddingLeft: '1.35em', margin: 0, fontSize: '0.88rem' }}>
          <li><code>docs/VOR-VEROEFFENTLICHUNG.md</code> – Gesamt-Check vor Live</li>
          <li><code>docs/ADMIN-AUTH-SETUP.md</code> – Admin-Auth / Supabase</li>
          <li><code>docs/SUPABASE-RLS-SICHERHEIT.md</code> – RLS-Status</li>
        </ul>

        <h3 id="k2-ready-audit" style={{ fontSize: '1.05rem', color: '#fde68a', margin: '1rem 0 0.4rem' }}>
          Audit &amp; Programmsicherheit
        </h3>
        <p style={{ margin: '0 0 0.75rem', lineHeight: 1.55, fontSize: '0.88rem' }}>
          Verbindlicher Ablauf, Ampeltabelle, Protokoll: <code>docs/AUDIT-PROZESS-PROGRAMMSICHERHEIT-GO-LIVE.md</code>. Daten-Fokus-Tests im Projekt: <code>npm run test:daten</code>
        </p>

        <h3 id="k2-ready-georg" style={{ fontSize: '1.05rem', color: '#fde68a', margin: '1rem 0 0.4rem' }}>
          Noch von dir (manuell) – nach Erstrunde 22.03.26
        </h3>
        <p style={{ margin: '0 0 0.5rem', lineHeight: 1.55, fontSize: '0.88rem' }}>
          <strong>Bereits erledigt (KI / Repo):</strong> <code>npm run test</code> und <code>npm run test:daten</code> grün; Ampeltabelle und Protokoll in <code>docs/AUDIT-PROZESS-PROGRAMMSICHERHEIT-GO-LIVE.md</code> eingetragen. <code>npm audit</code> zeigt noch Meldungen – siehe Punkt 6 unten.
        </p>
        <ol style={{ lineHeight: 1.65, paddingLeft: '1.35em', margin: 0, fontSize: '0.88rem' }}>
          <li><strong>Production „An Server senden“:</strong> In Vercel <code>WRITE_GALLERY_API_KEY</code> und <code>VITE_WRITE_GALLERY_API_KEY</code> prüfen/setzen; einmal gegen Live testen (siehe <code>docs/SICHERHEIT-VOR-GO-LIVE.md</code>).</li>
          <li><strong>Supabase Migration 002:</strong> Im Dashboard bestätigen, dass <code>002_artworks_rls_authenticated_only.sql</code> auf eurem Projekt läuft.</li>
          <li><strong>Online-Lizenz / Stripe:</strong> Nur wenn gewünscht – die drei Schritte oben (Migration 003, Vercel-Env, Webhook); Details <code>docs/START-NUR-NOCH-OFFEN.md</code>.</li>
          <li><strong>Rechtstexte:</strong> AGB, Datenschutz, Impressum für den Live-Betrieb inhaltlich freigeben; Speicherorte in der Datenschutzerklärung prüfen.</li>
          <li><strong>Backup:</strong> Admin → Einstellungen → Vollbackup laden <em>und</em> die Wiederherstellung aus einer Datei einmal real durchspielen.</li>
          <li><strong>npm audit:</strong> Meldungen ansehen; wo möglich <code>npm audit fix</code> (ohne Breaking) oder bewusste Freigabe mit Notiz dokumentieren.</li>
        </ol>
      </section>

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
