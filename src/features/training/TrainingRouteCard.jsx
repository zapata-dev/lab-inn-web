import { Card } from '../../components/common'

const levelConfig = {
  basico: { label: 'Basico', className: 'bg-emerald-100 text-emerald-700' },
  intermedio: { label: 'Intermedio', className: 'bg-amber-100 text-amber-700' },
  avanzado: { label: 'Avanzado', className: 'bg-rose-100 text-rose-700' },
}

function LevelBadge({ level }) {
  const cfg = levelConfig[level] ?? { label: level, className: 'bg-slate-100 text-slate-700' }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

function ProgressBar({ value }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-2 rounded-full bg-lab-primary transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

function VideoRow({ video, watched, onMarkWatched }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${watched ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
      <div className="flex-1 space-y-0.5">
        <p className={`text-sm font-medium ${watched ? 'text-emerald-700' : 'text-lab-text'}`}>
          {video.title}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-lab-muted">{video.durationMinutes} min</span>
          <LevelBadge level={video.level} />
        </div>
      </div>
      {watched ? (
        <span className="shrink-0 text-xs font-semibold text-emerald-600">Visto</span>
      ) : (
        <button
          type="button"
          onClick={() => onMarkWatched(video.id)}
          className="shrink-0 rounded-lab border border-lab-border px-2.5 py-1 text-xs font-semibold text-lab-muted hover:border-lab-primary hover:text-lab-primary"
        >
          Marcar visto
        </button>
      )}
    </div>
  )
}

function TrainingRouteCard({ route, videos, seedCompleted, watchedVideos, onMarkWatched }) {
  const routeVideos = videos.filter((v) => v.routeId === route.id)
  const completedCount = routeVideos.filter((v) => seedCompleted.has(v.id) || watchedVideos[v.id]).length
  const pct = routeVideos.length > 0 ? Math.round((completedCount / routeVideos.length) * 100) : 0

  return (
    <Card className="space-y-4 p-0">
      <div className="space-y-2 px-5 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="font-bold text-lab-text">{route.title}</h3>
            <p className="text-sm text-lab-muted">{route.description}</p>
          </div>
          <span className="shrink-0 text-sm font-bold text-lab-primary">{pct}%</span>
        </div>
        <ProgressBar value={pct} />
        <p className="text-xs text-lab-muted">{completedCount} de {routeVideos.length} videos completados</p>
      </div>

      <div className="space-y-0.5 border-t border-lab-border px-2 pb-2 pt-1">
        {routeVideos.map((video) => (
          <VideoRow
            key={video.id}
            video={video}
            watched={seedCompleted.has(video.id) || !!watchedVideos[video.id]}
            onMarkWatched={onMarkWatched}
          />
        ))}
      </div>
    </Card>
  )
}

export default TrainingRouteCard
