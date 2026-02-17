# Licence-Struktur – Konditionen & Vergabe

**Stand:** Februar 2026

## 1. Zweck

- **Konditionen festlegen:** Welche Licence-Stufen gibt es, was ist enthalten, welche Preise und Laufzeiten.
- **Licences vergeben:** Eine Seite/Bereich, auf der Licences an Künstler:innen oder Partner vergeben werden (manuell oder nach Abschluss).
- **Verknüpfung mit Empfehlungs-Programm:** Bei Vergabe oder Verlängerung kann eine Empfehler-ID erfasst werden → Grundlage für die automatisierte Abrechnungsstruktur (Vergütung an Empfehler:in).

---

## 2. Licence-Stufen (Konditionen)

Die Stufen sind an die Zielgruppe **Künstler:innen** angepasst. **Ausführliches Lizenzmodell:** `docs/LIZENZMODELL-BASIC-PRO-ENTERPRISE.md` (Limits, Feature-Matrix, Basic/Pro/Enterprise im Detail).

| Stufe        | Zielgruppe        | Inhalt (Kurz)                    | Preis (Beispiel) |
|-------------|-------------------|-----------------------------------|------------------|
| **Basic**   | Einstieg          | Bis 30 Werke, 1 Galerie, Events, Kasse, Etiketten, Standard-URL | 49 €/Monat |
| **Pro**     | Aktive Künstler:innen | Unbegrenzte Werke, Custom Domain, volles Marketing | 99 €/Monat |
| **Enterprise** | Galerien / Mehrbedarf | Alles aus Pro, White-Label, API, Dedicated Support | nach Vereinbarung |

- **Preismodelle:** SaaS (monatlich), jährliches Abo – in der Licence-Verwaltung wählbar.
- **Eigener QR-Code:** Pro vergebene Licence erhält der Licence-Inhaber eine eigene öffentliche URL und einen QR-Code (siehe Produkt-Vision).

---

## 3. Wo Licences vergeben werden

- **Ein Ort (mök2):** Licences leben nur in mök2: **Plattform-Start → mök2** (oder **Licences**) → `/projects/k2-galerie/licences` mit mök2-Leiste. `/platform/licences` leitet dorthin um – keine doppelte Route.
- **Inhalt:** Übersicht der **Licence-Konditionen** (Stufen, Preise, Features), Bereich **„Licence vergeben“** (Name, E-Mail, Licence-Typ, optional **Empfehler-ID**), Liste vergebener Licences (lokal bis Backend-Anbindung).
- Bei Eingabe einer gültigen Empfehler-ID: Zuordnung für das Empfehlungs-Programm; die spätere Abrechnung übernimmt die Vergütung (siehe Abrechnungsstruktur).

Bis ein Backend (z. B. Supabase, Stripe, eigener Shop) existiert: Vergabe kann manuell erfasst und in einer Liste/DB gespeichert werden; Abrechnung und Zahlungsfluss werden daran angebunden.

---

## 4. Verknüpfung mit Empfehlungs-Programm

- Beim **Licence-Abschluss** oder bei **Licence-Vergabe** wird optional die **Empfehler-ID** des/der Werbenden erfasst.
- Diese Zuordnung („Licence-Inhaber B wurde von Empfehler A geworben“) ist die Grundlage für:
  - **Vergütung:** 50 % der Licence-Gebühr an A (siehe Vermarktungskonzept).
  - **Automatisierte Abrechnung:** Siehe `docs/ABRECHNUNGSSTRUKTUR-EMPFEHLUNGSPROGRAMM.md`.

---

## 5. Nächste Schritte (technisch)

- Licence-Konditionen in Config oder Admin zentral pflegen (bereits angelegt: LicenseManager mit Basic/Pro/Enterprise).
- Seite „Licences“ mit Vergebefunktion und optional Empfehler-ID-Eingabe.
- Abrechnungsstruktur für Empfehlungs-Programm (multilevel-fähig) anlegen und mit Licences verknüpfen.

---

*Ergänzt: Produkt-Vision, Vermarktungskonzept Empfehlungs-Programm, Abrechnungsstruktur.*
