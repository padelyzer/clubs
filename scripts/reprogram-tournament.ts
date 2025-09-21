import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function reprogramTournament() {
  console.log('🔄 Iniciando reprogramación del torneo...')
  
  try {
    // 1. Limpiar programación actual (quitar fechas y canchas)
    console.log('\n1️⃣ Limpiando programación actual...')
    const clearResult = await prisma.tournamentMatch.updateMany({
      data: {
        scheduledAt: null,
        courtId: null,
        courtNumber: null
      }
    })
    console.log(`   ✅ ${clearResult.count} partidos limpiados`)

    // 2. Obtener el club
    const club = await prisma.club.findFirst()
    if (!club) {
      throw new Error('No se encontró ningún club')
    }

    // 3. Eliminar canchas existentes
    console.log('\n2️⃣ Eliminando canchas existentes...')
    await prisma.court.deleteMany({
      where: { clubId: club.id }
    })
    console.log('   ✅ Canchas anteriores eliminadas')

    // 4. Crear 10 canchas nuevas
    console.log('\n3️⃣ Creando 10 canchas nuevas...')
    const courts = []
    for (let i = 1; i <= 10; i++) {
      const court = await prisma.court.create({
        data: {
          id: `court-${i}-${Date.now()}-${i}`,
          clubId: club.id,
          name: `Cancha ${i}`,
          type: 'PADEL',
          indoor: i <= 5, // Primeras 5 techadas, últimas 5 al aire libre
          active: true,
          order: i,
          updatedAt: new Date()
        }
      })
      courts.push(court)
      console.log(`   ✅ Cancha ${i} creada`)
    }

    // 5. Obtener todos los partidos del torneo
    console.log('\n4️⃣ Obteniendo partidos para reprogramar...')
    const tournament = await prisma.tournament.findFirst()
    if (!tournament) {
      throw new Error('No se encontró ningún torneo')
    }

    const matches = await prisma.tournamentMatch.findMany({
      where: { tournamentId: tournament.id },
      orderBy: [
        { round: 'asc' },
        { matchNumber: 'asc' }
      ]
    })
    console.log(`   📊 Total de partidos a programar: ${matches.length}`)

    // 6. Programar partidos distribuyendo entre las 10 canchas
    console.log('\n5️⃣ Programando partidos en las 10 canchas...')
    
    const matchDuration = 90 // minutos por partido
    const startHour = 8 // Comenzar a las 8:00 AM
    const endHour = 22 // Terminar a las 10:00 PM
    const maxSlotsPerDay = Math.floor((endHour - startHour) * 60 / matchDuration) // slots por cancha por día
    const totalSlotsPerDay = maxSlotsPerDay * courts.length // slots totales por día
    
    console.log(`   ⏰ Horario: ${startHour}:00 - ${endHour}:00`)
    console.log(`   📐 Duración por partido: ${matchDuration} minutos`)
    console.log(`   🎾 Slots por cancha por día: ${maxSlotsPerDay}`)
    console.log(`   📊 Capacidad total por día: ${totalSlotsPerDay} partidos`)

    const baseDate = new Date(tournament.startDate)
    let currentDate = new Date(baseDate)
    let currentSlot = 0
    let currentDay = 0

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i]
      
      // Calcular qué cancha y horario corresponde
      const daySlot = currentSlot % totalSlotsPerDay
      const courtIndex = daySlot % courts.length
      const timeSlot = Math.floor(daySlot / courts.length)
      
      // Si superamos los slots del día, pasar al siguiente día
      if (currentSlot > 0 && daySlot === 0) {
        currentDay++
        currentDate = new Date(baseDate)
        currentDate.setDate(currentDate.getDate() + currentDay)
      }
      
      // Calcular hora del partido
      const scheduledDate = new Date(currentDate)
      const hours = startHour + Math.floor(timeSlot * matchDuration / 60)
      const minutes = (timeSlot * matchDuration) % 60
      scheduledDate.setHours(hours, minutes, 0, 0)
      
      // Actualizar el partido
      await prisma.tournamentMatch.update({
        where: { id: match.id },
        data: {
          scheduledAt: scheduledDate,
          courtId: courts[courtIndex].id,
          courtNumber: String(courtIndex + 1)
        }
      })
      
      if (i % 10 === 0) {
        console.log(`   📅 Programados ${i + 1}/${matches.length} partidos...`)
      }
      
      currentSlot++
    }

    // 7. Resumen final
    console.log('\n✅ REPROGRAMACIÓN COMPLETADA')
    console.log('================================')
    console.log(`📊 Total de partidos programados: ${matches.length}`)
    console.log(`🎾 Canchas utilizadas: ${courts.length}`)
    console.log(`📅 Días necesarios: ${currentDay + 1}`)
    console.log(`📆 Fecha inicio: ${baseDate.toLocaleDateString('es-MX')}`)
    console.log(`📆 Fecha fin: ${currentDate.toLocaleDateString('es-MX')}`)
    
    // Mostrar distribución por día
    const matchesByDay = await prisma.tournamentMatch.groupBy({
      by: ['scheduledAt'],
      where: { 
        tournamentId: tournament.id,
        scheduledAt: { not: null }
      },
      _count: true
    })
    
    const dayMap = new Map()
    matchesByDay.forEach(group => {
      if (group.scheduledAt) {
        const day = new Date(group.scheduledAt).toDateString()
        dayMap.set(day, (dayMap.get(day) || 0) + group._count)
      }
    })
    
    console.log('\n📅 Distribución por día:')
    Array.from(dayMap.entries()).forEach(([day, count]) => {
      console.log(`   ${new Date(day).toLocaleDateString('es-MX')}: ${count} partidos`)
    })

  } catch (error) {
    console.error('❌ Error durante la reprogramación:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
reprogramTournament()
  .then(() => {
    console.log('\n🎉 Proceso completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error)
    process.exit(1)
  })