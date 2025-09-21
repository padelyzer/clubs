const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  try {
    // Verificar usuarios existentes
    console.log('🔍 Verificando usuarios existentes...')
    const users = await prisma.user.findMany({
      include: {
        club: true
      }
    })

    console.log(`📊 Usuarios encontrados: ${users.length}`)
    
    if (users.length > 0) {
      console.log('\n👥 Usuarios existentes:')
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - Club: ${user.club?.name || 'Sin club'}`)
      })
    }

    // Crear usuario de prueba si no existe admin
    const adminUser = users.find(user => user.role === 'SUPER_ADMIN')
    
    if (!adminUser) {
      console.log('\n🔧 Creando usuario Super Admin de prueba...')
      
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@padelyzer.com',
          name: 'Super Admin',
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          active: true,
        }
      })
      
      console.log('✅ Usuario Super Admin creado:')
      console.log(`   Email: ${newAdmin.email}`)
      console.log(`   Contraseña: admin123`)
      console.log(`   Rol: ${newAdmin.role}`)
    }

    // Crear club y usuario de club de prueba si no existe
    const clubUser = users.find(user => user.role === 'CLUB_OWNER')
    
    if (!clubUser) {
      console.log('\n🏢 Creando club de prueba...')
      
      const testClub = await prisma.club.create({
        data: {
          name: 'Club Padelyzer Demo',
          slug: 'club-demo',
          email: 'club@padelyzer.com',
          phone: '+52 222 123 4567',
          address: 'Av. Juárez 123',
          city: 'Puebla',
          state: 'Puebla',
          country: 'Mexico',
          postalCode: '72000',
          description: 'Club de prueba para Padelyzer',
          status: 'APPROVED',
          active: true,
        }
      })
      
      console.log(`✅ Club creado: ${testClub.name}`)
      
      const hashedPassword = await bcrypt.hash('club123', 10)
      
      const newClubOwner = await prisma.user.create({
        data: {
          email: 'club@padelyzer.com',
          name: 'Dueño del Club Demo',
          password: hashedPassword,
          role: 'CLUB_OWNER',
          clubId: testClub.id,
          active: true,
        }
      })
      
      console.log('✅ Usuario Club Owner creado:')
      console.log(`   Email: ${newClubOwner.email}`)
      console.log(`   Contraseña: club123`)
      console.log(`   Rol: ${newClubOwner.role}`)
      console.log(`   Club: ${testClub.name}`)
      
      // Crear canchas para el club
      await prisma.court.createMany({
        data: [
          {
            clubId: testClub.id,
            name: 'Cancha 1',
            type: 'PADEL',
            indoor: false,
            order: 1,
            active: true,
          },
          {
            clubId: testClub.id,
            name: 'Cancha 2',
            type: 'PADEL',
            indoor: true,
            order: 2,
            active: true,
          }
        ]
      })
      
      console.log('✅ Canchas creadas para el club demo')
    }

    console.log('\n🎉 Configuración completada!')
    console.log('\n📋 Credenciales disponibles:')
    console.log('   👑 Super Admin: admin@padelyzer.com / admin123')
    console.log('   🏢 Club Owner: club@padelyzer.com / club123')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()