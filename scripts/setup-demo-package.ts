import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📦 Creando paquete completo para clubs demo...')
  
  // 1. Crear o encontrar paquete 'Todo Incluido'
  let packageRecord = await prisma.saasPackage.findFirst({
    where: { name: 'todo-incluido' }
  })
  
  if (!packageRecord) {
    packageRecord = await prisma.saasPackage.create({
      data: {
        name: 'todo-incluido',
        displayName: 'Todo Incluido - Demo',
        description: 'Paquete completo con todos los módulos habilitados para testing',
        isActive: true,
        isDefault: true,
        basePrice: 0, // Gratis para demo
        currency: 'MXN',
        sortOrder: 1
      }
    })
    console.log('✅ Paquete creado:', packageRecord.name)
  } else {
    console.log('📋 Paquete existente:', packageRecord.name)
  }
  
  // 2. Obtener todos los módulos disponibles
  const modules = await prisma.saasModule.findMany({
    where: { isActive: true }
  })
  
  console.log('📋 Módulos disponibles:', modules.map(m => m.code))
  
  // 3. Asociar el paquete al club demo
  const clubPackage = await prisma.clubPackage.upsert({
    where: { clubId: 'club-demo-001' },
    update: {
      packageId: packageRecord.id,
      isActive: true,
      notes: 'Paquete demo actualizado automaticamente'
    },
    create: {
      clubId: 'club-demo-001',
      packageId: packageRecord.id,
      isActive: true,
      notes: 'Paquete demo para testing completo'
    }
  })
  
  console.log('✅ Club asociado al paquete:', clubPackage.id)
  
  // 4. Verificar resultado
  const result = await prisma.club.findFirst({
    where: { id: 'club-demo-001' },
    include: {
      clubPackage: {
        include: { package: true }
      },
      clubModules: {
        include: { module: true }
      }
    }
  })
  
  console.log('📋 Configuración final:')
  console.log('- Paquete:', result?.clubPackage?.package?.displayName)
  console.log('- Módulos habilitados:', result?.clubModules?.map(cm => cm.module.code))
  
  await prisma.$disconnect()
}

main().catch(console.error)