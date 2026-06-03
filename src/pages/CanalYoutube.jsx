import { ArrowLeft, ExternalLink, PlayCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const playlists = [
  {
    id: 'asistentes-virtuales',
    title: 'Asistentes Virtuales',
    description: 'Capacitaciones y recursos sobre asistentes virtuales comerciales.',
    url: 'https://www.youtube.com/playlist?list=PL2W1hGWz_2sdYXVO0WdA6KQKffN7C1VqC',
    accent: 'from-sky-500 via-blue-600 to-indigo-600',
    dotClass: 'bg-blue-600',
    labelClass: 'text-blue-600',
    label: 'Inteligencia Comercial',
  },
  {
    id: 'crm-salesforce',
    title: 'CRM - Salesforce',
    description: 'Contenido de capacitaci?n y operaci?n para CRM y Salesforce.',
    url: 'https://www.youtube.com/playlist?list=PL2W1hGWz_2scsontjyuroiFs6uKnXE3la',
    accent: 'from-rose-500 via-red-500 to-orange-500',
    dotClass: 'bg-rose-600',
    labelClass: 'text-rose-600',
    label: 'Capacitaci?n CRM',
  },
]

function CanalYoutube() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 text-lab-text">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-lab-primary hover:text-lab-primary"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Volver a Mi Oficina
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
              <PlayCircle className="size-4" aria-hidden="true" />
              Canal de YouTube
            </div>
          </div>

          <div className="mt-5 max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Canal de YouTube
            </h1>
            <p className="text-base leading-7 text-slate-600 sm:text-lg">
              Selecciona una playlist de capacitaci?n para continuar.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2">
          {playlists.map((playlist) => (
            <a
              key={playlist.id}
              href={playlist.url}
              target="_blank"
              rel="noreferrer"
              className="group block h-full overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex h-full flex-col p-6 sm:p-7">
                <div
                  className={`inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br ${playlist.accent} text-white shadow-lg shadow-slate-200`}
                >
                  <PlayCircle className="size-7" aria-hidden="true" />
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <span className={`size-2.5 rounded-full ${playlist.dotClass}`} />
                  <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${playlist.labelClass}`}>
                    {playlist.label}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {playlist.title}
                  </h2>
                  <p className="text-sm leading-6 text-slate-600 sm:text-base">
                    {playlist.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700 transition group-hover:text-lab-primary">
                  Ver playlist
                  <ExternalLink className="size-4" aria-hidden="true" />
                </div>
              </div>
            </a>
          ))}
        </section>
      </div>
    </main>
  )
}

export default CanalYoutube
