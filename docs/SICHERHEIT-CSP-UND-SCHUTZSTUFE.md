# Content-Security-Policy & dokumentierte Schutzstufe

**Zweck:** Nachvollziehbar festhalten, **welchen Schutzstandard** die K2-Galerie-PWA auf **Vercel (Production)** erreicht – ohne falsche Zertifikats-/Audit-Versprechen.

---

## Was wir jetzt dokumentieren können (internes Profil)

Das ist **kein** OWASP-ASVS-Zertifikat und **kein** externes Pen-Test-Ergebnis. Es ist ein **reproduzierbares Schutzprofil** aus Code + `vercel.json` + etablierten App-Standards.

| Stufe | Inhalt | Stand Mai 2026 |
|-------|--------|------------------|
| **A – Transport & Basis-HTTP-Header** | HTTPS (Hosting), **HSTS**, **nosniff**, **X-Frame-Options** (SAMEORIGIN), **Referrer-Policy** | ✅ aktiv auf Production (`vercel.json` Catch-all) |
| **B – CSP + Anwendung gegen Phishing / Injection** | **Content-Security-Policy** ohne Inline-`<script>` im HTML; kritisches Stand-/Update-Skript in **`/boot/boot-build-info.js`** (Timestamp beim Build); dazu: **`safeExternalUrl`**, Checkout-URL-Prüfung, **`noopener`/`noreferrer`** wo dokumentiert | ✅ CSP + Boot-Pfad; App-Standards siehe `docs/DATENSICHERHEIT-ABSICHERUNG.md` / GELOESTE-Bugs zu Links |
| **C – verschärft (bewusst nicht Pflicht)** | z. B. Nonces **pro Antwort**, kein `style-src 'unsafe-inline'`, keine breiten `https:`-Quellen bei `img-src`/`frame-src` | ❌ nicht gefordert (React/Tailwind + eingebettete Inhalte würden brechen oder hohen Pflegeaufwand erzeugen) |

**Kurz:** Auf Production können wir **offiziell (intern)** von **„Profilstufe B – CSP mit dokumentierten Ausnahmen“** sprechen, gebaut auf **Stufe A**.

---

## Technische Umsetzung CSP & Boot

- **Header:** `Content-Security-Policy` am Catch-all `/(.*)` in **`vercel.json`** (mitgeliefert über dieselben Responses wie die übrigen Schutz-Header).
- **Keine Inline-Skripte** in **`index.html`** für Stand/Theme/Manifest/Redirect/Lade-Helfer → ausgelagert unter **`public/boot/*.js`** (Build kopiert nach **`dist/boot/`**).
- **Timestamp für Stand-Logik:** `scripts/write-build-info.js` schreibt **`public/boot/boot-build-info.js`** (wie früher das Inline-Script): Stale-HTML-Erkennung, Abruf `/api/build-info`, sicherer Reload mit Cache-Bust – **Regeln:** `stand-qr-niemals-zurueck.mdc`.
- **SPA-Rewrite:** Muster in `vercel.json` schließt **`(?!boot/)`** aus, damit **`/boot/*.js`** nicht als `index.html` ausgeliefert wird.

---

## Bewusste CSP-Ausnahmen / Grenzen

| Thema | Warum |
|-------|--------|
| **`style-src 'unsafe-inline'`** | Inline-Styles in React/Tailwind/vielen Komponenten |
| **`img-src … https:`** | Fremde Bild-URLs (Werke, Mandanten, QR-Hilfsdienste) |
| **`frame-src … https:`** | Z. B. eingebettete Plakat-/HTTPS-Inhalte aus Stammdaten |
| **`script-src … https://js.stripe.com`** | Stripe Checkout |
| **`connect-src …`** u. a. Supabase (`*.supabase.co`), Stripe, Vercel Blob, OpenAI (Control Studio), QR-Hilfs-API, Fonts/Unsplash laut aktuellem Bedarf | Bei **anderem** Backend-Host (nicht `*.supabase.co`) muss die CSP **erweitert** werden |

**Lokal (`npm run dev`):** Vite setzt die Vercel-Header **nicht** – CSP gilt dort nicht automatisch. Das ist normal.

---

## Pflege bei neuen externen Domains

Wenn ein Feature **neue** Skript-, Frame- oder Fetch-Ziele einführt: **`vercel.json`** CSP-Zeile ergänzen und **kurz hier** oder in `docs/DATENSICHERHEIT-ABSICHERUNG.md` vermerken. Guard: **`src/tests/vercel-config-guard.test.ts`** prüft, dass eine CSP am Catch-all gesetzt ist.

---

## Querverweise

- Regeln: **`stand-qr-niemals-zurueck.mdc`**, **`vercel-stand-funktioniert.mdc`**
- Stand & QR (Georg): **`docs/STAND-QR-SO-BLEIBT-ES.md`**, **`docs/VERCEL-STAND-HANDY.md`**
- Link-Härtung & Phishing: **`src/utils/safeExternalUrl.ts`**, Tests **`src/tests/safeExternalUrl.test.ts`**
