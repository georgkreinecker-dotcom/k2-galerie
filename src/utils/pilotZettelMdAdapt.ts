/**
 * Pilot-Zettel 20-PILOT-ZETTEL-OEK2-VK2.md ist ein kombinierter Mustertext.
 * Bei nur ök2 oder nur VK2 werden Überschrift und Fließtext angepasst –
 * getrennte Anwendungen, kein Eindruck eines „gemeinsamen“ Zugangs.
 */
export function adaptPilotOek2Vk2ZettelMd(md: string, pilotType: 'oek2' | 'vk2' | null): string {
  if (pilotType !== 'oek2' && pilotType !== 'vk2') return md
  return md
    .split('\n')
    .flatMap((line) => {
      /** Kombinierte Zeile → nur die für die jeweilige Linie relevante Anweisung */
      if (
        line.startsWith('**Deinen Weg festlegen:**') ||
        line.startsWith('**Deinen Weg festlegen (wichtig):**')
      ) {
        if (pilotType === 'oek2') {
          return [
            '**Deinen Weg festlegen (wichtig):** Unter **„Wofür nutzt du deine Galerie?“** (Einstellungen → Meine Daten) **eine Sparte wählen** – davon hängen Typ und Kategorien in „Werke verwalten“ ab.',
          ]
        }
        if (pilotType === 'vk2') {
          return [
            '**Deinen Weg festlegen (wichtig):** Unter **Einstellungen** **Verein** und **Kunstrichtungen** zu euch passend eintragen – damit Galerie und Kategorien zu euch passen.',
          ]
        }
      }
      if (pilotType === 'oek2') {
        if (line.startsWith('# ')) return ['# Testpilot:in ök2 – Demo-Galerie (voller Gratis-Zugang)']
        if (line.startsWith('**QR und feste Adressen**')) {
          return [
            '**QR und Adresse** stehen in der **Tabelle unten**. **ök2** ist eine **eigene Anwendung** (Künstler-Demo) – getrennt von VK2 und K2 Familie.',
          ]
        }
        if (line.trim().startsWith('*ök2 = Demo')) {
          return [
            '*ök2 = Demo für Künstler:innen – **eigene** Web-Galerie im Browser (Laptop und Handy). Einmal **Drucken / Als PDF speichern**, mitgeben.*',
          ]
        }
        /** Kombinierte „In einem Satz“-Zeile für ök2 nicht anzeigen */
        if (line.includes('**In einem Satz:**') && line.includes('VK2')) {
          return []
        }
        if (line.trim().startsWith('*Stand:') && line.includes('ök2 & VK2')) {
          return ['*Stand: April 2026. Nur ök2.*']
        }
      }
      if (pilotType === 'vk2') {
        if (line.startsWith('# ')) return ['# Testpilot:in VK2 – Vereinsplattform (voller Gratis-Zugang)']
        if (line.startsWith('**QR und feste Adressen**')) {
          return [
            '**QR und Adresse** stehen in der **Tabelle unten**. **VK2** ist eine **eigene Anwendung** (Vereinsplattform) – getrennt von ök2 und K2 Familie.',
          ]
        }
        if (line.trim().startsWith('*ök2 = Demo')) {
          return [
            '*VK2 = Vereinsplattform – **eigene** Anwendung im Browser (Laptop und Handy). Einmal **Drucken / Als PDF speichern**, mitgeben.*',
          ]
        }
        if (line.includes('**In einem Satz:**') && line.includes('ök2')) {
          return [
            '**In einem Satz:** *„Vereinsplattform mit Mitgliedern und öffentlicher Galerie – **nur VK2**, eigene Anwendung.“*',
          ]
        }
        if (line.trim().startsWith('*Stand:') && line.includes('ök2 & VK2')) {
          return ['*Stand: April 2026. Nur VK2.*']
        }
      }
      return [line]
    })
    .join('\n')
}
