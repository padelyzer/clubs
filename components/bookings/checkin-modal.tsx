'use client'

import { useState, useEffect } from 'react'
import { AppleModal } from '@/components/design-system/AppleModal'
import { AppleButton } from '@/components/design-system/AppleButton'
import { SettingsCard } from '@/components/design-system/SettingsCard'
import { SplitPaymentManager } from '@/components/bookings/split-payment-manager'
import { useNotify } from '@/contexts/NotificationContext'
import { 
  CheckCircle2, Clock, CreditCard, DollarSign, 
  Users, Calendar, MapPin, AlertCircle,
  Smartphone, Building2, Check, X, BanknoteIcon,
  CheckIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon, Copy
} from 'lucide-react'

interface SplitPayment {
  id: string
  playerName: string
  playerEmail?: string
  playerPhone?: string
  amount: number
  status: 'pending' | 'processing' | 'completed'
  stripePaymentIntentId?: string
  completedAt?: string
}

interface StudentCheckIn {
  classBookingId: string
  studentName: string
  studentPhone?: string
  studentEmail?: string
  attendanceStatus: 'PRESENT' | 'LATE' | 'ABSENT'
  paymentStatus: string
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER' | 'ONLINE'
  paymentAmount?: number
  dueAmount: number
  paidAmount: number
}

interface CheckInModalProps {
  isOpen: boolean
  onClose: () => void
  booking: {
    id: string
    playerName: string
    playerPhone: string
    playerEmail?: string
    court: { name: string }
    date: string
    startTime: string
    endTime: string
    totalPlayers?: number
    price: number
    totalPrice?: number
    paymentStatus: string
    status: string
    splitPaymentEnabled?: boolean
    splitPaymentCount?: number
    splitPayments?: SplitPayment[]
    // For groups
    isGroup?: boolean
    // For classes
    isClass?: boolean
    className?: string
    students?: StudentCheckIn[]
  }
  onCheckIn: (bookingId: string, paymentData?: any) => Promise<void>
  onRefreshBooking?: () => Promise<void>
}

export function CheckInModal({
  isOpen,
  onClose,
  booking,
  onCheckIn,
  onRefreshBooking
}: CheckInModalProps) {
  const notify = useNotify()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'terminal' | 'transfer'>('cash')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [step, setStep] = useState<'checkin' | 'payment'>('checkin')
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [showPaymentOptions, setShowPaymentOptions] = useState<Record<string, boolean>>({})
  const [transferReferences, setTransferReferences] = useState<Record<string, string>>({})
  const [terminalReferences, setTerminalReferences] = useState<Record<string, string>>({})
  const [copiedPaymentIds, setCopiedPaymentIds] = useState<Record<string, boolean>>({})
  const [regularPaymentLink, setRegularPaymentLink] = useState<string | null>(null)
  const [showSplitPaymentModal, setShowSplitPaymentModal] = useState(false)
  const [splitPaymentView, setSplitPaymentView] = useState(false) // Vista dentro del mismo modal
  const [generatingRegularLink, setGeneratingRegularLink] = useState(false)
  const [hasExistingPaymentIntent, setHasExistingPaymentIntent] = useState(false)
  const [studentPaymentLinks, setStudentPaymentLinks] = useState<Record<string, string>>({})
  const [generatingStudentLinks, setGeneratingStudentLinks] = useState<Record<string, boolean>>({})
  
  // For cash payment confirmation
  const [pendingCashPayments, setPendingCashPayments] = useState<Record<string, boolean>>({})
  
  // For payment confirmation modal
  const [paymentConfirmation, setPaymentConfirmation] = useState<{
    splitPaymentId: string
    playerName: string
    paymentMethod: string
    referenceNumber?: string
    message: string
  } | null>(null)
  
  // For class split view
  const [studentCheckIns, setStudentCheckIns] = useState<Record<string, {
    attendance: 'PRESENT' | 'LATE' | 'ABSENT'
    paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER' | 'ONLINE'
    paymentReference?: string
    paymentAmount?: number
  }>>({})
  
  // Determine if this is a class with multiple students
  const isClassWithStudents = booking.isClass && booking.students && booking.students.length > 1
  const hasUnpaidStudents = booking.students?.some(s => s.paymentStatus === 'pending')
  
  // Initialize check-in state for students with already paid students
  useEffect(() => {
    if (booking.students) {
      const initialCheckIns: Record<string, any> = {}
      booking.students.forEach(student => {
        if (student.paymentStatus === 'completed') {
          // Student already paid, mark them
          initialCheckIns[student.classBookingId] = {
            attendance: 'PRESENT',
            paymentMethod: 'SAVED', // Special flag to indicate already saved
            paymentAmount: student.paidAmount
          }
        }
      })
      setStudentCheckIns(initialCheckIns)
    }
  }, [booking.students])
  
  // Debug: Ver qué datos está recibiendo el modal
  useEffect(() => {
    if (booking) {
      console.log('CheckInModal - Booking data:', {
        id: booking.id,
        playerName: booking.playerName,
        paymentStatus: booking.paymentStatus,
        splitPaymentEnabled: booking.splitPaymentEnabled,
        splitPaymentCount: booking.splitPaymentCount,
        splitPayments: booking.splitPayments,
        price: booking.price
      })
    }
  }, [booking])
  
  const isPaid = booking.paymentStatus === 'completed' || booking.paymentStatus === 'paid'
  
  useEffect(() => {
    // Si no está pagado, empezar en el paso de pago
    setStep(isPaid ? 'checkin' : 'payment')
    setReferenceNumber('')
  }, [booking, isPaid])
  
  // Check for existing payment intent when modal opens
  useEffect(() => {
    const checkExistingPayment = async () => {
      if (isOpen && booking && (booking.paymentStatus === 'pending' || booking.paymentStatus === 'processing')) {
        try {
          const response = await fetch(`/api/bookings/${booking.id}/check-payment`)
          const data = await response.json()
          if (data.hasPaymentIntent) {
            setHasExistingPaymentIntent(true)
            // Set the payment link immediately since it always exists
            setRegularPaymentLink(`${window.location.origin}/pay/${booking.id}`)
          } else {
            // Even if no payment intent, the link is always valid
            setRegularPaymentLink(`${window.location.origin}/pay/${booking.id}`)
          }
        } catch (error) {
          console.error('Error checking existing payment:', error)
          // On error, still set the link as it's always valid
          setRegularPaymentLink(`${window.location.origin}/pay/${booking.id}`)
        }
      }
    }
    
    checkExistingPayment()
  }, [isOpen, booking])

  // Function to generate Stripe payment link for a student
  const generateStudentPaymentLink = async (studentId: string, studentName: string) => {
    setGeneratingStudentLinks(prev => ({ ...prev, [studentId]: true }))
    try {
      const classId = booking.id.replace('class-', '')
      // Use the student's classBookingId directly
      const response = await fetch(`/api/bookings/${studentId}/payment-link`)
      const data = await response.json()
      
      if (data.success && data.paymentLink) {
        setStudentPaymentLinks(prev => ({ ...prev, [studentId]: data.paymentLink }))
        notify.success({
          title: 'Link generado',
          message: `Link de pago listo para ${studentName}`,
          duration: 4000
        })
      } else {
        notify.error({
          title: 'Error al generar link',
          message: data.error || 'No se pudo generar el link de pago',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error generating payment link:', error)
      notify.error({
        title: 'Error de conexión',
        message: 'No se pudo generar el link de pago',
        duration: 5000
      })
    } finally {
      setGeneratingStudentLinks(prev => ({ ...prev, [studentId]: false }))
    }
  }

  // Function to copy student payment link
  const copyStudentPaymentLink = async (studentId: string, studentName: string) => {
    const link = studentPaymentLinks[studentId]
    if (!link) return
    
    try {
      await navigator.clipboard.writeText(link)
      
      // Show success feedback
      setCopiedPaymentIds(prev => ({ ...prev, [studentId]: true }))
      
      // Clear success feedback after 3 seconds
      setTimeout(() => {
        setCopiedPaymentIds(prev => {
          const newState = { ...prev }
          delete newState[studentId]
          return newState
        })
      }, 3000)
      
      notify.success({
        title: 'Link copiado',
        message: `Link de pago copiado para ${studentName}`,
        duration: 3000
      })
    } catch (error) {
      console.error('Error copying payment link:', error)
      notify.error({
        title: 'Error al copiar',
        message: 'No se pudo copiar el link al portapapeles',
        duration: 4000
      })
    }
  }

  // Function to save student payment immediately
  const saveStudentPayment = async (
    studentId: string, 
    paymentMethod: 'CASH' | 'CARD' | 'TRANSFER',
    paymentReference?: string,
    paymentAmount?: number
  ) => {
    try {
      // Extract class ID from booking ID (format: class-xxxxx)
      const classId = booking.id.replace('class-', '')
      
      const response = await fetch(`/api/classes/${classId}/students/${studentId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod,
          paymentReference,
          paymentAmount
        })
      })

      const data = await response.json()
      
      if (data.success) {
        notify.success({
          title: 'Pago registrado',
          message: 'El pago se ha guardado exitosamente',
          duration: 3000
        })
        
        // Refresh booking data to reflect the payment
        if (onRefreshBooking) {
          await onRefreshBooking()
        }
        
        return true
      } else {
        notify.error({
          title: 'Error al guardar pago',
          message: data.error || 'No se pudo registrar el pago',
          duration: 5000
        })
        return false
      }
    } catch (error) {
      console.error('Error saving payment:', error)
      notify.error({
        title: 'Error de conexión',
        message: 'No se pudo guardar el pago. Verifica tu conexión.',
        duration: 5000
      })
      return false
    }
  }

  // Function to close specific dropdown
  const closePaymentOptions = (splitPaymentId: string) => {
    const newShowPaymentOptions = { ...showPaymentOptions }
    delete newShowPaymentOptions[splitPaymentId]
    setShowPaymentOptions(newShowPaymentOptions)
  }

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      // For classes with multiple students, use quick-checkin endpoint
      if (isClassWithStudents && booking.students) {
        const students = booking.students.map(student => {
          // Use the explicitly set attendance status, default to ABSENT if not set
          const checkInData = studentCheckIns[student.classBookingId] || {}
          const attendanceStatus = checkInData.attendance || 'ABSENT'
          
          // Build student data object with proper validation
          const studentData: any = {
            classBookingId: student.classBookingId,
            studentName: student.studentName,
            attendanceStatus // Always send a valid value
          }
          
          // Only add payment fields if payment was processed
          if (checkInData.paymentMethod) {
            studentData.paymentMethod = checkInData.paymentMethod
            studentData.paymentAmount = checkInData.paymentAmount || student.dueAmount || 0
            
            if (checkInData.paymentReference) {
              studentData.paymentReference = checkInData.paymentReference
            }
          }
          
          return studentData
        })
        
        await onCheckIn(booking.id, {
          isQuickCheckIn: true,
          students
        })
      } else {
        await onCheckIn(booking.id, {
          timestamp: new Date().toISOString()
        })
      }
      onClose()
    } catch (error) {
      console.error('Error during check-in:', error)
      notify.error({
        title: 'Error en check-in',
        message: 'No se pudo completar el check-in. Intenta nuevamente.',
        duration: 6000
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentAndCheckIn = async () => {
    setLoading(true)
    try {
      // For classes with multiple students, use quick-checkin endpoint
      if (isClassWithStudents && booking.students) {
        const students = booking.students.map(student => {
          // Use the explicitly set attendance status, default to ABSENT if not set
          const checkInData = studentCheckIns[student.classBookingId] || {}
          const attendanceStatus = checkInData.attendance || 'ABSENT'
          
          // Build student data object with proper validation
          const studentData: any = {
            classBookingId: student.classBookingId,
            studentName: student.studentName,
            attendanceStatus // Always send a valid value
          }
          
          // Only add payment fields if payment was processed
          if (checkInData.paymentMethod) {
            studentData.paymentMethod = checkInData.paymentMethod
            studentData.paymentAmount = checkInData.paymentAmount || student.dueAmount || 0
            
            if (checkInData.paymentReference) {
              studentData.paymentReference = checkInData.paymentReference
            }
          }
          
          return studentData
        })
        
        await onCheckIn(booking.id, {
          isQuickCheckIn: true,
          students
        })
      } else {
        // Hacer el check-in con los datos del pago si es necesario
        await onCheckIn(booking.id, {
          paymentMethod: !isPaid ? paymentMethod : undefined,
          referenceNumber: !isPaid ? referenceNumber : undefined,
          timestamp: new Date().toISOString()
        })
      }
      
      onClose()
    } catch (error) {
      console.error('Error during payment and check-in:', error)
      notify.error({
        title: 'Error al procesar',
        message: 'No se pudo procesar el pago y check-in. Intenta nuevamente.',
        duration: 6000
      })
    } finally {
      setLoading(false)
    }
  }

  const generatePaymentIntent = async (splitPaymentId: string) => {
    setProcessingPayment(splitPaymentId)
    try {
      const response = await fetch('/api/split-payments/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: booking.id,
          splitPaymentId
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        notify.success({
          title: 'Link generado',
          message: 'El jugador recibirá el link de pago por WhatsApp',
          duration: 5000
        })
        
        // Refresh booking data to update the UI
        if (onRefreshBooking) {
          await onRefreshBooking()
        }
        
        // Note: Modal stays open so user can continue with other payments
      } else {
        notify.error({
          title: 'Error al generar link',
          message: data.error || 'No se pudo generar el link de pago',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error generating payment intent:', error)
      notify.error({
        title: 'Error de conexión',
        message: 'No se pudo generar el link de pago. Verifica tu conexión.',
        duration: 6000
      })
    } finally {
      setProcessingPayment(null)
    }
  }

  const copyPaymentLink = async (splitPaymentId: string, playerName: string) => {
    try {
      const paymentLink = `${window.location.origin}/pay/${booking.id}?split=${splitPaymentId}`
      await navigator.clipboard.writeText(paymentLink)
      
      // Show success feedback
      setCopiedPaymentIds(prev => ({ ...prev, [splitPaymentId]: true }))
      
      // Clear success feedback after 3 seconds
      setTimeout(() => {
        setCopiedPaymentIds(prev => {
          const newState = { ...prev }
          delete newState[splitPaymentId]
          return newState
        })
      }, 3000)
      
      notify.success({
        title: 'Link copiado',
        message: `Link de pago copiado para ${playerName}`,
        duration: 3000
      })
    } catch (error) {
      console.error('Error copying payment link:', error)
      notify.error({
        title: 'Error al copiar',
        message: 'No se pudo copiar el link al portapapeles',
        duration: 4000
      })
    }
  }

  const generateRegularPaymentLink = async () => {
    setGeneratingRegularLink(true)
    try {
      const response = await fetch(`/api/bookings/${booking.id}/payment-link`)
      const data = await response.json()
      
      if (data.success && data.paymentLink) {
        setRegularPaymentLink(data.paymentLink)
        notify.success({
          title: 'Link generado',
          message: 'El link de pago está listo para usar',
          duration: 4000
        })
      } else {
        notify.error({
          title: 'Error al generar link',
          message: data.error || 'No se pudo generar el link de pago',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error generating regular payment link:', error)
      notify.error({
        title: 'Error al generar link',
        message: 'No se pudo crear el link de pago',
        duration: 5000
      })
    } finally {
      setGeneratingRegularLink(false)
    }
  }

  const copyRegularPaymentLink = async () => {
    if (!regularPaymentLink) return
    
    try {
      await navigator.clipboard.writeText(regularPaymentLink)
      notify.success({
        title: 'Link copiado',
        message: `Link de pago copiado para ${booking.playerName}`,
        duration: 3000
      })
    } catch (error) {
      console.error('Error copying regular payment link:', error)
      notify.error({
        title: 'Error al copiar',
        message: 'No se pudo copiar el link al portapapeles',
        duration: 4000
      })
    }
  }

  const markAsCompleted = async (splitPaymentId: string, playerName: string, paymentMethod: string = 'manual', referenceNumber?: string) => {
    setProcessingPayment(splitPaymentId)
    try {
      const response = await fetch(`/api/bookings/${booking.id}/split-payments`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          splitPaymentId,
          action: 'complete',
          paymentMethod: paymentMethod,
          referenceNumber: referenceNumber
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        notify.success({
          title: 'Pago registrado',
          message: data.message,
          duration: 5000
        })
        // Close dropdown for this payment
        closePaymentOptions(splitPaymentId)
        
        // Clear reference numbers for this payment
        const newTransferReferences = { ...transferReferences }
        const newTerminalReferences = { ...terminalReferences }
        delete newTransferReferences[splitPaymentId]
        delete newTerminalReferences[splitPaymentId]
        setTransferReferences(newTransferReferences)
        setTerminalReferences(newTerminalReferences)
        
        // If all payments are completed, just show success message (don't close modal)
        if (data.paymentCompleted) {
          notify.success({
            title: '¡Pago completo!',
            message: 'Todos los pagos han sido completados. La reserva está pagada en su totalidad.',
            duration: 8000,
            action: {
              label: 'Hacer check-in',
              onClick: () => setStep('checkin')
            }
          })
        }
        
        // Refresh booking data to update the UI
        if (onRefreshBooking) {
          await onRefreshBooking()
        }
        
        // Note: Modal stays open so user can continue registering other payments or do check-in
      } else {
        notify.error({
          title: 'Error al marcar pago',
          message: data.error || 'No se pudo registrar el pago',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Error marking payment as completed:', error)
      notify.error({
        title: 'Error al procesar',
        message: 'No se pudo marcar el pago como completado',
        duration: 6000
      })
    } finally {
      setProcessingPayment(null)
    }
  }

  return (
    <>
      <AppleModal
      isOpen={isOpen}
      onClose={onClose}
      title={splitPaymentView ? "Gestión de Pagos Divididos" : "Check-in de Reserva"}
      size="medium"
    >
      {splitPaymentView ? (
        // Vista de gestión de pagos divididos
        <div>
          {/* Botón volver */}
          <div style={{ marginBottom: '20px' }}>
            <AppleButton
              variant="secondary"
              onClick={() => setSplitPaymentView(false)}
              style={{
                background: 'rgba(0, 0, 0, 0.05)',
                color: '#666',
                border: 'none',
                fontSize: '14px',
                padding: '8px 16px'
              }}
            >
              ← Volver al Check-in
            </AppleButton>
          </div>

          {/* Contenido del Split Payment Manager integrado */}
          <SplitPaymentManager
            bookingId={booking.id}
            onClose={() => {
              setSplitPaymentView(false)
              if (onRefreshBooking) {
                onRefreshBooking()
              }
            }}
            embedded={true} // Nueva prop para indicar que está integrado
          />
        </div>
      ) : (
        // Vista normal de check-in
        <>
          {/* Booking Summary */}
      <SettingsCard
        title="Detalles de la Reserva"
        description="Información del jugador y la reserva"
        icon={<Calendar size={20} />}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px'
        }}>
          <div>
            <div style={{
              fontSize: '12px',
              color: '#829F65',
              marginBottom: '4px'
            }}>
              Jugador
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#182A01'
            }}>
              {booking.isGroup ? booking.name : booking.playerName}
            </div>
            {booking.playerPhone && (
              <div style={{
                fontSize: '12px',
                color: '#516640',
                marginTop: '2px'
              }}>
                📱 {booking.playerPhone}
              </div>
            )}
          </div>
          
          <div>
            <div style={{
              fontSize: '12px',
              color: '#829F65',
              marginBottom: '4px'
            }}>
              Cancha y Horario
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#182A01'
            }}>
              {booking.isGroup ? booking.courtNames : booking.court?.name}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#516640',
              marginTop: '2px'
            }}>
              {booking.startTime} - {booking.endTime}
            </div>
          </div>
        </div>

        {/* Payment Status Banner */}
        <div style={{
          marginTop: '16px',
          padding: '12px',
          borderRadius: '8px',
          background: isPaid 
            ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))'
            : booking.splitPaymentEnabled && (booking.paymentStatus === 'processing' || booking.paymentStatus === 'pending')
            ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(3, 169, 244, 0.05))'
            : 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.05))',
          border: isPaid
            ? '1px solid rgba(164, 223, 78, 0.3)'
            : booking.splitPaymentEnabled && (booking.paymentStatus === 'processing' || booking.paymentStatus === 'pending')
            ? '1px solid rgba(33, 150, 243, 0.3)'
            : '1px solid rgba(255, 193, 7, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {isPaid ? (
            <>
              <CheckCircle2 size={20} color="#A4DF4E" />
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#182A01'
                }}>
                  Pago Completado
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#516640'
                }}>
                  Total: ${((booking.price || 0) / 100).toFixed(2)} MXN
                </div>
              </div>
            </>
          ) : booking.splitPaymentEnabled ? (
            <>
              <Users size={20} color="#2196F3" />
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#182A01'
                  }}>
                    Pago Dividido
                  </div>
                  <div style={{
                    padding: '2px 8px',
                    background: 'rgba(33, 150, 243, 0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#2196F3'
                  }}>
                    {booking.splitPayments?.filter(sp => sp.status === 'completed').length || 0}/{booking.splitPaymentCount || booking.splitPayments?.length || 0}
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#516640',
                  marginTop: '2px'
                }}>
                  Pagado: ${((booking.splitPayments?.filter(sp => sp.status === 'completed').reduce((sum, sp) => sum + sp.amount, 0) || 0) / 100).toFixed(2)} de ${((booking.price || 0) / 100).toFixed(2)} MXN
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertCircle size={20} color="#FFC107" />
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#182A01'
                }}>
                  Pago Pendiente
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#516640'
                }}>
                  Debe pagar: ${((booking.price || 0) / 100).toFixed(2)} MXN
                </div>
              </div>
            </>
          )}
        </div>
      </SettingsCard>

      {/* Class Students Split View */}
      {isClassWithStudents && booking.students && (
        <SettingsCard
          title={`Check-in de Estudiantes (${booking.students.length})`}
          description="Registra asistencia y pago individual para cada estudiante"
          icon={<Users size={20} />}
          style={{ marginTop: '20px' }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {booking.students.map((student, index) => (
              <div
                key={student.classBookingId}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  background: student.paymentStatus === 'completed'
                    ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(102, 231, 170, 0.02))'
                    : 'rgba(0, 0, 0, 0.02)'
                }}
              >
                {/* Student Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: student.paymentStatus === 'completed'
                        ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)'
                        : 'linear-gradient(135deg, #F5F5F5, #E0E0E0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: student.paymentStatus === 'completed' ? 'white' : '#9E9E9E',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
                    }}>
                      {student.paymentStatus === 'completed' ? (
                        <CheckIcon size={18} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#182A01'
                      }}>
                        {student.studentName}
                      </div>
                      {student.studentPhone && (
                        <div style={{
                          fontSize: '12px',
                          color: '#516640'
                        }}>
                          📱 {student.studentPhone}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#182A01'
                    }}>
                      ${((student.dueAmount || 0) / 100).toFixed(2)} MXN
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: student.paymentStatus === 'completed' ? '#A4DF4E' : '#FF9800'
                    }}>
                      {student.paymentStatus === 'completed' ? 'Pagado' : 'Pendiente'}
                    </div>
                  </div>
                </div>


                {/* Processing payment indicator */}
                {student.paymentStatus === 'processing' && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'rgba(33, 150, 243, 0.08)',
                    border: '1px solid rgba(33, 150, 243, 0.2)',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#1976D2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Clock size={12} />
                    <span>Pago en proceso via Stripe - Puedes usar otro método mientras tanto</span>
                  </div>
                )}

                {/* Payment Methods - Individual buttons */}
                {(student.paymentStatus === 'pending' || student.paymentStatus === 'processing') && (
                  <div style={{
                    marginTop: '12px'
                  }}>
                    {studentCheckIns[student.classBookingId]?.paymentMethod ? (
                      // Payment registered display
                      <div style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.3)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <CheckIcon size={14} color="white" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#182A01'
                            }}>
                              Pago Registrado
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#516640',
                              marginTop: '2px'
                            }}>
                              {studentCheckIns[student.classBookingId]?.paymentMethod === 'CASH' ? 'Efectivo' :
                               studentCheckIns[student.classBookingId]?.paymentMethod === 'CARD' ? 'Terminal' :
                               studentCheckIns[student.classBookingId]?.paymentMethod === 'TRANSFER' ? 'Transferencia' : ''}
                              {studentCheckIns[student.classBookingId]?.paymentReference && 
                                ` • Ref: ${studentCheckIns[student.classBookingId]?.paymentReference}`
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Payment buttons
                      <div>
                        <div style={{
                          fontSize: '11px',
                          color: '#829F65',
                          marginBottom: '8px',
                          fontWeight: 600
                        }}>
                          MÉTODOS DE PAGO
                        </div>
                        
                        {/* First row - Cash and Stripe Link */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          {/* Cash Button with Confirmation */}
                          <button
                            onClick={async () => {
                              if (!pendingCashPayments[student.classBookingId]) {
                                // First click: show confirmation state
                                setPendingCashPayments(prev => ({
                                  ...prev,
                                  [student.classBookingId]: true
                                }))
                                
                                // Auto-cancel after 3 seconds if not confirmed
                                setTimeout(() => {
                                  setPendingCashPayments(prev => ({
                                    ...prev,
                                    [student.classBookingId]: false
                                  }))
                                }, 3000)
                              } else {
                                // Second click: process payment
                                const success = await saveStudentPayment(
                                  student.classBookingId,
                                  'CASH',
                                  undefined,
                                  student.dueAmount || 0
                                )
                                
                                if (success) {
                                  setStudentCheckIns(prev => ({
                                    ...prev,
                                    [student.classBookingId]: {
                                      ...prev[student.classBookingId],
                                      // PAGO = ASISTENCIA AUTOMÁTICA
                                      attendance: 'PRESENT',
                                      paymentMethod: 'CASH',
                                      paymentAmount: student.dueAmount || 0
                                    }
                                  }))
                                  setPendingCashPayments(prev => ({
                                    ...prev,
                                    [student.classBookingId]: false
                                  }))
                                }
                              }
                            }}
                            style={{
                              padding: '10px',
                              fontSize: '11px',
                              fontWeight: '600',
                              borderRadius: '8px',
                              background: pendingCashPayments[student.classBookingId] 
                                ? 'rgba(255, 152, 0, 0.1)' 
                                : 'white',
                              border: pendingCashPayments[student.classBookingId]
                                ? '2px solid #FF9800'
                                : '1px solid rgba(76, 175, 80, 0.3)',
                              color: pendingCashPayments[student.classBookingId] 
                                ? '#F57C00' 
                                : '#182A01',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              position: 'relative',
                              animation: pendingCashPayments[student.classBookingId] 
                                ? 'pulse 1s infinite' 
                                : 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (!pendingCashPayments[student.classBookingId]) {
                                e.currentTarget.style.background = 'rgba(76, 175, 80, 0.08)'
                                e.currentTarget.style.borderColor = '#4CAF50'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!pendingCashPayments[student.classBookingId]) {
                                e.currentTarget.style.background = 'white'
                                e.currentTarget.style.borderColor = 'rgba(76, 175, 80, 0.3)'
                              }
                            }}
                          >
                            {pendingCashPayments[student.classBookingId] ? (
                              <>
                                <CheckCircle2 size={14} />
                                ¡Confirmar $500!
                              </>
                            ) : (
                              <>
                                <BanknoteIcon size={14} />
                                Efectivo
                              </>
                            )}
                          </button>
                          
                          {/* Stripe Link Button */}
                          {!studentPaymentLinks[student.classBookingId] ? (
                            <button
                              onClick={async () => {
                                await generateStudentPaymentLink(student.classBookingId, student.studentName)
                              }}
                              disabled={generatingStudentLinks[student.classBookingId]}
                              style={{
                                padding: '10px',
                                fontSize: '11px',
                                fontWeight: '600',
                                borderRadius: '8px',
                                background: 'white',
                                border: '1px solid rgba(103, 58, 183, 0.3)',
                                color: '#182A01',
                                cursor: generatingStudentLinks[student.classBookingId] ? 'not-allowed' : 'pointer',
                                opacity: generatingStudentLinks[student.classBookingId] ? 0.6 : 1,
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => {
                                if (!generatingStudentLinks[student.classBookingId]) {
                                  e.currentTarget.style.background = 'rgba(103, 58, 183, 0.08)'
                                  e.currentTarget.style.borderColor = '#673AB7'
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white'
                                e.currentTarget.style.borderColor = 'rgba(103, 58, 183, 0.3)'
                              }}
                            >
                              {generatingStudentLinks[student.classBookingId] ? (
                                <>
                                  <div style={{
                                    width: '12px',
                                    height: '12px',
                                    border: '2px solid transparent',
                                    borderTop: '2px solid #673AB7',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                  }} />
                                  Generando...
                                </>
                              ) : (
                                <>
                                  <Smartphone size={14} />
                                  Link Stripe
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                await copyStudentPaymentLink(student.classBookingId, student.studentName)
                              }}
                              style={{
                                padding: '10px',
                                fontSize: '11px',
                                fontWeight: '600',
                                borderRadius: '8px',
                                background: copiedPaymentIds[student.classBookingId]
                                  ? 'rgba(76, 175, 80, 0.08)'
                                  : 'rgba(33, 150, 243, 0.08)',
                                border: copiedPaymentIds[student.classBookingId]
                                  ? '1px solid #4CAF50'
                                  : '1px solid #2196F3',
                                color: '#182A01',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                              }}
                            >
                              {copiedPaymentIds[student.classBookingId] ? (
                                <>
                                  <Check size={14} />
                                  ¡Copiado!
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  Copiar Link
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        
                        {/* Second row - Terminal and Transfer with reference fields */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px'
                        }}>
                          {/* Terminal */}
                          <div style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'rgba(156, 39, 176, 0.05)',
                            border: '1px solid rgba(156, 39, 176, 0.2)'
                          }}>
                            <input
                              type="text"
                              placeholder="Núm. autorización"
                              value={terminalReferences[student.classBookingId] || ''}
                              onChange={(e) => {
                                setTerminalReferences(prev => ({
                                  ...prev,
                                  [student.classBookingId]: e.target.value
                                }))
                              }}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                fontSize: '11px',
                                border: '1px solid rgba(156, 39, 176, 0.2)',
                                borderRadius: '4px',
                                background: 'white',
                                outline: 'none',
                                marginBottom: '6px'
                              }}
                            />
                            <button
                              onClick={async () => {
                                const reference = terminalReferences[student.classBookingId] || ''
                                const success = await saveStudentPayment(
                                  student.classBookingId,
                                  'CARD',
                                  reference,
                                  student.dueAmount || 0
                                )
                                
                                if (success) {
                                  setStudentCheckIns(prev => ({
                                    ...prev,
                                    [student.classBookingId]: {
                                      ...prev[student.classBookingId],
                                      // PAGO = ASISTENCIA AUTOMÁTICA
                                      attendance: 'PRESENT',
                                      paymentMethod: 'CARD',
                                      paymentAmount: student.dueAmount || 0,
                                      paymentReference: reference
                                    }
                                  }))
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '4px',
                                background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'
                              }}
                            >
                              <CreditCard size={12} />
                              Terminal
                            </button>
                          </div>
                          
                          {/* Transfer */}
                          <div style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'rgba(33, 150, 243, 0.05)',
                            border: '1px solid rgba(33, 150, 243, 0.2)'
                          }}>
                            <input
                              type="text"
                              placeholder="Núm. referencia"
                              value={transferReferences[student.classBookingId] || ''}
                              onChange={(e) => {
                                setTransferReferences(prev => ({
                                  ...prev,
                                  [student.classBookingId]: e.target.value
                                }))
                              }}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                fontSize: '11px',
                                border: '1px solid rgba(33, 150, 243, 0.2)',
                                borderRadius: '4px',
                                background: 'white',
                                outline: 'none',
                                marginBottom: '6px'
                              }}
                            />
                            <button
                              onClick={async () => {
                                const reference = transferReferences[student.classBookingId] || ''
                                const success = await saveStudentPayment(
                                  student.classBookingId,
                                  'TRANSFER',
                                  reference,
                                  student.dueAmount || 0
                                )
                                
                                if (success) {
                                  setStudentCheckIns(prev => ({
                                    ...prev,
                                    [student.classBookingId]: {
                                      ...prev[student.classBookingId],
                                      // PAGO = ASISTENCIA AUTOMÁTICA
                                      attendance: 'PRESENT',
                                      paymentMethod: 'TRANSFER',
                                      paymentAmount: student.dueAmount || 0,
                                      paymentReference: reference
                                    }
                                  }))
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '6px',
                                fontSize: '11px',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '4px',
                                background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)'
                              }}
                            >
                              <Building2 size={12} />
                              Transferencia
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Individual Attendance Controls */}
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  background: 'rgba(33, 150, 243, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(33, 150, 243, 0.2)'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#1976D2',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>Control de Asistencia</span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '500',
                      color: studentCheckIns[student.classBookingId]?.paymentMethod ? '#4CAF50' : '#FF9800'
                    }}>
                      {studentCheckIns[student.classBookingId]?.paymentMethod 
                        ? `✓ Pagó = Presente automático`
                        : '⚠ Sin pago - Marcar asistencia manual'}
                    </span>
                  </div>
                  
                  {studentCheckIns[student.classBookingId]?.paymentMethod && (
                    <div style={{
                      marginBottom: '8px',
                      padding: '6px 8px',
                      background: 'rgba(76, 175, 80, 0.1)',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#2E7D32',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      💡 Pago procesado = Marcado PRESENTE automáticamente
                    </div>
                  )}
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '6px'
                  }}>
                    {(['PRESENT', 'LATE', 'ABSENT'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          setStudentCheckIns(prev => ({
                            ...prev,
                            [student.classBookingId]: {
                              ...prev[student.classBookingId],
                              attendance: status
                            }
                          }))
                        }}
                        style={{
                          padding: '8px 12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: studentCheckIns[student.classBookingId]?.attendance === status 
                            ? status === 'PRESENT' ? '#4CAF50' 
                              : status === 'LATE' ? '#FF9800' 
                              : '#F44336'
                            : 'white',
                          color: studentCheckIns[student.classBookingId]?.attendance === status 
                            ? 'white' 
                            : status === 'PRESENT' ? '#4CAF50' 
                              : status === 'LATE' ? '#FF9800' 
                              : '#F44336',
                          border: studentCheckIns[student.classBookingId]?.attendance === status 
                            ? 'none'
                            : `1px solid ${status === 'PRESENT' ? '#4CAF50' : status === 'LATE' ? '#FF9800' : '#F44336'}`,
                          opacity: studentCheckIns[student.classBookingId]?.paymentMethod && status === 'PRESENT' ? 1 : 
                                   studentCheckIns[student.classBookingId]?.paymentMethod ? 0.7 : 1
                        }}
                      >
                        {status === 'PRESENT' ? 
                          (studentCheckIns[student.classBookingId]?.paymentMethod ? '✓ Presente (Auto)' : '✓ Presente') : 
                         status === 'LATE' ? '⏰ Tardío' : 
                         '✗ Ausente'}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </SettingsCard>
      )}

      {/* Split Payment Details */}
      {booking.splitPaymentEnabled && booking.splitPayments && booking.splitPayments.length > 0 && (
        <SettingsCard
          title="Estado de Pagos Divididos"
          description={`${booking.splitPayments.filter(sp => sp.status === 'completed').length} de ${booking.splitPaymentCount || booking.splitPayments.length} pagos completados`}
          icon={<Users size={20} />}
          style={{ marginTop: '20px' }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {booking.splitPayments.map((splitPayment, index) => (
              <div
                key={splitPayment.id}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  background: splitPayment.status === 'completed' 
                    ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(102, 231, 170, 0.02))'
                    : splitPayment.status === 'processing'
                    ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(3, 169, 244, 0.02))'
                    : 'rgba(0, 0, 0, 0.02)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: splitPayment.status === 'completed' 
                        ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)' 
                        : splitPayment.status === 'processing' 
                        ? 'linear-gradient(135deg, #2196F3, #03A9F4)' 
                        : 'linear-gradient(135deg, #F5F5F5, #E0E0E0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: splitPayment.status === 'completed' || splitPayment.status === 'processing' ? 'white' : '#9E9E9E',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
                    }}>
                      {splitPayment.status === 'completed' ? (
                        <CheckIcon size={16} />
                      ) : splitPayment.status === 'processing' ? (
                        <ClockIcon size={16} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#182A01'
                      }}>
                        {splitPayment.playerName}
                      </div>
                      {splitPayment.playerEmail && (
                        <div style={{
                          fontSize: '11px',
                          color: '#516640'
                        }}>
                          {splitPayment.playerEmail}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#182A01'
                    }}>
                      ${(splitPayment.amount / 100).toFixed(2)} MXN
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: splitPayment.status === 'completed' ? '#A4DF4E' : 
                             splitPayment.status === 'processing' ? '#2196F3' : '#FF9800'
                    }}>
                      {splitPayment.status === 'completed' ? (
                        <>
                          <CheckCircle2 size={12} />
                          Pagado
                        </>
                      ) : splitPayment.status === 'processing' ? (
                        <>
                          <Clock size={12} />
                          Procesando
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} />
                          Pendiente
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Actions for pending payments */}
                {splitPayment.status !== 'completed' && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    {splitPayment.stripePaymentIntentId ? (
                      <button
                        onClick={async () => {
                          await copyPaymentLink(splitPayment.id, splitPayment.playerName)
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: 'none',
                          borderRadius: '8px',
                          background: copiedPaymentIds[splitPayment.id] 
                            ? 'linear-gradient(135deg, #4CAF50, #45a049)'
                            : 'linear-gradient(135deg, #2196F3, #1976D2)',
                          color: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: copiedPaymentIds[splitPayment.id]
                            ? '0 2px 8px rgba(76, 175, 80, 0.3)'
                            : '0 2px 8px rgba(33, 150, 243, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = copiedPaymentIds[splitPayment.id]
                            ? '0 4px 12px rgba(76, 175, 80, 0.4)'
                            : '0 4px 12px rgba(33, 150, 243, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px)'
                          e.currentTarget.style.boxShadow = copiedPaymentIds[splitPayment.id]
                            ? '0 2px 8px rgba(76, 175, 80, 0.3)'
                            : '0 2px 8px rgba(33, 150, 243, 0.3)'
                        }}
                      >
                        {copiedPaymentIds[splitPayment.id] ? (
                          <>
                            <Check size={14} />
                            ¡Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copiar Link de Pago
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          if (confirm(`¿Generar link de pago para ${splitPayment.playerName}?`)) {
                            await generatePaymentIntent(splitPayment.id)
                          }
                        }}
                        disabled={processingPayment === splitPayment.id}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: 'none',
                          borderRadius: '8px',
                          background: processingPayment === splitPayment.id 
                            ? 'linear-gradient(135deg, #E0E0E0, #BDBDBD)' 
                            : 'white',
                          color: processingPayment === splitPayment.id ? '#9E9E9E' : 'black',
                          border: processingPayment === splitPayment.id ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
                          cursor: processingPayment === splitPayment.id ? 'not-allowed' : 'pointer',
                          opacity: processingPayment === splitPayment.id ? 0.5 : 1,
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: processingPayment === splitPayment.id 
                            ? 'none' 
                            : '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                          if (processingPayment !== splitPayment.id) {
                            e.currentTarget.style.transform = 'translateY(-1px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (processingPayment !== splitPayment.id) {
                            e.currentTarget.style.transform = 'translateY(0px)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                      >
                        {processingPayment === splitPayment.id ? (
                          <>
                            <ClockIcon size={14} className="animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <CreditCard size={14} color="black" />
                            Link de Pago
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Payment Methods Dropdown */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Toggle dropdown for this specific split payment
                          const newShowPaymentOptions = { ...showPaymentOptions }
                          newShowPaymentOptions[splitPayment.id] = !newShowPaymentOptions[splitPayment.id]
                          setShowPaymentOptions(newShowPaymentOptions)
                        }}
                        disabled={processingPayment === splitPayment.id}
                        style={{
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: 'none',
                          borderRadius: '8px',
                          background: processingPayment === splitPayment.id 
                            ? 'linear-gradient(135deg, #E0E0E0, #BDBDBD)' 
                            : 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                          color: processingPayment === splitPayment.id ? '#9E9E9E' : 'white',
                          cursor: processingPayment === splitPayment.id ? 'not-allowed' : 'pointer',
                          opacity: processingPayment === splitPayment.id ? 0.5 : 1,
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: processingPayment === splitPayment.id 
                            ? 'none' 
                            : '0 2px 8px rgba(164, 223, 78, 0.3)',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                          if (processingPayment !== splitPayment.id) {
                            e.currentTarget.style.transform = 'translateY(-1px)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(164, 223, 78, 0.4)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (processingPayment !== splitPayment.id) {
                            e.currentTarget.style.transform = 'translateY(0px)'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(164, 223, 78, 0.3)'
                          }
                        }}
                      >
                        {processingPayment === splitPayment.id ? (
                          <>
                            <ClockIcon size={14} className="animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <BanknoteIcon size={14} />
                            Registrar Pago
                            {showPaymentOptions[splitPayment.id] ? (
                              <ChevronUpIcon size={12} />
                            ) : (
                              <ChevronDownIcon size={12} />
                            )}
                          </>
                        )}
                      </button>
                      
                      {/* Payment Options Dropdown */}
                      {showPaymentOptions[splitPayment.id] && (
                        <>
                          {/* Overlay */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              closePaymentOptions(splitPayment.id)
                            }}
                            style={{
                              position: 'fixed',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 9999,
                              background: 'rgba(0, 0, 0, 0.3)'
                            }}
                          />
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10000,
                            padding: '20px',
                            background: 'white',
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            borderRadius: '16px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1)',
                            minWidth: '280px',
                            maxWidth: '320px',
                            backdropFilter: 'blur(20px)'
                          }}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#182A01',
                            marginBottom: '12px',
                            paddingBottom: '8px',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                            textAlign: 'center'
                          }}>
                            Seleccionar Método
                          </div>
                          
                          {/* Close button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              closePaymentOptions(splitPayment.id)
                            }}
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              width: '24px',
                              height: '24px',
                              border: 'none',
                              borderRadius: '50%',
                              background: 'rgba(0, 0, 0, 0.05)',
                              color: '#666',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'
                            }}
                          >
                            <X size={12} />
                          </button>
                          
                          {/* Cash Payment */}
                          <button
                            onClick={async (e) => {
                              e.stopPropagation()
                              setPaymentConfirmation({
                                splitPaymentId: splitPayment.id,
                                playerName: splitPayment.playerName,
                                paymentMethod: 'cash',
                                message: `¿Registrar pago en efectivo de ${splitPayment.playerName}?`
                              })
                            }}
                            style={{
                              width: '100%',
                              padding: '12px',
                              fontSize: '13px',
                              fontWeight: '600',
                              border: 'none',
                              borderRadius: '8px',
                              background: 'rgba(76, 175, 80, 0.08)',
                              color: '#182A01',
                              cursor: 'pointer',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              marginBottom: '8px',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(76, 175, 80, 0.15)'
                              e.currentTarget.style.transform = 'scale(1.02)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(76, 175, 80, 0.08)'
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                          >
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '6px',
                              background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <BanknoteIcon size={14} color="white" />
                            </div>
                            Efectivo
                          </button>
                          
                          {/* Transfer Payment */}
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{
                              padding: '12px',
                              borderRadius: '8px',
                              background: 'rgba(33, 150, 243, 0.08)',
                              marginBottom: '8px'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '8px'
                              }}>
                                <div style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '6px',
                                  background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <Smartphone size={14} color="white" />
                                </div>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: '#182A01'
                                }}>
                                  Transferencia
                                </span>
                              </div>
                              <input
                                type="text"
                                placeholder="Número de referencia"
                                value={transferReferences[splitPayment.id] || ''}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  const newReferences = { ...transferReferences }
                                  newReferences[splitPayment.id] = e.target.value
                                  setTransferReferences(newReferences)
                                }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: '12px',
                                  border: '1px solid rgba(33, 150, 243, 0.2)',
                                  borderRadius: '6px',
                                  background: 'white',
                                  outline: 'none',
                                  transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#2196F3'
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(33, 150, 243, 0.1)'
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = 'rgba(33, 150, 243, 0.2)'
                                  e.currentTarget.style.boxShadow = 'none'
                                }}
                              />
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  const reference = transferReferences[splitPayment.id] || ''
                                  if (!reference.trim()) {
                                    notify.warning({
                                      title: 'Referencia requerida',
                                      message: 'Por favor ingresa el número de referencia de la transferencia',
                                      duration: 4000
                                    })
                                    return
                                  }
                                  setPaymentConfirmation({
                                    splitPaymentId: splitPayment.id,
                                    playerName: splitPayment.playerName,
                                    paymentMethod: 'transfer',
                                    referenceNumber: reference,
                                    message: `¿Registrar transferencia de ${splitPayment.playerName}?\nReferencia: ${reference}`
                                  })
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  border: 'none',
                                  borderRadius: '6px',
                                  background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                                  color: 'white',
                                  cursor: 'pointer',
                                  marginTop: '8px',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.02)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)'
                                }}
                              >
                                Registrar Transferencia
                              </button>
                            </div>
                          </div>
                          
                          {/* Terminal Payment */}
                          <div>
                            <div style={{
                              padding: '12px',
                              borderRadius: '8px',
                              background: 'rgba(156, 39, 176, 0.08)'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '8px'
                              }}>
                                <div style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '6px',
                                  background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <CreditCard size={14} color="white" />
                                </div>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: '#182A01'
                                }}>
                                  Terminal
                                </span>
                              </div>
                              <input
                                type="text"
                                placeholder="Número de autorización"
                                value={terminalReferences[splitPayment.id] || ''}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  const newReferences = { ...terminalReferences }
                                  newReferences[splitPayment.id] = e.target.value
                                  setTerminalReferences(newReferences)
                                }}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: '12px',
                                  border: '1px solid rgba(156, 39, 176, 0.2)',
                                  borderRadius: '6px',
                                  background: 'white',
                                  outline: 'none',
                                  transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#9C27B0'
                                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(156, 39, 176, 0.1)'
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = 'rgba(156, 39, 176, 0.2)'
                                  e.currentTarget.style.boxShadow = 'none'
                                }}
                              />
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  const reference = terminalReferences[splitPayment.id] || ''
                                  
                                  if (!reference.trim()) {
                                    notify.error({
                                      title: 'Número requerido',
                                      message: 'Por favor ingresa un número de autorización',
                                      duration: 4000
                                    })
                                    return
                                  }
                                  
                                  setPaymentConfirmation({
                                    splitPaymentId: splitPayment.id,
                                    playerName: splitPayment.playerName,
                                    paymentMethod: 'terminal',
                                    referenceNumber: reference,
                                    message: `¿Registrar pago con terminal de ${splitPayment.playerName}?\nReferencia: ${reference}`
                                  })
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  border: 'none',
                                  borderRadius: '6px',
                                  background: 'linear-gradient(135deg, #9C27B0, #7B1FA2)',
                                  color: 'white',
                                  cursor: 'pointer',
                                  marginTop: '8px',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.02)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)'
                                }}
                              >
                                Registrar Terminal
                              </button>
                            </div>
                          </div>
                        </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Warning if missing split payments */}
            {booking.splitPaymentCount && booking.splitPayments.length < booking.splitPaymentCount && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.05), rgba(244, 67, 54, 0.02))',
                border: '1px dashed rgba(255, 87, 34, 0.3)',
                fontSize: '13px',
                color: '#182A01'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  ⚠️ Faltan {booking.splitPaymentCount - booking.splitPayments.length} pagos por crear
                </div>
                <div style={{ fontSize: '12px', color: '#516640' }}>
                  Solo se han creado {booking.splitPayments.length} de {booking.splitPaymentCount} pagos divididos configurados.
                </div>
              </div>
            )}
          </div>
        </SettingsCard>
      )}

      {/* Payment Section (if not paid) */}
      {!isPaid && step === 'payment' && !booking.splitPaymentEnabled && (
        <SettingsCard
          title="Registrar Pago en Sitio"
          description="Selecciona el método de pago utilizado"
          icon={<CreditCard size={20} />}
          style={{ marginTop: '20px' }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {/* Cash Payment */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              background: paymentMethod === 'cash' 
                ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(102, 231, 170, 0.02))'
                : 'white',
              border: `2px solid ${paymentMethod === 'cash' ? '#A4DF4E' : 'rgba(0, 0, 0, 0.12)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={() => setPaymentMethod('cash')}
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
                marginRight: '16px'
              }}>
                <DollarSign size={20} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#182A01',
                  marginBottom: '4px'
                }}>
                  Efectivo
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#516640'
                }}>
                  Pago en efectivo en recepción
                </div>
              </div>
            </label>

            {/* Terminal Payment */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              background: paymentMethod === 'terminal' 
                ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(102, 231, 170, 0.02))'
                : 'white',
              border: `2px solid ${paymentMethod === 'terminal' ? '#A4DF4E' : 'rgba(0, 0, 0, 0.12)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                name="paymentMethod"
                value="terminal"
                checked={paymentMethod === 'terminal'}
                onChange={() => setPaymentMethod('terminal')}
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
                marginRight: '16px'
              }}>
                <CreditCard size={20} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#182A01',
                  marginBottom: '4px'
                }}>
                  Terminal de Tarjeta
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#516640'
                }}>
                  Pago con tarjeta en terminal física
                </div>
              </div>
            </label>

            {/* Transfer Payment */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              background: paymentMethod === 'transfer' 
                ? 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(102, 231, 170, 0.02))'
                : 'white',
              border: `2px solid ${paymentMethod === 'transfer' ? '#A4DF4E' : 'rgba(0, 0, 0, 0.12)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                name="paymentMethod"
                value="transfer"
                checked={paymentMethod === 'transfer'}
                onChange={() => setPaymentMethod('transfer')}
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
                marginRight: '16px'
              }}>
                <Smartphone size={20} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#182A01',
                  marginBottom: '4px'
                }}>
                  Transferencia Bancaria
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#516640'
                }}>
                  Transferencia o depósito bancario
                </div>
              </div>
            </label>

            {/* Reference Number */}
            {(paymentMethod === 'terminal' || paymentMethod === 'transfer') && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: 'rgba(164, 223, 78, 0.05)',
                borderRadius: '8px'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#516640',
                  marginBottom: '8px'
                }}>
                  Número de referencia (opcional)
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder={paymentMethod === 'terminal' ? 'Folio de terminal' : 'Número de operación'}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid rgba(164, 223, 78, 0.3)',
                    borderRadius: '8px',
                    background: 'white',
                    outline: 'none'
                  }}
                />
              </div>
            )}

            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.05))',
              borderRadius: '8px',
              border: '1px solid rgba(164, 223, 78, 0.2)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#516640'
                }}>
                  Total a cobrar:
                </span>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#182A01'
                }}>
                  ${((booking.price || 0) / 100).toFixed(2)} MXN
                </span>
              </div>
            </div>

            {/* Payment Link Section */}
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: 'rgba(33, 150, 243, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(33, 150, 243, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Smartphone size={16} color="white" />
                  </div>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#182A01'
                    }}>
                      Link de Pago Digital
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#516640'
                    }}>
                      Envía el link para que el cliente pague online
                    </div>
                  </div>
                </div>
              </div>

              {regularPaymentLink && (
                <>
                  <button
                    onClick={copyRegularPaymentLink}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      border: 'none',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    <Copy size={16} />
                    Copiar Link de Pago
                  </button>
                  
                  {hasExistingPaymentIntent && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.1), rgba(52, 199, 89, 0.05))',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#34C759',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#34C759'
                      }} />
                      Intento de pago activo
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </SettingsCard>
      )}


      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
        justifyContent: 'flex-end'
      }}>
        <AppleButton
          variant="secondary"
          onClick={onClose}
          disabled={loading}
          style={{
            background: 'white',
            color: '#182A01',
            border: '1px solid #182A01'
          }}
        >
          Cancelar
        </AppleButton>
        
        {(() => {
          // For classes with students, show summary button
          if (isClassWithStudents && booking.students) {
            const studentsWithPayment = booking.students.filter(student => 
              studentCheckIns[student.classBookingId]?.paymentMethod
            ).length
            
            const totalStudents = booking.students.length
            
            return (
              <AppleButton
                variant="primary"
                onClick={handleCheckIn}
                disabled={loading}
                icon={loading ? undefined : <Check size={16} />}
                style={{
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  color: '#182A01',
                  border: 'none'
                }}
              >
                {loading ? 'Procesando...' : 
                 `Confirmar Check-in (${studentsWithPayment} presentes, ${totalStudents - studentsWithPayment} ausentes)`}
              </AppleButton>
            )
          }
          
          // Determinar el estado del botón basado en el tipo de pago
          const hasSplitPayments = booking.splitPaymentEnabled && booking.splitPayments && booking.splitPayments.length > 0
          const hasSplitPaymentsEnabled = booking.splitPaymentEnabled && booking.splitPaymentCount > 0 // Condición más simple
          const allPaid = hasSplitPayments 
            ? booking.splitPayments.every(sp => sp.status === 'completed')
            : isPaid
          const somePaymentsPending = hasSplitPayments 
            ? booking.splitPayments.some(sp => sp.status !== 'completed')
            : !isPaid
          
          // Botón de gestionar pagos divididos - DESHABILITADO por solicitud del usuario
          /*
          if (hasSplitPaymentsEnabled && (!hasSplitPayments || somePaymentsPending)) {
            // Para pagos divididos con pagos pendientes o sin datos cargados
            const completedCount = booking.splitPayments?.filter(sp => sp.status === 'completed').length || 0
            const totalCount = booking.splitPaymentCount || booking.splitPayments?.length || 0
            
            return (
              <AppleButton
                variant="primary"
                onClick={() => setSplitPaymentView(true)}
                disabled={loading}
                icon={<Users size={16} />}
                style={{
                  background: 'linear-gradient(135deg, #2196F3, #03A9F4)',
                  color: 'white',
                  border: 'none'
                }}
              >
                Gestionar Pagos Divididos ({completedCount}/{totalCount})
              </AppleButton>
            )
          }
          */
          
          if (!isPaid && step === 'payment' && !booking.splitPaymentEnabled) {
            return (
              <AppleButton
                variant="primary"
                onClick={() => setStep('checkin')}
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  color: '#182A01',
                  border: 'none'
                }}
              >
                Continuar al Check-in
              </AppleButton>
            )
          }
          
          return (
            <AppleButton
              variant="primary"
              onClick={allPaid ? handleCheckIn : handlePaymentAndCheckIn}
              disabled={loading || (hasSplitPayments && somePaymentsPending)}
              icon={loading ? undefined : <Check size={16} />}
              style={{
                background: allPaid 
                  ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)'
                  : 'linear-gradient(135deg, rgba(164, 223, 78, 0.7), rgba(102, 231, 170, 0.7))',
                color: '#182A01',
                border: 'none'
              }}
            >
              {loading ? 'Procesando...' : 
               allPaid ? 'Confirmar Check-in' : 'Registrar Pago y Check-in'}
            </AppleButton>
          )
        })()}
      </div>
        </>
      )}
    </AppleModal>

      {/* Payment Confirmation Modal */}
      {paymentConfirmation && (
        <AppleModal
          isOpen={true}
          onClose={() => setPaymentConfirmation(null)}
          title="Confirmar Pago"
          size="small"
        >
          <div style={{ padding: '20px' }}>
            <div style={{ 
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <AlertCircle 
                size={48} 
                style={{ 
                  color: '#FF9500',
                  marginBottom: '16px'
                }} 
              />
              <p style={{
                fontSize: '16px',
                color: 'rgba(0, 0, 0, 0.8)',
                margin: 0,
                lineHeight: '1.5',
                whiteSpace: 'pre-line'
              }}>
                {paymentConfirmation.message}
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setPaymentConfirmation(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '12px',
                  background: 'white',
                  color: 'rgba(0, 0, 0, 0.8)',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={async () => {
                  await markAsCompleted(
                    paymentConfirmation.splitPaymentId,
                    paymentConfirmation.playerName,
                    paymentConfirmation.paymentMethod,
                    paymentConfirmation.referenceNumber
                  )
                  setPaymentConfirmation(null)
                }}
                disabled={processingPayment === paymentConfirmation.splitPaymentId}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '12px',
                  background: processingPayment === paymentConfirmation.splitPaymentId 
                    ? 'rgba(76, 175, 80, 0.5)' 
                    : 'linear-gradient(135deg, #4CAF50, #45a049)',
                  color: 'white',
                  cursor: processingPayment === paymentConfirmation.splitPaymentId ? 'not-allowed' : 'pointer'
                }}
              >
                {processingPayment === paymentConfirmation.splitPaymentId ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </AppleModal>
      )}

      {/* Split Payment Manager Modal */}
      {showSplitPaymentModal && booking && (
        <SplitPaymentManager
          bookingId={booking.id}
          onClose={() => {
            setShowSplitPaymentModal(false)
            // Refresh booking data
            if (onRefreshBooking) {
              onRefreshBooking()
            }
          }}
        />
      )}
    </>
  )
}

// Add keyframes for animations
const animations = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0% { 
      box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.7);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 0 6px rgba(255, 152, 0, 0);
      transform: scale(1.02);
    }
    100% { 
      box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
      transform: scale(1);
    }
  }
`

// Inject the animations into the document
if (typeof window !== 'undefined' && !document.querySelector('#checkin-modal-animations')) {
  const style = document.createElement('style')
  style.id = 'checkin-modal-animations'
  style.textContent = animations
  document.head.appendChild(style)
}