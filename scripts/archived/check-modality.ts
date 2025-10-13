import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function checkModality() {
  const registrations = await prisma.tournamentRegistration.findMany({
    take: 5,
    select: {
      category: true,
      modality: true,
      teamName: true
    }
  })
  
  console.log('Sample registrations:')
  registrations.forEach(reg => {
    console.log(`- ${reg.teamName}: category=${reg.category}, modality=${reg.modality}`)
  })
  
  // Count by modality
  const counts = await prisma.tournamentRegistration.groupBy({
    by: ['modality'],
    _count: true
  })
  
  console.log('\nModality counts:')
  counts.forEach(c => {
    console.log(`- modality="${c.modality}": ${c._count} teams`)
  })
}

checkModality().finally(() => prisma.$disconnect())