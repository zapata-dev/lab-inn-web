function getEmailDomain(email) {
  if (typeof email !== 'string') return ''

  const normalizedEmail = email.trim().toLowerCase()
  const separatorIndex = normalizedEmail.lastIndexOf('@')

  if (separatorIndex <= 0 || separatorIndex === normalizedEmail.length - 1) {
    return ''
  }

  return normalizedEmail.slice(separatorIndex + 1)
}

function isAllowedEmailDomain(email, allowedDomain) {
  const domain = getEmailDomain(email)
  const normalizedAllowedDomain = String(allowedDomain ?? '')
    .trim()
    .toLowerCase()

  if (!domain || !normalizedAllowedDomain) return false
  return domain === normalizedAllowedDomain
}

export { getEmailDomain, isAllowedEmailDomain }