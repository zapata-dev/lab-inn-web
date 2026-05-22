import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import AccessGrid from '../components/common/AccessGrid'
import { Badge, Card } from '../components/common'
import { commercialAccessLinks } from '../data/mockAccessLinks'
import QuoteBuilder from '../features/commercialTools/QuoteBuilder'
import QuoteHistoryPanel from '../features/commercialTools/QuoteHistoryPanel'
import ToolPlaceholder from '../features/commercialTools/ToolPlaceholder'
import useToast from '../hooks/useToast'

const tabs = [
  { key: 'accesos', label: 'Accesos rápidos' },
  { key: 'cotizador', label: 'Cotizador' },
  { key: 'historial', label: 'Historial' },
  { key: 'tco', label: 'TCO' },
  { key: 'benchmark', label: 'Benchmark' },
  { key: 'comparador', label: 'Comparador' },
]

function HerramientasComerciales() {
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()

  const activeTab = useMemo(() => {
    const tabParam = searchParams.get('tab')
    return tabs.some((tab) => tab.key === tabParam) ? tabParam : 'accesos'
  }, [searchParams])

  const changeTab = (tabKey) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', tabKey)
    setSearchParams(nextParams)
  }

  const handleSimulatedAccess = (item) => {
    toast.simulated(
      `Este acceso abrirá ${item.title} en producción. Por ahora es parte de la simulación LAB.`
    )
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-lab-text">Herramientas Comerciales</h2>
            <p className="text-sm text-lab-muted">
              Todo lo que necesitas para vender, en un solo lugar.
            </p>
          </div>
          <Badge variant="demo">Sprint 3 Dia 5</Badge>
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

      {activeTab === 'accesos' && (
        <AccessGrid
          title="Accesos rápidos"
          subtitle="Herramientas prioritarias para operar la oficina virtual comercial."
          items={commercialAccessLinks}
          onSimulatedAccess={handleSimulatedAccess}
        />
      )}

      {activeTab === 'cotizador' && <QuoteBuilder />}

      {activeTab === 'historial' && (
        <QuoteHistoryPanel onGoToCotizador={() => changeTab('cotizador')} />
      )}

      {activeTab === 'tco' && (
        <ToolPlaceholder
          title="Calculadora TCO"
          description="Vista preliminar para evaluar costo total de propiedad por unidad."
          badge="Sprint 4"
        />
      )}

      {activeTab === 'benchmark' && (
        <ToolPlaceholder
          title="Benchmark comercial"
          description="Comparativo de condiciones comerciales entre propuestas y segmentos."
          badge="Sprint 4"
        />
      )}

      {activeTab === 'comparador' && (
        <ToolPlaceholder
          title="Comparador de unidades"
          description="Comparativa rápida entre unidades para soportar decisión comercial."
          badge="Sprint 4"
        />
      )}
    </section>
  )
}

export default HerramientasComerciales
