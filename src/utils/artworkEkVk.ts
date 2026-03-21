/**
 * Werkkarte / Lager: eine EK-Zeile (Einkauf) und eine VK-Zeile (Verkauf).
 * Kein oder kein positiver EK → Anzeige „Eigenproduktion“.
 */

export function formatEkAnzeige(purchasePrice: unknown): string {
  const n =
    typeof purchasePrice === 'number'
      ? purchasePrice
      : parseFloat(String(purchasePrice ?? '').replace(',', '.'))
  if (!Number.isFinite(n) || n <= 0) return 'Eigenproduktion'
  return `€ ${n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function parseEkFromForm(value: string): number | undefined {
  const n = parseFloat(String(value ?? '').replace(',', '.'))
  if (!Number.isFinite(n) || n <= 0) return undefined
  return n
}
