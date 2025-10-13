import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
    }
  }
})

async function checkAllClubs() {
  console.log('🔍 Buscando todos los clubes en Supabase...\n')
  
  try {
    const clubs = await prisma.club.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        _count: {
          select: {
            User: true,
            Court: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`Total de clubes: ${clubs.length}\n`)
    
    for (const club of clubs) {
      console.log(`📍 ${club.name}`)
      console.log(`   ID: ${club.id}`)
      console.log(`   Slug: ${club.slug}`)
      console.log(`   Usuarios: ${club._count.User}`)
      console.log(`   Canchas: ${club._count.Court}`)
      console.log(`   Creado: ${club.createdAt}`)
      console.log('')
    }
    
    // Check all users
    console.log('\n👥 Todos los usuarios:')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clubId: true,
        active: true,
        password: true,
        Club: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\nTotal de usuarios: ${users.length}\n`)
    
    for (const user of users) {
      console.log(`👤 ${user.email}`)
      console.log(`   Nombre: ${user.name || 'Sin nombre'}`)
      console.log(`   Rol: ${user.role}`)
      console.log(`   Club: ${user.Club?.name || 'Sin club'}`)
      console.log(`   Activo: ${user.active}`)
      console.log(`   Tiene password: ${user.password ? 'SÍ' : 'NO'}`)
      console.log('')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllClubs()