function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function sanitizeHeader(header) {
  const text = normalizeText(header).replace(/[^a-z0-9]+/g, ' ').trim()
  if (!text) return ''

  const words = text.split(/\s+/)
  return words
    .map((word, index) => (index === 0 ? word : `${word.charAt(0).toUpperCase()}${word.slice(1)}`))
    .join('')
}

export function parseCsvLine(line = '') {
  const values = []
  let buffer = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        buffer += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (character === ',' && !inQuotes) {
      values.push(buffer.trim())
      buffer = ''
      continue
    }

    buffer += character
  }

  values.push(buffer.trim())
  return values
}

function parseRows(csvText = '') {
  const rows = []
  let row = []
  let buffer = ''
  let inQuotes = false

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index]
    const nextCharacter = csvText[index + 1]

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        buffer += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (character === ',' && !inQuotes) {
      row.push(buffer.trim())
      buffer = ''
      continue
    }

    if ((character === '\n' || character === '\r') && !inQuotes) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1
      }

      row.push(buffer.trim())
      rows.push(row)
      row = []
      buffer = ''
      continue
    }

    buffer += character
  }

  if (buffer.length > 0 || row.length > 0) {
    row.push(buffer.trim())
    rows.push(row)
  }

  return rows.filter((currentRow) => currentRow.some((value) => String(value).trim().length > 0))
}

export function parseCsv(csvText = '') {
  const rows = parseRows(csvText)
  if (!rows.length) return []

  const headers = rows[0].map((header, index) => sanitizeHeader(header) || `column${index + 1}`)

  return rows.slice(1).map((row) => {
    const mapped = {}

    headers.forEach((header, columnIndex) => {
      mapped[header] = String(row[columnIndex] ?? '').trim()
    })

    return mapped
  })
}
