# K2 vs. ök2 – strikte Datentrennung

**Stand:** 16.02.26

## Warum diese Trennung

- **K2** = deine echte Galerie (Martina & Georg, echte Werke, Stammdaten).
- **ök2** = öffentliche Demo (Musterwerke, Mustertexte).

Arbeiten in der ök2 (Admin von der Willkommensseite „Galerie öffentlich“) darf **niemals** K2-Daten lesen oder überschreiben. Dafür gibt es getrennte Speicher-Keys.

## Technische Umsetzung

- **Admin-Kontext:**  
  Wenn du den Admin von der **ök2-Willkommensseite** aus öffnest (`/admin?context=oeffentlich`), läuft der Admin im **ök2-Kontext**.  
  Wenn du den Admin von der **K2-Galerie** aus öffnest, läuft er im **K2-Kontext**.

- **Getrennte localStorage-Keys:**

  | Daten              | K2 (echte Galerie)      | ök2 (Demo)                        |
  |--------------------|-------------------------|-----------------------------------|
  | Werke              | `k2-artworks`           | `k2-oeffentlich-artworks`         |
  | Events             | `k2-events`             | `k2-oeffentlich-events`           |
  | Dokumente          | `k2-documents`          | `k2-oeffentlich-documents`        |
  | Stammdaten         | `k2-stammdaten-*`       | in ök2 nicht geschrieben          |
  | **Seitentexte**    | `k2-page-texts`        | `k2-oeffentlich-page-texts`       |
  | **Seitengestaltung** | `k2-page-content-galerie` | `k2-oeffentlich-page-content-galerie` |
  | **Design**         | `k2-design-settings`    | `k2-oeffentlich-design-settings`  |

  **Wichtig:** Auf der ök2-Galerie (QR / galerie-oeffentlich) müssen Texte und Bilder aus den **ök2-Keys** kommen. In GaleriePage/GalerieVorschauPage daher immer `getPageTexts(musterOnly ? 'oeffentlich' : undefined)` und `getPageContentGalerie(musterOnly ? 'oeffentlich' : undefined)` verwenden – nie ohne Tenant, sonst erscheinen K2-Inhalte auf der ök2-Seite (Vermischung).

- **Im ök2-Admin:**
  - Es wird **nie** in `k2-artworks`, `k2-events`, `k2-documents` oder Stammdaten geschrieben.
  - Auto-Save läuft **nur** im K2-Admin, nicht im ök2-Admin.
  - „Sync vom Server“ und „Veröffentlichen“ sind nur in der K2-Galerie verfügbar (Hinweis im Admin).

- **Ök2-Werke:**  
  Wenn unter `k2-oeffentlich-artworks` noch nichts liegt, zeigt der ök2-Admin die **Musterwerke** aus der Konfiguration (z. B. „Musterwerk Bilder 1/2“, „Musterwerk Skulptur 1/2“).

- **Shop: „Zur Galerie“ und Kontakt (Telefon/E-Mail)**  
  Im Shop entscheidet **fromOeffentlich** über Link und Kontakt. **fromOeffentlich** wird aus **vier Quellen** abgeleitet (robust gegen State-Verlust):
  1. `location.state.fromOeffentlich === true`
  2. `sessionStorage['k2-shop-from-oeffentlich'] === '1'`
  3. `sessionStorage['k2-admin-context'] === 'oeffentlich'` (ök2-Kassa)
  4. `document.referrer` enthält `galerie-oeffentlich`  
  Wenn **fromOeffentlich** true: „Zur Galerie“ → `galerie-oeffentlich-vorschau`, Kontakt aus **MUSTER_TEXTE.gallery**. Sonst: K2-Galerie-Vorschau, Kontakt aus Stammdaten (k2-stammdaten-galerie).  
  **Admin „Kasse“-Link:** muss `state={{ openAsKasse: true, fromOeffentlich: isOeffentlichAdminContext() || undefined }}` übergeben, damit ök2-Kassa den richtigen Kontext setzt.

- **Admin: alle Galerie-/Vorschau-Links**  
  Jeder Link zur Galerie oder zur Vorschau („Zur Galerie“, „Seite 2 anzeigen“, „So sehen Kunden die Galerie“) muss **im ök2-Admin** auf `galerieOeffentlich` / `galerieOeffentlichVorschau` zeigen, **im K2-Admin** auf `galerie` / `galerieVorschau`. Immer `isOeffentlichAdminContext()` prüfen.

## Wenn K2-Daten einmal weg waren

Falls durch einen früheren Fehler K2-Daten überschrieben wurden:

1. **Einstellungen** in der App öffnen (K2-Galerie, nicht ök2).
2. **Backup & Wiederherstellung** → **„Aus letztem Backup wiederherstellen“**.  
   Das nutzt das automatische Vollbackup (alle 5 Sekunden), sofern vorhanden.

Danach: Nur noch in der **K2-Galerie** arbeiten, wenn du echte Daten änderst. In der **ök2** nur Demo-Anpassungen vornehmen – dann bleiben K2-Daten unberührt.

---

## ök2 funktionssicher machen (Checkliste für neue Änderungen)

- [ ] **Laden:** Wird `musterOnly` / `tenantId === 'oeffentlich'` beim Laden von Werken, Stammdaten, **Seitentexten** (`getPageTexts(tenantId)`) und **Seitengestaltung** (`getPageContentGalerie(tenantId)`) berücksichtigt? Nie `getPageTexts()` oder `getPageContentGalerie()` ohne Tenant auf ök2-Routen.
- [ ] **Schreiben:** Schreibt der Code im ök2-Kontext nur in `k2-oeffentlich-*` (inkl. page-texts, page-content-galerie, design-settings), nie in K2-Keys?
- [ ] **Shop:** „Zur Galerie“ und Kontakt (displayPhone/displayEmail) immer aus **fromOeffentlich** (alle vier Quellen). Kasse-Link aus Admin mit `fromOeffentlich: isOeffentlichAdminContext()`.
- [ ] **Admin:** Jeder Link zu Galerie/Vorschau prüft `isOeffentlichAdminContext()` und nutzt dann galerieOeffentlich/galerieOeffentlichVorschau, sonst galerie/galerieVorschau.
- [ ] Auto-Save / Veröffentlichen: Nur im K2-Admin, im ök2-Admin deaktiviert oder mit Hinweis.
- [ ] **ök2 Willkommensbild:** Anzeige immer über `getOek2WelcomeImageEffective()` (GaleriePage). Default = stabile Unsplash-URL in `OEK2_WILLKOMMEN_IMAGES.welcomeImage`. Pfade in `OEK2_LEGACY_WELCOME_IMAGE_PATHS` werden nie angezeigt – so können alte/irrelevante Repo-Dateien nicht mehr als Default erscheinen.
- [ ] Regel in jeder Session: `.cursor/rules/k2-oek2-trennung.mdc` (alwaysApply) – bei Änderungen an Galerie/Admin/Stammdaten/Seitentexten/Shop prüfen.

---

## Gleicher Standard K2 / ök2 / VK2 (Upload & dauerhafte URLs)

**Regel:** Standardsachen gelten für K2, ök2 und VK2. Ein Ablauf, nur Kontext/Subfolder unterschiedlich.

**Seitengestaltung (Design) – geprüft 08.03.26:**

| Element | K2 | VK2 | ök2 | Anmerkung |
|--------|----|-----|-----|-----------|
| Willkommensbild | Upload, context k2 | Upload, context vk2→k2 | Upload, context oeffentlich | Beim Speichern (Schritt 3) und bei „Bild übernehmen“; überall gleicher Ablauf. |
| Galerie-Karte / Virtual-Tour-Bild | Upload, URL in State | wie K2 | Upload, Subfolder oeffentlich | uploadPageImageToGitHub mit context, danach URL in State/localStorage. |
| Virtual-Tour-**Video** | Upload, Subfolder k2 | Upload, Subfolder k2 | Upload, Subfolder oeffentlich | War früher nur K2/VK2; seit 08.03.26 auch ök2 (blob→dauerhafte URL), sonst verschwindet Video. |

**Versteckte Räume:** Systematische Prüfung 08.03.26 – keine weiteren Stellen gefunden, an denen nur K2/VK2 Upload/dauerhafte URL haben und ök2 ausgenommen war. Bei neuen Upload- oder „blob→URL“-Abläufen: von vornherein für alle drei Kontexte mit passendem Subfolder (k2 / oeffentlich) umsetzen.

---

## ök2 Skalierung – Laden vom Server (08.03.26)

**Ziel:** ök2 ist das Produkt, das open-end skalieren soll. Veröffentlichte Demo-Daten müssen überall sichtbar sein (nicht nur auf dem Gerät, das veröffentlicht hat).

**Umsetzung:**

- **GaleriePage** lädt bei **musterOnly** (ök2) nun ebenfalls vom Server: `GET /api/gallery-data?tenantId=oeffentlich`. Die Antwort wird in **ök2-Keys** geschrieben (`k2-oeffentlich-artworks`, `k2-oeffentlich-events`, `k2-oeffentlich-documents`, `k2-oeffentlich-design-settings`, `k2-oeffentlich-page-texts`, `k2-oeffentlich-page-content-galerie`, Stammdaten über `saveStammdaten('oeffentlich', …)`).
- **Schutzregeln wie K2:** Kein Überschreiben mit leerer Server-Liste; 50%-Regel bei Werken; Merge mit `mergeServerWithLocal` / `preserveLocalImageData`; `allowReduce: false` beim Speichern der Werke.
- **Events:** Nur anwenden wenn `data.events.length > 0`; analog Dokumente.
- **UI-Update:** Nach Anwendung werden `artworks-updated`, `k2-page-content-updated`, `k2-oeffentlich-images-updated` dispatched, damit Anzeige und Vorschau aktualisieren.

