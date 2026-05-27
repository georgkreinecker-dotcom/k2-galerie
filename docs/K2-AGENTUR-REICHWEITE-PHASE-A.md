# K2 Agentur – Reichweite Phase A (Steuerzentrale)

## Für Georg

**Mächtigstes Start-Instrument:** **P1 Galerie · Google Ads (Suche)** – wer aktiv sucht, ist am nächsten an einer Lizenz.

**In der App:** K2 Agentur → blauer Kasten **„Steuerzentrale · Phase A“**.

| Was K2 macht (automatisch) | Was du in Google Ads machst (Reichweite) |
|---------------------------|------------------------------------------|
| Landings + Lizenzen (7 Tage) zählen | Tagesbudget setzen |
| Ampel + Empfehlung (Pause / Prüfen / Weiter) | Keywords / Zielgruppe |
| Kosten-Feld (7 Tage) – du trägst Summe ein | Status **Aktiv** oder **Pausiert** |

**Schwelle:** ≥ 25 € in 7 Tagen **ohne** Lizenz → Ampel rot, Pause empfohlen.

## Reihenfolge Pilot

1. Checkliste: Google-Konto, Kampagne `p1-google-2026q2`, Budget, Keywords.
2. **Fertige Anzeige kopieren** → in Google Ads einfügen.
3. Status **Live** in K2 Agentur (Kanäle-Tab oder Ampel aus Checkliste).
4. Nach ein paar Tagen: Kosten aus Google Ads in **Steuerzentrale** eintragen → Ampel lesen → ggf. in Ads pausieren oder Budget anpassen.

## Phase B / C (später)

- **B:** Google Ads API – Kosten/Klicks automatisch lesen.
- **C:** Budget + Pause per Klick aus K2 (mit Obergrenzen).

## Technik

- Regeln: `src/config/k2AgenturSteuerRegeln.ts`
- Attribution: `GET /api/marketing-attribution?mode=summary&days=7`
- UI: `src/components/k2Agentur/K2AgenturSteuerzentralePanel.tsx`

Verknüpfung: `docs/MARKETING-KANAL-P1-P2-P3-EINRICHTUNG.md`
