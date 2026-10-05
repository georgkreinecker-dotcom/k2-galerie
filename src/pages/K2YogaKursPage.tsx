import { Link, useParams, useSearchParams } from 'react-router-dom'
import { K2_YOGA_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { YOGA_FONT_HREF, YOGA_MARKE } from '../config/yogaAkademieMarke'
import { getYogaKurs, yogaKursPath, YOGA_KURSE } from '../config/yogaKursStruktur'

type KursTab = 'uebersicht' | 'teilnehmer' | 'module' | 'auftritt' | 'abschluss'

const TABS: { id: KursTab; label: string }[] = [
  { id: 'uebersicht', label: 'Übersicht' },
  { id: 'teilnehmer', label: 'Teilnehmer' },
  { id: 'module', label: 'Module & Termine' },
  { id: 'auftritt', label: 'Gruppen-Auftritt' },
  { id: 'abschluss', label: 'Abschluss öffnen' },
]

function btnStyle(m: typeof YOGA_MARKE, fill?: boolean): React.CSSProperties {
  return {
    padding: '0.5rem 0.9rem',
    borderRadius: 10,
    border: fill ? 'none' : `1px solid ${m.gold}44`,
    background: fill ? m.goldSoft : m.bgCard,
    color: m.violett,
    fontWeight: 700,
    fontSize: '0.88rem',
    cursor: 'pointer',
    fontFamily: m.font,
  }
}

/**
 * Oberfläche für einen einzelnen Lehrgang/Kurs – Muster zum Vorzeigen.
 */
export default function K2YogaKursPage() {
  const m = YOGA_MARKE
  const { kursId = '' } = useParams<{ kursId: string }>()
  const [params, setParams] = useSearchParams()
  const kurs = getYogaKurs(kursId)
  const raw = String(params.get('tab') || 'uebersicht')
  const activeTab: KursTab =
    raw === 'teilnehmer' || raw === 'module' || raw === 'auftritt' || raw === 'abschluss' ? raw : 'uebersicht'

  const setTab = (tab: KursTab) => {
    const next = new URLSearchParams(params)
    if (tab === 'uebersicht') next.delete('tab')
    else next.set('tab', tab)
    setParams(next, { replace: true })
  }

  if (!kurs) {
    return (
      <div style={{ minHeight: '100vh', background: m.bg, fontFamily: m.font, padding: '2rem', color: m.text }}>
        <link rel="stylesheet" href={YOGA_FONT_HREF} />
        <p style={{ color: m.gold, fontWeight: 700 }}>Kurs nicht gefunden</p>
        <p style={{ color: m.muted }}>Dieser Muster-Lehrgang existiert nicht. Id: {kursId || '–'}</p>
        <Link to={PROJECT_ROUTES['k2-yoga'].akademie} style={{ color: m.violett, fontWeight: 700 }}>
          ← Zurück zur Fläche Akademie
        </Link>
        <div style={{ marginTop: '1.5rem' }}>
          <p style={{ fontWeight: 600, color: m.gold }}>Vorhandene Kurse:</p>
          <ul>
            {YOGA_KURSE.map((k) => (
              <li key={k.id}>
                <Link to={yogaKursPath(k.id)} style={{ color: m.violett }}>
                  {k.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const chip = (label: string, to: string, fill?: boolean) => (
    <Link
      to={to}
      style={{
        padding: fill ? '0.55rem 1.1rem' : '0.5rem 1rem',
        background: fill ? m.goldSoft : m.bgCard,
        color: fill ? m.violett : m.text,
        textDecoration: 'none',
        borderRadius: 10,
        fontSize: '0.88rem',
        fontWeight: fill ? 700 : 500,
        border: fill ? 'none' : `1px solid ${m.gold}40`,
        fontFamily: m.font,
      }}
    >
      {label}
    </Link>
  )

  return (
    <div style={{ minHeight: '100vh', background: m.bg, color: m.text, fontFamily: m.font }}>
      <link rel="stylesheet" href={YOGA_FONT_HREF} />
      <div
        style={{
          fontSize: '0.82rem',
          padding: '0.55rem 1rem',
          background: m.goldSoft,
          color: m.violett,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem 1rem',
          alignItems: 'center',
          borderBottom: `1px solid ${m.gold}55`,
        }}
      >
        <Link to={PROJECT_ROUTES['k2-yoga'].akademie} style={{ color: m.violett, fontWeight: 700, textDecoration: 'none' }}>
          ← Fläche Akademie
        </Link>
        <Link to={K2_YOGA_ROUTE} style={{ color: m.violett, fontWeight: 700, textDecoration: 'none' }}>
          Skizze
        </Link>
        <span>Kurs-Oberfläche · ein Lehrgang, alles an einem Ort</span>
      </div>

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: '#fff',
          borderBottom: `2px solid ${m.goldSoft}`,
          padding: '0.75rem clamp(1rem, 3vw, 1.5rem)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem 1rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={m.logo} alt="" width={64} height={42} style={{ objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 700, color: m.gold, fontSize: '1.1rem', lineHeight: 1.2 }}>{kurs.title}</div>
              <div style={{ fontSize: '0.78rem', color: m.violett, fontWeight: 600 }}>
                {kurs.untertitel} · {kurs.status}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {chip('🏫 Alle Lehrgänge', PROJECT_ROUTES['k2-yoga'].akademie)}
            {chip('👋 Beispiel-Auftritt', PROJECT_ROUTES['k2-yoga'].willkommen, true)}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.85rem' }}>
          {TABS.map((t) => {
            const on = activeTab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 999,
                  border: on ? 'none' : `1px solid ${m.gold}44`,
                  background: on ? m.goldSoft : m.bgCard,
                  color: m.violett,
                  fontWeight: on ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontFamily: m.font,
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', maxWidth: 900, margin: '0 auto' }}>
        {activeTab === 'uebersicht' && (
          <>
            <h2 style={{ color: m.gold, margin: '0 0 0.35rem' }}>Kurs auf einen Blick</h2>
            <p style={{ color: m.muted, marginTop: 0 }}>{kurs.beschreibung}</p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.65rem',
                margin: '1rem 0 1.25rem',
              }}
            >
              {[
                ['Leitung', kurs.leitung],
                ['Ort', kurs.ort],
                ['Zeitraum', kurs.zeitraum],
                ['Umfang', kurs.stunden],
                ['Personen', String(kurs.personen)],
                ['Auftritte offen', String(kurs.offen)],
              ].map(([k, v]) => (
                <div key={k} style={{ background: m.bgCard, border: `1px solid ${m.gold}33`, borderRadius: 12, padding: '0.75rem 0.9rem' }}>
                  <div style={{ fontSize: '0.72rem', color: m.muted, fontWeight: 600 }}>{k}</div>
                  <div style={{ fontWeight: 700, color: m.violett, marginTop: '0.15rem' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button type="button" onClick={() => setTab('teilnehmer')} style={btnStyle(m, true)}>
                Teilnehmer ansehen
              </button>
              <button type="button" onClick={() => setTab('module')} style={btnStyle(m)}>
                Module & Termine
              </button>
              <button type="button" onClick={() => setTab('abschluss')} style={btnStyle(m)}>
                Abschluss öffnen
              </button>
            </div>
          </>
        )}

        {activeTab === 'teilnehmer' && (
          <section>
            <h2 style={{ color: m.gold, margin: '0 0 0.35rem' }}>Teilnehmerliste</h2>
            <p style={{ color: m.muted }}>Dieselbe Liste wie im Büro – hier nur dieser Kurs. Ampel: offen / Einladung / im Lehrgang.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: m.bgCard, borderRadius: 12, overflow: 'hidden' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: m.muted, fontSize: '0.8rem' }}>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Name</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Status</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {kurs.teilnehmer.map((t) => (
                  <tr key={t.id} style={{ borderTop: `1px solid ${m.gold}28` }}>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: m.violett }}>{t.name}</td>
                    <td style={{ padding: '0.55rem 0.75rem', color: t.offen ? m.goldDark : m.muted }}>{t.status}</td>
                    <td style={{ padding: '0.55rem 0.75rem' }}>
                      {t.offen ? (
                        <Link to={PROJECT_ROUTES['k2-yoga'].willkommen} style={{ color: m.violett, fontWeight: 700, fontSize: '0.85rem' }}>
                          Auftritt ansehen →
                        </Link>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: m.muted }}>noch nicht geöffnet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'module' && (
          <section>
            <h2 style={{ color: m.gold, margin: '0 0 0.35rem' }}>Module & Termine</h2>
            <p style={{ color: m.muted }}>Was schon war, was kommt – ein Blick für Leitung und Büro.</p>
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              {kurs.module.map((mod) => (
                <div
                  key={mod.id}
                  style={{
                    background: m.bgCard,
                    border: `1px solid ${m.gold}33`,
                    borderRadius: 12,
                    padding: '0.8rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: m.violett }}>{mod.titel}</div>
                    <div style={{ fontSize: '0.82rem', color: m.muted }}>
                      {mod.datum} · {mod.ort}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: mod.done ? m.goldDark : m.muted }}>
                    {mod.done ? '✅ erledigt' : '○ geplant'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'auftritt' && (
          <section>
            <h2 style={{ color: m.gold, margin: '0 0 0.35rem' }}>Gruppen-Auftritt</h2>
            <p style={{ color: m.muted }}>
              Während des Lehrgangs: ein gemeinsames Willkommen mit QR für die Klasse. Nach dem Diplom: jede Person öffnet die eigene Fläche.
            </p>
            <div style={{ background: m.bgCard, border: `1px solid ${m.gold}33`, borderRadius: 12, padding: '1rem', marginTop: '0.75rem' }}>
              <p style={{ margin: '0 0 0.4rem', fontWeight: 700, color: m.violett }}>{kurs.title} · Klasse</p>
              <p style={{ margin: '0 0 0.75rem', color: m.muted, fontSize: '0.9rem' }}>
                Muster: so sähe der gemeinsame Auftritt aus – gleiche Form wie bei Absolvent:innen, Name der Gruppe.
              </p>
              <Link to={PROJECT_ROUTES['k2-yoga'].willkommen} style={{ color: m.violett, fontWeight: 700 }}>
                Beispiel-Auftritt öffnen →
              </Link>
            </div>
          </section>
        )}

        {activeTab === 'abschluss' && (
          <section>
            <h2 style={{ color: m.gold, margin: '0 0 0.35rem' }}>Abschluss – eigene Flächen öffnen</h2>
            <p style={{ color: m.muted }}>Checkliste Büro: Liste → öffnen → QR mitgeben. Nur wer öffnet, bekommt ein Haus.</p>
            <ol style={{ lineHeight: 1.7, paddingLeft: '1.2rem' }}>
              <li>Teilnehmerliste prüfen (Namen, Fotos).</li>
              <li>Für jede Person „Auftritt öffnen“ – Name und Bild aus der Liste.</li>
              <li>QR oder Link mit Diplom / Abschlussmappe mitgeben.</li>
              <li>Danach pflegt die Absolventin Stunden selbst.</li>
            </ol>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setTab('teilnehmer')} style={btnStyle(m, true)}>
                Zur Teilnehmerliste
              </button>
              <Link
                to={PROJECT_ROUTES['k2-yoga'].admin}
                style={{ ...btnStyle(m), textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                Fläche Absolvent:in ansehen
              </Link>
            </div>
            <p style={{ fontSize: '0.85rem', color: m.muted, marginTop: '1rem' }}>
              Muster-Ansicht – Speichern und echte Öffnung folgen im Pilot.
            </p>
          </section>
        )}

        <footer style={{ marginTop: '2.5rem', fontSize: '0.75rem', color: m.muted, lineHeight: 1.5 }}>
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </footer>
      </div>
    </div>
  )
}
