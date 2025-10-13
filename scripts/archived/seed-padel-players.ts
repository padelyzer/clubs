import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Padel categories for seeding
const padelCategories = [
  'M_OPEN', 'M_1F', 'M_2F', 'M_3F', 'M_4F', 'M_5F', 'M_6F',
  'F_OPEN', 'F_1F', 'F_2F', 'F_3F', 'F_4F', 'F_5F', 'F_6F',
  'MX_A', 'MX_B', 'MX_C', 'MX_OPEN'
]

// Sample player names (20 new players)
const newPlayersData = [
  // Masculino
  { name: 'Diego Martínez', email: 'diego.martinez@email.com', phone: '+52 555 0101', gender: 'male', level: 'M_1F' },
  { name: 'Fernando López', email: 'fernando.lopez@email.com', phone: '+52 555 0102', gender: 'male', level: 'M_2F' },
  { name: 'Alejandro García', email: 'alejandro.garcia@email.com', phone: '+52 555 0103', gender: 'male', level: 'M_3F' },
  { name: 'Ricardo Hernández', email: 'ricardo.hernandez@email.com', phone: '+52 555 0104', gender: 'male', level: 'M_4F' },
  { name: 'Eduardo Ruiz', email: 'eduardo.ruiz@email.com', phone: '+52 555 0105', gender: 'male', level: 'M_5F' },
  { name: 'Miguel Torres', email: 'miguel.torres@email.com', phone: '+52 555 0106', gender: 'male', level: 'M_6F' },
  { name: 'Daniel Morales', email: 'daniel.morales@email.com', phone: '+52 555 0107', gender: 'male', level: 'M_OPEN' },
  
  // Femenino
  { name: 'Isabella Santos', email: 'isabella.santos@email.com', phone: '+52 555 0201', gender: 'female', level: 'F_1F' },
  { name: 'Valentina Díaz', email: 'valentina.diaz@email.com', phone: '+52 555 0202', gender: 'female', level: 'F_2F' },
  { name: 'Camila Vega', email: 'camila.vega@email.com', phone: '+52 555 0203', gender: 'female', level: 'F_3F' },
  { name: 'Sofía Mendoza', email: 'sofia.mendoza@email.com', phone: '+52 555 0204', gender: 'female', level: 'F_4F' },
  { name: 'Natalia Castro', email: 'natalia.castro@email.com', phone: '+52 555 0205', gender: 'female', level: 'F_5F' },
  { name: 'Andrea Flores', email: 'andrea.flores@email.com', phone: '+52 555 0206', gender: 'female', level: 'F_6F' },
  { name: 'Paola Jiménez', email: 'paola.jimenez@email.com', phone: '+52 555 0207', gender: 'female', level: 'F_OPEN' },
  
  // Mixto (some players that can play mixed)
  { name: 'Roberto Salinas', email: 'roberto.salinas@email.com', phone: '+52 555 0301', gender: 'male', level: 'MX_A' },
  { name: 'Carolina Paz', email: 'carolina.paz@email.com', phone: '+52 555 0302', gender: 'female', level: 'MX_A' },
  { name: 'Javier Núñez', email: 'javier.nunez@email.com', phone: '+52 555 0303', gender: 'male', level: 'MX_B' },
  { name: 'Lucía Ramírez', email: 'lucia.ramirez@email.com', phone: '+52 555 0304', gender: 'female', level: 'MX_B' },
  { name: 'Pablo Ortiz', email: 'pablo.ortiz@email.com', phone: '+52 555 0305', gender: 'male', level: 'MX_C' },
  { name: 'Mónica Silva', email: 'monica.silva@email.com', phone: '+52 555 0306', gender: 'female', level: 'MX_C' }
]

// Existing player updates with categories
const existingPlayerUpdates = [
  { name: 'Juan Pérez', level: 'M_2F' },
  { name: 'María García', level: 'F_1F' },
  { name: 'Carlos López', level: 'M_3F' },
  { name: 'Ana Martínez', level: 'F_2F' },
  { name: 'Roberto Díaz', level: 'M_1F' },
  { name: 'Laura Hernández', level: 'F_3F' }
]

async function seedPadelPlayers() {
  try {
    console.log('🎾 Starting padel players seeding...')
    
    // Get the first club (assuming there's at least one)
    const firstClub = await prisma.club.findFirst()
    if (!firstClub) {
      throw new Error('No club found. Please create a club first.')
    }
    
    console.log(`📍 Using club: ${firstClub.name}`)
    
    // Update existing players with padel categories
    console.log('📝 Updating existing players with padel categories...')
    for (const update of existingPlayerUpdates) {
      try {
        await prisma.player.updateMany({
          where: {
            name: update.name,
            clubId: firstClub.id
          },
          data: {
            level: update.level
          }
        })
        console.log(`✅ Updated ${update.name} with category ${update.level}`)
      } catch (error) {
        console.log(`⚠️  Could not update ${update.name}: ${error}`)
      }
    }
    
    // Create new players with padel categories
    console.log('👥 Creating 20 new players with diverse padel categories...')
    for (const playerData of newPlayersData) {
      try {
        const player = await prisma.player.create({
          data: {
            clubId: firstClub.id,
            name: playerData.name,
            email: playerData.email,
            phone: playerData.phone,
            gender: playerData.gender,
            level: playerData.level,
            active: true,
            memberSince: new Date(),
            clientNumber: `PAD-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
          }
        })
        
        console.log(`✅ Created ${player.name} - ${player.level}`)
      } catch (error) {
        console.log(`❌ Error creating ${playerData.name}: ${error}`)
      }
    }
    
    // Show summary
    const totalPlayers = await prisma.player.count({
      where: { clubId: firstClub.id }
    })
    
    console.log(`\n🎾 Padel Players Seeding Complete!`)
    console.log(`📊 Total players in club: ${totalPlayers}`)
    
    // Show category distribution
    console.log('\n📈 Category Distribution:')
    for (const category of padelCategories) {
      const count = await prisma.player.count({
        where: {
          clubId: firstClub.id,
          level: category
        }
      })
      if (count > 0) {
        console.log(`   ${category}: ${count} players`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error seeding padel players:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
seedPadelPlayers()