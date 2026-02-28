# Vercel: Kein neues Deployment trotz Push – Ursache finden

**Situation:** Bis 11:07 hat alles funktioniert, danach kommen Pushes nicht mehr als neues Deployment an. An den Vercel-Einstellungen wurde nichts geändert.

Es gibt **nur zwei** technische Ursachen. Diese Doku hilft, die richtige zu finden und dauerhaft zu beheben.

---

## Schritt 1: Welche Ursache ist es?

**In Vercel:** Projekt **k2-galerie** → **Deployments** → Liste durchsehen (auch Einträge mit **Error**).

| Was du siehst | Ursache | Weiter bei |
|---------------|---------|------------|
| **Keine** neuen Einträge nach 11:07 (nur das alte Deployment) | **A: Build wird nicht gestartet** – GitHub/Vercel löst keinen Build aus | Abschnitt A |
| Es **gibt** neue Einträge nach 11:07, aber Status **Error** (rot) | **B: Build wird gestartet, schlägt aber fehl** – unser Code/Build | Abschnitt B |

---

## A: Build wird nicht gestartet (kein neues Deployment in der Liste)

**Bedeutung:** Vercel bekommt den Push nicht oder startet keinen Build. Das liegt **nicht** an unserem Code, sondern an der Verbindung GitHub ↔ Vercel.

**Mögliche konkrete Ursachen:**

1. **GitHub-Webhook defekt oder gelöscht**
   - **Prüfen:** GitHub → Repo **k2-galerie** → **Settings** → **Webhooks**. Gibt es einen Eintrag von Vercel?
   - **Recent Deliveries:** Letzte Lieferungen grün (200) oder rot (Fehler)?
   - **Wenn rot oder kein Webhook:** In Vercel **Settings → Git → Disconnect**, danach wieder **Connect** (gleiches Repo, Branch main). Das legt einen neuen Webhook an.

2. **Vercel baut einen anderen Branch**
   - **Prüfen:** Vercel → **Settings → Git** → **Production Branch**. Muss **main** sein.
   - Wenn dort etwas anderes steht (z. B. main-fresh): auf **main** stellen, speichern. Danach Push auf main erneut probieren.

3. **Vercel ist mit anderem Repo/Fork verbunden**
   - **Prüfen:** Vercel → **Settings → Git** → **Connected Git Repository**. Muss **genau** das Repo sein, in das du pushst (z. B. georgkreinecker-dotcom/k2-galerie).
   - Wenn du in ein anderes Repo oder einen Fork pushst, sieht Vercel die Pushes nicht.

**Sofort-Lösung (unabhängig von Webhook):** Siehe **docs/VERCEL-CHECKLISTE-BEI-KEINEM-STAND.md** – Abschnitt „Deploy Hooks“ oder **Vercel CLI** (`npx vercel --prod`). Damit kannst du sofort deployen; die Ursache (Webhook/Git) trotzdem wie oben prüfen.

---

## B: Build wird gestartet, schlägt aber fehl (Deployment mit Status „Error“)

**Bedeutung:** Vercel startet den Build, aber der Build bricht ab (z. B. TypeScript-Fehler, fehlende Abhängigkeit, Speicher). Dann bleibt Production auf dem letzten **erfolgreichen** Stand (11:07).

**Ursache:** Etwas im **Projekt** (Code, Abhängigkeiten, Konfiguration) führt zum Build-Fehler. Das kann eine Änderung sein, die nach 11:07 committed wurde.

**Vorgehen:**

1. **Build-Log ansehen:** In Vercel auf das **rote** Deployment (Error) klicken → **View Build Log** / Build-Log öffnen. Letzte Zeilen = Fehlermeldung (z. B. „TS2304“, „module not found“, „out of memory“).
2. **Lokal nachstellen:** Im Projektordner `npm run build`. Tritt derselbe Fehler auf? Dann im Code/Config beheben.
3. **Fix committen und pushen.** Nach dem nächsten Push baut Vercel wieder; wenn der Fix stimmt, wird das Deployment **Ready**.

**Typische Fehler:** TypeScript-Fehler, fehlender Import, fehlende Umgebungsvariable (z. B. GITHUB_TOKEN nur für API, nicht für Build), Speicherlimit. Alles im Build-Log sichtbar.

---

## Kurz: So findest du die Ursache

1. **Vercel → Deployments:** Gibt es nach 11:07 **neue** Einträge (auch mit Error)?
   - **Nein** → Ursache **A** (Build wird nicht gestartet). Webhook, Production Branch, verbundenes Repo prüfen; Deploy Hook oder CLI als Sofort-Lösung.
   - **Ja, mit Error** → Ursache **B** (Build schlägt fehl). Build-Log lesen, Fehler lokal nachstellen und beheben.

2. **Nach dem Fix:** Einmal mit **Vercel CLI** (`npx vercel --prod`) oder **Deploy Hook** deployen, damit du sofort wieder live bist. Danach prüfen, ob der nächste **normale** Push wieder ein Deployment auslöst und **Ready** wird.

---

## Nichts im Repo verändert, was Builds „abschaltet“

Im Projekt gibt es **keine** Einstellung, die Vercel dazu bringt, Builds gar nicht mehr zu starten.  
- **vercel.json** enthält nur buildCommand, outputDirectory, rewrites, headers – nichts zum Ignorieren von Builds.  
- Ein „Ignore Build Step“ existiert nur in den **Vercel-Dashboard-Einstellungen** (nicht im Repo).  

Wenn also **keine** neuen Deployments erscheinen (Ursache A), liegt es an GitHub-Webhook oder Vercel-Git-Verbindung, nicht an einer Änderung in unserem Code.
