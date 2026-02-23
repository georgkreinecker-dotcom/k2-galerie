import React from 'react'
import { WERBEUNTERLAGEN_STIL } from '../../src/config/marketingWerbelinie'

const s = WERBEUNTERLAGEN_STIL

interface ZertifikatTabProps {
  onBack: () => void
}

export default function ZertifikatTab({ onBack }: ZertifikatTabProps) {
  const allArtworks: any[] = (() => {
    try { return JSON.parse(localStorage.getItem('k2-artworks') || '[]') } catch (_) { return [] }
  })()
  const galStammdaten: any = (() => {
    try { return JSON.parse(localStorage.getItem('k2-stammdaten-galerie') || '{}') } catch (_) { return {} }
  })()
  const personStammdaten: any = (() => {
    try { return JSON.parse(localStorage.getItem('k2-stammdaten-martina') || '{}') } catch (_) { return {} }
  })()

  const gName = galStammdaten.name || 'K2 Galerie'
  const gCity = galStammdaten.city || ''
  const artistName = personStammdaten.name || 'Martina Kreinecker'

  const druckeZertifikat = (artwork: any) => {
    const win = window.open('', '_blank')
    if (!win) return
    const imgHtml = artwork.image
      ? `<div style="text-align:center;margin-bottom:20px"><img src="${artwork.image}" style="max-width:260px;max-height:220px;object-fit:contain;border:1px solid #ccc;border-radius:4px" /></div>`
      : '<div style="width:260px;height:180px;border:1px dashed #ccc;border-radius:4px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;color:#999;font-size:0.9rem">Kein Foto</div>'
    const certDate = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
    const fields = [
      { label: 'Werknummer', value: artwork.number || '–' },
      { label: 'Titel', value: artwork.title || '–' },
      { label: 'Künstler:in', value: artistName },
      { label: 'Technik / Material', value: artwork.technik || '–' },
      { label: 'Maße', value: artwork.dimensions || '–' },
      { label: 'Erstellt', value: artwork.date ? new Date(artwork.date).toLocaleDateString('de-DE') : '–' },
      { label: 'Kategorie', value: artwork.category || '–' },
      ...(artwork.quantity > 1 ? [{ label: 'Auflage', value: `${artwork.quantity} Exemplare` }] : []),
      { label: 'Galerie', value: gName + (gCity ? `, ${gCity}` : '') },
      { label: 'Zertifikat ausgestellt', value: certDate },
    ]
    win.document.write(`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Echtheitszertifikat – ${artwork.title || artwork.number}</title>
<style>
  body { font-family: 'Georgia', serif; background: #fff; color: #1a1a1a; margin: 0; padding: 0; }
  .page { width: 148mm; min-height: 210mm; padding: 18mm 16mm; box-sizing: border-box; margin: 0 auto; border: 2px solid #b8a060; position: relative; }
  h1 { font-size: 1.3rem; text-align: center; letter-spacing: 2px; color: #8a6800; margin: 0 0 6px; text-transform: uppercase; }
  .subtitle { text-align: center; font-size: 0.8rem; color: #888; letter-spacing: 1px; margin-bottom: 18px; text-transform: uppercase; }
  .divider { border: none; border-top: 1px solid #c8a840; margin: 14px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  td { padding: 5px 4px; vertical-align: top; }
  td:first-child { color: #888; font-size: 0.78rem; width: 38%; padding-right: 8px; }
  td:last-child { font-weight: 600; color: #1a1a1a; }
  .signature { margin-top: 28px; text-align: center; }
  .sig-line { display: inline-block; width: 180px; border-top: 1px solid #1a1a1a; margin-top: 38px; padding-top: 6px; font-size: 0.78rem; color: #555; }
  .footer { position: absolute; bottom: 10mm; left: 16mm; right: 16mm; font-size: 0.7rem; color: #aaa; text-align: center; }
  .corner { position: absolute; width: 18px; height: 18px; border-color: #b8a060; border-style: solid; }
  .tl { top: 6px; left: 6px; border-width: 2px 0 0 2px; }
  .tr { top: 6px; right: 6px; border-width: 2px 2px 0 0; }
  .bl { bottom: 6px; left: 6px; border-width: 0 0 2px 2px; }
  .br { bottom: 6px; right: 6px; border-width: 0 2px 2px 0; }
  @media print { body { margin: 0; } .page { border: 2px solid #b8a060; } }
</style></head><body>
<div class="page">
  <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
  <h1>Echtheitszertifikat</h1>
  <p class="subtitle">${gName}</p>
  <hr class="divider" />
  ${imgHtml}
  <table>${fields.map(f => `<tr><td>${f.label}</td><td>${f.value}</td></tr>`).join('')}</table>
  <hr class="divider" style="margin-top:18px" />
  <div class="signature">
    <div style="font-size:0.82rem;color:#555;margin-bottom:4px">Hiermit wird bestätigt, dass dieses Werk ein Original der oben genannten Künstlerin ist.</div>
    <div class="sig-line">Datum &amp; Unterschrift</div>
  </div>
  <div class="footer">${gName}${gCity ? ` · ${gCity}` : ''} · ${certDate}</div>
</div>
<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script>
</body></html>`)
    win.document.close()
  }

  return (
    <section style={{ padding: 'clamp(1rem, 3vw, 2rem)' }}>
      <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12 }}>
        <p style={{ margin: 0, color: s.muted, fontSize: '0.9rem', lineHeight: 1.6 }}>
          🔏 <strong style={{ color: '#fbbf24' }}>Echtheitszertifikat</strong> – Wähle ein Werk aus, um ein professionelles PDF-Zertifikat zu drucken.
          Enthält Foto, Künstlerin, Galeriedaten, Maße, Technik und Unterschriften-Feld.
        </p>
      </div>

      {allArtworks.length === 0 ? (
        <p style={{ color: s.muted, fontSize: '0.9rem' }}>Noch keine Werke erfasst.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {allArtworks.map((aw: any) => (
            <div key={aw.id || aw.number} style={{ background: s.bgCard, border: '1px solid rgba(251,191,36,0.25)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {aw.image
                ? <img src={aw.image} alt={aw.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: 100, background: s.bgElevated, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.muted, fontSize: '0.8rem' }}>Kein Foto</div>
              }
              <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: s.text, lineHeight: 1.3 }}>{aw.title || `Werk ${aw.number}`}</div>
                <div style={{ fontSize: '0.78rem', color: s.muted }}>Nr. {aw.number}{aw.dimensions ? ` · ${aw.dimensions}` : ''}</div>
                {aw.technik && <div style={{ fontSize: '0.78rem', color: s.muted }}>{aw.technik}</div>}
                <button
                  type="button"
                  onClick={() => druckeZertifikat(aw)}
                  style={{ marginTop: 'auto', padding: '0.45rem 0.75rem', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.5)', borderRadius: 8, color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  🖨️ Zertifikat drucken
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <button type="button" onClick={onBack} style={{ padding: '0.5rem 1.25rem', background: s.bgElevated, border: `1px solid ${s.accent}44`, borderRadius: 8, color: s.muted, fontSize: '0.85rem', cursor: 'pointer' }}>
          ← Zurück zur Übersicht
        </button>
      </div>
    </section>
  )
}
