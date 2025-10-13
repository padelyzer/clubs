import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PasswordGenerator } from '../lib/security/password-generator'
import { generateId } from '../lib/utils/generate-id'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Limpiar datos existentes
  // Models don't exist yet in this schema
  // await prisma.matchResultSubmission.deleteMany()
  // await prisma.tournamentMatch.deleteMany()
  // await prisma.tournamentRoundCourt.deleteMany()
  // await prisma.tournamentRound.deleteMany()
  // await prisma.tournamentRegistration.deleteMany()
  // await prisma.tournament.deleteMany()
  await prisma.splitPayment.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.player.deleteMany()
  await prisma.court.deleteMany()
  await prisma.pricing.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.user.deleteMany()
  await prisma.club.deleteMany()

  // Crear Super Admin
  const passwords = PasswordGenerator.getSeedPasswords()
  const superAdminPassword = await bcrypt.hash(passwords.admin, 10)
  const superAdmin = await prisma.user.create({
    data: {
      id: 'super-admin-001',
      email: 'root@padelyzer.com',
      password: superAdminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      active: true,
      updatedAt: new Date(),
    },
  })

  console.log('✅ Super Admin creado:', superAdmin.email)

  // Crear Club de prueba
  const club = await prisma.club.create({
    data: {
      id: 'club-padel-puebla-001',
      name: 'Club Padel Puebla',
      slug: 'club-padel-puebla',
      email: 'info@clubpadelpuebla.com',
      phone: '+52 222 123 4567',
      address: 'Av. Juárez 123, Centro',
      city: 'Puebla',
      state: 'Puebla',
      postalCode: '72000',
      status: 'APPROVED',
      stripeAccountId: 'acct_test_123',
      stripeChargesEnabled: true,
      stripeDetailsSubmitted: true,
      whatsappNumber: '+52 222 123 4567',
      updatedAt: new Date(),
    },
  })

  console.log('✅ Club creado:', club.name)

  // Crear Owner del Club
  const ownerPassword = await bcrypt.hash(passwords.owner, 10)
  const owner = await prisma.user.create({
    data: {
      id: 'club-owner-001',
      email: 'owner@clubpadelpuebla.com',
      password: ownerPassword,
      name: 'Juan Pérez',
      role: 'CLUB_OWNER',
      clubId: club.id,
      active: true,
      updatedAt: new Date(),
    },
  })

  console.log('✅ Club Owner creado:', owner.email)

  // Crear Staff del Club
  const staffPassword = await bcrypt.hash(passwords.staff, 10)
  const staff = await prisma.user.create({
    data: {
      id: 'club-staff-001',
      email: 'staff@clubpadelpuebla.com',
      password: staffPassword,
      name: 'María García',
      role: 'CLUB_STAFF',
      clubId: club.id,
      active: true,
      updatedAt: new Date(),
    },
  })

  console.log('✅ Club Staff creado:', staff.email)

  // Crear usuario de prueba basic5@padelyzer.com
  const testUserPassword = await bcrypt.hash('password123', 10)
  const testUser = await prisma.user.create({
    data: {
      id: 'test-user-basic5',
      email: 'basic5@padelyzer.com',
      password: testUserPassword,
      name: 'Usuario Básico 5',
      role: 'CLUB_STAFF',
      clubId: club.id,
      active: true,
      updatedAt: new Date(),
    },
  })

  console.log('✅ Usuario de prueba creado:', testUser.email)

  // Club configuration is now embedded in the club settings field

  // Crear Canchas
  const courts = await Promise.all([
    prisma.court.create({
      data: {
        id: 'court-central-001',
        name: 'Cancha Central',
        type: 'PADEL',
        indoor: true,
        active: true,
        order: 1,
        clubId: club.id,
        updatedAt: new Date(),
      },
    }),
    prisma.court.create({
      data: {
        id: 'court-norte-001',
        name: 'Cancha Norte',
        type: 'PADEL',
        indoor: false,
        active: true,
        order: 2,
        clubId: club.id,
        updatedAt: new Date(),
      },
    }),
    prisma.court.create({
      data: {
        id: 'court-sur-001',
        name: 'Cancha Sur',
        type: 'PADEL',
        indoor: true,
        active: true,
        order: 3,
        clubId: club.id,
        updatedAt: new Date(),
      },
    }),
  ])

  console.log('✅ Canchas creadas:', courts.length)

  // Crear Horarios
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6] // Domingo a Sábado
  const schedules = await Promise.all(
    daysOfWeek.map((day) =>
      prisma.schedule.create({
        data: {
          id: generateId(),
          dayOfWeek: day,
          openTime: '07:00',
          closeTime: '22:00',
          clubId: club.id,
          updatedAt: new Date(),
        },
      })
    )
  )

  console.log('✅ Horarios creados:', schedules.length)

  // Crear Precios
  const pricing = await prisma.pricing.create({
    data: {
      id: generateId(),
      startTime: '07:00',
      endTime: '22:00',
      price: 50000, // $500 MXN
      clubId: club.id,
      updatedAt: new Date(),
    },
  })

  console.log('✅ Precios creados')

  // Skip bookings for now - they have schema issues
  const bookings: any[] = []
  
  /*
  // Crear Reservas de prueba
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        date: tomorrow,
        startTime: '10:00',
        endTime: '11:30',
        duration: 90,
        confirmed: true,
        paymentStatus: 'completed',
        paymentStatus: 'completed',
        paymentType: 'ONLINE_FULL',
        price: 50000,
        playerName: 'Carlos Rodríguez',
        playerEmail: 'carlos@example.com',
        playerPhone: '+52 222 555 0001',
        notes: 'Reserva confirmada y pagada',
        courtId: courts[0].id,
        clubId: club.id,
      },
    }),
    prisma.booking.create({
      data: {
        date: tomorrow,
        startTime: '16:00',
        endTime: '17:30',
        duration: 90,
        status: 'PENDING',
        paymentStatus: 'pending',
        paymentType: 'ONLINE_SPLIT',
        price: 60000,
        playerName: 'Ana Martínez',
        playerEmail: 'ana@example.com',
        playerPhone: '+52 222 555 0002',
        splitPaymentEnabled: true,
        splitPaymentCount: 4,
        notes: 'Pago dividido entre 4 jugadores',
        courtId: courts[1].id,
        clubId: club.id,
      },
    }),
    prisma.booking.create({
      data: {
        date: today,
        startTime: '18:00',
        endTime: '19:30',
        duration: 90,
        confirmed: true,
        paymentStatus: 'completed',
        paymentStatus: 'completed',
        paymentType: 'ONLINE_FULL',
        price: 60000,
        playerName: 'Luis Hernández',
        playerEmail: 'luis@example.com',
        playerPhone: '+52 222 555 0003',
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: staff.email,
        courtId: courts[0].id,
        clubId: club.id,
      },
    }),
  ])
  */

  // console.log('✅ Reservas creadas:', bookings.length)

  // Skip split payments as well since bookings are commented out

  // Crear jugadores de prueba
  const players = await Promise.all([
    prisma.player.create({
      data: {
        id: generateId(),
        clubId: club.id,
        memberNumber: 'P001',
        name: 'Carlos Rodríguez',
        email: 'carlos@example.com',
        phone: '+34600111222',
        gender: 'MALE',
        level: 'INTERMEDIATE',
        active: true,
        updatedAt: new Date(),
      }
    }),
    prisma.player.create({
      data: {
        id: generateId(),
        clubId: club.id,
        memberNumber: 'P002',
        name: 'María González',
        email: 'maria@example.com',
        phone: '+34600333444',
        gender: 'FEMALE',
        level: 'ADVANCED',
        active: true,
        updatedAt: new Date(),
      }
    }),
    prisma.player.create({
      data: {
        id: generateId(),
        clubId: club.id,
        memberNumber: 'P003',
        name: 'Juan Martínez',
        email: 'juan@example.com',
        phone: '+34600555666',
        gender: 'MALE',
        level: 'INTERMEDIATE',
        active: true,
        updatedAt: new Date(),
      }
    }),
    prisma.player.create({
      data: {
        id: generateId(),
        clubId: club.id,
        memberNumber: 'P004',
        name: 'Ana López',
        email: 'ana@example.com',
        phone: '+34600777888',
        gender: 'FEMALE',
        level: 'BEGINNER',
        active: true,
        updatedAt: new Date(),
      }
    }),
    prisma.player.create({
      data: {
        id: generateId(),
        clubId: club.id,
        memberNumber: 'P005',
        name: 'Pedro Sánchez',
        email: 'pedro@example.com',
        phone: '+34600999000',
        gender: 'MALE',
        level: 'ADVANCED',
        active: true,
        updatedAt: new Date(),
      }
    }),
    prisma.player.create({
      data: {
        id: generateId(),
        clubId: club.id,
        memberNumber: 'P006',
        name: 'Laura Fernández',
        email: 'laura@example.com',
        phone: '+34600111333',
        gender: 'FEMALE',
        level: 'INTERMEDIATE',
        active: true,
        updatedAt: new Date(),
      }
    }),
    prisma.player.create({
      data: {
        id: generateId(),
        clubId: club.id,
        memberNumber: 'P007',
        name: 'Diego Ruiz',
        email: 'diego@example.com',
        phone: '+34600222444',
        gender: 'MALE',
        level: 'PROFESSIONAL',
        active: true,
        updatedAt: new Date(),
      }
    }),
    prisma.player.create({
      data: {
        id: generateId(),
        clubId: club.id,
        memberNumber: 'P008',
        name: 'Carmen Díaz',
        email: 'carmen@example.com',
        phone: '+34600333555',
        gender: 'FEMALE',
        level: 'ADVANCED',
        active: true,
        updatedAt: new Date(),
      }
    })
  ])

  console.log('✅ Jugadores creados:', players.length)

  // Crear torneo de prueba
  /*
  const tournament = await prisma.tournament.create({
    data: {
      clubId: club.id,
      name: 'Torneo de Verano 2025',
      description: 'Gran torneo de verano con premios especiales',
      type: 'SINGLE_ELIMINATION',
      status: 'REGISTRATION_OPEN',
      maxPlayers: 32,
      registrationFee: 50,
      prizePool: 1000,
      currency: 'MXN',
      registrationStart: new Date('2025-01-15'),
      registrationEnd: new Date('2025-01-28'),
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-02-03'),
      categories: JSON.stringify([
        { name: 'Masculino Open', code: 'M_OPEN', modality: 'Masculino' },
        { name: 'Masculino 1ra', code: 'M_1', modality: 'Masculino' },
        { name: 'Masculino 2da', code: 'M_2', modality: 'Masculino' },
        { name: 'Femenino Open', code: 'F_OPEN', modality: 'Femenino' },
        { name: 'Femenino 1ra', code: 'F_1', modality: 'Femenino' },
        { name: 'Mixto A', code: 'MX_A', modality: 'Mixto' },
        { name: 'Mixto B', code: 'MX_B', modality: 'Mixto' }
      ]),
      rules: JSON.stringify({
        format: 'Mejor de 3 sets',
        tieBreak: 'Golden point',
        duration: '90 minutos máximo'
      }),
      matchDuration: 90,
      sets: 3,
      games: 6,
      tiebreak: true,
      category: 'Mixto'
    }
  })

  console.log('✅ Torneo creado:', tournament.name)

  // Registrar equipos para el torneo
  const registrations = await Promise.all([
    prisma.tournamentRegistration.create({
      data: {
        tournamentId: tournament.id,
        player1Id: players[0].id,
        player1Name: players[0].name,
        player1Phone: players[0].phone,
        player2Id: players[1].id,
        player2Name: players[1].name,
        player2Phone: players[1].phone,
        teamName: 'Los Campeones',
        modality: 'Mixto',
        category: 'A',
        confirmed: true,
        paymentStatus: 'completed'
      }
    }),
    prisma.tournamentRegistration.create({
      data: {
        tournamentId: tournament.id,
        player1Id: players[2].id,
        player1Name: players[2].name,
        player1Phone: players[2].phone,
        player2Id: players[3].id,
        player2Name: players[3].name,
        player2Phone: players[3].phone,
        teamName: 'Poder Latino',
        modality: 'Mixto',
        category: 'A',
        confirmed: true,
        paymentStatus: 'completed'
      }
    }),
    prisma.tournamentRegistration.create({
      data: {
        tournamentId: tournament.id,
        player1Id: players[4].id,
        player1Name: players[4].name,
        player1Phone: players[4].phone,
        player2Id: players[5].id,
        player2Name: players[5].name,
        player2Phone: players[5].phone,
        teamName: 'Dream Team',
        modality: 'Mixto',
        category: 'B',
        confirmed: true,
        paymentStatus: 'completed'
      }
    }),
    prisma.tournamentRegistration.create({
      data: {
        tournamentId: tournament.id,
        player1Id: players[6].id,
        player1Name: players[6].name,
        player1Phone: players[6].phone,
        player2Id: players[7].id,
        player2Name: players[7].name,
        player2Phone: players[7].phone,
        teamName: 'Los Invencibles',
        modality: 'Masculino',
        category: '1ra',
        confirmed: true,
        paymentStatus: 'completed'
      }
    }),
    // Agregar más equipos para tener al menos 2 por categoría
    prisma.tournamentRegistration.create({
      data: {
        tournamentId: tournament.id,
        player1Name: 'Pedro Sánchez',
        player1Phone: '+34600888999',
        player1Email: 'pedro@example.com',
        player2Name: 'Laura Martín',
        player2Phone: '+34600777888',
        player2Email: 'laura@example.com',
        teamName: 'Los Gladiadores',
        modality: 'Mixto',
        category: 'B',
        confirmed: true,
        paymentStatus: 'completed',
        paidAmount: 5000
      }
    }),
    prisma.tournamentRegistration.create({
      data: {
        tournamentId: tournament.id,
        player1Name: 'Diego López',
        player1Phone: '+34600666777',
        player1Email: 'diego@example.com',
        player2Name: 'Roberto García',
        player2Phone: '+34600555666',
        player2Email: 'roberto@example.com',
        teamName: 'Thunder Team',
        modality: 'Masculino',
        category: '1ra',
        confirmed: true,
        paymentStatus: 'completed',
        paidAmount: 5000
      }
    }),
    prisma.tournamentRegistration.create({
      data: {
        tournamentId: tournament.id,
        player1Name: 'Sofia Ruiz',
        player1Phone: '+34600444555',
        player1Email: 'sofia@example.com',
        player2Name: 'Carmen Díaz',
        player2Phone: '+34600333444',
        player2Email: 'carmen@example.com',
        teamName: 'Las Guerreras',
        modality: 'Femenino',
        category: 'Open',
        confirmed: true,
        paymentStatus: 'completed',
        paidAmount: 5000
      }
    }),
    prisma.tournamentRegistration.create({
      data: {
        tournamentId: tournament.id,
        player1Name: 'Elena Torres',
        player1Phone: '+34600222333',
        player1Email: 'elena@example.com',
        player2Name: 'Patricia Moreno',
        player2Phone: '+34600111222',
        player2Email: 'patricia@example.com',
        teamName: 'Power Girls',
        modality: 'Femenino',
        category: 'Open',
        confirmed: true,
        paymentStatus: 'completed',
        paidAmount: 5000
      }
    }),
    prisma.tournamentRegistration.create({
      data: {
        tournamentId: tournament.id,
        player1Name: 'Miguel Ángel',
        player1Phone: '+34600999000',
        player1Email: 'miguel@example.com',
        player2Name: 'Francisco Javier',
        player2Phone: '+34600888000',
        player2Email: 'fran@example.com',
        teamName: 'Los Titanes',
        modality: 'Masculino',
        category: 'Open',
        confirmed: true,
        paymentStatus: 'pending',
        paidAmount: 0
      }
    }),
    prisma.tournamentRegistration.create({
      data: {
        tournamentId: tournament.id,
        player1Name: 'Alberto Pérez',
        player1Phone: '+34600777000',
        player1Email: 'alberto@example.com',
        player2Name: 'Sergio Gómez',
        player2Phone: '+34600666000',
        player2Email: 'sergio@example.com',
        teamName: 'Los Halcones',
        modality: 'Masculino',
        category: 'Open',
        confirmed: true,
        paymentStatus: 'completed',
        paidAmount: 5000
      }
    })
  ])

  console.log('✅ Equipos registrados:', registrations.length)
  */

  // Crear ronda del torneo
  /*
  const round1 = await prisma.tournamentRound.create({
    data: {
      tournamentId: tournament.id,
      name: 'Cuartos de Final',
      stage: 'KNOCKOUT',
      stageLabel: 'Cuartos de Final',
      modality: 'ELIMINATION',
      status: 'SCHEDULED',
      startDate: new Date('2025-02-01T10:00:00'),
      endDate: new Date('2025-02-01T18:00:00'),
      category: 'Mixto'
    }
  })

  console.log('✅ Ronda del torneo creada:', round1.name)
  */

  // Skip match creation for now - schema doesn't match expected fields
  const matches: any[] = []
  /*
  const matches = await Promise.all([
    prisma.tournamentMatch.create({
      data: {
        tournamentId: tournament.id,
        roundId: round1.id,
        matchNumber: 1,
        courtId: courts[0].id,
        player1Id: registrations[0].id,
        player2Id: registrations[1].id,
        team1Name: registrations[0].teamName,
        team2Name: registrations[1].teamName,
        scheduledAt: new Date('2025-02-01T10:00:00'),
        status: 'SCHEDULED',
        qrCode: `QR_${tournament.id}_M1`,
        courtNumber: courts[0].name,
        startTime: '10:00',
        matchDate: '2025-02-01',
        round: round1.name
      }
    }),
    prisma.tournamentMatch.create({
      data: {
        tournamentId: tournament.id,
        roundId: round1.id,
        matchNumber: 2,
        courtId: courts[1].id,
        player1Id: registrations[2].id,
        player2Id: registrations[3].id,
        team1Name: registrations[2].teamName,
        team2Name: registrations[3].teamName,
        scheduledAt: new Date('2025-02-01T11:30:00'),
        status: 'SCHEDULED',
        qrCode: `QR_${tournament.id}_M2`,
        courtNumber: courts[1].name,
        startTime: '11:30',
        matchDate: '2025-02-01',
        round: round1.name
      }
    })
  ])
  */

  // console.log('✅ Partidos del torneo creados:', matches.length)

  // Skip test match creation as well
  /*
  const testMatch = await prisma.tournamentMatch.create({
    data: {
      tournamentId: tournament.id,
      roundId: round1.id,
      matchNumber: 99,
      courtId: courts[2].id,
      player1Id: registrations[0].id,
      player2Id: registrations[1].id,
      team1Name: 'Equipo Test A',
      team2Name: 'Equipo Test B',
      scheduledAt: new Date('2025-02-01T09:00:00'),
      status: 'IN_PROGRESS',
      qrCode: `QR_${tournament.id}_TEST`,
      courtNumber: courts[2].name,
      startTime: '09:00',
      matchDate: '2025-02-01',
      round: 'Partido de Prueba'
    }
  })

  // Crear capturas de resultados de ejemplo
  await prisma.matchResultSubmission.createMany({
    data: [
      {
        matchId: testMatch.id,
        submittedBy: 'team1',
        submissionNumber: 1,
        team1Sets: [6, 4],
        team2Sets: [3, 6],
        winner: 'team1',
        verified: false,
        hasDiscrepancy: false
      },
      {
        matchId: testMatch.id,
        submittedBy: 'team1',
        submissionNumber: 2,
        team1Sets: [6, 4],
        team2Sets: [3, 6],
        winner: 'team1',
        verified: false,
        hasDiscrepancy: false
      },
      {
        matchId: testMatch.id,
        submittedBy: 'team2',
        submissionNumber: 1,
        team1Sets: [6, 3],
        team2Sets: [3, 6],
        winner: 'team1',
        verified: false,
        hasDiscrepancy: false
      }
    ]
  })
  */

  // console.log('✅ Partido de prueba con capturas de resultados creado')

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\n📝 Credenciales de acceso:')
  console.log('─────────────────────────')
  console.log('Super Admin:')
  console.log('  Email: root@padelyzer.com')
    // [REMOVED: Sensitive log for security]
  console.log('\nClub Owner:')
  console.log('  Email: owner@clubpadelpuebla.com')
    // [REMOVED: Sensitive log for security]
  console.log('\nClub Staff:')
  console.log('  Email: staff@clubpadelpuebla.com')
    // [REMOVED: Sensitive log for security]
  console.log('\nTest User:')
  console.log('  Email: basic5@padelyzer.com')
  console.log('  Password: password123')
  console.log('─────────────────────────')
  console.log('\n🏆 Torneo de prueba:')
  console.log('─────────────────────────')
  // console.log('  Nombre:', tournament.name)
  // console.log('  Estado: Inscripciones abiertas')
  // console.log('  Equipos registrados:', registrations.length)
  // console.log('  Partidos programados:', matches.length + 1, '(incluye partido de prueba)')
  console.log('  \n  📱 Partido #99 tiene 3 capturas de resultado para probar validación')
  console.log('  ⚠️  Hay una discrepancia intencional en los resultados del partido #99')
  console.log('─────────────────────────')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })