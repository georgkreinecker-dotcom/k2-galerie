# K2 Familie – Szenario: Geschwister-Geschenk (gemeinsame Geschichte)

**Stand:** 02.03.26  
**Zweck:** Konkretes Szenario: „Ich mache meinen Geschwistern ein Geschenk – kommt in die K2 Galerie, wir legen unsere gemeinsame Geschichte an.“ Was braucht es dazu?

**Quelle:** Georg – 7 Schwestern, 5 Brüder; er legt die Grundstruktur (Eltern + Geschwister), jeder kann seinen Teil zur Vergangenheit beitragen; „Erinnerungsebene darunter“ (vor unseren Eltern) ist nicht mehr von ihm abhängig.

---

## 1. Das Szenario

- **Eine Person (z. B. Georg)** lädt die Geschwister ein: „Kommt in die K2 Galerie, wir legen unsere gemeinsame Geschichte an – beginnend mit unseren Eltern.“
- **Er legt die Grundstruktur an:** Daten der **Eltern** und der **Geschwister** (z. B. 12 Kinder). Startpunkt = **„Bei unseren Eltern“** – von dort aus die gemeinsame Linie.
- **Jeder Geschwister** kann **seinen Teil** anlegen: vor allem die **Vergangenheit vor unseren Eltern** (Großeltern, Urgroßeltern, Geschichten, Fotos). Organisch – wer etwas weiß, trägt bei („Was unsere Familie dazu weiß“).
- **Erinnerungsebene „darunter“:** Die Generation(en) vor den Eltern – Großeltern und weiter. Das ist **nicht mehr von der einen Person abhängig**; wer in der Familie etwas weiß oder hat (Fotos, Urkunden), füllt mit. So entsteht die gemeinsame History von vielen Seiten.

---

## 2. Was wir dafür schon haben (Konzept)

| Baustein | Stand |
|----------|--------|
| **Startpunkt „Bei meinen Eltern“** | Konzept in STARTPUNKT-AKTIV-PASSIV: Anker = Eltern, von dort aus die Kinder (ich + Geschwister). |
| **Grundstruktur anlegen** | Eine Person legt Personen + Beziehungen an (Eltern, Kinder) – UI Stammbaum/Personen-Seite vorhanden. |
| **Organische Beiträge** | „Was unsere Familie dazu weiß“ – jeder kann zu Personen (v. a. Vorfahren) Erinnerung, Korrektur, Foto, Datum beitragen. Konzept + Datenmodell (Beiträge) in STARTPUNKT-AKTIV-PASSIV. |
| **Passiver Teil = Vergangenheit** | Vorfahren sind der „passive“ Teil; viele können beitragen, niemand besitzt die History. |
| **Gedenkort** | Optional: Verstorbene gedenken, Gaben (Blume, Kerze) – privat/öffentlich. |

---

## 3. Was es noch braucht

### 3.1 Zugang für mehrere (Geschwister „kommen rein“)

**Heute:** K2 Familie speichert pro Tenant in **localStorage** – die Familie lebt auf **einem** Gerät/Browser. Wer die App auf einem anderen Gerät öffnet, sieht diese Familie nicht.

**Damit Geschwister „reinkommen“ und ihren Teil anlegen können, braucht es eine der folgenden Wege:**

| Option | Beschreibung | Aufwand |
|--------|--------------|--------|
| **A – Sync/Backend** | Familiendaten (Personen, Beiträge, Momente, Events) liegen auf einem **Server** (z. B. Supabase oder API wie bei K2 Galerie gallery-data). Georg erstellt die Familie, erhält einen **Einladungslink** (oder Familien-Code). Geschwister öffnen den Link, „treten der Familie bei“, können lesen und **Beiträge** (und ggf. Personen im passiven Teil) anlegen. Alle sehen dieselbe Familie. | Backend + Einladungslogik (Link/Code), ggf. einfache Anmeldung pro Familie. |
| **B – Export/Import + Merge** | Georg exportiert die Familie (JSON), schickt sie an die Geschwister. Diese importieren, fügen **ihre Beiträge** (und ggf. Vorfahren-Personen) hinzu, exportieren und schicken zurück. Georg (oder jemand) **merged** die Beiträge in die „Hauptfamilie“. Die gemeinsame Geschichte entsteht in Runden. | Kein Backend nötig; Merge-Logik (Beiträge zusammenführen, Duplikate vermeiden), klare Anleitung. |
| **C – Ein Gerät / Treffen** | Alle treffen sich (oder einer gibt die Daten ein). Kein Mehr-Nutzer-Zugang nötig – die Grundstruktur und Beiträge werden von einer Person am einen Gerät gepflegt. | Nichts Zusätzliches; nur Doku/Workflow. |

**Empfehlung für das Geschenk:** Kurzfristig **B** (Export/Import + Merge) oder **C**; mittelfristig **A** (Sync/Backend), damit alle wirklich „reinkommen“ können.

### 3.2 Grundstruktur schützen

