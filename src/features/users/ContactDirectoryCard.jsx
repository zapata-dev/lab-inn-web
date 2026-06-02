import { Mail, MapPin, Phone } from 'lucide-react'
import { Badge, Card } from '../../components/common'
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

function ContactDirectoryCard({ contact, copied = false, onCopyPhone }) {
  return (
    <Card className="group h-full border-white/70 bg-white/95 p-0 shadow-[0_18px_36px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_42px_rgba(15,23,42,0.12)]">
      <div className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-lab-primary via-sky-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-lab-primary/20">
            {getInitials(contact?.name)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-slate-900">{contact?.name}</h3>
              <Badge className="shrink-0 bg-slate-100 text-slate-600">{contact?.branchName}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">{contact?.observations || 'Contacto directo de sucursal'}</p>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <MapPin className="size-4 shrink-0 text-lab-primary" aria-hidden="true" />
            <span>{contact?.branchName}</span>
          </div>
          <a
            href={`mailto:${contact?.email || ''}`}
            className="flex items-center gap-2 text-sm text-slate-700 transition hover:text-lab-primary"
          >
            <Mail className="size-4 shrink-0 text-lab-primary" aria-hidden="true" />
            <span className="truncate">{contact?.email}</span>
          </a>
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Phone className="size-4 shrink-0 text-lab-primary" aria-hidden="true" />
            <span>{formatPhone(contact?.phone)}</span>
          </div>
        </div>

        <ContactDirectoryActions contact={contact} copied={copied} onCopyPhone={onCopyPhone} compact />
      </div>
    </Card>
  )
}

export default ContactDirectoryCard
