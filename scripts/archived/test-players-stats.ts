import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPlayersStats() {
  console.log('\n📊 PRUEBAS DE ESTADÍSTICAS - MÓDULO DE CLIENTES')
  console.log('=' .repeat(50))
  
  try {
    // Get club
    const club = await prisma.club.findFirst()
    if (!club) throw new Error('No club found')
    
    // Test 1: Estadísticas generales del club
    console.log('\n🏢 TEST 1: ESTADÍSTICAS GENERALES DEL CLUB')
    console.log('-'.repeat(30))
    
    const totalPlayers = await prisma.player.count({
      where: { clubId: club.id }
    })
    
    const activePlayers = await prisma.player.count({
      where: { clubId: club.id, active: true }
    })
    
    const playersWithEmail = await prisma.player.count({
      where: { 
        clubId: club.id,
        email: { not: null }
      }
    })
    
    const playersWithLevel = await prisma.player.count({
      where: {
        clubId: club.id,
        level: { not: null }
      }
    })
    
    const playersWithBirthdate = await prisma.player.count({
      where: {
        clubId: club.id,
        birthDate: { not: null }
      }
    })
    
    console.log(`  📈 Métricas del club:`)
    console.log(`     Total de clientes: ${totalPlayers}`)
    console.log(`     Clientes activos: ${activePlayers} (${((activePlayers/totalPlayers)*100).toFixed(1)}%)`)
    console.log(`     Con email: ${playersWithEmail} (${((playersWithEmail/totalPlayers)*100).toFixed(1)}%)`)
    console.log(`     Con nivel: ${playersWithLevel} (${((playersWithLevel/totalPlayers)*100).toFixed(1)}%)`)
    console.log(`     Con fecha nacimiento: ${playersWithBirthdate} (${((playersWithBirthdate/totalPlayers)*100).toFixed(1)}%)`)
    
    // Test 2: Segmentación por género
    console.log('\n👥 TEST 2: SEGMENTACIÓN POR GÉNERO')
    console.log('-'.repeat(30))
    
    const genderStats = await prisma.player.groupBy({
      by: ['gender'],
      where: { clubId: club.id },
      _count: true
    })
    
    console.log(`  📊 Distribución por género:`)
    genderStats.forEach(stat => {
      const gender = stat.gender || 'No especificado'
      const percentage = ((stat._count / totalPlayers) * 100).toFixed(1)
      console.log(`     ${gender}: ${stat._count} (${percentage}%)`)
    })
    
    // Test 3: Segmentación por nivel
    console.log('\n🎾 TEST 3: SEGMENTACIÓN POR NIVEL')
    console.log('-'.repeat(30))
    
    const levelStats = await prisma.player.groupBy({
      by: ['level'],
      where: { 
        clubId: club.id,
        level: { not: null }
      },
      _count: true,
      orderBy: {
        level: 'asc'
      }
    })
    
    console.log(`  🏆 Distribución por nivel:`)
    levelStats.forEach(stat => {
      const percentage = ((stat._count / totalPlayers) * 100).toFixed(1)
      console.log(`     ${stat.level}: ${stat._count} jugadores (${percentage}%)`)
    })
    
    // Test 4: Análisis de edad (si hay fechas de nacimiento)
    console.log('\n🎂 TEST 4: ANÁLISIS DE EDAD')
    console.log('-'.repeat(30))
    
    const playersWithAge = await prisma.player.findMany({
      where: {
        clubId: club.id,
        birthDate: { not: null }
      },
      select: {
        birthDate: true
      }
    })
    
    if (playersWithAge.length > 0) {
      const ages = playersWithAge.map(p => {
        const birthDate = new Date(p.birthDate!)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        return age
      })
      
      const avgAge = ages.reduce((sum, age) => sum + age, 0) / ages.length
      const minAge = Math.min(...ages)
      const maxAge = Math.max(...ages)
      
      console.log(`  📊 Estadísticas de edad:`)
      console.log(`     Edad promedio: ${avgAge.toFixed(1)} años`)
      console.log(`     Edad mínima: ${minAge} años`)
      console.log(`     Edad máxima: ${maxAge} años`)
      
      // Grupos de edad
      const ageGroups = {
        '18-25': ages.filter(a => a >= 18 && a <= 25).length,
        '26-35': ages.filter(a => a >= 26 && a <= 35).length,
        '36-45': ages.filter(a => a >= 36 && a <= 45).length,
        '46-55': ages.filter(a => a >= 46 && a <= 55).length,
        '56+': ages.filter(a => a >= 56).length
      }
      
      console.log(`\n  👥 Grupos de edad:`)
      Object.entries(ageGroups).forEach(([group, count]) => {
        console.log(`     ${group}: ${count} clientes`)
      })
    } else {
      console.log(`  ℹ️ No hay suficientes datos de edad`)
    }
    
    // Test 5: Análisis financiero
    console.log('\n💰 TEST 5: ANÁLISIS FINANCIERO')
    console.log('-'.repeat(30))
    
    // Top 10 clientes por ingresos
    const topSpenders = await prisma.$queryRaw`
      SELECT 
        b."playerPhone",
        b."playerName",
        COUNT(*) as booking_count,
        SUM(b.price) as total_spent,
        AVG(b.price) as avg_booking_value
      FROM "Booking" b
      WHERE b."clubId" = ${club.id}
        AND b."paymentStatus" = 'completed'
      GROUP BY b."playerPhone", b."playerName"
      ORDER BY total_spent DESC
      LIMIT 10
    ` as any[]
    
    console.log(`\n  💎 Top 10 clientes por ingresos:`)
    topSpenders.forEach((client, index) => {
      const totalSpent = Number(client.total_spent) / 100
      const avgValue = Number(client.avg_booking_value) / 100
      console.log(`     ${index + 1}. ${client.playerName}:`)
      console.log(`        Total: $${totalSpent} MXN`)
      console.log(`        Reservas: ${client.booking_count}`)
      console.log(`        Ticket promedio: $${avgValue.toFixed(0)} MXN`)
    })
    
    // Ingresos totales del club
    const totalRevenue = await prisma.booking.aggregate({
      where: {
        clubId: club.id,
        paymentStatus: 'completed'
      },
      _sum: {
        price: true
      },
      _count: true,
      _avg: {
        price: true
      }
    })
    
    console.log(`\n  💵 Métricas financieras globales:`)
    console.log(`     Ingresos totales: $${(totalRevenue._sum.price || 0) / 100} MXN`)
    console.log(`     Total de transacciones: ${totalRevenue._count}`)
    console.log(`     Ticket promedio: $${((totalRevenue._avg.price || 0) / 100).toFixed(0)} MXN`)
    
    // Test 6: Análisis de retención y actividad
    console.log('\n🔄 TEST 6: ANÁLISIS DE RETENCIÓN Y ACTIVIDAD')
    console.log('-'.repeat(30))
    
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixtyDaysAgo = new Date(now)
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    const ninetyDaysAgo = new Date(now)
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    // Clientes activos por período
    const active30Days = await prisma.booking.findMany({
      where: {
        clubId: club.id,
        date: { gte: thirtyDaysAgo },
        status: { in: ['COMPLETED', 'CONFIRMED'] }
      },
      select: { playerPhone: true },
      distinct: ['playerPhone']
    })
    
    const active60Days = await prisma.booking.findMany({
      where: {
        clubId: club.id,
        date: { gte: sixtyDaysAgo },
        status: { in: ['COMPLETED', 'CONFIRMED'] }
      },
      select: { playerPhone: true },
      distinct: ['playerPhone']
    })
    
    const active90Days = await prisma.booking.findMany({
      where: {
        clubId: club.id,
        date: { gte: ninetyDaysAgo },
        status: { in: ['COMPLETED', 'CONFIRMED'] }
      },
      select: { playerPhone: true },
      distinct: ['playerPhone']
    })
    
    console.log(`  📅 Clientes activos por período:`)
    console.log(`     Últimos 30 días: ${active30Days.length} clientes`)
    console.log(`     Últimos 60 días: ${active60Days.length} clientes`)
    console.log(`     Últimos 90 días: ${active90Days.length} clientes`)
    
    // Tasa de retención
    if (active90Days.length > 0) {
      const retention60to30 = (active30Days.length / active60Days.length * 100).toFixed(1)
      const retention90to30 = (active30Days.length / active90Days.length * 100).toFixed(1)
      
      console.log(`\n  📊 Tasas de retención:`)
      console.log(`     60 → 30 días: ${retention60to30}%`)
      console.log(`     90 → 30 días: ${retention90to30}%`)
    }
    
    // Test 7: Análisis de frecuencia
    console.log('\n📈 TEST 7: ANÁLISIS DE FRECUENCIA')
    console.log('-'.repeat(30))
    
    const frequencyAnalysis = await prisma.$queryRaw`
      SELECT 
        booking_count,
        COUNT(*) as player_count
      FROM (
        SELECT 
          "playerPhone",
          COUNT(*) as booking_count
        FROM "Booking"
        WHERE "clubId" = ${club.id}
          AND status IN ('COMPLETED', 'CONFIRMED')
        GROUP BY "playerPhone"
      ) as player_bookings
      GROUP BY booking_count
      ORDER BY booking_count ASC
    ` as any[]
    
    console.log(`  📊 Distribución de frecuencia:`)
    frequencyAnalysis.forEach(freq => {
      const bookings = Number(freq.booking_count)
      const players = Number(freq.player_count)
      console.log(`     ${bookings} reserva(s): ${players} cliente(s)`)
    })
    
    // Clasificación de clientes
    const oneTimeCustomers = frequencyAnalysis
      .filter((f: any) => Number(f.booking_count) === 1)
      .reduce((sum: number, f: any) => sum + Number(f.player_count), 0)
    
    const regularCustomers = frequencyAnalysis
      .filter((f: any) => Number(f.booking_count) >= 2 && Number(f.booking_count) <= 5)
      .reduce((sum: number, f: any) => sum + Number(f.player_count), 0)
    
    const frequentCustomers = frequencyAnalysis
      .filter((f: any) => Number(f.booking_count) > 5)
      .reduce((sum: number, f: any) => sum + Number(f.player_count), 0)
    
    console.log(`\n  🎯 Clasificación de clientes:`)
    console.log(`     Una vez: ${oneTimeCustomers} clientes`)
    console.log(`     Regulares (2-5): ${regularCustomers} clientes`)
    console.log(`     Frecuentes (6+): ${frequentCustomers} clientes`)
    
    // Test 8: Análisis de conversión
    console.log('\n🎯 TEST 8: ANÁLISIS DE CONVERSIÓN')
    console.log('-'.repeat(30))
    
    // Clientes registrados vs clientes con reservas
    const playersWithBookings = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT p.id) as count
      FROM "Player" p
      WHERE p."clubId" = ${club.id}
        AND EXISTS (
          SELECT 1 FROM "Booking" b 
          WHERE b."playerPhone" = p.phone 
            AND b."clubId" = ${club.id}
        )
    ` as any[]
    
    const conversionRate = totalPlayers > 0 
      ? (Number(playersWithBookings[0].count) / totalPlayers * 100).toFixed(1)
      : 0
    
    console.log(`  📊 Métricas de conversión:`)
    console.log(`     Clientes registrados: ${totalPlayers}`)
    console.log(`     Con al menos 1 reserva: ${playersWithBookings[0].count}`)
    console.log(`     Tasa de conversión: ${conversionRate}%`)
    
    // Tasa de cancelación por cliente
    const cancellationStats = await prisma.$queryRaw`
      SELECT 
        AVG(cancellation_rate) as avg_cancellation_rate,
        MAX(cancellation_rate) as max_cancellation_rate
      FROM (
        SELECT 
          "playerPhone",
          COUNT(CASE WHEN status IN ('CANCELLED', 'NO_SHOW') THEN 1 END)::float / 
          COUNT(*)::float * 100 as cancellation_rate
        FROM "Booking"
        WHERE "clubId" = ${club.id}
        GROUP BY "playerPhone"
        HAVING COUNT(*) > 1
      ) as player_cancellations
    ` as any[]
    
    if (cancellationStats[0].avg_cancellation_rate) {
      console.log(`\n  ❌ Tasas de cancelación:`)
      console.log(`     Promedio por cliente: ${Number(cancellationStats[0].avg_cancellation_rate).toFixed(1)}%`)
      console.log(`     Máxima: ${Number(cancellationStats[0].max_cancellation_rate).toFixed(1)}%`)
    }
    
    console.log('\n✅ PRUEBAS DE ESTADÍSTICAS COMPLETADAS')
    
  } catch (error) {
    console.error('❌ Error en pruebas:', error)
    throw error
  }
}

testPlayersStats()
  .catch(console.error)
  .finally(() => prisma.$disconnect())