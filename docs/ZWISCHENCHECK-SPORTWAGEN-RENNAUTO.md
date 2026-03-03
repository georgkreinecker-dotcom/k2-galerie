# Zwischencheck: Sportwagen – auf dem Weg zum Rennauto

**Stand:** 03.03.26  
**Frage:** Sind alle Anforderungen an einen Sportwagen erfüllt, und ist der Weg zum „Rennauto“ klar?

---

## 1. Sportwagen-Anforderungen (Produkt-Standard)

**Referenz:** docs/PRODUKT-STANDARD-NACH-SPORTWAGEN.md, docs/SPORTWAGEN-ROADMAP.md

| Bereich | Anforderung | Status |
|--------|-------------|--------|
| **Architektur** | Eine Quelle (Tenant-Context), eine Schicht pro Typ (Artworks, Stammdaten, Events, Dokumente), eine Sync-Regel + mergeServerWithLocal, ein API-Client, safeReload, Lizenzen-Doku + API | ✅ Erfüllt (Phasen 1–7 Roadmap [x]) |
| **Sicherheit** | Kundendaten nie automatisch löschen; K2/ök2/VK2 getrennt; Stand/QR stabil (stand-qr-niemals-zurueck); Kontext-Wechsel blockiert K2 nicht | ✅ Erfüllt (Phase 8 [x], Regeln aktiv) |
| **Tests** | 38 Tests für kritische Pfade (Datentrennung, Merge, Persistenz, Bild-Upload); QS vor Commit | ✅ Erfüllt (npm run test 38 passed) |
| **Doku** | Eine Stelle pro Thema; 00-INDEX, HAUS-INDEX, STRUKTUR-HANDELN-QUELLEN; GELOESTE-BUGS, CRASH-BEREITS-GEPRUEFT | ✅ Erfüllt |
| **Prozess** | Session-Start (Tests, DIALOG-STAND); Fertig = getestet + committed; Regeln in .cursor/rules | ✅ Erfüllt (Regeln alwaysApply) |

**Fazit Sportwagen:** Alle Anforderungen aus Produkt-Standard und Roadmap (Phasen 1–9 + 10 Medienstudio) sind erfüllt.

---

## 2. Ein offener Punkt (operativ, kein Standard-Defizit)

| Thema | Status | Nächster Schritt |
|-------|--------|-------------------|
| **Stripe/Lizenzen Go-Live** | Code fertig; **noch nicht live** (Migration 003, Vercel Env, Stripe Webhook) | docs/STRIPE-LIZENZEN-GO-LIVE.md – die 3 Schritte abarbeiten |

Das ist keine Lücke am Sportwagen-Standard, sondern der letzte operative Schritt, um Lizenzen & Zahlungen live zu schalten.

---

## 3. Bereits „Rennauto-tauglich“ (über Sportwagen hinaus)

- **Medienspiegel:** Presse-Empfänger pro Land (AT, DE, CH, LI, LU), Kategorien (Print, TV, Radio, Regional, Online, Kultur), Filter/Sortierung, ein Klick → E-Mail-Adressen kopieren. Skalierbar für weitere Länder.
- **Mehrsprachigkeit Grundstein:** Locale-Config, t(key), strings.de, Doku MEHRSPRACHIGKEIT.md – vorbereitet auf EN/FR ohne großen Umbau.
- **Deutschsprachige Märkte:** Mediensets für alle DACH+LI+LU-Länder angelegt.

---

## 4. Auf dem Weg zum Rennauto – was „Rennauto“ ausmacht (Orientierung)

| Sportwagen (erreicht) | Rennauto (optional / nächste Stufe) |
|------------------------|-------------------------------------|
| Eine Quelle, eine Schicht, eine Regel | Gleicher Standard + höhere Geschwindigkeit (Performance), weniger Re-Renders, klare Bundle-Größen |
| 38 Tests, kritische Pfade | Erweiterte Tests (z. B. E2E, Handy-Flows, Backup/Restore); bei Skalierung: automatisierte Smoke-Tests |
| Doku eine Stelle pro Thema | Doku + Onboarding für neue Entwickler/Lizenznehmer („in 30 Min produktiv“) |
| Stand/QR stabil | Zusätzlich: klare Versionierung, Changelog pro Release (wenn ihr Releases versioniert) |
| Medienspiegel, Mehrsprachigkeit vorbereitet | Zweite Sprache live (strings.en + Sprachumschalter); ggf. Locale pro Mandant |
| Stripe-Code fertig | Stripe live + erste echte Lizenzabschlüsse; Abrechnung/Export im Alltag getestet |

**Kurz:** Der Sportwagen ist fertig und verlässlich. Rennauto = gleiche Basis + mehr Performance, mehr Tests bei Skalierung, mehrsprachig live, Stripe im Echtbetrieb – schrittweise ausbaubar.

---

## 5. Checkliste für dich (Georg)

- [ ] **Sportwagen bestätigt:** Alle Punkte in Abschnitt 1 entsprechen deinem Stand (wenn ja: Sportwagen-Anforderungen erfüllt).
- [ ] **Stripe Go-Live:** Wenn Lizenzen/Verkauf live gehen sollen → STRIPE-LIZENZEN-GO-LIVE.md (3 Schritte) abarbeiten.
- [ ] **Rennauto:** Nichts muss sofort passieren. Sobald du willst: nächste Stufe aus Abschnitt 4 priorisieren (z. B. „Stripe live“, „Englisch einbauen“, „noch mehr Tests“).

---

**Wo was liegt:** docs/PRODUKT-STANDARD-NACH-SPORTWAGEN.md (Standard), docs/SPORTWAGEN-ROADMAP.md (Phasen), docs/STRIPE-LIZENZEN-GO-LIVE.md (offene 3 Schritte).
