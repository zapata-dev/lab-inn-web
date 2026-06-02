const CONTACT_EMAIL = 'innovaciogoon@zapata.com.mx'

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

function toText(value, fallback = 'Por confirmar') {
  return hasValue(value) ? String(value).trim() : fallback
}

function toOptionalText(value) {
  return hasValue(value) ? String(value).trim() : ''
}

function formatMoney(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Por confirmar'
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatKm(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Por confirmar'
  return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(value)} km`
}

function getPrice(unit) {
  return hasValue(unit.precioFormatted) ? String(unit.precioFormatted).trim() : formatMoney(unit.precio)
}

function getKilometers(unit) {
  return hasValue(unit.kilometrosFormatted) ? String(unit.kilometrosFormatted).trim() : formatKm(unit.kilometros)
}

function getLocation(unit) {
  return toText(unit.ubicacionFisica || unit.ubicacion || unit.centro)
}

function getStatus(unit) {
  const status = toOptionalText(unit.status)
  return status ? status.replaceAll('_', ' ') : 'Disponible'
}

function getVinShort(unit) {
  if (hasValue(unit.vin)) return String(unit.vin).trim()
  if (!hasValue(unit.vinCompleto)) return ''
  const fullVin = String(unit.vinCompleto).trim()
  return fullVin.length > 8 ? fullVin.slice(-8) : fullVin
}

function toSafeImage(url) {
  const text = String(url ?? '').trim()
  return /^https?:\/\//i.test(text) ? text : ''
}

function getImageSet(unit) {
  const images = Array.isArray(unit.imagenesCompletas) ? unit.imagenesCompletas : []
  const merged = [unit.imagenPortada, ...images]
    .map(toSafeImage)
    .filter(Boolean)
    .filter((url, index, list) => list.indexOf(url) === index)

  return {
    cover: merged[0] || '',
    gallery: merged.slice(0, 6),
  }
}

function normalizeToken(value, fallback = 'POR_CONFIRMAR') {
  const base = String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')

  return base || fallback
}

function normalizeModelToken(value) {
  const base = normalizeToken(value, 'SIN_MODELO')
  return base.replaceAll('_', '')
}

function buildStamp(now) {
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}${month}${day}-${hours}${minutes}`
}

function specRow(label, value) {
  return `
    <div class="spec-row">
      <span class="spec-label">${escapeHtml(label)}</span>
      <span class="spec-value">${escapeHtml(toText(value))}</span>
    </div>
  `
}

export function buildInventoryPdfFileBase(unit, now = new Date()) {
  const brand = normalizeToken(unit?.marca, 'SIN_MARCA')
  const model = normalizeModelToken(unit?.modelo)
  const year = normalizeToken(unit?.anio, 'SIN_ANO')
  const vin = normalizeToken(getVinShort(unit), 'SIN_VIN')
  const stamp = buildStamp(now)

  return `FICHA_COMERCIAL_${brand}_${model}_${year}_${vin}_${stamp}`
}

export function buildInventoryPdfFileName(unit, now = new Date()) {
  return `${buildInventoryPdfFileBase(unit, now)}.pdf`
}

export function buildInventoryPdfPrintPath(unit) {
  return `/print/${normalizeToken(unit?.marca, 'UNIDAD').toLowerCase()}/${normalizeToken(unit?.modelo, 'FICHA').toLowerCase()}`
}

function buildCatalogFilterChips(activeFilters) {
  if (!Array.isArray(activeFilters) || activeFilters.length === 0) {
    return '<span class="catalog-chip">Sin filtros aplicados</span>'
  }

  return activeFilters
    .map((item) => `<span class="catalog-chip">${escapeHtml(`${item.label}: ${item.value}`)}</span>`)
    .join('')
}

function buildCatalogCoverHtml(unitsCount, generatedDate, activeFilters) {
  return `
      <section class="page catalog-cover">
        <header class="catalog-brand-row">
          <div class="brand">
            <span class="brand-mark">LAB</span>
            <div>
              <h1 class="brand-title">Mi Oficina Virtual</h1>
              <p class="brand-subtitle">Catálogo de inventario nacional</p>
            </div>
          </div>
          <div class="meta">
            <p class="meta-date">Generado: ${escapeHtml(generatedDate)}</p>
          </div>
        </header>

        <h2 class="catalog-title">Catálogo comercial de unidades</h2>

        <div class="catalog-meta-grid">
          <article class="catalog-meta-card">
            <p class="catalog-meta-label">Unidades incluidas</p>
            <p class="catalog-meta-value">${unitsCount}</p>
          </article>
          <article class="catalog-meta-card">
            <p class="catalog-meta-label">Contacto comercial</p>
            <p class="catalog-meta-value">${escapeHtml(CONTACT_EMAIL)}</p>
          </article>
        </div>

        <section class="catalog-filters">
          <p class="catalog-filters-title">Filtros aplicados</p>
          <div class="catalog-chip-list">${buildCatalogFilterChips(activeFilters)}</div>
        </section>

        <footer class="catalog-disclaimer">
          Información sujeta a disponibilidad y confirmación comercial.
        </footer>
      </section>
  `
}

export function buildInventoryCatalogPdfFileBase(unitsCount, now = new Date()) {
  const total = Number.isFinite(unitsCount) && unitsCount >= 0 ? unitsCount : 0
  return `CATALOGO_INVENTARIO_${buildStamp(now)}_${total}_UNIDADES`
}

export function buildInventoryCatalogPdfFileName(unitsCount, now = new Date()) {
  return `${buildInventoryCatalogPdfFileBase(unitsCount, now)}.pdf`
}

export function buildInventoryCatalogPdfPrintPath(unitsCount = 0) {
  return `/print/inventario/catalogo-${Math.max(0, Number(unitsCount) || 0)}`
}

