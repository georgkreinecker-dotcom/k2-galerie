/**
 * K2 Familie – Lebensphasen-Fotos einer Person.
 * Das „zeitaktuelle“ Bild = die späteste Phase, für die ein Bild eingetragen ist (Alter → Erwachsen → Jugend → Kind),
 * sonst Fallback auf das Legacy-Feld `photo`.
 */
import type { K2FamiliePerson } from '../types/k2Familie'

function trimUrl(s: string | undefined): string | undefined {
  const t = String(s ?? '').trim()
  return t || undefined
}

/** Hauptbild für Stammbaum, Personenkarte, Gedenkort: neueste Lebensphase mit Bild, sonst `photo`. */
export function getAktuellesPersonenFoto(
  p: Pick<K2FamiliePerson, 'photoAlter' | 'photoErwachsen' | 'photoJugend' | 'photoKind' | 'photo'>
): string | undefined {
  return (
    trimUrl(p.photoAlter) ??
    trimUrl(p.photoErwachsen) ??
    trimUrl(p.photoJugend) ??
    trimUrl(p.photoKind) ??
    trimUrl(p.photo)
  )
}

/** Feld, aus dem das große „zeitaktuelle“ Bild kommt (gleiche Priorität wie getAktuellesPersonenFoto). */
export type LebensphaseFotoFeld = 'photoAlter' | 'photoErwachsen' | 'photoJugend' | 'photoKind'

export function getLebensphaseFeldFuerAktuellesFoto(
  p: Pick<K2FamiliePerson, 'photoAlter' | 'photoErwachsen' | 'photoJugend' | 'photoKind' | 'photo'>
): LebensphaseFotoFeld | 'legacy' {
  if (trimUrl(p.photoAlter)) return 'photoAlter'
  if (trimUrl(p.photoErwachsen)) return 'photoErwachsen'
  if (trimUrl(p.photoJugend)) return 'photoJugend'
  if (trimUrl(p.photoKind)) return 'photoKind'
  if (trimUrl(p.photo)) return 'legacy'
  return 'legacy'
}

/** Standard-Ziel, wenn noch kein Lebensphasen-Bild gesetzt ist (Hauptbild-Klick). */
export const DEFAULT_LEBENSPHASE_NEUES_FOTO: LebensphaseFotoFeld = 'photoAlter'

/** Prüft, ob die Zeichenkette eine im Browser öffenbare http(s)-URL ist (kein data:). */
export function isHttpUrlForExternalOpen(s: string | undefined): boolean {
  const t = String(s ?? '').trim()
  if (!t || t.startsWith('data:')) return false
  try {
    const u = new URL(t)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
