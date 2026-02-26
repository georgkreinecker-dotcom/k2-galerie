/**
 * Empfehler-ID für das Empfehlungs-Programm.
 * Eindeutige ID pro Nutzer:in (lizenzierter Klient), wird einmal erzeugt und in localStorage gehalten.
 * Später: Backend vergibt feste ID; hier Fallback für lokale Nutzung.
 */

const STORAGE_KEY = 'k2-empfehler-id'
const PREFIX = 'K2-E-'
const ID_LENGTH = 6
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomId(): string {
  let s = ''
  for (let i = 0; i < ID_LENGTH; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return s
}

/**
 * Liest die gespeicherte Empfehler-ID oder erzeugt eine neue und speichert sie.
 */
export function getOrCreateEmpfehlerId(): string {
  if (typeof window === 'undefined') return PREFIX + '------'
  try {
    let id = localStorage.getItem(STORAGE_KEY)
    if (id && id.startsWith(PREFIX) && id.length === PREFIX.length + ID_LENGTH) {
      return id
    }
    id = PREFIX + randomId()
    localStorage.setItem(STORAGE_KEY, id)
    return id
  } catch (_) {
    return PREFIX + randomId()
  }
}

/**
 * Nur lesen, keine Erzeugung.
 */
export function getEmpfehlerId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const id = localStorage.getItem(STORAGE_KEY)
    return id && id.startsWith(PREFIX) ? id : null
  } catch (_) {
    return null
  }
}

/** Prüft, ob eine eingegebene Empfehler-ID das gültige Format hat (K2-E- + 6 Zeichen). */
export function isValidEmpfehlerIdFormat(id: string): boolean {
  const trimmed = (id || '').trim()
  return trimmed.startsWith(PREFIX) && trimmed.length === PREFIX.length + ID_LENGTH
}
