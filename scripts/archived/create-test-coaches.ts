import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestCoaches() {
  console.log('🎾 Creando coaches de prueba...')
  
  // Get the club ID
  const club = await prisma.club.findFirst()
  if (!club) {
    console.error('❌ No se encontró ningún club')
    return
  }
  
  // Coach 1: Pago por hora
  try {
    const coach1 = await prisma.classInstructor.create({
      data: {
        clubId: club.id,
        name: 'Carlos Mendoza',
        email: 'carlos@padel.com',
        phone: '5551234567',
        specialties: ['Padel', 'Tenis'],
        paymentType: 'HOURLY',
        hourlyRate: 25000, // $250 MXN en centavos
        monthlyRate: 0,
        active: true
      }
    })
    console.log(`✅ Coach creado: ${coach1.name} (Pago por hora: $${coach1.hourlyRate/100} MXN/hr)`)
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️  Coach Carlos Mendoza ya existe')
    } else {
      console.error('❌ Error creando Carlos Mendoza:', error.message)
    }
  }
  
  // Coach 2: Pago mensual
  try {
    const coach2 = await prisma.classInstructor.create({
      data: {
        clubId: club.id,
        name: 'Ana García',
        email: 'ana@padel.com',
        phone: '5559876543',
        specialties: ['Padel'],
        paymentType: 'MONTHLY',
        hourlyRate: 0,
        monthlyRate: 1500000, // $15,000 MXN en centavos
        active: true
      }
    })
    console.log(`✅ Coach creado: ${coach2.name} (Pago mensual: $${coach2.monthlyRate/100} MXN/mes)`)
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('⚠️  Coach Ana García ya existe')
    } else {
      console.error('❌ Error creando Ana García:', error.message)
    }
  }
  
  console.log('✨ Coaches de prueba creados exitosamente')
}

createTestCoaches()
  .catch(console.error)
  .finally(() => prisma.$disconnect())