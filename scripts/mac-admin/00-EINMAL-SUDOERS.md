# Einmalig: Joe darf Systemzeug ohne dein Nerven

## Warum

Time Machine, Plattenplatz, geschützte Ordner brauchen manchmal Admin-Rechte.  
Dein Passwort gehört **nicht** in den Chat.  
Lösung: **einmal** freigeben – danach startet Joe die Hilfsskripte selbst.

## Was du einmal machst (danach nie wieder für diese Skripte)

1. Mac-Terminal öffnen  
2. **Nur diese eine Zeile** einfügen + Enter:

```
bash "/Users/georgkreinecker/k2Galerie/scripts/mac-admin/install-sudoers-mac-admin.sh"
```

3. Mac-Passwort tippen + Enter  
4. Warten auf „Fertig“

Danach: Bei Backup-/Plattenproblemen sagst du nur Bescheid (oder Screenshot) – Joe prüft und löscht/sichert selbst.

## Was freigegeben wird

Nur Skripte unter `scripts/mac-admin/` (z. B. alte Time-Machine-Ordner 2016/17 auf Platte „Backup“).  
Nicht: beliebiges sudo für alles.
