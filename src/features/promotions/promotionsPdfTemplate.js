function formatStamp(now) {
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}${month}${day}-${hours}${minutes}`
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function hasValue(value) {
  const text = String(value ?? '').trim()
  if (!text) return false
  if (text.toLowerCase() === 'undefined') return false
  if (text.toLowerCase() === 'null') return false
  return true
}

function safeText(value, fallback = 'Por confirmar') {
  return hasValue(value) ? String(value).trim() : fallback
}

function formatCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Precio por confirmar'

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

function truncateText(value, maxLength = 90) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3).trim()}...`
}

function getImageSet(unit) {
  const images = [unit.imagenPortada, ...(Array.isArray(unit.imagenesCompletas) ? unit.imagenesCompletas : [])]
    .map((url) => String(url ?? '').trim())
    .filter((url) => /^https?:\/\//i.test(url))
    .filter((url, index, list) => list.indexOf(url) === index)

  return images[0] || ''
}

function buildFilterChips(activeFilters) {
  if (!Array.isArray(activeFilters) || activeFilters.length === 0) {
    return '<span class="chip">Todas las promociones vigentes</span>'
  }

  return activeFilters
    .map((item) => `<span class="chip">${escapeHtml(`${item.label}: ${item.value}`)}</span>`)
    .join('')
}

function buildUnitCard(unit, index) {
  const image = getImageSet(unit)
  const title = `${safeText(unit.marca, 'Sin marca')} ${safeText(unit.modelo, 'Sin modelo')}`

  return `
    <article class="unit-card">
      <div class="card-media-wrap">
        ${
          image
            ? `<img src="${escapeHtml(image)}" alt="Unidad ${index + 1}" class="card-media" loading="lazy" />`
            : '<div class="card-media placeholder">Sin imagen</div>'
        }
      </div>
      <div class="card-body">
        <div class="card-top">
          <h3 class="card-title">${escapeHtml(title)}</h3>
          <span class="card-year">Ano ${escapeHtml(safeText(unit.anio))}</span>
        </div>

        <p class="card-price">${escapeHtml(formatCurrency(unit.precio))}</p>

        <div class="spec-grid">
          <p><strong>Ubicacion:</strong> ${escapeHtml(safeText(unit.ubicacion || unit.ubicacionFisica || unit.centro))}</p>
          <p><strong>Rodada:</strong> ${escapeHtml(safeText(unit.rodada))}</p>
          <p><strong>Motor:</strong> ${escapeHtml(safeText(unit.motor))}</p>
          <p><strong>Transmision:</strong> ${escapeHtml(safeText(unit.transmision))}</p>
        </div>

        <div class="promo-wrap">
          <p class="promo-label">Promocion vigente</p>
          <p class="promo-text">${escapeHtml(truncateText(unit.promocion, 90) || 'Promocion disponible')}</p>
        </div>
      </div>
    </article>
  `
}

export function buildPromotionsPdfFileBase(unitsCount, now = new Date()) {
  const total = Number.isFinite(unitsCount) && unitsCount >= 0 ? unitsCount : 0
  const stamp = formatStamp(now)
  return `CATALOGO_PROMOCIONES_${stamp}_${total}_UNIDADES`
}

export function buildPromotionsPdfFileName(unitsCount, now = new Date()) {
  return `${buildPromotionsPdfFileBase(unitsCount, now)}.pdf`
}

export function buildPromotionsPdfPrintPath(unitsCount = 0) {
  return `/print/promociones/catalogo-${Math.max(0, Number(unitsCount) || 0)}`
}

export function buildPromotionsPdfHtml(units, activeFilters = [], now = new Date()) {
  const list = Array.isArray(units) ? units : []
  const generatedDate = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(now)
  const chipsHtml = buildFilterChips(activeFilters)
  const cardsHtml = list.map((unit, index) => buildUnitCard(unit, index)).join('')

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="referrer" content="no-referrer" />
    <title>${escapeHtml(buildPromotionsPdfFileBase(list.length, now))}</title>
    <style>
      html,
      body {
        margin: 0;
        padding: 0;
      }

      @page {
        size: letter;
        margin: 10mm;
      }

      :root {
        --paper: #ffffff;
        --ink: #102038;
        --muted: #607086;
        --line: #d8e3ef;
        --primary: #0e4ea6;
        --primary-soft: #ebf2ff;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: #edf2f9;
        color: var(--ink);
        font-family: "Avenir Next", "Segoe UI", Arial, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .sheet {
        max-width: 1020px;
        margin: 0 auto;
        padding: 8mm;
      }

      .page {
        background: var(--paper);
        border: 1px solid var(--line);
        border-radius: 16px;
        box-shadow: 0 18px 44px rgba(10, 30, 60, 0.12);
        padding: 12mm;
        break-inside: avoid;
      }

      .page + .page {
        margin-top: 8mm;
      }

      .cover {
        min-height: 235mm;
        display: flex;
        flex-direction: column;
      }

      .cover-brand {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }

      .brand-mark {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: grid;
        place-items: center;
        font-size: 13px;
        font-weight: 700;
        color: #fff;
        background: linear-gradient(145deg, #0f5fc8, #0a3268);
      }

      .brand-text h1 {
        margin: 0;
        font-size: 18px;
      }

      .brand-text p {
        margin: 2px 0 0;
        color: var(--muted);
        font-size: 12px;
      }

      .cover-title {
        margin: 30px 0 10px;
        font-size: 44px;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .cover-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-top: 16px;
      }

      .meta-card {
        border: 1px solid var(--line);
        border-radius: 12px;
        background: #f8fbff;
        padding: 10px;
      }

      .meta-label {
        margin: 0;
        color: var(--muted);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .meta-value {
        margin: 4px 0 0;
        font-size: 16px;
        font-weight: 700;
      }

      .filters-wrap {
        margin-top: 20px;
      }

      .filters-title {
        margin: 0 0 8px;
        font-size: 12px;
        text-transform: uppercase;
        color: var(--muted);
        letter-spacing: 0.08em;
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .chip {
        border-radius: 999px;
        border: 1px solid #c8daf7;
        background: var(--primary-soft);
        color: var(--primary);
        padding: 5px 10px;
        font-size: 11px;
        font-weight: 600;
      }

      .cover-note {
        margin-top: auto;
        border-top: 1px solid var(--line);
        padding-top: 10px;
        color: var(--muted);
        font-size: 11px;
      }

      .catalog-title {
        margin: 0;
        font-size: 20px;
      }

      .catalog-subtitle {
        margin: 4px 0 0;
        color: var(--muted);
        font-size: 12px;
      }

      .cards-grid {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .unit-card {
        border: 1px solid var(--line);
        border-radius: 14px;
        overflow: hidden;
        background: #fff;
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .card-media-wrap {
        height: 108px;
        background: #eef3fb;
      }

      .card-media {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .card-media.placeholder {
        display: grid;
        place-items: center;
        height: 100%;
        color: var(--muted);
        font-size: 12px;
      }

      .card-body {
        padding: 9px;
      }

      .card-top {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        align-items: flex-start;
      }

      .card-title {
        margin: 0;
        font-size: 14px;
        line-height: 1.2;
      }

      .card-year {
        white-space: nowrap;
        font-size: 11px;
        color: var(--muted);
      }

      .card-price {
        margin: 7px 0 8px;
        color: var(--primary);
        font-size: 20px;
        font-weight: 800;
      }

      .spec-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 4px 8px;
      }

      .spec-grid p {
        margin: 0;
        font-size: 11px;
        color: #2a3f58;
      }

      .promo-wrap {
        margin-top: 8px;
        border-radius: 10px;
        border: 1px solid #c9e6d8;
        background: #ecf9f2;
        padding: 7px;
      }

      .promo-label {
        margin: 0;
        font-size: 10px;
        text-transform: uppercase;
        color: #1f7d4f;
        letter-spacing: 0.07em;
        font-weight: 700;
      }

      .promo-text {
        margin: 3px 0 0;
        font-size: 11px;
        color: #1a4f35;
        line-height: 1.35;
      }

      .catalog-footer {
        margin-top: 12px;
        border-top: 1px solid var(--line);
        padding-top: 8px;
        color: var(--muted);
        font-size: 10px;
        text-align: center;
      }

      @media print {
        body {
          background: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .sheet {
          max-width: none;
          margin: 0;
          padding: 0;
        }

        .page {
          box-shadow: none;
          border-radius: 0;
        }

        .page + .page {
          page-break-before: always;
          margin-top: 0;
        }
      }
    </style>
  </head>
  <body>
    <main class="sheet">
      <section class="page cover">
        <header class="cover-brand">
          <span class="brand-mark">LAB</span>
          <div class="brand-text">
            <h1>Mi Oficina Virtual</h1>
            <p>Catalogo comercial de promociones</p>
          </div>
        </header>

        <h2 class="cover-title">Catalogo de Promociones</h2>

        <div class="cover-meta">
          <article class="meta-card">
            <p class="meta-label">Fecha de generacion</p>
            <p class="meta-value">${escapeHtml(generatedDate)}</p>
          </article>
          <article class="meta-card">
            <p class="meta-label">Unidades incluidas</p>
            <p class="meta-value">${list.length} unidades</p>
          </article>
        </div>

        <section class="filters-wrap">
          <p class="filters-title">Filtros aplicados</p>
          <div class="chips">${chipsHtml}</div>
        </section>

        <p class="cover-note">Documento generado desde Mi Oficina Virtual LAB para uso comercial.</p>
      </section>

      <section class="page">
        <header>
          <h2 class="catalog-title">Unidades en promocion</h2>
          <p class="catalog-subtitle">Listado filtrado al momento de la exportacion</p>
        </header>

        <section class="cards-grid">
          ${cardsHtml}
        </section>

        <footer class="catalog-footer">
          Informacion sujeta a disponibilidad y confirmacion comercial.
        </footer>
      </section>
    </main>
  </body>
</html>`
}
