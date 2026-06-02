import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, EmptyState } from '../components/common'
import ContactDirectoryCard from '../features/users/ContactDirectoryCard'
import ContactDirectoryTable from '../features/users/ContactDirectoryTable'
import { contactDirectory } from '../data/contactDirectory'

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat('es-MX').format(Math.max(0, Number(value) || 0))
}

function Usuarios() {
  const [query, setQuery] = useState('')
  const [copiedContactId, setCopiedContactId] = useState(null)
  const copyTimerRef = useRef(null)

  const filteredContacts = useMemo(() => {
    const normalizedQuery = normalizeText(query)

    if (!normalizedQuery) return contactDirectory

    return contactDirectory.filter((contact) => {
      const searchable = normalizeText(
        `${contact.name} ${contact.email} ${contact.branchName} ${contact.observations || ''}`
      )

      return searchable.includes(normalizedQuery)
    })
  }, [query])

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current)
      }
    }
  }, [])

  const handleCopyPhone = async (contact) => {
    const phoneDigits = String(contact?.phone || '').replace(/\D/g, '')
    if (!phoneDigits) return

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(phoneDigits)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = phoneDigits
        textarea.setAttribute('readonly', 'true')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }

      setCopiedContactId(contact.id)
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current)
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopiedContactId(null)
      }, 1800)
    } catch {
      setCopiedContactId(null)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-lab-bg to-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <Link
          to="/"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-lab-primary/20 bg-lab-primary/10 px-4 py-2 text-sm font-semibold text-lab-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-lab-primary hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a Mi Oficina
        </Link>

        <section className="space-y-3">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-lab-text sm:text-4xl">
              Directorio Comercial
            </h1>
            <p className="max-w-2xl text-sm text-lab-muted sm:text-base">
              Encuentra rápidamente al responsable de cada sucursal.
            </p>
          </div>

          <Card className="border-white/70 bg-white/95 p-4 shadow-[0_16px_34px_rgba(15,23,42,0.08)]">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-lab-primary/40 focus-within:ring-4 focus-within:ring-lab-primary/10">
              <Search className="size-4 shrink-0 text-slate-500" aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar nombre, sucursal, correo o cargo..."
                className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>
          </Card>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Resultados</h2>
              <p className="mt-1 text-sm text-slate-500">
                {formatCompactNumber(filteredContacts.length)} contactos encontrados
              </p>
            </div>
          </div>

          {filteredContacts.length === 0 ? (
            <EmptyState
              title="No hay contactos con esos filtros"
              description="Prueba con otro nombre, sucursal, correo o cargo."
              className="bg-white/90"
            />
          ) : (
            <>
              <ContactDirectoryTable
                contacts={filteredContacts}
                copiedContactId={copiedContactId}
                onCopyPhone={handleCopyPhone}
              />

              <div className="grid gap-4 lg:hidden">
                {filteredContacts.map((contact) => (
                  <ContactDirectoryCard
                    key={contact.id}
                    contact={contact}
                    copied={copiedContactId === contact.id}
                    onCopyPhone={handleCopyPhone}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default Usuarios
