# STORY-006: Sistema de Reservas Core

## 🎯 Objetivo
Implementar el sistema completo de reservas que reemplaza Excel: calendario visual, crear/editar/cancelar reservas, gestión de pagos divididos, y dashboard de recepción para check-in.

## 📋 Contexto para Claude Code
Este es el corazón de Padelyzer.app - el trustkey que demuestra que funciona mejor que Excel. Debe ser ultra-simple pero completo: ver disponibilidad, reservar, gestionar pagos de 4 jugadores, y check-in en recepción.

## ✅ Criterios de Aceptación
- [ ] Vista calendario semanal con disponibilidad de todas las canchas
- [ ] Modal/formulario para crear nueva reserva
- [ ] Gestión de pagos divididos (1 paga todo O dividir entre 4)
- [ ] Estados de reserva: Pendiente → Confirmada → Check-in → Completada
- [ ] Dashboard recepción para gestionar día actual
- [ ] Confirmaciones por WhatsApp (simulado en dev)
- [ ] Sin dobles reservas (validación estricta)

## 📝 Instrucciones para Claude Code

### PASO 1: Vista Principal de Reservas
```tsx
// app/(web)/(auth)/dashboard/bookings/page.tsx
import { requireStaffAuth } from '@/lib/auth/auth'
import { prisma } from '@/lib/config/prisma'
import { BookingCalendar } from './booking-calendar'
import { BookingStats } from './booking-stats'
import { addDays, startOfWeek, format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { date?: string; view?: string }
}) {
  const session = await requireStaffAuth()
  const clubId = session.user.clubId

  // Parse date or use current week
  const baseDate = searchParams.date ? new Date(searchParams.date) : new Date()
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }) // Monday
  const weekEnd = addDays(weekStart, 6)

  // Get club data
  const [club, courts, bookings] = await Promise.all([
    prisma.club.findUnique({
      where: { id: clubId },
      include: { schedules: true, pricing: true }
    }),
    prisma.court.findMany({
      where: { clubId, active: true },
      orderBy: { order: 'asc' }
    }),
    prisma.booking.findMany({
      where: {
        clubId,
        date: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      include: {
        court: true,
        user: true,
        payments: true
      },
      orderBy: { date: 'asc' }
    })
  ])

  // Calculate stats for current week
  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
    pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
    revenue: bookings
      .filter(b => b.paymentStatus === 'PAID')
      .reduce((sum, b) => sum + Number(b.price), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-600">
            Semana del {format(weekStart, 'dd MMM', { locale: es })} al {format(weekEnd, 'dd MMM yyyy', { locale: es })}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            ➕ Nueva Reserva
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
            📊 Reportes
          </button>
        </div>
      </div>

      {/* Stats */}
      <BookingStats stats={stats} />

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow">
        <BookingCalendar
          club={club}
          courts={courts}
          bookings={bookings}
          weekStart={weekStart}
        />
      </div>
    </div>
  )
}
```

### PASO 2: Componente de Estadísticas
```tsx
// app/(web)/(auth)/dashboard/bookings/booking-stats.tsx
export function BookingStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">📅</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Reservas</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600">✅</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Confirmadas</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.confirmedBookings}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600">⏳</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Pendientes</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.pendingBookings}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600">💰</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Ingresos</p>
            <p className="text-2xl font-semibold text-gray-900">
              ${stats.revenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### PASO 3: Calendario Visual de Reservas
```tsx
// app/(web)/(auth)/dashboard/bookings/booking-calendar.tsx
'use client'

