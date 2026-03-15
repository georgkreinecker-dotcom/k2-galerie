# Feinschliff – Weit testen (Reihe 1)

**Zweck:** Vor dem Vertiefen (ök2-Texte etc.) einmal breit prüfen: Abläufe, Geräte, Kontexte. Nacheinander abhaken.

**Reihenfolge:** 1. Weit testen (diese Checkliste) → 2. ök2-Texte (danach).

**Gilt für ök2 und VK2:** Diese Testroutine ist für ök2 festgelegt und gilt in gleicher Weise für VK2 (Standardsachen = immer K2, ök2 und VK2). Bei Nutzung von VK2 dieselben Abläufe und Kontext-Checks anwenden. Siehe auch **docs/K2-OEK2-DATENTRENNUNG.md** Abschnitt „Testroutine / Weit testen“ und „VK2 funktionssicher machen“.

---

## Was Joe (KI) abgearbeitet hat ✅

| # | Was | Status |
|---|-----|--------|
| 1 | **Tests laufen lassen** (`npm run test`) | ✅ 183 Tests grün. |
| 2 | **Build prüfen** (`npm run build`) | ✅ Build grün. |
| 3 | **Code-Check kritischer Pfade** | ✅ Veröffentlichen (publishGalleryDataToServer nur in GalerieVorschau, DevView, Admin). Laden (mergeServerWithLocal + serverAsSoleTruth in GaleriePage, GalerieVorschauPage, supabaseClient). Stand/QR (buildQrUrlWithBust + useQrVersionTimestamp in allen QR-Seiten). Kein Abweichen vom Standard. |

→ Dein Teil: Abläufe in der App durchklicken, Geräte (Mac/iPad/Handy), Kontexte – **step by step nebenbei**, nicht alles auf einmal.

---

## Was du (Georg) machen musst – Abläufe (kritische Pfade)

| # | Was | Kurz prüfen |
|---|-----|-------------|
| 1 | **Veröffentlichen** | Admin K2: „An Server senden“ / Veröffentlichen – Erfolg, keine Fehlermeldung. |
| 2 | **Laden vom Server** | „Bilder vom Server laden“ oder Stand-Badge tippen – Daten/Bilder kommen an, keine leeren Karten wo vorher Bild. |
| 3 | **Stand & QR** | QR scannen oder auf Handy öffnen – gleicher Build-Stand wie Vercel (Badge unten links). Nach Push: 1–2 Min warten, dann Handy: Stand-Badge tippen oder Seite neu. |
| 4 | **Werke speichern** | Werk neu anlegen (mit Bild) + Werk bearbeiten (Bild ändern) – Speichern klappt, Bild bleibt in Galerie. |
| 5 | **K2 vs. ök2** | Galerie öffentlich (ök2) zeigt nur Muster; Admin ök2 schreibt nicht in K2-Keys. Shop von ök2: Kontakt/Link zu Demo, nicht zu K2. |
| 6 | **Etikett drucken** | Admin: Etikett drucken – Druckdialog öffnet sich (nicht nur neuer Tab). |
| 7 | **Dokument öffnen** | Admin: z. B. Flyer/Presse öffnen – ein Weg (In-App oder Tab), Zurück landet richtig. |
| 8 | **Backup** | Admin → Einstellungen: „Vollbackup herunterladen“ / „Aus letztem Backup wiederherstellen“ – ohne Crash, sinnvolle Meldung. |

---

## Was du (Georg) machen musst – Geräte

| Gerät | Kurz prüfen |
|-------|-------------|
| **Mac (Browser)** | Admin, Galerie, Veröffentlichen, Laden – alles erreichbar, keine Konsolenfehler. |
| **iPad / Handy (Browser oder PWA)** | Galerie ansehen, Admin (wenn genutzt), Stand-Badge, „An Server senden“ / „Vom Server laden“ – gleicher Stand wie Mac. |

---

## Was du (Georg) machen musst – Kontexte

| Kontext | Kurz prüfen |
|---------|-------------|
| **K2 (echte Galerie)** | Echte Werke, Stammdaten, Veröffentlichen, Kasse – alles mit echten Daten. |
| **ök2 (Demo)** | Musterwerke, Mustertexte, keine K2-Daten sichtbar; Shop/Links zur Demo. |
| **VK2** | Wenn genutzt: Vereinsdaten, Mitglieder, eigene Keys – keine Vermischung mit K2. |

---

## Nach Änderung an VK2 oder ök2 – gezielte Prüfung (Checkliste)

**Wann:** Nach Code-Änderungen, die Veröffentlichen, Laden vom Server oder Seitengestaltung für **VK2** oder **ök2** betreffen.

| # | Prüfung | Kurz |
|---|---------|------|
| 1 | **VK2: Kein K2-Bild nach Veröffentlichen** | Admin VK2: Design mit eigenem Bild speichern → Veröffentlichen. Anderes Gerät oder Inkognito: VK2-Galerie öffnen, „Vom Server laden“ / Stand-Badge. Erwartung: VK2-Bild sichtbar, **kein** K2-Bild. |
| 2 | **ök2: Keine K2-Daten** | Galerie öffentlich (ök2) ansehen + Shop von ök2: nur Musterwerke, Muster-Kontakt, kein K2-Telefon/K2-Adresse. |
| 3 | **VK2: Eingangskarten** | VK2 Admin: Eingangskarten mit Bild speichern → Veröffentlichen. Nach Laden vom Server: Karten mit Bild sichtbar, kein K2-Bild in Karten. |

**Automatisch:** Die Unit-Tests (datentrennung.test.ts, vk2-backup.test.ts) prüfen die Datenebene. Diese Checkliste ist für manuelles Durchklicken nach Änderungen.

---

## Reihenfolge für dich (nur dein Teil)

1. **Abläufe** (Tabelle „Abläufe“ oben) – nacheinander durchgehen, was du nutzt.
2. **Geräte** – Mac zuerst, dann iPad/Handy (Stand, Sync).
3. **Kontexte** – K2 sicher, dann ök2 (und VK2 wenn relevant).

Wenn etwas hakt: kurz notieren (wo, was), dann können wir gezielt nachbessern. Danach: **2. ök2-Texte** (kürzen, schärfen).

**Joe hat erledigt:** Tests (183 grün), Build (grün), Code-Check kritischer Pfade (alle Standards eingehalten). Georg: seinen Teil step by step nebenbei.

*Stand: 14.03.26 – Feinschliff vor Rechnungsfunktion; Pro++ Code fertig, manueller Test später.*
