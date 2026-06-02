import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

const CONTACT_EMAIL = 'innovaciogoon@zapata.com.mx'

const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingBottom: 24,
    paddingHorizontal: 26,
    fontFamily: 'Helvetica',
    color: '#10213a',
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
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#0e4ea6',
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 3.4,
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: 700,
  },
  brandSubtitle: {
    marginTop: 1,
    fontSize: 9,
    color: '#5f7086',
  },
  metaDate: {
    fontSize: 8,
    color: '#5f7086',
    textAlign: 'right',
    marginBottom: 4,
  },
  status: {
    fontSize: 8,
    color: '#164f98',
    borderWidth: 1,
    borderColor: '#c7dcff',
    backgroundColor: '#eaf2ff',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  hero: {
    width: '100%',
    height: 305,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccdae8',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0b1628',
    opacity: 0.44,
  },
  heroFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf3fb',
  },
  heroFallbackText: {
    fontSize: 10,
    color: '#5f7086',
  },
  heroCopy: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 27,
    fontWeight: 700,
    lineHeight: 1.08,
  },
  heroSubtitle: {
    color: '#ffffff',
    fontSize: 10,
    marginTop: 3,
    opacity: 0.95,
  },
  pricePanel: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 210,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfd6ff',
    backgroundColor: '#e9f2ff',
    paddingVertical: 8,
    paddingHorizontal: 9,
  },
  priceLabel: {
    fontSize: 8,
    color: '#275189',
    textTransform: 'uppercase',
  },
  priceValue: {
    marginTop: 4,
    fontSize: 24,
    color: '#0e4ea6',
    fontWeight: 700,
    lineHeight: 1.05,
  },
  vinText: {
    marginTop: 4,
    fontSize: 8,
    color: '#3f587d',
  },
  keyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  keyCard: {
    width: '32%',
    borderWidth: 1,
    borderColor: '#d7e3f2',
    borderRadius: 8,
    backgroundColor: '#f8fbff',
    paddingVertical: 6,
    paddingHorizontal: 7,
  },
  keyLabel: {
    fontSize: 8,
    color: '#607188',
  },
  keyValue: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: 700,
    color: '#10213a',
  },
  cta: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#cfe0ff',
    borderRadius: 10,
    backgroundColor: '#edf3ff',
    paddingVertical: 7,
    paddingHorizontal: 9,
  },
  ctaTitle: {
    fontSize: 9,
    color: '#1a3661',
  },
  ctaEmail: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: 700,
    color: '#0e4ea6',
  },
  sectionEyebrow: {
    fontSize: 10,
    color: '#607188',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  pageTwoLayout: {
    flexDirection: 'row',
    gap: 8,
  },
  galleryColumn: {
    width: '66%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  galleryMain: {
    width: '100%',
    height: 195,
    borderRadius: 8,
    objectFit: 'cover',
  },
  galleryItem: {
    width: '48.5%',
    height: 122,
    borderRadius: 8,
    objectFit: 'cover',
  },
  galleryEmpty: {
    width: '100%',
    height: 195,
    borderWidth: 1,
    borderColor: '#d8e2ef',
    borderRadius: 8,
    backgroundColor: '#f8fbff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryEmptyText: {
    fontSize: 9,
    color: '#607188',
  },
  specColumn: {
    width: '34%',
    borderWidth: 1,
    borderColor: '#d7e3f2',
    borderRadius: 8,
    backgroundColor: '#fbfdff',
    paddingVertical: 6,
    paddingHorizontal: 7,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eef8',
    paddingVertical: 3,
  },
  specLabel: {
    width: '44%',
    fontSize: 8,
    color: '#607188',
  },
  specValue: {
    width: '56%',
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'right',
    color: '#10213a',
  },
  footer: {
    marginTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#dce5f1',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  footerLeftTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#10213a',
  },
  footerLeftText: {
    marginTop: 1,
    fontSize: 8,
    color: '#607188',
  },
  footerRight: {
    fontSize: 8,
    color: '#607188',
    lineHeight: 1.35,
    textAlign: 'right',
  },
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
    { label: 'Transmisión', value: toText(unit.transmision) },
    { label: 'Ubicación', value: location },
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
    ['Promoción', unit.promocion],
  ]

  return (
    <Document title={`${brand} ${model} ${year}`}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.topbar}>
          <View style={styles.brand}>
            <Text style={styles.brandMark}>LAB</Text>
            <View>
              <Text style={styles.brandTitle}>Mi Oficina Virtual</Text>
              <Text style={styles.brandSubtitle}>Ficha comercial de unidad</Text>
            </View>
          </View>
          <View>
            <Text style={styles.metaDate}>Generado: {generatedDate}</Text>
            <Text style={styles.status}>{status}</Text>
          </View>
        </View>

        <View style={styles.hero}>
          {cover ? (
            <>
              <Image src={cover} style={styles.heroImage} />
              <View style={styles.heroShade} />
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>{`${brand} ${model}`}</Text>
                <Text style={styles.heroSubtitle}>{`Año ${year} | ${location}`}</Text>
              </View>
            </>
          ) : (
            <View style={styles.heroFallback}>
              <Text style={styles.heroFallbackText}>Imagen principal por confirmar</Text>
            </View>
          )}

          <View style={styles.pricePanel}>
            <Text style={styles.priceLabel}>Precio publicado</Text>
            <Text style={styles.priceValue}>{price}</Text>
            <Text style={styles.vinText}>{`VIN corto: ${vinShort}`}</Text>
          </View>
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
          <Text style={styles.ctaTitle}>Para más información, contacta al equipo comercial.</Text>
          <Text style={styles.ctaEmail}>{CONTACT_EMAIL}</Text>
        </View>
      </Page>

      <Page size="LETTER" style={styles.page}>
        <Text style={styles.sectionEyebrow}>Galeria comercial y especificaciones</Text>
        <View style={styles.pageTwoLayout}>
          <View style={styles.galleryColumn}>
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
                <Text style={styles.galleryEmptyText}>No hay imagenes disponibles para esta unidad.</Text>
              </View>
            )}
          </View>

          <View style={styles.specColumn}>
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
            {`Generado: ${generatedDate}\nInformación sujeta a disponibilidad y confirmación comercial.`}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
