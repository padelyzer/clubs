import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if the field exists by trying to query it
    const clubSettings = await prisma.clubSettings.findFirst({
      select: {
        id: true,
        clubId: true,
        defaultMaxStudents: true,
        defaultClassRecurrences: true,
        defaultCourtCostPerHour: true,
        groupClassPrice: true,
        privateClassPrice: true,
        semiPrivateClassPrice: true
      }
    })

    if (clubSettings) {
      console.log('✅ Campo defaultClassRecurrences verificado correctamente')
      console.log('\nConfiguración actual:')
      console.log('- defaultMaxStudents:', clubSettings.defaultMaxStudents)
      console.log('- defaultClassRecurrences:', clubSettings.defaultClassRecurrences)
      console.log('- defaultCourtCostPerHour:', clubSettings.defaultCourtCostPerHour / 100, 'MXN')
      console.log('- groupClassPrice:', clubSettings.groupClassPrice / 100, 'MXN')
      console.log('- privateClassPrice:', clubSettings.privateClassPrice / 100, 'MXN')
      console.log('- semiPrivateClassPrice:', clubSettings.semiPrivateClassPrice / 100, 'MXN')
    } else {
      console.log('⚠️ No se encontró ninguna configuración de club')
    }

    // Count clubs to see if we need to initialize settings
    const clubCount = await prisma.club.count()
    console.log(`\nTotal de clubes en el sistema: ${clubCount}`)

  } catch (error) {
    console.error('❌ Error al verificar el campo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()