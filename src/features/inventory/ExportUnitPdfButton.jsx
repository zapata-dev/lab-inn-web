import { FileDown } from 'lucide-react'
import {
  buildInventoryPdfFileBase,
  buildInventoryPdfFileName,
  buildInventoryPdfPrintPath,
  buildInventoryPdfStyles,
  buildUnitCommercialSheetHtml,
} from './inventoryPdfTemplate'

function toSafeImage(value) {
  const text = String(value ?? '').trim()
  return /^https?:\/\//i.test(text) ? text : ''
}

function mapUnitToCommercialShape(unit) {
  const source = unit ?? {}
  const galleryFromArray = Array.isArray(source.imagenesCompletas)
    ? source.imagenesCompletas
    : Array.isArray(source.images)
      ? source.images
      : []
  const mappedGallery = galleryFromArray.map(toSafeImage).filter(Boolean)
  const mappedCover = toSafeImage(source.imagenPortada) || toSafeImage(source.coverImage) || mappedGallery[0] || ''

  return {
    ...source,
    marca: source.marca ?? source.brand ?? '',
    modelo: source.modelo ?? source.model ?? '',
    anio: source.anio ?? source.year ?? '',
    precio: source.precio ?? source.price ?? source.priceUsd ?? null,
    kilometros: source.kilometros ?? source.mileageKm ?? null,
    motor: source.motor ?? source.engine ?? '',
    transmision: source.transmision ?? source.transmission ?? '',
    color: source.color ?? '',
    ubicacion: source.ubicacion ?? source.location ?? source.branchName ?? source.branchId ?? '',
    centro: source.centro ?? source.branchId ?? '',
    vin: source.vin ?? source.id ?? '',
    vinCompleto: source.vinCompleto ?? source.vin ?? source.id ?? '',
    status: source.status ?? 'Disponible',
    promocion: source.promocion ?? source.promotion ?? '',
    subempresa: source.subempresa ?? '',
    configuracion: source.configuracion ?? source.configuration ?? '',
    imagenPortada: mappedCover,
    imagenesCompletas: mappedGallery,
  }
}

function buildSingleUnitPdfHtml(unit, now = new Date()) {
  const printableUnit = mapUnitToCommercialShape(unit)

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="referrer" content="no-referrer" />
    <title>${buildInventoryPdfFileBase(unit, now)}</title>
    <style>
${buildInventoryPdfStyles()}
    </style>
  </head>
  <body>
    <main class="sheet">
      ${buildUnitCommercialSheetHtml(printableUnit, now)}
    </main>
  </body>
</html>`
}

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

function ExportUnitPdfButton({ unit, variant = 'button', fullWidth = false }) {
  const isDisabled = !unit

  const handleExport = () => {
    if (!unit) return

    const printableUnit = mapUnitToCommercialShape(unit)
    const now = new Date()
    const fileName = buildInventoryPdfFileName(printableUnit, now)
    const fileBase = buildInventoryPdfFileBase(printableUnit, now)
    const html = buildSingleUnitPdfHtml(printableUnit, now)
    const printWindow = window.open('', '_blank')

    if (!printWindow) return

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()

    try {
      printWindow.history.replaceState({}, '', buildInventoryPdfPrintPath(printableUnit))
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
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleExport}
        disabled={isDisabled}
        aria-label="Exportar ficha PDF"
        className="inline-flex size-9 items-center justify-center rounded-lg border border-lab-primary/25 bg-lab-primary/10 text-lab-primary transition-colors hover:bg-lab-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FileDown className="size-4" aria-hidden="true" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isDisabled}
      className={`${fullWidth ? 'w-full' : ''} rounded-xl border border-lab-primary/20 bg-lab-primary/5 px-4 py-2.5 text-sm font-semibold text-lab-primary transition-colors duration-200 hover:bg-lab-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-60`}
    >
      Exportar ficha PDF
    </button>
  )
}

export default ExportUnitPdfButton
