// Tournament module validation schemas

import { z } from 'zod'

export const createTournamentSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  description: z.string().optional(),
  type: z.enum(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS', 'GROUP_STAGE'])
    .default('SINGLE_ELIMINATION'),
  categories: z.array(z.string()).min(1, 'Debe seleccionar al menos una categoría'),
  registrationStart: z.string().datetime(),
  registrationEnd: z.string().datetime(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  maxPlayers: z.number().int().positive().default(16),
  registrationFee: z.number().min(0).default(0), // In pesos, will be converted to cents
  prizePool: z.number().min(0).default(0), // In pesos, will be converted to cents
  matchDuration: z.number().int().positive().default(90),
  sets: z.number().int().positive().default(3),
  games: z.number().int().positive().default(6),
  tiebreak: z.boolean().default(true),
  rules: z.string().optional(),
  notes: z.string().optional()
}).refine(data => new Date(data.registrationEnd) > new Date(data.registrationStart), {
  message: 'La fecha de fin de registro debe ser posterior a la fecha de inicio',
  path: ['registrationEnd']
}).refine(data => new Date(data.startDate) >= new Date(data.registrationEnd), {
  message: 'La fecha de inicio del torneo debe ser posterior al fin de registro',
  path: ['startDate']
})

export const updateTournamentSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS', 'GROUP_STAGE']).optional(),
  status: z.enum(['DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  registrationStart: z.string().datetime().optional(),
  registrationEnd: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  maxPlayers: z.number().int().positive().optional(),
  registrationFee: z.number().min(0).optional(), // In pesos
  prizePool: z.number().min(0).optional(), // In pesos
  matchDuration: z.number().int().positive().optional(),
  sets: z.number().int().positive().optional(),
  games: z.number().int().positive().optional(),
  tiebreak: z.boolean().optional(),
  rules: z.string().optional(),
  notes: z.string().optional()
})

export const createRegistrationSchema = z.object({
  player1Name: z.string().min(2, 'Nombre del jugador 1 es requerido'),
  player1Email: z.string().email('Email inválido').optional().or(z.literal('')),
  player1Phone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
  player1Level: z.string().optional(),
  
  // Player 2 is optional (for singles)
  player2Name: z.string().optional(),
  player2Email: z.string().email('Email inválido').optional().or(z.literal('')),
  player2Phone: z.string().min(10).optional(),
  player2Level: z.string().optional(),
  
  teamName: z.string().optional(),
  teamLevel: z.string().optional(),
  modality: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional()
})

export const updateMatchResultSchema = z.object({
  team1Score: z.number().int().min(0).max(10),
  team2Score: z.number().int().min(0).max(10),
  team1Sets: z.array(z.object({
    games: z.number().int().min(0),
    tiebreak: z.number().int().min(0).optional()
  })).optional(),
  team2Sets: z.array(z.object({
    games: z.number().int().min(0),
    tiebreak: z.number().int().min(0).optional()
  })).optional(),
  winner: z.enum(['team1', 'team2', 'draw']),
  status: z.enum(['COMPLETED', 'WALKOVER', 'NO_SHOW']).default('COMPLETED'),
  notes: z.string().optional()
})

export const scheduleMatchSchema = z.object({
  courtId: z.string().min(1, 'Cancha es requerida'),
  scheduledAt: z.string().datetime(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato: HH:MM'),
  courtNumber: z.string().optional()
})

export const paymentSchema = z.object({
  amount: z.number().positive(), // In pesos
  paymentMethod: z.enum(['cash', 'card', 'transfer', 'stripe']),
  paymentReference: z.string().optional(),
  notes: z.string().optional()
})

export const tournamentFilterSchema = z.object({
  status: z.enum(['DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  type: z.enum(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS', 'GROUP_STAGE']).optional(),
  upcoming: z.boolean().optional(),
  category: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10)
})