import { parseISO, format } from 'date-fns'

console.log('=== Test de parseo de fechas ===\n')

// Fecha actual
const now = new Date()
console.log('Fecha actual (new Date()):', now)
console.log('Año:', now.getFullYear())
console.log('')

// Format como en el BookingModal
const formattedDate = format(now, 'yyyy-MM-dd')
console.log('Fecha formateada (format):', formattedDate)
console.log('')

// ParseISO como en el API
const parsedDate = parseISO(formattedDate)
console.log('Fecha parseada (parseISO):', parsedDate)
console.log('Año después de parsear:', parsedDate.getFullYear())
console.log('')

// Simulación de lo que podría pasar
const testDate = '2025-08-19'
console.log('Test con string directo:', testDate)
const parsed = parseISO(testDate)
console.log('Parseado:', parsed)
console.log('Año:', parsed.getFullYear())
console.log('')

// Zona horaria
console.log('Zona horaria del sistema:', Intl.DateTimeFormat().resolvedOptions().timeZone)
console.log('Offset UTC:', now.getTimezoneOffset(), 'minutos')