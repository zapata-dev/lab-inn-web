import InventoryCard from './InventoryCard'

function InventoryGrid({ units, onViewDetail }) {
  if (!units.length) {
    return (
      <div className="rounded-2xl border border-dashed border-lab-border bg-white p-8 text-center">
        <h3 className="text-lg font-semibold text-lab-text">No encontramos unidades</h3>
        <p className="mt-2 text-sm text-lab-muted">
          Ajusta los filtros o actualiza el inventario para intentar nuevamente.
        </p>
      </div>
    )
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {units.map((unit) => (
        <InventoryCard key={unit.id} unit={unit} onViewDetail={onViewDetail} />
      ))}
    </section>
  )
}

export default InventoryGrid
