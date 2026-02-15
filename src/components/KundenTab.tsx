import { useMemo, useState, useEffect } from 'react'
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type Customer
} from '../utils/customers'

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
    <div className="card">
      <h2>Galeriekunden</h2>
      <p className="meta">Kunden für Verkauf, Einladungen und Ausstellungsbetrieb. Beim Verkauf in der Kasse kannst du einen Kunden zuordnen.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Suchen (Name, E-Mail, Telefon, Notizen…)"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1', minWidth: '200px' }}
        />
        <button type="button" className="primary-btn" onClick={() => { setShowNewForm(true); setShowBulkForm(false); setEditingId(null); setFormName(''); setFormEmail(''); setFormPhone(''); setFormNotes('') }}>
          + Neuer Kunde
        </button>
        <button type="button" className="primary-btn" style={{ background: 'rgba(95, 251, 241, 0.2)', border: '1px solid rgba(95, 251, 241, 0.5)', color: '#5ffbf1' }} onClick={() => { setShowBulkForm(!showBulkForm); if (!showBulkForm) setShowNewForm(false) }}>
          📋 Aus Liste importieren
        </button>
      </div>

      {showBulkForm && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(95, 251, 241, 0.06)', borderRadius: '10px', border: '1px solid rgba(95, 251, 241, 0.25)' }}>
          <h3 style={{ marginTop: 0, fontSize: '1rem', color: '#5ffbf1' }}>Mehrere Kunden aus Liste (z. B. WhatsApp-Gruppe)</h3>
          <p className="meta" style={{ marginBottom: '0.75rem' }}>Eine Zeile = ein Kunde. Excel: Spalten in Excel markieren, kopieren, hier einfügen – Tabulator wird erkannt.</p>
          <textarea value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} placeholder={'Name  Tab  Telefon  Tab  E-Mail\nOder: Max Mustermann\nLisa Beispiel, 0664 1234567'} rows={6} style={{ width: '100%', maxWidth: '600px', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.95rem' }} />
          <div className="field" style={{ marginTop: '0.75rem', maxWidth: '400px' }}>
            <label>Gemeinsame Notiz für alle (z. B. „WhatsApp Gruppe Vernissage“)</label>
            <input type="text" value={bulkNotes} onChange={(e) => setBulkNotes(e.target.value)} placeholder="Optional" style={{ width: '100%' }} />
          </div>
          {bulkPreview.length > 0 && <p className="meta" style={{ marginTop: '0.5rem', color: '#5ffbf1' }}>Vorschau: <strong>{bulkPreview.length}</strong> Kunden werden angelegt.</p>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" className="primary-btn" onClick={handleBulkCreate} disabled={bulkPreview.length === 0}>Alle anlegen ({bulkPreview.length})</button>
            <button type="button" className="ghost-btn" onClick={() => { setShowBulkForm(false); setBulkInput(''); setBulkNotes('') }}>Abbrechen</button>
          </div>
        </div>
      )}

      {showNewForm && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)' }}>
          <h3 style={{ marginTop: 0, fontSize: '1rem' }}>Neuer Kunde</h3>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="field"><label>Name *</label><input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Name oder Firma" /></div>
            <div className="field"><label>E-Mail</label><input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@beispiel.at" /></div>
            <div className="field"><label>Telefon</label><input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="0664 123456" /></div>
          </div>
          <div className="field"><label>Notizen</label><textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Optional" rows={2} /></div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button type="button" className="primary-btn" onClick={handleNew}>Speichern</button>
            <button type="button" className="ghost-btn" onClick={() => { setShowNewForm(false); cancelEdit() }}>Abbrechen</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="meta">{customers.length === 0 ? 'Noch keine Kunden. Leg einen an – z. B. für Vernissage-Gäste oder Käufer.' : 'Keine Treffer zur Suche.'}</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {filtered.map((c) => (
            <li key={c.id} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
              {editingId === c.id ? (
                <>
                  <div className="form-grid" style={{ flex: '1 1 100%', gridTemplateColumns: '1fr 1fr' }}>
                    <div className="field"><label>Name</label><input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} /></div>
                    <div className="field"><label>E-Mail</label><input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} /></div>
                    <div className="field"><label>Telefon</label><input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} /></div>
                    <div className="field"><label>Notizen</label><input type="text" value={formNotes} onChange={(e) => setFormNotes(e.target.value)} /></div>
                  </div>
                  <button type="button" className="primary-btn" onClick={saveEdit}>Speichern</button>
                  <button type="button" className="ghost-btn" onClick={cancelEdit}>Abbrechen</button>
                </>
              ) : (
                <>
                  <strong style={{ minWidth: '140px' }}>{c.name}</strong>
                  {c.email && <span style={{ fontSize: '0.9rem', color: '#8fa0c9' }}>{c.email}</span>}
                  {c.phone && <span style={{ fontSize: '0.9rem', color: '#8fa0c9' }}>{c.phone}</span>}
                  {c.notes && <span style={{ fontSize: '0.85rem', color: '#8fa0c9', fontStyle: 'italic' }}>{c.notes}</span>}
                  <span style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem' }}>
                    <button type="button" className="ghost-btn" style={{ fontSize: '0.85rem' }} onClick={() => startEdit(c)}>Bearbeiten</button>
                    <button type="button" className="ghost-btn" style={{ fontSize: '0.85rem', color: '#e08888' }} onClick={() => handleDelete(c.id)}>Löschen</button>
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