**Prüfliste ök2-Skalierung (bei Änderungen):**

- [ ] GaleriePage: Bei musterOnly wird `/api/gallery-data?tenantId=oeffentlich` aufgerufen (eigener useEffect), nicht sofort `return`.
- [ ] API: `api/gallery-data.js` und `api/write-gallery-data.js` unterstützen `tenantId=oeffentlich` (Blob-Pfad `gallery-data-oeffentlich.json`).
- [ ] publishMobile (Admin): Schreibt für ök2 mit `tenantId: 'oeffentlich'` in Blob; gleicher Ablauf wie K2, nur anderer Tenant.
- [ ] Keine K2-Daten in ök2-Keys; keine ök2-Daten in K2-Keys.

---

## VK2 Skalierung – Laden vom Server (wie ök2)

**Gleiches Prinzip wie ök2:** Veröffentlichte VK2-Daten (Verein, Mitglieder, Events, Dokumente, Design) müssen überall sichtbar sein.

**Umsetzung:**

- **GaleriePage** lädt bei **vk2** vom Server: `GET /api/gallery-data?tenantId=vk2`. Die Antwort nutzt das Backup-Format (Keys: `k2-vk2-stammdaten`, `k2-vk2-events`, `k2-vk2-documents`, `k2-vk2-design-settings`, `k2-vk2-page-texts`, `k2-vk2-page-content-galerie`, `k2-vk2-registrierung`). Diese werden in die entsprechenden localStorage-Keys geschrieben; Events/Dokumente über `saveEvents('vk2', …)` / `saveDocuments('vk2', …)`; Seitengestaltung über `mergePageContentGalerieFromServer(…, 'vk2')`.
- **VK2 hat keine Werke** (kein `k2-vk2-artworks`); nur Stammdaten, Events, Dokumente, Design, Seitentexte, Seitengestaltung.
- **UI-Update:** Nach Anwendung werden `k2-page-content-updated`, `k2-vk2-stammdaten-updated`, `k2-vk2-data-updated` dispatched (Stammdaten- und eventDocuments-Listener aktualisieren State).

**Prüfliste VK2-Skalierung:**

- [ ] GaleriePage: Bei vk2 wird `/api/gallery-data?tenantId=vk2` aufgerufen (eigener useEffect).
- [ ] API: `tenantId=vk2` → Blob `gallery-data-vk2.json`.
- [ ] publishMobile (Admin): VK2 nutzt `createVk2Backup()` und sendet mit `tenantId: 'vk2'` an write-gallery-data.

---

## Technische Bereitschaft für endlose Skalierung (ök2 & VK2)

**Kurzantwort: Ja – für die aktuelle Produktdefinition (eine ök2-Demo, ein VK2-Verein) sind beide technisch bereit.** Jeder Besucher bekommt dieselben veröffentlichten Daten vom Server; Veröffentlichen funktioniert mandantenfähig.

| Kriterium | ök2 | VK2 |
|----------|-----|-----|
| **Laden vom Server** | ✅ GaleriePage fetcht `?tenantId=oeffentlich`, schreibt in `k2-oeffentlich-*` | ✅ GaleriePage fetcht `?tenantId=vk2`, schreibt in `k2-vk2-*` |
| **Veröffentlichen** | ✅ publishMobile → write-gallery-data → Blob `gallery-data-oeffentlich.json` | ✅ createVk2Backup → write-gallery-data → Blob `gallery-data-vk2.json` |
| **Eine Quelle der Wahrheit** | ✅ Vercel Blob, kein Abhängigkeit von lokalem Gerät | ✅ wie ök2 |
| **Skalierung Besucher** | ✅ Beliebig viele Besucher laden denselben Blob | ✅ wie ök2 |

**Bekannte Grenzen (nicht blockierend für „endlos“ im Sinne vieler Besucher):**

1. **Mandantenanzahl heute:** Es gibt genau einen ök2- und einen VK2-Blob (`ALLOWED_TENANTS = ['k2','oeffentlich','vk2']`). Für **viele unabhängige Galerien/Vereine** (viele Mandanten) müsste die API um dynamische `tenantId`s ergänzt werden (z. B. `getBlobPath(tenantId)` → `gallery-data-${tenantId}.json`); Architektur (tenantId überall) ist dafür vorbereitet (vgl. TENANT-SYNC-DOMAIN.md).
2. **Payload-Größe:** write-gallery-data begrenzt den Body auf 6 MB. Sehr große Galerien (sehr viele Werke/Bilder im Payload) könnten daran stoßen; dann wären Chunking oder Auslagerung großer Assets nötig.
3. **Vercel-Limits:** Serverless-Invocation- und Blob-Limits des Vercel-Plans gelten; für typische Besucherzahlen unkritisch.

**Fazit:** Für „endlos viele Besucher“ und „überall gleicher Stand“ sind ök2 und VK2 technisch bereit. Für „endlos viele Mandanten“ (viele ök2-Instanzen / viele Vereine) ist die Architektur vorbereitet; die API müsste um dynamische Tenant-IDs erweitert werden.

---

## Viele K2-Mandanten – nur mehr Speicher (API-Erweiterung)

**K2 als Mandant** macht den Großteil der Mandanten aus. Die Mandantenzahl wird **nur durch Speicher** begrenzt, nicht durch eine feste Obergrenze in der API.

**Umgesetzt (API):**

- **gallery-data.js** und **write-gallery-data.js** akzeptieren neben `k2`, `oeffentlich`, `vk2` beliebige **sichere** `tenantId`s: Kleinbuchstaben, Ziffern, Bindestrich, 1–64 Zeichen (z. B. `mandant-xyz`, `galerie-eferding`). Path-Traversal wird ausgeschlossen.
- Blob-Pfad: `tenantId === 'k2'` → `gallery-data.json` (Abwärtskompatibilität); sonst → `gallery-data-${tenantId}.json`.
- **Ein Blob pro Mandant**; gleiches Datenformat wie K2 (artworks, events, documents, stammdaten, design, …).

**Wie viele Mandanten sind möglich?**

- **Vercel Blob** hat keine dokumentierte Obergrenze für die **Anzahl** Objekte; begrenzend ist der **Speicher** (GB pro Monat).
- Grobe Orientierung: durchschnittlich ~0,5–2 MB pro gallery-data-Blob (je nach Werken/Bildern) → **1 GB Speicher ≈ 500–2000 Mandanten**, 10 GB ≈ 5000–20 000. Genau hängt vom Vercel-Plan und der tatsächlichen Blob-Größe ab.

**Frontend/Routing:** Damit ein neuer Mandant genutzt wird, muss die App den `tenantId` kennen (z. B. aus Subdomain, Pfad oder Konfiguration). Das Routing und die Kontext-Herkunft (wer bin ich?) sind wie in TENANT-SYNC-DOMAIN.md vorbereitet; für viele K2-Mandanten muss pro Deployment/Instanz oder pro URL der passende `tenantId` gesetzt werden.

---

## Speicher: Was wir haben & was wir brauchen

**Aktuellen Stand prüfen („was haben wir?“):**

- **Vercel Dashboard** → Projekt **k2-galerie** (bzw. euer Team) → **Storage** → **Blob**  
  Dort siehst du den **verbrauchten Blob-Speicher** (z. B. in MB/GB) und die gespeicherten Dateien (z. B. `gallery-data.json`, `gallery-data-oeffentlich.json`, `gallery-data-vk2.json`).
- Optional: **Observability** → Tab **Blob** für Nutzung, Transfers, Operationen.
- **Abrechnung:** Vercel → **Billing** zeigt Verbrauch und Kosten (Blob wird nach GB-Monat + Operationen berechnet).

**Was K2 aktuell braucht („was brauchen wir?“):** siehe Tabelle unten. Bei mehr Mandanten: siehe Abschnitt **„Überschlagsrechnung: Wie viele Mandanten wären möglich?“** – dann zählt vor allem der Blob-Speicher.

---

## Wieviel Speicher benötigt K2 (aktuell)

Überblick, wo Speicher anfällt:

| Bereich | Was | Typische Größe |
|--------|-----|-----------------|
| **Vercel Blob** | gallery-data.json (K2), gallery-data-oeffentlich.json, gallery-data-vk2.json | **Pro Blob:** ~60 KB bis ~1,5 MB (je nach Werken/Bildern im JSON). Max 6 MB pro Blob (API-Limit). **Zusammen** oft **unter 5 MB** für alle drei. |
| **Vercel Deployment** | Build (dist/ + Serverless-Funktionen) | **~50–120 MB** pro Deployment (z. B. dist lokal ~117 MB). |
| **GitHub Repo** | Code + public (z. B. public/img für /img/k2/) | **Code:** wenige MB. **public/img:** z. B. ~25 MB wenn viele Bilder versioniert. Backup-Dateien (*.backup) sind per .gitignore ausgeschlossen. |
| **Supabase** (falls genutzt) | Visits, ggf. weitere Tabellen | Eigenes Kontingent des Supabase-Plans. |

**Kurz:** Für den **Betrieb auf Vercel** zählen vor allem **Blob** (wenige MB für K2/ök2/VK2) und **Deployment** (Größenordnung ~100 MB). Der **Gesamt-Speicherbedarf von K2** liegt damit typisch im unteren **dreistelligen MB-Bereich** (Blob + ein Deployment); viele Mandanten erhöhen vor allem den Blob-Speicher (ein Blob pro Mandant).

---

## Überschlagsrechnung: Wie viele Mandanten wären möglich?

**Annahme:** Ein Mandant = ein Blob `gallery-data-{tenantId}.json`. Größe pro Blob typisch **0,5–2 MB** (wenige Werke/Bilder → kleiner, viele Werke oder viele Base64-Bilder → größer, max. 6 MB).

**Formel:**  
**Anzahl Mandanten ≈ verfügbarer Blob-Speicher (GB) ÷ durchschnittliche Blob-Größe (GB)**

| Blob-Speicher (Vercel) | ~1 MB pro Mandant | ~2 MB pro Mandant |
|------------------------|--------------------|--------------------|
| **1 GB**               | **~1 000** Mandanten | **~500** Mandanten |
| **5 GB**               | **~5 000** Mandanten | **~2 500** Mandanten |
| **10 GB**              | **~10 000** Mandanten | **~5 000** Mandanten |
| **50 GB**              | **~50 000** Mandanten | **~25 000** Mandanten |

Die **Deployment-Größe** (~100 MB) und der **Code** wachsen nicht mit der Mandantenzahl; nur die Blob-Anzahl und der Blob-Speicher. Vercel Blob wird nach tatsächlicher Nutzung (GB-Monat) abgerechnet; die Tabelle dient der groben Einordnung, wie viele K2-artige Mandanten bei welchem Speicher möglich wären.

---

## Was braucht die Host-Organisation für viele neue Klienten?

Die **Host-Organisation** (Betreiber der Plattform) hostet die App für viele Klienten/Mandanten. Pro Klient kommt **kein** eigenes Deployment dazu – alle nutzen dieselbe App, derselbe Vercel-Build.

| Was | Braucht die Host-Org |
|-----|----------------------|
| **Blob-Speicher** | Pro neuer Klient **ein Blob** (~0,5–2 MB typisch). Siehe Überschlagsrechnung oben: z. B. 1 GB → ~500–1 000 Klienten. Vercel nach Nutzung (GB-Monat) abrechnen. |
| **Vercel-Plan** | Ein Projekt/Team mit ausreichend **Serverless-Invocations** und **Bandwidth** für den **gesamten** Traffic (alle Klienten-Galerien zusammen). Deployment-Größe bleibt ~100 MB. |
| **Zuordnung Klient → Mandant** | Pro Klient eine **tenantId** (z. B. `galerie-müller`, `eferding`). Herkunft: später Subdomain, Pfad oder Konfiguration (TENANT-SYNC-DOMAIN.md). Host muss tenantId bei Onboarding vergeben und in App/Config oder URL abbilden. |
| **Schreibzugriff (optional)** | Heute: Client sendet tenantId mit. **Später:** Auth pro Mandant, damit nur der berechtigte Klient seine Daten schreibt (TENANT-SYNC-DOMAIN.md, Sicherheit). |
| **Abrechnung/Billing** | Vercel-Rechnung geht an die Host-Org. Host abrechnet Klienten nach eigenem Modell (Lizenz, Speicher, etc.). |

**Kurz:** Host braucht **genug Blob + genug Vercel-Kapazität für den Gesamt-Traffic** und eine **klare Regel, welcher Klient welche tenantId hat**. Kein separates „System“ pro Klient – nur mehr Speicher und klare Mandanten-Zuordnung.

---

## Was läuft automatisch – was müssen wir organisieren?

**Ziel:** So viel wie möglich automatisch; nur das Nötige organisieren.

### Läuft schon automatisch (für K2, ök2, VK2)

| Ablauf | Automatisch |
|--------|-------------|
| **Veröffentlichen** | Klient tippt „Veröffentlichen“ → App sendet Daten mit seinem tenantId → API schreibt in Blob `gallery-data-{tenantId}.json`. Kein manueller Schritt der Host-Org. |
| **Laden vom Server** | Besucher öffnet Galerie → App ruft `?tenantId=…` auf → API liefert Blob → Anzeige. Für ök2 und VK2 ist das in der App eingebaut (GaleriePage lädt bei musterOnly/vk2). |
| **Speicher** | Pro Mandant ein Blob; Vercel speichert und rechnet ab. Kein manuelles Anlegen pro Klient. |
| **Einer App für alle** | Ein Deployment, eine Codebasis. Kein neues Projekt pro Klient. |

### Muss organisiert werden (heute noch nicht automatisch)

| Thema | Was die Host-Org braucht |
|-------|--------------------------|
| **Neuer Klient → tenantId** | Jeder neue Klient braucht eine **tenantId** (z. B. `galerie-müller`). Host vergibt sie beim Onboarding und trägt sie z. B. in eine Liste/Config oder später in eine Datenbank. Ohne diese Zuordnung „Klient ↔ tenantId“ weiß die App nicht, welcher Blob zu wem gehört. |
| **Wie kommt der Klient in „seine“ Galerie?** | Die App muss den **tenantId** kennen (aus URL, Subdomain oder Konfiguration). **Heute:** K2/ök2/VK2 über feste Routen und `?context=oeffentlich` / `context=vk2`. **Für viele Klienten:** Noch zu bauen, z. B. Subdomain `galerie-müller.k2-galerie.vercel.app` oder Pfad `/g/müller` → App liest tenantId daraus und lädt/speichert nur diesen Mandanten. Architektur (tenantId überall) ist vorbereitet; die **eine Quelle** (Subdomain/Pfad/Config) pro Klient muss festgelegt und eingebaut werden. |
| **Zugang Admin (optional)** | Wer darf für Mandant X veröffentlichen? Heute: Kontext aus Aufruf (z. B. von ök2-Seite → ök2-Admin). Für viele Klienten: später Auth (Login pro Klient oder pro tenantId), damit Schreibzugriff nur für Berechtigte. |

### Kurzfassung

- **Technisch automatisch:** Speichern, Laden, Blob pro Mandant, eine App für alle. Sobald die App den **tenantId** kennt, läuft der Rest ohne manuelle Host-Eingriffe.
- **Organisatorisch nötig:** (1) **tenantId pro Klient vergeben** und festhalten, (2) **App so erweitern, dass tenantId aus URL/Subdomain/Pfad kommt** (dann öffnet Klient „seine“ URL und alles andere läuft automatisch). Optional (3) Auth pro Mandant.
- **Zielzustand:** Klient bekommt einmalig eine URL (oder Subdomain) und Zugang → danach Veröffentlichen, Laden, Speicher laufen automatisch; Host muss nur noch Kapazität (Blob, Vercel) und ggf. Abrechnung im Blick behalten.

---

## Mit der Registrierung erhält er automatisch eine URL zugeordnet (Ziel)

**Ja – so soll es sein.** Mit der Registrierung bzw. dem Lizenz-Abschluss erhält der Klient **automatisch** eine URL, die seinem Mandanten (tenantId) zugeordnet ist. Kein manuelles Zuteilen durch die Host-Org.

**Zielablauf:**

1. Klient schließt Registrierung/Lizenz ab (z. B. Stripe Checkout, oder Anmeldung über Entdecken/ök2).
2. System vergibt **automatisch** eine **tenantId** (z. B. aus E-Mail-Slug, Zufalls-ID oder fortlaufender Nummer) und speichert sie (z. B. in Supabase oder in der Lizenz-Zeile).
3. Die **URL** des Klienten ist fest definiert, z. B.:
   - **Subdomain:** `galerie-müller.k2-galerie.vercel.app` (tenantId = `galerie-müller`), oder
   - **Pfad:** `k2-galerie.vercel.app/g/müller` (tenantId aus Pfad).
4. Klient erhält nach Abschluss **eine E-Mail oder Erfolgsseite** mit **seiner persönlichen URL** (und ggf. Admin-Link). Beim Aufruf dieser URL kennt die App den tenantId (aus Subdomain/Pfad) → Laden/Speichern laufen automatisch für diesen Mandanten.

**Was dafür noch nötig ist (technisch):**

