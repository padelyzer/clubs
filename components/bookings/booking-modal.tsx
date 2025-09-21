'use client'

import { useState, useEffect } from 'react'
import { format, parse, addMinutes, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { useParams, usePathname } from 'next/navigation'
import { TimeSlotSelector } from './time-slot-selector'
import { AppleModal } from '@/components/design-system/AppleModal'
import { AppleButton } from '@/components/design-system/AppleButton'
import { AppleInput } from '@/components/design-system/AppleInput'
import { SettingsCard } from '@/components/design-system/SettingsCard'
import { useNotify } from '@/contexts/NotificationContext'

// Componente simple para spinner
const Spinner = () => (
  <div style={{
    width: '16px',
    height: '16px',
    border: '2px solid rgba(164, 223, 78, 0.3)',
    borderTop: '2px solid #A4DF4E',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }}>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)
import { 
  Calendar, CreditCard, Users, Clock, 
  ChevronRight, ChevronLeft, AlertCircle,
  Smartphone, Building2, DollarSign,
  CalendarDays, UserCircle, Wallet, Check, Loader2, X
} from 'lucide-react'

interface BookingFormData {
  courtId: string
  courtIds?: string[] // For multi-court bookings
  isMultiCourt?: boolean // Toggle for multi-court booking
  multiCourtCount?: number // Number of courts to reserve
  name?: string // For multi-court booking groups (tournament, class, etc.)
  type?: 'MULTI_COURT' | 'TOURNAMENT' | 'CLASS' | 'EVENT'
  date: string
  startTime: string
  duration: number
  playerName: string
  playerEmail: string
  playerPhone: string
  totalPlayers: number
  playersPerCourt?: number // New field for players per court
  splitPaymentEnabled: boolean
  splitPaymentCount: number
  notes: string
  paymentMethod?: 'stripe' | 'onsite'
  paymentType?: 'terminal' | 'transfer' | 'cash'
  referenceNumber?: string
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: BookingFormData) => Promise<void>
  initialData?: Partial<BookingFormData>
  courts: Array<{
    id: string
    name: string
    type: string
    active: boolean
  }>
  existingBookings: Array<{
    id: string
    courtId: string
    date: Date | string
    startTime: string
    endTime: string
    playerName: string
    status: string
  }>
  operatingHours: {
    start: string
    end: string
  }
  mode?: 'create' | 'edit'
  isLoading?: boolean
  paymentSettings?: {
    stripeEnabled: boolean
    terminalEnabled: boolean
    transferEnabled: boolean
    cashEnabled: boolean
    bankName?: string
    accountNumber?: string
    clabe?: string
    accountHolder?: string
  }
}

