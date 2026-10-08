# Töpferscheibe – Maschinenbauplan (Entwurf Meisterprüfungsstück)

**Stand:** 08.10.2026  
**Charakter:** Entwurf zur Ausarbeitung – noch keine fertige Werkstattzeichnung  
**Ziel:** Nachweis von Konstruktion, Fertigung, Montage, Sicherheit und Dokumentation im Meisterbereich (Metall / Maschinenbau / verwandte Fachrichtung – an die jeweilige Prüfungsordnung anpassen)

---

## 1. Aufgabenstellung (in einem Satz)

Konstruktion und Fertigung einer **elektrisch angetriebenen Töpferscheibe** für den Werkstatt-/Ateliereinsatz: ruhiger Lauf, regelbare Drehzahl, standfestes Gestell, wartungsfreundlich – als **in sich abgeschlossenes Meisterstück**.

---

## 2. Lastenheft (Anforderungen)

### 2.1 Funktion

| Nr. | Anforderung | Zielwert (Entwurf) |
|-----|-------------|---------------------|
| F1 | Drehzahlbereich Scheibe | ca. **0–250 U/min** (feinfühlig unten, ausreichend oben) |
| F2 | Drehrichtung | vorwärts; Rücklauf optional (Umschalter) |
| F3 | Scheibendurchmesser Arbeitsfläche | **300 mm** (austauschbare Platte möglich) |
| F4 | Traglast tonhaltig (naß) | mind. **15 kg** dynamisch, **25 kg** ruhend |
| F5 | Rundlauf Arbeitsfläche | ≤ **0,2 mm** axial / radial an der Platte |
| F6 | Not-Aus | gut erreichbar, Kategorie mind. nach Maschinenrichtlinie / BetrSichV-Logik |
| F7 | Spritzwasser | Motor und Elektrik **geschützt** (IP54-Idee an Antrieb/Gehäuse) |

### 2.2 Nutzung / Ergonomie

- Arbeitshöhe Oberkante Scheibe: ca. **700–750 mm** (sitzend/stehend je nach Sitz)  
- Fußpedal (oder Handrad) für Drehzahl – **Fuß** bevorzugen (Hände frei)  
- Leise, vibrationsarm – Lagerung und Gestell steif  
- Leicht zu reinigen: glatte Flächen, Auffangwanne für Schlicker  

### 2.3 Fertigung / Meister-Anspruch

- Überwiegend **Eigenfertigung** (Dreh-/Fräs-/Schweiß-/Montagearbeit)  
- Normteile bewusst eingesetzt (Lager, Motor, Keilriemen/Zahnriemen, Schrauben)  
- Nachvollziehbare **Stückliste**, **Zeichnungen**, **Prüfprotokoll**  
- Kein „Basteln aus Fertigteilen“ ohne eigene Konstruktion  

---

## 3. Konzeptwahl (kurz)

| Variante | Vorteil | Nachteil | Bewertung |
|----------|---------|----------|-----------|
| A Direktantrieb (Wellenmotor unter Scheibe) | kompakt | Spritzwasser, teure Motoren, schlechte Zugänglichkeit | eher nein |
| B Unterflur-Antrieb + Riemen | Motor trocken, gute Wartung, klassischer Maschinenbau | etwas mehr Bauraum | **gewählt** |
| C Hydraulik / Sonderantrieb | übertrieben | Kosten, Aufwand | nein |

**Gewählt: Variante B** – Gestell mit Sitz/Stand, Welle der Scheibe in Präzisionslagern, Antrieb über Riemen von einem seitlich/unten liegenden Motor mit Frequenzumrichter oder DC-Regler + Pedal.

---

## 4. Gesamtaufbau (Maschinenstruktur)

```
                    [Arbeitsplatte Ø300]
                            |
                     [Nabe / Flansch]
                            |
              ========= Hauptwelle (senkrecht) =========
                     [2× Wälzlager in Lagerbock]
                            |
                     [Riemenscheibe angetrieben]
                            |
                      ~~~ Riemen ~~~
                            |
              [Motor + kleine Riemenscheibe]
                            |
        [Frequenzumrichter / Regler] ← [Fußpedal]
                            |
              ======== Schweißgestell / Rahmen ========
                     [Auffangwanne] [Füße höhenjustierbar]
```

**Baugruppen:**

1. **Gestell** – geschweißter Stahlrahmen, steif, justierbare Füße  
2. **Lagerbock / Spindel** – Hauptwelle senkrecht, 2 Lager, Abdichtung nach oben  
3. **Arbeitsplatte** – Aluminium oder Edelstahl, plan, zentriert auf Nabe  
4. **Antrieb** – Motor + Riemen + Schutzverkleidung  
5. **Elektrik** – Netzteil/FU, Pedal, Not-Aus, Verdrahtung in Kanal/Gehäuse  
6. **Schlickerführung** – Wanne, Abflussstutzen optional  

---

## 5. Technische Auslegung (Entwurfsrechnung)

### 5.1 Drehzahl und Übersetzung

- Motordrehzahl typisch: **n_M ≈ 1400 U/min** (Asynchron 4-polig) oder DC-Motor mit Regler  
- Scheibe: **n_S ≤ 250 U/min**  
- Übersetzung Gesamti: **i ≈ n_M / n_S ≈ 5,5 … 8**  

**Beispiel Riemen:**

- Motorscheibe Ø **50 mm**  
- Wellenscheibe Ø **350 mm**  
- i ≈ 7 → bei 1400 U/min Motor ≈ **200 U/min** Scheibe (mit FU feiner regelbar)  

### 5.2 Leistung (Richtwert)

Drehen von Ton: eher Drehmoment als hohe Leistung.  
**P ≈ 0,37 … 0,55 kW** reicht für Studio; für robustes Meisterstück: **0,55 kW** mit Reserven.

Drehmoment an der Scheibe (grob):  
M ≈ 9550 · P / n → bei 0,55 kW und 150 U/min ≈ **35 Nm** – für Töpferei großzügig, gut für Anlauf mit nasser Masse.

### 5.3 Welle und Lager

- Hauptwelle: Edelstahl **Ø 25 … 30 mm** (z. B. 1.4301 / 1.4404) oder vergüteter Stahl mit Schutzhülse oben  
- Lager: 2× **Rillenkugellager** (z. B. 6205/6206) im Abstand ≥ 80 mm → Kippmoment abfangen  
- Oben: **Wellendichtring** oder Labyrinth gegen Schlicker  
- Unten: Riemenscheibe mit Passfeder oder Klemmnabe  

### 5.4 Gestell

- Profil: Quadratrohr **40×40×2** oder **50×50×2** mm, Stahl S235  
- Schweißkonstruktion, spannungsarm (richten nach dem Schweißen)  
- Füße: Gewinde M10–M12 mit Gummi- oder Maschinenfüßen  
- Eigenfrequenz: steif genug, dass bei 200 U/min kein „Wandern“ entsteht  

### 5.5 Arbeitsplatte

- Ø **300 mm**, Dicke **10–15 mm** Alu (leicht, gut planbar) oder Edelstahl  
- Zentrierung: kurzer Kegel/Passung auf Nabe + 3 Schrauben M6  
- Oberfläche: leicht rau oder mit austauschbarer Gips-/Holzauflage (optional)  

---

## 6. Stückliste (Entwurf – Hauptpositionen)

| Pos. | Bezeichnung | Werkstoff / Typ | Menge | Eigen / Zukauf |
|------|-------------|-----------------|-------|----------------|
| 1 | Gestell geschweißt | S235 Rohr | 1 | Eigen |
| 2 | Lagerbock | S235 / Alu | 1 | Eigen |
| 3 | Hauptwelle | Edelstahl Ø28 | 1 | Eigen (drehen) |
| 4 | Rillenkugellager | 6206-2RS | 2 | Zukauf |
| 5 | Wellendichtring | passend Welle | 1–2 | Zukauf |
| 6 | Riemenscheibe groß | Stahl/Alu | 1 | Eigen oder Zukauf |
| 7 | Riemenscheibe klein | Stahl/Alu | 1 | Eigen oder Zukauf |
| 8 | Zahnriemen / Keilriemen | passend | 1 | Zukauf |
| 9 | Arbeitsplatte Ø300 | Alu 12 mm | 1 | Eigen |
| 10 | Nabe / Flansch | Stahl/Alu | 1 | Eigen |
| 11 | Motor 0,55 kW | Asynchron / DC | 1 | Zukauf |
| 12 | FU oder DC-Regler | IP54-Idee | 1 | Zukauf |
| 13 | Fußpedal | Industrie / Eigen | 1 | Zukauf/Eigen |
| 14 | Not-Aus, Schalter, Kabel | – | 1 Satz | Zukauf |
| 15 | Auffangwanne | Edelstahl/Kunststoff | 1 | Eigen/Zukauf |
| 16 | Verkleidung Riemen | Blech | 1 | Eigen |
| 17 | Schrauben, Passfedern, Füße | Norm | 1 Satz | Zukauf |

*(Vollständige Stückliste mit Maßen/Normbezeichnung in der Ausarbeitung ergänzen.)*

---

## 7. Zeichnungsübersicht (was der Meister vorlegen sollte)

1. **Gesamtzeichnung** – Ansicht + Schnitt (Maßstab 1:5 oder 1:10)  
2. **Gestell** – Schweißbaugruppe mit Schweißnahtangaben  
3. **Lagerbock / Spindel** – Schnitt mit Lagerpassung (H7/k6 o. ä.)  
4. **Hauptwelle** – Fertigungszeichnung mit Passungen, Oberflächen  
5. **Arbeitsplatte + Nabe**  
6. **Riemenscheiben**  
7. **Stromlaufplan** – Netz, FU/Regler, Pedal, Not-Aus  
8. **Stückliste** mit Pos.-Nummern  

---

## 8. Fertigungsablauf (Vorschlag Reihenfolge)

1. Gestell schweißen → richten → grundieren  
2. Lagerbock fertigen, Lager sitze drehen/reiben  
3. Welle drehen, Passungen prüfen  
4. Montage Spindel (Lager vorspannen/einbauen nach Lagerkatalog)  
5. Rundlauf der Welle messen  
6. Platte fertigen, auf Nabe montieren, Rundlauf ≤ 0,2 mm  
7. Motorbock, Riemenscheiben, Riemenspannung  
8. Elektrik verdrahten, Schutzleiter, Isolationsprüfung  
9. Verkleidung, Wanne, Endmontage  
10. Probelauf trocken → mit Tonmasse → Protokoll  

---

## 9. Prüfungen / Abnahme (für die Mappe)

| Prüfung | Soll | Ist (leer lassen) |
|---------|------|-------------------|
| Isolationswiderstand Elektrik | nach VDE / guter Fachpraxis | |
| Not-Aus wirkt | Motor stoppt sicher | |
| Drehzahl min / max | gemessen | |
| Rundlauf Platte | ≤ 0,2 mm | |
| Vibration / Standfestigkeit | subjektiv + ggf. einfache Messung | |
| Dauerlauf 30 min | keine Überhitzung Lager/Motor | |
| Reinigungsfähigkeit | dokumentiert | |

---

## 10. Sicherheit (kurz, verbindlich mitdenken)

- Riemen **vollständig verkleidet**  
- Not-Aus **rot-gelb**, unverzögert erreichbar  
- Keine Quetschstellen an Pedal/Welle  
- Elektrik nur mit Schutzleiter, Zugentlastung, spritzgeschützt  
- Hinweis: nasse Hände / Erde – **FI-Schutz** im Stromkreis der Werkstatt voraussetzen und im Bericht erwähnen  
- Betriebsanleitung 1–2 Seiten: Inbetriebnahme, Reinigung, Wartung Lager/Riemen  

---

## 11. Was die Prüfungskommission sehen will (Meister-Logik)

1. **Klares Konzept** – warum Riemen, warum diese Leistung  
2. **Eigene Fertigung** – Wellen, Gestell, Passungen  
3. **Saubere Dokumentation** – Zeichnung, Stückliste, Stromlauf  
4. **Funktion & Sicherheit** – läuft ruhig, Not-Aus, Verkleidung  
5. **Aussehen** – kein Provisorium; Oberfläche, Kanten, Lack/Öl  

---

## 12. Offene Punkte für die nächste Ausarbeitung

- [ ] Genaue Prüfungsordnung / Fachrichtung klären (was ist vorgeschrieben?)  
- [ ] Motor endgültig wählen (230 V 1~ mit FU vs. 24/48 V DC)  
- [ ] Pedal: Industrie-Poti vs. selbst gebaut  
- [ ] Sitz mit Gestell verbinden oder getrennt?  
- [ ] Design-Linie: schlicht industriell (passt zu Meisterstück)  
- [ ] CAD-Modell (Fusion/SolidWorks/…) und 2–3 Fertigungszeichnungen  

---

## 13. Kurzfazit

Das Meisterstück ist **kein** reines Kunstobjekt, sondern eine **kleine Werkzeugmaschine**: steifes Gestell, präzise Spindel, geschützter Antrieb, regelbare Drehzahl, nachvollziehbare Fertigung.  
Mit Variante **Riemenantrieb + FU/Pedal + Ø300-Platte** ist der Entwurf prüfungstauglich und in einer gut ausgestatteten Werkstatt in überschaubarer Zeit realisierbar.

---

*Entwurf für Georg – Maschinenbau / Meisterprüfungsstück. Keine Haftung als geprüfte Statik/Elektro-Auslegung; vor Bau Zahlen und Normen der Prüfungsordnung und eine Elektrofachkraft für den Anschluss beachten.*
