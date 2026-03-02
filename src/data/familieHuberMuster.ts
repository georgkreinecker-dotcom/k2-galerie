/**
 * Musterfamilie Huber – bunte Familie mit Dummy-Namen und Platzhalter-Bildern.
 * Paul & Antonia, 4 Kinder (2 Söhne, 2 Töchter), 6 Enkel, 3 Urenkel.
 * Eine Tochter (Maria) hat Lebenspartnerin Sophie und adoptiertes Kind Leon.
 * Seed-Funktion: lädt alle Daten für Tenant "huber" und fügt die Familie zur Auswahl hinzu.
 */

import type { K2FamiliePerson, K2FamilieEvent, K2FamilieMoment } from '../types/k2Familie'
import { savePersonen, saveEvents, saveMomente } from '../utils/familieStorage'
import { setFamilyPageTexts } from '../config/pageTextsFamilie'
import { setFamilyPageContent } from '../config/pageContentFamilie'

export const FAMILIE_HUBER_TENANT_ID = 'huber'

/** Anzeigename für Tenant im Dropdown (z. B. "Familie Huber" für huber). */
export function getFamilieTenantDisplayName(tenantId: string, defaultLabel: string = 'Standard'): string {
  if (tenantId === FAMILIE_HUBER_TENANT_ID) return 'Familie Huber'
  if (tenantId === 'default') return defaultLabel
  return tenantId
}

/** Platzhalter-Bilder (picsum), pro Person ein anderes Bild. */
function photo(id: string): string {
  return `https://picsum.photos/seed/${id}/400/400`
}

const now = new Date().toISOString()

function person(
  id: string,
  name: string,
  shortText: string,
  parentIds: string[],
  childIds: string[],
  partners: { personId: string; from: string | null; to: string | null }[],
  siblingIds: string[],
  wahlfamilieIds: string[] = []
): K2FamiliePerson {
  return {
    id,
    name,
    shortText,
    photo: photo(id),
    parentIds,
    childIds,
    partners,
    siblingIds,
    wahlfamilieIds,
    createdAt: now,
    updatedAt: now,
  }
}

export function getFamilieHuberPersonen(): K2FamiliePerson[] {
  return [
    person('paul', 'Paul Huber', 'Vater, *1955. Genießt die Rente und die Enkel.', [], ['thomas', 'stefan', 'lisa', 'maria'], [{ personId: 'antonia', from: '1978-06-01', to: null }], [], []),
    person('antonia', 'Antonia Huber', 'Mutter, *1957. Herzensmensch der ganzen Familie.', [], ['thomas', 'stefan', 'lisa', 'maria'], [{ personId: 'paul', from: '1978-06-01', to: null }], [], []),
    person('thomas', 'Thomas Huber', 'Sohn, *1982. Ingenieur, zwei Kinder.', ['paul', 'antonia'], ['max', 'anna'], [], ['stefan', 'lisa', 'maria'], []),
    person('stefan', 'Stefan Huber', 'Sohn, *1984. Lehrer, eine Tochter.', ['paul', 'antonia'], ['julia'], [], ['thomas', 'lisa', 'maria'], []),
    person('lisa', 'Lisa Huber', 'Tochter, *1986. Ärztin, zwei Kinder.', ['paul', 'antonia'], ['david', 'sarah'], [], ['thomas', 'stefan', 'maria'], []),
    person('maria', 'Maria Huber', 'Tochter, *1988. Lebenspartnerin Sophie, adoptiertes Kind Leon.', ['paul', 'antonia'], ['leon'], [{ personId: 'sophie', from: '2012-03-01', to: null }], ['thomas', 'stefan', 'lisa'], []),
    person('sophie', 'Sophie Berger', 'Lebenspartnerin von Maria, *1990. Leon ist unser gemeinsames Kind.', [], ['leon'], [{ personId: 'maria', from: '2012-03-01', to: null }], [], []),
    person('leon', 'Leon Berger-Huber', 'Adoptivsohn von Maria & Sophie, *2015. Unser Sonnenschein.', ['maria', 'sophie'], [], [], [], []),
    person('max', 'Max Huber', 'Sohn von Thomas, *2005. Zwei Kinder (Lotta, Felix).', ['thomas'], ['lotta', 'felix'], [], ['anna'], []),
    person('anna', 'Anna Huber', 'Tochter von Thomas, *2007. Mama von Noah.', ['thomas'], ['noah'], [], ['max'], []),
    person('julia', 'Julia Huber', 'Tochter von Stefan, *2009.', ['stefan'], [], [], [], []),
    person('david', 'David Huber', 'Sohn von Lisa, *2010.', ['lisa'], [], [], ['sarah'], []),
    person('sarah', 'Sarah Huber', 'Tochter von Lisa, *2012.', ['lisa'], [], [], ['david'], []),
    person('lotta', 'Lotta Huber', 'Urenkelin, *2020. Tochter von Max.', ['max'], [], [], ['felix'], []),
    person('felix', 'Felix Huber', 'Urenkel, *2022. Sohn von Max.', ['max'], [], [], ['lotta'], []),
    person('noah', 'Noah Huber', 'Urenkel, *2023. Sohn von Anna.', ['anna'], [], [], [], []),
  ]
}

