# Handbuch: Softwareentwicklung – Standards & Nachweis

**Zweck:** Dieses Dokument **bündelt** für Gespräche (z. B. mit Informatiker:innen, Prüfer:innen, Partner:innen), **welche technischen und prozessualen Standards** das K2-Galerie-Projekt **bewusst** einhält und **wo** das im Repo bzw. in der Doku **nachweisbar** ist.  
**Nicht:** Kein Zertifikat, kein ISO-Audit und **kein Ersatz** für Steuerrecht, Vertragsrecht oder spezialisierte Security-Gutachten.

**Stand:** 23.04.26

**Druckfassung (Texte-Schreibtisch, Sammelordner):** [public/texte-schreibtisch/handbuch-softwareentwicklung-standards-nachweis.html](../public/texte-schreibtisch/handbuch-softwareentwicklung-standards-nachweis.html) – im Browser öffnen → Drucken / PDF. Zettel in der APf unter **Druckbares – Sammelordner**.

---

## 1. Wie dieses Handbuch gedacht ist

| Aspekt | Inhalt |
|--------|--------|
| **Was** | Themen wie Qualität, Sicherheit, Tests, Deployment, Datentrennung, Wartbarkeit. |
| **Nachweis** | Verweis auf **Doku**, **Regeln** (`.cursor/rules`), **Skripte** (`package.json`, CI-ähnlich: `npm run build` mit Tests), **Code** (z. B. zentrale Utils). |
| **Ehrlichkeit** | Was **noch offen** oder bewusst **eingeschränkt** ist, steht benannt (z. B. Go-Live-Schritte Drittanbieter). |

**Schon vorhanden und führend:**  
- **docs/EINSTIEG-INFORMATIKER-SYSTEM-WARTUNG.md** – Systemüberblick und Prozess-Tabelle.  
- **docs/PRODUKT-STANDARD-NACH-SPORTWAGEN.md** – Erreichter Produkt- und Architekturstandard.  
- **docs/00-INDEX.md** – Alle Fach-Dokumente.

Dieses Handbuch ist die **Kurzlandkarte + Nachweis-Matrix**; Details bleiben in den verlinkten Dateien.

---

## 2. Standards-Matrix (Thema → Nachweis)

| Thema | Was wir meinen (Kurz) | Wo nachlesen / nachweisen |
|--------|------------------------|----------------------------|
| **Architektur & Wartbarkeit** | Ein Standard pro Problemstellung; klare Schichten (Tenant, Sync, API). | **PRODUKT-STANDARD-NACH-SPORTWAGEN.md** §1; **ein-standard-problem.mdc** (Tabelle); **EINSTIEG-INFORMATIKER** §3 Prozesstabelle. |
| **Qualitätssicherung vor Release** | Tests + Build vor Commit/Push; volle Suite im `npm run build` (Vercel). | **package.json** (`"build": "npm run test && …"`); **qs-standard-vor-commit.mdc**; **QUALITAETSSICHERUNG.md** falls vorhanden; **SERVICE-ARBEIT-DATEN-TESTS.md** (Fokus-Tests Daten). |
| **Multi-Tenant & Datentrennung** | K2 / ök2 / VK2 getrennt; kein Vermischen; Mandanten-Lifecycle. | **K2-OEK2-DATENTRENNUNG.md**; **k2-oek2-trennung.mdc**, **k2-oek2-eisernes-gesetz-keine-daten.mdc**; **EINSTIEG-INFORMATIKER** (Prozesse Sync, Kündigung). |
| **Schutz sensibler Daten** | Kein stilles Löschen; geschützte Keys; Merge-Regeln. | **niemals-kundendaten-loeschen.mdc**; **datentrennung-localstorage-niemals-loeschen.mdc**; Tests in **src/tests/** (z. B. datentrennung). |
| **Deployment & „ein Stand“** | Branch **main**; Build mit Stand-Info; QR/Cache-Bust für aktuelle Version. | **DEPLOYMENT-EIN-BRANCH.md**; **stand-qr-niemals-zurueck.mdc**; **vercel.json**; **write-build-info.js** (im Build). |
| **Sicherheit (Anwendung)** | Kein Vertrauen in URL für Mandanten-Wechsel (Plattform vs. Lizenz); Besucher ohne Schreibzugriff auf Kundendaten. | **eiserne-regel-lizenznehmer-kein-oek2-vk2.mdc**; **eiserne-regel-besucher-keine-eingaben.mdc**; **SICHERHEIT-*** in docs/; **AUDIT-PROZESS-PROGRAMMSICHERHEIT-GO-LIVE.md** / **SICHERHEIT-VOR-GO-LIVE.md**. |
| **Backup & Wiederherstellung** | Sichtbarer Weg in der App; Wiederherstellung mit Bestätigung. | **eiserne-regel-backup-wiederherstellung.mdc**; **KRITISCHE-ABLAEUFE.md** §11; k2team-handbuch/Backup-Kapitel (siehe **STRUKTUR-HANDELN-QUELLEN.md**). |
| **Dokumentation & Reproduzierbarkeit** | Zentrale Indizes, eine Quelle pro Thema, Entscheidungen festgehalten. | **HAUS-INDEX.md**; **docs/00-INDEX.md**; **STRUKTUR-HANDELN-QUELLEN.md**; **FEHLERANALYSEPROTOKOLL.md** / **GELOESTE-BUGS.md**. |
| **Regelwerk (KI + Mensch)** | Verbindliche Arbeitsregeln im Repo. | **.cursorrules**; **.cursor/rules/*.mdc** (viele `alwaysApply`). |
| **Externe Dienste (markttypisch)** | Vercel (Hosting/Serverless), Supabase, Stripe – dokumentiert, nicht versteckt. | **EINSTIEG-INFORMATIKER** §1; **Zahlungs-/Stripe-Dokumentation** in docs/ (z. B. **STRIPE-LIZENZEN-GO-LIVE.md**). |

**Limitierung offen sagen:** Z. B. **STRIPE-LIZENZEN-GO-LIVE.md** / **START-NUR-NOCH-OFFEN.md** – was für produktives Abrechnen noch zu konfigurieren ist, steht dort **explizit** (kein „tun wir schon alles“-Schein).

---

## 3. Typische Diskussionsfragen – Kurzantwort + Fundstelle

| Frage | Kurzantwort | Tiefer |
|--------|-------------|--------|
| **„Darf so jemand Software verkaufen?“** | Gewerblich/vertraglich regelt Rechtsform, AGB, DSGVO – **nicht** ein Informatik-Diplom. | Unternehmensberatung/Anwalt; in der App: **AGB/Datenschutz** (Pfade in **STRUKTUR-HANDELN-QUELLEN**). |
| **„Ist das professionell entwickelt?“** | Stack und Prozesse sind **industry-üblich** (React/TS, Tests im Build, getrennte Mandanten, API-Schichten). | **EINSTIEG-INFORMATIKER**; **PRODUKT-STANDARD-NACH-SPORTWAGEN.md**. |
| **„Gibt es Tests?“** | Ja; `npm run test` in der CI-Pipeline des Builds. | **src/tests/**; **package.json** `build`. |
| **„Wer pflegt das in 5 Jahren?“** | Doku + eine Quelle pro Thema + Regelwerk; Einstiegsdokument für Fachleute. | **EINSTIEG-INFORMATIKER-SYSTEM-WARTUNG.md**; **WARTUNG-PROJEKT.md** (wenn gepflegt). |
| **„Wie stellt ihr Datenschutz und Trennung sicher?** | Trennungsmodell, Keys, Prüf-Tests, Schutzregeln. | **K2-OEK2-DATENTRENNUNG.md**; Tests; Regeln. |

---

## 4. Vorgeschlagene Form für „Vorführ“ oder Anhang (PDF/Druck)

1. **Deckblatt:** Name Produkt, Version/Stand (Build-Info auf Vercel: **/build-info.json**), Zweck des Dokuments.  
2. **2 Abschnitt** dieses Handbuchs (Matrix) – 2–3 Seiten.  
3. **Anhang A:** Auszug **EINSTIEG-INFORMATIKER** (System + Prozesstabelle) – 5–8 Seiten.  
4. **Anhang B:** **PRODUKT-STANDARD-NACH-SPORTWAGEN** (gekürzt oder voll, je nach Zielgruppe).  
5. **Optional Anhang C:** Screenshot/Verweis Vercel-Deployment, Test-Badge „build includes test“ (aus Doku/CI beschreiben, kein Geheimnis).

Druck-Layout: wie andere Projekt-Handbücher – **leserlich, nicht Formular-Look** (siehe **handbuch-dokumente-leserlich-kein-formular.mdc**).

---

## 5. Pflege

| Wenn sich was ändert | Was aktualisieren |
|----------------------|-------------------|
| Neuer zentraler Standard | **PRODUKT-STANDARD-NACH-SPORTWAGEN.md** und **diese Matrix** (Zeile ergänzen). |
| Neuer kritischer Prozess | **EINSTIEG-INFORMATIKER** Prozesstabelle + ggf. Zeile hier. |
| Regeländerung | **.cursor/rules** + **eine** Doku-Stelle, nicht nur Chat. |

**Verantwortung:** Fachliche Richtigkeit der **verlinkten** Quellen; dieses Handbuch **verdichtet** nur und verweist.

---

*Ende. Bei Erweiterung: zuerst prüfen, ob ein Thema schon in **docs/00-INDEX.md** steht – Doppeltes vermeiden (georg-denken-arbeiten-ein-ort).*
