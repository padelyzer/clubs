import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const backupDir = path.join(process.cwd(), 'backups')
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`)
  
  console.log('🔄 INICIANDO BACKUP DE LA BASE DE DATOS...')
  console.log('=' .repeat(80))
  
  try {
    // Crear directorio de backups si no existe
    await fs.mkdir(backupDir, { recursive: true })
    
    // Obtener todos los datos de todas las tablas
    console.log('📊 Extrayendo datos...')
    
    // Obtener datos de las tablas que existen
    const tables: any = {}
    const counts: any = {}
    
    // Lista de tablas y sus modelos correspondientes
    const tableDefinitions = [
      { name: 'clubs', model: prisma.club },
      { name: 'users', model: prisma.user },
      { name: 'players', model: prisma.player },
      { name: 'courts', model: prisma.court },
      { name: 'bookings', model: prisma.booking },
      { name: 'bookingGroups', model: prisma.bookingGroup },
      { name: 'bookingPayments', model: prisma.bookingPayment },
      { name: 'tournaments', model: prisma.tournament },
      { name: 'tournamentRegistrations', model: prisma.tournamentRegistration },
      { name: 'tournamentMatches', model: prisma.tournamentMatch },
      { name: 'tournamentPayments', model: prisma.tournamentPayment },
      { name: 'transactions', model: prisma.transaction },
      { name: 'expenses', model: prisma.expense },
      { name: 'budget', model: prisma.budget },
      { name: 'budgetCategory', model: prisma.budgetCategory },
      { name: 'notifications', model: prisma.notification },
      { name: 'stripeAccounts', model: prisma.stripeAccount },
      { name: 'splitPayments', model: prisma.splitPayment },
      { name: 'splitPaymentParticipants', model: prisma.splitPaymentParticipant },
      { name: 'coaches', model: prisma.coach },
      { name: 'classes', model: prisma.class },
      { name: 'classEnrollments', model: prisma.classEnrollment },
      { name: 'payrollRecords', model: prisma.payrollRecord },
      { name: 'payrollPayments', model: prisma.payrollPayment },
    ]
    
    // Intentar obtener datos de cada tabla
    for (const { name, model } of tableDefinitions) {
      try {
        if (model && typeof model.findMany === 'function') {
          tables[name] = await model.findMany()
          counts[name] = tables[name].length
          console.log(`   ✓ ${name}: ${counts[name]} registros`)
        }
      } catch (e) {
        // Si la tabla no existe, simplemente la omitimos
        console.log(`   - ${name}: no disponible`)
      }
    }
    
    const data = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
      tables,
      counts
    }
    
    // Guardar backup
    console.log(`\n💾 Guardando backup en: ${backupFile}`)
    await fs.writeFile(backupFile, JSON.stringify(data, null, 2))
    
    // Verificar tamaño del archivo
    const stats = await fs.stat(backupFile)
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2)
    
    // Crear archivo de metadatos
    const metaFile = path.join(backupDir, 'backup-metadata.json')
    let metadata = { backups: [] as any[] }
    
    try {
      const existingMeta = await fs.readFile(metaFile, 'utf-8')
      metadata = JSON.parse(existingMeta)
    } catch (e) {
      // Si no existe el archivo de metadata, usar el objeto vacío
    }
    
    metadata.backups.push({
      filename: path.basename(backupFile),
      timestamp: new Date().toISOString(),
      size: `${fileSizeInMB} MB`,
      counts: data.counts,
      totalRecords: Object.values(data.counts).reduce((a, b) => a + b, 0)
    })
    
    // Mantener solo los últimos 10 backups en metadata
    if (metadata.backups.length > 10) {
      metadata.backups = metadata.backups.slice(-10)
    }
    
    await fs.writeFile(metaFile, JSON.stringify(metadata, null, 2))
    
    // Resumen final
    console.log('\n' + '=' .repeat(80))
    console.log('✅ BACKUP COMPLETADO EXITOSAMENTE!')
    console.log('=' .repeat(80))
    console.log(`📁 Archivo: ${path.basename(backupFile)}`)
    console.log(`📊 Tamaño: ${fileSizeInMB} MB`)
    console.log(`🔢 Total de registros: ${Object.values(data.counts).reduce((a, b) => a + b, 0)}`)
    console.log('\n📋 Resumen por tabla:')
    
    const mainTables = ['clubs', 'users', 'players', 'bookings', 'tournaments', 'transactions']
    mainTables.forEach(table => {
      const count = data.counts[table as keyof typeof data.counts]
      if (count > 0) {
        console.log(`   • ${table}: ${count} registros`)
      }
    })
    
    console.log('\n💡 Para restaurar este backup, ejecuta:')
    console.log(`   npm run db:restore ${path.basename(backupFile)}`)
    console.log('=' .repeat(80))
    
    return backupFile
    
  } catch (error) {
    console.error('❌ Error creando backup:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  backupDatabase()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}

export { backupDatabase }