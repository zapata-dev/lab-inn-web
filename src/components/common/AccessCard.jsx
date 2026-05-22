import {
  ArrowUpRight,
  BadgePercent,
  BarChart3,
  Bot,
  Building2,
  Calculator,
  CalendarDays,
  ChevronRight,
  FileText,
  Headphones,
  Image,
  Library,
  Link2,
  MessageCircle,
  Network,
  PlayCircle,
  Settings,
  Target,
  Truck,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Badge from './Badge'

const iconMap = {
  BadgePercent,
  BarChart3,
  Bot,
  Building2,
  Calculator,
  CalendarDays,
  FileText,
  Headphones,
  Image,
  Library,
  MessageCircle,
  Network,
  PlayCircle,
  Settings,
  Target,
  Truck,
  Users,
}

function AccessCard({ title, description, icon, href, type, status, onClick }) {
  const navigate = useNavigate()
  const Icon = iconMap[icon] ?? Link2
  const hasHref = typeof href === 'string' && href.trim().length > 0
  const isPending = status === 'pending'
  const isExternal = type === 'external'

  const handleOpen = () => {
    if (!hasHref) {
      onClick?.()
      return
    }

    if (type === 'internal') {
      navigate(href)
      return
    }

    if (isExternal) {
      window.open(href, '_blank', 'noopener,noreferrer')
      return
    }

    onClick?.()
  }

  return (
    <article className="rounded-lab border border-lab-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lab">
      <button
        type="button"
        onClick={handleOpen}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-lg bg-lab-primary/10 text-lab-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            {isPending && <Badge variant="demo">Demo</Badge>}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-lab-text">{title}</h3>
            <p className="text-xs leading-relaxed text-lab-muted">{description}</p>
          </div>
        </div>

        <span className="mt-1 inline-flex shrink-0 items-center text-lab-muted">
          {isExternal ? (
            <ArrowUpRight className="size-4" aria-hidden="true" />
          ) : (
            <ChevronRight className="size-4" aria-hidden="true" />
          )}
        </span>
      </button>
    </article>
  )
}

export default AccessCard
