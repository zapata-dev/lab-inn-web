function sanitizeFilename(name) {
  return String(name || 'export.csv')
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
}

export function escapeCsvValue(value) {
  const normalized = value == null ? '' : String(value)
  const escaped = normalized.replace(/"/g, '""')

  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`
  }

  return escaped
}

export function convertRowsToCsv(rows, columns) {
  const safeRows = Array.isArray(rows) ? rows : []
  const safeColumns = Array.isArray(columns) ? columns : []

  const headerLine = safeColumns.map((column) => escapeCsvValue(column?.label || column?.key || '')).join(',')
  const valueLines = safeRows.map((row) =>
    safeColumns
      .map((column) => escapeCsvValue(row?.[column?.key]))
      .join(',')
  )

  return [headerLine, ...valueLines].join('\n')
}

export function downloadCsv(filename, rows, columns) {
  const csvContent = convertRowsToCsv(rows, columns)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = sanitizeFilename(filename || 'export.csv')
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
