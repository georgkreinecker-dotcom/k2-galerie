# Node.js Installation - Schritt für Schritt

## ✅ Homebrew ist installiert!

Du kannst Node.js jetzt einfach installieren:

## 🚀 Installation (1 Befehl)

Im Terminal am Mac:
```bash
brew install node
```

Das dauert 2-5 Minuten und installiert Node.js + npm automatisch.

## 📋 Nach der Installation

1. **Terminal neu starten** (oder neuen Tab öffnen)

2. **Prüfe ob es funktioniert:**
```bash
node --version
npm --version
```

3. **Dann Build ausführen:**
```bash
cd ~/k2Galerie
npm run build
```

## 🔄 Falls es nicht funktioniert

Falls nach Installation `node` immer noch nicht gefunden wird:

```bash
# Füge Homebrew zum PATH hinzu
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Oder für bash:
```bash
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bash_profile
source ~/.bash_profile
```

## 💡 Alternative: Offizieller Installer

Falls Homebrew Probleme macht:
1. Gehe zu: https://nodejs.org/
2. Lade die **LTS-Version** herunter (.pkg Datei)
3. Öffne die .pkg Datei und folge der Installation
4. Terminal neu starten

### Option B: Offizieller Installer
1. Gehe zu: https://nodejs.org/
2. Lade die LTS-Version herunter
3. Installiere die .pkg-Datei

### Option C: nvm (Node Version Manager)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

Dann Terminal neu starten und:
```bash
nvm install --lts
nvm use --lts
```

## ✅ Lösung 3: npm manuell finden

Wenn Node.js installiert ist, aber npm nicht gefunden wird:

```bash
# Prüfe verschiedene Pfade
ls -la /usr/local/bin/npm
ls -la /opt/homebrew/bin/npm
ls -la ~/.nvm/versions/node/*/bin/npm

# Wenn gefunden, füge zum PATH hinzu:
export PATH="/pfad/zu/npm:$PATH"
```

## 🚀 Nach Installation: Build testen

```bash
cd ~/k2Galerie
npm run build
```

## 💡 Hilfe-Script verwenden

Ich habe ein Script erstellt, das automatisch npm findet:

```bash
./scripts/find-npm.sh
```

Dieses Script sucht npm an verschiedenen Orten und führt dann den Build aus.
