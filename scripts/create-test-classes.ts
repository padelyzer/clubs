import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestClasses() {
  console.log('📚 Creando clases de prueba...')
  
  // Get the club and instructors
  const club = await prisma.club.findFirst()
  if (!club) {
    console.error('❌ No se encontró ningún club')
    return
  }
  
  const carlosMendoza = await prisma.classInstructor.findFirst({
    where: { name: 'Carlos Mendoza' }
  })
  
  const anaGarcia = await prisma.classInstructor.findFirst({
    where: { name: 'Ana García' }
  })
  
  const court = await prisma.court.findFirst({
    where: { clubId: club.id }
  })
  
  if (!carlosMendoza || !anaGarcia || !court) {
    console.error('❌ No se encontraron instructores o canchas')
    return
  }
  
  // Get tomorrow's date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  // Clase 1: Individual
  try {
    const class1 = await prisma.class.create({
      data: {
        clubId: club.id,
        instructorId: carlosMendoza.id,
        name: 'Clase Individual Padel',
        description: 'Clase personalizada de padel',
        type: 'INDIVIDUAL',
        level: 'INTERMEDIATE',
        status: 'SCHEDULED',
        date: tomorrow,
        startTime: '10:00',
        endTime: '11:30',
        duration: 90,
        courtId: court.id,
        maxStudents: 1,
        currentStudents: 0,
        price: 80000, // $800 MXN en centavos
        currency: 'MXN'
      }
    })
    console.log(`✅ Clase Individual creada: ${class1.name} - $${class1.price/100} MXN`)
  } catch (error: any) {
    console.error('❌ Error creando clase individual:', error.message)
  }
  
  // Clase 2: Grupal
  try {
    const class2 = await prisma.class.create({
      data: {
        clubId: club.id,
        instructorId: anaGarcia.id,
        name: 'Clase Grupal Padel',
        description: 'Clase grupal para mejorar técnica',
        type: 'GROUP',
        level: 'BEGINNER',
        status: 'SCHEDULED',
        date: tomorrow,
        startTime: '12:00',
        endTime: '13:30',
        duration: 90,
        courtId: court.id,
        maxStudents: 4,
        currentStudents: 0,
        price: 50000, // $500 MXN en centavos por estudiante
        currency: 'MXN'
      }
    })
    console.log(`✅ Clase Grupal creada: ${class2.name} - $${class2.price/100} MXN por estudiante`)
  } catch (error: any) {
    console.error('❌ Error creando clase grupal:', error.message)
  }
  
  // Clase 3: Clínica
  try {
    const class3 = await prisma.class.create({
      data: {
        clubId: club.id,
        instructorId: carlosMendoza.id,
        name: 'Clínica Técnica Padel',
        description: 'Clínica intensiva de técnica avanzada',
        type: 'CLINIC',
        level: 'ADVANCED',
        status: 'SCHEDULED',
        date: tomorrow,
        startTime: '16:00',
        endTime: '18:00',
        duration: 120,
        courtId: court.id,
        maxStudents: 8,
        currentStudents: 0,
        price: 35000, // $350 MXN en centavos por estudiante
        currency: 'MXN'
      }
    })
    console.log(`✅ Clínica creada: ${class3.name} - $${class3.price/100} MXN por estudiante`)
  } catch (error: any) {
    console.error('❌ Error creando clínica:', error.message)
  }
  
  console.log('✨ Clases de prueba creadas exitosamente')
}

createTestClasses()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
