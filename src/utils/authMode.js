const AUTH_CONFIG_ERROR_CODE = 'AUTH-CONFIG'
const AUTH_CONFIG_ERROR_MESSAGE = 'La configuracion de acceso no esta disponible. Contacta a soporte LAB.'

function normalizeValue(value) {
  return String(value ?? '').trim().toLowerCase()
}

function createAuthConfigError() {
  const error = new Error(AUTH_CONFIG_ERROR_MESSAGE)
  error.code = AUTH_CONFIG_ERROR_CODE
  return error
}

function getAuthRuntimeConfig(env = import.meta.env, options = {}) {
  const rawAuthMode = normalizeValue(env?.VITE_AUTH_MODE)
  const rawDemoMode = normalizeValue(env?.VITE_DEMO_MODE)
  const isProd = options.isProd ?? Boolean(env?.PROD)
  const firebaseConfigured = options.firebaseConfigured ?? false

  const resolvedAuthMode = rawAuthMode || 'demo'
  const isDemoModeFlagEnabled = rawDemoMode === 'true'
  const isExplicitFirebaseMode = resolvedAuthMode === 'firebase'
  const isExplicitDemoMode = resolvedAuthMode === 'demo'
  const isInvalidAuthMode = Boolean(rawAuthMode) && !isExplicitFirebaseMode && !isExplicitDemoMode

  const blockReasons = []

  if (isProd && !rawAuthMode) blockReasons.push('missing-auth-mode')
  if (isProd && isExplicitDemoMode) blockReasons.push('demo-mode-in-production')
  if (isProd && isDemoModeFlagEnabled) blockReasons.push('demo-flag-in-production')
  if (isProd && isExplicitFirebaseMode && !firebaseConfigured) {
    blockReasons.push('firebase-config-missing')
  }
  if (isProd && isInvalidAuthMode) blockReasons.push('invalid-auth-mode')

  const isBlocked = blockReasons.length > 0
  const effectiveMode = isBlocked ? 'blocked' : isExplicitFirebaseMode ? 'firebase' : 'demo'

  return {
    authMode: rawAuthMode || '',
    demoModeEnabled: isDemoModeFlagEnabled,
    effectiveMode,
    isBlocked,
    isDemoMode: effectiveMode === 'demo',
    isFirebaseMode: effectiveMode === 'firebase',
    isProd,
    blockReason: blockReasons[0] || null,
    blockReasons,
  }
}

export {
  AUTH_CONFIG_ERROR_CODE,
  AUTH_CONFIG_ERROR_MESSAGE,
  createAuthConfigError,
  getAuthRuntimeConfig,
}
