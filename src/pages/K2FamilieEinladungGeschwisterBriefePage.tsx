/**
 * K2 Familie – Einladungsbriefe pro Geschwister-Familienzweig mit echten Codes (Druck).
 * Route: /projects/k2-familie/einladung-geschwister-briefe
 * Daten: loadEinstellungen, loadPersonen, buildMitgliederCodesZweigGruppen – wie Mitglieder & Codes.
 */

import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { adminTheme } from '../config/theme'
import { APP_BASE_URL_SHAREABLE } from '../config/externalUrls'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import { loadEinstellungen, loadPersonen } from '../utils/familieStorage'
import type { K2FamiliePerson } from '../types/k2Familie'
import { buildMitgliederCodesZweigGruppen, type MitgliederCodesZweigGruppe } from '../utils/familieMitgliedsNummer'

const R = PROJECT_ROUTES['k2-familie']

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

/** Anker-Person eines Geschwister-Asts (Großfamilie). */
function geschwisterAstAnkerName(branchKey: string, map: Map<string, K2FamiliePerson>): string {
  if (!branchKey.startsWith('geschwister-ast:')) return ''
  const id = branchKey.slice('geschwister-ast:'.length)
  return map.get(id)?.name?.trim() || '—'
}

function briefBloeckeWaehlen(
  alle: MitgliederCodesZweigGruppe[],
  nurGeschwisterAst: boolean,
): MitgliederCodesZweigGruppe[] {
  const ast = alle.filter((g) => g.branchKey.startsWith('geschwister-ast:'))
  if (nurGeschwisterAst && ast.length > 0) return ast
  return alle
}

