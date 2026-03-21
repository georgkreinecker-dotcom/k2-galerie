# K2 / ök2 – Wie Vermischung trotz eiserner Regeln möglich ist

**Zweck:** Nachvollziehbare Ursachenklassen (kein Vorwurf gegen die Regeln – die beschreiben das Ziel; der Code und die Nutzung müssen dauernd dazu passen).

**Verknüpfung:** `.cursor/rules/k2-oek2-eisernes-gesetz-keine-daten.mdc`, `k2-oek2-trennung.mdc`, `kontext-vergiftung-vermeiden.mdc`, `docs/K2-OEK2-DATENTRENNUNG.md`, `docs/DATENFLUSS-GALERIE-STRUKTUR.md`.

---

## 1. Session-Speicher (`sessionStorage`) – gleiche Browser-Sitzung für alles

- **`k2-admin-context`** (und ggf. **`k2-shop-from-oeffentlich`**) leben **session-weit**.
- **Folge:** Ein Tab/Flow setzt `oeffentlich`; ein **anderer** Tab oder eine **spätere** Navigation liest dieselbe Session und kann **Kontext** oder **Shop-Logik** falsch zuordnen, bis die Session stimmt oder die URL explizit setzt.
- **Abhilfe im Projekt:** `TenantContext`: auf **`/admin`** ohne `?context=` → **immer K2**; `syncStorageFromUrl` setzt Session bei Admin-Aufruf auf den URL-Kontext. **Shop:** `fromOeffentlich` aus mehreren Quellen (State, Session, Referrer).
- **Rest-Risiko:** Seiten **außerhalb** `/admin`, die **nur** `sessionStorage` lesen und **nicht** die Route (`musterOnly`, `galerie-oeffentlich`) als Quelle nehmen.

---

## 2. Direkte `localStorage`-Keys ohne Mandanten-Schicht

- Viele Stellen nutzen korrekt **`readArtworksRawForContext`**, **`loadStammdaten('k2'|'oeffentlich', …)`**, **`getPageTexts(tenant)`**.
- **Fehlerklasse:** **`localStorage.getItem('k2-artworks')`**, **`k2-stammdaten-*`** in **gemeinsamen** Komponenten (z. B. Tabs, Vorschau, Fallback im Render), **ohne** Prüfung „bin ich gerade ök2?“.
- **Folge:** In einem Render-Zyklus mit **leerem State** kann kurz oder dauerhaft **K2-Daten** in einer **ök2-Ansicht** erscheinen – oder umgekehrt Logik/Fallbacks greifen falsch.
- **Abhilfe:** Pro gemeinsamer Oberfläche: **eine** Quelle (Route → `musterOnly` / Tenant) und **niemals** K2-Keys in ök2-Zweigen; Fallbacks nur mit **`!musterOnly`** bzw. **`k2-oeffentlich-*` / Muster**.

**Konkreter Fund (behoben 21.03.26):** `GalerieVorschauPage` – Render-Fallback lud bei **leerer** Werkliste **`k2-artworks`**, **ohne** `musterOnly`-Abfrage → ök2-Vorschau konnte echte K2-Werke anzeigen.

---

## 3. Schreibpfad mit „falschem“ React-State (Auto-Save / Tab-Wechsel)

- **Bekannt und abgesichert:** Auto-Save oder Kontextwechsel hat **K2-Events/Dokumente** mit **VK2-State** überschrieben → eigene Regeln + Guards in `eventsStorage`, `documentsStorage`, `autoSave`, sofortiges Nachladen bei Kontextwechsel im Admin.
- **Gleiches Muster:** Jede Speicherfunktion, die **nicht** strikt **`tenant.getArtworksKey()`** / **`isOeffentlichAdminContext()`** nutzt, kann bei **veraltetem State** in den **falschen Key** schreiben.
- **Abhilfe:** Schreiben nur über **TenantContext-Keys** + Checklisten bei neuen Features.

---

## 4. Wiederherstellung / Import / manuelle JSON-Manipulation

- **Backup öffnen** im falschen Kontext („K2-Datei in ök2 wiederherstellen“) oder **Merge-Skripte** → Daten landen im falschen Key.
- **Abhilfe:** Dialoge mit Kontext-Erkennung (`detectBackupKontext`), Bestätigungsdialoge; keine stillen Imports.

---

## 5. Server-Stand vs. lokaler Stand (keine „Vermischung“ der Keys, aber **Anzeige** wirkt vermischt)

- **`gallery-data.json`** ist **K2-Produkt-Stand**. ök2 hat **eigenen** Tenant/API-Pfad.
- Wenn jemand **K2** veröffentlicht und **ök2**-Seite **denselben** Host** und **verwechselte URLs** nutzt, kann es **inhaltlich** so wirken, als ob Daten vermischt sind – meist ist es **falscher** API-`tenantId` oder **Cache**.
- **Abhilfe:** QR/Stand-Regeln, klare `tenantId` in API-Aufrufen.

---

## 6. `getPageContentGalerie()` / `getPageTexts()` **ohne** Tenant-Argument

- **Default** = **K2-Keys** (`k2-page-content-galerie`, `k2-page-texts`).
- **Folge:** Aufruf **ohne** Parameter auf einer **ök2**-relevanten Seite → **K2-Texte/Bilder** in der Demo.
- **Abhilfe:** Überall in ök2-Routen **`getPageContentGalerie('oeffentlich')`**, **`getPageTexts('oeffentlich')`** (bereits in Regeln festgehalten).

**Beispiele mit bewusst K2 (APf):** `publishGalleryDataToServer` (nur K2-Blob), `DevViewPage` Veröffentlichen – dort ist Hardcoding **K2** fachlich richtig.

---

## 7. Bereits eingebaute „Heiler“

- **`repairOek2ArtworksIfContaminated`:** `k2-oeffentlich-artworks` mit echten K2-Werknummern → Reset auf Muster.
- **`getPageContentGalerie('oeffentlich')`:** entfernt K2-Medienpfade aus ök2-Seitengestaltung beim Lesen.

---

## Kurz-Fazit

**Vermischung passiert nicht, weil die Regel „schwach“ ist, sondern weil:**

1. **Gemeinsamer Browser-Speicher** (eine Session, viele Routen),
2. **Direkte Key-Nutzung** ohne Mandanten-Abfrage,
3. **Race/Fallback** (leerer State → falscher Fallback-Key),
4. **Schreiben aus veraltetem State** (Kontextwechsel),
5. **Restore/Import** ohne Kontext,

zusammen mit **einer gemeinsamen Codebasis** für K2 und ök2.

**Sportwagenmodus:** Eine Leseschicht pro Mandant, keine `k2-artworks`/`k2-stammdaten-*` in ök2-UI-Zweigen; nach jedem Fund **Absicherung + Test + Protokoll** (diese Datei + ggf. `FEHLERANALYSEPROTOKOLL.md`).
