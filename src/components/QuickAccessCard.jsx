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

function QuickAccessCard({ title, description, icon, url, to, disabled = false }) {
  const navigate = useNavigate()
  const Icon = iconMap[icon] ?? FALLBACK_ICON
  const hasInternalRoute = Boolean(to)
  const hasExternalLink = Boolean(url)
  const isDisabled = disabled || (!hasInternalRoute && !hasExternalLink)

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
      className={`group flex w-full flex-col rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-primary focus-visible:ring-offset-2 ${
        isDisabled
          ? 'cursor-not-allowed border-lab-border/80 opacity-75'
          : 'cursor-pointer border-lab-border hover:-translate-y-1 hover:border-lab-primary/30 hover:shadow-lab'
      }`}
    >
      <span
        className={`mb-5 inline-flex size-11 items-center justify-center rounded-xl transition-colors duration-300 ${
          isDisabled
            ? 'bg-lab-muted/15 text-lab-muted'
            : 'bg-lab-primary/10 text-lab-primary group-hover:bg-lab-primary group-hover:text-white'
        }`}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-lab-text">{title}</h2>
        {isDisabled ? (
          <span className="rounded-full bg-lab-muted/15 px-2 py-0.5 text-xs font-medium text-lab-muted">
            Proximamente
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-lab-muted">{description}</p>
    </button>
  )
}

export default QuickAccessCard
