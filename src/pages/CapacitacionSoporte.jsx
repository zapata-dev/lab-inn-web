import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Badge, Card, EmptyState } from '../components/common'
import { useAuth } from '../context/AuthContext'
import TrainingDiagnostic from '../features/training/TrainingDiagnostic'
import TrainingProgress from '../features/training/TrainingProgress'
import TrainingRouteCard from '../features/training/TrainingRouteCard'
import { dataService } from '../services/dataService'
import { getWatchedVideos, markVideoWatched } from '../services/trainingService'

const tabs = [
  { key: 'rutas', label: 'Rutas' },
  { key: 'diagnostico', label: 'Diagnostico' },
  { key: 'progreso', label: 'Progreso' },
]

function CapacitacionSoporte() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [training, setTraining] = useState(null)
  const [userProgress, setUserProgress] = useState(null)
  const [watchedVideos, setWatchedVideos] = useState(() => getWatchedVideos())

  const activeTab = useMemo(() => {
    const tab = searchParams.get('tab')
    return tabs.some((t) => t.key === tab) ? tab : 'rutas'
  }, [searchParams])

  const changeTab = (key) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', key)
    setSearchParams(next)
  }

  useEffect(() => {
    let isActive = true

    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const [trainingData, progressData] = await Promise.all([
          dataService.getTraining(),
          dataService.getProgressByUser(user?.id),
        ])
        if (!isActive) return
        setTraining(trainingData)
        setUserProgress(progressData)
      } catch (err) {
        if (isActive) setError(err?.message ?? 'No fue posible cargar los datos de capacitacion.')
      } finally {
        if (isActive) setLoading(false)
      }
    }

    load()
    return () => { isActive = false }
  }, [user?.id])

  const handleMarkWatched = (videoId) => {
    const added = markVideoWatched(videoId)
    if (added) setWatchedVideos((prev) => ({ ...prev, [videoId]: true }))
  }

  const seedCompleted = useMemo(
    () => new Set(userProgress?.completedVideos ?? []),
    [userProgress]
  )

  const videos = training?.videos ?? []
  const routes = training?.routes ?? []
  const diagnostic = training?.diagnostics?.[0] ?? null

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-5xl space-y-4">
        <Card className="space-y-2">
          <h2 className="text-2xl font-bold text-lab-text">Capacitacion</h2>
          <p className="text-sm text-lab-muted">Cargando rutas y progreso...</p>
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-5xl">
        <EmptyState title="No pudimos cargar Capacitacion" description={error} />
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-lab-text">Capacitacion</h2>
            <p className="text-sm text-lab-muted">
              Rutas de aprendizaje, diagnostico mensual y seguimiento de progreso.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">{user?.name}</Badge>
            <Badge variant="info">{user?.roleLabel}</Badge>
            <Badge variant="demo">Sprint 4 Dia 3</Badge>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => changeTab(tab.key)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? 'border-lab-primary bg-lab-primary text-white'
                  : 'border-lab-border bg-white text-lab-muted hover:text-lab-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </Card>

      {activeTab === 'rutas' && (
        <div className="space-y-4">
          {routes.length === 0 ? (
            <EmptyState title="Sin rutas" description="No hay rutas de capacitacion disponibles." />
          ) : (
            routes.map((route) => (
              <TrainingRouteCard
                key={route.id}
                route={route}
                videos={videos}
                seedCompleted={seedCompleted}
                watchedVideos={watchedVideos}
                onMarkWatched={handleMarkWatched}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'diagnostico' && (
        diagnostic ? (
          <TrainingDiagnostic
            diagnostic={diagnostic}
            seedScore={userProgress?.lastDiagnosticScore ?? null}
          />
        ) : (
          <EmptyState title="Sin diagnostico" description="No hay diagnostico disponible por el momento." />
        )
      )}

      {activeTab === 'progreso' && (
        <TrainingProgress
          userProgress={userProgress}
          watchedVideos={watchedVideos}
          videos={videos}
        />
      )}
    </section>
  )
}

export default CapacitacionSoporte
