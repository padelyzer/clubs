'use client'

import { useState, useEffect } from 'react'
import { format, addMinutes, parse, isBefore, isAfter } from 'date-fns'

interface TimeSlot {
  time: string
  available: boolean
  conflictingBooking?: {
    id: string
    playerName: string
    endTime: string
  }
}

interface TimeSlotSelectorProps {
  selectedDate: Date
  selectedTime?: string
  selectedDuration: number
  onTimeSelect: (time: string) => void
  operatingHours: {
    start: string // "07:00"
    end: string   // "22:00"
  }
  existingBookings: Array<{
    id: string
    startTime: string
    endTime: string
    playerName: string
    status: string
  }>
  slotInterval?: number // minutes between slots
}

export function TimeSlotSelector({
  selectedDate,
  selectedTime,
  selectedDuration,
  onTimeSelect,
  operatingHours,
  existingBookings,
  slotInterval = 30
}: TimeSlotSelectorProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])

  useEffect(() => {
    generateTimeSlots()
  }, [selectedDate, selectedDuration, existingBookings, operatingHours])

  const generateTimeSlots = () => {
    const slots: TimeSlot[] = []
    const now = new Date()
    
    // Asegurar que selectedDate es un objeto Date válido
    const dateToCheck = selectedDate instanceof Date ? selectedDate : new Date(selectedDate)
    const isToday = dateToCheck.toDateString() === now.toDateString()
    
    console.log('TimeSlotSelector DEBUG:', {
      now: format(now, 'yyyy-MM-dd HH:mm:ss'),
      selectedDate: format(dateToCheck, 'yyyy-MM-dd'),
      isToday,
      operatingHours
    })
    
    let startTime = parse(operatingHours.start, 'HH:mm', new Date())
    const endTime = parse(operatingHours.end, 'HH:mm', new Date())
    
    // Si es hoy, ajustar el horario de inicio para que sea al menos 2 minutos después de ahora
    if (isToday) {
      const currentTimeWithBuffer = addMinutes(now, 2)
      const currentHour = currentTimeWithBuffer.getHours()
      const currentMinutes = currentTimeWithBuffer.getMinutes()
      
      console.log('Current time with buffer:', format(currentTimeWithBuffer, 'HH:mm'))
      
      // Redondear al siguiente slot de 30 minutos
      let nextSlotHour = currentHour
      let nextSlotMinutes: number
      
      if (currentMinutes <= 0) {
        nextSlotMinutes = 0
      } else if (currentMinutes <= 30) {
        nextSlotMinutes = 30
      } else {
        // Si estamos después del minuto 30, ir a la siguiente hora
        nextSlotHour = currentHour + 1
        nextSlotMinutes = 0
      }
      
      // Crear el tiempo ajustado
      const adjustedStartTime = parse(`${nextSlotHour.toString().padStart(2, '0')}:${nextSlotMinutes.toString().padStart(2, '0')}`, 'HH:mm', new Date())
      
      console.log('Adjusted start time:', format(adjustedStartTime, 'HH:mm'))
      
      // Usar el tiempo ajustado como inicio si es después del horario de apertura
      if (isAfter(adjustedStartTime, startTime)) {
        startTime = adjustedStartTime
        console.log('Using adjusted start time:', format(startTime, 'HH:mm'))
      } else {
        console.log('Using operating hours start time:', format(startTime, 'HH:mm'))
      }
    }
    
    let currentTime = startTime
    
    // Asegurar que siempre empezamos en un slot de 00 o 30 minutos
    const startMinutes = currentTime.getMinutes()
    if (startMinutes !== 0 && startMinutes !== 30) {
      // Redondear al siguiente slot de 30 minutos
      if (startMinutes < 30) {
        currentTime.setMinutes(30)
      } else {
        currentTime.setHours(currentTime.getHours() + 1)
        currentTime.setMinutes(0)
      }
    }
    
    while (isBefore(currentTime, endTime)) {
      const timeString = format(currentTime, 'HH:mm')
      const endTimeForSlot = addMinutes(currentTime, selectedDuration)
      const endTimeString = format(endTimeForSlot, 'HH:mm')
      
      // Check if this slot would go beyond operating hours
      if (isAfter(endTimeForSlot, endTime)) {
        break
      }
      
      // Check for conflicts with existing bookings
      const conflict = checkForConflict(timeString, endTimeString)
      
      slots.push({
        time: timeString,
        available: !conflict.hasConflict,
        conflictingBooking: conflict.conflictingBooking
      })
      
      // Siempre avanzar 30 minutos para mantener los slots en 00 y 30
      currentTime = addMinutes(currentTime, 30)
    }
    
    setTimeSlots(slots)
  }

  const checkForConflict = (startTime: string, endTime: string) => {
    const activeBookings = existingBookings.filter(booking => 
      booking.status !== 'CANCELLED'
    )
    
    for (const booking of activeBookings) {
      // Check if new slot overlaps with existing booking
      const bookingStart = parse(booking.startTime, 'HH:mm', new Date())
      const bookingEnd = parse(booking.endTime, 'HH:mm', new Date())
      const slotStart = parse(startTime, 'HH:mm', new Date())
      const slotEnd = parse(endTime, 'HH:mm', new Date())
      
      // Overlap conditions:
      // 1. New slot starts during existing booking
      // 2. New slot ends during existing booking  
      // 3. New slot completely contains existing booking
      // 4. Existing booking completely contains new slot
      const hasOverlap = (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotStart <= bookingStart && slotEnd >= bookingEnd) ||
        (bookingStart <= slotStart && bookingEnd >= slotEnd)
      )
      
      if (hasOverlap) {
        return {
          hasConflict: true,
          conflictingBooking: {
            id: booking.id,
            playerName: booking.playerName,
            endTime: booking.endTime
          }
        }
      }
    }
    
    return { hasConflict: false }
  }

  const formatTimeRange = (startTime: string) => {
    const start = parse(startTime, 'HH:mm', new Date())
    const end = addMinutes(start, selectedDuration)
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
  }

  const getSlotClasses = (slot: TimeSlot) => {
    const baseClasses = "relative p-3 rounded-lg border transition-all duration-200 cursor-pointer text-center"
    
    if (!slot.available) {
      return `${baseClasses} bg-red-50 border-red-200 text-red-600 cursor-not-allowed`
    }
    
    if (selectedTime === slot.time) {
      return `${baseClasses} bg-green-500 border-green-500 text-white shadow-md`
    }
    
    return `${baseClasses} bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300`
  }

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available) {
      onTimeSelect(slot.time)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Horarios Disponibles</h3>
        <div className="text-sm text-gray-600">
          Duración: {selectedDuration} min
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
          <span className="text-gray-600">Disponible</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Seleccionado</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
          <span className="text-gray-600">Ocupado</span>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {timeSlots.map((slot) => (
          <div
            key={slot.time}
            className={getSlotClasses(slot)}
            onClick={() => handleSlotClick(slot)}
          >
            <div className="font-medium">
              {slot.time}
            </div>
            <div className="text-xs mt-1 opacity-75">
              {selectedDuration}min
            </div>
            
            {/* Conflict tooltip */}
            {slot.conflictingBooking && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                Ocupado por {slot.conflictingBooking.playerName}
                <br />
                hasta {slot.conflictingBooking.endTime}
              </div>
            )}
          </div>
        ))}
      </div>

      {timeSlots.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">⏰</div>
          <div className="text-lg font-medium">No hay horarios disponibles</div>
          <div className="text-sm">
            {(selectedDate instanceof Date ? selectedDate : new Date(selectedDate)).toDateString() === new Date().toDateString() 
              ? 'El club ya cerró o no hay tiempo suficiente para el horario seleccionado. Intenta con mañana.'
              : 'Intenta con una duración más corta o selecciona otro día'}
          </div>
        </div>
      )}

      {selectedTime && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 mr-3">✓</div>
            <div>
              <div className="font-medium text-green-800">
                Horario seleccionado: {formatTimeRange(selectedTime)}
              </div>
              <div className="text-sm text-green-700">
                {format(selectedDate, 'eeee d MMMM yyyy')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}