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
  if (!hasValue(unit.vinCompleto)) return 'Por confirmar'
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

function specRow(label, value) {
  return `
    <div class="spec-row">
      <span class="spec-label">${escapeHtml(label)}</span>
      <span class="spec-value">${escapeHtml(toText(value))}</span>
    </div>
  `
}

export function buildInventoryPdfHtml(unit) {
  const now = new Date()
  const generatedDate = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(now)

  const brand = toText(unit.marca)
  const model = toText(unit.modelo)
  const year = toText(unit.anio)
  const title = `${brand} ${model} ${year}`.replace(/\s+/g, ' ').trim()
  const status = getStatus(unit)
  const price = getPrice(unit)
  const location = getLocation(unit)
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
    specRow('VIN corto', getVinShort(unit)),
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
    <title>Ficha comercial ${escapeHtml(title)}</title>
    <style>
      @page {
        size: letter;
        margin: 10mm;
      }

      :root {
        --bg: #ecf2fa;
        --paper: #ffffff;
        --ink: #12243a;
        --muted: #5f7087;
        --line: #d5dfec;
        --primary: #0f4c9f;
        --primary-soft: #eaf2ff;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        background: var(--bg);
        color: var(--ink);
      }

      .brochure {
        width: min(100%, 940px);
        margin: 0 auto;
        padding: 14px;
      }

      .page {
        background: var(--paper);
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 16px;
        break-inside: avoid;
      }

      .page + .page {
        margin-top: 14px;
      }

      .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .brand {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .brand-pill {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: linear-gradient(145deg, #0d58ba, #0c376f);
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 13px;
        font-weight: 700;
      }

      .brand-title {
        margin: 0;
        font-size: 19px;
        line-height: 1.15;
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
        display: inline-flex;
        margin-top: 6px;
        border-radius: 999px;
        border: 1px solid #b6d5ff;
        background: #eaf3ff;
        color: #154d96;
        padding: 5px 10px;
        font-size: 11px;
        font-weight: 700;
      }

      .hero {
        margin-top: 12px;
        display: grid;
        grid-template-columns: 54% 46%;
        gap: 12px;
        break-inside: avoid;
      }

      .hero-media {
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid var(--line);
        min-height: 420px;
        max-height: 520px;
      }

      .hero-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .hero-placeholder {
        height: 100%;
        min-height: 420px;
        display: grid;
        place-items: center;
        color: var(--muted);
        background:
          linear-gradient(135deg, #eff4fb 25%, transparent 25%) -12px 0 / 24px 24px,
          linear-gradient(225deg, #eff4fb 25%, transparent 25%) -12px 0 / 24px 24px,
          linear-gradient(315deg, #eff4fb 25%, transparent 25%) 0px 0 / 24px 24px,
          linear-gradient(45deg, #eff4fb 25%, #f9fbff 25%) 0px 0 / 24px 24px;
      }

      .hero-content {
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 14px;
        background: linear-gradient(180deg, #ffffff, #f9fbff);
        display: flex;
        flex-direction: column;
      }

      .unit-name {
        margin: 0;
        font-size: 34px;
        line-height: 1.05;
      }

      .unit-subline {
        margin: 6px 0 0;
        font-size: 14px;
        color: var(--muted);
      }

      .price {
        margin: 14px 0 0;
        font-size: 38px;
        color: var(--primary);
        font-weight: 800;
        line-height: 1;
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
        border: 1px solid #dce6f3;
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
        border: 1px solid #cddffd;
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
        min-height: 170px;
        break-inside: avoid;
      }

      .gallery-tile-main {
        grid-column: span 2;
        min-height: 270px;
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
        min-height: 270px;
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

      .footer {
        margin-top: 12px;
        border-top: 1px solid #e3eaf5;
        padding-top: 8px;
        display: grid;
        gap: 3px;
        color: var(--muted);
        font-size: 10px;
      }

      @media (max-width: 860px) {
        .hero {
          grid-template-columns: 1fr;
        }

        .hero-media {
          min-height: 320px;
        }

        .gallery-layout {
          grid-template-columns: 1fr;
        }
      }

      @media print {
        body {
          background: #fff;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .brochure {
          width: 100%;
          padding: 0;
        }

        .page {
          border: 0;
          border-radius: 0;
          padding: 0;
          box-shadow: none;
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
            <span class="brand-pill">MOV</span>
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
                ? `<img src="${escapeHtml(cover)}" alt="Imagen principal de la unidad" class="hero-image" />`
                : '<div class="hero-placeholder">Imagen principal por confirmar</div>'
            }
          </figure>

          <article class="hero-content">
            <h2 class="unit-name">${escapeHtml(`${brand} ${model}`)}</h2>
            <p class="unit-subline">Ano ${escapeHtml(year)}</p>
            <p class="price">${escapeHtml(price)}</p>
            <p class="vin">VIN corto: ${escapeHtml(getVinShort(unit))}</p>

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

          <aside class="spec-card">
            ${specs}
          </aside>
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
