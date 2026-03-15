# VK2 – Datenfluss: Mitglieder → Werkkatalog → Galerie

**Zweck:** Klar beschreiben, wo welche Daten eingegeben werden und wie sie in Werkkatalog und Galerie landen. Unterscheidung: **Lizenzmitglieder** (ök2/K2-Mitgliedschaft, eigene Galerie) vs. **einfache Vereinsmitglieder**.

---

## 1. Zwei Arten von Mitgliedern

| Art | Bedeutung | Werke im Vereinskatalog? |
|-----|-----------|---------------------------|
| **Lizenzmitglied** | Hat **eigene** K2/ök2-Galerie (Lizenz). Im Mitgliedsprofil ist **„Lizenz-Galerie-URL“** eingetragen (z. B. `https://anna-k2.vercel.app`). | **Ja** – Werke werden von dieser Galerie geholt (bis zu 5, mit Hakerl „Im Vereinskatalog“). |
| **Einfaches Mitglied** | Nur im Verein eingetragen, **keine** eigene Galerie-URL. | **Ja** – bis zu 5 Werke im Mitglieder-Modal unter „Werke für Vereinskatalog“ eintragen; Speicher: `k2-vk2-artworks-${name}`. |

---

## 2. Wo werden Daten eingegeben?

### Mitglieder (alle)

- **Ort:** Admin mit Kontext VK2 → **Einstellungen** → Tab **Stammdaten** (VK2-Bereich: Verein, Vorstand, **Mitglieder**).
- **Speicher:** `k2-vk2-stammdaten` (localStorage), darin `mitglieder: Vk2Mitglied[]`.
- **Pro Mitglied:** Name, E-Mail, Lizenz, Kunstrichtung (typ), Adresse, Bio, Vita, Foto, **Lizenz-Galerie-URL** (falls Lizenzmitglied), PIN (für Mitglied-Login), Rolle (Vorstand/Mitglied) usw.

### Werke von Lizenzmitgliedern

- **Eingabe:** Der **Lizenznehmer** arbeitet in **seiner eigenen** Galerie (seine Vercel-URL). Dort markiert er Werke mit **„Im Vereinskatalog anzeigen“** (`imVereinskatalog === true`).
- **Abholung:** Die VK2-App holt die Werke per **fetch** von `{lizenzGalerieUrl}/gallery-data.json` und filtert auf `imVereinskatalog`. Kein eigener Speicher für diese Werke im Verein – sie bleiben in der Galerie des Mitglieds.

### Werke von einfachen Mitgliedern

- **Eingabe:** Admin (context=vk2) → **Einstellungen** → Tab **Stammdaten** → Mitglied **Bearbeiten** → Bereich **„Werke für Vereinskatalog“**. Bis zu 5 Werke pro Mitglied (Titel, Beschreibung, Technik, Maße, Jahr, Bild). Nur sichtbar, wenn **keine** Lizenz-Galerie-URL eingetragen ist.
- **Speicher:** `k2-vk2-artworks-${keySuffix}` (localStorage), `keySuffix` = Name normalisiert (z. B. `max-muster`). Bei Namensänderung des Mitglieds werden die Werke automatisch auf den neuen Key migriert.

---

## 3. Datenfluss (Übersicht)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  EINGABE                                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  Admin (context=vk2) → Einstellungen → Stammdaten                        │
│  → Verein, Vorstand, MITGLIEDER (Name, Lizenz, Lizenz-Galerie-URL, …)   │
│  → Speicher: k2-vk2-stammdaten                                          │
└─────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  WERKE FÜR VEREINSKATALOG                                                │
├─────────────────────────────────────────────────────────────────────────┤
│  • Lizenzmitglied (lizenzGalerieUrl gesetzt):                           │
│    → fetch(lizenzGalerieUrl + /gallery-data.json)                        │
│    → Filter: imVereinskatalog === true                                   │
│  • Einfaches Mitglied:                                                  │
│    → k2-vk2-artworks-${name-normalized} (Eingabe im Mitglieder-Modal)    │
│    → max. 5 Werke pro Mitglied                                          │
└─────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  ANZEIGE                                                                │
├─────────────────────────────────────────────────────────────────────────┤
│  • Werkkatalog (Admin Tab „Werkkatalog“ / Vereinskatalog-Seite):        │
│    → alle Werke aus beiden Quellen (fetch + k2-vk2-artworks-*)           │
│  • Galerie (Mitglieder in der Galerie):                                 │
│    → Mitglieder aus k2-vk2-stammdaten.mitglieder (Karten mit Profil)    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Kurzfassung

- **Mitgliederdaten** werden in **Admin → Einstellungen → Stammdaten (VK2)** eingegeben; Speicher: `k2-vk2-stammdaten`.
- **Werke im Vereinskatalog** kommen von **Lizenzmitgliedern** (fetch von Lizenz-Galerie) und von **einfachen Mitgliedern** (Eingabe im Mitglieder-Modal → `k2-vk2-artworks-${name}`).
- **Eingabe für einfache Mitglieder:** Admin → Einstellungen → Stammdaten (VK2) → Mitglied **Bearbeiten** → Bereich **„Werke für Vereinskatalog“** (bis 5 Werke: Titel, Beschreibung, Technik, Bild, Maße, Jahr). Bei Namensänderung des Mitglieds werden die Werke automatisch migriert.
