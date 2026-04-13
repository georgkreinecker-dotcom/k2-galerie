/**
 * K2 Familie – Inhaber:in: alle Personen mit persönlicher Mitgliedsnummer, Drucken, Text für Mail/WhatsApp.
 * Route: /projects/k2-familie/mitglieder-codes
 */

import { Link } from 'react-router-dom'
import { useMemo, useState, useCallback } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { adminTheme } from '../config/theme'
import { APP_BASE_URL } from '../config/externalUrls'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import { loadEinstellungen, loadPersonen } from '../utils/familieStorage'
import { buildQrUrlWithBust, useQrVersionTimestamp } from '../hooks/useServerBuildTimestamp'

const R = PROJECT_ROUTES['k2-familie']

/** Wie K2FamilieHomePage: Produktions-Host, t + z + m, dann Cache-Bust für QR/Links. */
function buildPersonalEinladungsUrl(
  tenantId: string,
  familienZ: string,
  mitgliedsNummer: string,
  versionTs: number,
): string {
  const base = new URL(`${APP_BASE_URL}${R.meineFamilie}`)
  base.searchParams.set('t', tenantId)
  base.searchParams.set('z', familienZ)
  base.searchParams.set('m', mitgliedsNummer)
  return buildQrUrlWithBust(base.toString(), versionTs)
}

export default function K2FamilieMitgliederCodesPage() {
  const a = adminTheme
  const { currentTenantId } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannInstanz = capabilities.canManageFamilienInstanz
  const { versionTimestamp } = useQrVersionTimestamp()
  const [kopiert, setKopiert] = useState(false)

  const { familienZ, rows } = useMemo(() => {
    const einst = loadEinstellungen(currentTenantId)
    const z = (einst.mitgliedsNummerAdmin ?? '').trim()
    const personen = loadPersonen(currentTenantId)
    const sorted = [...personen].sort((p, q) => (p.name || '').localeCompare(q.name || '', 'de'))
    const r = sorted.map((p) => ({
      id: p.id,
      name: p.name?.trim() || '—',
      mitgliedsNummer: (p.mitgliedsNummer ?? '').trim(),
    }))
    return { familienZ: z, rows: r }
  }, [currentTenantId])

  const buildUrlForPerson = useCallback(
    (m: string) => {
      if (!familienZ || !m) return ''
      return buildPersonalEinladungsUrl(currentTenantId, familienZ, m, versionTimestamp)
    },
    [currentTenantId, familienZ, versionTimestamp],
  )

  const listeText = useMemo(() => {
    const header = `K2 Familie – Mitglieder & persönliche Codes\nFamilien-Zugang: ${familienZ || '—'}\n`
    const lines = rows
      .filter((r) => r.mitgliedsNummer)
      .map((r) => {
        const url = buildUrlForPerson(r.mitgliedsNummer)
        return `${r.name}\t${r.mitgliedsNummer}\t${url}`
      })
    const ohne = rows.filter((r) => !r.mitgliedsNummer)
    const footer =
      ohne.length > 0
        ? `\nOhne Mitgliedsnummer (${ohne.length}): ${ohne.map((o) => o.name).join(', ')}`
        : ''
    return header + lines.join('\n') + footer
  }, [rows, familienZ, buildUrlForPerson])

  const copyListe = () => {
    void navigator.clipboard.writeText(listeText).then(() => {
      setKopiert(true)
      window.setTimeout(() => setKopiert(false), 2400)
    })
  }

  if (!kannInstanz) {
    return (
      <div className="mission-wrapper">
        <div className="viewport k2-familie-page" style={{ padding: '1.25rem 1rem 2rem', maxWidth: 560, margin: '0 auto' }}>
          <Link to={R.meineFamilie} style={{ fontSize: '0.9rem', color: a.accent, fontWeight: 600 }}>
            ← Zu Meine Familie
          </Link>
          <h1 style={{ margin: '0.75rem 0 0.5rem', fontSize: '1.35rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
            Mitglieder &amp; Codes
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', color: a.muted, lineHeight: 1.55 }}>
            Diese Übersicht ist nur für <strong style={{ color: a.text }}>Inhaber:innen</strong> der Familien-Instanz sichtbar. Wähle in der Leiste die Rolle „Inhaber:in“ oder wende dich an die Person, die die Familie verwaltet.
          </p>
          <Link
            to={R.meineFamilie}
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
          <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: a.muted }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
          <p style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: a.muted }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
        </div>
      </div>
    )
  }

  const mitNummer = rows.filter((r) => r.mitgliedsNummer)
  const ohneNummer = rows.filter((r) => !r.mitgliedsNummer)

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
        <p style={{ margin: '0 0 1rem', fontSize: '0.92rem', color: a.muted, lineHeight: 1.55 }}>
          Alle Personen mit eingetragener <strong style={{ color: a.text }}>Mitgliedsnummer</strong> auf der Karte — mit persönlichem Einladungslink (Familien-Zugang{' '}
          <span style={{ fontFamily: 'ui-monospace, monospace' }}>{familienZ || '—'}</span>
          ). Liste ausdrucken oder Text kopieren für Mail und WhatsApp.
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
              {mitNummer.map((r) => {
                const url = buildUrlForPerson(r.mitgliedsNummer)
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(181, 74, 30, 0.08)' }} title={url || undefined}>
                    <td style={{ padding: '0.5rem 0.65rem', color: a.text }}>{r.name}</td>
                    <td style={{ padding: '0.5rem 0.65rem', fontFamily: 'ui-monospace, monospace', color: a.text }}>{r.mitgliedsNummer}</td>
                    <td style={{ padding: '0.5rem 0.65rem' }} className="no-print-familie-codes">
                      <Link to={`${R.personen}/${r.id}`} style={{ color: a.accent, fontWeight: 600, fontSize: '0.85rem' }}>
                        Person öffnen
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {mitNummer.length === 0 ? (
          <p style={{ marginTop: '0.85rem', fontSize: '0.88rem', color: a.muted }}>
            Noch keine Mitgliedsnummern eingetragen. Auf jeder Personenkarte unter Stammbaum → Person die Nummer setzen.
          </p>
        ) : null}

        {/* Druck: volle URLs pro Zeile */}
        <div className="print-only-familie-codes" style={{ display: 'none' }}>
          {mitNummer.map((r) => {
            const url = buildUrlForPerson(r.mitgliedsNummer)
            return (
              <p key={`p-${r.id}`} style={{ margin: '0.35rem 0', fontSize: '10pt', wordBreak: 'break-all' }}>
                <strong>{r.name}</strong> · {r.mitgliedsNummer} · {url}
              </p>
            )
          })}
        </div>

        {ohneNummer.length > 0 ? (
          <div style={{ marginTop: '1.15rem', padding: '0.75rem 0.9rem', borderRadius: a.radius, background: a.bgDark, border: '1px solid rgba(181, 74, 30, 0.12)' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: a.text, marginBottom: '0.35rem' }}>Ohne Mitgliedsnummer ({ohneNummer.length})</div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: a.muted, lineHeight: 1.45 }}>
              {ohneNummer.map((o) => o.name).join(', ')} — Nummer in der Personenkarte eintragen, dann erscheint die Person in der Tabelle oben.
            </p>
          </div>
        ) : null}

        <style>{`
          @media print {
            .no-print-familie-codes { display: none !important; }
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
