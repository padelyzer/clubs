import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏆 Creando torneo pequeño con 8 equipos por categoría...')
  
  // Primero eliminar todos los datos existentes
  console.log('🗑️  Limpiando datos existentes...')
  await prisma.tournamentMatch.deleteMany()
  await prisma.tournamentRound.deleteMany()
  await prisma.tournamentRegistration.deleteMany()
  await prisma.tournament.deleteMany()
  
  // Obtener el club existente
  const club = await prisma.club.findFirst()
  if (!club) {
    console.error('❌ No se encontró ningún club. Por favor, crea un club primero.')
    return
  }
  
  // Crear el torneo
  const tournament = await prisma.tournament.create({
    data: {
      id: `tournament_${Date.now()}_small`,
      clubId: club.id,
      name: 'Torneo Demo Pequeño 2025',
      description: 'Torneo de prueba con 8 equipos por categoría',
      type: 'GROUP_STAGE',
      status: 'REGISTRATION_OPEN',
      registrationStart: new Date('2025-01-01'),
      registrationEnd: new Date('2025-01-31'),
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-02-15'),
      maxPlayers: 112, // 8 equipos x 14 categorías
      registrationFee: 120000, // $1,200 MXN in cents
      prizePool: 5000000, // $50,000 MXN total
      currency: 'MXN',
      matchDuration: 90,
      sets: 3,
      games: 6,
      tiebreak: true,
      rules: 'Reglas oficiales de la Federación Mexicana de Pádel',
      notes: 'Torneo demo con 8 equipos por categoría para pruebas',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
  
  console.log(`✅ Torneo creado: ${tournament.name} (ID: ${tournament.id})`)
  
  // Categorías y modalidades
  const categories = ['OPEN', '1F', '2F', '3F', '4F', '5F', '6F']
  const modalities = ['masculine', 'feminine']
  const teamsPerCategory = 8
  
  // Crear inscripciones
  console.log('📝 Creando inscripciones...')
  let totalRegistrations = 0
  
  for (const modality of modalities) {
    for (const category of categories) {
      for (let i = 1; i <= teamsPerCategory; i++) {
        const categoryLabel = category === 'OPEN' ? 'Open' : category
        const modalityLabel = modality === 'masculine' ? 'M' : 'F'
        
        await prisma.tournamentRegistration.create({
          data: {
            id: `reg_${Date.now()}_${modality}_${category}_${i}`,
            tournamentId: tournament.id,
            player1Id: `player1_${modality}_${category}_${i}`,
            player1Name: `Jugador ${i}A ${modalityLabel}${categoryLabel}`,
            player1Email: `player${i}a_${modality}_${category}@demo.com`,
            player1Phone: `555-${String(i).padStart(4, '0')}`,
            player1Level: category,
            player2Id: `player2_${modality}_${category}_${i}`,
            player2Name: `Jugador ${i}B ${modalityLabel}${categoryLabel}`,
            player2Email: `player${i}b_${modality}_${category}@demo.com`,
            player2Phone: `555-${String(i + 100).padStart(4, '0')}`,
            player2Level: category,
            teamLevel: category,
            modality: modality,
            category: category,
            teamName: `Equipo ${modalityLabel}${categoryLabel}-${i}`,
            paymentStatus: 'completed',
            paidAmount: 120000,
            paymentMethod: i % 3 === 0 ? 'terminal' : i % 3 === 1 ? 'transfer' : 'cash',
            paymentReference: `PAY-${Date.now()}-${i}`,
            paymentDate: new Date(),
            confirmed: true,
            checkedIn: false,
            notes: `Equipo ${i} de ${modality} ${category}`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        totalRegistrations++
      }
    }
  }
  
  console.log(`✅ ${totalRegistrations} inscripciones creadas`)
  
  // Actualizar el torneo a "en progreso"
  await prisma.tournament.update({
    where: { id: tournament.id },
    data: { status: 'IN_PROGRESS' }
  })
  
  console.log('\n📊 Resumen del torneo:')
  console.log(`   - Categorías: 7 (Open + 6 fuerzas)`)
  console.log(`   - Modalidades: 2 (Masculino y Femenino)`)
  console.log(`   - Equipos por categoría: ${teamsPerCategory}`)
  console.log(`   - Total de equipos: ${totalRegistrations}`)
  console.log(`   - Estructura sugerida:`)
  console.log(`     • Fase de grupos: 2 grupos de 4 equipos`)
  console.log(`     • Cuartos de final: 4 equipos clasificados`)
  console.log(`     • Semifinales: 2 partidos`)
  console.log(`     • Final: 1 partido`)
  
  console.log(`\n🔗 URL del torneo: http://localhost:3000/dashboard/tournaments/${tournament.id}`)
  console.log('✨ Usa el botón "Auto-Generar Grupos" para crear la fase de grupos')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })