# 🔑 GitHub Token generieren - Schritt für Schritt

## Schnell-Anleitung:

**1. Gehe zu GitHub Token-Seite:**
👉 [github.com/settings/tokens](https://github.com/settings/tokens)

**2. Klicke auf:**
"Generate new token" → "Generate new token (classic)"

**3. Token konfigurieren:**
- **Note (Name):** `k2-galerie-push`
- **Expiration:** Wähle eine Dauer (z.B. "90 days" oder "No expiration")
- **Scopes:** Aktiviere `repo` (alle Unterpunkte werden automatisch aktiviert)

**4. Token erstellen:**
- Klicke ganz unten auf "Generate token"
- **WICHTIG:** Kopiere den Token SOFORT (beginnt mit `ghp_...`)
- Du siehst ihn nur einmal!

**5. Token verwenden:**
- Beim `git push`: Username = `georgkreinecker-dotcom`
- Password = Den kopierten Token (nicht dein GitHub-Passwort!)

---

## Falls du den Token verloren hast:

**Neuen Token erstellen:**
1. Gehe zu: https://github.com/settings/tokens
2. Lösche den alten Token (falls vorhanden)
3. Erstelle einen neuen Token (siehe oben)

---

## Token speichern (optional):

**Im Terminal:**
```bash
# Token in Git Credential Store speichern
git config --global credential.helper osxkeychain
```

Dann beim ersten Push:
- Username: `georgkreinecker-dotcom`
- Password: Dein Token

Git merkt sich dann die Credentials automatisch.

---

## Direkter Link:

👉 [Token erstellen](https://github.com/settings/tokens/new)

---

## Wichtig:

- Token beginnt mit `ghp_...`
- Token ist wie ein Passwort - behandle ihn sicher
- Token kann jederzeit neu erstellt werden
- Token funktioniert nur wenn `repo` Berechtigung aktiviert ist