export function buildInventoryPdfStyles(additionalCss = '') {
  return `
      html,
      body {
        margin: 0;
        padding: 0;
      }

      @page {
        size: letter;
        margin: 0;
      }

      :root {
        --bg: #eaf0f8;
        --paper: #ffffff;
        --ink: #101f35;
        --muted: #607086;
        --line: #d6e0ec;
        --primary: #0e4ea6;
        --primary-soft: #ebf2ff;
      }

      * {
        box-sizing: border-box;
      }

      body {
        background: var(--bg);
        color: var(--ink);
        font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .sheet {
        width: 100%;
        max-width: 960px;
        margin: 0 auto;
        padding: 10mm;
      }

      .page {
        background: var(--paper);
        border-radius: 18px;
        border: 1px solid var(--line);
        box-shadow: 0 20px 48px rgba(12, 32, 65, 0.12);
        padding: 12mm;
        break-inside: avoid;
      }

      .page + .page {
        margin-top: 8mm;
      }

      .unit-sheet {
        break-before: page;
        page-break-before: always;
      }

      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .brand-mark {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: linear-gradient(145deg, #0f5fc8, #0a3268);
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 13px;
        font-weight: 700;
      }

      .brand-title {
        margin: 0;
        font-size: 18px;
      }

      .brand-subtitle {
        margin: 2px 0 0;
        font-size: 12px;
        color: var(--muted);
      }

      .meta {
        text-align: right;
      }

      .meta-date {
        margin: 0;
        font-size: 11px;
        color: var(--muted);
      }

      .status {
        margin-top: 6px;
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid #c7dbff;
        background: #e9f2ff;
        color: #164f97;
        font-size: 11px;
        font-weight: 700;
      }

      .hero {
        margin-top: 10px;
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid #cbdae9;
        min-height: 470px;
      }

      .hero-image {
        width: 100%;
        height: 470px;
        object-fit: cover;
        display: block;
      }

      .hero-placeholder {
        width: 100%;
        height: 470px;
        display: grid;
        place-items: center;
        color: var(--muted);
        background:
          linear-gradient(135deg, #edf3fb 25%, transparent 25%) -12px 0 / 24px 24px,
          linear-gradient(225deg, #edf3fb 25%, transparent 25%) -12px 0 / 24px 24px,
          linear-gradient(315deg, #edf3fb 25%, transparent 25%) 0px 0 / 24px 24px,
          linear-gradient(45deg, #edf3fb 25%, #f9fbff 25%) 0px 0 / 24px 24px;
      }

      .hero-shade {
        position: absolute;
        inset: 0;
        background:
          linear-gradient(175deg, rgba(6, 18, 33, 0.05) 0%, rgba(6, 18, 33, 0.75) 72%),
          linear-gradient(55deg, rgba(14, 78, 166, 0.26) 0%, transparent 42%);
      }

      .hero-title-wrap {
        position: absolute;
        left: 16px;
        right: 16px;
        bottom: 16px;
        color: #fff;
      }

      .hero-title {
        margin: 0;
        font-size: 35px;
        line-height: 1.02;
        letter-spacing: -0.01em;
        text-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
      }

      .hero-subtitle {
        margin: 7px 0 0;
        font-size: 13px;
        opacity: 0.93;
      }

      .info-panel {
        position: absolute;
        right: 16px;
        top: 16px;
        width: 40%;
        min-width: 240px;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.25);
        background: rgba(7, 20, 36, 0.64);
        backdrop-filter: blur(6px);
        color: #fff;
        padding: 12px;
      }

      .unit-label {
        margin: 0;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        opacity: 0.85;
      }

      .unit-price {
        margin: 6px 0 0;
        font-size: 44px;
        line-height: 0.98;
        font-weight: 800;
        letter-spacing: -0.02em;
      }

      .vin {
        margin: 7px 0 0;
        font-size: 12px;
        opacity: 0.88;
      }

      .key-grid {
        margin-top: 11px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }

      .key-card {
        border: 1px solid #d8e4f3;
        border-radius: 10px;
        background: #f8fbff;
        padding: 9px;
      }

      .key-label {
        margin: 0;
        font-size: 11px;
        color: var(--muted);
      }

      .key-value {
        margin: 4px 0 0;
        font-size: 13px;
        font-weight: 700;
      }

      .cta {
        margin-top: 9px;
        border: 1px solid #cee0ff;
        border-radius: 12px;
        background: var(--primary-soft);
        padding: 10px 12px;
      }

      .cta-title {
        margin: 0;
        font-size: 12px;
        color: #1a3661;
      }

      .cta-email {
        margin: 4px 0 0;
        font-size: 15px;
        color: var(--primary);
        font-weight: 700;
      }

      .section-eyebrow {
        margin: 0;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .page-two-layout {
        margin-top: 9px;
        display: grid;
        grid-template-columns: 66% 34%;
        gap: 9px;
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .gallery-tile {
        margin: 0;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--line);
        min-height: 132px;
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .gallery-tile-main {
        grid-column: span 2;
        min-height: 236px;
      }

      .gallery-grid-compact .gallery-tile {
        min-height: 106px;
      }

      .gallery-grid-compact .gallery-tile-main {
        grid-column: auto;
        min-height: 106px;
      }

      .gallery-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .gallery-empty {
        border: 1px dashed var(--line);
        border-radius: 12px;
        min-height: 282px;
        display: grid;
        place-items: center;
        text-align: center;
        color: var(--muted);
        padding: 16px;
      }

      .spec-card {
        border: 1px solid var(--line);
        border-radius: 12px;
        background: #fbfdff;
        padding: 10px;
      }

      .spec-row {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        padding: 5px 0;
        border-bottom: 1px solid #e9eef7;
      }

      .spec-row:last-child {
        border-bottom: 0;
      }

      .spec-label {
        font-size: 11px;
        color: var(--muted);
      }

      .spec-value {
        max-width: 58%;
        text-align: right;
        font-size: 11px;
        font-weight: 700;
      }

      .corp-footer {
        margin-top: 10px;
        border-top: 1px solid #dce5f1;
        padding-top: 8px;
        display: flex;
        justify-content: space-between;
        gap: 10px;
      }

      .corp-left {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .corp-mark {
        width: 24px;
        height: 24px;
        border-radius: 7px;
        background: linear-gradient(145deg, #0f5fc8, #0a3268);
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 9px;
        font-weight: 700;
      }

      .corp-title {
        margin: 0;
        font-size: 11px;
        font-weight: 700;
      }

      .corp-subtitle {
        margin: 1px 0 0;
        font-size: 10px;
        color: var(--muted);
      }

      .corp-right {
        text-align: right;
        color: var(--muted);
        font-size: 9px;
        line-height: 1.35;
      }

      @media print {
        body {
          background: #fff;
        }

        .sheet {
          max-width: none;
          margin: 0;
          padding: 8mm;
        }

        .page {
          box-shadow: none;
          border-radius: 0;
          border-color: transparent;
          padding: 8mm;
        }

        .page + .page {
          margin-top: 0;
          page-break-before: always;
        }
      }

      ${additionalCss}
  `
}

export function buildUnitCommercialSheetHtml(unit, now = new Date(), options = {}) {
  const generatedDate = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(now)
  const brand = toText(unit?.marca)
  const model = toText(unit?.modelo)
  const year = toText(unit?.anio)
  const status = getStatus(unit)
  const price = getPrice(unit)
  const location = getLocation(unit)
  const vinShort = getVinShort(unit) || 'Por confirmar'
  const { cover, gallery } = getImageSet(unit || {})

  const keyCards = [
    { label: 'Kilometraje', value: getKilometers(unit || {}) },
    { label: 'Motor', value: toText(unit?.motor) },
    { label: 'Transmisión', value: toText(unit?.transmision) },
    { label: 'Ubicación', value: location },
    { label: 'Paso', value: toText(unit?.paso) },
    { label: 'Rodada', value: toText(unit?.rodada) },
  ]

  const isCompactGallery = gallery.length >= 6
  const galleryGridClass = isCompactGallery ? 'gallery-grid gallery-grid-compact' : 'gallery-grid'

  const specs = [
    specRow('Color exterior', unit?.color),
    specRow('Color interior', unit?.colorInterior),
    specRow('Eje delantero', unit?.ejeDelantero),
    specRow('Eje trasero', unit?.ejeTrasero),
    specRow('Dormitorio', unit?.dormitorio),
    specRow('Subempresa', unit?.subempresa),
    specRow('Centro', unit?.centro),
    specRow('VIN corto', vinShort),
    specRow('VIN completo', unit?.vinCompleto),
    specRow('Promoción', unit?.promocion),
  ].join('')

  const galleryHtml = gallery
    .map((imageUrl, index) => {
      const classes = !isCompactGallery && index === 0 ? 'gallery-tile gallery-tile-main' : 'gallery-tile'
      return `
        <figure class="${classes}">
          <img src="${escapeHtml(imageUrl)}" alt="Vista ${index + 1} de la unidad" class="gallery-image" loading="lazy" />
        </figure>
      `
    })
    .join('')

  const firstPageClasses = ['page']
  if (options.startOnNewPage) firstPageClasses.push('unit-sheet')
  if (options.firstPageClassName) firstPageClasses.push(options.firstPageClassName)

  const secondPageClasses = ['page']
  if (options.secondPageClassName) secondPageClasses.push(options.secondPageClassName)

  return `
      <section class="${firstPageClasses.join(' ')}">
        <header class="topbar">
          <div class="brand">
            <span class="brand-mark">LAB</span>
            <div>
              <h1 class="brand-title">Mi Oficina Virtual</h1>
              <p class="brand-subtitle">Ficha comercial de unidad</p>
            </div>
          </div>
          <div class="meta">
            <p class="meta-date">Generado: ${escapeHtml(generatedDate)}</p>
            <span class="status">${escapeHtml(status)}</span>
          </div>
        </header>

        <section class="hero">
          ${
            cover
              ? `
            <img src="${escapeHtml(cover)}" alt="Imagen principal de la unidad" class="hero-image" />
            <div class="hero-shade"></div>
            <div class="hero-title-wrap">
              <h2 class="hero-title">${escapeHtml(`${brand} ${model}`)}</h2>
              <p class="hero-subtitle">Año ${escapeHtml(year)} | ${escapeHtml(location)}</p>
            </div>
          `
              : '<div class="hero-placeholder">Imagen principal por confirmar</div>'
          }

          <aside class="info-panel">
            <p class="unit-label">Precio publicado</p>
            <p class="unit-price">${escapeHtml(price)}</p>
            <p class="vin">VIN corto: ${escapeHtml(vinShort)}</p>
          </aside>
        </section>

        <div class="key-grid">
          ${keyCards
            .map(
              (item) => `
            <article class="key-card">
              <p class="key-label">${escapeHtml(item.label)}</p>
              <p class="key-value">${escapeHtml(item.value)}</p>
            </article>
          `
            )
            .join('')}
        </div>

        <section class="cta">
          <p class="cta-title">Para más información, contacta al equipo comercial.</p>
          <p class="cta-email">${escapeHtml(CONTACT_EMAIL)}</p>
        </section>
      </section>

      <section class="${secondPageClasses.join(' ')}">
        <h2 class="section-eyebrow">Galeria comercial y especificaciones</h2>

        <section class="page-two-layout">
          ${
            galleryHtml
              ? `<div class="${galleryGridClass}">${galleryHtml}</div>`
              : '<div class="gallery-empty">No hay imagenes disponibles para esta unidad.</div>'
          }
          <aside class="spec-card">${specs}</aside>
        </section>

        <footer class="corp-footer">
          <div class="corp-left">
            <span class="corp-mark">LAB</span>
            <div>
              <p class="corp-title">Mi Oficina Virtual</p>
              <p class="corp-subtitle">Documento comercial para cliente</p>
            </div>
          </div>
          <div class="corp-right">
            <div>Generado: ${escapeHtml(generatedDate)}</div>
            <div>Información sujeta a disponibilidad y confirmación comercial.</div>
          </div>
        </footer>
      </section>
  `
}

