import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BookImage,
  Building2,
  Bus,
  Database,
  Heart,
  Home as HomeIcon,
  ImagePlus,
  Mail,
  MessageCircle,
  Network,
  PlayCircle,
  Search,
  ShieldCheck,
  Star,
  Tags,
  Truck,
  Users,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Card } from '../components/common'
import { useAuth } from '../context/AuthContext'
import { accessLinks } from '../data/accessLinks'
import {
  fetchInventoryFromCsv,
  getInventoryCache,
  saveInventoryCache,
} from '../services/inventoryService'
import {
  countUniquePromotionCoverImages,
  isPromotionFlagUnit,
} from '../utils/advertisingCatalogUtils'

const sidebarItems = [
  { id: 'oficina', label: 'Mi Oficina', icon: HomeIcon },
  { id: 'inventario', label: 'Inventario', icon: Truck },
  { id: 'favoritos', label: 'Favoritos', icon: Heart },
  { id: 'usuarios', label: 'Usuarios', icon: Users, to: '/usuarios' },
]

const categories = [
  { id: 'todas', label: 'Todas' },
  { id: 'inventario', label: 'Inventario' },
  { id: 'plataforma', label: 'Plataformas' },
  { id: 'comunidad', label: 'Comunidad' },
  { id: 'soporte', label: 'Soporte' },
]

const iconMap = {
  Bus,
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
}

const toolVisuals = {
  inventario: {
    image:
      'https://images.unsplash.com/photo-1556122071-e404cb6f31f5?auto=format&fit=crop&w=1400&q=80',
    categoryLabel: 'Inventario',
  },
  promociones: {
    image:
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1400&q=80',
    categoryLabel: 'Promociones',
  },
  catalogoPortadas: {
    image:
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1400&q=80',
    categoryLabel: 'Publicidad',
  },
  directorioSeminuevos: {
    image:
      'https://images.unsplash.com/photo-1633605532054-ffc7136f7552?auto=format&fit=crop&w=1400&q=80',
    categoryLabel: 'Seminuevos',
  },
  salesforce: {
    image:
      'https://images.unsplash.com/photo-1551281044-8b6f8d8e27b5?auto=format&fit=crop&w=1400&q=80',
    categoryLabel: 'Plataforma',
  },
  krino: {
    image:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1400&q=80',
    categoryLabel: 'Datos',
  },
  btp: {
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
    categoryLabel: 'Sistemas',
  },
  youtube: {
    image:
      'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=1400&q=80',
    categoryLabel: 'Comunidad',
  },
  whatsapp: {
    image:
      'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=1400&q=80',
    categoryLabel: 'Comunidad',
  },
  contacto: {
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
    categoryLabel: 'Soporte',
  },
}

const defaultToolVisual = {
  image:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80',
  categoryLabel: 'Herramienta',
}

