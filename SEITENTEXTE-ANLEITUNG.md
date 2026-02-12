# 📝 Seitentexte – Texte pro Seite zentral bearbeiten

## Idee

Die **Textversion** der App (z. B. wenn nur Text angezeigt wird) dient als Vorlage: Alle sichtbaren Texte der wichtigsten Seiten können in **einer** Oberfläche gepflegt werden.

## Wo findest du es?

**Einstellungen** → Tab **📝 Seitentexte**

(Dasselbe Menü wie Stammdaten, Design, Drucker – dort der vierte Tab.)

## Was kannst du bearbeiten?

- **Startseite (Mission Deck):** Überschrift, Untertitel, Hinweis, alle Karten (Titel, Beschreibung, Button-Text) und Quick-Links.
- **Projekt-Start:** Überschrift, Untertitel, die vier Karten (Galerie, Control-Studio, Projektplan, Mobile-Connect).
- **Galerie-Seite:** Seitentitel, Willkommens-Überschrift, Willkommenstext.

Änderungen werden **automatisch gespeichert** (localStorage + beim Veröffentlichen in der exportierten `gallery-data.json` als `pageTexts`).

## Wo wirken die Texte?

- **Startseite** (`/`): Überschrift, Untertitel, Karten und Quick-Links kommen aus den Seitentexten.
- **Projekt-Start** (z. B. `/projects/k2-galerie` im Fallback ohne Dev-View): Überschrift, Untertitel und Karten kommen aus den Seitentexten.
- **Galerie:** Die Felder in „Galerie-Seite“ sind vorbereitet für künftige Anzeige (z. B. Willkommenstext auf der öffentlichen Galerie).

## Technisch

- Konfiguration: `src/config/pageTexts.ts` (Defaults + `getPageTexts()` / `setPageTexts()`).
- Speicher: `localStorage` unter `k2-page-texts`, im Export unter `pageTexts`.
- Einstellungen-UI: Tab „Seitentexte“ in `ScreenshotExportAdmin` (components).

Wenn du neue Seiten oder neue Textfelder brauchst, können sie in der gleichen Struktur ergänzt werden.
