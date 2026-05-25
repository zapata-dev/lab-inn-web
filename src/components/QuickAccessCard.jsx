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

function QuickAccessCard({ title, description, icon, url }) {
  const Icon = iconMap[icon] ?? FALLBACK_ICON

  const handleOpenLink = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleOpenLink}
      className="group flex w-full cursor-pointer flex-col rounded-2xl border border-lab-border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-lab-primary/30 hover:shadow-lab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-primary focus-visible:ring-offset-2"
    >
      <span className="mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-lab-primary/10 text-lab-primary transition-colors duration-300 group-hover:bg-lab-primary group-hover:text-white">
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <h2 className="text-lg font-semibold text-lab-text">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-lab-muted">{description}</p>
    </button>
  )
}

export default QuickAccessCard
