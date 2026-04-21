# Bilder für die K2-Familie-Präsentationsmappe (Kunde)

Screenshots für `public/k2-familie-praesentation-mappe/` – Kapitel **„So sieht es aus“**.

- **Quelle:** Musterfamilie Huber / Demo, **keine** echten Kundendaten.
- **Benennung:** siehe `05-SO-SIEHT-DAS-AUS-BILDER.md` (z. B. `pm-stammbaum.png`, `pm-familiengrafik-huber.png`).
- **Einbindung:** `/img/k2-familie/<dateiname>` in der Markdown-Datei.
- **Deckblatt (Druck/PDF):** `pm-familie-einstieg.png` – volle **Eingangsseite** Musterfamilie Huber (wie im Browser: Leiste, Karte „Was möchtest du tun?“). Dasselbe Bild nutzt `K2FamiliePraesentationsmappeKundePage` als A4-Deckblatt.
- **Präsentationsmodus:** Einmal `?pm=1` (oder `&pm=1`) in der URL – **ohne** Impressum-Footer und **ohne** Huber-Rundgang-Modal; bleibt in der Tab-Sitzung bei Navigation erhalten. Zurück zum normalen Footer: **`?pm=0`** anhängen oder Tab neu.
- **Erzeugen:** Vite auf Port **5177**, dann im Projekt: `npm run capture:k2-familie-praesentation-map` (Skript hängt `pm=1` an – **ohne** unteren Impressum-Balken und **ohne** Huber-Rundgang-Modal). Manuell im Browser: dieselbe Route mit **`?pm=1`** (bzw. `&pm=1`) öffnen.
- **Rundgang:** Das Skript setzt `localStorage` wie ein abgeschlossener Muster-Rundgang (`k2-familie-muster-huber-leitfaden-abgeschlossen`), damit die Seite **ohne** Begrüßungs-Modal fotografiert wird.
