#!/usr/bin/env node
import { backupDatabase } from './backup-database'
import { exec } from 'child_process'
import { promisify } from 'util'
import { confirm } from '@inquirer/prompts'

const execAsync = promisify(exec)

async function safeResetDatabase() {
  console.log('🔒 RESET SEGURO DE BASE DE DATOS')
  console.log('=' .repeat(80))
  
  try {
    // Advertencia
    console.log('\n⚠️  ADVERTENCIA: Esto reiniciará completamente la base de datos!')
    console.log('   Pero primero se creará un backup automático de todos los datos.')
    
    const shouldContinue = await confirm({
      message: '¿Deseas continuar con el reset?',
      default: false
    })
    
    if (!shouldContinue) {
      console.log('❌ Reset cancelado')
      return
    }
    
    // Crear backup automático
    console.log('\n📦 Creando backup automático antes del reset...')
    const backupFile = await backupDatabase()
    console.log(`✅ Backup creado: ${backupFile}`)
    
    // Confirmar el reset después del backup
    console.log('\n🔄 El backup está listo. Ahora procederemos con el reset.')
    const confirmReset = await confirm({
      message: '¿Confirmar reset de la base de datos?',
      default: false
    })
    
    if (!confirmReset) {
      console.log('❌ Reset cancelado después del backup')
      console.log('💡 Tu backup está seguro en:', backupFile)
      return
    }
    
    // Ejecutar reset de Prisma
    console.log('\n🗑️  Ejecutando reset de la base de datos...')
    const { stdout, stderr } = await execAsync('npx prisma migrate reset --force')
    
    if (stdout) console.log(stdout)
    if (stderr) console.error(stderr)
    
    console.log('\n' + '=' .repeat(80))
    console.log('✅ RESET COMPLETADO')
    console.log('=' .repeat(80))
    console.log('📦 Backup guardado en:', backupFile)
    console.log('\n💡 Para restaurar los datos, ejecuta:')
    console.log(`   npm run db:restore ${backupFile.split('/').pop()}`)
    console.log('\n🌱 Para cargar datos de prueba frescos, ejecuta:')
    console.log('   npm run seed')
    console.log('=' .repeat(80))
    
  } catch (error) {
    console.error('❌ Error durante el reset:', error)
    process.exit(1)
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  safeResetDatabase()
}