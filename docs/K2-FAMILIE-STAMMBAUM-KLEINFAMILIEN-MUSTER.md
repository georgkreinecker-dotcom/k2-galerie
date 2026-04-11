# K2 Familie – Stammbaum: Familienzweig-Muster (verbindlich)

**Begriff (Stand 10.04.26):** In der App heißt die Struktur **Familienzweig** (nicht mehr „Kleinfamilie“): ein **im Baum erkennbarer Ast** – mit Paaren, Kindern und Partnern der Kinder; derselbe Aufbau kann sich innerhalb eines Astes wiederholen. Dateiname und alte Verweise: `K2-FAMILIE-STAMMBAUM-KLEINFAMILIEN-MUSTER.md`.

**Zweck:** Eine klare, wiederholbare Struktur für die Darstellung (Paar + Kinder + ggf. Partner der Kinder). Die Grafik folgt diesem Muster, damit es nicht zu „Martina oben links“ oder falschen Partner-Positionen kommt.

### Teil-Zweige innerhalb eines Familienzweigs

- **Großfamilie:** Pro Geschwister ein Block **Familienzweig N** – das ist der **Hauptast** dieser Person (sie selbst, Partner, Kinder, Partner der Kinder).
- **Eine Ebene tiefer:** Haben mehrere Kinder je einen Partner, entstehen **mehrere erkennbare Teil-Strukturen** (Kind + Partner, ggf. mit eigenen Kindern). Sie verhalten sich strukturell wie **weitere „kleine“ Familienzweige** im selben farbigen Block – sie **spalten sich** durch Partnerschaften sichtbar ab, auch wenn die Liste noch **einen** Abschnitt zeigt (z. B. sieben Personen, darin drei Paar-Linien).
- **App-Stand:** Die **Grafik** zeigt Paare und Zeilen; bei **Nur mein Familienzweig** ist die **Kartenliste** ein zusammenhängender Block – **eigene Unter-Blöcke pro Kind/Teil-Zweig** sind eine mögliche spätere Erweiterung.

### Organisationsprinzip: organisches Wachstum (endlos erweiterbar)

**Verbindlich für K2 Familie Stammbaum und alles, was daran andockt.**

| Prinzip | Bedeutung |
|--------|-----------|
| **Ein Muster, viele Ebenen** | Dasselbe Ordnungsbild (Paar → Kinder → Partner der Kinder) **wiederholt sich** auf jeder Ebene – ohne feste Tiefe. Teil-Zweige sind wieder Familienzweige im Kleinen. |
| **Organisch** | Wachstum kommt aus den **Karten** (neue Personen, Beziehungen, Zeiträume) – nicht aus einem starren Formular, das irgendwann „voll“ ist. |
| **Endlos** | Technik und Darstellung so auslegen, dass **weitere Generationen**, Teil-Zweige, Geschwister-Äste und **Erweiterungen der Oberfläche** (Unter-Blöcke, Filter, Druck) **nachlegen** können – **statt** das Modell neu zu erfinden. |
| **Eine Quelle** | Beziehungen weiterhin **nur aus den Karten** (`parentIds`, `childIds`, `partners`, …); jede neue UI-Schicht **liest** dasselbe Modell – keine zweite Wahrheit. |

**Konsequenz:** Features (z. B. Klapp-Blöcke pro Teil-Zweig) sind **Schichten auf demselben Fundament**, nicht ein neues Organisationsprinzip.

---

## Referenz: „Kleinfamilie“ als Grundstruktur (verbindlich)

**Gilt für jeden Familienzweig** – ob der Baum später **13** sichtbare Zweige oder mehr hat: **dieselbe** geometrische und logische Einheit, nur mit **mehr oder weniger** Personen und Ebenen.

| Element | Bedeutung |
|--------|-----------|
| **Paar-Mitte** | Waagrechte **gestrichelte** Linie zwischen zwei Partnern; die **Senkrechte** nach unten startet an der **Mitte** dieser Linie (nicht am linken oder rechten Knoten allein). |
| **Kinder einer Kernfamilie** | Alle Kinder mit **dieselben** in der Grafik vorhandenen Eltern (`parentIds` → gleicher Schlüssel `familyClusterKeyChild` im Code) bilden **eine** Gruppe. |
| **Zentrierung** | Die **gesamte** Geschwister-Reihe (Knoten-Mitten) ist **unter der Paar-Mitte** ausgerichtet; Abstand zwischen Geschwistern = `NODE_W + COL_GAP` (ein Raster). |
| **T-Stück / Gabel** | Pro **Eltern–Kind**-Kante: Senkrechte von den Eltern zur Brückenhöhe, dann **nur** ein waagrechter Balken über die **X-Spanne** von Elternknoten und **diesem** Kind (kein durchgehender Balken nur zwischen Cousins). Cousins verschiedener Elternpaare **teilen** keine gemeinsame waagrechte „Sammellinie“ – jede Kernfamilie hat ihr **eigenes** T-Stück. |
| **Reihenfolge** | Links nach rechts = **Karten-Reihenfolge** (`orderInGeneration` / `childIds` auf der Elternkarte wo zutreffend) – dieselbe Quelle wie in der Personenliste. |

**Skalierung (z. B. 13 Familienzweige):** Es gibt **kein** anderes Layout pro „Zweig 7“ oder „Zweig 2“. Jeder Zweig ist eine **Kette** aus wiederholten Kleinfamilien-Einheiten (Paar → Kinder → ggf. nächste Paare). Die **Grafik** skaliert durch **mehr Knoten** und **mehr Kanten**, nicht durch ein zweites Regelwerk.

**Umsetzung im Code (Stichworte):** `placeBottomRowFromParentCenters` (unterste Generation: Gruppen unter Eltern-Mitte, Kollisionen nur **ganze Gruppe** nach rechts), `familyClusterKeyChild` (Gruppierung), `mergeConnectorsAvoidDoubleHorizontal` + Pfade mit `mergedParents` (Linien pro Kind/Elternset), `bridgeYOffsetForChild` (leichte Staffelung der Brücken-Y je Kernfamilie, damit Linien sich nicht zu einem optischen **einen** Balken über alle Familien summieren).

---

## 1. Grundregel pro Zeile (Generation)

- **Reihenfolge in der Zeile:** Zuerst die „Hauptperson“ eines Paars, **sofort daneben (rechts)** deren Partner.
- **Partner-Platzierung:** Partner steht **rechts** von der Person, mit der er/sie ein Paar bildet, und **einen halben Icon (NODE_H/2) darunter** – so wirkt das Paar nebeneinander, Partner leicht tiefer.
- **„Du“ (ichBinPersonId):** Wenn in einer Zeile „Du“ und dessen Partner vorkommen, kommt **immer zuerst Du**, dann der Partner (z. B. Georg, dann Martina). So steht Martina rechts neben Georg, einen halben Icon darunter.

---

## 2. Familienzweig – typisches Bild

```
     [Eltern-Paar: z. B. Vater | Mutter (Partner halber Icon darunter)]
                          |
     [Georg Du]  [Martina]     ← Georg links, Martina rechts, Martina halber Icon darunter
          \___________/
                 |
     [Kind1] [Kind2] [Kind3] [Kind4]     ← unsere 4 Kinder
        |       |       |       |
     [P1]    [P2]    [P3]    [P4]        ← Partner der Kinder (falls vorhanden), je halber Icon darunter
```

- **Zeile Kernpaar:** Georg (Du), Martina (Partner) – Martina **rechts** von Georg, **halber Icon darunter**.
- **Zeile Kinder:** Die 4 Kinder in fester Reihenfolge (positionAmongSiblings). Pro Kind, das einen Partner hat: Partner **rechts daneben**, **halber Icon darunter**.

---

## 3. Umsetzung im Code (FamilyTreeGraph)

**Datei:** `src/components/FamilyTreeGraph.tsx`.

**Kleinfamilie unter den Eltern (unterste sichtbare Kindergeneration):** `placeBottomRowFromParentCenters` legt Kinder **pro Kernfamilie** (gleicher `familyClusterKeyChild`) unter die **Mitte der Elternknoten** in der Zeile darüber; bei Überschneidung mit der **linken** Nachbarfamilie wird die **gesamte** Gruppe nach rechts geschoben – nicht `enforceNonOverlappingRow` auf globaler Zeile nach dem Zentrieren (das hätte nur nach rechts geschoben und die Mitte zerstört).

1. **Pivot in der Zeile (z. B. Elternzeile):** Wenn in einer Zeile **eine Person 2 oder mehr Partner** hat (z. B. Vater mit Anna und Mathilde), wird diese Person **zuerst** gesetzt → steht **ganz oben**; die Partner (Frauen) stehen rechts daneben und **einen halben Icon darunter**. So steht der Vater oben, links und rechts die Frauen versetzt.
2. **Reihenfolge in der Zeile (ohne Pivot):** Wenn in der Zeile **Du** und ein Partner von Du vorkommen, wird **zuerst Du** ausgegeben, dann alle Partner in dieser Zeile. Sonst: Person mit Kindern vor Partner ohne Kinder.
3. **Partner-Versatz Y:** Nur der **Zweite im Paar** (direkt hinter der Person in der Zeile) bekommt `baseY + NODE_H/2`; die erste Person der Zeile (bzw. der Pivot) bleibt auf `baseY`.
4. **Partner immer rechts:** Partner werden „direkt hinter“ die Person in der Ausgabe-Liste eingefügt, also rechts daneben.
5. **Kinder-Linien:** Die Linie Eltern → Kind geht von der **Mitte aller in parentIds des Kindes** genannten Elternteile zum Kind. Damit **beide** Elternteile (z. B. Anna und Georg) sichtbar sind, müssen die Kinder **beide** in `parentIds` haben; sonst geht die Linie nur von einem Elternteil.

---

## 4. Kinder-Reihenfolge

- Die 4 Kinder in der richtigen Reihenfolge: **positionAmongSiblings** (1, 2, 3, 4) an den Personen oder „Du“-Position für das eine Kind, das Du bist. Fehlt die Position, Fallback nach Name/Id (kann falsch wirken).
- Pro Kind mit Partner: Partner **rechts daneben**, **halber Icon darunter** – gleiches Muster wie beim Kernpaar.

---

## 5. Elternzeile (z. B. Anna, Georg, Mathilde)

- **Pivot in der Mitte:** Wer in der Zeile **zwei oder mehr Partner** hat (z. B. der Vater), steht **in der Mitte** – **links** die erste Partnerin (Reihenfolge wie in den Karten, z. B. Anna = Mutter von Rupert, Burgie, Anna, Maria), **rechts** die zweite (z. B. Mathilde = Mutter der anderen Kinder). Reihenfolge kommt aus der `partners`-Liste der Pivot-Person (erster Eintrag = links, zweiter = rechts).
- **Versatz:** Nur der Pivot (Georg) steht **ganz oben**; **beide** Partnerinnen (Anna und Mathilde) **einen halben Icon darunter**.
- **„Anna Mutter der ersten 4“:** Damit die Linie von **beiden** Elternteilen zu den Kindern geht, müssen die 4 Geschwister **Anna und Georg** in ihren **parentIds** haben. Fehlt Anna bei den Kindern, geht die Linie nur vom Vater; in der Person bearbeiten → Elternteil Anna hinzufügen.

## 6. Übersicht bei vielen Geschwistern (Unterzeilen)

- **Lange Zeilen werden aufgeteilt:** Hat eine Generation viele Personen (z. B. 10+), wird sie in **Blöcke** (Geschwister + deren Partner) zerlegt. Ab **3 Blöcken** wird jeder Block eine **eigene kurze Zeile** (Unterzeile).
- **SUB_ROW_H:** Unterzeilen derselben Generation haben geringeren Abstand; zwischen Generationen bleibt ROW_H. So bleibt die Grafik übersichtlich statt einer langen Kette.
- **Quelle nur Karten:** Wer ein Block ist, leitet sich aus `partners` ab; keine zusätzliche Logik.

## 7. Kurzfassung

- **Pivot (2+ Partner in Zeile) zuerst** → steht oben; Partner versetzt. **Du zuerst, dann Partner** in der eigenen Zeile.
- **Kinder** in fester Reihenfolge (positionAmongSiblings); **deren Partner** rechts daneben, halber Icon darunter.
- **Kinder-Linien:** Beide Eltern in parentIds der Kinder eintragen, damit die Verbindung von beiden sichtbar ist.
- **Viele Geschwister:** Ab 3 Blöcken → Unterzeilen pro Block (eine kurze Zeile pro Paar/Einheit).

Stand: 17.03.26 · Ergänzt Referenz Kleinfamilie + 13-Zweige-Skalierung: 10.04.26
