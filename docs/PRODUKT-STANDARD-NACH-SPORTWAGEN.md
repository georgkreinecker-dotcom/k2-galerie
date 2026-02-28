# Produkt-Standard nach Sportwagen (28.02.26)

**Zweck:** Der technische und prozessuale Standard, den wir mit dem Produkt erreicht haben, hat **eine feste Stelle** in der Doku. Nach Praxistest oder für neue Teammitglieder: Hier steht, worauf das Produkt aufbaut.

Siehe auch: **SPORTWAGEN-ROADMAP.md** (Phasen 1–9, was umgesetzt wurde).

---

## 1. Architektur-Standard

| Bereich | Standard |
|--------|----------|
| **Daten & Kontext** | Eine Quelle: Tenant-Context (K2 \| ök2 \| VK2). Keys und Kontext-Abfragen zentral, keine verstreuten Duplikate. |
| **Persistenz** | Eine Schicht pro Typ: Artworks, Stammdaten, Events, Dokumente. Lesen/Schreiben nur über diese Schichten. |
| **Sync & Merge** | Eine Regel (SYNC-REGEL.md), eine Funktion `mergeServerWithLocal`. Alle Aufrufer nutzen sie. |
| **API/Transport** | Ein API-Client (Retry, Timeout, einheitliches Fehler-Objekt). |
| **Reload** | Eine sichere Funktion `safeReload` (iframe-Check zentral). Alle Reload-Buttons nutzen sie. |

**Prinzip:** Eine Quelle, ein Standard pro Problemstellung (Profi statt Dilettant).

---

## 2. Sicherheits- und Schutz-Standard

- **Kundendaten:** Kein automatisches Löschen. Schichten schreiben nur bei User-Aktion oder explizitem Save/Merge/Backup.
- **Datentrennung:** K2, ök2, VK2 strikt getrennt (Keys, Kontext). Checkliste: K2-OEK2-DATENTRENNUNG.md.
- **Stand & QR:** Server-Stand + Cache-Bust; Regel stand-qr-niemals-zurueck.
- **Kontext:** Schutzregeln so, dass Wechsel (z. B. zurück aus ök2) K2 nicht blockieren.

---

## 3. Test-Standard

- **38 Tests** für kritische Pfade: Datentrennung, Kundendaten-Schutz, Merge, Persistenz-Schicht, Bild-Upload.
- Tests laufen im Build. QS vor Commit (test + build).
- Kein Deployment mit roten Tests.

---

## 4. Dokumentations-Standard

- **Eine Stelle pro Thema:** SYNC-REGEL, Tenant-Context (STRUKTUR-HANDELN-QUELLEN), API/Vercel (DATENTRANSPORT-IPAD-MAC-VERCEL), Build/Stand (Regeln + Doku).
- **GELOESTE-BUGS.md:** Vor Code-Änderungen prüfen; gelöste Bugs nicht wieder einbauen.
- **CRASH-BEREITS-GEPRUEFT.md:** Bei Crash zuerst lesen; nicht dieselben Stellen wieder durchsuchen.
- **Struktur:** HAUS-INDEX, docs/00-INDEX, STRUKTUR-HANDELN-QUELLEN, k2team-handbuch.

---

## 5. Prozess-Standard

- Session-Start: Tests, DIALOG-STAND, GELOESTE-BUGS einbeziehen.
- Fertig = getestet + committed (+ Stand aktualisiert).
- Regeln in .cursor/rules (alwaysApply) sichern die Lehren ab.

---

## 6. Produkt-Vision – technische Basis

- Konfiguration statt Festverdrahtung; Mandant/Kontext architektonisch abgebildet.
- Web-App für Windows, Android, macOS, iOS (Browser + PWA).
- Basis für vermarktbare Version (eine Instanz pro Künstler:in, Skalierung möglich).

---

## Kurzfassung

**Architektur:** Eine Quelle, eine Schicht, eine Regel pro Thema.  
**Sicherheit:** Kundendaten geschützt, K2/ök2/VK2 getrennt, Stand/QR stabil.  
**Qualität:** 38 Tests, QS vor Commit, Bugs und Crash-Stellen dokumentiert.  
**Doku & Prozess:** Klare Ablagen, kein doppeltes Bearbeiten derselben Probleme.

---

**Wo was liegt:** docs/00-INDEX.md (unter „Produkt & Vision“ / „Prinzipien & Regeln“).  
**Roadmap:** docs/SPORTWAGEN-ROADMAP.md.
