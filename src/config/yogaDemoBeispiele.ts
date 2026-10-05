/**
 * Eine Quelle: Anschau-Beispiele der Gesprächsmappe.
 * Auf jeder Demo-Seite dieselbe Leiste – nach dem Öffnen bleiben alle sichtbar.
 */

import { PROJECT_ROUTES } from './navigation'
import { yogaKursPath } from './yogaKursStruktur'

export type YogaDemoBeispielId =
  | 'gespraechsmappe'
  | 'auftritt'
  | 'akademie'
  | 'kurs'
  | 'absolvent'

export type YogaDemoBeispiel = {
  id: YogaDemoBeispielId
  /** Kurzlabel in der Leiste */
  label: string
  /** Titel in der Mappe */
  titel: string
  text: string
  path: string
}

export function getYogaDemoBeispiele(): YogaDemoBeispiel[] {
  const r = PROJECT_ROUTES['k2-yoga']
  return [
    {
      id: 'gespraechsmappe',
      label: '📩 Mappe',
      titel: 'Gesprächsmappe',
      text: 'Zurück zum Überblick – System und Akademie in einem Dokument.',
      path: r.gespraechsmappe,
    },
    {
      id: 'auftritt',
      label: '👋 Auftritt',
      titel: 'Beispiel-Auftritt',
      text: 'Persönliches Haus im Netz – Farblinie Absolvent:in (Petrol).',
      path: r.willkommen,
    },
    {
      id: 'akademie',
      label: '🏫 Akademie',
      titel: 'Fläche Akademie',
      text: 'So arbeitet das Büro: Lehrgänge, Listen, Kurs öffnen.',
      path: r.akademie,
    },
    {
      id: 'kurs',
      label: '📖 Kurs',
      titel: 'Kurs-Oberfläche',
      text: 'Ein Lehrgang im Detail: Teilnehmer, Module, Abschluss.',
      path: yogaKursPath('lg-wels-2026'),
    },
    {
      id: 'absolvent',
      label: '🛠️ Absolvent:in',
      titel: 'Fläche Absolvent:in',
      text: 'Stunden und Angebote bearbeiten – eigene Farblinie Petrol, getrennt von der Akademie.',
      path: r.admin,
    },
  ]
}

/** Beispiele zum Anschauen (ohne die Mappe selbst) */
export function getYogaDemoAnschauBeispiele(): YogaDemoBeispiel[] {
  return getYogaDemoBeispiele().filter((b) => b.id !== 'gespraechsmappe')
}
