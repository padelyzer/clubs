// Club module validation schemas

import { z } from 'zod'

export const createClubSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
  address: z.string().min(5, 'Dirección es requerida'),
  city: z.string().min(2, 'Ciudad es requerida'),
  state: z.string().default('Puebla'),
  country: z.string().default('Mexico'),
  postalCode: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  description: z.string().optional(),
  whatsappNumber: z.string().regex(/^\+\d{10,15}$/, 'Formato: +52XXXXXXXXXX').optional().or(z.literal(''))
})

export const updateClubSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  whatsappNumber: z.string().regex(/^\+\d{10,15}$/).optional().or(z.literal('')),
  active: z.boolean().optional()
})

export const clubSettingsSchema = z.object({
  slotDuration: z.number().int().min(30).max(240).default(90),
  bufferTime: z.number().int().min(0).max(60).default(15),
  advanceBookingDays: z.number().int().min(1).max(365).default(30),
  allowSameDayBooking: z.boolean().default(true),
  currency: z.enum(['MXN', 'USD', 'EUR']).default('MXN'),
  taxIncluded: z.boolean().default(true),
  taxRate: z.number().min(0).max(100).default(16),
  cancellationFee: z.number().min(0).max(100).default(0),
  noShowFee: z.number().min(0).max(100).default(50)
})

export const createCourtSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  type: z.enum(['PADEL', 'TENNIS', 'SQUASH']).default('PADEL'),
  indoor: z.boolean().default(false),
  order: z.number().int().min(1).default(1),
  active: z.boolean().default(true)
})

export const updateCourtSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['PADEL', 'TENNIS', 'SQUASH']).optional(),
  indoor: z.boolean().optional(),
  order: z.number().int().min(1).optional(),
  active: z.boolean().optional()
})

export const clubStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
  reason: z.string().optional()
})

export const clubFilterSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']).optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  active: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10)
})