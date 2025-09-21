/**
 * Configuración de APIs - Padelyzer México
 */

// URLs base para diferentes entornos
export const API_CONFIG = {
  development: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    timeout: 10000,
  },
  staging: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://staging-api.padelyzer.mx/api',
    timeout: 15000,
  },
  production: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.padelyzer.mx/api',
    timeout: 10000,
  }
}

// Configuración actual basada en el entorno
export const currentConfig = API_CONFIG[process.env.NODE_ENV as keyof typeof API_CONFIG] || API_CONFIG.development

// Endpoints principales
export const ENDPOINTS = {
  // Autenticación
  auth: {
    login: '/auth/login',
    register: '/auth/register', 
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },

  // Clubes
  clubs: {
    list: '/clubs',
    detail: (id: string) => `/clubs/${id}`,
    create: '/clubs',
    update: (id: string) => `/clubs/${id}`,
    delete: (id: string) => `/clubs/${id}`,
    stats: (id: string) => `/clubs/${id}/stats`,
  },

  // Canchas
  courts: {
    list: (clubId: string) => `/clubs/${clubId}/courts`,
    detail: (clubId: string, courtId: string) => `/clubs/${clubId}/courts/${courtId}`,
    create: (clubId: string) => `/clubs/${clubId}/courts`,
    update: (clubId: string, courtId: string) => `/clubs/${clubId}/courts/${courtId}`,
    delete: (clubId: string, courtId: string) => `/clubs/${clubId}/courts/${courtId}`,
    availability: (clubId: string, courtId: string) => `/clubs/${clubId}/courts/${courtId}/availability`,
  },

  // Jugadores
  players: {
    list: (clubId: string) => `/clubs/${clubId}/players`,
    detail: (clubId: string, playerId: string) => `/clubs/${clubId}/players/${playerId}`,
    create: (clubId: string) => `/clubs/${clubId}/players`,
    update: (clubId: string, playerId: string) => `/clubs/${clubId}/players/${playerId}`,
    delete: (clubId: string, playerId: string) => `/clubs/${clubId}/players/${playerId}`,
    stats: (clubId: string, playerId: string) => `/clubs/${clubId}/players/${playerId}/stats`,
  },

  // Reservas
  bookings: {
    list: (clubId: string) => `/clubs/${clubId}/bookings`,
    detail: (clubId: string, bookingId: string) => `/clubs/${clubId}/bookings/${bookingId}`,
    create: (clubId: string) => `/clubs/${clubId}/bookings`,
    update: (clubId: string, bookingId: string) => `/clubs/${clubId}/bookings/${bookingId}`,
    cancel: (clubId: string, bookingId: string) => `/clubs/${clubId}/bookings/${bookingId}/cancel`,
  },

  // Torneos
  tournaments: {
    list: (clubId: string) => `/clubs/${clubId}/tournaments`,
    detail: (clubId: string, tournamentId: string) => `/clubs/${clubId}/tournaments/${tournamentId}`,
    create: (clubId: string) => `/clubs/${clubId}/tournaments`,
    update: (clubId: string, tournamentId: string) => `/clubs/${clubId}/tournaments/${tournamentId}`,
    delete: (clubId: string, tournamentId: string) => `/clubs/${clubId}/tournaments/${tournamentId}`,
    participants: (clubId: string, tournamentId: string) => `/clubs/${clubId}/tournaments/${tournamentId}/participants`,
    brackets: (clubId: string, tournamentId: string) => `/clubs/${clubId}/tournaments/${tournamentId}/brackets`,
  },

  // Analíticas
  analytics: {
    dashboard: (clubId: string) => `/clubs/${clubId}/analytics/dashboard`,
    revenue: (clubId: string) => `/clubs/${clubId}/analytics/revenue`,
    utilization: (clubId: string) => `/clubs/${clubId}/analytics/utilization`,
    players: (clubId: string) => `/clubs/${clubId}/analytics/players`,
    export: (clubId: string) => `/clubs/${clubId}/analytics/export`,
  },

  // Super Admin
  admin: {
    clubs: '/admin/clubs',
    users: '/admin/users',
    system: '/admin/system',
    analytics: '/admin/analytics',
    security: '/admin/security',
  }
}

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Client': 'padelyzer-web',
  'X-Version': '1.0.0',
}

// Configuración de paginación
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultPage: 1,
}

// Configuración de cache
export const CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000, // 10 minutos
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  retry: 3,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
}