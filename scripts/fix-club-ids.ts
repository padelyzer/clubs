import { prisma } from '../lib/config/prisma'

async function fixClubIds() {
  try {
    // Obtener todas las reservas con clubId incorrecto
    const bookingsToFix = await prisma.booking.findMany({
      where: {
        clubId: {
          not: 'dev-club-001'
        }
      },
      select: {
        id: true,
        playerName: true,
        clubId: true
      }
    })
    
    console.log(`Encontradas ${bookingsToFix.length} reservas con clubId incorrecto`)
    
    if (bookingsToFix.length > 0) {
      // Actualizar todas las reservas al clubId correcto
      const result = await prisma.booking.updateMany({
        where: {
          clubId: {
            not: 'dev-club-001'
          }
        },
        data: {
          clubId: 'dev-club-001'
        }
      })
      
      console.log(`✅ Actualizadas ${result.count} reservas al clubId: dev-club-001`)
      
      bookingsToFix.forEach(booking => {
        console.log(`- ${booking.playerName} (${booking.id})`)
        console.log(`  Cambió de: ${booking.clubId} → dev-club-001`)
      })
    } else {
      console.log('✅ Todas las reservas ya tienen el clubId correcto')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixClubIds()