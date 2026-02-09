import ChatDialog from '../components/ChatDialog'
import { PlatformNavButton } from '../components/Navigation'

export default function DialogStandalonePage() {
  return (
    <div className="dialog-standalone">
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10000 }}>
        <PlatformNavButton />
      </div>
      <ChatDialog standalone />
    </div>
  )
}
