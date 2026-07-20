import {
  ArrowRight,
  ArrowLeft,
  Heart,
  ImagePlus,
  LayoutGrid,
  Mail,
  MessageCircle,
  Network,
  PlayCircle,
  ShieldCheck,
  Star,
  Tags,
  Truck,
  Users,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EmptyState from '../components/common/EmptyState'
import { useAuth } from '../context/AuthContext'
import { accessLinks } from '../data/accessLinks'
import useFavorites from '../hooks/useFavorites'

const brandToneByKey = {
  amber: {
    box: 'bg-amber-50 text-amber-600',
    cta: 'text-amber-600',
  },
  blue: {
    box: 'bg-blue-50 text-blue-600',
    cta: 'text-blue-600',
  },
  cyan: {
    box: 'bg-emerald-50 text-emerald-600',
    cta: 'text-emerald-600',
  },
  emerald: {
    box: 'bg-emerald-50 text-emerald-600',
    cta: 'text-emerald-600',
  },
  green: {
    box: 'bg-green-50 text-green-600',
    cta: 'text-green-600',
  },
  indigo: {
    box: 'bg-orange-50 text-orange-600',
    cta: 'text-orange-600',
  },
  rose: {
    box: 'bg-rose-50 text-rose-600',
    cta: 'text-rose-600',
  },
  sky: {
    box: 'bg-sky-50 text-sky-600',
    cta: 'text-sky-600',
  },
  slate: {
    box: 'bg-blue-50 text-blue-600',
    cta: 'text-blue-600',
  },
}

function getLinkIcon(link) {
  if (link.logoUrl) return null
  if (link.icon === 'Truck') return Truck
  if (link.icon === 'Tags') return Tags
  if (link.icon === 'ImagePlus') return ImagePlus
  if (link.icon === 'Database') return ShieldCheck
  if (link.icon === 'ShieldCheck') return ShieldCheck
  if (link.icon === 'Network') return Network
  if (link.icon === 'PlayCircle') return PlayCircle
  if (link.icon === 'MessageCircle') return MessageCircle
  if (link.icon === 'Mail') return Mail
  if (link.icon === 'Users') return Users
  return LayoutGrid
}

function getVisibleAccessLinks(userRole) {
  const isSupportUser = userRole === 'soporte'

  return accessLinks.filter((link) => {
    if (link.hiddenFromHome) return false
    if (link.supportOnly && !isSupportUser) return false
    return true
  })
}

function FavoriteAccessCard({ link, isFavorite, onToggleFavorite }) {
  const Icon = getLinkIcon(link) || LayoutGrid
  const tone = brandToneByKey[link.brandColor] || brandToneByKey.blue

  const cardContent = (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onToggleFavorite(link.id)
        }}
        className={`absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 ${
          isFavorite
            ? 'border-amber-300 bg-amber-100 text-amber-500'
            : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
        }`}
        aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Star className={`size-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
      </button>

      <div className="flex items-start gap-4">
        <div className={`flex size-16 shrink-0 items-center justify-center rounded-[1.2rem] ${tone.box}`}>
          {link.logoUrl ? (
            <img
              src={link.logoUrl}
              alt={link.logoAlt || link.title}
              className="size-8 object-contain"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <Icon className="size-7" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1 pr-10">
          <h3 className="truncate text-xl font-semibold text-slate-950">{link.title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{link.description}</p>
        </div>
      </div>

      <div className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${tone.cta}`}>
        <span>{link.cta || 'Abrir'}</span>
        <ArrowRight className="size-4" aria-hidden="true" />
      </div>
    </>
  )

  if (link.to) {
    return (
      <Link
        to={link.to}
        className="group relative block rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02),0_12px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-primary/20"
      >
        {cardContent}
      </Link>
    )
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="group relative block rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02),0_12px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-primary/20"
    >
      {cardContent}
    </a>
  )
}

function Favoritos() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userRole = String(user?.rol || user?.role || '').trim().toLowerCase()
  const { favoriteIds, toggleFavorite } = useFavorites(user)

  const visibleAccessLinks = useMemo(() => getVisibleAccessLinks(userRole), [userRole])
  const favoriteLinks = useMemo(
    () => visibleAccessLinks.filter((link) => favoriteIds.includes(link.id)),
    [favoriteIds, visibleAccessLinks]
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-lab-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-[0_22px_60px_rgba(8,15,34,0.18)]">
          <div className="bg-gradient-to-r from-lab-primary via-blue-600 to-cyan-500 px-6 py-8 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
                  <Heart className="size-4" aria-hidden="true" />
                  Favoritos
                </div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Tus herramientas y accesos guardados.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/80">
                  Aquí aparecen los accesos que marcaste con estrella desde Mi Oficina.
                </p>
              </div>

              <Link
                to="/inicio"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Volver a Mi Oficina
              </Link>
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/10 bg-white/5 px-6 py-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-sm text-white/70">Guardados</p>
              <p className="mt-1 text-2xl font-semibold">{favoriteLinks.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-sm text-white/70">Origen</p>
              <p className="mt-1 text-2xl font-semibold">Mi Oficina</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-sm text-white/70">Persistencia</p>
              <p className="mt-1 text-2xl font-semibold">localStorage</p>
            </div>
          </div>
        </section>

        {favoriteLinks.length === 0 ? (
          <EmptyState
            title="Aún no tienes favoritos guardados."
            description="Marca herramientas y accesos desde Mi Oficina para verlos aquí en un solo lugar."
            actionLabel="Volver a Mi Oficina"
            onAction={() => navigate('/inicio')}
          />
        ) : (
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {favoriteLinks.map((link) => (
              <FavoriteAccessCard
                key={link.id}
                link={link}
                isFavorite
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}

export default Favoritos
