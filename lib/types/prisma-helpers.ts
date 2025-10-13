/**
 * Prisma Type Helpers
 *
 * Este archivo contiene tipos reutilizables generados a partir del schema de Prisma.
 * Estos tipos garantizan consistencia entre el código y la base de datos.
 *
 * USO:
 * - Importar estos tipos en lugar de definir tipos locales
 * - Extender estos tipos si necesitas propiedades adicionales
 */

import { Prisma } from '@prisma/client'

// ============================================================================
// BOOKING TYPES
// ============================================================================

/**
 * Booking con todas las relaciones comunes
 */
export type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    courtId: true
    Club: true
    Player: true
    splitPaymentId: true
    Notification: true
  }
}>

/**
 * Booking con solo Court para listados
 */
export type BookingWithCourt = Prisma.BookingGetPayload<{
  include: {
    courtId: true
    splitPaymentId: true
  }
}>

/**
 * Booking con Court y Club (más común)
 */
export type BookingWithCourtAndClub = Prisma.BookingGetPayload<{
  include: {
    courtId: true
    Club: true
  }
}>

/**
 * Booking completo con todas las relaciones y pagos
 */
export type BookingComplete = Prisma.BookingGetPayload<{
  include: {
    courtId: true
    Club: true
    Player: true
    splitPaymentId: true
    Payment: true
    Transaction: true
    Notification: true
    BookingGroup: true
  }
}>

// ============================================================================
// BOOKING GROUP TYPES
// ============================================================================

/**
 * BookingGroup con bookings relacionados
 */
export type BookingGroupWithBookings = Prisma.BookingGroupGetPayload<{
  include: {
    bookingId: {
      include: {
        courtId: true
      }
    }
    Club: true
    splitPayments: true
  }
}>

/**
 * BookingGroup completo
 */
export type BookingGroupComplete = Prisma.BookingGroupGetPayload<{
  include: {
    bookingId: {
      include: {
        courtId: true
      }
    }
    Club: true
    splitPayments: true
    Payment: true
  }
}>

// ============================================================================
// CLASS TYPES
// ============================================================================

/**
 * Class con todas las relaciones comunes
 */
export type ClassWithRelations = Prisma.ClassGetPayload<{
  include: {
    courtId: true
    Club: true
    Instructor: true
    ClassBooking: true
  }
}>

/**
 * Class con solo Court e Instructor
 */
export type ClassWithCourtAndInstructor = Prisma.ClassGetPayload<{
  include: {
    courtId: true
    Instructor: true
  }
}>

/**
 * Class completo con todos los bookings y estudiantes
 */
export type ClassComplete = Prisma.ClassGetPayload<{
  include: {
    courtId: true
    Club: true
    Instructor: true
    ClassBooking: {
      include: {
        Player: true
      }
    }
  }
}>

// ============================================================================
// COURT TYPES
// ============================================================================

/**
 * Court con relaciones comunes
 */
export type CourtWithRelations = Prisma.CourtGetPayload<{
  include: {
    Club: true
    bookingId: true
    Class: true
  }
}>

/**
 * Court simple con solo Club
 */
export type CourtWithClub = Prisma.CourtGetPayload<{
  include: {
    Club: true
  }
}>

// ============================================================================
// CLUB TYPES
// ============================================================================

/**
 * Club con todas sus configuraciones
 */
export type ClubWithSettings = Prisma.ClubGetPayload<{
  include: {
    ClubSettings: true
    clubModules: true
  }
}>

/**
 * Club con courts e instructores
 */
export type ClubWithCourtsAndInstructors = Prisma.ClubGetPayload<{
  include: {
    courtId: true
    Instructor: true
    ClubSettings: true
  }
}>

/**
 * Club completo (para admin)
 */
export type ClubComplete = Prisma.ClubGetPayload<{
  include: {
    courtId: true
    Instructor: true
    ClubSettings: true
    clubModules: true
    clubPackage: true
    bookingId: true
    Class: true
  }
}>

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

/**
 * Notification con Booking relacionado
 */
export type NotificationWithBooking = Prisma.NotificationGetPayload<{
  include: {
    bookingId: {
      include: {
        courtId: true
        Club: true
      }
    }
    SplitPayment: true
  }
}>

// ============================================================================
// PLAYER TYPES
// ============================================================================

/**
 * Player con bookings
 */
export type PlayerWithBookings = Prisma.PlayerGetPayload<{
  include: {
    bookingId: {
      include: {
        courtId: true
      }
    }
  }
}>

// ============================================================================
// INSTRUCTOR TYPES
// ============================================================================

/**
 * Instructor con clases
 */
export type InstructorWithClasses = Prisma.InstructorGetPayload<{
  include: {
    Class: {
      include: {
        courtId: true
      }
    }
    Club: true
  }
}>

// ============================================================================
// SPLIT PAYMENT TYPES
// ============================================================================

/**
 * SplitPayment con Booking relacionado
 */
export type SplitPaymentWithBooking = Prisma.SplitPaymentGetPayload<{
  include: {
    bookingId: {
      include: {
        courtId: true
      }
    }
    BookingGroup: true
  }
}>

// ============================================================================
// TOURNAMENT TYPES
// ============================================================================

/**
 * Tournament con Club
 */
export type TournamentWithClub = Prisma.TournamentGetPayload<{
  include: {
    Club: true
  }
}>

/**
 * Tournament completo con todas las registraciones
 */
export type TournamentComplete = Prisma.TournamentGetPayload<{
  include: {
    Club: true
    TournamentRegistration: {
      include: {
        Player: true
      }
    }
  }
}>

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Tipo para datos de transacciones de bookings
 */
export type BookingTransaction = {
  id: string
  playerName: string
  courtName: string
  date: Date
  startTime: string
  endTime: string
  price: number
  paymentMethod: string
  paymentStatus: string
  reference: string
  createdAt: Date
}

/**
 * Tipo para estadísticas de bookings
 */
export type BookingStats = {
  total: number
  confirmed: number
  pending: number
  cancelled: number
  revenue: number
}

/**
 * Tipo para disponibilidad de cancha
 */
export type CourtAvailability = {
  courtId: string
  courtName: string
  date: Date
  availableSlots: string[]
  bookedSlots: string[]
}
