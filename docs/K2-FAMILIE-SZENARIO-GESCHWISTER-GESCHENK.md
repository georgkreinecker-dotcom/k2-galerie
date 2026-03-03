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

### 3.1 Zugang für mehrere (Geschwister „kommen rein“) – gemeinsamer Ort in der Cloud

**Vorgabe (Lizenzprodukt):** Der **gemeinsame Ort liegt in der Cloud.** K2 Familie ist ein Lizenzprodukt; die Familiendaten (Personen, Beiträge, Momente, Events) leben auf dem Server, damit alle Beteiligten dieselbe Familie sehen und beitragen können. Details und faire Kostenstruktur: **docs/K2-FAMILIE-LIZENZ-KOSTEN.md**.

**Heute:** K2 Familie speichert pro Tenant noch in **localStorage** – Zwischenstand bis Cloud-Backend steht.

**Ziel-Architektur (Cloud):** Familiendaten auf **Server** (z. B. Supabase); wer die Familie anlegt, schließt eine **Lizenz** ab (eine Lizenz pro Familie, Gründer zahlt); **Einladungslink** oder Familien-Code; Geschwister öffnen den Link, treten bei, lesen und legen Beiträge an. Alle sehen dieselbe Familie.

**Übergang:** Bis Cloud steht, möglich: Export/Import + Merge oder ein Gerät/Treffen – dann Migration in die Cloud, sobald Backend und Lizenz laufen.

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
| **Zugang für Geschwister** („kommt rein“) | **Ziel: Cloud** (verbindlich für Lizenzprodukt) – Backend + Einladungslink; eine Lizenz pro Familie, Gründer zahlt. Siehe **docs/K2-FAMILIE-LIZENZ-KOSTEN.md**. Bis dahin optional: Export/Import + Merge oder ein Gerät. |
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
