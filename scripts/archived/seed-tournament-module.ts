import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTournamentModule() {
  try {
    console.log('🎾 Iniciando población del módulo de torneos...')
    
    // Obtener el club existente
    const club = await prisma.club.findFirst()
    if (!club) {
      throw new Error('No se encontró ningún club en la base de datos')
    }
    
    const CLUB_ID = club.id
    console.log(`\n📍 Usando club: ${club.name} (ID: ${CLUB_ID})`)
    
    // 1. Crear canchas si no existen
    console.log('\n📍 Creando canchas...')
    const existingCourts = await prisma.court.count({ where: { clubId: CLUB_ID } })
    
    if (existingCourts === 0) {
      const courts = await Promise.all([
        prisma.court.create({
          data: {
            clubId: CLUB_ID,
            name: 'Cancha Central',
            active: true
          }
        }),
        prisma.court.create({
          data: {
            clubId: CLUB_ID,
            name: 'Cancha 2',
            active: true
          }
        }),
        prisma.court.create({
          data: {
            clubId: CLUB_ID,
            name: 'Cancha 3',
            active: true
          }
        }),
        prisma.court.create({
          data: {
            clubId: CLUB_ID,
            name: 'Cancha 4',
            active: true
          }
        })
      ])
      console.log(`✅ ${courts.length} canchas creadas`)
    } else {
      console.log(`✅ Ya existen ${existingCourts} canchas`)
    }

    // 2. Crear configuración del club si no existe
    console.log('\n⚙️ Configurando settings del club...')
    try {
      const existingSettings = await prisma.clubSettings.findUnique({
        where: { clubId: CLUB_ID }
      })

      if (!existingSettings) {
        await prisma.clubSettings.create({
          data: {
            clubId: CLUB_ID,
            slotDuration: 90,
            bufferTime: 15,
            advanceBookingDays: 30,
            allowSameDayBooking: true,
            currency: 'MXN',
            taxIncluded: true,
            taxRate: 16,
            cancellationFee: 0,
            noShowFee: 0
          }
        })
        console.log('✅ Settings del club configurados')
      } else {
        console.log('✅ Settings ya configurados')
      }
    } catch (error) {
      console.log('⚠️ No se pudieron configurar los settings (puede que ya existan o el modelo no esté sincronizado)')
    }

    // 3. Crear jugadores de prueba
    console.log('\n👥 Creando jugadores de prueba...')
    
    const playerData = [
      // Categoría Masculina - 1ra
      { name: 'Carlos Rodríguez', email: 'carlos.rodriguez@example.com', phone: '+52 222 111 0001', gender: 'male', skillLevel: '1ra', category: 'Masculino' },
      { name: 'Miguel Hernández', email: 'miguel.hernandez@example.com', phone: '+52 222 111 0002', gender: 'male', skillLevel: '1ra', category: 'Masculino' },
      { name: 'Alejandro López', email: 'alejandro.lopez@example.com', phone: '+52 222 111 0003', gender: 'male', skillLevel: '1ra', category: 'Masculino' },
      { name: 'Juan García', email: 'juan.garcia@example.com', phone: '+52 222 111 0004', gender: 'male', skillLevel: '1ra', category: 'Masculino' },
      
      // Categoría Masculina - 2da
      { name: 'Pedro Martínez', email: 'pedro.martinez@example.com', phone: '+52 222 111 0005', gender: 'male', skillLevel: '2da', category: 'Masculino' },
      { name: 'Roberto Sánchez', email: 'roberto.sanchez@example.com', phone: '+52 222 111 0006', gender: 'male', skillLevel: '2da', category: 'Masculino' },
      { name: 'Luis González', email: 'luis.gonzalez@example.com', phone: '+52 222 111 0007', gender: 'male', skillLevel: '2da', category: 'Masculino' },
      { name: 'Fernando Torres', email: 'fernando.torres@example.com', phone: '+52 222 111 0008', gender: 'male', skillLevel: '2da', category: 'Masculino' },
      
      // Categoría Femenina - 1ra
      { name: 'María Fernández', email: 'maria.fernandez@example.com', phone: '+52 222 111 0009', gender: 'female', skillLevel: '1ra', category: 'Femenino' },
      { name: 'Laura Jiménez', email: 'laura.jimenez@example.com', phone: '+52 222 111 0010', gender: 'female', skillLevel: '1ra', category: 'Femenino' },
      { name: 'Ana Martín', email: 'ana.martin@example.com', phone: '+52 222 111 0011', gender: 'female', skillLevel: '1ra', category: 'Femenino' },
      { name: 'Carmen Ruiz', email: 'carmen.ruiz@example.com', phone: '+52 222 111 0012', gender: 'female', skillLevel: '1ra', category: 'Femenino' },
      
      // Categoría Femenina - 2da
      { name: 'Patricia Díaz', email: 'patricia.diaz@example.com', phone: '+52 222 111 0013', gender: 'female', skillLevel: '2da', category: 'Femenino' },
      { name: 'Isabel Moreno', email: 'isabel.moreno@example.com', phone: '+52 222 111 0014', gender: 'female', skillLevel: '2da', category: 'Femenino' },
      { name: 'Sofía Álvarez', email: 'sofia.alvarez@example.com', phone: '+52 222 111 0015', gender: 'female', skillLevel: '2da', category: 'Femenino' },
      { name: 'Elena Romero', email: 'elena.romero@example.com', phone: '+52 222 111 0016', gender: 'female', skillLevel: '2da', category: 'Femenino' },
      
      // Categoría Mixta - A
      { name: 'Diego Silva', email: 'diego.silva@example.com', phone: '+52 222 111 0017', gender: 'male', skillLevel: 'A', category: 'Mixto' },
      { name: 'Andrea Vargas', email: 'andrea.vargas@example.com', phone: '+52 222 111 0018', gender: 'female', skillLevel: 'A', category: 'Mixto' },
      { name: 'Ricardo Castro', email: 'ricardo.castro@example.com', phone: '+52 222 111 0019', gender: 'male', skillLevel: 'A', category: 'Mixto' },
      { name: 'Valeria Ortiz', email: 'valeria.ortiz@example.com', phone: '+52 222 111 0020', gender: 'female', skillLevel: 'A', category: 'Mixto' },
      
      // Categoría Mixta - B
      { name: 'Javier Mendoza', email: 'javier.mendoza@example.com', phone: '+52 222 111 0021', gender: 'male', skillLevel: 'B', category: 'Mixto' },
      { name: 'Daniela Flores', email: 'daniela.flores@example.com', phone: '+52 222 111 0022', gender: 'female', skillLevel: 'B', category: 'Mixto' },
      { name: 'Andrés Reyes', email: 'andres.reyes@example.com', phone: '+52 222 111 0023', gender: 'male', skillLevel: 'B', category: 'Mixto' },
      { name: 'Gabriela Herrera', email: 'gabriela.herrera@example.com', phone: '+52 222 111 0024', gender: 'female', skillLevel: 'B', category: 'Mixto' }
    ]

    const players = []
    for (const data of playerData) {
      const existingPlayer = await prisma.player.findFirst({
        where: { email: data.email }
      })

      if (!existingPlayer) {
        const player = await prisma.player.create({
          data: {
            id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            clubId: CLUB_ID,
            name: data.name,
            email: data.email,
            phone: data.phone,
            memberSince: new Date(),
            active: true,
            updatedAt: new Date()
          }
        })
        players.push(player)
      }
    }
    console.log(`✅ ${players.length} jugadores creados`)

    // 4. Crear torneos de prueba
    console.log('\n🏆 Creando torneos de prueba...')
    
    const now = new Date()
    const tournaments = []

    // Torneo 1: Abierto con inscripciones abiertas
    const tournament1 = await prisma.tournament.create({
      data: {
        id: `tournament_${Date.now()}_1`,
        clubId: CLUB_ID,
        name: 'Torneo de Verano 2025',
        description: 'Gran torneo de verano con premios en efectivo. Categorías masculina, femenina y mixta.',
        type: 'SINGLE_ELIMINATION' as any,
        status: 'REGISTRATION_OPEN' as any,
        categories: ['Masculino-1ra', 'Masculino-2da', 'Femenino-1ra', 'Femenino-2da', 'Mixto-A', 'Mixto-B'],
        registrationStart: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Hace 7 días
        registrationEnd: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // En 7 días
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // En 14 días
        endDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // En 21 días
        maxPlayers: 32,
        registrationFee: 50000, // $500 MXN
        prizePool: 1000000, // $10,000 MXN
        currency: 'MXN',
        matchDuration: 90,
        sets: 3,
        games: 6,
        tiebreak: true,
        updatedAt: new Date(),
        rules: 'Reglas oficiales de la Federación Mexicana de Pádel',
        updatedAt: new Date()
      }
    })
    tournaments.push(tournament1)

    // Torneo 2: Round Robin en progreso
    const tournament2 = await prisma.tournament.create({
      data: {
        id: `tournament_${Date.now()}_2`,
        clubId: CLUB_ID,
        name: 'Liga Round Robin Mensual',
        description: 'Liga mensual donde todos juegan contra todos.',
        type: 'ROUND_ROBIN' as any,
        status: 'IN_PROGRESS' as any,
        categories: ['Masculino-Open', 'Femenino-Open'],
        registrationStart: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000), // Hace 21 días
        registrationEnd: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), // Hace 14 días
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Hace 7 días
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // En 7 días
        maxPlayers: 16,
        registrationFee: 30000, // $300 MXN
        prizePool: 500000, // $5,000 MXN
        currency: 'MXN',
        matchDuration: 60,
        sets: 2,
        games: 6,
        tiebreak: true,
        updatedAt: new Date()
      }
    })
    tournaments.push(tournament2)

    // Torneo 3: Grupo + Eliminación (próximamente)
    const tournament3 = await prisma.tournament.create({
      data: {
        id: `tournament_${Date.now()}_3`,
        clubId: CLUB_ID,
        name: 'Copa Navideña 2025',
        description: 'Torneo con fase de grupos seguida de eliminación directa.',
        type: 'GROUP_STAGE' as any,
        status: 'DRAFT' as any,
        categories: ['Mixto-Open'],
        registrationStart: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // En 30 días
        registrationEnd: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // En 45 días
        startDate: new Date(now.getTime() + 50 * 24 * 60 * 60 * 1000), // En 50 días
        endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // En 60 días
        maxPlayers: 24,
        registrationFee: 75000, // $750 MXN
        prizePool: 1500000, // $15,000 MXN
        currency: 'MXN',
        matchDuration: 90,
        sets: 3,
        games: 6,
        tiebreak: true,
        updatedAt: new Date()
      }
    })
    tournaments.push(tournament3)

    console.log(`✅ ${tournaments.length} torneos creados`)

    // 5. Agregar inscripciones al torneo 1 (abierto)
    console.log('\n📝 Agregando inscripciones al torneo...')
    
    const allPlayers = await prisma.player.findMany({
      where: { clubId: CLUB_ID }
    })

    const registrations = []
    
    // Crear parejas para el torneo 1
    for (let i = 0; i < Math.min(16, allPlayers.length); i += 2) {
      if (i + 1 < allPlayers.length) {
        const registration = await prisma.tournamentRegistration.create({
          data: {
            id: `reg_${Date.now()}_${i}`,
            tournamentId: tournament1.id,
            player1Id: allPlayers[i].id,
            player1Name: allPlayers[i].name,
            player1Email: allPlayers[i].email || '',
            player1Phone: allPlayers[i].phone || '',
            player1Level: playerData[i]?.skillLevel || '2da',
            player2Id: allPlayers[i + 1].id,
            player2Name: allPlayers[i + 1].name,
            player2Email: allPlayers[i + 1].email || '',
            player2Phone: allPlayers[i + 1].phone || '',
            player2Level: playerData[i + 1]?.skillLevel || '2da',
            modality: playerData[i]?.category || 'Mixto',
            category: playerData[i]?.skillLevel || '2da',
            paymentStatus: i < 8 ? 'completed' : 'pending',
            paidAmount: i < 8 ? 50000 : 0,
            paymentMethod: i < 8 ? (i % 2 === 0 ? 'cash' : 'card') : null,
            confirmed: i < 8,
            checkedIn: false,
            teamName: `Equipo ${i/2 + 1}`,
            updatedAt: new Date()
          }
        })
        registrations.push(registration)
      }
    }

    console.log(`✅ ${registrations.length} inscripciones creadas`)

    // 6. Crear inscripciones y partidos para el torneo 2 (en progreso)
    console.log('\n🎯 Creando partidos para torneo en progreso...')
    
    // Primero agregar inscripciones al torneo 2
    const tournament2Registrations = []
    for (let i = 0; i < Math.min(8, allPlayers.length); i += 2) {
      if (i + 1 < allPlayers.length) {
        const registration = await prisma.tournamentRegistration.create({
          data: {
            id: `reg2_${Date.now()}_${i}`,
            tournamentId: tournament2.id,
            player1Id: allPlayers[i].id,
            player1Name: allPlayers[i].name,
            player1Email: allPlayers[i].email || '',
            player1Phone: allPlayers[i].phone || '',
            player2Id: allPlayers[i + 1].id,
            player2Name: allPlayers[i + 1].name,
            player2Email: allPlayers[i + 1].email || '',
            player2Phone: allPlayers[i + 1].phone || '',
            paymentStatus: 'completed',
            paidAmount: 30000,
            paymentMethod: 'card',
            confirmed: true,
            checkedIn: true,
            checkedInAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            teamName: `Team ${String.fromCharCode(65 + i/2)}`,
            updatedAt: new Date()
          }
        })
        tournament2Registrations.push(registration)
      }
    }

    // Crear jornada para el torneo 2
    const round1 = await prisma.tournamentRound.create({
      data: {
        id: `round_${Date.now()}_1`,
        tournamentId: tournament2.id,
        name: 'Jornada 1',
        stage: 'group',
        stageLabel: 'Fase de Grupos',
        modality: 'mixed',
        status: 'in_progress',
        matchesCount: 6,
        completedMatches: 2,
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    })

    // Crear algunos partidos de muestra
    const courts = await prisma.court.findMany({ where: { clubId: CLUB_ID } })
    
    const matches = []
    for (let i = 0; i < 4; i++) {
      const match = await prisma.tournamentMatch.create({
        data: {
          id: `match_${Date.now()}_${i}`,
          tournamentId: tournament2.id,
          roundId: round1.id,
          round: 'Jornada 1',
          matchNumber: i + 1,
          team1Name: `Team ${String.fromCharCode(65 + i)}`,
          team1Player1: allPlayers[i * 2]?.name || 'Jugador 1',
          team1Player2: allPlayers[i * 2 + 1]?.name || 'Jugador 2',
          team2Name: `Team ${String.fromCharCode(65 + ((i + 1) % 4))}`,
          team2Player1: allPlayers[((i + 1) % 4) * 2]?.name || 'Jugador 3',
          team2Player2: allPlayers[((i + 1) % 4) * 2 + 1]?.name || 'Jugador 4',
          courtId: courts[i % courts.length]?.id,
          scheduledAt: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000),
          startTime: '10:00',
          endTime: '11:30',
          status: i < 2 ? 'COMPLETED' as any : 'SCHEDULED' as any,
          team1Sets: i < 2 ? [6, 3, 6] : null,
          team2Sets: i < 2 ? [4, 6, 2] : null,
          team1Score: i < 2 ? 2 : null,
          team2Score: i < 2 ? 1 : null,
          winner: i < 2 ? `Team ${String.fromCharCode(65 + i)}` : null,
          updatedAt: new Date()
        }
      })
      matches.push(match)
    }

    console.log(`✅ ${matches.length} partidos creados`)

    // 7. Generar QR codes para algunos partidos
    console.log('\n📱 Generando QR codes para partidos...')
    
    for (const match of matches.slice(2)) { // Solo para partidos pendientes
      await prisma.tournamentMatch.update({
        where: { id: match.id },
        data: {
          qrCode: `QR_${match.id}_${Date.now()}`,
          qrCodeUrl: `/match/${match.id}/score`,
          qrValidUntil: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      })
    }

    console.log('✅ QR codes generados')

    // Resumen final
    console.log('\n' + '='.repeat(50))
    console.log('✨ MÓDULO DE TORNEOS POBLADO EXITOSAMENTE')
    console.log('='.repeat(50))
    console.log(`
📊 Resumen:
- Club: Club Padel Puebla
- Canchas: ${courts.length}
- Jugadores: ${allPlayers.length}
- Torneos: ${tournaments.length}
  • ${tournament1.name} (Inscripciones abiertas)
  • ${tournament2.name} (En progreso)
  • ${tournament3.name} (Borrador)
- Inscripciones: ${registrations.length + tournament2Registrations.length}
- Partidos creados: ${matches.length}

🎯 Próximos pasos:
1. Accede a /dashboard/tournaments para ver los torneos
2. Puedes gestionar inscripciones y pagos
3. Genera brackets y programa partidos
4. Los jugadores pueden escanear QR para reportar resultados
    `)

  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
seedTournamentModule()
  .then(() => {
    console.log('✅ Script completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })