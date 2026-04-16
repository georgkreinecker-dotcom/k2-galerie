# K2 Familie – Ideen & noch offene Punkte

**Zweck:** Alle formulierten Ideen und „noch offen“ / „später“-Punkte an einem Ort – damit nichts verloren geht.  
**Quellen:** Roadmap, RECHTE-ZWEIGE, STARTPUNKT-AKTIV-PASSIV, SZENARIO-GESCHWISTER-GESCHENK, Gedenkort, Homepage-Konzept, Lizenz, Markt-Standards.

---

## 1. Gedenkort (Phase 5)

| Punkt | Status |
|-------|--------|
| Gedenkort-Seite, Verstorbene anzeigen, Person „verstorben“ / „verstorbenAm“ | ✅ Umgesetzt (Route, Nav, Person-Felder, Seite). |
| **Gaben hinterlassen** (Blume, Kerze, Text, Foto) mit Sichtbarkeit privat/öffentlich | ✅ Umgesetzt (16.03.26): Buttons „Blume/Kerze/Text/Foto hinterlassen“ pro Person, Modal mit optionalem Text, Sichtbarkeit privat (nur für mich) / öffentlich (Name optional), Anzeige der Gaben unter jeder Person. |

---

## 2. Rechte & Zweige (Phase 4.0)

| Idee / Punkt | Quelle | Status |
|--------------|--------|--------|
| **Zweig-Definition:** A = Abstammung, B = Haushalt, C = Verwalteter Bereich (Empfehlung: C) | RECHTE-ZWEIGE | ✅ Entscheidung C; Datenmodell (K2FamilieZweig, loadZweige/saveZweige) + minimal UI auf Sicherung (16.03.26). |
| **Option 1:** Jeder Zweig = eigener Tenant (eigener Speicher, eigene Einladung). | RECHTE-ZWEIGE | Idee, nicht umgesetzt. |
| **Option 2:** Ein Tenant, Rollen (Verwalter, nur lesen); Zweig = z. B. „Nachkommen von X“. | RECHTE-ZWEIGE | Idee, nicht umgesetzt. |
| **Option 3:** Ein Tenant, Zweig = Liste von Personen-IDs (oder Wurzel + Nachkommen), pro Zweig Verwalter. | RECHTE-ZWEIGE | ✅ Datenmodell umgesetzt (personIds, verwalterIds); UI „Zweige anlegen“ später. |
| Sichtbarkeit Events (später): Nur Events anzeigen, bei denen man Teilnehmer ist / zum Zweig gehört. | RECHTE-ZWEIGE | 🔲 Später. |
| Beim Event-Anlegen (später): „Zweig auswählen“ statt 30 Einzelpersonen – dann automatisch Teilnehmer. | RECHTE-ZWEIGE | 🔲 Später. |

---

## 3. Startpunkt & aktiv / passiver Teil

| Idee / Punkt | Quelle | Status |
|--------------|--------|--------|
| **Startpunkt-Entscheidung:** „Wo beginnt deine Familie?“ – Bei mir / Bei meinen Eltern / Bei meinen Großeltern. | STARTPUNKT-AKTIV-PASSIV | ✅ Umgesetzt (16.03.26): Einstellungen `k2-familie-{tenantId}-einstellungen` mit startpunktTyp; UI auf Home („Wo beginnt deine Familie?“) + Anzeige auf Sicherung. |
| **Aktiver Teil** = den ich pflege (z. B. mein Zweig); **passiver Teil** = Vorfahren, Gedenkort, nur lesen + Gaben. | STARTPUNKT-AKTIV-PASSIV | 🔲 Mit Phase 4.0 (Rechte) umsetzbar. |
| **„Mein Bereich“** vs. **„Stammbaum“** (ganzer Baum) vs. **„Gedenkort“** in der Navigation klar. | STARTPUNKT-AKTIV-PASSIV | Teilweise: Gedenkort ✅; „Mein Bereich“ vs. Stammbaum noch eine Idee. |
| **Partnerschaft / Familie des Partners gleichrangig:** „Meine Herkunft“ / „Herkunft [Partner]“ – zwei Zweige in der History, die in „uns“ zusammentreffen; beide Herkünfte gleichwertig dargestellt (Stammbaum, Navigation, Gedenkort). | STARTPUNKT-AKTIV-PASSIV, Georg 16.03.26 | ✅ Umgesetzt (16.03.26): Einstellungen partnerHerkunftPersonId, Home „Familie des Partners gleichrangig?“ + Dropdown, Stammbaum zeigt „Zwei Zweige: Meine Herkunft · Herkunft [Name]“; FamilyTreeGraph nimmt partnerHerkunftPersonId entgegen (Layout zwei Wurzeln optional später). |
| **Stammbaum-Ausdruck:** Standpunkt wählen (Ich / Wir / Eltern / Großeltern) + Zeitlicher Ausschnitt („Nur das Jetzt“ vs. „Auch die Vergangenheit“). | STARTPUNKT-AKTIV-PASSIV | 🔲 Idee für Ausdruck/Plakat/PDF. |

