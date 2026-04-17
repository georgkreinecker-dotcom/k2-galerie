/**
 * VK2-Admin-Rundgang: über Router-Ebenen hinweg sichtbar (nicht nur im Admin-Chunk).
 * Auto-Öffnen für neue Besucher (Leitfaden noch nicht abgeschlossen), solange VK2-Admin-Kontext.
 */

import { useCallback, useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { isPlatformInstance } from '../config/tenantConfig'
import { useTenant } from '../context/TenantContext'
import { Vk2AdminLeitfadenModal } from './Vk2AdminLeitfadenModal'
import {
  EVENT_VK2_ADMIN_RUNDGANG,
  hasVk2AdminLeitfadenCompleted,
  isVk2AdminRundgangSessionVisible,
  setVk2AdminRundgangSessionVisible,
} from '../utils/vk2AdminLeitfadenStorage'

export function Vk2AdminLeitfadenHost() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const tenant = useTenant()
  const [, bump] = useState(0)
  const rerender = useCallback(() => bump((n) => n + 1), [])

  useEffect(() => {
    window.addEventListener(EVENT_VK2_ADMIN_RUNDGANG, rerender)
    return () => window.removeEventListener(EVENT_VK2_ADMIN_RUNDGANG, rerender)
  }, [rerender])

  // Erstbesuch / noch nicht abgeschlossen: im VK2-Admin-Kontext Rundgang einblenden
  useEffect(() => {
    if (!isPlatformInstance()) return
    if (hasVk2AdminLeitfadenCompleted()) return
    if (!tenant.isVk2) return
    setVk2AdminRundgangSessionVisible(true)
  }, [location.pathname, location.search, tenant.isVk2])

  const show =
    isPlatformInstance() &&
    !hasVk2AdminLeitfadenCompleted() &&
    isVk2AdminRundgangSessionVisible()

  const vorname = (searchParams.get('vorname') ?? '').trim()

  if (!show) return null

  return (
    <Vk2AdminLeitfadenModal
      name={vorname || 'Besucher'}
      onDismiss={() => setVk2AdminRundgangSessionVisible(false)}
    />
  )
}
