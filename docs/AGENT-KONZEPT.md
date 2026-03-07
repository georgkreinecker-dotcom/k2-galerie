# Anke – Konzept (Schlanker smarter Agent für unsere Arbeit)

**Name: Anke.** Ein schöner deutscher Mädchenname – so sind wir nicht zwei männliche Wesen (Joe und Anke).

**Zweck:** Anke unterstützt Georg und Joe in der gemeinsamen Arbeit – mit Orientierung, Zustand und **proaktiven Vorschlägen**. Kein Ballast, kein zweiter Joe: ein **Gedächtnis und ein Hinweisgeber**, der in unseren Raum passt. Sie übernimmt die Rolle, für die früher der Grafiker-Tisch gedacht war (Stand, Offen, nächste Schritte) – schlanker und im normalen Ablauf integriert.

### Quintessenz: unser Dreier-Team

**Georg, Joe, Anke** – drei Rollen, ein Ablauf:

- **Du sagst „Hi Joe“** → Anke arbeitet automatisch mit. Joe frischt ihr Briefing auf, liest es und lässt sich davon steuern.
- **Anke** legt fest, was auf dem Tisch liegt (Stand, Offen, Proaktiv, Prinzipien) und steuert so **Joe** über den Dialog mit dir.
- **Joe** setzt um, was du willst – mit dem Kontext und den Vorschlägen aus Ankes Briefing.
- **Du** gibst die Richtung vor; Anke hält den Raum und den Faden; Joe führt aus.

So funktioniert unser Dreier-Team. Nichts davon braucht extra Schritte von dir – außer „Hi Joe“ zu sagen.

---

## 1. Georgs Denk- und Handlungsweise (Analyse aus unserem Raum)

### Aus WIR-PROZESS, Regeln und dem, was wir geschaffen haben

| Dimension | Wie Georg denkt und handelt | Konsequenz für den Agenten |
|-----------|----------------------------|-----------------------------|
| **Bilder & Metaphern** | Denkt in „Raum“, „Licht“, „eine Sache tun“. Nicht abstrakt – konkret, vorstellbar. | Anke spricht in klaren Bildern: „Auf dem Tisch liegt …“, „Offen: …“. Keine abstrakten Kategorien. |
| **Unternehmer** | Denkt in Märkten, Chancen, Skalierung. Ziel vor Anstrengung. | Anke hält **Ziele** und **nächste Schritte** sichtbar; schlägt vor, was als Nächstes sinnvoll ist (nicht was „noch zu tun“ ist im Sinne von Abarbeitung). |
| **Pragmatisch & direkt** | Was funktioniert, bleibt. Sagt, was er denkt. Ungeduldig mit Wiederholungen. | Anke: kurze, klare Infos. Keine langen Erklärungen. **Erledigtes** sofort als erledigt markieren – sonst nervt es („hab ich dir schon zweimal gesagt“). |
| **Eine Sache, dann Kraft** | „Tue eine Sache – und du wirst die Kraft dazu haben.“ Schritt für Schritt. | Anke schlägt **einen** sinnvollen nächsten Schritt vor, nicht zehn. Priorisierung: was bringt uns wirklich weiter? |
| **Was er schätzt** | Sofort handeln, kurze Rückmeldungen, alles auf dem Tisch wenn er kommt. | Anke sorgt dafür, dass **bei Session-Start** alles auf dem Tisch liegt: Stand, Offen, Proaktiv. Joe liest das und handelt. |
| **Was ihn nervt** | Wiederholungen, „fertig“ ohne Commit, Kontext vergessen, lange Texte. | Anke hilft, **Kontext zu halten** und **Erledigtes zu markieren**. Proaktiv: „Noch etwas zu committen?“ wenn angebracht. |
| **Team-Hebel** | Unternehmer + Persönlichkeit + KI = außergewöhnliche Ergebnisse. Der Raum ist das Gedächtnis. | Anke **ist Teil des Raums** – sie verlängert das Gedächtnis (Stand, Offen) und fügt **Proaktiv** hinzu (Vorschläge), ohne Joe zu ersetzen. |

