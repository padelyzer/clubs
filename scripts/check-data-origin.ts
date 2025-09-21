import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Verificar las reservas más antiguas y más recientes
  const oldestBooking = await prisma.booking.findFirst({
    orderBy: { createdAt: 'asc' }
  })
  
  const newestBooking = await prisma.booking.findFirst({
    orderBy: { createdAt: 'desc' }
  })
  
  const sampleBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })
  
  console.log('🕐 ORIGEN DE LOS DATOS:')
  console.log('=' .repeat(80))
  
  console.log('\n📅 Reserva más antigua:')
  if (oldestBooking) {
    console.log(`   Creada: ${oldestBooking.createdAt}`)
    console.log(`   Cliente: ${oldestBooking.playerName}`)
    console.log(`   Fecha reserva: ${oldestBooking.date}`)
  }
  
  console.log('\n📅 Reserva más reciente:')
  if (newestBooking) {
    console.log(`   Creada: ${newestBooking.createdAt}`)
    console.log(`   Cliente: ${newestBooking.playerName}`)
    console.log(`   Fecha reserva: ${newestBooking.date}`)
  }
  
  console.log('\n📋 Últimas 5 reservas creadas:')
  sampleBookings.forEach(b => {
    console.log(`   - ${b.playerName} | Creada: ${b.createdAt.toLocaleString()} | Para: ${b.date.toLocaleDateString()}`)
  })
  
  // Verificar usuarios del sistema
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true,
      createdAt: true,
      clubId: true
    },
    orderBy: { createdAt: 'asc' }
  })
  
  console.log('\n👥 USUARIOS DEL SISTEMA (orden de creación):')
  users.forEach(u => {
    console.log(`   - ${u.name} (${u.email}) - ${u.role} - Creado: ${u.createdAt.toLocaleString()}`)
  })
  
  await prisma.$disconnect()
}

main()
