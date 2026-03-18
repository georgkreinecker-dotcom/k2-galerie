# K2 Familie – Grundstruktur anlegen (Vorschlag)

**Ziel:** Statt einzeln „Person hinzufügen“ zu klicken, zuerst die **Grundstruktur** eingeben (wie ein Stammbaum vor mir liegen): Ich + Partner = 2, darunter 4 Kinder, darüber 12 Geschwister, Vater hatte 2 Frauen. Die Struktur wird angelegt, Platzhalter entstehen; Geschwister und Partnerin können ihre Linie später selbst ausfüllen.

---

## 1. Dein beschriebener Ablauf (Kern)

- **Start:** 2 Personen (du + Partner/in).
- **Leiste unten:** Zahl eintragen, z. B. **4** (wir haben 4 Kinder).
- **Leiste oben:** Zahl eintragen, z. B. **12** (ich habe 12 Geschwister).
- **Eltern-Ebene:** Vater + 2 Frauen (oder: 1 Vater, 2 Mütter) – Grundstruktur festlegen.
- **Später:** Geschwister können ihre Zeile selbst ausfüllen, deine Frau/Partner auch.

---

## 2. Vorschlag: „Grundstruktur anlegen“ (Assistent)

### Wann sichtbar?

- **Option A:** Auf der **Stammbaum-Seite**, wenn **noch keine Personen** da sind: Statt nur „Person hinzufügen“ einen großen Einstieg **„Grundstruktur anlegen“** anbieten (z. B. erste Karte).
- **Option B:** Zusätzlich auf der **K2-Familie-Startseite** (Home) eine Karte **„Neuer Stammbaum – Grundstruktur anlegen“**, die nur angezeigt wird, wenn die Familie leer ist oder explizit „Struktur erweitern“ gewünscht ist.

Empfehlung: **Option A** – beim Öffnen des Stammbaums siehst du sofort „Leer? Dann zuerst Grundstruktur.“

### Ablauf (Schritte, optisch ansprechend)

**Schritt 1 – Du & Partner/in**  
- Überschrift: „Mit wem beginnst du?“  
- Zwei Felder (oder 2 Karten): **„Du“** (Name optional sofort oder Platzhalter „Du“), **„Partner/in“** (Platzhalter „Partner/in“).  
- Optik: Zwei runde „Knoten“ nebeneinander (wie im späteren Baum), verbunden (Partner-Linie). Darunter Button „Weiter“.

**Schritt 2 – Kinder (Leiste unten)**  
- Überschrift: „Wie viele Kinder habt ihr?“  
- **Eine klare Zahleneingabe** (Slider 0–15 oder Eingabefeld 0–20). Du trägst z. B. **4** ein.  
- Darstellung: Eine „Leiste“ mit 4 Platzhalter-Kästchen (Kind 1 … Kind 4), visuell unter dem Du/Partner-Paar.  
- Kurztext: „Ihr könnt die Namen später eintragen. Jetzt entstehen 4 Plätze für eure Kinder.“

**Schritt 3 – Geschwister (Leiste oben)**  
- Überschrift: „Wie viele Geschwister hast du (inkl. dir)?“ oder „Wie viele Geschwister?“  
- Zahl eintragen, z. B. **12**.  
- Darstellung: Eine „Leiste“ mit 12 Platzhalter-Kästchen (Geschwister 1 … 12). Ein Kästchen ist hervorgehoben: **„Du“** (du bist einer der 12).  
- Hinweis: „Du bist einer davon. Welcher Platz ist ‚Du‘?“ (optional: Auswahl „Ich bin Geschwister Nr. X“).

**Schritt 4 – Eltern-Ebene (Vater, Mütter/Frauen)**  
- Überschrift: „Wer sind eure Eltern? (Struktur)“  
- **Vater:** 1 Person (Platzhalter „Vater“).  
- **Mütter / Partnerinnen des Vaters:** Zahl, z. B. **2** (Vater hatte 2 Frauen).  
- Es entstehen: 1 Vater, 2 Mütter (Platzhalter „Mutter 1“, „Mutter 2“ oder „Frau 1“, „Frau 2“).  
- Alle 12 Geschwister werden als **Kinder** dieser Eltern-Ebene verknüpft (alle haben dieselben parentIds: Vater + Mutter 1 oder 2, je nachdem ob wir das feiner modellieren wollen; für die Grundstruktur reicht: alle 12 haben Vater + eine der Mütter, oder wir verknüpfen alle mit Vater und beiden Müttern – siehe Datenmodell unten).

**Schritt 5 – Zusammenfassung & Anlegen**  
- Kurze **Vorschau**: Schematisch „12 Geschwister (du dabei) → Du + Partner → 4 Kinder“, darüber „Vater + 2 Frauen“.  
- Button **„Grundstruktur anlegen“**.  
- Es werden alle Platzhalter-Personen und Beziehungen angelegt. Anschließend Weiterleitung zum Stammbaum; dort siehst du die Grafik mit Platzhaltern. Du klickst auf „Du“, benennst dich, deine Partnerin füllt ihren Platz, Geschwister können (später) ihre Zeile selbst ausfüllen.

