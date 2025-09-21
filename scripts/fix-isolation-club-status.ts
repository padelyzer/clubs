import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixIsolationClubStatus() {
  console.log('🔧 VERIFICANDO Y CORRIGIENDO CLUB TEST AISLAMIENTO')
  console.log('=================================================\n')

  const clubId = 'club-test-isolation-001'

  // 1. Verificar el estado actual del club
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      _count: {
        select: {
          User: true,
          Court: true
        }
      }
    }
  })

  if (!club) {
    console.log('❌ No se encontró el club')
    return
  }

  console.log('📊 Estado actual del club:')
  console.log(`   Nombre: ${club.name}`)
  console.log(`   ID: ${club.id}`)
  console.log(`   Email: ${club.email}`)
  console.log(`   Status: ${club.status}`)
  console.log(`   Active: ${club.active}`)
  console.log(`   Slug: ${club.slug}`)
  console.log(`   Usuarios: ${club._count.User}`)
  console.log(`   Canchas: ${club._count.Court}`)

  // 2. Verificar problemas potenciales
  const issues = []

  if (club.status !== 'APPROVED') {
    issues.push(`Status no es APPROVED (actual: ${club.status})`)
  }

  if (!club.active) {
    issues.push('Club no está activo')
  }

  if (!club.slug) {
    issues.push('No tiene slug configurado')
  }

  if (issues.length > 0) {
    console.log('\n⚠️  Problemas encontrados:')
    issues.forEach(issue => console.log(`   - ${issue}`))

    console.log('\n🔧 Aplicando correcciones...')

    // 3. Corregir el club
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        status: 'APPROVED',
        active: true,
        slug: club.slug || 'test-isolation'
      }
    })

    console.log('\n✅ Club actualizado correctamente:')
    console.log(`   Status: ${updatedClub.status}`)
    console.log(`   Active: ${updatedClub.active}`)
    console.log(`   Slug: ${updatedClub.slug}`)
  } else {
    console.log('\n✅ El club está configurado correctamente')
  }

  // 4. Verificar usuario administrador
  console.log('\n👤 Verificando usuarios del club:')

  const users = await prisma.user.findMany({
    where: { clubId: clubId }
  })

  if (users.length > 0) {
    console.log(`   Se encontraron ${users.length} usuarios:`)
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Rol: ${user.role} - Activo: ${user.active}`)
    })

    // Activar todos los usuarios del club
    const inactiveUsers = users.filter(u => !u.active)
    if (inactiveUsers.length > 0) {
      console.log(`\n   🔧 Activando ${inactiveUsers.length} usuarios inactivos...`)

      await prisma.user.updateMany({
        where: {
          clubId: clubId,
          active: false
        },
        data: {
          active: true
        }
      })

      console.log('   ✅ Usuarios activados')
    }
  } else {
    console.log('   ❌ No hay usuarios en este club')
  }

  // 5. Verificar settings del club
  const settings = await prisma.clubSettings.findFirst({
    where: { clubId: clubId }
  })

  if (!settings) {
    console.log('\n⚠️  El club no tiene configuración (ClubSettings)')
    console.log('   Creando configuración predeterminada...')

    await prisma.clubSettings.create({
      data: {
        id: `settings_${clubId}`,
        clubId: clubId,
        timezone: 'America/Mexico_City',
        currency: 'MXN',
        language: 'es',
        emailNotifications: true,
        smsNotifications: false,
        whatsappNotifications: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('   ✅ Configuración creada')
  } else {
    console.log('\n✅ El club tiene configuración')
  }

  console.log('\n🎯 RESUMEN FINAL:')
  console.log('================')
  console.log('Estado del club: ✅ ACTIVO Y APROBADO')
  console.log(`URL de acceso: http://localhost:3002/c/${club.slug || 'test-isolation'}/dashboard`)
  console.log('\nCredenciales:')
  console.log('Email: admin@isolation.com')
  console.log('Contraseña: Test123!')

  await prisma.$disconnect()
}

fixIsolationClubStatus().catch(console.error)