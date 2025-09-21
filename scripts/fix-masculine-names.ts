import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Nombres correctos para equipos masculinos
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

// Nombres correctos para jugadores masculinos
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
  ['Emilio Medina', 'Ramón Aguilar'],
  ['Santiago Delgado', 'Rodrigo Paredes'],
  ['Leonardo Ramos', 'Adrián Valdez'],
  ['Mauricio Cortés', 'Guillermo Ibarra'],
  ['César Salinas', 'Marco Guzmán'],
  ['Nicolás Reyes', 'Joaquín Montes'],
  ['Tomás Carrillo', 'Raúl Cervantes'],
  ['Xavier Molina', 'Esteban Márquez'],
  ['Felipe Núñez', 'Arturo Valencia'],
  ['Bruno Espinoza', 'Sebastián Luna'],
  ['Diego Castañeda', 'Omar Fuentes'],
  ['Gustavo Peña', 'Armando Ríos'],
  ['Rubén Pacheco', 'Enrique Vázquez'],
  ['Julio Montoya', 'Alfonso Moreno']
]

async function main() {
  console.log('🔧 Corrigiendo nombres de equipos masculinos...')
  
  const tournament = await prisma.tournament.findFirst({
    where: {
      name: 'Torneo Demo Pequeño 2025'
    }
  })
  
  if (!tournament) {
    console.error('❌ Tournament not found')
    return
  }
  
  // Get all masculine registrations
  const masculineRegistrations = await prisma.tournamentRegistration.findMany({
    where: {
      tournamentId: tournament.id,
      modality: 'masculine'
    },
    orderBy: [
      { category: 'asc' },
      { id: 'asc' }
    ]
  })
  
  console.log(`📊 Found ${masculineRegistrations.length} masculine teams to fix`)
  
  let teamIndex = 0
  let playerIndex = 0
  
  for (const registration of masculineRegistrations) {
    let teamName = masculineTeamNames[teamIndex % masculineTeamNames.length]
    let [player1Name, player2Name] = playerIndex < masculinePlayerNames.length 
      ? masculinePlayerNames[playerIndex]
      : masculinePlayerNames[playerIndex % masculinePlayerNames.length]
    
    teamIndex++
    playerIndex++
    
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
  
  console.log('✅ Masculine registrations fixed')
  
  // Now update matches with the corrected names
  const rounds = await prisma.tournamentRound.findMany({
    where: {
      tournamentId: tournament.id,
      modality: 'masculine'
    }
  })
  
  const roundIds = rounds.map(r => r.id)
  
  const matches = await prisma.tournamentMatch.findMany({
    where: {
      tournamentId: tournament.id,
      roundId: {
        in: roundIds
      }
    }
  })
  
  console.log(`\n📊 Updating ${matches.length} masculine matches...`)
  
  for (const match of matches) {
    // Find the round to get category
    const round = rounds.find(r => r.id === match.roundId)
    if (!round) continue
    
    // Extract team numbers from current match
    const team1Match = match.team1Name?.match(/\d+$/) || match.team1Name?.match(/(\w+)$/)
    const team2Match = match.team2Name?.match(/\d+$/) || match.team2Name?.match(/(\w+)$/)
    
    if (team1Match && team2Match) {
      // Get registrations for this category
      const categoryRegs = await prisma.tournamentRegistration.findMany({
        where: {
          tournamentId: tournament.id,
          modality: 'masculine',
          category: round.category || 'OPEN'
        },
        orderBy: { id: 'asc' }
      })
      
      // Try to match by current team name or by position
      let team1Reg = categoryRegs.find(r => r.teamName === match.team1Name)
      let team2Reg = categoryRegs.find(r => r.teamName === match.team2Name)
      
      // If not found by name, try by position (for numbered teams)
      if (!team1Reg) {
        const team1Num = parseInt(team1Match[0]) || 0
        if (team1Num > 0 && team1Num <= categoryRegs.length) {
          team1Reg = categoryRegs[team1Num - 1]
        }
      }
      
      if (!team2Reg) {
        const team2Num = parseInt(team2Match[0]) || 0
        if (team2Num > 0 && team2Num <= categoryRegs.length) {
          team2Reg = categoryRegs[team2Num - 1]
        }
      }
      
      // If still not found, try to match by index
      if (!team1Reg && categoryRegs.length >= 8) {
        // Map old team names to indices
        const oldNames = ['Los Olimpo', 'Los Valhalla', 'Los Asgard', 'Los Midgard', 
                         'Los Jotunheim', 'Los Alfheim', 'Los Helheim', 'Los Titán']
        const idx = oldNames.indexOf(match.team1Name || '')
        if (idx >= 0 && idx < categoryRegs.length) {
          team1Reg = categoryRegs[idx]
        }
      }
      
      if (!team2Reg && categoryRegs.length >= 8) {
        const oldNames = ['Los Olimpo', 'Los Valhalla', 'Los Asgard', 'Los Midgard', 
                         'Los Jotunheim', 'Los Alfheim', 'Los Helheim', 'Los Titán']
        const idx = oldNames.indexOf(match.team2Name || '')
        if (idx >= 0 && idx < categoryRegs.length) {
          team2Reg = categoryRegs[idx]
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
  }
  
  console.log('✅ Masculine matches updated')
  
  // Show sample of corrected data
  const sampleRegs = await prisma.tournamentRegistration.findMany({
    where: {
      tournamentId: tournament.id,
      modality: 'masculine',
      category: 'OPEN'
    },
    take: 8
  })
  
  console.log('\n📋 Corrected masculine teams (OPEN):')
  sampleRegs.forEach((reg, idx) => {
    console.log(`  ${idx + 1}. ${reg.teamName}: ${reg.player1Name} & ${reg.player2Name}`)
  })
  
  const sampleMatches = await prisma.tournamentMatch.findMany({
    where: {
      tournamentId: tournament.id,
      round: {
        contains: 'Masculino'
      }
    },
    take: 6
  })
  
  console.log('\n🏆 Sample corrected masculine matches:')
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