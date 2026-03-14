# Vision: Werke = Ideen & Produkte – Kunst als Träger (14.03.26)

**Status:** Idee für morgen und Umsetzung. Sportwagen-Grundsätze gelten **doppelt und dreifach** – keine Ausnahme.

---

## 1. Die große Idee

- **ök2 / Galerie** wurde für **Künstler** gedacht, ist aber **für jede Idee und jedes erdenkliche Produkt** gebaut.
- **Werke** sind heute im Kern Kunstwerke. Sie werden zu einem **Oberbegriff**: **Einträge** (eine Karte = ein Ding). **Kunstwerke** = **eine Unterkategorie** davon.
- **Marketing:** **Kunst = Träger der Idee**, der Ausgangspunkt – aber der **gesamte andere Markt** (Ideen, Produkte, Dienstleistungen) hat Platz. Kunst trägt die Botschaft; die Plattform trägt alles Weitere mit derselben Qualität.

---

## 2. Sportwagen – doppelt und dreifach (verbindlich)

Bei dieser Erweiterung gelten unsere Grundsätze **ohne Abstriche**. Jede Entscheidung wird daran geprüft:

| Grundsatz | Konkret für Werke/Ideen/Produkte |
|-----------|-----------------------------------|
| **Eine Quelle, ein Standard pro Problemstellung** | **Ein** Datenmodell für „Einträge“ (heute: Werke). Kein zweites Modell für „Produkte“ oder „Ideen“. Ein Typ-Feld oder eine Unterkategorie, **eine** Speicher-Schicht, **eine** UI-Logik (Karte, Bild, Titel, Kategorie). |
| **Eine Struktur, viele Instanzen** | Dieselbe Struktur für Künstler-Galerie, Produkt-Galerie, Ideen-Galerie. Kontext/Mandant steuert nur **was** angezeigt wird (Kunst vs. Produkte vs. Mix), nicht **wie** es technisch abgebildet ist. |
| **Kein Sonderbau pro Kunde / pro Typ** | Kein „für Kunstwerke so, für Produkte anders“. **Ein** Ablauf: Anlegen, Bearbeiten, Bild, Kategorie, Veröffentlichen, Laden. Kategorie/Typ ist **Konfiguration** (z. B. Malerei/Keramik/Produkt/Idee), keine eigene Code-Schiene. |
| **Konfiguration statt Festverdrahtung** | Kategorien und Typen (Kunstwerk, Produkt, Idee …) aus Konfiguration oder Mandanten-Setup, nicht im Code fest für alle Zeiten. So bleibt Kunst der sichtbare Ausgangspunkt, anderes wächst **in derselben Maschine** dazu. |
| **Vor dem Implementieren: Gibt es schon eine Lösung?** | „Werke“-Ablauf (Speichern, Bild, Kategorien, Galerie-Anzeige) **ist** die Lösung. Erweiterung = **dieselbe** Schicht mit erweitertem Typ/Kategorie-Set, **kein** paralleler zweiter Ablauf. |

**Regel für jede spätere Umsetzung:** Wenn eine Anpassung einen **neuen** Standard oder eine **zweite** Logik für „Produkt“ vs. „Kunstwerk“ einführt → Stopp. Erst prüfen: Lässt sich das mit **einem** Modell und **einer** Konfiguration abbilden?

---

## 3. Datenmodell / Begriffe (Richtung)

| Heute | Ziel (Sportwagen-konform) |
|-------|---------------------------|
| „Werke“ = Kunstwerke (Nummer, Kategorie M/K/G/S, Bild, Titel …) | **„Werke“ = Oberbegriff** für alle Einträge (eine Karte = ein Ding). **Kunstwerke** = Unterkategorie (z. B. `type: 'artwork'` oder Kategorien wie Malerei, Keramik, Grafik, Skulptur). Weitere Unterkategorien/Typen: z. B. `type: 'product'`, `type: 'idea'` oder Kategorien pro Mandant – **ein** Modell, **eine** Tabelle/Liste, Typ/Kategorie als Feld. |
| Kategorien fest (malerisch, keramik, …) | Kategorien **konfigurierbar** (pro Mandant oder global). Kunst-Kategorien bleiben der **Standard**; andere kommen dazu, ohne dass pro Typ eine eigene Speicher- oder UI-Schiene entsteht. |

