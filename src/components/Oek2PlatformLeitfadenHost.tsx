/**
 * ök2-Plattform-Rundgang: ein durchgängiger Leitfaden (Demo-Galerie → Admin), eine Modal-Instanz, Routen-Sync.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { isPlatformInstance } from '../config/tenantConfig'
import { useTenant } from '../context/TenantContext'
import { buildOek2PlatformLeitfadenSchritte } from './guidedLeitfaden/oek2PlatformLeitfadenSteps'
import { Oek2GalerieLeitfadenModal } from './Oek2GalerieLeitfadenModal'
import {
  EVENT_OEK2_PLATFORM_RUNDGANG,
  SS_OEK2_GALERIE_LEITFADEN_MINIMIZED,
  hasOek2PlatformLeitfadenCompleted,
  isOek2PlatformLeitfadenContext,
  isOek2PlatformRundgangSessionVisible,
  isOek2PublicGaleriePath,
  readOek2PlatformLeitfadenSchritt,
  setOek2PlatformRundgangSessionVisible,
  writeOek2PlatformLeitfadenSchritt,
} from '../utils/oek2PlatformLeitfadenStorage'

const GALERIE_PATH = PROJECT_ROUTES['k2-galerie'].galerieOeffentlich
const GALERIE_VORSCHAU_PATH = PROJECT_ROUTES['k2-galerie'].galerieOeffentlichVorschau

export function Oek2PlatformLeitfadenHost() {
  const location = useLocation()
  const locationRef = useRef(location)
  locationRef.current = location
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tenant = useTenant()
  const [, bump] = useState(0)
  const rerender = useCallback(() => bump((n) => n + 1), [])

  const vorname = (searchParams.get('vorname') ?? '').trim()
  const name = vorname || 'Besucher'

  const schritte = useMemo(() => buildOek2PlatformLeitfadenSchritte(name), [name])

  const [schritt, setSchritt] = useState(() => readOek2PlatformLeitfadenSchritt())

  useEffect(() => {
    window.addEventListener(EVENT_OEK2_PLATFORM_RUNDGANG, rerender)
    return () => window.removeEventListener(EVENT_OEK2_PLATFORM_RUNDGANG, rerender)
  }, [rerender])

  useEffect(() => {
    setSchritt(readOek2PlatformLeitfadenSchritt())
  }, [location.pathname, location.search])

  useEffect(() => {
    const max = Math.max(0, schritte.length - 1)
    setSchritt((s) => Math.min(s, max))
  }, [schritte.length])

  const prevOnOek2GalerieRef = useRef(false)
  useEffect(() => {
    if (!isPlatformInstance()) return
    const onGalerie = isOek2PublicGaleriePath(location.pathname)
    const entered = onGalerie && !prevOnOek2GalerieRef.current
    prevOnOek2GalerieRef.current = onGalerie
    if (!isOek2PlatformLeitfadenContext(location.pathname, tenant.tenantId)) return
    if (hasOek2PlatformLeitfadenCompleted()) return
    if (entered) {
      try {
        sessionStorage.removeItem(SS_OEK2_GALERIE_LEITFADEN_MINIMIZED)
      } catch {
        /* ignore */
      }
      // Nur beim Einstieg in die Demo-Galerie, nicht bei jeder Navigation – sonst bleibt „Schließen“ nicht bestehen.
      setOek2PlatformRundgangSessionVisible(true)
    }
  }, [location.pathname, location.search, tenant.tenantId])

  const navigateIfNeededForStep = useCallback(
    (i: number) => {
      const step = schritte[i]
      if (!step) return
      const pathNow = locationRef.current.pathname
      const q = new URLSearchParams()
      if (vorname) q.set('vorname', vorname)
      const qs = q.toString()
      const suffix = qs ? `?${qs}` : ''
      if (step.phase === 'galerie') {
        const onOek2Galerie =
          pathNow === GALERIE_PATH ||
          pathNow === GALERIE_VORSCHAU_PATH ||
          pathNow === '/galerie-oeffentlich' ||
          pathNow === '/galerie-oeffentlich-vorschau'
        if (!onOek2Galerie) {
          navigate(`${GALERIE_PATH}${suffix}`)
        }
      } else if (step.phase === 'admin') {
        if (!pathNow.startsWith('/admin')) {
          navigate(`/admin?context=oeffentlich${vorname ? `&vorname=${encodeURIComponent(vorname)}` : ''}`)
        }
      }
    },
    [schritte, vorname, navigate],
  )

  const onSchrittChange = useCallback(
    (i: number) => {
      const max = Math.max(0, schritte.length - 1)
      const next = Math.max(0, Math.min(max, i))
      writeOek2PlatformLeitfadenSchritt(next)
      setSchritt(next)
      navigateIfNeededForStep(next)
    },
    [schritte, navigateIfNeededForStep],
  )

  const platformConfig = useMemo(
    () => ({
      schritte,
      schritt,
      onSchrittChange,
    }),
    [schritte, schritt, onSchrittChange],
  )

  /** Nur Session-Sichtbarkeit (nicht „solange nicht fertig“), damit „Schließen“ hält; ersten Aufklapp-Effekt liefert der Effect beim Einstieg in die Demo-Galerie. */
  const show =
    isPlatformInstance() &&
    isOek2PlatformLeitfadenContext(location.pathname, tenant.tenantId) &&
    isOek2PlatformRundgangSessionVisible()

  const routeSyncedForVisibleSessionRef = useRef(false)
  useEffect(() => {
    if (!show) {
      routeSyncedForVisibleSessionRef.current = false
      return
    }
    if (routeSyncedForVisibleSessionRef.current) return
    routeSyncedForVisibleSessionRef.current = true
    navigateIfNeededForStep(schritt)
  }, [show, schritt, navigateIfNeededForStep])

  if (!show) return null

  return (
    <Oek2GalerieLeitfadenModal
      name={name}
      onDismiss={() => setOek2PlatformRundgangSessionVisible(false)}
      platform={platformConfig}
    />
  )
}
