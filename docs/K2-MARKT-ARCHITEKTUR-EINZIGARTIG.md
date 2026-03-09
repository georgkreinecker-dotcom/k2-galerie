# K2 Markt – Die richtige Architektur (aus Joes Sicht)

**Stand:** 09.03.26  
**Hinweis:** Der Inhalt dieses Dokuments ist in **K2-MARKT-VISION-ARCHITEKTUR.md** zusammengeführt. Dort steht unsere **eine** Vision und Architektur – mit Georgs Persönlichkeit und unserer gemeinsamen Schärfe. Diese Datei bleibt als Joes ursprünglicher Vorschlag in docs/ erhalten.

**Kontext:** Georg hat gefragt: Wie würdest du die richtige Architektur schaffen – und wir machen daraus etwas Einzigartiges. Dieses Dokument war die Antwort; die gemeinsame Fassung ist jetzt die Vision und Architektur (eine Quelle).

---

## 1. Was die meisten „Marketing-Maschinen“ falsch machen

- Sie starten von **Kanälen**: „Wir müssen Post X, E-Mail Y, Flyer Z produzieren.“ → Viele Einzelstücke, oft inkonsistent, viel Doppelpflege.
- **Keine einzige Wahrheit:** Jedes Format wird separat gepflegt. Was auf dem Flyer steht, stimmt vielleicht nicht mit der E-Mail – niemand erzwingt Einheit.
- **Qualität unklar:** „Fertig“ ist, wenn jemand auf Abgabe klickt. Es gibt keine klare Definition: Was muss erfüllt sein, damit etwas **wirklich** marktfähig ist?
- **Regeln sind Empfehlungen:** „Bitte eine Quelle pro Zweck“ – aber das System erlaubt trotzdem 10 Flyer-Varianten. Die Philosophie bleibt außen vor.

**Ergebnis:** Chaos, Doppelarbeit, halbfertige Sachen die trotzdem rausgehen. Nichts davon ist einzigartig – das ist der Alltag.

---

## 2. Die eine Inversion, die K2 Markt einzigartig macht

**Nicht:** „Wir haben 10 Kanäle – füllen wir sie.“

**Sondern:** **Eine Aussage, ein Produkt-Moment – daraus leitet das System alle Formate ab.**

- Es gibt **einen** strukturierten Kern: Was sagen wir gerade? An wen? Mit welcher Botschaft? (Produkt, Kampagne, Event – ein „Moment“.)
- **Alle** Ausgaben (Flyer, E-Mail, Presse, Social, …) sind **Ableitungen** dieses einen Moments. Sie werden **generiert**, nicht einzeln geschrieben.
- Eine Quelle der Wahrheit – viele Darstellungen. Wie ein echtes Medienhaus: **eine Story, viele Ausspielwege**.

Das ist die **Architektur-Inversion**. Sie ist selten umgesetzt; wenn wir sie durchhalten, ist K2 Markt nicht „noch ein Tool“, sondern **das System, in dem eine Wahrheit viele fertige Produkte erzeugt**.

---

## 3. Drei Säulen der einzigartigen Architektur

### Säule 1: Produkt-Moment (die eine Wahrheit)

- **Ein** strukturiertes Objekt pro „Sache, die wir sagen“: z. B. Kampagne, Produkt-Launch, Event, Ansprache.
- Enthält: Botschaft, Zielgruppe, Kernargumente, Kontakt, Links, ggf. Bilder/Medien-Referenzen – **alles, was alle Formate brauchen**.
- Wird **einmal** gepflegt (oder aus mök2/Kampagne/Stammdaten gespeist). Kein zweites Dokument für „dasselbe in anderer Form“.

**Konsequenz:** Agenten **lesen** den Produkt-Moment; sie **erfinden** nicht neu. Sie **leiten ab**.

### Säule 2: Qualitäts-Tor (Definition of Done + eine Freigabe)

- **Nichts** geht an den Markt, ohne ein klares **Definition of Done** zu erfüllen. Pro Ausgabe-Typ (Flyer, E-Mail, Presse, …) steht fest: Was muss drin sein? (z. B. Text, Kontakt, QR, kein Platzhalter.)
- Die **Zentrale (Bildschirm)** ist kein Flaschenhals, wo alles hängt – sie ist das **Tor**: Nur was die Definition erfüllt, kann zur Freigabe. Alles andere bleibt im Entwurf.
- **Eine bewusste Freigabe:** Ein Mensch sagt „dieses Stück geht raus“. Bis dahin läuft Automation (Agenten, KI, Vorlagen) – aber **kein** Output erreicht den Markt ohne diesen einen Check. **Fertige Produkte, eine Freigabe.**

Das ist **einzigartig**, wenn es verbindlich im System steckt: Kein „irgendwann fertig“, sondern **freigabefähig oder nicht**.

### Säule 3: Regeln im System (Philosophie als Code)

- **Sportwagenmodus** ist nicht nur Doku – das System **erzwingt** ihn wo es geht: z. B. **ein** Flyer-Template pro Zweck. Ein zweites anlegen? → „Du hast bereits ein Template für Flyer – bearbeite dieses.“ Keine zweite Quelle ohne Grund.
- **Vermächtnis und Wir-Regeln** sind **Eingabe** für die Agenten: z. B. „Keine aggressiven Marketing-Begriffe“, „Empfehlungs-Programm nicht Affiliate“ – die Agenten/KI dürfen nur innerhalb dieser Grenzen vorschlagen.
- So wird die **Philosophie** Teil der Maschine. Das Produkt **ist** das, was ihr wichtig ist – nicht ein Tool, das ihr nebenbei nutzt.

---

## 4. Die scharfe Architektur (wie ich sie bauen würde)

```
┌─────────────────────────────────────────────────────────────────┐
│  PRODUKT-MOMENT (eine Wahrheit)                                  │
│  Eine strukturierte Quelle pro Kampagne/Produkt/Event.           │
│  Gespeist aus: mök2, Kampagne, Stammdaten, Regeln.               │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  AGENTEN (ableiten, nicht erfinden)                              │
│  Jeder Agent: liest Produkt-Moment + Regeln → erzeugt Entwurf   │
│  für ein Format (Flyer, E-Mail, Presse, Social, …).               │
│  Ein Template pro Format – Sportwagenmodus im Code.              │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  QUALITÄTS-TOR (Bildschirm)                                      │
│  Prüfung: Erfüllt der Entwurf die Definition of Done?            │
│  Bearbeitung: Wo nötig (Bild, Text, Tool).                       │
│  Kein Durchlass ohne „ready“.                                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  FREIGABE (eine menschliche Entscheidung)                        │
│  „Dieses Stück geht raus.“ – erst dann marktfähig.               │
│  Traceability: Welcher Produkt-Moment, welche Regel, welches     │
│  Template → nachvollziehbar für jedes ausgegebene Produkt.       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
                    [ Markt: Aufmerksamkeit, Platz, Ansprache ]
```

**Unterschied zum ersten Entwurf:**  
Der **Produkt-Moment** ist nicht „eine Datenbank“ mit vielen Dokumenten – er ist **ein** Kern pro Aussage. Die Agenten **leiten ab**, sie füllen keine leeren Kanäle. Das **Tor** hat eine explizite **Definition of Done**. Die **Freigabe** ist eine eigene Stufe – eine bewusste Handlung. Und die **Regeln** sind im Ablauf verankert (ein Template, keine Duplikate ohne Grund).

---

## 5. Was daraus einzigartig ist (Zusammenfassung)

| Aspekt | Üblich | K2 Markt (so gebaut) |
|--------|--------|----------------------|
| **Quelle** | Viele Dokumente, viele Kanäle | **Ein** Produkt-Moment pro Aussage → alle Formate abgeleitet |
| **Qualität** | „Fertig“ = abgegeben | **Definition of Done** pro Format; nichts raus ohne Erfüllung |
| **Freigabe** | Oft implizit oder vergessen | **Eine** bewusste Freigabe pro Stück – dann marktfähig |
| **Regeln** | Doku, Empfehlung | **Im System**: ein Template pro Zweck, Regeln als Grenzen für Agenten/KI |
| **Herkunft** | Unklar | **Traceability**: jedes Output zurück zu Moment, Regel, Template |

**In einem Satz:** K2 Markt wird einzigartig, wenn es **eine Wahrheit in viele fertige Produkte** übersetzt – mit Qualitäts-Tor, einer Freigabe und Regeln, die die Maschine selbst einhält.

---

## 6. Nächste Schritte (wenn wir so bauen)

1. **Produkt-Moment modellieren:** Welche Felder hat „eine Aussage“? (Botschaft, Zielgruppe, Kontakt, Links, Medien, …) – einmal definieren, dann als einzige Quelle nutzen.
2. **Definition of Done pro Format:** Pro Ausgabe-Typ (Flyer, E-Mail, Presse, …) festlegen: Was muss erfüllt sein? (Checkliste, z. B. kein [Platzhalter], Kontakt vorhanden, QR optional.)
3. **Ersten Agenten als Ableiter:** z. B. „Flyer-Agent“ – Input = Produkt-Moment + ein Flyer-Template; Output = ein Entwurf. Kein zweites Template ohne Grund (Sportwagenmodus im Code).
4. **Tor + Freigabe in der UI:** Bildschirm zeigt Entwurf, Prüfung (DoD erfüllt?), Button „Zur Freigabe“ / „Freigeben“ – erst dann gilt das Stück als marktfähig.
5. **Traceability von Anfang an:** Jedes ausgegebene Produkt speichert Referenz auf Produkt-Moment, Template, Regel-Version – damit wir immer sagen können: woher kommt das?

---

*Dieses Dokument ist Joes Vorschlag für die richtige, einzigartige Architektur. Es ergänzt die Vision (K2-MARKT-VISION-ARCHITEKTUR.md) und kann mit Georg weiter geschärft werden.*
