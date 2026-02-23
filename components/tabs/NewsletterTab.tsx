import React, { useState } from 'react'
import { WERBEUNTERLAGEN_STIL } from '../../src/config/marketingWerbelinie'

const s = WERBEUNTERLAGEN_STIL
const NEWSLETTER_KEY = 'k2-newsletter-kontakte'
const KATEGORIEN = ['allgemein', 'vernissage', 'presse', 'sammler', 'freunde']

function loadKontakte(): any[] {
  try { return JSON.parse(localStorage.getItem(NEWSLETTER_KEY) || '[]') } catch (_) { return [] }
}

function saveKontakte(list: any[]) {
  try { localStorage.setItem(NEWSLETTER_KEY, JSON.stringify(list)) } catch (_) {}
}

interface NewsletterTabProps {
  onBack: () => void
}

export default function NewsletterTab({ onBack }: NewsletterTabProps) {
  const [kontakte, setKontakte] = useState<any[]>(loadKontakte)
  const [nlName, setNlName] = useState('')
  const [nlEmail, setNlEmail] = useState('')
  const [nlKategorie, setNlKategorie] = useState('allgemein')
  const [msg, setMsg] = useState('')

  const addKontakt = () => {
    const nm = nlName.trim()
    const em = nlEmail.trim()
    if (!nm || !em) { setMsg('Name und E-Mail sind Pflicht.'); return }
    if (kontakte.some((k: any) => k.email.toLowerCase() === em.toLowerCase())) {
      setMsg('Diese E-Mail ist bereits in der Liste.'); return
    }
    const updated = [...kontakte, { id: `nl-${Date.now()}`, name: nm, email: em, kategorie: nlKategorie, createdAt: new Date().toISOString() }]
    setKontakte(updated)
    saveKontakte(updated)
    setNlName('')
    setNlEmail('')
    setMsg('✅ Hinzugefügt.')
  }

  const removeKontakt = (id: string) => {
    const updated = kontakte.filter((k: any) => k.id !== id)
    setKontakte(updated)
    saveKontakte(updated)
  }

  const exportCsv = () => {
    const rows = [
      ['Name', 'E-Mail', 'Kategorie', 'Hinzugefügt'],
      ...kontakte.map((k: any) => [k.name, k.email, k.kategorie, k.createdAt ? new Date(k.createdAt).toLocaleDateString('de-DE') : ''])
    ]
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'einladungsliste.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const druckeAdressliste = () => {
    const win = window.open('', '_blank')
    if (!win) return
    const rows = kontakte.map((k: any, i: number) =>
      `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${i + 1}.</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:600">${k.name}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;color:#555">${k.email}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;color:#888;font-size:0.85rem">${k.kategorie}</td>
      </tr>`
    ).join('')
    win.document.write(`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>Einladungsliste</title>
<style>body{font-family:sans-serif;padding:20mm 20mm;color:#1a1a1a}h1{font-size:1.3rem;margin-bottom:4px}p{color:#888;font-size:0.85rem;margin-bottom:16px}table{width:100%;border-collapse:collapse}th{text-align:left;padding:6px 10px;border-bottom:2px solid #333;font-size:0.85rem;color:#555}</style></head>
<body><h1>📬 Einladungsliste</h1><p>Stand: ${new Date().toLocaleDateString('de-DE')} · ${kontakte.length} Kontakte</p>
<table><thead><tr><th>#</th><th>Name</th><th>E-Mail</th><th>Kategorie</th></tr></thead><tbody>${rows}</tbody></table>
<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script></body></html>`)
    win.document.close()
  }

  return (
    <section style={{ padding: 'clamp(1rem, 3vw, 2rem)' }}>
      <div style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12 }}>
        <p style={{ margin: 0, color: s.muted, fontSize: '0.9rem', lineHeight: 1.6 }}>
          📬 <strong style={{ color: '#fbbf24' }}>Einladungsliste</strong> – Kontakte für Vernissagen, Newsletter und Einladungskarten.
          Als CSV exportieren oder Adressliste drucken.
        </p>
      </div>

      {/* Neuer Kontakt */}
      <div style={{ background: s.bgCard, border: `1px solid ${s.accent}22`, borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: '0 0 1rem' }}>➕ Kontakt hinzufügen</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: s.muted, display: 'block', marginBottom: 4 }}>Name *</label>
            <input value={nlName} onChange={e => setNlName(e.target.value)} placeholder="Vorname Nachname" className="input" style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: s.muted, display: 'block', marginBottom: 4 }}>E-Mail *</label>
            <input type="email" value={nlEmail} onChange={e => setNlEmail(e.target.value)} placeholder="email@beispiel.at" className="input" style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: s.muted, display: 'block', marginBottom: 4 }}>Kategorie</label>
            <select value={nlKategorie} onChange={e => setNlKategorie(e.target.value)} className="input" style={{ width: '100%', boxSizing: 'border-box' }}>
              {KATEGORIEN.map(k => <option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={addKontakt} style={{ padding: '0.5rem 1.25rem', background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.5)', borderRadius: 8, color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
            Hinzufügen
          </button>
          {msg && <span style={{ fontSize: '0.85rem', color: msg.startsWith('✅') ? '#22c55e' : '#f87171' }}>{msg}</span>}
        </div>
      </div>

      {/* Liste */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: s.text, margin: 0 }}>
          Kontakte ({kontakte.length})
        </h3>
        {kontakte.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={druckeAdressliste} style={{ padding: '0.4rem 1rem', background: `${s.accent}18`, border: `1px solid ${s.accent}44`, borderRadius: 8, color: s.accent, fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>🖨️ Liste drucken</button>
            <button type="button" onClick={exportCsv} style={{ padding: '0.4rem 1rem', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 8, color: '#fbbf24', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>⬇️ CSV Export</button>
          </div>
        )}
      </div>

      {kontakte.length === 0 ? (
        <p style={{ color: s.muted, fontSize: '0.88rem' }}>Noch keine Kontakte. Ersten Kontakt oben hinzufügen.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {kontakte.map((k: any) => (
            <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: s.bgCard, border: `1px solid ${s.accent}18`, borderRadius: 10, flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontWeight: 700, color: s.text, fontSize: '0.9rem' }}>{k.name}</span>
                <span style={{ color: s.muted, fontSize: '0.85rem', marginLeft: 10 }}>{k.email}</span>
                <span style={{ fontSize: '0.75rem', background: `${s.accent}15`, color: s.accent, borderRadius: 20, padding: '2px 8px', marginLeft: 8 }}>{k.kategorie}</span>
              </div>
              <button type="button" onClick={() => removeKontakt(k.id)} style={{ padding: '0.2rem 0.5rem', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 6, color: '#f87171', fontSize: '0.8rem', cursor: 'pointer' }}>✕</button>
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
