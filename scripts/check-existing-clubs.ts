import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function checkExistingClubs() {
  console.log('🏢 CLUBES EXISTENTES EN LA BASE DE DATOS')
  console.log('======================================\n')

  const clubs = await prisma.club.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: {
          Court: true,
          User: true,
          Booking: true
        }
      }
    }
  })

  console.log(`📊 Total de clubes encontrados: ${clubs.length}\n`)

  clubs.forEach((club, index) => {
    console.log(`${index + 1}. ${club.name}`)
    console.log(`   ID: ${club.id}`)
    console.log(`   Email: ${club.email}`)
    console.log(`   Teléfono: ${club.phone || 'No registrado'}`)
    console.log(`   Ciudad: ${club.city || 'No registrado'}`)
    console.log(`   Estado: ${club.state || 'No registrado'}`)
    console.log(`   Status: ${club.status}`)
    console.log(`   Canchas: ${club._count.Court}`)
    console.log(`   Usuarios: ${club._count.User}`)
    console.log(`   Reservas: ${club._count.Booking}`)
    console.log(`   Creado: ${club.createdAt}`)
    console.log('   ---')
  })

  // Verificar los clubes específicos que aparecen en la imagen
  const clubsFromImage = [
    'Padel Premium Test Club',
    'Club Test Aislamiento',
    'Club Basic5',
    'Club Padel Puebla'
  ]

  console.log('\n🔍 VERIFICACIÓN DE CLUBES DE LA IMAGEN:')
  console.log('======================================')

  for (const clubName of clubsFromImage) {
    const found = clubs.find(club =>
      club.name.toLowerCase().includes(clubName.toLowerCase()) ||
      clubName.toLowerCase().includes(club.name.toLowerCase())
    )

    if (found) {
      console.log(`✅ "${clubName}" → ENCONTRADO como "${found.name}"`)
    } else {
      console.log(`❌ "${clubName}" → NO ENCONTRADO`)
    }
  }

  await prisma.$disconnect()
}

checkExistingClubs().catch(console.error)