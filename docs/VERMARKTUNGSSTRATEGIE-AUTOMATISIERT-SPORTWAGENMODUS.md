# Vermarktungsstrategie – automatisiert wie der Lebenszyklus (Sportwagenmodus)

**Stand:** 08.03.26  
**Zweck:** Die Vermarktung soll **genau so automatisiert** ablaufen wie der Lebenszyklus der App: **ein Ablauf pro Kanal**, **eine Quelle** (Werbelinie, USPs), **kein manueller Flickenteppich**. Kanäle der Kommunikation, die wir **automatisiert** und **im Sportwagenmodus** für uns arbeiten lassen – **ohne große Kosten**.

**Referenzen:** docs/LEBENSZYKLUS-QUALITAETSCHECK.md (wie der App-Lebenszyklus durchgängig ist), docs/MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md (Prinzipien, eine Quelle), docs/SICHTBARKEIT-SUCHMASCHINEN-WERBUNG-KONZEPT.md (ohne Zusatzkosten), docs/SICHTBARKEIT-PHASE1-VORLAGEN.md (Vorlagen Copy-Paste), mök2 (Kanäle 2026, Sichtbarkeit).

---

## 1. Prinzip: Vermarktung = ein Ablauf, eine Quelle, automatisiert

**Wie der Lebenszyklus der App** (Geburt → Aktives Leben → Sterben) **ein durchgängiger Standard** ist, soll die Vermarktung laufen:

- **Ein Ablauf pro Kanal:** Pro Kanal (Web, QR, Empfehlung, Presse, Social, …) gibt es **einen** definierten Ablauf – einmal einrichten oder einmal pro Aktion (z. B. Presseinfo), dann nutzen. Kein „mal so, mal so“.
- **Eine Quelle für Botschaften:** Werbelinie (PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2) und USPs kommen aus **tenantConfig** und **mök2**. Alle Kanäle bauen darauf auf; keine abweichenden Slogans pro Kanal.
- **Automatisiert wo immer möglich:** Was die Technik übernimmt (Demo → Lizenz, Empfehlungslink, QR mit Server-Stand, Checkout, Erfolgsseite), läuft ohne manuellen Eingriff. Was Menschen tun (z. B. Presseinfo versenden), folgt **einer** Vorlage und **einem** Verteiler – kein Suchen, kein Neuerfinden.
- **Ohne große Kosten:** Fokus auf Kanäle, die **ohne oder mit minimalem Budget** laufen: SEO-Basis, Google Business, Social-Bio, QR/Links, Empfehlungsprogramm, Presse (eine Vorlage, ein Verteiler), E-Mail-Signatur, Prospekt aus mök2 als PDF.

---

## 2. Kanäle – automatisiert im Sportwagenmodus, ohne große Kosten

Jeder Kanal: **Was ist der eine Ablauf?** **Welche eine Quelle?** **Was läuft automatisch?** **Kosten?**

