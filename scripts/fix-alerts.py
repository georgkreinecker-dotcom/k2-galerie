#!/usr/bin/env python3
import re

with open('components/ScreenshotExportAdmin.tsx', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (
        "alert('⚠️ API-Timeout:\\n\\nDie Anfrage dauerte zu lange (über 30 Sekunden).\\n\\n📋 Bitte manuell:\\n1. Terminal öffnen\\n2. cd /Users/georgkreinecker/k2Galerie\\n3. Prüfe ob public/gallery-data.json existiert\\n4. Falls ja: git add/commit/push manuell')",
        "alert('\u26a0\ufe0f Speichern dauert gerade zu lange.\\n\\nBitte kurz warten und nochmal auf \u201eSpeichern\u201c klicken.\\nFalls es wieder passiert: Bitte dem Assistenten Bescheid geben.')"
    ),
    (
        "alert('⚠️ API-Timeout:\\n\\nDie Anfrage dauerte zu lange.\\n\\n📋 Bitte manuell:\\n1. Terminal öffnen\\n2. cd /Users/georgkreinecker/k2Galerie\\n3. Prüfe ob public/gallery-data.json existiert\\n4. Falls ja: git add/commit/push manuell')",
        "alert('\u26a0\ufe0f Speichern dauert zu lange.\\n\\nBitte kurz warten und nochmal auf \u201eSpeichern\u201c klicken.')"
    ),
    (
        'alert(\'✅ gallery-data.json wurde heruntergeladen!\\n\\n📁 Nächste Schritte:\\n1. Datei in "public" Ordner kopieren (im Projektordner)\\n2. Terminal öffnen und ausführen:\\n   git add public/gallery-data.json\\n   git commit -m "Update"\\n   git push\\n3. Auf Vercel warten bis Deployment fertig\\n4. Mobile: Seite neu laden\\n\\n💡 Tipp: Falls Dev-Server läuft, wird die Datei automatisch geschrieben!\')',
        "alert('\u26a0\ufe0f Automatisches Speichern nicht m\u00f6glich (Server nicht aktiv).\\n\\nBitte dem Assistenten Bescheid geben \u2013 einmalige Einrichtung n\u00f6tig.')"
    ),
]

for old, new in replacements:
    if old in content:
        content = content.replace(old, new, 1)
        print('Ersetzt: ' + old[:60] + '...')
    else:
        print('NICHT GEFUNDEN: ' + old[:60] + '...')

# Git-Push Fehlermeldungen (msg-Variable mit Backtick-String)
pattern = r'`GIT PUSH FEHLGESCHLAGEN\\n\\nDatei geschrieben: public/gallery-data\.json\\nGr.{1,300}git push origin main`'
matches = re.findall(pattern, content, re.DOTALL)
print('Git-Push Fehlermeldungen gefunden: ' + str(len(matches)))
new_msg = '`\u26a0\ufe0f Galerie konnte nicht ver\u00f6ffentlicht werden.\\\\n\\\\nBitte nochmal auf Speichern klicken. Falls es wieder nicht klappt: Bitte dem Assistenten Bescheid geben.`'
content = re.sub(pattern, new_msg, content, flags=re.DOTALL)

# Unklar-Status Muster
pattern2 = r'`Git Push Status unklar\\n\\nDatei: public/gallery-data\.json.{1,500}git add/commit/push`'
matches2 = re.findall(pattern2, content, re.DOTALL)
print('Unklar-Status gefunden: ' + str(len(matches2)))
new_msg2 = '`\u26a0\ufe0f Speichern m\u00f6glicherweise nicht abgeschlossen.\\\\n\\\\nBitte Seite neu laden und nochmal auf Speichern klicken.`'
content = re.sub(pattern2, new_msg2, content, flags=re.DOTALL)

with open('components/ScreenshotExportAdmin.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Datei gespeichert.')
