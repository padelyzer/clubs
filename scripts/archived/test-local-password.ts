import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
    }
  }
})

async function testLocalPassword() {
  console.log('🔐 Verificando contraseña en Supabase...\n')
  
  const email = 'owner@clubdemo.padelyzer.com'
  const testPassword = 'demo123'
  
  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        Club: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })
    
    if (!user) {
      console.log('❌ Usuario no encontrado')
      return
    }
    
    console.log('✅ Usuario encontrado:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.name}`)
    console.log(`   Rol: ${user.role}`)
    console.log(`   Club: ${user.Club?.name}`)
    console.log(`   Activo: ${user.active}`)
    console.log(`   Tiene password: ${user.password ? 'SÍ' : 'NO'}`)
    
    if (!user.password) {
      console.log('\n❌ El usuario no tiene contraseña')
      return
    }
    
    console.log(`\n🔍 Verificando contraseña...`)
    console.log(`   Hash almacenado: ${user.password.substring(0, 30)}...`)
    console.log(`   Hash length: ${user.password.length}`)
    
    // Test password with bcryptjs (same as login endpoint)
    const isValid = await bcrypt.compare(testPassword, user.password)
    console.log(`   ✓ Contraseña '${testPassword}' es válida: ${isValid ? '✅ SÍ' : '❌ NO'}`)
    
    if (!isValid) {
      // Generate new hash for updating
      console.log('\n🔧 Generando nuevo hash...')
      const newHash = await bcrypt.hash(testPassword, 10)
      console.log(`   Nuevo hash: ${newHash.substring(0, 30)}...`)
      
      // Update password
      await prisma.user.update({
        where: { email },
        data: { 
          password: newHash,
          updatedAt: new Date()
        }
      })
      
      console.log('   ✅ Contraseña actualizada')
      
      // Verify update
      const updatedUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (updatedUser?.password) {
        const isValidNow = await bcrypt.compare(testPassword, updatedUser.password)
        console.log(`   ✓ Verificación después de actualizar: ${isValidNow ? '✅ SÍ' : '❌ NO'}`)
      }
    }
    
    console.log('\n📝 Datos para login:')
    console.log(`   URL: https://tu-proyecto.vercel.app/login`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${testPassword}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLocalPassword()