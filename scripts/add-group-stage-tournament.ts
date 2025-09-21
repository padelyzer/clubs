import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏆 Creando torneo de Fase de Grupos + Eliminación...')
  
  try {
    // Obtener el club
    const club = await prisma.club.findFirst()
    if (!club) {
      throw new Error('No se encontró ningún club')
    }
    
    // Obtener jugadores existentes
    const players = await prisma.player.findMany({
      where: { clubId: club.id },
      take: 32
    })
    
    if (players.length < 32) {
      throw new Error('No hay suficientes jugadores')
    }
    
    // Fechas
    const today = new Date()
    const in45Days = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000)
    const in50Days = new Date(today.getTime() + 50 * 24 * 60 * 60 * 1000)
    
    // Crear el torneo de grupos
    const tournament = await prisma.tournament.create({
      data: {
        name: 'Torneo Fase de Grupos + Eliminación - Masculino Open',
        description: 'Torneo con FASE DE GRUPOS seguida de ELIMINACIÓN DIRECTA. Primera fase: 4 grupos de 4 equipos cada uno jugando round robin (todos contra todos dentro del grupo). Los 2 mejores de cada grupo (8 equipos) avanzan a cuartos de final en formato de eliminación directa. Sistema de puntos en fase de grupos: 3 puntos por victoria, 1 por empate, 0 por derrota.',
        type: 'GROUP_STAGE',
        status: 'DRAFT',
        category: 'M_OPEN',
        startDate: in45Days,
        endDate: in50Days,
        registrationStart: today,
        registrationEnd: new Date(in45Days.getTime() - 5 * 24 * 60 * 60 * 1000),
        maxPlayers: 16, // 16 parejas = 32 jugadores
        registrationFee: 125000,
        prizePool: 1500000,
        rules: 'Fase de Grupos: 4 grupos de 4 equipos. Round robin dentro del grupo (3 partidos por equipo). Clasifican los 2 primeros de cada grupo. Fase Eliminación: Cuartos, Semifinales y Final. Partidos a 2 de 3 sets con tie-break.',
        clubId: club.id,
        createdBy: 'system',
        sets: 3,
        tiebreak: true
      }
    })
    
    console.log(`✅ Torneo creado: ${tournament.name} (ID: ${tournament.id})`)
    
    // Agregar inscripciones (16 parejas)
    console.log('Agregando inscripciones...')
    const malePlayers = players.filter((_, i) => i < 16)
    const femalePlayers = players.filter((_, i) => i >= 16)
    
    for (let i = 0; i < 16; i++) {
      // Alternamos entre parejas masculinas y mixtas para variedad
      const isMixedPair = i % 2 === 0
      
      await prisma.tournamentRegistration.create({
        data: {
          tournamentId: tournament.id,
          player1Id: malePlayers[i % malePlayers.length].id,
          player1Name: malePlayers[i % malePlayers.length].name,
          player1Email: malePlayers[i % malePlayers.length].email || '',
          player1Phone: malePlayers[i % malePlayers.length].phone || '0000000000',
          player2Id: isMixedPair 
            ? femalePlayers[i % femalePlayers.length].id 
            : malePlayers[(i + 1) % malePlayers.length].id,
          player2Name: isMixedPair 
            ? femalePlayers[i % femalePlayers.length].name
            : malePlayers[(i + 1) % malePlayers.length].name,
          player2Email: isMixedPair 
            ? femalePlayers[i % femalePlayers.length].email || ''
            : malePlayers[(i + 1) % malePlayers.length].email || '',
          player2Phone: isMixedPair 
            ? femalePlayers[i % femalePlayers.length].phone || '0000000000'
            : malePlayers[(i + 1) % malePlayers.length].phone || '0000000000',
          paymentStatus: 'completed',
          paidAmount: tournament.registrationFee,
          confirmed: true,
          checkedIn: false
        }
      })
    }
    
    console.log('✅ 16 inscripciones agregadas')
    
    // Generar estructura de grupos (sin partidos aún)
    const groups = ['Grupo A', 'Grupo B', 'Grupo C', 'Grupo D']
    const courts = await prisma.court.findMany({ where: { clubId: club.id }, take: 4 })
    
    console.log('Generando estructura de grupos...')
    
    // Para cada grupo, crear los partidos round robin (6 partidos por grupo)
    for (let g = 0; g < groups.length; g++) {
      const groupName = groups[g]
      // En un grupo de 4 equipos, hay 6 partidos posibles (combinaciones de 4 tomados de 2 en 2)
      // Equipo 1 vs 2, 1 vs 3, 1 vs 4, 2 vs 3, 2 vs 4, 3 vs 4
      const matchups = [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [1, 3],
        [2, 3]
      ]
      
      for (let m = 0; m < matchups.length; m++) {
        await prisma.tournamentMatch.create({
          data: {
            tournamentId: tournament.id,
            round: groupName,
            matchNumber: m + 1,
            status: 'SCHEDULED',
            courtId: courts[g % courts.length].id,
            scheduledAt: new Date(in45Days.getTime() + (g * 3 + Math.floor(m / 2)) * 60 * 60 * 1000),
            // Los jugadores se asignarán cuando se organicen los grupos
            player1Name: `${groupName} - Equipo ${matchups[m][0] + 1}`,
            player2Name: `${groupName} - Equipo ${matchups[m][1] + 1}`
          }
        })
      }
    }
    
    // Crear estructura para fase eliminatoria (vacía por ahora)
    const knockoutRounds = ['Cuartos de Final', 'Semifinal', 'Final']
    const knockoutMatches = [4, 2, 1] // Número de partidos por ronda
    
    for (let r = 0; r < knockoutRounds.length; r++) {
      for (let m = 0; m < knockoutMatches[r]; m++) {
        await prisma.tournamentMatch.create({
          data: {
            tournamentId: tournament.id,
            round: knockoutRounds[r],
            matchNumber: m + 1,
            status: 'SCHEDULED',
            courtId: courts[m % courts.length].id,
            scheduledAt: new Date(in45Days.getTime() + (48 + r * 24) * 60 * 60 * 1000),
            // Los jugadores se determinarán según los ganadores de grupos
            player1Name: r === 0 ? `Ganador ${m < 2 ? '1°' : '2°'} Grupo ${String.fromCharCode(65 + (m % 4))}` : 'Por definir',
            player2Name: r === 0 ? `Ganador ${m < 2 ? '2°' : '1°'} Grupo ${String.fromCharCode(65 + ((m + 2) % 4))}` : 'Por definir'
          }
        })
      }
    }
    
    console.log('✅ Estructura de grupos y eliminación creada')
    
    // Verificar el resultado
    const matchCount = await prisma.tournamentMatch.count({
      where: { tournamentId: tournament.id }
    })
    
    console.log('\n📊 Resumen del torneo creado:')
    console.log(`- Nombre: ${tournament.name}`)
    console.log(`- Tipo: ${tournament.type}`)
    console.log(`- Inscripciones: 16 parejas`)
    console.log(`- Partidos totales: ${matchCount}`)
    console.log(`  - Fase de grupos: 24 partidos (6 por grupo × 4 grupos)`)
    console.log(`  - Fase eliminatoria: 7 partidos (4 cuartos + 2 semis + 1 final)`)
    console.log(`- Premio total: $${tournament.prizePool.toLocaleString()} COP`)
    
  } catch (error) {
    console.error('Error creando torneo de grupos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()