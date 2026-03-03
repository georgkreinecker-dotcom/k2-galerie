# K2 Familie – Startpunkt & aktiver / passiver Teil

**Stand:** 02.03.26  
**Zweck:** Struktur dafür, wo ich mit der Familien-App beginne und wie sich „aktiver“ (pflegen) und „passiver“ (anschauen, gedenken) Teil organisieren.

---

## 1. Die Startpunkt-Entscheidung

**Wenn ich heute beginne**, muss ich entscheiden: **Wo ist mein Startpunkt?**

| Option | Bedeutung | Beispiel |
|--------|-----------|----------|
| **Bei mir** | Ich bin der Anker – meine Person, meine Kinder, meine Partnerschaft(en). Der Baum wächst „von mir aus“ (nach oben: Eltern, Großeltern; nach unten: Kinder, Enkel). | Ich lege mich an, dann Eltern, dann Großeltern; oder zuerst mich + Kinder. |
| **Bei meinen Eltern** | Das Paar (oder die Personen) „Eltern“ ist der Anker – ich und Geschwister sind die nächste Generation, Großeltern darüber. | Sinnvoll wenn die Geschichte „unser Haus, unsere Herkunft“ im Mittelpunkt steht. |
| **Bei meinen Großeltern** | Die Großeltern-Generation ist der Anker – von dort aus verzweigt sich die Familie nach unten (Eltern, ich, Onkel/Tanten, Cousins …). | Sinnvoll wenn viel Wissen über die ältere Generation da ist und man „von oben“ aufschreibt. |

**Technisch / in der App:**  
- Der gewählte **Startpunkt** = eine Person oder ein Paar als **Anker** für die **Standardansicht** (z. B. Stammbaum-Wurzel, „Home“-Fokus).  
- **Nicht** zwingend die einzige Wurzel im Datenmodell (der Graph kann beliebig verknüpft sein) – sondern die **erzählerische** und **navigationstechnische** Wurzel: „Hier beginnt für mich die Geschichte in dieser App.“

**UI/Onboarding:** Beim Anlegen einer neuen Familie oder beim ersten Start: eine klare Frage, z. B.  
**„Wo soll deine Familie in dieser App beginnen?“** → Auswahl: **Bei mir** / **Bei meinen Eltern** / **Bei meinen Großeltern** (evtl. mit Kurztext). Gespeichert z. B. als Tenant-Einstellung `startpunktPersonId` oder `startpunktTyp: 'ich' | 'eltern' | 'grosseltern'`.

---

## 2. Aktiver Teil vs. passiver Teil

Es gibt einen **aktiven** und einen **passiven** Teil der App – so können wir Struktur und Rechte sinnvoll zuordnen.

| | **Aktiver Teil** | **Passiver Teil** |
|---|------------------|-------------------|
| **Bedeutung** | Der Bereich, den **ich pflege** – Personen anlegen/bearbeiten, Momente hinzufügen, Events anlegen. „Mein Arbeitsbereich.“ | Der Bereich, den **ich anschaue** – Vorfahren, andere Zweige, Gedenkort. Lesen, gedenken, ggf. Gaben hinterlassen, aber nicht „bauen“. |
| **Typisch** | Ich + meine Nachkommen (Kinder, Enkel); oder mein Haushalt (Option B in RECHTE-ZWEIGE); oder der Zweig, für den ich als Verwalter eingetragen bin. | Vorfahren (Eltern, Großeltern, …), Zweige von Geschwistern/Onkel/Tanten, Verstorbene am Gedenkort. |
| **Rechte** | Hier darf ich anlegen, bearbeiten, löschen (nach RECHTE-ZWEIGE: Verwalter für diesen Zweig). | Hier nur lesen und ggf. **Gaben/Gedenken** (Blume, Kerze, Text) – keine Stammdaten ändern (oder nur in Absprache). |
| **UI** | Klar erkennbar: z. B. **„Mein Bereich“** / **„Den ich pflege“** – Liste oder Stammbaum-Ausschnitt, Bearbeiten-Buttons, „Person hinzufügen“. | **„Stammbaum“** (ganzer Baum, nur Lesen außerhalb aktiver Zone), **„Gedenkort“**, evtl. **„Vorfahren“** als reine Leseansicht. |

**Warum das hilft:**  
- Ich muss nicht „die ganze Familie“ verwalten – nur **meinen** aktiven Teil.  
- Der passive Teil bleibt überschaubar (lesen, gedenken), ohne dass ich mich verantwortlich fühle, alles zu pflegen.  
- Rechte (Phase 4.0) können so umgesetzt werden: **aktiver Teil** = Zweig, in dem ich Verwalter bin; **passiver Teil** = Rest (nur Lesen + Gedenkort-Gaben).

---

## 2b. Passiver Teil = Vergangenheit, die viele gemeinsam füllen

Der passive Teil kommt **aus der Vergangenheit** und existiert „nur noch in der History“. **Vieles weiß ich nicht – aber andere Teile der Familie könnten etwas wissen.** Daraus bauen wir eine **organische Struktur**:

- **Nicht eine Person „besitzt“ die Vergangenheit**, sondern **viele können beitragen**, was sie wissen: Oma erzählte das, Onkel hat das Foto, ich habe die Geburtsurkunde gesehen.
- **Pro Person im passiven Bereich (Vorfahre, Verstorbene):** Alle, die Zugang zur Familie haben, können **Wissen beisteuern** – Erinnerung, Korrektur, Datum, Foto, Geschichte. Das sammelt sich **organisch** an einer Stelle: „Was unsere Familie dazu weiß.“
- **Technisch:** Z. B. **Beiträge** (Contributions) pro Person: `personId`, Art (Erinnerung / Korrektur / Foto / Geschichte / Datum), Inhalt, „von wem“ (optional), Datum. Gespeichert z. B. als `k2-familie-{tenantId}-beitraege` oder pro Person als Liste. Auf der Personen-Seite (passiver Teil): Anzeige **„Was unsere Familie dazu weiß“** – Liste der Beiträge von verschiedenen Menschen; Button **„Was ich dazu weiß, hinzufügen“**.
- **Organisch:** Es gibt keinen „Chef der Vergangenheit“. Wer etwas weiß, trägt bei. Widersprüche (z. B. unterschiedliche Geburtsdaten) können sichtbar bleiben („Oma sagte 1920, Urkunde sagt 1921“) oder später von jemandem zusammengeführt werden – je nach Entscheidung der Familie.
- **Gedenkort** bleibt zusätzlich der Ort für **Gaben** (Blume, Kerze, privater/öffentlicher Eintrag). Die **Wissens-Beiträge** sind der andere Strang: sachliches Wissen und Erinnerungen, die die gemeinsame History füllen.

So wächst die Vergangenheit **von vielen Seiten** – organisch, ohne dass eine Person alles wissen oder pflegen muss.

---

## 2c. In Partnerschaft: zwei Zweige in der History

**Wenn ich in einer Partnerschaft bin**, gibt es in der Vergangenheit **zwei Linien**: meine Herkunft und die des Partners. Beide gehören dazu – keiner „übernimmt“ den anderen.

- **Strukturell:** Die History hat **zwei Zweige**, die in der **Partnerschaft zusammenlaufen**. Von „uns“ (dem Paar) nach oben: **meine** Eltern, Großeltern, … und **Partner's** Eltern, Großeltern, …. Zwei Linien, ein gemeinsamer Baum – niemand gibt seine Linie auf.
- **In der App:** Klar erkennbar z. B. als **„Meine Herkunft“** und **„Herkunft [Partner-Name]“** (oder „Zweig des Partners“). Beide Zweige sind gleichberechtigt sichtbar; Stammbaum-Ansicht zeigt beide Linien, die sich in uns treffen.
- **Beiträge:** Organisch gilt für **beide** Zweige: Ich kann zu meinen Vorfahren beitragen, Partner zu seinen/ihren; wir können wechselseitig zu den jeweiligen Vorfahren etwas beisteuern („Was ich dazu weiß“), wenn wir etwas erfahren haben. So wächst die History der Partnerschaft aus beiden Richtungen.
- **Startpunkt in der Partnerschaft:** Oft sinnvoll: **„Wir“** (das Paar) als Anker – von dort aus nach oben zwei Äste (meine Herkunft, Partner-Herkunft), nach unten gemeinsame Kinder (falls vorhanden). So ist von vornherein klar: zwei Linien, ein gemeinsamer Raum.
- **Rechte (später):** Jeder kann Verwalter „seines“ Herkunfts-Zweigs sein (oder beide verwalten gemeinsam); entscheidend ist, dass **beide Zweige** in der Struktur und in der UI vorkommen und nicht einer den anderen ersetzt.

---

## 3. Wie wir das organisieren (Vorschlag)

1. **Beim Start / Onboarding:**  
   - Frage: **„Wo beginnt deine Familie?“** → Bei mir / Bei meinen Eltern / Bei meinen Großeltern.  
   - Speichern als Anker für Standardansicht (Stammbaum-Wurzel, Startseite).

2. **Aktiver Teil:**  
   - Entweder festgelegt über **„Mein Zweig“** (RECHTE-ZWEIGE Option C: Verwalter pro Zweig) – dann ist „aktiv“ = der Zweig, in dem ich Verwalter bin.  
   - Oder vereinfacht für den Start: **„Aktiv = meine Person + meine Nachkommen“** (von mir nach unten). Alles andere erst mal passiv.

3. **Passiver Teil:**  
   - Alles, was **nicht** mein aktiver Zweig ist: Vorfahren, Geschwister-Zweige, etc.  
   - **Organisch:** Jeder in der Familie kann **„Was ich dazu weiß“** zu Personen in der Vergangenheit beitragen (Erinnerung, Korrektur, Foto, Datum) – siehe Abschnitt 2b.  
   - Plus **Gedenkort** – Gaben (Blume, Kerze, Text), privat/öffentlich.

