/**
 * K2 Familie – „Zurück“ = vorherige Seite (Router-Historie), nicht fester Link.
 */

import { useNavigate, useLocation } from 'react-router-dom'
import type { CSSProperties, ReactNode } from 'react'
import { PROJECT_ROUTES, PLATFORM_ROUTES } from '../config/navigation'
import { K2_FAMILIE_APP_SHORT_PATH } from '../utils/k2FamiliePwaBranding'
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
  const R = PROJECT_ROUTES['k2-familie']
  const norm = pathname.replace(/\/$/, '') || pathname
  const isFamilieTop =
    norm === R.home ||
    norm === R.einstieg ||
    norm === R.meineFamilie ||
    norm === K2_FAMILIE_APP_SHORT_PATH
  const fallback = isFamilieTop ? PLATFORM_ROUTES.projects : K2_FAMILIE_APP_SHORT_PATH

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
