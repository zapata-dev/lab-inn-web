import { useMemo, useState } from 'react'
import { Modal } from '../../components/common'
import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'
import { createBranchRequest } from '../../services/requestsService'
import { canCreateRequest } from '../../utils/requestPermissions'

function getUnitLabel(unit) {
  return [unit?.marca || unit?.brand, unit?.modelo || unit?.model, unit?.anio || unit?.year]
    .filter(Boolean)
    .join(' ')
}

function CreateRequestModal({ isOpen, unit, onClose, onCreated }) {
  const { user, isFirebaseMode, isAuthorized } = useAuth()
  const toast = useToast()

  const [comentarioInicial, setComentarioInicial] = useState('')
  const [prioridad, setPrioridad] = useState('normal')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const unitLabel = useMemo(() => getUnitLabel(unit) || 'Unidad seleccionada', [unit])
  const canCreate = isFirebaseMode && isAuthorized && canCreateRequest(user)

  const resetState = () => {
    setComentarioInicial('')
    setPrioridad('normal')
    setSaving(false)
    setError('')
  }

  const handleClose = () => {
    resetState()
    onClose?.()
  }

  const handleCreate = async () => {
    if (!canCreate) {
      setError('Tu usuario no tiene permisos para crear solicitudes en este momento.')
      return
    }

    try {
      setSaving(true)
      setError('')
      const created = await createBranchRequest({
        unit,
        user,
        comentarioInicial,
        prioridad,
      })

      toast.success('Solicitud creada correctamente.')
      onCreated?.(created)
      handleClose()
    } catch (requestError) {
      setError(requestError?.message || 'No se pudo crear la solicitud.')
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Solicitar unidad"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-lab-border px-3 py-2 text-sm font-semibold text-lab-text"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !canCreate}
            className="rounded-lg bg-lab-primary px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Crear solicitud'}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-lab-border bg-slate-50 p-3 text-sm">
          <p className="font-semibold text-lab-text">{unitLabel}</p>
          <p className="text-lab-muted">VIN: {unit?.vin || unit?.VIN || unit?.vinCompleto || unit?.id || 'N/D'}</p>
          <p className="text-lab-muted">
            Sucursal dueña: {unit?.sucursalNombre || unit?.branchName || unit?.ubicacion || unit?.centro || 'N/D'}
          </p>
        </div>

        {!canCreate && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Necesitas modo Firebase y un usuario autorizado para crear solicitudes.
          </p>
        )}

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="space-y-1">
          <label htmlFor="request-comment" className="text-sm font-medium text-lab-text">
            Comentario inicial
          </label>
          <textarea
            id="request-comment"
            rows={3}
            value={comentarioInicial}
            onChange={(event) => setComentarioInicial(event.target.value)}
            placeholder="Contexto comercial de la solicitud"
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm text-lab-text outline-none focus:border-lab-primary"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="request-priority" className="text-sm font-medium text-lab-text">
            Prioridad
          </label>
          <select
            id="request-priority"
            value={prioridad}
            onChange={(event) => setPrioridad(event.target.value)}
            className="w-full rounded-lg border border-lab-border px-3 py-2 text-sm text-lab-text outline-none focus:border-lab-primary"
          >
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>
    </Modal>
  )
}

export default CreateRequestModal
