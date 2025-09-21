import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const CLUB_ID = 'cmewbmc5q0001r4xiw4933udd'
  
  console.log('🗑️  Cleaning existing tournament data...')
  
  // Delete existing tournaments for the club
  await prisma.tournamentMatch.deleteMany({
    where: {
      Tournament: {
        clubId: CLUB_ID
      }
    }
  })
  
  await prisma.tournamentRound.deleteMany({
    where: {
      Tournament: {
        clubId: CLUB_ID
      }
    }
  })
  
  await prisma.tournamentRegistration.deleteMany({
    where: {
      Tournament: {
        clubId: CLUB_ID
      }
    }
  })
  
  await prisma.tournament.deleteMany({
    where: {
      clubId: CLUB_ID
    }
  })
  
  console.log('✅ Existing tournaments cleaned')
  
  // Create the demo tournament
  console.log('🏆 Creating Gran Torneo Demo 2025...')
  
  const tournament = await prisma.tournament.create({
    data: {
      id: `tournament_${Date.now()}_demo`,
      clubId: CLUB_ID,
      name: 'Gran Torneo Demo 2025',
      description: 'Torneo de demostración con todas las categorías desde Open hasta Sexta Fuerza. 20 parejas por categoría.',
      type: 'GROUP_STAGE',
      status: 'REGISTRATION_OPEN',
      category: 'MULTI',
      categories: ['OPEN', '1F', '2F', '3F', '4F', '5F', '6F'],
      registrationStart: new Date('2025-01-01'),
      registrationEnd: new Date('2025-01-31'),
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-02-28'),
      maxPlayers: 280, // 140 teams * 2 players
      registrationFee: 5000, // $50 per team
      prizePool: 50000,
      currency: 'MXN',
      matchDuration: 90,
      sets: 3,
      games: 6,
      tiebreak: true,
      rules: 'Reglas oficiales de la Federación Mexicana de Pádel',
      notes: 'Torneo demo con todas las categorías',
      updatedAt: new Date()
    }
  })
  
  console.log(`✅ Tournament created: ${tournament.name} (ID: ${tournament.id})`)
  
  // Create registrations for each category
  const categories = [
    { code: 'OPEN', name: 'Open' },
    { code: '1F', name: 'Primera Fuerza' },
    { code: '2F', name: 'Segunda Fuerza' },
    { code: '3F', name: 'Tercera Fuerza' },
    { code: '4F', name: 'Cuarta Fuerza' },
    { code: '5F', name: 'Quinta Fuerza' },
    { code: '6F', name: 'Sexta Fuerza' }
  ]
  
  const modalities = ['masculine', 'feminine']
  
  const mexicanNames = {
    masculine: [
      'Carlos', 'Miguel', 'José', 'Juan', 'Luis', 'Francisco', 'Antonio', 'Manuel', 
      'Pedro', 'Alejandro', 'Jorge', 'Roberto', 'Fernando', 'Diego', 'Ricardo',
      'Eduardo', 'Sergio', 'Arturo', 'Mario', 'Alberto', 'Raúl', 'Javier',
      'Rafael', 'Enrique', 'Víctor', 'Hugo', 'Andrés', 'Oscar', 'Gerardo', 'Marco'
    ],
    feminine: [
      'María', 'Ana', 'Laura', 'Patricia', 'Carmen', 'Rosa', 'Elena', 'Mónica',
      'Sandra', 'Claudia', 'Diana', 'Alejandra', 'Gabriela', 'Sofía', 'Mariana',
      'Fernanda', 'Daniela', 'Andrea', 'Valeria', 'Paola', 'Natalia', 'Adriana',
      'Verónica', 'Isabel', 'Teresa', 'Beatriz', 'Lucia', 'Regina', 'Martha', 'Silvia'
    ]
  }
  
  const lastNames = [
    'García', 'Hernández', 'López', 'Martínez', 'González', 'Rodríguez', 'Pérez',
    'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Reyes',
    'Cruz', 'Morales', 'Jiménez', 'Ruiz', 'Alvarez', 'Castillo', 'Romero', 'Mendoza',
    'Vargas', 'Gutiérrez', 'Ramos', 'Herrera', 'Medina', 'Castro', 'Campos'
  ]
  
  const levels = ['Principiante', 'Intermedio', 'Avanzado', 'Profesional']
  
  let totalTeams = 0
  
  for (const modality of modalities) {
    for (const category of categories) {
      console.log(`\n📋 Creating teams for ${modality} - ${category.name}...`)
      
      // Create 20 teams per category per modality
      for (let teamNum = 1; teamNum <= 20; teamNum++) {
        const names = mexicanNames[modality as keyof typeof mexicanNames]
        
        // Get random names for players
        const player1FirstName = names[Math.floor(Math.random() * names.length)]
        const player1LastName = lastNames[Math.floor(Math.random() * lastNames.length)]
        const player2FirstName = names[Math.floor(Math.random() * names.length)]
        const player2LastName = lastNames[Math.floor(Math.random() * lastNames.length)]
        
        const player1Level = levels[Math.floor(Math.random() * levels.length)]
        const player2Level = levels[Math.floor(Math.random() * levels.length)]
        
        const teamName = `${category.name} Team ${teamNum}`
        
        const registration = await prisma.tournamentRegistration.create({
          data: {
            id: `reg_${Date.now()}_${modality}_${category.code}_${teamNum}_${Math.random().toString(36).substr(2, 9)}`,
            tournamentId: tournament.id,
            player1Id: `player_${Date.now()}_1_${Math.random().toString(36).substr(2, 9)}`,
            player1Name: `${player1FirstName} ${player1LastName}`,
            player1Email: `${player1FirstName.toLowerCase()}.${player1LastName.toLowerCase()}@example.com`,
            player1Phone: `+52${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
            player1Level: player1Level,
            player2Id: `player_${Date.now()}_2_${Math.random().toString(36).substr(2, 9)}`,
            player2Name: `${player2FirstName} ${player2LastName}`,
            player2Email: `${player2FirstName.toLowerCase()}.${player2LastName.toLowerCase()}@example.com`,
            player2Phone: `+52${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
            player2Level: player2Level,
            teamLevel: player1Level,
            modality: modality,
            category: category.code,
            teamName: teamName,
            paymentStatus: 'PAID',
            paidAmount: 5000,
            paymentMethod: teamNum % 4 === 0 ? 'TERMINAL' : teamNum % 3 === 0 ? 'TRANSFER' : 'CASH',
            paymentDate: new Date(),
            confirmed: true,
            checkedIn: teamNum <= 15, // Check in first 15 teams per category
            checkedInAt: teamNum <= 15 ? new Date() : null,
            notes: `Equipo ${modality === 'masculine' ? 'masculino' : 'femenino'} de ${category.name}`,
            updatedAt: new Date()
          }
        })
        
        totalTeams++
      }
      
      console.log(`✅ Created 20 teams for ${modality} - ${category.name}`)
    }
  }
  
  console.log(`\n🎉 Successfully created demo tournament with ${totalTeams} teams!`)
  console.log(`   - 7 categories (Open to 6ta Fuerza)`)
  console.log(`   - 2 modalities (Masculine and Feminine)`)
  console.log(`   - 20 teams per category per modality`)
  console.log(`   - Total: ${totalTeams} teams (${totalTeams * 2} players)`)
  
  // Update tournament registration count
  await prisma.tournament.update({
    where: { id: tournament.id },
    data: {
      updatedAt: new Date()
    }
  })
  
  console.log(`\n🔗 Tournament URL: http://localhost:3000/dashboard/tournaments/${tournament.id}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })