# AGB – Vorlage und Rechtsstruktur (Referenz)

**Stand:** 11.04.26  
**Zweck:** Dieses Dokument **spiegelt** die in der App unter **`/agb`** (`src/pages/AGBPage.tsx`) angezeigten Allgemeinen Geschäftsbedingungen und die **bekannte** Produkt-/Lizenzlogik aus **`docs/KONZEPT-LIZENZMODELL-HAUPT-NEBENLIZENZEN.md`**. Es dient der **Übersicht**, zum **Ausdrucken**, für **mök2** und zur **Vorbereitung einer anwaltlichen Prüfung**. Maßgeblich für den Nutzer ist die **online angezeigte** Fassung (bei Abweichungen gilt die App).

**Abgrenzung:** Keine Rechtsberatung. Verbindliche Prüfung und ggf. Anpassung durch eine Rechtsanwältin / einen Rechtsanwalt wird empfohlen.

**Marke / Anbieter:** `PRODUCT_BRAND_NAME` = **kgm solution** (siehe `src/config/tenantConfig.ts`).

---

## Gliederung (§ parallel zur App)

| § | Thema |
|---|--------|
| 1 | Geltungsbereich und Vertragspartner |
| 2 | Lizenzmodell: Haupt- und Nebenlizenzen; Mandantentrennung (inkl. K2 Familie eigenständig, Empfehlungs-Programm) |
| 3 | Testphase (2 Wochen kostenlos) und Umgang mit Daten |
| 4 | Leistung und Nutzung |
| 5 | Haftungsausschluss |
| 6 | Datenschutz |
| 7 | Urheberrecht an der Anwendung |
| 8 | Steuern, Buchhaltung und Finanzen |
| 9 | Produktbeschwerden und Mängel |
| 10 | Beendigung der Lizenz durch den Nutzer (Ausstieg) |
| 11 | Änderungen und Beendigung durch den Anbieter |
| 12 | Schlussbestimmungen |

---

## Rechtsstruktur in Kürze

- **Hauptlizenz** = vertraglich klar umrissene Hauptleistung pro Mandant/Instanz (z. B. Galerie-Stufe).  
- **Nebenlizenz** = nur bei **ausdrücklicher** Bestellung (z. B. zusätzlicher Mandant, Zusatznutzer, benanntes Zusatzprodukt).  
- **K2 Familie** = **eigenes** Lizenzprodukt, **ohne** automatische Kopplung an die Galerie-Lizenz (Detail: `K2-FAMILIE-LIZENZMODELL-BRUECKE.md`).  
- **Empfehlungs-Programm** = Transparenz in AGB + Nutzerdokumentation; keine unkontrollierte Selbstempfehlung.  
- **Gerichtsstand / Recht:** Österreich, UN-Kaufrecht ausgeschlossen (wie in §12 der App).

---

## Pflege

- Änderungen an den AGB: **zuerst** `AGBPage.tsx` anpassen, **danach** diese Datei **angleichen** und Verweise im Handbuch (z. B. „AGB §8“ für Steuern/Buchhaltung) prüfen.  
- Verknüpfte Konzeptdoku: **`KONZEPT-LIZENZMODELL-HAUPT-NEBENLIZENZEN.md`**.

---

## Volltext

**Wortgleich** mit `src/pages/AGBPage.tsx` (Stand wie dort im Untertitel). Öffentliche Ansicht: Route **`/agb`**. Zum Drucken: Seite im Browser öffnen und drucken (oder Quelltext aus `AGBPage.tsx` übernehmen).
