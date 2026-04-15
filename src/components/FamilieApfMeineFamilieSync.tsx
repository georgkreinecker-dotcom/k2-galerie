/**
 * Route „Meine Familie“ ohne Einladungs-/Demo-Query: **Muster-Sitzung beenden** (überall),
 * damit wieder alle Mandanten wählbar sind – nicht nur „Familie Huber“.
 *
 * Zusätzlich nur auf **localhost (APf)**: Stammfamilie Kreinecker aus VITE/Anzeigename wählen.
 *
 * Nicht eingreifen, solange Einladungs-Query (?t= / ?z= / ?m= / ?fn=) in der URL steht – sonst Race
 * mit FamilieEinladungQuerySync. Bei ?t=huber bleibt die Demo-Sitzung aktiv.
 */

import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { PROJECT_ROUTES } from '../config/navigation'
import { isK2FamilieApfLocalhost, resolveApfMeineFamilieTenantId } from '../config/k2FamilieApfDefaults'
import { FAMILIE_HUBER_TENANT_ID } from '../data/familieHuberMuster'
import { clearFamilieNurMusterSession, setFamilieNurMusterSession } from '../utils/familieMusterSession'

const MEINE_PATH = PROJECT_ROUTES['k2-familie'].meineFamilie.replace(/\/$/, '') || '/'

function hasFamilieEinladungOrMusterQuery(search: string): boolean {
  const sp = new URLSearchParams(search || '')
  if (sp.has('t') || sp.has('z') || sp.has('m') || sp.has('fn')) return true
  return false
}

export function FamilieApfMeineFamilieSync() {
  const location = useLocation()
  const { currentTenantId, ensureTenantInListAndSelect } = useFamilieTenant()

  useLayoutEffect(() => {
    const path = (location.pathname || '/').replace(/\/$/, '') || '/'
    if (path !== MEINE_PATH) return
    const sp = new URLSearchParams(location.search || '')
    /** Einladungscode/QR: FamilieEinladungQuerySync zuerst – kein Mandantenwechsel hier dazwischen. */
    if (hasFamilieEinladungOrMusterQuery(location.search || '')) {
      const tRaw = sp.get('t')?.trim().toLowerCase() ?? ''
      if (tRaw === FAMILIE_HUBER_TENANT_ID) {
        setFamilieNurMusterSession(true)
        if (currentTenantId !== FAMILIE_HUBER_TENANT_ID) {
          ensureTenantInListAndSelect(FAMILIE_HUBER_TENANT_ID)
        }
      }
      return
    }
    /** Ohne Query: Demo-Modus verlassen (war zuvor nur auf localhost + mit Kreinecker-ID – Nutzer sahen nur Huber). */
    clearFamilieNurMusterSession()
    if (!isK2FamilieApfLocalhost()) return
    const preferred = resolveApfMeineFamilieTenantId()
    if (!preferred) return
    /** Nach Einladungs-QR: anderer Mandant als Stamm aktiv – nicht auf Kreinecker zurücksetzen. */
    if (currentTenantId !== FAMILIE_HUBER_TENANT_ID && currentTenantId !== preferred) {
      return
    }
    if (currentTenantId === preferred) return
    ensureTenantInListAndSelect(preferred)
  }, [location.pathname, location.search, currentTenantId, ensureTenantInListAndSelect])

  return null
}