| Kanal | Ein Ablauf / Eine Quelle | Was läuft automatisch | Kosten |
|-------|---------------------------|------------------------|--------|
| **Web / Willkommen / Demo** | Willkommensseite, Galerie ök2, LicencesPage – alle mit Werbelinie + USPs aus tenantConfig. CTA „Lizenz anfragen“ → Stripe Checkout. | Nach Deployment: Besucher kommen, sehen einheitliche Botschaft, können Demo nutzen und Lizenz abschließen. Kein manueller Eingriff pro Besucher. | 0 € (Vercel, Domain optional) |
| **QR-Codes** | Eine Logik: Server-Stand + Cache-Bust (buildQrUrlWithBust, useQrVersionTimestamp). QR in APf/Flyer/Visitenkarte führen auf Galerie oder Willkommen. | Jeder Scan lädt aktuellen Stand. Einmal drucken/aufhängen – danach arbeitet der Kanal für uns. | 0 € (Druck optional) |
| **Empfehlungsprogramm** | Eine Stelle: Einstellungen → Empfehlungs-Programm; mök2 „So empfiehlst du“. Nutzer kopiert Link mit Empfehler-ID, teilt; Geworbene gibt ID beim Checkout ein → System vergibt Rabatt/Gutschrift. | Voll automatisiert: ID-Anzeige, Zuordnung bei Lizenzabschluss, Gutschrift. Kein manuelles Zuteilen. | 0 € (Gutschrift aus Umsatz) |
| **Lizenz / Checkout / Erfolg** | Stripe Checkout → Webhook → Supabase → Erfolgsseite + druckbare Bestätigung. Eine API, eine Doku (STRIPE-LIZENZEN-GO-LIVE). | Nach Go-Live: Zahlung, Lizenz-Eintrag, Galerie-URL für Kunden – alles automatisch. | Stripe-Gebühren pro Transaktion |
| **SEO (Suchmaschinen)** | Eine Sitemap (sitemap.xml), sinnvolle Titel/Beschreibungen pro Route, echte Texte (Willkommen, Vita, Galerie). Quelle: gleiche Werbelinie/USPs. | Suchmaschinen crawlen; Indexierung läuft. Einmal gepflegt, dann wirkt es weiter. | 0 € |
| **Google Business Profile** | Ein Eintrag: Name, Adresse, Öffnungszeiten, Website-Link, 1–3 Fotos, Kurzbeschreibung (aus Werbelinie). Vorlage: SICHTBARKEIT-PHASE1-VORLAGEN.md. | Nach Anlage: Sichtbar bei „Galerie [Ort]“, „K2 Galerie“. Kein laufender Aufwand. | 0 € |
| **Social Bio & Link** | Eine Bio (Vorlage Phase 1): Werbelinie + „Link in Bio“ → willkommen. Einmal eintragen, bleibt. | Jeder Klick auf Bio-Link führt zur Willkommensseite. Kein manueller Versand pro Follower. | 0 € |
| **Presse / Medienverteiler** | **Ein** Verteiler (MEDIENVERTEILER-EROEFFNUNG.md), **eine** Vorlage (PRESSEARBEIT-STANDARD, SICHTBARKEIT-PHASE1 §6). Copy-Paste Text, gleiche E-Mail-Adressen. | Nicht automatisch versendet – aber **ein** Ablauf: Vorlage ausfüllen → Liste öffnen → Versand. Kein Suchen nach Adressen oder neuen Formulierungen. | 0 € |
| **E-Mail-Signatur** | Link zur Willkommensseite oder Galerie in Signatur. Einmal einrichten. | Jede E-Mail trägt den Link mit. | 0 € |
| **Prospekt / PDF aus mök2** | Eine Quelle: mök2 → „Als PDF drucken“. K2-GALERIE-PRAESENTATIONSMAPPE + Handbuch-Kapitel; Werbelinie oben. | Ein Klick → PDF für Flyer, Partner, Messe. Kein separates Layout pro Kanal. | 0 € (Druck optional) |
| **Verzeichnisse (Kulturportale, Kunst)** | Kostenlose Einträge: Google Business (siehe oben), regionale Kulturportale, Kunstverbände. Einmal anlegen, gleiche Kernangaben (Name, Link, 1–2 Sätze aus Werbelinie). | Nach Eintrag: dauerhaft sichtbar. | 0 € |

---

## 3. Was „automatisiert“ konkret heißt (wie Lebenszyklus)

| Aspekt | Lebenszyklus App | Vermarktung (dieser Plan) |
|--------|-------------------|----------------------------|
| **Ein Ablauf** | Checkout → tenantId → Webhook → Erfolgsseite → /g/:tenantId → Admin ?tenantId= → „Lizenz beenden“ → Blob löschen. Kein manuelles Zuteilen. | Pro Kanal ein Ablauf: z. B. „Presse = eine Vorlage + ein Verteiler“; „QR = Server-Stand + ein Druck“. |
| **Eine Quelle** | Tenant-Context, Keys, getBlobPath, mergeServerWithLocal – eine Schicht, eine Regel. | Werbelinie + USPs aus tenantConfig/mök2; alle Kanäle beziehen daraus. |
| **Kein Flickenteppich** | Kein „pro Mandant anderer Code“. | Kein „pro Kanal anderer Slogan oder andere Adressen“ – eine Vorlage, ein Verteiler, eine Werbelinie. |
| **Skalierung ohne Mehrkosten** | Neuer Klient = neuer tenantId, gleicher Ablauf. | Mehr Reichweite über Empfehlung, QR, SEO, Social – gleiche Technik, keine neuen Systeme. |

---

## 4. Kanäle mit laufenden Kosten (bewusst begrenzt)

Diese Kanäle **nicht** in den automatisierten Sportwagenmodus „ohne große Kosten“ einbauen – nur wenn du bewusst Budget einsetzen willst:

| Kanal | Typische Kosten | Sportwagenmodus? |
|-------|------------------|-------------------|
| Google Ads | Ab ca. 50–200 €/Monat | Nein – Budgetentscheidung; keine Automatik ohne Ausgabe. |
| Bezahlte Social-Posts | Ab 20–100 €/Kampagne | Nein – optional, kein Standard-Ablauf. |
| SEO-Agentur / Content | 500–2.000 €/Monat | Nein – manueller Dienstleister. |
| Newsletter-Dienst (Mailchimp etc.) | Free-Tier oder 10–50 €/Monat | Optional – wenn gewünscht, **ein** Dienst, **eine** Quelle für E-Mail-Versand. |
| Eigene Domain | ca. 10–30 €/Jahr | Gering – einmal kaufen, dann in allen Links nutzen (eine Quelle). |

**Regel:** Der **Standard** für Vermarktung = die Kanäle aus Abschnitt 2 (automatisiert, eine Quelle, ohne große Kosten). Kostenkanäle nur ergänzen, wenn bewusst gewollt – und dann wieder **ein** Ablauf (z. B. ein Google-Ads-Konto, ein Budget, eine Anzeigenvorlage).

---

## 5. Nächste Schritte (umgesetzt im Sportwagenmodus)

1. **Stripe Go-Live** – dann läuft der komplette Ablauf Demo → Lizenz → Erfolg automatisch (einzige technische Lücke).
2. **Eine Checkliste „Vermarktung einmal einrichten“** – alle Kanäle aus Abschnitt 2 durchgehen: Google Business angelegt? Social-Bio gesetzt? Presse-Vorlage + Verteiler bereit? QR-URLs aus APf genutzt? Empfehlungstool in mök2 verlinkt? Einmal abhaken, dann läuft jeder Kanal nach dem einen Ablauf.
3. **Kanäle 2026 in mök2** – die drei konkreten Kanäle (z. B. „Google Business + Social Bio + Presse“ oder „Empfehlung + QR + SEO“) eintragen und einmal pro Quartal prüfen: Quelle noch eine? Ablauf noch derselbe?

---

## 6. Kurzfassung

- **Vermarktung = automatisiert wie Lebenszyklus:** Ein Ablauf pro Kanal, eine Quelle (Werbelinie, USPs), kein manueller Flickenteppich.
- **Kanäle ohne große Kosten**, die für uns arbeiten: Web/Demo, QR, Empfehlungsprogramm, Lizenz/Checkout, SEO, Google Business, Social-Bio, Presse (eine Vorlage + ein Verteiler), E-Mail-Signatur, Prospekt-PDF, Verzeichnisse.
- **Kostenkanäle** (Ads, Agentur, bezahlte Posts) bewusst außerhalb des Standard-Ablaufs – nur bei Bedarf, dann wieder ein Ablauf.
- **Referenzen:** LEBENSZYKLUS-QUALITAETSCHECK.md, MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md, SICHTBARKEIT-SUCHMASCHINEN-WERBUNG-KONZEPT.md, SICHTBARKEIT-PHASE1-VORLAGEN.md, mök2 Kanäle 2026.
