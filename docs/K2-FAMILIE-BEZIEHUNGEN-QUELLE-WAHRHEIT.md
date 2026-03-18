# K2 Familie – Beziehungen: Eine Quelle der Wahrheit (eiserne Regel)

**Dieses Dokument ist das Fundament für alle Beziehungslogik in K2 Familie.** Ohne diese Regel gibt es keine verlässliche Basis – „da können wir gleich zusperren“ (Georg, 17.03.26).

---

## Das Problem (was schiefgelaufen ist)

- **Frage war:** Ist Gisela meine Mutter, ist Philipp mein Bruder?
- **Tatsache in den Karten:** Gisela = Schwester des Nutzers (steht bei Gisela unter Geschwister: Georg Kreinecker). Philipp = **Sohn** des Nutzers.
- **Fehler:** Es wurde (in Konversation/Datenannahme) behauptet oder angenommen: Gisela = Mutter, Philipp = Bruder. Das kam **nicht** aus den gespeicherten Karten, sondern aus Vermutung oder falscher Zweitquelle.
- **Konsequenz:** Wenn Beziehungen nicht ausschließlich aus den Karten abgeleitet werden, ist jede Aussage „X ist dein Y“ unzuverlässig. Für eine Familien-App ist das inakzeptabel.

---

## Eiserne Regel (unveränderlich)

**Wer ist Mutter, Vater, Kind, Geschwister, Partner? → Antwort gibt es nur aus den Karten.**

- **Quelle der Wahrheit:** Die gespeicherten Personen (`loadPersonen(tenantId)`), Felder: `parentIds`, `childIds`, `siblingIds`, `partners`.
- **Keine zweite Quelle:** Keine Annahme, keine Namenssuche („wer heißt Gisela?“), keine Konversationserinnerung, kein „haben wir so gesagt“. Nur: Person A hat in ihrer Karte parentIds = [B, C] → B und C sind Eltern von A. childIds = [D] → D ist Kind von A. usw.
- **Überall gleich:** Stammbaum-Zeichnung, Linien, Texte („Eltern von Du“), Prüfungen, KI-Antworten – alle leiten Beziehungen **nur** aus diesen Feldern ab. Eine Funktion, eine Quelle.

---

## Technische Umsetzung (Pflicht)

1. **Eine Ableitungsfunktion:** `getBeziehungenFromKarten(personen, personId)` (in `src/utils/familieBeziehungen.ts`). Liefert für eine Person ausschließlich aus den Karten: `{ eltern, kinder, geschwister, partner }` (jeweils Array von `K2FamiliePerson`). Keine Logik außer: Ids aus parentIds/childIds/siblingIds/partners in der Personenkarte nachschlagen.
2. **Kein eigener Ablauf:** Kein zweiter Weg („wir suchen nach Namen Gisela“). Wer „Wer ist X zu Y?“ braucht → immer über diese Funktion bzw. die gespeicherten Ids.
3. **Stammbaum & UI:** Alle Anzeigen wie „Eltern von Du“, „Kinder“, „Geschwister“ kommen aus dieser Ableitung. Optional: sichtbarer Block „Beziehungen (aus deinen Karten)“ auf der Stammbaum-Seite für die Person „Du“, damit Nutzer und Entwickler sehen: Das steht so in den Karten.
4. **Stammbaum-Grafik:** Partner-Linien (gestrichelt) werden **nur** zwischen zwei Personen gezeichnet, die in den Karten als Partner eingetragen sind (p.partners). Keine Linie zwischen „benachbarten“ Geschwistern. Damit eine Zeile mit vielen Geschwistern + Partnern nicht wie eine durchgehende Partner-Kette aussieht, gibt es einen **Block-Abstand** (BLOCK_GAP) zwischen zwei „Blöcken“ (Geschwister + deren Partner) – nur aus den Karten: zwei aufeinanderfolgende Personen in der Zeile gelten als gleicher Block genau dann, wenn sie in den Karten als Partner geführt sind.
4. **KI/Agent:** Darf **nie** eine Beziehungsaussage („X ist dein Y“) aus dem Gedächtnis oder aus Namensvermutung treffen. Nur: „Das steht in deinen Karten – in der App siehst du unter Beziehungen / Stammbaum, wer aus den gespeicherten Daten als Eltern/Kinder/Geschwister/Partner geführt wird.“

---

## Kurzfassung

**Beziehungen = nur aus den Karten. Eine Quelle. Kein „na dann hab ich halt die falschen Daten genommen“. Das ist das Fundament – ohne das steht K2 Familie auf Sand.**

Verknüpfung: .cursor/rules/k2-familie-beziehungen-nur-aus-karten.mdc, K2-FAMILIE-GRUNDBOTSCHAFT.md (Raumschiff-Anspruch).
