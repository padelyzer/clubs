import { prisma } from '../lib/config/prisma'

async function updateCategories() {
  try {
    console.log('Actualizando categorías competitivas para inscripciones existentes...')
    
    // Categorías disponibles
    const modalitiesAndCategories = [
      { modality: 'Masculino', categories: ['Open', '1ra', '2da', '3ra', '4ta', '5ta', '6ta'] },
      { modality: 'Femenino', categories: ['Open', '1ra', '2da', '3ra'] },
      { modality: 'Mixto', categories: ['A', 'B', 'C', 'D'] }
    ]
    
    // Get all registrations without categories
    const registrations = await prisma.tournamentRegistration.findMany({
      where: {
        OR: [
          { modality: null },
          { category: null }
        ]
      }
    })
    
    console.log(`Encontradas ${registrations.length} inscripciones sin categoría competitiva`)
    
    // Update each registration with random category
    for (let i = 0; i < registrations.length; i++) {
      const reg = registrations[i]
      
      // Assign random modality and category
      const modalityData = modalitiesAndCategories[Math.floor(Math.random() * modalitiesAndCategories.length)]
      const modality = modalityData.modality
      const category = modalityData.categories[Math.floor(Math.random() * modalityData.categories.length)]
      
      await prisma.tournamentRegistration.update({
        where: { id: reg.id },
        data: {
          modality,
          category
        }
      })
      
      console.log(`${i + 1}. Actualizado: ${reg.player1Name} & ${reg.player2Name} → ${modality} ${category}`)
    }
    
    console.log('\n✅ Categorías competitivas actualizadas exitosamente')
    
    // Show summary
    const updatedRegs = await prisma.$queryRaw<any[]>`
      SELECT modality, category, COUNT(*) as count 
      FROM "TournamentRegistration" 
      WHERE modality IS NOT NULL 
      GROUP BY modality, category 
      ORDER BY modality, category
    `
    
    console.log('\n=== Resumen de Categorías ===')
    updatedRegs.forEach(group => {
      console.log(`${group.modality} ${group.category}: ${group.count} equipos`)
    })
    
    // Show distribution by modality
    const modalitySummary = await prisma.$queryRaw<any[]>`
      SELECT modality, COUNT(*) as count 
      FROM "TournamentRegistration" 
      WHERE modality IS NOT NULL 
      GROUP BY modality 
      ORDER BY count DESC
    `
    
    console.log('\n=== Distribución por Modalidad ===')
    modalitySummary.forEach(mod => {
      console.log(`${mod.modality}: ${mod.count} equipos`)
    })
    
  } catch (error) {
    console.error('Error actualizando categorías:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateCategories()