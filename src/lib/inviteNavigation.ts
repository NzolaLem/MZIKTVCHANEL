export const inviteSectionId = 'invite-access'

export function scrollToInviteSection(behavior: ScrollBehavior = 'smooth') {
  document.getElementById(inviteSectionId)?.scrollIntoView({
    behavior,
    block: 'start',
  })
}
