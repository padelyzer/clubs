# STORY-007: Widget Embebible para Websites

## 🎯 Objetivo
Crear widget que los clubes pueden embeber en sus websites con una línea de código, permitiendo a sus clientes reservar directamente sin salir del sitio del club. Esto multiplica el valor del trustkey gratuito.

## 📋 Contexto para Claude Code
El widget embebible es el diferenciador #1 vs competencia - ni Playtomic ni pro.padelyzer.com ofrecen esto fácil. Debe funcionar en cualquier website (WordPress, Wix, custom) y mantener el branding del club.

## ✅ Criterios de Aceptación
- [ ] URL única por club: `padelyzer.app/widget/[club-slug]`
- [ ] Generador de código iframe en dashboard
- [ ] Widget responsive que funciona en cualquier sitio
- [ ] Calendario embebido con disponibilidad real-time
- [ ] Formulario de reserva dentro del widget
- [ ] Personalización básica (colores, logo del club)
- [ ] No requiere autenticación del club para funcionar

## 📝 Instrucciones para Claude Code

### PASO 1: Ruta del Widget Público
```tsx
// app/(web)/(public)/widget/[clubSlug]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/config/prisma'
import { WidgetCalendar } from './widget-calendar'
import { addDays, startOfWeek } from 'date-fns'

export default async function WidgetPage({
  params,
  searchParams,
}: {
  params: { clubSlug: string }
  searchParams: { date?: string; embedded?: string }
}) {
  const { clubSlug } = params
  const isEmbedded = searchParams.embedded === 'true'

  // Get club data
  const club = await prisma.club.findUnique({
    where: { 
      slug: clubSlug,
      status: 'APPROVED',
      active: true
    },
    include: {
      courts: { 
        where: { active: true },
        orderBy: { order: 'asc' }
      },
      schedules: { orderBy: { dayOfWeek: 'asc' } },
      pricing: true
    }
  })

  if (!club) {
    notFound()
  }

  // Parse date or use current week
  const baseDate = searchParams.date ? new Date(searchParams.date) : new Date()
  const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 6)

  // Get bookings for the week
  const bookings = await prisma.booking.findMany({
    where: {
      clubId: club.id,
      date: {
        gte: weekStart,
        lte: weekEnd
      },
      status: { not: 'CANCELLED' }
    },
    include: { court: true }
  })

  return (
    <div className={`${isEmbedded ? 'p-0' : 'min-h-screen bg-gray-50 p-6'}`}>
      {!isEmbedded && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Reservas - {club.name}
            </h1>
            <p className="text-gray-600">
              {club.address}, {club.city}
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <a 
                href={`tel:${club.phone}`}
                className="text-green-600 hover:underline"
              >
                📞 {club.phone}
              </a>
              <a 
                href={`mailto:${club.email}`}
                className="text-green-600 hover:underline"
              >
                ✉️ {club.email}
              </a>
            </div>
          </div>
        </div>
      )}

      <div className={isEmbedded ? '' : 'max-w-4xl mx-auto'}>
        <WidgetCalendar
          club={club}
          courts={club.courts}
          bookings={bookings}
          weekStart={weekStart}
          isEmbedded={isEmbedded}
        />
      </div>

      {!isEmbedded && (
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">
              Powered by{' '}
              <a 
                href="https://padelyzer.app" 
                target="_blank"
                className="text-green-600 hover:underline font-medium"
              >
                🎾 Padelyzer.app
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
```

