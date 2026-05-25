import InventoryCard from './InventoryCard'

function InventorySkeleton() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-lab-border bg-white p-4 shadow-sm">
          <div className="aspect-[16/10] animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-4 space-y-2">
            <div className="h-4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-10 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </section>
  )
}

function InventoryGrid({ units, onViewDetail, loading }) {
  if (loading) {
    return <InventorySkeleton />
  }

  if (!units.length) {
    return (
      <div className="rounded-2xl border border-dashed border-lab-border bg-white p-8 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-lab-text">No encontramos unidades con esos filtros</h3>
        <p className="mt-2 text-sm text-lab-muted">
          Prueba limpiando filtros o actualizando el inventario para ver nuevas opciones.
        </p>
      </div>
    )
  }

  return (
    <section className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {units.map((unit) => (
        <InventoryCard key={unit.id} unit={unit} onViewDetail={onViewDetail} />
      ))}
    </section>
  )
}

export default InventoryGrid
