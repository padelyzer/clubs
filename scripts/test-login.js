const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  try {
    console.log('🔍 Verificando usuarios para login...')
    
    // Buscar usuario admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@padelyzer.com' },
      include: { club: true }
    })
    
    if (!adminUser) {
      console.log('❌ No se encontró el usuario admin')
      console.log('💡 Ejecuta: node scripts/create-test-user.js')
      return
    }
    
    console.log('✅ Usuario encontrado:')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Nombre: ${adminUser.name}`)
    console.log(`   Rol: ${adminUser.role}`)
    console.log(`   Club: ${adminUser.club?.name || 'Sin club'}`)
    console.log(`   Activo: ${adminUser.active ? 'Sí' : 'No'}`)
    
    // Verificar contraseña
    const passwordCorrect = await bcrypt.compare('admin123', adminUser.password)
    console.log(`\n🔐 Verificación de contraseña: ${passwordCorrect ? '✅ Correcta' : '❌ Incorrecta'}`)
    
    if (passwordCorrect) {
      console.log('\n✅ Login debería funcionar con:')
      console.log('   Email: admin@padelyzer.com')
      console.log('   Contraseña: admin123')
    }
    
    // Verificar usuario de club
    const clubUser = await prisma.user.findUnique({
      where: { email: 'club@padelyzer.com' },
      include: { club: true }
    })
    
    if (clubUser) {
      const clubPasswordCorrect = await bcrypt.compare('club123', clubUser.password)
      console.log('\n📊 Usuario de club:')
      console.log(`   Email: ${clubUser.email}`)
      console.log(`   Rol: ${clubUser.role}`)
      console.log(`   Club: ${clubUser.club?.name}`)
      console.log(`   Contraseña válida: ${clubPasswordCorrect ? '✅' : '❌'}`)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()