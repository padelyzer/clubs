import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tournaments = await prisma.tournament.findMany({
    select: {
      name: true,
      type: true,
      status: true,
      category: true,
      _count: {
        select: {
          registrations: true,
          matches: true
        }
      }
    }
  })
  
  console.log('Torneos creados:')
  tournaments.forEach(t => {
    console.log(`- ${t.name}`)
    console.log(`  Tipo: ${t.type}`)
    console.log(`  Estado: ${t.status}`)
    console.log(`  Categoría: ${t.category}`)
    console.log(`  Inscripciones: ${t._count.registrations}`)
    console.log(`  Partidos: ${t._count.matches}`)
    console.log('')
  })
  
  await prisma.$disconnect()
}

main()