/**
 * Tipos de Datos - Padelyzer México
 * Interfaces para todas las entidades del sistema
 */

// =============================================
// TIPOS BASE
// =============================================

export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

// =============================================
// USUARIO Y AUTENTICACIÓN
// =============================================

export interface User extends BaseEntity {
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone?: string
  avatar?: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: string
  preferences: UserPreferences
}

export type UserRole = 'super_admin' | 'club_admin' | 'club_staff' | 'player'

export interface UserPreferences {
  language: 'es-MX'
  timezone: string
  currency: 'MXN'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
  acceptTerms: boolean
}

// =============================================
// CLUB
// =============================================

export interface Club extends BaseEntity {
  name: string
  slug: string
  description?: string
  logo?: string
  address: Address
  contact: ContactInfo
  settings: ClubSettings
  subscription: ClubSubscription
  stats: ClubStats
  isActive: boolean
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: 'MX' // Solo México por ahora
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface ContactInfo {
  email: string
  phone: string
  website?: string
  socialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
  }
}

export interface ClubSettings {
  timezone: string
  currency: 'MXN'
  bookingRules: {
    maxAdvanceDays: number
    minAdvanceHours: number
    maxBookingsPerPlayer: number
    cancellationHours: number
  }
  operatingHours: {
    [key: string]: { // 'monday', 'tuesday', etc.
      isOpen: boolean
      open: string // '06:00'
      close: string // '23:00'
    }
  }
}

export interface ClubSubscription {
  plan: 'basic' | 'pro' | 'enterprise'
  status: 'active' | 'suspended' | 'cancelled'
  startDate: string
  endDate: string
  price: number
  features: string[]
}

export interface ClubStats {
  totalCourts: number
  totalPlayers: number
  totalBookings: number
  monthlyRevenue: number
  utilizationRate: number
  averageRating: number
}

// =============================================
// CANCHA
// =============================================

export interface Court extends BaseEntity {
  clubId: string
  name: string
  description?: string
  surface: CourtSurface
  isIndoor: boolean
  hasLighting: boolean
  isActive: boolean
  maintenanceStatus: MaintenanceStatus
  hourlyRate: number
  images?: string[]
  amenities: string[]
}

export type CourtSurface = 'grass' | 'artificial_grass' | 'clay' | 'hard_court' | 'concrete'

export type MaintenanceStatus = 'operational' | 'maintenance' | 'out_of_service'

export interface CourtAvailability {
  courtId: string
  date: string
  timeSlots: TimeSlot[]
}

export interface TimeSlot {
  startTime: string // '09:00'
  endTime: string // '10:30'
  isAvailable: boolean
  bookingId?: string
  price: number
}

// =============================================
// JUGADOR
// =============================================

export interface Player extends BaseEntity {
  clubId: string
  user: User
  membershipNumber: string
  level: PlayerLevel
  category: PlayerCategory
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  emergencyContact?: EmergencyContact
  membership: PlayerMembership
  stats: PlayerStats
  isActive: boolean
}

export type PlayerLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional'

export type PlayerCategory = 'junior' | 'adult' | 'senior'

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}

export interface PlayerMembership {
  type: 'monthly' | 'quarterly' | 'annual' | 'daily'
  status: 'active' | 'suspended' | 'expired'
  startDate: string
  endDate: string
  price: number
  benefits: string[]
}

export interface PlayerStats {
  totalMatches: number
  wins: number
  losses: number
  winRate: number
  totalBookings: number
  favoritePartners: string[]
  preferredCourts: string[]
  monthlyPlayTime: number // horas
}

// =============================================
// RESERVA
// =============================================

