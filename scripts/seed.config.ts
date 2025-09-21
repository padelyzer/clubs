/**
 * Configuración personalizable para los scripts de seed
 * 
 * Modifica estos valores para personalizar los datos creados por el seed
 */

// Configuración del Club
export const CLUB_CONFIG = {
  id: 'default-club-id',
  name: 'Club Pádel México',
  slug: 'club-padel-mexico',
  email: 'info@clubpadel.mx',
  phone: '55 1234 5678',
  address: 'Av. Paseo de la Reforma 123',
  city: 'Ciudad de México',
  state: 'CDMX',
  country: 'México',
  postalCode: '06500',
  website: 'https://clubpadel.mx',
  description: 'El mejor club de pádel en Ciudad de México. Instalaciones de primera clase con tecnología moderna.',
  // Configuración Stripe del club
  stripeAccountId: 'acct_test_padel_mexico',
  stripeCommissionRate: 2.9 // 2.9% comisión
}

// Claves Stripe de Prueba
export const STRIPE_CONFIG = {
  publishableKey: 'pk_test_51RpHFZIyZijLvZlA2a1KdaWBtERNev1m0y01jDOPYJ7cicby1jomAZlDI1bkFkaWGJlUWPAjU1AZvmUgUTZJPyLl00GSJeNbyV',
  secretKey: 'sk_test_51RpHFZIyZijLvZlA0aBTkhZsZqiXtIwBErPU4vw2G3jyWriUJBKKPo0kM3Sh03oWXgvXQ99hFp7DJksAhYmDpBZn00Z1Tv3g6w',
  environment: 'test' as const,
  fees: {
    fixed: 30, // 30 centavos por transacción
    percentage: 2.9 // 2.9%
  }
}

// Configuración de Settings del Club
export const CLUB_SETTINGS = {
  slotDuration: 90, // 90 minutos por slot
  bufferTime: 15, // 15 minutos entre slots
  advanceBookingDays: 30, // 30 días de anticipación
  allowSameDayBooking: true,
  timezone: 'America/Mexico_City',
  currency: 'MXN',
  taxIncluded: true,
  taxRate: 16.0, // 16% IVA México
  cancellationFee: 0.0,
  noShowFee: 50.0,
  // Métodos de pago
  acceptCash: true,
  terminalEnabled: true,
  terminalId: 'TERM_001_PADEL_MX',
  transferEnabled: true,
  // Datos bancarios
  bankName: 'BBVA México',
  accountNumber: '0123456789',
  clabe: '012180001234567890',
  accountHolder: 'Club Pádel México S.A. de C.V.'
}

// Nombres mexicanos para usuarios de prueba
export const MEXICAN_NAMES = [
  { firstName: 'María', lastName: 'González', email: 'maria.gonzalez@email.com', phone: '55 1234 5678' },
  { firstName: 'José', lastName: 'Rodríguez', email: 'jose.rodriguez@email.com', phone: '55 2345 6789' },
  { firstName: 'Ana', lastName: 'Martínez', email: 'ana.martinez@email.com', phone: '55 3456 7890' },
  { firstName: 'Carlos', lastName: 'López', email: 'carlos.lopez@email.com', phone: '55 4567 8901' },
  { firstName: 'Laura', lastName: 'Hernández', email: 'laura.hernandez@email.com', phone: '55 5678 9012' },
  { firstName: 'Miguel', lastName: 'García', email: 'miguel.garcia@email.com', phone: '55 6789 0123' },
  { firstName: 'Sofía', lastName: 'Jiménez', email: 'sofia.jimenez@email.com', phone: '55 7890 1234' },
  { firstName: 'Diego', lastName: 'Ruiz', email: 'diego.ruiz@email.com', phone: '55 8901 2345' },
  { firstName: 'Valentina', lastName: 'Torres', email: 'valentina.torres@email.com', phone: '55 9012 3456' },
  { firstName: 'Sebastián', lastName: 'Flores', email: 'sebastian.flores@email.com', phone: '55 0123 4567' }
]

// Configuración de Canchas
export const COURTS_CONFIG = {
  names: ['Cancha Central', 'Cancha Premium', 'Cancha VIP', 'Cancha Norte', 'Cancha Sur'],
  type: 'PADEL' as const,
  indoorCount: 2 // Las primeras 2 canchas son techadas
}

// Configuración de Precios
export const PRICING_CONFIG = {
  // Precios de clases (en centavos MXN)
  individualPrice: 80000, // $800 MXN
  groupPrice: 50000,      // $500 MXN por persona
  clinicPrice: 35000,     // $350 MXN por persona
  
  // Configuración global de instructores
  instructorPaymentType: 'HOURLY' as const,
  instructorHourlyRate: 50000, // $500 MXN por hora
  instructorPercentage: 60.0,
  instructorFixedRate: 0,
  
  // Descuentos por volumen
  enableBulkDiscount: true,
  bulkDiscountThreshold: 10, // 10+ clases
  bulkDiscountPercentage: 15.0 // 15% descuento
}

// Configuración de Instructores
export const INSTRUCTORS_CONFIG = [
  {
    name: 'Roberto Sánchez',
    email: 'roberto.sanchez@clubpadel.mx',
    phone: '55 1111 2222',
    bio: 'Instructor certificado con 8 años de experiencia. Especializado en técnica y táctica avanzada.',
    specialties: ['Técnica', 'Táctica', 'Competición'],
    paymentType: 'HOURLY' as const,
    hourlyRate: 60000, // $600/hora
    monthlyRate: 0
  },
  {
    name: 'Patricia Morales',
    email: 'patricia.morales@clubpadel.mx',
    phone: '55 3333 4444',
    bio: 'Ex-jugadora profesional. Enfoque en desarrollo de principiantes y técnica fundamental.',
    specialties: ['Principiantes', 'Técnica básica', 'Coordinación'],
    paymentType: 'MONTHLY' as const,
    hourlyRate: 0,
    monthlyRate: 2500000 // $25,000 mensual
  },
  {
    name: 'Fernando Castillo',
    email: 'fernando.castillo@clubpadel.mx',
    phone: '55 5555 6666',
    bio: 'Especialista en preparación física y entrenamiento de alto rendimiento.',
    specialties: ['Preparación física', 'Alto rendimiento', 'Competición'],
    paymentType: 'HOURLY' as const,
    hourlyRate: 55000, // $550/hora
    monthlyRate: 0
  },
  {
    name: 'Andrea Vázquez',
    email: 'andrea.vazquez@clubpadel.mx',
    phone: '55 7777 8888',
    bio: 'Instructora especializada en clínicas y entrenamientos grupales.',
    specialties: ['Clínicas', 'Grupos', 'Técnica intermedia'],
    paymentType: 'MONTHLY' as const,
    hourlyRate: 0,
    monthlyRate: 2000000 // $20,000 mensual
  }
]

// Usuario Administrador
export const ADMIN_USER_CONFIG = {
  name: 'Administrador del Club',
  email: 'admin@clubpadel.mx',
  role: 'CLUB_OWNER' as const
}

// Configuración de Transacciones de Ejemplo
export const TRANSACTIONS_CONFIG = {
  incomeCount: 15, // Número de transacciones de ingreso
  expenseCount: 8, // Número de transacciones de gasto
  classPrices: [80000, 50000, 35000], // Precios de clase para transacciones
  categories: {
    income: ['BOOKING', 'CLASS', 'MEMBERSHIP'] as const,
    expense: ['MAINTENANCE', 'UTILITIES', 'EQUIPMENT', 'MARKETING'] as const
  },
  expenseRange: {
    min: 2000, // $2000 MXN mínimo
    max: 12000 // $12000 MXN máximo
  }
}

// Constantes generales
export const PADEL_LEVELS = ['Principiante', 'Intermedio', 'Avanzado', 'Profesional'] as const
export const GENDERS = ['male', 'female'] as const

// URL de la aplicación
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'