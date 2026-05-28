import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PROJECT_ROUTES, K2_GALERIE_APF_EINSTIEG, flyerEventBogenUrl } from '../config/navigation'
import { getApfPreferredFamilieTenantId } from '../utils/familieTenantCookieBackup'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { TexteSchreibtischBoard } from '../components/TexteSchreibtischBoard'
import { ZettelAktionsLeiste } from '../components/texteSchreibtisch/ZettelAktionsLeiste'
import { K2_AGENTUR_MASTER_STRATEGIE_P1_URL, K2_AGENTUR_PARTNER_DRUCK_URL } from '../config/k2AgenturAgenturVorbereitung'
import { K2_AGENTUR_KEYWORDS_P1_GOOGLE_DRUCK_URL } from '../config/k2AgenturGoogleKeywordsP1'
import {
  K2_AGENTUR_KEYWORDS_P1_SPARTEN_DRUCK_URL,
  K2_AGENTUR_KEYWORDS_P2_GOOGLE_DRUCK_URL,
  K2_AGENTUR_KEYWORDS_P3_GOOGLE_DRUCK_URL,
  K2_AGENTUR_MASTER_STRATEGIE_MEIN_WEG_URL,
  K2_AGENTUR_MASTER_STRATEGIE_P2_URL,
  K2_AGENTUR_MASTER_STRATEGIE_P3_URL,
} from '../config/k2AgenturStrategieKeywordsRegistry'

const R = PROJECT_ROUTES['k2-galerie']
const R_K2_FAMILIE = PROJECT_ROUTES['k2-familie']
const TEXTS_A4_BASE = '/projects/k2-galerie/texts-a4'
const textsA4 = (doc: string) => `${TEXTS_A4_BASE}?doc=${encodeURIComponent(doc)}`

/** Handbuch-Dokument in der APf (Smart Panel rechts) – gleicher Mechanismus wie beim Kompass */
function handbuchApf(docFile: string) {
  return `/projects/k2-galerie?page=handbuch&doc=${encodeURIComponent(docFile)}`
}

type Zettel = {
  id: string
  titel: string
  zweck: string
  to: string
  rotateDeg?: number
  /** Drucken + Weiterleiten unter dem Zettel (statisches HTML) */
  showDruckWeiterleiten?: boolean
}

type Bereich = {
  id: string
  titel: string
  untertitel: string
  akzent: string
  zoneBg: string
  zettel: Zettel[]
  /** liste = alle Zettel auf einmal (kein Blättern) */
  ansicht?: 'liste' | 'karten'
}

/** Immer sichtbar oben – ohne Schublade suchen */
const SCHNELLZUGRIFF: Zettel[] = [
  {
    id: 'sq-gruppen',
    titel: 'Gruppeneinladung',
    zweck: 'Persönlich · Verein + Name eintragen',
    to: '/texte-schreibtisch/einladung-gruppen-verantwortliche-k2-galerie.html',
    showDruckWeiterleiten: true,
  },
  {
    id: 'sq-einladung',
    titel: 'Einladung 24.–26.04.',
    zweck: 'Freunde · Mail & WhatsApp',
    to: R.notizenEinladungEroeffnung24,
  },
  {
    id: 'sq-besucherliste',
    titel: 'Besucherliste',
    zweck: 'Vorname, Name, Interesse · A4',
    to: '/k2-eroeffnung/besucherliste-vorname-name-interesse-a4.html',
  },
  {
    id: 'sq-oeffnungszeiten',
    titel: 'Flyer Öffnungszeiten',
    zweck: 'A5 · QR · Besuch vereinbaren',
    to: '/plakate-druckformate-k2/oeffnungszeiten-flyer-a5-k2.html',
  },
  {
    id: 'sq-agentur',
    titel: 'Agentur-Anfrage',
    zweck: 'Katalog Internet-Vertrieb · Drucken',
    to: '/texte-schreibtisch/agentur-anforderungskatalog-internetvertrieb.html',
    showDruckWeiterleiten: true,
  },
  {
    id: 'sq-freunde',
    titel: 'Für meine Freunde',
    zweck: 'Erklärung ök2/VK2 · Lesen/Drucken',
    to: '/freunde-erklaerung.html',
  },
]

const BEREICHE: Bereich[] = [
  {
    id: 'k2-galerie-jetzt',
    titel: 'K2 Galerie – Besuch & Einladung',
    untertitel: 'Echte Galerie: Gruppenbesuche nach der Eröffnung, Flyer, Listen, Lokalzeitung – alle Zettel als Liste.',
    akzent: '#b54a1e',
    zoneBg: 'linear-gradient(145deg, rgba(181,74,30,0.1), rgba(255,251,235,0.98))',
    ansicht: 'liste',
    zettel: [
      {
        id: 'einladung-gruppen-verantwortliche',
        titel: 'Gruppeneinladung (Verantwortliche)',
        zweck: 'Persönlich · Ansprechperson + Verein',
        to: '/texte-schreibtisch/einladung-gruppen-verantwortliche-k2-galerie.html',
        showDruckWeiterleiten: true,
      },
      {
        id: 'serienbrief-pensionistenvereine',
        titel: 'Serienbrief – Pensionistenvereine',
        zweck: 'App · Word & Druck · EF + GR',
        to: R.serienbriefGruppeneinladung,
      },
      {
        id: 'serienbrief-pensionistenvereine-liste',
        titel: 'Serienbrief – Adressliste (HTML)',
        zweck: 'CSV · Übersicht · Excel',
        to: '/texte-schreibtisch/serienbrief-pensionistenvereine-eferding-grieskirchen.html',
        showDruckWeiterleiten: true,
      },
      {
        id: 'einladung',
        titel: 'Einladung 24.–26.04.',
        zweck: 'Freunde · Mail & WhatsApp',
        to: R.notizenEinladungEroeffnung24,
      },
      {
        id: 'freunde',
        titel: 'Für meine Freunde',
        zweck: 'Lesefassung ök2/VK2',
        to: '/freunde-erklaerung.html',
      },
      {
        id: 'prospekt',
        titel: 'Prospekt Galerieeröffnung',
        zweck: 'Eine Seite, druckbar',
        to: R.prospektGalerieeroeffnung,
      },
      {
        id: 'flyer-master',
        titel: 'Flyer-Master A5',
        zweck: 'Eröffnung · bearbeiten & drucken',
        to: flyerEventBogenUrl({ tenant: 'k2' }),
      },
      {
        id: 'plakat',
        titel: 'Plakat A3',
        zweck: 'Eröffnung · A3',
        to: flyerEventBogenUrl({ mode: 'a3', tenant: 'k2', fromAdminDerivation: true }),
      },
      {
        id: 'druck-besucherliste-vn-nn-interesse',
        titel: 'Besucherliste · Vorname, Name, Interesse',
        zweck: 'A4 Quer · vor Ort ausfüllen',
        to: '/k2-eroeffnung/besucherliste-vorname-name-interesse-a4.html',
      },
      {
        id: 'druck-besucherliste-a4',
        titel: 'Besucherliste A4 (lang)',
        zweck: 'Muster & Erklärung',
        to: '/k2-eroeffnung/besucherliste-vorschlag-a4.html',
      },
      {
        id: 'druck-oeffnungszeiten-flyer-a5-k2',
        titel: 'Flyer Öffnungszeiten A5',
        zweck: 'QR · Besuch vereinbaren',
        to: '/plakate-druckformate-k2/oeffnungszeiten-flyer-a5-k2.html',
      },
      {
        id: 'druck-inserat-lokalzeitung-a4',
        titel: 'Inserat Lokalzeitung / Tips',
        zweck: 'mök2 · A4 drucken',
        to: '/projects/k2-galerie/marketing-oek2#mok2-inserat-lokalzeitung',
      },
    ],
  },
  {
    id: 'agentur-marketing',
    titel: 'Agentur & Vermarktung',
    untertitel: 'Internet-Agentur, Kampagne, Presse, Werbeunterlagen.',
    akzent: '#0f766e',
    zoneBg: 'linear-gradient(145deg, rgba(15,118,110,0.09), rgba(240,253,250,0.98))',
    zettel: [
      {
        id: 'k2-agentur-plattform',
        titel: 'K2 Agentur – APf',
        zweck: '9 Kanäle · Status · Links kopieren',
        to: R.k2Agentur,
      },
      {
        id: 'master-strategie-p1',
        titel: 'Master-Strategie P1',
        zweck: '1 Seite · Agentur & Plan B',
        to: K2_AGENTUR_MASTER_STRATEGIE_P1_URL,
        showDruckWeiterleiten: true,
      },
      {
        id: 'keywords-p1-google',
        titel: 'Keywords P1 · Kunst',
        zweck: '13 Begriffe · Pilot · Negativ',
        to: K2_AGENTUR_KEYWORDS_P1_GOOGLE_DRUCK_URL,
        showDruckWeiterleiten: true,
      },
      {
        id: 'master-mein-weg',
        titel: 'Master · Mein Weg',
        zweck: '6 Sparten · Anzeigengruppen',
        to: K2_AGENTUR_MASTER_STRATEGIE_MEIN_WEG_URL,
        showDruckWeiterleiten: true,
      },
      {
        id: 'keywords-p1-sparten',
        titel: 'Keywords P1 · 5 Sparten',
        zweck: 'Handwerk · Design · Mode · Food · Portfolio',
        to: K2_AGENTUR_KEYWORDS_P1_SPARTEN_DRUCK_URL,
        showDruckWeiterleiten: true,
      },
      {
        id: 'master-strategie-p2',
        titel: 'Master-Strategie P2',
        zweck: 'VK2 · Vereine · 1 Seite',
        to: K2_AGENTUR_MASTER_STRATEGIE_P2_URL,
        showDruckWeiterleiten: true,
      },
      {
        id: 'keywords-p2-google',
        titel: 'Keywords P2 · Google',
        zweck: '12 Begriffe · VK2',
        to: K2_AGENTUR_KEYWORDS_P2_GOOGLE_DRUCK_URL,
        showDruckWeiterleiten: true,
      },
      {
        id: 'master-strategie-p3',
        titel: 'Master-Strategie P3',
        zweck: 'K2 Familie · 1 Seite',
        to: K2_AGENTUR_MASTER_STRATEGIE_P3_URL,
        showDruckWeiterleiten: true,
      },
      {
        id: 'keywords-p3-google',
        titel: 'Keywords P3 · Google',
        zweck: '12 Begriffe · Familie',
        to: K2_AGENTUR_KEYWORDS_P3_GOOGLE_DRUCK_URL,
        showDruckWeiterleiten: true,
      },
      {
        id: 'agentur-partner-vorbereitung',
        titel: 'Agentur-Partner – 5 Punkte',
        zweck: 'Nach Antwort · Feinschliff · Angebot',
        to: K2_AGENTUR_PARTNER_DRUCK_URL,
        showDruckWeiterleiten: true,
      },
      {
        id: 'agentur-anforderungskatalog',
        titel: 'Agentur-Anfrage + Katalog',
        zweck: 'DACH · drei Produkte · Drucken',
        to: '/texte-schreibtisch/agentur-anforderungskatalog-internetvertrieb.html',
        showDruckWeiterleiten: true,
      },
      {
        id: 'marketing-kanaele-p1-p2-p3',
        titel: '9 Landing-URLs',
        zweck: 'P1/P2/P3 · Drucken',
        to: '/texte-schreibtisch/marketing-kanaele-p1-p2-p3.html',
        showDruckWeiterleiten: true,
      },
      {
        id: 'mok2-agentur-sektion',
        titel: 'mök2 – Agentur kurz',
        zweck: 'Gleicher Inhalt kompakt',
        to: `${R.marketingOek2}#mok2-agentur-internetvertrieb`,
      },
      {
        id: 'kampagne',
        titel: 'Kampagne Marketing-Strategie',
        zweck: 'Auftrag & Vorlagen',
        to: R.kampagneMarketingStrategie,
      },
      {
        id: 'werbung',
        titel: 'Werbeunterlagen',
        zweck: 'Flyer, Mappe',
        to: R.werbeunterlagen,
      },
      {
        id: 'presse',
        titel: 'Events & Öffentlichkeit',
        zweck: 'Admin Eventplan',
        to: '/admin?tab=eventplan&eventplan=öffentlichkeitsarbeit',
      },
    ],
  },
  {
    id: 'handbuecher-mappen',
    titel: 'Handbücher & Mappen',
    untertitel: 'Präsentation, Benutzer, VK2, Team – zum Lesen und Senden.',
    akzent: '#6d28d9',
    zoneBg: 'linear-gradient(145deg, rgba(124,58,237,0.08), rgba(245,243,255,0.98))',
    zettel: [
      {
        id: 'texts-pm-kurz',
        titel: 'Präsentationsmappe Kurz',
        zweck: 'Kommunikation kompakt',
        to: textsA4('pm-kurz'),
      },
      {
        id: 'texts-pm-voll',
        titel: 'Präsentationsmappe Voll',
        zweck: 'Kommunikation vollständig',
        to: textsA4('pm-voll'),
      },
      {
        id: 'texts-pm-vk2-kurz',
        titel: 'Mappe VK2 Kurz',
        zweck: 'Verein kompakt',
        to: textsA4('pm-vk2-kurz'),
      },
      {
        id: 'texts-pm-vk2-voll',
        titel: 'Mappe VK2 Voll',
        zweck: 'Verein vollständig',
        to: textsA4('pm-vk2-voll'),
      },
      {
        id: 'texts-benutzer-handbuch',
        titel: 'Handbuch Benutzer',
        zweck: 'Einstieg Nutzer:innen',
        to: textsA4('hb-benutzer'),
      },
      {
        id: 'texts-vk2-handbuch',
        titel: 'Handbuch VK2',
        zweck: 'Verein',
        to: textsA4('hb-vk2'),
      },
      {
        id: 'texts-k2team-handbuch',
        titel: 'Handbuch Team',
        zweck: 'Gesamtüberblick',
        to: textsA4('hb-team'),
      },
      {
        id: 'texts-k2-galerie-handbuch',
        titel: 'Handbuch K2 Galerie',
        zweck: 'Referenz Galerie',
        to: textsA4('hb-k2-galerie'),
      },
      {
        id: 'texts-k2-familie-handbuch',
        titel: 'Handbuch K2 Familie',
        zweck: 'Referenz Familie',
        to: textsA4('hb-k2-familie'),
      },
      {
        id: 'texts-andenken-erstes-projekt',
        titel: 'Andenken erstes Projekt',
        zweck: 'K2 · ök2 · VK2 · druckbar',
        to: '/texte-schreibtisch/andenken-erstes-gemeinsames-projekt-k2-oek2-vk2.html',
        showDruckWeiterleiten: true,
      },
    ],
  },
  {
    id: 'persoenlich',
    titel: 'Persönlich & Vitas',
    untertitel: 'Briefe, K2 Familie Einladung, Kurzbiographien Martina & Georg.',
    akzent: '#0c5c55',
    zoneBg: 'linear-gradient(145deg, rgba(12,92,85,0.1), rgba(240,253,250,0.98))',
    zettel: [
      {
        id: 'einladung-geschwister-k2-familie',
        titel: 'Einladung Geschwister · K2 Familie',
        zweck: 'Live-Briefe je Zweig',
        to: R_K2_FAMILIE.einladungGeschwisterBriefe,
      },
      {
        id: 'august',
        titel: 'Brief an August',
        zweck: 'Vermächtnis',
        to: R.notizenBriefAugust,
      },
      {
        id: 'andreas',
        titel: 'Brief an Andreas',
        zweck: 'Stand zeigen',
        to: R.notizenBriefAndreas,
      },
      {
        id: 'softwarestand',
        titel: 'August – Softwarestand',
        zweck: 'Technik-Überblick',
        to: R.notizenAugustSoftwarestand,
      },
      {
        id: 'vita-martina-pdf',
        titel: 'Vita Martina (PDF)',
        zweck: 'Kurzbiographie',
        to: '/texte-schreibtisch/vita-martina-k2-kurzbiographie-2026-03.pdf',
      },
      {
        id: 'vita-georg-pdf',
        titel: 'Vita Georg (PDF)',
        zweck: 'Kurzbiographie',
        to: '/texte-schreibtisch/vita-georg-k2-kurzbiographie-2026-03.pdf',
      },
      {
        id: 'vita-martina-html',
        titel: 'Vita Martina (HTML)',
        zweck: 'Browser / Drucken',
        to: '/texte-schreibtisch/vita-martina-k2-2026-03.html',
      },
      {
        id: 'vita-georg-html',
        titel: 'Vita Georg (HTML)',
        zweck: 'Browser / Drucken',
        to: '/texte-schreibtisch/vita-georg-k2-2026-03.html',
      },
    ],
  },
  {
    id: 'sonstiges',
    titel: 'Pilot · Technik · Kompass',
    untertitel: 'Test-Pilot, Software-Standards, Notfall – seltener gebraucht.',
    akzent: '#1d4ed8',
    zoneBg: 'linear-gradient(145deg, rgba(29,78,216,0.06), rgba(239,246,255,0.98))',
    zettel: [
      {
        id: 'zettel-neuer-test-pilot',
        titel: 'Neuer Test-Pilot',
        zweck: 'Laufzettel drucken',
        to: '/zettel-pilot-form',
      },
      {
        id: 'testuser-mappe',
        titel: 'Testuser-Mappe',
        zweck: 'Anmeldung & Protokolle',
        to: R.testuserMappe,
      },
      {
        id: 'druck-handbuch-standards-nachweis',
        titel: 'Softwareentwicklung Standards',
        zweck: 'Fachgespräch · Nachweis',
        to: '/texte-schreibtisch/handbuch-softwareentwicklung-standards-nachweis.html',
        showDruckWeiterleiten: true,
      },
      {
        id: 'kompass',
        titel: 'Texte & Briefe Kompass',
        zweck: 'Welcher Text wofür',
        to: handbuchApf('24-TEXTE-BRIEFE-KOMPASS.md'),
      },
      {
        id: 'themen',
        titel: 'Zentrale Themen',
        zweck: 'Große Linie Nutzer:innen',
        to: handbuchApf('16-ZENTRALE-THEMEN-FUER-NUTZER.md'),
      },
      {
        id: 'notfall',
        titel: 'Notfall-Checkliste',
        zweck: 'Wenn es brennt',
        to: handbuchApf('23-NOTFALL-CHECKLISTE.md'),
      },
    ],
  },
]

const LS_LETZTES_THEMA = 'k2-texte-schreibtisch-letztes-thema'

type LetztesThemaGespeichert = {
  zettelId: string
  bereichId: string
  bereichTitel: string
  at: string
}

export type LetztesThemaAnzeige = {
  z: Zettel
  bereichId: string
  bereichTitel: string
  at: string
}

function findeZettelMitBereich(zettelId: string): { z: Zettel; bereichId: string; bereichTitel: string } | null {
  for (const z of SCHNELLZUGRIFF) {
    if (z.id === zettelId) return { z, bereichId: 'schnellzugriff', bereichTitel: 'Schnellzugriff' }
  }
  for (const b of BEREICHE) {
    const z = b.zettel.find((zz) => zz.id === zettelId)
    if (z) return { z, bereichId: b.id, bereichTitel: b.titel }
  }
  return null
}

function ladeLetztesThemaAusSpeicher(): LetztesThemaAnzeige | null {
  try {
    const raw = localStorage.getItem(LS_LETZTES_THEMA)
    if (!raw) return null
    const p = JSON.parse(raw) as LetztesThemaGespeichert
    if (!p?.zettelId || !p?.bereichId) return null
    const hit = findeZettelMitBereich(p.zettelId)
    if (!hit) return null
    return {
      z: hit.z,
      bereichId: hit.bereichId,
      bereichTitel: p.bereichTitel || hit.bereichTitel,
      at: typeof p.at === 'string' ? p.at : '',
    }
  } catch {
    return null
  }
}

function speichereLetztesThema(z: Zettel, bereichId: string, bereichTitel: string) {
  try {
    const payload: LetztesThemaGespeichert = {
      zettelId: z.id,
      bereichId,
      bereichTitel,
      at: new Date().toISOString(),
    }
    localStorage.setItem(LS_LETZTES_THEMA, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

function formatLetztesThemaZeit(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diffMs = Date.now() - d.getTime()
  if (diffMs < 60_000) return 'gerade eben'
  if (diffMs < 3_600_000) {
    const m = Math.max(1, Math.round(diffMs / 60_000))
    return `vor ${m} Min.`
  }
  if (diffMs < 86_400_000) {
    const h = Math.max(1, Math.round(diffMs / 3_600_000))
    return `vor ${h} Std.`
  }
  return d.toLocaleString('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const LetztesThemaContext = createContext<{
  merken: (z: Zettel, bereichId: string, bereichTitel: string) => void
}>({ merken: () => {} })

function useMerkeLetztesThema() {
  return useContext(LetztesThemaContext).merken
}

function initialZettelIndex(b: Bereich, letztesBereichId: string | null | undefined, letztesZettelId: string | null | undefined): number {
  if (!letztesBereichId || !letztesZettelId || letztesBereichId !== b.id) return 0
  const i = b.zettel.findIndex((z) => z.id === letztesZettelId)
  return i >= 0 ? i : 0
}

function bereichSollOffenSein(b: Bereich, letztesBereichId: string | null | undefined): boolean {
  if (letztesBereichId) return letztesBereichId === b.id
  return b.id === 'k2-galerie-jetzt'
}

/** Öffnen-URL: Einladung Geschwister bekommt ?t= mit bevorzugter Familie (nicht nur letzte Muster-Demo-Sitzung). */
function resolveZettelOeffnenHref(z: Zettel): string {
  if (z.id === 'einladung-geschwister-k2-familie') {
    const t = getApfPreferredFamilieTenantId()
    return `${R_K2_FAMILIE.einladungGeschwisterBriefe}?t=${encodeURIComponent(t)}`
  }
  return z.to
}

function zettelDragPayload(z: Zettel, openHref: string): string {
  return `## ${z.titel}\n${z.zweck}\n\n[Öffnen](${openHref})`
}

function zettelMerkenCallback(
  merken: (z: Zettel, bereichId: string, bereichTitel: string) => void,
  z: Zettel,
  bereichId?: string,
  bereichTitel?: string,
): (() => void) | undefined {
  if (!bereichId || !bereichTitel) return undefined
  return () => merken(z, bereichId, bereichTitel)
}

/** Ganz oben: zuletzt geöffnetes oder angesehenes Thema */
function LetztesThemaKasten({ thema }: { thema: LetztesThemaAnzeige | null }) {
  const merken = useMerkeLetztesThema()
  if (!thema) return null
  const href = resolveZettelOeffnenHref(thema.z)
  const zeit = formatLetztesThemaZeit(thema.at)
  return (
    <section
      aria-labelledby="letztes-thema-heading"
      style={{
        marginBottom: '1rem',
        padding: '1rem 1.05rem 1.1rem',
        borderRadius: 14,
        background: 'linear-gradient(145deg, #1c4a7a 0%, #2563eb 42%, #3b82f6 100%)',
        border: '2px solid rgba(255,255,255,0.35)',
        boxShadow: '0 8px 24px rgba(28,78,216,0.35)',
        color: '#f8fafc',
      }}
    >
      <h2 id="letztes-thema-heading" style={{ margin: '0 0 0.35rem', fontSize: '1.12rem', fontWeight: 800 }}>
        📌 Zuletzt – hier weitermachen
      </h2>
      <p style={{ margin: '0 0 0.85rem', fontSize: '0.84rem', lineHeight: 1.45, color: 'rgba(248,250,252,0.92)' }}>
        Das war dein letztes Thema{zeit ? ` (${zeit})` : ''}. Schublade „{thema.bereichTitel}“ ist dafür aufgeklappt.
      </p>
      <div
        style={{
          padding: '0.75rem 0.85rem',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.96)',
          color: '#1c1a18',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem',
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.3 }}>{thema.z.titel}</div>
          <div style={{ fontSize: '0.82rem', color: '#5c5650', marginTop: '0.2rem', lineHeight: 1.4 }}>{thema.z.zweck}</div>
        </div>
        <ZettelAktionsLeiste
          titel={thema.z.titel}
          href={href}
          showDruckWeiterleiten={thema.z.showDruckWeiterleiten}
          onVorOeffnen={zettelMerkenCallback(merken, thema.z, thema.bereichId, thema.bereichTitel)}
        />
      </div>
    </section>
  )
}

/** Oben: feste Kacheln – kein Blättern in Schubladen */
function SchnellzugriffLeiste() {
  const merken = useMerkeLetztesThema()
  return (
    <section
      aria-labelledby="schnellzugriff-heading"
      style={{
        marginBottom: '1rem',
        padding: '0.85rem 0.9rem 1rem',
        borderRadius: 12,
        background: 'linear-gradient(165deg, #fffefb 0%, #faf6f0 100%)',
        border: '2px solid #b54a1e',
        boxShadow: '0 4px 14px rgba(28,26,24,0.12)',
      }}
    >
      <h2 id="schnellzugriff-heading" style={{ margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 800, color: '#1c1a18' }}>
        ⭐ Schnellzugriff
      </h2>
      <p style={{ margin: '0 0 0.75rem', fontSize: '0.82rem', color: '#5c5650', lineHeight: 1.4 }}>
        Die wichtigsten Zettel – <strong>ein Klick</strong>, ohne Schublade und ohne Blättern.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.5rem',
        }}
      >
        {SCHNELLZUGRIFF.map((z) => {
          const href = resolveZettelOeffnenHref(z)
          return (
            <div
              key={z.id}
              style={{
                padding: '0.55rem 0.65rem',
                borderRadius: 10,
                background: '#fff',
                border: '1px solid rgba(28,26,24,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', lineHeight: 1.25 }}>{z.titel}</div>
                <div style={{ fontSize: '0.75rem', color: '#5c5650', marginTop: '0.15rem' }}>{z.zweck}</div>
              </div>
              <ZettelAktionsLeiste
                titel={z.titel}
                href={href}
                showDruckWeiterleiten={z.showDruckWeiterleiten}
                compact
                onVorOeffnen={zettelMerkenCallback(merken, z, 'schnellzugriff', 'Schnellzugriff')}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** Eine Schublade im Hängeordner: Zettelzahl von außen sichtbar, einklappbar, innen blättern oder Liste */
function HangeregisterSchublade({
  b,
  letztesBereichId,
  letztesZettelId,
}: {
  b: Bereich
  letztesBereichId?: string | null
  letztesZettelId?: string | null
}) {
  const merken = useMerkeLetztesThema()
  const [eingeklappt, setEingeklappt] = useState(() => !bereichSollOffenSein(b, letztesBereichId))
  const [zettelIndex, setZettelIndex] = useState(() => initialZettelIndex(b, letztesBereichId, letztesZettelId))
  const n = b.zettel.length
  const safeIdx = n === 0 ? 0 : Math.min(zettelIndex, n - 1)
  const z = n > 0 ? b.zettel[safeIdx] : null
  const zettelOpenHref = z ? resolveZettelOeffnenHref(z) : ''
  const rot = z?.rotateDeg ?? 0
  const prevIdx = n < 2 ? 0 : safeIdx <= 0 ? n - 1 : safeIdx - 1
  const nextIdx = n < 2 ? 0 : safeIdx >= n - 1 ? 0 : safeIdx + 1

  const goPrev = () => {
    if (n < 2) return
    setZettelIndex((i) => {
      const neu = i <= 0 ? n - 1 : i - 1
      const zz = b.zettel[neu]
      if (zz) merken(zz, b.id, b.titel)
      return neu
    })
  }
  const goNext = () => {
    if (n < 2) return
    setZettelIndex((i) => {
      const neu = i >= n - 1 ? 0 : i + 1
      const zz = b.zettel[neu]
      if (zz) merken(zz, b.id, b.titel)
      return neu
    })
  }

  const zettelLabel = n === 1 ? '1 Zettel' : `${n} Zettel`

  return (
    <section
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        borderRadius: '6px 6px 10px 10px',
        padding: '0.5rem 0.65rem 0.85rem',
        background: `linear-gradient(180deg, ${b.akzent}18 0%, ${b.zoneBg} 28%, ${b.zoneBg} 100%)`,
        border: '1px solid rgba(28,26,24,0.22)',
        borderTop: '1px solid rgba(255,255,255,0.22)',
        boxShadow:
          '0 2px 0 rgba(255,255,255,0.15), 0 6px 14px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.35)',
      }}
    >
      <div
        aria-hidden
        style={{
          alignSelf: 'center',
          width: '52%',
          maxWidth: 120,
          height: 9,
          marginBottom: '0.55rem',
          borderRadius: 4,
          background: 'linear-gradient(180deg, #a89a8c 0%, #7a7168 45%, #5c534c 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.2)',
        }}
      />

      <button
        type="button"
        aria-expanded={!eingeklappt}
        onClick={() => setEingeklappt((v) => !v)}
        style={{
          margin: '0 0 0.2rem',
          padding: 0,
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          font: 'inherit',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '0.96rem',
            fontWeight: 800,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.35rem',
            lineHeight: 1.3,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 999, background: b.akzent, flexShrink: 0, marginTop: '0.35rem', boxShadow: '0 0 0 1px rgba(255,255,255,0.7)' }} aria-hidden />
          <span
            style={{
              flex: '1 1 auto',
              minWidth: 0,
              padding: '0.12rem 0.35rem',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(28,26,24,0.12)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            }}
          >
            {b.titel}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#334155',
              background: 'rgba(255,254,251,0.92)',
              padding: '0.15rem 0.45rem',
              borderRadius: 999,
              border: '1px solid rgba(28,26,24,0.1)',
              whiteSpace: 'nowrap',
            }}
            title="Anzahl Zettel in dieser Schublade"
          >
            {zettelLabel}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#5c5650', marginLeft: 'auto' }} aria-hidden>
            {eingeklappt ? '▸' : '▾'}
          </span>
        </h3>
      </button>

      <p
        style={{
          margin: '0 0 0.65rem',
          fontSize: '0.74rem',
          color: '#334155',
          lineHeight: 1.46,
          background: 'rgba(255,255,255,0.68)',
          border: '1px solid rgba(28,26,24,0.1)',
          borderRadius: 8,
          padding: '0.35rem 0.45rem',
          ...(eingeklappt
            ? {
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }
            : {}),
        }}
      >
        {eingeklappt ? `${b.untertitel} · Tippen zum Aufklappen.` : b.untertitel}
      </p>

      {!eingeklappt && b.ansicht === 'liste' && (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '0.35rem 0.2rem 0.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            flex: 1,
          }}
        >
          {b.zettel.map((zz) => {
            const href = resolveZettelOeffnenHref(zz)
            return (
              <li
                key={zz.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  padding: '0.5rem 0.55rem',
                  borderRadius: 8,
                  background: '#fffefb',
                  border: '1px solid rgba(28,26,24,0.08)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', lineHeight: 1.25 }}>{zz.titel}</div>
                  <div style={{ fontSize: '0.74rem', color: '#5c5650', marginTop: '0.12rem', lineHeight: 1.35 }}>{zz.zweck}</div>
                </div>
                <ZettelAktionsLeiste
                  titel={zz.titel}
                  href={href}
                  showDruckWeiterleiten={zz.showDruckWeiterleiten}
                  compact
                  onVorOeffnen={zettelMerkenCallback(merken, zz, b.id, b.titel)}
                />
              </li>
            )
          })}
        </ul>
      )}

      {!eingeklappt && b.ansicht !== 'liste' && z && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.55rem',
            flex: 1,
            borderRadius: 8,
            padding: '0.4rem 0.25rem 0.15rem',
            background: 'rgba(255,254,251,0.45)',
            boxShadow: 'inset 0 1px 4px rgba(28,26,24,0.06)',
          }}
        >
          <div
            draggable
            title="Ziehen = in die Mitte legen · unten: Seite wirklich öffnen"
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', zettelDragPayload(z, zettelOpenHref))
              e.dataTransfer.effectAllowed = 'copy'
            }}
            style={{
              textDecoration: 'none',
              color: '#1c1a18',
              background: 'linear-gradient(180deg, #fffefb 0%, #faf6f0 100%)',
              borderRadius: 12,
              padding: '0.85rem 1rem 1rem',
              boxShadow: '0 3px 0 rgba(28,26,24,0.06), 0 6px 16px rgba(28,26,24,0.08)',
              border: '1px solid rgba(28,26,24,0.08)',
              transform: `rotate(${rot}deg)`,
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              minHeight: 88,
              cursor: 'grab',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `rotate(${rot}deg) translateY(-2px)`
              e.currentTarget.style.boxShadow = '0 4px 0 rgba(28,26,24,0.05), 0 10px 24px rgba(28,26,24,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `rotate(${rot}deg)`
              e.currentTarget.style.boxShadow = '0 3px 0 rgba(28,26,24,0.06), 0 6px 16px rgba(28,26,24,0.08)'
            }}
          >
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: b.akzent,
                marginBottom: '0.65rem',
                opacity: 0.92,
              }}
            />
            <div style={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.25, marginBottom: '0.35rem' }}>{z.titel}</div>
            <div style={{ fontSize: '0.82rem', color: '#5c5650', lineHeight: 1.4 }}>{z.zweck}</div>
          </div>

          <ZettelAktionsLeiste
            titel={z.titel}
            href={zettelOpenHref}
            showDruckWeiterleiten={z.showDruckWeiterleiten}
            onVorOeffnen={zettelMerkenCallback(merken, z, b.id, b.titel)}
            blaettern={
              n > 1
                ? {
                    index: safeIdx,
                    total: n,
                    onPrev: goPrev,
                    onNext: goNext,
                    prevTitel: b.zettel[prevIdx]?.titel,
                    nextTitel: b.zettel[nextIdx]?.titel,
                  }
                : undefined
            }
          />
        </div>
      )}
    </section>
  )
}

