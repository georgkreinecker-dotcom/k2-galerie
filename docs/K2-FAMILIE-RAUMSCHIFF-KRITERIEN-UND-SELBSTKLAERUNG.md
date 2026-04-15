# K2 Familie – Raumschiff-Kriterien & Selbsterklärung

**Zweck:** Aus `docs/K2-FAMILIE-GRUNDBOTSCHAFT.md` (Abschnitt *Raumschiff-Anspruch* und verwandte Festlegungen) **messbare Kriterien** ableiten, den Stand der **Selbsterklärung** in der App einschätzen und **konkrete nächste Schritte** festhalten – ohne die Metapher zu verwässern.

**Quelle der Maßstäbe:** Grundbotschaft (moralisch), Genom (Daten), Lehren aus K2 Galerie (technisch), Dokumentationspflicht.

---

## 1. Abgeleitete Raumschiff-Kriterien (Checkliste)

Jede Zeile bezieht sich auf die zitierte Stelle in der Grundbotschaft oder auf verbindliche Projekt-Doku.

| # | Kriterium | Kurz was „erfüllt“ heißt | Prüfen in |
|---|-----------|---------------------------|-----------|
| **M1** | **Grundbotschaft in Produkt und Text** | Keine Ausgrenzung durch UI/Defaults; inklusive Sprache; Religion/Politik nicht als Bewertungsraster | UI-Review, Handbuch, AGB-Abschnitt K2 Familie |
| **M2** | **Genom: Daten der Familie** | Keine kommerzielle Verwertung von Familiendaten; kommuniziert in AGB/Datenschutz/Handbuch | `K2-FAMILIE-DATENSOUVERAENITAET.md`, AGB |
| **M3** | **Keine stillen Datenverluste** | Kein Filter+`setItem` auf Familien-Keys; kein Überschreiben mit leer ohne Nutzeraktion | `familieStorage.ts`, Regeln `niemals-kundendaten-loeschen` |
| **M4** | **Klare Schichten / ein Mandant sichtbar** | Nutzer:in weiß, welche „Familie“ (Tenant) aktiv ist; Wechsel nachvollziehbar | `FamilieTenantContext`, UI Mandantenwahl |
| **M5** | **Zuverlässigkeit Cloud vs. lokal** | Was mit dem Server synchronisiert wird, ist **eindeutig** (kein Raten); Fehler haben verständliche Hinweise | `K2-FAMILIE-SUPABASE-EINBAU.md`, `familieSupabaseClient` |
| **M6** | **Zugang und Vertrauen** | Privater Raum: Zugang über Einladung/persönliche ID wie dokumentiert; keine zweite Wahrheit | Handbuch *Vertrauen*, `familieIdentitaet` |
| **M7** | **Gegenseitige Kontrolle** | Kritische Aktionen mit Bestätigung; keine versteckten Folgen | Löschen, Rollenwechsel, Kündigung |
| **M8** | **Nachvollziehbarkeit für Nachfolgende** | Entscheidungen in Doku/DIALOG-STAND; nicht nur im Chat | `DIALOG-STAND.md`, diese Datei |
| **M9** | **Export / Datensouveränität** | Familie kann Daten bei sich behalten (Backup/Export); kommuniziert | `K2-FAMILIE-DATENSOUVERAENITAET.md`, Backup-Flows in der App |

**Lesart:** Raumschiff = **alle** relevanten Kriterien für die **jeweilige Phase** erfüllt oder bewusst offen mit Plan – nicht „teilweise moralisch, technisch wackelig“ ohne Kenntnis.

---

## 2. Selbsterklärung – Analyse (Nutzerperspektive)

**Selbsterklärung** hier: *Ohne externes Handbuch und ohne Support versteht eine verständige Person in wenigen Minuten: Was ist das? Wo bin ich? Was passiert mit meinen Daten? Was ist der nächste sinnvolle Schritt?*

### Stärken (schon gut erklärt)