**Eine Quelle:** Dieselbe `artworksStorage` / dieselbe Liste (z. B. `k2-artworks`), dieselbe Merge-/Sync-Logik. Das Feld `type` oder `category` entscheidet Anzeige/Filter, nicht ein zweites Datenmodell.

---

## 4. Marketing-Strategie (neu gedacht)

- **Kunst = Träger der Idee.** Außenbotschaft: Aus der Kunst heraus gedacht – Qualität, Sorgfalt, Präsentation. Einstieg und Vertrauen kommen von hier.
- **Der ganze Markt hat Platz.** Wer Ideen oder Produkte mit derselben Sorgfalt zeigen will, nutzt **dieselbe** Plattform – keine zweite Produktwelt, keine Verwässerung der Kunst, sondern **Erweiterung in einer Linie**.
- **Zwei Zweige** (wie angelegt): (1) **K2 Galerie** – Künstler weltweit, automatisierter Vertrieb; Kunst zuerst, dann Erweiterung auf Ideen & Produkte. (2) **K2 Familie** – eigener Planungszweig (Raumschiff, Grundbotschaft). Die Marketing-Strategie muss beide Zweige und die neue Linie „Kunst trägt, Markt hat Platz“ abdecken.

Die **konkrete** Strategie-Dokumentation (z. B. MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md oder Ergänzung in mök2) wird auf dieser Vision und den Sportwagen-Grundsätzen aufbauen.

---

## 5. Umsetzung (14.03.26)

- **Feld `entryType`** im Werk-Objekt eingeführt. Werte: `artwork` (Kunstwerk), `product` (Produkt), `idea` (Idee).
- **Konfiguration:** `src/config/tenantConfig.ts` – **ENTRY_TYPES**, **getEntryTypeLabel(id)**. Rückwärtskompatibel: fehlt `entryType` → wird wie `artwork` behandelt.
- **Admin (Neues Werk / Werk bearbeiten):** Dropdown „Typ“ (Kunstwerk / Produkt / Idee); gespeichert in `artworkData.entryType`.
- **Mobil (Neues Werk in GalerieVorschauPage):** Neues Werk erhält `entryType: 'artwork'`.
- Sync/Export/Import unverändert (Feld wird mitgeführt).

---

## 6. Nächste Schritte (Reihenfolge nach Klärung)

1. **Mit Georgs neuer Idee (morgen)** diese Vision schärfen – Begriffe, erste Kategorien/Typen, Formulierung „Kunst = Träger“.
2. **Datenmodell prüfen:** Reicht ein Feld `type` oder `category` (erweiterbar) auf dem bestehenden Werk-Modell? Oder eine Unterkategorie-Liste pro Mandant? **Eine** Erweiterung, keine zweite „Produkt“-Entität.
3. **Marketing-Strategie** ausarbeiten (oder AUFTRAG-MARKETING-STRATEGIE-ZWEI-ZWEIGE.md anpassen): Kunst als Träger, ganzer Markt hat Platz, zwei Zweige.
4. **Umsetzung** nur nach dem Prinzip: Jeder Schritt muss „ein Standard, eine Struktur, konfigurierbar“ erfüllen. Kein Sonderbau.

---

## 7. Verweise

- **Sportwagen:** docs/SPORTWAGEN-ROADMAP.md, PRODUKT-STANDARD-NACH-SPORTWAGEN.md; .cursor/rules/ein-standard-problem.mdc.
- **Skalierung:** docs/SKALIERUNG-KONZEPT.md (eine Struktur, viele Instanzen).
- **Produkt-Vision:** docs/PRODUKT-VISION.md (Künstler:innen, vermarktbare Version).
- **Marketing-Auftrag:** docs/AUFTRAG-MARKETING-STRATEGIE-ZWEI-ZWEIGE.md.

---

**Kurzfassung:** Werke = Oberbegriff für Einträge (Karten). Kunstwerke = Unterkategorie. Kunst = Träger der Idee; der ganze Markt hat Platz. Umsetzung **nur** nach Sportwagen: ein Modell, eine Schicht, eine UI-Logik, konfigurierbar – doppelt und dreifach.
