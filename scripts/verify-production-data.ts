import { prisma } from '../lib/config/prisma'

async function verifyProductionData() {
  console.log('🔍 Verificando datos directamente en la base de datos de PRODUCCIÓN...')
  console.log('📍 Conexión:', process.env.DATABASE_URL?.substring(0, 50) + '...')
  
  try {
    // Check connection first
    await prisma.$connect()
    console.log('✅ Conexión exitosa a la base de datos')
    
    // Get ALL bookings for club-demo-001 with detailed info
    const allBookings = await prisma.booking.findMany({
      where: {
        clubId: 'club-demo-001'
      },
      include: {
        Court: {
          include: {
            Club: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'asc' }
      ]
    })
    
    // Get ALL booking groups for club-demo-001
    const allGroups = await prisma.bookingGroup.findMany({
      where: {
        clubId: 'club-demo-001'
      },
      include: {
        Club: true,
        bookings: {
          include: {
            Court: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'asc' }
      ]
    })
    
    console.log('\n📊 RESUMEN TOTAL:')
    console.log(`   Total reservas individuales: ${allBookings.length}`)
    console.log(`   Total grupos de reservas: ${allGroups.length}`)
    
    console.log('\n🏢 CLUB INFORMACIÓN:')
    if (allBookings.length > 0) {
      const club = allBookings[0].Court?.Club
      console.log(`   Nombre: ${club?.name}`)
      console.log(`   ID: ${club?.id}`)
      console.log(`   Slug: ${club?.slug}`)
    }
    
    console.log('\n📋 TODAS LAS RESERVAS INDIVIDUALES:')
    if (allBookings.length === 0) {
      console.log('   ❌ NO HAY RESERVAS INDIVIDUALES')
    } else {
      allBookings.forEach((booking, i) => {
        const dateStr = booking.date.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })
        const isoDate = booking.date.toISOString()
        console.log(`${i + 1}. ${booking.playerName}`)
        console.log(`   📍 Cancha: ${booking.Court?.name}`)
        console.log(`   📅 Fecha: ${dateStr} (${isoDate})`)
        console.log(`   ⏰ Horario: ${booking.startTime} - ${booking.endTime}`)
        console.log(`   💰 Precio: ${booking.price} ${booking.currency}`)
        console.log(`   📋 Status: ${booking.status}`)
        console.log(`   💳 Pago: ${booking.paymentStatus}`)
        console.log(`   🆔 ID: ${booking.id}`)
        console.log(`   👥 Grupo: ${booking.bookingGroupId || 'Individual'}`)
        console.log(`   📝 Notas: ${booking.notes}`)
        console.log(`   🕒 Creado: ${booking.createdAt.toISOString()}`)
        console.log('')
      })
    }
    
    console.log('\n📋 TODOS LOS GRUPOS DE RESERVAS:')
    if (allGroups.length === 0) {
      console.log('   ❌ NO HAY GRUPOS DE RESERVAS')
    } else {
      allGroups.forEach((group, i) => {
        const dateStr = group.date.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' })
        const isoDate = group.date.toISOString()
        console.log(`${i + 1}. [GRUPO] ${group.playerName}`)
        console.log(`   📅 Fecha: ${dateStr} (${isoDate})`)
        console.log(`   ⏰ Horario: ${group.startTime} - ${group.endTime}`)
        console.log(`   💰 Precio: ${group.price} ${group.currency}`)
        console.log(`   📋 Status: ${group.status}`)
        console.log(`   🆔 ID: ${group.id}`)
        console.log(`   👥 Jugadores: ${group.totalPlayers}`)
        console.log(`   💰 Split Payment: ${group.splitPaymentEnabled ? 'Sí' : 'No'}`)
        console.log(`   📝 Notas: ${group.notes}`)
        console.log(`   🕒 Creado: ${group.createdAt.toISOString()}`)
        console.log(`   🏟️ Canchas en grupo: ${group.bookings?.map(b => b.Court?.name).join(', ')}`)
        console.log('')
      })
    }
    
    // Check for specific date (2025-09-23)
    const today = new Date('2025-09-23')
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    const todayBookings = await prisma.booking.findMany({
      where: {
        clubId: 'club-demo-001',
        date: {
          gte: startOfDay,
          lt: endOfDay
        },
        bookingGroupId: null // Solo individuales
      }
    })
    
    const todayGroups = await prisma.bookingGroup.findMany({
      where: {
        clubId: 'club-demo-001',
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })
    
    console.log('\n🎯 RESERVAS PARA HOY (2025-09-23):')
    console.log(`   Individuales: ${todayBookings.length}`)
    console.log(`   Grupos: ${todayGroups.length}`)
    console.log(`   Total que debería ver el usuario: ${todayBookings.length + todayGroups.length}`)
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error verificando datos:', error)
    await prisma.$disconnect()
  }
}

verifyProductionData().catch(console.error)