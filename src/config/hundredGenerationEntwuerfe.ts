/**
 * 100 Generationen – gemeinsame Quelle für Entwürfe (Bild-Ansichten).
 * Eine Liste, viele Aufrufer (Konzeptseite, Entwurfsmappe).
 * Drehen (Ring) + Schwenken (Schräg von oben) als echte Fotos.
 */

export type HundredGenerationModellId =
  | 'chaosgott'
  | 'axt-anker'
  | 'metamorphose'
  | 'code-muster'
  | 'drei-elemente'
  | 'chaosgott-mythos'
  | 'axt-ritual-mythos'
  | 'metamorphose-mythos'
  | 'code-ahnen-mythos'
  | 'drei-rituale-mythos'
  | 'skizze-zwei-tuerme'
  | 'skizze-segel'
  | 'skizze-kelch'
  | 'skizze-astwerk'
  | 'skizze-zickzack'
  | 'skizze-spirale'
  | 'skizze-spirale-kopf'

export type HundredGenerationEntwurfGruppe = 'serie' | 'mythos' | 'handskizze'

export type HundredGenerationAnsichtId = 'vorne' | 'seite' | 'hinten' | 'schraeg'

export type HundredGenerationAnsicht = {
  id: HundredGenerationAnsichtId
  label: string
  src: string
  /** Ring = horizontal drehen; schwenk = nach oben schwenken */
  achse: 'ring' | 'schwenk'
}

export type HundredGenerationEntwurf = {
  id: HundredGenerationModellId
  title: string
  note: string
  /** Hauptansicht (Vorne) – auch als src für Galerien */
  src: string
  sketchSrc?: string
  formHint: string
  gruppe: HundredGenerationEntwurfGruppe
  /** Bei Mythos-Varianten: zugehöriger Basis-Entwurf der Serie Chaos & Code */
  baseId?: HundredGenerationModellId
  ansichten: readonly HundredGenerationAnsicht[]
}

function views(
  vorne: string,
  seite: string,
  opts?: { hinten?: string; schraeg?: string }
): readonly HundredGenerationAnsicht[] {
  const list: HundredGenerationAnsicht[] = [
    { id: 'vorne', label: 'Vorne', src: vorne, achse: 'ring' },
    { id: 'seite', label: 'Seite', src: seite, achse: 'ring' },
  ]
  if (opts?.hinten) {
    list.push({ id: 'hinten', label: 'Hinten', src: opts.hinten, achse: 'ring' })
  }
  if (opts?.schraeg) {
    list.push({ id: 'schraeg', label: 'Schräg oben', src: opts.schraeg, achse: 'schwenk' })
  }
  return list
}

export function ringAnsichten(
  ansichten: readonly HundredGenerationAnsicht[]
): readonly HundredGenerationAnsicht[] {
  return ansichten.filter((a) => a.achse === 'ring')
}

export function schwenkAnsicht(
  ansichten: readonly HundredGenerationAnsicht[]
): HundredGenerationAnsicht | undefined {
  return ansichten.find((a) => a.achse === 'schwenk')
}

export const HUNDRED_GENERATION_MODELLE: readonly HundredGenerationEntwurf[] = [
  {
    id: 'chaosgott',
    title: '1 · Chaosgott',
    note: 'Rohmasse, eruptiv',
    src: '/100-generation/entwurf-01-chaosgott.png',
    formHint: 'Formlose Masse – Ur-Chaos',
    gruppe: 'serie',
    ansichten: views(
      '/100-generation/entwurf-01-chaosgott.png',
      '/100-generation/entwurf-01-chaosgott-seite.png',
      {
        hinten: '/100-generation/entwurf-01-chaosgott-hinten.png',
        schraeg: '/100-generation/entwurf-01-chaosgott-schraeg.png',
      }
    ),
  },
  {
    id: 'axt-anker',
    title: '2 · Axt-Anker',
    note: 'Di Kurugu, abstrahiert',
    src: '/100-generation/entwurf-02-axt-anker.png',
    formHint: 'Zeremonial-Silhouette, historischer Anker',
    gruppe: 'serie',
    ansichten: views(
      '/100-generation/entwurf-02-axt-anker.png',
      '/100-generation/entwurf-02-axt-anker-seite.png',
      { schraeg: '/100-generation/entwurf-02-axt-anker-schraeg.png' }
    ),
  },
  {
    id: 'metamorphose',
    title: '3 · Metamorphose',
    note: 'Chaos → Muster',
    src: '/100-generation/entwurf-03-metamorphose.png',
    formHint: 'Übergang: unten roh, oben geordnet',
    gruppe: 'serie',
    ansichten: views(
      '/100-generation/entwurf-03-metamorphose.png',
      '/100-generation/entwurf-03-metamorphose-seite.png',
      { schraeg: '/100-generation/entwurf-03-metamorphose-schraeg.png' }
    ),
  },
  {
    id: 'code-muster',
    title: '4 · Code-Muster',
    note: 'Flechtwerk / Ordnung',
    src: '/100-generation/entwurf-04-code-muster.png',
    formHint: 'Geschlossenes Muster – Code',
    gruppe: 'serie',
    ansichten: views(
      '/100-generation/entwurf-04-code-muster.png',
      '/100-generation/entwurf-04-code-muster-seite.png',
      { schraeg: '/100-generation/entwurf-04-code-muster-schraeg.png' }
    ),
  },
  {
    id: 'drei-elemente',
    title: '5 · Drei Elemente',
    note: 'modulares Volumen',
    src: '/100-generation/entwurf-05-drei-elemente.png',
    formHint: 'Drei plastische Teile als Baugruppe',
    gruppe: 'serie',
    ansichten: views(
      '/100-generation/entwurf-05-drei-elemente.png',
      '/100-generation/entwurf-05-drei-elemente-seite.png',
      { schraeg: '/100-generation/entwurf-05-drei-elemente-schraeg.png' }
    ),
  },
  {
    id: 'chaosgott-mythos',
    title: '1M · Chaosgott · Ahnen-Axt',
    note: 'Di Kurugu · Mythos',
    src: '/100-generation/entwurf-01m-chaosgott-mythos.png',
    formHint: 'Aus dem Ur-Chaos tritt die Zeremonialaxt – Ahnengeist des Hochlands',
    gruppe: 'mythos',
    baseId: 'chaosgott',
    ansichten: views(
      '/100-generation/entwurf-01m-chaosgott-mythos.png',
      '/100-generation/entwurf-01m-chaosgott-mythos-seite.png',
      { schraeg: '/100-generation/entwurf-01m-chaosgott-mythos-schraeg.png' }
    ),
  },
  {
    id: 'axt-ritual-mythos',
    title: '2M · Axt · Ritual-Insignie',
    note: 'Di Kurugu · Clan-Aufnahme',
    src: '/100-generation/entwurf-02m-axt-ritual-mythos.png',
    formHint: 'Zeremonialaxt als Zeichen der Aufnahme – Flechtwerk und Totem',
    gruppe: 'mythos',
    baseId: 'axt-anker',
    ansichten: views(
      '/100-generation/entwurf-02m-axt-ritual-mythos.png',
      '/100-generation/entwurf-02m-axt-ritual-mythos-seite.png',
      { schraeg: '/100-generation/entwurf-02m-axt-ritual-mythos-schraeg.png' }
    ),
  },
  {
    id: 'metamorphose-mythos',
    title: '3M · Metamorphose · Wissen',
    note: 'Di Kurugu · Wendepunkt',
    src: '/100-generation/entwurf-03m-metamorphose-mythos.png',
    formHint: 'Unten Chaos, oben Axtschaft mit Ahnen-Flechtcode – Wissen wächst aus Erde',
    gruppe: 'mythos',
    baseId: 'metamorphose',
    ansichten: views(
      '/100-generation/entwurf-03m-metamorphose-mythos.png',
      '/100-generation/entwurf-03m-metamorphose-mythos-seite.png',
      { schraeg: '/100-generation/entwurf-03m-metamorphose-mythos-schraeg.png' }
    ),
  },
  {
    id: 'code-ahnen-mythos',
    title: '4M · Code · Ahnenraster',
    note: 'Di Kurugu · heiliges Muster',
    src: '/100-generation/entwurf-04m-code-ahnen-mythos.png',
    formHint: 'Ganzes Volumen als Flechtwerk – Generationen-Wissen als heiliger Code',
    gruppe: 'mythos',
    baseId: 'code-muster',
    ansichten: views(
      '/100-generation/entwurf-04m-code-ahnen-mythos.png',
      '/100-generation/entwurf-04m-code-ahnen-mythos-seite.png',
      { schraeg: '/100-generation/entwurf-04m-code-ahnen-mythos-schraeg.png' }
    ),
  },
  {
    id: 'drei-rituale-mythos',
    title: '5M · Drei Rituale',
    note: 'Di Kurugu · Dreiklang',
    src: '/100-generation/entwurf-05m-drei-rituale-mythos.png',
    formHint: 'Klinge · Flecht-Schaft · Clan-Zeichen – Opfer, Wissen, Zugehörigkeit',
    gruppe: 'mythos',
    baseId: 'drei-elemente',
    ansichten: views(
      '/100-generation/entwurf-05m-drei-rituale-mythos.png',
      '/100-generation/entwurf-05m-drei-rituale-mythos-seite.png',
      { schraeg: '/100-generation/entwurf-05m-drei-rituale-mythos-schraeg.png' }
    ),
  },
  {
    id: 'skizze-zwei-tuerme',
    title: 'S1 · Zwei Türme',
    note: 'aus deiner Handskizze',
    src: '/100-generation/aus-skizze-01-zwei-tuerme.png',
    sketchSrc: '/100-generation/skizzen/skizze-01-zwei-tuerme.jpg',
    formHint: 'Schwerer Körper mit Schlaufen, zwei aufrechte Elemente',
    gruppe: 'handskizze',
    ansichten: views(
      '/100-generation/aus-skizze-01-zwei-tuerme.png',
      '/100-generation/aus-skizze-01-zwei-tuerme-seite.png',
      { schraeg: '/100-generation/aus-skizze-01-zwei-tuerme-schraeg.png' }
    ),
  },
  {
    id: 'skizze-segel',
    title: 'S2 · Segel',
    note: 'aus deiner Handskizze',
    src: '/100-generation/aus-skizze-02-segel.png',
    sketchSrc: '/100-generation/skizzen/skizze-02-segel.jpg',
    formHint: 'Blubber-Basis, scharfe Segel-Flossen oben',
    gruppe: 'handskizze',
    ansichten: views(
      '/100-generation/aus-skizze-02-segel.png',
      '/100-generation/aus-skizze-02-segel-seite.png',
      { schraeg: '/100-generation/aus-skizze-02-segel-schraeg.png' }
    ),
  },
  {
    id: 'skizze-kelch',
    title: 'S3 · Kelch / Flügel',
    note: 'aus deiner Handskizze',
    src: '/100-generation/aus-skizze-03-kelch.png',
    sketchSrc: '/100-generation/skizzen/skizze-03-kelch.jpg',
    formHint: 'Bauchiger Fuß, schmaler Hals, V-Öffnung',
    gruppe: 'handskizze',
    ansichten: views(
      '/100-generation/aus-skizze-03-kelch.png',
      '/100-generation/aus-skizze-03-kelch-seite.png',
      { schraeg: '/100-generation/aus-skizze-03-kelch-schraeg.png' }
    ),
  },
  {
    id: 'skizze-astwerk',
    title: 'S4 · Astwerk',
    note: 'aus deiner Handskizze',
    src: '/100-generation/aus-skizze-04-astwerk.png',
    sketchSrc: '/100-generation/skizzen/skizze-04-astwerk.jpg',
    formHint: 'Stamm mit Ästen, Horn und Trompetenöffnung',
    gruppe: 'handskizze',
    ansichten: views(
      '/100-generation/aus-skizze-04-astwerk.png',
      '/100-generation/aus-skizze-04-astwerk-seite.png',
      { schraeg: '/100-generation/aus-skizze-04-astwerk-schraeg.png' }
    ),
  },
  {
    id: 'skizze-zickzack',
    title: 'S5 · Zickzack',
    note: 'aus deiner Handskizze',
    src: '/100-generation/aus-skizze-05-zickzack.png',
    sketchSrc: '/100-generation/skizzen/skizze-05-zickzack.jpg',
    formHint: 'Geschachtelte V-/Chevron-Schalen, getürmt',
    gruppe: 'handskizze',
    ansichten: views(
      '/100-generation/aus-skizze-05-zickzack.png',
      '/100-generation/aus-skizze-05-zickzack-seite.png',
      { schraeg: '/100-generation/aus-skizze-05-zickzack-schraeg.png' }
    ),
  },
  {
    id: 'skizze-spirale',
    title: 'S6 · Spirale / Gitter',
    note: 'aus deiner Handskizze',
    src: '/100-generation/aus-skizze-06-spirale.png',
    sketchSrc: '/100-generation/skizzen/skizze-06-spirale.jpg',
    formHint: 'Stamm-Fuß, Scheibe mit Spirale, mandelförmige Gitter-Öffnung',
    gruppe: 'handskizze',
    ansichten: views(
      '/100-generation/aus-skizze-06-spirale.png',
      '/100-generation/aus-skizze-06-spirale-seite.png',
      { schraeg: '/100-generation/aus-skizze-06-spirale-schraeg.png' }
    ),
  },
  {
    id: 'skizze-spirale-kopf',
    title: 'S7 · Kopf / Gitter-Gesicht',
    note: 'zweiter Entwurf zur Spirale-Skizze',
    src: '/100-generation/aus-skizze-06b-spirale-kopf.png',
    sketchSrc: '/100-generation/skizzen/skizze-06-spirale.jpg',
    formHint: 'Vollkopf – ganze Gesichtsebene = Gittergesicht, Spirale an der Seite',
    gruppe: 'handskizze',
    ansichten: views(
      '/100-generation/aus-skizze-06b-spirale-kopf.png',
      '/100-generation/aus-skizze-06b-spirale-kopf-seite.png',
      { schraeg: '/100-generation/aus-skizze-06b-spirale-kopf-schraeg.png' }
    ),
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
