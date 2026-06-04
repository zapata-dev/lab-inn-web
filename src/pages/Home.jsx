import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Bell,
  Building2,
  Database,
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
  ShieldCheck,
  Star,
  Tags,
  Truck,
  Users,
  X,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Card } from '../components/common'
import UserMenu from '../components/layout/UserMenu'
import { useAuth } from '../context/AuthContext'
import { accessLinks } from '../data/accessLinks'
import heroTruckImage from '../assets/home/truck-hero.png'
import { fetchInventoryFromCsv, getInventoryCache, saveInventoryCache } from '../services/inventoryService'
import { countUniquePromotionCoverImages, isPromotionFlagUnit } from '../utils/advertisingCatalogUtils'
import useToast from '../hooks/useToast'

const sidebarItems = [
  { id: 'oficina', label: 'Mi Oficina', icon: HomeIcon, category: 'todas' },
  { id: 'inventario', label: 'Inventario', icon: Truck, category: 'inventario' },
  { id: 'plataformas', label: 'Plataformas', icon: Database, category: 'plataforma' },
  { id: 'comunidad', label: 'Comunidad', icon: PlayCircle, category: 'comunidad' },
  { id: 'soporte', label: 'Soporte', icon: Users, category: 'soporte' },
  { id: 'favoritos', label: 'Favoritos', icon: Heart, category: 'favoritos' },
  { id: 'directorio', label: 'Directorio', icon: Users, to: '/usuarios' },
]

const filterItems = [
  { id: 'todas', label: 'Todo', icon: LayoutGrid },
  { id: 'inventario', label: 'Inventario', icon: Truck },
  { id: 'plataforma', label: 'Plataformas', icon: Database },
  { id: 'comunidad', label: 'Comunidad', icon: PlayCircle },
  { id: 'soporte', label: 'Soporte', icon: Users },
  { id: 'favoritos', label: 'Favoritos', icon: Heart },
]

const sectionDefinitions = [
  {
    id: 'inventario',
    title: 'Inventario y publicidad',
    description: 'Unidades disponibles, promociones vigentes y piezas listas para compartir.',
    icon: Truck,
    accent: 'from-sky-500 via-cyan-500 to-blue-500',
  },
  {
    id: 'plataforma',
    title: 'Plataformas comerciales',
    description: 'Herramientas oficiales para operar, revisar datos y seguir oportunidades.',
    icon: Database,
    accent: 'from-slate-700 via-slate-600 to-slate-500',
  },
  {
    id: 'comunidad',
    title: 'Comunidad y aprendizaje',
    description: 'Contenido, video y mensajería para colaborar más rápido.',
    icon: PlayCircle,
    accent: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    id: 'soporte',
    title: 'Soporte y directorio',
    description: 'Canales de ayuda, contacto y administración interna.',
    icon: Users,
    accent: 'from-amber-500 via-orange-500 to-rose-500',
  },
]

