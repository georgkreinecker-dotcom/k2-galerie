import { Link } from 'react-router-dom'
import '../App.css'
import { getPageTexts, defaultPageTexts } from '../config/pageTexts'

const CARD_ROUTES = ['/galerie', '/control-studio', '/mission-control', '/mobile-connect'] as const

const StartPage = () => {
  let texts = defaultPageTexts.start
  try {
    const config = getPageTexts()
    if (config?.start && Array.isArray(config.start.cards)) texts = config.start
  } catch (_) {}
  const cards = (texts.cards || []).slice(0, 4).map((card, i) => ({
    ...card,
    to: CARD_ROUTES[i] ?? '/',
  }))
  return (
    <div className="mission-wrapper">
      <div className="viewport">
        <header>
          <div>
            <h1>{texts.headerTitle}</h1>
            <div className="meta">{texts.headerSubtitle}</div>
          </div>
          <div className="meta">{texts.headerHint}</div>
        </header>

        <div className="grid">
          {cards.map((card) => (
            <div className="card" key={card.title}>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <Link className="btn" to={card.to}>
                {card.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="quick">
          {(texts.quickLinks || []).map((link) => (
            <Link className="chip" to={link.anchor} key={link.label}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StartPage
