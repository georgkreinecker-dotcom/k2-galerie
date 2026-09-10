/**
 * 100 Generationen – gemeinsame Quelle für KI-Entwürfe (Bild + 3D-Skizze).
 * Eine Liste, viele Aufrufer (Konzeptseite, Entwurfsmappe).
 */

export type HundredGenerationModellId =
  | 'chaosgott'
  | 'axt-anker'
  | 'metamorphose'
  | 'code-muster'
  | 'drei-elemente'

export type HundredGenerationEntwurf = {
  id: HundredGenerationModellId
  title: string
  note: string
  src: string
  /** Kurz für 3D-Hinweis */
  formHint: string
}

export const HUNDRED_GENERATION_MODELLE: readonly HundredGenerationEntwurf[] = [
  {
    id: 'chaosgott',
    title: '1 · Chaosgott',
    note: 'Rohmasse, eruptiv',
    src: '/100-generation/entwurf-01-chaosgott.png',
    formHint: 'Formlose Masse – Ur-Chaos',
  },
  {
    id: 'axt-anker',
    title: '2 · Axt-Anker',
    note: 'Di Kurugu, abstrahiert',
    src: '/100-generation/entwurf-02-axt-anker.png',
    formHint: 'Zeremonial-Silhouette, historischer Anker',
  },
  {
    id: 'metamorphose',
    title: '3 · Metamorphose',
    note: 'Chaos → Muster',
    src: '/100-generation/entwurf-03-metamorphose.png',
    formHint: 'Übergang: unten roh, oben geordnet',
  },
  {
    id: 'code-muster',
    title: '4 · Code-Muster',
    note: 'Flechtwerk / Ordnung',
    src: '/100-generation/entwurf-04-code-muster.png',
    formHint: 'Geschlossenes Muster – Code',
  },
  {
    id: 'drei-elemente',
    title: '5 · Drei Elemente',
    note: 'modulares Volumen',
    src: '/100-generation/entwurf-05-drei-elemente.png',
    formHint: 'Drei plastische Teile als Baugruppe',
  },
] as const

export const HUNDRED_GENERATION_UEBERSICHTEN = [
  {
    id: 'varianten-abc',
    title: 'Übersicht A / B / C',
    note: 'drei Varianten',
    src: '/100-generation/uebersicht-varianten-abc.png',
  },
  {
    id: 'ausstellungsraum',
    title: 'Ausstellungsraum',
    note: 'Serie im Raum',
    src: '/100-generation/uebersicht-ausstellungsraum.png',
  },
] as const

export const ENTWURFSMAPPE_NOTES_KEY = 'k2-100g-entwurfsmappe-notes'
