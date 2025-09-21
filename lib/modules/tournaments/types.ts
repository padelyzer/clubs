// Tournament module types

import { BaseEntity } from '../shared/types'

export interface Tournament extends BaseEntity {
  clubId: string
  name: string
  description?: string
  type: TournamentType
  status: TournamentStatus
  category?: string
  categories?: any // JSON field for multiple categories
  
  // Dates
  registrationStart: Date | string
  registrationEnd: Date | string
  startDate: Date | string
  endDate?: Date | string
  
  // Configuration
  maxPlayers: number
  registrationFee: number // In cents
  prizePool: number // In cents
  currency: string
  matchDuration: number // In minutes
  sets: number
  games: number
  tiebreak: boolean
  rules?: string
  notes?: string
  
  createdBy?: string
}

export interface TournamentMatch extends BaseEntity {
  tournamentId: string
  roundId?: string
  round: string
  matchNumber: number
  
  // Teams/Players
  team1Name?: string
  team1Player1?: string
  team1Player2?: string
  team2Name?: string
  team2Player1?: string
  team2Player2?: string
  player1Id?: string
  player1Name?: string
  player2Id?: string
  player2Name?: string
  
  // Schedule
  courtId?: string
  courtNumber?: string
  scheduledAt?: Date | string
  startTime?: string
  endTime?: string
  matchDate?: string
  
  // QR Code
  qrCode?: string
  qrCodeUrl?: string
  qrValidUntil?: Date | string
  
  // Results
  team1Sets?: any // JSON
  team2Sets?: any // JSON
  team1Score?: number
  team2Score?: number
  winner?: string
  status: MatchStatus
  notes?: string
}

export interface TournamentRegistration extends BaseEntity {
  tournamentId: string
  
  // Player 1 (required)
  player1Id: string
  player1Name: string
  player1Email?: string
  player1Phone: string
  player1Level?: string
  
  // Player 2 (optional - for doubles)
  player2Id?: string
  player2Name?: string
  player2Email?: string
  player2Phone?: string
  player2Level?: string
  
  // Team info
  teamName?: string
  teamLevel?: string
  modality?: string
  category?: string
  
  // Payment
  paymentStatus: PaymentStatus
  paidAmount: number // In cents
  paymentMethod?: string
  paymentReference?: string
  paymentDate?: Date | string
  
  // Status
  confirmed: boolean
  checkedIn: boolean
  checkedInAt?: Date | string
  notes?: string
}

export interface TournamentRound extends BaseEntity {
  tournamentId: string
  name: string
  stage: string
  stageLabel: string
  modality: string
  category?: string
  division?: string
  status: RoundStatus
  matchesCount: number
  completedMatches: number
  startDate?: Date | string
  endDate?: Date | string
  notes?: string
}

export type TournamentType = 
  | 'SINGLE_ELIMINATION'
  | 'DOUBLE_ELIMINATION'
  | 'ROUND_ROBIN'
  | 'SWISS'
  | 'GROUP_STAGE'

export type TournamentStatus = 
  | 'DRAFT'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type MatchStatus = 
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'WALKOVER'
  | 'NO_SHOW'

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'partial'
  | 'refunded'
  | 'cancelled'

export type RoundStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'

export interface TournamentWithRelations extends Tournament {
  matches?: TournamentMatch[]
  registrations?: TournamentRegistration[]
  rounds?: TournamentRound[]
  _count?: {
    TournamentRegistration: number
    TournamentMatch: number
  }
}

export interface TournamentFilters {
  status?: TournamentStatus
  type?: TournamentType
  upcoming?: boolean
  category?: string
  page?: number
  pageSize?: number
}

export interface TournamentStats {
  total: number
  draft: number
  registrationOpen: number
  inProgress: number
  completed: number
  cancelled: number
  totalRegistrations: number
  totalRevenue: number // In cents
}