export default function K2FamilieEinladungGeschwisterBriefePage() {
  const a = adminTheme
  const { currentTenantId } = useFamilieTenant()
  const { capabilities } = useFamilieRolle()
  const kannInstanz = capabilities.canManageFamilienInstanz
  const [nurGeschwisterAst, setNurGeschwisterAst] = useState(true)

  const { familienZ, personMap, zweigGruppenAst, bloecke, signaturName } = useMemo(() => {
    const einst = loadEinstellungen(currentTenantId)
    const z = (einst.mitgliedsNummerAdmin ?? '').trim()
    const personen = loadPersonen(currentTenantId)
    const map = new Map(personen.map((p) => [p.id, p]))
    const gruppen = buildMitgliederCodesZweigGruppen(personen, einst.ichBinPersonId)
    const ast = gruppen.filter((g) => g.branchKey.startsWith('geschwister-ast:'))
    const bloeckeRaw = briefBloeckeWaehlen(gruppen, nurGeschwisterAst && ast.length > 0)
    const ich = einst.ichBinPersonId ? map.get(einst.ichBinPersonId) : undefined
    const sig = ich?.name?.trim() || ''
    return {
      familienZ: z,
      personMap: map,
      zweigGruppenAst: ast,
      bloecke: bloeckeRaw,
      signaturName: sig,
    }
  }, [currentTenantId, nurGeschwisterAst])

  const effektivNurAst = nurGeschwisterAst && zweigGruppenAst.length > 0

  if (!kannInstanz) {
    return (
      <div className="mission-wrapper">
        <div className="viewport k2-familie-page" style={{ padding: '1.25rem 1rem 2rem', maxWidth: 560, margin: '0 auto' }}>
          <Link to={R.meineFamilie} style={{ fontSize: '0.9rem', color: a.accent, fontWeight: 600 }}>
            ← Zu Meine Familie
          </Link>
          <h1
            style={{
              margin: '0.75rem 0 0.5rem',
              fontSize: '1.35rem',
              fontWeight: 700,
              color: a.text,
              fontFamily: a.fontHeading,
            }}
          >
            Einladung · Geschwister-Briefe
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', color: a.muted, lineHeight: 1.55 }}>
            Nur für <strong style={{ color: a.text }}>Inhaber:innen</strong> der Familien-Instanz.
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

  return (
    <div className="mission-wrapper">
      <style>{`
        @page { size: A4; margin: 14mm 16mm 20mm 16mm; }
        .k2-fam-einlad-brief-wrap { font-family: ${a.fontBody}; color: ${a.text}; }
        .k2-fam-einlad-brief-screenbar {
          display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin-bottom: 1rem;
        }
        @media print {
          .k2-fam-einlad-no-print { display: none !important; }
          .k2-fam-einlad-brief-wrap { background: #fff !important; }
          .k2-fam-einlad-brief-seite {
            page-break-after: always;
            padding: 0 !important;
            max-width: none !important;
          }
          .k2-fam-einlad-brief-seite:last-child { page-break-after: auto; }
          .k2-fam-einlad-url-screen { display: none !important; }
          .k2-fam-einlad-url-print { display: block !important; font-size: 8pt; word-break: break-all; }
        }
        @media screen {
          .k2-fam-einlad-url-print { display: none !important; }
        }
      `}</style>

      <div
        className="viewport k2-familie-page k2-fam-einlad-brief-wrap"
        style={{ padding: '1.25rem 1rem 2rem', maxWidth: 720, margin: '0 auto' }}
      >
        <div className="k2-fam-einlad-no-print">
          <Link to={R.mitgliederCodes} style={{ fontSize: '0.9rem', color: a.accent, fontWeight: 600 }}>
            ← Mitglieder &amp; Codes
          </Link>
        </div>

        <h1
          style={{
            margin: '0.75rem 0 0.35rem',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: a.text,
            fontFamily: a.fontHeading,
          }}
        >
          Einladung · Briefe pro Familienzweig
        </h1>
        <p className="k2-fam-einlad-no-print" style={{ margin: '0 0 1rem', fontSize: '0.92rem', color: a.muted, lineHeight: 1.5 }}>
          <strong style={{ color: a.text }}>Live mit Codes:</strong> Familien-Zugang und persönliche Mitgliedsnummern wie unter &nbsp;
          <Link to={R.mitgliederCodes} style={{ color: a.accent, fontWeight: 600 }}>
            Mitglieder &amp; Codes
          </Link>
          . Pro Brief ein Geschwister-Zweig; Beilage = Tabelle für diesen Zweig. Vertraulich drucken.
        </p>

        <div className="k2-fam-einlad-brief-screenbar k2-fam-einlad-no-print">
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
            Alle Briefe drucken
          </button>
          {zweigGruppenAst.length > 0 ? (
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem', color: a.text, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={nurGeschwisterAst}
                onChange={(e) => setNurGeschwisterAst(e.target.checked)}
              />
              Nur Geschwister-Äste ({zweigGruppenAst.length})
            </label>
          ) : null}
          <Link
            to="/texte-schreibtisch/einladung-geschwister-k2-familie.html"
            style={{ fontSize: '0.88rem', color: a.accent, fontWeight: 600 }}
          >
            Statische Vorlage ohne Codes
          </Link>
        </div>

        {!familienZ ? (
          <p className="k2-fam-einlad-no-print" style={{ fontSize: '0.88rem', color: '#b45309', marginBottom: '1rem' }}>
            Zuerst die <strong>Familien-Zugangsnummer</strong> unter Einstellungen eintragen — sonst sind die Links unvollständig.
          </p>
        ) : null}

        {zweigGruppenAst.length === 0 ? (
          <p className="k2-fam-einlad-no-print" style={{ fontSize: '0.88rem', color: a.muted, marginBottom: '1rem' }}>
            Keine getrennten <strong>Geschwister-Äste</strong> im Stammbaum erkannt — es werden{' '}
            <strong>alle Familienzweige</strong> wie bei Mitglieder &amp; Codes verwendet (eine Seite pro Block).
          </p>
        ) : !effektivNurAst ? (
          <p className="k2-fam-einlad-no-print" style={{ fontSize: '0.88rem', color: a.muted, marginBottom: '1rem' }}>
            Anzeige: <strong>alle Familienzweige</strong> (nicht nur Geschwister-Äste).
          </p>
        ) : null}

        {bloecke.length === 0 ? (
          <p style={{ fontSize: '0.92rem', color: a.muted }}>Noch keine Personen — bitte zuerst Personen anlegen.</p>
        ) : (
          bloecke.map((g, idx) => (
            <EinladungsBriefSeite
              key={`${g.branchKey}-${idx}`}
              gruppe={g}
              familienZ={familienZ}
              tenantId={currentTenantId}
              personMap={personMap}
              signaturName={signaturName}
              isLast={idx === bloecke.length - 1}
              a={a}
            />
          ))
        )}

        <div className="k2-fam-einlad-no-print" style={{ marginTop: '2rem', fontSize: '0.78rem', color: a.muted }}>
          <p style={{ margin: '0 0 0.35rem' }}>{PRODUCT_COPYRIGHT_BRAND_ONLY}</p>
          <p style={{ margin: 0 }}>{PRODUCT_URHEBER_ANWENDUNG}</p>
        </div>
      </div>
    </div>
  )
}

function EinladungsBriefSeite({
  gruppe,
  familienZ,
  tenantId,
  personMap,
  signaturName,
  isLast,
  a,
}: {
  gruppe: MitgliederCodesZweigGruppe
  familienZ: string
  tenantId: string
  personMap: Map<string, K2FamiliePerson>
  signaturName: string
  isLast: boolean
  a: typeof adminTheme
}) {
  const astName = geschwisterAstAnkerName(gruppe.branchKey, personMap)
  const titelZeile = astName && astName !== '—' ? astName : gruppe.branchLabel.replace(/^Familienzweig ·\s*/i, '').trim() || gruppe.branchLabel

  const mitCode = gruppe.rows.filter((r) => r.mitgliedsNummer)

  return (
    <article
      className="k2-fam-einlad-brief-seite"
      style={{
        marginBottom: isLast ? 0 : '2rem',
        padding: '1.5rem 0',
        borderTop: '1px solid rgba(181, 74, 30, 0.15)',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '11pt',
        lineHeight: 1.55,
        color: '#1a1816',
      }}
    >
      <header style={{ textAlign: 'center', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid #c9bfb0' }}>
        <p style={{ margin: '0 0 0.5rem', fontSize: '9pt', color: '#5c5650', fontFamily: a.fontBody }}>
          K2 Familie · Einladung
        </p>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#2c2419' }}>An die Familie um {titelZeile}</h2>
        <p style={{ margin: '0.35rem 0 0', fontSize: '10pt', color: '#4a4035' }}>{gruppe.branchLabel}</p>
      </header>

      <p style={{ margin: '0 0 0.75rem' }}>Liebe Familie,</p>

      <p style={{ margin: '0 0 0.75rem', textAlign: 'justify' }}>
        ich möchte euch etwas zeigen, das ich für unsere Familie aufgebaut habe: die <strong>K2 Familie</strong> – eine geschützte,
        private Plattform für Stammbaum, Geschichten, Termine und Erinnerungen – nur für uns, nicht für die Öffentlichkeit.
      </p>
      <p style={{ margin: '0 0 0.75rem', textAlign: 'justify' }}>
        <strong>Was ich euch bitte:</strong> Schaut euch die Plattform an, wenn ihr möchtet; leitet die Einladung an eure
        Familienmitglieder weiter, damit jeder Zweig mitmachen kann.
      </p>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid #d4ccc0',
          padding: '0.85rem 1rem',
          margin: '1rem 0',
          borderRadius: 2,
          pageBreakInside: 'avoid',
        }}
      >
        <strong style={{ color: '#2c2419' }}>Familien-Zugang</strong> (für euren Zweig derselbe wie für alle):{' '}
        <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>{familienZ || '— noch eintragen'}</span>
      </div>

      <div
        style={{
          background: 'rgba(255, 255, 255, 0.65)',
          border: '1px solid #d4ccc0',
          padding: '0.85rem 1rem',
          margin: '1rem 0',
          fontSize: '10.5pt',
          pageBreakInside: 'avoid',
        }}
      >
        <strong style={{ color: '#2c2419' }}>Beilage – persönliche Codes dieses Familienzweigs</strong>
        <p style={{ margin: '0.45rem 0 0.65rem', color: '#3d3630' }}>
          Jede Person hat eine eigene Mitgliedsnummer für den geschützten Zugang. Bitte nur an die betreffende Person weitergeben.
        </p>
        {mitCode.length === 0 ? (
          <p style={{ margin: 0, color: '#92400e' }}>Noch keine Mitgliedsnummern in diesem Zweig — unter Mitglieder &amp; Codes oder auf den Personenkarten eintragen.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #c9bfb0', textAlign: 'left' }}>
                <th style={{ padding: '0.35rem 0.5rem 0.35rem 0' }}>Name</th>
                <th style={{ padding: '0.35rem 0.5rem' }}>Code</th>
                <th style={{ padding: '0.35rem 0' }}>Link / Adresse</th>
              </tr>
            </thead>
            <tbody>
              {mitCode.map((r) => {
                const url =
                  familienZ && r.mitgliedsNummer
                    ? buildShortEinladungsUrlForPrint(tenantId, familienZ, r.mitgliedsNummer)
                    : ''
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <td style={{ padding: '0.3rem 0.5rem 0.3rem 0', verticalAlign: 'top' }}>{r.name}</td>
                    <td style={{ padding: '0.3rem 0.5rem', fontFamily: 'ui-monospace, monospace', verticalAlign: 'top' }}>
                      {r.mitgliedsNummer}
                    </td>
                    <td style={{ padding: '0.3rem 0', verticalAlign: 'top', fontSize: '9pt' }}>
                      {url ? (
                        <>
                          <span className="k2-fam-einlad-url-screen">
                            <a href={url} style={{ color: '#b45309', fontWeight: 600 }}>
                              Öffnen
                            </a>
                          </span>
                          <span className="k2-fam-einlad-url-print" style={{ fontFamily: 'ui-monospace, monospace', color: '#1a1816' }}>
                            {url}
                          </span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p style={{ margin: '0.75rem 0 0', textAlign: 'justify' }}>
        Wenn etwas unklar ist, meldet euch bei mir. Ich freue mich, wenn wir das gemeinsam nutzen.
      </p>

      <div style={{ marginTop: '1.25rem' }}>
        <p style={{ margin: '0 0 0.25rem' }}>Herzliche Grüße</p>
        {signaturName ? <p style={{ margin: 0 }}>{signaturName}</p> : null}
      </div>

      <p
        style={{
          marginTop: '1.5rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #ddd4c8',
          fontSize: '8.5pt',
          color: '#5c5044',
          textAlign: 'center',
        }}
      >
        K2 Familie · privater Familienraum
      </p>
    </article>
  )
}
