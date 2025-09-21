import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cancelEnrollment() {
  // Buscar la inscripción de Fernanda
  const booking = await prisma.classBooking.findFirst({
    where: {
      studentName: 'Fernanda Morales',
      paymentStatus: 'pending'  // Solo cancelar si no ha pagado
    }
  })
  
  if (booking) {
    await prisma.classBooking.delete({
      where: { id: booking.id }
    })
    console.log('✅ Inscripción cancelada:', booking.studentName)
    
    // Verificar nueva capacidad
    const classItem = await prisma.class.findUnique({
      where: { id: booking.classId },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    })
    console.log(`   Clase ahora tiene: ${classItem?._count.bookings}/${classItem?.maxStudents} estudiantes`)
  } else {
    console.log('❌ No se encontró la inscripción')
  }
}

cancelEnrollment()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
