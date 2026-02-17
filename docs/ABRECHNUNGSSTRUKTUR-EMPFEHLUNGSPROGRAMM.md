# Automatisierte Abrechnungsstruktur – Empfehlungs-Programm (Multi-Level)

**Stand:** Februar 2026

## 1. Ziel

- **Multilevel-Vergütung bei Weiterempfehlung** abbilden: Wer jemanden wirbt, erhält einen Anteil der Licence-Gebühr (z. B. 50 %); bei mehrstufiger Ausgestaltung können weitere Ebenen (z. B. „Empfehler von Empfehler“) mit definierten Anteilen berücksichtigt werden.
- **Automatisierte Abrechnung:** Keine manuelle Nachverfolgung; jede Licence-Zahlung löst die Berechnung der Vergütungen aus, Abrechnungsläufe (z. B. monatlich) erzeugen Gutschriften oder Auszahlungslisten.

---

## 2. Datenbasis

- **Licence-Inhaber:innen** mit Licence-Typ, Laufzeit, Zahlungsrhythmus und Zahlungshistorie.
- **Zuordnung Empfehler → Geworbene:** Pro Licence-Inhaber:in optional eine **Empfehler-ID** (wer hat geworben). Bei Multi-Level: Kette (A wirbt B, B wirbt C → A und B können an C verdienen, je nach Regel).
- **Sätze:** z. B. 50 % der Licence-Gebühr an direkte:n Empfehler:in; optional weitere Prozente an Stufe 2 („Über-Empfehler:in“).

---

## 3. Ablauf (automatisiert)

1. **Ereignis:** Licence-Gebühr wird fällig / gezahlt (z. B. monatlich oder jährlich).
2. **Auslesen:** Welche Licence-Inhaber:innen haben in dieser Periode gezahlt? Für jede Zahlung: zugeordnete Empfehler-ID(s).
3. **Berechnung:** Pro Zahlung: Anteil (z. B. 50 %) an Empfehler:in A. Bei Multi-Level: weiterer Anteil an A’s Empfehler:in (falls vorhanden), nach definierter Regel.
4. **Gutschrift/Auszahlung:** Berechnete Beträge pro Empfehler:in sammeln (z. B. pro Monat), dann:
   - als **Gutschrift** auf nächste Rechnung des/der Empfehler:in, oder
   - als **Auszahlungsliste** (z. B. Export für Buchhaltung/Bank), oder
   - als **Gutschein** für Verlängerung.

---

## 4. Technische Anforderungen

- **Speicher:** Pro Licence „Empfehler-ID“ (und bei Multi-Level ggf. „Kette“ oder Stufe). Pro Zahlung/Vorgang: Betrag, Datum, zugeordnete Licence, berechnete Vergütungen (Empfehler:in, Betrag).
- **Abrechnungslauf:** Zeitgesteuert (z. B. monatlich) oder bei jeder Zahlung:
  - neue Zahlungen erfassen,
  - Vergütungen berechnen,
  - Gutschriften/Auszahlungsdaten aktualisieren,
  - Report/Export (z. B. CSV, PDF) für Transparenz und Buchhaltung.
- **Regeln konfigurierbar:** Prozentsatz Stufe 1 (z. B. 50 %), optional Stufe 2 (z. B. 10 %), Mindestbeträge, Auszahlungsgrenzen – in Licence-/Abrechnungskonfiguration pflegbar.

---

## 5. Einbindung in die App

- **Licences vergeben:** Beim Anlegen/Vergeben einer Licence optional **Empfehler-ID** erfassen → speichern.
- **Licence-Zahlungen:** Wenn Zahlungen (z. B. über Stripe, manuell oder Abo-System) erfasst werden, pro Zahlung die Zuordnung „Licence X → Empfehler Y“ nutzen und Vergütung berechnen.
- **Bereich Licences/Abrechnung:** Übersicht „Offene Vergütungen“, „Abrechnungslauf ausführen“, „Export letzter Lauf“ – für Betreiber:innen.

---

## 6. Multi-Level (Mehrebenen)

- **Stufe 1:** Direkte:r Empfehler:in erhält z. B. 50 % der Licence-Gebühr des/der Geworbenen.
- **Stufe 2 (optional):** Der/die Empfehler:in von A (also wer A geworben hat) erhält z. B. 10 % der Licence-Gebühr von B – nur definieren, wenn gewünscht; dann in der Abrechnungslogik „Kette“ (B → A → A’s Empfehler:in) berücksichtigen.
- **Daten:** Pro Nutzer:in nicht nur „meine Empfehler-ID“, sondern optional „geworben von (Empfehler-ID)“ speichern, damit die Kette für Stufe 2 bekannt ist.

---

*Verknüpfung: docs/LICENCE-STRUKTUR.md, docs/VERMARKTUNGSKONZEPT-EMPFEHLUNGSPROGRAMM.md.*
