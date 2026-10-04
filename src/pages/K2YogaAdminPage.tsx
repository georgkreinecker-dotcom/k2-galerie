import { Link, useSearchParams } from 'react-router-dom'
import AdminBrandLogo from '../components/AdminBrandLogo'
import { K2_YOGA_ROUTE, PROJECT_ROUTES } from '../config/navigation'
import { WERBEUNTERLAGEN_STIL } from '../config/marketingWerbelinie'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import {
  YOGA_ADMIN_HUB_LINKS,
  YOGA_ADMIN_HUB_RECHTS,
  YOGA_MUSTER_ANGEBOTE,
  YOGA_MUSTER_STAMMDATEN,
  YOGA_MUSTER_TERMINE,
  type YogaAdminTab,
  type YogaHubKachel,
} from '../config/yogaAdminStruktur'

const TABS: YogaAdminTab[] = [
  'werke',
  'design',
  'einstellungen',
  'statistik',
  'eventplan',
  'kassa',
  'buchhaltung',
]

function isYogaTab(v: string): v is YogaAdminTab {
  return (TABS as string[]).includes(v)
}

/**
 * Admin zur Ansicht: dieselbe Hub-Struktur wie K2, Wörter für Yogabetrieb. Keine K2-Daten.
 */
export default function K2YogaAdminPage() {
  const s = WERBEUNTERLAGEN_STIL
  const [params, setParams] = useSearchParams()
  const rawTab = String(params.get('tab') || 'werke')
  const activeTab: YogaAdminTab = isYogaTab(rawTab) ? rawTab : 'werke'
  const willkommen = PROJECT_ROUTES['k2-yoga'].willkommen
  const adminBase = PROJECT_ROUTES['k2-yoga'].admin
  const akzent = s.accent
  const akzentGrad = `linear-gradient(135deg, ${s.accent} 0%, #d96b35 100%)`

  const setTab = (tab: YogaAdminTab) => {
    const next = new URLSearchParams(params)
    if (tab === 'werke') next.delete('tab')
    else next.set('tab', tab)
    setParams(next, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const GRID_CARD_STYLE: Record<string, { bg: string; text: string; sub: string; border: string }> = {
    werke: { bg: akzentGrad, text: '#fff', sub: 'rgba(255,255,255,0.85)', border: 'none' },
    design: { bg: '#f5ebe0', text: '#1c1a18', sub: '#5c5650', border: '#c4a57444' },
    einstellungen: { bg: '#f0f4f8', text: s.text, sub: s.muted, border: '#a0b0c844' },
    statistik: { bg: '#f5f8f2', text: s.text, sub: s.muted, border: '#90a88044' },
    eventplan: { bg: '#f5f8f2', text: s.text, sub: s.muted, border: '#90a88044' },
  }

  const chip = (label: string, to: string, fill?: boolean) => (
    <Link
      to={to}
      style={{
        padding: fill ? '0.55rem 1.1rem' : '0.5rem 1rem',
        background: fill ? s.gradientAccent : s.bgCard,
        color: fill ? '#fff' : s.text,
        textDecoration: 'none',
        borderRadius: '10px',
        fontSize: fill ? '0.9rem' : '0.88rem',
        fontWeight: fill ? 700 : 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        border: fill ? 'none' : `1px solid ${s.accent}28`,
        boxShadow: fill ? '0 2px 8px rgba(181,74,30,0.18)' : undefined,
      }}
    >
      {label}
    </Link>
  )

  const renderKachel = (b: YogaHubKachel) => {
    const cs = GRID_CARD_STYLE[b.tab] || { bg: s.bgCard, text: s.text, sub: s.muted, border: `${s.accent}22` }
    const isAccent = b.tab === 'werke'
    return (
      <button
        key={b.tab}
        type="button"
        className="admin-hub-karte"
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
          background: cs.bg,
          border: isAccent ? 'none' : `1px solid ${cs.border}`,
          borderRadius: '12px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
          boxShadow: isAccent ? `0 3px 12px ${akzent}44` : '0 1px 3px rgba(0,0,0,0.06)',
          color: cs.text,
          fontWeight: isAccent ? 700 : 500,
        }}
      >
        <span style={{ fontSize: 'clamp(1.75rem, 4vw, 2.1rem)', flexShrink: 0, lineHeight: 1 }}>{b.emoji}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', lineHeight: 1.25 }}>{b.name}</div>
          <div style={{ fontSize: '0.72rem', color: cs.sub, marginTop: '0.15rem', lineHeight: 1.3 }}>
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
    <div
      style={{
        minHeight: '100vh',
        background: s.bgDark,
        color: s.text,
        fontFamily: s.fontBody,
        position: 'relative',
      }}
    >
      <style>{`
        .admin-hub-karte { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .admin-hub-karte:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
      `}</style>
      <div
        style={{
          fontFamily: s.fontBody,
          fontSize: '0.82rem',
          padding: '0.55rem 1rem',
          background: '#f5f3ff',
          color: '#5b21b6',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem 1rem',
          alignItems: 'center',
          borderBottom: '1px solid #ddd6fe',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Link to={K2_YOGA_ROUTE} style={{ color: '#5b21b6', fontWeight: 700, textDecoration: 'none' }}>
          ← K2 YOGA
        </Link>
        <span>Ansicht · Admin für einen Yogabetrieb (Muster, nicht K2)</span>
      </div>

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: s.bgDark,
          borderBottom: `2px solid ${s.accent}33`,
          padding: '0.85rem clamp(1rem, 3vw, 1.5rem)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem 1rem', justifyContent: 'space-between' }}>
          <AdminBrandLogo title="Yoga bei Anna" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {chip('🖼️ Auftritt ansehen', willkommen)}
            {chip('💰 Kasse', `${adminBase}?tab=kassa`, true)}
            {chip('📒 Buchhaltung', `${adminBase}?tab=buchhaltung`)}
          </div>
        </div>
      </div>

      <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {activeTab !== 'werke' && (
          <button
            type="button"
            onClick={() => setTab('werke')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.muted, fontSize: '0.9rem', padding: '0 0 1rem 0' }}
          >
            ← Zurück zur Übersicht
          </button>
        )}

        {activeTab === 'werke' && (
          <>
            <h2 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: 700, color: s.text, margin: '0 0 0.25rem', fontFamily: s.fontHeading }}>
              Was möchtest du heute tun?
            </h2>
            <p style={{ color: s.muted, margin: '0 0 1rem', fontSize: '0.9rem' }}>
              Ein Klick – du bist im Bereich. Das sind alle Bereiche deines Yoga-Auftritts.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(0.75rem, 2vw, 1rem)', maxWidth: 900 }}>
              {cells.map((b, idx) => (b ? renderKachel(b) : <div key={`empty-${idx}`} />))}
            </div>
            <div
              id="yoga-admin-werke"
              style={{ margin: 'clamp(2rem, 5vw, 3rem) 0 clamp(1rem, 3vw, 1.5rem)', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{ flex: 1, height: 1, background: `${s.accent}22` }} />
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>🧘 Stunden & Angebote</span>
              <div style={{ flex: 1, height: 1, background: `${s.accent}22` }} />
            </div>
            <p style={{ color: s.muted, fontSize: '0.9rem', marginTop: 0 }}>
              Wie Werke in der Galerie: jedes Angebot hat Bild, Titel, Preis – und kann im Auftritt sichtbar sein.
            </p>
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              {YOGA_MUSTER_ANGEBOTE.map((a) => (
                <div
                  key={a.id}
                  style={{
                    background: s.bgCard,
                    border: `1px solid ${s.accent}22`,
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
                    <div style={{ fontWeight: 700 }}>{a.title}</div>
                    <div style={{ fontSize: '0.82rem', color: s.muted }}>{a.note}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <strong>{a.price}</strong>
                    <span style={{ fontSize: '0.78rem', color: a.visible ? '#15803d' : '#b54a1e', fontWeight: 600 }}>
                      {a.visible ? '✅ im Auftritt' : '○ nur intern'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: s.muted }}>
              Muster – Speichern geht später über denselben Admin-Weg wie bei der Galerie (eigener Mandant, keine K2-Daten).
            </p>
          </>
        )}

        {activeTab === 'design' && (
          <section>
            <h2 style={{ fontFamily: s.fontHeading, margin: '0 0 0.4rem' }}>✨ Auftritt gestalten und texten</h2>
            <p style={{ color: s.muted }}>Wie Galerie gestalten: Willkommen, Karte, optional Rundgang – getrennt bearbeitbar.</p>
            <ul style={{ lineHeight: 1.7 }}>
              <li>Willkommen – Bild und Begrüßung</li>
              <li>Galerie – hier: Stunden & Angebote</li>
              <li>Virtueller Rundgang – Raum oder Film</li>
            </ul>
            <Link to={willkommen} style={{ color: s.accent, fontWeight: 700 }}>Vorschau öffnen →</Link>
          </section>
        )}

        {activeTab === 'einstellungen' && (
          <section>
            <h2 style={{ fontFamily: s.fontHeading, margin: '0 0 0.4rem' }}>⚙️ Einstellungen</h2>
            <p style={{ color: s.muted }}>Stammdaten einmal – dann stimmen Auftritt, Einladung und Kasse.</p>
            <div style={{ background: s.bgCard, borderRadius: 12, padding: '1rem', border: `1px solid ${s.accent}22` }}>
              <p style={{ margin: '0 0 0.35rem' }}><strong>Auftritt:</strong> {YOGA_MUSTER_STAMMDATEN.auftritt}</p>
              <p style={{ margin: '0 0 0.35rem' }}><strong>Person:</strong> {YOGA_MUSTER_STAMMDATEN.person}</p>
              <p style={{ margin: '0 0 0.35rem' }}><strong>Ort:</strong> {YOGA_MUSTER_STAMMDATEN.ort}</p>
              <p style={{ margin: 0 }}><strong>Zeiten:</strong> {YOGA_MUSTER_STAMMDATEN.oeffnung}</p>
            </div>
            <p style={{ fontSize: '0.85rem', color: s.muted, marginTop: '0.85rem' }}>Backup & Wiederherstellung bleibt im echten Admin derselbe Hauptweg wie bei K2.</p>
          </section>
        )}

        {activeTab === 'statistik' && (
          <section>
            <h2 style={{ fontFamily: s.fontHeading, margin: '0 0 0.4rem' }}>📋📊 Listen & Übersicht</h2>
            <p style={{ color: s.muted }}>Wie Statistik/Werkkatalog: alles auf einen Blick, druckbar.</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: s.bgCard, borderRadius: 12, overflow: 'hidden' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: s.muted, fontSize: '0.8rem' }}>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Angebot</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Preis</th>
                  <th style={{ padding: '0.55rem 0.75rem' }}>Sichtbar</th>
                </tr>
              </thead>
              <tbody>
                {YOGA_MUSTER_ANGEBOTE.map((a) => (
                  <tr key={a.id} style={{ borderTop: `1px solid ${s.accent}18` }}>
                    <td style={{ padding: '0.55rem 0.75rem' }}>{a.title}</td>
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
            <h2 style={{ fontFamily: s.fontHeading, margin: '0 0 0.4rem' }}>🎟️ Termine & Medienplanung</h2>
            <p style={{ color: s.muted }}>Wie Eventplanung: Termin anlegen, Einladung und QR aus derselben Quelle.</p>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {YOGA_MUSTER_TERMINE.map((t) => (
                <div key={t.id} style={{ background: s.bgCard, padding: '0.75rem 1rem', borderRadius: 10, border: `1px solid ${s.accent}22` }}>
                  <strong>{t.title}</strong>
                  <div style={{ fontSize: '0.85rem', color: s.muted }}>{t.date}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'kassa' && (
          <section>
            <h2 style={{ fontFamily: s.fontHeading, margin: '0 0 0.4rem' }}>💰 Kasse</h2>
            <p style={{ color: s.muted }}>Ein Klick Kasse – wie im Galerie-Admin. Hier Muster, kein K2-Shop.</p>
            <div style={{ background: s.bgCard, padding: '1rem', borderRadius: 12, border: `1px solid ${s.accent}22` }}>
              <p style={{ margin: '0 0 0.4rem' }}>Heute: Hatha · Abend · 18 €</p>
              <p style={{ margin: 0, color: s.muted, fontSize: '0.88rem' }}>Bon und Rechnung kommen aus diesem Kontext – nie aus der K2-Galerie.</p>
            </div>
          </section>
        )}

        {activeTab === 'buchhaltung' && (
          <section>
            <h2 style={{ fontFamily: s.fontHeading, margin: '0 0 0.4rem' }}>📒 Buchhaltung</h2>
            <p style={{ color: s.muted }}>Verkäufe, Belege, Listen – derselbe Ort wie bei K2, eigene Daten.</p>
            <p>Oktober: 2 Kurse gebucht (Muster).</p>
          </section>
        )}

        <footer style={{ marginTop: '2.5rem', fontSize: '0.75rem', color: s.muted, lineHeight: 1.5 }}>
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </footer>
      </div>
    </div>
  )
}