function normSuche(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function alleZettelMitBereich(): { z: Zettel; bereich: string; bereichId: string }[] {
  const out: { z: Zettel; bereich: string; bereichId: string }[] = []
  for (const z of SCHNELLZUGRIFF) out.push({ z, bereich: 'Schnellzugriff', bereichId: 'schnellzugriff' })
  for (const b of BEREICHE) {
    for (const z of b.zettel) out.push({ z, bereich: b.titel, bereichId: b.id })
  }
  return out
}

function SuchergebnisListe({ query }: { query: string }) {
  const merken = useMerkeLetztesThema()
  const treffer = useMemo(() => {
    const q = normSuche(query.trim())
    if (!q) return []
    return alleZettelMitBereich().filter(({ z, bereich }) => {
      const hay = normSuche(`${z.titel} ${z.zweck} ${bereich} ${z.id}`)
      return hay.includes(q)
    })
  }, [query])

  const q = query.trim()
  if (!q) return null

  return (
    <section
      aria-labelledby="suche-heading"
      style={{
        marginBottom: '1rem',
        padding: '0.75rem 0.85rem',
        borderRadius: 12,
        background: '#fffefb',
        border: '1px solid rgba(28,26,24,0.12)',
      }}
    >
      <h2 id="suche-heading" style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 800 }}>
        🔍 Suche: „{q}" – {treffer.length} Treffer
      </h2>
      {treffer.length === 0 ? (
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#5c5650' }}>
          Kein Zettel passt. Probiere z. B. <strong>Gruppe</strong>, <strong>Agentur</strong>, <strong>Flyer</strong>,{' '}
          <strong>Besucher</strong>, <strong>Handbuch</strong>.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {treffer.map(({ z, bereich, bereichId }) => {
            const href = resolveZettelOeffnenHref(z)
            return (
              <li
                key={`${bereichId}-${z.id}`}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  padding: '0.5rem 0.55rem',
                  borderRadius: 8,
                  background: '#faf6f0',
                  border: '1px solid rgba(28,26,24,0.08)',
                }}
              >
                <div style={{ flex: '1 1 12rem', minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{z.titel}</div>
                  <div style={{ fontSize: '0.74rem', color: '#5c5650' }}>
                    {bereich} · {z.zweck}
                  </div>
                </div>
                <div style={{ flex: '1 1 14rem', minWidth: 200, maxWidth: 320 }}>
                  <ZettelAktionsLeiste
                    titel={z.titel}
                    href={href}
                    showDruckWeiterleiten={z.showDruckWeiterleiten}
                    compact
                    onVorOeffnen={zettelMerkenCallback(merken, z, bereichId, bereich)}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default function TexteSchreibtischPage() {
  const [suche, setSuche] = useState('')
  const [letztesThema, setLetztesThema] = useState<LetztesThemaAnzeige | null>(() => ladeLetztesThemaAusSpeicher())
  const merken = useCallback((z: Zettel, bereichId: string, bereichTitel: string) => {
    speichereLetztesThema(z, bereichId, bereichTitel)
    setLetztesThema({ z, bereichId, bereichTitel, at: new Date().toISOString() })
  }, [])

  return (
    <LetztesThemaContext.Provider value={{ merken }}>
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(165deg, #e8dcc8 0%, #f0e6d4 35%, #ebe0cf 70%, #e2d3bc 100%)',
        color: '#1c1a18',
        padding: '1.25rem 1rem 2.5rem',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <Link
          to={K2_GALERIE_APF_EINSTIEG}
          style={{
            color: '#5c5650',
            fontSize: '0.88rem',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '0.75rem',
            fontWeight: 600,
          }}
        >
          ← Zur APf
        </Link>

        <header style={{ marginBottom: '1.1rem' }}>
          <h1 style={{ margin: '0 0 0.35rem', fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
            🪑 Texte-Schreibtisch
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', color: '#5c5650', maxWidth: 52 * 16, lineHeight: 1.45 }}>
            <strong>Oben:</strong> dein <strong>letztes Thema</strong> – sofort sichtbar, ein Klick zum Weitermachen. Darunter Schnellzugriff, Suche und{' '}
            <strong>fünf Schubladen</strong> (die passende ist aufgeklappt).
          </p>
        </header>

        <LetztesThemaKasten thema={letztesThema} />

        <SchnellzugriffLeiste />

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="texte-schreibtisch-suche" style={{ display: 'block', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
            🔍 Alle Zettel durchsuchen
          </label>
          <input
            id="texte-schreibtisch-suche"
            type="search"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="z. B. Gruppe, Agentur, Flyer, Besucherliste, Handbuch …"
            style={{
              width: '100%',
              maxWidth: 480,
              padding: '0.55rem 0.75rem',
              borderRadius: 10,
              border: '1px solid rgba(28,26,24,0.18)',
              fontSize: '0.95rem',
              background: '#fffefb',
              color: '#1c1a18',
            }}
          />
        </div>

        <SuchergebnisListe query={suche} />

        {/* Ein Kasten: Schubladen nebeneinander; innen können später weitere Ordner/Kästen dazukommen */}
        <section
          aria-labelledby="haengeordner-heading"
          style={{
            marginBottom: '1.75rem',
            padding: '1rem 1rem 1.15rem',
            borderRadius: 14,
            background: 'linear-gradient(165deg, #7a6d62 0%, #5a5149 38%, #4a423c 100%)',
            border: '1px solid rgba(20,18,16,0.35)',
            boxShadow: '0 10px 28px rgba(28,22,16,0.28), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
        >
          <h2
            id="haengeordner-heading"
            style={{
              margin: '0 0 0.35rem',
              fontSize: '1.08rem',
              fontWeight: 800,
              color: '#faf6f0',
              textShadow: '0 1px 1px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span aria-hidden>🗄️</span> Hängeordnerkasten
          </h2>
          <p
            style={{
              margin: '0 0 1rem',
              fontSize: '0.84rem',
              color: 'rgba(250,246,240,0.88)',
              lineHeight: 1.45,
              maxWidth: 62 * 16,
            }}
          >
            <strong>Fünf Schubladen</strong> statt elf. Überschrift tippen = zu-/aufklappen. „K2 Galerie“ zeigt <strong>alle Zettel in einer Liste</strong>; in den anderen Schubladen kannst du noch <strong>blättern</strong> oder direkt <strong>Öffnen</strong> – oder in die Mitte ziehen.
          </p>

          {/* Innenfach: leichtes „Fach“ hinter den Schubladen */}
          <div
            style={{
              padding: '0.65rem 0.55rem 0.75rem',
              borderRadius: 10,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(35,32,28,0.35) 100%)',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0.65rem',
                alignItems: 'stretch',
              }}
            >
              {BEREICHE.map((b) => (
                <HangeregisterSchublade
                  key={b.id}
                  b={b}
                  letztesBereichId={letztesThema?.bereichId}
                  letztesZettelId={letztesThema?.z.id}
                />
              ))}
            </div>
          </div>
        </section>

        <TexteSchreibtischBoard variant="page" />

        <p style={{ marginTop: '1.75rem', fontSize: '0.78rem', color: '#5c5650', lineHeight: 1.5 }}>
          Quelle der Zuordnung:{' '}
          <span style={{ fontFamily: 'monospace', fontSize: '0.74rem' }}>k2team-handbuch/24-TEXTE-BRIEFE-KOMPASS.md</span>
        </p>

        <footer style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(28,26,24,0.12)', fontSize: '0.72rem', color: '#5c5650', lineHeight: 1.55 }}>
          <div>{PRODUCT_COPYRIGHT_BRAND_ONLY}</div>
          <div>{PRODUCT_URHEBER_ANWENDUNG}</div>
        </footer>
      </div>
    </div>
    </LetztesThemaContext.Provider>
  )
}
