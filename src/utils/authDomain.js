const DEFAULT_ALLOWED_DOMAIN = 'zapata.com.mx'

export function getAllowedDomain() {
  const rawDomain = String(import.meta.env.VITE_FIREBASE_ALLOWED_DOMAIN ?? DEFAULT_ALLOWED_DOMAIN).trim()
  const sanitized = rawDomain.replace(/^@+/, '').toLowerCase()

  return sanitized || DEFAULT_ALLOWED_DOMAIN
}

export function isAllowedEmailDomain(email) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()
  if (!normalizedEmail) return false

  const parts = normalizedEmail.split('@')
  if (parts.length !== 2) return false

  const [, domain] = parts
  return domain === getAllowedDomain()
}
