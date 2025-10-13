export const CLASS_TYPES = {
  INDIVIDUAL: 'Individual',
  GROUP: 'Grupal',
  PRIVATE: 'Privada',
  SEMI_PRIVATE: 'Semi-Privada',
  CLINIC: 'Clínica',
  INTENSIVE: 'Intensivo'
} as const

export const CLASS_LEVELS = {
  BEGINNER: { label: 'Principiante', color: '#16a34a' },
  INTERMEDIATE: { label: 'Intermedio', color: '#eab308' },
  ADVANCED: { label: 'Avanzado', color: '#dc2626' },
  ALL_LEVELS: { label: 'Todos los niveles', color: '#3b82f6' },
  MIXED: { label: 'Mixto', color: '#8b5cf6' }
} as const

export const CLASS_STATUSES = {
  SCHEDULED: { label: 'Programada', color: '#3b82f6' },
  IN_PROGRESS: { label: 'En Progreso', color: '#eab308' },
  COMPLETED: { label: 'Completada', color: '#16a34a' },
  CANCELLED: { label: 'Cancelada', color: '#ef4444' }
} as const

export const RECURRENCE_FREQUENCIES = {
  DAILY: 'Diario',
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quincenal',
  MONTHLY: 'Mensual'
} as const

export const DEFAULT_CLASS_FORM = {
  instructorId: '',
  name: '',
  description: '',
  type: 'GROUP',
  level: 'BEGINNER',
  date: '',
  startTime: '',
  endTime: '',
  duration: 60,
  courtId: '',
  maxStudents: 8,
  price: 0,
  notes: '',
  requirements: '',
  materials: '',
  isRecurring: false,
  recurrencePattern: {
    frequency: 'WEEKLY',
    interval: 1,
    occurrences: 12,
    endDate: null as string | null
  }
}

export const DEFAULT_ENROLLMENT_FORM = {
  studentName: '',
  studentEmail: '',
  studentPhone: '',
  playerId: '',
  notes: '',
  paymentMethod: 'online' as const,
  splitPayment: false,
  splitCount: 1,
  sendNotification: true
}

export const DEFAULT_RESCHEDULE_FORM = {
  date: '',
  startTime: '',
  endTime: '',
  courtId: '',
  notifyStudents: true,
  reason: ''
}

export const DEFAULT_CANCEL_FORM = {
  reason: '',
  notifyStudents: true,
  refundStudents: false
}
