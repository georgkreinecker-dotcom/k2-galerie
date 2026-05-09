# Lizenz-Kunde: Domain-Karteikarte (ein Blatt pro Mandant)

**Zweck:** Ein **konkreter Eintrag** pro Kund:in – Domain(s) an Vercel, **`VITE_LICENSEE_PUBLIC_HOSTNAMES`** richtig erweitern, URLs in Stripe/Supabase nachziehen.  
**Technischer Hintergrund:** `docs/SICHERHEIT-LIZENZNEHMER-KEIN-OEK2-VK2.md` (Abschnitt **4b**).

---

## Regeln (kurz)

- **`k2-galerie.vercel.app`**, **`kgm.at`**, **`localhost`** niemals in `VITE_LICENSEE_PUBLIC_HOSTNAMES` eintragen.
- Nur **exakte** Hostnamen, Komma getrennt, ideal kleingeschrieben (z. B. `www.beispiel.at,beispiel.at`).
- **Neuen Kunden hinzufügen:** bestehende Variable **ergänzen**, nicht überschreiben (alle bisherigen Hosts **behalten**, neue durch Komma anhängen).
- Nach Änderung der Env: **Production-Deployment neu auslösen** (Build zieht `import.meta.env`).

---

## Karteikarte 1 – Pilot „Galerie Eferding“ (Muster aus Praxistest-Doku)

| Feld | Eintrag |
|------|---------|
| **Kunde / Projekt** | Galerie Eferding (Pilot Praxistest) |
| **tenantId** | `galerie-eferding` |
| **Öffentliche Galerie (Ziel-URL)** | `https://www.galerie-eferding.at/g/galerie-eferding` |
| **Optional Apex** | `https://galerie-eferding.at/…` → Redirect auf `www` oder umgekehrt (eine kanonische URL für QR/Druck) |
| **Vercel → Domains** | `galerie-eferding.at`, `www.galerie-eferding.at` am Projekt **k2-galerie** anlegen; DNS beim Provider wie Vercel anzeigt |
| **Neuer Wert für `VITE_LICENSEE_PUBLIC_HOSTNAMES`** | Erst **alle bisherigen** Hosts aus der Vercel-Anzeige kopieren, dann **anhängen:** `,galerie-eferding.at,www.galerie-eferding.at` |
| **Smoke-Test nach Deploy** | Im Browser (Chrome/Safari) auf **`https://www.galerie-eferding.at/galerie-oeffentlich`** gehen → **keine** ök2-Demo (Redirect zur Startseite o. Ä., wie bei Nicht-Plattform). |
| **Supabase `licences`** | Für die Zeile mit `tenant_id = galerie-eferding`: **`galerie_url`** auf die kanonische HTTPS-Galerie-URL setzen (Erfolgsseite, E-Mails, QR). |

**Hinweis:** Die Domain **`galerie-eferding.at`** ist hier ein **Namens-Muster** aus der Projekt-Doku (Eferding-Pilot). Sobald du die **echte** Domain hast, diese Spalten ersetzen – die **Struktur** bleibt gleich.

---

## Karteikarte 2 – _______________ (leer kopieren)

| Feld | Eintrag |
|------|---------|
| **Kunde / Projekt** | |
| **tenantId** | |
| **Öffentliche Galerie (Ziel-URL)** | `https://________________________________/g/____________` |
| **Hosts nur für diese Karteikarte** | `____________________,____________________` |
| **In Vercel `VITE_LICENSEE_PUBLIC_HOSTNAMES`:** | *(Bestand + Komma + Zeile „Hosts nur für diese Karteikarte“)* |
| **Smoke-Test** | `https://…………………/galerie-oeffentlich` → keine Demo |
| **Supabase `galerie_url`** | gesetzt am __.__.____ |

---

## Copy-Paste: Vercel Environment Variable

**Name:** `VITE_LICENSEE_PUBLIC_HOSTNAMES`  

**Wert (Beispiel nur Kunde Eferding-Pilot, ohne andere Kunden):**

```text
galerie-eferding.at,www.galerie-eferding.at
```

**Wert (Beispiel: bereits `kunde-a.at` drin, Eferding neu):**

```text
kunde-a.at,www.kunde-a.at,galerie-eferding.at,www.galerie-eferding.at
```

---

## Copy-Paste: Supabase (nur wenn Zeile schon existiert)

Nach dem nächsten Checkout kann `galerie_url` schon stimmen, wenn **`SITE_URL` / Basis-URL** im Webhook passt. Für **Nachziehen** einer bestehenden Lizenz (SQL nur im Supabase-SQL-Editor, mit echten Werten prüfen):

```sql
-- Beispiel – tenant_id und URL anpassen
update licences
set galerie_url = 'https://www.galerie-eferding.at/g/galerie-eferding'
where tenant_id = 'galerie-eferding';
```

---

## Verknüpfung

- **Sicherheit & Warum:** `docs/SICHERHEIT-LIZENZNEHMER-KEIN-OEK2-VK2.md` §4b  
- **Handbuch (Nutzer:innen):** `k2team-handbuch/25-LIZENZ-EIGENE-URL-AB-PRO.md`  
- **Code:** `src/config/tenantConfig.ts` (`parseLicenseePublicHostnamesFromEnv`, `isLicenseePublicHostname`, `isPlatformHostname`)
