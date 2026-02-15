# K2 vs. ök2 – strikte Datentrennung

**Stand:** 14.02.26

## Warum diese Trennung

- **K2** = deine echte Galerie (Martina & Georg, echte Werke, Stammdaten).
- **ök2** = öffentliche Demo (Musterwerke, Mustertexte).

Arbeiten in der ök2 (Admin von der Willkommensseite „Galerie öffentlich“) darf **niemals** K2-Daten lesen oder überschreiben. Dafür gibt es getrennte Speicher-Keys.

## Technische Umsetzung

- **Admin-Kontext:**  
  Wenn du den Admin von der **ök2-Willkommensseite** aus öffnest (`/admin?context=oeffentlich`), läuft der Admin im **ök2-Kontext**.  
  Wenn du den Admin von der **K2-Galerie** aus öffnest, läuft er im **K2-Kontext**.

- **Getrennte localStorage-Keys:**

  | Daten        | K2 (echte Galerie) | ök2 (Demo)                 |
  |-------------|--------------------|----------------------------|
  | Werke       | `k2-artworks`      | `k2-oeffentlich-artworks`  |
  | Events      | `k2-events`        | `k2-oeffentlich-events`    |
  | Dokumente   | `k2-documents`     | `k2-oeffentlich-documents` |
  | Stammdaten  | `k2-stammdaten-*`  | werden in ök2 nicht geschrieben |

- **Im ök2-Admin:**
  - Es wird **nie** in `k2-artworks`, `k2-events`, `k2-documents` oder Stammdaten geschrieben.
  - Auto-Save läuft **nur** im K2-Admin, nicht im ök2-Admin.
  - „Sync vom Server“ und „Veröffentlichen“ sind nur in der K2-Galerie verfügbar (Hinweis im Admin).

- **Ök2-Werke:**  
  Wenn unter `k2-oeffentlich-artworks` noch nichts liegt, zeigt der ök2-Admin die **Musterwerke** aus der Konfiguration (z. B. „Musterwerk Bilder 1/2“, „Musterwerk Skulptur 1/2“).

## Wenn K2-Daten einmal weg waren

Falls durch einen früheren Fehler K2-Daten überschrieben wurden:

1. **Einstellungen** in der App öffnen (K2-Galerie, nicht ök2).
2. **Backup & Wiederherstellung** → **„Aus letztem Backup wiederherstellen“**.  
   Das nutzt das automatische Vollbackup (alle 5 Sekunden), sofern vorhanden.

Danach: Nur noch in der **K2-Galerie** arbeiten, wenn du echte Daten änderst. In der **ök2** nur Demo-Anpassungen vornehmen – dann bleiben K2-Daten unberührt.

---

## ök2 funktionssicher machen (Checkliste für neue Änderungen)

- [ ] Neue Seite/Feature: Wird `musterOnly` / `tenantId === 'oeffentlich'` beim Laden von Werken/Stammdaten berücksichtigt?
- [ ] Schreibzugriffe: Schreibt der Code im ök2-Kontext nur in `k2-oeffentlich-*`, nie in `k2-artworks` / `k2-stammdaten-*` / `k2-events` / `k2-documents`?
- [ ] Auto-Save / Veröffentlichen: Nur im K2-Admin, im ök2-Admin deaktiviert oder mit Hinweis.
- [ ] Regel in jeder Session: `.cursor/rules/k2-oek2-trennung.mdc` (alwaysApply) – bei Änderungen an Galerie/Admin/Stammdaten prüfen.
