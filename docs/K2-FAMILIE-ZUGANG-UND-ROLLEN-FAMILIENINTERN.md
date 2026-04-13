# K2 Familie – Zugang, Zugangsnummer und familieninterne Rollen

**Stand:** 13.04.26  
**Zweck:** Festhalten, wie **Zutritt** (Zugangsnummer, QR) und **Rechte** (Rollen) zusammenspielen – und dass die **Familie** ihre Rollen **innen** definiert. Verbindlich für Konzept, Handbuch und spätere Umsetzung (Einladung, ggf. Supabase).

---

## 1. Zwei Ebenen – nicht verwechseln

| Ebene | Was | Wer legt fest |
|--------|-----|----------------|
| **Zutritt zur Familie** | Eine **Zugangsnummer pro Familie (Tenant)** + QR/Einladung: Gäste landen in **dieser** Familie. | **Inhaber:in** (oder übernommene Nummer vom Administrator eintragen). |
| **Rechte in der Familie** | **Inhaber:in / Bearbeiter:in / Leser:in** – was darf jemand (Stammbaum/Struktur, Organisches, nur Lesen, Sicherung …). | **Familienintern** – geführt von der **Inhaber:in** (Zuweisung, Vertrauen, später technisch: Konto/Einladung). |

**Wichtig:** Die Zugangsnummer **definiert keine feingliedrigen Rechte**. Sie öffnet nur den Weg **in die richtige Familie**. **Was** jemand dort darf, kommt aus den **Rollen** – und die müssen **innerhalb der Familie** geklärt und (langfristig) zugewiesen werden.

---

## 2. Verbindliche Festlegung (Soll)

1. **Inhaber:in** trägt die Verantwortung für die Familien-Instanz: Zugangsnummer, ggf. mehrere Familien-Tenants bei dir als Lizenznehmer – aber **pro Familie** eine klare **Number + QR-Logik** (siehe Meine Familie → Zugang & Name).
2. **Bearbeiter:in** und **Leser:in** sind **familienintern** zu definieren: *Wer darf strukturell eingreifen, wer nur Ergänzendes, wer nur schauen?* Das ist eine **soziale und organisatorische** Entscheidung der Familie; die App spiegelt sie als Rollen wider (`src/types/k2FamilieRollen.ts`).
3. **Plattform (kgm)** verwaltet **keine** Stammbaum-internen Rollen einzelner Familien (Datensouveränität, Trennung) – siehe `docs/K2-FAMILIE-DATENSCHUTZ-SICHERHEIT.md`, `docs/K2-FAMILIE-DATENSOUVERAENITAET.md`.

---

## 3. Ist-Stand Technik (kurz, ehrlich)

- **Einladungs-QR (`?t=tenantId&z=…`):** Auf einem **neuen Gerät** muss die Tenant-ID **automatisch zur Familienliste** hinzugefügt und aktiv geschaltet werden (`ensureTenantInListAndSelect` in `FamilieTenantContext`). Sonst bleibt nur `default` in `localStorage` → **falsche („neutrale“) Familie**, obwohl der Link stimmt.
- **Capabilities** sind zentral beschrieben: `getFamilieRollenCapabilities` in `src/types/k2FamilieRollen.ts`; Nutzung z. B. über `FamilieRolleProvider` / `useFamilieRolle`.
- Die **Rolle „Sitzung“** in der Oberfläche dient dem **Arbeits- und Testmodell** am Gerät; **Zielbild** ist: Rolle **gebunden an eine echte Identität** (Einladung, später z. B. Supabase) – Roadmap `docs/K2-FAMILIE-SUPABASE-EINBAU.md`.
- **Zusätzlich** (später/rechtlich tief): Wer im Stammbaum **welchen Zweig** bearbeiten darf, ist ein eigenes Thema – `docs/K2-FAMILIE-RECHTE-ZWEIGE.md` (Zweige/Verwalter).

---

## 4. Nächste Schritte (ohne Scope zu vermischen)

| Priorität | Schritt |
|-----------|---------|
| **Doku / Nutzerklärheit** | Im Benutzerhandbuch klar schreiben: *Zugangsnummer = Familie finden; Rechte = Rolle, familienintern von der Inhaber:in gedacht.* |
| **Produkt** | Einladungs-Flow: **Einladung annehmen → Rolle zuweisen** (nur Inhaber), sobald Identität technisch möglich ist. |
| **Architektur** | Rollen nicht nur „Dropdown Sitzung“, sondern persistiert **pro Person/Konto** pro `tenantId`, konsistent mit Datentrennung `k2-familie-*`. |

---

## 5. Querverweise (eine Spur konsultieren)

| Thema | Datei / Ort |
|-------|-------------|
| Rollen-Typen & Capabilities | `src/types/k2FamilieRollen.ts` |
| Zugangsnummer im Datenmodell | `mitgliedsNummerAdmin` in `K2FamilieEinstellungen` (`src/types/k2Familie.ts`) |
| Zweige / Verwalter (Feinrechte Baum) | `docs/K2-FAMILIE-RECHTE-ZWEIGE.md` |
| Sync / später Server | `docs/K2-FAMILIE-SUPABASE-EINBAU.md` |
| Offene Ideen Sammelstelle | `docs/K2-FAMILIE-IDEEN-OFFEN.md` |

---

**Kurz merken:** **Zugang** = welche Familie. **Rollen** = was darf man dort – **von der Familie bzw. Inhaber:in definiert**, nicht durch die Nummer allein.
