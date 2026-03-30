export function buildPilotInviteEmailPlainText(params: {
  name: string
  greetingName?: string
  inviteUrl: string
  contextLabel: string
  inviteContext?: 'oeffentlich' | 'vk2'
}): string
