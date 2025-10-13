import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Email inválido')
export const phoneSchema = z.string().regex(/^(\+52)?[0-9]{10}$/, 'Teléfono debe tener 10 dígitos')
export const passwordSchema = z.string()
  .min(8, 'Password debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Password debe tener al menos una mayúscula')
  .regex(/[a-z]/, 'Password debe tener al menos una minúscula')
  .regex(/[0-9]/, 'Password debe tener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Password debe tener al menos un carácter especial')

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password es requerido')
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token es requerido'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

// Club schemas
export const clubRegistrationSchema = z.object({
  name: z.string().min(2, 'Nombre del club debe tener al menos 2 caracteres'),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().min(5, 'Dirección debe tener al menos 5 caracteres'),
  city: z.string().min(2, 'Ciudad es requerida'),
  state: z.string().min(2, 'Estado es requerido'),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'Código postal debe tener 5 dígitos'),
  description: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  ownerName: z.string().min(2, 'Nombre del propietario es requerido'),
  ownerEmail: emailSchema,
  ownerPhone: phoneSchema
})

export const clubUpdateSchema = clubRegistrationSchema.partial()

// Court schemas
export const courtSchema = z.object({
  name: z.string().min(1, 'Nombre de la cancha es requerido'),
  type: z.enum(['PADEL', 'TENNIS', 'MULTIPURPOSE']),
  indoor: z.boolean(),
  active: z.boolean(),
  order: z.number().int().min(1, 'Orden debe ser mayor a 0').optional()
})

export const courtUpdateSchema = courtSchema.partial()

// Booking schemas
export const bookingSchema = z.object({
  courtId: z.string().uuid('ID de cancha inválido'),
  date: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: 'Fecha inválida'
  }),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de inicio inválida'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de fin inválida'),
  playerName: z.string().min(2, 'Nombre del jugador es requerido'),
  playerEmail: emailSchema,
  playerPhone: phoneSchema,
  totalPlayers: z.number().int().min(2).max(4, 'Máximo 4 jugadores'),
  notes: z.string().optional(),
  paymentType: z.enum(['FULL', 'ONSITE', 'SPLIT'])
}).refine(data => {
  const start = new Date(`2000-01-01T${data.startTime}`)
  const end = new Date(`2000-01-01T${data.endTime}`)
  return start < end
}, {
  message: 'Hora de fin debe ser después de la hora de inicio',
  path: ['endTime']
})

export const splitPaymentSchema = z.object({
  bookingId: z.string().uuid('ID de reserva inválido'),
  playerName: z.string().min(2, 'Nombre del jugador es requerido'),
  playerEmail: emailSchema,
  playerPhone: phoneSchema,
  amount: z.number().positive('Monto debe ser positivo')
})

// Schedule schemas
export const scheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6, 'Día de la semana inválido'),
  openTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de apertura inválida'),
  closeTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora de cierre inválida'),
  active: z.boolean()
}).refine(data => {
  const open = new Date(`2000-01-01T${data.openTime}`)
  const close = new Date(`2000-01-01T${data.closeTime}`)
  return open < close
}, {
  message: 'Hora de cierre debe ser después de la hora de apertura',
  path: ['closeTime']
})

// Pricing schemas
export const pricingSchema = z.object({
  hourlyRate: z.number().positive('Tarifa por hora debe ser positiva'),
  peakHourRate: z.number().positive('Tarifa en hora pico debe ser positiva').optional(),
  weekendRate: z.number().positive('Tarifa de fin de semana debe ser positiva').optional(),
  currency: z.enum(['MXN', 'USD']).default('MXN')
})

// Payment schemas
export const paymentIntentSchema = z.object({
  bookingId: z.string().uuid('ID de reserva inválido'),
  splitPaymentId: z.string().uuid('ID de pago dividido inválido').optional(),
  paymentMethod: z.enum(['CARD', 'OXXO', 'SPEI']).default('CARD')
})

export const paymentConfirmationSchema = z.object({
  paymentIntentId: z.string().min(1, 'ID de intención de pago es requerido'),
  metadata: z.record(z.string()).optional()
})

// WhatsApp schemas
export const whatsappMessageSchema = z.object({
  to: phoneSchema,
  templateName: z.string().min(1, 'Nombre de plantilla es requerido'),
  templateData: z.record(z.string()),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL')
})

export const bulkWhatsappSchema = z.object({
  recipients: z.array(z.object({
    phone: phoneSchema,
    templateName: z.string(),
    templateData: z.record(z.string())
  })).min(1, 'Al menos un destinatario es requerido').max(100, 'Máximo 100 destinatarios'),
  batchSize: z.number().int().min(1).max(10).default(5),
  delayMs: z.number().int().min(1000).max(10000).default(2000)
})

// Admin schemas
export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').optional(),
  email: emailSchema.optional(),
  role: z.enum(['USER', 'CLUB_OWNER', 'CLUB_STAFF', 'SUPER_ADMIN']).optional(),
  active: z.boolean().optional(),
  clubId: z.string().uuid('ID de club inválido').optional()
})

export const clubStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']),
  reason: z.string().optional()
})

// Search and filter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export const dateRangeSchema = z.object({
  dateFrom: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: 'Fecha de inicio inválida'
  }).optional(),
  dateTo: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: 'Fecha de fin inválida'
  }).optional()
}).refine(data => {
  if (data.dateFrom && data.dateTo) {
    return new Date(data.dateFrom) <= new Date(data.dateTo)
  }
  return true
}, {
  message: 'Fecha de fin debe ser después de fecha de inicio',
  path: ['dateTo']
})

// Widget schemas
export const widgetConfigSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color primario inválido'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color secundario inválido'),
  showClubInfo: z.boolean().default(true),
  showPrices: z.boolean().default(true),
  allowBooking: z.boolean().default(true),
  maxDaysAdvance: z.number().int().min(1).max(90).default(30),
  language: z.enum(['es', 'en']).default('es')
})

// Type exports for use in components
export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type ClubRegistrationForm = z.infer<typeof clubRegistrationSchema>
export type BookingForm = z.infer<typeof bookingSchema>
export type CourtForm = z.infer<typeof courtSchema>
export type ScheduleForm = z.infer<typeof scheduleSchema>
export type PricingForm = z.infer<typeof pricingSchema>
export type WhatsAppMessageForm = z.infer<typeof whatsappMessageSchema>
export type PaginationParams = z.infer<typeof paginationSchema>
export type DateRangeParams = z.infer<typeof dateRangeSchema>
export type WidgetConfigForm = z.infer<typeof widgetConfigSchema>

/**
 * Utility function to validate request body with better error formatting
 */
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  customMessages?: Record<string, string>
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      
      if (error.issues && Array.isArray(error.issues)) {
        error.issues.forEach(err => {
          const path = err.path.join('.')
          errors[path] = customMessages?.[path] || err.message
        })
      }
      
      return { success: false, errors }
    }
    
    return { success: false, errors: { general: 'Validation failed' } }
  }
}

/**
 * Middleware for API route validation
 */
export function withValidation<T>(schema: z.ZodSchema<T>) {
  return function (handler: (data: T, request: Request) => Promise<Response>) {
    return async function (request: Request): Promise<Response> {
      try {
        const body = await request.json()
        const validation = validateRequestBody(schema, body)
        
        if (!validation.success) {
          return new Response(
            JSON.stringify({
              error: 'Validation failed',
              details: 'errors' in validation ? validation.errors : {}
            }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
        
        return handler(validation.data, request)
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Invalid JSON payload'
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
    }
  }
}