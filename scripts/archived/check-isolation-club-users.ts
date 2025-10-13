import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function checkIsolationClubUsers() {
  console.log('🔍 VERIFICANDO USUARIOS DE CLUB TEST AISLAMIENTO')
  console.log('===============================================\n')

  const clubId = 'club-test-isolation-001'

  // Buscar usuarios existentes del club
  const users = await prisma.user.findMany({
    where: {
      clubId: clubId
    }
  })

  if (users.length > 0) {
    console.log(`✅ Se encontraron ${users.length} usuarios:\n`)

    for (const user of users) {
      console.log(`Usuario existente:`)
      console.log(`   Nombre: ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Rol: ${user.role}`)
      console.log(`   Activo: ${user.active}`)

      // Actualizar contraseña para asegurar acceso
      const newPassword = 'Test123!'
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          active: true
        }
      })

      console.log(`   🔐 Contraseña actualizada a: ${newPassword}`)
      console.log('   ---')
    }
  } else {
    console.log('❌ No se encontraron usuarios para este club')
    console.log('\n📝 Creando nuevo usuario administrador...\n')

    // Crear un nuevo usuario administrador para el club
    const newPassword = 'Test123!'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    const newUser = await prisma.user.create({
      data: {
        id: nanoid(),
        email: 'admin@isolation.com',
        name: 'Admin Test Isolation',
        password: hashedPassword,
        role: 'CLUB_OWNER',
        clubId: clubId,
        active: true,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Usuario creado exitosamente:')
    console.log(`   Nombre: ${newUser.name}`)
    console.log(`   Email: ${newUser.email}`)
    console.log(`   Contraseña: ${newPassword}`)
    console.log(`   Rol: ${newUser.role}`)
    console.log(`   Club ID: ${newUser.clubId}`)
  }

  // Verificar el club
  const club = await prisma.club.findUnique({
    where: { id: clubId }
  })

  if (club) {
    console.log('\n📊 Información del Club:')
    console.log(`   Nombre: ${club.name}`)
    console.log(`   Email: ${club.email}`)
    console.log(`   Estado: ${club.status}`)
    console.log(`   Slug: ${club.slug || 'No configurado'}`)

    if (!club.slug) {
      // Crear un slug si no existe
      const slug = 'test-isolation'
      await prisma.club.update({
        where: { id: clubId },
        data: { slug: slug }
      })
      console.log(`   ✅ Slug creado: ${slug}`)
    }
  }

  console.log('\n🚀 URLS de acceso:')
  console.log(`   Login: http://localhost:3002/login`)
  console.log(`   Dashboard: http://localhost:3002/c/${club?.slug || 'test-isolation'}/dashboard`)

  await prisma.$disconnect()
}

checkIsolationClubUsers().catch(console.error)