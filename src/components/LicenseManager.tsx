import { useState } from 'react'
import { usePersistentString } from '../hooks/usePersistentState'

interface PricingPlan {
  id: string
  name: string
  price: string
  period: 'monatlich' | 'jährlich' | 'einmalig'
  features: string[]
  popular?: boolean
  /** Wenn gesetzt: wird statt €price/period angezeigt (z. B. VK2-Konditionen) */
  priceLabel?: string
}

const LicenseManager = () => {
  const [pricingModel, setPricingModel] = usePersistentString('k2-license-model', 'saas')
  const [basicPrice, setBasicPrice] = usePersistentString('k2-license-basic-price', '49')
  const [proPrice, setProPrice] = usePersistentString('k2-license-pro-price', '99')

  const pricingPlans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: basicPrice,
      period: 'monatlich',
      features: [
        'Bis zu 50 Werke',
        '1 Galerie-Website',
        'Eventplanung',
        'E-Mail-Support',
        'Standard-Templates'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: proPrice,
      period: 'monatlich',
      popular: true,
      features: [
        'Unbegrenzte Werke',
        'Mehrere Galerien',
        'Eventplanung + Öffentlichkeitsarbeit',
        'Social Media Integration',
        'Prioritäts-Support',
        'Custom Domain',
        'Analytics & Statistiken'
      ]
    },
    {
      id: 'vk2',
      name: 'Kunstvereine',
      price: '0',
      period: 'monatlich',
      priceLabel: 'Verein nutzt Pro; ab 10 registrierten Mitgliedern kostenfrei',
      features: [
        'Vereinsplattform (VK2) – alle Künstler:innen des Vereins',
        'Verein erwirbt Pro-Version; ab 10 registrierten Mitgliedern kostenfrei',
        'Lizenzmitglied: 50 % Lizenzgebühr, Update möglich',
        'Nicht registrierte Mitglieder können aufgenommen werden (im System erfasst, Datenschutz)',
        'Gleiche App, eigener Kontext (Verein vs. Einzelkünstler)'
      ]
    }
  ]

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
        💼 Lizenzierung & Pricing
      </h3>

      {/* Pricing-Modell */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem',
          color: '#8fa0c9',
          fontSize: '0.9rem'
        }}>
          Lizenz-Modell:
        </label>
        <select
          value={pricingModel}
          onChange={(e) => setPricingModel(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#f4f7ff',
            fontSize: '0.95rem'
          }}
        >
          <option value="saas">SaaS (Monatliches Abo)</option>
          <option value="yearly">Jährliches Abo</option>
          <option value="one-time">Einmalzahlung</option>
          <option value="freemium">Freemium + Premium</option>
        </select>
      </div>

      {/* Pricing-Pläne */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem'
      }}>
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: plan.popular 
                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)'
                : 'rgba(255, 255, 255, 0.03)',
              border: plan.popular 
                ? '2px solid rgba(102, 126, 234, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.5rem',
              position: 'relative'
            }}
          >
            {plan.popular && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                BELIEBT
              </div>
            )}
            <h4 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#ffffff',
              margin: '0 0 0.5rem 0'
            }}>
              {plan.name}
            </h4>
            <div style={{
              fontSize: plan.priceLabel ? '1rem' : '2rem',
              fontWeight: '700',
              color: '#5ffbf1',
              marginBottom: '1rem'
            }}>
              {plan.priceLabel ?? (
                <>
                  €{plan.price}
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#8fa0c9',
                    fontWeight: '400'
                  }}>
                    /{plan.period === 'monatlich' ? 'Monat' : plan.period === 'jährlich' ? 'Jahr' : 'einmalig'}
                  </span>
                </>
              )}
            </div>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {plan.features.map((feature, idx) => (
                <li key={idx} style={{
                  padding: '0.5rem 0',
                  fontSize: '0.9rem',
                  color: '#b8c5e0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <span style={{ color: '#5ffbf1' }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Preis-Anpassung */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px'
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#ffffff',
          margin: '0 0 1rem 0'
        }}>
          Preise anpassen:
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              color: '#8fa0c9',
              marginBottom: '0.25rem'
            }}>
              Basic (€)
            </label>
            <input
              type="number"
              value={basicPrice}
              onChange={(e) => setBasicPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.85rem',
              color: '#8fa0c9',
              marginBottom: '0.25rem'
            }}>
              Pro (€)
            </label>
            <input
              type="number"
              value={proPrice}
              onChange={(e) => setProPrice(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ fontSize: '0.85rem', color: '#8fa0c9' }}>
            <span style={{ display: 'block', marginBottom: '0.25rem' }}>Kunstvereine (VK2)</span>
            <span style={{ color: 'var(--k2-accent)' }}>Verein nutzt Pro; ab 10 registrierten Mitgliedern kostenfrei. Nicht registrierte Mitglieder können aufgenommen werden (im System erfasst, Datenschutz). Siehe mök2 → Lizenzstruktur VK2.</span>
          </div>
        </div>
      </div>

      {/* Feature-Vergleich */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'rgba(95, 251, 241, 0.1)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: '#5ffbf1'
      }}>
        <strong>💡 Nächste Schritte:</strong>
        <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0, lineHeight: '1.8' }}>
          <li>Feature-Vergleichstabelle erstellen</li>
          <li>Landingpage für Lizenzierung erstellen</li>
          <li>Beta-Tester-Programm starten</li>
          <li>Partner-Programm aktivieren</li>
        </ul>
      </div>
    </div>
  )
}

export default LicenseManager
