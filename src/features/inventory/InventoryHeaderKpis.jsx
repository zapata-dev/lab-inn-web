import { Boxes, Building2, CircleDollarSign, Timer } from 'lucide-react'
import MetricCard from '../dashboard/components/MetricCard'
import { formatNumber, formatUSD } from '../../utils/formatters'

function InventoryHeaderKpis({ units = [] }) {
  const totalUnits = units.length
  const totalValueUsd = units.reduce((total, unit) => total + (Number(unit.priceUsd) || 0), 0)
  const branchesWithInventory = new Set(units.map((unit) => unit.branchId).filter(Boolean)).size
  const avgDays =
    totalUnits > 0
      ? Math.round(units.reduce((total, unit) => total + (Number(unit.daysInInventory) || 0), 0) / totalUnits)
      : 0

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Unidades visibles"
        value={formatNumber(totalUnits)}
        description="Unidades segun scope y filtros"
        icon={Boxes}
        tone="info"
      />
      <MetricCard
        title="Valor inventario"
        value={formatUSD(totalValueUsd)}
        description="Suma de precio USD"
        icon={CircleDollarSign}
        tone="success"
      />
      <MetricCard
        title="Sucursales con inventario"
        value={formatNumber(branchesWithInventory)}
        description="Cobertura operativa"
        icon={Building2}
        tone="default"
      />
      <MetricCard
        title="Dias promedio"
        value={formatNumber(avgDays)}
        description="Antiguedad promedio"
        icon={Timer}
        tone={avgDays > 90 ? 'warning' : 'default'}
      />
    </section>
  )
}

export default InventoryHeaderKpis
