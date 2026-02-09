#!/bin/bash
# Räumt alle alten K2-Desktop-Dateien auf und erstellt EINE funktionierende

echo "🧹 Räume Desktop auf..."

# Lösche alle alten K2-Dateien (außer der neuen)
rm -f ~/Desktop/K2-Start.command
rm -f ~/Desktop/K2-Plattform-Öffnen.command
rm -f ~/Desktop/K2-Öffnen.command
rm -f ~/Desktop/K2-Start.webloc

echo "✅ Alte Dateien gelöscht"
echo "💚 Verwende jetzt nur noch: K2-Plattform.applescript"
