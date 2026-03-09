# K2 Markt – Vision und Architektur

**Stand:** 09.03.26  
**Basis:** Alles, was wir im Wir-Team als Regeln geschaffen haben und im Vermächtnis hinterlegt ist. Methode: **Sportwagenmodus** (eine Quelle, ein Standard, ein Ablauf pro Problem).

---

## 1. Was K2 Markt ist

**K2 Markt** = eine App, eine Maschine, ein Mechanismus – **unterstützt durch KI** – der **fertige Produkte liefert**, um am Markt **sichtbar und wahrnehmbar** zu sein.

Nicht: noch mehr Ideen sammeln. Sondern: aus dem Vorhandenen **fertige, marktfähige Erzeugnisse** machen und sie dorthin bringen, wo sie wirken.

---

## 2. Die Grundlogik (Kette zum Markt)

| Stufe | Was | Kurz |
|-------|-----|------|
| **1. Produkt** | Fertiges Produkt, zugeschnitten auf Bedürfnisse und Wünsche von Menschen | **Grundlage** – ohne fertiges Produkt kein Marktgang |
| **2. Markt** | Der Ort, an dem ich die Ware anbiete (Dienstleistung, Ideen, reales Geschäft, Waren) | Markt **suchen** und **wählen** |
| **3. Aufmerksamkeit** | Ich muss gesehen werden | Voraussetzung für alles Weitere |
| **4. Platz zur Präsentation** | Ein guter, sichtbarer Ort für die Darbietung | „Toller Platz“ – physisch oder digital |
| **5. Emotionale Ansprache + Information** | Menschen emotional erreichen **und** die nötigen Infos liefern | Damit sie sich **für** das Produkt entscheiden können |

**Kern:** Erst fertiges Produkt → dann Markt finden → dann Aufmerksamkeit, Platz, Ansprache, Information. Die Reihenfolge ist verbindlich.

---

## 3. Wo wir stehen: Vorarbeit (mök2, Kampagne, Marketing-Strategie)

- **mök2** (Marketing ök2), **Kampagne**, **Marketing-Strategie** = viel Vorarbeit, eine Art **Brainstorming**.
- Noch **unkoordiniert**, typisch menschlich **chaotisch**: viele Ideen, ein paar gute Ansätze, aber **noch nicht fertig ausgereift**.
- Man kann es als **große Datenbank** sehen: Rohmaterial, Konzepte, Vorlagen, Ziele – aber noch **kein durchgängiger Mechanismus**, der daraus **fertige Produkte** macht.

**K2 Markt** soll genau das sein: der Mechanismus, der aus dieser „Datenbank“ und den Regeln **fertige, einsatzfähige Erzeugnisse** erzeugt und sie marktfähig macht.

---

## 4. Das Bild: Medienhaus mit Agenten

**Metapher:** K2 Markt funktioniert wie ein **Medienhaus**, in dem **alle Abteilungen wie Agenten zusammenarbeiten**.

- **Abteilungen = Agenten:** Jede „Abteilung“ hat eine klare Aufgabe (Texte, Bilder, Videos, Kanäle, Zielgruppe, …) und arbeitet nach denselben Regeln (Sportwagenmodus) – **eine Quelle, ein Standard**.
- **Zusammenarbeit:** Die Agenten liefern nicht ins Leere, sondern in einen **gemeinsamen Kreislauf**: Produktidee → Rohmaterial → Bearbeitung → Prüfung → Ausgabe.
- **Im Zentrum: ein Bildschirm** (eine zentrale Instanz), der
  - die **Produkte optisch prüft** (ist es fertig? stimmt die Qualität?),
  - **dort und da** Bilder, Videos, Texte **bearbeitet**,
  - mit **Tools auf dem letzten Stand der Technik** arbeitet.

Dieser „Bildschirm“ ist die **Kontroll- und Bearbeitungsstelle**: Qualität sichern, Lücken schließen, einheitlichen Stand sicherstellen. Kein Chaos mehr – **koordinierte Produktion**.

---

## 5. Abgeleitete Architektur (erster Entwurf)

### 5.1 Schichten

| Schicht | Aufgabe | Kurz |
|---------|----------|------|
| **A. Quelle / Datenbank** | Alles, was wir haben: mök2-Inhalte, Kampagnen-Docs, Marketing-Strategie, Vorlagen, Stammdaten, Medien | **Rohmaterial und Regeln** – eine strukturierte Quelle, keine doppelten Wahrheiten |
| **B. Agenten (Abteilungen)** | Spezialisierte Einheiten: z. B. „Text-Agent“, „Bild-Agent“, „Kanal-Agent“, „Zielgruppen-Agent“ | Jeder hat **eine** Aufgabe, **eine** Schnittstelle, liefert in den **gemeinsamen Kreislauf** |
| **C. Zentrale (Bildschirm)** | Prüft Produkte (optisch, inhaltlich), bearbeitet wo nötig (Bilder, Videos, Texte), nutzt moderne Tools | **Qualität und Einheit** – alles läuft hier durch, bevor es „fertig“ ist |
| **D. Ausgabe** | Fertige Produkte: Flyer, E-Mails, Webseiten, Social-Posts, Presse, Werbematerial – **einsatzbereit** | **Marktfähig** – kann so an den gewählten Markt (Platz, Kanal) gebracht werden |

### 5.2 Fluss (vereinfacht)

```
[Quelle: mök2, Kampagne, Strategie, Vorlagen]
         ↓
[Agenten: Texte, Bilder, Kanäle, Zielgruppen … arbeiten nach Regeln]
         ↓
[Zentrale: Prüfung + Bearbeitung (Bildschirm, Tools)]
         ↓
[Fertiges Produkt] → Markt (Aufmerksamkeit, Platz, Ansprache, Information)
```

### 5.3 Wo KI unterstützt

- **Agenten:** KI kann bei der **Erzeugung** helfen (Texte vorschlagen, Bilder prüfen, Formulierungen vereinheitlichen) – immer im Rahmen der **einen Quelle** und der **Regeln**.
- **Zentrale:** KI kann **Prüfung** unterstützen (Ist der Text stimmig? Fehlt etwas? Passt das Bild?) und **Bearbeitung** (Vorschläge, Korrekturen) – der Mensch behält die letzte Entscheidung am „Bildschirm“.
- **Ausgabe:** KI kann **Anpassung** an Kanal oder Zielgruppe unterstützen (eine Botschaft, viele Formate) – wieder: **ein Standard**, viele Ausgaben.

**Prinzip:** KI ist **Werkzeug** im Mechanismus, nicht Ersatz für Regeln und Vermächtnis. Sportwagenmodus gilt auch für KI: eine Quelle, kein wildes Neuerfinden.

### 5.4 Anbindung an Bestehendes

| Bestehend | Rolle in K2 Markt |
|-----------|-------------------|
| **mök2** | Inhalte, USPs, Lizenzen, Werbematerial – **Quelle** für Texte und Botschaften |
| **Kampagne / Marketing-Strategie** | Ziele, Kanäle, Zielgruppen – **Quelle** für Strategie und Prioritäten |
| **Kommunikations-Vorlagen, Fertige Beispiele** | **Vorlage** für Ausgabeformate (Flyer, E-Mails, …) |
| **Sportwagenmodus, Vermächtnis, Wir-Regeln** | **Regelwerk** für alle Agenten und die Zentrale – keine Ausnahme |

---

## 6. Nächste Schritte (möglich)

1. **Quelle strukturieren:** Die „große Datenbank“ (mök2, Kampagne, Docs) als **eine** durchsuchbare, konsistente Quelle modellieren – ohne Duplikate, mit klaren Verantwortlichkeiten.
2. **Ersten Agenten definieren:** z. B. „Text-Agent“ oder „Flyer-Agent“ – Input (Quelle + Regeln), Output (fertiger Text / fertiges Layout). Ein Prototyp.
3. **Zentrale (Bildschirm) skizzieren:** Welche Prüfungen? Welche Tools (Bild, Video, Text)? Welche Schnittstelle zu den Agenten?
4. **Ausgabe-Formate festlegen:** Welche „fertigen Produkte“ zuerst? (Flyer, E-Mail, Presse, Social – priorisieren.)

---

## 7. Kurzfassung

- **K2 Markt** = Mechanismus (App/Maschine), KI-gestützt, liefert **fertige Produkte** für Sichtbarkeit am Markt.
- **Kette:** Fertiges Produkt → Markt finden → Aufmerksamkeit, Platz, emotionale Ansprache + Information → Entscheidung der Menschen.
- **Vorarbeit:** mök2 + Kampagne + Strategie = Rohmaterial und Ideen; K2 Markt macht daraus **koordinierte, fertige Erzeugnisse**.
- **Medienhaus:** Abteilungen = Agenten; Zentrale = Bildschirm (Prüfung + Bearbeitung mit modernen Tools); Ausgabe = marktfähige Produkte.
- **Basis:** Wir-Regeln, Vermächtnis, **Sportwagenmodus** – überall.

---

*Verknüpfung: docs/WIR-PROZESS.md, docs/STRUKTUR-HANDELN-QUELLEN.md, Kampagne 00-INDEX, mök2 (MarketingOek2Page).*
