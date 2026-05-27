import {
  buildInventoryPdfStyles,
  buildUnitCommercialSheetHtml,
} from '../inventory/inventoryPdfTemplate'

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
              <p class="brand-subtitle">Catalogo comercial de promociones</p>
            </div>
          </div>
        </header>

        <h2 class="booklet-title">Catalogo de promociones</h2>

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
          Informacion sujeta a disponibilidad y confirmacion comercial.
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
  const motors = Array.isArray(group?.motors) ? group.motors : []
  const rodadas = Array.isArray(group?.rodadas) ? group.rodadas : []
  const pasos = Array.isArray(group?.pasos) ? group.pasos : []
  const years = Array.isArray(group?.years) ? group.years : []
  const promoText = String(group?.promoText ?? '').trim() || 'Por confirmar'

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="referrer" content="no-referrer" />
    <title>${escapeHtml(buildPromotionSummaryPdfFileName(group, now).replace('.pdf', ''))}</title>
    <style>
${buildInventoryPdfStyles(`
      .summary-page {
        min-height: 235mm;
      }
      .summary-grid {
        margin-top: 14px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .summary-card {
        border: 1px solid var(--line);
        border-radius: 12px;
        background: #f8fbff;
        padding: 10px;
      }
      .summary-label {
        margin: 0;
        color: var(--muted);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .summary-value {
        margin: 4px 0 0;
        font-size: 15px;
        font-weight: 700;
      }
      .summary-section {
        margin-top: 12px;
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 10px;
      }
      .summary-title {
        margin: 0;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--muted);
      }
      .summary-body {
        margin: 6px 0 0;
        font-size: 13px;
        line-height: 1.45;
        color: var(--ink);
      }
`)}
    </style>
  </head>
  <body>
    <main class="sheet">
      <section class="page summary-page">
        <header class="topbar">
          <div class="brand">
            <span class="brand-mark">LAB</span>
            <div>
              <h1 class="brand-title">Mi Oficina Virtual</h1>
              <p class="brand-subtitle">Resumen de promocion</p>
            </div>
          </div>
          <div class="meta">
            <p class="meta-date">Generado: ${escapeHtml(generatedDate)}</p>
          </div>
        </header>

        <div class="summary-grid">
          <article class="summary-card">
            <p class="summary-label">Agencia</p>
            <p class="summary-value">${escapeHtml(String(group?.agency ?? 'Por confirmar'))}</p>
          </article>
          <article class="summary-card">
            <p class="summary-label">Codigo</p>
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
          <p class="summary-title">Modelos</p>
          <p class="summary-body">${escapeHtml(models.join(' / ') || 'Por confirmar')}</p>
        </section>

        <section class="summary-section">
          <p class="summary-title">Diferencias entre unidades</p>
          <p class="summary-body">
            ${escapeHtml(years.length ? `Años: ${years.join(' / ')}` : 'Años: Por confirmar')}<br/>
            ${escapeHtml(motors.length ? `Motores: ${motors.join(' / ')}` : 'Motores: Por confirmar')}<br/>
            ${escapeHtml(rodadas.length ? `Rodadas: ${rodadas.join(' / ')}` : 'Rodadas: Por confirmar')}<br/>
            ${escapeHtml(pasos.length ? `Pasos: ${pasos.join(' / ')}` : 'Pasos: Por confirmar')}
          </p>
        </section>

        <section class="summary-section">
          <p class="summary-title">Texto comercial de promocion</p>
          <p class="summary-body">${escapeHtml(promoText)}</p>
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