const roleFeaturedToolIds = {
  vendedor: ['inventario', 'promociones'],
  coordinador: ['inventario', 'catalogo-portadas'],
  soporte: ['soporte-usuarios', 'promociones'],
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
  if (hour < 12) return 'Buenos dias'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function getToolVisual(toolId) {
  return toolVisuals[toolId] || defaultToolVisual
}

function HomeToolCard({ tool, isFavorite, onToggleFavorite, onOpen }) {
  const Icon = iconMap[tool.icon] || Building2
  const visual = getToolVisual(tool.id)

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_12px_30px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-[120px] overflow-hidden border-b border-slate-100">
        <img src={visual.image} alt={tool.title} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-900/10 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-white/35 bg-white/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur">
          {visual.categoryLabel}
        </span>
        <button
          type="button"
          onClick={() => onToggleFavorite(tool.id)}
          className={`absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full border backdrop-blur transition ${
            isFavorite
              ? 'border-amber-300 bg-amber-100/85 text-amber-600'
              : 'border-white/45 bg-white/20 text-white hover:bg-white/35'
          }`}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Star className={`size-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-lab-primary/10 text-lab-primary">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{tool.title}</h3>
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">{tool.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <Badge className="capitalize">{tool.category || 'general'}</Badge>
          <button
            type="button"
            onClick={() => onOpen(tool)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-lab-primary hover:text-lab-primary/80 sm:text-sm"
          >
            {tool.cta || 'Abrir'}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}

function FeaturedToolCard({ tool, isFavorite, onToggleFavorite, onOpen }) {
  const Icon = iconMap[tool.icon] || Building2
  const visual = getToolVisual(tool.id)

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_14px_32px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="grid min-h-[220px] grid-cols-1 lg:grid-cols-[1fr_44%]">
        <div className="flex flex-col justify-between p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Badge className="bg-slate-100 text-slate-700">{visual.categoryLabel}</Badge>
              <button
                type="button"
                onClick={() => onToggleFavorite(tool.id)}
                className={`inline-flex size-8 items-center justify-center rounded-full border transition ${
                  isFavorite
                    ? 'border-amber-300 bg-amber-50 text-amber-600'
                    : 'border-slate-200 bg-white text-slate-500 hover:text-lab-primary'
                }`}
                aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Star className={`size-4 ${isFavorite ? 'fill-current' : ''}`} aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-slate-900">{tool.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{tool.description}</p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl bg-lab-primary/10 px-3 py-2 text-xs font-semibold text-lab-primary">
              <Icon className="size-4" aria-hidden="true" />
              Herramienta destacada
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpen(tool)}
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-lab-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-lab-primary/90"
          >
            {tool.cta || 'Abrir'}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="relative h-[180px] lg:h-full">
          <img src={visual.image} alt={tool.title} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-l from-slate-950/15 via-transparent to-slate-950/35 lg:bg-gradient-to-r" />
        </div>
      </div>
    </article>
  )
}

function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userRole = String(user?.rol || user?.role || '').trim().toLowerCase()
  const isSupportUser = userRole === 'soporte'
  const displayName = getDisplayName(user)
  const displayRole = getDisplayRole(user, userRole)
  const displayBranch = getDisplayBranch(user)
  const displayPhoto = getDisplayPhoto(user)
  const nameInitials = getNameInitials(displayName)
  const contextualMessage = getRoleContextMessage(userRole)
  const greeting = getGreetingByHour()

  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('todas')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [homeMetrics, setHomeMetrics] = useState(() => buildHomeMetrics([]))

  const favoritesStorageKey = `lab:v1:favorites:${getUserStorageKey(user)}`
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const raw = localStorage.getItem(favoritesStorageKey)
      const parsed = JSON.parse(raw || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  const visibleAccessLinks = useMemo(
    () =>
      accessLinks.filter((access) => {
        if (access.hiddenFromHome) return false
        if (access.supportOnly && !isSupportUser) return false
        return true
      }),
    [isSupportUser]
  )

  useEffect(() => {
    let mounted = true

    const applyMetrics = (items) => {
      if (!mounted) return
      setHomeMetrics(buildHomeMetrics(Array.isArray(items) ? items : []))
    }

    const cache = getInventoryCache()
    if (cache.items.length > 0) {
      applyMetrics(cache.items)
    }

    const syncMetrics = async () => {
      try {
        const items = await fetchInventoryFromCsv()
        saveInventoryCache(items)
        applyMetrics(items)
      } catch {
        if (!cache.items.length) {
          applyMetrics([])
        }
      }
    }

    syncMetrics()

    return () => {
      mounted = false
    }
  }, [])

  const categoryCounts = useMemo(() => {
    const counters = { todas: visibleAccessLinks.length }

    categories.forEach((category) => {
      if (category.id === 'todas') return
      counters[category.id] = visibleAccessLinks.filter((tool) => tool.category === category.id).length
    })

    return counters
  }, [visibleAccessLinks])

  const filteredTools = useMemo(() => {
    const normalizedQuery = normalizeText(query)

    return visibleAccessLinks.filter((tool) => {
      if (activeCategory !== 'todas' && tool.category !== activeCategory) return false
      if (favoritesOnly && !favoriteIds.includes(tool.id)) return false
      if (!normalizedQuery) return true

      const searchable = `${tool.title} ${tool.description} ${tool.category || ''}`.toLowerCase()
      return searchable.includes(normalizedQuery)
    })
  }, [visibleAccessLinks, activeCategory, favoritesOnly, favoriteIds, query])

  const featuredTools = useMemo(() => {
    const normalizedQuery = normalizeText(query)
    const featuredIds =
      roleFeaturedToolIds[userRole] ||
      filteredTools.filter((tool) => tool.featured).map((tool) => tool.id)

    const roleToolPool = accessLinks.filter((tool) => {
      if (tool.supportOnly && !isSupportUser) return false
      if (!tool.hiddenFromHome) return true
      return userRole === 'soporte' && tool.id === 'adminUsuarios'
    })

    const toolsWithUiFilters = roleToolPool.filter((tool) => {
      if (activeCategory !== 'todas' && tool.category !== activeCategory) return false
      if (favoritesOnly && !favoriteIds.includes(tool.id)) return false
      if (!normalizedQuery) return true

      const searchable = `${tool.title} ${tool.description} ${tool.category || ''}`.toLowerCase()
      return searchable.includes(normalizedQuery)
    })

    return featuredIds
      .map((toolId) => toolsWithUiFilters.find((tool) => tool.id === toolId))
      .filter(Boolean)
      .slice(0, 2)
  }, [activeCategory, favoriteIds, favoritesOnly, filteredTools, isSupportUser, query, userRole])

  const regularTools = useMemo(
    () => filteredTools.filter((tool) => !featuredTools.some((featured) => featured.id === tool.id)),
    [filteredTools, featuredTools]
  )

  const operationalSummary = `${formatCompactNumber(homeMetrics.totalUnits)} unidades • ${formatCompactNumber(homeMetrics.activePromotions)} promociones • ${formatCompactNumber(homeMetrics.availableAds)} publicidades`
  const contextualLiveLine =
    homeMetrics.activePromotions > 0
      ? `Hay ${formatCompactNumber(homeMetrics.activePromotions)} promociones activas disponibles para compartir.`
      : `Actualmente hay ${formatCompactNumber(homeMetrics.totalUnits)} unidades disponibles para consulta.`

  const handleToggleFavorite = (toolId) => {
    setFavoriteIds((previous) => {
      const next = previous.includes(toolId)
        ? previous.filter((id) => id !== toolId)
        : [...previous, toolId]
      localStorage.setItem(favoritesStorageKey, JSON.stringify(next))
      return next
    })
  }

  const handleOpenTool = (tool) => {
    if (tool.disabled) return
    if (tool.to) {
      navigate(tool.to)
      return
    }
    if (tool.url) {
      window.open(tool.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleSidebarAction = (item) => {
    if (item.to) {
      navigate(item.to)
      return
    }

    if (item.id === 'oficina') {
      setFavoritesOnly(false)
      setActiveCategory('todas')
      return
    }

    if (item.id === 'inventario') {
      setFavoritesOnly(false)
      setActiveCategory('inventario')
      return
    }

    if (item.id === 'favoritos') {
      setFavoritesOnly(true)
      setActiveCategory('todas')
    }
  }

  const activeSidebarId = favoritesOnly
    ? 'favoritos'
    : activeCategory === 'inventario'
      ? 'inventario'
      : 'oficina'

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 text-lab-text">
      <div className="mx-auto grid w-full max-w-[1320px] gap-5 p-4 lg:grid-cols-[240px_1fr] lg:p-6">
        <aside className="hidden rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_16px_34px_rgba(15,23,42,0.08)] backdrop-blur lg:sticky lg:top-6 lg:flex lg:h-[calc(100vh-3rem)] lg:flex-col">
          <div className="mb-7 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-lab-primary/15 via-sky-100 to-indigo-100 p-3">
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-lab-primary text-sm font-bold text-white">
              L
            </span>
            <div>
              <p className="text-sm font-semibold text-lab-text">LAB Comercial</p>
              <p className="text-xs text-lab-muted">Oficina Virtual</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = item.id === activeSidebarId

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSidebarAction(item)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-lab-primary to-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-lab-primary'
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-200 bg-white/90 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">{displayName}</p>
            <p>{displayRole}</p>
            <p>{displayBranch}</p>
          </div>
        </aside>

        <div className="space-y-5">
          <header className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_10px_28px_rgba(15,23,42,0.07)] backdrop-blur">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 focus-within:border-lab-primary focus-within:ring-2 focus-within:ring-lab-primary/20">
              <Search className="size-4 text-slate-500" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar herramientas, accesos o recursos..."
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>
          </header>

          <section className="relative overflow-hidden rounded-3xl border border-white/15 shadow-[0_22px_50px_rgba(15,23,42,0.22)]">
            <img
              src="https://images.unsplash.com/photo-1710911652269-7e5bb8d65b1b?auto=format&fit=crop&w=1800&q=80"
              alt="Flota comercial"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-blue-900/60 to-slate-900/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent" />

            <div className="relative z-10 p-6 sm:p-7 lg:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-white backdrop-blur">
                <BookImage className="size-3.5" aria-hidden="true" />
                TU OFICINA • EN VIVO
              </div>

              <div className="mt-4 max-w-2xl space-y-3 text-white">
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                  {greeting}, {displayName}.
                  <br />
                  Esta es tu oficina virtual.
                </h1>
                <p className="text-sm text-slate-200 sm:text-base">Todas tus herramientas comerciales en un solo lugar.</p>
                <p className="text-sm text-slate-200 sm:text-base">{contextualLiveLine}</p>
                <p className="text-xs text-slate-300 sm:text-sm">{contextualMessage}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt={`Foto de ${displayName}`}
                    className="size-10 rounded-full border border-white/45 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="inline-flex size-10 items-center justify-center rounded-full border border-white/45 bg-white/10 text-xs font-semibold text-white">
                    {nameInitials}
                  </span>
                )}
                <Badge variant="info" className="border-white/30 bg-white/15 text-white backdrop-blur">
                  Rol: {displayRole}
                </Badge>
                <Badge className="border-white/30 bg-white/15 text-white backdrop-blur">Sucursal: {displayBranch}</Badge>
                <Link
                  to="/perfil"
                  className="inline-flex items-center rounded-full border border-white/35 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25"
                >
                  Mi perfil
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Card className="rounded-2xl border border-white/25 bg-white/[0.12] p-4 text-white shadow-lg backdrop-blur-md">
                  <p className="text-2xl font-semibold">{formatCompactNumber(homeMetrics.totalUnits)}</p>
                  <p className="text-xs text-slate-100">Unidades disponibles</p>
                </Card>
                <Card className="rounded-2xl border border-white/25 bg-white/[0.12] p-4 text-white shadow-lg backdrop-blur-md">
                  <p className="text-2xl font-semibold">{formatCompactNumber(homeMetrics.activePromotions)}</p>
                  <p className="text-xs text-slate-100">Promociones vigentes</p>
                </Card>
                <Card className="rounded-2xl border border-white/25 bg-white/[0.12] p-4 text-white shadow-lg backdrop-blur-md">
                  <p className="text-2xl font-semibold">{formatCompactNumber(homeMetrics.availableAds)}</p>
                  <p className="text-xs text-slate-100">Publicidades disponibles</p>
                </Card>
              </div>

              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-100/90">
                {operationalSummary}
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = activeCategory === category.id
                const count = categoryCounts[category.id] ?? 0

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category.id)
                      setFavoritesOnly(false)
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition duration-300 sm:text-sm ${
                      isActive
                        ? 'border-lab-primary bg-lab-primary text-white shadow-md shadow-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-lab-primary/40 hover:text-lab-primary'
                    }`}
                  >
                    {category.label} ({count})
                  </button>
                )
              })}
            </div>
          </section>

          {featuredTools.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
                <h2 className="text-lg font-semibold text-slate-900">Destacados para ti</h2>
                <span className="text-xs font-medium text-slate-500">{featuredTools.length} destacados</span>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {featuredTools.map((tool) => (
                  <FeaturedToolCard
                    key={tool.id}
                    tool={tool}
                    isFavorite={favoriteIds.includes(tool.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpen={handleOpenTool}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
              <h2 className="text-lg font-semibold text-slate-900">
                {favoritesOnly ? 'Favoritos' : 'Herramientas'}
              </h2>
              <span className="text-xs font-medium text-slate-500">{regularTools.length} resultados</span>
            </div>

            {regularTools.length === 0 ? (
              <Card className="rounded-3xl border border-dashed border-slate-300 bg-white/95 p-8 text-center text-sm text-slate-600">
                No hay herramientas para los filtros seleccionados.
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {regularTools.map((tool) => (
                  <HomeToolCard
                    key={tool.id}
                    tool={tool}
                    isFavorite={favoriteIds.includes(tool.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpen={handleOpenTool}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default Home

