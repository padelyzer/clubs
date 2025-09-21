import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetClubSetup() {
  console.log('🔧 RESETEANDO CONFIGURACIÓN INICIAL DEL CLUB')
  console.log('============================================\n')

  const clubId = 'club-test-isolation-001'

  // 1. Resetear el flag de setup
  const updatedClub = await prisma.club.update({
    where: { id: clubId },
    data: {
      initialSetupCompleted: false,
      initialSetupCompletedAt: null
    }
  })

  console.log('✅ Club reseteado exitosamente:')
  console.log(`   Nombre: ${updatedClub.name}`)
  console.log(`   ID: ${updatedClub.id}`)
  console.log(`   Setup completado: ${updatedClub.initialSetupCompleted}`)

  // 2. Verificar que el SetupGuard debe activarse
  console.log('\n🧙 COMPORTAMIENTO ESPERADO:')
  console.log('============================')
  console.log('Al iniciar sesión, el sistema debería:')
  console.log('1. Detectar que initialSetupCompleted = false')
  console.log('2. Redirigir automáticamente a /c/club-test-isolation/setup')
  console.log('3. Mostrar el asistente de configuración inicial')

  console.log('\n📝 PASOS DEL SETUP WIZARD:')
  console.log('==========================')
  console.log('Paso 1: Información del club')
  console.log('Paso 2: Configuración de canchas')
  console.log('Paso 3: Horarios de operación')
  console.log('Paso 4: Métodos de pago')
  console.log('Paso 5: Precios y tarifas')

  console.log('\n🚀 PRUÉBALO AHORA:')
  console.log('==================')
  console.log('1. Ve a: http://localhost:3002/login')
  console.log('2. Inicia sesión con:')
  console.log('   Email: admin@isolation.com')
  console.log('   Contraseña: Test123!')
  console.log('3. Deberías ser redirigido automáticamente al Setup Wizard')

  console.log('\n💡 NOTA:')
  console.log('Si ya estás logueado, haz logout primero:')
  console.log('http://localhost:3002/api/auth/logout')

  await prisma.$disconnect()
}

resetClubSetup().catch(console.error)