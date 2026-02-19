/**
 * Kundenerfassung – Galeriekunden (K2), VK2 = Mitglieder (k2-vk2-customers)
 * Einfaches Modell: Name, E-Mail, Telefon, Notizen. Für Verkauf und Ausstellungsbetrieb / Vereinsmitglieder.
 */

export const CUSTOMERS_STORAGE_KEY = 'k2-customers'
export const VK2_CUSTOMERS_STORAGE_KEY = 'k2-vk2-customers'

export type CustomersScope = 'k2' | 'vk2'

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  notes?: string
  /** VK2: Kunstbereich (malerei, keramik, …) */
  category?: string
  /** VK2: Vereins-Admin (Vollversion / Admin-Zugang) */
  hasFullAdmin?: boolean
  createdAt: string
  updatedAt: string
}

function generateId(): string {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getStorageKeyForScope(scope?: CustomersScope): string {
  return scope === 'vk2' ? VK2_CUSTOMERS_STORAGE_KEY : CUSTOMERS_STORAGE_KEY
}

export function getCustomers(scope?: CustomersScope): Customer[] {
  const key = getStorageKeyForScope(scope)
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function saveCustomers(customers: Customer[], scope?: CustomersScope): void {
  const key = getStorageKeyForScope(scope)
  localStorage.setItem(key, JSON.stringify(customers))
  window.dispatchEvent(new CustomEvent('customers-updated'))
}

export function getCustomerById(id: string, scope?: CustomersScope): Customer | undefined {
  return getCustomers(scope).find(c => c.id === id)
}

export function createCustomer(partial: Pick<Customer, 'name'> & Partial<Pick<Customer, 'email' | 'phone' | 'notes' | 'category' | 'hasFullAdmin'>>, scope?: CustomersScope): Customer {
  const now = new Date().toISOString()
  const customer: Customer = {
    id: generateId(),
    name: String(partial.name || '').trim() || 'Unbekannt',
    email: partial.email?.trim() || undefined,
    phone: partial.phone?.trim() || undefined,
    notes: partial.notes?.trim() || undefined,
    category: partial.category,
    hasFullAdmin: partial.hasFullAdmin,
    createdAt: now,
    updatedAt: now
  }
  const list = getCustomers(scope)
  list.push(customer)
  saveCustomers(list, scope)
  return customer
}

export function updateCustomer(id: string, updates: Partial<Pick<Customer, 'name' | 'email' | 'phone' | 'notes' | 'category' | 'hasFullAdmin'>>, scope?: CustomersScope): Customer | null {
  const list = getCustomers(scope)
  const idx = list.findIndex(c => c.id === id)
  if (idx < 0) return null
  const updated = {
    ...list[idx],
    ...updates,
    name: (updates.name != null ? String(updates.name).trim() : list[idx].name) || list[idx].name,
    email: updates.email !== undefined ? (updates.email?.trim() || undefined) : list[idx].email,
    phone: updates.phone !== undefined ? (updates.phone?.trim() || undefined) : list[idx].phone,
    notes: updates.notes !== undefined ? (updates.notes?.trim() || undefined) : list[idx].notes,
    category: updates.category !== undefined ? updates.category : list[idx].category,
    hasFullAdmin: updates.hasFullAdmin !== undefined ? updates.hasFullAdmin : list[idx].hasFullAdmin,
    updatedAt: new Date().toISOString()
  }
  list[idx] = updated
  saveCustomers(list, scope)
  return updated
}

export function deleteCustomer(id: string, scope?: CustomersScope): boolean {
  const list = getCustomers(scope).filter(c => c.id !== id)
  if (list.length === getCustomers(scope).length) return false
  saveCustomers(list, scope)
  return true
}
