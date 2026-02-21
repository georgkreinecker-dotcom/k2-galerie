# 16. APf = Werkzeug | Galerie = Produkt

**Essenzielle Überlebensfrage des Projekts.**

---

## Die Grundregel

> **APf ist das Werkzeug. Die Galerie ist das Produkt.**

Wer das verwechselt, baut falsch – egal wie gut die Idee klingt.

---

## APf = Werkzeug (nur Mac + backupmicro)

Alles was Georg **zum Arbeiten** braucht. Nur am Mac, nicht für Besucher:

- Grafiker-Tisch, SmartPanel, DevView
- Admin (Werke, Stammdaten, Design, Einstellungen)
- mök2 (Vertrieb, Werbeunterlagen)
- Handbuch, Plan, Mission Control, Control Studio
- Notizen, Doku, Regeln

**Gespeichert:** Mac (localStorage + Repo) + **backupmicro** (Spiegelung).

---

## Galerie = Produkt (Vercel, überall)

Alles was **Besucher und Kunden** sehen. Auf jedem Gerät, in jedem Netz:

- K2 Galerie (echt), ök2 Demo, VK2 Vereinsplattform
- Shop / Kassa, Virtueller Rundgang
- Willkommensseite, Vita, AGB

**Gespeichert:** Vercel (immer aktuell) + gallery-data.json (Backup).

---

## Vor jedem neuen Feature fragen

**„Werkzeug oder Produkt?"**

| Werkzeug | Produkt |
|---------|---------|
| Nur Georg am Mac | Alle Besucher, alle Geräte |
| In APf / Admin einbauen | In Galerie / Shop einbauen |
| backupmicro für Backup | Vercel + Git für Backup |
| Mac-spezifisch OK | Muss auf Windows/Handy funktionieren |

---

## Verboten

- Admin-Funktionen auf öffentlicher Galerie-Seite
- APf-Navigation auf Besucher-Seiten
- Werkzeug-Features die Mobilzugang brauchen

---

*Doku: `.cursor/rules/apf-werkzeug-vs-produkt.mdc`*
