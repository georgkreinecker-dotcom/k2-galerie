# K2 vs. ök2 – strikte Datentrennung

**Stand:** 16.02.26

## Warum diese Trennung

- **K2** = deine echte Galerie (Martina & Georg, echte Werke, Stammdaten).
- **ök2** = öffentliche Demo (Musterwerke, Mustertexte).

Arbeiten in der ök2 (Admin von der Willkommensseite „Galerie öffentlich“) darf **niemals** K2-Daten lesen oder überschreiben. Dafür gibt es getrennte Speicher-Keys.

## Technische Umsetzung

- **Admin-Kontext:**  
  Wenn du den Admin von der **ök2-Willkommensseite** aus öffnest (`/admin?context=oeffentlich`), läuft der Admin im **ök2-Kontext**.  
  Wenn du den Admin von der **K2-Galerie** aus öffnest, läuft er im **K2-Kontext**.

- **Getrennte localStorage-Keys:**

  | Daten              | K2 (echte Galerie)      | ök2 (Demo)                        |
  |--------------------|-------------------------|-----------------------------------|
  | Werke              | `k2-artworks`           | `k2-oeffentlich-artworks`         |
  | Events             | `k2-events`             | `k2-oeffentlich-events`           |
  | Dokumente          | `k2-documents`          | `k2-oeffentlich-documents`        |
  | Stammdaten         | `k2-stammdaten-*`       | in ök2 nicht geschrieben          |
  | **Seitentexte**    | `k2-page-texts`        | `k2-oeffentlich-page-texts`       |
  | **Seitengestaltung** | `k2-page-content-galerie` | `k2-oeffentlich-page-content-galerie` |
  | **Design**         | `k2-design-settings`    | `k2-oeffentlich-design-settings`  |

  **Wichtig:** Auf der ök2-Galerie (QR / galerie-oeffentlich) müssen Texte und Bilder aus den **ök2-Keys** kommen. In GaleriePage/GalerieVorschauPage daher immer `getPageTexts(musterOnly ? 'oeffentlich' : undefined)` und `getPageContentGalerie(musterOnly ? 'oeffentlich' : undefined)` verwenden – nie ohne Tenant, sonst erscheinen K2-Inhalte auf der ök2-Seite (Vermischung).

- **Im ök2-Admin:**
  - Es wird **nie** in `k2-artworks`, `k2-events`, `k2-documents` oder Stammdaten geschrieben.
  - Auto-Save läuft **nur** im K2-Admin, nicht im ök2-Admin.
  - „Sync vom Server“ und „Veröffentlichen“ sind nur in der K2-Galerie verfügbar (Hinweis im Admin).

- **Ök2-Werke:**  
  Wenn unter `k2-oeffentlich-artworks` noch nichts liegt, zeigt der ök2-Admin die **Musterwerke** aus der Konfiguration (z. B. „Musterwerk Bilder 1/2“, „Musterwerk Skulptur 1/2“).

- **Shop: „Zur Galerie“ und Kontakt (Telefon/E-Mail)**  
  Im Shop entscheidet **fromOeffentlich** über Link und Kontakt. **fromOeffentlich** wird aus **vier Quellen** abgeleitet (robust gegen State-Verlust):
  1. `location.state.fromOeffentlich === true`
  2. `sessionStorage['k2-shop-from-oeffentlich'] === '1'`
  3. `sessionStorage['k2-admin-context'] === 'oeffentlich'` (ök2-Kassa)
  4. `document.referrer` enthält `galerie-oeffentlich`  
  Wenn **fromOeffentlich** true: „Zur Galerie“ → `galerie-oeffentlich-vorschau`, Kontakt aus **MUSTER_TEXTE.gallery**. Sonst: K2-Galerie-Vorschau, Kontakt aus Stammdaten (k2-stammdaten-galerie).  
  **Admin „Kasse“-Link:** muss `state={{ openAsKasse: true, fromOeffentlich: isOeffentlichAdminContext() || undefined }}` übergeben, damit ök2-Kassa den richtigen Kontext setzt.

- **Admin: alle Galerie-/Vorschau-Links**  
  Jeder Link zur Galerie oder zur Vorschau („Zur Galerie“, „Seite 2 anzeigen“, „So sehen Kunden die Galerie“) muss **im ök2-Admin** auf `galerieOeffentlich` / `galerieOeffentlichVorschau` zeigen, **im K2-Admin** auf `galerie` / `galerieVorschau`. Immer `isOeffentlichAdminContext()` prüfen.

## Wenn K2-Daten einmal weg waren

Falls durch einen früheren Fehler K2-Daten überschrieben wurden:

1. **Einstellungen** in der App öffnen (K2-Galerie, nicht ök2).
2. **Backup & Wiederherstellung** → **„Aus letztem Backup wiederherstellen“**.  
   Das nutzt das automatische Vollbackup (alle 5 Sekunden), sofern vorhanden.

Danach: Nur noch in der **K2-Galerie** arbeiten, wenn du echte Daten änderst. In der **ök2** nur Demo-Anpassungen vornehmen – dann bleiben K2-Daten unberührt.

---

## ök2 funktionssicher machen (Checkliste für neue Änderungen)

- [ ] **Laden:** Wird `musterOnly` / `tenantId === 'oeffentlich'` beim Laden von Werken, Stammdaten, **Seitentexten** (`getPageTexts(tenantId)`) und **Seitengestaltung** (`getPageContentGalerie(tenantId)`) berücksichtigt? Nie `getPageTexts()` oder `getPageContentGalerie()` ohne Tenant auf ök2-Routen.
- [ ] **Schreiben:** Schreibt der Code im ök2-Kontext nur in `k2-oeffentlich-*` (inkl. page-texts, page-content-galerie, design-settings), nie in K2-Keys?
- [ ] **Shop:** „Zur Galerie“ und Kontakt (displayPhone/displayEmail) immer aus **fromOeffentlich** (alle vier Quellen). Kasse-Link aus Admin mit `fromOeffentlich: isOeffentlichAdminContext()`.
- [ ] **Admin:** Jeder Link zu Galerie/Vorschau prüft `isOeffentlichAdminContext()` und nutzt dann galerieOeffentlich/galerieOeffentlichVorschau, sonst galerie/galerieVorschau.
- [ ] Auto-Save / Veröffentlichen: Nur im K2-Admin, im ök2-Admin deaktiviert oder mit Hinweis.
- [ ] Regel in jeder Session: `.cursor/rules/k2-oek2-trennung.mdc` (alwaysApply) – bei Änderungen an Galerie/Admin/Stammdaten/Seitentexten/Shop prüfen.
