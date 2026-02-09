# 🔑 GitHub Token erstellen - Schritt für Schritt

## ✅ Schritt 1: Token erstellen

1. **Öffne diesen Link in deinem Browser:**
   👉 [github.com/settings/tokens](https://github.com/settings/tokens)

2. **Klicke auf:** "Generate new token" → "Generate new token (classic)"

3. **Fülle aus:**
   - **Note:** `k2-galerie-deploy`
   - **Expiration:** Wähle "90 days" oder "No expiration" (deine Wahl)
   - **Scopes:** Aktiviere **`repo`** (alle repo-Optionen werden automatisch aktiviert)

4. **Scrolle nach unten** und klicke **"Generate token"**

5. **WICHTIG:** Kopiere den Token sofort! (Er wird nur einmal angezeigt)
   - Er sieht aus wie: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## ✅ Schritt 2: Token im Terminal verwenden

**Zurück im Terminal:**

1. **Username eingeben:**
   ```
   georgkreinecker-dotcom
   ```
   Enter drücken

2. **Password eingeben:**
   - Füge den kopierten Token ein (Strg+V oder Cmd+V)
   - **Wichtig:** Der Token wird nicht angezeigt - das ist normal!
   - Enter drücken

3. **Fertig!** Der Code wird hochgeladen ✅

---

## 🆘 Alternative: GitHub CLI verwenden

**Falls Token nicht funktioniert:**

```bash
# GitHub CLI installieren (falls nicht vorhanden)
brew install gh

# Bei GitHub anmelden
gh auth login

# Dann pushen
git push -u origin main
```

---

## 📋 Checkliste

- [ ] Token erstellt auf [github.com/settings/tokens](https://github.com/settings/tokens)
- [ ] Token kopiert (ghp_...)
- [ ] Username eingegeben: `georgkreinecker-dotcom`
- [ ] Token als Password eingefügt
- [ ] Enter gedrückt
- [ ] Code erfolgreich hochgeladen

---

**Sag mir Bescheid, wenn du den Token erstellt hast!** 💚
