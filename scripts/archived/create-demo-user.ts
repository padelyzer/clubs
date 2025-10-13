import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Verificar que el club demo existe
    const club = await prisma.club.findFirst({
      where: { slug: 'club-demo-padelyzer' }
    })

    if (!club) {
      console.error('❌ Club Demo Padelyzer no encontrado')
      return
    }

    console.log('✅ Club Demo Padelyzer encontrado:', club.id)

    // Crear usuario demo
    const hashedPassword = await bcrypt.hash('Demo2024!', 10)

    const user = await prisma.user.create({
      data: {
        id: 'demo-user-001',
        email: 'demo@padelyzer.com',
        name: 'Demo Padelyzer',
        password: hashedPassword,
        role: 'CLUB_OWNER',
        clubId: club.id,
        active: true,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('✅ Usuario demo creado exitosamente:')
    console.log('  - Email:', user.email)
    console.log('  - Password: Demo2024!')
    console.log('  - Role:', user.role)
    console.log('  - ClubId:', user.clubId)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()