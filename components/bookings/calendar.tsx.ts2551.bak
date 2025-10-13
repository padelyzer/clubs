'use client'

import { useState, useEffect } from 'react'
import { 
  format, 
  addDays, 
  startOfWeek, 
  endOfWeek, 
  isSameDay, 
  isToday, 
  startOfDay,
  addWeeks,
  subWeeks,
  getHours,
  setHours,
  setMinutes,
  parse,
  addMinutes,
  isBefore,
  isAfter
} from 'date-fns'
import { es } from 'date-fns/locale'

interface CalendarEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  date: Date
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  court: {
    id: string
    name: string
  }
  playerName: string
  playerPhone: string
  checkedIn: boolean
  splitPaymentEnabled: boolean
  splitPaymentProgress?: number
  splitPaymentCount: number
}

interface CalendarProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onTimeSlotClick: (date: Date, time: string, courtId: string) => void
  courts: Array<{
    id: string
    name: string
    active: boolean
  }>
  operatingHours: {
    start: string // "07:00"
    end: string   // "22:00"
  }
  view?: 'week' | 'day'
  selectedDate?: Date
}

export function Calendar({
  events,
  onEventClick,
  onTimeSlotClick,
  courts,
  operatingHours,
  view = 'week',
  selectedDate = new Date()
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate)
  const [currentView, setCurrentView] = useState(view)
  
  // DEBUG: Log current calendar state
  console.log('📅 Calendar component - selectedDate prop:', selectedDate, 'Month:', selectedDate.getMonth() + 1)
  console.log('📅 Calendar component - currentDate state:', currentDate, 'Month:', currentDate.getMonth() + 1)
  
  // Update currentDate when selectedDate prop changes
  useEffect(() => {
    console.log('📅 Calendar useEffect - selectedDate prop changed to:', selectedDate, 'Month:', selectedDate.getMonth() + 1)
    setCurrentDate(selectedDate)
  }, [selectedDate])

  const activeCourts = courts.filter(court => court.active)
  
  // Generate time slots
  const generateTimeSlots = () => {
    const slots = []
    const startTime = parse(operatingHours.start, 'HH:mm', new Date())
    const endTime = parse(operatingHours.end, 'HH:mm', new Date())
    
    let currentTime = startTime
    while (isBefore(currentTime, endTime)) {
      slots.push(format(currentTime, 'HH:mm'))
      currentTime = addMinutes(currentTime, 30) // 30-minute intervals
    }
    
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Get dates for current view
  const getViewDates = () => {
    if (currentView === 'day') {
      return [currentDate]
    }
    
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
    const days = []
    
    let day = weekStart
    while (day <= weekEnd) {
      days.push(day)
      day = addDays(day, 1)
    }
    
    return days
  }

  const viewDates = getViewDates()

  // Get events for a specific date and time slot
  const getEventsForSlot = (date: Date, timeSlot: string, courtId: string) => {
    return events.filter(event => {
      if (!isSameDay(event.date, date) || event.court.id !== courtId) {
        return false
      }
      
      const eventStart = parse(event.startTime, 'HH:mm', new Date())
      const eventEnd = parse(event.endTime, 'HH:mm', new Date())
      const slotTime = parse(timeSlot, 'HH:mm', new Date())
      const slotEnd = addMinutes(slotTime, 30)
      
      // Check if event overlaps with this time slot
      return (eventStart < slotEnd && eventEnd > slotTime)
    })
  }

  const getEventStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-[var(--warning-wash)] border-[var(--warning)]/20 text-[var(--warning)]',
      CONFIRMED: 'bg-[var(--success-wash)] border-[var(--success)]/20 text-[var(--success)]',
      IN_PROGRESS: 'bg-[var(--info-wash)] border-[var(--info)]/20 text-[var(--info)]',
      COMPLETED: 'bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-[var(--text-secondary)]',
      CANCELLED: 'bg-[var(--danger-wash)] border-[var(--danger)]/20 text-[var(--danger)]',
      NO_SHOW: 'bg-[var(--warning-wash)] border-[var(--warning)]/20 text-[var(--warning)]'
    }
    return colors[status as keyof typeof colors] || 'bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-[var(--text-secondary)]'
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentDate(currentView === 'week' ? subWeeks(currentDate, 1) : addDays(currentDate, -1))
    } else {
      setCurrentDate(currentView === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="bg-[var(--bg-primary)] rounded-[var(--radius-lg)] border border-[var(--border-primary)] overflow-hidden">
      {/* Calendar Header */}
      <div className="p-[var(--spacing-4)] border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {currentView === 'week' 
                ? `Semana del ${format(viewDates[0], 'd MMM', { locale: es })} - ${format(viewDates[6], 'd MMM yyyy', { locale: es })}`
                : format(currentDate, 'eeee d MMMM yyyy', { locale: es })
              }
              <span className="text-sm text-red-500 ml-2">DEBUG: Mes {currentDate.getMonth() + 1}</span>
            </h2>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateWeek('prev')}
                className="px-[var(--spacing-3)] py-[var(--spacing-1)] text-sm font-medium rounded-[var(--radius-md)] bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-[var(--transition-base)]"
              >
                ←
              </button>
              <button
                onClick={goToToday}
                className="px-[var(--spacing-3)] py-[var(--spacing-1)] text-sm font-medium rounded-[var(--radius-md)] bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-[var(--transition-base)]"
              >
                Hoy
              </button>
              <button
                onClick={() => navigateWeek('next')}
                className="px-[var(--spacing-3)] py-[var(--spacing-1)] text-sm font-medium rounded-[var(--radius-md)] bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-[var(--transition-base)]"
              >
                →
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('day')}
              className={`px-[var(--spacing-3)] py-[var(--spacing-1)] text-sm font-medium rounded-[var(--radius-md)] transition-[var(--transition-base)] ${currentView === 'day' ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)]' : 'bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
            >
              Día
            </button>
            <button
              onClick={() => setCurrentView('week')}
              className={`px-[var(--spacing-3)] py-[var(--spacing-1)] text-sm font-medium rounded-[var(--radius-md)] transition-[var(--transition-base)] ${currentView === 'week' ? 'bg-[var(--accent-primary)] text-[var(--text-inverse)]' : 'bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Date Headers */}
          <div className="grid" style={{ gridTemplateColumns: `120px repeat(${viewDates.length * activeCourts.length}, 1fr)` }}>
            <div className="p-[var(--spacing-3)] border-b border-[var(--border-primary)] bg-[var(--bg-secondary)] text-sm font-medium text-[var(--text-primary)]">
              Horario
            </div>
            {viewDates.map(date => (
              activeCourts.map(court => (
                <div
                  key={`${format(date, 'yyyy-MM-dd')}-${court.id}`}
                  className={`p-[var(--spacing-3)] border-b border-[var(--border-primary)] text-center text-sm font-medium ${
                    isToday(date) ? 'bg-[var(--accent-wash)] text-[var(--accent-primary)]' : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                  }`}
                >
                  <div className="truncate">
                    {format(date, currentView === 'week' ? 'EEE d' : 'eeee d MMM', { locale: es })}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1 truncate">
                    {court.name}
                  </div>
                </div>
              ))
            ))}
          </div>

          {/* Time Slots */}
          {timeSlots.map(timeSlot => (
            <div
              key={timeSlot}
              className="grid border-b border-[var(--border-tertiary)]"
              style={{ gridTemplateColumns: `120px repeat(${viewDates.length * activeCourts.length}, 1fr)` }}
            >
              {/* Time Label */}
              <div className="p-[var(--spacing-3)] text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-secondary)] border-r border-[var(--border-primary)]">
                {timeSlot}
              </div>

              {/* Calendar Cells */}
              {viewDates.map(date =>
                activeCourts.map(court => {
                  const slotEvents = getEventsForSlot(date, timeSlot, court.id)
                  const hasEvent = slotEvents.length > 0
                  
                  return (
                    <div
                      key={`${format(date, 'yyyy-MM-dd')}-${court.id}-${timeSlot}`}
                      className={`relative min-h-[60px] border-r border-[var(--border-tertiary)] p-1 cursor-pointer transition-[var(--transition-base)] ${
                        hasEvent 
                          ? 'bg-[var(--bg-primary)]' 
                          : 'hover:bg-[var(--accent-wash)]'
                      }`}
                      onClick={() => {
                        if (hasEvent && slotEvents[0]) {
                          onEventClick(slotEvents[0])
                        } else {
                          onTimeSlotClick(date, timeSlot, court.id)
                        }
                      }}
                    >
                      {slotEvents.map(event => (
                        <div
                          key={event.id}
                          className={`absolute inset-1 rounded-[var(--radius-sm)] p-[var(--spacing-2)] text-xs border cursor-pointer transition-all hover:shadow-[var(--shadow-sm)] ${getEventStatusColor(event.status)}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEventClick(event)
                          }}
                        >
                          <div className="font-medium truncate">
                            {event.playerName}
                          </div>
                          <div className="text-xs opacity-75 truncate">
                            {event.startTime} - {event.endTime}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            {event.checkedIn && (
                              <span className="text-xs font-bold text-green-600">OK</span>
                            )}
                            {event.splitPaymentEnabled && (
                              <span className="text-xs">
                                Pago {event.splitPaymentProgress || 0}/{event.splitPaymentCount}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Empty slot indicator */}
                      {!hasEvent && (
                        <div className="absolute inset-1 rounded-[var(--radius-sm)] border-2 border-dashed border-[var(--border-primary)] flex items-center justify-center opacity-0 hover:opacity-50 transition-opacity">
                          <span className="text-xs text-[var(--text-quaternary)]">+</span>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="p-[var(--spacing-4)] border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-[var(--warning-wash)] border border-[var(--warning)]/20 rounded-[var(--radius-sm)]"></div>
              <span className="text-[var(--text-primary)]">Pendiente</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-[var(--success-wash)] border border-[var(--success)]/20 rounded-[var(--radius-sm)]"></div>
              <span className="text-[var(--text-primary)]">Confirmada</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-[var(--info-wash)] border border-[var(--info)]/20 rounded-[var(--radius-sm)]"></div>
              <span className="text-[var(--text-primary)]">En Juego</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-[var(--danger-wash)] border border-[var(--danger)]/20 rounded-[var(--radius-sm)]"></div>
              <span className="text-[var(--text-primary)]">Cancelada</span>
            </div>
          </div>
          
          <div className="text-xs text-[var(--text-tertiary)]">
            Haz click en un horario vacío para crear una reserva
          </div>
        </div>
      </div>
    </div>
  )
}