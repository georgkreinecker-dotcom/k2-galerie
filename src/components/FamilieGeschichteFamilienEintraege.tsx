/**
 * Familien-Einträge zu einer Geschichte – jede Person einen Text, nur Autor:in bearbeitet eigenen Eintrag.
 */
import { useState } from 'react'
import type { K2FamilieGeschichteEintrag, K2FamiliePerson } from '../types/k2Familie'
import { saveGeschichteEintraege } from '../utils/familieStorage'
import {
  canAddGeschichteEintrag,
  canDeleteGeschichteEintrag,
  canEditGeschichteEintrag,
  formatGeschichteZeitpunkt,
  generateGeschichteEintragId,
  geschichteEintraegeFuerGeschichte,
} from '../utils/familieGeschichteEintrag'
import { K2_FAMILIE_UI as C } from '../config/k2FamilieUiColors'

type Props = {
  tenantId: string
  geschichteId: string
  personen: K2FamiliePerson[]
  ichBinPersonId: string | undefined
  kannOrganisch: boolean
  kannInstanz: boolean
  eintraege: K2FamilieGeschichteEintrag[]
  onEintraegeChange: (next: K2FamilieGeschichteEintrag[]) => void
}

function authorName(personen: K2FamiliePerson[], authorPersonId: string): string {
  return personen.find((p) => p.id === authorPersonId)?.name?.trim() || 'Unbekannt'
}

export default function FamilieGeschichteFamilienEintraege({
  tenantId,
  geschichteId,
  personen,
  ichBinPersonId,
  kannOrganisch,
  kannInstanz,
  eintraege,
  onEintraegeChange,
}: Props) {
  const liste = geschichteEintraegeFuerGeschichte(eintraege, geschichteId)
  const ichId = ichBinPersonId?.trim() || ''
  const eigenerEintrag = ichId ? liste.find((e) => e.authorPersonId === ichId) : undefined
  const darfNeu = canAddGeschichteEintrag(kannOrganisch, ichBinPersonId) && !eigenerEintrag

  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [text, setText] = useState('')

  const persist = (next: K2FamilieGeschichteEintrag[]) => {
    if (saveGeschichteEintraege(tenantId, next)) onEintraegeChange(next)
  }

  const openNeu = () => {
    setEditId(null)
    setText('')
    setModal(true)
  }

  const openEdit = (e: K2FamilieGeschichteEintrag) => {
    if (!canEditGeschichteEintrag(e, ichBinPersonId, kannInstanz)) return
    setEditId(e.id)
    setText(e.inhalt)
    setModal(true)
  }

  const save = () => {
    const inhalt = text.trim()
    if (!inhalt || !ichId) return
    const now = new Date().toISOString()
    if (editId) {
      const next = eintraege.map((e) =>
        e.id === editId && canEditGeschichteEintrag(e, ichBinPersonId, kannInstanz)
          ? { ...e, inhalt, updatedAt: now }
          : e,
      )
      persist(next)
    } else {
      const neu: K2FamilieGeschichteEintrag = {
        id: generateGeschichteEintragId(),
        geschichteId,
        authorPersonId: ichId,
        inhalt,
        createdAt: now,
      }
      persist([...eintraege, neu])
    }
    setModal(false)
    setEditId(null)
    setText('')
  }

  const remove = (e: K2FamilieGeschichteEintrag) => {
    if (!canDeleteGeschichteEintrag(e, ichBinPersonId, kannInstanz)) return
    if (!window.confirm('Deinen Eintrag wirklich löschen?')) return
    persist(eintraege.filter((x) => x.id !== e.id))
  }

  return (
    <div
      style={{
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <h3 style={{ fontSize: '0.95rem', color: C.accent, margin: '0 0 0.35rem' }}>Stimmen aus der Familie</h3>
      <p className="meta" style={{ fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.45 }}>
        Jede Person kann <strong style={{ color: C.text }}>einen eigenen Eintrag</strong> mit Namen hinzufügen. Nur du
        kannst deinen Text ändern oder löschen{kannInstanz ? ' (Inhaber:in darf alle pflegen)' : ''}.
      </p>

      {!ichId && kannOrganisch ? (
        <p className="meta" style={{ fontSize: '0.85rem', color: '#fbbf24', marginBottom: '0.75rem' }}>
          Zuerst auf der Startseite „Du“ festlegen und Code bestätigen – dann kannst du hier mit schreiben.
        </p>
      ) : null}

      {liste.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 0.75rem' }}>
          {liste.map((e) => {
            const editierbar = canEditGeschichteEintrag(e, ichBinPersonId, kannInstanz)
            return (
              <li
                key={e.id}
                className="card"
                style={{
                  marginBottom: '0.65rem',
                  padding: '0.85rem',
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                  borderLeft: editierbar ? '4px solid rgba(20,184,166,0.7)' : '4px solid rgba(148,163,184,0.35)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    alignItems: 'center',
                    marginBottom: '0.35rem',
                  }}
                >
                  <strong style={{ color: C.text, fontSize: '0.92rem' }}>{authorName(personen, e.authorPersonId)}</strong>
                  <span className="meta" style={{ fontSize: '0.78rem', lineHeight: 1.35 }}>
                    Eingetragen {formatGeschichteZeitpunkt(e.createdAt)}
                    {e.updatedAt && e.updatedAt !== e.createdAt ? (
                      <> · Geändert {formatGeschichteZeitpunkt(e.updatedAt)}</>
                    ) : null}
                  </span>
                </div>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.45, color: C.textSoft }}>{e.inhalt}</p>
                {editierbar ? (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <button type="button" className="btn-outline" style={{ fontSize: '0.85rem' }} onClick={() => openEdit(e)}>
                      Bearbeiten
                    </button>
                    <button type="button" className="btn-outline danger" style={{ fontSize: '0.85rem' }} onClick={() => remove(e)}>
                      Löschen
                    </button>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="meta" style={{ margin: '0 0 0.75rem', fontSize: '0.85rem' }}>
          Noch keine Familien-Einträge – sei die erste Stimme.
        </p>
      )}

      {darfNeu ? (
        <button type="button" className="btn-outline" onClick={openNeu}>
          Meinen Beitrag hinzufügen
        </button>
      ) : null}
      {eigenerEintrag && kannOrganisch ? (
        <button type="button" className="btn-outline" style={{ marginLeft: darfNeu ? '0.5rem' : 0 }} onClick={() => openEdit(eigenerEintrag)}>
          Meinen Beitrag bearbeiten
        </button>
      ) : null}

      {modal ? (
        <div className="card" style={{ marginTop: '0.75rem', padding: '1rem', borderRadius: 12 }}>
          <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.92rem', color: C.text }}>
            {editId ? 'Eintrag bearbeiten' : 'Meinen Beitrag'}
          </h4>
          <p className="meta" style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
            Erscheint unter: <strong style={{ color: C.text }}>{authorName(personen, ichId)}</strong>
          </p>
          <textarea
            value={text}
            onChange={(ev) => setText(ev.target.value)}
            rows={6}
            placeholder="Deine Erinnerung, dein Abschnitt …"
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              color: C.text,
              padding: '0.6rem',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              lineHeight: 1.5,
            }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={save} disabled={!text.trim()} style={{ background: C.accent }}>
              Speichern
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setModal(false)
                setEditId(null)
                setText('')
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}