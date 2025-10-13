import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkClubs() {
  try {
    // Contar clubs
    const clubCount = await prisma.club.count()
    console.log(`\n📊 Total de clubs en la base de datos: ${clubCount}`)
    
    // Obtener todos los clubs
    const clubs = await prisma.club.findMany({
      include: {
        _count: {
          select: {
            User: true,
            Court: true,
            Booking: true
          }
        }
      }
    })
    
    if (clubs.length > 0) {
      console.log('\n🏢 Clubs encontrados:')
      clubs.forEach(club => {
        console.log(`\n  ID: ${club.id}`)
        console.log(`  Nombre: ${club.name}`)
        console.log(`  Estado: ${club.status}`)
        console.log(`  Activo: ${club.active}`)
        console.log(`  Ciudad: ${club.city}`)
        console.log(`  Email: ${club.email}`)
        console.log(`  Usuarios: ${club._count.User}`)
        console.log(`  Canchas: ${club._count.Court}`)
        console.log(`  Reservas: ${club._count.Booking}`)
      })
    } else {
      console.log('\n⚠️  No se encontraron clubs en la base de datos')
    }
    
    // Verificar usuarios
    const userCount = await prisma.user.count()
    console.log(`\n👥 Total de usuarios: ${userCount}`)
    
    // Verificar super admins
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' }
    })
    console.log(`\n🔐 Super Admins: ${superAdmins.length}`)
    superAdmins.forEach(admin => {
      console.log(`  - ${admin.email} (${admin.name})`)
    })
    
  } catch (error) {
    console.error('Error al verificar clubs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClubs()