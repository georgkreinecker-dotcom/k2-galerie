export function escapeHtml(s: string): string
export function buildPilotInviteEmailHtml(params: {
  name: string
  greetingName?: string
  inviteUrl: string
  contextLabel: string
  inviteContext?: 'oeffentlich' | 'vk2'
}): string
