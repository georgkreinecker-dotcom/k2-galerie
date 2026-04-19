/** Gemeinsam für Teilen/QR: lokaler Dev-Server liefert nie erreichbare Links fürs Handy. */
export function isLocalOrPrivateOrigin(): boolean {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.') || h.startsWith('10.')
}
