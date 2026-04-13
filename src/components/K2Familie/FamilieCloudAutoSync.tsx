/**
 * Beim Betreten der Familien-App: einmal Cloud-Merge (Supabase → localStorage) pro aktiver Familie,
 * danach Revision erhöhen – damit alle Ansichten Daten wie eine App automatisch aktualisieren.
 */

import { useEffect, useRef } from 'react'
import { useFamilieTenant } from '../../context/FamilieTenantContext'
import { loadFamilieFromSupabase } from '../../utils/familieSupabaseClient'

export function FamilieCloudAutoSync() {
  const { currentTenantId, bumpFamilieStorageRevision } = useFamilieTenant()
  const tenantRef = useRef(currentTenantId)
  tenantRef.current = currentTenantId

  useEffect(() => {
    let cancelled = false
    const tid = currentTenantId
    void loadFamilieFromSupabase(tid).finally(() => {
      if (cancelled) return
      if (tid !== tenantRef.current) return
      bumpFamilieStorageRevision()
    })
    return () => {
      cancelled = true
    }
  }, [currentTenantId, bumpFamilieStorageRevision])

  return null
}
