import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

const CONTACT_EMAIL = 'innovaciogoon@zapata.com.mx'

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 11,
    color: '#10213a',
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mark: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#0e4ea6',
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 2.5,
  },
  brandTitle: { fontSize: 13, fontWeight: 700 },
  brandSubtitle: { fontSize: 9, color: '#5f7087', marginTop: 1 },
  status: {
    fontSize: 9,
    backgroundColor: '#eaf2ff',
    borderColor: '#c6dbff',
    borderWidth: 1,
    borderRadius: 999,
    color: '#154f95',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  date: { fontSize: 8, color: '#5f7087', marginBottom: 4, textAlign: 'right' },
  heroImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    objectFit: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    backgroundColor: '#eef3fb',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#5f7087',
    fontSize: 11,
  },
  titleWrap: { marginTop: 12 },
  unitName: { fontSize: 25, fontWeight: 700, lineHeight: 1.15 },
  unitSubline: { marginTop: 3, color: '#5f7087', fontSize: 11 },
  price: { marginTop: 8, fontSize: 29, fontWeight: 700, color: '#0e4ea6' },
  vin: { marginTop: 3, fontSize: 9, color: '#5f7087' },
  keyGrid: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  keyCard: {
    width: '32%',
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#d7e2f1',
    borderRadius: 8,
    backgroundColor: '#f8fbff',
    padding: 6,
  },
  keyLabel: { fontSize: 8, color: '#5f7087' },
  keyValue: { marginTop: 3, fontSize: 10, fontWeight: 700 },
  cta: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#cfe0ff',
    borderRadius: 10,
    backgroundColor: '#edf3ff',
    padding: 8,
  },
  ctaTitle: { fontSize: 9, color: '#1a3661' },
  ctaEmail: { fontSize: 12, fontWeight: 700, color: '#0e4ea6', marginTop: 2 },
  sectionTitle: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#5f7087',
    letterSpacing: 1,
    marginBottom: 8,
  },
  pageTwoLayout: {
    flexDirection: 'row',
    gap: 8,
  },
  galleryCol: { width: '66%', flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  galleryMain: { width: '100%', height: 180, borderRadius: 8, objectFit: 'cover' },
  galleryItem: { width: '48.5%', height: 110, borderRadius: 8, objectFit: 'cover' },
  galleryEmpty: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d7e2f1',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#5f7087',
    fontSize: 10,
  },
  specCol: {
    width: '34%',
    borderWidth: 1,
    borderColor: '#d7e2f1',
    borderRadius: 8,
    backgroundColor: '#fbfdff',
    padding: 7,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eef8',
    paddingVertical: 4,
  },
  specLabel: { fontSize: 8, color: '#5f7087', width: '44%' },
  specValue: { fontSize: 8, fontWeight: 700, width: '56%', textAlign: 'right' },
  footer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#dce5f1',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: '#5f7087',
  },
  footerLeftTitle: { fontSize: 9, fontWeight: 700, color: '#10213a' },
  footerLeftText: { fontSize: 8, marginTop: 1 },
  footerRight: { fontSize: 8, textAlign: 'right', lineHeight: 1.4 },
})

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

function toSafeImage(url) {
  const text = String(url ?? '').trim()
  return /^https?:\/\//i.test(text) ? text : ''
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
  const status = toText(unit.status, 'Disponible')
  return status.replaceAll('_', ' ')
}

function getVinShort(unit) {
  if (hasValue(unit.vin)) return String(unit.vin).trim()
  if (!hasValue(unit.vinCompleto)) return 'Por confirmar'
  const fullVin = String(unit.vinCompleto).trim()
  return fullVin.length > 8 ? fullVin.slice(-8) : fullVin
}

function getImages(unit) {
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

export function InventoryPdfReactDocument({ unit, generatedDate }) {
  const brand = toText(unit.marca)
  const model = toText(unit.modelo)
  const year = toText(unit.anio)
  const status = getStatus(unit)
  const price = getPrice(unit)
  const location = getLocation(unit)
  const vinShort = getVinShort(unit)
  const { cover, gallery } = getImages(unit)

  const keyCards = [
    { label: 'Kilometraje', value: getKilometers(unit) },
    { label: 'Motor', value: toText(unit.motor) },
    { label: 'Transmision', value: toText(unit.transmision) },
    { label: 'Ubicacion', value: location },
    { label: 'Paso', value: toText(unit.paso) },
    { label: 'Rodada', value: toText(unit.rodada) },
  ]

  const specs = [
    ['Color exterior', unit.color],
    ['Color interior', unit.colorInterior],
    ['Eje delantero', unit.ejeDelantero],
    ['Eje trasero', unit.ejeTrasero],
    ['Dormitorio', unit.dormitorio],
    ['Subempresa', unit.subempresa],
    ['Centro', unit.centro],
    ['VIN corto', vinShort],
    ['VIN completo', unit.vinCompleto],
    ['Promocion', unit.promocion],
  ]

  return (
    <Document title={`${brand} ${model} ${year}`}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.topbar}>
          <View style={styles.brand}>
            <Text style={styles.mark}>LAB</Text>
            <View>
              <Text style={styles.brandTitle}>Mi Oficina Virtual</Text>
              <Text style={styles.brandSubtitle}>Ficha comercial de unidad</Text>
            </View>
          </View>
          <View>
            <Text style={styles.date}>Generado: {generatedDate}</Text>
            <Text style={styles.status}>{status}</Text>
          </View>
        </View>

        {cover ? (
          <Image src={cover} style={styles.heroImage} />
        ) : (
          <View style={styles.heroPlaceholder}>
            <Text>Imagen principal por confirmar</Text>
          </View>
        )}

        <View style={styles.titleWrap}>
          <Text style={styles.unitName}>{`${brand} ${model}`}</Text>
          <Text style={styles.unitSubline}>{`Ano ${year} | ${location}`}</Text>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.vin}>{`VIN corto: ${vinShort}`}</Text>
        </View>

        <View style={styles.keyGrid}>
          {keyCards.map((item) => (
            <View key={item.label} style={styles.keyCard}>
              <Text style={styles.keyLabel}>{item.label}</Text>
              <Text style={styles.keyValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaTitle}>Para mas informacion, contacta al equipo comercial.</Text>
          <Text style={styles.ctaEmail}>{CONTACT_EMAIL}</Text>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionTitle}>Galeria comercial y especificaciones</Text>
        <View style={styles.pageTwoLayout}>
          <View style={styles.galleryCol}>
            {gallery.length ? (
              gallery.map((imageUrl, index) => (
                <Image
                  key={`${imageUrl}-${index}`}
                  src={imageUrl}
                  style={index === 0 ? styles.galleryMain : styles.galleryItem}
                />
              ))
            ) : (
              <View style={styles.galleryEmpty}>
                <Text>No hay imagenes disponibles para esta unidad.</Text>
              </View>
            )}
          </View>

          <View style={styles.specCol}>
            {specs.map(([label, value]) => (
              <View key={label} style={styles.specRow}>
                <Text style={styles.specLabel}>{label}</Text>
                <Text style={styles.specValue}>{toText(value)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLeftTitle}>Mi Oficina Virtual</Text>
            <Text style={styles.footerLeftText}>Documento comercial para cliente</Text>
          </View>
          <Text style={styles.footerRight}>
            {`Generado: ${generatedDate}\nInformacion sujeta a disponibilidad y confirmacion comercial.`}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

