/**
 * Vorschau = exakt derselbe HTML-String wie Resend und .eml (buildPilotInviteEmailHtml).
 * Kein zweites React-Layout mehr – was du siehst, ist was rausgeht.
 */
import type { ReactElement } from 'react'
import { buildPilotInviteEmailHtml } from '../../api/pilotInviteEmailHtml.js'

export type PilotInviteEmailPreviewProps = {
  inviteUrl: string
  /** Vorname für „Hallo …“ */
  greetingName: string
  inviteContext: 'oeffentlich' | 'vk2'
}

export function PilotInviteEmailPreview({ inviteUrl, greetingName, inviteContext }: PilotInviteEmailPreviewProps): ReactElement {
  const vk2 = inviteContext === 'vk2'
  const contextLabel = vk2 ? 'VK2 Vereins-Demo' : 'öffentliche Demo (ök2)'
  const html = buildPilotInviteEmailHtml({
    name: '',
    greetingName,
    inviteUrl,
    contextLabel,
    inviteContext,
  })

  return (
    <div
      className="pilot-invite-email-preview-root"
      style={{
        maxWidth: 600,
        margin: '0 auto',
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
