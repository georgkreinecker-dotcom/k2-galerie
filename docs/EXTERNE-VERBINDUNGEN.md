# Externe Verbindungen – Übersicht und Regeln

**Warum das wichtig ist:** Bei 100 oder 10.000 Lizenzen darf nichts „nebenher“ zu Drittanbietern laufen. Jede ausgehende Verbindung muss bewusst sein, dokumentiert und – wo möglich – zentral konfigurierbar (z. B. für Self-Host oder Mandanten-URLs).

---

## 1. Vollständige Liste der ausgehenden Verbindungen

### 1.1 Eigene Plattform (K2/Vercel)

| Zweck | Wo | URL / Quelle | Skalierung |
|-------|-----|--------------|------------|
| Build-Info (Stand) | useServerBuildTimestamp, DevView, GaleriePage | `https://k2-galerie.vercel.app/build-info.json` | Pro Aufruf/App; bei vielen Mandanten: eigene Domain pro Tenant oder ein zentraler Build-Info-Endpoint. |
| gallery-data.json | GaleriePage, GalerieVorschauPage, DevView, ScreenshotExportAdmin | `k2-galerie.vercel.app` / gleicher Origin | Pro Mandant/Deployment; bei Multi-Tenant: pro Tenant-URL oder eigener Storage. |
| QR-Code-URLs / Links | Navigation, Mobile Connect, Flyer, Plakate | BASE_APP_URL, VERCEL_GALERIE_URL, GALERIE_QR_BASE | Sollten aus **einer** zentralen Config kommen (siehe `src/config/externalUrls.ts`). |

**Umsetzung (19.02.26):** Alle „eigenen“ URLs kommen aus `src/config/externalUrls.ts` (App-Code: navigation, GaleriePage, MobileConnectPage, GalerieVorschauPage, DevViewPage, ScreenshotExportAdmin). Env `VITE_APP_BASE_URL` für Self-Host. Ausnahme: Supabase Edge Function (ALLOWED_ORIGINS) und public/sw.js (Tooling) haben weiterhin feste Einträge – bei Self-Host dort anpassen oder per Env ergänzen.

---

### 1.2 Drittanbieter (extern)

| Zweck | Wo | URL | Risiko bei 100/10.000 Lizenzen |
|-------|-----|-----|----------------------------------|
| QR-Code-Bilder | GalerieVorschauPage, ScreenshotExportAdmin (Etiketten, Flyer, Plakat) | **api.qrserver.com** | Jeder Druck/Anzeige = Request dorthin. Ausfall/DSGVO/Limitierungen. |
| Seed-/Musterbilder | tenantConfig (demo/oeffentlich), vk2MemberGalerie | **images.unsplash.com** | Nur für Demo/Seed; echte Mandanten laden eigene Bilder. Trotzdem: Abhängigkeit. |
| Schriften (Marketing) | marketingWerbelinie.ts | **fonts.googleapis.com** | Pro Seitenaufruf mit Werbelinie; viele Lizenzen = viele Aufrufe. |
| OpenAI (KI) | ControlStudioPage | **api.openai.com** | Pro Nutzung; Keys pro Mandant oder zentral – bewusst steuerbar. |
| WhatsApp (Empfehlung) | EmpfehlungstoolPage | **wa.me** | Nur Link, kein automatischer Request; unkritisch. |
| Supabase | supabaseClient, GalerieVorschauPage, DevViewPage | VITE_SUPABASE_URL (Env) | Bereits env-basiert; bei Multi-Tenant: pro Mandant eigene Projekt-URL oder Pool. |

**Kritisch für Skalierung:**

- **api.qrserver.com:** Optional durch eigene QR-Generierung ersetzen (z. B. Library im Frontend), dann keine Außenverbindung für QR.
- **images.unsplash.com:** Nur für Muster/Seed; in Produktion sollten Mandanten eigene Bilder haben. Defaults in zentraler Config, ersetzbar.
- **fonts.googleapis.com:** Optional Fonts selbst hosten (Self-Host oder eigener CDN), dann keine Google-Abfrage.

---

### 1.3 Nur Links (kein automatischer Request)

| Wo | URL | Hinweis |
|-----|-----|--------|
| KeyPage | platform.openai.com | Link zum Key erstellen. |
| KostenPage | platform.openai.com/usage | Link. |
| MarketingOek2Page | unsplash.com | Link zu Bildsuche. |
| DevView / ScreenshotExportAdmin | vercel.com/dashboard | Hinweis-URL in Meldungen. |

Diese sind unkritisch (Nutzer klickt), sollten aber in der Doku stehen.

---

### 1.4 Lokal / Relativ

- **/api/...** (write-gallery-data, run-git-push-gallery-data, github-token-status, save-github-env): Laufen gegen gleichen Host (Vercel Serverless oder lokal). Kein „extern“ im Sinne Drittanbieter.
- **fetch('/')**, **fetch('/gallery-data.json')**: Gleicher Origin.

---

## 2. Wie sicherstellen, dass nichts Unkontrolliertes dazukommt

### 2.1 Zentrale Konfiguration

- **Datei:** `src/config/externalUrls.ts`
  - Alle Basis-URLs für: App (Vercel/Produktion), Build-Info, gallery-data, QR-API (falls genutzt).
  - Keine weiteren hardcoded `https://...` für Betriebs-URLs im Rest des Codes.

### 2.2 Keine neuen hardcoded externen URLs

- **Regel:** Neue `fetch()` oder `src="https://..."` / `href="https://..."` für **Betrieb** (nicht nur Dokumentations-Links) dürfen nicht beliebig im Code stehen.
  - Entweder: URL kommt aus `externalUrls.ts` oder aus Env (`VITE_*`).
  - Oder: Eintrag in dieser Doku + Entscheidung (wirklich nötig? Ersetzbar?).

### 2.3 Checkliste vor Release / vor vielen Lizenzen

- [ ] `docs/EXTERNE-VERBINDUNGEN.md` gelesen.
- [ ] Alle Aufrufe von **api.qrserver.com**, **images.unsplash.com**, **fonts.googleapis.com** bekannt; Entscheidung: ersetzen oder bewusst akzeptiert.
- [ ] Eigene URLs (Vercel, Build-Info, gallery-data) aus `externalUrls.ts` oder Env.
- [ ] Neue Features: keine neuen externen URLs ohne Eintrag hier und ohne zentrale Config/Env.

### 2.4 Technische Prüfung (optional)

- Regelmäßig: `grep -r "https://" src components --include="*.ts" --include="*.tsx"` (und ggf. Skript) und prüfen, ob jede URL in Doku + Config erfasst ist.

---

## 3. Kurzfassung

- **Eigene Plattform:** Alle URLs zentral in `src/config/externalUrls.ts` (oder Env), keine verstreuten `k2-galerie.vercel.app`.
- **Drittanbieter:** Dokumentiert; QR-API, Unsplash, Google Fonts bewusst – bei Skalierung ersetzen oder begrenzen.
- **Neue Verbindungen:** Nur mit Eintrag hier und aus Config/Env – so wird bei 100 oder 10.000 Lizenzen nichts „nebenher“ aufgebaut.

Stand: 19.02.2026
