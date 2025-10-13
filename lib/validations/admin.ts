import { z } from 'zod'

// Subscription Plan Schemas
export const createSubscriptionPlanSchema = z.object({
  name: z.string().min(1).max(50).toLowerCase(),
  displayName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0).max(1000000),
  currency: z.enum(['MXN', 'USD']).default('MXN'),
  interval: z.enum(['MONTH', 'YEAR']).default('MONTH'),
  features: z.record(z.string(), z.any()).optional(),
  maxClubs: z.number().min(1).max(1000).optional(),
  maxUsers: z.number().min(1).max(10000).optional(),
  maxCourts: z.number().min(1).max(100).optional(),
  maxBookings: z.number().min(1).max(100000).optional(),
  commissionRate: z.number().min(0).max(10000).default(250), // basis points
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).max(100).default(0),
})

export const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.partial()

// Club Management Schemas
export const approveClubSchema = z.object({
  planId: z.string().uuid(),
  notes: z.string().max(500).optional(),
  sendNotification: z.boolean().default(true),
})

export const rejectClubSchema = z.object({
  reason: z.string().min(10).max(500),
  sendNotification: z.boolean().default(true),
})

export const suspendClubSchema = z.object({
  reason: z.string().min(10).max(500),
  suspendUntil: z.string().datetime().optional(),
  sendNotification: z.boolean().default(true),
})

// Invoice Schemas
export const createInvoiceSchema = z.object({
  subscriptionId: z.string().uuid(),
  amount: z.number().min(0).max(10000000),
  dueDate: z.string().datetime(),
  description: z.string().max(500).optional(),
})

export const markInvoicePaidSchema = z.object({
  paidAt: z.string().datetime().optional(),
  paymentMethod: z.enum(['CARD', 'TRANSFER', 'CASH', 'OTHER']).optional(),
  transactionId: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

// Export Schemas
export const exportDataSchema = z.object({
  type: z.enum(['clubs', 'users', 'bookings', 'invoices', 'analytics']),
  format: z.enum(['csv', 'json', 'xlsx']).default('csv'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  filters: z.record(z.string(), z.any()).optional(),
})

// Pagination Schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

// Search Schema
export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  fields: z.array(z.string()).optional(),
})

// Date Range Schema
export const dateRangeSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
})

// Audit Log Schema
export const auditLogSchema = z.object({
  action: z.string().min(1).max(100),
  entityType: z.string().min(1).max(50),
  entityId: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
})

// Email/Notification Schema
export const sendNotificationSchema = z.object({
  to: z.array(z.string().email()).min(1).max(100),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
  template: z.enum(['WELCOME', 'APPROVED', 'REJECTED', 'SUSPENDED', 'INVOICE', 'REMINDER']).optional(),
  variables: z.record(z.string(), z.any()).optional(),
})

// Validation helper
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  return { success: false, errors: result.error }
}

// Format validation errors for response
export function formatValidationErrors(errors: z.ZodError) {
  return errors.issues.map((err: z.ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }))
}