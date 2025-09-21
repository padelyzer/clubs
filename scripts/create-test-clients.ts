import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const testClients = [
  { name: 'Pedro López', email: 'pedro.lopez@gmail.com', phone: '5551234001' },
  { name: 'María Sánchez', email: 'maria.sanchez@gmail.com', phone: '5551234002' },
  { name: 'Juan Pérez', email: 'juan.perez@gmail.com', phone: '5551234003' },
  { name: 'Laura Torres', email: 'laura.torres@gmail.com', phone: '5551234004' },
  { name: 'Carlos Ramírez', email: 'carlos.ramirez@gmail.com', phone: '5551234005' },
  { name: 'Ana Martínez', email: 'ana.martinez@gmail.com', phone: '5551234006' },
  { name: 'Roberto García', email: 'roberto.garcia@gmail.com', phone: '5551234007' },
  { name: 'Sofia Hernández', email: 'sofia.hernandez@gmail.com', phone: '5551234008' },
  { name: 'Diego Flores', email: 'diego.flores@gmail.com', phone: '5551234009' },
  { name: 'Valentina Cruz', email: 'valentina.cruz@gmail.com', phone: '5551234010' },
  { name: 'Miguel Ángel Díaz', email: 'miguel.diaz@gmail.com', phone: '5551234011' },
  { name: 'Fernanda Morales', email: 'fernanda.morales@gmail.com', phone: '5551234012' },
  { name: 'Alejandro Ruiz', email: 'alejandro.ruiz@gmail.com', phone: '5551234013' },
  { name: 'Isabella Vega', email: 'isabella.vega@gmail.com', phone: '5551234014' },
  { name: 'Luis Mendoza', email: 'luis.mendoza@gmail.com', phone: '5551234015' }
]

async function createTestClients() {
  console.log('🚀 Creando clientes de prueba...')
  
  // Get the club ID
  const club = await prisma.club.findFirst()
  if (!club) {
    console.error('❌ No se encontró ningún club')
    return
  }
  
  for (const clientData of testClients) {
    try {
      const player = await prisma.player.create({
        data: {
          clubId: club.id,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          active: true
        }
      })
      console.log(`✅ Cliente creado: ${player.name}`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Cliente ya existe: ${clientData.name}`)
      } else {
        console.error(`❌ Error creando ${clientData.name}:`, error.message)
      }
    }
  }
  
  console.log('✨ Clientes de prueba creados exitosamente')
}

createTestClients()
  .catch(console.error)
  .finally(() => prisma.$disconnect())