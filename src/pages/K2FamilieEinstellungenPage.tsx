/**
 * K2 Familie – Einstellungen & Verwaltung (Zugang, Rolle, Sicherung, Lizenz, Links zu Handbuch/Mappe).
 * Route: /projects/k2-familie/einstellungen
 */

import type { CSSProperties } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { adminTheme } from '../config/theme'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import { loadEinstellungen, loadPersonen, saveEinstellungen } from '../utils/familieStorage'
import type { K2FamilieInhaberArbeitsansicht, K2FamilieRolle } from '../types/k2FamilieRollen'
import {
  K2_FAMILIE_INHABER_ANSICHT,
  K2_FAMILIE_INHABER_ANSICHT_LABELS,
  K2_FAMILIE_ROLLEN,
  K2_FAMILIE_ROLLEN_AMPEL,
  K2_FAMILIE_ROLLEN_EINZEILER,
  K2_FAMILIE_ROLLEN_LABELS,
} from '../types/k2FamilieRollen'

const a = adminTheme
const R = PROJECT_ROUTES['k2-familie']

const card: CSSProperties = {
  marginBottom: '1.15rem',
  padding: '1.1rem 1.2rem',
  borderRadius: a.radius,
  background: a.bgCard,
  boxShadow: a.shadow,
  border: '1px solid rgba(181, 74, 30, 0.12)',
  borderLeft: `4px solid ${a.accent}`,
}

const linkBtn: CSSProperties = {
  display: 'inline-block',
  marginTop: '0.65rem',
  padding: '0.5rem 1rem',
  borderRadius: a.radius,
  fontWeight: 600,
  fontSize: '0.92rem',
  textDecoration: 'none',
  fontFamily: a.fontBody,
  ...a.buttonPrimary,
}

const iconLink: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: 999,
  border: '1px solid rgba(181, 74, 30, 0.25)',
  background: a.bgElevated,
  fontSize: '1.15rem',
  textDecoration: 'none',
  lineHeight: 1,
}

