import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDuplicateBookings() {
  try {
    console.log('🔍 Buscando reservas de clase duplicadas o corruptas...')
    
    // Find all class bookings
    const classBookings = await prisma.booking.findMany({
      where: {
        type: 'CLASS',
        classId: { not: null }
      },
      include: {
        splitPayments: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    console.log(`📊 Total de reservas de clase encontradas: ${classBookings.length}`)
    
    // Group bookings by classId and date to find duplicates
    const bookingGroups = new Map<string, typeof classBookings>()
    
    classBookings.forEach(booking => {
      const key = `${booking.classId}-${booking.date.toISOString().split('T')[0]}-${booking.startTime}`
      const existing = bookingGroups.get(key) || []
      existing.push(booking)
      bookingGroups.set(key, existing)
    })
    
    // Find groups with duplicates
    const duplicateGroups = Array.from(bookingGroups.entries())
      .filter(([_, bookings]) => bookings.length > 1)
    
    if (duplicateGroups.length === 0) {
      console.log('✅ No se encontraron reservas duplicadas')
      return
    }
    
    console.log(`⚠️  Encontrados ${duplicateGroups.length} grupos con duplicados:`)
    
    for (const [key, bookings] of duplicateGroups) {
      console.log(`\n📍 Grupo: ${key}`)
      console.log(`   Reservas en este grupo: ${bookings.length}`)
      
      // Keep the first one (oldest), delete the rest
      const [toKeep, ...toDelete] = bookings
      
      console.log(`   ✅ Manteniendo: ${toKeep.id} (creada: ${toKeep.createdAt.toLocaleString()})`)
      console.log(`   🗑️  Eliminando ${toDelete.length} duplicados:`)
      
      for (const booking of toDelete) {
        console.log(`      - ${booking.id} (creada: ${booking.createdAt.toLocaleString()})`)
        
        // Delete split payments first
        if (booking.splitPayments.length > 0) {
          await prisma.splitPayment.deleteMany({
            where: { bookingId: booking.id }
          })
          console.log(`        Eliminados ${booking.splitPayments.length} pagos divididos`)
        }
        
        // Delete the booking
        await prisma.booking.delete({
          where: { id: booking.id }
        })
      }
    }
    
    // Also look for class enrollments without corresponding bookings
    console.log('\n🔍 Verificando inscripciones de clase huérfanas...')
    
    const classEnrollments = await prisma.classBooking.findMany({})
    
    console.log(`📊 Total de inscripciones encontradas: ${classEnrollments.length}`)
    
    // Check for classes without proper bookings
    const classes = await prisma.class.findMany({
      include: {
        bookings: true,
        _count: {
          select: {
            bookings: true,
            classBookings: true
          }
        }
      }
    })
    
    for (const cls of classes) {
      if (cls._count.classBookings > 0 && cls._count.bookings === 0) {
        console.log(`\n⚠️  Clase "${cls.name}" tiene inscripciones pero no tiene booking principal`)
        console.log(`   Creando booking principal para la clase...`)
        
        const booking = await prisma.booking.create({
          data: {
            clubId: cls.clubId,
            courtId: cls.courtId!,
            date: cls.date,
            startTime: cls.startTime,
            endTime: cls.endTime,
            duration: cls.duration,
            price: cls.price,
            currency: 'MXN',
            type: 'CLASS',
            status: 'CONFIRMED',
            paymentStatus: 'pending',
            playerName: `Clase: ${cls.name}`,
            playerEmail: 'clase@club.mx',
            playerPhone: '',
            classId: cls.id,
            notes: `Booking recreado para ${cls.name}`,
            splitPaymentEnabled: true,
            splitPaymentCount: 0
          }
        })
        
        console.log(`   ✅ Booking creado: ${booking.id}`)
      }
    }
    
    console.log('\n✨ Limpieza completada exitosamente')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupDuplicateBookings()
  .then(() => {
    console.log('\n🎉 Script de limpieza finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error)
    process.exit(1)
  })