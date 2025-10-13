import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testScheduleConflict() {
  const club = await prisma.club.findFirst()
  const court = await prisma.court.findFirst({ where: { clubId: club!.id }})
  const instructor = await prisma.classInstructor.findFirst()
  
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  try {
    // Intentar crear clase en mismo horario que Clase Individual (10:00-11:30)
    const conflictClass = await prisma.class.create({
      data: {
        clubId: club!.id,
        instructorId: instructor!.id,
        name: 'Clase Conflictiva',
        type: 'GROUP',
        level: 'BEGINNER',
        status: 'SCHEDULED',
        date: tomorrow,
        startTime: '10:30',  // Conflicto! Se superpone con 10:00-11:30
        endTime: '12:00',
        duration: 90,
        courtId: court!.id,
        maxStudents: 4,
        currentStudents: 0,
        price: 50000,
        currency: 'MXN'
      }
    })
    console.log('❌ ERROR: Permitió crear clase con horario conflictivo!')
  } catch (error: any) {
    console.log('✅ Correcto: No permitió conflicto de horario')
    console.log('   Mensaje:', error.message)
  }
}

testScheduleConflict()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
