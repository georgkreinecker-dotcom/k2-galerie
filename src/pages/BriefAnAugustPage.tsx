import { Link } from 'react-router-dom'
import { PROJECT_ROUTES } from '../config/navigation'

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #1a1b2e 0%, #16213e 100%)',
  color: '#e9d5ff',
  padding: '2rem 1.5rem 3rem',
  fontFamily: 'Georgia, serif',
}

const containerStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  lineHeight: 1.7,
  fontSize: '1.05rem',
}

const backLinkStyle: React.CSSProperties = {
  color: 'rgba(233,213,255,0.7)',
  fontSize: '0.9rem',
  textDecoration: 'none',
  display: 'inline-block',
  marginBottom: '1.5rem',
}

const titleStyle: React.CSSProperties = {
  margin: '0 0 0.25rem',
  fontSize: '1.75rem',
  fontWeight: 700,
  color: '#fff',
}

const contextStyle: React.CSSProperties = {
  margin: '0 0 2rem',
  fontSize: '0.9rem',
  fontStyle: 'italic',
  color: 'rgba(233,213,255,0.7)',
}

const paragraphStyle: React.CSSProperties = {
  margin: '0 0 1.25rem',
  textAlign: 'justify',
  color: 'rgba(233,213,255,0.95)',
}

const bulletBlockStyle: React.CSSProperties = {
  margin: '0 0 1.25rem',
  paddingLeft: '1rem',
  borderLeft: '3px solid rgba(196,181,253,0.4)',
  color: 'rgba(233,213,255,0.95)',
}

const bulletTitleStyle: React.CSSProperties = {
  fontWeight: 700,
  color: '#c4b5fd',
  marginBottom: '0.25rem',
}

const highlightStyle: React.CSSProperties = {
  fontWeight: 600,
  color: '#e9d5ff',
}

const signatureStyle: React.CSSProperties = {
  marginTop: '2rem',
  marginBottom: '2rem',
  fontStyle: 'italic',
  color: 'rgba(233,213,255,0.9)',
}

const psStyle: React.CSSProperties = {
  marginTop: '2rem',
  paddingTop: '1.5rem',
  borderTop: '1px solid rgba(196,181,253,0.2)',
  fontSize: '0.95rem',
  fontStyle: 'italic',
  color: 'rgba(233,213,255,0.75)',
}

export default function BriefAnAugustPage() {
  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <Link to={PROJECT_ROUTES['k2-galerie'].notizen} style={backLinkStyle}>
          ← Zurück zu Georgs Notizen
        </Link>

        <h1 style={titleStyle}>Brief an August</h1>
        <p style={contextStyle}>
          Nach einem tiefen Gespräch; Georg bringt Bilder und Erkenntnisse zu Papier und teilt sie mit August.
        </p>

        <p style={paragraphStyle}>Hallo August,</p>

        <p style={paragraphStyle}>
          du hast uns gestern einen tiefen Einblick in deine Seele gewährt – dafür bin ich dir sehr dankbar.
          Es hat mich in der Nacht dann tief beschäftigt, dass du zu mir gesagt hast, du möchtest von mir wissen,
          wie ich dich sehe. Es sind dann Bilder und Texte in mir aufgetaucht, die ich dir mitgeben möchte.
        </p>

        <div style={bulletBlockStyle}>
          <div style={bulletTitleStyle}>Dein Erscheinen</div>
          mit dem Porsche in der Tiefgarage und dein opulenter Körper waren eine Überraschung – zwei Bilder,
          die mich so tief irritiert haben. Es war nicht das Bild, das ich von dir aus der Vergangenheit gewohnt war,
          und zeigt eine tiefe Veränderung in dir. Die du dann auch bestätigt hast.
        </div>

        <div style={bulletBlockStyle}>
          <div style={bulletTitleStyle}>Das Bild der Muße</div>
          das du als die Grundlage der Existenz des Lebens gesehen hast, ließ für mich im Zusammenhang mit deiner
          Erscheinung das Bild des Müßiggangs aufkommen – und der ist laut einem uralten Sprichwort der Ursprung
          aller Laster, ihr Anfang. Eines dieser Laster ist die Völlerei; es gibt deren ja viele, und wir alle
          werden von der einen oder anderen geplagt.
        </div>

        <div style={bulletBlockStyle}>
          <div style={bulletTitleStyle}>Dann hast du sehr viel über deine direkte Beziehung zu Gott gesprochen</div>
          – und da ist in mir eine tiefe Unruhe entstanden, ob ich dir das sagen darf oder nicht. Aber ich denke,
          du bist einer der wenigen Menschen, die verstehen, was ich jetzt sage.
        </div>

        <p style={paragraphStyle}>
          Die Beziehung zu Gott ist etwas so Mystisches, Geheimnisvolles und Einzigartig-Individuelles –
          wie die tiefe Liebe von Mann und Frau es auch sein kann. Diese Zweisamkeit wird zerstört, wenn du sie
          nach außen in einem Schaufenster präsentierst und damit Menschen in Unsicherheit ein Gefühl von
          Erleuchtet-sein gibst. Der wirklich Erleuchtete spricht nicht über Gott – er erscheint durch ihn in
          seinen Werken. Die, die Gott immer vor sich hertragen, sind Scharlatane und Verführer, die andere
          Menschen von sich abhängig machen wollen, um Macht oder Geld zu erlangen.
        </p>

        <p style={paragraphStyle}>
          Es gibt nur eine Heilungsmöglichkeit, die der Mensch selber machen kann:{' '}
          <span style={highlightStyle}>die Stille und die Askese</span>. Sonst wird die Liebe ihn umarmen und
          den Mantel des Schmerzes über ihn legen.
        </p>

        <p style={signatureStyle}>
          Alles, alles Liebe<br />
          Georg
        </p>

        <p style={psStyle}>
          <em>PS: Ich denke, wir sollten den angedachten Vortrag noch ein wenig für später aufheben.</em>
        </p>
      </div>
    </div>
  )
}
