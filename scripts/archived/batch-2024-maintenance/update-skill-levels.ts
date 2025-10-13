import { prisma } from '../lib/config/prisma'

async function updateSkillLevels() {
  try {
    console.log('Actualizando niveles de habilidad para inscripciones existentes...')
    
    const skillLevels = ['Principiante', 'Intermedio', 'Avanzado']
    const categoryLevels = {
      masculine: ['Open', '1ra Fuerza', '2da Fuerza', '3ra Fuerza'],
      feminine: ['Open', '1ra Fuerza', '2da Fuerza'],
      mixed: ['A', 'B', 'C', 'D']
    }
    
    // Get all registrations without skill levels
    const registrations = await prisma.tournamentRegistration.findMany({
      where: {
        OR: [
          { player1Level: null },
          { player2Level: null },
          { teamLevel: null }
        ]
      }
    })
    
    console.log(`Encontradas ${registrations.length} inscripciones sin niveles`)
    
    // Update each registration with random skill levels
    for (let i = 0; i < registrations.length; i++) {
      const reg = registrations[i]
      
      // Assign random skill levels
      const player1Level = skillLevels[Math.floor(Math.random() * skillLevels.length)]
      const player2Level = skillLevels[Math.floor(Math.random() * skillLevels.length)]
      
      // Calculate team level (take the higher level or average)
      let teamLevel: string
      if (player1Level === 'Avanzado' || player2Level === 'Avanzado') {
        teamLevel = 'Avanzado'
      } else if (player1Level === 'Intermedio' || player2Level === 'Intermedio') {
        teamLevel = 'Intermedio'
      } else {
        teamLevel = 'Principiante'
      }
      
      // Some teams get specific category levels (30% chance)
      if (Math.random() < 0.3) {
        const categories = Object.keys(categoryLevels)
        const category = categories[Math.floor(Math.random() * categories.length)] as keyof typeof categoryLevels
        const levels = categoryLevels[category]
        teamLevel = levels[Math.floor(Math.random() * levels.length)]
      }
      
      await prisma.tournamentRegistration.update({
        where: { id: reg.id },
        data: {
          player1Level,
          player2Level,
          teamLevel
        }
      })
      
      console.log(`${i + 1}. Actualizado: ${reg.player1Name} (${player1Level}) & ${reg.player2Name} (${player2Level}) - Equipo: ${teamLevel}`)
    }
    
    console.log('\n✅ Niveles de habilidad actualizados exitosamente')
    
    // Show summary
    const updatedRegs = await prisma.tournamentRegistration.groupBy({
      by: ['teamLevel'],
      _count: true
    })
    
    console.log('\n=== Resumen de Niveles ===')
    updatedRegs.forEach(group => {
      console.log(`${group.teamLevel || 'Sin nivel'}: ${group._count} equipos`)
    })
    
  } catch (error) {
    console.error('Error actualizando niveles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateSkillLevels()