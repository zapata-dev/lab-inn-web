import { useEffect, useMemo, useState } from 'react'
import AccessGrid from '../components/common/AccessGrid'
import { Badge, Card, EmptyState } from '../components/common'
import { trainingAccessLinks, supportAccessLinks } from '../data/mockAccessLinks'
import { useAuth } from '../context/AuthContext'
import SupportFaqList from '../features/support/SupportFaqList'
import SupportTicketsTable from '../features/support/SupportTicketsTable'
import TrainingDiagnostic from '../features/training/TrainingDiagnostic'
import TrainingProgress from '../features/training/TrainingProgress'
import TrainingRouteCard from '../features/training/TrainingRouteCard'
import useToast from '../hooks/useToast'
import { dataService } from '../services/dataService'
import { getTicketUpdates, updateTicketStatus } from '../services/supportService'
import { getWatchedVideos, markVideoWatched } from '../services/trainingService'

const sectionTabs = [
  { key: 'capacitacion', label: 'Capacitación' },
  { key: 'soporte', label: 'Soporte' },
]

const detailTabsBySection = {
  capacitacion: [
    { key: 'rutas', label: 'Rutas' },
    { key: 'diagnostico', label: 'Diagnóstico' },
    { key: 'progreso', label: 'Progreso' },
  ],
  soporte: [
    { key: 'tickets', label: 'Tickets' },
    { key: 'faq', label: 'FAQ' },
  ],
}

const scopeModeByRole = {
  admin: 'global',
  direccion: 'global',
  bdcLab: 'global',
  gerente: 'branch',
  bdcSucursal: 'branch',
  ejecutivo: 'branch',
}

