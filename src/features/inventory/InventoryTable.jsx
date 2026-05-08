import { useEffect, useMemo, useState } from 'react'
import { Badge, Card, EmptyState } from '../../components/common'
import { formatNumber, formatUSD } from '../../utils/formatters'

const statusVariant = {
  available: 'success',
  reserved: 'warning',
  maintenance: 'danger',
  demo: 'info',
}

const normalizeStatus = (status) => {
  if (!status) return 'Sin status'
  return String(status).replaceAll('_', ' ')
}

function InventoryTable({ units = [], branchesById = {}, pageSize = 20, onSelectUnit }) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [units, pageSize])

  const totalPages = Math.max(1, Math.ceil(units.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const pageUnits = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return units.slice(start, start + pageSize)
  }, [pageSize, safePage, units])

  if (!units.length) {
    return (
      <EmptyState
        title="Sin unidades para mostrar"
        description="Ajusta filtros o cambia de sucursal para ver resultados."
      />
    )
  }

  return (
    <Card className="space-y-4 overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs uppercase tracking-wide text-lab-muted">
              <th className="px-4 py-3 font-semibold">Unidad</th>
              <th className="px-4 py-3 font-semibold">Marca</th>
              <th className="px-4 py-3 font-semibold">Anio</th>
              <th className="px-4 py-3 font-semibold">Sucursal</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Configuracion</th>
              <th className="px-4 py-3 font-semibold">Kilometraje</th>
              <th className="px-4 py-3 font-semibold">Precio USD</th>
              <th className="px-4 py-3 font-semibold">Dias inv.</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-lab-text">
            {pageUnits.map((unit) => (
              <tr key={unit.id} className="align-top hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <p className="font-semibold">{unit.model}</p>
                  <p className="text-xs text-lab-muted">{unit.id}</p>
                </td>
                <td className="px-4 py-3">{unit.brand}</td>
                <td className="px-4 py-3">{unit.year}</td>
                <td className="px-4 py-3">{branchesById[unit.branchId]?.name ?? unit.branchId}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[unit.status] ?? 'default'}>{normalizeStatus(unit.status)}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-lab-muted">{unit.configuration}</td>
                <td className="px-4 py-3">{formatNumber(unit.mileageKm)} km</td>
                <td className="px-4 py-3 font-semibold">{formatUSD(unit.priceUsd)}</td>
                <td className="px-4 py-3">{formatNumber(unit.daysInInventory)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSelectUnit?.(unit)}
                    className="rounded-lg border border-lab-border px-3 py-1.5 text-xs font-semibold text-lab-text hover:bg-slate-50"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm">
        <p className="text-lab-muted">
          Pagina {safePage} de {totalPages} | {formatNumber(units.length)} unidades
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={safePage === 1}
            className="rounded-lg border border-lab-border px-3 py-1.5 font-semibold text-lab-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={safePage === totalPages}
            className="rounded-lg border border-lab-border px-3 py-1.5 font-semibold text-lab-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </Card>
  )
}

export default InventoryTable
