const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Buscando usuarios en la base de datos...\n')
  
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'admin' } },
        { email: { contains: 'padelyzer' } },
        { email: { contains: 'test' } }
      ]
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      clubId: true,
      active: true
    }
  })
  
  if (users.length > 0) {
    console.log('Usuarios encontrados:')
    console.log('=' .repeat(80))
    users.forEach(user => {
      console.log(`Email: ${user.email}`)
      console.log(`Nombre: ${user.name || 'Sin nombre'}`)
      console.log(`Rol: ${user.role}`)
      console.log(`Club ID: ${user.clubId || 'Sin club'}`)
      console.log(`Activo: ${user.active ? 'Sí' : 'No'}`)
      console.log('-'.repeat(80))
    })
    console.log(`\nTotal: ${users.length} usuarios encontrados`)
    
    // Nota sobre contraseñas
    console.log('\nNOTA: Las contraseñas están encriptadas. Las contraseñas por defecto suelen ser:')
    console.log('- Para admin@padelyzer.com: "admin123" o "password123"')
    console.log('- Para usuarios de prueba: "test123" o "password"')
  } else {
    console.log('No se encontraron usuarios con esos criterios.')
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })