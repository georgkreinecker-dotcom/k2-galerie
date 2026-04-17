/**
 * VK2-Plattform-Rundgang: ein durchgängiger Leitfaden (Vereinsgalerie → Admin), eine Modal-Instanz, Routen-Sync.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import { isPlatformInstance } from '../config/tenantConfig'
import { useTenant } from '../context/TenantContext'
import { buildVk2PlatformLeitfadenSchritte } from './guidedLeitfaden/vk2PlatformLeitfadenSteps'
import { Vk2GalerieLeitfadenModal } from './Vk2GalerieLeitfadenModal'
import {
  EVENT_VK2_PLATFORM_RUNDGANG,
  hasVk2PlatformLeitfadenCompleted,
  isVk2PlatformRundgangSessionVisible,
  readVk2PlatformLeitfadenSchritt,
  setVk2PlatformRundgangSessionVisible,
  writeVk2PlatformLeitfadenSchritt,
} from '../utils/vk2PlatformLeitfadenStorage'

const GALERIE_PATH = PROJECT_ROUTES.vk2.galerie

export function Vk2PlatformLeitfadenHost() {
  const location = useLocation()
  /** Aktueller Pfad für navigateIfNeededForStep – nicht in Callback-Deps, sonst bei jedem manuellen Seitenwechsel neuer Callback → Effekt zwingt zurück (z. B. Admin → Galerie → wieder Admin). */
  const locationRef = useRef(location)
  locationRef.current = location
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tenant = useTenant()
  const [, bump] = useState(0)
  const rerender = useCallback(() => bump((n) => n + 1), [])

  const vorname = (searchParams.get('vorname') ?? '').trim()
  const name = vorname || 'Besucher'

  const schritte = useMemo(() => buildVk2PlatformLeitfadenSchritte(name), [name])

  const [schritt, setSchritt] = useState(() => readVk2PlatformLeitfadenSchritt())

  useEffect(() => {
    window.addEventListener(EVENT_VK2_PLATFORM_RUNDGANG, rerender)
    return () => window.removeEventListener(EVENT_VK2_PLATFORM_RUNDGANG, rerender)
  }, [rerender])

  useEffect(() => {
    setSchritt(readVk2PlatformLeitfadenSchritt())
  }, [location.pathname, location.search])

  useEffect(() => {
    const max = Math.max(0, schritte.length - 1)
    setSchritt((s) => Math.min(s, max))
  }, [schritte.length])

  useEffect(() => {
    if (!isPlatformInstance()) return
    if (hasVk2PlatformLeitfadenCompleted()) return
    if (!tenant.isVk2) return
    setVk2PlatformRundgangSessionVisible(true)
  }, [location.pathname, location.search, tenant.isVk2])

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
        if (pathNow !== GALERIE_PATH) {
          navigate(`${GALERIE_PATH}${suffix}`)
        }
      } else if (step.phase === 'admin') {
        if (!pathNow.startsWith('/admin')) {
          navigate('/admin?context=vk2')
        }
      }
    },
    [schritte, vorname, navigate],
  )

  const onSchrittChange = useCallback(
    (i: number) => {
      const max = Math.max(0, schritte.length - 1)
      const next = Math.max(0, Math.min(max, i))
      writeVk2PlatformLeitfadenSchritt(next)
      setSchritt(next)
      navigateIfNeededForStep(next)
    },
    [schritte, navigateIfNeededForStep],
  )

  const show =
    isPlatformInstance() &&
    tenant.isVk2 &&
    (!hasVk2PlatformLeitfadenCompleted() || isVk2PlatformRundgangSessionVisible())

  useEffect(() => {
    if (!show) return
    const step = schritte[schritt]
    if (!step) return
    navigateIfNeededForStep(schritt)
  }, [show, schritt, schritte, navigateIfNeededForStep])

  if (!show) return null

  return (
    <Vk2GalerieLeitfadenModal
      name={name}
      onDismiss={() => setVk2PlatformRundgangSessionVisible(false)}
      platform={{
        schritte,
        schritt,
        onSchrittChange,
      }}
    />
  )
}
