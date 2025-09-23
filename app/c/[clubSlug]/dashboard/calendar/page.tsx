'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, Users, DollarSign, ChevronLeft, ChevronRight, Plus, Filter, Search, X } from 'lucide-react'
import { ModernDashboardLayout } from '@/components/layouts/ModernDashboardLayout'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { InputModern } from '@/components/design-system/InputModern'
import { AppleModal } from '@/components/design-system/AppleModal'
import { useNotify } from '@/hooks/use-notify'

// Dynamic import for FullCalendar to avoid SSR issues
const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false })
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import esLocale from '@fullcalendar/core/locales/es'

// Types
interface Court {
  id: string
  name: string
  type: string
  pricePerHour: number
}

interface Booking {
  id: string
  title: string
  start: string
  end: string
  courtId: string
  courtName: string
  playerName: string
  playerPhone: string
  playerEmail?: string
  totalPlayers: number
  price: number
  status: string
  paymentStatus: string
  type: string // REGULAR, CLASS, TOURNAMENT
  backgroundColor?: string
  borderColor?: string
  textColor?: string
}

interface CalendarStats {
  totalBookings: number
  totalRevenue: number
  occupancyRate: number
  checkedIn: number
}

function CalendarPageContent() {
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<Booking[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedView, setSelectedView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [selectedEvent, setSelectedEvent] = useState<Booking | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedDayEvents, setSelectedDayEvents] = useState<Booking[]>([])
  const [showDayModal, setShowDayModal] = useState(false)
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: Date, time: string, events: Booking[] } | null>(null)
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourt, setSelectedCourt] = useState<string>('all')
  const [stats, setStats] = useState<CalendarStats>({
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    checkedIn: 0
  })
  
  const calendarRef = useRef<any>(null)
  const notify = useNotify()

  // Form state for new booking
  const [bookingForm, setBookingForm] = useState({
    courtId: '',
    playerName: '',
    playerEmail: '',
    playerPhone: '',
    totalPlayers: 4,
    duration: 90,
    price: 0,
    splitPayment: false,
    date: '',
    startTime: ''
  })

  useEffect(() => {
    fetchCourts()
    fetchBookings()
  }, [selectedDate, selectedCourt])

  const fetchCourts = async () => {
    try {
      const response = await fetch('/api/courts')
      const data = await response.json()
      if (data.success) {
        setCourts(data.courts)
      }
    } catch (error) {
      console.error('Error fetching courts:', error)
    }
  }

  const fetchBookings = async () => {
    setLoading(true)
    try {
      // Calculate date range based on view
      let startDate, endDate
      if (selectedView === 'dayGridMonth') {
        startDate = startOfMonth(selectedDate)
        endDate = endOfMonth(selectedDate)
      } else if (selectedView === 'timeGridWeek') {
        startDate = startOfWeek(selectedDate, { locale: es })
        endDate = endOfWeek(selectedDate, { locale: es })
      } else {
        startDate = selectedDate
        endDate = selectedDate
      }

      const params = new URLSearchParams({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      })
      
      if (selectedCourt !== 'all') {
        params.append('courtId', selectedCourt)
      }

      const response = await fetch(`/api/bookings?${params}`)
      const data = await response.json()
      
      if (data.success) {
        // Transform bookings to calendar events
        const calendarEvents = data.bookings.map((booking: any) => ({
          id: booking.id,
          title: booking.playerName,
          start: `${format(new Date(booking.date), 'yyyy-MM-dd')}T${booking.startTime}:00`,
          end: `${format(new Date(booking.date), 'yyyy-MM-dd')}T${booking.endTime}:00`,
          extendedProps: {
            courtName: booking.court?.name || 'Cancha',
            playerPhone: booking.playerPhone
          },
          courtId: booking.courtId,
          courtName: booking.court?.name,
          playerName: booking.playerName,
          playerPhone: booking.playerPhone,
          playerEmail: booking.playerEmail,
          totalPlayers: booking.totalPlayers,
          price: booking.price,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          type: booking.type || 'REGULAR',
          backgroundColor: getEventColor(booking.status, booking.paymentStatus, booking.type),
          borderColor: getEventColor(booking.status, booking.paymentStatus, booking.type),
          textColor: '#1F2937' // Dark gray text for better readability
        }))
        
        setEvents(calendarEvents)
        calculateStats(data.bookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      notify.error('Error al cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  const getEventColor = (status: string, paymentStatus: string, type: string) => {
    // Colores pastel para mejor legibilidad con texto oscuro
    if (status === 'CANCELLED') return '#FEE2E2' // Red pastel
    if (type === 'CLASS') return '#FEF3C7' // Yellow pastel
    if (type === 'TOURNAMENT') return '#DBEAFE' // Blue pastel
    if (paymentStatus === 'pending') return '#FED7AA' // Orange pastel
    return '#D1FAE5' // Green pastel (default for bookings)
  }

  const calculateStats = (bookings: any[]) => {
    const activeBookings = bookings.filter(b => b.status !== 'CANCELLED')
    const totalRevenue = activeBookings.reduce((sum, b) => sum + b.price, 0)
    const checkedIn = activeBookings.filter(b => b.checkedIn).length
    
    // Calculate occupancy (assuming 14 hours/day, 4 courts, 90min slots)
    const totalSlots = 14 * 4 * 2 // 112 slots per day
    const occupiedSlots = activeBookings.length
    const occupancyRate = Math.round((occupiedSlots / totalSlots) * 100)

    setStats({
      totalBookings: activeBookings.length,
      totalRevenue,
      occupancyRate: Math.min(occupancyRate, 100),
      checkedIn
    })
  }

  const handleDateSelect = (selectInfo: any) => {
    // Solo abrir modal de crear si es una selección de rango de tiempo (no un click simple)
    if (selectInfo.allDay === false || selectInfo.view.type !== 'dayGridMonth') {
      setSelectedSlot(selectInfo)
      setBookingForm({
        ...bookingForm,
        date: selectInfo.startStr.split('T')[0],
        startTime: selectInfo.startStr.split('T')[1]?.substring(0, 5) || '09:00'
      })
      setShowCreateModal(true)
    }
  }

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id)
    if (event) {
      setSelectedEvent(event)
      setShowEventModal(true)
    }
  }

  const handleEventDrop = async (dropInfo: any) => {
    try {
      const response = await fetch(`/api/bookings/${dropInfo.event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dropInfo.event.startStr.split('T')[0],
          startTime: dropInfo.event.startStr.split('T')[1]?.substring(0, 5),
          endTime: dropInfo.event.endStr.split('T')[1]?.substring(0, 5)
        })
      })

      const data = await response.json()
      if (data.success) {
        notify.success('Reserva movida exitosamente')
        fetchBookings()
      } else {
        dropInfo.revert()
        notify.error('No se pudo mover la reserva')
      }
    } catch (error) {
      dropInfo.revert()
      notify.error('Error al mover la reserva')
    }
  }

  const handleCreateBooking = async () => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm)
      })

      const data = await response.json()
      if (data.success) {
        notify.success('Reserva creada exitosamente')
        setShowCreateModal(false)
        fetchBookings()
        resetForm()
      } else {
        notify.error(data.error || 'Error al crear la reserva')
      }
    } catch (error) {
      notify.error('Error al crear la reserva')
    }
  }

  const resetForm = () => {
    setBookingForm({
      courtId: '',
      playerName: '',
      playerEmail: '',
      playerPhone: '',
      totalPlayers: 4,
      duration: 90,
      price: 0,
      splitPayment: false,
      date: '',
      startTime: ''
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(amount / 100)
  }

  // Generate occupancy summary events for week view
  const generateOccupancySummaryEvents = () => {
    if (selectedView !== 'timeGridWeek') return events

    const summaryEvents: any[] = []
    const timeSlots = []
    
    // Generate time slots from 07:00 to 20:30 (30 min intervals)
    for (let hour = 7; hour < 21; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }

    // Get current week dates
    const weekStart = startOfWeek(selectedDate, { locale: es })
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      weekDates.push(date)
    }

    // Process each day and time slot
    weekDates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      
      timeSlots.forEach(timeSlot => {
        // Find all events that overlap with this time slot
        const slotStart = new Date(`${dateStr}T${timeSlot}:00`)
        const slotEnd = new Date(slotStart.getTime() + 30 * 60000) // 30 minutes later
        
        const slotEvents = events.filter(event => {
          const eventStart = new Date(event.start)
          const eventEnd = new Date(event.end)
          const eventDate = event.start.split('T')[0]
          
          // Check if event overlaps with this time slot
          return eventDate === dateStr && 
                 eventStart < slotEnd && 
                 eventEnd > slotStart
        })

        // Get unique courts occupied in this time slot
        const occupiedCourtIds = new Set(slotEvents.map(e => e.courtId))
        const occupiedCourts = occupiedCourtIds.size
        
        // Only show slots that have at least one booking
        if (occupiedCourts > 0) {
          const totalCourts = courts.length || 4
          const occupancyRate = Math.round((occupiedCourts / totalCourts) * 100)
          
          // Determine color based on occupancy
          let backgroundColor = '#D1FAE5' // Green for low occupancy
          let borderColor = '#10B981'
          let textColor = '#065F46'
          
          if (occupancyRate > 75) {
            backgroundColor = '#FEE2E2' // Red for high occupancy
            borderColor = '#EF4444'
            textColor = '#991B1B'
          } else if (occupancyRate > 50) {
            backgroundColor = '#FED7AA' // Orange for medium occupancy
            borderColor = '#F97316'
            textColor = '#C2410C'
          } else if (occupancyRate > 25) {
            backgroundColor = '#FEF3C7' // Yellow for low-medium occupancy
            borderColor = '#F59E0B'
            textColor = '#92400E'
          }

          // Calculate end time (30 minutes later)
          const [hour, minute] = timeSlot.split(':').map(Number)
          let endHour = hour
          let endMinute = minute + 30
          if (endMinute >= 60) {
            endHour++
            endMinute -= 60
          }
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`

          summaryEvents.push({
            id: `summary-${dateStr}-${timeSlot}`,
            title: `${occupancyRate}% (${occupiedCourts}/${totalCourts})`,
            start: `${dateStr}T${timeSlot}:00`,
            end: `${dateStr}T${endTime}:00`,
            backgroundColor,
            borderColor,
            textColor,
            extendedProps: {
              isOccupancySummary: true,
              occupancyRate,
              occupiedCourts,
              totalCourts,
              originalEvents: slotEvents
            }
          })
        }
      })
    })

    return summaryEvents
  }

  return (
    <>
      {/* Header with Stats */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1d1d1f', marginBottom: '16px' }}>
          Calendario de Reservas
        </h1>
        
        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <CardModern variant="glass" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={20} color="#065F46" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#516640', marginBottom: '2px' }}>Reservas Hoy</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#182A01' }}>{stats.totalBookings}</div>
              </div>
            </div>
          </CardModern>

          <CardModern variant="glass" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign size={20} color="#065F46" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#516640', marginBottom: '2px' }}>Ingresos</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#182A01' }}>
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </div>
            </div>
          </CardModern>

          <CardModern variant="glass" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock size={20} color="#1E40AF" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#516640', marginBottom: '2px' }}>Ocupación</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#182A01' }}>{stats.occupancyRate}%</div>
              </div>
            </div>
          </CardModern>

          <CardModern variant="glass" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={20} color="#92400E" />
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#516640', marginBottom: '2px' }}>Check-ins</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#182A01' }}>
                  {stats.checkedIn}/{stats.totalBookings}
                </div>
              </div>
            </div>
          </CardModern>
        </div>

        {/* Filters and Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          alignItems: 'center', 
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '240px', maxWidth: '320px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }} />
              <input
                type="text"
                placeholder="Buscar reservas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '10px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  background: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(102, 231, 170, 0.4)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 231, 170, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>
          
          <select
            value={selectedCourt}
            onChange={(e) => setSelectedCourt(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              background: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              minWidth: '140px',
              color: '#374151',
              outline: 'none'
            }}
          >
            <option value="all">Todas las canchas</option>
            {courts.map(court => (
              <option key={court.id} value={court.id}>{court.name}</option>
            ))}
          </select>

          <div style={{ 
            display: 'flex', 
            background: 'rgba(0, 0, 0, 0.04)',
            borderRadius: '10px',
            padding: '2px'
          }}>
            <button
              onClick={() => {
                setSelectedView('dayGridMonth')
                if (calendarRef.current) {
                  const calendarApi = calendarRef.current.getApi()
                  calendarApi.changeView('dayGridMonth')
                }
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: selectedView === 'dayGridMonth' ? 'white' : 'transparent',
                fontSize: '13px',
                fontWeight: selectedView === 'dayGridMonth' ? '600' : '500',
                color: selectedView === 'dayGridMonth' ? '#111827' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedView === 'dayGridMonth' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none'
              }}
            >
              Mes
            </button>
            <button
              onClick={() => {
                setSelectedView('timeGridWeek')
                if (calendarRef.current) {
                  const calendarApi = calendarRef.current.getApi()
                  calendarApi.changeView('timeGridWeek')
                }
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: selectedView === 'timeGridWeek' ? 'white' : 'transparent',
                fontSize: '13px',
                fontWeight: selectedView === 'timeGridWeek' ? '600' : '500',
                color: selectedView === 'timeGridWeek' ? '#111827' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedView === 'timeGridWeek' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none'
              }}
            >
              Semana
            </button>
            <button
              onClick={() => {
                setSelectedView('timeGridDay')
                if (calendarRef.current) {
                  const calendarApi = calendarRef.current.getApi()
                  calendarApi.changeView('timeGridDay')
                }
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: selectedView === 'timeGridDay' ? 'white' : 'transparent',
                fontSize: '13px',
                fontWeight: selectedView === 'timeGridDay' ? '600' : '500',
                color: selectedView === 'timeGridDay' ? '#111827' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: selectedView === 'timeGridDay' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none'
              }}
            >
              Día
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              background: '#10B981',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(102, 231, 170, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 231, 170, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(102, 231, 170, 0.3)'
            }}
          >
            <Plus size={18} />
            Nueva Reserva
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div style={{ 
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
      }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ color: '#9CA3AF' }}>Cargando calendario...</div>
          </div>
        ) : (
          <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={selectedView}
              locale={esLocale}
              headerToolbar={{
                left: 'title',
                center: '',
                right: 'today prev,next'
              }}
              events={generateOccupancySummaryEvents()}
              selectable={selectedView !== 'dayGridMonth'}
              selectMirror={true}
              select={handleDateSelect}
              eventClick={(clickInfo) => {
                const event = clickInfo.event
                if (event.extendedProps.isOccupancySummary) {
                  // Handle occupancy summary click
                  const dateStr = event.startStr.split('T')[0]
                  const timeStr = event.startStr.split('T')[1].substring(0, 5)
                  const slotStart = new Date(event.startStr)
                  const slotEnd = new Date(event.endStr)
                  
                  // Find all events that overlap with this slot
                  const overlappingEvents = events.filter(e => {
                    const eventStart = new Date(e.start)
                    const eventEnd = new Date(e.end)
                    const eventDate = e.start.split('T')[0]
                    
                    return eventDate === dateStr && 
                           eventStart < slotEnd && 
                           eventEnd > slotStart
                  })
                  
                  setSelectedTimeSlot({
                    date: new Date(event.startStr),
                    time: timeStr,
                    events: overlappingEvents
                  })
                  setShowTimeSlotModal(true)
                } else {
                  handleEventClick(clickInfo)
                }
              }}
              eventDrop={handleEventDrop}
              editable={true}
              dayMaxEvents={true}
              weekends={true}
              height="auto"
              contentHeight={500}
              slotMinTime="07:00"
              slotMaxTime="21:00"
              slotDuration="00:30:00"
              slotLabelInterval="01:00"
              allDaySlot={false}
              nowIndicator={true}
              expandRows={true}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false
              }}
              eventDisplay={selectedView === 'dayGridMonth' ? 'none' : 'block'}
              displayEventTime={selectedView !== 'dayGridMonth'}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false
              }}
              eventContent={(eventInfo) => {
                if (selectedView === 'dayGridMonth') return null;
                
                const event = eventInfo.event;
                
                // Check if it's an occupancy summary
                if (event.extendedProps.isOccupancySummary) {
                  const { occupancyRate, occupiedCourts, totalCourts } = event.extendedProps;
                  
                  return (
                    <div style={{ 
                      padding: '6px 8px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}>
                      <div style={{ 
                        fontWeight: 700,
                        fontSize: '14px',
                        lineHeight: 1.2
                      }}>
                        {occupancyRate}%
                      </div>
                      <div style={{ 
                        fontSize: '10px',
                        opacity: 0.9,
                        marginTop: '2px'
                      }}>
                        {occupiedCourts}/{totalCourts} canchas
                      </div>
                    </div>
                  )
                }
                
                // Regular event display (for day view)
                const courtName = event.extendedProps.courtName || 'Cancha';
                const playerName = event.title;
                
                return (
                  <div style={{ 
                    padding: '4px 6px',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <div style={{ 
                      fontWeight: 600,
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {eventInfo.timeText}
                    </div>
                    <div style={{ 
                      fontSize: '12px',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {playerName}
                    </div>
                    <div style={{ 
                      fontSize: '10px',
                      opacity: 0.8,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {courtName}
                    </div>
                  </div>
                )
              }}
              dateClick={(info) => {
                const dayEvents = events.filter(e => 
                  e.start.startsWith(format(info.date, 'yyyy-MM-dd'))
                )
                setSelectedDayEvents(dayEvents)
                setSelectedDayDate(info.date)
                setShowDayModal(true)
              }}
              dayCellDidMount={(info) => {
                // Solo agregar indicadores en vista mensual y a los días del mes actual
                if (info.isOther) return;
                if (info.view.type !== 'dayGridMonth') return;
                
                // Agregar indicadores personalizados después del número del día
                const dayEvents = events.filter(e => 
                  e.start.startsWith(format(info.date, 'yyyy-MM-dd'))
                )
                const activeEvents = dayEvents.filter(e => e.status !== 'CANCELLED')
                const totalSlots = 14
                const availableSlots = totalSlots - activeEvents.length
                
                // Crear contenedor para indicadores
                const indicatorsContainer = document.createElement('div')
                indicatorsContainer.style.cssText = 'margin-top: 2px; display: flex; flex-direction: column; gap: 2px;'
                
                // Indicador de reservas
                if (activeEvents.length > 0) {
                  const reservasDiv = document.createElement('div')
                  reservasDiv.style.cssText = 'background: #D1FAE5; border-radius: 4px; padding: 1px 4px; font-size: 9px; font-weight: 500; color: #065F46; display: flex; align-items: center; gap: 2px;'
                  
                  const dot1 = document.createElement('div')
                  dot1.style.cssText = 'width: 4px; height: 4px; border-radius: 50%; background: #10B981;'
                  
                  const text1 = document.createElement('span')
                  text1.textContent = `${activeEvents.length} reserva${activeEvents.length !== 1 ? 's' : ''}`
                  
                  reservasDiv.appendChild(dot1)
                  reservasDiv.appendChild(text1)
                  indicatorsContainer.appendChild(reservasDiv)
                }
                
                // Indicador de disponibilidad
                const disponibleDiv = document.createElement('div')
                const bgColor = availableSlots > 7 ? '#E0F2FE' : availableSlots > 3 ? '#FEF3C7' : availableSlots > 0 ? '#FED7AA' : '#FEE2E2'
                const textColor = availableSlots > 7 ? '#075985' : availableSlots > 3 ? '#92400E' : availableSlots > 0 ? '#C2410C' : '#991B1B'
                const dotColor = availableSlots > 7 ? '#0284C7' : availableSlots > 3 ? '#F59E0B' : availableSlots > 0 ? '#EA580C' : '#DC2626'
                
                disponibleDiv.style.cssText = `background: ${bgColor}; border-radius: 4px; padding: 1px 4px; font-size: 9px; font-weight: 500; color: ${textColor}; display: flex; align-items: center; gap: 2px;`
                
                const dot2 = document.createElement('div')
                dot2.style.cssText = `width: 4px; height: 4px; border-radius: 50%; background: ${dotColor};`
                
                const text2 = document.createElement('span')
                text2.textContent = availableSlots > 0 ? `${availableSlots}h libre${availableSlots !== 1 ? 's' : ''}` : 'Completo'
                
                disponibleDiv.appendChild(dot2)
                disponibleDiv.appendChild(text2)
                indicatorsContainer.appendChild(disponibleDiv)
                
                // Agregar al contenedor del día
                info.el.querySelector('.fc-daygrid-day-frame').appendChild(indicatorsContainer)
              }}
            />
          )}
      </div>

      {/* Create Booking Modal */}
      <AppleModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          resetForm()
        }}
        title="Nueva Reserva"
        maxWidth="500px"
      >
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '14px', color: '#516640', marginBottom: '4px', display: 'block' }}>
                Cancha
              </label>
              <select
                value={bookingForm.courtId}
                onChange={(e) => {
                  const court = courts.find(c => c.id === e.target.value)
                  setBookingForm({
                    ...bookingForm,
                    courtId: e.target.value,
                    price: court ? (court.pricePerHour * bookingForm.duration / 60) * 100 : 0
                  })
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  fontSize: '14px'
                }}
              >
                <option value="">Selecciona una cancha</option>
                {courts.map(court => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '14px', color: '#516640', marginBottom: '4px', display: 'block' }}>
                  Fecha
                </label>
                <InputModern
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '14px', color: '#516640', marginBottom: '4px', display: 'block' }}>
                  Hora
                </label>
                <InputModern
                  type="time"
                  value={bookingForm.startTime}
                  onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '14px', color: '#516640', marginBottom: '4px', display: 'block' }}>
                Cliente
              </label>
              <InputModern
                placeholder="Nombre del cliente"
                value={bookingForm.playerName}
                onChange={(e) => setBookingForm({ ...bookingForm, playerName: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '14px', color: '#516640', marginBottom: '4px', display: 'block' }}>
                  Teléfono
                </label>
                <InputModern
                  placeholder="555-1234567"
                  value={bookingForm.playerPhone}
                  onChange={(e) => setBookingForm({ ...bookingForm, playerPhone: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '14px', color: '#516640', marginBottom: '4px', display: 'block' }}>
                  Email (opcional)
                </label>
                <InputModern
                  type="email"
                  placeholder="cliente@email.com"
                  value={bookingForm.playerEmail}
                  onChange={(e) => setBookingForm({ ...bookingForm, playerEmail: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '14px', color: '#516640', marginBottom: '4px', display: 'block' }}>
                  Duración
                </label>
                <select
                  value={bookingForm.duration}
                  onChange={(e) => {
                    const duration = parseInt(e.target.value)
                    const court = courts.find(c => c.id === bookingForm.courtId)
                    setBookingForm({
                      ...bookingForm,
                      duration,
                      price: court ? (court.pricePerHour * duration / 60) * 100 : 0
                    })
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    fontSize: '14px'
                  }}
                >
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                  <option value="120">120 min</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '14px', color: '#516640', marginBottom: '4px', display: 'block' }}>
                  Jugadores
                </label>
                <select
                  value={bookingForm.totalPlayers}
                  onChange={(e) => setBookingForm({ ...bookingForm, totalPlayers: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    fontSize: '14px'
                  }}
                >
                  <option value="2">2 jugadores</option>
                  <option value="3">3 jugadores</option>
                  <option value="4">4 jugadores</option>
                </select>
              </div>
            </div>

            <div style={{ 
              padding: '16px', 
              background: '#F0FDF4', 
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '14px', color: '#516640' }}>Total a pagar</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
                  {formatCurrency(bookingForm.price)}
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={bookingForm.splitPayment}
                  onChange={(e) => setBookingForm({ ...bookingForm, splitPayment: e.target.checked })}
                />
                <span style={{ fontSize: '14px', color: '#516640' }}>Pago dividido</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <ButtonModern
                variant="secondary"
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
              >
                Cancelar
              </ButtonModern>
              <ButtonModern
                variant="primary"
                onClick={handleCreateBooking}
                disabled={!bookingForm.courtId || !bookingForm.playerName || !bookingForm.playerPhone}
                style={{
                  background: '#10B981',
                  border: 'none',
                  color: 'white',
                  fontWeight: 600
                }}
              >
                Crear Reserva
              </ButtonModern>
            </div>
          </div>
        </div>
      </AppleModal>

      {/* Event Details Modal */}
      <AppleModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false)
          setSelectedEvent(null)
        }}
        title="Detalles de Reserva"
        maxWidth="450px"
      >
        {selectedEvent && (
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ 
                padding: '12px', 
                background: '#F0FDF4', 
                borderRadius: '8px' 
              }}>
                <div style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Cliente</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#182A01' }}>
                  {selectedEvent.playerName}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Teléfono</div>
                  <div style={{ fontSize: '14px', color: '#182A01' }}>{selectedEvent.playerPhone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Cancha</div>
                  <div style={{ fontSize: '14px', color: '#182A01' }}>{selectedEvent.courtName}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Horario</div>
                  <div style={{ fontSize: '14px', color: '#182A01' }}>
                    {selectedEvent.start.split('T')[1].substring(0, 5)} - {selectedEvent.end.split('T')[1].substring(0, 5)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Jugadores</div>
                  <div style={{ fontSize: '14px', color: '#182A01' }}>{selectedEvent.totalPlayers}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Estado</div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: selectedEvent.status === 'CONFIRMED' ? '#D1FAE5' : '#FEE2E2',
                    color: selectedEvent.status === 'CONFIRMED' ? '#065F46' : '#991B1B'
                  }}>
                    {selectedEvent.status === 'CONFIRMED' ? 'Confirmado' : 'Cancelado'}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Pago</div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: selectedEvent.paymentStatus === 'completed' ? '#D1FAE5' : '#FED7AA',
                    color: selectedEvent.paymentStatus === 'completed' ? '#065F46' : '#92400E'
                  }}>
                    {selectedEvent.paymentStatus === 'completed' ? 'Pagado' : 'Pendiente'}
                  </span>
                </div>
              </div>

              <div style={{ 
                padding: '12px', 
                background: '#F0FDF4', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Total</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#182A01' }}>
                  {formatCurrency(selectedEvent.price)}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <ButtonModern
                  variant="secondary"
                  onClick={() => {
                    setShowEventModal(false)
                    setSelectedEvent(null)
                  }}
                  style={{ flex: 1 }}
                >
                  Cerrar
                </ButtonModern>
                <ButtonModern
                  variant="primary"
                  onClick={() => {
                    // TODO: Implement check-in
                    notify.success('Check-in realizado')
                    setShowEventModal(false)
                  }}
                  style={{ 
                    flex: 1,
                    background: '#10B981',
                    border: 'none',
                    color: 'white',
                    fontWeight: 600
                  }}
                >
                  Check-in
                </ButtonModern>
                <ButtonModern
                  variant="danger"
                  onClick={() => {
                    // TODO: Implement cancel
                    notify.error('Reserva cancelada')
                    setShowEventModal(false)
                  }}
                  style={{ flex: 1 }}
                >
                  Cancelar
                </ButtonModern>
              </div>
            </div>
          </div>
        )}
      </AppleModal>

      {/* Day Detail Modal */}
      <AppleModal
        isOpen={showDayModal}
        onClose={() => {
          setShowDayModal(false)
          setSelectedDayEvents([])
          setSelectedDayDate(null)
        }}
        title={selectedDayDate ? format(selectedDayDate, "EEEE, d 'de' MMMM", { locale: es }) : ''}
        maxWidth="600px"
      >
        <div style={{ padding: '20px' }}>
          {/* Day Stats */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '12px',
              background: '#D1FAE5',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#065F46' }}>
                {selectedDayEvents.filter(e => e.status !== 'CANCELLED').length}
              </div>
              <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>
                Reservas activas
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: '#FEF3C7',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#92400E' }}>
                {14 - selectedDayEvents.filter(e => e.status !== 'CANCELLED').length}
              </div>
              <div style={{ fontSize: '12px', color: '#92400E', marginTop: '4px' }}>
                Horarios disponibles
              </div>
            </div>
            <div style={{
              padding: '12px',
              background: '#DBEAFE',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#1E40AF' }}>
                {formatCurrency(selectedDayEvents.reduce((sum, e) => sum + e.price, 0))}
              </div>
              <div style={{ fontSize: '12px', color: '#1E40AF', marginTop: '4px' }}>
                Ingresos del día
              </div>
            </div>
          </div>

          {/* Available Hours */}
          <div style={{
            padding: '12px',
            background: '#F9FAFB',
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Horarios Disponibles
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30'].map(time => {
                const isBooked = selectedDayEvents.some(e => 
                  e.start.includes(`T${time}`)
                )
                return (
                  <span
                    key={time}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: isBooked ? '#FEE2E2' : '#D1FAE5',
                      color: isBooked ? '#991B1B' : '#065F46',
                      textDecoration: isBooked ? 'line-through' : 'none'
                    }}
                  >
                    {time}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Events List */}
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
            Reservas del día ({selectedDayEvents.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {selectedDayEvents.length === 0 ? (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center', 
                color: '#9CA3AF',
                background: '#F9FAFB',
                borderRadius: '10px'
              }}>
                No hay reservas para este día
              </div>
            ) : (
              selectedDayEvents
                .sort((a, b) => a.start.localeCompare(b.start))
                .map(event => (
                  <div
                    key={event.id}
                    style={{
                      padding: '12px',
                      background: getEventColor(event.status, event.paymentStatus, event.type),
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onClick={() => {
                      setSelectedEvent(event)
                      setShowEventModal(true)
                      setShowDayModal(false)
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                          {event.start.split('T')[1].substring(0, 5)} - {event.end.split('T')[1].substring(0, 5)}
                        </div>
                        <div style={{ fontSize: '13px', color: '#374151' }}>
                          {event.playerName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                          {event.courtName} • {event.totalPlayers} jugadores
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', color: '#065F46' }}>
                          {formatCurrency(event.price)}
                        </div>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600',
                          background: event.paymentStatus === 'completed' ? '#10B981' : '#F59E0B',
                          color: 'white',
                          marginTop: '4px',
                          display: 'inline-block'
                        }}>
                          {event.paymentStatus === 'completed' ? 'PAGADO' : 'PENDIENTE'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <ButtonModern
              variant="secondary"
              onClick={() => {
                setShowDayModal(false)
                setSelectedDayEvents([])
              }}
              style={{ flex: 1 }}
            >
              Cerrar
            </ButtonModern>
            <ButtonModern
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => {
                setShowDayModal(false)
                setBookingForm({
                  ...bookingForm,
                  date: selectedDayDate ? format(selectedDayDate, 'yyyy-MM-dd') : ''
                })
                setShowCreateModal(true)
              }}
              style={{ 
                flex: 1,
                background: '#10B981',
                border: 'none',
                color: 'white',
                fontWeight: 600
              }}
            >
              Nueva Reserva
            </ButtonModern>
          </div>
        </div>
      </AppleModal>

      {/* Time Slot Detail Modal */}
      <AppleModal
        isOpen={showTimeSlotModal}
        onClose={() => {
          setShowTimeSlotModal(false)
          setSelectedTimeSlot(null)
        }}
        title={selectedTimeSlot ? `${format(selectedTimeSlot.date, "EEEE, d 'de' MMMM", { locale: es })} - ${selectedTimeSlot.time}` : ''}
        maxWidth="700px"
      >
        {selectedTimeSlot && (
          <div style={{ padding: '20px' }}>
            {/* Occupancy Overview */}
            <div style={{
              background: 'linear-gradient(135deg, #D1FAE5 0%, #A4DF4E 100%)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', color: '#065F46', marginBottom: '8px' }}>
                Ocupación del horario
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#052E16' }}>
                {(() => {
                  const occupiedCourtIds = new Set(selectedTimeSlot.events.map(e => e.courtId))
                  return Math.round((occupiedCourtIds.size / (courts.length || 4)) * 100)
                })()}%
              </div>
              <div style={{ fontSize: '16px', color: '#065F46', marginTop: '8px' }}>
                {new Set(selectedTimeSlot.events.map(e => e.courtId)).size} de {courts.length || 4} canchas reservadas
              </div>
            </div>

            {/* Courts Grid */}
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#374151', 
              marginBottom: '16px' 
            }}>
              Estado por Cancha
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '12px',
              marginBottom: '24px'
            }}>
              {courts.map(court => {
                // Check if this court has any booking that overlaps with this time slot
                const booking = selectedTimeSlot.events.find(e => e.courtId === court.id)
                const isAvailable = !booking
                
                return (
                  <div
                    key={court.id}
                    style={{
                      padding: '16px',
                      borderRadius: '10px',
                      border: `2px solid ${isAvailable ? '#10B981' : '#FCA5A5'}`,
                      background: isAvailable ? '#F0FDF4' : '#FEF2F2',
                      transition: 'all 0.2s',
                      cursor: isAvailable ? 'pointer' : 'default'
                    }}
                    onClick={() => {
                      if (isAvailable) {
                        setShowTimeSlotModal(false)
                        setBookingForm({
                          ...bookingForm,
                          courtId: court.id,
                          date: format(selectedTimeSlot.date, 'yyyy-MM-dd'),
                          startTime: selectedTimeSlot.time
                        })
                        setShowCreateModal(true)
                      }
                    }}
                    onMouseEnter={(e) => {
                      if (isAvailable) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'start',
                      marginBottom: '8px'
                    }}>
                      <div>
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '15px',
                          color: '#111827',
                          marginBottom: '4px'
                        }}>
                          {court.name}
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: isAvailable ? '#10B981' : '#EF4444',
                        color: 'white'
                      }}>
                        {isAvailable ? 'DISPONIBLE' : 'OCUPADA'}
                      </span>
                    </div>
                    
                    {booking && (
                      <div style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(0, 0, 0, 0.1)'
                      }}>
                        <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
                          <strong>Cliente:</strong> {booking.playerName}
                        </div>
                        <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
                          <strong>Horario:</strong> {booking.start.split('T')[1].substring(0, 5)} - {booking.end.split('T')[1].substring(0, 5)}
                        </div>
                        <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
                          <strong>Teléfono:</strong> {booking.playerPhone}
                        </div>
                        <div style={{ fontSize: '13px', color: '#374151' }}>
                          <strong>Jugadores:</strong> {booking.totalPlayers}
                        </div>
                      </div>
                    )}
                    
                    {isAvailable && (
                      <div style={{
                        marginTop: '12px',
                        textAlign: 'center',
                        color: '#10B981',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        Click para reservar →
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Quick Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                padding: '12px',
                background: '#DBEAFE',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1E40AF' }}>
                  {courts.length - new Set(selectedTimeSlot.events.map(e => e.courtId)).size}
                </div>
                <div style={{ fontSize: '11px', color: '#1E40AF', marginTop: '2px' }}>
                  Canchas libres
                </div>
              </div>
              <div style={{
                padding: '12px',
                background: '#D1FAE5',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#065F46' }}>
                  {formatCurrency(selectedTimeSlot.events.reduce((sum, e) => sum + e.price, 0))}
                </div>
                <div style={{ fontSize: '11px', color: '#065F46', marginTop: '2px' }}>
                  Ingresos
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <ButtonModern
                variant="secondary"
                onClick={() => {
                  setShowTimeSlotModal(false)
                  setSelectedTimeSlot(null)
                }}
                style={{ flex: 1 }}
              >
                Cerrar
              </ButtonModern>
              <ButtonModern
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => {
                  setShowTimeSlotModal(false)
                  setBookingForm({
                    ...bookingForm,
                    date: format(selectedTimeSlot.date, 'yyyy-MM-dd'),
                    startTime: selectedTimeSlot.time
                  })
                  setShowCreateModal(true)
                }}
                style={{ 
                  flex: 1,
                  background: '#10B981',
                  border: 'none',
                  color: 'white',
                  fontWeight: 600
                }}
              >
                Nueva Reserva
              </ButtonModern>
            </div>
          </div>
        )}
      </AppleModal>

      <style jsx global>{`
        .fc {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
          --fc-border-color: rgba(0, 0, 0, 0.06);
          --fc-event-border-radius: 12px;
        }
        
        .fc-theme-standard td,
        .fc-theme-standard th {
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        
        .fc-theme-standard .fc-scrollgrid {
          border: none;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        
        .fc-scrollgrid-section-header .fc-scrollgrid-section-sticky > * {
          background: white;
        }
        
        .fc-daygrid-body {
          border: none !important;
        }
        
        .fc-button {
          background: white !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
          color: #374151 !important;
          font-weight: 500;
          border-radius: 10px !important;
          padding: 8px 14px !important;
          transition: all 0.2s !important;
          font-size: 13px;
          text-transform: none !important;
        }
        
        .fc-button:hover:not(:disabled) {
          background: #F9FAFB !important;
          border-color: rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }
        
        .fc-button:focus {
          box-shadow: 0 0 0 2px rgba(102, 231, 170, 0.2) !important;
        }
        
        .fc-button-primary:not(:disabled).fc-button-active,
        .fc-button-primary:not(:disabled):active {
          background: #66E7AA !important;
          border-color: #66E7AA !important;
          color: white !important;
        }
        
        .fc-button-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .fc-col-header {
          background: white;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        
        .fc-col-header-cell {
          background: white;
          font-weight: 500;
          color: #6B7280;
          padding: 16px 0;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 1px;
          border: none !important;
        }
        
        .fc-col-header-cell-cushion {
          color: #6B7280;
        }
        
        .fc-timegrid-slot-label {
          color: #6B7280;
          font-size: 11px;
          padding-right: 8px;
        }
        
        .fc-timegrid-slot {
          height: 48px !important;
        }
        
        .fc-timegrid-axis {
          width: 60px !important;
        }
        
        .fc-timegrid-axis-frame {
          justify-content: flex-end;
        }
        
        .fc-timegrid-axis-cushion {
          font-size: 12px;
          color: #6B7280;
          font-weight: 500;
        }
        
        .fc-timegrid-event {
          border-radius: 8px !important;
          border: none !important;
          font-size: 11px;
          padding: 4px 6px;
          overflow: hidden;
        }
        
        .fc-timegrid-event-harness-inset .fc-timegrid-event {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
          margin: 0 2px;
        }
        
        .fc-timegrid-now-indicator-line {
          border-color: #10B981;
          border-width: 2px;
        }
        
        .fc-timegrid-now-indicator-arrow {
          border-color: #10B981;
        }
        
        .fc-timegrid .fc-daygrid-body {
          display: none;
        }
        
        .fc-col-header-cell-cushion {
          padding: 8px 4px;
        }
        
        .fc-timegrid-axis-cushion {
          text-align: right;
          padding-right: 4px;
        }
        
        .fc-timegrid-divider {
          display: none;
        }
        
        /* Week view specific styles */
        .fc-timeGridWeek-view .fc-col-header-cell {
          font-weight: 600;
          padding: 12px 4px;
        }
        
        .fc-timeGridWeek-view .fc-daygrid-day-number {
          font-size: 14px;
          font-weight: 600;
        }
        
        .fc-timegrid-slot-minor {
          border-top-style: dotted;
          border-top-color: rgba(0, 0, 0, 0.04);
        }
        
        .fc-timegrid-col {
          position: relative;
        }
        
        .fc-timegrid-col:not(:last-child) {
          border-right: 1px solid rgba(0, 0, 0, 0.06);
        }
        
        .fc-timegrid-col.fc-day-today {
          background: rgba(102, 231, 170, 0.03);
        }
        
        /* Day view specific */
        .fc-timeGridDay-view .fc-col-header-cell {
          font-weight: 600;
          font-size: 16px;
          padding: 16px 4px;
        }
        
        .fc-timeGridDay-view .fc-timegrid-slot {
          height: 60px !important;
        }
        
        .fc-event {
          border-radius: 8px;
          padding: 3px 8px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: none !important;
          font-weight: 500;
          margin-bottom: 2px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
        }
        
        .fc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
          filter: brightness(0.95);
        }
        
        .fc-event-main {
          color: inherit;
          padding: 1px 2px;
        }
        
        .fc-event-title {
          font-weight: 500;
          color: #1F2937;
        }
        
        .fc-event-time {
          font-weight: 400;
          color: #6B7280;
          font-size: 11px;
        }
        
        .fc-daygrid-event {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .fc-daygrid-dot-event {
          padding: 2px 4px;
        }
        
        .fc-daygrid-event-harness {
          margin: 0 2px;
        }
        
        .fc-daygrid-more-link {
          color: #059669;
          font-weight: 500;
          font-size: 11px;
          margin-top: 2px;
        }
        
        .fc-daygrid-more-link:hover {
          color: #047857;
          text-decoration: underline;
        }
        
        .fc-daygrid-day {
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
        }
        
        .fc-daygrid-day-frame {
          min-height: 65px;
          padding: 3px 4px;
        }
        
        .fc-daygrid-day-number {
          color: #374151;
          font-weight: 500;
          font-size: 13px;
          padding: 0;
          margin-bottom: 2px;
        }
        
        .fc-day-today {
          background: rgba(102, 231, 170, 0.06) !important;
        }
        
        .fc-day-today .fc-daygrid-day-number {
          background: #10B981;
          color: white !important;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 12px;
          line-height: 1;
          padding: 0;
          margin: 0;
        }
        
        .fc-day-other {
          visibility: hidden;
        }
        
        .fc-day-other .fc-daygrid-day-number {
          display: none;
        }
        
        .fc-daygrid-day:hover:not(.fc-day-today) {
          background: rgba(0, 0, 0, 0.02);
          cursor: pointer;
        }
        
        .fc-daygrid-day.fc-day-sat,
        .fc-daygrid-day.fc-day-sun {
          background: rgba(0, 0, 0, 0.01);
        }
        
        .fc-timegrid-slot:hover {
          background: rgba(164, 223, 78, 0.03);
        }
        
        .fc-toolbar-title {
          font-size: 22px !important;
          font-weight: 600;
          color: #111827;
          letter-spacing: -0.5px;
        }
        
        .fc-toolbar {
          margin-bottom: 24px !important;
          padding: 0 4px;
        }
        
        .fc-toolbar-chunk {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .fc-today-button {
          background: white !important;
          border: 1px solid #66E7AA !important;
          color: #66E7AA !important;
          font-weight: 500;
        }
        
        .fc-today-button:hover:not(:disabled) {
          background: rgba(102, 231, 170, 0.08) !important;
          border-color: #66E7AA !important;
        }
        
        .fc-prev-button,
        .fc-next-button {
          background: white !important;
          border: 1px solid rgba(0, 0, 0, 0.1) !important;
          color: #6B7280 !important;
          padding: 8px !important;
          width: 36px;
          height: 36px;
        }
        
        .fc-prev-button:hover:not(:disabled),
        .fc-next-button:hover:not(:disabled) {
          background: #F9FAFB !important;
          border-color: rgba(0, 0, 0, 0.15) !important;
        }
        
        .fc-button-group {
          gap: 4px;
          display: flex;
        }
        
        .fc-button-group .fc-button {
          margin: 0 !important;
        }
        
        .fc-popover {
          border: none !important;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
          background: white;
        }
        
        .fc-popover-header {
          background: #F9FAFB !important;
          padding: 12px 16px;
          font-weight: 600;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        
        .fc-popover-body {
          padding: 12px;
        }
        
        .day-busy {
          background: rgba(245, 158, 11, 0.05);
        }
        
        .day-full {
          background: rgba(239, 68, 68, 0.05);
        }
        
        .fc-list-event:hover td {
          background: rgba(164, 223, 78, 0.05);
        }
        
        .fc-h-event {
          background: linear-gradient(135deg, #66E7AA 0%, #A4DF4E 100%);
          border: none;
        }
        
        .fc-timegrid-event {
          border-radius: 6px;
        }
        
        .fc-direction-ltr .fc-daygrid-event.fc-event-end,
        .fc-direction-ltr .fc-daygrid-event.fc-event-start {
          margin-left: 2px;
          margin-right: 2px;
        }
      `}</style>
    </>
  )
}

export default function CalendarPage() {
  return (
    <ModernDashboardLayout>
      <CalendarPageContent />
    </ModernDashboardLayout>
  )
}