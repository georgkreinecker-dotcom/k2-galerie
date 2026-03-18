# K2 Familie – Stammbaum-Grafik: Fehleranalyse & Perfektion

**Entscheidung:** Wir arbeiten mit unserer eigenen Grafik (`FamilyTreeGraph.tsx`) weiter und perfektionieren sie – sie ist übersichtlicher als D3-Tree und React Flow. Die PoCs bleiben optional zum Vergleichen.

**Zweck:** Fehler und Schwachstellen systematisch erfassen, damit wir sie nacheinander beheben und „was Gescheites daraus machen“.

---

## 1. Zentrierung & erster Eindruck

| Thema | Stand | Risiko / offen |
|-------|--------|------------------|
| **Initialer Pan** | `useState(initialPan)` – erster Render schon zentriert (kein Sprung von 0,0). | ✅ umgesetzt |
| **Scroll zurücksetzen** | Bei Layout-/Datenänderung: `scrollTop = 0`, `scrollLeft = 0` im Wrapper. | ✅ umgesetzt |
| **Inhaltsmittelpunkt** | contentCx/contentCy aus min/max aller Knoten inkl. „Du“-Platz (EXTRA_BELOW). | Prüfen: Bei sehr breitem Baum kann die „Mitte“ asymmetrisch wirken. |
| **Viewport vs. viewBox** | SVG viewBox = logische Größe; Wrapper overflow:auto. | Bei starkem Zoom (scale) oder kleinen Viewports ggf. Randfälle. |

**Nächste Schritte (optional):** Bei sehr breitem Baum prüfen, ob Zentrierung horizontal/vertikal für alle Bildschirmgrößen passt.

---

## 2. Partner-Ebenen & Darstellung

| Thema | Logik heute | Risiko / offen |
|-------|-------------|------------------|
| **Partner nur in partners-Liste** | `partnerOnlyIds`: Person ohne Eltern, nur als Partner → Ebene = Ebene des Partners (min. 1). | ✅ Partner erscheinen in derselben Zeile wie Partner. |
| **Reihenfolge in der Zeile** | Zuerst `orderInGeneration` (positionAmongSiblings, Du, „Geschwister N“), dann Partner direkt hinter ihre Person angehängt. | **Problem:** Wenn Geschwister-Reihenfolge falsch ist (z. B. Martina, Maria, Lukas), wirkt die ganze Zeile falsch – weil positionAmongSiblings fehlt oder nicht gesetzt ist. |
| **Y-Versatz Partner** | Partner immer `baseY + NODE_H/2` (halbe Icon-Höhe unter der „Hauptperson“). | Vereinbart; kann bei vielen Partnern in einer Zeile unruhig wirken. |
| **Partner-Linie** | Gestrichelte Linie zwischen Partnern; nur wenn beide Position haben. | ✅ |

**Bekannte Schwachstelle:** Reihenfolge „Martina / Maria / Lukas“ (oder andere Geschwister) stimmt nur, wenn `positionAmongSiblings` an den Personen gesetzt ist oder „Du“ + `ichBinPositionAmongSiblings` gesetzt ist. Sonst Sortierung nach parentIndex oder alphabetisch (id/name) → kann falsche Reihenfolge ergeben.

**Behoben (17.03.26):** Kleinfamilien-Muster eingeführt: In jeder Zeile, in der **Du** und **ein Partner von Du** vorkommen, wird **zuerst Du ausgegeben**, dann der Partner. So steht Martina **rechts** von Georg, einen halben Icon darunter. Doku: **K2-FAMILIE-STAMMBAUM-KLEINFAMILIEN-MUSTER.md**.

**Nächste Schritte:**  
- Sicherstellen, dass beim Anlegen/Bearbeiten von Personen `positionAmongSiblings` gesetzt/aktualisiert wird.  
- UI: In der Stammbaum-Ansicht „Reihenfolge korrigieren“ (z. B. „Das bin ich“ setzen) nutzbar machen und ggf. „Position unter Geschwistern“ pro Person editierbar.

---

## 3. Sortierung & Reihenfolge (Kern für „richtige“ Anzeige)

| Quelle | Verwendung | Problem wenn fehlt |
|--------|------------|---------------------|
| **positionAmongSiblings** | Pro Person (1, 2, 3, …) – direkte Quelle für Reihenfolge in der Zeile. | Fehlt → Fallback parentIndex oder localeCompare → evtl. falsche Reihenfolge. |
| **ichBinPersonId + ichBinPositionAmongSiblings** | „Du“-Person und ihre Position unter Geschwistern. | Nur eine Person; Rest der Geschwister braucht positionAmongSiblings. |
| **Name „Geschwister N“ / „Kind N“** | Regex-Fallback für Sortierung. | Nur wenn Namenskonvention genutzt wird. |

