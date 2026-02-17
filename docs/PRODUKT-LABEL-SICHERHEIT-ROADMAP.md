# Produkt-Label Sicherheit – Roadmap

**Stand:** 17.02.26  
**Ziel:** Verkaufbares Produkt auf ein **sehr gutes Label** bringen: tausende Kunden zufrieden, keine vermeidbaren Probleme, **Zahlungen und Vergütungen sicher**, und bei **Regressansprüchen nachweisen können, dass genug für Sicherheit getan wurde**.

---

## 1. Warum dieses Dokument

- **Skalierung:** Tausende Nutzer:innen bedeuten mehr Angriffsfläche und mehr Verantwortung.
- **Zahlungen & Vergütungen:** Sobald Geld fließt (Licence-Gebühren, Empfehlungs-Vergütung, Shop), müssen Transaktionen **sicher, nachvollziehbar und rechtssicher** sein.
- **Regress:** Bei Schäden oder Streit willst du **nachweisen können**, dass du **angemessene technische und organisatorische Maßnahmen** (TOM) getroffen hast – Stand der Technik, Dokumentation, regelmäßige Prüfungen.

Dieses Dokument ist die **Roadmap** dafür und dient zugleich als **erster Baustein des Nachweises**: „Wir haben ein klares Sicherheitskonzept und setzen es schrittweise um.“

---

## 2. Was „sehr gutes Label“ konkret bedeutet

| Bereich | Anforderung | Status / nächster Schritt |
|--------|-------------|---------------------------|
| **Zugriff Admin/Backend** | Echtes Login (Auth), keine Passwörter nur im Frontend | **Vorbereitet:** Supabase Auth + Login-Seite; vor Go-Live: Nutzer anlegen + Migration 002 (siehe docs/VOR-VEROEFFENTLICHUNG.md). |
| **Datenbank** | RLS an Auth gekoppelt; pro Mandant getrennt | **Vorbereitet:** Migration 002 liegt in supabase/migrations/; vor Go-Live anwenden (docs/ADMIN-AUTH-SETUP.md). |
| **Zahlungen (Kunde → dich)** | Keine Kreditkarten o. Ä. selbst speichern; nur zertifizierter Zahlungsdienstleister (z. B. Stripe) | Shop heute: Bar/Karte/Überweisung als Erfassung; echte Kartenzahlung später nur über Provider |
| **Vergütung (du → Empfehler:innen)** | Jede Vergütung **nachvollziehbar**: wer, wann, wofür, Betrag; Export für Buchhaltung und Prüfung | Abrechnungsstruktur geplant (docs); technisch: Audit-Log + Export |
| **Nachweis Sorgfalt** | Sicherheitskonzept dokumentiert; Checklisten; regelmäßige Prüfungen (z. B. npm audit); Änderungen nachvollziehbar | Dieses Doc + Checklisten; später: kurzes „Sicherheitskonzept“ + Änderungslog |
| **Rechtliches** | AGB, Datenschutz (wenn personenbezogene Daten), Impressum – für Vertrauen und Regress | AGB-Seite vorhanden; Datenschutz/Impressum je nach Angebot ergänzen |

---

## 3. Technische Maßnahmen (Überblick)

### 3.1 Bereits umgesetzt (Grundlage)

- Keine Secrets im Repo; Fehlerseiten escaped; Stack in Produktion nicht sichtbar.
- Security-Header (X-Frame-Options, X-Content-Type-Options, Referrer-Policy usw.).
- CORS auf bekannte Origins beschränkt.
- K2/ök2 strikt getrennt; Checklisten und RLS-Doku vorhanden.
- Backup- und Wiederherstellungskonzepte dokumentiert.

### 3.2 Griffbereit vor Go-Live (alles vorbereitet, vor Veröffentlichung ausführen)

- **Checkliste:** **docs/VOR-VEROEFFENTLICHUNG.md** – vor dem echten Veröffentlichen durchgehen und abhaken.
- **Admin-Auth:** Nutzer in Supabase anlegen, Migration 002 anwenden. Anleitung: **docs/ADMIN-AUTH-SETUP.md**.
- **Nicht vergessen:** Diese Schritte erst kurz vor oder beim Go-Live ausführen; bis dahin bleibt alles wie gewohnt nutzbar.

### 3.3 Weitere Schritte (für verkaufbares Produkt)

1. **Auth/RLS:** Siehe 3.2 – vor Veröffentlichung erledigen.
2. **Zahlungen:**  
   - **Nie** Kartendaten oder sensible Zahlungsdaten selbst speichern.  
   - Nur anerkannte Zahlungsdienstleister (z. B. Stripe, SumUp) anbinden; Zahlung läuft dort, du erhältst nur Transaktions-ID / Status.  
   - In der Doku festhalten: „Kartenzahlung ausschließlich über PCI-DSS-konformen Provider.“
3. **Vergütung / Abrechnung:**  
   - Jede Zuordnung „Licence → Zahlung → Empfehler:in → Betrag“ **protokollieren** (Audit-Log).  
   - Abrechnungsläufe und Exporte (z. B. CSV/PDF) für Buchhaltung und Nachweis „wer hat was wann erhalten“.

