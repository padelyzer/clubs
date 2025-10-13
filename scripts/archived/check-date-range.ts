import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDateRange() {
  try {
    console.log('🔍 Verificando rango de fechas de las reservas...')
    console.log('=' .repeat(60))

    // Obtener rango de fechas
    const dateRange = await prisma.booking.aggregate({
      where: {
        status: { not: 'CANCELLED' }
      },
      _min: { date: true },
      _max: { date: true },
      _count: true
    })

    // Obtener distribución por mes
    const bookingsByMonth = await prisma.booking.groupBy({
      by: ['date'],
      _count: true,
      where: {
        status: { not: 'CANCELLED' }
      },
      orderBy: { date: 'asc' }
    })

    // Agrupar por mes-año
    const monthlyDistribution: Record<string, number> = {}
    bookingsByMonth.forEach(booking => {
      const date = new Date(booking.date)
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      monthlyDistribution[monthKey] = (monthlyDistribution[monthKey] || 0) + booking._count
    })

    console.log('📅 RANGO DE FECHAS:')
    console.log('-' .repeat(40))
    console.log(`🟢 Primera reserva: ${dateRange._min.date?.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`)
    console.log(`🔴 Última reserva: ${dateRange._max.date?.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`)
    console.log(`📊 Total reservas: ${dateRange._count}`)

    // Calcular duración del período
    if (dateRange._min.date && dateRange._max.date) {
      const daysDiff = Math.ceil((dateRange._max.date.getTime() - dateRange._min.date.getTime()) / (1000 * 60 * 60 * 24))
      console.log(`⏱️  Período total: ${daysDiff} días`)
      console.log(`📈 Promedio: ${(dateRange._count / daysDiff).toFixed(1)} reservas por día`)
    }

    console.log('\n📊 DISTRIBUCIÓN POR MES:')
    console.log('-' .repeat(40))
    Object.entries(monthlyDistribution)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([monthKey, count]) => {
        const [year, month] = monthKey.split('-')
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', { 
          month: 'long', 
          year: 'numeric' 
        })
        console.log(`${monthName}: ${count} reservas`)
      })

    console.log('=' .repeat(60))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDateRange()