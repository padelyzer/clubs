export type Instructor = {
  id: string
  name: string
  email?: string
  phone: string
  bio?: string
  specialties: string[]
  hourlyRate: number
  active: boolean
  totalClasses?: number
  upcomingClasses?: number
}

export type Class = {
  id: string
  instructorId: string
  instructor?: Instructor
  name: string
  description?: string
  type: string
  level: string
  status: string
  date: string
  startTime: string
  endTime: string
  duration: number
  courtId?: string
  court?: { id: string; name: string }
  maxStudents: number
  currentStudents: number
  price: number
  availableSpots?: number
  enrolledStudents?: number
  revenue?: number
  bookings?: any[]
}

export type Player = {
  id: string
  name: string
  phone: string
  email?: string
}

export type ClassForm = {
  instructorId: string
  name: string
  description: string
  type: string
  level: string
  date: string
  startTime: string
  endTime: string
  duration: number
  courtId: string
  maxStudents: number
  price: number
  notes: string
  requirements: string
  materials: string
  isRecurring: boolean
  recurrencePattern: {
    frequency: string
    interval: number
    occurrences: number
    endDate: string | null
  }
}

export type EnrollmentForm = {
  studentName: string
  studentEmail: string
  studentPhone: string
  playerId: string
  notes: string
  paymentMethod: 'online' | 'onsite'
  splitPayment: boolean
  splitCount: number
  sendNotification: boolean
}

export type RescheduleForm = {
  date: string
  startTime: string
  endTime: string
  courtId: string
  notifyStudents: boolean
  reason: string
}

export type CancelForm = {
  reason: string
  notifyStudents: boolean
  refundStudents: boolean
}

export type AvailabilityCheck = {
  loading: boolean
  available: boolean | null
  message: string
  conflicts: any[]
  alternatives: any[]
}
