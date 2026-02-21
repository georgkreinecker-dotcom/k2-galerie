#!/usr/bin/env python3

with open('src/pages/DevViewPage.tsx', encoding='utf-8') as f:
    content = f.read()

# Zeile 1079: Titel-Zeilen
replacements = [
    ("'Veröffentlichung erfolgreich'", "'Gespeichert \u2713'"),
    ("'Code-Update (Git) läuft...'", "'Wird veröffentlicht\u2026'"),
    ("'Warte auf Vercel Deployment...'", "'Wird übertragen \u2013 bitte kurz warten\u2026'"),
    ("'✅ Bereit für Mobile!'", "'\u2705 Fertig \u2013 auf allen Geräten sichtbar!'"),
    ("'Datei wurde gespeichert'", "'Wird jetzt auf alle Geräte übertragen\u2026'"),
    ("'Terminal öffnen und Code-Update ausführen'", "'Änderungen werden hochgeladen\u2026'"),
    # Diese Zeile enthält →, deswegen unicode
    ("'Prüfe alle 10 s \u2013 erst bei \u201eBereit\u201c QR scannen'", "'In 1\u20132 Minuten auf dem Handy sichtbar'"),
    # Die Zeile mit dem Pfeil
]

for old, new in replacements:
    if old in content:
        content = content.replace(old, new, 1)
        print('Ersetzt: ' + old[:50])
    else:
        print('NICHT GEFUNDEN: ' + old[:50])

# Separate Behandlung der Zeile mit dem Pfeil (enthält \u2192)
old_arrow = 'Jetzt QR scannen. Siehst du einen \u00e4lteren Stand auf dem Handy? \u2192 Unten links auf \u201eStand\u201c tippen (l\u00e4dt neu).'
new_arrow = 'Auf dem Handy QR-Code neu scannen oder Seite neu laden.'
if old_arrow in content:
    content = content.replace(old_arrow, new_arrow, 1)
    print('Pfeil-Zeile ersetzt')
else:
    # Suche nach Teil-String
    idx = content.find('Jetzt QR scannen')
    if idx >= 0:
        print('Gefunden bei Index ' + str(idx) + ': ' + repr(content[idx:idx+120]))
    else:
        print('Pfeil-Zeile nicht gefunden')

with open('src/pages/DevViewPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fertig.')
