import AccessCard from './AccessCard'

function AccessGrid({ title, subtitle, items = [], onSimulatedAccess }) {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-bold text-lab-text">{title}</h2>
        {subtitle ? <p className="text-sm text-lab-muted">{subtitle}</p> : null}
      </header>

      {items.length === 0 ? (
        <div className="rounded-lab border border-dashed border-lab-border bg-white px-4 py-8 text-sm text-lab-muted">
          No hay accesos disponibles por el momento.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <AccessCard
              key={item.id}
              title={item.title}
              description={item.description}
              icon={item.icon}
              href={item.href}
              type={item.type}
              status={item.status}
              onClick={() => onSimulatedAccess?.(item)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default AccessGrid
