# Mac ↔ iPad Sync – Schritt für Schritt

**Eine zentrale Stelle = Vercel.** Dort liegen die Daten (gallery-data.json). Beim **Speichern** eines Werks werden die Daten automatisch dorthin geschickt – ein extra „Veröffentlichen“ ist nicht nötig. Beim **Öffnen** der Galerie/Vorschau wird von dort geladen. Laufende Nummern kommen ebenfalls von dort, damit Mac und iPad nie dieselbe Nummer vergeben.

---

## Richtung 1: Mac → iPad (Neues Werk vom Mac soll am iPad erscheinen)

### Am Mac

1. **Werk anlegen** wie gewohnt (Bild aus Datei oder Kamera, Titel, Kategorie, …).
2. **Speichern** – damit ist das Werk **automatisch** an die zentrale Stelle (Vercel) gesendet. Kein extra Klick auf „Veröffentlichen“ nötig.

### Am iPad

3. **Galerie oder Vorschau öffnen** (z. B. über Lesezeichen oder QR). Die App lädt den Stand von Vercel.
4. Falls du eine **ältere Version** siehst: **Stand-Badge tippen** (unten links) oder Seite neu laden – dann kommt der neueste Stand.

→ Das neue Werk vom Mac erscheint am iPad.

---

## Richtung 2: iPad → Mac (Neues/geändertes Werk vom iPad soll am Mac erscheinen)

### Am iPad

1. **Werk anlegen oder bearbeiten** (z. B. Foto mit Kamera, Speichern).
2. **Speichern** – die Daten gehen **automatisch** an Vercel. Kein extra „Veröffentlichen“ nötig.

### Am Mac

3. **Galerie öffnen** (z. B. k2-galerie.vercel.app/galerie). Beim ersten Öffnen wird einmal von Vercel geladen.
4. **Damit neue Werke vom iPad erscheinen:** Unten rechts auf **„🔄 Vom Server laden“** klicken. (1–2 Minuten nach dem Speichern am iPad warten, dann klicken – Vercel braucht kurz zum Aktualisieren.)
5. Alternativ: Seite **neu laden** (F5 oder Cmd+R).

→ Das neue/geänderte Werk vom iPad erscheint am Mac.

---

## Kurzfassung

| Richtung   | Was du machst | Auf dem anderen Gerät |
|-----------|----------------|------------------------|
| **Mac → iPad**   | Werk **speichern** (geht automatisch an Vercel). | Galerie/Vorschau öffnen; bei Bedarf Stand-Badge tippen. |
| **iPad → Mac**   | Werk **speichern** (geht automatisch an Vercel). | Galerie öffnen; **„Vom Server laden“** klicken (unten rechts) oder Seite neu laden. |

**Merksatz:** Speichern = Daten an die zentrale Stelle. Öffnen/Laden = Daten von dort. Kein extra „Veröffentlichen“ nötig.

**Optional:** In Einstellungen gibt es weiterhin den Button **„Veröffentlichen“**, falls du z. B. viele Änderungen auf einmal gemacht hast und den Stand explizit sichern willst.

---

## Technik (für Assistenten)

- **Zentrale Stelle:** Vercel (gallery-data.json). **Nur für K2:** Nummern beim neuen Werk von dort + lokal (CENTRAL_GALLERY_DATA_URL). ök2 = Demo (keine zentrale Datei), VK2 = keine Werke im Admin → Nummern nur lokal.
- **Nach Speichern:** `publishMobile({ silent: true })` nur bei K2; ök2/VK2 schreiben nicht an die zentrale Stelle.
- **Laden:** Galerie/Vorschau lädt gallery-data.json von Vercel (baseUrl wenn nicht auf Vercel), merged mit lokal falls nötig (BUG-012/013).
- **Stand-Badge:** Reload mit Cache-Bypass für neueste Daten/App-Version.
