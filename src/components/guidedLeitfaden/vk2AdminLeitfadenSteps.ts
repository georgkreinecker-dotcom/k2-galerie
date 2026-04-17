/** Nur Texte und Fokus-Keys für den VK2-Admin-Rundgang (Plattform) – keine App-Logik. */

export type Vk2AdminLeitfadenStep = {
  id: string
  titel: string
  stimmung?: string
  text: string
  focusKey?: string
}

export function buildVk2AdminLeitfadenSchritte(name: string): Vk2AdminLeitfadenStep[] {
  const n = name.trim() || 'Besucher'
  return [
    {
      id: 'begruessung',
      titel: 'Willkommen im Admin',
      stimmung: 'Ein Klick pro Bereich.',
      text:
        `**Schön, dass du reinschaust, ${n}.**\n\n` +
        'Hier pflegt der Verein **Mitglieder**, **Gestaltung**, **Stammdaten**, **Katalog** und **Events** – alles aus **einer** Übersicht.\n\n' +
        '**Kein Audio** – du liest in Ruhe. Mit **Weiter** Schritt für Schritt; **▼** minimiert nur das Fenster.',
    },
    {
      id: 'admin-leiste',
      titel: 'Die Leiste oben',
      stimmung: 'Logo und Schnellzugriff.',
      text:
        '**Links:** **Logo** und Badge **VK2 ADMIN** – du bist im Verwaltungsbereich des Vereins.\n\n' +
        '**Rechts:** **Unsere Mitglieder** öffnet die öffentliche Galerie-Ansicht; **Kasse** und **Buchhaltung** für den Vereinsbetrieb; die **Zahl** zeigt die **Besucherzahl** der Galerie; **Idee? Wunsch?** schickt eine Notiz ins Smart Panel; **Abmelden** beendet den Admin auf diesem Gerät.',
      focusKey: 'admin-hub-leiste',
    },
    {
      id: 'hub',
      titel: 'Die Übersicht',
      stimmung: '„Was möchtest du heute tun?“',
      text:
        '**Oben** siehst du die **zentralen Kacheln**: links Mitglieder, Gestaltung, Einstellungen – rechts Werkkatalog und Eventplanung.\n\n' +
        '**Ein Klick** auf eine Karte öffnet den Bereich – du kannst jederzeit mit **← Zurück zur Übersicht** wieder hierher.',
      focusKey: 'hub-intro',
    },
    {
      id: 'mitglieder-karte',
      titel: 'Vereinsmitglieder',
      stimmung: 'Profile und Galerie.',
      text:
        'Die **erste große Karte** führt zu **Mitgliedern mit Galerie-Profil**: Fotos, Texte, Karten – so stellt der Verein eure Arbeit vor.\n\n' +
        '**Darunter** auf der Seite beginnt die **Liste** zum Bearbeiten – derselbe Bereich wie in der Karte.',
      focusKey: 'hub-werke',
    },
    {
      id: 'design-karte',
      titel: 'Ausstellung gestalten',
      stimmung: 'Farben, Texte, Bilder.',
      text:
        '**Gestaltung** = Willkommen, Galerie-Karte, Farben und Texte – damit die **öffentliche Galerie** zu euch passt.\n\n' +
        'Alles, was Besucher:innen zuerst sehen, steuert ihr hier.',
      focusKey: 'hub-design',
    },
    {
      id: 'einstellungen-karte',
      titel: 'Einstellungen',
      stimmung: 'Verein, Kontakt, Mitglieder verwalten.',
      text:
        'Unter **Einstellungen** liegen **Vereins-Stammdaten**, **Kontakt**, **Backup**, **Veröffentlichen**, **Drucker** und **Passwort**.\n\n' +
        'Details stehen im **VK2-Handbuch** – Button **Handbuch** oben in der Leiste.',
      focusKey: 'hub-einstellungen',
    },
    {
      id: 'katalog-karte',
      titel: 'Werkkatalog',
      stimmung: 'Alles auf einen Blick.',
      text:
        '**Werkkatalog** = Übersicht aller Werke: **filtern**, **suchen**, **drucken** – für Ausstellungen und interne Listen.\n\n' +
        'Nicht verwechseln mit der Mitgliederliste – der Katalog ist die **Werk-Sicht**.',
      focusKey: 'hub-katalog',
    },
    {
      id: 'eventplan-karte',
      titel: 'Event- und Medienplanung',
      stimmung: 'Termine, Flyer, Presse.',
      text:
        'Hier plant der Verein **Veranstaltungen** und erzeugt **Werbemittel** (Flyer, Presse, Newsletter) – mit **Verteiler** aus den Stammdaten.\n\n' +
        'Ein durchgängiger Bereich für **Öffentlichkeitsarbeit**.',
      focusKey: 'hub-eventplan',
    },
    {
      id: 'werke-liste',
      titel: 'Liste darunter',
      stimmung: 'Direkt bearbeiten.',
      text:
        'Unter der Trennlinie **„Vereinsmitglieder“** bearbeitet ihr die **konkreten Einträge**: anlegen, ändern, Fotos – wie in der Handbuch-Anleitung beschrieben.\n\n' +
        '**Das war der Kurz-Rundgang.** Über **Admin-Rundgang** startest du die Führung **jederzeit** erneut.',
      focusKey: 'werke-bereich',
    },
  ]
}