import { useState } from 'react'
import { format, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { BookingModal } from './booking-modal'

export function BookingCalendar({ club, courts, bookings, weekStart }) {
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Generate time slots (every 30 min from open to close)
  const timeSlots = generateTimeSlots(club.schedules)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  function handleSlotClick(court, date, time) {
    // Check if slot is available
    const isBooked = bookings.some(booking =>
      booking.courtId === court.id &&
      isSameDay(new Date(booking.date), date) &&
      booking.startTime <= time &&
      booking.endTime > time
    )

    if (!isBooked) {
      setSelectedSlot({ court, date, time })
      setShowModal(true)
    }
  }

  function getBookingForSlot(court, date, time) {
    return bookings.find(booking =>
      booking.courtId === court.id &&
      isSameDay(new Date(booking.date), date) &&
      booking.startTime <= time &&
      booking.endTime > time
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header with days */}
          <div className="grid grid-cols-8 border-b">
            <div className="p-4 bg-gray-50 font-medium text-gray-900">
              Canchas
            </div>
            {weekDays.map(day => (
              <div key={day.toISOString()} className="p-4 bg-gray-50 text-center">
                <div className="font-medium text-gray-900">
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div className="text-sm text-gray-500">
                  {format(day, 'dd MMM')}
                </div>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {courts.map(court => (
            <div key={court.id} className="grid grid-cols-8 border-b">
              {/* Court name */}
              <div className="p-4 bg-gray-50 font-medium text-gray-900 flex items-center">
                <div>
                  <div>{court.name}</div>
                  <div className="text-xs text-gray-500">
                    {court.indoor ? '🏢 Interior' : '🌤️ Exterior'}
                  </div>
                </div>
              </div>

              {/* Days */}
              {weekDays.map(day => (
                <div key={`${court.id}-${day.toISOString()}`} className="border-l">
                  <DayColumn
                    court={court}
                    date={day}
                    bookings={bookings.filter(b =>
                      b.courtId === court.id && isSameDay(new Date(b.date), day)
                    )}
                    timeSlots={timeSlots}
                    onSlotClick={handleSlotClick}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <BookingModal
          slot={selectedSlot}
          club={club}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            // Refresh page
            window.location.reload()
          }}
        />
      )}
    </>
  )
}

function DayColumn({ court, date, bookings, timeSlots, onSlotClick }) {
  return (
    <div className="min-h-[600px] relative">
      {/* Time slots */}
      {timeSlots.map(time => {
        const booking = bookings.find(b =>
          b.startTime <= time && b.endTime > time
        )

        if (booking) {
          // Show booking
          return (
            <BookingBlock
              key={`${court.id}-${date.toISOString()}-${time}`}
              booking={booking}
              time={time}
            />
          )
        } else {
          // Show available slot
          return (
            <button
              key={`${court.id}-${date.toISOString()}-${time}`}
              onClick={() => onSlotClick(court, date, time)}
              className="w-full h-8 border-t border-gray-100 hover:bg-green-50 text-xs text-gray-400 hover:text-green-600 transition-colors"
            >
              {time}
            </button>
          )
        }
      })}
    </div>
  )
}

function BookingBlock({ booking, time }) {
  const statusColors = {
    PENDING: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    CONFIRMED: 'bg-blue-100 border-blue-300 text-blue-800',
    COMPLETED: 'bg-green-100 border-green-300 text-green-800',
    CANCELLED: 'bg-red-100 border-red-300 text-red-800',
    NO_SHOW: 'bg-gray-100 border-gray-300 text-gray-800',
  }

  // Calculate height based on duration
  const duration = calculateDuration(booking.startTime, booking.endTime)
  const height = (duration / 30) * 32 // 32px per 30min slot

  return (
    <div
      className={`absolute left-0 right-0 border rounded p-1 text-xs ${statusColors[booking.status]}`}
      style={{
        top: `${getTimePosition(time)}px`,
        height: `${height}px`,
        zIndex: 10
      }}
    >
      <div className="font-medium truncate">{booking.playerName}</div>
      <div className="truncate">{booking.startTime} - {booking.endTime}</div>
      <div className="flex items-center justify-between">
        <span>${booking.price}</span>
        <PaymentStatus payment={booking.paymentStatus} />
      </div>
    </div>
  )
}

function PaymentStatus({ payment }) {
  const icons = {
    PENDING: '⏳',
    PARTIAL: '💰',
    PAID: '✅'
  }
  return <span>{icons[payment]}</span>
}

function generateTimeSlots(schedules) {
  // Generate slots from 7:00 to 23:00 every 30 minutes
  const slots = []
  for (let hour = 7; hour <= 23; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 23) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  return slots
}

function calculateDuration(start, end) {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  return (endHour * 60 + endMin) - (startHour * 60 + startMin)
}

function getTimePosition(time) {
  const [hour, min] = time.split(':').map(Number)
  const minutesFromStart = (hour - 7) * 60 + min
  return (minutesFromStart / 30) * 32
}
```

### PASO 4: Modal de Nueva Reserva
```tsx
// app/(web)/(auth)/dashboard/bookings/booking-modal.tsx
'use client'

import { useState } from 'react'
import { createBooking } from './actions'

export function BookingModal({ slot, club, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [paymentType, setPaymentType] = useState('FULL') // FULL or SPLIT
  const [formData, setFormData] = useState({
    playerName: '',
    playerEmail: '',
    playerPhone: '',
    duration: 90, // minutes
    notes: ''
  })

  // Calculate price based on duration and court pricing
  const price = calculatePrice(slot.court, slot.date, slot.time, formData.duration, club.pricing)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const bookingData = {
        courtId: slot.court.id,
        date: slot.date.toISOString().split('T')[0],
        startTime: slot.time,
        endTime: addMinutesToTime(slot.time, formData.duration),
        duration: formData.duration,
        playerName: formData.playerName,
        playerEmail: formData.playerEmail,
        playerPhone: formData.playerPhone,
        price,
        paymentType,
        notes: formData.notes
      }

      await createBooking(bookingData)
      onSuccess()
    } catch (error) {
      alert('Error al crear la reserva: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Nueva Reserva</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Slot Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-2">Detalles de la Reserva</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Cancha:</span>
              <span className="ml-2 font-medium">{slot.court.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Fecha:</span>
              <span className="ml-2 font-medium">
                {slot.date.toLocaleDateString('es-MX')}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Hora:</span>
              <span className="ml-2 font-medium">{slot.time}</span>
            </div>
            <div>
              <span className="text-gray-600">Precio:</span>
              <span className="ml-2 font-medium text-green-600">${price}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player Info */}
          <div>
            <h3 className="font-medium mb-4">Información del Jugador Principal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.playerName}
                  onChange={(e) => setFormData({...formData, playerName: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.playerPhone}
                  onChange={(e) => setFormData({...formData, playerPhone: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="222-123-4567"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.playerEmail}
                  onChange={(e) => setFormData({...formData, playerEmail: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="juan@gmail.com"
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value={60}>1 hora (60 min)</option>
              <option value={90}>1.5 horas (90 min)</option>
              <option value={120}>2 horas (120 min)</option>
            </select>
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Pago
            </label>
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="radio"
                  name="paymentType"
                  value="FULL"
                  checked={paymentType === 'FULL'}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Una sola persona paga</div>
                  <div className="text-sm text-gray-600">
                    {formData.playerName || 'El jugador principal'} paga ${price} completos
                  </div>
                </div>
              </label>
              
              <label className="flex items-start">
                <input
                  type="radio"
                  name="paymentType"
                  value="SPLIT"
                  checked={paymentType === 'SPLIT'}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Dividir entre 4 jugadores</div>
                  <div className="text-sm text-gray-600">
                    Cada jugador paga ${(price / 4).toFixed(0)} por separado
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 h-20"
              placeholder="Información adicional..."
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function calculatePrice(court, date, time, duration, pricing) {
  // Simple calculation - in real app would use club pricing rules
  const basePrice = 500 // Base price per hour
  const hours = duration / 60
  return Math.round(basePrice * hours)
}

function addMinutesToTime(time, minutes) {
  const [hour, min] = time.split(':').map(Number)
  const totalMinutes = hour * 60 + min + minutes
  const newHour = Math.floor(totalMinutes / 60)
  const newMin = totalMinutes % 60
  return `${newHour.toString().padStart(2, '0')}:${newMin.toString().padStart(2, '0')}`
}
```

### PASO 5: Server Actions para Reservas
```typescript
// app/(web)/(auth)/dashboard/bookings/actions.ts
'use server'

import { prisma } from '@/lib/config/prisma'
import { requireStaffAuth } from '@/lib/auth/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateBookingSchema = z.object({
  courtId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().min(30).max(240),
  playerName: z.string().min(2).max(100),
  playerEmail: z.string().email().optional().or(z.literal('')),
  playerPhone: z.string().min(10),
  price: z.number().min(0),
  paymentType: z.enum(['FULL', 'SPLIT']),
  notes: z.string().optional(),
})

export async function createBooking(data: any) {
  const session = await requireStaffAuth()
  const clubId = session.user.clubId

  // Validate input
  const parsed = CreateBookingSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error('Datos inválidos: ' + parsed.error.message)
  }

  const bookingData = parsed.data

  // Verify court belongs to club
  const court = await prisma.court.findUnique({
    where: { id: bookingData.courtId },
    include: { club: true }
  })

  if (!court || court.clubId !== clubId) {
    throw new Error('Cancha no encontrada')
  }

  // Check for conflicts
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      courtId: bookingData.courtId,
      date: new Date(bookingData.date),
      status: { not: 'CANCELLED' },
      OR: [
        {
          AND: [
            { startTime: { lte: bookingData.startTime } },
            { endTime: { gt: bookingData.startTime } }
          ]
        },
        {
          AND: [
            { startTime: { lt: bookingData.endTime } },
            { endTime: { gte: bookingData.endTime } }
          ]
        },
        {
          AND: [
            { startTime: { gte: bookingData.startTime } },
            { endTime: { lte: bookingData.endTime } }
          ]
        }
      ]
    }
  })

  if (conflictingBooking) {
    throw new Error('Ya existe una reserva en este horario')
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      clubId,
      courtId: bookingData.courtId,
      date: new Date(bookingData.date),
      startTime: bookingData.startTime,
      endTime: bookingData.endTime,
      duration: bookingData.duration,
      playerName: bookingData.playerName,
      playerEmail: bookingData.playerEmail || '',
      playerPhone: bookingData.playerPhone,
      price: bookingData.price,
      currency: 'MXN',
      paymentStatus: 'PENDING',
      paymentType: bookingData.paymentType === 'SPLIT' ? 'ONLINE' : 'ONSITE',
      status: 'CONFIRMED',
      notes: bookingData.notes || '',
      totalPlayers: 4,
    }
  })

  // Create payment records
  if (bookingData.paymentType === 'SPLIT') {
    // Create 4 payment records for split payment
    const paymentAmount = bookingData.price / 4
    
    await prisma.payment.createMany({
      data: Array.from({ length: 4 }, (_, i) => ({
        bookingId: booking.id,
        amount: paymentAmount,
        currency: 'MXN',
        method: 'ONLINE',
        status: i === 0 ? 'pending' : 'pending', // All start as pending
      }))
    })
  } else {
    // Create single payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: bookingData.price,
        currency: 'MXN',
        method: 'ONSITE',
        status: 'pending',
      }
    })
  }

  // TODO: Send WhatsApp confirmation
  // await sendWhatsAppConfirmation(booking)

  revalidatePath('/dashboard/bookings')
  return booking
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const session = await requireStaffAuth()
  
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { club: true }
  })

  if (!booking || booking.clubId !== session.user.clubId) {
    throw new Error('Reserva no encontrada')
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status }
  })

  revalidatePath('/dashboard/bookings')
}

