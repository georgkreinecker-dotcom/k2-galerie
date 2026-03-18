# K2 Familie – Stammbaum-Grafik: Struktur und Zentrierung

## Koordinatensystem

- **viewBox:** `0 0 width height` (logische Einheiten, z.B. 800 x 1200).
- **Inhalt:** Alles in `<g transform="translate(pan.x, pan.y)">`. Knoten-Positionen `pos` sind in diesem Koordinatensystem; jeder Knoten wird mit `translate(pos.x - NODE_W/2, pos.y - NODE_H/2)` gezeichnet (Knotenmittelpunkt = pos).
- **Zentrierung:** Inhaltsmittelpunkt (contentCx, contentCy) soll in der Viewport-Mitte (width/2, height/2) liegen → `initialPan = (width/2 - contentCx, height/2 - contentCy)`.

## Vereinbarungen (fest)

- **Partner:** Immer um **halbe Icon-Höhe** (NODE_H/2) unter Geschwister/Du versetzen.
- **Start:** Grafik beim Öffnen und bei Daten-/Layoutänderung **immer zentriert** (Mittelpunkt des Baums = Mitte des sichtbaren Bereichs).

## Bekannte Strukturfehler (und Behebung)

1. **Pan mit (0,0) initialisiert** → Erster Render unzentriert, erst useEffect setzt initialPan → sichtbarer Sprung.  
   **Fix:** `useState(initialPan)` statt `useState({ x: 0, y: 0 })`, damit der erste Paint schon zentriert ist.

2. **Wrapper mit overflow: auto** → Scrollposition wird bei Zentrierung nicht zurückgesetzt; Nutzer sieht ggf. falschen Ausschnitt.  
   **Fix:** Beim Setzen von initialPan Wrapper-Ref nutzen und `scrollTop = 0`, `scrollLeft = 0` setzen.

3. **initialPan nur bei [initialPan.x, initialPan.y]** → Relevante Änderungen (z.B. personen) führen trotzdem zu neuem initialPan und useEffect aktualisiert korrekt.

Stand: Analyse 17.03.26.
