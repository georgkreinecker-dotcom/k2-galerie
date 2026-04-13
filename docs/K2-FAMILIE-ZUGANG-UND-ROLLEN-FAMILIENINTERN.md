# K2 Familie – Zugang, Zugangsnummer und familieninterne Rollen

**Stand:** 13.04.26  
**Zweck:** Festhalten, wie **Zutritt** (Zugangsnummer, QR), **persönliche Mitgliedsnummer** und **Rechte** (Rollen) zusammenspielen – und dass die **Familie** ihre Rollen **innen** definiert. Verbindlich für Konzept, Handbuch und spätere Umsetzung (Einladung, ggf. Supabase).

---

## 1. Drei Ebenen – nicht verwechseln

| Ebene | Was | Wer legt fest |
|--------|-----|----------------|
| **Zutritt zur Familie** | Eine **Zugangsnummer pro Familie (Tenant)** + QR/Einladung: alle landen in **dieser** Familie (allgemeiner Zugangslink). | **Inhaber:in** (oder übernommene Nummer vom Administrator eintragen). Feld: `mitgliedsNummerAdmin` in den Einstellungen. |
| **Zutritt zur eigenen Person** | **Persönliche Mitgliedsnummer** pro Familienmitglied (Karte) – nach dem Familienlink die **eindeutige** Nummer, die **diese** Person identifiziert und den privaten Bereich (Platz in Groß- und Kleinfamilie) freischaltet. | **Verbindliche Produktentscheidung B** (Georg): die einzig vernünftige Lösung. Vergeben von **Inhaber:in / Bearbeiter:in** auf der Personenkarte; Feld: `mitgliedsNummer` an `K2FamiliePerson`. |
| **Rechte in der Familie** | **Inhaber:in / Bearbeiter:in / Leser:in** – was darf jemand (Stammbaum/Struktur, Organisches, nur Lesen, Sicherung …). | **Familienintern** – geführt von der **Inhaber:in** (Zuweisung, Vertrauen, später technisch: Konto/Einladung). |

**Wichtig:** Die **Familien-Zugangsnummer** öffnet nur den Weg **in die richtige Familie**. Die **persönliche Mitgliedsnummer** ordnet danach **wer** du im Baum bist – ohne die familienweite Nummer mit der Identität zu verwechseln. **Was** jemand inhaltlich darf, kommt aus den **Rollen**.

---

## 2. Verbindliche Festlegung (Soll)

1. **Inhaber:in** trägt die Verantwortung für die Familien-Instanz: Zugangsnummer, ggf. mehrere Familien-Tenants bei dir als Lizenznehmer – aber **pro Familie** eine klare **Number + QR-Logik** (siehe Meine Familie → Zugang & Name).
2. **Bearbeiter:in** und **Leser:in** sind **familienintern** zu definieren: *Wer darf strukturell eingreifen, wer nur Ergänzendes, wer nur schauen?* Das ist eine **soziale und organisatorische** Entscheidung der Familie; die App spiegelt sie als Rollen wider (`src/types/k2FamilieRollen.ts`).
3. **Plattform (kgm)** verwaltet **keine** Stammbaum-internen Rollen einzelner Familien (Datensouveränität, Trennung) – siehe `docs/K2-FAMILIE-DATENSCHUTZ-SICHERHEIT.md`, `docs/K2-FAMILIE-DATENSOUVERAENITAET.md`.

---

## 3. Ist-Stand Technik (kurz, ehrlich)

