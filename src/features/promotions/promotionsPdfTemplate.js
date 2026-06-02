import {
  buildInventoryPdfStyles,
  buildUnitCommercialSheetHtml,
} from '../inventory/inventoryPdfTemplate'
import {
  buildPromotionDifferencesText,
  getPromotionCoverImage,
  getUnitKilometers,
  getUnitVinShort,
} from '../../utils/promotionUtils'
import { getSubempresa } from '../../utils/inventoryUnitUtils'

function formatStamp(now) {
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}${month}${day}-${hours}${minutes}`
}

function formatMoney(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Por confirmar'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildFilterChips(activeFilters) {
  if (!Array.isArray(activeFilters) || activeFilters.length === 0) {
    return '<span class="cover-chip">Todas las promociones vigentes</span>'
  }

  return activeFilters
    .map((item) => `<span class="cover-chip">${escapeHtml(`${item.label}: ${item.value}`)}</span>`)
    .join('')
}

function buildCoverHtml(unitsCount, generatedDate, activeFilters) {
  const chipsHtml = buildFilterChips(activeFilters)

  return `
      <section class="page booklet-cover">
        <header class="booklet-brand-row">
          <div class="booklet-brand">
            <span class="brand-mark">LAB</span>
            <div>
              <h1 class="brand-title">Mi Oficina Virtual</h1>
              <p class="brand-subtitle">Catálogo comercial de promociones</p>
            </div>
          </div>
        </header>

        <h2 class="booklet-title">Catálogo de promociones</h2>

        <div class="booklet-meta-grid">
          <article class="booklet-meta-card">
            <p class="booklet-meta-label">Fecha de generacion</p>
            <p class="booklet-meta-value">${escapeHtml(generatedDate)}</p>
          </article>
          <article class="booklet-meta-card">
            <p class="booklet-meta-label">Unidades incluidas</p>
            <p class="booklet-meta-value">${unitsCount} unidades</p>
          </article>
        </div>

        <section class="booklet-filters">
          <p class="booklet-filters-title">Filtros aplicados</p>
          <div class="booklet-chip-list">${chipsHtml}</div>
        </section>

        <footer class="booklet-disclaimer">
          Información sujeta a disponibilidad y confirmación comercial.
        </footer>
      </section>
  `
}

export function buildPromotionsPdfFileBase(unitsCount, now = new Date()) {
  const total = Number.isFinite(unitsCount) && unitsCount >= 0 ? unitsCount : 0
  return `FICHAS_PROMOCIONES_${formatStamp(now)}_${total}_UNIDADES`
}

export function buildPromotionsPdfFileName(unitsCount, now = new Date()) {
  return `${buildPromotionsPdfFileBase(unitsCount, now)}.pdf`
}

export function buildPromotionsPdfPrintPath(unitsCount = 0) {
  return `/print/promociones/fichas-${Math.max(0, Number(unitsCount) || 0)}`
}

export function buildPromotionSummaryPdfFileName(group, now = new Date()) {
  const safeAgency = String(group?.agency ?? 'SIN_AGENCIA')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
  const safeCode = String(group?.code ?? 'SIN_CODIGO')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase()
  return `RESUMEN_PROMOCION_${safeAgency || 'SIN_AGENCIA'}_${safeCode || 'SIN_CODIGO'}_${formatStamp(now)}.pdf`
}

export function buildPromotionSummaryPdfHtml(group, now = new Date()) {
  const generatedDate = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(now)
  const count = Number(group?.count) || (Array.isArray(group?.units) ? group.units.length : 0)
  const models = Array.isArray(group?.models) ? group.models : []
  const units = Array.isArray(group?.units) ? group.units : []
  const visibleUnits = units.slice(0, 8)
  const additionalUnits = Math.max(0, units.length - visibleUnits.length)
  const promoText = String(group?.promoText ?? '').trim() || 'Por confirmar'
  const representativeUnit = group?.representativeUnit ?? units[0] ?? null
  const coverImage = String(group?.coverImage || getPromotionCoverImage(representativeUnit) || '').trim()
  const differencesText = buildPromotionDifferencesText(group) || 'Sin diferencias relevantes.'

  const unitRowsHtml = visibleUnits.length
    ? visibleUnits
        .map((unit) => {
          const subempresa = String(getSubempresa(unit) ?? '').trim()
          return `
            <tr>
              <td>${escapeHtml(getUnitVinShort(unit))}</td>
              <td>${escapeHtml(getUnitKilometers(unit))}</td>
              <td>${escapeHtml(formatMoney(unit?.precio))}</td>
              <td>${escapeHtml(subempresa || '—')}</td>
            </tr>
          `
        })
        .join('')
    : '<tr><td colspan="4">Sin unidades disponibles</td></tr>'

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="referrer" content="no-referrer" />
    <title>${escapeHtml(buildPromotionSummaryPdfFileName(group, now).replace('.pdf', ''))}</title>
    <style>
${buildInventoryPdfStyles(`
      @page {
        size: letter;
        margin: 10mm;
      }

      body {
        font-size: 10px;
        line-height: 1.2;
      }

      .sheet {
        max-width: none;
        padding: 0;
      }

      .summary-page {
        min-height: 0;
        padding: 5.5mm;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .summary-header {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .summary-grid {
        margin-top: 6px;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 5px;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .summary-cover {
        margin-top: 6px;
        border: 1px solid var(--line);
        border-radius: 12px;
        overflow: hidden;
        height: 200px;
        max-height: 200px;
        background: #f5f7fb;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .summary-cover img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
        display: block;
      }
      .summary-cover-placeholder {
        height: 200px;
        display: grid;
        place-items: center;
        color: var(--muted);
        font-size: 10px;
        font-weight: 600;
        background:
          linear-gradient(135deg, #edf3fb 25%, transparent 25%) -12px 0 / 24px 24px,
          linear-gradient(225deg, #edf3fb 25%, transparent 25%) -12px 0 / 24px 24px,
          linear-gradient(315deg, #edf3fb 25%, transparent 25%) 0px 0 / 24px 24px,
          linear-gradient(45deg, #edf3fb 25%, #f9fbff 25%) 0px 0 / 24px 24px;
      }
      .summary-card {
        border: 1px solid var(--line);
        border-radius: 9px;
        background: #f8fbff;
        padding: 6px 7px;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .summary-label {
        margin: 0;
        color: var(--muted);
        font-size: 8px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .summary-value {
        margin: 2px 0 0;
        font-size: 11px;
        font-weight: 700;
      }
      .summary-section {
        margin-top: 6px;
        border: 1px solid var(--line);
        border-radius: 9px;
        padding: 6px 7px;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .summary-title {
        margin: 0;
        font-size: 9px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--muted);
      }
      .summary-body {
        margin: 3px 0 0;
        font-size: 10px;
        line-height: 1.25;
        color: var(--ink);
      }
      .summary-units-table {
        width: 100%;
        margin-top: 3px;
        border-collapse: collapse;
        table-layout: fixed;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .summary-units-table th,
      .summary-units-table td {
        border-bottom: 1px solid #e7edf6;
        text-align: left;
        padding: 4px 5px;
        font-size: 9px;
        line-height: 1.15;
        vertical-align: top;
      }
      .summary-units-table th {
        color: var(--muted);
        font-size: 8px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .summary-units-extra {
        margin: 4px 0 0;
        font-size: 8px;
        color: var(--muted);
      }
      .summary-commercial-text {
        margin-top: 3px;
        max-height: 45px;
        overflow: hidden;
      }
      .summary-note {
        margin: 4px 0 0;
        font-size: 8px;
        line-height: 1.15;
        color: var(--muted);
      }

      @media print {
        .sheet {
          padding: 0;
        }
        .summary-page {
          box-shadow: none;
          border: 0;
          break-inside: avoid;
          page-break-inside: avoid;
        }
      }
`)}
    </style>
  </head>
  <body>
    <main class="sheet">
      <section class="page summary-page">
        <header class="topbar summary-header">
          <div class="brand">
            <span class="brand-mark">LAB</span>
            <div>
              <h1 class="brand-title">Mi Oficina Virtual</h1>
              <p class="brand-subtitle">Resumen de promoción</p>
            </div>
          </div>
          <div class="meta">
            <p class="meta-date">Generado: ${escapeHtml(generatedDate)}</p>
          </div>
        </header>

        <section class="summary-cover">
          ${
            coverImage
              ? `<img src="${escapeHtml(coverImage)}" alt="Portada de promoción ${escapeHtml(String(group?.code ?? ''))}" loading="lazy" />`
              : '<div class="summary-cover-placeholder">Imagen de portada por confirmar</div>'
          }
        </section>

        <div class="summary-grid">
          <article class="summary-card">
            <p class="summary-label">Agencia</p>
            <p class="summary-value">${escapeHtml(String(group?.agency ?? 'Por confirmar'))}</p>
          </article>
          <article class="summary-card">
            <p class="summary-label">Código</p>
            <p class="summary-value">${escapeHtml(String(group?.code ?? 'Por confirmar'))}</p>
          </article>
          <article class="summary-card">
            <p class="summary-label">Unidades disponibles</p>
            <p class="summary-value">${count}</p>
          </article>
          <article class="summary-card">
            <p class="summary-label">Precio desde</p>
            <p class="summary-value">${escapeHtml(formatMoney(group?.priceFrom))}</p>
          </article>
        </div>

        <section class="summary-section">
          <p class="summary-title">Modelo</p>
          <p class="summary-body">${escapeHtml(models.join(' / ') || 'Por confirmar')}</p>
        </section>

        <section class="summary-section">
          <p class="summary-title">Unidades incluidas</p>
          <table class="summary-units-table">
            <thead>
              <tr>
                <th>VIN corto</th>
                <th>Kilometraje</th>
                <th>Precio</th>
                <th>Subempresa</th>
              </tr>
            </thead>
            <tbody>
              ${unitRowsHtml}
            </tbody>
          </table>
          ${
            additionalUnits > 0
              ? `<p class="summary-units-extra">+ ${additionalUnits} unidades adicionales</p>`
              : ''
          }
        </section>

        <section class="summary-section">
          <p class="summary-title">Diferencias entre unidades</p>
          <p class="summary-body">${escapeHtml(differencesText)}</p>
        </section>

        <section class="summary-section">
          <p class="summary-title">Texto comercial de promoción</p>
          <p class="summary-body summary-commercial-text">${escapeHtml(promoText)}</p>
          <p class="summary-note">Información sujeta a disponibilidad y confirmación comercial.</p>
        </section>
      </section>
    </main>
  </body>
</html>`
}

export function buildPromotionsPdfHtml(units, activeFilters = [], now = new Date()) {
  const list = Array.isArray(units) ? units : []
  const generatedDate = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(now)

  const additionalCss = `
      .booklet-cover {
        min-height: 235mm;
        display: flex;
        flex-direction: column;
      }

      .booklet-brand-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
      }

      .booklet-brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .booklet-title {
        margin: 30px 0 10px;
        font-size: 44px;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .booklet-meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .booklet-meta-card {
        border: 1px solid var(--line);
        border-radius: 12px;
        background: #f8fbff;
        padding: 10px;
      }

      .booklet-meta-label {
        margin: 0;
        color: var(--muted);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .booklet-meta-value {
        margin: 4px 0 0;
        font-size: 16px;
        font-weight: 700;
      }

      .booklet-filters {
        margin-top: 18px;
      }

      .booklet-filters-title {
        margin: 0 0 8px;
        font-size: 12px;
        text-transform: uppercase;
        color: var(--muted);
        letter-spacing: 0.08em;
      }

      .booklet-chip-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .cover-chip {
        border-radius: 999px;
        border: 1px solid #c8daf7;
        background: var(--primary-soft);
        color: var(--primary);
        padding: 5px 10px;
        font-size: 11px;
        font-weight: 600;
      }

      .booklet-disclaimer {
        margin-top: auto;
        border-top: 1px solid var(--line);
        padding-top: 10px;
        color: var(--muted);
        font-size: 11px;
      }

      @media print {
        .booklet-cover {
          page-break-after: always;
          break-after: page;
        }
      }
  `

  const unitsHtml = list
    .map((unit) => buildUnitCommercialSheetHtml(unit, now, { startOnNewPage: true }))
    .join('')

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="referrer" content="no-referrer" />
    <title>${escapeHtml(buildPromotionsPdfFileBase(list.length, now))}</title>
    <style>
${buildInventoryPdfStyles(additionalCss)}
    </style>
  </head>
  <body>
    <main class="sheet">
      ${buildCoverHtml(list.length, generatedDate, activeFilters)}
      ${unitsHtml}
    </main>
  </body>
</html>`
}
