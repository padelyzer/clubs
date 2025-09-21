import { PrismaClient } from '@prisma/client'
import { addDays, format, startOfDay } from 'date-fns'

const prisma = new PrismaClient()

async function generateMassBookings() {
  console.log('🚀 Iniciando generación masiva de 500 reservas...')

  try {
    // Obtener datos existentes
    const club = await prisma.club.findFirst()
    const user = await prisma.user.findFirst()
    const courts = await prisma.court.findMany()
    const players = await prisma.player.findMany()

    if (!club || !user || courts.length === 0) {
      console.log('❌ Error: Ejecuta primero el seed básico (npm run seed)')
      return
    }

    // Datos realistas para reservas
    const nombres = [
      'Carlos Martínez', 'María García', 'José López', 'Ana Rodríguez',
      'Miguel Hernández', 'Laura Sánchez', 'David González', 'Carmen Torres',
      'Francisco Ruiz', 'Elena Morales', 'Antonio Jiménez', 'Sara Delgado',
      'Manuel Castro', 'Isabel Ramos', 'Rafael Ortega', 'Patricia Moreno',
      'Alejandro Muñoz', 'Lucía Álvarez', 'Fernando Romero', 'Cristina Navarro',
      'Roberto Silva', 'Valentina Cruz', 'Andrés Vega', 'Sofía Mendoza',
      'Gabriel Reyes', 'Camila Herrera', 'Diego Vargas', 'Natalia Peña'
    ]

    const metodsPago = [
      'EFECTIVO', 'TARJETA_CREDITO', 'TARJETA_DEBITO', 
      'TRANSFERENCIA', 'PAYPAL', 'STRIPE', 'MERCADO_PAGO'
    ]

    const horarios = [
      { inicio: '08:00', fin: '09:30' },
      { inicio: '09:30', fin: '11:00' },
      { inicio: '11:00', fin: '12:30' },
      { inicio: '12:30', fin: '14:00' },
      { inicio: '14:00', fin: '15:30' },
      { inicio: '15:30', fin: '17:00' },
      { inicio: '17:00', fin: '18:30' },
      { inicio: '18:30', fin: '20:00' },
      { inicio: '20:00', fin: '21:30' }
    ]

    const duraciones = [90, 120] // minutos
    const precios = [80000, 100000, 120000, 150000] // centavos

    let reservasCreadas = 0
    let ingresoTotal = 0
    const hoy = new Date()

    console.log(`📊 Datos disponibles:`)
    console.log(`🏢 Club: ${club.name}`)
    console.log(`🎾 Canchas: ${courts.length}`)
    console.log(`👥 Jugadores base: ${players.length}`)

    // Generar reservas para los próximos 90 días
    for (let dia = 1; dia <= 90 && reservasCreadas < 500; dia++) {
      const fecha = addDays(startOfDay(hoy), dia)
      const fechaStr = format(fecha, 'yyyy-MM-dd')
      
      // Más reservas en fines de semana
      const esFinde = fecha.getDay() === 0 || fecha.getDay() === 6
      const reservasPorDia = esFinde 
        ? Math.floor(Math.random() * 8) + 8  // 8-15 reservas
        : Math.floor(Math.random() * 6) + 4  // 4-9 reservas

      console.log(`📅 ${fechaStr} (${esFinde ? 'Fin de semana' : 'Entre semana'}): ${reservasPorDia} reservas`)

      const reservasDelDia = []
      const transaccionesDelDia = []

      for (let r = 0; r < reservasPorDia && reservasCreadas < 500; r++) {
        // Seleccionar datos aleatorios
        const cliente = nombres[Math.floor(Math.random() * nombres.length)]
        const court = courts[Math.floor(Math.random() * courts.length)]
        const horario = horarios[Math.floor(Math.random() * horarios.length)]
        const duracion = duraciones[Math.floor(Math.random() * duraciones.length)]
        const precio = precios[Math.floor(Math.random() * precios.length)]
        const metodoPago = metodsPago[Math.floor(Math.random() * metodsPago.length)]
        const totalJugadores = Math.floor(Math.random() * 3) + 2 // 2-4 jugadores

        // Aplicar variación de precios
        let precioFinal = precio
        if (esFinde) precioFinal *= 1.2 // 20% más caro en fines de semana
        if (Math.random() < 0.1) precioFinal *= 0.8 // 10% descuento promocional

        precioFinal = Math.floor(precioFinal)

        const email = cliente.toLowerCase()
          .replace(' ', '.')
          .replace(/[áàäâ]/g, 'a')
          .replace(/[éèëê]/g, 'e')
          .replace(/[íìïî]/g, 'i')
          .replace(/[óòöô]/g, 'o')
          .replace(/[úùüû]/g, 'u')
          + '@example.com'

        const telefono = '55' + Math.floor(Math.random() * 90000000 + 10000000)

        // Status de pago realista
        const statusPago = Math.random() < 0.95 ? 'completed' : 
                          Math.random() < 0.7 ? 'pending' : 'failed'
        
        const statusReserva = statusPago === 'completed' ? 'CONFIRMED' :
                             statusPago === 'pending' ? 'PENDING' : 'CANCELLED'

        // Crear reserva
        const reservaData = {
          clubId: club.id,
          courtId: court.id,
          date: fecha,
          startTime: horario.inicio,
          endTime: horario.fin,
          duration: duracion,
          playerName: cliente,
          playerEmail: email,
          playerPhone: telefono,
          totalPlayers: totalJugadores,
          price: precioFinal,
          paymentStatus: statusPago,
          status: statusReserva
        }

        reservasDelDia.push(reservaData)

        // Solo crear transacción si el pago fue exitoso
        if (statusPago === 'completed') {
          const transaccionData = {
            clubId: club.id,
            type: 'INCOME',
            category: 'BOOKING',
            amount: precioFinal,
            currency: 'MXN',
            description: `Reserva ${court.name} - ${cliente}`,
            date: fecha,
            createdBy: user.id
          }

          transaccionesDelDia.push(transaccionData)
          ingresoTotal += precioFinal
        }

        reservasCreadas++
      }

      // Insertar reservas del día en lote
      if (reservasDelDia.length > 0) {
        const reservasInsertadas = await prisma.booking.createMany({
          data: reservasDelDia,
          skipDuplicates: true
        })

        console.log(`  ✅ ${reservasInsertadas.count} reservas creadas`)
      }

      // Insertar transacciones del día en lote  
      if (transaccionesDelDia.length > 0) {
        const transaccionesInsertadas = await prisma.transaction.createMany({
          data: transaccionesDelDia,
          skipDuplicates: true
        })

        console.log(`  💰 ${transaccionesInsertadas.count} transacciones creadas`)
      }

      // Mostrar progreso cada 10 días
      if (dia % 10 === 0) {
        console.log(`🎯 Progreso: ${reservasCreadas}/500 reservas | $${(ingresoTotal / 100).toLocaleString('es-MX')} MXN`)
      }
    }

    // Estadísticas finales
    const totalReservas = await prisma.booking.count({ where: { clubId: club.id } })
    const totalTransacciones = await prisma.transaction.count({ 
      where: { clubId: club.id, type: 'INCOME' } 
    })
    
    const ingresosTotales = await prisma.transaction.aggregate({
      where: { clubId: club.id, type: 'INCOME' },
      _sum: { amount: true }
    })

    // Distribución por método de pago (simulada)
    const distribucionPagos = metodsPago.map(metodo => ({
      metodo,
      cantidad: Math.floor(reservasCreadas * (0.1 + Math.random() * 0.2)),
      porcentaje: (10 + Math.random() * 20).toFixed(1)
    }))

    console.log('\n' + '='.repeat(80))
    console.log('🏆 GENERACIÓN MASIVA DE RESERVAS COMPLETADA!')
    console.log('='.repeat(80))
    console.log(`✅ Total de reservas en sistema: ${totalReservas}`)
    console.log(`💰 Total de transacciones: ${totalTransacciones}`)
    console.log(`🤑 Ingresos totales: $${((ingresosTotales._sum.amount || 0) / 100).toLocaleString('es-MX')} MXN`)
    console.log(`📈 Promedio por reserva: $${(((ingresosTotales._sum.amount || 0) / totalReservas) / 100).toFixed(0)} MXN`)
    console.log(`📅 Periodo de reservas: 90 días futuros`)
    console.log(`🏟️ Canchas activas: ${courts.length}`)
    
    console.log('\n📊 DISTRIBUCIÓN DE MÉTODOS DE PAGO (estimada):')
    distribucionPagos.forEach(pago => {
      console.log(`  ${pago.metodo}: ${pago.cantidad} reservas (${pago.porcentaje}%)`)
    })

    console.log('\n🎯 MÉTRICAS DE OCUPACIÓN:')
    console.log(`  📊 Reservas por día promedio: ${(totalReservas / 90).toFixed(1)}`)
    console.log(`  🎾 Utilización por cancha: ${(totalReservas / courts.length).toFixed(0)} reservas`)
    console.log(`  💵 Ingreso diario promedio: $${(((ingresosTotales._sum.amount || 0) / 90) / 100).toLocaleString('es-MX')} MXN`)
    
    console.log('='.repeat(80))
    console.log('🎾 ¡Sistema listo para demostraciones con datos realistas!')

  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateMassBookings()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

export { generateMassBookings }