| Bereich | Warum |
|---------|--------|
| **Start „Meine Familie“** | Kacheln, Ampel „Erste Schritte“, klare Handlungsaufforderung (Du, Zugang, Startpunkt) |
| **Fehler- und Cloud-Hinweise** | `getFamilieLoadHinweisFuerNutzer` – sachlich, ohne falsches „WLAN“-Schema |
| **Handbuch in der App** | Eigener Pfad, Inhalte zu Vertrauen, Rollen, Lizenz – **wenn** jemand dort hinkommt |
| **Trennung Produkt** | SEO/Meta und Texte K2 Familie vs. K2 Galerie – keine Vermischung im ersten Eindruck |
| **Entwickler-Doku** | Viele `K2-FAMILIE-*.md` – für Wartung und KI gut, **nicht** Ersatz für Nutzer-Selbsterklärung |

### Lücken (Selbsterklärung schwächer)

| Thema | Problem |
|-------|---------|
| **Cloud-Umfang** | Nutzer erwartet ggf. „alles in der Cloud“; technisch nur Teile – muss **in der App** kurz sichtbar sein, nicht nur in `K2-FAMILIE-SUPABASE-EINBAU.md` |
| **„Wo sind meine Daten?“** | Unterschied Browser-Gerät (localStorage) vs. Server – für Nicht-Techniker abstrakt; ein Satz in **Einstellungen** oder Info-Layer fehlt oft als **eine** Standardstelle |
| **Viele Einstiege** | Einstieg B, Meine Familie, QR, Einladung, Musterfamilie – logisch für euch, für Neue kann die **Kette** verwirren ohne eine Zeile „Du bist hier: …“ |
| **Export/Backup** | Fachlich vorhanden – ob jede Rolle den Weg **ohne Suchen** findet, ist offen |

---

## 3. Lösungsvorschläge (priorisiert, Sportwagenmodus)

### A. Kurzfristig (hoher Nutzen, wenig Aufwand)

1. **Eine Informationskarte in den Einstellungen** (oder unter „Meine Familie“ als einklappbarer Block) mit **fester Kurzfassung**:
   - *Deine Familiendaten gehören deiner Familie; kommerzielle Verwertung gibt es nicht.*
   - *Was auf **diesem Gerät** gespeichert ist (lokal) und was über die **Familien-Cloud** geht (falls eingebunden), in **zwei Sätzen** – gleicher Text wie in der Doku, eine Quelle im Code (`getK2FamilieDatenlageKurztext()` o. Ä.).*
2. **Link „Mehr im Handbuch“** direkt neben diesem Block – **ein** Zielkapitel (z. B. Vertrauen + Daten).

### B. Mittelfristig (Selbsterklärung vertiefen)

3. **„Du bist hier“-Zeile** in der festen Kopf- oder Fußzeile von K2 Familie (nur wenn sinnvoll kurz): z. B. *Familie [Anzeigename] · Meine Familie* – reduziert Orientierungsverlust bei Deep-Links.
4. **Gleicher Info-Standard** bei jedem Cloud-bezogenen Button („Daten vom Server laden“): Tooltip oder einzeiliger Hinweis *was* geladen wird (Personen, Momente, Events – keine Magie).

### C. Vor „großem“ Launch (Raumschiff wörtlich nehmen)

5. **Review gegen M1–M9** mit dieser Checkliste (manuell oder kurzes Testprotokoll).
6. **Piloten-Feedback** gezielt zu: *Hast du verstanden, wo deine Daten liegen?* – eine Frage, viel Erkenntnis.

---

## 4. Verknüpfungen

- Grundbotschaft & Raumschiff-Metapher: **K2-FAMILIE-GRUNDBOTSCHAFT.md**
- Cloud-Technik: **K2-FAMILIE-SUPABASE-EINBAU.md**
- Datensouveränität & Export: **K2-FAMILIE-DATENSOUVERAENITAET.md**
- Lehren technisch: **K2-FAMILIE-LEHREN-AUS-K2-GALERIE.md**
- Roadmap/Phasen: **K2-FAMILIE-ROADMAP.md**

---

**Stand:** 15.04.26 – abgeleitet aus der Grundbotschaft; Selbsterklärung als Arbeitshypothese; Lösungsvorschläge bewusst **eine Quelle pro Aussage** (Info-Block + Handbuch), kein zweites paralleles Romankapitel in der App.
