import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Verificando estado de la base de datos...')
    console.log('=' .repeat(60))

    // Verificar conexión
    await prisma.$connect()
    console.log('✅ Conexión a base de datos exitosa')
    
    // Contar registros en todas las tablas principales
    const [
      clubCount,
      userCount, 
      courtCount,
      playerCount,
      bookingCount,
      transactionCount,
      classCount,
      expenseCount
    ] = await Promise.all([
      prisma.club.count(),
      prisma.user.count(),
      prisma.court.count(), 
      prisma.player.count(),
      prisma.booking.count(),
      prisma.transaction.count(),
      prisma.class.count(),
      prisma.expense.count()
    ])

    console.log('\n📊 CONTENIDO DE LA BASE DE DATOS:')
    console.log('=' .repeat(60))
    console.log(`🏢 Clubes: ${clubCount}`)
    console.log(`👤 Usuarios: ${userCount}`) 
    console.log(`🎾 Canchas: ${courtCount}`)
    console.log(`👥 Jugadores: ${playerCount}`)
    console.log(`📅 Reservas: ${bookingCount}`)
    console.log(`💰 Transacciones: ${transactionCount}`)
    console.log(`🎓 Clases: ${classCount}`)
    console.log(`💸 Gastos: ${expenseCount}`)

    // Verificar datos recientes de reservas
    if (bookingCount > 0) {
      const recentBookings = await prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          court: { select: { name: true } }
        }
      })

      console.log('\n🆕 RESERVAS MÁS RECIENTES:')
      console.log('-' .repeat(60))
      recentBookings.forEach((booking, i) => {
        console.log(`${i + 1}. ${booking.playerName} - ${booking.court?.name} - ${booking.date.toLocaleDateString()} - $${(booking.price / 100).toFixed(0)} MXN`)
      })
    }

    // Verificar ingresos totales
    if (transactionCount > 0) {
      const totalIncome = await prisma.transaction.aggregate({
        where: { type: 'INCOME' },
        _sum: { amount: true },
        _count: true
      })

      const totalExpenses = await prisma.transaction.aggregate({
        where: { type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true
      })

      console.log('\n💰 RESUMEN FINANCIERO:')
      console.log('-' .repeat(60))
      console.log(`💚 Total Ingresos: $${((totalIncome._sum.amount || 0) / 100).toLocaleString('es-MX')} MXN (${totalIncome._count} transacciones)`)
      console.log(`🔴 Total Gastos: $${((totalExpenses._sum.amount || 0) / 100).toLocaleString('es-MX')} MXN (${totalExpenses._count} transacciones)`)
      console.log(`📈 Ganancia: $${(((totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0)) / 100).toLocaleString('es-MX')} MXN`)
    }

    // Verificar distribución por fecha
    if (bookingCount > 0) {
      const bookingsByMonth = await prisma.booking.groupBy({
        by: ['date'],
        _count: true,
        orderBy: { date: 'asc' },
        take: 10
      })

      console.log('\n📅 DISTRIBUCIÓN DE RESERVAS POR FECHA:')
      console.log('-' .repeat(60))
      bookingsByMonth.forEach(group => {
        console.log(`${group.date.toLocaleDateString()}: ${group._count} reservas`)
      })
    }

    // Verificar si tenemos el usuario admin
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@padelpremium.mx' },
      include: { club: { select: { name: true } } }
    })

    if (adminUser) {
      console.log('\n👨‍💼 USUARIO ADMINISTRADOR:')
      console.log('-' .repeat(60))
      console.log(`✅ Email: ${adminUser.email}`)
      console.log(`✅ Nombre: ${adminUser.name}`)
      console.log(`✅ Club: ${adminUser.club?.name}`)
      console.log(`✅ Rol: ${adminUser.role}`)
      console.log(`✅ Activo: ${adminUser.active ? 'Sí' : 'No'}`)
    } else {
      console.log('\n❌ No se encontró usuario administrador')
    }

    console.log('\n🎯 ESTADO GENERAL DEL SISTEMA:')
    console.log('=' .repeat(60))
    
    if (bookingCount >= 500) {
      console.log('✅ Sistema COMPLETAMENTE POBLADO con datos de demostración')
      console.log(`✅ ${bookingCount} reservas generadas exitosamente`)
    } else if (bookingCount > 50) {
      console.log('⚠️ Sistema parcialmente poblado')
      console.log(`⚠️ ${bookingCount} reservas (se esperaban 500+)`)
    } else {
      console.log('❌ Sistema requiere población de datos')
      console.log('💡 Ejecuta: npx tsx scripts/mass-bookings-generator.ts')
    }

    console.log(`💾 Base de datos: PostgreSQL (padelyzer_db)`)
    console.log(`🔌 URL: postgresql://localhost:5432/padelyzer_db`)
    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error verificando base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseStatus()