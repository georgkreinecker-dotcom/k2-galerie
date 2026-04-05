# Smoke-Test: Besucherzähler (Lizenz-Galerie `/g/…`)

**Zuerst einen Eindruck?** → **[PROBESSESSION-BESUCHERZAEHLER-LIZENZ.md](PROBESSESSION-BESUCHERZAEHLER-LIZENZ.md)** (5 Minuten, erzählt den Ablauf).

**Zweck:** In **wenigen Minuten** prüfen, ob **Erfassung** (POST) und optional **Anzeige** (GET im Admin) für einen **Lizenz-Mandanten** grundsätzlich funktionieren – ohne tiefes Debugging.

**Wichtig:** Zählen und API laufen auf der **Produktions-App** (Vercel). Unter **`npm run dev`** (localhost) wird der Besuch **bewusst nicht** in die Live-Zahlen geschrieben (POST geht an localhost → keine Serverless-Route wie in Produktion).

---

## 1. Voraussetzungen

- Ein **gültiger Mandanten-Slug** (nur `a-z`, `0-9`, `-`, max. 64 Zeichen), für den es bereits **Galerie-Daten** gibt (Route `/g/<slug>` zeigt Inhalt, nicht nur Fehlerseite).
- Browser: **Chrome oder Safari** (Entwicklertools → Netzwerk).

---

## 2. Erfassung prüfen (~1 Minute)

1. **Privates oder Inkognito-Fenster** öffnen (damit keine alte Session: einmal pro Session wird gezählt).
2. Die **öffentliche** Galerie aufrufen: **Basis-URL der Vercel-App** + **`/g/<slug>`**  
   Beispiel-Pfadform: `/g/mein-atelier-2026` (Domain = dieselbe wie bei der live geschalteten Galerie).
3. **Entwicklertools** öffnen → Register **Netzwerk** (alle Anfragen sichtbar).
4. Seite einmal **vollständig laden**.
5. Suchen nach einer Anfrage **`visit`** (POST, Pfad **`/api/visit`**).
   - **Erwartung:** Methode **POST**, Status **200**, Antwort-JSON enthält **`count`** (Zahl).
6. **Optional:** Seite **ein zweites Mal** laden (ohne neues Inkognito): derselbe **POST** sollte **nicht** erneut kommen (einmal pro Browser-Session) – das ist **normal**.

Wenn POST fehlt: Seite nicht im **iframe** öffnen (z. B. keine eingebettete Vorschau). Wenn **404** oder **CORS-Fehler:** Deployment oder Rewrites prüfen (nicht localhost).

---

## 3. Anzeige im Admin prüfen (~1 Minute, optional)

1. In derselben **Produktions-App** (Vercel) einloggen bzw. **Admin** öffnen mit **`?tenantId=<slug>`** (gleicher Slug wie oben).
2. Oben die **Besucher-Anzeige** (**👁** und Zahl) ansehen.
3. **Erwartung:** Es erscheint eine **Zahl** (nicht dauerhaft **–**). Unter lokalem **Vite** holt die App die Zahl per GET von der **Produktions-API** – Internetverbindung nötig.

---

## 4. Optional: Datenbank

In **Supabase** Tabelle **`visits`**: Zeile mit **`tenant_id`** = dein **Slug**; **`count`** sollte nach erfolgreichen Besuchen steigen (Logik wie bei `k2` / `oeffentlich`).

---

## 5. Code-Referenz (eine Quelle)

| Thema | Ort |
|--------|-----|
| Öffentliche Lizenz-Galerie, POST auslösen | `src/pages/GalerieTenantPage.tsx` → `reportPublicGalleryVisit` |
| POST-Standard | `src/utils/reportPublicGalleryVisit.ts` |
| GET Zähler (Admin / Board / Vite) | `src/utils/visitCountApiOrigin.ts` → `fetchVisitCount` |
| API | `api/visit-and-build.js` (Rewrite **`/api/visit`**) |
| Slug-Regel (Client = Server) | `src/tests/reportPublicGalleryVisit.test.ts` |

---

*Kurz gefasst: **Inkognito → Vercel `/g/slug` → Netzwerk → POST `/api/visit` 200 mit `count` → passt.***
