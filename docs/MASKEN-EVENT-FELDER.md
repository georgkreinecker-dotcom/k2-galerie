# Event-Maske (Neues Event / Event bearbeiten)

**Warum können sich Formulare ändern?**

- Die **Masken** (z. B. „Neues Event hinzufügen“) kommen aus dem **Quellcode** (z. B. `ScreenshotExportAdmin.tsx`).
- Wenn der Code überschrieben wird (z. B. durch anderes Backup, Merge, Refactor oder Wiederherstellung einer älteren Version), sieht die Maske danach so aus wie in **dieser** Codeversion – also ggf. mit anderen oder weniger Feldern als vorher.
- **Gespeicherte Daten** (Events, Texte) liegen in localStorage / gallery-data. Wenn die **Maske** andere Felder hat als früher, liegt das an der **Codeversion**, nicht am Verlust der Daten.

---

## Aktuelle Felder der Event-Maske (Stand im Code)

1. **Titel** * (Pflicht)
2. **Event-Typ** (Galerieeröffnung, Vernissage, Finissage, Öffentlichkeitsarbeit, Sonstiges)
3. **Startdatum** * (Pflicht)
4. **Enddatum** (bei mehrtägigem Event)
5. **Startzeit** / **Endzeit** (global)
6. **Anfangs- und Endzeiten pro Tag** (jeder Tag kann unterschiedliche Zeiten haben)
7. **Ort** (mit Button „Aus Stammdaten übernehmen“)
8. **Beschreibung** (Mehrzeilig)

Gespeichert werden außerdem: `documents` (Dokumente zum Event), `createdAt`, `updatedAt`.

---

## Felder, die du früher hattest oder brauchst

Wenn bei dir **früher andere Felder** in der Event-Maske waren (z. B. Kontakt, Bild, Link, Hinweis), können wir sie gezielt wieder einbauen. Schreib einfach, welche Felder du wiederhaben möchtest, z. B.:

- **Kontakt / Ansprechpartner** (Name, E-Mail, Telefon)
- **Bild / Teaser** (ein Bild zum Event)
- **Link** (URL zu Anmeldung oder Infoseite)
- **Hinweis** (kurzer Zusatztext)
- **Sonstiges** (Beschreibung, was genau du brauchst)

Dann ergänzen wir die Event-Maske im Code um genau diese Felder und speichern sie im Event-Objekt mit (inkl. Auto-Save und Backup).
