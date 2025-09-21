import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🎾 Configurando demo de torneos...')
  
  try {
    // 1. Eliminar torneos existentes
    console.log('Eliminando torneos existentes...')
    
    // Verificar si las tablas existen antes de eliminar
    try {
      await prisma.tournamentMatch.deleteMany()
    } catch (e) {
      console.log('Tabla TournamentMatch no existe o está vacía')
    }
    
    try {
      await prisma.tournamentRegistration.deleteMany()
    } catch (e) {
      console.log('Tabla TournamentRegistration no existe o está vacía')
    }
    
    try {
      await prisma.tournamentPayment.deleteMany()
    } catch (e) {
      console.log('Tabla TournamentPayment no existe o está vacía')
    }
    
    try {
      await prisma.tournament.deleteMany()
    } catch (e) {
      console.log('Tabla Tournament no existe o está vacía')
    }
    
    // 2. Obtener el club existente
    const club = await prisma.club.findFirst()
    if (!club) {
      throw new Error('No se encontró ningún club. Ejecuta primero el seed principal.')
    }
    console.log(`Usando club: ${club.name}`)
    
    // 3. Obtener canchas existentes
    const courts = await prisma.court.findMany({
      where: { clubId: club.id },
      take: 4
    })
    
    if (courts.length < 4) {
      console.log('Creando canchas faltantes...')
      const courtsToCreate = 4 - courts.length
      for (let i = courts.length + 1; i <= 4; i++) {
        const newCourt = await prisma.court.create({
          data: {
            name: `Cancha ${i}`,
            clubId: club.id,
            active: true,
            order: i,
            indoor: false
          }
        })
        courts.push(newCourt)
      }
    }
    console.log(`Canchas disponibles: ${courts.map(c => c.name).join(', ')}`)
    
    // 4. Crear jugadores si no existen suficientes
    console.log('Creando jugadores...')
    const playerNames = [
      // Masculino
      { name: 'Carlos Rodríguez', email: 'carlos.rodriguez@demo.com', gender: 'MALE' },
      { name: 'Juan Martínez', email: 'juan.martinez@demo.com', gender: 'MALE' },
      { name: 'Pedro García', email: 'pedro.garcia@demo.com', gender: 'MALE' },
      { name: 'Miguel López', email: 'miguel.lopez@demo.com', gender: 'MALE' },
      { name: 'Antonio Pérez', email: 'antonio.perez@demo.com', gender: 'MALE' },
      { name: 'Francisco González', email: 'francisco.gonzalez@demo.com', gender: 'MALE' },
      { name: 'Manuel Sánchez', email: 'manuel.sanchez@demo.com', gender: 'MALE' },
      { name: 'José Ramírez', email: 'jose.ramirez@demo.com', gender: 'MALE' },
      { name: 'David Torres', email: 'david.torres@demo.com', gender: 'MALE' },
      { name: 'Alejandro Flores', email: 'alejandro.flores@demo.com', gender: 'MALE' },
      { name: 'Luis Herrera', email: 'luis.herrera@demo.com', gender: 'MALE' },
      { name: 'Jorge Castro', email: 'jorge.castro@demo.com', gender: 'MALE' },
      { name: 'Roberto Vargas', email: 'roberto.vargas@demo.com', gender: 'MALE' },
      { name: 'Fernando Morales', email: 'fernando.morales@demo.com', gender: 'MALE' },
      { name: 'Alberto Ramos', email: 'alberto.ramos@demo.com', gender: 'MALE' },
      { name: 'Ricardo Silva', email: 'ricardo.silva@demo.com', gender: 'MALE' },
      
      // Femenino
      { name: 'María García', email: 'maria.garcia@demo.com', gender: 'FEMALE' },
      { name: 'Ana Martínez', email: 'ana.martinez@demo.com', gender: 'FEMALE' },
      { name: 'Laura López', email: 'laura.lopez@demo.com', gender: 'FEMALE' },
      { name: 'Carmen Rodríguez', email: 'carmen.rodriguez@demo.com', gender: 'FEMALE' },
      { name: 'Isabel Pérez', email: 'isabel.perez@demo.com', gender: 'FEMALE' },
      { name: 'Patricia González', email: 'patricia.gonzalez@demo.com', gender: 'FEMALE' },
      { name: 'Sofía Sánchez', email: 'sofia.sanchez@demo.com', gender: 'FEMALE' },
      { name: 'Elena Ramírez', email: 'elena.ramirez@demo.com', gender: 'FEMALE' },
      { name: 'Lucía Torres', email: 'lucia.torres@demo.com', gender: 'FEMALE' },
      { name: 'Marta Flores', email: 'marta.flores@demo.com', gender: 'FEMALE' },
      { name: 'Rosa Herrera', email: 'rosa.herrera@demo.com', gender: 'FEMALE' },
      { name: 'Paula Castro', email: 'paula.castro@demo.com', gender: 'FEMALE' },
      { name: 'Andrea Vargas', email: 'andrea.vargas@demo.com', gender: 'FEMALE' },
      { name: 'Cristina Morales', email: 'cristina.morales@demo.com', gender: 'FEMALE' },
      { name: 'Beatriz Ramos', email: 'beatriz.ramos@demo.com', gender: 'FEMALE' },
      { name: 'Silvia Silva', email: 'silvia.silva@demo.com', gender: 'FEMALE' }
    ]
    
    const players = []
    for (const playerData of playerNames) {
      let player = await prisma.player.findFirst({
        where: { email: playerData.email }
      })
      
      if (!player) {
        player = await prisma.player.create({
          data: {
            name: playerData.name,
            email: playerData.email,
            phone: '555' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0'),
            level: Math.random() < 0.3 ? 'ADVANCED' : Math.random() < 0.6 ? 'INTERMEDIATE' : 'BEGINNER',
            clubId: club.id
          }
        })
      }
      players.push(player)
    }
    console.log(`Total de jugadores: ${players.length}`)
    
    // 5. Crear los 3 torneos
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    const twoMonths = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
    
    console.log('Creando torneos...')
    
    // Torneo 1: Eliminación Directa - Masculino 3ra Categoría
    const tournament1 = await prisma.tournament.create({
      data: {
        name: 'Torneo Relámpago Masculino 3ra',
        description: 'Torneo eliminación directa para jugadores masculinos de tercera categoría. Formato de partidos a 2 de 3 sets.',
        type: 'SINGLE_ELIMINATION',
        status: 'DRAFT',
        category: 'M_3F',
        startDate: nextWeek,
        endDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
        registrationStart: today,
        registrationEnd: new Date(nextWeek.getTime() - 24 * 60 * 60 * 1000),
        maxPlayers: 16,
        registrationFee: 75000,
        prizePool: 800000,
        rules: 'Partidos a 2 de 3 sets. Tie-break en todos los sets. Punto de oro en deuce.',
        clubId: club.id,
        createdBy: 'system',
        sets: 3,
        tiebreak: true
      }
    })
    
    // Torneo 2: Round Robin - Femenino 2da Categoría
    const tournament2 = await prisma.tournament.create({
      data: {
        name: 'Liga Femenina 2da Categoría',
        description: 'Liga round robin donde todas juegan contra todas. Las mejores 4 pasan a semifinales.',
        type: 'ROUND_ROBIN',
        status: 'DRAFT',
        category: 'F_2F',
        startDate: nextMonth,
        endDate: new Date(nextMonth.getTime() + 14 * 24 * 60 * 60 * 1000),
        registrationStart: today,
        registrationEnd: new Date(nextMonth.getTime() - 3 * 24 * 60 * 60 * 1000),
        maxPlayers: 16,
        registrationFee: 100000,
        prizePool: 1200000,
        rules: 'Fase de grupos todos contra todos. Partidos a 2 de 3 sets. Las 4 mejores pasan a playoffs.',
        clubId: club.id,
        createdBy: 'system',
        sets: 3,
        tiebreak: true
      }
    })
    
    // Torneo 3: Doble Eliminación - Mixto Open
    const tournament3 = await prisma.tournament.create({
      data: {
        name: 'Master Cup Mixto Open',
        description: 'Torneo de doble eliminación para parejas mixtas. Segunda oportunidad para todos los equipos.',
        type: 'DOUBLE_ELIMINATION',
        status: 'DRAFT',
        category: 'MX_OPEN',
        startDate: twoMonths,
        endDate: new Date(twoMonths.getTime() + 7 * 24 * 60 * 60 * 1000),
        registrationStart: nextWeek,
        registrationEnd: new Date(twoMonths.getTime() - 5 * 24 * 60 * 60 * 1000),
        maxPlayers: 16,
        registrationFee: 150000,
        prizePool: 2000000,
        rules: 'Sistema de doble eliminación. Bracket ganadores y perdedores. Final entre campeón de cada bracket.',
        clubId: club.id,
        createdBy: 'system',
        sets: 3,
        tiebreak: true
      }
    })
    
    console.log('Torneos creados:')
    console.log(`- ${tournament1.name} (ID: ${tournament1.id})`)
    console.log(`- ${tournament2.name} (ID: ${tournament2.id})`)
    console.log(`- ${tournament3.name} (ID: ${tournament3.id})`)
    
    // 6. Agregar inscripciones a cada torneo
    console.log('Agregando inscripciones...')
    
    // Inscripciones Torneo 1 (16 parejas masculinas)
    const malePlayers = players.filter((_, i) => i < 16) // Primeros 16 jugadores masculinos
    for (let i = 0; i < 16; i += 2) {
      await prisma.tournamentRegistration.create({
        data: {
          tournamentId: tournament1.id,
          player1Id: malePlayers[i].id,
          player1Name: malePlayers[i].name,
          player1Email: malePlayers[i].email || '',
          player1Phone: malePlayers[i].phone || '0000000000',
          player2Id: malePlayers[i + 1].id,
          player2Name: malePlayers[i + 1].name,
          player2Email: malePlayers[i + 1].email || '',
          player2Phone: malePlayers[i + 1].phone || '0000000000',
          paymentStatus: 'completed',
          paidAmount: tournament1.registrationFee,
          confirmed: true,
          checkedIn: false
        }
      })
    }
    
    // Inscripciones Torneo 2 (16 parejas femeninas)
    const femalePlayers = players.filter((_, i) => i >= 16) // Últimos 16 jugadores femeninos
    for (let i = 0; i < 16; i += 2) {
      await prisma.tournamentRegistration.create({
        data: {
          tournamentId: tournament2.id,
          player1Id: femalePlayers[i].id,
          player1Name: femalePlayers[i].name,
          player1Email: femalePlayers[i].email || '',
          player1Phone: femalePlayers[i].phone || '0000000000',
          player2Id: femalePlayers[i + 1].id,
          player2Name: femalePlayers[i + 1].name,
          player2Email: femalePlayers[i + 1].email || '',
          player2Phone: femalePlayers[i + 1].phone || '0000000000',
          paymentStatus: 'completed',
          paidAmount: tournament2.registrationFee,
          confirmed: true,
          checkedIn: false
        }
      })
    }
    
    // Inscripciones Torneo 3 (16 parejas mixtas)
    for (let i = 0; i < 16; i++) {
      await prisma.tournamentRegistration.create({
        data: {
          tournamentId: tournament3.id,
          player1Id: malePlayers[i].id,
          player1Name: malePlayers[i].name,
          player1Email: malePlayers[i].email || '',
          player1Phone: malePlayers[i].phone || '0000000000',
          player2Id: femalePlayers[i].id,
          player2Name: femalePlayers[i].name,
          player2Email: femalePlayers[i].email || '',
          player2Phone: femalePlayers[i].phone || '0000000000',
          paymentStatus: 'completed',
          paidAmount: tournament3.registrationFee,
          confirmed: true,
          checkedIn: false
        }
      })
    }
    
    console.log('Inscripciones agregadas a cada torneo')
    
    // 7. Generar partidos para el torneo de eliminación directa (como ejemplo)
    console.log('Generando partidos para torneo de eliminación directa...')
    
    const registrations1 = await prisma.tournamentRegistration.findMany({
      where: { tournamentId: tournament1.id },
      include: { player1: true, player2: true }
    })
    
    // Ronda 1: 8 partidos (hay 8 parejas, no 16)
    const numMatches = Math.min(8, registrations1.length)
    for (let i = 0; i < numMatches && i * 2 + 1 < registrations1.length; i++) {
      const reg1 = registrations1[i * 2]
      const reg2 = registrations1[i * 2 + 1]
      
      const match = await prisma.tournamentMatch.create({
        data: {
          tournamentId: tournament1.id,
          round: 'Ronda 1',
          matchNumber: i + 1,
          player1Id: reg1.player1Id,
          player1Name: `${reg1.player1Name} / ${reg1.player2Name || ''}`,
          player2Id: reg2.player1Id,
          player2Name: `${reg2.player1Name} / ${reg2.player2Name || ''}`,
          status: 'SCHEDULED',
          courtId: courts[i % 4].id,
          scheduledAt: new Date(nextWeek.getTime() + (Math.floor(i / 4) * 2 * 60 * 60 * 1000))
        }
      })
    }
    
    // Cuartos de final: 4 partidos (vacíos, esperando ganadores)
    for (let i = 0; i < 4; i++) {
      await prisma.tournamentMatch.create({
        data: {
          tournamentId: tournament1.id,
          round: 'Cuartos de Final',
          matchNumber: i + 1,
          status: 'SCHEDULED',
          courtId: courts[i].id,
          scheduledAt: new Date(nextWeek.getTime() + 24 * 60 * 60 * 1000 + (i * 2 * 60 * 60 * 1000))
        }
      })
    }
    
    // Semifinales: 2 partidos
    for (let i = 0; i < 2; i++) {
      await prisma.tournamentMatch.create({
        data: {
          tournamentId: tournament1.id,
          round: 'Semifinal',
          matchNumber: i + 1,
          status: 'SCHEDULED',
          courtId: courts[i].id,
          scheduledAt: new Date(nextWeek.getTime() + 36 * 60 * 60 * 1000 + (i * 2 * 60 * 60 * 1000))
        }
      })
    }
    
    // Final
    await prisma.tournamentMatch.create({
      data: {
        tournamentId: tournament1.id,
        round: 'Final',
        matchNumber: 1,
        status: 'SCHEDULED',
        courtId: courts[0].id,
        scheduledAt: new Date(nextWeek.getTime() + 48 * 60 * 60 * 1000)
      }
    })
    
    console.log('Partidos generados para torneo de eliminación directa')
    
    // 8. Los pagos ya están incluidos en los registros de inscripción
    console.log('Pagos configurados en las inscripciones')
    
    console.log('✅ Demo de torneos configurada exitosamente!')
    console.log('---')
    console.log('Resumen:')
    console.log(`- 3 torneos creados (Eliminación, Round Robin, Doble Eliminación)`)
    console.log(`- ${players.length} jugadores`)
    console.log(`- 16 inscripciones por torneo`)
    console.log(`- Partidos generados para el torneo de eliminación`)
    console.log(`- ${courts.length} canchas disponibles`)
    console.log('---')
    console.log('Los torneos están en estado DRAFT. Puedes cambiarlos a OPEN desde el dashboard.')
    
  } catch (error) {
    console.error('Error configurando demo:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })