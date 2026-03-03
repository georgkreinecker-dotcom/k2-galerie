/**
 * Deutsche UI-Texte (Schlüssel → Text)
 * Weitere Sprachen: strings.en.ts, strings.fr.ts mit gleichen Keys.
 * Nutzung: import { t } from '../i18n'; t('key')
 */

export const stringsDe: Record<string, string> = {
  // Allgemein
  'common.ok': 'OK',
  'common.cancel': 'Abbrechen',
  'common.save': 'Speichern',
  'common.delete': 'Löschen',
  'common.copy': 'Kopieren',
  'common.close': 'Schließen',

  // Medienspiegel
  'medienspiegel.title': 'Medienspiegel',
  'medienspiegel.intro': 'Lege deine Presse-Empfänger an (einzeln oder aus einer Liste). Häkchen setzen, welche Medien du kontaktieren willst – ein Klick kopiert alle E-Mail-Adressen (z. B. für BCC in deinem E-Mail-Programm).',
  'medienspiegel.land_label': 'Land / Markt:',
  'medienspiegel.category_hint': 'Kategorie: Klick fügt die Medien ein und zeigt nur diese Kategorie. «Alle» zeigt die komplette Liste.',
  'medienspiegel.filter_all': 'Alle',
  'medienspiegel.filter_print': 'Print',
  'medienspiegel.filter_tv': 'TV',
  'medienspiegel.filter_radio': 'Radio',
  'medienspiegel.filter_regional': 'Regional',
  'medienspiegel.filter_online': 'Online',
  'medienspiegel.filter_kultur': 'Kultur',
  'medienspiegel.add': 'Hinzufügen',
  'medienspiegel.paste_label': 'Aus Liste einfügen (eine Zeile pro Medium: „Name, E-Mail“ oder nur E-Mail)',
  'medienspiegel.paste_btn': 'Einfügen',
  'medienspiegel.select_hint': 'Medien auswählen, dann E-Mail-Adressen kopieren:',
  'medienspiegel.select_all': 'Alle auswählen',
  'medienspiegel.select_none': 'Keine auswählen',
  'medienspiegel.copy_emails': 'E-Mail-Adressen kopieren',
  'medienspiegel.copy_emails_count': 'E-Mail-Adressen kopieren ({count} Medien)',
  'medienspiegel.copy_emails_first': 'E-Mail-Adressen kopieren (zuerst Medien auswählen)',
  'medienspiegel.empty': 'Noch keine Medien. Füge welche hinzu oder füge eine Liste ein.',
}
