import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  const email = 'demo@padelyzer.com'
  const password = 'Demo2024!'

  console.log('Probando login con:')
  console.log('  - Email:', email)
  console.log('  - Password:', password)

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    console.log('❌ Usuario no encontrado')
    return
  }

  console.log('✅ Usuario encontrado:', user.email)

  // Verificar contraseña
  const passwordMatch = await bcrypt.compare(password, user.password)

  console.log('  - Hash almacenado:', user.password)
  console.log('  - Password match:', passwordMatch)

  if (passwordMatch) {
    console.log('✅ Login exitoso! La contraseña es correcta.')
  } else {
    console.log('❌ La contraseña NO coincide')

    // Generar un nuevo hash para comparación
    const newHash = await bcrypt.hash(password, 10)
    console.log('\nNuevo hash generado:', newHash)

    // Actualizar con el nuevo hash
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash }
    })

    console.log('✅ Password actualizado. Intenta nuevamente con:')
    console.log('  - Email:', email)
    console.log('  - Password:', password)
  }
}

testLogin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())