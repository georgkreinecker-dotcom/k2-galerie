/**
 * K2 Familie – Sitzung („Identität bestätigt“) und gespeichertes „Du“ (ichBinPersonId) synchron halten.
 * Verhindert Zustände, in denen z. B. „Du“ gesetzt ist, die Sitzung aber eine andere Person meint
 * (oder umgekehrt), obwohl beide IDs noch gültige Personenkarten sind.
 *
 * Regeln:
 * - Ist **„Du“** gültig (Person existiert): Sitzung wird auf dieselbe Personen-ID gesetzt.
 * - Ist **„Du“** leer/unbekannt, die Sitzung aber noch gültig: **„Du“** = Sitzung (einmalig übernehmen).
 * - Sind beide gesetzt und verschieden: **„Du“** gewinnt (persistierte Einstellung), Sitzung angleichen.
 */

import { loadEinstellungen, loadPersonen, saveEinstellungen, K2_FAMILIE_SESSION_UPDATED } from './familieStorage'
import { loadIdentitaetBestaetigt, setIdentitaetBestaetigt } from './familieIdentitaetStorage'

export function syncFamilieIdentitaetMitIchBinPerson(tenantId: string): boolean {
  if (typeof window === 'undefined') return false
  const tid = tenantId?.trim()
  if (!tid) return false

  const personen = loadPersonen(tid)
  const idSet = new Set<string>(personen.map((p) => p.id?.trim()).filter(Boolean) as string[])
  const einst = loadEinstellungen(tid)
  const ich = einst.ichBinPersonId?.trim() ?? ''
  const sid = loadIdentitaetBestaetigt(tid)?.trim() ?? ''

  const ichOk = ich !== '' && idSet.has(ich)
  const sidOk = sid !== '' && idSet.has(sid)

  if (ichOk && sid !== ich) {
    setIdentitaetBestaetigt(tid, ich)
    window.dispatchEvent(new CustomEvent(K2_FAMILIE_SESSION_UPDATED, { detail: { tenantId: tid } }))
    return true
  }

  if (!ichOk && sidOk) {
    return saveEinstellungen(tid, { ...einst, ichBinPersonId: sid })
  }

  return false
}
