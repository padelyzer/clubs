// Shared types for unified API architecture

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
  }
}

export interface AuthSession {
  userId: string
  clubId: string | null
  role: 'USER' | 'CLUB_OWNER' | 'CLUB_STAFF' | 'SUPER_ADMIN'
  email: string
  name: string | null
  active: boolean
}

export interface BaseEntity {
  id: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Money {
  amount: number // Always in cents
  currency: string
  formatted?: string
}

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED'