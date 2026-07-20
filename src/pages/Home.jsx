import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bell,
  ChevronRight,
  ExternalLink,
  Headphones,
  Heart,
  Home as HomeIcon,
  ImagePlus,
  LayoutGrid,
  Mail,
  MapPin,
  MessageCircle,
  Network,
  PlayCircle,
  Search,
  Server,
  ShieldCheck,
  Star,
  Tags,
  Truck,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import UserMenu from '../components/layout/UserMenu'
import { useAuth } from '../context/AuthContext'
import { accessLinks } from '../data/accessLinks'
import useFavorites from '../hooks/useFavorites'
import heroTruckImage from '../assets/home/truck-hero.png'
import { fetchInventoryFromCsv, getInventoryCache, saveInventoryCache } from '../services/inventoryService'
import {
  countUniquePromotionCoverImages,
  isPromotionFlagUnit,
} from '../utils/advertisingCatalogUtils'
import useToast from '../hooks/useToast'

const sidebarItems = [
  { id: 'oficina', label: 'Mi Oficina', icon: HomeIcon, section: 'todas', to: '/inicio' },
  { id: 'inventario', label: 'Inventario', icon: Truck, to: '/inventario' },
  { id: 'favoritos', label: 'Favoritos', icon: Heart, to: '/favoritos' },
  { id: 'directorio', label: 'Directorio', icon: Users, to: '/usuarios' },
]

const sectionMeta = {
  inventario: {
    label: 'Accesos rápidos',
    icon: Zap,
    description: 'Unidades, promociones y publicidad listas para usar.',
  },
  plataforma: {
    label: 'Plataformas',
    icon: Server,
    description: 'Herramientas externas oficiales para operar el día a día.',
  },
  comunidad: {
    label: 'Comunidad',
    icon: Users,
    description: 'Contenido, video y mensajería para trabajar mejor en equipo.',
  },
  soporte: {
    label: 'Soporte',
    icon: Headphones,
    description: 'Contacto y administración de usuarios según el rol.',
  },
}

const sectionOrder = ['inventario', 'plataforma', 'comunidad', 'soporte']

const quickAccessIds = ['inventario', 'promociones', 'catalogo-portadas']

const brandToneByKey = {
  slate: {
    box: 'bg-blue-50 text-blue-600',
    cta: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  cyan: {
    box: 'bg-emerald-50 text-emerald-600',
    cta: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },
  red: {
    box: 'bg-violet-50 text-violet-600',
    cta: 'text-violet-600',
    dot: 'bg-violet-500',
  },
  sky: {
    box: 'bg-sky-50 text-sky-600',
    cta: 'text-sky-600',
    dot: 'bg-sky-500',
  },
  emerald: {
    box: 'bg-emerald-50 text-emerald-600',
    cta: 'text-emerald-600',
    dot: 'bg-emerald-500',
  },
  blue: {
    box: 'bg-indigo-50 text-indigo-600',
    cta: 'text-indigo-600',
    dot: 'bg-indigo-500',
  },
  rose: {
    box: 'bg-rose-50 text-rose-600',
    cta: 'text-rose-600',
    dot: 'bg-rose-500',
  },
  green: {
    box: 'bg-green-50 text-green-600',
    cta: 'text-green-600',
    dot: 'bg-green-500',
  },
  amber: {
    box: 'bg-amber-50 text-amber-600',
    cta: 'text-amber-600',
    dot: 'bg-amber-500',
  },
  indigo: {
    box: 'bg-orange-50 text-orange-600',
    cta: 'text-orange-600',
    dot: 'bg-orange-500',
  },
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

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

function formatCompactNumber(value) {
  return new Intl.NumberFormat('es-MX').format(Math.max(0, Number(value) || 0))
}

function buildHomeMetrics(inventoryItems = []) {
  const totalUnits = inventoryItems.length
  const activePromotions = inventoryItems.filter(isPromotionFlagUnit).length
  const availableAds = countUniquePromotionCoverImages(inventoryItems)

  return {
    totalUnits,
    activePromotions,
    availableAds,
  }
}

function getGreetingByHour() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
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

function getSectionForLink(link) {
  if (link.category === 'inventario') return 'inventario'
  if (link.category === 'plataforma') return 'plataforma'
  if (link.category === 'comunidad') return 'comunidad'
  return 'soporte'
}

function getSectionTheme(sectionKey) {
  if (sectionKey === 'inventario') return 'blue'
  if (sectionKey === 'plataforma') return 'indigo'
  if (sectionKey === 'comunidad') return 'green'
  return 'amber'
}

function AccessCard({ link, isFavorite, onToggleFavorite, toneKey = 'blue' }) {
  const Icon = getLinkIcon(link) || LayoutGrid
  const tone = brandToneByKey[link.brandColor] || brandToneByKey[toneKey] || brandToneByKey.blue

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

function PlatformCard({ link }) {
  const sectionTheme = brandToneByKey[link.brandColor] || brandToneByKey.blue
  const Icon = getLinkIcon(link) || LayoutGrid

  const cardContent = (
    <>
      <div className="flex min-w-0 items-center gap-4">
        <div className={`flex size-16 shrink-0 items-center justify-center rounded-[1.2rem] ${sectionTheme.box}`}>
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

        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold text-slate-950">{link.title}</h3>
          <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-slate-500">
            Ir ahora
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </p>
        </div>
      </div>

      <ExternalLink className="size-5 shrink-0 text-slate-400 transition group-hover:text-slate-600" aria-hidden="true" />
    </>
  )

  if (link.to) {
    return (
      <Link
        to={link.to}
        className="group flex items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02),0_12px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-primary/20"
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
      className="group flex items-center justify-between gap-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02),0_12px_24px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-primary/20"
    >
      {cardContent}
    </a>
  )
}

function StackRowCard({ link }) {
  const sectionTheme = brandToneByKey[link.brandColor] || brandToneByKey.blue
  const Icon = getLinkIcon(link) || LayoutGrid

  const rowContent = (
    <>
      <div className="flex min-w-0 items-center gap-4">
        <div className={`flex size-14 shrink-0 items-center justify-center rounded-[1.15rem] ${sectionTheme.box}`}>
          {link.logoUrl ? (
            <img
              src={link.logoUrl}
              alt={link.logoAlt || link.title}
              className="size-7 object-contain"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <Icon className="size-6" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold text-slate-950">{link.title}</h3>
          <p className="mt-1 truncate text-sm text-slate-500">{link.description}</p>
        </div>
      </div>

      <ChevronRight className="size-5 shrink-0 text-slate-400 transition group-hover:text-slate-600" aria-hidden="true" />
    </>
  )

  if (link.to) {
    return (
      <Link
        to={link.to}
        className="group flex items-center justify-between gap-4 p-5 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-primary/20"
      >
        {rowContent}
      </Link>
    )
  }

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between gap-4 p-5 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-primary/20"
    >
      {rowContent}
    </a>
  )
}

function Home() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const userRole = String(user?.rol || user?.role || '').trim().toLowerCase()
  const isSupportUser = userRole === 'soporte'
  const displayName = getDisplayName(user)
  const displayRole = getDisplayRole(user, userRole)
  const displayBranch = getDisplayBranch(user)
  const displayPhoto = getDisplayPhoto(user)
  const nameInitials = getNameInitials(displayName)
  const greeting = getGreetingByHour()

  const [query, setQuery] = useState('')
  const [activeSection, setActiveSection] = useState('todas')
  const [homeMetrics, setHomeMetrics] = useState(() => buildHomeMetrics([]))
  const { favoriteIds, toggleFavorite } = useFavorites(user)

  const visibleAccessLinks = useMemo(
    () =>
      accessLinks.filter((access) => {
        if (access.hiddenFromHome) return false
        if (access.supportOnly && !isSupportUser) return false
        return true
      }),
    [isSupportUser]
  )

  const visibleLinkMap = useMemo(
    () => new Map(visibleAccessLinks.map((link) => [link.id, link])),
    [visibleAccessLinks]
  )

  useEffect(() => {
    let mounted = true
    const cache = getInventoryCache()

    const applyMetrics = (items) => {
      if (!mounted) return
      setHomeMetrics(buildHomeMetrics(Array.isArray(items) ? items : []))
    }

    if (cache.items.length > 0) {
      applyMetrics(cache.items)
    }

    const syncMetrics = async () => {
      try {
        const items = await fetchInventoryFromCsv()
        saveInventoryCache(items)
        applyMetrics(items)
      } catch {
        // Keep the cached metrics or the zero state if the CSV refresh fails.
      }
    }

    syncMetrics()

    return () => {
      mounted = false
    }
  }, [])

  const activeSidebarId = activeSection === 'todas' ? 'oficina' : activeSection

  const handleSidebarAction = (item) => {
    if (item.section) {
      setActiveSection(item.section)
    }

    if (item.to) {
      navigate(item.to)
    }
  }

  const handleNotificationsClick = () => {
    toast.info('No hay notificaciones nuevas por ahora.')
  }

  const filteredLinksBySection = useMemo(() => {
    const normalizedQuery = normalizeText(query)

    const sections = sectionOrder
      .filter((sectionKey) => activeSection === 'todas' || activeSection === 'favoritos' || activeSection === sectionKey)
      .map((sectionKey) => {
        const links = visibleAccessLinks.filter((link) => {
          const matchesSection = getSectionForLink(link) === sectionKey
          const matchesFavorite = activeSection !== 'favoritos' || favoriteIds.includes(link.id)
          if (!matchesSection || !matchesFavorite) return false
          if (!normalizedQuery) return true
          const searchable = `${link.title} ${link.description} ${link.category || ''}`.toLowerCase()
          return searchable.includes(normalizedQuery)
        })

        return {
          key: sectionKey,
          meta: sectionMeta[sectionKey],
          links,
        }
      })
      .filter((section) => section.links.length > 0)

    return sections
  }, [activeSection, favoriteIds, query, visibleAccessLinks])

  const searchResultCount = filteredLinksBySection.reduce((total, section) => total + section.links.length, 0)

  const heroQuickLinks = quickAccessIds
    .map((id) => visibleLinkMap.get(id))
    .filter(Boolean)

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#eef3fb] text-slate-900">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1600px]">
        <aside className="hidden min-h-dvh w-[342px] shrink-0 flex-col bg-gradient-to-b from-[#12336f] via-[#102b5a] to-[#0a1630] text-white shadow-[inset_-1px_0_0_rgba(255,255,255,0.08)] lg:flex">
          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center gap-4 rounded-3xl p-1">
              <div className="flex size-12 items-center justify-center rounded-[1.15rem] bg-gradient-to-br from-[#4f9cfb] to-[#2b6be8] text-xl font-bold text-white shadow-[0_14px_30px_rgba(59,130,246,0.35)]">
                L
              </div>
              <div className="min-w-0">
                <p className="truncate text-[1.35rem] font-semibold leading-none text-white">LAB Comercial</p>
                <p className="mt-2 truncate font-mono text-[0.8rem] uppercase tracking-[0.32em] text-[#7fb2ff]">
                  Oficina Virtual
                </p>
              </div>
            </div>

            <div className="mt-14">
              <p className="text-[0.82rem] font-medium uppercase tracking-[0.38em] text-[#7ea4e5]">
                Navegación
              </p>
              <nav className="mt-5 space-y-3">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  const isActive = item.id === activeSidebarId

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSidebarAction(item)}
                      className={`relative flex w-full items-center gap-4 rounded-[1.2rem] p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                        isActive
                          ? 'bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                          : 'text-white/85 hover:bg-white/10 hover:text-white'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {isActive ? (
                        <span className="absolute left-0 top-1/2 h-10 w-1 -translate-y-1/2 rounded-r-full bg-sky-400" />
                      ) : null}
                      <Icon className={`size-5 shrink-0 ${isActive ? 'text-white' : 'text-white/75'}`} aria-hidden="true" />
                      <span className="text-[1.03rem] font-semibold">{item.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="mt-auto pt-6">
              <UserMenu variant="sidebar" />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-[#f6f8fc]/90 backdrop-blur-xl">
          <div className="flex items-center gap-3 p-4 pr-24 sm:px-6 sm:pr-28 lg:px-8 lg:py-5 lg:pr-32">
              <label className="flex min-h-12 w-full flex-1 items-center gap-3 rounded-[1.1rem] border border-slate-200 bg-white px-4 shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
                <Search className="size-5 shrink-0 text-slate-400" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar herramientas, accesos o recursos..."
                  aria-label="Buscar herramientas, accesos o recursos"
                  className="min-w-0 flex-1 border-0 bg-transparent text-[0.95rem] text-slate-700 outline-none placeholder:text-slate-400"
                />
                <kbd className="hidden rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500 sm:inline-flex">
                  /
                </kbd>
              </label>

              <button
                type="button"
                onClick={handleNotificationsClick}
                className="relative inline-flex size-12 shrink-0 items-center justify-center rounded-[1.1rem] border border-slate-200 bg-white text-slate-700 shadow-[0_10px_25px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-primary/20"
                aria-label="Ver notificaciones"
                title="Ver notificaciones"
              >
                <Bell className="size-5" aria-hidden="true" />
                <span className="absolute right-3 top-3 size-2 rounded-full bg-orange-400" />
              </button>
            </div>
          </header>

          <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            <section className="relative overflow-hidden rounded-[2.15rem] bg-[#111f44] text-white shadow-[0_22px_60px_rgba(8,15,34,0.18)]">
              <img
                src={heroTruckImage}
                alt="Camión de carga de la marca"
                className="absolute inset-0 size-full object-cover object-right opacity-90"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b1430]/95 via-[#0b1430]/85 to-[#0b1430]/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1430]/45 via-transparent to-transparent" />

              <div className="relative z-10 p-4 sm:p-5 lg:p-6">
                <div className="max-w-[57%] space-y-4 xl:max-w-[48%]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/90">
                    <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(74,222,128,0.15)]" />
                    Tu oficina · en vivo
                  </div>

                  <h1 className="text-[1.5rem] font-semibold leading-[1.05] tracking-tight sm:text-[1.95rem] xl:text-[2.5rem]">
                    {greeting}, {displayName}.
                    <br />
                    Esta es tu <span className="text-sky-300">oficina virtual</span>.
                  </h1>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {displayPhoto ? (
                      <img
                        src={displayPhoto}
                        alt={`Foto de ${displayName}`}
                        className="size-8 rounded-full border border-white/20 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-white">
                        {nameInitials}
                      </span>
                    )}

                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/95">
                      <span className="size-2.5 rounded-full bg-orange-400" />
                      Rol: {displayRole}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/95">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      Sucursal: {displayBranch}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-2.5 sm:grid-cols-3 lg:absolute lg:bottom-5 lg:right-5 lg:mt-0 lg:w-[52%] xl:w-[44%]">
                  <div className="rounded-2xl border border-white/15 bg-white/[0.12] p-4 backdrop-blur-sm">
                    <p className="text-[1.32rem] font-semibold leading-none">{formatCompactNumber(homeMetrics.totalUnits)}</p>
                    <p className="mt-1 text-[0.94rem] leading-tight text-sky-200">Unidades disponibles</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/[0.12] p-4 backdrop-blur-sm">
                    <p className="text-[1.32rem] font-semibold leading-none">
                      {formatCompactNumber(homeMetrics.activePromotions)}
                    </p>
                    <p className="mt-1 text-[0.94rem] leading-tight text-sky-200">Promociones vigentes</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/[0.12] p-4 backdrop-blur-sm">
                    <p className="text-[1.32rem] font-semibold leading-none">
                      {formatCompactNumber(homeMetrics.availableAds)}
                    </p>
                    <p className="mt-1 text-[0.94rem] leading-tight text-sky-200">Publicidades disponibles</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="size-5 text-slate-500" aria-hidden="true" />
                <h2 className="font-mono text-[0.8rem] font-semibold uppercase tracking-[0.3em] text-slate-700">
                  Accesos rápidos
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                {heroQuickLinks.map((link) => (
                  <AccessCard
                    key={link.id}
                    link={link}
                    isFavorite={favoriteIds.includes(link.id)}
                    onToggleFavorite={toggleFavorite}
                    toneKey="blue"
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <Server className="size-5 text-slate-500" aria-hidden="true" />
                <h2 className="font-mono text-[0.8rem] font-semibold uppercase tracking-[0.3em] text-slate-700">
                  Plataformas
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                {visibleAccessLinks
                  .filter((link) => link.category === 'plataforma')
                  .map((link) => (
                    <PlatformCard key={link.id} link={link} />
                  ))}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="size-5 text-slate-500" aria-hidden="true" />
                  <h2 className="font-mono text-[0.8rem] font-semibold uppercase tracking-[0.3em] text-slate-700">
                    Comunidad
                  </h2>
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02),0_12px_24px_rgba(15,23,42,0.04)]">
                  {visibleAccessLinks
                    .filter((link) => link.category === 'comunidad')
                    .map((link, index, rows) => (
                      <div key={link.id} className={index < rows.length - 1 ? 'border-b border-slate-200' : ''}>
                        <StackRowCard link={link} />
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Headphones className="size-5 text-slate-500" aria-hidden="true" />
                  <h2 className="font-mono text-[0.8rem] font-semibold uppercase tracking-[0.3em] text-slate-700">
                    Soporte
                  </h2>
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02),0_12px_24px_rgba(15,23,42,0.04)]">
                  {visibleAccessLinks
                    .filter((link) => link.category === 'soporte')
                    .map((link, index, rows) => (
                      <div key={link.id} className={index < rows.length - 1 ? 'border-b border-slate-200' : ''}>
                        <StackRowCard link={link} />
                      </div>
                    ))}
                </div>
              </div>
            </section>

            {query ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[0.8rem] font-semibold uppercase tracking-[0.3em] text-slate-700">
                      Resultados
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {searchResultCount} accesos coinciden con “{query}”.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    <X className="size-4" aria-hidden="true" />
                    Limpiar
                  </button>
                </div>

                <div className="space-y-6">
                  {filteredLinksBySection.map((section) => {
                    const SectionIcon = section.meta?.icon || LayoutGrid
                    return (
                      <div key={section.key} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <SectionIcon className="size-5 text-slate-500" aria-hidden="true" />
                          <h3 className="font-mono text-[0.8rem] font-semibold uppercase tracking-[0.3em] text-slate-700">
                            {section.meta?.label || section.key}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                          {section.links.map((link) => {
                            if (section.key === 'plataforma') {
                              return <PlatformCard key={link.id} link={link} />
                            }

                            if (section.key === 'comunidad' || section.key === 'soporte') {
                              return (
                                <div
                                  key={link.id}
                                  className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.02),0_12px_24px_rgba(15,23,42,0.04)]"
                                >
                                  <StackRowCard link={link} />
                                </div>
                              )
                            }

                            return (
                              <AccessCard
                                key={link.id}
                                link={link}
                                isFavorite={favoriteIds.includes(link.id)}
                                onToggleFavorite={toggleFavorite}
                                toneKey={getSectionTheme(section.key)}
                              />
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home
