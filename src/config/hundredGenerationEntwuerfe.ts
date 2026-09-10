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
  | 'skizze-zwei-tuerme'
  | 'skizze-segel'
  | 'skizze-kelch'
  | 'skizze-astwerk'
  | 'skizze-zickzack'

export type HundredGenerationEntwurfGruppe = 'serie' | 'handskizze'

export type HundredGenerationEntwurf = {
  id: HundredGenerationModellId
  title: string
  note: string
  src: string
  /** Original-Handskizze (optional) */
  sketchSrc?: string
  formHint: string
  gruppe: HundredGenerationEntwurfGruppe
}

export const HUNDRED_GENERATION_MODELLE: readonly HundredGenerationEntwurf[] = [
  {
    id: 'chaosgott',
    title: '1 · Chaosgott',
    note: 'Rohmasse, eruptiv',
    src: '/100-generation/entwurf-01-chaosgott.png',
    formHint: 'Formlose Masse – Ur-Chaos',
    gruppe: 'serie',
  },
  {
    id: 'axt-anker',
    title: '2 · Axt-Anker',
    note: 'Di Kurugu, abstrahiert',
    src: '/100-generation/entwurf-02-axt-anker.png',
    formHint: 'Zeremonial-Silhouette, historischer Anker',
    gruppe: 'serie',
  },
  {
    id: 'metamorphose',
    title: '3 · Metamorphose',
    note: 'Chaos → Muster',
    src: '/100-generation/entwurf-03-metamorphose.png',
    formHint: 'Übergang: unten roh, oben geordnet',
    gruppe: 'serie',
  },
  {
    id: 'code-muster',
    title: '4 · Code-Muster',
    note: 'Flechtwerk / Ordnung',
    src: '/100-generation/entwurf-04-code-muster.png',
    formHint: 'Geschlossenes Muster – Code',
    gruppe: 'serie',
  },
  {
    id: 'drei-elemente',
    title: '5 · Drei Elemente',
    note: 'modulares Volumen',
    src: '/100-generation/entwurf-05-drei-elemente.png',
    formHint: 'Drei plastische Teile als Baugruppe',
    gruppe: 'serie',
  },
  {
    id: 'skizze-zwei-tuerme',
    title: 'S1 · Zwei Türme',
    note: 'aus deiner Handskizze',
    src: '/100-generation/aus-skizze-01-zwei-tuerme.png',
    sketchSrc: '/100-generation/skizzen/skizze-01-zwei-tuerme.jpg',
    formHint: 'Schwerer Körper mit Schlaufen, zwei aufrechte Elemente',
    gruppe: 'handskizze',
  },
  {
    id: 'skizze-segel',
    title: 'S2 · Segel',
    note: 'aus deiner Handskizze',
    src: '/100-generation/aus-skizze-02-segel.png',
    sketchSrc: '/100-generation/skizzen/skizze-02-segel.jpg',
    formHint: 'Blubber-Basis, scharfe Segel-Flossen oben',
    gruppe: 'handskizze',
  },
  {
    id: 'skizze-kelch',
    title: 'S3 · Kelch / Flügel',
    note: 'aus deiner Handskizze',
    src: '/100-generation/aus-skizze-03-kelch.png',
    sketchSrc: '/100-generation/skizzen/skizze-03-kelch.jpg',
    formHint: 'Bauchiger Fuß, schmaler Hals, V-Öffnung',
    gruppe: 'handskizze',
  },
  {
    id: 'skizze-astwerk',
    title: 'S4 · Astwerk',
    note: 'aus deiner Handskizze',
    src: '/100-generation/aus-skizze-04-astwerk.png',
    sketchSrc: '/100-generation/skizzen/skizze-04-astwerk.jpg',
    formHint: 'Stamm mit Ästen, Horn und Trompetenöffnung',
    gruppe: 'handskizze',
  },
  {
    id: 'skizze-zickzack',
    title: 'S5 · Zickzack',
    note: 'aus deiner Handskizze',
    src: '/100-generation/aus-skizze-05-zickzack.png',
    sketchSrc: '/100-generation/skizzen/skizze-05-zickzack.jpg',
    formHint: 'Geschachtelte V-/Chevron-Schalen, getürmt',
    gruppe: 'handskizze',
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