- Beim **Checkout/Registrierung** (z. B. im Stripe-Webhook oder in der Anmelde-Logik): tenantId erzeugen, speichern, mit Lizenz/Konto verknüpfen.
- **App:** tenantId aus **URL** lesen (Subdomain oder Pfad), nicht nur aus festen Routen (k2/oeffentlich/vk2). Eine definierte Quelle, z. B. `getTenantIdFromRequest()` → Subdomain oder Pfad parsen.
- **Zustellung der URL an den Klienten:** Erfolgsseite nach Checkout oder E-Mail mit Link („Deine Galerie: https://…“).

**Kurz:** Registrierung/Lizenz → System vergibt tenantId → URL ist daraus abgeleitet (Subdomain/Pfad) → Klient bekommt diese URL mitgeteilt. Danach läuft alles automatisch; die Host-Org muss nichts mehr manuell zuordnen.

**URL in Stammdaten, ein Link, ein QR:**

Die **persönliche Galerie-URL** des Lizenznehmers soll in **seinen Stammdaten** abgespeichert sein (z. B. in den Galerie-Stammdaten als Feld „Galerie-URL“ / `publicBaseUrl` oder `galerieUrl`). So gilt:

- **Eine Quelle:** Die URL steht in den Stammdaten des Mandanten (sichtbar/bearbeitbar im Admin unter Stammdaten).
- **Als Link:** Überall, wo „Link zur Galerie“ oder „Deine Galerie“ gebraucht wird (Flyer, E-Mail, Erfolgsseite), wird diese URL aus den Stammdaten verwendet.
- **QR-Code:** Der **QR-Code** wird aus genau dieser URL generiert (z. B. `buildQrUrlWithBust(stammdatenGalerie.galerieUrl, qrVersionTs)` wie heute schon mit `publicBaseUrl` in tenantConfig). Scan → Besucher landet auf der Galerie-URL des Lizenznehmers.

Technisch ist das bereits vorbereitet: In `tenantConfig.ts` gibt es **publicBaseUrl** („Optionale öffentliche Basis-URL für diesen Mandanten … eigener QR-Code und Links für Marketing nutzen diese URL“). Für viele Mandanten: diese URL beim Registrierung/Checkout setzen und in den Stammdaten des Mandanten (oder in der Tenant-Config) speichern, dann nutzen alle bestehenden QR- und Link-Bausteine genau diese URL.

---

## Bei Kündigung wird automatisch alles gelöscht (Ziel)

**Ja – so soll es sein.** Wenn der Lizenznehmer kündigt, wird **automatisch** alles, was zu seinem Mandanten gehört, entfernt. Kein manuelles Aufräumen durch die Host-Org.

**Zielablauf:**

1. Kündigung wird ausgelöst (z. B. Stripe-Abo gekündigt, Webhook `customer.subscription.deleted`, oder „Lizenz beenden“ im Admin).
2. System **löscht automatisch:**
   - **Blob:** `gallery-data-{tenantId}.json` im Vercel Blob (Daten der Galerie dieses Mandanten).
   - **Zuordnung tenantId/URL:** Eintrag für diesen Mandanten (z. B. in Config/DB) entfernen oder auf „gekündigt“ setzen, sodass die URL nicht mehr auf seine Galerie führt (z. B. Redirect auf „Lizenz beendet“ oder 404).
   - Optional: Lizenz-Zeile in Supabase auf `status = cancelled` setzen; Stammdaten/Lizenz-Daten des Mandanten löschen oder anonymisieren (je nach Aufbewahrungspflichten).
3. **URL des Ex-Mandanten:** Beim Aufruf seiner alten URL → keine Galerie-Daten mehr (Blob weg), stattdessen Hinweis „Lizenz beendet“ oder Umleitung. QR-Code führt ins Leere bzw. auf Hinweis-Seite.

**Umsetzung (Stand):**

- **api/delete-tenant-data.js:** Löscht Blob `gallery-data-{tenantId}.json`. Nur mit `TENANT_DELETE_SECRET` aufrufbar. K2 wird nie gelöscht (tenantId === 'k2' → 400).
- **api/cancel-subscription.js:** Erfasst Feedback (grund, verbesserung) und löscht bei mitgesendetem **tenantId** (oeffentlich, vk2 oder sicherer Custom-Mandant) den Blob direkt per `@vercel/blob` `del(pathname)`.
- **Frontend:** Beim Klick „Lizenz beenden“ (ök2/VK2) wird **tenantId** mitgesendet → nach Bestätigung wird der Blob gelöscht.
- **api/webhook-stripe.js:** Bei Event **customer.subscription.deleted** wird `metadata.tenantId` aus der Subscription gelesen und **api/delete-tenant-data** (mit TENANT_DELETE_SECRET) aufgerufen. Für Abo-Kündigungen über Stripe: bei Anlage der Subscription `metadata.tenantId` setzen.

**Noch offen (optional):**

- **Zuordnung tenantId/URL** nach Löschung: Eintrag in Config/DB auf „gekündigt“ setzen, damit die URL auf „Lizenz beendet“-Seite führt (aktuell: Blob weg → API liefert 404).
- **Supabase:** Lizenz-Zeile auf `status = cancelled` setzen (bei Webhook oder in cancel-subscription).
- **Rechtlich/Aufbewahrung:** Ggf. Aufbewahrungsfrist vor endgültiger Löschung („soft delete“).

**Kurz:** Kündigung („Lizenz beenden“ oder Stripe subscription.deleted) → Blob wird gelöscht. Host-Org muss nichts manuell löschen.

---

## Lebenszyklus Klient – Sportwagen-Check (Geburt → aktives Leben → Sterben)

**Frage:** Ist der gesamte Prozess von der „Geburt“ (aktiver Klient wird) bis zum „Sterben“ (Kündigung) sportwagenkonform **ein Standard, durchgängig automatisiert**?

| Phase | Status | Was läuft automatisch | Was fehlt noch (für echte Sportwagen-Automatik) |
|-------|--------|------------------------|--------------------------------------------------|
| **Geburt** (Registrierung → aktiver Klient) | ✅ Umgesetzt | Checkout erzeugt **tenantId** (api/create-checkout.js), Webhook schreibt Lizenz inkl. **tenant_id** und **galerie_url** (api/webhook-stripe.js). Erfolgsseite lädt Lizenz per **api/get-licence-by-session** und zeigt „Deine Galerie“- und „Admin“-Links. Route **/g/:tenantId** (GalerieTenantPage) zeigt die Galerie oder „Jetzt gestalten“. | **Supabase:** Migration **007_licences_tenant_id_galerie_url.sql** einmal ausführen (Spalten tenant_id, galerie_url). Admin mit ?tenantId= (Laden/Speichern für dynamischen Mandanten) optionaler nächster Schritt. |
| **Aktives Leben** (Nutzen, Veröffentlichen, Laden) | ✅ Umgesetzt | Ein Standard: write-gallery-data(tenantId), gallery-data?tenantId=, ein Blob pro Mandant. **Admin mit ?tenantId=** (08.03.26): Lädt/Speichert nur über API (kein localStorage); Erfolgsseite-Link „Admin“ mit tenantId → Kunde bearbeitet seine Galerie. | – |
| **Sterben** (Kündigung) | ✅ Sportwagenkonform | **Ein Ablauf:** „Lizenz beenden“ (Frontend mit tenantId) oder Stripe subscription.deleted → cancel-subscription bzw. webhook ruft Löschlogik auf → delete-tenant-data / Blob del() → Blob weg. K2 wird nie gelöscht. Kein manuelles Aufräumen. | Optional: Lizenz in Supabase auf status=cancelled; URL nach Löschung auf „Lizenz beendet“-Seite führen. |

**Kurzantwort:**

- **Sterben:** Ja – sportwagenkonform automatisiert (ein Ablauf, eine Lösch-API, Frontend + Webhook nutzen ihn).
- **Aktives Leben:** Ja – für die heute unterstützten Mandanten (K2, ök2, VK2) ein Standard (Laden/Speichern/Blob). Für beliebig viele Klienten: tenantId aus URL noch umsetzen.
- **Geburt:** Ja – umgesetzt (08.03.26): Checkout → tenantId in metadata; Webhook → tenant_id + galerie_url in licences; Erfolgsseite zeigt Links; /g/:tenantId zeigt Galerie.

**Sportwagen-Vollständigkeit:** Geburt + Aktives Leben + Sterben umgesetzt. Einmalig: Supabase-Migration 007 ausführen (tenant_id, galerie_url). Admin mit ?tenantId= für dynamischen Mandanten (Laden/Speichern über API) ✅ 08.03.26.

---

### Was zur Automatisierung noch fehlt (konkrete Liste)

**Phase „Geburt“ (Registrierung → aktiver Klient mit eigener URL)** – ✅ umgesetzt (08.03.26)

| Nr. | Was | Status |
|-----|-----|--------|
| 1 | **tenantId beim Checkout erzeugen** | ✅ **api/create-checkout.js**: `generateTenantId(email)` (E-Mail-Slug + Zufallssuffix), in `metadata.tenantId`. |
| 2 | **tenantId in Supabase speichern** | ✅ **api/webhook-stripe.js**: `metadata.tenantId` lesen, in **licences** mitschreiben. Migration **supabase/migrations/007_licences_tenant_id_galerie_url.sql** einmal ausführen. |
| 3 | **Galerie-URL ableiten und speichern** | ✅ Im Webhook: `galerieUrl = baseUrl + '/g/' + tenantId`, in **licences.galerie_url**. |
| 4 | **Erfolgsseite: „Deine Galerie“-URL anzeigen** | ✅ **api/get-licence-by-session.js** (GET mit session_id); **LizenzErfolgPage** lädt und zeigt „Deine Galerie“- und „Admin“-Links. |
| 5 | **App: tenantId aus URL lesen** | ✅ Route **/g/:tenantId**, **GalerieTenantPage** lädt gallery-data?tenantId= und zeigt Galerie oder „Jetzt gestalten“ + Admin-Link. |

**Phase „Aktives Leben“ (für beliebig viele Klienten)** – ✅ 08.03.26

| Nr. | Was | Wo / wie | Status |
|-----|-----|----------|--------|
| 6 | **Admin bei dynamischem ?tenantId=** | **TenantContext:** `?tenantId=` (sichere ID a-z0-9-, 1–64) → `dynamicTenantId`. **Admin:** Laden von api/gallery-data?tenantId= in State; Speichern nur über „Veröffentlichen“ → api/write-gallery-data mit body.tenantId; kein localStorage für diesen Mandanten. | ✅ Umgesetzt |

**Phase „Sterben“ (optional, schon weitgehend erledigt)**

| Nr. | Was | Wo / wie | Priorität |
|-----|-----|----------|-----------|
| 7 | **Lizenz auf cancelled setzen** | In **api/cancel-subscription.js** oder Webhook **customer.subscription.deleted**: Supabase **licences** Zeile (über licence_id bzw. tenant_id finden) auf `status = 'cancelled'` setzen. | Optional |
| 8 | **Alte URL → „Lizenz beendet“-Seite** | Wenn jemand die alte Galerie-URL aufruft nach Kündigung: gallery-data liefert 404; Frontend könnte auf Route `/g/:tenantId` prüfen (API-Call) ob Mandant noch aktiv ist und sonst auf feste Seite „Lizenz beendet“ umleiten. | Optional |

**Abhängigkeiten**

- **1 + 2 + 3** = Klient hat nach Checkout eine tenantId und eine URL in der DB.
- **4** = Klient sieht diese URL auf der Erfolgsseite (und kann drucken).
- **5 + 6** = Klient kann die URL öffnen und landet in seiner Galerie; Veröffentlichen/Laden laufen für diesen Mandanten.

**Reihenfolge für Umsetzung:** 1 → 2 (DB-Spalten + Webhook) → 3 → 4 (API für Erfolgsseite + LizenzErfolgPage) → 5 → 6.
