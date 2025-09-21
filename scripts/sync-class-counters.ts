#!/usr/bin/env npx tsx

/**
 * Script de mantenimiento para sincronizar contadores de estudiantes en todas las clases
 * Ejecutar cuando se detecten inconsistencias en los contadores
 */

import { prisma } from '../lib/config/prisma'
import { syncAllClassCounters } from '../lib/utils/class-counter'

async function main() {
  console.log('🔧 SCRIPT DE MANTENIMIENTO: Sincronización de contadores de clases')
  console.log('================================================================\n')

  try {
    // Mostrar estado actual antes de la sincronización
    console.log('📊 Estado actual de las clases:')
    const classes = await prisma.class.findMany({
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: { not: 'CANCELLED' }
              }
            }
          }
        }
      }
    })

    for (const classItem of classes) {
      const actualCount = classItem._count.bookings
      const storedCount = classItem.currentStudents
      const status = actualCount === storedCount ? '✅' : '❌'
      
      console.log(`  ${status} ${classItem.name}:`)
      console.log(`      Almacenado: ${storedCount} | Real: ${actualCount}`)
      
      if (actualCount !== storedCount) {
        console.log(`      🔧 Necesita corrección: ${storedCount} → ${actualCount}`)
      }
    }

    console.log('\n🔄 Ejecutando sincronización...')
    await syncAllClassCounters()

    console.log('\n📊 Estado después de la sincronización:')
    const updatedClasses = await prisma.class.findMany({
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: { not: 'CANCELLED' }
              }
            }
          }
        }
      }
    })

    let correctedCount = 0
    for (const classItem of updatedClasses) {
      const actualCount = classItem._count.bookings
      const storedCount = classItem.currentStudents
      const status = actualCount === storedCount ? '✅' : '❌'
      
      if (status === '✅') {
        correctedCount++
      }
      
      console.log(`  ${status} ${classItem.name}: ${storedCount} estudiantes`)
    }

    console.log(`\n✅ Sincronización completada: ${correctedCount}/${updatedClasses.length} clases con contadores correctos`)

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar script si se llama directamente
if (require.main === module) {
  main().catch(console.error)
}

export { main as syncClassCounters }