import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Card } from '../components/common'
import { useAuth } from '../context/AuthContext'

function toDisplayDate(value) {
  if (!value) return 'No disponible'
  if (value instanceof Date) {
    return value.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  if (typeof value?.toDate === 'function') {
    return toDisplayDate(value.toDate())
  }
  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return toDisplayDate(parsed)
  }
  return 'No disponible'
}

function getDisplayName(user) {
  return String(user?.nombre || user?.displayName || user?.name || user?.email || 'Usuario').trim()
}

function getDisplayEmail(user) {
  return String(user?.email || 'Sin correo').trim()
}

function getDisplayRole(user, normalizedRole) {
  const fromProfile = String(user?.roleLabel || '').trim()
  if (fromProfile) return fromProfile
  if (normalizedRole === 'soporte') return 'Soporte'
  if (normalizedRole === 'coordinador') return 'Coordinador'
  if (normalizedRole === 'vendedor') return 'Vendedor'
  return 'Sin rol'
}

function getDisplayBranch(user) {
  return String(user?.sucursalNombre || user?.sucursal || user?.branchName || 'Sin sucursal asignada').trim()
}

function getDisplayStatus(user) {
  if (typeof user?.activo === 'boolean') return user.activo ? 'Activo' : 'Inactivo'
  return 'No disponible'
}

function getDisplayPhoto(user) {
  return String(user?.photoURL || '').trim()
}

function getInitials(name) {
  const normalized = String(name || '').trim()
  if (!normalized) return 'US'
  const parts = normalized.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

function Perfil() {
  const { user } = useAuth()
  const normalizedRole = String(user?.rol || user?.role || '').trim().toLowerCase()
  const isSupportUser = normalizedRole === 'soporte'
  const displayName = getDisplayName(user)
  const displayEmail = getDisplayEmail(user)
  const displayRole = getDisplayRole(user, normalizedRole)
  const displayBranch = getDisplayBranch(user)
  const displayStatus = getDisplayStatus(user)
  const displayPhoto = getDisplayPhoto(user)
  const initials = getInitials(displayName)
  const createdAtLabel = toDisplayDate(user?.createdAt)
  const updatedAtLabel = toDisplayDate(user?.updatedAt)
  const authModeLabel = String(user?.authMode || 'No disponible').trim()

  const identityRows = useMemo(
    () => [
      { label: 'Nombre', value: displayName },
      { label: 'Correo', value: displayEmail },
    ],
    [displayEmail, displayName]
  )

  const operationRows = useMemo(
    () => [
      { label: 'Rol', value: displayRole },
      { label: 'Sucursal', value: displayBranch },
      { label: 'Estatus', value: displayStatus },
    ],
    [displayBranch, displayRole, displayStatus]
  )

  const accountRows = useMemo(() => {
    const rows = [
      { label: 'Fecha de alta', value: createdAtLabel },
      { label: 'Última actualización', value: updatedAtLabel },
      { label: 'Método de acceso', value: authModeLabel },
    ]
    if (isSupportUser) {
      rows.unshift({ label: 'UID', value: String(user?.uid || 'No disponible').trim() || 'No disponible' })
    }
    return rows
  }, [authModeLabel, createdAtLabel, isSupportUser, updatedAtLabel, user?.uid])

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-lab-text">Mi Perfil</h1>
        <p className="text-sm text-lab-muted">Información de tu cuenta en LAB.</p>
      </header>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-lab-text">Identidad</h2>
        <div className="flex items-center gap-3">
          {displayPhoto ? (
            <img
              src={displayPhoto}
              alt={`Foto de ${displayName}`}
              className="size-14 rounded-full border border-lab-border object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="inline-flex size-14 items-center justify-center rounded-full border border-lab-border bg-lab-primary/10 text-base font-semibold text-lab-primary">
              {initials}
            </span>
          )}
          <Badge variant="info">{displayRole}</Badge>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          {identityRows.map((row) => (
            <div key={row.label} className="rounded-lg border border-lab-border bg-slate-50 px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-lab-muted">{row.label}</dt>
              <dd className="mt-1 text-sm text-lab-text">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-lab-text">Operación</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {operationRows.map((row) => (
            <div key={row.label} className="rounded-lg border border-lab-border bg-slate-50 px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-lab-muted">{row.label}</dt>
              <dd className="mt-1 text-sm text-lab-text">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-lab-text">Cuenta</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {accountRows.map((row) => (
            <div key={row.label} className="rounded-lg border border-lab-border bg-slate-50 px-3 py-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-lab-muted">{row.label}</dt>
              <dd className="mt-1 text-sm text-lab-text">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div>
        <Link
          to="/"
          className="inline-flex items-center rounded-lg border border-lab-border bg-white px-4 py-2 text-sm font-semibold text-lab-text hover:bg-slate-50"
        >
          Volver a Mi Oficina
        </Link>
      </div>

      <p className="text-center text-[10px] text-lab-muted" title={__BUILD_TIME__}>
        build {__BUILD_SHA__.slice(0, 7)}
      </p>
    </main>
  )
}

export default Perfil
