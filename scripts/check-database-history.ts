import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 ANALIZANDO HISTORIAL DE LA BASE DE DATOS:')
  console.log('=' .repeat(80))
  
  // Verificar migraciones aplicadas
  try {
    const migrations = await prisma.$queryRaw`
      SELECT migration_name, started_at, finished_at 
      FROM _prisma_migrations 
      ORDER BY started_at DESC 
      LIMIT 10
    ` as any[]
    
    console.log('\n📋 MIGRACIONES APLICADAS (más recientes):')
    migrations.forEach(m => {
      console.log(`   - ${m.migration_name}`)
      console.log(`     Aplicada: ${m.finished_at}`)
    })
  } catch (e) {
    console.log('\n⚠️ No se pudo acceder al historial de migraciones')
  }
  
  // Contar registros por tabla
  const tables = [
    { name: 'User', count: await prisma.user.count() },
    { name: 'Club', count: await prisma.club.count() },
    { name: 'Player', count: await prisma.player.count() },
    { name: 'Booking', count: await prisma.booking.count() },
    { name: 'Tournament', count: await prisma.tournament.count() },
    { name: 'Transaction', count: await prisma.transaction.count() },
    { name: 'Court', count: await prisma.court.count() }
  ]
  
  console.log('\n📊 ESTADO ACTUAL DE LA BASE DE DATOS:')
  tables.forEach(t => {
    console.log(`   ${t.name}: ${t.count} registros`)
  })
  
  // Buscar el registro más antiguo de cada tabla principal
  const oldestUser = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } })
  const oldestBooking = await prisma.booking.findFirst({ orderBy: { createdAt: 'asc' } })
  const oldestPlayer = await prisma.player.findFirst({ orderBy: { createdAt: 'asc' } })
  
  console.log('\n⏰ REGISTROS MÁS ANTIGUOS:')
  if (oldestUser) {
    console.log(`   Usuario: ${oldestUser.email} - Creado: ${oldestUser.createdAt}`)
  }
  if (oldestPlayer) {
    console.log(`   Jugador: ${oldestPlayer.name} - Creado: ${oldestPlayer.createdAt}`)
  }
  if (oldestBooking) {
    console.log(`   Reserva: ${oldestBooking.playerName} - Creada: ${oldestBooking.createdAt}`)
  }
  
  await prisma.$disconnect()
}

main()
