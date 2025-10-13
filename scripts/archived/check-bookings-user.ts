import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Find users with bookings
  const bookings = await prisma.booking.findMany({
    include: {
      Court: true
    },
    take: 5
  })

  console.log('📅 Reservas encontradas:')
  if (bookings.length === 0) {
    console.log('No hay reservas en el sistema')
  } else {
    bookings.forEach(b => {
      console.log(`- ${b.playerName} (${b.playerEmail || 'Sin email'}) - Cancha: ${b.Court.name} - Fecha: ${b.date.toLocaleDateString()}`)
    })
  }
  
  // Find all users
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true
    }
  })
  
  console.log('\n👥 Usuarios en el sistema:')
  users.forEach(u => {
    console.log(`- ${u.name} (${u.email}) - Rol: ${u.role}`)
  })
  
  console.log('\n🔑 Credenciales de acceso:')
  console.log('Email: admin@padelyzer.com')
  console.log('Password: admin123')
  
  await prisma.$disconnect()
}

main()
