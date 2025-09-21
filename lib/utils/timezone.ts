import { format, toZonedTime, fromZonedTime } from 'date-fns-tz'

// Lista de zonas horarias soportadas para México y América Latina
export const SUPPORTED_TIMEZONES = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (CST)', offset: 'UTC-6' },
  { value: 'America/Cancun', label: 'Cancún (EST)', offset: 'UTC-5' },
  { value: 'America/Tijuana', label: 'Tijuana (PST)', offset: 'UTC-8' },
  { value: 'America/Hermosillo', label: 'Hermosillo (MST)', offset: 'UTC-7' },
  { value: 'America/Chihuahua', label: 'Chihuahua (MST)', offset: 'UTC-7' },
  { value: 'America/Mazatlan', label: 'Mazatlán (MST)', offset: 'UTC-7' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)', offset: 'UTC-3' },
  { value: 'America/Santiago', label: 'Santiago (CLT)', offset: 'UTC-4' },
  { value: 'America/Lima', label: 'Lima (PET)', offset: 'UTC-5' },
  { value: 'America/Bogota', label: 'Bogotá (COT)', offset: 'UTC-5' },
  { value: 'America/Caracas', label: 'Caracas (VET)', offset: 'UTC-4' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: 'UTC-3' },
  { value: 'Europe/Madrid', label: 'Madrid (CET)', offset: 'UTC+1' },
]

/**
 * Obtiene la fecha/hora actual en la zona horaria del club
 */
export function getNowInTimezone(timezone: string = 'America/Mexico_City'): Date {
  return toZonedTime(new Date(), timezone)
}

/**
 * Convierte una fecha/hora local (del navegador) a la zona horaria del club
 */
export function toClubTimezone(date: Date | string, timezone: string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return toZonedTime(dateObj, timezone)
}

/**
 * Convierte una fecha/hora de la zona del club a UTC para guardar en DB
 */
export function fromClubTimezone(date: Date | string, timezone: string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return fromZonedTime(dateObj, timezone)
}

/**
 * Formatea una fecha en la zona horaria del club
 */
export function formatInTimezone(
  date: Date | string, 
  timezone: string, 
  formatStr: string = 'yyyy-MM-dd HH:mm'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const zonedDate = toZonedTime(dateObj, timezone)
  return format(zonedDate, formatStr, { timeZone: timezone })
}

/**
 * Crea una fecha específica en la zona horaria del club
 * Útil para crear fechas de reservas
 */
export function createDateInTimezone(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number = 0,
  minute: number = 0,
  timezone: string = 'America/Mexico_City'
): Date {
  // Crear la fecha como string en la zona horaria local
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
  
  // Convertir a Date considerando la zona horaria
  return fromZonedTime(new Date(dateStr), timezone)
}

/**
 * Compara si un horario específico ya pasó en la zona horaria del club
 */
export function isTimeInPast(
  timeStr: string, // formato "HH:mm"
  date: Date | string,
  timezone: string,
  bufferMinutes: number = 15
): boolean {
  const [hour, minute] = timeStr.split(':').map(Number)
  
  // Parsear la fecha correctamente si es string
  let year, month, day
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    [year, month, day] = date.split('-').map(Number)
  } else {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    year = dateObj.getFullYear()
    month = dateObj.getMonth() + 1
    day = dateObj.getDate()
  }
  
  // Crear fecha/hora del slot
  const slotDate = new Date(year, month - 1, day, hour, minute, 0, 0)
  
  // Obtener la hora actual
  const now = new Date()
  
  // Agregar buffer de minutos
  const nowWithBuffer = new Date(now)
  nowWithBuffer.setMinutes(nowWithBuffer.getMinutes() + bufferMinutes)
  
  return slotDate < nowWithBuffer
}

/**
 * Obtiene el inicio y fin del día en la zona horaria del club
 */
export function getDayBoundariesInTimezone(
  date: Date | string,
  timezone: string
): { start: Date; end: Date } {
  // Si es string en formato YYYY-MM-DD, parsearlo correctamente
  let year, month, day
  
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    [year, month, day] = date.split('-').map(Number)
  } else {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    year = dateObj.getFullYear()
    month = dateObj.getMonth() + 1
    day = dateObj.getDate()
  }
  
  // Crear las fechas directamente sin conversión de zona
  const start = new Date(year, month - 1, day, 0, 0, 0, 0)
  const end = new Date(year, month - 1, day, 23, 59, 59, 999)
  
  return { start, end }
}