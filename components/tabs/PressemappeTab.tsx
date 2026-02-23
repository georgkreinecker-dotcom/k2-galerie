import React, { useState } from 'react'
import { WERBEUNTERLAGEN_STIL } from '../../src/config/marketingWerbelinie'

const s = WERBEUNTERLAGEN_STIL

interface PressemappeTabProps {
  onBack: () => void
}

export default function PressemappeTab({ onBack }: PressemappeTabProps) {
  const galStammdaten: any = (() => { try { return JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}') } catch (_) { return {} } })()
  const personStammdaten: any = (() => { try { return JSON.parse(localStorage.getItem('k2-stammdaten-martina') || '{}') } catch (_) { return {} } })()
  const allArtworks: any[] = (() => { try { return JSON.parse(localStorage.getItem('k2-artworks') || '[]') } catch (_) { return [] } })()

  const gName = galStammdaten.name || 'K2 Galerie'
  const gCity = galStammdaten.city || ''
  const gAddress = galStammdaten.address || ''
  const gEmail = galStammdaten.email || ''
  const gPhone = galStammdaten.phone || ''
  const gWebsite = galStammdaten.website || ''
  const gHours = galStammdaten.openingHours || ''
  const artistName = personStammdaten.name || 'Martina Kreinecker'
  const vita = personStammdaten.vita || personStammdaten.bio || ''

  const defaultWerkeIds = allArtworks.slice(0, 5).map((a: any) => a.id || a.number)
  const [werkeIds, setWerkeIds] = useState<string[]>(defaultWerkeIds)
  const [freitext, setFreitext] = useState('')

  const selectedWerke = allArtworks.filter((a: any) => werkeIds.includes(a.id || a.number))

  const toggleWerk = (id: string) => {
    setWerkeIds(prev => prev.includes(id)
      ? prev.filter(x => x !== id)
      : prev.length < 6 ? [...prev, id] : prev
    )
  }

  const druckePressemappe = () => {
    const win = window.open('', '_blank')
    if (!win) return
    const werkHtml = selectedWerke.map((aw: any) => `
      <div style="display:inline-block;width:160px;margin:8px;vertical-align:top;text-align:center">
        ${aw.image
          ? `<img src="${aw.image}" style="width:160px;height:120px;object-fit:cover;border-radius:4px;border:1px solid #ddd" />`
          : '<div style="width:160px;height:100px;background:#f0f0f0;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:0.8rem">Kein Foto</div>'}
        <div style="font-weight:600;font-size:0.85rem;margin-top:6px">${aw.title || `Werk ${aw.number}`}</div>
        <div style="font-size:0.78rem;color:#777">${aw.technik || ''}${aw.dimensions ? ' · ' + aw.dimensions : ''}</div>
        ${aw.price ? `<div style="font-size:0.8rem;color:#555;font-weight:600">€ ${Number(aw.price).toLocaleString('de-AT')}</div>` : ''}
      </div>`).join('')
    const today = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
    win.document.write(`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Pressemappe – ${gName}</title>
<style>
  body{font-family:'Helvetica Neue',sans-serif;color:#1a1a1a;margin:0;padding:0}
  .page{max-width:210mm;margin:0 auto;padding:20mm 18mm;box-sizing:border-box}
  h1{font-size:2rem;margin:0 0 4px;color:#1a1a1a}
  .subtitle{font-size:0.9rem;color:#888;margin-bottom:20px;letter-spacing:1px;text-transform:uppercase}
  .divider{border:none;border-top:2px solid #1a1a1a;margin:18px 0}
  h2{font-size:1.15rem;color:#333;margin:18px 0 8px}
  p{line-height:1.7;font-size:0.92rem;color:#333}
  .kontakt-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.88rem;color:#555;margin-bottom:8px}
  .footer{margin-top:32px;font-size:0.75rem;color:#aaa;border-top:1px solid #ddd;padding-top:10px;text-align:center}
  @media print{body{margin:0}}
</style></head><body>
<div class="page">
  <h1>${gName}</h1>
  <p class="subtitle">Pressemappe · ${today}</p>
  <hr class="divider" />

  <h2>Über die Galerie</h2>
  <div class="kontakt-grid">
    ${gAddress ? `<div>📍 ${gAddress}${gCity ? ', ' + gCity : ''}</div>` : ''}
    ${gPhone ? `<div>📞 ${gPhone}</div>` : ''}
    ${gEmail ? `<div>✉️ ${gEmail}</div>` : ''}
    ${gWebsite ? `<div>🌐 ${gWebsite}</div>` : ''}
    ${gHours ? `<div>🕐 ${gHours}</div>` : ''}
  </div>
  ${freitext ? `<p>${freitext}</p>` : ''}

  <h2>Künstlerin: ${artistName}</h2>
  ${vita ? `<p>${vita}</p>` : '<p><em>Vita wird in den Stammdaten gepflegt.</em></p>'}

  <h2>Ausgewählte Werke</h2>
  <div>${werkHtml || '<p><em>Keine Werke ausgewählt.</em></p>'}</div>

  <div class="footer">${gName} · Pressemappe · Stand ${today}</div>
</div>
<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script>
</body></html>`)
    win.document.close()
  }

  return (
    <section style={{ padding: 'clamp(1rem, 3vw, 2rem)' }}>
      <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12 }}>
        <p style={{ margin: 0, color: s.muted, fontSize: '0.9rem', lineHeight: 1.6 }}>
          📰 <strong style={{ color: '#fbbf24' }}>Pressemappe</strong> – Automatisch aus deinen Stammdaten und ausgewählten Werken erstellt.
          Wähle bis zu 6 Werke, ergänze optional einen Einleitungstext und drucke die fertige Pressemappe (A4).
        </p>
      </div>

      {/* Werke auswählen */}
      <div style={{ background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: '0 0 0.75rem' }}>
          🖼️ Werke auswählen (max. 6, ausgewählt: {werkeIds.length})
        </h3>
        {allArtworks.length === 0 ? (
          <p style={{ color: s.muted, fontSize: '0.88rem', margin: 0 }}>Noch keine Werke erfasst.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.65rem' }}>
            {allArtworks.map((aw: any) => {
              const awId = aw.id || aw.number
              const selected = werkeIds.includes(awId)
              return (
                <div
                  key={awId}
                  onClick={() => toggleWerk(awId)}
                  style={{ cursor: 'pointer', border: `2px solid ${selected ? 'rgba(251,191,36,0.7)' : s.accent + '22'}`, borderRadius: 10, overflow: 'hidden', opacity: !selected && werkeIds.length >= 6 ? 0.5 : 1, background: selected ? 'rgba(251,191,36,0.08)' : s.bgElevated }}
                >
                  {aw.image
                    ? <img src={aw.image} alt={aw.title} style={{ width: '100%', height: 85, objectFit: 'cover' }} />
                    : <div style={{ height: 70, background: s.bgCard, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.muted, fontSize: '0.75rem' }}>Kein Foto</div>
                  }
                  <div style={{ padding: '0.4rem 0.5rem', fontSize: '0.78rem', color: s.text, fontWeight: selected ? 700 : 400 }}>{aw.title || `Nr. ${aw.number}`}</div>
                  {selected && <div style={{ padding: '0 0.5rem 0.4rem', fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>✓ Ausgewählt</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Freitext */}
      <div style={{ background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: '0 0 0.5rem' }}>📝 Einleitungstext (optional)</h3>
        <textarea
          value={freitext}
          onChange={e => setFreitext(e.target.value)}
          placeholder="Kurze Beschreibung der Galerie oder des aktuellen Anlasses..."
          rows={4}
          className="input"
          style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      {/* Datenvorschau */}
      <div style={{ background: s.bgCard, border: `1px solid ${s.accent}18`, borderRadius: 10, padding: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: s.muted }}>
        <strong style={{ color: s.text }}>Daten aus Stammdaten:</strong>
        <div style={{ marginTop: '0.5rem', lineHeight: 1.8 }}>
          📛 <strong style={{ color: s.text }}>{gName}</strong>{gCity ? ` · ${gCity}` : ''}
          {gAddress && <> · {gAddress}</>}
          {gEmail && <> · {gEmail}</>}
          {gPhone && <> · {gPhone}</>}
          <br />👤 Künstlerin: <strong style={{ color: s.text }}>{artistName}</strong>
          {vita && <div style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>{vita.substring(0, 200)}{vita.length > 200 ? '…' : ''}</div>}
        </div>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem' }}>Diese Daten werden in den Stammdaten (Einstellungen → Stammdaten) gepflegt.</p>
      </div>

      <button
        type="button"
        onClick={druckePressemappe}
        style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg,rgba(251,191,36,0.25),rgba(245,158,11,0.15))', border: '2px solid rgba(251,191,36,0.5)', borderRadius: 12, color: '#fbbf24', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', letterSpacing: '0.3px' }}
      >
        🖨️ Pressemappe als PDF drucken
      </button>

      <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <button type="button" onClick={onBack} style={{ padding: '0.5rem 1.25rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: 8, color: s.muted, fontSize: '0.85rem', cursor: 'pointer' }}>
          ← Zurück zur Übersicht
        </button>
      </div>
    </section>
  )
}
