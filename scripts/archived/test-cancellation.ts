import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCancellation() {
  // Encontrar un estudiante no pagado
  const booking = await prisma.classBooking.findFirst({
    where: {
      paymentStatus: 'pending',
      attended: false
    },
    include: {
      Class: true
    }
  })
  
  if (!booking) {
    console.log('❌ No hay estudiantes elegibles para cancelar')
    return
  }
  
  console.log(`\nCancelando inscripción de: ${booking.studentName}`)
  console.log(`Clase: ${booking.Class.name}`)
  console.log(`Estado actual: Pendiente de pago, No asistido`)
  
  // Cancelar
  await prisma.classBooking.delete({
    where: { id: booking.id }
  })
  
  // Actualizar contador
  await prisma.class.update({
    where: { id: booking.classId },
    data: {
      currentStudents: {
        decrement: 1
      }
    }
  })
  
  console.log('✅ Inscripción cancelada exitosamente')
  
  // Verificar nueva capacidad
  const updatedClass = await prisma.class.findUnique({
    where: { id: booking.classId },
    include: {
      _count: {
        select: { Booking: true }
      }
    }
  })
  
  console.log(`Clase ahora tiene: ${updatedClass?._count.Booking}/${updatedClass?.maxStudents} estudiantes`)
}

testCancellation()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
