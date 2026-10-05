import { Link, useSearchParams } from 'react-router-dom'
import { K2_YOGA_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import {
  YOGA_AKADEMIE_EINLADUNGEN,
  YOGA_AKADEMIE_HUB_LINKS,
  YOGA_AKADEMIE_HUB_RECHTS,
  YOGA_AKADEMIE_LEHRGAENGE,
  YOGA_AKADEMIE_STAMMDATEN,
  YOGA_AKADEMIE_TEILNEHMER,
} from '../config/yogaAkademieStruktur'
import { yogaKursPath } from '../config/yogaKursStruktur'
import {
  YOGA_FONT_HREF,
  YOGA_MARKE,
} from '../config/yogaAkademieMarke'
import type { YogaAdminTab, YogaHubKachel } from '../config/yogaAdminStruktur'

const TABS: YogaAdminTab[] = ['werke', 'design', 'einstellungen', 'statistik', 'eventplan', 'kassa', 'buchhaltung']

function isYogaTab(v: string): v is YogaAdminTab {
  return (TABS as string[]).includes(v)
}

/**
 * Arbeitsfläche Akademie – Muster zum Vorzeigen.
 * Farblich an yogaakademieaustria.com (Gold/Violett/Montserrat).
 */
export default function K2YogaAkademiePage() {
  const m = YOGA_MARKE
  const [params, setParams] = useSearchParams()
  const rawTab = String(params.get('tab') || 'werke')
  const activeTab: YogaAdminTab = isYogaTab(rawTab) ? rawTab : 'werke'
  const akzentGrad = `linear-gradient(135deg, ${m.gold} 0%, ${m.goldSoft} 100%)`
  const absolventAdmin = PROJECT_ROUTES['k2-yoga'].admin
  const akademieBase = PROJECT_ROUTES['k2-yoga'].akademie
  const willkommen = PROJECT_ROUTES['k2-yoga'].willkommen

  const setTab = (tab: YogaAdminTab) => {
    const next = new URLSearchParams(params)
    if (tab === 'werke') next.delete('tab')
    else next.set('tab', tab)
    setParams(next, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const GRID_CARD_STYLE: Record<string, { bg: string; text: string; sub: string; border: string }> = {
    werke: { bg: akzentGrad, text: m.violett, sub: 'rgba(53,23,119,0.75)', border: 'none' },
    design: { bg: '#f3efe3', text: m.text, sub: m.muted, border: `${m.goldSoft}88` },
    einstellungen: { bg: '#f0eef8', text: m.text, sub: m.muted, border: `${m.violett}22` },
    statistik: { bg: '#f7f4ec', text: m.text, sub: m.muted, border: `${m.gold}33` },
    eventplan: { bg: '#f7f4ec', text: m.text, sub: m.muted, border: `${m.gold}33` },
  }

  const chip = (label: string, to: string, fill?: boolean) => (
    <Link
      to={to}
      style={{
        padding: fill ? '0.55rem 1.1rem' : '0.5rem 1rem',
        background: fill ? m.goldSoft : m.bgCard,
        color: fill ? m.violett : m.text,
        textDecoration: 'none',
        borderRadius: '10px',
        fontSize: fill ? '0.9rem' : '0.88rem',
        fontWeight: fill ? 700 : 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        border: fill ? 'none' : `1px solid ${m.gold}40`,
        boxShadow: fill ? '0 2px 8px rgba(128,96,0,0.18)' : undefined,
        fontFamily: m.font,
      }}
    >
      {label}
    </Link>
  )

  const renderKachel = (b: YogaHubKachel) => {
    const cs = GRID_CARD_STYLE[b.tab] || { bg: m.bgCard, text: m.text, sub: m.muted, border: `${m.gold}33` }
    const isAccent = b.tab === 'werke'
    return (
      <button
        key={b.tab}
        type="button"
        className="admin-hub-karte"
        onClick={() => {
          if (b.tab === 'werke') {
            document.getElementById('yoga-akademie-lehrgaenge')?.scrollIntoView({ behavior: 'smooth' })
            setTab('werke')
          } else setTab(b.tab)
        }}
        style={{
          padding: 'clamp(0.75rem, 2vw, 1rem) clamp(0.9rem, 2.5vw, 1.1rem)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(0.6rem, 1.5vw, 0.9rem)',
          background: cs.bg,
          border: isAccent ? 'none' : `1px solid ${cs.border}`,
          borderRadius: '12px',
          cursor: 'pointer',
          fontFamily: m.font,
          textAlign: 'left',
          boxShadow: isAccent ? `0 3px 12px ${m.gold}44` : '0 1px 3px rgba(0,0,0,0.06)',
          color: cs.text,
          fontWeight: isAccent ? 700 : 500,
        }}
      >
        <span style={{ fontSize: 'clamp(1.75rem, 4vw, 2.1rem)', flexShrink: 0, lineHeight: 1 }}>{b.emoji}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', lineHeight: 1.25 }}>{b.name}</div>
          <div style={{ fontSize: '0.72rem', color: cs.sub, marginTop: '0.15rem', lineHeight: 1.3 }}>
            {b.beschreibung.length > 52 ? `${b.beschreibung.slice(0, 51)}…` : b.beschreibung}
          </div>
        </div>
      </button>
    )
  }

  const maxRows = Math.max(YOGA_AKADEMIE_HUB_LINKS.length, YOGA_AKADEMIE_HUB_RECHTS.length)
  const cells: (YogaHubKachel | null)[] = []
  for (let i = 0; i < maxRows; i++) {
    cells.push(YOGA_AKADEMIE_HUB_LINKS[i] ?? null)
    cells.push(YOGA_AKADEMIE_HUB_RECHTS[i] ?? null)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: m.bg,
        color: m.text,
        fontFamily: m.font,
        position: 'relative',
      }}
    >
      <link rel="stylesheet" href={YOGA_FONT_HREF} />
      <style>{`
        .admin-hub-karte { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .admin-hub-karte:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(128,96,0,0.12); }
      `}</style>
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
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Link to={K2_YOGA_ROUTE} style={{ color: m.violett, fontWeight: 700, textDecoration: 'none' }}>
          ← Skizze
        </Link>
        <Link to={PROJECT_ROUTES['k2-yoga'].detailplan} style={{ color: m.violett, fontWeight: 700, textDecoration: 'none' }}>
          Detailplan
        </Link>
        <Link to={absolventAdmin} style={{ color: m.violett, fontWeight: 700, textDecoration: 'none' }}>
          Fläche Absolvent:in
        </Link>
        <span>Arbeitsfläche Akademie · Farben wie auf yogaakademieaustria.com</span>
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
            <img src={m.logo} alt="Yoga-Akademie Austria" width={72} height={48} style={{ display: 'block', objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 700, color: m.gold, fontSize: '1.05rem', lineHeight: 1.2 }}>Yoga-Akademie Austria</div>
              <div style={{ fontSize: '0.78rem', color: m.violett, fontWeight: 600 }}>{m.slogan}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {chip('🖼️ Beispiel-Auftritt', willkommen)}
            {chip('🧘 Fläche Absolvent:in', absolventAdmin)}
            {chip('📒 Übersicht', `${akademieBase}?tab=buchhaltung`, true)}
          </div>
        </div>
      </div>

      <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {activeTab !== 'werke' && (
          <button
            type="button"
            onClick={() => setTab('werke')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: m.muted, fontSize: '0.9rem', padding: '0 0 1rem 0', fontFamily: m.font }}
          >
            ← Zurück zur Übersicht
          </button>
        )}

        {activeTab === 'werke' && (
          <>
            <h2 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: 700, color: m.gold, margin: '0 0 0.25rem' }}>
              Was möchtest du heute tun?
            </h2>
            <p style={{ color: m.muted, margin: '0 0 1rem', fontSize: '0.9rem' }}>
              Das ist die Fläche des Büros: Lehrgänge, Listen, Öffnen. Vertraut wie eure Homepage – andere Aufgabe.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(0.75rem, 2vw, 1rem)', maxWidth: 900 }}>
              {cells.map((b, idx) => (b ? renderKachel(b) : <div key={`empty-${idx}`} />))}
            </div>
            <div
              id="yoga-akademie-lehrgaenge"
              style={{ margin: 'clamp(2rem, 5vw, 3rem) 0 clamp(1rem, 3vw, 1.5rem)', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{ flex: 1, height: 1, background: `${m.gold}33` }} />
              <span style={{ fontSize: '1rem', fontWeight: 700, color: m.gold }}>📚 Lehrgänge</span>
              <div style={{ flex: 1, height: 1, background: `${m.gold}33` }} />
            </div>
            <p style={{ color: m.muted, fontSize: '0.9rem', marginTop: 0 }}>
              Ein Lehrgang = Name, Ort, Leitung, Termine. Die Teilnehmerliste gibt es ohnehin – hier wird sie genutzt.
            </p>
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              {YOGA_AKADEMIE_LEHRGAENGE.map((a) => (
                <Link
                  key={a.id}
                  to={yogaKursPath(a.id)}
                  style={{
                    background: m.bgCard,
                    border: `1px solid ${m.gold}33`,
                    borderRadius: 12,
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: m.violett }}>{a.title}</div>
                    <div style={{ fontSize: '0.82rem', color: m.muted }}>{a.note}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem' }}>{a.personen} Personen</span>
                    <span style={{ fontSize: '0.78rem', color: a.offen > 0 ? m.goldDark : m.muted, fontWeight: 600 }}>
                      {a.offen > 0 ? `✅ ${a.offen} Auftritte offen` : '○ noch keine Auftritte'}
                    </span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: m.gold }}>{a.status}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: m.violett }}>Kurs öffnen →</span>
                  </div>
                </Link>
              ))}
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: m.muted }}>
              Muster zum Vorzeigen – so sieht die Tagesarbeit im Büro aus. Kein Lernportal, keine leeren Häuser.
            </p>
          </>
        )}

        {activeTab === 'design' && (
          <section>
            <h2 style={{ margin: '0 0 0.4rem', color: m.gold }}>✨ Lehrgang-Auftritt</h2>
            <p style={{ color: m.muted }}>Gemeinsames Willkommen der Klasse – QR für alle, solange der Lehrgang läuft.</p>
            <ul style={{ lineHeight: 1.7 }}>
              <li>Bild und Begrüßung der Gruppe</li>
              <li>Termine des Lehrgangs</li>
              <li>Nach dem Abschluss: jede Person öffnet die eigene Fläche</li>
            </ul>
            <Link to={willkommen} style={{ color: m.violett, fontWeight: 700 }}>
              Beispiel persönlicher Auftritt →
            </Link>
          </section>
        )}

        {activeTab === 'einstellungen' && (
          <section>
            <h2 style={{ margin: '0 0 0.4rem', color: m.gold }}>⚙️ Akademie-Einstellungen</h2>
            <p style={{ color: m.muted }}>Einmal pflegen – gilt für Lehrgänge und Einladungen.</p>
            <div style={{ background: m.bgCard, borderRadius: 12, padding: '1rem', border: `1px solid ${m.gold}33` }}>
              <p style={{ margin: '0 0 0.35rem' }}>
                <strong style={{ color: m.violett }}>Akademie:</strong> {YOGA_AKADEMIE_STAMMDATEN.name}
              </p>
              <p style={{ margin: '0 0 0.35rem' }}>
                <strong style={{ color: m.violett }}>Orte:</strong> {YOGA_AKADEMIE_STAMMDATEN.ort}
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: m.violett }}>Büro:</strong> {YOGA_AKADEMIE_STAMMDATEN.kontakt}
              </p>
            </div>
          </section>
        )}

        {activeTab === 'statistik' && (
          <section>
            <h2 style={{ margin: '0 0 0.4rem', color: m.gold }}>👥 Teilnehmerlisten</h2>
            <p style={{ color: m.muted }}>Liste aus dem Büro. Status auf einen Blick: offen, Einladung, noch im Lehrgang.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: m.bgCard, borderRadius: 12, overflow: 'hidden' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: m.muted, fontSize: '0.8rem' }}>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Name</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Lehrgang</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {YOGA_AKADEMIE_TEILNEHMER.map((t) => (
                  <tr key={t.id} style={{ borderTop: `1px solid ${m.gold}28` }}>
                    <td style={{ padding: '0.55rem 0.75rem', fontWeight: 600, color: m.violett }}>{t.name}</td>
                    <td style={{ padding: '0.55rem 0.75rem' }}>{t.lehrgang}</td>
                    <td style={{ padding: '0.55rem 0.75rem', color: t.offen ? m.goldDark : m.muted }}>{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: '0.85rem', color: m.muted, marginTop: '0.85rem' }}>
              Abschluss: Name und Bild aus der Liste – eigene Fläche öffnen. Nur wer öffnet, bekommt ein Haus.
            </p>
            <Link to={absolventAdmin} style={{ color: m.violett, fontWeight: 700 }}>
              So sieht die Fläche der Absolventin aus →
            </Link>
          </section>
        )}

        {activeTab === 'eventplan' && (
          <section>
            <h2 style={{ margin: '0 0 0.4rem', color: m.gold }}>🎟️ Termine & Einladung</h2>
            <p style={{ color: m.muted }}>Lehrgangstermine und Alumni – Einladung, kein Zwang, keine Massenanlage.</p>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {YOGA_AKADEMIE_EINLADUNGEN.map((t) => (
                <div key={t.id} style={{ background: m.bgCard, padding: '0.75rem 1rem', borderRadius: 10, border: `1px solid ${m.gold}33` }}>
                  <strong style={{ color: m.violett }}>{t.title}</strong>
                  <div style={{ fontSize: '0.85rem', color: m.muted }}>{t.note}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'kassa' && (
          <section>
            <h2 style={{ margin: '0 0 0.4rem', color: m.gold }}>💰 Kasse Akademie</h2>
            <p style={{ color: m.muted }}>Optional für Lehrgangsgebühren – getrennt von der Kasse der Absolvent:innen.</p>
          </section>
        )}

        {activeTab === 'buchhaltung' && (
          <section>
            <h2 style={{ margin: '0 0 0.4rem', color: m.gold }}>📒 Übersicht</h2>
            <p style={{ color: m.muted }}>Zwei Lehrgänge (Muster). 3 persönliche Auftritte offen. Alumni nur per Einladung.</p>
          </section>
        )}

        <footer style={{ marginTop: '2.5rem', fontSize: '0.75rem', color: m.muted, lineHeight: 1.5 }}>
          <div>
            Optik angelehnt an{' '}
            <a href={m.site} target="_blank" rel="noreferrer" style={{ color: m.violett }}>
              yogaakademieaustria.com
            </a>
            {' · '}Muster zum Vorzeigen
          </div>
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </footer>
      </div>
    </div>
  )
}