---

## 4. Beiträge – „Was unsere Familie dazu weiß“

| Idee / Punkt | Quelle | Status |
|--------------|--------|--------|
| **Beiträge (Contributions)** pro Person im passiven Teil: Erinnerung, Korrektur, Foto, Datum, Geschichte – „von wem“ optional. | STARTPUNKT 2b, SZENARIO-GESCHWISTER | ✅ Umgesetzt (16.03.26): K2FamilieBeitrag, loadBeitraege/saveBeitraege, UI auf Personen-Seite. |
| Speicher z. B. `k2-familie-{tenantId}-beitraege` oder pro Person. | SZENARIO-GESCHWISTER-GESCHENK | ✅ Key `k2-familie-{tenantId}-beitraege`, ein Eintrag pro Beitrag mit personId. |
| Auf Personen-Seite (v. a. passiver Teil): **„Was unsere Familie dazu weiß“** + Button **„Was ich dazu weiß, hinzufügen“**. | STARTPUNKT 2b | ✅ Sektion „Was unsere Familie dazu weiß“, Button „Was ich dazu weiß, hinzufügen“, Modal (Art, Inhalt, von wem). |
| Organisch: Widersprüche (z. B. Oma sagte 1920, Urkunde 1921) können sichtbar bleiben oder später zusammengeführt werden. | STARTPUNKT 2b | 🔲 Verhalten bei Widersprüchen optional später. |

---

## 5. Szenario Geschwister-Geschenk

| Punkt | Status |
|-------|--------|
| Grundstruktur (Eltern + Geschwister) anlegen | ✅ Konzept + UI (Startpunkt „Bei unseren Eltern“). |
| Jeder legt seinen Teil an (Vergangenheit vor Eltern) | ✅ Konzept „Beiträge“; Umsetzung offen (siehe Abschnitt 4). |
| **Zugang für Geschwister** („kommt rein“) | 🔲 Ziel: Cloud + Einladungslink; bis dahin optional Export/Import + Merge oder ein Gerät. Siehe LIZENZ-KOSTEN. |
| Grundstruktur schützen (nur Beiträge für Nicht-Verwalter) | 🔲 Mit Phase 4.0 (Rechte/Zweige) oder vereinfacht. |
| Einladungstext + Link/Code | 🔲 Doku/Text; Link/Code sobald Zugang steht. |
| Szenario als **Nutzer-Anleitung** (Einladungstext, erste Schritte für Geschwister) in Handbuch oder auf Startseite | 🔲 Optional. |

---

## 6. Homepage & Gestaltung

| Idee / Punkt | Quelle | Status |
|--------------|--------|--------|
| **Fertige Homepage** im Sinne K2 Galerie: designte Einstiegsseite (Willkommen, Bild, klare erste Aktion). | ROADMAP, HOMEPAGE-DEFINITION | 🔲 Konzept in K2-FAMILIE-HOMEPAGE-KONZEPT; pro Tenant freie Texte/Bilder (evtl. Farben). |
| **Optional später:** Farben/Theme pro Familie (wie ök2/K2 Theme-Optionen). | HOMEPAGE-KONZEPT | 🔲 Später. |
| Bearbeitung von Willkommenstexten und -bildern im Familien-Admin (analog Seitengestaltung/Grafiker-Tisch). | HOMEPAGE-KONZEPT | 🔲 Später. |

---

## 7. Lizenz, Cloud, Zugang

| Idee / Punkt | Quelle | Status |
|--------------|--------|--------|
| **Eine Lizenz pro Familie**, Gründer zahlt; wo/wie = in der App, Stripe. | LIZENZ-KOSTEN | 🔲 Konkrete Stufen (Vorschlag); Preise/Limits später. |
| **Gemeinsamer Ort = Cloud** verbindlich für Lizenzprodukt. | ROADMAP, SZENARIO | 🔲 Backend + Einladung. |
| **Bundle optional:** „K2 Galerie + K2 Familie“ als Paket. | LIZENZ-KOSTEN | 🔲 Später. |

---

## 8. Austausch & Markt

| Idee / Punkt | Quelle | Status |
|--------------|--------|--------|
| **GEDCOM-Export/Import** (Personen + Beziehungen) für Anschluss an Legacy, MacStammbaum, FamilySearch. | ROADMAP, MARKT-STANDARDS | ✅ Plan: docs/K2-FAMILIE-GEDCOM-PLAN.md. Minimaler Export umgesetzt (16.03.26): exportK2FamilieToGedcom, Button „Als GEDCOM herunterladen“ auf Sicherung. Import geplant. |
| **FamilySearch-API** später optional (z. B. „Aus FamilySearch übernehmen“). | MARKT-STANDARDS | 🔲 Kein Zwang für erste Version. |
| Geburts-/Todesdatum in Export (wenn wir das abbilden). | MARKT-STANDARDS | 🔲 Sterbedatum jetzt bei Person ✅; Geburtsdatum evtl. später. |

---

## 9. Technik & Skalierung

| Idee / Punkt | Quelle | Status |
|--------------|--------|--------|
| **Supabase:** Tabelle(n) Familie + Tenant; RLS; später Auth pro Familie. | SUPABASE-EINBAU | 🔲 Optional. |
| **Großfamilien:** Bei 100–150 Personen (inkl. Fotos) Speicherverbrauch testen; optional später weitere Optimierung. | SKALIERUNG-GROSSFAMILIEN | 🔲 Bei Bedarf. |

---

## 10. Events → zusammengefasste Geschichte (ab Zeitpunkt)

| Idee / Punkt | Status |
|--------------|--------|
| **Events in der History** ab einem wählbaren Zeitpunkt als **zusammenfassende, redigierte Geschichte** darstellen (nicht nur Timeline-Liste). | 🔲 Idee; Konzept unten. |
| **„Ab Zeitpunkt“:** Nutzer wählt z. B. „Ab unserer Hochzeit“ / „Ab 1990“ – alles danach fließt in die Geschichte ein. | 🔲 Konzept. |
| **Redigierbar:** Der entstandene Text (Automatik-Vorschlag aus Events + Momente) kann bearbeitet werden – eine Art „Unsere Geschichte“-Seite. | 🔲 Konzept. |

**Konzept-Idee:** Events + Momente nach Datum sortiert ab Zeitpunkt X → entweder (A) automatisch generierter Fließtext-Vorschlag (z. B. „1990: … 1995: …“) oder (B) Timeline mit „Als Geschichte zusammenfassen“-Button; Ergebnis = ein editierbarer Text (neuer Inhaltstyp oder Sektion), der als „Familien-Geschichte“ ab Zeitpunkt X gespeichert und angezeigt wird. Quelle: Georg 16.03.26.

**Struktur, Leitplanken, Ideenbringer (verbindliche Quelle im Code):** `src/config/k2FamilieGeschichteStruktur.ts` – Markdown-Gerüst (Kapitel), Leitplanken (Ton, Wahrheit, Umfang, Menschen), Stichwort-Ideen für Titel, Einleitung, Übergänge, Abschluss. Die Seite „Zusammenfassende Geschichte“ zeigt diese Hilfen und den Button „Struktur-Gerüst einfügen“. Georg 04.26: *Struktur vorgeben als Ideenbringer und Leitplanken.*

---

## 11. Partner-Familie gleichrangig (Konzept)

| Ziel | Konzept |
|------|--------|
| **Gleichrangig** | Beide Herkünfte („meine“ und „Partner“) haben dieselbe Sichtbarkeit: zwei Zweige, kein „Hauptzweig“ vs. „dazu“. |
| **Zwei Zweige in der History** | Stammbaum/Navigation: z. B. „Meine Herkunft“ und „Herkunft [Name Partner]“, die in „uns“ (Partnerschaft/Kinder) zusammentreffen. |
| **Umsetzungsideen** | (1) Zweiter Startpunkt oder Zweig-Typ „Partner-Herkunft“; (2) Anzeige: zwei Wurzeln oder klare Zweig-Trennung in Baum/History; (3) Gedenkort/Beiträge für beide Zweige gleichermaßen. |
| **Datenmodell** | Bereits Partner-Beziehung vorhanden; erweitern um „Herkunfts-Zweig“ pro Person oder „Zweig = Meine Herkunft / Herkunft Partner“; UI dann beide Zweige gleichwertig anzeigen. |

*Quelle: Georg 16.03.26 – „Familie des Partners gleichrangig behandeln“.*

---

## 12. Kurz: Was als Nächstes?

- ~~**Gedenkort:** Gaben-UI (Blume, Kerze, Text, Foto) mit privat/öffentlich.~~ ✅ Erledigt.
- ~~**Beiträge:** Datenmodell + UI „Was unsere Familie dazu weiß“.~~ ✅ Erledigt (16.03.26).
- ~~**Startpunkt:** „Wo beginnt deine Familie?“ + Anker.~~ ✅ Erledigt (16.03.26).
- ~~**Rechte & Zweige (4.0):** Option C + Datenmodell (Zweig) + minimal UI.~~ ✅ Erledigt (16.03.26).
- ~~**Zugang für mehrere:** Export/Import + Merge.~~ ✅ Merge aus Datei auf Sicherung (16.03.26).
- ~~**GEDCOM:** Export einplanen + minimal umsetzen.~~ ✅ Plan-Doku + GEDCOM-Export (16.03.26).
- ~~**Partner-Familie gleichrangig** (Abschn. 11).~~ ✅ Umgesetzt (16.03.26).
- ~~**Events als zusammenfassende Geschichte ab Zeitpunkt** (Abschn. 10).~~ ✅ Umgesetzt (16.03.26).

---

*Stand: 16.03.26 – aus bestehenden K2-Familie-Docs zusammengezogen; 16.03.26 Abschn. 10+11 ergänzt (Events-Geschichte, Partner gleichrangig).*