### PASO 2: Componente del Widget
```tsx
// app/(web)/(public)/widget/[clubSlug]/widget-calendar.tsx
'use client'

import { useState } from 'react'
import { format, addDays, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { WidgetBookingModal } from './widget-booking-modal'

export function WidgetCalendar({ 
  club, 
  courts, 
  bookings, 
  weekStart, 
  isEmbedded 
}) {
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const timeSlots = generateTimeSlots()

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

  return (
    <>
      <div className={`bg-white rounded-lg shadow ${isEmbedded ? '' : 'overflow-hidden'}`}>
        {/* Widget Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
          <div className="flex items-center">
            {club.logo && (
              <img 
                src={club.logo} 
                alt={club.name}
                className="w-10 h-10 rounded-full mr-3"
              />
            )}
            <div>
              <h2 className="text-lg font-semibold">{club.name}</h2>
              <p className="text-green-100 text-sm">Selecciona día y hora</p>
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {format(weekStart, 'dd MMM', { locale: es })} - {format(addDays(weekStart, 6), 'dd MMM yyyy', { locale: es })}
            </h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => window.location.href = `?date=${format(addDays(weekStart, -7), 'yyyy-MM-dd')}&embedded=${isEmbedded}`}
                className="p-2 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <button 
                onClick={() => window.location.href = `?date=${format(addDays(weekStart, 7), 'yyyy-MM-dd')}&embedded=${isEmbedded}`}
                className="p-2 hover:bg-gray-100 rounded"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Simplified Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div key={day.toISOString()} className="text-center">
                <div className="font-medium text-gray-900 text-sm">
                  {format(day, 'EEE', { locale: es })}
                </div>
                <div className="text-gray-600 text-xs">
                  {format(day, 'dd')}
                </div>
              </div>
            ))}
          </div>

          {/* Available Slots by Day */}
          <div className="space-y-4">
            {weekDays.map(day => {
              const daySlots = getAvailableSlotsForDay(day, courts, bookings)
              
              if (daySlots.length === 0) {
                return (
                  <div key={day.toISOString()} className="text-center py-4 text-gray-500">
                    <div className="font-medium">{format(day, 'EEEE dd', { locale: es })}</div>
                    <div className="text-sm">Sin disponibilidad</div>
                  </div>
                )
              }

              return (
                <div key={day.toISOString()}>
                  <h4 className="font-medium text-gray-900 mb-2">
                    {format(day, 'EEEE dd', { locale: es })}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {daySlots.slice(0, 6).map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlotClick(slot.court, day, slot.time)}
                        className="p-3 border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors text-left"
                      >
                        <div className="font-medium text-sm text-gray-900">
                          {slot.time}
                        </div>
                        <div className="text-xs text-gray-600">
                          {slot.court.name}
                        </div>
                        <div className="text-xs text-green-600">
                          ${slot.price}
                        </div>
                      </button>
                    ))}
                  </div>
                  {daySlots.length > 6 && (
                    <div className="text-xs text-gray-500 mt-2">
                      +{daySlots.length - 6} horarios más disponibles
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center">
          <p className="text-xs text-gray-600">
            ¿Preguntas? Llama al{' '}
            <a href={`tel:${club.phone}`} className="text-green-600 hover:underline">
              {club.phone}
            </a>
          </p>
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <WidgetBookingModal
          slot={selectedSlot}
          club={club}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            window.location.reload()
          }}
          isEmbedded={isEmbedded}
        />
      )}
    </>
  )
}

function generateTimeSlots() {
  const slots = []
  for (let hour = 7; hour <= 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 22) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  return slots
}

function getAvailableSlotsForDay(date, courts, bookings) {
  const slots = []
  const timeSlots = generateTimeSlots()

  courts.forEach(court => {
    timeSlots.forEach(time => {
      const isBooked = bookings.some(booking =>
        booking.courtId === court.id &&
        isSameDay(new Date(booking.date), date) &&
        booking.startTime <= time &&
        booking.endTime > time
      )

      if (!isBooked) {
        slots.push({
          court,
          time,
          price: calculatePriceForSlot(court, date, time) // Simplified pricing
        })
      }
    })
  })

  return slots.sort((a, b) => a.time.localeCompare(b.time))
}

function calculatePriceForSlot(court, date, time) {
  // Simplified pricing - in real app would use club pricing rules
  return 500
}
```

### PASO 3: Modal de Reserva del Widget
```tsx
// app/(web)/(public)/widget/[clubSlug]/widget-booking-modal.tsx
'use client'

import { useState } from 'react'
import { createWidgetBooking } from './actions'

export function WidgetBookingModal({ 
  slot, 
  club, 
  onClose, 
  onSuccess, 
  isEmbedded 
}) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    playerName: '',
    playerEmail: '',
    playerPhone: '',
    duration: 90,
    paymentType: 'FULL'
  })

  const price = calculatePrice(slot.court, slot.date, slot.time, formData.duration)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const bookingData = {
        clubSlug: club.slug,
        courtId: slot.court.id,
        date: slot.date.toISOString().split('T')[0],
        startTime: slot.time,
        duration: formData.duration,
        playerName: formData.playerName,
        playerEmail: formData.playerEmail,
        playerPhone: formData.playerPhone,
        paymentType: formData.paymentType
      }

      const result = await createWidgetBooking(bookingData)
      
      if (result.success) {
        onSuccess()
      } else {
        alert('Error: ' + result.error)
        setLoading(false)
      }
    } catch (error) {
      alert('Error al crear la reserva')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-green-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Confirmar Reserva</h3>
            <button
              onClick={onClose}
              className="text-green-100 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm space-y-1">
              <div><strong>Cancha:</strong> {slot.court.name}</div>
              <div><strong>Fecha:</strong> {slot.date.toLocaleDateString('es-MX')}</div>
              <div><strong>Hora:</strong> {slot.time}</div>
              <div><strong>Precio:</strong> <span className="text-green-600">${price}</span></div>
            </div>
          </div>

          {/* Player Info */}
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
              placeholder="Tu nombre"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.playerEmail}
              onChange={(e) => setFormData({...formData, playerEmail: e.target.value})}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="tu@email.com"
            />
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
              <option value={60}>1 hora</option>
              <option value={90}>1.5 horas</option>
              <option value={120}>2 horas</option>
            </select>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-2">💳 Información de Pago</p>
              <p className="text-blue-800">
                El pago se realiza directamente en el club al momento de jugar.
                Tu reserva quedará confirmada al enviar este formulario.
              </p>
            </div>
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Cómo van a pagar?
            </label>
            <div className="space-y-2">
              <label className="flex items-start">
                <input
                  type="radio"
                  name="paymentType"
                  value="FULL"
                  checked={formData.paymentType === 'FULL'}
                  onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Una persona paga</div>
                  <div className="text-sm text-gray-600">
                    {formData.playerName || 'El organizador'} paga ${price} en el club
                  </div>
                </div>
              </label>
              
              <label className="flex items-start">
                <input
                  type="radio"
                  name="paymentType"
                  value="SPLIT"
                  checked={formData.paymentType === 'SPLIT'}
                  onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">Dividir entre 4 jugadores</div>
                  <div className="text-sm text-gray-600">
                    Cada jugador paga ${Math.round(price / 4)} por separado
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Confirmando...' : '✅ Confirmar Reserva'}
            </button>
            
            <p className="text-xs text-gray-600 mt-2 text-center">
              Al confirmar aceptas los términos del club
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

function calculatePrice(court, date, time, duration) {
  // Simplified calculation
  const basePrice = 500
  const hours = duration / 60
  return Math.round(basePrice * hours)
}
```

