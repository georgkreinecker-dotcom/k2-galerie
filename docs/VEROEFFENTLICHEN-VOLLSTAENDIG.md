# Veröffentlichen: Immer vollständige Lieferung

## Regel (ein für alle Mal)

**Beim Klick auf „Veröffentlichen“ müssen alle Daten mit, die sich seit dem letzten Veröffentlichen verändert haben – keine halbe Lieferung.**

---

## Was beim Veröffentlichen mitgeht

| Daten | Quelle | Regel |
|-------|--------|--------|
| **Stammdaten** (Martina, Georg, Galerie) | **Admin-State** (was im Formular steht), Fallback localStorage | Was du siehst, geht raus. |
| **Galerie-Bilder** (Willkommen, Karte, Rundgang) | State + `k2-page-content-galerie` + Stammdaten | Immer alle drei Quellen mergen, nie weglassen. |
| **Design** (Farben, Theme) | **Admin-State** (designSettings), Fallback localStorage | Aktuelles Design mit. |
| **Seitentexte** | **Admin-State** (pageTexts), Fallback localStorage | Aktuell angezeigte Texte mit. |
| **Werke** | **State + localStorage** gemergt (nach Nummer/ID) | Kein Werk weglassen; Union aus beiden. |
| **Events** | State, sonst localStorage; bis 100 Einträge | Alle sichtbaren mit. |
| **Dokumente** | State, sonst localStorage; bis 100 Einträge | Alle sichtbaren mit. |

---

## Umsetzung im Code

- **ScreenshotExportAdmin** (Einstellungen → Veröffentlichen): Export baut das Payload aus **State zuerst** (martinaData, georgData, galleryData, designSettings, pageTexts, events, documents, artworks), merged mit localStorage wo nötig. Galerie-Bilder: State → getPageContentGalerie() → Stammdaten. Artworks: Union State + localStorage, sortiert.
- **DevViewPage** (APf → Veröffentlichen): Liest aus localStorage (hat keinen Admin-State); gallery enthält immer Bilder aus getPageContentGalerie(); pageTexts und Limits 100 für Events/Dokumente wie im Admin.

---

## Bei Änderungen

Wenn neue Datenfelder oder neue Speicher (State/localStorage) dazukommen: **Beim Export dieselbe Regel anwenden** – aktueller State (was der Nutzer sieht) + sinnvoller Fallback, Merge statt halbe Lieferung.
