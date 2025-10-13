import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Use direct URL for this check
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || "postgresql://postgres.espmqzfvgzuzpbpsgmpw:ClaudeCodeSuper2@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
    }
  }
})

async function directSupabaseCheck() {
  console.log('🔍 Conectando directamente a Supabase...\n')
  
  try {
    // 1. Check all users in Club Demo
    console.log('1️⃣ Usuarios en Club Demo Padelyzer:')
    const demoClub = await prisma.club.findFirst({
      where: { name: 'Club Demo Padelyzer' }
    })
    
    if (!demoClub) {
      console.log('❌ Club Demo Padelyzer no encontrado')
      return
    }
    
    const users = await prisma.user.findMany({
      where: { clubId: demoClub.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    console.log(`\nEncontrados ${users.length} usuarios:`)
    for (const user of users) {
      console.log('\n---')
      console.log(`Email: ${user.email}`)
      console.log(`Nombre: ${user.name}`)
      console.log(`Rol: ${user.role}`)
      console.log(`Activo: ${user.active}`)
      console.log(`Tiene password: ${user.password ? 'SÍ' : 'NO'}`)
      if (user.password) {
        console.log(`Hash format: ${user.password.substring(0, 7)}...`)
        console.log(`Hash length: ${user.password.length}`)
        
        // Test password
        const isValid = await bcrypt.compare('demo123', user.password)
        console.log(`✓ Password 'demo123' válido: ${isValid ? '✅ SÍ' : '❌ NO'}`)
        
        // Generate new hash for comparison
        const newHash = await bcrypt.hash('demo123', 10)
        console.log(`\n🔧 Nuevo hash generado: ${newHash.substring(0, 30)}...`)
        
        // Test with new hash
        const testNewHash = await bcrypt.compare('demo123', newHash)
        console.log(`✓ Test con nuevo hash: ${testNewHash ? '✅ SÍ' : '❌ NO'}`)
      }
      console.log(`Creado: ${user.createdAt}`)
      console.log(`Actualizado: ${user.updatedAt}`)
    }
    
    // 2. Test direct password update
    console.log('\n\n2️⃣ Actualizando password directamente...')
    const ownerEmail = 'owner@clubdemo.padelyzer.com'
    const newPassword = await bcrypt.hash('demo123', 10)
    
    const updated = await prisma.user.update({
      where: { email: ownerEmail },
      data: { 
        password: newPassword,
        updatedAt: new Date()
      }
    })
    
    console.log(`✅ Password actualizado para ${ownerEmail}`)
    console.log(`Nuevo hash: ${newPassword.substring(0, 30)}...`)
    
    // 3. Verify the update
    console.log('\n3️⃣ Verificando actualización...')
    const verifyUser = await prisma.user.findUnique({
      where: { email: ownerEmail }
    })
    
    if (verifyUser?.password) {
      const isValidNow = await bcrypt.compare('demo123', verifyUser.password)
      console.log(`✓ Password 'demo123' es válido ahora: ${isValidNow ? '✅ SÍ' : '❌ NO'}`)
    }
    
    // 4. Check login endpoint compatibility
    console.log('\n4️⃣ Simulando proceso de login...')
    console.log('El endpoint de login usa:')
    console.log('- bcryptjs para comparar')
    console.log('- user.password desde la base de datos')
    console.log('- bcrypt.compare(inputPassword, user.password)')
    
    console.log('\n✨ Verificación completa!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

directSupabaseCheck()