export async function checkInBooking(bookingId: string) {
  const session = await requireStaffAuth()
  
  await prisma.booking.update({
    where: { 
      id: bookingId,
      club: { id: session.user.clubId }
    },
    data: { 
      checkedIn: true,
      status: 'COMPLETED'
    }
  })

  revalidatePath('/dashboard/bookings')
}
```

### PASO 6: Dashboard de Recepción
```tsx
// app/(web)/(auth)/dashboard/reception/page.tsx
import { requireStaffAuth } from '@/lib/auth/auth'
import { prisma } from '@/lib/config/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckInActions } from './checkin-actions'

export default async function ReceptionPage() {
  const session = await requireStaffAuth()
  const today = new Date()

  // Get today's bookings
  const todayBookings = await prisma.booking.findMany({
    where: {
      clubId: session.user.clubId,
      date: {
        gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    },
    include: {
      court: true,
      payments: true
    },
    orderBy: { startTime: 'asc' }
  })

  // Group by status
  const upcoming = todayBookings.filter(b => 
    b.status === 'CONFIRMED' && !b.checkedIn
  )
  const checkedIn = todayBookings.filter(b => b.checkedIn)
  const pending = todayBookings.filter(b => b.status === 'PENDING')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Recepción</h1>
        <p className="text-gray-600">
          {format(today, "EEEE, dd 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⏰</span>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                Por Llegar
              </h3>
              <p className="text-2xl font-bold text-blue-700">{upcoming.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                En Juego
              </h3>
              <p className="text-2xl font-bold text-green-700">{checkedIn.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900">
                Pendientes
              </h3>
              <p className="text-2xl font-bold text-yellow-700">{pending.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Próximas Reservas</h2>
        </div>
        <div className="p-6">
          {upcoming.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay reservas pendientes de check-in
            </p>
          ) : (
            <div className="space-y-4">
              {upcoming.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Checked In */}
      {checkedIn.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">En Juego</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {checkedIn.map(booking => (
                <BookingCard key={booking.id} booking={booking} showCheckOut />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BookingCard({ booking, showCheckOut = false }) {
  const paymentTotal = booking.payments.reduce((sum, p) => 
    sum + (p.status === 'paid' ? Number(p.amount) : 0), 0
  )
  const paymentStatus = paymentTotal >= Number(booking.price) ? 'PAID' : 
                       paymentTotal > 0 ? 'PARTIAL' : 'PENDING'

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div className="font-medium text-lg">
              {booking.startTime} - {booking.endTime}
            </div>
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {booking.court.name}
            </div>
          </div>
          
          <div className="mt-2">
            <p className="font-medium">{booking.playerName}</p>
            <p className="text-gray-600">{booking.playerPhone}</p>
          </div>

          <div className="mt-2 flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-gray-600">Precio:</span>
              <span className="ml-1 font-medium">${booking.price}</span>
            </div>
            <PaymentStatusBadge status={paymentStatus} />
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          {!booking.checkedIn ? (
            <CheckInActions bookingId={booking.id} />
          ) : showCheckOut ? (
            <div className="text-green-600 font-medium">
              ✅ En juego
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function PaymentStatusBadge({ status }) {
  const styles = {
    PAID: 'bg-green-100 text-green-800',
    PARTIAL: 'bg-yellow-100 text-yellow-800',
    PENDING: 'bg-red-100 text-red-800'
  }

  const labels = {
    PAID: '✅ Pagado',
    PARTIAL: '💰 Parcial', 
    PENDING: '⏳ Pendiente'
  }

  return (
    <span className={`px-2 py-1 rounded text-xs ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
```

### PASO 7: Acciones de Check-in
```tsx
// app/(web)/(auth)/dashboard/reception/checkin-actions.tsx
'use client'

import { useState } from 'react'
import { checkInBooking } from '../bookings/actions'

export function CheckInActions({ bookingId }) {
  const [loading, setLoading] = useState(false)

  async function handleCheckIn() {
    setLoading(true)
    try {
      await checkInBooking(bookingId)
      window.location.reload()
    } catch (error) {
      alert('Error en check-in: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckIn}
      disabled={loading}
      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? 'Procesando...' : '✅ Check-in'}
    </button>
  )
}
```

## 🔍 Verificación
```bash
# Claude, verificar el sistema completo:
npm run dev

# Flow completo:
# 1. Login como club owner
# 2. Ir a /dashboard/bookings
# 3. Ver calendario semanal
# 4. Crear nueva reserva
# 5. Probar pagos divididos vs completos
# 6. Ir a /dashboard/reception
# 7. Hacer check-in de reservas
# 8. Verificar que no hay dobles reservas
```

## ⚠️ NO HACER
- NO implementar integración real de pagos Stripe aún
- NO agregar notificaciones push o emails
- NO crear sistema de cancelaciones automáticas
- NO implementar arrastrar/soltar en calendario

## Definition of Done
- [ ] Calendario visual funcional con todas las canchas
- [ ] Modal crear reserva con validación completa
- [ ] Sistema pagos divididos vs completos
- [ ] Dashboard recepción para check-in
- [ ] Validación anti-conflictos estricta
- [ ] Estados de reserva manejados correctamente
- [ ] CTA upgrade a Pro visible en dashboard