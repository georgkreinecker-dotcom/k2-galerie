/**
 * Brand-Logo – links oben auf jeder Seite.
 * Link zur ök2-Eingangsseite (/willkommen): Besucher einer Galerie sollen in die ök2-Welt
 * geführt werden mit dem Hinweis, in 5 Minuten die eigene Galerie aufbauen zu können.
 */

import { Link } from 'react-router-dom'
import { PRODUCT_BRAND_NAME } from '../config/tenantConfig'
import { WILLKOMMEN_ROUTE } from '../config/navigation'

export default function BrandLogo() {
  return (
    <Link
      to={WILLKOMMEN_ROUTE}
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        zIndex: 99999,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '10px 16px 12px',
        background: 'rgba(0, 0, 0, 0.6)',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: 12,
        fontFamily: "'Playfair Display', Georgia, serif",
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.2)',
        transition: 'background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(181, 74, 30, 0.95)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(181, 74, 30, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.35)'
      }}
      title="In die ök2-Welt eintauchen – in 5 Minuten deine eigene Galerie aufbauen"
    >
      <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
        {PRODUCT_BRAND_NAME}
      </span>
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        opacity: 0.95,
        marginTop: 4,
        letterSpacing: '0.02em',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        Deine Galerie in 5 Min. – jetzt entdecken
      </span>
    </Link>
  )
}
