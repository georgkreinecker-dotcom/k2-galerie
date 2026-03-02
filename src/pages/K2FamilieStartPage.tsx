/**
 * K2 Familie – Projekt-Start. Vision, Roadmap, Raumschiff.
 * Route: /projects/k2-familie
 */

import { Link } from 'react-router-dom'
import '../App.css'
import { PROJECT_ROUTES, PLATFORM_ROUTES } from '../config/navigation'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { K2_FAMILIE_DEFAULT_TENANT } from '../utils/familieStorage'

export default function K2FamilieStartPage() {
  const { currentTenantId, tenantList, setCurrentTenantId, addTenant } = useFamilieTenant()

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page">
        <header>
          <div>
            <div className="familie-toolbar" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Link to={PLATFORM_ROUTES.projects} className="meta">← Projekte</Link>
              <span className="meta">Familie:</span>
              <select value={currentTenantId} onChange={(e) => setCurrentTenantId(e.target.value)}>
                {tenantList.map((id) => (
                  <option key={id} value={id}>{id === K2_FAMILIE_DEFAULT_TENANT ? 'Standard' : id}</option>
                ))}
              </select>
              <button type="button" className="btn-outline" onClick={() => addTenant()}>Neue Familie</button>
            </div>
            <h1>K2 Familie</h1>
            <div className="meta">Zusammenleben sichtbar machen – jede Form von Familie, wechselnde Partnerschaften, Freud, Leid und Alltag. Basis: K2-Struktur, tenantfähig.</div>
          </div>
        </header>

        <div className="card">
          <h2>Leitbild</h2>
          <p>Wir sind eine offene Gesellschaft – nicht Mittelalter. Jede Art des Zusammenlebens ist Familie und soll abgebildet werden können: wechselnde Partnerschaften, Schicksalsschläge und freudige Ereignisse, die wir gemeinsam erleben, und der ganz normale Alltag. All das bekommt hier seinen Platz. Keine Ausgrenzung – in keiner Form. Religion und Politik haben hier nichts zu suchen. Jeder respektiert den anderen so, wie er ist.</p>
        </div>

        <div className="card">
          <h2>Vision</h2>
          <p>Jede Form des Zusammenlebens = ein Mandant. Jede Person = eine Seite (Foto, Text, Momente). Beziehungen = der Baum. Modern, app-tauglich, für jede Konstellation.</p>
        </div>

        <div className="card">
          <h2>Erste Schritte</h2>
          <ol style={{ margin: '0 0 0 1.2rem', padding: 0, lineHeight: 1.7 }}>
            <li><strong>Familie wählen</strong> (Dropdown oben): „Standard“ oder eine andere Familie. „Neue Familie“ legt einen leeren Stammbaum an.</li>
            <li><strong>Stammbaum</strong> → „Person hinzufügen“ → Person anlegen, Klick auf sie öffnet die Personen-Seite.</li>
            <li><strong>Personen-Seite:</strong> Name, Kurztext, Foto; Beziehungen (Eltern, Kinder, Partner*innen, Geschwister, Wahlfamilie); <strong>Momente</strong> (Hochzeit, Geburt, Reise, …).</li>
            <li><strong>Events</strong> (Geburtstage, Treffen): Datum, Titel, Teilnehmer aus der Familie auswählen.</li>
            <li><strong>Kalender</strong> zeigt alle Events und Momente mit Datum, nach Monat sortiert.</li>
          </ol>
          <p className="meta" style={{ marginTop: '0.75rem' }}>Ausführlich: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>k2team-handbuch/17-K2-FAMILIE-ERSTE-SCHRITTE.md</code></p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid rgba(95,251,241,0.6)' }}>
          <h2>Nächster Meilenstein: Rechte & Zweige</h2>
          <p>Für den weiteren Ausbau: Wer darf in welchem Teil des Stammbaums bearbeiten? Konzept und Entscheidung (Zweig-Definition A/B/C, Rechte-Option 1/2/3) stehen in <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>docs/K2-FAMILIE-RECHTE-ZWEIGE.md</code> – Phase 4.0. Sobald die Entscheidung getroffen ist, leiten wir Datenfelder und UI ab.</p>
        </div>

        <p className="meta" style={{ marginBottom: '1rem' }}>Roadmap & Phasen: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>docs/K2-FAMILIE-ROADMAP.md</code> (im Repo).</p>

        <div className="grid" style={{ marginBottom: '1.5rem' }}>
          <Link to={PROJECT_ROUTES['k2-familie'].stammbaum} className="btn">→ Stammbaum öffnen</Link>
          <Link to={PROJECT_ROUTES['k2-familie'].events} className="btn">→ Events (Geburtstage, Treffen)</Link>
          <Link to={PROJECT_ROUTES['k2-familie'].kalender} className="btn">→ Kalender & Übersicht</Link>
          <Link to={PROJECT_ROUTES['k2-galerie'].plan} className="btn" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(95,251,241,0.4)' }}>K2 Galerie Plan</Link>
        </div>

        <p className="meta" style={{ marginTop: '1.5rem', lineHeight: 1.5 }}>Die Grundbotschaft prägt Form der App, Sprache und jede zukünftige KI-Kommunikation. Moralisches Fundament: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>docs/K2-FAMILIE-GRUNDBOTSCHAFT.md</code></p>
        <p className="meta" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Projekt gestartet 01.03.26 – Let&apos;s go.</p>
      </div>
    </div>
  )
}
