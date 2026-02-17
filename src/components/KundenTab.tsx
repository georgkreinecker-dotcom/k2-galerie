import { useMemo, useState, useEffect } from 'react'
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type Customer
} from '../utils/customers'
import { WERBEUNTERLAGEN_STIL } from '../config/marketingWerbelinie'

const s = WERBEUNTERLAGEN_STIL

function parseBulkLine(line: string): { name: string; phone?: string; email?: string } {
  const t = line.trim()
  if (!t) return { name: '' }
  if (t.includes('\t')) {
    const parts = t.split(/\t/).map(s => s.trim()).filter(Boolean)
    const name = parts[0] || t
    let phone: string | undefined
    let email: string | undefined
    if (parts[1]) { if (parts[1].includes('@')) email = parts[1]; else phone = parts[1] }
    if (parts[2]) { if (parts[2].includes('@')) email = parts[2]; else phone = parts[2] }
    return { name, phone, email }
  }
  if (t.includes(',') || t.includes(';')) {
    const parts = t.split(/[,;]/).map(s => s.trim()).filter(Boolean)
    const name = parts[0] || t
    let phone: string | undefined
    let email: string | undefined
    if (parts[1]) { if (parts[1].includes('@')) email = parts[1]; else phone = parts[1] }
    if (parts[2]) { if (parts[2].includes('@')) email = parts[2]; else phone = parts[2] }
    return { name, phone, email }
  }
  const phoneMatch = t.match(/\s*([+]?\d[\d\s\-/]{7,})$/)
  if (phoneMatch) return { name: t.slice(0, phoneMatch.index).trim() || t, phone: phoneMatch[1].trim() }
  return { name: t }
}

