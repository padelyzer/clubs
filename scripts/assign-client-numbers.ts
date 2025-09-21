import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function assignClientNumbers() {
  try {
    console.log('📋 ASIGNANDO NÚMEROS DE CLIENTE')
    console.log('='.repeat(60))
    
    // Get current year
    const currentYear = new Date().getFullYear()
    
    // Get all clubs
    const clubs = await prisma.club.findMany()
    
    for (const club of clubs) {
      console.log(`\n🏢 Procesando club: ${club.name}`)
      
      // Generate club prefix (first 3 letters)
      const clubPrefix = club.name.substring(0, 3).toUpperCase()
      console.log(`   Prefijo: ${clubPrefix}`)
      
      // Get all players without client numbers for this club
      const playersWithoutNumber = await prisma.player.findMany({
        where: {
          clubId: club.id,
          clientNumber: null
        },
        orderBy: {
          createdAt: 'asc' // Assign numbers based on creation date
        }
      })
      
      console.log(`   Clientes sin número: ${playersWithoutNumber.length}`)
      
      if (playersWithoutNumber.length === 0) {
        console.log('   ✅ Todos los clientes ya tienen número')
        continue
      }
      
      // Find the last assigned number for this club and year
      const lastPlayer = await prisma.player.findFirst({
        where: {
          clubId: club.id,
          clientNumber: {
            startsWith: `${clubPrefix}-${currentYear}-`
          }
        },
        orderBy: {
          clientNumber: 'desc'
        }
      })
      
      let nextNumber = 1
      if (lastPlayer && lastPlayer.clientNumber) {
        const parts = lastPlayer.clientNumber.split('-')
        nextNumber = parseInt(parts[2], 10) + 1
      }
      
      // Assign numbers to players
      let assignedCount = 0
      for (const player of playersWithoutNumber) {
        const clientNumber = `${clubPrefix}-${currentYear}-${String(nextNumber).padStart(4, '0')}`
        
        await prisma.player.update({
          where: { id: player.id },
          data: { clientNumber }
        })
        
        console.log(`   ✅ ${player.name}: ${clientNumber}`)
        nextNumber++
        assignedCount++
      }
      
      console.log(`   📊 Total asignados: ${assignedCount}`)
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ PROCESO COMPLETADO')
    
    // Show summary
    const totalWithNumber = await prisma.player.count({
      where: { clientNumber: { not: null } }
    })
    const totalWithoutNumber = await prisma.player.count({
      where: { clientNumber: null }
    })
    
    console.log('\n📈 RESUMEN:')
    console.log(`   Clientes con número: ${totalWithNumber}`)
    console.log(`   Clientes sin número: ${totalWithoutNumber}`)
    
  } catch (error) {
    console.error('❌ Error asignando números de cliente:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the assignment
assignClientNumbers()