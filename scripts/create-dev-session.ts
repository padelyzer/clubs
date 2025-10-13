/**
 * Script para crear una sesión de desarrollo válida
 */

import { prisma } from '../lib/config/prisma'

async function createDevSession() {
  console.log('🔑 Creando sesión de desarrollo...\n')

  // Buscar un usuario del club demo
  const club = await prisma.club.findUnique({
    where: { id: 'club-demo-001' }
  })

  if (!club) {
    console.error('❌ Club demo no encontrado')
    return
  }

  // Buscar o crear usuario de desarrollo
  let user = await prisma.user.findFirst({
    where: {
      email: 'dev@padelyzer.com'
    }
  })

  if (!user) {
    console.log('👤 Creando usuario de desarrollo...')
    user = await prisma.user.create({
      data: {
        id: 'user-dev-001',
        email: 'dev@padelyzer.com',
        emailVerified: new Date(),
        name: 'Dev User',
        role: 'CLUB_OWNER',
        clubId: club.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log(`  ✓ Usuario creado: ${user.email}`)
  } else {
    console.log(`✓ Usuario existente: ${user.email}`)
  }

  // Eliminar sesión mock anterior si existe
  await prisma.session.deleteMany({
    where: { id: 'mock-session-token' }
  })

  // Crear sesión válida
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 días

  const session = await prisma.session.create({
    data: {
      id: 'mock-session-token',
      userId: user.id,
      expiresAt
    }
  })

  console.log(`\n✅ Sesión creada exitosamente`)
  console.log(`   Session ID: ${session.id}`)
  console.log(`   User: ${user.email}`)
  console.log(`   Club: ${club.name}`)
  console.log(`   Expira: ${expiresAt.toLocaleDateString()}`)
  console.log(`\n🍪 Cookie configurada: auth-session=mock-session-token`)
  console.log(`\n🌐 Ahora puedes acceder a:`)
  console.log(`   http://localhost:3000/dashboard/tournaments`)
}

createDevSession()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error('❌ Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
