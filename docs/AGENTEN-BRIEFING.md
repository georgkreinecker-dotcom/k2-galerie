# Agenten-Briefing – 07.03.26

> Generiert von `npm run briefing` (scripts/agenten-briefing.js). Bei Session-Start lesen.

---

## Stand (wo wir stehen)

### Datum: 06.03.26 – Build-Fix Design-Vorschau + ro5 abgesichert

- **Thema:** JSX-Fehler in ScreenshotExportAdmin (Design-Tab Vorschau) blockierte Vercel-Build; Georg: „weiter, aber bei ro5 nicht wie Idioten dastehen“.
- **Was gemacht:** (1) **ScreenshotExportAdmin:** Vorschau-Block in Hilfsfunktion `renderDesignVorschau` ausgelagert (Einfügepunkt nach `  }`, vor `  return (`); im JSX nur noch `{designSubTab === 'vorschau' && renderDesignVorschau()}`. (2) **GaleriePage:** In `GalerieEntdeckenGuide` fehlte `useNavigate()` → `navigate` war undefined → `const navigate = useNavigate()` am Anfang der Komponente ergänzt. (3) **ro5-Doku:** In WEITERARBEITEN-NACH-ABSTURZ Abschnitt „ro5 / Code-5 – damit wir nicht wie Idioten dastehen“ + Design-Vorschau-Fix beschrieben (richtiger Weg = Auslagerung in Funktion, nicht Wrapper/IIFE). CRASH-BEREITS-GEPRUEFT Eintrag ergänzt.
- **Erledigt:** Commit 8901370, Push. Build grün, Vercel baut. Bei ro5: DIALOG-STAND + WEITERARBEITEN-NACH-ABSTURZ lesen.

---

## Offen (vom Grafiker-Tisch / DIALOG)

- **ök2 – User reinziehen:** Konzept: docs/OEK2-USER-REINZIEHEN-KONZEPT.md. **Bereits umgesetzt:** leere Stammdaten ök2, Mein-Bereich, Einstieg, Erste-Aktion-Banner; **eine Person/eine Adresse (Person-2 ausblenden)** – von Georg mehrfach als erledigt bestätigt. Optional noch: Texte kürzen. (05.03.26, Stand 06.03.26)
- **Profi-Tests (nur bei Skalierung):** Sportwagen-Tests sind erledigt (38 Tests, Merge/Persistenz/Datentrennung; siehe SPORTWAGEN-ROADMAP, PRODUKT-STANDARD-NACH-SPORTWAGEN). Dieser Punkt gilt **erst**, wenn erste **externe** Kunden/Lizenznehmer dazukommen: dann Test-Set ausbauen (z. B. E-Mail bei Fehler, Backup-Tests, Handy-Tests) und Georg daran erinnern. (notiert 23.02.26, präzisiert 02.03.26)

---

## Proaktiv (Vorschläge)

- **Uncommitted:** Es gibt noch nicht committete Änderungen – vor Session-Ende: Commit + Push?
- **Optional:** Grafiker-Tisch hat optionale Punkte (z. B. Texte kürzen) – nur wenn du dran willst.

---

## Georgs Präferenzen (Kurzreferenz)

- Kurz antworten, sofort handeln, Erledigtes abhaken.
- Keine langen Texte; kein „fertig“ ohne Commit.
- Bei „ro“ / Session-Start: DIALOG-STAND + Grafiker-Tisch (und dieses Briefing) lesen, dann weitermachen.

---

*Siehe docs/AGENT-KONZEPT.md für Analyse und Spezifikation des Agenten.*
