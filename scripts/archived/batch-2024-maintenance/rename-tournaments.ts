import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📝 Renombrando torneos para reflejar su tipo...')
  
  try {
    // Buscar los torneos existentes
    const tournaments = await prisma.tournament.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        category: true,
        description: true
      }
    })
    
    for (const tournament of tournaments) {
      let newName = ''
      let newDescription = ''
      
      switch (tournament.type) {
        case 'SINGLE_ELIMINATION':
          if (tournament.category === 'M_3F') {
            newName = 'Torneo Eliminación Directa - Masculino 3ra'
            newDescription = 'Torneo de ELIMINACIÓN DIRECTA (Single Elimination). Los perdedores quedan eliminados inmediatamente. Formato de partidos a 2 de 3 sets. Categoría Masculino 3ra Fuerza.'
          }
          break
          
        case 'ROUND_ROBIN':
          if (tournament.category === 'F_2F') {
            newName = 'Torneo Round Robin (Todos vs Todos) - Femenino 2da'
            newDescription = 'Torneo ROUND ROBIN donde todas las parejas juegan contra todas. Sistema de puntos: 3 por victoria, 1 por empate, 0 por derrota. Las 4 mejores pasan a playoffs de eliminación directa. Categoría Femenino 2da Fuerza.'
          }
          break
          
        case 'DOUBLE_ELIMINATION':
          if (tournament.category === 'MX_OPEN') {
            newName = 'Torneo Doble Eliminación - Mixto Open'
            newDescription = 'Torneo de DOBLE ELIMINACIÓN con bracket de ganadores y perdedores. Los equipos tienen una segunda oportunidad tras perder. La final es entre el campeón del bracket ganadores vs el campeón del bracket perdedores. Categoría Mixto Open.'
          }
          break
          
        case 'GROUP_STAGE':
          // Para futura implementación
          newName = tournament.name.replace('Master Cup', 'Torneo Fase de Grupos + Eliminación')
          newDescription = 'Torneo con FASE DE GRUPOS seguida de ELIMINACIÓN DIRECTA. Primera fase: grupos de 4 equipos en round robin. Los 2 mejores de cada grupo pasan a playoffs de eliminación directa.'
          break
          
        case 'SWISS':
          // Para futura implementación
          newName = tournament.name.replace('Liga', 'Torneo Sistema Suizo')
          newDescription = 'Torneo SISTEMA SUIZO donde los equipos juegan contra rivales con puntuación similar. Sin eliminación, todos juegan el mismo número de rondas. Campeón determinado por puntos totales.'
          break
      }
      
      if (newName && newDescription) {
        await prisma.tournament.update({
          where: { id: tournament.id },
          data: {
            name: newName,
            description: newDescription
          }
        })
        console.log(`✅ Actualizado: ${newName}`)
      }
    }
    
    // Verificar los cambios
    console.log('\n📊 Torneos actualizados:')
    const updatedTournaments = await prisma.tournament.findMany({
      select: {
        name: true,
        type: true,
        status: true,
        description: true
      }
    })
    
    updatedTournaments.forEach(t => {
      console.log(`\n🏆 ${t.name}`)
      console.log(`   Tipo: ${t.type}`)
      console.log(`   Estado: ${t.status}`)
      console.log(`   ${t.description?.substring(0, 100)}...`)
    })
    
  } catch (error) {
    console.error('Error renombrando torneos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()