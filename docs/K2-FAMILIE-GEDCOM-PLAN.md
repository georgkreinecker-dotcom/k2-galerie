# K2 Familie – GEDCOM Export/Import (Plan)

**Zweck:** Austausch mit Stammbaum-Software (z. B. Ancestry, MyHeritage, Gramps) und langfristige Nutzbarkeit der Daten.

---

## 1. GEDCOM-Standard

- **GEDCOM 5.5.1** ist der verbreitete Text-Standard für genealogische Daten.
- Zeilen: `LEVEL TAG [WERT]` (z. B. `0 INDI`, `1 NAME Max /Mustermann/`).
- IDs: `@I1@` (Person), `@F1@` (Familie).

---

## 2. Export (minimal umgesetzt)

- **Personen:** Pro Person ein `INDI` mit `NAME`, optional `SEX`, `BIRT`/`DEAT` wenn Datum vorhanden.
- **Beziehungen:** 
  - Eltern–Kind: `FAM` mit `HUSB`/`WIFE` und `CHIL`.
  - Partner: `FAM` mit `HUSB`/`WIFE` (ohne CHIL wenn nur Partnerschaft).
- **Umgesetzt:** Funktion `exportK2FamilieToGedcom(tenantId)` in `src/utils/familieGedcom.ts`; Aufruf z. B. auf Sicherung-Seite „GEDCOM exportieren“. Liefert Text (.ged), Download als Datei.

---

## 3. Import (geplant, noch nicht umgesetzt)

- **Ziel:** .ged-Datei lesen, Personen und Familien in K2-Familie-Datenmodell überführen, in bestehende Familie mergen oder neue anlegen.
- **Herausforderungen:** GEDCOM-Parser (Zeilen/Level), Zuordnung INDI → K2FamiliePerson (id, name, parentIds, childIds, partners), Duplikaterkennung bei Merge.
- **Später:** Eigener Abschnitt oder Doku-Datei für Import-Spezifikation.

---

## 4. Referenzen

- GEDCOM 5.5.1 Spec (z. B. [gedcom.org](https://gedcom.org) oder Wikipedia).
- K2-Familie-Datenmodell: `src/types/k2Familie.ts`, `docs/K2-FAMILIE-DATENMODELL.md`.
