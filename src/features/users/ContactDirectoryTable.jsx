import { Mail, MapPin, Phone } from 'lucide-react'
import ContactDirectoryActions from './ContactDirectoryActions'

function formatPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10) {
    return digits.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3')
  }
  return digits
}

function getInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return 'CT'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

function ContactDirectoryTable({ contacts, copiedContactId, onCopyPhone }) {
  return (
    <div className="hidden overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_22px_48px_rgba(15,23,42,0.08)] lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/70">
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Sucursal / Zona</th>
              <th className="px-6 py-4">Rol / Observación</th>
              <th className="px-6 py-4">Correo</th>
              <th className="px-6 py-4">Teléfono</th>
              <th className="px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {contacts.map((contact) => {
              const copied = copiedContactId === contact.id

              return (
                <tr key={contact.id} className="align-top transition duration-200 hover:bg-slate-50/70">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lab-primary via-sky-500 to-cyan-400 text-xs font-bold text-white shadow-md shadow-lab-primary/15">
                        {getInitials(contact.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{contact.name}</p>
                        <p className="truncate text-sm text-slate-500">{contact.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <MapPin className="size-4 shrink-0 text-lab-primary" aria-hidden="true" />
                      <span>{contact.branchName}</span>
                    </div>
                  </td>

                  <td className="p-6 text-sm text-slate-600">
                    {contact.observations ? (
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {contact.observations}
                      </span>
                    ) : (
                      <span className="text-slate-400">Sin observación</span>
                    )}
                  </td>

                  <td className="p-6 text-sm text-slate-600">
                    <a
                      href={`mailto:${contact.email}`}
                      className="inline-flex items-center gap-2 font-medium text-slate-700 transition hover:text-lab-primary"
                    >
                      <Mail className="size-4 text-lab-primary" aria-hidden="true" />
                      <span className="max-w-[220px] truncate">{contact.email}</span>
                    </a>
                  </td>

                  <td className="p-6 text-sm text-slate-700">
                    <div className="flex items-center gap-2 font-medium">
                      <Phone className="size-4 text-lab-primary" aria-hidden="true" />
                      <span>{formatPhone(contact.phone)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">+52 {formatPhone(contact.phone)}</p>
                  </td>

                  <td className="p-6">
                    <ContactDirectoryActions
                      contact={contact}
                      copied={copied}
                      onCopyPhone={onCopyPhone}
                      compact
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ContactDirectoryTable
