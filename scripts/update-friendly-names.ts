import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Nombres amigables para equipos masculinos
const masculineTeamNames = [
  'Los Guerreros', 'Los Titanes', 'Los Vikingos', 'Los Espartanos',
  'Los Halcones', 'Los Lobos', 'Los Tigres', 'Los Leones',
  'Los Águilas', 'Los Panteras', 'Los Toros', 'Los Dragones',
  'Los Fénix', 'Los Gladiadores', 'Los Caballeros', 'Los Reyes',
  'Los Campeones', 'Los Invencibles', 'Los Rayos', 'Los Truenos',
  'Los Huracanes', 'Los Tornados', 'Los Volcanes', 'Los Meteoros',
  'Los Cometas', 'Los Astros', 'Los Soles', 'Los Galaxia',
  'Los Cosmos', 'Los Neptuno', 'Los Marte', 'Los Júpiter',
  'Los Saturno', 'Los Plutón', 'Los Mercurio', 'Los Venus',
  'Los Orión', 'Los Andrómeda', 'Los Centauro', 'Los Pegaso',
  'Los Hércules', 'Los Atlas', 'Los Zeus', 'Los Apolo',
  'Los Poseidón', 'Los Ares', 'Los Hermes', 'Los Cronos',
  'Los Titán', 'Los Olimpo', 'Los Valhalla', 'Los Asgard',
  'Los Midgard', 'Los Jotunheim', 'Los Alfheim', 'Los Helheim'
]

// Nombres amigables para equipos femeninos
const feminineTeamNames = [
  'Las Guerreras', 'Las Titanas', 'Las Valkirias', 'Las Espartanas',
  'Las Halconas', 'Las Lobas', 'Las Tigresas', 'Las Leonas',
  'Las Águilas', 'Las Panteras', 'Las Gacelas', 'Las Dragonas',
  'Las Fénix', 'Las Gladiadoras', 'Las Damas', 'Las Reinas',
  'Las Campeonas', 'Las Invencibles', 'Las Centellas', 'Las Tormentas',
  'Las Huracanas', 'Las Tornadas', 'Las Volcánicas', 'Las Meteoras',
  'Las Cometas', 'Las Estrellas', 'Las Lunas', 'Las Galaxias',
  'Las Cosmos', 'Las Neptuno', 'Las Venus', 'Las Júpiter',
  'Las Saturno', 'Las Plutón', 'Las Mercurio', 'Las Marte',
  'Las Orión', 'Las Andrómeda', 'Las Centauro', 'Las Pegaso',
  'Las Atenea', 'Las Artemisa', 'Las Afrodita', 'Las Hera',
  'Las Deméter', 'Las Perséfone', 'Las Hestia', 'Las Gaia',
  'Las Selene', 'Las Aurora', 'Las Iris', 'Las Nike',
  'Las Minerva', 'Las Diana', 'Las Juno', 'Las Vesta'
]

// Nombres de jugadores masculinos
const masculinePlayerNames = [
  ['Carlos González', 'Miguel Rodríguez'],
  ['Juan Martínez', 'Pedro López'],
  ['Diego Hernández', 'Luis García'],
  ['Alejandro Díaz', 'Roberto Pérez'],
  ['Fernando Sánchez', 'Eduardo Ramírez'],
  ['Ricardo Torres', 'Manuel Flores'],
  ['José Rivera', 'Antonio Gómez'],
  ['Francisco Ruiz', 'Daniel Jiménez'],
  ['Javier Morales', 'Sergio Ortiz'],
  ['Alberto Castro', 'Mario Vargas'],
  ['Andrés Rojas', 'Pablo Mendoza'],
  ['Gabriel Silva', 'Rafael Guerrero'],
  ['Óscar Navarro', 'Iván Campos'],
  ['Hugo Vega', 'Víctor Herrera'],
  ['Emilio Medina', 'Ramón Aguilar']
]

// Nombres de jugadoras femeninas
const femininePlayerNames = [
  ['María González', 'Ana Rodríguez'],
  ['Laura Martínez', 'Carmen López'],
  ['Isabel Hernández', 'Sofía García'],
  ['Patricia Díaz', 'Elena Pérez'],
  ['Lucía Sánchez', 'Marta Ramírez'],
  ['Andrea Torres', 'Julia Flores'],
  ['Claudia Rivera', 'Beatriz Gómez'],
  ['Alejandra Ruiz', 'Natalia Jiménez'],
  ['Mónica Morales', 'Cristina Ortiz'],
  ['Valeria Castro', 'Paula Vargas'],
  ['Diana Rojas', 'Gabriela Mendoza'],
  ['Carolina Silva', 'Adriana Guerrero'],
  ['Fernanda Navarro', 'Daniela Campos'],
  ['Paola Vega', 'Victoria Herrera'],
  ['Regina Medina', 'Camila Aguilar']
]

async function main() {
  console.log('🎯 Actualizando nombres amigables para equipos y jugadores...')
  
  // Find the small tournament
  const tournament = await prisma.tournament.findFirst({
    where: {
      name: 'Torneo Demo Pequeño 2025'
    }
  })
  
  if (!tournament) {
    console.error('❌ Tournament not found')
    return
  }
  
  // Get all registrations
  const registrations = await prisma.tournamentRegistration.findMany({
    where: {
      tournamentId: tournament.id
    },
    orderBy: [
      { modality: 'asc' },
      { category: 'asc' }
    ]
  })
  
  console.log(`📊 Found ${registrations.length} registrations to update`)
  
  // Track used names to avoid duplicates
  const usedMasculineNames = new Set<string>()
  const usedFeminineNames = new Set<string>()
  let mascPlayerIndex = 0
  let femPlayerIndex = 0
  
  // Update registrations with friendly names
  for (const registration of registrations) {
    let teamName = ''
    let player1Name = ''
    let player2Name = ''
    
    if (registration.modality === 'masculine') {
      // Find an unused team name
      let nameFound = false
      for (const name of masculineTeamNames) {
        if (!usedMasculineNames.has(name)) {
          teamName = name
          usedMasculineNames.add(name)
          nameFound = true
          break
        }
      }
      
      // Use player names
      if (mascPlayerIndex < masculinePlayerNames.length) {
        [player1Name, player2Name] = masculinePlayerNames[mascPlayerIndex]
        mascPlayerIndex++
      } else {
        // Generate random-looking names if we run out
        const num = parseInt(registration.player1Id?.match(/\d+$/)?.[0] || '1')
        player1Name = `Carlos ${['García', 'López', 'Martínez', 'González', 'Rodríguez'][num % 5]}`
        player2Name = `Miguel ${['Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'][num % 5]}`
      }
      
      if (!nameFound) {
        teamName = `Equipo ${registration.category}-${registration.player1Id?.slice(-1) || '1'}`
      }
    } else if (registration.modality === 'feminine') {
      // Find an unused team name
      let nameFound = false
      for (const name of feminineTeamNames) {
        if (!usedFeminineNames.has(name)) {
          teamName = name
          usedFeminineNames.add(name)
          nameFound = true
          break
        }
      }
      
      // Use player names
      if (femPlayerIndex < femininePlayerNames.length) {
        [player1Name, player2Name] = femininePlayerNames[femPlayerIndex]
        femPlayerIndex++
      } else {
        // Generate random-looking names if we run out
        const num = parseInt(registration.player1Id?.match(/\d+$/)?.[0] || '1')
        player1Name = `María ${['García', 'López', 'Martínez', 'González', 'Rodríguez'][num % 5]}`
        player2Name = `Ana ${['Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores'][num % 5]}`
      }
      
      if (!nameFound) {
        teamName = `Equipo ${registration.category}-${registration.player1Id?.slice(-1) || '1'}`
      }
    }
    
    // Update registration
    await prisma.tournamentRegistration.update({
      where: { id: registration.id },
      data: {
        teamName,
        player1Name,
        player2Name,
        updatedAt: new Date()
      }
    })
  }
  
  console.log('✅ Registrations updated with friendly names')
  
  // Now update all matches with the new team names
  const matches = await prisma.tournamentMatch.findMany({
    where: {
      tournamentId: tournament.id
    }
  })
  
  console.log(`\n📊 Updating ${matches.length} matches with new team names...`)
  
  for (const match of matches) {
    // Find the teams based on the old naming pattern
    let team1Reg = null
    let team2Reg = null
    
    // Extract team numbers from current names (e.g., "Equipo MOpen-1" -> 1)
    const team1Match = match.team1Name?.match(/(\d+)$/)
    const team2Match = match.team2Name?.match(/(\d+)$/)
    
    if (team1Match && team2Match) {
      const team1Num = parseInt(team1Match[1])
      const team2Num = parseInt(team2Match[1])
      
      // Determine modality and category from round
      const ismasculine = match.round?.includes('Masculino')
      const modality = ismasculine ? 'masculine' : 'feminine'
      
      // Extract category from round
      let category = 'OPEN'
      if (match.round?.includes('Primera')) category = '1F'
      else if (match.round?.includes('Segunda')) category = '2F'
      else if (match.round?.includes('Tercera')) category = '3F'
      else if (match.round?.includes('Cuarta')) category = '4F'
      else if (match.round?.includes('Quinta')) category = '5F'
      else if (match.round?.includes('Sexta')) category = '6F'
      
      // Get all registrations for this category/modality
      const categoryRegs = await prisma.tournamentRegistration.findMany({
        where: {
          tournamentId: tournament.id,
          modality,
          category
        },
        orderBy: { id: 'asc' }
      })
      
      // Map team numbers to registrations (1-indexed)
      if (categoryRegs[team1Num - 1]) {
        team1Reg = categoryRegs[team1Num - 1]
      }
      if (categoryRegs[team2Num - 1]) {
        team2Reg = categoryRegs[team2Num - 1]
      }
    }
    
    if (team1Reg && team2Reg) {
      await prisma.tournamentMatch.update({
        where: { id: match.id },
        data: {
          team1Name: team1Reg.teamName,
          team1Player1: team1Reg.player1Name,
          team1Player2: team1Reg.player2Name,
          team2Name: team2Reg.teamName,
          team2Player1: team2Reg.player1Name,
          team2Player2: team2Reg.player2Name,
          updatedAt: new Date()
        }
      })
    }
  }
  
  console.log('✅ Matches updated with friendly team names')
  
  // Show sample of updated data
  const sampleRegs = await prisma.tournamentRegistration.findMany({
    where: {
      tournamentId: tournament.id,
      category: 'OPEN'
    },
    take: 8
  })
  
  console.log('\n📋 Sample updated teams:')
  sampleRegs.forEach(reg => {
    const modalityLabel = reg.modality === 'masculine' ? '♂️' : '♀️'
    console.log(`  ${modalityLabel} ${reg.teamName}: ${reg.player1Name} & ${reg.player2Name}`)
  })
  
  const sampleMatches = await prisma.tournamentMatch.findMany({
    where: {
      tournamentId: tournament.id,
      round: {
        contains: 'Open'
      }
    },
    take: 6
  })
  
  console.log('\n🏆 Sample updated matches:')
  sampleMatches.forEach(match => {
    console.log(`  ${match.team1Name} vs ${match.team2Name}`)
  })
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })