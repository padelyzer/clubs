import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('💰 Updating tournament fees and prizes...')
  
  // Find the demo tournament
  const tournament = await prisma.tournament.findFirst({
    where: {
      name: 'Gran Torneo Demo 2025'
    }
  })
  
  if (!tournament) {
    console.error('❌ Tournament not found')
    return
  }
  
  console.log(`Found tournament: ${tournament.name} (ID: ${tournament.id})`)
  
  // Update tournament with new fee and total prize pool
  // Prize structure:
  // OPEN: $10,000 per modality (2 x $10,000 = $20,000)
  // 1F: $9,000 per modality (2 x $9,000 = $18,000)
  // 2F: $8,000 per modality (2 x $8,000 = $16,000)
  // 3F: $7,000 per modality (2 x $7,000 = $14,000)
  // 4F: $6,500 per modality (2 x $6,500 = $13,000)
  // 5F: $5,500 per modality (2 x $5,500 = $11,000)
  // 6F: $5,000 per modality (2 x $5,000 = $10,000)
  // Total: $102,000
  
  const updatedTournament = await prisma.tournament.update({
    where: { id: tournament.id },
    data: {
      registrationFee: 120000, // $1,200 MXN in cents
      prizePool: 10200000, // $102,000 MXN total in cents
      notes: `Torneo demo con todas las categorías. 
Cuota de inscripción: $1,200 MXN por equipo.
Premios por categoría (por modalidad):
- Open: $10,000 MXN
- Primera Fuerza: $9,000 MXN
- Segunda Fuerza: $8,000 MXN
- Tercera Fuerza: $7,000 MXN
- Cuarta Fuerza: $6,500 MXN
- Quinta Fuerza: $5,500 MXN
- Sexta Fuerza: $5,000 MXN`,
      updatedAt: new Date()
    }
  })
  
  console.log('✅ Tournament fees updated:')
  console.log(`   - Registration fee: $${updatedTournament.registrationFee / 100} MXN`)
  console.log(`   - Total prize pool: $${updatedTournament.prizePool / 100} MXN`)
  
  // Update all registrations to reflect the new payment amount
  const registrations = await prisma.tournamentRegistration.updateMany({
    where: {
      tournamentId: tournament.id
    },
    data: {
      paidAmount: 120000, // $1,200 MXN in cents
      updatedAt: new Date()
    }
  })
  
  console.log(`✅ Updated ${registrations.count} registrations with new fee amount`)
  
  // Display prize breakdown
  console.log('\n💵 Prize Distribution:')
  console.log('   Category         | Per Modality | Total (2 modalities)')
  console.log('   -----------------|--------------|--------------------')
  console.log('   Open            | $10,000 MXN  | $20,000 MXN')
  console.log('   Primera Fuerza  | $9,000 MXN   | $18,000 MXN')
  console.log('   Segunda Fuerza  | $8,000 MXN   | $16,000 MXN')
  console.log('   Tercera Fuerza  | $7,000 MXN   | $14,000 MXN')
  console.log('   Cuarta Fuerza   | $6,500 MXN   | $13,000 MXN')
  console.log('   Quinta Fuerza   | $5,500 MXN   | $11,000 MXN')
  console.log('   Sexta Fuerza    | $5,000 MXN   | $10,000 MXN')
  console.log('   -----------------|--------------|--------------------')
  console.log('                    |              | Total: $102,000 MXN')
  
  // Calculate revenue
  const totalTeams = 280
  const totalRevenue = totalTeams * 1200
  const netProfit = totalRevenue - 102000
  
  console.log('\n📊 Financial Summary:')
  console.log(`   - Total teams: ${totalTeams}`)
  console.log(`   - Registration fee: $1,200 MXN per team`)
  console.log(`   - Total revenue: $${totalRevenue.toLocaleString()} MXN`)
  console.log(`   - Total prizes: $102,000 MXN`)
  console.log(`   - Net profit: $${netProfit.toLocaleString()} MXN`)
  
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