### Optik (zum Dazupassen)

- **K2-Familie-Farben** beibehalten (Türkis/Grün, dunkler Hintergrund, Karten mit `rgba(13,148,136,0.15)` etc.).  
- **Leisten** als kleine Reihen von runden oder rechteckigen „Slots“ (Kreise/Rechtecke mit Nummer oder „Kind 1“), nicht als langer Fließtext.  
- **Verbindungslinien** in der Vorschau dezent (Striche zwischen Du–Partner, Partner–Kinder, Geschwister–Eltern).  
- **Schritte** klar nummeriert (1–5), ein Schritt pro Karte oder ein einseitiger Wizard mit „Weiter“ / „Zurück“.  
- **Mobile:** gleiche Schritte, kompakt; Zahleneingabe groß genug zum Tippen.

---

## 3. Was technisch angelegt wird

- **Personen (Platzhalter):**  
  - `Du`, `Partner/in`  
  - `Kind 1` … `Kind 4`  
  - `Geschwister 1` … `Geschwister 12` (eine davon wird mit „Du“ verknüpft, siehe unten)  
  - `Vater`, `Mutter 1`, `Mutter 2` (oder `Frau 1`, `Frau 2`)  

- **Beziehungen:**  
  - Du ↔ Partner/in (partners).  
  - Du + Partner/in → childIds = [Kind 1 … Kind 4]; jedes Kind hat parentIds = [Du, Partner/in].  
  - Geschwister 1 … 12: parentIds = [Vater, Mutter 1] oder Aufteilung (z. B. 6+6 auf die zwei Mütter), je nach gewünschter Genauigkeit.  
  - „Du“ = eine der 12 Geschwister: Entweder eine Platzhalter-Person „Du“ wird mit Geschwister 1 … 12 verknüpft (siblingIds), oder wir legen nur 11 Geschwister + „Du“ an und verknüpfen Du mit den 11 als Geschwister.  

- **Einstellung „Ich bin diese Person“:** Die Person „Du“ wird als `ichBinPersonId` gesetzt, damit im Stammbaum „Du“ hervorgehoben ist.

- **Später ausfüllen:** Jede Platzhalter-Person hat eine Personen-Seite; Geschwister/Partnerin können (wenn Berechtigung da ist) ihre Seite bearbeiten und Namen/Kurztext/Foto eintragen.

---

## 4. Offene Punkte (für dich zum Abstimmen)

1. **„Du“ unter den 12 Geschwistern:** Soll „Du“ eine eigene Person sein und die anderen 11 heißen „Geschwister 1“ … „Geschwister 11“, oder 12 Platzhalter „Geschwister 1“ … „12“ und du wählst danach „Ich bin Geschwister Nr. X“?  
   - **Vorschlag:** 12 Platzhalter „Geschwister 1“ … „12“; direkt danach fragt der Assistent „Welcher Platz bist du?“ (Dropdown 1–12). Die gewählte Person wird als „Du“ benannt und in den Einstellungen als `ichBinPersonId` gesetzt.

2. **Vater + 2 Frauen – Verknüpfung:** Haben alle 12 Geschwister dieselben Eltern (Vater + Mutter 1 oder 2), oder sollen wir abfragen „Von welcher Mutter stammen welche Geschwister?“ (z. B. 6+6)?  
   - **Erste Version:** Einfach alle 12 als Kinder von Vater + Mutter 1 + Mutter 2 (alle drei als Eltern). Oder: Vater + „Mutter 1“ für alle, „Mutter 2“ nur als Partnerin des Vaters (partners), keine childIds. Dann kann man später pro Kind die richtige Mutter zuordnen.

3. **Wo genau der Einstieg:** Nur Stammbaum bei 0 Personen, oder auch von der Home-Seite aus als Karte „Grundstruktur anlegen“?

---

## 5. Nächster Schritt (Umsetzung)

- Wenn du sagst „ja, so in etwa“, können wir als **ersten Schritt** umsetzen:  
  - Neue Seite oder Modal **„Grundstruktur anlegen“** (Route z. B. `/projects/k2-familie/grundstruktur` oder nur auf Stammbaum wenn 0 Personen).  
  - Die 5 Schritte mit Zahleneingaben und einer minimalen Vorschau (Text oder einfache Balken).  
  - Beim Klick „Anlegen“: Erzeugen der Platzhalter-Personen und Relationen wie oben; Redirect zum Stammbaum; „Du“ setzen und `ichBinPersonId` speichern.  

- **Optik** danach schrittweise verfeinern (Leisten als kleine Slot-Grafik, Verbindungslinien, gleiche Farben wie K2 Familie).

---

**Kurz:** Du legst zuerst die Grundstruktur fest (2 → 4 Kinder, 12 Geschwister, Vater + 2 Frauen), das System erzeugt Platzhalter und Beziehungen. Deine Geschwister und deine Partnerin können ihre Linie später selbst ausfüllen. Optik: Wizard mit klaren Schritten und „Leisten“ für Kinder/Geschwister, K2-Familie-Design.
