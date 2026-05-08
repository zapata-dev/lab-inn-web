export const IVA_RATE = 0.16

const toNumber = (value) => {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

const clampPercent = (value) => {
  const numeric = toNumber(value)
  if (numeric < 0) return 0
  if (numeric > 100) return 100
  return numeric
}

const roundCurrency = (value) => Number(toNumber(value).toFixed(2))

export const calculateSubtotal = ({ price = 0, discount = 0, accessories = 0 }) => {
  const basePrice = toNumber(price)
  const accessoriesTotal = toNumber(accessories)
  const discountPercent = clampPercent(discount)
  const discountAmount = basePrice * (discountPercent / 100)

  return roundCurrency(basePrice - discountAmount + accessoriesTotal)
}

export const calculateIVA = (subtotal, rate = IVA_RATE) => {
  const safeSubtotal = toNumber(subtotal)
  const safeRate = toNumber(rate)
  return roundCurrency(safeSubtotal * safeRate)
}

export const calculateTotal = ({ price = 0, discount = 0, accessories = 0, ivaRate = IVA_RATE }) => {
  const subtotal = calculateSubtotal({ price, discount, accessories })
  const iva = calculateIVA(subtotal, ivaRate)
  return roundCurrency(subtotal + iva)
}

export const calculateMargin = ({ price = 0, cost = 0 }) => roundCurrency(toNumber(price) - toNumber(cost))

export const calculateMarginPercent = ({ price = 0, cost = 0 }) => {
  const safePrice = toNumber(price)
  if (safePrice <= 0) return 0

  const margin = calculateMargin({ price: safePrice, cost })
  return roundCurrency((margin / safePrice) * 100)
}

export const calculateCostPerKm = ({ totalCost = 0, km = 0 }) => {
  const safeKm = toNumber(km)
  if (safeKm <= 0) return 0
  return roundCurrency(toNumber(totalCost) / safeKm)
}
