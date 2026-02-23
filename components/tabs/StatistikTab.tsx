import React from 'react'
import { WERBEUNTERLAGEN_STIL } from '../../src/config/marketingWerbelinie'
import { getCategoryLabel } from '../../src/config/tenantConfig'

const s = WERBEUNTERLAGEN_STIL

interface StatistikTabProps {
  allArtworks: any[]
  onMarkAsReserved: (number: string, reservedFor: string) => void
  onRerender: () => void
}

export default function StatistikTab({ allArtworks, onMarkAsReserved, onRerender }: StatistikTabProps) {
  let soldEntries: any[] = []
  try { soldEntries = JSON.parse(localStorage.getItem('k2-sold-artworks') || '[]') } catch (_) {}
  let reservedEntries: any[] = []
  try { reservedEntries = JSON.parse(localStorage.getItem('k2-reserved-artworks') || '[]') } catch (_) {}

  const soldNumbers = new Set(soldEntries.map((e: any) => e.number))
  const soldWerke = allArtworks.filter((a: any) => soldNumbers.has(a.number || a.id))
  const gesamtWerke = allArtworks.length
  const inGalerie = allArtworks.filter((a: any) => a.inExhibition).length
  const reserviert = reservedEntries.length

  const umsatzGesamt = soldEntries.reduce((sum: number, e: any) => {
    const werk = allArtworks.find((a: any) => (a.number || a.id) === e.number)
    return sum + (e.soldPrice || werk?.price || 0)
  }, 0)

  const katMap: Record<string, { count: number; umsatz: number }> = {}
  soldWerke.forEach((a: any) => {
    const kat = getCategoryLabel(a.category)
    const soldEntry = soldEntries.find((e: any) => e.number === (a.number || a.id))
    const preis = soldEntry?.soldPrice || a.price || 0
    if (!katMap[kat]) katMap[kat] = { count: 0, umsatz: 0 }
    katMap[kat].count++
    katMap[kat].umsatz += preis
  })
  const katSorted = Object.entries(katMap).sort((a, b) => b[1].umsatz - a[1].umsatz)

  const letzteFuenf = [...soldEntries]
    .sort((a, b) => (b.soldAt || '').localeCompare(a.soldAt || ''))
    .slice(0, 5)
    .map((e: any) => ({ ...e, werk: allArtworks.find((a: any) => (a.number || a.id) === e.number) }))

  const preise = soldWerke.map((a: any) => a.price || 0).filter((p: number) => p > 0)
  const preisMin = preise.length ? Math.min(...preise) : 0
  const preisMax = preise.length ? Math.max(...preise) : 0
  const preisDurch = preise.length ? preise.reduce((a: number, b: number) => a + b, 0) / preise.length : 0

  const kachelStyle = { background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: 16, padding: '1.25rem', boxShadow: s.shadow }

  let anfragen: any[] = []
  try { anfragen = JSON.parse(localStorage.getItem('k2-anfragen') || '[]') } catch (_) {}
  const neueAnfragen = anfragen.filter((a: any) => a.status === 'neu')

  const markAnfrageGelesen = (id: string) => {
    try {
      const all = JSON.parse(localStorage.getItem('k2-anfragen') || '[]')
      const idx = all.findIndex((x: any) => x.id === id)
      if (idx !== -1) { all[idx] = { ...all[idx], status: 'gelesen' }; localStorage.setItem('k2-anfragen', JSON.stringify(all)) }
    } catch (_) {}
    onRerender()
  }

  const deleteAnfrage = (id: string) => {
    try {
      const all = JSON.parse(localStorage.getItem('k2-anfragen') || '[]')
      localStorage.setItem('k2-anfragen', JSON.stringify(all.filter((x: any) => x.id !== id)))
    } catch (_) {}
    onRerender()
  }

  return (
    <section style={{ background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: 24, padding: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '2rem' }}>

      {/* Kennzahlen-Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ ...kachelStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: s.accent }}>{soldWerke.length}</div>
          <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>Verkaufte Werke</div>
        </div>
        <div style={{ ...kachelStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803d' }}>€ {umsatzGesamt.toFixed(0)}</div>
          <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>Gesamtumsatz</div>
        </div>
        <div style={{ ...kachelStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: s.text }}>{gesamtWerke}</div>
          <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>Werke gesamt</div>
        </div>
        <div style={{ ...kachelStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb' }}>{inGalerie}</div>
          <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>In Galerie</div>
        </div>
        <div style={{ ...kachelStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706' }}>{reserviert}</div>
          <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>Reserviert</div>
        </div>
        {preise.length > 0 && (
          <div style={{ ...kachelStyle, textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.text }}>€ {preisDurch.toFixed(0)}</div>
            <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4 }}>Ø Verkaufspreis</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

        {/* Nach Kategorie */}
        <div style={kachelStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: '0 0 1rem' }}>📂 Umsatz nach Kategorie</h3>
          {katSorted.length === 0 ? (
            <div style={{ color: s.muted, fontSize: '0.9rem' }}>Noch keine Verkäufe</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {katSorted.map(([kat, data]) => {
                const pct = umsatzGesamt > 0 ? (data.umsatz / umsatzGesamt) * 100 : 0
                return (
                  <div key={kat}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 4 }}>
                      <span style={{ color: s.text, fontWeight: 600 }}>{kat}</span>
                      <span style={{ color: s.muted }}>{data.count}× · € {data.umsatz.toFixed(0)}</span>
                    </div>
                    <div style={{ height: 8, background: s.bgElevated, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${s.accent}, #d96b35)`, borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Letzte Verkäufe */}
        <div style={kachelStyle}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: '0 0 1rem' }}>🕐 Letzte Verkäufe</h3>
          {letzteFuenf.length === 0 ? (
            <div style={{ color: s.muted, fontSize: '0.9rem' }}>Noch keine Verkäufe</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {letzteFuenf.map((e: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: i < letzteFuenf.length - 1 ? `1px solid ${s.accent}18` : 'none' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: s.text }}>{e.werk?.title || e.number}</div>
                    <div style={{ fontSize: '0.78rem', color: s.muted }}>{e.soldAt ? new Date(e.soldAt).toLocaleDateString('de-DE') : '–'} · {e.number}</div>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#15803d' }}>
                    € {(e.soldPrice || e.werk?.price || 0).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preisspanne */}
        {preise.length > 0 && (
          <div style={kachelStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: '0 0 1rem' }}>💰 Preisspanne (verkaufte Werke)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.text }}>€ {preisMin.toFixed(0)}</div>
                <div style={{ fontSize: '0.78rem', color: s.muted }}>Minimum</div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.accent }}>€ {preisDurch.toFixed(0)}</div>
                <div style={{ fontSize: '0.78rem', color: s.muted }}>Durchschnitt</div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.text }}>€ {preisMax.toFixed(0)}</div>
                <div style={{ fontSize: '0.78rem', color: s.muted }}>Maximum</div>
              </div>
            </div>
          </div>
        )}

        {/* Reservierungen */}
        {reservedEntries.length > 0 && (
          <div style={kachelStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: '0 0 1rem' }}>🔶 Reservierungen</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {reservedEntries.map((e: any, i: number) => {
                const werk = allArtworks.find((a: any) => (a.number || a.id) === e.number)
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: i < reservedEntries.length - 1 ? `1px solid ${s.accent}18` : 'none' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: s.text }}>{werk?.title || e.number}</div>
                      <div style={{ fontSize: '0.78rem', color: s.muted }}>{e.reservedFor ? `für ${e.reservedFor} · ` : ''}{e.reservedAt ? new Date(e.reservedAt).toLocaleDateString('de-DE') : ''}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onMarkAsReserved(e.number, '')}
                      style={{ padding: '0.3rem 0.6rem', background: 'none', border: `1px solid ${s.muted}44`, borderRadius: 6, color: s.muted, fontSize: '0.78rem', cursor: 'pointer' }}
                    >
                      Aufheben
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Anfragen-Inbox */}
        {anfragen.length > 0 && (
          <div style={{ ...kachelStyle, gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: 0 }}>
                ✉️ Anfragen
                {neueAnfragen.length > 0 && <span style={{ marginLeft: 8, background: '#ef4444', color: '#fff', borderRadius: 20, padding: '2px 8px', fontSize: '0.78rem', fontWeight: 700 }}>{neueAnfragen.length} neu</span>}
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {anfragen.map((a: any, i: number) => (
                <div key={a.id || i} style={{ padding: '0.75rem', background: a.status === 'neu' ? `${s.accent}10` : s.bgElevated, borderRadius: 10, border: a.status === 'neu' ? `1px solid ${s.accent}44` : `1px solid ${s.accent}18` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: s.text, fontSize: '0.9rem' }}>{a.name} <span style={{ color: s.muted, fontWeight: 400 }}>– {a.email}</span></div>
                      <div style={{ fontSize: '0.82rem', color: s.accent, marginTop: 2 }}>Werk: {a.artworkTitle || a.artworkNumber}{a.artworkPrice ? ` · € ${Number(a.artworkPrice).toFixed(0)}` : ''}</div>
                      {a.nachricht && <div style={{ fontSize: '0.85rem', color: s.muted, marginTop: 4, fontStyle: 'italic' }}>„{a.nachricht}"</div>}
                      <div style={{ fontSize: '0.75rem', color: s.muted, marginTop: 4 }}>{a.createdAt ? new Date(a.createdAt).toLocaleString('de-DE') : ''}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      {a.status === 'neu' && (
                        <button
                          type="button"
                          onClick={() => markAnfrageGelesen(a.id)}
                          style={{ padding: '0.3rem 0.6rem', background: s.accent, color: '#fff', border: 'none', borderRadius: 6, fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          ✓ Gelesen
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteAnfrage(a.id)}
                        style={{ padding: '0.3rem 0.6rem', background: 'none', border: `1px solid ${s.muted}44`, borderRadius: 6, color: s.muted, fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </section>
  )
}
