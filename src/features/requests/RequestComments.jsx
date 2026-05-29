import { useState } from 'react'

function formatDate(value) {
  if (!value) return 'Sin fecha'

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed)
}

function RequestComments({ comments, canComment, onSubmit, saving }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    const normalized = text.trim()
    if (!normalized) {
      setError('Escribe un comentario antes de guardar.')
      return
    }

    try {
      setError('')
      await onSubmit?.(normalized)
      setText('')
    } catch (submitError) {
      setError(submitError?.message || 'No se pudo guardar el comentario.')
    }
  }

  return (
    <section className="space-y-3">
      <h4 className="text-sm font-semibold text-lab-text">Comentarios</h4>

      {comments.length > 0 ? (
        <ul className="space-y-2">
          {comments.map((comment) => (
            <li key={comment.comentarioId} className="rounded-lg border border-lab-border bg-white px-3 py-2">
              <p className="text-xs font-semibold text-lab-text">
                {comment.autorNombre || comment.autorEmail || 'Usuario'}
                <span className="ml-1 font-normal text-lab-muted">({comment.autorRol || 'sin rol'})</span>
              </p>
              <p className="mt-1 text-sm text-lab-text">{comment.texto}</p>
              <p className="mt-1 text-[11px] text-lab-muted">{formatDate(comment.createdAt)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-lab-border bg-slate-50 px-3 py-2 text-xs text-lab-muted">
          Aun no hay comentarios.
        </p>
      )}

      {canComment ? (
        <div className="space-y-2">
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <textarea
            rows={3}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Escribe un comentario"
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm text-lab-text outline-none focus:border-lab-primary"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-lab-primary px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Agregar comentario'}
          </button>
        </div>
      ) : (
        <p className="text-xs text-lab-muted">No tienes permisos para comentar esta solicitud.</p>
      )}
    </section>
  )
}

export default RequestComments
