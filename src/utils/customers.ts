/**
 * Kundenerfassung – Galeriekunden (K2), später pro Mandant (ök2)
 * Einfaches Modell: Name, E-Mail, Telefon, Notizen. Für Verkauf und Ausstellungsbetrieb.
 */

export const CUSTOMERS_STORAGE_KEY = 'k2-customers'

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

function generateId(): string {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getCustomers(): Customer[] {
  try {
    const raw = localStorage.getItem(CUSTOMERS_STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function saveCustomers(customers: Customer[]): void {
  localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers))
  window.dispatchEvent(new CustomEvent('customers-updated'))
}

export function getCustomerById(id: string): Customer | undefined {
  return getCustomers().find(c => c.id === id)
}

export function createCustomer(partial: Pick<Customer, 'name'> & Partial<Pick<Customer, 'email' | 'phone' | 'notes'>>): Customer {
  const now = new Date().toISOString()
  const customer: Customer = {
    id: generateId(),
    name: String(partial.name || '').trim() || 'Unbekannt',
    email: partial.email?.trim() || undefined,
    phone: partial.phone?.trim() || undefined,
    notes: partial.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now
  }
  const list = getCustomers()
  list.push(customer)
  saveCustomers(list)
  return customer
}

export function updateCustomer(id: string, updates: Partial<Pick<Customer, 'name' | 'email' | 'phone' | 'notes'>>): Customer | null {
  const list = getCustomers()
  const idx = list.findIndex(c => c.id === id)
  if (idx < 0) return null
  const updated = {
    ...list[idx],
    ...updates,
    name: (updates.name != null ? String(updates.name).trim() : list[idx].name) || list[idx].name,
    email: updates.email !== undefined ? (updates.email?.trim() || undefined) : list[idx].email,
    phone: updates.phone !== undefined ? (updates.phone?.trim() || undefined) : list[idx].phone,
    notes: updates.notes !== undefined ? (updates.notes?.trim() || undefined) : list[idx].notes,
    updatedAt: new Date().toISOString()
  }
  list[idx] = updated
  saveCustomers(list)
  return updated
}

export function deleteCustomer(id: string): boolean {
  const list = getCustomers().filter(c => c.id !== id)
  if (list.length === getCustomers().length) return false
  saveCustomers(list)
  return true
}
