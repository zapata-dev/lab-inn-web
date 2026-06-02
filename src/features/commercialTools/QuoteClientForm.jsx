import { Card } from '../../components/common'

function QuoteClientForm({ client, onChange }) {
  const setField = (field) => (event) => onChange?.(field, event.target.value)

  return (
    <Card className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-lab-text">2. Datos del cliente</h3>
        <p className="text-sm text-lab-muted">Captura información comercial básica del cliente.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Razon social</span>
          <input
            value={client.companyName}
            onChange={setField('companyName')}
            className="w-full rounded-lab border border-lab-border px-3 py-2 text-sm text-lab-text"
            placeholder="Transporte Norte Demo"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">RFC</span>
          <input
            value={client.rfc}
            onChange={setField('rfc')}
            className="w-full rounded-lab border border-lab-border px-3 py-2 text-sm text-lab-text"
            placeholder="TND010101ABC"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Contacto</span>
          <input
            value={client.contactName}
            onChange={setField('contactName')}
            className="w-full rounded-lab border border-lab-border px-3 py-2 text-sm text-lab-text"
            placeholder="Laura Perez"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Telefono</span>
          <input
            value={client.contactPhone}
            onChange={setField('contactPhone')}
            className="w-full rounded-lab border border-lab-border px-3 py-2 text-sm text-lab-text"
            placeholder="+52 81 0000 0000"
          />
        </label>

        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-lab-muted">Email</span>
          <input
            type="email"
            value={client.contactEmail}
            onChange={setField('contactEmail')}
            className="w-full rounded-lab border border-lab-border px-3 py-2 text-sm text-lab-text"
            placeholder="contacto@cliente.demo"
          />
        </label>
      </div>
    </Card>
  )
}

export default QuoteClientForm
