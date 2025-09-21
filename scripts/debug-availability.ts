import { prisma } from '../lib/config/prisma'
import { format } from 'date-fns'

async function debugAvailability() {
  try {
    console.log('🔍 Verificando disponibilidad de Cancha 1...\n')
    
    // Obtener fecha de hoy
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    console.log(`📅 Fecha: ${format(today, 'yyyy-MM-dd')}\n`)
    
    // Buscar todas las reservas de Cancha 1 para hoy
    const court1 = await prisma.court.findFirst({
      where: { name: 'Cancha 1' }
    })
    
    if (!court1) {
      console.log('❌ No se encontró Cancha 1')
      return
    }
    
    console.log(`🏸 Cancha ID: ${court1.id}\n`)
    
    // Buscar reservas para esta cancha hoy
    const bookings = await prisma.booking.findMany({
      where: {
        courtId: court1.id,
        date: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        court: true
      },
      orderBy: {
        startTime: 'asc'
      }
    })
    
    console.log(`📊 Reservas encontradas: ${bookings.length}\n`)
    console.log('═'.repeat(80))
    
    if (bookings.length > 0) {
      bookings.forEach(booking => {
        console.log(`\n📌 ${booking.playerName}`)
        console.log(`   Horario: ${booking.startTime} - ${booking.endTime}`)
        console.log(`   Estado: ${booking.status}`)
        console.log(`   Pago: ${booking.paymentStatus}`)
        console.log(`   ID: ${booking.id}`)
      })
    } else {
      console.log('\n✅ No hay reservas para esta cancha hoy')
    }
    
    // Simular la lógica del endpoint para ver conflictos
    console.log('\n' + '═'.repeat(80))
    console.log('\n🔎 Simulando detección de conflictos (17:00-20:30):\n')
    
    const testSlots = [
      { start: '17:00', end: '18:30' },
      { start: '17:30', end: '19:00' },
      { start: '18:00', end: '19:30' },
      { start: '18:30', end: '20:00' },
      { start: '19:00', end: '20:30' },
      { start: '19:30', end: '21:00' },
      { start: '20:00', end: '21:30' },
      { start: '20:30', end: '22:00' }
    ]
    
    testSlots.forEach(slot => {
      const hasConflict = bookings.some(booking => {
        // Misma lógica que el endpoint
        return (
          (slot.start >= booking.startTime && slot.start < booking.endTime) ||
          (slot.end > booking.startTime && slot.end <= booking.endTime) ||
          (slot.start <= booking.startTime && slot.end >= booking.endTime)
        )
      })
      
      const conflictingBooking = bookings.find(booking => {
        return (
          (slot.start >= booking.startTime && slot.start < booking.endTime) ||
          (slot.end > booking.startTime && slot.end <= booking.endTime) ||
          (slot.start <= booking.startTime && slot.end >= booking.endTime)
        )
      })
      
      console.log(`   ${slot.start}: ${hasConflict ? '❌ OCUPADO' : '✅ DISPONIBLE'}`)
      if (conflictingBooking) {
        console.log(`      → Conflicto con: ${conflictingBooking.playerName} (${conflictingBooking.startTime}-${conflictingBooking.endTime})`)
      }
    })
    
    // Verificar todas las reservas en la base de datos
    console.log('\n' + '═'.repeat(80))
    console.log('\n📋 TODAS las reservas (sin filtro de fecha):\n')
    
    const allBookings = await prisma.booking.findMany({
      where: {
        courtId: court1.id,
        status: {
          not: 'CANCELLED'
        }
      },
      include: {
        court: true
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'asc' }
      ],
      take: 20
    })
    
    allBookings.forEach(booking => {
      console.log(`\n📌 ${booking.playerName}`)
      console.log(`   Fecha: ${format(booking.date, 'yyyy-MM-dd')}`)
      console.log(`   Horario: ${booking.startTime} - ${booking.endTime}`)
      console.log(`   Estado: ${booking.status}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAvailability()