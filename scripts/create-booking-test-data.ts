import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const testPlayers = [
  { name: 'Carlos Mendez', email: 'carlos@test.com', phone: '5551001001' },
  { name: 'Ana Torres', email: 'ana@test.com', phone: '5551002002' },
  { name: 'Luis García', email: 'luis@test.com', phone: '5551003003' },
  { name: 'María López', email: 'maria@test.com', phone: '5551004004' },
  { name: 'Jorge Ruiz', email: 'jorge@test.com', phone: '5551005005' },
  { name: 'Sofia Díaz', email: 'sofia@test.com', phone: '5551006006' },
  { name: 'Pedro Vega', email: 'pedro@test.com', phone: '5551007007' },
  { name: 'Laura Cruz', email: 'laura@test.com', phone: '5551008008' },
  { name: 'Diego Flores', email: 'diego@test.com', phone: '5551009009' },
  { name: 'Carmen Silva', email: 'carmen@test.com', phone: '5551010010' }
]

async function createTestData() {
  console.log('🎾 Creando datos de prueba para reservas...')
  
  // Get the club
  const club = await prisma.club.findFirst()
  if (!club) {
    console.error('❌ No se encontró ningún club')
    return
  }
  
  // Create players
  console.log('\n👥 Creando jugadores de prueba...')
  for (const playerData of testPlayers) {
    try {
      // First try to find existing player
      let player = await prisma.player.findFirst({
        where: { 
          clubId: club.id,
          phone: playerData.phone
        }
      })
      
      if (!player) {
        // Create new player
        player = await prisma.player.create({
          data: {
            clubId: club.id,
            name: playerData.name,
            email: playerData.email,
            phone: playerData.phone,
            active: true
          }
        })
        console.log(`  ✅ ${player.name} (nuevo)`)
      } else {
        // Update existing player
        player = await prisma.player.update({
          where: { id: player.id },
          data: {
            name: playerData.name,
            email: playerData.email,
            active: true
          }
        })
        console.log(`  ✅ ${player.name} (actualizado)`)
      }
    } catch (error: any) {
      console.error(`  ❌ Error con ${playerData.name}:`, error.message)
    }
  }
  
  // Verify courts exist
  const courts = await prisma.court.findMany({
    where: { clubId: club.id }
  })
  
  console.log(`\n🏟️ Canchas disponibles: ${courts.length}`)
  courts.forEach(court => {
    console.log(`  - ${court.name} (ID: ${court.id})`)
  })
  
  // Create pricing if needed
  const pricing = await prisma.pricing.findFirst({
    where: { clubId: club.id }
  })
  
  if (!pricing) {
    console.log('\n💰 Creando configuración de precios...')
    await prisma.pricing.create({
      data: {
        clubId: club.id,
        basePrice: 40000, // $400 MXN en centavos
        peakPrice: 60000, // $600 MXN
        weekendPrice: 50000, // $500 MXN
        currency: 'MXN'
      }
    })
    console.log('  ✅ Precios configurados')
  }
  
  console.log('\n✨ Datos de prueba creados exitosamente')
}

createTestData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())