export function KundenTab() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [bulkInput, setBulkInput] = useState('')
  const [bulkNotes, setBulkNotes] = useState('')
  const [showBulkForm, setShowBulkForm] = useState(false)

  const loadCustomers = () => setCustomers(getCustomers())

  useEffect(() => {
    loadCustomers()
    const onUpdate = () => loadCustomers()
    window.addEventListener('customers-updated', onUpdate)
    return () => window.removeEventListener('customers-updated', onUpdate)
  }, [])

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return customers
    const q = searchQuery.toLowerCase()
    return customers.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.notes || '').toLowerCase().includes(q)
    )
  }, [customers, searchQuery])

  const bulkPreview = useMemo(() => {
    const lines = bulkInput.split(/\n/).map(s => s.trim()).filter(Boolean)
    return lines.map(line => ({ line, ...parseBulkLine(line) })).filter(p => p.name)
  }, [bulkInput])

  const handleBulkCreate = () => {
    if (bulkPreview.length === 0) return
    const notes = bulkNotes.trim() || undefined
    bulkPreview.forEach(({ name, phone, email }) => createCustomer({ name, phone, email, notes }))
    setBulkInput('')
    setBulkNotes('')
    setShowBulkForm(false)
    loadCustomers()
    alert(`${bulkPreview.length} Kunden angelegt.${notes ? ` Notiz: ${notes}` : ''}`)
  }

  const startEdit = (c: Customer) => {
    setEditingId(c.id)
    setFormName(c.name)
    setFormEmail(c.email || '')
    setFormPhone(c.phone || '')
    setFormNotes(c.notes || '')
    setShowNewForm(false)
  }

  const saveEdit = () => {
    if (!editingId) return
    updateCustomer(editingId, { name: formName, email: formEmail || undefined, phone: formPhone || undefined, notes: formNotes || undefined })
    setEditingId(null)
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormNotes('')
    loadCustomers()
  }

  const cancelEdit = () => {
    setEditingId(null)
    setShowNewForm(false)
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormNotes('')
  }

  const handleNew = () => {
    if (!formName.trim()) { alert('Bitte mindestens einen Namen eingeben.'); return }
    createCustomer({ name: formName, email: formEmail || undefined, phone: formPhone || undefined, notes: formNotes || undefined })
    setFormName('')
    setFormEmail('')
    setFormPhone('')
    setFormNotes('')
    setShowNewForm(false)
    loadCustomers()
  }

  const handleDelete = (id: string) => {
    if (!confirm('Kunde wirklich löschen?')) return
    deleteCustomer(id)
    loadCustomers()
    if (editingId === id) cancelEdit()
  }

  return (
    <div style={{ background: s.bgCard, padding: '1.6rem 1.8rem', borderRadius: 18, boxShadow: s.shadow, border: `1px solid ${s.accent}22` }}>
      <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: s.text }}>Galeriekunden</h2>
      <p style={{ margin: '0.5rem 0 1rem', color: s.muted, fontSize: '0.95rem', lineHeight: 1.5 }}>Kunden für Verkauf, Einladungen und Ausstellungsbetrieb. Beim Verkauf in der Kasse kannst du einen Kunden zuordnen.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Suchen (Name, E-Mail, Telefon, Notizen…)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, minWidth: '200px', padding: '0.6rem 0.8rem', borderRadius: 10, border: `1px solid ${s.accent}33`, background: s.bgElevated, color: s.text, fontSize: '0.95rem' }}
        />
        <button type="button" onClick={() => { setShowNewForm(true); setShowBulkForm(false); setEditingId(null); setFormName(''); setFormEmail(''); setFormPhone(''); setFormNotes('') }} style={{ padding: '0.5rem 1rem', background: s.gradientAccent, border: 'none', borderRadius: 10, color: '#fff', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}>
          + Neuer Kunde
        </button>
        <button type="button" onClick={() => { setShowBulkForm(!showBulkForm); if (!showBulkForm) setShowNewForm(false) }} style={{ padding: '0.5rem 1rem', background: `${s.accent}18`, border: `1px solid ${s.accent}55`, borderRadius: 10, color: s.accent, fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}>
          📋 Aus Liste importieren
        </button>
      </div>

      {showBulkForm && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: `${s.accent}0c`, borderRadius: 10, border: `1px solid ${s.accent}33` }}>
          <h3 style={{ marginTop: 0, fontSize: '1rem', color: s.accent, fontWeight: '600' }}>Mehrere Kunden aus Liste (z. B. WhatsApp-Gruppe)</h3>
          <p style={{ marginBottom: '0.75rem', color: s.muted, fontSize: '0.9rem' }}>Eine Zeile = ein Kunde. Excel: Spalten in Excel markieren, kopieren, hier einfügen – Tabulator wird erkannt.</p>
          <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} placeholder={'Name  Tab  Telefon  Tab  E-Mail\nOder: Max Mustermann\nLisa Beispiel, 0664 1234567'} rows={6} style={{ width: '100%', maxWidth: '600px', padding: '0.75rem', borderRadius: 8, border: `1px solid ${s.accent}33`, background: s.bgElevated, color: s.text, fontSize: '0.95rem' }} />
          <div style={{ marginTop: '0.75rem', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', color: s.muted }}>Gemeinsame Notiz für alle (z. B. „WhatsApp Gruppe Vernissage“)</label>
            <input type="text" value={bulkNotes} onChange={(e) => setBulkNotes(e.target.value)} placeholder="Optional" style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: 10, border: `1px solid ${s.accent}33`, background: s.bgElevated, color: s.text, fontSize: '0.95rem' }} />
          </div>
          {bulkPreview.length > 0 && <p style={{ marginTop: '0.5rem', color: s.accent, fontSize: '0.9rem' }}>Vorschau: <strong>{bulkPreview.length}</strong> Kunden werden angelegt.</p>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={handleBulkCreate} disabled={bulkPreview.length === 0} style={{ padding: '0.5rem 1rem', background: s.gradientAccent, border: 'none', borderRadius: 10, color: '#fff', fontSize: '0.95rem', fontWeight: '600', cursor: bulkPreview.length === 0 ? 'not-allowed' : 'pointer', opacity: bulkPreview.length === 0 ? 0.6 : 1 }}>Alle anlegen ({bulkPreview.length})</button>
            <button type="button" onClick={() => { setShowBulkForm(false); setBulkInput(''); setBulkNotes('') }} style={{ padding: '0.5rem 1rem', background: s.bgElevated, border: `1px solid ${s.accent}40`, borderRadius: 10, color: s.text, fontSize: '0.95rem', cursor: 'pointer' }}>Abbrechen</button>
          </div>
        </div>
      )}

      {showNewForm && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: s.bgElevated, borderRadius: 10, border: `1px solid ${s.accent}22` }}>
          <h3 style={{ marginTop: 0, fontSize: '1rem', color: s.text, fontWeight: '600' }}>Neuer Kunde</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.85rem', color: s.muted }}>Name *</label><input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Name oder Firma" style={{ padding: '0.6rem 0.75rem', borderRadius: 10, border: `1px solid ${s.accent}33`, background: s.bgCard, color: s.text, fontSize: '0.95rem' }} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.85rem', color: s.muted }}>E-Mail</label><input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@beispiel.at" style={{ padding: '0.6rem 0.75rem', borderRadius: 10, border: `1px solid ${s.accent}33`, background: s.bgCard, color: s.text, fontSize: '0.95rem' }} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.85rem', color: s.muted }}>Telefon</label><input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="0664 123456" style={{ padding: '0.6rem 0.75rem', borderRadius: 10, border: `1px solid ${s.accent}33`, background: s.bgCard, color: s.text, fontSize: '0.95rem' }} /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.75rem' }}><label style={{ fontSize: '0.85rem', color: s.muted }}>Notizen</label><textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Optional" rows={2} style={{ padding: '0.6rem 0.75rem', borderRadius: 10, border: `1px solid ${s.accent}33`, background: s.bgCard, color: s.text, fontSize: '0.95rem' }} /></div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button type="button" onClick={handleNew} style={{ padding: '0.5rem 1rem', background: s.gradientAccent, border: 'none', borderRadius: 10, color: '#fff', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}>Speichern</button>
            <button type="button" onClick={() => { setShowNewForm(false); cancelEdit() }} style={{ padding: '0.5rem 1rem', background: s.bgElevated, border: `1px solid ${s.accent}40`, borderRadius: 10, color: s.text, fontSize: '0.95rem', cursor: 'pointer' }}>Abbrechen</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p style={{ color: s.muted, fontSize: '0.95rem' }}>{customers.length === 0 ? 'Noch keine Kunden. Leg einen an – z. B. für Vernissage-Gäste oder Käufer.' : 'Keine Treffer zur Suche.'}</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {filtered.map((c) => (
            <li key={c.id} style={{ background: s.bgElevated, border: `1px solid ${s.accent}22`, borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
              {editingId === c.id ? (
                <>
                  <div style={{ flex: '1 1 100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.85rem', color: s.muted }}>Name</label><input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} style={{ padding: '0.6rem 0.75rem', borderRadius: 10, border: `1px solid ${s.accent}33`, background: s.bgCard, color: s.text, fontSize: '0.95rem' }} /></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.85rem', color: s.muted }}>E-Mail</label><input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} style={{ padding: '0.6rem 0.75rem', borderRadius: 10, border: `1px solid ${s.accent}33`, background: s.bgCard, color: s.text, fontSize: '0.95rem' }} /></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.85rem', color: s.muted }}>Telefon</label><input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} style={{ padding: '0.6rem 0.75rem', borderRadius: 10, border: `1px solid ${s.accent}33`, background: s.bgCard, color: s.text, fontSize: '0.95rem' }} /></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}><label style={{ fontSize: '0.85rem', color: s.muted }}>Notizen</label><input type="text" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} style={{ padding: '0.6rem 0.75rem', borderRadius: 10, border: `1px solid ${s.accent}33`, background: s.bgCard, color: s.text, fontSize: '0.95rem' }} /></div>
                  </div>
                  <button type="button" onClick={saveEdit} style={{ padding: '0.5rem 1rem', background: s.gradientAccent, border: 'none', borderRadius: 10, color: '#fff', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}>Speichern</button>
                  <button type="button" onClick={cancelEdit} style={{ padding: '0.5rem 1rem', background: s.bgCard, border: `1px solid ${s.accent}40`, borderRadius: 10, color: s.text, fontSize: '0.95rem', cursor: 'pointer' }}>Abbrechen</button>
                </>
              ) : (
                <>
                  <strong style={{ minWidth: '140px', color: s.text }}>{c.name}</strong>
                  {c.email && <span style={{ fontSize: '0.9rem', color: s.muted }}>{c.email}</span>}
                  {c.phone && <span style={{ fontSize: '0.9rem', color: s.muted }}>{c.phone}</span>}
                  {c.notes && <span style={{ fontSize: '0.85rem', color: s.muted, fontStyle: 'italic' }}>{c.notes}</span>}
                  <span style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem' }}>
                    <button type="button" style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', background: s.bgCard, border: `1px solid ${s.accent}40`, borderRadius: 8, color: s.accent, cursor: 'pointer' }} onClick={() => startEdit(c)}>Bearbeiten</button>
                    <button type="button" style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', background: 'transparent', border: '1px solid #c53030', borderRadius: 8, color: '#c53030', cursor: 'pointer' }} onClick={() => handleDelete(c.id)}>Löschen</button>
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