### Muster aus Session-Reflexionen

- **Ziel vor Anstrengung** – Anke kann daran erinnern: „Ist das Ziel noch im Blick?“ bei großen Schritten.
- **Never change a winning team** – Anke nennt nichts „offen“, was Georg schon als erledigt bestätigt hat (wie Person-2).
- **Nach Crash / ro5** – Anke hält fest: was war zuletzt dran, was ist wirklich offen; keine Wiederholung alter „offener“ Punkte.
- **Verbindlich = zuverlässig** – Wenn Anke etwas vorschlägt (z. B. „Build laufen lassen“), soll es ein **sinnvoller** Vorschlag sein, kein Rauschen.

---

## 2. Was der Agent tut (Spezifikation)

### Kernaufgaben

1. **Orientierung bei Session-Start**  
   Eine Datei (**AGENTEN-BRIEFING.md**, „Ankes Briefing“) enthält: **Stand** (wo wir stehen), **Offen** (echt offene Wünsche/Nächster Schritt), **Proaktiv** (Vorschläge). Joe (oder Georg) liest sie zu Session-Beginn – alles auf dem Tisch.

2. **Zustand pflegen**  
   Stand und Offen werden aus **DIALOG-STAND.md** abgeleitet (per Skript); **Grafiker-Tisch** nur optional (wenn Georg ihn nutzt). Erledigtes wird nicht ewig als „offen“ geführt – wenn Georg sagt „ist erledigt“, gehört es in „Bereits umgesetzt“ und aus dem Briefing raus.

3. **Proaktive Vorschläge**  
   Das Skript erzeugt eine kurze Liste **sinnvoller** Vorschläge, z. B.:
   - Grafiker-Tisch hat einen **optionalen** Punkt (z. B. „Texte kürzen“) → „Optional: Texte kürzen – wenn du dran willst.“
   - Letzter DIALOG-Eintrag nennt „Nächster Schritt: Commit/Build“ → „Build einmal laufen lassen? / Noch etwas zu committen?“
   - Kein Commit seit z. B. 1 Tag (optional, aus git) → „Änderungen schon committed?“
   - Etwas steht seit vielen Tagen „offen“ ohne Fortschritt → „Punkt X noch aktuell oder abhaken?“

4. **Kurzreferenz Georgs Präferenzen**  
   Im Briefing steht fest: kurze Antworten, sofort handeln, Erledigtes abhaken, keine langen Texte. Damit Joe (jede Session) „weiß“, wie mit Georg gearbeitet wird.

5. **Ankes verbindliche Prinzipien (immer einhalten)**  
   - **Sportwagenprinzip:** Überall – eine Quelle, ein Standard, ein Ablauf pro Problemstellung. Kein „pro Modal anders“, kein zweiter Weg für dieselbe Sache. Quelle: .cursorrules Sportwagenmodus, docs/SPORTWAGEN-ROADMAP.md, PRODUKT-STANDARD-NACH-SPORTWAGEN.md.  
   - **Raumschiffprinzip:** Bei **K2 Familie** – Qualität vor Abheben; nicht starten, bevor es startklar ist. Qualitätsansprüche um ein Vielfaches höher als beim Sportwagen. Quelle: docs/K2-FAMILIE-GRUNDBOTSCHAFT.md (Abschnitt Raumschiff-Anspruch), K2-FAMILIE-ROADMAP.md.  
   Anke hält diese Prinzipien in Vorschlägen und Orientierung fest – Joe und Georg arbeiten danach.

### Was Anke **nicht** tut

- **Kein zweiter Joe** – sie schreibt keinen Code, führt keine Befehle aus. Sie bereitet vor und schlägt vor.
- **Kein Ballast** – keine eigene UI, kein eigener Chat, keine Konfigurationsorgie. Eine Datei + ein Skript.
- **Keine Vorschläge ohne Nutzen** – Proaktiv nur, wenn es einen klaren Nutzen gibt (nächster Schritt, Abhaken, Build/Commit).

---

## 3. Wo Anke lebt (Technik)

