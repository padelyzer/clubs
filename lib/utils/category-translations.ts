/**
 * Mapeo de categorías de finanzas entre inglés y español
 */

export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  // Income categories
  'BOOKING': 'RESERVAS',
  'CLASS': 'CLASES',
  'TOURNAMENT': 'TORNEOS',
  'MEMBERSHIP': 'MEMBRESÍAS',
  'EQUIPMENT_SALE': 'VENTA_EQUIPOS',
  'OTHER_INCOME': 'OTROS_INGRESOS',

  // Expense categories
  'SALARY': 'NOMINA',
  'UTILITIES': 'SERVICIOS',
  'MAINTENANCE': 'MANTENIMIENTO',
  'EQUIPMENT': 'EQUIPAMIENTO',
  'MARKETING': 'MARKETING',
  'RENT': 'RENTA',
  'OTHER': 'OTROS',
  'INSTRUCTOR_PAYMENT': 'PAGO_INSTRUCTORES',
  'COMMISSION': 'COMISIONES'
}

export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  // Income display names
  'BOOKING': 'Reservas',
  'CLASS': 'Clases',
  'TOURNAMENT': 'Torneos',
  'MEMBERSHIP': 'Membresías',
  'EQUIPMENT': 'Equipamiento',
  'OTHER': 'Otros',

  // Expense display names
  'SALARY': 'Nómina',
  'UTILITIES': 'Servicios',
  'MAINTENANCE': 'Mantenimiento',
  'MARKETING': 'Marketing',
  'RENT': 'Renta',

  // Additional mappings for compatibility
  'NOMINA': 'Nómina',
  'SERVICIOS': 'Servicios',
  'MANTENIMIENTO': 'Mantenimiento',
  'EQUIPAMIENTO': 'Equipamiento',
  'RENTA': 'Renta',
  'OTROS': 'Otros',
  'INSTRUCTOR_PAYMENT': 'Pago Instructores',
  'PAGO_INSTRUCTORES': 'Pago Instructores',
  'COMMISSION': 'Comisiones',
  'COMISIONES': 'Comisiones'
}

/**
 * Obtiene el nombre para mostrar de una categoría
 */
export function getCategoryDisplayName(category: string): string {
  return CATEGORY_DISPLAY_NAMES[category] || category
}

/**
 * Traduce una categoría del inglés al español
 */
export function translateCategory(category: string): string {
  return CATEGORY_TRANSLATIONS[category] || category
}