**Konkrete Fehlerklasse:** „Martina, Maria, Lukas stehen falsch“ = in den meisten Fällen fehlende oder falsche `positionAmongSiblings` (oder „Du“ nicht gesetzt). Lösung: Datenpflege + ggf. Default-Reihenfolge (z. B. nach Erstellungsreihenfolge oder Name) als letzter Fallback, dokumentiert.

**Nächste Schritte:**  
1. Doku/Handbuch: „Reihenfolge im Stammbaum“ = positionAmongSiblings bzw. „Das bin ich“ setzen.  
2. Optional: In Person bearbeiten ein Feld „Position unter Geschwistern (1, 2, 3, …)“ sichtbar und speicherbar.  
3. Prüfen, ob beim Hinzufügen von Geschwistern positionAmongSiblings automatisch gefüllt werden kann (z. B. N+1).

---

## 4. Drag / Pan & Interaktion

| Thema | Stand | Risiko / offen |
|-------|--------|------------------|
| **Pan (Maus)** | Maus runter → bewegen → hoch; pan wird in State gesetzt, SVG transform. | ✅ |
| **Klick auf Link** | Link um Knoten-Inhalt; „Das bin ich“-Button mit stopPropagation. | Drag startet trotzdem, wenn Maus auf Link bewegt wird – kann versehentliches Ziehen verursachen. |
| **Cursor** | grab / grabbing. | ✅ |
| **Touch** | Kein explizites Touch-Handling (nur Maus). | Auf Tablets/Handy: Pan könnte fehlen oder ungenau sein. |

**Nächste Schritte:**  
- Optional: Nur als „Drag“ werten, wenn Mausbewegung über Schwellwert (z. B. 5px) – dann Link-Klick unterdrücken, sonst Link erlauben.  
- Optional: Touch-Events (touchstart/touchmove/touchend) für Pan auf Mobilgeräten.

---

## 5. Linien (Eltern–Kind, Partner)

| Thema | Stand | Risiko / offen |
|-------|--------|------------------|
| **Eltern–Kind** | Von Mitte zwischen Eltern (oder Einzelparent) vertikal nach unten, dann horizontal, dann zum Kind. | ✅ |
| **Partner als „Elternteil“** | Wenn jemand fälschlich als Kind eines Partners eingetragen ist: Linie wird unterdrückt (asChildOfPartner). | ✅ Datenfehler werden nicht als Linie gezeichnet. |
| **Partner-Linie** | Gestrichelt zwischen Partnern. | ✅ |
| **Mehr als 2 Eltern** | Nur erste zwei Eltern für Mittelpunkt; Rest ignoriert. | Modell hat parentIds als Array; bei >2 Eltern nur 2 berücksichtigt – ggf. Doku. |

---

## 6. Druck & Darstellung

| Thema | Stand |
|-------|--------|
| **printMode** | Keine Klick-Links, druckfreundliche Farben, „Du“-Label. |
| **noPhotos** | Option für schlanken Druck (nur Initial/Icon). |
| **scale** | Für Poster/A3 größerer scale. |

Keine bekannten Fehler gemeldet; bei Bedarf Randabstände und Seitenumbruch prüfen.

---

## 7. Performance & große Bäume

- useMemo für Layout (levelMap, rows, nodePos, connectors, partnerLinks, initialPan).  
- Bei sehr vielen Personen (z. B. 100+): ein einziges großes SVG; kein Virtualisieren.  
- Siehe auch: docs/K2-FAMILIE-SKALIERUNG-GROSSFAMILIEN.md.

---

## 8. Zusammenfassung – Prioritäten für Perfektion

1. **Reihenfolge (Martina/Maria/Lukas etc.):** positionAmongSiblings und „Du“-Position konsequent nutzbar machen + dokumentieren; ggf. Feld „Position unter Geschwistern“ in Person bearbeiten.  
2. **Zentrierung:** Bereits abgesichert; bei Auffälligkeiten mit sehr breiten Bäumen nachbessern.  
3. **Pan vs. Klick:** Optional Schwellwert für Drag, damit Klick auf Person nicht versehentlich als Pan zählt.  
4. **Touch:** Optional Pan für Mobilgeräte ergänzen.  
5. **PoCs:** D3-Tree und React Flow als optionale Ansichten belassen; Fokus bleibt unsere Grafik.

---

Stand: 16.03.26. Nach jeder behobenen Stelle hier kurz vermerken (Datum, was geändert).
