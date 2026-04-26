/**
 * K2 Familie – Inhaber:in: alle Personen mit persönlicher Mitgliedsnummer, Drucken, Text für Mail/WhatsApp.
 * Route: /projects/k2-familie/mitglieder-codes
 * Reihenfolge & Gruppierung wie Stammbaum-Zweige (s. buildMitgliederCodesZweigGruppen).
 */

import { Link } from 'react-router-dom'
import { useMemo, useState, useCallback, Fragment } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { adminTheme } from '../config/theme'
import { APP_BASE_URL_SHAREABLE } from '../config/externalUrls'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import { loadEinstellungen, loadPersonen, savePersonen } from '../utils/familieStorage'
import { buildQrUrlWithVersionOnly, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'
import {
  assignMissingMitgliedsNummern,
  buildMitgliederCodesZweigGruppen,
  MITGLIEDS_NUMMER_AUTO_BEISPIEL,
} from '../utils/familieMitgliedsNummer'

const R = PROJECT_ROUTES['k2-familie']

/** Lesbarkeit auf dunklem K2-Familie-Viewport (mission-wrapper); vgl. K2FamilieEinladungGeschwisterBriefePage. */
const vp = {
  text: 'var(--k2-text)',
  muted: 'var(--k2-muted)',
  link: 'var(--k2-accent)',
} as const

/** Wie K2FamilieHomePage: Produktions-Host, t + z + m, dann v= für Scan (kurz, ohne `_=`), gut per Kamera. */
function buildPersonalEinladungsUrl(
  tenantId: string,
  familienZ: string,
  mitgliedsNummer: string,
  versionTs: number,
): string {
  const base = new URL(`${APP_BASE_URL_SHAREABLE}${R.meineFamilie}`)
  base.searchParams.set('t', tenantId)
  base.searchParams.set('z', familienZ)
  base.searchParams.set('m', mitgliedsNummer)
  return buildQrUrlWithVersionOnly(base.toString(), versionTs)
}

/** Kurzlink nur für Papier/PDF: gleiche Ziel-URL ohne lange Cache-Bust-Parameter (weniger Zeilen pro Person). */
function buildShortEinladungsUrlForPrint(
  tenantId: string,
  familienZ: string,
  mitgliedsNummer: string,
): string {
  const base = new URL(`${APP_BASE_URL_SHAREABLE}${R.meineFamilie}`)
  base.searchParams.set('t', tenantId)
  base.searchParams.set('z', familienZ)
  base.searchParams.set('m', mitgliedsNummer)
  return base.toString()
}

export default function K2FamilieMitgliederCodesPage() {
  const a = adminTheme
  const { currentTenantId } = useFamilieTenant()
  const { capabilities, rolle } = useFamilieRolle()
  const kannInstanz = capabilities.canManageFamilienInstanz
  const inhaberOhneVerwaltungsrecht = !kannInstanz && rolle === 'inhaber'
  const linkMeineFamilieIdentitaet = `${R.meineFamilie}#k2-familie-identitaet-bestaetigen`
  const { versionTimestamp } = useQrVersionTimestamp()
  const [kopiert, setKopiert] = useState(false)
  const [listenRefresh, setListenRefresh] = useState(0)

  const { familienZ, zweigGruppen, alleRows } = useMemo(() => {
    const einst = loadEinstellungen(currentTenantId)
    const z = (einst.mitgliedsNummerAdmin ?? '').trim()
    const personen = loadPersonen(currentTenantId)
    const gruppen = buildMitgliederCodesZweigGruppen(personen, einst.ichBinPersonId)
    const rows = gruppen.flatMap((g) => g.rows)
    return { familienZ: z, zweigGruppen: gruppen, alleRows: rows }
  }, [currentTenantId, listenRefresh])

  const buildUrlForPerson = useCallback(
    (m: string) => {
      if (!familienZ || !m) return ''
      return buildPersonalEinladungsUrl(currentTenantId, familienZ, m, versionTimestamp)
    },
    [currentTenantId, familienZ, versionTimestamp],
  )

  const listeText = useMemo(() => {
    const header = `K2 Familie – Mitglieder & persönliche Codes\nFamilien-Zugang: ${familienZ || '—'}\n(Sortierung: Familienzweige wie im Stammbaum)\nSpalte 3: kurzer Einladungslink — in die Adresszeile am PC einfügen (gleicher Einstieg wie QR).\n`
    const blocks: string[] = []
    for (const g of zweigGruppen) {
      const mit = g.rows.filter((r) => r.mitgliedsNummer)
      if (mit.length === 0) continue
      blocks.push(`\n── ${g.branchLabel} ──`)
      for (const r of mit) {
        const urlShort =
          familienZ && r.mitgliedsNummer
            ? buildShortEinladungsUrlForPrint(currentTenantId, familienZ, r.mitgliedsNummer)
            : ''
        blocks.push(`${r.name}\t${r.mitgliedsNummer}\t${urlShort}`)
      }
    }
    const ohne = alleRows.filter((r) => !r.mitgliedsNummer)
    const footer =
      ohne.length > 0
        ? `\n\nOhne Mitgliedsnummer (${ohne.length}): ${ohne.map((o) => o.name).join(', ')} — Button „Fehlende Nummern vergeben“ oder auf der Personenkarte eintragen.`
        : ''
    return header + blocks.join('\n') + footer
  }, [zweigGruppen, alleRows, familienZ, currentTenantId])

  const copyListe = () => {
    void navigator.clipboard.writeText(listeText).then(() => {
      setKopiert(true)
      window.setTimeout(() => setKopiert(false), 2400)
    })
  }

  const fehlendeVergaben = () => {
    const personen = loadPersonen(currentTenantId)
    const einst = loadEinstellungen(currentTenantId)
    const next = assignMissingMitgliedsNummern(personen, einst.ichBinPersonId)
    if (savePersonen(currentTenantId, next, { allowReduce: false })) {
      setListenRefresh((k) => k + 1)
    }
  }

  if (!kannInstanz) {
    return (
      <div className="mission-wrapper">
        <div className="viewport k2-familie-page" style={{ padding: '1.25rem 1rem 2rem', maxWidth: 560, margin: '0 auto' }}>
          <Link
            to={inhaberOhneVerwaltungsrecht ? linkMeineFamilieIdentitaet : R.meineFamilie}
            style={{ fontSize: '0.9rem', color: vp.link, fontWeight: 600 }}
          >
            ← Zu Meine Familie
          </Link>
          <h1 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.35rem', fontWeight: 700, color: vp.text, fontFamily: a.fontHeading }}>
            Mitglieder &amp; Codes
          </h1>
          {inhaberOhneVerwaltungsrecht ? (
            <p style={{ margin: 0, fontSize: '0.95rem', color: vp.muted, lineHeight: 1.55 }}>
              <strong style={{ color: vp.text }}>Persönliche Sitzung noch nicht bestätigt.</strong> Die Übersicht ist Teil der Verwaltung: Bitte auf{' '}
              <strong style={{ color: vp.text }}>Meine Familie</strong> einmal den <strong style={{ color: vp.text }}>persönlichen Code</strong> von deiner Karte eintragen (z. B. AB12) –{' '}
              <strong style={{ color: vp.text }}>nicht</strong> die Familien-Kennung für alle. Danach sind diese Seite und die Einladungsbriefe nutzbar.
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: '0.95rem', color: vp.muted, lineHeight: 1.55 }}>
              Diese Übersicht ist nur für <strong style={{ color: vp.text }}>Inhaber:innen</strong> der Familien-Instanz sichtbar. Wähle in der Leiste die Rolle „Inhaber:in“ oder wende dich an die Person, die die Familie verwaltet.
            </p>
          )}
          <Link
            to={inhaberOhneVerwaltungsrecht ? linkMeineFamilieIdentitaet : R.meineFamilie}
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: a.radius,
              fontWeight: 600,
              fontSize: '0.92rem',
              textDecoration: 'none',
              fontFamily: a.fontBody,
              ...a.buttonPrimary,
            }}
          >
            → Zu Meine Familie
          </Link>
          <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: vp.muted }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
          <p style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: vp.muted }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
        </div>
      </div>
    )
  }

  const mitNummer = alleRows.filter((r) => r.mitgliedsNummer)
  const ohneNummer = alleRows.filter((r) => !r.mitgliedsNummer)

  return (
    <div className="mission-wrapper">
      <div
        className="viewport k2-familie-page k2-familie-mitglieder-codes-print"
        style={{ padding: '1.25rem 1rem 2rem', maxWidth: 900, margin: '0 auto' }}
      >
        <div className="no-print-familie-codes">
          <Link to={R.einstellungen} style={{ fontSize: '0.9rem', color: a.accent, fontWeight: 600 }}>
            ← Zu Einstellungen
          </Link>
        </div>

        <h1
          style={{
            margin: '0.75rem 0 0.35rem',
            fontSize: '1.45rem',
            fontWeight: 700,
            color: a.text,
            fontFamily: a.fontHeading,
          }}
        >
          Mitglieder &amp; persönliche Codes
        </h1>
        <p className="no-print-familie-codes" style={{ margin: '0 0 0.65rem', fontSize: '0.92rem', color: a.muted, lineHeight: 1.5 }}>
          <strong style={{ color: a.text }}>Nur Verwaltung.</strong> Codes vertraulich weitergeben. Liste wie Stammbaum. Familien-Zugang:{' '}
          <span style={{ fontFamily: 'ui-monospace, monospace' }}>{familienZ || '—'}</span>. Optional: fehlende Nummern mit Platzhalter (
          <span style={{ fontFamily: 'ui-monospace, monospace' }}>{MITGLIEDS_NUMMER_AUTO_BEISPIEL}</span>).
        </p>
        <p
          className="no-print-familie-codes"
          style={{
            margin: '0 0 1rem',
            padding: '0.65rem 0.75rem',
            fontSize: '0.95rem',
            lineHeight: 1.45,
            color: '#0f766e',
            background: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)',
            borderRadius: a.radius,
            border: '1px solid rgba(5, 150, 105, 0.35)',
            fontWeight: 600,
          }}
        >
          <strong>Karten &amp; Druck pro Mitglied:</strong> Unten in der Tabelle/Listen den{' '}
          <strong>persönlichen Einladungslink</strong> (t+z+m) oder den QR aus den Einladungsbriefen pro Person nutzen –{' '}
          <strong>ein Scan reicht</strong>, das Mitglied landet auf der eigenen Seite. Nicht den reinen Familienlink ohne persönliches m – sonst muss am Handy der Code eingegeben werden.
        </p>

        <div className="no-print-familie-codes" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              borderRadius: a.radius,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              ...a.buttonPrimary,
            }}
          >
            Liste drucken
          </button>
          <Link
            to={R.einladungGeschwisterBriefe}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              borderRadius: a.radius,
              border: `1px solid rgba(181, 74, 30, 0.35)`,
              background: a.bgCard,
              color: a.accent,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Einladungsbriefe je Zweig (mit Codes)
          </Link>
          <button
            type="button"
            onClick={copyListe}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              borderRadius: a.radius,
              border: `1px solid rgba(181, 74, 30, 0.35)`,
              background: a.bgCard,
              color: a.accent,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {kopiert ? '✓ In Zwischenablage kopiert' : 'Text für Mail & WhatsApp kopieren'}
          </button>
          {ohneNummer.length > 0 ? (
            <button
              type="button"
              onClick={fehlendeVergaben}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                borderRadius: a.radius,
                border: `1px solid rgba(22, 101, 52, 0.45)`,
                background: 'rgba(22, 101, 52, 0.12)',
                color: '#166534',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Platzhalter erzeugen ({ohneNummer.length})
            </button>
          ) : null}
        </div>

        {!familienZ ? (
          <p style={{ fontSize: '0.88rem', color: '#b45309', marginBottom: '1rem' }}>
            Zuerst die <strong>Familien-Zugangsnummer</strong> unter Meine Familie eintragen — sonst sind keine gültigen Einladungslinks möglich.
          </p>
        ) : null}

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.88rem',
              background: a.bgCard,
              borderRadius: a.radius,
              border: '1px solid rgba(181, 74, 30, 0.12)',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(181, 74, 30, 0.2)', textAlign: 'left' }}>
                <th style={{ padding: '0.55rem 0.65rem', color: a.text, fontFamily: a.fontHeading }}>Name</th>
                <th style={{ padding: '0.55rem 0.65rem', color: a.text, fontFamily: a.fontHeading }}>Mitgliedsnummer</th>
                <th style={{ padding: '0.55rem 0.65rem', color: a.text, fontFamily: a.fontHeading }} className="no-print-familie-codes">
                  Karte
                </th>
              </tr>
            </thead>
            <tbody>
              {zweigGruppen.map((g, gi) => (
                <Fragment key={`${g.branchKey}-${gi}`}>
                  <tr style={{ background: a.bgDark }}>
                    <td
                      colSpan={3}
                      style={{
                        padding: '0.45rem 0.65rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: a.accent,
                        borderBottom: '1px solid rgba(181, 74, 30, 0.15)',
                      }}
                    >
                      {g.branchLabel}
                    </td>
                  </tr>
                  {g.rows.map((r) => {
                    const url = r.mitgliedsNummer ? buildUrlForPerson(r.mitgliedsNummer) : ''
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(181, 74, 30, 0.08)' }} title={url || undefined}>
                        <td style={{ padding: '0.5rem 0.65rem', color: a.text }}>{r.name}</td>
                        <td style={{ padding: '0.5rem 0.65rem', fontFamily: 'ui-monospace, monospace', color: a.text }}>
                          {r.mitgliedsNummer || '—'}
                        </td>
                        <td style={{ padding: '0.5rem 0.65rem' }} className="no-print-familie-codes">
                          <Link to={`${R.personen}/${r.id}`} style={{ color: a.accent, fontWeight: 600, fontSize: '0.85rem' }}>
                            Person öffnen
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {mitNummer.length === 0 && alleRows.length > 0 ? (
          <p className="no-print-familie-codes" style={{ marginTop: '0.85rem', fontSize: '0.88rem', color: a.muted }}>
            Noch keine Mitgliedsnummern — oben „Fehlende Nummern jetzt vergeben“ wählen oder einzeln auf der Personenkarte eintragen.
          </p>
        ) : null}

        {alleRows.length === 0 ? (
          <p className="no-print-familie-codes" style={{ marginTop: '0.85rem', fontSize: '0.88rem', color: a.muted }}>
            Noch keine Personen im Stammbaum.
          </p>
        ) : null}

        {/* Druck: volle URLs pro Zeile, nach Zweigen */}
        <div className="print-only-familie-codes" style={{ display: 'none' }}>
          {zweigGruppen.map((g, gi) => (
            <div key={`print-${g.branchKey}-${gi}`} style={{ marginBottom: '0.75rem' }}>
              <p style={{ margin: '0 0 0.25rem', fontSize: '10pt', fontWeight: 700 }}>{g.branchLabel}</p>
              {g.rows
                .filter((r) => r.mitgliedsNummer)
                .map((r) => {
                  const url =
                    familienZ && r.mitgliedsNummer
                      ? buildShortEinladungsUrlForPrint(currentTenantId, familienZ, r.mitgliedsNummer)
                      : ''
                  return (
                    <p key={`p-${r.id}`} style={{ margin: '0.35rem 0', fontSize: '10pt', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      <strong>{r.name}</strong> · {r.mitgliedsNummer} · {url}
                    </p>
                  )
                })}
            </div>
          ))}
        </div>

        {ohneNummer.length > 0 ? (
          <div style={{ marginTop: '1.15rem', padding: '0.75rem 0.9rem', borderRadius: a.radius, background: a.bgDark, border: '1px solid rgba(181, 74, 30, 0.12)' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: a.text, marginBottom: '0.35rem' }}>Ohne Mitgliedsnummer ({ohneNummer.length})</div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: a.muted, lineHeight: 1.45 }}>
              {ohneNummer.map((o) => o.name).join(', ')} —{' '}
              <strong style={{ color: a.text }}>Fehlende Nummern jetzt vergeben</strong> (gleiche Reihenfolge wie Stammbaum-Zweige) oder einzeln auf der Personenkarte eintragen.
            </p>
          </div>
        ) : null}

        <style>{`
          @media print {
            .no-print-familie-codes { display: none !important; }
            .familie-codes-tabelle-nur-bildschirm { display: none !important; }
            .print-only-familie-codes { display: block !important; }
            .k2-familie-mitglieder-codes-print { padding: 12mm !important; max-width: none !important; }
          }
        `}</style>

        <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: a.muted }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
        <p style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: a.muted }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
      </div>
    </div>
  )
}
