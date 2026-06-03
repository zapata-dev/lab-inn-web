import { useMemo, useState } from 'react'
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
    label: 'INTELIGENCIA COMERCIAL',
  },
  {
    id: 'crm-salesforce',
    title: 'CRM - Salesforce',
    description: 'Contenido de capacitación y operación para CRM y Salesforce.',
    url: 'https://www.youtube.com/playlist?list=PL2W1hGWz_2scsontjyuroiFs6uKnXE3la',
    accent: 'from-rose-500 via-red-500 to-orange-500',
    dotClass: 'bg-rose-600',
    labelClass: 'text-rose-600',
    label: 'CAPACITACIÓN CRM',
  },
]

function CanalYoutube() {
  const [activePlaylistId, setActivePlaylistId] = useState(playlists[0].id)

  const activePlaylist = useMemo(
    () => playlists.find((playlist) => playlist.id === activePlaylistId) ?? playlists[0],
    [activePlaylistId]
  )

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
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Canal de YouTube</h1>
            <p className="text-base leading-7 text-slate-600 sm:text-lg">
              Selecciona una pestaña para abrir la playlist que necesites.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/70 bg-white/95 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Menú de playlists</p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Dos pestañas, dos enlaces</h2>
              <p className="text-sm leading-6 text-slate-600 sm:text-base">
                Aquí puedes alternar entre las dos playlists de YouTube y abrir la que quieras con un solo clic.
              </p>
            </div>

            <div
              className="inline-flex flex-wrap rounded-2xl border border-slate-200 bg-slate-50 p-1"
              role="tablist"
              aria-label="Playlists de YouTube"
            >
              {playlists.map((playlist) => {
                const isActive = playlist.id === activePlaylistId

                return (
                  <button
                    key={playlist.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActivePlaylistId(playlist.id)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15'
                        : 'text-slate-600 hover:bg-white hover:text-slate-950'
                    }`}
                  >
                    {playlist.title}
                  </button>
                )
              })}
            </div>
          </div>

          <article className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className={`bg-gradient-to-r ${activePlaylist.accent} p-6 text-white sm:p-7`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`size-2.5 rounded-full ${activePlaylist.dotClass}`} />
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
                  {activePlaylist.label}
                </span>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl space-y-2">
                  <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{activePlaylist.title}</h3>
                  <p className="text-sm leading-6 text-white/85 sm:text-base">{activePlaylist.description}</p>
                </div>

                <a
                  href={activePlaylist.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-white/95"
                >
                  Abrir playlist
                  <ExternalLink className="size-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {playlists.map((playlist) => {
                const isActive = playlist.id === activePlaylistId

                return (
                  <button
                    key={playlist.id}
                    type="button"
                    onClick={() => setActivePlaylistId(playlist.id)}
                    className={`flex h-full flex-col rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? 'border-lab-primary bg-lab-primary/5 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`size-2.5 rounded-full ${playlist.dotClass}`} />
                      <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${playlist.labelClass}`}>
                        {playlist.label}
                      </span>
                    </div>

                    <h4 className="mt-4 text-lg font-semibold text-slate-900">{playlist.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{playlist.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lab-primary">
                      Ver esta pestaña
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </span>
                  </button>
                )
              })}
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}

export default CanalYoutube
