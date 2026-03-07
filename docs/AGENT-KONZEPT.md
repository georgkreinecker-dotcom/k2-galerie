# Agenten-Konzept – Schlanker smarter Agent für unsere Arbeit

**Zweck:** Ein Agent, der Georg und Joe in der gemeinsamen Arbeit **wirklich unterstützt** – mit Orientierung, Zustand und **proaktiven Vorschlägen**. Kein Ballast, kein zweiter Joe: ein **Gedächtnis und ein Hinweisgeber**, der in unseren Raum passt. Er übernimmt die Rolle, für die früher der Grafiker-Tisch gedacht war (Stand, Offen, nächste Schritte) – schlanker und im normalen Ablauf integriert.

---

## 1. Georgs Denk- und Handlungsweise (Analyse aus unserem Raum)

### Aus WIR-PROZESS, Regeln und dem, was wir geschaffen haben

| Dimension | Wie Georg denkt und handelt | Konsequenz für den Agenten |
|-----------|----------------------------|-----------------------------|
| **Bilder & Metaphern** | Denkt in „Raum“, „Licht“, „eine Sache tun“. Nicht abstrakt – konkret, vorstellbar. | Agent spricht in klaren Bildern: „Auf dem Tisch liegt …“, „Offen: …“. Keine abstrakten Kategorien. |
| **Unternehmer** | Denkt in Märkten, Chancen, Skalierung. Ziel vor Anstrengung. | Agent hält **Ziele** und **nächste Schritte** sichtbar; schlägt vor, was als Nächstes sinnvoll ist (nicht was „noch zu tun“ ist im Sinne von Abarbeitung). |
| **Pragmatisch & direkt** | Was funktioniert, bleibt. Sagt, was er denkt. Ungeduldig mit Wiederholungen. | Agent: kurze, klare Infos. Keine langen Erklärungen. **Erledigtes** sofort als erledigt markieren – sonst nervt es („hab ich dir schon zweimal gesagt“). |
| **Eine Sache, dann Kraft** | „Tue eine Sache – und du wirst die Kraft dazu haben.“ Schritt für Schritt. | Agent schlägt **einen** sinnvollen nächsten Schritt vor, nicht zehn. Priorisierung: was bringt uns wirklich weiter? |
| **Was er schätzt** | Sofort handeln, kurze Rückmeldungen, alles auf dem Tisch wenn er kommt. | Agent sorgt dafür, dass **bei Session-Start** alles auf dem Tisch liegt: Stand, Offen, Proaktiv. Joe liest das und handelt. |
| **Was ihn nervt** | Wiederholungen, „fertig“ ohne Commit, Kontext vergessen, lange Texte. | Agent hilft, **Kontext zu halten** und **Erledigtes zu markieren**. Proaktiv: „Noch etwas zu committen?“ wenn angebracht. |
| **Team-Hebel** | Unternehmer + Persönlichkeit + KI = außergewöhnliche Ergebnisse. Der Raum ist das Gedächtnis. | Agent **ist Teil des Raums** – er verlängert das Gedächtnis (Stand, Offen) und fügt **Proaktiv** hinzu (Vorschläge), ohne Joe zu ersetzen. |

### Muster aus Session-Reflexionen

- **Ziel vor Anstrengung** – Agent kann daran erinnern: „Ist das Ziel noch im Blick?“ bei großen Schritten.
- **Never change a winning team** – Agent nennt nichts „offen“, was Georg schon als erledigt bestätigt hat (wie Person-2).
- **Nach Crash / ro5** – Agent hält fest: was war zuletzt dran, was ist wirklich offen; keine Wiederholung alter „offener“ Punkte.
- **Verbindlich = zuverlässig** – Wenn der Agent etwas vorschlägt (z. B. „Build laufen lassen“), soll es ein **sinnvoller** Vorschlag sein, kein Rauschen.

---

## 2. Was der Agent tut (Spezifikation)

### Kernaufgaben

1. **Orientierung bei Session-Start**  
   Eine Datei (**AGENTEN-BRIEFING.md**) enthält: **Stand** (wo wir stehen), **Offen** (echt offene Wünsche/Nächster Schritt), **Proaktiv** (Vorschläge). Joe (oder Georg) liest sie zu Session-Beginn – alles auf dem Tisch.

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

### Was der Agent **nicht** tut

- **Kein zweiter Joe** – er schreibt keinen Code, führt keine Befehle aus. Er bereitet vor und schlägt vor.
- **Kein Ballast** – keine eigene UI, kein eigener Chat, keine Konfigurationsorgie. Eine Datei + ein Skript.
- **Keine Vorschläge ohne Nutzen** – Proaktiv nur, wenn es einen klaren Nutzen gibt (nächster Schritt, Abhaken, Build/Commit).

---

## 3. Wo der Agent lebt (Technik)

| Teil | Wo | Wie |
|------|-----|-----|
| **Briefing** | `docs/AGENTEN-BRIEFING.md` | Wird von Skript befüllt; bei Session-Start gelesen (von Joe oder Georg). |
| **Skript** | `scripts/agenten-briefing.js` | Liest DIALOG-STAND, optional Grafiker-Tisch (wenn genutzt), optional git; schreibt Stand, Offen, Proaktiv in AGENTEN-BRIEFING.md. |
| **Nutzung** | Session-Start (oder vor „Hi Joe“) | `node scripts/agenten-briefing.js` ausführen (oder `npm run briefing`), dann AGENTEN-BRIEFING.md lesen. |
| **Regel** | `.cursor/rules/` | Session-Start-Regel: Agenten-Briefing lesen (damit jede KI-Session den Agenten nutzt). |

**Ablauf:**

1. **Nach Session-Ende (Joe):** DIALOG-STAND aktualisieren; Erledigtes abhaken.
2. **Session-Start (Joe):** Zuerst **`npm run briefing`** ausführen → Briefing ist immer frisch. Dann DIALOG-STAND + **AGENTEN-BRIEFING** lesen → Stand, Offen, Proaktiv; Joe handelt und kann proaktive Vorschläge aufgreifen.

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

- **Georgs Denkweise:** Raum, Ziel, eine Sache, pragmatisch, kurz, Erledigtes abhaken. Agent unterstützt genau das: Orientierung, Stand, Offen, Proaktiv – ohne Ballast.
- **Agent = eine Briefing-Datei + ein Skript.** Kein zweiter Joe. Proaktiv nur, wo es hilft.
- **Nutzen:** Nichts vergessen, nichts doppelt „offen“, klare nächste Schritte und Vorschläge – so unterstützt der Agent unsere Arbeit wirklich.

---

**Siehe auch:** WIR-PROZESS.md (Georg, Raum, Wachstums-Vereinbarungen), DIALOG-STAND.md, GRAFIKER-TISCH-NOTIZEN.md, STRUKTUR-HANDELN-QUELLEN.md.
