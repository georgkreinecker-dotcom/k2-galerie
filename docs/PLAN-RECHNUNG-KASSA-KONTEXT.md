# Plan: Rechnungsfunktion im Kassa-Kontext

**Stand:** 14.03.26 – Nur Plan, noch kein Code. Rechnung auf Basis der bestehenden Stammdaten und des Kassabons.

---

## 1. Ausgangslage

| Vorhanden | Wo / was |
|-----------|----------|
| **Kassabon** | ShopPage: Nach Verkauf „Kassenbon drucken?“ → Etikett (80mm) oder A4. A4-Bon: Galerie-Name, Datum, Bon-Nr., Positionen, Summen, Zahlungsart, ggf. Bankverbindung. |
| **Stammdaten Galerie (Rechnung)** | Admin → Stammdaten → Galerie, Bereich „Geschäftskunden (optional)“: **Firmenname**, **USt-IdNr.**, **Rechnungsadresse** (Straße, Ort/PLZ, Land). Dazu: gewerbebezeichnung, name, address, city, country, phone, email, bankverbindung. Alles in `stammdatenStorage` (gallery), Keys `k2-stammdaten-galerie`. |
| **Kassa-Kontext** | ShopPage mit `?openAsKasse=1`; Verkauf → Order (orderNumber, date, items, total, paymentMethod, customerId) → k2-orders, k2-sold-artworks. |
| **Kunde pro Verkauf** | Optional: `customerId` an Order; Kundenstamm in KundenPage / customers – Name, Adresse etc. für Rechnungsempfänger nutzbar. |

**Unterschied Bon vs. Rechnung:**  
- **Bon** = kurzer Beleg (Bon-Nr., Positionen, Summe, Zahlungsart); bereits umgesetzt.  
- **Rechnung** = Dokument für Kunde/Steuer: Aussteller (Firma, USt-IdNr., Rechnungsadresse), Empfänger (Kunde), Rechnungsnummer, Positionen, Beträge, USt-Aufschlüsselung, Zahlungsziel, Bankverbindung – **gesetzeskonform** (§ 11 UStG).

---

## 2. Gesetzeskonformität und Nummerierung (verbindlich)

Rechnungen müssen **§ 11 UStG** entsprechen. Sonst verliert der Empfänger den Vorsteuerabzug; das Finanzamt kann Beanstandungen aussprechen.

### 2.1 Pflichtangaben auf der Rechnung (§ 11 UStG)

| Pflichtangabe | Umsetzung im Plan |
|---------------|-------------------|
| Name und vollständige Anschrift **Aussteller** | Stammdaten Galerie: firmenname (oder name), rechnungAddress, rechnungCity, rechnungCountry; sonst Fallback address/city/country. |
| Name und vollständige Anschrift **Empfänger** | Bei customerId: aus Kundenstamm. Ohne Kunde: „Rechnungsempfänger“ mit Platzhalter oder „Endverbraucher / Kunde vor Ort“ + Hinweis – für Vollrechnung idealerweise immer Empfänger erfassen. |
| **Steuernummer oder UID** des Ausstellers | Stammdaten: ustIdNr (optional anzeigen wenn gepflegt). |
| **Fortlaufende Rechnungsnummer** (eindeutig, nur einmal) | Siehe 2.2 – zentral vergeben und speichern. |
| **Ausstellungsdatum** | order.date (Verkaufsdatum). |
| Lieferdatum / Leistungszeitraum | Ausstellungsdatum reicht bei Verkauf vor Ort; optional „Leistungsdatum: [Datum]“. |
| Menge und **Bezeichnung** der Lieferung/Leistung | order.items: Werk-Nr., Titel, Kategorie, ggf. Maße; Menge 1 pro Zeile (oder Stückzahl wenn vorhanden). |
| **Netto-**, **Brutto-**Betrag, **Steuersatz**, **Steuerbetrag** | USt-Aufschlüsselung zwingend: Netto, angewandter Satz (z. B. 20 %), USt-Betrag, Brutto (Endbetrag). Bei 0 % USt (z. B. Kunst) entsprechend kennzeichnen. |
| Rechnung über 10.000 € brutto | UID des **Empfängers** angeben (aus Kundenstamm falls erfasst). |

**Vereinfachte Rechnung (Kleinbetrag):** Bis 400 € brutto genügen u. a. Ausstellungsdatum, Leistungsbeschreibung, Gesamtbetrag inkl. Steuer – kann für kleine Beträge genutzt werden; für volle Rechtssicherheit und Vorsteuerabzug des Kunden **Vollrechnung mit allen Pflichtangaben** anstreben.

### 2.2 Fortlaufende Rechnungsnummer (verbindlich)

- **Anforderung (§ 11 Abs. 1 Z 5 UStG):** Eindeutig, **nur einmal** vergeben, **nachvollziehbare Abfolge**, **keine Lücken** (vom Finanzamt prüfbar).
- **Umsetzung:**
  - **Ein zentraler Nummernkreis** nur für Rechnungen (nicht Bon-Nr. wiederverwenden): z. B. Präfix `RE-` + Jahr + laufende Nummer: `RE-2026-0001`, `RE-2026-0002`, …
  - **Beim ersten Erzeugen einer Rechnung** zu einem Verkauf: nächste freie Nummer aus **persistentem Speicher** holen (z. B. Key `k2-invoice-last-number` oder pro Jahr `k2-invoice-sequence-2026`), vergeben, sofort **hochzählen und speichern**. Keine Nummer zweimal vergeben; keine Lücken (jeder Verkauf, für den „Rechnung“ gewählt wird, bekommt die nächste Nummer).
  - **Rechnungsnummer in der Order speichern** (z. B. `order.invoiceNumber`), so dass „Rechnung drucken“ und „Rechnung erneut drucken“ immer dieselbe Nummer anzeigen. Wird bei einem Verkauf **keine** Rechnung erstellt, wird **keine** Rechnungsnummer verbraucht (nur bei tatsächlicher Rechnungsausstellung).
- **Bon-Nr. (orderNumber)** bleibt unverändert (O-Datum-xxxx) für den Kassenbon; **Rechnungsnummer** ist ein eigenes, fortlaufendes Feld.

### 2.3 Aufbewahrung

Rechnungen sind **7 Jahre** aufzubewahren (§ 132 BAO). Technisch: PDF exportieren bzw. Druck; Aufbewahrung obliegt der Galerie (Ordner, Backup). Die App liefert nur die druckbare/exportierbare Rechnung; keine automatische Archiv-Pflicht in der App im ersten Schritt.

---

## 3. Ziele der Rechnungsfunktion

- Im **gleichen Kontext wie der Kassabon** (Kasse/Shop nach Verkauf) nutzbar.
- **Stammdaten als einzige Quelle** für Aussteller: Firmenname, USt-IdNr., Rechnungsadresse (und ggf. gewerbebezeichnung, Telefon, E-Mail, Bankverbindung) aus `loadStammdaten('k2','gallery')` – keine doppelte Pflege.
- **Eine Rechnung pro Verkauf:** Dieselbe Order wie beim Bon; **eigene Rechnungsnummer** (fortlaufend, § 11 UStG), in Order speichern; gleiche Positionen und Beträge.
- **Druck/PDF:** Rechnung druckbar wie der A4-Bon (neues Fenster mit Rechnungs-Layout, „Als PDF speichern“).
- **Rechnungsempfänger:** Bei customerId Name/Adresse aus Kundenstamm; sonst Platzhalter oder „Endverbraucher“ – für Vollrechnung idealerweise immer Empfänger erfassen (Kunde zuordnen oder Adresse eingeben).

---

## 4. Wo es hingehört (Ort im Ablauf)

- **Nach Verkauf (Kasse):** Neben „Kassenbon drucken?“ eine Option **„Rechnung drucken“** (oder nach Bon-Dialog: „Rechnung zu diesem Verkauf drucken?“). Ein Klick → Rechnungs-PDF/Druck mit Stammdaten + Order.
- **Bestehende Verkäufe:** In der Liste „Letzte Verkäufe“ pro Eintrag Button **„Rechnung drucken“** – zeigt die **bereits vergebene** Rechnungsnummer (order.invoiceNumber), falls für diesen Verkauf schon eine Rechnung erstellt wurde; sonst beim ersten Klick „Rechnung drucken“ Nummer vergeben, in Order speichern, dann drucken.
- Kein eigener „Rechnung“-Tab nötig; alles im Kassa-/Shop-Kontext (ShopPage, Kasse-Modus).

---

## 5. Inhalt der Rechnung (aus Stammdaten + Order, § 11 UStG)

**Aus Stammdaten (Galerie):**  
- Aussteller: firmenname (oder name), rechnungAddress, rechnungCity, rechnungCountry; **ustIdNr** (Steuernummer oder UID); phone, email, gewerbebezeichnung.  
- Falls rechnungAddress leer: Fallback address, city, country (Ausstellungs-Galerie).  
- Bankverbindung für Zahlungsziel/Überweisung.

**Rechnungsnummer:**  
- **Fortlaufend**, aus persistentem Nummernkreis (z. B. `k2-invoice-sequence-YYYY`): z. B. RE-2026-0001, RE-2026-0002.  
- Beim **ersten** Erzeugen einer Rechnung zu dieser Order: nächste Nummer holen, Order um `invoiceNumber` ergänzen, in k2-orders zurückschreiben, Zähler erhöhen und speichern.  
- „Rechnung erneut drucken“: dieselbe gespeicherte `order.invoiceNumber` verwenden.

**Aus Order:**  
- Datum: order.date (Ausstellungsdatum).  
- Positionen: order.items (Menge, Bezeichnung = Nr., Titel, Kategorie, ggf. Maße; **Netto**, **Steuersatz**, **USt-Betrag**, **Brutto** pro Zeile oder gesamt).  
- **Summen:** Netto gesamt, USt gesamt, Brutto (total); ggf. Rabatt (discount) vor USt abziehen und korrekt ausweisen.  
- Zahlungsart: order.paymentMethod (Bar/Karte/Überweisung).  
- Bei Rechnung > 10.000 € brutto: UID des Empfängers (aus Kundenstamm).

**Rechnungsempfänger:**  
- Bei order.customerId: Name, vollständige Anschrift (und ggf. UID) aus Kundenstamm.  
- Ohne Kunde: „Endverbraucher“ bzw. Platzhalter – für Vollrechnung empfohlen, Kunde zuordnen oder Adresse erfassen.

**USt-Aufschlüsselung (Pflicht):**  
- Netto-Betrag(e), angewandter Steuersatz (z. B. 20 %, 10 %, 0 %), Steuerbetrag, Brutto-Endbetrag.  
- Kunst/Verkauf kann 0 % oder ermäßigt sein – je nach Besteuerung der Galerie korrekt ausweisen.

---

## 6. Technik (ohne Code – nur Vorgaben)

- **Eine Funktion/Layout** für „Rechnung drucken“ (analog `printReceiptA4`): neues Fenster mit Rechnungs-HTML, A4, alle Pflichtangaben inkl. USt; Fenster.print() / „Als PDF speichern“.  
- **Daten:** loadStammdaten('k2','gallery'); order (State / k2-orders); bei customerId Kundenstamm für Empfänger; **persistenter Rechnungsnummern-Zähler** (z. B. localStorage `k2-invoice-sequence-YYYY`), bei Vergabe Order um invoiceNumber ergänzen und k2-orders aktualisieren.  
- **Nummerierung:** Nur bei tatsächlicher Ausstellung einer Rechnung nächste Nummer vergeben und speichern; keine Lücken, keine Doppelvergabe.

---

## 7. Abgrenzung

- **Kassabon bleibt unverändert** (Etikett / A4 wie bisher; Bon-Nr. orderNumber).  
- **Rechnung ergänzt** den Kassa-Kontext: gleiche Stammdaten, gleiche Order; **eigene fortlaufende Rechnungsnummer**, Layout mit allen §-11-UStG-Pflichtangaben inkl. USt-Aufschlüsselung.  
- **Geltungsbereich:** K2 (echte Galerie); ök2-Kasse optional später, gleiche Logik mit ök2-Stammdaten und eigenem Nummernkreis.

---

## 8. Nächster Schritt (wenn umgesetzt werden soll)

1. **Rechnungsnummern-Kreis:** Persistenter Zähler (z. B. `k2-invoice-sequence-YYYY`) pro Jahr; Funktion „nächste Rechnungsnummer“ (lesen, erhöhen, speichern); bei Vergabe Order um `invoiceNumber` ergänzen und in k2-orders schreiben.  
2. **Stammdaten:** loadStammdaten('k2','gallery') für Aussteller (firmenname, ustIdNr, rechnungAddress/City/Country) – bereits vorhanden.  
3. **USt-Logik:** Konfiguration Steuersatz (z. B. 20 % oder 0 % für Kunst) aus Stammdaten oder Konstante; aus Brutto Netto/USt berechnen oder aus Netto Brutto – einheitlich im Rechnungslayout ausweisen.  
4. **Funktion** `printInvoiceA4(order)` mit Layout: alle Pflichtangaben (§ 11 UStG), Rechnungsnummer aus order.invoiceNumber (oder vorher vergeben und speichern), Empfänger aus Kunde, USt-Aufschlüsselung, Bankverbindung.  
5. **UI:** Nach Verkauf Option „Rechnung drucken?“; in „Letzte Verkäufe“ Button „Rechnung drucken“ pro Order (beim ersten Mal Nummer vergeben + speichern, dann drucken).

---

**Quellen:**  
- Kassabon: `src/pages/ShopPage.tsx` (printReceiptA4, order, loadStammdaten).  
- Stammdaten Galerie: `src/utils/stammdatenStorage.ts`, Admin „Geschäftskunden“ in `components/ScreenshotExportAdmin.tsx`.  
- Controlliste Kassa: `docs/KASSA-ETIKETTEN-CONTROLLISTE.md`.  
- Recht: **§ 11 UStG** (Pflichtangaben, fortlaufende Rechnungsnummer); Aufbewahrung § 132 BAO.