### PASO 4: Server Actions del Widget
```typescript
// app/(web)/(public)/widget/[clubSlug]/actions.ts
'use server'

import { prisma } from '@/lib/config/prisma'
import { z } from 'zod'

const WidgetBookingSchema = z.object({
  clubSlug: z.string(),
  courtId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().min(60).max(180),
  playerName: z.string().min(2).max(100),
  playerEmail: z.string().email().optional().or(z.literal('')),
  playerPhone: z.string().min(10),
  paymentType: z.enum(['FULL', 'SPLIT']),
})

export async function createWidgetBooking(data: any) {
  try {
    // Validate input
    const parsed = WidgetBookingSchema.safeParse(data)
    if (!parsed.success) {
      return { error: 'Datos inválidos: ' + parsed.error.message }
    }

    const bookingData = parsed.data

    // Get club
    const club = await prisma.club.findUnique({
      where: { 
        slug: bookingData.clubSlug,
        status: 'APPROVED',
        active: true
      },
      include: { courts: true }
    })

    if (!club) {
      return { error: 'Club no encontrado' }
    }

    // Verify court belongs to club
    const court = club.courts.find(c => c.id === bookingData.courtId)
    if (!court) {
      return { error: 'Cancha no encontrada' }
    }

    // Calculate end time
    const [startHour, startMin] = bookingData.startTime.split(':').map(Number)
    const endMinutes = startHour * 60 + startMin + bookingData.duration
    const endHour = Math.floor(endMinutes / 60)
    const endMin = endMinutes % 60
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`

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
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: bookingData.startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    })

    if (conflictingBooking) {
      return { error: 'Este horario ya no está disponible' }
    }

    // Calculate price (simplified)
    const price = Math.round(500 * (bookingData.duration / 60))

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        clubId: club.id,
        courtId: bookingData.courtId,
        date: new Date(bookingData.date),
        startTime: bookingData.startTime,
        endTime: endTime,
        duration: bookingData.duration,
        playerName: bookingData.playerName,
        playerEmail: bookingData.playerEmail || '',
        playerPhone: bookingData.playerPhone,
        price: price,
        currency: 'MXN',
        paymentStatus: 'PENDING',
        paymentType: 'ONSITE', // Widget bookings are always paid onsite
        status: 'CONFIRMED',
        totalPlayers: 4,
      }
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: price,
        currency: 'MXN',
        method: 'ONSITE',
        status: 'pending',
      }
    })

    // TODO: Send confirmation WhatsApp/SMS
    // TODO: Notify club of new booking

    return { 
      success: true, 
      bookingId: booking.id,
      message: `Reserva confirmada para ${bookingData.date} a las ${bookingData.startTime}. Te esperamos en ${club.name}!`
    }

  } catch (error) {
    console.error('Widget booking error:', error)
    return { error: 'Error interno. Intenta de nuevo.' }
  }
}
```

### PASO 5: Generador de Widget en Dashboard
```tsx
// app/(web)/(auth)/dashboard/widget/page.tsx
import { requireStaffAuth } from '@/lib/auth/auth'
import { prisma } from '@/lib/config/prisma'
import { WidgetGenerator } from './widget-generator'

export default async function WidgetPage() {
  const session = await requireStaffAuth()

  const club = await prisma.club.findUnique({
    where: { id: session.user.clubId },
    select: {
      slug: true,
      name: true,
      active: true
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Widget para tu Website</h1>
        <p className="text-gray-600">
          Permite a tus clientes reservar directamente desde tu página web
        </p>
      </div>

      {!club.active ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-800">Club no activo</h3>
              <p className="text-yellow-700">
                Tu club necesita estar activo para usar el widget. 
                Completa la configuración primero.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <WidgetGenerator club={club} />
      )}
    </div>
  )
}
```

### PASO 6: Componente Generador
```tsx
// app/(web)/(auth)/dashboard/widget/widget-generator.tsx
'use client'

import { useState } from 'react'

export function WidgetGenerator({ club }) {
  const [config, setConfig] = useState({
    width: '100%',
    height: '600px',
    theme: 'light'
  })

  const widgetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/widget/${club.slug}?embedded=true`
  
  const embedCode = `<iframe 
  src="${widgetUrl}"
  width="${config.width}" 
  height="${config.height}"
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
</iframe>`

  const directLink = `${process.env.NEXT_PUBLIC_APP_URL}/widget/${club.slug}`

  return (
    <div className="space-y-6">
      {/* Widget Preview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Vista Previa</h2>
        </div>
        <div className="p-6">
          <div className="border rounded-lg overflow-hidden" style={{ height: config.height }}>
            <iframe
              src={widgetUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Widget Preview"
            />
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Configuración</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ancho
              </label>
              <select
                value={config.width}
                onChange={(e) => setConfig({...config, width: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="100%">100% (Responsivo)</option>
                <option value="800px">800px (Fijo)</option>
                <option value="600px">600px (Fijo)</option>
                <option value="400px">400px (Móvil)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alto
              </label>
              <select
                value={config.height}
                onChange={(e) => setConfig({...config, height: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="600px">600px (Recomendado)</option>
                <option value="500px">500px (Compacto)</option>
                <option value="800px">800px (Extendido)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Código para tu Website</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código HTML (copia y pega en tu sitio)
            </label>
            <div className="relative">
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{embedCode}</code>
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(embedCode)}
                className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs border hover:bg-gray-50"
              >
                📋 Copiar
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enlace Directo (para redes sociales)
            </label>
            <div className="relative">
              <input
                type="text"
                value={directLink}
                readOnly
                className="w-full border rounded-lg px-3 py-2 bg-gray-50"
              />
              <button
                onClick={() => navigator.clipboard.writeText(directLink)}
                className="absolute right-2 top-2 bg-white px-2 py-1 rounded text-xs border hover:bg-gray-50"
              >
                📋 Copiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">📝 Instrucciones</h3>
        <div className="text-blue-800 space-y-2 text-sm">
          <p><strong>WordPress:</strong> Pega el código HTML en un bloque "HTML personalizado"</p>
          <p><strong>Wix:</strong> Usa el elemento "Insertar código" y pega el código HTML</p>
          <p><strong>Squarespace:</strong> Agrega un bloque "Código" y pega el HTML</p>
          <p><strong>Sitio personalizado:</strong> Pega el código donde quieras que aparezca el widget</p>
        </div>
      </div>

      {/* CTA Pro */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-2">🚀 ¿Quieres más personalización?</h3>
            <p className="text-purple-100">
              En Padelyzer Pro puedes personalizar colores, agregar tu logo y más opciones
            </p>
          </div>
          <a
            href="https://pro.padelyzer.com"
            target="_blank"
            className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
          >
            Ver Pro
          </a>
        </div>
      </div>
    </div>
  )
}
```

## 🔍 Verificación
```bash
# Claude, verificar el widget completo:
npm run dev

# Flow de prueba:
# 1. Login como club owner
# 2. Ir a /dashboard/widget
# 3. Copiar código HTML
# 4. Abrir /widget/padel-demo-puebla
# 5. Probar reserva desde widget
# 6. Verificar que funciona embebido (?embedded=true)
```

## ⚠️ NO HACER
- NO agregar personalización avanzada (colores custom, CSS)
- NO implementar múltiples temas o layouts
- NO crear sistema de analytics del widget
- NO agregar autenticación de usuarios en widget

## Definition of Done
- [ ] URL del widget funciona: `/widget/[club-slug]`
- [ ] Modo embebido funciona: `?embedded=true`
- [ ] Generador de código en dashboard
- [ ] Reservas desde widget se crean correctamente
- [ ] Widget es responsive en cualquier sitio
- [ ] Branding del club se mantiene
- [ ] CTA upgrade a Pro visible en generador