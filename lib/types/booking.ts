import { Prisma } from '@prisma/client'

// Base booking type from database - using any for complex Prisma types
export type BookingWithRelations = any

// Extended booking with computed fields
export interface BookingWithStatus extends BookingWithRelations {
  splitPaymentProgress: number
  splitPaymentComplete: boolean
}

// Simplified booking for client components
export interface BookingClientType {
  id: string
  date: Date
  startTime: string
  endTime: string
  duration: number
  playerName: string
  playerPhone: string
  playerEmail?: string | null
  totalPlayers: number
  price: number
  currency: string
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  paymentType: 'ONSITE' | 'ONLINE_FULL' | 'ONLINE_SPLIT'
  checkedIn: boolean
  checkedInAt?: Date | null
  checkedInBy?: string | null
  splitPaymentEnabled: boolean
  splitPaymentProgress?: number
  splitPaymentCount: number
  splitPaymentComplete?: boolean
  notes?: string | null
  clubId: string
  courtId: string
  createdAt: Date
  updatedAt: Date
  cancelledAt?: Date | null
  court: {
    id: string
    name: string
    type: 'PADEL' | 'TENIS'
    indoor: boolean
    active: boolean
    order: number
  }
  splitPayments?: Array<{
    id: string
    playerName: string
    playerEmail?: string
    playerPhone: string
    amount: number
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
    completedAt?: Date
  }>
  _count?: {
    splitPayments: number
    payments: number
  }
}

// Converter function from database to client type
export function toBookingClientType(booking: BookingWithStatus): BookingClientType {
  return {
    id: booking.id,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    duration: booking.duration,
    playerName: booking.playerName,
    playerPhone: booking.playerPhone,
    playerEmail: booking.playerEmail,
    totalPlayers: booking.totalPlayers,
    price: booking.price,
    currency: booking.currency,
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    paymentType: booking.paymentType,
    checkedIn: booking.checkedIn,
    checkedInAt: booking.checkedInAt,
    checkedInBy: booking.checkedInBy,
    splitPaymentEnabled: booking.splitPaymentEnabled,
    splitPaymentProgress: booking.splitPaymentProgress,
    splitPaymentCount: booking.splitPaymentCount,
    splitPaymentComplete: booking.splitPaymentComplete,
    notes: booking.notes,
    clubId: booking.clubId,
    courtId: booking.courtId,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    cancelledAt: booking.cancelledAt,
    court: {
      id: booking.Court.id,
      name: booking.Court.name,
      type: booking.Court.type,
      indoor: booking.Court.indoor,
      active: booking.Court.active,
      order: booking.Court.order
    },
    splitPayments: booking.SplitPayments?.map((sp: any) => ({
      id: sp.id,
      playerName: sp.playerName,
      playerEmail: sp.playerEmail || undefined,
      playerPhone: sp.playerPhone,
      amount: sp.amount,
      status: sp.status,
      completedAt: sp.completedAt || undefined
    })),
    _count: {
      splitPayments: booking._count.SplitPayments,
      payments: booking._count.Payments
    }
  }
}