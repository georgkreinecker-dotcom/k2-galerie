# Anke – Briefing – 12.03.26

> Ankes Briefing für Session-Start. Generiert von `npm run briefing`. Stand, Offen, Proaktiv.

---

## Stand (wo wir stehen)

### Datum: 09.03.26 – Werke 0031/0035: Bilder neu bearbeiten + Speicherproblem gelöst

- **Stand:** Beim Bearbeiten von Werken (z. B. 0031, 0035) mit neuem Bild wurde das Bild bisher nur als große data-URL in localStorage geschrieben → Speicherproblem (Quota, evtl. Anzeige). **Umsetzung:** Beim Speichern nach Bearbeiten wird die Liste zuerst mit **prepareArtworksForStorage** vorbereitet: neues Bild (mobilePhoto) geht in **IndexedDB**, in der Liste bleibt nur **imageRef**. Danach Speichern (Supabase oder localStorage) mit der vorbereiteten Liste. Anzeige nach Speichern nutzt weiterhin loadArtworksResolvedForDisplay() → Bild kommt aus IndexedDB.
- **Nächster Schritt:** Georg testen: Werk 0031 bzw. 0035 bearbeiten, neues Bild wählen, Speichern – Bild soll dauerhaft gespeichert und in Galerie/Werkansicht sichtbar sein; kein Speicher voll / kein Platzhalter.
- **Wo nachlesen:** GalerieVorschauPage.tsx (Bearbeiten-Save-Block ~4398–4422; Import prepareArtworksForStorage, saveArtworksForContextWithImageStore); artworkImageStore.ts (prepareArtworksForStorage).

---

## Offen (vom Grafiker-Tisch / DIALOG)

- **ök2 – User reinziehen:** Konzept: docs/OEK2-USER-REINZIEHEN-KONZEPT.md. **Bereits umgesetzt:** leere Stammdaten ök2, Mein-Bereich, Einstieg, Erste-Aktion-Banner; **eine Person/eine Adresse (Person-2 ausblenden)** – von Georg mehrfach als erledigt bestätigt. Optional noch: Texte kürzen. (05.03.26, Stand 06.03.26)
- **Profi-Tests (nur bei Skalierung):** Sportwagen-Tests sind erledigt (38 Tests, Merge/Persistenz/Datentrennung; siehe SPORTWAGEN-ROADMAP, PRODUKT-STANDARD-NACH-SPORTWAGEN). Dieser Punkt gilt **erst**, wenn erste **externe** Kunden/Lizenznehmer dazukommen: dann Test-Set ausbauen (z. B. E-Mail bei Fehler, Backup-Tests, Handy-Tests) und Georg daran erinnern. (notiert 23.02.26, präzisiert 02.03.26)

---

## Nächster Schritt (Hauptaufgabe für Anke)

- **Marketing-Strategie erarbeiten.** Quelle: **docs/AUFTRAG-MARKETING-STRATEGIE-ZWEI-ZWEIGE.md**. Daraus die Strategie erarbeiten – **Zweig 1: K2 Galerie** (weltweit, automatisierter Vertrieb), **Zweig 2: K2 Familie** (eigener Planungszweig, Raumschiff, Grundbotschaft, Datensouveränität). Output: z. B. **MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md** mit beiden Zweigen, oder separate Datei für den K2-Familie-Zweig. Auftrag ernst nehmen, direkt umsetzen.

---

## Proaktiv (Vorschläge)

- **Uncommitted:** Es gibt noch nicht committete Änderungen – vor Session-Ende: Commit + Push?
- **Optional:** Grafiker-Tisch hat optionale Punkte (z. B. Texte kürzen) – nur wenn du dran willst.

---

## Ankes Prinzipien (verbindlich)

- **Mustererkennung (überall):** Bei jeder Aufgabe alle Muster mitdenken: (1) Verhalten, Gewohnheiten, Vision/Idee; (2) Technik/Fehler (gleiche Problemstellung, vergangene Bugs); (3) Internet = Musterlösungen (passende für Sportwagen nutzen). Quelle: .cursor/rules/mustererkennung-kernstaerke.mdc.
- **Sportwagenprinzip (überall):** Eine Quelle, ein Standard, ein Ablauf pro Problemstellung. Kein „pro Modal anders“. Quelle: SPORTWAGEN-ROADMAP, PRODUKT-STANDARD-NACH-SPORTWAGEN.
- **Raumschiffprinzip (K2 Familie):** Qualität vor Abheben; nicht starten, bevor startklar. Qualitätsansprüche um ein Vielfaches höher. Quelle: K2-FAMILIE-GRUNDBOTSCHAFT.md (Raumschiff-Anspruch).
- **QS vor Commit:** Vor jedem Commit Test + Build (npm run test, npm run build). Quelle: .cursor/rules/qs-standard-vor-commit.mdc.
- **Bei Fehlermeldung:** Zuerst GELOESTE-BUGS + FEHLERANALYSEPROTOKOLL prüfen (gleiches Muster? Wiederholung?), dann fixen + eintragen. Quelle: qualitaet-bei-fehlermeldung.mdc.
- **Session-Ende:** DIALOG-STAND aktualisieren, WIR-PROZESS Reflexion, Commit+Push, kurze Meldung an Georg („Raum ist bereit“).
- **Kundendaten:** Niemals still löschen/überschreiben; kein Filter+setItem. Quelle: .cursor/rules/niemals-kundendaten-loeschen.mdc.

---

## Georgs Präferenzen (Kurzreferenz)

- Kurz antworten, sofort handeln, Erledigtes abhaken.
- Keine langen Texte; kein „fertig“ ohne Commit.
- Bei „ro“ / Session-Start: DIALOG-STAND + dieses Briefing lesen, dann weitermachen.

---

*Mehr: docs/AGENT-KONZEPT.md – Abschnitt „So arbeitest du mit Anke (für Georg)“.*
