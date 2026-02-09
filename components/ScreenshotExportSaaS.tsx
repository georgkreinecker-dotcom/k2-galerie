
/**
 * Screenshot Export Seite für SaaS
 * Wird angezeigt bei: ?screenshot=saas
 */
export function ScreenshotExportSaaS() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#8b6914' }}>
          SaaS Screenshot Export
        </h1>
        <p style={{ color: '#666' }}>
          Diese Seite wird für Screenshots verwendet.
        </p>
        <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '1rem' }}>
          URL: ?screenshot=saas
        </p>
      </div>
    </div>
  )
}