4. **Navigation / Oberfläche:**  
   - Z. B. **„Mein Bereich“** (aktiv) vs. **„Stammbaum“** (ganzer Baum, Leseansicht) vs. **„Gedenkort“** (passiv, Gaben).  
   - In **Partnerschaft:** zusätzlich oder im Stammbaum erkennbar: **„Meine Herkunft“** / **„Herkunft [Partner]“** – zwei Zweige in der History, die in „uns“ zusammentreffen.  
   - So ist sofort klar: Wo arbeite ich, wo schaue ich nur – und dass die History aus zwei Linien besteht.

5. **Stammbaum-Ansicht & Ausdruck – ich entscheide:**  
   Beim Anzeigen und beim **Ausdruck** (Plakat, PDF) wähle ich immer **zwei Dinge**:  
   - **Standpunkt:** Von wem aus zeige ich den Baum? (Ich / Wir / Eltern / Großeltern – der Anker.)  
   - **Zeitlicher Ausschnitt:** **„Nur das Jetzt“** (z. B. nur die aktuellen Generationen, ohne Vorfahren – das Heute) oder **„Auch die Vergangenheit“** (vollständiger Baum inkl. History, Verstorbene, alle Zweige).  
   So kann das Bild oder der Ausdruck genau das zeigen, was ich gerade brauche – nur das Jetzt oder das Ganze inkl. Vergangenheit.

---

## 4. Verknüpfung mit bestehenden Konzepten

- **RECHTE-ZWEIGE (Phase 4.0):** „Aktiver Teil“ = der Zweig, für den ich Verwalter bin. „Passiver Teil“ = Rest (Lesen + Gedenkort).
- **GEDENKORT (Phase 5):** Gehört zum **passiven** Teil – ich schaue, gedenke, hinterlasse Gaben, ändere aber keine Stammdaten der Verstorbenen (oder nur in meinem aktiven Zweig).
- **Startpunkt:** Bestimmt die **erzählerische Wurzel**, nicht zwingend die Rechte-Grenze – Rechte kommen aus Zweig/Verwalter.

---

## 5. Nächste Schritte (für Roadmap)

- [ ] Startpunkt-Frage im Onboarding / bei neuer Familie („Wo beginnt deine Familie?“) und Speicherung als Anker.
- [ ] Stammbaum-Ansicht: Anzeige so, dass **Anker** als Wurzel oder Zentrum erkennbar ist (je nach gewähltem Startpunkt).
- [ ] UI-Kennzeichnung **„Mein Bereich“** (aktiv) vs. **„Stammbaum / Alle“** (passiv) – sobald Rechte/Zweige (Phase 4.0) umgesetzt sind.
- [ ] **Beiträge / „Was unsere Familie dazu weiß“:** Pro Person (v. a. im passiven Teil) können alle Zugangsberechtigten Wissen beisteuern (Erinnerung, Korrektur, Foto, Datum). Datenmodell: Beiträge-Liste pro Tenant; Anzeige auf Personen-Seite; „Was ich dazu weiß, hinzufügen“.
- [ ] Gedenkort klar dem **passiven** Teil zugeordnet (Navigation, Texte).
- [ ] **Partnerschaft:** In der UI zwei Herkunfts-Zweige erkennbar („Meine Herkunft“ / „Herkunft [Partner]“); Startpunkt optional „Wir“ als Anker; beide Linien beitragbar.
- [ ] **Stammbaum-Ansicht & Ausdruck:** Nutzer entscheidet immer **von welchem Standpunkt** und **welcher zeitliche Ausschnitt** gezeigt wird: (1) **Standpunkt** = Anker (ich / wir / Eltern / Großeltern). (2) **Zeitlich** = **„Nur das Jetzt“** (z. B. nur lebende / aktuelle Generationen, kein Vorfahren-Teil) oder **„Auch die Vergangenheit“** (vollständiger Baum inkl. History). Gilt für Bildschirm-Ansicht und für Ausdruck (Plakat, PDF). So wähle ich selbst: nur das Heute oder das Ganze inkl. Vergangenheit.

---

*„Wenn ich heute entscheide, mit der Familien-App zu beginnen, muss ich entscheiden: Wo ist der Startpunkt? Bei mir, bei meinen Eltern, bei meinen Großeltern. Es gibt einen aktiven Teil und einen passiven Teil – wie können wir das organisieren?“ – Georg, 02.03.26*

*„Zum passiven Teil, der aus der Vergangenheit kommt und nur mehr in der History existiert – da gibt es vieles, das ich nicht weiß, aber andere Teile meiner Familie könnten etwas wissen. Wie können wir da eine organische Struktur aufbauen?“ – Georg, 02.03.26*

*„Wie macht man das in Partnerschaft mit dem Zweig des Partners in der History?“ – Georg, 02.03.26*

*„Beim Ausdruck oder in der Stammbaum-Ansicht entscheide ich immer, von welchem Standpunkt ich das Bild oder den Ausdruck sehen will – ob auch die Vergangenheit oder nur das Jetzt abgebildet sein soll.“ – Georg, 02.03.26*
