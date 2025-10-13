import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Get the first club
    const club = await prisma.club.findFirst()
    
    if (!club) {
      console.log('No club found. Please create a club first.')
      return
    }

    console.log(`Using club: ${club.name}`)

    // Create a tournament
    const tournament = await prisma.tournament.create({
      data: {
        clubId: club.id,
        name: 'Torneo de Verano 2025',
        description: 'Gran torneo de padel de verano con premios increíbles',
        type: 'SINGLE_ELIMINATION',
        status: 'REGISTRATION_OPEN',
        category: 'OPEN',
        registrationStart: new Date('2025-01-01'),
        registrationEnd: new Date('2025-01-31'),
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-03'),
        maxPlayers: 32,
        registrationFee: 50000, // $500 MXN in cents
        prizePool: 100000, // $1000 MXN in cents
        currency: 'MXN',
        sets: 3,
        games: 6,
        tiebreak: true,
        matchDuration: 90,
        rules: 'Reglas oficiales de la Federación Mexicana de Pádel',
        createdBy: 'admin@padelyzer.com'
      }
    })

    console.log(`✅ Created tournament: ${tournament.name}`)

    // Create players first
    const playerNames = [
      ['Carlos', 'Rodríguez'], ['María', 'García'],
      ['Juan', 'Martínez'], ['Ana', 'Martínez'],
      ['Pedro', 'García'], ['Laura', 'López'],
      ['Miguel', 'López'], ['Carmen', 'Rodríguez'],
      ['Antonio', 'Pérez'], ['Isabel', 'Pérez'],
      ['Francisco', 'González'], ['Sofia', 'González'],
      ['Manuel', 'Sánchez'], ['Elena', 'Sánchez'],
      ['José', 'Ramírez'], ['Lucia', 'Ramírez']
    ]

    const players = []
    for (const [firstName, lastName] of playerNames) {
      const player = await prisma.player.create({
        data: {
          clubId: club.id,
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@demo.com`,
          phone: `555${Math.floor(Math.random() * 9000000 + 1000000)}`,
          level: (Math.floor(Math.random() * 10) + 1).toString(),
          birthDate: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          gender: firstName === 'María' || firstName === 'Ana' || firstName === 'Laura' || firstName === 'Carmen' || firstName === 'Isabel' || firstName === 'Sofia' || firstName === 'Elena' || firstName === 'Lucia' ? 'FEMALE' : 'MALE',
          clientNumber: `CLI-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }
      })
      players.push(player)
    }

    console.log(`✅ Created ${players.length} players`)

    // Create tournament registrations (pairs)
    const registrations = []
    for (let i = 0; i < players.length; i += 2) {
      const paymentMethods = ['cash', 'card', 'transfer']
      const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      
      const registration = await prisma.tournamentRegistration.create({
        data: {
          tournamentId: tournament.id,
          player1Id: players[i].id,
          player1Name: players[i].name,
          player1Email: players[i].email,
          player1Phone: players[i].phone,
          player2Id: players[i + 1]?.id,
          player2Name: players[i + 1]?.name,
          player2Email: players[i + 1]?.email,
          player2Phone: players[i + 1]?.phone,
          paymentStatus: 'completed',
          paidAmount: tournament.registrationFee,
          paymentMethod: randomMethod,
          paymentReference: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          paymentDate: new Date(),
          confirmed: true,
          checkedIn: Math.random() > 0.3, // 70% checked in
          checkedInAt: Math.random() > 0.3 ? new Date() : null,
          teamName: `Team ${i / 2 + 1}`
        }
      })
      registrations.push(registration)
      
      console.log(`✅ Registered: ${registration.player1Name} & ${registration.player2Name} - Payment: ${randomMethod}`)
    }

    // Create some matches
    const rounds = ['Ronda 1', 'Cuartos de Final', 'Semifinal', 'Final']
    const matches = []
    
    // Round 1 matches
    for (let i = 0; i < 4; i++) {
      const match = await prisma.tournamentMatch.create({
        data: {
          tournamentId: tournament.id,
          round: 'Ronda 1',
          matchNumber: i + 1,
          player1Id: registrations[i * 2]?.player1Id,
          player1Name: registrations[i * 2]?.player1Name,
          player2Id: registrations[i * 2 + 1]?.player1Id,
          player2Name: registrations[i * 2 + 1]?.player1Name,
          status: 'SCHEDULED',
          scheduledAt: new Date('2025-02-01'),
          startTime: `${10 + i}:00`,
          endTime: `${11 + i}:30`
        }
      })
      matches.push(match)
    }

    console.log(`✅ Created ${matches.length} matches`)

    // Summary
    console.log('\n=== Tournament Summary ===')
    console.log(`Tournament: ${tournament.name}`)
    console.log(`Registrations: ${registrations.length}`)
    console.log(`Players: ${players.length}`)
    console.log(`Matches: ${matches.length}`)
    console.log(`Registration Fee: $${tournament.registrationFee / 100} ${tournament.currency}`)
    console.log(`Prize Pool: $${tournament.prizePool / 100} ${tournament.currency}`)

  } catch (error) {
    console.error('Error seeding tournament:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()