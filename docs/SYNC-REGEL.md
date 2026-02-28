# Sync-Regel – verbindlich (Phase 2.1 Sportwagen)

**Eine Regel, eine Funktion.** Alle Stellen, die Server-Daten (gallery-data.json, Supabase) mit lokalen Werken mergen, nutzen dieselbe Logik. Keine lokalen Varianten mehr – sonst wieder Bugs wie BUG-011 bis BUG-016.

---

## Die Regel

1. **Server = Quelle.** Die gemergte Liste startet mit den Server-Werken (gallery-data.json / Supabase).
2. **Lokale Neu-Anlagen sind geschützt.** Jedes lokale Werk, das **nicht** auf dem Server vorkommt (gleiche Nummer/ID), wird **immer** in die gemergte Liste übernommen. Nie verwerfen – sonst gehen z. B. am Mac gerade angelegte Werke verloren (BUG-012).
3. **Konflikt (gleicher Key auf Server und lokal):**
   - **Mobile-Werk (createdOnMobile/updatedOnMobile):** Lokale Version gewinnt (iPad/Handy hat gerade gespeichert).
   - **Sonst:** Neuere Version gewinnt (`updatedAt` vergleichen).

**Identität:** Ein Werk ist dasselbe wie ein anderes, wenn `number` oder `id` übereinstimmt.

---

## Eine Funktion

**`mergeServerWithLocal(serverList, localList, options?)`** in `src/utils/syncMerge.ts`.

- **Rückgabe:** `{ merged, toHistory }`
  - `merged`: die zu speichernde/anzuzeigende Liste (Server + geschützte Lokale + Konflikt-Lösung).
  - `toHistory`: lokale Werke, die nur für Logging/History genutzt werden (nicht-Mobile oder nicht „sehr neu“), damit der Aufrufer z. B. `appendToHistory(toHistory)` ausführen kann.
- **Schreiben:** Der Aufrufer speichert `merged` (über artworksStorage), **niemals** mit weniger Werken als vorher überschreiben (siehe Regel „niemals-kundendaten-loeschen“). Wenn `merged.length < currentCount` → nicht schreiben, lokale behalten.

---

## Aufrufer (alle nutzen mergeServerWithLocal)

| Stelle | Verwendung |
|--------|------------|
| **GaleriePage** | Merge nach Laden von gallery-data.json („Zur Galerie“ + Initial-Load). |
| **GalerieVorschauPage** | handleRefresh („Vom Server laden“ / Stand-Badge). |
| **Admin** | handleLoadFromServer / vergleichbare „Vom Server laden“-Logik, sofern vorhanden. |

**GalerieVorschauPage syncFromGalleryData (Mobile-Polling):** Andere Strategie (Start mit Lokal, Server ergänzen; „nie weniger schreiben“). Nutzt keine mergeServerWithLocal, aber dieselbe Identitätslogik (number/id). Optional später vereinheitlichen.

---

## Kurzfassung

**Server = Quelle. Lokale ohne Server-Eintrag immer behalten. Konflikt: Mobile > neuer. Eine Funktion: syncMerge.mergeServerWithLocal.**