/** Ein Jahr im Leben der Familie Huber – Events. */
export function getFamilieHuberEvents(): K2FamilieEvent[] {
  const y = new Date().getFullYear()
  return [
    { id: 'ev-neujahr', title: 'Neujahrstreffen bei Oma & Opa', date: `${y}-01-01`, participantIds: ['paul', 'antonia', 'thomas', 'stefan', 'lisa', 'maria', 'sophie', 'leon'], note: 'Brunch und Spaziergang.', createdAt: now, updatedAt: now },
    { id: 'ev-geburtstag-antonia', title: 'Antonias Geburtstag', date: `${y}-02-14`, participantIds: ['antonia', 'paul', 'thomas', 'lisa', 'maria'], note: 'Kuchen bei uns zu Hause.', createdAt: now, updatedAt: now },
    { id: 'ev-ostern', title: 'Osterfeier Familie Huber', date: `${y}-03-30`, participantIds: ['paul', 'antonia', 'thomas', 'max', 'anna', 'noah', 'stefan', 'julia', 'lisa', 'david', 'sarah', 'maria', 'sophie', 'leon'], note: 'Ostereiersuchen für die Kleinen.', createdAt: now, updatedAt: now },
    { id: 'ev-leon-geb', title: 'Leons Geburtstag', date: `${y}-05-10`, participantIds: ['leon', 'maria', 'sophie', 'paul', 'antonia', 'lisa', 'david'], note: 'Kinderparty im Garten.', createdAt: now, updatedAt: now },
    { id: 'ev-sommerfest', title: 'Sommerfest im Garten', date: `${y}-07-20`, participantIds: ['paul', 'antonia', 'thomas', 'stefan', 'lisa', 'maria', 'sophie', 'leon', 'max', 'anna', 'julia', 'david', 'sarah', 'lotta', 'felix', 'noah'], note: 'Grillen, Spiele, alle Generationen.', createdAt: now, updatedAt: now },
    { id: 'ev-lotta-geb', title: 'Lottas Geburtstag', date: `${y}-08-15`, participantIds: ['lotta', 'max', 'anna', 'felix', 'paul', 'antonia'], note: '4 Jahre!', createdAt: now, updatedAt: now },
    { id: 'ev-erntedank', title: 'Erntedank bei Oma Antonia', date: `${y}-10-06`, participantIds: ['paul', 'antonia', 'thomas', 'lisa', 'maria', 'sophie', 'leon'], note: 'Kürbissuppe und Brot.', createdAt: now, updatedAt: now },
    { id: 'ev-weihnachten', title: 'Weihnachten Familie Huber', date: `${y}-12-24`, participantIds: ['paul', 'antonia', 'thomas', 'stefan', 'lisa', 'maria', 'sophie', 'leon', 'max', 'anna', 'julia', 'david', 'sarah', 'lotta', 'felix', 'noah'], note: 'Heiligabend bei Paul & Antonia.', createdAt: now, updatedAt: now },
    { id: 'ev-silvester', title: 'Silvester – Rutschen ins neue Jahr', date: `${y}-12-31`, participantIds: ['paul', 'antonia', 'thomas', 'max', 'anna', 'noah', 'stefan', 'lisa'], note: 'Feuerwerk für die Großen.', createdAt: now, updatedAt: now },
  ]
}