export function buildInventoryPdfHtml(unit, now = new Date()) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="referrer" content="no-referrer" />
    <title>${escapeHtml(buildInventoryPdfFileBase(unit, now))}</title>
    <style>
${buildInventoryPdfStyles()}
    </style>
  </head>
  <body>
    <main class="sheet">
      ${buildUnitCommercialSheetHtml(unit, now)}
    </main>
  </body>
</html>`
}

export function buildInventoryCatalogPdfHtml(units, activeFilters = [], now = new Date()) {
  const list = Array.isArray(units) ? units : []
  const generatedDate = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(now)

  const additionalCss = `
      .catalog-cover {
        min-height: 235mm;
        display: flex;
        flex-direction: column;
      }

      .catalog-brand-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
      }

      .catalog-title {
        margin: 30px 0 10px;
        font-size: 42px;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .catalog-meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .catalog-meta-card {
        border: 1px solid var(--line);
        border-radius: 12px;
        background: #f8fbff;
        padding: 10px;
      }

      .catalog-meta-label {
        margin: 0;
        color: var(--muted);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .catalog-meta-value {
        margin: 4px 0 0;
        font-size: 16px;
        font-weight: 700;
      }

      .catalog-filters {
        margin-top: 18px;
      }

      .catalog-filters-title {
        margin: 0 0 8px;
        font-size: 12px;
        text-transform: uppercase;
        color: var(--muted);
        letter-spacing: 0.08em;
      }

      .catalog-chip-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .catalog-chip {
        border-radius: 999px;
        border: 1px solid #c8daf7;
        background: var(--primary-soft);
        color: var(--primary);
        padding: 5px 10px;
        font-size: 11px;
        font-weight: 600;
      }

      .catalog-disclaimer {
        margin-top: auto;
        border-top: 1px solid var(--line);
        padding-top: 10px;
        color: var(--muted);
        font-size: 11px;
      }

      @media print {
        .catalog-cover {
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
    <title>${escapeHtml(buildInventoryCatalogPdfFileBase(list.length, now))}</title>
    <style>
${buildInventoryPdfStyles(additionalCss)}
    </style>
  </head>
  <body>
    <main class="sheet">
      ${buildCatalogCoverHtml(list.length, generatedDate, activeFilters)}
      ${unitsHtml}
    </main>
  </body>
</html>`
}
