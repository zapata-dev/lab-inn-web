import { useMemo } from 'react'
import { Building2 } from 'lucide-react'
import QuickAccessCard from '../components/QuickAccessCard'
import { useAuth } from '../context/AuthContext'
import { accessLinks } from '../data/accessLinks'

function Home() {
  const { user } = useAuth()
  const userRole = String(user?.rol || user?.role || '').trim().toLowerCase()
  const isSupportUser = userRole === 'soporte'

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
            <h1 className="text-3xl font-bold text-lab-text sm:text-4xl">Mi Oficina Virtual</h1>
            <p className="mx-auto max-w-2xl text-sm text-lab-muted sm:text-base">
              Centro de accesos y herramientas comerciales
            </p>
          </div>
        </header>

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