### 3.4 Später (bei Skalierung)

- Regelmäßiges **npm audit** und Beheben kritischer/hoher Lücken.
- Optional: Verschlüsselung sensibler Felder in der DB (z. B. nur serverseitig).
- Optional: Logs für kritische Aktionen (Login, Zahlungszuordnung, Abrechnungslauf) – Aufbewahrungsfrist und DSGVO beachten.

---

## 4. Nachweis für Regress („genug getan“)

Damit du bei Regressansprüchen zeigen kannst, dass du **angemessene Sorgfalt** walten hast lassen:

1. **Sicherheitskonzept dokumentieren**  
   Kurzes Dokument (z. B. 1–2 Seiten): Welche Risiken (Zugriff, Zahlung, Daten) wir ihr angeht und mit welchen Maßnahmen (Auth, RLS, Provider, Audit-Log). Dieses Roadmap-Dokument ist ein erster Teil davon.

2. **Checklisten nutzen und einhalten**  
   `docs/SICHERHEIT-STABILITAET-CHECKLISTE.md` und `docs/VERBESSERUNGEN-OHNE-MEHRKOSTEN.md` – bei Änderungen prüfen; zeigt „regelmäßige Berücksichtigung“ von Sicherheit.

3. **Zahlungen/Vergütungen nachvollziehbar halten**  
   Keine Zahlung/Vergütung „im Dunkeln“; Abrechnungsläufe und Exporte aufbewahren (z. B. für Steuer/Buchhaltung). Technisch: Audit-Trail (wer, wann, was, Betrag).

4. **Stand der Technik**  
   Anerkannte Praxis: Auth, RLS, kein Speichern von Karten, Nutzung zertifizierter Zahlungsdienstleister, Sicherheits-Updates (z. B. npm audit). Das in 1–2 Sätzen im Sicherheitskonzept festhalten.

5. **Rechtliches**  
   AGB, Datenschutz, Impressum aktuell halten – für Vertrauen und für den Fall von Streit.

---

## 5. Rechtliches (kurz)

- **AGB:** Bereits als Seite vorhanden; bei Zahlungen/Vergütung und Haftung prüfen (am besten mit Anwalt/Steuerberater).
- **Datenschutz:** Sobald du personenbezogene Daten verarbeitest (Kunden, Empfehler:innen, Licence-Inhaber:innen), brauchst du eine **Datenschutzerklärung** und ggf. Einwilligungen; Aufbewahrung und Löschung regeln.
- **Impressum:** Für geschäftliche Nutzung in vielen Ländern Pflicht; für Vertrauen und Regress sinnvoll.

*Kein Ersatz für Rechtsberatung – bei Unsicherheit Fachperson hinzuziehen.*

---

## 6. Prioritäten (Reihenfolge)

| Priorität | Maßnahme | Zweck |
|-----------|----------|--------|
| 1 | **Auth für Admin** (Supabase Auth) + **RLS an Auth** | Zugriff nur für berechtigte Nutzer; Grundlage für Multi-Mandant und Regress. |
| 2 | **Zahlungsfluss klären:** Nur Provider (Stripe o. ä.), nie Karten speichern; in Doku festhalten | Sicherheit Zahlungen + Nachweis. |
| 3 | **Abrechnung/Vergütung:** Audit-Log + Export (CSV/PDF) für jede Vergütung und Abrechnungslauf | Nachvollziehbarkeit, Buchhaltung, Regress. |
| 4 | **Kurzes Sicherheitskonzept** (1–2 Seiten) aus diesem Dokument + Checklisten | Zentrale Nachweis-Datei. |
| 5 | **Rechtliches:** AGB/DSGVO/Impressum prüfen und ergänzen | Vertrauen und Rechtssicherheit. |

---

## 7. Verknüpfung mit bestehender Doku

- **Vor Veröffentlichung (Checkliste):** `docs/VOR-VEROEFFENTLICHUNG.md` – **nicht vergessen vor Go-Live.**
- **Admin-Auth einrichten:** `docs/ADMIN-AUTH-SETUP.md`
- **Auth/RLS:** `docs/SUPABASE-RLS-SICHERHEIT.md`
- **Checklisten:** `docs/SICHERHEIT-STABILITAET-CHECKLISTE.md`, `docs/VERBESSERUNGEN-OHNE-MEHRKOSTEN.md`
- **Abrechnung/Vergütung:** `docs/ABRECHNUNGSSTRUKTUR-EMPFEHLUNGSPROGRAMM.md`, `docs/LICENCE-STRUKTUR.md`, `docs/VERMARKTUNGSKONZEPT-EMPFEHLUNGSPROGRAMM.md`
- **K2/ök2:** `docs/K2-OEK2-DATENTRENNUNG.md`

---

*Mit dieser Roadmap hast du einen klaren Fahrplan zum „sehr guten Label“ und zugleich die Grundlage, um bei Regressansprüchen zu zeigen: Wir haben Ziele, Maßnahmen und Prioritäten definiert und setzen sie schrittweise um.*
