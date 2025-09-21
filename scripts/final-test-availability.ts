import { prisma } from '../lib/config/prisma'
import { format } from 'date-fns'

async function finalTest() {
  try {
    const courtId = 'cmej0zrz40007r431rz6d79md' // Cancha 1
    const today = '2025-08-20'
    
    console.log('🔍 Test final de disponibilidad\n')
    console.log(`📅 Fecha a verificar: ${today}`)
    console.log(`🏸 Cancha: Cancha 1\n`)
    console.log('═'.repeat(80))
    
    // Crear límites del día correctamente
    const [year, month, day] = today.split('-').map(Number)
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)
    
    console.log('\n📆 Límites del día:')
    console.log(`   Inicio: ${startOfDay.toISOString()} (${startOfDay.toLocaleString('es-MX')})`)
    console.log(`   Fin: ${endOfDay.toISOString()} (${endOfDay.toLocaleString('es-MX')})\n`)
    
    // Buscar TODAS las reservas sin filtro de club
    const allBookings = await prisma.booking.findMany({
      where: {
        courtId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'CANCELLED'
        }
      },
      select: {
        id: true,
        clubId: true,
        playerName: true,
        startTime: true,
        endTime: true,
        date: true,
        status: true
      }
    })
    
    console.log(`📚 Reservas encontradas (sin filtro de club): ${allBookings.length}`)
    
    if (allBookings.length > 0) {
      console.log('\nDetalle:')
      allBookings.forEach(b => {
        console.log(`   - ${b.playerName}: ${b.startTime} - ${b.endTime}`)
        console.log(`     Club ID: ${b.clubId}`)
        console.log(`     Fecha: ${format(b.date, 'yyyy-MM-dd HH:mm:ss')}`)
        console.log(`     Estado: ${b.status}`)
      })
    }
    
    // Obtener el club correcto
    const club = await prisma.club.findFirst()
    console.log(`\n🏢 Club encontrado: ${club?.name} (${club?.id})\n`)
    
    // Ahora buscar con el club ID correcto
    const clubBookings = await prisma.booking.findMany({
      where: {
        clubId: club?.id,
        courtId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'CANCELLED'
        }
      },
      select: {
        playerName: true,
        startTime: true,
        endTime: true
      }
    })
    
    console.log(`📚 Reservas con club ID correcto: ${clubBookings.length}`)
    
    if (clubBookings.length > 0) {
      clubBookings.forEach(b => {
        console.log(`   - ${b.playerName}: ${b.startTime} - ${b.endTime}`)
      })
    }
    
    // Verificar conflictos para slots de 17:00 a 20:30
    console.log('\n' + '═'.repeat(80))
    console.log('\n🕐 Verificación de slots 17:00 - 20:30:\n')
    
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
      const hasConflict = allBookings.some(booking => {
        return (
          (slot.start >= booking.startTime && slot.start < booking.endTime) ||
          (slot.end > booking.startTime && slot.end <= booking.endTime) ||
          (slot.start <= booking.startTime && slot.end >= booking.endTime)
        )
      })
      
      const status = hasConflict ? '❌ OCUPADO' : '✅ DISPONIBLE'
      console.log(`   ${slot.start}: ${status}`)
      
      if (hasConflict) {
        const conflict = allBookings.find(booking => {
          return (
            (slot.start >= booking.startTime && slot.start < booking.endTime) ||
            (slot.end > booking.startTime && slot.end <= booking.endTime) ||
            (slot.start <= booking.startTime && slot.end >= booking.endTime)
          )
        })
        console.log(`      → Conflicto con: ${conflict?.playerName} (${conflict?.startTime}-${conflict?.endTime})`)
      }
    })
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('Error:', error)
  }
}

finalTest()