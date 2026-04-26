# K2 Familie – Einladungs-URLs (eine Quelle)

**Zweck:** Persönliche QR-Codes und Links (`?t=` `&z=` `&m=`) sollen **immer** denselben Aufbau haben wie die Verarbeitung beim Öffnen der App.

## Quelle im Code

| Was | Datei |
|-----|--------|
| URLs bauen (Druck, QR, Kurzlink) | **`src/utils/familieEinladungsUrls.ts`** |
| URL lesen, Mandant wechseln, zur Person navigieren | **`src/components/FamilieEinladungQuerySync.tsx`** |
| Pending, wenn Scan nicht sofort klappt | **`src/utils/familieEinladungPending.ts`** |
| Nachbearbeitung auf „Meine Familie“ | **`src/pages/K2FamilieHomePage.tsx`** (Effect `getFamilieEinladungPending`) |

## Parameter (Kurz)

- **`t`** – Mandanten-ID (in URLs **kleingeschrieben**).
- **`z`** – Familien-Zugangsnummer (KF-…).
- **`m`** – persönlicher Mitgliedscode; technisch wie überall: **`trimMitgliedsNummerEingabe`**.
- **`fn`** – optional Anzeigename, wenn Gäste noch keinen lokalen Speicher haben. Gilt für **Familien-** und **persönliche** Einladungslinks (`buildFamilieEinladungsUrlKurz` bzw. `buildPersoenlicheEinladungsUrlKurz` mit optionalem fünftem Parameter).

## Tests

- **`src/tests/familieEinladungsUrls.test.ts`** – Normalisierung, `v=` für QR.
- **`src/tests/familieEinladungPending.test.ts`** – Session-Pending.

## Regel für Änderungen

Vor neuen Features, die Einladungslinks betreffen: **Regel** `.cursor/rules/k2-familie-mitglieder-einladung-qr-eine-quelle.mdc` lesen.
