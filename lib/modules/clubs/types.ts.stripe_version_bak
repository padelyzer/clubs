// Club module types

import { BaseEntity, EntityStatus } from '../shared/types'

export interface Club extends BaseEntity {
  name: string
  slug: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode?: string
  website?: string
  logo?: string
  description?: string
  status: ClubStatus
  active: boolean
  whatsappNumber?: string
  
  // Stripe integration
  stripeAccountId?: string
  stripeOnboardingCompleted: boolean
  stripePayoutsEnabled: boolean
  stripeChargesEnabled: boolean
  stripeDetailsSubmitted: boolean
  stripeRequirements?: string
  stripeCommissionRate: number // In basis points (250 = 2.5%)
  
  approvedAt?: Date | string
  approvedBy?: string
}

export interface ClubSettings extends BaseEntity {
  clubId: string
  slotDuration: number // In minutes
  bufferTime: number // In minutes
  advanceBookingDays: number
  allowSameDayBooking: boolean
  currency: string
  taxIncluded: boolean
  taxRate: number // Percentage
  cancellationFee: number // Percentage
  noShowFee: number // Percentage
}

export interface Court extends BaseEntity {
  clubId: string
  name: string
  type: CourtType
  indoor: boolean
  order: number
  active: boolean
}

export type ClubStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

export type CourtType = 'PADEL' | 'TENNIS' | 'SQUASH'

export interface ClubWithRelations extends Club {
  settings?: ClubSettings
  courts?: Court[]
  _count?: {
    users: number
    courts: number
    bookings: number
    tournaments: number
  }
}

export interface ClubFilters {
  status?: ClubStatus
  city?: string
  search?: string
  active?: boolean
}

export interface ClubStats {
  total: number
  pending: number
  approved: number
  rejected: number
  suspended: number
  active: number
}