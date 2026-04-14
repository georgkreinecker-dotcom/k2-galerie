# K2 Familie – Übersichtlichkeit nach Rolle

**Stand:** 14.04.26 · **Zweck:** Kurz prüfen, was **Leser:in**, **Bearbeiter:in** und **Inhaber:in** in der Oberfläche sehen (ohne jeden Unterdialog). Effektive Rechte können durch **Identität** (`getFamilieEffectiveCapabilities`: kein „Du“, oder Code auf Karte ohne bestätigte Sitzung) weiter eingeschränkt werden – dann gelten die Hinweise wie bei Leser:in.

---

## Kurzmatrix

| Bereich | Leser:in | Bearbeiter:in | Inhaber:in |
|--------|----------|-----------------|------------|
| **Kompakt-Nav auf „Meine Familie“** | Meine Familie, Handbuch, Präsentationsmappe *(kein Link Sicherung ohne Export-Recht)* | + Sicherung | + Sicherung |
| **Toolbar „Neue Familie“** | — | — | ja |
| **Einstellungen: Rolle wählen** | ja | ja | ja |
| **Einstellungen: Zugang & Name** | ja (kurzer Text) | ja | ja |
| **Einstellungen: Mitglieder & Codes** | — | — | ja |
| **Einstellungen: Stammbaum-Ansicht** | Hinweiszeile (nur Inhaber ändert) | Hinweiszeile | Karte + Link |
| **Einstellungen: Sicherung** | Hinweis (kein Export) | Karte | Karte |
| **Einstellungen: Lizenz** | ein Zeile + Link | Karte | Karte |
| **Startseite „Meine Familie“** | minimal (siehe `K2FamilieHomePage`) | mittel | voll + Ampel |

---

## Navigation (volle Leiste, nicht Start)

Unverändert für alle: Meine Familie, Stammbaum, Events & Kalender, Geschichte, Gedenkort, Einstellungen. **Sicherung** ist nur in der **kompakten** Leiste auf der Startseite „Meine Familie“ – und dort nur bei `canExportSicherung`.

---

## Quellen im Code

- Rollen-Labels / Einzeiler: `src/types/k2FamilieRollen.ts`
- Effektive Rechte: `src/utils/familieIdentitaet.ts` + `FamilieRolleContext`
- Start: `src/pages/K2FamilieHomePage.tsx`
- Einstellungen: `src/pages/K2FamilieEinstellungenPage.tsx`
- Layout / Nav: `src/components/K2FamilieLayout.tsx`

Bei UI-Änderungen: diese Tabelle mit anpassen.

**Gespeicherte Rolle:** `k2-familie-rolle-local-<tenantId>` (und Session-Spiegel). **Ohne Eintrag:** Default ist **Inhaber:in** (Erst-Einrichtung); wer nur lesen oder mitarbeiten soll, stellt in **Einstellungen → Rolle** explizit Leser/Bearbeiter ein.