/** Momente – kleine Geschichten im Jahr. */
export function getFamilieHuberMomente(): K2FamilieMoment[] {
  const y = new Date().getFullYear()
  return [
    { id: 'mo-paul-ski', personId: 'paul', title: 'Skitage mit den Enkeln', date: `${y}-01-15`, image: photo('paul-ski'), text: 'Mit Max, Anna und Julia auf der Piste. Antonia hat den Kuchen organisiert.', createdAt: now, updatedAt: now },
    { id: 'mo-maria-leon', personId: 'maria', title: 'Leons erster Schultag', date: `${y}-09-01`, image: photo('leon'), text: 'Leon geht in die erste Klasse. Sophie und ich sind so stolz.', createdAt: now, updatedAt: now },
    { id: 'mo-anna-noah', personId: 'anna', title: 'Noahs erste Schritte', date: `${y}-03-22`, image: photo('noah'), text: 'Heute ist Noah zum ersten Mal alleine gelaufen – bei Oma und Opa.', createdAt: now, updatedAt: now },
    { id: 'mo-lisa-urlaub', personId: 'lisa', title: 'Familienurlaub am See', date: `${y}-08-10`, image: photo('lisa-urlaub'), text: 'Eine Woche mit David und Sarah am Wörthersee. Alle haben schwimmen gelernt.', createdAt: now, updatedAt: now },
    { id: 'mo-antonia-garten', personId: 'antonia', title: 'Neuer Gemüsegarten', date: `${y}-04-05`, image: photo('antonia-garten'), text: 'Mit Paul die Beete umgegraben. Im Sommer ernten wir gemeinsam.', createdAt: now, updatedAt: now },
    { id: 'mo-stefan-julia', personId: 'stefan', title: 'Julia gewinnt Vorlesewettbewerb', date: `${y}-06-12`, image: photo('julia'), text: 'Julia hat den Schulwettbewerb gewonnen. Wir feiern mit Eis.', createdAt: now, updatedAt: now },
    { id: 'mo-max-lotta-felix', personId: 'max', title: 'Spielplatz mit Lotta und Felix', date: `${y}-05-01`, image: photo('max-kids'), text: 'Erster Mai – Picknick und Spielplatz. Die beiden sind nicht mehr zu bremsen.', createdAt: now, updatedAt: now },
    { id: 'mo-weihnachten', personId: 'paul', title: 'Weihnachten – alle zusammen', date: `${y}-12-24`, image: photo('weihnachten'), text: 'Heiligabend mit der ganzen Familie. 16 Personen um einen Tisch.', createdAt: now, updatedAt: now },
  ]
}

function addTenantToList(tenantId: string): void {
  try {
    const key = 'k2-familie-tenant-list'
    const raw = localStorage.getItem(key)
    const list: string[] = raw ? JSON.parse(raw) : []
    if (!list.includes(tenantId)) {
      list.push(tenantId)
      localStorage.setItem(key, JSON.stringify(list))
    }
    sessionStorage.setItem('k2-familie-current-tenant', tenantId)
  } catch (e) {
    console.error('Familie Huber: Tenant-Liste aktualisieren fehlgeschlagen', e)
  }
}

/**
 * Lädt die Musterfamilie Huber in den Tenant "huber".
 * Fügt "huber" zur Familien-Auswahl hinzu und wechselt dorthin.
 * Kann mehrfach aufgerufen werden (überschreibt dann die Daten).
 */
export function seedFamilieHuber(): boolean {
  const tenantId = FAMILIE_HUBER_TENANT_ID
  const personen = getFamilieHuberPersonen()
  const events = getFamilieHuberEvents()
  const momente = getFamilieHuberMomente()

  if (!savePersonen(tenantId, personen, { allowReduce: true })) return false
  if (!saveEvents(tenantId, events, { allowReduce: true })) return false
  if (!saveMomente(tenantId, momente, { allowReduce: true })) return false

  setFamilyPageTexts(tenantId, {
    welcomeTitle: 'Familie Huber',
    welcomeSubtitle: 'Vier Generationen – bunt und verbunden',
    introText: 'Paul und Antonia, ihre vier Kinder, sechs Enkelkinder und drei Urenkel. Eine Tochter lebt mit ihrer Lebenspartnerin Sophie und dem adoptierten Sohn Leon. Ein Jahr voller Feste, Geburtstage und gemeinsamer Momente.',
    buttonStammbaum: 'Stammbaum ansehen',
    buttonEvents: 'Events & Termine',
    buttonKalender: 'Kalender & Übersicht',
  })

  setFamilyPageContent(tenantId, {
    welcomeImage: 'https://picsum.photos/seed/huber-family/1200/500',
    cardImage: 'https://picsum.photos/seed/huber-card/800/400',
  })

  addTenantToList(tenantId)
  return true
}
