import { prisma } from '../lib/config/prisma'

async function updateBasicPackage() {
  try {
    console.log('Actualizando paquete Básico...\n')
    
    const updated = await prisma.saasPackage.updateMany({
      where: {
        name: 'basic'
      },
      data: {
        maxCourts: 5,
        displayName: 'Básico'  // Quitar el "5" del nombre
      }
    })
    
    if (updated.count > 0) {
      console.log('✅ Paquete Básico actualizado correctamente:')
      console.log('   - Máximo de canchas: 5')
      console.log('   - Nombre para mostrar: Básico')
      
      // Verificar el cambio
      const basicPackage = await prisma.saasPackage.findFirst({
        where: { name: 'basic' }
      })
      
      if (basicPackage) {
        console.log('\nVerificación:')
        console.log(`  Nombre: ${basicPackage.displayName}`)
        console.log(`  Max Canchas: ${basicPackage.maxCourts}`)
      }
    } else {
      console.log('❌ No se encontró el paquete básico para actualizar')
    }
    
  } catch (error) {
    console.error('Error al actualizar:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateBasicPackage()