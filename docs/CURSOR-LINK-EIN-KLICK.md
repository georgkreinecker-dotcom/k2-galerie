# Cursor: Link im Dialog – möglichst ein Klick zum Dokument

## Was du willst

**Ein Klick auf den Link im Chat → du bist genau beim Dokument (APf, Handbuch, Drucken). Kein Umweg, keine Extra-Dialoge.**

## Was Cursor macht

Wenn du im **Cursor-Chat** auf einen Link klickst (z. B. zu k2-galerie.vercel.app), fragt Cursor aus Sicherheitsgründen: **„Do you want Cursor to open the external website?“** mit Buttons: Open | Copy | Configure Trusted Domains | Cancel.

Das kommt von der **IDE**, nicht von unserer App. Wir können das nicht abschalten.

## Einmal einrichten – dann reicht „Open“ (oder kein Dialog mehr)

1. Beim **ersten** Mal, wenn die Meldung kommt: auf **„Configure Trusted Domains“** klicken.
2. Die Domain **k2-galerie.vercel.app** (und bei lokaler Arbeit **localhost**) als vertrauenswürdig eintragen.
3. Danach: Wenn du im Chat auf einen Link zu dieser Domain klickst, soll Cursor entweder **nicht mehr fragen** oder du klickst nur noch **„Open“** und landest sofort im Browser beim Dokument.

So erreichst du dein Ziel: **Ein Klick auf den Link im Dialog (+ ggf. einmal „Open“) → du bist genau dort.** Für jedes zukünftige Dokument gilt: Ich gebe dir den Direktlink, du klickst → Open → fertig.

## Wenn du im Browser arbeitest

Wenn du die App ohnehin im **Browser** (Chrome/Safari) offen hast: Link aus dem Chat kopieren (Rechtsklick → Link-Adresse kopieren) und in die Browser-Adresszeile einfügen. Dann siehst du sofort die APf und das Dokument – ohne Cursor-Dialog.
