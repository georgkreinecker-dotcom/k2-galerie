/**
 * Kassenbon-Breite (mm) pro Mandant – muss zur physischen Rolle passen (z. B. Brother QL Endlos 62 mm).
 * Shop/Kassa liest dieselben Werte wie Admin → Einstellungen → Drucker.
 */
import type { TenantId } from '../config/tenantConfig'

export function receiptPaperWidthStorageKey(tenantId: TenantId): string {
  return `k2-receipt-paper-width-mm-${tenantId}`
}

export function getReceiptPaperWidthMm(tenantId: TenantId): 62 | 80 {
  try {
    const v = localStorage.getItem(receiptPaperWidthStorageKey(tenantId))
    if (v === '62') return 62
    if (v === '80') return 80
  } catch {
    /* ignore */
  }
  return 80
}

export function setReceiptPaperWidthMm(tenantId: TenantId, mm: 62 | 80): void {
  try {
    localStorage.setItem(receiptPaperWidthStorageKey(tenantId), String(mm))
  } catch {
    /* ignore */
  }
}

/** Shop/Kassa: sichtbarer Mandant ohne „demo“. */
export function shopTenantIdForReceipt(fromOeffentlich: boolean, fromVk2: boolean): TenantId {
  if (fromVk2) return 'vk2'
  if (fromOeffentlich) return 'oeffentlich'
  return 'k2'
}
