/**
 * K2 Familie – „Zurück“ = vorherige Seite (Router-Historie), nicht fester Link.
 */

import { useNavigate, useLocation } from 'react-router-dom'
import type { CSSProperties, ReactNode } from 'react'
import { PROJECT_ROUTES, PLATFORM_ROUTES } from '../config/navigation'
import { navigateFamilieBack } from '../utils/familieNavigateBack'

type Props = {
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

const btnReset: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  fontSize: 'inherit',
  fontFamily: 'inherit',
  color: 'inherit',
  textDecoration: 'underline',
  textAlign: 'left',
}

export default function FamilieBackButton({ children = '← Zurück', className = 'meta', style }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const home = PROJECT_ROUTES['k2-familie'].home
  const isFamilieHome = pathname === home || pathname === `${home}/`
  const fallback = isFamilieHome ? PLATFORM_ROUTES.projects : home

  return (
    <button
      type="button"
      className={className}
      style={{ ...btnReset, ...style }}
      aria-label="Zurück"
      onClick={() => navigateFamilieBack(navigate, fallback)}
    >
      {children}
    </button>
  )
}