export default function K2FamilieEinstellungenPage() {
  const { currentTenantId } = useFamilieTenant()
  const { rolle, setRolle, capabilities, inhaberArbeitsansicht, setInhaberArbeitsansicht } = useFamilieRolle()
  const effRolle = capabilities.rolle
  const kannStruktur = capabilities.canEditStrukturUndStammdaten
  const kannInstanz = capabilities.canManageFamilienInstanz
  const showSicherung = capabilities.canExportSicherung
  const isLeser = effRolle === 'leser'
  const isBearbeiter = effRolle === 'bearbeiter'
  const showInhaberArbeitsansichtKarte = rolle === 'inhaber' && capabilities.inhaberArbeitsansicht != null

  const einstSnapshot = loadEinstellungen(currentTenantId)
  const personen = loadPersonen(currentTenantId)
  const ichId = einstSnapshot.ichBinPersonId?.trim() || ''
  const designatedId = einstSnapshot.inhaberPersonId?.trim() || ''
  const designatedName = designatedId ? personen.find((p) => p.id === designatedId)?.name?.trim() || '' : ''
  const transferCandidates = ichId ? personen.filter((p) => p.id !== ichId) : []
  const [transferToId, setTransferToId] = useState('')
  const canShowTransfer = kannInstanz && !!ichId && transferCandidates.length > 0

  const handleInhaberschaftUebertragen = () => {
    if (!transferToId || transferToId === designatedId) return
    const name = personen.find((p) => p.id === transferToId)?.name?.trim() || transferToId
    const ok = window.confirm(
      `Inhaberschaft auf „${name}“ übertragen?\n\n` +
        `Auf diesem Gerät wird deine Rolle auf Bearbeiter:in gesetzt. ` +
        `${name} wählt auf dem eigenen Gerät unter Einstellungen die Rolle Inhaber:in (einmalig). ` +
        `Die Festlegung gilt familienweit (mit Cloud/Backup abgleichbar).`,
    )
    if (!ok) return
    const einst = loadEinstellungen(currentTenantId)
    const next = { ...einst, inhaberPersonId: transferToId }
    if (!saveEinstellungen(currentTenantId, next)) return
    setRolle('bearbeiter')
    setTransferToId('')
  }

  const intro =
    isLeser ? (
      <>
        <strong style={{ color: a.text }}>Deine Rolle</strong> steht oben in der Leiste. Hier kannst du sie für{' '}
        <strong style={{ color: a.text }}>diese Sitzung</strong> anpassen und den Zugang zu „Meine Familie“ öffnen.
      </>
    ) : isBearbeiter ? (
      <>
        Zugang, Stammbaum-Ansicht (nur lesen) und Sicherung – gebündelt. Oben: <strong style={{ color: a.text }}>aktuelle Rolle</strong>;{' '}
        hier die Rolle für <strong style={{ color: a.text }}>diese Sitzung</strong> wählen, bis die Inhaber:in Rechte festlegt.
      </>
    ) : (
      <>
        Zugangsdaten, Stammbaum-Ansicht, Mitglieder-Codes, Sicherung und Lizenz – zentral. Oben: <strong style={{ color: a.text }}>aktuelle Rolle</strong>; hier{' '}
        für <strong style={{ color: a.text }}>diese Sitzung</strong> änderbar (Zielbild: feste Rollen durch die Inhaber:in).
      </>
    )

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page" style={{ padding: '1.25rem 1rem 2rem', maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.5rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
          {isLeser ? 'Einstellungen' : 'Einstellungen & Verwaltung'}
        </h1>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', color: a.muted, lineHeight: 1.55 }}>
          {intro}
        </p>

        <div id="k2-familie-rolle-wahl" style={{ ...card, borderLeftColor: '#0d9488' }}>
          <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
            Rolle in dieser Familie
          </h2>
          <p style={{ margin: '0 0 0.65rem', fontSize: '0.9rem', color: a.muted, lineHeight: 1.55 }}>
            <strong style={{ color: a.text }}>Zielbild:</strong> die Inhaber:in ordnet jedem Mitglied eine Rolle zu – nicht jeder wechselt sie selbst. Bis technisch umgesetzt: hier die Rolle für <strong style={{ color: a.text }}>diese Sitzung</strong> (z. B. Inhaber:in bei Erst-Einrichtung).
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem 1rem' }}>
            <label htmlFor="k2-familie-rolle-select" style={{ fontSize: '0.88rem', color: a.muted }}>
              Rolle wählen
            </label>
            <select
              id="k2-familie-rolle-select"
              aria-label="Rolle für diese Familie wählen"
              value={rolle}
              onChange={(e) => setRolle(e.target.value as K2FamilieRolle)}
              style={{
                background: '#fffefb',
                border: '1px solid rgba(181, 74, 30, 0.28)',
                borderRadius: a.radius,
                color: a.text,
                padding: '0.4rem 0.65rem',
                fontSize: '0.92rem',
                fontFamily: 'inherit',
                maxWidth: 'min(100%, 260px)',
              }}
            >
              {K2_FAMILIE_ROLLEN.map((r) => (
                <option key={r} value={r}>
                  {K2_FAMILIE_ROLLEN_LABELS[r]}
                </option>
              ))}
            </select>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: a.text,
                fontSize: '0.88rem',
                flex: '1 1 200px',
                lineHeight: 1.4,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: K2_FAMILIE_ROLLEN_AMPEL[effRolle],
                  flexShrink: 0,
                  boxShadow: '0 0 0 1px rgba(0,0,0,0.06)',
                }}
              />
              {K2_FAMILIE_ROLLEN_EINZEILER[effRolle]}
            </span>
          </div>
        </div>

        {showInhaberArbeitsansichtKarte && (
          <div id="k2-familie-inhaber-ansicht" style={{ ...card, borderLeftColor: '#0e7490' }}>
            <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
              Arbeitsansicht als Inhaber:in
            </h2>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.9rem', color: a.muted, lineHeight: 1.55 }}>
              Deine <strong style={{ color: a.text }}>Rolle</strong> bleibt „Inhaber:in“ – du kannst jederzeit wieder die volle Bearbeitung wählen. Die Ansicht gilt{' '}
              <strong style={{ color: a.text }}>nur für dich</strong> auf diesem Gerät und wird pro Familie gespeichert. Sobald „Du“ gesetzt ist, wirken die Rechte wie bei Bearbeiter:in oder Leser:in – praktisch für den Alltag, wenn du nicht mehr alles ändern musst.
            </p>
            <label htmlFor="k2-familie-inhaber-ansicht-select" style={{ fontSize: '0.88rem', color: a.muted }}>
              Priorität
            </label>
            <select
              id="k2-familie-inhaber-ansicht-select"
              aria-label="Arbeitsansicht als Inhaber:in"
              value={inhaberArbeitsansicht}
              onChange={(e) => setInhaberArbeitsansicht(e.target.value as K2FamilieInhaberArbeitsansicht)}
              style={{
                display: 'block',
                marginTop: '0.35rem',
                background: '#fffefb',
                border: '1px solid rgba(181, 74, 30, 0.28)',
                borderRadius: a.radius,
                color: a.text,
                padding: '0.4rem 0.65rem',
                fontSize: '0.92rem',
                fontFamily: 'inherit',
                maxWidth: 'min(100%, 420px)',
              }}
            >
              {K2_FAMILIE_INHABER_ANSICHT.map((opt) => (
                <option key={opt} value={opt}>
                  {K2_FAMILIE_INHABER_ANSICHT_LABELS[opt]}
                </option>
              ))}
            </select>
          </div>
        )}

        {designatedId && designatedName && (
          <div style={{ ...card, borderLeftColor: '#0d9488' }}>
            <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
              Inhaber:in laut Familie
            </h2>
            <p style={{ margin: 0, fontSize: '0.92rem', color: a.text, lineHeight: 1.5 }}>
              <strong>{designatedName}</strong>
              {ichId === designatedId ? (
                <span style={{ color: a.muted }}> · Das bist du („Du“).</span>
              ) : (
                <span style={{ color: a.muted }}>
                  {' '}
                  · Wenn du nicht diese Person bist, wirken deine Rechte wie Bearbeiter:in – auch wenn du „Inhaber:in“ wählst.
                </span>
              )}
            </p>
          </div>
        )}

        {canShowTransfer && (
          <div style={{ ...card, borderLeftColor: '#b45309' }}>
            <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
              Inhaberschaft übertragen
            </h2>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.9rem', color: a.muted, lineHeight: 1.55 }}>
              Die neue Inhaber:in muss in der Stammbaumliste existieren und einen anderen Eintrag haben als „Du“. Nach der Übertragung ist die Rolle auf{' '}
              <strong style={{ color: a.text }}>diesem Gerät</strong> Bearbeiter:in; die andere Person wählt einmalig Inhaber:in.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem 1rem' }}>
              <label htmlFor="k2-familie-inhaber-transfer" style={{ fontSize: '0.88rem', color: a.muted }}>
                Neue Inhaber:in
              </label>
              <select
                id="k2-familie-inhaber-transfer"
                aria-label="Person auswählen für Inhaberschaft"
                value={transferToId}
                onChange={(e) => setTransferToId(e.target.value)}
                style={{
                  background: '#fffefb',
                  border: '1px solid rgba(181, 74, 30, 0.28)',
                  borderRadius: a.radius,
                  color: a.text,
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.92rem',
                  fontFamily: 'inherit',
                  maxWidth: 'min(100%, 280px)',
                }}
              >
                <option value="">— Person wählen —</option>
                {transferCandidates.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name?.trim() || p.id}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!transferToId || transferToId === designatedId}
                onClick={handleInhaberschaftUebertragen}
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  borderRadius: a.radius,
                  border: '1px solid rgba(181, 74, 30, 0.35)',
                  background: !transferToId || transferToId === designatedId ? a.bgElevated : '#b45309',
                  color: !transferToId || transferToId === designatedId ? a.muted : '#fff',
                  cursor: !transferToId || transferToId === designatedId ? 'not-allowed' : 'pointer',
                }}
              >
                Übertragen
              </button>
            </div>
          </div>
        )}

        <div style={card}>
          <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
            Zugang &amp; Name, QR-Code
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: a.muted, lineHeight: 1.55 }}>
            {isLeser ? (
              <>
                Zugangsnummer, QR und „Du“: auf <strong style={{ color: a.text }}>Meine Familie</strong> unter „Zugang &amp; Name“.
              </>
            ) : (
              <>
                Zugangsnummer, QR für Familienmitglieder und Anzeigename („Du“) werden auf der Seite <strong style={{ color: a.text }}>Meine Familie</strong> im Bereich „Zugang &amp; Name“ gepflegt.
              </>
            )}
          </p>
          <Link to={`${R.meineFamilie}#k2-familie-zugang-name`} style={linkBtn}>
            → Zu Zugang &amp; Name auf „Meine Familie“
          </Link>
        </div>

        {kannInstanz && (
          <div style={{ ...card, borderLeftColor: '#0e7490' }}>
            <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
              Mitglieder &amp; persönliche Codes
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: a.muted, lineHeight: 1.5 }}>
              <strong style={{ color: a.text }}>Inhaber:in</strong>: Codes festlegen und an Mitglieder weitergeben. Hier die Übersicht —{' '}
              <strong style={{ color: a.text }}>drucken</strong> oder <strong style={{ color: a.text }}>Text kopieren</strong> für Mail und WhatsApp.
            </p>
            <Link to={R.mitgliederCodes} style={linkBtn}>
              → Zu Mitglieder &amp; Codes
            </Link>
          </div>
        )}

        {kannStruktur ? (
          <div style={{ ...card, borderLeftColor: '#15803d' }}>
            <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
              Stammbaum-Ansicht (Du, Startpunkt, Partner-Zweig)
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: a.muted, lineHeight: 1.55 }}>
              Startpunkt, Partner-Herkunft und wer „Du“ bist – auf „Meine Familie“ unter den einklappbaren Einstellungen.
            </p>
            <Link to={`${R.meineFamilie}#k2-familie-ansicht-einstellungen`} style={linkBtn}>
              → Stammbaum-Ansicht einstellen
            </Link>
          </div>
        ) : (
          <p
            style={{
              margin: '0 0 1.15rem',
              fontSize: '0.88rem',
              color: a.muted,
              lineHeight: 1.5,
              padding: '0.65rem 0.85rem',
              borderRadius: a.radius,
              background: a.bgElevated,
              border: '1px solid rgba(181, 74, 30, 0.12)',
            }}
          >
            <strong style={{ color: a.text }}>Stammbaum-Ansicht</strong> (Startpunkt, „Du“) kann nur die Inhaber:in ändern. Den Stammbaum siehst du unter „Stammbaum“; persönliche Angaben auf deiner Karte unter „Meine Familie“.
          </p>
        )}

        {showSicherung ? (
          <div style={{ ...card, borderLeftColor: '#b91c1c' }}>
            <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
              Sicherung &amp; Backup
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: a.muted, lineHeight: 1.55 }}>
              Sicherungskopie herunterladen, aus Datei wiederherstellen (nur Inhaber:in), GEDCOM-Export – getrennt von K2 Galerie und ök2.
            </p>
            <Link to={R.sicherung} style={{ ...linkBtn, ...a.buttonPrimary }}>
              → Zur Sicherungs-Seite
            </Link>
          </div>
        ) : (
          <p
            style={{
              margin: '0 0 1.15rem',
              fontSize: '0.88rem',
              color: a.muted,
              lineHeight: 1.5,
              padding: '0.65rem 0.85rem',
              borderRadius: a.radius,
              background: 'rgba(100, 116, 139, 0.08)',
              border: '1px solid rgba(100, 116, 139, 0.2)',
            }}
          >
            <strong style={{ color: a.text }}>Sicherungskopie</strong> ist für diese Rolle oder Sitzung nicht frei – nur Bearbeiter:in oder Inhaber:in (mit bestätigter Identität).
          </p>
        )}

        {isLeser ? (
          <p style={{ margin: '0 0 1.15rem', fontSize: '0.88rem', color: a.muted, lineHeight: 1.5 }}>
            Lizenz &amp; Kosten:{' '}
            <Link to={`${R.uebersicht}#k2-familie-lizenz-bruecke`} style={{ color: a.accent, fontWeight: 600 }}>
              Übersicht K2 Familie
            </Link>
          </p>
        ) : (
          <div style={{ ...card, borderLeftColor: '#ca8a04' }}>
            <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
              Lizenz &amp; Produkt (nur K2 Familie)
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: a.muted, lineHeight: 1.55 }}>
              K2 Familie ist ein eigenes Lizenzprodukt (keine Koppelung an die Galerie-Lizenzen). Kurzinfo und Verweise auf die Doku stehen unter Leitbild &amp; Vision.
            </p>
            <Link to={`${R.uebersicht}#k2-familie-lizenz-bruecke`} style={linkBtn}>
              → Lizenz &amp; Kosten in der Übersicht
            </Link>
          </div>
        )}

        <div
          style={{
            ...card,
            borderLeft: `4px solid rgba(181, 74, 30, 0.35)`,
            background: a.bgDark,
          }}
        >
          <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
            Handbuch &amp; Präsentation
          </h2>
          <p style={{ margin: '0 0 0.65rem', fontSize: '0.88rem', color: a.muted, lineHeight: 1.5 }}>
            Nur Kurzlinks – ausführliche Inhalte öffnen sich in der jeweiligen Ansicht.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <Link to={R.benutzerHandbuch} title="Nutzerhandbuch K2 Familie" style={iconLink} aria-label="Handbuch öffnen">
              📚
            </Link>
            <Link to={R.familiePraesentationsmappe} title="Präsentationsmappe K2 Familie" style={iconLink} aria-label="Präsentationsmappe öffnen">
              🗂️
            </Link>
            <span style={{ fontSize: '0.82rem', color: a.muted }}>
              📚 Handbuch · 🗂️ Präsentationsmappe
            </span>
          </div>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: a.muted, lineHeight: 1.45 }}>
          {PRODUCT_COPYRIGHT_BRAND_ONLY}
        </p>
        <p style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: a.muted, lineHeight: 1.45 }}>
          {PRODUCT_URHEBER_ANWENDUNG}
        </p>
      </div>
    </div>
  )
}
