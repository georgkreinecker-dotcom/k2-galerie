# Handbuch bearbeiten (nur für Redaktion)

## Anrede in den Kapiteln (1–12)

Die **nummerierten Kapitel** im Benutzerhandbuch sind für **Lizenznehmer:innen** gedacht und redaktionell durchgängig **„Sie“** („Sie öffnen“, „Ihre Galerie“). Das gehört **nicht** in die Nutzer-Einleitung im **00-INDEX** (kein Meta-Hinweis für Leser) – nur hier als Regel für Bearbeitung und Prüfung.

**App-Oberfläche (Admin, APf, Dialoge für dich):** bleibt **„Du“** – das ist eine andere Ebene als dieses Handbuch.

---

## Seitenumbruch festlegen

Wo beim **Drucken** eine neue Seite beginnen soll: In einer **eigenen Zeile** eintragen:

```
[SEITENUMBRUCH]
```

- Groß-/Kleinschreibung egal (`[Seitenumbruch]` geht auch).
- Am Bildschirm **sehen Sie** eine gestrichelte Linie mit Hinweis „Seitenumbruch (beim Drucken: neue Seite)“.
- Beim Drucken bzw. PDF-Export beginnt dort eine neue Seite.

Beispiel in einer .md-Datei:

```markdown
... Text ...

[SEITENUMBRUCH]

## Nächstes Thema
...
```
