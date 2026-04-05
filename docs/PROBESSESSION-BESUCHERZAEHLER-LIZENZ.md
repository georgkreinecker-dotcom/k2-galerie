# Probesession: Besucherzähler (Lizenz-Galerie `/g/…`)

**Ziel:** In **~5 Minuten** einen **Eindruck**, wohin das geht – ohne tiefes Debugging.  
**Technik-Check (Server):** `POST https://k2-galerie.vercel.app/api/visit` mit gültigem JSON liefert **200** und z. B. `{"count": …}` (Zähler pro Mandanten-Slug in der Datenbank).

---

## Wohin geht die Richtung? (vor dem Klicken)

| Aspekt | Richtung |
|--------|----------|
| **Produkt** | Jede **Lizenz-Galerie** hat eine **eigene öffentliche URL** `/g/<slug>` – skalierbar, nicht nur K2/ök2. |
| **Messung** | **Einmal pro Browser-Session** wird ein Besuch gezählt – fair, kein „Reload-Spam“. |
| **Technik** | **Eine** Server-Route **`/api/visit`** (POST), **eine** Client-Funktion `reportPublicGalleryVisit` – Sportwagenmodus. |
| **Transparenz** | Der oder die Lizenznehmer:in sieht im **Admin** die Zahl (**👁**), nicht nur „irgendwo in der Datenbank“. |
| **Entwicklung** | Unter **localhost** fließt der Besuch **nicht** in die Live-Zahlen – du testest **bewusst auf Vercel**, nicht aus Versehen die Statistik verfälschen. |

---

## Ablauf der Probesession (du am Mac)

### Minute 1 – „Erstbesucher“

1. **Neues privates Fenster** (Safari/Chrome) – damit keine alte Session.
2. Im Browser öffnen (nicht in Cursor-Preview, nicht im iframe):  
   **`https://k2-galerie.vercel.app/g/<dein-slug>`**  
   Ersetze `<dein-slug>` durch einen **gültigen** Mandanten (nur `a-z`, `0-9`, `-`, max. 64 Zeichen), für den **Galerie-Daten** existieren.

**Eindruck:** Das ist die **öffentliche** Sicht – wie ein Kunde die Galerie sieht.

---

### Minute 2 – Netzwerk: „Hat es gezählt?“

1. **Entwicklertools** → **Netzwerk** (alle Anfragen).
2. Seite **einmal** neu laden oder warten bis alles da ist.
3. Filter/Suche: **`visit`** oder Pfad **`/api/visit`**.

**Erwartung:** **POST** → Status **200** → Antwort-JSON mit **`count`**.

**Eindruck:** Die App **meldet sich selbst** beim Server – du siehst den Beweis im Netzwerk-Tab.

---

### Minute 3 – Zweiter Reload (optional)

- **Derselbe** Tab **nochmal** laden (ohne neues Inkognito).

**Erwartung:** **Kein** zweiter POST (Session schon gesetzt) – **normal**.

**Eindruck:** Es wird **nicht** bei jedem Klick hochgezählt – **einmal pro Session**.

---

### Minute 4 – Admin: „Siehst du die Zahl?“

1. In **derselben** Produktions-App: **Admin** mit **`?tenantId=<derselbe-slug>`**  
   Beispiel: `https://k2-galerie.vercel.app/admin?tenantId=<dein-slug>`
2. Oben die Anzeige **👁** und Zahl ansehen.

**Erwartung:** Eine **Zahl** (nicht dauerhaft **–**); ggf. kurz warten bis GET fertig ist.

**Eindruck:** **Mandant:in** bekommt **Feedback**, ob überhaupt Besuch ankommt – ohne Supabase-Studio.

---

## Was du **nicht** erwarten solltest

- **Lokaler Vite-Dev** (`localhost`): Zähler-POST geht an dieselbe Origin – **kein** identisches Verhalten wie auf Vercel; für **echte** Smoke-Tests **Vercel** nutzen (siehe auch `SMOKE-BESUCHERZAEHLER-LIZENZ.md`).
- **iframe** (eingebettete Vorschau): Zähler wird **bewusst** nicht ausgeführt (`window.self !== window.top`).

---

## Verknüpfungen

- Vollständiger Smoke-Test (Checkliste): **[SMOKE-BESUCHERZAEHLER-LIZENZ.md](SMOKE-BESUCHERZAEHLER-LIZENZ.md)**
- Code: `GalerieTenantPage.tsx` → `reportPublicGalleryVisit`, `api/visit-and-build.js`

---

*Kurz: **Probesession = Richtung verstehen (Lizenz-URL → ein POST → Zahl im Admin) – Smoke = technisch abhaken.***