export interface Booking extends BaseEntity {
  clubId: string
  courtId: string
  playerId: string
  date: string
  startTime: string
  endTime: string
  duration: number // minutos
  price: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  notes?: string
  participants?: BookingParticipant[]
  recurringBooking?: RecurringBooking
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show'

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

export interface BookingParticipant {
  playerId: string
  playerName: string
  isGuest: boolean
}

export interface RecurringBooking {
  frequency: 'weekly' | 'biweekly' | 'monthly'
  endDate: string
  bookingIds: string[]
}

// =============================================
// TORNEO
// =============================================

export interface Tournament extends BaseEntity {
  clubId: string
  name: string
  description?: string
  category: TournamentCategory
  format: TournamentFormat
  maxParticipants: number
  registrationFee: number
  prizePool?: number
  startDate: string
  endDate: string
  registrationDeadline: string
  status: TournamentStatus
  rules?: string
  prizes?: TournamentPrize[]
  participants: TournamentParticipant[]
  matches: TournamentMatch[]
  bracket?: TournamentBracket
}

export type TournamentCategory = 'male' | 'female' | 'mixed' | 'junior' | 'senior'

export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss'

export type TournamentStatus = 'draft' | 'open_registration' | 'closed_registration' | 'in_progress' | 'completed' | 'cancelled'

export interface TournamentPrize {
  position: number
  amount: number
  description?: string
}

export interface TournamentParticipant {
  playerId: string
  playerName: string
  registrationDate: string
  seed?: number
  isEliminated: boolean
}

export interface TournamentMatch {
  id: string
  tournamentId: string
  round: number
  matchNumber: number
  player1Id: string
  player2Id: string
  courtId?: string
  scheduledDate?: string
  scheduledTime?: string
  status: MatchStatus
  result?: MatchResult
}

export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'walkover' | 'cancelled'

export interface MatchResult {
  winnerId: string
  loserId: string
  sets: SetResult[]
  duration?: number // minutos
}

export interface SetResult {
  player1Score: number
  player2Score: number
}

export interface TournamentBracket {
  rounds: BracketRound[]
  isBracketReady: boolean
}

export interface BracketRound {
  roundNumber: number
  roundName: string
  matches: TournamentMatch[]
}

// =============================================
// ANALÍTICAS
// =============================================

export interface DashboardAnalytics {
  clubId: string
  period: AnalyticsPeriod
  data: {
    revenue: RevenueAnalytics
    bookings: BookingAnalytics
    players: PlayerAnalytics
    courts: CourtAnalytics
    trends: TrendAnalytics
  }
}

export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year'

export interface RevenueAnalytics {
  total: number
  growth: number
  breakdown: {
    bookings: number
    memberships: number
    tournaments: number
    other: number
  }
  dailyRevenue: DailyMetric[]
}

export interface BookingAnalytics {
  total: number
  completed: number
  cancelled: number
  noShows: number
  utilizationRate: number
  averageDuration: number
  peakHours: HourlyMetric[]
}

export interface PlayerAnalytics {
  total: number
  active: number
  newThisMonth: number
  retention: number
  avgSessionsPerPlayer: number
  topPlayers: TopPlayerMetric[]
}

export interface CourtAnalytics {
  total: number
  averageUtilization: number
  maintenanceIssues: number
  revenuePerCourt: CourtRevenueMetric[]
}

export interface TrendAnalytics {
  bookingTrend: number // % change
  revenueTrend: number // % change
  playerTrend: number // % change
  predictions: {
    nextMonthBookings: number
    nextMonthRevenue: number
  }
}

export interface DailyMetric {
  date: string
  value: number
}

export interface HourlyMetric {
  hour: number
  count: number
}

export interface TopPlayerMetric {
  playerId: string
  playerName: string
  bookings: number
  revenue: number
}

export interface CourtRevenueMetric {
  courtId: string
  courtName: string
  revenue: number
  utilization: number
}

// =============================================
// FORMULARIOS
// =============================================

export interface CreateClubForm {
  name: string
  description?: string
  address: Omit<Address, 'coordinates'>
  contact: ContactInfo
  operatingHours: ClubSettings['operatingHours']
}

export interface CreateCourtForm {
  name: string
  description?: string
  surface: CourtSurface
  isIndoor: boolean
  hasLighting: boolean
  hourlyRate: number
  amenities: string[]
}

export interface CreatePlayerForm {
  email: string
  firstName: string
  lastName: string
  phone?: string
  level: PlayerLevel
  category: PlayerCategory
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  membershipType: PlayerMembership['type']
}

export interface CreateBookingForm {
  courtId: string
  date: string
  startTime: string
  duration: number
  notes?: string
  participants?: string[]
  isRecurring?: boolean
  recurringOptions?: Omit<RecurringBooking, 'bookingIds'>
}

export interface CreateTournamentForm {
  name: string
  description?: string
  category: TournamentCategory
  format: TournamentFormat
  maxParticipants: number
  registrationFee: number
  prizePool?: number
  startDate: string
  endDate: string
  registrationDeadline: string
  rules?: string
  prizes?: Omit<TournamentPrize, 'position'>[]
}

// =============================================
// FILTROS Y BÚSQUEDAS
// =============================================

export interface PlayerFilters {
  search?: string
  level?: PlayerLevel
  category?: PlayerCategory
  membershipStatus?: PlayerMembership['status']
  isActive?: boolean
  sortBy?: 'name' | 'level' | 'joinDate' | 'lastActivity'
  sortOrder?: 'asc' | 'desc'
}

export interface BookingFilters {
  courtId?: string
  playerId?: string
  date?: string
  status?: BookingStatus
  paymentStatus?: PaymentStatus
  sortBy?: 'date' | 'court' | 'player' | 'price'
  sortOrder?: 'asc' | 'desc'
}

export interface TournamentFilters {
  category?: TournamentCategory
  format?: TournamentFormat
  status?: TournamentStatus
  dateRange?: {
    start: string
    end: string
  }
  sortBy?: 'startDate' | 'name' | 'participants' | 'prizePool'
  sortOrder?: 'asc' | 'desc'
}

// =============================================
// UTILIDADES
// =============================================

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface FormValidation {
  isValid: boolean
  errors: { [key: string]: string }
}

export interface LoadingState {
  isLoading: boolean
  isError: boolean
  error?: string
}

export interface PaginationState {
  page: number
  limit: number
  total: number
}

// =============================================
// CONFIGURACIÓN
// =============================================

export interface AppConfig {
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
  }
  features: {
    tournaments: boolean
    analytics: boolean
    multiClub: boolean
    payments: boolean
  }
  limits: {
    maxCourtsPerClub: number
    maxPlayersPerClub: number
    maxBookingsPerDay: number
    maxTournamentParticipants: number
  }
}