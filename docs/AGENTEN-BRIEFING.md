# Anke – Briefing – 08.03.26

> Ankes Briefing für Session-Start. Generiert von `npm run briefing`. Stand, Offen, Proaktiv.

---

## Stand (wo wir stehen)

### Datum: 08.03.26 – Admin mit ?tenantId= („Aktives Leben“ zu Ende gebracht)

- **Stand:** Lebenszyklus Klient im Sportwagenmodus durchgezogen: **Admin mit dynamischem Mandanten** umgesetzt.
- **Was zuletzt gemacht:** (1) **TenantContext:** `?tenantId=` aus URL (nur /admin), sichere ID (a-z0-9-, 1–64 Zeichen, nicht k2/oeffentlich/vk2) → `dynamicTenantId`. (2) **Admin:** Bei `tenant.dynamicTenantId`: Daten **nur** von API laden (`api/gallery-data?tenantId=`) und in State übernehmen; **Speichern** nur über „Veröffentlichen“ → `api/write-gallery-data` mit `body.tenantId`; kein localStorage für Werke/Stammdaten/Design/Events/Dokumente; Ladebanner + Hinweis „Änderungen mit Veröffentlichen speichern“; „Vom Server laden“ lädt für dynamischen Mandanten neu von API. (3) **saveArtworks:** Bei dynamicTenantId No-Op (nur State, kein Schreiben in Keys). Build ✅, Tests 42/42.
- **Nächster Schritt:** Commit + Push. Optional: Erfolgsseite-Link „Admin“ mit `?tenantId=…` testen (Kunde klickt → Admin öffnet seine Galerie, lädt/speichert über API).
- **Wo nachlesen:** src/context/TenantContext.tsx (dynamicTenantId); ScreenshotExportAdmin (Laden/Speichern/Export bei dynamicTenantId); docs/K2-OEK2-DATENTRENNUNG.md.

---

## Offen (vom Grafiker-Tisch / DIALOG)

- **ök2 – User reinziehen:** Konzept: docs/OEK2-USER-REINZIEHEN-KONZEPT.md. **Bereits umgesetzt:** leere Stammdaten ök2, Mein-Bereich, Einstieg, Erste-Aktion-Banner; **eine Person/eine Adresse (Person-2 ausblenden)** – von Georg mehrfach als erledigt bestätigt. Optional noch: Texte kürzen. (05.03.26, Stand 06.03.26)
- **Profi-Tests (nur bei Skalierung):** Sportwagen-Tests sind erledigt (38 Tests, Merge/Persistenz/Datentrennung; siehe SPORTWAGEN-ROADMAP, PRODUKT-STANDARD-NACH-SPORTWAGEN). Dieser Punkt gilt **erst**, wenn erste **externe** Kunden/Lizenznehmer dazukommen: dann Test-Set ausbauen (z. B. E-Mail bei Fehler, Backup-Tests, Handy-Tests) und Georg daran erinnern. (notiert 23.02.26, präzisiert 02.03.26)

---

## Nächster Schritt (Hauptaufgabe für Anke)

- **Marketing-Strategie erarbeiten.** Quelle: **docs/AUFTRAG-MARKETING-STRATEGIE-ZWEI-ZWEIGE.md**. Daraus die Strategie erarbeiten – **Zweig 1: K2 Galerie** (weltweit, automatisierter Vertrieb), **Zweig 2: K2 Familie** (eigener Planungszweig, Raumschiff, Grundbotschaft, Datensouveränität). Output: z. B. **MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md** mit beiden Zweigen, oder separate Datei für den K2-Familie-Zweig. Auftrag ernst nehmen, direkt umsetzen.

---

## Proaktiv (Vorschläge)

- **Optional:** Grafiker-Tisch hat optionale Punkte (z. B. Texte kürzen) – nur wenn du dran willst.

---

## Ankes Prinzipien (verbindlich)

- **Sportwagenprinzip (überall):** Eine Quelle, ein Standard, ein Ablauf pro Problemstellung. Kein „pro Modal anders“. Quelle: SPORTWAGEN-ROADMAP, PRODUKT-STANDARD-NACH-SPORTWAGEN.
- **Raumschiffprinzip (K2 Familie):** Qualität vor Abheben; nicht starten, bevor startklar. Qualitätsansprüche um ein Vielfaches höher. Quelle: K2-FAMILIE-GRUNDBOTSCHAFT.md (Raumschiff-Anspruch).

---

## Georgs Präferenzen (Kurzreferenz)

- Kurz antworten, sofort handeln, Erledigtes abhaken.
- Keine langen Texte; kein „fertig“ ohne Commit.
- Bei „ro“ / Session-Start: DIALOG-STAND + dieses Briefing lesen, dann weitermachen.

---

*Mehr: docs/AGENT-KONZEPT.md – Abschnitt „So arbeitest du mit Anke (für Georg)“.*
