import { usePersistentString } from '../hooks/usePersistentState'
import { LIZENZPREISE } from '../config/licencePricing'

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

  const pricingPlans: PricingPlan[] = [
    {
      id: 'basic',
      name: LIZENZPREISE.basic.name,
      price: String(LIZENZPREISE.basic.priceEur),
      period: 'monatlich',
      features: [
        'Bis 30 Werke',
        '1 Galerie-Website',
        'Eventplanung, Kasse, Etiketten',
        'Standard-URL'
      ]
    },
    {
      id: 'pro',
      name: LIZENZPREISE.pro.name,
      price: String(LIZENZPREISE.pro.priceEur),
      period: 'monatlich',
      features: [
        'Unbegrenzte Werke',
        'Custom Domain',
        'Eventplanung + Öffentlichkeitsarbeit',
        'Prioritäts-Support'
      ]
    },
    {
      id: 'proplus',
      name: LIZENZPREISE.proplus.name,
      price: String(LIZENZPREISE.proplus.priceEur),
      period: 'monatlich',
      popular: true,
      features: [
        'Alles aus Pro',
        'Gesamter Marketingbereich',
        'Flyer, Presse, Social Media'
      ]
    },
    {
      id: 'vk2',
      name: LIZENZPREISE.vk2.name,
      price: '0',
      period: 'monatlich',
      priceLabel: LIZENZPREISE.vk2.priceLabel ?? undefined,
      features: [
        'Vereinsplattform (VK2) – alle Künstler:innen des Vereins',
        'Verein nutzt Pro; ab 10 registrierten Mitgliedern kostenfrei',
        'Lizenzmitglied: 50 % Lizenzgebühr',
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

      {/* Festgelegte Preise (eine Quelle: src/config/licencePricing.ts) */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: '#8fa0c9'
      }}>
        <span style={{ display: 'block', marginBottom: '0.25rem', color: '#ffffff', fontWeight: 600 }}>Festgelegte Preise</span>
        <span>Basic {LIZENZPREISE.basic.price}, Pro {LIZENZPREISE.pro.price}, Pro+ {LIZENZPREISE.proplus.price}. VK2: {LIZENZPREISE.vk2.priceLabel}. Quelle: licencePricing.ts. Siehe mök2 → Lizenzstruktur VK2.</span>
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
