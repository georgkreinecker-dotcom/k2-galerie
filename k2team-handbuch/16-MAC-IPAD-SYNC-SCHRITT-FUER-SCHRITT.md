# Mac ↔ iPad Sync – Schritt für Schritt

**Eine zentrale Stelle = Vercel.** Dort liegen die Daten (gallery-data.json). **Am Mac** gehen sie beim Speichern automatisch dorthin. **Am iPad** musst du nach dem Speichern **„Daten an Server senden“** tippen (unter Werke verwalten). Beim **Öffnen** der Galerie/Vorschau wird von dort geladen. Laufende Nummern kommen von dort, damit Mac und iPad nie dieselbe Nummer vergeben.

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
2. **Speichern** – die Daten liegen erst auf dem iPad.
3. **„📤 Daten an Server senden“** tippen (unter „Werke verwalten“). Damit gehen die Werke an Vercel. Ohne diesen Schritt liegen die Daten nur auf dem iPad.

### Am Mac

4. **Galerie öffnen** (z. B. k2-galerie.vercel.app/galerie). Beim ersten Öffnen wird einmal von Vercel geladen.
5. **Damit neue Werke vom iPad erscheinen:** Unter „Werke verwalten“ auf **„🔄 Bilder vom Server laden“** klicken. (1–2 Minuten nach „Daten an Server senden“ am iPad warten – Vercel braucht kurz.)
6. Alternativ: Seite **neu laden** (F5 oder Cmd+R).

→ Das neue/geänderte Werk vom iPad erscheint am Mac.

---

## Kurzfassung

| Richtung   | Was du machst | Auf dem anderen Gerät |
|-----------|----------------|------------------------|
| **Mac → iPad**   | Werk **speichern** (geht automatisch an Vercel). | Galerie/Vorschau öffnen; bei Bedarf Stand-Badge tippen. |
| **iPad → Mac**   | Werk **speichern**, dann **„Daten an Server senden“** tippen. | Galerie öffnen; **„Bilder vom Server laden“** klicken oder Seite neu laden. |

**Merksatz:** Am iPad: Speichern + **„Daten an Server senden“** = Daten auf Vercel. Am Mac: **„Bilder vom Server laden“** = Daten von Vercel holen.

**Am Mac** in Einstellungen gibt es zusätzlich **„Veröffentlichen“**; am iPad reicht **„Daten an Server senden“** unter Werke verwalten.

---

## Technik (für Assistenten)

- **Zentrale Stelle:** Vercel (gallery-data.json). **Nur für K2:** Nummern beim neuen Werk von dort + lokal (CENTRAL_GALLERY_DATA_URL). ök2 = Demo (keine zentrale Datei), VK2 = keine Werke im Admin → Nummern nur lokal.
- **Senden:** Immer `https://k2-galerie.vercel.app/api/write-gallery-data` (WRITE_GALLERY_DATA_API_URL) – iPad, Mac und lokal nutzen denselben Endpoint. API schreibt per GitHub API in public/gallery-data.json; Vercel baut neu (1–2 Min).
- **Nach Speichern (Mac):** `publishMobile({ silent: true })` bei K2. **Am iPad:** Nutzer tippt **„Daten an Server senden“** (ruft `publishMobile()` auf). ök2/VK2 schreiben nicht an die zentrale Stelle.
- **Laden:** „Bilder vom Server laden“ holt CENTRAL_GALLERY_DATA_URL mit Cache-Bust, ein Retry bei Netzwerkfehler; Merge mit lokal (lokale Werke haben Priorität).
- **Einmalig:** In Vercel GITHUB_TOKEN setzen (siehe docs/DATENTRANSPORT-IPAD-MAC-VERCEL.md).
- **Stand-Badge:** Reload mit Cache-Bypass für neueste Daten/App-Version.
