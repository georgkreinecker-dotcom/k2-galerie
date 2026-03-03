# K2 / ök2 – Agenda: Kassabuch (steuerberatergeeignet)

**Stand:** 02.03.26  
**Zweck:** Anforderung festhalten – Kassabuch für Steuerberater, inkl. Kassausgänge, Bar privat, Beleg (QR/Foto), Kassa an Bank, optional Kassabuch Ja/Nein.

**Geltung:** K2 (echte Galerie) und ök2 (Demo) – Kassa gibt es nur für K2/ök2, nicht für VK2.

**Lizenzstufen (03.03.26):** Vollständiges Kassabuch erst ab **Pro+**. **Pro** = Kassa (Verkauf erfassen) ja, Kassabuch nur Verkäufe (Eingänge), keine Ausgänge. **Basic** = keine Kassa. Speicher: `k2-lizenz-stufe` / `k2-oeffentlich-lizenz-stufe` (`basic` | `pro` | `proplus`). Default K2 = proplus, **ök2 = proplus** (voller Betriebsumfang in der Demo).

---

## 1. Ziel

- **Kassabuch**, das für den **Steuerberater** geeignet ist (nachvollziehbar, belegbar, exportierbar).
- **Kassaeingänge** (bereits heute: Verkäufe aus der Kasse).
- **Kassausgänge** erfassen.
- **Bar privat** (Entnahme für private Zwecke).
- **Bar mit Beleg:** Beleg erfassen per **QR-Code einscannen** oder **Foto**.
- **Kassa an Bank** (Ein-/Auszahlung Kassa ↔ Bank).
- **Optional:** Einstellung **„Kassabuch führen: Ja / Nein“** – wer nur Verkäufe braucht, schaltet das Kassabuch optional ab.

---

## 2. Anforderungen (kurz)

| Punkt | Beschreibung |
|-------|--------------|
| **Kassabuch steuerberatergeeignet** | Chronologische Buchung, Betrag, Datum, Art (Eingang/Ausgang), Beleg wenn vorhanden; Export (z. B. CSV/PDF) für Steuerberater. |
| **Kassaeingänge** | Bereits umgesetzt: Verkäufe aus Shop/Kasse → `k2-sold-artworks`. Im Kassabuch als Eingänge sichtbar. |
| **Kassausgänge** | Neue Buchungsart: Ausgang (Bar-Ausgabe) mit Betrag, Datum, optional Verwendungszweck, optional Beleg. |
| **Bar privat** | Sonderfall Ausgang: „Bar privat“ (Entnahme für private Zwecke) – klar gekennzeichnet für Steuerberater. |
| **Bar mit Beleg** | Bei Ausgang (oder bei Eingang): Beleg erfassen. **QR-Code einscannen** (z. B. E-Rechnung) oder **Foto** (Quittung, Kassenzettel) – zuordnung zur Buchung, Speicherung/Anzeige für Steuerberater. |
| **Kassa an Bank** | Buchungsart: „Kassa → Bank“ (Einzahlung) oder „Bank → Kassa“ (Bar-Entnahme von der Bank). Kein Bankkonto-Verwaltung in der App – nur die Buchung, dass Geld die Kasse verlassen/betreten hat. |
| **Kassabuch führen Ja/Nein** | Einstellung (z. B. in Admin unter Kassa/Einstellungen): **Kassabuch aktiv** = alle Buchungen (Eingänge + Ausgänge, Bar privat, Kassa an Bank, Belege) führen. **Kassabuch aus** = nur Verkäufe wie bisher (keine Ausgänge, kein Bar privat, keine Kassa-an-Bank-Buchungen). |

---

## 3. Technik / Speicher (Hinweis für Umsetzung)

- **Kontext:** K2 = `k2-*` Keys; ök2 = `k2-oeffentlich-*` (z. B. `k2-oeffentlich-kassabuch` oder ein gemeinsamer Key für alle Kassabuch-Einträge pro Tenant).
- **Datenmodell:** Pro Buchung: id, datum, betrag, art (eingang|ausgang|bar_privat|kassa_an_bank|bank_an_kassa), verwendungszweck (optional), beleg (optional: Bild-URL/Base64 oder Referenz auf gespeichertes Bild), verkaufId (wenn Eingang = Verkauf).
- **Belege:** Foto/QR-Scan → Speicher (lokal + ggf. Upload wie bei Werken, damit steuerberatergeeignet und exportierbar).

---

## 4. Wo einordnen (Admin)

- **Kassa, Lager & Listen** (bisher: Verkaufsstatistik, PDF-Export, Speicherdaten) – dort **„Kassabuch“** als neuer Bereich/Tab oder Unterkarte:
  - Liste aller Buchungen (chronologisch), Filter nach Art/Zeitraum.
  - Buttons: **Neuer Kassausgang**, **Bar privat**, **Kassa an Bank**, **Beleg zu Buchung** (QR/Foto).
  - Einstellung **„Kassabuch führen: Ja / Nein“** (z. B. oben auf der Kassabuch-Seite oder in Einstellungen unter Kassa).

---

## 5. Export für Steuerberater

- **Export:** CSV und/oder PDF (Zeitraum wählbar), alle Buchungen inkl. Beleg-Verweis oder eingebettete Belege – so dass der Steuerberater eine geschlossene, belegbare Aufstellung erhält.

---

## 6. Abhängigkeiten / Reihenfolge (Vorschlag)

1. **Datenmodell + Speicher** (Kassabuch-Einträge, Keys K2/ök2 getrennt).
2. **Kassabuch führen Ja/Nein** (Einstellung, default: Ja).
3. **Kassaeingänge** aus bestehenden Verkäufen ins Kassabuch übernehmen (Anzeige/Import).
4. **Kassausgänge** (inkl. Bar privat, Kassa an Bank) – Eingabemaske, Speichern.
5. **Beleg:** Foto hochladen, optional QR scannen (E-Rechnung/Belegnummer) – Zuordnung zu Buchung.
6. **Export** CSV/PDF für Steuerberater.

---

**Quelle:** Georg – Agenda K2/ök2 Kassa: Kassabuch steuerberatergeeignet, Kassausgänge, Bar privat, Bar mit Beleg (QR/Foto), Kassa an Bank, optional Kassabuch Ja/Nein.