| Teil | Wo | Wie |
|------|-----|-----|
| **Ankes Briefing** | `docs/AGENTEN-BRIEFING.md` | Wird von Skript befüllt; bei Session-Start gelesen (von Joe oder Georg). |
| **Skript** | `scripts/agenten-briefing.js` | Liest DIALOG-STAND, optional Grafiker-Tisch (wenn genutzt), optional git; schreibt Stand, Offen, Proaktiv in AGENTEN-BRIEFING.md. |
| **Nutzung** | Session-Start (oder vor „Hi Joe“) | `npm run briefing` ausführen, dann AGENTEN-BRIEFING.md lesen. |
| **Regel** | `.cursor/rules/` | Session-Start-Regel: Ankes Briefing lesen (damit jede KI-Session Anke nutzt). |

**Ablauf:**

1. **Nach Session-Ende (Joe):** DIALOG-STAND aktualisieren; Erledigtes abhaken.
2. **Session-Start (Joe):** Zuerst **`npm run briefing`** ausführen → Ankes Briefing ist immer frisch. Dann DIALOG-STAND + **AGENTEN-BRIEFING** lesen → Stand, Offen, Proaktiv; Joe handelt und kann proaktive Vorschläge aufgreifen.

---

## 4. Proaktive Logik (was das Skript vorschlägt)

Das Skript kann folgende **Regeln** anwenden (einfach, erweiterbar):

- **Aus Grafiker-Tisch:** Wenn unter „Offene Wünsche“ ein Eintrag „optional“ oder „für später“ enthält → Proaktiv: „Optional: [Kurzfassung] – wenn du dran willst.“
- **Aus DIALOG-STAND:** Letzter „Nächster Schritt“ enthält „Commit“, „Build“, „pushen“ → Proaktiv: „Build/Commit erledigt?“
- **Git (optional):** Wenn es uncommitted changes gibt → Proaktiv: „Noch etwas zu committen?“
- **Lange offen:** Wenn ein Grafiker-Tisch-Punkt seit z. B. 14+ Tagen unverändert „offen“ ist → Proaktiv: „[Punkt] noch aktuell oder abhaken?“ (vorsichtig, nicht nerven)

Weitere Regeln können dazukommen; der Agent bleibt schlank, wenn jede Regel einen **klaren Nutzen** hat.

---

## 5. Kurzfassung

- **Name: Anke.** Schlanker smarter Agent – ein schöner deutscher Mädchenname (Joe und Anke, nicht zwei männliche Wesen).
- **Georgs Denkweise:** Raum, Ziel, eine Sache, pragmatisch, kurz, Erledigtes abhaken. Anke unterstützt genau das: Orientierung, Stand, Offen, Proaktiv – ohne Ballast.
- **Anke = eine Briefing-Datei + ein Skript.** Kein zweiter Joe. Proaktiv nur, wo es hilft.
- **Nutzen:** Nichts vergessen, nichts doppelt „offen“, klare nächste Schritte und Vorschläge – so unterstützt Anke unsere Arbeit wirklich.

---

## 6. So arbeitest du mit Anke (für Georg)

**Anke antwortet nicht wie Joe** – sie bereitet nur das Briefing vor. Deine „Kommunikation“ mit Anke läuft über die **Quellen**, die sie liest, und darüber, dass du (oder Joe) ihr **Briefing nutzt**.

### Was du tun kannst

