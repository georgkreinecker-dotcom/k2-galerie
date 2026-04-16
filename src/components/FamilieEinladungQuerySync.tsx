/**
 * Verarbeitet ?t= (Tenant), ?z= (Familien-Zugangsnummer), ?m= (persönliche Mitgliedsnummer)
 * und optional ?fn= (Familien-Anzeigename für Empfänger:innen ohne eure localStorage-Daten).
 * Vorher nur auf „Meine Familie“ – ein Scan auf /einstieg oder nach Index-Redirect landete ohne Umschalten.
 */

import { useLayoutEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { useFamilieTenant } from '../context/FamilieTenantContext'
import { K2_FAMILIE_SESSION_UPDATED, loadEinstellungen, loadPersonen, saveEinstellungen } from '../utils/familieStorage'
import { setIdentitaetBestaetigt } from '../utils/familieIdentitaetStorage'
import { findPersonIdByMitgliedsNummer, trimMitgliedsNummerEingabe } from '../utils/familieMitgliedsNummer'
import { fetchFamilieIdentityLite, loadFamilieFromSupabase } from '../utils/familieSupabaseClient'
import {
  clearFamilieEinladungPending,
  setFamilieEinladungPending,
  setFamilieFamilienQrKompaktSession,
} from '../utils/familieEinladungPending'
import { clearFamilieNurMusterSession } from '../utils/familieMusterSession'
import { FAMILIE_HUBER_TENANT_ID } from '../data/familieHuberMuster'

const R_FAM = PROJECT_ROUTES['k2-familie']
const R_PERSONEN = R_FAM.personen

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** URL-Parameter sicher lesen (Scan/Messenger können encodieren). */
function mitgliedsCodeFromSearchParam(raw: string | null | undefined): string {
  if (raw == null || raw === '') return ''
  let s = raw.trim()
  try {
    s = decodeURIComponent(s.replace(/\+/g, ' '))
  } catch {
    /* ignore */
  }
  return trimMitgliedsNummerEingabe(s)
}

/** @deprecated Namensgleich mit Event-String; nutze K2_FAMILIE_SESSION_UPDATED aus familieStorage. */
export const K2_FAMILIE_EINSTELLUNGEN_UPDATED = K2_FAMILIE_SESSION_UPDATED

export function FamilieEinladungQuerySync() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    currentTenantId,
    tenantList,
    setCurrentTenantId,
    ensureTenantInListAndSelect,
    bumpFamilieStorageRevision,
  } = useFamilieTenant()
  useLayoutEffect(() => {
    const tRaw = searchParams.get('t')?.trim()
    /** Gleiche Schreibweise wie in Keys (u. a. UUID aus Einladung in Kleinbuchstaben). */
    const t = tRaw ? tRaw.toLowerCase() : undefined
    const z = searchParams.get('z')?.trim()
    const m = mitgliedsCodeFromSearchParam(searchParams.get('m'))
    /** Kurz: Anzeigename mitschicken, damit Gäste nicht „Neue Familie …“ sehen (kein gemeinsamer Speicher). */
    const fnRaw = searchParams.get('fn')?.trim()
    const fn = fnRaw ? fnRaw.slice(0, 240) : ''
    if (!t && !z && !m && !fn) return

    let cancelled = false

    /**
     * Einladungs-Parameter aus der URL nehmen.
     * Bei **Muster-Demo** `t=huber`: `t` stehen lassen – sonst wird die URL „nackt“, `FamilieApfMeineFamilieSync`
     * beendet die Demo-Sitzung und auf der APf springt die Auswahl auf Kreinecker statt Huber.
     */
    const strip = (removeTenantParamToo?: boolean) => {
      const next = new URLSearchParams(searchParams)
      next.delete('z')
      next.delete('m')
      next.delete('fn')
      next.delete('v')
      next.delete('_')
      if (removeTenantParamToo || t !== FAMILIE_HUBER_TENANT_ID) {
        next.delete('t')
      } else {
        next.set('t', FAMILIE_HUBER_TENANT_ID)
      }
      setSearchParams(next, { replace: true })
    }

    /** Speichert ichBinPersonId + Identität; gibt die Personen-ID zurück. */
    const persistIchBinNachCode = (tenantId: string, pid: string): boolean => {
      const einst = loadEinstellungen(tenantId)
      if (saveEinstellungen(tenantId, { ...einst, ichBinPersonId: pid })) {
        setIdentitaetBestaetigt(tenantId, pid)
        return true
      }
      return false
    }

    /**
     * Abgleich persönlicher Code: mehrere **schlanke** Lite-GETs (ohne Foto-Payloads), dann **einmal** Vollladen,
     * damit lokale Daten vollständig sind. Zuletzt ein Vollladen als Fallback (wie früher mehrere Vollladen).
     */
    const applyPersoenlicheMitgliedsNummerWithRetries = async (
      tenantId: string,
      mParam: string | undefined,
    ): Promise<string | null> => {
      const mNorm = trimMitgliedsNummerEingabe(mParam ?? '')
      if (!mNorm) return null
      /** Mobil / schwaches Netz: mehrere Versuche; Lite = wenig Daten pro Versuch. */
      const delaysMs = [0, 300, 700, 1400, 2400]
      for (let i = 0; i < delaysMs.length; i++) {
        if (i > 0) await sleep(delaysMs[i])
        if (cancelled) return null
        const data = await fetchFamilieIdentityLite(tenantId)
        if (data.loadMeta.ok) {
          const pid = findPersonIdByMitgliedsNummer(data.personen, mNorm)
          if (pid) {
            await loadFamilieFromSupabase(tenantId)
            bumpFamilieStorageRevision()
            if (persistIchBinNachCode(tenantId, pid)) return pid
          }
        }
        const pidLocal = findPersonIdByMitgliedsNummer(loadPersonen(tenantId), mNorm)
        if (pidLocal) {
          await loadFamilieFromSupabase(tenantId)
          bumpFamilieStorageRevision()
          if (persistIchBinNachCode(tenantId, pidLocal)) return pidLocal
        }
      }
      if (cancelled) return null
      const full = await loadFamilieFromSupabase(tenantId)
      bumpFamilieStorageRevision()
      let pid = findPersonIdByMitgliedsNummer(full.personen, mNorm)
      if (!pid) pid = findPersonIdByMitgliedsNummer(loadPersonen(tenantId), mNorm)
      if (pid && persistIchBinNachCode(tenantId, pid)) return pid
      return null
    }

    /** QR landet manchmal auf Einstellungen/Stammbaum: für manuellen Code immer „Meine Familie“. */
    const goMeineFamilieIfNeeded = () => {
      const path = location.pathname.replace(/\/$/, '')
      const target = R_FAM.meineFamilie.replace(/\/$/, '')
      if (path !== target) {
        navigate(R_FAM.meineFamilie, { replace: true })
      }
    }

    const run = async () => {
      if (t) {
        if (t !== FAMILIE_HUBER_TENANT_ID) {
          clearFamilieNurMusterSession()
        }
        let switched: boolean
        if (tenantList.includes(t)) {
          setCurrentTenantId(t)
          switched = true
        } else {
          switched = ensureTenantInListAndSelect(t)
        }
        if (!switched) {
          setFamilieEinladungPending({
            t,
            z,
            ...(m ? { m } : {}),
            fn,
            tenantInvalid: true,
          })
          strip(true)
          goMeineFamilieIfNeeded()
          return
        }
        /** Einladung: `z` gilt für alle (Gäste brauchen die Nummer im Speicher, nicht nur Inhaber:innen). */
        if (z) {
          const einst = loadEinstellungen(t)
          saveEinstellungen(t, { ...einst, mitgliedsNummerAdmin: z })
        }
        if (fn) {
          const einst = loadEinstellungen(t)
          if (!einst.familyDisplayName?.trim()) {
            saveEinstellungen(t, { ...einst, familyDisplayName: fn })
          }
        }
        if (cancelled) return
        let pidFromM: string | null = null
        if (m) pidFromM = await applyPersoenlicheMitgliedsNummerWithRetries(t, m)
        strip()
        if (pidFromM) {
          clearFamilieEinladungPending()
          navigate(`${R_PERSONEN}/${pidFromM}`, { replace: true })
        } else if (m) {
          setFamilieEinladungPending({ t, z, m, fn })
          goMeineFamilieIfNeeded()
        } else if (z) {
          /** Allgemeine Familien-QR (t+z, kein m): kompakte Nur-Zugangs-Ansicht, nicht volle Homepage. */
          setFamilieFamilienQrKompaktSession(t)
          bumpFamilieStorageRevision()
          goMeineFamilieIfNeeded()
        }
        return
      }
      if (!t && z) {
        const einst = loadEinstellungen(currentTenantId)
        saveEinstellungen(currentTenantId, { ...einst, mitgliedsNummerAdmin: z })
        if (fn) {
          const e2 = loadEinstellungen(currentTenantId)
          if (!e2.familyDisplayName?.trim()) {
            saveEinstellungen(currentTenantId, { ...e2, familyDisplayName: fn })
          }
        }
        if (cancelled) return
        let pidFromM: string | null = null
        if (m) pidFromM = await applyPersoenlicheMitgliedsNummerWithRetries(currentTenantId, m)
        strip()
        if (pidFromM) {
          clearFamilieEinladungPending()
          navigate(`${R_PERSONEN}/${pidFromM}`, { replace: true })
        } else if (m) {
          setFamilieEinladungPending({ z, m, fn })
          goMeineFamilieIfNeeded()
        } else {
          setFamilieFamilienQrKompaktSession(currentTenantId)
          bumpFamilieStorageRevision()
          goMeineFamilieIfNeeded()
        }
        return
      }
      if (!t && !z && m) {
        if (cancelled) return
        const pidFromM = await applyPersoenlicheMitgliedsNummerWithRetries(currentTenantId, m)
        strip()
        if (pidFromM) {
          clearFamilieEinladungPending()
          navigate(`${R_PERSONEN}/${pidFromM}`, { replace: true })
        } else {
          setFamilieEinladungPending({ m, fn })
          goMeineFamilieIfNeeded()
        }
        return
      }
      if (!t && !z && !m && fn) {
        const einst = loadEinstellungen(currentTenantId)
        if (!einst.familyDisplayName?.trim()) {
          saveEinstellungen(currentTenantId, { ...einst, familyDisplayName: fn })
        }
        strip()
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [
    searchParams,
    tenantList,
    setCurrentTenantId,
    ensureTenantInListAndSelect,
    setSearchParams,
    currentTenantId,
    bumpFamilieStorageRevision,
    navigate,
    location.pathname,
    location.search,
  ])

  return null
}
