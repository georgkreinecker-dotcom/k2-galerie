import { useState } from 'react'
import { usePersistentString } from '../hooks/usePersistentState'

interface Domain {
  name: string
  type: 'main' | 'subdomain'
  status: 'active' | 'pending' | 'error'
  url?: string
  dnsRecords?: Array<{ type: string; name: string; value: string }>
}

const DomainManager = () => {
  const [mainDomain, setMainDomain] = usePersistentString('k2-domain-main', 'k2-galerie.at')
  const [subdomains, setSubdomains] = usePersistentString('k2-domain-subdomains', JSON.stringify([]))
  const [newSubdomain, setNewSubdomain] = useState('')
  const [vercelProjectUrl, setVercelProjectUrl] = usePersistentString('k2-vercel-url', 'k2-galerie.vercel.app')

  const parsedSubdomains: Domain[] = JSON.parse(subdomains || '[]')

  const addSubdomain = () => {
    if (!newSubdomain.trim()) return
    
    const subdomain = newSubdomain.trim().toLowerCase()
    const updated = [
      ...parsedSubdomains,
      {
        name: subdomain,
        type: 'subdomain' as const,
        status: 'pending' as const,
        url: `https://${subdomain}.${mainDomain}`
      }
    ]
    setSubdomains(JSON.stringify(updated))
    setNewSubdomain('')
  }

  const removeSubdomain = (index: number) => {
    const updated = parsedSubdomains.filter((_, i) => i !== index)
    setSubdomains(JSON.stringify(updated))
  }

  const generateDNSInstructions = (domain: string, isSubdomain: boolean) => {
    const name = isSubdomain ? `${domain}.${mainDomain}` : mainDomain
    return [
      { type: 'A', name: isSubdomain ? domain : '@', value: '76.76.21.21' },
      { type: 'CNAME', name: isSubdomain ? domain : 'www', value: 'cname.vercel-dns.com' }
    ]
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
        🌐 Domain & Subdomain Verwaltung
      </h3>

      {/* Hauptdomain */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem',
          color: '#8fa0c9',
          fontSize: '0.9rem',
          fontWeight: '500'
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
        <div style={{ 
          marginTop: '0.5rem', 
          fontSize: '0.85rem', 
          color: '#8fa0c9' 
        }}>
          Aktuelle URL: <strong>{vercelProjectUrl}</strong>
        </div>
      </div>

      {/* Vercel Projekt URL */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem',
          color: '#8fa0c9',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          Vercel Projekt URL:
        </label>
        <input
          type="text"
          value={vercelProjectUrl}
          onChange={(e) => setVercelProjectUrl(e.target.value)}
          placeholder="k2-galerie.vercel.app"
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

      {/* Subdomains hinzufügen */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem',
          color: '#8fa0c9',
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          Neue Subdomain hinzufügen:
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={newSubdomain}
            onChange={(e) => setNewSubdomain(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSubdomain()}
            placeholder="z.B. shop, admin, api"
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
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Hinzufügen
          </button>
        </div>
        <div style={{ 
          marginTop: '0.5rem', 
          fontSize: '0.85rem', 
          color: '#8fa0c9' 
        }}>
          Beispiel: "shop" → shop.{mainDomain}
        </div>
      </div>

      {/* Subdomains Liste */}
      {parsedSubdomains.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ 
            marginBottom: '1rem',
            fontSize: '1rem',
            color: '#f4f7ff'
          }}>
            Konfigurierte Subdomains:
          </h4>
          {parsedSubdomains.map((subdomain, index) => {
            const dnsRecords = generateDNSInstructions(subdomain.name, true)
            return (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <div>
                    <strong style={{ color: '#f4f7ff', fontSize: '1rem' }}>
                      {subdomain.name}.{mainDomain}
                    </strong>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#8fa0c9',
                      marginTop: '0.25rem'
                    }}>
                      Status: <span style={{ 
                        color: subdomain.status === 'active' ? '#5ffbf1' : '#ffa500' 
                      }}>
                        {subdomain.status === 'active' ? '✅ Aktiv' : '⏳ Ausstehend'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeSubdomain(index)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255, 100, 100, 0.2)',
                      border: '1px solid rgba(255, 100, 100, 0.3)',
                      borderRadius: '6px',
                      color: '#ff6464',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Entfernen
                  </button>
                </div>

                {/* DNS-Einstellungen */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginTop: '0.75rem'
                }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: '#8fa0c9',
                    marginBottom: '0.5rem',
                    fontWeight: '500'
                  }}>
                    DNS-Einstellungen bei deinem Domain-Provider:
                  </div>
                  {dnsRecords.map((record, idx) => (
                    <div key={idx} style={{
                      fontSize: '0.8rem',
                      color: '#b8c5e0',
                      marginBottom: '0.25rem',
                      fontFamily: 'monospace',
                      padding: '0.25rem 0'
                    }}>
                      <strong>{record.type}</strong> | Name: <strong>{record.name}</strong> | Wert: <strong>{record.value}</strong>
                    </div>
                  ))}
                </div>

                {/* Vercel Anleitung */}
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  background: 'rgba(95, 251, 241, 0.1)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#5ffbf1'
                }}>
                  <strong>Bei Vercel:</strong>
                  <ol style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
                    <li>Gehe zu Settings → Domains</li>
                    <li>Füge hinzu: <strong>{subdomain.name}.{mainDomain}</strong></li>
                    <li>Setze DNS-Einträge bei deinem Provider</li>
                    <li>Warte auf Aktivierung (1-24h)</li>
                  </ol>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Hauptdomain DNS-Anleitung */}
      {mainDomain && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(95, 251, 241, 0.1)',
          borderRadius: '12px',
          border: '1px solid rgba(95, 251, 241, 0.2)'
        }}>
          <h4 style={{ 
            marginTop: 0,
            marginBottom: '0.75rem',
            fontSize: '1rem',
            color: '#5ffbf1'
          }}>
            📋 Hauptdomain DNS-Einstellungen ({mainDomain})
          </h4>
          <div style={{ fontSize: '0.85rem', color: '#b8c5e0' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>A-Record:</strong> Name: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>@</code> → Wert: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>76.76.21.21</code>
            </div>
            <div>
              <strong>CNAME:</strong> Name: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>www</code> → Wert: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>cname.vercel-dns.com</code>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: '#8fa0c9'
      }}>
        <strong style={{ color: '#f4f7ff' }}>Quick Links:</strong>
        <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
          <li><a href={`https://vercel.com/dashboard/k2-galerie/settings/domains`} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1' }}>Vercel Domains Settings</a></li>
          <li><a href={`https://github.com/georgkreinecker-dotcom/k2-galerie`} target="_blank" rel="noopener noreferrer" style={{ color: '#5ffbf1' }}>GitHub Repository</a></li>
        </ul>
      </div>
    </div>
  )
}

export default DomainManager
