import { FileDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import ConfirmModal from '../../components/common/ConfirmModal'
import {
  buildPromotionsPdfFileBase,
  buildPromotionsPdfFileName,
  buildPromotionsPdfHtml,
  buildPromotionsPdfPrintPath,
} from './promotionsPdfTemplate'

function waitForImages(printWindow) {
  const images = Array.from(printWindow.document.images || [])
  const waiting = images.map((image) => {
    if (image.complete) return Promise.resolve()

    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true })
      image.addEventListener('error', resolve, { once: true })
    })
  })

  return Promise.all(waiting)
}

function ExportPromotionsPdfButton({ units, activeChips, disabled = false }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState('')

  const totalUnits = Array.isArray(units) ? units.length : 0
  const isDisabled = disabled || totalUnits === 0
  const filtersForPdf = useMemo(() => (Array.isArray(activeChips) ? activeChips : []), [activeChips])
  const showLargeWarning = totalUnits > 25

  const handleConfirmExport = async () => {
    if (isDisabled || isExporting) return

    setIsExporting(true)
    setExportMessage('')

    try {
      const now = new Date()
      const fileName = buildPromotionsPdfFileName(totalUnits, now)
      const fileBase = buildPromotionsPdfFileBase(totalUnits, now)
      const html = buildPromotionsPdfHtml(units, filtersForPdf, now)
      const printWindow = window.open('', '_blank')

      if (!printWindow) {
        setExportMessage('No se pudo abrir la ventana de impresión. Revisa el bloqueador de ventanas.')
        setIsExporting(false)
        return
      }

      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()

      try {
        printWindow.history.replaceState({}, '', buildPromotionsPdfPrintPath(totalUnits))
      } catch (error) {
        // Ignore history API failures in restrictive contexts.
      }

      printWindow.document.title = fileBase

      printWindow.addEventListener('load', () => {
        printWindow.document.title = fileBase

        waitForImages(printWindow)
          .catch(() => null)
          .finally(() => {
            const closeAfterPrint = () => {
              setTimeout(() => {
                if (!printWindow.closed) printWindow.close()
              }, 300)
            }

            printWindow.addEventListener('afterprint', closeAfterPrint, { once: true })
            printWindow.focus()
            printWindow.print()
          })
      })

      setTimeout(() => {
        if (!printWindow.closed) {
          printWindow.document.title = fileName.replace('.pdf', '')
        }
      }, 150)

      setIsConfirmOpen(false)
    } finally {
      setIsExporting(false)
    }
  }

  const confirmDescription = showLargeWarning
    ? `Se generará un PDF con fichas completas de ${totalUnits} unidades filtradas. Este archivo puede tener varias páginas. ¿Deseas continuar?\n\nEste PDF puede tardar en generarse por la cantidad de unidades.`
    : `Se generará un PDF con fichas completas de ${totalUnits} unidades filtradas. Este archivo puede tener varias páginas. ¿Deseas continuar?`

  return (
    <>
      <div className="flex w-full flex-col items-stretch gap-1">
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          disabled={isDisabled}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lab-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-lab-primary/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FileDown className="size-4" aria-hidden="true" />
          Exportar fichas PDF
        </button>

        {isDisabled ? (
          <p className="text-xs font-medium text-lab-muted">No hay unidades para exportar.</p>
        ) : null}

        {exportMessage ? <p className="text-xs font-medium text-rose-600">{exportMessage}</p> : null}
      </div>

      <ConfirmModal
        open={isConfirmOpen}
        title="Exportar catálogo de promociones"
        description={confirmDescription}
        confirmText="Generar fichas PDF"
        cancelText="Cancelar"
        loading={isExporting}
        onCancel={() => {
          if (!isExporting) setIsConfirmOpen(false)
        }}
        onConfirm={handleConfirmExport}
      />
    </>
  )
}

export default ExportPromotionsPdfButton

