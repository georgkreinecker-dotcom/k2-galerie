/** Nur Texte und Fokus-Keys für den ök2-Demo-Admin-Rundgang (Plattform) – keine App-Logik. */

export type Oek2AdminLeitfadenStep = {
  id: string
  titel: string
  stimmung?: string
  text: string
  focusKey?: string
}

export function buildOek2AdminLeitfadenSchritte(name: string): Oek2AdminLeitfadenStep[] {
  const n = name.trim() || 'Besucher'
  return [
    {
      id: 'begruessung',
      titel: 'Willkommen im Admin',
      stimmung: 'Ein Klick pro Bereich.',
      text:
        `**Schön, dass du reinschaust, ${n}.**\n\n` +
        'Hier pflegst du in der **Demo** **Werke**, **Galerie gestalten**, **Stammdaten**, **Katalog** und **Events** – alles aus **einer** Übersicht. Es sind **Musterdaten**, keine echten Kundendaten.\n\n' +
        '**Kein Audio** – du liest in Ruhe. Mit **Weiter** Schritt für Schritt; **▼** minimiert nur das Fenster.',
    },
    {
      id: 'admin-leiste',
      titel: 'Die Leiste oben',
      stimmung: 'Logo und Schnellzugriff.',
      text:
        '**Links:** **Logo** und Badge **Demo** – du bist im Verwaltungsbereich der Muster-Galerie.\n\n' +
        '**Rechts:** **Galerie ansehen** öffnet die öffentliche Ansicht; **Kasse** und **Buchhaltung** für den Ablauf; **Idee? Wunsch?** schickt eine Notiz ins Smart Panel; **Abmelden** beendet den Admin auf diesem Gerät.',
      focusKey: 'admin-hub-leiste',
    },
    {
      id: 'hub',
      titel: 'Die Übersicht',
      stimmung: '„Was möchtest du heute tun?“',
      text:
        '**Oben** siehst du die **zentralen Kacheln**: Werke, Gestaltung, Einstellungen – und rechts Kassa, Events, Presse.\n\n' +
        '**Ein Klick** auf eine Karte öffnet den Bereich – du kannst jederzeit mit **← Zurück zur Übersicht** wieder hierher.',
      focusKey: 'hub-intro',
    },
    {
      id: 'werke-karte',
      titel: 'Werke',
      stimmung: 'Muster-Werke verwalten.',
      text:
        'Die **erste große Karte** führt zu **Werken**: in der Demo **erfundene** Stücke – so siehst du Etikett, Kategorien und Katalog.\n\n' +
        '**Darunter** auf der Seite beginnt die **Liste** zum Bearbeiten – derselbe Bereich wie in der Karte.',
      focusKey: 'hub-werke',
    },
    {
      id: 'design-karte',
      titel: 'Galerie gestalten',
      stimmung: 'Farben, Texte, Bilder.',
      text:
        '**Galerie gestalten** = Willkommen, Galerie-Karte, Farben und Texte – damit die **öffentliche Galerie** zu dir passt.\n\n' +
        'Alles, was Besucher:innen zuerst sehen, steuerst du hier.',
      focusKey: 'hub-design',
    },
    {
      id: 'einstellungen-karte',
      titel: 'Einstellungen',
      stimmung: 'Demo-Stammdaten, Kontakt, Backup.',
      text:
        'Unter **Einstellungen** liegen **Stammdaten**, **Kontakt**, **Backup**, Hinweise zum **Veröffentlichen**, **Drucker** und **Passwort**.\n\n' +
        'Details stehen im **Benutzerhandbuch** – Button **Handbuch** oben in der Leiste.',
      focusKey: 'hub-einstellungen',
    },
    {
      id: 'katalog-karte',
      titel: 'Statistik / Werkkatalog',
      stimmung: 'Alles auf einen Blick.',
      text:
        '**Statistik/Werkkatalog** = Übersicht aller Demo-Werke: **filtern**, **suchen**, **drucken** – für Ausstellungen und interne Listen.\n\n' +
        'Nicht verwechseln mit der Werke-Liste – der Katalog ist die **Werk-Sicht**.',
      focusKey: 'hub-katalog',
    },
    {
      id: 'eventplan-karte',
      titel: 'Event- und Medienplanung',
      stimmung: 'Termine, Flyer, Presse.',
      text:
        'Hier planst du **Veranstaltungen** und erzeugst **Werbemittel** (Flyer, Presse, Newsletter) – mit **Verteiler** aus den Stammdaten.\n\n' +
        'Ein durchgängiger Bereich für **Öffentlichkeitsarbeit**.',
      focusKey: 'hub-eventplan',
    },
    {
      id: 'werke-liste',
      titel: 'Liste darunter',
      stimmung: 'Direkt bearbeiten.',
      text:
        'Unter der Trennlinie **„Werke hinzufügen und bearbeiten“** bearbeitest du die **konkreten Einträge**: anlegen, ändern, Fotos – wie im Handbuch beschrieben.\n\n' +
        '**Das war der Kurz-Rundgang.** Über **Admin-Rundgang** startest du die Führung **jederzeit** erneut.',
      focusKey: 'werke-bereich',
    },
  ]
}
