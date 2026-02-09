#!/bin/bash
# Startet Dev-Server im Netzwerk-Modus (für zweiten Mac erreichbar)

cd "$HOME/k2Galerie" || cd "/Users/georgkreinecker/k2Galerie" || exit 1
export PATH="$HOME/.local/node-v20.19.0-darwin-x64/bin:$PATH"

echo "🚀 Starte K2 Dev-Server im Netzwerk-Modus..."
echo "📡 Erreichbar von anderen Geräten im Netzwerk"
echo ""

# Zeige lokale IP-Adresse
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "IP nicht gefunden")
echo "🌐 Lokale IP: $LOCAL_IP"
echo "🔗 URL: http://$LOCAL_IP:5177/"
echo ""
echo "💡 Auf dem zweiten Mac öffnen: http://$LOCAL_IP:5177/"
echo ""

npm run dev
