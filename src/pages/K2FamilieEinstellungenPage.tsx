/**
 * K2 Familie – Einstellungen & Verwaltung (Zugang, Rolle, Sicherung, Lizenz, Links zu Handbuch/Mappe).
 * Route: /projects/k2-familie/einstellungen
 */

import type { CSSProperties } from 'react'
import { useState, useMemo, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import K2FamilieVerwaltungZugangUndAnsicht from '../components/K2FamilieVerwaltungZugangUndAnsicht'
import K2FamilieStartseiteGestalten from '../components/K2FamilieStartseiteGestalten'
import '../App.css'
import { PROJECT_ROUTES } from '../config/navigation'
import { PRODUCT_COPYRIGHT_BRAND_ONLY, PRODUCT_URHEBER_ANWENDUNG } from '../config/tenantConfig'
import { adminTheme } from '../config/theme'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { useFamilieRolle } from '../context/FamilieRolleContext'
import { loadEinstellungen, loadPersonen, saveEinstellungen, K2_FAMILIE_SESSION_UPDATED } from '../utils/familieStorage'
import { mergeQuelleFamilieInZielFamilie } from '../utils/familieMergeFamilien'
import {
  BENUTZERHANDBUCH_DOC_K2_FAMILIE_ROLLEN_MODELL,
  buildMitgliederInformationsText,
  vornameAusAnzeigeName,
} from '../utils/familieMitgliedInfoBriefText'
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
/** Direkt auf dunklem Viewport (K2-Familie mission-wrapper) – nicht adminTheme.text (nur für helle Karten) */
const onViewport = {
  text: 'var(--k2-text)',
  muted: 'var(--k2-muted)',
  accentLink: 'var(--k2-accent)',
} as const
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
  const location = useLocation()
  const { currentTenantId, tenantList, refreshFromStorage, setCurrentTenantId } = useFamilieTenant()
  const { rolle, setRolle, capabilities, inhaberArbeitsansicht, setInhaberArbeitsansicht } = useFamilieRolle()
  const effRolle = capabilities.rolle
  const kannInstanz = capabilities.canManageFamilienInstanz
  const showSicherung = capabilities.canExportSicherung
  const isLeser = effRolle === 'leser'
  const isBearbeiter = effRolle === 'bearbeiter'
  const showInhaberArbeitsansichtKarte = rolle === 'inhaber' && capabilities.inhaberArbeitsansicht != null

  const [einstTick, setEinstTick] = useState(0)
  const einst = useMemo(() => loadEinstellungen(currentTenantId), [currentTenantId, einstTick])
  useEffect(() => {
    const onUp = () => setEinstTick((t) => t + 1)
    window.addEventListener(K2_FAMILIE_SESSION_UPDATED, onUp)
    return () => window.removeEventListener(K2_FAMILIE_SESSION_UPDATED, onUp)
  }, [])

  useEffect(() => {
    const id = location.hash.replace(/^#/, '')
    if (!id) return
    const tmr = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => window.clearTimeout(tmr)
  }, [location.hash, location.pathname])
  const personen = loadPersonen(currentTenantId)
  const mitgliederInformText = useMemo(() => {
    const e = loadEinstellungen(currentTenantId)
    const pers = loadPersonen(currentTenantId)
    const map = new Map(pers.map((p) => [p.id, p]))
    const ich = e.ichBinPersonId ? map.get(e.ichBinPersonId) : undefined
    return buildMitgliederInformationsText({
      tenantId: currentTenantId,
      familienZ: (e.mitgliedsNummerAdmin ?? '').trim(),
      familyDisplayName: (e.familyDisplayName ?? '').trim(),
      signaturName: vornameAusAnzeigeName(ich?.name?.trim() ?? ''),
    })
  }, [currentTenantId, einstTick])
  const [infoBriefKopiert, setInfoBriefKopiert] = useState(false)
  const ichId = einst.ichBinPersonId?.trim() || ''
  const designatedId = einst.inhaberPersonId?.trim() || ''
  const designatedName = designatedId ? personen.find((p) => p.id === designatedId)?.name?.trim() || '' : ''
  const transferCandidates = ichId ? personen.filter((p) => p.id !== ichId) : []
  const [transferToId, setTransferToId] = useState('')
  const canShowTransfer = kannInstanz && !!ichId && transferCandidates.length > 0

  const mergeQuelleKandidaten = useMemo(
    () =>
      tenantList
        .filter((id) => id !== currentTenantId)
        .map((id) => ({
          id,
          label: loadEinstellungen(id).familyDisplayName?.trim() || id,
        })),
    [tenantList, currentTenantId, einstTick],
  )
  const showFamilienZusammenfuehren = kannInstanz && tenantList.length >= 2
  const [mergeQuelleId, setMergeQuelleId] = useState('')
  const [mergeDisplayName, setMergeDisplayName] = useState('')
  const [mergeBusy, setMergeBusy] = useState(false)

  const handleFamilienZusammenfuehren = () => {
    if (!mergeQuelleId || mergeBusy) return
    const quelleLabel = mergeQuelleKandidaten.find((x) => x.id === mergeQuelleId)?.label || mergeQuelleId
    const zielLabel = einst.familyDisplayName?.trim() || currentTenantId
    const ok = window.confirm(
      `Familien wirklich zusammenführen?\n\n` +
        `• In diese Familie (Ziel): „${zielLabel}“\n` +
        `• Wird eingegliedert (Quelle): „${quelleLabel}“\n\n` +
        `Alle Personen und Daten der Quelle werden in die Ziel-Familie übernommen; die Quelle verschwindet aus der Auswahl und wird auf diesem Gerät gelöscht. ` +
        `Das lässt sich nicht rückgängig machen. Vorher Sicherung empfohlen.\n\n` +
        `Fortfahren?`,
    )
    if (!ok) return
    setMergeBusy(true)
    try {
      const r = mergeQuelleFamilieInZielFamilie(mergeQuelleId, currentTenantId, {
        finalDisplayName: mergeDisplayName.trim() || undefined,
      })
      if (!r.ok) {
        window.alert(r.reason)
        return
      }
      refreshFromStorage()
      setCurrentTenantId(r.zielTenantId)
      setMergeQuelleId('')
      setMergeDisplayName('')
      setEinstTick((t) => t + 1)
    } finally {
      setMergeBusy(false)
    }
  }

  const handleInhaberEinmaligSelbstFestlegen = () => {
    if (!ichId || designatedId) return
    const ok = window.confirm(
      'Nur die Person, die die Familie verwaltet und die Lizenz trägt, soll sich hier als Inhaber:in festlegen.\n\n' +
        'Wenn du das bist: OK.\n\n' +
        'Wenn eine andere Person die Inhaber:in ist: Abbrechen — die Person muss das einmalig auf ihrem Gerät tun, damit die Rechte für alle stimmen.',
    )
    if (!ok) return
    const e0 = loadEinstellungen(currentTenantId)
    if (saveEinstellungen(currentTenantId, { ...e0, inhaberPersonId: ichId })) setEinstTick((t) => t + 1)
  }

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
        <strong style={{ color: onViewport.text }}>Deine Rolle</strong> steht oben in der Leiste. Hier kannst du sie für{' '}
        <strong style={{ color: onViewport.text }}>diese Sitzung</strong> anpassen und den Zugang zu „Meine Familie“ öffnen.
      </>
    ) : isBearbeiter ? (
      <>
        Zugang, Stammbaum-Ansicht (nur lesen) und Sicherung – gebündelt. Oben:{' '}
        <strong style={{ color: onViewport.text }}>aktuelle Rolle</strong>; hier die Rolle für{' '}
        <strong style={{ color: onViewport.text }}>diese Sitzung</strong> wählen, bis die Inhaber:in Rechte festlegt.
      </>
    ) : (
      <>
        Zugangsdaten, Stammbaum-Ansicht, Mitglieder-Codes, Sicherung und Lizenz – zentral. Oben:{' '}
        <strong style={{ color: onViewport.text }}>aktuelle Rolle</strong>; hier für{' '}
        <strong style={{ color: onViewport.text }}>diese Sitzung</strong> änderbar (Zielbild: feste Rollen durch die Inhaber:in).
      </>
    )

  return (
    <div className="mission-wrapper">
      <div className="viewport k2-familie-page" style={{ padding: '1.25rem 1rem 2rem', maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.5rem', fontWeight: 700, color: onViewport.text, fontFamily: a.fontHeading }}>
          {isLeser ? 'Einstellungen' : 'Einstellungen & Verwaltung'}
        </h1>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', color: onViewport.muted, lineHeight: 1.55 }}>
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

        <K2FamilieStartseiteGestalten />

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

        {!designatedId && ichId && !isLeser && (
          <div style={{ ...card, borderLeftColor: '#b45309' }}>
            <h2
              style={{
                margin: '0 0 0.45rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: a.text,
                fontFamily: a.fontHeading,
              }}
            >
              Inhaber:in familienweit festlegen
            </h2>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.92rem', color: a.muted, lineHeight: 1.55 }}>
              Es gibt nur <strong style={{ color: a.text }}>eine</strong> Inhaber:in (Lizenz/Verwaltung). Alle anderen sind Bearbeiter:innen oder Leser:innen — wenn hier keine Inhaber:in feststeht, kann die App das nicht zuverlässig unterscheiden.
            </p>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: a.muted, lineHeight: 1.5 }}>
              <strong style={{ color: a.text }}>Hinweis:</strong> Zuerst von der verwaltenden Person auf <strong style={{ color: a.text }}>diesem</strong> Button bestätigen; danach Daten mit der Cloud abgleichen (oder anderen das aktualisierte Einladungs-QR geben). So sieht niemand versehentlich „Inhaber:in“, obwohl er Bearbeiter:in oder Leser:in sein soll.
            </p>
            <button
              type="button"
              onClick={handleInhaberEinmaligSelbstFestlegen}
              style={{ ...linkBtn, marginTop: 0, border: 'none', cursor: 'pointer' }}
            >
              Ich bin die Inhaber:in (einmalig)
            </button>
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

        {kannInstanz && (
          <div id="k2-familie-stammbaum-festlegen" style={{ ...card, borderLeftColor: '#047857' }}>
            <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
              Stammbaum – festlegen (nur Inhaber:in)
            </h2>
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: a.muted, lineHeight: 1.55 }}>
              Zwei getrennte Entscheidungen: ob noch <strong style={{ color: a.text }}>Personen</strong> angelegt werden dürfen, und ob <strong style={{ color: a.text }}>Löschen</strong> gesperrt ist – damit die Struktur nicht mehr auseinanderfällt.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  margin: 0,
                  fontSize: '0.92rem',
                  color: a.text,
                  lineHeight: 1.45,
                }}
              >
                <input
                  type="checkbox"
                  checked={!!einst.stammbaumSchlusspunkt}
                  onChange={(e) => {
                    const next = !!e.target.checked
                    const e0 = loadEinstellungen(currentTenantId)
                    if (saveEinstellungen(currentTenantId, { ...e0, stammbaumSchlusspunkt: next })) setEinstTick((t) => t + 1)
                  }}
                  style={{ marginTop: '0.2rem', flexShrink: 0 }}
                />
                <span>
                  <strong>Keine neuen Personen mehr</strong>
                  <span style={{ display: 'block', marginTop: '0.2rem', fontSize: '0.86rem', color: a.muted, fontWeight: 400 }}>
                    Buttons zum Anlegen (Stammbaum, Personenseiten, Hilfsfunktionen) sind aus. Bestehende Karten bearbeiten und verknüpfen geht weiter.
                  </span>
                </span>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  margin: 0,
                  fontSize: '0.92rem',
                  color: a.text,
                  lineHeight: 1.45,
                }}
              >
                <input
                  type="checkbox"
                  checked={!!einst.stammbaumPersonenLoeschenGesperrt}
                  onChange={(e) => {
                    const next = !!e.target.checked
                    const e0 = loadEinstellungen(currentTenantId)
                    if (saveEinstellungen(currentTenantId, { ...e0, stammbaumPersonenLoeschenGesperrt: next })) setEinstTick((t) => t + 1)
                  }}
                  style={{ marginTop: '0.2rem', flexShrink: 0 }}
                />
                <span>
                  <strong>Personen löschen sperren</strong>
                  <span style={{ display: 'block', marginTop: '0.2rem', fontSize: '0.86rem', color: a.muted, fontWeight: 400 }}>
                    Niemand kann eine Person mehr endgültig aus dem Stammbaum entfernen – sonst werden Linien und Verknüpfungen falsch. Bearbeiten und Beziehungen ändern bleibt möglich.
                  </span>
                </span>
              </label>
            </div>
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

        {showFamilienZusammenfuehren && (
          <div style={{ ...card, borderLeftColor: '#991b1b' }}>
            <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
              Familien zusammenführen
            </h2>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.9rem', color: a.muted, lineHeight: 1.55 }}>
              Wenn du versehentlich zwei Familien angelegt hast: eine <strong style={{ color: a.text }}>Quelle</strong> in die{' '}
              <strong style={{ color: a.text }}>aktuelle Familie</strong> (Ziel) übernehmen. Die Quelle wird aus der Geräte-Auswahl entfernt; vorher eine{' '}
              <strong style={{ color: a.text }}>Sicherung</strong> erstellen.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: 'min(100%, 420px)' }}>
              <label htmlFor="k2-familie-merge-quelle" style={{ fontSize: '0.88rem', color: a.muted }}>
                Quelle (wird eingegliedert und entfernt)
              </label>
              <select
                id="k2-familie-merge-quelle"
                aria-label="Quell-Familie zum Zusammenführen"
                value={mergeQuelleId}
                onChange={(e) => setMergeQuelleId(e.target.value)}
                style={{
                  background: '#fffefb',
                  border: '1px solid rgba(181, 74, 30, 0.28)',
                  borderRadius: a.radius,
                  color: a.text,
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.92rem',
                  fontFamily: 'inherit',
                }}
              >
                <option value="">— Familie wählen —</option>
                {mergeQuelleKandidaten.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.label}
                  </option>
                ))}
              </select>
              <label htmlFor="k2-familie-merge-name" style={{ fontSize: '0.88rem', color: a.muted }}>
                Anzeigename nach dem Zusammenführen (optional)
              </label>
              <input
                id="k2-familie-merge-name"
                type="text"
                value={mergeDisplayName}
                onChange={(e) => setMergeDisplayName(e.target.value)}
                placeholder={einst.familyDisplayName?.trim() || 'Name der Familie'}
                autoComplete="off"
                style={{
                  background: '#fffefb',
                  border: '1px solid rgba(181, 74, 30, 0.28)',
                  borderRadius: a.radius,
                  color: a.text,
                  padding: '0.4rem 0.65rem',
                  fontSize: '0.92rem',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                disabled={!mergeQuelleId || mergeBusy}
                onClick={handleFamilienZusammenfuehren}
                style={{
                  marginTop: '0.25rem',
                  padding: '0.45rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  borderRadius: a.radius,
                  border: '1px solid rgba(127, 29, 29, 0.45)',
                  background: !mergeQuelleId || mergeBusy ? a.bgElevated : '#991b1b',
                  color: !mergeQuelleId || mergeBusy ? a.muted : '#fff',
                  cursor: !mergeQuelleId || mergeBusy ? 'not-allowed' : 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                {mergeBusy ? '… wird ausgeführt' : 'Jetzt zusammenführen'}
              </button>
            </div>
          </div>
        )}

        <K2FamilieVerwaltungZugangUndAnsicht />

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

        {kannInstanz && (
          <div id="k2-fam-mitglieder-informieren" style={{ ...card, borderLeftColor: '#15803d' }}>
            <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
              Mitglieder informieren
            </h2>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.9rem', color: a.muted, lineHeight: 1.55 }}>
              <strong style={{ color: a.text }}>Inhaber:in</strong>: Mustertext für Mail, Messenger oder SMS – wird aus Familienname, Kennung, Links und deiner Signatur{' '}
              <strong style={{ color: a.text }}>automatisch erzeugt</strong>. Enthält einen Hinweis auf das Rollenmodell und den Link zum{' '}
              <strong style={{ color: a.text }}>Benutzerhandbuch</strong>. Einmal kopieren und verschicken; für druckfertige Briefe mit QR pro Zweig siehe unten.
            </p>
            <p style={{ margin: '0 0 0.65rem', fontSize: '0.88rem', color: a.muted, lineHeight: 1.5 }}>
              <Link
                to={`/benutzer-handbuch?doc=${encodeURIComponent(BENUTZERHANDBUCH_DOC_K2_FAMILIE_ROLLEN_MODELL)}`}
                style={{ color: a.accent, fontWeight: 600 }}
              >
                → Benutzerhandbuch: K2 Familie – drei Rollen (Inhaber:in, Bearbeiter:in, Leser:in)
              </Link>
            </p>
            <textarea
              readOnly
              value={mitgliederInformText}
              aria-label="Text zum Informieren der Mitglieder"
              rows={14}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                marginBottom: '0.65rem',
                padding: '0.55rem 0.65rem',
                fontSize: '0.86rem',
                lineHeight: 1.45,
                fontFamily: 'inherit',
                color: a.text,
                background: '#fffefb',
                border: '1px solid rgba(22, 101, 52, 0.22)',
                borderRadius: a.radius,
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(mitgliederInformText).then(() => {
                    setInfoBriefKopiert(true)
                    window.setTimeout(() => setInfoBriefKopiert(false), 2400)
                  })
                }}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  borderRadius: a.radius,
                  border: 'none',
                  cursor: 'pointer',
                  ...a.buttonPrimary,
                }}
              >
                Text in Zwischenablage kopieren
              </button>
              {infoBriefKopiert ? (
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#15803d' }}>Kopiert.</span>
              ) : null}
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: a.muted, lineHeight: 1.5 }}>
              <Link to={R.einladungGeschwisterBriefe} style={{ color: a.accent, fontWeight: 600 }}>
                → Geschwister-Briefe drucken
              </Link>{' '}
              (lange Vorlage pro Familienzweig mit QR, wie unter Mitglieder &amp; Codes)
            </p>
          </div>
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
              color: onViewport.muted,
              lineHeight: 1.5,
              padding: '0.65rem 0.85rem',
              borderRadius: a.radius,
              background: 'rgba(100, 116, 139, 0.08)',
              border: '1px solid rgba(100, 116, 139, 0.2)',
            }}
          >
            <strong style={{ color: onViewport.text }}>Sicherungskopie</strong> ist für diese Rolle oder Sitzung nicht frei – nur Bearbeiter:in oder Inhaber:in (mit bestätigter Identität).
          </p>
        )}

        <section id="k2-familie-lizenz-erwerben" style={{ margin: 0, padding: 0 }}>
        {isLeser ? (
          <p style={{ margin: '0 0 1.15rem', fontSize: '0.88rem', color: onViewport.muted, lineHeight: 1.55 }}>
            <strong style={{ color: onViewport.text }}>Lizenz:</strong> Die <strong style={{ color: onViewport.text }}>Inhaber:in</strong> ist die{' '}
            <strong style={{ color: onViewport.text }}>Lizenznehmer:in</strong> – nicht automatisch jede eingeladene Rolle.{' '}
            <Link to={R.lizenzKuendigen} style={{ color: onViewport.accentLink, fontWeight: 600 }}>
              Lizenz kündigen
            </Link>
            {' · '}
            <Link to={R.lizenzErwerben} style={{ color: onViewport.accentLink, fontWeight: 600 }}>
              Lizenz erwerben
            </Link>
          </p>
        ) : (
          <div style={{ ...card, borderLeftColor: '#ca8a04' }}>
            <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
              Lizenz &amp; Produkt (nur K2 Familie)
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: a.muted, lineHeight: 1.55 }}>
              Eigenes Produkt. <strong style={{ color: a.text }}>Inhaber:in = Lizenznehmer:in</strong> für diese Familie. Kündigung: keine Bindung (siehe AGB), Monatsabo über
              Stripe; vor Ende <strong style={{ color: a.text }}>Sicherung</strong> anlegen.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.75rem', alignItems: 'center' }}>
              <Link to={R.lizenzErwerben} style={linkBtn}>
                → Lizenz erwerben (Stripe)
              </Link>
              <Link
                to={R.lizenzKuendigen}
                style={{
                  ...linkBtn,
                  background: a.bgElevated,
                  color: a.text,
                  border: '1px solid rgba(181, 74, 30, 0.35)',
                }}
              >
                → Lizenz kündigen
              </Link>
            </div>
          </div>
        )}
        </section>

        <div
          style={{
            ...card,
            borderLeft: `4px solid rgba(181, 74, 30, 0.35)`,
            background: a.bgDark,
          }}
        >
          <h2 style={{ margin: '0 0 0.45rem', fontSize: '1.05rem', fontWeight: 700, color: a.text, fontFamily: a.fontHeading }}>
            Handbuch
          </h2>
          <p style={{ margin: '0 0 0.65rem', fontSize: '0.88rem', color: a.muted, lineHeight: 1.5 }}>
            Kurzlink – ausführliche Inhalte öffnen sich in der Handbuch-Ansicht.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <Link to={R.benutzerHandbuch} title="Nutzerhandbuch K2 Familie" style={iconLink} aria-label="Handbuch öffnen">
              📚
            </Link>
            <span style={{ fontSize: '0.82rem', color: a.muted }}>📚 Benutzerhandbuch</span>
          </div>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: onViewport.muted, lineHeight: 1.45 }}>
          {PRODUCT_COPYRIGHT_BRAND_ONLY}
        </p>
        <p style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: onViewport.muted, lineHeight: 1.45 }}>
          {PRODUCT_URHEBER_ANWENDUNG}
        </p>
      </div>
    </div>
  )
}