- **Eltern + 12 Geschwister** sollen nicht versehentlich von anderen überschrieben oder gelöscht werden.
- **Lösung (mit RECHTE-ZWEIGE):** Derjenige, der die Grundstruktur anlegt, ist **Verwalter** für den Zweig „Eltern + uns (Kinder)“; die anderen können **nur Beiträge** zu den Vorfahren (passiver Teil) hinzufügen, aber die Stammdaten der Grundstruktur nicht ändern. Oder vereinfacht: **Beiträge** sind immer erlaubt; **Personen anlegen/bearbeiten** nur für den eigenen „aktiven“ Zweig oder mit Rolle Verwalter.
- **Technisch:** Bei Umsetzung von Phase 4.0 (Rechte/Zweige) den Zweig „Grundstruktur (Eltern + Geschwister)“ einem Verwalter zuordnen; alle anderen dürfen nur Beiträge (Contributions) schreiben.

### 3.3 Einladung / Kommunikation

- **Text/Botschaft:** „Kommt in die K2 Galerie – wir legen unsere gemeinsame Geschichte an, beginnend mit unseren Eltern. Ich habe die Grundstruktur angelegt; ihr könnt euren Teil zur Vergangenheit (Großeltern, Erinnerungen, Fotos) beitragen.“
- **Link:** Entweder Link zur App + **Familien-Code** oder **Einladungslink** (wenn Option A), oder Link zur App + Anleitung „Familie importieren“ (wenn Option B).
- **Erste Schritte für Geschwister:** Kurze Anleitung – „Link öffnen, Familie [Name] auswählen oder importieren, bei Großeltern/Vorfahren auf ‚Was ich dazu weiß, hinzufügen‘ klicken.“

### 3.4 Erinnerungsebene „darunter“

- Die **Generationen vor den Eltern** (Großeltern, Urgroßeltern) = **Erinnerungsebene**. Nicht eine Person muss sie füllen; **wer etwas weiß**, trägt bei (Beiträge, ggf. neue Personen anlegen, wenn noch nicht drin). So ist es „nicht mehr von mir abhängig“ – die Familie füllt gemeinsam.
- **Technisch:** Bereits im Konzept (organische Beiträge, passiver Teil). Kein zusätzlicher Baustein nötig, nur klare UI: „Vorfahren unserer Eltern“ als Bereich, in dem alle Beiträge sammeln können.

---

## 4. Kurz: Was braucht es?

| Was | Status / Bedarf |
|-----|------------------|
| Grundstruktur (Eltern + Geschwister) anlegen | ✅ Konzept + UI vorhanden (Startpunkt „Bei unseren Eltern“). |
| Jeder legt seinen Teil an (Vergangenheit vor Eltern) | ✅ Konzept „Beiträge / Was unsere Familie dazu weiß“; **Umsetzung** Beiträge-Datenmodell + UI noch offen. |
| Erinnerungsebene darunter (nicht von mir abhängig) | ✅ Konzept – viele tragen bei; keine Extra-Logik. |
| **Zugang für Geschwister** („kommt rein“) | ⚠️ **Noch zu lösen:** Entweder Sync/Backend + Einladungslink (A), oder Export/Import + Merge (B), oder ein Gerät/Treffen (C). |
| Grundstruktur schützen | ⚠️ Mit Phase 4.0 (Rechte/Zweige) oder vereinfacht: nur Beiträge erlauben für „Nicht-Verwalter“. |
| Einladungstext + Link/Code | 📄 Doku/Text; Link/Code sobald Zugang (A oder B) steht. |

---

## 5. Nächste Schritte (für Roadmap)

- [ ] **Beiträge (Contributions)** umsetzen: Datenmodell `k2-familie-{tenantId}-beitraege`, UI „Was unsere Familie dazu weiß“ + „Was ich dazu weiß, hinzufügen“ auf Personen-Seite (v. a. passiver Teil).
- [ ] **Zugang für mehrere** entscheiden und umsetzen: Option A (Backend + Einladung), B (Export/Import + Merge) oder C (Doku für Einzelgerät/Treffen). Option B als erste Stufe ohne Backend möglich.
- [ ] **Grundstruktur schützen:** Bei Rechte-Zweige (Phase 4.0): Verwalter für Zweig „Eltern + Kinder“; andere nur Beiträge. Oder vorher: klare Trennung „Stammdaten bearbeiten“ (nur wer angelegt hat?) vs. „Beiträge hinzufügen“ (alle).
- [ ] **Szenario „Geschwister-Geschenk“** als Nutzer-Anleitung (Einladungstext, erste Schritte für Geschwister) in Handbuch oder auf Startseite (optional).

---

*„Wenn ich meinen 7 Schwestern und 5 Brüdern sage: Kommt in die K2 Galerie, wir legen unsere gemeinsame Geschichte an – beginnend mit unseren Eltern. Ich lege die Grundstruktur an, jeder kann seinen Teil anlegen. Die Vergangenheit vor unseren Eltern – da könnten wir noch eine Erinnerungsebene darunter gehen, aber das ist nicht mehr von mir abhängig. Was braucht es dazu?“ – Georg, 02.03.26*
