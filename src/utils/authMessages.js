const AUTH_PUBLIC_ERROR_CODES = Object.freeze({
  CONFIG: 'AUTH-CONFIG',
  ACCESS: 'AUTH-ACCESS',
  PENDING: 'AUTH-PENDING',
  DISABLED: 'AUTH-DISABLED',
  DOMAIN: 'AUTH-DOMAIN',
  NETWORK: 'AUTH-NETWORK',
  UNKNOWN: 'AUTH-UNKNOWN',
})

const AUTH_PUBLIC_ERROR_MESSAGES = Object.freeze({
  [AUTH_PUBLIC_ERROR_CODES.CONFIG]:
    'La configuracion de acceso no esta disponible. Contacta a soporte LAB.',
  [AUTH_PUBLIC_ERROR_CODES.ACCESS]:
    'No encontramos un acceso activo para tu cuenta. Solicita autorizacion a soporte LAB.',
  [AUTH_PUBLIC_ERROR_CODES.PENDING]:
    'Tu solicitud de acceso esta pendiente de aprobacion.',
  [AUTH_PUBLIC_ERROR_CODES.DISABLED]:
    'Tu acceso esta desactivado. Contacta a soporte LAB.',
  [AUTH_PUBLIC_ERROR_CODES.DOMAIN]:
    'Usa tu cuenta corporativa autorizada para entrar a LAB.',
  [AUTH_PUBLIC_ERROR_CODES.NETWORK]:
    'No pudimos validar tu acceso por un problema de conexion. Intenta de nuevo.',
  [AUTH_PUBLIC_ERROR_CODES.UNKNOWN]:
    'No pudimos validar tu acceso. Intenta de nuevo o contacta a soporte LAB.',
})

const AUTH_RAW_TO_PUBLIC_CODE = Object.freeze({
  'auth-config': AUTH_PUBLIC_ERROR_CODES.CONFIG,
  'firebase-not-configured': AUTH_PUBLIC_ERROR_CODES.CONFIG,
  'authorization/user-not-found': AUTH_PUBLIC_ERROR_CODES.ACCESS,
  'authorization/role-invalid': AUTH_PUBLIC_ERROR_CODES.ACCESS,
  'authorization/user-inactive': AUTH_PUBLIC_ERROR_CODES.DISABLED,
  'authorization/domain-not-allowed': AUTH_PUBLIC_ERROR_CODES.DOMAIN,
  'authorization/permission-denied': AUTH_PUBLIC_ERROR_CODES.NETWORK,
  'authorization/validation-timeout': AUTH_PUBLIC_ERROR_CODES.NETWORK,
  'authorization/unknown': AUTH_PUBLIC_ERROR_CODES.UNKNOWN,
  'request-already-pending': AUTH_PUBLIC_ERROR_CODES.PENDING,
  'request-resubmit-not-allowed': AUTH_PUBLIC_ERROR_CODES.ACCESS,
})

function normalizeAuthValue(value) {
  return String(value ?? '').trim().toLowerCase()
}

function getPublicAuthCode(input) {
  const rawCode = typeof input === 'string' ? input : input?.code
  const normalizedCode = normalizeAuthValue(rawCode)

  if (!normalizedCode) return AUTH_PUBLIC_ERROR_CODES.UNKNOWN
  const publicCodes = Object.values(AUTH_PUBLIC_ERROR_CODES)
  const upperCode = normalizedCode.toUpperCase()
  if (publicCodes.includes(upperCode)) return upperCode

  return AUTH_RAW_TO_PUBLIC_CODE[normalizedCode] ?? AUTH_PUBLIC_ERROR_CODES.UNKNOWN
}

function getPublicAuthMessage(input) {
  const code = getPublicAuthCode(input)
  return AUTH_PUBLIC_ERROR_MESSAGES[code] ?? AUTH_PUBLIC_ERROR_MESSAGES[AUTH_PUBLIC_ERROR_CODES.UNKNOWN]
}

function createPublicAuthError(input) {
  const error = new Error(getPublicAuthMessage(input))
  error.code = getPublicAuthCode(input)
  return error
}

function logAuthDebug(event, details = {}) {
  const shouldLog = import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH === 'true'
  if (!shouldLog) return

  console.info('[LAB][auth]', event, details)
}

export {
  AUTH_PUBLIC_ERROR_CODES,
  AUTH_PUBLIC_ERROR_MESSAGES,
  createPublicAuthError,
  getPublicAuthCode,
  getPublicAuthMessage,
  logAuthDebug,
}
