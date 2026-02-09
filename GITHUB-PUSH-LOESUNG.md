# 🔧 GitHub Push Problem - Lösung

## Problem: HTTP 400 Fehler beim Push

Das Repository ist zu groß oder der Push schlägt fehl.

### Lösung 1: Kleinere Commits pushen

**Führe diese Befehle aus:**

```bash
cd ~/k2Galerie

# Prüfe was wirklich gepusht werden muss
git log origin/main..main --oneline 2>/dev/null || git log --oneline -1

# Versuche nur den letzten Commit zu pushen
git push origin main:main --verbose
```

---

### Lösung 2: Token neu erstellen

**Der Token könnte abgelaufen sein:**

1. **Erstelle einen neuen Token:**
   - [github.com/settings/tokens/new](https://github.com/settings/tokens/new)
   - Name: `k2-galerie-push`
   - Scopes: `repo`
   - Generate token

2. **Setze neuen Token:**
   ```bash
   cd ~/k2Galerie
   git remote set-url origin https://NEUER-TOKEN@github.com/georgkreinecker-dotcom/k2-galerie.git
   git push -u origin main
   ```

---

### Lösung 3: Repository neu erstellen

**Falls nichts funktioniert:**

1. **Lösche das Repository auf GitHub:**
   - Settings → Danger Zone → Delete

2. **Erstelle neues Repository** (leer)

3. **Push mit neuem Token:**
   ```bash
   cd ~/k2Galerie
   git remote remove origin
   git remote add origin https://NEUER-TOKEN@github.com/georgkreinecker-dotcom/k2-galerie.git
   git push -u origin main --force
   ```

---

### Lösung 4: Git LFS verwenden

**Falls große Dateien das Problem sind:**

```bash
cd ~/k2Galerie
git lfs install
git lfs track "*.png"
git lfs track "*.jpg"
git add .gitattributes
git commit -m "Add Git LFS"
git push -u origin main
```

---

## 🆘 Schnellste Lösung

**Versuche zuerst:**

```bash
cd ~/k2Galerie
git push origin main --verbose --no-verify
```

**Falls das nicht funktioniert, erstelle einen neuen Token und setze ihn neu!**
