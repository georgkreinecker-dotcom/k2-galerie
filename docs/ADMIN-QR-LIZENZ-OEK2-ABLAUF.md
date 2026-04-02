# Admin-QR (Lizenznehmer & ök2) – Ablauf und Prüfliste

Kurzreferenz, damit QR/Link **nicht** mit Galerie-Besucher-QR verwechselt werden und der **Server-Stand** beim Scannen greift.

---

## Drei sichtbare Stellen

| Kontext | Wo | Admin-URL (kanonisch) | QR sichtbar wenn |
|--------|-----|------------------------|------------------|
| **ök2-Demo** (nur Plattform) | Admin → Einstellungen → Stammdaten, unter Vita | `{origin}/admin?context=oeffentlich` | immer (Demo) |
| **Lizenznehmer** (eigene Instanz) | Admin → Einstellungen → Stammdaten (oben) | `{origin}/admin` (+ ggf. Query aus API) | nach **Lizenznummer** unter Registrierung |
| **Nach Lizenzkauf** | `/lizenz-erfolg?session_id=…` | `admin_url` aus API | wenn URL `/admin` enthält |

---

## Technik (eine Quelle)

- **Komponente:** `src/components/LicenseeAdminQrPanel.tsx`
- **Kanonische URL + QR mit Cache-Bust:** `normalizeLicenseeAdminUrl`, `getLicenseeAdminQrTargetUrl` in `src/utils/publicLinks.ts` → `buildQrUrlWithBust` + **Server-Stand** (`useQrVersionTimestamp` aus `useServerBuildTimestamp.ts`).
- **Regel:** QR enthält `v=<Server-Timestamp>&_=<Date.now()>` – entspricht der Projektregel „Stand & QR“ (nicht nur lokaler Build).

---

## Datentrennung

- **ök2:** nur `?context=oeffentlich` für den Demo-Admin-QR; keine K2-Stammdaten.
- **Lizenznehmer:** keine ök2/VK2-Routen auf Nicht-Plattform (bestehende Tenant-Regeln).

---

## Checkliste vor Commit (wenn sich etwas am QR ändert)

1. `LicenseeAdminQrPanel.tsx` ist mit **allen** Aufrufern committed (Props wie `adminIntro` nicht nur lokal).
2. `npm run test` → u. a. `publicLinks.test.ts` grün.
3. `npm run build` grün.
4. ök2: Stammdaten-Panel nutzt **`/admin?context=oeffentlich`**.
5. Handbuch: `public/benutzer-handbuch/06-OEK2-DEMO-LIZENZ.md` (Abschnitt wichtige Daten) bei inhaltlichen Änderungen mitdenken.

---

## Bekanntes Risiko (vermieden)

Ein Commit, der `adminIntro` in **Aufrufern** nutzt, aber **`LicenseeAdminQrPanel.tsx` nicht** mitliefert → **TypeScript-Build bricht** auf Vercel ab. Immer `git status` prüfen: `src/components/LicenseeAdminQrPanel.tsx` gehört zu jedem Release mit neuen Panel-Props dazu.
