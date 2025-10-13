import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDemoUsers() {
  try {
    console.log('🔍 Verificando usuarios demo...\n')
    
    // Buscar usuario owner
    const ownerUser = await prisma.user.findUnique({
      where: { email: 'owner@clubdemo.padelyzer.com' },
      include: { Club: true }
    })
    
    if (ownerUser) {
      console.log('✅ Usuario OWNER encontrado:')
      console.log(`   ID: ${ownerUser.id}`)
      console.log(`   Email: ${ownerUser.email}`)
      console.log(`   Name: ${ownerUser.name}`)
      console.log(`   Role: ${ownerUser.role}`)
      console.log(`   Active: ${ownerUser.active}`)
      console.log(`   Email Verified: ${ownerUser.emailVerified}`)
      console.log(`   Has Password: ${ownerUser.password ? 'YES' : 'NO'}`)
      console.log(`   Club: ${ownerUser.Club?.name || 'NO CLUB'}`)
      console.log(`   ClubId: ${ownerUser.clubId}`)
    } else {
      console.log('❌ Usuario owner@clubdemo.padelyzer.com NO encontrado')
    }
    
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Buscar usuario staff
    const staffUser = await prisma.user.findUnique({
      where: { email: 'staff@clubdemo.padelyzer.com' },
      include: { Club: true }
    })
    
    if (staffUser) {
      console.log('✅ Usuario STAFF encontrado:')
      console.log(`   ID: ${staffUser.id}`)
      console.log(`   Email: ${staffUser.email}`)
      console.log(`   Name: ${staffUser.name}`)
      console.log(`   Role: ${staffUser.role}`)
      console.log(`   Active: ${staffUser.active}`)
      console.log(`   Email Verified: ${staffUser.emailVerified}`)
      console.log(`   Has Password: ${staffUser.password ? 'YES' : 'NO'}`)
      console.log(`   Club: ${staffUser.Club?.name || 'NO CLUB'}`)
    } else {
      console.log('❌ Usuario staff@clubdemo.padelyzer.com NO encontrado')
    }
    
    console.log('\n' + '='.repeat(50) + '\n')
    
    // Buscar todos los usuarios del Club Demo
    const clubDemoUsers = await prisma.user.findMany({
      where: {
        Club: {
          slug: 'club-demo-padelyzer'
        }
      },
      select: {
        email: true,
        role: true,
        active: true
      }
    })
    
    console.log(`📋 Usuarios del Club Demo Padelyzer: ${clubDemoUsers.length}`)
    clubDemoUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) ${user.active ? '✅' : '❌'}`)
    })
    
    // Verificar el club
    const club = await prisma.club.findUnique({
      where: { slug: 'club-demo-padelyzer' }
    })
    
    if (club) {
      console.log('\n✅ Club Demo Padelyzer:')
      console.log(`   ID: ${club.id}`)
      console.log(`   Name: ${club.name}`)
      console.log(`   Status: ${club.status}`)
      console.log(`   Active: ${club.active}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDemoUsers()