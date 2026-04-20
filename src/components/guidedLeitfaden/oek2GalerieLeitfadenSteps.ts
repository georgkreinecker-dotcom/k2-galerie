/** Nur Texte und Fokus-Keys für den ök2 Demo-Galerie-Rundgang – keine App-Logik. */

export type Oek2GalerieLeitfadenStep = {
  id: string
  titel: string
  stimmung?: string
  text: string
  focusKey?: string
}

export function buildOek2GalerieLeitfadenSchritte(name: string): Oek2GalerieLeitfadenStep[] {
  const n = name.trim() || 'du'
  return [
    {
      id: 'begruessung',
      titel: 'Willkommen',
      stimmung: 'Einladung in die Demo – so kann eine Galerie wirken.',
      text:
        `**Schön, dass du da bist, ${n}.**\n\n` +
        'Hier siehst du eine **Muster-Galerie** – erfundene Inhalte, echte Struktur: **Willkommen**, **Künstler:in**, **Werke** in der Vorschau, **Impressum**.\n\n' +
        '**Kein Audio** in diesem Rundgang – du liest in Ruhe. Mit **Weiter** gehst du Schritt für Schritt; **▼** oder **Escape** legt das Fenster nur zusammen.',
    },
    {
      id: 'willkommen',
      titel: 'Erste Seite',
      stimmung: 'Eindruck, Farben, Einladung – deine erste Seite.',
      text:
        '**Willkommensbereich:** Bild, Titel und Text – der erste Eindruck **lädt zum Bleiben ein**.\n\n' +
        'Später legst du **alles im Admin** fest: Texte, Bilder, **Corporate Design** – eine Linie für Web und Druck.',
      focusKey: 'willkommen',
    },
    {
      id: 'kunstschaffende',
      titel: 'Künstler:in',
      stimmung: 'Wer steckt dahinter.',
      text:
        '**Kurzporträt** – wer die Werke macht, mit Vita und Foto.\n\n' +
        'In deiner echten Galerie sind das **deine** Daten – hier nur **Beispiel**.',
      focusKey: 'kunstschaffende',
    },
    {
      id: 'eingang-galerie',
      titel: 'In die Werke',
      stimmung: 'Von der Startseite in die Ausstellung.',
      text:
        '**Tür „In die Galerie“** führt zur **Vorschau** – dort liegen die **Werke** wie bei einer echten Ausstellung.\n\n' +
        'So bekommen Besucher:innen den **Überblick** und können einzelne Stücke öffnen.',
      focusKey: 'eingang-galerie',
    },
    {
      id: 'virtuell',
      titel: 'Virtueller Rundgang',
      stimmung: 'Optional – Bild oder Video.',
      text:
        '**Virtueller Rundgang:** Atelier oder Raum als **Video** oder **Panorama** – einbindbar unter Design → Seitengestaltung.\n\n' +
        'In der Demo kann das leer sein; bei dir wird es **dein** Material.',
      focusKey: 'virtueller-rundgang',
    },
    {
      id: 'admin',
      titel: 'Gestalten',
      stimmung: 'Alles an einem Ort.',
      text:
        '**Admin** ist die **Zentrale**: Werke, Texte, Design, Kassa, Events – **ohne** Programmierkenntnisse.\n\n' +
        'Oben findest du den Einstieg **„Mit mir in den Admin“** (wenn du von hier aus startest).',
      focusKey: 'admin-hinweis',
    },
    {
      id: 'impressum',
      titel: 'Kontakt & Abschluss',
      stimmung: 'Vertrauen nach außen.',
      text:
        '**Impressum** mit Adresse und Kontakt – so bleibt es **seriös** und **rechtskonform**.\n\n' +
        'Unten folgt noch ein kurzer **Schluss** – dann kannst du die Seite in Ruhe erkunden.',
      focusKey: 'impressum',
    },
    {
      id: 'fertig',
      titel: 'Viel Spaß beim Umschauen',
      stimmung: 'Kein Druck.',
      text:
        '**Das war der Kurz-Rundgang.** Du kannst die Demo **jederzeit** wieder aufrufen.\n\n' +
        'Wenn du **deine eigene Galerie** anlegst, liegen **deine** Daten bei **dir** – nach Lizenz und Einrichtung.',
    },
  ]
}