| Situation | Was du tust |
|-----------|-------------|
| **Session starten („Hi Joe“)** | Nichts Besonderes. Joe führt `npm run briefing` aus und liest Ankes Briefing – du siehst die Wirkung in seiner Orientierung und seinen Vorschlägen. |
| **Vor dem Arbeiten selbst Briefing frisch haben** | Im Cursor-Terminal: `npm run briefing`. Dann docs/AGENTEN-BRIEFING.md öffnen – Stand, Offen, Proaktiv, Ankes Prinzipien. |
| **Anke soll wissen, wo wir stehen** | DIALOG-STAND wird von Joe nach jeder Aufgabe aktualisiert. Wenn du willst, dass etwas als „nächster Schritt“ oder „erledigt“ drinsteht: Joe sagen („schreib in DIALOG-STAND: …“) oder selbst in docs/DIALOG-STAND.md den neuesten Block ergänzen. |
| **Proaktiv-Vorschläge nutzen** | Im Briefing steht „Proaktiv (Vorschläge)“ – z. B. „Build/Commit erledigt?“ oder „Optional: Texte kürzen“. Du oder Joe könnt ihr einen davon aufgreifen; Anke „hört“ das indirekt, weil beim nächsten Briefing der Stand wieder aus DIALOG-STAND kommt. |
| **Prinzipien im Blick** | Ankes Prinzipien (Sportwagen, Raumschiff) stehen in jedem Briefing. Joe arbeitet danach; du kannst sie als Maßstab nutzen („passt das noch zum Sportwagen?“ / „ist K2 Familie startklar?“). |

### Was du nicht brauchst

- **Nicht** mit Anke „reden“ oder Befehle geben – sie hat kein Chat.  
- **Nicht** den Grafiker-Tisch pflegen, damit Anke funktioniert – DIALOG-STAND reicht; Grafiker-Tisch ist optional.  
- **Nicht** das Briefing manuell bearbeiten – es wird bei jedem `npm run briefing` überschrieben.

### Kurz

**Sobald du „Hi Joe“ sagst, arbeitet Anke automatisch mit:** Joe frischt ihr Briefing auf, liest es und lässt sich davon steuern – Stand, Offen, Proaktiv, Prinzipien. Anke „steuert“ Joe also praktisch über unseren Dialog, ohne dass du extra etwas tun musst.

**Mit Anke arbeiten = DIALOG-STAND aktuell halten (Joe macht das) + bei Session-Start das Briefing lesen lassen (Joe macht das) + Proaktiv-Vorschläge nutzen, wenn sie passen.** Optional: vor dem Start selbst ins Briefing schauen (`npm run briefing`, dann AGENTEN-BRIEFING.md öffnen).

---

## Damit es optimal funktioniert

| Was | Wer | Wo geregelt |
|-----|-----|-------------|
| **Bei Session-Start zuerst `npm run briefing` ausführen** | Joe | Session-Start-Regel, gemeinsamer-arbeitsraum.mdc |
| **DIALOG-STAND + Ankes Briefing lesen** (Stand, Offen, Proaktiv, Prinzipien) | Joe | Session-Start-Regel |
| **DIALOG-STAND nach jeder Aufgabe aktualisieren** (nächster Schritt, erledigt) | Joe | DIALOG-STAND-Regel, Session-Ende = Licht aus |
| **Ankes Prinzipien im Briefing** (Sportwagen, Raumschiff) | Anke (Skript) | agenten-briefing.js, in jedem Briefing |
| **Optional: Georg ergänzt DIALOG-STAND**, wenn er will | Georg | Abschnitt 6 oben |

Wenn Joe diese Regeln einhält, läuft das Dreier-Team optimal. Wenn etwas fehlt (z. B. Briefing nicht gelesen), einfach sagen: „Ankes Briefing gelesen?“ oder „Stand aus DIALOG-STAND.“

**Signal „anke fragen“ (auch „af“ oder „frag anke“):** Wenn Georg schreibt **„anke fragen“**, **„af“** oder **„frag anke“**, heißt das: Joe ist unsicher oder kennt sich nicht aus – schnell orientieren. Joe soll dann **sofort** `npm run briefing` ausführen, **Ankes Briefing + DIALOG-STAND** lesen, sich orientieren und danach antworten.

---

**Siehe auch:** WIR-PROZESS.md (Georg, Raum, Wachstums-Vereinbarungen), DIALOG-STAND.md, GRAFIKER-TISCH-NOTIZEN.md, STRUKTUR-HANDELN-QUELLEN.md.  
**Dateinamen** (AGENT-KONZEPT, AGENTEN-BRIEFING, agenten-briefing.js) bleiben aus technischen Gründen unverändert; der Name der „Figur“ ist **Anke**.
