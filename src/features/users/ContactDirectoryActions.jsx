import { Check, Copy, Mail, MessageCircle } from 'lucide-react'

function ContactDirectoryActions({ contact, copied = false, onCopyPhone, compact = false }) {
  const phoneDigits = String(contact?.phone || '').replace(/\D/g, '')
  const emailHref = contact?.email ? `mailto:${contact.email}` : '#'
  const whatsappHref = phoneDigits ? `https://wa.me/52${phoneDigits}` : '#'

  const actionBaseClass = compact
    ? 'inline-flex w-full items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition duration-300 sm:w-auto'
    : 'inline-flex w-full items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition duration-300 sm:w-auto'

  const idleButtonClass = compact
    ? 'border-slate-200 bg-white text-slate-700 hover:border-lab-primary/35 hover:text-lab-primary'
    : 'border-slate-200 bg-white text-slate-700 hover:border-lab-primary/35 hover:text-lab-primary'

  const highlightButtonClass = 'border-lab-primary/20 bg-lab-primary/10 text-lab-primary hover:bg-lab-primary hover:text-white'

  return (
    <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
      <a
        href={emailHref}
        className={`${actionBaseClass} ${idleButtonClass}`}
      >
        <Mail className="size-4" aria-hidden="true" />
        Correo
      </a>
      <a
        href={whatsappHref}
        className={`${actionBaseClass} ${highlightButtonClass}`}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        WhatsApp
      </a>
      <button
        type="button"
        onClick={() => onCopyPhone?.(contact)}
        className={`${actionBaseClass} ${copied ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : idleButtonClass}`}
      >
        {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

export default ContactDirectoryActions
