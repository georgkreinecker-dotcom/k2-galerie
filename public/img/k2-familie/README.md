# Bilder für die K2-Familie-Präsentationsmappe (Kunde)

Screenshots für `public/k2-familie-praesentation-mappe/` – Kapitel **„So sieht es aus“**.

- **Quelle:** Musterfamilie Huber / Demo, **keine** echten Kundendaten.
- **Benennung:** siehe `05-SO-SIEHT-DAS-AUS-BILDER.md` (z. B. `pm-stammbaum.png`).
- **Einbindung:** `/img/k2-familie/<dateiname>` in der Markdown-Datei.
- **Erzeugen:** Vite auf Port **5177**, dann im Projekt: `npm run capture:k2-familie-praesentation-map` (Skript: `scripts/capture-k2-familie-praesentation-map.mjs`).
- **Rundgang:** Das Skript setzt `localStorage` wie ein abgeschlossener Muster-Rundgang (`k2-familie-muster-huber-leitfaden-abgeschlossen`), damit die Seite **ohne** Begrüßungs-Modal fotografiert wird.