- **Einladungs-QR (`?t=tenantId&z=…`):** Auf einem **neuen Gerät** muss die Tenant-ID **automatisch zur Familienliste** hinzugefügt und aktiv geschaltet werden (`ensureTenantInListAndSelect` in `FamilieTenantContext`). Sonst bleibt nur `default` in `localStorage` → **falsche („neutrale“) Familie**, obwohl der Link stimmt.
- **Capabilities** kommen aus **Rolle + Identität** (Sportwagenmodus, eine zentrale Funktion): `getFamilieEffectiveCapabilities` in `src/utils/familieIdentitaet.ts` baut auf `getFamilieRollenCapabilities` (`src/types/k2FamilieRollen.ts`) auf; `FamilieRolleProvider` / `useFamilieRolle` liefern diese **effektiven** Rechte.
- **Standard-Rolle** pro Familie in der Sitzung: **Leser** (`loadFamilieRolleForTenant` in `src/utils/familieRollenStorage.ts`) – damit reicht ein Familienlink **nicht**, als Inhaber:in zu arbeiten, ohne die Rolle bewusst zu wählen.
- **Identität für Schreib-Rechte:** Steht auf der Karte von **„Du“** ein **persönlicher Code** (`mitgliedsNummer`), gilt die Sitzung als bestätigt, wenn **`sessionStorage`** (`familieIdentitaetStorage.ts`) die **Personen-ID** trägt – nach erfolgreicher Code-Eingabe („Meine Familie“), nach **Einladungslink** `?m=`, oder wenn die **Inhaber:in** „Du“ im Stammbaum oder in der Dropdown-Liste setzt (vertrauenswürdige Pfade). Ohne Bestätigung: nur **anschauen** (gleiche Rolle wie gewählt, aber alle Schreib-Flags aus).
- **Ohne „Du“:** Nur **Inhaber:in** darf die **Erst-Einrichtung** (Struktur, Instanz); **Leser/Bearbeiter** ohne `ichBinPersonId` haben keine Schreib-Rechte.
- **Synchronisation:** Nach `saveEinstellungen` / `savePersonen` feuert `K2_FAMILIE_SESSION_UPDATED` (`familieStorage.ts`), damit der Rolle-Provider Personen/Einstellungen neu einliest. **Zielbild** weiter: später Server-Claims statt Session-Dropdown – Roadmap `docs/K2-FAMILIE-SUPABASE-EINBAU.md`.
- **Zusätzlich** (später/rechtlich tief): Wer im Stammbaum **welchen Zweig** bearbeiten darf, ist ein eigenes Thema – `docs/K2-FAMILIE-RECHTE-ZWEIGE.md` (Zweige/Verwalter).

---

## 4. Nächste Schritte (ohne Scope zu vermischen)

| Priorität | Schritt |
|-----------|---------|
| **Doku / Nutzerklärheit** | Im Benutzerhandbuch klar schreiben: *Familien-Zugangsnummer = welche Familie; persönliche Mitgliedsnummer = wer du bist; Rechte = Rolle.* |
| **Produkt** | UI nach **B**: Nach dem Öffnen der Familie **Eingabefeld Mitgliedsnummer** → speichert `ichBinPersonId`; Inhaber/Bearbeiter: Feld **Mitgliedsnummer** auf der Personenkarte pflegen (Eindeutigkeit pro Tenant). |
| **Produkt** | Einladungs-Flow: **Einladung annehmen → Rolle zuweisen** (nur Inhaber), sobald Identität technisch möglich ist. |
| **Architektur** | Rollen nicht nur „Dropdown Sitzung“, sondern persistiert **pro Person/Konto** pro `tenantId`, konsistent mit Datentrennung `k2-familie-*`. |

---

## 5. Querverweise (eine Spur konsultieren)

| Thema | Datei / Ort |
|-------|-------------|
| Rollen-Typen & Basis-Capabilities | `src/types/k2FamilieRollen.ts` |
| Effektive Rechte (Rolle + Identität) | `src/utils/familieIdentitaet.ts`, `src/utils/familieIdentitaetStorage.ts` |
| Zugangsnummer im Datenmodell | `mitgliedsNummerAdmin` in `K2FamilieEinstellungen` (`src/types/k2Familie.ts`) |
| Zweige / Verwalter (Feinrechte Baum) | `docs/K2-FAMILIE-RECHTE-ZWEIGE.md` |
| Sync / später Server | `docs/K2-FAMILIE-SUPABASE-EINBAU.md` |
| Offene Ideen Sammelstelle | `docs/K2-FAMILIE-IDEEN-OFFEN.md` |

---

**Kurz merken:** **Familien-Zugang** = welche Familie. **Persönliche Mitgliedsnummer** = wer du in dieser Familie bist. **Rollen** = was du dort darfst – **von der Familie bzw. Inhaber:in definiert**.
