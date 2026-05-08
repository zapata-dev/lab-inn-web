import { useMemo } from 'react'
import { Badge, Card } from '../components/common'
import QuoteBuilder from '../features/commercialTools/QuoteBuilder'
import ToolPlaceholder from '../features/commercialTools/ToolPlaceholder'
import { useSearchParams } from 'react-router-dom'

const tabs = [
  { key: 'cotizador', label: 'Cotizador' },
  { key: 'tco', label: 'TCO' },
  { key: 'benchmark', label: 'Benchmark' },
  { key: 'comparador', label: 'Comparador' },
]

function HerramientasComerciales() {
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab = useMemo(() => {
    const tabParam = searchParams.get('tab')
    return tabs.some((tab) => tab.key === tabParam) ? tabParam : 'cotizador'
  }, [searchParams])

  const changeTab = (tabKey) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', tabKey)
    setSearchParams(nextParams)
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-lab-text">Herramientas Comerciales</h2>
            <p className="text-sm text-lab-muted">
              Estructura base del flujo comercial: cotizador, TCO, benchmark y comparador.
            </p>
          </div>
          <Badge variant="demo">Sprint 3 Dia 4</Badge>
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

      {activeTab === 'cotizador' && <QuoteBuilder />}

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
          description="Comparativa rapida entre unidades para soportar decision comercial."
          badge="Sprint 4"
        />
      )}
    </section>
  )
}

export default HerramientasComerciales