function CapacitacionSoporte() {
  const { user } = useAuth()
  const toast = useToast()
  const [activeSection, setActiveSection] = useState('capacitacion')
  const [activeDetailTab, setActiveDetailTab] = useState('rutas')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [training, setTraining] = useState(null)
  const [userProgress, setUserProgress] = useState(null)
  const [support, setSupport] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [branches, setBranches] = useState([])
  const [watchedVideos, setWatchedVideos] = useState(() => getWatchedVideos())
  const [ticketUpdates, setTicketUpdates] = useState(() => getTicketUpdates())

  useEffect(() => {
    const validTabs = detailTabsBySection[activeSection].map((tab) => tab.key)
    if (!validTabs.includes(activeDetailTab)) {
      setActiveDetailTab(validTabs[0])
    }
  }, [activeSection, activeDetailTab])

  useEffect(() => {
    let isActive = true

    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const [trainingData, progressData, supportData, usersList, branchesList] = await Promise.all([
          dataService.getTraining(),
          dataService.getProgressByUser(user?.id),
          dataService.getSupport(),
          dataService.getUsers(),
          dataService.getBranches(),
        ])
        if (!isActive) return
        setTraining(trainingData)
        setUserProgress(progressData)
        setSupport(supportData)
        setAllUsers(Array.isArray(usersList) ? usersList : [])
        setBranches(Array.isArray(branchesList) ? branchesList : [])
      } catch (err) {
        if (isActive) setError(err?.message ?? 'No fue posible cargar los datos.')
      } finally {
        if (isActive) setLoading(false)
      }
    }

    load()
    return () => {
      isActive = false
    }
  }, [user?.id])

  const handleMarkWatched = (videoId) => {
    const added = markVideoWatched(videoId)
    if (added) setWatchedVideos((prev) => ({ ...prev, [videoId]: true }))
  }

  const handleUpdateTicketStatus = (ticketId, newStatus) => {
    updateTicketStatus(ticketId, newStatus)
    setTicketUpdates(getTicketUpdates())
  }

  const handleSimulatedAccess = (item) => {
    toast.simulated(
      `Este acceso abrirá ${item.title} en producción. Por ahora es parte de la simulación LAB.`
    )
  }

  const seedCompleted = useMemo(() => new Set(userProgress?.completedVideos ?? []), [userProgress])

  const usersById = useMemo(() => Object.fromEntries(allUsers.map((u) => [u.id, u])), [allUsers])

  const branchesById = useMemo(() => Object.fromEntries(branches.map((b) => [b.id, b])), [branches])

  const scopeMode = scopeModeByRole[user?.role] ?? 'global'
  const scopeBranchId = scopeMode === 'branch' ? user?.branchId : null

  const tickets = useMemo(() => {
    const all = support?.tickets ?? []
    return scopeBranchId ? all.filter((ticket) => ticket.branchId === scopeBranchId) : all
  }, [scopeBranchId, support])

  const videos = training?.videos ?? []
  const routes = training?.routes ?? []
  const diagnostic = training?.diagnostics?.[0] ?? null
  const faqs = support?.faqs ?? []
  const detailTabs = detailTabsBySection[activeSection]

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-4">
        <Card className="space-y-2">
          <h2 className="text-2xl font-bold text-lab-text">Capacitación y Soporte</h2>
          <p className="text-sm text-lab-muted">Cargando datos...</p>
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <EmptyState title="No pudimos cargar el módulo" description={error} />
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-lab-text">Capacitación y Soporte</h2>
            <p className="text-sm text-lab-muted">
              Aprende, mejora y recibe ayuda sin salir de LAB.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">{user?.name}</Badge>
            <Badge variant="info">{user?.roleLabel}</Badge>
            {scopeMode === 'branch' && <Badge>{user?.branchName}</Badge>}
            <Badge variant="demo">Sprint 5</Badge>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {sectionTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSection(tab.key)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                activeSection === tab.key
                  ? 'border-lab-primary bg-lab-primary text-white'
                  : 'border-lab-border bg-white text-lab-muted hover:text-lab-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </Card>

      {activeSection === 'capacitacion' ? (
        <AccessGrid
          title="Accesos de capacitación"
          subtitle="Contenidos y recursos para fortalecer operación comercial."
          items={trainingAccessLinks}
          onSimulatedAccess={handleSimulatedAccess}
        />
      ) : (
        <AccessGrid
          title="Accesos de soporte"
          subtitle="Canales de ayuda para resolver bloqueos operativos."
          items={supportAccessLinks}
          onSimulatedAccess={handleSimulatedAccess}
        />
      )}

      <Card className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-lab-text">Operativa interna LAB</h3>
          <p className="text-sm text-lab-muted">
            Seguimiento detallado de capacitación y soporte por rol.
          </p>
        </div>

        <nav className="flex flex-wrap gap-2">
          {detailTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveDetailTab(tab.key)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                activeDetailTab === tab.key
                  ? 'border-lab-primary bg-lab-primary text-white'
                  : 'border-lab-border bg-white text-lab-muted hover:text-lab-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </Card>

      <div key={`${activeSection}-${activeDetailTab}`} className="animate-fade-in">
        {activeDetailTab === 'rutas' && (
          <div className="space-y-4">
            {routes.length === 0 ? (
              <EmptyState title="Sin rutas" description="No hay rutas de capacitación disponibles." />
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

        {activeDetailTab === 'diagnostico' &&
          (diagnostic ? (
            <TrainingDiagnostic
              diagnostic={diagnostic}
              seedScore={userProgress?.lastDiagnosticScore ?? null}
            />
          ) : (
            <EmptyState
              title="Sin diagnóstico"
              description="No hay diagnóstico disponible por el momento."
            />
          ))}

        {activeDetailTab === 'progreso' && (
          <TrainingProgress userProgress={userProgress} watchedVideos={watchedVideos} videos={videos} />
        )}

        {activeDetailTab === 'tickets' && (
          <SupportTicketsTable
            tickets={tickets}
            usersById={usersById}
            branchesById={branchesById}
            ticketUpdates={ticketUpdates}
            onUpdateStatus={handleUpdateTicketStatus}
          />
        )}

        {activeDetailTab === 'faq' && <SupportFaqList faqs={faqs} />}
      </div>
    </section>
  )
}

export default CapacitacionSoporte
