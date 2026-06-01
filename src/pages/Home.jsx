import { useMemo } from 'react'
import { Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Card } from '../components/common'
import QuickAccessCard from '../components/QuickAccessCard'
import { useAuth } from '../context/AuthContext'
import { accessLinks } from '../data/accessLinks'

function getDisplayName(user) {
  return String(user?.nombre || user?.displayName || user?.name || user?.email || 'Usuario').trim()
}

function getDisplayPhoto(user) {
  return String(user?.photoURL || '').trim()
}

function getNameInitials(name) {
  const normalized = String(name || '').trim()
  if (!normalized) return 'US'
  const parts = normalized.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
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

function getRoleContextMessage(normalizedRole) {
  if (normalizedRole === 'soporte') {
    return 'Desde aqui puedes administrar accesos, consultar herramientas internas y apoyar a los equipos comerciales.'
  }
  if (normalizedRole === 'vendedor') {
    return 'Todo listo para consultar inventario, promociones y herramientas comerciales.'
  }
  if (normalizedRole === 'coordinador') {
    return 'Administra tu operacion y manten a tu equipo conectado.'
  }
  return 'Accede rapidamente a las herramientas disponibles para tu operacion.'
}

function Home() {
  const { user } = useAuth()
  const userRole = String(user?.rol || user?.role || '').trim().toLowerCase()
  const isSupportUser = userRole === 'soporte'
  const displayName = getDisplayName(user)
  const displayRole = getDisplayRole(user, userRole)
  const displayBranch = getDisplayBranch(user)
  const displayPhoto = getDisplayPhoto(user)
  const nameInitials = getNameInitials(displayName)
  const contextualMessage = getRoleContextMessage(userRole)

  const visibleAccessLinks = useMemo(
    () =>
      accessLinks.filter((access) => {
        if (!access.supportOnly) return true
        return isSupportUser
      }),
    [isSupportUser]
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-lab-bg to-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="space-y-4 text-center">
          <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-lab-border bg-white px-4 py-2 shadow-sm">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-lab-primary/10 text-lab-primary">
              <Building2 className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold tracking-wide text-lab-text">LAB</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-lab-text sm:text-4xl">LAB</h1>
            <p className="mx-auto max-w-2xl text-sm text-lab-muted sm:text-base">
              Plataforma de trabajo Zapata
            </p>
          </div>
        </header>

        <section className="mx-auto w-full max-w-5xl">
          <Card className="space-y-4 border-lab-border bg-white/90 p-6">
            <div className="flex items-center gap-3">
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={`Foto de ${displayName}`}
                  className="size-12 rounded-full border border-lab-border object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="inline-flex size-12 items-center justify-center rounded-full border border-lab-border bg-lab-primary/10 text-sm font-semibold text-lab-primary">
                  {nameInitials}
                </span>
              )}

              <p className="text-xl font-semibold text-lab-text sm:text-2xl">Hola, {displayName}</p>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-lab-text sm:text-xl">Bienvenido a tu Oficina Virtual</h2>
              <p className="text-sm text-lab-muted">{contextualMessage}</p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="info">Rol: {displayRole}</Badge>
              <Badge>Sucursal: {displayBranch}</Badge>
            </div>

            <div>
              <Link
                to="/perfil"
                className="inline-flex items-center rounded-lg border border-lab-border bg-white px-3 py-2 text-sm font-medium text-lab-text hover:bg-slate-50"
              >
                Mi perfil
              </Link>
            </div>
          </Card>
        </section>

        <section className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {visibleAccessLinks.map((access, index) => (
            <QuickAccessCard
              key={access.id}
              title={access.title}
              description={access.description}
              icon={access.icon}
              logoUrl={access.logoUrl}
              logoAlt={access.logoAlt}
              logoClassName={access.logoClassName}
              brandColor={access.brandColor}
              url={access.url}
              to={access.to}
              index={index}
              disabled={access.disabled}
            />
          ))}
        </section>
      </div>
    </main>
  )
}

export default Home
