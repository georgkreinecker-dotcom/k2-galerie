import { Link, useSearchParams } from 'react-router-dom'
import YogaDemoNav from '../components/YogaDemoNav'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { YOGA_FONT_HREF, YOGA_MARKE } from '../config/yogaAkademieMarke'
import {
  YOGA_ADMIN_HUB_LINKS,
  YOGA_ADMIN_HUB_RECHTS,
  YOGA_MUSTER_ANGEBOTE,
  YOGA_MUSTER_STAMMDATEN,
  YOGA_MUSTER_TERMINE,
  type YogaAdminTab,
  type YogaHubKachel,
} from '../config/yogaAdminStruktur'

const TABS: YogaAdminTab[] = ['werke', 'design', 'einstellungen', 'statistik', 'eventplan', 'kassa', 'buchhaltung']

function isYogaTab(v: string): v is YogaAdminTab {
  return (TABS as string[]).includes(v)
}

/**
 * Fläche Absolvent:in – selber Stil wie Akademie (Gold/Violett), Muster zum Vorzeigen.
 */
export default function K2YogaAdminPage() {
  const m = YOGA_MARKE
  const [params, setParams] = useSearchParams()
  const rawTab = String(params.get('tab') || 'werke')
  const activeTab: YogaAdminTab = isYogaTab(rawTab) ? rawTab : 'werke'
  const willkommen = PROJECT_ROUTES['k2-yoga'].willkommen
  const adminBase = PROJECT_ROUTES['k2-yoga'].admin

  const setTab = (tab: YogaAdminTab) => {
    const next = new URLSearchParams(params)
    if (tab === 'werke') next.delete('tab')
    else next.set('tab', tab)
    setParams(next, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const chip = (label: string, to: string, fill?: boolean) => (
    <Link
      to={to}
      style={{
        padding: fill ? '0.55rem 1.1rem' : '0.5rem 1rem',
        background: fill ? m.goldSoft : m.bgCard,
        color: m.violett,
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

  const renderKachel = (b: YogaHubKachel) => {
    const isAccent = b.tab === 'werke'
    return (
      <button
        key={b.tab}
        type="button"
        className="yoga-admin-hub-karte"
        onClick={() => {
          if (b.tab === 'werke') {
            document.getElementById('yoga-admin-werke')?.scrollIntoView({ behavior: 'smooth' })
            setTab('werke')
          } else setTab(b.tab)
        }}
        style={{
          padding: 'clamp(0.75rem, 2vw, 1rem) clamp(0.9rem, 2.5vw, 1.1rem)',
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(0.6rem, 1.5vw, 0.9rem)',
          background: isAccent ? m.goldSoft : m.bgCard,
          border: `1px solid ${m.gold}${isAccent ? '66' : '33'}`,
          borderRadius: 12,
          cursor: 'pointer',
          fontFamily: m.font,
          textAlign: 'left',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          color: m.violett,
          fontWeight: isAccent ? 700 : 500,
        }}
      >
        <span style={{ fontSize: 'clamp(1.75rem, 4vw, 2.1rem)', flexShrink: 0, lineHeight: 1 }}>{b.emoji}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', lineHeight: 1.25 }}>{b.name}</div>
          <div style={{ fontSize: '0.72rem', color: m.muted, marginTop: '0.15rem', lineHeight: 1.3 }}>
            {b.beschreibung.length > 48 ? `${b.beschreibung.slice(0, 47)}…` : b.beschreibung}
          </div>
        </div>
      </button>
    )
  }

  const maxRows = Math.max(YOGA_ADMIN_HUB_LINKS.length, YOGA_ADMIN_HUB_RECHTS.length)
  const cells: (YogaHubKachel | null)[] = []
  for (let i = 0; i < maxRows; i++) {
    cells.push(YOGA_ADMIN_HUB_LINKS[i] ?? null)
    cells.push(YOGA_ADMIN_HUB_RECHTS[i] ?? null)
  }

  return (
    <div style={{ minHeight: '100vh', background: m.bg, color: m.text, fontFamily: m.font }}>
      <link rel="stylesheet" href={YOGA_FONT_HREF} />
      <style>{`
        .yoga-admin-hub-karte { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .yoga-admin-hub-karte:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(128,96,0,0.12); }
        @media print { .yoga-demo-nav { display: none !important; } }
      `}</style>
      <YogaDemoNav
        active="absolvent"
        hint="Fläche Absolvent:in · Stunden und Angebote bearbeiten (Muster)"
      />

      <div
        style={{
          position: 'sticky',
          top: 52,
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
              <div style={{ fontWeight: 700, color: m.gold, fontSize: '1.1rem', lineHeight: 1.2 }}>Yoga bei Anna</div>
              <div style={{ fontSize: '0.78rem', color: m.violett, fontWeight: 600 }}>Fläche Absolvent:in · Muster</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {chip('🖼️ Auftritt ansehen', willkommen, true)}
            {chip('🏫 Fläche Akademie', PROJECT_ROUTES['k2-yoga'].akademie)}
            {chip('💰 Kasse', `${adminBase}?tab=kassa`)}
            {chip('📒 Buchhaltung', `${adminBase}?tab=buchhaltung`)}
          </div>
        </div>
      </div>

      <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', maxWidth: 960, margin: '0 auto' }}>
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
              Ein Klick – du bist im Bereich. Das sind alle Bereiche deines Yoga-Auftritts.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(0.75rem, 2vw, 1rem)', maxWidth: 900 }}>
              {cells.map((b, idx) => (b ? renderKachel(b) : <div key={`empty-${idx}`} />))}
            </div>
            <div
              id="yoga-admin-werke"
              style={{ margin: 'clamp(2rem, 5vw, 3rem) 0 clamp(1rem, 3vw, 1.5rem)', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{ flex: 1, height: 1, background: `${m.gold}33` }} />
              <span style={{ fontSize: '1rem', fontWeight: 700, color: m.gold }}>🧘 Stunden & Angebote</span>
              <div style={{ flex: 1, height: 1, background: `${m.gold}33` }} />
            </div>
            <p style={{ color: m.muted, fontSize: '0.9rem', marginTop: 0 }}>
              Jedes Angebot hat Bild, Titel, Preis – und kann im Auftritt sichtbar sein. Ein Klick genügt.
            </p>
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              {YOGA_MUSTER_ANGEBOTE.map((a) => (
                <div
                  key={a.id}
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
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: m.violett }}>{a.title}</div>
                    <div style={{ fontSize: '0.82rem', color: m.muted }}>{a.note}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <strong style={{ color: m.violett }}>{a.price}</strong>
                    <span style={{ fontSize: '0.78rem', color: a.visible ? m.goldDark : m.muted, fontWeight: 600 }}>
                      {a.visible ? '✅ im Auftritt' : '○ nur intern'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: m.muted }}>
              Muster-Ansicht zum Vorzeigen – so sieht die Tagesarbeit aus. Speichern und echter Betrieb folgen mit eigenem Auftritt.
            </p>
          </>
        )}

        {activeTab === 'design' && (
          <section>
            <h2 style={{ margin: '0 0 0.4rem', color: m.gold }}>✨ Auftritt gestalten und texten</h2>
            <p style={{ color: m.muted }}>Willkommen, Stunden-Bereich und optional Rundgang – getrennt bearbeitbar.</p>
            <ul style={{ lineHeight: 1.7 }}>
              <li>Willkommen – Bild und Begrüßung</li>
              <li>Stunden & Angebote – was Besucher sehen</li>
              <li>Virtueller Rundgang – Raum oder Film</li>
            </ul>
            <Link to={willkommen} style={{ color: m.violett, fontWeight: 700 }}>
              Vorschau öffnen →
            </Link>
          </section>
        )}

        {activeTab === 'einstellungen' && (
          <section>
            <h2 style={{ margin: '0 0 0.4rem', color: m.gold }}>⚙️ Einstellungen</h2>
            <p style={{ color: m.muted }}>Stammdaten einmal – dann stimmen Auftritt, Einladung und Kasse.</p>
            <div style={{ background: m.bgCard, borderRadius: 12, padding: '1rem', border: `1px solid ${m.gold}33` }}>
              <p style={{ margin: '0 0 0.35rem' }}>
                <strong style={{ color: m.violett }}>Auftritt:</strong> {YOGA_MUSTER_STAMMDATEN.auftritt}
              </p>
              <p style={{ margin: '0 0 0.35rem' }}>
                <strong style={{ color: m.violett }}>Person:</strong> {YOGA_MUSTER_STAMMDATEN.person}
              </p>
              <p style={{ margin: '0 0 0.35rem' }}>
                <strong style={{ color: m.violett }}>Ort:</strong> {YOGA_MUSTER_STAMMDATEN.ort}
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: m.violett }}>Zeiten:</strong> {YOGA_MUSTER_STAMMDATEN.oeffnung}
              </p>
            </div>
            <p style={{ fontSize: '0.85rem', color: m.muted, marginTop: '0.85rem' }}>
              Sicherung herunterladen und wiederherstellen – ein fester Ort in den Einstellungen.
            </p>
          </section>
        )}

        {activeTab === 'statistik' && (
          <section>
            <h2 style={{ margin: '0 0 0.4rem', color: m.gold }}>📋📊 Listen & Übersicht</h2>
            <p style={{ color: m.muted }}>Alles auf einen Blick – druckbar für den Unterricht und die Übersicht.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: m.bgCard, borderRadius: 12, overflow: 'hidden' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: m.muted, fontSize: '0.8rem' }}>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Angebot</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Preis</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Sichtbar</th>
                </tr>
              </thead>
              <tbody>
                {YOGA_MUSTER_ANGEBOTE.map((a) => (
                  <tr key={a.id} style={{ borderTop: `1px solid ${m.gold}28` }}>
                    <td style={{ padding: '0.55rem 0.75rem', color: m.violett, fontWeight: 600 }}>{a.title}</td>
                    <td style={{ padding: '0.55rem 0.75rem' }}>{a.price}</td>
                    <td style={{ padding: '0.55rem 0.75rem' }}>{a.visible ? 'ja' : 'nein'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'eventplan' && (
          <section>
            <h2 style={{ margin: '0 0 0.4rem', color: m.gold }}>🎟️ Termine & Medienplanung</h2>
            <p style={{ color: m.muted }}>Termin anlegen, Einladung und QR – aus derselben Quelle.</p>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {YOGA_MUSTER_TERMINE.map((t) => (
                <div key={t.id} style={{ background: m.bgCard, padding: '0.75rem 1rem', borderRadius: 10, border: `1px solid ${m.gold}33` }}>
                  <strong style={{ color: m.violett }}>{t.title}</strong>
                  <div style={{ fontSize: '0.85rem', color: m.muted }}>{t.date}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'kassa' && (
          <section>
            <h2 style={{ margin: '0 0 0.4rem', color: m.gold }}>💰 Kasse</h2>
            <p style={{ color: m.muted }}>Ein Klick Kasse – Zahlung erfassen. Hier Muster zum Vorzeigen.</p>
            <div style={{ background: m.bgCard, padding: '1rem', borderRadius: 12, border: `1px solid ${m.gold}33` }}>
              <p style={{ margin: '0 0 0.4rem' }}>Heute: Hatha · Abend · 18 €</p>
              <p style={{ margin: 0, color: m.muted, fontSize: '0.88rem' }}>
                Bon und Rechnung gehören zu diesem Auftritt – nicht vermischt mit anderen.
              </p>
            </div>
          </section>
        )}

        {activeTab === 'buchhaltung' && (
          <section>
            <h2 style={{ margin: '0 0 0.4rem', color: m.gold }}>📒 Buchhaltung</h2>
            <p style={{ color: m.muted }}>Verkäufe, Belege, Listen – ein Ort, eigene Zahlen.</p>
            <p>Oktober: 2 Kurse gebucht (Muster).</p>
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
