import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabaseStatus() {
  console.log('🔍 Verificando estado de la base de datos...\n')
  
  try {
    // Verificar conexión
    await prisma.$connect()
    console.log('✅ Conexión exitosa a la base de datos')
    
    // Obtener información de la base de datos
    const result = await prisma.$queryRaw`
      SELECT current_database(), current_user, version();
    ` as any[]
    
    console.log('\n📊 Información de la base de datos:')
    console.log('   Database:', result[0].current_database)
    console.log('   Usuario:', result[0].current_user)
    console.log('   Versión:', result[0].version.split(',')[0])
    
    // Verificar si existe la columna description en Club
    try {
      const clubColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'Club' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      ` as any[]
      
      console.log('\n📋 Columnas en la tabla Club:')
      const hasDescription = clubColumns.some(col => col.column_name === 'description')
      
      clubColumns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})${col.is_nullable === 'YES' ? ' - nullable' : ''}`)
      })
      
      if (!hasDescription) {
        console.log('\n⚠️  ADVERTENCIA: La columna "description" NO existe en la tabla Club')
      } else {
        console.log('\n✅ La columna "description" existe en la tabla Club')
      }
    } catch (error) {
      console.error('❌ Error al verificar columnas:', error)
    }
    
    // Verificar migraciones aplicadas
    try {
      const migrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at 
        FROM _prisma_migrations 
        WHERE finished_at IS NOT NULL
        ORDER BY finished_at DESC
        LIMIT 10;
      ` as any[]
      
      console.log('\n🚀 Últimas migraciones aplicadas:')
      if (migrations.length === 0) {
        console.log('   ⚠️  No hay migraciones aplicadas')
      } else {
        migrations.forEach(m => {
          console.log(`   - ${m.migration_name} (${new Date(m.finished_at).toLocaleString()})`)
        })
      }
    } catch (error) {
      console.log('\n⚠️  No se pudo leer el historial de migraciones')
      console.log('   Esto puede indicar que nunca se han ejecutado migraciones')
    }
    
    // Contar registros
    const counts = {
      clubs: await prisma.club.count(),
      users: await prisma.user.count(),
      courts: await prisma.court.count(),
      bookings: await prisma.booking.count()
    }
    
    console.log('\n📈 Conteo de registros:')
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`   - ${table}: ${count}`)
    })
    
  } catch (error) {
    console.error('\n❌ Error al conectar con la base de datos:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

console.log('====================================')
console.log(' VERIFICACIÓN DE BASE DE DATOS')
console.log('====================================\n')
console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^@]+@/, ':****@') || 'No configurada')
console.log('NODE_ENV:', process.env.NODE_ENV || 'development')
console.log('\n')

checkDatabaseStatus().catch(console.error)