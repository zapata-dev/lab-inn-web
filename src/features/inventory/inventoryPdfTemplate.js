const CONTACT_EMAIL = 'innovaciogoon@zapata.com.mx'

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function isPresent(value) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return false
  if (normalized.toLowerCase() === 'undefined') return false
  if (normalized.toLowerCase() === 'null') return false
  return true
}

function asText(value, fallback = 'Por confirmar') {
  return isPresent(value) ? String(value).trim() : fallback
}

function asOptionalText(value) {
  return isPresent(value) ? String(value).trim() : ''
}

function formatCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Por confirmar'

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatKilometers(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Por confirmar'
  return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(value)} km`
}

function shortVin(unit) {
  if (isPresent(unit.vin)) return String(unit.vin).trim()
  if (!isPresent(unit.vinCompleto)) return 'Por confirmar'
  const full = String(unit.vinCompleto).trim()
  return full.length > 8 ? full.slice(-8) : full
}

function getLocation(unit) {
  return asText(unit.ubicacionFisica || unit.ubicacion || unit.centro)
}

function getStatus(unit) {
  const status = asOptionalText(unit.status)
  if (!status) return 'Disponible'
  return status.replaceAll('_', ' ')
}

function getPrice(unit) {
  if (isPresent(unit.precioFormatted)) return String(unit.precioFormatted).trim()
  return formatCurrency(unit.precio)
}

function getKilometers(unit) {
  if (isPresent(unit.kilometrosFormatted)) return String(unit.kilometrosFormatted).trim()
  return formatKilometers(unit.kilometros)
}

function safeImageUrl(url) {
  const text = String(url ?? '').trim()
  return /^https?:\/\//i.test(text) ? text : ''
}

function buildGallery(unit) {
  const rawImages = Array.isArray(unit.imagenesCompletas) ? unit.imagenesCompletas : []
  const imageList = [unit.imagenPortada, ...rawImages]
    .map(safeImageUrl)
    .filter(Boolean)
    .filter((url, index, urls) => urls.indexOf(url) === index)
    .slice(0, 9)

  return {
    coverImage: imageList[0] || '',
    galleryImages: imageList.slice(0, 9),
  }
}

function detailRow(label, value, allowFallback = true) {
  const safeValue = allowFallback ? asText(value) : asOptionalText(value)
  if (!safeValue) return ''

  return `
    <div class="row">
      <span class="row-label">${escapeHtml(label)}</span>
      <span class="row-value">${escapeHtml(safeValue)}</span>
    </div>
  `
}

function section(title, rowsHtml) {
  if (!rowsHtml.trim()) return ''
  return `
    <section class="spec-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="rows">${rowsHtml}</div>
    </section>
  `
}

export function buildInventoryPdfHtml(unit) {
  const now = new Date()
  const generatedDate = new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(now)
  const title = `${asText(unit.marca)} ${asText(unit.modelo)}`.trim()
  const year = asText(unit.anio)
  const price = getPrice(unit)
  const location = getLocation(unit)
  const { coverImage, galleryImages } = buildGallery(unit)
  const status = getStatus(unit)

  const executiveItems = [
    { label: 'Kilometraje', value: getKilometers(unit) },
    { label: 'Motor', value: asText(unit.motor) },
    { label: 'Transmision', value: asText(unit.transmision) },
    { label: 'Paso', value: asText(unit.paso) },
    { label: 'Rodada', value: asText(unit.rodada) },
    { label: 'Dormitorio', value: asText(unit.dormitorio) },
    { label: 'Eje trasero', value: asText(unit.ejeTrasero) },
  ]

  const technicalSections = [
    section(
      'Informacion general',
      [
        detailRow('Marca', unit.marca),
        detailRow('Modelo', unit.modelo),
        detailRow('Ano', unit.anio),
        detailRow('Color exterior', unit.color),
        detailRow('Color interior', unit.colorInterior),
        detailRow('Subempresa', unit.subempresa),
        detailRow('Status', status),
      ].join('')
    ),
    section(
      'Tren motriz',
      [
        detailRow('Motor', unit.motor),
        detailRow('Transmision', unit.transmision),
        detailRow('Kilometraje', getKilometers(unit)),
      ].join('')
    ),
    section(
      'Configuracion',
      [
        detailRow('Paso', unit.paso),
        detailRow('Rodada', unit.rodada),
        detailRow('Eje delantero', unit.ejeDelantero),
        detailRow('Eje trasero', unit.ejeTrasero),
        detailRow('Dormitorio', unit.dormitorio),
      ].join('')
    ),
    section(
      'Ubicacion',
      [detailRow('Centro', unit.centro), detailRow('Ubicacion fisica', unit.ubicacionFisica || unit.ubicacion)].join(
        ''
      )
    ),
    section(
      'Datos administrativos',
      [
        detailRow('VIN completo', unit.vinCompleto),
        detailRow('VIN corto', shortVin(unit)),
        detailRow('Promocion', unit.promocion),
      ].join('')
    ),
  ]
    .filter(Boolean)
    .join('')

  const galleryHtml = galleryImages
    .map(
      (url, index) =>
        `<figure class="gallery-item"><img src="${escapeHtml(url)}" alt="Imagen ${index + 1} de la unidad" class="gallery-image" loading="lazy" /></figure>`
    )
    .join('')

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ficha comercial - ${escapeHtml(title)}</title>
    <style>
      @page {
        size: letter;
        margin: 14mm;
      }

      :root {
        --bg: #f3f6fb;
        --white: #ffffff;
        --ink: #0e1a2b;
        --muted: #5d6a7b;
        --border: #d8e0ea;
        --primary: #0d3f8a;
        --primary-soft: #e8f0ff;
        --success-soft: #e9f8ee;
        --success-ink: #1d7a44;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        color: var(--ink);
        background: var(--bg);
      }

      .document {
        width: min(100%, 920px);
        margin: 0 auto;
        padding: 18px;
      }

      .page {
        background: var(--white);
        border: 1px solid var(--border);
        border-radius: 18px;
        padding: 20px;
        break-inside: avoid;
      }

      .page + .page {
        margin-top: 18px;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: flex-start;
        margin-bottom: 14px;
      }

      .brand-block {
        display: flex;
        gap: 12px;
      }

      .brand-mark {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: linear-gradient(145deg, #0f4ea8, #0d2e63);
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 700;
      }

      .eyebrow {
        margin: 0;
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .brand-name {
        margin: 2px 0 0;
        font-size: 24px;
        line-height: 1.1;
      }

      .brand-subtitle {
        margin: 3px 0 0;
        color: var(--muted);
        font-size: 13px;
      }

      .meta {
        text-align: right;
      }

      .date {
        margin: 0;
        font-size: 12px;
        color: var(--muted);
      }

      .status-badge {
        margin-top: 8px;
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 6px 11px;
        font-size: 12px;
        font-weight: 700;
        color: var(--success-ink);
        background: var(--success-soft);
        border: 1px solid #b9e4c6;
      }

      .hero {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 14px;
        margin-bottom: 14px;
        break-inside: avoid;
      }

      .hero-image-wrap {
        border: 1px solid var(--border);
        border-radius: 14px;
        overflow: hidden;
        min-height: 280px;
        background: #e9edf5;
      }

      .hero-image {
        width: 100%;
        height: 100%;
        min-height: 280px;
        object-fit: cover;
        display: block;
      }

      .image-placeholder {
        min-height: 280px;
        height: 100%;
        display: grid;
        place-items: center;
        color: var(--muted);
        background:
          linear-gradient(135deg, #edf2fb 25%, transparent 25%) -10px 0 / 20px 20px,
          linear-gradient(225deg, #edf2fb 25%, transparent 25%) -10px 0 / 20px 20px,
          linear-gradient(315deg, #edf2fb 25%, transparent 25%) 0px 0 / 20px 20px,
          linear-gradient(45deg, #edf2fb 25%, #f8faff 25%) 0px 0 / 20px 20px;
      }

      .hero-content {
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 16px;
        background: linear-gradient(170deg, #ffffff, #f8fbff);
      }

      .unit-title {
        margin: 0;
        font-size: 31px;
        line-height: 1.08;
      }

      .unit-year {
        margin: 7px 0 0;
        font-size: 16px;
        color: var(--muted);
      }

      .price {
        margin: 14px 0 0;
        font-size: 35px;
        line-height: 1;
        color: var(--primary);
        font-weight: 800;
      }

      .meta-list {
        margin: 15px 0 0;
        display: grid;
        gap: 8px;
      }

      .meta-item {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        border-bottom: 1px solid #eaf0f8;
        padding-bottom: 7px;
        font-size: 13px;
      }

      .meta-item:last-child {
        border-bottom: 0;
      }

      .meta-label {
        color: var(--muted);
      }

      .meta-value {
        text-align: right;
        font-weight: 700;
      }

      .card {
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 14px;
        background: var(--white);
        break-inside: avoid;
      }

      .card h2 {
        margin: 0 0 10px;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 9px;
      }

      .summary-item {
        border: 1px solid #e2e9f4;
        border-radius: 11px;
        padding: 10px;
        background: #f8fbff;
      }

      .summary-label {
        margin: 0;
        font-size: 11px;
        color: var(--muted);
      }

      .summary-value {
        margin: 4px 0 0;
        font-size: 13px;
        font-weight: 700;
      }

      .cta-card {
        margin-top: 12px;
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: center;
        border: 1px solid #cfe0fb;
        background: var(--primary-soft);
      }

      .cta-copy {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }

      .cta-email {
        font-size: 14px;
        font-weight: 700;
        color: var(--primary);
      }

      .section-title {
        margin: 0 0 10px;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .spec-grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .spec-card {
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 12px;
        background: #fcfdff;
        break-inside: avoid;
      }

      .spec-card h3 {
        margin: 0 0 8px;
        font-size: 12px;
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .rows {
        display: grid;
      }

      .row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding: 6px 0;
        border-bottom: 1px solid #ebf0f7;
      }

      .row:last-child {
        border-bottom: 0;
      }

      .row-label {
        color: var(--muted);
        font-size: 12px;
      }

      .row-value {
        text-align: right;
        font-size: 12px;
        font-weight: 700;
      }

      .gallery-card {
        margin-top: 12px;
      }

      .gallery {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }

      .gallery-item {
        margin: 0;
        border: 1px solid #dce5f1;
        border-radius: 10px;
        overflow: hidden;
        height: 112px;
        break-inside: avoid;
      }

      .gallery-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .empty-gallery {
        border: 1px dashed var(--border);
        border-radius: 10px;
        padding: 20px 12px;
        text-align: center;
        color: var(--muted);
        font-size: 13px;
      }

      .footer {
        margin-top: 14px;
        border-top: 1px solid #e6ebf4;
        padding-top: 10px;
        color: var(--muted);
        display: grid;
        gap: 4px;
        font-size: 11px;
      }

      @media (max-width: 900px) {
        .hero {
          grid-template-columns: 1fr;
        }

        .summary-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          background: #fff;
        }

        .document {
          width: 100%;
          padding: 0;
        }

        .page {
          border: 0;
          border-radius: 0;
          padding: 0;
          box-shadow: none;
          break-inside: avoid;
        }

        .page + .page {
          page-break-before: always;
          margin-top: 0;
        }
      }
    </style>
  </head>
  <body>
    <main class="document">
      <section class="page">
        <header class="page-header">
          <div class="brand-block">
            <span class="brand-mark">MOV</span>
            <div>
              <p class="eyebrow">Mi Oficina Virtual</p>
              <h1 class="brand-name">Ficha comercial de unidad</h1>
              <p class="brand-subtitle">Documento premium para atencion a cliente</p>
            </div>
          </div>
          <div class="meta">
            <p class="date">Generado: ${escapeHtml(generatedDate)}</p>
            <span class="status-badge">${escapeHtml(status)}</span>
          </div>
        </header>

        <section class="hero">
          <div class="hero-image-wrap">
            ${
              coverImage
                ? `<img src="${escapeHtml(coverImage)}" alt="Imagen principal de la unidad" class="hero-image" />`
                : '<div class="image-placeholder">Imagen no disponible</div>'
            }
          </div>
          <div class="hero-content">
            <h2 class="unit-title">${escapeHtml(title)}</h2>
            <p class="unit-year">Ano ${escapeHtml(year)}</p>
            <p class="price">${escapeHtml(price)}</p>
            <div class="meta-list">
              <div class="meta-item">
                <span class="meta-label">Ubicacion</span>
                <span class="meta-value">${escapeHtml(location)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">VIN corto</span>
                <span class="meta-value">${escapeHtml(shortVin(unit))}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="card">
          <h2>Resumen ejecutivo</h2>
          <div class="summary-grid">
            ${executiveItems
              .map(
                (item) => `
              <article class="summary-item">
                <p class="summary-label">${escapeHtml(item.label)}</p>
                <p class="summary-value">${escapeHtml(item.value)}</p>
              </article>
            `
              )
              .join('')}
          </div>
        </section>

        <section class="card cta-card">
          <p class="cta-copy">Para mas informacion, contacta al equipo comercial.</p>
          <span class="cta-email">${escapeHtml(CONTACT_EMAIL)}</span>
        </section>
      </section>

      <section class="page">
        <section class="card">
          <h2 class="section-title">Especificaciones tecnicas</h2>
          <div class="spec-grid">
            ${technicalSections}
          </div>
        </section>

        <section class="card gallery-card">
          <h2>Galeria</h2>
          ${
            galleryHtml
              ? `<div class="gallery">${galleryHtml}</div>`
              : '<div class="empty-gallery">No hay imagenes disponibles para esta unidad.</div>'
          }
        </section>

        <footer class="footer">
          <span>Documento generado desde Mi Oficina Virtual LAB.</span>
          <span>Fecha: ${escapeHtml(generatedDate)}</span>
          <span>Informacion sujeta a disponibilidad y confirmacion comercial.</span>
        </footer>
      </section>
    </main>
  </body>
</html>`
}
