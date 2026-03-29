import { Navigate, useLocation } from 'react-router-dom'
import { flyerEventBogenUrl, type FlyerEventBogenTenantContext } from '../config/navigation'

/**
 * Alte URL `/plakat-galerieeroeffnung` → einheitlich Flyer-Event-Bogen A3-Ableitung (Master bleibt dieselbe Route).
 */
export default function PlakatGalerieeroeffnungRedirect() {
  const { search } = useLocation()
  const ctx = new URLSearchParams(search).get('context')?.toLowerCase().trim()
  const tenant: FlyerEventBogenTenantContext =
    ctx === 'oeffentlich' ? 'oeffentlich' : ctx === 'vk2' ? 'vk2' : 'k2'
  return (
    <Navigate
      to={flyerEventBogenUrl({ mode: 'a3', tenant, fromPublicGalerie: true })}
      replace
    />
  )
}