export function BookingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  courts,
  existingBookings,
  operatingHours,
  mode = 'create',
  isLoading = false,
  paymentSettings
}: BookingModalProps) {
  const params = useParams()
  const pathname = usePathname()
  const clubSlug = params.clubSlug as string
  const notify = useNotify()
  
  const activeCourts = courts.filter(court => court.active)
  
  const [formData, setFormData] = useState<BookingFormData>({
    courtId: '',
    courtIds: [],
    isMultiCourt: false,
    multiCourtCount: activeCourts.length >= 2 ? 2 : activeCourts.length,
    name: '',
    type: 'MULTI_COURT',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '',
    duration: 90,
    playerName: '',
    playerEmail: '',
    playerPhone: '',
    totalPlayers: 8, // Default for 2 courts (will be adjusted dynamically)
    playersPerCourt: 4, // Default 4 players per court
    splitPaymentEnabled: false,
    splitPaymentCount: 8, // Default for 2 courts (will be adjusted dynamically)
    notes: '',
    paymentMethod: 'onsite',
    paymentType: 'cash',
    referenceNumber: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [showTimeSelector, setShowTimeSelector] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0)
  const [priceLoading, setPriceLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [clubTimeSlots, setClubTimeSlots] = useState<string[]>([])
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)
  const [multiCourtAvailabilityError, setMultiCourtAvailabilityError] = useState<string>('')
  const [loadingPlayerData, setLoadingPlayerData] = useState(false)
  const [playerFound, setPlayerFound] = useState<{id: string, name: string, email: string, memberNumber?: string} | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update multiCourtCount when activeCourts changes
  useEffect(() => {
    if (activeCourts.length >= 2 && formData.multiCourtCount === 0) {
      const defaultCourtCount = 2
      setFormData(prev => ({
        ...prev,
        multiCourtCount: defaultCourtCount,
        totalPlayers: defaultCourtCount * 4, // 4 players per court
        splitPaymentCount: defaultCourtCount * 4 // 4 payments per court
      }))
    }
  }, [activeCourts.length, formData.multiCourtCount])

  // Cargar horarios del club
  useEffect(() => {
    if (isOpen && formData.date) {
      loadClubTimeSlots()
    }
  }, [isOpen, formData.date])

  const loadClubTimeSlots = async () => {
    setLoadingTimeSlots(true)
    try {
      const selectedDate = new Date(formData.date)
      const dayOfWeek = selectedDate.getDay() // 0=Sunday, 1=Monday, etc.
      
      const response = await fetch(`/api/club/schedule?dayOfWeek=${dayOfWeek}`)
      const data = await response.json()
      
      if (data.success && data.timeSlots) {
        setClubTimeSlots(data.timeSlots)
      } else {
        // Fallback a horarios por defecto si no hay configuración
        console.warn('No se encontraron horarios del club, usando horarios por defecto')
        setClubTimeSlots([
          '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
          '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
          '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', 
          '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
          '20:00', '20:30', '21:00', '21:30'
        ])
      }
    } catch (error) {
      console.error('Error loading club time slots:', error)
      // Fallback a horarios por defecto
      setClubTimeSlots([
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', 
        '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
        '20:00', '20:30', '21:00', '21:30'
      ])
    } finally {
      setLoadingTimeSlots(false)
    }
  }

  useEffect(() => {
    if (initialData) {
      setFormData({
        courtId: initialData.courtId || '',
        date: initialData.date || format(new Date(), 'yyyy-MM-dd'),
        startTime: initialData.startTime || '',
        duration: initialData.duration || 90,
        playerName: initialData.playerName || '',
        playerEmail: initialData.playerEmail || '',
        playerPhone: initialData.playerPhone || '',
        totalPlayers: initialData.totalPlayers || 4, // Valor mantenido para compatibilidad
        splitPaymentEnabled: initialData.splitPaymentEnabled || false,
        splitPaymentCount: initialData.splitPaymentCount || 4,
        notes: initialData.notes || ''
      })
    }
  }, [initialData])

  useEffect(() => {
    if (isOpen) {
      // Reset form when opening in create mode
      if (mode === 'create' && !initialData) {
        setFormData({
          courtId: '',
          courtIds: [],
          isMultiCourt: false,
          multiCourtCount: activeCourts.length >= 2 ? 2 : activeCourts.length,
          name: '',
          type: 'MULTI_COURT',
          date: format(new Date(), 'yyyy-MM-dd'),
          startTime: '',
          duration: 90,
          playerName: '',
          playerEmail: '',
          playerPhone: '',
          totalPlayers: 8,
          splitPaymentEnabled: false,
          splitPaymentCount: 8,
          notes: '',
          paymentMethod: 'onsite',
          paymentType: 'cash',
          referenceNumber: ''
        })
      }
      
      setCurrentStep(1)
      setShowTimeSelector(false)
      setPlayerFound(null) // Limpiar estado del cliente encontrado
      setLoadingPlayerData(false)
      setErrors({})
      setMultiCourtAvailabilityError('')
      setEstimatedPrice(0) // Reset price
    }
  }, [isOpen, mode, initialData, activeCourts.length])

  // Calcular precio cuando cambien fecha, hora o duración
  useEffect(() => {
    calculatePriceFromAPI()
  }, [formData.date, formData.startTime, formData.duration])

  // Check availability when court or date changes
  useEffect(() => {
    if (formData.isMultiCourt && formData.date) {
      checkMultiCourtAvailability()
    } else if (formData.courtId && formData.date) {
      checkAvailability()
    }
  }, [formData.courtId, formData.date, formData.duration, formData.isMultiCourt])

  const validateEndTime = (): { isValid: boolean; error?: string } => {
    if (!formData.startTime || !formData.duration) {
      return { isValid: true }
    }

    // Calculate end time
    const [startHour, startMinute] = formData.startTime.split(':').map(Number)
    const startTotalMinutes = startHour * 60 + startMinute
    const endTotalMinutes = startTotalMinutes + formData.duration
    
    const endHour = Math.floor(endTotalMinutes / 60)
    const endMinute = endTotalMinutes % 60
    const calculatedEndTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
    
    // Parse club closing time
    const [closeHour, closeMinute] = operatingHours.end.split(':').map(Number)
    const closeTotalMinutes = closeHour * 60 + closeMinute
    
    // Check if end time exceeds closing time
    if (endTotalMinutes > closeTotalMinutes) {
      return {
        isValid: false,
        error: `La reserva terminaría a las ${calculatedEndTime}, pero el club cierra a las ${operatingHours.end}. Por favor selecciona un horario más temprano o reduce la duración.`
      }
    }
    
    return { isValid: true }
  }

  const validateMultiCourtAvailability = async (): Promise<boolean> => {
    if (!formData.isMultiCourt || !formData.date || !formData.startTime) {
      return true
    }

    try {
      setMultiCourtAvailabilityError('')
      
      // First validate that the booking doesn't exceed club closing time
      const endTimeValidation = validateEndTime()
      if (!endTimeValidation.isValid) {
        setMultiCourtAvailabilityError(endTimeValidation.error || 'Horario no válido')
        return false
      }
      
      // Check availability for each court individually
      const courtPromises = activeCourts.map(async (court) => {
        const response = await fetch(`/api/bookings/availability?date=${formData.date}&courtId=${court.id}&duration=${formData.duration}`)
        const availabilityData = await response.json()
        
        if (availabilityData.success) {
          const slotForTime = availabilityData.slots?.find((slot: any) => 
            slot.startTime === formData.startTime
          )
          return slotForTime?.available ? court.id : null
        }
        return null
      })
      
      const availableCourtIds = (await Promise.all(courtPromises)).filter(Boolean)
      const availableCourts = availableCourtIds.length
      const requiredCourts = formData.multiCourtCount || 2
      
      if (availableCourts < requiredCourts) {
        setMultiCourtAvailabilityError(
          `Solo ${availableCourts} cancha${availableCourts !== 1 ? 's' : ''} disponible${availableCourts !== 1 ? 's' : ''} para el horario ${formData.startTime}. Se necesitan ${requiredCourts}.`
        )
        return false
      }
      
      // Check if manually selected courts are available
      if (formData.courtIds && formData.courtIds.length > 0) {
        const unavailableManualCourts = formData.courtIds.filter(courtId => 
          !availableCourtIds.includes(courtId)
        )
        
        if (unavailableManualCourts.length > 0) {
          const unavailableCourtNames = unavailableManualCourts.map(courtId => 
            activeCourts.find(c => c.id === courtId)?.name || 'Desconocida'
          ).join(', ')
          
          setMultiCourtAvailabilityError(
            `Las siguientes canchas seleccionadas no están disponibles: ${unavailableCourtNames}`
          )
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error validating multi-court availability:', error)
      setMultiCourtAvailabilityError('Error verificando disponibilidad')
      return false
    }
  }

  const validateStep1 = async () => {
    const newErrors: Record<string, string> = {}

    if (formData.isMultiCourt) {
      if (!formData.name?.trim()) {
        newErrors.name = 'El nombre del evento es requerido'
      }
      if ((formData.multiCourtCount || 0) < 2) {
        newErrors.multiCourtCount = 'Mínimo 2 canchas requeridas'
      }
      if ((formData.multiCourtCount || 0) > activeCourts.length) {
        newErrors.multiCourtCount = `Máximo ${activeCourts.length} canchas disponibles`
      }
      // For multi-court, we need at least date and time to validate availability
      if (!formData.date) {
        newErrors.date = 'Selecciona una fecha'
      }
      if (!formData.startTime) {
        newErrors.startTime = 'Selecciona un horario'
      }
    } else {
      if (!formData.courtId) {
        newErrors.courtId = 'Selecciona una cancha'
      }
      if (!formData.date) {
        newErrors.date = 'Selecciona una fecha'
      }
      if (!formData.startTime) {
        newErrors.startTime = 'Selecciona un horario'
      }
    }
    
    // Validate end time doesn't exceed club closing time for both types
    if (formData.startTime && formData.duration) {
      const endTimeValidation = validateEndTime()
      if (!endTimeValidation.isValid) {
        newErrors.startTime = endTimeValidation.error || 'Horario no válido'
      }
    }
    
    if (formData.duration < 30) {
      newErrors.duration = 'La duración mínima es 30 minutos'
    }

    setErrors(newErrors)
    
    // If basic validation fails, return false immediately
    if (Object.keys(newErrors).length > 0) {
      return false
    }
    
    // If basic validation passes and it's multi-court, check availability
    if (formData.isMultiCourt) {
      try {
        const availabilityOk = await validateMultiCourtAvailability()
        return availabilityOk
      } catch (error) {
        console.error('Error validating multi-court availability:', error)
        setMultiCourtAvailabilityError('Error verificando disponibilidad')
        return false
      }
    }
    
    // For single court bookings, basic validation is sufficient
    return true
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.playerName.trim()) {
      newErrors.playerName = 'El nombre es requerido'
    }
    if (!formData.playerPhone.trim()) {
      newErrors.playerPhone = 'El teléfono es requerido'
    } else if (!/^\d{10,}$/.test(formData.playerPhone.replace(/\D/g, ''))) {
      newErrors.playerPhone = 'Teléfono inválido (mínimo 10 dígitos)'
    }
    if (formData.playerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.playerEmail)) {
      newErrors.playerEmail = 'Email inválido'
    }
    if (formData.splitPaymentEnabled && (formData.splitPaymentCount < 2 || formData.splitPaymentCount > 50)) {
      newErrors.splitPaymentCount = 'Entre 2 y 50 partes'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    // Prevent multiple submissions
    if (isSubmitting) return

    if (currentStep === 1) {
      const isValid = await validateStep1()
      if (isValid) {
        setCurrentStep(2)
      }
      return
    }

    if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3)
      }
      return
    }

    // Step 3: Submit the booking
    try {
      setIsSubmitting(true)
      if (formData.isMultiCourt) {
        // For multi-court bookings, use BookingGroup API
        const multiCourtData = {
          name: formData.name || `${formData.type} - ${formData.playerName}`,
          type: formData.type || 'MULTI_COURT',
          courtIds: formData.courtIds && formData.courtIds.length > 0 
            ? formData.courtIds 
            : [], // Let API auto-select if empty
          multiCourtCount: formData.multiCourtCount || 2, // Pass desired count for auto-selection
          date: formData.date,
          startTime: formData.startTime,
          duration: formData.duration,
          playerName: formData.playerName,
          playerEmail: formData.playerEmail,
          playerPhone: formData.playerPhone,
          totalPlayers: formData.totalPlayers,
          playersPerCourt: formData.playersPerCourt || 4,
          splitPaymentEnabled: formData.splitPaymentEnabled,
          splitPaymentCount: formData.splitPaymentCount,
          notes: formData.notes,
          paymentMethod: formData.paymentMethod,
          paymentType: formData.paymentType
        }
        
        console.log('🚀 Sending BookingGroup data:', multiCourtData)
        
        // Call BookingGroup API
        const response = await fetch('/api/booking-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(multiCourtData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('❌ BookingGroup API Error:', errorData)
          throw new Error(errorData.error || 'Error creating booking group')
        }
        
        const result = await response.json()
        console.log('🎉 BookingGroup created:', result)
        
        notify.success({
          title: 'Reserva de grupo confirmada',
          message: `Se crearon ${result.bookingGroup?.bookings?.length || formData.multiCourtCount} reservas para ${formData.playerName}`,
          duration: 6000,
          action: {
            label: 'Ver detalles',
            onClick: () => console.log('Ver detalles del grupo:', result.bookingGroup?.id)
          }
        })
      } else {
        // Single court booking - use existing logic
        const bookingDataWithPrice = {
          ...formData,
          price: calculatePriceInCents() // Precio en centavos para el API
        }
        await onSubmit(bookingDataWithPrice)
        
        notify.success({
          title: 'Reserva confirmada',
          message: `Reserva creada exitosamente para ${formData.playerName}`,
          duration: 5000,
          action: {
            label: 'Ver reservas',
            onClick: () => console.log('Ir a reservas')
          }
        })
      }
      
      // Reset form after successful submission
      if (mode === 'create') {
        setFormData({
          courtId: '',
          courtIds: [],
          isMultiCourt: false,
          multiCourtCount: activeCourts.length >= 2 ? 2 : activeCourts.length,
          name: '',
          type: 'MULTI_COURT',
          date: format(new Date(), 'yyyy-MM-dd'),
          startTime: '',
          duration: 90,
          playerName: '',
          playerEmail: '',
          playerPhone: '',
          totalPlayers: 8,
          splitPaymentEnabled: false,
          splitPaymentCount: 8,
          notes: '',
          paymentMethod: 'onsite',
          paymentType: 'cash',
          referenceNumber: ''
        })
        setCurrentStep(1)
        setEstimatedPrice(0)
      }
      
      onClose()
    } catch (error) {
      console.error('Error submitting booking:', error)

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      notify.error({
        title: 'Error al crear reserva',
        message: errorMessage,
        duration: 8000,
        action: {
          label: 'Reintentar',
          onClick: () => setCurrentStep(3) // Volver al paso de confirmación
        }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof BookingFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }

    // Si es el teléfono, buscar cliente para autocompletado
    if (field === 'playerPhone' && typeof value === 'string') {
      searchPlayerByPhone(value)
    }
    
    // Clear multi-court availability error when relevant fields change
    if (formData.isMultiCourt && ['date', 'startTime', 'multiCourtCount', 'courtIds'].includes(field as string)) {
      setMultiCourtAvailabilityError('')
    }
  }

  const getFilteredBookings = () => {
    if (!formData.courtId || !formData.date) return []
    
    return existingBookings.filter(booking => {
      const bookingDate = typeof booking.date === 'string' 
        ? booking.date 
        : booking.date.toISOString().split('T')[0]
      
      return booking.courtId === formData.courtId &&
        bookingDate === formData.date &&
        booking.status !== 'CANCELLED'
    })
  }

  const getAvailableTimeSlots = () => {
    // If we have availability data, use it to show ALL slots (available and unavailable)
    if (availableSlots.length > 0) {
      // Return all slots, not just available ones - we'll show them disabled
      return availableSlots.map(slot => slot.startTime)
    }
    
    // Use club time slots if available, otherwise fallback to hardcoded
    const timeSlots = clubTimeSlots.length > 0 ? clubTimeSlots : [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
      '20:00', '21:00'
    ]
    
    // Fallback to basic time filtering
    const now = new Date()
    const selectedDate = new Date(formData.date)
    const isToday = selectedDate.toDateString() === now.toDateString()
    
    console.log('BookingModal time filtering:', {
      now: now.toLocaleTimeString(),
      selectedDate: selectedDate.toDateString(),
      isToday,
      currentHour: now.getHours(),
      currentMinutes: now.getMinutes()
    })
    
    if (!isToday) {
      // Si no es hoy, mostrar todos los horarios
      console.log('Not today, showing all slots:', timeSlots.length)
      return timeSlots
    }
    
    // Si es hoy, filtrar horarios pasados
    const currentHour = now.getHours()
    const currentMinutes = now.getMinutes()
    
    const filteredSlots = timeSlots.filter(slot => {
      const [slotHour, slotMinutes] = slot.split(':').map(Number)
      
      // Si el horario es más tarde que la hora actual, está disponible
      if (slotHour > currentHour) return true
      
      // Si es la misma hora, verificar minutos (con 2 minutos de margen)
      if (slotHour === currentHour) {
        // Agregar solo 2 minutos de margen para preparación
        return slotMinutes > (currentMinutes + 2)
      }
      
      return false
    })
    
    console.log('Filtered slots for today:', {
      originalSlots: timeSlots.length,
      filteredSlots: filteredSlots.length,
      slots: filteredSlots
    })
    
    return filteredSlots
  }

  const isSlotAvailable = (time: string) => {
    if (availableSlots.length === 0) return true
    
    const slot = availableSlots.find(s => s.startTime === time)
    return slot ? slot.available : false
  }

  const getSlotConflict = (time: string) => {
    if (availableSlots.length === 0) return null
    
    const slot = availableSlots.find(s => s.startTime === time)
    return slot && !slot.available ? slot.conflict : null
  }

  const formatEndTime = () => {
    if (!formData.startTime) return ''
    const start = parse(formData.startTime, 'HH:mm', new Date())
    const end = addMinutes(start, formData.duration)
    return format(end, 'HH:mm')
  }

  const checkAvailability = async () => {
    if (!formData.courtId || !formData.date) return
    
    try {
      setLoadingAvailability(true)
      const response = await fetch(
        `/api/bookings/availability?` + new URLSearchParams({
          date: formData.date,
          courtId: formData.courtId,
          duration: formData.duration.toString()
        })
      )
      
      const data = await response.json()
      if (data.success) {
        setAvailableSlots(data.slots)
        
        // Si el horario seleccionado no está disponible, limpiar
        if (formData.startTime) {
          const selectedSlot = data.slots.find((s: any) => s.startTime === formData.startTime)
          if (selectedSlot && !selectedSlot.available) {
            setFormData(prev => ({ ...prev, startTime: '' }))
            setErrors(prev => ({ 
              ...prev, 
              startTime: 'El horario seleccionado ya no está disponible' 
            }))
          }
        }
      }
    } catch (error) {
      console.error('Error checking availability:', error)
    } finally {
      setLoadingAvailability(false)
    }
  }

  const checkMultiCourtAvailability = async () => {
    if (!formData.date || !formData.isMultiCourt) return
    
    try {
      setLoadingAvailability(true)
      
      // For multi-court, we need to check ALL courts and find time slots where enough courts are available
      const courtAvailabilityPromises = activeCourts.map(court => 
        fetch(`/api/bookings/availability?` + new URLSearchParams({
          date: formData.date,
          courtId: court.id,
          duration: formData.duration.toString()
        })).then(res => res.json())
      )
      
      const allCourtAvailability = await Promise.all(courtAvailabilityPromises)
      
      // Merge availability data - a time slot is available for multi-court if enough courts are free
      const timeSlotMap = new Map<string, number>() // time -> count of available courts
      const allTimeSlots = new Set<string>()
      
      allCourtAvailability.forEach((courtData, index) => {
        if (courtData.success && courtData.slots) {
          courtData.slots.forEach((slot: any) => {
            allTimeSlots.add(slot.startTime)
            if (slot.available) {
              const currentCount = timeSlotMap.get(slot.startTime) || 0
              timeSlotMap.set(slot.startTime, currentCount + 1)
            }
          })
        }
      })
      
      // Create merged slots - mark as available only if enough courts are free
      const requiredCourts = formData.multiCourtCount || 2
      const mergedSlots = Array.from(allTimeSlots).sort().map(time => ({
        startTime: time,
        available: (timeSlotMap.get(time) || 0) >= requiredCourts,
        availableCourts: timeSlotMap.get(time) || 0,
        conflict: (timeSlotMap.get(time) || 0) < requiredCourts ? 
          `Solo ${timeSlotMap.get(time) || 0} de ${requiredCourts} canchas disponibles` : null
      }))
      
      setAvailableSlots(mergedSlots)
      
      // Si el horario seleccionado no está disponible, limpiar
      if (formData.startTime) {
        const selectedSlot = mergedSlots.find(s => s.startTime === formData.startTime)
        if (selectedSlot && !selectedSlot.available) {
          setFormData(prev => ({ ...prev, startTime: '' }))
          setErrors(prev => ({ 
            ...prev, 
            startTime: `El horario seleccionado no tiene suficientes canchas disponibles (${selectedSlot.availableCourts}/${requiredCourts})`
          }))
        }
      }
    } catch (error) {
      console.error('Error checking multi-court availability:', error)
    } finally {
      setLoadingAvailability(false)
    }
  }

  const calculatePriceFromAPI = async () => {
    if (!formData.date || !formData.startTime || !formData.duration) {
      setEstimatedPrice(0)
      return
    }

    setPriceLoading(true)
    try {
      const response = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          startTime: formData.startTime,
          duration: formData.duration
        })
      })

      const data = await response.json()
      if (data.success) {
        setEstimatedPrice(data.pricing.totalPriceMXN)
      } else {
        console.error('Error calculating price:', data.error)
        setEstimatedPrice(0)
        
        // Show configuration alert if pricing not configured
        if (data.requiresConfiguration) {
          notify.error({
            title: 'Configuración requerida',
            message: 'Debe configurar los precios antes de crear reservas. Vaya a Configuración > Club para configurar los precios.',
            duration: 8000,
            action: {
              label: 'Ir a configuración',
              onClick: () => {
                const configUrl = clubSlug ? `/c/${clubSlug}/dashboard/settings/club` : '/dashboard/settings/club'
                window.open(configUrl, '_blank')
              }
            }
          })
        }
      }
    } catch (error) {
      console.error('Error fetching price:', error)
      setEstimatedPrice(0)
    } finally {
      setPriceLoading(false)
    }
  }

  const calculatePrice = () => {
    // Función legacy para compatibilidad, pero ahora devuelve el precio de la API
    return estimatedPrice
  }
  
  const calculatePriceInCents = () => {
    return calculatePrice() * 100 // Convertir a centavos para el API
  }

  // Buscar cliente por teléfono para autocompletado
  const searchPlayerByPhone = async (phone: string) => {
    // Limpiar estado anterior
    setPlayerFound(null)
    
    // Solo buscar si el teléfono tiene al menos 10 dígitos
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      return
    }

    try {
      setLoadingPlayerData(true)
      const response = await fetch(`/api/players/search?phone=${encodeURIComponent(cleanPhone)}`)
      const data = await response.json()
      
      if (data.success && data.player) {
        setPlayerFound(data.player)
        // Autocompletar nombre y email si están vacíos
        setFormData(prev => ({
          ...prev,
          playerName: prev.playerName || data.player.name || '',
          playerEmail: prev.playerEmail || data.player.email || ''
        }))
        
        // Notificación sutil de cliente encontrado
        notify.info({
          title: 'Cliente encontrado',
          message: `${data.player.name} - Cliente #${data.player.memberNumber || 'N/A'}`,
          duration: 3000
        })
      } else {
        setPlayerFound(null)
      }
    } catch (error) {
      console.error('Error searching player:', error)
      setPlayerFound(null)
    } finally {
      setLoadingPlayerData(false)
    }
  }

  if (!isOpen) return null

  return (
    <AppleModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Editar Reserva' : 'Nueva Reserva'}
      size="large"
    >
      {/* Enhanced Progress Indicator */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.08), rgba(102, 231, 170, 0.05))',
        borderRadius: '16px',
        marginBottom: '32px',
        border: '1px solid rgba(164, 223, 78, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* Progress Line */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20%',
            right: '20%',
            height: '2px',
            background: 'rgba(164, 223, 78, 0.2)',
            zIndex: 0
          }}>
            <div style={{
              width: `${((currentStep - 1) / 2) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #A4DF4E, #66E7AA)',
              transition: 'width 0.4s ease',
              boxShadow: '0 0 8px rgba(164, 223, 78, 0.3)'
            }} />
          </div>

          {/* Steps */}
          {[
            { step: 1, Icon: CalendarDays, title: 'Horario', subtitle: 'Cancha y fecha' },
            { step: 2, Icon: UserCircle, title: 'Datos', subtitle: 'Información del jugador' },
            { step: 3, Icon: Wallet, title: 'Pago', subtitle: 'Método de pago' }
          ].map((item) => (
            <div
              key={item.step}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                position: 'relative',
                zIndex: 1
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: currentStep >= item.step 
                  ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)'
                  : 'white',
                border: currentStep >= item.step
                  ? 'none'
                  : '2px solid rgba(164, 223, 78, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
                boxShadow: currentStep >= item.step
                  ? '0 4px 12px rgba(164, 223, 78, 0.3)'
                  : '0 2px 4px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: currentStep === item.step ? 'scale(1.1)' : 'scale(1)',
                color: currentStep >= item.step ? '#182A01' : '#829F65'
              }}>
                {currentStep > item.step ? (
                  <Check size={20} strokeWidth={3} />
                ) : (
                  <item.Icon size={20} strokeWidth={1.5} />
                )}
              </div>
              <div style={{
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: currentStep >= item.step ? '#182A01' : '#829F65',
                  transition: 'all 0.3s'
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: currentStep >= item.step ? '#516640' : '#C1CEB8',
                  marginTop: '2px',
                  transition: 'all 0.3s'
                }}>
                  {item.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ minHeight: '400px' }}>
        {/* Step 1: Time & Court Selection */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SettingsCard
              title="Cancha y Horario"
              description="Selecciona la cancha y el horario para tu reserva"
              icon={<Calendar size={20} />}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Multi-Court Toggle */}
                <div style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(102, 231, 170, 0.02))',
                  borderRadius: '12px',
                  border: '1px solid rgba(164, 223, 78, 0.2)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: formData.isMultiCourt ? '16px' : '0'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#182A01',
                        marginBottom: '4px'
                      }}>
                        Reservar múltiples canchas
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#516640'
                      }}>
                        Reserva varias canchas para el mismo horario
                      </div>
                    </div>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '51px',
                      height: '31px'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.isMultiCourt}
                        onChange={(e) => {
                          handleInputChange('isMultiCourt', e.target.checked)
                          if (!e.target.checked) {
                            // Reset multi-court specific fields when turning off
                            handleInputChange('courtIds', [])
                            handleInputChange('name', '')
                            handleInputChange('totalPlayers', 4) // Reset to single court default
                          } else {
                            const defaultCourtCount = formData.multiCourtCount || 2
                            handleInputChange('totalPlayers', defaultCourtCount * 4) // 4 players per court
                            handleInputChange('splitPaymentCount', defaultCourtCount * 4) // 4 payments per court
                            handleInputChange('splitPaymentEnabled', true) // Enable split payments by default for groups
                          }
                        }}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: formData.isMultiCourt ? '#34C759' : 'rgba(0, 0, 0, 0.15)',
                        transition: '0.3s',
                        borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: '27px',
                          width: '27px',
                          left: formData.isMultiCourt ? '22px' : '2px',
                          bottom: '2px',
                          background: 'white',
                          transition: '0.3s',
                          borderRadius: '50%',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }} />
                      </span>
                    </label>
                  </div>

                  {/* Multi-court specific options */}
                  {formData.isMultiCourt && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(164, 223, 78, 0.2)'
                    }}>
                      {/* Event Name */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.6)',
                          marginBottom: '8px'
                        }}>
                          Nombre del evento
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Ej: Torneo Sabatino, Clase Grupal, Evento Corporativo"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: '15px',
                            border: '1px solid rgba(0, 0, 0, 0.12)',
                            borderRadius: '12px',
                            background: 'white',
                            color: '#000',
                            outline: 'none',
                            transition: 'all 0.2s'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = '#A4DF4E'
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(164, 223, 78, 0.15)'
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        />
                        {errors.name && (
                          <p style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px' }}>
                            {errors.name}
                          </p>
                        )}
                      </div>

                      {/* Court Count */}
                      <div>
                          <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'rgba(0, 0, 0, 0.6)',
                            marginBottom: '8px'
                          }}>
                            Número de canchas
                          </label>
                          <select
                            value={formData.multiCourtCount}
                            onChange={(e) => {
                              const count = parseInt(e.target.value)
                              handleInputChange('multiCourtCount', count)
                              // Auto-adjust total players and split payment count based on court count
                              handleInputChange('totalPlayers', count * 4) // 4 players per court
                              handleInputChange('splitPaymentCount', count * 4) // 4 payments per court (1 per player)
                            }}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              fontSize: '15px',
                              border: '1px solid rgba(0, 0, 0, 0.12)',
                              borderRadius: '12px',
                              background: 'white',
                              color: '#000',
                              outline: 'none',
                              transition: 'all 0.2s',
                              cursor: 'pointer'
                            }}
                          >
                            {Array.from({ length: Math.max(0, activeCourts.length - 1) }, (_, i) => i + 2).map(num => (
                              <option key={num} value={num}>{num} canchas</option>
                            ))}
                          </select>
                          {errors.multiCourtCount && (
                            <p style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px' }}>
                              {errors.multiCourtCount}
                            </p>
                          )}
                        </div>
                    </div>
                  )}
                </div>

                {/* Court Selection */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'rgba(0, 0, 0, 0.6)',
                    marginBottom: '8px'
                  }}>
                    {formData.isMultiCourt ? 'Canchas' : 'Cancha'}
                  </label>
                  
                  {formData.isMultiCourt ? (
                    <div style={{
                      padding: '16px',
                      background: 'rgba(164, 223, 78, 0.05)',
                      borderRadius: '12px',
                      border: '1px solid rgba(164, 223, 78, 0.15)'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#182A01',
                        marginBottom: '8px'
                      }}>
                        📋 Selección automática de {formData.multiCourtCount} canchas
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#516640',
                        marginBottom: '12px',
                        lineHeight: '1.4'
                      }}>
                        Padelyzer seleccionará automáticamente las mejores {formData.multiCourtCount} canchas 
                        disponibles para tu evento en el horario elegido.
                      </div>
                      
                      {/* Manual court selection option */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginTop: '12px'
                      }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.6)',
                          width: '100%',
                          marginBottom: '8px'
                        }}>
                          O selecciona manualmente:
                        </div>
                        {activeCourts.map(court => {
                          const isSelected = formData.courtIds?.includes(court.id) || false
                          const canSelect = !isSelected && (formData.courtIds?.length || 0) < (formData.multiCourtCount || 2)
                          
                          return (
                            <button
                              key={court.id}
                              type="button"
                              onClick={() => {
                                const currentCourtIds = formData.courtIds || []
                                if (isSelected) {
                                  // Remove court from selection
                                  handleInputChange('courtIds', currentCourtIds.filter(id => id !== court.id))
                                } else if (canSelect) {
                                  // Add court to selection
                                  handleInputChange('courtIds', [...currentCourtIds, court.id])
                                }
                              }}
                              disabled={!canSelect && !isSelected}
                              style={{
                                padding: '8px 12px',
                                fontSize: '12px',
                                fontWeight: isSelected ? 600 : 400,
                                border: isSelected ? '2px solid #A4DF4E' : '1px solid rgba(164, 223, 78, 0.3)',
                                borderRadius: '6px',
                                background: isSelected 
                                  ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.15), rgba(102, 231, 170, 0.08))'
                                  : canSelect ? 'white' : 'rgba(0, 0, 0, 0.05)',
                                color: isSelected ? '#182A01' : canSelect ? '#000' : '#999',
                                cursor: canSelect || isSelected ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s',
                                boxShadow: isSelected ? '0 2px 4px rgba(164, 223, 78, 0.2)' : 'none',
                                opacity: canSelect || isSelected ? 1 : 0.5
                              }}
                            >
                              {court.name}
                              {isSelected && ' ✓'}
                            </button>
                          )
                        })}
                      </div>
                      
                      {formData.courtIds && formData.courtIds.length > 0 && (
                        <div style={{
                          marginTop: '12px',
                          padding: '8px 12px',
                          background: 'rgba(164, 223, 78, 0.1)',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: '#182A01'
                        }}>
                          ✅ {formData.courtIds.length} de {formData.multiCourtCount} canchas seleccionadas
                          {formData.courtIds.length < (formData.multiCourtCount || 2) && 
                            ` • ${(formData.multiCourtCount || 2) - formData.courtIds.length} más se asignarán automáticamente`
                          }
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      value={formData.courtId}
                      onChange={(e) => handleInputChange('courtId', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '15px',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        borderRadius: '12px',
                        background: 'white',
                        color: '#000',
                        outline: 'none',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#A4DF4E'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(164, 223, 78, 0.15)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <option value="">Selecciona una cancha</option>
                      {activeCourts.map(court => (
                        <option key={court.id} value={court.id}>
                          {court.name} ({court.type})
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {errors.courtId && (
                    <p style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px' }}>
                      {errors.courtId}
                    </p>
                  )}
                  
                  {/* Multi-court availability error */}
                  {formData.isMultiCourt && multiCourtAvailabilityError && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.1), rgba(255, 69, 58, 0.05))',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 59, 48, 0.2)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontSize: '16px' }}>⚠️</span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#FF3B30'
                        }}>
                          No hay suficientes canchas disponibles
                        </span>
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: '#FF3B30',
                        margin: 0,
                        paddingLeft: '24px'
                      }}>
                        {multiCourtAvailabilityError}
                      </p>
                    </div>
                  )}
                </div>

                {/* Date and Duration */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <AppleInput
                      label="Fecha"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      max={format(addDays(new Date(), 90), 'yyyy-MM-dd')}
                      error={errors.date}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'rgba(0, 0, 0, 0.6)',
                      marginBottom: '8px'
                    }}>
                      Duración
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '15px',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        borderRadius: '12px',
                        background: 'white',
                        color: '#000',
                        outline: 'none',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                    >
                      <option value={60}>60 minutos</option>
                      <option value={90}>90 minutos</option>
                      <option value={120}>120 minutos</option>
                      <option value={150}>150 minutos</option>
                      <option value={180}>180 minutos</option>
                    </select>
                  </div>
                </div>

                {/* Time Selector */}
                {((formData.courtId && !formData.isMultiCourt) || (formData.isMultiCourt && formData.date)) && (
                  <div>
                    <AppleButton
                      variant="secondary"
                      onClick={() => setShowTimeSelector(!showTimeSelector)}
                      style={{ 
                        width: '100%', 
                        justifyContent: 'space-between',
                        background: '#182A01',
                        color: 'white',
                        border: '1px solid #182A01'
                      }}
                    >
                      <span>
                        {formData.startTime 
                          ? `${formData.startTime} - ${formatEndTime()}` 
                          : 'Seleccionar Horario'}
                      </span>
                      <Clock size={16} />
                    </AppleButton>

                    {showTimeSelector && (
                      <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        background: 'rgba(0, 0, 0, 0.02)',
                        borderRadius: '12px'
                      }}>
                        {loadingAvailability ? (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '40px',
                            gap: '12px'
                          }}>
                            <div style={{
                              animation: 'spin 1s linear infinite',
                              width: '40px',
                              height: '40px',
                              border: '3px solid rgba(164, 223, 78, 0.2)',
                              borderTop: '3px solid #A4DF4E',
                              borderRadius: '50%'
                            }} />
                            <span style={{ fontSize: '14px', color: '#516640' }}>
                              Verificando horarios disponibles...
                            </span>
                          </div>
                        ) : (
                          <>
                            {availableSlots.length > 0 && (
                              <div style={{
                                marginBottom: '16px',
                                padding: '12px',
                                background: availableSlots.filter(s => s.available).length > 10 
                                  ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))'
                                  : availableSlots.filter(s => s.available).length > 5
                                  ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.05))'
                                  : 'linear-gradient(135deg, rgba(255, 87, 34, 0.1), rgba(244, 67, 54, 0.05))',
                                borderRadius: '8px',
                                fontSize: '13px',
                                color: '#182A01',
                                border: `1px solid ${
                                  availableSlots.filter(s => s.available).length > 10 
                                    ? 'rgba(164, 223, 78, 0.2)'
                                    : availableSlots.filter(s => s.available).length > 5
                                    ? 'rgba(255, 193, 7, 0.2)'
                                    : 'rgba(255, 87, 34, 0.2)'
                                }`,
                                animation: 'slideInScale 0.4s ease-out'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '16px' }}>
                                    {availableSlots.filter(s => s.available).length > 10 ? '✅' :
                                     availableSlots.filter(s => s.available).length > 5 ? '⚡' : '⏰'}
                                  </span>
                                  <span style={{ fontWeight: 500 }}>
                                    {availableSlots.filter(s => s.available).length} horarios disponibles
                                    {availableSlots.filter(s => s.available).length <= 3 && 
                                     availableSlots.filter(s => s.available).length > 0 && ' - ¡Reserva pronto!'}
                                  </span>
                                </div>
                                {availableSlots.filter(s => !s.available).length > 0 && (
                                  <div style={{ 
                                    marginTop: '6px', 
                                    fontSize: '12px', 
                                    color: '#516640',
                                    paddingLeft: '24px'
                                  }}>
                                    💡 Tip: Los horarios ocupados no se muestran para mayor claridad
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, 1fr)',
                              gap: '8px'
                            }}>
                              {getAvailableTimeSlots()
                                .filter(time => isSlotAvailable(time)) // Solo mostrar horarios disponibles
                                .map((time, index) => {
                                  const isSelected = formData.startTime === time
                                  const slot = availableSlots.find(s => s.startTime === time)
                                  const availableCourts = slot?.availableCourts
                                  
                                  return (
                                    <button
                                      key={time}
                                      onClick={() => {
                                        handleInputChange('startTime', time)
                                        setShowTimeSelector(false)
                                      }}
                                      style={{
                                        padding: '10px 8px',
                                        fontSize: '14px',
                                        fontWeight: isSelected ? 600 : 400,
                                        border: isSelected ? '2px solid #A4DF4E' : '1px solid rgba(164, 223, 78, 0.3)',
                                        borderRadius: '8px',
                                        background: isSelected 
                                          ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.15), rgba(102, 231, 170, 0.08))'
                                          : 'white',
                                        color: '#182A01',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both`,
                                        boxShadow: isSelected ? '0 2px 8px rgba(164, 223, 78, 0.2)' : 'none',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '2px'
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!isSelected) {
                                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(102, 231, 170, 0.02))'
                                          e.currentTarget.style.transform = 'scale(1.05)'
                                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)'
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!isSelected) {
                                          e.currentTarget.style.background = 'white'
                                          e.currentTarget.style.transform = 'scale(1)'
                                          e.currentTarget.style.boxShadow = 'none'
                                        }
                                      }}
                                      title={formData.isMultiCourt && availableCourts !== undefined ? 
                                        `${time}: ${availableCourts} canchas disponibles` : 
                                        `Horario disponible: ${time}`}
                                    >
                                      <span>{time}</span>
                                      {formData.isMultiCourt && availableCourts !== undefined && (
                                        <span style={{
                                          fontSize: '9px',
                                          color: availableCourts >= (formData.multiCourtCount || 2) ? '#516640' : '#FF9500',
                                          fontWeight: 500
                                        }}>
                                          {availableCourts} {availableCourts === 1 ? 'cancha' : 'canchas'}
                                        </span>
                                      )}
                                      {isSelected && (
                                        <span style={{
                                          position: 'absolute',
                                          top: '2px',
                                          right: '2px',
                                          fontSize: '10px'
                                        }}>
                                          ✓
                                        </span>
                                      )}
                                    </button>
                                  )
                                })}
                            </div>
                            
                            {/* Mensaje cuando no hay horarios disponibles */}
                            {availableSlots.length > 0 && availableSlots.filter(s => s.available).length === 0 && (
                              <div style={{
                                padding: '32px',
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.05), rgba(244, 67, 54, 0.02))',
                                borderRadius: '12px',
                                border: '1px dashed rgba(255, 87, 34, 0.2)',
                                animation: 'fadeInUp 0.4s ease-out'
                              }}>
                                <div style={{
                                  fontSize: '48px',
                                  marginBottom: '16px',
                                  animation: 'shake 0.5s ease-in-out'
                                }}>📅</div>
                                <div style={{
                                  fontSize: '16px',
                                  fontWeight: 600,
                                  color: '#182A01',
                                  marginBottom: '8px'
                                }}>Día completamente reservado</div>
                                <div style={{
                                  fontSize: '14px',
                                  color: '#516640',
                                  marginBottom: '16px'
                                }}>
                                  Todos los horarios están ocupados para esta fecha.
                                </div>
                                <div style={{
                                  padding: '8px 16px',
                                  background: 'rgba(164, 223, 78, 0.1)',
                                  borderRadius: '8px',
                                  display: 'inline-block',
                                  fontSize: '13px',
                                  color: '#182A01',
                                  fontWeight: 500,
                                  border: '1px solid rgba(164, 223, 78, 0.2)'
                                }}>
                                  💡 Sugerencia: Prueba con otra fecha cercana
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    
                    {errors.startTime && (
                      <p style={{ color: '#FF3B30', fontSize: '12px', marginTop: '4px' }}>
                        {errors.startTime}
                      </p>
                    )}
                  </div>
                )}

                {/* Price Preview */}
                {formData.startTime && (
                  <div style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))',
                    borderRadius: '12px',
                    border: '1px solid rgba(164, 223, 78, 0.2)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'rgba(0, 0, 0, 0.6)',
                          marginBottom: '4px'
                        }}>
                          {formData.isMultiCourt ? 'Precio total estimado' : 'Precio estimado'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'rgba(0, 0, 0, 0.5)'
                        }}>
                          {formData.duration} minutos • {
                            formData.isMultiCourt 
                              ? `${formData.multiCourtCount} canchas`
                              : activeCourts.find(c => c.id === formData.courtId)?.name
                          }
                        </div>
                        {formData.isMultiCourt && (
                          <div style={{
                            fontSize: '11px',
                            color: '#516640',
                            marginTop: '2px'
                          }}>
                            ~${Math.round((calculatePrice() * (formData.multiCourtCount || 2)) / (formData.multiCourtCount || 2))} MXN por cancha
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#182A01'
                      }}>
                        {priceLoading ? 'Calculando...' : 
                         `$${formData.isMultiCourt 
                           ? calculatePrice() * (formData.multiCourtCount || 2)
                           : calculatePrice()} MXN`}
                      </div>
                    </div>
                    
                    {formData.isMultiCourt && formData.splitPaymentEnabled && (
                      <div style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(164, 223, 78, 0.2)',
                        fontSize: '12px',
                        color: '#516640'
                      }}>
                        💰 Cada jugador pagará: ${Math.round((calculatePrice() * (formData.multiCourtCount || 2)) / formData.splitPaymentCount)} MXN
                      </div>
                    )}
                  </div>
                )}
              </div>
            </SettingsCard>
          </div>
        )}

        {/* Step 2: Player Information */}
        {currentStep === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SettingsCard
              title="Información del Jugador"
              description="Datos de contacto del jugador principal"
              icon={<Users size={20} />}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Teléfono primero para búsqueda del cliente */}
                <div style={{ position: 'relative' }}>
                  <AppleInput
                    label="Teléfono del cliente"
                    type="tel"
                    value={formData.playerPhone}
                    onChange={(e) => handleInputChange('playerPhone', e.target.value)}
                    placeholder="Ingresa el teléfono para buscar cliente"
                    error={errors.playerPhone}
                  />
                  {/* Loading indicator */}
                  {loadingPlayerData && (
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      top: '35px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Spinner />
                    </div>
                  )}
                  {/* Cliente encontrado indicator */}
                  {playerFound && !loadingPlayerData && (
                    <div style={{
                      position: 'absolute',
                      right: '12px',
                      top: '35px',
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#34C759',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: 'white'
                    }}>
                      ✓
                    </div>
                  )}
                  {/* Mensaje de cliente encontrado */}
                  {playerFound && (
                    <div style={{
                      fontSize: '12px',
                      color: '#34C759',
                      marginTop: '4px',
                      fontWeight: 500
                    }}>
                      ✓ Cliente encontrado: {playerFound.name} {playerFound.memberNumber && `(${playerFound.memberNumber})`}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <AppleInput
                    label="Nombre completo"
                    value={formData.playerName}
                    onChange={(e) => handleInputChange('playerName', e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    error={errors.playerName}
                  />
                  <AppleInput
                    label="Email (opcional)"
                    type="email"
                    value={formData.playerEmail}
                    onChange={(e) => handleInputChange('playerEmail', e.target.value)}
                    placeholder="correo@ejemplo.com"
                    error={errors.playerEmail}
                  />
                </div>
              </div>
            </SettingsCard>

            {/* Split Payment Option */}
            <SettingsCard
              title="Pago Dividido"
              description="Divide el costo entre los jugadores"
              icon={<DollarSign size={20} />}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#000',
                    marginBottom: '4px'
                  }}>
                    Activar pago dividido
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(0, 0, 0, 0.5)'
                  }}>
                    Cada jugador recibirá un link de pago individual
                  </div>
                </div>
                <label style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '51px',
                  height: '31px'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.splitPaymentEnabled}
                    onChange={(e) => handleInputChange('splitPaymentEnabled', e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: formData.splitPaymentEnabled ? '#34C759' : 'rgba(0, 0, 0, 0.15)',
                    transition: '0.3s',
                    borderRadius: '34px'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '',
                      height: '27px',
                      width: '27px',
                      left: formData.splitPaymentEnabled ? '22px' : '2px',
                      bottom: '2px',
                      background: 'white',
                      transition: '0.3s',
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                    }} />
                  </span>
                </label>
              </div>

              {formData.splitPaymentEnabled && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: 'rgba(255, 204, 0, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 204, 0, 0.3)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <AlertCircle size={16} color="#FF9500" />
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#FF9500'
                    }}>
                      Feature exclusivo de Padelyzer
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <label style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'rgba(0, 0, 0, 0.6)'
                    }}>
                      Dividir entre:
                    </label>
                    <select
                      value={formData.splitPaymentCount}
                      onChange={(e) => handleInputChange('splitPaymentCount', parseInt(e.target.value))}
                      style={{
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        borderRadius: '8px',
                        background: 'white'
                      }}
                    >
                      {Array.from({ length: 49 }, (_, i) => i + 2).map(num => (
                        <option key={num} value={num}>{num} jugadores</option>
                      ))}
                    </select>
                    <span style={{
                      fontSize: '13px',
                      color: 'rgba(0, 0, 0, 0.5)'
                    }}>
                      ${Math.round((formData.isMultiCourt 
                        ? calculatePrice() * (formData.multiCourtCount || 2)
                        : calculatePrice()) / formData.splitPaymentCount)} c/u
                    </span>
                  </div>
                </div>
              )}
            </SettingsCard>

            {/* Notes */}
            <SettingsCard
              title="Notas adicionales"
              description="Información extra sobre la reserva"
            >
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Algún comentario o solicitud especial..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: '12px',
                  background: 'white',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
                }}
              />
            </SettingsCard>
          </div>
        )}

        {/* Step 3: Payment Options */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SettingsCard
              title="Método de Pago"
              description="Selecciona cómo se realizará el pago"
              icon={<CreditCard size={20} />}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Link de Pago */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  background: formData.paymentMethod === 'stripe' 
                    ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(102, 231, 170, 0.02))'
                    : 'white',
                  border: `2px solid ${formData.paymentMethod === 'stripe' ? '#A4DF4E' : 'rgba(0, 0, 0, 0.12)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={formData.paymentMethod === 'stripe'}
                    onChange={() => handleInputChange('paymentMethod', 'stripe')}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    boxShadow: '0 4px 12px rgba(164, 223, 78, 0.3)'
                  }}>
                    <CreditCard size={20} color="#182A01" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#000',
                      marginBottom: '4px'
                    }}>
                      Enviar Link de Pago
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(0, 0, 0, 0.5)'
                    }}>
                      Se enviará un link de pago por WhatsApp
                    </div>
                    {formData.splitPaymentEnabled && (
                      <div style={{
                        fontSize: '11px',
                        color: '#516640',
                        marginTop: '4px',
                        fontWeight: 500
                      }}>
                        ✓ Cada jugador recibirá su link individual
                      </div>
                    )}
                  </div>
                </label>

                {/* Pago en Check-in */}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  background: formData.paymentMethod === 'onsite' 
                    ? 'linear-gradient(135deg, rgba(102, 231, 170, 0.05), rgba(164, 223, 78, 0.02))'
                    : 'white',
                  border: `2px solid ${formData.paymentMethod === 'onsite' ? '#66E7AA' : 'rgba(0, 0, 0, 0.12)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="onsite"
                    checked={formData.paymentMethod === 'onsite'}
                    onChange={() => handleInputChange('paymentMethod', 'onsite')}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #66E7AA, #A4DF4E)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    boxShadow: '0 4px 12px rgba(102, 231, 170, 0.3)'
                  }}>
                    <Building2 size={20} color="#182A01" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#000',
                      marginBottom: '4px'
                    }}>
                      Pago en Check-in
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(0, 0, 0, 0.5)'
                    }}>
                      El cliente pagará al llegar al club
                    </div>
                  </div>
                </label>

                {/* Removed onsite payment options - simplified */}
                {false && (
                  <div style={{
                    marginTop: '12px',
                    padding: '16px',
                    background: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '12px'
                  }}>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'rgba(0, 0, 0, 0.6)',
                      marginBottom: '12px'
                    }}>
                      Método de pago en sitio:
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {paymentSettings?.terminalEnabled && (
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px',
                          background: formData.paymentType === 'terminal' ? 'white' : 'transparent',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}>
                          <input
                            type="radio"
                            name="paymentType"
                            value="terminal"
                            checked={formData.paymentType === 'terminal'}
                            onChange={() => handleInputChange('paymentType', 'terminal')}
                            style={{ marginRight: '12px' }}
                          />
                          <CreditCard size={16} style={{ marginRight: '8px' }} />
                          <span style={{ fontSize: '14px' }}>Terminal de tarjeta</span>
                        </label>
                      )}
                      
                      {paymentSettings?.transferEnabled && (
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px',
                          background: formData.paymentType === 'transfer' ? 'white' : 'transparent',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}>
                          <input
                            type="radio"
                            name="paymentType"
                            value="transfer"
                            checked={formData.paymentType === 'transfer'}
                            onChange={() => handleInputChange('paymentType', 'transfer')}
                            style={{ marginRight: '12px' }}
                          />
                          <Smartphone size={16} style={{ marginRight: '8px' }} />
                          <span style={{ fontSize: '14px' }}>Transferencia bancaria</span>
                        </label>
                      )}
                      
                      {paymentSettings?.cashEnabled && (
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px',
                          background: formData.paymentType === 'cash' ? 'white' : 'transparent',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}>
                          <input
                            type="radio"
                            name="paymentType"
                            value="cash"
                            checked={formData.paymentType === 'cash'}
                            onChange={() => handleInputChange('paymentType', 'cash')}
                            style={{ marginRight: '12px' }}
                          />
                          <DollarSign size={16} style={{ marginRight: '8px' }} />
                          <span style={{ fontSize: '14px' }}>Efectivo</span>
                        </label>
                      )}
                    </div>

                    {/* Bank Transfer Details */}
                    {formData.paymentType === 'transfer' && paymentSettings?.transferEnabled && (
                      <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(102, 231, 170, 0.02))',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)'
                      }}>
                        <p style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#516640',
                          marginBottom: '8px'
                        }}>
                          Datos para transferencia:
                        </p>
                        <div style={{
                          fontSize: '11px',
                          color: 'rgba(0, 0, 0, 0.7)',
                          lineHeight: '1.5'
                        }}>
                          <p><strong>Banco:</strong> {paymentSettings.bankName}</p>
                          <p><strong>Cuenta:</strong> {paymentSettings.accountNumber}</p>
                          <p><strong>CLABE:</strong> {paymentSettings.clabe}</p>
                          <p><strong>Titular:</strong> {paymentSettings.accountHolder}</p>
                        </div>
                      </div>
                    )}

                    {/* Reference Number */}
                    {(formData.paymentType === 'terminal' || formData.paymentType === 'transfer') && (
                      <div style={{ marginTop: '16px' }}>
                        <AppleInput
                          label="Número de referencia (opcional)"
                          value={formData.referenceNumber || ''}
                          onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                          placeholder={formData.paymentType === 'terminal' ? 'Folio de terminal' : 'Número de operación'}
                        />
                        <p style={{
                          fontSize: '11px',
                          color: 'rgba(0, 0, 0, 0.5)',
                          marginTop: '4px'
                        }}>
                          Puedes agregarlo después si aún no lo tienes
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Final Summary */}
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))',
                  borderRadius: '12px',
                  border: '1px solid rgba(164, 223, 78, 0.2)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'rgba(0, 0, 0, 0.6)',
                        marginBottom: '4px'
                      }}>
                        Total a pagar
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'rgba(0, 0, 0, 0.5)'
                      }}>
                        {formData.paymentMethod === 'stripe' && formData.splitPaymentEnabled
                          ? `${formData.splitPaymentCount} pagos de $${Math.round((formData.isMultiCourt 
                            ? calculatePrice() * (formData.multiCourtCount || 2)
                            : calculatePrice()) / formData.splitPaymentCount)} MXN c/u`
                          : formData.paymentMethod === 'stripe'
                          ? 'Se enviará link de pago por WhatsApp'
                          : 'Pagar al llegar al club'}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: 700,
                      color: '#182A01'
                    }}>
                      ${formData.isMultiCourt 
                        ? calculatePrice() * (formData.multiCourtCount || 2)
                        : calculatePrice()} MXN
                    </div>
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <div>
            {currentStep > 1 && (
              <AppleButton
                variant="secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isLoading}
                icon={<ChevronLeft size={16} />}
              >
                Atrás
              </AppleButton>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <AppleButton
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              style={{ 
                background: 'white',
                color: '#182A01',
                border: '1px solid #182A01'
              }}
            >
              Cancelar
            </AppleButton>
            
            <AppleButton
              variant="primary"
              onClick={() => handleSubmit()}
              disabled={isLoading || isSubmitting}
              icon={currentStep < 3 ? <ChevronRight size={16} /> : undefined}
            >
              {(isLoading || isSubmitting) ? 'Procesando...' : 
               currentStep < 3 ? 'Continuar' :
               mode === 'edit' ? 'Guardar Cambios' : 'Crear Reserva'}
            </AppleButton>
          </div>
        </div>
      </form>
    </AppleModal>
  )
}