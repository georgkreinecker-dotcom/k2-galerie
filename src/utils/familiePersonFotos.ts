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
