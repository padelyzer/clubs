import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function validateClubStructure() {
  console.log('🔍 Iniciando validación de estructura de base de datos...\n')
  
  const testSlug = 'test-validation-' + Date.now()
  const clubId = uuidv4()
  const adminUserId = uuidv4()
  const settingsId = uuidv4()
  
  try {
    // 1. Validar creación de Club
    console.log('1️⃣ Validando creación de Club...')
    const club = await prisma.club.create({
      data: {
        id: clubId,
        name: 'Club Validación Test',
        slug: testSlug,
        email: `test${Date.now()}@club.com`,
        phone: '+52 555 999 8888',
        address: '',
        city: '',
        state: 'Puebla',
        country: 'México',
        postalCode: '',
        description: 'Club de prueba para validación',
        website: null,
        status: 'APPROVED',
        active: true,
        updatedAt: new Date()
      }
    })
    console.log('   ✅ Club creado exitosamente')
    
    // 2. Validar creación de Usuario Admin
    console.log('2️⃣ Validando creación de Usuario Admin...')
    const hashedPassword = await bcrypt.hash('test123', 10)
    const adminUser = await prisma.user.create({
      data: {
        id: adminUserId,
        email: `admin@${testSlug}.com`,
        name: 'Admin Test',
        password: hashedPassword,
        role: 'CLUB_OWNER',
        clubId: clubId,
        emailVerified: new Date(),
        active: true,
        updatedAt: new Date()
      }
    })
    console.log('   ✅ Usuario admin creado exitosamente')
    
    // 3. Validar creación de ClubSettings
    console.log('3️⃣ Validando creación de ClubSettings...')
    const settings = await prisma.clubSettings.create({
      data: {
        id: settingsId,
        clubId: clubId,
        slotDuration: 90,
        bufferTime: 15,
        advanceBookingDays: 30,
        allowSameDayBooking: true,
        currency: 'MXN',
        taxIncluded: true,
        taxRate: 16,
        cancellationFee: 0,
        noShowFee: 50,
        timezone: 'America/Mexico_City',
        operatingHours: {
          monday: { open: '07:00', close: '22:00', isOpen: true },
          tuesday: { open: '07:00', close: '22:00', isOpen: true },
          wednesday: { open: '07:00', close: '22:00', isOpen: true },
          thursday: { open: '07:00', close: '22:00', isOpen: true },
          friday: { open: '07:00', close: '22:00', isOpen: true },
          saturday: { open: '08:00', close: '20:00', isOpen: true },
          sunday: { open: '08:00', close: '20:00', isOpen: true }
        },
        updatedAt: new Date()
      }
    })
    console.log('   ✅ ClubSettings creado exitosamente')
    
    // 4. Validar relaciones
    console.log('4️⃣ Validando relaciones...')
    const clubWithRelations = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        User: true,
        ClubSettings: true,
        _count: {
          select: {
            User: true,
            Court: true,
            Booking: true
          }
        }
      }
    })
    
    if (!clubWithRelations) {
      throw new Error('No se pudo recuperar el club')
    }
    
    console.log('   ✅ Relaciones validadas:')
    console.log(`      - Usuarios: ${clubWithRelations._count.User}`)
    console.log(`      - Settings: ${clubWithRelations.ClubSettings ? 'Sí' : 'No'}`)
    console.log(`      - Canchas: ${clubWithRelations._count.Court}`)
    console.log(`      - Reservas: ${clubWithRelations._count.Booking}`)
    
    // 5. Validar operaciones comunes
    console.log('5️⃣ Validando operaciones comunes...')
    
    // Crear una cancha
    const courtId = uuidv4()
    const court = await prisma.court.create({
      data: {
        id: courtId,
        clubId: clubId,
        name: 'Cancha 1',
        type: 'PADEL',
        indoor: false,
        order: 1,
        active: true,
        updatedAt: new Date()
      }
    })
    console.log('   ✅ Cancha creada exitosamente')
    
    // 6. Limpiar datos de prueba
    console.log('6️⃣ Limpiando datos de prueba...')
    
    // Eliminar en orden para respetar las relaciones
    await prisma.court.delete({ where: { id: courtId } })
    await prisma.clubSettings.delete({ where: { id: settingsId } })
    await prisma.user.delete({ where: { id: adminUserId } })
    await prisma.club.delete({ where: { id: clubId } })
    
    console.log('   ✅ Datos de prueba eliminados')
    
    console.log('\n✅ ¡VALIDACIÓN COMPLETADA EXITOSAMENTE!')
    console.log('La estructura de la base de datos es correcta y no hay conflictos.')
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA VALIDACIÓN:')
    console.error(error)
    
    // Intentar limpiar si algo falló
    try {
      await prisma.club.delete({ where: { id: clubId } }).catch(() => {})
    } catch {}
    
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar validación
validateClubStructure()
  .then(() => {
    console.log('\n✨ Proceso finalizado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Proceso finalizado con errores')
    process.exit(1)
  })