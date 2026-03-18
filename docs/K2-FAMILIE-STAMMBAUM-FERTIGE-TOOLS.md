# K2 Familie Stammbaum – Fertige Tools statt Eigenbau

## Warum ein fertiges Tool?

Die aktuelle Grafik ist per Hand mit SVG, eigenem Layout (Generationen, Partner-Versatz) und eigenem Pan/Zoom gebaut. Das führt zu:
- Fehleranfälligkeit (Zentrierung, Partner-Ebene, Drag)
- Ständige Nachbesserungen
- Kein bewährter Layout-Algorithmus

**Besser:** Eine etablierte Bibliothek nutzen, die Layout, Zoom, Pan und Interaktion bereits löst.

---

## Drei passende Optionen

### 1. **react-d3-tree** (sehr verbreitet)
- **npm:** `react-d3-tree` (ca. 200K Downloads/Woche)
- **Stärken:** Hierarchie-Bäume, Zoom/Pan (D3-Zoom) eingebaut, eigene Knoten möglich (`renderCustomNodeElement`), bewährt.
- **Datenmodell:** Streng parent–children (ein Baum). Partner müssten als „Geschwister“ oder Zusatzknoten modelliert werden.
- **Link:** https://github.com/bkrem/react-d3-tree

### 2. **React Flow (@xyflow/react)** + Layout (z. B. Dagre/ELK)
- **npm:** `@xyflow/react` (sehr verbreitet), Layout z. B. `dagre` oder `elkjs`
- **Stärken:** Beliebiges Knoten-/Kanten-Layout, Zoom/Pan/Drag out of the box, keine eigenen Koordinaten-Bugs.
- **Aufwand:** Stammbaum-Daten in Nodes/Edges umwandeln, Layout einmal berechnen (z. B. hierarchisch), dann anzeigen.
- **Link:** https://reactflow.dev (Layout-Beispiele: Dagre Tree, Auto Layout)

### 3. **@alexbrand09/famtreejs**
- **npm:** `@alexbrand09/famtreejs`
- **Stärken:** Explizit für Familienstammbäume, „partnership-centric“, Pan/Zoom konfigurierbar, mehrere Layout-Richtungen.
- **Nachteil:** Weniger verbreitet; müsste geprüft werden, ob es zu unseren Daten (K2 Familie) passt.

---

## Empfehlung

- **Schnell und nah an „Baum“:** **react-d3-tree** – wenig Aufwand, Layout und Zoom/Pan kommen mit. Partner entweder als zusätzliche Kinder-Ebene oder über Custom Nodes abbilden.
- **Maximal flexibel (Partner, Du, mehrere Wurzeln):** **React Flow + Dagre/ELK** – mehr Einarbeitung, dafür volle Kontrolle und kein eigenes Pan/Zoom/Layout mehr.

---

## Nächster Schritt

1. **Entscheidung:** react-d3-tree (einfacher) oder React Flow (flexibler)?
2. **Proof-of-Concept:** Bestehende `personen`-Daten in das gewählte Datenformat bringen, eine Seite nur für den Stammbaum mit der Bibliothek rendern (ohne erst die alte Grafik zu ersetzen).
3. **Wenn der PoC passt:** Alte `FamilyTreeGraph`-Logik schrittweise durch die Bibliothek ersetzen, K2-spezifische Sachen („Du“, Partner-Versatz, Links zu Personenseiten) in Custom Nodes/Handlers abbilden.

Stand: 17.03.26
