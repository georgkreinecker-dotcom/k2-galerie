import { useState } from 'react'
import { usePersistentString } from '../hooks/usePersistentState'

const DomainManager = () => {
  const [mainDomain, setMainDomain] = usePersistentString('k2-domain-main', 'k2-galerie.at')
  const [subdomains, setSubdomains] = usePersistentString('k2-domain-subdomains', JSON.stringify([]))
  const [newSubdomain, setNewSubdomain] = useState('')

  const parsedSubdomains: string[] = JSON.parse(subdomains || '[]')

  const addSubdomain = () => {
    if (!newSubdomain.trim()) return
    const subdomain = newSubdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (subdomain && !parsedSubdomains.includes(subdomain)) {
      setSubdomains(JSON.stringify([...parsedSubdomains, subdomain]))
      setNewSubdomain('')
    }
  }

  const removeSubdomain = (subdomain: string) => {
    setSubdomains(JSON.stringify(parsedSubdomains.filter(s => s !== subdomain)))
  }

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginTop: '1.5rem'
    }}>
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '1rem',
        fontSize: '1.25rem',
        color: '#f4f7ff'
      }}>
        🌐 Domain & Subdomains
      </h3>

      {/* Hauptdomain */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem',
          color: '#8fa0c9',
          fontSize: '0.9rem'
        }}>
          Hauptdomain:
        </label>
        <input
          type="text"
          value={mainDomain}
          onChange={(e) => setMainDomain(e.target.value)}
          placeholder="k2-galerie.at"
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#f4f7ff',
            fontSize: '0.95rem'
          }}
        />
      </div>

      {/* Subdomain hinzufügen */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={newSubdomain}
            onChange={(e) => setNewSubdomain(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSubdomain()}
            placeholder="Subdomain (z.B. shop)"
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#f4f7ff',
              fontSize: '0.95rem'
            }}
          />
          <button
            onClick={addSubdomain}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(120deg, #5ffbf1, #33a1ff)',
              border: 'none',
              borderRadius: '8px',
              color: '#04111f',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Subdomains Liste */}
      {parsedSubdomains.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          {parsedSubdomains.map((subdomain) => (
            <div
              key={subdomain}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                marginBottom: '0.5rem'
              }}
            >
              <div>
                <strong style={{ color: '#f4f7ff' }}>{subdomain}.{mainDomain}</strong>
                <div style={{ fontSize: '0.8rem', color: '#8fa0c9', marginTop: '0.25rem' }}>
                  DNS: A-Record → 76.76.21.21
                </div>
              </div>
              <button
                onClick={() => removeSubdomain(subdomain)}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: 'rgba(255, 100, 100, 0.2)',
                  border: '1px solid rgba(255, 100, 100, 0.3)',
                  borderRadius: '6px',
                  color: '#ff6464',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Einfache Anleitung */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'rgba(95, 251, 241, 0.1)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: '#5ffbf1'
      }}>
        <strong>So geht's:</strong>
        <ol style={{ margin: '0.5rem 0 0 1.25rem', padding: 0, lineHeight: '1.8' }}>
          <li>Subdomain eingeben → Hinzufügen</li>
          <li>Bei Vercel: Settings → Domains → {mainDomain ? `${parsedSubdomains[0] || 'subdomain'}.${mainDomain}` : 'Domain'} hinzufügen</li>
          <li>DNS bei Provider setzen (A-Record → 76.76.21.21)</li>
          <li>Fertig! 💚</li>
        </ol>
      </div>
    </div>
  )
}

export default DomainManager
