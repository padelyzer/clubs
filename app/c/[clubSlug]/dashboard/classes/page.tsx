'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useNotify } from '@/contexts/NotificationContext'
// import { DashboardWithNotifications } from '@/components/layouts/DashboardWithNotifications'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { 
  BookOpen, Plus, Users, Calendar, Clock, MapPin, User,
  DollarSign, Filter, Edit, Trash2, ChevronLeft, ChevronRight,
  Star, Award, X, Loader2, CheckCircle, AlertCircle, UserPlus,
  BarChart, TrendingUp, Target, GraduationCap, Check, Download
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'

type Instructor = {
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

type Class = {
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
  court?: {/* id: string; name: string */}
  maxStudents: number
  currentStudents: number
  price: number
  availableSpots?: number
  enrolledStudents?: number
  revenue?: number
  bookings?: any[]
}

type Player = {
  id: string
  name: string
  phone: string
  email?: string
}

const classTypes = {
  GROUP: 'Grupal',
  PRIVATE: 'Individual',
  SEMI_PRIVATE: 'Semi-privado'
}

const classLevels = {
  BEGINNER: {/* label: 'Principiante', color: '#16a34a' */},
  INTERMEDIATE: {/* label: 'Intermedio', color: '#eab308' */},
  ADVANCED: {/* label: 'Avanzado', color: '#dc2626' */},
  ALL_LEVELS: {/* label: 'Todos los niveles', color: '#8b5cf6' */}
}

const classStatuses = {
  SCHEDULED: {/* label: 'Programada', color: '#3b82f6' */},
  IN_PROGRESS: {/* label: 'En Progreso', color: '#eab308' */},
  COMPLETED: {/* label: 'Completada', color: '#16a34a' */},
  CANCELLED: {/* label: 'Cancelada', color: '#ef4444' */}
}

function ClassesContent() {
  const router = useRouter()
  const params = useParams()
  const clubSlug = params.clubSlug as string
  const notify = useNotify()
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState<Class[]>([])
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [courts, setCourts] = useState<any[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'reports'>('calendar')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedInstructor, setSelectedInstructor] = useState('all')
  const [isCreatingClass, setIsCreatingClass] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [classPricing, setClassPricing] = useState<any>(null)
  const [showEnrollment, setShowEnrollment] = useState(false)
  const [showAttendance, setShowAttendance] = useState(false)
  const [attendanceList, setAttendanceList] = useState<any[]>([])
  const [attendanceStats, setAttendanceStats] = useState<any>(null)
  const [reportData, setReportData] = useState<any>(null)
  const [reportPeriod, setReportPeriod] = useState('month')
  const [reportInstructor, setReportInstructor] = useState('all')
  const [showReschedule, setShowReschedule] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    courtId: '',
    notifyStudents: true,
    reason: ''
  })
  const [cancelForm, setCancelForm] = useState({
    reason: '',
    notifyStudents: true,
    refundStudents: false
  })
  const [availabilityCheck, setAvailabilityCheck] = useState<{
    loading: boolean
    available: boolean | null
    message: string
    conflicts: any[]
    alternatives: any[]
  }>({
    loading: false,
    available: null,
    message: '',
    conflicts: [],
    alternatives: []
  })
  
  // Class form
  const [classForm, setClassForm] = useState({
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
    // Recurrence fields
    isRecurring: false,
    recurrencePattern: {
      frequency: 'WEEKLY',
      interval: 1,
      occurrences: 12,
      endDate: null
    }
  })


  // Enrollment form
  const [enrollmentForm, setEnrollmentForm] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    playerId: '',
    notes: '',
    paymentMethod: 'online', // 'online' or 'onsite'
    splitPayment: false,
    splitCount: 1,
    sendNotification: true
  })

  useEffect(() => {
    fetchInstructors()
    fetchCourts()
    fetchPlayers()
    fetchClasses()
    fetchClassPricing()
  }, [selectedDate, selectedLevel, selectedInstructor])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('date', selectedDate.toISOString().split('T')[0])
      
      if (selectedLevel !== 'all') {
        params.append('level', selectedLevel)
      }
      
      if (selectedInstructor !== 'all') {
        params.append('instructorId', selectedInstructor)
      }
      
      const response = await fetch(`/api/classes?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setClasses(data.classes || [])
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchInstructors = async () => {
    try {
      const response = await fetch('/api/instructors?active=true')
      const data = await response.json()
      if (data.success) {
        setInstructors(data.instructors || [])
      }
    } catch (error) {
      console.error('Error fetching instructors:', error)
      setInstructors([])
    }
  }

  const fetchCourts = async () => {
    try {
      const response = await fetch('/api/settings/courts')
      const data = await response.json()
      if (data.success) {
        setCourts(data.courts.filter((c: any) => c.active))
      }
    } catch (error) {
      console.error('Error fetching courts:', error)
    }
  }

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players')
      const data = await response.json()
      if (data.success) {
        setPlayers(data.players || [])
      }
    } catch (error) {
      console.error('Error fetching players:', error)
      setPlayers([])
    }
  }

  const fetchClassPricing = async () => {
    try {
      const response = await fetch('/api/settings/class-pricing')
      const data = await response.json()
      if (data.success && data.pricing) {
        setClassPricing(data.pricing)
      }
    } catch (error) {
      console.error('Error fetching class pricing:', error)
    }
  }

  const fetchClassBookings = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/bookings`)
      const data = await response.json()
      
      if (data.success) {
        const classData = classes.find(c => c.id === classId)
        if (classData) {
          setSelectedClass({
            ...classData,
            bookings: data.bookings
          })
        }
      }
    } catch (error) {
      console.error('Error fetching class bookings:', error)
    }
  }

  // Helper function to calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, duration: number): string => {
    if (!startTime) return ''
    
    const [hours, minutes] = startTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + duration
    
    const endHours = Math.floor(totalMinutes / 60) % 24
    const endMinutes = totalMinutes % 60
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  }

  const checkAvailability = async () => {
    if (!classForm.courtId || !classForm.date || !classForm.startTime || !classForm.endTime) {
      return
    }
    
    setAvailabilityCheck(prev => ({ ...prev, loading: true }))
    
    try {
      const response = await fetch('/api/bookings/availability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: classForm.courtId,
          date: classForm.date,
          startTime: classForm.startTime,
          endTime: classForm.endTime,
          excludeClassId: editingClass?.id
        })
      })
      
      const data = await response.json()
      
      setAvailabilityCheck({
        loading: false,
        available: data.available,
        message: data.message,
        conflicts: data.conflicts || [],
        alternatives: data.alternativeSlots || []
      })
    } catch (error) {
      console.error('Error checking availability:', error)
      setAvailabilityCheck({
        loading: false,
        available: null,
        message: 'Error al verificar disponibilidad',
        conflicts: [],
        alternatives: []
      })
    }
  }
  
  // Auto-check availability when date/time/court changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (classForm.courtId && classForm.date && classForm.startTime && classForm.endTime) {
        checkAvailability()
      }
    }, 500) // Debounce for 500ms
    
    return () => clearTimeout(timer)
  }, [classForm.courtId, classForm.date, classForm.startTime, classForm.endTime])

  const handleCreateClass = async () => {
    try {
      // Check availability first if not recurring
      if (!classForm.isRecurring && availabilityCheck.available === false) {
        const confirm = window.confirm(
          'El horario seleccionado no está disponible. ¿Deseas continuar de todos modos?'
        )
        if (!confirm) return
      }
      
      // Prepare data with recurrence if enabled
      const classData = {
        ...classForm,
        isRecurring: classForm.isRecurring,
        recurrencePattern: classForm.isRecurring ? classForm.recurrencePattern : null
      }
      
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchClasses()
        setIsCreatingClass(false)
        resetClassForm()
        setAvailabilityCheck({
          loading: false,
          available: null,
          message: '',
          conflicts: [],
          alternatives: []
        })
        // Show success message if we have notifications
        if (data.message) {
          console.log(data.message)
          if (data.unavailableDates && data.unavailableDates.length > 0) {
            notify.warning({
              title: 'Clases creadas parcialmente',
              message: `${data.message}. Fechas no disponibles: ${data.unavailableDates.join(', ')}`
            })
          }
        }
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'Error al crear clase'
        })
      }
    } catch (error) {
      console.error('Error creating class:', error)
      notify.error({
        title: 'Error',
        message: 'Error al crear clase'
      })
    }
  }

  const handleUpdateClass = async () => {
    if (!editingClass) return
    
    try {
      const response = await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingClass.id,
          ...classForm
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchClasses()
        setEditingClass(null)
        resetClassForm()
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'Error al actualizar clase'
        })
      }
    } catch (error) {
      console.error('Error updating class:', error)
    }
  }

  const handleRescheduleClass = async () => {
    if (!selectedClass) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/classes/${selectedClass.id}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rescheduleForm)
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchClasses()
        setShowReschedule(false)
        setSelectedClass(null)
        setRescheduleForm({
          date: '',
          startTime: '',
          endTime: '',
          courtId: '',
          notifyStudents: true,
          reason: ''
        })
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'Error al reprogramar clase'
        })
      }
    } catch (error) {
      console.error('Error rescheduling class:', error)
      notify.error({
        title: 'Error',
        message: 'Error al reprogramar clase'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelClass = async () => {
    if (!selectedClass) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/classes/${selectedClass.id}/reschedule`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelForm)
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchClasses()
        setShowCancel(false)
        setSelectedClass(null)
        setCancelForm({
          reason: '',
          notifyStudents: true,
          refundStudents: false
        })
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'Error al cancelar clase'
        })
      }
    } catch (error) {
      console.error('Error cancelling class:', error)
      notify.error({
        title: 'Error',
        message: 'Error al cancelar clase'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta clase?')) return
    
    try {
      const response = await fetch(`/api/classes?id=${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchClasses()
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'Error al eliminar clase'
        })
      }
    } catch (error) {
      console.error('Error deleting class:', error)
    }
  }


  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        period: reportPeriod,
        ...(reportInstructor !== 'all' && {/* instructorId: reportInstructor */})
      })
      
      const response = await fetch(`/api/classes/reports?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setReportData(data)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'csv' | 'pdf') => {
    try {
      const params = {
        period: reportPeriod,
        format,
        ...(reportInstructor !== 'all' && {/* instructorId: reportInstructor */})
      }
      
      const response = await fetch('/api/classes/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      
      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte-clases-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const fetchAttendance = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/attendance`)
      const data = await response.json()
      
      if (data.success) {
        setAttendanceList(data.attendance)
        setAttendanceStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const handleCheckIn = async (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    if (!selectedClass) return
    
    try {
      const response = await fetch(`/api/classes/${selectedClass.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          status
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update local attendance list
        setAttendanceList(prev => prev.map(student => 
          student.id === studentId 
            ? { ...student, attendanceStatus: status, attended: status !== 'ABSENT' }
            : student
        ))
        
        // Update stats if provided
        if (data.attendanceStats) {
          setAttendanceStats(data.attendanceStats)
        }
      }
    } catch (error) {
      console.error('Error updating attendance:', error)
    }
  }

  const handleCancelEnrollment = async (classId: string, bookingId: string, studentName: string) => {
    if (!confirm(`¿Está seguro de cancelar la inscripción de ${studentName}?`)) return
    
    try {
      const response = await fetch(`/api/classes/${classId}/bookings/${bookingId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        notify.success({
          title: 'Inscripción cancelada',
          message: `Se canceló la inscripción de ${studentName}`,
          duration: 4000
        })
        // Refresh classes
        fetchClasses()
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'No se pudo cancelar la inscripción',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error cancelling enrollment:', error)
      notify.error({
        title: 'Error',
        message: 'Error al cancelar la inscripción',
        duration: 5000
      })
    }
  }

  const handleEnrollStudent = async () => {
    if (!selectedClass) return
    
    try {
      const response = await fetch(`/api/classes/${selectedClass.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: enrollmentForm.studentName,
          studentEmail: enrollmentForm.studentEmail,
          studentPhone: enrollmentForm.studentPhone,
          paymentMethod: enrollmentForm.paymentMethod,
          splitPayment: enrollmentForm.splitPayment,
          splitCount: enrollmentForm.splitCount
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchClasses()
        await fetchClassBookings(selectedClass.id)
        setShowEnrollment(false)
        resetEnrollmentForm()
        
        // Show success message with payment info
        if (data.payment?.paymentLink) {
          notify.success({
            title: 'Inscripción exitosa',
            message: 'Link de pago enviado por WhatsApp'
          })
        } else if (data.payment?.splitPayments) {
          notify.success({
            title: 'Inscripción exitosa',
            message: `Se enviaron ${data.payment.splitCount} links de pago por WhatsApp`
          })
        } else {
          notify.success({
            title: 'Éxito',
            message: data.message || 'Inscripción exitosa'
          })
        }
      } else {
        notify.error({
          title: 'Error',
          message: data.error || 'Error al inscribir estudiante'
        })
      }
    } catch (error) {
      console.error('Error enrolling student:', error)
      notify.error({
        title: 'Error',
        message: 'Error al inscribir estudiante'
      })
    }
  }

  const resetClassForm = () => {
    setClassForm({
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
        endDate: null
      }
    })
  }


  const resetEnrollmentForm = () => {
    setEnrollmentForm({
      studentName: '',
      studentEmail: '',
      studentPhone: '',
      playerId: '',
      notes: '',
      paymentMethod: 'online',
      splitPayment: false,
      splitCount: 1,
      sendNotification: true
    })
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
  }

  const getClassesByTime = () => {
    const timeSlots: { [key: string]: Class[] } = {}
    
    classes.forEach(classItem => {
      if (!timeSlots[classItem.startTime]) {
        timeSlots[classItem.startTime] = []
      }
      timeSlots[classItem.startTime].push(classItem)
    })
    
    return Object.entries(timeSlots).sort(([a], [b]) => a.localeCompare(b))
  }

  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#182A01',
                margin: '0 0 8px 0',
                letterSpacing: '-0.02em'
              }}>
                Clases
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#516640',
                fontWeight: 400,
                margin: 0
              }}>
                Gestiona las clases y programas de entrenamiento
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <ButtonModern 
                variant="secondary"
                icon={<DollarSign size={18} />}
                onClick={() => router.push(`/c/${clubSlug}/dashboard/settings/class-pricing`)}
              >
                Precios
              </ButtonModern>
              <button
                onClick={() => {
                  resetClassForm()
                  setClassForm(prev => ({
                    ...prev,
                    date: selectedDate.toISOString().split('T')[0]
                  }))
                  setIsCreatingClass(true)
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#182A01',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(164, 223, 78, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(164, 223, 78, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(164, 223, 78, 0.3)'
                }}
              >
                <Plus size={18} />
                Nueva Clase
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
          <CardModern variant="glass">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <BookOpen size={20} color="#182A01" />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01', marginBottom: '4px' }}>
                {classes.filter(c => c.status === 'SCHEDULED' || c.status === 'scheduled').length}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Clases hoy
              </div>
            </div>
          </CardModern>

          <CardModern variant="glass">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={20} color="#182A01" />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01', marginBottom: '4px' }}>
                {classes.reduce((sum, c) => sum + (c.currentStudents || 0), 0)}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Estudiantes inscritos
              </div>
            </div>
          </CardModern>

          <CardModern variant="glass">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <GraduationCap size={20} color="#182A01" />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01', marginBottom: '4px' }}>
                {instructors.filter(i => i.active).length}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Instructores activos
              </div>
            </div>
          </CardModern>

          <CardModern variant="glass">
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DollarSign size={20} color="#182A01" />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01', marginBottom: '4px' }}>
                {formatCurrency(classes.reduce((sum, c) => sum + ((c.revenue || c.price * c.currentStudents) || 0), 0) / 100)}
              </div>
              <div style={{ fontSize: '13px', color: '#516640' }}>
                Ingresos del día
              </div>
            </div>
          </CardModern>
        </div>

        {/* Controls Bar */}
        <CardModern variant="glass" style={{ marginBottom: '24px' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Date Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => navigateDate('prev')}
                  style={{
                    padding: '8px',
                    background: 'white',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={20} color="#516640" />
                </button>
                
                <div style={{ minWidth: '200px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#182A01' }}>
                    {selectedDate.toLocaleDateString('es-MX', { 
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                
                <button
                  onClick={() => navigateDate('next')}
                  style={{
                    padding: '8px',
                    background: 'white',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight size={20} color="#516640" />
                </button>
                
                <button
                  onClick={() => setSelectedDate(new Date())}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Hoy
                </button>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">Todos los niveles</option>
                  {Object.entries(classLevels).map(([key, value]) => (
                    <option key={key} value={key}>{value.label}</option>
                  ))}
                </select>
                
                <select
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">Todos los instructores</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                  ))}
                </select>
                
                <div style={{ display: 'flex', background: 'white', borderRadius: '8px', border: '1px solid rgba(164, 223, 78, 0.2)' }}>
                  <button
                    onClick={() => setViewMode('calendar')}
                    style={{
                      padding: '8px 16px',
                      background: viewMode === 'calendar' ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: viewMode === 'calendar' ? '#182A01' : '#516640',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Calendario
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      padding: '8px 16px',
                      background: viewMode === 'list' ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: viewMode === 'list' ? '#182A01' : '#516640',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Lista
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('reports')
                      fetchReports()
                    }}
                    style={{
                      padding: '8px 16px',
                      background: viewMode === 'reports' ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: viewMode === 'reports' ? '#182A01' : '#516640',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Reportes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardModern>

        {/* Classes View */}
        {loading ? (
          <div style={{/* display: 'flex', justifyContent: 'center', padding: '80px' */}}>
            <Loader2 size={32} className="animate-spin" color="#66E7AA" />
          </div>
        ) : viewMode === 'calendar' ? (
          <CardModern variant="glass">
            <CardModernContent>
              {classes.length === 0 ? (
                <div style={{/* padding: '60px', textAlign: 'center', color: '#516640' */}}>
                  No hay clases programadas para esta fecha
                </div>
              ) : (
                <div style={{/* padding: '20px' */}}>
                  {getClassesByTime().map(([time, timeClasses]) => (
                    <div key={time} style={{/* marginBottom: '24px' */}}>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: 600, 
                        color: '#516640', 
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <Clock size={16} />
                        {time}
                      </div>
                      <div style={{/* display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' */}}>
                        {timeClasses.map(classItem => (
                          <CardModern
                            key={classItem.id}
                            variant="glass"
                            interactive
                            onClick={() => {
                              fetchClassBookings(classItem.id)
                              setSelectedClass(classItem)
                            }}
                          >
                            <div style={{/* padding: '16px' */}}>
                              <div style={{/* display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' */}}>
                                <div>
                                  <h4 style={{/* fontSize: '16px', fontWeight: 600, color: '#182A01', margin: '0 0 4px 0' */}}>
                                    {classItem.name}
                                  </h4>
                                  <p style={{/* fontSize: '12px', color: '#516640', margin: 0 */}}>
                                    {classItem.instructor?.name}
                                  </p>
                                </div>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  background: `${classLevels[classItem.level as keyof typeof classLevels]?.color}15`,
                                  color: classLevels[classItem.level as keyof typeof classLevels]?.color
                                }}>
                                  {classLevels[classItem.level as keyof typeof classLevels]?.label}
                                </span>
                              </div>
                              
                              <div style={{/* display: 'flex', flexDirection: 'column', gap: '6px' */}}>
                                <div style={{/* display: 'flex', alignItems: 'center', gap: '6px' */}}>
                                  <Clock size={12} color="#516640" />
                                  <span style={{/* fontSize: '12px', color: '#516640' */}}>
                                    {classItem.startTime} - {classItem.endTime} ({classItem.duration} min)
                                  </span>
                                </div>
                                {classItem.court && (
                                  <div style={{/* display: 'flex', alignItems: 'center', gap: '6px' */}}>
                                    <MapPin size={12} color="#516640" />
                                    <span style={{/* fontSize: '12px', color: '#516640' */}}>
                                      {classItem.court.name}
                                    </span>
                                  </div>
                                )}
                                <div style={{/* display: 'flex', alignItems: 'center', gap: '6px' */}}>
                                  <Users size={12} color="#516640" />
                                  <span style={{/* fontSize: '12px', color: '#516640' */}}>
                                    {classItem.currentStudents} / {classItem.maxStudents} estudiantes
                                  </span>
                                </div>
                                <div style={{/* display: 'flex', alignItems: 'center', gap: '6px' */}}>
                                  <DollarSign size={12} color="#516640" />
                                  <span style={{/* fontSize: '12px', fontWeight: 600, color: '#182A01' */}}>
                                    {classItem.price > 0 ? formatCurrency(classItem.price / 100) : 'Gratis'}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              <div style={{/* marginTop: '12px' */}}>
                                <div style={{/* display: 'flex', justifyContent: 'space-between', marginBottom: '4px' */}}>
                                  <span style={{/* fontSize: '11px', color: '#516640' */}}>Ocupación</span>
                                  <span style={{/* fontSize: '11px', color: '#516640' */}}>
                                    {Math.round((classItem.currentStudents / classItem.maxStudents) * 100)}%
                                  </span>
                                </div>
                                <div style={{
                                  height: '4px',
                                  background: 'rgba(164, 223, 78, 0.1)',
                                  borderRadius: '2px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    height: '100%',
                                    width: `${(classItem.currentStudents / classItem.maxStudents) * 100}%`,
                                    background: 'linear-gradient(90deg, #A4DF4E, #66E7AA)',
                                    borderRadius: '2px',
                                    transition: 'width 0.3s'
                                  }} />
                                </div>
                              </div>
                            </div>
                          </CardModern>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardModernContent>
          </CardModern>
        ) : (
          <CardModern variant="glass">
            <CardModernContent>
              <div style={{/* overflowX: 'auto' */}}>
                <table style={{/* width: '100%', borderCollapse: 'collapse' */}}>
                  <thead>
                    <tr style={{/* borderBottom: '1px solid rgba(164, 223, 78, 0.1)' */}}>
                      <th style={{/* padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640' */}}>
                        CLASE
                      </th>
                      <th style={{/* padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640' */}}>
                        INSTRUCTOR
                      </th>
                      <th style={{/* padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640' */}}>
                        HORARIO
                      </th>
                      <th style={{/* padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640' */}}>
                        NIVEL
                      </th>
                      <th style={{/* padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640' */}}>
                        ESTUDIANTES
                      </th>
                      <th style={{/* padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640' */}}>
                        PRECIO
                      </th>
                      <th style={{/* padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640' */}}>
                        ESTADO
                      </th>
                      <th style={{/* padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#516640' */}}>
                        ACCIONES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((classItem) => (
                      <tr 
                        key={classItem.id} 
                        style={{ 
                          borderBottom: '1px solid rgba(164, 223, 78, 0.05)',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        onClick={() => {
                          fetchClassBookings(classItem.id)
                          setSelectedClass(classItem)
                        }}
                      >
                        <td style={{/* padding: '16px' */}}>
                          <div>
                            <div style={{/* fontWeight: 600, color: '#182A01', fontSize: '14px' */}}>
                              {classItem.name}
                            </div>
                            <div style={{/* fontSize: '12px', color: '#516640', marginTop: '2px' */}}>
                              {classTypes[classItem.type as keyof typeof classTypes]}
                            </div>
                          </div>
                        </td>
                        <td style={{/* padding: '16px' */}}>
                          <span style={{/* fontSize: '14px', color: '#182A01' */}}>
                            {classItem.instructor?.name}
                          </span>
                        </td>
                        <td style={{/* padding: '16px' */}}>
                          <div style={{/* fontSize: '14px', color: '#182A01' */}}>
                            {classItem.startTime} - {classItem.endTime}
                          </div>
                          {classItem.court && (
                            <div style={{/* fontSize: '12px', color: '#516640', marginTop: '2px' */}}>
                              {classItem.court.name}
                            </div>
                          )}
                        </td>
                        <td style={{/* padding: '16px' */}}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: `${classLevels[classItem.level as keyof typeof classLevels]?.color}15`,
                            color: classLevels[classItem.level as keyof typeof classLevels]?.color
                          }}>
                            {classLevels[classItem.level as keyof typeof classLevels]?.label}
                          </span>
                        </td>
                        <td style={{/* padding: '16px' */}}>
                          <div style={{/* display: 'flex', alignItems: 'center', gap: '8px' */}}>
                            <span style={{/* fontSize: '14px', color: '#182A01', fontWeight: 500 */}}>
                              {classItem.currentStudents} / {classItem.maxStudents}
                            </span>
                            <div style={{
                              width: '40px',
                              height: '4px',
                              background: 'rgba(164, 223, 78, 0.1)',
                              borderRadius: '2px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                height: '100%',
                                width: `${(classItem.currentStudents / classItem.maxStudents) * 100}%`,
                                background: 'linear-gradient(90deg, #A4DF4E, #66E7AA)',
                                borderRadius: '2px'
                              }} />
                            </div>
                          </div>
                        </td>
                        <td style={{/* padding: '16px' */}}>
                          <span style={{/* fontSize: '14px', fontWeight: 600, color: '#182A01' */}}>
                            {classItem.price > 0 ? formatCurrency(classItem.price / 100) : 'Gratis'}
                          </span>
                        </td>
                        <td style={{/* padding: '16px' */}}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: `${classStatuses[classItem.status as keyof typeof classStatuses]?.color}15`,
                            color: classStatuses[classItem.status as keyof typeof classStatuses]?.color
                          }}>
                            {classStatuses[classItem.status as keyof typeof classStatuses]?.label}
                          </span>
                        </td>
                        <td style={{/* padding: '16px' */}}>
                          <div style={{/* display: 'flex', gap: '8px', justifyContent: 'center' */}}>
                            {classItem.currentStudents < classItem.maxStudents && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedClass(classItem)
                                  setShowEnrollment(true)
                                }}
                                style={{
                                  padding: '6px',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#16a34a'
                                }}
                              >
                                <UserPlus size={16} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedClass(classItem)
                                setRescheduleForm({
                                  date: classItem.date.split('T')[0],
                                  startTime: classItem.startTime,
                                  endTime: classItem.endTime,
                                  courtId: classItem.courtId || '',
                                  notifyStudents: true,
                                  reason: ''
                                })
                                setShowReschedule(true)
                              }}
                              style={{
                                padding: '6px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#f59e0b'
                              }}
                              title="Reprogramar"
                            >
                              <Calendar size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setClassForm({
                                  instructorId: classItem.instructorId,
                                  name: classItem.name,
                                  description: classItem.description || '',
                                  type: classItem.type,
                                  level: classItem.level,
                                  date: classItem.date.split('T')[0],
                                  startTime: classItem.startTime,
                                  endTime: classItem.endTime,
                                  duration: classItem.duration,
                                  courtId: classItem.courtId || '',
                                  maxStudents: classItem.maxStudents,
                                  price: classItem.price / 100,
                                  notes: '',
                                  requirements: '',
                                  materials: '',
                                  isRecurring: false,
                                  recurrencePattern: {
                                    frequency: 'WEEKLY',
                                    interval: 1,
                                    occurrences: 12,
                                    endDate: null
                                  }
                                })
                                setEditingClass(classItem)
                              }}
                              style={{
                                padding: '6px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#516640'
                              }}
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedClass(classItem)
                                setShowCancel(true)
                              }}
                              style={{
                                padding: '6px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#ef4444'
                              }}
                              title="Cancelar clase"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardModernContent>
          </CardModern>
        )}

        {viewMode === 'reports' && (
          <CardModern variant="glass">
            <CardModernContent>
              {/* Report Controls */}
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                marginBottom: '24px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <select
                  value={reportPeriod}
                  onChange={(e) => {
                    setReportPeriod(e.target.value)
                    setTimeout(() => fetchReports(), 100)
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="custom">Personalizado</option>
                </select>

                <select
                  value={reportInstructor}
                  onChange={(e) => {
                    setReportInstructor(e.target.value)
                    setTimeout(() => fetchReports(), 100)
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="all">Todos los instructores</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                  ))}
                </select>

                <div style={{/* marginLeft: 'auto', display: 'flex', gap: '8px' */}}>
                  <ButtonModern
                    variant="outline"
                    onClick={() => exportReport('csv')}
                    disabled={!reportData}
                  >
                    <Download size={16} />
                    Exportar CSV
                  </ButtonModern>
                </div>
              </div>

              {loading ? (
                <div style={{/* padding: '60px', textAlign: 'center' */}}>
                  <div style={{/* fontSize: '14px', color: '#516640' */}}>Cargando reportes...</div>
                </div>
              ) : reportData ? (
                <div>
                  {/* Summary Cards */}
                  <div style={{/* display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' */}}>
                    <div style={{
                      padding: '16px',
                      background: 'rgba(164, 223, 78, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(164, 223, 78, 0.2)'
                    }}>
                      <div style={{/* fontSize: '12px', color: '#516640', marginBottom: '4px' */}}>Total Clases</div>
                      <div style={{/* fontSize: '24px', fontWeight: 700, color: '#182A01' */}}>
                        {reportData.summary?.totalClasses || 0}
                      </div>
                    </div>
                    <div style={{
                      padding: '16px',
                      background: 'rgba(102, 231, 170, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(102, 231, 170, 0.2)'
                    }}>
                      <div style={{/* fontSize: '12px', color: '#516640', marginBottom: '4px' */}}>Total Estudiantes</div>
                      <div style={{/* fontSize: '24px', fontWeight: 700, color: '#182A01' */}}>
                        {reportData.summary?.totalStudents || 0}
                      </div>
                    </div>
                    <div style={{
                      padding: '16px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      <div style={{/* fontSize: '12px', color: '#516640', marginBottom: '4px' */}}>Tasa Asistencia</div>
                      <div style={{/* fontSize: '24px', fontWeight: 700, color: '#182A01' */}}>
                        {reportData.summary?.overallAttendanceRate || 0}%
                      </div>
                    </div>
                    <div style={{
                      padding: '16px',
                      background: 'rgba(251, 191, 36, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(251, 191, 36, 0.2)'
                    }}>
                      <div style={{/* fontSize: '12px', color: '#516640', marginBottom: '4px' */}}>Ingresos</div>
                      <div style={{/* fontSize: '24px', fontWeight: 700, color: '#182A01' */}}>
                        {formatCurrency((reportData.summary?.totalRevenue || 0) / 100)}
                      </div>
                    </div>
                  </div>

                  {/* Instructor Details Table */}
                  <div style={{/* overflowX: 'auto' */}}>
                    <table style={{/* width: '100%', borderCollapse: 'separate', borderSpacing: '0' */}}>
                      <thead>
                        <tr style={{/* background: 'rgba(164, 223, 78, 0.05)' */}}>
                          <th style={{/* padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#516640', borderBottom: '1px solid rgba(164, 223, 78, 0.2)' */}}>
                            Instructor
                          </th>
                          <th style={{/* padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#516640', borderBottom: '1px solid rgba(164, 223, 78, 0.2)' */}}>
                            Clases
                          </th>
                          <th style={{/* padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#516640', borderBottom: '1px solid rgba(164, 223, 78, 0.2)' */}}>
                            Estudiantes
                          </th>
                          <th style={{/* padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#516640', borderBottom: '1px solid rgba(164, 223, 78, 0.2)' */}}>
                            Asistencia
                          </th>
                          <th style={{/* padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#516640', borderBottom: '1px solid rgba(164, 223, 78, 0.2)' */}}>
                            Ingresos
                          </th>
                          <th style={{/* padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#516640', borderBottom: '1px solid rgba(164, 223, 78, 0.2)' */}}>
                            Cobrado
                          </th>
                          <th style={{/* padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#516640', borderBottom: '1px solid rgba(164, 223, 78, 0.2)' */}}>
                            Pendiente
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.instructors?.map((instructor: any) => (
                          <tr key={instructor.id} style={{/* borderBottom: '1px solid rgba(164, 223, 78, 0.1)' */}}>
                            <td style={{/* padding: '16px' */}}>
                              <div style={{/* fontSize: '14px', fontWeight: 600, color: '#182A01' */}}>
                                {instructor.name}
                              </div>
                              <div style={{/* fontSize: '12px', color: '#516640' */}}>
                                {instructor.completedClasses} completadas
                              </div>
                            </td>
                            <td style={{/* padding: '16px', textAlign: 'center' */}}>
                              <span style={{/* fontSize: '14px', color: '#182A01' */}}>
                                {instructor.totalClasses}
                              </span>
                            </td>
                            <td style={{/* padding: '16px', textAlign: 'center' */}}>
                              <span style={{/* fontSize: '14px', color: '#182A01' */}}>
                                {instructor.totalStudents}
                              </span>
                            </td>
                            <td style={{/* padding: '16px', textAlign: 'center' */}}>
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                background: instructor.attendanceRate >= 80 ? 'rgba(34, 197, 94, 0.1)' :
                                           instructor.attendanceRate >= 60 ? 'rgba(251, 191, 36, 0.1)' :
                                           'rgba(239, 68, 68, 0.1)',
                                color: instructor.attendanceRate >= 80 ? '#16a34a' :
                                       instructor.attendanceRate >= 60 ? '#f59e0b' :
                                       '#ef4444'
                              }}>
                                {instructor.attendanceRate}%
                              </span>
                            </td>
                            <td style={{/* padding: '16px', textAlign: 'right' */}}>
                              <span style={{/* fontSize: '14px', fontWeight: 600, color: '#182A01' */}}>
                                {formatCurrency(instructor.totalRevenue / 100)}
                              </span>
                            </td>
                            <td style={{/* padding: '16px', textAlign: 'right' */}}>
                              <span style={{/* fontSize: '14px', color: '#16a34a' */}}>
                                {formatCurrency(instructor.collectedRevenue / 100)}
                              </span>
                            </td>
                            <td style={{/* padding: '16px', textAlign: 'right' */}}>
                              <span style={{/* fontSize: '14px', color: '#f59e0b' */}}>
                                {formatCurrency(instructor.pendingRevenue / 100)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{/* padding: '60px', textAlign: 'center', color: '#516640' */}}>
                  No hay datos de reportes disponibles
                </div>
              )}
            </CardModernContent>
          </CardModern>
        )}

        {/* Create/Edit Class Modal */}
        {(isCreatingClass || editingClass) && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              width: '700px',
              maxHeight: '90vh',
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '24px 32px',
                borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(250, 250, 250, 1))'
              }}>
                <div style={{/* display: 'flex', alignItems: 'center', gap: '16px' */}}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={24} color="#182A01" />
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#182A01',
                      margin: 0,
                      letterSpacing: '-0.02em'
                    }}>
                      {isCreatingClass ? 'Nueva Clase' : 'Editar Clase'}
                    </h2>
                    <p style={{
                      fontSize: '13px',
                      color: '#516640',
                      margin: '2px 0 0 0'
                    }}>
                      {isCreatingClass ? 'Configura los detalles de la nueva clase' : 'Modifica los detalles de la clase'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsCreatingClass(false)
                    setEditingClass(null)
                    resetClassForm()
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(164, 223, 78, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                  }}
                >
                  <X size={18} color="#516640" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div style={{
                padding: '32px',
                overflowY: 'auto',
                maxHeight: 'calc(90vh - 200px)'
              }}>
                <div style={{/* display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' */}}>
                  <div style={{/* gridColumn: 'span 2' */}}>
                    <InputModern
                      label="Nombre de la clase"
                      value={classForm.name}
                      onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                      placeholder="Clase de iniciación"
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{/* display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#182A01' */}}>
                      Instructor
                    </label>
                    <select
                      value={classForm.instructorId}
                      onChange={(e) => setClassForm({ ...classForm, instructorId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)',
                        background: 'white',
                        fontSize: '14px'
                      }}
                      required
                    >
                      <option value="">Selecciona instructor</option>
                      {instructors.map(instructor => (
                        <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{/* display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#182A01' */}}>
                      Tipo
                    </label>
                    <select
                      value={classForm.type}
                      onChange={(e) => {
                        const type = e.target.value
                        let price = classForm.price
                        
                        // Auto-ajustar precio basado en configuración
                        if (classPricing) {
                          if (type === 'PRIVATE') {
                            price = classPricing.privatePrice / 100
                          } else if (type === 'GROUP') {
                            price = classPricing.groupPrice / 100
                          } else if (type === 'SEMI_PRIVATE') {
                            price = classPricing.semiPrivatePrice / 100
                          }
                        }
                        
                        setClassForm({ ...classForm, type, price })
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)',
                        background: 'white',
                        fontSize: '14px'
                      }}
                    >
                      {Object.entries(classTypes).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{/* display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#182A01' */}}>
                      Nivel
                    </label>
                    <select
                      value={classForm.level}
                      onChange={(e) => setClassForm({ ...classForm, level: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)',
                        background: 'white',
                        fontSize: '14px'
                      }}
                    >
                      {Object.entries(classLevels).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <InputModern
                    label="Fecha"
                    type="date"
                    value={classForm.date}
                    onChange={(e) => setClassForm({ ...classForm, date: e.target.value })}
                    required
                  />
                  
                  <InputModern
                    label="Hora de inicio"
                    type="time"
                    value={classForm.startTime}
                    onChange={(e) => {
                      const startTime = e.target.value
                      setClassForm({ 
                        ...classForm, 
                        startTime,
                        // Automatically calculate end time based on duration
                        endTime: calculateEndTime(startTime, classForm.duration || 60)
                      })
                    }}
                    required
                  />
                  
                  <div>
                    <label style={{/* display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#182A01' */}}>
                      Duración <span style={{/* color: '#ef4444' */}}>*</span>
                    </label>
                    <select
                      value={classForm.duration || 60}
                      onChange={(e) => {
                        const duration = parseInt(e.target.value)
                        setClassForm({ 
                          ...classForm, 
                          duration,
                          // Recalculate end time based on new duration
                          endTime: calculateEndTime(classForm.startTime, duration)
                        })
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)',
                        background: 'white',
                        fontSize: '14px'
                      }}
                      required
                    >
                      <option value="30">30 minutos</option>
                      <option value="45">45 minutos</option>
                      <option value="60">1 hora</option>
                      <option value="90">1 hora 30 minutos</option>
                      <option value="120">2 horas</option>
                      <option value="150">2 horas 30 minutos</option>
                      <option value="180">3 horas</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{/* display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#182A01' */}}>
                      Cancha <span style={{/* color: '#ef4444' */}}>*</span>
                    </label>
                    <select
                      value={classForm.courtId}
                      onChange={(e) => setClassForm({ ...classForm, courtId: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)',
                        background: 'white',
                        fontSize: '14px'
                      }}
                      required
                    >
                      <option value="">Selecciona una cancha</option>
                      {courts.map(court => (
                        <option key={court.id} value={court.id}>{court.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Availability Check Status */}
                  {classForm.courtId && classForm.date && classForm.startTime && classForm.endTime && (
                    <div style={{
                      padding: '12px',
                      borderRadius: '10px',
                      background: availabilityCheck.available === false 
                        ? 'rgba(239, 68, 68, 0.05)' 
                        : availabilityCheck.available === true 
                        ? 'rgba(34, 197, 94, 0.05)' 
                        : 'rgba(164, 223, 78, 0.05)',
                      border: `1px solid ${
                        availabilityCheck.available === false 
                          ? 'rgba(239, 68, 68, 0.2)' 
                          : availabilityCheck.available === true 
                          ? 'rgba(34, 197, 94, 0.2)' 
                          : 'rgba(164, 223, 78, 0.2)'
                      }`
                    }}>
                      {availabilityCheck.loading ? (
                        <div style={{/* display: 'flex', alignItems: 'center', gap: '8px' */}}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(164, 223, 78, 0.3)',
                            borderTopColor: '#A4DF4E',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          <span style={{/* fontSize: '13px', color: '#516640' */}}>
                            Verificando disponibilidad...
                          </span>
                        </div>
                      ) : availabilityCheck.available === false ? (
                        <div>
                          <div style={{/* display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' */}}>
                            <X size={16} style={{/* color: '#ef4444' */}} />
                            <span style={{/* fontSize: '13px', color: '#ef4444', fontWeight: 600 */}}>
                              Horario no disponible
                            </span>
                          </div>
                          {availabilityCheck.conflicts && (
                            <div style={{/* fontSize: '12px', color: '#7f1d1d', marginBottom: '8px' */}}>
                              Conflictos:
                              {availabilityCheck.conflicts.bookings?.map((b: any, i: number) => (
                                <div key={i}>• Reserva: {b.courtName} ({b.startTime} - {b.endTime})</div>
                              ))}
                              {availabilityCheck.conflicts.classes?.map((c: any, i: number) => (
                                <div key={i}>• Clase: {c.className} ({c.startTime} - {c.endTime})</div>
                              ))}
                            </div>
                          )}
                          {availabilityCheck.alternatives && availabilityCheck.alternatives.length > 0 && (
                            <div style={{/* fontSize: '12px', color: '#516640' */}}>
                              <strong>Horarios alternativos:</strong>
                              {availabilityCheck.alternatives.map((alt: any, i: number) => (
                                <div key={i}>
                                  • {alt.startTime} - {alt.endTime}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : availabilityCheck.available === true ? (
                        <div style={{/* display: 'flex', alignItems: 'center', gap: '8px' */}}>
                          <Check size={16} style={{/* color: '#22c55e' */}} />
                          <span style={{/* fontSize: '13px', color: '#22c55e', fontWeight: 600 */}}>
                            Horario disponible
                          </span>
                        </div>
                      ) : null}
                    </div>
                  )}
                  
                  <InputModern
                    label="Máximo de estudiantes"
                    type="number"
                    min="1"
                    max="20"
                    value={classForm.maxStudents}
                    onChange={(e) => setClassForm({ ...classForm, maxStudents: Number(e.target.value) })}
                  />
                  
                  <div>
                    <InputModern
                      label="Precio (MXN)"
                      type="number"
                      min="0"
                      value={classForm.price}
                      onChange={(e) => setClassForm({ ...classForm, price: Number(e.target.value) })}
                    />
                    {classPricing && (
                      <p style={{ 
                        fontSize: '11px', 
                        color: '#516640', 
                        marginTop: '4px' 
                      }}>
                        Precio sugerido según configuración
                      </p>
                    )}
                  </div>
                  
                  {/* Recurrence Section */}
                  <div style={{/* gridColumn: 'span 2' */}}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '12px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#182A01',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={classForm.isRecurring}
                        onChange={(e) => setClassForm({ ...classForm, isRecurring: e.target.checked })}
                        style={{/* width: '18px', height: '18px' */}}
                      />
                      Clase recurrente
                    </label>
                    
                    {classForm.isRecurring && (
                      <div style={{ 
                        padding: '16px',
                        background: 'rgba(164, 223, 78, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)'
                      }}>
                        <div style={{/* display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' */}}>
                          <div>
                            <label style={{/* display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#516640' */}}>
                              Frecuencia
                            </label>
                            <select
                              value={classForm.recurrencePattern.frequency}
                              onChange={(e) => setClassForm({ 
                                ...classForm, 
                                recurrencePattern: { 
                                  ...classForm.recurrencePattern, 
                                  frequency: e.target.value 
                                }
                              })}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid rgba(164, 223, 78, 0.2)',
                                background: 'white',
                                fontSize: '13px'
                              }}
                            >
                              <option value="WEEKLY">Semanal</option>
                              <option value="MONTHLY">Mensual</option>
                            </select>
                          </div>
                          
                          <div>
                            <label style={{/* display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#516640' */}}>
                              Repeticiones
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="52"
                              value={classForm.recurrencePattern.occurrences}
                              onChange={(e) => setClassForm({ 
                                ...classForm, 
                                recurrencePattern: { 
                                  ...classForm.recurrencePattern, 
                                  occurrences: Number(e.target.value) 
                                }
                              })}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid rgba(164, 223, 78, 0.2)',
                                background: 'white',
                                fontSize: '13px'
                              }}
                            />
                          </div>
                        </div>
                        
                        <div style={{/* marginTop: '12px', fontSize: '12px', color: '#516640' */}}>
                          ℹ️ Se crearán {classForm.recurrencePattern.occurrences} clases {classForm.recurrencePattern.frequency === 'WEEKLY' ? 'semanales' : 'mensuales'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div style={{/* gridColumn: 'span 2' */}}>
                    <label style={{/* display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#182A01' */}}>
                      Descripción
                    </label>
                    <textarea
                      value={classForm.description}
                      onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                      placeholder="Descripción de la clase..."
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)',
                        background: 'white',
                        fontSize: '14px',
                        minHeight: '80px',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div style={{
                padding: '24px 32px',
                borderTop: '1px solid rgba(164, 223, 78, 0.1)',
                background: 'linear-gradient(to top, rgba(255, 255, 255, 1), rgba(250, 250, 250, 1))',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setIsCreatingClass(false)
                    setEditingClass(null)
                    resetClassForm()
                  }}
                  style={{
                    padding: '10px 24px',
                    background: 'white',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    borderRadius: '10px',
                    color: '#516640',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={isCreatingClass ? handleCreateClass : handleUpdateClass}
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(164, 223, 78, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(164, 223, 78, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(164, 223, 78, 0.3)'
                  }}
                >
                  {isCreatingClass ? 'Crear Clase' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Class Details Modal */}
        {selectedClass && !showEnrollment && !showAttendance && !showReschedule && !showCancel && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              width: '700px',
              maxHeight: '90vh',
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '24px 32px',
                borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(250, 250, 250, 1))'
              }}>
                <div style={{/* display: 'flex', alignItems: 'center', gap: '16px' */}}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={24} color="#182A01" />
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#182A01',
                      margin: 0,
                      letterSpacing: '-0.02em'
                    }}>
                      {selectedClass.name}
                    </h2>
                    <p style={{
                      fontSize: '13px',
                      color: '#516640',
                      margin: '2px 0 0 0'
                    }}>
                      {new Date(selectedClass.date).toLocaleDateString('es-MX', { 
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })} • {selectedClass.startTime} - {selectedClass.endTime}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClass(null)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(164, 223, 78, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                  }}
                >
                  <X size={18} color="#516640" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div style={{
                padding: '32px',
                overflowY: 'auto',
                maxHeight: 'calc(90vh - 200px)'
              }}>
                <div style={{/* marginBottom: '24px' */}}>
                  <div style={{/* display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' */}}>
                    <div style={{/* display: 'flex', gap: '8px' */}}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: `${classLevels[selectedClass.level as keyof typeof classLevels]?.color}15`,
                        color: classLevels[selectedClass.level as keyof typeof classLevels]?.color
                      }}>
                        {classLevels[selectedClass.level as keyof typeof classLevels]?.label}
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: `${classStatuses[selectedClass.status as keyof typeof classStatuses]?.color}15`,
                        color: classStatuses[selectedClass.status as keyof typeof classStatuses]?.color
                      }}>
                        {classStatuses[selectedClass.status as keyof typeof classStatuses]?.label}
                      </span>
                    </div>
                    <div style={{/* display: 'flex', gap: '8px' */}}>
                      <button
                        onClick={async () => {
                          await fetchAttendance(selectedClass.id)
                          setShowAttendance(true)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #FFD93D, #FFB344)',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 8px rgba(255, 179, 68, 0.3)'
                        }}
                      >
                        <CheckCircle size={14} />
                        Control de Asistencia
                      </button>
                      {selectedClass.currentStudents < selectedClass.maxStudents && (
                        <button
                          onClick={() => setShowEnrollment(true)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#182A01',
                              fontSize: '13px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 6px rgba(164, 223, 78, 0.25)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = '0 4px 10px rgba(164, 223, 78, 0.35)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(164, 223, 78, 0.25)'
                        }}
                      >
                        <UserPlus size={16} />
                        Inscribir Estudiante
                      </button>
                    )}
                  </div>
                </div>
                  
                  <div style={{/* display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' */}}>
                    <div>
                      <span style={{/* fontSize: '12px', color: '#516640' */}}>Instructor</span>
                      <p style={{/* fontSize: '14px', color: '#182A01', fontWeight: 500 */}}>
                        {selectedClass.instructor?.name}
                      </p>
                    </div>
                    <div>
                      <span style={{/* fontSize: '12px', color: '#516640' */}}>Tipo</span>
                      <p style={{/* fontSize: '14px', color: '#182A01', fontWeight: 500 */}}>
                        {classTypes[selectedClass.type as keyof typeof classTypes]}
                      </p>
                    </div>
                    <div>
                      <span style={{/* fontSize: '12px', color: '#516640' */}}>Horario</span>
                      <p style={{/* fontSize: '14px', color: '#182A01', fontWeight: 500 */}}>
                        {selectedClass.startTime} - {selectedClass.endTime}
                      </p>
                    </div>
                    <div>
                      <span style={{/* fontSize: '12px', color: '#516640' */}}>Duración</span>
                      <p style={{/* fontSize: '14px', color: '#182A01', fontWeight: 500 */}}>
                        {selectedClass.duration} minutos
                      </p>
                    </div>
                    {selectedClass.court && (
                      <div>
                        <span style={{/* fontSize: '12px', color: '#516640' */}}>Cancha</span>
                        <p style={{/* fontSize: '14px', color: '#182A01', fontWeight: 500 */}}>
                          {selectedClass.court.name}
                        </p>
                      </div>
                    )}
                    <div>
                      <span style={{/* fontSize: '12px', color: '#516640' */}}>Precio</span>
                      <p style={{/* fontSize: '14px', color: '#182A01', fontWeight: 500 */}}>
                        {selectedClass.price > 0 ? formatCurrency(selectedClass.price / 100) : 'Gratis'}
                      </p>
                    </div>
                  </div>
                  
                  {selectedClass.description && (
                    <div style={{/* marginTop: '16px', padding: '12px', background: 'rgba(164, 223, 78, 0.05)', borderRadius: '8px' */}}>
                      <div style={{/* fontSize: '12px', color: '#516640', marginBottom: '4px' */}}>Descripción</div>
                      <div style={{/* fontSize: '14px', color: '#182A01' */}}>{selectedClass.description}</div>
                    </div>
                  )}
                </div>

                {/* Students List */}
                <div>
                  <div style={{/* display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' */}}>
                    <h4 style={{/* fontSize: '16px', fontWeight: 600, color: '#182A01' */}}>
                      Estudiantes Inscritos ({selectedClass.currentStudents} / {selectedClass.maxStudents})
                    </h4>
                  </div>
                  
                  {selectedClass.bookings?.length === 0 ? (
                    <div style={{/* textAlign: 'center', padding: '40px', color: '#516640' */}}>
                      No hay estudiantes inscritos aún
                    </div>
                  ) : (
                    <div style={{/* display: 'flex', flexDirection: 'column', gap: '8px' */}}>
                      {selectedClass.bookings?.map((booking: any, index: number) => (
                        <div key={booking.id} style={{
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.5)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{/* display: 'flex', alignItems: 'center', gap: '12px' */}}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#182A01'
                            }}>
                              {index + 1}
                            </div>
                            <div>
                              <div style={{/* fontSize: '14px', fontWeight: 500, color: '#182A01' */}}>
                                {booking.studentName}
                              </div>
                              <div style={{/* fontSize: '12px', color: '#516640' */}}>
                                {booking.studentPhone}
                              </div>
                            </div>
                          </div>
                          <div style={{/* display: 'flex', gap: '8px' */}}>
                            {booking.attended && (
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600,
                                background: 'rgba(22, 163, 74, 0.1)',
                                color: '#16a34a'
                              }}>
                                Asistió
                              </span>
                            )}
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: booking.paymentStatus === 'completed' 
                                ? 'rgba(22, 163, 74, 0.1)' 
                                : 'rgba(234, 179, 8, 0.1)',
                              color: booking.paymentStatus === 'completed' ? '#16a34a' : '#eab308'
                            }}>
                              {booking.paymentStatus === 'completed' ? 'Pagado' : 'Pendiente'}
                            </span>
                            {booking.paymentStatus !== 'completed' && !booking.attended && (
                              <button
                                onClick={() => handleCancelEnrollment(selectedClass.id, booking.id, booking.studentName)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#ef4444',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                                }}
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enrollment Modal */}
        {showEnrollment && selectedClass && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100
          }}>
            <div style={{
              width: '500px',
              maxHeight: '90vh',
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '24px 32px',
                borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(250, 250, 250, 1))'
              }}>
                <div style={{/* display: 'flex', alignItems: 'center', gap: '16px' */}}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <UserPlus size={24} color="#182A01" />
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#182A01',
                      margin: 0,
                      letterSpacing: '-0.02em'
                    }}>
                      Inscribir Estudiante
                    </h2>
                    <p style={{
                      fontSize: '13px',
                      color: '#516640',
                      margin: '2px 0 0 0'
                    }}>
                      {selectedClass.name} • {formatCurrency(selectedClass.price / 100)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEnrollment(false)
                    resetEnrollmentForm()
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(164, 223, 78, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.1)'
                  }}
                >
                  <X size={18} color="#516640" />
                </button>
              </div>
              
              {/* Modal Content */}
              <div style={{
                padding: '32px',
                overflowY: 'auto',
                maxHeight: 'calc(90vh - 200px)'
              }}>
                <div style={{/* display: 'flex', flexDirection: 'column', gap: '16px' */}}>
                  <div>
                    <label style={{/* display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#182A01' */}}>
                      Jugador registrado (opcional)
                    </label>
                    <select
                      value={enrollmentForm.playerId}
                      onChange={(e) => {
                        const player = players.find(p => p.id === e.target.value)
                        if (player) {
                          setEnrollmentForm({
                            ...enrollmentForm,
                            playerId: player.id,
                            studentName: player.name,
                            studentPhone: player.phone,
                            studentEmail: player.email || ''
                          })
                        } else {
                          setEnrollmentForm({
                            ...enrollmentForm,
                            playerId: '',
                            studentName: '',
                            studentPhone: '',
                            studentEmail: ''
                          })
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(164, 223, 78, 0.2)',
                        background: 'white',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Nuevo estudiante</option>
                      {players.map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name} - {player.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <InputModern
                    label="Nombre del estudiante"
                    value={enrollmentForm.studentName}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, studentName: e.target.value })}
                    placeholder="Juan Pérez"
                    required
                    disabled={!!enrollmentForm.playerId}
                  />
                  
                  <InputModern
                    label="Teléfono"
                    value={enrollmentForm.studentPhone}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, studentPhone: e.target.value })}
                    placeholder="55 1234 5678"
                    required
                    disabled={!!enrollmentForm.playerId}
                  />
                  
                  <InputModern
                    label="Email (opcional)"
                    type="email"
                    value={enrollmentForm.studentEmail}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, studentEmail: e.target.value })}
                    placeholder="estudiante@email.com"
                    disabled={!!enrollmentForm.playerId}
                  />
                  
                  {/* Payment Options */}
                  <div style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.05), rgba(102, 231, 170, 0.05))',
                    borderRadius: '12px',
                    border: '1px solid rgba(164, 223, 78, 0.1)'
                  }}>
                    <h4 style={{ 
                      marginBottom: '12px', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      color: '#182A01',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <DollarSign size={16} />
                      Opciones de Pago
                    </h4>
                    
                    <div style={{/* display: 'flex', gap: '8px', marginBottom: '12px' */}}>
                      <button
                        type="button"
                        onClick={() => setEnrollmentForm({ ...enrollmentForm, paymentMethod: 'online' })}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: enrollmentForm.paymentMethod === 'online' 
                            ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)' 
                            : 'white',
                          color: enrollmentForm.paymentMethod === 'online' ? 'white' : '#516640',
                          border: '1px solid rgba(164, 223, 78, 0.2)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        Pago Online
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnrollmentForm({ ...enrollmentForm, paymentMethod: 'onsite' })}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: enrollmentForm.paymentMethod === 'onsite' 
                            ? 'linear-gradient(135deg, #A4DF4E, #66E7AA)' 
                            : 'white',
                          color: enrollmentForm.paymentMethod === 'onsite' ? 'white' : '#516640',
                          border: '1px solid rgba(164, 223, 78, 0.2)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        Pago en Sitio
                      </button>
                    </div>
                    
                    {enrollmentForm.paymentMethod === 'online' && (
                      <div>
                        <label style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          marginBottom: '8px',
                          fontSize: '13px',
                          color: '#516640',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={enrollmentForm.splitPayment}
                            onChange={(e) => setEnrollmentForm({ 
                              ...enrollmentForm, 
                              splitPayment: e.target.checked,
                              splitCount: e.target.checked ? 2 : 1
                            })}
                            style={{/* cursor: 'pointer' */}}
                          />
                          Dividir pago entre múltiples personas
                        </label>
                        
                        {enrollmentForm.splitPayment && (
                          <div style={{/* display: 'flex', alignItems: 'center', gap: '8px' */}}>
                            <label style={{/* fontSize: '13px', color: '#516640' */}}>
                              Dividir entre:
                            </label>
                            <input
                              type="number"
                              min="2"
                              max="8"
                              value={enrollmentForm.splitCount}
                              onChange={(e) => setEnrollmentForm({ 
                                ...enrollmentForm, 
                                splitCount: Math.min(8, Math.max(2, parseInt(e.target.value) || 2))
                              })}
                              style={{
                                width: '60px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid rgba(164, 223, 78, 0.2)',
                                fontSize: '13px'
                              }}
                            />
                            <span style={{/* fontSize: '13px', color: '#516640' */}}>personas</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {selectedClass && (
                      <div style={{
                        marginTop: '12px',
                        padding: '8px',
                        background: 'white',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#182A01'
                      }}>
                        <strong>Total a pagar:</strong> {formatCurrency(selectedClass.price / 100)}
                        {enrollmentForm.splitPayment && (
                          <div style={{/* marginTop: '4px', color: '#516640' */}}>
                            {formatCurrency(Math.ceil(selectedClass.price / enrollmentForm.splitCount) / 100)} por persona
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <InputModern
                    label="Notas (opcional)"
                    value={enrollmentForm.notes}
                    onChange={(e) => setEnrollmentForm({ ...enrollmentForm, notes: e.target.value })}
                    placeholder="Información adicional..."
                  />
                </div>
              </div>
              
              {/* Modal Footer */}
              <div style={{
                padding: '24px 32px',
                borderTop: '1px solid rgba(164, 223, 78, 0.1)',
                background: 'linear-gradient(to top, rgba(255, 255, 255, 1), rgba(250, 250, 250, 1))',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setShowEnrollment(false)
                    resetEnrollmentForm()
                  }}
                  style={{
                    padding: '10px 24px',
                    background: 'white',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    borderRadius: '10px',
                    color: '#516640',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEnrollStudent}
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(164, 223, 78, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(164, 223, 78, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(164, 223, 78, 0.3)'
                  }}
                >
                  Inscribir Estudiante
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Attendance Control Modal */}
        {showAttendance && selectedClass && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100
          }}>
            <div style={{
              width: '700px',
              maxHeight: '90vh',
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '24px 32px',
                borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(250, 250, 250, 1))'
              }}>
                <div>
                  <h3 style={{/* fontSize: '20px', fontWeight: 600, color: '#182A01', marginBottom: '4px' */}}>
                    Control de Asistencia
                  </h3>
                  <p style={{/* fontSize: '14px', color: '#516640' */}}>
                    {selectedClass.name} - {new Date(selectedClass.date).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAttendance(false)
                    setAttendanceList([])
                    setAttendanceStats(null)
                  }}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(164, 223, 78, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <X size={18} color="#516640" />
                </button>
              </div>
              
              {/* Attendance Stats */}
              {attendanceStats && (
                <div style={{
                  padding: '20px 32px',
                  background: 'linear-gradient(135deg, rgba(255, 217, 61, 0.05), rgba(255, 179, 68, 0.05))',
                  borderBottom: '1px solid rgba(255, 179, 68, 0.1)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '16px'
                }}>
                  <div style={{/* textAlign: 'center' */}}>
                    <div style={{/* fontSize: '24px', fontWeight: 600, color: '#182A01' */}}>
                      {attendanceStats.total}
                    </div>
                    <div style={{/* fontSize: '12px', color: '#516640' */}}>Total</div>
                  </div>
                  <div style={{/* textAlign: 'center' */}}>
                    <div style={{/* fontSize: '24px', fontWeight: 600, color: '#22c55e' */}}>
                      {attendanceStats.present}
                    </div>
                    <div style={{/* fontSize: '12px', color: '#516640' */}}>Presentes</div>
                  </div>
                  <div style={{/* textAlign: 'center' */}}>
                    <div style={{/* fontSize: '24px', fontWeight: 600, color: '#f59e0b' */}}>
                      {attendanceStats.late}
                    </div>
                    <div style={{/* fontSize: '12px', color: '#516640' */}}>Tarde</div>
                  </div>
                  <div style={{/* textAlign: 'center' */}}>
                    <div style={{/* fontSize: '24px', fontWeight: 600, color: '#ef4444' */}}>
                      {attendanceStats.absent}
                    </div>
                    <div style={{/* fontSize: '12px', color: '#516640' */}}>Ausentes</div>
                  </div>
                  <div style={{/* textAlign: 'center' */}}>
                    <div style={{/* fontSize: '24px', fontWeight: 600, color: '#6b7280' */}}>
                      {attendanceStats.pending}
                    </div>
                    <div style={{/* fontSize: '12px', color: '#516640' */}}>Sin marcar</div>
                  </div>
                </div>
              )}
              
              {/* Students List */}
              <div style={{
                padding: '32px',
                overflowY: 'auto',
                maxHeight: 'calc(90vh - 300px)'
              }}>
                {attendanceList.length === 0 ? (
                  <div style={{/* textAlign: 'center', padding: '40px', color: '#516640' */}}>
                    No hay estudiantes inscritos
                  </div>
                ) : (
                  <div style={{/* display: 'flex', flexDirection: 'column', gap: '8px' */}}>
                    {attendanceList.map((student) => (
                      <div key={student.id} style={{
                        padding: '12px 16px',
                        background: 'white',
                        borderRadius: '10px',
                        border: '1px solid rgba(164, 223, 78, 0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{/* flex: 1 */}}>
                          <div style={{/* fontWeight: 500, color: '#182A01', fontSize: '14px' */}}>
                            {student.studentName}
                          </div>
                          <div style={{/* fontSize: '12px', color: '#516640' */}}>
                            {student.studentPhone}
                            {student.paymentStatus === 'pending' && (
                              <span style={{
                                marginLeft: '8px',
                                padding: '2px 6px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 600
                              }}>
                                PAGO PENDIENTE
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Attendance Buttons */}
                        <div style={{/* display: 'flex', gap: '6px' */}}>
                          <button
                            onClick={() => handleCheckIn(student.id, 'PRESENT')}
                            style={{
                              padding: '6px 12px',
                              background: student.attendanceStatus === 'PRESENT' 
                                ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                                : 'white',
                              color: student.attendanceStatus === 'PRESENT' ? 'white' : '#22c55e',
                              border: `1px solid ${student.attendanceStatus === 'PRESENT' ? '#22c55e' : 'rgba(34, 197, 94, 0.2)'}`,
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Check size={14} style={{/* verticalAlign: 'middle' */}} /> Presente
                          </button>
                          
                          <button
                            onClick={() => handleCheckIn(student.id, 'LATE')}
                            style={{
                              padding: '6px 12px',
                              background: student.attendanceStatus === 'LATE' 
                                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                : 'white',
                              color: student.attendanceStatus === 'LATE' ? 'white' : '#f59e0b',
                              border: `1px solid ${student.attendanceStatus === 'LATE' ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)'}`,
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <Clock size={14} style={{/* verticalAlign: 'middle' */}} /> Tarde
                          </button>
                          
                          <button
                            onClick={() => handleCheckIn(student.id, 'ABSENT')}
                            style={{
                              padding: '6px 12px',
                              background: student.attendanceStatus === 'ABSENT' 
                                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                                : 'white',
                              color: student.attendanceStatus === 'ABSENT' ? 'white' : '#ef4444',
                              border: `1px solid ${student.attendanceStatus === 'ABSENT' ? '#ef4444' : 'rgba(239, 68, 68, 0.2)'}`,
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <X size={14} style={{/* verticalAlign: 'middle' */}} /> Ausente
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Modal Footer */}
              <div style={{
                padding: '24px 32px',
                borderTop: '1px solid rgba(164, 223, 78, 0.1)',
                background: 'linear-gradient(to top, rgba(255, 255, 255, 1), rgba(250, 250, 250, 1))',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{/* fontSize: '12px', color: '#516640' */}}>
                  Última actualización: {new Date().toLocaleTimeString('es-MX')}
                </div>
                <button
                  onClick={() => {
                    setShowAttendance(false)
                    setAttendanceList([])
                    setAttendanceStats(null)
                  }}
                  style={{
                    padding: '10px 24px',
                    background: 'linear-gradient(135deg, #A4DF4E, #66E7AA)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(164, 223, 78, 0.3)'
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {showReschedule && selectedClass && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200
          }}>
            <div style={{
              width: '500px',
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '24px 32px',
                borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h3 style={{/* fontSize: '18px', fontWeight: 600, color: '#182A01', margin: 0 */}}>
                  Reprogramar Clase
                </h3>
                <button
                  onClick={() => setShowReschedule(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(164, 223, 78, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} color="#516640" />
                </button>
              </div>
              
              <div style={{/* padding: '24px 32px' */}}>
                <div style={{/* marginBottom: '20px' */}}>
                  <label style={{/* display: 'block', fontSize: '12px', fontWeight: 600, color: '#516640', marginBottom: '8px' */}}>
                    Nueva Fecha
                  </label>
                  <InputModern
                    type="date"
                    value={rescheduleForm.date}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                    style={{/* width: '100%' */}}
                  />
                </div>
                
                <div style={{/* display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' */}}>
                  <div>
                    <label style={{/* display: 'block', fontSize: '12px', fontWeight: 600, color: '#516640', marginBottom: '8px' */}}>
                      Hora Inicio
                    </label>
                    <InputModern
                      type="time"
                      value={rescheduleForm.startTime}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, startTime: e.target.value })}
                      style={{/* width: '100%' */}}
                    />
                  </div>
                  <div>
                    <label style={{/* display: 'block', fontSize: '12px', fontWeight: 600, color: '#516640', marginBottom: '8px' */}}>
                      Hora Fin
                    </label>
                    <InputModern
                      type="time"
                      value={rescheduleForm.endTime}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, endTime: e.target.value })}
                      style={{/* width: '100%' */}}
                    />
                  </div>
                </div>
                
                <div style={{/* marginBottom: '20px' */}}>
                  <label style={{/* display: 'block', fontSize: '12px', fontWeight: 600, color: '#516640', marginBottom: '8px' */}}>
                    Cancha (opcional)
                  </label>
                  <select
                    value={rescheduleForm.courtId}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, courtId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Mantener cancha actual</option>
                    {courts.map(court => (
                      <option key={court.id} value={court.id}>{court.name}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{/* marginBottom: '20px' */}}>
                  <label style={{/* display: 'block', fontSize: '12px', fontWeight: 600, color: '#516640', marginBottom: '8px' */}}>
                    Motivo del cambio
                  </label>
                  <textarea
                    value={rescheduleForm.reason}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                    placeholder="Explica el motivo de la reprogramación..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{/* marginBottom: '24px' */}}>
                  <label style={{/* display: 'flex', alignItems: 'center', gap: '8px' */}}>
                    <input
                      type="checkbox"
                      checked={rescheduleForm.notifyStudents}
                      onChange={(e) => setRescheduleForm({ ...rescheduleForm, notifyStudents: e.target.checked })}
                    />
                    <span style={{/* fontSize: '14px', color: '#182A01' */}}>
                      Notificar a estudiantes por WhatsApp
                    </span>
                  </label>
                </div>
                
                <div style={{/* display: 'flex', gap: '12px', justifyContent: 'flex-end' */}}>
                  <button
                    onClick={() => setShowReschedule(false)}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      background: 'white',
                      color: '#516640',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                  <ButtonModern
                    onClick={handleRescheduleClass}
                    disabled={loading || !rescheduleForm.date || !rescheduleForm.startTime || !rescheduleForm.endTime}
                  >
                    Reprogramar Clase
                  </ButtonModern>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancel && selectedClass && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200
          }}>
            <div style={{
              width: '500px',
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '20px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '24px 32px',
                borderBottom: '1px solid rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(239, 68, 68, 0.05)'
              }}>
                <h3 style={{/* fontSize: '18px', fontWeight: 600, color: '#ef4444', margin: 0 */}}>
                  Cancelar Clase
                </h3>
                <button
                  onClick={() => setShowCancel(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={18} color="#ef4444" />
                </button>
              </div>
              
              <div style={{/* padding: '24px 32px' */}}>
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(251, 191, 36, 0.1)',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start'
                }}>
                  <AlertCircle size={20} color="#f59e0b" />
                  <div style={{/* flex: 1 */}}>
                    <div style={{/* fontSize: '14px', fontWeight: 600, color: '#92400e', marginBottom: '4px' */}}>
                      Advertencia
                    </div>
                    <div style={{/* fontSize: '13px', color: '#92400e' */}}>
                      Esta acción cancelará la clase "{selectedClass.name}" del {new Date(selectedClass.date).toLocaleDateString()}.
                      {selectedClass.currentStudents > 0 && ` Hay ${selectedClass.currentStudents} estudiantes inscritos.`}
                    </div>
                  </div>
                </div>
                
                <div style={{/* marginBottom: '20px' */}}>
                  <label style={{/* display: 'block', fontSize: '12px', fontWeight: 600, color: '#516640', marginBottom: '8px' */}}>
                    Motivo de cancelación *
                  </label>
                  <textarea
                    value={cancelForm.reason}
                    onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                    placeholder="Explica el motivo de la cancelación..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                    required
                  />
                </div>
                
                <div style={{/* marginBottom: '12px' */}}>
                  <label style={{/* display: 'flex', alignItems: 'center', gap: '8px' */}}>
                    <input
                      type="checkbox"
                      checked={cancelForm.notifyStudents}
                      onChange={(e) => setCancelForm({ ...cancelForm, notifyStudents: e.target.checked })}
                    />
                    <span style={{/* fontSize: '14px', color: '#182A01' */}}>
                      Notificar a estudiantes por WhatsApp
                    </span>
                  </label>
                </div>
                
                <div style={{/* marginBottom: '24px' */}}>
                  <label style={{/* display: 'flex', alignItems: 'center', gap: '8px' */}}>
                    <input
                      type="checkbox"
                      checked={cancelForm.refundStudents}
                      onChange={(e) => setCancelForm({ ...cancelForm, refundStudents: e.target.checked })}
                    />
                    <span style={{/* fontSize: '14px', color: '#182A01' */}}>
                      Reembolsar pagos a estudiantes
                    </span>
                  </label>
                </div>
                
                <div style={{/* display: 'flex', gap: '12px', justifyContent: 'flex-end' */}}>
                  <button
                    onClick={() => setShowCancel(false)}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      background: 'white',
                      color: '#516640',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Mantener Clase
                  </button>
                  <button
                    onClick={handleCancelClass}
                    disabled={loading || !cancelForm.reason}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: 'none',
                      background: loading ? '#fca5a5' : '#ef4444',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {loading ? 'Cancelando...' : 'Cancelar Clase'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}


export default function ClassesPage() {
  return <ClassesContent />
}
