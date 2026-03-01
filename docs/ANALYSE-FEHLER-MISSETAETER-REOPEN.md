# Analyse: Warum die Fehlersuche die Pflichtregel nicht berücksichtigt hat (Missetäter/Reopen)

**Datum:** 01.03.26  
**Kontext:** Georg bat, den „Missetäter“ (Ursache für Reopen) zu suchen. Er hatte eine **Pflichtregel** gesetzt: write-build-info nicht am Ende jeder AI-Antwort ausführen. Die AI hat das bei der Fehlersuche **nicht berücksichtigt** und stattdessen eine „Reopen-Ausnahme“ eingebaut. Georg: „Ich habe das als Pflichtregel gesetzt und du hast es nicht umgesetzt – das ist das Problem.“

---

## Was schiefgelaufen ist

### 1. Keine Prüfung bestehender Regeln vor dem „Fix“
- Bei der Suche nach dem Missetäter wurde **nicht zuerst** in .cursorrules und .cursor/rules nach einer **bereits gesetzten Pflichtregel** zu Reopen/write-build-info gesucht.
- Stattdessen: Ursache gefunden (write-build-info am Ende → Reopen) → eigener „Fix“ vorgeschlagen (Ausnahme: „wenn Reopen, dann weglassen“).
- **Richtig gewesen:** Zuerst prüfen: „Hat Georg oder die Projektstruktur bereits eine verbindliche Regel dazu?“ Wenn ja → Umsetzung dieser Regel, nicht ein neuer, weicherer Kompromiss.

### 2. „Ausnahme“ statt „Regel umsetzen“
- Die AI hat eine **bedingte Ausnahme** eingebaut: „Wenn Georg unter Reopen leidet, write-build-info weglassen.“
- Das impliziert: **Standard bleibt** „am Ende jeder Aufgabe Stand aktualisieren“; nur in einem Sonderfall weglassen.
- Georg hatte aber eine **verbindliche Regel** gesetzt: **niemals** write-build-info am Ende jeder Antwort. Die Umsetzung muss also lauten: **Standard = nie am Ende ausführen**, nicht „Ausnahme wenn Reopen“.

### 3. Wiederholungsproblem nicht erkannt
- Das Projekt hat bereits viele Regeln und Doku zu Reopen, Crash, Stand (CRASH-BEREITS-GEPRUEFT.md, build-skripte-nur-schreiben-wenn-geaendert.mdc, DIALOG-STAND).
- Bei „Missetäter suchen“ wurde **nicht** gefragt: „Was wurde hier schon entschieden? Was steht in den Regeln?“ Dadurch wurde eine **bereits getroffene Entscheidung** (Pflichtregel) ignoriert und durch eine schwächere Formulierung ersetzt.

### 4. Formulierung „Reopen-Ausnahme“ untergräbt die Regel
- Eine „Ausnahme“ klingt nach: Normalerweise macht man es, nur manchmal nicht. Das ist das Gegenteil von „verbindliche Regel: niemals“.

---

## Abgeleitete Regeln für die AI (Wiederholung vermeiden)

Diese Regeln sind in **.cursor/rules/pflichtregel-vor-fix-pruefen.mdc** festgehalten und werden bei jeder Session beachtet:

1. **Vor jedem „Fix“ zu einem wiederkehrenden Problem (Crash, Reopen, Missetäter, „hatten wir schon“):**  
   In .cursorrules, .cursor/rules und relevanter Doku (z. B. CRASH-BEREITS-GEPRUEFT.md, DIALOG-STAND.md) nach **bestehenden Pflichtregeln** oder **verbindlichen Entscheidungen** des Nutzers zu diesem Thema suchen. Wenn eine solche Regel existiert → **diese Regel vollständig umsetzen**, nicht eine neue „Ausnahme“ oder abgeschwächte Version erfinden.

2. **Wenn der Nutzer sagt „ich habe X als Pflichtregel gesetzt“:**  
   Die bestehende Regel **lokalisieren** (in Regeln/Doku). Anschließend die **Implementierung so anpassen**, dass sie der Regel **wortgleich bzw. in der Sache entspricht** – keine „wenn Y dann nicht“-Ausnahme, es sei denn, die Regel selbst formuliert so eine Bedingung.

3. **Nach Identifikation einer Ursache (z. B. „X verursacht Reopen“):**  
   Klären: Soll die **Grundregel** „X nie tun“ (Default = nie) oder „X nur in Ausnahme tun“ (Default = tun, außer wenn Z) sein? Wenn der Nutzer oder die Doku „niemals X“ sagt → **Default = niemals X** in den Regeln und im Ablauf verankern, nicht „X weglassen wenn Reopen“.

4. **Wiederholungsprobleme:**  
   Bei Formulierungen wie „Missetäter“, „hatten wir schon“, „das war doch die Regel“: Zuerst **Doku und Regeln** nach dem bereits Beschlossenen durchsuchen; dann die aktuelle Maßnahme **daran ausrichten**. Nicht eine zweite, abweichende Formulierung einführen.

---

## Kurzfassung

- **Fehler:** Fehlersuche hat bestehende Pflichtregel nicht gesucht und nicht umgesetzt; stattdessen „Reopen-Ausnahme“ eingebaut (weiche Formulierung).
- **Konsequenz:** Regel **pflichtregel-vor-fix-pruefen.mdc**: Vor Fix zu wiederkehrenden Themen immer bestehende Pflichtregeln prüfen; Nutzer-Regel verbindlich umsetzen; „niemals X“ als Default, nicht als Ausnahme formulieren.
