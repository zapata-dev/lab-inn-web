import {
  Bus,
  Database,
  ImagePlus,
  Link2,
  Mail,
  MessageCircle,
  Network,
  PlayCircle,
  ShieldCheck,
  Tags,
  Truck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
}

const FALLBACK_ICON = Link2
const delayClassMap = [
  '[animation-delay:0ms]',
  '[animation-delay:40ms]',
  '[animation-delay:80ms]',
  '[animation-delay:120ms]',
  '[animation-delay:160ms]',
  '[animation-delay:200ms]',
  '[animation-delay:240ms]',
  '[animation-delay:280ms]',
  '[animation-delay:320ms]',
  '[animation-delay:360ms]',
]

const brandToneMap = {
  amber: {
    ring: 'ring-amber-200/70 hover:ring-amber-300/70',
    iconWrap: 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white',
  },
  blue: {
    ring: 'ring-blue-200/70 hover:ring-blue-300/70',
    iconWrap: 'bg-blue-100 text-blue-700 group-hover:bg-blue-500 group-hover:text-white',
  },
  cyan: {
    ring: 'ring-cyan-200/70 hover:ring-cyan-300/70',
    iconWrap: 'bg-cyan-100 text-cyan-700 group-hover:bg-cyan-500 group-hover:text-white',
  },
  emerald: {
    ring: 'ring-emerald-200/70 hover:ring-emerald-300/70',
    iconWrap: 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white',
  },
  green: {
    ring: 'ring-green-200/70 hover:ring-green-300/70',
    iconWrap: 'bg-green-100 text-green-700 group-hover:bg-green-500 group-hover:text-white',
  },
  rose: {
    ring: 'ring-rose-200/70 hover:ring-rose-300/70',
    iconWrap: 'bg-rose-100 text-rose-700 group-hover:bg-rose-500 group-hover:text-white',
  },
  sky: {
    ring: 'ring-sky-200/70 hover:ring-sky-300/70',
    iconWrap: 'bg-sky-100 text-sky-700 group-hover:bg-sky-500 group-hover:text-white',
  },
  slate: {
    ring: 'ring-slate-200/70 hover:ring-slate-300/70',
    iconWrap: 'bg-slate-100 text-slate-700 group-hover:bg-slate-600 group-hover:text-white',
  },
}

function QuickAccessCard({
  title,
  description,
  icon,
  logoUrl,
  logoAlt,
  logoClassName,
  brandColor,
  url,
  to,
  index = 0,
  disabled = false,
}) {
  const navigate = useNavigate()
  const Icon = iconMap[icon] ?? FALLBACK_ICON
  const hasInternalRoute = Boolean(to)
  const hasExternalLink = Boolean(url)
  const isDisabled = disabled || (!hasInternalRoute && !hasExternalLink)
  const delayClass = delayClassMap[index % delayClassMap.length]
  const tone = brandToneMap[brandColor] ?? {
    ring: 'ring-lab-border hover:ring-lab-primary/30',
    iconWrap: 'bg-lab-primary/10 text-lab-primary group-hover:bg-lab-primary group-hover:text-white',
  }
  const shouldRenderLogo = Boolean(logoUrl && !/^https?:\/\//i.test(logoUrl))

  const handleOpenLink = () => {
    if (isDisabled) return

    if (hasInternalRoute) {
      navigate(to)
      return
    }

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleOpenLink}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={`group flex min-h-[112px] w-full animate-fade-in flex-col items-center rounded-2xl border bg-white p-3 text-center ring-1 ring-inset transition-all [animation-duration:460ms] ${delayClass} duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-primary focus-visible:ring-offset-2 md:min-h-[190px] md:items-start md:p-6 md:text-left ${
        isDisabled
          ? 'cursor-not-allowed border-lab-border/80 opacity-75 ring-lab-border'
          : `cursor-pointer border-lab-border shadow-sm hover:-translate-y-1 hover:shadow-lab ${tone.ring}`
      }`}
    >
      <span
        className={`relative mb-2 inline-flex size-12 items-center justify-center rounded-2xl transition-colors duration-300 md:mb-5 ${
          isDisabled
            ? 'bg-lab-muted/15 text-lab-muted'
            : tone.iconWrap
        }`}
      >
        <Icon className="size-5" aria-hidden="true" />
        {shouldRenderLogo ? (
          <img
            src={logoUrl}
            alt={logoAlt || title}
            className={`absolute inset-1 m-auto size-6 rounded-sm bg-white object-contain p-0.5 ${
              isDisabled ? 'opacity-60 grayscale' : ''
            } ${logoClassName || ''}`}
            loading="lazy"
          />
        ) : null}
      </span>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-lab-text md:text-lg">{title}</h2>
        {isDisabled ? (
          <span className="hidden rounded-full bg-lab-muted/15 px-2 py-0.5 text-xs font-medium text-lab-muted md:inline-flex">
            Proximamente
          </span>
        ) : null}
      </div>
      <p className="mt-2 hidden text-sm leading-relaxed text-lab-muted md:block">{description}</p>
    </button>
  )
}

export default QuickAccessCard
