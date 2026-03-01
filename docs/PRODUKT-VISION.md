# Produkt-Vision: K2 Galerie → Vermarktbare Version

## Anweisung

**Die persönliche K2 Galerie ist die Basis für eine vermarktbare Version.**

- Alle weiteren Entwicklungen sollen diese Richtung unterstützen.
- K2-spezifische Inhalte (Texte, Namen, eine Galerie) bleiben nutzbar, werden aber schrittweise aus einem konfigurierbaren „Produktkern“ heraus steuerbar.
- Ziel ist eine Version, die sich an **Künstler:innen** (eigene Werke, Ausstellungen, Internetauftritt) lizenzieren oder als Service anbieten lässt.

---

## Zielgruppe (Priorität)

1. **Künstler:innen** – Selbstvermarktung, eigene Werke, eigene Ausstellungen, eigener Webauftritt.
2. **Galerien** – können mitgedacht werden, sind nicht die Hauptzielgruppe.

---

## Zielplattformen (breite Vermarktung)

**Die vermarktbare Version muss auf allen gängigen Plattformen laufen:**

| Plattform | Nutzung | Status |
|-----------|---------|--------|
| **Windows** | Browser (Edge, Chrome, Firefox) + optional „App“ (PWA: Zum Startmenü hinzufügen) | ✅ Web-App ist plattformunabhängig; läuft in jedem modernen Browser. |
| **Android** | Browser (Chrome etc.) + PWA („Zum Home-Bildschirm“) | ✅ Bereits berücksichtigt (Touch, Viewport, Android in User-Agent-Checks). |
| **macOS / iOS** | Browser + PWA | ✅ Wie bisher. |

- **Technik:** React/Vite-Build liefert nur HTML/CSS/JS – keine Mac- oder Windows-spezifische Laufzeit. Einmal bauen, überall im Browser nutzbar.
- **Wichtig für Vermarktung:** Keine Funktion der **produktiven App** (Galerie, Admin, Werke, Events) darf voraussetzen, dass der Nutzer einen Mac hat. Mac-spezifische Schritte (z. B. lokale Skripte, feste Pfade wie `/Users/...`) nur in **Entwickler-/Betreiber-Dokumentation**, nicht in der Kunden-App.
- **Veröffentlichen/Deploy:** Kunden auf Windows/Android sollen z. B. über Vercel/GitHub oder ein bereitgestelltes Hosting arbeiten können, ohne selbst Bash oder Mac-Terminal zu nutzen.

---

## Technische Leitlinie

- **Basis = dieses Projekt (K2 Galerie).** Kein Neuaufbau; bestehende Features (Galerie, Werke, Events, Shop, PWA, Admin, Mobile) sind die Produktfunktionen.
- Beim Erweitern oder Refaktorieren: **Konfiguration statt Festverdrahtung.** Namen, Texte, Logos, Farben, Domain-Idee so vorbereiten, dass sie später pro „Mandant“ oder pro Instanz gesetzt werden können.
- Kein sofortiger Zwang zu Multi-Tenant: Erst **eine Instanz pro Künstler:in** (eigene URL / Subdomain) ist ausreichend; Architektur so wählen, dass später Multi-Tenant möglich bleibt.

---

## Nächste Schritte (Reihenfolge nach Priorität)

1. **Konfiguration zentralisieren**  
   Galerie-Name, Künstler:innen-Namen, Kontakt, Impressum, Farben/Theme an einer Stelle (z. B. Config, Admin-Einstellungen), sodass sie ohne Code-Änderung änderbar sind.

2. **K2-spezifische Texte/Hinweise kennzeichnen**  
   Wo „K2“, „Martina“, „Georg“, feste Adressen etc. stehen → als Konfiguration oder Platzhalter auslagern, damit die gleiche Codebasis für andere Künstler:innen nutzbar ist.

3. **Onboarding / Ersteinrichtung**  
   Ein klarer Ablauf: „Erste Schritte“ (Werke anlegen, Galerie aktivieren, Link teilen) – dokumentiert und wo sinnvoll im UI angeleitet.

4. **Licence- / Preismodell**  
   Bestehende Ideen (z. B. LicenseManager: Basic/Pro) beibehalten und an Zielgruppe „Künstler:innen“ anpassen (z. B. „Bis X Werke“, „Eigene Domain“, „Events“).

5. **Eigener QR-Code pro Licence**  
   **Sobald jemand eine Licence erworben hat, bekommt er einen eigenen QR-Code** – zentral für seine Marketingarbeit (Flyer, Visitenkarte, Social Media, Ausstellung). Der QR führt auf seine Galerie- oder Willkommens-URL (je nach Setup: eigene Subdomain, Pfad oder Instanz). Technisch: Pro Mandant/Licence eine eindeutige öffentliche Basis-URL; QR-Generierung (z. B. in Admin oder nach Aktivierung) nutzt diese URL. Siehe auch `src/config/tenantConfig.ts` (später optional `publicBaseUrl` pro Tenant) und `src/config/navigation.ts` (BASE_APP_URL / pro Mandant).

6. **Rechtliches & Betrieb**  
   Später: AGB, Datenschutz, Hosting-Modell (SaaS vs. Selbst-Hosting), Haftung – für seriöse Vermarktung nötig.

---

## Im Hinterkopf: Skalierung & Kosten

**Viele Nutzer mit eigenen Domains** → Vercel-Kosten werden Thema (Pro-Plan, Bandbreite, Blob, Functions). Derzeit kein Handlungsbedarf; wenn Lizenznehmer und eigene Domains zunehmen: Kosten modellieren, ggf. Pro-Plan oder alternatives Hosting prüfen. (Notiert 01.03.26.)

---

## Parallele Ansicht (jederzeit einsehbar)

- **Route:** `/projects/k2-galerie/produkt-vorschau`
- **Im Dev-View:** Tab „Produkt-Vorschau“ in der Seitenleiste.
- **Funktion:** Du siehst zwei Kacheln – „K2 (deine Galerie)“ und „Licence-Version (Demo)“. Mit „Licence-Version ansehen“ wechselst du in den Demo-Mandanten; die Galerie zeigt dann „Atelier Muster“, „Lisa & Max Muster“. Zurück zu K2 über „Zu K2 wechseln“ oder die Produkt-Vorschau erneut öffnen und K2 wählen.
- **Konfiguration:** `src/config/tenantConfig.ts` – dort sind K2 und Demo definiert; weitere Mandanten können ergänzt werden.
