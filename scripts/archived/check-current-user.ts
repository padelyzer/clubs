import { prisma } from './lib/config/prisma'

async function checkCurrentUser() {
  try {
    // Buscar el usuario que creamos
    const user = await prisma.user.findFirst({
      where: {
        email: 'admin1758064682301@wizard.com'
      },
      include: {
        Club: true
      }
    })

    console.log('Usuario encontrado:', {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      clubId: user?.clubId,
      club: user?.Club
    })

    // Ver todos los usuarios del club
    if (user?.clubId) {
      const clubUsers = await prisma.user.findMany({
        where: {
          clubId: user.clubId
        }
      })

      console.log('\nUsuarios del club:')
      clubUsers.forEach(u => {
        console.log(`- ${u.name} (${u.email}) - Role: ${u.role}`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCurrentUser()