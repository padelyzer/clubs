import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import { confirm } from '@inquirer/prompts'

const prisma = new PrismaClient()

async function restoreDatabase(backupFilename?: string) {
  console.log('🔄 RESTAURACIÓN DE BASE DE DATOS')
  console.log('=' .repeat(80))
  
  try {
    const backupDir = path.join(process.cwd(), 'backups')
    
    // Si no se especifica archivo, listar disponibles
    if (!backupFilename) {
      try {
        const metaFile = path.join(backupDir, 'backup-metadata.json')
        const metaData = JSON.parse(await fs.readFile(metaFile, 'utf-8'))
        
        if (metaData.backups.length === 0) {
          console.log('❌ No hay backups disponibles')
          return
        }
        
        console.log('📋 Backups disponibles:\n')
        metaData.backups.forEach((backup: any, index: number) => {
          console.log(`${index + 1}. ${backup.filename}`)
          console.log(`   Fecha: ${new Date(backup.timestamp).toLocaleString()}`)
          console.log(`   Tamaño: ${backup.size}`)
          console.log(`   Registros: ${backup.totalRecords}`)
          console.log('')
        })
        
        console.log('💡 Usa: npm run db:restore <nombre-archivo>')
        console.log('   Ejemplo: npm run db:restore backup-2025-08-26T18-30-00.json')
        return
      } catch (e) {
        console.log('❌ No se encontraron backups. Ejecuta primero: npm run db:backup')
        return
      }
    }
    
    // Cargar backup
    const backupFile = path.join(backupDir, backupFilename)
    console.log(`📂 Cargando backup: ${backupFilename}`)
    
    const backupData = JSON.parse(await fs.readFile(backupFile, 'utf-8'))
    
    // Mostrar información del backup
    console.log('\n📊 Información del backup:')
    console.log(`   Fecha: ${new Date(backupData.timestamp).toLocaleString()}`)
    console.log(`   Total registros: ${Object.values(backupData.counts).reduce((a: any, b: any) => a + b, 0)}`)
    
    // Confirmar restauración
    console.log('\n⚠️  ADVERTENCIA: Esto eliminará TODOS los datos actuales!')
    const shouldContinue = await confirm({
      message: '¿Deseas continuar con la restauración?',
      default: false
    })
    
    if (!shouldContinue) {
      console.log('❌ Restauración cancelada')
      return
    }
    
    console.log('\n🗑️  Eliminando datos actuales...')
    
    // Eliminar en orden correcto (respetando foreign keys)
    await prisma.$transaction([
      // Primero las tablas dependientes
      prisma.payrollPayment.deleteMany(),
      prisma.payrollRecord.deleteMany(),
      prisma.classEnrollment.deleteMany(),
      prisma.class.deleteMany(),
      prisma.coach.deleteMany(),
      prisma.splitPaymentParticipant.deleteMany(),
      prisma.splitPayment.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.budgetCategory.deleteMany(),
      prisma.budget.deleteMany(),
      prisma.expense.deleteMany(),
      prisma.transaction.deleteMany(),
      prisma.tournamentPayment.deleteMany(),
      prisma.tournamentMatch.deleteMany(),
      prisma.tournamentRegistration.deleteMany(),
      prisma.tournament.deleteMany(),
      prisma.bookingPayment.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.bookingGroup.deleteMany(),
      prisma.court.deleteMany(),
      prisma.player.deleteMany(),
      prisma.stripeAccount.deleteMany(),
      prisma.user.deleteMany(),
      prisma.club.deleteMany(),
    ])
    
    console.log('✅ Datos actuales eliminados')
    console.log('\n📥 Restaurando datos del backup...')
    
    // Restaurar en orden correcto (respetando foreign keys)
    const restoreOrder = [
      'clubs',
      'users',
      'stripeAccounts',
      'players',
      'courts',
      'bookingGroups',
      'bookings',
      'bookingPayments',
      'tournaments',
      'tournamentRegistrations',
      'tournamentMatches',
      'tournamentPayments',
      'transactions',
      'expenses',
      'budget',
      'budgetCategory',
      'notifications',
      'splitPayments',
      'splitPaymentParticipants',
      'coaches',
      'classes',
      'classEnrollments',
      'payrollRecords',
      'payrollPayments',
    ]
    
    for (const tableName of restoreOrder) {
      const data = backupData.tables[tableName]
      if (data && data.length > 0) {
        console.log(`   Restaurando ${tableName}: ${data.length} registros...`)
        
        // Mapeo de nombres de tabla a modelos de Prisma
        const modelMap: any = {
          clubs: prisma.club,
          users: prisma.user,
          players: prisma.player,
          courts: prisma.court,
          bookings: prisma.booking,
          bookingGroups: prisma.bookingGroup,
          bookingPayments: prisma.bookingPayment,
          tournaments: prisma.tournament,
          tournamentRegistrations: prisma.tournamentRegistration,
          tournamentMatches: prisma.tournamentMatch,
          tournamentPayments: prisma.tournamentPayment,
          transactions: prisma.transaction,
          expenses: prisma.expense,
          budget: prisma.budget,
          budgetCategory: prisma.budgetCategory,
          notifications: prisma.notification,
          stripeAccounts: prisma.stripeAccount,
          splitPayments: prisma.splitPayment,
          splitPaymentParticipants: prisma.splitPaymentParticipant,
          coaches: prisma.coach,
          classes: prisma.class,
          classEnrollments: prisma.classEnrollment,
          payrollRecords: prisma.payrollRecord,
          payrollPayments: prisma.payrollPayment,
        }
        
        const model = modelMap[tableName]
        if (model) {
          // Convertir fechas de string a Date objects
          const processedData = data.map((record: any) => {
            const processed = { ...record }
            // Campos comunes de fecha
            const dateFields = ['createdAt', 'updatedAt', 'date', 'startDate', 'endDate', 
                              'registrationStart', 'registrationEnd', 'scheduledAt', 
                              'dueDate', 'paidAt', 'period']
            
            dateFields.forEach(field => {
              if (processed[field]) {
                processed[field] = new Date(processed[field])
              }
            })
            
            return processed
          })
          
          await model.createMany({
            data: processedData,
            skipDuplicates: true
          })
        }
      }
    }
    
    // Verificación final
    const finalCounts = {
      clubs: await prisma.club.count(),
      users: await prisma.user.count(),
      players: await prisma.player.count(),
      bookings: await prisma.booking.count(),
      tournaments: await prisma.tournament.count(),
      transactions: await prisma.transaction.count(),
    }
    
    console.log('\n' + '=' .repeat(80))
    console.log('✅ RESTAURACIÓN COMPLETADA EXITOSAMENTE!')
    console.log('=' .repeat(80))
    console.log('📊 Datos restaurados:')
    Object.entries(finalCounts).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`   • ${table}: ${count} registros`)
      }
    })
    console.log('=' .repeat(80))
    
  } catch (error) {
    console.error('❌ Error restaurando backup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  const filename = process.argv[2]
  restoreDatabase(filename)
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

export { restoreDatabase }