# Ein-Klick Code-Update (ohne Terminal)

Damit der Button **„📦 Code-Update (Git)“** mit einem Klick funktioniert (ohne Terminal-Befehl):

## Einmal einrichten

1. **Datei `.env`** in der Projektroot (gleicher Ordner wie `package.json`).
   - Falls noch keine existiert: `.env.example` kopieren und als `.env` speichern.

2. **GitHub-Token eintragen:**
   - GitHub → dein Profil (oben rechts) → **Settings**
   - Links: **Developer settings** → **Personal access tokens** → **Tokens (classic)**
   - **Generate new token (classic)** → Name z. B. „K2 Galerie“
   - Haken bei **repo** setzen → **Generate token**
   - Token kopieren und in `.env` eintragen:
     ```bash
     GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
     GITHUB_REPO=georgkreinecker/k2Galerie
     ```
   - Wenn dein Repo anders heißt: `GITHUB_REPO=deinname/reponame` anpassen.

3. **Dev-Server neu starten** (Cursor Terminal: Strg+C, dann `npm run dev`), damit die neue `.env` geladen wird.

## Danach

- **📁 Daten veröffentlichen** klicken → **📦 Code-Update (Git)** klicken → fertig.
- Kein Terminal, kein Befehl kopieren. Vercel baut in 1–2 Minuten.

(.env wird nicht ins Repo committed – steht in .gitignore.)
