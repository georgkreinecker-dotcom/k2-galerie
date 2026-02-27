# Mac ↔ iPad Sync – Schritt für Schritt

Damit Werke und Änderungen auf dem Mac **und** auf dem iPad sichtbar sind, gibt es genau einen gemeinsamen „Stand“: **gallery-data.json** auf dem Server (Vercel/GitHub). Wer **veröffentlicht**, schreibt diesen Stand. Wer **Galerie/Vorschau öffnet oder aktualisiert**, liest von diesem Stand (und merged mit lokal, falls nötig).

---

## Richtung 1: Mac → iPad (Neues Werk vom Mac soll am iPad erscheinen)

### Am Mac

1. **Werk anlegen** wie gewohnt (Bild aus Datei oder Kamera, Titel, Kategorie, …).
2. **Speichern** – Werk ist in der Galerie und in der Vorschau sichtbar (lokal auf dem Mac).
3. **Veröffentlichen:**
   - Admin öffnen (falls nicht schon offen).
   - Zu **Einstellungen** wechseln.
   - Nach unten zu **„Veröffentlichen“** scrollen.
   - Auf **„Veröffentlichen“** klicken.
   - Warten, bis die Meldung kommt (z. B. „Galerie wurde veröffentlicht“).  
     (Im Hintergrund wird die aktuelle Galerie als **gallery-data.json** auf GitHub geschrieben; Vercel hat danach den neuesten Stand.)

### Am iPad

4. **Galerie/Vorschau mit aktuellem Stand laden:**
   - Galerie oder Vorschau öffnen (z. B. über Lesezeichen oder QR).
   - **Stand-Badge tippen** (unten links), damit keine alte Version aus dem Cache angezeigt wird – dann lädt die App den neuesten Stand vom Server.
   - Alternativ: Galerie/Vorschau in einem **neuen Tab** öffnen oder Seite neu laden.

→ Das neue Werk vom Mac erscheint am iPad.

---

## Richtung 2: iPad → Mac (Neues/geändertes Werk vom iPad soll am Mac erscheinen)

### Am iPad

1. **Werk anlegen oder bearbeiten** (z. B. Foto mit Kamera, Speichern).
2. **Veröffentlichen:**
   - In der **Verwaltung/Admin** (am iPad) zu **Einstellungen** gehen.
   - Nach unten zu **„Veröffentlichen“** scrollen.
   - Auf **„Veröffentlichen“** tippen.
   - Warten, bis die Erfolgsmeldung kommt.

(Dabei wird die **aktuelle** Galerie des iPads – inkl. des neuen Werks – als gallery-data.json auf den Server geschrieben.)

### Am Mac

3. **Galerie/Vorschau mit aktuellem Stand laden:**
   - Galerie oder Vorschau im Browser öffnen (z. B. k2-galerie.vercel.app/…).
   - **Stand-Badge tippen** oder Seite **neu laden**, damit der neueste Stand vom Server geladen wird (nicht die alte, lokale Version).

→ Das neue/geänderte Werk vom iPad erscheint am Mac.

---

## Kurzfassung

| Richtung   | Wo machen? | Wichtigster Schritt danach |
|-----------|------------|-----------------------------|
| **Mac → iPad**   | Am Mac: Werk speichern → **Veröffentlichen** (Einstellungen). | Am iPad: Galerie/Vorschau öffnen und **Stand-Badge tippen** (oder neu laden). |
| **iPad → Mac**   | Am iPad: Werk speichern → **Veröffentlichen** (Einstellungen). | Am Mac: Galerie/Vorschau öffnen und **Stand-Badge tippen** oder neu laden. |

**Merksatz:** Wer etwas geändert hat und will, dass es auf dem anderen Gerät ankommt: **einmal Veröffentlichen** – auf dem anderen Gerät **Stand aktualisieren** (Badge tippen oder neu laden).

---

## Technik (für Assistenten)

- **Veröffentlichen:** Ruft `publishMobile()` auf, baut Export aus localStorage (Artworks, Stammdaten, Events, …), sendet POST an `/api/write-gallery-data`. Die Vercel-Funktion schreibt **public/gallery-data.json** per GitHub-API ins Repo.
- **Galerie/Vorschau laden:** Lädt `gallery-data.json` vom Server (Vercel), merged mit lokalem localStorage (lokale Neu-Anlagen gehen nicht verloren, siehe BUG-012), schreibt gemergte Liste zurück und zeigt sie an.
- **Stand-Badge:** Führt beim Tippen einen Reload mit Cache-Bypass aus, damit die neueste gallery-data.json und die neueste App-Version geladen werden.
