import { useState } from 'react'
import {
  Badge,
  Card,
  CheckIcon,
  DonutChart,
  Drawer,
  EmptyState,
  FilterBar,
  Modal,
  ProgressBar,
  SearchBar,
  StatusBadge,
  StatusDot,
} from '../components/common'

function DesignSystem() {
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <main className="min-h-screen bg-lab-bg px-5 py-8 md:px-8">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <header className="space-y-2">
          <Badge variant="demo">Modo QA visual</Badge>
          <h1 className="text-3xl font-bold text-lab-text">Design System Lite</h1>
          <p className="text-sm text-lab-muted">LAB-002 - Componentes primitivos reutilizables.</p>
        </header>

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-lab-text">SearchBar y FilterBar</h2>
          <div className="space-y-4">
            <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} />
            <FilterBar title="Filtros rapidos">
              <Badge>Todos</Badge>
              <Badge variant="info">Pendientes</Badge>
              <Badge variant="success">Completados</Badge>
            </FilterBar>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-lab-text">Badges</h2>
            <div className="flex flex-wrap gap-2">
              <Badge>default</Badge>
              <Badge variant="success">success</Badge>
              <Badge variant="warning">warning</Badge>
              <Badge variant="danger">danger</Badge>
              <Badge variant="info">info</Badge>
              <Badge variant="demo">demo</Badge>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-lab-text">Status</h2>
            <div className="flex items-center gap-4">
              <StatusDot status="green" />
              <StatusDot status="yellow" />
              <StatusDot status="red" />
              <StatusDot status="gray" />
              <StatusBadge status="verde" />
              <StatusBadge status="amarillo" />
              <StatusBadge status="rojo" />
              <StatusBadge status="neutral" />
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-lab-text">ProgressBar</h2>
            <div className="space-y-4">
              <ProgressBar label="Meta mensual" value={72} />
              <ProgressBar label="Inventario auditado" value={113} />
              <ProgressBar label="Capacitacion" value={-8} />
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-lab-text">DonutChart y CheckIcon</h2>
            <div className="flex flex-wrap items-center gap-6">
              <DonutChart value={67} label="Cumplimiento" />
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-lab-muted">
                  <CheckIcon completed />
                  Tarea completada
                </div>
                <div className="flex items-center gap-2 text-sm text-lab-muted">
                  <CheckIcon completed={false} />
                  Tarea pendiente
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-lab-text">EmptyState</h2>
          <EmptyState
            title="Sin datos comerciales"
            description="Aun no hay registros para este periodo."
            actionLabel="Cargar demo"
            onAction={() => setQuery('demo')}
          />
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold text-lab-text">Modal y Drawer</h2>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="rounded-lg bg-lab-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Abrir modal
            </button>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="rounded-lg border border-lab-border bg-white px-4 py-2 text-sm font-semibold text-lab-text transition hover:bg-slate-50"
            >
              Abrir drawer
            </button>
          </div>
        </Card>
      </section>

      <Modal
        isOpen={isModalOpen}
        title="Modal de ejemplo"
        onClose={() => setIsModalOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-lab-border px-3 py-1.5 text-sm font-medium text-lab-text"
            >
              Cerrar
            </button>
          </div>
        }
      >
        <p className="text-sm text-lab-muted">Este modal valida el primitivo base para dialogs del MVP.</p>
      </Modal>

      <Drawer isOpen={isDrawerOpen} title="Drawer de ejemplo" onClose={() => setIsDrawerOpen(false)} side="right">
        <p className="text-sm text-lab-muted">
          Este drawer lateral sirve como base para paneles de filtros y detalle rapido.
        </p>
      </Drawer>
    </main>
  )
}

export default DesignSystem
