function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Precio por confirmar'

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatKilometers(value) {
  if (!Number.isFinite(value) || value <= 0) return 'Kilometraje por confirmar'

  return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(value)} km`
}

function detailRow(label, value) {
  if (!value) return ''

  return `
    <div class="row">
      <span class="row-label">${escapeHtml(label)}</span>
      <span class="row-value">${escapeHtml(value)}</span>
    </div>
  `
}

function section(title, rowsHtml) {
  if (!rowsHtml.trim()) return ''

  return `
    <section class="card">
      <h2>${escapeHtml(title)}</h2>
      <div class="rows">${rowsHtml}</div>
    </section>
  `
}

export function buildInventoryPdfHtml(unit) {
  const gallery = Array.isArray(unit.imagenesCompletas) ? unit.imagenesCompletas.slice(0, 9) : []
  const coverImage = unit.imagenPortada || gallery[0] || ''
  const title = `${unit.marca || 'Sin marca'} ${unit.modelo || 'Sin modelo'}`.trim()

  const infoGeneral = section(
    'Informacion General',
    [
      detailRow('Marca', unit.marca),
      detailRow('Modelo', unit.modelo),
      detailRow('Ano', unit.anio),
      detailRow('Color', unit.color),
      detailRow('Subempresa', unit.subempresa),
      detailRow('Status', unit.status),
    ].join('')
  )

  const trenMotriz = section(
    'Tren Motriz',
    [
      detailRow('Motor', unit.motor),
      detailRow('Transmision', unit.transmision),
      detailRow('Cilindros', unit.cilindros),
      detailRow('Kilometraje', formatKilometers(unit.kilometros)),
    ].join('')
  )

  const configuracion = section(
    'Configuracion',
    [
      detailRow('Paso', unit.paso),
      detailRow('Rodada', unit.rodada),
      detailRow('Eje delantero', unit.ejeDelantero),
      detailRow('Eje trasero', unit.ejeTrasero),
      detailRow('Dormitorio', unit.dormitorio),
    ].join('')
  )

  const ubicacion = section(
    'Ubicacion y Contacto',
    [detailRow('Centro', unit.centro), detailRow('Ubicacion fisica', unit.ubicacion)].join('')
  )

  const administrativo = section(
    'Datos Administrativos',
    [
      detailRow('VIN completo', unit.vinCompleto),
      detailRow('VIN', unit.vin),
      detailRow('Promocion', unit.promocion),
    ].join('')
  )

  const galleryHtml = gallery
    .map(
      (url, index) =>
        `<img src="${escapeHtml(url)}" alt="Galeria ${index + 1}" loading="lazy" class="gallery-image" />`
    )
    .join('')

  const imageSection = `
    <section class="card full">
      <h2>Imagenes</h2>
      ${
        coverImage
          ? `<img src="${escapeHtml(coverImage)}" alt="Imagen portada" class="cover-image" />`
          : '<div class="empty-image">Sin foto</div>'
      }
      ${
        galleryHtml
          ? `<div class="gallery">${galleryHtml}</div>`
          : '<p class="muted">No hay galeria disponible para esta unidad.</p>'
      }
    </section>
  `

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Ficha de unidad - ${escapeHtml(title)}</title>
        <style>
          :root { color-scheme: light; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: "Segoe UI", "Arial", sans-serif;
            background: #f5f7fb;
            color: #12263a;
          }
          .sheet {
            max-width: 1040px;
            margin: 0 auto;
            padding: 30px 28px 40px;
          }
          .header {
            background: #fff;
            border: 1px solid #dbe2ea;
            border-radius: 14px;
            padding: 20px;
            margin-bottom: 14px;
          }
          .title { margin: 0; font-size: 30px; line-height: 1.1; }
          .subtitle { margin: 8px 0 0; color: #5c6b7a; }
          .price { margin: 12px 0 0; font-size: 30px; color: #0052cc; font-weight: 700; }
          .grid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .card {
            background: #fff;
            border: 1px solid #dbe2ea;
            border-radius: 12px;
            padding: 14px;
          }
          .card.full { grid-column: 1 / -1; }
          h2 {
            margin: 0 0 8px;
            font-size: 12px;
            letter-spacing: .06em;
            text-transform: uppercase;
            color: #5c6b7a;
          }
          .row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 7px 0;
            border-bottom: 1px solid #eef2f8;
          }
          .row:last-child { border-bottom: 0; }
          .row-label { color: #5c6b7a; }
          .row-value { text-align: right; font-weight: 600; color: #12263a; }
          .cover-image {
            width: 100%;
            height: 280px;
            object-fit: cover;
            border-radius: 10px;
            border: 1px solid #e6ebf2;
          }
          .gallery {
            margin-top: 10px;
            display: grid;
            gap: 8px;
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .gallery-image {
            width: 100%;
            height: 100px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #e6ebf2;
          }
          .empty-image {
            height: 150px;
            border: 1px dashed #dbe2ea;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #7a8794;
            background: #f8fafc;
          }
          .muted { margin: 10px 0 0; color: #5c6b7a; }
          @media print {
            body { background: #fff; }
            .sheet { max-width: none; padding: 0; }
            .cover-image { height: 240px; }
          }
        </style>
      </head>
      <body>
        <main class="sheet">
          <header class="header">
            <h1 class="title">${escapeHtml(title)}</h1>
            <p class="subtitle">${escapeHtml(unit.anio || 'Ano no especificado')} | ${escapeHtml(unit.ubicacion || 'Sin ubicacion')}</p>
            <p class="price">${escapeHtml(formatCurrency(unit.precio))}</p>
          </header>

          <section class="grid">
            ${infoGeneral}
            ${trenMotriz}
            ${configuracion}
            ${ubicacion}
            ${administrativo}
            ${imageSection}
          </section>
        </main>
      </body>
    </html>
  `
}
