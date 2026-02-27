# Schnellfix am iPad – Code ändern ohne Mac

Wenn etwas nicht funktioniert (z. B. Foto-Bug) und du nur das iPad dabei hast: Du kannst die Änderung direkt im Browser machen. Kein Cursor, kein Mac nötig.

## Ablauf (5 Schritte)

1. **Safari auf dem iPad** öffnen → **github.com** → einloggen (falls nötig).
2. Zu deinem Repo gehen: **georgkreinecker-dotcom/k2-galerie** (oder über deine Repo-Liste).
3. Zur **richtigen Datei** navigieren (z. B. `components` → `ScreenshotExportAdmin.tsx`).  
   Joe (oder die Doku) sagt dir: „In Datei X, Zeile Y, ändere Z.“
4. Oben rechts auf den **Stift (Edit this file)** tippen.
5. Die **Änderung** im Editor machen → ganz unten **Commit changes** (kurze Nachricht eintippen, z. B. „Fix Foto speichern“) → **Commit** bestätigen.

**Fertig.** Vercel baut automatisch (1–2 Minuten). Danach auf dem iPad: Galerie/Admin **neu laden** (oder Stand-Badge tippen) – die Änderung ist live.

## Wann geeignet

- **Kleine, klare Änderungen** (ein paar Zeilen, eine Stelle).
- Du bekommst die **genaue Stelle und den neuen Text** (von Joe oder aus einer Notiz).

## Grenzen

- Kein Cursor, kein AI-Assistent im Editor.
- Build/Test läuft nicht auf dem iPad – nur die Bearbeitung und der Commit. Nach dem Push baut Vercel; wenn der Build fehlschlägt, siehst du es in GitHub unter „Actions“ oder in der E-Mail.

## Tipp

Wenn Joe einen Fix beschreibt, kannst du sagen: **„Schreib mir die Änderung so, dass ich sie am iPad in GitHub machen kann“** – dann bekommst du z. B. „Datei X, suche Zeile mit Text A, ersetze durch B“ oder einen kleinen Code-Block zum Einfügen.
