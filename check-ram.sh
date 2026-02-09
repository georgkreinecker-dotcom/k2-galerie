#!/bin/bash

# RAM-Check Script für K2 Galerie
# Prüft RAM-Verbrauch von System, Cursor und Node-Prozessen

echo "🔍 RAM-ANALYSE"
echo "=============="
echo ""

# System RAM
echo "💻 SYSTEM RAM:"
vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages\s+([^:]+)[^\d]+(\d+)/ and printf("%-16s % 16.2f Mi\n", "$1:", $2 * $size / 1048576);'
echo ""

# Cursor RAM
echo "📝 CURSOR RAM:"
ps aux | grep -i "cursor" | grep -v grep | awk '{printf "%-30s %10.2f MB\n", $11, $6/1024}' | head -5
CURSOR_RAM=$(ps aux | grep -i cursor | grep -v grep | awk '{sum+=$6} END {print sum/1024}')
if [ -z "$CURSOR_RAM" ]; then
  echo "Cursor läuft nicht oder kann nicht gemessen werden"
else
  echo "Gesamt Cursor RAM: ${CURSOR_RAM} MB"
fi
echo ""

# Node/Vite RAM
echo "⚙️  NODE/VITE RAM:"
ps aux | grep -E "node|vite" | grep -v grep | awk '{printf "%-30s %10.2f MB\n", $11, $6/1024}' | head -5
NODE_RAM=$(ps aux | grep -E "node|vite" | grep -v grep | awk '{sum+=$6} END {print sum/1024}')
if [ -z "$NODE_RAM" ]; then
  echo "Node/Vite läuft nicht"
else
  echo "Gesamt Node/Vite RAM: ${NODE_RAM} MB"
fi
echo ""

# Browser RAM (Chrome/Safari)
echo "🌐 BROWSER RAM:"
ps aux | grep -E "Google Chrome|Safari|Firefox" | grep -v grep | awk '{printf "%-30s %10.2f MB\n", $11, $6/1024}' | head -5
BROWSER_RAM=$(ps aux | grep -E "Google Chrome|Safari|Firefox" | grep -v grep | awk '{sum+=$6} END {print sum/1024}')
if [ -z "$BROWSER_RAM" ]; then
  echo "Browser läuft nicht oder kann nicht gemessen werden"
else
  echo "Gesamt Browser RAM: ${BROWSER_RAM} MB"
fi
echo ""

# Top 10 Prozesse nach RAM
echo "📊 TOP 10 PROZESSE NACH RAM:"
ps aux | sort -rk 6 | head -11 | tail -10 | awk '{printf "%-30s %10.2f MB\n", $11, $6/1024}'
echo ""

# Warnung wenn RAM hoch
TOTAL_USED=$(vm_stat | grep "Pages active" | awk '{print $3}' | sed 's/\.//')
if [ ! -z "$TOTAL_USED" ]; then
  echo "💡 TIPP:"
  echo "   - Wenn Cursor > 2GB RAM verwendet: Cursor neu starten"
  echo "   - Wenn Node > 500MB RAM verwendet: Dev-Server neu starten"
  echo "   - Wenn Browser > 1GB RAM verwendet: Browser-Tabs schließen"
fi