const iconMap = {
  Database,
  ImagePlus,
  Mail,
  MessageCircle,
  Network,
  PlayCircle,
  ShieldCheck,
  Tags,
  Truck,
  Users,
  Building2,
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

function getUserStorageKey(user) {
  return String(user?.uid || user?.email || user?.id || 'anon').trim().toLowerCase()
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
  return iconMap[link.icon] || Building2
}

function getSectionVariant(category) {
  if (category === 'inventario') return 'info'
  if (category === 'plataforma') return 'default'
  if (category === 'comunidad') return 'success'
  if (category === 'soporte') return 'warning'
  return 'default'
}

function getLinkSurfaceLabel(link) {
  return link.to ? 'Ruta interna' : 'Recurso externo'
}

function LinkActionButton({ link, variant = 'dark', className = '', children }) {
  if (!link) return null

  const baseClasses =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2'

  const variants = {
    light:
      'bg-white text-slate-950 hover:bg-slate-100 focus-visible:ring-white/70 focus-visible:ring-offset-0',
    dark:
      'bg-slate-950 text-white hover:bg-slate-800 focus-visible:ring-lab-primary/25 focus-visible:ring-offset-white',
    glass:
      'border border-white/20 bg-white/10 text-white hover:bg-white/15 focus-visible:ring-white/60 focus-visible:ring-offset-0',
  }

  const classes = `${baseClasses} ${variants[variant] || variants.dark} ${className}`.trim()
  const content = (
    <>
      <span>{children}</span>
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </>
  )

  if (link.to) {
    return (
      <Link to={link.to} className={classes}>
        {content}
      </Link>
    )
  }

  return (
    <a href={link.url} target="_blank" rel="noreferrer" className={classes}>
      {content}
    </a>
  )
}

function AccessCard({ link, section, isFavorite, onToggleFavorite }) {
  const Icon = getLinkIcon(link)
  const sectionVariant = getSectionVariant(link.category)

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,0.14)]">
      <div className={`h-1 bg-gradient-to-r ${section.accent}`} />

      <div className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-950/5 text-lab-primary">
              {link.logoUrl ? (
                <img
                  src={link.logoUrl}
                  alt={link.logoAlt || link.title}
                  className="size-8 object-contain"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <Icon className="size-5" aria-hidden="true" />
              )}
            </span>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold text-slate-900">{link.title}</h3>
                <Badge variant={sectionVariant}>{section.title}</Badge>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{link.description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(link.id)}
            className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full border transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-primary/25 ${
              isFavorite
                ? 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100'
                : 'border-slate-200 bg-white text-slate-500 hover:border-lab-primary/25 hover:text-lab-primary'
            }`}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Star className={`size-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            {getLinkSurfaceLabel(link)}
          </span>
          <LinkActionButton link={link} variant="dark" className="px-4 py-2 text-xs">
            {link.cta || 'Abrir'}
          </LinkActionButton>
        </div>
      </div>
    </article>
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
  const [activeCategory, setActiveCategory] = useState('todas')
  const [homeMetrics, setHomeMetrics] = useState(() => buildHomeMetrics([]))
  const [metricsStatus, setMetricsStatus] = useState('loading')
  const [metricsRetryToken, setMetricsRetryToken] = useState(0)

  const favoritesStorageKey = `lab:v1:favorites:${getUserStorageKey(user)}`
  const [favoriteIds, setFavoriteIds] = useState([])

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
    try {
      const raw = localStorage.getItem(favoritesStorageKey)
      const parsed = JSON.parse(raw || '[]')
      setFavoriteIds(Array.isArray(parsed) ? parsed : [])
    } catch {
      setFavoriteIds([])
    }
  }, [favoritesStorageKey])

  useEffect(() => {
    let mounted = true
    const cache = getInventoryCache()

    const applyMetrics = (items) => {
      if (!mounted) return
      setHomeMetrics(buildHomeMetrics(Array.isArray(items) ? items : []))
      setMetricsStatus('ready')
    }

    if (cache.items.length > 0) {
      applyMetrics(cache.items)
    } else {
      setMetricsStatus('loading')
    }

    const syncMetrics = async () => {
      try {
        const items = await fetchInventoryFromCsv()
        saveInventoryCache(items)
        applyMetrics(items)
      } catch {
        if (!mounted) return
        if (cache.items.length > 0) {
          setMetricsStatus('ready')
        } else {
          setMetricsStatus('error')
        }
      }
    }

    syncMetrics()

    return () => {
      mounted = false
    }
  }, [metricsRetryToken])

  const categoryCounts = useMemo(() => {
    const counts = {
      todas: visibleAccessLinks.length,
      inventario: 0,
      plataforma: 0,
      comunidad: 0,
      soporte: 0,
      favoritos: favoriteIds.length,
    }

    visibleAccessLinks.forEach((link) => {
      counts[link.category] = (counts[link.category] || 0) + 1
    })

    return counts
  }, [favoriteIds, visibleAccessLinks])

  const activeViewCategory = activeCategory === 'favoritos' ? 'todas' : activeCategory
  const normalizedQuery = normalizeText(query)

  const filteredSections = useMemo(() => {
    return sectionDefinitions
      .map((section) => {
        const links = visibleAccessLinks.filter((link) => {
          if (activeViewCategory !== 'todas' && link.category !== activeViewCategory) return false
          if (activeCategory === 'favoritos' && !favoriteIds.includes(link.id)) return false
          if (!normalizedQuery) return true

          const searchable = `${link.title} ${link.description} ${link.category || ''}`.toLowerCase()
          return searchable.includes(normalizedQuery)
        })

        return {
          ...section,
          links,
        }
      })
      .filter((section) => section.links.length > 0)
  }, [activeCategory, activeViewCategory, favoriteIds, normalizedQuery, visibleAccessLinks])

  const filteredLinksCount = filteredSections.reduce((total, section) => total + section.links.length, 0)
  const visibleSectionCount = filteredSections.length

  const heroQuickLinkIds = isSupportUser
    ? ['inventario', 'promociones', 'catalogo-portadas', 'soporte-usuarios']
    : ['inventario', 'promociones', 'catalogo-portadas', 'contacto']

  const heroQuickLinks = heroQuickLinkIds
    .map((linkId) => visibleLinkMap.get(linkId))
    .filter(Boolean)

  const primaryHeroLink = visibleLinkMap.get('inventario') || heroQuickLinks[0]
  const secondaryHeroLink = visibleLinkMap.get('promociones') || visibleLinkMap.get('catalogo-portadas')

  const handleToggleFavorite = (toolId) => {
    setFavoriteIds((previous) => {
      const next = previous.includes(toolId)
        ? previous.filter((id) => id !== toolId)
        : [...previous, toolId]

      try {
        localStorage.setItem(favoritesStorageKey, JSON.stringify(next))
      } catch {
        // Ignore localStorage failures in restricted environments.
      }

      return next
    })
  }

  const handleNotificationsClick = () => {
    toast.info('No hay notificaciones nuevas por ahora.')
  }

  const handleSidebarAction = (item) => {
    if (item.to) {
      navigate(item.to)
      return
    }

    setActiveCategory(item.category)
  }

  const activeSidebarId = activeCategory === 'todas' ? 'oficina' : activeCategory

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_28%),radial-gradient(circle_at_left_bottom,_rgba(15,23,42,0.08),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef4fb_42%,_#f8fafc_100%)] text-lab-text">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute -bottom-0 -left-28 size-96 rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1600px]">
        <aside className="hidden min-h-dvh w-[300px] shrink-0 border-r border-slate-800/70 bg-slate-950 text-slate-100 lg:flex lg:flex-col">
          <div className="flex flex-1 flex-col px-5 py-6">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.16)]">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lab-primary via-sky-500 to-cyan-500 text-base font-bold text-white shadow-lg shadow-lab-primary/20">
                  L
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">LAB Comercial</p>
                  <p className="truncate text-xs text-slate-300">Mi Oficina Virtual</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Sesión actual</p>
                <p className="mt-2 truncate text-sm font-semibold text-white">{displayName}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-200">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    {displayRole}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    {displayBranch}
                  </span>
                </div>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = item.id === activeSidebarId

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSidebarAction(item)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                      isActive
                        ? 'bg-gradient-to-r from-lab-primary via-sky-600 to-cyan-600 text-white shadow-[0_12px_24px_rgba(14,165,233,0.24)]'
                        : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-pressed={isActive}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })}
            </nav>

              <div className="mt-6 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-3">
                  <p className="text-xs text-slate-400">Unidades</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {formatCompactNumber(homeMetrics.totalUnits)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-3">
                  <p className="text-xs text-slate-400">Promos</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {formatCompactNumber(homeMetrics.activePromotions)}
                  </p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                {visibleAccessLinks.length} accesos visibles en esta sesión.
              </p>
            </div>

            <UserMenu variant="sidebar" className="mt-6" />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-3 p-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <label className="flex min-h-11 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-lab-primary focus-within:ring-2 focus-within:ring-lab-primary/15">
                  <Search className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar accesos, plataformas o soporte..."
                    aria-label="Buscar accesos, plataformas o soporte"
                    className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="inline-flex size-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </label>
              </div>

              <button
                type="button"
                onClick={handleNotificationsClick}
                className="inline-flex size-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-lab-primary/25 hover:text-lab-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-primary/20"
                aria-label="Ver notificaciones"
                title="Ver notificaciones"
              >
                <Bell className="size-4" aria-hidden="true" />
              </button>

              <div className="min-w-48">
                <UserMenu variant="compact" />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
              {filterItems.map((item) => {
                const Icon = item.icon
                const isActive = activeCategory === item.id
                const count = categoryCounts[item.id] ?? 0

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveCategory(item.id)}
                    className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-primary/20 ${
                      isActive
                        ? 'border-lab-primary bg-lab-primary text-white shadow-[0_10px_20px_rgba(14,165,233,0.18)]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-lab-primary/35 hover:text-lab-primary'
                    }`}
                    aria-pressed={isActive}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span>{item.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </header>

          <div className="space-y-6 px-4 py-5 sm:px-6 lg:px-8">
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
              <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
                <div className="relative isolate overflow-hidden p-6 sm:p-8 lg:p-10">
                  <img
                    src={heroTruckImage}
                    alt="Camión de carga de la marca sobre fondo corporativo"
                    className="absolute inset-0 size-full object-cover object-center"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/40" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />

                  <div className="relative z-10 max-w-2xl space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                      <LayoutGrid className="size-3.5" aria-hidden="true" />
                      Mi Oficina Virtual
                    </div>

                    <div className="space-y-3">
                      <h1 className="text-3xl font-semibold leading-tight sm:text-4xl xl:text-[3.35rem]">
                        {greeting}, {displayName}.
                        <br />
                        Tu operación comercial empieza aquí.
                      </h1>
                      <p className="max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                        Centraliza inventario, promociones, plataformas, comunidad y soporte en una
                        sola vista pensada para trabajar más rápido.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {displayPhoto ? (
                        <img
                          src={displayPhoto}
                          alt={`Foto de ${displayName}`}
                          className="size-11 rounded-full border border-white/30 object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="inline-flex size-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-sm font-semibold text-white">
                          {nameInitials}
                        </span>
                      )}
                      <Badge
                        variant="info"
                        className="border-white/20 bg-white/10 text-white backdrop-blur"
                      >
                        Rol: {displayRole}
                      </Badge>
                      <Badge className="border-white/20 bg-white/10 text-white backdrop-blur">
                        <MapPin className="mr-1 size-3.5" aria-hidden="true" />
                        Sucursal: {displayBranch}
                      </Badge>
                      <Badge className="border-white/20 bg-white/10 text-white backdrop-blur">
                        Accesos visibles: {visibleAccessLinks.length}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <LinkActionButton link={primaryHeroLink} variant="light">
                        {primaryHeroLink?.cta || 'Abrir inventario'}
                      </LinkActionButton>
                      <LinkActionButton link={secondaryHeroLink} variant="glass">
                        {secondaryHeroLink?.cta || 'Ver promociones'}
                      </LinkActionButton>
                    </div>

                    <p className="text-xs uppercase tracking-[0.18em] text-slate-300">
                      Inventario, publicidad y accesos listos para responder desde escritorio o móvil.
                    </p>

                    {metricsStatus === 'loading' ? (
                      <div
                        role="status"
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-100"
                      >
                        <span className="inline-flex size-2 rounded-full bg-sky-300" />
                        Actualizando indicadores de inventario...
                      </div>
                    ) : null}

                    {metricsStatus === 'error' ? (
                      <div
                        role="alert"
                        className="flex flex-col gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-semibold">No pudimos actualizar las métricas de inventario.</p>
                          <p className="mt-1 text-rose-100/90">
                            Puedes reintentar o continuar con la vista actual usando la caché local.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMetricsRetryToken((value) => value + 1)}
                          className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="border-t border-white/10 bg-white/[0.04] p-5 sm:p-6 lg:border-l lg:border-t-0">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Unidades</p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        {formatCompactNumber(homeMetrics.totalUnits)}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">Disponibles en la caché de inventario.</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Promociones</p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        {formatCompactNumber(homeMetrics.activePromotions)}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">Unidades con promociones vigentes.</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Piezas publicitarias</p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        {formatCompactNumber(homeMetrics.availableAds)}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">Material visual único disponible.</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Accesos visibles</p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        {formatCompactNumber(visibleAccessLinks.length)}
                      </p>
                      <p className="mt-1 text-sm text-slate-300">Recursos activos en este rol.</p>
                    </div>
                  </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-slate-900/45 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">Accesos rápidos</p>
                        <p className="mt-1 text-xs text-slate-300">Los más usados en esta oficina.</p>
                      </div>
                      <Badge className="border-white/10 bg-white/10 text-white">
                        {formatCompactNumber(heroQuickLinks.length)} visibles
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2">
                      {heroQuickLinks.map((link) => {
                        const Icon = getLinkIcon(link)
                        return (
                          <div
                            key={link.id}
                            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                                {link.logoUrl ? (
                                  <img
                                    src={link.logoUrl}
                                    alt={link.logoAlt || link.title}
                                    className="size-6 object-contain"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                ) : (
                                  <Icon className="size-4" aria-hidden="true" />
                                )}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">{link.title}</p>
                                <p className="truncate text-xs text-slate-300">{link.cta || 'Abrir'}</p>
                              </div>
                            </div>
                            <LinkActionButton link={link} variant="light" className="px-3 py-2 text-xs">
                              Abrir
                            </LinkActionButton>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.07)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {activeCategory === 'favoritos' ? 'Favoritos guardados' : 'Vista actual'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {query ? `Filtrado por “${query}”. ` : ''}
                    {visibleSectionCount > 0
                      ? `${filteredLinksCount} accesos visibles en ${visibleSectionCount} secciones.`
                      : 'No hay accesos que coincidan con los filtros actuales.'}
                  </p>
                </div>

                {(query || activeCategory !== 'todas') ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setActiveCategory('todas')
                    }}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-lab-primary/30 hover:text-lab-primary"
                  >
                    Limpiar filtros
                  </button>
                ) : null}
              </div>
            </section>

            {filteredSections.length > 0 ? (
              filteredSections.map((section) => {
                const SectionIcon = section.icon
                return (
                  <section key={section.id} className="space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span
                          className={`inline-flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br ${section.accent} text-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]`}
                        >
                          <SectionIcon className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{section.title}</h2>
                          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
                            {section.description}
                          </p>
                        </div>
                      </div>

                      <Badge variant={getSectionVariant(section.id)}>
                        {formatCompactNumber(section.links.length)} accesos
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {section.links.map((link) => (
                        <AccessCard
                          key={link.id}
                          link={link}
                          section={section}
                          isFavorite={favoriteIds.includes(link.id)}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  </section>
                )
              })
            ) : (
              <Card className="border-dashed border-slate-300 bg-white/90 p-8 text-center shadow-none">
                <div className="mx-auto flex max-w-md flex-col items-center gap-4">
                  <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Search className="size-6" aria-hidden="true" />
                  </span>
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-slate-900">No encontramos accesos para estos filtros.</h2>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Prueba con otra búsqueda o vuelve a la vista general para revisar todos los recursos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setActiveCategory('todas')
                    }}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-lab-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-lab-primary/90"
                  >
                    Limpiar búsqueda
                  </button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home
