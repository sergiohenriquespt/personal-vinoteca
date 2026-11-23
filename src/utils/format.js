export const fmtN   = (n, dec = 2) => n == null ? '—' : new Intl.NumberFormat('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(n)
export const fmtInt = (n) => n == null ? '—' : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)
export const fmt    = (n) => n != null ? fmtN(n) + ' €' : '—'
export const fmtNum = (n) => n != null ? fmtN(Number(n)) : ''

// PDF: sem separador de milhares para evitar problemas de rendering
export const pdfN   = (n, dec = 2) => n == null ? '—' : n.toFixed(dec).replace('.', ',')
export const pdfInt = (n) => n == null ? '—' : String(Math.round(n))
export const pdfFmt = (n) => n != null ? pdfN(n) + ' €' : '—'

export const totalV = (w) => (w.purchasePrice || 0) * (w.quantity || 0)

export const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

// Data local (YYYY-MM-DD) com desvio em dias; toISOString() dava o dia UTC (errado entre 00h e 01h no verão)
export const localISODate = (offsetDays = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
