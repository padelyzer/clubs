import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tournaments = await prisma.tournament.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      status: true
    }
  })
  
  console.log('🌐 URLs de los Torneos:\n')
  console.log('Dashboard (requiere login):')
  console.log('http://localhost:3000/dashboard/tournaments\n')
  
  console.log('Vistas públicas de cada torneo:')
  tournaments.forEach(t => {
    // Generar el slug basado en el ID (ya que no tenemos campo slug)
    console.log(`\n${t.name}:`)
    console.log(`http://localhost:3000/tournament/${t.id}`)
    console.log(`Estado: ${t.status}`)
  })
  
  console.log('\n📝 Credenciales de login:')
  console.log('Email: admin@padelyzer.com')
  console.log('Password: admin123')
  
  await prisma.$disconnect()
}

main()