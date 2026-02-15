import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'
import '../App.css'

type Filter = 'alle' | 'malerei' | 'keramik'

const GaleriePage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [artworks, setArtworks] = useState<any[]>([])

  // Werke aus localStorage laden
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('k2-artworks')
      if (storedData) {
        const stored = JSON.parse(storedData)
        if (Array.isArray(stored)) {
          const exhibitionArtworks = stored.filter((a: any) => a && a.inExhibition === true)
          setArtworks(exhibitionArtworks)
        }
      }
    } catch (error) {
      console.error('Fehler:', error)
      setArtworks([])
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f7f5f1', color: '#1f1f1f', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, color: '#8b6914' }}>K2 Galerie</h1>
            <p style={{ margin: '0.5rem 0 0', color: '#666' }}>Kunst & Keramik</p>
          </div>
          <nav style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{ padding: '0.5rem 1rem', background: '#8b6914', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              ← Zurück
            </button>
            <Link 
              to={PROJECT_ROUTES['k2-galerie'].home} 
              style={{ padding: '0.5rem 1rem', background: '#8b6914', color: '#fff', textDecoration: 'none', borderRadius: '6px' }}
            >
              ← Projekt
            </Link>
            <Link 
              to={PROJECT_ROUTES['k2-galerie'].controlStudio} 
              style={{ padding: '0.5rem 1rem', background: '#2d6a2d', color: '#fff', textDecoration: 'none', borderRadius: '6px' }}
            >
              Control
            </Link>
            <Link 
              to="/admin" 
              style={{ padding: '0.5rem 1rem', background: '#8b6914', color: '#fff', textDecoration: 'none', borderRadius: '6px' }}
            >
              ⚙️ Admin
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section style={{ marginBottom: '3rem' }}>
          <h2>Willkommen bei K2 – Kunst & Keramik</h2>
          <p>Ein Neuanfang mit Leidenschaft</p>
        </section>

        <section>
          <h3>Galerie-Vorschau</h3>
          {artworks.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
              <p>Noch keine Werke in der Galerie</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Füge im Admin-Bereich neue Werke hinzu und markiere sie als "Teil der Ausstellung".
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {artworks.map((artwork) => (
                <div key={artwork.number} style={{ background: '#fff', borderRadius: '12px', padding: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  {artwork.imageUrl && (
                    <img 
                      src={artwork.imageUrl} 
                      alt={artwork.title || artwork.number}
                      style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }}
                    />
                  )}
                  <h4 style={{ margin: '0.5rem 0', fontSize: '1rem' }}>{artwork.title || artwork.number}</h4>
                  <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#666' }}>
                    {artwork.category === 'malerei' ? 'Bilder' : artwork.category === 'keramik' ? 'Keramik' : artwork.category}
                    {artwork.artist && ` • ${artwork.artist}`}
                  </p>
                  {artwork.price && (
                    <p style={{ margin: '0.5rem 0 0', fontWeight: 'bold', color: '#8b6914' }}>
                      € {artwork.price.toFixed(2)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default GaleriePage
