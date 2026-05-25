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
  const model = normalizeToken(unit?.modelo, 'SIN_MODELO')
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

export function buildInventoryPdfHtml(unit, now = new Date()) {
  const generatedDate = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(now)
  const brand = toText(unit.marca)
  const model = toText(unit.modelo)
  const year = toText(unit.anio)
  const status = getStatus(unit)
  const price = getPrice(unit)
  const location = getLocation(unit)
  const vinShort = getVinShort(unit) || 'Por confirmar'
  const { cover, gallery } = getImageSet(unit)

  const keyCards = [
    { label: 'Kilometraje', value: getKilometers(unit) },
    { label: 'Motor', value: toText(unit.motor) },
    { label: 'Transmision', value: toText(unit.transmision) },
    { label: 'Ubicacion', value: location },
    { label: 'Paso', value: toText(unit.paso) },
    { label: 'Rodada', value: toText(unit.rodada) },
  ]

  const specs = [
    specRow('Color exterior', unit.color),
    specRow('Color interior', unit.colorInterior),
    specRow('Eje delantero', unit.ejeDelantero),
    specRow('Eje trasero', unit.ejeTrasero),
    specRow('Dormitorio', unit.dormitorio),
    specRow('Subempresa', unit.subempresa),
    specRow('Centro', unit.centro),
    specRow('VIN corto', vinShort),
    specRow('VIN completo', unit.vinCompleto),
    specRow('Promocion', unit.promocion),
  ].join('')

  const galleryHtml = gallery
    .map((imageUrl, index) => {
      const classes = index === 0 ? 'gallery-tile gallery-tile-main' : 'gallery-tile'
      return `
        <figure class="${classes}">
          <img src="${escapeHtml(imageUrl)}" alt="Vista ${index + 1} de la unidad" class="gallery-image" loading="lazy" />
        </figure>
      `
    })
    .join('')

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="referrer" content="no-referrer" />
    <title>${escapeHtml(buildInventoryPdfFileBase(unit, now))}</title>
    <style>
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
        --paper: #ffffff;
        --ink: #0f1c31;
        --muted: #60708a;
        --line: #d8e1ec;
        --primary: #0c4ea3;
        --primary-soft: #edf3ff;
      }

      * {
        box-sizing: border-box;
      }

      body {
        font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        color: var(--ink);
        background: #eef3fa;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .brochure {
        width: 100%;
        max-width: 960px;
        margin: 0 auto;
        padding: 12mm;
      }

      .page {
        background: var(--paper);
        border-radius: 16px;
        border: 1px solid var(--line);
        box-shadow: 0 18px 48px rgba(16, 44, 86, 0.12);
        padding: 14mm;
        break-inside: avoid;
        position: relative;
      }

      .page + .page {
        margin-top: 10mm;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }

      .brand {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .brand-pill {
        width: 40px;
        height: 40px;
        border-radius: 11px;
        background: linear-gradient(145deg, #0f5ec8, #0a346c);
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 13px;
        font-weight: 700;
      }

      .brand-title {
        margin: 0;
        font-size: 19px;
      }

      .brand-subtitle {
        margin: 2px 0 0;
        font-size: 12px;
        color: var(--muted);
      }

      .header-meta {
        text-align: right;
      }

      .header-date {
        margin: 0;
        font-size: 11px;
        color: var(--muted);
      }

      .status {
        margin-top: 7px;
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 11px;
        font-weight: 700;
        color: #154e95;
        background: #e9f2ff;
        border: 1px solid #c7dcff;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.5);
      }

      .hero {
        margin-top: 10px;
        display: grid;
        grid-template-columns: 56% 44%;
        gap: 10px;
      }

      .hero-media {
        min-height: 420px;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid #cfdbea;
        position: relative;
      }

      .hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .hero-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(190deg, rgba(13, 32, 58, 0.12) 0%, rgba(5, 11, 19, 0.68) 88%);
      }

      .hero-overlay-content {
        position: absolute;
        bottom: 14px;
        left: 14px;
        right: 14px;
        color: #fff;
      }

      .hero-overlay-title {
        margin: 0;
        font-size: 21px;
        line-height: 1.12;
        text-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
      }

      .hero-overlay-subtitle {
        margin: 5px 0 0;
        font-size: 12px;
        opacity: 0.92;
      }

      .hero-placeholder {
        height: 100%;
        min-height: 420px;
        display: grid;
        place-items: center;
        color: var(--muted);
        background:
          linear-gradient(135deg, #edf3fb 25%, transparent 25%) -12px 0 / 24px 24px,
          linear-gradient(225deg, #edf3fb 25%, transparent 25%) -12px 0 / 24px 24px,
          linear-gradient(315deg, #edf3fb 25%, transparent 25%) 0px 0 / 24px 24px,
          linear-gradient(45deg, #edf3fb 25%, #f8fbff 25%) 0px 0 / 24px 24px;
      }

      .hero-content {
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 13px;
        background: linear-gradient(180deg, #ffffff, #f8fbff);
        display: flex;
        flex-direction: column;
      }

      .unit-name {
        margin: 0;
        font-size: 34px;
        line-height: 1.03;
      }

      .unit-subline {
        margin: 6px 0 0;
        font-size: 14px;
        color: var(--muted);
      }

      .price {
        margin: 16px 0 0;
        font-size: 43px;
        color: var(--primary);
        font-weight: 800;
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .vin {
        margin: 8px 0 0;
        font-size: 12px;
        color: var(--muted);
      }

      .key-grid {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .key-card {
        border: 1px solid #d9e5f4;
        border-radius: 10px;
        background: #f8fbff;
        padding: 9px;
        break-inside: avoid;
      }

      .key-label {
        margin: 0;
        color: var(--muted);
        font-size: 11px;
      }

      .key-value {
        margin: 4px 0 0;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.2;
      }

      .cta {
        margin-top: auto;
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

      .page-title {
        margin: 0;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .gallery-layout {
        margin-top: 10px;
        display: grid;
        grid-template-columns: 66% 34%;
        gap: 10px;
      }

      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }

      .gallery-tile {
        margin: 0;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid var(--line);
        min-height: 172px;
        break-inside: avoid;
      }

      .gallery-tile-main {
        grid-column: span 2;
        min-height: 274px;
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
        min-height: 274px;
        display: grid;
        place-items: center;
        padding: 18px;
        color: var(--muted);
        text-align: center;
      }

      .spec-card {
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 10px;
        background: #fbfdff;
      }

      .spec-row {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        padding: 5px 0;
        border-bottom: 1px solid #e9eef7;
        break-inside: avoid;
      }

      .spec-row:last-child {
        border-bottom: 0;
      }

      .spec-label {
        color: var(--muted);
        font-size: 11px;
      }

      .spec-value {
        text-align: right;
        font-size: 11px;
        font-weight: 700;
        max-width: 58%;
      }

      .corporate-footer {
        margin-top: 11px;
        border-top: 1px solid #dce5f2;
        padding-top: 8px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      }

      .corp-brand {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .corp-mark {
        width: 24px;
        height: 24px;
        border-radius: 7px;
        background: linear-gradient(145deg, #0f5ec8, #0a346c);
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

      .corp-meta {
        text-align: right;
        font-size: 9px;
        color: var(--muted);
        line-height: 1.35;
      }

      @media print {
        body {
          background: #fff;
        }

        .brochure {
          max-width: none;
          margin: 0;
          padding: 10mm;
        }

        .page {
          box-shadow: none;
          border-radius: 0;
          border-color: transparent;
          padding: 10mm;
        }

        .page + .page {
          margin-top: 0;
          page-break-before: always;
        }
      }
    </style>
  </head>
  <body>
    <main class="brochure">
      <section class="page">
        <header class="header">
          <div class="brand">
            <span class="brand-pill">LAB</span>
            <div>
              <h1 class="brand-title">Mi Oficina Virtual</h1>
              <p class="brand-subtitle">Ficha comercial de unidad</p>
            </div>
          </div>
          <div class="header-meta">
            <p class="header-date">Generado: ${escapeHtml(generatedDate)}</p>
            <span class="status">${escapeHtml(status)}</span>
          </div>
        </header>

        <section class="hero">
          <figure class="hero-media">
            ${
              cover
                ? `
              <img src="${escapeHtml(cover)}" alt="Imagen principal de la unidad" class="hero-image" />
              <div class="hero-overlay"></div>
              <figcaption class="hero-overlay-content">
                <h2 class="hero-overlay-title">${escapeHtml(`${brand} ${model}`)}</h2>
                <p class="hero-overlay-subtitle">Ano ${escapeHtml(year)} | ${escapeHtml(location)}</p>
              </figcaption>
            `
                : '<div class="hero-placeholder">Imagen principal por confirmar</div>'
            }
          </figure>

          <article class="hero-content">
            <h2 class="unit-name">${escapeHtml(`${brand} ${model}`)}</h2>
            <p class="unit-subline">Ano ${escapeHtml(year)}</p>
            <p class="price">${escapeHtml(price)}</p>
            <p class="vin">VIN corto: ${escapeHtml(vinShort)}</p>

            <div class="key-grid">
              ${keyCards
                .map(
                  (item) => `
                <div class="key-card">
                  <p class="key-label">${escapeHtml(item.label)}</p>
                  <p class="key-value">${escapeHtml(item.value)}</p>
                </div>
              `
                )
                .join('')}
            </div>

            <div class="cta">
              <p class="cta-title">Para mas informacion, contacta al equipo comercial.</p>
              <p class="cta-email">${escapeHtml(CONTACT_EMAIL)}</p>
            </div>
          </article>
        </section>
      </section>

      <section class="page">
        <h2 class="page-title">Galeria comercial y especificaciones</h2>
        <section class="gallery-layout">
          ${
            galleryHtml
              ? `<div class="gallery-grid">${galleryHtml}</div>`
              : '<div class="gallery-empty">No hay imagenes disponibles para esta unidad.</div>'
          }
          <aside class="spec-card">${specs}</aside>
        </section>

        <footer class="corporate-footer">
          <div class="corp-brand">
            <span class="corp-mark">LAB</span>
            <div>
              <p class="corp-title">Mi Oficina Virtual</p>
              <p class="corp-subtitle">Documento comercial para cliente</p>
            </div>
          </div>
          <div class="corp-meta">
            <div>Generado: ${escapeHtml(generatedDate)}</div>
            <div>Informacion sujeta a disponibilidad y confirmacion comercial.</div>
          </div>
        </footer>
      </section>
    </main>
  </body>
</html>`
}
